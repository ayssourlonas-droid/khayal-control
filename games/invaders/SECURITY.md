# Security Policy

## Reporting a Vulnerability

Do **not** open a public GitHub issue for security vulnerabilities.

To report a vulnerability:
- Use the **"Report a vulnerability"** button on the Security tab of this repository (GitHub private advisory)
- Or email: babak@cocode.dk

We will acknowledge within 5 business days and aim to release a fix within 30 days of confirmation.

## Scope

Invaders is a static page with no server, no accounts and no network requests at runtime. The only
data it keeps is in the browser's `localStorage`: the best score and stars per level, the best run
of each level (the inputs its trailer is re-simulated from), the sound setting and whether the demo
has been seen.

## Supported Versions

| Version | Supported |
|---------|-----------|
| latest (`main`, as served at https://invaders.cocode.dk) | ✅ |
| older   | ❌ |
