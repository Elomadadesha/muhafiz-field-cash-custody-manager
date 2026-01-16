# Muhafiz - Field Cash & Custody Manager

[aureliabutton]

Muhafiz (محافظ - 'Keeper') is a specialized, mobile-first Progressive Web Application (PWA) designed for single-user field cash management. It serves as a secure digital ledger for employees handling multiple cash custodies (Euhad - عُهد) simultaneously, built with an Arabic-first (RTL) interface.

## 📋 Overview

The system features a secure, single-password entry point leading to a high-contrast, touch-optimized dashboard. It replaces manual paper tracking with a robust digital solution that aggregates data from active wallets to show total cash-on-hand and expenditure in real-time.

### Key Features

- **The Vault (Main Treasury):** Real-time aggregation of all active wallets showing total cash-on-hand and total expenditure.
- **Multi-Wallet Management:** Create unlimited distinct wallets (e.g., 'Field Work', 'Maintenance', 'Special Ops') with independent balances and histories.
- **Quick Expense Tracking:** Streamlined interface for logging expenses in seconds with category selection and notes.
- **Category Manager:** Manage standardized expense categories (e.g., Transport, Spare Parts) for consistent reporting.
- **Smart Reporting:** Generate daily, weekly, or category-based summaries.
- **WhatsApp Sharing:** Export reports as clean, mobile-friendly data grids or images for instant sharing.
- **RTL & Arabic First:** Native Right-to-Left layout and Arabic typography (Tajawal/Cairo) for natural reading flow.
- **Secure Access:** Single-password protection optimized for personal use.

## 🛠️ Technology Stack

**Frontend:**
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS v3 + Shadcn UI
- **State Management:** Zustand
- **Routing:** React Router 6
- **Icons:** Lucide React
- **Charts:** Recharts
- **Utilities:** Date-fns, Zod, React Hook Form

**Backend & Infrastructure:**
- **Runtime:** Cloudflare Workers
- **API Framework:** Hono
- **Storage:** Cloudflare Durable Objects (SQLite-based storage)
- **Language:** TypeScript

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or later)
- **Bun** (Package Manager)
- **Wrangler** (Cloudflare CLI)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd muhafiz-cash-manager
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Start the development server**
   This command starts the Vite frontend and the Cloudflare Worker proxy locally.
   ```bash
   bun run dev
   ```

4. **Open the application**
   Navigate to `http://localhost:3000` (or the port shown in your terminal).

## 💻 Development

### Project Structure

- `src/` - React frontend application
  - `components/` - Reusable UI components (Shadcn)
  - `pages/` - Application views
  - `hooks/` - Custom React hooks
  - `lib/` - Utilities and API clients
- `worker/` - Cloudflare Worker backend
  - `index.ts` - Entry point
  - `user-routes.ts` - API route definitions
  - `entities.ts` - Durable Object entity definitions
  - `core-utils.ts` - Storage utilities
- `shared/` - Types shared between frontend and backend

### Key Commands

| Command | Description |
|---------|-------------|
| `bun run dev` | Start local development server |
| `bun run build` | Build the frontend for production |
| `bun run deploy` | Deploy to Cloudflare Workers |
| `bun run lint` | Run ESLint |
| `bun run cf-typegen` | Generate Cloudflare Worker types |

## ☁️ Deployment

You can deploy this application directly to Cloudflare Workers using the button below or via the CLI.

[aureliabutton]

### Manual Deployment

1. **Authenticate with Cloudflare**
   ```bash
   npx wrangler login
   ```

2. **Deploy**
   ```bash
   bun run deploy
   ```

This will build the React application and deploy the Worker with the Durable Object bindings configured in `wrangler.jsonc`.

## 🏗️ Architecture

The application uses a **Local-First** approach with server syncing:

1. **State:** Global state (Zustand) holds wallets, categories, and transactions.
2. **Persistence:** Data is persisted to Cloudflare Durable Objects via the `GlobalDurableObject` binding.
3. **Sync:** On load, the app fetches the full state from the Worker API.
4. **Mutations:** Actions (add transaction, update wallet) send API requests to the Worker, which updates the Durable Object and returns the new state.

The backend utilizes a single Durable Object instance acting as a "User Entity" database, which is highly efficient for single-user applications, ensuring strong consistency and low latency.

## 📄 License

This project is licensed under the MIT License.