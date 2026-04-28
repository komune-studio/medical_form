import { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import TreatmentPlanFormPage from "./TreatmentPlanFormPage";
import TreatmentPlanModel from "models/TreatmentPlanModel";
import { Spin, Card, Alert } from 'antd';

const TreatmentPlanEdit = () => {
  const [treatmentPlanData, setTreatmentPlanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const history = useHistory();

  const params = useParams();
  
  console.log('TreatmentPlanEdit component loaded with ID:', params.id);

  useEffect(() => {
    const getTreatmentPlanData = async (id) => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching medical history data for ID:', id);
        
        const response = await TreatmentPlanModel.getById(id);
        console.log('API Response:', response);
        
        if (response && response.http_code === 200) {
          setTreatmentPlanData(response.data);
          console.log('Medical history data set:', response.data);
        } else {
          setError('Medical history record not found or server error');
          setTreatmentPlanData(null);
        }
      } catch (error) {
        console.error("Error fetching medical history:", error);
        setError('Failed to load medical history data. Please try again.');
        setTreatmentPlanData(null);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      getTreatmentPlanData(params.id);
    } else {
      setError('No medical history ID provided');
      setLoading(false);
    }
  }, [params.id]);

  if (loading) {
    return (
      <div style={{ 
        width: '100%',
        minHeight: 'calc(100vh - 120px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px 16px',
        backgroundColor: '#ffffff'
      }}>
        <Card style={{ 
          width: '100%',
          maxWidth: '440px',
          textAlign: 'center', 
          padding: '40px',
          border: '1px solid #f0f0f0',
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
        }}>
          <Spin size="large" />
          <div style={{ marginTop: '20px', color: '#666', fontSize: '14px' }}>
            Loading treatment plan data...
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
                onClick={() => history.push('/treatment-plan')}
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

  if (!treatmentPlanData) {
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
                onClick={() => history.push('/treatment-plan')}
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

  console.log('Rendering TreatmentPlanFormPage with data:', treatmentPlanData);
  
  return (
    <div style={{ width: '100%' }}>
      <TreatmentPlanFormPage treatmentPlanData={treatmentPlanData} />
    </div>
  );
}

export default TreatmentPlanEdit;
