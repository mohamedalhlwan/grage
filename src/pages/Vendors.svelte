<script>
  import { onMount } from "svelte";
  
  let maintenanceRequests = [];
  let spareParts = [];
  let maintenanceServices = [];
  let selectedRequest = null;
  let showPartsForm = false;
  let showServiceForm = false;
  let showServiceManagement = false;
  let showNewServiceForm = false;
  let selectedPart = '';
  let selectedQuantity = 1;
  let servicePrice = '';
  let serviceDescription = '';
  let technicianNotes = '';
  let estimatedCompletionDate = '';
  let activeTab = 'new';
  let showHistory = false;
  
  // متغيرات الرفض والملاحظات
  let rejectionReason = '';
  let showRejectionDialog = false;
  let rejectionType = ''; // 'review' أو 'finance'
  
  // متغيرات القطعة الجديدة
  let showNewPartForm = false;
  let newPartName = '';
  let newPartCode = '';
  let newPartPrice = '';
  let newPartWarranty = '0';
  let newPartSupplier = '';
  
  // متغيرات الخدمة الجديدة
  let editingService = null;
  let newServiceName = '';
  let newServicePrice = '';
  let newServiceDescription = '';
  
  // جلب البيانات من localStorage
  onMount(() => {
    const storedRequests = localStorage.getItem('maintenanceRequests');
    if (storedRequests) {
      maintenanceRequests = JSON.parse(storedRequests);
    }
    
    const storedSpareParts = localStorage.getItem('spareParts');
    if (storedSpareParts) {
      spareParts = JSON.parse(storedSpareParts);
    } else {
      // بيانات افتراضية لقطع الغيار مع كود وضمان
      spareParts = [
        { id: 1, code: 'FLT-001', name: 'فلتر هواء', price: 500, warranty: 2, supplier: 'المورد العام' },
        { id: 2, code: 'OIL-002', name: 'زيت محرك', price: 650, warranty: 1, supplier: 'شركة الزيوت' },
        { id: 3, code: 'SPK-003', name: 'بوجيهات', price: 900, warranty: 3, supplier: 'شركة الكهربائيات' },
        { id: 4, code: 'BRK-004', name: 'فرامل', price: 1200, warranty: 3, supplier: 'المورد العام' },
        { id: 5, code: 'BAT-005', name: 'بطارية', price: 1800, warranty: 3, supplier: 'شركة الطاقة' },
        { id: 6, code: 'TYR-006', name: 'إطارات', price: 2500, warranty: 3, supplier: 'شركة الإطارات' },
        { id: 7, code: 'SHK-007', name: 'مساعدات', price: 3800, warranty: 2, supplier: 'المورد العام' },
        { id: 8, code: 'ALT-008', name: 'دينمو', price: 3000, warranty: 3, supplier: 'شركة الكهربائيات' }
      ];
      localStorage.setItem('spareParts', JSON.stringify(spareParts));
    }
    
    const storedServices = localStorage.getItem('maintenanceServices');
    if (storedServices) {
      maintenanceServices = JSON.parse(storedServices);
    } else {
      // بيانات افتراضية لخدمات الصيانة
      maintenanceServices = [
        { id: 1, name: 'فحص شامل', price: 300, description: 'فحص شامل للسيارة' },
        { id: 2, name: 'تغيير زيت', price: 200, description: 'تغيير زيت المحرك' },
        { id: 3, name: 'تنظيف فلتر', price: 150, description: 'تنظيف فلتر الهواء' },
        { id: 4, name: 'ضبط فرامل', price: 400, description: 'فحص وضبط نظام الفرامل' }
      ];
      localStorage.setItem('maintenanceServices', JSON.stringify(maintenanceServices));
    }
  });
  
  function viewRequestDetails(request) {
    selectedRequest = request;
    technicianNotes = request.technicianNotes || '';
    estimatedCompletionDate = request.estimatedCompletionDate || '';
    
    // التأكد من وجود مصفوفة الخدمات
    if (!selectedRequest.services) {
      selectedRequest.services = [];
    }
  }
  
  function closeDetails() {
    selectedRequest = null;
    showPartsForm = false;
    showServiceForm = false;
  }
  
  function addSparePart() {
    if (!selectedPart) {
      alert('يرجى اختيار قطعة الغيار');
      return;
    }
    
    const part = spareParts.find(p => p.id == selectedPart);
    if (!part) return;
    
    if (selectedRequest.status !== 'pending' && selectedRequest.status !== 'appeal_submitted') {
      alert('يمكن إضافة قطع الغيار للطلبات الجديدة أو المعترض عليها فقط');
      return;
    }
    
    const existingPart = selectedRequest.parts?.find(p => p.id == part.id);
    
    if (existingPart) {
      existingPart.quantity += parseInt(selectedQuantity);
    } else {
      selectedRequest.parts = [...(selectedRequest.parts || []), {
        ...part,
        quantity: parseInt(selectedQuantity),
        approved: false
      }];
    }
    
    saveRequests();
    
    selectedPart = '';
    selectedQuantity = 1;
    showPartsForm = false;
  }
  
  function addService() {
    if (!newServiceName) {
      alert('يرجى إدخال اسم الخدمة');
      return;
    }
    
    if (!newServicePrice) {
      alert('يرجى إدخال سعر الخدمة');
      return;
    }
    
    if (selectedRequest.status !== 'pending' && selectedRequest.status !== 'appeal_submitted') {
      alert('يمكن إضافة خدمات للطلبات الجديدة أو المعترض عليها فقط');
      return;
    }
    
    const serviceToAdd = {
      id: Date.now(), // استخدام timestamp كمعرف مؤقت
      name: newServiceName,
      price: parseInt(newServicePrice),
      description: serviceDescription,
      customPrice: true,
      isManual: true
    };
    
    selectedRequest.services = [...(selectedRequest.services || []), serviceToAdd];
    
    saveRequests();
    
    // إعادة تعيين الحقول
    newServiceName = '';
    newServicePrice = '';
    serviceDescription = '';
    showServiceForm = false;
  }
  
  function removePart(partId) {
    selectedRequest.parts = selectedRequest.parts?.filter(p => p.id !== partId) || [];
    saveRequests();
  }
  
  function removeService(serviceId) {
    selectedRequest.services = selectedRequest.services?.filter(s => s.id !== serviceId) || [];
    saveRequests();
  }

  function updateRequestStatus(request, status, rejectionReason = '', rejectedBy = '') {
    request.status = status;
    
    if (status === 'rejected_by_review') {
        request.rejectionReason = rejectionReason;
        request.rejectedBy = rejectedBy || 'المراجعة الفنية';
        request.rejectionDate = new Date().toISOString();
    } else if (status === 'financial_rejected') {
        request.financialRejection = {
            reason: rejectionReason,
            date: new Date().toISOString(),
            by: rejectedBy || 'المالية'
        };
    }
    
    request.history = [...(request.history || []), {
        action: status,
        date: new Date().toISOString(),
        by: rejectedBy || 'النظام',
        ...(rejectionReason && { rejectionReason }),
        notes: technicianNotes
    }];
    
    saveRequests();
}
  function openRejectionDialog(type) {
    rejectionType = type;
    rejectionReason = '';
    showRejectionDialog = true;
  }

  function submitRejection() {
    if (!rejectionReason) {
      alert('يرجى إدخال سبب الرفض');
      return;
    }

    const rejector = rejectionType === 'review' ? 'المراجعة الفنية' : 'المالية';
    updateRequestStatus(
      selectedRequest, 
      rejectionType === 'review' ? 'rejected_by_review' : 'financial_rejected',
      rejectionReason,
      rejector
    );

    showRejectionDialog = false;
    alert('تم رفض الطلب بنجاح');
    closeDetails();
  }
  
  function approveFinancially() {
    if (confirm('هل أنت متأكد من الموافقة المالية على هذا الطلب؟')) {
      updateRequestStatus(selectedRequest, 'financial_approved');
      alert('تمت الموافقة المالية بنجاح');
      closeDetails();
    }
  }
  
  function sendForReview() {
    if (!selectedRequest.parts?.length && !selectedRequest.services?.length) {
      alert('يجب إضافة قطع الغيار أو خدمات الصيانة أولاً');
      return;
    }
    
    if (!technicianNotes) {
      alert('يرجى إضافة ملاحظات الفني');
      return;
    }
    
    selectedRequest.technicianNotes = technicianNotes;
    selectedRequest.estimatedCompletionDate = estimatedCompletionDate;
    
    // إذا كان الطلب معترض عليه، نغير حالته إلى pending_review بعد التعديل
    const newStatus = selectedRequest.status === 'appeal_submitted' ? 'pending_review' : 'pending_review';
    
    updateRequestStatus(selectedRequest, newStatus);
    
    technicianNotes = '';
    estimatedCompletionDate = '';
    alert('تم إرسال الطلب للمراجعة بنجاح');
    closeDetails();
  }
  
  function completeRequest() {
    if (confirm('هل أنت متأكد من اكتمال الصيانة؟')) {
      updateRequestStatus(selectedRequest, 'completed');
      alert('تم تسليم السيارة للعميل بنجاح');
      closeDetails();
    }
  }
  
  function saveRequests() {
    localStorage.setItem('maintenanceRequests', JSON.stringify(maintenanceRequests));
    localStorage.setItem('spareParts', JSON.stringify(spareParts));
    localStorage.setItem('maintenanceServices', JSON.stringify(maintenanceServices));
  }
  
  function validatePartCode(code) {
    return !spareParts.some(part => part.code === code);
  }
  
  function validateServiceName(name) {
    return !maintenanceServices.some(service => service.name === name && service.id !== editingService?.id);
  }
  
  function saveService() {
    if (!newServiceName) {
      alert('يرجى إدخال اسم الخدمة');
      return;
    }
    
    if (!validateServiceName(newServiceName)) {
      alert('اسم الخدمة موجود مسبقاً');
      return;
    }
    
    if (!newServicePrice) {
      alert('يرجى إدخال سعر الخدمة');
      return;
    }
    
    if (editingService) {
      // تعديل الخدمة الحالية
      const index = maintenanceServices.findIndex(s => s.id === editingService.id);
      if (index !== -1) {
        maintenanceServices[index] = {
          ...maintenanceServices[index],
          name: newServiceName,
          price: parseInt(newServicePrice),
          description: newServiceDescription
        };
      }
    } else {
      // إضافة خدمة جديدة
      const newService = {
        id: maintenanceServices.length > 0 ? Math.max(...maintenanceServices.map(s => s.id)) + 1 : 1,
        name: newServiceName,
        price: parseInt(newServicePrice),
        description: newServiceDescription
      };
      maintenanceServices = [...maintenanceServices, newService];
    }
    
    saveRequests();
    resetServiceForm();
    showNewServiceForm = false;
    editingService = null;
    alert(editingService ? 'تم تعديل الخدمة بنجاح' : 'تمت إضافة الخدمة بنجاح');
  }
  
  function editService(service) {
    editingService = service;
    newServiceName = service.name;
    newServicePrice = service.price;
    newServiceDescription = service.description;
    showNewServiceForm = true;
  }
  
  function deleteService(serviceId) {
    if (confirm('هل أنت متأكد من حذف هذه الخدمة؟')) {
      maintenanceServices = maintenanceServices.filter(s => s.id !== serviceId);
      saveRequests();
      alert('تم حذف الخدمة بنجاح');
    }
  }
  
  function resetServiceForm() {
    newServiceName = '';
    newServicePrice = '';
    newServiceDescription = '';
  }
  
  $: warrantyOptions = [
    { value: '0', label: 'بدون ضمان' },
    { value: '1', label: '3 أشهر ضمان' },
    { value: '2', label: '6 أشهر ضمان' },
    { value: '3', label: 'سنة واحدة ضمان' }
  ];
  
  $: filteredRequests = maintenanceRequests.filter(req => {
    if (activeTab === 'all') return true;
    if (activeTab === 'new') return req.status === 'pending';
    if (activeTab === 'in-progress') return req.status === 'under_maintenance';
    if (activeTab === 'approved') return req.status === 'financial_approved';
    if (activeTab === 'completed') return req.status === 'completed';
    if (activeTab === 'review') return req.status === 'pending_review';
    if (activeTab === 'finance') return req.status === 'pending_financial' || req.status === 'financial_rejected';
    if (activeTab === 'rejected') return req.status === 'rejected_by_review' || req.status === 'financial_rejected';
    if (activeTab === 'appeals') return req.status === 'appeal_submitted';
    return true;
  });
  
  $: totalCost = selectedRequest ? 
    (selectedRequest.parts?.reduce((sum, part) => sum + (part.price * part.quantity), 0) || 0) +
    (selectedRequest.services?.reduce((sum, service) => sum + service.price, 0) || 0) : 0;
  
  $: showSendButton = selectedRequest && 
    (selectedRequest.status === 'pending' || selectedRequest.status === 'appeal_submitted') && 
    (selectedRequest.parts?.length > 0 || selectedRequest.services?.length > 0);
  
  $: showAppealDetails = selectedRequest && selectedRequest.appeal;
  $: showFinanceRejection = selectedRequest && selectedRequest.financeRejection;
  $: showReviewRejection = selectedRequest && selectedRequest.reviewRejection;
