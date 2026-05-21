# GitHub Workflow Bootstrap — Copilot Setup Guide

> **ให้ Copilot อ่านไฟล์นี้แล้วทำตามทุกขั้นตอนอัตโนมัติ**  
> Copilot จะถาม user เฉพาะเมื่อต้องการข้อมูลที่หาเองไม่ได้ (token, repo name, project ID)

---

## สิ่งที่ไฟล์นี้จะ Setup ให้

เมื่อ setup เสร็จโปรเจคจะมี:

| ส่วน | รายละเอียด |
|---|---|
| `tools/` | PowerShell CLI — start-work, open-pr, check-status, update-deploy |
| `.github/workflows/` | pr-opened.yml, pr-merged.yml, build-and-deploy.yml |
| `.github/scripts/` | update-project-field.sh, update-uat-deploy.sh |
| `.env` | config ทั้งหมดสำหรับ CLI tools |
| GitHub Project V2 | Status field + UAT Deploy fields |
| GitHub Actions | Secrets + Variables ครบ |
| fly.io | 4 apps: api-uat, web-uat, api-prod, web-prod |

---

## Interaction Policy (Copilot ต้องปฏิบัติตาม)

1. **ห้ามเดาค่าที่ไม่รู้** — ถามก่อนเสมอ
2. **ถามทีละเรื่อง** อย่าถามรวมกัน 5 เรื่องในครั้งเดียว
3. **แสดง output ทุก step** อย่าข้าม
4. **ถ้า error ให้หยุดทันที** อธิบาย error แล้วรอ user ตัดสินใจ
5. **sensitive values** (token, password) — บอก user ให้พิมพ์เองในเทอร์มินัล อย่าให้ผ่าน Copilot chat

---

## STEP 1 — ตรวจ Prerequisites

Copilot รันคำสั่งนี้เพื่อตรวจสิ่งที่ต้องมี:

```powershell
# ตรวจ git
git --version

# ตรวจ gh CLI (GitHub CLI)
gh --version

# ตรวจ flyctl
$flyPath = (Get-ChildItem "$env:LOCALAPPDATA\Microsoft\WinGet\Packages" -Filter "flyctl.exe" -Recurse -ErrorAction SilentlyContinue).FullName
if ($flyPath) { & $flyPath version } else { Write-Host "flyctl: NOT FOUND" }

# ตรวจ PowerShell version
$PSVersionTable.PSVersion
```

### ถ้าขาด:

| เครื่องมือ | คำสั่งติดตั้ง |
|---|---|
| `gh` CLI | `winget install --id GitHub.cli --silent --accept-package-agreements --accept-source-agreements` |
| `flyctl` | `winget install --id Fly-io.flyctl --silent --accept-package-agreements --accept-source-agreements` |

> **หมายเหตุ:** หลังติดตั้งต้อง refresh PATH:
> ```powershell
> $env:PATH = [System.Environment]::GetEnvironmentVariable('PATH','Machine') + ';' + [System.Environment]::GetEnvironmentVariable('PATH','User')
> ```

---

## STEP 2 — ถาม User (ข้อมูลที่จำเป็น)

Copilot ต้องถาม user ก่อน แล้วรอคำตอบ:

1. **GitHub Personal Access Token (PAT)** — ต้องมี scope: `repo`, `project`, `workflow`  
   → วิธีสร้าง: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token

2. **GitHub Owner** — username หรือ org name (เช่น `mekpongsathon`)

3. **GitHub Repo name** — ชื่อ repo สำหรับ issue tracking (เช่น `workflow-demo`)

4. **GitHub Project V2 number** — ตัวเลขใน URL ของ Project (เช่น `/projects/3`)  
   → หาได้จาก: `https://github.com/users/{owner}/projects/{number}`

5. **fly.io login** — รัน `flyctl auth login` แล้วให้ user login ในเบราว์เซอร์

> **Copilot:** ถามข้อ 1-4 ก่อน รอคำตอบ แล้วค่อยรัน STEP 3

---

## STEP 3 — Copy template files เข้าโปรเจค

Copilot ดึงไฟล์จาก repo นี้ไปใส่โปรเจค target:

