
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useCurrentAccount, useIotaClient } from "@iota/dapp-kit";
import { createContractService } from "@/lib/contract";
// Mock data - inline to avoid import issues
const mockTickets = [
  {
    id: "1",
    ticket_id: 1001,
    client_address: "0x742d35Cc6634C0532925a3b8D0B9e1d2",
    analyst_address: "0x8ba1f109551bD432803012645Hac136c",
    title: "Uniswap V3 Flash Loan Exploit",
    description: "Critical vulnerability in price oracle manipulation",
    category: "DeFi Protocol",
    blockchain: "Ethereum",
    severity: "Critical",
    evidence_hash: "QmX4f3g7h8i9j0k1l2m3n4o5p6q7r8s9t0u",
    status: 3,
    stake_amount: 50000,
    loss_amount: "$2.1M",
    created_at: "2024-01-15T10:30:00Z"
  },
  {
    id: "2", 
    ticket_id: 1002,
    client_address: "0x742d35Cc6634C0532925a3b8D0B9e1d2",
    title: "Cross-chain Bridge Vulnerability",
    description: "Signature verification bypass in multi-sig bridge",
    category: "Bridge Security",
    blockchain: "Polygon",
    severity: "High",
    status: 1,
    stake_amount: 35000,
    loss_amount: "$890K",
    created_at: "2024-01-16T14:20:00Z"
  }
];

const mockUsers = [
  {
    id: "1",
    wallet_address: "0x742d35Cc6634C0532925a3b8D0B9e1d2",
    role: "client",
    clt_balance: 15750,
    stake_balance: 45000
  },
  {
    id: "2",
    wallet_address: "0x8ba1f109551bD432803012645Hac136c",
    role: "analyst", 
    clt_balance: 42300,
    stake_balance: 18500
  }
];
import TicketStoreManager from "./TicketStoreManager";
import TicketForm from "./TicketForm";
import TicketList from "./TicketList";
import StakingRewards from "./StakingRewards";
import AIAssistant from "./AIAssistant";
import { 
  BarChart3, 
  FileText, 
  Shield, 
  Award, 
  Coins,
  TrendingUp,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Target,
  Brain,
  Zap,
  DollarSign,
  Activity,
  Eye,
  Search,
  Filter,
  ArrowUp,
  ArrowDown,
  Flame,
  Globe,
  Lock,
  Unlock,
  Star,
  Calendar,
  PieChart,
  Monitor,
  Crosshair,
  Radar,
  ShieldCheck,
  TrendingDown,
  AlertCircle,
  PlayCircle,
  Settings,
  BookOpen,
  Archive,
  Mail,
  Map,
  Layers,
  Network,
  HardDrive,
  Cpu,
  GitBranch,
  Command,
  Terminal
} from "lucide-react";

interface DashboardProps {
  userRole: string;
}

interface UserStats {
  totalTickets: number;
  activeTickets: number;
  completedTickets: number;
  cltBalance: number;
  stakeBalance: number;
  earnings: number;
  successRate: number;
  avgResponseTime: string;
}

