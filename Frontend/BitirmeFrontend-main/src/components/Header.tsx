import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NotificationIcon, ProfileIcon, MenuIcon } from '../assets/icons';
import { authService } from '../services/auth';

/**
 * Header bileşeni props türü
 */
interface HeaderProps {
  toggleSidebar: () => void;
}

/**
 * Uygulama üst çubuğu bileşeni
 * 
 * Logo, bildirim ve profil butonları içerir
 * @param toggleSidebar - Kenar çubuğunu açıp kapatma fonksiyonu
 */
const Header = ({ toggleSidebar }: HeaderProps) => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /**
   * Bildirimler sayfasına yönlendirme fonksiyonu
   */
  const goToNotifications = () => {
    navigate('/bildirimler');
  };

  /**
   * Profil sayfasına yönlendirme fonksiyonu
   */
  const goToProfile = () => {
    navigate('/profil');
    setShowProfileMenu(false);
  };

  /**
   * Ana sayfaya yönlendirme fonksiyonu
   */
  const goToHome = () => {
    navigate('/');
  };

  const handleLogout = () => {
    try {
      console.log('Çıkış işlemi başlatılıyor...');

      // Önce menüyü kapat
      setShowProfileMenu(false);
      console.log('Profil menüsü kapatıldı');

      // Oturumu sonlandır
      authService.logout();
      console.log('Auth service logout çağrıldı');

      // Session storage'ı temizle
      sessionStorage.clear();
      console.log('Session storage temizlendi');

      // Local storage'dan auth ile ilgili verileri temizle
      localStorage.removeItem('current_user');
      console.log('Local storage temizlendi');

      // Custom event tetikle
      window.dispatchEvent(new Event('customStorageChange'));
      console.log('Custom storage event tetiklendi');

      // Giriş sayfasına yönlendir
      console.log('Giriş sayfasına yönlendiriliyor...');
      navigate('/giris', { replace: true });
    } catch (error) {
      console.error('Çıkış yapılırken bir hata oluştu:', error);
      // Hata olsa bile giriş sayfasına yönlendir
      console.log('Hata durumunda giriş sayfasına yönlendiriliyor...');
      navigate('/giris', { replace: true });
    }
  };

  return (
    <header className="bg-[#788F89] h-20">
      <div className="flex items-center h-full px-4">
        <button
          onClick={toggleSidebar}
          className="px-6 py-3 hover:bg-[#6A7D78] rounded-lg transition-colors"
        >
          <MenuIcon className="w-6 h-6 text-white" />
        </button>
        <span className="text-2xl font-medium text-white ml-4 cursor-pointer" onClick={goToHome}>LOGO</span>
        <div className="ml-auto flex items-center space-x-2">
          <button
            className="p-2 hover:bg-[#6A7D78] rounded-lg transition-colors"
            onClick={goToNotifications}
          >
            <NotificationIcon className="w-6 h-6 text-white" />
          </button>
          <div className="relative" ref={profileMenuRef}>
            <button
              className="p-2 hover:bg-[#6A7D78] rounded-lg transition-colors"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <ProfileIcon className="w-6 h-6 text-white" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                <button
                  onClick={goToProfile}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profil Bilgilerim
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Çıkış Yap
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;