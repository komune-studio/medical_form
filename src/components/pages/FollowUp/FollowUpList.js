import { Space, Button as AntButton, Tooltip, message, Input, Select, DatePicker, Tag } from 'antd';
import React, { useState, useEffect } from 'react';
import { Card, Row, CardBody, Container } from "reactstrap";
import { Link } from 'react-router-dom';
import Iconify from "../../reusable/Iconify";
import { Col } from "react-bootstrap";
import CustomTable from "../../reusable/CustomTable";
import TreatmentLogModel from 'models/TreatmentLogModel';
import moment from 'moment';
import create from 'zustand';

const { RangePicker } = DatePicker;

const useFilter = create((set) => ({
  search: "",
  dateRange: null,
  serviceType: "",
  sortBy: "recommended_next_session",
  sortOrder: "asc",

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
  resetFilters: () =>
    set((state) => ({
      search: "",
      dateRange: null,
      serviceType: "",
      sortBy: "recommended_next_session",
      sortOrder: "asc"
    })),
}));

const FollowUpList = () => {
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [dataSource, setDataSource] = useState([]);
  const [fullData, setFullData] = useState([]);

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
  const resetFilters = useFilter((state) => state.resetFilters);

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

  const handleDateRangeChange = (dates) => {
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

  // Helper untuk sisa hari
  const getDaysRemainingInfo = (dateString) => {
    if (!dateString) return { text: '-', color: '#d9d9d9', bg: '#f5f5f5', border: '#d9d9d9' };
    
    const targetDate = moment(dateString).startOf('day');
    const today = moment().startOf('day');
    const diffDays = targetDate.diff(today, 'days');

    if (diffDays === 0) {
      return { text: 'Today', color: '#d48806', bg: '#fffbe6', border: '#ffe58f' };
    } else if (diffDays === 1) {
      return { text: 'Tomorrow', color: '#096dd9', bg: '#e6f7ff', border: '#91d5ff' };
    } else if (diffDays > 1) {
      return { text: `In ${diffDays} days`, color: '#389e0d', bg: '#f6ffed', border: '#b7eb8f' };
    } else {
      const overdueDays = Math.abs(diffDays);
      return { text: `Overdue by ${overdueDays} day${overdueDays > 1 ? 's' : ''}`, color: '#cf1322', bg: '#fff1f0', border: '#ffa39e' };
    }
  };

  const columns = [
    {
      id: 'patient_info',
      label: 'Patient',
      filter: true,
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: '#2b354f' }}>
            {row.patient_name || 'N/A'}
          </div>
          <div style={{ fontSize: '11px', color: '#8898aa' }}>
            Code: {row.patient_code || 'N/A'}
          </div>
        </div>
      )
    },
    {
      id: 'recommended_next_session',
      label: 'Follow Up Date',
      filter: false,
      render: (row) => {
        return (
          <div>
            <div style={{ fontWeight: 600, color: '#2b354f' }}>
              {row.recommended_next_session ? moment(row.recommended_next_session).format("DD MMM YYYY") : '-'}
            </div>
            <div style={{ fontSize: '12px', color: '#8898aa' }}>
              {row.recommended_next_session ? moment(row.recommended_next_session).format("dddd") : ''}
            </div>
          </div>
        );
      }
    },
    {
      id: 'days_remaining',
      label: 'Urgency',
      filter: false,
      render: (row) => {
        const info = getDaysRemainingInfo(row.recommended_next_session);
        return (
          <span style={{
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: 700,
            color: info.color,
            backgroundColor: info.bg,
            border: `1px solid ${info.border}`
          }}>
            {info.text}
          </span>
        );
      }
    },
    {
      id: 'last_visit_info',
      label: 'Last Visit',
      filter: false,
      render: (row) => (
        <div style={{ color: '#2b354f', fontWeight: 500, fontSize: '12px' }}>
          {row.last_visit_date ? moment(row.last_visit_date).format("DD MMM YYYY") : '-'}
        </div>
      )
    },
    {
      id: 'therapist',
      label: 'Therapist',
      filter: false,
      render: (row) => (
        <span style={{ fontWeight: 500, color: '#525f7f' }}>
          {row.therapist_name || '-'}
        </span>
      )
    },
    {
      id: 'treatment_notes',
      label: 'Last Session Details',
      filter: false,
      render: (row) => (
        <div style={{ maxWidth: '250px' }}>
          <div style={{
            fontWeight: 600,
            fontSize: '11px',
            color: '#2b354f',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap'
          }}>
            Plan: {row.plan_title || '-'}
          </div>
          <div style={{
            fontSize: '11px',
            color: '#525f7f',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            marginTop: '2px'
          }}>
            Note: {row.notes || row.treatment || '-'}
          </div>
        </div>
      )
    },
    {
      id: 'actions',
      label: 'Actions',
      filter: false,
      render: (row) => (
        <Tooltip title="Open Patient Detail">
          <Link to={`/patients/${row.patient_id}`}>
            <AntButton
              type='link'
              style={{ color: '#1890ff' }}
              className="d-flex align-items-center justify-content-center"
              shape="circle"
              icon={<Iconify icon="mdi:account-arrow-right" />}
            />
          </Link>
        </Tooltip>
      )
    },
  ];

  const initializeData = async () => {
    setLoading(true);
    try {
      const result = await TreatmentLogModel.getFollowUpList();
      if (result && result.http_code === 200) {
        const list = Array.isArray(result.data) ? result.data : [];
        setFullData(list);
        applyFilters(list);
      } else {
        setFullData([]);
        setDataSource([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error("Error fetching follow-up sessions:", error);
      setFullData([]);
      setDataSource([]);
      setTotalCount(0);
      message.error("Failed to load follow-up list");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (data = fullData) => {
    let filtered = [...data];

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(item => 
        (item.patient_name || '').toLowerCase().includes(q) ||
        (item.patient_code || '').toLowerCase().includes(q) ||
        (item.therapist_name || '').toLowerCase().includes(q) ||
        (item.plan_title || '').toLowerCase().includes(q)
      );
    }

    // Date range filter
    if (dateRange && dateRange.length === 2) {
      const start = dateRange[0].startOf('day');
      const end = dateRange[1].endOf('day');
      filtered = filtered.filter(item => {
        if (!item.recommended_next_session) return false;
        const target = moment(item.recommended_next_session);
        return target.isBetween(start, end, null, '[]');
      });
    }

    // Sorting
    if (sortBy) {
      filtered.sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];

        if (sortBy === 'recommended_next_session' || sortBy === 'last_visit_date') {
          valA = valA ? new Date(valA).getTime() : 0;
          valB = valB ? new Date(valB).getTime() : 0;
        } else {
          valA = String(valA || '').toLowerCase();
          valB = String(valB || '').toLowerCase();
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setTotalCount(filtered.length);

    // Pagination
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    setDataSource(filtered.slice(startIndex, endIndex));
  };

  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [search, dateRange, sortBy, sortOrder, page, rowsPerPage, fullData]);

  return (
    <>
      <style>{`
        /* Custom date picker and input styling */
        .followup-search.ant-input-affix-wrapper {
          background: white !important;
          border: 1px solid #d9d9d9 !important;
        }
        .followup-search .ant-input {
          background: white !important;
          color: #333 !important;
        }
        .followup-search .ant-input::placeholder {
          color: rgba(0, 0, 0, 0.25) !important;
        }
        
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
        
        .filter-select .ant-select-selector {
          background: white !important;
          border: 1px solid #d9d9d9 !important;
          color: #333 !important;
          border-radius: 6px !important;
        }
        .filter-select .ant-select-selection-placeholder {
          color: rgba(0, 0, 0, 0.25) !important;
        }
        
        .ant-table-thead > tr > th {
          background: #fafafa !important;
          color: #2b354f !important;
          font-weight: 600 !important;
        }

        .follow-up-title {
          font-size: 1.25rem !important;
          font-weight: 700 !important;
          color: #2b354f !important;
        }

        .follow-up-subtitle {
          font-size: 0.85rem !important;
          color: #8898aa !important;
          margin-top: 4px;
        }
      `}</style>
      
      <Container fluid style={{ paddingTop: '80px', paddingBottom: '40px' }}>
        <Card style={{
          background: '#FFFFFF',
          border: '1px solid #f0f0f0',
          boxShadow: '0 1px 3px rgba(50,50,93,.15),0 1px 0 rgba(0,0,0,.02)',
          borderRadius: '8px'
        }} className="mb-4">
          <CardBody style={{ padding: '24px' }}>
            <Row className="mb-4 align-items-center">
              <Col md={8} xs={12}>
                <div className="follow-up-title">
                  Follow Up Schedule
                </div>
                <div className="follow-up-subtitle">
                  List of patients whose recommended next session is pending or overdue. Sorted by urgency.
                </div>
              </Col>
              <Col md={4} xs={12} className="text-md-right text-center mt-3 mt-md-0">
                <AntButton
                  size="middle"
                  onClick={() => {
                    resetFilters();
                    initializeData();
                  }}
                  icon={<Iconify icon="material-symbols:refresh" />}
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  Reset & Refresh
                </AntButton>
              </Col>
            </Row>

            {/* Filters */}
            <Row style={{ marginBottom: 24, alignItems: 'center' }}>
              <Col xl={5} lg={5} md={12} className="mb-3 mb-lg-0">
                <Input
                  className="followup-search"
                  placeholder="Search by patient, therapist, plan..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  prefix={
                    <Iconify
                      icon="material-symbols:search"
                      style={{ color: '#8898aa', fontSize: '18px' }}
                    />
                  }
                  allowClear
                  onClear={() => handleSearch("")}
                  style={{ width: '100%' }}
                />
              </Col>

              <Col xl={4} lg={4} md={6} xs={12} className="mb-3 mb-lg-0">
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

              <Col xl={3} lg={3} md={6} xs={12} className="mb-3 mb-lg-0">
                <Select
                  className="filter-select"
                  placeholder="Sort By"
                  style={{ width: '100%' }}
                  value={`${sortBy}_${sortOrder}`}
                  onChange={(value) => {
                    const parts = value.split('_');
                    const order = parts.pop();
                    const field = parts.join('_');
                    handleSortChange(field, order);
                  }}
                >
                  <Select.Option value="recommended_next_session_asc">Next Session Date (Nearest First)</Select.Option>
                  <Select.Option value="recommended_next_session_desc">Next Session Date (Farthest First)</Select.Option>
                  <Select.Option value="patient_name_asc">Patient Name (A-Z)</Select.Option>
                  <Select.Option value="patient_name_desc">Patient Name (Z-A)</Select.Option>
                </Select>
              </Col>
            </Row>

            {/* Table */}
            <Row>
              <Col md={12}>
                <CustomTable
                  columns={columns}
                  data={dataSource}
                  loading={loading}
                  apiPagination={true}
                  currentPage={page}
                  rowsPerPage={rowsPerPage}
                  totalCount={totalCount}
                  onPageChange={handlePageChange}
                  onRowsPerPageChange={handleRowsPerPageChange}
                />
              </Col>
            </Row>
          </CardBody>
        </Card>
      </Container>
    </>
  );
};

export default FollowUpList;
