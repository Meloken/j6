# Fisqos Mobile App

Fisqos, Discord benzeri bir sesli ve yazılı iletişim uygulamasıdır. Bu repo, Fisqos'un React Native ile geliştirilmiş mobil uygulamasını içerir.

## Özellikler

- **Kullanıcı Kimlik Doğrulama**: Kayıt, giriş, şifre sıfırlama
- **Gruplar ve Kanallar**: Grup oluşturma, kanallara katılma
- **Özel Mesajlaşma**: Kullanıcılar arası özel mesajlaşma
- **Sesli Sohbet**: WebRTC tabanlı sesli ve görüntülü sohbet
- **Arkadaş Yönetimi**: Arkadaş ekleme, silme, engelleme
- **Bildirimler**: Anlık bildirimler
- **Tema Desteği**: Aydınlık ve karanlık tema
- **Çoklu Dil Desteği**: Türkçe ve İngilizce dil desteği

## Kurulum

### Gereksinimler

- Node.js (>= 14.0.0)
- npm (>= 6.0.0) veya yarn (>= 1.22.0)
- React Native CLI
- Android Studio (Android için)
- Xcode (iOS için)

### Adımlar

1. Repo'yu klonlayın:
   ```bash
   git clone https://github.com/Meloken/j6.git
   cd FisqosApp
   ```

2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   # veya
   yarn install
   ```

3. iOS için pod'ları yükleyin:
   ```bash
   cd ios && pod install && cd ..
   ```

4. Uygulamayı çalıştırın:
   ```bash
   # Android için
   npm run android
   # veya
   yarn android

   # iOS için
   npm run ios
   # veya
   yarn ios
   ```

## Proje Yapısı

```
FisqosApp/
├── android/                  # Android platformu için dosyalar
├── ios/                      # iOS platformu için dosyalar
├── src/
│   ├── assets/               # Resimler, fontlar ve diğer statik dosyalar
│   ├── components/           # Yeniden kullanılabilir UI bileşenleri
│   │   ├── chat/             # Mesajlaşma bileşenleri
│   │   ├── common/           # Ortak UI bileşenleri
│   │   ├── groups/           # Grup ve kanal bileşenleri
│   │   └── voice/            # Sesli sohbet bileşenleri
│   ├── contexts/             # React Context API ile durum yönetimi
│   ├── navigation/           # React Navigation yapılandırması
│   ├── screens/              # Uygulama ekranları
│   │   ├── auth/             # Kimlik doğrulama ekranları
│   │   └── main/             # Ana uygulama ekranları
│   ├── services/             # API ve diğer servisler
│   ├── utils/                # Yardımcı fonksiyonlar
│   ├── i18n/                 # Yerelleştirme dosyaları
│   ├── theme/                # Tema dosyaları
│   └── config.ts             # Uygulama yapılandırması
├── __tests__/                # Test dosyaları
├── App.tsx                   # Ana uygulama bileşeni
├── app.json                  # Uygulama meta verileri
├── babel.config.js           # Babel yapılandırması
├── index.js                  # Uygulama giriş noktası
├── metro.config.js           # Metro bundler yapılandırması
├── package.json              # Bağımlılıklar ve komutlar
└── tsconfig.json             # TypeScript yapılandırması
```

## Katkıda Bulunma

1. Repo'yu fork'layın
2. Yeni bir branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit'leyin (`git commit -m 'Add some amazing feature'`)
4. Branch'inizi push'layın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Daha fazla bilgi için `LICENSE` dosyasına bakın.

## İletişim

Proje Sahibi: [Meloken](https://github.com/Meloken)

Proje Linki: [https://github.com/Meloken/j6](https://github.com/Meloken/j6)