```
tools/
  _github.ps1
  check-status.ps1
  discover-ids.ps1
  open-pr.ps1
  setup-uat-fields.ps1
  start-work.ps1
  update-deploy.ps1
  update-status.ps1
  verify-uat-deploy.ps1

.github/
  scripts/
    update-project-field.sh
    update-uat-deploy.sh
  workflows/
    pr-merged.yml
    pr-opened.yml
    build-and-deploy.yml
  copilot-instructions.md

command/
  copilot-instructions.md
  VARIABLES_SETUP.md
  WORKFLOW-BOOTSTRAP.md  ← ไฟล์นี้
```

> **หมายเหตุ PowerShell encoding:** บน Windows Thai locale (CP874) ถ้าสคริปต์ parse error  
> ให้รัน fix นี้กับทุกไฟล์ใน `tools/` ที่มีปัญหา:
> ```powershell
> $files = Get-ChildItem 'tools\' -Filter '*.ps1'
> foreach ($f in $files) {
>     $txt = (Get-Content $f.FullName -Encoding UTF8) -join "`r`n"
>     $txt = $txt -replace '[^\x00-\x7F]', '-'   # replace non-ASCII
>     [System.IO.File]::WriteAllText($f.FullName, $txt, [System.Text.Encoding]::GetEncoding(874))
> }
> Write-Host "Encoding fixed for all .ps1 files"
> ```

---

## STEP 4 — สร้าง .env

Copilot สร้างไฟล์ `.env` ใน root ของโปรเจค:

```powershell
# สร้าง .env จาก .env.example (ถ้ามี)
Copy-Item .env.example .env -ErrorAction SilentlyContinue

# เขียนค่า (แทนที่ <...> ด้วยค่าจริงที่ user ให้ใน STEP 2)
$envContent = @"
GITHUB_TOKEN=<PAT_TOKEN_จาก_STEP_2>
GITHUB_OWNER=<OWNER_จาก_STEP_2>
GITHUB_REPO=<REPO_จาก_STEP_2>

# Project V2 IDs — จะถูก populate โดย discover-ids.ps1
WORKFLOW_PROJECT_ID=
WORKFLOW_STATUS_FIELD_ID=
WORKFLOW_IN_PROGRESS_OPTION_ID=
WORKFLOW_CODE_REVIEW_OPTION_ID=
WORKFLOW_DONE_OPTION_ID=

# UAT Deploy Tracking — จะถูก populate โดย setup-uat-fields.ps1
WORKFLOW_UAT_DEPLOY_VERSION_FIELD_ID=
WORKFLOW_UAT_DEPLOY_STATUS_FIELD_ID=
WORKFLOW_DEPLOYING_OPTION_ID=
WORKFLOW_DEPLOY_SUCCESS_OPTION_ID=
WORKFLOW_DEPLOY_FAILED_OPTION_ID=
"@
Set-Content .env $envContent -Encoding UTF8
```

> ตรวจว่า `.env` อยู่ใน `.gitignore` — ถ้าไม่มีให้เพิ่ม:
> ```powershell
> if (-not (Select-String -Path .gitignore -Pattern '^\.env$' -Quiet -ErrorAction SilentlyContinue)) {
>     Add-Content .gitignore "`n.env"
> }
> ```

---

## STEP 5 — รัน discover-ids.ps1

```powershell
.\tools\discover-ids.ps1
```

**output ที่ถูกต้อง:**
```
>> discover-ids
   Project ID   : PVT_xxxxx
   Status field : PVTSSF_xxxxx
   Options:
     Todo           : xxxxxxxx
     In Progress    : xxxxxxxx
     Code Review    : xxxxxxxx
     Done           : xxxxxxxx
```

Script นี้จะเขียนค่า `WORKFLOW_*` ลงใน `.env` อัตโนมัติ

> **ถ้า error:**
> - ตรวจ `GITHUB_TOKEN` ใน `.env` ว่าถูกต้อง
> - ตรวจ `WORKFLOW_PROJECT_ID` ว่าใส่ถูก (format: `PVT_xxx`)  
>   หา Project ID ได้จาก: ถาม user ว่า project number คือเลขอะไร แล้วรัน query นี้:
>   ```powershell
>   $token = (Get-Content .env | Select-String 'GITHUB_TOKEN=').ToString().Split('=',2)[1]
>   $owner = (Get-Content .env | Select-String 'GITHUB_OWNER=').ToString().Split('=',2)[1]
>   $query = '{"query":"{ user(login: \"' + $owner + '\") { projectsV2(first: 10) { nodes { id title number } } } }"}'
>   $resp = Invoke-RestMethod -Uri "https://api.github.com/graphql" -Method POST -Headers @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" } -Body $query
>   $resp.data.user.projectsV2.nodes | Format-Table number, title, id
>   ```

---

## STEP 6 — รัน setup-uat-fields.ps1

```powershell
.\tools\setup-uat-fields.ps1
```

**output ที่ถูกต้อง:**
```
>> setup-uat-fields - Project: PVT_xxxxx

