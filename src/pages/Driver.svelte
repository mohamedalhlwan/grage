<script>
  import { onMount } from "svelte";
  
  let drivers = [];
  let formData = {
    firstName: "",
    lastName: "",
    number: "",
    mobile: "",
    officeNumber: "",
    address: "",
    city: "",
    governorate: "",
    postalCode: "",
    status: "مفعل",
    license: "",
    licenseExpiry: "",
    certificate: "",
    notes: ""
  };
  
  let editingIndex = null;
  let searchQuery = "";
  let activeStatusFilter = "الكل";
  let licenseExpiryFilter = "";
  let showDetailsIndex = null;

  // تحميل البيانات عند تشغيل الصفحة
  onMount(() => {
    const stored = localStorage.getItem("drivers");
    if (stored) drivers = JSON.parse(stored);
  });

  // حفظ بيانات السائق
  function saveDriver() {
    if (!formData.firstName || !formData.lastName || !formData.mobile) {
      alert("الاسم الأول، الاسم الأخير ورقم الجوال حقول مطلوبة");
      return;
    }

    const newDriver = {
      ...formData,
      id: editingIndex !== null ? drivers[editingIndex].id : Date.now().toString()
    };
    
    if (editingIndex !== null) {
      drivers[editingIndex] = newDriver;
    } else {
      drivers = [...drivers, newDriver];
    }
    
    localStorage.setItem("drivers", JSON.stringify(drivers));
    resetForm();
  }

  // مسح النموذج
  function resetForm() {
    formData = {
      firstName: "",
      lastName: "",
      number: "",
      mobile: "",
      officeNumber: "",
      address: "",
      city: "",
      governorate: "",
      postalCode: "",
      status: "مفعل",
      license: "",
      licenseExpiry: "",
      certificate: "",
      notes: ""
    };
    editingIndex = null;
  }

  // تعديل سائق
  function editDriver(index) {
    formData = {...drivers[index]};
    editingIndex = index;
    showDetailsIndex = null;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // حذف سائق
  function deleteDriver(index) {
    if (confirm("هل أنت متأكد من حذف هذا السائق؟")) {
      drivers.splice(index, 1);
      localStorage.setItem("drivers", JSON.stringify(drivers));
      drivers = [...drivers];
    }
  }

  // عرض/إخفاء التفاصيل الكاملة للسائق
  function toggleDetails(index) {
    showDetailsIndex = showDetailsIndex === index ? null : index;
  }

  // تصفية السائقين حسب معايير البحث
  $: filteredDrivers = drivers.filter(driver => {
    const generalSearch = searchQuery === '' || 
      `${driver.firstName} ${driver.lastName}`.includes(searchQuery) || 
      driver.mobile.includes(searchQuery) || 
      driver.license.includes(searchQuery);
    
    const statusFilter = activeStatusFilter === "الكل" || 
      driver.status === activeStatusFilter;
    
    const expiryFilter = licenseExpiryFilter === '' || 
      (driver.licenseExpiry && driver.licenseExpiry <= licenseExpiryFilter);
    
    return generalSearch && statusFilter && expiryFilter;
  });

  // حساب عدد السائقين حسب الحالة
  $: activeDriversCount = drivers.filter(d => d.status === "مفعل").length;
  $: inactiveDriversCount = drivers.filter(d => d.status === "غير مفعل").length;
</script>

<div class="header-top">
  <h2>إدارة السائقين</h2>
  <p>اضافه السائقين وتعيينهم</p>
</div>

<div class="drivers-container">
  <!-- إحصائيات سريعة -->
  <div class="stats">
    <div class="stat-card">
      <span class="stat-value">{drivers.length}</span>
      <span class="stat-label">إجمالي السائقين</span>
    </div>
    <div class="stat-card active">
      <span class="stat-value">{activeDriversCount}</span>
      <span class="stat-label">سائقين مفعلين</span>
    </div>
    <div class="stat-card inactive">
      <span class="stat-value">{inactiveDriversCount}</span>
      <span class="stat-label">سائقين غير مفعلين</span>
    </div>
  </div>
  
  <!-- نموذج إضافة/تعديل سائق -->
  <div class="driver-form">
    <h2 class="title">{editingIndex !== null ? 'تعديل سائق' : 'إضافة سائق جديد'}</h2>
    
    <div class="form-grid">
      <div class="form-group">
        <label for="firstName">الاسم الأول *</label>
        <input id="firstName" bind:value={formData.firstName} placeholder="الاسم الأول" />
      </div>
      
      <div class="form-group">
        <label for="lastName">الاسم الأخير *</label>
        <input id="lastName" bind:value={formData.lastName} placeholder="الاسم الأخير" />
      </div>
      
      <div class="form-group">
        <label for="mobile">رقم الجوال *</label>
        <input id="mobile" bind:value={formData.mobile} placeholder="رقم الجوال" type="tel" />
      </div>
      
      <div class="form-group">
        <label for="number">الرقم القومي</label>
        <input id="number" bind:value={formData.number} placeholder="الرقم القومي" />
      </div>
      
      <div class="form-group">
        <label for="officeNumber">رقم المكتب</label>
        <input id="officeNumber" bind:value={formData.officeNumber} placeholder="رقم المكتب" />
      </div>
      
      <div class="form-group">
        <label for="license">رقم الرخصة</label>
        <input id="license" bind:value={formData.license} placeholder="رقم الرخصة" />
      </div>
      
      <div class="form-group">
        <label for="licenseExpiry">انتهاء الرخصة</label>
        <input id="licenseExpiry" bind:value={formData.licenseExpiry} type="date" />
      </div>
      
      <div class="form-group">
        <label for="status">الحالة</label>
        <select id="status" bind:value={formData.status}>
          <option value="مفعل">مفعل</option>
          <option value="غير مفعل">غير مفعل</option>
        </select>
      </div>
      
      <div class="form-group full-width">
        <label for="address">العنوان</label>
        <input id="address" bind:value={formData.address} placeholder="العنوان" />
      </div>
      
      <div class="form-group">
        <label for="city">المدينة</label>
        <input id="city" bind:value={formData.city} placeholder="المدينة" />
      </div>
      
      <div class="form-group">
        <label for="governorate">المحافظة</label>
        <input id="governorate" bind:value={formData.governorate} placeholder="المحافظة" />
      </div>
      
      <div class="form-group">
        <label for="postalCode">الرمز البريدي</label>
        <input id="postalCode" bind:value={formData.postalCode} placeholder="الرمز البريدي" />
      </div>
      
      <div class="form-group full-width">
        <label for="notes">ملاحظات</label>
        <textarea id="notes" bind:value={formData.notes} placeholder="ملاحظات"></textarea>
      </div>
    </div>
    
    <div class="form-actions">
      <button on:click={saveDriver} class="save-btn">
        {editingIndex !== null ? 'حفظ التعديلات' : 'حفظ السائق'}
      </button>
      {#if editingIndex !== null}
        <button on:click={resetForm} class="cancel-btn">إلغاء</button>
      {/if}
    </div>
  </div>
  
  <!-- شريط البحث والتصفية -->
  <div class="search-filter">
    <div class="search-box">
      <input 
        type="text" 
        bind:value={searchQuery} 
        placeholder="ابحث باسم السائق، رقم الجوال أو الرخصة" 
      />
      <svg viewBox="0 0 24 24" width="20" height="20">
        <path fill="currentColor" d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
      </svg>
    </div>
    
    <div class="filters">
      <select bind:value={activeStatusFilter}>
        <option value="الكل">الكل</option>
        <option value="مفعل">مفعل فقط</option>
        <option value="غير مفعل">غير مفعل فقط</option>
      </select>
      
      <div class="date-filter">
        <label for="expiryFilter">الرخص المنتهية قبل:</label>
        <input 
          id="expiryFilter" 
          type="date" 
          bind:value={licenseExpiryFilter} 
        />
        {#if licenseExpiryFilter}
          <button on:click={() => licenseExpiryFilter = ''} class="clear-filter">
            إلغاء
          </button>
        {/if}
      </div>
    </div>
  </div>
  
  <!-- جدول السائقين -->
  {#if filteredDrivers.length === 0}
    <div class="no-results">
      {#if drivers.length === 0}
        <p>لا يوجد سائقين مسجلين بعد</p>
      {:else}
        <p>لا توجد نتائج مطابقة لبحثك</p>
      {/if}
    </div>
  {:else}
    <div class="drivers-table">
      <table>
        <thead>
          <tr>
            <th>الاسم</th>
            <th>رقم الجوال</th>
            <th>رقم الرخصة</th>
            <th>انتهاء الرخصة</th>
            <th>الحالة</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {#each filteredDrivers as driver, index}
            <tr class:inactive={driver.status === 'غير مفعل'}>
              <td>{driver.firstName} {driver.lastName}</td>
              <td>{driver.mobile}</td>
              <td>{driver.license || '--'}</td>
              <td>{driver.licenseExpiry || '--'}</td>
              <td>
                <span class:status-active={driver.status === 'مفعل'}
                      class:status-inactive={driver.status === 'غير مفعل'}>
                  {driver.status}
                </span>
              </td>
              <td class="actions">
                <button on:click={() => editDriver(index)} class="edit-btn">
                  تعديل
                </button>
                <button on:click={() => deleteDriver(index)} class="delete-btn">
                  حذف
                </button>
                <button on:click={() => toggleDetails(index)} class="details-btn">
                  {showDetailsIndex === index ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
                </button>
              </td>
            </tr>
            
            {#if showDetailsIndex === index}
            <tr class="details-row">
              <td colspan="6">
                <div class="driver-details">
                  <h3>تفاصيل السائق الكاملة</h3>
                  <div class="details-grid">
                    <div><strong>رقم الهوية:</strong> {driver.number || '--'}</div>
                    <div><strong>رقم المكتب:</strong> {driver.officeNumber || '--'}</div>
                    <div><strong>العنوان:</strong> {driver.address || '--'}</div>
                    <div><strong>المدينة:</strong> {driver.city || '--'}</div>
                    <div><strong>المحافظة:</strong> {driver.governorate || '--'}</div>
                    <div><strong>الرمز البريدي:</strong> {driver.postalCode || '--'}</div>
                    <div><strong>الشهادة:</strong> {driver.certificate || '--'}</div>
                    <div class="full-width"><strong>ملاحظات:</strong> {driver.notes || '--'}</div>
                  </div>
                </div>
              </td>
            </tr>
            {/if}
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<style>
  .drivers-container {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
  
  .header-top {
    background: #4361EE;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: flex-start;
    padding: 12px;
  }
  
  .header-top p {
    color: white;
  }
  
  h2 {
    color: white;
  }
  
  /* الإحصائيات */
  .stats {
    display: flex;
    gap: 15px;
    margin-bottom: 30px;
  }
  
  .stat-card {
    flex: 1;
    background: #f8f9fa;
    border-radius: 8px;
    padding: 15px;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .stat-card.active {
    border-top: 4px solid #28a745;
  }
  
  .stat-card.inactive {
    border-top: 4px solid #dc3545;
  }
  
  .stat-value {
    display: block;
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 5px;
  }
  
  .stat-label {
    font-size: 14px;
    color: #6c757d;
  }
  
  /* النموذج */
  .driver-form {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 30px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }
  
  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
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
  
  .form-group input,
  .form-group select,
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
  
  .form-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }
  
  button {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
  }
  
  .save-btn {
    background: #28a745;
    color: white;
  }
  
  .save-btn:hover {
    background: #218838;
  }
  
  .cancel-btn {
    background: #6c757d;
    color: white;
  }
  
  .cancel-btn:hover {
    background: #5a6268;
  }
  
  /* البحث والتصفية */
  .search-filter {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-bottom: 20px;
    align-items: center;
  }
  
  .title {
    color: black;
    margin-bottom: 20px;
  }
  
  .search-box {
    flex: 1;
    min-width: 300px;
    position: relative;
  }
  
  .search-box input {
    width: 100%;
    padding: 10px 40px 10px 15px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 14px;
  }
  
  .search-box svg {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #6c757d;
  }
  
  .filters {
    display: flex;
    gap: 15px;
    align-items: center;
  }
  
  .filters select {
    padding: 10px;
    border: 1px solid #ced4da;
    border-radius: 4px;
  }
  
  .date-filter {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .date-filter label {
    white-space: nowrap;
    font-size: 14px;
    color: #495057;
  }
  
  .clear-filter {
    background: #f8f9fa;
    border: 1px solid #ced4da;
    padding: 5px 10px;
    font-size: 12px;
  }
  
  /* جدول السائقين */
  .drivers-table {
    overflow-x: auto;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  th, td {
    padding: 12px 15px;
    text-align: right;
    border-bottom: 1px solid #e9ecef;
  }
  
  th {
    background: #f8f9fa;
    font-weight: 600;
    color: #495057;
  }
  
  tr.inactive {
    opacity: 0.7;
    background: #f8f9fa;
  }
  
  tr:hover {
    background: #f1f3f5;
  }
  
  .status-active, .status-inactive {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
  }
  
  .status-active {
    background: #d4edda;
    color: #155724;
  }
  
  .status-inactive {
    background: #f8d7da;
    color: #721c24;
  }
  
  .actions {
    display: flex;
    gap: 5px;
  }
  
  .edit-btn {
    background: #17a2b8;
    color: white;
    padding: 5px 10px;
    font-size: 13px;
  }
  
  .edit-btn:hover {
    background: #138496;
  }
  
  .delete-btn {
    background: #dc3545;
    color: white;
    padding: 5px 10px;
    font-size: 13px;
  }
  
  .delete-btn:hover {
    background: #c82333;
  }
  
  .details-btn {
    background: #6c757d;
    color: white;
    padding: 5px 10px;
    font-size: 13px;
  }
  
  .details-btn:hover {
    background: #5a6268;
  }
  
  /* صف التفاصيل */
  .details-row {
    background: #f8f9fa;
  }
  
  .details-row td {
    padding: 0;
  }
  
  .driver-details {
    padding: 15px;
  }
  
  .driver-details h3 {
    margin-top: 0;
    color: #2c3e50;
    border-bottom: 1px solid #dee2e6;
    padding-bottom: 10px;
  }
  
  .details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
  }
  
  .details-grid div {
    padding: 5px 0;
  }
  
  .details-grid .full-width {
    grid-column: 1 / -1;
  }
  
  /* لا توجد نتائج */
  .no-results {
    text-align: center;
    padding: 40px;
    background: #f8f9fa;
    border-radius: 8px;
    color: #6c757d;
  }
</style>