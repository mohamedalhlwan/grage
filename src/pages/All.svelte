<script>
    import { onMount } from "svelte";
    import Headeve from "../header/Headeve.svelte";
  
    // بيانات النظام
    let cars = [];
    let selectedCar = null;
    let activeTab = 'fuel'; // 'fuel', 'maintenance', 'parts'
    
    // بيانات البحث المشتركة
    let searchPlateNumbers = "";
    let searchPlateLetters = ["", "", ""];
    let searchTrafficNumber = "";
    
    // بيانات سجلات البنزين
    let fuelDate = "";
    let fuelLiters = "";
    let fuelPricePerLiter = "";
    let fuelStartOdometer = "";
    let fuelEndOdometer = "";
    let fuelEditingIndex = null;
    
    // بيانات جدول الصيانة
    let maintenanceType = "";
    let maintenanceDate = "";
    let customMaintenanceType = "";
    let maintenanceEditingIndex = null;
    let generalServices = [];
    
    // بيانات قطع الغيار
    let spareParts = [];
    let sparePartsInventory = [];
    let selectedParts = [];
    let partsInstallationDate = new Date().toISOString().slice(0, 10);
    let partsInstallationMileage = "";
    let partsNotes = "";
  
    onMount(() => {
      loadData();
    });
  
    function loadData() {
      // تحميل البيانات المشتركة
      const storedCars = localStorage.getItem("cars");
      if (storedCars) cars = JSON.parse(storedCars);
      
      // تحميل بيانات الصيانة
      const storedServices = localStorage.getItem("generalServices");
      if (storedServices) generalServices = JSON.parse(storedServices);
      
      // تحميل بيانات قطع الغيار
      const storedParts = localStorage.getItem("spareParts");
      if (storedParts) spareParts = JSON.parse(storedParts);
      
      const storedInventory = localStorage.getItem("sparePartsInventory");
      if (storedInventory) sparePartsInventory = JSON.parse(storedInventory);
    }
  
    // فلترة السيارات
    $: filteredCars = cars.filter(car => {
      const plate = car.plate || {};
      const plateNumbers = plate.numbers ? 
        (Array.isArray(plate.numbers) ? plate.numbers.join('') : plate.numbers.toString()) : '';
      
      const plateLetters = plate.letters ? 
        (Array.isArray(plate.letters) ? plate.letters.join('') : plate.letters.toString()) : '';
      
      const searchLettersStr = searchPlateLetters.join('');
      
      const matchesNumbers = !searchPlateNumbers || plateNumbers.includes(searchPlateNumbers);
      const matchesLetters = !searchLettersStr || plateLetters.includes(searchLettersStr);
      const matchesTraffic = !searchTrafficNumber || 
        (car.trafficNumber && car.trafficNumber.includes(searchTrafficNumber));
      
      return matchesNumbers && matchesLetters && matchesTraffic;
    });
  
    // استخراج أنواع الصيانة العامة
    $: generalServiceTypes = [...new Set(generalServices.map(s => s.type))];
  
    // معالجة إدخال أحرف اللوحة
    function handleLetterInput(e, index) {
      const value = e.target.value;
      if (/^[\u0600-\u06FF]$/.test(value)) {
        searchPlateLetters[index] = value;
        const nextInput = e.target.nextElementSibling;
        if (nextInput?.tagName === "INPUT") nextInput.focus();
      } else {
        e.target.value = "";
        searchPlateLetters[index] = "";
      }
    }
  
    function allowOnlyArabic(e) {
      const char = String.fromCharCode(e.keyCode || e.which);
      if (!/^[\u0600-\u06FF]$/.test(char)) e.preventDefault();
    }
  
    function handlePlateNumbersInput(e) {
      const value = e.target.value.replace(/\D/g, '');
      searchPlateNumbers = value;
      e.target.value = value;
    }
  
    function selectCar(car) {
      selectedCar = car;
      resetAllForms();
    }
  
    function resetAllForms() {
      // إعادة تعيين نماذج البنزين
      fuelDate = fuelLiters = fuelPricePerLiter = fuelStartOdometer = fuelEndOdometer = "";
      fuelEditingIndex = null;
      
      // إعادة تعيين نماذج الصيانة
      maintenanceType = maintenanceDate = customMaintenanceType = "";
      maintenanceEditingIndex = null;
      
      // إعادة تعيين نماذج قطع الغيار
      selectedParts = [];
      partsInstallationDate = new Date().toISOString().slice(0, 10);
      partsInstallationMileage = partsNotes = "";
    }
  
    // ========== وظائف سجلات البنزين ==========
    function addOrUpdateFuelRecord() {
      if (!selectedCar) return;
      
      const newRecord = {
        date: fuelDate,
        liters: parseFloat(fuelLiters),
        pricePerLiter: parseFloat(fuelPricePerLiter),
        startOdometer: parseFloat(fuelStartOdometer),
        endOdometer: parseFloat(fuelEndOdometer),
        distance: parseFloat(fuelEndOdometer) - parseFloat(fuelStartOdometer)
      };
  
      selectedCar.fuelRecords = selectedCar.fuelRecords || [];
      
      if (fuelEditingIndex !== null) {
        selectedCar.fuelRecords[fuelEditingIndex] = newRecord;
      } else {
        selectedCar.fuelRecords.push(newRecord);
      }
  
      saveChanges();
      resetFuelForm();
    }
  
    function editFuelRecord(index) {
      const record = selectedCar.fuelRecords[index];
      fuelDate = record.date;
      fuelLiters = record.liters.toString();
      fuelPricePerLiter = record.pricePerLiter.toString();
      fuelStartOdometer = record.startOdometer.toString();
      fuelEndOdometer = record.endOdometer.toString();
      fuelEditingIndex = index;
    }
  
    function deleteFuelRecord(index) {
      if (confirm("هل تريد حذف هذا السجل؟")) {
        selectedCar.fuelRecords.splice(index, 1);
        saveChanges();
      }
    }
  
    function resetFuelForm() {
      fuelDate = fuelLiters = fuelPricePerLiter = fuelStartOdometer = fuelEndOdometer = "";
      fuelEditingIndex = null;
    }
  
    // ========== وظائف جدول الصيانة ==========
    function addOrUpdateMaintenance() {
      const finalType = maintenanceType === 'custom' ? customMaintenanceType : maintenanceType;
      
      if (!finalType) {
        alert("الرجاء اختيار أو إدخال نوع الصيانة");
        return;
      }
  
      const newService = {
        type: finalType,
        date: maintenanceDate,
        isGeneral: generalServices.some(s => s.type === finalType)
      };
  
      selectedCar.maintenance = selectedCar.maintenance || [];
  
      if (maintenanceEditingIndex !== null) {
        selectedCar.maintenance[maintenanceEditingIndex] = newService;
      } else {
        selectedCar.maintenance.push(newService);
      }
  
      saveChanges();
      resetMaintenanceForm();
    }
  
    function editMaintenance(index) {
      const s = selectedCar.maintenance[index];
      maintenanceType = s.isGeneral ? s.type : 'custom';
      customMaintenanceType = s.isGeneral ? '' : s.type;
      maintenanceDate = s.date;
      maintenanceEditingIndex = index;
    }
  
    function deleteMaintenance(index) {
      if (confirm("هل تريد حذف هذه الصيانة؟")) {
        selectedCar.maintenance.splice(index, 1);
        saveChanges();
      }
    }
  
    function resetMaintenanceForm() {
      maintenanceType = maintenanceDate = customMaintenanceType = "";
      maintenanceEditingIndex = null;
    }
  
    // ========== وظائف قطع الغيار ==========
    function addPartsToCar() {
      if (!selectedCar || selectedParts.length === 0) {
        alert("يجب اختيار سيارة وقطع غيار");
        return;
      }
  
      const newInventory = [...sparePartsInventory];
      const updatedCars = [...cars];
      const carIndex = updatedCars.findIndex(c => c.id === selectedCar.id);
      
      selectedParts.forEach(partId => {
        const part = spareParts.find(p => p.id === partId);
        const inventoryIndex = newInventory.findIndex(item => item.partId === partId);
        
        if (inventoryIndex !== -1 && newInventory[inventoryIndex].currentStock > 0) {
          newInventory[inventoryIndex].currentStock -= 1;
          
          const transaction = {
            date: partsInstallationDate,
            type: "تركيب",
            quantity: 1,
            notes: `تركيب في السيارة: ${selectedCar.name}`,
            balanceBefore: newInventory[inventoryIndex].currentStock + 1,
            balanceAfter: newInventory[inventoryIndex].currentStock
          };
          
          newInventory[inventoryIndex].transactions.unshift(transaction);
          
          updatedCars[carIndex].installedParts = updatedCars[carIndex].installedParts || [];
          updatedCars[carIndex].installedParts.push({
            partId: part.id,
            partName: part.name,
            installationDate: partsInstallationDate,
            installationMileage: partsInstallationMileage || 0,
            notes: partsNotes,
            lifeMileage: part.lifeMileage,
            lifeTime: part.lifeTime
          });
        }
      });
      
      sparePartsInventory = newInventory;
      cars = updatedCars;
      localStorage.setItem("sparePartsInventory", JSON.stringify(sparePartsInventory));
      localStorage.setItem("cars", JSON.stringify(cars));
      
      selectedParts = [];
      partsNotes = "";
    }
  
    function saveChanges() {
      localStorage.setItem("cars", JSON.stringify(cars));
    }
  </script>
  
  <Headeve />
  
  <div class="container">
    <!-- قسم البحث عن السيارات -->
    <div class="search-section">
      <h2>🔍 البحث عن سيارة</h2>
      
      <div class="search-fields">
        <div class="search-row">
          <label>🔠 حروف اللوحة:</label>
          <div class="plate-inputs">
            {#each searchPlateLetters as letter, i}
              <input
                type="text"
                maxlength="1"
                bind:value={searchPlateLetters[i]}
                on:input={(e) => handleLetterInput(e, i)}
                on:keypress={allowOnlyArabic}
                placeholder="حرف"
              />
            {/each}
          </div>
        </div>
        
        <div class="search-row">
          <label>🔢 أرقام اللوحة:</label>
          <input
            type="text"
            bind:value={searchPlateNumbers}
            on:input={handlePlateNumbersInput}
            maxlength="4"
            placeholder="أرقام اللوحة"
          />
        </div>
        
        <div class="search-row">
          <label>🚔 رقم المرور:</label>
          <input 
            type="text" 
            bind:value={searchTrafficNumber} 
            placeholder="ابحث برقم المرور"
          />
        </div>
      </div>
      
      <div class="results">
        {#if cars.length === 0}
          <p class="no-results">⚠️ لا توجد سيارات مسجلة</p>
        {:else if filteredCars.length === 0}
          <p class="no-results">⚠️ لا توجد سيارات مطابقة لبحثك</p>
        {:else}
          {#each filteredCars as car (car.id)}
            <div class="car-card" class:selected={selectedCar?.id === car.id}>
              <p>اللوحة: 
                {Array.isArray(car.plate?.letters) ? car.plate.letters.join(' ') : car.plate?.letters || '---'} - 
                {Array.isArray(car.plate?.numbers) ? car.plate.numbers.join('') : car.plate?.numbers || '----'}
              </p>
              <p>رقم المرور: {car.trafficNumber || 'غير مسجل'}</p>
              <p>المسافة: {car.Km || 0} كم</p>
              <button on:click={() => selectCar(car)}>
                {selectedCar?.id === car.id ? '✔️ مختارة' : 'إدارة السجلات'}
              </button>
            </div>
          {/each}
        {/if}
      </div>
    </div>
    
    <!-- قسم إدارة السجلات -->
    <div class="management-section">
      {#if selectedCar}
        <div class="tabs">
          <button 
            class:active={activeTab === 'fuel'}
            on:click={() => activeTab = 'fuel'}
          >
            ⛽ سجلات البنزين
          </button>
          <button 
            class:active={activeTab === 'maintenance'}
            on:click={() => activeTab = 'maintenance'}
          >
            🛠️ جدول الصيانة
          </button>
          <button 
            class:active={activeTab === 'parts'}
            on:click={() => activeTab = 'parts'}
          >
            🔧 قطع الغيار
          </button>
        </div>
        
        <div class="car-info">
          <h3>السيارة المحددة: {selectedCar.name}</h3>
          <p>
            اللوحة: {Array.isArray(selectedCar.plate?.letters) ? selectedCar.plate.letters.join(' ') : selectedCar.plate?.letters || '---'} - 
            {Array.isArray(selectedCar.plate?.numbers) ? selectedCar.plate.numbers.join('') : selectedCar.plate?.numbers || '----'}
          </p>
        </div>
        
        <!-- محتوى تبويب البنزين -->
        {#if activeTab === 'fuel'}
          <div class="fuel-records">
            <div class="record-form">
              <h3>{fuelEditingIndex !== null ? '✏️ تعديل السجل' : '➕ إضافة سجل بنزين'}</h3>
              <form on:submit|preventDefault={addOrUpdateFuelRecord}>
                <div class="form-group">
                  <label>📅 التاريخ:</label>
                  <input type="date" bind:value={fuelDate} required />
                </div>
                
                <div class="form-group">
                  <label>⛽ الكمية (لتر):</label>
                  <input type="number" step="0.1" bind:value={fuelLiters} placeholder="كمية البنزين" required />
                </div>
                
                <div class="form-group">
                  <label>💰 السعر (للتر):</label>
                  <input type="number" step="0.01" bind:value={fuelPricePerLiter} placeholder="السعر لكل لتر" required />
                </div>
                
                <div class="form-group">
                  <label>🔢 عداد البداية:</label>
                  <input type="number" bind:value={fuelStartOdometer} placeholder="قراءة العداد" required />
                </div>
                
                <div class="form-group">
                  <label>🔢 عداد النهاية:</label>
                  <input type="number" bind:value={fuelEndOdometer} placeholder="قراءة العداد" required />
                </div>
                
                <div class="form-actions">
                  <button type="submit" class="save-btn">
                    {fuelEditingIndex !== null ? '💾 حفظ التعديلات' : '➕ إضافة السجل'}
                  </button>
                  {#if fuelEditingIndex !== null}
                    <button type="button" on:click={resetFuelForm} class="cancel-btn">إلغاء</button>
                  {/if}
                </div>
              </form>
            </div>
            
            <div class="records-list">
              <h3>📋 سجلات البنزين ({selectedCar.fuelRecords?.length || 0})</h3>
              
              {#if selectedCar.fuelRecords?.length > 0}
                <table>
                  <thead>
                    <tr>
                      <th>📅 التاريخ</th>
                      <th>⛽ اللترات</th>
                      <th>💰 السعر</th>
                      <th>🔢 البداية</th>
                      <th>🔢 النهاية</th>
                      <th>📏 المسافة</th>
                      <th>⚙️ إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {#each selectedCar.fuelRecords as record, i}
                      <tr>
                        <td>{record.date}</td>
                        <td>{record.liters} لتر</td>
                        <td>{record.pricePerLiter} ج.م</td>
                        <td>{record.startOdometer}</td>
                        <td>{record.endOdometer}</td>
                        <td>{record.distance} كم</td>
                        <td class="actions">
                          <button on:click={() => editFuelRecord(i)} class="edit-btn">تعديل</button>
                          <button on:click={() => deleteFuelRecord(i)} class="delete-btn">حذف</button>
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              {:else}
                <p class="no-records">لا توجد سجلات بنزين مسجلة</p>
              {/if}
            </div>
          </div>
        
        <!-- محتوى تبويب الصيانة -->
        {:else if activeTab === 'maintenance'}
          <div class="maintenance-records">
            <div class="maintenance-form">
              <h3>{maintenanceEditingIndex !== null ? '✏️ تعديل الصيانة' : '➕ إضافة صيانة'}</h3>
              <form on:submit|preventDefault={addOrUpdateMaintenance}>
                <div class="form-group">
                  <label>🛠️ نوع الصيانة:</label>
                  <select bind:value={maintenanceType} required>
                    <option value="">-- اختر نوع الصيانة --</option>
                    {#each generalServiceTypes as type}
                      <option value={type}>{type}</option>
                    {/each}
                    <option value="custom">➕ إضافة خدمة مخصصة</option>
                  </select>
                  
                  {#if maintenanceType === 'custom'}
                    <input 
                      type="text" 
                      bind:value={customMaintenanceType} 
                      placeholder="أدخل نوع الصيانة الجديدة" 
                      required
                    />
                  {/if}
                </div>
                
                <div class="form-group">
                  <label>📅 تاريخ الصيانة:</label>
                  <input type="date" bind:value={maintenanceDate} required />
                </div>
                
                <div class="form-actions">
                  <button type="submit" class="save-btn">
                    {maintenanceEditingIndex !== null ? '💾 حفظ التعديلات' : '➕ إضافة الصيانة'}
                  </button>
                  {#if maintenanceEditingIndex !== null}
                    <button type="button" on:click={resetMaintenanceForm} class="cancel-btn">إلغاء</button>
                  {/if}
                </div>
              </form>
            </div>
            
            <div class="maintenance-list">
              <h3>📋 سجل الصيانة ({selectedCar.maintenance?.length || 0})</h3>
              
              {#if selectedCar.maintenance?.length > 0}
                <table>
                  <thead>
                    <tr>
                      <th>🛠️ نوع الصيانة</th>
                      <th>📅 التاريخ</th>
                      <th>⚙️ إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {#each selectedCar.maintenance as service, i}
                      <tr>
                        <td>
                          {service.type}
                          {#if service.isGeneral}
                            <span class="general-badge">عامة</span>
                          {/if}
                        </td>
                        <td>{service.date}</td>
                        <td class="actions">
                          <button on:click={() => editMaintenance(i)} class="edit-btn">تعديل</button>
                          <button on:click={() => deleteMaintenance(i)} class="delete-btn">حذف</button>
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              {:else}
                <p class="no-records">لا توجد صيانة مسجلة</p>
              {/if}
            </div>
          </div>
        
        <!-- محتوى تبويب قطع الغيار -->
        {:else if activeTab === 'parts'}
          <div class="parts-records">
            <div class="parts-form">
              <h3>🔧 تركيب قطع غيار</h3>
              <form on:submit|preventDefault={addPartsToCar}>
                <div class="form-group">
                  <label>📅 تاريخ التركيب:</label>
                  <input type="date" bind:value={partsInstallationDate} required />
                </div>
                
                <div class="form-group">
                  <label>🔢 عدد الكيلومترات:</label>
                  <input 
                    type="number" 
                    bind:value={partsInstallationMileage} 
                    placeholder="عدد الكيلومترات عند التركيب"
                    min="0"
                    required
                  />
                </div>
                
                <div class="form-group">
                  <label>🔧 قطع الغيار:</label>
                  <select bind:value={selectedParts} multiple size="5" required>
                    {#each spareParts as part}
                      {#if sparePartsInventory.find(item => item.partId === part.id)?.currentStock > 0}
                        <option value={part.id}>
                          {part.name} 
                          {part.lifeMileage ? ` (${part.lifeMileage} كم)` : ''}
                          {part.lifeTime ? ` (${part.lifeTime} يوم)` : ''}
                          - متوفر: {sparePartsInventory.find(item => item.partId === part.id)?.currentStock || 0}
                        </option>
                      {/if}
                    {/each}
                  </select>
                  <div class="hint">اضغط مع الاستمرار على Ctrl لتحديد أكثر من قطعة</div>
                </div>
                
                <div class="form-group">
                  <label>📝 ملاحظات:</label>
                  <textarea bind:value={partsNotes} placeholder="أي ملاحظات حول التركيب..."></textarea>
                </div>
                
                <button type="submit" class="save-btn">
                  تسجيل التركيب وتحديث المخزون
                </button>
              </form>
            </div>
            
            <div class="parts-list">
              <h3>🔧 القطع المثبتة ({selectedCar.installedParts?.length || 0})</h3>
              
              {#if selectedCar.installedParts?.length > 0}
                <table>
                  <thead>
                    <tr>
                      <th>🔧 اسم القطعة</th>
                      <th>📅 تاريخ التركيب</th>
                      <th>🔢 كيلومترات التركيب</th>
                      <th>⏳ العمر الافتراضي</th>
                      <th>📝 ملاحظات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {#each selectedCar.installedParts as part}
                      <tr>
                        <td>{part.partName}</td>
                        <td>{part.installationDate}</td>
                        <td>{part.installationMileage} كم</td>
                        <td>
                          {part.lifeMileage ? `${part.lifeMileage} كم` : ''}
                          {part.lifeTime ? ` / ${part.lifeTime} يوم` : ''}
                        </td>
                        <td>{part.notes || '--'}</td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              {:else}
                <p class="no-records">لا توجد قطع غيار مثبتة</p>
              {/if}
            </div>
          </div>
        {/if}
      {:else}
        <div class="no-car-selected">
          <h3>👈 الرجاء اختيار سيارة من القائمة</h3>
          <p>اختر سيارة من القائمة على اليسار لعرض وإدارة سجلاتها</p>
        </div>
      {/if}
    </div>
  </div>
  
  <style>
    /* التنسيق العام */
    .container {
      display: flex;
      gap: 20px;
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
      font-family: 'Tajawal', sans-serif;
    }
    
    .search-section, .management-section {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    
    .search-section {
      flex: 1;
      min-width: 300px;
    }
    
    .management-section {
      flex: 2;
      min-width: 500px;
    }
    
    /* تنسيق البحث */
    .search-fields {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    
    .search-row {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    
    .search-row label {
      font-weight: bold;
      color: #555;
    }
    
    .plate-inputs {
      display: flex;
      gap: 5px;
    }
    
    .plate-inputs input {
      width: 40px;
      height: 40px;
      text-align: center;
      font-size: 16px;
    }
    
    input, select, textarea {
      padding: 10px;
      border: 1px solid #ced4da;
      border-radius: 6px;
      font-size: 14px;
    }
    
    /* تنسيق نتائج البحث */
    .results {
      max-height: 600px;
      overflow-y: auto;
      margin-top: 20px;
    }
    
    .car-card {
      background: white;
      padding: 15px;
      margin-bottom: 10px;
      border-radius: 8px;
      border-left: 4px solid #007bff;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .car-card:hover {
      background: #f0f4ff;
      border-color: #4361ee;
    }
    
    .car-card.selected {
      background: #4361ee;
      color: white;
      border-color: #4361ee;
    }
    
    .car-card button {
      margin-top: 10px;
      padding: 8px 12px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .car-card.selected button {
      background: white;
      color: #4361ee;
    }
    
    .no-results {
      text-align: center;
      padding: 20px;
      color: #6c757d;
    }
    
    /* تنسيق التبويبات */
    .tabs {
      display: flex;
      gap: 5px;
      margin-bottom: 20px;
      border-bottom: 1px solid #dee2e6;
    }
    
    .tabs button {
      padding: 10px 15px;
      background: none;
      border: none;
      border-bottom: 3px solid transparent;
      cursor: pointer;
      font-weight: 500;
      color: #495057;
      transition: all 0.2s;
    }
    
    .tabs button.active {
      border-bottom-color: #4361ee;
      color: #4361ee;
      background: #f0f4ff;
    }
    
    .tabs button:hover:not(.active) {
      background: #f8f9fa;
    }
    
    /* تنسيق معلومات السيارة */
    .car-info {
      background: #e9ecef;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    
    .car-info h3 {
      margin-top: 0;
      color: #4361ee;
    }
    
    /* تنسيق النماذج */
    .record-form, .maintenance-form, .parts-form {
      background: #f8f9ff;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    
    .form-group {
      margin-bottom: 15px;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
      color: #555;
    }
    
    .form-actions {
      display: flex;
      gap: 10px;
      margin-top: 15px;
    }
    
    .save-btn {
      background: #4361ee;
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 6px;
      cursor: pointer;
    }
    
    .cancel-btn {
      background: #6c757d;
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 6px;
      cursor: pointer;
    }
    
    /* تنسيق الجداول */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }
    
    th, td {
      padding: 12px;
      text-align: right;
      border-bottom: 1px solid #dee2e6;
    }
    
    th {
      background: #f5f7fa;
      font-weight: 600;
      color: #555;
    }
    
    tr:hover {
      background: #f9f9f9;
    }
    
    .actions {
      display: flex;
      gap: 5px;
      justify-content: center;
    }
    
    .edit-btn {
      background: #ffc107;
      color: #212529;
      border: none;
      padding: 5px 10px;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .delete-btn {
      background: #dc3545;
      color: white;
      border: none;
      padding: 5px 10px;
      border-radius: 4px;
      cursor: pointer;
    }
    
    /* تنسيقات خاصة */
    .general-badge {
      background: #28a745;
      color: white;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 12px;
      margin-right: 5px;
    }
    
    .hint {
      font-size: 12px;
      color: #6c757d;
      margin-top: 5px;
    }
    
    .no-records, .no-car-selected {
      text-align: center;
      padding: 20px;
      color: #6c757d;
    }
    
    /* تنسيق متعدد التحديد */
    select[multiple] {
      min-height: 150px;
    }
    
    textarea {
      min-height: 80px;
      resize: vertical;
    }
    
    @media (max-width: 1024px) {
      .container {
        flex-direction: column;
      }
      
      .search-section, .management-section {
        width: 100%;
      }
    }
  </style>