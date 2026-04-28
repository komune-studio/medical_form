import { Space, Button as AntButton, Tooltip, Modal, message, Input, Select } from 'antd';
import React, { useState, useEffect } from 'react';
import { Card, Row, CardBody, Container } from "reactstrap";
import { Link } from 'react-router-dom';
import Iconify from "../../reusable/Iconify";
import { Col } from "react-bootstrap";
import CustomTable from "../../reusable/CustomTable";
import PatientModel from 'models/PatientModel';
import TreatmentPlanModel from 'models/TreatmentPlanModel';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import LogoRangka from 'assets/img/Logo_rangka.png';
import Mascot from 'assets/img/Mascot.png';
import { getProxiedImageUrl, fetchImageAsBase64 } from '../../../utils/imageProxy';

import moment from 'moment';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import create from 'zustand';

dayjs.extend(customParseFormat);

const useFilter = create((set) => ({
  search: "",
  timeRange: "all",
  gender: "",

  setSearch: (keyword) =>
    set((state) => ({
      search: keyword,
    })),
  setTimeRange: (timeRange) =>
    set((state) => ({
      timeRange: timeRange,
    })),
  setGender: (gender) =>
    set((state) => ({
      gender: gender,
    })),
  resetSearch: () =>
    set((state) => ({
      search: "",
      timeRange: "all",
      gender: ""
    })),
}));

const { Option } = Select;

const parseDateOfBirth = (value) => {
  if (!value) return null;

  const normalizedValue = typeof value === 'string' ? value.split('T')[0].trim() : value;
  const parsedDate = dayjs(normalizedValue, ['YYYY-MM-DD', 'DD/MM/YYYY', 'YYYY/MM/DD'], true);

  if (parsedDate.isValid()) {
    return parsedDate;
  }

  const fallbackDate = dayjs(value);
  return fallbackDate.isValid() ? fallbackDate : null;
};

