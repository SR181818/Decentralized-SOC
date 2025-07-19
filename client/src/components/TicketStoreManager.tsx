
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCurrentAccount, useIotaClient, useSignTransaction } from "@iota/dapp-kit";
import { Transaction } from "@iota/iota-sdk/transactions";
import { CONTRACT_PACKAGE_ID, MODULE_NAME } from "@/lib/contract";
import { Database, Plus, CheckCircle, AlertTriangle } from "lucide-react";

interface TicketStoreManagerProps {
  onStoreReady: (storeId: string) => void;
}

export default function TicketStoreManager({ onStoreReady }: TicketStoreManagerProps) {
  const [storeId, setStoreId] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [hasStore, setHasStore] = useState(false);

  const account = useCurrentAccount();
  const client = useIotaClient();
  const { mutate: signTransaction } = useSignTransaction();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user already has a ticket store
    checkExistingStore();
  }, [account]);

  const checkExistingStore = async () => {
    if (!account) return;

    try {
      // In a real implementation, you would query the blockchain for existing stores
      // For now, we'll use localStorage as a demo
      const existingStoreId = localStorage.getItem(`ticketStore_${account.address}`);
      if (existingStoreId) {
        setStoreId(existingStoreId);
        setHasStore(true);
        onStoreReady(existingStoreId);
      }
    } catch (error) {
      console.error('Error checking existing store:', error);
    }
  };

  const createTicketStore = async () => {
    if (!account) return;

    setIsCreating(true);

    try {
      const tx = new Transaction();
      
      // Call the init function to create a new TicketStore
      tx.moveCall({
        target: `${CONTRACT_PACKAGE_ID}::${MODULE_NAME}::init`,
        arguments: [],
      });

      signTransaction(
        { transaction: tx },
        {
          onSuccess: (result) => {
            // In a real implementation, you would extract the store ID from the transaction result
            // For demo purposes, we'll generate a mock store ID
            const mockStoreId = `0x${Math.random().toString(16).slice(2, 42)}`;
            
            setStoreId(mockStoreId);
            setHasStore(true);
            
            // Store in localStorage for demo
            localStorage.setItem(`ticketStore_${account.address}`, mockStoreId);
            
            toast({
              title: "Success!",
              description: "Ticket store created successfully",
            });

            onStoreReady(mockStoreId);
          },
          onError: (error) => {
            console.error('Transaction failed:', error);
            toast({
              title: "Error",
              description: "Failed to create ticket store",
              variant: "destructive",
            });
          },
        }
      );
    } catch (error) {
      console.error('Error creating ticket store:', error);
      toast({
        title: "Error",
        description: "Failed to create ticket store",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (hasStore) {
    return (
      <Card className="bg-slate-800/50 border-green-500/30 backdrop-blur-sm mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div>
              <p className="text-green-400 font-medium">Ticket Store Active</p>
              <p className="text-sm text-gray-400">Store ID: {storeId.slice(0, 20)}...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 border-yellow-500/30 backdrop-blur-sm mb-6">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg">
            <Database className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-yellow-400">Initialize Ticket Store</CardTitle>
            <CardDescription className="text-gray-400">
              Create your ticket management store on the blockchain
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
              <div>
                <h4 className="text-yellow-400 font-semibold mb-1">Setup Required</h4>
                <p className="text-sm text-gray-300">
                  You need to create a ticket store before you can submit or manage tickets. 
                  This is a one-time setup that deploys your personal ticket management contract.
                </p>
              </div>
            </div>
          </div>

          <Button 
            onClick={createTicketStore}
            disabled={isCreating}
            className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white font-semibold py-3 rounded-lg"
          >
            {isCreating ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating Store...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Ticket Store
              </div>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

