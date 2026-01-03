# NFC Platform - Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-01-03

### Added
- ✨ **Light/Dark Mode Theme System**
  - Theme toggle component with smooth transitions
  - CSS variables for seamless theme switching
  - LocalStorage persistence
  - System preference detection
  - Settings page for theme management

- 🎯 **NFC Onboarding Flow**
  - Cookie-based unclaimed tag storage
  - Automatic claim on user registration
  - Redirect to claim page after login
  - HTTPOnly, secure cookie implementation

- 👥 **Enhanced Network Management**
  - Modal-based "Add to Network" workflow
  - Group assignment for contacts
  - Tag system (up to 10 tags)
  - Custom notes (up to 500 characters)
  - Remove from network functionality
  - Input validation

- 🏠 **Improved Navigation**
  - Profile dropdown menu on homepage
  - Dashboard + Logout quick access
  - Hover effects and transitions
  - Loading states for async operations

- 🔗 **Slug-based URL Routing**
  - Clean, readable card URLs (`/c/username`)
  - Fallback to ID if slug unavailable
  - SEO-friendly structure

- 📄 **Error & Loading States**
  - Custom 404 page with animations
  - Global error boundary
  - Dashboard error boundary
  - Consistent loading components

- 📚 **Documentation**
  - ENV_SETUP.md - Environment configuration guide
  - SECURITY.md - Security policy and best practices
  - CONTRIBUTING.md - Contribution guidelines
  - LICENSE - MIT license
  - IMPROVEMENTS.md - Technical improvements log
  - SUMMARY.md - Session summary

### Changed
- 🎨 **UI/UX Improvements**
  - Better error messages (user-friendly)
  - Hover effects on all interactive elements
  - Loading feedback on all async operations
  - Responsive design improvements
  - Mobile font size optimization

- 🔐 **Security Enhancements**
  - Stronger input validation
  - Better error handling
  - Improved cookie security
  - Type-safe error boundaries

- 📱 **Responsive Design**
  - Media queries for 768px and 480px breakpoints
  - Mobile-first approach
  - Utility classes for common layouts
  - Container padding adjustments

### Fixed
- 🐛 CSS lint warnings (background-clip property)
- 🐛 JSON.parse errors in connections (myTags field)
- 🐛 Theme context initialization race condition
- 🐛 Logout button disabled state
- 🐛 Profile dropdown click-outside behavior

## [1.1.0] - 2025-12-28

### Added
- 💳 Card Module
  - 3-tier privacy system
  - QR code generation
  - Slug-based URLs
  - Custom fields

- 🌱 Plant Module
  - Watering logs
  - Photo timeline
  - AI assistant integration
  - Growth tracking

- ☕ Mug Module
  - Drink logs
  - Consumption tracking
  - Social sharing

- 🏷️ NFC Tag System
  - Tag claiming
  - Link/unlink functionality
  - Public code generation
  - UID-based tracking

- 👥 Connections System
  - Save contacts from cards
  - Category organization
  - Personal notes
  - Custom tags

### Changed
- Migrated to NextAuth v5
- Updated database schema
- Improved API structure

### Fixed
- Authentication flow issues
- Database connection pooling
- Session management bugs

## [1.0.0] - 2025-12-15

### Added
- 🔐 Authentication System (NextAuth)
- 🗄️ Database (PostgreSQL + Prisma)
- 📊 Dashboard Layout
- 🎨 UI Foundation (CSS Variables)
- 🔗 Basic NFC Infrastructure

### Security
- Password hashing with bcrypt
- HTTPOnly cookies
- CSRF protection
- SQL injection prevention (Prisma)

---

## Types of Changes
- `Added` for new features
- `Changed` for changes in existing functionality
- `Deprecated` for soon-to-be removed features
- `Removed` for now removed features
- `Fixed` for any bug fixes
- `Security` for vulnerability fixes

## Links
- [1.2.0] - Current release
- [1.1.0] - Previous release
- [1.0.0] - Initial release
