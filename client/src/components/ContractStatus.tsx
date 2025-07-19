import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useWallet } from "@/hooks/useWallet";
import { Shield, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";

const ContractStatus = () => {
  const { contractService, isContractVerified, client } = useWallet();
  const [isChecking, setIsChecking] = useState(false);
  const [contractDetails, setContractDetails] = useState<any>(null);

  const checkContractStatus = async () => {
    if (!contractService) return;

    setIsChecking(true);
    try {
      const isVerified = await contractService.verifyContract();
      if (isVerified) {
        // Try to get some contract info (this would be specific to your contract implementation)
        setContractDetails({
          packageId: "0xbec69147e6d51ff32994389b52eb3ee10a7414d07801bb9d5aaa1ba1c6e6b345",
          network: "IOTA Testnet",
          lastChecked: new Date().toLocaleTimeString()
        });
      }
    } catch (error) {
      console.error("Contract check failed:", error);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (contractService) {
      checkContractStatus();
    }
  }, [contractService]);

  return (
    <Card className="security-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Smart Contract Status
        </CardTitle>
        <CardDescription>
          dSOC blockchain contract connection and verification
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isContractVerified ? (
              <CheckCircle className="h-4 w-4 text-success" />
            ) : (
              <AlertCircle className="h-4 w-4 text-warning" />
            )}
            <span className="font-medium">
              {isContractVerified ? "Connected" : "Disconnected"}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={checkContractStatus}
            disabled={isChecking}
          >
            {isChecking ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
            Refresh
          </Button>
        </div>

        {contractDetails && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Package ID:</span>
              <code className="text-xs bg-muted px-1 py-0.5 rounded">
                {contractDetails.packageId.slice(0, 8)}...
              </code>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Network:</span>
              <Badge variant="outline">{contractDetails.network}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Checked:</span>
              <span>{contractDetails.lastChecked}</span>
            </div>
          </div>
        )}

        {!isContractVerified && (
          <div className="p-3 bg-warning/10 border border-warning/20 rounded-md">
            <p className="text-sm text-warning">
              Contract verification failed. Please ensure you're connected to IOTA Testnet.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContractStatus;