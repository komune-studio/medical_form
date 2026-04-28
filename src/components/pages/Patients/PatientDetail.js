import React, { useState, useEffect } from 'react';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import { message, Spin, Select } from 'antd';
import TreatmentPlanModel from 'models/TreatmentPlanModel';
import PatientModel from 'models/PatientModel';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import LogoRangka from 'assets/img/Logo_rangka.png';
import Mascot from 'assets/img/Mascot.png';
import { getProxiedImageUrl, fetchImageAsBase64 } from '../../../utils/imageProxy';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

const { Option } = Select;

dayjs.extend(customParseFormat);

// ─── helpers ─────────────────────────────────────────────────────────────────

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

const calculateAge = (dob) => {
  const parsedDate = parseDateOfBirth(dob);
  if (!parsedDate) return null;

  const age = dayjs().diff(parsedDate, 'year');
  return age >= 0 ? age : null;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return '-'; }
};

const painColor = (val) => {
  const v = parseFloat(val);
  if (isNaN(v)) return null;
  if (v <= 3) return '#4caf50';
  if (v <= 6) return '#ffc107';
  return '#ff4d4f';
};

// ─── sub-components ───────────────────────────────────────────────────────────

const InfoRow = ({ label, value }) => (
  <tr>
    <td style={{
      fontWeight: 700, fontSize: 9, color: '#111',
      padding: '2.5px 8px 2.5px 0', verticalAlign: 'top',
      whiteSpace: 'nowrap', lineHeight: 1.5,
    }}>{label}</td>
    <td style={{
      fontSize: 9, color: '#333', padding: '2.5px 0',
      verticalAlign: 'top', lineHeight: 1.5, wordBreak: 'break-word',
    }}>{value || '-'}</td>
  </tr>
);

const PainBadge = ({ value }) => {
  if (value === null || value === undefined || value === '-')
    return <span style={{ color: '#999', fontSize: 9 }}>-</span>;
  const color = painColor(value);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontWeight: 700, fontSize: 9, color: '#111' }}>
      {value}
      {color && <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />}
    </span>
  );
};

const LegendItem = ({ color, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 8, color: '#444' }}>
    <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
    <span>{label}</span>
  </div>
);

// ─── Icons ───────────────────────────────────────────────────────────────────

const PdfIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
    <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" fill="#fff" opacity="0.9" />
    <path d="M14 2V8H20" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <text x="7" y="18" fontSize="6" fontWeight="bold" fill="#e53e3e" fontFamily="helvetica">PDF</text>
  </svg>
);

const DownloadIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
    <path d="M12 16L7 11H10V4H14V11H17L12 16Z" fill="#fff" />
    <path d="M5 20H19" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const BackIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
    <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── main component ───────────────────────────────────────────────────────────

