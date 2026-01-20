import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import UserManager from '../../components/admin/UserManager';

const EmployeeManagement = () => {
    return (
        <DashboardLayout>
            <UserManager targetRole="employee" />
        </DashboardLayout>
    );
};

export default EmployeeManagement;
