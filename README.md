# 📧 Bulk Mail Sender

A powerful and secure bulk email sending application built with React and Express, featuring token-based authentication, message/email history, and a modern UI.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)

## ✨ Features

- 🔒 Token-based authentication
- 📨 Bulk email sending capability
- 🗂️ **Email and message history** (view, select, and reuse previous recipients and messages)
- 🧹 **Clear history** (delete all saved emails/messages)
- 🎨 Modern and responsive UI
- ⚡ Fast performance with Vite
- 🛡️ Protected routes
- 🔄 Loading and sending animations
- 📱 Mobile-friendly design
- 💾 **Database-backed storage** for message/email history (SQLite)
- 🧑‍💻 Developer-friendly codebase

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/dubem-umeh-raphael/bulk-mail-sender.git
   cd bulk-mail-sender
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   npm install

   # Backend
   cd Backend
   npm install

   # Database server
   cd ../Database
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file in Backend directory
   cp .env.example .env
   ```

4. **Start the application**
   ```bash
   # Start backend server
   cd Backend
   npm start

   # Start database server
   cd ../Database
   npm start

   # In a new terminal, start frontend
   npm run dev
   ```

## 🛠️ Technology Stack

### Frontend
- React 19
- Vite
- TailwindCSS
- React Router DOM
- Lucide Icons
- Context API for state management

### Backend
- Node.js
- Express
- Nodemailer
- CORS
- Dotenv

### Database
- SQLite (with a simple Express API for message/email history)

## 🔐 Security Features

- Token-based authentication
- Protected routes
- Environment variable configuration
- SMTP server validation
- Rate limiting

## 🗂️ History Features

- **Email History:** View and select previously used recipient emails. Select multiple emails and apply them to your next bulk send.
- **Message History:** View and reuse previous subject lines and email bodies.
- **Clear History:** Instantly delete all saved emails and messages for privacy or cleanup.

## 📁 Project Structure

```
bulk-mail/
├── src/
│   ├── components/
│   ├── context/
│   ├── animations/
│   └── ...
├── Backend/
│   ├── config/
│   ├── middleware/
│   ├── routes/
│   └── ...
├── Database/
│   ├── db.js
│   ├── routes/
│   └── ...
└── ...
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- Vite team for the lightning-fast build tool
- TailwindCSS team for the utility-first CSS framework

---

<p align="center">Made with ❤️ for sending emails efficiently</p>