</script>

<div class="header-top">
  <h1>شركة الصيانة</h1>
  <p>إدارة طلبات الصيانه والموافقه عليها</p>
</div>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@100..900&family=Rakkas&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&family=Rubik:ital,wght@0,300..900;1,300..900&display=swap" rel="stylesheet">

<div class="maintenance-company">
  <div class="tabs">
    <button class:active={activeTab === 'all'} on:click={() => activeTab = 'all'}>الكل</button>
    <button class:active={activeTab === 'new'} on:click={() => activeTab = 'new'}>طلبات جديدة</button>
    <button class:active={activeTab === 'in-progress'} on:click={() => activeTab = 'in-progress'}>قيد الصيانة</button>
    <button class:active={activeTab === 'review'} on:click={() => activeTab = 'review'}>قيد المراجعة</button>
    <button class:active={activeTab === 'finance'} on:click={() => activeTab = 'finance'}>قيد الموافقة المالية</button>
    <button class:active={activeTab === 'approved'} on:click={() => activeTab = 'approved'}>معتمدة للتنفيذ</button>
    <button class:active={activeTab === 'completed'} on:click={() => activeTab = 'completed'}>مكتملة</button>
    <button class:active={activeTab === 'rejected'} on:click={() => activeTab = 'rejected'}>مرفوضة</button>
    <button class:active={activeTab === 'appeals'} on:click={() => activeTab = 'appeals'}>معترض عليها</button>
  </div>
  
  <div class="requests-count">
    <span>عدد الطلبات: {filteredRequests.length}</span>
  </div>
  
  <div class="requests-section">
    {#if filteredRequests.length === 0}
      <p class="no-requests">لا توجد طلبات</p>
    {:else}
      <div class="requests-grid">
        {#each filteredRequests as request}
          <div class="request-card {request.status}">
            <div class="status-badge">
              {request.status === 'pending' ? 'جديد' : 
               request.status === 'under_maintenance' ? 'قيد الصيانة' : 
               request.status === 'pending_review' ? 'قيد المراجعة' : 
               request.status === 'pending_financial' ? 'قيد الموافقة المالية' : 
               request.status === 'financial_approved' ? 'معتمد للتنفيذ' : 
               request.status === 'rejected_by_review' ? 'مرفوض (جراج)' :
               request.status === 'appeal_submitted' ? 'معترض عليه' :
               request.status === 'financial_rejected' ? 'مرفوض (مالية)' :
               'مكتمل'}
            </div>
            
            <h3>{request.carModel}</h3>
            <p>اللوحة: {request.plate.numbers} {request.plate.letters.join('')}</p>
            <p>الأعطال: {request.issues}</p>
            
            {#if request.status === 'pending' || request.status === 'appeal_submitted'}
              <button on:click={() => viewRequestDetails(request)}>
                {request.status === 'appeal_submitted' ? 'تعديل الطلب' : 'إدارة الطلب'}
              </button>
            {:else if request.status === 'under_maintenance'}
              <button on:click={() => viewRequestDetails(request)}>
                إدارة الطلب
              </button>
            {:else if request.status === 'financial_approved'}
              <button on:click={() => viewRequestDetails(request)}>
                تنفيذ الصيانة
              </button>
            {:else if request.status === 'rejected_by_review' || request.status === 'finance_rejected'}
              <button on:click={() => viewRequestDetails(request)}>
                {request.status === 'financial_rejected' ? 'عرض الرفض' : 'مراجعة الطلب'}
              </button>
            {:else}
              <button on:click={() => viewRequestDetails(request)}>
                عرض التفاصيل
              </button>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>
  
  {#if selectedRequest}
    <div class="popup-overlay" on:click|self={closeDetails}>
      <div class="popup-content">
        <div class="popup-header">
          <h2>تفاصيل طلب الصيانة: {selectedRequest.carModel}</h2>
          <button class="popup-close-btn" on:click={closeDetails}>×</button>
        </div>
        
        <div class="popup-body">
          <div class="car-info">
            <h3>معلومات السيارة</h3>
            <p><strong>اللوحة:</strong> {selectedRequest.plate.numbers} {selectedRequest.plate.letters.join('')}</p>
            <p><strong>الأعطال:</strong> {selectedRequest.issues}</p>
            <p><strong>الأولوية:</strong> {selectedRequest.priority === 'high' ? 'عاجلة' : selectedRequest.priority === 'medium' ? 'متوسطة' : 'منخفضة'}</p>
            <p><strong>حالة الطلب:</strong> 
                {selectedRequest.status === 'pending' ? 'في الانتظار' : 
                selectedRequest.status === 'under_maintenance' ? 'قيد الصيانة' : 
                selectedRequest.status === 'pending_review' ? 'بانتظار المراجعة' : 
                selectedRequest.status === 'pending_financial' ? 'بانتظار الموافقة المالية' : 
                selectedRequest.status === 'financial_approved' ? 'معتمد مالياً' : 
                selectedRequest.status === 'rejected_by_review' ? 'مرفوض (مراجعة)' :
                selectedRequest.status === 'appeal_submitted' ? 'معترض عليه' :
                selectedRequest.status === 'financial_rejected' ? 'مرفوض (مالية)' :
                'مكتمل'}
            </p>
          </div>
          
        <!-- استبدال هذا القسم -->
{#if selectedRequest.status === 'rejected_by_review' || selectedRequest.status === 'financial_rejected'}
    <div class="rejection-details">
        <h3>تفاصيل الرفض</h3>
        <p><strong>سبب الرفض:</strong> {selectedRequest.rejectionReason || selectedRequest.financialRejection?.reason || 'لا يوجد سبب محدد'}</p>
        {#if selectedRequest.rejectedBy || selectedRequest.financialRejection?.by}
            <p><strong>بواسطة:</strong> {selectedRequest.rejectedBy || selectedRequest.financialRejection?.by}</p>
        {/if}
        {#if selectedRequest.rejectionDate || selectedRequest.financialRejection?.date}
            <p><strong>تاريخ الرفض:</strong> {new Date(selectedRequest.rejectionDate || selectedRequest.financialRejection?.date).toLocaleString()}</p>
        {/if}
    </div>
{/if}
          {#if showAppealDetails}
            <div class="appeal-section">
              <h3>تفاصيل الاعتراض</h3>
              <p><strong>سبب الاعتراض:</strong> {selectedRequest.appeal.reason}</p>
              <p><strong>تاريخ الاعتراض:</strong> {new Date(selectedRequest.appeal.date).toLocaleString()}</p>
              <p><strong>بواسطة:</strong> {selectedRequest.appeal.by}</p>
            </div>
          {/if}
          
          {#if showFinanceRejection}
            <div class="rejection-section finance-rejection">
              <h3>تفاصيل الرفض من المالية</h3>
              <p><strong>سبب الرفض:</strong> {selectedRequest.financeRejection.reason}</p>
              <p><strong>تاريخ الرفض:</strong> {new Date(selectedRequest.financeRejection.date).toLocaleString()}</p>
              <p><strong>بواسطة:</strong> {selectedRequest.financeRejection.by}</p>
            </div>
          {/if}
          
          {#if showReviewRejection}
            <div class="rejection-section review-rejection">
              <h3>تفاصيل الرفض من المراجعة الفنية</h3>
              <p><strong>سبب الرفض:</strong> {selectedRequest.reviewRejection.reason}</p>
              <p><strong>تاريخ الرفض:</strong> {new Date(selectedRequest.reviewRejection.date).toLocaleString()}</p>
              <p><strong>بواسطة:</strong> {selectedRequest.reviewRejection.by}</p>
            </div>
          {/if}
          
          <div class="parts-section">
            <h3>قطع الغيار</h3>
            
            {#if selectedRequest.parts?.length === 0}
              <p>لم يتم إضافة قطع غيار بعد</p>
            {:else}
              <table>
                <thead>
                  <tr>
                    <th>الكود</th>
                    <th>اسم القطعة</th>
                    <th>السعر (ج.م)</th>
                    <th>الكمية</th>
                    <th>الضمان</th>
                    <th>المجموع (ج.م)</th>
                    {#if selectedRequest.status === 'pending' || selectedRequest.status === 'appeal_submitted'}
                      <th>إجراءات</th>
                    {/if}
                  </tr>
                </thead>
                <tbody>
                  {#each selectedRequest.parts as part}
                    <tr>
                      <td>{part.code || 'N/A'}</td>
                      <td>{part.name}</td>
                      <td>{part.price} ج.م</td>
                      <td>{part.quantity}</td>
                      <td>
                        {part.warranty === 0 ? 'بدون' : 
                         part.warranty === 1 ? '3 أشهر' : 
                         part.warranty === 2 ? '6 أشهر' : 'سنة'}
                      </td>
                      <td>{part.price * part.quantity} ج.م</td>
                      {#if selectedRequest.status === 'pending' || selectedRequest.status === 'appeal_submitted'}
                        <td>
                          <button class="remove-btn" on:click={() => removePart(part.id)}>
                            حذف
                          </button>
                        </td>
                      {/if}
                    </tr>
                  {/each}
                  <tr class="total">
                    <td colspan="5">المجموع الكلي لقطع الغيار</td>
                    <td>{selectedRequest.parts?.reduce((sum, part) => sum + (part.price * part.quantity), 0) || 0} ج.م</td>
                    {#if selectedRequest.status === 'pending' || selectedRequest.status === 'appeal_submitted'}
                      <td></td>
                    {/if}
                  </tr>
                </tbody>
              </table>
            {/if}
            
            {#if selectedRequest.status === 'pending' || selectedRequest.status === 'appeal_submitted'}
              <div class="add-parts-section">
                <button on:click={() => showPartsForm = true}>إضافة قطعة غيار</button>
                <button on:click={() => showNewPartForm = true} class="add-new-part-btn">
                  إضافة قطعة جديدة
                </button>
              </div>
            {/if}
          </div>
          
          <div class="services-section">
            <h3>خدمات الصيانة</h3>
            
            {#if selectedRequest.services?.length === 0}
              <p>لم يتم إضافة خدمات صيانة بعد</p>
            {:else}
              <table>
                <thead>
                  <tr>
                    <th>اسم الخدمة</th>
                    <th>الوصف</th>
                    <th>السعر (ج.م)</th>
                    {#if selectedRequest.status === 'pending' || selectedRequest.status === 'appeal_submitted'}
                      <th>إجراءات</th>
                    {/if}
                  </tr>
                </thead>
                <tbody>
                  {#each selectedRequest.services as service}
                    <tr>
                      <td>{service.name}</td>
                      <td>{service.description}</td>
                      <td>{service.price} ج.م {#if service.customPrice}(مخصص){/if}</td>
                      {#if selectedRequest.status === 'pending' || selectedRequest.status === 'appeal_submitted'}
                        <td>
                          <button class="remove-btn" on:click={() => removeService(service.id)}>
                            حذف
                          </button>
                        </td>
                      {/if}
                    </tr>
                  {/each}
                  <tr class="total">
                    <td colspan="2">المجموع الكلي للخدمات</td>
                    <td>{selectedRequest.services?.reduce((sum, service) => sum + service.price, 0) || 0} ج.م</td>
                    {#if selectedRequest.status === 'pending' || selectedRequest.status === 'appeal_submitted'}
                      <td></td>
                    {/if}
                  </tr>
                </tbody>
              </table>
            {/if}
            
            {#if selectedRequest.status === 'pending' || selectedRequest.status === 'appeal_submitted'}
              <button on:click={() => showServiceForm = true}>إضافة خدمة صيانة</button>
            {/if}
          </div>
          
          <div class="total-cost-section">
            <h3>التكلفة الإجمالية: {totalCost} ج.م</h3>
          </div>
          
          {#if showSendButton}
            <div class="send-for-review">
              <h3>إرسال للمراجعة</h3>
              <textarea bind:value={technicianNotes} placeholder="ملاحظات الفني..."></textarea>
              <label>تاريخ الانتهاء المتوقع:
                <input type="date" bind:value={estimatedCompletionDate}>
              </label>
              <button on:click={sendForReview}>
                {selectedRequest.status === 'appeal_submitted' ? 'إعادة إرسال للمراجعة' : 'إرسال للمراجعة'}
              </button>
            </div>
          {/if}
          
          {#if selectedRequest.status === 'financial_approved'}
            <button on:click={completeRequest}>تم الانتهاء من الصيانة</button>
          {/if}
          
          {#if selectedRequest.status === 'pending_review'}
            <button class="reject-btn" on:click={() => openRejectionDialog('review')}>رفض الطلب (مراجعة)</button>
          {/if}
          
          {#if selectedRequest.status === 'pending_financial'}
            <div class="finance-actions">
              <button on:click={approveFinancially}>
                الموافقة المالية
              </button>
              <button class="reject-btn" on:click={() => openRejectionDialog('finance')}>
                رفض من المالية
              </button>
            </div>
          {/if}
          
          {#if showHistory && selectedRequest.history}
           <div class="history-section">
    <h3>سجل الطلب</h3>
    <ul>
        {#each selectedRequest.history as event}
            <li class:rejected-event={event.action.includes('rejected')}>
                <span class="event-date">{new Date(event.date).toLocaleString()}</span>
                <span class="event-action">
                    {event.action === 'rejected_by_review' ? 'مرفوض (مراجعة)' : 
                     event.action === 'financial_rejected' ? 'مرفوض (مالية)' : 
                     event.action === 'created' ? 'إنشاء الطلب' :
                     event.action}
                </span>
                {#if event.rejectionReason}
                    <div class="rejection-reason">
                        <strong>سبب الرفض:</strong> {event.rejectionReason}
                    </div>
                {/if}
                <span class="event-by">بواسطة: {event.by}</span>
            </li>
        {/each}
    </ul>
</div>
          {/if}
        </div>
      </div>
    </div>
  {/if}
  
  {#if showPartsForm}
    <div class="popup-overlay" on:click|self={() => showPartsForm = false}>
      <div class="popup-content small">
        <div class="popup-header">
          <h3>إضافة قطعة غيار</h3>
          <button class="popup-close-btn" on:click={() => showPartsForm = false}>×</button>
        </div>
        
        <div class="popup-body">
          <div class="form-group">
            <label>اختر قطعة الغيار:</label>
            <select bind:value={selectedPart}>
              <option value="">اختر قطعة الغيار</option>
              {#each spareParts as part}
                <option value={part.id}>
                  {part.name} - {part.code} - {part.price} ج.م
                </option>
              {/each}
            </select>
          </div>
          
          <div class="form-group">
            <label>الكمية:</label>
            <input type="number" bind:value={selectedQuantity} min="1">
          </div>
          
          <div class="buttons">
            <button on:click={addSparePart}>إضافة</button>
            <button on:click={() => showPartsForm = false}>إلغاء</button>
          </div>
        </div>
      </div>
    </div>
  {/if}
  
  {#if showServiceForm}
    <div class="popup-overlay" on:click|self={() => showServiceForm = false}>
      <div class="popup-content medium">
        <div class="popup-header">
          <h3>إضافة خدمة صيانة</h3>
          <button class="popup-close-btn" on:click={() => showServiceForm = false}>×</button>
        </div>
        
        <div class="popup-body">
          <div class="form-group">
            <label>اسم الخدمة (مطلوب):</label>
            <input type="text" bind:value={newServiceName} placeholder="اسم الخدمة">
          </div>
          
          <div class="form-group">
            <label>السعر (ج.م) (مطلوب):</label>
            <input type="number" bind:value={newServicePrice} min="1" placeholder="السعر">
          </div>
          
          <div class="form-group">
            <label>الوصف (اختياري):</label>
            <textarea bind:value={serviceDescription} placeholder="وصف الخدمة..."></textarea>
          </div>
          
          <div class="buttons">
            <button on:click={addService}>إضافة</button>
            <button on:click={() => showServiceForm = false}>إلغاء</button>
          </div>
        </div>
      </div>
    </div>
  {/if}
  
  {#if showNewPartForm}
    <div class="popup-overlay" on:click|self={() => showNewPartForm = false}>
      <div class="popup-content medium">
        <div class="popup-header">
          <h3>إضافة قطعة غيار جديدة</h3>
          <button class="popup-close-btn" on:click={() => showNewPartForm = false}>×</button>
        </div>
        
        <div class="popup-body">
          <div class="form-group">
            <label>كود القطعة (مطلوب):</label>
            <input type="text" bind:value={newPartCode} placeholder="مثال: FLT-001" class:invalid={newPartCode && !validatePartCode(newPartCode)}>
            {#if newPartCode && !validatePartCode(newPartCode)}
              <span class="error-message">كود القطعة موجود مسبقاً</span>
            {/if}
          </div>
          
          <div class="form-group">
            <label>اسم القطعة (مطلوب):</label>
            <input type="text" bind:value={newPartName} placeholder="اسم القطعة">
          </div>
          
          <div class="form-group">
            <label>السعر (ج.م) (مطلوب):</label>
            <input type="number" bind:value={newPartPrice} min="1" placeholder="السعر">
          </div>
          
          <div class="form-group">
            <label>فترة الضمان:</label>
            <select bind:value={newPartWarranty}>
              {#each warrantyOptions as option}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
          </div>
          
          <div class="form-group">
            <label>المورد (اختياري):</label>
            <input type="text" bind:value={newPartSupplier} placeholder="اسم المورد">
          </div>
          
          <div class="buttons">
            <button on:click={() => {
              if (!newPartCode || !validatePartCode(newPartCode)) {
                alert('يرجى إدخال كود قطعة صحيح وغير مكرر');
                return;
              }
              if (!newPartName) {
                alert('يرجى إدخال اسم القطعة');
                return;
              }
              if (!newPartPrice) {
                alert('يرجى إدخال سعر القطعة');
                return;
              }
          
              const newPart = {
                id: spareParts.length > 0 ? Math.max(...spareParts.map(p => p.id)) + 1 : 1,
                code: newPartCode,
                name: newPartName,
                price: parseInt(newPartPrice),
                warranty: parseInt(newPartWarranty),
                supplier: newPartSupplier
              };
              
              spareParts = [...spareParts, newPart];
              localStorage.setItem('spareParts', JSON.stringify(spareParts));
              
              newPartCode = '';
              newPartName = '';
              newPartPrice = '';
              newPartWarranty = '0';
              newPartSupplier = '';
              
              showNewPartForm = false;
              alert('تمت إضافة القطعة بنجاح!');
            }}>حفظ القطعة</button>
            
            <button class="cancel-btn" on:click={() => showNewPartForm = false}>إلغاء</button>
          </div>
        </div>
      </div>
    </div>
  {/if}
  
  {#if showRejectionDialog}
    <div class="popup-overlay" on:click|self={() => showRejectionDialog = false}>
      <div class="popup-content small">
        <div class="popup-header">
          <h3>{rejectionType === 'review' ? 'رفض من المراجعة الفنية' : 'رفض من المالية'}</h3>
          <button class="popup-close-btn" on:click={() => showRejectionDialog = false}>×</button>
        </div>
        
        <div class="popup-body">
          <div class="form-group">
            <label>سبب الرفض (مطلوب):</label>
            <textarea bind:value={rejectionReason} placeholder="أدخل سبب الرفض..." rows="4"></textarea>
          </div>
          
          <div class="buttons">
            <button on:click={submitRejection}>تأكيد الرفض</button>
            <button class="cancel-btn" on:click={() => showRejectionDialog = false}>إلغاء</button>
          </div>
        </div>
      </div>
    </div>
  {/if}
  
  {#if showServiceManagement}
    <div class="popup-overlay" on:click|self={() => showServiceManagement = false}>
      <div class="popup-content medium">
        <div class="popup-header">
          <h3>إدارة خدمات الصيانة</h3>
          <button class="popup-close-btn" on:click={() => showServiceManagement = false}>×</button>
        </div>
        
        <div class="popup-body">
          <button on:click={() => {
            resetServiceForm();
            editingService = null;
            showNewServiceForm = true;
          }}>إضافة خدمة جديدة</button>
            
          <table>
            <thead>
              <tr>
                <th>اسم الخدمة</th>
                <th>الوصف</th>
                <th>السعر (ج.م)</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {#each maintenanceServices as service}
                <tr>
                  <td>{service.name}</td>
                  <td>{service.description}</td>
                  <td>{service.price}</td>
                  <td>
                    <button on:click={() => editService(service)}>تعديل</button>
                    <button class="remove-btn" on:click={() => deleteService(service.id)}>حذف</button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  {/if}
  
  {#if showNewServiceForm}
    <div class="popup-overlay" on:click|self={() => showNewServiceForm = false}>
      <div class="popup-content medium">
        <div class="popup-header">
          <h3>{editingService ? 'تعديل خدمة الصيانة' : 'إضافة خدمة صيانة جديدة'}</h3>
          <button class="popup-close-btn" on:click={() => showNewServiceForm = false}>×</button>
        </div>
        
        <div class="popup-body">
          <div class="form-group">
            <label>اسم الخدمة (مطلوب):</label>
            <input type="text" bind:value={newServiceName} placeholder="اسم الخدمة" class:invalid={newServiceName && !validateServiceName(newServiceName)}>
            {#if newServiceName && !validateServiceName(newServiceName)}
              <span class="error-message">اسم الخدمة موجود مسبقاً</span>
            {/if}
          </div>
          
          <div class="form-group">
            <label>السعر (ج.م) (مطلوب):</label>
            <input type="number" bind:value={newServicePrice} min="1" placeholder="السعر">
          </div>
          
          <div class="form-group">
            <label>الوصف (اختياري):</label>
            <textarea bind:value={newServiceDescription} placeholder="وصف الخدمة..."></textarea>
          </div>
          
          <div class="buttons">
            <button on:click={saveService}>{editingService ? 'حفظ التعديلات' : 'حفظ الخدمة'}</button>
            <button class="cancel-btn" on:click={() => showNewServiceForm = false}>إلغاء</button>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .header-top{
    background-color: #4361EE;
    flex-direction: column;
    display: flex;
    width: 100%;
    color: white;
    flex-direction: column;
    align-items: flex-start;
    padding: 10px;
  }
  .header-top h1{
    font-size: 32px;
  }
  .maintenance-company {
    padding: 20px;
    font-family: "Noto Kufi Arabic", sans-serif;
    max-width: 1200px;
    margin: 0 auto;
    position: relative;
  }
  
  .tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    flex-wrap: wrap;
    font-weight: bold;
    font-size: 18px;
  }
  
  .tabs button {
    padding: 15px 12px;
    background: #EEF1F2;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    color: black;
  }
  
  .tabs button.active {
    background: #4361EE;
    color: white;
  }
  
  .requests-count {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding: 10px;
    background: #f5f5f5;
    border-radius: 4px;
  }
  
  .manage-services-btn {
    background: #9C27B0;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 15px;
    cursor: pointer;
  }
  
  .requests-section {
    margin-bottom: 30px;
  }
  
  .requests-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 15px;
  }
  
  .request-card {
    background: white;
    padding: 15px;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    position: relative;
  }
  
  .status-badge {
    position: absolute;
    top: 10px;
    left: 10px;
    padding: 3px 8px;
    border-radius: 3px;
    font-size: 12px;
    background: #2196F3;
    color: white;
  }
  
  .request-card.pending .status-badge { background: #FF9800; }
  .request-card.under_maintenance .status-badge { background: #2196F3; }
  .request-card.pending_review .status-badge { background: #9C27B0; }
  .request-card.pending_financial .status-badge { background: #673AB7; }
  .request-card.financial_approved .status-badge { background: #4CAF50; }
  .request-card.completed .status-badge { background: #607D8B; }
  .request-card.rejected_by_review .status-badge { background: #f44336; }
  .request-card.appeal_submitted .status-badge { background: #FF5722; }
  .request-card.financial_rejected  .status-badge { background: #730000; }
 
  .request-card button {
    margin-top: 10px;
    width: 100%;
    padding: 8px;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .request-card.rejected_by_review button,
  .request-card.financial_rejected button {
    background: #f44336;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
  }
  
  .request-card.rejected_by_review button::before,
  .request-card.financial_rejected button::before {
    content: "⚠️";
  }
  
  .request-card.appeal_submitted button {
    background: #FF5722;
  }
  
  .no-requests {
    text-align: center;
    padding: 20px;
    color: #666;
  }
  
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
    backdrop-filter: blur(2px);
  }
  
  .popup-content {
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    max-width: 800px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    animation: popupFadeIn 0.3s ease-out;
  }
  
  .popup-content.small {
    max-width: 500px;
  }
  
  .popup-content.medium {
    max-width: 600px;
  }
  
  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    background: #4CAF50;
    color: white;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    position: sticky;
    top: 0;
    z-index: 10;
  }
  
  .popup-header h2, .popup-header h3 {
    margin: 0;
    font-size: 18px;
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
  
  @keyframes popupFadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .car-info, .parts-section, .services-section, .send-for-review, 
  .history-section, .appeal-section, .total-cost-section,
  .rejection-section, .finance-actions, .rejection-details {
    margin-bottom: 20px;
  }
  .rejection-details {
    background-color: #FFEBEE;
    padding: 15px;
    border-radius: 5px;
    border-left: 4px solid #f44336;
    margin-bottom: 20px;
}

.rejection-details h3 {
    color: #f44336;
    margin-top: 0;
    margin-bottom: 10px;
}

.rejection-details p {
    margin: 8px 0;
    line-height: 1.5;
}

.financial-rejection {
    background-color: #FCE4EC;
    border-left-color: #E91E63;
}

.review-rejection {
    background-color: #FFEBEE;
    border-left-color: #f44336;
}
  .rejection-details {
    background-color: #FFEBEE;
    padding: 15px;
    border-radius: 5px;
    border-left: 4px solid #f44336;
  }
  
  .rejection-details h3 {
    color: #f44336;
    margin-top: 0;
  }
  
  .rejection-details p {
    margin: 8px 0;
    line-height: 1.5;
  }
  
  .appeal-section {
    background: #FFF3E0;
    padding: 15px;
    border-radius: 5px;
    border-left: 4px solid #FF5722;
  }
  
  .rejection-section {
    padding: 15px;
    border-radius: 5px;
    margin-bottom: 15px;
  }
  
  .finance-rejection {
    background: #FCE4EC;
    border-left: 4px solid #E91E63;
  }
  
  .review-rejection {
    background: #FFEBEE;
    border-left: 4px solid #f44336;
  }
  
  .rejection-section h3 {
    color: #d32f2f;
    margin-top: 0;
  }
  
  .appeal-section p, .rejection-section p {
    margin: 8px 0;
    line-height: 1.5;
  }
  
  .finance-actions {
    display: flex;
    gap: 10px;
    justify-content: center;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 15px 0;
  }
  
  th, td {
    padding: 10px;
    border: 1px solid #ddd;
    text-align: center;
  }
  
  th {
    background: #f5f5f5;
  }
  
  .total {
    font-weight: bold;
    background: #f9f9f9;
  }
  
  .remove-btn {
    background: #f44336;
    color: white;
    padding: 5px 10px;
    border: none;
    border-radius: 3px;
    cursor: pointer;
  }
  
  .reject-btn {
    background: #f44336;
    color: white;
    padding: 10px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 10px;
  }
  
  .send-for-review textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    min-height: 80px;
    margin-bottom: 10px;
  }
  
  .send-for-review label {
    display: block;
    margin-bottom: 10px;
  }
  
  .send-for-review input[type="date"] {
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .history-section ul {
    list-style: none;
    padding: 0;
  }
  
  .history-section li {
    padding: 8px 0;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
  }
  
  .history-section li.rejected-event {
    background-color: #FFEBEE;
    padding: 10px;
    border-radius: 5px;
  }
  
  .rejection-reason {
    background-color: #FCE4EC;
    padding: 8px;
    border-radius: 4px;
    margin: 5px 0;
  }
  
  .event-date {
    color: #666;
    font-size: 14px;
    width: 100%;
    margin-bottom: 5px;
  }
  
  .event-action {
    font-weight: bold;
  }
  
  .event-reason {
    color: #f44336;
    font-size: 14px;
    width: 100%;
    margin-top: 5px;
  }
  
  .event-notes {
    color: #2196F3;
    font-size: 14px;
    width: 100%;
    margin-top: 5px;
  }
  
  .event-by {
    font-style: italic;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }
  
  .form-group select, 
  .form-group input,
  .form-group textarea {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-family: inherit;
  }
  
  textarea {
    min-height: 100px;
  }
  
  .form-group input.invalid {
    border-color: #f44336;
  }
  
  .error-message {
    color: #f44336;
    font-size: 12px;
    display: block;
    margin-top: 5px;
  }
  
  .buttons {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
  }
  
  button {
    padding: 8px 15px;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  button:hover {
    opacity: 0.9;
  }
  
  .cancel-btn {
    background: #f44336;
  }
  

  .add-new-part-btn {
    background: #673AB7;
  }
  
  .add-parts-section {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
  }
  
  select {
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    width: 100%;
  }
  
  .services-section button {
    background: #535b61;
  }
  
  .total-cost-section {
    background: #f5f5f5;
    padding: 15px;
    border-radius: 5px;
    text-align: center;
  }
  </style>
  