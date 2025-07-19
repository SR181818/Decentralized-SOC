
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { useToast } from "@/hooks/use-toast";
import { useCurrentAccount, useIotaClient, useSignTransaction } from "@iota/dapp-kit";
import { createContractService, TICKET_STATUS, TICKET_STATUS_LABELS } from "@/lib/contract";
import { DbTicket } from "@/lib/supabase";
import { 
  Search, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User,
  Hash,
  Coins
} from "lucide-react";

interface TicketListProps {
  userRole: string;
  onTicketUpdate: (ticketData: any) => void;
}

const TicketList = ({ userRole, onTicketUpdate }: TicketListProps) => {
  const [tickets, setTickets] = useState<DbTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<DbTicket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reportHash, setReportHash] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { toast } = useToast();
  const currentAccount = useCurrentAccount();
  const client = useIotaClient();
  const { mutate: signTransaction } = useSignTransaction();

  useEffect(() => {
    if (currentAccount) {
      loadTickets();
    }
  }, [currentAccount, userRole]);

  const loadTickets = async () => {
    if (!currentAccount) return;
    
    setIsLoading(true);
    try {
      const contractService = createContractService(client);
      const userTickets = await contractService.getTicketsForUser(
        currentAccount.address, 
        userRole
      );
      setTickets(userTickets);
    } catch (error) {
      console.error("Failed to load tickets:", error);
      toast({
        title: "Error",
        description: "Failed to load tickets",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignTicket = async (ticket: DbTicket) => {
    if (!currentAccount || userRole !== "analyst") return;

    setIsSubmitting(true);
    try {
      const contractService = createContractService(client);
      const mockStoreId = "0x1"; // Replace with actual store ID
      
      const transaction = await contractService.assignAnalyst(
        mockStoreId,
        ticket.ticket_id,
        currentAccount.address
      );

      signTransaction(
        {
          transaction,
          chain: "iota:testnet"
        },
        {
          onSuccess: (result) => {
            toast({
              title: "Ticket Assigned",
              description: `You are now assigned to ticket #${ticket.ticket_id}`
            });
            loadTickets();
            onTicketUpdate({ ...ticket, status: TICKET_STATUS.CLAIMED });
          },
          onError: (error) => {
            console.error("Assignment failed:", error);
            toast({
              title: "Assignment Failed",
              description: error.message || "Failed to assign ticket",
              variant: "destructive"
            });
          }
        }
      );
    } catch (error: any) {
      console.error("Transaction preparation failed:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to prepare transaction",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReport = async (ticket: DbTicket) => {
    if (!currentAccount || !reportHash.trim()) return;

    setIsSubmitting(true);
    try {
      const contractService = createContractService(client);
      const mockStoreId = "0x1"; // Replace with actual store ID
      
      const transaction = await contractService.submitReport(
        mockStoreId,
        ticket.ticket_id,
        reportHash,
        currentAccount.address
      );

      signTransaction(
        {
          transaction,
          chain: "iota:testnet"
        },
        {
          onSuccess: (result) => {
            toast({
              title: "Report Submitted",
              description: `Report submitted for ticket #${ticket.ticket_id}`
            });
            setReportHash("");
            setSelectedTicket(null);
            loadTickets();
            onTicketUpdate({ ...ticket, status: TICKET_STATUS.SUBMITTED });
          },
          onError: (error) => {
            console.error("Report submission failed:", error);
            toast({
              title: "Submission Failed",
              description: error.message || "Failed to submit report",
              variant: "destructive"
            });
          }
        }
      );
    } catch (error: any) {
      console.error("Transaction preparation failed:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to prepare transaction",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleValidateTicket = async (ticket: DbTicket, approved: boolean) => {
    if (!currentAccount || userRole !== "client") return;

    setIsSubmitting(true);
    try {
      const contractService = createContractService(client);
      const mockStoreId = "0x1"; // Replace with actual store ID
      
      const transaction = await contractService.validateTicket(
        mockStoreId,
        ticket.ticket_id,
        approved,
        currentAccount.address
      );

      signTransaction(
        {
          transaction,
          chain: "iota:testnet"
        },
        {
          onSuccess: (result) => {
            toast({
              title: approved ? "Ticket Approved" : "Ticket Rejected",
              description: `Ticket #${ticket.ticket_id} has been ${approved ? 'approved' : 'rejected'}`
            });
            loadTickets();
            onTicketUpdate({ 
              ...ticket, 
              status: approved ? TICKET_STATUS.APPROVED : TICKET_STATUS.REJECTED 
            });
          },
          onError: (error) => {
            console.error("Validation failed:", error);
            toast({
              title: "Validation Failed",
              description: error.message || "Failed to validate ticket",
              variant: "destructive"
            });
          }
        }
      );
    } catch (error: any) {
      console.error("Transaction preparation failed:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to prepare transaction",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeVariant = (status: number) => {
    switch (status) {
      case TICKET_STATUS.OPEN: return "secondary";
      case TICKET_STATUS.CLAIMED: return "default";
      case TICKET_STATUS.SUBMITTED: return "outline";
      case TICKET_STATUS.APPROVED: return "default";
      case TICKET_STATUS.REJECTED: return "destructive";
      default: return "secondary";
    }
  };

  const getActionButtons = (ticket: DbTicket) => {
    switch (userRole) {
      case "analyst":
        if (ticket.status === TICKET_STATUS.OPEN) {
          return (
            <Button 
              size="sm" 
              onClick={() => handleAssignTicket(ticket)}
              disabled={isSubmitting}
            >
              Assign to Me
            </Button>
          );
        }
        if (ticket.status === TICKET_STATUS.CLAIMED && ticket.analyst_address === currentAccount?.address) {
          return (
            <Button 
              size="sm" 
              onClick={() => setSelectedTicket(ticket)}
            >
              Submit Report
            </Button>
          );
        }
        break;
      case "client":
        if (ticket.status === TICKET_STATUS.SUBMITTED && ticket.client_address === currentAccount?.address) {
          return (
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="default"
                onClick={() => handleValidateTicket(ticket, true)}
                disabled={isSubmitting}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => handleValidateTicket(ticket, false)}
                disabled={isSubmitting}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </div>
          );
        }
        break;
      case "certifier":
        // Certifiers can review escalated tickets
        if (ticket.status === TICKET_STATUS.SUBMITTED) {
          return (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setSelectedTicket(ticket)}
            >
              <Eye className="h-4 w-4 mr-1" />
              Review
            </Button>
          );
        }
        break;
    }
    return null;
  };

  const filteredTickets = tickets.filter(ticket =>
    ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.ticket_id.toString().includes(searchTerm)
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Tickets...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            {userRole === "client" && "My Tickets"}
            {userRole === "analyst" && "Assigned Tickets"}
            {userRole === "certifier" && "Tickets for Review"}
          </CardTitle>
          <CardDescription>
            {userRole === "client" && "Track your submitted security incidents"}
            {userRole === "analyst" && "Analyze and resolve security tickets"}
            {userRole === "certifier" && "Review and certify completed analyses"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search tickets by ID, title, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
          
          {filteredTickets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "No tickets match your search" : "No tickets found"}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTickets.map((ticket) => (
                <Card key={ticket.id} className="border-l-4 border-l-primary">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">#{ticket.ticket_id}</h3>
                          <Badge variant={getStatusBadgeVariant(ticket.status)}>
                            {TICKET_STATUS_LABELS[ticket.status]}
                          </Badge>
                        </div>
                        <h4 className="font-medium">{ticket.title}</h4>
                        <p className="text-sm text-muted-foreground">{ticket.category}</p>
                      </div>
                      {getActionButtons(ticket)}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>Client: {ticket.client_address.slice(0, 8)}...</span>
                      </div>
                      {ticket.analyst_address && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>Analyst: {ticket.analyst_address.slice(0, 8)}...</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Coins className="h-4 w-4" />
                        <span>Stake: {ticket.stake_amount} IOTA</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-sm">{ticket.description}</p>
                    </div>
                    
                    <div className="mt-4 p-3 bg-muted rounded-md">
                      <div className="flex items-center gap-2 text-sm">
                        <Hash className="h-4 w-4" />
                        <span className="font-medium">Evidence Hash:</span>
                      </div>
                      <p className="text-xs font-mono mt-1 break-all">{ticket.evidence_hash}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Submission Modal */}
      {selectedTicket && userRole === "analyst" && (
        <Card>
          <CardHeader>
            <CardTitle>Submit Analysis Report</CardTitle>
            <CardDescription>
              Provide your analysis for ticket #{selectedTicket.ticket_id}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="reportHash">Report Hash</Label>
                <Textarea
                  id="reportHash"
                  value={reportHash}
                  onChange={(e) => setReportHash(e.target.value)}
                  placeholder="Enter the hash of your analysis report..."
                  rows={3}
                />
              </div>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedTicket(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleSubmitReport(selectedTicket)}
                  disabled={!reportHash.trim() || isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "Submitting..." : "Submit Report"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TicketList;
