import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useCurrentAccount, useCurrentWallet, useIotaClient, ConnectButton } from "@iota/dapp-kit";
import Header from "@/components/Header";
import RoleSelectionModal from "@/components/RoleSelectionModal";
import Dashboard from "@/components/Dashboard";
import { Shield, Network, Lock, Zap, Globe, Users, Award } from "lucide-react";
import { createContractService } from "@/lib/contract";

export default function Index() {
  const account = useCurrentAccount();
  const { connectionStatus } = useCurrentWallet();
  const client = useIotaClient();
  const { toast } = useToast();
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (account && !userRole) {
      setShowRoleModal(true);
    }
  }, [account, userRole]);

  const handleRoleSelection = (role: string) => {
    setUserRole(role);
    setShowRoleModal(false);
    toast({
      title: "Role Selected",
      description: `You are now operating as a ${role}`,
    });
  };

  if (connectionStatus === "connected" && account && userRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header />
        <Dashboard userRole={userRole} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-800/20 to-cyan-800/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full blur-xl opacity-30 animate-pulse" />
                <Shield className="relative h-20 w-20 text-purple-400" />
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                dSOC
              </span>
            </h1>

            <h2 className="text-2xl md:text-3xl font-semibold text-gray-300 mb-8">
              Decentralized SOC-as-a-Service
            </h2>

            <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              Revolutionary cybersecurity incident management powered by IOTA blockchain. 
              Secure, transparent, and incentivized threat analysis for the modern digital world.
            </p>

            <div className="mb-16">
              <ConnectButton 
                connectText="Connect Wallet & Enter dSOC"
                className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-semibold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-purple-400">Secure Reporting</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-center">
                Submit cybersecurity incidents with cryptographic proof and immutable evidence storage
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-cyan-500/30 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-cyan-400">Expert Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-center">
                Connect with verified cybersecurity analysts for professional incident assessment
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-green-500/30 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <Award className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-green-400">Token Rewards</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-center">
                Earn CLT tokens for quality analysis and successful incident resolution
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-orange-500/30 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-orange-400">Global Network</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-center">
                Join a worldwide network of cybersecurity professionals and organizations
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-400 mb-2">100%</div>
            <div className="text-gray-400">Transparent Process</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-cyan-400 mb-2">24/7</div>
            <div className="text-gray-400">Global Availability</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-400 mb-2">0</div>
            <div className="text-gray-400">Trusted Intermediaries</div>
          </div>
        </div>
      </div>

      {showRoleModal && (
        <RoleSelectionModal
          isOpen={showRoleModal}
          onClose={() => setShowRoleModal(false)}
          onRoleSelect={handleRoleSelection}
        />
      )}
    </div>
  );
}