# GitHub Workflow Setup

> Copy folder นี้ไปวางที่ root ของโปรเจคใหม่ แล้วบอก Copilot ว่า:
>
> **"อ่านไฟล์ `workflow-setup/README.md` แล้วทำตามทุก step"**

---

## สิ่งที่จะ Setup ให้

| ส่วน | รายละเอียด |
|---|---|
| `tools/` | PowerShell CLI — start-work, open-pr, check-status, update-deploy |
| `.github/workflows/` | pr-opened.yml, pr-merged.yml, build-and-deploy.yml |
| `.github/scripts/` | update-project-field.sh, update-uat-deploy.sh |
| `.env` | config สำหรับ CLI tools |
| GitHub Project V2 | Status field + UAT Deploy fields |
| GitHub Actions | Secrets + Variables ครบ |

---

## Interaction Policy (Copilot ต้องปฏิบัติตาม)

1. **ห้ามเดาค่าที่ไม่รู้** — ถามก่อนเสมอ รอคำตอบก่อนไปขั้นต่อไป
2. **ถามทีละเรื่อง** อย่าถามรวม 5 เรื่องในครั้งเดียว
3. **แสดง output ทุก step** อย่าข้าม
4. **ถ้า error ให้หยุดทันที** อธิบาย error แล้วรอ user ตัดสินใจ
5. **sensitive values** (token, password) — บอก user ให้พิมพ์เองในเทอร์มินัล ห้ามให้ผ่าน Copilot chat

---

## STEP 1 — ตรวจ Prerequisites

```powershell
git --version
gh --version
$PSVersionTable.PSVersion
```

ถ้าขาด `gh` CLI:
```powershell
winget install --id GitHub.cli --silent --accept-package-agreements --accept-source-agreements
$env:PATH = [System.Environment]::GetEnvironmentVariable('PATH','Machine') + ';' + [System.Environment]::GetEnvironmentVariable('PATH','User')
```

---

## STEP 2 — Copy ไฟล์เข้าโปรเจค

```powershell
# รันจาก root ของโปรเจค (ที่ workflow-setup/ อยู่)
Copy-Item "workflow-setup\tools"  -Destination "tools"   -Recurse -Force
Copy-Item "workflow-setup\github" -Destination ".github" -Recurse -Force
```

ตรวจว่าไฟล์ครบ:
```powershell
Test-Path "tools\_github.ps1"
Test-Path ".github\workflows\build-and-deploy.yml"
Test-Path ".github\scripts\update-uat-deploy.sh"
```

---

## STEP 3 — ถาม User (ข้อมูลที่จำเป็น)

Copilot ถามตามลำดับนี้ รอคำตอบก่อนไปขั้นต่อไป:

1. **GitHub Owner** — username หรือ org name (เช่น `mekpongsathon`)
2. **GitHub Repo name** — ชื่อ repo ที่ใช้ track issues (เช่น `my-project`)
3. **GitHub Project V2 number** — ตัวเลขใน URL `https://github.com/users/{owner}/projects/{number}`
4. **PAT Token** — บอก user: *"กรุณาพิมพ์ PAT Token โดยตรงในเทอร์มินัล (ต้องมี scope: repo, project, workflow)"*  
   → วิธีสร้าง: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)

---

## STEP 4 — สร้าง .env

```powershell
$envContent = @"
GITHUB_TOKEN=<ให้ user พิมพ์ลงโดยตรง>
GITHUB_OWNER=<จาก STEP 3>
GITHUB_REPO=<จาก STEP 3>

# ค่าด้านล่างจะถูก populate โดย STEP 6-7
WORKFLOW_PROJECT_ID=
WORKFLOW_STATUS_FIELD_ID=
WORKFLOW_IN_PROGRESS_OPTION_ID=
WORKFLOW_CODE_REVIEW_OPTION_ID=
WORKFLOW_DONE_OPTION_ID=
WORKFLOW_UAT_DEPLOY_VERSION_FIELD_ID=
WORKFLOW_UAT_DEPLOY_STATUS_FIELD_ID=
WORKFLOW_DEPLOYING_OPTION_ID=
WORKFLOW_DEPLOY_SUCCESS_OPTION_ID=
WORKFLOW_DEPLOY_FAILED_OPTION_ID=
"@
Set-Content .env $envContent -Encoding UTF8
```

เพิ่ม `.env` ใน `.gitignore`:
```powershell
if (-not (Select-String -Path .gitignore -Pattern '^\.env$' -Quiet -ErrorAction SilentlyContinue)) {
    Add-Content .gitignore "`n.env"
}
```

> **Copilot:** บอก user ให้เปิดไฟล์ `.env` แล้วแทนที่ `<ให้ user พิมพ์ลงโดยตรง>` ด้วย token จริง

---

## STEP 5 — หา Project V2 ID

```powershell
$owner = (Get-Content .env | Select-String 'GITHUB_OWNER=').ToString().Split('=',2)[1].Trim()
$token = (Get-Content .env | Select-String 'GITHUB_TOKEN=').ToString().Split('=',2)[1].Trim()
$projNum = <PROJECT_NUMBER_จาก_STEP_3>

$body = '{"query":"{ user(login: \"' + $owner + '\") { projectsV2(first: 20) { nodes { id number title } } } }"}'
$resp = Invoke-RestMethod "https://api.github.com/graphql" -Method POST `
    -Headers @{ Authorization="bearer $token"; "Content-Type"="application/json" } `
    -Body $body
$proj = $resp.data.user.projectsV2.nodes | Where-Object { $_.number -eq $projNum }
Write-Host "Project ID: $($proj.id)"
```

แล้วอัปเดตใน `.env`:
```
WORKFLOW_PROJECT_ID=PVT_xxxx...
```

---

## STEP 6 — รัน discover-ids.ps1

```powershell
.\tools\discover-ids.ps1
```

Script จะแสดง Field IDs และ Option IDs ทั้งหมด ให้ copy ค่าลง `.env`

---

## STEP 7 — รัน setup-uat-fields.ps1

```powershell
.\tools\setup-uat-fields.ps1
```

Script จะสร้าง "UAT Deploy Status" + "UAT Deploy Version" fields ใน Project V2 อัตโนมัติ และเขียน IDs ลง `.env`

---

## STEP 8 — ตั้ง GitHub Repository Variables

ไปที่: **Settings → Secrets and variables → Actions → Variables**

```powershell
# ดู IDs ที่ต้องตั้ง
Get-Content .env | Select-String "WORKFLOW_"
```

ดูชื่อ variable ทั้งหมดใน `workflow-setup/VARIABLES_SETUP.md`

---

## STEP 9 — ตั้ง GitHub Secrets

ไปที่: **Settings → Secrets and variables → Actions → Secrets**

| Secret | วิธีได้มา |
|---|---|
| `PAT_TOKEN` | PAT Token จาก STEP 3 |
| `FLY_API_TOKEN` | `flyctl auth token` (ถ้าใช้ fly.io deploy) |

---

## STEP 10 — Commit และ Push

```powershell
git add tools/ .github/
git commit -m "chore: add GitHub workflow automation"
git push origin main
```

---

## เสร็จแล้ว!

ทดสอบโดยสร้าง issue ใหม่ แล้วรัน:
```powershell
.\tools\start-work.ps1 -Issues <issue_number>
```

ดู reference เพิ่มเติม: `workflow-setup/VARIABLES_SETUP.md`
