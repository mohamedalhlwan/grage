<script>
  import { onMount } from "svelte";
  import Headeve from "../header/Headeve.svelte";

  // قائمة ماركات السيارات
  const carBrands = [
    "تويوتا", "هيونداي", "نيسان", "كيا", "شيفروليه",
    "مرسيدس", "بي إم دبليو", "أودي", "فولكس فاجن", "فورد",
    "ميتسوبيشي", "هوندا", "رينو", "جيلي", "شيري"
  ];

  // حقول قطع الغيار
  let partName = '';
  let partNumber = '';
  let manufacturer = '';
  let manufacturerCompany = '';
  let carBrand = '';
  let partType = '';
  let warrantyType = 'شهر';
  let warrantyDuration = 1;
  let deliveryDate = '';
  let unitType = 'قطعة';
  let price = 0; // حقل السعر الجديد
  let editId = null;

  // بيانات قطع الغيار
  let spareParts = [];
  let searchQuery = '';

  onMount(() => {
    const savedParts = localStorage.getItem('spareParts');
    if (savedParts) spareParts = JSON.parse(savedParts);
  });

  // دالة للتحقق من أن القيمة تحتوي على أرقام فقط
  function validateNumberInput(e) {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) {
      e.target.value = value.replace(/[^\d]/g, '');
      partNumber = e.target.value;
    }
  }

  // دالة للتحقق من أن السعر يحتوي على أرقام فقط
  function validatePriceInput(e) {
    const value = e.target.value;
    if (!/^\d*\.?\d*$/.test(value)) {
      e.target.value = value.replace(/[^\d.]/g, '');
      price = e.target.value;
    }
  }

  function saveSparePart() {
    if (partName && partNumber && manufacturer && manufacturerCompany && carBrand) {
      const partData = {
        id: editId || Date.now(),
        name: partName,
        number: partNumber,
        manufacturer,
        company: manufacturerCompany,
        carBrand,
        type: partType || 'غير محدد',
        warrantyType,
        warrantyDuration,
        deliveryDate,
        unitType,
        price: parseFloat(price) || 0 // تحويل السعر إلى رقم
      };

      if (editId) {
        spareParts = spareParts.map(p => p.id === editId ? partData : p);
        editId = null;
      } else {
        spareParts = [...spareParts, partData];
      }

      localStorage.setItem('spareParts', JSON.stringify(spareParts));
      resetForm();
    } else {
      alert('يرجى تعبئة الحقول المطلوبة (الاسم، الكود، جهة التصنيع، الشركة المصنعة، الماركة)');
    }
  }

  function editSparePart(part) {
    editId = part.id;
    partName = part.name;
    partNumber = part.number;
    manufacturer = part.manufacturer;
    manufacturerCompany = part.company;
    carBrand = part.carBrand || '';
    partType = part.type || '';
    warrantyType = part.warrantyType;
    warrantyDuration = part.warrantyDuration;
    deliveryDate = part.deliveryDate || '';
    unitType = part.unitType || 'قطعة';
    price = part.price || 0;
  }

  function deleteSparePart(id) {
    if (confirm('هل أنت متأكد من حذف هذه القطعة؟')) {
      spareParts = spareParts.filter(p => p.id !== id);
      localStorage.setItem('spareParts', JSON.stringify(spareParts));
    }
  }

  function resetForm() {
    partName = '';
    partNumber = '';
    manufacturer = '';
    manufacturerCompany = '';
    carBrand = '';
    partType = '';
    warrantyType = 'شهر';
    warrantyDuration = 1;
    deliveryDate = '';
    unitType = 'قطعة';
    price = 0;
    editId = null;
  }

  $: maxWarranty = warrantyType === 'شهر' ? 12 : 10;
  $: warrantyOptions = Array.from({ length: maxWarranty }, (_, i) => i + 1);

  $: filteredSpareParts = spareParts.filter(part =>
    part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    part.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    part.carBrand.toLowerCase().includes(searchQuery.toLowerCase())
  );
</script>

<div class="header-top">
  <div class="header-part">
    <h2>قطع غيار السياره</h2>
    <p>اضافة وتعديل قطع غيار</p>
  </div>
</div>

