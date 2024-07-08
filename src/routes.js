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
import UserList from "./components/pages/Users/UserList";
import TopUpList from "./components/pages/TopUp/TopUpList";
import TopUpHistory from "./components/pages/TopUp/TopUpHistory";
import Schedule from "./components/pages/Schedule/Schedule";
import ReferralList from "./components/pages/Referral/ReferralList";
import PromotionList from "./components/pages/Promotion/PromotionList";
import LoyaltyShopList from "./components/pages/LoyaltyShop/LoyaltyShopList.";
import OrderList from "./components/pages/Order/OrderList";
import OrderCreate from "components/pages/Order/OrderCreate";
import Notification from './components/pages/Messaging/Notification'
import OrderCreateV2 from "./components/pages/Order/OrderCreateV2";
import LoyaltyHistory from "components/pages/LoyaltyShop/LoyaltyHistory";
import LoyaltyHistoryCreate from "components/pages/LoyaltyShop/LoyaltyHistoryCreate";
import TournamentList from "components/pages/Tournament/TournamentList";
import TournamentDetail from "components/pages/Tournament/TournamentDetail";
import Dashboard from "components/pages/Dashboard/Dashboard";

var routes = [
    {
        path: "/dashboard",
        name: "Dashboard",
        component: Dashboard,
        layout: "/admin"
    },
    {
        path: "/admins",
        name: "Admins",
        component: AdminList,
        layout: "/admin",
    },
    {
        path: "/users",
        name: "Users",
        component: UserList,
        layout: "/admin",
    },
    {
        path: "/top-up-history",
        name: "Top Up",
        component: TopUpHistory,
        layout: "/admin",
    },
    {
        path: "/top-up-list",
        name: "Top Up",
        component: TopUpList,
        layout: "/admin",
    },
    {
        path: "/schedule",
        name: "Schedule",
        component: Schedule,
        layout: "/admin",
    },
    {
        path: "/orders/create",
        name: "Order Create",
        component: OrderCreateV2,
        layout: "/admin",
    },
    {
        path: "/orders",
        name: "Order",
        component: OrderList,
        layout: "/admin",
    },
    {
        path: "/referral",
        name: "Referral",
        component: ReferralList,
        layout: "/admin",
    },
    {
        path: "/messaging",
        name: "Notification",
        component: Notification,
        layout: "/admin",
    },
    {
        path: "/loyalty-shop-catalog",
        name: "Loyalty Shop",
        component: LoyaltyShopList,
        layout: "/admin",
    },
    {
        path: "/loyalty-history/create",
        name: "Loyalty History Create",
        component: LoyaltyHistoryCreate,
        layout: "/admin",
    },
    {
        path: "/loyalty-history",
        name: "Loyalty History",
        component: LoyaltyHistory,
        layout: "/admin",
    },
    {
        path: "/promotion",
        name: "Promotion",
        component: PromotionList,
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
    {
        path: "/tournament/:id",
        name: "Tournament Detail",
        layout: "/admin",
        component: TournamentDetail,
    },
    {
        path: "/tournament",
        name: "Tournament",
        layout: "/admin",
        component: TournamentList,
    },

];
export default routes;
