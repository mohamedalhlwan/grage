<script>
  import { onMount } from "svelte";
  
  // البيانات والمتغيرات
  let maintenanceRequests = [];
  let selectedRequest = null;
  let showResponseForm = false;
  let responseType = ''; // 'approve', 'reject', 'appeal', 'new_appeal', 'accept_modified', 'reject_modified'
  let responseReason = '';
  let activeTab = 'pending_review';
  let showDetailsPopup = false;
  let appealFilter = 'all'; // 'all', 'pending_review', 'pending_financial', 'rejected', 'completed'
  
  // جلب البيانات من localStorage عند التحميل
  onMount(() => {
    const storedRequests = localStorage.getItem('maintenanceRequests');
    if (storedRequests) {
      maintenanceRequests = JSON.parse(storedRequests);
    }
  });
  
  // تصفية الطلبات المعترض عليها
  $: appealedRequests = maintenanceRequests.filter(req => 
    req.status === 'appeal_submitted' || 
    (req.appeal && req.appeal.status === 'pending')
  );

  // تصفية الطلبات حسب التبويب المحدد
 $: filteredRequests = maintenanceRequests.filter(req => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending_review') return req.status === 'pending_review';
    if (activeTab === 'approved') return req.status === 'pending_financial' || req.status === 'financial_approved';
    if (activeTab === 'rejected_by_review') return req.status === 'rejected_by_review';
    if (activeTab === 'rejected_by_finance') return req.status === 'financial_rejected';
    if (activeTab === 'completed') return req.status === 'completed';
    if (activeTab === 'appeals') return req.status === 'appeal_submitted';
    return true;
});

  // حساب التكلفة الإجمالية للطلب
  $: calculateTotalCost = (request) => {
    const partsCost = request.parts?.reduce((sum, part) => sum + (part.price * part.quantity), 0) || 0;
    const servicesCost = request.services?.reduce((sum, service) => sum + service.price, 0) || 0;
    return partsCost + servicesCost;
  };

  // عرض تفاصيل الطلب
  function viewRequestDetails(request) {
    selectedRequest = request;
    showDetailsPopup = true;
    resetResponseForm();
  }

  // إغلاق نافذة التفاصيل
  function closeDetailsPopup() {
    showDetailsPopup = false;
    selectedRequest = null;
    resetResponseForm();
  }

  // إعادة تعيين نموذج الرد
  function resetResponseForm() {
    showResponseForm = false;
    responseType = '';
    responseReason = '';
  }

  // عرض نموذج الرد
  function showResponseDialog(type) {
    responseType = type;
    showResponseForm = true;
  }

  // إرسال الرد
  function submitResponse() {
    if (!responseReason && responseType !== 'approve' && responseType !== 'accept_modified') {
      alert('يرجى إضافة السبب');
      return;
    }
    
    const actionMap = {
      'approve': {
        status: 'pending_financial',
        action: 'approved_for_finance',
        alert: 'تم إرسال الطلب للقسم المالي للموافقة'
      },
      'reject': {
        status: 'rejected_by_review',
        action: 'rejected_by_review',
        alert: 'تم رفض الطلب وإعادته لشركة الصيانة'
      },
      'appeal': {
        status: 'appeal_submitted',
        action: 'appeal_submitted',
        alert: 'تم تقديم الاعتراض بنجاح وإرساله لشركة الصيانة'
      },
      'new_appeal': {
        status: 'appeal_submitted',
        action: 'new_appeal_submitted',
        alert: 'تم تقديم اعتراض جديد على التعديلات'
      },
      'accept_modified': {
        status: 'pending_review',
        action: 'modified_request_accepted',
        alert: 'تم قبول التعديلات وإرسال الطلب للمراجعة'
      },
      'reject_modified': {
        status: 'appeal_submitted',
        action: 'modified_request_rejected',
        alert: 'تم رفض التعديلات وإعادة الطلب لشركة الصيانة'
      }
    };
    
    const { status, action, alert } = actionMap[responseType];
    
    if (responseType === 'appeal' || responseType === 'new_appeal') {
      selectedRequest.appeal = {
        reason: responseReason,
        date: new Date().toISOString(),
        status: 'pending',
        by: 'الجراج',
        sentTo: 'شركة الصيانة'
      };
    } else if (responseType === 'reject' || responseType === 'reject_modified') {
      selectedRequest.rejectionReason = responseReason;
    } else if (responseType === 'approve' || responseType === 'accept_modified') {
      selectedRequest.reviewNotes = responseReason || 'تم القبول بدون ملاحظات';
    }
    
    selectedRequest.status = status;
    selectedRequest.history = selectedRequest.history || [];
    selectedRequest.history.push({
      action,
      date: new Date().toISOString(),
      by: 'الجراج',
      reason: responseType !== 'approve' && responseType !== 'accept_modified' ? responseReason : null,
      notes: (responseType === 'approve' || responseType === 'accept_modified') ? responseReason : null
    });
    
    saveRequests();
    alert(alert);
    closeDetailsPopup();
  }

  // حفظ البيانات في localStorage
  function saveRequests() {
    localStorage.setItem('maintenanceRequests', JSON.stringify(maintenanceRequests));
  }
