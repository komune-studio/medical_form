/* global BigInt */
import React, { useEffect, useState } from "react";
import { 
  Button, 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  IconButton, 
  Stack, 
  TableCell,
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Collapse
} from "@mui/material";
import Papa from "papaparse";
import { CSVLink } from "react-csv";
import Iconify from "../../reusable/Iconify";
import FileUpload from "../../reusable/FileUpload";
import ApiRequest from '../../../utils/ApiRequest';

export default function BatchAddPatientModal({ open, onClose, onSuccess }) {
  const [patients, setPatients] = useState([]);
  const [csvErrorList, setCsvErrorList] = useState([]);

  const [errorList, setErrorList] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false); 
  const [showErrors, setShowErrors] = useState(true);

  const formatDateToISO = (dateStr) => {
    if (!dateStr) return null;
    const cleanStr = String(dateStr).trim();
    const parts = cleanStr.split(/[\/-]/);
    
    if (parts.length === 3) {
      if (parts[2].length === 4) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        return `${year}-${month}-${day}`;
      }
      if (parts[0].length === 4) {
        return cleanStr;
      }
    }
    return cleanStr;
  };

const formatPhoneNumber = (rawPhone) => {
  if (!rawPhone) return '';
  let phone = String(rawPhone)
  .replace(/[\u200B-\u200D\uFEFF]/g, '')
  .trim()
  .replace(/[\s\-\(\)]/g, '')


  if (phone.startsWith('+620')) {
    phone = '+62' + phone.slice(4);
  } else if (phone.startsWith('08')) {
    phone = `+62${phone.slice(1)}`;
  } else if (phone.startsWith('+')) {
    phone = phone;
  } else if (/^\d+$/.test(phone)) {
    phone = `+${phone}`;
  }
  return phone;
};


