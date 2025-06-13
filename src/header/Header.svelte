<script>
    import { link } from 'svelte-spa-router';
    import { onMount } from 'svelte';

    const navItems = [
        { href: '/', text: 'المركبات', icon: '🚗' },
        { href: '/service', text: 'الصيانة', icon: '🔧' },
        { href: '/part', text: 'قطع الغيار', icon: '⚙️' },
        { href: '/reposparts', text: ' مخزن قطع الغيار ', icon: '📦' },
        { href: '/driver', text: 'السائقين', icon: '👥' },
        { href: '/vendors', text: 'الموردين', icon: '🏭' },
        { href: '/employing', text: 'تشغيل', icon: '👨‍✈️' },
        { href: '/reports', text: 'التقارير', icon: '📊' },
    ];

    let activeLink = '/';
    let isMenuOpen = false;

    onMount(() => {
        if (typeof window !== 'undefined') {
            activeLink = window.location.pathname;
        }
    });

    function handleNavClick(path) {
        activeLink = path;
        isMenuOpen = false;
    }
</script>

<header class="glass-navbar">
    <!-- الشعار -->
    <a use:link href="/" class="logo" on:click={() => handleNavClick('/')}>
        <div class="logo-icon">🚘</div>
        <span class="logo-text">Car<span>Flow</span></span>
    </a>

    <!-- القائمة الرئيسية -->
    <nav class:open={isMenuOpen}>
        <ul>
            {#each navItems as item}
                <li>
                    <a 
                        use:link 
                        href={item.href}
                        class="nav-link {activeLink === item.href ? 'active' : ''}"
                        on:click={() => handleNavClick(item.href)}
                    >
                        <span class="nav-icon">{item.icon}</span>
                        <span class="nav-text">{item.text}</span>
                        <span class="link-underline"></span>
                    </a>
                </li>
            {/each}
        </ul>
    </nav>

    <!-- زر القائمة للجوال -->
    <button 
        class="hamburger {isMenuOpen ? 'open' : ''}" 
        on:click={() => isMenuOpen = !isMenuOpen}
    >
        <span></span>
        <span></span>
        <span></span>
    </button>
</header>

<style>
    /* الألوان */
    :root {
        --primary: #4361ee;
        --primary-light: #4895ef;
        --dark: #1a1a2e;
        --light: #f8f9fa;
        --white: #ffffff;
        --glass: rgb(255, 255, 255);
    }

    /* التصميم العام */
    .glass-navbar {
        /* position: fixed; */
        top: 0;
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 2rem;
        background: var(--glass);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        transition: all 0.3s ease;
    }

    /* الشعار */
    .logo {
        display: flex;
        align-items: center;
        text-decoration: none;
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--dark);
    }

    .logo-icon {
        margin-right: 0.5rem;
        font-size: 1.8rem;
        transition: transform 0.3s;
    }

    .logo:hover .logo-icon {
        transform: rotate(15deg);
    }

    .logo-text span {
        color: var(--primary);
    }

    /* القائمة */
    nav ul {
        display: flex;
        list-style: none;
        margin: 0;
        padding: 0;
        gap: 1.5rem;
    }

    .nav-link {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-decoration: none;
        color: var(--dark);
        font-weight: 500;
        padding: 0.5rem 0;
        transition: all 0.3s ease;
    }

    .nav-link:hover {
        color: var(--primary);
    }

    .nav-link.active {
        color: var(--primary);
        font-weight: 600;
    }

    .nav-icon {
        font-size: 1.4rem;
        margin-bottom: 0.3rem;
        transition: transform 0.3s;
    }

    .nav-link:hover .nav-icon {
        transform: scale(1.2);
    }

    .link-underline {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 0;
        height: 2px;
        background: var(--primary);
        transition: width 0.3s ease;
    }

    .nav-link:hover .link-underline,
    .nav-link.active .link-underline {
        width: 100%;
    }

    /* زر القائمة للجوال */
    .hamburger {
        display: none;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.5rem;
        flex-direction: column;
        justify-content: space-between;
        width: 30px;
        height: 20px;
    }

    .hamburger span {
        display: block;
        width: 100%;
        height: 2px;
        background: var(--dark);
        transition: all 0.3s ease;
    }

    .hamburger.open span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }

    .hamburger.open span:nth-child(2) {
        opacity: 0;
    }

    .hamburger.open span:nth-child(3) {
        transform: rotate(-45deg) translate(5px, -5px);
    }

    /* التصميم المتجاوب */
    @media (max-width: 768px) {
        .glass-navbar {
            padding: 1rem;
        }

        nav {
            position: fixed;
            top: 70px;
            left: 0;
            width: 100%;
            background: var(--glass);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
            clip-path: polygon(0 0, 100% 0, 100% 0, 0 0);
            transition: clip-path 0.4s ease;
        }

        nav.open {
            clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
        }

        nav ul {
            flex-direction: column;
            gap: 0;
        }

        nav li {
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }

        .nav-link {
            padding: 1rem;
            flex-direction: row;
            justify-content: flex-start;
            gap: 1rem;
        }

        .link-underline {
            display: none;
        }

        .hamburger {
            display: flex;
        }
    }
</style>