<script>
  import { onMount } from "svelte";
  import Headeve from "../header/Headeve.svelte";
  import Main from "../header/Main.svelte";

  // Car fields
  let Km = '', make = '', vin = '', vehicle = '', color = '', type = '', model = '', brand = '', engineNumber = '';
  let plateNumbers = '';
  let plateLetters = ['', '', ''];
  let licenseDate = '';
  let trafficNumber = '';
  let engineerName = '', transmission = '', engineSize = '';
  let imageUrl = '';
  
  let chassisNumber = '';
  let manufactureYear = '';
  let carType = ''; // ملاكي، بيك اب، كساحة، نش
  let fuelType = ''; // بنزين، ديزل، كهرباء، غاز

  let showBrandInput = false;
  let showModelInput = false;
  let newBrandName = '';
  let newBrandModels = '';
  let newModelName = '';

  // Allowed Arabic letters for plate
  const allowedLetters = ['أ', 'ب', 'ج', 'د', 'ر', 'س', 'ص', 'ط', 'ع', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي','خ','ث','ح','غ','ض','ش','ا','أ','ض','ت','ظ','ز','ة','لا','ؤ','','ء','ئ','ذ'];

  // Data arrays
  let cars = [];
  let carBrands = [];
  let openDetails = null;
  let searchPlateNumbers = '';
  let searchPlateLetters = ['','', ''];
  let searchTrafficNumber = '';
  let editId = null;
  let errors = {};

  // Maintenance Request
  let showMaintenanceForm = false;
  let selectedCarForMaintenance = null;
  let maintenanceIssues = '';
  let maintenancePriority = 'medium'; // low, medium, high
  let maintenanceNotes = '';

  // قوائم الاختيارات
  const carTypes = ['ملاكي', 'بيك اب', 'كساحة', 'نش'];
  const fuelTypes = ['بنزين', 'ديزل', 'كهرباء', 'غاز'];
  const colors = ['أبيض', 'أسود', 'فضي', 'رمادي', 'أحمر', 'أزرق', 'أخضر', 'أصفر', 'بني', 'ذهبي', 'برتقالي', 'وردي'];

  // Default car brands data                
  const defaultCarBrands = [
    {id: 1, name: "تويوتا", models: ["كورولا", "كامري", "ياريس", "راف فور", "لاند كروزر", "هايلكس"]},
    {id: 2, name: "مرسيدس بنز", models: ["الفئة C", "الفئة E", "الفئة S", "GLC", "GLE", "G-Class"]},
    {id: 3, name: "بي إم دبليو", models: ["السلسلة 3", "السلسلة 5", "السلسلة 7", "X3", "X5", "X7"]},
    {id: 4, name: "هيونداي", models: ["اكسنت", "النترا", "سوناتا", "توسان", "سانتا فيه", "كريتا"]},
    {id: 5, name: "كيا", models: ["بيكانتو", "سيراتو", "أوبتيما", "سبورتاج", "سورينتو", "سيلتوس"]}
  ];

  function formatPlateNumbers(numbers) {
    if (numbers?.length === 4) {
      return `${numbers.slice(0, 2)}-${numbers.slice(2, 4)}`;
    }
    return numbers || '';
  }

  function validateCar() {
    errors = {};
    let isValid = true;

    if (!Km || isNaN(Km)) {
      errors.Km = 'المسافة يجب أن تكون رقماً';
      isValid = false;
    } else if (Km < 0) {
      errors.Km = 'المسافة يجب أن تكون رقمًا موجبًا';
      isValid = false;
    }

    if (!type.trim()) {
      errors.type = 'الفئة مطلوبة';
      isValid = false;
    }
    if (!brand) {
      errors.brand = 'العلامة التجارية مطلوبة';
      isValid = false;
    }
    if (!model) {
      errors.model = 'الطراز مطلوب';
      isValid = false;
    }
    if (!licenseDate) {
      errors.licenseDate = 'تاريخ الترخيص مطلوب';
      isValid = false;
    }
    if (!plateNumbers || !/^\d{4}$/.test(plateNumbers)) {
      errors.plateNumbers = 'أرقام اللوحة يجب أن تكون 4 أرقام بالضبط';
      isValid = false;
    } else {
      const existingCar = cars.find(c => c.plate?.numbers === plateNumbers && c.id !== editId);
      if (existingCar) {
        errors.plateNumbers = 'رقم اللوحة موجود بالفعل';
        isValid = false;
      }
    }
    if (!plateLetters.every(l => l && allowedLetters.includes(l))) {
      errors.plateLetters = 'يجب استخدام أحرف عربية مسموح بها فقط';
      isValid = false;
    }
    
    if (chassisNumber && !/^[A-HJ-NPR-Z0-9]{17}$/.test(chassisNumber)) {
      errors.chassisNumber = 'رقم الشاسيه يجب أن يكون 17 رمزًا (أحرف وأرقام)';
      isValid = false;
    }

    if (manufactureYear && (isNaN(manufactureYear) || manufactureYear < 1900 || manufactureYear > new Date().getFullYear() + 1)) {
      errors.manufactureYear = 'سنة الصنع غير صالحة';
      isValid = false;
    }

    return isValid;
  }

  function saveCar() {
    if (validateCar()) {
      const carData = {
        id: editId || Date.now(),
        Km: parseInt(Km),
        make, 
        model, 
        vin, 
        vehicle, 
        color, 
        type, 
        engineNumber,
        plate: { 
          numbers: plateNumbers, 
          letters: plateLetters 
        },
        licenseDate, 
        trafficNumber, 
        imageUrl,
        mechanic: { 
          engineerName, 
          transmission, 
          engineSize 
        },
        brand,
        chassisNumber,
        manufactureYear,
        carType,
        fuelType
      };

      if (editId) {
        cars = cars.map(c => c.id === editId ? carData : c);
      } else {
        cars = [...cars, carData];
      }

      localStorage.setItem('cars', JSON.stringify(cars));
      resetForm();
      alert('تم حفظ البيانات بنجاح');
    } else {
      console.error('Validation errors:', errors);
      alert('يوجد أخطاء في النموذج، يرجى مراجعة الحقول المميزة');
    }
  }

  function editCar(car) {
    editId = car.id;
    Km = car.Km;
    make = car.make;
    model = car.model;
    brand = car.brand || '';
    vin = car.vin;
    vehicle = car.vehicle;
    color = car.color;
    type = car.type;
    engineNumber = car.engineNumber;
    plateNumbers = car.plate?.numbers || '';
    plateLetters = car.plate?.letters?.length === 3 ? car.plate.letters : ['', '', ''];
    licenseDate = car.licenseDate;
    trafficNumber = car.trafficNumber || '';
    imageUrl = car.imageUrl;
    engineerName = car.mechanic?.engineerName || '';
    transmission = car.mechanic?.transmission || '';
    engineSize = car.mechanic?.engineSize || '';
    chassisNumber = car.chassisNumber || '';
    manufactureYear = car.manufactureYear || '';
    carType = car.carType || '';
    fuelType = car.fuelType || '';
    errors = {};
  }

  function resetForm() {
    Km = '';
    make = '';
    model = '';
    brand = '';
    vin = '';
    vehicle = '';
    color = '';
    type = '';
    engineNumber = '';
    plateNumbers = '';
    plateLetters = ['', '', ''];
    licenseDate = '';
    trafficNumber = '';
    imageUrl = '';
    engineerName = '';
    transmission = '';
    engineSize = '';
    chassisNumber = '';
    manufactureYear = '';
    carType = '';
    fuelType = '';
    editId = null;
    errors = {};
  }

  function deleteCar(id) {
    if (confirm('هل أنت متأكد من حذف هذه السيارة؟')) {
      cars = cars.filter(car => car.id !== id);
      localStorage.setItem('cars', JSON.stringify(cars));
      alert('تم حذف السيارة بنجاح');
    }
  }

  function toggleDetails(id) {
    openDetails = openDetails === id ? null : id;
  }

  function handlePlateLetterInput(arr, i, event) {
    const val = event.target.value;
    if (allowedLetters.includes(val)) {
      arr[i] = val;
      if (val && event.target.nextElementSibling) {
        event.target.nextElementSibling.focus();
      }
    } else {
      arr[i] = '';
      event.target.value = '';
    }
  }

  function handlePlateNumbersInput(event) {
    const val = event.target.value;
    if (/^\d{0,4}$/.test(val)) {
      plateNumbers = val;
    } else {
      event.target.value = plateNumbers;
    }
  }

  function handleSearchNumberInput(e) {
    const val = e.target.value;
    if (/^\d{0,4}$/.test(val)) {
      searchPlateNumbers = val;
      if (val.length === 4 && e.target.nextElementSibling) {
        e.target.nextElementSibling.focus();
      }
    } else {
      e.target.value = searchPlateNumbers;
    }
  }

  function handleSearchLetterInput(arr, i, e) {
    const val = e.target.value;
    if (allowedLetters.includes(val)) {
      arr[i] = val;
      if (val && e.target.nextElementSibling) {
        e.target.nextElementSibling.focus();
      }
    } else {
      arr[i] = '';
      e.target.value = '';
    }
  }

  function allowOnlyArabic(e) {
    const char = e.key;
    if (!/^[\u0600-\u06FF]$/.test(char)) {
      e.preventDefault();
    }
  }

  function addNewModel() {
    if (newModelName && brand) {
      const brandIndex = carBrands.findIndex(b => b.name === brand);
      if (brandIndex !== -1) {
        carBrands = [
          ...carBrands.slice(0, brandIndex),
          {
            ...carBrands[brandIndex],
            models: [...carBrands[brandIndex].models, newModelName]
          },
          ...carBrands.slice(brandIndex + 1)
        ];
        
        localStorage.setItem('carBrands', JSON.stringify(carBrands));
        newModelName = '';
        showModelInput = false;
        model = newModelName;
      }
    }
  }

  function addNewBrand() {
    if (newBrandName) {
      const modelsArray = newBrandModels.split(',').map(m => m.trim()).filter(m => m);
      carBrands = [...carBrands, {
        id: Math.max(...carBrands.map(b => b.id), 0) + 1,
        name: newBrandName,
        models: modelsArray
      }];
      
      localStorage.setItem('carBrands', JSON.stringify(carBrands));
      brand = newBrandName;
      newBrandName = '';
      newBrandModels = '';
    }
  }

  function sendToMaintenance(car) {
    selectedCarForMaintenance = car;
    showMaintenanceForm = true;
  }

  // function submitMaintenanceRequest() {
  //   if (!maintenanceIssues) {
  //     alert('يرجى إدخال وصف للأعطال');
  //     return;
  //   }

  //   const maintenanceRequest = {
  //     carId: selectedCarForMaintenance.id,
  //     plate: selectedCarForMaintenance.plate,
  //     carModel: `${selectedCarForMaintenance.brand} ${selectedCarForMaintenance.model}`,
  //     date: new Date().toISOString(),
  //     issues: maintenanceIssues,
  //     priority: maintenancePriority,
  //     notes: maintenanceNotes,
  //     status: 'pending'
  //   };

  //   // Save to localStorage
  //   const existingRequests = JSON.parse(localStorage.getItem('maintenanceRequests') || '[]');
  //   existingRequests.push(maintenanceRequest);
  //   localStorage.setItem('maintenanceRequests', JSON.stringify(existingRequests));

  //   alert('تم إرسال طلب الصيانة بنجاح');
  //   resetMaintenanceForm();
  // }
//   function submitMaintenanceRequest() {
//   if (!maintenanceIssues) {
//     alert('يرجى إدخال وصف للأعطال');
//     return;
//   }

//   const maintenanceRequest = {
//     id: Date.now(), // نضيف معرف فريد للطلب
//     carId: selectedCarForMaintenance.id,
//     plate: selectedCarForMaintenance.plate,
//     carModel: `${selectedCarForMaintenance.brand} ${selectedCarForMaintenance.model}`,
//     date: new Date().toISOString(),
//     issues: maintenanceIssues,
//     priority: maintenancePriority,
//     notes: maintenanceNotes,
//     status: 'pending',
//     parts: [] // نضيف مصفوفة قطع الغيار
//   };

//   // Save to localStorage
//   const existingRequests = JSON.parse(localStorage.getItem('maintenanceRequests') || '[]');
//   existingRequests.push(maintenanceRequest);
//   localStorage.setItem('maintenanceRequests', JSON.stringify(existingRequests));

//   alert('تم إرسال طلب الصيانة بنجاح');
//   resetMaintenanceForm();
// }
function submitMaintenanceRequest() {
  if (!maintenanceIssues) {
    alert('يرجى إدخال وصف للأعطال');
    return;
  }

  const maintenanceRequest = {
    id: Date.now(), // معرف فريد للطلب
    carId: selectedCarForMaintenance.id,
    plate: selectedCarForMaintenance.plate,
    carModel: `${selectedCarForMaintenance.brand} ${selectedCarForMaintenance.model}`,
    date: new Date().toISOString(),
    issues: maintenanceIssues,
    priority: maintenancePriority,
    notes: maintenanceNotes,
    status: 'pending', // الحالة الابتدائية
    parts: [], // سيتم ملؤها لاحقاً
    history: [{
      action: 'created',
      date: new Date().toISOString(),
      by: 'النظام'
    }]
  };

  // الحفظ في localStorage
  const existingRequests = JSON.parse(localStorage.getItem('maintenanceRequests')) || [];
  existingRequests.push(maintenanceRequest);
  localStorage.setItem('maintenanceRequests', JSON.stringify(existingRequests));

  alert('تم إرسال طلب الصيانة بنجاح');
  resetMaintenanceForm();
}


  
 
  
  
  function resetMaintenanceForm() {
    maintenanceIssues = '';
    maintenancePriority = 'medium';
    maintenanceNotes = '';
    selectedCarForMaintenance = null;
    showMaintenanceForm = false;
  }

  $: filteredCars = cars.filter(car => {
    const numberMatch = car.plate?.numbers?.includes(searchPlateNumbers) || !searchPlateNumbers;
    const letterMatch = searchPlateLetters.every((l, i) => !l || car.plate?.letters[i] === l);
    const trafficMatch = car.trafficNumber?.includes(searchTrafficNumber) || !searchTrafficNumber;
    return numberMatch && letterMatch && trafficMatch;
  });

  $: availableModels = carBrands.find(b => b.name === brand)?.models || [];

  onMount(() => {
    const storedCars = localStorage.getItem('cars');
    if (storedCars) {
      cars = JSON.parse(storedCars);
    }

    const storedBrands = localStorage.getItem('carBrands');
    if (storedBrands) {
      carBrands = JSON.parse(storedBrands);
    } else {
      carBrands = [...defaultCarBrands];
      localStorage.setItem('carBrands', JSON.stringify(carBrands));
    }
  });
</script>

<Headeve />

<div class="container">
  <!-- Form Section -->
  <div class="form">
    <h3>🚗 {editId ? 'تعديل سيارة' : 'إضافة سيارة جديدة'}</h3>
    
    <div class="form-start">
      <!-- Plate Letters -->
      <div class="plate-input-group">
        <label>حروف اللوحة</label>
        <div class="letter-inputs">
          {#each plateLetters as letter, i}
            <input
              type="text"
              maxlength="1"
              bind:value={plateLetters[i]}
              on:input={(e) => handlePlateLetterInput(plateLetters, i, e)}
              on:keypress={allowOnlyArabic}
              placeholder="أ"
              class="letter-input"
              class:error={errors.plateLetters}
              dir="rtl"
              lang="ar"
            />
          {/each}
        </div>
        {#if errors.plateLetters}<span class="error-msg">{errors.plateLetters}</span>{/if}
      </div>
      
      <!-- Plate Numbers -->
      <div class="plate-input-group">
        <label class="lab">أرقام اللوحة</label>
        <input
          type="text"
          maxlength="4"
          placeholder="1234"
          bind:value={plateNumbers}
          on:input={handlePlateNumbersInput}
          class="plate-number-input"
          class:error={errors.plateNumbers}
          inputmode="numeric"
        />
        {#if errors.plateNumbers}<span class="error-msg">{errors.plateNumbers}</span>{/if}
      </div>
    </div>

    <!-- Two Columns Form -->
    <div class="form-columns">
      <!-- First Column -->
      <div class="form-col">
        <!-- Brand -->
        <div class="input-field">
          <label>الماركه</label>
          <div class="brand-select-container">
            <select bind:value={brand} class:error={errors.brand}>
              <option value="">اختر الماركه </option>
              {#each carBrands as brandItem}
                <option value={brandItem.name}>{brandItem.name}</option>
              {/each}
            </select>
            <button class="add-button" on:click={() => showBrandInput = true}>الماركه</button>
          </div>
          {#if errors.brand}<span class="error-msg">{errors.brand}</span>{/if}
        </div>
        
        <!-- Model -->
        <div class="input-field">
          <label>الطراز</label>
          <div class="model-select-container">
            <select bind:value={model} class:error={errors.model} disabled={!brand}>
              <option value="">اختر الطراز</option>
              {#each availableModels as m}
                <option value={m}>{m}</option>
              {/each}
            </select>
            {#if brand}
              <button class="add-model-btn" on:click={() => showModelInput = true}>+ إضافة طراز</button>
            {/if}
          </div> 
          {#if errors.model}<span class="error-msg">{errors.model}</span>{/if}
        </div>
        
        <!-- Mileage -->
        <div class="input-field">
          <label>المسافة المقطوعة (كم)</label>
          <input type="number" bind:value={Km} placeholder="أدخل المسافة" class:error={errors.Km} />
          {#if errors.Km}<span class="error-msg">{errors.Km}</span>{/if}
        </div>
        
        <!-- Vehicle Type -->
        <div class="input-field">
          <label>نوع السيارة</label>
          <select bind:value={carType}>
            <option value="">اختر نوع السيارة</option>
            {#each carTypes as type}
              <option value={type}>{type}</option>
            {/each}
          </select>
        </div>
        
        <!-- Chassis Number -->
        <div class="input-field">
          <label>رقم الشاسيه (VIN)</label>
          <input 
            bind:value={chassisNumber} 
            placeholder="أدخل رقم الشاسيه (17 رمز)" 
            maxlength="17"
            class:error={errors.chassisNumber}
          />
          {#if errors.chassisNumber}<span class="error-msg">{errors.chassisNumber}</span>{/if}
        </div>
      </div>
      
      <!-- Second Column -->
      <div class="form-col">
        <!-- Color -->
        <div class="input-field">
          <label>لون السيارة</label>
          <select bind:value={color}>
            <option value="">اختر اللون</option>
            {#each colors as c}
              <option value={c}>{c}</option>
            {/each}
          </select>
        </div>
        
        <!-- Category -->
        <div class="input-field">
          <label>الفئة</label>
          <input bind:value={type} placeholder="أدخل الفئة" class:error={errors.type} />
          {#if errors.type}<span class="error-msg">{errors.type}</span>{/if}
        </div>
        
        <!-- Manufacture Year -->
        <div class="input-field">
          <label>سنة الصنع</label>
          <input 
            type="number" 
            bind:value={manufactureYear} 
            placeholder="أدخل سنة الصنع"
            min="1900"
            max={new Date().getFullYear() + 1}
            class:error={errors.manufactureYear}
          />
          {#if errors.manufactureYear}<span class="error-msg">{errors.manufactureYear}</span>{/if}
        </div>
        
        <!-- Traffic Number -->
        <div class="input-field">
          <label>رقم المرور</label>
          <input bind:value={trafficNumber} placeholder="أدخل رقم المرور" />
        </div>
        
        <!-- Fuel Type -->
        <div class="input-field">
          <label>نوع الوقود</label>
          <select bind:value={fuelType}>
            <option value="">اختر نوع الوقود</option>
            {#each fuelTypes as fuel}
              <option value={fuel}>{fuel}</option>
            {/each}
          </select>
        </div>
      </div>
    </div>
    
    <!-- License Date -->
    <div class="input-field">
      <label>تاريخ الترخيص</label>
      <input type="date" bind:value={licenseDate} class:error={errors.licenseDate} />
      {#if errors.licenseDate}<span class="error-msg">{errors.licenseDate}</span>{/if}
    </div>

    <!-- Submit Button -->
    <div class="form-actions">
      <button class="submit-btn" on:click={saveCar}>
        {editId ? 'تحديث السيارة' : 'حفظ البيانات'}
      </button>
      {#if editId}
        <button class="cancel-btn" on:click={resetForm}>إلغاء</button>
      {/if}
    </div>
  </div>

  <!-- Cars Table -->
  <div class="B-table">
    <h3>📋 قائمة السيارات ({filteredCars.length})</h3>
    
    <!-- Search Bar -->
    <div class="search-bar">
      <div class="plate-inputs form-letter"> 
        {#each searchPlateLetters as l, i}
          <input
            type="text"
            maxlength="1"
            bind:value={searchPlateLetters[i]}
            on:input={(e) => handleSearchLetterInput(searchPlateLetters, i, e)}
            on:keypress={allowOnlyArabic}
            placeholder="حرف {i + 1}"
            class="search-letter"
            dir="rtl"
            lang="ar"
          />
        {/each}
      </div>
      <input 
        type="text" 
        bind:value={searchPlateNumbers} 
        on:input={handleSearchNumberInput}
        placeholder="ابحث برقم اللوحة (4 أرقام)" 
        class="search-input"
        inputmode="numeric"
      />
      
      <input 
        type="text" 
        bind:value={searchTrafficNumber} 
        placeholder="ابحث برقم المرور" 
        class="search-input"
      />
    </div>
    
    <!-- Table -->
    <div class="table-wrapper">
      {#if filteredCars.length === 0}
        <p class="no-results">🚫 لا توجد سيارات مطابقة</p>
      {:else}
        <table>
          <thead>
            <tr>
              <th>🔢 اللوحة</th>
              <th>🏷️ الموديل</th>
              <th>📍 المسافة</th>
              <th>🎨 اللون</th>
              <th>أدوات</th>
            </tr>
          </thead>
          <tbody>
            {#each filteredCars as car (car.id)}
              <tr class:selected={openDetails === car.id}>
                <td>{formatPlateNumbers(car.plate?.numbers)} {car.plate?.letters?.join(' ')}</td>
                <td>{car.brand} {car.model}</td>
                <td>{car.Km} كم</td>
                <td>{car.color}</td>
                <td class="actions">
                  <button class="action-btn" on:click={() => toggleDetails(car.id)}>
                    {openDetails === car.id ? 'إخفاء' : 'تفاصيل'}
                  </button>
                  <button class="action-btn edit" on:click={() => editCar(car)}>✏️ تعديل</button>
                  <button class="action-btn delete" on:click={() => deleteCar(car.id)}>🗑️ حذف</button>
                  <button class="action-btn maintenance" on:click={() => sendToMaintenance(car)}>🔧 صيانة</button>
                </td>
              </tr>
              
              {#if openDetails === car.id}
                <tr class="details">
                  <td colspan="5">
                    <div class="details-content">
                      {#if car.imageUrl}
                        <img src={car.imageUrl} alt="صورة السيارة" class="car-image" />
                      {/if}
                      <div class="details-text">
                        <p><strong>🏷️ العلامة:</strong> {car.brand}</p>
                        <p><strong>🚗 الطراز:</strong> {car.model}</p>
                        <p><strong>🎨 اللون:</strong> {car.color}</p>
                        <p><strong>📍 المسافة:</strong> {car.Km} كم</p>
                        <p><strong>🔖 اللوحة:</strong> {formatPlateNumbers(car.plate?.numbers)} {car.plate?.letters?.join('')}</p>
                        <p><strong>🚙 نوع السيارة:</strong> {car.carType}</p>
                        <p><strong>⛽ نوع الوقود:</strong> {car.fuelType}</p>
                        {#if car.chassisNumber}
                          <p><strong>🔢 رقم الشاسيه:</strong> {car.chassisNumber}</p>
                        {/if}
                        {#if car.manufactureYear}
                          <p><strong>📅 سنة الصنع:</strong> {car.manufactureYear}</p>
                        {/if}
                        {#if car.trafficNumber}
                          <p><strong>🚓 رقم المرور:</strong> {car.trafficNumber}</p>
                        {/if}
                      </div>
                    </div>
                  </td>
                </tr>
              {/if}
            {/each}
          </tbody>
        </table>
      {/if}
    </div>
  </div>
</div>

<!-- Brand Management Modal -->
{#if showBrandInput}
  <div class="brand-modal">
    <div class="modal-content">
      <h3>إدارة العلامات التجارية</h3>
      
      <div class="modal-section">
        <h4>إضافة علامة تجارية جديدة</h4>
        <input bind:value={newBrandName} placeholder="اسم العلامة التجارية الجديدة" />
        <input bind:value={newBrandModels} placeholder="طرازات العلامة (مفصولة بفواصل)" />
        <button class="modal-btn" on:click={addNewBrand}>حفظ العلامة الجديدة</button>
      </div>
      
      {#if brand}
        <div class="modal-section">
          <h4>إضافة طراز لـ {brand}</h4>
          <input bind:value={newModelName} placeholder="اسم الطراز الجديد" />
          <button class="modal-btn" on:click={addNewModel}>إضافة الطراز</button>
        </div>
      {/if}
      
      <button class="modal-close" on:click={() => showBrandInput = false}>إغلاق</button>
    </div>
  </div>
{/if}

<!-- Add Model Modal -->
{#if showModelInput}
  <div class="model-modal">
    <div class="modal-content">
      <h3>إضافة طراز جديد لـ {brand}</h3>
      <input bind:value={newModelName} placeholder="اسم الطراز الجديد" />
      <div class="modal-buttons">
        <button class="modal-btn" on:click={addNewModel}>حفظ</button>
        <button class="modal-btn cancel" on:click={() => showModelInput = false}>إلغاء</button>
      </div>
    </div>
  </div>
{/if}

<!-- Maintenance Request Modal -->
{#if showMaintenanceForm && selectedCarForMaintenance}
  <div class="maintenance-modal">
    <div class="modal-content">
      <h3>إرسال طلب صيانة للسيارة: {selectedCarForMaintenance.brand} {selectedCarForMaintenance.model}</h3>
      <p>اللوحة: {formatPlateNumbers(selectedCarForMaintenance.plate?.numbers)} {selectedCarForMaintenance.plate?.letters?.join('')}</p>
      
      <div class="input-field">
        <label>وصف الأعطال</label>
        <textarea bind:value={maintenanceIssues} placeholder="وصف مفصل للأعطال..." rows="4"></textarea>
      </div>
      
      <div class="input-field">
        <label>أولوية الصيانة</label>
        <select bind:value={maintenancePriority}>
          <option value="low">منخفضة</option>
          <option value="medium">متوسطة</option>
          <option value="high">عاجلة</option>
        </select>
      </div>
      
      <div class="input-field">
        <label>ملاحظات إضافية</label>
        <textarea bind:value={maintenanceNotes} placeholder="أي ملاحظات إضافية..." rows="3"></textarea>
      </div>
      
      <div class="modal-buttons">
        <button class="modal-btn" on:click={submitMaintenanceRequest}>إرسال الطلب</button>
        <button class="modal-btn cancel" on:click={resetMaintenanceForm}>إلغاء</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .container {
    display: flex;
    gap: 20px;
    padding: 15px;
    max-width: 100%;
    overflow-x: auto;
  }

  .form {
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    background: #ebebebf7;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: -3px -8px 2px rgba(0, 0, 0, 0.1);
    flex: 0 0 39%;
  }

  .form-start {
    display: flex;
    gap: 5rem;
    margin-bottom: 1rem;
    margin-right: 17px;
  }

  .plate-input-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .form-letter {
    display: flex;
    gap: 4px;
  }
  
  .lab {
    margin-right: -105px;
  }
  
  .letter-inputs {
    display: flex;
    gap: 0.5rem;
  }

  .letter-input, .search-letter {
    width: 2.5rem;
    text-align: center;
    font-family: Arial, sans-serif;
    font-size: 1.2em;
    direction: rtl;
  }

  .plate-number-input, .search-input {
    width: 30%;
  }

  .form-columns {
    display: flex;
    gap: 2rem;
  }

  .form-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .input-field {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  input, select, textarea {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
  }

  textarea {
    resize: vertical;
    min-height: 80px;
  }

  .error-msg {
    color: red;
    font-size: 0.8rem;
  }

  .error {
    border-color: red;
  }

  .submit-btn {
    margin-top: 1rem;
    padding: 0.7rem 1.5rem;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .cancel-btn {
    margin-top: 1rem;
    padding: 0.7rem 1.5rem;
    background: #f44336;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-left: 1rem;
  }

  .B-table {
    background: #ECECEC;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: -6px -6px 4px rgba(0, 0, 0, 0.1);
    flex: 0 0 55%;
  }

  .search-bar {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
    align-items: center;
  }

  .table-wrapper {
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th, td {
    padding: 0.75rem;
    text-align: right;
    border-bottom: 1px solid #ddd;
  }

  th {
    background: #f5f5f5;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
  }
  
  .action-btn {
    padding: 0.3rem 0.6rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    white-space: nowrap;
  }
  
  .edit {
    background: #2196F3;
    color: white;
  }
  
  .delete {
    background: #f44336;
    color: white;
  }
  
  .maintenance {
    background: #FF9800;
    color: white;
  }
  
  .details-content {
    display: flex;
    gap: 1rem;
    padding: 1rem;
  }
  
  .car-image {
    width: 150px;
    height: auto;
    border-radius: 4px;
  }
  
  .details-text {
    flex: 1;
  }
  
  .no-results {
    text-align: center;
    padding: 1rem;
    color: #666;
  }
  
  .brand-select-container, .model-select-container {
    display: flex;
    gap: 0.5rem;
  }
  
  .add-button, .add-model-btn {
    background: #2196F3;
    color: white;
    border: none;
    padding: 0.5rem;
    border-radius: 4px;
    cursor: pointer;
    white-space: nowrap;
  }
  
  .brand-modal, .model-modal, .maintenance-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    width: 80%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-section {
    margin-bottom: 1.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #eee;
  }

  .modal-btn {
    padding: 0.5rem 1rem;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    margin-top: 0.5rem;
    cursor: pointer;
  }

  .modal-btn.cancel {
    background: #f44336;
  }

  .modal-close 
  {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background: #2196F3;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  .modal-buttons {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
  }
  /* <style> */
  :global(body) {
    font-family: 'Tajawal', sans-serif;
    direction: rtl;
    background-color: #f5f7fa;
  }

  .container {
    display: flex;
    gap: 30px;
    padding: 20px;
    max-width: 1400px;
    margin: 0 auto;
    flex-wrap: wrap;
  }

  /* تحسين نموذج الإدخال */
  .form {
    background: white;
    padding: 25px;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    flex: 1;
    min-width: 400px;
    border: 1px solid #e1e5eb;
  }

  .form h3 {
    color: #2c3e50;
    margin-bottom: 20px;
    font-size: 1.4rem;
    border-bottom: 2px solid #3498db;
    padding-bottom: 10px;
  }

  /* تحسين حقول الإدخال */
  .input-field {
    margin-bottom: 15px;
  }

  .input-field label {
    display: block;
    margin-bottom: 6px;
    font-weight: 600;
    color: #34495e;
  }

  .input-field input,
  .input-field select,
  .input-field textarea {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.3s;
  }

  .input-field input:focus,
  .input-field select:focus,
  .input-field textarea:focus {
    border-color: #3498db;
    outline: none;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
  }

  /* تحسين الجدول */
  .B-table {
    background: white;
    padding: 25px;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    flex: 2;
    min-width: 600px;
    border: 1px solid #e1e5eb;
  }

  .B-table h3 {
    color: #2c3e50;
    margin-bottom: 20px;
    font-size: 1.4rem;
    border-bottom: 2px solid #3498db;
    padding-bottom: 10px;
  }

  table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
  }

  th {
    background-color: #f8f9fa;
    color: #34495e;
    font-weight: 700;
    padding: 12px 15px;
    text-align: right;
    position: sticky;
    top: 0;
  }

  td {
    padding: 12px 11px;
    border-bottom: 1px solid #e1e5eb;
    color: #2c3e50;
  }

  tr:hover {
    background-color: #f8f9fa;
  }

  /* تحسين الأزرار */
  .submit-btn {
    background-color: #3498db;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .submit-btn:hover {
    background-color: #2980b9;
  }

  .action-btn {
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 0.85rem;
    font-weight: 500;
    transition: all 0.2s;
  }

  .edit {
    background-color: #3498db;
    color: white;
  }

  .edit:hover {
    background-color: #2980b9;
  }

  .delete {
    background-color: #e74c3c;
    color: white;
  }

  .delete:hover {
    background-color: #c0392b;
  }

  .maintenance {
    background-color: #f39c12;
    color: white;
  }

  .maintenance:hover {
    background-color: #d35400;
  }

  /* تحسين المودال */
  .modal-content {
    background: white;
    padding: 30px;
    border-radius: 12px;
    width: 90%;
    max-width: 600px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }

  /* تحسين حقول لوحة الأرقام */
  .letter-inputs {
    display: flex;
    gap: 8px;
    justify-content: center;
  }

  .letter-input {
    width: 40px;
    height: 40px;
    text-align: center;
    font-size: 1.2rem;
    border: 2px solid #ddd;
    border-radius: 6px;
  }

  .letter-input:focus {
    border-color: #3498db;
  }

  /* تأثيرات للتفاعل */
  button {
    transition: all 0.2s ease;
  }

  button:active {
    transform: scale(0.98);
  }

  /* تحسين العرض على الجوال */
  @media (max-width: 768px) {
    .container {
      flex-direction: column;
      gap: 20px;
    }
    
    .form, .B-table {
      min-width: 100%;
    }
    
    .form-columns {
      flex-direction: column;
    }
    
    .search-bar {
      flex-direction: column;
      align-items: stretch;
    }
  }
</style> 