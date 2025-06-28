import React, { useState } from 'react';
import AdminPlants from './admin/AdminPlants';
import AdminUsers from './admin/AdminUsers';
import AdminRoles from './admin/AdminRoles';
import AdminProducts from './admin/AdminProducts';
import { useAuth } from '../contexts/AuthContext';

const TABS = [
  { key: 'plants', label: 'Plants' },
  { key: 'users', label: 'Users' },
  { key: 'roles', label: 'Roles & Access' },
  { key: 'products', label: 'Products' },
];

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('plants');
  const { user } = useAuth();

  if (!user || user.role !== 'admin') {
    return <div style={{ padding: 32, color: 'red' }}>Access denied. Admins only.</div>;
  }

  return (
    <div className="admin-panel dashboard-content">
      <div className="admin-header section-header">
        <h1 className="dashboard-title">Admin Configuration Panel</h1>
        <p className="dashboard-subtitle">Manage plants, users, roles, and products</p>
      </div>
      <div className="admin-tabs">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`admin-tab${activeTab === tab.key ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="admin-content">
        {activeTab === 'plants' && <AdminPlants />}
        {activeTab === 'users' && <AdminUsers />}
        {activeTab === 'roles' && <AdminRoles />}
        {activeTab === 'products' && <AdminProducts />}
      </div>
    </div>
  );
};

export default AdminPanel; 