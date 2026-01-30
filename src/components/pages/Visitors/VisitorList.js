import { Space, Button as AntButton, Tooltip, Modal, message, Image, Flex, Tag, Switch, Input, Select, Button } from 'antd';
import React, { useState, useEffect } from 'react';
import { Card, Row, CardBody, Container } from "reactstrap";
import { Link } from 'react-router-dom';
import Iconify from "../../reusable/Iconify";
import { Col } from "react-bootstrap";
import CustomTable from "../../reusable/CustomTable";
import Palette from "../../../utils/Palette";
import FormModel from 'models/VisitorModel';
import moment from 'moment';
import create from 'zustand';

const { Search } = Input;

const useFilter = create((set) => ({
  search: "",
  timeRange: "all",
  profile: "",

  setSearch: (keyword) =>
    set((state) => ({
      search: keyword,
    })),
  setTimeRange: (timeRange) =>
    set((state) => ({
      timeRange: timeRange,
    })),
  setProfile: (profile) =>
    set((state) => ({
      profile: profile,
    })),
  resetSearch: () =>
    set((state) => ({
      search: "",
      timeRange: "all",
      profile: ""
    })),
}));

const VisitorList = () => {
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [dataSource, setDataSource] = useState([]);

  const search = useFilter((state) => state.search);
  const timeRange = useFilter((state) => state.timeRange);
  const profile = useFilter((state) => state.profile);
  const setSearch = useFilter((state) => state.setSearch);
  const setTimeRange = useFilter((state) => state.setTimeRange);
  const setProfile = useFilter((state) => state.setProfile);
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
  };

  const handleTimeRangeChange = (value) => {
    setTimeRange(value);
  };

  const handleProfileChange = (value) => {
    setProfile(value);
  };

  const columns = [
    {
      id: 'visitor_name', 
      label: 'Visitor Name', 
      filter: true,
      render: (row) => (
        <div>
          <div style={{ fontWeight: 500, color: '#333' }}>{row.visitor_name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>Phone: {row.phone_number}</div>
        </div>
      )
    },
    {
      id: 'visitor_profile', 
      label: 'Profile', 
      filter: true,
      render: (row) => (
        <Tag style={{ 
          background: '#f5f5f5', 
          color: '#333',
          border: '1px solid #d9d9d9'
        }}>
          {row.visitor_profile}
          {row.visitor_profile_other && ` (${row.visitor_profile_other})`}
        </Tag>
      )
    },
    {
      id: 'filled_by', 
      label: 'Staff', 
      filter: true,
      render: (row) => (
        <div style={{ color: '#333' }}>{row.filled_by}</div>
      )
    },
    {
      id: 'created_at', 
      label: 'Check-in', 
      filter: false,
      render: (row) => (
        <div>
          <div style={{ color: '#333' }}>{moment(row.created_at).format("DD MMM YYYY")}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {moment(row.created_at).format("HH:mm")}
          </div>
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
              <Link to={`/visitors/${row.id}/edit`}>
                <AntButton
                  type={'link'}
                  style={{ color: '#333' }}
                  className={"d-flex align-items-center justify-content-center"}
                  shape="circle"
                  icon={<Iconify icon={"material-symbols:edit"} />} 
                />
              </Link>
            </Tooltip>

            <Tooltip title="Delete">
              <AntButton
                type={'link'}
                style={{ color: '#333' }}
                onClick={() => onDelete(row.id)}
                className={"d-flex align-items-center justify-content-center"}
                shape="circle"
                icon={<Iconify icon={"material-symbols:delete-outline"} />} 
              />
            </Tooltip>
          </Space>
        );
      }
    },
  ];

  const deleteItem = async (id) => {
    try {
      await FormModel.deleteVisitor(id);
      message.success('Visitor deleted successfully');
      initializeData();
    } catch (error) {
      console.error("Error deleting visitor:", error);
      message.error('Failed to delete visitor');
    }
  };

  const onDelete = (id) => {
    Modal.confirm({
      title: "Delete Visitor",
      content: "Are you sure you want to delete this visitor?",
      okText: "Delete",
      okType: "primary",
      cancelText: "Cancel",
      onOk: () => deleteItem(id)
    });
  };

  const initializeData = async (
    currentPage = page,
    currentRowsPerPage = rowsPerPage
  ) => {
    setLoading(true);
    try {
      const filters = {};
      
      if (search) filters.search = search;
      if (profile) {
        filters.visitorProfile = profile;
      }
      if (timeRange && timeRange !== "all") {
        filters.timeRange = timeRange;
      }
      
      const result = await FormModel.getAllVisitors(filters);
      
      if (result && result.http_code === 200) {
        const allData = result.data || [];
        const startIndex = currentPage * currentRowsPerPage;
        const endIndex = startIndex + currentRowsPerPage;
        const paginatedData = allData.slice(startIndex, endIndex);
        
        setDataSource(paginatedData);
        setTotalCount(allData.length);
      } else {
        setDataSource([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error("Error fetching visitors:", error);
      setDataSource([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeData(page, rowsPerPage);
  }, [page, rowsPerPage, search, timeRange, profile]);

  return (
    <>
      <style>{`
        /* Remove semua warna biru */
        .custom-search-button .ant-btn-primary {
          background: #333 !important;
          border-color: #333 !important;
          color: white !important;
        }
        .custom-search-button .ant-btn-primary:hover {
          background: #555 !important;
          border-color: #555 !important;
        }
        
        .custom-add-button {
          background: #333 !important;
          border-color: #333 !important;
          color: white !important;
        }
        .custom-add-button:hover {
          background: #555 !important;
          border-color: #555 !important;
        }
        
        /* CSS untuk membuat search input seluruhnya putih */
        .visitor-search.ant-input-affix-wrapper {
          background: white !important;
          border: 1px solid #d9d9d9 !important;
        }
        
        .visitor-search .ant-input {
          background: white !important;
          color: #333 !important;
        }
        
        .visitor-search .ant-input::placeholder {
          color: rgba(0, 0, 0, 0.25) !important;
        }
        
        .visitor-search .ant-input-prefix {
          color: #666 !important;
        }
        
        /* Hover dan focus state - warna abu-abu */
        .visitor-search.ant-input-affix-wrapper:hover,
        .visitor-search.ant-input-affix-wrapper:focus,
        .visitor-search.ant-input-affix-wrapper-focused {
          border-color: #666 !important;
          box-shadow: 0 0 0 2px rgba(102, 102, 102, 0.1) !important;
        }
        
        /* Clear button */
        .visitor-search .ant-input-clear-icon {
          color: rgba(0, 0, 0, 0.25) !important;
        }
        
        .visitor-search .ant-input-clear-icon:hover {
          color: rgba(0, 0, 0, 0.45) !important;
        }
        
        /* Pastikan border radius konsisten */
        .visitor-search.ant-input-affix-wrapper {
          border-radius: 6px !important;
        }
        
        /* CSS untuk Select filter */
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
        
        /* Hover dan focus state untuk Select - warna abu-abu */
        .filter-select .ant-select-selector:hover {
          border-color: #666 !important;
        }
        
        .filter-select.ant-select-focused .ant-select-selector {
          border-color: #666 !important;
          box-shadow: 0 0 0 2px rgba(102, 102, 102, 0.1) !important;
        }
        
        /* Dropdown menu untuk Select */
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
        
        .filter-select .ant-select-item-option-selected {
          background-color: #f5f5f5 !important;
          color: #333 !important;
        }
        
        .filter-select .ant-select-item-option-active {
          background-color: #f5f5f5 !important;
        }
        
        /* Styling untuk tag */
        .ant-tag {
          background: #f5f5f5 !important;
          color: #333 !important;
          border: 1px solid #d9d9d9 !important;
        }
        
        /* Tooltip styling */
        .ant-tooltip-inner {
          background: #333 !important;
          color: white !important;
        }
        
        .ant-tooltip-arrow-content {
          background: #333 !important;
        }
        
        /* Modal styling - FIXED TEXT COLOR */
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
        
        .ant-modal-confirm-body .ant-modal-confirm-title {
          color: #333 !important;
        }
        
        .ant-modal-confirm-body .ant-modal-confirm-content {
          color: #333 !important;
        }
        
        .ant-modal-footer {
          border-top: 1px solid #f0f0f0 !important;
        }
        
        /* Fix modal backdrop color */
        .ant-modal-mask {
          background-color: rgba(0, 0, 0, 0.45) !important;
        }
        
        .ant-modal-wrap {
          background: transparent !important;
        }
        
        .ant-btn-primary {
          background: #333 !important;
          border-color: #333 !important;
          color: white !important;
        }
        
        .ant-btn-primary:hover {
          background: #555 !important;
          border-color: #555 !important;
        }
        
        .ant-btn-default:hover {
          border-color: #666 !important;
          color: #666 !important;
        }
        
        /* Table header styling */
        .ant-table-thead > tr > th {
          background: #fafafa !important;
          color: #333 !important;
          border-bottom: 1px solid #f0f0f0 !important;
        }
        
        /* Table row styling */
        .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f0f0f0 !important;
        }
        
        .ant-table-tbody > tr:hover > td {
          background: #fafafa !important;
        }
        
        /* Pagination styling */
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
        
        /* ==========================================
           TABLET/IPAD RESPONSIVE STYLES (768px - 1024px)
           ========================================== */
        @media (min-width: 768px) and (max-width: 1024px) {
          /* Larger fonts for better readability on tablets */
          .visitor-search.ant-input-affix-wrapper {
            height: 44px !important;
            font-size: 16px !important;
          }
          
          .visitor-search .ant-input {
            font-size: 16px !important;
          }
          
          .visitor-search .ant-input::placeholder {
            font-size: 16px !important;
          }
          
          .visitor-search .ant-input-prefix {
            font-size: 22px !important;
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
          
          .ant-select-item {
            font-size: 16px !important;
            padding: 10px 12px !important;
            min-height: 44px !important;
          }
          
          .custom-add-button {
            font-size: 16px !important;
            height: 44px !important;
            padding: 0 24px !important;
          }
          
          /* Table text larger on tablets */
          .ant-table-thead > tr > th {
            font-size: 16px !important;
            padding: 18px 16px !important;
            font-weight: 600 !important;
          }
          
          .ant-table-tbody > tr > td {
            font-size: 15px !important;
            padding: 18px 16px !important;
          }
          
          /* Visitor name larger */
          .ant-table-tbody > tr > td > div > div:first-child {
            font-size: 16px !important;
            font-weight: 600 !important;
          }
          
          /* Phone number text larger */
          .ant-table-tbody > tr > td > div > div:last-child {
            font-size: 14px !important;
          }
          
          /* Tags larger */
          .ant-tag {
            font-size: 15px !important;
            padding: 6px 14px !important;
          }
          
          /* Action buttons larger */
          .ant-btn-circle {
            font-size: 22px !important;
            width: 40px !important;
            height: 40px !important;
          }
          
          /* Pagination larger */
          .ant-pagination-item {
            min-width: 40px !important;
            height: 40px !important;
            line-height: 38px !important;
          }
          
          .ant-pagination-item a {
            font-size: 16px !important;
          }
          
          .ant-pagination-prev .ant-pagination-item-link,
          .ant-pagination-next .ant-pagination-item-link {
            font-size: 18px !important;
          }
          
          /* Title larger */
          .visitor-management-title {
            font-size: 26px !important;
          }
          
          /* Modal text larger */
          .ant-modal-title {
            font-size: 20px !important;
          }
          
          .ant-modal-content {
            font-size: 16px !important;
          }
          
          .ant-modal-footer .ant-btn {
            font-size: 16px !important;
            height: 42px !important;
          }
          
          /* Tooltip larger */
          .ant-tooltip-inner {
            font-size: 15px !important;
            padding: 10px 14px !important;
          }
        }
        
        /* Mobile responsiveness */
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
            {/* Header dengan title dan buttons */}
            <Row className="mb-4">
              <Col md={6} xs={12}>
                <div className="visitor-management-title" style={{ fontWeight: "bold", fontSize: "1.2em", color: '#333' }}>
                  Visitors Management
                </div>
              </Col>
              <Col md={6} xs={12} className="text-md-right text-center">
                <Link to="/visitors/create">
                  <AntButton
                    size={'middle'} 
                    type={'primary'}
                    icon={<Iconify icon={"material-symbols:add"} />}
                    className="custom-add-button"
                  >
                    Add Visitor
                  </AntButton>
                </Link>
              </Col>
            </Row>

            {/* Search and Filter Row */}
            <Row style={{ marginBottom: 24, alignItems: 'center' }}>
              <Col xl={5} lg={4} md={12} className="mb-3 mb-lg-0">
                <Input
                  className="visitor-search"
                  placeholder="Search by name, phone, or staff"
                  onPressEnter={(e) => handleSearch(e.target.value)}
                  prefix={
                    <Iconify
                      icon="material-symbols:search"
                      style={{ color: '#666', fontSize: '18px' }}
                    />
                  }
                  allowClear
                  onClear={() => handleSearch("")}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col xl={3} lg={3} className="d-none d-lg-block"></Col>
              <Col xl={2} lg={2} md={6} xs={6} className="mb-3 mb-lg-0 pe-md-2">
                <Select
                  className="filter-select"
                  placeholder="Time Range"
                  style={{ width: '100%' }}
                  value={timeRange}
                  onChange={handleTimeRangeChange}
                >
                  <Select.Option value="all">All Time</Select.Option>
                  <Select.Option value="today">Today</Select.Option>
                  <Select.Option value="last7days">Last 7 Days</Select.Option>
                  <Select.Option value="last30days">Last 30 Days</Select.Option>
                </Select>
              </Col>
              <Col xl={2} lg={3} md={6} xs={6} className="mb-3 mb-lg-0 ps-md-2">
                <Select
                  className="filter-select"
                  placeholder="Profile"
                  style={{ width: '100%' }}
                  value={profile}
                  onChange={handleProfileChange}
                >
                  <Select.Option value="">All Profiles</Select.Option>
                  <Select.Option value="Player">Players</Select.Option>
                  <Select.Option value="Visitor">Visitors</Select.Option>
                  <Select.Option value="Other">Others</Select.Option>
                </Select>
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
                  defaultOrder={"created_at"}
                  onSearch={null}
                  apiPagination={false}
                  totalCount={totalCount}
                  currentPage={page}
                  rowsPerPage={rowsPerPage}
                  onPageChange={handlePageChange}
                  onRowsPerPageChange={handleRowsPerPageChange}
                  loading={loading}
                />
              </Col>
            </Row>
          </CardBody>
        </Card>
      </Container>
    </>
  );
}

export default VisitorList;