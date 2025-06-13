<script>
    import { link } from 'svelte-spa-router';
    import { fly, fade } from 'svelte/transition';
    let showMain = false;
    let showEditLogo = false;
    // تحميل الشعار والنص من localStorage أو استخدام القيم الافتراضية
    let logoText = localStorage.getItem('logoText') || 'االإدارة العامة للمرور/ اداره مرور اسكندريه';
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
<div class="header-top">
    <div class="logo">
        <img src={logoSrc} alt="">
        <h1>{logoText}</h1>
    </div>
    <div class="nav">
        <img src="" alt="">
        <img src="/images/menu-dots.png" alt="">
        <img src="/images/user.png" alt="">
    </div>
</div>
{#if showMain}

    
{/if}