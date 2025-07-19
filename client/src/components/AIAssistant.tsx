import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Brain, 
  Send, 
  Sparkles, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Zap
} from "lucide-react";

interface AIAnalysis {
  threatLevel: "Low" | "Medium" | "High" | "Critical";
  confidence: number;
  findings: string[];
  recommendations: string[];
  timeToAnalyze: string;
}

export default function AIAssistant() {
  const [query, setQuery] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const { toast } = useToast();

  const runAIAnalysis = async () => {
    if (!query.trim()) {
      toast({
        title: "Error",
        description: "Please enter a security incident description",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    // Simulate AI analysis with mock responses
    setTimeout(() => {
      const mockAnalysis: AIAnalysis = {
        threatLevel: Math.random() > 0.7 ? "Critical" : Math.random() > 0.5 ? "High" : Math.random() > 0.3 ? "Medium" : "Low",
        confidence: Math.round(75 + Math.random() * 20), // 75-95%
        findings: [
          "Potential indicators of advanced persistent threat (APT) activity detected",
          "Unusual network traffic patterns consistent with data exfiltration",
          "Evidence of lateral movement using compromised credentials",
          "Possible use of living-off-the-land techniques to evade detection"
        ],
        recommendations: [
          "Immediately isolate affected systems from the network",
          "Force password reset for all potentially compromised accounts",
          "Deploy additional monitoring on critical infrastructure",
          "Conduct forensic imaging of affected systems",
          "Implement network segmentation to prevent lateral movement"
        ],
        timeToAnalyze: `${Math.round(2 + Math.random() * 8)} seconds`
      };

      setAnalysis(mockAnalysis);
      setIsAnalyzing(false);

      toast({
        title: "Analysis Complete",
        description: `AI analysis completed in ${mockAnalysis.timeToAnalyze}`,
      });
    }, 3000);
  };

  const getThreatColor = (level: string) => {
    switch (level) {
      case "Critical": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "High": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "Medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Low": return "bg-green-500/20 text-green-400 border-green-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getThreatIcon = (level: string) => {
    switch (level) {
      case "Critical": return <AlertTriangle className="h-4 w-4" />;
      case "High": return <AlertTriangle className="h-4 w-4" />;
      case "Medium": return <Clock className="h-4 w-4" />;
      case "Low": return <CheckCircle className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Assistant Header */}
      <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-purple-400">AI Security Assistant</CardTitle>
              <CardDescription className="text-gray-400">
                Advanced threat analysis and security recommendations powered by AI
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Input Section */}
      <Card className="bg-slate-800/50 border-gray-600/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Describe Security Incident</CardTitle>
          <CardDescription className="text-gray-400">
            Provide details about the security incident for AI-powered analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe the security incident, symptoms, affected systems, timeline, and any relevant technical details..."
            rows={6}
            className="bg-slate-700/50 border-gray-600 text-white focus:border-purple-400"
          />

          <Button
            onClick={runAIAnalysis}
            disabled={isAnalyzing || !query.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3"
          >
            {isAnalyzing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing with AI...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Run AI Analysis
                <Send className="h-4 w-4" />
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <Card className="bg-slate-800/50 border-gray-600/30 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">AI Analysis Results</CardTitle>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  <Zap className="h-3 w-3 mr-1" />
                  {analysis.confidence}% Confidence
                </Badge>
                <Badge className={getThreatColor(analysis.threatLevel)}>
                  <div className="flex items-center gap-1">
                    {getThreatIcon(analysis.threatLevel)}
                    {analysis.threatLevel} Risk
                  </div>
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Key Findings */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-400" />
                Key Findings
              </h3>
              <ul className="space-y-2">
                {analysis.findings.map((finding, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-300">
                    <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0" />
                    {finding}
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-400" />
                Recommended Actions
              </h3>
              <ul className="space-y-2">
                {analysis.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>

            {/* Analysis Metadata */}
            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-400 text-sm">Analysis Time</span>
                  <div className="text-white font-semibold">{analysis.timeToAnalyze}</div>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Threat Classification</span>
                  <div className="text-white font-semibold">{analysis.threatLevel} Risk</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Capabilities */}
      <Card className="bg-slate-800/50 border-blue-500/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-blue-400">AI Assistant Capabilities</CardTitle>
          <CardDescription className="text-gray-400">
            Advanced features for comprehensive security analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
              <Brain className="h-5 w-5 text-purple-400 mt-0.5" />
              <div>
                <h4 className="text-white font-semibold">Threat Analysis</h4>
                <p className="text-sm text-gray-400">Advanced pattern recognition for APT detection</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
              <Shield className="h-5 w-5 text-green-400 mt-0.5" />
              <div>
                <h4 className="text-white font-semibold">Mitigation Planning</h4>
                <p className="text-sm text-gray-400">Automated response recommendations</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
              <Zap className="h-5 w-5 text-yellow-400 mt-0.5" />
              <div>
                <h4 className="text-white font-semibold">Real-time Processing</h4>
                <p className="text-sm text-gray-400">Sub-10 second analysis completion</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-orange-400 mt-0.5" />
              <div>
                <h4 className="text-white font-semibold">Risk Assessment</h4>
                <p className="text-sm text-gray-400">Multi-factor threat level calculation</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}