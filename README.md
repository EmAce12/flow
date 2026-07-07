# Flow

A basic React project scaffolded with Vite.

## Scripts

```bash
npm install
npm run dev
```

When the dev server starts, open the local URL that Vite prints in the terminal.

## Telegram setup

Create a `.env` file using `.env.example` as the template:

```bash
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
PORT=8787
```

Run the API server and Vite dev server in two terminals:

```bash
npm run dev:api
npm run dev
```

The React form posts to `/api/invite`; the API server forwards the email and
invitation code to Telegram.

## Deploy on Render

This project is ready to deploy as one Render Web Service. Render will build the
React app and run the Express server, which serves both the frontend and API.

Use these settings:

```bash
Build Command: npm install --include=dev && npm run build
Start Command: npm start
```

Set these environment variables in Render:

```bash
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
NODE_ENV=production
```

Do not upload `.env`; add secrets only through Render environment variables.

The included `render.yaml` can also be used as a Render Blueprint.
