import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import UserManager from '../../components/admin/UserManager';

const HRManagement = () => {
    return (
        <DashboardLayout>
            <UserManager targetRole="hr" />
        </DashboardLayout>
    );
};

export default HRManagement;
