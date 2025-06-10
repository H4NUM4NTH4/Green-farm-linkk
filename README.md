# Market Linkages - Green Farm Link

A modern web application for managing market linkages and farm connections, built with React, TypeScript, and Supabase.

[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-blue)](https://github.com/H4NUM4NTH4/Green-farm-linkk.git)

## 🚀 Features

- Real-time chat functionality
- Order management system
- Internationalization support
- Modern UI with Tailwind CSS
- Type-safe development with TypeScript
- Supabase backend integration

## 🛠️ Tech Stack

- **Frontend:**
  - React
  - TypeScript
  - Vite
  - Tailwind CSS
  - ESLint
  - PostCSS

- **Backend:**
  - Supabase
  - Real-time database
  - Authentication
  - Storage

## 📁 Project Structure

```
green-farm-link/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page-level components
│   ├── services/      # API and service integrations
│   ├── hooks/         # Custom React hooks
│   ├── contexts/      # React context providers
│   ├── lib/           # Utility functions
│   ├── types/         # TypeScript type definitions
│   ├── i18n/          # Internationalization
│   └── integrations/  # Third-party integrations
├── supabase/          # Supabase configuration
└── public/            # Static assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone [https://github.com/H4NUM4NTH4/Green-farm-linkk.git]
   cd green-farm-link
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## 🏗️ Building for Production

```bash
npm run build
# or
yarn build
```

## 🧪 Running Tests

```bash
npm run test
# or
yarn test
```

## 📝 Code Style

This project uses ESLint for code linting and formatting. The configuration can be found in `eslint.config.js`.

## 🌐 Internationalization

The project supports multiple languages through the i18n setup in the `src/i18n` directory.

## 🔒 Security

- Environment variables are used for sensitive information
- Supabase authentication is implemented
- Type safety with TypeScript
- ESLint for code quality

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- H4NUM4NTH4 - Initial work

## 🙏 Acknowledgments

- Supabase for backend services
- Vite for build tooling
- Tailwind CSS for styling
- React team for the amazing framework 
