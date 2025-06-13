<script>
  import { onMount } from "svelte";
  import Headeve from "../header/Headeve.svelte";
  
    let cars = [];
    let selectedCarId = '';
    let selectedFile = null;
    let filePreview = '';
    let uploads = {};
  
    onMount(() => {
      const savedCars = localStorage.getItem('cars');
      if (savedCars) {
        cars = JSON.parse(savedCars);
      }
  
      const savedUploads = localStorage.getItem('carUploads');
      if (savedUploads) {
        uploads = JSON.parse(savedUploads);
      }
    });
  
    function handleFileChange(event) {
      const file = event.target.files[0];
      if (file && selectedCarId) {
        const reader = new FileReader();
        reader.onload = function (e) {
          filePreview = e.target.result;
          selectedFile = {
            name: file.name,
            data: e.target.result
          };
        };
        reader.readAsDataURL(file);
      }
    }
  
    function saveFile() {
      if (selectedFile && selectedCarId) {
        uploads = {
          ...uploads,
          [selectedCarId]: [...(uploads[selectedCarId] || []), selectedFile]
        };
        localStorage.setItem('carUploads', JSON.stringify(uploads));
        alert('✅ تم حفظ الملف بنجاح!');
        selectedFile = null;
        filePreview = '';
      } else {
        alert('❌ تأكد من اختيار السيارة ورفع الملف أولًا');
      }
    }
  
    function viewFile(file) {
      window.open(file.data, '_blank');
    }
  
    function deleteFile(fileIndex) {
      if (selectedCarId && uploads[selectedCarId]) {
        const updatedFiles = [...uploads[selectedCarId]];
        updatedFiles.splice(fileIndex, 1);
        uploads = {
          ...uploads,
          [selectedCarId]: updatedFiles
        };
        localStorage.setItem('carUploads', JSON.stringify(uploads));
      }
    }
  </script>
<Headeve/>
  <div class="container">
    <h2>📁 رفع ملفات للسيارات</h2>
  
    {#if cars.length === 0}
      <p>🚫 لا توجد سيارات. أضف بعض السيارات أولاً.</p>
    {:else}
      <div class="form-section">
        <label>🚗 اختر السيارة:</label>
        <select bind:value={selectedCarId}>
          <option value="">-- اختر سيارة --</option>
          {#each cars as car}
            <option value={car.id}>{car.name} - {car.model}</option>
          {/each}
        </select>
  
        {#if selectedCarId}
          <div class="upload-section">
            <label for="file">📎 ارفع ملف:</label>
            <input type="file" id="file" on:change={handleFileChange} accept="image/*,application/pdf" />
  
            <button on:click={saveFile} class="save-btn" disabled={!selectedFile}>💾 حفظ الملف</button>
          </div>
  
          {#if uploads[selectedCarId]?.length > 0}
            <div class="preview">
              <h3>📋 الملفات المرفقة:</h3>
              <ul>
                {#each uploads[selectedCarId] as file, index}
                  <li>
                    📄 {file.name}
                    <button on:click={() => viewFile(file)}>👁️ عرض</button>
                    <button on:click={() => deleteFile(index)}>🗑️ حذف</button>
                    {#if file.data.startsWith('data:image')}
                      <img src={file.data} alt="preview" />
                    {/if}
                  </li>
                {/each}
              </ul>
            </div>
          {:else}
            <p>📭 لا توجد ملفات مرفقة حتى الآن.</p>
          {/if}
        {/if}
      </div>
    {/if}
  </div>
  
  <style>
    .container {
      max-width: 700px;
      margin: 2rem auto;
      padding: 1rem;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      font-family: Arial, sans-serif;
    }
  
    h2 {
      margin-bottom: 1rem;
      text-align: center;
    }
    h3 {
      margin-top: 1rem;
    }
    label {
      font-weight: bold;
      display: block;
      margin-top: 1rem;
    }
    select, input[type="file"] {
      width: 100%;
      padding: 0.5rem;
      margin-top: 0.3rem;
      border-radius: 6px;
      border: 1px solid #ccc;
    }
    button {
      margin-top: 0.5rem;
      margin-right: 0.3rem;
      padding: 0.4rem 0.8rem;
      background: #4361EE;    
      padding: 10px;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }
    button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    .preview ul {
      list-style: none;
      padding: 0;
      margin-top: 1rem;
    }
  
    .preview li {
      background: #f9f9f9;
      border-radius: 6px;
      padding: 0.7rem;
      margin-bottom: 0.5rem;
      border: 1px solid #ddd;
    }
  
    .preview img {
      max-width: 100px;
      margin-top: 0.5rem;
      border-radius: 4px;
      display: block;
    }
  </style>
  