import { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import MedicalHistoryFormPage from "./MedicalHistoryFormPage";
import MedicalHistoryModel from "models/MedicalHistoryModel";
import { Spin, Card, Alert } from 'antd';

const MedicalHistoryEdit = () => {
  const [medicalHistoryData, setMedicalHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const history = useHistory();

  const params = useParams();
  
  console.log('MedicalHistoryEdit component loaded with ID:', params.id);

  useEffect(() => {
    const getMedicalHistoryData = async (id) => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching medical history data for ID:', id);
        
        const response = await MedicalHistoryModel.getMedicalHistoryById(id);
        console.log('API Response:', response);
        
        if (response && response.http_code === 200) {
          setMedicalHistoryData(response.data);
          console.log('Medical history data set:', response.data);
        } else {
          setError('Medical history record not found or server error');
          setMedicalHistoryData(null);
        }
      } catch (error) {
        console.error("Error fetching medical history:", error);
        setError('Failed to load medical history data. Please try again.');
        setMedicalHistoryData(null);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      getMedicalHistoryData(params.id);
    } else {
      setError('No medical history ID provided');
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
            Loading medical history data...
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
                onClick={() => history.push('/medical-history')}
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
                Back to Medical History List
              </button>
            </div>
          }
        />
      </div>
    );
  }

  if (!medicalHistoryData) {
    return (
      <div style={{ 
        padding: '20px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <Alert
          message="Medical History Record Not Found"
          description="The medical history record you are trying to edit does not exist or has been deleted."
          type="warning"
          showIcon
          action={
            <div style={{ marginTop: '16px' }}>
              <button
                onClick={() => history.push('/medical-history')}
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
                Back to Medical History List
              </button>
            </div>
          }
        />
      </div>
    );
  }

  console.log('Rendering MedicalHistoryFormPage with data:', medicalHistoryData);
  
  return (
    <div style={{ width: '100%' }}>
      <MedicalHistoryFormPage medicalHistoryData={medicalHistoryData} />
    </div>
  );
}

export default MedicalHistoryEdit;