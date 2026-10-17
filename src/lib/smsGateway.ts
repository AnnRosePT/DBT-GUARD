/**
 * DBT-GUARD SMS Gateway Integration Service
 * 
 * Provides unified multi-provider SMS dispatch support for:
 * 1. textbee.dev: Free Android SMS Gateway (300 free SMS/mo via Android phone)
 * 2. SMS Mobile API: Google Play Store Android developer gateway
 * 3. Twilio SMS API: Enterprise testing sandbox
 * 4. Vonage Messaging API (Nexmo): OTP & transactional SMS
 * 5. Simulation Mode: In-browser realistic sandbox with delivery receipts
 */

export type SMSProvider = 'fast2sms' | 'textbee' | 'sms_mobile_api' | 'twilio' | 'vonage' | 'simulation';

export interface SMSGatewayConfig {
  provider: SMSProvider;
  enabled: boolean;
  
  // Fast2SMS configuration
  fast2smsApiKey?: string;
  
  // TextBee.dev configuration
  textbeeApiKey?: string;
  textbeeDeviceId?: string;
  
  // Twilio configuration
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioFromNumber?: string;
  
  // Vonage configuration
  vonageApiKey?: string;
  vonageApiSecret?: string;
  vonageFromNumber?: string;
  
  // Custom Webhook / SMS Mobile API
  customEndpoint?: string;
  customApiKey?: string;
}

export interface SMSDispatchResult {
  success: boolean;
  provider: SMSProvider;
  messageId: string;
  recipient: string;
  timestamp: string;
  error?: string;
  deliveryStatus: 'Delivered' | 'Queued' | 'Sent via Gateway' | 'Failed';
  details: string;
}

const STORAGE_KEY = 'dbt_guard_sms_gateway_config';

const DEFAULT_CONFIG: SMSGatewayConfig = {
  provider: (import.meta.env.VITE_FAST2SMS_API_KEY ? 'fast2sms' : 'simulation') as SMSProvider,
  enabled: true,
  fast2smsApiKey: import.meta.env.VITE_FAST2SMS_API_KEY || '',
  textbeeApiKey: '',
  textbeeDeviceId: '',
  twilioAccountSid: '',
  twilioAuthToken: '',
  twilioFromNumber: '',
  vonageApiKey: '',
  vonageApiSecret: '',
  vonageFromNumber: '',
  customEndpoint: '',
  customApiKey: '',
};

class SMSGatewayService {
  private config: SMSGatewayConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  public getConfig(): SMSGatewayConfig {
    return { ...this.config };
  }

