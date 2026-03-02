import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Space,
  Button as AntButton,
  Button,
  Tooltip,
  Input,
  Select,
  Popconfirm,
  message
} from 'antd';
import { Card, Row, CardBody, Container } from "reactstrap";
import Iconify from "../../reusable/Iconify";
import { Col } from "react-bootstrap";
import CustomTable from "../../reusable/CustomTable";
import StaffModel from 'models/StaffModel';
import create from 'zustand';

const { Search } = Input;

const useFilter = create((set) => ({
  search: "",
  status: "all",

  setSearch: (keyword) =>
    set((state) => ({
      search: keyword,
    })),
  setStatus: (status) =>
    set((state) => ({
      status: status,
    })),
  resetSearch: () =>
    set((state) => ({
      search: "",
      status: "all"
    })),
}));

const StaffList = () => {
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [dataSource, setDataSource] = useState([]);
  const [allData, setAllData] = useState([]); // store all data for client-side filtering
  const [refreshKey, setRefreshKey] = useState(0);

  const search = useFilter((state) => state.search);
  const status = useFilter((state) => state.status);
  const setSearch = useFilter((state) => state.setSearch);
  const setStatus = useFilter((state) => state.setStatus);
  const resetSearch = useFilter((state) => state.resetSearch);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (searchTerm) => {
    setSearch(searchTerm);
    setPage(0);
  };

  const handleStatusChange = (value) => {
    setStatus(value);
    setPage(0);
  };

  const columns = [
    {
      id: 'id', 
      label: 'ID', 
      filter: false,
      render: (row) => (
        <div style={{ fontWeight: 500, color: '#333' }}>{row.id}</div>
      )
    },
    {
      id: 'name', 
      label: 'Staff Name', 
      filter: true,
      render: (row) => (
        <div style={{ color: '#333' }}>{row.name}</div>
      )
    },
    {
      id: 'phone_number', 
      label: 'Phone', 
      filter: true,
      render: (row) => (
        <div style={{ color: '#333' }}>{row.phone_number}</div>
      )
    },
    {
      id: 'active', 
      label: 'Status', 
      filter: true,
      render: (row) => (
        <div style={{ 
          display: 'inline-block',
          padding: '4px 12px',
          background: row.active ? '#f6ffed' : '#fff2f0', 
          color: row.active ? '#52c41a' : '#ff4d4f',
          borderRadius: '4px',
          border: `1px solid ${row.active ? '#b7eb8f' : '#ffccc7'}`,
          fontSize: '13px',
          fontWeight: '500'
        }}>
          {row.active ? 'ACTIVE' : 'INACTIVE'}
        </div>
      )
    },
    {
      id: '', 
      label: 'Actions', 
      filter: false,
      render: (row) => {
        return (
          <Space size="small">
            <Tooltip title="Edit">
              <Link to={`/staff/${row.id}/edit`}>
                <AntButton
                  type={'link'}
                  style={{ color: '#333' }}
                  className={"d-flex align-items-center justify-content-center"}
                  shape="circle"
                  icon={<Iconify icon={"material-symbols:edit"} />} 
                />
              </Link>
            </Tooltip>

            {row.active ? (
              <Tooltip title="Deactivate">
                <Popconfirm
                  title="Deactivate Staff"
                  description="Are you sure to deactivate this staff?"
                  onConfirm={() => deactivateStaff(row.id)}
                  okText="Yes"
                  cancelText="No"
                  okType="danger"
                >
                  <AntButton
                    type={'link'}
                    style={{ color: '#333' }}
                    className={"d-flex align-items-center justify-content-center"}
                    shape="circle"
                    icon={<Iconify icon={"material-symbols:visibility-off"} />} 
                  />
                </Popconfirm>
              </Tooltip>
            ) : (
              <Tooltip title="Activate">
                <Popconfirm
                  title="Activate Staff"
                  description="Are you sure to activate this staff?"
                  onConfirm={() => activateStaff(row.id)}
                  okText="Yes"
                  cancelText="No"
                  okType="primary"
                >
                  <AntButton
                    type={'link'}
                    style={{ color: '#333' }}
                    className={"d-flex align-items-center justify-content-center"}
                    shape="circle"
                    icon={<Iconify icon={"material-symbols:visibility"} />} 
                  />
                </Popconfirm>
              </Tooltip>
            )}

            <Tooltip title="Delete">
              <Popconfirm
                title="Delete Staff"
                description="Are you sure to delete this staff permanently?"
                onConfirm={() => deleteStaff(row.id)}
                okText="Yes"
                cancelText="No"
                okType="danger"
              >
                <AntButton
                  type={'link'}
                  style={{ color: '#333' }}
                  className={"d-flex align-items-center justify-content-center"}
                  shape="circle"
                  icon={<Iconify icon={"material-symbols:delete-outline"} />} 
                />
              </Popconfirm>
            </Tooltip>
          </Space>
        );
      }
    },
  ];

  const toggleStaffStatus = async (id, activate) => {
    try {
      if (activate) {
        await StaffModel.reactivateStaff(id);
        message.success('Staff activated successfully');
      } else {
        await StaffModel.deleteStaff(id);
        message.success('Staff deactivated successfully');
      }
      fetchAllData();
    } catch (error) {
      console.error(`Error ${activate ? 'activating' : 'deactivating'} staff:`, error);
      message.error(`Failed to ${activate ? 'activate' : 'deactivate'} staff`);
    }
  };

  const deactivateStaff = async (id) => {
    await toggleStaffStatus(id, false);
  };

  const activateStaff = async (id) => {
    await toggleStaffStatus(id, true);
  };

  const deleteStaff = async (id) => {
    try {
      await StaffModel.deleteStaff(id);
      message.success('Staff deleted successfully');
      fetchAllData();
    } catch (error) {
      console.error("Error deleting staff:", error);
      message.error('Failed to delete staff');
    }
  };

  // Fetch ALL data from API — no activeOnly param = backend returns all
  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Pass activeOnly=undefined so backend returns ALL staff (active + inactive)
      const result = await StaffModel.getAllStaff({ activeOnly: undefined });
      if (result && result.http_code === 200) {
        setAllData(result.data || []);
      } else {
        setAllData([]);
      }
    } catch (error) {
      console.error("Error fetching staff:", error);
      setAllData([]);
      message.error('Failed to load staff data');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Apply filters client-side whenever allData/search/status/page changes
  useEffect(() => {
    let filtered = [...allData];

    // Filter by status — handle boolean, integer (1/0), and string ('1'/'0')
    if (status === 'active') {
      filtered = filtered.filter(s => s.active === true || s.active === 1 || s.active === '1');
    } else if (status === 'inactive') {
      filtered = filtered.filter(s => !s.active || s.active === false || s.active === 0 || s.active === '0');
    }
    // status === 'all' → no filter, show everything

    // Filter by search
    if (search && search.trim() !== '') {
      const keyword = search.trim().toLowerCase();
      filtered = filtered.filter(s =>
        (s.name && s.name.toLowerCase().includes(keyword)) ||
        (s.phone_number && s.phone_number.toLowerCase().includes(keyword))
      );
    }

    // Paginate
    const startIndex = page * rowsPerPage;
    const paginated = filtered.slice(startIndex, startIndex + rowsPerPage);

    setTotalCount(filtered.length);
    setDataSource(paginated);
  }, [allData, search, status, page, rowsPerPage]);

  // Fetch from API only on mount and after mutations
  useEffect(() => {
    fetchAllData();
  }, [refreshKey]);

  return (
    <>
      <style>{`
        .custom-add-button {
          background: #333 !important;
          border-color: #333 !important;
          color: white !important;
        }
        .custom-add-button:hover {
          background: #555 !important;
          border-color: #555 !important;
        }
        
        .staff-search.ant-input-affix-wrapper {
          background: white !important;
          border: 1px solid #d9d9d9 !important;
        }
        
        .staff-search .ant-input {
          background: white !important;
          color: #333 !important;
        }
        
        .staff-search .ant-input::placeholder {
          color: rgba(0, 0, 0, 0.25) !important;
        }
        
        .staff-search .ant-input-prefix {
          color: #666 !important;
        }
        
        .staff-search.ant-input-affix-wrapper:hover,
        .staff-search.ant-input-affix-wrapper:focus,
        .staff-search.ant-input-affix-wrapper-focused {
          border-color: #666 !important;
          box-shadow: 0 0 0 2px rgba(102, 102, 102, 0.1) !important;
        }
        
        .filter-select .ant-select-selector {
          background: white !important;
          border: 1px solid #d9d9d9 !important;
          color: #333 !important;
          border-radius: 6px !important;
        }
        
        .filter-select .ant-select-selection-placeholder {
          color: rgba(0, 0, 0, 0.25) !important;
        }
        
        .filter-select .ant-select-selection-item {
          color: #333 !important;
        }
        
        .filter-select .ant-select-arrow {
          color: rgba(0, 0, 0, 0.25) !important;
        }
        
        .filter-select .ant-select-selector:hover {
          border-color: #666 !important;
        }
        
        .filter-select.ant-select-focused .ant-select-selector {
          border-color: #666 !important;
          box-shadow: 0 0 0 2px rgba(102, 102, 102, 0.1) !important;
        }
        
        .filter-select .ant-select-dropdown {
          background: white !important;
          border: 1px solid #f0f0f0 !important;
          border-radius: 6px !important;
          box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12), 
                      0 6px 16px 0 rgba(0, 0, 0, 0.08), 
                      0 9px 28px 8px rgba(0, 0, 0, 0.05) !important;
        }
        
        .filter-select .ant-select-item {
          color: #333 !important;
          background: white !important;
        }
        
        .filter-select .ant-select-item:hover {
          background-color: #f5f5f5 !important;
        }
        
        .ant-tooltip-inner {
          background: #333 !important;
          color: white !important;
        }
        
        .ant-tooltip-arrow-content {
          background: #333 !important;
        }
        
        .ant-modal-header {
          background: white !important;
          border-bottom: 1px solid #f0f0f0 !important;
        }
        
        .ant-modal-title {
          color: #333 !important;
        }
        
        .ant-modal-content {
          background: white !important;
          color: #333 !important;
        }
        
        .ant-modal-body {
          color: #333 !important;
        }
        
        .ant-table-thead > tr > th {
          background: #fafafa !important;
          color: #333 !important;
          border-bottom: 1px solid #f0f0f0 !important;
        }
        
        .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f0f0f0 !important;
        }
        
        .ant-table-tbody > tr:hover > td {
          background: #fafafa !important;
        }
        
        .ant-pagination-item {
          border: 1px solid #d9d9d9 !important;
          background: white !important;
        }
        
        .ant-pagination-item a {
          color: #333 !important;
        }
        
        .ant-pagination-item-active {
          border-color: #333 !important;
          background: #f5f5f5 !important;
        }
        
        .ant-pagination-item-active a {
          color: #333 !important;
          font-weight: 500;
        }
        
        .ant-pagination-prev .ant-pagination-item-link,
        .ant-pagination-next .ant-pagination-item-link {
          border: 1px solid #d9d9d9 !important;
          background: white !important;
          color: #333 !important;
        }
        
        .ant-popconfirm-message-title {
          color: #333 !important;
        }
        
        .ant-popconfirm-description {
          color: #666 !important;
        }
        
        @media (min-width: 768px) and (max-width: 1024px) {
          .staff-search.ant-input-affix-wrapper {
            height: 44px !important;
            font-size: 16px !important;
          }
          
          .staff-search .ant-input {
            font-size: 16px !important;
          }
          
          .filter-select .ant-select-selector {
            height: 44px !important;
            font-size: 16px !important;
            padding: 5px 11px !important;
          }
          
          .filter-select .ant-select-selection-placeholder {
            font-size: 16px !important;
            line-height: 32px !important;
          }
          
          .filter-select .ant-select-selection-item {
            font-size: 16px !important;
            line-height: 32px !important;
          }
          
          .custom-add-button {
            font-size: 16px !important;
            height: 44px !important;
            padding: 0 24px !important;
          }
          
          .ant-table-thead > tr > th {
            font-size: 16px !important;
            padding: 18px 16px !important;
            font-weight: 600 !important;
          }
          
          .ant-table-tbody > tr > td {
            font-size: 15px !important;
            padding: 18px 16px !important;
          }
          
          .ant-btn-circle {
            font-size: 22px !important;
            width: 40px !important;
            height: 40px !important;
          }
          
          .ant-pagination-item {
            min-width: 40px !important;
            height: 40px !important;
            line-height: 38px !important;
          }
          
          .ant-pagination-item a {
            font-size: 16px !important;
          }
          
          .staff-management-title {
            font-size: 26px !important;
          }
        }
        
        @media (max-width: 767px) {
          .custom-add-button {
            width: 100%;
            margin-top: 12px;
          }
        }
      `}</style>
      <Container fluid>
        <Card style={{ 
          background: '#FFFFFF', 
          color: "#333",
          border: '1px solid #f0f0f0',
          boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02), 0 2px 4px 0 rgba(0,0,0,0.02)'
        }}
          className="card-stats mb-4 mb-xl-0">
          <CardBody>
            {/* Header */}
            <Row className="mb-4">
              <Col md={6} xs={12}>
                <div className="staff-management-title" style={{ fontWeight: "bold", fontSize: "1.2em", color: '#333' }}>
                  Staff Management
                </div>
              </Col>
              <Col md={6} xs={12} className="text-md-right text-center">
                <Link to="/staff/create">
                  <AntButton
                    size={'middle'} 
                    type={'primary'}
                    icon={<Iconify icon={"material-symbols:add"} />}
                    className="custom-add-button"
                  >
                    Add Staff
                  </AntButton>
                </Link>
              </Col>
            </Row>

            {/* Search and Filter Row */}
            <Row style={{ marginBottom: 24, alignItems: 'center' }}>
              <Col xl={5} lg={4} md={12} className="mb-3 mb-lg-0">
                <Input
                  className="staff-search"
                  placeholder="Search by name or phone"
                  onChange={(e) => {
                    // Real-time search as user types
                    if (e.target.value === '') handleSearch('');
                  }}
                  onPressEnter={(e) => handleSearch(e.target.value)}
                  onBlur={(e) => handleSearch(e.target.value)}
                  prefix={
                    <Iconify
                      icon="material-symbols:search"
                      style={{ color: '#666', fontSize: '18px' }}
                    />
                  }
                  allowClear
                  onChange={(e) => handleSearch(e.target.value)}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col xl={3} lg={3} className="d-none d-lg-block"></Col>
              <Col xl={4} lg={5} md={12} xs={12} className="mb-3 mb-lg-0">
                <div className="d-flex justify-content-end">
                  <Select
                    className="filter-select"
                    placeholder="Status"
                    style={{ width: '100%', maxWidth: '200px' }}
                    value={status}
                    onChange={handleStatusChange}
                  >
                    <Select.Option value="all">All Status</Select.Option>
                    <Select.Option value="active">Active Only</Select.Option>
                    <Select.Option value="inactive">Inactive Only</Select.Option>
                  </Select>
                </div>
              </Col>
            </Row>

            {/* Table */}
            <Row>
              <Col md={12}>
                <CustomTable
                  showFilter={false}
                  pagination={true}
                  searchText=""
                  data={dataSource}
                  columns={columns}
                  defaultOrder={"id"}
                  onSearch={null}
                  apiPagination={false}
                  totalCount={totalCount}
                  currentPage={page}
                  rowsPerPage={rowsPerPage}
                  onPageChange={handlePageChange}
                  onRowsPerPageChange={handleRowsPerPageChange}
                  loading={loading}
                  emptyText={
                    <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                      <Iconify icon="material-symbols:person-search" style={{ fontSize: '48px', marginBottom: '16px' }} />
                      <div>No staff found</div>
                      <div style={{ fontSize: '12px', marginTop: '8px' }}>
                        Try adjusting your search or filter
                      </div>
                    </div>
                  }
                />
              </Col>
            </Row>
          </CardBody>
        </Card>
      </Container>
    </>
  );
}

export default StaffList;