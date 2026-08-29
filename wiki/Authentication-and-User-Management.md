# 👤 Authentication, Multi-User Roles & Preferences

FinDashIQ features role-based access control, isolated user data, personalized visual themes, dynamic multi-currency preferences, default watchlist layouts, and administrative user management.

---

## 📋 Table of Contents
1. [User Roles (Admin vs User)](#1-user-roles-admin-vs-user)
2. [Data Isolation & Session Persistence](#2-data-isolation--session-persistence)
3. [User Profile & Preferences Modal](#3-user-profile--preferences-modal)
4. [Base Currency & View Mode Configuration](#4-base-currency--view-mode-configuration)
5. [Visual Theme Modes (Dark & Bright)](#5-visual-theme-modes-dark--bright)
6. [Administrative User Management](#6-administrative-user-management)
7. [Initial Default Credentials](#7-initial-default-credentials)

---

## 1. User Roles (Admin vs User)

| Feature / Permission | Administrator (`admin`) | Standard User (`user`) |
| :--- | :---: | :---: |
| Access Dashboard, Terminal & Watchlists | ✅ | ✅ |
| Create & Configure Private Alert Rules | ✅ | ✅ |
| Switch Visual Themes (Dark / Bright) | ✅ | ✅ |
| Configure Base Display Currency (10 Currencies) | ✅ | ✅ |
| Select Default Watchlist View (Cards vs Table) | ✅ | ✅ |
| Update Profile & Change Password | ✅ | ✅ |
| **Manage Users & Create Accounts** | ✅ | ❌ |
| **Delete Accounts & Assign Roles** | ✅ | ❌ |

---

## 2. Data Isolation & Session Persistence

All user configurations are strictly isolated per account in `data/users.json`:
- **Watchlists**: Personal list of tracked tickers and drag-and-drop ordering.
- **Alert Rules**: Active signal trigger conditions and webhook endpoints.
- **Preferences**: Base currency, default watchlist view, risk tolerance profile, and visual theme.
- **Session Security**: Session cookies protected by standard security headers.

---

## 3. User Profile & Preferences Modal

Click your username/avatar in the top-right navigation bar to open **My Profile & Preferences**:
- **Display Name**: Custom name shown in headers and reports.
- **Email Address**: Destination for email notifications and market memos.
- **Risk Tolerance Profile**: Select between *Conservative*, *Balanced*, or *Aggressive Quant*.
- **Password & Security**: Update password with instant verification.

---

## 4. Base Currency & View Mode Configuration

- **Base Display Currency**: Choose between **USD ($)**, **EUR (€)**, **GBP (£)**, **CHF (Fr)**, **NOK (kr)**, **JPY (¥)**, **CAD ($)**, **AUD ($)**, **SEK (kr)**, and **DKK (kr)**. All quotes, sparklines, and matrices automatically recalculate on currency change.
- **Default Watchlist View**: Choose between **Grid Card View** or **Data Table View**.

---

## 5. Visual Theme Modes (Dark & Bright)

FinDashIQ provides two hand-crafted, high-contrast themes:
- 🌙 **Dark Mode (Default)**: Deep obsidian glassmorphism, glowing neon indicator badges, and high-contrast charts optimized for low-light trading sessions.
- ☀️ **Bright Mode**: Crisp, high-clarity daylight theme with vibrant indicators and clean card borders.

*Toggle quickly via the user dropdown menu or in the Profile modal.*

---

## 6. Administrative User Management

Administrators can open the **Manage Users & Roles** tab in the Profile modal:
- **Directory Table**: Inspect all registered usernames, display names, email addresses, roles, and creation dates.
- **Create Account**: Add a new user with username, password, display name, and role (`admin` or `user`).
- **Delete Account**: Remove user accounts safely with confirmation dialogs.

---

## 7. Initial Default Credentials

- **Username**: `admin`
- **Password**: `admin123`
- *Note: Change the default admin password immediately in the Password & Security tab.*
