import { useState, useEffect } from "react";
import { useIotaClient } from "@iota/dapp-kit";
import { createContractService } from "@/lib/contract";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  FileText, 
  Search, 
  Shield, 
  Coins, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  ArrowLeft
} from "lucide-react";
import TicketForm from "./TicketForm";
import TicketList from "./TicketList";
import StakingRewards from "./StakingRewards";

interface DashboardProps {
  userRole: string;
  walletAddress: string;
}

const Dashboard = ({ userRole, walletAddress }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showTicketForm, setShowTicketForm] = useState(false);

  const [stats, setStats] = useState({
    totalTickets: 0,
    pendingTickets: 0,
    resolvedTickets: 0,
    assignedTickets: 0,
    completedTickets: 0,
    pendingReview: 0,
    escalatedTickets: 0,
    certifiedTickets: 0,
    pendingCertification: 0,
    stakingBalance: "0.0 IOTA"
  });

  useEffect(() => {
    if (walletAddress) {
      loadStats();
    }
  }, [walletAddress, userRole]);

  const loadStats = async () => {
    try {
      const client = useIotaClient();
      const contractService = createContractService(client);
      
      const userTickets = await contractService.getTicketsForUser(walletAddress, userRole);
      const stakeTokens = await contractService.getUserStakeTokens(walletAddress);
      const cltTokens = await contractService.getUserCLTTokens(walletAddress);
      
      const totalStaking = stakeTokens.reduce((sum, token) => sum + token.amount, 0) +
                          cltTokens.reduce((sum, token) => sum + token.amount, 0);

      switch (userRole) {
        case "client":
          setStats({
            ...stats,
            totalTickets: userTickets.length,
            pendingTickets: userTickets.filter(t => [0, 1, 2].includes(t.status)).length,
            resolvedTickets: userTickets.filter(t => [3, 4].includes(t.status)).length,
            stakingBalance: `${totalStaking} IOTA`
          });
          break;
        case "analyst":
          setStats({
            ...stats,
            assignedTickets: userTickets.filter(t => t.status === 1).length,
            completedTickets: userTickets.filter(t => [3, 4].includes(t.status)).length,
            pendingReview: userTickets.filter(t => t.status === 2).length,
            stakingBalance: `${totalStaking} IOTA`
          });
          break;
        case "certifier":
          setStats({
            ...stats,
            escalatedTickets: userTickets.filter(t => t.status === 2).length,
            certifiedTickets: userTickets.filter(t => [3, 4].includes(t.status)).length,
            pendingCertification: userTickets.filter(t => t.status === 2).length,
            stakingBalance: `${totalStaking} IOTA`
          });
          break;
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const getStatsForRole = (role: string) => {
    return stats;
  };

  const renderRoleContent = () => {
    const stats = getStatsForRole(userRole);
    
    switch (userRole) {
      case "client":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="security-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{(stats as any).totalTickets}</div>
                </CardContent>
              </Card>
              <Card className="security-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-warning">{(stats as any).pendingTickets}</div>
                </CardContent>
              </Card>
              <Card className="security-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Resolved</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">{(stats as any).resolvedTickets}</div>
                </CardContent>
              </Card>
              <Card className="security-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Staking Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">{stats.stakingBalance}</div>
                </CardContent>
              </Card>
            </div>
            <div className="flex gap-4">
              <Button variant="security" className="flex-1" onClick={() => setActiveTab("tickets")}>
                <FileText className="h-4 w-4 mr-2" />
                View My Tickets
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setShowTicketForm(true)}>
                <FileText className="h-4 w-4 mr-2" />
                Submit New Ticket
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setActiveTab("staking")}>
                <Coins className="h-4 w-4 mr-2" />
                Manage Staking
              </Button>
            </div>
          </div>
        );
      case "analyst":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="security-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Assigned Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{(stats as any).assignedTickets}</div>
                </CardContent>
              </Card>
              <Card className="security-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">{(stats as any).completedTickets}</div>
                </CardContent>
              </Card>
              <Card className="security-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-warning">{(stats as any).pendingReview}</div>
                </CardContent>
              </Card>
              <Card className="security-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Staking Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">{stats.stakingBalance}</div>
                </CardContent>
              </Card>
            </div>
            <div className="flex gap-4">
              <Button variant="security" className="flex-1" onClick={() => setActiveTab("tickets")}>
                <Search className="h-4 w-4 mr-2" />
                View Assigned Tickets
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setActiveTab("staking")}>
                <Coins className="h-4 w-4 mr-2" />
                Manage Staking
              </Button>
            </div>
          </div>
        );
      case "certifier":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="security-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Escalated Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{(stats as any).escalatedTickets}</div>
                </CardContent>
              </Card>
              <Card className="security-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Certified</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">{(stats as any).certifiedTickets}</div>
                </CardContent>
              </Card>
              <Card className="security-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pending Certification</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-warning">{(stats as any).pendingCertification}</div>
                </CardContent>
              </Card>
              <Card className="security-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Staking Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">{stats.stakingBalance}</div>
                </CardContent>
              </Card>
            </div>
            <div className="flex gap-4">
              <Button variant="security" className="flex-1" onClick={() => setActiveTab("tickets")}>
                <Shield className="h-4 w-4 mr-2" />
                Review Escalated Tickets
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setActiveTab("staking")}>
                <Coins className="h-4 w-4 mr-2" />
                Manage Staking
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const handleTicketSubmit = (ticketData: any) => {
    setShowTicketForm(false);
    setActiveTab("tickets");
  };

  const handleTicketUpdate = (ticketData: any) => {
    // Handle ticket updates from the list
    console.log("Ticket updated:", ticketData);
  };

  // Handle ticket form display
  if (showTicketForm) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => setShowTicketForm(false)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        <TicketForm 
          onSubmit={handleTicketSubmit}
          onCancel={() => setShowTicketForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">
            {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Dashboard
          </h2>
          <p className="text-muted-foreground">
            Welcome to your dSOC security operations center
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-accent border-accent">
            {userRole.toUpperCase()}
          </Badge>
          <div className="flex gap-2">
            <Button 
              variant={activeTab === "overview" ? "default" : "ghost"} 
              size="sm"
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </Button>
            <Button 
              variant={activeTab === "tickets" ? "default" : "ghost"} 
              size="sm"
              onClick={() => setActiveTab("tickets")}
            >
              Tickets
            </Button>
            <Button 
              variant={activeTab === "staking" ? "default" : "ghost"} 
              size="sm"
              onClick={() => setActiveTab("staking")}
            >
              Staking
            </Button>
          </div>
        </div>
      </div>

      {activeTab === "overview" && (
        <>
          {renderRoleContent()}

          {/* Recent Activity */}
          <Card className="security-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest updates and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/20">
                  <div className="h-2 w-2 bg-accent rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New ticket submitted</p>
                    <p className="text-xs text-muted-foreground">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/20">
                  <div className="h-2 w-2 bg-success rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Ticket analysis completed</p>
                    <p className="text-xs text-muted-foreground">1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/20">
                  <div className="h-2 w-2 bg-primary rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Staking reward claimed</p>
                    <p className="text-xs text-muted-foreground">3 hours ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === "tickets" && (
        <TicketList 
          userRole={userRole}
          onTicketUpdate={handleTicketUpdate}
        />
      )}

      {activeTab === "staking" && (
        <StakingRewards 
          userRole={userRole}
          walletAddress={walletAddress}
        />
      )}
    </div>
  );
};

export default Dashboard;