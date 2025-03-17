# GraalOnline Playerworlds - Support Ticket System (Prototype)

A prototype support ticket system for **GraalOnline Playerworlds**, designed to streamline issue reporting and resolution. This project is a work-in-progress and serves as a foundation for future development.

---

## 🚀 Getting Started

To set up the project locally:

```bash
npm install         # Install project dependencies
npm run dev         # Launch the development server
npm run build       # Build the app for production
```

---

## 🔧 Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```ini
MONGODB_URI=your_mongodb_connection_string
RESEND_API=your_resend_api_key              # For email notifications
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your_webhook_url  # Webhook for ticket updates
WEBPAGE_URL=https://localhost:3000          # Base URL (update for production)
JWT_SECRET=your-secure-secret               # Secret key for JWT authentication
```

**Note**: Keep these values secure and avoid committing them to version control.

---

## 📸 Screenshots

| Feature             | Screenshot                                                                |
|---------------------|---------------------------------------------------------------------------|
| **Login Page**      | ![Login Page](https://i.imgur.com/rVRCe5y.png)                           |
| **2FA Authentication** | ![2FA Page](https://i.imgur.com/oo6lsKl.png)                          |
| **User Dashboard**  | ![Dashboard Page](https://i.imgur.com/gZX0KAb.png)                       |
| **All Tickets View**| ![All Tickets](https://i.imgur.com/qmaNiqW.png)                          |
| **Replying to Tickets** | ![Reply to Tickets as admin](https://i.imgur.com/5d6zu3C.png)        |
| **Creating a Ticket**| ![Create a Ticket](https://i.imgur.com/FDI6pRv.png)                     |
| **Admin Dashboard** | ![Admin Dashboard](https://i.imgur.com/T9qOYGc.png)                      |
| **Ticket reply from Admin** | ![E-mail for ticket replys](https://i.imgur.com/DCEtBdA.png)      |
| **2FA e-mail** | ![Login e-mail](https://i.imgur.com/58zoQS2.png)    |

---

## ✨ Features

### User Features
- **Authentication**: Secure login with JWT and two-factor authentication (2FA).
- **Ticket Creation**: Submit tickets with problem types (e.g., "Rude Player") and sub-problems (e.g., "Bad Nick").
- **Ticket List**: View all personal tickets in an accordion layout.
- **Ticket Interaction**: Reply to tickets and close them when resolved as admin or user.

### Admin Features
- **Dashboard**: Manage all tickets with detailed views, including user info and replies.
- **Ticket Handling**: add admins to the support webapp (visible only to superadmins), reply and close tickets as normal admin.

### Technical Features
- **Data Storage**: MongoDB for storing tickets and user information.
- **Email Notifications**: Powered by Resend API for ticket updates.
- **Discord Integration**: Webhook notifications for new tickets and user replies.

---

## 🛠 Key Enhancements

- **Formatted Tickets**: Problem types and sub-problems are stored and displayed in a readable format (e.g., "Rude Player - Bad Nick") instead of raw keys (e.g., "rudeplayer - badnick").
- **Role-Based Visibility**: The `assignedAdmin` field is hidden from non-admin users in the ticket list API response.
- **Consistent Design**: Updated navbar and footer use a cohesive `gray.800`/`teal.400` color scheme, aligning with the app’s dark theme.

---

## 📝 Notes

- **Dependencies**: Requires `next`, `chakra-ui`, `axios`, `jsonwebtoken`, `mongodb`, and `framer-motion` (for animations).

---
