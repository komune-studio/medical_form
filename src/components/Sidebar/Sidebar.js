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
import { NavLink as NavLinkRRD, Link, useHistory } from "react-router-dom";
// nodejs library to set properties for components
import { PropTypes } from "prop-types";

import logo from "../../assets/img/brand/barcode.png"

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

const SIDEBAR = [
    // {
    //     path: "/dashboard",
    //     name: "Dashboard",
    //     icon: "material-symbols:bar-chart-rounded",
    //     color : Palette.THEME_YELLOW
    // },
    {
        path: "/books",
        name: "Dashboard",
        icon: "bxs:book",
        color : Palette.BARCODE_ORANGE
    },    
    {
        path: "/publishers",
        name: "Penerbit",
        icon: "mdi:user-group",
        color: Palette.BARCODE_ORANGE
    },
    {
        path: "/categories",
        name: "Kategori",
        icon: "material-symbols:view-list-rounded",
        color : Palette.BARCODE_ORANGE
    },
    {
        path: "/admins",
        name: "Admin",
        icon: "material-symbols:person",
        color: Palette.BARCODE_ORANGE
    },
    // {
    //     path: "/banners",
    //     name: "Banners",
    //     icon: "mdi:image-multiple-outline",
    //     color : Palette.THEME_ORANGE
    // },
]

const Sidebar = (props) => {
    const history = useHistory();
    const [collapseOpen, setCollapseOpen] = useState();
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
    // creates the links that appear in the left menu / Sidebar
    const createLinks = (routes) => {
        return SIDEBAR.map((prop, key) => {

            let tint = Palette.INACTIVE_GRAY

            if(activeRoute(prop.path)){
                tint = Palette.BARCODE_ORANGE
            }
            return (
                <NavItem
                    // style={{
                    //   borderLeft: `15px solid ${Palette.CATALYST_BLUE}`
                    // }}
                    key={key}>
                    <NavLink
                        to={prop.path}
                        tag={NavLinkRRD}
                        onClick={closeCollapse}
                        color={prop.color}
                    // className={"active"}
                    >
                        <Iconify
                            style={{
                                color: tint,
                                marginRight: "1rem",
                                lineHeight: "1.5rem",
                                fontSize: "1.05rem"
                            }}
                            icon={prop.icon} />
                        {/*<i className={prop.icon} />*/}
                        <div style={{color : tint}}>{prop.name}</div>
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
            style={{background : Palette.BACKGROUND_BLACK}}
        >
            <Container fluid>
                {/* Toggler */}
                <button
                    className="navbar-toggler"
                    type="button"
                    onClick={toggleCollapse}
                >
                    <span className="navbar-toggler-icon" />
                </button>
                {/* Brand */}
                {/* {logo ? (
                    <NavbarBrand className="pt-0" {...navbarBrandProps}>
                        <img
                            style={{
                                marginTop: 30
                            }}
                            alt={logo.imgAlt}
                            className="navbar-brand-img"
                            src={logo.imgSrc}
                        />
                    </NavbarBrand>
                ) : null} */}
                {/* User */}
                {/* Collapse */}
                <Collapse navbar isOpen={collapseOpen}>
                    {/* Collapse header */}
                    <div className="d-flex align-items-start justify-content-start mb-2">
                        <img 
                            style={{height : 30, objectFit : "contain"}}
                            src={logo}/>
                    </div>
                    
                    {/* Navigation */}
                    <Nav navbar>{createLinks(routes)}</Nav>
                    {/* Divider */}
                    <hr className="my-3" />
                    {/* Navigation */}
                    <Nav className="mb-md-3" navbar>
                        <NavItem>
                            <NavLink
                                onClick={() => {
                                    localStorage.removeItem("super_token")
                                    localStorage.removeItem("username")
                                    localStorage.removeItem("token")
                                    localStorage.removeItem("role")

                                    sessionStorage.removeItem("super_token")
                                    sessionStorage.removeItem("username")
                                    sessionStorage.removeItem("role")
                                    sessionStorage.removeItem("token")
                                    history.push('/login')
                                    window.location.reload()
                                }}
                                href="javascript:;">
                                <Iconify
                                    style={{
                                        marginRight: "1rem",
                                        lineHeight: "1.5rem",
                                        fontSize: "1.05rem"
                                    }}
                                    icon="ri:logout-circle-r-line" />
                                Keluar
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
        // it will be rendered as <Link to="...">...</Link> tag
        innerLink: PropTypes.string,
        // outterLink is for links that will direct the user outside the app
        // it will be rendered as simple <a href="...">...</a> tag
        outterLink: PropTypes.string,
        // the image src of the logo
        imgSrc: PropTypes.string.isRequired,
        // the alt for the img
        imgAlt: PropTypes.string.isRequired
    })
};

export default Sidebar;
