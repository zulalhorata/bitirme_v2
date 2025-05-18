import { useNavigate, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  CalendarIcon,
  AppointmentIcon,
  TestIcon,
  RadiologyIcon,
  MedicalRecordIcon,
  SettingsIcon
} from '../assets/icons';

/**
 * Sidebar bileşeni props türü
 */
interface SidebarProps {
  isOpen: boolean;
}

/**
 * Kenar çubuğu bileşeni
 * 
 * Sağlık uygulamasının ana navigasyon menüsünü içerir
 * @param isOpen - Kenar çubuğunun açık olup olmadığını belirtir
 */
const Sidebar = ({ isOpen }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  /**
   * Menü öğelerini tanımlar
   */
  const menuItems = [
    { id: 'ana-sayfa', path: '/', label: 'Ana Sayfa', icon: HomeIcon },
    { id: 'randevularim', path: '/randevularim', label: 'Randevularım', icon: CalendarIcon },
    { id: 'randevu-al', path: '/randevu-al', label: 'Randevu Al', icon: AppointmentIcon },
    { id: 'tahlillerim', path: '/tahlillerim', label: 'Tahlillerim', icon: TestIcon },
    { id: 'radyolojik-goruntuler', path: '/radyolojik-goruntuler', label: 'Radyolojik Görüntüler', icon: RadiologyIcon },
    { id: 'saglik-kayitlarim', path: '/saglik-kayitlarim', label: 'Sağlık Kayıtlarım', icon: MedicalRecordIcon },
  ];

  /**
   * Menü öğesine tıklandığında ilgili sayfaya yönlendirme yapar
   * @param path - Yönlendirilecek sayfa yolu
   */
  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className={`bg-[#788F89] h-screen transition-all duration-300 ${isOpen ? 'w-[280px]' : 'w-[72px]'}`}>
      <div className="flex flex-col h-full">
        <div className="flex-1">
          <ul className="mt-4 mb-8">
            {menuItems.map((item) => (
              <li key={item.id} className="py-1">
                <button
                  className={`flex items-center w-full px-6 py-3 hover:bg-[#6A7D78] transition-colors ${currentPath === item.path ? 'bg-[#3B5249] text-white' : 'text-white'
                    }`}
                  onClick={() => handleNavigation(item.path)}
                >
                  <item.icon className="w-6 h-6 min-w-[24px]" />
                  <span className={`text-[15px] ml-4 whitespace-nowrap ${!isOpen ? 'hidden' : ''}`}>
                    {item.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-20 border-t border-[#6A7D78]">
          <button
            className={`flex items-center w-full px-6 py-4 text-white hover:bg-[#6A7D78] transition-colors ${currentPath === '/ayarlar' ? 'bg-[#3B5249]' : ''
              }`}
            onClick={() => handleNavigation('/ayarlar')}
          >
            <SettingsIcon className="w-6 h-6 min-w-[24px]" />
            <span className={`text-[15px] ml-4 whitespace-nowrap ${!isOpen ? 'hidden' : ''}`}>
              Ayarlar
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;