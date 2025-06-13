<script>
  import { onMount } from "svelte";
  
  let maintenanceRequests = [];
  let selectedRequest = null;
  let financeNotes = '';
  let showRejectionReason = false;
  let rejectionReason = '';
  let showAppealForm = false;
  let appealReason = '';
  let activeTab = 'pending';
  
  // متغيرات الفلترة
  let dateRange = {
    start: '',
    end: ''
  };
  let totalCompletedCost = 0;
  
  function initializeRequestStatuses() {
    maintenanceRequests.forEach(request => {
      if (request.rejectedByGarage && !request.status) {
        request.status = 'rejected_by_review';
        request.garageRejection = {
          reason: request.rejectionReason,
          date: new Date().toISOString(),
          by: 'الجراج'
        };
        
        if (!request.history) {
          request.history = [];
        }
        
        request.history.push({
          action: 'garage_rejected',
          date: new Date().toISOString(),
          by: 'الجراج',
          reason: request.rejectionReason
        });
      }
    });
    saveRequests();
  }

  onMount(() => {
    const storedRequests = localStorage.getItem('maintenanceRequests');
    if (storedRequests) {
      maintenanceRequests = JSON.parse(storedRequests);
      initializeRequestStatuses();
      calculateFilteredTotal();
    }
  });
  
  function calculateFilteredTotal() {
    if (activeTab === 'completed') {
      if (dateRange.start && dateRange.end) {
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        
        totalCompletedCost = completedRequests
          .filter(request => {
            const completionDate = new Date(request.completionDate || 
              request.history.find(h => h.action === 'completed')?.date || new Date());
            return completionDate >= startDate && completionDate <= endDate;
          })
          .reduce((sum, request) => sum + calculateTotalCost(request), 0);
      } else {
        totalCompletedCost = completedRequests.reduce((sum, request) => sum + calculateTotalCost(request), 0);
      }
    }
  }
  
  function viewRequestDetails(request) {
    selectedRequest = request;
  }
  
  function closeDetails() {
    selectedRequest = null;
    financeNotes = '';
    showRejectionReason = false;
    rejectionReason = '';
    showAppealForm = false;
    appealReason = '';
  }
  
  function approveRequest(request) {
    if (!financeNotes) {
      alert('يرجى إضافة ملاحظات مالية');
      return;
    }
    
    request.financeNotes = financeNotes;
    request.status = 'financial_approved';
    request.parts?.forEach(part => part.approved = true);
    request.services?.forEach(service => service.approved = true);
    request.history.push({
      action: 'financial_approved',
      date: new Date().toISOString(),
      by: 'المالية',
      notes: financeNotes
    });
    
    saveRequests();
    closeDetails();
    alert('تم اعتماد الطلب مالياً وإعادته لشركة الصيانة');
  }
  
  function rejectRequest() {
    if (!rejectionReason) {
        alert('يرجى إضافة سبب الرفض');
        return;
    }
    
    const requestIndex = maintenanceRequests.findIndex(req => req.id === selectedRequest.id);
    if (requestIndex !== -1) {
        maintenanceRequests[requestIndex].status = 'financial_rejected';
        maintenanceRequests[requestIndex].financialRejection = {
            reason: rejectionReason,
            date: new Date().toISOString(),
            by: 'المالية'
        };
        
        maintenanceRequests[requestIndex].history.push({
            action: 'financial_rejected',
            date: new Date().toISOString(),
            by: 'المالية',
            reason: rejectionReason
        });
        
        saveRequests();
        closeDetails();
        alert('تم رفض الطلب مالياً');
        maintenanceRequests = [...maintenanceRequests];
    }
  }
  
  function submitAppeal() {
    if (!appealReason) {
      alert('يرجى إضافة سبب الاعتراض');
      return;
    }
    
    selectedRequest.status = 'appeal_submitted';
    selectedRequest.appeal = {
      reason: appealReason,
      date: new Date().toISOString(),
      by: 'المالية',
      status: 'pending'
    };
    
    selectedRequest.history.push({
      action: 'appeal_submitted',
      date: new Date().toISOString(),
      by: 'المالية',
      reason: appealReason
    });
    
    saveRequests();
    closeDetails();
    alert('تم تقديم الاعتراض وإعادة الطلب لشركة الصيانة');
  }
  
  function saveRequests() {
    localStorage.setItem('maintenanceRequests', JSON.stringify(maintenanceRequests));
    maintenanceRequests = [...maintenanceRequests];
  }
  
  $: calculateTotalCost = (request) => {
    const partsCost = request.parts?.reduce((sum, part) => sum + (part.price * part.quantity), 0) || 0;
    const servicesCost = request.services?.reduce((sum, service) => sum + service.price, 0) || 0;
    return partsCost + servicesCost;
  };
  
  $: pendingFinanceRequests = maintenanceRequests.filter(req => req.status === 'pending_financial');
  $: garageRejectedRequests = maintenanceRequests.filter(req => req.status === 'rejected_by_review');
  $: approvedRequests = maintenanceRequests.filter(req => req.status === 'financial_approved');
  $: financialRejectedRequests = maintenanceRequests.filter(req => req.status === 'financial_rejected');
  $: completedRequests = maintenanceRequests.filter(req => req.status === 'completed');
  $: appealedRequests = maintenanceRequests.filter(req => req.status === 'appeal_submitted');
  
  $: filteredRequests = 
    activeTab === 'pending' ? pendingFinanceRequests :
    activeTab === 'garage_rejected' ? garageRejectedRequests :
    activeTab === 'approved' ? approvedRequests :
    activeTab === 'financial_rejected' ? financialRejectedRequests :
    activeTab === 'completed' ? completedRequests :
    activeTab === 'appeals' ? appealedRequests :
    maintenanceRequests;
    
  $: if (activeTab === 'completed') {
    calculateFilteredTotal();
  }
