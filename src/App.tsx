import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import EHRViewer from './components/EHRViewer';
import ConsentForms from './components/ConsentForms';
import Messages from './components/Messages';
import TreatmentPlans from './components/TreatmentPlans';
import AuditTrail from './components/AuditTrail';
import ConsentSigning from './components/ConsentSigning';
import Login from './components/Login';
import { useAuthStore } from './store/authStore';
import { useState } from 'react';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [consentToSign, setConsentToSign] = useState<string | null>(null);

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="ehr" element={<EHRViewer />} />
          <Route path="consent-forms" element={<ConsentForms />} />
          <Route path="messages" element={<Messages />} />
          <Route path="treatment-plans" element={<TreatmentPlans />} />
          <Route path="audit" element={<AuditTrail />} />
        </Route>
      </Routes>
      
      {consentToSign && (
        <ConsentSigning 
          consentId={consentToSign} 
          onClose={() => setConsentToSign(null)} 
        />
      )}
    </Router>
  );
}

export default App;