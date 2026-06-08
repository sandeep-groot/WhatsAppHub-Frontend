# WhatsAppHub Frontend

A modern, scalable Next.js frontend for the WhatsApp Business Automation Platform.

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Build & Deploy
```bash
npm run build
npm start
```

## 📁 Project Structure

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed information about the project structure and architecture.

## 🎯 Key Features

- **Modern Next.js 16+**: Latest React and Next.js features
- **Type-Safe**: Full TypeScript support
- **Modular Architecture**: Domain-driven design
- **State Management**: Zustand for UI state, TanStack Query for server state
- **Form Validation**: Zod schema validation
- **RBAC**: Built-in role-based access control
- **API Integration**: Centralized HTTP client with error handling

## 📚 Documentation

- [Architecture Guide](./ARCHITECTURE.md) - Detailed system design
- [Setup Summary](./SETUP_SUMMARY.md) - Complete setup checklist

## 🛠️ Tech Stack

- **Framework**: Next.js 16+
- **Language**: TypeScript
- **UI**: React 19+, TailwindCSS (recommended)
- **State**: Zustand, TanStack Query
- **Validation**: Zod
- **HTTP**: Fetch API with custom wrapper

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Check TypeScript types
- `npm run format` - Format code with Prettier

## 🔐 Environment Setup

Copy `.env.example` to `.env.local` and fill in your values:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=WhatsAppHub
```

## 📖 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## 📄 License

This project is proprietary and confidential.

---

**Built with ❤️ for WhatsAppHub**
