# GA4 Analytics Dashboard

## Setup

1. Copy `.env.example` to `.env` and fill in your credentials
2. Run `npm install`
3. Run `npm run dev`

## Environment Variables

| Variable               | Description                             |
| ---------------------- | --------------------------------------- |
| `GOOGLE_CLIENT_ID`     | From Google Cloud Console → Credentials |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console → Credentials |
| `GA4_PROPERTY_ID`      | From GA4 Admin → Property Settings      |
| `FRONTEND_URL`         | `http://localhost:5173` for local dev   |
| `PORT`                 | Server port (default: 3001)             |

## Scripts

| Command         | Description                       |
| --------------- | --------------------------------- |
| `npm run dev`   | Start frontend + backend together |
| `npm run build` | Build for production              |
| `npm start`     | Run production build              |

## Deployment

### Vercel

- Connect repo to Vercel
- Add env vars in Vercel dashboard
- Deploy

### VPS

- Run `npm run build`
- Set `NODE_ENV=production` in env
- Run `npm start` (serves both API + static frontend)
