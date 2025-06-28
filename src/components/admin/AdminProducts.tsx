import React, { useState } from 'react';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  description: string;
  price: number;
  cost: number;
  stockLevel: number;
  minStock: number;
  maxStock: number;
  unit: string;
  supplier: string;
  status: 'active' | 'discontinued' | 'out_of_stock';
  lastUpdated: string;
}

const initialProducts: Product[] = [
  {
    id: 'prod1',
    name: 'Aluminium Sheet 6061-T6',
    sku: 'AL-6061-001',
    category: 'Aluminium',
    description: 'High-strength aluminium sheet for structural applications',
    price: 45.99,
    cost: 32.50,
    stockLevel: 1250,
    minStock: 100,
    maxStock: 2000,
    unit: 'kg',
    supplier: 'Alcoa Industries',
    status: 'active',
    lastUpdated: '2024-01-15'
  },
  {
    id: 'prod2',
    name: 'Stainless Steel Bolts M8x30',
    sku: 'SS-BOLT-M8-30',
    category: 'Hardware',
    description: 'Stainless steel bolts, grade 316, M8 diameter, 30mm length',
    price: 0.85,
    cost: 0.45,
    stockLevel: 5000,
    minStock: 500,
    maxStock: 10000,
    unit: 'pieces',
    supplier: 'Fastenal Corp',
    status: 'active',
    lastUpdated: '2024-01-14'
  },
  {
    id: 'prod3',
    name: 'Copper Wire 12 AWG',
    sku: 'CU-WIRE-12AWG',
    category: 'Copper',
    description: 'Copper electrical wire, 12 AWG, 100m spool',
    price: 89.99,
    cost: 65.00,
    stockLevel: 45,
    minStock: 20,
    maxStock: 100,
    unit: 'spools',
    supplier: 'Southwire Company',
    status: 'active',
    lastUpdated: '2024-01-13'
  },
  {
    id: 'prod4',
    name: 'Brass Fittings 1/2" NPT',
    sku: 'BR-FIT-12NPT',
    category: 'Brass',
    description: 'Brass pipe fittings, 1/2 inch NPT thread',
    price: 12.50,
    cost: 8.75,
    stockLevel: 0,
    minStock: 50,
    maxStock: 200,
    unit: 'pieces',
    supplier: 'Parker Hannifin',
    status: 'out_of_stock',
    lastUpdated: '2024-01-10'
  },
  {
    id: 'prod5',
    name: 'Titanium Rod Grade 5',
    sku: 'TI-ROD-G5-001',
    category: 'Titanium',
    description: 'Titanium rod, Grade 5, 25mm diameter',
    price: 125.00,
    cost: 95.00,
    stockLevel: 75,
    minStock: 25,
    maxStock: 150,
    unit: 'kg',
    supplier: 'Titanium Industries',
    status: 'active',
    lastUpdated: '2024-01-12'
  }
];

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    category: 'Aluminium',
    description: '',
    price: 0,
    cost: 0,
    stockLevel: 0,
    minStock: 0,
    maxStock: 0,
    unit: 'kg',
    supplier: '',
    status: 'active' as 'active' | 'discontinued' | 'out_of_stock'
  });

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const addProduct = () => {
    const product: Product = {
      ...newProduct,
      id: `prod${Date.now()}`,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    setProducts([...products, product]);
    setNewProduct({
      name: '',
      sku: '',
      category: 'Aluminium',
      description: '',
      price: 0,
      cost: 0,
      stockLevel: 0,
      minStock: 0,
      maxStock: 0,
      unit: 'kg',
      supplier: '',
      status: 'active'
    });
    setShowForm(false);
  };

  const updateProduct = () => {
    if (!editingProduct) return;
    const updatedProducts = products.map(product =>
      product.id === editingProduct.id
        ? { ...editingProduct, lastUpdated: new Date().toISOString().split('T')[0] }
        : product
    );
    setProducts(updatedProducts);
    setEditingProduct(null);
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter(product => product.id !== id));
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      sku: product.sku,
      category: product.category,
      description: product.description,
      price: product.price,
      cost: product.cost,
      stockLevel: product.stockLevel,
      minStock: product.minStock,
      maxStock: product.maxStock,
      unit: product.unit,
      supplier: product.supplier,
      status: product.status
    });
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setShowForm(false);
    setNewProduct({
      name: '',
      sku: '',
      category: 'Aluminium',
      description: '',
      price: 0,
      cost: 0,
      stockLevel: 0,
      minStock: 0,
      maxStock: 0,
      unit: 'kg',
      supplier: '',
      status: 'active'
    });
  };

  const stats = {
    total: products.length,
    active: products.filter(p => p.status === 'active').length,
    outOfStock: products.filter(p => p.status === 'out_of_stock').length,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.stockLevel), 0)
  };

  const categories = Array.from(new Set(products.map(p => p.category)));

  const getStockStatus = (product: Product) => {
    if (product.stockLevel === 0) return 'out_of_stock';
    if (product.stockLevel <= product.minStock) return 'low_stock';
    if (product.stockLevel >= product.maxStock * 0.9) return 'high_stock';
    return 'normal';
  };

  return (
    <div className="admin-section">
      <h2>Manage Products</h2>
      
      {/* Stats Cards */}
      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Products</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.active}</div>
          <div className="stat-label">Active Products</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.outOfStock}</div>
          <div className="stat-label">Out of Stock</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">${stats.totalValue.toLocaleString()}</div>
          <div className="stat-label">Total Value</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="admin-search">
        <input
          className="admin-input"
          placeholder="Search products by name, SKU, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="filter-select"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <select
          className="filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="discontinued">Discontinued</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
        <button
          className="admin-btn"
          onClick={() => setShowForm(true)}
        >
          Add Product
        </button>
      </div>

      {/* Products Table */}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>SKU</th>
            <th>Category</th>
            <th>Stock Level</th>
            <th>Price</th>
            <th>Status</th>
            <th>Supplier</th>
            <th>Last Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map(product => (
            <tr key={product.id}>
              <td>
                <div>
                  <strong>{product.name}</strong>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    {product.description.substring(0, 50)}...
                  </div>
                </div>
              </td>
              <td><code>{product.sku}</code></td>
              <td>
                <span className="role-badge user">{product.category}</span>
              </td>
              <td>
                <div>
                  <div style={{ fontWeight: '500' }}>
                    {product.stockLevel.toLocaleString()} {product.unit}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Min: {product.minStock} | Max: {product.maxStock}
                  </div>
                </div>
              </td>
              <td>
                <div>
                  <div style={{ fontWeight: '500' }}>${product.price}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Cost: ${product.cost}
                  </div>
                </div>
              </td>
              <td>
                <span className={`status-badge ${product.status}`}>
                  {product.status.replace('_', ' ')}
                </span>
                {getStockStatus(product) === 'low_stock' && (
                  <div style={{ fontSize: '10px', color: '#d97706', marginTop: '2px' }}>
                    Low Stock
                  </div>
                )}
              </td>
              <td>{product.supplier}</td>
              <td>{product.lastUpdated}</td>
              <td>
                <div className="admin-actions">
                  <button
                    className="action-btn view"
                    onClick={() => startEdit(product)}
                  >
                    Edit
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => deleteProduct(product.id)}
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
          <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
          
          <div className="admin-form-grid">
            <input
              className="admin-input"
              placeholder="Product Name"
              value={newProduct.name}
              onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
            />
            <input
              className="admin-input"
              placeholder="SKU"
              value={newProduct.sku}
              onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
            />
            <select
              className="admin-input"
              value={newProduct.category}
              onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
            >
              <option value="Aluminium">Aluminium</option>
              <option value="Hardware">Hardware</option>
              <option value="Copper">Copper</option>
              <option value="Brass">Brass</option>
              <option value="Titanium">Titanium</option>
              <option value="Steel">Steel</option>
              <option value="Plastics">Plastics</option>
            </select>
            <input
              className="admin-input"
              placeholder="Supplier"
              value={newProduct.supplier}
              onChange={(e) => setNewProduct({...newProduct, supplier: e.target.value})}
            />
            <input
              className="admin-input"
              type="number"
              step="0.01"
              placeholder="Price"
              value={newProduct.price}
              onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})}
            />
            <input
              className="admin-input"
              type="number"
              step="0.01"
              placeholder="Cost"
              value={newProduct.cost}
              onChange={(e) => setNewProduct({...newProduct, cost: Number(e.target.value)})}
            />
            <input
              className="admin-input"
              type="number"
              placeholder="Current Stock"
              value={newProduct.stockLevel}
              onChange={(e) => setNewProduct({...newProduct, stockLevel: Number(e.target.value)})}
            />
            <input
              className="admin-input"
              type="number"
              placeholder="Minimum Stock"
              value={newProduct.minStock}
              onChange={(e) => setNewProduct({...newProduct, minStock: Number(e.target.value)})}
            />
            <input
              className="admin-input"
              type="number"
              placeholder="Maximum Stock"
              value={newProduct.maxStock}
              onChange={(e) => setNewProduct({...newProduct, maxStock: Number(e.target.value)})}
            />
            <select
              className="admin-input"
              value={newProduct.unit}
              onChange={(e) => setNewProduct({...newProduct, unit: e.target.value})}
            >
              <option value="kg">Kilograms (kg)</option>
              <option value="pieces">Pieces</option>
              <option value="meters">Meters (m)</option>
              <option value="liters">Liters (L)</option>
              <option value="spools">Spools</option>
              <option value="boxes">Boxes</option>
            </select>
            <select
              className="admin-input"
              value={newProduct.status}
              onChange={(e) => setNewProduct({...newProduct, status: e.target.value as any})}
            >
              <option value="active">Active</option>
              <option value="discontinued">Discontinued</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
          
          <textarea
            className="admin-input"
            placeholder="Product Description"
            value={newProduct.description}
            onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
            style={{ minHeight: '100px', resize: 'vertical' }}
          />

          <div className="admin-actions">
            <button
              className="admin-btn"
              onClick={editingProduct ? updateProduct : addProduct}
            >
              {editingProduct ? 'Update Product' : 'Add Product'}
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

export default AdminProducts; 