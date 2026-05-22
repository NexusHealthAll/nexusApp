import { useParams, useNavigate } from 'react-router-dom';
import { ConsultationView } from './ConsultationView';

export function ConsultationWrapper() {
  const { appointmentId, patientId } = useParams<{
    appointmentId: string;
    patientId: string;
  }>();
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/medical-staff/dashboard');
  };

  if (!appointmentId || !patientId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Invalid Consultation</h2>
          <p className="text-neutral-600 mb-4">Missing appointment or patient information.</p>
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <ConsultationView
      appointmentId={appointmentId}
      patientId={patientId}
      onClose={handleClose}
    />
  );
}