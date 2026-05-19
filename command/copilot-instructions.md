# GitHub Workflow CLI — Copilot Instructions

## Context

This repository uses a structured engineering workflow:
- **GitHub Issues** = tasks (source of truth)
- **GitHub Project V2** = workflow states
- **GitHub Actions** = lifecycle automation
- **PowerShell CLI** (`tools/`) = developer workflow orchestration

## Interaction Policy (Important)

When command input is incomplete, Copilot must ask the user first.

- Do not guess missing values.
- Ask concise follow-up questions and wait for answer before running scripts.
- Required inputs to ask for:
	- Issue numbers for `start-work`, `open-pr`, `update-status`, `update-deploy`
	- Target status for `update-status`
	- Environment for `update-deploy` (`uat`)
	- Version for `update-deploy` when status is `success`
- If a command can affect multiple issues, ask for explicit confirmation of the issue list before execution.

## Workflow States

```
Todo → In Progress → Code Review → Done
```

Deploy states (per environment):
```
waiting → deploying → deployed → failed
```

## Available CLI Tools

When the user asks to start work, create a branch, or update issues, invoke these PowerShell scripts:

### `tools/start-work.ps1`
- Creates a branch and pushes it
- Updates all linked issues to **In Progress**

```powershell
.\tools\start-work.ps1 -Issues 12,15,18
.\tools\start-work.ps1 -Issues 12,15,18 -Branch "feat/my-branch"
```

Example triggers:
> "start issues 12 15 18"
> "เริ่มทำ issue 5 และ 7"

### `tools/open-pr.ps1`
- Creates a PR with `Closes #xx` references
- Updates issues to **Code Review**

```powershell
.\tools\open-pr.ps1 -Issues 12,15,18
.\tools\open-pr.ps1 -Issues 12,15,18 -Title "feat: my title" -Reviewers "user1"
```

Example triggers:
> "open PR for issues 12 15 18"
> "สร้าง PR สำหรับ issue ที่กำลังทำอยู่"

### `tools/update-status.ps1`
- Updates Project V2 status without touching git

```powershell
.\tools\update-status.ps1 -Issues 12,15,18 -Status "In Progress"
.\tools\update-status.ps1 -Issues 12,15,18 -Status "Code Review"
.\tools\update-status.ps1 -Issues 12,15,18 -Status "Done"
```

### `tools/update-deploy.ps1`
- Updates deploy field in Project V2

```powershell
.\tools\update-deploy.ps1 -Issues "12,15,18" -Environment uat -Status deploying
.\tools\update-deploy.ps1 -Issues "12,15,18" -Environment uat -Version "1.2.3" -Status success
.\tools\update-deploy.ps1 -Issues "12,15,18" -Environment uat -Status failed
```

Example triggers:
> "อัพเดต deploy ของ issue 12 15 18 เป็น deploying บน uat"
> "อัพเดต deploy ของ issue 12 เป็น success version 1.2.3"

### `tools/check-status.ps1`
- Summarizes current branch, PR, and linked issues

```powershell
.\tools\check-status.ps1
```

Example triggers:
> "what am I working on?"
> "สถานะงานตอนนี้คืออะไร"

### `tools/discover-ids.ps1`
- Queries Project V2 field and option IDs (run once to set up `.env`)

```powershell
.\tools\discover-ids.ps1
```

## Branch Naming Convention

Branches are auto-named: `feat/issues-{n1}-{n2}-...`  
Example: `feat/issues-12-15-18`

## Source of Truth Rules

- **Do NOT parse branch names** to determine linked issues
- **PR description** with `Closes #xx` = authoritative issue linkage
- **GitHub Project V2** = authoritative workflow state
- Always invoke CLI tools — do NOT call GitHub APIs directly from chat

## PR Description Format

```
Closes #12
Closes #15
Closes #18

---
Brief description of changes
```

## Setup

Copy `.env.example` to `.env` and fill in values.  
Run `.\tools\discover-ids.ps1` to find Project V2 option IDs.

## Clarification Examples

If user says: `เริ่มทำงาน issue ให้หน่อย`

Copilot should ask:
`ขอเลข issue ที่ต้องการเริ่มงานครับ (เช่น 12,15,18)`

If user says: `อัพเดต deploy ให้ที`

Copilot should ask:
`ต้องการอัพเดต issue ไหน, status อะไร (deploying/success/failed), และถ้า success ขอ version ด้วยครับ`
