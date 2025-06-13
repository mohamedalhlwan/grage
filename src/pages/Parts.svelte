<script>
  import { onMount } from "svelte";
  import Headeve from "../header/Headeve.svelte";
  
  // بيانات النظام
  let cars = [];
  let selectedCar = null;
  let spareParts = [];
  let sparePartsInventory = [];
  
  // حقول البحث
  let searchPlateNumbers = "";
  let searchPlateLetters = ["", "", ""];
  let searchTrafficNumber = "";
  
  // حقول إضافة قطع غيار للسيارة
  let selectedParts = [];
  let installationDate = new Date().toISOString().slice(0, 10);
  let installationMileage = "";
  let notes = "";
  
  let searchQuery = "";

  onMount(() => {
    loadData();
  });

  // تحميل البيانات
  function loadData() {
    const storedCars = localStorage.getItem("cars");
    if (storedCars) cars = JSON.parse(storedCars);
    
    const storedParts = localStorage.getItem("spareParts");
    if (storedParts) spareParts = JSON.parse(storedParts);
    
    const storedInventory = localStorage.getItem("sparePartsInventory");
    if (storedInventory) sparePartsInventory = JSON.parse(storedInventory);
  }

  // البحث عن السيارات
  $: filteredCars = cars.filter(car => {
    const plate = car.plate || {};
    const plateNumbers = plate.numbers || "";
    const plateLetters = (plate.letters || []).join('') || "";
    
    const searchLetters = searchPlateLetters.join('') || "";
    
    const matchesNumbers = !searchPlateNumbers || 
      plateNumbers.toString().includes(searchPlateNumbers);
    
    const matchesLetters = !searchLetters || 
      plateLetters.includes(searchLetters);
    
    const matchesTraffic = !searchTrafficNumber || 
      (car.trafficNumber && car.trafficNumber.includes(searchTrafficNumber));
    
    return matchesNumbers && matchesLetters && matchesTraffic;
  });

  // إضافة قطع غيار للسيارة
  function addPartsToCar() {
    if (!selectedCar || selectedParts.length === 0) {
      alert("يجب اختيار سيارة وقطع غيار");
      return;
    }

    // إنشاء نسخة من المخزون للتعديل
    const newInventory = [...sparePartsInventory];
    
    // إنشاء نسخة من السيارات للتعديل
    const updatedCars = [...cars];
    const carIndex = updatedCars.findIndex(c => c.id === selectedCar.id);
    
    // تحديث المخزون وإضافة القطع للسيارة
    selectedParts.forEach(partId => {
      const part = spareParts.find(p => p.id === partId);
      const inventoryIndex = newInventory.findIndex(item => item.partId === partId);
      
      if (inventoryIndex !== -1) {
        // التحقق من وجود كمية كافية في المخزون
        if (newInventory[inventoryIndex].currentStock <= 0) {
          alert(`لا يوجد رصيد كافي من القطعة: ${part.name}`);
          return;
        }
        
        // تنقيص الكمية من المخزون
        newInventory[inventoryIndex].currentStock -= 1;
        
        // تسجيل الحركة في المخزون
        const transaction = {
          date: installationDate,
          type: "تركيب",
          quantity: 1,
          notes: `تركيب في السيارة: ${selectedCar.name}`,
          balanceBefore: newInventory[inventoryIndex].currentStock + 1,
          balanceAfter: newInventory[inventoryIndex].currentStock
        };
        
        newInventory[inventoryIndex].transactions.unshift(transaction);
        
        // إضافة القطعة للسيارة
        updatedCars[carIndex].installedParts = updatedCars[carIndex].installedParts || [];
        updatedCars[carIndex].installedParts.push({
          partId: part.id,
          partName: part.name,
          installationDate,
          installationMileage: installationMileage || 0,
          notes,
          lifeMileage: part.lifeMileage,
          lifeTime: part.lifeTime
        });
      }
    });
    
    // حفظ التغييرات
    sparePartsInventory = newInventory;
    cars = updatedCars;
    localStorage.setItem("sparePartsInventory", JSON.stringify(sparePartsInventory));
    localStorage.setItem("cars", JSON.stringify(cars));
    
    // إعادة تعيين النموذج
    selectedParts = [];
    notes = "";
  }

  // معالجة إدخال أحرف اللوحة
  function handleLetterInput(e, index) {
    const value = e.target.value;
    if (/^[\u0600-\u06FF]$/.test(value)) {
      searchPlateLetters[index] = value;
      const nextInput = e.target.nextElementSibling;
      if (nextInput && nextInput.tagName === "INPUT") {
        nextInput.focus();
      }
    } else {
      e.target.value = "";
      searchPlateLetters[index] = "";
    }
  }

  // منع إدخال غير العربي في أحرف اللوحة
  function allowOnlyArabic(e) {
    const char = String.fromCharCode(e.keyCode || e.which);
    if (!/^[\u0600-\u06FF]$/.test(char)) {
      e.preventDefault();
    }
  }

  // معالجة إدخال أرقام اللوحة
  function handlePlateNumbersInput(e) {
    const value = e.target.value.replace(/\D/g, '');
    searchPlateNumbers = value;
    e.target.value = value;
  }
