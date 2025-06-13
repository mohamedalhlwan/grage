<script>
  import { onMount } from "svelte";
  import Headeve from "../header/Headeve.svelte";

  let cars = [];
  let openReport = null;
  let activeTab = 'fuel';

  onMount(() => {
    loadData();
  });

  async function loadData() {
    try {
      const savedCars = localStorage.getItem("cars");
      cars = savedCars ? JSON.parse(savedCars) : [];
      console.log("Loaded cars:", cars);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  }

  function toggleReport(id) {
    openReport = openReport === id ? null : id;
  }

  function getFuelRecords(car) {
    return car.fuelRecords ? [...car.fuelRecords].sort((a, b) => new Date(b.date) - new Date(a.date)) : [];
  }

  function getMaintenanceRecords(car) {
    return car.maintenance ? [...car.maintenance].sort((a, b) => new Date(b.reminderDate) - new Date(a.reminderDate)) : [];
  }

  function getSparePartsRecords(car) {
    return car.parts ? [...car.parts].sort((a, b) => new Date(b.date) - new Date(a.date)) : [];
  }

  function printReport(car) {
    const printContent = `
      <html>
        <head>
          <title>تقرير السيارة ${car.name}</title>
          <style>
            body { font-family: Arial, sans-serif; direction: rtl; padding: 20px; }
            h2 { color: #333; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
            th { background-color: #f2f2f2; }
            .section { margin-bottom: 30px; }
            .section-title { background: #4361EE; color: white; padding: 8px; }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h2>تقرير السيارة: ${car.name}</h2>
          
          <div class="section">
            <div class="section-title">معلومات السيارة</div>
            <table>
              <tr><td>الماركة:</td><td>${car.brand || '--'}</td></tr>
              <tr><td>الموديل:</td><td>${car.model || '--'}</td></tr>
              <tr><td>اللون:</td><td>${car.color || '--'}</td></tr>
              <tr><td>المسافة المقطوعة:</td><td>${car.Km || '--'} كم</td></tr>
              <tr><td>رقم اللوحة:</td><td>${car.plate?.numbers || '--'}</td></tr>
              <tr><td>رقم المحرك:</td><td>${car.engineNumber || '--'}</td></tr>
            </table>
          </div>
          
          <div class="section">
            <div class="section-title">سجلات الوقود</div>
            ${generateFuelTableHTML(getFuelRecords(car))}
          </div>
          
          <div class="section">
            <div class="section-title">سجلات الصيانة</div>
            ${generateMaintenanceTableHTML(getMaintenanceRecords(car))}
          </div>
    
          <div class="section">
            <div class="section-title">قطع الغيار</div>
            ${generatePartsTableHTML(getSparePartsRecords(car))}
          </div>
          
          <button onclick="window.print()">طباعة التقرير</button>
          <button onclick="window.close()">إغلاق</button>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
  }

  function generateFuelTableHTML(records) {
    if (records.length === 0) return '<p>لا توجد سجلات وقود</p>';
    
    return `
      <table>
        <thead>
          <tr>
            <th>التاريخ</th>
            <th>الكمية (لتر)</th>
            <th>السعر للتر</th>
            <th>المجموع</th>
            <th>بداية العداد</th>
            <th>نهاية العداد</th>
            <th>المحطة</th>
          </tr>
        </thead>
        <tbody>
          ${records.map(record => `
            <tr>
              <td>${record.date || '--'}</td>
              <td>${record.liters || '--'}</td>
              <td>${record.pricePerLiter ? record.pricePerLiter + ' جنيها' : '--'}</td>
              <td>${record.liters && record.pricePerLiter ? (record.liters * record.pricePerLiter) + ' جنيها' : '--'}</td>
              <td>${record.startOdometer || '--'}</td>
              <td>${record.endOdometer || '--'}</td>
              <td>${record.station || '--'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  function generateMaintenanceTableHTML(records) {
    if (records.length === 0) return '<p>لا توجد سجلات صيانة</p>';
    
    return `
      <table>
        <thead>
          <tr>
            <th>نوع الخدمة</th>
            <th>تاريخ التذكير</th>
            <th>كل (كم)</th>
            <th>كل (شهر)</th>
            <th>التكلفة</th>
            <th>الورشة</th>
          </tr>
        </thead>
        <tbody>
          ${records.map(record => `
            <tr>
              <td>${record.serviceType || '--'}</td>
              <td>${record.reminderDate || '--'}</td>
              <td>${record.intervalKm || '--'}</td>
              <td>${record.intervalMonths || '--'}</td>
              <td>${record.cost ? record.cost + ' جنيها' : '--'}</td>
              <td>${record.workshop || '--'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  function generatePartsTableHTML(records) {
    if (records.length === 0) return '<p>لا توجد قطع غيار</p>';
    
    return `
      <table>
        <thead>
          <tr>
            <th>الاسم</th>
            <th>الرقم</th>
            <th>التاريخ</th>
            <th>السعر</th>
            <th>الكمية</th>
            <th>المورد</th>
          </tr>
        </thead>
        <tbody>
          ${records.map(part => `
            <tr>
              <td>${part.name || '--'}</td>
              <td>${part.number || '--'}</td>
              <td>${part.date || '--'}</td>
              <td>${part.price ? part.price + ' جنيها' : '--'}</td>
              <td>${part.quantity || '--'}</td>
              <td>${part.supplier || '--'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }
</script>

<div class="header-top">
  <h2>طباعة التقارير</h2>
  <p>طباعه التقارير لكل سياراه</p>

</div>
<div class="container">
  <div class="reports">
    <h2>تقارير السيارات</h2>
    
    {#if cars.length === 0}
      <p class="no-data">لا توجد سيارات مسجلة</p>
    {:else}
      <table class="cars-table">
        <thead>
          <tr>
            <th>حروف الوحه</th>
            <th>رقم اللوحة</th>
            <th>رقم المرور</th>
            <th>الموديل</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {#each cars as car}
            <tr>
              <td>{car.plate?.letters}</td>
              <td>{car.plate?.numbers || '--'}</td>
              <td>{car.trafficNumber}</td>
              <td>{car.model || '--'}</td>
              <td>
                <button on:click={() => toggleReport(car.id)} class="toggle-btn">
                  {openReport === car.id ? 'إخفاء' : 'عرض'}
                </button>
                <button on:click={() => printReport(car)} class="print-btn">
                  طباعة
                </button>
              </td>
            </tr>
            
            {#if openReport === car.id}
              <tr class="report-row">
                <td colspan="4">
                  <div class="report-content">
                    <div class="tabs">
                      <button class:active={activeTab === 'fuel'} on:click={() => activeTab = 'fuel'}>
                        سجلات الوقود
                      </button>
                      <button class:active={activeTab === 'maintenance'} on:click={() => activeTab = 'maintenance'}>
                        سجلات الصيانة
                      </button>
                      <button class:active={activeTab === 'parts'} on:click={() => activeTab = 'parts'}>
                        قطع الغيار
                      </button>
                    </div>
                    
                    {#if activeTab === 'fuel'}
                      <div class="tab-content">
                        {#if getFuelRecords(car).length === 0}
                          <p>لا توجد سجلات وقود</p>
                        {:else}
                          <table>
                            <thead>
                              <tr>
                                <th>التاريخ</th>
                                <th>الكمية (لتر)</th>
                                <th>السعر للتر</th>
                                <th>المجموع</th>
                                <th>المحطة</th>
                              </tr>
                            </thead>
                            <tbody>
                              {#each getFuelRecords(car) as record}
                                <tr>
                                  <td>{record.date}</td>
                                  <td>{record.liters}</td>
                                  <td>{record.pricePerLiter} جنيها</td>
                                  <td>{record.liters * record.pricePerLiter} جنيها</td>
                                  <td>{record.station || '--'}</td>
                                </tr>
                              {/each}
                            </tbody>
                          </table>
                        {/if}
                      </div>
                    {:else if activeTab === 'maintenance'}
                      <div class="tab-content">
                        {#if getMaintenanceRecords(car).length === 0}
                          <p>لا توجد سجلات صيانة</p>
                        {:else}
                          <table>
                            <thead>
                              <tr>
                                <th>نوع الخدمة</th>
                                <th>تاريخ التذكير</th>
                                <th>التكلفة</th>
                                <th>الورشة</th>
                              </tr>
                            </thead>
                            <tbody>
                              {#each getMaintenanceRecords(car) as record}
                                <tr>
                                  <td>{record.serviceType || '--'}</td>
                                  <td>{record.reminderDate || '--'}</td>
                                  <td>{record.cost || '--'} جنيها</td>
                                  <td>{record.workshop || '--'}</td>
                                </tr>
                              {/each}
                            </tbody>
                          </table>
                        {/if}
                      </div>
                    {:else}
                      <div class="tab-content">
                        {#if getSparePartsRecords(car).length === 0}
                          <p>لا توجد قطع غيار</p>
                        {:else}
                          <table>
                            <thead>
                              <tr>
                                <th>الاسم</th>
                                <th>الرقم</th>
                                <th>التاريخ</th>
                                <th>السعر</th>
                              </tr>
                            </thead>
                            <tbody>
                              {#each getSparePartsRecords(car) as part}
                                <tr>
                                  <td>{part.name || '--'}</td>
                                  <td>{part.number || '--'}</td>
                                  <td>{part.date || '--'}</td>
                                  <td>{part.price || '--'} جنيها</td>
                                </tr>
                              {/each}
                            </tbody>
                          </table>
                        {/if}
                      </div>
                    {/if}
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

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }
  .header-top{
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
    color: white;
    background: #4361EE;
  }
  .header-top h2, p{
    color: white;
    margin: 7px  24px;
  }
  .reports {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  h2 {
    color: #333;
    text-align: center;
    margin-bottom: 20px;
  }

  .no-data {
    text-align: center;
    padding: 20px;
    color: #666;
  }

  .cars-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
  }

  .cars-table th, .cars-table td {
    padding: 12px;
    text-align: right;
    border-bottom: 1px solid #eee;
  }

  .cars-table th {
    background-color: #f5f5f5;
    font-weight: bold;
  }

  .report-row td {
    padding: 0;
  }

  .report-content {
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 0 0 8px 8px;
  }

  .tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    border-bottom: 1px solid #ddd;
    padding-bottom: 10px;
  }

  .tabs button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    background: #e0e0e0;
    transition: all 0.3s;
  }

  .tabs button.active {
    background: #4361EE;
    color: white;
  }

  .tab-content {
    overflow-x: auto;
    max-height: 400px;
    overflow-y: auto;
  }

  .tab-content table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
  }

  .tab-content th, .tab-content td {
    padding: 10px;
    border: 1px solid #ddd;
    text-align: right;
  }

  .tab-content th {
    background-color: #f2f2f2;
    position: sticky;
    top: 0;
  }

  button.toggle-btn {
    background: #4361EE;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    margin-right: 5px;
  }

  button.print-btn {
    background: #2E5D54;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
  }

  @media (max-width: 768px) {
    .container {
      padding: 10px;
    }
    
    .cars-table th, .cars-table td {
      padding: 8px;
    }
    
    .tabs {
      flex-wrap: wrap;
    }
    
    .tabs button {
      flex: 1;
      min-width: 100px;
    }
    
    button.toggle-btn, button.print-btn {
      padding: 6px 12px;
      font-size: 14px;
    }
  }
</style>