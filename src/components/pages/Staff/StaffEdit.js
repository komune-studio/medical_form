import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import StaffModel from 'models/StaffModel';
import StaffFormPage from './StaffFormPage';

const StaffEdit = () => {
  const { id } = useParams();
  const [staffData, setStaffData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        if (!id) return;
        
        const result = await StaffModel.getStaffById(id);
        if (result && result.http_code === 200) {
          setStaffData(result.data);
        } else {
          console.error('Staff not found or error:', result);
        }
      } catch (error) {
        console.error('Error fetching staff:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffData();
  }, [id]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#FFFFFF'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '16px', color: '#333' }}>Loading staff data...</div>
        </div>
      </div>
    );
  }

  return <StaffFormPage staffData={staffData} />;
};

export default StaffEdit;