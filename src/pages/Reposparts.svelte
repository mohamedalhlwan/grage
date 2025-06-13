<script>
  import { onMount } from "svelte";
  import Headeve from "../header/Headeve.svelte";

  // بيانات قطع الغيار
  let spareParts = [];
  let inventory = [];
  let searchQuery = '';
  let selectedPart = '';
  let quantity = 1;
  let transactionDate = new Date().toISOString().slice(0, 10);
  let notes = '';

  // تحميل البيانات عند تشغيل الصفحة
  onMount(() => {
    const savedParts = localStorage.getItem('spareParts');
    const savedInventory = localStorage.getItem('sparePartsInventory');
    
    if (savedParts) spareParts = JSON.parse(savedParts);
    if (savedInventory) inventory = JSON.parse(savedInventory);
    
    // إذا لم يكن هناك مخزون، ننشئه من قطع الغيار الموجودة
    if (spareParts.length > 0 && inventory.length === 0) {
      inventory = spareParts.map(part => ({
        partId: part.id,
        partName: part.name,
        partNumber: part.number,
        currentStock: 0,
        transactions: []
      }));
      localStorage.setItem('sparePartsInventory', JSON.stringify(inventory));
    }
  });

  // إضافة كمية إلى المخزون
  function handleTransaction() {
    if (!selectedPart || quantity <= 0) {
      alert('يرجى اختيار قطعة وإدخال كمية صحيحة');
      return;
    }

    const partIndex = inventory.findIndex(item => item.partId === selectedPart);
    
    if (partIndex === -1) {
      alert('القطعة غير موجودة في المخزون');
      return;
    }

    // إنشاء نسخة جديدة من المخزون لتجنب المشاكل مع التفاعلية
    const newInventory = [...inventory];
    const transaction = {
      date: transactionDate,
      type: 'إضافة',
      quantity: parseInt(quantity),
      notes,
      balanceBefore: newInventory[partIndex].currentStock
    };

    // تحديث الرصيد الحالي
    newInventory[partIndex].currentStock += transaction.quantity;

    transaction.balanceAfter = newInventory[partIndex].currentStock;
    
    // إضافة الحركة للسجل
    newInventory[partIndex].transactions.unshift(transaction);
    
    // حفظ التغييرات
    inventory = newInventory;
    localStorage.setItem('sparePartsInventory', JSON.stringify(inventory));
    
    // إعادة تعيين النموذج
    quantity = 1;
    notes = '';
  }

  // تصفية قطع الغيار حسب البحث
  $: filteredInventory = inventory.filter(item =>
    item.partName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.partNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );
</script>

<div class="header-top">
  <div class="header-part">
    <h2>مخزن قطع غيار السيارات</h2>
    <p>إدارة إضافات المخزون وتتبع الكميات</p>
  </div>
</div>

