# RTSoft – Školní kariérní poradce

An intelligent web assistant helping students in 8th–9th grade choose their career path.

## 🎨 Design Features

- **Ultra-premium UI** inspired by Apple, Notion, and Linear
- **Glassmorphism** with blurred translucent surfaces
- **Smooth animations** powered by Framer Motion
- **Futuristic green accent** (#00FF9C)
- **Parallax effects** and auto-typing animations
- **Minimalistic white/gray** base with clean typography

## 🚀 Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- React Router DOM

## 📁 Project Structure

```
src/
├── components/
│   ├── GlassCard.tsx
│   ├── GradientButton.tsx
│   ├── TypingText.tsx
│   ├── TimelineStep.tsx
│   ├── ProfessionReveal.tsx
│   └── HeroSection.tsx
├── pages/
│   ├── Landing.tsx
│   ├── GoogleLogin.tsx
│   ├── Onboarding.tsx
│   ├── ProfessionRevealPage.tsx
│   └── Roadmap.tsx
├── App.tsx
├── App.css
├── index.css
└── main.tsx
```

## 🛠️ Setup & Installation

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

4. Preview production build:
```bash
npm run preview
```

## 📱 Pages

1. **Landing Page** - Hero section with glassmorphic UI and parallax effects
2. **Google Login** - Simulated authentication flow
3. **Conversational Onboarding** - AI-powered dialogue to gather student information
4. **Profession Reveal** - Dramatic reveal of recommended career path
5. **Roadmap** - Personalized learning path with timeline

## ✨ Key Components

- **GlassCard** - Reusable glass-morphic card with animations
- **GradientButton** - Premium buttons with glow effects
- **TypingText** - Animated typing text component
- **TimelineStep** - Learning path step with smooth transitions
- **ProfessionReveal** - Dramatic profession reveal with particle effects
- **HeroSection** - Landing page hero with parallax

## 🎯 Features

- No backend required (fully local)
- Mock data for demonstration
- Smooth page transitions
- Responsive design
- Premium animations
- Clean, maintainable code

## 🌈 Color Palette

- Primary: `#00FF9C` (Futuristic Green)
- Primary Dark: `#00CC7D`
- Glass White: `rgba(255, 255, 255, 0.7)`
- Glass Border: `rgba(255, 255, 255, 0.18)`

## 📄 License

MIT


## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
# Undefined_project
