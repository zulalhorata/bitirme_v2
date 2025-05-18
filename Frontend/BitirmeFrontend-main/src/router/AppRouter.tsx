import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import HomePage from '../pages/HomePage';
import AppointmentsPage from '../pages/AppointmentsPage';
import CreateAppointmentPage from '../pages/CreateAppointmentPage';
import TestResultsPage from '../pages/TestResultsPage';
import RadiologyPage from '../pages/RadiologyPage';
import MedicalRecordsPage from '../pages/MedicalRecordsPage';
import NotificationsPage from '../pages/NotificationsPage';
import ProfilePage from '../pages/ProfilePage';
import SettingsPage from '../pages/SettingsPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import { authService } from '../services/auth';
import { useEffect, useState, useCallback } from 'react';

/**
 * Uygulama router yapılandırması
 * 
 * Tüm sayfa rotalarını ve ilgili bileşenleri tanımlar
 */
const AppRouter = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  const [, forceUpdate] = useState({});

  const checkAuth = useCallback(() => {
    const authStatus = authService.isAuthenticated();
    console.log('Auth durumu kontrol ediliyor:', authStatus);
    setIsAuthenticated(authStatus);
    forceUpdate({});
  }, []);

  useEffect(() => {
    // İlk yüklemede kontrol et
    checkAuth();

    // Storage değişikliklerini dinle
    const handleStorageChange = (e: StorageEvent) => {
      console.log('Storage değişikliği:', e.key);
      if (e.key === 'current_user' || e.key === null) {
        checkAuth();
      }
    };

    // Custom event dinle
    const handleCustomStorageChange = () => {
      console.log('Custom storage event tetiklendi');
      checkAuth();
    };

    // Event listener'ları ekle
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('customStorageChange', handleCustomStorageChange);

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('customStorageChange', handleCustomStorageChange);
    };
  }, [checkAuth]);

  return (
    <Router>
      <Routes>
        {!isAuthenticated ? (
          <>
            <Route path="/giris" element={<LoginPage />} />
            <Route path="/kayit" element={<RegisterPage />} />
            <Route path="*" element={<Navigate to="/giris" replace />} />
          </>
        ) : (
          <>
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/randevularim" element={<AppointmentsPage />} />
              <Route path="/randevu-al" element={<CreateAppointmentPage />} />
              <Route path="/tahlillerim" element={<TestResultsPage />} />
              <Route path="/radyolojik-goruntuler" element={<RadiologyPage />} />
              <Route path="/saglik-kayitlarim" element={<MedicalRecordsPage />} />
              <Route path="/bildirimler" element={<NotificationsPage />} />
              <Route path="/profil" element={<ProfilePage />} />
              <Route path="/ayarlar" element={<SettingsPage />} />
            </Route>
            <Route path="/giris" element={<Navigate to="/" replace />} />
            <Route path="/kayit" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </Router>
  );
};

export default AppRouter;
