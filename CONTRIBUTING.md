# Contributing to DevPulse AI

> Everything you need to know to contribute code, fix bugs, or add features. Written for developers of all experience levels.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Workflow](#development-workflow)
3. [Project Scripts Reference](#project-scripts-reference)
4. [Code Style & Conventions](#code-style--conventions)
5. [How to Add a New Feature](#how-to-add-a-new-feature)
6. [How to Add a New BFF Endpoint](#how-to-add-a-new-bff-endpoint)
7. [How to Add a New Dashboard Component](#how-to-add-a-new-dashboard-component)
8. [How to Add a New Lit Web Component](#how-to-add-a-new-lit-web-component)
9. [How to Add a New Mock Data Generator](#how-to-add-a-new-mock-data-generator)
10. [TypeScript Guidelines](#typescript-guidelines)
11. [Git Workflow & Branch Naming](#git-workflow--branch-naming)
12. [Commit Message Format](#commit-message-format)
13. [Pull Request Checklist](#pull-request-checklist)
14. [Troubleshooting for Contributors](#troubleshooting-for-contributors)

---

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/devpulse-ai.git
   cd devpulse-ai
   ```
3. **Install** dependencies:
   ```bash
   npm install
   ```
4. **Create a branch** for your work:
   ```bash
   git checkout -b feat/my-new-feature
   ```
5. **Start** the dev servers:
   ```bash
   npm run dev:all
   ```
6. Open http://localhost:3000 — you're ready to code!

For detailed setup instructions, see [docs/SETUP.md](./docs/SETUP.md).

---

## Development Workflow

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  1. Pick an issue or feature                            │
│     │                                                   │
│  2. Create a branch: feat/xxx or fix/xxx                │
│     │                                                   │
│  3. Start dev servers: npm run dev:all                  │
│     │                                                   │
│  4. Make changes → Hot reload shows them instantly       │
│     │                                                   │
│  5. Test manually (curl APIs, check browser)            │
│     │                                                   │
│  6. Commit with conventional format                     │
│     │                                                   │
│  7. Push branch → Open Pull Request                     │
│     │                                                   │
│  8. Address review feedback → Merge!                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Hot Reload

Both servers have automatic hot reload:
- **BFF** (`packages/bff`): Uses `tsx watch` — restarts on any `.ts` file change
- **Frontend** (`apps/shell`): Uses Next.js HMR — updates in-browser without page reload

**You almost never need to restart the dev servers manually.**

---

## Project Scripts Reference

Run these from the **project root** (`devpulse-ai/`):

| Command | What It Does |
|---------|-------------|
| `npm install` | Install all dependencies for all packages |
| `npm run dev:all` | Start BFF + Frontend concurrently |
| `npm run dev:bff` | Start only the BFF server (port 4000) |
| `npm run dev:shell` | Start only the Next.js frontend (port 3000) |
| `npm run build` | Build all packages (via Turborepo) |
| `npm run lint` | Lint all packages |

### Turborepo Commands

Turborepo runs tasks across all packages with intelligent caching:

```bash
# Build only the shell app (and its dependencies)
npx turbo run build --filter=@devpulse/shell

# Build only the BFF
npx turbo run build --filter=@devpulse/bff

# See the dependency graph
npx turbo run build --dry-run
```

---

## Code Style & Conventions

### General Rules

- **TypeScript everywhere** — No plain JavaScript files
- **Strict mode** — `"strict": true` in all `tsconfig.json` files
- **Semicolons** — Yes, always
- **Quotes** — Single quotes for strings (`'hello'` not `"hello"`)
- **Trailing commas** — Yes, in arrays and objects
- **2-space indentation** — Tabs are not used

### File Naming

| Type | Convention | Example |
|------|-----------|---------|
| React components | PascalCase | `PipelineHealthBoard.tsx` |
| Utility files | kebab-case | `mock-data.ts` |
| Route files | kebab-case | `pipelines.ts` |
| Web Components | kebab-case | `status-badge.ts` |
| Type definition files | kebab-case | `types.ts` |
| Config files | kebab-case | `tailwind.config.ts` |

### Import Order

```typescript
// 1. Node.js built-ins
import { readFile } from 'fs';

// 2. External packages
import express from 'express';
import { io } from 'socket.io-client';

// 3. Internal packages (@devpulse/*)
import { IncidentPredictor } from '@devpulse/ai-engine';

// 4. Relative imports (from furthest to nearest)
import { cn } from '@/lib/utils';
import { Header } from './Header';
```

### React Component Structure

```tsx
'use client'; // Only if the component uses hooks, state, or browser APIs

// Imports
import { useState } from 'react';
import { SomeIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// Types (defined in the same file if component-specific)
interface MyComponentProps {
  data: SomeType;
  onAction?: () => void;
}

// Component (always named export, not default)
export function MyComponent({ data, onAction }: MyComponentProps) {
  const [state, setState] = useState(false);

  return (
    <div className="bg-surface-900/50 border border-surface-800 rounded-xl p-5">
      {/* Component content */}
    </div>
  );
}
```

### CSS / Styling Rules

- **Tailwind utility classes only** — No inline `style={}` or CSS modules
- Use the custom color palette: `brand-*`, `surface-*` (defined in `tailwind.config.ts`)
- Use `cn()` for conditional classes:
  ```tsx
  <div className={cn(
    'base-classes',
    isActive && 'active-classes',
    variant === 'danger' && 'text-red-400'
  )}>
  ```
- Common patterns:
  ```
  Card:     bg-surface-900/50 border border-surface-800 rounded-xl p-5
  Badge:    px-1.5 py-0.5 rounded text-[10px] font-bold uppercase
  Heading:  text-sm font-semibold text-surface-300 uppercase tracking-wider
  ```

---

## How to Add a New Feature

### Step-by-Step

1. **Plan the data flow**: Where does the data come from → how is it transformed → how is it displayed?
2. **Start with the BFF**: Add mock data generator → add route → test with `curl`
3. **Build the component**: Create a React component in `apps/shell/src/components/`
4. **Wire it up**: Add a hook call in `page.tsx` and pass data to the component
5. **Test**: Verify in browser, check for TypeScript errors

### Example: Adding a "Deployment Timeline" Feature

```
Step 1: Data → packages/bff/src/mock/deployments.ts
        Create generateDeploymentTimeline() mock

Step 2: Route → packages/bff/src/routes/deployments.ts
        GET /api/deployments/timeline

Step 3: Register → packages/bff/src/index.ts
        app.use('/api', deploymentRoutes)

Step 4: Component → apps/shell/src/components/DeploymentTimeline.tsx
        React component with timeline visualization

Step 5: Wire up → apps/shell/src/app/page.tsx
        useBFFData('/api/deployments/timeline', 30000)
        <DeploymentTimeline data={timelineData} />
```

---

## How to Add a New BFF Endpoint

### 1. Create the mock data generator

Create a new file in `packages/bff/src/mock/`:

```typescript
// packages/bff/src/mock/my-feature.ts

export interface MyDataType {
  id: string;
  name: string;
  value: number;
}

export function generateMyData(count: number = 10): MyDataType[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `item-${Date.now()}-${i}`,
    name: `Item ${i + 1}`,
    value: Math.round(Math.random() * 100),
  }));
}
```

### 2. Create the route handler

Create a new file in `packages/bff/src/routes/`:

```typescript
// packages/bff/src/routes/my-feature.ts
import { Router } from 'express';
import { generateMyData } from '../mock/my-feature';

const router = Router();

router.get('/my-feature/data', (req, res) => {
  const count = parseInt(req.query.count as string) || 10;
  res.json({
    success: true,
    data: generateMyData(count),
    timestamp: new Date().toISOString(),
  });
});

export default router;
```

### 3. Register in the main server

In `packages/bff/src/index.ts`:

```typescript
import myFeatureRoutes from './routes/my-feature';
// ... in the route registration section:
app.use('/api', myFeatureRoutes);
```

### 4. Test it

```bash
curl http://localhost:4000/api/my-feature/data
curl http://localhost:4000/api/my-feature/data?count=3
```

---

## How to Add a New Dashboard Component

### 1. Create the component file

```bash
# Create the file
touch apps/shell/src/components/MyNewPanel.tsx
```

### 2. Write the component

```tsx
// apps/shell/src/components/MyNewPanel.tsx
'use client';

import { SomeIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MyNewPanelProps {
  data: any;  // Replace 'any' with proper types later
}

export function MyNewPanel({ data }: MyNewPanelProps) {
  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="bg-surface-900/50 border border-surface-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-4">
          My New Panel
        </h3>
        {/* Your content here */}
        <pre className="text-xs text-surface-400">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}
```

### 3. Add it to the dashboard page

In `apps/shell/src/app/page.tsx`:

```tsx
// Add import at the top
import { MyNewPanel } from '@/components/MyNewPanel';

// Add data hook inside the component
const { data: myData } = useBFFData<any>('/api/my-feature/data', 30000);

// Add the component in the JSX (inside the grid)
<div className="flex items-center gap-2 mb-4">
  <SomeIcon className="w-5 h-5 text-brand-400" />
  <h2 className="text-lg font-bold">My New Panel</h2>
</div>
<MyNewPanel data={myData} />
```

---

## How to Add a New Lit Web Component

### 1. Create the component file

```typescript
// packages/ui-system/src/components/my-widget.ts
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('devpulse-my-widget')
export class DevpulseMyWidget extends LitElement {
  @property({ type: String }) label = 'Default';
  @property({ type: Number }) value = 0;

  static styles = css`
    :host {
      display: block;
      font-family: 'Inter', system-ui, sans-serif;
      background: rgba(15, 23, 42, 0.5);
      border: 1px solid rgba(30, 41, 59, 1);
      border-radius: 12px;
      padding: 16px;
    }
    .label { font-size: 12px; color: #94a3b8; }
    .value { font-size: 24px; font-weight: 700; color: #f1f5f9; }
  `;

  render() {
    return html`
      <span class="label">${this.label}</span>
      <span class="value">${this.value}</span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'devpulse-my-widget': DevpulseMyWidget;
  }
}
```

### 2. Export it from the package index

In `packages/ui-system/src/index.ts`:

```typescript
export { DevpulseMyWidget } from './components/my-widget';
```

### 3. Usage

```html
<devpulse-my-widget label="CPU Usage" value="73"></devpulse-my-widget>
```

---

## How to Add a New Mock Data Generator

Mock data generators should produce **realistic, varied** data. Follow these principles:

### Principles

1. **Use relative timestamps** — Always compute from `Date.now()` so data looks fresh
2. **Randomize within realistic bounds** — Don't use completely random numbers
3. **Use real-world names** — Service names, error messages, and author names should look real
4. **Vary array lengths** — Don't always return exactly 10 items
5. **Map values to correct categories** — A risk score of 90 should have `riskLevel: 'critical'`

### Template

```typescript
// packages/bff/src/mock/my-feature.ts

const SERVICE_NAMES = [
  'api-gateway', 'user-service', 'payment-service',
  'notification-hub', 'search-indexer', 'auth-service',
];

const AUTHOR_NAMES = [
  'Alex Chen', 'Priya Patel', 'Marcus Johnson',
  'Sofia Rodriguez', 'Wei Zhang', 'Emma Thompson',
];

export function generateMyData(count: number = 10) {
  const now = Date.now();

  return Array.from({ length: count }, (_, i) => {
    const value = Math.round(Math.random() * 100);
    const timestamp = new Date(now - Math.random() * 86400000).toISOString();

    return {
      id: `item-${now}-${Math.random().toString(36).slice(2, 8)}`,
      service: SERVICE_NAMES[Math.floor(Math.random() * SERVICE_NAMES.length)],
      author: AUTHOR_NAMES[Math.floor(Math.random() * AUTHOR_NAMES.length)],
      value,
      category: value > 80 ? 'critical' : value > 50 ? 'warning' : 'normal',
      timestamp,
    };
  });
}
```

---

## TypeScript Guidelines

### Strict Mode Rules

- **No `any` in public interfaces** — Use specific types or generics
- **`any` is OK temporarily in component props** — But add a `// TODO: type this` comment
- **Always define return types** for exported functions
- **Use union types** for known string values:
  ```typescript
  // Good
  status: 'success' | 'failure' | 'running' | 'cancelled'

  // Bad
  status: string
  ```

### Where Types Live

| Types for... | Defined in... |
|---|---|
| AI engine data structures | `packages/ai-engine/src/types.ts` |
| Pipeline/DORA data | Inline in mock files (to be extracted) |
| React component props | In the same component file |
| API response wrappers | See `docs/API.md` for type definitions |

---

## Git Workflow & Branch Naming

### Branch Types

| Prefix | Use For | Example |
|--------|---------|---------|
| `feat/` | New features | `feat/deployment-timeline` |
| `fix/` | Bug fixes | `fix/websocket-reconnect` |
| `docs/` | Documentation | `docs/api-reference` |
| `refactor/` | Code cleanup | `refactor/extract-types` |
| `chore/` | Build/tooling | `chore/upgrade-next15` |

### Workflow

```bash
# Start from main
git checkout main
git pull origin main

# Create your branch
git checkout -b feat/my-feature

# Make changes, commit (see format below)
git add .
git commit -m "feat(bff): add deployment timeline endpoint"

# Push and open PR
git push origin feat/my-feature
```

---

## Commit Message Format

We follow **Conventional Commits**:

```
<type>(<scope>): <short description>

[optional longer description]

[optional footer: BREAKING CHANGE, Closes #123]
```

### Types

| Type | When |
|------|------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `test` | Adding or fixing tests |
| `chore` | Build process, dependencies |

### Scopes

| Scope | Package |
|-------|---------|
| `shell` | `apps/shell` |
| `bff` | `packages/bff` |
| `ai` | `packages/ai-engine` |
| `ui` | `packages/ui-system` |
| `infra` | `infra/` |
| `root` | Root config files |

### Examples

```
feat(bff): add deployment timeline endpoint
fix(shell): fix DORA radar chart not rendering on mobile
docs(root): add API reference documentation
refactor(ai): extract common types to shared package
chore(root): upgrade turborepo to v2.2
```

---

## Pull Request Checklist

Before submitting a PR, verify:

- [ ] **Code compiles** — `npm run build` passes (or at least no new errors)
- [ ] **BFF works** — Start BFF, test new/changed endpoints with `curl`
- [ ] **Frontend renders** — Start frontend, verify in browser
- [ ] **No console errors** — Check browser DevTools console
- [ ] **Mobile responsive** — Resize browser or check on a phone
- [ ] **TypeScript strict** — No `// @ts-ignore` or `as any` hacks
- [ ] **Commit messages** — Follow conventional format
- [ ] **Documentation updated** — If you added an endpoint, update `docs/API.md`
- [ ] **Branch is up to date** — Rebased on latest `main`

---

## Troubleshooting for Contributors

### "Module not found" errors after git pull

```bash
# Someone may have added new dependencies
npm install
```

### TypeScript errors in IDE but build works

```bash
# Restart the TypeScript server
# VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### Changes to BFF not reflected

```bash
# tsx watch might have crashed. Restart:
# Kill the terminal and run:
npm run dev:bff
```

### Tailwind classes not applying

- Make sure the class exists in Tailwind's default set or is defined in `tailwind.config.ts`
- Check you're not using a class that requires a plugin (e.g., `@tailwindcss/forms`)
- Purge cache: delete `.next/` folder and restart

### WebSocket not connecting

- BFF must be running on port 4000
- Check browser console for WebSocket errors
- Try: `curl http://localhost:4000/api/health` — if this fails, BFF isn't running

### Port already in use

```bash
# Find the process
lsof -i :3000  # or :4000

# Kill it
kill -9 <PID>
```

---

*Thank you for contributing to DevPulse AI! Every PR makes the platform better for the entire community.*
