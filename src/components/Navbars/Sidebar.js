/*eslint-disable*/
import { useEffect, useState, useRef } from "react";
import { NavLink as NavLinkRRD, useHistory, useLocation } from "react-router-dom";
import { PropTypes } from "prop-types";
import logo from "../../assets/img/brand/Logo_ReadIndonesia.png";
import { Navbar, NavItem, NavLink, Nav, Container } from "reactstrap";
import Iconify from "../reusable/Iconify";
import Palette from "../../utils/Palette";

const SIDEBAR_COLOR = "#FFFFFF";

const SIDEBAR_ADMIN = [
    { path: "/patients",        name: "Patients",        icon: "mdi:account-group"      },
    { path: "/medical-history", name: "Medical History", icon: "mdi:history"            },
    { path: "/staff",           name: "Staff",           icon: "mdi:badge"              },
    { path: "/user-management", name: "User Management", icon: "mdi:account-cog"        },
];

const SIDEBAR_DOCTOR = [
    { path: "/patients",        name: "Patients",        icon: "mdi:account-group"      },
    { path: "/medical-history", name: "Medical History", icon: "mdi:history"            },
    { path: "/form",            name: "Form",            icon: "mdi:file-document-edit" },
];

const Sidebar = (props) => {
    const history = useHistory();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const sidebarRef = useRef(null);

    const role      = localStorage.getItem('role');
    const isAdmin   = role === 'ADMIN';
    const adminName = localStorage.getItem('admin_name') || 'User';
    const SIDEBAR   = isAdmin ? SIDEBAR_ADMIN : SIDEBAR_DOCTOR;

    // Lock body scroll when mobile drawer is open
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    // Close drawer when route changes
    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    // Close drawer on outside click
    useEffect(() => {
        if (!mobileOpen) return;
        const handler = (e) => {
            if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
                setMobileOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [mobileOpen]);

    if (location.pathname.startsWith('/form')) return null;

    const activeRoute = (routeName) =>
        props.location.pathname.indexOf(routeName) > -1 ? "active" : "";

    const handleLogout = () => {
        ['super_token','username','token','role','admin_name','user_id'].forEach(k => {
            localStorage.removeItem(k);
            sessionStorage.removeItem(k);
        });
        history.push('/login');
        window.location.reload();
    };

    const createLinks = () =>
        SIDEBAR.map((prop, key) => {
            const isActive = !!activeRoute(prop.path);
            const tint = isActive ? SIDEBAR_COLOR : Palette.INACTIVE_GRAY;
            return (
                <NavItem key={key}>
                    <NavLink
                        to={prop.path}
                        tag={NavLinkRRD}
                        onClick={() => setMobileOpen(false)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                            borderRadius: 8,
                            marginBottom: 2,
                            padding: '10px 16px',
                        }}
                    >
                        <Iconify style={{ color: tint, marginRight: "1rem", fontSize: "1.15rem", flexShrink: 0 }} icon={prop.icon} />
                        <span style={{ color: tint, fontWeight: 600, fontSize: '0.9rem' }}>{prop.name}</span>
                    </NavLink>
                </NavItem>
            );
        });

    // ── Shared sidebar content ──────────────────────────────────────────
    const SidebarContent = () => (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0 8px' }}>
            {/* Logo */}
            <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
                <img style={{ width: '100%', maxHeight: 160, objectFit: 'contain' }} src={logo} alt="logo" />
            </div>

            {/* Role badge */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 12px', marginBottom: 8,
                background: 'rgba(255,255,255,0.06)', borderRadius: 8
            }}>
                <Iconify
                    icon={isAdmin ? "mdi:shield-account" : "mdi:doctor"}
                    style={{ color: isAdmin ? '#ffd700' : '#7eb8f7', fontSize: '1.2rem', flexShrink: 0 }}
                />
                <div>
                    <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem', lineHeight: 1.2 }}>
                        {adminName}
                    </div>
                    <div style={{ color: isAdmin ? '#ffd700' : '#7eb8f7', fontSize: '0.7rem', fontWeight: 700, letterSpacing: 1 }}>
                        {isAdmin ? 'ADMIN' : 'DOCTOR'}
                    </div>
                </div>
            </div>

            {/* Nav links */}
            <Nav navbar style={{ flex: 1 }}>{createLinks()}</Nav>

            <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '12px 0' }} />

            {/* Logout */}
            <Nav navbar style={{ marginBottom: 8 }}>
                <NavItem>
                    <NavLink onClick={handleLogout} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '10px 16px' }}>
                        <Iconify style={{ color: Palette.INACTIVE_GRAY, marginRight: '1rem', fontSize: '1.15rem' }} icon="mdi:logout" />
                        <span style={{ color: Palette.INACTIVE_GRAY, fontWeight: 600, fontSize: '0.9rem' }}>Logout</span>
                    </NavLink>
                </NavItem>
            </Nav>
        </div>
    );

    return (
        <>
            {/* ── DESKTOP sidebar (md and up) ────────────────────────── */}
            <div className="d-none d-md-flex" style={{
                position: 'fixed', top: 0, left: 0,
                width: 250, height: '100vh',
                background: Palette.BACKGROUND_BLACK,
                flexDirection: 'column',
                zIndex: 1040,
                overflowY: 'auto',
            }}>
                <SidebarContent />
            </div>

            {/* ── MOBILE hamburger button ─────────────────────────────── */}
            <div className="d-flex d-md-none" style={{
                position: 'fixed', top: 12, left: 12, zIndex: 1060,
            }}>
                <button
                    onClick={() => setMobileOpen(true)}
                    style={{
                        background: Palette.BACKGROUND_BLACK,
                        border: 'none', borderRadius: 8,
                        padding: '6px 10px', cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
                    }}
                >
                    <Iconify icon="mdi:menu" style={{ color: '#fff', fontSize: 26 }} />
                </button>
            </div>

            {/* ── MOBILE overlay ──────────────────────────────────────── */}
            {mobileOpen && (
                <div
                    onClick={() => setMobileOpen(false)}
                    style={{
                        position: 'fixed', inset: 0,
                        background: 'rgba(0,0,0,0.55)',
                        zIndex: 1055,
                    }}
                />
            )}

            {/* ── MOBILE drawer ───────────────────────────────────────── */}
            <div
                ref={sidebarRef}
                className="d-md-none"
                style={{
                    position: 'fixed', top: 0, left: 0,
                    width: 260, height: '100vh',
                    background: Palette.BACKGROUND_BLACK,
                    zIndex: 1060,
                    overflowY: 'auto',
                    transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
                    transition: 'transform 0.28s cubic-bezier(.4,0,.2,1)',
                    boxShadow: mobileOpen ? '4px 0 24px rgba(0,0,0,0.5)' : 'none',
                }}
            >
                {/* Close button inside drawer */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 12px 0' }}>
                    <button
                        onClick={() => setMobileOpen(false)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}
                    >
                        <Iconify icon="mdi:close" style={{ color: '#fff', fontSize: 26 }} />
                    </button>
                </div>
                <SidebarContent />
            </div>
        </>
    );
};

Sidebar.defaultProps = { routes: [{}] };
Sidebar.propTypes = {
    routes: PropTypes.arrayOf(PropTypes.object),
    logo: PropTypes.shape({
        innerLink: PropTypes.string,
        outterLink: PropTypes.string,
        imgSrc: PropTypes.string.isRequired,
        imgAlt: PropTypes.string.isRequired,
    }),
};

export default Sidebar;