const isValidPhoneNumber = (phone) => {
  if (!phone) return false;
  const phoneRegex = /^\+[1-9]\d{6,14}$/;
  return phoneRegex.test(phone);
};

  const reset = () => {
    setPatients([]);
    setCsvErrorList([]);
    setErrorList([]);
    setSuccessMessage("");
    setIsSubmitted(false);
    setShowErrors(false);
  };

  useEffect(() => {
    reset();
  }, [open]);

  //data submittion data 
  const submitData = async () => {
    try {
      setErrorList([]);
      setSuccessMessage("");
      setShowErrors(false);

      const submittedPatients = patients; 
      const response = await ApiRequest.set('v1/patient/batch', 'POST', submittedPatients);

      if (response) {
        const backendErrors = response.errorList || response.data?.errorList || [];
        const successfulPatients = response.successfulPatients || response.data?.successfulPatients || [];

        const formattedBackendErrors = backendErrors.map((err) => ({
          data: {
            fullname: err.data?.fullname || err.fullname || err.patient_code || err.name || 'Patient'
          },
          error_message: err.error_message || err.message || String(err)
        }));
        setErrorList(formattedBackendErrors);

        // preview table and field mapping
        const savedForDisplay = successfulPatients.map((sp) => ({
          patient_code: sp.patient_code,
          fullname: sp.name,
          dob: sp.date_of_birth ? String(sp.date_of_birth).split('T')[0] : '',
          gender: sp.gender,
          phone_number: sp.phone,
          email: sp.email,
          address: sp.address,
          allergies: sp.allergies,
          medical_notes: sp.medical_notes,
        }));

        // Post-submit
        setPatients(savedForDisplay);

        const failedCount = backendErrors.length;
        const successCount = response.insertedCount ?? successfulPatients.length;

        setSuccessMessage(
          `Successfully saved ${successCount}/${submittedPatients.length} data` +
          (failedCount > 0 ? ` — ${failedCount} gagal, lihat detail di bawah.` : '')
        );

        if (onSuccess) onSuccess();
        setIsSubmitted(true);
      }
    } catch (e) {
      console.error("Error submitting patients batch:", e);
      setErrorList([{ error_message: e?.response?.data?.message || "Gagal menyimpan data ke database." }]);
    }
  };

  //send to backend
  const handleFileUpload = async (result) => {
    reset();

    if (!result || result.length === 0) return;

    let reader = new FileReader();
    reader.readAsText(result[0], "UTF-8");

    reader.onload = async (e) => {
      let stringCSV = e.target.result;

      let parseResult = Papa.parse(stringCSV, { 
        header: true, 
        skipEmptyLines: true,
        transformHeader: (h) => h.trim()
      });

      let unFormattedData = parseResult.data;

      if (unFormattedData.length > 5000) {
        setCsvErrorList([{ error_message: "Maximum upload limit is 5000 data" }]);
        return;
      }

      const validGenders = ["MALE", "FEMALE"];
      //email validation
      const isValidEmail = (email) => {
        if (!email) return false;
        const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return emailRegex.test(String(email).toLowerCase());
      };
      
      let errors = [];

      // Duplicate checks (against DB and within this file) 
      let formattedData = [];

      unFormattedData.forEach((obj, index) => {
        const patientCode = (
          obj['Patient Code'] || 
          obj.patient_code || 
          obj['Patient ID'] || 
          obj.patient_id || 
          ''
        ).trim();

        const fullname = (obj['Full Name'] || obj.fullname || '').trim();
        const rawGender = (obj['Gender'] || obj.gender || '').trim().toUpperCase();
        const phone = formatPhoneNumber(obj['Phone Number'] || obj.phone_number || obj.phone || '');
        const email = (obj['Email'] || obj.email || '').trim(); 
        
        const allergies = (obj['Allergies'] || obj.allergies || '').trim();
        const medicalNotes = (obj['Medical Notes'] || obj.medical_notes || obj.medicalNotes || '').trim();
        const rawDob = obj['Date of Birth'] || obj.dob || null;
        const formattedDob = formatDateToISO(rawDob);

        let rowErrors = [];

        if (!fullname) {
          rowErrors.push("Full Name tidak boleh kosong");
        }
        
        if (!phone) {
          rowErrors.push("Phone Number tidak boleh kosong");
        } else if (!isValidPhoneNumber(phone)) {
          rowErrors.push(`Phone Number '${phone}' tidak valid (gunakan format internasional E.164, misal: +62812..., +86139..., +1212...)`);
        }
                
        if (!email) {
          rowErrors.push("Email tidak boleh kosong");
        } else if (!isValidEmail(email)) {
          rowErrors.push(`Email '${email}' format tidak valid`);
        }

        if (!validGenders.includes(rawGender)) {
          rowErrors.push(`Gender '${obj['Gender'] || 'KOSONG'}' tidak valid (harus MALE/FEMALE)`);
        }

        const parseNumber = (val) => {
          if (val === null || val === undefined || val === "") return null;
          const num = Number(String(val).replace(",", "."));
          return isNaN(num) ? null : num;
        };

        const csvRowForCompare = {
          fullname,
          gender: rawGender,
          dob: formattedDob,
          phone_number: phone,
          email: email || null,
          address: obj['Address'] || obj.address || null,
          allergies: allergies || null,
          medical_notes: medicalNotes || null,
          height: parseNumber(obj['Height (cm)'] || obj['Height'] || obj.height),
          weight: parseNumber(obj['Weight (kg)'] || obj['Weight'] || obj.weight),
        };

        // Error Handling
        if (rowErrors.length > 0) {
          errors.push({
            data: { fullname: fullname || `Baris ${index + 1}` },
            error_message: `Baris ${index + 1}: ${rowErrors.join(', ')}`
          });
          return; 
        }

        formattedData.push({
          patient_code: patientCode || null,
          ...csvRowForCompare,
          status: "new",
          csvRowNumber: index + 1 // Simpan nomor baris asli CSV
        });
      });

      // Ask the backend to check duplicates 
      try {
        const previewRes = await ApiRequest.set('v1/patient/batch/preview', 'POST', formattedData);
        const results = previewRes.results || previewRes.data?.results || [];

        const errorIndexes = new Set();
        results.forEach((r) => {
          if (!formattedData[r.index]) return;
          const originalRow = formattedData[r.index].csvRowNumber || (r.index + 1);
          if (r.status === 'error') {
            errorIndexes.add(r.index);
            const rowLabel = formattedData[r.index].fullname || `Baris ${originalRow}`;
            (r.errors && r.errors.length ? r.errors : ['Data tidak valid']).forEach((msg) => {
              errors.push({
                data: { fullname: rowLabel },
                error_message: `Baris ${originalRow}: ${msg}`
              });
            });
          } else {
            formattedData[r.index].status = r.status;
          }
        });

        if (errorIndexes.size > 0) {
          formattedData = formattedData.filter((_, i) => !errorIndexes.has(i));
        }
      } catch (previewErr) {
        console.error("Error previewing import:", previewErr); // Don't block the import over a failed preview
      }

      setCsvErrorList(errors);
      setPatients(formattedData);
    };
  };

  return (
    <Dialog
      open={open}
      onClose={() => onClose(false)}
      maxWidth="md"
      fullWidth
      PaperProps={{
        style: { borderRadius: 12 }
      }}
    >
      <DialogTitle style={{ fontWeight: 600, fontSize: 18 }}>
        Import Batch Patients
      </DialogTitle>
      
      <IconButton
        aria-label="close"
        onClick={() => onClose(false)}
        sx={(theme) => ({
          position: 'absolute',
          right: 12,
          top: 12,
          color: theme.palette.grey[500],
        })}
      >
        <Iconify icon="mdi:close" />
      </IconButton>

      <DialogContent dividers>
        <Stack spacing={2}>
          <Stack direction={"row"} spacing={1.5} alignItems="center">
            <CSVLink
              separator={";"}
              data={
                `Full Name;Date of Birth;Gender;Height (cm);Weight (kg);Phone Number;Email;Address;Allergies;Medical Notes
John Doe;20/02/2002;MALE;170;60;\u200B+6281215469420;johnDoe@gmail.com;102 High Street, London, SW1A 1AA ;Seafood;rash 
Jane Doe;10/01/2001;FEMALE;167;55;\u200B+13105550143 ;janeDoe@gmail.com;123 Main St Apt 4B New York, IL 62701, USA ;Peanut;itching`
              }
              filename={`upload-patient-template.csv`}
              style={{ textDecoration: "none" }}
            >
              <Button
                component="span"
                sx={{
                  backgroundColor: "#e7eeef",     
                  color: "#0c0c0c !important",     
                  textTransform: "none",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1,
                  "&:hover": {
                    backgroundColor: "#374151",   
                    color: "#ffffff !important",   
                  }
                }}
              >
                Download Template <Iconify icon="mdi:download" />
              </Button>
            </CSVLink>

            <FileUpload
              allowedType={["text/csv", "application/vnd.ms-excel"]}
              hideSpinner={true}
              text={"Upload CSV"}
              onDrop={handleFileUpload}
            />
          </Stack>

          {/* Feedback Message */}
          {successMessage && (
            <div style={{ marginTop: 8, color: "#16a34a", fontWeight: 600, fontSize: 14 }}>{successMessage}</div>
          )}

          {(csvErrorList.length > 0 || errorList.length > 0) && (
            <div
              style={{
                border: '1px solid #fecaca',
                background: '#fef2f2',
                borderRadius: 8,
                padding: '10px 12px',
                maxHeight: 200,
                overflowY: 'auto',
              }}
            >
              <div 
                onClick={() => setShowErrors(!showErrors)}
                style={{ 
                  fontWeight: 700, 
                  fontSize: 13, 
                  color: "#991b1b", 
                  display: "flex", 
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer" 
                }}
              >
                <span>{csvErrorList.length + errorList.length} data gagal diproses:</span>
                <Iconify icon={showErrors ? "mdi:chevron-up" : "mdi:chevron-down"} />
              </div>

              {/* Collapse error section */}
              <Collapse in={showErrors}>
                <div style={{ marginTop: 8, maxHeight: 200, overflowY: 'auto' }}>
                  {csvErrorList.map((obj, idx) => (
                    <div key={`csv-${idx}`} style={{ color: "#dc2626", fontSize: 13, marginBottom: 4 }}>
                      Fail to process patient <b>{obj.data?.fullname || ''}</b>: {obj.error_message}
                    </div>
                  ))}

                  {errorList.map((obj, idx) => (
                    <div key={`api-${idx}`} style={{ color: "#dc2626", fontSize: 13, marginBottom: 4 }}>
                      Fail to save patient <b>{obj.data?.fullname || ''}</b>: {obj.error_message}
                    </div>
                  ))}
                </div>
              </Collapse>
            </div>
          )}

          {/* Tabel Preview */}
          {isSubmitted && patients.length === 0 && (
            <div style={{ fontSize: 13, color: "#666", fontStyle: 'italic' }}>
              Tidak ada data yang berhasil disimpan.
            </div>
          )}

          {patients.length > 0 && (
            <>
              {isSubmitted && (
                <div style={{ fontWeight: 600, fontSize: 13, color: "#166534" }}>
                  Data berhasil disimpan:
                </div>
              )}
              <TableContainer 
                component={Paper} 
                variant="outlined" 
                sx={{ maxHeight: 320, overflowX: 'auto', overflowY: 'auto', borderRadius: 2 }}
              >
                <Table size="small" stickyHeader sx={{ minWidth: 950 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>No</TableCell>
                      <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Full Name</TableCell>
                      <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>DOB</TableCell>
                      <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Gender</TableCell>
                      <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Phone Number</TableCell>
                      <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Address</TableCell>
                      <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Allergies</TableCell>
                      <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Medical Notes</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {patients.map((row, idx) => (
                      <TableRow key={idx} hover>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>{idx + 1}</span>
                            
                            {row?.status === 'new' && (
                              <span 
                                title="Data Baru"
                                style={{ 
                                  width: '8px', 
                                  height: '8px', 
                                  borderRadius: '50%', 
                                  backgroundColor: '#16a34a',
                                  display: 'inline-block' 
                                }} 
                              />
                            )}
                            {row?.status === 'edited' && (
                              <span 
                                title="Data Di-edit"
                                style={{ 
                                  width: '8px', 
                                  height: '8px', 
                                  borderRadius: '50%', 
                                  backgroundColor: '#eab308', 
                                  display: 'inline-block' 
                                }} 
                              />
                            )}
                            {/* Grey unchanged dot disabled for now */}
                            {/* {row?.status === 'unchanged' && (
                              <span 
                                title="Tidak Ada Perubahan"
                                style={{ 
                                  width: '8px', 
                                  height: '8px', 
                                  borderRadius: '50%', 
                                  backgroundColor: '#9ca3af', // Abu-abu
                                  display: 'inline-block' 
                                }} 
                              />
                            )} */}
                          </div>
                        </TableCell>

                        {/* Kolom lainnya tetap sama */}
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row?.fullname}</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row?.dob}</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row?.gender}</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row?.phone_number}</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row?.email}</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row?.address}</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row?.allergies}</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row?.medical_notes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          {/* Action Buttons: Save vs Done */}
          {(patients.length > 0 || isSubmitted) && (
            <Stack direction={"row"} justifyContent="flex-end" sx={{ mt: 1 }}>
              {!isSubmitted ? (
                <Button 
                  onClick={submitData} 
                  sx={{ 
                    backgroundColor: "#16a34a",            
                    color: "#ffffff !important",          
                    textTransform: "none",
                    fontWeight: 600,
                    px: 3,
                    "&:hover": { backgroundColor: "#15803d" }
                  }}
                >
                  Save Patients
                </Button>
              ) : (
                <Button 
                  onClick={() => {
                    if (onSuccess) onSuccess();
                    onClose(false);
                  }} 
                  sx={{ 
                    backgroundColor: "#2563eb",            
                    color: "#ffffff !important",          
                    textTransform: "none",
                    fontWeight: 600,
                    px: 4,
                    "&:hover": { backgroundColor: "#1d4ed8" }
                  }}
                >
                  Done
                </Button>
              )}
            </Stack>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}