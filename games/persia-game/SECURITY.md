# Security Policy

## Reporting a Vulnerability

Do **not** open a public GitHub issue for security vulnerabilities.

To report a vulnerability:
- Use the **"Report a vulnerability"** button on the Security tab of this repository (GitHub private advisory)
- Or email: babak@cocode.dk

We will acknowledge within 5 business days and aim to release a fix within 30 days of confirmation.

## Scope

Persia is a static page with no server, no accounts and no network requests at runtime beyond its
own files. The only data it keeps is in the browser's `localStorage`, under `persia.` keys: the
best score and stars for the level, and the sound setting.

## Supported Versions

| Version | Supported |
|---------|-----------|
| latest (`main`, as served at https://persia.cocode.dk) | ✅ |
| older   | ❌ |
