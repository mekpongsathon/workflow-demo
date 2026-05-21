import { useState } from 'react'

const MOCK_PROFILE = { name: 'Admin User', email: 'admin@demo-app.com', role: 'Administrator' }
const MOCK_SECURITY = { twoFactor: 'Enabled', sessionTimeout: '30 minutes', lastLogin: '2026-05-21 09:14' }

export default function SettingsSection() {
  const [notif, setNotif] = useState({ email: true, slack: false, sms: false })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      <div className="activity-box">
        <h3 style={{ marginBottom: '1rem' }}>Profile</h3>
        {Object.entries(MOCK_PROFILE).map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #334155', padding: '0.5rem 0' }}>
            <span style={{ color: '#94a3b8', textTransform: 'capitalize' }}>{k}</span>
            <span>{v}</span>
          </div>
        ))}
      </div>

      <div className="activity-box">
        <h3 style={{ marginBottom: '1rem' }}>Notifications</h3>
        {Object.entries(notif).map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', padding: '0.5rem 0' }}>
            <span style={{ textTransform: 'capitalize' }}>{k} Notifications</span>
            <button
              onClick={() => setNotif(prev => ({ ...prev, [k]: !prev[k] }))}
              style={{
                background: v ? 'linear-gradient(135deg, #38bdf8, #818cf8)' : '#1e293b',
                border: '1px solid #334155', borderRadius: '9999px',
                padding: '0.2rem 1rem', cursor: 'pointer',
                color: v ? '#0f172a' : '#94a3b8', fontWeight: 600, fontSize: '0.8rem',
              }}
            >
              {v ? 'ON' : 'OFF'}
            </button>
          </div>
        ))}
      </div>

      <div className="activity-box">
        <h3 style={{ marginBottom: '1rem' }}>Security</h3>
        {Object.entries(MOCK_SECURITY).map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #334155', padding: '0.5rem 0' }}>
            <span style={{ color: '#94a3b8' }}>{k.replace(/([A-Z])/g, ' $1').trim()}</span>
            <span>{v}</span>
          </div>
        ))}
      </div>

    </div>
  )
}
