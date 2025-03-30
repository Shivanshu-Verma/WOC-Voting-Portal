<div align="center">

# AVID: Anonymous Voting with Integrity and Discretion

[<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg" width="60">](https://javascript.com)
[<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original.svg" width="60">](https://nodejs.org/)
[<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/postgresql/postgresql-original.svg" width="60">](https://postgresql.org)

[![Open in Visual Studio Code](https://img.shields.io/badge/Open%20in%20VS%20Code-007ACC?logo=visual-studio-code&logoColor=white)](https://vscode.dev/)
[![Node.js Version](https://img.shields.io/badge/Node.js-v16+-green?logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue?logo=postgresql&logoColor=white)](https://postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

*A secure and anonymous voting system for high-integrity elections*

[Features](#-key-features) • [Setup](#-setup-guide) • [Security](#-security-model) • [Contributing](#-contributing)

</div>

## 🌟 Overview

AVID is a sophisticated voting system designed to uphold voter privacy and data integrity in challenging environments. It addresses critical needs in elections where trust, security, and anonymity are paramount. By leveraging discrete mathematics, advanced cryptographic techniques, and a secure architecture, AVID ensures every vote is counted accurately while maintaining complete voter confidentiality.

## 🔐 Key Features

- 🛡️ **Anonymous Voting under Admin-Level Adversary**: Maintains voter anonymity even if system administrators are compromised
- 🔒 **Secure Atomic Voting in Hostile Networks**: Guarantees vote integrity even in unreliable or malicious network conditions
- 🧮 **Discrete Mathematics Framework**: Employs mathematical principles to ensure voter anonymity while preserving vote integrity
- 🖥️ **Intuitive Interface**: Simple experience for both voters and administrators
- 📊 **Real-time Results**: Secure tallying with instant updates
- ꩜ **Biometric Verification**: Supports fingerprint recognition for enhanced voter authentication
- 📈 **Modular and Scalable Architecture**: Accommodates elections of any size

## 🛠️ Setup Guide

### Master Server Setup

1. **Configure Environment Variables**:
   - Create a `.env` file in the module root directory with the following variables:
   ```
   PORT=3000
   CORS_ORIGIN=http://localhost:8080
   
   DB_NAME=avid_voting
   DB_USERNAME=your_db_username
   DB_PASSWORD=your_db_password
   DB_HOST=localhost
   
   ENCRYPTION_KEY=your_encryption_key
   ENCRYPTION_IV=your_encryption_iv
   MASTER_SECRET_KEY=your_master_key
   
   JWT_SECRET=your_jwt_secret
   
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

2. **Start the Server**:
   ```bash
   docker compose up --build
   ```

### Registration Module Setup

1. **Configure Environment Variables**:
   - Create a `.env` file in the module root directory with the following variables:
   ```
   VITE_BACKEND_URL=http://localhost:3000
   VITE_ENCRYPTION_IV=your_encryption_iv
   ```

2. **Install Dependencies and Start**:
   ```bash
   npm i
   npm run dev
   ```

### Result Module Setup

1. **Configure Environment**:
   - Copy the `.env` file to `/master-server/src/result`

2. **Start the Result Module**:
   ```bash
   npm run result
   ```

### EVM Setup

1. **Configure Environment Variables**:
   - Create a `.env` file with the following variables:
   ```
   VITE_BACKEND_URL=http://localhost:3000
   VITE_ENCRYPTION_IV=your_encryption_iv
   ```

2. **Install Dependencies and Start**:
   ```bash
   npm i
   npm run dev
   ```

## 🔍 Security Model

AVID implements a sophisticated security approach:

- **Discrete Mathematics Foundation**: Utilizes mathematical concepts to ensure complete separation between voter identity and ballot content
- **Diffie-Hellman Key Exchange**: Enables secure communication channels between EVM and the Server with perfect forward secrecy
- **AES-256-CBC Encryption**: Encrypts all crucial ballot data with military-grade security standards
- **Separation of Identity and Votes**: Cryptographic Commitment Schemes ensure voting data cannot be linked to voter identities
- **Atomic Transactions**: All-or-nothing voting operations prevent partial or inconsistent data
- **Network Isolation**: Resistant to man-in-the-middle attacks


## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a new branch for your feature or bug fix:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes and push the branch:
   ```bash
   git commit -m "Description of changes"
   git push origin feature-name
   ```
4. Open a pull request describing your changes

For major changes, please open an issue first to discuss your ideas.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Cryptographic protocols based on Diffie-Hellman and AES-256-CBC standards
- Discrete mathematics principles adapted from academic research on anonymous systems
- Special thanks to all contributors who have helped shape this project