
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from "@/hooks/use-toast";
import { useCurrentAccount, useIotaClient, useSignTransaction } from "@iota/dapp-kit";
import { createContractService } from "@/lib/contract";
import { supabaseService, DbUser, DbTransaction } from "@/lib/supabase";
import { 
  Coins, 
  TrendingUp, 
  Award, 
  ArrowUpCircle, 
  ArrowDownCircle,
  History,
  Wallet,
  Star,
  Target
} from "lucide-react";

export default function StakingRewards() {
  const [userStats, setUserStats] = useState<DbUser | null>(null);
  const [transactions, setTransactions] = useState<DbTransaction[]>([]);
  const [stakeAmount, setStakeAmount] = useState("100");
  const [isLoading, setIsLoading] = useState(true);
  const [isStaking, setIsStaking] = useState(false);

  const account = useCurrentAccount();
  const client = useIotaClient();
  const { mutate: signTransaction } = useSignTransaction();
  const { toast } = useToast();

  useEffect(() => {
    if (account) {
      loadUserData();
    }
  }, [account]);

  const loadUserData = async () => {
    if (!account) return;

    try {
      // Load user stats
      const user = await supabaseService.getUserByAddress(account.address);
      setUserStats(user);

      // Load transactions
      const userTransactions = await supabaseService.getTransactionsByUser(account.address);
      setTransactions(userTransactions);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStakeTokens = async () => {
    if (!account || !stakeAmount) return;

    try {
      setIsStaking(true);
      const contractService = createContractService(client);
      
      // Create stake transaction (this would call a staking function in the contract)
      const transaction = await contractService.createStakeToken(parseInt(stakeAmount));

      signTransaction(
        { transaction },
        {
          onSuccess: async (result) => {
            try {
              // Update user balance
              const updatedBalance = (userStats?.stake_balance || 0) + parseInt(stakeAmount);
              await supabaseService.upsertUser({
                wallet_address: account.address,
                role: userStats?.role || 'client',
                clt_balance: userStats?.clt_balance || 0,
                stake_balance: updatedBalance
              });

              // Record transaction
              await supabaseService.createTransaction({
                ticket_id: 0,
                from_address: account.address,
                transaction_hash: result.digest,
                transaction_type: 'STAKE',
                amount: parseInt(stakeAmount),
                status: 'completed'
              });

              toast({
                title: "Success!",
                description: `Staked ${stakeAmount} IOTA tokens successfully`,
              });

              setStakeAmount("100");
              loadUserData();
            } catch (error) {
              console.error('Database error:', error);
              toast({
                title: "Warning",
                description: "Tokens staked but failed to update database",
                variant: "destructive",
              });
            }
          },
          onError: (error) => {
            console.error('Staking failed:', error);
            toast({
              title: "Error",
              description: "Failed to stake tokens",
              variant: "destructive",
            });
          },
        }
      );
    } catch (error) {
      console.error('Error staking tokens:', error);
      toast({
        title: "Error",
        description: "Failed to create stake transaction",
        variant: "destructive",
      });
    } finally {
      setIsStaking(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'STAKE': return <ArrowUpCircle className="h-4 w-4 text-green-400" />;
      case 'REWARD': return <Award className="h-4 w-4 text-yellow-400" />;
      case 'CREATE_TICKET': return <ArrowDownCircle className="h-4 w-4 text-blue-400" />;
      default: return <Coins className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'STAKE': return 'text-green-400';
      case 'REWARD': return 'text-yellow-400';
      case 'CREATE_TICKET': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading staking data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-500/30 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-400 text-sm font-medium">CLT Balance</p>
                <p className="text-3xl font-bold text-white">{userStats?.clt_balance || 0}</p>
                <p className="text-purple-300 text-xs">Reward Tokens</p>
              </div>
              <Award className="h-12 w-12 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-900/50 to-cyan-800/30 border-cyan-500/30 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-400 text-sm font-medium">Staked IOTA</p>
                <p className="text-3xl font-bold text-white">{userStats?.stake_balance || 0}</p>
                <p className="text-cyan-300 text-xs">Active Stakes</p>
              </div>
              <Coins className="h-12 w-12 text-cyan-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-500/30 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-400 text-sm font-medium">Total Earned</p>
                <p className="text-3xl font-bold text-white">{userStats?.clt_balance || 0}</p>
                <p className="text-green-300 text-xs">Lifetime Rewards</p>
              </div>
              <TrendingUp className="h-12 w-12 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staking Interface */}
      <Card className="bg-slate-800/50 border-yellow-500/30 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-yellow-400">Stake IOTA Tokens</CardTitle>
              <CardDescription className="text-gray-400">
                Stake IOTA tokens to participate in the dSOC ecosystem and earn rewards
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Star className="h-5 w-5 text-yellow-400 mt-0.5" />
              <div>
                <h4 className="text-yellow-400 font-semibold mb-1">Staking Benefits</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Submit security incident tickets</li>
                  <li>• Participate in the analysis marketplace</li>
                  <li>• Earn CLT rewards for quality contributions</li>
                  <li>• Higher stakes unlock premium features</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="stake" className="text-gray-300 flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-yellow-400" />
                  Stake Amount (IOTA)
                </Label>
                <Input
                  id="stake"
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  min="1"
                  className="bg-slate-700/50 border-gray-600 text-white focus:border-yellow-400"
                  placeholder="Enter amount to stake"
                />
              </div>

              <Button
                onClick={handleStakeTokens}
                disabled={!stakeAmount || isStaking}
                className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white font-semibold py-3"
              >
                {isStaking ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Staking Tokens...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <ArrowUpCircle className="h-4 w-4" />
                    Stake {stakeAmount} IOTA
                  </div>
                )}
              </Button>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-4">
              <h4 className="text-gray-300 font-medium mb-3">Staking Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Current Balance:</span>
                  <span className="text-white">{userStats?.stake_balance || 0} IOTA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">New Stake:</span>
                  <span className="text-yellow-400">+{stakeAmount || 0} IOTA</span>
                </div>
                <hr className="border-gray-600" />
                <div className="flex justify-between font-medium">
                  <span className="text-gray-300">Total After:</span>
                  <span className="text-white">{(userStats?.stake_balance || 0) + parseInt(stakeAmount || "0")} IOTA</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className="bg-slate-800/50 border-gray-600/30 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg">
                <History className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-gray-300">Transaction History</CardTitle>
                <CardDescription className="text-gray-400">
                  Your recent staking and reward transactions
                </CardDescription>
              </div>
            </div>
            <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
              {transactions.length} transactions
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.slice(0, 10).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(tx.transaction_type)}
                    <div>
                      <p className="text-white text-sm font-medium">
                        {tx.transaction_type.replace('_', ' ')}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {new Date(tx.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${getTransactionColor(tx.transaction_type)}`}>
                      {tx.transaction_type === 'CREATE_TICKET' ? '-' : '+'}{tx.amount || 0} 
                      {tx.transaction_type === 'REWARD' ? ' CLT' : ' IOTA'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {tx.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">No transactions yet</h3>
              <p className="text-gray-400">Start staking to see your transaction history here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
