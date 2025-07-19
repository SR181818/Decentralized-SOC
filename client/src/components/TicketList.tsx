import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCurrentAccount, useIotaClient, useSignTransaction } from "@iota/dapp-kit";
import { 
  Clock, 
  User, 
  AlertCircle, 
  CheckCircle, 
  Shield, 
  Eye, 
  MessageSquare,
  Hash,
  Calendar
} from "lucide-react";
import { createContractService, TICKET_STATUS } from "@/lib/contract";
import CryptoJS from "crypto-js";

interface Ticket {
  id: string;
  title: string;
  category: string;
  description: string;
  severity: string;
  status: string;
  submittedAt: string;
  fileHash?: string;
  fileName?: string;
  iotaHash?: string;
  assignedTo?: string;
  notes?: string;
}

interface TicketListProps {
  userRole: string;
  onTicketUpdate?: (ticket: Ticket) => void;
}

const TicketList = ({ userRole, onTicketUpdate }: TicketListProps) => {
  const { toast } = useToast();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [notes, setNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const currentAccount = useCurrentAccount();
  const client = useIotaClient();
  const { mutate: signTransaction } = useSignTransaction();

  // Mock ticket data
  const mockTickets: Ticket[] = [
    {
      id: "TKT-1703847291",
      title: "Suspicious Email Attachment Detected",
      category: "Malware Detection",
      description: "Employee received email with suspicious .exe attachment. Initial scan suggests potential malware.",
      severity: "high",
      status: userRole === "client" ? "in-progress" : "open",
      submittedAt: "2024-01-15T10:30:00Z",
      fileHash: "a1b2c3d4e5f6789012345678901234567890abcdef",
      fileName: "suspicious_email.eml",
      iotaHash: "0x9876543210abcdef1234567890abcdef",
      assignedTo: userRole === "analyst" ? "current-user" : "analyst-001"
    },
    {
      id: "TKT-1703847292",
      title: "Unusual Network Traffic Pattern",
      category: "Network Intrusion",
      description: "Detected abnormal outbound traffic during non-business hours. Potential data exfiltration attempt.",
      severity: "critical",
      status: userRole === "certifier" ? "escalated" : "completed",
      submittedAt: "2024-01-14T15:45:00Z",
      iotaHash: "0xabcdef1234567890abcdef1234567890",
      assignedTo: userRole === "certifier" ? "current-user" : "certifier-001"
    },
    {
      id: "TKT-1703847293",
      title: "Phishing Website Reported",
      category: "Phishing Attack",
      description: "Customer reported suspicious website mimicking our login page. URL needs investigation.",
      severity: "medium",
      status: "open",
      submittedAt: "2024-01-16T09:15:00Z",
      iotaHash: "0x1234567890abcdef1234567890abcdef"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "status-open";
      case "in-progress": return "status-in-progress";
      case "completed": return "status-completed";
      case "escalated": return "status-escalated";
      default: return "status-open";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low": return "text-success";
      case "medium": return "text-warning";
      case "high": return "text-destructive";
      case "critical": return "text-destructive font-bold";
      default: return "text-muted-foreground";
    }
  };

  const canTakeAction = (ticket: Ticket) => {
    if (userRole === "client") return false;
    if (userRole === "analyst" && ticket.status === "open") return true;
    if (userRole === "certifier" && ticket.status === "escalated") return true;
    return false;
  };

  const handleTicketAction = async (ticket: Ticket, action: string) => {
    if (!currentAccount) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const contractService = createContractService(client);
      
      // For demo purposes, we'll use a mock ticket store ID
      // In a real implementation, this would be retrieved from the contract
      const MOCK_TICKET_STORE_ID = "0x123456789abcdef"; // This would be the actual TicketStore object ID
      const ticketId = parseInt(ticket.id.replace("TKT-", "")) || 0;
      
      let newStatus = ticket.status;
      let message = "";
      
      switch (action) {
        case "analyze":
          // Call assign_analyst function
          const assignTransaction = await contractService.assignAnalyst(
            MOCK_TICKET_STORE_ID,
            ticketId,
            currentAccount.address
          );
          
          // For demo, we'll simulate the transaction
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          newStatus = "in-progress";
          message = "Ticket assigned to analyst";
          break;
          
        case "complete":
          // Call submit_report function
          const reportHash = CryptoJS.SHA256(notes || "Analysis completed").toString();
          const reportTransaction = await contractService.submitReport(
            MOCK_TICKET_STORE_ID,
            ticketId,
            reportHash,
            currentAccount.address
          );
          
          // For demo, we'll simulate the transaction
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          newStatus = "completed";
          message = "Ticket analysis completed and report submitted";
          break;
          
        case "escalate":
          // For escalation, we could modify the contract to handle this
          // For now, we'll just change the status
          newStatus = "escalated";
          message = "Ticket escalated to certifier";
          break;
          
        case "certify":
          // Call validate_ticket function
          const validateTransaction = await contractService.validateTicket(
            MOCK_TICKET_STORE_ID,
            ticketId,
            true, // approved
            currentAccount.address
          );
          
          // For demo, we'll simulate the transaction
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          newStatus = "certified";
          message = "Ticket certified and resolved";
          break;
      }
      
      const updatedTicket = { ...ticket, status: newStatus, notes };
      onTicketUpdate?.(updatedTicket);
      
      toast({
        title: "Ticket Updated",
        description: message,
      });
      
      setSelectedTicket(null);
      setNotes("");
    } catch (error) {
      console.error("Ticket action error:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update ticket on blockchain",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredTickets = mockTickets.filter(ticket => {
    if (userRole === "client") return true;
    if (userRole === "analyst") return ticket.assignedTo === "current-user" || ticket.status === "open";
    if (userRole === "certifier") return ticket.status === "escalated";
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-foreground">Security Tickets</h3>
          <p className="text-muted-foreground">
            {userRole === "client" ? "Your submitted tickets" : 
             userRole === "analyst" ? "Tickets assigned for analysis" : 
             "Tickets requiring certification"}
          </p>
        </div>
        <Badge variant="outline" className="text-accent border-accent">
          {filteredTickets.length} tickets
        </Badge>
      </div>

      <div className="grid gap-4">
        {filteredTickets.map((ticket) => (
          <Card key={ticket.id} className="security-card">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{ticket.title}</CardTitle>
                    <Badge className={getStatusColor(ticket.status)}>
                      {ticket.status.replace("-", " ")}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Hash className="h-3 w-3" />
                      {ticket.id}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(ticket.submittedAt).toLocaleDateString()}
                    </span>
                    <span className={`font-medium ${getSeverityColor(ticket.severity)}`}>
                      {ticket.severity.toUpperCase()}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTicket(selectedTicket?.id === ticket.id ? null : ticket)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Category</p>
                  <p className="text-sm">{ticket.category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Description</p>
                  <p className="text-sm">{ticket.description}</p>
                </div>
                {ticket.fileHash && (
                  <div className="flex items-center gap-2 p-2 bg-muted/20 rounded">
                    <Hash className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs font-medium">Evidence Hash</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {ticket.fileHash.substring(0, 24)}...
                      </p>
                    </div>
                  </div>
                )}
                {ticket.iotaHash && (
                  <div className="flex items-center gap-2 p-2 bg-primary/10 rounded">
                    <Shield className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs font-medium">IOTA Notarization</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {ticket.iotaHash}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {selectedTicket?.id === ticket.id && (
                <div className="mt-4 pt-4 border-t border-border space-y-4">
                  {canTakeAction(ticket) && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Analysis Notes
                        </label>
                        <Textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Add your analysis notes here..."
                          rows={3}
                          className="mt-1"
                        />
                      </div>
                      <div className="flex gap-2">
                        {userRole === "analyst" && (
                          <>
                            <Button
                              variant="security"
                              size="sm"
                              onClick={() => handleTicketAction(ticket, "analyze")}
                              disabled={isUpdating}
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Start Analysis
                            </Button>
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleTicketAction(ticket, "complete")}
                              disabled={isUpdating}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Complete
                            </Button>
                            <Button
                              variant="warning"
                              size="sm"
                              onClick={() => handleTicketAction(ticket, "escalate")}
                              disabled={isUpdating}
                            >
                              <AlertCircle className="h-4 w-4 mr-2" />
                              Escalate
                            </Button>
                          </>
                        )}
                        {userRole === "certifier" && (
                          <Button
                            variant="security"
                            size="sm"
                            onClick={() => handleTicketAction(ticket, "certify")}
                            disabled={isUpdating}
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            Certify & Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TicketList;