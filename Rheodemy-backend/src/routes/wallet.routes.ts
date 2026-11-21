import { Router } from "express";
import { walletController } from "../controllers/wallet.controller";
import { authenticate } from "../middleware/authenticate";

const router = Router();

router.use(authenticate);

router.get("/balance", (req, res, next) => walletController.getBalance(req, res, next));
router.get("/transactions", (req, res, next) => walletController.getTransactions(req, res, next));
router.get("/pointer", (req, res, next) => walletController.getPointer(req, res, next));

// Top-ups
router.post("/topup", (req, res, next) => walletController.createTopUp(req, res, next));
router.get("/topup/:reference", (req, res, next) => walletController.getTopUpStatus(req, res, next));
router.post("/webhook", (req, res, next) => walletController.webhook(req, res, next));

export default router;
