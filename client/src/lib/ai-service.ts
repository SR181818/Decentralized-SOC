import { GoogleGenAI } from "@google/genai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

console.log('AI API Key status:', API_KEY ? 'loaded' : 'missing');

if (!API_KEY) {
  console.warn('AI API Key not configured - AI features will be disabled');
}

const genAI = API_KEY ? new GoogleGenAI(API_KEY) : null;

export const aiService = {
  analyzeSecurityIncident: async (description: string) => {
    if (!genAI) {
      console.warn('AI service not available - API key not configured');
      return {
        error: 'AI service not configured',
        mockResponse: true
      };
    }
    
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(description);
      return result.response.text();
    } catch (error) {
      console.error('AI analysis error:', error);
      return {
        error: 'AI analysis failed',
        mockResponse: true
      };
    }
  }
};

class AIAssistantService {
  private model = genAI ? genAI.getGenerativeModel({ model: "gemini-2.5-flash" }) : null;

  async getSecurityNews(): Promise<string> {
    if (!genAI) {
        return `# Security Intelligence Update

## Current Security Landscape
The cybersecurity threat landscape continues to evolve rapidly with new vulnerabilities and attack vectors emerging daily.

## Key Areas of Focus
• **Smart Contract Security**: Continuous monitoring for vulnerabilities in DeFi protocols
• **Supply Chain Attacks**: Increased targeting of software dependencies
• **Zero-Day Exploits**: Advanced persistent threats utilizing unknown vulnerabilities

## dSOC Platform Benefits
Our decentralized SOC approach provides:
• **Distributed Analysis**: Multiple expert perspectives on security incidents
• **Blockchain Transparency**: Immutable records of security assessments
• **Incentivized Participation**: Stake-based rewards for quality security analysis

*Note: Connect to Gemini AI for real-time security intelligence updates.*`;
    }
    try {
      const prompt = `Provide the latest cybersecurity news and threat intelligence. Include:

1. **Current Threats & Vulnerabilities**
   - Latest CVEs and zero-days
   - Active ransomware campaigns
   - Supply chain attacks

2. **Security Research & Trends**
   - New attack techniques
   - Defensive innovations
   - Industry developments

3. **Smart Contract & Blockchain Security**
   - Recent DeFi exploits
   - Smart contract vulnerabilities
   - Blockchain security best practices

Format as markdown with clear headings and bullet points. Keep it concise but informative.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error fetching security news:', error);
      return `# Security Intelligence Update

## Current Security Landscape
The cybersecurity threat landscape continues to evolve rapidly with new vulnerabilities and attack vectors emerging daily.

## Key Areas of Focus
• **Smart Contract Security**: Continuous monitoring for vulnerabilities in DeFi protocols
• **Supply Chain Attacks**: Increased targeting of software dependencies
• **Zero-Day Exploits**: Advanced persistent threats utilizing unknown vulnerabilities

## dSOC Platform Benefits
Our decentralized SOC approach provides:
• **Distributed Analysis**: Multiple expert perspectives on security incidents
• **Blockchain Transparency**: Immutable records of security assessments
• **Incentivized Participation**: Stake-based rewards for quality security analysis

*Note: Connect to Gemini AI for real-time security intelligence updates.*`;
    }
  }

  async askQuestion(question: string): Promise<string> {
      if (!genAI) {
          return `I apologize, but I'm experiencing technical difficulties accessing the AI service. 

**Common Smart Contract Security Issues:**
• **Reentrancy Attacks**: Ensure proper state updates before external calls
• **Integer Overflow/Underflow**: Use SafeMath or newer Solidity versions
• **Access Control**: Implement proper role-based permissions
• **Front-running**: Consider commit-reveal schemes for sensitive operations

**dSOC Platform Security:**
Our decentralized approach enhances security through:
• **Multi-party Validation**: Multiple analysts review each incident
• **Immutable Records**: Blockchain-based audit trails
• **Economic Incentives**: Stake-based rewards encourage thorough analysis

Please try your question again, or check that the Gemini API key is properly configured.`;
      }
    try {
      const systemPrompt = `You are a cybersecurity expert AI assistant for the dSOC (Decentralized Security Operations Center) platform. 

Your expertise includes:
- Smart contract security auditing
- Vulnerability assessment and penetration testing
- Incident response and threat hunting
- Blockchain and DeFi security
- Bug bounty research methodologies
- Security operations center best practices

The dSOC platform uses:
- IOTA blockchain for decentralized ticket management
- Move smart contracts for secure operations
- Stake-based incentives for security analysts
- Multi-role validation (client, analyst, certifier)

Provide detailed, technical answers that help users understand cybersecurity concepts and best practices. Include practical examples when relevant.

User question: ${question}`;

      const result = await this.model.generateContent(systemPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error getting AI response:', error);
      return `I apologize, but I'm experiencing technical difficulties accessing the AI service. 

**Common Smart Contract Security Issues:**
• **Reentrancy Attacks**: Ensure proper state updates before external calls
• **Integer Overflow/Underflow**: Use SafeMath or newer Solidity versions
• **Access Control**: Implement proper role-based permissions
• **Front-running**: Consider commit-reveal schemes for sensitive operations

**dSOC Platform Security:**
Our decentralized approach enhances security through:
• **Multi-party Validation**: Multiple analysts review each incident
• **Immutable Records**: Blockchain-based audit trails
• **Economic Incentives**: Stake-based rewards encourage thorough analysis

Please try your question again, or check that the Gemini API key is properly configured.`;
    }
  }

  async analyzeVulnerability(description: string): Promise<string> {
      if (!genAI) {
          return "Unable to analyze vulnerability. Please ensure AI service is properly configured.";
      }
    try {
      const prompt = `Analyze this potential security vulnerability and provide a detailed assessment:

${description}

Please provide:
1. **Severity Assessment** (Critical/High/Medium/Low)
2. **Attack Vectors** - How this could be exploited
3. **Impact Analysis** - What damage could result
4. **Mitigation Strategies** - How to fix or prevent
5. **Detection Methods** - How to identify this vulnerability
6. **Similar Cases** - Examples from the wild if any

Format as structured markdown for a security analyst.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error analyzing vulnerability:', error);
      return "Unable to analyze vulnerability. Please ensure AI service is properly configured.";
    }
  }
}

