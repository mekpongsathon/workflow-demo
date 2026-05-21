---
name: web-implementor
description: 'Implement web features สำหรับ React+Vite frontend และ Go stdlib backend. ใช้เมื่อ: เพิ่ม API endpoint ใหม่, เพิ่ม React page/component, เชื่อม frontend กับ backend, implement feature จาก issue description, แก้ bug ใน UI หรือ API.'
argument-hint: 'ระบุ feature ที่ต้องการ implement หรือ issue title/body'
---

# Web Implementor

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite 5, react-router-dom v7 |
| Backend | Go 1.25, stdlib only (`net/http`, `encoding/json`) |
| API Communication | `fetch()` + `VITE_API_URL` env var |
| Styling | CSS (App.css) — no UI library |

---

## Project Structure

```
frontend/src/
  main.jsx          ← BrowserRouter + Routes (register new Route here)
  App.jsx           ← landing page (/)
  LoginPage.jsx     ← /login
  DashboardPage.jsx ← /dashboard
  App.css           ← global styles

backend/
  main.go           ← all handlers (add mux.HandleFunc here)
```

---

## Implementation Patterns

### Add a new API endpoint (Go)

Edit `backend/main.go` — inside `main()`, add before `log.Fatal(...)`:

```go
mux.HandleFunc("/api/your-endpoint", func(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]any{
        "key": "value",
    })
})
```

**POST endpoint with body:**

```go
mux.HandleFunc("/api/your-endpoint", func(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {
        http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
        return
    }
    var body struct {
        Field string `json:"field"`
    }
    if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
        http.Error(w, "bad request", http.StatusBadRequest)
        return
    }
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]any{"received": body.Field})
})
```

### Add a new page (React)

**Step 1** — สร้าง `frontend/src/YourPage.jsx`:

```jsx
import { useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL || ''

export default function YourPage() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch(`${API_URL}/api/your-endpoint`)
      .then(r => r.json())
      .then(setData)
      .catch(console.error)
  }, [])

  return (
    <div className="app">
      <h1>Your Page</h1>
      {data && <p>{JSON.stringify(data)}</p>}
    </div>
  )
}
```

**Step 2** — เพิ่ม Route ใน `frontend/src/main.jsx`:

```jsx
import YourPage from './YourPage.jsx'
// ใน <Routes>:
<Route path="/your-path" element={<YourPage />} />
```

### Navigate between pages

```jsx
import { useNavigate } from 'react-router-dom'

const navigate = useNavigate()
// ...
<button onClick={() => navigate('/your-path')}>Go</button>
```

---

## Rules

- **Backend**: stdlib only — ห้าม import package นอก Go standard library
- **Frontend**: ใช้ `fetch()` โดยตรง — ไม่ต้องใช้ axios หรือ library เพิ่ม
- ทุก API response ต้องเป็น JSON (`Content-Type: application/json`)
- `VITE_API_URL` ต้องใช้ผ่าน `import.meta.env.VITE_API_URL || ''` เสมอ
- CORS จัดการโดย middleware ใน `main.go` แล้ว ไม่ต้องเพิ่ม

---

## Multi-Skill Usage

เมื่อใช้ร่วมกับ `project-workflow-tracker`:

```
1. รัน check-status.ps1 -Issues N  → ได้ issue title + body
2. อ่าน issue body เพื่อเข้าใจ requirement
3. ใช้ patterns ด้านบน implement feature
4. commit + รัน open-pr.ps1
```
