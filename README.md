# Kiro Action Workflow

Vue 3 + Express full-stack application with multi-agent workflow support.

## Tech Stack

- **Frontend**: Vue 3 (Composition API), Vite, Tailwind CSS, Pinia, Vue Router
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Validation**: Joi

## Prerequisites

- Node.js 18+ and npm
- MongoDB 6+
- Git

## Quick Start

```bash
# Install all dependencies
npm run install-all

# Start development servers (client + server)
npm run dev
```

The client will run on http://localhost:5173 and proxy API requests to the server on http://localhost:3000.

## Available Scripts

- `npm run install-all` - Install dependencies for root, client, and server
- `npm run dev` - Run both client and server concurrently
- `npm run dev:client` - Run client only (Vite dev server)
- `npm run dev:server` - Run server only (Express)
- `npm run build` - Build client for production

## Project Structure

```
kiro-action-workflow/
├── client/          # Vue 3 frontend
├── server/          # Express backend
├── .env             # Environment variables
└── package.json     # Root package with scripts
```

## Environment Variables

Copy `.env` and configure:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/kiro-action-workflow
NODE_ENV=development
```

## Development Workflow

This project uses a multi-agent workflow with GitHub issues. See the task-orchestrator and github-task-worker agents for automated development.
