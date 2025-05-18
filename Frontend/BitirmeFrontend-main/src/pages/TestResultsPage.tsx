/**
 * Tahlillerim sayfası bileşeni
 * 
 * Kullanıcının tahlil sonuçlarını görüntüleyeceği sayfa
 */
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TestResultsPage = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<any[]>([]);

  // Metadata for the uploaded test result
  const [testMetadata, setTestMetadata] = useState({
    hospital: '',
    date: '',
    description: ''
  });

  // Generate file preview when a file is selected
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    if (!selectedFile.type.startsWith('image/')) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedFile]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    setTestMetadata({
      hospital: '',
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleMetadataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTestMetadata(prev => ({
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
    if (!testMetadata.hospital || !testMetadata.date) {
      alert('Lütfen hastane adı ve tarih alanlarını doldurun');
      return;
    }
    setIsUploading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));
      setTestResults(prev => [
        {
          id: Date.now(),
          file: selectedFile,
          previewUrl,
          ...testMetadata
        },
        ...prev
      ]);
      setUploadSuccess(true);
      setSelectedFile(null);
      setPreviewUrl(null);
      setTimeout(() => setUploadSuccess(false), 2000);
    } catch (error) {
      alert('Dosya yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleBackClick = () => {
    navigate('/');
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
          <h1 style={{ fontSize: '22px' }} className="font-medium text-black">Tahlil Sonuçlarım</h1>
        </div>
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg,image/png,application/pdf"
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
                <h3 className="font-medium text-lg mb-3">Tahlil Bilgileri</h3>
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hastane Adı <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="hospital"
                        value={testMetadata.hospital}
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
                        value={testMetadata.date}
                        onChange={handleMetadataChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                      />
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Açıklama
                      </label>
                      <input
                        type="text"
                        name="description"
                        value={testMetadata.description}
                        onChange={handleMetadataChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="Tahlil hakkında kısa açıklama"
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
        {/* Test Results List */}
        <div className="flex-1 min-h-0 flex flex-col bg-white rounded-lg shadow-sm mt-1 mb-8 overflow-y-auto scrollbar-hide">
          {testResults.length === 0 ? (
            <div className="flex-1 flex justify-center items-center p-4">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">Henüz Tahlil Sonucu Yok</h3>
                <p className="mt-1 text-gray-500">Tahlil sonuçlarınızı "Dosya Yükle" butonu ile sisteme yükleyebilirsiniz.</p>
              </div>
            </div>
          ) : (
            <div className="divide-y">
              {testResults.map(result => (
                <div key={result.id} className="flex flex-col md:flex-row items-center gap-4 p-4">
                  <div className="w-full md:w-1/4 flex justify-center">
                    {result.previewUrl ? (
                      <img src={result.previewUrl} alt="Önizleme" className="max-h-32 rounded" />
                    ) : (
                      <span className="text-gray-400">Önizleme yok</span>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="text-sm text-gray-700"><span className="font-medium">Hastane:</span> {result.hospital}</div>
                    <div className="text-sm text-gray-700"><span className="font-medium">Tarih:</span> {result.date}</div>
                    {result.description && <div className="text-sm text-gray-700"><span className="font-medium">Açıklama:</span> {result.description}</div>}
                  </div>
                  <div className="w-full md:w-auto flex justify-center mt-2 md:mt-0">
                    <a
                      href={result.previewUrl}
                      download={result.file.name}
                      className="bg-[#1B4D3E] text-white px-4 py-2 rounded font-medium text-sm hover:bg-[#153D31] transition-colors"
                    >
                      İndir
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Bottom bar with upload button */}
          <div className="border-t p-3 flex justify-between items-center">
            <button
              onClick={handleUploadClick}
              className="bg-[#B91C1C] text-white py-2 px-4 rounded font-medium"
            >
              Tahlil Sonucunu Yükle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestResultsPage;
