# Contributing to Ghost in the Git

Thank you for your interest in contributing to Ghost in the Git.

## Development Workflow

Follow these steps to contribute to the project:

1. Fork the repository on GitHub.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/ghost-in-the-git.git
   cd ghost-in-the-git
   ```
3. Install project dependencies:
   ```bash
   pnpm install
   ```
4. Create a new feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
5. Implement your changes.
6. Verify code quality and build integrity:
   ```bash
   pnpm lint
   pnpm build
   ```
7. Commit your changes with clear, descriptive commit messages:
   ```bash
   git commit -m "feat: add your feature description"
   ```
8. Push your branch to your remote fork:
   ```bash
   git push origin feature/your-feature-name
   ```
9. Open a Pull Request against the main branch of the upstream repository.

## Code Standards

- TypeScript: Maintain strict TypeScript typings. Avoid using any and define explicit interfaces or types for all data structures and API contracts.
- Tailwind CSS: Use standard Tailwind utility classes for styling. Avoid custom arbitrary inline styles unless strictly necessary for dynamic runtime values.
- Dependencies: Keep new third-party dependencies to an absolute minimum. Favor native browser APIs and lightweight implementations wherever possible.