  public saveConfig(newConfig: Partial<SMSGatewayConfig>): SMSGatewayConfig {
    this.config = { ...this.config, ...newConfig };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
    } catch {
      // storage unavailable
    }
    return { ...this.config };
  }

  private loadConfig(): SMSGatewayConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
      }
    } catch {
      // fallback
    }
    return { ...DEFAULT_CONFIG };
  }

  /**
   * Format and normalize phone numbers for carrier routing
   */
  public normalizePhoneNumber(phone: string): string {
    const digitsOnly = phone.replace(/[^\d+]/g, '');
    if (digitsOnly.startsWith('+')) return digitsOnly;
    // Default to India (+91) if 10-digit mobile is provided
    if (digitsOnly.length === 10) return `+91${digitsOnly}`;
    if (digitsOnly.startsWith('91') && digitsOnly.length === 12) return `+${digitsOnly}`;
    return digitsOnly;
  }

  /**
   * Primary method to send an SMS notification to a farmer/beneficiary
   */
  public async sendSMS(
    rawPhone: string,
    message: string,
    overrideProvider?: SMSProvider
  ): Promise<SMSDispatchResult> {
    const provider = overrideProvider || this.config.provider;
    const recipient = this.normalizePhoneNumber(rawPhone);
    const timestamp = new Date().toISOString();

    // 0. Fast2SMS Indian Telecom Carrier Route
    if (provider === 'fast2sms') {
      return this.sendViaFast2SMS(recipient, message, timestamp);
    }

    // 1. TextBee.dev Android Gateway
    if (provider === 'textbee') {
      return this.sendViaTextBee(recipient, message, timestamp);
    }

    // 2. Twilio API Sandbox
    if (provider === 'twilio') {
      return this.sendViaTwilio(recipient, message, timestamp);
    }

    // 3. Vonage API
    if (provider === 'vonage') {
      return this.sendViaVonage(recipient, message, timestamp);
    }

    // 4. Custom Webhook / SMS Mobile API
    if (provider === 'sms_mobile_api') {
      return this.sendViaCustomWebhook(recipient, message, timestamp);
    }

    // 5. Default Simulation Mode
    return this.sendViaSimulation(recipient, message, timestamp);
  }

  /**
   * Fast2SMS.com Indian Carrier Bulk API Dispatch
   */
  private async sendViaFast2SMS(
    recipient: string,
    message: string,
    timestamp: string
  ): Promise<SMSDispatchResult> {
    const apiKey = this.config.fast2smsApiKey || import.meta.env.VITE_FAST2SMS_API_KEY || '';
    if (!apiKey) {
      return {
        success: false,
        provider: 'fast2sms',
        messageId: '',
        recipient,
        timestamp,
        deliveryStatus: 'Failed',
        error: 'Fast2SMS API Authorization Key is not configured.',
        details: 'Missing Fast2SMS API key in .env.local or SMS Gateway settings.',
      };
    }

    // Clean 10-digit number for Fast2SMS
    const cleanTenDigit = recipient.replace(/^\+91/, '').replace(/\D/g, '').slice(-10);

    try {
      const endpoint = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? '/api/fast2sms/bulkV2'
        : 'https://www.fast2sms.com/dev/bulkV2';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'authorization': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'q',
          message: message,
          language: 'english',
          flash: 0,
          numbers: cleanTenDigit,
        }),
      });

      const responseData = await response.json().catch(() => ({}));

      if (responseData.return === true || responseData.status_code === 200) {
        return {
          success: true,
          provider: 'fast2sms',
          messageId: responseData.request_id || `f2s_${Date.now()}`,
          recipient,
          timestamp,
          deliveryStatus: 'Delivered',
          details: `Dispatched directly via Fast2SMS Indian Telecom route to ${recipient}. Request ID: ${responseData.request_id || 'OK'}`,
        };
      }

      // Fast2SMS specific error codes (e.g. 999: 100 INR recharge required)
      const errorMsg = responseData.message || `Fast2SMS error (Code: ${responseData.status_code})`;
      return {
        success: false,
        provider: 'fast2sms',
        messageId: '',
        recipient,
        timestamp,
        deliveryStatus: 'Failed',
        error: errorMsg,
        details: responseData.status_code === 999
          ? 'Fast2SMS Account Restriction: Fast2SMS requires a one-time ₹100 account top-up before third-party web apps can trigger external API routing to mobile numbers.'
          : errorMsg,
      };
    } catch (err: any) {
      return {
        success: false,
        provider: 'fast2sms',
        messageId: '',
        recipient,
        timestamp,
        deliveryStatus: 'Failed',
        error: err.message || 'Fast2SMS network dispatch failed',
        details: 'Unable to connect to Fast2SMS gateway. Please check network connection or use 1-click Phone SMS/WhatsApp.',
      };
    }
  }

  /**
   * TextBee.dev REST API Dispatch
   * POST https://api.textbee.dev/api/v1/gateway/devices/[DEVICE_ID]/sendSMS
   */
  private async sendViaTextBee(
    recipient: string,
    message: string,
    timestamp: string
  ): Promise<SMSDispatchResult> {
    const { textbeeApiKey, textbeeDeviceId } = this.config;

    if (!textbeeApiKey || !textbeeDeviceId) {
      return {
        success: false,
        provider: 'textbee',
        messageId: '',
        recipient,
        timestamp,
        deliveryStatus: 'Failed',
        error: 'TextBee Device ID and API Key are required. Configure them in SMS Gateway Settings.',
        details: 'Missing TextBee credentials',
      };
    }

    try {
      // Use local dev proxy if available, fallback to direct HTTPS
      const endpoint = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? `/api/textbee/gateway/devices/${textbeeDeviceId}/sendSMS`
        : `https://api.textbee.dev/api/v1/gateway/devices/${textbeeDeviceId}/sendSMS`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': textbeeApiKey,
        },
        body: JSON.stringify({
          recipients: [recipient],
          message,
        }),
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(responseData.message || responseData.error || `HTTP ${response.status}`);
      }

      return {
        success: true,
        provider: 'textbee',
        messageId: responseData.data?.id || `tb_${Date.now()}`,
        recipient,
        timestamp,
        deliveryStatus: 'Sent via Gateway',
        details: `Dispatched to Android phone gateway (${textbeeDeviceId.slice(0, 6)}...). Carrier routing queued.`,
      };
    } catch (err: any) {
      return {
        success: false,
        provider: 'textbee',
        messageId: '',
        recipient,
        timestamp,
        deliveryStatus: 'Failed',
        error: err.message || 'Network error reaching TextBee gateway',
        details: 'TextBee dispatch error',
      };
    }
  }

  /**
   * Twilio REST API Dispatch (Serverless Endpoint + Direct Fallback)
   */
  private async sendViaTwilio(
    recipient: string,
    message: string,
    timestamp: string
  ): Promise<SMSDispatchResult> {
    // 1. First, attempt dispatch via secure Vercel Serverless Function (/api/send-sms)
    try {
      const serverlessRes = await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: recipient, message, provider: 'twilio' }),
      });

      if (serverlessRes.ok) {
        const data = await serverlessRes.json();
        return {
          success: true,
          provider: 'twilio',
          messageId: data.messageId || `SM_${Date.now()}`,
          recipient: data.recipient || recipient,
          timestamp,
          deliveryStatus: 'Queued',
          details: `Dispatched via Vercel Backend Twilio API. SID: ${data.messageId}`,
        };
      } else if (serverlessRes.status === 503) {
        const errJson = await serverlessRes.json().catch(() => ({}));
        if (!this.config.twilioAccountSid) {
          return {
            success: false,
            provider: 'twilio',
            messageId: '',
            recipient,
            timestamp,
            deliveryStatus: 'Failed',
            error: errJson.error || 'Twilio environment variables not configured on Vercel.',
            details: errJson.instructions || 'Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER to Vercel Environment Variables, or enter credentials in the SMS Gateway modal.',
          };
        }
      }
    } catch {
      // Serverless endpoint not reachable in local Vite dev mode without Vercel CLI
    }

    // 2. Direct client-side dispatch if credentials are provided in UI
    const { twilioAccountSid, twilioAuthToken, twilioFromNumber } = this.config;

    if (!twilioAccountSid || !twilioAuthToken || !twilioFromNumber) {
      return {
        success: false,
        provider: 'twilio',
        messageId: '',
        recipient,
        timestamp,
        deliveryStatus: 'Failed',
        error: 'Twilio Account SID, Auth Token, and From Number are required.',
        details: 'Configure Vercel Environment Variables or enter credentials in SMS Gateway Settings.',
      };
    }

    try {
      const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
      const formData = new URLSearchParams();
      formData.append('To', recipient);
      formData.append('From', twilioFromNumber);
      formData.append('Body', message);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || `Twilio error ${data.code || response.status}`);
      }

      return {
        success: true,
        provider: 'twilio',
        messageId: data.sid || `SM${Date.now()}`,
        recipient,
        timestamp,
        deliveryStatus: 'Queued',
        details: `Twilio message accepted. SID: ${data.sid}`,
      };
    } catch (err: any) {
      return {
        success: false,
        provider: 'twilio',
        messageId: '',
        recipient,
        timestamp,
        deliveryStatus: 'Failed',
        error: err.message || 'Twilio network request failed',
        details: 'Twilio error',
      };
    }
  }

  /**
   * Vonage (Nexmo) Messaging API (Serverless Endpoint + Direct Fallback)
   */
  private async sendViaVonage(
    recipient: string,
    message: string,
    timestamp: string
  ): Promise<SMSDispatchResult> {
    // 1. Attempt Vercel Serverless Function (/api/send-sms)
    try {
      const serverlessRes = await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: recipient, message, provider: 'vonage' }),
      });

      if (serverlessRes.ok) {
        const data = await serverlessRes.json();
        return {
          success: true,
          provider: 'vonage',
          messageId: data.messageId,
          recipient,
          timestamp,
          deliveryStatus: 'Delivered',
          details: `Dispatched via Vercel Backend Vonage API. ID: ${data.messageId}`,
        };
      }
    } catch {
      // Serverless not available
    }

    // 2. Direct client-side dispatch
    const { vonageApiKey, vonageApiSecret, vonageFromNumber } = this.config;

    if (!vonageApiKey || !vonageApiSecret) {
      return {
        success: false,
        provider: 'vonage',
        messageId: '',
        recipient,
        timestamp,
        deliveryStatus: 'Failed',
        error: 'Vonage API Key and Secret are required.',
        details: 'Missing Vonage credentials',
      };
    }

    try {
      const response = await fetch('https://rest.nexmo.com/sms/json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: vonageApiKey,
          api_secret: vonageApiSecret,
          to: recipient.replace('+', ''),
          from: vonageFromNumber || 'DBTGUARD',
          text: message,
          type: 'unicode', // Ensure Malayalam Unicode characters render correctly
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.messages?.[0]?.status !== '0') {
        const errorText = data.messages?.[0]?.['error-text'] || `Vonage status ${data.messages?.[0]?.status}`;
        throw new Error(errorText);
      }

      return {
        success: true,
        provider: 'vonage',
        messageId: data.messages[0]['message-id'],
        recipient,
        timestamp,
        deliveryStatus: 'Delivered',
        details: `Vonage message dispatched successfully. ID: ${data.messages[0]['message-id']}`,
      };
    } catch (err: any) {
      return {
        success: false,
        provider: 'vonage',
        messageId: '',
        recipient,
        timestamp,
        deliveryStatus: 'Failed',
        error: err.message || 'Vonage request failed',
        details: 'Vonage error',
      };
    }
  }

  /**
   * Custom Android SMS Mobile API / Webhook Endpoint
   */
  private async sendViaCustomWebhook(
    recipient: string,
    message: string,
    timestamp: string
  ): Promise<SMSDispatchResult> {
    const { customEndpoint, customApiKey } = this.config;

    if (!customEndpoint) {
      return {
        success: false,
        provider: 'sms_mobile_api',
        messageId: '',
        recipient,
        timestamp,
        deliveryStatus: 'Failed',
        error: 'Custom Gateway Endpoint URL is required.',
        details: 'Missing endpoint URL',
      };
    }

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (customApiKey) headers['Authorization'] = `Bearer ${customApiKey}`;

      const response = await fetch(customEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          phone: recipient,
          text: message,
          timestamp,
        }),
      });

      if (!response.ok) {
        throw new Error(`Gateway returned HTTP ${response.status}`);
      }

      return {
        success: true,
        provider: 'sms_mobile_api',
        messageId: `gw_${Date.now()}`,
        recipient,
        timestamp,
        deliveryStatus: 'Sent via Gateway',
        details: `Dispatched to custom mobile gateway: ${customEndpoint}`,
      };
    } catch (err: any) {
      return {
        success: false,
        provider: 'sms_mobile_api',
        messageId: '',
        recipient,
        timestamp,
        deliveryStatus: 'Failed',
        error: err.message || 'Webhook request failed',
        details: 'Custom gateway error',
      };
    }
  }

  /**
   * High-fidelity in-browser simulation mode for demo environments
   */
  private async sendViaSimulation(
    recipient: string,
    message: string,
    timestamp: string
  ): Promise<SMSDispatchResult> {
    // Simulate real carrier dispatch latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    const mockMessageId = `NIC-TSR-${Math.floor(100000 + Math.random() * 900000)}`;

    return {
      success: true,
      provider: 'simulation',
      messageId: mockMessageId,
      recipient,
      timestamp,
      deliveryStatus: 'Delivered',
      details: `Simulated NIC Bulk SMS Gateway dispatch to BSNL/Jio cellular node in Thrissur. Message ID: ${mockMessageId}`,
    };
  }
}

export const smsGateway = new SMSGatewayService();
