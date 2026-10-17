/**
 * Vercel Serverless Function: /api/make-call
 * 
 * Provides automated outbound telephone call dispatch via Twilio Voice API.
 * When answered, plays the official PM-KISAN Malayalam / English audio advisory
 * regarding the beneficiary's banking or NPCI error.
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
    const { to, caseCode = 'K135', message, language = 'ml' } = req.body || {};

    if (!to) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: "to" (phone number).',
      });
    }

    // Clean phone number
    const cleanDigits = to.replace(/\D/g, '');
    const recipient = cleanDigits.length === 10 ? `+91${cleanDigits}` : `+${cleanDigits}`;

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_FROM_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      return res.status(503).json({
        success: false,
        provider: 'twilio_voice',
        error: 'Twilio Voice credentials not configured on Vercel.',
        instructions: 'Please configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER in your Vercel Project Settings > Environment Variables.',
        details: 'Simulated voice call ready via Wi-Fi URL: /call/' + caseCode,
      });
    }

    // TwiML payload: Speaks introductory announcement and plays Malayalam audio
    const host = req.headers.host || 'dbt-guard.vercel.app';
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const audioUrl = `${protocol}://${host}/audio/${caseCode.toLowerCase()}.mp3`;

    const twiml = `
      <Response>
        <Say language="en-IN" voice="Polly.Raveena">
          Important Direct Benefit Transfer update from Krishi Bhavan Thrissur.
        </Say>
        <Play>${audioUrl}</Play>
        <Pause length="1"/>
        <Say language="en-IN" voice="Polly.Raveena">
          To repeat this message, please stay on the line. Krishi Bhavan helpline number is 0487 2331122. Thank you.
        </Say>
      </Response>
    `.trim();

    const twilioEndpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`;

    const params = new URLSearchParams();
    params.append('To', recipient);
    params.append('From', fromNumber);
    params.append('Twiml', twiml);

    const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    const twilioRes = await fetch(twilioEndpoint, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const twilioData = await twilioRes.json();

    if (!twilioRes.ok) {
      return res.status(twilioRes.status).json({
        success: false,
        provider: 'twilio_voice',
        error: twilioData.message || 'Twilio Voice API Error',
        code: twilioData.code,
      });
    }

    return res.status(200).json({
      success: true,
      provider: 'twilio_voice',
      callSid: twilioData.sid,
      recipient,
      status: twilioData.status || 'queued',
      details: `Call placed to ${recipient}. Twilio SID: ${twilioData.sid}`,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error processing outbound call',
    });
  }
}
