---
name: implement-issue
description: "อ่าน issue detail จาก GitHub → implement feature ใน React+Go → commit → update status. ใช้เมื่อ: ต้องการ implement issue ตั้งแต่ต้นจนจบ, ทำ task จาก project board, implement feature จาก issue แล้ว update สถานะ."
argument-hint: "ระบุ issue number(s) เช่น: 12 หรือ 12,13"
agent: "agent"
---

# Implement Issue Workflow

รับ issue numbers จาก argument แล้วทำตาม 5 ขั้นตอนนี้ตามลำดับ

---

## Step 1 — อ่าน Issue Details

อ่าน SKILL.md ของ `project-workflow-tracker` ที่ [.github/skills/project-workflow-tracker/SKILL.md](./../skills/project-workflow-tracker/SKILL.md) ก่อนเสมอ

รัน PowerShell เพื่อดึงรายละเอียด issue:

```powershell
.\tools\check-status.ps1 -Issues <issue_numbers>
```

จาก output ให้เก็บ:
- `title` — ชื่อ task
- `body` — รายละเอียดที่ต้อง implement
- `labels` — ประเภทงาน (frontend, backend, bug, etc.)
- `state` — ต้องเป็น `open`

ถ้า issue ไม่มี body ให้หยุดและแจ้งผู้ใช้ว่า issue ไม่มี description

---

## Step 2 — วิเคราะห์ Requirement

จาก issue details ให้วิเคราะห์และแจ้งผู้ใช้:

1. **ต้องแก้ไขส่วนไหน**: frontend / backend / ทั้งคู่
2. **Files ที่ต้องสร้าง/แก้ไข**: ระบุ path ชัดเจน
3. **Acceptance criteria**: สรุปจาก issue body

รอ confirmation จากผู้ใช้หรือดำเนินการต่อถ้าชัดเจน

---

## Step 3 — Implement

อ่าน SKILL.md ของ `web-implementor` ที่ [.github/skills/web-implementor/SKILL.md](./../skills/web-implementor/SKILL.md) ก่อน implement

ทำตาม patterns ใน web-implementor:

**กฎสำคัญ:**
- Backend: Go stdlib only — ห้าม import package นอก standard library
- Frontend: ใช้ `fetch()` + `import.meta.env.VITE_API_URL || ''`
- ทุก API response ต้องเป็น JSON
- เพิ่ม Route ใหม่ใน `frontend/src/main.jsx` ถ้าสร้าง page ใหม่
- เพิ่ม handler ใน `backend/main.go` ก่อน `log.Fatal`

---

## Step 4 — สรุปการเปลี่ยนแปลง

แสดงรายการ files ที่เปลี่ยนไปทั้งหมดพร้อม diff สั้นๆ แล้วถามผู้ใช้ยืนยันก่อน commit

---

## Step 5 — Commit

หลังได้รับการยืนยัน:

```powershell
git add .
git commit -m "feat: <สรุปสิ่งที่ทำ>"
```

commit message ต้องสรุปสั้นๆ ว่าทำอะไร ไม่ต้องใส่ closes ใน message

---

## Step 6 — Open PR (ถาม)

ถามผู้ใช้ว่าต้องการเปิด PR เลยหรือไม่:

- **ใช่**: `.\tools\open-pr.ps1 -Issues <issue_numbers>` → issues จะถูก update → Code Review
- **ไม่**: จบ workflow, แจ้งว่า branch พร้อม push แล้ว
