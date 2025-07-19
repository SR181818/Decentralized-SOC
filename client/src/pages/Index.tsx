import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/hooks/useWallet";
import Header from "@/components/Header";
import Dashboard from "@/components/Dashboard";
import { Shield, Network, Lock, Zap } from "lucide-react";

const Index = () => {
  const { isConnected, address, userRole, isContractVerified } = useWallet();

  const handleWalletConnect = () => {
    // This is now handled by the ConnectButton component
  };

  if (isConnected && address && userRole) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          walletAddress={address} 
          userRole={userRole} 
          onConnect={handleWalletConnect} 
        />
        <Dashboard 
          userRole={userRole} 
          walletAddress={address}
          isContractVerified={isContractVerified}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onConnect={handleWalletConnect} />
      
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8 mb-16">
          <div className="flex justify-center">
            <Shield className="h-20 w-20 text-primary pulse-glow" />
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-foreground">
              Welcome to <span className="text-primary">dSOC</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Decentralized Security Operations Center powered by IOTA Trust Framework
            </p>
          </div>
          
          <div className="flex justify-center">
            <Button 
              onClick={handleWalletConnect}
              variant="security"
              size="lg"
              className="text-lg px-8 py-6"
            >
              Connect IOTA Wallet to Start
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="security-card">
            <CardHeader className="text-center">
              <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle>IOTA Identity</CardTitle>
              <CardDescription>Role-based access control</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Secure identity verification for clients, analysts, and certifiers
              </p>
            </CardContent>
          </Card>

          <Card className="security-card">
            <CardHeader className="text-center">
              <Lock className="h-8 w-8 text-accent mx-auto mb-2" />
              <CardTitle>Notarization</CardTitle>
              <CardDescription>Document anchoring</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Immutable evidence storage with cryptographic proofs
              </p>
            </CardContent>
          </Card>

          <Card className="security-card">
            <CardHeader className="text-center">
              <Zap className="h-8 w-8 text-warning mx-auto mb-2" />
              <CardTitle>Gas Station</CardTitle>
              <CardDescription>Gasless transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Seamless user experience with sponsored transactions
              </p>
            </CardContent>
          </Card>

          <Card className="security-card">
            <CardHeader className="text-center">
              <Network className="h-8 w-8 text-success mx-auto mb-2" />
              <CardTitle>CLT Rewards</CardTitle>
              <CardDescription>Staking system</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Earn rewards for participation and quality contributions
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="security-card max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">How dSOC Works</CardTitle>
            <CardDescription>
              A decentralized approach to cybersecurity incident management
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <Badge variant="outline" className="text-primary border-primary">
                  Step 1
                </Badge>
                <h3 className="font-semibold">Submit Incident</h3>
                <p className="text-sm text-muted-foreground">
                  Clients report cybersecurity incidents with cryptographic evidence
                </p>
              </div>
              <div className="text-center space-y-2">
                <Badge variant="outline" className="text-accent border-accent">
                  Step 2
                </Badge>
                <h3 className="font-semibold">Analyze & Review</h3>
                <p className="text-sm text-muted-foreground">
                  Qualified analysts investigate and provide recommendations
                </p>
              </div>
              <div className="text-center space-y-2">
                <Badge variant="outline" className="text-success border-success">
                  Step 3
                </Badge>
                <h3 className="font-semibold">Certify & Resolve</h3>
                <p className="text-sm text-muted-foreground">
                  Certified professionals approve final solutions and close tickets
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
