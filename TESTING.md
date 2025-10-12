# Network32 Testing Guide

## Testing Strategy

Network32 uses a multi-layered testing approach:

1. **Unit Tests** - Component and function testing
2. **Integration Tests** - API and database interactions
3. **E2E Tests** - Full user workflows
4. **Manual QA** - User acceptance testing

## Setup

### Install Testing Dependencies

```bash
# Jest and React Testing Library
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom

# Cypress for E2E testing
npm install --save-dev cypress @cypress/code-coverage

# Additional utilities
npm install --save-dev @testing-library/react-hooks msw
```

### Jest Configuration

Create `jest.config.js`:

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
  ],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}',
  ],
}

module.exports = createJestConfig(customJestConfig)
```

Create `jest.setup.js`:

```javascript
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Supabase client
jest.mock('@/lib/shared/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
      signIn: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    })),
  })),
}))
```

### Cypress Configuration

Create `cypress.config.ts`:

```typescript
import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    env: {
      SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
  },
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
  },
})
```

## Unit Tests

### Example: Button Component Test

Create `src/components/ui/__tests__/button.test.tsx`:

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../button'

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies variant styles', () => {
    render(<Button variant="destructive">Delete</Button>)
    const button = screen.getByText('Delete')
    expect(button).toHaveClass('bg-destructive')
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByText('Disabled')).toBeDisabled()
  })
})
```

### Example: Action Function Test

Create `src/lib/backend/actions/__tests__/case.test.ts`:

```typescript
import { createCase, getCase } from '../case'
import { createClient } from '@/lib/shared/supabase/server'

jest.mock('@/lib/shared/supabase/server')

describe('Case Actions', () => {
  const mockSupabase = {
    from: jest.fn(() => ({
      insert: jest.fn().mockResolvedValue({ data: { id: '123' }, error: null }),
      select: jest.fn().mockResolvedValue({ data: [{ id: '123' }], error: null }),
      single: jest.fn().mockResolvedValue({ data: { id: '123' }, error: null }),
    })),
  }

  beforeEach(() => {
    (createClient as jest.Mock).mockResolvedValue(mockSupabase)
  })

  it('creates a new case', async () => {
    const caseData = {
      title: 'Test Case',
      procedure_type: 'crown',
      before_image_url: 'before.jpg',
      after_image_url: 'after.jpg',
    }

    const result = await createCase('user-123', caseData)
    expect(result).toHaveProperty('id')
  })

  it('retrieves a case by ID', async () => {
    const caseData = await getCase('123')
    expect(caseData).toHaveProperty('id', '123')
  })
})
```

## Integration Tests

### Example: API Route Test

Create `src/app/api/cases/__tests__/route.test.ts`:

```typescript
import { GET, POST } from '../route'
import { NextRequest } from 'next/server'

describe('/api/cases', () => {
  it('GET returns list of cases', async () => {
    const request = new NextRequest('http://localhost:3000/api/cases')
    const response = await GET(request)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(Array.isArray(data)).toBe(true)
  })

  it('POST creates a new case', async () => {
    const caseData = {
      title: 'New Case',
      procedure_type: 'crown',
    }
    
    const request = new NextRequest('http://localhost:3000/api/cases', {
      method: 'POST',
      body: JSON.stringify(caseData),
    })
    
    const response = await POST(request)
    expect(response.status).toBe(201)
  })
})
```

## E2E Tests with Cypress

### Example: Authentication Flow

Create `cypress/e2e/auth.cy.ts`:

```typescript
describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('allows user to sign up', () => {
    cy.visit('/auth/signup')
    
    cy.get('input[name="email"]').type('test@example.com')
    cy.get('input[name="password"]').type('Password123!')
    cy.get('input[name="full_name"]').type('Test User')
    cy.get('button[type="submit"]').click()
    
    cy.url().should('include', '/onboarding')
  })

  it('allows user to login', () => {
    cy.visit('/auth/login')
    
    cy.get('input[name="email"]').type('test@example.com')
    cy.get('input[name="password"]').type('Password123!')
    cy.get('button[type="submit"]').click()
    
    cy.url().should('include', '/dashboard')
  })

  it('prevents access to protected routes', () => {
    cy.visit('/dashboard')
    cy.url().should('include', '/auth/login')
  })
})
```

