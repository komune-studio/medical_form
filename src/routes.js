import Logout from "./components/pages/Logout";
import Login from "./components/pages/Login";
import UserList from "./components/pages/Users/UserList";
import StaffList from "components/pages/Staff/StaffList";
import StaffCreate from "components/pages/Staff/StaffCreate";
import StaffEdit from "components/pages/Staff/StaffEdit";
import PatientList from "components/pages/Patients/PatientList";
import PatientCreate from "components/pages/Patients/PatientCreate";
import PatientEdit from "components/pages/Patients/PatientEdit";
import MedicalHistoryList from "components/pages/MedicalHistory/MedicalHistoryList";
import MedicalHistoryCreate from "components/pages/MedicalHistory/MedicalHistoryCreate";
import MedicalHistoryEdit from "components/pages/MedicalHistory/MedicalHistoryEdit";



var routes = [
    
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
    
    // MEDICAL HISTORY
    {
        path: "/medical-history/create",
        name: "Medical History Create",
        component: MedicalHistoryCreate,
        layout: "/admin",
    },
    {
        path: "/medical-history/:id/edit",
        name: "Medical History Edit",
        component: MedicalHistoryEdit,
        layout: "/admin",
    },
    {
        path: "/medical-history",
        name: "Medical History",
        component: MedicalHistoryList,
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