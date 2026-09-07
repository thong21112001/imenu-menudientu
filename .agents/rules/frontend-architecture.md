# Frontend Architecture & Development Rules

## 1. Technology Context

The project is a Frontend Monorepo built around:

- Turborepo
- npm Workspaces
- TypeScript
- React
- Next.js

Do not introduce an alternative framework, package manager, build system, or major architectural pattern without explicit authorization.

---

## 2. Monorepo Structure

Applications belong under:

```text
apps/
```

Shared libraries and project-wide packages belong under:

```text
packages/
```

Current applications:

```text
apps/imenu-admin
apps/imenu-client-web
apps/imenu-customer-menu
```

Current shared packages:

```text
packages/ui
packages/utils
packages/types
packages/typescript-config
packages/eslint-config
```

Respect these boundaries.

---

## 3. Application Boundaries

Application-specific logic should remain inside its corresponding application unless there is a clear and justified need to share it.

Do not move application-specific behavior into shared packages merely for abstraction.

Avoid circular dependencies between applications and shared packages.

A shared package should contain functionality that is genuinely reusable.

---

## 4. Shared Packages

Before creating a reusable component, utility, or type:

1. Check whether an equivalent already exists.
2. Reuse it when appropriate.
3. Extend an existing abstraction when appropriate.
4. Create a new abstraction only when it provides meaningful reuse or separation.

Avoid duplicate shared components and utilities.

---

## 5. TypeScript

Use strong typing throughout the codebase.

Prefer:

- Explicit domain types.
- Existing shared types.
- Type-safe function boundaries.
- Narrow and meaningful types.
- Existing project conventions.

Avoid `any` unless there is a documented technical reason.

Do not weaken types merely to suppress compiler errors.

Do not duplicate an existing shared type without a valid reason.

---

## 6. React Components

Prefer:

- Small, focused components.
- Clear responsibilities.
- Composition.
- Reusable components where reuse is real.
- Predictable props and state boundaries.

Avoid:

- Monolithic components.
- Excessive prop drilling when an existing project pattern already solves it.
- Premature abstraction.
- Duplicate components with nearly identical behavior.

---

## 7. Next.js

Follow the existing project conventions for:

- App Router
- Server Components
- Client Components
- Server Actions
- Route Handlers
- Data fetching
- Caching
- Metadata
- Rendering strategy

Do not add `"use client"` unless required.

Do not convert Server Components to Client Components without a valid reason.

Do not change rendering or caching behavior as an unrelated optimization.

Before changing an existing Next.js pattern, inspect how the project currently uses it.

---

## 8. UI and Design System

When implementing UI:

1. Check `packages/ui` first.
2. Reuse an existing shared component when suitable.
3. Preserve the existing design language.
4. Preserve responsive behavior.
5. Preserve accessibility.
6. Avoid unnecessary one-off replacements for existing shared components.

Do not create duplicate design-system components without first checking the shared UI package.

---

## 9. API Integration

Before adding or modifying API integration:

1. Inspect the existing API client or service layer.
2. Inspect existing TypeScript request and response types.
3. Inspect existing request patterns.
4. Inspect existing error-handling patterns.
5. Reuse project conventions.

Do not invent an API contract based on assumptions.

Do not silently change request or response structures.

If an API contract is unclear, ask the user or inspect the available project source before making assumptions.

---

## 10. State Management

Prefer the existing state-management approach used by the project.

Do not introduce a new state-management library unless:

- The existing approach cannot reasonably satisfy the requirement, and
- The user explicitly authorizes the architectural change.

Avoid adding global state for data that can remain local.

---

## 11. Styling

Use the existing styling approach and design conventions already present in the target application or shared UI package.

Do not introduce a new styling system for a single feature.

Avoid mixing multiple styling paradigms without a clear project-level reason.

---

## 12. Dependency Management

Before installing a dependency:

1. Inspect the existing dependencies.
2. Check whether equivalent functionality already exists.
3. Determine whether the dependency is genuinely necessary.
4. Prefer the smallest reasonable dependency footprint.

Do not:

- Install packages unnecessarily.
- Replace an existing dependency without a reason.
- Upgrade major dependencies as part of an unrelated task.
- Introduce duplicate libraries that solve the same problem.

---

## 13. Project Configuration

Respect existing:

```text
package.json
turbo.json
tsconfig*
eslint*
Next.js configuration
workspace configuration
```

Modify configuration only when required.

When changing shared configuration, consider the impact on every application and package that consumes it.

---

## 14. Code Quality

Prefer:

- Readability
- Maintainability
- Consistency
- Type safety
- Explicit behavior
- Small focused modules
- Existing project conventions

Avoid:

- Premature abstraction
- Over-engineering
- Unnecessary indirection
- Hidden side effects
- Magic constants without context
- Duplicated business logic

---

## 15. Validation

Validate the smallest relevant scope first.

Preferred progression:

```text
Changed file / feature
        ↓
Related package
        ↓
Related application
        ↓
Monorepo-wide validation
```

Use the project's existing scripts.

Possible checks include:

```bash
npm run lint
npm run typecheck
npm run build
turbo run lint
turbo run typecheck
turbo run build
```

Run only commands relevant to the repository and task.

Do not modify project configuration merely to make validation pass.

---

## 16. No Unrelated Refactoring

When implementing a feature or fixing a bug:

- Do not rewrite unrelated modules.
- Do not rename unrelated symbols.
- Do not reorganize unrelated folders.
- Do not reformat unrelated files.
- Do not upgrade unrelated dependencies.
- Do not alter unrelated UI.

Keep the diff focused and reviewable.

---

## 17. Architecture Change Gate

The following are considered major architecture changes:

- Introducing a new framework.
- Replacing the state-management strategy.
- Replacing the styling system.
- Replacing the data-fetching strategy.
- Replacing the build system.
- Changing the Monorepo organization.
- Creating a new shared platform-wide abstraction.
- Changing application boundaries.
- Introducing a new major dependency category.

These changes require explicit user approval before implementation.

---

## 18. Frontend Principle

Use this decision order:

```text
Existing convention
      ↓
Existing shared abstraction
      ↓
Small local implementation
      ↓
New shared abstraction only when justified
      ↓
Architectural change only with authorization
```
