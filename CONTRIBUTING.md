# Contributing to NFC Platform

First off, thank you for considering contributing to NFC Platform! 🎉

## Code of Conduct

By participating in this project, you agree to maintain a respectful and harassment-free environment for everyone.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce**
- **Expected vs actual behavior**
- **Screenshots** (if applicable)
- **Environment details** (OS, Node version, browser)

**Bug Report Template:**
```markdown
## Bug Description
A clear description of the bug.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What you expected to happen.

## Actual Behavior
What actually happened.

## Environment
- OS: [e.g., Windows 11]
- Node: [e.g., 18.17.0]
- Browser: [e.g., Chrome 120]

## Screenshots
If applicable, add screenshots.
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When suggesting:

- **Use a clear title**
- **Provide detailed description**
- **Explain why this would be useful**
- **Include mockups if UI-related**

### Pull Requests

1. **Fork the repo** and create your branch from `main`
2. **Make your changes**
3. **Add tests** if adding functionality
4. **Update documentation**
5. **Ensure tests pass**: `npm test`
6. **Ensure build works**: `npm run build`
7. **Submit pull request**

## Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL
- Git

### Setup Steps

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/nfc-platform.git
cd nfc-platform

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your values

# Run database migration
npx prisma migrate dev

# Start development server
npm run dev
```

## Project Structure

```
deneme/
├── app/              # Next.js App Router pages
│   ├── api/         # API routes
│   ├── components/  # Reusable components
│   ├── context/     # React contexts
│   └── dashboard/   # Dashboard pages
├── lib/             # Utility functions
├── prisma/          # Database schema
└── public/          # Static assets
```

## Coding Guidelines

### TypeScript
- Use TypeScript for all new code
- Define proper types (avoid `any`)
- Use interfaces for object shapes

```typescript
// Good
interface User {
  id: string
  name: string
  email: string
}

// Avoid
const user: any = { ... }
```

### React Components
- Use functional components
- Use hooks instead of class components
- Keep components small and focused

```typescript
// Good - Small, focused component
export function Button({ onClick, children }: ButtonProps) {
  return <button onClick={onClick}>{children}</button>
}

// Avoid - Component doing too much
// (component with 500+ lines)
```

### Naming Conventions
- **Components**: PascalCase (`UserProfile.tsx`)
- **Functions**: camelCase (`getUserData()`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Files**: kebab-case for non-components (`user-utils.ts`)

### CSS
- Use CSS Modules for component styles
- Use CSS Variables for theming
- Mobile-first responsive design

```css
/* Good - CSS Variables */
.button {
  background: var(--color-primary);
  color: var(--color-text);
}

/* Avoid - Hardcoded colors */
.button {
  background: #3b82f6;
  color: #ffffff;
}
```

## Commit Messages

Follow conventional commits:

```
type(scope): subject

body (optional)

footer (optional)
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(auth): add Google OAuth login

fix(dashboard): correct card display on mobile

docs(readme): update installation instructions

style(components): format Button component

refactor(api): simplify user authentication logic

test(connections): add tests for network API

chore(deps): update dependencies
```

## Testing

### Running Tests
```bash
# Run all tests
npm test

# Run specific test
npm test -- UserProfile

# Run with coverage
npm test -- --coverage
```

### Writing Tests
```typescript
import { render, screen } from '@testing-library/react'
import Button from './Button'

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    screen.getByText('Click').click()
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

## Documentation

- Update README.md if changing setup
- Add JSDoc comments for public APIs
- Update relevant .md files in docs/

```typescript
/**
 * Fetches user data from the API
 * @param userId - The ID of the user to fetch
 * @returns User object or null if not found
 * @throws Error if the request fails
 */
async function getUser(userId: string): Promise<User | null> {
  // ...
}
```

## Performance Guidelines

- Avoid unnecessary re-renders
- Use React.memo for expensive components
- Optimize images (WebP, lazy loading)
- Code split large components

```typescript
// Good - Lazy loading
const HeavyComponent = lazy(() => import('./HeavyComponent'))

// Good - Memoization
const MemoizedComponent = memo(({ data }) => {
  // ...
})
```

## Accessibility

- Use semantic HTML
- Add ARIA labels where needed
- Ensure keyboard navigation works
- Test with screen readers

```tsx
// Good - Accessible button
<button aria-label="Close modal" onClick={handleClose}>
  ✕
</button>

// Avoid - Non-semantic div
<div onClick={handleClose}>✕</div>
```

## Review Process

1. **PR created** → Automated checks run
2. **Code review** → Maintainer reviews code
3. **Feedback addressed** → Make requested changes
4. **Approved** → PR merged to main
5. **Deployed** → Changes go live

## Getting Help

- 💬 **Discussions**: GitHub Discussions
- 🐛 **Issues**: GitHub Issues
- 📧 **Email**: dev@nfcplatform.com

## Recognition

Contributors are recognized in:
- README.md contributors section
- Release notes
- Project website (if applicable)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing! 🙌**