const PatientDetail = () => {
  const { id } = useParams();
  const history = useHistory();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [patientData, setPatientData] = useState(null);
  const [patientPlans, setPatientPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [planDetail, setPlanDetail] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null); // 'no_history' | 'server_error' | null
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [bodyImageBase64, setBodyImageBase64] = useState(null);
  const requestedPlanId = new URLSearchParams(location.search).get('planId');

  useEffect(() => {
    const loadPatientAndPlans = async () => {
      try {
        setLoading(true);
        setFetchError(null);
        
        // 1. Load patient data
        const patientRes = await PatientModel.getPatientById(id);
        if (!patientRes?.data) throw new Error('patient_not_found');
        setPatientData(patientRes.data);

        // 2. Load all plans for this patient
        const plansRes = await TreatmentPlanModel.getAll({ patient_id: id });
        const plans = plansRes?.data || [];
        setPatientPlans(plans);

        if (plans.length === 0) {
          setFetchError('no_history');
        } else {
          const matchedPlan = requestedPlanId
            ? plans.find((plan) => String(plan.id) === String(requestedPlanId))
            : null;

          setSelectedPlanId(matchedPlan ? matchedPlan.id : plans[0].id);
        }
      } catch (err) {
        setFetchError('server_error');
      } finally {
        setLoading(false);
      }
    };
    if (id) loadPatientAndPlans();
  }, [id, requestedPlanId]);

  useEffect(() => {
    if (!id || !selectedPlanId) return;

    const params = new URLSearchParams(location.search);
    if (String(params.get('planId')) === String(selectedPlanId)) return;

    params.set('planId', selectedPlanId);
    history.replace({
      pathname: `/patients/${id}`,
      search: `?${params.toString()}`
    });
  }, [history, id, location.search, selectedPlanId]);

  useEffect(() => {
    const loadPlanDetail = async () => {
      if (!selectedPlanId) return;
      try {
        setLoadingPlan(true);
        setBodyImageBase64(null);
        const res = await TreatmentPlanModel.getById(selectedPlanId);
        if (res?.data) {
          setPlanDetail(res.data);
          // Pre-fetch body image as base64 to avoid CORS in production
          if (res.data.image_url) {
            fetchImageAsBase64(res.data.image_url).then(b64 => setBodyImageBase64(b64));
          }
        }
      } catch (err) {
        console.error('Failed to load plan details', err);
      } finally {
        setLoadingPlan(false);
      }
    };
    loadPlanDetail();
  }, [selectedPlanId]);

  const handleDownloadPDF = async () => {
    const paperEl = document.getElementById('pd-paper-content');
    if (!paperEl) return;
    try {
      setPdfLoading(true);
      message.loading({ content: 'Generating PDF…', key: 'pdf', duration: 0 });

      const prevBorder = paperEl.style.border;
      const prevShadow = paperEl.style.boxShadow;
      const prevRadius = paperEl.style.borderRadius;
      const prevPadding = paperEl.style.padding;
      const prevWidth = paperEl.style.width;
      const prevMaxWidth = paperEl.style.maxWidth;
      
      paperEl.style.border = 'none';
      paperEl.style.boxShadow = 'none';
      paperEl.style.borderRadius = '0';
      paperEl.style.padding = '18px 24px 28px';
      paperEl.style.width = '820px';
      paperEl.style.maxWidth = '820px';

      await document.fonts.ready;

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
        width: 820,
        windowWidth: 820,
      });

      paperEl.style.border = prevBorder;
      paperEl.style.boxShadow = prevShadow;
      paperEl.style.borderRadius = prevRadius;
      paperEl.style.padding = prevPadding;
      paperEl.style.width = prevWidth;
      paperEl.style.maxWidth = prevMaxWidth;

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
        sliceCanvas.getContext('2d').drawImage(
          canvas, 0, Math.round(srcY), canvas.width, Math.round(srcH),
          0, 0, canvas.width, Math.round(srcH)
        );

        const sliceData = sliceCanvas.toDataURL('image/jpeg', 0.97);
        pdf.addImage(sliceData, 'JPEG', margin, margin, printW, sliceH);

        yOffset += sliceH;
        remainH -= sliceH;
      }

      const safeName = (patientData?.name || 'patient')
        .replace(/[^a-zA-Z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
      pdf.save(`progress-report-${safeName}-${new Date().toISOString().split('T')[0]}.pdf`);

      message.success({ content: 'PDF downloaded!', key: 'pdf', duration: 2 });
    } catch (err) {
      console.error(err);
      message.error({ content: 'Failed to generate PDF', key: 'pdf', duration: 3 });
    } finally {
      setPdfLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Spin size="large" tip="Loading patient data..." />
      </div>
    );
  }

  if (!patientPlans.length && fetchError === 'no_history') {
    return (
      <div className="patient-detail-wrapper" style={{ padding: '60px 16px', display: 'flex', justifyContent: 'center', background: '#f7f8fa', minHeight: '100vh', width: '100%' }}>
        <div style={{ textAlign: 'center', padding: '60px 40px', background: '#fff', borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.06)', width: '100%', maxWidth: 500 }}>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fff7e6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M12 9V13M12 17H12.01M3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12Z" stroke="#faad14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <h3 style={{ fontSize: 18, color: '#333', marginBottom: 8, fontWeight: 700 }}>Belum Ada Medical History</h3>
          <p style={{ fontSize: 14, color: '#666', marginBottom: 28, lineHeight: 1.6 }}>
            Pasien ini belum memiliki riwayat medis atau progress report yang tercatat di sistem.
          </p>
          <button style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', color: '#444',
            border: '1px solid #d9d9d9', borderRadius: 6, padding: '8px 16px', fontSize: 14,
            fontWeight: 500, cursor: 'pointer',
          }} onClick={() => history.goBack()}>
            <BackIcon /> Kembali
          </button>
        </div>

        {/* PLAN SELECTOR */}
        {patientPlans.length > 0 && (
          <div style={{ width: '100%', maxWidth: 820, marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 6 }}>Select Treatment Plan:</label>
            <Select 
              value={selectedPlanId} 
              onChange={val => setSelectedPlanId(val)}
              style={{ width: '100%', maxWidth: 400 }}
              disabled={loadingPlan}
            >
              {patientPlans.map(plan => (
                <Option key={plan.id} value={plan.id}>
                  {plan.title} - {formatDate(plan.started_at)}
                </Option>
              ))}
            </Select>
            {loadingPlan && <Spin size="small" style={{ marginLeft: 12 }} />}
          </div>
        )}

      </div>
    );
  }

  if (fetchError === 'server_error') {
    return (
      <div className="patient-detail-wrapper" style={{ padding: '60px 16px', display: 'flex', justifyContent: 'center', background: '#f7f8fa', minHeight: '100vh', width: '100%' }}>
        <div style={{ textAlign: 'center', padding: '60px 40px', background: '#fff', borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.06)', width: '100%', maxWidth: 500 }}>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fff2f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M12 9V13M12 17H12.01M3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12Z" stroke="#ff4d4f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <h3 style={{ fontSize: 18, color: '#333', marginBottom: 8, fontWeight: 700 }}>Gagal Memuat Data</h3>
          <p style={{ fontSize: 14, color: '#666', marginBottom: 28, lineHeight: 1.6 }}>
            Terjadi kesalahan saat memuat data pasien. Silakan coba lagi.
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', color: '#444',
              border: '1px solid #d9d9d9', borderRadius: 6, padding: '8px 16px', fontSize: 14,
              fontWeight: 500, cursor: 'pointer',
            }} onClick={() => history.goBack()}>
              <BackIcon /> Kembali
            </button>
            <button style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, background: '#1890ff', color: '#fff',
              border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 14,
              fontWeight: 500, cursor: 'pointer',
            }} onClick={() => window.location.reload()}>
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loadingPlan) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Spin size="large" tip="Loading treatment plan..." />
      </div>
    );
  }

  if (!planDetail && !loading && patientPlans.length > 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Spin size="large" tip="Loading plan data..." />
      </div>
    );
  }

  const patient = patientData || {};
  const sessions = planDetail?.treatment_logs || [];
  
  const firstSession = planDetail ? {
    appointment_date: planDetail.started_at,
    user_name: planDetail.user_name,
    staff_name: planDetail.staff_name,
    service_type: planDetail.service_type,
    injury_type: planDetail.injury_type,
    area_concern: planDetail.area_concern,
    diagnosis_result: planDetail.diagnosis_result,
    range_of_motion_impact: sessions[0]?.range_of_motion_impact || '',
    recovery_goals: planDetail.recovery_goals,
    expected_recovery_time: planDetail.expected_recovery_time,
  } : {};
  

  const tableHeaders = [
    { label: 'Session\n#', width: 28, bg: '#fafafa' },
    { label: 'Session\nDate', width: 52, bg: '#fafafa' },
    { label: 'Rangka\nTherapist', width: 65, bg: '#fafafa' },
    { label: 'Treatment', width: 75, bg: '#fafafa' },
    { label: 'Objective\nProgress', width: 100, bg: '#fafafa' },
    { label: 'Home\nExercise', width: 85, bg: '#fafafa' },
    { label: 'Recovery\nTips', width: 80, bg: '#fafafa' },
    { label: 'Pre-\nTreatment', width: 40, bg: '#fffbee' },
    { label: 'Post-\nTreatment', width: 40, bg: '#f0fff4' },
  ];

  return (
    <>
      <style>{`
        .patient-detail-wrapper * { box-sizing: border-box; }

        .pd-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 8px;
          width: 100%;
          max-width: 820px;
        }

        .pd-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #fff;
          color: #444;
          border: 1px solid #d9d9d9;
          border-radius: 6px;
          padding: 7px 14px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.15s;
          text-decoration: none;
        }
        .pd-back-btn:hover {
          border-color: #1890ff;
          color: #1890ff;
        }

        .pd-pdf-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 9px 20px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          box-shadow: 0 2px 8px rgba(229,62,62,0.35);
          transition: all 0.15s;
          letter-spacing: 0.2px;
        }
        .pd-pdf-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #c53030 0%, #9b2c2c 100%);
          box-shadow: 0 4px 12px rgba(229,62,62,0.45);
          transform: translateY(-1px);
        }
        .pd-pdf-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        @keyframes pd-spin { to { transform: rotate(360deg); } }
        .pd-spin { animation: pd-spin 0.8s linear infinite; display: inline-block; }

        .pd-paper {
          background: #fff;
          width: 100%;
          max-width: 820px;
          padding: 18px 24px 28px;
          border: 1px solid #e8e8e8;
          border-radius: 4px;
          box-shadow: 0 1px 8px rgba(0,0,0,0.08);
          overflow: hidden;
        }

        .pd-table {
          width: 100%;
          table-layout: fixed;
        }
        .pd-table tbody tr:hover td { background: #fafcff !important; }
        .pd-table td, .pd-table th {
          overflow: hidden;
          word-break: break-word;
          word-wrap: break-word;
        }

        @media (max-width: 600px) {
          .pd-three-col { flex-direction: column !important; }
          .pd-three-col > div { flex: none !important; width: 100% !important; }
        }

        @media print {
          body * { visibility: hidden; }
          .pd-paper, .pd-paper * { visibility: visible; }
          .pd-paper {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 14px 18px !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
          }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          @page { size: A4; margin: 10mm 12mm; }
        }
      `}</style>

      <div className="patient-detail-wrapper" style={{
        background: '#fff',
        minHeight: '100%',
        padding: '20px 16px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        boxSizing: 'border-box',
      }}>

        {/* ── TOOLBAR ── */}
        <div className="pd-toolbar">
          <button className="pd-back-btn" onClick={() => history.goBack()}>
            <BackIcon /> Back to Patients
          </button>

          <button className="pd-pdf-btn" onClick={handleDownloadPDF} disabled={pdfLoading}>
            {pdfLoading ? (
              <>
                <span className="pd-spin">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                    <path d="M12 2C6.48 2 2 6.48 2 12" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </span>
                Generating…
              </>
            ) : (
              <>
                <DownloadIcon />
                <PdfIcon />
                Download PDF
              </>
            )}
          </button>
        </div>

        {/* PLAN SELECTOR */}
        {patientPlans.length > 0 && (
          <div style={{ width: '100%', maxWidth: 820, marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 6 }}>Select Treatment Plan:</label>
            <Select 
              value={selectedPlanId} 
              onChange={val => setSelectedPlanId(val)}
              style={{ width: '100%', maxWidth: 400 }}
              disabled={loadingPlan}
            >
              {patientPlans.map(plan => (
                <Option key={plan.id} value={plan.id}>
                  {plan.title} - {formatDate(plan.started_at)}
                </Option>
              ))}
            </Select>
            {loadingPlan && <Spin size="small" style={{ marginLeft: 12 }} />}
          </div>
        )}


        {/* ── PAPER ── */}
        <div className="pd-paper" id="pd-paper-content">

          {/* ROW 1: Logo + Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3 }}>
            <img src={LogoRangka} alt="Rangka" style={{ width: 110, objectFit: 'contain', flexShrink: 0 }} />
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#111', lineHeight: 1.2 }}>
                Treatment Plan &amp; Progress Report
              </div>
            </div>
          </div>
          <div style={{ height: 1, background: '#111', margin: '3px 0 10px' }} />

          {/* ROW 2: 3 columns */}
          <div className="pd-three-col" style={{ display: 'flex', gap: 0, marginBottom: 10, alignItems: 'flex-start' }}>

            {/* Col 1 – Client's Data */}
            <div style={{ flex: '0 0 28%', paddingRight: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#111', marginBottom: 4 }}>Client's Data:</div>
              <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                <tbody>
                  <InfoRow label="Patient Name:" value={patient.name} />
                  <InfoRow label="Phone Number:" value={patient.phone_number || patient.phone} />
                  <InfoRow label="Email Address:" value={patient.email} />
                  <InfoRow label="Age:" value={
                    patient.date_of_birth
                      ? (calculateAge(patient.date_of_birth) >= 0
                          ? `${calculateAge(patient.date_of_birth)} years`
                          : null)
                      : null
                  } />
                  <InfoRow label="Height (cm):" value={patient.height} />
                  <InfoRow label="Weight (kg):" value={patient.weight} />
                </tbody>
              </table>
            </div>

            {/* Col 2 – Rangka Assessment */}
            <div style={{ flex: '0 0 47%', paddingRight: 12, paddingLeft: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#111', marginBottom: 4 }}>Rangka Assessment:</div>
              <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                <tbody>
                  <InfoRow label="Assessment Date:" value={formatDate(firstSession.appointment_date)} />
                  <InfoRow label="Assessment Therapist:" value={firstSession.user_name || firstSession.staff_name || '-'} />
                  <InfoRow label="Service Type:" value={firstSession.service_type} />
                  <InfoRow label="Injury Type:" value={firstSession.injury_type} />
                  <InfoRow label="Area Concern:" value={firstSession.area_concern} />
                  <InfoRow label="Diagnosis:" value={firstSession.diagnosis_result} />
                  <InfoRow label="Range of Motion Impact:" value={firstSession.range_of_motion_impact} />
                  <InfoRow label="Recovery Goals:" value={firstSession.recovery_goals} />
                  <InfoRow label="Expected Recovery Time:" value={firstSession.expected_recovery_time} />
                </tbody>
              </table>
            </div>

            {/* Col 3 – Mascot + Quote */}
            <div style={{ flex: '0 0 25%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingLeft: 8 }}>
              <img src={Mascot} alt="Rangka Mascot" style={{ width: '100%', maxWidth: 100, objectFit: 'contain' }} />
              <div style={{ marginTop: 6, fontSize: 8, fontStyle: 'italic', color: '#666', textAlign: 'center', lineHeight: 1.5 }}>
                Stay focused, stay strong.<br />We've Got Your Back!
              </div>
            </div>
          </div>

          {/* HORIZONTAL RULE */}
          <div style={{ height: 1, background: '#bbb', border: 'none', margin: '6px 0 12px' }} />

          {/* PROGRESS TABLE TITLE */}
          <div style={{ textAlign: 'center', marginBottom: 5 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#111' }}>The Progress Table</div>
            <div style={{ fontSize: 8, color: '#777', fontStyle: 'italic', marginTop: 1 }}>see how you progress over the week</div>
          </div>

          {/* LEGEND */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginBottom: 6, flexWrap: 'wrap' }}>
            <LegendItem color="#ff4d4f" label=": Treatment + Rest" />
            <LegendItem color="#ffc107" label=": Treatment + Exercise" />
            <LegendItem color="#4caf50" label=": Back to Sports Preparation" />
          </div>

          {/* TABLE */}
          {sessions.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#bbb', fontSize: 9, padding: 12 }}>No session records found.</p>
          ) : (
            <div style={{ width: '100%', marginBottom: 18, overflow: 'hidden' }}>
              <table
                className="pd-table"
                style={{ width: '100%', borderCollapse: 'collapse', fontSize: 8, tableLayout: 'fixed' }}
              >
                <colgroup>
                  {tableHeaders.map((h, i) => (
                    <col key={i} style={{ width: h.width }} />
                  ))}
                </colgroup>
                <thead>
                  <tr>
                    {tableHeaders.map((h, i) => (
                      <th key={i} style={{
                        border: '0.5px solid #ccc',
                        padding: '5px 3px',
                        fontSize: 8,
                        fontWeight: 700,
                        textAlign: 'center',
                        verticalAlign: 'middle',
                        color: '#111',
                        lineHeight: 1.3,
                        background: h.bg,
                        overflow: 'hidden',
                        wordBreak: 'break-word',
                      }}>
                        {h.label.split('\n').map((line, j) => (
                          <span key={j}>{line}{j === 0 ? <br /> : null}</span>
                        ))}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s, i) => (
                    <tr key={s.id || i}>
                      <td style={{ border: '0.5px solid #ddd', padding: '4px 3px', fontSize: 8, textAlign: 'center', fontWeight: 700, background: '#fafafa', verticalAlign: 'top', overflow: 'hidden' }}>{i + 1}</td>
                      <td style={{ border: '0.5px solid #ddd', padding: '4px 3px', fontSize: 8, textAlign: 'center', verticalAlign: 'top', color: '#333', overflow: 'hidden' }}>{formatDate(s.visit_date)}</td>
                      <td style={{ border: '0.5px solid #ddd', padding: '4px 3px', fontSize: 8, verticalAlign: 'top', color: '#333', wordBreak: 'break-word', overflow: 'hidden' }}>{s.user_name || s.staff_name || '-'}</td>
                      <td style={{ border: '0.5px solid #ddd', padding: '4px 3px', fontSize: 8, verticalAlign: 'top', color: '#333', wordBreak: 'break-word', overflow: 'hidden' }}>{s.treatment || '-'}</td>
                      <td style={{ border: '0.5px solid #ddd', padding: '4px 3px', fontSize: 8, verticalAlign: 'top', color: '#333', wordBreak: 'break-word', overflow: 'hidden' }}>{s.objective_progress || '-'}</td>
                      <td style={{ border: '0.5px solid #ddd', padding: '4px 3px', fontSize: 8, verticalAlign: 'top', color: '#333', wordBreak: 'break-word', overflow: 'hidden' }}>{s.exercise || '-'}</td>
                      <td style={{ border: '0.5px solid #ddd', padding: '4px 3px', fontSize: 8, verticalAlign: 'top', color: '#333', wordBreak: 'break-word', overflow: 'hidden' }}>{s.recovery_tips || '-'}</td>
                      <td style={{ border: '0.5px solid #ddd', padding: '4px 3px', fontSize: 8, textAlign: 'center', background: '#fffbee', verticalAlign: 'top', overflow: 'hidden' }}>
                        <PainBadge value={s.pain_before !== null && s.pain_before !== undefined ? s.pain_before.toString() : '-'} />
                      </td>
                      <td style={{ border: '0.5px solid #ddd', padding: '4px 3px', fontSize: 8, textAlign: 'center', background: '#f0fff4', verticalAlign: 'top', overflow: 'hidden' }}>
                        <PainBadge value={s.pain_after !== null && s.pain_after !== undefined ? s.pain_after.toString() : '-'} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* BODY ANNOTATION IMAGE (1 per Plan) */}
          {planDetail?.image_url && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#111', marginBottom: 6 }}>
                Body Pain Diagram:
              </div>
              <div style={{ textAlign: 'center' }}>
                <img
                  src={bodyImageBase64 || getProxiedImageUrl(planDetail.image_url)}
                  alt="Body annotation"
                  crossOrigin="anonymous"
                  style={{ maxWidth: 280, width: '100%', display: 'block', margin: '0 auto' }}
                />
              </div>
            </div>
          )}

        </div>{/* end paper */}
      </div>
    </>
  );
};

export default PatientDetail;
