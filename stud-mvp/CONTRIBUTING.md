# Contributing to STUD

Thank you for considering contributing to STUD! This document outlines the process and guidelines.

## 🚀 Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/stud.git`
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Run tests: `pytest` (backend) and `npm test` (frontend)
6. Commit with conventional commits: `git commit -m "feat: add new feature"`
7. Push and create a Pull Request

## 📋 Development Guidelines

### Code Style

**Python (Backend)**
- Follow PEP 8
- Use type hints
- Maximum line length: 100 characters
- Format with `black` and `isort`

**TypeScript/React (Frontend)**
- Follow Airbnb style guide
- Use functional components with hooks
- Format with Prettier
- Lint with ESLint

### Commit Messages

Use conventional commits format:
- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation changes
- `test:` adding tests
- `refactor:` code refactoring
- `chore:` maintenance tasks

Example: `feat: add quiz generation from transcripts`

### Testing Requirements

- **Unit tests**: All new functions must have unit tests (>80% coverage)
- **Integration tests**: API endpoints must have integration tests
- **E2E tests**: Critical user flows must have E2E tests

### Pull Request Process

1. Ensure all tests pass
2. Update documentation if needed
3. Add description of changes
4. Link related issues
5. Request review from maintainers
6. Address review comments
7. Squash commits before merge

## 🐛 Reporting Bugs

Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md):
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Screenshots if applicable

## ✨ Feature Requests

Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md):
- Problem statement
- Proposed solution
- Alternatives considered
- Additional context

## 🔒 Security

Report security vulnerabilities privately to security@stud.education

Do NOT create public issues for security problems.

## 📜 Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- No harassment or discrimination

## ❓ Questions?

- Check [Documentation](./docs/)
- Search [existing issues](https://github.com/Nekofied007/stud/issues)
- Ask in [Discussions](https://github.com/Nekofied007/stud/discussions)

Thank you for contributing! 🎉
