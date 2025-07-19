import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CONTRACT_PACKAGE_ID, MODULE_NAME, CLT_MODULE_NAME } from "@/lib/contract";
import { Settings, Copy, ExternalLink } from "lucide-react";

const ContractSettings = () => {
  const [contractConfig, setContractConfig] = useState({
    packageId: CONTRACT_PACKAGE_ID,
    moduleName: MODULE_NAME,
    cltModuleName: CLT_MODULE_NAME,
    ticketStoreId: "", // This would be set by the user
  });
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: `${label} copied successfully`,
    });
  };

  const openExplorer = (objectId: string) => {
    // Open IOTA explorer (testnet)
    window.open(`https://explorer.iota.org/testnet/object/${objectId}`, '_blank');
  };

  return (
    <Card className="security-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Contract Configuration
        </CardTitle>
        <CardDescription>
          dSOC smart contract details and configuration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <Label className="text-sm font-medium">Package ID</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={contractConfig.packageId}
                onChange={(e) => setContractConfig(prev => ({ ...prev, packageId: e.target.value }))}
                className="font-mono text-xs"
                readOnly
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(contractConfig.packageId, "Package ID")}
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openExplorer(contractConfig.packageId)}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">SOC Module</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={contractConfig.moduleName}
                  className="font-mono text-xs"
                  readOnly
                />
                <Badge variant="outline">Main</Badge>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">CLT Module</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={contractConfig.cltModuleName}
                  className="font-mono text-xs"
                  readOnly
                />
                <Badge variant="outline">Rewards</Badge>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Ticket Store ID</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={contractConfig.ticketStoreId}
                onChange={(e) => setContractConfig(prev => ({ ...prev, ticketStoreId: e.target.value }))}
                placeholder="Enter your ticket store object ID"
                className="font-mono text-xs"
              />
              {contractConfig.ticketStoreId && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(contractConfig.ticketStoreId, "Store ID")}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openExplorer(contractConfig.ticketStoreId)}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              The ticket store object ID from your deployed contract instance
            </p>
          </div>
        </div>

        <div className="p-3 bg-primary/10 border border-primary/20 rounded-md">
          <h4 className="text-sm font-medium mb-2">Contract Functions Available:</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Badge variant="outline">create_stake</Badge>
            <Badge variant="outline">create_ticket</Badge>
            <Badge variant="outline">assign_analyst</Badge>
            <Badge variant="outline">submit_report</Badge>
            <Badge variant="outline">validate_ticket</Badge>
            <Badge variant="outline">mint_clt</Badge>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>• Network: IOTA Testnet</p>
          <p>• Framework: Move Smart Contracts</p>
          <p>• Wallet: IOTA dApp Kit Integration</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContractSettings;