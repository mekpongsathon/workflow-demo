# demo-app

Demo project: React (Vite) + Go backend, deployed to fly.io via GitHub Actions.

## Stack

| Part | Technology |
|------|-----------|
| Frontend | React + Vite ? Nginx |
| Backend | Go (stdlib) |
| Registry | ghcr.io (GitHub Container Registry) |
| Deploy UAT | fly.io ? auto on tag push |
| Deploy PROD | fly.io ? manual approval required |

## Local Development

```bash
docker compose up --build
# Frontend: http://localhost:8002
# Backend:  http://localhost:8001/health
```

## Tag Format

```
be/v<version>-<env>    backend
fe/v<version>-<env>    frontend

env: uat | prod

Examples:
  git tag be/v1.0.0-uat && git push origin be/v1.0.0-uat
  git tag fe/v1.0.0-uat && git push origin fe/v1.0.0-uat
  git tag be/v1.0.0-prod && git push origin be/v1.0.0-prod
```

## Deploy Flow

```
push tag be/v1.0.0-uat
  ? GitHub Actions: build Go backend ? push ghcr.io/.../demo-app-api-uat:1.0.0
  ? auto deploy ? https://demo-app-api-uat.fly.dev

push tag be/v1.0.0-prod
  ? GitHub Actions: build ? push ? wait for manual approval
  ? deploy ? https://demo-app-api-prod.fly.dev
```

## One-time Setup

### 1. Install flyctl
```bash
winget install superfly.flyctl
flyctl auth login
```

### 2. Create fly.io apps
```bash
flyctl apps create demo-app-api-uat
flyctl apps create demo-app-api-prod
flyctl apps create demo-app-web-uat
flyctl apps create demo-app-web-prod
```

### 3. GitHub Secrets & Environments
- Secret: `FLY_API_TOKEN` (from `flyctl auth token`)
- Environments: `uat` (no restrictions) + `prod` (add yourself as Required reviewer)
- Settings ? Actions ? General ? Workflow permissions ? Read and write
