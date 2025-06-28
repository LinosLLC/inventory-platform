import React, { useState } from 'react';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  createdAt: string;
}

const permissions: Permission[] = [
  { id: 'dashboard_view', name: 'View Dashboard', description: 'Access to main dashboard', category: 'Dashboard' },
  { id: 'inventory_view', name: 'View Inventory', description: 'View inventory levels and data', category: 'Inventory' },
  { id: 'inventory_edit', name: 'Edit Inventory', description: 'Modify inventory data', category: 'Inventory' },
  { id: 'analytics_view', name: 'View Analytics', description: 'Access to analytics and reports', category: 'Analytics' },
  { id: 'analytics_export', name: 'Export Analytics', description: 'Export analytics data', category: 'Analytics' },
  { id: 'forecasting_view', name: 'View Forecasting', description: 'Access to forecasting data', category: 'Forecasting' },
  { id: 'forecasting_edit', name: 'Edit Forecasting', description: 'Modify forecasting parameters', category: 'Forecasting' },
  { id: 'ai_insights_view', name: 'View AI Insights', description: 'Access to AI insights', category: 'AI' },
  { id: 'ai_insights_edit', name: 'Edit AI Insights', description: 'Modify AI settings', category: 'AI' },
  { id: 'users_view', name: 'View Users', description: 'View user list', category: 'Users' },
  { id: 'users_edit', name: 'Edit Users', description: 'Modify user data', category: 'Users' },
  { id: 'roles_view', name: 'View Roles', description: 'View role definitions', category: 'Roles' },
  { id: 'roles_edit', name: 'Edit Roles', description: 'Modify role permissions', category: 'Roles' },
  { id: 'plants_view', name: 'View Plants', description: 'View plant information', category: 'Plants' },
  { id: 'plants_edit', name: 'Edit Plants', description: 'Modify plant data', category: 'Plants' },
  { id: 'products_view', name: 'View Products', description: 'View product catalog', category: 'Products' },
  { id: 'products_edit', name: 'Edit Products', description: 'Modify product data', category: 'Products' },
];

const initialRoles: Role[] = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full system access with all permissions',
    permissions: permissions.map(p => p.id),
    userCount: 2,
    createdAt: '2023-01-01'
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'Management level access with most permissions',
    permissions: ['dashboard_view', 'inventory_view', 'inventory_edit', 'analytics_view', 'analytics_export', 'forecasting_view', 'forecasting_edit', 'ai_insights_view', 'users_view', 'plants_view', 'plants_edit', 'products_view', 'products_edit'],
    userCount: 3,
    createdAt: '2023-02-15'
  },
  {
    id: 'user',
    name: 'User',
    description: 'Standard user access with basic permissions',
    permissions: ['dashboard_view', 'inventory_view', 'analytics_view', 'forecasting_view', 'ai_insights_view', 'plants_view', 'products_view'],
    userCount: 8,
    createdAt: '2023-03-01'
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only access to basic information',
    permissions: ['dashboard_view', 'inventory_view', 'analytics_view', 'plants_view', 'products_view'],
    userCount: 5,
    createdAt: '2023-04-10'
  }
];

