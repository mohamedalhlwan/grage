<script>
  import { onMount } from 'svelte';
  
  let cars = [];
  let drivers = [];
  let officers = [];
  
  // متغيرات البحث
  let searchPlateNumbers = '';
  let searchPlateLetters = ['', '', ''];
  let searchCarModel = '';
  let searchCarStatus = 'الكل';
  let searchDriverName = '';
  let searchOfficerName = '';
  let searchMissionDate = '';
  
  // متغيرات التحديد
  let selectedCar = null;
  let selectedDriver = '';
  let selectedOfficer = '';
  
  // متغيرات المواعيد
  let departureTime = '';
  let returnTime = '';
  let missionDate = '';
  let missionDescription = '';
  
  const allowedLetters = ['أ', 'ب', 'ج', 'د', 'ر', 'س', 'ص', 'ط', 'ع', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي','خ','ث','ح','غ','ض','ش','ا','أ','ض','ت','ظ','ز','ة','لا','ؤ','','ء','ئ','ذ'];

  onMount(() => {
    const storedCars = localStorage.getItem('cars');
    const storedDrivers = localStorage.getItem('drivers');
    const storedOfficers = localStorage.getItem('officers');
    
    cars = storedCars ? JSON.parse(storedCars) : [];
    drivers = storedDrivers ? JSON.parse(storedDrivers) : [];
    officers = storedOfficers ? JSON.parse(storedOfficers) : [];
  });

  function formatPlateNumbers(numbers) {
    return numbers?.length === 4 ? `${numbers.slice(0, 2)}-${numbers.slice(2)}` : numbers;
  }

  function handleSearchLetterInput(index, event) {
    const val = event.target.value;
    
    if (allowedLetters.includes(val)) {
      searchPlateLetters[index] = val;
      
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
    const plateNumberMatch = !searchPlateNumbers || 
      (car.plate?.numbers && car.plate.numbers.includes(searchPlateNumbers));
    
    const plateLetterMatch = searchPlateLetters.every((letter, index) => {
      return !letter || (car.plate?.letters && car.plate.letters[index] === letter);
    });
    
    const modelMatch = !searchCarModel || 
      (car.model && car.model.toLowerCase().includes(searchCarModel.toLowerCase()));
    
    const statusMatch = searchCarStatus === 'الكل' || 
      (car.status && car.status === searchCarStatus);
    
    const driverMatch = !searchDriverName || 
      (car.currentMission?.driverId && getDriverName(car.currentMission.driverId).toLowerCase().includes(searchDriverName.toLowerCase()));
    
    const officerMatch = !searchOfficerName || 
      (car.currentMission?.officerId && getOfficerName(car.currentMission.officerId).toLowerCase().includes(searchOfficerName.toLowerCase()));
    
    const missionDateMatch = !searchMissionDate ||
      (car.missions?.some(m => m.date === searchMissionDate));
    
    return plateNumberMatch && plateLetterMatch && modelMatch && statusMatch && driverMatch && officerMatch && missionDateMatch;
  });

  // تصفية السائقين المتاحين
  $: availableDrivers = drivers.filter(driver => driver.status === 'مفعل');
  
  // تصفية الضباط المتاحين مع التحقق من عدم تعيينهم في نفس التاريخ
  $: availableOfficers = officers.filter(officer => {
    if (officer.status !== 'مفعل') return false;
    
    // إذا لم يكن هناك تاريخ محدد، نعرض جميع الضباط
    if (!missionDate) return true;
    
    // التحقق من أن الضابط غير معين في أي سيارة أخرى في نفس التاريخ
    const isAssigned = cars.some(car => 
      car.missions?.some(m => 
        m.officerId === officer.id && 
        m.date === missionDate &&
        car.id !== selectedCar?.id
      )
    );
    
    return !isAssigned;
  });

  // تعيين السائق
  function assignDriver() {
    if (selectedCar && selectedDriver) {
      selectedCar.currentMission = selectedCar.currentMission || {};
      selectedCar.currentMission.driverId = selectedDriver;
      saveCarData();
      alert("تم تعيين السائق بنجاح ✅");
    }
  }

  // إلغاء تعيين السائق
  function unassignDriver() {
    if (!selectedCar) return;
    
    if (selectedCar.currentMission) {
      selectedCar.currentMission.driverId = null;
      saveCarData();
      alert('تم إلغاء تعيين السائق');
    }
  }

  // تعيين الضابط
  function assignOfficer() {
    if (selectedCar && selectedOfficer) {
      // التحقق من أن الضابط غير معين في سيارة أخرى في نفس التاريخ
      const isOfficerAssigned = cars.some(car => 
        car.missions?.some(m => 
          m.officerId === selectedOfficer && 
          m.date === missionDate &&
          car.id !== selectedCar.id
        )
      );
      
      if (isOfficerAssigned) {
        alert("هذا الضابط معين بالفعل في مهمة أخرى في نفس التاريخ");
        return;
      }
      
      selectedCar.currentMission = selectedCar.currentMission || {};
      selectedCar.currentMission.officerId = selectedOfficer;
      saveCarData();
      alert("تم تعيين الضابط بنجاح ✅");
    }
  }

  // إلغاء تعيين الضابط
  function unassignOfficer() {
    if (!selectedCar) return;
    
    if (selectedCar.currentMission) {
      selectedCar.currentMission.officerId = null;
      saveCarData();
      alert('تم إلغاء تعيين الضابط');
    }
  }

  // حفظ مواعيد المهمة
  function saveMission() {
    if (!selectedCar || !missionDate) {
      alert("يجب تحديد تاريخ المهمة");
      return;
    }
    
    // التحقق من أن الضابط غير معين في سيارة أخرى في نفس التاريخ
    if (selectedOfficer) {
      const isOfficerAssigned = cars.some(car => 
        car.missions?.some(m => 
          m.officerId === selectedOfficer && 
          m.date === missionDate &&
          car.id !== selectedCar.id
        )
      );
      
      if (isOfficerAssigned) {
        alert("هذا الضابط معين بالفعل في مهمة أخرى في نفس التاريخ");
        return;
      }
    }
    
    // إنشاء مهمة جديدة
    const newMission = {
      id: Date.now().toString(),
      date: missionDate,
      departureTime,
      returnTime,
      description: missionDescription,
      driverId: selectedDriver,
      officerId: selectedOfficer,
      carId: selectedCar.id,
      createdAt: new Date().toISOString()
    };
    
    // إضافة المهمة للسجل
    selectedCar.missions = selectedCar.missions || [];
    selectedCar.missions.unshift(newMission);
    
    // تحديث المهمة الحالية
    selectedCar.currentMission = {
      driverId: selectedDriver,
      officerId: selectedOfficer,
      missionId: newMission.id
    };
    
    saveCarData();
    
    // إعادة تعيين الحقول
    departureTime = '';
    returnTime = '';
    missionDescription = '';
    
    alert('تم حفظ المهمة بنجاح');
  }

  // إنهاء المهمة الحالية
  function endCurrentMission() {
    if (!selectedCar || !selectedCar.currentMission) return;
    
    if (confirm("هل تريد إنهاء المهمة الحالية؟")) {
      // تحديث المهمة في السجل
      const missionIndex = selectedCar.missions?.findIndex(
        m => m.id === selectedCar.currentMission.missionId
      );
      
      if (missionIndex !== -1) {
        selectedCar.missions[missionIndex].returnTime = new Date().toISOString();
        selectedCar.missions[missionIndex].status = 'منتهية';
      }
      
      // مسح المهمة الحالية
      selectedCar.currentMission = null;
      selectedDriver = '';
      selectedOfficer = '';
      
      saveCarData();
      alert('تم إنهاء المهمة بنجاح');
    }
  }

  // الحصول على اسم السائق
  function getDriverName(id) {
    if (!id) return 'غير معين';
    const driver = drivers.find(d => d.id === id);
    return driver ? `${driver.firstName} ${driver.lastName}` : 'غير معين';
  }
  
  // الحصول على اسم الضابط
  function getOfficerName(id) {
    if (!id) return 'غير معين';
    const officer = officers.find(o => o.id === id);
    return officer ? `${officer.firstName} ${officer.lastName} (${officer.rank})` : 'غير معين';
  }
  
  // حفظ بيانات السيارات
  function saveCarData() {
    localStorage.setItem('cars', JSON.stringify(cars));
  }
  
  // عند تحديد سيارة، نقوم بتحميل بياناتها
  $: if (selectedCar) {
    selectedDriver = selectedCar.currentMission?.driverId || '';
    selectedOfficer = selectedCar.currentMission?.officerId || '';
    missionDate = '';
  }
</script>

<div class="header-top">
  <h2>نظام إدارة مهمات السيارات</h2>
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
        <label for="officerName">اسم الضابط:</label>
        <input
          id="officerName"
          type="text"
          placeholder="ابحث باسم الضابط"
          bind:value={searchOfficerName}
        />
      </div>
      
      <div class="search-group">
        <label for="carStatus">حالة السيارة:</label>
        <select id="carStatus" bind:value={searchCarStatus}>
          <option value="الكل">الكل</option>
          <option value="نشطة">نشطة</option>
          <option value="غير نشطة">غير نشطة</option>
          <option value="في الصيانة">في الصيانة</option>
          <option value="في مهمة">في مهمة</option>
        </select>
      </div>
      
      <div class="search-group">
        <label for="missionDate">تاريخ المهمة:</label>
        <input
          id="missionDate"
          type="date"
          bind:value={searchMissionDate}
        />
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
              <th>الموديل</th>
              <th>الحالة</th>
              <th>السائق الحالي</th>
              <th>الضابط الحالي</th>
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
                <td>{car.model || '--'}</td>
                <td>
                  <span class="status-{car.status?.toLowerCase()?.replace(' ', '-')}">
                    {car.status || '--'}
                  </span>
                </td>
                <td>{getDriverName(car.currentMission?.driverId)}</td>
                <td>{getOfficerName(car.currentMission?.officerId)}</td>
                <td>
                  <button 
                    on:click={() => {
                      selectedCar = car;
                      selectedDriver = car.currentMission?.driverId || '';
                      selectedOfficer = car.currentMission?.officerId || '';
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
    
    <!-- قسم إدارة المهمات -->
    {#if selectedCar}
      <div class="mission-management">
        <h2>إدارة مهمات السيارة المحددة</h2>
        
        <div class="selected-car">
          <h3>تفاصيل السيارة:</h3>
          <p><strong>رقم اللوحة:</strong> {formatPlateNumbers(selectedCar.plate?.numbers)} {selectedCar.plate?.letters?.join('')}</p>
          <p><strong>العلامة التجارية:</strong> {selectedCar.brand}</p>
          <p><strong>الموديل:</strong> {selectedCar.model}</p>
          <p><strong>الحالة:</strong> {selectedCar.status}</p>
          
          {#if selectedCar.currentMission}
            <div class="current-mission">
              <h3>المهمة الحالية:</h3>
              <p><strong>السائق:</strong> {getDriverName(selectedCar.currentMission.driverId)}</p>
              <p><strong>الضابط:</strong> {getOfficerName(selectedCar.currentMission.officerId)}</p>
              <p><strong>حالة المهمة:</strong> <span class="status-active">جارية</span></p>
              
              <button 
                on:click={endCurrentMission}
                class="end-mission-btn"
              >
                إنهاء المهمة
              </button>
            </div>
          {:else}
            <div class="no-current-mission">
              <p>لا توجد مهمة نشطة حالياً</p>
            </div>
          {/if}
        </div>
        
        <!-- تعيين السائق والضابط -->
        <div class="assignments-section">
          <div class="driver-assignment">
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
            
            <div class="driver-actions">
              <button 
                on:click={assignDriver}
                disabled={
                  !selectedCar || 
                  !selectedDriver || 
                  selectedCar.currentMission?.driverId === selectedDriver
                }
                class="assign-btn"
              >
                تعيين السائق
              </button>
              <button 
                on:click={unassignDriver} 
                disabled={!selectedCar.currentMission?.driverId}
                class="unassign-btn"
              >
                إلغاء التعيين
              </button>
            </div>
          </div>
          
          <div class="officer-assignment">
            <label for="officerSelect">اختر ضابطًا:</label>
            <select 
              id="officerSelect" 
              bind:value={selectedOfficer}
              disabled={availableOfficers.length === 0}
            >
              <option value="">-- اختر ضابطًا --</option>
              {#each availableOfficers as officer}
                <option value={officer.id}>
                  {officer.firstName} {officer.lastName} - {officer.rank}
                </option>
              {/each}
            </select>
            
            {#if availableOfficers.length === 0 && missionDate}
              <p class="no-officers">لا يوجد ضباط متاحين أو الضابط معين بالفعل في هذا التاريخ</p>
            {:else if availableOfficers.length === 0}
              <p class="no-officers">لا يوجد ضباط متاحين</p>
            {/if}
            
            <div class="officer-actions">
              <button 
                on:click={assignOfficer}
                disabled={
                  !selectedCar || 
                  !selectedOfficer || 
                  selectedCar.currentMission?.officerId === selectedOfficer
                }
                class="assign-btn"
              >
                تعيين الضابط
              </button>
              <button 
                on:click={unassignOfficer} 
                disabled={!selectedCar.currentMission?.officerId}
                class="unassign-btn"
              >
                إلغاء التعيين
              </button>
            </div>
          </div>
        </div>
        
        <!-- تسجيل مهمة جديدة -->
        <div class="new-mission-section">
          <h3>تسجيل مهمة جديدة</h3>
          
          <div class="mission-form">
            <div class="form-row">
              <div class="form-group">
                <label for="missionDate">تاريخ المهمة:</label>
                <input 
                  type="date" 
                  id="missionDate" 
                  bind:value={missionDate}
                  required
                />
              </div>
              
              <div class="form-group">
                <label for="departureTime">موعد الخروج:</label>
                <input 
                  type="time" 
                  id="departureTime" 
                  bind:value={departureTime}
                />
              </div>
              
              <div class="form-group">
                <label for="returnTime">موعد العودة:</label>
                <input 
                  type="time" 
                  id="returnTime" 
                  bind:value={returnTime}
                />
              </div>
            </div>
            
            <div class="form-group">
              <label for="missionDescription">وصف المهمة:</label>
              <textarea
                id="missionDescription"
                bind:value={missionDescription}
                placeholder="أدخل وصفاً للمهمة..."
                rows="3"
              ></textarea>
            </div>
            
            <button 
              on:click={saveMission}
              disabled={!missionDate}
              class="save-mission-btn"
            >
              حفظ المهمة
            </button>
          </div>
        </div>
        
        <!-- سجل المهمات -->
        <div class="missions-history">
          <h3>سجل المهمات</h3>
          
          {#if selectedCar.missions?.length === 0}
            <p class="no-missions">لا توجد مهمات مسجلة لهذه السيارة</p>
          {:else}
            <table class="missions-table">
              <thead>
                <tr>
                  <th>التاريخ</th>
                  <th>الضابط</th>
                  <th>السائق</th>
                  <th>موعد الخروج</th>
                  <th>موعد العودة</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {#each selectedCar.missions as mission}
                  <tr>
                    <td>{mission.date}</td>
                    <td>{getOfficerName(mission.officerId)}</td>
                    <td>{getDriverName(mission.driverId)}</td>
                    <td>{mission.departureTime || '--'}</td>
                    <td>{mission.returnTime || '--'}</td>
                    <td>
                      <span class="status-{mission.status === 'منتهية' ? 'ended' : 'active'}">
                        {mission.status || 'جارية'}
                      </span>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          {/if}
        </div>
      </div>
    {:else}
      <div class="no-selection">
        <p>الرجاء تحديد سيارة من القائمة لإدارتها</p>
      </div>
    {/if}
  </div>
</div>

<style>
  :global(body) {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #f5f7fa;
    color: #333;
    margin: 0;
    padding: 0;
    line-height: 1.6;
  }

  .header-top {
    background-color: #4361EE;
    color: white;
    padding: 1rem;
    margin-bottom: 1.5rem;
    border-radius: 4px;
  }

  .header-top h2 {
    margin: 0;
    font-weight: 600;
  }

  .cars-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }

  /* قسم البحث */
  .search-section {
    background-color: white;
    padding: 1.5rem;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
    margin-bottom: 1.5rem;
  }

  .search-fields {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.2rem;
  }

  .search-group {
    display: flex;
    flex-direction: column;
  }

  .search-group label {
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #2c3e50;
    font-size: 0.9rem;
  }

  .search-group input,
  .search-group select {
    padding: 0.7rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 0.95rem;
    transition: all 0.3s ease;
    background-color: #f9f9f9;
  }

  .search-group input:focus,
  .search-group select:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
    background-color: white;
  }

  .plate-letters {
    display: flex;
    gap: 0.5rem;
  }

  .plate-letters input {
    width: 2.5rem;
    text-align: center;
    padding: 0.7rem 0;
  }

  /* قسم النتائج */
  .results-section {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 1.5rem;
  }

  .cars-list {
    background-color: white;
    padding: 1.5rem;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  }

  .cars-list h2 {
    margin-top: 0;
    color: #2c3e50;
    border-bottom: 1px solid #eee;
    padding-bottom: 0.8rem;
    font-size: 1.3rem;
  }

  .no-results, .no-selection {
    text-align: center;
    padding: 2rem;
    color: #7f8c8d;
    font-size: 1.1rem;
  }

  /* جدول السيارات */
  .cars-table {
    width: 100%;
    border-collapse: collapse;
    margin: 1rem 0;
    font-size: 0.9rem;
  }

  .cars-table th {
    background-color: #f8f9fa;
    padding: 1rem;
    text-align: center;
    font-weight: 600;
    color: #34495e;
    border-bottom: 2px solid #eee;
  }

  .cars-table td {
    padding: 0.9rem;
    text-align: center;
    border-bottom: 1px solid #eee;
  }

  .cars-table tr:hover {
    background-color: #f8f9fa;
  }

  .cars-table tr.selected {
    background-color: #e3f2fd;
  }

  /* أزرار التحديد */
  .select-btn {
    padding: 0.5rem 1rem;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.3s;
  }

  .select-btn:hover {
    background-color: #2980b9;
  }

  .select-btn[disabled] {
    background-color: #95a5a6;
    cursor: not-allowed;
  }

  /* حالة السيارة */
  .status {
    display: inline-block;
    padding: 0.4rem 0.8rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
  }

  .status-نشطة {
    background-color: #d5f5e3;
    color: #27ae60;
  }

  .status-غير-نشطة {
    background-color: #fadbd8;
    color: #e74c3c;
  }

  .status-في-الصيانة {
    background-color: #fdebd0;
    color: #f39c12;
  }

  .status-في-مهمة {
    background-color: #d6eaf8;
    color: #2980b9;
  }

  /* قسم إدارة المهمات */
  .mission-management {
    background-color: white;
    padding: 1.5rem;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  }

  .mission-management h2 {
    margin-top: 0;
    color: #2c3e50;
    font-size: 1.3rem;
    border-bottom: 1px solid #eee;
    padding-bottom: 0.8rem;
  }

  .selected-car {
    background-color: #f8f9fa;
    padding: 1.2rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
  }

  .selected-car h3 {
    margin-top: 0;
    color: #3498db;
    font-size: 1.1rem;
  }

  .selected-car p {
    margin: 0.5rem 0;
    line-height: 1.7;
  }

  .selected-car strong {
    color: #2c3e50;
    font-weight: 600;
  }

  .current-mission {
    background-color: #e8f4fc;
    padding: 1rem;
    border-radius: 8px;
    margin-top: 1rem;
    border-left: 4px solid #3498db;
  }

  .no-current-mission {
    background-color: #f9f9f9;
    padding: 1rem;
    border-radius: 8px;
    margin-top: 1rem;
    text-align: center;
    color: #7f8c8d;
  }

  .status-active {
    background-color: #d5f5e3;
    color: #27ae60;
    padding: 0.3rem 0.8rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
  }

  .end-mission-btn {
    padding: 0.6rem 1rem;
    background-color: #e74c3c;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    margin-top: 0.8rem;
    transition: all 0.3s;
  }

  .end-mission-btn:hover {
    background-color: #c0392b;
  }

  /* أقسام التعيين */
  .assignments-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .driver-assignment,
  .officer-assignment {
    background-color: #f8f9fa;
    padding: 1.2rem;
    border-radius: 8px;
  }

  .driver-assignment label,
  .officer-assignment label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #2c3e50;
  }

  .driver-assignment select,
  .officer-assignment select {
    width: 100%;
    padding: 0.8rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    margin-bottom: 1rem;
    background-color: white;
  }

  .no-drivers,
  .no-officers {
    color: #e74c3c;
    font-size: 0.9rem;
    margin: 0.5rem 0;
  }

  /* أزرار التعيين */
  .driver-actions,
  .officer-actions {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
  }

  .assign-btn {
    padding: 0.7rem 1.2rem;
    background-color: #2ecc71;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    flex: 1;
    transition: all 0.3s;
  }

  .assign-btn:hover {
    background-color: #27ae60;
  }

  .assign-btn:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
  }

  .unassign-btn {
    padding: 0.7rem 1.2rem;
    background-color: #e74c3c;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    flex: 1;
    transition: all 0.3s;
  }

  .unassign-btn:hover {
    background-color: #c0392b;
  }

  .unassign-btn:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
  }

  /* قسم المهمة الجديدة */
  .new-mission-section {
    background-color: #f8f9fa;
    padding: 1.2rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
  }

  .new-mission-section h3 {
    margin-top: 0;
    color: #3498db;
    font-size: 1.1rem;
  }

  .mission-form {
    margin-top: 1rem;
  }

  .form-row {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #2c3e50;
    font-size: 0.9rem;
  }

  .form-group input,
  .form-group textarea {
    width: 100%;
    padding: 0.7rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 0.95rem;
    background-color: white;
  }

  .form-group textarea {
    resize: vertical;
    min-height: 80px;
  }

  .save-mission-btn {
    padding: 0.8rem;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    width: 100%;
    transition: all 0.3s;
  }

  .save-mission-btn:hover {
    background-color: #2980b9;
  }

  .save-mission-btn:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
  }

  /* سجل المهمات */
  .missions-history {
    margin-top: 1.5rem;
  }

  .missions-history h3 {
    margin-top: 0;
    color: #2c3e50;
    font-size: 1.3rem;
    border-bottom: 1px solid #eee;
    padding-bottom: 0.8rem;
  }

  .no-missions {
    text-align: center;
    padding: 2rem;
    color: #7f8c8d;
  }

  .missions-table {
    width: 100%;
    border-collapse: collapse;
    margin: 1rem 0;
    font-size: 0.9rem;
  }

  .missions-table th {
    background-color: #f8f9fa;
    padding: 1rem;
    text-align: center;
    font-weight: 600;
    color: #34495e;
    border-bottom: 2px solid #eee;
  }

  .missions-table td {
    padding: 0.9rem;
    text-align: center;
    border-bottom: 1px solid #eee;
  }

  .missions-table tr:hover {
    background-color: #f8f9fa;
  }

  .status-active {
    background-color: #d5f5e3;
    color: #27ae60;
    padding: 0.3rem 0.8rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
  }

  .status-ended {
    background-color: #fadbd8;
    color: #e74c3c;
    padding: 0.3rem 0.8rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
  }

  /* التجاوب مع الشاشات الصغيرة */
  @media (max-width: 1024px) {
    .results-section {
      grid-template-columns: 1fr;
    }
    
    .assignments-section {
      grid-template-columns: 1fr;
    }
  }
</style>