export const aiAssistant = new AIAssistantService();

export async function analyzeSecurityIncident(
  title: string,
  description: string,
  category: string,
  evidenceHash?: string
): Promise<string> {
  if (!genAI) {
    return `
## Manual Analysis Required

**Incident:** ${title}
**Category:** ${category}

**Description:** ${description}

**Note:** AI analysis is currently unavailable. Please configure the VITE_GEMINI_API_KEY environment variable to enable AI-powered analysis.

**Manual Analysis Checklist:**
1. **Severity Assessment** - Evaluate based on potential impact
2. **Threat Classification** - Categorize the type of security threat
3. **Potential Impact Analysis** - Assess business and technical impact
4. **Recommended Immediate Actions** - Define containment steps
5. **Long-term Mitigation Strategies** - Plan preventive measures
6. **Additional Investigation Steps** - Outline further analysis needed
    `;
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
You are a cybersecurity expert analyzing a security incident. Please provide a comprehensive analysis of the following incident:

Title: ${title}
Category: ${category}
Description: ${description}
${evidenceHash ? `Evidence Hash: ${evidenceHash}` : ''}

Please provide:
1. **Severity Assessment** (Critical/High/Medium/Low)
2. **Threat Classification** 
3. **Potential Impact Analysis**
4. **Recommended Immediate Actions**
5. **Long-term Mitigation Strategies**
6. **Additional Investigation Steps**

Format your response in clear sections with actionable recommendations.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('AI Analysis Error:', error);
    return 'Unable to generate AI analysis at this time. Please try again later.';
  }
}