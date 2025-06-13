<script>
  import Router from 'svelte-spa-router'; // تعديل الاستيراد
  import routes from './routes.js';
  import { link } from 'svelte-spa-router'; // لتفعيل التنقل بدون إعادة تحميل الصفحة
  import Header from './header/Header.svelte';
  import Vehcile from './pages/Vehcile.svelte';
  import Headeve from './header/Headeve.svelte';
  import Main from './header/Main.svelte';
</script>

<div>
  <!-- <Header/>   -->
   <Main/>
  <Router {routes} />
</div>