<div class="container">
  <div class="form">
    <h3>🔩 أضف / عدل قطعة غيار</h3>
    <div class="input-grid">
      <input bind:value={partName} placeholder="اسم القطعة" required />
      
      <input 
        bind:value={partNumber} 
        on:input={validateNumberInput}
        placeholder="كود القطعة (أرقام فقط)" 
        required
        inputmode="numeric"
        maxlength="4"
      />
      
      <input bind:value={manufacturer} placeholder="جهة التصنيع" required />
      <input bind:value={manufacturerCompany} placeholder="الشركة المصنعة" required />
      
      <select bind:value={carBrand} required>
        <option value="">-- اختر ماركة السيارة --</option>
        {#each carBrands as brand}
          <option value={brand}>{brand}</option>
        {/each}
      </select>
      
      <select bind:value={partType}>
        <option value="">-- اختر النوع (اختياري) --</option>
        <option value="قطع غيار">قطع غيار</option>
        <option value="خامات">خامات</option>
      </select>
      
      <input type="date" bind:value={deliveryDate} placeholder="تاريخ التوريد" />
      
      <select bind:value={unitType}>
        <option value="قطعة">قطعة</option>
        <option value="كرتونة">كرتونة</option>
        <option value="لتر">لتر</option>
        <option value="كيلو">كيلو</option>
      </select>
      
      <!-- حقل السعر الجديد -->
      <input 
        bind:value={price} 
        on:input={validatePriceInput}
        placeholder="السعر (جنيه)" 
        type="number"
        min="0"
        step="0.01"
      />
      
      <div class="lapel">
        <p>الضمان</p>
        <select bind:value={warrantyType}>
          <option value="شهر">شهر</option>
          <option value="سنة">سنة</option>
        </select>
      </div>
      
      <select bind:value={warrantyDuration}>
        {#each warrantyOptions as option}
          <option value={option}>{option}</option>
        {/each}
      </select>
    </div>
    <button on:click={saveSparePart}>💾 {editId ? 'تحديث القطعة' : 'حفظ القطعة'}</button>
  </div>

  <div class="show">
    <h3>📋 قائمة قطع الغيار</h3>
    <div class="input-grid">
      <input type="text" bind:value={searchQuery} placeholder="🔍 ابحث باسم أو رقم القطعة أو الماركة" />
    </div>
    {#if filteredSpareParts.length === 0}
      <p>🚫 لا توجد قطع غيار مطابقة</p>
    {:else}
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>🔧 الاسم</th>
              <th>🔢 الرقم</th>
              <th>🏭 جهة التصنيع</th>
              <th>🏢 الشركة المصنعة</th>
              <th>🚗 ماركة السيارة</th>
              <th>💰 السعر (ج.م)</th>
              <th>📅 تاريخ التوريد</th>
              <th>📦 الوحدة</th>
              <th>🔘 النوع</th>
              <th>🛡️ الضمان</th>
              <th>أدوات</th>
            </tr>
          </thead>
          <tbody>
            {#each filteredSpareParts as part}
              <tr>
                <td>{part.name}</td>
                <td>{part.number}</td>
                <td>{part.manufacturer}</td>
                <td>{part.company}</td>
                <td>{part.carBrand || '--'}</td>
                <td>{part.price ? part.price.toFixed(2) : '0.00'}</td>
                <td>{part.deliveryDate || '--'}</td>
                <td>{part.unitType || 'قطعة'}</td>
                <td>{part.type || '--'}</td>
                <td>{part.warrantyDuration} {part.warrantyType}</td>
                <td>
                  <button class="edit-btn" on:click={() => editSparePart(part)}>✏️ تعديل</button>
                  <button class="delete-btn" on:click={() => deleteSparePart(part.id)}>🗑️ حذف</button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>

<style>
  /* الأنماط تبقى كما هي مع إضافة مساحة للعمود الجديد */
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
  
  .container {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    padding: 1rem;
    max-width: 100%;
    margin: 0 10px;
    justify-content: space-between;
  }

  .form {
    background: #fff;
    padding: 1rem;
    border-radius: 8px;
    flex: 1;
    max-width: 40%;
    box-sizing: border-box;
  }

  .show {
    background: #fff;
    padding: 1rem;
    border-radius: 8px;
    flex: 1;
    max-width:60%;
    box-sizing: border-box;
  }

  .input-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }

  .input-grid input,
  .input-grid select {
    padding: 0.5rem;
    border: 3px solid #ddd;
    border-radius: 6px;
    font-size: 0.875rem;
    box-sizing: border-box;
    transition: border-color 0.3s ease;
  }

  .input-grid input:focus,
  .input-grid select:focus {
    border-color: #007bff;
    outline: none;
  }

  .input-grid input::placeholder {
    color: #413b3b92;
    font-size: 17px;
  }

  button {
    margin-top: 1rem;
    padding: 0.7rem 1.5rem;
    background: #4361EE;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    width: 100%;
  }

  button:hover {
    background-color: #0056b3;
  }

  .edit-btn {
    background-color: #2cb049;
    color: black;
  }

  .delete-btn {
    background-color: #dc3545;
    color: white;
  }

  .edit-btn:hover {
    background-color: #056501;
  }

  .delete-btn:hover {
    background-color: #c82333;
  }

  .show input[type="text"] {
    width: 100%;
    padding: 0.7rem;
    margin-bottom: 1rem;
    border-radius: 6px;
    border: 1px solid #ccc;
  }

  .table-container {
    overflow-x: auto;
    width: 100%;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }

  table th,
  table td {
    padding: 0.6rem;
    text-align: center;
    border: 1px solid #ccc;
  }

  table th {
    background-color: #f1f1f1;
    font-weight: bold;
  }

  table td {
    background-color: #fff;
  }

  table tr:nth-child(even) td {
    background-color: #f9f9f9;
  }

  .container {
    padding-left: 0;
    padding-right: 0;
  }
 
  .form,
  .show {
    box-shadow: none;
    border: none;
  }
</style>