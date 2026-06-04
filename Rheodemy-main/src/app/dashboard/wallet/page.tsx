"use client";

import { useState, useEffect } from 'react';
import { 
  Wallet, 
  ArrowDownRight, 
  ArrowUpRight, 
  Copy, 
  CheckCircle2, 
  CreditCard, 
  Building2,
  Clock,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
}

export default function WalletPage() {
  const { token, user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [role, setRole] = useState<'creator' | 'learner'>('learner');
  const [learnerBalance, setLearnerBalance] = useState<number | null>(null);
  const [creatorBalance, setCreatorBalance] = useState<number | null>(null);
  const [paymentPointer, setPaymentPointer] = useState<string>('$ilp.rheodemy.com/...');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Derive role from AuthContext user
    if (user?.role === 'CREATOR') setRole('creator');
    else setRole('learner');
  }, [user]);

  useEffect(() => {
    if (!token) return;
    const headers = { 'Authorization': `Bearer ${token}` };

    const fetchAll = async () => {
      try {
        const [balRes, txRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wallet/balance`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wallet/transactions`, { headers }),
        ]);
        if (balRes.ok) {
          const balData = await balRes.json();
          setLearnerBalance(balData.data?.learnerBalance ?? balData.learnerBalance ?? 0);
          setCreatorBalance(balData.data?.creatorBalance ?? balData.creatorBalance ?? 0);
        }
        if (txRes.ok) {
          const txData = await txRes.json();
          setTransactions(txData.data || []);
        }
        // Pointer only for creators
        if (role === 'creator') {
          const ptrRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wallet/pointer`, { headers });
          if (ptrRes.ok) {
            const ptrData = await ptrRes.json();
            setPaymentPointer(ptrData.data?.pointerUrl || ptrData.pointerUrl || paymentPointer);
          }
        }
      } catch (err) {
        console.error('[WalletPage] Failed to fetch wallet data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, [token, role]);

  const handleCopy = () => {
    navigator.clipboard.writeText(paymentPointer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Wallet & Payments</h1>
        <p className="text-muted mt-2 text-sm max-w-2xl leading-relaxed">
          Manage your learning budget and creator earnings in one place. Powered by the Interledger Protocol for real-time streaming payments.
        </p>
      </div>

      {/* Dual Balances Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Learner Balance Card - Added glow and pulsing dot */}
        <div className="p-8 rounded-2xl border border-primary/20 bg-primary/[0.02] flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 transform group-hover:scale-110 transition-transform duration-500">
            <div className="w-32 h-32 bg-primary/20 rounded-full blur-3xl absolute" />
            <Wallet className="w-32 h-32 text-primary relative z-10" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-muted mb-4">
              <div className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(0,212,200,0.8)] animate-pulse" />
              <span className="text-xs uppercase tracking-wider font-semibold">Learner Balance</span>
            </div>
            <p className="text-5xl font-mono font-light tracking-tight text-foreground">
              {isLoading ? <span className="animate-pulse text-muted">...</span> : `$${(learnerBalance ?? 0).toFixed(2)}`}
            </p>
            <p className="text-sm text-muted mt-2">Available to spend on courses</p>
          </div>
          <div className="relative z-10 mt-8">
            <Link href="/coming-soon" className="w-full sm:w-auto bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity inline-flex">
              <ArrowDownRight className="w-5 h-5" />
              Top Up Balance
            </Link>
          </div>
        </div>

        {/* Creator Earnings Card - Role Dependant */}
        {role === 'creator' ? (
          <div className="p-8 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] hover:border-white/10 transition-all flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 transform group-hover:scale-110 transition-transform duration-500">
              <Building2 className="w-32 h-32 text-foreground" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-muted mb-4">
                <div className="w-1.5 h-1.5 bg-white/20 rounded-full" />
                <span className="text-xs uppercase tracking-wider font-semibold">Creator Earnings</span>
              </div>
              <p className="text-5xl font-mono font-light tracking-tight text-foreground">
                {isLoading ? <span className="animate-pulse text-muted">...</span> : `$${(creatorBalance ?? 0).toFixed(2)}`}
              </p>
              <p className="text-sm text-muted mt-2">Earned from teaching</p>
            </div>
            <div className="relative z-10 mt-8 flex flex-col sm:flex-row gap-4">
              <Link href="/coming-soon" className="w-full sm:w-auto bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                <Download className="w-5 h-5" /> Withdraw to Bank
              </Link>
              <Link href="/coming-soon" className="w-full sm:w-auto bg-foreground text-background px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                <Upload className="w-5 h-5" /> Deposit Funds
              </Link>
              <Link href="/coming-soon" className="w-full sm:w-auto border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] text-foreground px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors">
                <RefreshCw className="w-5 h-5" /> Swap ILP / USD
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.01] flex flex-col justify-center items-center text-center relative overflow-hidden group hover:border-primary/30 transition-colors">
            <Building2 className="w-12 h-12 text-muted mb-4 opacity-50 group-hover:text-primary transition-colors" />
            <h3 className="text-2xl font-semibold text-foreground mb-2">Not a Creator Yet</h3>
            <p className="text-sm text-muted max-w-sm mb-8 leading-relaxed">
              Turn your knowledge into streams of income. Start uploading courses and earn in real-time as people learn.
            </p>
            <Link href="/become-creator" className="bg-white text-black px-8 py-3.5 rounded-full font-bold hover:bg-primary hover:text-black hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(0,212,200,0.3)]">
               Become a Creator
            </Link>
          </div>
        )}

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Interledger Payment Pointer */}
        <div className="lg:col-span-1 space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-lg font-medium text-foreground">Receiving Wallet (ILP)</h2>
          </div>
          
          <div className="p-6 rounded-2xl border border-white/10 bg-card/50 space-y-4">
            <p className="text-sm text-muted">
              Your Interledger Payment Pointer (ILP) is used to receive real-time streams of money from your students while they watch your courses.
            </p>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted uppercase tracking-wider">Your Payment Pointer</label>
              <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-white/5">
                <span className="font-mono text-sm text-primary truncate mr-4">
                  {paymentPointer}
                </span>
                <button 
                  onClick={handleCopy}
                  className="text-muted hover:text-foreground transition-colors p-2 rounded-md hover:bg-white/5"
                  title="Copy to clipboard"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-white/5">
              <Link href="/coming-soon" className="text-sm text-primary hover:underline flex items-center gap-1 inline-flex">
                Link external wallet (Uphold/Gatehub)
              </Link>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border-b border-white/10 pb-4 flex justify-between items-center">
            <h2 className="text-lg font-medium text-foreground">Recent Transactions</h2>
            <Link href="/coming-soon" className="text-sm text-muted hover:text-foreground">View all</Link>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5" />
                    <div className="space-y-2">
                      <div className="h-3 bg-white/5 rounded w-40" />
                      <div className="h-2 bg-white/5 rounded w-24" />
                    </div>
                  </div>
                  <div className="h-4 bg-white/5 rounded w-16" />
                </div>
              ))
            ) : transactions.length === 0 ? (
              <div className="py-10 text-center text-muted text-sm">No transactions yet.</div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === 'CREDIT' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {tx.type === 'CREDIT' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{tx.description}</p>
                      <p className="text-xs text-muted mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(tx.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-mono font-medium ${
                      tx.type === 'CREDIT' ? 'text-green-500' : 'text-foreground'
                    }`}>
                      {tx.type === 'CREDIT' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted mt-0.5">{new Date(tx.createdAt).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
