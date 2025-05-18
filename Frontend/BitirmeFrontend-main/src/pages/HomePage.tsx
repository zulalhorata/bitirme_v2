import { useState, useEffect } from 'react';

/**
 * Ana Sayfa bileşeni
 * 
 * Kullanıcı giriş yaptıktan sonra karşılayacak ilk sayfa
 */
const HomePage = () => {
  const [waterTarget] = useState('2.5'); // Hedef su tüketimi (L)
  const [waterConsumed] = useState('1.5'); // Tüketilen su miktarı (L)
  const [currentSlide, setCurrentSlide] = useState(0);

  // Banner içeriği
  const bannerContent = [
    {
      title: "Laboratuvar Sonuçları",
      subtitle: "Test sonuçlarınıza anında erişim sağlayın.",
      image: "/images/tahlil.jpg"
    },
    {
      title: "Online Randevu",
      subtitle: "Hızlı ve kolay randevu sistemi ile zaman kazanın.",
      image: "/images/image1.jpg"
    },
    {
      title: "Sağlık İstatistikleriniz",
      subtitle: "Sağlık verilerinizi dijital ortamda takip edin.",
      image: "/images/saglik-kayitlari.jpg"
    }
  ];

  // Otomatik slayt geçişi için zamanlayıcı
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) =>
        prevSlide === bannerContent.length - 1 ? 0 : prevSlide + 1
      );
    }, 5000); // Her 5 saniyede bir slayt değişimi

    // Component unmount olduğunda zamanlayıcıyı temizle
    return () => clearInterval(timer);
  }, [bannerContent.length]);

  // Önceki slide'a geçiş
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? bannerContent.length - 1 : prev - 1));
  };

  // Sonraki slide'a geçiş
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === bannerContent.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 justify-center items-center">
      <div className="flex-1 w-full flex items-center justify-center">
        <div className="w-full max-w-5xl mx-auto px-4 py-8">
          {/* Kaydırılabilir Banner */}
          <div className="relative w-full h-72 sm:h-80 md:h-96 mb-8 overflow-hidden rounded-2xl shadow-md">
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/20 z-10" />

            {/* Tüm resimleri render et ama sadece aktif olanı göster */}
            {bannerContent.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${currentSlide === index ? 'opacity-100' : 'opacity-0'
                  }`}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-in-out transform"
                />
              </div>
            ))}

            <div className="absolute inset-0 flex flex-col justify-center p-6 pl-16 z-20">
              <div className="text-left max-w-lg transition-transform duration-700 ease-in-out transform">
                <h2 className="text-3xl sm:text-4xl font-bold text-white transition-opacity duration-700 ease-in-out">
                  {bannerContent[currentSlide].title}
                </h2>
                <p className="text-white text-lg mt-2 transition-opacity duration-700 ease-in-out">
                  {bannerContent[currentSlide].subtitle}
                </p>
              </div>

              {/* Gezinme Noktaları */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
                {bannerContent.map((_, index) => (
                  <div
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full ${currentSlide === index ? "bg-white" : "bg-white/40"
                      } transition-all duration-300 hover:bg-white/80 cursor-pointer`}
                    style={{ aspectRatio: '1/1' }}
                  />
                ))}
              </div>
            </div>

            {/* Gezinme Okları */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/40 rounded-full w-10 h-10 flex items-center justify-center z-30 hover:bg-white/60 transition-colors shadow-md cursor-pointer"
              onClick={prevSlide}
            >
              <span className="text-white text-xl font-bold flex items-center justify-center h-full">&lt;</span>
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/40 rounded-full w-10 h-10 flex items-center justify-center z-30 hover:bg-white/60 transition-colors shadow-md cursor-pointer"
              onClick={nextSlide}
            >
              <span className="text-white text-xl font-bold flex items-center justify-center h-full">&gt;</span>
            </div>
          </div>

          {/* Ana Özellik Kartları */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Vücut Kütle İndeksi Kartı */}
            <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold mb-4 text-[#2D2D2D]">Vücut Kütle İndeksi</h3>
              <button className="w-full bg-[#8B4543] text-white py-4 rounded-xl font-medium hover:bg-[#7A3C3A] transition-colors">
                Hesapla
              </button>
            </div>

            {/* İlaç Hatırlatma Kartı */}
            <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-[#2D2D2D]">İlaç hatırlatma</h3>
                <span className="text-[#4F7942] text-2xl">💊</span>
              </div>
              <div className="mb-4">
                <button className="flex items-center text-[#4F7942] font-medium">
                  <span className="mr-2 text-xl">+</span>
                  İlaç bilgilerini giriniz
                </button>
              </div>
              <button className="w-full bg-[#4F7942] text-white py-4 rounded-xl font-medium hover:bg-[#446A3A] transition-colors">
                Hatırlatıcı kur
              </button>
            </div>

            {/* Günlük Su Tüketimi Kartı */}
            <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-[#2D2D2D]">Günlük su tüketimi</h3>
                <span className="text-[#4169E1] text-2xl">💧</span>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[#4A4A4A]">Hedef koy:</span>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={waterTarget}
                      className="w-12 text-right text-[#4A4A4A] font-medium bg-transparent"
                      readOnly
                    />
                    <span className="text-[#4A4A4A] ml-1">L</span>
                  </div>
                </div>

                <button className="flex items-center text-[#4169E1] w-full">
                  <span className="mr-2">🥤</span>
                  <span className="text-sm">(1 bardak/ 250ml)</span>
                </button>

                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#4169E1] rounded-full"
                    style={{ width: `${(parseFloat(waterConsumed) / parseFloat(waterTarget)) * 100}%` }}
                  />
                </div>

                <div className="flex justify-between text-sm text-[#4A4A4A]">
                  <span>İçtiğim: {waterConsumed}L</span>
                  <span>Kalan: {(parseFloat(waterTarget) - parseFloat(waterConsumed)).toFixed(1)}L</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 