export default function Dashboard({ userRole }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [ticketStoreId, setTicketStoreId] = useState<string>("");
  const [stats, setStats] = useState<UserStats>({
    totalTickets: 0,
    activeTickets: 0,
    completedTickets: 0,
    cltBalance: 0,
    stakeBalance: 0,
    earnings: 0,
    successRate: 0,
    avgResponseTime: "0h"
  });

  const account = useCurrentAccount();
  const client = useIotaClient();

  useEffect(() => {
    if (account) {
      loadStats();
    }
  }, [userRole, account]);

  const loadStats = async () => {
    if (!account) return;

    try {
      const userAddress = account.address;
      const userData = mockUsers.find(user => user.wallet_address === userAddress);

      let userStats: UserStats;

      if (userRole === 'client') {
        const clientTickets = mockTickets.filter(ticket => ticket.client_address === userAddress);
        const completedTickets = clientTickets.filter(ticket => ticket.status === 3);

        userStats = {
          totalTickets: clientTickets.length,
          activeTickets: clientTickets.filter(ticket => ticket.status < 3).length,
          completedTickets: completedTickets.length,
          cltBalance: userData?.clt_balance || 15750,
          stakeBalance: userData?.stake_balance || 45000,
          earnings: completedTickets.reduce((sum, ticket) => sum + ticket.stake_amount, 0),
          successRate: clientTickets.length > 0 ? Math.round((completedTickets.length / clientTickets.length) * 100) : 0,
          avgResponseTime: "18h"
        };
      } else if (userRole === 'analyst') {
        const analystTickets = mockTickets.filter(ticket => ticket.analyst_address === userAddress);
        const completedTickets = analystTickets.filter(ticket => ticket.status === 3);

        userStats = {
          totalTickets: analystTickets.length,
          activeTickets: analystTickets.filter(ticket => ticket.status === 1 || ticket.status === 2).length,
          completedTickets: completedTickets.length,
          cltBalance: userData?.clt_balance || 42300,
          stakeBalance: userData?.stake_balance || 18500,
          earnings: completedTickets.reduce((sum, ticket) => sum + Math.round(ticket.stake_amount * 0.8), 0),
          successRate: analystTickets.length > 0 ? Math.round((completedTickets.length / analystTickets.length) * 100) : 92,
          avgResponseTime: "14h"
        };
      } else { // certifier
        const certifierTickets = mockTickets.filter(ticket => ticket.status >= 2);
        const approvedTickets = certifierTickets.filter(ticket => ticket.status === 3);

        userStats = {
          totalTickets: certifierTickets.length,
          activeTickets: certifierTickets.filter(ticket => ticket.status === 2).length,
          completedTickets: approvedTickets.length,
          cltBalance: userData?.clt_balance || 67500,
          stakeBalance: userData?.stake_balance || 8000,
          earnings: approvedTickets.reduce((sum, ticket) => sum + Math.round(ticket.stake_amount * 0.1), 0),
          successRate: certifierTickets.length > 0 ? Math.round((approvedTickets.length / certifierTickets.length) * 100) : 96,
          avgResponseTime: "4h"
        };
      }

      setStats(userStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleStoreReady = (storeId: string) => {
    setTicketStoreId(storeId);
  };

  const getRoleInfo = () => {
    switch (userRole) {
      case 'client':
        return {
          title: "Client Intelligence Center",
          description: "Submit incidents • Track investigations • Monitor portfolio",
          icon: Shield,
          color: "blue",
          accent: "from-blue-500/20 to-cyan-500/20"
        };
      case 'analyst':
        return {
          title: "Threat Hunter Command", 
          description: "Hunt threats • Generate intel • Earn bounties",
          icon: Crosshair,
          color: "emerald",
          accent: "from-emerald-500/20 to-teal-500/20"
        };
      case 'certifier':
        return {
          title: "Security Validation HQ",
          description: "Validate reports • Certify findings • Maintain standards",
          icon: ShieldCheck,
          color: "amber",
          accent: "from-amber-500/20 to-orange-500/20"
        };
      default:
        return {
          title: "dSOC Dashboard",
          description: "Decentralized security operations center",
          icon: Database,
          color: "slate",
          accent: "from-slate-500/20 to-gray-500/20"
        };
    }
  };

  const roleInfo = getRoleInfo();
  const IconComponent = roleInfo.icon;

  // Different tabs for each role
  const getTabsForRole = () => {
    switch (userRole) {
      case 'client':
        return [
          { id: "overview", label: "Portfolio View", icon: PieChart },
          { id: "tickets", label: "My Incidents", icon: AlertTriangle },
          { id: "submit", label: "Report Breach", icon: FileText },
          { id: "rewards", label: "Rewards", icon: Coins },
          { id: "ai-assistant", label: "AI Analyst", icon: Brain },
        ];
      case 'analyst':
        return [
          { id: "overview", label: "Hunt Board", icon: Radar },
          { id: "tickets", label: "Active Hunts", icon: Target },
          { id: "rewards", label: "Bounties", icon: DollarSign },
          { id: "ai-assistant", label: "AI Tools", icon: Terminal },
        ];
      case 'certifier':
        return [
          { id: "overview", label: "Review Center", icon: Monitor },
          { id: "tickets", label: "Pending Reviews", icon: Archive },
          { id: "rewards", label: "Certifications", icon: Award },
          { id: "ai-assistant", label: "AI Validation", icon: Settings },
        ];
      default:
        return [];
    }
  };

  const tabs = getTabsForRole();

  // CLIENT DASHBOARD
  const renderClientDashboard = () => (
    <div className="space-y-8">
      {/* Client Portfolio Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500/10 via-blue-600/5 to-transparent border-blue-500/20 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Shield className="h-5 w-5 text-blue-400" />
              </div>
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">PORTFOLIO</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-white mb-1">${(stats.cltBalance * 1.2).toLocaleString()}</div>
            <p className="text-blue-200 text-sm">Total Portfolio Value</p>
            <div className="flex items-center mt-2 text-xs">
              <TrendingUp className="h-3 w-3 text-blue-400 mr-1" />
              <span className="text-blue-300">+12.4% this month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 via-red-600/5 to-transparent border-red-500/20 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-xs">INCIDENTS</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-white mb-1">{stats.totalTickets}</div>
            <p className="text-red-200 text-sm">Security Incidents Filed</p>
            <div className="flex items-center mt-2 text-xs">
              <Calendar className="h-3 w-3 text-red-400 mr-1" />
              <span className="text-red-300">{stats.activeTickets} active cases</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 via-green-600/5 to-transparent border-green-500/20 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">RESOLVED</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-white mb-1">{stats.completedTickets}</div>
            <p className="text-green-200 text-sm">Cases Resolved</p>
            <div className="flex items-center mt-2 text-xs">
              <Clock className="h-3 w-3 text-green-400 mr-1" />
              <span className="text-green-300">Avg. {stats.avgResponseTime} response</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 via-purple-600/5 to-transparent border-purple-500/20 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Coins className="h-5 w-5 text-purple-400" />
              </div>
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">BALANCE</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-white mb-1">{stats.cltBalance.toLocaleString()}</div>
            <p className="text-purple-200 text-sm">CLT Balance</p>
            <div className="flex items-center mt-2 text-xs">
              <Star className="h-3 w-3 text-purple-400 mr-1" />
              <span className="text-purple-300">Premium tier active</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client Specific Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader className="border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Layers className="h-5 w-5 text-blue-400" />
                <CardTitle className="text-blue-300">Your Asset Protection</CardTitle>
              </div>
              <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-blue-300 font-medium text-sm">DeFi Portfolio</p>
                    <p className="text-slate-400 text-xs">Protected across 8 protocols</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-blue-400 font-bold text-sm">$2.4M</div>
                  <div className="text-xs text-slate-400">TVL</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-green-300 font-medium text-sm">NFT Collection</p>
                    <p className="text-slate-400 text-xs">24 high-value items</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-bold text-sm">$890K</div>
                  <div className="text-xs text-slate-400">Floor Value</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  <div>
                    <p className="text-amber-300 font-medium text-sm">CEX Holdings</p>
                    <p className="text-slate-400 text-xs">Multi-exchange deposits</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-amber-400 font-bold text-sm">$1.8M</div>
                  <div className="text-xs text-slate-400">Liquid</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader className="border-b border-slate-700/50">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
              <CardTitle className="text-emerald-300">Protection Analytics</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Threat Detection Rate</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-slate-700 rounded-full h-2">
                    <div className="h-2 bg-emerald-400 rounded-full" style={{ width: '94%' }}></div>
                  </div>
                  <span className="text-emerald-400 text-sm font-medium">94%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Response Speed</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-slate-700 rounded-full h-2">
                    <div className="h-2 bg-blue-400 rounded-full" style={{ width: '87%' }}></div>
                  </div>
                  <span className="text-blue-400 text-sm font-medium">18h avg</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Recovery Success</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-slate-700 rounded-full h-2">
                    <div className="h-2 bg-purple-400 rounded-full" style={{ width: '76%' }}></div>
                  </div>
                  <span className="text-purple-400 text-sm font-medium">76%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">False Positive Rate</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-slate-700 rounded-full h-2">
                    <div className="h-2 bg-red-400 rounded-full" style={{ width: '12%' }}></div>
                  </div>
                  <span className="text-red-400 text-sm font-medium">12%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // ANALYST DASHBOARD
  const renderAnalystDashboard = () => (
    <div className="space-y-8">
      {/* Analyst Hunt Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-emerald-500/10 via-emerald-600/5 to-transparent border-emerald-500/20 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <Target className="h-5 w-5 text-emerald-400" />
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">BOUNTIES</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-white mb-1">{stats.totalTickets}</div>
            <p className="text-emerald-200 text-sm">Hunts Completed</p>
            <div className="flex items-center mt-2 text-xs">
              <Crosshair className="h-3 w-3 text-emerald-400 mr-1" />
              <span className="text-emerald-300">{stats.successRate}% success rate</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/10 via-cyan-600/5 to-transparent border-cyan-500/20 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <Radar className="h-5 w-5 text-cyan-400" />
              </div>
              <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-xs">ACTIVE</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-white mb-1">{stats.activeTickets}</div>
            <p className="text-cyan-200 text-sm">Active Hunts</p>
            <div className="flex items-center mt-2 text-xs">
              <Activity className="h-3 w-3 text-cyan-400 mr-1" />
              <span className="text-cyan-300">Avg. {stats.avgResponseTime} to resolve</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 via-purple-600/5 to-transparent border-purple-500/20 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <DollarSign className="h-5 w-5 text-purple-400" />
              </div>
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">REWARDS</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-white mb-1">{stats.cltBalance.toLocaleString()}</div>
            <p className="text-purple-200 text-sm">CLT Earned</p>
            <div className="flex items-center mt-2 text-xs">
              <TrendingUp className="h-3 w-3 text-purple-400 mr-1" />
              <span className="text-purple-300">+{(stats.earnings * 0.15).toFixed(0)} this week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 via-orange-600/5 to-transparent border-orange-500/20 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Flame className="h-5 w-5 text-orange-400" />
              </div>
              <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-xs">RANK</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-white mb-1">#7</div>
            <p className="text-orange-200 text-sm">Global Rank</p>
            <div className="flex items-center mt-2 text-xs">
              <Star className="h-3 w-3 text-orange-400 mr-1" />
              <span className="text-orange-300">Elite Hunter Tier</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analyst Specific Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader className="border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Map className="h-5 w-5 text-emerald-400" />
                <CardTitle className="text-emerald-300">Hunt Opportunities</CardTitle>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                {mockTickets.filter(t => t.status === 0).length} Available
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              {mockTickets.filter(t => t.status === 0).slice(0, 3).map((ticket, index) => (
                <div key={ticket.id} className="flex items-center space-x-3 p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
                  <div className="flex-shrink-0">
                    <div className="p-2 bg-emerald-500/20 rounded-lg">
                      <Target className="h-4 w-4 text-emerald-400" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{ticket.title}</p>
                    <p className="text-slate-400 text-xs">{ticket.category} • {ticket.blockchain}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-emerald-400 font-bold text-sm">{ticket.stake_amount.toLocaleString()} CLT</div>
                    <div className="text-xs text-slate-400">Bounty</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader className="border-b border-slate-700/50">
            <div className="flex items-center space-x-3">
              <GitBranch className="h-5 w-5 text-cyan-400" />
              <CardTitle className="text-cyan-300">Threat Intelligence Feed</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <div>
                    <p className="text-red-300 font-medium text-sm">Flash Loan Vector</p>
                    <p className="text-slate-400 text-xs">New exploit pattern detected</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-red-400 font-bold text-sm">HIGH</div>
                  <div className="text-xs text-slate-400">Priority</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                <div className="flex items-center space-x-3">
                  <Network className="h-4 w-4 text-orange-400" />
                  <div>
                    <p className="text-orange-300 font-medium text-sm">Bridge Vulnerability</p>
                    <p className="text-slate-400 text-xs">Cross-chain signature bypass</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-orange-400 font-bold text-sm">MED</div>
                  <div className="text-xs text-slate-400">Priority</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <div className="flex items-center space-x-3">
                  <Cpu className="h-4 w-4 text-yellow-400" />
                  <div>
                    <p className="text-yellow-300 font-medium text-sm">Oracle Price Feed</p>
                    <p className="text-slate-400 text-xs">Manipulation opportunity</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-yellow-400 font-bold text-sm">LOW</div>
                  <div className="text-xs text-slate-400">Priority</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // CERTIFIER DASHBOARD
  const renderCertifierDashboard = () => (
    <div className="space-y-8">
      {/* Certifier Review Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-transparent border-amber-500/20 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <ShieldCheck className="h-5 w-5 text-amber-400" />
              </div>
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">CERTIFIED</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-white mb-1">{stats.totalTickets}</div>
            <p className="text-amber-200 text-sm">Reports Certified</p>
            <div className="flex items-center mt-2 text-xs">
              <Award className="h-3 w-3 text-amber-400 mr-1" />
              <span className="text-amber-300">{stats.successRate}% accuracy rate</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 via-blue-600/5 to-transparent border-blue-500/20 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Archive className="h-5 w-5 text-blue-400" />
              </div>
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">QUEUE</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-white mb-1">{stats.activeTickets}</div>
            <p className="text-blue-200 text-sm">Pending Reviews</p>
            <div className="flex items-center mt-2 text-xs">
              <Clock className="h-3 w-3 text-blue-400 mr-1" />
              <span className="text-blue-300">Avg. {stats.avgResponseTime} review time</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 via-green-600/5 to-transparent border-green-500/20 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">APPROVED</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-white mb-1">{stats.completedTickets}</div>
            <p className="text-green-200 text-sm">Reports Approved</p>
            <div className="flex items-center mt-2 text-xs">
              <TrendingUp className="h-3 w-3 text-green-400 mr-1" />
              <span className="text-green-300">+{Math.floor(stats.completedTickets * 0.08)} this week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-500/10 via-violet-600/5 to-transparent border-violet-500/20 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-violet-500/20 rounded-lg">
                <Star className="h-5 w-5 text-violet-400" />
              </div>
              <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 text-xs">AUTHORITY</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-white mb-1">Elite</div>
            <p className="text-violet-200 text-sm">Certification Level</p>
            <div className="flex items-center mt-2 text-xs">
              <Lock className="h-3 w-3 text-violet-400 mr-1" />
              <span className="text-violet-300">Top 1% certifiers</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Certifier Specific Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader className="border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <BookOpen className="h-5 w-5 text-amber-400" />
                <CardTitle className="text-amber-300">Certification Queue</CardTitle>
              </div>
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                {mockTickets.filter(t => t.status === 2).length} Reviews
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              {mockTickets.filter(t => t.status === 2).slice(0, 3).map((ticket) => (
                <div key={ticket.id} className="flex items-center space-x-3 p-3 bg-amber-500/5 rounded-lg border border-amber-500/20">
                  <div className="flex-shrink-0">
                    <div className={`w-3 h-3 rounded-full ${ticket.severity === 'Critical' ? 'bg-red-500' : ticket.severity === 'High' ? 'bg-orange-500' : 'bg-yellow-500'}`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{ticket.title}</p>
                    <p className="text-slate-400 text-xs">{ticket.category} • {ticket.loss_amount}</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-amber-500/20 text-amber-300 text-xs">{ticket.severity}</Badge>
                    <div className="text-xs text-slate-400 mt-1">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader className="border-b border-slate-700/50">
            <div className="flex items-center space-x-3">
              <HardDrive className="h-5 w-5 text-blue-400" />
              <CardTitle className="text-blue-300">Validation Metrics</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Accuracy Score</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-slate-700 rounded-full h-2">
                    <div className="h-2 bg-green-400 rounded-full" style={{ width: '98%' }}></div>
                  </div>
                  <span className="text-green-400 text-sm font-medium">98%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Review Speed</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-slate-700 rounded-full h-2">
                    <div className="h-2 bg-blue-400 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                  <span className="text-blue-400 text-sm font-medium">4.2h</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Consistency</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-slate-700 rounded-full h-2">
                    <div className="h-2 bg-purple-400 rounded-full" style={{ width: '96%' }}></div>
                  </div>
                  <span className="text-purple-400 text-sm font-medium">96%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Dispute Rate</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-slate-700 rounded-full h-2">
                    <div className="h-2 bg-red-400 rounded-full" style={{ width: '8%' }}></div>
                  </div>
                  <span className="text-red-400 text-sm font-medium">0.8%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm p-8">
          <CardContent className="text-center">
            <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Connecting wallet...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800/50 bg-slate-950/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 bg-gradient-to-r ${roleInfo.accent} rounded-xl border border-slate-700/50`}>
                <IconComponent className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  {roleInfo.title}
                </h1>
                <p className="text-slate-400 mt-1">{roleInfo.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className={`bg-${roleInfo.color}-500/20 text-${roleInfo.color}-300 border-${roleInfo.color}-500/30 px-4 py-2 font-medium`}>
                {userRole.toUpperCase()} • TIER {userRole === 'certifier' ? 'ELITE' : userRole === 'analyst' ? 'PRO' : 'PREMIUM'}
              </Badge>
            </div>
          </div>
          
          {/* Ticket Store Manager - Initialize in background */}
          {ticketStoreId ? null : <TicketStoreManager onStoreReady={handleStoreReady} />}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 p-1 bg-slate-800/30 rounded-xl backdrop-blur-sm border border-slate-700/50">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r from-${roleInfo.color}-600/20 to-${roleInfo.color}-700/20 text-${roleInfo.color}-300 border border-${roleInfo.color}-500/30 shadow-lg`
                      : "text-slate-400 hover:text-white hover:bg-slate-700/30"
                  }`}
                >
                  <TabIcon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="pb-20">
          {activeTab === "overview" && (
            <div>
              {userRole === 'client' && renderClientDashboard()}
              {userRole === 'analyst' && renderAnalystDashboard()}
              {userRole === 'certifier' && renderCertifierDashboard()}
            </div>
          )}

          {activeTab === "tickets" && (
            <TicketList userRole={userRole} />
          )}

          {activeTab === "submit" && userRole === 'client' && (
            <TicketForm onTicketSubmitted={() => setActiveTab("tickets")} />
          )}

          {activeTab === "rewards" && (
            <StakingRewards />
          )}

          {activeTab === "ai-assistant" && (
            <AIAssistant />
          )}
        </div>
      </div>
    </div>
  );
}
