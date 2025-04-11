# Fisqos - Gerçek Zamanlı İletişim Platformu

Fisqos, Discord benzeri bir gerçek zamanlı iletişim platformudur. Kullanıcılar gruplar oluşturabilir, metin ve ses kanalları ekleyebilir, dosya paylaşabilir ve arkadaşlarıyla doğrudan mesajlaşabilir. Hem web hem de mobil platformlarda kullanılabilir.

## Özellikler

- **Kullanıcı Yönetimi**: Kayıt, giriş, profil düzenleme
- **Grup Yönetimi**: Grup oluşturma, silme, yeniden adlandırma
- **Kanal Yönetimi**: Metin ve ses kanalları oluşturma
- **Gerçek Zamanlı Mesajlaşma**: Metin kanallarında ve DM'lerde mesajlaşma
- **Ses İletişimi**: WebRTC tabanlı ses iletişimi
- **Ekran Paylaşımı**: WebRTC ile ekran paylaşımı
- **Dosya Paylaşımı**: Metin kanallarında ve DM'lerde dosya paylaşımı
- **Mesaj Düzenleme/Silme**: Gönderilen mesajları düzenleme ve silme
- **Zengin Metin Desteği**: Markdown benzeri biçimlendirme ve emoji desteği
- **Arama**: Mesajlarda arama yapma
- **Arkadaşlık Sistemi**: Arkadaş ekleme, çıkarma, engelleme
- **Çoklu Dil Desteği**: Türkçe ve İngilizce dil desteği

## Teknolojiler

- **Backend**: Node.js, Express
- **Veritabanı**: MongoDB (Mongoose)
- **Gerçek Zamanlı İletişim**: Socket.IO
- **Medya Akışı**: Mediasoup (WebRTC SFU)
- **Web Frontend**: HTML, CSS, JavaScript
- **Mobil Uygulama**: React Native, TypeScript

## Proje Yapısı

### Backend

```
fisqos/
├── .vscode/               # VS Code ayarları
├── config/                # Yapılandırma dosyaları
├── deployment/            # Dağıtım dosyaları
├── dist/                  # Derlenmiş TypeScript dosyaları (build sonrası)
├── locales/               # Dil dosyaları
├── middleware/            # Express middleware'leri
├── models/                # Veritabanı modelleri
├── modules/               # Uygulama modülleri
├── public/                # Statik dosyalar
├── routes/                # Express rotaları
├── socket/                # Socket.IO olayları
├── src/                   # TypeScript kaynak kodları
│   ├── api/               # API end-point'leri
│   ├── config/            # Yapılandırma dosyaları
│   ├── models/            # Veritabanı model tanımları
│   ├── services/          # İş mantığı servisleri
│   ├── socket/            # Socket.IO işleyicileri
│   ├── types/             # TypeScript tip tanımları
│   ├── utils/             # Yardımcı fonksiyonlar
│   └── app.ts             # Ana uygulama giriş noktası
├── uploads/               # Yüklenen dosyalar
├── utils/                 # Yardımcı fonksiyonlar
├── .env.sample            # Çevre değişkenleri şablonu
├── .gitignore             # Git tarafından yok sayılacak dosyalar
├── app.js                 # JavaScript uygulama dosyası
├── docker-compose.yml     # Docker Compose yapılandırması
├── Dockerfile             # Docker yapılandırması
├── package.json           # Proje bağımlılıkları
├── Procfile               # Render.com için başlatma talimatları
├── README.md              # Proje dokümantasyonu
├── render.yaml            # Render.com yapılandırması
├── server.js              # Sunucu başlatma dosyası
├── sfu.js                 # Mediasoup SFU yapılandırması
└── tsconfig.json          # TypeScript derleyici ayarları
```

### Mobil Uygulama

```
FisqosApp/
├── __mocks__/             # Jest mock dosyaları
├── __tests__/             # Test dosyaları
├── android/               # Android platformu dosyaları
├── ios/                   # iOS platformu dosyaları
├── src/                   # Kaynak kodlar
│   ├── components/        # Yeniden kullanılabilir bileşenler
│   ├── contexts/          # React Context API dosyaları
│   ├── i18n/              # Çoklu dil desteği
│   ├── navigation/        # React Navigation yapılandırması
│   ├── screens/           # Uygulama ekranları
│   ├── services/          # API ve diğer servisler
│   ├── theme/             # Tema ve stil dosyaları
│   └── utils/             # Yardımcı fonksiyonlar
├── .eslintrc.js           # ESLint yapılandırması
├── .prettierrc.js         # Prettier yapılandırması
├── App.tsx                # Ana uygulama bileşeni
├── babel.config.js        # Babel yapılandırması
├── index.js               # Uygulama giriş noktası
├── jest.config.js         # Jest test yapılandırması
├── metro.config.js        # Metro bundler yapılandırması
├── package.json           # Proje bağımlılıkları
└── tsconfig.json          # TypeScript derleyici ayarları
```

## Kurulum

### Backend - Yerel Geliştirme

1. Gerekli paketleri yükleyin:
   ```
   npm install
   ```

2. MongoDB bağlantı bilgilerini ayarlayın:
   ```
   # .env dosyası oluşturun
   MONGODB_URI=mongodb+srv://kullanici:sifre@cluster.mongodb.net/veritabani
   PORT=3000
   ```

3. Geliştirme modunda sunucuyu başlatın:
   ```
   npm run dev
   ```

4. Üretim için derleme yapın:
   ```
   npm run build
   ```

5. Üretim modunda sunucuyu başlatın:
   ```
   npm start
   ```

### Mobil Uygulama - Yerel Geliştirme

1. Gerekli paketleri yükleyin:
   ```bash
   cd FisqosApp
   npm install
   ```

2. iOS için pod'ları yükleyin (macOS gereklidir):
   ```bash
   cd ios && pod install && cd ..
   ```

3. Uygulamayı çalıştırın:
   ```bash
   # Android için
   npm run android

   # iOS için
   npm run ios
   ```

### Backend - Render.com Dağıtımı

1. GitHub deposunu Render.com'a bağlayın

2. Yeni bir Web Hizmeti oluşturun

3. Aşağıdaki ayarları yapılandırın:
   - Derleme Komutu: `npm ci && npm run build`
   - Başlatma Komutu: `npm start`
   - Çevre Değişkenleri:
     - `MONGODB_URI`: MongoDB bağlantı dizesi
     - `PORT`: 3000
     - Diğer gerekli çevre değişkenleri

4. Dağıtımı başlatın

## Geliştirme

### Yeni Özellik Ekleme

1. İlgili modülü `modules/` dizininde oluşturun
2. Gerekirse yeni model dosyalarını `models/` dizininde oluşturun
3. Socket olaylarını `socket/socketEvents.js` dosyasına ekleyin
4. İstemci tarafı kodlarını `public/js/` dizininde oluşturun
5. Dil dosyalarına çevirileri ekleyin

### Kod Standartları

- Tüm dosyalarda JSDoc formatında yorum satırları kullanın
- Modüler yapıyı koruyun, her modül tek bir sorumluluğa sahip olmalı
- Hata yönetimini try-catch blokları ile yapın
- Asenkron işlemleri async/await ile yönetin

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır.