-- Checking 'UAT Deploy Version' (text field)...
   FOUND  ID: PVTF_xxxxx

-- Checking 'UAT Deploy Status' (single-select field)...
   FOUND  ID: PVTSSF_xxxxx
   OK     options: Deploying, Success, Failed

DONE: UAT deploy fields ready.
```

Script นี้สร้าง field ใน Project V2 ถ้ายังไม่มี และเขียน ID ลง `.env`

---

## STEP 7 — ตั้ง GitHub Actions Secrets & Variables

Copilot รัน:

```powershell
$env:PATH = [System.Environment]::GetEnvironmentVariable('PATH','Machine') + ';' + [System.Environment]::GetEnvironmentVariable('PATH','User')
$env:GH_TOKEN = (Get-Content .env | Select-String 'GITHUB_TOKEN=').ToString().Split('=',2)[1]
$owner = (Get-Content .env | Select-String 'GITHUB_OWNER=').ToString().Split('=',2)[1]
$repo  = (Get-Content .env | Select-String 'GITHUB_REPO=').ToString().Split('=',2)[1]
$repoFull = "$owner/$repo"

# ── Load all values from .env ──────────────────────────────────────────────────
$envVars = @{}
Get-Content .env | Where-Object { $_ -match '^[^#].+=.+' } | ForEach-Object {
    $parts = $_ -split '=', 2
    $envVars[$parts[0].Trim()] = $parts[1].Trim()
}

# ── Secrets ───────────────────────────────────────────────────────────────────
gh secret set PAT_TOKEN --body $envVars['GITHUB_TOKEN'] --repo $repoFull

# ── Variables ─────────────────────────────────────────────────────────────────
$variables = @(
    'WORKFLOW_PROJECT_ID',
    'WORKFLOW_STATUS_FIELD_ID',
    'WORKFLOW_IN_PROGRESS_OPTION_ID',
    'WORKFLOW_CODE_REVIEW_OPTION_ID',
    'WORKFLOW_DONE_OPTION_ID',
    'WORKFLOW_UAT_DEPLOY_VERSION_FIELD_ID',
    'WORKFLOW_UAT_DEPLOY_STATUS_FIELD_ID',
    'WORKFLOW_DEPLOYING_OPTION_ID',
    'WORKFLOW_DEPLOY_SUCCESS_OPTION_ID',
    'WORKFLOW_DEPLOY_FAILED_OPTION_ID'
)
foreach ($var in $variables) {
    if ($envVars[$var]) {
        gh variable set $var --body $envVars[$var] --repo $repoFull
        Write-Host "  SET  $var = $($envVars[$var])"
    } else {
        Write-Warning "  SKIP $var — not found in .env"
    }
}
Write-Host "DONE: GitHub Actions Secrets and Variables configured"
```

---

## STEP 8 — ตั้ง FLY_API_TOKEN

```powershell
# หา flyctl
$flyPath = (Get-ChildItem "$env:LOCALAPPDATA\Microsoft\WinGet\Packages" -Filter "flyctl.exe" -Recurse -ErrorAction SilentlyContinue).FullName
if (-not $flyPath) { $flyPath = "flyctl" }

# ถ้ายังไม่ได้ login ให้ login ก่อน
# & $flyPath auth login

# ดึง token
$flyToken = (& $flyPath auth token 2>$null)
if (-not $flyToken) {
    Write-Error "Could not get fly.io token. Please run: flyctl auth login"
    exit 1
}

