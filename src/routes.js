// اول page vehicle
import Vehcile from "./pages/Vehcile.svelte";
import Vesidebar from "./pages/Vesidebar.svelte";
import Fuelog from "./pages/Fuelog.svelte";
import Schedule from "./pages/Schedule.svelte";
import Parts from "./pages/Parts.svelte";
import Attachment from "./pages/Attachment.svelte";
import Partsmanage from "./pages/PartsManage.svelte";
import Driver from "./pages/Driver.svelte";
import Vendors from "./pages/Vendors.svelte";
import Reports from "./pages/Reports.svelte";
import Employing from "./pages/Employing.svelte";
import Reposparts from "./pages/Reposparts.svelte";
import Main from "./header/Main.svelte";
import Api from "./pages/Api.svelte";
import Officer from "./pages/Officer.svelte";
import All from "./pages/All.svelte"
// socend page 
import Service from "./pages/Service.svelte";
export default {
  "/": Vehcile,
  "/vesidebar": Vesidebar, // الصفحة الر��يسية للمستخدمين المسجلين
  "/fuelog": Fuelog,
  "/schedule": Schedule,
  "/parts": Parts, 
  "/attachment": Attachment,
  "/service": Service,//socend page
  "/part": Partsmanage,
  "/officer":Officer,
  "/driver": Driver,
  "/vendors":Vendors,
  "/reports":Reports,
  "/employing":Employing,
  "/reposparts":Reposparts,
  "/main":Main,
  "/api":Api,
  "/all":All,
};
