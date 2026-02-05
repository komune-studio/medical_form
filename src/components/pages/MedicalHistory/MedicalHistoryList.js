import { Space, Button as AntButton, Tooltip, Modal, message, Input, Select, DatePicker } from 'antd';
import React, { useState, useEffect } from 'react';
import { Card, Row, CardBody, Container } from "reactstrap";
import { Link } from 'react-router-dom';
import Iconify from "../../reusable/Iconify";
import { Col } from "react-bootstrap";
import CustomTable from "../../reusable/CustomTable";
import MedicalHistoryModel from 'models/MedicalHistoryModel';
import moment from 'moment';
import create from 'zustand';

const { RangePicker } = DatePicker;

const useFilter = create((set) => ({
  search: "",
  dateRange: null,
  serviceType: "",
  sortBy: "appointment_date",
  sortOrder: "desc",

  setSearch: (keyword) =>
    set((state) => ({
      search: keyword,
    })),
  setDateRange: (range) =>
    set((state) => ({
      dateRange: range,
    })),
  setServiceType: (serviceType) =>
    set((state) => ({
      serviceType: serviceType,
    })),
  setSortBy: (sortBy) =>
    set((state) => ({
      sortBy: sortBy,
    })),
  setSortOrder: (sortOrder) =>
    set((state) => ({
      sortOrder: sortOrder,
    })),
  resetSearch: () =>
    set((state) => ({
      search: "",
      dateRange: null,
      serviceType: "",
      sortBy: "appointment_date",
      sortOrder: "desc"
    })),
}));

