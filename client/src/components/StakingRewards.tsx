import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useCurrentAccount, useIotaClient, useSignTransaction } from "@iota/dapp-kit";
import { Coins, TrendingUp, Gift, Lock, Unlock } from "lucide-react";
import { createContractService } from "@/lib/contract";

interface StakingRewardsProps {
  userRole: string;
  walletAddress: string;
}

const StakingRewards = ({ userRole, walletAddress }: StakingRewardsProps) => {
  const [stakeAmount, setStakeAmount] = useState("");
  const [isStaking, setIsStaking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const { toast } = useToast();
  const currentAccount = useCurrentAccount();
  const client = useIotaClient();
  const { mutate: signTransaction } = useSignTransaction();

  // Mock staking data
  const stakingData = {
    client: {
      balance: "1,250.5",
      staked: "150.0",
      pendingRewards: "12.5",
      apr: "8.5%",
      nextReward: "24 hours"
    },
    analyst: {
      balance: "2,850.0",
      staked: "320.0",
      pendingRewards: "28.7",
      apr: "12.0%",
      nextReward: "18 hours"
    },
    certifier: {
      balance: "5,100.0",
      staked: "500.0",
      pendingRewards: "45.2",
      apr: "15.0%",
      nextReward: "6 hours"
    }
  };

  const currentData = stakingData[userRole as keyof typeof stakingData];

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid staking amount",
        variant: "destructive",
      });
      return;
    }

    if (!currentAccount) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    setIsStaking(true);
    try {
      const contractService = createContractService(client);
      const amount = Math.floor(parseFloat(stakeAmount) * 1000000000); // Convert to nanIOTA
      
      // Create stake token transaction
      const stakeTransaction = await contractService.createStake(amount, currentAccount.address);
      
      // For demo purposes, we'll simulate the transaction
      // In a real implementation, you would sign and execute the transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Staking Successful",
        description: `${stakeAmount} IOTA tokens staked successfully`,
      });
      
      setStakeAmount("");
    } catch (error) {
      console.error("Staking error:", error);
      toast({
        title: "Staking Failed",
        description: "Failed to stake tokens on blockchain",
        variant: "destructive",
      });
    } finally {
      setIsStaking(false);
    }
  };

  const handleClaimRewards = async () => {
    if (!currentAccount) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    setIsClaiming(true);
    try {
      // In a real implementation, this would query the contract for CLT tokens
      // and merge them or claim rewards based on ticket participation
      const contractService = createContractService(client);
      
      // Simulate CLT reward claiming
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "CLT Rewards Claimed",
        description: `${currentData.pendingRewards} CLT tokens claimed successfully`,
      });
    } catch (error) {
      console.error("Claim error:", error);
      toast({
        title: "Claim Failed",
        description: "Failed to claim rewards from blockchain",
        variant: "destructive",
      });
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-foreground">Staking & Rewards</h3>
          <p className="text-muted-foreground">
            Earn rewards by staking IOTA tokens and participating in the dSOC ecosystem
          </p>
        </div>
        <Badge variant="outline" className="text-success border-success">
          APR: {currentData.apr}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Wallet Balance */}
        <Card className="security-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Wallet Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{currentData.balance}</div>
            <p className="text-xs text-muted-foreground">IOTA Tokens</p>
          </CardContent>
        </Card>

        {/* Staked Amount */}
        <Card className="security-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Staked Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{currentData.staked}</div>
            <p className="text-xs text-muted-foreground">IOTA Tokens</p>
          </CardContent>
        </Card>

        {/* Pending Rewards */}
        <Card className="security-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Rewards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{currentData.pendingRewards}</div>
            <p className="text-xs text-muted-foreground">IOTA Tokens</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Staking Section */}
        <Card className="security-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Stake Tokens
            </CardTitle>
            <CardDescription>
              Stake your IOTA tokens to earn rewards and participate in governance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stake-amount">Amount to Stake</Label>
              <Input
                id="stake-amount"
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder="Enter amount"
                min="0"
                step="0.1"
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Current APR:</span>
              <span className="font-semibold text-success">{currentData.apr}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Role Multiplier:</span>
              <Badge variant="outline" className="text-accent border-accent">
                {userRole === "client" ? "1.0x" : userRole === "analyst" ? "1.5x" : "2.0x"}
              </Badge>
            </div>
            <Button
              onClick={handleStake}
              disabled={isStaking || !stakeAmount}
              variant="security"
              className="w-full"
            >
              {isStaking ? (
                <>
                  <Lock className="h-4 w-4 mr-2 animate-spin" />
                  Staking...
                </>
              ) : (
                <>
                  <Coins className="h-4 w-4 mr-2" />
                  Stake Tokens
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Rewards Section */}
        <Card className="security-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Claim Rewards
            </CardTitle>
            <CardDescription>
              Claim your staking rewards and bonuses for quality contributions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Base Staking Rewards:</span>
                <span className="font-semibold">{(parseFloat(currentData.pendingRewards) * 0.7).toFixed(1)} IOTA</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Quality Bonus:</span>
                <span className="font-semibold text-success">{(parseFloat(currentData.pendingRewards) * 0.3).toFixed(1)} IOTA</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-sm font-medium">Total Rewards:</span>
                <span className="font-bold text-accent">{currentData.pendingRewards} IOTA</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Next Reward:</span>
              <span className="font-semibold text-primary">{currentData.nextReward}</span>
            </div>
            <Button
              onClick={handleClaimRewards}
              disabled={isClaiming || parseFloat(currentData.pendingRewards) === 0}
              variant="success"
              className="w-full"
            >
              {isClaiming ? (
                <>
                  <TrendingUp className="h-4 w-4 mr-2 animate-spin" />
                  Claiming...
                </>
              ) : (
                <>
                  <Gift className="h-4 w-4 mr-2" />
                  Claim Rewards
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Staking Stats */}
      <Card className="security-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Staking Performance
          </CardTitle>
          <CardDescription>
            Your staking history and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/20 rounded-lg">
              <div className="text-2xl font-bold text-foreground">47</div>
              <div className="text-sm text-muted-foreground">Days Staked</div>
            </div>
            <div className="text-center p-4 bg-muted/20 rounded-lg">
              <div className="text-2xl font-bold text-success">156.8</div>
              <div className="text-sm text-muted-foreground">Total Earned</div>
            </div>
            <div className="text-center p-4 bg-muted/20 rounded-lg">
              <div className="text-2xl font-bold text-primary">92%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
            <div className="text-center p-4 bg-muted/20 rounded-lg">
              <div className="text-2xl font-bold text-accent">A+</div>
              <div className="text-sm text-muted-foreground">Quality Score</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StakingRewards;