const PatientList = () => {
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [dataSource, setDataSource] = useState([]);

  // PDF plan picker modal state
  const [planPickerVisible, setPlanPickerVisible] = useState(false);
  const [planPickerPlans, setPlanPickerPlans] = useState([]);
  const [planPickerPatient, setPlanPickerPatient] = useState(null); // { id, name, patient_code }
  const [planPickerSelected, setPlanPickerSelected] = useState(null);
  const [planPickerLoading, setPlanPickerLoading] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  const search = useFilter((state) => state.search);
  const timeRange = useFilter((state) => state.timeRange);
  const gender = useFilter((state) => state.gender);
  const setSearch = useFilter((state) => state.setSearch);
  const setTimeRange = useFilter((state) => state.setTimeRange);
  const setGender = useFilter((state) => state.setGender);
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

  const handleTimeRangeChange = (value) => {
    setTimeRange(value);
    setPage(0);
  };

  const handleGenderChange = (value) => {
    setGender(value);
    setPage(0);
  };

  // Open plan picker modal before downloading
  const handleDownloadProgressPDF = async (patientId, patientName, patientCode) => {
    try {
      message.loading({ content: 'Loading treatment plans...', key: 'plan-load', duration: 0 });
      const res = await TreatmentPlanModel.getAll({ patient_id: patientId });
      const plans = res?.data || [];
      message.destroy('plan-load');

      if (!plans.length) {
        Modal.warning({
          title: 'Belum Ada Treatment Plan',
          content: `${patientName} (${patientCode}) belum memiliki treatment plan. Progress report hanya bisa di-download setelah ada data treatment.`,
          okText: 'Mengerti',
          okButtonProps: { style: { background: '#1890ff', borderColor: '#1890ff' } },
        });
        return;
      }

      setPlanPickerPlans(plans);
      setPlanPickerPatient({ id: patientId, name: patientName, patient_code: patientCode });
      setPlanPickerSelected(plans[0].id);
      setPlanPickerVisible(true);
    } catch (err) {
      message.destroy('plan-load');
      message.error('Gagal mengambil daftar treatment plan.');
    }
  };

  // Generate PDF from the selected plan
  const handleGeneratePDF = async () => {
    if (!planPickerSelected || !planPickerPatient) return;
    try {
      setPdfGenerating(true);
      message.loading({ content: 'Generating PDF report...', key: 'pdf-gen', duration: 0 });

      // Fetch full plan detail (includes treatment_logs)
      const res = await TreatmentPlanModel.getById(planPickerSelected);
      const planDetail = res?.data;
      if (!planDetail) throw new Error('no_data');

      const sessions = planDetail.treatment_logs || [];
      const patient = planPickerPatient;

      // helper
      const fmtDate = (dateStr) => {
        if (!dateStr) return '-';
        try {
          const d = new Date(dateStr);
          if (isNaN(d.getTime())) return '-';
          return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        } catch { return '-'; }
      };
      const calcAge = (dob) => {
        const parsedDate = parseDateOfBirth(dob);
        if (!parsedDate) return null;

        const age = dayjs().diff(parsedDate, 'year');
        return age >= 0 ? age : null;
      };
      const painColor = (val) => {
        const v = parseFloat(val);
        if (isNaN(v)) return null;
        if (v <= 3) return '#4caf50';
        if (v <= 6) return '#ffc107';
        return '#ff4d4f';
      };

      // Fetch full patient data for height/weight/etc
      let patientFull = {};
      try {
        const pRes = await PatientModel.getPatientById(patient.id);
        patientFull = pRes?.data || {};
      } catch (_) {}

      // Build assessment info from planDetail
      const assessTherapist = planDetail.user_name || planDetail.staff_name || '-';
      // Pre-fetch body image as base64 to avoid CORS in production
      const bodyImageUrl = planDetail.image_url
        ? await fetchImageAsBase64(planDetail.image_url)
        : null;

      // Build hidden paper element
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:820px;background:#fff;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;box-sizing:border-box;';
      wrapper.innerHTML = `
        <div id="pdf-paper-tmp" style="background:#fff;width:820px;padding:18px 24px 28px;box-sizing:border-box;">
          <!-- ROW 1: Logo + Title -->
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:3px;">
            <img src="${LogoRangka}" alt="Rangka" style="width:110px;object-fit:contain;flex-shrink:0;" crossorigin="anonymous" />
            <div style="flex:1;text-align:center;">
              <div style="font-size:22px;font-weight:700;color:#111;line-height:1.2;">Treatment Plan &amp; Progress Report</div>
            </div>
          </div>
          <div style="height:1px;background:#111;margin:3px 0 10px;"></div>

          <!-- ROW 2: 3 columns -->
          <div style="display:flex;gap:0;margin-bottom:10px;align-items:flex-start;">
            <!-- Col 1 Client Data -->
            <div style="flex:0 0 28%;padding-right:12px;">
              <div style="font-size:10px;font-weight:700;color:#111;margin-bottom:4px;">Client's Data:</div>
              <table style="border-collapse:collapse;width:100%;">
                <tbody>
                  ${[
          ['Patient Name:', patientFull.name || patient.name],
          ['Phone Number:', patientFull.phone_number || patientFull.phone],
          ['Email Address:', patientFull.email],
          ['Age:', (() => {
            if (!patientFull.date_of_birth) return null;
            const a = calcAge(patientFull.date_of_birth);
            return (a != null && a >= 0) ? a + ' years' : null;
          })()],
          ['Height (cm):', patientFull.height],
          ['Weight (kg):', patientFull.weight],
        ].map(([lbl, val]) => `
                    <tr>
                      <td style="font-weight:700;font-size:9px;color:#111;padding:2.5px 8px 2.5px 0;vertical-align:top;white-space:nowrap;line-height:1.5;">${lbl}</td>
                      <td style="font-size:9px;color:#333;padding:2.5px 0;vertical-align:top;line-height:1.5;word-break:break-word;">${val || '-'}</td>
                    </tr>`).join('')}
                </tbody>
              </table>
            </div>

            <!-- Col 2 Assessment -->
            <div style="flex:0 0 47%;padding-right:12px;padding-left:12px;">
              <div style="font-size:10px;font-weight:700;color:#111;margin-bottom:4px;">Rangka Assessment:</div>
              <table style="border-collapse:collapse;width:100%;">
                <tbody>
                  ${[
          ['Assessment Date:', fmtDate(planDetail.started_at)],
          ['Assessment Therapist:', assessTherapist],
          ['Service Type:', planDetail.service_type],
          ['Injury Type:', planDetail.injury_type],
          ['Area Concern:', planDetail.area_concern],
          ['Diagnosis:', planDetail.diagnosis_result],
          ['Range of Motion Impact:', planDetail.range_of_motion_impact || sessions[0]?.range_of_motion_impact],
          ['Recovery Goals:', planDetail.recovery_goals],
          ['Expected Recovery Time:', planDetail.expected_recovery_time],
        ].map(([lbl, val]) => `
                    <tr>
                      <td style="font-weight:700;font-size:9px;color:#111;padding:2.5px 8px 2.5px 0;vertical-align:top;white-space:nowrap;line-height:1.5;">${lbl}</td>
                      <td style="font-size:9px;color:#333;padding:2.5px 0;vertical-align:top;line-height:1.5;word-break:break-word;">${val || '-'}</td>
                    </tr>`).join('')}
                </tbody>
              </table>
            </div>

            <!-- Col 3 Mascot -->
            <div style="flex:0 0 25%;display:flex;flex-direction:column;align-items:center;padding-left:8px;">
              <img src="${Mascot}" alt="Mascot" style="width:100%;max-width:100px;object-fit:contain;" crossorigin="anonymous" />
              <div style="margin-top:6px;font-size:8px;font-style:italic;color:#666;text-align:center;line-height:1.5;">Stay focused, stay strong.<br/>We've Got Your Back!</div>
            </div>
          </div>

          <!-- DIVIDER -->
          <div style="height:1px;background:#bbb;margin:6px 0 12px;"></div>

          <!-- TABLE TITLE -->
          <div style="text-align:center;margin-bottom:5px;">
            <div style="font-size:17px;font-weight:700;color:#111;">The Progress Table</div>
            <div style="font-size:8px;color:#777;font-style:italic;margin-top:1px;">see how you progress over the week</div>
          </div>

          <!-- LEGEND -->
          <div style="display:flex;justify-content:flex-end;gap:12px;margin-bottom:6px;flex-wrap:wrap;">
            ${[['#ff4d4f', ': Treatment + Rest'], ['#ffc107', ': Treatment + Exercise'], ['#4caf50', ': Back to Sports Preparation']].map(([c, l]) =>
          `<div style="display:flex;align-items:center;gap:4px;font-size:8px;color:#444;">
                <span style="width:8px;height:8px;border-radius:50%;background:${c};display:inline-block;flex-shrink:0;"></span>
                <span>${l}</span>
              </div>`).join('')}
          </div>

          <!-- TABLE -->
          <div style="width:100%;margin-bottom:18px;overflow:hidden;">
            <table style="width:100%;border-collapse:collapse;font-size:8px;table-layout:fixed;">
              <colgroup>
                <col style="width:28px"/><col style="width:52px"/><col style="width:65px"/>
                <col style="width:75px"/><col style="width:100px"/><col style="width:85px"/><col style="width:80px"/>
                <col style="width:40px"/><col style="width:40px"/>
              </colgroup>
              <thead>
                <tr>
                  ${[['Session<br/>#', '#fafafa'], ['Session<br/>Date', '#fafafa'], ['Rangka<br/>Therapist', '#fafafa'], ['Treatment', '#fafafa'], ['Objective<br/>Progress', '#fafafa'], ['Home<br/>Exercise', '#fafafa'], ['Recovery<br/>Tips', '#fafafa'], ['Pre-<br/>Treatment', '#fffbee'], ['Post-<br/>Treatment', '#f0fff4']]
          .map(([lbl, bg]) => `<th style="border:0.5px solid #ccc;padding:5px 3px;font-size:8px;font-weight:700;text-align:center;vertical-align:middle;color:#111;line-height:1.3;background:${bg};overflow:hidden;word-break:break-word;">${lbl}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${sessions.map((s, i) => {
            const pb = s.pain_before != null ? s.pain_before.toString() : '-';
            const pa = s.pain_after != null ? s.pain_after.toString() : '-';
            const pbColor = painColor(pb);
            const paColor = painColor(pa);
            const therapistName = s.user_name || s.staff_name || '-';
            return `<tr>
                    <td style="border:0.5px solid #ddd;padding:4px 3px;font-size:8px;text-align:center;font-weight:700;background:#fafafa;vertical-align:top;">${i + 1}</td>
                    <td style="border:0.5px solid #ddd;padding:4px 3px;font-size:8px;text-align:center;vertical-align:top;color:#333;">${fmtDate(s.visit_date)}</td>
                    <td style="border:0.5px solid #ddd;padding:4px 3px;font-size:8px;vertical-align:top;color:#333;word-break:break-word;">${therapistName}</td>
                    <td style="border:0.5px solid #ddd;padding:4px 3px;font-size:8px;vertical-align:top;color:#333;word-break:break-word;">${s.treatment || '-'}</td>
                    <td style="border:0.5px solid #ddd;padding:4px 3px;font-size:8px;vertical-align:top;color:#333;word-break:break-word;">${s.objective_progress || '-'}</td>
                    <td style="border:0.5px solid #ddd;padding:4px 3px;font-size:8px;vertical-align:top;color:#333;word-break:break-word;">${s.exercise || '-'}</td>
                    <td style="border:0.5px solid #ddd;padding:4px 3px;font-size:8px;vertical-align:top;color:#333;word-break:break-word;">${s.recovery_tips || '-'}</td>
                    <td style="border:0.5px solid #ddd;padding:4px 3px;font-size:8px;text-align:center;background:#fffbee;vertical-align:top;">
                      <span style="display:inline-flex;align-items:center;gap:3px;font-weight:700;font-size:9px;color:#111;">
                        ${pb}${pbColor ? `<span style="width:7px;height:7px;border-radius:50%;background:${pbColor};display:inline-block;flex-shrink:0;"></span>` : ''}
                      </span>
                    </td>
                    <td style="border:0.5px solid #ddd;padding:4px 3px;font-size:8px;text-align:center;background:#f0fff4;vertical-align:top;">
                      <span style="display:inline-flex;align-items:center;gap:3px;font-weight:700;font-size:9px;color:#111;">
                        ${pa}${paColor ? `<span style="width:7px;height:7px;border-radius:50%;background:${paColor};display:inline-block;flex-shrink:0;"></span>` : ''}
                      </span>
                    </td>
                  </tr>`;
          }).join('')}
              </tbody>
            </table>
          </div>

          <!-- BODY ANNOTATIONS -->
          ${bodyImageUrl ? `<div style="margin-bottom:18px;">
            <div style="font-size:9px;font-weight:700;color:#111;margin-bottom:6px;">Body Pain Diagram:</div>
            <div style="text-align:center;">
              <img src="${bodyImageUrl}" alt="body annotation" crossorigin="anonymous" style="max-width:280px;width:100%;display:block;margin:0 auto;" />
            </div>
          </div>` : ''}
        </div>
      `;

      document.body.appendChild(wrapper);
      await document.fonts.ready;
      const imgs = wrapper.querySelectorAll('img');
      await Promise.all(Array.from(imgs).map(img =>
        img.complete ? Promise.resolve() : new Promise(res => { img.onload = res; img.onerror = res; })
      ));

      const paperEl = wrapper.querySelector('#pdf-paper-tmp');
      const canvas = await html2canvas(paperEl, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 0,
        removeContainer: true,
        letterRendering: true,
        foreignObjectRendering: false,
      });

      document.body.removeChild(wrapper);

      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 8;
      const printW = pageW - margin * 2;
      const ratio = canvas.height / canvas.width;
      const printH = printW * ratio;

      let yOffset = 0;
      let remainH = printH;
      while (remainH > 0) {
        if (yOffset > 0) pdf.addPage();
        const sliceH = Math.min(pageH - margin * 2, remainH);
        const srcY = (yOffset / printH) * canvas.height;
        const srcH = (sliceH / printH) * canvas.height;
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = Math.round(srcH);
        sliceCanvas.getContext('2d').drawImage(canvas, 0, Math.round(srcY), canvas.width, Math.round(srcH), 0, 0, canvas.width, Math.round(srcH));
        pdf.addImage(sliceCanvas.toDataURL('image/jpeg', 0.97), 'JPEG', margin, margin, printW, sliceH);
        yOffset += sliceH;
        remainH -= sliceH;
      }

      const safeName = (patientFull.name || patient.name || 'patient').replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-');
      const planTitle = (planDetail.title || `plan-${planPickerSelected}`).replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-');
      pdf.save(`progress-report-${safeName}-${planTitle}-${new Date().toISOString().split('T')[0]}.pdf`);

      message.success({ content: `PDF downloaded successfully!`, key: 'pdf-gen', duration: 3 });
      setPlanPickerVisible(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      message.destroy('pdf-gen');
      message.error('Gagal generate PDF. Silakan coba lagi.');
    } finally {
      setPdfGenerating(false);
    }
  };



  const handleViewPatient = async (row) => {
    try {
      const res = await TreatmentPlanModel.getAll({ patient_id: row.id });
      const plans = res?.data || [];
      if (!plans.length) {
        Modal.warning({
          title: 'Belum Ada Treatment Plan',
          content: `${row.name} (${row.patient_code}) belum memiliki treatment plan. Halaman detail baru bisa dibuka setelah ada data treatment.`,
          okText: 'Mengerti',
          okButtonProps: { style: { background: '#1890ff', borderColor: '#1890ff' } },
        });
        return;
      }
    } catch (e) { /* allow navigation even if check fails */ }
    window.location.href = `/patients/${row.id}`;
  };

  const columns = [
    {
      id: 'patient_code',
      label: 'Patient ID',
      filter: true,
      render: (row) => (
        <div style={{ fontWeight: 500, color: '#333' }}>{row.patient_code}</div>
      )
    },
    {
      id: 'name',
      label: 'Patient Name',
      filter: true,
      render: (row) => (
        <div>
          <div style={{ fontWeight: 500, color: '#333' }}>{row.name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {row.gender} {row.age ? `• ${row.age} years` : ''}
          </div>
        </div>
      )
    },
    {
      id: 'contact_info',
      label: 'Contact',
      filter: false,
      render: (row) => (
        <div>
          <div style={{ color: '#333' }}>{row.phone || 'No phone'}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{row.email || 'No email'}</div>
        </div>
      )
    },
    {
      id: 'body_metrics',
      label: 'Body Metrics',
      filter: false,
      render: (row) => {
        const hasMetrics = row.height || row.weight || row.bmi;
        if (!hasMetrics) {
          return <span style={{ color: '#999', fontSize: '12px' }}>No data</span>;
        }

        return (
          <div>
            {row.height && (
              <div style={{ fontSize: '12px', color: '#333' }}>
                H: {row.height} cm
              </div>
            )}
            {row.weight && (
              <div style={{ fontSize: '12px', color: '#333' }}>
                W: {row.weight} kg
              </div>
            )}
            {row.bmi && (
              <div style={{ fontSize: '12px', color: '#1890ff', fontWeight: 500 }}>
                BMI: {row.bmi}
              </div>
            )}
          </div>
        );
      }
    },
    {
      id: 'created_at',
      label: 'Registration Date',
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
              <AntButton
                type={'link'}
                style={{ color: '#333' }}
                className={"d-flex align-items-center justify-content-center"}
                shape="circle"
                icon={<Iconify icon={"material-symbols:visibility"} />}
                onClick={() => handleViewPatient(row)}
              />
            </Tooltip>

            <Tooltip title="Edit Patient">
              <Link to={`/patients/${row.id}/edit`}>
                <AntButton
                  type={'link'}
                  style={{ color: '#333' }}
                  className={"d-flex align-items-center justify-content-center"}
                  shape="circle"
                  icon={<Iconify icon={"material-symbols:edit"} />}
                />
              </Link>
            </Tooltip>

            <Tooltip title="Download Progress Report (PDF)">
              <AntButton
                type={'link'}
                style={{ color: '#1890ff' }}
                onClick={() => handleDownloadProgressPDF(row.id, row.name, row.patient_code)}
                className={"d-flex align-items-center justify-content-center"}
                shape="circle"
                icon={<Iconify icon={"mdi:file-pdf-box"} />}
              />
            </Tooltip>

            <Tooltip title="Delete Patient">
              <AntButton
                type={'link'}
                style={{ color: '#ff4d4f' }}
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
      await PatientModel.deletePatient(id);
      message.success('Patient deleted successfully');
      initializeData();
    } catch (error) {
      console.error("Error deleting patient:", error);
      message.error('Failed to delete patient');
    }
  };

  const onDelete = (id) => {
    Modal.confirm({
      title: "Delete Patient",
      content: "Are you sure you want to delete this patient?",
      okText: "Delete",
      okType: "primary",
      cancelText: "Cancel",
      onOk: () => deleteItem(id)
    });
  };

  const exportCSV = async () => {
    setExportLoading(true);
    try {
      const filters = {};
      if (search) filters.search = search;
      if (gender) filters.gender = gender;
      if (timeRange && timeRange !== "all") filters.timeRange = timeRange;

      const result = await PatientModel.getAllPatients(filters);

      if (!result || result.http_code !== 200) {
        throw new Error("Failed to fetch data");
      }

      let data = result.data || [];

      data = data.sort((a, b) => {
        const idA = parseInt(a.id) || 0;
        const idB = parseInt(b.id) || 0;
        return idA - idB;
      });

      const headers = [
        'ID',
        'Patient Code',
        'Full Name',
        'Date of Birth',
        'Age',
        'Gender',
        'Height (cm)',
        'Weight (kg)',
        'BMI',
        'Phone Number',
        'Email',
        'Address',
        'Registration Date'
      ];

      const rows = data.map(patient => {
        const dob = patient.date_of_birth ?
          moment(patient.date_of_birth).format('DD/MM/YYYY') : '';

        const regDate = patient.created_at ?
          moment(patient.created_at).format('DD/MM/YYYY HH:mm') : '';

        return [
          patient.id || '',
          patient.patient_code || '',
          patient.name || '',
          dob,
          patient.age || '',
          patient.gender || '',
          patient.height || '',
          patient.weight || '',
          patient.bmi || '',
          patient.phone || '',
          patient.email || '',
          patient.address || '',
          regDate
        ];
      });

      const allRows = [headers, ...rows];

      const csvContent = allRows
        .map(row =>
          row
            .map(cell => {
              const cellStr = String(cell || '');
              if (cellStr.includes(';') || cellStr.includes('"') || cellStr.includes('\n')) {
                return `"${cellStr.replace(/"/g, '""')}"`;
              }
              return cellStr;
            })
            .join(';')
        )
        .join('\n');

      const BOM = '\uFEFF';
      const finalContent = BOM + csvContent;

      const blob = new Blob([finalContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const timestamp = moment().format('YYYY-MM-DD_HH-mm');
      link.download = `patients_${timestamp}.csv`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      message.success(`CSV exported! ${data.length} patients exported.`);

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
      if (gender) filters.gender = gender;
      if (timeRange && timeRange !== "all") {
        filters.timeRange = timeRange;
      }

      const result = await PatientModel.getAllPatients(filters);

      if (result && result.http_code === 200) {
        const allData = Array.isArray(result.data) ? result.data : [];

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
      console.error("Error fetching patients:", error);
      setDataSource([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeData(page, rowsPerPage);
  }, [page, rowsPerPage, search, timeRange, gender]);

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
        .patient-search.ant-input-affix-wrapper {
          background: white !important;
          border: 1px solid #d9d9d9 !important;
        }
        
        .patient-search .ant-input {
          background: white !important;
          color: #333 !important;
        }
        
        .patient-search .ant-input::placeholder {
          color: rgba(0, 0, 0, 0.25) !important;
        }
        
        .patient-search .ant-input-prefix {
          color: #666 !important;
        }
        
        .patient-search.ant-input-affix-wrapper:hover,
        .patient-search.ant-input-affix-wrapper:focus,
        .patient-search.ant-input-affix-wrapper-focused {
          border-color: #000000 !important;
          box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1) !important;
        }
        
        .patient-search .ant-input-clear-icon {
          color: rgba(0, 0, 0, 0.25) !important;
        }
        
        .patient-search .ant-input-clear-icon:hover {
          color: rgba(0, 0, 0, 0.45) !important;
        }
        
        .patient-search.ant-input-affix-wrapper {
          border-radius: 6px !important;
        }
        
        /* Select filter */
        .filter-select .ant-select-selector {
          background: white !important;
          border: 1px solid #d9d9d9 !important;
          color: #333 !important;
          border-radius: 6px !important;
          height: 40px !important; /* Fixed height for alignment */
          display: flex !important;
          align-items: center !important;
        }
        
        /* Ensure search input matches height */
        .patient-search.ant-input-affix-wrapper {
          height: 40px !important;
          display: flex !important;
          align-items: center !important;
        }

        .filter-select {
          min-width: 150px !important; /* Ensure minimum width as requested */
          width: 100%;
        }
        
        .filter-select .ant-select-selection-placeholder {
          color: rgba(0, 0, 0, 0.25) !important;
          line-height: 38px !important; /* Vertically center placeholder */
        }
        
        .filter-select .ant-select-selection-item {
          color: #333 !important;
          line-height: 38px !important; /* Vertically center text */
        }
        
        .filter-select .ant-select-arrow {
          color: rgba(0, 0, 0, 0.25) !important;
        }
        
        .filter-select .ant-select-selector:hover {
          border-color: #000000 !important;
        }
        
        .filter-select.ant-select-focused .ant-select-selector {
          border-color: #000000 !important;
          box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1) !important;
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
          .patient-search.ant-input-affix-wrapper {
            height: 44px !important;
            font-size: 16px !important;
          }
          
          .patient-search .ant-input {
            font-size: 16px !important;
          }
          
          .patient-search .ant-input::placeholder {
            font-size: 16px !important;
          }
          
          .patient-search .ant-input-prefix {
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
          
          .patient-management-title {
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
                <div className="patient-management-title" style={{ fontWeight: "bold", fontSize: "1.2em", color: '#333' }}>
                  Patient Management
                </div>
              </Col>
              <Col md={6} xs={12} className="text-md-right text-center">
                <div className="button-group" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <Link to="/patients/create" style={{ flexShrink: 0 }}>
                    <AntButton
                      size={'middle'}
                      type={'primary'}
                      icon={<Iconify icon={"material-symbols:add"} />}
                      className="custom-add-button"
                    >
                      Add Patient
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

            <Row style={{ marginBottom: 24, alignItems: 'center' }}>
              <Col xl={6} lg={5} md={12} className="mb-3 mb-lg-0">
                <Input
                  className="patient-search"
                  placeholder="Search by name, ID, or phone"
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
              <Col xl={2} lg={1} className="d-none d-lg-block"></Col>
              <Col xl={2} lg={3} md={6} xs={6} className="mb-3 mb-lg-0 pe-md-2">
                <Select
                  className="filter-select"
                  placeholder="Gender"
                  style={{ width: '100%' }}
                  value={gender || undefined}
                  onChange={handleGenderChange}
                  allowClear
                  onClear={() => handleGenderChange("")}
                >
                  <Select.Option value="">All</Select.Option>
                  <Select.Option value="MALE">Male</Select.Option>
                  <Select.Option value="FEMALE">Female</Select.Option>
                </Select>
              </Col>
              <Col xl={2} lg={3} md={6} xs={6} className="mb-3 mb-lg-0 ps-md-2">
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
            </Row>

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

      {/* ── Plan Picker Modal ── */}
      <Modal
        open={planPickerVisible}
        onCancel={() => { setPlanPickerVisible(false); setPlanPickerPlans([]); }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>📋</span>
            <span>Download Progress Report</span>
          </div>
        }
        footer={[
          <AntButton key="cancel" onClick={() => { setPlanPickerVisible(false); setPlanPickerPlans([]); }}>
            Cancel
          </AntButton>,
          <AntButton
            key="download"
            type="primary"
            loading={pdfGenerating}
            icon={<Iconify icon="mdi:file-pdf-box" />}
            onClick={handleGeneratePDF}
            style={{ background: '#1890ff', borderColor: '#1890ff' }}
          >
            Download PDF
          </AntButton>,
        ]}
        width={480}
      >
        <div style={{ padding: '8px 0' }}>
          <p style={{ color: '#555', marginBottom: 16 }}>
            Pasien <strong>{planPickerPatient?.name}</strong> memiliki{' '}
            <strong>{planPickerPlans.length}</strong> treatment plan. Pilih plan mana yang ingin di-download:
          </p>
          <Select
            style={{ width: '100%' }}
            value={planPickerSelected}
            onChange={val => setPlanPickerSelected(val)}
            size="large"
            optionLabelProp="label"
          >
            {planPickerPlans.map(plan => {
              const planDate = plan.started_at
                ? new Date(plan.started_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                : '-';
              return (
                <Option
                  key={plan.id}
                  value={plan.id}
                  label={plan.title || `Plan #${plan.id}`}
                >
                  <div style={{ padding: '2px 0' }}>
                    <div style={{ fontWeight: 600, color: '#222' }}>{plan.title || `Plan #${plan.id}`}</div>
                    <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                      {plan.service_type || '-'} &nbsp;•&nbsp; {planDate}
                    </div>
                  </div>
                </Option>
              );
            })}
          </Select>
        </div>
      </Modal>
    </>
  );
}

export default PatientList;
