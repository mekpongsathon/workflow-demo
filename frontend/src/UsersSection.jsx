import { useState } from 'react'

const INITIAL_USERS = [
  { id: 1, name: 'Mek Pongsathon', email: 'mek@example.com', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Alice Smith', email: 'alice@example.com', role: 'Editor', status: 'Active' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Viewer', status: 'Inactive' },
  { id: 4, name: 'Carol White', email: 'carol@example.com', role: 'Editor', status: 'Active' },
  { id: 5, name: 'Dave Brown', email: 'dave@example.com', role: 'Viewer', status: 'Active' },
]

const ROLES = ['Admin', 'Editor', 'Viewer']
const EMPTY_FORM = { name: '', email: '', role: 'Viewer', status: 'Active' }

function UsersSection() {
  const [users, setUsers] = useState(INITIAL_USERS)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null) // null | { mode: 'add'|'edit', data }
  const [form, setForm] = useState(EMPTY_FORM)
  const [deleteConfirm, setDeleteConfirm] = useState(null) // user id

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  function openAdd() {
    setForm(EMPTY_FORM)
    setModal({ mode: 'add' })
  }

  function openEdit(user) {
    setForm({ name: user.name, email: user.email, role: user.role, status: user.status })
    setModal({ mode: 'edit', id: user.id })
  }

  function saveUser() {
    if (!form.name.trim() || !form.email.trim()) return
    if (modal.mode === 'add') {
      const newId = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1
      setUsers([...users, { id: newId, ...form }])
    } else {
      setUsers(users.map(u => u.id === modal.id ? { id: modal.id, ...form } : u))
    }
    setModal(null)
  }

  function deleteUser(id) {
    setUsers(users.filter(u => u.id !== id))
    setDeleteConfirm(null)
  }

  return (
    <div className="users-section">
      <div className="users-toolbar">
        <input
          className="users-search"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button className="btn-primary" onClick={openAdd}>+ Add User</button>
      </div>

      <div className="users-table-wrap">
        <table className="users-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan="6" className="users-empty">No users found</td></tr>
            )}
            {filtered.map(u => (
              <tr key={u.id}>
                <td className="td-id">{u.id}</td>
                <td>{u.name}</td>
                <td className="td-email">{u.email}</td>
                <td><span className={`badge role-${u.role.toLowerCase()}`}>{u.role}</span></td>
                <td><span className={`badge status-${u.status.toLowerCase()}`}>{u.status}</span></td>
                <td className="td-actions">
                  <button className="btn-edit" onClick={() => openEdit(u)}>Edit</button>
                  <button className="btn-delete" onClick={() => setDeleteConfirm(u.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="users-count">{filtered.length} user{filtered.length !== 1 ? 's' : ''}</div>

      {/* Add / Edit Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>{modal.mode === 'add' ? 'Add User' : 'Edit User'}</h3>
            <div className="form-group">
              <label>Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn-primary" onClick={saveUser}>Save</button>
              <button className="btn-cancel" onClick={() => setModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>Delete User?</h3>
            <p style={{ color: '#94a3b8', marginBottom: '1.25rem' }}>
              Are you sure you want to delete <strong>{users.find(u => u.id === deleteConfirm)?.name}</strong>?
            </p>
            <div className="modal-actions">
              <button className="btn-delete-confirm" onClick={() => deleteUser(deleteConfirm)}>Delete</button>
              <button className="btn-cancel" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UsersSection
