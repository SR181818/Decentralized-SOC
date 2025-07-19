
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCurrentAccount, useIotaClient, useSignTransaction } from "@iota/dapp-kit";
import { createContractService, CONTRACT_PACKAGE_ID } from "@/lib/contract";
import { Upload, Hash, Shield } from "lucide-react";

interface TicketFormProps {
  onSubmit: (ticketData: any) => void;
  onCancel: () => void;
}

const TicketForm = ({ onSubmit, onCancel }: TicketFormProps) => {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    evidenceFile: null as File | null,
    stakeAmount: "10"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evidenceHash, setEvidenceHash] = useState("");
  
  const { toast } = useToast();
  const currentAccount = useCurrentAccount();
  const client = useIotaClient();
  const { mutate: signTransaction } = useSignTransaction();

  const categories = [
    "Malware Detection",
    "Phishing Attack",
    "Data Breach",
    "Network Intrusion", 
    "Ransomware",
    "Social Engineering",
    "Insider Threat",
    "DDoS Attack",
    "Other"
  ];

  // Hash file content for evidence
  const hashFile = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, evidenceFile: file }));
      try {
        const hash = await hashFile(file);
        setEvidenceHash(hash);
        toast({
          title: "Evidence Processed",
          description: "File has been hashed for blockchain storage"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to process evidence file",
          variant: "destructive"
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentAccount) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return;
    }

    if (!formData.evidenceFile || !evidenceHash) {
      toast({
        title: "Error", 
        description: "Please upload evidence file",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const contractService = createContractService(client);
      
      // First create stake token
      const stakeAmount = parseInt(formData.stakeAmount);
      const stakeTransaction = await contractService.createStake(
        stakeAmount, 
        currentAccount.address
      );

      // Sign and execute stake transaction
      signTransaction(
        {
          transaction: stakeTransaction,
          chain: "iota:testnet"
        },
        {
          onSuccess: async (stakeResult) => {
            toast({
              title: "Stake Created",
              description: `Staked ${stakeAmount} IOTA tokens`
            });

            // Now create the ticket
            // Note: In production, you'd get the actual store ID and stake token ID from the blockchain
            const mockStoreId = "0x1"; // Replace with actual store ID
            const mockStakeTokenId = stakeResult.digest; // Use transaction digest as mock ID
            
            const ticketTransaction = await contractService.createTicket(
              mockStoreId,
              mockStakeTokenId,
              evidenceHash,
              formData.title,
              formData.description,
              formData.category,
              stakeAmount,
              currentAccount.address
            );

            // Sign and execute ticket transaction
            signTransaction(
              {
                transaction: ticketTransaction,
                chain: "iota:testnet"
              },
              {
                onSuccess: (ticketResult) => {
                  toast({
                    title: "Ticket Submitted Successfully",
                    description: `Transaction: ${ticketResult.digest}`
                  });

                  onSubmit({
                    ...formData,
                    evidenceHash,
                    stakeAmount,
                    transactionHash: ticketResult.digest,
                    walletAddress: currentAccount.address
                  });
                },
                onError: (error) => {
                  console.error("Ticket creation failed:", error);
                  toast({
                    title: "Ticket Creation Failed",
                    description: error.message || "Failed to create ticket",
                    variant: "destructive"
                  });
                  setIsSubmitting(false);
                }
              }
            );
          },
          onError: (error) => {
            console.error("Stake creation failed:", error);
            toast({
              title: "Stake Creation Failed", 
              description: error.message || "Failed to create stake",
              variant: "destructive"
            });
            setIsSubmitting(false);
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
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Submit Security Incident Report
        </CardTitle>
        <CardDescription>
          Report a cybersecurity incident with evidence for analysis
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

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select incident category" />
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
            <Label htmlFor="description">Detailed Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Provide detailed information about the incident, including timeline, affected systems, and potential impact"
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="evidence">Evidence File</Label>
            <div className="border-2 border-dashed border-muted rounded-lg p-4">
              <div className="flex items-center gap-4">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div className="flex-1">
                  <Input
                    id="evidence"
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt,.zip"
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload logs, screenshots, or other evidence (Max 10MB)
                  </p>
                </div>
              </div>
              {evidenceHash && (
                <div className="mt-4 p-3 bg-muted rounded-md">
                  <div className="flex items-center gap-2 text-sm">
                    <Hash className="h-4 w-4" />
                    <span className="font-medium">Evidence Hash:</span>
                  </div>
                  <p className="text-xs font-mono mt-1 break-all">{evidenceHash}</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stake">Stake Amount (IOTA)</Label>
            <Input
              id="stake"
              type="number"
              value={formData.stakeAmount}
              onChange={(e) => setFormData(prev => ({ ...prev, stakeAmount: e.target.value }))}
              min="1"
              required
            />
            <p className="text-sm text-muted-foreground">
              Minimum stake required to submit a ticket. Higher stakes may receive priority.
            </p>
          </div>

          <div className="flex gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !evidenceHash}
              className="flex-1"
            >
              {isSubmitting ? "Submitting..." : "Submit Ticket"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TicketForm;
