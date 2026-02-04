import Logout from "./components/pages/Logout";
import Login from "./components/pages/Login";
import UserList from "./components/pages/Users/UserList";
import VisitorList from "components/pages/Visitors/VisitorList";
import VisitorCreate from "components/pages/Visitors/VisitorCreate";
import VisitorEdit from "components/pages/Visitors/VisitorEdit";
import VisitorFormStandalone from "components/pages/Visitors/VisitorFormStandalone";
import StaffList from "components/pages/Staff/StaffList";
import StaffCreate from "components/pages/Staff/StaffCreate";
import StaffEdit from "components/pages/Staff/StaffEdit";
import PatientList from "components/pages/Patients/PatientList";
import PatientCreate from "components/pages/Patients/PatientCreate";
import PatientEdit from "components/pages/Patients/PatientEdit";


var routes = [
    // VISITORS
    {
        path: "/visitors/create",
        name: "Visitor Create",
        component: VisitorCreate,
        layout: "/admin",
    },
    {
        path: "/visitors/:id/edit",
        name: "Visitor Edit",
        component: VisitorEdit,
        layout: "/admin",
    },
    {
        path: "/visitors",
        name: "Visitors",
        component: VisitorList,
        layout: "/admin",
    },
    
    // PATIENTS
    {
        path: "/patients/create",
        name: "Patient Create",
        component: PatientCreate,
        layout: "/admin",
    },
    {
        path: "/patients/:id/edit",
        name: "Patient Edit",
        component: PatientEdit,
        layout: "/admin",
    },
    {
        path: "/patients",
        name: "Patients",
        component: PatientList,
        layout: "/admin",
    },
    
    // STAFF
    {
        path: "/staff/create",
        name: "Staff Create",
        component: StaffCreate,
        layout: "/admin",
    },
    {
        path: "/staff/:id/edit",
        name: "Staff Edit",
        component: StaffEdit,
        layout: "/admin",
    },
    {
        path: "/staff",
        name: "Staff",
        component: StaffList,
        layout: "/admin",
    },
    
    // STANDALONE FORM
    {
        path: "/form",
        name: "Form",
        icon: "mdi:clipboard-text",
        component: VisitorFormStandalone,
        layout: "/admin"
    },
    
    // USERS
    {
        path: "/admins",
        name: "Admins",
        component: UserList,
        layout: "/admin",
    },
    
    // AUTH
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