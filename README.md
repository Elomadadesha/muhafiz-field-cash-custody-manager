# Abu MaWaDa - Field Cash Manager
[aureliabutton]
**Abu MaWaDa** is a specialized, mobile-first Progressive Web Application (PWA) designed for single-user field cash management. It serves as a secure digital ledger for employees handling multiple cash custodies (Euhad - عُهد) simultaneously, built with an Arabic-first (RTL) interface and a modern Blue & Gold visual identity.
## 🌟 About the App
This application replaces manual paper tracking with a robust digital solution. It is designed to be:
- **Local-First & Secure:** All data is encrypted and stored locally on your device. No data leaves your phone without your explicit action (backup/sharing).
- **Mobile-Optimized:** Large touch targets, swipe gestures, and a layout designed for one-handed use in the field.
- **Offline-Ready:** Works perfectly without an internet connection.
### Key Features
1.  **The Vault (Main Treasury):** Real-time aggregation of all active wallets showing total cash-on-hand and total expenditure.
2.  **Multi-Wallet Management:** Create unlimited distinct wallets (e.g., 'Field Work', 'Maintenance') with independent balances.
3.  **Smart Transactions:**
    *   **Quick Expense:** Log expenses in seconds.
    *   **Custom Categories:** Add new expense types on the fly (e.g., "Emergency Repairs") and save them for future use.
4.  **Reporting Engine:** Generate daily, weekly, or monthly reports with visual charts.
5.  **WhatsApp Sharing:** Share reports instantly as images or text summaries.
6.  **Security:** Military-grade AES-GCM encryption for backups and SHA-256 for password protection. Auto-lock feature ensures privacy.
## 🎨 Branding & Customization
The app now features the **Abu MaWaDa** Gold Coin branding.
### ⚠️ IMPORTANT: Logo Setup Instructions
To complete the branding setup, you must add your logo file:
1.  **Rename** your logo image file to `logo.png`.
2.  **Place** the file in the `public/` folder of the project.
3.  (Optional) For the best PWA experience, also generate icons named `pwa-192x192.png` and `pwa-512x512.png` and place them in the `public/` folder.
## 🚀 Getting Started
### Prerequisites
- **Node.js** (v18 or later)
- **Bun** (Package Manager)
### Installation
1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd muhafiz-cash-manager
    ```
2.  **Install dependencies**
    ```bash
    bun install
    ```
3.  **Start the development server**
    ```bash
    bun run dev
    ```
4.  **Open the application**
    Navigate to `http://localhost:3000`.
## 📱 PWA Installation
This app is installable!
- **Android (Chrome):** Tap the "Install" banner at the bottom or use the browser menu -> "Install App".
- **iOS (Safari):** Tap the "Share" button -> "Add to Home Screen".
## 📄 License
This project is licensed under the MIT License.