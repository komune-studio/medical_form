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
/*eslint-disable*/
import { useState } from "react";
import { 
  NavLink as NavLinkRRD, 
  Link, 
  useHistory,
  useLocation  // ✅ IMPORT useLocation
} from "react-router-dom";
// nodejs library to set properties for components
import { PropTypes } from "prop-types";

import logo from "../../assets/img/brand/Logo_ReadIndonesia.png"

// reactstrap components
import {
    Button,
    Card,
    CardHeader,
    CardBody,
    CardTitle,
    Collapse,
    DropdownMenu,
    DropdownItem,
    UncontrolledDropdown,
    DropdownToggle,
    FormGroup,
    Form,
    Input,
    InputGroupAddon,
    InputGroupText,
    InputGroup,
    Media,
    NavbarBrand,
    Navbar,
    NavItem,
    NavLink,
    Nav,
    Progress,
    Table,
    Container,
    Row,
    Col
} from "reactstrap";
import Iconify from "../reusable/Iconify";
import Palette from "../../utils/Palette";

// Mengubah SIDEBAR_COLOR dari biru menjadi putih
const SIDEBAR_COLOR = "#FFFFFF";

const SIDEBAR = [
    {
        path: "/visitors",
        name: "Visitors",
        icon: "mdi:account-group",
        color: SIDEBAR_COLOR
    },
    {
        path: "/staff",
        name: "Staff",
        icon: "mdi:badge",
        color: SIDEBAR_COLOR
    },
    {
        path: "/form",
        name: "Form",
        icon: "mdi:clipboard-text",
        color: SIDEBAR_COLOR
    }
]

const Sidebar = (props) => {
    const history = useHistory();
    const location = useLocation(); // ✅ Pakai useLocation
    const [collapseOpen, setCollapseOpen] = useState();
    
    // ✅ CEK: Jika pathname adalah /form, return null (tidak render sidebar)
    if (location.pathname.startsWith('/form')) {
        return null;
    }
    
    // verifies if routeName is the one active (in browser input)
    const activeRoute = (routeName) => {
        return props.location.pathname.indexOf(routeName) > -1 ? "active" : "";
    };
    
    // toggles collapse between opened and closed (true/false)
    const toggleCollapse = () => {
        setCollapseOpen((data) => !data);
    };
    
    // closes the collapse
    const closeCollapse = () => {
        setCollapseOpen(false);
    };
    
    // Handle logout
    const handleLogout = () => {
        localStorage.removeItem("super_token");
        localStorage.removeItem("username");
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("admin_name");

        sessionStorage.removeItem("super_token");
        sessionStorage.removeItem("username");
        sessionStorage.removeItem("role");
        sessionStorage.removeItem("token");

        history.push('/login');
        window.location.reload();
    };
    
    // creates the links that appear in the left menu / Sidebar
    const createLinks = (routes) => {
        return SIDEBAR.map((prop, key) => {

            let tint = Palette.INACTIVE_GRAY

            if(activeRoute(prop.path)){
                tint = SIDEBAR_COLOR
            }
            return (
                <NavItem
                    key={key}>
                    <NavLink
                        to={prop.path}
                        tag={NavLinkRRD}
                        onClick={closeCollapse}
                    >
                        <Iconify
                            style={{
                                color: tint,
                                marginRight: "1rem",
                                lineHeight: "1.5rem",
                                fontSize: "1.05rem"
                            }}
                            icon={prop.icon} />
                        <div style={{color : tint, fontWeight:600}}>{prop.name}</div>
                    </NavLink>
                </NavItem>
            );
        });
    };

    const { bgColor, routes } = props;
    let navbarBrandProps;
    if (logo && logo.innerLink) {
        navbarBrandProps = {
            to: logo.innerLink,
            tag: Link
        };
    } else if (logo && logo.outterLink) {
        navbarBrandProps = {
            href: logo.outterLink,
            target: "_blank"
        };
    }

    return (
        <Navbar
            className="navbar-vertical fixed-left"
            expand="md"
            id="sidenav-main"
            style={{ background: Palette.BACKGROUND_BLACK }}
        >
            <Container fluid>
                {/* Toggler */}
                <button
                    className="navbar-toggler"
                    type="button"
                    onClick={toggleCollapse}
                >
                    <span className="navbar-toggler-icon">
                        <Iconify
                            style={{
                                marginRight: "1rem",
                                lineHeight: "1.5rem",
                                fontSize: "30px",
                                color: "white"
                            }}
                            icon="mdi:menu" />
                    </span>
                </button>
                {/* Collapse */}
                <Collapse navbar isOpen={collapseOpen}>
                    {/* Collapse header */}
                    <div className="d-flex align-items-start justify-content-start mb-2 mt-n5">
                        <img
                            style={{ height: 200, objectFit: "cover", width: "100%" }}
                            src={logo} />
                    </div>
                    {/* Navigation */}
                    <Nav navbar>{createLinks(routes)}</Nav>
                    {/* Divider */}
                    <hr className="my-3" style={{ borderColor: "rgba(255, 255, 255, 0.1)" }} />
                    
                    {/* Logout Navigation */}
                    <Nav className="mb-md-3" navbar>
                        <NavItem>
                            <NavLink
                                onClick={handleLogout}
                                style={{ cursor: "pointer" }}
                            >
                                <Iconify
                                    style={{
                                        color: Palette.INACTIVE_GRAY,
                                        marginRight: "1rem",
                                        lineHeight: "1.5rem",
                                        fontSize: "1.05rem"
                                    }}
                                    icon="mdi:logout" />
                                <div style={{color: Palette.INACTIVE_GRAY, fontWeight: 600}}>Logout</div>
                            </NavLink>
                        </NavItem>
                    </Nav>
                </Collapse>
            </Container>
        </Navbar>
    );
};

Sidebar.defaultProps = {
    routes: [{}]
};

Sidebar.propTypes = {
    // links that will be displayed inside the component
    routes: PropTypes.arrayOf(PropTypes.object),
    logo: PropTypes.shape({
        // innerLink is for links that will direct the user within the app
        innerLink: PropTypes.string,
        // outterLink is for links that will direct the user outside the app
        outterLink: PropTypes.string,
        // the image src of the logo
        imgSrc: PropTypes.string.isRequired,
        // the alt for the img
        imgAlt: PropTypes.string.isRequired
    })
};

export default Sidebar;