/*!

=========================================================
* Argon Dashboard React - v1.2.2
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-dashboard-react
* Copyright 2022 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/argon-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import Logout from "./components/pages/Logout";
import Login from "./components/pages/Login";
import AdminList from "./components/pages/Admins/AdminList";

var routes = [
  {
    path: "/admins",
    name: "Admins",
    component: AdminList,
    layout: "/admin",
  },  
  {
    path: "/login",
    name: "Login",
    component: Login,
    layout: "/auth",
  },
  {
    path: "/logout",
    name: "Logout",
    layout: "/admin",
    component: Logout,
  },
];
export default routes;
