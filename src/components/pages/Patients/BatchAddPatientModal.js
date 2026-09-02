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
  Paper
} from "@mui/material";
import Papa from "papaparse";
import { CSVLink } from "react-csv";
import Iconify from "../../reusable/Iconify";
import FileUpload from "../../reusable/FileUpload";
import ApiRequest from '../../../utils/ApiRequest';

export default function BatchAddPatientModal({ open, onClose, onSuccess }) {
  const [patients, setPatients] = useState([]);
  const [errorList, setErrorList] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false); 

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

  const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return "";
    let phoneString = String(phoneNumber).trim();

    if (phoneString.includes("E") || phoneString.includes("e")) {
      try {
        phoneString = Number(phoneString).toFixed(0);
      } catch (e) {
        phoneString = phoneString.replace(/[^0-9]/g, "");
      }
    }

    const digits = phoneString.replace(/[^0-9]/g, "");
    if (!digits) return "";

    if (digits.startsWith("08")) {
      return `+62${digits.slice(1)}`;
    }

    if (digits.startsWith("628")) {
      return `+${digits}`;
    }



    return phoneString; 
  };

  const isValidPhoneNumber = (phone) => {
    if (!phone) return false;
    const phoneRegex = /^(\+?62|0)8[1-9][0-9]{7,11}$/;
    return phoneRegex.test(String(phone).trim());
  };

  const reset = () => {
    setPatients([]);
    setErrorList([]);
    setSuccessMessage("");
    setIsSubmitted(false);
  };

  useEffect(() => {
    reset();
  }, [open]);


  const submitData = async () => {
    try {
      setErrorList([]);
      setSuccessMessage("");

      const response = await ApiRequest.set('v1/patient/batch', 'POST', patients);

      if (response) {
        const backendErrors = response.errorList || response.data?.errorList || [];
        
        if (backendErrors.length > 0) {
          const formattedBackendErrors = backendErrors.map((err) => ({
            data: {
              fullname: err.data?.fullname || err.fullname || err.patient_code || err.name || 'Patient'
            },
            error_message: err.error_message || err.message || String(err)
          }));
          setErrorList(formattedBackendErrors);
        }

        const failedCount = backendErrors.length;
        const successCount = response.insertedCount ?? (patients.length - failedCount);

        setSuccessMessage(`Successfully processed ${successCount}/${patients.length} data`);

        if (onSuccess) onSuccess();
        setIsSubmitted(true);
      }
    } catch (e) {
      console.error("Error submitting patients batch:", e);
      setErrorList([{ error_message: e?.response?.data?.message || "Gagal menyimpan data ke database." }]);
    }
  };

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
        setErrorList([{ error_message: "Maximum upload limit is 5000 data" }]);
        return;
      }

      const validGenders = ["MALE", "FEMALE"];

      const isValidEmail = (email) => {
        if (!email) return false;
        const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return emailRegex.test(String(email).toLowerCase());
      };
      
      let errors = [];
      let seenPhones = new Set();
      let seenEmails = new Set();

      let formattedData = [];

      unFormattedData.forEach((obj, index) => {
        const fullname = (obj['Full Name'] || obj.fullname || '').trim();
        const rawGender = (obj['Gender'] || obj.gender || '').trim().toUpperCase();
        const phone = formatPhoneNumber(obj['Phone Number'] || obj.phone_number || '');
        const email = (obj['Email'] || obj.email || '').trim(); 
        const lowerEmail = email.toLowerCase(); 
        
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
          rowErrors.push(`Phone Number '${phone}' tidak valid (harus diawali '08' & 10-14 digit)`);
        }
        
        if (!email) {
          rowErrors.push("Email tidak boleh kosong");
        } else if (!isValidEmail(email)) {
          rowErrors.push(`Email '${email}' format tidak valid`);
        }

        if (!validGenders.includes(rawGender)) {
          rowErrors.push(`Gender '${obj['Gender'] || 'KOSONG'}' tidak valid (harus MALE/FEMALE)`);
        }

        // Check duplicates within the CSV.
        if (phone && seenPhones.has(phone)) {
          rowErrors.push(`Phone Number '${phone}' duplikat di dalam file CSV`);
        } else if (phone) {
          seenPhones.add(phone);
        }

        if (lowerEmail && seenEmails.has(lowerEmail)) {
          rowErrors.push(`Email '${email}' duplikat di dalam file CSV`);
        } else if (lowerEmail) {
          seenEmails.add(lowerEmail);
        }

        if (rowErrors.length > 0) {
          errors.push({
            data: { fullname: fullname || `Baris ${index + 1}` },
            error_message: `Baris ${index + 1}: ${rowErrors.join(', ')}`
          });
          return; 
        }

        const parseNumber = (val) => {
          if (val === null || val === undefined || val === "") return null;
          const num = Number(String(val).replace(",", "."));
          return isNaN(num) ? null : num;
        };

        formattedData.push({
          fullname: fullname,
          dob: formattedDob,
          gender: rawGender,
          height: parseNumber(obj['Height (cm)'] || obj['Height'] || obj.height),
          weight: parseNumber(obj['Weight (kg)'] || obj['Weight'] || obj.weight),
          phone_number: phone,
          email: email || null,
          address: obj['Address'] || obj.address || null,
          allergies: allergies || null,
          medical_notes: medicalNotes || null,
        });
      });

      setErrorList(errors);
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
Jane Doe;10/01/2001;FEMALE;167;55;\u200B+6281215412345;janeDoe@gmail.com;123 Main St Apt 4B New York, IL 62701, USA ;Peanut;itching`
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

          {errorList.map((obj, idx) => (
            <div key={idx} style={{ color: "#dc2626", fontSize: 14 }}>
              Fail to process patient <b>{obj.data?.fullname || ''}</b>: {obj.error_message}
            </div>
          ))}

          {/* Tabel Preview */}
          {patients.length > 0 && (
            <>
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
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{idx + 1}</TableCell>
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

              {/* Action Buttons: Save vs Done */}
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
            </>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}