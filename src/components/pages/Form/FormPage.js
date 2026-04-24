import React, { useState } from 'react';
import { Result, Button } from 'antd';
import TreatmentPlanFormPage from 'components/pages/TreatmentPlan/TreatmentPlanFormPage';

const FormPage = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitSuccess = () => {
    setSubmitted(true);
  };

  const handleSubmitAnother = () => {
    setSubmitted(false);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f7f8fa',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
      }}
    >
      {submitted ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '70vh',
            width: '100%',
            padding: '24px',
          }}
        >
          <Result
            status="success"
            title={
              <span
                style={{
                  color: '#000',
                  fontWeight: 600,
                }}
              >
                Treatment Plan / Log Submitted!
              </span>
            }
            subTitle={
              <span
                style={{
                  color: '#000',
                }}
              >
                The record has been saved successfully.
              </span>
            }
            extra={[
              <Button
                key="another"
                type="primary"
                onClick={handleSubmitAnother}
                style={{
                  backgroundColor: '#000000',
                  borderColor: '#000000',
                  fontWeight: 600,
                  height: '40px',
                  padding: '0 28px',
                  borderRadius: '4px',
                }}
              >
                Submit Another Record
              </Button>,
            ]}
            style={{
              background: '#ffffff',
              borderRadius: '8px',
              padding: '32px',
              width: '100%',
              maxWidth: '600px',
            }}
          />
        </div>
      ) : (
        <div style={{ width: '100%' }}>
          <TreatmentPlanFormPage
            treatmentPlanData={null}
            disabled={false}
            isStandalone={true}
            onSubmitSuccess={handleSubmitSuccess}
          />
        </div>
      )}
    </div>
  );
};

export default FormPage;