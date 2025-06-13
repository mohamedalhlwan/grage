<script>
    import { link } from 'svelte-spa-router';
    import { fly, fade } from 'svelte/transition';
    let showMain = false;
    let showEditLogo = false;
    // تحميل الشعار والنص من localStorage أو استخدام القيم الافتراضية
    let logoText = localStorage.getItem('logoText') || 'االإدار     ة العامة للمرور/ اداره مرور اسكندريه';
    let logoSrc = localStorage.getItem('logoSrc') || '/images/شعار ادارة مرور الاسكندرية.jpg';
    const navItems = [
        { href: '/', text: 'المركبات', icon: '/images/police-car.png' },
        { href: '/service', text: 'الماليه', icon: '/images/financial-plan.png' },
        { href: '/part', text: 'قطع الغيار', icon: '/images/spare-parts.png' },
        { href: '/reposparts', text: 'المخزون', icon: '/images/maintenance.png' },
        { href: '/officer', text:"الظباط", icon: '/images/policeman.png' },
        { href: '/driver', text: 'السائقين', icon: '/images/chauffeur (1).png' },
        { href: '/schedule', text: 'طلبات الصيانه', icon: '/images/chauffeur (1).png' },
        { href: '/vendors', text: "شركه الصيانه", icon: '/images/distribution.png' },
        { href: '/api', text: 'التشغيل', icon: '/images/recruitment.png' },
        { href: '/reports', text: 'التقارير', icon: '/images/report.png' },
    ];
    function handleLogoChange(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {             
                logoSrc = reader.result;
            };
            reader.readAsDataURL(file);
        }
    }
    function saveLogoSettings() {
        localStorage.setItem('logoText', logoText);
        localStorage.setItem('logoSrc', logoSrc);
        showEditLogo = false;
    }
    function resetLogoSettings() {
        logoText = 'الإدارة العامة للمرور/اداره مرور اسكندريه'  ;
        logoSrc = '/images/شعار ادارة مرور الاسكندرية.jpg';
        localStorage.removeItem('logoText');
        localStorage.removeItem('logoSrc');
        showEditLogo = false;
    }
</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@100..900&family=Rakkas&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&family=Rubik:ital,wght@0,300..900;1,300..900&display=swap" rel="stylesheet">
<div class="header-top">
    <div class="logo">
        <img src={logoSrc} alt="">
        <h2>{logoText}</h2>
    </div>
    <div class="nav">
        <img src="/images/menu-dots.png" alt="القائمة" on:click={() => showMain = !showMain}>
        <img src="/images/user.png" alt="تعديل الشعار" on:click={() => showEditLogo = true}>
    </div>
