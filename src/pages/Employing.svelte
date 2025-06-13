<script>
  import { onMount } from 'svelte';
  
  let cars = [];
  let drivers = [];
  
  // متغيرات البحث
  let searchPlateNumbers = '';
  let searchPlateLetters = ['', '', ''];
  let searchCarModel = '';
  let searchCarStatus = 'الكل';
  let searchDriverName = '';
  
  // متغيرات التحديد
  let selectedCar = null;
  let selectedDriver = '';
  
  const allowedLetters = ['أ', 'ب', 'ج', 'د', 'ر', 'س', 'ص', 'ط', 'ع', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي','خ','ث','ح','غ','ض','ش','ا','أ','ض','ت','ظ','ز','ة','لا','ؤ','','ء','ئ','ذ'];

  onMount(() => {
    const storedCars = localStorage.getItem('cars');
    const storedDrivers = localStorage.getItem('drivers');
    
    cars = storedCars ? JSON.parse(storedCars) : [];
    drivers = storedDrivers ? JSON.parse(storedDrivers) : [];
  });

  function formatPlateNumbers(numbers) {
    return numbers?.length === 4 ? `${numbers.slice(0, 2)}-${numbers.slice(2)}` : numbers;
  }

  // تحسين معالجة إدخال حروف اللوحة
  function handleSearchLetterInput(index, event) {
    const val = event.target.value;
    
    // السماح فقط بالحروف العربية المسموحة
    if (allowedLetters.includes(val)) {
      searchPlateLetters[index] = val;
      
      // الانتقال التلقائي للحقل التالي
      if (val && index < 2) {
        setTimeout(() => {
          const nextInput = document.querySelector(`.plate-letters input:nth-child(${index + 2})`);
          if (nextInput) nextInput.focus();
        }, 10);
      }
    } else {
      searchPlateLetters[index] = '';
    }
  }

  // تصفية السيارات حسب البحث
  $: filteredCars = cars.filter(car => {
    // مطابقة أرقام اللوحة
    const plateNumberMatch = !searchPlateNumbers || 
      (car.plate?.numbers && car.plate.numbers.includes(searchPlateNumbers));
    
    // مطابقة حروف اللوحة
    const plateLetterMatch = searchPlateLetters.every((letter, index) => {
      return !letter || (car.plate?.letters && car.plate.letters[index] === letter);
    });
    
    // مطابقة الموديل
    const modelMatch = !searchCarModel || 
      (car.model && car.model.toLowerCase().includes(searchCarModel.toLowerCase()));
    
    // مطابقة الحالة
    const statusMatch = searchCarStatus === 'الكل' || 
      (car.status && car.status === searchCarStatus);
    
    // مطابقة اسم السائق
    const driverMatch = !searchDriverName || 
      (car.driverId && getDriverName(car.driverId).toLowerCase().includes(searchDriverName.toLowerCase()));
    
    return plateNumberMatch && plateLetterMatch && modelMatch && statusMatch && driverMatch;
  });

  // تصفية السائقين المتاحين
  $: availableDrivers = drivers.filter(driver => driver.status === 'مفعل');

  function assignDriver() {
    if (selectedCar && selectedDriver) {
      selectedCar.driverId = selectedDriver;
      localStorage.setItem('cars', JSON.stringify(cars));
      alert("تم تعيين السائق بنجاح ✅");
    }
  }

  function unassignDriver() {
    if (!selectedCar) return;
    
    cars = cars.map(car => {
      if (car.id === selectedCar.id) {
        return { ...car, driverId: null };
      }
      return car;
    });
    
    localStorage.setItem('cars', JSON.stringify(cars));
    selectedCar.driverId = null;
    selectedDriver = '';
    alert('تم إلغاء تعيين السائق');
  }

  function getDriverName(id) {
    if (!id) return 'غير معين';
    const driver = drivers.find(d => d.id === id);
    return driver ? `${driver.firstName} ${driver.lastName}` : 'غير معين';
  }
</script>

<div class="header-top">
  <h2>إدارة تعيين السائقين للسيارات</h2>
</div>
<div class="cars-container">

  
  <!-- قسم البحث -->
  <div class="search-section">
    <div class="search-fields">

      <div class="search-group">
        <label>حروف اللوحة:</label>
        <div class="plate-letters">
          {#each searchPlateLetters as letter, i}
            <input
              type="text"
              maxlength="1"
              bind:value={searchPlateLetters[i]}
              on:input={(e) => handleSearchLetterInput(i, e)}
              on:keydown={(e) => {
                if (e.key === 'Backspace' && !e.target.value && i > 0) {
                  const prevInput = document.querySelector(`.plate-letters input:nth-child(${i})`);
                  if (prevInput) prevInput.focus();
                }
              }}
            />
          {/each}
        </div>
      </div>

      <div class="search-group">
        <label for="plateNumbers">أرقام اللوحة:</label>
        <input
          id="plateNumbers"
          type="text"
          placeholder="ابحث بأرقام اللوحة"
          bind:value={searchPlateNumbers}
          maxlength="4"
          on:input={() => searchPlateNumbers = searchPlateNumbers.replace(/[^0-9]/g, '')}
        />
      </div>
      
     
<!--       
      <div class="search-group">
        <label for="carModel">موديل السيارة:</label>
        <input
          id="carModel"
          type="text"
          placeholder="ابحث بالموديل"
          bind:value={searchCarModel}
        />
      </div> -->
      
      <div class="search-group">
        <label for="driverName">اسم السائق:</label>
        <input
          id="driverName"
          type="text"
          placeholder="ابحث باسم السائق"
          bind:value={searchDriverName}
        />
      </div>
      
      <div class="search-group">
        <label for="carStatus">حالة السيارة:</label>
        <select id="carStatus" bind:value={searchCarStatus}>
          <option value="الكل">الكل</option>
          <option value="نشطة">نشطة</option>
          <option value="غير نشطة">غير نشطة</option>
          <option value="في الصيانة">في الصيانة</option>
        </select>
      </div>
    </div>
  </div>
  
  <!-- قسم عرض النتائج -->
  <div class="results-section">
    <div class="cars-list">
      <h2>السيارات المتاحة</h2>
      
      {#if filteredCars.length === 0}
        <div class="no-results">
          {#if cars.length === 0}
            <p>لا توجد سيارات مسجلة في النظام</p>
          {:else}
            <p>لا توجد سيارات مطابقة لبحثك</p>
          {/if}
        </div>
      {:else}
        <table class="cars-table">
          <thead>
            <tr>
              <th>رقم اللوحة</th>
              <th>العلامة التجارية</th>
              <th>الموديل</th>
              <th>الحالة</th>
              <th>السائق الحالي</th>
              <th>تحديد</th>
            </tr>
          </thead>
          <tbody>
            {#each filteredCars as car}
              <tr class:selected={selectedCar?.id === car.id}>
                <td>
                  {car.plate?.numbers ? formatPlateNumbers(car.plate.numbers) : '--'} 
                  {car.plate?.letters?.join('')}
                </td>
                <td>{car.brand || '--'}</td>
                <td>{car.model || '--'}</td>
                <td>
                  <span class="status-{car.status?.toLowerCase()?.replace(' ', '-')}">
                    {car.status || '--'}
                  </span>
                </td>
                <td>{getDriverName(car.driverId)}</td>
                <td>
                  <button 
                    on:click={() => {
                      selectedCar = car;
                      selectedDriver = car.driverId || '';
                    }}
                    class="select-btn"
                  >
                    {selectedCar?.id === car.id ? 'محددة' : 'تحديد'}
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </div>
    
    <!-- قسم تعيين السائق -->
    {#if selectedCar}
      <div class="assign-driver-section">
        <h2>تعيين سائق للسيارة المحددة</h2>
        
        <div class="selected-car">
          <h3>السيارة المحددة:</h3>
          <p><strong>رقم اللوحة:</strong> {formatPlateNumbers(selectedCar.plate?.numbers)} {selectedCar.plate?.letters?.join('')}</p>
          <p><strong>العلامة التجارية:</strong> {selectedCar.brand}</p>
          <p><strong>الموديل:</strong> {selectedCar.model}</p>
          <p>السائق الحالي: {getDriverName(selectedCar.driverId)}</p>

                  </div>
        
        <div class="driver-selection">
          <label for="driverSelect">اختر سائقًا:</label>
          <select 
            id="driverSelect" 
            bind:value={selectedDriver}
            disabled={availableDrivers.length === 0}
          >
            <option value="">-- اختر سائقًا --</option>
            {#each availableDrivers as driver}
              <option value={driver.id}>
                {driver.firstName} {driver.lastName} - {driver.mobile}
              </option>
            {/each}
          </select>
          
          {#if availableDrivers.length === 0}
            <p class="no-drivers">لا يوجد سائقين مفعلين متاحين</p>
          {/if}
        </div>
        
        <div class="actions">
          <button 
          on:click={assignDriver}
          disabled={
            !selectedCar || 
            !selectedDriver || 
            selectedCar.driverId === selectedDriver
          }
          class="assign-btn"
        >
          تعيين السائق
          </button>
          <button 
            on:click={unassignDriver} 
            disabled={!selectedCar.driverId}
            class="unassign-btn"
          >
            إلغاء التعيين
          </button>
        </div>
      </div>
    {:else}
      <div class="no-selection">
        <p>الرجاء تحديد سيارة من القائمة لتعيين سائق لها</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .cars-container {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
  .plate-letters input {
    width: 40px;
    height: 40px;
    text-align: center;
    font-size: 18px;
    text-transform: uppercase;
  }
  .header-top{
    width: 100%;
    background: #4361EE;
    height: 79px;
    display: flex
;
}
  h2{
    font-size: 24px;
    color: white;
    padding: 10px;
  } 
  h3 {
    color: #2c3e50;
  }
  
  /* قسم البحث */
  .search-section {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
  }
  
  .search-fields {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 15px;
  }
  
  .search-group {
    margin-bottom: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;  }
  
  .search-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
    color: #495057;
  }
  
  .search-group input, 
  .search-group select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ced4da;
    border-radius: 4px;
  }
  
  .plate-letters {
    display: flex;
    gap: 5px;
  }
  
  .plate-letters input {
    width: 40px;
    text-align: center;
  }
  
  /* قسم النتائج */
  .results-section {
    display: grid;
    grid-template-columns: 1fr;
    gap: 30px;
  }
  
  @media (min-width: 992px) {
    .results-section {
      grid-template-columns: 2fr 1fr;
    }
  }
  
  /* قائمة السيارات */
  .cars-list {
    background: #fff;
    border-radius: 8px;
    padding: 15px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .cars-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 15px;
  }
  
  .cars-table th, 
  .cars-table td {
    padding: 12px;
    text-align: right;
    border-bottom: 1px solid #e9ecef;
  }
  
  .cars-table th {
    background: #f8f9fa;
    font-weight: 600;
    color: #495057;
  }
  
  .cars-table tr:hover {
    background: #f1f3f5;
  }
  
  .cars-table tr.selected {
    background: #e7f5ff;
  }
  
  .status-نشطة {
    color: #28a745;
    font-weight: 500;
  }
  
  .status-غير-نشطة {
    color: #dc3545;
    font-weight: 500;
  }
  
  .status-في-الصيانة {
    color: #fd7e14;
    font-weight: 500;
  }
  
  .select-btn {
    padding: 5px 10px;
    background: #17a2b8;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .select-btn:hover {
    background: #138496;
  }
  
  /* قسم تعيين السائق */
  .assign-driver-section {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    align-self: start;
    position: sticky;
    top: 20px;
  }
  
  .selected-car {
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid #eee;
  }
  
  .selected-car p {
    margin: 8px 0;
  }
  
  .driver-selection {
    margin-bottom: 20px;
  }
  
  .driver-selection label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
  }
  
  .driver-selection select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ced4da;
    border-radius: 4px;
  }
  
  .no-drivers {
    color: #dc3545;
    margin-top: 10px;
    font-size: 14px;
  }
  
  .actions {
    display: flex;
    gap: 10px;
  }
  
  .assign-btn, 
  .unassign-btn {
    padding: 10px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
  }
  
  .assign-btn {
    background: #28a745;
    color: white;
  }
  
  .assign-btn:hover {
    background: #218838;
  }
  
  .assign-btn:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }
  
  .unassign-btn {
    background: #dc3545;
    color: white;
  }
  
  .unassign-btn:hover {
    background: #c82333;
  }
  
  .unassign-btn:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }
  
  /* لا توجد نتائج */
  .no-results, 
  .no-selection {
    text-align: center;
    padding: 40px;
    color: #6c757d;
    background: #f8f9fa;
    border-radius: 8px;
  }
</style>