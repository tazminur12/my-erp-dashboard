import { NextResponse } from 'next/server';
import { otpStore } from '@/lib/otpStore';

export async function POST(request) {
  try {
    const { email, otp } = await request.json();

    // Validation
    if (!email || !email.trim()) {
      return NextResponse.json({
        success: false,
        error: true,
        message: "Email is required"
      }, { status: 400 });
    }

    if (!otp || !otp.trim()) {
      return NextResponse.json({
        success: false,
        error: true,
        message: "OTP is required"
      }, { status: 400 });
    }

    // Find OTP data by email
    let foundPhone = null;
    let otpData = null;

    for (const [phone, data] of otpStore.entries()) {
      if (data.email === email.toLowerCase().trim()) {
        foundPhone = phone;
        otpData = data;
        break;
      }
    }

    if (!otpData) {
      return NextResponse.json({
        success: false,
        error: true,
        message: "OTP not found or expired. Please request a new OTP."
      }, { status: 400 });
    }

    // Check if OTP is expired
    if (new Date() > otpData.expiresAt) {
      // Clean up expired OTP
      otpStore.delete(foundPhone);

      return NextResponse.json({
        success: false,
        error: true,
        message: "OTP has expired. Please request a new OTP."
      }, { status: 400 });
    }

    // Check if OTP matches
    if (otpData.otp !== otp.trim()) {
      // Increment failed attempts
      otpData.attempts = (otpData.attempts || 0) + 1;

      // Block after 3 failed attempts
      if (otpData.attempts >= 3) {
        otpStore.delete(foundPhone);
        return NextResponse.json({
          success: false,
          error: true,
          message: "Too many failed attempts. Please request a new OTP."
        }, { status: 400 });
      }

      return NextResponse.json({
        success: false,
        error: true,
        message: "Invalid OTP. Please try again.",
        attemptsLeft: 3 - otpData.attempts
      }, { status: 400 });
    }

    // OTP is valid - delete it
    otpStore.delete(foundPhone);

    console.log(`✅ OTP verified successfully for ${email}`);

    return NextResponse.json({
      success: true,
      message: "OTP verified successfully",
      verified: true
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({
      success: false,
      error: true,
      message: "Internal server error while verifying OTP",
      details: error.message
    }, { status: 500 });
  }
}
