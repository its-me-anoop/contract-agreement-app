import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdmin } from '../hooks/useAdmin';

function AdminPanel() {
    const { isAdmin, loading } = useAdmin();

    if (loading) {
        return <div>Checking admin status...</div>;
    }

    if (!isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    // Your existing AdminPanel code here
    return (
        <div>
            <h1>Admin Panel</h1>
            {/* Rest of your admin panel content */}
        </div>
    );
}

export default AdminPanel;