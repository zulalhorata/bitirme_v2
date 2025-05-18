/**
 * Randevu Al sayfası bileşeni
 * 
 * Kullanıcının yeni randevu alabileceği sayfa
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

/* ------------------------------------------------------------------ */
/*  Tip tanımları                                                     */
/* ------------------------------------------------------------------ */
interface City { id: number; name: string; }
interface District { id: number; name: string; cityId: number; }
interface Clinic { id: number; name: string; cityId: number; districtId: number; }
interface Hospital {
  id: number;
  doctorId: number;
  doctorName: string;
  availableDate: string;
  startTime: string;
  endTime: string;
  isDeleted: boolean;
  isBooked: boolean;
}
interface Doctor { id: number; hospitalId: number; name: string; }
interface Slot {
  id: number;
  doctorId: number;
  doctorName: string;
  availableDate: string;
  startTime: string;
  endTime: string;
  isDeleted: boolean;
  isBooked: boolean;
}

interface SelectedHospitalData {
  doctor: string;
  date: string;
  location: string;
  department: string;
  clinic: string;
  daysLeft: string;
  note: string;
  slots: Slot[];
}

const timeSlots = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '16:00'];

const CreateAppointmentPage = () => {
  const navigate = useNavigate();

  /* ---------------------------------------------------------------- */
  /*  Dinamik dropdown state'leri                                     */
  /* ---------------------------------------------------------------- */
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const [cityId, setCityId] = useState<number | null>(null);
  const [districtId, setDistrictId] = useState<number | null>(null);
  const [clinicId, setClinicId] = useState<number | null>(null);
  const [hospitalId, setHospitalId] = useState<number | null>(null);
  const [doctorId, setDoctorId] = useState<number | null>(null);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('-FARKETMEZ-');
  const [selectedClinic, setSelectedClinic] = useState('');
  const [selectedHospital, setSelectedHospital] = useState('-FARKETMEZ-');
  const [selectedDoctor, setSelectedDoctor] = useState('-FARKETMEZ-');
  const [showHospitalList, setShowHospitalList] = useState(false);
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [selectedHospitalData, setSelectedHospitalData] = useState<SelectedHospitalData | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [appointmentOwner] = useState("ŞERİFE ZÜLAL HORATA");
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [expandedHours, setExpandedHours] = useState<number[]>([]);

  /* ---------------------------------------------------------------- */
  /*  Filtreler                                                       */
  /* ---------------------------------------------------------------- */
  const filteredDistricts = cityId
    ? districts.filter(d => d.cityId === cityId)
    : [];

  const filteredClinics = cityId
    ? clinics.filter(c =>
      c.cityId === cityId &&
      (!districtId || c.districtId === districtId))
    : [];

  const filteredHospitals = hospitals; // API zaten filtreli döndürüyor

  const filteredDoctors = hospitalId
    ? doctors.filter(d => d.hospitalId === hospitalId)
    : doctors;

  /* ---------------------------------------------------------------- */
  /*  Sayfa açılışında ilk verileri çek                               */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await axios.get('http://localhost:5049/api/dropdown/initial');
        setCities(response.data.cities);
        setDistricts(response.data.districts);
        setClinics(response.data.clinics);
      } catch (error) {
        console.error('Initial dropdown fetch error:', error);
      }
    };

    fetchInitialData();
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Şehir / ilçe / klinik değiştiğinde hastaneleri çek             */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    if (!cityId || !clinicId) {
      setHospitals([]);
      setHospitalId(null);
      return;
    }

    const fetchHospitals = async () => {
      try {
        const params = new URLSearchParams();
        params.append('cityId', cityId.toString());
        params.append('clinicId', clinicId.toString());
        if (districtId) params.append('districtId', districtId.toString());

        const response = await axios.get(`http://localhost:5049/api/dropdown/hospitals?${params.toString()}`);
        const data = response.data;
        const list = Array.isArray(data) ? data : data.hospitals;
        setHospitals(list);
      } catch (error) {
        console.error('Hastane verisi alınamadı:', error);
      }
    };

    fetchHospitals();
  }, [cityId, districtId, clinicId]);

  /* ---------------------------------------------------------------- */
  /*  Hastane ve klinik seçildiğinde doktorları çek                   */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    if (!hospitalId || !clinicId) {
      setDoctors([]);
      return;
    }

    const fetchDoctors = async () => {
      try {
        const params = new URLSearchParams({
          hospitalId: hospitalId.toString(),
          clinicId: clinicId.toString()
        });

        const response = await axios.get(`http://localhost:5049/api/dropdown/doctors?${params.toString()}`);
        const data = response.data;
        const list = Array.isArray(data) ? data : data.doctors;
        setDoctors(list);
      } catch (error) {
        console.error('Doktor verisi alınamadı:', error);
      }
    };

    fetchDoctors();
  }, [hospitalId, clinicId]);

  const handleDateClick = (inputId: string) => {
    const dateInput = document.getElementById(inputId) as HTMLInputElement;
    if (dateInput) {
      dateInput.showPicker();
    }
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setCityId(null);
    setDistrictId(null);
    setClinicId(null);
    setHospitalId(null);
    setDoctorId(null);
    setShowHospitalList(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Tarihleri yyyy-mm-dd formatına çevir
    const formatDate = (dateStr: string) => {
      if (!dateStr) return '';
      const [day, month, year] = dateStr.split('.');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    };

    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);

    // Gönderilecek veriyi hazırla - sadece girilen değerleri ekle
    const requestData: any = {
      cityId: cityId || 0,
      districtId: districtId || 0,
      clinicId: clinicId || 0
    };

    // Eğer hastane seçilmişse ekle
    if (hospitalId) {
      requestData.hospitalId = hospitalId;
    }

    // Eğer doktor seçilmişse ekle
    if (doctorId) {
      requestData.doctorId = doctorId;
    }

    // Eğer başlangıç tarihi girilmişse ekle
    if (formattedStartDate) {
      requestData.startDate = formattedStartDate;
    }

    // Eğer bitiş tarihi girilmişse ekle
    if (formattedEndDate) {
      requestData.endDate = formattedEndDate;
    }

    console.log('Randevu arama isteği:', requestData);

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

      console.log('Slot arama isteği:', { doctorId: hospitalData.doctorId, startDate, endDate });

      // API'ye istek at
      const response = await axios.get(`http://localhost:5049/api/availability/get-available-slots`, {
        params: {
          doctorId: hospitalData.doctorId,
          startDate: startDate,
          endDate: endDate,
          includeBooked: true // Tüm slotları getir
        }
      });

      console.log('Slot arama yanıtı:', response.data);

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
      console.error('Randevu slotları alınırken bir hata oluştu. Lütfen tekrar deneyiniz.');
    }
  };

  const handleTimeSelect = (slot: Slot) => {
    if (slot.isBooked) return; // Eğer slot doluysa seçime izin verme

    setSelectedSlot(slot);
    setShowConfirmation(true);
  };

  const handleConfirmAppointment = async () => {
    if (!selectedSlot) return;

    try {
      // API isteği için veriyi hazırla
      const bookingData = {
        patientId: 1502, // Default hasta ID
        slotId: selectedSlot.id
      };

      console.log('Randevu onay isteği:', bookingData);

      // API isteğini gönder
      const response = await axios.post('http://localhost:5049/api/appointment/book', bookingData);

      console.log('Randevu onay yanıtı:', response.data);

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

      // Mevcut randevuları local storage'dan al
      let existingAppointments = [];
      try {
        const storedAppointments = localStorage.getItem('appointmentHistory');
        existingAppointments = storedAppointments ? JSON.parse(storedAppointments) : [];
      } catch (error) {
        console.error('Mevcut randevular okunamadı:', error);
      }

      // Yeni randevuyu listeye ekle
      const updatedAppointments = [...existingAppointments, appointmentData];

      // Randevuları tarihe göre sırala (en yeni en üstte)
      updatedAppointments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Güncellenmiş listeyi kaydet
      localStorage.setItem('appointmentHistory', JSON.stringify(updatedAppointments));

      console.log('Randevu başarıyla kaydedildi:', appointmentData);
      console.log('Tüm randevular:', updatedAppointments);

      setShowConfirmation(false);
      setShowSuccess(true);

      // 2 saniye sonra randevularım sayfasına yönlendir
      setTimeout(() => {
        navigate('/randevularim');
      }, 2000);
    } catch (error) {
      console.error('Randevu kaydedilirken hata oluştu:', error);
      if (axios.isAxiosError(error)) {
        console.error('Randevu alınırken hata detayı:', error.response?.data || error.message);
      } else {
        console.error('Randevu alınırken beklenmeyen bir hata oluştu.');
      }
    }
  };

  // Günleri ayıkla ve benzersiz günleri bul
  const getUniqueDays = (slots: Slot[]) => {
    const days = slots.map(slot => slot.availableDate.split('T')[0]);
    return [...new Set(days)].sort();
  };

  // Seçili güne ait slotları filtrele
  const getSlotsForSelectedDay = (slots: Slot[]) => {
    if (!selectedDay) return slots;
    return slots.filter(slot => slot.availableDate.split('T')[0] === selectedDay);
  };

  const toggleHour = (hour: number) => {
    setExpandedHours(prev =>
      prev.includes(hour)
        ? prev.filter(h => h !== hour)
        : [...prev, hour]
    );
  };

  // Tüm olası slotları oluştur
  const generateAllSlots = (date: string) => {
    const slots: Slot[] = [];
    const hours = Array.from({ length: 8 }, (_, i) => i + 9); // 9-16 arası
    const minutes = ['00', '15', '30', '45'];

    hours.forEach(hour => {
      minutes.forEach(minute => {
        const startTime = `${hour.toString().padStart(2, '0')}:${minute}`;
        const endHour = minute === '45' ? hour + 1 : hour;
        const endMinute = minute === '45' ? '00' : (parseInt(minute) + 15).toString().padStart(2, '0');
        const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute}`;

        slots.push({
          id: Math.random(), // Geçici ID
          doctorId: 0,
          doctorName: '',
          availableDate: date,
          startTime: startTime + ':00',
          endTime: endTime + ':00',
          isDeleted: false,
          isBooked: true // Varsayılan olarak dolu
        });
      });
    });

    return slots;
  };

  // Backend'den gelen slotları ve oluşturulan slotları birleştir
  const mergeSlots = (backendSlots: Slot[], date: string) => {
    const allSlots = generateAllSlots(date);
    const backendSlotsMap = new Map(
      backendSlots.map(slot => [
        `${slot.availableDate.split('T')[0]}-${slot.startTime}`,
        slot
      ])
    );

    return allSlots.map(slot => {
      const key = `${slot.availableDate}-${slot.startTime}`;
      const backendSlot = backendSlotsMap.get(key);
      return backendSlot || slot;
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Üst başlık */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center h-14">
          <button
            onClick={() => {
              if (showTimeSlots) {
                setShowTimeSlots(false);
              } else if (showHospitalList) {
                setShowHospitalList(false);
              }
            }}
            className="flex items-center"
          >
            <div className="w-8 h-8 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </div>
          </button>
          <h1 style={{ fontSize: '22px' }} className="font-medium text-black">
            {showTimeSlots ? 'Randevu Al' : showHospitalList ? 'Hastane Listesi' : 'Randevu Ara'}
          </h1>
        </div>
      </div>

      {/* Ana içerik */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="bg-white rounded-lg overflow-hidden">
          {showTimeSlots && selectedHospitalData ? (
            // Randevu Saatleri
            <div className={`p-6 ${showConfirmation || showSuccess ? 'blur-sm' : ''}`}>
              {/* Üst Kısım - Hekim Bilgisi ve Butonlar */}
              <div className="flex justify-between items-center mb-6">
                <div className="space-y-1">
                  <div className="flex items-center">
                    <span className="text-[15px] font-medium text-black">Hekim: </span>
                    <span className="text-[15px] ml-2 font-semibold text-black">{selectedHospitalData.doctor}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-[15px] font-medium text-black">{selectedHospitalData.date}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowTimeSlots(false);
                      setShowHospitalList(true);
                    }}
                    className="px-4 py-2 text-[15px] font-medium text-white bg-[#B91C1C] rounded hover:bg-opacity-90"
                  >
                    Geri
                  </button>
                </div>
              </div>

              {/* Gün Seçimi */}
              <div className="mb-6">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {getUniqueDays(selectedHospitalData.slots).map((day) => {
                    const date = new Date(day);
                    const isSelected = day === selectedDay;

                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        className={`flex flex-col items-center justify-center px-4 py-3 rounded-lg min-w-[100px] border transition-colors
                          ${isSelected
                            ? 'bg-[#1B4D3E] text-white border-[#1B4D3E]'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-[#1B4D3E]'}`}
                      >
                        <span className="text-[13px] font-medium">
                          {date.toLocaleDateString('tr-TR', { weekday: 'short' })}
                        </span>
                        <span className="text-[15px] font-semibold">
                          {date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots */}
              <div className="space-y-4 overflow-y-auto scrollbar-hide max-h-[60vh]">
                {[...Array.from({ length: 3 }, (_, i) => i + 9), ...Array.from({ length: 4 }, (_, i) => i + 13)].map((hour) => {
                  const hourStr = hour.toString().padStart(2, '0');
                  const slotsForHour = selectedDay
                    ? mergeSlots(
                      getSlotsForSelectedDay(selectedHospitalData.slots).filter(
                        slot => slot.startTime.startsWith(`${hourStr}:`)
                      ),
                      selectedDay
                    ).filter(slot => slot.startTime.startsWith(`${hourStr}:`))
                    : [];

                  const availableCount = slotsForHour.filter(slot => !slot.isBooked).length;
                  const isExpanded = expandedHours.includes(hour);

                  return (
                    <div key={hour} className="border rounded-lg overflow-hidden">
                      {/* Ana Saat Başlığı */}
                      <div
                        className="bg-gray-50 px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-100"
                        onClick={() => toggleHour(hour)}
                      >
                        <div className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-5 w-5 mr-2 text-gray-400 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path fillRule="evenodd" d="M7.293 4.707a1 1 0 010 1.414L4.414 9H14a1 1 0 110 2H4.414l2.879 2.879a1 1 0 11-1.414 1.414l-4.586-4.586a1 1 0 010-1.414l4.586-4.586a1 1 0 011.414 0z" clipRule="evenodd" transform="rotate(270)" />
                          </svg>
                          <span className="text-[15px] font-medium text-gray-900">{hourStr}:00</span>
                        </div>
                        <span className="text-[13px] text-gray-500">
                          {availableCount} müsait randevu
                        </span>
                      </div>

                      {/* Alt Slotlar */}
                      {isExpanded && slotsForHour.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 p-4 overflow-y-auto scrollbar-hide max-h-[60vh]">
                          {slotsForHour.map((slot) => (
                            <div
                              key={slot.id}
                              onClick={() => !slot.isBooked && handleTimeSelect(slot)}
                              className={`flex items-center justify-center px-4 py-3 border rounded cursor-pointer
                                ${slot.isBooked
                                  ? 'bg-red-50 border-red-200 text-red-400 cursor-not-allowed'
                                  : 'hover:bg-gray-50 hover:border-[#1B4D3E] text-gray-900'}
                                ${selectedSlot === slot ? 'border-[#1B4D3E] ring-1 ring-[#1B4D3E]' : 'border-gray-200'}`}
                            >
                              <span className={`text-[15px] ${slot.isBooked ? 'line-through' : ''}`}>
                                {slot.startTime.substring(0, 5)} - {slot.endTime.substring(0, 5)}
                              </span>
                              {slot.isBooked && (
                                <span className="ml-2 text-[12px] text-red-400">(Dolu)</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : !showHospitalList ? (
            // Form içeriği
            <div className="p-6">
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* İl seçimi */}
                <div>
                  <label className="block text-[15px] font-medium text-black mb-1">
                    İl <span className="text-[#B91C1C]">*</span>
                  </label>
                  <select
                    value={cityId ?? ''}
                    onChange={(e) => {
                      const id = Number(e.target.value) || null;
                      setCityId(id);
                      setDistrictId(null);
                      setClinicId(null);
                      setHospitalId(null);
                    }}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 text-[15px] text-black focus:outline-none focus:ring-1 focus:ring-[#1B4D3E]"
                    required
                  >
                    <option value="">Seçiniz</option>
                    {cities.map(city => (
                      <option key={city.id} value={city.id}>{city.name}</option>
                    ))}
                  </select>
                </div>

                {/* İlçe seçimi */}
                <div>
                  <label className="block text-[15px] font-medium text-black mb-1">
                    İlçe
                  </label>
                  <select
                    value={districtId ?? ''}
                    onChange={(e) => {
                      const id = Number(e.target.value) || null;
                      setDistrictId(id);
                      setClinicId(null);
                      setHospitalId(null);
                    }}
                    disabled={!cityId}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 text-[15px] text-black focus:outline-none focus:ring-1 focus:ring-[#1B4D3E]"
                  >
                    <option value="">-FARKETMEZ-</option>
                    {filteredDistricts.map(district => (
                      <option key={district.id} value={district.id}>{district.name}</option>
                    ))}
                  </select>
                </div>

                {/* Klinik seçimi */}
                <div>
                  <label className="block text-[15px] font-medium text-black mb-1">
                    Klinik <span className="text-[#B91C1C]">*</span>
                  </label>
                  <select
                    value={clinicId ?? ''}
                    onChange={(e) => {
                      const id = Number(e.target.value) || null;
                      setClinicId(id);
                      setHospitalId(null);
                    }}
                    disabled={!cityId}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 text-[15px] text-black focus:outline-none focus:ring-1 focus:ring-[#1B4D3E]"
                    required
                  >
                    <option value="">Seçiniz</option>
                    {filteredClinics.map(clinic => (
                      <option key={clinic.id} value={clinic.id}>{clinic.name}</option>
                    ))}
                  </select>
                </div>

                {/* Hastane seçimi */}
                <div>
                  <label className="block text-[15px] font-medium text-black mb-1">
                    Hastane
                  </label>
                  <select
                    value={hospitalId ?? ''}
                    onChange={(e) => setHospitalId(Number(e.target.value) || null)}
                    disabled={!hospitals.length}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 text-[15px] text-black focus:outline-none focus:ring-1 focus:ring-[#1B4D3E]"
                  >
                    <option value="">-FARKETMEZ-</option>
                    {filteredHospitals.map(hospital => (
                      <option key={hospital.id} value={hospital.id}>{hospital.doctorName}</option>
                    ))}
                  </select>
                </div>

                {/* Hekim seçimi */}
                <div>
                  <label className="block text-[15px] font-medium text-black mb-1">
                    Hekim
                  </label>
                  <select
                    value={doctorId ?? ''}
                    onChange={(e) => setDoctorId(Number(e.target.value) || null)}
                    disabled={!doctors.length}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 text-[15px] text-black focus:outline-none focus:ring-1 focus:ring-[#1B4D3E]"
                  >
                    <option value="">-FARKETMEZ-</option>
                    {filteredDoctors.map(doctor => (
                      <option key={doctor.id} value={doctor.id}>{doctor.name}</option>
                    ))}
                  </select>
                </div>

                {/* Tarih seçimleri */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[15px] font-medium text-black mb-1">
                      Başlangıç Tarihi
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={startDate}
                        readOnly
                        className="w-full border border-gray-300 rounded-md py-2 pl-3 pr-10 text-[15px] text-black focus:outline-none focus:ring-1 focus:ring-[#1B4D3E] cursor-pointer"
                        placeholder="gg/aa/yyyy"
                        onClick={() => handleDateClick('startDate')}
                      />
                      <input
                        type="date"
                        id="startDate"
                        className="absolute opacity-0 inset-0 w-full h-full cursor-pointer"
                        onChange={(e) => {
                          const date = new Date(e.target.value);
                          setStartDate(date.toLocaleDateString('tr-TR'));
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[15px] font-medium text-black mb-1">
                      Bitiş Tarihi
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={endDate}
                        readOnly
                        className="w-full border border-gray-300 rounded-md py-2 pl-3 pr-10 text-[15px] text-black focus:outline-none focus:ring-1 focus:ring-[#1B4D3E] cursor-pointer"
                        placeholder="gg/aa/yyyy"
                        onClick={() => handleDateClick('endDate')}
                      />
                      <input
                        type="date"
                        id="endDate"
                        className="absolute opacity-0 inset-0 w-full h-full cursor-pointer"
                        onChange={(e) => {
                          const date = new Date(e.target.value);
                          setEndDate(date.toLocaleDateString('tr-TR'));
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Butonlar */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <button
                    type="submit"
                    className="w-full bg-[#1B4D3E] text-white text-[15px] font-semibold py-2.5 px-4 rounded hover:bg-[#153D31] transition-colors"
                  >
                    Randevu Ara
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-full bg-[#B91C1C] text-white text-[15px] font-semibold py-2.5 px-4 rounded hover:bg-[#991B1B] transition-colors"
                  >
                    Seçimleri Temizle
                  </button>
                </div>
              </form>
            </div>
          ) : (
            // Hastane Listesi
            <>
              {/* Search Filter */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative w-64">
                  <input
                    type="text"
                    placeholder="Arama Filtreleme"
                    className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded text-[15px] text-gray-700 focus:outline-none"
                  />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Hospital List */}
              <div className="overflow-auto max-h-[calc(100vh-250px)]">
                {filteredHospitals.map((hospital) => (
                  <div
                    key={hospital.id}
                    className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleHospitalClick(hospital)}
                  >
                    <div className="flex flex-col gap-2">
                      {/* Üst satır - Doktor */}
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        <span className="text-[15px] font-semibold text-gray-900">{hospital.doctorName}</span>
                      </div>

                      {/* Alt satır - Tarih ve Saat */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          <span className="px-3 py-1 text-[13px] font-medium text-white bg-[#1B4D3E] rounded">
                            {new Date(hospital.availableDate).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          <span className="px-3 py-1 text-[13px] font-medium text-white bg-[#B91C1C] rounded">
                            {hospital.startTime} - {hospital.endTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredHospitals.length === 0 && (
                  <div className="p-4 text-center text-gray-500">
                    Seçilen kriterlere uygun randevu bulunamadı.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Randevu Onaylama Popup */}
      {showConfirmation && selectedHospitalData && selectedSlot && (
        <div className="fixed inset-0 flex items-center justify-center z-[60]">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
          <div className="relative bg-white w-full max-w-lg mx-4 rounded-lg overflow-hidden shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-[22px] font-medium text-black">Randevu Onayla</h2>
              <button
                onClick={() => setShowConfirmation(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-4">
                <div>
                  <div className="text-[15px] font-medium text-black">Randevu Zamanı</div>
                  <div className="text-[15px] text-gray-600">{selectedHospitalData.date} {selectedSlot.startTime.substring(0, 5)}</div>
                </div>
                <div>
                  <div className="text-[15px] font-medium text-black">Hastane</div>
                  <div className="text-[15px] text-gray-600">{selectedHospitalData.location}</div>
                </div>
                <div>
                  <div className="text-[15px] font-medium text-black">Poliklinik Adı</div>
                  <div className="text-[15px] text-gray-600">{selectedHospitalData.department}</div>
                </div>
                <div>
                  <div className="text-[15px] font-medium text-black">Hekim</div>
                  <div className="text-[15px] text-gray-600">{selectedHospitalData.doctor}</div>
                </div>
                <div>
                  <div className="text-[15px] font-medium text-black">Randevu Sahibi</div>
                  <div className="text-[15px] text-gray-600">{appointmentOwner}</div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={handleConfirmAppointment}
                  className="px-6 py-2 bg-[#1B4D3E] text-white text-[15px] font-medium rounded hover:bg-opacity-90 transition-colors"
                >
                  Randevu Onayla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Başarılı Onay Mesajı */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-[60]">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
          <div className="relative bg-white w-full max-w-sm mx-4 rounded-lg p-6 text-center shadow-xl">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Randevunuz başarıyla onaylanmıştır
            </h3>
            <p className="text-sm text-gray-500">
              Randevularım sayfasına yönlendiriliyorsunuz...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateAppointmentPage;

