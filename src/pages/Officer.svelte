<script>
    import { onMount } from 'svelte';
    
    let officers = [];
    let newOfficer = {
        firstName: '',
        lastName: '',
        rank: '',
        department: '',
        mobile: '',
        status: 'مفعل'
    };
    
    let editMode = false;
    let currentEditId = null;
    let searchTerm = '';
    
    const officerRanks = [
        'ملازم',
        'ملازم أول',
        'نقيب',
        'رائد',
        'مقدم',
        'عقيد',
        'عميد',
        'لواء',
       
    ];
    
    // الأقسام الإدارية
    const departments = [
        'الأمن العام',
        'المباحث',
        'المرور',
        'الدفاع المدني',
        'الجوازات',
        'السجون',
    ];
    
    onMount(() => {
        loadOfficers();
    });
    
    function loadOfficers() {
        const storedOfficers = localStorage.getItem('officers');
        officers = storedOfficers ? JSON.parse(storedOfficers) : [];
    }
    
    function saveOfficers() {
        localStorage.setItem('officers', JSON.stringify(officers));
    }
    
    function addOfficer() {
        if (!newOfficer.firstName || !newOfficer.lastName || !newOfficer.rank) {
            alert('الرجاء إدخال البيانات الأساسية (الاسم والرتبة)');
            return;
        }
        
        const officer = {
            id: Date.now().toString(),
            ...newOfficer
        };
        
        officers.push(officer);
        saveOfficers();
        resetForm();
        alert('تم إضافة الضابط بنجاح ✅');
    }
    
    function editOfficer(officer) {
        newOfficer = { ...officer };
        editMode = true;
        currentEditId = officer.id;
    }
    
    function updateOfficer() {
        const index = officers.findIndex(o => o.id === currentEditId);
        if (index !== -1) {
            officers[index] = { ...newOfficer };
            saveOfficers();
            resetForm();
            alert('تم تحديث بيانات الضابط بنجاح ✅');
        }
    } 

    function deleteOfficer(id) {
        if (confirm('هل أنت متأكد من حذف هذا الضابط؟')) {
            officers = officers.filter(o => o.id !== id);
            saveOfficers();
            alert('تم حذف الضابط بنجاح');
        }
    }
    
    function toggleOfficerStatus(id) {
        const officer = officers.find(o => o.id === id);
        if (officer) {
            officer.status = officer.status === 'مفعل' ? 'غير مفعل' : 'مفعل';
            saveOfficers();
        }
    }
    function resetForm() {
        newOfficer = {
            firstName: '',
            lastName: '',
            rank: '',
            department: '',
            mobile: '',
            status: 'مفعل'
        };
        editMode = false;
        currentEditId = null;
    }
    
    // تصفية الضباط حسب البحث
    $: filteredOfficers = officers.filter(officer => {
        const fullName = `${officer.firstName} ${officer.lastName}`.toLowerCase();
        const search = searchTerm.toLowerCase();
        return (
            fullName.includes(search) ||
            (officer.rank && officer.rank.toLowerCase().includes(search)) ||
            (officer.department && officer.department.toLowerCase().includes(search)) ||
            (officer.mobile && officer.mobile.includes(searchTerm))
        );
    });
</script>
<div class="header">
    <h2>إدارة بيانات الضباط</h2>
    <p>نظام إضافة وتعديل وحذف بيانات الضباط</p>