</script>

<Headeve/>



<div class="main-container">
  <!-- قسم البحث عن السيارات -->
  <div class="search-section">
    <h3>🔍 البحث عن سيارة</h3>
    <div class="search-fields">
      <div class="plate-letters">
        <label>أحرف اللوحة</label>
        <div class="letters-container">
          {#each [0, 1, 2] as i}
            <input 
              type="text" 
              maxlength="1" 
              bind:value={searchPlateLetters[i]}
              placeholder="حرف" 
              on:input={(e) => handleLetterInput(e, i)}
              on:keypress={(e) => allowOnlyArabic(e)}
            />
          {/each}
        </div>
      </div>
      
      <div class="plate-numbers">
        <label>أرقام اللوحة</label>
        <input 
          type="text" 
          bind:value={searchPlateNumbers}
          on:input={handlePlateNumbersInput}
          maxlength="4"
          placeholder="أربعة أرقام"
        />
      </div>
      
      <div class="traffic-number">
        <label>رقم المرور</label>
        <input type="text" bind:value={searchTrafficNumber} placeholder="رقم المرور" />
      </div>
    </div>
    
    <div class="search-results">
      <h4>النتائج:</h4>
      {#if filteredCars.length === 0}
        <p class="no-results">لا توجد سيارات مطابقة لبحثك</p>
      {:else}
        <div class="car-results">
          {#each filteredCars as car}
            <div 
              class="car-card {selectedCar?.id === car.id ? 'selected' : ''}"
              on:click={() => selectedCar = car}
            >
              <div class="car-plate">
                {(car.plate?.letters || []).join(' ') || '---'} - {car.plate?.numbers || '----'}
              </div>
              <div class="car-traffic">رقم المرور: {car.trafficNumber || '---'}</div>
              <div class="car-mileage">الكيلومترات: {car.currentMileage || 0} كم</div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
  <!-- قسم تركيب قطع الغيار -->
  <div class="parts-section">
    {#if selectedCar}
      <div class="car-header">
        <h3>تركيب قطع غيار لسيارة: {selectedCar.name}</h3>
        <div class="car-details">
          <span>اللوحة: {(selectedCar.plate?.letters || []).join('') || '---'} - {selectedCar.plate?.numbers || '----'}</span>
          <span>رقم المرور: {selectedCar.trafficNumber || '---'}</span>
          <span>الكيلومترات: {selectedCar.currentMileage || 0} كم</span>
        </div>
      </div>
      
      <!-- نموذج إضافة قطع غيار -->
      <div class="parts-form">
        <div class="form-row">
          <div class="form-group">
            <label>تاريخ التركيب:</label>
            <input type="date" bind:value={installationDate} />
          </div>
          
          <div class="form-group">
            <label>عدد الكيلومترات:</label>
            <input 
              type="number" 
              bind:value={installationMileage} 
              placeholder="عدد الكيلومترات عند التركيب"
              min="0"
            />
          </div>
        </div>
        
        <div class="form-group">
          <label>قطع الغيار المراد تركيبها:</label>
          <select bind:value={selectedParts} multiple size="5">
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
          <label>ملاحظات:</label>
          <textarea bind:value={notes} placeholder="أي ملاحظات حول التركيب..."></textarea>
        </div>
        
        <button on:click={addPartsToCar} class="save-btn">
          تسجيل التركيب وتحديث المخزون
        </button>
      </div>
      
      <!-- قائمة قطع الغيار المثبتة -->
      <div class="installed-parts">
        <h4>قطع الغيار المثبتة</h4>
        
        {#if selectedCar.installedParts?.length === 0}
          <p class="no-parts">لا توجد قطع غيار مثبتة على هذه السيارة</p>
        {:else}
          <table>
            <thead>
              <tr>
                <th>اسم القطعة</th>
                <th>تاريخ التركيب</th>
                <th>كيلومترات التركيب</th>
                <th>العمر الافتراضي</th>
                <th>ملاحظات</th>
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
        {/if}
      </div>
    {:else}
      <div class="no-car-selected">
        <p>👈 الرجاء اختيار سيارة من نتائج البحث</p>
      </div>
    {/if}
  </div>

  <!-- قسم المخزون -->
  <div class="inventory-section">
    <h3>📦 مخزون قطع الغيار</h3>
    
    <div class="inventory-list">
      {#if sparePartsInventory.length === 0}
        <p class="no-inventory">لا توجد قطع غيار في المخزون</p>
      {:else}
        <table>
          <thead>
            <tr>
              <th>اسم القطعة</th>
              <th>الكمية المتاحة</th>
              <th>آخر حركة</th>
            </tr>
          </thead>
          <tbody>
            {#each sparePartsInventory as item}
              <tr class:low-stock={item.currentStock <= 3}>
                <td>
                  {spareParts.find(p => p.id === item.partId)?.name || 'غير معروف'}
                  <div class="part-number">{item.partNumber || '--'}</div>
                </td>
                <td>{item.currentStock}</td>
                <td>
                  {#if item.transactions[0]}
                    {item.transactions[0].date} - {item.transactions[0].type}
                  {:else}
                    --
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </div>
  </div>
</div>

<style>
  /* التنسيق العام */
  :global(body) {
    font-family: 'Tajawal', sans-serif;
    margin: 0;
    padding: 0;
    background-color: #f5f7fa;
    color: #333;
    direction: rtl;
  }

  .header-service {
    background: #4361ee;
    color: white;
    padding: 1.5rem;
    text-align: right;
  }

  .header-top {
    max-width: 1200px;
    margin: 0 auto;
  }

  .header-top h2 {
    margin: 0;
    font-size: 1.8rem;
  }

  .header-top p {
    margin: 0.5rem 0 0;
    opacity: 0.9;
  }

  .main-container {
    display: grid;
    grid-template-columns: 300px 1fr 300px;
    max-width: 1200px;
    margin: 2rem auto;
    gap: 1.5rem;
    padding: 0 1rem;
  }

  /* قسم البحث عن السيارات */
  .search-section {
    background: white;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    padding: 1.5rem;
  }

  .search-section h3 {
    margin-top: 0;
    color: #4361ee;
    border-bottom: 1px solid #eee;
    padding-bottom: 0.5rem;
  }

  .search-fields {
    display: grid;
    gap: 1rem;
  }

  .plate-letters, .plate-numbers, .traffic-number {
    display: flex;
    flex-direction: column;
  }

  .plate-letters label, .plate-numbers label, .traffic-number label {
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #555;
  }

  .letters-container {
    display: flex;
    gap: 5px;
  }

  .letters-container input {
    width: 40px;
    height: 40px;
    text-align: center;
    font-size: 1.2rem;
  }

  .plate-numbers input, .traffic-number input {
    padding: 0.7rem;
    border: 1px solid #ddd;
    border-radius: 6px;
  }

  .search-results {
    margin-top: 1.5rem;
  }

  .search-results h4 {
    color: #555;
    margin-bottom: 0.5rem;
  }

  .car-results {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }

  .car-card {
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid #eee;
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

  .car-plate, .car-traffic, .car-mileage {
    font-size: 0.9rem;
    color: inherit;
  }

  .no-results {
    text-align: center;
    color: #666;
    padding: 1rem 0;
  }

  /* قسم تركيب قطع الغيار */
  .parts-section {
    background: white;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    padding: 1.5rem;
  }

  .car-header {
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #eee;
  }

  .car-header h3 {
    margin-top: 0;
    color: #4361ee;
  }

  .car-details {
    display: flex;
    gap: 1rem;
    font-size: 0.9rem;
    color: #555;
    flex-wrap: wrap;
  }

  .parts-form {
    background: #f8f9ff;
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 2rem;
  }

  .form-row {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .form-group {
    margin-bottom: 1rem;
    flex: 1;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #555;
  }

  input, select, textarea {
    width: 100%;
    padding: 0.7rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 0.9rem;
  }

  select[multiple] {
    min-height: 150px;
  }

  textarea {
    min-height: 80px;
    resize: vertical;
  }

  .hint {
    font-size: 0.8rem;
    color: #666;
    margin-top: 0.3rem;
  }

  .save-btn {
    background: #4361ee;
    color: white;
    border: none;
    padding: 0.8rem 1.5rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    transition: background 0.2s;
    width: 100%;
    margin-top: 1rem;
  }

  .save-btn:hover {
    background: #3a56d4;
  }

  /* قائمة قطع الغيار المثبتة */
  .installed-parts {
    margin-top: 2rem;
  }

  .installed-parts h4 {
    color: #555;
    margin-bottom: 1rem;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
  }

  th, td {
    padding: 0.8rem;
    text-align: right;
    border-bottom: 1px solid #eee;
  }

  th {
    background: #f5f7fa;
    font-weight: 600;
    color: #555;
  }

  tr:hover {
    background: #f9f9f9;
  }

  .no-parts, .no-car-selected {
    text-align: center;
    padding: 2rem;
    color: #666;
  }

  /* قسم المخزون */
  .inventory-section {
    background: white;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    padding: 1.5rem;
  }

  .inventory-section h3 {
    margin-top: 0;
    color: #4361ee;
    border-bottom: 1px solid #eee;
    padding-bottom: 0.5rem;
  }

  .inventory-list {
    margin-top: 1rem;
  }

  .part-number {
    font-size: 0.8rem;
    color: #666;
  }

  .low-stock {
    background-color: #fff3f3;
  }

  .low-stock td {
    color: #dc3545;
    font-weight: bold;
  }

  .no-inventory {
    text-align: center;
    color: #666;
    padding: 1rem 0;
  }

  @media (max-width: 1024px) {
    .main-container {
      grid-template-columns: 1fr;
    }
    
    .form-row {
      flex-direction: column;
      gap: 0;
    }
  }
</style>