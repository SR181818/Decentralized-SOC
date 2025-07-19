import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/useWallet";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { FileText, Upload, Hash, Shield } from "lucide-react";
import CryptoJS from "crypto-js";

interface TicketFormProps {
  onSubmit: (ticket: any) => void;
  onCancel: () => void;
}

const TicketForm = ({ onSubmit, onCancel }: TicketFormProps) => {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    severity: "",
    file: null as File | null,
    fileHash: "",
    stakeAmount: "100" // Default stake amount
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { contractService, executeTransaction, isContractVerified, address, userId } = useWallet();

  const categories = [
    "Malware Detection",
    "Phishing Attack",
    "Data Breach",
    "Network Intrusion",
    "Suspicious Activity",
    "Vulnerability Assessment",
    "Incident Response",
    "Other"
  ];

  const severities = [
    { value: "low", label: "Low", color: "text-success" },
    { value: "medium", label: "Medium", color: "text-warning" },
    { value: "high", label: "High", color: "text-destructive" },
    { value: "critical", label: "Critical", color: "text-destructive font-bold" }
  ];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          const hash = CryptoJS.SHA256(content).toString();
          setFormData(prev => ({
            ...prev,
            file: file,
            fileHash: hash
          }));
        };
        reader.readAsText(file);
      } catch (error) {
        toast({
          title: "File Upload Error",
          description: "Failed to process file",
          variant: "destructive",
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    if (!isContractVerified || !contractService) {
      toast({
        title: "Contract Unavailable",
        description: "Smart contract is not accessible. Please check your network connection.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create evidence hash from form data
      const evidenceData = {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        severity: formData.severity,
        fileHash: formData.fileHash,
        timestamp: new Date().toISOString()
      };
      const evidenceHash = CryptoJS.SHA256(JSON.stringify(evidenceData)).toString();
      
      const stakeAmount = parseInt(formData.stakeAmount);

      // Create ticket in database first
      const ticketId = "TKT-" + Date.now();
      const ticketData = {
        ticketId,
        clientId: userId!,
        title: formData.title,
        category: formData.category,
        description: formData.description,
        severity: formData.severity,
        evidenceHash,
        fileName: formData.file?.name,
        stakeAmount,
        status: "open"
      };

      // Save ticket to database
      const savedTicket = await apiRequest('/api/tickets', {
        method: 'POST',
        body: JSON.stringify(ticketData),
      });

      // Execute blockchain transaction
      try {
        await executeTransaction(
          () => contractService.createStake(stakeAmount, address),
          `Ticket ${ticketId} submitted with ${stakeAmount} IOTA stake`
        );

        // Update ticket with blockchain transaction hash
        await apiRequest(`/api/tickets/${savedTicket.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            iotaTransactionHash: "0x" + evidenceHash.substring(0, 32),
            status: "pending_blockchain"
          }),
        });

        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['/api/tickets'] });
        queryClient.invalidateQueries({ queryKey: [`/api/tickets/user/${userId}`] });

        onSubmit(savedTicket);
      } catch (transactionError) {
        // Update ticket status to indicate blockchain failure
        await apiRequest(`/api/tickets/${savedTicket.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            status: "blockchain_failed"
          }),
        });
        console.error("Transaction failed:", transactionError);
      }
    } catch (error) {
      console.error("Ticket submission error:", error);
      toast({
        title: "Submission Failed",
        description: "Failed to prepare ticket submission",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="security-card max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Submit Security Incident
        </CardTitle>
        <CardDescription>
          Report a cybersecurity incident with cryptographic evidence anchoring
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Incident Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Brief description of the incident"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">Severity</Label>
              <Select value={formData.severity} onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  {severities.map((severity) => (
                    <SelectItem key={severity.value} value={severity.value}>
                      <span className={severity.color}>{severity.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Provide detailed information about the incident, including timeline, impact, and any preliminary findings..."
              rows={6}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Evidence File (Optional)</Label>
            <div className="flex items-center gap-4">
              <Input
                id="file"
                type="file"
                onChange={handleFileUpload}
                accept=".txt,.pdf,.doc,.docx,.png,.jpg,.jpeg"
                className="flex-1"
              />
              <Button type="button" variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
            {formData.fileHash && (
              <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-lg">
                <Hash className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">File Hash Generated</p>
                  <p className="text-xs text-muted-foreground font-mono">{formData.fileHash.substring(0, 32)}...</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="stakeAmount">Stake Amount (IOTA)</Label>
            <Input
              id="stakeAmount"
              type="number"
              value={formData.stakeAmount}
              onChange={(e) => setFormData(prev => ({ ...prev, stakeAmount: e.target.value }))}
              placeholder="Enter stake amount"
              min="1"
              required
            />
            <p className="text-xs text-muted-foreground">
              Required stake to submit ticket (minimum 1 IOTA)
            </p>
          </div>

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="security" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <Shield className="h-4 w-4 mr-2 animate-spin" />
                  Notarizing...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Submit & Notarize
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TicketForm;