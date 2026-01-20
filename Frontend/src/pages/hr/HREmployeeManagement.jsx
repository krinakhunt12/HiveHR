import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import UserManager from '../../components/admin/UserManager';

const HREmployeeManagement = () => {
    return (
        <DashboardLayout>
            <UserManager targetRole="employee" restricted={true} />
        </DashboardLayout>
    );
};

export default HREmployeeManagement;