<div class="inventory-container">
  <!-- نموذج إضافة حركة -->
  <div class="transaction-form">
    <h3>📝 تسجيل إضافة للمخزون</h3>
    
    <div class="form-grid">
      <div class="form-group">
        <label for="partSelect">اختر قطعة الغيار:</label>
        <select id="partSelect" bind:value={selectedPart}>
          <option value="">-- اختر قطعة --</option>
          {#each spareParts as part}
            <option value={part.id}>{part.name} ({part.number})</option>
          {/each}
        </select>
      </div>
      
      <div class="form-group">
        <label for="quantity">الكمية المضافة:</label>
        <input 
          id="quantity" 
          type="number" 
          bind:value={quantity} 
          min="1" 
          placeholder="الكمية" 
        />
      </div>
      
      <div class="form-group">
        <label for="transactionDate">تاريخ الإضافة:</label>
        <input 
          id="transactionDate" 
          type="date" 
          bind:value={transactionDate} 
        />
      </div>
      
      <div class="form-group full-width">
        <label for="notes">ملاحظات:</label>
        <textarea 
          id="notes" 
          bind:value={notes} 
          placeholder="أي ملاحظات إضافية..."
        ></textarea>
      </div>
    </div>
    
    <button on:click={handleTransaction} class="save-btn">
      إضافة إلى المخزون
    </button>
  </div>
  
  <!-- شريط البحث وعرض المخزون -->
  <div class="inventory-list">
    <div class="search-filter">
      <input 
        type="text" 
        bind:value={searchQuery} 
        placeholder="🔍 ابحث باسم أو رقم القطعة" 
      />
    </div>
    
    {#if filteredInventory.length === 0}
      <div class="no-results">
        {#if inventory.length === 0}
          <p>🚫 لا توجد قطع غيار مسجلة في المخزون</p>
        {:else}
          <p>🚫 لا توجد نتائج مطابقة لبحثك</p>
        {/if}
      </div>
    {:else}
      <div class="inventory-items">
        {#each filteredInventory as item}
          <div class="inventory-item">
            <div class="item-header">
              <h4>{item.partName} ({item.partNumber})</h4>
              <div class="stock-info">
                <span class:low-stock={item.currentStock <= 5}>
                  الرصيد الحالي: <strong>{item.currentStock}</strong>
                </span>
                {#if item.currentStock <= 5}
                  <span class="warning">❗ الرصيد منخفض</span>
                {/if}
              </div>
            </div>
            
            <div class="transactions-table">
              <table>
                <thead>
                  <tr>
                    <th>التاريخ</th>
                    <th>نوع الحركة</th>
                    <th>الكمية</th>
                    <th>الرصيد قبل</th>
                    <th>الرصيد بعد</th>
                    <th>ملاحظات</th>
                  </tr>
                </thead>
                <tbody>
                  {#each item.transactions as transaction, i (transaction.date + i)}
                    <tr>
                      <td>{transaction.date}</td>
                      <td class="add">{transaction.type}</td>
                      <td>{transaction.quantity}</td>
                      <td>{transaction.balanceBefore}</td>
                      <td>{transaction.balanceAfter}</td>
                      <td>{transaction.notes || '--'}</td>
                    </tr>
                  {/each}
              </table>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .header-part {
    width: 100%;
    text-align: right;
    background: #4361EE;
    padding: 1rem;
    color: white;
  }

  .header-top {
    max-width: 100%;
  }

  .inventory-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  .transaction-form {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
  }

  .form-group.full-width {
    grid-column: 1 / -1;
  }

  .form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
    color: #495057;
  }

  .form-group select,
  .form-group input,
  .form-group textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 14px;
  }

  .form-group textarea {
    min-height: 80px;
    resize: vertical;
  }

  .save-btn {
    background: #28a745;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    width: 100%;
  }

  .save-btn:hover {
    background: #218838;
  }

  .inventory-list {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }

  .search-filter input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    margin-bottom: 20px;
    font-size: 14px;
  }

  .no-results {
    text-align: center;
    padding: 40px;
    color: #6c757d;
  }

  .inventory-items {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .inventory-item {
    border: 1px solid #e9ecef;
    border-radius: 8px;
    overflow: hidden;
  }

  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    background: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
  }

  .item-header h4 {
    margin: 0;
    color: #2c3e50;
  }

  .stock-info {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .low-stock {
    color: #dc3545;
  }

  .warning {
    color: #dc3545;
    font-weight: bold;
  }

  .transactions-table {
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th, td {
    padding: 12px 15px;
    text-align: center;
    border-bottom: 1px solid #e9ecef;
  }

  th {
    background: #f8f9fa;
    font-weight: 600;
    color: #495057;
  }

  .add {
    color: #28a745;
    font-weight: bold;
  }

  tr:hover {
    background: #f1f3f5;
  }

  @media (max-width: 768px) {
    .form-grid {
      grid-template-columns: 1fr;
    }
    
    .item-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }
  }
</style>