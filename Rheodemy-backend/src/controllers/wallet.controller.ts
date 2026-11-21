import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { walletService } from "../services/wallet.service";
import { sendSuccess } from "../utils/response";
import { BadRequest } from "../utils/errors";
import { SocketService } from "../socket/index";

const topUpSchema = z.object({
  amount: z.number().positive("amount must be positive"),
  provider: z.string().min(1).optional(),
  currency: z.string().min(3).max(3).optional(),
});

const webhookSchema = z.object({
  reference: z.string().min(1, "reference is required"),
  providerRef: z.string().optional(),
});

export class WalletController {
  async getBalance(req: Request, res: Response, next: NextFunction) {
    try {
      const balance = await walletService.getBalance(req.user!.userId);
      sendSuccess(res, balance, "Wallet balance retrieved");
    } catch (error) {
      next(error);
    }
  }

  async getTransactions(req: Request, res: Response, next: NextFunction) {
    try {
      const transactions = await walletService.getTransactions(req.user!.userId);
      sendSuccess(res, transactions, "Transactions retrieved");
    } catch (error) {
      next(error);
    }
  }

  async getPointer(req: Request, res: Response, next: NextFunction) {
    try {
      const pointer = await walletService.getWalletPointer(req.user!.userId);
      sendSuccess(res, pointer, "Wallet pointer retrieved");
    } catch (error) {
      next(error);
    }
  }

  async createTopUp(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = topUpSchema.safeParse(req.body);
      if (!parsed.success) {
        throw BadRequest(
          Object.values(parsed.error.flatten().fieldErrors).flat().join(", ")
        );
      }
      const topUp = await walletService.createTopUp(
        req.user!.userId,
        parsed.data
      );
      sendSuccess(res, topUp, "Top-up created", 201);
    } catch (error) {
      next(error);
    }
  }

  async getTopUpStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const topUp = await walletService.getTopUpStatus(
        userId,
        req.params.reference
      );
      if (topUp.status === "COMPLETED") {
        const balance = await walletService.getBalance(userId);
        SocketService.emitWalletUpdated(userId, balance);
      }
      sendSuccess(res, topUp, "Top-up status retrieved");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Provider webhook seam. Real gateways must verify signatures here before
   * calling the service; the simulated rail confirms by polling instead.
   */
  async webhook(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = webhookSchema.safeParse(req.body);
      if (!parsed.success) {
        throw BadRequest(
          Object.values(parsed.error.flatten().fieldErrors).flat().join(", ")
        );
      }
      const result = await walletService.confirmTopUp(
        parsed.data.reference,
        parsed.data.providerRef
      );
      const balance = await walletService.getBalance(result.userId);
      SocketService.emitWalletUpdated(result.userId, balance);
      sendSuccess(res, result, "Top-up confirmed");
    } catch (error) {
      next(error);
    }
  }
}

export const walletController = new WalletController();