</div>
{#if showMain}
    <div class="overlay" on:click={() => showMain = false} transition:fade></div>
    <main class="dashboard2-container" transition:fly="{{ y: 50, duration: 400 }}">
        <button class="close-button" on:click={() => showMain = false}>×</button>
        <header class="dashboard2-header">
            <h1>مرحبا بك في تطبيق الجراج</h1>
            <p>اختر القسم الذي تريد الدخول إليه:</p>
        </header>
        <section class="dashboard2-grid">
            {#each navItems as item, i}
                <a 
    use:link
    href={item.href} 
    class="dashboard2-card"
    style="animation-delay: {i * 80}ms"
    on:click={() => showMain = false}
>
                    <div class="icon-circle"><img src="{item.icon}" alt=""></div>
                    <h2>{item.text}</h2>
                </a>
            {/each}
        </section>
    </main>
{/if}
<!-- نافذة تعديل الشعار -->
{#if showEditLogo}
    <div class="overlay" on:click={() => showEditLogo = false}></div>
    <div class="edit-logo-modal">
        <h3>تعديل الشعار والنص</h3>

        <label>اختيار شعار جديد:</label>
        <input type="file" accept="image/*" on:change={handleLogoChange} />

        <label>النص بجانب الشعار:</label>
        <input type="text" bind:value={logoText} />

        <div class="button-group">
            <button on:click={saveLogoSettings}>💾 حفظ</button>
            <button on:click={resetLogoSettings} class="reset">♻️ إعادة للوضع الافتراضي</button>
        </div>
    </div>
{/if}

<style>
    :root {
        --main-color: #4361ee;
        --gradient: linear-gradient(135deg, #4361ee, #4895ef);
        --text-dark: #1a1a2e;
    }

    .header-top {
font-family: "Noto Kufi Arabic", sans-serif;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: #ffffff;
        box-shadow: outset 2px 2px rgb(218, 218, 218) ;
    }
    .logo {
        display: flex;
        align-items: center;
    }
    .logo img {
        width: 60px;
        height: 60px;
        margin: 20px;
        margin-right: 40px;
    }
    .nav img {
        width: 50px;
        height: 50px;
        margin-left: 40px;
        cursor: pointer;
    }
    h2{
        font-size: 25px;
    }
    .nav img:hover {
        width: 70px;
        height: 70px;
        margin-bottom: 10px;
        transition: .3s;
    }
    .overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.821);
        z-index: 1000;
    }
    .dashboard2-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        padding: 2rem;
        background: var(--bg-light,);
        z-index: 1001;
        font-family: 'Segoe UI', sans-serif;
        overflow-y: auto;
    }
    .dashboard2-header {
        text-align: center;
        margin-bottom: 2rem;
    }
    .dashboard2-header h1 {
        font-size: 2.5rem;
        color: white;
        margin-bottom: 0.5rem;
    }
    .dashboard2-header p {
        color: white;
        font-size: 1.1rem;
    }
    .dashboard2-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1.5rem;
    }
    .dashboard2-card {
        background: var(--gradient);
        color: white;
        text-align: center;
        padding: 2rem 1rem;
        border-radius: 1.5rem;
        text-decoration: none;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        animation: fadeZoom 0.5s ease forwards;
        opacity: 0;
    }

    .dashboard2-card:hover {
        transform: scale(1.05) rotate(0.5deg);
        box-shadow: 0 16px 32px rgba(0, 0, 0, 0.2);
    }

    .dashboard2-card:hover .icon-circle {
        transform: scale(1.2) rotate(-3deg);
        background: rgba(255, 255, 255, 0.3);
        transition: transform 0.1s ease, background 0.1s ease;
    }

    .dashboard2-card h2 {
        margin-top: 1rem;
        font-size: 1.2rem;
    }

    .icon-circle {
        background: rgba(255, 255, 255, 0.2);
        width: 100px;
        height: 100px;
        border-radius: 50%;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
    }
    .icon-circle img{
        width: 70px;
        height: 70px;
    }

    .close-button {
        position: absolute;
        top: 1rem;
        left: 1rem;
        background: transparent;
        border: none;
        font-size: 2rem;
        color: #ffffff;
        cursor: pointer;
        z-index: 1002;
        transition: color 0.2s ease;
    }
    

    .close-button:hover {
        color: #e63946;
    }

    @keyframes fadeZoom {
        0% {
            opacity: 0;
            transform: scale(0.8);
        }
        100% {
            opacity: 1;
            transform: scale(1);
        }
    }
    .edit-logo-modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 2rem;
        border-radius: 1rem;
        z-index: 1100;
        box-shadow: 0 0 20px rgba(0,0,0,0.3);
        width: 90%;
        max-width: 400px;
        font-family: 'Segoe UI', sans-serif;
    }

    .edit-logo-modal h3 {
        margin-bottom: 1rem;
        font-size: 1.5rem;
    }

    .edit-logo-modal label {
        display: block;
        margin-top: 1rem;
        font-weight: bold;
    }

    .edit-logo-modal input[type="text"],
    .edit-logo-modal input[type="file"] {
        width: 100%;
        margin-top: 0.5rem;
    }

    .button-group {
        display: flex;
        justify-content: space-between;
        margin-top: 1.5rem;
    }

    .edit-logo-modal button {
        padding: 0.5rem 1rem;
        background-color: #4361ee;
        color: white;
        border: none;
        border-radius: 0.5rem;
        cursor: pointer;
        font-size: 0.9rem;
    }

    .edit-logo-modal .reset {
        background-color: #999;
    }
</style>
