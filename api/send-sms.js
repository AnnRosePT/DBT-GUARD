/**
 * Vercel Serverless Function: /api/send-sms
 * 
 * Provides secure server-side SMS dispatch for Twilio and Vonage (Nexmo)
 * without exposing account tokens, API secrets, or passwords in browser client-side code.
 */

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed. Use POST.',
    });
  }

  try {
    const { to, message, provider = 'twilio' } = req.body || {};

    if (!to || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: "to" (phone number) and "message".',
      });
    }

    // Clean and normalize phone number
    const cleanPhone = to.replace(/[^\d+]/g, '');
    const recipient = cleanPhone.startsWith('+')
      ? cleanPhone
      : cleanPhone.length === 10
      ? `+91${cleanPhone}`
      : `+${cleanPhone}`;

    // ------------------------------------------------------------------------
    // 1. TWILIO SMS SANDBOX DISPATCH
    // ------------------------------------------------------------------------
    if (provider === 'twilio') {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const fromNumber = process.env.TWILIO_FROM_NUMBER;

      if (!accountSid || !authToken || !fromNumber) {
        return res.status(503).json({
          success: false,
          provider: 'twilio',
          error: 'Twilio environment variables not configured on Vercel.',
          instructions: 'Please configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER in your Vercel Project Settings > Environment Variables.',
          configured: {
            hasAccountSid: !!accountSid,
            hasAuthToken: !!authToken,
            hasFromNumber: !!fromNumber,
          },
        });
      }

      const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const formData = new URLSearchParams();
      formData.append('To', recipient);
      formData.append('From', fromNumber);
      formData.append('Body', message);

      const authHeader = `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`;

      const twilioRes = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const data = await twilioRes.json();

      if (!twilioRes.ok) {
        return res.status(twilioRes.status).json({
          success: false,
          provider: 'twilio',
          error: data.message || `Twilio error ${data.code || twilioRes.status}`,
          code: data.code,
          moreInfo: data.more_info,
        });
      }

      return res.status(200).json({
        success: true,
        provider: 'twilio',
        messageId: data.sid,
        status: data.status,
        recipient: data.to,
        timestamp: new Date().toISOString(),
        details: `Twilio SMS queued for delivery. SID: ${data.sid}`,
      });
    }

    // ------------------------------------------------------------------------
    // 2. VONAGE (NEXMO) MESSAGING API DISPATCH
    // ------------------------------------------------------------------------
    if (provider === 'vonage') {
      const apiKey = process.env.VONAGE_API_KEY;
      const apiSecret = process.env.VONAGE_API_SECRET;
      const fromNumber = process.env.VONAGE_FROM_NUMBER || 'DBTGUARD';

      if (!apiKey || !apiSecret) {
        return res.status(503).json({
          success: false,
          provider: 'vonage',
          error: 'Vonage environment variables not configured on Vercel.',
          instructions: 'Please configure VONAGE_API_KEY and VONAGE_API_SECRET in your Vercel Project Settings > Environment Variables.',
        });
      }

      const endpoint = 'https://rest.nexmo.com/sms/json';
      const vonageRes = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: apiKey,
          api_secret: apiSecret,
          to: recipient.replace('+', ''),
          from: fromNumber,
          text: message,
          type: 'unicode', // Required for Malayalam Unicode script
        }),
      });

      const data = await vonageRes.json();
      const messageResult = data.messages?.[0];

      if (!vonageRes.ok || messageResult?.status !== '0') {
        return res.status(400).json({
          success: false,
          provider: 'vonage',
          error: messageResult?.['error-text'] || 'Vonage dispatch failure',
          status: messageResult?.status,
        });
      }

      return res.status(200).json({
        success: true,
        provider: 'vonage',
        messageId: messageResult['message-id'],
        recipient,
        timestamp: new Date().toISOString(),
        details: `Vonage SMS dispatched successfully. ID: ${messageResult['message-id']}`,
      });
    }

    // ------------------------------------------------------------------------
    // 3. FAST2SMS (INDIAN TELECOM GATEWAY)
    // ------------------------------------------------------------------------
    if (provider === 'fast2sms') {
      const apiKey = process.env.FAST2SMS_API_KEY || process.env.VITE_FAST2SMS_API_KEY;
      if (!apiKey) {
        return res.status(503).json({
          success: false,
          provider: 'fast2sms',
          error: 'Fast2SMS API key not configured on server.',
        });
      }

      const cleanTenDigit = recipient.replace(/^\+91/, '').replace(/\D/g, '').slice(-10);

      const f2sRes = await fetch('https://www.fast2sms.com/dev/bulkV2', {
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

      const data = await f2sRes.json().catch(() => ({}));

      if (data.return === true || data.status_code === 200) {
        return res.status(200).json({
          success: true,
          provider: 'fast2sms',
          messageId: data.request_id || `f2s_${Date.now()}`,
          recipient,
          timestamp: new Date().toISOString(),
          details: `Fast2SMS message queued successfully. Request ID: ${data.request_id || 'OK'}`,
        });
      }

      return res.status(400).json({
        success: false,
        provider: 'fast2sms',
        error: data.message || `Fast2SMS error (Code: ${data.status_code})`,
        statusCode: data.status_code,
      });
    }

    return res.status(400).json({
      success: false,
      error: `Unsupported provider: ${provider}. Supported providers: "fast2sms", "twilio", "vonage".`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error processing SMS dispatch.',
    });
  }
}
