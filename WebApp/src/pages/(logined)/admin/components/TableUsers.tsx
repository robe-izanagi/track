import React, { useEffect, useState } from 'react';
import axios from 'axios';
import UserModal from './UserModal';

type UserRow = {
  _id: string;
  username: string;
  googleEmail: string | null;
  role: string;
  status: string;
  blockedUntil?: string | null;
  lastSuccessfulLogin?: string | null;
};

const API_BASE = 'http://localhost:5000/api';

const TableUsers: React.FC = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selected, setSelected] = useState<UserRow | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/admin/users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setUsers(res.data.users || []);
    } catch (err: any) {
      console.error('Fetch users error', err);
      setError(err?.response?.data?.error || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openModal = (user: UserRow) => {
    setSelected(user);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelected(null);
  };

  // after block/unblock, refresh list
  const onActionDone = () => {
    fetchUsers();
    closeModal();
  };

  return (
    <div style={{ marginTop: 24 }}>
      <h2>Users</h2>
      {error && <div style={{ color: 'crimson', marginBottom: 8 }}>{error}</div>}
      {loading ? (
        <div>Loading users...</div>
      ) : users.length === 0 ? (
        <div>No users found.</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{  }}>
              <th style={{ border: '1px solid #ddd', padding: 8 }}>Username</th>
              <th style={{ border: '1px solid #ddd', padding: 8 }}>Google Email</th>
              <th style={{ border: '1px solid #ddd', padding: 8 }}>Role</th>
              <th style={{ border: '1px solid #ddd', padding: 8 }}>Status</th>
              <th style={{ border: '1px solid #ddd', padding: 8 }}>Blocked Until</th>
              <th style={{ border: '1px solid #ddd', padding: 8 }}>Last Login</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u._id}
                onClick={() => openModal(u)}
                style={{ cursor: 'pointer' }}
                title="Click to view / manage"
              >
                <td style={{ border: '1px solid #ddd', padding: 8 }}>{u.username}</td>
                <td style={{ border: '1px solid #ddd', padding: 8 }}>{u.googleEmail || 'Not register'}</td>
                <td style={{ border: '1px solid #ddd', padding: 8 }}>{u.role}</td>
                <td style={{ border: '1px solid #ddd', padding: 8 }}>{u.status}</td>
                <td style={{ border: '1px solid #ddd', padding: 8 }}>
                  {u.blockedUntil ? new Date(u.blockedUntil).toLocaleString() : '-'}
                </td>
                <td style={{ border: '1px solid #ddd', padding: 8 }}>
                  {u.lastSuccessfulLogin ? new Date(u.lastSuccessfulLogin).toLocaleString() : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modalOpen && selected && (
        <UserModal user={selected} onClose={closeModal} onDone={onActionDone} />
      )}
    </div>
  );
};

export default TableUsers;
