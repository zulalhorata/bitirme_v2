/**
 * Radyolojik Görüntüler sayfası bileşeni
 * 
 * Kullanıcının radyolojik görüntülerini inceleyebileceği ve yükleyebileceği sayfa
 */
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RadiologyPage = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Metadata for the uploaded image
  const [imageMetadata, setImageMetadata] = useState({
    hospital: '',
    date: '',
    description: '',
    imageType: '',
    bodyPart: ''
  });

  // Define filters state with functions to handle filter changes
  const [activeFilters, setActiveFilters] = useState({
    date: "",
    hospital: "",
    description: "",
    imageType: "",
    status: ""
  });

  // Generate file preview when a file is selected
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    // Only create preview for image types
    if (!selectedFile.type.startsWith('image/')) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    // Free memory when component unmounts
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedFile]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);

    // Reset metadata form when a new file is selected
    setImageMetadata({
      hospital: '',
      date: new Date().toISOString().split('T')[0], // Default to today
      description: '',
      imageType: '',
      bodyPart: ''
    });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleMetadataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setImageMetadata(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      alert('Lütfen bir dosya seçin');
      return;
    }

    if (!imageMetadata.hospital || !imageMetadata.date) {
      alert('Lütfen hastane adı ve tarih alanlarını doldurun');
      return;
    }

    setIsUploading(true);

    // Dosya yükleme simülasyonu
    try {
      // Gerçek bir API çağrısı burada yapılacak
      // Metadatayı ve dosyayı birlikte göndereceğiz
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('metadata', JSON.stringify(imageMetadata));

      // API çağrısı simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1500));

      console.log('Dosya yüklendi:', selectedFile.name);
      console.log('Metadata:', imageMetadata);

      setUploadSuccess(true);
      setSelectedFile(null);
      setPreviewUrl(null);

      // 3 saniye sonra başarı mesajını kaldır
      setTimeout(() => {
        setUploadSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Dosya yükleme hatası:', error);
      alert('Dosya yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsUploading(false);
    }
  };

  // Function to handle filter changes
  const handleFilterChange = (filterName: string, value: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    console.log(`Filter changed: ${filterName} = ${value}`);
    // Would normally trigger API call to filter results
  };

  // Helper function to get user-friendly filter names
  const getFriendlyFilterName = (filterKey: string): string => {
    const nameMap: Record<string, string> = {
      'date': 'Tarih',
      'hospital': 'Hastane',
      'description': 'Açıklama',
      'imageType': 'Görüntü Türü',
      'status': 'Durum'
    };
    return nameMap[filterKey] || filterKey;
  };

  const handleBackClick = () => {
    navigate('/'); // Navigate to home page
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] py-6 flex flex-col">
      <div className="max-w-6xl mx-auto px-4 w-full flex-1 flex flex-col">
        {/* Header with back button and left-aligned title */}
        <div className="flex items-center mb-6">
          <button
            onClick={handleBackClick}
            className="mr-2 p-1 hover:bg-gray-100 rounded transition-colors"
            aria-label="Geri git"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 style={{ fontSize: '22px' }} className="font-medium text-black">Radyolojik Görüntülerim</h1>
        </div>

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg,image/png,image/dicom,application/dicom,.dcm"
          className="hidden"
        />

        {selectedFile && (
          <div className="mt-4 mb-6 bg-white p-4 rounded-lg shadow-sm">
            <div className="flex flex-col md:flex-row gap-6 mb-4">
              {/* Preview section */}
              <div className="w-full md:w-1/3 lg:w-1/4">
                <h3 className="font-medium text-lg mb-2">Seçilen Dosya</h3>
                <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                  {previewUrl ? (
                    <div className="mb-2">
                      <img
                        src={previewUrl}
                        alt="Önizleme"
                        className="max-w-full h-auto rounded max-h-48 mx-auto"
                      />
                    </div>
                  ) : (
                    <div className="flex justify-center items-center h-32 mb-2 bg-gray-100 rounded">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="text-center text-sm text-gray-600 overflow-hidden text-ellipsis">
                    {selectedFile.name}
                    <div className="text-xs text-gray-500 mt-1">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                </div>
              </div>

              {/* Form section */}
              <div className="w-full md:w-2/3 lg:w-3/4">
                <h3 className="font-medium text-lg mb-3">Görüntü Bilgileri</h3>
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hastane Adı <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="hospital"
                        value={imageMetadata.hospital}
                        onChange={handleMetadataChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tarih <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={imageMetadata.date}
                        onChange={handleMetadataChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Görüntüleme Türü
                      </label>
                      <select
                        name="imageType"
                        value={imageMetadata.imageType}
                        onChange={handleMetadataChange}
                        className="w-full p-2 border border-gray-300 rounded"
                      >
                        <option value="">Seçiniz</option>
                        <option value="röntgen">Röntgen</option>
                        <option value="mr">MR</option>
                        <option value="tomografi">Tomografi</option>
                        <option value="ultrason">Ultrason</option>
                        <option value="panoramik">Panoramik Film</option>
                        <option value="diğer">Diğer</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vücut Bölgesi
                      </label>
                      <select
                        name="bodyPart"
                        value={imageMetadata.bodyPart}
                        onChange={handleMetadataChange}
                        className="w-full p-2 border border-gray-300 rounded"
                      >
                        <option value="">Seçiniz</option>
                        <option value="baş">Baş/Kafa</option>
                        <option value="boyun">Boyun</option>
                        <option value="göğüs">Göğüs</option>
                        <option value="karın">Karın</option>
                        <option value="omurga">Omurga</option>
                        <option value="pelvis">Pelvis</option>
                        <option value="kol">Kol</option>
                        <option value="bacak">Bacak</option>
                        <option value="diğer">Diğer</option>
                      </select>
                    </div>

                    <div className="col-span-1 sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Açıklama
                      </label>
                      <input
                        type="text"
                        name="description"
                        value={imageMetadata.description}
                        onChange={handleMetadataChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="Görüntü hakkında kısa açıklama"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                      className="mr-2 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      className="bg-[#1B4D3E] text-white py-2 px-4 rounded font-medium disabled:opacity-70"
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Yükleniyor...
                        </span>
                      ) : 'Dosyayı Yükle'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {uploadSuccess && (
          <div className="mt-4 mb-6 bg-green-50 border border-green-200 p-4 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              <p className="text-green-700">Dosya başarıyla yüklendi!</p>
            </div>
          </div>
        )}

        {/* Filtre Bölümü - positioned higher on the page */}
        <div className="bg-white rounded-lg shadow-sm mb-6 flex-1 flex flex-col mt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 border-b">
            <div className="p-3 border-r">
              <div className="w-full flex items-center justify-start pl-4 text-base font-medium text-black">
                Tarih
              </div>
            </div>
            <div className="p-3 border-r">
              <div className="w-full flex items-center justify-start pl-4 text-base font-medium text-black">
                Ön İzleme
              </div>
            </div>
            <div className="p-3 border-r">
              <div className="w-full flex items-center justify-start pl-4 text-base font-medium text-black">
                Açıklama
              </div>
            </div>
            <div className="p-3">
              <div className="w-full flex items-center justify-start pl-4 text-base font-medium text-black">
                Radyolojik Görüntüler
              </div>
            </div>
          </div>

          {/* Aktif filtreler */}
          {Object.values(activeFilters).some(filter => filter !== "") && (
            <div className="px-3 py-2 border-b bg-gray-50 flex flex-wrap gap-2">
              {Object.entries(activeFilters).map(([key, value]) =>
                value && (
                  <div key={key} className="inline-flex items-center bg-white border border-gray-200 text-sm rounded px-2 py-1">
                    <span className="font-medium mr-1">{getFriendlyFilterName(key)}:</span>
                    <span>{value}</span>
                    <button
                      className="ml-1 text-gray-500 hover:text-gray-700"
                      onClick={() => handleFilterChange(key, "")}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )
              )}
              <button
                className="text-sm text-blue-600 hover:text-blue-800 ml-auto"
                onClick={() => setActiveFilters({ date: "", hospital: "", description: "", imageType: "", status: "" })}
              >
                Tümünü Temizle
              </button>
            </div>
          )}

          {/* Boş içerik - ileride doldurulacak */}
          <div className="flex-1 flex justify-center items-center p-4">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Henüz Radyolojik Görüntü Yok</h3>
              <p className="mt-1 text-gray-500">Radyolojik görüntülerinizi "Röntgen Yükle" butonu ile sisteme yükleyebilirsiniz.</p>
              {/* Display filter information if any filters are active */}
              {Object.values(activeFilters).some(f => f !== "") && (
                <p className="mt-3 text-sm text-gray-500">
                  Not: Seçili filtrelerle eşleşen görüntü bulunamadı.
                </p>
              )}
            </div>
          </div>

          {/* Bottom bar with upload button and pagination */}
          <div className="border-t p-3 flex justify-between items-center">
            {/* Upload button moved to bottom left */}
            <button
              onClick={handleUploadClick}
              className="bg-[#B91C1C] text-white py-2 px-4 rounded font-medium"
            >
              Röntgen Yükle
            </button>

            {/* Pagination with updated colors */}
            <div className="flex space-x-1">
              <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">İlk</button>
              <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">Önceki</button>
              <button className="px-3 py-1 text-sm text-white bg-[#B91C1C] rounded">1</button>
              <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">Sonraki</button>
              <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">Son</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RadiologyPage;
