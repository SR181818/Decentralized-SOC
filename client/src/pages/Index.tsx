
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useCurrentAccount, useCurrentWallet, useIotaClient, ConnectButton } from "@iota/dapp-kit";
import Header from "@/components/Header";
import RoleSelectionModal from "@/components/RoleSelectionModal";
import Dashboard from "@/components/Dashboard";
import { 
  Shield, 
  Network, 
  Lock, 
  Zap, 
  Globe, 
  Users, 
  Award, 
  AlertTriangle,
  Database,
  Cpu,
  Eye,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Target,
  Layers,
  BarChart3,
  Coins,
  Clock
} from "lucide-react";
import { createContractService } from "@/lib/contract";

export default function Index() {
  const account = useCurrentAccount();
  const { connectionStatus } = useCurrentWallet();
  const client = useIotaClient();
  const { toast } = useToast();
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("problem");

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

  // Show dashboard when wallet is connected and role is selected
  if (account && userRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header 
          walletAddress={account.address}
          userRole={userRole}
          onConnect={() => {}}
        />
        <Dashboard userRole={userRole} />
      </div>
    );
  }

  const navigationSections = [
    { id: "problem", label: "Problem Statement", icon: AlertTriangle },
    { id: "solution", label: "Solution Overview", icon: Shield },
    { id: "impact", label: "Real-World Impact", icon: Target },
    { id: "architecture", label: "System Architecture", icon: Layers },
    { id: "features", label: "Key Features & Demo", icon: Cpu },
    { id: "future", label: "Next Steps", icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header 
        walletAddress={account?.address}
        userRole={userRole}
        onConnect={() => {}}
      />

      {/* Navigation Pills */}
      <div className="sticky top-16 z-40 bg-slate-900/90 backdrop-blur-sm border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto py-4 space-x-4">
            {navigationSections.map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant={activeSection === id ? "default" : "ghost"}
                className={`whitespace-nowrap flex items-center gap-2 ${
                  activeSection === id 
                    ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white" 
                    : "text-gray-300 hover:text-white"
                }`}
                onClick={() => setActiveSection(id)}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-800/20 to-cyan-800/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full blur-xl opacity-30 animate-pulse" />
                <Shield className="relative h-16 w-16 text-purple-400" />
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                dSOC Platform
              </span>
            </h1>

            <h2 className="text-xl md:text-2xl font-semibold text-gray-300 mb-6">
              Decentralized SOC-as-a-Service on IOTA
            </h2>

            <div className="mb-8">
              <ConnectButton 
                connectText="Connect Wallet & Enter Platform"
                className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        
        {/* Problem Statement */}
        {activeSection === "problem" && (
          <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                <AlertTriangle className="h-8 w-8 text-red-400" />
                Problem Statement
              </h2>
              <p className="text-xl text-gray-300 max-w-4xl mx-auto">
                <strong>Tracking & Monitoring Challenge:</strong> Decentralized Cybersecurity Incident Management
              </p>
            </div>

            <Card className="bg-slate-800/50 border-red-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-red-400 text-xl">The Challenge We're Solving</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Current Problems in Cybersecurity</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                        Centralized SOCs create single points of failure
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                        High costs limit access to quality security analysis
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                        Lack of transparency in incident handling
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                        Insufficient incentives for quality analysis
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Why This Matters</h3>
                    <p className="text-gray-300 leading-relaxed">
                      With cyber attacks increasing by 38% annually and damages expected to reach $10.5 trillion by 2025, 
                      we need a more resilient, accessible, and transparent approach to cybersecurity incident management.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Solution Overview */}
        {activeSection === "solution" && (
          <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                <Shield className="h-8 w-8 text-blue-400" />
                Solution Overview
              </h2>
              <p className="text-xl text-gray-300 max-w-4xl mx-auto">
                A decentralized platform for cybersecurity incident reporting, analysis, and resolution powered by IOTA blockchain
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-slate-800/50 border-blue-500/30 backdrop-blur-sm">
                <CardHeader>
                  <Users className="h-8 w-8 text-blue-400 mb-2" />
                  <CardTitle className="text-blue-400">Multi-Role Ecosystem</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li><strong>Clients:</strong> Submit security incidents</li>
                    <li><strong>Analysts:</strong> Provide expert analysis</li>
                    <li><strong>Certifiers:</strong> Validate reports</li>
                    <li><strong>Observers:</strong> Monitor system health</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm">
                <CardHeader>
                  <Coins className="h-8 w-8 text-purple-400 mb-2" />
                  <CardTitle className="text-purple-400">Token Incentives</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li><strong>CLT Rewards:</strong> Quality analysis incentives</li>
                    <li><strong>Staking:</strong> Ensure commitment</li>
                    <li><strong>Reputation:</strong> Build trust scores</li>
                    <li><strong>Governance:</strong> Community-driven decisions</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-green-500/30 backdrop-blur-sm">
                <CardHeader>
                  <Database className="h-8 w-8 text-green-400 mb-2" />
                  <CardTitle className="text-green-400">Secure Storage</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li><strong>Immutable Records:</strong> Blockchain-based</li>
                    <li><strong>Identity Verification:</strong> IOTA Identity</li>
                    <li><strong>Evidence Notarization:</strong> Tamper-proof</li>
                    <li><strong>Privacy Protection:</strong> Zero-knowledge proofs</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-r from-slate-800/50 to-purple-800/30 border-purple-500/30 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-4">How It Works</h3>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">1</span>
                      </div>
                      <p className="text-sm text-gray-300 text-center">Submit Incident</p>
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">2</span>
                      </div>
                      <p className="text-sm text-gray-300 text-center">Analyst Review</p>
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">3</span>
                      </div>
                      <p className="text-sm text-gray-300 text-center">Certifier Validation</p>
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">4</span>
                      </div>
                      <p className="text-sm text-gray-300 text-center">Token Rewards</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Real-World Impact */}
        {activeSection === "impact" && (
          <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                <Target className="h-8 w-8 text-green-400" />
                Business & Real-World Impact
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="bg-slate-800/50 border-green-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-green-400 text-xl">Who Benefits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Globe className="h-5 w-5 text-blue-400 mt-1" />
                      <div>
                        <h4 className="font-semibold text-white">Small-Medium Businesses</h4>
                        <p className="text-sm text-gray-300">Access enterprise-grade security at affordable costs</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-purple-400 mt-1" />
                      <div>
                        <h4 className="font-semibold text-white">Security Professionals</h4>
                        <p className="text-sm text-gray-300">Monetize expertise in a global marketplace</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Network className="h-5 w-5 text-cyan-400 mt-1" />
                      <div>
                        <h4 className="font-semibold text-white">Enterprise Organizations</h4>
                        <p className="text-sm text-gray-300">Augment internal teams with external expertise</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-yellow-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-yellow-400 text-xl">Market Impact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">60%</div>
                      <div className="text-sm text-gray-300">Cost Reduction</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">24/7</div>
                      <div className="text-sm text-gray-300">Global Coverage</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">100%</div>
                      <div className="text-sm text-gray-300">Transparency</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-cyan-400">0</div>
                      <div className="text-sm text-gray-300">Single Points of Failure</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 text-center mt-4">
                    Addressing the $6 trillion annual cybercrime damage through decentralized security services
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-r from-green-800/30 to-blue-800/30 border-green-500/30 backdrop-blur-sm">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold text-white mb-4 text-center">Economic Model</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <Coins className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                    <h4 className="font-semibold text-white mb-1">Incentive Alignment</h4>
                    <p className="text-sm text-gray-300">Quality work rewarded with CLT tokens</p>
                  </div>
                  <div className="text-center">
                    <BarChart3 className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                    <h4 className="font-semibold text-white mb-1">Scalable Pricing</h4>
                    <p className="text-sm text-gray-300">Market-driven competitive rates</p>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-2" />
                    <h4 className="font-semibold text-white mb-1">Network Effects</h4>
                    <p className="text-sm text-gray-300">Value increases with participation</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* System Architecture */}
        {activeSection === "architecture" && (
          <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                <Layers className="h-8 w-8 text-purple-400" />
                System Architecture
              </h2>
              <p className="text-xl text-gray-300">Built on IOTA Layer 1 with Move smart contracts</p>
            </div>

            <div className="bg-slate-800/30 border border-purple-500/30 rounded-xl p-8 backdrop-blur-sm">
              <div className="space-y-8">
                {/* Frontend Layer */}
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-purple-400 mb-4">Frontend Layer</h3>
                  <div className="flex justify-center items-center space-x-4">
                    <Card className="bg-slate-700/50 p-4 border-purple-400/30">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-5 w-5 text-purple-400" />
                        <span className="text-white text-sm">React Web App</span>
                      </div>
                    </Card>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    <Card className="bg-slate-700/50 p-4 border-cyan-400/30">
                      <div className="flex items-center space-x-2">
                        <Users className="h-5 w-5 text-cyan-400" />
                        <span className="text-white text-sm">IOTA Wallet Kit</span>
                      </div>
                    </Card>
                  </div>
                </div>

                {/* IOTA Trust Framework */}
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-blue-400 mb-4">IOTA Trust Framework</h3>
                  <div className="grid md:grid-cols-4 gap-4">
                    <Card className="bg-slate-700/50 p-4 border-blue-400/30">
                      <Eye className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                      <div className="text-white text-sm font-medium">IOTA Identity</div>
                      <div className="text-gray-400 text-xs">User verification</div>
                    </Card>
                    <Card className="bg-slate-700/50 p-4 border-green-400/30">
                      <Lock className="h-6 w-6 text-green-400 mx-auto mb-2" />
                      <div className="text-white text-sm font-medium">Notarization</div>
                      <div className="text-gray-400 text-xs">Evidence integrity</div>
                    </Card>
                    <Card className="bg-slate-700/50 p-4 border-yellow-400/30">
                      <Zap className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
                      <div className="text-white text-sm font-medium">Gas Station</div>
                      <div className="text-gray-400 text-xs">Seamless UX</div>
                    </Card>
                    <Card className="bg-slate-700/50 p-4 border-orange-400/30">
                      <Coins className="h-6 w-6 text-orange-400 mx-auto mb-2" />
                      <div className="text-white text-sm font-medium">CLT Tokens</div>
                      <div className="text-gray-400 text-xs">Reward system</div>
                    </Card>
                  </div>
                </div>

                {/* Smart Contracts */}
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-green-400 mb-4">Move Smart Contracts</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className="bg-slate-700/50 p-4 border-green-400/30">
                      <Shield className="h-6 w-6 text-green-400 mx-auto mb-2" />
                      <div className="text-white text-sm font-medium">SOC Service</div>
                      <div className="text-gray-400 text-xs">Core incident management</div>
                    </Card>
                    <Card className="bg-slate-700/50 p-4 border-purple-400/30">
                      <Award className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                      <div className="text-white text-sm font-medium">Reputation System</div>
                      <div className="text-gray-400 text-xs">Trust scoring</div>
                    </Card>
                    <Card className="bg-slate-700/50 p-4 border-cyan-400/30">
                      <Database className="h-6 w-6 text-cyan-400 mx-auto mb-2" />
                      <div className="text-white text-sm font-medium">Token Management</div>
                      <div className="text-gray-400 text-xs">CLT distribution</div>
                    </Card>
                  </div>
                </div>

                {/* Data Layer */}
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-red-400 mb-4">Data Layer</h3>
                  <div className="flex justify-center items-center space-x-4">
                    <Card className="bg-slate-700/50 p-4 border-red-400/30">
                      <div className="flex items-center space-x-2">
                        <Database className="h-5 w-5 text-red-400" />
                        <span className="text-white text-sm">IOTA Tangle</span>
                      </div>
                    </Card>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    <Card className="bg-slate-700/50 p-4 border-orange-400/30">
                      <div className="flex items-center space-x-2">
                        <Network className="h-5 w-5 text-orange-400" />
                        <span className="text-white text-sm">Supabase</span>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Key Features */}
        {activeSection === "features" && (
          <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                <Cpu className="h-8 w-8 text-cyan-400" />
                Key Features & Demo
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-slate-800/50 border-blue-500/30 backdrop-blur-sm hover:border-blue-400/50 transition-colors">
                <CardHeader>
                  <Shield className="h-8 w-8 text-blue-400 mb-2" />
                  <CardTitle className="text-blue-400">Incident Submission</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• Secure incident reporting with evidence</li>
                    <li>• Automatic categorization and tagging</li>
                    <li>• Stake-based priority system</li>
                    <li>• Real-time status tracking</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm hover:border-purple-400/50 transition-colors">
                <CardHeader>
                  <Users className="h-8 w-8 text-purple-400 mb-2" />
                  <CardTitle className="text-purple-400">Expert Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• AI-assisted threat assessment</li>
                    <li>• Collaborative analysis workspace</li>
                    <li>• Structured reporting templates</li>
                    <li>• Quality scoring mechanism</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-green-500/30 backdrop-blur-sm hover:border-green-400/50 transition-colors">
                <CardHeader>
                  <CheckCircle className="h-8 w-8 text-green-400 mb-2" />
                  <CardTitle className="text-green-400">Validation System</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• Multi-tier review process</li>
                    <li>• Consensus-based approval</li>
                    <li>• Quality assurance metrics</li>
                    <li>• Dispute resolution mechanism</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-yellow-500/30 backdrop-blur-sm hover:border-yellow-400/50 transition-colors">
                <CardHeader>
                  <Coins className="h-8 w-8 text-yellow-400 mb-2" />
                  <CardTitle className="text-yellow-400">Token Economy</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• CLT token rewards for quality work</li>
                    <li>• Staking mechanisms for commitment</li>
                    <li>• Reputation-based bonuses</li>
                    <li>• Community governance rights</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-cyan-500/30 backdrop-blur-sm hover:border-cyan-400/50 transition-colors">
                <CardHeader>
                  <Eye className="h-8 w-8 text-cyan-400 mb-2" />
                  <CardTitle className="text-cyan-400">Real-time Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• Live threat intelligence feeds</li>
                    <li>• Platform analytics and metrics</li>
                    <li>• Performance tracking</li>
                    <li>• Security trend analysis</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-red-500/30 backdrop-blur-sm hover:border-red-400/50 transition-colors">
                <CardHeader>
                  <Lock className="h-8 w-8 text-red-400 mb-2" />
                  <CardTitle className="text-red-400">Security & Privacy</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• End-to-end encryption</li>
                    <li>• Zero-knowledge proofs</li>
                    <li>• Immutable audit trails</li>
                    <li>• GDPR compliance</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-r from-purple-800/30 to-cyan-800/30 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-center text-white text-xl">Live Demo Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-purple-400 mb-3">What You Can Try Now:</h4>
                    <ul className="space-y-2 text-gray-300 text-sm">
                      <li>✅ Multi-role wallet connection</li>
                      <li>✅ Incident submission with real attack scenarios</li>
                      <li>✅ AI-powered threat analysis</li>
                      <li>✅ Real-time dashboard with 20+ mock incidents</li>
                      <li>✅ Token staking and rewards simulation</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-cyan-400 mb-3">Mock Data Includes:</h4>
                    <ul className="space-y-2 text-gray-300 text-sm">
                      <li>🎯 Recent DeFi exploits and smart contract hacks</li>
                      <li>🎯 Supply chain attacks and zero-days</li>
                      <li>🎯 Ransomware campaigns and APT activities</li>
                      <li>🎯 Real-world incident case studies</li>
                      <li>🎯 Arkham Intelligence-style threat tracking</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Future Steps */}
        {activeSection === "future" && (
          <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                <TrendingUp className="h-8 w-8 text-green-400" />
                Next Steps & Future Improvements
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="bg-slate-800/50 border-green-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-green-400 text-xl flex items-center gap-2">
                    <Clock className="h-6 w-6" />
                    Immediate Roadmap (Q1 2024)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-white">Smart Contract Deployment</h4>
                      <p className="text-sm text-gray-300">Deploy Move contracts to IOTA mainnet</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-white">Beta User Program</h4>
                      <p className="text-sm text-gray-300">Onboard 100 security professionals</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-white">Mobile Application</h4>
                      <p className="text-sm text-gray-300">Native iOS/Android apps</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-purple-400 text-xl flex items-center gap-2">
                    <Layers className="h-6 w-6" />
                    Advanced Features (Q2-Q3 2024)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-white">AI Enhancement</h4>
                      <p className="text-sm text-gray-300">Advanced ML models for threat detection</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-white">API Integrations</h4>
                      <p className="text-sm text-gray-300">Connect with SIEM tools and threat feeds</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-white">Automated Response</h4>
                      <p className="text-sm text-gray-300">Smart contract-triggered incident response</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-r from-blue-800/30 to-green-800/30 border-blue-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-center text-white text-xl">Long-term Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <Globe className="h-10 w-10 text-blue-400 mx-auto mb-3" />
                    <h4 className="font-semibold text-white mb-2">Global Network</h4>
                    <p className="text-sm text-gray-300">10,000+ security experts across 50+ countries</p>
                  </div>
                  <div className="text-center">
                    <Network className="h-10 w-10 text-purple-400 mx-auto mb-3" />
                    <h4 className="font-semibold text-white mb-2">Ecosystem Integration</h4>
                    <p className="text-sm text-gray-300">Native integration with major security vendors</p>
                  </div>
                  <div className="text-center">
                    <Award className="h-10 w-10 text-green-400 mx-auto mb-3" />
                    <h4 className="font-semibold text-white mb-2">Industry Standard</h4>
                    <p className="text-sm text-gray-300">De facto platform for decentralized cybersecurity</p>
                  </div>
                </div>
                
                <div className="mt-8 text-center">
                  <h4 className="text-lg font-semibold text-white mb-4">Technical Improvements Needed</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-left">
                    <ul className="space-y-2 text-gray-300 text-sm">
                      <li>🔧 Enhanced scalability for enterprise workloads</li>
                      <li>🔧 Cross-chain interoperability</li>
                      <li>🔧 Advanced cryptographic privacy features</li>
                    </ul>
                    <ul className="space-y-2 text-gray-300 text-sm">
                      <li>🔧 Regulatory compliance frameworks</li>
                      <li>🔧 Enterprise security certifications</li>
                      <li>🔧 Quantum-resistant cryptography</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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
