const MOCK_METRICS = [
  { label: 'Page Views', value: '12,183', change: '+8%', up: true },
  { label: 'Unique Visitors', value: '7,254', change: '+14%', up: true },
  { label: 'Avg. Session', value: '3m 42s', change: '-5%', up: false },
  { label: 'Conversion', value: '4.2%', change: '+1.1%', up: true },
]

const MOCK_TRAFFIC = [
  { page: '/dashboard', views: 4821, unique: 1203, bounce: '32%' },
  { page: '/login', views: 3102, unique: 2891, bounce: '18%' },
  { page: '/', views: 2740, unique: 2100, bounce: '45%' },
  { page: '/analytics', views: 980, unique: 650, bounce: '28%' },
  { page: '/settings', views: 540, unique: 410, bounce: '22%' },
]

export default function AnalyticsSection() {
  return (
    <div>
      <div className="stats-grid">
        {MOCK_METRICS.map(m => (
          <div key={m.label} className="stat-card">
            <div className="stat-label">{m.label}</div>
            <div className="stat-value">{m.value}</div>
            <div className={`stat-change ${m.up ? 'up' : 'down'}`}>{m.change}</div>
          </div>
        ))}
      </div>

      <div className="activity-box" style={{ marginTop: '1.5rem' }}>
        <h3>Top Pages</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
          <thead>
            <tr style={{ color: '#94a3b8', fontSize: '0.85rem', textAlign: 'left' }}>
              <th style={{ padding: '0.5rem 0.75rem' }}>Page</th>
              <th style={{ padding: '0.5rem 0.75rem' }}>Views</th>
              <th style={{ padding: '0.5rem 0.75rem' }}>Unique</th>
              <th style={{ padding: '0.5rem 0.75rem' }}>Bounce</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_TRAFFIC.map(row => (
              <tr key={row.page} style={{ borderTop: '1px solid #334155' }}>
                <td style={{ padding: '0.6rem 0.75rem', color: '#38bdf8' }}>{row.page}</td>
                <td style={{ padding: '0.6rem 0.75rem' }}>{row.views.toLocaleString()}</td>
                <td style={{ padding: '0.6rem 0.75rem' }}>{row.unique.toLocaleString()}</td>
                <td style={{ padding: '0.6rem 0.75rem', color: '#94a3b8' }}>{row.bounce}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
