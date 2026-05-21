---
name: implement-issue
description: "อ่าน issue detail จาก GitHub → implement feature ใน React+Go → commit → update status. ใช้เมื่อ: ต้องการ implement issue ตั้งแต่ต้นจนจบ, ทำ task จาก project board, implement feature จาก issue แล้ว update สถานะ."
argument-hint: "ระบุ issue number(s) เช่น: 12 หรือ 12,13"
agent: "agent"
---

# Implement Issue Workflow

**อ่าน SKILL ทั้ง 2 ก่อนเริ่ม:**
- [project-workflow-tracker](./../skills/project-workflow-tracker/SKILL.md) — สำหรับ branch, tracking, PR
- [web-implementor](./../skills/web-implementor/SKILL.md) — สำหรับ implement patterns

รับ issue numbers จาก argument แล้วทำตามลำดับนี้

---

## Step 1 — เตรียม Branch + ตรวจสอบสถานะ

> 📋 **Project V2 Tracking**: issues ต้องเป็น **In Progress** ก่อน implement

ตรวจสอบ branch ปัจจุบัน:

```powershell
git branch --show-current
```

- ถ้าอยู่บน `main` หรือ branch ที่ไม่ใช่ `feat/issues-<numbers>` → ให้รัน:
  ```powershell
  .\tools\start-work.ps1 -Issues <issue_numbers>
  # สร้าง branch feat/issues-N และ update → In Progress อัตโนมัติ
  ```
- ถ้าอยู่บน feature branch อยู่แล้ว → ตรวจสอบว่า issues เป็น In Progress แล้วหรือยัง ถ้าไม่ใช่ให้รัน:
  ```powershell
  .\tools\update-status.ps1 -Issues <issue_numbers> -Status "In Progress"
  ```

**หลังจากนี้ issues ต้องเป็น → In Progress บน Project V2**

---

## Step 2 — อ่าน Issue Details

```powershell
.\tools\check-status.ps1 -Issues <issue_numbers>
```

จาก output ให้เก็บ:
- `title` — ชื่อ task
- `body` — รายละเอียดที่ต้อง implement
- `labels` — ประเภทงาน (frontend, backend, bug, etc.)

ถ้า issue ไม่มี body ให้หยุดและแจ้งผู้ใช้ว่า issue ไม่มี description

---

## Step 3 — วิเคราะห์ Requirement

จาก issue details ให้วิเคราะห์และแจ้งผู้ใช้:

1. **ต้องแก้ไขส่วนไหน**: frontend / backend / ทั้งคู่
2. **Files ที่ต้องสร้าง/แก้ไข**: ระบุ path ชัดเจน
3. **Acceptance criteria**: สรุปจาก issue body

ดำเนินการต่อได้เลยถ้า requirement ชัดเจน

---

## Step 4 — Implement

> 📋 **Project V2 Tracking**: สถานะคงเป็น **In Progress** ระหว่าง implement (ไม่มีการเปลี่ยนแปลง)

อ่าน [web-implementor SKILL.md](./../skills/web-implementor/SKILL.md) แล้วทำตาม patterns:

**กฎสำคัญ:**
- Backend: Go stdlib only — ห้าม import package นอก standard library
- Frontend: ใช้ `fetch()` + `import.meta.env.VITE_API_URL || ''`
- ทุก API response ต้องเป็น JSON
- เพิ่ม Route ใหม่ใน `frontend/src/main.jsx` ถ้าสร้าง page ใหม่
- เพิ่ม handler ใน `backend/main.go` ก่อน `log.Fatal`

---

## Step 5 — สรุปการเปลี่ยนแปลง

แสดงรายการ files ที่เปลี่ยนไปทั้งหมดพร้อม diff สั้นๆ แล้วถามผู้ใช้ยืนยันก่อน commit

---

## Step 6 — อ่าน Workflow Tracking (ก่อน commit/push/PR)

**อ่าน** [project-workflow-tracker SKILL.md](./../skills/project-workflow-tracker/SKILL.md) อีกครั้งเพื่อทำความเข้าใจขั้นตอนที่ถูกต้อง โดยเฉพาะ:

- push ไป branch ไหน (ต้องเป็น feature branch ไม่ใช่ main)
- `open-pr.ps1` ทำอะไร และ update status อะไร
- มี tracking อื่นก่อน/หลัง PR หรือไม่

---

## Step 7 — Commit & Push

> 📋 **Project V2 Tracking**: สถานะยังคงเป็น **In Progress** (จะเปลี่ยนเมื่อเปิด PR)

```powershell
git add .
git commit -m "feat: <สรุปสิ่งที่ทำ>"
```

```powershell
$t = (Get-Content .env | Where-Object { $_ -match '^GITHUB_TOKEN=' } | Select-Object -First 1).Split('=',2)[1]
git push "https://<owner>:${t}@github.com/<owner>/<repo>.git" feat/issues-<numbers>
```

commit message ต้องสรุปสั้นๆ ว่าทำอะไร ไม่ต้องใส่ closes ใน message

---

## Step 8 — Open PR

> 📋 **Project V2 Tracking**: การรัน `open-pr.ps1` จะ update issues → **Code Review** อัตโนมัติ

ถามผู้ใช้ว่าต้องการเปิด PR เลยหรือไม่:

- **ใช่**:
  ```powershell
  .\tools\open-pr.ps1 -Issues <issue_numbers>
  # สร้าง PR พร้อม Closes #N
  # issues → Code Review บน Project V2 อัตโนมัติ
  ```
- **ไม่**: จบ workflow แต่แจ้งผู้ใช้ว่าสถานะยังคงเป็น **In Progress** และยังไม่มี PR

---

## สรุป Project V2 Status ใน Workflow นี้

| Step | Action | Project V2 Status |
|---|---|---|
| Step 1 | `start-work.ps1` หรือ `update-status.ps1` | **In Progress** |
| Step 4–7 | กำลัง implement + commit | In Progress (ไม่เปลี่ยน) |
| Step 8 | `open-pr.ps1` | **Code Review** |
| (หลัง PR merged) | auto via `pr-merged.yml` | **Done** |

