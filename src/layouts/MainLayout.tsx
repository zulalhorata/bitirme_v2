import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

interface MainLayoutProps {
    children?: React.ReactNode;
}

/**
 * Ana sayfa düzeni bileşeni
 * 
 * Uygulama için standart sayfa yapısını sağlar ve React Router outlet'i içerir
 */
const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    /**
     * Kenar çubuğunu açıp kapatma fonksiyonu
     */
    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden">
            <Header toggleSidebar={toggleSidebar} />
            <div className="flex flex-1 w-full min-w-0">
                <Sidebar isOpen={sidebarOpen} />
                <main className="flex-1 bg-gray-50 w-full overflow-y-auto scrollbar-hide">
                    <div className="h-full">
                        {children || <Outlet />}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout; 