import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Shield, Search, CheckCircle } from "lucide-react";

interface RoleSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRole: (role: string) => void;
  availableRoles: string[];
}

const RoleSelectionModal = ({ isOpen, onClose, onSelectRole, availableRoles }: RoleSelectionModalProps) => {
  const roleInfo = {
    client: {
      title: "Client",
      description: "Submit security incidents and track their resolution",
      icon: Shield,
      features: ["Submit tickets", "Track progress", "View reports", "Manage stakes"]
    },
    analyst: {
      title: "Security Analyst", 
      description: "Analyze incidents and provide security assessments",
      icon: Search,
      features: ["Claim tickets", "Analyze evidence", "Submit reports", "Earn rewards"]
    },
    certifier: {
      title: "Certifier",
      description: "Validate analyst reports and approve resolutions", 
      icon: CheckCircle,
      features: ["Review reports", "Certify findings", "Escalate issues", "Highest rewards"]
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Select Your Role</DialogTitle>
          <DialogDescription className="text-center">
            Choose your role to access the dSOC platform. Each role has different permissions and responsibilities.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {availableRoles.map((role) => {
            const info = roleInfo[role as keyof typeof roleInfo];
            const IconComponent = info.icon;
            
            return (
              <Card 
                key={role} 
                className="security-card cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg"
                onClick={() => onSelectRole(role)}
              >
                <CardHeader className="text-center">
                  <IconComponent className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle className="text-lg">{info.title}</CardTitle>
                  <CardDescription>{info.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {info.features.map((feature, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-center">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full mt-4"
                    onClick={() => onSelectRole(role)}
                  >
                    Select {info.title}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>Your role determines what features you can access. You can change this later in settings.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoleSelectionModal;