const STORAGE_KEYS = {
    INVENTORY: 'gsd_inventory_v1',
    RECENT_PO: 'gsd_recent_po_v1',
    STOCK_CARD: 'gsd_stock_card_v1',
    THRESHOLD: 'gsd_low_stock_threshold_v1'
  };
  
  const CURRENT_USER = 'Herrera, Christopher John';
  
  const DEFAULT_INVENTORY = [
    { id: 'PROD01', user: 'Herrera, Christopher John', name: 'Portland Cement (40kg)', category: 'Cement & Concrete', qty: 10, unit: 'BAGS', date: '11/01/2026' },
    { id: 'PROD02', user: 'Teresita, Tragura', name: 'Gravel (Per Cubic Meter)', category: 'Cement & Concrete', qty: 7, unit: 'PCS', date: '11/01/2026' },
    { id: 'PROD03', user: 'Herrera, Christopher John', name: 'Electrical Tape', category: 'Electrical', qty: 22, unit: 'ROLLS', date: '18/01/2026' },
    { id: 'PROD04', user: 'Herrera, Christopher John', name: 'PVC Electrical Unit (1/2)', category: 'Electrical', qty: 17, unit: 'PCS', date: '15/01/2026' },
    { id: 'PROD05', user: 'Teresita, Tragura', name: 'Wire Cable 2.0mm', category: 'Electrical', qty: 4, unit: 'ROLLS', date: '15/01/2026' },
    { id: 'PROD06', user: 'Teresita, Tragura', name: '4x4 Wood Lumber', category: 'Lumber', qty: 66, unit: 'PCS', date: '13/01/2026' },
    { id: 'PROD07', user: 'Teresita, Tragura', name: 'Steel Rebar (12mm)', category: 'Metals', qty: 3, unit: 'PCS', date: '14/01/2026' },
    { id: 'PROD08', user: 'Herrera, Christopher John', name: 'Exterior Paint (White)', category: 'Paint & Coating', qty: 44, unit: 'BUCKETS', date: '14/01/2026' }
  ];
  
  const DEFAULT_RECENT_PO = [
    {
      ref: 'PO-2026-001',
      product: 'VINLYN TILES',
      qty: 1400,
      unit: 'PCS',
      unitCost: 205.67,
      totalCost: 287940.80,
      date: '09/11/2026',
      user: 'Herrera, Christopher John L.'
    }
  ];
  
  const DEFAULT_STOCK_CARD = [
    { date: '11/01/2026', ref: 'INIT-01', product: 'Portland Cement (40kg)', type: 'Receipt', inQty: 10, outQty: 0, balance: 10 },
    { date: '09/11/2026', ref: 'PO-2026-001', product: 'VINLYN TILES', type: 'Purchase Order', inQty: 1400, outQty: 0, balance: 1400 }
  ];
  
  function loadState(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }
  
  function saveState(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
  
  let inventoryData = loadState(STORAGE_KEYS.INVENTORY, DEFAULT_INVENTORY);
  let recentPurchaseOrders = loadState(STORAGE_KEYS.RECENT_PO, DEFAULT_RECENT_PO);
  let stockCardLogs = loadState(STORAGE_KEYS.STOCK_CARD, DEFAULT_STOCK_CARD);
  let lowStockThreshold = Number(loadState(STORAGE_KEYS.THRESHOLD, 7));
  
  function showToast(message) {
    const banner = document.getElementById('toastBanner');
    if (!banner) return;
    banner.textContent = message;
    banner.classList.add('show');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => banner.classList.remove('show'), 2600);
  }
  
  function formatTodayPH() {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }
  
  function getStatusBadge(qty) {
    if (Number(qty) <= lowStockThreshold) {
      return '<span class="badge badge-lowstock">Low Stock</span>';
    }
    return '<span class="badge badge-instock">In Stock</span>';
  }
  
  /* Logout button navigates back to index.html */
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Log out of General Service Division System?')) {
        window.location.href = 'index.html';
      }
    });
  }
  
  /* Page 1: Purchase Order (purchaseorder.html) */
  if (document.body.dataset.page === 'purchaseorder') {
    const poForm = document.getElementById('poForm');
    const poQuantity = document.getElementById('poQuantity');
    const poUnitCost = document.getElementById('poUnitCost');
    const poTotalCost = document.getElementById('poTotalCost');
    const poProductName = document.getElementById('poProductName');
    const poCategory = document.getElementById('poCategory');
    const poUnit = document.getElementById('poUnit');
    const recentPoContainer = document.getElementById('recentPoContainer');
    const datalist = document.getElementById('productSuggestions');
  
    if (datalist) {
      datalist.innerHTML = inventoryData.map(item => `<option value="${item.name}"></option>`).join('');
    }
  
    function computePoTotal() {
      const qty = parseFloat(poQuantity.value);
      const unitCost = parseFloat(poUnitCost.value);
      if (!isNaN(qty) && !isNaN(unitCost) && qty > 0 && unitCost >= 0) {
        poTotalCost.value = (qty * unitCost).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
      } else {
        poTotalCost.value = '';
      }
    }
  
    poQuantity.addEventListener('input', computePoTotal);
    poUnitCost.addEventListener('input', computePoTotal);
  
    poProductName.addEventListener('input', () => {
      const match = inventoryData.find(
        i => i.name.toLowerCase() === poProductName.value.trim().toLowerCase()
      );
      if (match) {
        if (!poCategory.value) poCategory.value = match.category;
        if (!poUnit.value) poUnit.value = match.unit;
      }
    });
  
    function renderRecentPurchaseOrders() {
      if (!recentPurchaseOrders.length) {
        recentPoContainer.innerHTML = '<p style="font-size: 12.5px; color: #6b7280;">No recent purchase orders to display.</p>';
        return;
      }
  
      recentPoContainer.innerHTML = recentPurchaseOrders.map(entry => `
        <div class="recent-po-entry">
          <div class="recent-po-ref">Ref: ${entry.ref}</div>
          <div class="recent-po-product">${entry.product}</div>
          <div class="recent-po-meta">
            <div>Qty: ${entry.qty} ${entry.unit}</div>
            <div>Unit Cost: ${Number(entry.unitCost).toFixed(2)}</div>
            <div>Total Cost: ${Number(entry.totalCost).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div>Unit: ${entry.unit}</div>
          </div>
          <div class="recent-po-footer">${entry.date} &mdash; ${entry.user}</div>
        </div>
      `).join('');
    }
  
    poForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const ref = document.getElementById('poReference').value.trim();
      const name = poProductName.value.trim();
      const category = poCategory.value.trim();
      const unit = poUnit.value.trim().toUpperCase();
      const qty = parseFloat(poQuantity.value);
      const unitCost = parseFloat(poUnitCost.value);
  
      if (!ref || !name || !category || !unit || isNaN(qty) || qty <= 0 || isNaN(unitCost)) {
        showToast('Please fill out all Purchase Order fields.');
        return;
      }
  
      const totalCost = qty * unitCost;
      const today = formatTodayPH();
  
      let existing = inventoryData.find(i => i.name.toLowerCase() === name.toLowerCase());
      let newBalance = qty;
  
      if (existing) {
        existing.qty = Number(existing.qty) + qty;
        existing.category = category;
        existing.unit = unit;
        existing.user = CURRENT_USER;
        newBalance = existing.qty;
      } else {
        const nextNum = String(inventoryData.length + 1).padStart(2, '0');
        inventoryData.push({
          id: `PROD${nextNum}`,
          user: CURRENT_USER,
          name,
          category,
          qty,
          unit,
          date: today
        });
      }
  
      recentPurchaseOrders.unshift({
        ref,
        product: name.toUpperCase(),
        qty,
        unit,
        unitCost,
        totalCost,
        date: today,
        user: `${CURRENT_USER} L.`
      });
  
      stockCardLogs.unshift({
        date: today,
        ref,
        product: name,
        type: 'Purchase Order',
        inQty: qty,
        outQty: 0,
        balance: newBalance
      });
  
      saveState(STORAGE_KEYS.INVENTORY, inventoryData);
      saveState(STORAGE_KEYS.RECENT_PO, recentPurchaseOrders);
      saveState(STORAGE_KEYS.STOCK_CARD, stockCardLogs);
  
      renderRecentPurchaseOrders();
      poForm.reset();
      poTotalCost.value = '';
      showToast(`Added ${qty} ${unit} of "${name}" to Inventory.`);
    });
  
    document.getElementById('poResetBtn').addEventListener('click', () => {
      poForm.reset();
      poTotalCost.value = '';
    });
  
    document.getElementById('clearRecentPoBtn').addEventListener('click', () => {
      recentPurchaseOrders = [];
      saveState(STORAGE_KEYS.RECENT_PO, recentPurchaseOrders);
      renderRecentPurchaseOrders();
    });
  
    renderRecentPurchaseOrders();
  }
  
  /* Page 2: Inventory (inventory.html) */
  if (document.body.dataset.page === 'inventory') {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const monthFilter = document.getElementById('monthFilter');
    const printCategoryLabel = document.getElementById('printCategoryLabel');
  
    function updatePrintHeader() {
      if (printCategoryLabel) {
        printCategoryLabel.textContent = `${categoryFilter.value.toUpperCase()} • ${monthFilter.value.toUpperCase()}`;
      }
    }
  
    function filterTable() {
      const query = (searchInput?.value || '').toLowerCase().trim();
      const category = categoryFilter?.value || 'All Categories';
      const rows = Array.from(document.querySelectorAll('#tableBody tr'));
      const actionsList = document.getElementById('actionsList');
  
      rows.forEach(row => {
        const rowId = row.getAttribute('data-row-id');
        const idText = row.cells[0].textContent.toLowerCase();
        const productText = row.cells[2].textContent.toLowerCase();
        const rowCategory = row.cells[3].textContent.trim();
  
        const isVisible = (idText.includes(query) || productText.includes(query)) &&
          (category === 'All Categories' || rowCategory === category);
  
        row.style.display = isVisible ? '' : 'none';
        const actionRow = actionsList?.querySelector(`[data-action-id="${rowId}"]`);
        if (actionRow) actionRow.style.display = isVisible ? 'flex' : 'none';
      });
  
      updatePrintHeader();
    }
  
    function renderInventoryPage() {
      const tableBody = document.getElementById('tableBody');
      const actionsList = document.getElementById('actionsList');
      if (!tableBody || !actionsList) return;
  
      tableBody.innerHTML = '';
      actionsList.innerHTML = '';
  
      inventoryData.forEach(item => {
        const tr = document.createElement('tr');
        tr.setAttribute('data-row-id', item.id);
        tr.innerHTML = `
          <td>${item.id}</td>
          <td>${item.user}</td>
          <td>${item.name}</td>
          <td>${item.category}</td>
          <td>${item.qty}</td>
          <td>${item.unit}</td>
          <td>${getStatusBadge(item.qty)}</td>
          <td>${item.date}</td>
        `;
        tableBody.appendChild(tr);
  
        const actDiv = document.createElement('div');
        actDiv.className = 'action-row-item';
        actDiv.setAttribute('data-action-id', item.id);
        actDiv.innerHTML = `
          <button type="button" class="btn-row-edit" onclick="editInventoryItem('${item.id}')">Edit</button>
          <button type="button" class="btn-row-delete" onclick="deleteInventoryItem('${item.id}')">Delete</button>
        `;
        actionsList.appendChild(actDiv);
      });
  
      const lowCount = inventoryData.filter(i => Number(i.qty) <= lowStockThreshold).length;
      const lowStockEl = document.getElementById('lowStockCount');
      const totalEl = document.getElementById('totalProductsCount');
      if (lowStockEl) lowStockEl.textContent = lowCount;
      if (totalEl) totalEl.textContent = 109 + inventoryData.length;
  
      filterTable();
    }
  
    window.editInventoryItem = function (id) {
      const item = inventoryData.find(i => i.id === id);
      if (!item) return;
      const nextQty = prompt(`Update quantity for ${item.name}:`, item.qty);
      if (nextQty !== null && !isNaN(Number(nextQty)) && Number(nextQty) >= 0) {
        item.qty = Number(nextQty);
        saveState(STORAGE_KEYS.INVENTORY, inventoryData);
        renderInventoryPage();
        showToast(`Updated ${item.id} quantity to ${item.qty}`);
      }
    };
  
    window.deleteInventoryItem = function (id) {
      if (confirm(`Delete ${id} from inventory?`)) {
        inventoryData = inventoryData.filter(i => i.id !== id);
        saveState(STORAGE_KEYS.INVENTORY, inventoryData);
        renderInventoryPage();
        showToast(`Deleted ${id}`);
      }
    };
  
    searchInput?.addEventListener('input', filterTable);
    categoryFilter?.addEventListener('change', filterTable);
    monthFilter?.addEventListener('change', updatePrintHeader);
    document.getElementById('printBtn')?.addEventListener('click', () => {
      updatePrintHeader();
      window.print();
    });
  
    renderInventoryPage();
  }
  
  /* Page 3: Stock Card (stockcard.html) */
  if (document.body.dataset.page === 'stockcard') {
    const tbody = document.getElementById('stockCardBody');
    if (tbody) {
      tbody.innerHTML = stockCardLogs.map(log => `
        <tr>
          <td>${log.date}</td>
          <td>${log.ref}</td>
          <td>${log.product}</td>
          <td>${log.type}</td>
          <td>${log.inQty || '-'}</td>
          <td>${log.outQty || '-'}</td>
          <td><strong>${log.balance}</strong></td>
        </tr>
      `).join('');
    }
  }