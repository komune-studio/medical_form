import React, { useState, useEffect, useRef } from 'react';
import { useHistory, Link, Prompt } from 'react-router-dom';
import {
  Button,
  message,
  Spin,
  Typography,
  Form,
  Input,
  Select,
  Row,
  Col,
  Card,
  Space,
  Slider
} from 'antd';
import { Container } from 'reactstrap';
import swal from '../../reusable/CustomSweetAlert';
import TreatmentPlanModel from 'models/TreatmentPlanModel';
import TreatmentLogModel from 'models/TreatmentLogModel';
import PatientModel from 'models/PatientModel';
import StaffModel from 'models/StaffModel';
import UploadService from '../../../utils/Uploadservice';
import moment from 'moment';
import BodyAnnotation from './BodyAnnotation';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

function dataURLtoBlob(dataurl) {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

const TREATMENT_OPTIONS = [
  'Tens',
  'Ultrasound',
  'Shockwave',
  'Massage',
  'Leg Massage',
  'Ice'
];

const INJURY_TYPE_OPTIONS = [
  'Acute Injury',
  'Chronic Injury',
  'Overuse Injury',
  'Sports Injury',
  'Work-Related Injury',
  'Post-Surgery',
  'Other'
];

const getPainLevelColor = (value = 1) => {
  const safeValue = Math.min(Math.max(Number(value) || 1, 1), 10);
  const hue = 120 - ((safeValue - 1) / 9) * 120;
  return `hsl(${hue}, 72%, 45%)`;
};

const normalizePainLevel = (value) => {
  if (value === undefined || value === null || value === '') return 1;
  return Math.min(Math.max(Number(value) || 1, 1), 10);
};

const RECOVERY_DURATION_OPTIONS = Array.from({ length: 30 }, (_, index) => {
  const value = index + 1;
  return { value, label: String(value) };
});

const RECOVERY_UNIT_OPTIONS = [
  { value: 'days', label: 'Days' },
  { value: 'weeks', label: 'Weeks' },
  { value: 'months', label: 'Months' },
];

const parseExpectedRecoveryTime = (value = '') => {
  const match = String(value).trim().match(/^(\d+)\s+(days?|weeks?|months?)$/i);
  if (!match) {
    return { expected_recovery_value: undefined, expected_recovery_unit: undefined };
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();

  return {
    expected_recovery_value: amount >= 1 && amount <= 30 ? amount : undefined,
    expected_recovery_unit: unit.endsWith('s') ? unit : `${unit}s`,
  };
};

const normalizeName = (value = '') => String(value).trim().toLowerCase();

const getStaffUserId = (staff) => {
  if (!staff || typeof staff !== 'object') return undefined;

  const rawValue = staff.user_id ?? staff.user?.id ?? staff.user?.user_id ?? staff.id;
  if (rawValue === undefined || rawValue === null || rawValue === '') return undefined;

  const parsedValue = Number(rawValue);
  return Number.isNaN(parsedValue) ? rawValue : parsedValue;
};

const getTreatmentPlanUserId = (treatmentPlan = {}) => {
  const rawValue =
    treatmentPlan.user_id ??
    treatmentPlan.staff?.user_id ??
    treatmentPlan.staff?.user?.id;

  if (rawValue === undefined || rawValue === null || rawValue === '') return undefined;

  const parsedValue = Number(rawValue);
  return Number.isNaN(parsedValue) ? rawValue : parsedValue;
};

const customStyles = `
  .treatment-plan-select .ant-select-selector {
    background-color: #FFFFFF !important;
    border: 1px solid #d9d9d9 !important;
    color: #000000 !important;
    border-radius: 4px !important;
    min-height: 34px !important;
    height: auto !important;
    padding: 4px 11px !important;
    font-size: 14px !important;
  }
  
  .treatment-plan-select .ant-select-selection-placeholder {
    color: rgba(0, 0, 0, 0.4) !important;
    font-size: 14px !important;
  }
  
  .treatment-plan-select .ant-select-selection-item {
    color: #000000 !important;
    font-size: 14px !important;
  }
  
  .treatment-plan-select .ant-select-arrow {
    color: rgba(0, 0, 0, 0.25) !important;
  }
  
  .treatment-plan-select .ant-select-selector:hover {
    border-color: #666666 !important;
  }
  
  .treatment-plan-select.ant-select-focused .ant-select-selector {
    border-color: #000000 !important;
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1) !important;
  }
  
  .treatment-plan-select .ant-select-dropdown {
    background-color: #FFFFFF !important;
    border: 1px solid #d9d9d9 !important;
    border-radius: 4px !important;
    box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12), 
                0 6px 16px 0 rgba(0, 0, 0, 0.08), 
                0 9px 28px 8px rgba(0, 0, 0, 0.05) !important;
  }
  
  .treatment-plan-select .ant-select-item {
    color: #000000 !important;
    background-color: #FFFFFF !important;
    font-size: 14px !important;
    padding: 8px 12px !important;
    min-height: 36px !important;
  }
  
  .treatment-plan-select .ant-select-item:hover {
    background-color: #f5f5f5 !important;
  }
  
  .treatment-plan-select .ant-select-item-option-selected {
    background-color: #f5f5f5 !important;
    color: #000000 !important;
    font-weight: normal !important;
  }
  
  .treatment-plan-select .ant-select-item-option-active {
    background-color: #f5f5f5 !important;
  }
  
  .native-datetime-input {
    width: 100%;
    background-color: #FFFFFF !important;
    border: 1px solid #d9d9d9 !important;
    color: #000000 !important;
    border-radius: 4px !important;
    height: 34px !important;
    padding: 4px 11px !important;
    font-size: 14px !important;
    font-family: inherit;
    transition: all 0.3s;
  }
  
  .native-datetime-input:hover {
    border-color: #666666 !important;
  }
  
  .native-datetime-input:focus {
    border-color: #000000 !important;
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1) !important;
    outline: none;
  }
  
  .native-datetime-input:disabled {
    background-color: #fafafa !important;
    color: #666666 !important;
    cursor: not-allowed !important;
  }
  
  .pain-level-slider {
    margin: 8px 6px 0 !important;
  }

  .pain-level-slider .ant-slider-rail {
    background: linear-gradient(90deg, #2e7d32 0%, #fbc02d 50%, #c62828 100%) !important;
    height: 8px !important;
  }

  .pain-level-slider .ant-slider-track {
    background: transparent !important;
  }

  .pain-level-slider .ant-slider-handle::after {
    box-shadow: 0 0 0 2px currentColor !important;
  }

  .pain-level-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 6px;
  }

  .pain-level-badge {
    min-width: 48px;
    padding: 2px 10px;
    border-radius: 999px;
    color: #FFFFFF;
    font-size: 12px;
    font-weight: 700;
    line-height: 20px;
    text-align: center;
  }

  .pain-level-caption {
    margin-top: 8px;
    font-size: 12px;
    color: #666666;
  }
  
  .readonly-field .ant-input {
    background-color: #f5f5f5 !important;
    color: #8c8c8c !important;
    cursor: not-allowed !important;
  }
  
  /* Make all disabled inputs and selects consistently grey */
  .treatment-plan-textarea .ant-input[disabled],
  .treatment-plan-select.ant-select-disabled .ant-select-selector {
    background-color: #f5f5f5 !important;
    color: #8c8c8c !important;
    border-color: #d9d9d9 !important;
    cursor: not-allowed !important;
    opacity: 1 !important;
  }

  .treatment-plan-select.ant-select-disabled .ant-select-selection-item,
  .treatment-plan-textarea .ant-input[disabled] {
    color: #8c8c8c !important;
  }
  
  /* Nicer Multiple Select Tags styling */
  .treatment-plan-select .ant-select-selection-overflow-item .ant-select-selection-item {
    background-color: #f0f5ff !important;
    border: 1px solid #adc6ff !important;
    border-radius: 4px !important;
    color: #2f54eb !important;
    font-weight: 500 !important;
    padding: 0 8px !important;
    line-height: 24px !important;
    height: 26px !important;
    margin-top: 3px !important;
    margin-bottom: 3px !important;
    display: flex !important;
    align-items: center !important;
  }

  .treatment-plan-select .ant-select-selection-overflow-item .ant-select-selection-item-remove {
    color: #85a5ff !important;
    display: inline-flex !important;
    align-items: center !important;
  }

  .treatment-plan-select .ant-select-selection-overflow-item .ant-select-selection-item-remove:hover {
    color: #2f54eb !important;
  }
  
  .treatment-plan-textarea .ant-input {
    min-height: 80px !important;
    resize: vertical !important;
    background-color: #FFFFFF !important;
    border: 1px solid #d9d9d9 !important;
    color: #000000 !important;
    border-radius: 4px !important;
    padding: 8px 12px !important;
    font-size: 14px !important;
  }
  
  .treatment-plan-textarea .ant-input::placeholder {
    color: rgba(0, 0, 0, 0.4) !important;
  }
  
  .patient-select .ant-select-selector {
    height: 40px !important;
  }
  
  @media (min-width: 768px) and (max-width: 1024px) {
    .treatment-plan-form-item {
      margin-bottom: 14px !important;
    }
    
    .treatment-plan-select .ant-select-selector {
      min-height: 40px !important;
      height: auto !important;
      font-size: 16px !important;
      padding: 8px 12px !important;
    }
    
    .treatment-plan-select .ant-select-selection-placeholder {
      font-size: 16px !important;
      line-height: 24px !important;
    }
    
    .treatment-plan-select .ant-select-selection-item {
      font-size: 16px !important;
      line-height: 24px !important;
    }
    
    .treatment-plan-select .ant-select-item {
      font-size: 16px !important;
      padding: 10px 12px !important;
      min-height: 44px !important;
    }
    
    .native-datetime-input {
      height: 40px !important;
      font-size: 16px !important;
    }
    
    .pain-level-slider {
      margin-top: 12px !important;
    }

    .pain-level-badge {
      font-size: 13px;
    }
    
    .treatment-plan-textarea .ant-input {
      min-height: 100px !important;
      font-size: 16px !important;
    }
  }
`;

export default function TreatmentPlanFormPage({
  treatmentPlanData,
  disabled,
  isStandalone = false,
  onSubmitSuccess,
}) {
  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [form] = Form.useForm();
  const [formDisabled, setFormDisabled] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [patientPlans, setPatientPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState('new');
  const [appointmentDateTime, setAppointmentDateTime] = useState('');
  const [nextSessionDate, setNextSessionDate] = useState(''); // ← STATE BARU

  const [staffList, setStaffList] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [currentLoginName, setCurrentLoginName] = useState('');

  const bodyAnnotationRef = useRef(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const painBeforeValue = Form.useWatch('pain_before', form) ?? 1;
  const painAfterValue = Form.useWatch('pain_after', form) ?? 1;

  useEffect(() => {
    const storedName = localStorage.getItem('admin_name') || sessionStorage.getItem('admin_name') || '';
    setCurrentLoginName(storedName);
  }, []);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setStaffLoading(true);
        const response = await StaffModel.getActiveStaff();
        const activeStaff = Array.isArray(response?.data) ? response.data : [];
        let resolvedStaffList = activeStaff;

        if (!treatmentPlanData && currentLoginName) {
          let matchedStaff = activeStaff.find(
            (staff) => normalizeName(staff.name) === normalizeName(currentLoginName)
          );

          if (!matchedStaff) {
            const staffByName = await StaffModel.getStaffByName(currentLoginName);
            matchedStaff = staffByName?.data || null;
          }

          // If still no matched staff, they might be a regular user
          if (!matchedStaff) {
            const loggedInUserId = localStorage.getItem('user_id') || sessionStorage.getItem('id');
            if (loggedInUserId) {
              matchedStaff = {
                id: `user-${loggedInUserId}`,
                user_id: parseInt(loggedInUserId) || loggedInUserId,
                name: currentLoginName,
                phone_number: 'User'
              };
            }
          }

          if (matchedStaff) {
            if (!activeStaff.some((staff) => staff.id === matchedStaff.id)) {
              resolvedStaffList = [...activeStaff, matchedStaff];
            }
            form.setFieldsValue({ user_id: getStaffUserId(matchedStaff) });
          }
        }

        if (treatmentPlanData?.staff_id && !resolvedStaffList.some((staff) => staff.id === treatmentPlanData.staff_id)) {
          const existingStaff = await StaffModel.getStaffById(treatmentPlanData.staff_id);
          if (existingStaff?.data) {
            resolvedStaffList = [...resolvedStaffList, existingStaff.data];
            form.setFieldsValue({ user_id: getStaffUserId(existingStaff.data) });
          }
        } else if (treatmentPlanData) {
          const currentUserId = getTreatmentPlanUserId(treatmentPlanData);
          if (currentUserId !== undefined) {
            form.setFieldsValue({ user_id: currentUserId });
          }
        }
        setStaffList(resolvedStaffList);
      } catch (error) {
        console.error("Error fetching staff:", error);
        message.error('Failed to load staff list');
      } finally {
        setStaffLoading(false);
      }
    };
    fetchStaff();
  }, [currentLoginName, form, treatmentPlanData]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setPatientsLoading(true);
        const response = await PatientModel.getAllPatients();
        if (response && response.http_code === 200) {
          setPatients(Array.isArray(response.data) ? response.data : []);
        }
      } catch (error) {
        console.error("Error fetching patients:", error);
        message.error('Failed to load patients');
      } finally {
        setPatientsLoading(false);
      }
    };
    fetchPatients();
  }, []);

  useEffect(() => {
    if (treatmentPlanData) {
      let dateTimeValue = '';
      if (treatmentPlanData.appointment_date) {
        const momentDate = moment(treatmentPlanData.appointment_date);
        dateTimeValue = momentDate.format('YYYY-MM-DDTHH:mm');
        setAppointmentDateTime(dateTimeValue);
      }

      // ← Parse recommended_next_session ke format YYYY-MM-DD untuk input[type=date]
      let nextSession = '';
      if (treatmentPlanData.recommended_next_session) {
        const d = moment(treatmentPlanData.recommended_next_session);
        nextSession = d.isValid() ? d.format('YYYY-MM-DD') : '';
      }
      setNextSessionDate(nextSession);
      const recoveryTimeValues = parseExpectedRecoveryTime(treatmentPlanData.expected_recovery_time);

      const formValues = {
        patient_id: treatmentPlanData.patient_id,
        user_id: getTreatmentPlanUserId(treatmentPlanData),
        service_type: treatmentPlanData.service_type || '',
        injury_type: treatmentPlanData.injury_type || '',
        area_concern: treatmentPlanData.area_concern || '',
        diagnosis_result: treatmentPlanData.diagnosis_result || '',
        ...recoveryTimeValues,
        recovery_goals: treatmentPlanData.recovery_goals || '',
        objective_progress: treatmentPlanData.objective_progress || '',
        pain_before: normalizePainLevel(treatmentPlanData.pain_before),
        pain_after: normalizePainLevel(treatmentPlanData.pain_after),
        range_of_motion_impact: treatmentPlanData.range_of_motion_impact || '',
        treatments: treatmentPlanData.treatments
          ? treatmentPlanData.treatments.split(',').map(t => t.trim()).filter(Boolean)
          : [],
        exercise: treatmentPlanData.exercise || '',
        homework: treatmentPlanData.homework || '',
        recovery_tips: treatmentPlanData.recovery_tips || '',
        body_annotation: treatmentPlanData.body_annotation || '',
      };

      form.setFieldsValue(formValues);
      setHasChanges(false);
    } else {
      form.resetFields();
      form.setFieldsValue({
        pain_before: 1,
        pain_after: 1,
        expected_recovery_value: undefined,
        expected_recovery_unit: undefined,
      });
      setAppointmentDateTime('');
      setNextSessionDate(''); // ← reset
      setHasChanges(false);
    }

    if (disabled) {
      setFormDisabled(disabled);
    }
  }, [treatmentPlanData, form, disabled, formKey]);

  const onValuesChanged = (changedValues, allValues) => {
    if (!treatmentPlanData) {
      const changed = Object.keys(allValues).some(key => {
        const value = allValues[key];
        if (value && value.toString().trim() !== '') return true;
        return false;
      }) || appointmentDateTime !== '' || nextSessionDate !== '';
      setHasChanges(changed);
      return;
    }

    const changed = Object.keys(allValues).some(key => {
      const currentValue = allValues[key];
      const originalValue =
        key === 'user_id'
          ? (getTreatmentPlanUserId(treatmentPlanData) ?? treatmentPlanData.staff_id)
          : treatmentPlanData[key];

      if (key === 'expected_recovery_value' || key === 'expected_recovery_unit') {
        const originalRecoveryTime = parseExpectedRecoveryTime(treatmentPlanData.expected_recovery_time);
        return currentValue !== originalRecoveryTime[key];
      }

      if (Array.isArray(currentValue) || Array.isArray(originalValue)) {
        return JSON.stringify(currentValue) !== JSON.stringify(originalValue);
      }
      return currentValue !== originalValue;
    });

    setHasChanges(changed || appointmentDateTime !== '' || nextSessionDate !== '');
  };

  
  const fetchPatientPlans = async (patientId) => {
    try {
      const response = await TreatmentPlanModel.getAll({ patient_id: patientId });
      setPatientPlans(response?.data || []);
    } catch (err) {
      console.error('Failed to fetch patient plans', err);
      setPatientPlans([]);
    }
  };

  const handlePatientChange = (patientId) => {
    form.setFieldsValue({ patient_id: patientId });
    setSelectedPlanId('new');
    fetchPatientPlans(patientId);
    setHasChanges(true);
  };

  const handlePlanChange = (planId) => {
    setSelectedPlanId(planId);
    if (planId !== 'new') {
      const plan = patientPlans.find(p => p.id === planId);
      if (plan) {
        const recoveryTimeValues = parseExpectedRecoveryTime(plan.expected_recovery_time);
        form.setFieldsValue({
          service_type: plan.service_type || '',
          injury_type: plan.injury_type || '',
          area_concern: plan.area_concern || '',
          diagnosis_result: plan.diagnosis_result || plan.diagnosis || '',
          ...recoveryTimeValues,
          recovery_goals: plan.recovery_goals || '',
          range_of_motion_impact: plan.range_of_motion_impact || '',
          // Assuming body annotation is bound via ref, we'll try to set it if possible
        });
        if (bodyAnnotationRef.current && plan.image_url) {
           bodyAnnotationRef.current.setUploadedImageUrl(plan.image_url);
        }
      }
    } else {
      // Clear plan fields
      form.setFieldsValue({
        title: '',
        service_type: '',
        injury_type: '',
        area_concern: '',
        diagnosis_result: '',
        recovery_goals: '',
        range_of_motion_impact: '',
      });
      if (bodyAnnotationRef.current) {
         if (typeof bodyAnnotationRef.current.resetToDefault === 'function') {
           bodyAnnotationRef.current.resetToDefault();
         } else {
           bodyAnnotationRef.current.clearAnnotations();
         }
      }
    }
    setHasChanges(true);
  };

  const handleDateTimeChange = (e) => {
    setAppointmentDateTime(e.target.value);
    setHasChanges(true);
  };

  const handleNextSessionChange = (e) => {
    setNextSessionDate(e.target.value);
    setHasChanges(true);
  };

  const onSubmit = async () => {
    setLoadingSubmit(true);

    try {
      if (!appointmentDateTime) {
        throw new Error('Appointment date and time is required');
      }

      await form.validateFields();

      let body = form.getFieldsValue();
      body.expected_recovery_time =
        body.expected_recovery_value && body.expected_recovery_unit
          ? `${body.expected_recovery_value} ${body.expected_recovery_unit}`
          : '';
      delete body.expected_recovery_value;
      delete body.expected_recovery_unit;

      // ─── UPLOAD LOGIC ────────────────────────────────────────────────
      if (bodyAnnotationRef.current) {
        const ref = bodyAnnotationRef.current;

        const needsUpload = typeof ref.needsUpload === 'function'
          ? ref.needsUpload()
          : (ref.hasLocalFile() || ref.hasAnnotations());

        if (needsUpload) {
          try {
            setUploadingImage(true);
            message.loading({ content: 'Processing anatomy image...', key: 'uploadImage', duration: 0 });

            let fileToUpload;
            const hasAnnotations = ref.hasAnnotations();
            const hasLocalFile = ref.hasLocalFile();

            if (hasAnnotations) {
              const imageDataUrl = ref.exportAsImage();
              if (imageDataUrl) {
                const blob = dataURLtoBlob(imageDataUrl);
                const fileName = hasLocalFile ? ref.getLocalFile().name : 'body-annotation.jpg';
                fileToUpload = new File([blob], fileName, { type: 'image/jpeg' });
              }
            } else if (hasLocalFile) {
              fileToUpload = ref.getLocalFile();
            }

            if (fileToUpload) {
              console.log('Uploading image:', fileToUpload.name);
              const uploadedUrl = await UploadService.uploadAnatomyImage(fileToUpload);
              console.log('Uploaded:', uploadedUrl);
              message.success({ content: 'Image uploaded!', key: 'uploadImage', duration: 2 });
              ref.setUploadedImageUrl(uploadedUrl);
              body.body_annotation = uploadedUrl;
            }
          } catch (uploadError) {
            message.error({ content: 'Failed to upload image', key: 'uploadImage' });
            throw new Error('Image upload failed: ' + uploadError.message);
          } finally {
            setUploadingImage(false);
          }
        } else {
          if (body.body_annotation) {
            try {
              const parsed = JSON.parse(body.body_annotation);
              body.body_annotation = parsed.imageUrl || body.body_annotation;
            } catch (e) {
              // sudah plain URL string, biarkan apa adanya
            }
          } else {
            body.body_annotation = null;
          }
        }
      }
      // ─────────────────────────────────────────────────────────────────

      const appointmentMoment = moment(appointmentDateTime);
      if (!appointmentMoment.isValid()) {
        throw new Error('Invalid appointment date and time');
      }
      body.appointment_date = appointmentMoment.toISOString();

      if (body.user_id !== undefined && body.user_id !== null && body.user_id !== '') {
        body.user_id = parseInt(body.user_id);
      } else {
        body.user_id = null;
      }

      if (body.pain_before !== undefined) {
        body.pain_before = body.pain_before ? parseInt(body.pain_before) : null;
      }
      if (body.pain_after !== undefined) {
        body.pain_after = body.pain_after ? parseInt(body.pain_after) : null;
      }

      // Convert treatments array to comma-separated string
      if (Array.isArray(body.treatments)) {
        body.treatments = body.treatments.join(', ');
      }

      // ← recommended_next_session: kirim YYYY-MM-DD atau null
      if (nextSessionDate) {
        const d = moment(nextSessionDate, 'YYYY-MM-DD', true);
        body.recommended_next_session = d.isValid() ? d.format('YYYY-MM-DD') : null;
      } else {
        body.recommended_next_session = null;
      }

      Object.keys(body).forEach(key => {
        if (body[key] === '') body[key] = null;
      });

      console.log('Data to be saved:', body);

      let result;
      let msg;

      if (!treatmentPlanData) {
        if (selectedPlanId === 'new') {
          // Create Plan first
          const planData = {
            patient_id: body.patient_id,
            user_id: body.user_id,
            title: body.title || `${body.service_type || 'Treatment'} for ${body.injury_type || body.area_concern || 'Patient'}`,
            service_type: body.service_type,
            injury_type: body.injury_type,
            area_concern: body.area_concern,
            diagnosis_result: body.diagnosis_result,
            expected_recovery_time: body.expected_recovery_time,
            recovery_goals: body.recovery_goals,
            image_url: body.body_annotation,
            status: 'ACTIVE',
            started_at: body.appointment_date || new Date().toISOString()
          };
          const planResult = await TreatmentPlanModel.create(planData);
          if (planResult && planResult.http_code === 200 && planResult.data) {
             const newPlanId = planResult.data.id;
             // Now create log
             const logData = {
                ...body,
                treatment_plan_id: newPlanId,
                visit_date: body.appointment_date,
                treatment: body.treatments,
             };
             result = await TreatmentLogModel.create(logData);
             msg = 'Successfully created new Treatment Plan and Log';
          } else {
             throw new Error(planResult?.error_message || "Failed to create treatment plan");
          }
        } else {
          // Create Log for existing plan
          const logData = {
             ...body,
             treatment_plan_id: selectedPlanId,
             visit_date: body.appointment_date,
             treatment: body.treatments,
          };
          result = await TreatmentLogModel.create(logData);
          msg = 'Successfully added new Visit Log';
        }
      } else {
        // Update is not fully supported in this unified form anymore since it's split.
        // We might need to update the Plan OR the Log depending on the context.
        // Assuming we update the Plan for now.
        msg = 'Successfully updated Treatment Plan';
        result = await TreatmentPlanModel.update(treatmentPlanData.id, body);
      }

      if (result && result.http_code === 200) {
        message.success(msg);

        if (isStandalone && onSubmitSuccess) {
          form.resetFields();
          setAppointmentDateTime('');
          setNextSessionDate(''); // ← reset
          setHasChanges(false);
          setFormKey(prev => prev + 1);
          setTimeout(() => { onSubmitSuccess(); }, 300);
        } else {
          history.push("/treatment-plan");
        }
      } else {
        const errorMsg = result?.error_message || "Failed to save medical history";
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error("Error saving medical history:", error);
      let errorMessage = "An error occurred while saving medical history";
      if (error.errorFields) {
        errorMessage = "Please check the form for errors";
      } else if (error.message) {
        errorMessage = error.message;
      }

      await swal.fire({
        title: 'Error',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'Okay'
      });
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleDelete = async () => {
    try {
      if (!treatmentPlanData || !treatmentPlanData.id) return;

      await swal.fire({
        title: 'Delete Medical History',
        text: 'Are you sure you want to delete this medical history record? This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#d33'
      }).then(async (result) => {
        if (result.isConfirmed) {
          setLoading(true);
          const deleteResult = await TreatmentPlanModel.deletePlan(treatmentPlanData.id);
          if (deleteResult && deleteResult.http_code === 200) {
            message.success('Medical history deleted successfully');
            history.push("/treatment-plan");
          } else {
            throw new Error(deleteResult?.error_message || 'Failed to delete medical history');
          }
        }
      });
    } catch (error) {
      console.error("Error deleting medical history:", error);
      await swal.fire({
        title: 'Error',
        text: error.message || 'Failed to delete medical history',
        icon: 'error',
        confirmButtonText: 'Okay'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: '#f7f8fa',
      minHeight: '100vh',
      paddingTop: isStandalone ? '24px' : '80px',
      paddingBottom: '40px'
    }}>
      <style>{customStyles}</style>

      <Container>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <Spin size="large" tip="Loading..." />
          </div>
        ) : (
          <Row justify="center">
            <Col xs={24} sm={24} md={22} lg={20} xl={18}>
              <Card
                bordered={false}
                style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}
                title={
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <Title level={4} style={{ margin: 0, color: '#000000', fontWeight: 700, fontSize: '20px' }}>
                      {!treatmentPlanData ? "New Medical History" : "Medical History Details"}
                    </Title>
                    {!isStandalone && (
                      <Button
                        onClick={() => history.push("/treatment-plan")}
                        style={{ height: '32px', padding: '0 16px', borderRadius: '4px', fontSize: '13px', borderColor: '#d9d9d9' }}
                      >
                        ← Back to List
                      </Button>
                    )}
                  </div>
                }
                headStyle={{ borderBottom: '1px solid #e0e0e0', backgroundColor: '#FFFFFF', padding: '16px' }}
                bodyStyle={{ padding: 20 }}
              >
                <Form
                  form={form}
                  onFinish={onSubmit}
                  onValuesChange={onValuesChanged}
                  validateTrigger="onSubmit"
                  disabled={formDisabled}
                  autoComplete='off'
                  key={formKey}
                  layout="vertical"
                  requiredMark={false}
                  initialValues={{
                    pain_before: 1,
                    pain_after: 1,
                  }}
                >
                  <Row gutter={[32, 0]}>
                    <Col xs={24}>

                      {/* Patient */}
                      <Form.Item
                        label={<span style={{ color: '#000000', fontWeight: 600, fontSize: '14px' }}>Patient</span>}
                        name="patient_id"
                        rules={[{ required: true, message: 'Patient selection is required!' }]}
                        style={{ marginBottom: '10px' }}
                        className="treatment-plan-form-item"
                      >
                        <Select
                          className="treatment-plan-select patient-select"
                          placeholder="Select patient"
                          loading={patientsLoading}
                          onChange={handlePatientChange}
                          showSearch
                          optionFilterProp="children"
                          filterOption={(input, option) => {
                            const childStr = Array.isArray(option.children) ? option.children.join('') : String(option.children || '');
                            return childStr.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                          }}
                        >
                          {patients.map(patient => (
                            <Option key={patient.id} value={patient.id}>
                              {patient.name} ({patient.patient_code})
                            </Option>
                          ))}
                        </Select>
                      
                      </Form.Item>

                      {/* Treatment Plan Dropdown */}
                      <Form.Item
                        label={<span style={{ color: '#000000', fontWeight: 600, fontSize: '14px' }}>Treatment Plan</span>}
                        style={{ marginBottom: '10px' }}
                      >
                        <Select
                          className="medical-history-select"
                          value={selectedPlanId}
                          onChange={handlePlanChange}
                          disabled={formDisabled}
                        >
                          <Option value="new">+ Create New Plan</Option>
                          {patientPlans.map(plan => (
                            <Option key={plan.id} value={plan.id}>
                              {plan.title || `Plan #${plan.id}`} - {plan.service_type}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <div style={{ marginTop: '20px', marginBottom: '12px', paddingTop: '16px', borderTop: '1px solid #eaeaea' }}>
                        <Title level={5} style={{ margin: 0, color: '#000000', fontWeight: 700 }}>
                          Treatment Plan
                        </Title>
                        <Text style={{ color: '#666666', fontSize: '13px' }}>
                          Bagian ini jadi referensi plan utama dan akan terkunci saat pakai plan yang sudah ada.
                        </Text>
                      </div>

                      <Form.Item
                        label={<span style={{ color: '#000000', fontWeight: 600, fontSize: '14px' }}>Plan Name / Title</span>}
                        name="title"
                        rules={[{ required: selectedPlanId === 'new', message: 'Plan Name is required!' }]}
                        style={{ marginBottom: '10px' }}
                        hidden={selectedPlanId !== 'new'}
                      >
                        <Input
                          placeholder="e.g., Post-Surgery Recovery Plan"
                          style={{ backgroundColor: '#FFFFFF', border: '1px solid #d9d9d9', color: '#000000', borderRadius: '4px', height: '34px', padding: '4px 11px', fontSize: '14px' }}
                          disabled={formDisabled}
                        />
                      </Form.Item>

                      <Row gutter={16}>
                        <Col xs={24} md={12}>
                          <Form.Item
                            label={<span style={{ color: '#000000', fontWeight: 600, fontSize: '14px' }}>Service Type</span>}
                            name="service_type"
                            rules={[{ required: selectedPlanId === 'new', message: 'Service type is required!' }]}
                            style={{ marginBottom: '10px' }}
                          >
                            <Select className="treatment-plan-select" placeholder="Select service type" disabled={formDisabled || selectedPlanId !== 'new'}>
                              <Option value="Physiotherapy">Physiotherapy</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12} style={{ display: 'none' }}>
                          <Form.Item
                            name="user_id"
                            style={{ marginBottom: '10px' }}
                          >
                            <Select className="treatment-plan-select" disabled>
                              {staffList.map(staff => (
                                <Option key={staff.id} value={getStaffUserId(staff)}>
                                  {staff.name}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col xs={24} md={12}>
                          <Form.Item
                            label={<span style={{ color: '#000000', fontWeight: 600, fontSize: '14px' }}>Injury Type</span>}
                            name="injury_type"
                            style={{ marginBottom: '10px' }}
                          >
                            <Select className="treatment-plan-select" placeholder="Select injury type" allowClear disabled={formDisabled || selectedPlanId !== 'new'}>
                              {INJURY_TYPE_OPTIONS.map(type => (
                                <Option key={type} value={type}>{type}</Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item
                            label={<span style={{ color: '#000000', fontWeight: 600, fontSize: '14px' }}>Area of Concern</span>}
                            name="area_concern"
                            rules={[{ max: 255, message: 'Max 255 characters!' }]}
                            style={{ marginBottom: '10px' }}
                          >
                            <Input
                              placeholder="e.g., Lower back, Right shoulder"
                              style={{ backgroundColor: '#FFFFFF', border: '1px solid #d9d9d9', color: '#000000', borderRadius: '4px', height: '34px', padding: '4px 11px', fontSize: '14px' }}
                              disabled={formDisabled || selectedPlanId !== 'new'}
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Form.Item
                        label={<span style={{ color: '#000000', fontWeight: 600, fontSize: '14px' }}>Diagnosis Result</span>}
                        name="diagnosis_result"
                        rules={[{ max: 1000, message: 'Max 1000 characters!' }]}
                        style={{ marginBottom: '10px' }}
                      >
                        <TextArea placeholder="Enter diagnosis result" className="treatment-plan-textarea" rows={3} disabled={formDisabled || selectedPlanId !== 'new'} />
                      </Form.Item>

                      <Form.Item
                        label={<span style={{ color: '#000000', fontWeight: 600, fontSize: '14px' }}>Expected Recovery Time</span>}
                        style={{ marginBottom: '10px' }}
                      >
                        <Row gutter={12}>
                          <Col xs={24} md={12}>
                            <Form.Item
                              name="expected_recovery_value"
                              style={{ marginBottom: 0 }}
                            >
                              <Select
                                className="treatment-plan-select"
                                placeholder="Select number"
                                allowClear
                                disabled={formDisabled || selectedPlanId !== 'new'}
                              >
                                {RECOVERY_DURATION_OPTIONS.map((option) => (
                                  <Option key={option.value} value={option.value}>
                                    {option.label}
                                  </Option>
                                ))}
                              </Select>
                            </Form.Item>
                          </Col>
                          <Col xs={24} md={12}>
                            <Form.Item
                              name="expected_recovery_unit"
                              style={{ marginBottom: 0 }}
                            >
                              <Select
                                className="treatment-plan-select"
                                placeholder="Select unit"
                                allowClear
                                disabled={formDisabled || selectedPlanId !== 'new'}
                              >
                                {RECOVERY_UNIT_OPTIONS.map((option) => (
                                  <Option key={option.value} value={option.value}>
                                    {option.label}
                                  </Option>
                                ))}
                              </Select>
                            </Form.Item>
                          </Col>
                        </Row>
                      </Form.Item>

                      <Form.Item
                        label={<span style={{ color: '#000000', fontWeight: 600, fontSize: '14px' }}>Recovery Goals</span>}
                        name="recovery_goals"
                        style={{ marginBottom: '10px' }}
                      >
                        <TextArea placeholder="Enter specific recovery goals and milestones" className="treatment-plan-textarea" rows={3} disabled={formDisabled || selectedPlanId !== 'new'} />
                      </Form.Item>

                      <Form.Item
                        label={<span style={{ color: '#000000', fontWeight: 600, fontSize: '14px' }}>Range of Motion Impact</span>}
                        name="range_of_motion_impact"
                        style={{ marginBottom: '10px' }}
                      >
                        <TextArea placeholder="Describe range of motion limitations or improvements" className="treatment-plan-textarea" rows={2} disabled={formDisabled || selectedPlanId !== 'new'} />
                      </Form.Item>

                      {/* ── Recommended Next Session — DATE PICKER ── */}
                      <Form.Item
                        label={<span style={{ color: '#000000', fontWeight: 600, fontSize: '14px' }}>Body Pain Diagram</span>}
                        name="body_annotation"
                        style={{ marginBottom: '10px' }}
                      >
                        <BodyAnnotation ref={bodyAnnotationRef} disabled={formDisabled || selectedPlanId !== 'new'} />
                      </Form.Item>

                      <div style={{ marginTop: '28px', marginBottom: '12px', paddingTop: '16px', borderTop: '1px solid #eaeaea' }}>
                        <Title level={5} style={{ margin: 0, color: '#000000', fontWeight: 700 }}>
                          Visit Log
                        </Title>
                        <Text style={{ color: '#666666', fontSize: '13px' }}>
                          Isi update sesi harian di bawah ini. Bagian ini tetap aktif walau treatment plan sudah dipilih.
                        </Text>
                      </div>

                      {/* Appointment Date & Time */}
                      <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#000000', fontWeight: 600, fontSize: '14px' }}>
                          Appointment Date & Time <span style={{ color: '#ff4d4f' }}>*</span>
                        </label>
                        <input
                          type="datetime-local"
                          className="native-datetime-input"
                          value={appointmentDateTime}
                          onChange={handleDateTimeChange}
                          disabled={formDisabled}
                          required
                        />
                      </div>

                      <Form.Item
                        label={<span style={{ color: '#000000', fontWeight: 600, fontSize: '14px' }}>Objective Progress</span>}
                        name="objective_progress"
                        style={{ marginBottom: '10px' }}
                      >
                        <TextArea placeholder="Describe objective measurable progress" className="treatment-plan-textarea" rows={3} />
                      </Form.Item>

                      <Row gutter={16}>
                        <Col xs={24} md={12}>
                          <Form.Item
                            label={
                              <div className="pain-level-header">
                                <span style={{ color: '#000000', fontWeight: 600, fontSize: '14px' }}>Pain Level (Before)</span>
                                <span
                                  className="pain-level-badge"
                                  style={{ backgroundColor: getPainLevelColor(painBeforeValue) }}
                                >
                                  {painBeforeValue}/10
                                </span>
                              </div>
                            }
                            name="pain_before"
                            rules={[{ type: 'number', min: 1, max: 10, message: 'Pain level must be between 1 and 10!' }]}
                            style={{ marginBottom: '10px' }}
                            className="pain-level-input"
                          >
                            <Slider
                              min={1}
                              max={10}
                              step={1}
                              className="pain-level-slider"
                              tooltip={{ formatter: null }}
                              marks={{ 1: '1', 10: '10' }}
                              railStyle={{ background: 'linear-gradient(90deg, #2e7d32 0%, #fbc02d 50%, #c62828 100%)', height: 8 }}
                              trackStyle={{ background: 'transparent' }}
                              handleStyle={{
                                borderColor: getPainLevelColor(painBeforeValue),
                                backgroundColor: getPainLevelColor(painBeforeValue),
                                color: getPainLevelColor(painBeforeValue)
                              }}
                            />
                          </Form.Item>
                          <div className="pain-level-caption">
                            Drag to set pain score from 1 to 10.
                          </div>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item
                            label={
                              <div className="pain-level-header">
                                <span style={{ color: '#000000', fontWeight: 600, fontSize: '14px' }}>Pain Level (After)</span>
                                <span
                                  className="pain-level-badge"
                                  style={{ backgroundColor: getPainLevelColor(painAfterValue) }}
                                >
                                  {painAfterValue}/10
                                </span>
                              </div>
                            }
                            name="pain_after"
                            rules={[{ type: 'number', min: 1, max: 10, message: 'Pain level must be between 1 and 10!' }]}
                            style={{ marginBottom: '10px' }}
                            className="pain-level-input"
                          >
                            <Slider
                              min={1}
                              max={10}
                              step={1}
                              className="pain-level-slider"
                              tooltip={{ formatter: null }}
                              marks={{ 1: '1', 10: '10' }}
                              railStyle={{ background: 'linear-gradient(90deg, #2e7d32 0%, #fbc02d 50%, #c62828 100%)', height: 8 }}
                              trackStyle={{ background: 'transparent' }}
                              handleStyle={{
                                borderColor: getPainLevelColor(painAfterValue),
                                backgroundColor: getPainLevelColor(painAfterValue),
                                color: getPainLevelColor(painAfterValue)
                              }}
                            />
                          </Form.Item>
                          <div className="pain-level-caption">
                            Drag to set pain score from 1 to 10.
                          </div>
                        </Col>
                      </Row>

                      <Form.Item
                        label={<span style={{ color: '#000000', fontWeight: 600, fontSize: '14px' }}>Treatments</span>}
                        name="treatments"
                        style={{ marginBottom: '10px' }}
                      >
                        <Select className="treatment-plan-select" placeholder="Select treatment" mode="multiple" allowClear>
                          {TREATMENT_OPTIONS.map(treatment => (
                            <Option key={treatment} value={treatment}>{treatment}</Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <Form.Item
                        label={<span style={{ color: '#000000', fontWeight: 600, fontSize: '14px' }}>Exercise</span>}
                        name="exercise"
                        rules={[{ max: 500, message: 'Max 500 characters!' }]}
                        style={{ marginBottom: '10px' }}
                      >
                        <TextArea placeholder="Enter recommended exercises" className="treatment-plan-textarea" rows={2} />
                      </Form.Item>

                      <Form.Item
                        label={<span style={{ color: '#000000', fontWeight: 600, fontSize: '14px' }}>Homework</span>}
                        name="homework"
                        rules={[{ max: 500, message: 'Max 500 characters!' }]}
                        style={{ marginBottom: '10px' }}
                      >
                        <TextArea placeholder="Enter homework assignments" className="treatment-plan-textarea" rows={2} />
                      </Form.Item>

                      <Form.Item
                        label={<span style={{ color: '#000000', fontWeight: 600, fontSize: '14px' }}>Recovery Tips</span>}
                        name="recovery_tips"
                        style={{ marginBottom: '10px' }}
                      >
                        <TextArea placeholder="Enter recovery tips and recommendations" className="treatment-plan-textarea" rows={2} />
                      </Form.Item>

                      <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#000000', fontWeight: 600, fontSize: '14px' }}>
                          Recommended Next Session
                        </label>
                        <input
                          type="date"
                          className="native-datetime-input"
                          value={nextSessionDate}
                          onChange={handleNextSessionChange}
                          disabled={formDisabled}
                        />
                      </div>

                    </Col>
                  </Row>

                  {/* Action Buttons */}
                  <Row style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #e0e0e0' }}>
                    <Col span={24}>
                      {!formDisabled ? (
                        <Row align="middle" justify="space-between">
                          <Col>
                            {isStandalone && (
                              <Text style={{ fontSize: '12px', color: '#999999', fontStyle: 'italic' }}>
                                Form resets after submission
                              </Text>
                            )}
                          </Col>
                          <Col>
                            <Space size={8}>
                              <Button
                                htmlType='submit'
                                loading={loadingSubmit || uploadingImage}
                                style={{ backgroundColor: '#000000', borderColor: '#000000', color: '#FFFFFF', fontWeight: 600, height: '36px', padding: '0 24px', borderRadius: '4px', fontSize: '14px' }}
                              >
                                {!treatmentPlanData ? "Add Record" : "Save"}
                              </Button>

                              {treatmentPlanData && (
                                <Button
                                  onClick={handleDelete}
                                  style={{ backgroundColor: '#d93025', borderColor: '#d93025', color: '#FFFFFF', height: '36px', padding: '0 20px', borderRadius: '4px', fontSize: '14px' }}
                                >
                                  Delete
                                </Button>
                              )}

                              {!isStandalone && (
                                <Button
                                  onClick={() => history.push("/treatment-plan")}
                                  style={{ height: '36px', padding: '0 20px', borderRadius: '4px', fontSize: '14px' }}
                                >
                                  Cancel
                                </Button>
                              )}
                            </Space>
                          </Col>
                        </Row>
                      ) : null}
                    </Col>
                  </Row>
                </Form>
              </Card>
            </Col>
          </Row>
        )}
      </Container>

      <Prompt
        when={hasChanges && !loadingSubmit}
        message={"Are you sure you want to leave before saving?"}
      />
    </div>
  );
}