# Set GitHub secret
$env:GH_TOKEN = (Get-Content .env | Select-String 'GITHUB_TOKEN=').ToString().Split('=',2)[1]
$owner = (Get-Content .env | Select-String 'GITHUB_OWNER=').ToString().Split('=',2)[1]
$repo  = (Get-Content .env | Select-String 'GITHUB_REPO=').ToString().Split('=',2)[1]
gh secret set FLY_API_TOKEN --body "$flyToken" --repo "$owner/$repo"
Write-Host "SET  FLY_API_TOKEN on $owner/$repo"
```

> **ถ้า flyctl ยังไม่ได้ login:** บอก user ให้รัน `flyctl auth login` ในเทอร์มินัล แล้วรอ login ผ่านเบราว์เซอร์ก่อน

---

## STEP 9 — สร้าง fly.io Apps

ถาม user ก่อนว่าต้องการชื่อ prefix ของ app อะไร (เช่น `demo-app`) แล้วรัน:

```powershell
$flyPath = (Get-ChildItem "$env:LOCALAPPDATA\Microsoft\WinGet\Packages" -Filter "flyctl.exe" -Recurse -ErrorAction SilentlyContinue).FullName
if (-not $flyPath) { $flyPath = "flyctl" }

$appPrefix = "<ชื่อที่ user ให้>"   # เช่น "demo-app"

$apps = @("$appPrefix-api-uat", "$appPrefix-web-uat", "$appPrefix-api-prod", "$appPrefix-web-prod")
foreach ($app in $apps) {
    Write-Host "Creating: $app"
    & $flyPath apps create $app --org personal 2>&1
}
```

จากนั้น update ชื่อ app ใน fly.toml files:
- `fly-api-uat.toml` → `app = "<prefix>-api-uat"`
- `fly-web-uat.toml` → `app = "<prefix>-web-uat"`  
- `fly-api-prod.toml` → `app = "<prefix>-api-prod"`
- `fly-web-prod.toml` → `app = "<prefix>-web-prod"`

---

## STEP 10 — Commit & Push ทุกไฟล์

```powershell
git add tools/ .github/ command/ .env.example fly-api.Dockerfile fly-web.Dockerfile fly-*.toml
git commit -m "chore: setup GitHub workflow automation"

# Push (ใช้ token ถ้า git credential ไม่ถูกต้อง)
$token = (Get-Content .env | Select-String 'GITHUB_TOKEN=').ToString().Split('=',2)[1]
$owner = (Get-Content .env | Select-String 'GITHUB_OWNER=').ToString().Split('=',2)[1]
$repo  = (Get-Content .env | Select-String 'GITHUB_REPO=').ToString().Split('=',2)[1]
git push "https://${owner}:${token}@github.com/${owner}/${repo}.git" main
```

> **หมายเหตุ:** `.env` ต้องไม่ถูก commit — ตรวจว่าอยู่ใน `.gitignore`

---

## STEP 11 — ทดสอบ End-to-End

### 11.1 ตรวจ issues ใน Project
```powershell
$token = (Get-Content .env | Select-String 'GITHUB_TOKEN=').ToString().Split('=',2)[1]
$owner = (Get-Content .env | Select-String 'GITHUB_OWNER=').ToString().Split('=',2)[1]
$repo  = (Get-Content .env | Select-String 'GITHUB_REPO=').ToString().Split('=',2)[1]
$headers = @{ Authorization = "Bearer $token"; "User-Agent" = "copilot" }
$resp = Invoke-RestMethod -Uri "https://api.github.com/repos/$owner/$repo/issues?state=open&per_page=20" -Headers $headers
$resp | Select-Object number, title | Format-Table -AutoSize
```

**ถ้ายังไม่มี issues:** ถาม user ว่าต้องการสร้าง test issues ไหม แล้วรัน `.\tools\_create-test-issues.ps1`

### 11.2 ทดสอบ workflow
```powershell
# ถาม user ว่าจะทดสอบกับ issue หมายเลขอะไร
.\tools\start-work.ps1 -Issues <number>

# ทำงาน... แล้ว:
.\tools\open-pr.ps1 -Issues <number>

# รอ user merge PR แล้ว push tag
git tag fe/v1.0.0-uat
git push "https://${owner}:${token}@github.com/${owner}/${repo}.git" fe/v1.0.0-uat
```

---

## STEP 12 — Checklist สุดท้าย

Copilot ตรวจและแสดงตารางนี้:

```powershell
$env:GH_TOKEN = (Get-Content .env | Select-String 'GITHUB_TOKEN=').ToString().Split('=',2)[1]
$owner = (Get-Content .env | Select-String 'GITHUB_OWNER=').ToString().Split('=',2)[1]
$repo  = (Get-Content .env | Select-String 'GITHUB_REPO=').ToString().Split('=',2)[1]

