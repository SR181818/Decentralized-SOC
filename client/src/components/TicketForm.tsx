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
import { supabaseService } from "@/lib/supabase";
import { Upload, Hash, Shield, AlertTriangle, FileText, Coins } from "lucide-react";

// Dummy store ID - in production this would be from contract initialization
const TICKET_STORE_ID = "0x1234567890abcdef1234567890abcdef12345678";

interface TicketFormProps {
  onTicketSubmitted?: () => void;
}

export default function TicketForm({ onTicketSubmitted }: TicketFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [stakeAmount, setStakeAmount] = useState("1000"); // Default stake amount
  const [isSubmitting, setIsSubmitting] = useState(false);

  const account = useCurrentAccount();
  const client = useIotaClient();
  const { mutate: signTransaction } = useSignTransaction();
  const { toast } = useToast();
  


  const categories = [
    "Malware Detection",
    "Phishing Attack",
    "Data Breach",
    "DDoS Attack",
    "Insider Threat",
    "Network Intrusion",
    "Social Engineering",
    "Ransomware",
    "Other"
  ];

  const hashFile = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!account) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    if (!title || !description || !category || !evidenceFile) {
      toast({
        title: "Error",
        description: "Please fill in all fields and upload evidence",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Hash the evidence file
      const evidenceHash = await hashFile(evidenceFile);

      // Create contract service
      const contractService = createContractService(client);

      // Create transaction
      const transaction = await contractService.createTicket(
        TICKET_STORE_ID,
        evidenceHash,
        title,
        description,
        category,
        parseInt(stakeAmount),
        account.address
      );

      // Sign and submit transaction
      signTransaction(
        { transaction },
        {
          onSuccess: async (result) => {
            try {
              // Save ticket to Supabase database
              const ticketData = {
                ticket_id: Date.now(), // Temporary ID, should get from blockchain
                client_address: account.address,
                title,
                description,
                category,
                evidence_hash: evidenceHash,
                status: 0, // STATUS_OPEN
                stake_amount: parseInt(stakeAmount),
                transaction_hash: result.digest
              };

              await supabaseService.createTicket(ticketData);

              // Create transaction record
              await supabaseService.createTransaction({
                ticket_id: ticketData.ticket_id,
                from_address: account.address,
                transaction_hash: result.digest,
                transaction_type: 'CREATE_TICKET',
                amount: parseInt(stakeAmount),
                status: 'completed'
              });

              toast({
                title: "Success!",
                description: "Ticket submitted successfully to the blockchain and database",
              });

              // Reset form
              setTitle("");
              setDescription("");
              setCategory("");
              setEvidenceFile(null);
              setStakeAmount("100");

              onTicketSubmitted?.();
            } catch (dbError) {
              console.error('Database error:', dbError);
              toast({
                title: "Warning",
                description: "Ticket submitted to blockchain but failed to save to database",
                variant: "destructive",
              });
            }
          },
          onError: (error) => {
            console.error('Transaction failed:', error);
            toast({
              title: "Error",
              description: "Failed to submit ticket. Please try again.",
              variant: "destructive",
            });
          },
        }
      );

    } catch (error) {
      console.error('Error submitting ticket:', error);
      toast({
        title: "Error",
        description: "Failed to process ticket submission",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-purple-400">Submit Security Incident</CardTitle>
            <CardDescription className="text-gray-400">
              Report a cybersecurity incident for professional analysis
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Stake Amount */}
          <div className="space-y-2">
            <Label htmlFor="stake" className="text-gray-300 flex items-center gap-2">
              <Coins className="h-4 w-4 text-yellow-400" />
              Stake Amount (IOTA)
            </Label>
            <Input
              id="stake"
              type="number"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              min="1"
              className="bg-slate-700/50 border-gray-600 text-white focus:border-purple-400"
              placeholder="Enter stake amount"
            />
            <p className="text-sm text-gray-500">
              Stake tokens to incentivize quality analysis. Refunded if report is rejected.
            </p>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-gray-300">Incident Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-slate-700/50 border-gray-600 text-white focus:border-purple-400"
              placeholder="Brief description of the incident"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-gray-300">Incident Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-slate-700/50 border-gray-600 text-white focus:border-purple-400">
                <SelectValue placeholder="Select incident type" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-gray-600">
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat} className="text-white hover:bg-slate-700">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-300">Detailed Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="bg-slate-700/50 border-gray-600 text-white focus:border-purple-400"
              placeholder="Provide detailed information about the incident..."
            />
          </div>

          {/* Evidence Upload */}
          <div className="space-y-2">
            <Label htmlFor="evidence" className="text-gray-300 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Evidence File
            </Label>
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 hover:border-purple-400 transition-colors">
              <input
                type="file"
                id="evidence"
                onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)}
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.txt,.log"
              />
              <label htmlFor="evidence" className="cursor-pointer">
                <div className="text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300 mb-2">
                    {evidenceFile ? evidenceFile.name : "Click to upload evidence"}
                  </p>
                  <p className="text-sm text-gray-500">
                    PDF, images, text files, or log files
                  </p>
                </div>
              </label>
            </div>
            {evidenceFile && (
              <div className="flex items-center gap-2 text-sm text-green-400">
                <Hash className="h-4 w-4" />
                File will be cryptographically hashed for integrity verification
              </div>
            )}
          </div>

          {/* Security Notice */}
          <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
              <div>
                <h4 className="text-yellow-400 font-semibold mb-1">Security Notice</h4>
                <p className="text-sm text-gray-300">
                  Your evidence will be cryptographically hashed and stored on IOTA blockchain.
                  The file content remains private, only the hash is publicly verifiable.
                </p>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 rounded-lg transition-all duration-300"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting to Blockchain...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Submit Incident Report
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}