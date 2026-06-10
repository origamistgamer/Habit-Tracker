# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do NOT** open a public issue.
2. Contact the maintainer directly with reproduction steps and impact.
3. Include a suggested fix if possible.

## Security Measures

- **No server-side storage:** Habit data stays in the user's browser (`localStorage`).
- **No API keys required** for core app functionality.
- **Secret scanning:** `gitleaks` runs in pre-commit hooks and GitLab CI.
- **Service worker scope:** Caches only same-origin static assets.

## Supported Versions

| Version | Supported |
|---------|-----------|
| 4.x     | Yes       |