</script>

<div class="header-top">
    <h2 class="h-2">مراجعة طلبات الصيانه</h2>
    <p>مراجعه طلبات الصيانه للموافقه الموافقه اوالرفض او التعديل</p>
</div>

<div class="review-page">
  <!-- تبويبات التصنيف -->
  <div class="tabs">
    <button class:active={activeTab === 'all'} on:click={() => activeTab = 'all'}>الكل</button>
    <button class:active={activeTab === 'pending_review'} on:click={() => activeTab = 'pending_review'}>بانتظار المراجعة</button>
    <button class:active={activeTab === 'approved'} on:click={() => activeTab = 'approved'}>مقبولة</button>
    <button class:active={activeTab === 'rejected_by_review'} on:click={() => activeTab = 'rejected_by_review'}>مرفوضة من المراجعة</button>
    <button class:active={activeTab === 'rejected_by_finance'} on:click={() => activeTab = 'rejected_by_finance'}>مرفوضة من المالية</button>
    <button class:active={activeTab === 'completed'} on:click={() => activeTab = 'completed'}>مكتملة</button>
    <button 
      class:active={activeTab === 'appeals'} 
      class:appealed-tab={activeTab === 'appeals' && appealedRequests.length > 0}
      on:click={() => { activeTab = 'appeals'; appealFilter = 'all'; }}>
      معترض عليها {#if appealedRequests.length > 0}({appealedRequests.length}){/if}
    </button>
  </div>
  
  <!-- تصفية الطلبات المعترض عليها -->
  {#if activeTab === 'appeals'}
    <div class="appeal-filters">
      <h3>تصفية الطلبات المعترض عليها:</h3>
      <div class="filter-options">
        <button class:active={appealFilter === 'all'} on:click={() => appealFilter = 'all'}>الكل</button>
        <button class:active={appealFilter === 'pending_review'} on:click={() => appealFilter = 'pending_review'}>بانتظار المراجعة</button>
        <button class:active={appealFilter === 'pending_financial'} on:click={() => appealFilter = 'pending_financial'}>بانتظار المالية</button>
        <button class:active={appealFilter === 'rejected'} on:click={() => appealFilter = 'rejected'}>مرفوضة</button>
        <button class:active={appealFilter === 'completed'} on:click={() => appealFilter = 'completed'}>مكتملة</button>
      </div>
    </div>
  {/if}
  
  <!-- قائمة الطلبات -->
  <div class="requests-list">
    <h2>
      {activeTab === 'pending_review' ? 'الطلبات المنتظرة للمراجعة' : 
       activeTab === 'approved' ? 'الطلبات المقبولة' : 
       activeTab === 'rejected_by_review' ? 'الطلبات المرفوضة من المراجعة' : 
       activeTab === 'financial_rejected' ? 'الطلبات المرفوضة من المالية' : 
       activeTab === 'completed' ? 'الطلبات المكتملة' : 
       activeTab === 'appeals' ? 'الطلبات المعترض عليها' :
       'جميع الطلبات'} 
      ({filteredRequests.length})
    </h2>
    
    {#if filteredRequests.length === 0}
      <p class="no-requests">لا توجد طلبات</p>
    {:else}
      <table>
        <thead>
          <tr>
            <th>السيارة</th>
            <th>اللوحة</th>
            <th>الحالة</th>
            <th>التكلفة</th>
            <th>الأدوات</th>
          </tr>
        </thead>
        <tbody>
          {#each filteredRequests as request}
            <tr class:appealed-row={request.status === 'appeal_submitted' || (request.appeal && request.appeal.status === 'pending')}>
              <td>{request.carModel}</td>
              <td> {request.plate.letters.join(' ')} {request.plate.numbers}</td>
              <td class="status-cell {request.status}">
                {request.status === 'pending_review' ? 'بانتظار المراجعة' : 
                 request.status === 'pending_financial' ? 'بانتظار المالية' : 
                 request.status === 'financial_approved' ? 'معتمدة مالياً' : 
                 request.status === 'rejected_by_review' ? 'مرفوضة من المراجعة' : 
                 request.status === 'financial_rejected' ? 'مرفوضة من المالية' : 
                 request.status === 'appeal_submitted' ? 'معترض عليها' :'مكتملة'}
              </td>
              <td>{calculateTotalCost(request)} ج.م</td>
              <td>
                <button on:click={() => viewRequestDetails(request)}>عرض التفاصيل</button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </div>
  
  <!-- نافذة تفاصيل الطلب -->
  {#if showDetailsPopup}
    <div class="popup-overlay" on:click|self={closeDetailsPopup}>
      <div class="popup-content large">
        <div class="popup-header">
          <h2>
            {selectedRequest.status === 'appeal_submitted' 
              ? 'طلب معترض عليه' 
              : 'تفاصيل الطلب'}: 
            {selectedRequest.carModel}
          </h2>
          <button class="popup-close-btn" on:click={closeDetailsPopup}>×</button>
        </div>
        
        <div class="popup-body">
          <!-- قسم معلومات الاعتراض -->
          {#if selectedRequest.status === 'appeal_submitted' && selectedRequest.appeal}
            <div class="appeal-section">
              <h3>تفاصيل الاعتراض</h3>
              <div class="info-item">
                <span class="label">سبب الاعتراض:</span>
                <span class="value">{selectedRequest.appeal.reason}</span>
              </div>
              <div class="info-item">
                <span class="label">تاريخ الاعتراض:</span>
                <span class="value">{new Date(selectedRequest.appeal.date).toLocaleString()}</span>
              </div>
              <div class="info-item">
                <span class="label">حالة الاعتراض:</span>
                <span class="value status-badge pending">قيد الانتظار</span>
              </div>
            </div>
          {/if}
          
          <div class="details-grid">
            <!-- قسم معلومات السيارة -->
            <div class="details-section car-info">
              <h3>معلومات السيارة</h3>
              <div class="info-item">
                <span class="label">اللوحة:</span>
                <span class="value">{selectedRequest.plate.numbers} {selectedRequest.plate.letters.join('')}</span>
              </div>
              <div class="info-item">
                <span class="label">الأعطال:</span>
                <span class="value">{selectedRequest.issues}</span>
              </div>
              <div class="info-item">
                <span class="label">ملاحظات الفني:</span>
                <span class="value">{selectedRequest.technicianNotes || 'لا توجد ملاحظات'}</span>
              </div>
              <div class="info-item">
                <span class="label">تاريخ التسليم المتوقع:</span>
                <span class="value">{selectedRequest.estimatedCompletionDate || 'غير محدد'}</span>
              </div>
              <div class="info-item">
                <span class="label">حالة الطلب:</span>
                <span class="value status-badge {selectedRequest.status}">
                  {selectedRequest.status === 'pending_review' ? 'بانتظار المراجعة' : 
                   selectedRequest.status === 'pending_financial' ? 'بانتظار المالية' : 
                   selectedRequest.status === 'financial_approved' ? 'معتمدة مالياً' : 
                   selectedRequest.status === 'rejected_by_review' ? 'مرفوضة من المراجعة' : 
                   selectedRequest.status === 'rejected_by_finance' ? 'مرفوضة من المالية' : 
                   selectedRequest.status === 'appeal_submitted' ? 'معترض عليها' :
                   'مكتملة'}
                </span>
              </div>
            </div>
            
            <!-- قسم التكلفة الإجمالية -->
            <div class="details-section total-cost">
              <h3>التكلفة الإجمالية</h3>
              <div class="cost-summary">
                <div class="cost-item">
                  <span class="label">قطع الغيار:</span>
                  <span class="value">{selectedRequest.parts?.reduce((sum, part) => sum + (part.price * part.quantity), 0) || 0} ج.م</span>
                </div>
                <div class="cost-item">
                  <span class="label">خدمات الصيانة:</span>
                  <span class="value">{selectedRequest.services?.reduce((sum, service) => sum + service.price, 0) || 0} ج.م</span>
                </div>
                <div class="cost-item total">
                  <span class="label">المجموع الكلي:</span>
                  <span class="value">{calculateTotalCost(selectedRequest)} ج.م</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- قسم قطع الغيار -->
          <div class="details-section parts-info">
            <h3>قطع الغيار المطلوبة</h3>
            {#if selectedRequest.parts?.length > 0}
              <table>
                <thead>
                  <tr>
                    <th>اسم القطعة</th>
                    <th>السعر</th>
                    <th>الكمية</th>
                    <th>المجموع</th>
                  </tr>
                </thead>
                <tbody>
                  {#each selectedRequest.parts as part}
                    <tr>
                      <td>{part.name}</td>
                      <td>{part.price} ج.م</td>
                      <td>{part.quantity}</td>
                      <td>{part.price * part.quantity} ج.م</td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            {:else}
              <p class="no-items">لا توجد قطع غيار مطلوبة</p>
            {/if}
          </div>
          
          <!-- قسم خدمات الصيانة -->
          <div class="details-section services-info">
            <h3>خدمات الصيانة المطلوبة</h3>
            {#if selectedRequest.services?.length > 0}
              <table>
                <thead>
                  <tr>
                    <th>اسم الخدمة</th>
                    <th>الوصف</th>
                    <th>السعر</th>
                  </tr>
                </thead>
                <tbody>
                  {#each selectedRequest.services as service}
                    <tr>
                      <td>{service.name}</td>
                      <td>{service.description || 'لا يوجد وصف'}</td>
                      <td>{service.price} ج.م</td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            {:else}
              <p class="no-items">لا توجد خدمات صيانة مطلوبة</p>
            {/if}
          </div>
          
          <!-- قسم الرد على الطلب -->
          <div class="response-section">
            {#if !showResponseForm}
              <div class="response-options">
                <h3>اختر نوع الرد:</h3>
                <div class="options-grid">
                  {#if selectedRequest.status === 'pending_review'}
                    <button on:click={() => showResponseDialog('approve')} class="approve">
                      <i class="icon">✓</i> 
                      <span>قبول الطلب</span>
                      <small>إرسال للقسم المالي</small>
                    </button>
                    <button on:click={() => showResponseDialog('reject')} class="reject">
                      <i class="icon">✗</i> 
                      <span>رفض الطلب</span>
                      <small>إعادته للصيانة</small>
                    </button>
                    <button on:click={() => showResponseDialog('appeal')} class="appeal">
                      <i class="icon">!</i> 
                      <span>تقديم اعتراض</span>
                      <small>إرساله لشركة الصيانة</small>
                    </button>
                  {:else if selectedRequest.status === 'appeal_submitted'}
                    <button on:click={() => showResponseDialog('approve')} class="approve">
                      <i class="icon">✓</i> 
                      <span>قبول الطلب</span>
                      <small>إرسال للقسم المالي</small>
                    </button>
                    <button on:click={() => showResponseDialog('reject')} class="reject">
                      <i class="icon">✗</i> 
                      <span>رفض الطلب</span>
                      <small>إعادته للصيانة</small>
                    </button>
                  {:else}
                    <p class="no-actions">لا تتوفر خيارات رد لهذا الطلب في حالته الحالية</p>
                  {/if}
                </div>
              </div>
            {:else}
              <div class="response-form">
                <h3>
                  {responseType === 'approve' ? 'قبول الطلب' : 
                   responseType === 'reject' ? 'رفض الطلب' : 
                   responseType === 'appeal' ? 'تقديم اعتراض' :
                   'الرد على الطلب'}
                </h3>
                
                <textarea 
                  bind:value={responseReason} 
                  placeholder={responseType === 'approve' ? 'ملاحظات (اختياري)...' : 'أدخل السبب...'}
                  autofocus
                ></textarea>
                
                <div class="form-actions">
                  <button on:click={submitResponse} class="submit">
                    {responseType === 'approve' ? 'تأكيد القبول' : 
                     responseType === 'reject' ? 'تأكيد الرفض' : 
                     responseType === 'appeal' ? 'إرسال الاعتراض' :
                     'إرسال الرد'}
                  </button>
                  <button on:click={() => showResponseForm = false} class="cancel">رجوع</button>
                </div>
              </div>
            {/if}
          </div>
          
          <!-- سجل الطلب -->
          <div class="history-section">
            <h3>سجل الطلب</h3>
            {#if selectedRequest.history?.length}
              <div class="timeline">
                {#each selectedRequest.history as event, index}
                  <div class="timeline-item {event.action}">
                    <div class="timeline-header">
                      <span class="event-date">{new Date(event.date).toLocaleString()}</span>
                      <span class="event-action">
                        {event.action === 'approved_for_finance' ? 'موافقة مراجعة' : 
                         event.action === 'rejected_by_review' ? 'رفض مراجعة' : 
                         event.action === 'rejected_by_finance' ? 'رفض مالية' : 
                         event.action === 'appeal_submitted' ? 'اعتراض مقدم' :
                         event.action}
                      </span>
                    </div>
                    <div class="timeline-content">
                      {#if event.reason || event.notes}
                        <p class="event-reason">{event.reason || event.notes}</p>
                      {/if}
                      <p class="event-by">بواسطة: {event.by}</p>
                    </div>
                  </div>
                {/each}
              </div>
            {:else}
              <p>لا يوجد سجل للطلب</p>
            {/if}
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  /* الأنماط العامة */
  :global(body) {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    margin: 0;
    padding: 0;
    background-color: #f5f7fa;
    color: #333;
  }
  .header-top{
    display: flex;
    width: 100%;
    align-items: flex-start;
    flex-direction: column;
    background-color: #4361EE;
    color: white;
    padding: 15px;
  }
  .header-top .h-2{
    color: white;
    border-bottom: 0px;
    margin: 0;
  }
  
  .review-page {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  h1, h2, h3 {
    color: #2c3e50;
  }
  
  h1 {
    text-align: center;
    margin-bottom: 30px;
    color: #3498db;
  }
  
  h2 {
    margin-top: 0;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
  }
  
  h3 {
    margin-top: 0;
    color: #3498db;
  }
  
  /* تبويبات التصنيف */
  .tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    flex-wrap: wrap;
    background: white;
    padding: 10px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }
  
  .tabs button {
    padding: 10px 15px;
    background: #ecf0f1;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s;
    font-weight: 500;
  }
  
  .tabs button.active {
    background: #4361EE;
    color: white;
  }
  
  .tabs button.appealed-tab {
    background: #FF5722;
    color: white;
    position: relative;
  }
  
  .tabs button.appealed-tab::after {
    content: '';
    position: absolute;
    top: -5px;
    right: -5px;
    width: 15px;
    height: 15px;
    background: #e74c3c;
    border-radius: 50%;
    border: 2px solid white;
  }
  
  .tabs button:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  }
  
  /* جدول الطلبات */
  .requests-list {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    margin-bottom: 30px;
  }
  
  .no-requests, .no-actions, .no-items {
    text-align: center;
    padding: 20px;
    color: #7f8c8d;
    background: #f8f9fa;
    border-radius: 6px;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 15px 0;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
  
  th, td {
    padding: 12px 15px;
    text-align: center;
    border-bottom: 1px solid #ecf0f1;
  }
  
  th {
    background: #4361EE;
    color: white;
    font-weight: 500;
    position: sticky;
    top: 0;
  }
  
  tr:hover {
    background-color: #f8f9fa;
  }
  
  tr.appealed-row {
    background-color: #FFF3E0;
  }
  
  tr.appealed-row:hover {
    background-color: #FFE0B2;
  }
  
  .status-cell {
    font-weight: 500;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 0.9em;
    text-align: center;
  }
  
  .status-cell.pending_review {
    background: #f39c12;
    color: white;
  }
  
  .status-cell.pending_financial {
    background: #4361EE;
    color: white;
  }
  
  .status-cell.financial_approved {
    background: #2ecc71;
    color: white;
  }
  
  .status-cell.rejected_by_review,
  .status-cell.financial_rejected {
    background: #cb1602;
    color: white;
  }
  
  .status-cell.completed {
    background: #27ae60;
    color: white;
  }
  
  .status-cell.appeal_submitted {
    background: #FF5722;
    color: white;
  }
  
  /* النوافذ المنبثقة */
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
    animation: fadeIn 0.3s;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  .popup-content {
    background: white;
    border-radius: 10px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.2);
    animation: slideUp 0.3s;
  }
  
  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  .popup-content.large {
    width: 90%;
    max-width: 900px;
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    background: #4361EE;
    color: white;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    position: sticky;
    top: 0;
    z-index: 10;
  }
  
  .popup-header h2 {
    margin: 0;
    font-size: 1.2em;
    color: white;
    border: none;
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
    padding: 20px;
  }
  
  /* تفاصيل الطلب */
  .details-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;
  }
  
  @media (max-width: 768px) {
    .details-grid {
      grid-template-columns: 1fr;
    }
  }
  
  .details-section {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
  }
  
  .info-item, .cost-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    padding-bottom: 10px;
    border-bottom: 1px dashed #ddd;
  }
  
  .info-item:last-child, .cost-item:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
  
  .cost-item.total {
    font-weight: bold;
    border-top: 1px solid #ddd;
    padding-top: 10px;
    margin-top: 10px;
  }
  
  .label {
    font-weight: 500;
    color: #7f8c8d;
  }
  
  .value {
    color: #2c3e50;
  }
  
  .status-badge {
    display: inline-block;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 0.9em;
    font-weight: 500;
  }
  
  .status-badge.pending_review {
    background: #f39c12;
    color: white;
  }
  
  .status-badge.pending_financial {
    background: #4361EE;
    color: white;
  }
  
  .status-badge.financial_approved {
    background: #2ecc71;
    color: white;
  }
  
  .status-badge.rejected_by_review,
  .status-badge.rejected_by_finance {
    background: #e74c3c;
    color: white;
  }
  
  .status-badge.completed {
    background: #27ae60;
    color: white;
  }
  
  .status-badge.pending {
    background: #f39c12;
    color: white;
  }
  
  /* قسم الاعتراض */
  .appeal-section {
    background-color: #FFF3E0;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
    border-left: 4px solid #FF9800;
  }
  
  .appeal-section h3 {
    color: #FF5722;
    margin-top: 0;
  }
  
  /* تصفية الطلبات المعترض عليها */
  .appeal-filters {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
  }

  .appeal-filters h3 {
    margin-top: 0;
    margin-bottom: 10px;
    color: #2c3e50;
  }

  .filter-options {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .filter-options button {
    padding: 8px 15px;
    background: #ecf0f1;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s;
  }

  .filter-options button.active {
    background: #FF5722;
    color: white;
  }

  .filter-options button:hover {
    background: #e0e0e0;
  }
  
  /* قسم الرد على الطلب */
  .response-section {
    margin-top: 25px;
    padding-top: 20px;
    border-top: 1px solid #eee;
  }
  
  .response-options h3 {
    margin-bottom: 15px;
    color: #2c3e50;
  }
  
  .options-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 15px;
  }
  
  .response-options button {
    padding: 20px;
    border-radius: 8px;
    font-weight: bold;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.3s;
    border: none;
    cursor: pointer;
    text-align: center;
  }
  
  .response-options button:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 10px rgba(0,0,0,0.1);
  }
  
  .response-options button i.icon {
    font-size: 28px;
    margin-bottom: 5px;
  }
  
  .response-options button span {
    font-size: 1.1em;
  }
  
  .response-options button small {
    font-weight: normal;
    font-size: 0.8em;
    opacity: 0.8;
  }
  
  .response-options button.approve {
    background: #2ecc71;
    color: white;
  }
  
  .response-options button.reject {
    background: #e74c3c;
    color: white;
  }
  
  .response-options button.appeal {
    background: #f39c12;
    color: white;
  }
  
  .response-form {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    border: 1px solid #eee;
  }
  
  .response-form h3 {
    margin-top: 0;
    margin-bottom: 15px;
  }
  
  .response-form textarea {
    width: 100%;
    min-height: 120px;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    margin: 15px 0;
    font-family: inherit;
    resize: vertical;
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
  
  .form-actions button {
    padding: 10px 20px;
    border-radius: 6px;
    font-weight: 500;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .form-actions button.submit {
    background: #4361EE;
    color: white;
  }
  
  .form-actions button.submit:hover {
    background: #4361EE;
  }
  
  .form-actions button.cancel {
    background: #95a5a6;
    color: white;
  }
  
  .form-actions button.cancel:hover {
    background: #7f8c8d;
  }
  
  /* سجل الطلب */
  .history-section {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #eee;
  }
  
  .timeline {
    position: relative;
    padding-left: 20px;
  }
  
  .timeline::before {
    content: '';
    position: absolute;
    left: 7px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #4361EE;
  }
  
  .timeline-item {
    position: relative;
    padding-bottom: 20px;
    margin-bottom: 20px;
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
  
  .timeline-item.approved_for_finance::before {
    background: #2ecc71;
  }
  
  .timeline-item.rejected_by_review::before,
  .timeline-item.rejected_by_finance::before {
    background: #e74c3c;
  }
  
  .timeline-item.appeal_submitted::before {
    background: #f39c12;
  }
  
  .timeline-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .event-date {
    color: #7f8c8d;
    font-size: 0.9em;
  }
  
  .event-action {
    font-weight: 500;
    color: #2c3e50;
  }
  
  .timeline-content {
    background: #f8f9fa;
    padding: 10px 15px;
    border-radius: 6px;
  }
  
  .event-reason {
    margin: 5px 0;
    color: #34495e;
  }
  
  .event-by {
    font-size: 0.9em;
    color: #7f8c8d;
    text-align: left;
  }
  
  /* الأزرار العامة */
  button {
    padding: 8px 16px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 500;
  }
  
  button:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
  
  /* التكيف مع الشاشات الصغيرة */
  @media (max-width: 600px) {
    .popup-content.large {
      width: 95%;
    }
    
    .details-grid {
      grid-template-columns: 1fr;
    }
    
    .options-grid {
      grid-template-columns: 1fr;
    }
    
    th, td {
      padding: 8px 10px;
      font-size: 0.9em;
    }
  }
</style>