const AdminRoles: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addRole = () => {
    const role: Role = {
      ...newRole,
      id: newRole.name.toLowerCase().replace(/\s+/g, '_'),
      userCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setRoles([...roles, role]);
    setNewRole({
      name: '',
      description: '',
      permissions: []
    });
    setShowForm(false);
  };

  const updateRole = () => {
    if (!editingRole) return;
    const updatedRoles = roles.map(role =>
      role.id === editingRole.id ? editingRole : role
    );
    setRoles(updatedRoles);
    setEditingRole(null);
  };

  const deleteRole = (id: string) => {
    setRoles(roles.filter(role => role.id !== id));
  };

  const startEdit = (role: Role) => {
    setEditingRole(role);
    setNewRole({
      name: role.name,
      description: role.description,
      permissions: role.permissions
    });
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingRole(null);
    setShowForm(false);
    setNewRole({
      name: '',
      description: '',
      permissions: []
    });
  };

  const togglePermission = (permissionId: string) => {
    const currentPermissions = editingRole ? editingRole.permissions : newRole.permissions;
    const newPermissions = currentPermissions.includes(permissionId)
      ? currentPermissions.filter(p => p !== permissionId)
      : [...currentPermissions, permissionId];
    
    if (editingRole) {
      setEditingRole({ ...editingRole, permissions: newPermissions });
    } else {
      setNewRole({ ...newRole, permissions: newPermissions });
    }
  };

  const selectAllPermissions = () => {
    const allPermissionIds = permissions.map(p => p.id);
    if (editingRole) {
      setEditingRole({ ...editingRole, permissions: allPermissionIds });
    } else {
      setNewRole({ ...newRole, permissions: allPermissionIds });
    }
  };

  const clearAllPermissions = () => {
    if (editingRole) {
      setEditingRole({ ...editingRole, permissions: [] });
    } else {
      setNewRole({ ...newRole, permissions: [] });
    }
  };

  const stats = {
    total: roles.length,
    totalUsers: roles.reduce((sum, role) => sum + role.userCount, 0),
    avgPermissions: Math.round(roles.reduce((sum, role) => sum + role.permissions.length, 0) / roles.length),
    customRoles: roles.filter(role => !['admin', 'manager', 'user', 'viewer'].includes(role.id)).length
  };

  const permissionCategories = Array.from(new Set(permissions.map(p => p.category)));

  return (
    <div className="admin-section">
      <h2>Manage Roles & Permissions</h2>
      
      {/* Stats Cards */}
      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Roles</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.totalUsers}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.avgPermissions}</div>
          <div className="stat-label">Avg Permissions</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.customRoles}</div>
          <div className="stat-label">Custom Roles</div>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="admin-search">
        <input
          className="admin-input"
          placeholder="Search roles by name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          className="admin-btn"
          onClick={() => setShowForm(true)}
        >
          Create Role
        </button>
      </div>

      {/* Roles Table */}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Role Name</th>
            <th>Description</th>
            <th>Permissions</th>
            <th>Users</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredRoles.map(role => (
            <tr key={role.id}>
              <td>
                <strong>{role.name}</strong>
                {['admin', 'manager', 'user', 'viewer'].includes(role.id) && (
                  <span className="role-badge admin" style={{ marginLeft: '8px', fontSize: '10px' }}>
                    System
                  </span>
                )}
              </td>
              <td>{role.description}</td>
              <td>
                <span className="status-badge active">
                  {role.permissions.length} permissions
                </span>
              </td>
              <td>{role.userCount} users</td>
              <td>{role.createdAt}</td>
              <td>
                <div className="admin-actions">
                  <button
                    className="action-btn view"
                    onClick={() => startEdit(role)}
                  >
                    Edit
                  </button>
                  {!['admin', 'manager', 'user', 'viewer'].includes(role.id) && (
                    <button
                      className="action-btn delete"
                      onClick={() => deleteRole(role.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="admin-form">
          <h3>{editingRole ? 'Edit Role' : 'Create New Role'}</h3>
          
          {/* Basic Info */}
          <div className="admin-form-grid">
            <input
              className="admin-input"
              placeholder="Role Name"
              value={newRole.name}
              onChange={(e) => setNewRole({...newRole, name: e.target.value})}
            />
            <input
              className="admin-input"
              placeholder="Role Description"
              value={newRole.description}
              onChange={(e) => setNewRole({...newRole, description: e.target.value})}
            />
          </div>

          {/* Permissions Section */}
          <div style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ margin: 0, color: '#333' }}>Permissions</h4>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="action-btn view"
                  onClick={selectAllPermissions}
                  style={{ fontSize: '12px' }}
                >
                  Select All
                </button>
                <button
                  className="action-btn secondary"
                  onClick={clearAllPermissions}
                  style={{ fontSize: '12px' }}
                >
                  Clear All
                </button>
              </div>
            </div>

            {permissionCategories.map(category => (
              <div key={category} style={{ marginBottom: '20px' }}>
                <h5 style={{ margin: '0 0 12px 0', color: '#555', fontSize: '14px', fontWeight: '600' }}>
                  {category}
                </h5>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '8px' }}>
                  {permissions
                    .filter(p => p.category === category)
                    .map(permission => (
                      <label key={permission.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={(editingRole ? editingRole.permissions : newRole.permissions).includes(permission.id)}
                          onChange={() => togglePermission(permission.id)}
                          style={{ margin: 0 }}
                        />
                        <div>
                          <div style={{ fontWeight: '500', fontSize: '14px' }}>{permission.name}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>{permission.description}</div>
                        </div>
                      </label>
                    ))}
                </div>
              </div>
            ))}
          </div>

          <div className="admin-actions">
            <button
              className="admin-btn"
              onClick={editingRole ? updateRole : addRole}
            >
              {editingRole ? 'Update Role' : 'Create Role'}
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

export default AdminRoles; 