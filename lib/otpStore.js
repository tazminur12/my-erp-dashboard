// Shared OTP store module
// In production, use Redis or database for better scalability

// Use global to persist across hot reloads in development
if (!global.otpStore) {
  global.otpStore = new Map();
}

export const otpStore = global.otpStore;

// Utility: Generate 6-digit OTP
export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Utility: Normalize Bangladesh phone number
export function normalizePhone(phone) {
  let normalizedPhone = phone.replace(/\D/g, ''); // Remove non-digits
  if (normalizedPhone.startsWith('0')) {
    normalizedPhone = '88' + normalizedPhone; // Add Bangladesh country code
  } else if (!normalizedPhone.startsWith('88')) {
    normalizedPhone = '88' + normalizedPhone;
  }
  return normalizedPhone;
}

// Utility: Mask phone number for display
export function maskPhone(phone) {
  const normalized = normalizePhone(phone);
  return normalized.substring(0, 4) + '*****' + normalized.slice(-3);
}

// Utility: Send SMS via sms.net.bd
export async function sendSMS(phone, message) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_SMS_API_KEY;
    const senderId = process.env.NEXT_PUBLIC_SMS_SENDER_ID;

    console.log('📱 SMS Configuration:', {
      senderIdConfigured: !!senderId,
      senderIdValue: senderId,
      apiKeyConfigured: !!apiKey
    });

    if (!apiKey || !senderId) {
      throw new Error('SMS credentials not configured');
    }

    const normalizedPhone = normalizePhone(phone);

    const payload = new URLSearchParams();
    payload.append('api_key', apiKey);
    payload.append('sender_id', senderId);
    payload.append('to', normalizedPhone);
    payload.append('msg', message);

    console.log('📤 Sending SMS:', {
      to: normalizedPhone,
      from: senderId,
      messageLength: message.length
    });

    const response = await fetch('https://api.sms.net.bd/sendsms', {
      method: 'POST',
      body: payload,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SMS API error:', errorText);
      throw new Error(`SMS API responded with ${response.status}`);
    }

    const result = await response.text();
    console.log('SMS sent successfully:', { phone: normalizedPhone, result });
    return { success: true, result };

  } catch (error) {
    console.error('SMS sending failed:', error);
    throw error;
  }
}

// Cleanup expired OTPs
export function cleanupExpiredOTPs() {
  const now = new Date();
  let cleanedCount = 0;

  for (const [phone, data] of otpStore.entries()) {
    if (now > data.expiresAt) {
      otpStore.delete(phone);
      cleanedCount++;
    }
  }

  if (cleanedCount > 0) {
    console.log(`🧹 Cleaned up ${cleanedCount} expired OTPs`);
  }
}

// Initialize cleanup interval (only once)
if (typeof global.otpCleanupInitialized === 'undefined') {
  global.otpCleanupInitialized = true;
  setInterval(cleanupExpiredOTPs, 60000); // Run every 1 minute
}