</div> 
<div class="officers-container">
   
    
    <!-- نموذج إضافة/تعديل ضابط -->
    <div class="officer-form">
        <h3>{editMode ? 'تعديل بيانات الضابط' : 'إضافة ضابط جديد'}</h3>
        
        <div class="form-grid">
            <div class="form-group">
                <label for="firstName">الاسم الأول:</label>
                <input 
                    id="firstName" 
                    type="text" 
                    bind:value={newOfficer.firstName}
                    placeholder="ادخل الاسم الأول"
                />
            </div>
            
            <div class="form-group">
                <label for="lastName">الاسم الأخير:</label>
                <input 
                    id="lastName" 
                    type="text" 
                    bind:value={newOfficer.lastName}
                    placeholder="ادخل الاسم الأخير"
                />
            </div>
            
            <div class="form-group">
                <label for="rank">الرتبة:</label>
                <select id="rank" bind:value={newOfficer.rank}>
                    <option value="">-- اختر الرتبة --</option>
                    {#each officerRanks as rank}
                        <option value={rank}>{rank}</option>
                    {/each}
                </select>
            </div>
            
            <div class="form-group">
                <label for="department">القسم/الإدارة:</label>
                <select id="department" bind:value={newOfficer.department}>
                    <option value="">-- اختر القسم --</option>
                    {#each departments as dept}
                        <option value={dept}>{dept}</option>
                    {/each}
                </select>
            </div>
            
            <div class="form-group">
                <label for="mobile">رقم الجوال:</label>
                <input 
                    id="mobile" 
                    type="tel" 
                    bind:value={newOfficer.mobile}
                    placeholder="ادخل رقم الجوال"
                    on:input={() => newOfficer.mobile = newOfficer.mobile.replace(/[^0-9]/g, '')}
                />
            </div>
            
            <div class="form-group">
                <label for="status">الحالة:</label>
                <select id="status" bind:value={newOfficer.status}>
                    <option value="مفعل">مفعل</option>
                    <option value="غير مفعل">غير مفعل</option>
                </select>
            </div>
        </div>
        
        <div class="form-actions">
            {#if editMode}
                <button on:click={updateOfficer} class="update-btn">تحديث البيانات</button>
                <button on:click={resetForm} class="cancel-btn">إلغاء</button>
            {:else}
                <button on:click={addOfficer} class="add-btn">إضافة ضابط</button>
            {/if}
        </div>
    </div>
    
    <!-- قسم البحث -->
    <div class="search-section">
        <div class="search-group">
            <input 
                type="text" 
                bind:value={searchTerm}
                placeholder="ابحث باسم الضابط، الرتبة أو القسم..."
            />
            <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
            </svg>
        </div>
    </div>
    
    <!-- جدول الضباط -->
    <div class="officers-table-section">
        <h3>سجل الضباط ({filteredOfficers.length})</h3>
        
        {#if filteredOfficers.length === 0}
            <div class="no-data">
                {#if officers.length === 0}
                    <p>لا يوجد ضباط مسجلين في النظام</p>
                {:else}
                    <p>لا توجد نتائج مطابقة للبحث</p>
                {/if}
            </div>
        {:else}
            <table class="officers-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>الاسم الكامل</th>
                        <th>الرتبة</th>
                        <th>القسم</th>
                        <th>الجوال</th>
                        <th>الحالة</th>
                        <th>الإجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    {#each filteredOfficers as officer, index}
                        <tr>
                            <td>{index + 1}</td>
                            <td>{officer.firstName} {officer.lastName}</td>
                            <td>{officer.rank}</td>
                            <td>{officer.department || '--'}</td>
                            <td>{officer.mobile || '--'}</td>
                            <td>
                                <span class:active={officer.status === 'مفعل'} 
                                      class:inactive={officer.status === 'غير مفعل'}
                                      on:click={() => toggleOfficerStatus(officer.id)}>
                                    {officer.status}
                                </span>
                            </td>
                            <td class="actions">
                                <button on:click={() => editOfficer(officer)} class="edit-btn">
                                    <svg viewBox="0 0 24 24" width="18" height="18">
                                        <path fill="currentColor" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                                    </svg>
                                </button>
                                <button on:click={() => deleteOfficer(officer.id)} class="delete-btn">
                                    <svg viewBox="0 0 24 24" width="18" height="18">
                                        <path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                                    </svg>
                                </button>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
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

    .officers-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 1.5rem;
    }

    .header {
        text-align: center;
    margin-bottom: 2rem;
    width: 100%;
    background-color: #4361EE;
    display: flex
;
    flex-direction: column;
    align-items: flex-start;
    }

    .header h2 {
        color: #ffffff;
    margin-top: 0;
    padding-right: 33px;
    padding-top: 1px;
    padding-bottom: 12px;
    }

    .header p {
        color: #ffffff;
    margin-top: 0;
    padding-right: 33px;
    padding-top: 1px;
    padding-bottom: 12px;
    }

    /* نموذج الضابط */
    .officer-form {
        background-color: white;
        padding: 1.5rem;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        margin-bottom: 2rem;
    }

    .officer-form h3 {
        margin-top: 0;
        color: #2c3e50;
        border-bottom: 1px solid #eee;
        padding-bottom: 0.8rem;
        font-size: 1.3rem;
    }

    .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1.2rem;
        margin: 1.5rem 0;
    }

    .form-group {
        display: flex;
        flex-direction: column;
    }

    .form-group label {
        margin-bottom: 0.5rem;
        font-weight: 600;
        color: #2c3e50;
        font-size: 0.9rem;
    }

    .form-group input,
    .form-group select {
        padding: 0.7rem;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 0.95rem;
        transition: all 0.3s ease;
    }

    .form-group input:focus,
    .form-group select:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
    }

    .form-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
    }

    .add-btn, .update-btn {
        padding: 0.8rem 1.5rem;
        background-color: #27ae60;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s;
    }

    .add-btn:hover, .update-btn:hover {
        background-color: #219653;
    }

    .cancel-btn {
        padding: 0.8rem 1.5rem;
        background-color: #e74c3c;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s;
    }

    .cancel-btn:hover {
        background-color: #c0392b;
    }

    /* قسم البحث */
    .search-section {
        margin-bottom: 1.5rem;
    }

    .search-group {
        position: relative;
        max-width: 500px;
    }

    .search-group input {
        width: 100%;
        padding: 0.8rem 1rem 0.8rem 2.5rem;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 1rem;
        transition: all 0.3s;
    }

    .search-group input:focus {
        border-color: #3498db;
        box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
    }

    .search-group svg {
        position: absolute;
        left: 0.8rem;
        top: 50%;
        transform: translateY(-50%);
        color: #7f8c8d;
    }

    /* جدول الضباط */
    .officers-table-section {
        background-color: white;
        padding: 1.5rem;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }

    .officers-table-section h3 {
        margin-top: 0;
        color: #2c3e50;
        font-size: 1.3rem;
    }

    .no-data {
        text-align: center;
        padding: 2rem;
        color: #7f8c8d;
        font-size: 1.1rem;
    }

    .officers-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 1rem;
    }

    .officers-table th {
        background-color: #f8f9fa;
        padding: 1rem;
        text-align: right;
        font-weight: 600;
        color: #2c3e50;
        border-bottom: 2px solid #eee;
    }

    .officers-table td {
        padding: 0.9rem;
        text-align: right;
        border-bottom: 1px solid #eee;
    }

    .officers-table tr:hover {
        background-color: #f8f9fa;
    }

    /* حالة الضابط */
    .active, .inactive {
        display: inline-block;
        padding: 0.4rem 0.8rem;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
    }

    .active {
        background-color: #d5f5e3;
        color: #27ae60;
    }

    .inactive {
        background-color: #fadbd8;
        color: #e74c3c;
    }

    .active:hover, .inactive:hover {
        opacity: 0.8;
    }

    /* أزرار الإجراءات */
    .actions {
        display: flex;
        gap: 0.5rem;
        justify-content: center;
    }

    .edit-btn, .delete-btn {
        padding: 0.5rem;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s;
    }

    .edit-btn {
        background-color: #3498db;
        color: white;
    }

    .edit-btn:hover {
        background-color: #2980b9;
    }

    .delete-btn {
        background-color: #e74c3c;
        color: white;
    }

    .delete-btn:hover {
        background-color: #c0392b;
    }

    /* التجاوب مع الشاشات الصغيرة */
    @media (max-width: 768px) {
        .form-grid {
            grid-template-columns: 1fr;
        }

        .form-actions {
            flex-direction: column;
        }

        .add-btn, .update-btn, .cancel-btn {
            width: 100%;
        }

        .officers-table {
            display: block;
            overflow-x: auto;
        }

        .search-group {
            max-width: 100%;
        }
    }
</style>