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
import IllustratorCreate from "components/pages/Illustrator/IllustratorCreate";
import IllustratorEdit from "components/pages/Illustrator/IllustratorEdit";
import IllustratorList from "components/pages/Illustrator/IllustratorList";
import LiteraryAgencyList from "components/pages/LiteraryAgency/LiteraryAgencyList";
import TranslatorEdit from "components/pages/Translator/TranslatorEdit";
import TranslatorCreate from "components/pages/Translator/TranslatorCreate";
import TranslatorList from "components/pages/Translator/TranslatorList";
import PublisherList from "components/pages/Publisher/PublisherList";
import BookList from "components/pages/Book/BookList";
import BookCreate from "components/pages/Book/BookCreate";
import BookEdit from "components/pages/Book/BookEdit";
import CategoryList from "components/pages/Category/CategoryList";
import BookDetails from "components/pages/Book/BookDetails";
import PublisherCreate from "components/pages/Publisher/PublisherCreate";
import PublisherEdit from "components/pages/Publisher/PublisherEdit";
import AuthorList from "components/pages/Author/AuthorList";
import AuthorCreate from "components/pages/Author/AuthorCreate";
import AuthorEdit from "components/pages/Author/AuthorEdit";
import NewsList from "components/pages/News/NewsList";
import NewsCreate from "components/pages/News/NewsCreate";
import NewsEdit from "components/pages/News/NewsEdit";
import MediaList from "components/pages/Media/MediaList";
import MediaCreate from "components/pages/Media/MediaCreate";
import MediaEdit from "components/pages/Media/MediaEdit";
import LiteraryAgencyCreate from "components/pages/LiteraryAgency/LiteraryAgencyCreate";
import LiteraryAgencyEdit from "components/pages/LiteraryAgency/LiteraryAgencyEdit";
import GrantList from "components/pages/Grant/GrantList";

var routes = [
    {
        path: "/publishers/create",
        name: "Publisher Create",
        component: PublisherCreate,
        layout: "/admin",
    },
    {
        path: "/publishers/:id/edit",
        name: "Publisher Edit",
        component: PublisherEdit,
        layout: "/admin",
    },
    {
        path: "/publishers",
        name: "Publishers",
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
        name: "Book Edit",
        component: BookEdit,
        layout: "/admin",
    },
    {
        path: "/books/:id",
        name: "Book Details",
        component: BookDetails,
        layout: "/admin",
    },
    {
        path: "/books",
        name: "Books",
        component: BookList,
        layout: "/admin",
    },
    {
        path: "/authors/create",
        name: "authors",
        component: AuthorCreate,
        layout: "/admin",
    },
    {
        path: "/authors/:id/edit",
        name: "authors",
        component: AuthorEdit,
        layout: "/admin",
    },
    {
        path: "/authors",
        name: "authors",
        component: AuthorList,
        layout: "/admin",
    },
    {
        path: "/categories",
        name: "Categories",
        component: CategoryList,
        layout: "/admin",
    },
    {
        path: "/news/create",
        name: "News",
        component: NewsCreate,
        layout: "/admin",
    },
    {
        path: "/news/:id/edit",
        name: "News",
        component: NewsEdit,
        layout: "/admin",
    },
    {
        path: "/news",
        name: "News",
        component: NewsList,
        layout: "/admin",
    },
    {
        path: "/medias/create",
        name: "Medias",
        component: MediaCreate,
        layout: "/admin",
    },
    {
        path: "/medias/:id/edit",
        name: "Medias",
        component: MediaEdit,
        layout: "/admin",
    },
    {
        path: "/medias",
        name: "Medias",
        component: MediaList,
        layout: "/admin",
    },
    {
        path: "/translators/create",
        name: "Translators",
        component: TranslatorCreate,
        layout: "/admin",
    },
    {
        path: "/translators/:id/edit",
        name: "Translators",
        component: TranslatorEdit,
        layout: "/admin",
    },
    {
        path: "/translators",
        name: "Translators",
        component: TranslatorList,
        layout: "/admin",
    },
    {
        path: "/illustrators/create",
        name: "Illustrators",
        component: IllustratorCreate,
        layout: "/admin",
    },
    {
        path: "/illustrators/:id/edit",
        name: "Illustrators",
        component: IllustratorEdit,
        layout: "/admin",
    },
    {
        path: "/illustrators",
        name: "Illustrators",
        component: IllustratorList,
        layout: "/admin",
    },
    {
        path: "/literary-agencies/create",
        name: "Literary Agencies",
        component: LiteraryAgencyCreate,
        layout: "/admin",
    },
    {
        path: "/literary-agencies/:id/edit",
        name: "Literary Agencies",
        component: LiteraryAgencyEdit,
        layout: "/admin",
    },
    {
        path: "/literary-agencies",
        name: "Literary Agencies",
        component: LiteraryAgencyList,
        layout: "/admin",
    },
    {
        path: "/grants",
        name: "Literary Agencies",
        component: GrantList,
        layout: "/admin",
    },
    {
        path: "/admins",
        name: "Admins",
        component: UserList,
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
