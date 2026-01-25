# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, please report it by emailing:

**admin@adamic.tech**

Please include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fixes (optional)

## Response Timeline

- **48 hours**: Initial acknowledgment
- **7 days**: Assessment and action plan
- **30 days**: Resolution target for critical issues

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 0.x.x   | ✅        |

## Security Best Practices

When deploying Worker Manager:

1. **Use Cloudflare Access** for authentication
2. **Enable Secret Scanning** in GitHub repository settings
3. **Enable Push Protection** in GitHub repository settings
4. **Never commit** `.env` files or API keys
5. **Rotate API tokens** regularly

## Disclosure Policy

We follow responsible disclosure. Please allow us reasonable time to address
vulnerabilities before public disclosure.
