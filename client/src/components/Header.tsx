import { Shield, Settings, Bell } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { ConnectButton } from "@iota/dapp-kit";

interface HeaderProps {
  walletAddress?: string;
  userRole?: string;
  onConnect: () => void;
}

const Header = ({ walletAddress, userRole, onConnect }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary pulse-glow" />
            <div>
              <h1 className="text-xl font-bold text-foreground">dSOC</h1>
              <p className="text-xs text-muted-foreground">Decentralized SOC Platform</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {walletAddress ? (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </p>
                {userRole && (
                  <p className="text-xs text-accent font-medium">{userRole}</p>
                )}
              </div>
              <Button variant="ghost" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <ConnectButton 
              connectText="Connect IOTA Wallet"
              className="font-semibold"
            />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;