</script>

<div class="finance-page">
  <h1>الموافقة المالية على طلبات الصيانة</h1>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@100..900&family=Rakkas&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&family=Rubik:ital,wght@0,300..900;1,300..900&display=swap" rel="stylesheet">
  
  <div class="tabs">
    <button class:active={activeTab === 'pending'} on:click={() => activeTab = 'pending'}>
      قيد الانتظار ({pendingFinanceRequests.length})
    </button>
    <button class:active={activeTab === 'garage_rejected'} on:click={() => activeTab = 'garage_rejected'}>
      مرفوضة من الجراج ({garageRejectedRequests.length})
    </button>
    <button class:active={activeTab === 'approved'} on:click={() => activeTab = 'approved'}>
      المعتمدة ({approvedRequests.length})
    </button>
    <button class:active={activeTab === 'financial_rejected'} on:click={() => activeTab = 'financial_rejected'}>
      مرفوضة مالياً ({financialRejectedRequests.length})
    </button>
    <button class:active={activeTab === 'completed'} on:click={() => activeTab = 'completed'}>
      المكتملة ({completedRequests.length})
    </button>
    <button class:active={activeTab === 'appeals'} on:click={() => activeTab = 'appeals'}>
      المعترض عليها ({appealedRequests.length})
    </button>
    <button class:active={activeTab === 'all'} on:click={() => activeTab = 'all'}>
      جميع الطلبات ({maintenanceRequests.length})
    </button>
  </div>
  
  <div class="requests-container">
    <h2>
      {activeTab === 'pending' ? 'الطلبات المنتظرة للموافقة المالية' :
       activeTab === 'garage_rejected' ? 'الطلبات المرفوضة من الجراج' :
       activeTab === 'approved' ? 'الطلبات المعتمدة مالياً' :
       activeTab === 'financial_rejected' ? 'الطلبات المرفوضة مالياً' :
       activeTab === 'completed' ? 'الطلبات المكتملة' :
       activeTab === 'appeals' ? 'الطلبات المعترض عليها' :
       'جميع طلبات الصيانة'}
    </h2>
    
    {#if activeTab === 'completed'}
      <div class="filters-container">
        <h3>تصفية الطلبات المكتملة</h3>
        <div class="date-filters">
          <div class="date-input">
            <label for="startDate">من تاريخ:</label>
            <input 
              type="date" 
              id="startDate" 
              bind:value={dateRange.start}
              on:change={calculateFilteredTotal}
            >
          </div>
          <div class="date-input">
            <label for="endDate">إلى تاريخ:</label>
            <input 
              type="date" 
              id="endDate" 
              bind:value={dateRange.end}
              on:change={calculateFilteredTotal}
            >
          </div>
          <button on:click={() => {
            dateRange.start = '';
            dateRange.end = '';
            calculateFilteredTotal();
          }}>إعادة تعيين</button>
        </div>
        
        <div class="total-summary">
          <h4>إجمالي التكلفة {dateRange.start && dateRange.end ? 'للفترة المحددة' : ''}:</h4>
          <div class="total-amount">{totalCompletedCost} ج.م</div>
        </div>
      </div>
    {/if}
    
    {#if filteredRequests.length === 0}
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <p>لا توجد طلبات لعرضها</p>
      </div>
    {:else}
      <div class="cards-grid">
        {#each filteredRequests as request}
          <div class="request-card {request.status}">
            <div class="card-header">
              <h3>{request.carModel}</h3>
              <span class="plate">{request.plate.numbers} {request.plate.letters.join('')}</span>
            </div>
            
            <div class="card-body">
              <div class="card-row">
                <span class="label">الحالة:</span>
                <span class="value status-badge {request.status}">
                  {request.status === 'pending_financial' ? 'بانتظار الموافقة' :
                   request.status === "rejected_by_review" ? 'مرفوضة من الجراج' :
                   request.status === 'financial_approved' ? 'معتمدة مالياً' :
                   request.status === 'financial_rejected' ? 'مرفوضة مالياً' :
                   request.status === 'completed' ? 'مكتملة' :
                   request.status === 'appeal_submitted' ? 'معترض عليها' : request.status}
                </span>
              </div>
              
              <div class="card-row">
                <span class="label">الأعطال:</span>
                <span class="value">{request.issues}</span>
              </div>
              
              <div class="card-row">
                <span class="label">ملاحظات المراجعة:</span>
                <span class="value">{request.reviewNotes || 'لا توجد'}</span>
              </div>
              
              <div class="card-row">
                <span class="label">التكلفة:</span>
                <span class="value">{calculateTotalCost(request)} ج.م</span>
              </div>
            </div>
            
            <div class="card-footer">
              <button on:click={() => viewRequestDetails(request)}>عرض التفاصيل</button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
  
  {#if selectedRequest}
    <div class="popup-overlay" on:click|self={closeDetails}>
      <div class="popup-content">
        <div class="popup-header">
          <h2>تفاصيل الطلب: {selectedRequest.carModel}</h2>
          <button class="popup-close-btn" on:click={closeDetails}>×</button>
        </div>
        
        <div class="popup-body">
          <div class="details-grid">
            <div class="detail-card">
              <h3>معلومات الطلب</h3>
              <div class="info-item">
                <span class="label">اللوحة:</span>
                <span class="value">{selectedRequest.plate.numbers} {selectedRequest.plate.letters.join('')}</span>
              </div>
              <div class="info-item">
                <span class="label">الحالة:</span>
                <span class="value status-badge {selectedRequest.status}">
                  {selectedRequest.status === 'pending_financial' ? 'بانتظار الموافقة المالية' :
                   selectedRequest.status === 'garage_rejected' ? 'مرفوضة من الجراج' :
                   selectedRequest.status === 'financial_approved' ? 'معتمدة مالياً' :
                   selectedRequest.status === 'financial_rejected' ? 'مرفوضة مالياً' :
                   selectedRequest.status === 'completed' ? 'مكتملة' :
                   selectedRequest.status === 'appeal_submitted' ? 'معترض عليها' : selectedRequest.status}
                </span>
              </div>
              <div class="info-item">
                <span class="label">الأعطال:</span>
                <span class="value">{selectedRequest.issues}</span>
              </div>
              <div class="info-item">
                <span class="label">ملاحظات الفني:</span>
                <span class="value">{selectedRequest.technicianNotes || 'لا توجد'}</span>
              </div>
            </div>
            
            <div class="detail-card">
              <h3>الملاحظات</h3>
              <div class="info-item">
                <span class="label">ملاحظات المراجعة:</span>
                <span class="value">{selectedRequest.reviewNotes || 'لا توجد'}</span>
              </div>
              {#if selectedRequest.financeNotes}
                <div class="info-item">
                  <span class="label">ملاحظات المالية:</span>
                  <span class="value">{selectedRequest.financeNotes}</span>
                </div>
              {/if}
              {#if selectedRequest.financialRejection}
                <div class="info-item">
                  <span class="label">سبب الرفض المالي:</span>
                  <span class="value">{selectedRequest.financialRejection.reason}</span>
                </div>
              {/if}
              {#if selectedRequest.garageRejection}
                <div class="info-item">
                  <span class="label">سبب الرفض من الجراج:</span>
                  <span class="value">{selectedRequest.garageRejection.reason}</span>
                </div>
              {/if}
              {#if selectedRequest.appeal}
                <div class="info-item">
                  <span class="label">سبب الاعتراض:</span>
                  <span class="value">{selectedRequest.appeal.reason}</span>
                </div>
              {/if}
            </div>
          </div>
          
          <!-- قسم قطع الغيار -->
          <div class="detail-card full-width">
            <h3>قطع الغيار المطلوبة</h3>
            {#if selectedRequest.parts?.length > 0}
              <div class="items-grid">
                {#each selectedRequest.parts as part}
                  <div class="item-card">
                    <div class="item-name">{part.name}</div>
                    <div class="item-details">
                      <span>السعر: {part.price} ج.م</span>
                      <span>الكمية: {part.quantity}</span>
                      <span>المجموع: {part.price * part.quantity} ج.م</span>
                    </div>
                    <div class="item-status {part.approved ? 'approved' : 'pending'}">
                      {part.approved ? 'معتمدة' : 'غير معتمدة'}
                    </div>
                  </div>
                {/each}
              </div>
            {:else}
              <p class="no-items">لا توجد قطع غيار مطلوبة</p>
            {/if}
          </div>
          
          <!-- قسم خدمات الصيانة -->
          <div class="detail-card full-width">
            <h3>خدمات الصيانة المطلوبة</h3>
            {#if selectedRequest.services?.length > 0}
              <div class="items-grid">
                {#each selectedRequest.services as service}
                  <div class="item-card">
                    <div class="item-name">{service.name}</div>
                    <div class="item-description">{service.description || 'لا يوجد وصف'}</div>
                    <div class="item-details">
                      <span>السعر: {service.price} ج.م</span>
                    </div>
                    <div class="item-status {service.approved ? 'approved' : 'pending'}">
                      {service.approved ? 'معتمدة' : 'غير معتمدة'}
                    </div>
                  </div>
                {/each}
              </div>
            {:else}
              <p class="no-items">لا توجد خدمات صيانة مطلوبة</p>
            {/if}
          </div>
          
          <!-- التكلفة الإجمالية -->
          <div class="detail-card total-cost">
            <h3>التكلفة الإجمالية</h3>
            <div class="cost-amount">{calculateTotalCost(selectedRequest)} ج.م</div>
          </div>
          
          <!-- سجل الطلب -->
          <div class="detail-card full-width">
            <h3>سجل الطلب</h3>
            <div class="timeline">
              {#each selectedRequest.history as record}
                <div class="timeline-item">
                  <div class="timeline-date">{new Date(record.date).toLocaleString()}</div>
                  <div class="timeline-content">
                    <div class="timeline-action">
                      {record.action === 'created' ? 'إنشاء الطلب' :
                       record.action === 'technical_review' ? 'مراجعة فنية' :
                       record.action === 'garage_rejected' ? 'رفض من الجراج' :
                       record.action === 'financial_approved' ? 'موافقة مالية' :
                       record.action === 'financial_rejected' ? 'رفض مالي' :
                       record.action === 'completed' ? 'إكمال الطلب' :
                       record.action === 'appeal_submitted' ? 'اعتراض مقدم' : record.action}
                    </div>
                    <div class="timeline-by">بواسطة: {record.by}</div>
                    <div class="timeline-notes">{record.notes || record.reason || 'لا توجد ملاحظات'}</div>
                  </div>
                </div>
              {/each}
            </div>
          </div>
          
          {#if selectedRequest.status === 'pending_financial'}
            <div class="detail-card finance-form">
              <h3>القرار المالي</h3>
              <textarea bind:value={financeNotes} placeholder="أدخل ملاحظاتك المالية هنا..."></textarea>
              
              <div class="form-actions">
                <button on:click={() => approveRequest(selectedRequest)} class="approve">موافقة مالية</button>
                <button on:click={() => showRejectionReason = true } class="reject">رفض</button>
                <button on:click={() => showAppealForm = true } class="appeal">اعتراض وإعادة للصيانة</button>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}
  
  {#if showRejectionReason}
    <div class="popup-overlay">
      <div class="popup-content small">
        <div class="popup-header">
          <h3>سبب الرفض المالي</h3>
          <button class="popup-close-btn" on:click={() => showRejectionReason = false}>×</button>
        </div>
        
        <div class="popup-body">
          <textarea bind:value={rejectionReason} placeholder="أدخل سبب الرفض المالي..."></textarea>
          
          <div class="form-actions">                             
            <button on:click={rejectRequest} class="submit">تأكيد الرفض</button>
            <button on:click={() => showRejectionReason = false} class="cancel">إلغاء</button>
          </div>
        </div>
      </div>
    </div>
  {/if}
  
  {#if showAppealForm}
    <div class="popup-overlay">
      <div class="popup-content small">
        <div class="popup-header">
          <h3>تقديم اعتراض وإعادة للصيانة</h3>
          <button class="popup-close-btn" on:click={() => showAppealForm = false}>×</button>
        </div>
        
        <div class="popup-body">
          <textarea bind:value={appealReason} placeholder="أدخل سبب الاعتراض..."></textarea>
          
          <div class="form-actions">                             
            <button on:click={submitAppeal} class="submit">تأكيد الاعتراض</button>
            <button on:click={() => showAppealForm = false} class="cancel">إلغاء</button>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  :global(body) {
    font-family: "Noto Kufi Arabic", sans-serif;
    background-color: #f5f7fa;
    margin: 0;
    padding: 0;
  }
  
  .finance-page {
    padding: 20px;
    max-width: 1400px;
    margin: 0 auto;
  }
  
  h1 {
    color: #2c3e50;
    text-align: center;
    margin-bottom: 30px;
    font-weight: 600;
  }
  
  .tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 25px;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .tabs button {
    padding: 10px 20px;
    background: #e9ecef;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
    font-weight: 500;
    font-size: 0.9rem;
  }
  
  .tabs button.active {
    background: #4361EE;
    color: white;
    box-shadow: 0 4px 6px rgba(67, 97, 238, 0.2);
  }
  
  .tabs button:hover {
    transform: translateY(-2px);
  }
  
  .requests-container {
    background: white;
    padding: 25px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  }
  
  .requests-container h2 {
    color: #4361EE;
    margin-top: 0;
    margin-bottom: 20px;
    font-size: 1.3rem;
  }
  
  .filters-container {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    border: 1px solid #e9ecef;
  }

  .date-filters {
    display: flex;
    gap: 15px;
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: 15px;
  }

  .date-input {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .date-input label {
    font-size: 0.9rem;
    color: #495057;
    font-weight: 500;
  }

  .date-input input {
    padding: 8px 12px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-family: inherit;
  }

  .total-summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    background: #e9f7ef;
    border-radius: 8px;
    border: 1px solid #d4edda;
  }

  .total-summary h4 {
    margin: 0;
    color: #155724;
  }

  .total-amount {
    font-size: 1.2rem;
    font-weight: 700;
    color: #28a745;
  }
  
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    background: #f8f9fa;
    border-radius: 8px;
    text-align: center;
  }
  
  .empty-state svg {
    margin-bottom: 15px;
    color: #adb5bd;
  }
  
  .empty-state p {
    color: #6c757d;
    font-size: 1.1rem;
    margin: 0;
  }
  
  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    margin-top: 20px;
  }
  
  .request-card {
    background: white;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    overflow: hidden;
    transition: all 0.3s ease;
    border: 1px solid #e9ecef;
    display: flex;
    flex-direction: column;
  }
  
  .request-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  }
  
  .request-card.pending_financial {
    border-top: 4px solid #f39c12;
  }
  
  .request-card.rejected_by_review{
    border-top: 4px solid #ff9800;
  }
  
  .request-card.financial_approved {
    border-top: 4px solid #2ecc71;
  }
  
  .request-card.financial_rejected {
    border-top: 4px solid #e74c3c;
  }
  
  .request-card.completed {
    border-top: 4px solid #2ecc71;
  }
  
  .request-card.appeal_submitted {
    border-top: 4px solid #ff9800;
  }
  
  .card-header {
    padding: 15px;
    background: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
  }
  
  .card-header h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #212529;
  }
  
  .plate {
    display: inline-block;
    margin-top: 5px;
    padding: 3px 8px;
    background: #e9ecef;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 500;
  }
  
  .card-body {
    padding: 15px;
    flex-grow: 1;
  }
  
  .card-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    font-size: 0.9rem;
  }
  
  .card-row:last-child {
    margin-bottom: 0;
  }
  
  .label {
    color: #6c757d;
    font-weight: 500;
  }
  
  .value {
    color: #495057;
    text-align: left;
    max-width: 60%;
  }
  
  .status-badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
  }
  
  .status-badge.pending_financial {
    background: #fff3cd;
    color: #856404;
  }
  
  .status-badge.rejected_by_review {
    background: #fff3e0;
    color: #e65100;
  }
  
  .status-badge.financial_approved {
    background: #d4edda;
    color: #155724;
  }
  
  .status-badge.financial_rejected {
    background: #f8d7da;
    color: #721c24;
  }
  
  .status-badge.completed {
    background: #d4edda;
    color: #155724;
  }
  
  .status-badge.appeal_submitted {
    background: #fff3e0;
    color: #e65100;
  }
  
  .card-footer {
    padding: 15px;
    border-top: 1px solid #e9ecef;
    text-align: center;
  }
  
  .card-footer button {
    padding: 8px 16px;
    background: #4361EE;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.85rem;
    transition: all 0.2s;
  }
  
  .card-footer button:hover {
    background: #3a56d4;
    transform: translateY(-1px);
  }
  
  /* Popup Styles */
  .popup-overlay {
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
    backdrop-filter: blur(5px);
  }
  
  .popup-content {
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    max-width: 900px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .popup-content.small {
    max-width: 500px;
  }
  
  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 18px 25px;
    background: #4361EE;
    color: white;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    position: sticky;
    top: 0;
    z-index: 10;
  }
  
  .popup-header h2, .popup-header h3 {
    margin: 0;
    font-size: 1.3rem;
  }
  
  .popup-close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: white;
    padding: 0;
    line-height: 1;
  }
  
  .popup-body {
    padding: 25px;
  }
  
  .details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
  }
  
  .detail-card {
    background: #fff;
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.05);
    border: 1px solid #e9ecef;
  }
  
  .detail-card.full-width {
    grid-column: 1 / -1;
  }
  
  .detail-card h3 {
    margin-top: 0;
    margin-bottom: 15px;
    color: #4361EE;
    font-size: 1.1rem;
    border-bottom: 1px solid #e9ecef;
    padding-bottom: 10px;
  }
  
  .info-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    font-size: 0.9rem;
  }
  
  .info-item .label {
    color: #6c757d;
    font-weight: 500;
  }
  
  .info-item .value {
    color: #495057;
    text-align: left;
    max-width: 60%;
  }
  
  .items-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 15px;
  }
  
  .item-card {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 15px;
    border-left: 4px solid #4361EE;
  }
  
  .item-name {
    font-weight: 600;
    margin-bottom: 8px;
    color: #212529;
  }
  
  .item-description {
    font-size: 0.85rem;
    color: #6c757d;
    margin-bottom: 8px;
  }
  
  .item-details {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    font-size: 0.8rem;
    color: #495057;
    margin-bottom: 8px;
  }
  
  .item-status {
    font-size: 0.75rem;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: 12px;
    display: inline-block;
  }
  
  .item-status.approved {
    background: #d4edda;
    color: #155724;
  }
  
  .item-status.pending {
    background: #fff3cd;
    color: #856404;
  }
  
  .detail-card.total-cost {
    text-align: center;
    background: #f1f3ff;
    border-color: #4361EE;
  }
  
  .cost-amount {
    font-size: 1.5rem;
    font-weight: 700;
    color: #4361EE;
    margin: 10px 0;
  }
  
  .timeline {
    position: relative;
    padding-left: 20px;
  }
  
  .timeline::before {
    content: '';
    position: absolute;
    left: 6px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #e9ecef;
  }
  
  .timeline-item {
    position: relative;
    padding-bottom: 20px;
  }
  
  .timeline-item:last-child {
    padding-bottom: 0;
  }
  
  .timeline-item::before {
    content: '';
    position: absolute;
    left: -20px;
    top: 0;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #4361EE;
    border: 2px solid white;
  }
  
  .timeline-date {
    font-size: 0.8rem;
    color: #6c757d;
    margin-bottom: 5px;
  }
  
  .timeline-action {
    font-weight: 600;
    color: #212529;
    margin-bottom: 3px;
  }
  
  .timeline-by {
    font-size: 0.8rem;
    color: #6c757d;
    margin-bottom: 5px;
  }
  
  .timeline-notes {
    font-size: 0.85rem;
    color: #495057;
    background: #f8f9fa;
    padding: 8px;
    border-radius: 6px;
  }
  
  .finance-form {
    margin-top: 20px;
  }
  
  textarea {
    width: 100%;
    padding: 15px;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    min-height: 100px;
    margin-bottom: 20px;
    font-family: inherit;
    resize: vertical;
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
  
  button {
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
    font-size: 0.9rem;
  }
  
  button.approve {
    background: #4CAF50;
    color: white;
  }
  
  button.reject {
    background: #f44336;
    color: white;
  }
  
  button.appeal {
    background: #ff9800;
    color: white;
  }
  
  button.submit {
    background: #4361EE;
    color: white;
  }
  
  button.cancel {
    background: #6c757d;
    color: white;
  }
  button:hover {
    opacity: 0.9;
    transform: translateY(-2px);
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  }

  .no-items {
    text-align: center;
    padding: 15px;
    color: #6c757d;
    background: #f8f9fa;
    border-radius: 6px;
  }
  
  @media (max-width: 768px) {
    .cards-grid {
      grid-template-columns: 1fr;
    }
    
    .popup-content {
      width: 95%;
    }
    
    .form-actions {
      flex-direction: column;
    }
    
    button {
      width: 100%;
      margin-bottom: 10px;
    }
    
    button:last-child {
      margin-bottom: 0;
    }
    
    .date-filters {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>

