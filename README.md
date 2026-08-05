# WhatsAppHub Frontend

WhatsAppHub Frontend is a modern Next.js application for managing WhatsApp Business automation workflows, clients, users, webhooks, onboarding, and audit logs.

## Prerequisites

Before you start, make sure you have the following installed:

- Node.js 20+ and npm 10+
- A running backend service for API requests
- Optional: Git, Docker, and a hosting platform such as Vercel or a Linux server

## 1. Clone and install dependencies

```bash
git clone <repository-url>
cd WhatsAppHub-Frontend
npm install
```

## 2. Configure environment variables

Create a local environment file from the example file:

```bash
copy .env.example .env.local
```

Then update the values in .env.local:

```env
NEXT_PUBLIC_API_URL=/v1
API_PROXY_TARGET=http://localhost:5000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=WhatsAppHub
```

### Important notes

- If your backend is running on a different port, update API_PROXY_TARGET.
- If the frontend should call the backend directly instead of using the local proxy, change NEXT_PUBLIC_API_URL accordingly.
- For Facebook and YCloud integrations, fill in the public keys shown in the example file.

## 3. Run the application locally

### Development server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### HTTPS development mode

If you need HTTPS for local testing:

```bash
npm run dev-https
```

## 4. Build for production

Run the production build:

```bash
npm run build
```

Then start the production server:

```bash
npm start
```

## 5. Common scripts

```bash
npm run dev          # Start the development server
npm run dev-https    # Start the development server with HTTPS
npm run build        # Create a production build
npm start            # Start the production server
npm run lint         # Run ESLint
npm run type-check   # Check TypeScript types
npm run format       # Format source files with Prettier
```

## 6. Deployment instructions

### Option A: Vercel

1. Push the project to GitHub.
2. Create a new project in Vercel and import the repository.
3. Set the build command to:

```bash
npm run build
```

4. Add the required environment variables from .env.local in Vercel settings.
5. Deploy the project.

### Option B: Self-hosted / server deployment

After building the app:

```bash
npm run build
npm start
```

Use a process manager such as PM2, Docker, or a reverse proxy such as Nginx for production hosting.

Ensure your production environment has the correct values for:

- NEXT_PUBLIC_API_URL
- API_PROXY_TARGET
- NEXT_PUBLIC_APP_URL

## Troubleshooting

- If the app cannot reach the backend, verify that the backend is running and that API_PROXY_TARGET points to the correct host and port.
- If pages do not load correctly, run npm run build to confirm there are no compile issues.
- If you see authentication or session issues, confirm the environment values for the app URL and API endpoints.

## Project structure overview

- src/app: page routes and app layout
- src/components: reusable UI and feature components
- src/context: auth, theme, and layout context providers
- src/lib: shared utilities and environment helpers
- src/modules: business-feature modules
- src/types: shared TypeScript types

## License

This project is proprietary and confidential.
