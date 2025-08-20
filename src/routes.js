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
import UserList from "./components/pages/Users/UserList";
import IlustratorList from "components/pages/Ilustrator/IlustratorList";
import LiteraryAgencyList from "components/pages/LiteraryAgency/LiteraryAgencyList";
import TranslatorList from "components/pages/Translator/TranslatorList";
import PublisherList from "components/pages/Publisher/PublisherList";
import BookList from "components/pages/Book/BookList";
import BookCreate from "components/pages/Book/BookCreate";
import BookEdit from "components/pages/Book/BookEdit";
import CategoryList from "components/pages/Category/CategoryList";
import BookDetails from "components/pages/Book/BookDetails";

var routes = [
    {
        path: "/users",
        name: "Users",
        component: UserList,
        layout: "/admin",
    },
    {
        path: "/publishers",
        name: "Publisher",
        component: PublisherList,
        layout: "/admin",
    },
    {
        path: "/books/create",
        name: "Book Create",
        component: BookCreate,
        layout: "/admin",
    },
    {
        path: "/books/:id/edit",
        name: "Book",
        component: BookEdit,
        layout: "/admin",
    },
    {
        path: "/books/:id",
        name: "Book",
        component: BookDetails,
        layout: "/admin",
    },
    {
        path: "/books",
        name: "Book",
        component: BookList,
        layout: "/admin",
    },
    {
        path: "/categories",
        name: "Category",
        component: CategoryList,
        layout: "/admin",
    },
    {
        path: "/translator",
        name: "Translator",
        component: TranslatorList,
        layout: "/admin",
    },
    {
        path: "/ilustrator",
        name: "Ilustrator",
        component: IlustratorList,
        layout: "/admin",
    },
    {
        path: "/literaryAgency",
        name: "Literary Agency",
        component: LiteraryAgencyList,
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
