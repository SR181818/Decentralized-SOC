import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useWallet } from "@/hooks/useWallet";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Search,
  Filter
} from "lucide-react";

interface TicketsDashboardProps {
  userRole: string;
}

const TicketsDashboard = ({ userRole }: TicketsDashboardProps) => {
  const { userId } = useWallet();
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const { data: tickets, isLoading } = useQuery({
    queryKey: [`/api/tickets/user/${userId}`, userRole],
    queryFn: () => fetch(`/api/tickets/user/${userId}?role=${userRole}`).then(res => res.json()),
    enabled: !!userId,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <Clock className="h-4 w-4 text-warning" />;
      case "in_progress":
        return <FileText className="h-4 w-4 text-primary" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "rejected":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      open: "bg-warning/20 text-warning border-warning/30",
      in_progress: "bg-primary/20 text-primary border-primary/30",
      completed: "bg-success/20 text-success border-success/30",
      rejected: "bg-destructive/20 text-destructive border-destructive/30",
    };

    return (
      <Badge 
        variant="outline" 
        className={variants[status] || "bg-muted/20 text-muted-foreground border-muted/30"}
      >
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const filteredTickets = tickets?.filter((ticket: any) => 
    selectedStatus === "all" || ticket.status === selectedStatus
  ) || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="security-card">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-1/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">
          {userRole === "client" ? "My Tickets" : 
           userRole === "analyst" ? "Assigned Tickets" : "Certification Queue"}
        </h2>
        <div className="flex items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {filteredTickets.length === 0 ? (
        <Card className="security-card">
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No tickets found</h3>
            <p className="text-muted-foreground">
              {selectedStatus === "all" 
                ? `You don't have any tickets yet.`
                : `No tickets with status "${selectedStatus.replace('_', ' ')}".`
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map((ticket: any) => (
            <Card key={ticket.id} className="security-card hover:bg-card/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{ticket.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <span>{ticket.ticketId}</span>
                      <span>•</span>
                      <span>{ticket.category}</span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(ticket.status)}
                    {getStatusBadge(ticket.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {ticket.description}
                </p>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">
                      Severity: <span className={`font-medium ${
                        ticket.severity === 'critical' ? 'text-destructive' :
                        ticket.severity === 'high' ? 'text-destructive' :
                        ticket.severity === 'medium' ? 'text-warning' :
                        'text-success'
                      }`}>{ticket.severity}</span>
                    </span>
                    <span className="text-muted-foreground">
                      Stake: <span className="font-medium text-accent">{ticket.stakeAmount} IOTA</span>
                    </span>
                  </div>
                  <span className="text-muted-foreground">
                    {new Date(ticket.submittedAt).toLocaleDateString()}
                  </span>
                </div>

                {ticket.iotaTransactionHash && (
                  <div className="flex items-center gap-2 text-xs text-success">
                    <CheckCircle className="h-3 w-3" />
                    <span>Anchored on IOTA: {ticket.iotaTransactionHash.slice(0, 10)}...</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketsDashboard;