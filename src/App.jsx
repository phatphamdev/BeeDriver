import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Admin pages
import AdminApp from './admin/AdminApp';
import AdminLogin from './admin/pages/AdminLogin';
import Dashboard from './admin/pages/Dashboard';
import DriverManagement from './admin/pages/DriverManagement';

// Driver pages
import DriverApp from './driver/DriverApp';
import DriverLogin from './driver/pages/DriverLogin';
import Workspace from './driver/pages/Workspace';

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          {/* Redirect root to admin */}
          <Route path="/" element={<Navigate to="/admin" replace />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminApp />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="drivers" element={<DriverManagement />} />
          </Route>

          {/* Driver Routes */}
          <Route path="/driver/login" element={<DriverLogin />} />
          <Route path="/driver" element={<DriverApp />}>
            <Route index element={<Navigate to="/driver/workspace" replace />} />
            <Route path="workspace" element={<Workspace />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