Write-Host "=== FINAL CHECKLIST ==="

# ตรวจ secrets
$secrets = (gh secret list --repo "$owner/$repo" 2>&1) -join "`n"
Write-Host "Secrets:"
@("PAT_TOKEN", "FLY_API_TOKEN") | ForEach-Object {
    $status = if ($secrets -match $_) { "OK" } else { "MISSING" }
    Write-Host "  [$status] $_"
}

# ตรวจ variables
$vars = (gh variable list --repo "$owner/$repo" 2>&1) -join "`n"
Write-Host "Variables:"
@("WORKFLOW_PROJECT_ID","WORKFLOW_STATUS_FIELD_ID","WORKFLOW_DONE_OPTION_ID",
  "WORKFLOW_UAT_DEPLOY_STATUS_FIELD_ID","WORKFLOW_UAT_DEPLOY_VERSION_FIELD_ID",
  "WORKFLOW_DEPLOYING_OPTION_ID","WORKFLOW_DEPLOY_SUCCESS_OPTION_ID","WORKFLOW_DEPLOY_FAILED_OPTION_ID"
) | ForEach-Object {
    $status = if ($vars -match $_) { "OK" } else { "MISSING" }
    Write-Host "  [$status] $_"
}

# ตรวจ workflows บน GitHub
$token = (Get-Content .env | Select-String 'GITHUB_TOKEN=').ToString().Split('=',2)[1]
$headers = @{ Authorization = "Bearer $token"; "User-Agent" = "copilot" }
$wf = Invoke-RestMethod -Uri "https://api.github.com/repos/$owner/$repo/actions/workflows" -Headers $headers
Write-Host "Workflows:"
@("pr-merged.yml", "pr-opened.yml", "build-and-deploy.yml") | ForEach-Object {
    $name = $_
    $found = $wf.workflows | Where-Object { $_.path -match $name }
    $status = if ($found) { "OK ($($found.state))" } else { "MISSING" }
    Write-Host "  [$status] $name"
}
Write-Host "=== DONE ==="
```

---

## Common Errors & Fixes

| Error | สาเหตุ | วิธีแก้ |
|---|---|---|
| `Could not resolve to an Issue` | issue ไม่มีใน repo ที่ระบุ | ตรวจ `GITHUB_REPO` ใน `.env` |
| `GraphQL error: Resource not accessible` | PAT ไม่มี scope `project` | สร้าง PAT ใหม่ที่มี scope `project` |
| `no access token available` (flyctl) | `FLY_API_TOKEN` secret ไม่ได้ตั้ง | รัน STEP 8 |
| `Permission denied to <user>` (git push) | git ใช้ account ผิด | ใช้ `https://owner:token@github.com/...` แทน |
| `Unexpected token` (PowerShell) | encoding ไม่ถูก (CP874 vs UTF-8) | รัน encoding fix ใน STEP 3 |
| `Set-Content: file is being used` | VS Code เปิดไฟล์ค้าง | ปิด tab นั้นใน VS Code แล้วรันใหม่ |
| `gh: command not found` | ไม่ได้ติดตั้ง gh CLI | รัน `winget install GitHub.cli` แล้ว refresh PATH |

---

## สรุป Flow หลังจาก Setup เสร็จ

```
Developer                 Copilot CLI              GitHub
─────────────────────────────────────────────────────────
start-work -Issues N  →  สร้าง branch            Issue → In Progress
                         push branch
                         
(ทำงาน...)

open-pr -Issues N     →  สร้าง PR                Issue → Code Review
                         Closes #N

(review + merge)      →                           pr-merged.yml runs
                                                  Issue → Done ✓

git tag fe/v1.0.0-uat →                           build-and-deploy.yml runs
git push tag                                      ├─ build image
                                                  ├─ Issue → UAT Deploy: Deploying
                                                  ├─ flyctl deploy
                                                  └─ Issue → UAT Deploy: Success ✓
```

---

*ไฟล์นี้สร้างขึ้นเพื่อให้ Copilot ทำ setup อัตโนมัติ — อัปเดตล่าสุด: 2026-05*
