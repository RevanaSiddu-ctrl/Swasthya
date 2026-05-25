# Swasthya

Hybrid behavioral distress intelligence and emotional wellbeing ecosystem.

## 📂 Folder Structure & Responsibilities

This project is a `pnpm` workspace monorepo. It is broken down into three main areas:

### 1. Frontend: `/apps/mobile`
This is our **React Native (Expo)** application using Expo Router. 
- **`app/`**: Contains the file-based routing screens (e.g., `calm-wave-home.tsx`, `onboarding.tsx`, `gp-screen.tsx`). This is where you build the UI.
- **Responsibility**: Delivering the "CalmWave Emotional Support Layer" and the "Healthcare Accessibility Layer" (GP Interface) to the user.

### 2. Backend: `/apps/backend`
This is our **Node.js (Express)** orchestration server.
- **`src/routes/`**: API endpoints that the mobile app communicates with.
- **`src/services/azure/`**: Integrations with Azure AI (Anomaly Detector, OpenAI, Speech, Communication).
- **`src/db/`**: Connection setups for Azure Cosmos DB.
- **Responsibility**: Handling business logic, distress escalation, IVR handling, and proxying requests to Azure Cloud AI and the database.

### 3. Shared Library: `/packages/shared-types`
This contains shared **TypeScript interfaces** used by BOTH the frontend and backend.
- **`src/index.ts`**: Contains the core TS interfaces (`User`, `CheckIn`, `DistressFlag`, etc.).
- **Responsibility**: Keeping the frontend and backend data structures perfectly in sync. If you modify a type here, you must run `pnpm build:types` from the root directory.

## Quick Start

### 1. Install dependencies

Run from the root of the workspace:

```bash
pnpm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env` in the `/apps/backend` directory and fill in the required Azure/Firebase keys.

### 3. Start development servers

**Backend:**
```bash
pnpm dev:backend
```

**Mobile:**
```bash
pnpm dev:mobile
```

**Shared Types:**
If you make changes to `/packages/shared-types`, rebuild them:
```bash
pnpm build:types
```

## Architecture Notes
- Prioritize low-friction behavioral intelligence.
- Do NOT overengineer abstractions.
- Ensure the app feels calming and supportive, not like a productivity platform.
