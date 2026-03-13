/*eslint-disable*/
import { useState } from "react";
import {
    NavLink as NavLinkRRD,
    Link,
    useHistory,
    useLocation
} from "react-router-dom";
import { PropTypes } from "prop-types";
import logo from "../../assets/img/brand/Logo_ReadIndonesia.png"
import {
    Collapse,
    Navbar,
    NavItem,
    NavLink,
    Nav,
    Container,
} from "reactstrap";
import Iconify from "../reusable/Iconify";
import Palette from "../../utils/Palette";

const SIDEBAR_COLOR = "#FFFFFF";

// Menu ADMIN — semua akses
const SIDEBAR_ADMIN = [
    { path: "/patients",        name: "Patients",        icon: "mdi:account-group" },
    { path: "/medical-history", name: "Medical History", icon: "mdi:history"       },
    { path: "/staff",           name: "Staff",           icon: "mdi:badge"         },
    { path: "/user-management", name: "User Management", icon: "mdi:account-cog"   },
];

// Menu DOCTOR — tanpa Staff & User Management, tambah Form
const SIDEBAR_DOCTOR = [
    { path: "/patients",        name: "Patients",        icon: "mdi:account-group" },
    { path: "/medical-history", name: "Medical History", icon: "mdi:history"       },
    { path: "/form",            name: "Form",            icon: "mdi:file-document-edit" },
];

const Sidebar = (props) => {
    const history = useHistory();
    const location = useLocation();
    const [collapseOpen, setCollapseOpen] = useState();

    if (location.pathname.startsWith('/form')) {
        return null;
    }

    const role = localStorage.getItem('role');
    const isAdmin = role === 'ADMIN';
    const adminName = localStorage.getItem('admin_name') || 'User';

    const SIDEBAR = isAdmin ? SIDEBAR_ADMIN : SIDEBAR_DOCTOR;

    const activeRoute = (routeName) => {
        return props.location.pathname.indexOf(routeName) > -1 ? "active" : "";
    };

    const toggleCollapse = () => setCollapseOpen((data) => !data);
    const closeCollapse = () => setCollapseOpen(false);

    const handleLogout = () => {
        localStorage.removeItem("super_token");
        localStorage.removeItem("username");
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("admin_name");
        localStorage.removeItem("user_id");
        sessionStorage.removeItem("super_token");
        sessionStorage.removeItem("username");
        sessionStorage.removeItem("role");
        sessionStorage.removeItem("token");
        history.push('/login');
        window.location.reload();
    };

    const createLinks = () => {
        return SIDEBAR.map((prop, key) => {
            const isActive = !!activeRoute(prop.path);
            const tint = isActive ? SIDEBAR_COLOR : Palette.INACTIVE_GRAY;

            return (
                <NavItem key={key}>
                    <NavLink
                        to={prop.path}
                        tag={NavLinkRRD}
                        onClick={closeCollapse}
                        style={{
                            background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                            borderRadius: 8,
                            marginBottom: 2
                        }}
                    >
                        <Iconify
                            style={{
                                color: tint,
                                marginRight: "1rem",
                                lineHeight: "1.5rem",
                                fontSize: "1.05rem"
                            }}
                            icon={prop.icon}
                        />
                        <div style={{ color: tint, fontWeight: 600 }}>{prop.name}</div>
                    </NavLink>
                </NavItem>
            );
        });
    };

    return (
        <Navbar
            className="navbar-vertical fixed-left"
            expand="md"
            id="sidenav-main"
            style={{ background: Palette.BACKGROUND_BLACK }}
        >
            <Container fluid>
                <button className="navbar-toggler" type="button" onClick={toggleCollapse}>
                    <span className="navbar-toggler-icon">
                        <Iconify
                            style={{ marginRight: "1rem", lineHeight: "1.5rem", fontSize: "30px", color: "white" }}
                            icon="mdi:menu"
                        />
                    </span>
                </button>

                <Collapse navbar isOpen={collapseOpen}>
                    {/* Logo */}
                    <div className="d-flex align-items-start justify-content-start mb-2 mt-n5">
                        <img style={{ height: 200, objectFit: "cover", width: "100%" }} src={logo} />
                    </div>

                    {/* Role badge */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 16px',
                        marginBottom: 8,
                        background: 'rgba(255,255,255,0.06)',
                        borderRadius: 8
                    }}>
                        <Iconify
                            icon={isAdmin ? "mdi:shield-account" : "mdi:doctor"}
                            style={{ color: isAdmin ? '#ffd700' : '#7eb8f7', fontSize: '1.1rem' }}
                        />
                        <div>
                            <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem', lineHeight: 1.2 }}>
                                {adminName}
                            </div>
                            <div style={{
                                color: isAdmin ? '#ffd700' : '#7eb8f7',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                letterSpacing: 1
                            }}>
                                {isAdmin ? 'ADMIN' : 'DOCTOR'}
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <Nav navbar>{createLinks()}</Nav>

                    <hr className="my-3" style={{ borderColor: "rgba(255, 255, 255, 0.1)" }} />

                    {/* Logout */}
                    <Nav className="mb-md-3" navbar>
                        <NavItem>
                            <NavLink onClick={handleLogout} style={{ cursor: "pointer" }}>
                                <Iconify
                                    style={{
                                        color: Palette.INACTIVE_GRAY,
                                        marginRight: "1rem",
                                        lineHeight: "1.5rem",
                                        fontSize: "1.05rem"
                                    }}
                                    icon="mdi:logout"
                                />
                                <div style={{ color: Palette.INACTIVE_GRAY, fontWeight: 600 }}>Logout</div>
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
    routes: PropTypes.arrayOf(PropTypes.object),
    logo: PropTypes.shape({
        innerLink: PropTypes.string,
        outterLink: PropTypes.string,
        imgSrc: PropTypes.string.isRequired,
        imgAlt: PropTypes.string.isRequired
    })
};

export default Sidebar;