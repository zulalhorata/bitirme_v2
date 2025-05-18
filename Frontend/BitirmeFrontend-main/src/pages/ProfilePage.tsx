/**
 * Profil sayfası bileşeni
 * 
 * Kullanıcı profilini görüntüleme ve düzenleme sayfası
 */
import { useState, useEffect } from 'react';
import { authService } from '../services/auth';
import { toast } from 'react-hot-toast';

const ProfilePage = () => {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setFormData(prev => ({
        ...prev,
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        email: currentUser.email || '',
        phone: currentUser.phone || ''
      }));
    }
  }, []);

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Profil güncelleme:', formData);

    if (!user?.tcKimlik) {
      toast.error('Kullanıcı bilgisi bulunamadı');
      return;
    }

    const success = authService.updateProfile(user.tcKimlik, {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone
    });

    if (success) {
      toast.success('Profil bilgileri başarıyla güncellendi');
      // Kullanıcı bilgilerini yeniden yükle
      const updatedUser = authService.getCurrentUser();
      if (updatedUser) {
        setUser(updatedUser);
      }
    } else {
      toast.error('Profil güncellenirken bir hata oluştu');
    }
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Şifre güncelleme');

    if (!user?.tcKimlik) {
      toast.error('Kullanıcı bilgisi bulunamadı');
      return;
    }

    if (!formData.currentPassword || !formData.newPassword || !formData.confirmNewPassword) {
      toast.error('Lütfen tüm şifre alanlarını doldurun');
      return;
    }

    if (formData.newPassword !== formData.confirmNewPassword) {
      toast.error('Yeni şifreler eşleşmiyor');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('Yeni şifre en az 6 karakter olmalıdır');
      return;
    }

    const success = authService.updatePassword(
      user.tcKimlik,
      formData.currentPassword,
      formData.newPassword
    );

    if (success) {
      toast.success('Şifreniz başarıyla güncellendi');
      // Şifre alanlarını temizle
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      }));
      // Şifre görünürlük durumlarını sıfırla
      setShowPasswords({
        current: false,
        new: false,
        confirm: false
      });
    } else {
      toast.error('Mevcut şifreniz yanlış');
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center mt-2">
      <div className="flex gap-16 mx-auto max-w-[1200px] justify-between">
        {/* Sol Taraf - Formlar */}
        <div className="w-[460px]">
          <div className="bg-white rounded-lg p-6 shadow-sm w-full h-[750px]">
            {/* Profil Bilgileri Formu */}
            <div className="mb-6">
              <h2 className="text-lg text-black mb-1">Profil Bilgileri</h2>
              <div className="border-b border-gray-300 mb-2"></div>
              <form onSubmit={handleProfileUpdate} className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm text-black mb-2">Ad</label>
                    <input
                      type="text"
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none text-black"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm text-black mb-2">Soyad</label>
                    <input
                      type="text"
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none text-black"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm text-black mb-2">E-posta</label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none text-black"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm text-black mb-2">Telefon Numarası</label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none text-black"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#1B4332] text-white py-2 rounded hover:bg-[#143728] transition-colors mt-2"
                >
                  Güncelle
                </button>
              </form>
            </div>

            {/* Şifre Güncelleme Formu */}
            <div>
              <h2 className="text-lg text-black mb-2">Şifre Güncelleme</h2>
              <div className="border-b border-gray-300 mb-3"></div>
              <form onSubmit={handlePasswordUpdate} className="space-y-3">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm text-black mb-2">Mevcut Şifre</label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      id="currentPassword"
                      value={formData.currentPassword}
                      onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none pr-10 text-black"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="newPassword" className="block text-sm text-black mb-2">Yeni Şifre</label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      id="newPassword"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none pr-10 text-black"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="confirmNewPassword" className="block text-sm text-black mb-2">Yeni Şifre (Tekrar)</label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      id="confirmNewPassword"
                      value={formData.confirmNewPassword}
                      onChange={(e) => setFormData({ ...formData, confirmNewPassword: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none pr-10 text-black"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#1B4332] text-white py-2 rounded hover:bg-[#143728] transition-colors mt-2"
                >
                  Güncelle
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Sağ Taraf - Kullanıcı Bilgileri Kartı */}
        <div className="w-[460px]">
          <div className="bg-white rounded-lg p-6 shadow-sm w-full h-[750px] flex items-center justify-center">
            <div className="flex flex-col items-center w-full">
              <div className="w-32 h-32 bg-gray-200 rounded-full mb-8 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold mb-6 text-black">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-black text-lg mb-4">TC Kimlik No: {user?.tcKimlik}</p>
              <p className="text-black text-lg">Doğum Tarihi: {user?.birthDate ? new Date(user.birthDate).toLocaleDateString('tr-TR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              }) : ''}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
