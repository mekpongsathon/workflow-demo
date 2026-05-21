import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import UsersSection from './UsersSection.jsx'
import AnalyticsSection from './AnalyticsSection.jsx'
import SettingsSection from './SettingsSection.jsx'
import TaxManagementSection from './TaxManagementSection.jsx'

const MOCK_STATS = [
  { label: 'Total Users', value: '1,284', change: '+12%', up: true },
  { label: 'Active Sessions', value: '342', change: '+5%', up: true },
  { label: 'Revenue (THB)', value: '฿284,500', change: '-3%', up: false },
  { label: 'Open Issues', value: '8', change: '-2', up: true },
]

const MOCK_ACTIVITY = [
  { id: 1, user: 'mekpongsathon', action: 'Merged PR #8 — Dashboard page', time: '2 min ago' },
  { id: 2, user: 'alice', action: 'Opened issue #9 — Fix navbar padding', time: '15 min ago' },
  { id: 3, user: 'bob', action: 'Deployed fe/v1.0.2-uat to UAT', time: '1 hr ago' },
  { id: 4, user: 'mekpongsathon', action: 'Closed issue #7 — Login button', time: '2 hr ago' },
  { id: 5, user: 'carol', action: 'Created branch feat/issues-9', time: '3 hr ago' },
]

const MENUS = ['Overview', 'Users', 'Analytics', 'Settings', 'จัดการภาษี']

function DashboardPage() {
  const navigate = useNavigate()
  const [activeMenu, setActiveMenu] = useState('Overview')

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">Demo App Mek</div>
        <nav className="sidebar-nav">
          {MENUS.map(m => (
            <button
              key={m}
              className={`nav-item${activeMenu === m ? ' active' : ''}`}
              onClick={() => setActiveMenu(m)}
            >
              {m}
            </button>
          ))}
        </nav>
        <button className="btn-logout" onClick={() => navigate('/')}>
          Logout
        </button>
      </aside>

      {/* Main content */}
      <main className="dash-main">
        <header className="dash-header">
          <h2>{activeMenu}</h2>
          <span className="dash-user">👤 admin</span>
        </header>

        {activeMenu === 'Overview' && (
          <>
            {/* Stats */}
            <div className="stats-grid">
              {MOCK_STATS.map(s => (
                <div key={s.label} className="stat-card">
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-value">{s.value}</div>
                  <div className={`stat-change ${s.up ? 'up' : 'down'}`}>{s.change}</div>
                </div>
              ))}
            </div>

            {/* Recent activity */}
            <div className="activity-box">
              <h3>Recent Activity</h3>
              <ul className="activity-list">
                {MOCK_ACTIVITY.map(a => (
                  <li key={a.id} className="activity-item">
                    <span className="act-user">{a.user}</span>
                    <span className="act-action">{a.action}</span>
                    <span className="act-time">{a.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {activeMenu === 'Users' && <UsersSection />}
        {activeMenu === 'Analytics' && <AnalyticsSection />}
        {activeMenu === 'Settings' && <SettingsSection />}
        {activeMenu === 'จัดการภาษี' && <TaxManagementSection />}
      </main>
    </div>
  )
}

export default DashboardPage
