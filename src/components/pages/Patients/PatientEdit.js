import { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import PatientFormPage from "./PatientFormPage"
import PatientModel from "models/PatientModel";
import { Spin, Card, Alert } from 'antd';

const PatientEdit = () => {
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const history = useHistory();

  const params = useParams();
  
  console.log('PatientEdit component loaded with ID:', params.id);

  useEffect(() => {
    const getPatientData = async (id) => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching patient data for ID:', id);
        
        const response = await PatientModel.getPatientById(id);
        console.log('API Response:', response);
        
        if (response && response.http_code === 200) {
          setPatientData(response.data);
          console.log('Patient data set:', response.data);
        } else {
          setError('Patient not found or server error');
          setPatientData(null);
        }
      } catch (error) {
        console.error("Error fetching patient:", error);
        setError('Failed to load patient data. Please try again.');
        setPatientData(null);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      getPatientData(params.id);
    } else {
      setError('No patient ID provided');
      setLoading(false);
    }
  }, [params.id]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        backgroundColor: '#f5f5f5'
      }}>
        <Card style={{ 
          textAlign: 'center', 
          padding: '40px',
          border: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <Spin size="large" />
          <div style={{ marginTop: '20px', color: '#666' }}>
            Loading patient data...
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '20px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <div style={{ marginTop: '16px' }}>
              <button
                onClick={() => history.push('/patients')}
                style={{
                  background: '#1890ff',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Back to Patient List
              </button>
            </div>
          }
        />
      </div>
    );
  }

  if (!patientData) {
    return (
      <div style={{ 
        padding: '20px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <Alert
          message="Patient Not Found"
          description="The patient you are trying to edit does not exist or has been deleted."
          type="warning"
          showIcon
          action={
            <div style={{ marginTop: '16px' }}>
              <button
                onClick={() => history.push('/patients')}
                style={{
                  background: '#1890ff',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Back to Patient List
              </button>
            </div>
          }
        />
      </div>
    );
  }

  console.log('Rendering PatientFormPage with data:', patientData);
  
  return (
    <div style={{ width: '100%' }}>
      <PatientFormPage patientData={patientData} />
    </div>
  );
}

export default PatientEdit;