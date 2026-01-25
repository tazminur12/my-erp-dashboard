import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import { otpStore, generateOTP, normalizePhone, maskPhone, sendSMS } from '@/lib/otpStore';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validation
    if (!email || !email.trim()) {
      return NextResponse.json({
        success: false,
        error: true,
        message: "Email is required"
      }, { status: 400 });
    }

    if (!password || !password.trim()) {
      return NextResponse.json({
        success: false,
        error: true,
        message: "Password is required"
      }, { status: 400 });
    }

    // Get database
    const db = await getDb();
    const usersCollection = db.collection('users');

    // Find user by email
    const user = await usersCollection.findOne({
      email: email.toLowerCase().trim()
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: true,
        message: "Invalid email or password"
      }, { status: 401 });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({
        success: false,
        error: true,
        message: "Invalid email or password"
      }, { status: 401 });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return NextResponse.json({
        success: false,
        error: true,
        message: "Your account has been deactivated"
      }, { status: 403 });
    }

    // Check system settings for OTP
    const settingsCollection = db.collection('system_settings');
    const systemSettings = await settingsCollection.findOne({ type: 'system' });
    const otpEnabled = systemSettings?.otpEnabled ?? true; // Default to true if not set

    // If OTP is disabled, return success with skipOtp flag
    if (!otpEnabled) {
      return NextResponse.json({
        success: true,
        skipOtp: true,
        message: "OTP verification is disabled. You can login directly."
      });
    }

    // Check if user has phone number
    if (!user.phone) {
      return NextResponse.json({
        success: false,
        error: true,
        message: "No phone number registered with this account. Please contact admin."
      }, { status: 400 });
    }

    // Normalize phone number
    const normalizedPhone = normalizePhone(user.phone);
    
    // Get OTP expiry from settings
    const otpExpiryMinutes = systemSettings?.otpExpiryMinutes ?? 5;

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + otpExpiryMinutes * 60 * 1000); // Use settings expiry

    // Store OTP with expiry and email
    otpStore.set(normalizedPhone, {
      otp,
      expiresAt,
      email: email.toLowerCase().trim(),
      attempts: 0
    });

    // Send OTP via SMS
    const smsMessage = `Salma Air Your login OTP is ${otp}. Valid for 5 minutes. Do not share this code.`;

    try {
      await sendSMS(normalizedPhone, smsMessage);
    } catch (smsError) {
      console.error('SMS sending failed:', smsError);
      // Clean up OTP store on SMS failure
      otpStore.delete(normalizedPhone);

      return NextResponse.json({
        success: false,
        error: true,
        message: "Failed to send OTP. Please try again.",
        details: smsError.message
      }, { status: 500 });
    }

    // Mask phone number for display
    const maskedPhone = maskPhone(user.phone);

    console.log(`OTP sent to ${normalizedPhone}: ${otp} (expires at ${expiresAt.toISOString()})`);

    return NextResponse.json({
      success: true,
      message: `OTP sent to ${maskedPhone}`,
      phone: maskedPhone,
      expiresIn: otpExpiryMinutes * 60 // seconds
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({
      success: false,
      error: true,
      message: "Internal server error while sending OTP",
      details: error.message
    }, { status: 500 });
  }
}
