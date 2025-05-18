import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth';

const LoginPage = () => {
    const navigate = useNavigate();
    const [tcKimlik, setTcKimlik] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({
        tcKimlik: '',
        password: '',
        submit: ''
    });

    const validateTcKimlik = (value: string) => {
        if (value.length !== 11) {
            return 'TC Kimlik No 11 haneli olmalıdır';
        }
        if (!/^\d+$/.test(value)) {
            return 'TC Kimlik No sadece rakamlardan oluşmalıdır';
        }
        return '';
    };

    const validatePassword = (value: string) => {
        if (value.length < 6) {
            return 'Şifre en az 6 karakterden oluşmalıdır';
        }
        return '';
    };

    const handleTcKimlikChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setTcKimlik(value);
        setErrors(prev => ({
            ...prev,
            tcKimlik: validateTcKimlik(value)
        }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPassword(value);
        setErrors(prev => ({
            ...prev,
            password: validatePassword(value)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const tcKimlikError = validateTcKimlik(tcKimlik);
        const passwordError = validatePassword(password);

        setErrors({
            tcKimlik: tcKimlikError,
            password: passwordError,
            submit: ''
        });

        if (!tcKimlikError && !passwordError) {
            try {
                console.log('Giriş denemesi başlatılıyor...');
                const success = authService.login(tcKimlik, password);
                console.log('Giriş başarılı mı:', success);

                if (success) {
                    console.log('Giriş başarılı, anasayfaya yönlendiriliyor...');
                    // Eğer "Beni Hatırla" seçiliyse, kullanıcı bilgilerini localStorage'a kaydet
                    if (rememberMe) {
                        localStorage.setItem('remember_me', JSON.stringify({ tcKimlik, rememberMe }));
                    } else {
                        localStorage.removeItem('remember_me');
                    }

                    // Custom event tetikle
                    window.dispatchEvent(new Event('customStorageChange'));

                    // Anasayfaya yönlendir
                    navigate('/', { replace: true });
                } else {
                    console.log('Giriş başarısız - Geçersiz kimlik bilgileri');
                    setErrors(prev => ({
                        ...prev,
                        submit: 'TC Kimlik No veya şifre hatalı.'
                    }));
                }
            } catch (error) {
                console.error('Giriş sırasında bir hata oluştu:', error);
                setErrors(prev => ({
                    ...prev,
                    submit: 'Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.'
                }));
            }
        }
    };

    return (
        <div className="min-h-screen w-screen flex items-center justify-center bg-white">
            <div className="w-[460px] mx-auto px-4">
                <h1 className="text-[#1B4332] text-4xl font-bold text-center mb-12">LOGO</h1>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
                    <div className="flex mb-8 border-b">
                        <div className="flex-1 text-center border-b-2 border-[#1B4332] pb-3">
                            <span className="text-[#1B4332] font-medium text-lg">Giriş Yap</span>
                        </div>
                        <Link to="/kayit" className="flex-1 text-center pb-3">
                            <span className="text-gray-500 font-medium text-lg">Kayıt Ol</span>
                        </Link>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="tcKimlik" className="block text-sm font-medium text-gray-600 mb-2">
                                TC Kimlik No
                            </label>
                            <input
                                type="text"
                                id="tcKimlik"
                                value={tcKimlik}
                                onChange={handleTcKimlikChange}
                                maxLength={11}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#1B4332] text-black"
                                required
                            />
                            {errors.tcKimlik && (
                                <p className="mt-1 text-sm text-red-600">{errors.tcKimlik}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-2">
                                Şifre
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    value={password}
                                    onChange={handlePasswordChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#1B4332] text-black"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="h-4 w-4 text-[#1B4332] focus:ring-[#1B4332] border-gray-300 rounded"
                                />
                                <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                                    Beni Hatırla
                                </label>
                            </div>
                            <button type="button" className="text-sm text-[#1B4332] hover:underline">
                                Şifremi Unuttum
                            </button>
                        </div>

                        {errors.submit && (
                            <p className="text-sm text-red-600 text-center">{errors.submit}</p>
                        )}
                        <button
                            type="submit"
                            className="w-full bg-[#1B4332] text-white py-3 rounded-md hover:bg-[#143728] transition-colors mt-6 text-base font-medium"
                        >
                            Giriş Yap
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage; 