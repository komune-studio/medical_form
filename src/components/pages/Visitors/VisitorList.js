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
  status: "all",
  profile: "",

  setSearch: (keyword) =>
    set((state) => ({
      search: keyword,
    })),
  setStatus: (status) =>
    set((state) => ({
      status: status,
    })),
  setProfile: (profile) =>
    set((state) => ({
      profile: profile,
    })),
  resetSearch: () =>
    set((state) => ({
      search: "",
      status: "all",
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
  const status = useFilter((state) => state.status);
  const profile = useFilter((state) => state.profile);
  const setSearch = useFilter((state) => state.setSearch);
  const setStatus = useFilter((state) => state.setStatus);
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

  const handleStatusChange = (value) => {
    setStatus(value);
  };

  const handleProfileChange = (value) => {
    setProfile(value);
  };

  const getProfileTagColor = (profile) => {
    switch(profile) {
      case 'Player': return 'blue';
      case 'Visitor': return '#004EEB';
      case 'Other': return 'default';
      default: return 'default';
    }
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
        <Tag color={getProfileTagColor(row.visitor_profile)}>
          {row.visitor_profile}
          {row.visitor_profile_other && ` (${row.visitor_profile_other})`}
        </Tag>
      )
    },
    {
      id: 'filled_by', 
      label: 'Filled By', 
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
      id: 'checked_out_at', 
      label: 'Check-out', 
      filter: false,
      render: (row) => (
        row.checked_out_at ? (
          <div>
            <div style={{ color: '#333' }}>{moment(row.checked_out_at).format("DD MMM YYYY")}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {moment(row.checked_out_at).format("HH:mm")}
            </div>
          </div>
        ) : (
          <Tag color="#004EEB">Active</Tag>
        )
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
                  style={{ color: '#004EEB' }}
                  className={"d-flex align-items-center justify-content-center"}
                  shape="circle"
                  icon={<Iconify icon={"material-symbols:edit"} />} 
                />
              </Link>
            </Tooltip>
            
            <Tooltip title="Quick Checkout">
              <AntButton
                type={'link'}
                style={{ color: row.checked_out_at ? '#ccc' : '#004EEB' }}
                onClick={() => !row.checked_out_at && onQuickCheckout(row.id)}
                className={"d-flex align-items-center justify-content-center"}
                shape="circle"
                icon={<Iconify icon={"material-symbols:logout-rounded"} />}
                disabled={!!row.checked_out_at}
              />
            </Tooltip>

            <Tooltip title="Delete">
              <AntButton
                type={'link'}
                style={{ color: '#004EEB' }}
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

  const onQuickCheckout = async (id) => {
    Modal.confirm({
      title: "Checkout Visitor",
      content: "Are you sure you want to checkout this visitor?",
      okText: "Checkout",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await FormModel.checkoutVisitor(id);
          message.success('Visitor checked out successfully');
          initializeData();
        } catch (error) {
          console.error("Error checking out visitor:", error);
          message.error('Failed to checkout visitor');
        }
      }
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
      if (status !== "all") {
        filters.includeCheckedOut = status === "checked-out";
      }
      if (profile) {
        filters.visitorProfile = profile;
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
  }, [page, rowsPerPage, search, status, profile]);

  return (
    <>
      <style>{`
        .custom-search-button .ant-btn-primary {
          background: #004EEB !important;
          border-color: #004EEB !important;
        }
        .custom-search-button .ant-btn-primary:hover {
          background: #0040c4 !important;
          border-color: #0040c4 !important;
        }
        .custom-add-button {
          background: #004EEB !important;
          border-color: #004EEB !important;
        }
        .custom-add-button:hover {
          background: #0040c4 !important;
          border-color: #0040c4 !important;
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
        
        /* Hover dan focus state */
        .visitor-search.ant-input-affix-wrapper:hover,
        .visitor-search.ant-input-affix-wrapper:focus,
        .visitor-search.ant-input-affix-wrapper-focused {
          border-color: #004EEB !important;
          box-shadow: 0 0 0 2px rgba(0, 78, 235, 0.1) !important;
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
        
        /* Hover dan focus state untuk Select */
        .filter-select .ant-select-selector:hover {
          border-color: #004EEB !important;
        }
        
        .filter-select.ant-select-focused .ant-select-selector {
          border-color: #004EEB !important;
          box-shadow: 0 0 0 2px rgba(0, 78, 235, 0.1) !important;
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
          background-color: #f0f7ff !important;
          color: #004EEB !important;
        }
        
        .filter-select .ant-select-item-option-active {
          background-color: #f5f5f5 !important;
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
              <Col md={6}>
                <div style={{ fontWeight: "bold", fontSize: "1.2em", color: '#333' }}>
                  Visitors Management
                </div>
              </Col>
              <Col md={6} className="text-right">
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
              <Col md={5}>
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
              <Col md={3}></Col>
              <Col md={2}>
                <Select
                  className="filter-select"
                  placeholder="Status"
                  style={{ width: '100%' }}
                  value={status}
                  onChange={handleStatusChange}
                >
                  <Select.Option value="all">All Visitors</Select.Option>
                  <Select.Option value="active">Active Only</Select.Option>
                  <Select.Option value="checked-out">Checked Out</Select.Option>
                </Select>
              </Col>
              <Col md={2}>
                <Select
                  className="filter-select"
                  placeholder="Profile"
                  style={{ width: '100%' }}
                  value={profile}
                  onChange={handleProfileChange}
                >
                  <Select.Option value="">All Profiles</Select.Option>
                  <Select.Option value="Player">Player</Select.Option>
                  <Select.Option value="Visitor">Visitor</Select.Option>
                  <Select.Option value="Other">Other</Select.Option>
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