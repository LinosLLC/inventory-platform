import React, { useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user' | 'viewer';
  status: 'active' | 'inactive' | 'pending';
  department: string;
  lastLogin: string;
  createdAt: string;
}

const initialUsers: User[] = [
  {
    id: 'user1',
    name: 'John Smith',
    email: 'john.smith@company.com',
    role: 'admin',
    status: 'active',
    department: 'IT',
    lastLogin: '2024-01-15 14:30',
    createdAt: '2023-06-01'
  },
  {
    id: 'user2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    role: 'manager',
    status: 'active',
    department: 'Operations',
    lastLogin: '2024-01-14 09:15',
    createdAt: '2023-08-15'
  },
  {
    id: 'user3',
    name: 'Mike Wilson',
    email: 'mike.wilson@company.com',
    role: 'user',
    status: 'active',
    department: 'Warehouse',
    lastLogin: '2024-01-13 16:45',
    createdAt: '2023-10-20'
  },
  {
    id: 'user4',
    name: 'Lisa Brown',
    email: 'lisa.brown@company.com',
    role: 'viewer',
    status: 'pending',
    department: 'Finance',
    lastLogin: 'Never',
    createdAt: '2024-01-10'
  }
];

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'user' as const,
    status: 'pending' as const,
    department: ''
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    const matchesDepartment = filterDepartment === 'all' || user.department === filterDepartment;
    return matchesSearch && matchesRole && matchesStatus && matchesDepartment;
  });

  const addUser = () => {
    const user: User = {
      ...newUser,
      id: `user${Date.now()}`,
      lastLogin: 'Never',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setUsers([...users, user]);
    setNewUser({
      name: '',
      email: '',
      role: 'user',
      status: 'pending',
      department: ''
    });
    setShowForm(false);
  };

  const updateUser = () => {
    if (!editingUser) return;
    const updatedUsers = users.map(user =>
      user.id === editingUser.id ? editingUser : user
    );
    setUsers(updatedUsers);
    setEditingUser(null);
  };

  const deleteUser = (id: string) => {
    setUsers(users.filter(user => user.id !== id));
  };

  const startEdit = (user: User) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setShowForm(false);
    setNewUser({
      name: '',
      email: '',
      role: 'user',
      status: 'pending',
      department: ''
    });
  };

  const toggleUserStatus = (id: string) => {
    setUsers(users.map(user =>
      user.id === id
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
  };

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    pending: users.filter(u => u.status === 'pending').length,
    admins: users.filter(u => u.role === 'admin').length
  };

  const departments = Array.from(new Set(users.map(u => u.department)));

  return (
    <div className="admin-section">
      <h2>Manage Users</h2>
      
      {/* Stats Cards */}
      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.active}</div>
          <div className="stat-label">Active Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.pending}</div>
          <div className="stat-label">Pending Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.admins}</div>
          <div className="stat-label">Administrators</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="admin-search">
        <input
          className="admin-input"
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="filter-select"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="user">User</option>
          <option value="viewer">Viewer</option>
        </select>
        <select
          className="filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
        </select>
        <select
          className="filter-select"
          value={filterDepartment}
          onChange={(e) => setFilterDepartment(e.target.value)}
        >
          <option value="all">All Departments</option>
          {departments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
        <button
          className="admin-btn"
          onClick={() => setShowForm(true)}
        >
          Add User
        </button>
      </div>

      {/* Users Table */}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Department</th>
            <th>Status</th>
            <th>Last Login</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map(user => (
            <tr key={user.id}>
              <td><strong>{user.name}</strong></td>
              <td>{user.email}</td>
              <td>
                <span className={`role-badge ${user.role}`}>
                  {user.role}
                </span>
              </td>
              <td>{user.department}</td>
              <td>
                <span className={`status-badge ${user.status}`}>
                  {user.status}
                </span>
              </td>
              <td>{user.lastLogin}</td>
              <td>{user.createdAt}</td>
              <td>
                <div className="admin-actions">
                  <button
                    className="action-btn view"
                    onClick={() => startEdit(user)}
                  >
                    Edit
                  </button>
                  <button
                    className={`action-btn ${user.status === 'active' ? 'secondary' : 'view'}`}
                    onClick={() => toggleUserStatus(user.id)}
                  >
                    {user.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => deleteUser(user.id)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="admin-form">
          <h3>{editingUser ? 'Edit User' : 'Add New User'}</h3>
          <div className="admin-form-grid">
            <input
              className="admin-input"
              placeholder="Full Name"
              value={editingUser ? editingUser.name : newUser.name}
              onChange={(e) => editingUser 
                ? setEditingUser({...editingUser, name: e.target.value})
                : setNewUser({...newUser, name: e.target.value})
              }
            />
            <input
              className="admin-input"
              type="email"
              placeholder="Email Address"
              value={editingUser ? editingUser.email : newUser.email}
              onChange={(e) => editingUser
                ? setEditingUser({...editingUser, email: e.target.value})
                : setNewUser({...newUser, email: e.target.value})
              }
            />
            <select
              className="admin-input"
              value={editingUser ? editingUser.role : newUser.role}
              onChange={(e) => editingUser
                ? setEditingUser({...editingUser, role: e.target.value as any})
                : setNewUser({...newUser, role: e.target.value as any})
              }
            >
              <option value="viewer">Viewer</option>
              <option value="user">User</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
            <input
              className="admin-input"
              placeholder="Department"
              value={editingUser ? editingUser.department : newUser.department}
              onChange={(e) => editingUser
                ? setEditingUser({...editingUser, department: e.target.value})
                : setNewUser({...newUser, department: e.target.value})
              }
            />
            <select
              className="admin-input"
              value={editingUser ? editingUser.status : newUser.status}
              onChange={(e) => editingUser
                ? setEditingUser({...editingUser, status: e.target.value as any})
                : setNewUser({...newUser, status: e.target.value as any})
              }
            >
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="admin-actions">
            <button
              className="admin-btn"
              onClick={editingUser ? updateUser : addUser}
            >
              {editingUser ? 'Update User' : 'Add User'}
            </button>
            <button
              className="admin-btn secondary"
              onClick={cancelEdit}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers; 