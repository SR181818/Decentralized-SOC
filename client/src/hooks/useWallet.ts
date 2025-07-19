import { useState, useEffect } from "react";
import { useCurrentAccount, useIotaClient, useSignTransaction } from "@iota/dapp-kit";
import { createContractService, ContractService } from "@/lib/contract";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  contractService: ContractService | null;
  isContractVerified: boolean;
  userRole: string | null;
  userId: number | null;
  dbUser: any | null;
}

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    contractService: null,
    isContractVerified: false,
    userRole: null,
    userId: null,
    dbUser: null,
  });

  const currentAccount = useCurrentAccount();
  const client = useIotaClient();
  const { mutate: signTransaction } = useSignTransaction();
  const { toast } = useToast();

  // Mock role assignment (in production, this would query IOTA Identity or contract)
  const mockRoles = ["client", "analyst", "certifier"];

  useEffect(() => {
    const initializeWallet = async () => {
      if (currentAccount && client) {
        const contractService = createContractService(client);
        
        // Verify contract exists
        const isVerified = await contractService.verifyContract();
        
        if (!isVerified) {
          toast({
            title: "Contract Connection Issue",
            description: "Unable to connect to the dSOC smart contract. Please check your network connection.",
            variant: "destructive",
          });
        }

        // Check if user exists in database or create new user
        let dbUser;
        try {
          dbUser = await apiRequest(`/api/users/${currentAccount.address}`);
        } catch (error) {
          // User doesn't exist, create new user
          const randomRole = mockRoles[Math.floor(Math.random() * mockRoles.length)];
          dbUser = await apiRequest('/api/users', {
            method: 'POST',
            body: JSON.stringify({
              walletAddress: currentAccount.address,
              userRole: randomRole,
              stakingBalance: 0,
            }),
          });
        }

        setWalletState({
          isConnected: true,
          address: currentAccount.address,
          contractService,
          isContractVerified: isVerified,
          userRole: dbUser.userRole,
          userId: dbUser.id,
          dbUser,
        });

        toast({
          title: "Wallet Connected",
          description: `Connected as ${dbUser.userRole} | Contract: ${isVerified ? "✓" : "✗"}`,
        });
      } else {
        setWalletState({
          isConnected: false,
          address: null,
          contractService: null,
          isContractVerified: false,
          userRole: null,
          userId: null,
          dbUser: null,
        });
      }
    };

    initializeWallet();
  }, [currentAccount, client, toast]);

  const executeTransaction = async (
    transactionBuilder: () => Promise<any>,
    successMessage: string
  ) => {
    try {
      if (!walletState.contractService || !walletState.isContractVerified) {
        throw new Error("Contract service not available");
      }

      const transaction = await transactionBuilder();
      
      return new Promise((resolve, reject) => {
        signTransaction(
          { transaction },
          {
            onSuccess: (result) => {
              toast({
                title: "Transaction Successful",
                description: successMessage,
              });
              resolve(result);
            },
            onError: (error) => {
              toast({
                title: "Transaction Failed",
                description: error.message || "Failed to execute transaction",
                variant: "destructive",
              });
              reject(error);
            },
          }
        );
      });
    } catch (error) {
      toast({
        title: "Transaction Error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    ...walletState,
    executeTransaction,
    client,
  };
};