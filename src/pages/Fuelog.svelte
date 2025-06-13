<script>
  import { onMount } from "svelte";
  import Headeve from "../header/Headeve.svelte";

  let cars = [];
  let selectedCar = null;
  let editingIndex = null;

  // متغيرات البحث
  let plateNumbers = "";
  let plateLetters=["","",""]
  let trafficNumberQuery = "";
  let searchQuery = "";

  // متغيرات نموذج البنزين
  let date = "";
  let liters = "";
  let pricePerLiter = "";
  let startOdometer = "";
  let endOdometer = "";

  const allowedLetters = ['أ', 'ب', 'ج', 'د', 'ر', 'س', 'ص', 'ط', 'ع', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي','خ','ث','ح','غ','ض','ش','ا','أ','ض','ت','ظ','ز','ة','لا','ؤ','','ء','ئ','ذ'];

  // تحميل البيانات من localStorage مع معالجة الأخطاء
  function loadCars() {
    try {
      const storedCars = localStorage.getItem("cars");
      if (storedCars) {
        cars = JSON.parse(storedCars);
        console.log("السيارات المحملة:", cars);
        
        if (!Array.isArray(cars)) {
          console.error("بيانات السيارات ليست مصفوفة!");
          cars = [];
        }
      } else {
        console.log("لا توجد بيانات في localStorage");
      }
    } catch (error) {
      console.error("خطأ في تحميل السيارات:", error);
      cars = [];
    }
  }

  onMount(() => {
    loadCars();
  });

  // فلترة السيارات مع تحسينات
$: filteredCars = cars.filter(car => {
  // تحويل أرقام اللوحة إلى سلسلة نصية بغض النظر عن نوعها
  const carNumbers = Array.isArray(car.plate?.numbers) 
    ? car.plate.numbers.join('') 
    : car.plate?.numbers?.toString() || '';
  
  const numbersMatch = plateNumbers === "" || carNumbers.includes(plateNumbers);
  
  // باقي شروط البحث...
  const lettersMatch = plateLetters.every((letter, idx) => 
      letter === "" || (car.plate?.letters?.[idx]?.includes(letter))
    );
    
    const trafficMatch = trafficNumberQuery === "" || 
      (car.trafficNumber || "").toString().includes(trafficNumberQuery);
  return numbersMatch && lettersMatch && trafficMatch;
});
  // ... باقي الشروط

    
 
 

  // فلترة سجلات البنزين
  $: filteredRecords = selectedCar?.fuelRecords?.filter(record => {
    if (!record) return false;
    return (
      record.date.includes(searchQuery) ||
      record.liters.toString().includes(searchQuery) ||
      record.pricePerLiter.toString().includes(searchQuery) ||
      record.startOdometer.toString().includes(searchQuery) ||
      record.endOdometer.toString().includes(searchQuery)
    );
  }) || [];

  function selectCar(car) {
    selectedCar = car;
    resetForm();
  }

  function resetForm() {
    date = liters = pricePerLiter = startOdometer = endOdometer = "";
    editingIndex = null;
  }

  function addOrUpdateRecord() {
    if (!selectedCar) return;
    
    const newRecord = {
      date,
      liters: parseFloat(liters),
      pricePerLiter: parseFloat(pricePerLiter),
      startOdometer: parseFloat(startOdometer),
      endOdometer: parseFloat(endOdometer),
      distance: parseFloat(endOdometer) - parseFloat(startOdometer)
    };

    selectedCar.fuelRecords = selectedCar.fuelRecords || [];
    
    if (editingIndex !== null) {
      selectedCar.fuelRecords[editingIndex] = newRecord;
    } else {
      selectedCar.fuelRecords.push(newRecord);
    }

    updateLocalStorage();
    resetForm();
  }

  function editRecord(index) {
    if (!selectedCar?.fuelRecords?.[index]) return;
    const record = selectedCar.fuelRecords[index];
    date = record.date;
    liters = record.liters.toString();
    pricePerLiter = record.pricePerLiter.toString();
    startOdometer = record.startOdometer.toString();
    endOdometer = record.endOdometer.toString();
    editingIndex = index;
  }

  function deleteRecord(index) {
    if (confirm("هل تريد حذف هذا السجل؟") && selectedCar?.fuelRecords) {
      selectedCar.fuelRecords.splice(index, 1);
      updateLocalStorage();
    }
  }

  function updateLocalStorage() {
    try {
      localStorage.setItem("cars", JSON.stringify(cars));
    } catch (error) {
      console.error("خطأ في حفظ البيانات:", error);
    }
  }

  function handleLetterInput(e, index) {
    const value = e.target.value;
    if (allowedLetters.includes(value)) {
      plateLetters[index] = value;
      const nextInput = e.target.nextElementSibling;
      if (nextInput?.tagName === "INPUT") nextInput.focus();
    } else {
      plateLetters[index] = "";
      e.target.value = "";
    }
  }

  function allowOnlyArabic(e) {
    if (!/^[\u0600-\u06FF]$/.test(e.key)) e.preventDefault();
  }
</script>

<Headeve />

<div class="container">
  <div class="car-list">
    <h2>🚗 قائمة السيارات ({cars.length})</h2>
    
    <div class="search-section">
      <h3>🔍 بحث متقدم:</h3>
       <div class="search-car">
        <div class="search-row">
          <label>🔠 حروف اللوحة:</label>
          <div class="plate-inputs">
            {#each plateLetters as letter, i}
              <input
                type="text"
                maxlength="1"
                bind:value={plateLetters[i]}
                on:input={(e) => handleLetterInput(e, i)}
                on:keypress={allowOnlyArabic}
                id={`letter-${i}`}
                class="plate-input"
                placeholder="حرف"
              />
            {/each}
          </div>
        </div>
        
        <div class="search-row">
          <label>🔢 أرقام اللوحة:</label>
          <input
            type="text"
            bind:value={plateNumbers}
            maxlength="4"
            placeholder="أرقام اللوحة"
            class="plate-input-single"
          />
        </div> 
       </div>
      
     
      
      <div class="search-row">
        <label>🚔 رقم المرور:</label>
        <input 
          type="text" 
          bind:value={trafficNumberQuery} 
          placeholder="ابحث برقم المرور"
          class="traffic-input"
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
            <!-- <h3>{car.name || 'بدون اسم'}</h3> -->
<!-- في جزء عرض اللوحة المعدل -->
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
  <div class="fuel-records">
    {#if selectedCar}
      <h2>⛽ سجلات البنزين لـ {selectedCar.name}</h2>
      
      <div class="record-form">
        <h3>{editingIndex !== null ? '✏️ تعديل السجل' : '➕ إضافة سجل جديد'}</h3>
        <form on:submit|preventDefault={addOrUpdateRecord}>
          <div class="form-group">
            <label>📅 التاريخ:</label>
            <input type="date" bind:value={date} required />
          </div>
          
          <div class="form-group">
            <label>⛽ الكمية (لتر):</label>
            <input type="number" step="0.1" bind:value={liters} placeholder="كمية البنزين" required />
          </div>
          
          <div class="form-group">
            <label>💰 السعر (للتر):</label>
            <input type="number" step="0.01" bind:value={pricePerLiter} placeholder="السعر لكل لتر" required />
          </div>
          
          <div class="form-group">
            <label>🔢 عداد البداية:</label>
            <input type="number" bind:value={startOdometer} placeholder="قراءة العداد" required />
          </div>
          
          <div class="form-group">
            <label>🔢 عداد النهاية:</label>
            <input type="number" bind:value={endOdometer} placeholder="قراءة العداد" required />
          </div>
          
          <div class="form-actions">
            <button type="submit" class="save-btn">
              {editingIndex !== null ? '💾 حفظ التعديلات' : '➕ إضافة السجل'}
            </button>
            {#if editingIndex !== null}
              <button type="button" on:click={resetForm} class="cancel-btn">إلغاء</button>
            {/if}
          </div>
        </form>
      </div>
      
      <div class="records-list">
        <h3>📋 السجلات المسجلة ({filteredRecords.length})</h3>
        
        <div class="search-records">
          <input 
            type="text" 
            bind:value={searchQuery} 
            placeholder="ابحث في السجلات..." 
            class="search-input"
          />
        </div>
        
        {#if filteredRecords.length > 0}
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
              {#each filteredRecords as record, i}
                <tr>
                  <td>{record.date}</td>
                  <td>{record.liters} لتر</td>
                  <td>{record.pricePerLiter} ج.م</td>
                  <td>{record.startOdometer}</td>
                  <td>{record.endOdometer}</td>
                  <td>{record.distance} كم</td>
                  <td class="actions">
                    <button on:click={() => editRecord(i)} class="edit-btn">تعديل</button>
                    <button on:click={() => deleteRecord(i)} class="delete-btn">حذف</button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        {:else if selectedCar.fuelRecords?.length > 0}
          <p class="no-results">⚠️ لا توجد سجلات مطابقة لبحثك</p>
        {:else}
          <p class="no-records">لا توجد سجلات بنزين مسجلة</p>
        {/if}
      </div>
    {:else}
      <div class="no-car-selected">
        <h3>👈 الرجاء اختيار سيارة من القائمة</h3>
        <p>اختر سيارة من القائمة على اليسار لعرض وإدارة سجلات البنزين الخاصة بها</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .container {
    display: flex;
    gap: 20px;
    padding: 20px;
    max-width: 1400px;
    margin: 0 auto;
    font-family: Arial, sans-serif;
  }
  
  .car-list, .fuel-records {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  }
  
  .car-list {
    flex: 2;
    min-width: 300px;
  }
  
  .fuel-records {
    flex: 2;
    min-width: 500px;
  }
  .search-car{
    display: flex;
    flex-direction: row;
    gap:17px;
  }
  .search-section {
    background: #e9ecef;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
  }
  
  .search-row {
    margin-bottom: 15px;
    display: flex
;
    flex-direction: row;
    align-items: center;
  }
  
  .search-row label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }
  
  .plate-inputs {
    display: flex;
    gap: 5px;
  }
  
  .plate-input {
    width: 40px;
    height: 40px;
    text-align: center;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 16px;
  }
  
  .traffic-input, .search-input , .plate-input-single{
    width: 59%;
    padding: 8px;
    border: 1px solid #ced4da;
    border-radius: 4px;
  }
  
  .results {
    max-height: 600px;
    overflow-y: auto;
  }
  
  .car-card {
    background: white;
    padding: 15px;
    margin-bottom: 10px;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    border-left: 4px solid #007bff;
  }
  
  .car-card.selected {
    border-left: 4px solid #28a745;
    background: #f1f8ff;
  }
  
  .car-card h3 {
    margin: 0 0 5px 0;
    color: #333;
  }
  
  .car-card p {
    margin: 5px 0;
    color: #666;
    font-size: 14px;
  }
  
  .car-card button {
    margin-top: 10px;
    padding: 8px 12px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  }
  
  .car-card.selected button {
    background: #28a745;
  }
  
  .no-results, .no-records {
    text-align: center;
    padding: 20px;
    color: #6c757d;
  }
  
  .record-form {
    background: #f8f9fa;
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
    font-weight: bold;
  }
  
  .form-group input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ced4da;
    border-radius: 4px;
  }
  
  .form-actions {
    display: flex;
    gap: 10px;
    margin-top: 15px;
  }
  
  .save-btn {
    background: #28a745;
    color: white;
    padding: 10px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .cancel-btn {
    background: #dc3545;
    color: white;
    padding: 10px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 15px;
  }
  
  th, td {
    padding: 12px;
    text-align: center;
    border: 1px solid #dee2e6;
  }
  
  th {
    background-color: #343a40;
    color: white;
  }
  
  tr:nth-child(even) {
    background-color: #f8f9fa;
  }
  
  .actions {
    display: flex;
    gap: 5px;
    justify-content: center;
  }
  
  .edit-btn {
    background: #ffc107;
    color: #212529;
    padding: 5px 10px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .delete-btn {
    background: #dc3545;
    color: white;
    padding: 5px 10px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .no-car-selected {
    text-align: center;
    padding: 50px 20px;
    color: #6c757d;
  }
 
</style>