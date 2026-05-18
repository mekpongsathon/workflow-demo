import { useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL || ''

function App() {
  const [data, setData] = useState(null)
  const [health, setHealth] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`${API_URL}/api/hello`)
      .then(r => r.json())
      .then(setData)
      .catch(e => setError(e.message))

    fetch(`${API_URL}/health`)
      .then(r => r.json())
      .then(setHealth)
      .catch(() => {})
  }, [])

  return (
    <div className="app">
      <h1>Demo App</h1>
      <div className="env-badge">ENV: {data?.env ?? '...'}</div>
      {error && <div className="error">Backend unreachable: {error}</div>}
      {data && (
        <div className="card">
          <h2>API Response</h2>
          <p>{data.message}</p>
        </div>
      )}
      {health && (
        <div className="card">
          <h2>Health Check</h2>
          <p>Status: <strong>{health.status}</strong></p>
        </div>
      )}
    </div>
  )
}

export default App
