import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { DashboardOverview } from '@/features/dashboard/components/DashboardOverview';
import { PatientList } from '@/features/patients/components/PatientList';
import { DoctorList } from '@/features/doctors/components/DoctorList';
import { AppointmentList } from '@/features/appointments/components/AppointmentList';

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<DashboardOverview />} />
          <Route path="/patients" element={<PatientList />} />
          <Route path="/doctors" element={<DoctorList />} />
          <Route path="/appointments" element={<AppointmentList />} />
          <Route path="/analytics" element={<div>Analytics Page - Coming Soon</div>} />
          <Route path="/settings" element={<div>Settings Page - Coming Soon</div>} />
          <Route path="/help" element={<div>Help Page - Coming Soon</div>} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;