import { prisma } from "../config/prisma";
import { NotFound } from "../utils/errors";

export class WalletService {
  /**
   * Get wallet balance for a user.
   * - Learner balance: $50 starting balance minus total spent.
   * - Creator balance: Total net amount earned from all their courses.
   */
  async getBalance(userId: string) {
    // Check if user exists and get role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      throw NotFound("User not found");
    }

    // Calculate Learner Balance (Student spending)
    // Find all payment sessions for this user
    const studentSessions = await prisma.paymentSession.findMany({
      where: { userId },
      select: { totalPaid: true },
    });
    
    const totalSpent = studentSessions.reduce((sum, session) => sum + Number(session.totalPaid), 0);
    const learnerBalance = Math.max(0, 50 - totalSpent); // Fake starting balance of $50

    // Calculate Creator Balance (Instructor earnings)
    let creatorBalance = 0;
    if (user.role === "INSTRUCTOR" || user.role === "ADMIN") {
      // Find all courses owned by this instructor
      const courses = await prisma.course.findMany({
        where: { instructorId: userId },
        select: { id: true },
      });
      const courseIds = courses.map((c) => c.id);

      // Find all transactions for these courses
      const transactions = await prisma.transaction.findMany({
        where: {
          session: {
            courseId: { in: courseIds }
          }
        },
        select: { netAmount: true },
      });

      creatorBalance = transactions.reduce((sum, tx) => sum + Number(tx.netAmount), 0);
    }

    return {
      learnerBalance,
      creatorBalance,
      currency: "USD"
    };
  }

  /**
   * Get transaction history for a user (both spending and earning).
   */
  async getTransactions(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      throw NotFound("User not found");
    }

    const txs: any[] = [];

    // 1. Spending transactions (as a Learner)
    const studentSessions = await prisma.paymentSession.findMany({
      where: { userId },
      include: {
        course: { select: { title: true } },
        transactions: true,
      },
    });

    for (const session of studentSessions) {
      for (const tx of session.transactions) {
        txs.push({
          id: tx.id,
          type: "DEBIT",
          amount: Number(tx.amount),
          description: `Streaming: ${session.course.title}`,
          createdAt: tx.createdAt,
        });
      }
    }

    // 2. Earning transactions (as a Creator)
    if (user.role === "INSTRUCTOR" || user.role === "ADMIN") {
      const courses = await prisma.course.findMany({
        where: { instructorId: userId },
        select: { id: true, title: true },
      });
      const courseIds = courses.map((c) => c.id);
      const courseMap = new Map(courses.map(c => [c.id, c.title]));

      const earningSessions = await prisma.paymentSession.findMany({
        where: { courseId: { in: courseIds } },
        include: { transactions: true },
      });

      for (const session of earningSessions) {
        for (const tx of session.transactions) {
          txs.push({
            id: `earn-${tx.id}`,
            type: "CREDIT",
            amount: Number(tx.netAmount),
            description: `Revenue: ${courseMap.get(session.courseId)}`,
            createdAt: tx.createdAt,
          });
        }
      }
    }

    // Add a fake initial deposit transaction for visual completeness
    txs.push({
      id: "fake-initial-deposit",
      type: "CREDIT",
      amount: 50.00,
      description: "Initial Grant",
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    });

    // Sort by descending date
    return txs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Get the user's wallet pointer URL.
   */
  async getWalletPointer(userId: string) {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      select: { walletAddress: true },
    });

    if (!wallet) {
      throw NotFound("Wallet not found");
    }

    return {
      pointerUrl: wallet.walletAddress
    };
  }
}

export const walletService = new WalletService();
