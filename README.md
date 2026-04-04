# Smart Locker Backend API

A robust backend system for managing Smart Electronic Lockers, integrated with IoT, e-wallet payments, and real-time control.

## 1. Key Features

*   **Core Transaction Management:** Comprehensive management of Users (Customers, Shippers, Admins), Locker infrastructure (Lockers, Slots), Orders, and financial transactions.
*   **IoT & Hardware Integration:** Utilizes the **MQTT** protocol for reliable, low-latency communication with locker hardware for real-time door control.
*   **E-Wallet & Payments:** Integrated user digital wallets to track balance and cash flow through `Wallet` and `WalletTransaction` entities.
*   **Security & Access Control:** Secure access using PIN codes and OTP (`Order Authorization`). System-wide authentication via JWT and Google OAuth 2.0.
*   **Real-time Notifications:** Instant system alerts and push notifications delivered via **Socket.IO** for live user engagement.
*   **Cloud Storage & Media:** AWS S3 integration via `aws-sdk` for file storage and `sharp` library for high-performance image processing and optimization.

## 2. Tech Stack

*   **Language:** TypeScript (v5.8.2)
*   **Runtime:** Node.js (v22.17.0)
*   **Package Manager:** pnpm
*   **Framework:** Express.js
*   **DI Container:** Inversify (Enterprise-grade architecture)
*   **Database:** MySQL 8.0+ / MariaDB
*   **ORM:** TypeORM
*   **Cache/Broker:** Redis, MQTT
*   **Real-time:** Socket.IO

## 3. Getting Started

The project is configured for maximum automation of the initial setup.

### Step 1: Environment Setup
1. Ensure you have installed **Node.js v20+**, **pnpm**, and **MySQL**.
2. Create an empty database in MySQL (e.g., `smart_locker`).

### Step 2: Environment Variables Configuration
1. Copy the `.env.example` file to create a new `.env` file.
2. Update the Database connection parameters:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USERNAME=root
   DB_PASSWORD=your_password
   DB_DATABASE=smart_locker
   ```

### Step 3: Install Dependencies
```bash
pnpm install
```

### Step 4: Run & Auto-migrate Database
Run the following command:
```bash
pnpm run dev
```
**Automatic Mechanism:**
* Since `synchronize: true` is enabled in the `development` environment, TypeORM will automatically scan the entities in `src/entities` and generate the entire database schema upon server startup.
* No manual SQL script execution is required.

## 4. Available NPM Scripts

| Command | Description |
| :--- | :--- |
| `pnpm run dev` | Runs the development server with hot-reload via nodemon. Auto-syncs DB. |
| `pnpm run build` | Compiles TypeScript to JavaScript in the `dist` folder. |
| `pnpm run start` | Runs the production server from the `dist` folder (optimized performance). |
| `pnpm run lint:fix` | Automatically checks and fixes code style/linting errors. |
| `pnpm run prettier:fix` | Automatically formats the code for consistency and cleanliness. |

## 5. Main Directory Structure
* `src/entities`: Database table definitions.
* `src/services`: Business logic processing.
* `src/controllers`: API endpoints and response handling.
* `src/config`: System configurations (DB, Redis, MQTT, etc.).
