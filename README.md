# Nimabalo - Uzbek Q&A Platform

Nimabalo is a modern, playful Q&A platform designed specifically for Uzbek users. It combines professional functionality with delightful humor, creating a unique experience that feels both serious and fun.

## 🎨 Design System

### Brand Colors
- **Primary**: `#0C4A6E` (Dark Blue) - Used for "Nima" in the logo and main text
- **Secondary**: `#16A34A` (Green) - Used for "balo" in the logo and accents
- **Accent**: `#1EB2A6` (Teal) - Interactive elements and highlights
- **Warm**: `#F59E0B` (Orange) - Call-to-action and playful elements
- **Neutral**: `#64748B` (Gray) - Secondary text and subtle elements

### Design Philosophy
The platform balances two design approaches:
1. **Professional Q&A Functionality** - Clean, readable interfaces for serious content
2. **Playful Humor** - Fun animations, emojis, and interactive elements that reflect the "Nima balo?" brand

### Global Styling Guidelines
- **Typography**: All text uses the custom project fonts through CSS variables
- **Components**: Use the unified `.btn`, `.btn-secondary`, `.btn-danger`, `.card`, `.input`, `.textarea` classes
- **Colors**: Use CSS variables (e.g., `var(--color-primary)`) for consistency
- **Animations**: Refined, professional animations that enhance UX without being distracting
- **Text Components**: Use the AppText component (or equivalent wrapper) universally for all text to ensure consistent font usage

## 🚀 Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🏗️ Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/          # Reusable UI components
├── lib/                 # Utility functions and configurations
└── styles/              # Global CSS and design tokens
```

## 📝 Code Guidelines

### Import/Export Conventions
- **Modules**: Use named exports and imports for all components and utilities
- **Route Files**: Must use default exports (Next.js requirement)
- **Path Aliases**: Use `@/` alias for imports from the root directory

### Component Styling
- Use the unified design system classes defined in `globals.css`
- Maintain the balance between professional functionality and playful humor
- Keep animations subtle and purposeful
- Use CSS variables for all colors and spacing

### Critical Actions
- Always use the confirmation system for actions that cannot be undone
- Use the `useConfirmation` hook for managing confirmation state
- Include the `ConfirmationModal` component in components that have critical actions
- Choose appropriate button styles: `danger` for destructive actions, `primary` for main actions, `secondary` for secondary actions

## 🎯 Features

- **Anonymous Q&A**: Ask and answer questions without revealing identity
- **Uzbek Language Support**: Full localization in Uzbek
- **Interactive Elements**: Fun animations and playful UI elements
- **Professional Interface**: Clean, readable design for serious content
- **Responsive Design**: Works seamlessly on all devices
- **Achievement System**: Beautiful badges for user milestones and achievements

## 🌟 Brand Identity

"Nima balo?" translates to "What's the matter?" in Uzbek, reflecting the platform's purpose of helping people find answers to their questions. The design combines:

- **Serious Q&A functionality** like Reddit/Quora
- **Uzbek cultural elements** and language
- **Playful humor** that makes the platform approachable
- **Professional aesthetics** that build trust

## 🔧 Technical Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom design system
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Language**: TypeScript
- **Deployment**: Vercel-ready

## 📱 Responsive Design

The platform is designed to work seamlessly across all devices:
- **Desktop**: Full-featured experience with sidebar navigation
- **Tablet**: Optimized layouts for medium screens
- **Mobile**: Touch-friendly interfaces and mobile-first design

## 🎨 Animation System

The platform uses a refined animation system that enhances user experience:
- **Subtle hover effects** for interactive elements
- **Smooth transitions** between states
- **Playful micro-interactions** that reflect the brand personality
- **Performance-optimized** animations that don't impact usability

## ⚠️ Confirmation System

The platform includes a standardized confirmation system for critical actions to prevent accidental data loss:

### Components
- **ConfirmationModal**: Reusable modal component for confirming critical actions
- **useConfirmation**: Custom hook for managing confirmation state and configuration

### Usage
```typescript
import { useConfirmation } from '@/lib/useConfirmation';
import ConfirmationModal from '@/components/ConfirmationModal';

export default function MyComponent() {
  const { isOpen, config, confirm, close, handleConfirm } = useConfirmation();

  const handleCriticalAction = () => {
    confirm(() => {
      // Your critical action here
      console.log('Action confirmed!');
    }, {
      title: "Action Title",
      message: "Are you sure you want to proceed?",
      confirmText: "Yes, proceed",
      cancelText: "Cancel",
      confirmButtonStyle: "danger", // or "primary", "secondary"
      icon: "⚠️"
    });
  };

  return (
    <>
      <button onClick={handleCriticalAction}>Delete Item</button>
      <ConfirmationModal
        isOpen={isOpen}
        onClose={close}
        onConfirm={handleConfirm}
        {...config}
      />
    </>
  );
}
```

### Button Styles
- **danger**: Red gradient for destructive actions (delete, logout, etc.)
- **primary**: Blue gradient for main actions
- **secondary**: White with border for secondary actions

### Critical Actions That Require Confirmation
- User logout
- Account deletion
- Data clearing
- Settings reset
- Any action that cannot be undone

## 🏆 Badge System

The platform features a comprehensive achievement system with beautiful, animated badges:

### Badge Types
- **👑 First User**: Special purple gradient badge for early adopters
- **💎 First Question**: Blue gradient badge for asking your first question
- **⭐ Early Adopter (2-5)**: Yellow-orange gradient for users 2-5
- **🌟 Early Adopter (6-10)**: Green gradient for users 6-10
- **🏆 Early Adopter (11-50)**: Indigo gradient for users 11-50
- **🧠 Question Master (100+)**: Red-pink gradient for asking 100+ questions
- **💪 Answer Hero (50+)**: Orange-yellow gradient for 50+ answers
- **🏛️ Community Pillar**: Gray gradient for community leaders

### Badge Features
- **Special Branding**: "nimabalo.uz" appears in custom gradient text
- **Animated Display**: Floating elements and special animations for special badges
- **Responsive Design**: Beautiful on all devices
- **Profile Integration**: Badges displayed in user profiles
- **Automatic Awarding**: Badges are automatically awarded based on user actions

## 🚀 Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

## 🤝 Contributing

When contributing to this project:
1. Follow the established design system
2. Maintain the balance between professional and playful elements
3. Use the unified color palette and component classes
4. Keep animations purposeful and performance-optimized
5. Ensure all text follows the project's typography guidelines
6. When adding new badges, follow the established badge design patterns
7. Maintain the playful yet professional tone in all badge descriptions

## 📄 License

This project is private and proprietary.
