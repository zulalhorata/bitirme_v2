const fetchAppointments = async () => {
    try {
        const url = 'http://localhost:5049/api/appointment/patient/1502/past';
        // alert(`API İsteği: ${url}`);

        const response = await fetch(url);
        const data = await response.json();

        // alert(`API Cevabı: ${JSON.stringify(data, null, 2)}`);
        setAppointments(data);
        setLoading(false);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        // alert(`Hata: ${error}`);
        setLoading(false);
    }
};

// ... existing code ...

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
            // Randevuları yeniden yükle
            fetchAppointments();
        } else {
            const errorData = await response.json();
            // alert(`Randevu iptal edilemedi: ${errorData.message || 'Bir hata oluştu'}`);
        }
    } catch (error) {
        console.error('Error canceling appointment:', error);
        // alert('Randevu iptal edilirken bir hata oluştu');
    }
}; 