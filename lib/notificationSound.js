// Notification Sound Utility
// Uses Web Audio API to play notification sounds

class NotificationSoundManager {
  constructor() {
    this.audioContext = null;
    this.isEnabled = true;
    this.volume = 0.5;
    this.customSoundUrl = '/sounds/notification.mp3';
    this.audioElement = null;
  }

  // Initialize audio context (must be called after user interaction)
  init() {
    if (typeof window !== 'undefined' && !this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        console.warn('Web Audio API not supported:', e);
      }
    }
    return this;
  }

  // Set volume (0-1)
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.audioElement) {
      this.audioElement.volume = this.volume;
    }
    return this;
  }

  // Enable/disable notifications
  setEnabled(enabled) {
    this.isEnabled = enabled;
    return this;
  }

  // Play a custom sound file
  async playCustomSound(url = this.customSoundUrl) {
    if (!this.isEnabled || typeof window === 'undefined') return;

    try {
      // Try to play custom sound file first
      if (!this.audioElement) {
        this.audioElement = new Audio(url);
        this.audioElement.volume = this.volume;
      }
      
      this.audioElement.currentTime = 0;
      await this.audioElement.play();
    } catch (e) {
      // Fallback to generated tone if custom sound fails
      console.warn('Custom sound failed, using generated tone:', e);
      this.playGeneratedTone();
    }
  }

  // Play a generated notification tone using Web Audio API
  playGeneratedTone() {
    if (!this.isEnabled || typeof window === 'undefined') return;

    this.init();
    
    if (!this.audioContext) return;

    try {
      // Resume audio context if suspended
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      const currentTime = this.audioContext.currentTime;
      
      // Create oscillator for the tone
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Two-tone notification sound
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, currentTime); // A5
      oscillator.frequency.setValueAtTime(1108.73, currentTime + 0.1); // C#6
      oscillator.frequency.setValueAtTime(880, currentTime + 0.2); // A5
      
      // Volume envelope
      gainNode.gain.setValueAtTime(0, currentTime);
      gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, currentTime + 0.02);
      gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, currentTime + 0.25);
      gainNode.gain.linearRampToValueAtTime(0, currentTime + 0.3);
      
      oscillator.start(currentTime);
      oscillator.stop(currentTime + 0.3);
    } catch (e) {
      console.warn('Failed to play notification tone:', e);
    }
  }

  // Play double beep for important notifications
  playDoubleBeep() {
    if (!this.isEnabled || typeof window === 'undefined') return;

    this.init();
    
    if (!this.audioContext) return;

    try {
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      const currentTime = this.audioContext.currentTime;
      
      // First beep
      const osc1 = this.audioContext.createOscillator();
      const gain1 = this.audioContext.createGain();
      osc1.connect(gain1);
      gain1.connect(this.audioContext.destination);
      osc1.type = 'sine';
      osc1.frequency.value = 800;
      gain1.gain.setValueAtTime(0, currentTime);
      gain1.gain.linearRampToValueAtTime(this.volume * 0.3, currentTime + 0.02);
      gain1.gain.linearRampToValueAtTime(0, currentTime + 0.1);
      osc1.start(currentTime);
      osc1.stop(currentTime + 0.1);

      // Second beep
      const osc2 = this.audioContext.createOscillator();
      const gain2 = this.audioContext.createGain();
      osc2.connect(gain2);
      gain2.connect(this.audioContext.destination);
      osc2.type = 'sine';
      osc2.frequency.value = 1000;
      gain2.gain.setValueAtTime(0, currentTime + 0.15);
      gain2.gain.linearRampToValueAtTime(this.volume * 0.3, currentTime + 0.17);
      gain2.gain.linearRampToValueAtTime(0, currentTime + 0.25);
      osc2.start(currentTime + 0.15);
      osc2.stop(currentTime + 0.25);
    } catch (e) {
      console.warn('Failed to play double beep:', e);
    }
  }

  // Main play method - uses generated tone by default
  play() {
    this.playGeneratedTone();
  }
}

// Singleton instance
let notificationSoundInstance = null;

export const getNotificationSound = () => {
  if (typeof window === 'undefined') return null;
  
  if (!notificationSoundInstance) {
    notificationSoundInstance = new NotificationSoundManager();
  }
  return notificationSoundInstance;
};

export default NotificationSoundManager;
