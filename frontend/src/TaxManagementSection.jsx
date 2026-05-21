const MOCK_SUMMARY = [
  { label: 'ภาษีที่ต้องชำระ', value: '฿48,200', status: 'pending' },
  { label: 'ชำระแล้วปีนี้', value: '฿182,400', status: 'paid' },
  { label: 'ยื่นแบบครั้งถัดไป', value: '30 มิ.ย. 2026', status: 'info' },
  { label: 'เครดิตภาษีคงเหลือ', value: '฿12,000', status: 'credit' },
]

const MOCK_RECORDS = [
  { id: 1, period: 'เม.ย. 2026', type: 'ภาษีมูลค่าเพิ่ม (VAT)', amount: '฿15,400', dueDate: '15 พ.ค. 2026', status: 'ชำระแล้ว' },
  { id: 2, period: 'มี.ค. 2026', type: 'ภาษีมูลค่าเพิ่ม (VAT)', amount: '฿14,800', dueDate: '15 เม.ย. 2026', status: 'ชำระแล้ว' },
  { id: 3, period: 'พ.ค. 2026', type: 'ภาษีหัก ณ ที่จ่าย', amount: '฿8,200', dueDate: '7 มิ.ย. 2026', status: 'รอชำระ' },
  { id: 4, period: 'Q1 2026', type: 'ภาษีเงินได้นิติบุคคล', amount: '฿24,000', dueDate: '30 เม.ย. 2026', status: 'ชำระแล้ว' },
  { id: 5, period: 'พ.ค. 2026', type: 'ภาษีมูลค่าเพิ่ม (VAT)', amount: '฿16,100', dueDate: '15 มิ.ย. 2026', status: 'รอชำระ' },
]

function TaxManagementSection() {
  return (
    <div className="tax-section">
      <div className="stats-grid">
        {MOCK_SUMMARY.map(s => (
          <div key={s.label} className={`stat-card tax-card-${s.status}`}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="activity-box" style={{ marginTop: '1.5rem' }}>
        <h3>รายการภาษี</h3>
        <table className="tax-table">
          <thead>
            <tr>
              <th>งวด</th>
              <th>ประเภทภาษี</th>
              <th>จำนวนเงิน</th>
              <th>ครบกำหนด</th>
              <th>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_RECORDS.map(r => (
              <tr key={r.id}>
                <td>{r.period}</td>
                <td>{r.type}</td>
                <td>{r.amount}</td>
                <td>{r.dueDate}</td>
                <td>
                  <span className={`tax-badge ${r.status === 'ชำระแล้ว' ? 'badge-paid' : 'badge-pending'}`}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TaxManagementSection
