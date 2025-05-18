import React, { useState } from 'react';
import axios from 'axios';

const CreateAppointmentPage: React.FC = () => {
    const [hospitals, setHospitals] = useState<any[]>([]);
    const [showHospitalList, setShowHospitalList] = useState(false);
    const [selectedHospitalData, setSelectedHospitalData] = useState<any>(null);
    const [showTimeSlots, setShowTimeSlots] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<any>(null);
    const [appointmentOwner, setAppointmentOwner] = useState('');

    const handleSearch = async () => {
        // Debug için gönderilen veriyi alert ile göster
        // alert(JSON.stringify(requestData, null, 2));

        try {
            const response = await axios.post('http://localhost:5049/api/availability/search', requestData);
            console.log('API Response:', response.data); // API yanıtını kontrol et

            // API'den gelen veriyi kontrol et ve uygun formata çevir
            const hospitalData = Array.isArray(response.data) ? response.data :
                response.data.hospitals ? response.data.hospitals :
                    response.data.data ? response.data.data : [];

            // API'den gelen veriyi state'e kaydet
            setHospitals(hospitalData);
            setShowHospitalList(true);
        } catch (error) {
            console.error('Randevu arama hatası:', error);
            if (axios.isAxiosError(error)) {
                console.error('API hata detayı:', error.response?.data);
            }
        }
    };

    const handleHospitalClick = async (hospitalData: any) => {
        try {
            // Tarihi yyyy-mm-dd formatına çevir
            const availableDate = hospitalData.availableDate.split('T')[0]; // Direkt string olarak al
            const startDate = availableDate;

            // End date'i hesapla (5 gün sonrası)
            const endDateObj = new Date(availableDate);
            endDateObj.setDate(endDateObj.getDate() + 5);
            const endDate = endDateObj.toISOString().split('T')[0];

            // API'ye gönderilecek parametreleri göster
            // alert(`API İsteği Parametreleri:\n
            //   doctorId: ${hospitalData.doctorId}\n
            //   startDate: ${startDate}\n
            //   endDate: ${endDate}`);

            // API'ye istek at
            const response = await axios.get(`http://localhost:5049/api/availability/get-available-slots`, {
                params: {
                    doctorId: hospitalData.doctorId,
                    startDate: startDate,
                    endDate: endDate,
                    includeBooked: true // Tüm slotları getir
                }
            });

            // API yanıtını göster
            // alert(`API Yanıtı:\n${JSON.stringify(response.data, null, 2)}`);

            // Slot verilerini state'e kaydet
            setSelectedHospitalData({
                doctor: hospitalData.doctorName,
                date: new Date(hospitalData.availableDate).toLocaleDateString('tr-TR'),
                location: hospitalData.location,
                department: hospitalData.department,
                clinic: hospitalData.clinic,
                daysLeft: hospitalData.daysLeft,
                note: hospitalData.note,
                slots: response.data // API'den gelen slot verilerini ekle
            });

            setShowTimeSlots(true);
            setShowHospitalList(false);
        } catch (error) {
            console.error('Slot verileri alınırken hata oluştu:', error);
            // Hata durumunda kullanıcıya bilgi ver
            alert('Randevu slotları alınırken bir hata oluştu. Lütfen tekrar deneyiniz.');
        }
    };

    const handleConfirmAppointment = async () => {
        if (!selectedSlot) return;

        try {
            // API isteği için veriyi hazırla
            const bookingData = {
                patientId: 1502, // Default hasta ID
                slotId: selectedSlot.id
            };

            // Debug için veriyi göster
            // alert(`Randevu API İsteği:\n${JSON.stringify(bookingData, null, 2)}`);

            // API isteğini gönder
            const response = await axios.post('http://localhost:5049/api/appointment/book', bookingData);

            // API yanıtını göster
            // alert(`API Yanıtı:\n${JSON.stringify(response.data, null, 2)}`);

            // Randevu bilgilerini kaydet
            const appointmentData = {
                id: Math.random().toString(36).substr(2, 9),
                date: `${selectedHospitalData?.date} ${selectedSlot.startTime.substring(0, 5)}`,
                time: selectedSlot.startTime.substring(0, 5),
                doctor: selectedHospitalData?.doctor || '',
                hospital: selectedHospitalData?.location || '',
                department: selectedHospitalData?.department || '',
                clinic: selectedHospitalData?.clinic || '',
                status: 'Aktif Randevu',
                owner: appointmentOwner,
                daysLeft: selectedHospitalData?.daysLeft || '',
                note: selectedHospitalData?.note || '',
                createdAt: new Date().toISOString(),
                slotId: selectedSlot.id
            };

            // ... existing code ...
        } catch (error) {
            console.error('Randevu kaydetme hatası:', error);
            if (axios.isAxiosError(error)) {
                console.error('API hata detayı:', error.response?.data);
            }
        }
    };

    return (
    // ... existing JSX ...
  );
};

export default CreateAppointmentPage; 