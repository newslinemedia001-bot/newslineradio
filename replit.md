# Newsline Radio

## Overview

Newsline Radio is a professional live broadcasting web application built with Next.js 15, featuring real-time radio streaming, interactive chat functionality, listener analytics, and comprehensive admin management. The platform provides a complete radio station experience with listener engagement features, programming schedules, news management, and social media integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### September 30, 2025 - SEO-Friendly Article URLs
- Implemented human-readable slug-based article URLs instead of random IDs
- New URL format: `/article/2025/09/30/article-title-in-words`
- Full backward compatibility for existing article links maintained
- Automatic slug generation from article titles with uniqueness checking
- Middleware-based routing for seamless legacy URL support

## System Architecture

### Frontend Architecture
- **Framework**: Next.js 15 with App Router and React Server Components (RSC)
- **UI Framework**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with CSS variables for theming and dark mode support
- **Typography**: Tinos font from Google Fonts for professional appearance
- **State Management**: React hooks for local state, Firebase for global state
- **Mobile Responsiveness**: Custom mobile breakpoint detection with useIsMobile hook

### Backend Architecture
- **Runtime**: Next.js API routes for server-side functionality
- **Database**: Firebase Firestore for real-time data management
- **Authentication**: Environment-based admin authentication system
- **Real-time Features**: Firebase real-time listeners for live chat and statistics

### Data Management
- **Collections Structure**:
  - `stats/listeners`: Real-time listener count and analytics
  - `schedule`: Radio programming schedule management
  - `hosts`: Radio host profiles and information
  - `news`: News articles and updates
  - `chat`: Live chat messages with timestamps
  - `contacts`: Contact form submissions
  - `likes`: User engagement tracking
- **Data Operations**: Firebase SDK with increment operations for counters and real-time updates

### Key Features Architecture
- **Live Radio Streaming**: Audio player integration with listener tracking
- **Real-time Chat**: Live messaging system with username generation
- **Admin Panel**: Comprehensive content management system with tabbed interface
- **Analytics Dashboard**: Real-time statistics tracking with peak listener monitoring
- **Schedule Management**: Programming calendar with time-based display
- **News System**: Article management with timestamps and categorization
- **Contact System**: Form submissions with admin notification system

### Authentication & Authorization
- **Admin Access**: Environment variable-based authentication (username/password)
- **User Sessions**: Browser-based user ID generation for tracking
- **Security**: Admin routes protected with authentication checks

### Performance Optimizations
- **Image Optimization**: Next.js Image component for optimized loading
- **Code Splitting**: Component-based architecture with dynamic imports
- **Caching**: Firebase query optimization and local state management
- **Mobile Performance**: Responsive design with mobile-first approach

## External Dependencies

### Core Framework Dependencies
- **Next.js 15**: React framework with App Router and server components
- **React**: UI library with hooks and functional components
- **TypeScript**: Type safety and development experience

### UI and Styling
- **Radix UI**: Comprehensive component library for accessibility and functionality
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Lucide React**: Icon library for consistent iconography
- **class-variance-authority**: Component variant management
- **clsx & tailwind-merge**: Conditional class name utilities

### Database and Real-time Features
- **Firebase**: Backend-as-a-Service platform
  - Firestore: NoSQL document database
  - Analytics: User behavior tracking
  - Real-time listeners: Live data synchronization

### Form Management
- **React Hook Form**: Form state management and validation
- **@hookform/resolvers**: Form validation resolvers

### Additional UI Components
- **date-fns**: Date manipulation and formatting
- **embla-carousel-react**: Carousel/slider functionality
- **input-otp**: OTP input component
- **cmdk**: Command palette interface
- **vaul**: Drawer component library

### Development Tools
- **ESLint**: Code linting and quality assurance
- **Autoprefixer**: CSS vendor prefix automation
- **Geist Font**: Additional typography options

### Third-party Integrations
- **Social Media**: Integration points for Instagram, Twitter, Facebook, YouTube
- **Email Services**: Contact form submission handling
- **Audio Streaming**: Radio stream integration capabilities