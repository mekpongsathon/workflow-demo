---
name: github-workflow-cli
description: 'GitHub Workflow CLI สำหรับจัดการ issues, branches, PRs และ deploy ผ่าน PowerShell tools. ใช้เมื่อ: เริ่มทำ issue (start work), สร้าง branch, เปิด PR, อัปเดต status ใน Project V2, deploy UAT/PROD ด้วย tag, ตรวจสถานะงาน, check status, update deploy, เริ่มงาน issue ใหม่, push tag, ดูว่ากำลังทำ issue อะไรอยู่.'
argument-hint: 'ระบุ action เช่น: start-work, open-pr, deploy-uat, deploy-prod, check-status'
---

# GitHub Workflow CLI

## Workflow Overview

```
Todo → In Progress → Code Review → Done
                                      ↓
                              Deploy UAT (auto)
                                      ↓
                              Deploy PROD (manual approval)
```

## CLI Tools (`tools/`)

| Script | ทำอะไร | Command ตัวอย่าง |
|---|---|---|
| `start-work.ps1` | สร้าง branch + อัปเดต issues → In Progress | `.\tools\start-work.ps1 -Issues 12,13` |
| `open-pr.ps1` | สร้าง PR + อัปเดต issues → Code Review | `.\tools\open-pr.ps1 -Issues 12,13` |
| `update-status.ps1` | อัปเดต status โดยไม่ touch git | `.\tools\update-status.ps1 -Issues 12 -Status "Done"` |
| `update-deploy.ps1` | อัปเดต UAT deploy status | `.\tools\update-deploy.ps1 -Issues "12,13" -Environment uat -Status deploying` |
| `check-status.ps1` | ดู branch, PR, linked issues | `.\tools\check-status.ps1` |
| `discover-ids.ps1` | หา Project V2 field/option IDs | `.\tools\discover-ids.ps1` |
| `setup-uat-fields.ps1` | สร้าง UAT Deploy fields ใน Project V2 | `.\tools\setup-uat-fields.ps1` |

---

## Procedures

### เริ่มทำ issue ใหม่

```powershell
.\tools\start-work.ps1 -Issues 12,13
# สร้าง branch: feat/issues-12-13
# อัปเดต: #12, #13 → In Progress
```

### เปิด PR

```powershell
# commit งานก่อน แล้วรัน
.\tools\open-pr.ps1 -Issues 12,13
.\tools\open-pr.ps1 -Issues 12,13 -Title "feat: my feature" -Reviewers "username"
# สร้าง PR พร้อม Closes #12, Closes #13
# อัปเดต: #12, #13 → Code Review
```

### Deploy UAT

Push tag เพื่อ trigger GitHub Actions อัตโนมัติ:

```powershell
$t = (Get-Content .env | Where-Object { $_ -match '^GITHUB_TOKEN=' } | Select-Object -First 1).Split('=',2)[1]

# Frontend
git tag fe/v1.0.0-uat
git push "https://<owner>:${t}@github.com/<owner>/<repo>.git" fe/v1.0.0-uat

# Backend
git tag be/v1.0.0-uat
git push "https://<owner>:${t}@github.com/<owner>/<repo>.git" be/v1.0.0-uat
```

Tag format: `{fe|be}/v{major}.{minor}.{patch}-uat`

Workflow จะทำ:
1. Build Docker image → push ไป ghcr.io
2. อัปเดต UAT Deploy Status → **Deploying**
3. Deploy ไป fly.io UAT
4. อัปเดต UAT Deploy Status → **Success** หรือ **Failed**

### Deploy PROD

```powershell
$t = (Get-Content .env | Where-Object { $_ -match '^GITHUB_TOKEN=' } | Select-Object -First 1).Split('=',2)[1]

git tag fe/v1.0.0-prod
git tag be/v1.0.0-prod
git push "https://<owner>:${t}@github.com/<owner>/<repo>.git" fe/v1.0.0-prod be/v1.0.0-prod
```

> ต้อง approve ใน GitHub Actions environment `prod` ก่อน deploy จึงจะเริ่ม

### ดูสถานะงานปัจจุบัน

```powershell
.\tools\check-status.ps1
# แสดง: branch, PR number, linked issues
```

---

## Workflow States

| State | เกิดเมื่อ |
|---|---|
| **In Progress** | รัน `start-work.ps1` |
| **Code Review** | รัน `open-pr.ps1` หรือ PR opened → auto via `pr-opened.yml` |
| **Done** | PR merged → auto via `pr-merged.yml` |

## Deploy States (UAT / PROD)

| State | เกิดเมื่อ |
|---|---|
| **Deploying** | เริ่ม deploy job |
| **Success** | Deploy สำเร็จ + บันทึก version |
| **Failed** | Deploy ล้มเหลว |

---

## Tag Naming Convention

```
{prefix}/v{version}-{env}

Prefix:  fe = frontend,  be = backend
Env:     uat,  prod
Version: major.minor.patch

Examples:
  fe/v1.2.3-uat
  be/v1.2.3-prod
```

---

## Configuration

ดูชื่อ GitHub Variables ทั้งหมดที่ต้องตั้งใน [VARIABLES_SETUP.md](../../command/VARIABLES_SETUP.md)

`.env` ที่ root ต้องมี:
```
GITHUB_TOKEN=...
GITHUB_OWNER=...
GITHUB_REPO=...
WORKFLOW_PROJECT_ID=...
```
