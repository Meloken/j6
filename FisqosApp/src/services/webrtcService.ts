import { RTCPeerConnection, mediaDevices, MediaStream } from 'react-native-webrtc';
import { WEBRTC_CONFIG } from '../config';
import { Socket } from 'socket.io-client';

class WebRTCService {
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private socket: Socket | null = null;
  private roomId: string | null = null;
  private userId: string | null = null;

  // Callbacks
  private onRemoteStreamCallback: ((userId: string, stream: MediaStream) => void) | null = null;
  private onUserDisconnectedCallback: ((userId: string) => void) | null = null;

  constructor() {}

  // Socket.IO bağlantısını ayarla
  setSocket(socket: Socket) {
    this.socket = socket;
    this.setupSocketListeners();
  }

  // Kullanıcı kimliğini ayarla
  setUserId(userId: string) {
    this.userId = userId;
  }

  // Socket.IO olay dinleyicilerini ayarla
  private setupSocketListeners() {
    if (!this.socket) return;

    // Yeni kullanıcı katıldığında
    this.socket.on('user-joined', async ({ userId, roomId }) => {
      console.log(`User joined: ${userId} in room ${roomId}`);
      if (userId !== this.userId && this.localStream) {
        await this.createPeerConnection(userId);
        await this.sendOffer(userId);
      }
    });

    // Teklif alındığında
    this.socket.on('webrtc-offer', async ({ from, offer }) => {
      console.log(`Received offer from: ${from}`);
      if (from !== this.userId) {
        const pc = await this.createPeerConnection(from);
        await pc.setRemoteDescription({ type: 'offer', sdp: offer });
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        this.socket?.emit('webrtc-answer', {
          to: from,
          answer: answer.sdp,
          from: this.userId,
          roomId: this.roomId
        });
      }
    });

    // Cevap alındığında
    this.socket.on('webrtc-answer', async ({ from, answer }) => {
      console.log(`Received answer from: ${from}`);
      const pc = this.peerConnections.get(from);
      if (pc) {
        await pc.setRemoteDescription({ type: 'answer', sdp: answer });
      }
    });

    // ICE adayı alındığında
    this.socket.on('webrtc-ice-candidate', async ({ from, candidate }) => {
      console.log(`Received ICE candidate from: ${from}`);
      const pc = this.peerConnections.get(from);
      if (pc) {
        await pc.addIceCandidate(candidate);
      }
    });

    // Kullanıcı ayrıldığında
    this.socket.on('user-left', ({ userId, roomId }) => {
      console.log(`User left: ${userId} from room ${roomId}`);
      this.closePeerConnection(userId);
      if (this.onUserDisconnectedCallback) {
        this.onUserDisconnectedCallback(userId);
      }
    });
  }

  // Peer bağlantısı oluştur
  private async createPeerConnection(userId: string): Promise<RTCPeerConnection> {
    if (this.peerConnections.has(userId)) {
      return this.peerConnections.get(userId)!;
    }

    const pc = new RTCPeerConnection(WEBRTC_CONFIG);

    // ICE adayı oluşturulduğunda
    pc.addEventListener('icecandidate', (event: any) => {
      if (event.candidate) {
        this.socket?.emit('webrtc-ice-candidate', {
          to: userId,
          candidate: event.candidate,
          from: this.userId,
          roomId: this.roomId
        });
      }
    });

    // Uzak akış eklendiğinde
    pc.addEventListener('addstream', (event: any) => {
      console.log(`Remote stream added from user: ${userId}`);
      if (this.onRemoteStreamCallback) {
        this.onRemoteStreamCallback(userId, event.stream);
      }
    });

    // Bağlantı durumu değiştiğinde
    pc.addEventListener('connectionstatechange', (event: any) => {
      console.log(`Connection state changed for ${userId}: ${pc.connectionState}`);
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        this.closePeerConnection(userId);
        if (this.onUserDisconnectedCallback) {
          this.onUserDisconnectedCallback(userId);
        }
      }
    });

    // Yerel akışı ekle
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        if (this.localStream) {
          pc.addTrack(track, this.localStream);
        }
      });
    }

    this.peerConnections.set(userId, pc);
    return pc;
  }

  // Teklif gönder
  private async sendOffer(userId: string) {
    const pc = this.peerConnections.get(userId);
    if (pc) {
      const offer = await pc.createOffer({});
      await pc.setLocalDescription(offer);

      this.socket?.emit('webrtc-offer', {
        to: userId,
        offer: offer.sdp,
        from: this.userId,
        roomId: this.roomId
      });
    }
  }

  // Peer bağlantısını kapat
  private closePeerConnection(userId: string) {
    const pc = this.peerConnections.get(userId);
    if (pc) {
      pc.close();
      this.peerConnections.delete(userId);
    }
  }

  // Sesli sohbet odasına katıl
  async joinVoiceChannel(channelId: string, audioOnly: boolean = true): Promise<MediaStream> {
    try {
      // Yerel medya akışını al
      this.localStream = await mediaDevices.getUserMedia({
        audio: true,
        video: !audioOnly
      });

      this.roomId = channelId;

      // Odaya katıl
      this.socket?.emit('join-voice-channel', {
        channelId,
        userId: this.userId
      });

      return this.localStream;
    } catch (error) {
      console.error('Error joining voice channel:', error);
      throw error;
    }
  }

  // Sesli sohbet odasından ayrıl
  leaveVoiceChannel() {
    if (this.roomId) {
      // Odadan ayrıl
      this.socket?.emit('leave-voice-channel', {
        channelId: this.roomId,
        userId: this.userId
      });

      // Tüm peer bağlantılarını kapat
      this.peerConnections.forEach((pc, userId) => {
        this.closePeerConnection(userId);
      });

      // Yerel akışı kapat
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop());
        this.localStream = null;
      }

      this.roomId = null;
    }
  }

  // Mikrofonu aç/kapat
  toggleMute(mute: boolean) {
    if (this.localStream) {
      const audioTracks = this.localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !mute;
      });
    }
  }

  // Kamerayı aç/kapat
  toggleVideo(videoOff: boolean) {
    if (this.localStream) {
      const videoTracks = this.localStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !videoOff;
      });
    }
  }

  // Ekran paylaşımını başlat (Not: React Native'de sınırlı destek var)
  async startScreenSharing(): Promise<boolean> {
    // React Native'de ekran paylaşımı için özel çözümler gerekebilir
    // Bu örnekte basit bir uyarı döndürüyoruz
    console.warn('Screen sharing is not fully supported in React Native');
    return false;
  }

  // Uzak akış callback'ini ayarla
  setOnRemoteStream(callback: (userId: string, stream: MediaStream) => void) {
    this.onRemoteStreamCallback = callback;
  }

  // Kullanıcı ayrıldı callback'ini ayarla
  setOnUserDisconnected(callback: (userId: string) => void) {
    this.onUserDisconnectedCallback = callback;
  }
}

export default new WebRTCService();
