'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Swal from 'sweetalert2';
import dynamic from 'next/dynamic';
import { 
  Mail, 
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Smartphone,
  RefreshCw,
  CheckCircle
} from 'lucide-react';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState(1); // 1: credentials, 2: OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [animationData, setAnimationData] = useState(null);
  const [maskedPhone, setMaskedPhone] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const router = useRouter();
  const otpInputRefs = useRef([]);

  useEffect(() => {
    fetch('/login/Login.json')
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch((err) => console.error('Failed to load animation:', err));
  }, []);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (step === 2) {
      setCanResend(true);
    }
  }, [countdown, step]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return { isValid: false, message: 'Email address is required' };
    }
    if (!emailRegex.test(email)) {
      return { isValid: false, message: 'Please enter a valid email address' };
    }
    return { isValid: true };
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  // Handle OTP input
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only keep last digit
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    if (error) setError('');
  };

  // Handle OTP paste
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      otpInputRefs.current[5]?.focus();
    }
  };

  // Handle OTP backspace
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.email.trim()) {
        setError('Email address is required');
        Swal.fire({
          icon: 'warning',
          title: 'Email Required',
          text: 'Please enter your email address.',
          confirmButtonColor: '#3b82f6',
        });
        setLoading(false);
        return;
      }
      
      if (!formData.password.trim()) {
        setError('Password is required');
        Swal.fire({
          icon: 'warning',
          title: 'Password Required',
          text: 'Please enter your password.',
          confirmButtonColor: '#3b82f6',
        });
        setLoading(false);
        return;
      }
      
      const emailValidation = validateEmail(formData.email);
      if (!emailValidation.isValid) {
        setError(emailValidation.message);
        Swal.fire({
          icon: 'error',
          title: 'Invalid Email',
          text: emailValidation.message,
          confirmButtonColor: '#3b82f6',
        });
        setLoading(false);
        return;
      }

      // Call send-otp API
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || 'Failed to send OTP');
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.message || 'Failed to send OTP. Please try again.',
          confirmButtonColor: '#3b82f6',
        });
        setLoading(false);
        return;
      }

      // Check if OTP is disabled - login directly
      if (data.skipOtp) {
        // OTP is disabled, login directly with NextAuth
        const result = await signIn('credentials', {
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          redirect: false,
        });

        if (result?.error) {
          setError(result.error);
          Swal.fire({
            icon: 'error',
            title: 'Login Failed',
            text: result.error,
            confirmButtonColor: '#3b82f6',
          });
          setLoading(false);
          return;
        }

        Swal.fire({
          icon: 'success',
          title: 'Login Successful!',
          text: 'Redirecting to dashboard...',
          confirmButtonColor: '#3b82f6',
          timer: 1500,
          showConfirmButton: false,
        });

        router.push('/dashboard');
        return;
      }

      // Success - move to OTP step
      setMaskedPhone(data.phone);
      setStep(2);
      setCountdown(data.expiresIn || 300); // Use server expiry time
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      
      Swal.fire({
        icon: 'success',
        title: 'OTP Sent!',
        text: `OTP has been sent to ${data.phone}`,
        confirmButtonColor: '#3b82f6',
        timer: 2000,
        showConfirmButton: false,
      });

      // Focus first OTP input after a short delay
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);

    } catch (error) {
      console.error('Send OTP error:', error);
      setError('Failed to send OTP. Please try again.');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to send OTP. Please try again.',
        confirmButtonColor: '#3b82f6',
      });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and Login
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      setError('Please enter complete 6-digit OTP');
      Swal.fire({
        icon: 'warning',
        title: 'Invalid OTP',
        text: 'Please enter complete 6-digit OTP.',
        confirmButtonColor: '#3b82f6',
      });
      setLoading(false);
      return;
    }

    try {
      // Verify OTP
      const verifyResponse = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          otp: otpCode,
        }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok || !verifyData.success) {
        setError(verifyData.message || 'Invalid OTP');
        Swal.fire({
          icon: 'error',
          title: 'Invalid OTP',
          text: verifyData.message || 'Invalid OTP. Please try again.',
          confirmButtonColor: '#3b82f6',
        });
        
        // Clear OTP inputs on error
        setOtp(['', '', '', '', '', '']);
        otpInputRefs.current[0]?.focus();
        setLoading(false);
        return;
      }

      // OTP verified - proceed with NextAuth login
      const result = await signIn('credentials', {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Login failed. Please try again.');
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: 'Login failed. Please try again.',
          confirmButtonColor: '#3b82f6',
        });
        setLoading(false);
        return;
      }

      if (result?.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Welcome Back!',
          text: 'You have been logged in successfully.',
          confirmButtonColor: '#3b82f6',
          timer: 1500,
          showConfirmButton: false,
        });
        
        setTimeout(() => {
          router.push('/dashboard');
          router.refresh();
        }, 500);
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      setError('Verification failed. Please try again.');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Verification failed. Please try again.',
        confirmButtonColor: '#3b82f6',
      });
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return;
    
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.message || 'Failed to resend OTP.',
          confirmButtonColor: '#3b82f6',
        });
        setLoading(false);
        return;
      }

      setCountdown(300);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      
      Swal.fire({
        icon: 'success',
        title: 'OTP Sent!',
        text: `New OTP has been sent to ${data.phone}`,
        confirmButtonColor: '#3b82f6',
        timer: 2000,
        showConfirmButton: false,
      });

      otpInputRefs.current[0]?.focus();

    } catch (error) {
      console.error('Resend OTP error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to resend OTP.',
        confirmButtonColor: '#3b82f6',
      });
    } finally {
      setLoading(false);
    }
  };

  // Go back to step 1
  const handleBack = () => {
    setStep(1);
    setOtp(['', '', '', '', '', '']);
    setError('');
    setCountdown(0);
    setCanResend(false);
  };

  // Format countdown
  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Left Side - Animation */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative ">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTRWMjhIMjR2Mmgxem0tMTIgMGgtMnYySDE0di0yaC0yeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-8 xl:p-12">
          {/* Animation */}
          <div className="w-full max-w-lg xl:max-w-xl">
            {animationData ? (
              <Lottie
                animationData={animationData}
                loop
                autoplay
                className="w-full h-auto"
              />
            ) : (
              <div className="w-full h-80 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          
          {step === 1 ? (
            /* Step 1: Email & Password */
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Sign In
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Enter your credentials to receive OTP
                </p>
              </div>

              {/* Login Form */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
                <form onSubmit={handleSendOtp} className="space-y-6">
                  {/* Email Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 transition-all duration-200"
                        placeholder="you@company.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full pl-12 pr-12 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 transition-all duration-200"
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-xl p-4">
                      {error}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3.5 px-4 rounded-xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        Send OTP
                        <Smartphone className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            /* Step 2: OTP Verification */
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Smartphone className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Verify OTP
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Enter the 6-digit code sent to
                </p>
                <p className="text-blue-600 dark:text-blue-400 font-semibold mt-1">
                  {maskedPhone}
                </p>
              </div>

              {/* OTP Form */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  {/* OTP Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 text-center">
                      Enter OTP Code
                    </label>
                    <div className="flex justify-center gap-2 sm:gap-3">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => (otpInputRefs.current[index] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          onPaste={handleOtpPaste}
                          className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Countdown Timer */}
                  <div className="text-center">
                    {countdown > 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        OTP expires in <span className="font-semibold text-blue-600 dark:text-blue-400">{formatCountdown(countdown)}</span>
                      </p>
                    ) : (
                      <p className="text-sm text-red-500">OTP has expired</p>
                    )}
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-xl p-4">
                      {error}
                    </div>
                  )}

                  {/* Verify Button */}
                  <button
                    type="submit"
                    disabled={loading || otp.join('').length !== 6}
                    className="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3.5 px-4 rounded-xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify & Sign In
                        <CheckCircle className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </button>

                  {/* Resend & Back */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={!canResend || loading}
                      className={`flex items-center text-sm transition-colors ${
                        canResend && !loading
                          ? 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300'
                          : 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                      Resend OTP
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}

          {/* Footer */}
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-8">
            © {new Date().getFullYear()} ERP Dashboard. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