const MedicalHistoryList = () => {
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [dataSource, setDataSource] = useState([]);

  // Filter states
  const search = useFilter((state) => state.search);
  const dateRange = useFilter((state) => state.dateRange);
  const serviceType = useFilter((state) => state.serviceType);
  const sortBy = useFilter((state) => state.sortBy);
  const sortOrder = useFilter((state) => state.sortOrder);
  
  const setSearch = useFilter((state) => state.setSearch);
  const setDateRange = useFilter((state) => state.setDateRange);
  const setServiceType = useFilter((state) => state.setServiceType);
  const setSortBy = useFilter((state) => state.setSortBy);
  const setSortOrder = useFilter((state) => state.setSortOrder);
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

  const handleDateRangeChange = (dates, dateStrings) => {
    setDateRange(dates);
    setPage(0);
  };

  const handleServiceTypeChange = (value) => {
    setServiceType(value);
    setPage(0);
  };

  const handleSortChange = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
    setPage(0);
  };

  const getPainLevelColor = (score) => {
    if (!score) return '#d9d9d9';
    const pain = parseInt(score);
    if (pain <= 3) return '#52c41a'; // green
    if (pain <= 6) return '#faad14'; // orange
    if (pain <= 9) return '#f5222d'; // red
    return '#722ed1'; // purple for extreme pain
  };

  const columns = [
    {
      id: 'patient_info',
      label: 'Patient',
      filter: true,
      render: (row) => (
        <div>
          <div style={{ fontWeight: 500, color: '#333' }}>
            {row.patient_name || row.patient?.name || 'N/A'}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            ID: {row.patient_code || row.patient?.patient_code || 'N/A'}
          </div>
        </div>
      )
    },
    {
      id: 'appointment_info',
      label: 'Appointment',
      filter: false,
      render: (row) => (
        <div>
          <div style={{ fontWeight: 500, color: '#333' }}>
            {moment(row.appointment_date).format("DD MMM YYYY")}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {moment(row.appointment_date).format("HH:mm")}
          </div>
          <div style={{ fontSize: '12px', color: '#1890ff' }}>
            {row.service_type || 'N/A'}
          </div>
        </div>
      )
    },
    {
      id: 'staff_info',
      label: 'Staff',
      filter: false,
      render: (row) => (
        <div>
          <div style={{ color: '#333' }}>
            {row.staff_name || row.staff?.name || 'Not Assigned'}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {row.service_type || 'General'}
          </div>
        </div>
      )
    },
    {
      id: 'pain_level',
      label: 'Pain Level',
      filter: false,
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {row.pain_before && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '12px', 
                color: '#666',
                marginBottom: '2px'
              }}>
                Before
              </div>
              <div style={{ 
                padding: '4px 8px',
                borderRadius: '4px',
                background: getPainLevelColor(row.pain_before),
                color: 'white',
                fontWeight: 'bold',
                fontSize: '14px',
                minWidth: '30px',
                display: 'inline-block'
              }}>
                {row.pain_before}
              </div>
            </div>
          )}
          
          {row.pain_after && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '12px', 
                color: '#666',
                marginBottom: '2px'
              }}>
                After
              </div>
              <div style={{ 
                padding: '4px 8px',
                borderRadius: '4px',
                background: getPainLevelColor(row.pain_after),
                color: 'white',
                fontWeight: 'bold',
                fontSize: '14px',
                minWidth: '30px',
                display: 'inline-block'
              }}>
                {row.pain_after}
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'diagnosis',
      label: 'Diagnosis & Treatment',
      filter: false,
      render: (row) => (
        <div>
          <div style={{ 
            color: '#333',
            fontSize: '13px',
            marginBottom: '4px',
            maxWidth: '200px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {row.diagnosis_result || 'No diagnosis'}
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: '#666',
            maxWidth: '200px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {row.treatments || 'No treatment specified'}
          </div>
        </div>
      )
    },
    {
      id: 'created_at',
      label: 'Record Date',
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
            <Tooltip title="View Details">
              <Link to={`/medical-history/${row.id}`}>
                <AntButton
                  type={'link'}
                  style={{ color: '#333' }}
                  className={"d-flex align-items-center justify-content-center"}
                  shape="circle"
                  icon={<Iconify icon={"material-symbols:visibility"} />}
                />
              </Link>
            </Tooltip>

            <Tooltip title="Edit">
              <Link to={`/medical-history/${row.id}/edit`}>
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

            <Tooltip title="View Patient">
              <Link to={`/patients/${row.patient_id}`}>
                <AntButton
                  type={'link'}
                  style={{ color: '#1890ff' }}
                  className={"d-flex align-items-center justify-content-center"}
                  shape="circle"
                  icon={<Iconify icon={"mdi:account-arrow-right"} />}
                />
              </Link>
            </Tooltip>
          </Space>
        );
      }
    },
  ];

  const deleteItem = async (id) => {
    try {
      await MedicalHistoryModel.deleteMedicalHistory(id);
      message.success('Medical history deleted successfully');
      initializeData();
    } catch (error) {
      console.error("Error deleting medical history:", error);
      message.error('Failed to delete medical history');
    }
  };

  const onDelete = (id) => {
    Modal.confirm({
      title: "Delete Medical History",
      content: "Are you sure you want to delete this medical history record? This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () => deleteItem(id)
    });
  };

  const exportCSV = async () => {
    setExportLoading(true);
    try {
      const filters = {};
      if (search) filters.search = search;
      if (serviceType) filters.service_type = serviceType;
      if (dateRange && dateRange.length === 2) {
        filters.dateFrom = dateRange[0].format('YYYY-MM-DD');
        filters.dateTo = dateRange[1].format('YYYY-MM-DD');
      }

      const blobData = await MedicalHistoryModel.exportMedicalHistoriesCSV(filters);
      MedicalHistoryModel.downloadCSV(blobData);
      
      message.success('CSV exported successfully!');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      message.error('Failed to export CSV: ' + error.message);
    } finally {
      setExportLoading(false);
    }
  };

  const initializeData = async (currentPage = page, currentRowsPerPage = rowsPerPage) => {
    setLoading(true);
    try {
      const filters = {};
      
      if (search) filters.search = search;
      if (serviceType) filters.service_type = serviceType;
      if (dateRange && dateRange.length === 2) {
        filters.dateFrom = dateRange[0].format('YYYY-MM-DD');
        filters.dateTo = dateRange[1].format('YYYY-MM-DD');
      }
      if (sortBy) filters.sortBy = sortBy;
      if (sortOrder) filters.sortOrder = sortOrder;
      filters.limit = currentRowsPerPage;
      filters.offset = currentPage * currentRowsPerPage;

      const result = await MedicalHistoryModel.getAllMedicalHistories(filters);
      
      if (result && result.http_code === 200) {
        const allData = Array.isArray(result.data) ? result.data : [];
        
        // For client-side pagination (if API doesn't support pagination)
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
      console.error("Error fetching medical histories:", error);
      setDataSource([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeData(page, rowsPerPage);
  }, [page, rowsPerPage, search, dateRange, serviceType, sortBy, sortOrder]);

  return (
    <>
      <style>{`
        /* General button styles */
        .custom-add-button .ant-btn-primary {
          background: #1890ff !important;
          border-color: #1890ff !important;
          color: white !important;
        }
        .custom-add-button .ant-btn-primary:hover {
          background: #40a9ff !important;
          border-color: #40a9ff !important;
        }
        
        .custom-add-button {
          background: #1890ff !important;
          border-color: #1890ff !important;
          color: white !important;
        }
        .custom-add-button:hover {
          background: #40a9ff !important;
          border-color: #40a9ff !important;
        }
        
        .custom-export-button {
          background: #52c41a !important;
          border-color: #52c41a !important;
          color: white !important;
        }
        
        .custom-export-button:hover {
          background: #73d13d !important;
          border-color: #73d13d !important;
        }
        
        /* Search input */
        .medical-history-search.ant-input-affix-wrapper {
          background: white !important;
          border: 1px solid #d9d9d9 !important;
        }
        
        .medical-history-search .ant-input {
          background: white !important;
          color: #333 !important;
        }
        
        .medical-history-search .ant-input::placeholder {
          color: rgba(0, 0, 0, 0.25) !important;
        }
        
        .medical-history-search .ant-input-prefix {
          color: #666 !important;
        }
        
        .medical-history-search.ant-input-affix-wrapper:hover,
        .medical-history-search.ant-input-affix-wrapper:focus,
        .medical-history-search.ant-input-affix-wrapper-focused {
          border-color: #1890ff !important;
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1) !important;
        }
        
        /* Date picker */
        .date-range-picker .ant-picker {
          background: white !important;
          border: 1px solid #d9d9d9 !important;
          color: #333 !important;
          border-radius: 6px !important;
          width: 100% !important;
        }
        
        .date-range-picker .ant-picker-input > input {
          color: #333 !important;
        }
        
        .date-range-picker .ant-picker-suffix {
          color: rgba(0, 0, 0, 0.25) !important;
        }
        
        .date-range-picker .ant-picker-clear {
          background: white !important;
          color: rgba(0, 0, 0, 0.25) !important;
        }
        
        .date-range-picker .ant-picker:hover,
        .date-range-picker .ant-picker-focused {
          border-color: #1890ff !important;
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1) !important;
        }
        
        /* Select filter */
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
          border-color: #1890ff !important;
        }
        
        .filter-select.ant-select-focused .ant-select-selector {
          border-color: #1890ff !important;
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1) !important;
        }
        
        /* Modal styling */
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
        
        .ant-modal-mask {
          background-color: rgba(0, 0, 0, 0.45) !important;
        }
        
        /* Button styles */
        .ant-btn-primary {
          background: #1890ff !important;
          border-color: #1890ff !important;
          color: white !important;
        }
        
        .ant-btn-primary:hover {
          background: #40a9ff !important;
          border-color: #40a9ff !important;
        }
        
        .ant-btn-default:hover {
          border-color: #1890ff !important;
          color: #1890ff !important;
        }
        
        /* Table styling */
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
        
        /* Pagination */
        .ant-pagination-item {
          border: 1px solid #d9d9d9 !important;
          background: white !important;
        }
        
        .ant-pagination-item a {
          color: #333 !important;
        }
        
        .ant-pagination-item-active {
          border-color: #1890ff !important;
          background: #e6f7ff !important;
        }
        
        .ant-pagination-item-active a {
          color: #1890ff !important;
          font-weight: 500;
        }
        
        .ant-pagination-prev .ant-pagination-item-link,
        .ant-pagination-next .ant-pagination-item-link {
          border: 1px solid #d9d9d9 !important;
          background: white !important;
          color: #333 !important;
        }
        
        /* Tablet responsive */
        @media (min-width: 768px) and (max-width: 1024px) {
          .medical-history-search.ant-input-affix-wrapper {
            height: 44px !important;
            font-size: 16px !important;
          }
          
          .medical-history-search .ant-input {
            font-size: 16px !important;
          }
          
          .date-range-picker .ant-picker {
            height: 44px !important;
          }
          
          .date-range-picker .ant-picker-input > input {
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
          
          .custom-add-button,
          .custom-export-button {
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
          
          .medical-history-title {
            font-size: 26px !important;
          }
        }
        
        /* Mobile responsive */
        @media (max-width: 767px) {
          .custom-add-button,
          .custom-export-button {
            width: 100%;
            margin-top: 12px;
          }
          
          .button-group {
            display: flex !important;
            flex-direction: column !important;
            gap: 8px !important;
          }
          
          .button-group .ant-btn {
            width: 100% !important;
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
            <Row className="mb-4">
              <Col md={6} xs={12}>
                <div className="medical-history-title" style={{ fontWeight: "bold", fontSize: "1.2em", color: '#333' }}>
                  Medical History Management
                </div>
              </Col>
              <Col md={6} xs={12} className="text-md-right text-center">
                <div className="button-group" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <Link to="/medical-history/create" style={{ flexShrink: 0 }}>
                    <AntButton
                      size={'middle'}
                      type={'primary'}
                      icon={<Iconify icon={"material-symbols:add"} />}
                      className="custom-add-button"
                    >
                      Add Record
                    </AntButton>
                  </Link>
                  
                  <AntButton
                    size={'middle'}
                    type={'primary'}
                    icon={<Iconify icon={"mdi:file-export-outline"} />}
                    className="custom-export-button"
                    onClick={exportCSV}
                    loading={exportLoading}
                  >
                    Export CSV
                  </AntButton>
                </div>
              </Col>
            </Row>

            {/* Filters */}
            <Row style={{ marginBottom: 24, alignItems: 'center' }}>
              <Col xl={4} lg={4} md={12} className="mb-3 mb-lg-0">
                <Input
                  className="medical-history-search"
                  placeholder="Search by diagnosis, treatment, or patient"
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
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
              
              <Col xl={3} lg={3} md={6} xs={12} className="mb-3 mb-lg-0">
                <RangePicker
                  className="date-range-picker"
                  placeholder={['Start Date', 'End Date']}
                  value={dateRange}
                  onChange={handleDateRangeChange}
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  allowClear
                />
              </Col>
              
              <Col xl={3} lg={3} md={6} xs={6} className="mb-3 mb-lg-0">
                <Select
                  className="filter-select"
                  placeholder="Service Type"
                  style={{ width: '100%' }}
                  value={serviceType || undefined}
                  onChange={handleServiceTypeChange}
                  allowClear
                  onClear={() => handleServiceTypeChange("")}
                >
                  <Select.Option value="">All Services</Select.Option>
                  <Select.Option value="Consultation">Consultation</Select.Option>
                  <Select.Option value="Therapy">Therapy</Select.Option>
                  <Select.Option value="Follow-up">Follow-up</Select.Option>
                  <Select.Option value="Emergency">Emergency</Select.Option>
                  <Select.Option value="Check-up">Check-up</Select.Option>
                  <Select.Option value="Rehabilitation">Rehabilitation</Select.Option>
                  <Select.Option value="Screening">Screening</Select.Option>
                </Select>
              </Col>
              
              <Col xl={2} lg={2} md={6} xs={6} className="mb-3 mb-lg-0 ps-md-2">
                <Select
                  className="filter-select"
                  placeholder="Sort By"
                  style={{ width: '100%' }}
                  value={`${sortBy}_${sortOrder}`}
                  onChange={(value) => {
                    const [field, order] = value.split('_');
                    handleSortChange(field, order);
                  }}
                >
                  <Select.Option value="appointment_date_desc">Date (Newest)</Select.Option>
                  <Select.Option value="appointment_date_asc">Date (Oldest)</Select.Option>
                  <Select.Option value="pain_before_desc">Pain Level (High)</Select.Option>
                  <Select.Option value="pain_before_asc">Pain Level (Low)</Select.Option>
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
                  defaultOrder={"appointment_date"}
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

export default MedicalHistoryList;