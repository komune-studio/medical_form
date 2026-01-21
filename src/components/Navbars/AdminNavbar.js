import { Link, useHistory } from "react-router-dom";
import { UserOutlined } from '@ant-design/icons';
import { Avatar } from 'antd';
import {
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  DropdownToggle,
  Navbar,
  Nav,
  Media
} from "reactstrap";

const AdminNavbar = () => {
  const history = useHistory();
  const adminName = localStorage.getItem('admin_name') || '-';

  const logout = () => {
    localStorage.removeItem("super_token");
    localStorage.removeItem("username");
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    sessionStorage.removeItem("super_token");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("token");

    history.push('/login');
    window.location.reload();
  };

  return (
    <Navbar
      className="navbar-top justify-content-end"
      expand="md"
      id="navbar-main"
      style={{
        backgroundColor: '#fff', // optional: biar kontras
      }}
    >
      <Nav className="align-items-center d-none d-md-flex mx-3" navbar>
        <UncontrolledDropdown nav>
          <DropdownToggle
            className="pr-0"
            nav
            style={{ color: '#000' }} // FIX dropdown text
          >
            <Media className="align-items-center">
              <Media className="mr-2 d-none d-lg-block">
                <span
                  className="mb-0 text-sm font-weight-bold"
                  style={{ color: '#000' }} // FIX admin name
                >
                  {adminName}
                </span>
              </Media>

              <Avatar
                size="large"
                icon={<UserOutlined />}
                style={{
                  backgroundColor: '#f0f0f0',
                  color: '#000', // FIX avatar icon
                }}
              />
            </Media>
          </DropdownToggle>

          <DropdownMenu className="dropdown-menu-arrow" right>
            <DropdownItem onClick={logout} style={{ color: '#000' }}>
              <i
                className="ni ni-user-run"
                style={{ color: '#000', marginRight: 8 }}
              />
              Logout
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>
      </Nav>
    </Navbar>
  );
};

export default AdminNavbar;
