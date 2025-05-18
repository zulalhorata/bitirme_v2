interface User {
    firstName?: string;
    lastName?: string;
    tcKimlik: string;
    phone?: string;
    email?: string;
    birthDate?: string;
    password: string;
}

class AuthService {
    private readonly USERS_KEY = 'registered_users';

    private getUsers(): User[] {
        const users = localStorage.getItem(this.USERS_KEY);
        return users ? JSON.parse(users) : [];
    }

    private saveUsers(users: User[]): void {
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    }

    register(userData: User): boolean {
        console.log('Auth service - Kayıt isteği alındı:', userData);
        const users = this.getUsers();
        console.log('Auth service - Mevcut kullanıcılar:', users);

        // TC Kimlik kontrolü
        if (users.some(user => user.tcKimlik === userData.tcKimlik)) {
            console.log('Auth service - TC Kimlik zaten kayıtlı');
            return false; // Bu TC Kimlik zaten kayıtlı
        }

        users.push(userData);
        this.saveUsers(users);
        console.log('Auth service - Yeni kullanıcı kaydedildi. Güncel liste:', this.getUsers());
        return true;
    }

    login(tcKimlik: string, password: string): boolean {
        console.log('Login attempt - TC Kimlik:', tcKimlik);
        const users = this.getUsers();
        console.log('Registered users:', users);

        const user = users.find(u => u.tcKimlik === tcKimlik && u.password === password);
        console.log('Found user:', user);

        if (user) {
            try {
                // Hem session storage hem de local storage'a kaydet
                sessionStorage.setItem('current_user', JSON.stringify(user));
                localStorage.setItem('current_user', JSON.stringify(user));
                console.log('User logged in successfully');

                // Oturum durumunu kontrol et
                const isAuth = this.isAuthenticated();
                console.log('Auth status after login:', isAuth);

                return isAuth;
            } catch (error) {
                console.error('Error during login:', error);
                return false;
            }
        }

        console.log('Login failed - Invalid credentials');
        return false;
    }

    logout(): void {
        console.log('Auth service - Çıkış işlemi başlatılıyor');

        // Session storage'ı temizle
        sessionStorage.clear();
        console.log('Auth service - Session storage temizlendi');

        // Local storage'dan auth ile ilgili verileri temizle
        localStorage.removeItem('current_user');
        console.log('Auth service - Local storage temizlendi');

        // Oturum durumunu kontrol et
        const isStillAuthenticated = this.isAuthenticated();
        console.log('Auth service - Oturum durumu kontrol edildi:', isStillAuthenticated);

        if (isStillAuthenticated) {
            console.log('Auth service - Oturum hala aktif, tekrar temizleme yapılıyor');
            this.logout(); // Recursive çağrı ile tekrar dene
        }
    }

    getCurrentUser(): User | null {
        try {
            // Önce session storage'dan kontrol et
            let user = sessionStorage.getItem('current_user');
            if (!user) {
                // Session storage'da yoksa local storage'dan kontrol et
                user = localStorage.getItem('current_user');
            }

            if (user) {
                const parsedUser = JSON.parse(user);
                console.log('Current user:', parsedUser);
                return parsedUser;
            }

            return null;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    isAuthenticated(): boolean {
        try {
            const user = this.getCurrentUser();
            const isAuth = !!user;
            console.log('Auth service - Oturum durumu kontrol ediliyor:', isAuth);
            return isAuth;
        } catch (error) {
            console.error('Error checking authentication:', error);
            return false;
        }
    }

    updateProfile(tcKimlik: string, updateData: Partial<User>): boolean {
        console.log('Auth service - Profil güncelleme isteği:', updateData);
        try {
            // Tüm kayıtlı kullanıcıları al
            const users = this.getUsers();

            // Güncellenecek kullanıcıyı bul
            const userIndex = users.findIndex(u => u.tcKimlik === tcKimlik);

            if (userIndex === -1) {
                console.log('Auth service - Güncellenecek kullanıcı bulunamadı');
                return false;
            }

            // Kullanıcı bilgilerini güncelle (TC Kimlik ve doğum tarihi hariç)
            const updatedUser = {
                ...users[userIndex],
                firstName: updateData.firstName || users[userIndex].firstName,
                lastName: updateData.lastName || users[userIndex].lastName,
                email: updateData.email || users[userIndex].email,
                phone: updateData.phone || users[userIndex].phone
            };

            // Kullanıcı listesini güncelle
            users[userIndex] = updatedUser;
            this.saveUsers(users);

            // Aktif kullanıcı bilgilerini de güncelle
            const currentUser = this.getCurrentUser();
            if (currentUser && currentUser.tcKimlik === tcKimlik) {
                sessionStorage.setItem('current_user', JSON.stringify(updatedUser));
                localStorage.setItem('current_user', JSON.stringify(updatedUser));
            }

            console.log('Auth service - Profil başarıyla güncellendi');
            return true;
        } catch (error) {
            console.error('Auth service - Profil güncelleme hatası:', error);
            return false;
        }
    }

    updatePassword(tcKimlik: string, currentPassword: string, newPassword: string): boolean {
        console.log('Auth service - Şifre güncelleme isteği alındı');
        try {
            // Tüm kayıtlı kullanıcıları al
            const users = this.getUsers();

            // Güncellenecek kullanıcıyı bul
            const userIndex = users.findIndex(u => u.tcKimlik === tcKimlik);

            if (userIndex === -1) {
                console.log('Auth service - Kullanıcı bulunamadı');
                return false;
            }

            // Mevcut şifreyi kontrol et
            if (users[userIndex].password !== currentPassword) {
                console.log('Auth service - Mevcut şifre yanlış');
                return false;
            }

            // Şifreyi güncelle
            users[userIndex].password = newPassword;
            this.saveUsers(users);

            // Aktif kullanıcı bilgilerini de güncelle
            const currentUser = this.getCurrentUser();
            if (currentUser && currentUser.tcKimlik === tcKimlik) {
                const updatedUser = { ...currentUser, password: newPassword };
                sessionStorage.setItem('current_user', JSON.stringify(updatedUser));
                localStorage.setItem('current_user', JSON.stringify(updatedUser));
            }

            console.log('Auth service - Şifre başarıyla güncellendi');
            return true;
        } catch (error) {
            console.error('Auth service - Şifre güncelleme hatası:', error);
            return false;
        }
    }
}

export const authService = new AuthService(); 