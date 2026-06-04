import { Request, Response, NextFunction } from "express";
import { walletService } from "../services/wallet.service";
import { sendSuccess } from "../utils/response";

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
}

export const walletController = new WalletController();
