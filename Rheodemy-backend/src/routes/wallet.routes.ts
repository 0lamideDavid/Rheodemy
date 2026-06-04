import { Router } from "express";
import { walletController } from "../controllers/wallet.controller";
import { authenticate } from "../middleware/authenticate";

const router = Router();

router.use(authenticate);

router.get("/balance", (req, res, next) => walletController.getBalance(req, res, next));
router.get("/transactions", (req, res, next) => walletController.getTransactions(req, res, next));
router.get("/pointer", (req, res, next) => walletController.getPointer(req, res, next));

export default router;
