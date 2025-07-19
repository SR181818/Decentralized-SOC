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
import { DbTicket, supabaseService } from "@/lib/supabase";
import { 
  Search, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User,
  Hash,
  Coins,
  FileText,
  AlertTriangle,
  Award,
  Shield
} from "lucide-react";

// Dummy store ID - in production this would be from contract initialization
const TICKET_STORE_ID = "0x1234567890abcdef1234567890abcdef12345678";

interface TicketListProps {
  userRole: string;
}

export default function TicketList({ userRole }: TicketListProps) {
  const [tickets, setTickets] = useState<DbTicket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<DbTicket[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<DbTicket | null>(null);
  const [reportText, setReportText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const account = useCurrentAccount();
  const client = useIotaClient();
  const { mutate: signTransaction } = useSignTransaction();
  const { toast } = useToast();

  useEffect(() => {
    loadTickets();
  }, [account, userRole]);

  useEffect(() => {
    filterTickets();
  }, [searchTerm, tickets]);

  const loadTickets = async () => {
    if (!account) return;

    try {
      // Load tickets from Supabase
      const userTickets = await supabaseService.getTicketsByUser(account.address, userRole);
      setTickets(userTickets);
    } catch (error) {
      console.error('Error loading tickets:', error);
      toast({
        title: "Error",
        description: "Failed to load tickets",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterTickets = () => {
    if (!searchTerm) {
      setFilteredTickets(tickets);
      return;
    }

    const filtered = tickets.filter(ticket =>
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTickets(filtered);
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case TICKET_STATUS.OPEN: return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case TICKET_STATUS.CLAIMED: return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case TICKET_STATUS.SUBMITTED: return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case TICKET_STATUS.APPROVED: return "bg-green-500/20 text-green-400 border-green-500/30";
      case TICKET_STATUS.REJECTED: return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusIcon = (status: number) => {
    switch (status) {
      case TICKET_STATUS.OPEN: return <Clock className="h-4 w-4" />;
      case TICKET_STATUS.CLAIMED: return <User className="h-4 w-4" />;
      case TICKET_STATUS.SUBMITTED: return <FileText className="h-4 w-4" />;
      case TICKET_STATUS.APPROVED: return <CheckCircle className="h-4 w-4" />;
      case TICKET_STATUS.REJECTED: return <XCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const handleClaimTicket = async (ticket: DbTicket) => {
    if (!account) return;

    try {
      setIsSubmitting(true);
      const contractService = createContractService(client);

      const transaction = await contractService.assignAnalyst(
        TICKET_STORE_ID,
        ticket.ticket_id,
        account.address
      );

      signTransaction(
        { transaction },
        {
          onSuccess: () => {
            toast({
              title: "Success!",
              description: "Ticket claimed successfully",
            });
            loadTickets();
          },
          onError: (error) => {
            console.error('Transaction failed:', error);
            toast({
              title: "Error",
              description: "Failed to claim ticket",
              variant: "destructive",
            });
          },
        }
      );
    } catch (error) {
      console.error('Error claiming ticket:', error);
      toast({
        title: "Error",
        description: "Failed to claim ticket",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReport = async (ticket: DbTicket) => {
    if (!account || !reportText.trim()) return;

    try {
      setIsSubmitting(true);

      // Hash the report
      const reportHash = await crypto.subtle.digest(
        'SHA-256', 
        new TextEncoder().encode(reportText)
      );
      const hashArray = Array.from(new Uint8Array(reportHash));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const contractService = createContractService(client);

      const transaction = await contractService.submitReport(
        TICKET_STORE_ID,
        ticket.ticket_id,
        hashHex,
        account.address
      );

      signTransaction(
        { transaction },
        {
          onSuccess: () => {
            toast({
              title: "Success!",
              description: "Report submitted successfully",
            });
            setSelectedTicket(null);
            setReportText("");
            loadTickets();
          },
          onError: (error) => {
            console.error('Transaction failed:', error);
            toast({
              title: "Error",
              description: "Failed to submit report",
              variant: "destructive",
            });
          },
        }
      );
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Error",
        description: "Failed to submit report",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleValidateTicket = async (ticket: DbTicket, approved: boolean) => {
    if (!account) return;

    try {
      setIsSubmitting(true);
      const contractService = createContractService(client);

      const transaction = await contractService.validateTicket(
        TICKET_STORE_ID,
        ticket.ticket_id,
        approved,
        account.address
      );

      signTransaction(
        { transaction },
        {
          onSuccess: () => {
            toast({
              title: "Success!",
              description: `Ticket ${approved ? 'approved' : 'rejected'} successfully`,
            });
            loadTickets();
          },
          onError: (error) => {
            console.error('Transaction failed:', error);
            toast({
              title: "Error",
              description: "Failed to validate ticket",
              variant: "destructive",
            });
          },
        }
      );
    } catch (error) {
      console.error('Error validating ticket:', error);
      toast({
        title: "Error",
        description: "Failed to validate ticket",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading tickets...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-purple-400">Security Tickets</CardTitle>
                <CardDescription className="text-gray-400">
                  {userRole === 'client' && 'Your submitted incident reports'}
                  {userRole === 'analyst' && 'Available tickets for analysis'}
                  {userRole === 'certifier' && 'Tickets awaiting certification'}
                </CardDescription>
              </div>
            </div>
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              {filteredTickets.length} tickets
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tickets by title, category, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-700/50 border-gray-600 text-white focus:border-purple-400"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tickets Grid */}
      <div className="grid gap-6">
        {filteredTickets.map((ticket) => (
          <Card key={ticket.id} className="bg-slate-800/50 border-gray-600/30 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-white">{ticket.title}</h3>
                    <Badge className={getStatusColor(ticket.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(ticket.status)}
                        {TICKET_STATUS_LABELS[ticket.status]}
                      </div>
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400">Category: {ticket.category}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Coins className="h-4 w-4 text-yellow-400" />
                      {ticket.stake_amount} IOTA
                    </span>
                    <span className="flex items-center gap-1">
                      <Hash className="h-4 w-4" />
                      #{ticket.ticket_id}
                    </span>
                    <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTicket(selectedTicket?.id === ticket.id ? null : ticket)}
                    className="border-gray-600 text-gray-300 hover:bg-slate-700"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    {selectedTicket?.id === ticket.id ? 'Hide' : 'View'}
                  </Button>
                </div>
              </div>
            </CardHeader>

            {selectedTicket?.id === ticket.id && (
              <CardContent className="border-t border-gray-700/50 pt-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-300 mb-2">Description</h4>
                    <p className="text-gray-400 text-sm">{ticket.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-300 mb-1">Evidence Hash</h4>
                      <p className="text-xs text-gray-500 font-mono break-all">{ticket.evidence_hash}</p>
                    </div>
                    {ticket.report_hash && (
                      <div>
                        <h4 className="font-medium text-gray-300 mb-1">Report Hash</h4>
                        <p className="text-xs text-gray-500 font-mono break-all">{ticket.report_hash}</p>
                      </div>
                    )}
                  </div>

                  {/* Role-specific actions */}
                  {userRole === 'analyst' && ticket.status === TICKET_STATUS.OPEN && (
                    <div className="flex justify-end">
                      <Button
                        onClick={() => handleClaimTicket(ticket)}
                        disabled={isSubmitting}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                      >
                        {isSubmitting ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        ) : (
                          <Shield className="h-4 w-4 mr-2" />
                        )}
                        Claim Ticket
                      </Button>
                    </div>
                  )}

                  {userRole === 'analyst' && ticket.status === TICKET_STATUS.CLAIMED && ticket.analyst_address === account?.address && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="report" className="text-gray-300">Analysis Report</Label>
                        <Textarea
                          id="report"
                          value={reportText}
                          onChange={(e) => setReportText(e.target.value)}
                          rows={4}
                          className="bg-slate-700/50 border-gray-600 text-white focus:border-purple-400"
                          placeholder="Enter your detailed analysis and recommendations..."
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button
                          onClick={() => handleSubmitReport(ticket)}
                          disabled={!reportText.trim() || isSubmitting}
                          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                        >
                          {isSubmitting ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          ) : (
                            <FileText className="h-4 w-4 mr-2" />
                          )}
                          Submit Report
                        </Button>
                      </div>
                    </div>
                  )}

                  {userRole === 'client' && ticket.status === TICKET_STATUS.SUBMITTED && ticket.client_address === account?.address && (
                    <div className="flex justify-end gap-3">
                      <Button
                        onClick={() => handleValidateTicket(ticket, false)}
                        disabled={isSubmitting}
                        variant="outline"
                        className="border-red-600 text-red-400 hover:bg-red-600/10"
                      >
                        {isSubmitting ? (
                          <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin mr-2" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-2" />
                        )}
                        Reject
                      </Button>
                      <Button
                        onClick={() => handleValidateTicket(ticket, true)}
                        disabled={isSubmitting}
                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                      >
                        {isSubmitting ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        ) : (
                          <Award className="h-4 w-4 mr-2" />
                        )}
                        Approve & Reward
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
{/* analyst actions */}
{userRole === 'analyst' && ticket.status === 0 && (
                    <Button 
                      size="sm" 
                      className="bg-cyan-600 hover:bg-cyan-700"
                      onClick={() => handleClaimTicket(ticket.ticket_id)}
                    >
                      Assign Self
                    </Button>
                  )}

                  {userRole === 'analyst' && ticket.status === 1 && ticket.analyst === account?.address && (
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleSubmitReport(ticket.ticket_id)}
                    >
                      Submit Report
                    </Button>
                  )}

                  {userRole === 'client' && ticket.status === 2 && ticket.client === account?.address && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleValidateTicket(ticket.ticket_id, true)}
                      >
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleValidateTicket(ticket.ticket_id, false)}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
          </Card>
        ))}

        {filteredTickets.length === 0 && (
          <Card className="bg-slate-800/50 border-gray-600/30 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">No tickets found</h3>
              <p className="text-gray-400">
                {searchTerm 
                  ? "Try adjusting your search terms" 
                  : userRole === 'client' 
                    ? "Submit your first incident report to get started"
                    : "No tickets available for analysis at the moment"
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}