import React from 'react';
import PatientFormPage from "./PatientFormPage"

const PatientCreate = () => {
  console.log('PatientCreate component loaded');
  
  return (
    <div style={{ width: '100%' }}>
      <PatientFormPage />
    </div>
  )
}

export default PatientCreate