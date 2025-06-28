import React, { useState } from 'react';

interface Plant {
  id: string;
  name: string;
  location: string;
  type: string;
  capacity: number;
  status: 'active' | 'inactive' | 'maintenance';
  efficiency: number;
  lastUpdated: string;
}

const initialPlants: Plant[] = [
  { 
    id: 'plant1', 
    name: 'Plant A', 
    location: 'New York', 
    type: 'manufacturing', 
    capacity: 10000,
    status: 'active',
    efficiency: 85,
    lastUpdated: '2024-01-15'
  },
  { 
    id: 'plant2', 
    name: 'Plant B', 
    location: 'Chicago', 
    type: 'warehouse', 
    capacity: 5000,
    status: 'active',
    efficiency: 92,
    lastUpdated: '2024-01-14'
  },
  { 
    id: 'plant3', 
    name: 'Plant C', 
    location: 'Los Angeles', 
    type: 'distribution', 
    capacity: 7500,
    status: 'maintenance',
    efficiency: 0,
    lastUpdated: '2024-01-10'
  },
];

const AdminPlants: React.FC = () => {
  const [plants, setPlants] = useState<Plant[]>(initialPlants);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
  const [newPlant, setNewPlant] = useState({
    name: '',
    location: '',
    type: 'manufacturing',
    capacity: 0,
    status: 'active' as const,
    efficiency: 0
  });

  const filteredPlants = plants.filter(plant => {
    const matchesSearch = plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plant.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || plant.type === filterType;
    const matchesStatus = filterStatus === 'all' || plant.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const addPlant = () => {
    const plant: Plant = {
      ...newPlant,
      id: `plant${Date.now()}`,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    setPlants([...plants, plant]);
    setNewPlant({
      name: '',
      location: '',
      type: 'manufacturing',
      capacity: 0,
      status: 'active',
      efficiency: 0
    });
    setShowForm(false);
  };

  const updatePlant = () => {
    if (!editingPlant) return;
    const updatedPlants = plants.map(plant =>
      plant.id === editingPlant.id
        ? { ...editingPlant, lastUpdated: new Date().toISOString().split('T')[0] }
        : plant
    );
    setPlants(updatedPlants);
    setEditingPlant(null);
  };

  const deletePlant = (id: string) => {
    setPlants(plants.filter(plant => plant.id !== id));
  };

  const startEdit = (plant: Plant) => {
    setEditingPlant(plant);
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingPlant(null);
    setShowForm(false);
    setNewPlant({
      name: '',
      location: '',
      type: 'manufacturing',
      capacity: 0,
      status: 'active',
      efficiency: 0
    });
  };

  const stats = {
    total: plants.length,
    active: plants.filter(p => p.status === 'active').length,
    maintenance: plants.filter(p => p.status === 'maintenance').length,
    avgEfficiency: Math.round(plants.filter(p => p.status === 'active').reduce((sum, p) => sum + p.efficiency, 0) / Math.max(plants.filter(p => p.status === 'active').length, 1))
  };

  return (
    <div className="admin-section">
      <h2>Manage Plants</h2>
      
      {/* Stats Cards */}
      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Plants</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.active}</div>
          <div className="stat-label">Active Plants</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.maintenance}</div>
          <div className="stat-label">In Maintenance</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.avgEfficiency}%</div>
          <div className="stat-label">Avg Efficiency</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="admin-search">
        <input
          className="admin-input"
          placeholder="Search plants by name or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="filter-select"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="manufacturing">Manufacturing</option>
          <option value="warehouse">Warehouse</option>
          <option value="distribution">Distribution</option>
        </select>
        <select
          className="filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="maintenance">Maintenance</option>
        </select>
        <button
          className="admin-btn"
          onClick={() => setShowForm(true)}
        >
          Add Plant
        </button>
      </div>

      {/* Plants Table */}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Location</th>
            <th>Type</th>
            <th>Capacity</th>
            <th>Status</th>
            <th>Efficiency</th>
            <th>Last Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredPlants.map(plant => (
            <tr key={plant.id}>
              <td><strong>{plant.name}</strong></td>
              <td>{plant.location}</td>
              <td>
                <span className="role-badge user">{plant.type}</span>
              </td>
              <td>{plant.capacity.toLocaleString()}</td>
              <td>
                <span className={`status-badge ${plant.status}`}>
                  {plant.status}
                </span>
              </td>
              <td>
                {plant.status === 'active' ? `${plant.efficiency}%` : 'N/A'}
              </td>
              <td>{plant.lastUpdated}</td>
              <td>
                <div className="admin-actions">
                  <button
                    className="action-btn view"
                    onClick={() => startEdit(plant)}
                  >
                    Edit
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => deletePlant(plant.id)}
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
          <h3>{editingPlant ? 'Edit Plant' : 'Add New Plant'}</h3>
          <div className="admin-form-grid">
            <input
              className="admin-input"
              placeholder="Plant Name"
              value={editingPlant ? editingPlant.name : newPlant.name}
              onChange={(e) => editingPlant 
                ? setEditingPlant({...editingPlant, name: e.target.value})
                : setNewPlant({...newPlant, name: e.target.value})
              }
            />
            <input
              className="admin-input"
              placeholder="Location"
              value={editingPlant ? editingPlant.location : newPlant.location}
              onChange={(e) => editingPlant
                ? setEditingPlant({...editingPlant, location: e.target.value})
                : setNewPlant({...newPlant, location: e.target.value})
              }
            />
            <select
              className="admin-input"
              value={editingPlant ? editingPlant.type : newPlant.type}
              onChange={(e) => editingPlant
                ? setEditingPlant({...editingPlant, type: e.target.value})
                : setNewPlant({...newPlant, type: e.target.value})
              }
            >
              <option value="manufacturing">Manufacturing</option>
              <option value="warehouse">Warehouse</option>
              <option value="distribution">Distribution</option>
            </select>
            <input
              className="admin-input"
              type="number"
              placeholder="Capacity"
              value={editingPlant ? editingPlant.capacity : newPlant.capacity}
              onChange={(e) => editingPlant
                ? setEditingPlant({...editingPlant, capacity: Number(e.target.value)})
                : setNewPlant({...newPlant, capacity: Number(e.target.value)})
              }
            />
            <select
              className="admin-input"
              value={editingPlant ? editingPlant.status : newPlant.status}
              onChange={(e) => editingPlant
                ? setEditingPlant({...editingPlant, status: e.target.value as any})
                : setNewPlant({...newPlant, status: e.target.value as any})
              }
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
            </select>
            <input
              className="admin-input"
              type="number"
              placeholder="Efficiency %"
              min="0"
              max="100"
              value={editingPlant ? editingPlant.efficiency : newPlant.efficiency}
              onChange={(e) => editingPlant
                ? setEditingPlant({...editingPlant, efficiency: Number(e.target.value)})
                : setNewPlant({...newPlant, efficiency: Number(e.target.value)})
              }
            />
          </div>
          <div className="admin-actions">
            <button
              className="admin-btn"
              onClick={editingPlant ? updatePlant : addPlant}
            >
              {editingPlant ? 'Update Plant' : 'Add Plant'}
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

export default AdminPlants; 