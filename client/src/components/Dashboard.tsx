import { useState, useEffect } from "react";
import { useIotaClient } from "@iota/dapp-kit";
import { createContractService } from "@/lib/contract";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  Shield, 
  TrendingUp, 
  Search, 
  Coins, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  ArrowLeft,
  Award,
  Database,
  FileText
} from "lucide-react";
import TicketForm from "./TicketForm";
import TicketList from "./TicketList";
import StakingRewards from "./StakingRewards";
import TicketStoreManager from "./TicketStoreManager";

interface DashboardProps {
  userRole: string;
}

export default function Dashboard({ userRole }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [ticketStoreId, setTicketStoreId] = useState<string>("");
  const [stats, setStats] = useState({
    totalTickets: 0,
    activeTickets: 0,
    cltBalance: 0,
    stakeBalance: 0
  });

  const client = useIotaClient();

  useEffect(() => {
    if (ticketStoreId) {
      loadStats();
    }
  }, [ticketStoreId, userRole]);

  const loadStats = async () => {
    try {
      const contractService = createContractService(client);
      // Load user statistics here
      // This would involve querying the contract and Supabase
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
          title: "Client Dashboard",
          description: "Submit and manage your cybersecurity incident reports",
          icon: Shield,
          color: "purple"
        };
      case 'analyst':
        return {
          title: "Analyst Dashboard", 
          description: "Analyze security incidents and earn CLT rewards",
          icon: Search,
          color: "cyan"
        };
      case 'certifier':
        return {
          title: "Certifier Dashboard",
          description: "Review and certify incident analyses",
          icon: Award,
          color: "green"
        };
      default:
        return {
          title: "Dashboard",
          description: "Manage your dSOC activities",
          icon: Database,
          color: "gray"
        };
    }
  };

  const roleInfo = getRoleInfo();
  const IconComponent = roleInfo.icon;

  const tabs = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "tickets", label: userRole === 'client' ? "My Tickets" : "Available Tickets", icon: FileText },
    ...(userRole === 'client' ? [{ id: "submit", label: "Submit Ticket", icon: Shield }] : []),
    { id: "rewards", label: "Staking & Rewards", icon: Coins },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className={`p-3 bg-gradient-to-r from-${roleInfo.color}-500 to-${roleInfo.color}-600 rounded-xl`}>
              <IconComponent className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{roleInfo.title}</h1>
              <p className="text-gray-400">{roleInfo.description}</p>
            </div>
            <div className="ml-auto">
              <Badge className={`bg-${roleInfo.color}-500/20 text-${roleInfo.color}-400 border-${roleInfo.color}-500/30 px-3 py-1`}>
                {userRole.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Ticket Store Manager */}
          <TicketStoreManager onStoreReady={handleStoreReady} />
        </div>

        {ticketStoreId && (
          <>
            {/* Navigation Tabs */}
            <div className="mb-8">
              <div className="flex space-x-1 p-1 bg-slate-800/50 rounded-xl backdrop-blur-sm">
                {tabs.map((tab) => {
                  const TabIcon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                        activeTab === tab.id
                          ? `bg-gradient-to-r from-${roleInfo.color}-600 to-${roleInfo.color}-700 text-white shadow-lg`
                          : "text-gray-400 hover:text-white hover:bg-slate-700/50"
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
                <div className="space-y-8">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="bg-slate-800/50 border-blue-500/30 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-blue-400 text-sm font-medium">Total Tickets</p>
                            <p className="text-2xl font-bold text-white">{stats.totalTickets}</p>
                          </div>
                          <Shield className="h-8 w-8 text-blue-400" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-yellow-500/30 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-yellow-400 text-sm font-medium">Active Tickets</p>
                            <p className="text-2xl font-bold text-white">{stats.activeTickets}</p>
                          </div>
                          <Clock className="h-8 w-8 text-yellow-400" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-green-500/30 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-green-400 text-sm font-medium">CLT Balance</p>
                            <p className="text-2xl font-bold text-white">{stats.cltBalance}</p>
                          </div>
                          <Award className="h-8 w-8 text-green-400" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-purple-400 text-sm font-medium">Stake Balance</p>
                            <p className="text-2xl font-bold text-white">{stats.stakeBalance}</p>
                          </div>
                          <Coins className="h-8 w-8 text-purple-400" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Activity */}
                  <Card className="bg-slate-800/50 border-gray-600/30 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white">Recent Activity</CardTitle>
                      <CardDescription className="text-gray-400">
                        Your latest interactions with the dSOC platform
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-400" />
                          <div className="flex-1">
                            <p className="text-white text-sm">Ticket store initialized</p>
                            <p className="text-gray-400 text-xs">Ready to submit and manage tickets</p>
                          </div>
                          <span className="text-xs text-gray-500">Just now</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
            </div>
          </>
        )}
      </div>
    </div>
  );
}