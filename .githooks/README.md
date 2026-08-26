# Git hooks

This repo ships a `pre-commit` hook that runs [gitleaks](https://github.com/gitleaks/gitleaks)
against staged changes and blocks the commit if it finds anything that
looks like a secret (API key, token, password, private key, ...).

`.githooks/` isn't wired up automatically by `git clone` — enable it once
per clone with:

```bash
git config core.hooksPath .githooks
```

The hook uses a local `gitleaks` binary if you have one installed, and
falls back to `docker run zricethezav/gitleaks` otherwise (Docker is
already required for this project's Sail environment). If neither is
available, it prints a warning and lets the commit through rather than
blocking your work.
