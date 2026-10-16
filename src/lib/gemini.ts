/**
 * DBT-GUARD Google Gemini AI Integration Service
 * 
 * Powers:
 * 1. AI-Generated Bilingual Farmer SMS & Notification Scripts (Malayalam & English)
 * 2. Plain-Language PFMS / NPCI Banking Error Translation & Remediation Guidance
 * 3. Interactive Krishi Bhavan AI Copilot for Extension Officers & Desk Operators
 * 4. Automated Malayalam IVR Voice Synthesis Scripts
 */

const DEFAULT_API_KEY: string =
  (import.meta.env.VITE_GEMINI_API_KEY as string | undefined) || '';

const MODEL_NAME = 'gemini-2.5-flash';

export interface GeminiResponse {
  success: boolean;
  text: string;
  error?: string;
  tokensUsed?: number;
}

class GeminiAIService {
  private apiKey: string;

  constructor() {
    this.apiKey = this.loadApiKey();
  }

  private loadApiKey(): string {
    try {
      const stored = localStorage.getItem('dbt_guard_gemini_api_key');
      if (stored) return stored;
    } catch {
      // localStorage unavailable
    }
    return DEFAULT_API_KEY;
  }

  public setApiKey(key: string): void {
    this.apiKey = key.trim() || DEFAULT_API_KEY;
    try {
      localStorage.setItem('dbt_guard_gemini_api_key', this.apiKey);
    } catch {
      // ignore
    }
  }

  public getApiKey(): string {
    return this.apiKey;
  }

  /**
   * Core helper to call Google Gemini generateContent API
   */
  public async callGemini(prompt: string, systemInstruction?: string): Promise<GeminiResponse> {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${this.apiKey}`;

    const body: Record<string, any> = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 800,
      },
    };

    if (systemInstruction) {
      body.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error?.message || `HTTP error ${response.status}`);
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const tokensUsed = data.usageMetadata?.totalTokenCount;

      return {
        success: true,
        text: text.trim(),
        tokensUsed,
      };
    } catch (err: any) {
      return {
        success: false,
        text: '',
        error: err.message || 'Error communicating with Google Gemini API',
      };
    }
  }

  /**
   * Generate tailored bilingual (Malayalam / English) SMS notification
   */
  public async generateFarmerSms(
    farmerName: string,
    farmerNameMl: string,
    bankName: string,
    ruleCode: string,
    problemStatement: string,
    immediateNextAction: string,
    lang: 'ml' | 'en' = 'ml'
  ): Promise<GeminiResponse> {
    const systemPrompt = `You are the official agricultural communications expert for Kerala State Department of Agriculture (Krishi Bhavan Thrissur) and PM-KISAN Direct Benefit Transfer.
You write clear, respectful, trustworthy, plain-language SMS notifications for farmers in Kerala.
CRITICAL RULES:
- If language is Malayalam, output grammatically sound, natural spoken Malayalam in Malayalam script.
- If language is English, output concise, clear English.
- Keep the SMS under 160 characters if possible (or max 200).
- Must explicitly state the beneficiary's name, bank name, what is needed, and where to go.
- NEVER request OTPs, PINs, or bank account numbers.
- End with: കൃഷി ഭവൻ തൃശ്ശൂർ (or Krishi Bhavan Thrissur).
- Output ONLY the raw SMS message text without markdown or conversational preamble.`;

    const userPrompt = `Generate a ${lang === 'ml' ? 'Malayalam' : 'English'} official SMS notification for:
Farmer: ${farmerName} (${farmerNameMl})
Bank: ${bankName}
PM-KISAN Issue Rule: ${ruleCode}
Problem: ${problemStatement}
Next Action Required: ${immediateNextAction}`;

    return this.callGemini(userPrompt, systemPrompt);
  }

  /**
   * Explain technical banking & PFMS error codes in simple terms for farmers and officers
   */
  public async explainError(
    ruleCode: string,
    issueTitle: string,
    evidenceText: string
  ): Promise<GeminiResponse> {
    const systemPrompt = `You are a Direct Benefit Transfer (DBT) and Public Financial Management System (PFMS) expert for Government of Kerala Krishi Bhavan.
Explain technical banking errors in 2-3 clear sentences:
1. What went wrong in plain terms (no confusing jargon).
2. Exactly what action must be taken, which office/branch to visit, and what specific documents to bring.
Provide the response in English followed by a concise 1-sentence Malayalam summary.`;

    const userPrompt = `Explain this DBT failure:
Rule: ${ruleCode} - ${issueTitle}
Technical Evidence: ${evidenceText}`;

    return this.callGemini(userPrompt, systemPrompt);
  }

  /**
   * Interactive AI Copilot for Krishi Bhavan officers
   */
  public async askCopilot(
    query: string,
    context?: {
      caseId?: string;
      farmerName?: string;
      ruleCode?: string;
      bankName?: string;
      status?: string;
    }
  ): Promise<GeminiResponse> {
    const systemPrompt = `You are the DBT-GUARD AI Copilot, an expert advisor for Kerala Agricultural Extension Officers and Krishi Bhavan staff managing PM-KISAN Direct Benefit Transfer grievances in Thrissur District.
Guidelines:
- Reference official Kerala Agricultural Department protocols, Lead Bank guidelines (SBI, Canara, Kerala Gramin Bank), NPCI Aadhaar payment bridge, and Revenue Village land records (RoR/e-Rekha).
- Provide concrete, step-by-step administrative next actions.
- Keep answers professional, concise, and structured with bullet points.
- You can speak in English or Malayalam depending on the user query.`;

    let userPrompt = query;
    if (context && (context.caseId || context.farmerName)) {
      userPrompt = `[Context: Case #${context.caseId || 'N/A'}, Farmer: ${context.farmerName || 'N/A'}, Rule: ${context.ruleCode || 'N/A'}, Bank: ${context.bankName || 'N/A'}, Status: ${context.status || 'N/A'}]\n\nQuestion: ${query}`;
    }

    return this.callGemini(userPrompt, systemPrompt);
  }

  /**
   * Generate an automated Malayalam IVR voice assist call script
   */
  public async generateVoiceScript(
    farmerNameMl: string,
    bankName: string,
    issueDescription: string,
    officeName: string
  ): Promise<GeminiResponse> {
    const systemPrompt = `You are an automated interactive voice response (IVR) script writer for Kerala Agriculture Department.
Write a respectful, soothing, clear spoken Malayalam telephone script for farmer ${farmerNameMl}.
Keep it between 50 to 80 words.
Structure:
1. Warm greeting and self-identification as Krishi Bhavan.
2. Brief explanation of why the PM-KISAN 23rd instalment is held up at ${bankName}.
3. Simple request to visit ${officeName} with Aadhaar card and passbook.
4. Reminder never to share OTPs with anyone.
5. Polite thank you.
Output ONLY the Malayalam script text without conversational filler.`;

    const userPrompt = `Farmer: ${farmerNameMl}
Bank: ${bankName}
Issue: ${issueDescription}
Office to visit: ${officeName}`;

    return this.callGemini(userPrompt, systemPrompt);
  }
}

export const geminiAI = new GeminiAIService();