### Example: Case Creation Flow

Create `cypress/e2e/cases.cy.ts`:

```typescript
describe('Clinical Cases', () => {
  beforeEach(() => {
    // Login first
    cy.login('test@example.com', 'Password123!')
  })

  it('creates a new clinical case', () => {
    cy.visit('/cases/create')
    
    // Basic Info
    cy.get('input[name="title"]').type('Crown Restoration')
    cy.get('select[name="procedure_type"]').select('crown')
    cy.get('button').contains('Next').click()
    
    // Images
    cy.get('input[type="file"]').first().selectFile('cypress/fixtures/before.jpg')
    cy.get('input[type="file"]').last().selectFile('cypress/fixtures/after.jpg')
    cy.get('button').contains('Next').click()
    
    // Details
    cy.get('textarea[name="case_notes"]').type('Successful crown restoration')
    cy.get('button').contains('Next').click()
    
    // Consent
    cy.get('input[type="checkbox"]').check()
    cy.get('button[type="submit"]').click()
    
    cy.url().should('include', '/cases/')
    cy.contains('Crown Restoration').should('be.visible')
  })

  it('displays case details', () => {
    cy.visit('/cases')
    cy.get('a').first().click()
    
    cy.get('h1').should('exist')
    cy.get('img').should('have.length.at.least', 1)
  })
})
```

### Custom Cypress Commands

Create `cypress/support/commands.ts`:

```typescript
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.visit('/auth/login')
    cy.get('input[name="email"]').type(email)
    cy.get('input[name="password"]').type(password)
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/dashboard')
  })
})

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>
    }
  }
}
```

## Running Tests

### Unit Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- button.test.tsx
```

### E2E Tests

```bash
# Open Cypress UI
npx cypress open

# Run Cypress headless
npx cypress run

# Run specific spec
npx cypress run --spec "cypress/e2e/auth.cy.ts"
```

## Test Coverage Goals

- **Unit Tests**: 80% coverage minimum
- **Integration Tests**: All API routes covered
- **E2E Tests**: All critical user flows covered

### Critical Paths to Test

1. **Authentication**
   - Sign up
   - Login
   - Logout
   - Password reset

2. **Clinical Cases**
   - Create case
   - View case
   - Save case
   - Report case

3. **Forum**
   - Create thread
   - Reply to thread
   - View thread

4. **Profile**
   - View profile
   - Edit profile
   - Follow/unfollow

5. **Feed**
   - View feed
   - Filter content
   - Load more

## Manual QA Checklist

### Pre-Deployment Testing

- [ ] All forms validate correctly
- [ ] Error messages display properly
- [ ] Success messages display properly
- [ ] Images upload and display correctly
- [ ] Navigation works on all pages
- [ ] Mobile responsive on all pages
- [ ] Dark mode works correctly
- [ ] Loading states display
- [ ] Empty states display
- [ ] Pagination works
- [ ] Search functionality works
- [ ] Filters work correctly

### Browser Testing

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### Performance Testing

- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] No console errors
- [ ] No memory leaks

## Continuous Integration

### GitHub Actions Workflow

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run unit tests
        run: npm test -- --coverage
      
      - name: Run build
        run: npm run build
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

## Debugging Tests

### Jest Debug

```bash
# Debug specific test
node --inspect-brk node_modules/.bin/jest --runInBand button.test.tsx
```

### Cypress Debug

```typescript
// Add debugger in test
it('test case', () => {
  cy.visit('/page')
  cy.debug() // Pause execution
  cy.get('button').click()
})
```

## Best Practices

1. **Write tests first** (TDD when possible)
2. **Keep tests isolated** (no dependencies between tests)
3. **Use descriptive test names**
4. **Test user behavior**, not implementation
5. **Mock external dependencies**
6. **Keep tests fast** (< 5s for unit tests)
7. **Use data-testid** for reliable selectors
8. **Clean up after tests** (reset state)

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Cypress Documentation](https://docs.cypress.io/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
