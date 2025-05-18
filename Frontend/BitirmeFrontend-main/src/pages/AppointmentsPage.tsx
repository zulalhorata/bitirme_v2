import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Appointment {
    id: number;
    slotStartTime: string;
    slotEndTime: string;
    patientId: number;
    patientName: string;
    doctorId: number;
    doctorName: string;
    availabilityId: number;
    appointmentDate: string;
    status: number;
}

const AppointmentsPage = () => {
    const [activeTab, setActiveTab] = useState<'current' | 'past'>('current');
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAppointments = async () => {
        try {
            const url = 'http://localhost:5049/api/appointment/patient/1502/past';
            // alert(`API İsteği: ${url}`);
            console.log('API İsteği:', url);

            const response = await fetch(url);
            const data = await response.json();

            // alert(`API Cevabı: ${JSON.stringify(data, null, 2)}`);
            console.log('API Cevabı:', data);
            setAppointments(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            // alert(`Hata: ${error}`);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const handleCancelAppointment = async (appointmentId: number) => {
        try {
            const response = await fetch('http://localhost:5049/api/appointment/cancel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ appointmentId }),
            });

            if (response.ok) {
                // alert('Randevu başarıyla iptal edildi');
                console.log('Randevu başarıyla iptal edildi');
                // Randevuları yeniden yükle
                fetchAppointments();
            } else {
                const errorData = await response.json();
                // alert(`Randevu iptal edilemedi: ${errorData.message || 'Bir hata oluştu'}`);
                console.error('Randevu iptal edilemedi:', errorData.message || 'Bir hata oluştu');
            }
        } catch (error) {
            console.error('Error canceling appointment:', error);
            // alert('Randevu iptal edilirken bir hata oluştu');
        }
    };

    // Filter appointments based on status only
    const currentAppointments = appointments
        .filter(appointment => appointment.status === 0)
        .sort((a, b) => {
            const dateA = new Date(a.appointmentDate + 'T' + a.slotStartTime);
            const dateB = new Date(b.appointmentDate + 'T' + b.slotStartTime);
            return dateA.getTime() - dateB.getTime();
        });

    const pastAppointments = appointments.filter(appointment =>
        appointment.status === 1 || appointment.status === 2
    );

    const displayAppointments = activeTab === 'current' ? currentAppointments : pastAppointments;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR');
    };

    const formatTime = (timeString: string) => {
        const [hours, minutes] = timeString.split(':');
        return `${hours}:${minutes}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B91C1C] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Randevular yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F5F5F5]">
            {/* Üst başlık */}
            <div>
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center h-14 mt-2">
                        <Link to="/" className="flex items-center">
                            <div className="w-8 h-8 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                </svg>
                            </div>
                        </Link>
                        <h1 style={{ fontSize: '22px' }} className="font-medium text-black">Randevu Geçmiş Listesi</h1>
                    </div>
                </div>
            </div>

            {/* Ana içerik */}
            <div className="max-w-7xl mx-auto px-6">
                {/* Sekmeler */}
                <div className="mt-6 border-b border-gray-200">
                    <div className="flex">
                        <div className="relative">
                            <button
                                onClick={() => setActiveTab('current')}
                                className={`py-4 px-8 text-[15px] font-semibold ${activeTab === 'current'
                                    ? 'text-[#B91C1C]'
                                    : 'text-black'
                                    }`}
                            >
                                Randevularım
                            </button>
                            {activeTab === 'current' && (
                                <div className="absolute bottom-0 left-4 right-4 h-[3px] bg-[#B91C1C]" />
                            )}
                        </div>
                        <div className="relative">
                            <button
                                onClick={() => setActiveTab('past')}
                                className={`py-4 px-8 text-[15px] font-semibold ${activeTab === 'past'
                                    ? 'text-[#B91C1C]'
                                    : 'text-black'
                                    }`}
                            >
                                Geçmiş Randevularım
                            </button>
                            {activeTab === 'past' && (
                                <div className="absolute bottom-0 left-4 right-4 h-[3px] bg-[#B91C1C]" />
                            )}
                        </div>
                    </div>
                </div>

                {/* Randevu listesi */}
                <div className="py-4 overflow-y-auto scrollbar-hide max-h-[70vh]">
                    {displayAppointments.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-600">Henüz randevu bulunmamaktadır.</p>
                        </div>
                    ) : (
                        displayAppointments.map((appointment) => (
                            <div key={appointment.id} className="bg-white rounded-lg border border-gray-100 mb-4 overflow-hidden">
                                <div className="p-6">
                                    {/* Üst kısım - Tarih ve Aktif Randevu */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center bg-[#1B4D3E] text-white px-3 py-1.5 rounded-[17px]">
                                                <svg className="h-5 w-5 text-white mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" strokeWidth={1.5}>
                                                    <rect x="3" y="6" width="18" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
                                                    <path d="M3 10H21" stroke="currentColor" strokeWidth="1.5" />
                                                    <path d="M7 3V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                    <path d="M17 3V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                </svg>
                                                <span className="text-[15px] font-semibold">{formatDate(appointment.appointmentDate)} {formatTime(appointment.slotStartTime)}</span>
                                            </div>
                                            {appointment.status === 0 && activeTab === 'current' && (
                                                <div className="flex items-center">
                                                    <svg className="h-4 w-4 text-[#B91C1C] mr-1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" strokeWidth={1.5}>
                                                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5" />
                                                        <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                    </svg>
                                                    <span className="text-[13px] font-semibold text-[#B91C1C]">Aktif Randevu</span>
                                                </div>
                                            )}
                                            {appointment.status === 2 && activeTab === 'past' && (
                                                <div className="flex items-center">
                                                    <svg className="h-4 w-4 text-[#B91C1C] mr-1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" strokeWidth={1.5}>
                                                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5" />
                                                        <path d="M15 9L9 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                        <path d="M9 9L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                    </svg>
                                                    <span className="text-[13px] font-semibold text-[#B91C1C]">İptal Edildi</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col space-y-4">
                                        {/* Hastane ve bölüm bilgileri */}
                                        <div className="flex-1">
                                            {/* Doktor bilgisi */}
                                            <div className="flex items-start mb-3">
                                                <svg className="h-5 w-5 text-black mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" strokeWidth={1.5}>
                                                    <path d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21" stroke="currentColor" strokeWidth="1.5" />
                                                    <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="1.5" />
                                                </svg>
                                                <span className="text-[15px] text-black font-semibold leading-5">{appointment.doctorName}</span>
                                            </div>
                                        </div>

                                        {/* Alt kısım - Randevu detayları */}
                                        <div className="flex justify-between items-start border-t pt-4">
                                            <div className="flex items-start">
                                                <div className="flex flex-col space-y-1">
                                                    <span className="text-[15px] text-black font-medium">Randevu Saati: {formatTime(appointment.slotStartTime)} - {formatTime(appointment.slotEndTime)}</span>
                                                </div>
                                            </div>

                                            {/* İptal butonu */}
                                            {activeTab === 'current' && appointment.status === 0 && (
                                                <button
                                                    onClick={() => handleCancelAppointment(appointment.id)}
                                                    className="bg-[#B91C1C] text-white text-[15px] font-semibold px-5 py-2.5 rounded hover:bg-[#991B1B] transition-colors whitespace-nowrap"
                                                >
                                                    Randevuyu İptal Et
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AppointmentsPage;