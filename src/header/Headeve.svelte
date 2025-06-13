<script>    
      import { link } from 'svelte-spa-router'; // لتفعيل التنقل بدون إعادة تحميل الصفحة<
      import Header from './Header.svelte';
</script>

<div class="main">
    <div class="header-top">
      <h2>
        مركبات
      </h2>
      <p>اداراه المركبات, سجل فوري , اجزاء, خدمات</p>
    </div>
   
</div>
<div  class="bottom">
    <a use:link href="/vesidebar">
    <img src="./images/add.png" alt="">عام</a>
    <a use:link href="/fuelog">
        <img src="./images/gas-station.png" alt="">سجلات البنزين</a>
    <a use:link href="/schedule">
        <img src="./images/schedule.png" alt="">طلبات الصيانه</a>
    <a use:link href="/parts">
        <!-- <img src="./images/wrench.png" alt="">قطع غيار </a>
    <a use:link href="/attachment"> -->
        <img src="./images/attach.png" alt="">ارفاق ملف</a>
    <!-- <a use:link href="/all">
        <img src="./images/attach.png" alt="">ارفاق ملف</a> -->
</div>

<style>
.main{
    flex-direction: row;
    text-align: center;
    gap: 30px;
    width: 100%;
    text-align: start;
    }
      .header-top {
    align-items: flex-start;
    background-color: #4361EE;
    
      }
  .header-top h2{
    margin-right: 10px;
    color:white;
  }
  .header-top p{
    margin-right: 5px;
    margin-bottom: 5px;
    color:white;

  }
    .bottom{
        padding-right: 18px;
        display: flex;
        flex-direction: row;
        text-align: center;
        margin: 10px;
        gap: 30px;
        background-color: rgba(255, 255, 255, 0.17);
    }
    a{
        text-decoration: none;
        color: rgb(24, 24, 24); 
        cursor: pointer;
        text-align: center;
        display: flex;
        align-items: center;
    }
    img{
        width: 25px;
        height: 25px;
    
    }
</style>
