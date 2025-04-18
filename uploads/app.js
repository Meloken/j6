/**************************************
 * app.js
 * Ana uygulama dosyası
 **************************************/
require('dotenv').config();

const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const WebSocket = require('ws');
const mongoose = require('mongoose');

// Modeller
const User = require('./models/User');
const Group = require('./models/Group');
const Channel = require('./models/Channel');
const Message = require('./models/Message');
const DMMessage = require('./models/DmMessage');
const FileAttachment = require('./models/FileAttachment');
const PasswordReset = require('./models/PasswordReset');
const Role = require('./models/Role');
const GroupMember = require('./models/GroupMember');
const Category = require('./models/Category');
const ScheduledMessage = require('./models/ScheduledMessage');

// Modüller
const sfu = require('./sfu');
const groupManager = require('./modules/groupManager');
const channelManager = require('./modules/channelManager');
const userManager = require('./modules/userManager');
const friendManager = require('./modules/friendManager');
const dmManager = require('./modules/dmManager');
const fileUpload = require('./modules/fileUpload');
const messageManager = require('./modules/messageManager');
const profileManager = require('./modules/profileManager');
const richTextFormatter = require('./modules/richTextFormatter');
const registerTextChannelEvents = require('./modules/textChannel');

// Yeni modüller
const passwordReset = require('./modules/passwordReset');
const emailVerification = require('./modules/emailVerification');
const twoFactorAuth = require('./modules/twoFactorAuth');
const roleManager = require('./modules/roleManager');
const categoryManager = require('./modules/categoryManager');
const archiveManager = require('./modules/archiveManager');
const messageInteractions = require('./modules/messageInteractions');
const mediaProcessor = require('./modules/mediaProcessor');
const notificationManager = require('./modules/notificationManager');
const emailNotifications = require('./modules/emailNotifications');
const scheduledMessageManager = require('./modules/scheduledMessageManager');
const sessionManager = require('./modules/sessionManager');
const reportManager = require('./modules/reportManager');

// Express uygulaması ve HTTP sunucusu oluştur
const app = express();
const server = http.createServer(app);

// Statik dosyaları sunmak için middleware
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.use(express.json({ limit: '50mb' }));

// Socket.IO sunucusu oluştur
const io = socketIO(server, {
  wsEngine: WebSocket.Server
});

// Bellek içi veri yapıları
const users = {};   // socket.id -> { username, currentGroup, currentRoom, micEnabled, selfDeafened, isScreenSharing, screenShareProducerId }
const groups = {};  // groupId -> { owner, name, users:[], rooms:{} }
const onlineUsernames = new Set();
const friendRequests = {};  // key: hedef kullanıcı adı, value: [ { from, timestamp }, ... ]

// MongoDB bağlantısı
const uri = process.env.MONGODB_URI || "mongodb+srv://abuzorttin:HWZe7uK5yEAE@cluster0.vdrdy.mongodb.net/myappdb?retryWrites=true&w=majority";

mongoose.connect(uri)
  .then(async () => {
    console.log("MongoDB bağlantısı başarılı!");

    // Mediasoup işçilerini oluştur
    await sfu.createWorkers();
    console.log("Mediasoup Workers hazır!");

    // Grupları ve kanalları yükle
    await groupManager.loadGroupsFromDB(groups);
    await channelManager.loadChannelsFromDB(groups);

    console.log("Uygulama başlangıç yüklemeleri tamam.");
  })
  .catch(err => {
    console.error("MongoDB bağlantı hatası:", err);
  });

// Socket.IO olaylarını yükle
require('./socket/socketEvents')(io, {
  users,
  groups,
  onlineUsernames,
  friendRequests,
  groupManager,
  channelManager,
  userManager,
  friendManager,
  dmManager,
  fileUpload,
  messageManager,
  profileManager,
  richTextFormatter,
  registerTextChannelEvents,
  sfu,
  // Yeni modüller
  passwordReset,
  emailVerification,
  twoFactorAuth,
  roleManager,
  categoryManager,
  archiveManager,
  messageInteractions,
  mediaProcessor,
  notificationManager,
  emailNotifications,
  scheduledMessageManager,
  sessionManager,
  reportManager
});

// Zamanlanmış mesajları yönetmek için modülü başlat
scheduledMessageManager.initScheduledMessageManager(io, richTextFormatter);

// Sunucuyu başlat
const PORT = process.env.PORT || 80;
server.listen(PORT, () => {
  console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM sinyali alındı, sunucu kapatılıyor...');
  server.close(() => {
    console.log('HTTP sunucusu kapatıldı');
    mongoose.connection.close(false, () => {
      console.log('MongoDB bağlantısı kapatıldı');
      process.exit(0);
    });
  });
});

module.exports = app;
