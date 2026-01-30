'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import DashboardLayout from '../../../../component/DashboardLayout';
import { 
  ArrowLeft,
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  FileText, 
  Save,
  Users,
  Loader2,
  Search,
  X,
  MessageCircle,
  Wand2,
  Upload,
  ChevronLeft,
  ChevronRight,
  CheckCircle
} from 'lucide-react';
import Swal from 'sweetalert2';
import divisionData from '../../../../jsondata/AllDivision.json';
import { CLOUDINARY_CONFIG, validateCloudinaryConfig } from '../../../../../config/cloudinary.js';

const EditPassenger = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  
  // Form submission loading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
  const stepTitles = [
    'কাস্টমার তথ্য',
    'পাসপোর্ট তথ্য',
    'পরিবার তথ্য',
    'ডকুমেন্ট'
  ];
  
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };
  
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  const goToStep = (step) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  };
  
  const [formData, setFormData] = useState({
    // কাস্টমার তথ্য
    customerType: '',
    name: '',
    banglaName: '',
    firstName: '',
    lastName: '',
    mobile: '',
    whatsappNo: '',
    email: '',
    occupation: '',
    address: '',
    division: '',
    district: '',
    upazila: '',
    postCode: '',
    
    // পাসপোর্ট তথ্য
    passportNumber: '',
    passportType: '',
    issueDate: '',
    expiryDate: '',
    dateOfBirth: '',
    nidNumber: '',
    passportFirstName: '',
    passportLastName: '',
    nationality: '',
    previousPassport: '',
    gender: '',
    
    // পরিবার তথ্য
    fatherName: '',
    motherName: '',
    spouseName: '',
    maritalStatus: '',
    
    // অতিরিক্ত তথ্য
    customerImage: null,
    isActive: true,
    notes: '',
    referenceBy: '',
    referenceCustomerId: '',
    passportCopy: null,
    nidCopy: null
  });

  const [useMobileAsWhatsApp, setUseMobileAsWhatsApp] = useState(false);

  const [imagePreview, setImagePreview] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [uploadedImageData, setUploadedImageData] = useState(null);
  
  // Document upload states
  const [passportCopyUploading, setPassportCopyUploading] = useState(false);
  const [passportCopyPreview, setPassportCopyPreview] = useState(null);
  const [nidCopyUploading, setNidCopyUploading] = useState(false);
  const [nidCopyPreview, setNidCopyPreview] = useState(null);
  
  // Date states for DatePicker
  const [issueDate, setIssueDate] = useState(null);
  const [expiryDate, setExpiryDate] = useState(null);
  const [dateOfBirth, setDateOfBirth] = useState(null);
  const [passportScanFile, setPassportScanFile] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  
  // Division data from JSON
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [upazilas, setUpazilas] = useState([]);
  
  // Reference customer search states
  const [showReferenceSearchModal, setShowReferenceSearchModal] = useState(false);
  const [referenceSearchTerm, setReferenceSearchTerm] = useState('');
  const [referenceSearchResults, setReferenceSearchResults] = useState([]);
  const [referenceSearchLoading, setReferenceSearchLoading] = useState(false);
  
  // Load division data on component mount
  useEffect(() => {
    if (divisionData.Bangladesh) {
      setDivisions(divisionData.Bangladesh.map(item => item.Division));
    }
    
    if (!validateCloudinaryConfig()) {
      console.warn('Cloudinary configuration is incomplete');
    }
  }, []);

  useEffect(() => {
    const loadPassenger = async () => {
      if (!id) return;
      try {
        const response = await fetch(`/api/air-customers/${id}`);
        const result = await response.json();
        if (response.ok && result.passenger) {
          const p = result.passenger;
          setFormData({
            customerType: p.customerType || '',
            name: p.name || '',
            banglaName: p.banglaName || '',
            firstName: p.firstName || '',
            lastName: p.lastName || '',
            mobile: p.mobile || '',
            whatsappNo: p.whatsappNo || '',
            email: p.email || '',
            occupation: p.occupation || '',
            address: p.address || '',
            division: p.division || '',
            district: p.district || '',
            upazila: p.upazila || '',
            postCode: p.postCode || '',
            passportNumber: p.passportNumber || '',
            passportType: p.passportType || '',
            issueDate: p.issueDate || '',
            expiryDate: p.expiryDate || '',
            dateOfBirth: p.dateOfBirth || '',
            nidNumber: p.nidNumber || '',
            passportFirstName: p.passportFirstName || '',
            passportLastName: p.passportLastName || '',
            nationality: p.nationality || '',
            previousPassport: p.previousPassport || '',
            gender: p.gender || '',
            fatherName: p.fatherName || '',
            motherName: p.motherName || '',
            spouseName: p.spouseName || '',
            maritalStatus: p.maritalStatus || '',
            customerImage: p.customerImage || null,
            isActive: p.isActive ?? true,
            notes: p.notes || '',
            referenceBy: p.referenceBy || '',
            referenceCustomerId: p.referenceCustomerId || '',
            passportCopy: p.passportCopy || null,
            nidCopy: p.nidCopy || null
          });
          if (p.issueDate) setIssueDate(new Date(p.issueDate));
          if (p.expiryDate) setExpiryDate(new Date(p.expiryDate));
          if (p.dateOfBirth) setDateOfBirth(new Date(p.dateOfBirth));
          if (p.division) {
            const selectedDivision = divisionData.Bangladesh.find(item => item.Division === p.division);
            if (selectedDivision) {
              setDistricts(selectedDivision.Districts.map(item => item.District));
              if (p.district) {
                const selectedDistrict = selectedDivision.Districts.find(item => item.District === p.district);
                if (selectedDistrict) setUpazilas(selectedDistrict.Upazilas);
              }
            }
          }
          setImagePreview(null);
          setPassportCopyPreview(null);
          setNidCopyPreview(null);
        }
      } catch (e) {
      }
    };
    loadPassenger();
  }, [id]);

  // Update districts when division changes
  useEffect(() => {
    if (formData.division) {
      const selectedDivision = divisionData.Bangladesh.find(item => item.Division === formData.division);
      if (selectedDivision) {
        setDistricts(selectedDivision.Districts.map(item => item.District));
        setUpazilas([]);
        if (!formData.district) setFormData(prev => ({ ...prev, district: '', upazila: '' }));
      }
    } else {
      setDistricts([]);
      setUpazilas([]);
    }
  }, [formData.division]);

  // Update upazilas when district changes
  useEffect(() => {
    if (formData.division && formData.district) {
      const selectedDivision = divisionData.Bangladesh.find((item) => item.Division === formData.division);
      if (selectedDivision) {
        const selectedDistrict = selectedDivision.Districts.find(item => item.District === formData.district);
        if (selectedDistrict) {
          setUpazilas(selectedDistrict.Upazilas);
          if (!formData.upazila) setFormData(prev => ({ ...prev, upazila: '' }));
        }
      }
    } else {
      setUpazilas([]);
    }
  }, [formData.division, formData.district]);

  // Update WhatsApp number when mobile number changes and checkbox is checked
  useEffect(() => {
    if (useMobileAsWhatsApp && formData.mobile) {
      setFormData(prev => ({ ...prev, whatsappNo: formData.mobile }));
    } else if (!useMobileAsWhatsApp) {
      setFormData(prev => ({ ...prev, whatsappNo: '' }));
    }
  }, [formData.mobile, useMobileAsWhatsApp]);

  // Auto-fill Full Name when First Name or Last Name changes
  useEffect(() => {
    const fullName = `${formData.firstName || ''} ${formData.lastName || ''}`.trim();
    setFormData(prev => ({ ...prev, name: fullName }));
  }, [formData.firstName, formData.lastName]);

  // Search air customers for reference
  useEffect(() => {
    const searchCustomers = async () => {
      if (!showReferenceSearchModal || !referenceSearchTerm.trim()) {
        setReferenceSearchResults([]);
        return;
      }

      setReferenceSearchLoading(true);
      try {
        const response = await fetch(`/api/air-customers?search=${encodeURIComponent(referenceSearchTerm.trim())}&limit=20`);
        const result = await response.json();
        
        if (response.ok) {
          setReferenceSearchResults(result.data || []);
        } else {
          setReferenceSearchResults([]);
        }
      } catch (error) {
        console.error('Error searching customers:', error);
        setReferenceSearchResults([]);
      } finally {
        setReferenceSearchLoading(false);
      }
    };

    const timeoutId = setTimeout(searchCustomers, 300);
    return () => clearTimeout(timeoutId);
  }, [referenceSearchTerm, showReferenceSearchModal]);

  // Handle checkbox change
  const handleWhatsAppCheckboxChange = (e) => {
    const isChecked = e.target.checked;
    setUseMobileAsWhatsApp(isChecked);
    
    if (isChecked && formData.mobile) {
      setFormData(prev => ({ ...prev, whatsappNo: formData.mobile }));
    } else if (!isChecked) {
      setFormData(prev => ({ ...prev, whatsappNo: '' }));
    }
  };

  // Real OCR/MRZ extraction via backend API
  const scanPassportViaApi = async (file) => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch('/api/passport/scan', {
      method: 'POST',
      body: form
    });
    if (!res.ok) {
      throw new Error('Scan failed');
    }
    const data = await res.json();
    return data || {};
  };

  const handlePassportScanFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    setPassportScanFile(file || null);
  };

  const handleScanAndFill = async () => {
    if (!passportScanFile) return;
    setIsScanning(true);
    try {
      const parsed = await scanPassportViaApi(passportScanFile);
      setFormData((prev) => ({
        ...prev,
        passportNumber: parsed.passportNumber || prev.passportNumber,
        passportFirstName: parsed.passportFirstName || prev.passportFirstName,
        passportLastName: parsed.passportLastName || prev.passportLastName,
        nationality: parsed.nationality || prev.nationality,
        dateOfBirth: parsed.dateOfBirth || prev.dateOfBirth,
        issueDate: parsed.issueDate || prev.issueDate,
        expiryDate: parsed.expiryDate || prev.expiryDate,
        gender: parsed.gender || prev.gender,
        previousPassport: parsed.previousPassport || prev.previousPassport,
        nidNumber: parsed.nidNumber || prev.nidNumber,
      }));
      if (parsed.dateOfBirth) setDateOfBirth(new Date(parsed.dateOfBirth));
      if (parsed.issueDate) setIssueDate(new Date(parsed.issueDate));
      if (parsed.expiryDate) setExpiryDate(new Date(parsed.expiryDate));
    } catch (err) {
      Swal.fire({
        title: 'স্ক্যান ব্যর্থ',
        text: 'পাসপোর্ট স্ক্যান করা যায়নি। পরে আবার চেষ্টা করুন।',
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setIsScanning(false);
    }
  };

  // Date change handlers
  const handleIssueDateChange = (date) => {
    setIssueDate(date);
    setFormData(prev => ({ 
      ...prev, 
      issueDate: date ? date.toISOString().split('T')[0] : '' 
    }));
  };

  const handleExpiryDateChange = (date) => {
    setExpiryDate(date);
    setFormData(prev => ({ 
      ...prev, 
      expiryDate: date ? date.toISOString().split('T')[0] : '' 
    }));
  };

  const handleDateOfBirthChange = (date) => {
    setDateOfBirth(date);
    setFormData(prev => ({ 
      ...prev, 
      dateOfBirth: date ? date.toISOString().split('T')[0] : '' 
    }));
  };

  // Cloudinary Upload Function
  const uploadToCloudinary = async (file) => {
    try {
      if (!validateCloudinaryConfig()) {
        throw new Error('Cloudinary configuration is incomplete. Please check your .env.local file.');
      }
      
      setImageUploading(true);
      
      if (!file || !file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file');
      }
      
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }
      
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', file);
      cloudinaryFormData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);
      cloudinaryFormData.append('folder', 'air-passengers');
      
      const response = await fetch(CLOUDINARY_CONFIG.UPLOAD_URL, {
        method: 'POST',
        body: cloudinaryFormData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Upload failed with status: ${response.status}`);
      }
      
      const result = await response.json();
      const imageUrl = result.secure_url;
      
      setUploadedImageUrl(imageUrl);
      setUploadedImageData({ cloudinaryUrl: imageUrl });
      setFormData(prev => ({ ...prev, customerImage: imageUrl }));
      
      Swal.fire({
        title: 'সফল!',
        text: 'ছবি Cloudinary এ আপলোড হয়েছে!',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });
    } catch (error) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'ছবি আপলোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setImageUploading(false);
    }
  };

  // Remove uploaded image
  const handleRemoveImage = () => {
    setImagePreview(null);
    setUploadedImageUrl('');
    setUploadedImageData(null);
    setFormData(prev => ({ ...prev, customerImage: null }));
    
    Swal.fire({
      title: 'ছবি সরানো হয়েছে!',
      text: 'আপলোড করা ছবি সরানো হয়েছে।',
      icon: 'info',
      confirmButtonText: 'ঠিক আছে',
      confirmButtonColor: '#3B82F6'
    });
  };

  // Upload Passport Copy to Cloudinary
  const uploadPassportCopy = useCallback(async (file) => {
    try {
      if (!validateCloudinaryConfig()) {
        throw new Error('Cloudinary configuration is incomplete.');
      }
      setPassportCopyUploading(true);

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setPassportCopyPreview(e.target.result);
        reader.readAsDataURL(file);
      }

      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', file);
      cloudinaryFormData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);
      cloudinaryFormData.append('folder', 'air-passengers/passport');

      const response = await fetch(CLOUDINARY_CONFIG.UPLOAD_URL, {
        method: 'POST',
        body: cloudinaryFormData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Upload failed');
      }

      const result = await response.json();
      setFormData(prev => ({ ...prev, passportCopy: result.secure_url }));

      Swal.fire({
        title: 'সফল!',
        text: 'পাসপোর্ট কপি আপলোড হয়েছে!',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });
    } catch (error) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'ফাইল আপলোড করতে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
      setPassportCopyPreview(null);
    } finally {
      setPassportCopyUploading(false);
    }
  }, []);

  // Upload NID Copy to Cloudinary
  const uploadNidCopy = useCallback(async (file) => {
    try {
      if (!validateCloudinaryConfig()) {
        throw new Error('Cloudinary configuration is incomplete.');
      }
      setNidCopyUploading(true);

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setNidCopyPreview(e.target.result);
        reader.readAsDataURL(file);
      }

      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', file);
      cloudinaryFormData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);
      cloudinaryFormData.append('folder', 'air-passengers/nid');

      const response = await fetch(CLOUDINARY_CONFIG.UPLOAD_URL, {
        method: 'POST',
        body: cloudinaryFormData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Upload failed');
      }

      const result = await response.json();
      setFormData(prev => ({ ...prev, nidCopy: result.secure_url }));

      Swal.fire({
        title: 'সফল!',
        text: 'NID কপি আপলোড হয়েছে!',
        icon: 'success',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#10B981',
      });
    } catch (error) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'ফাইল আপলোড করতে সমস্যা হয়েছে।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
      setNidCopyPreview(null);
    } finally {
      setNidCopyUploading(false);
    }
  }, []);

  // Remove passport copy
  const handleRemovePassportCopy = () => {
    setPassportCopyPreview(null);
    setFormData(prev => ({ ...prev, passportCopy: null }));
  };

  // Remove NID copy
  const handleRemoveNidCopy = () => {
    setNidCopyPreview(null);
    setFormData(prev => ({ ...prev, nidCopy: null }));
  };

  // Select reference customer
  const selectReferenceCustomer = (customer) => {
    setFormData(prev => ({
      ...prev,
      referenceBy: customer.name,
      referenceCustomerId: customer.customerId
    }));
    setShowReferenceSearchModal(false);
    setReferenceSearchTerm('');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      const file = files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
        uploadToCloudinary(file);
      }
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (currentStep !== totalSteps) {
      nextStep();
      return;
    }
    
    if (imageUploading || passportCopyUploading || nidCopyUploading) {
      Swal.fire({
        title: 'অপেক্ষা করুন!',
        text: 'ডকুমেন্ট আপলোড হচ্ছে। দয়া করে অপেক্ষা করুন।',
        icon: 'info',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#3B82F6',
      });
      return;
    }
    
    if (!(formData.firstName && formData.firstName.trim())) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'কাস্টমারের নাম অবশ্যই পূরণ করতে হবে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
      return;
    }
    
    if (!formData.mobile) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'মোবাইল নম্বর অবশ্যই পূরণ করতে হবে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
      return;
    }
    
    const mobileRegex = /^01[3-9]\d{8}$/;
    if (!mobileRegex.test(formData.mobile)) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'সঠিক মোবাইল নম্বর লিখুন (01XXXXXXXXX)',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
      return;
    }
    
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        Swal.fire({
          title: 'ত্রুটি!',
          text: 'সঠিক ইমেইল ঠিকানা লিখুন',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
        });
        return;
      }
    }
    
    const customerData = {
      name: formData.name || null,
      firstName: formData.firstName || null,
      lastName: formData.lastName || null,
      mobile: formData.mobile,
      email: formData.email || null,
      occupation: formData.occupation || null,
      address: formData.address || null,
      division: formData.division || null,
      district: formData.district || null,
      upazila: formData.upazila || null,
      postCode: formData.postCode || null,
      whatsappNo: formData.whatsappNo || null,
      customerType: formData.customerType || null,
      customerImage: formData.customerImage || null,
      passportNumber: formData.passportNumber || null,
      passportType: formData.passportType || null,
      issueDate: formData.issueDate || null,
      expiryDate: formData.expiryDate || null,
      dateOfBirth: formData.dateOfBirth || null,
      nidNumber: formData.nidNumber || null,
      passportFirstName: formData.passportFirstName || null,
      passportLastName: formData.passportLastName || null,
      nationality: formData.nationality || null,
      previousPassport: formData.previousPassport || null,
      gender: formData.gender || null,
      fatherName: formData.fatherName || null,
      motherName: formData.motherName || null,
      spouseName: formData.spouseName || null,
      maritalStatus: formData.maritalStatus || null,
      notes: formData.notes || null,
      referenceBy: formData.referenceBy || null,
      referenceCustomerId: formData.referenceCustomerId || null,
      passportCopy: formData.passportCopy || null,
      nidCopy: formData.nidCopy || null
    };
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/air-customers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      });

      const result = await response.json();

      if (response.ok) {
        Swal.fire({
          title: 'সফল!',
          text: 'এয়ার প্যাসেঞ্জার সফলভাবে আপডেট হয়েছে!',
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
        }).then(() => {
          router.push(`/air-ticketing/passengers/${id}`);
        });
      } else {
        throw new Error(result.error || 'Failed to create air customer');
      }
    } catch (error) {
      console.error('Error creating air customer:', error);
      Swal.fire({
        title: 'ত্রুটি!',
        text: error.message || 'কাস্টমার যোগ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      {/* Custom DatePicker Styles */}
      <style jsx global>{`
        .react-datepicker-popper {
          z-index: 9999 !important;
        }
        
        .react-datepicker {
          font-family: inherit;
          border: 1px solid #d1d5db;
          border-radius: 12px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          background: #ffffff;
        }
        
        .dark .react-datepicker {
          border-color: #374151;
          background: #1f2937;
        }
        
        .react-datepicker__header {
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          border-radius: 12px 12px 0 0;
          padding: 16px;
        }
        
        .dark .react-datepicker__header {
          background: #374151;
          border-bottom-color: #4b5563;
        }
        
        .react-datepicker__current-month {
          color: #111827;
          font-weight: 600;
          font-size: 16px;
        }
        
        .dark .react-datepicker__current-month {
          color: #f9fafb;
        }
        
        .react-datepicker__day-name {
          color: #6b7280;
          font-weight: 500;
          font-size: 14px;
        }
        
        .dark .react-datepicker__day-name {
          color: #9ca3af;
        }
        
        .react-datepicker__day {
          color: #111827;
          border-radius: 8px;
          margin: 2px;
          width: 32px;
          height: 32px;
          line-height: 30px;
          font-size: 14px;
          transition: all 0.2s ease;
        }
        
        .dark .react-datepicker__day {
          color: #f9fafb;
        }
        
        .react-datepicker__day:hover {
          background: #e5e7eb;
          color: #111827;
        }
        
        .dark .react-datepicker__day:hover {
          background: #4b5563;
          color: #ffffff;
        }
        
        .react-datepicker__day--selected {
          background: #3b82f6 !important;
          color: #ffffff !important;
        }
        
        .react-datepicker__day--keyboard-selected {
          background: #e5e7eb;
          color: #111827;
        }
        
        .dark .react-datepicker__day--keyboard-selected {
          background: #4b5563;
          color: #ffffff;
        }
        
        .react-datepicker__day--today {
          background: #f3f4f6;
          color: #111827;
          font-weight: 600;
        }
        
        .dark .react-datepicker__day--today {
          background: #374151;
          color: #f9fafb;
        }
        
        .react-datepicker__day--disabled {
          color: #9ca3af;
          cursor: not-allowed;
        }
        
        .dark .react-datepicker__day--disabled {
          color: #6b7280;
        }
        
        .react-datepicker__month-container {
          background: #ffffff;
        }
        
        .dark .react-datepicker__month-container {
          background: #1f2937;
        }
      `}</style>
      
      <div className="min-h-screen p-2 lg:p-4 transition-colors duration-300 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.push('/air-ticketing/passengers')}
              className="flex items-center mb-4 transition-colors duration-200 font-medium text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to List
            </button>
            
            <div className="text-center">
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
                এয়ার প্যাসেঞ্জার আপডেট করুন
              </h1>
              <p className="mt-1 text-sm lg:text-base text-gray-600 dark:text-gray-300">
                এখানে এয়ার প্যাসেঞ্জার তথ্য আপডেট করুন
              </p>
            </div>
          </div>

          {/* Step Progress Indicator */}
          <div className="mb-8 rounded-xl shadow-lg p-6 border bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-gray-900/50">
            <div className="flex items-center justify-between">
              {stepTitles.map((title, index) => {
                const stepNum = index + 1;
                const isActive = currentStep === stepNum;
                const isCompleted = currentStep > stepNum;
                
                return (
                  <div key={stepNum} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <button
                        type="button"
                        onClick={() => goToStep(stepNum)}
                        className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                          isActive
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : isCompleted
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <span className="font-semibold">{stepNum}</span>
                        )}
                      </button>
                      <span className={`mt-2 text-xs font-medium text-center ${
                        isActive
                          ? 'text-blue-600 dark:text-blue-400'
                          : isCompleted
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {title}
                      </span>
                    </div>
                    {stepNum < totalSteps && (
                      <div className={`flex-1 h-0.5 mx-2 ${
                        isCompleted
                          ? 'bg-green-500'
                          : currentStep > stepNum
                          ? 'bg-green-500'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <form 
            onSubmit={handleSubmit} 
            className="space-y-4"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && currentStep !== totalSteps) {
                e.preventDefault();
                nextStep();
              }
            }}
          >
            {/* Step 1: কাস্টমার তথ্য Section */}
            {currentStep === 1 && (
              <div className="rounded-xl shadow-lg p-4 lg:p-6 border bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-gray-900/50">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">কাস্টমার তথ্য</h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* নাম: First & Last */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200">
                      নাম * (First & Last)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <User className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          placeholder="First Name"
                          className="w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          placeholder="Last Name"
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Full Name (Auto-filled) */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Full Name"
                        readOnly
                        className="w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm cursor-not-allowed bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400"
                      />
                    </div>
                  </div>

                  {/* Bangla Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200">
                      নাম (বাংলা)
                    </label>
                    <div className="relative">
                      <User className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <input
                        type="text"
                        name="banglaName"
                        value={formData.banglaName}
                        onChange={handleInputChange}
                        placeholder="বাংলায় নাম লিখুন"
                        className="w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                      />
                    </div>
                  </div>

                  {/* মোবাইল নাম্বার */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200">
                      মোবাইল নাম্বার *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <input
                        type="tel"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        required
                        placeholder="017xxxxxxxx"
                        className="w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="useMobileAsWhatsApp"
                        checked={useMobileAsWhatsApp}
                        onChange={handleWhatsAppCheckboxChange}
                        className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:outline-none focus:ring-0 focus:ring-offset-0"
                      />
                      <label htmlFor="useMobileAsWhatsApp" className="text-xs text-gray-600 dark:text-gray-300">
                        এটিই WhatsApp No?
                      </label>
                    </div>
                  </div>

                  {/* WhatsApp নাম্বার */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200">
                      WhatsApp নাম্বার
                      {useMobileAsWhatsApp && (
                        <span className="ml-2 text-xs text-green-600 font-normal">
                          (মোবাইল নাম্বার থেকে কপি করা হয়েছে)
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <input
                        type="tel"
                        name="whatsappNo"
                        value={formData.whatsappNo}
                        onChange={handleInputChange}
                        placeholder="017xxxxxxxx"
                        disabled={useMobileAsWhatsApp}
                        className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 ${useMobileAsWhatsApp ? 'opacity-50 cursor-not-allowed' : ''}`}
                      />
                      {formData.whatsappNo && (
                        <button
                          type="button"
                          onClick={() => {
                            if (!formData.whatsappNo.trim()) {
                              Swal.fire({
                                icon: 'warning',
                                title: 'No WhatsApp Number',
                                text: 'Please enter a WhatsApp number first'
                              });
                              return;
                            }
                            
                            const num = formData.whatsappNo.replace(/\D/g, '');
                            const url = `https://wa.me/88${num}`;
                            window.open(url, '_blank');
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                          title="Open WhatsApp"
                        >
                          <MessageCircle className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* পেশা */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200">
                      পেশা (Occupation)
                    </label>
                    <input
                      type="text"
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleInputChange}
                      placeholder="Occupation"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                    />
                  </div>

                  {/* ইমেইল */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                      ইমেইল
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="example@email.com"
                        className="w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                      />
                    </div>
                  </div>

                  {/* বিভাগ */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                      বিভাগ
                    </label>
                    <select
                      name="division"
                      value={formData.division}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    >
                      <option value="">বিভাগ নির্বাচন করুন</option>
                      {divisions.map(division => (
                        <option key={division} value={division}>
                          {division}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      বিভাগ নির্বাচন করার পর জেলা এবং উপজেলা নির্বাচন করতে পারবেন
                    </p>
                  </div>

                  {/* জেলা */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                      জেলা
                    </label>
                    <select
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      disabled={!formData.division}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white ${!formData.division ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <option value="">
                        {formData.division ? 'জেলা নির্বাচন করুন' : 'প্রথমে বিভাগ নির্বাচন করুন'}
                      </option>
                      {districts.map(district => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* উপজেলা */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                      উপজেলা
                    </label>
                    <select
                      name="upazila"
                      value={formData.upazila}
                      onChange={handleInputChange}
                      disabled={!formData.district}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white ${!formData.district ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <option value="">
                        {formData.district ? 'উপজেলা নির্বাচন করুন' : 'প্রথমে জেলা নির্বাচন করুন'}
                      </option>
                      {upazilas.map(upazila => (
                        <option key={upazila} value={upazila}>
                          {upazila}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* পোস্ট কোড */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                      পোস্ট কোড
                    </label>
                    <input
                      type="text"
                      name="postCode"
                      value={formData.postCode}
                      onChange={handleInputChange}
                      placeholder="1234"
                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                    />
                  </div>

                  {/* ঠিকানা - Full width */}
                  <div className="md:col-span-2 lg:col-span-3 space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                      ঠিকানা
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-gray-500" />
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="বিস্তারিত ঠিকানা লিখুন..."
                        className="w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: পাসপোর্ট তথ্য Section */}
            {currentStep === 2 && (
              <div className="rounded-2xl shadow-xl p-6 lg:p-8 border bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-gray-900/50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">পাসপোর্ট তথ্য</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Passport Scan & Fill */}
                  <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Passport Scan (optional)
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input 
                        type="file" 
                        accept="image/*,.pdf" 
                        onChange={handlePassportScanFileChange} 
                        className="w-full sm:w-auto flex-1 border rounded-xl px-4 py-3 min-w-0 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" 
                      />
                      <button
                        type="button"
                        onClick={handleScanAndFill}
                        disabled={!passportScanFile || isScanning}
                        className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl w-full sm:w-auto ${
                          !passportScanFile || isScanning ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                        title="Scan and auto-fill passport fields"
                      >
                        <Wand2 className="w-4 h-4" />
                        {isScanning ? 'Scanning…' : 'Scan & Fill'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">TODO: Integrate real OCR/MRZ service to parse fields from the uploaded image.</p>
                  </div>

                  {/* পাসপোর্ট নাম্বার */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                      পাসপোর্ট নাম্বার
                    </label>
                    <input
                      type="text"
                      name="passportNumber"
                      value={formData.passportNumber}
                      onChange={handleInputChange}
                      placeholder="A12345678"
                      className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                    />
                  </div>

                  {/* পাসপোর্ট টাইপ */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                      পাসপোর্ট টাইপ
                    </label>
                    <select
                      name="passportType"
                      value={formData.passportType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    >
                      <option value="">পাসপোর্ট টাইপ নির্বাচন করুন</option>
                      <option value="Ordinary">Ordinary Passport (সাধারণ পাসপোর্ট)</option>
                      <option value="Official">Official Passport (সরাসরি সরকারি পাসপোর্ট)</option>
                      <option value="Diplomatic">Diplomatic Passport (কূটনৈতিক পাসপোর্ট)</option>
                    </select>
                  </div>

                  {/* Last/Surname Name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Last/Surname Name
                    </label>
                    <input
                      type="text"
                      name="passportLastName"
                      value={formData.passportLastName}
                      onChange={handleInputChange}
                      placeholder="Surname"
                      className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                    />
                  </div>

                  {/* First Name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="passportFirstName"
                      value={formData.passportFirstName}
                      onChange={handleInputChange}
                      placeholder="Given Name"
                      className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                    />
                  </div>

                  {/* ইস্যু তারিখ */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                      ইস্যু তারিখ
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 z-10" />
                      <DatePicker
                        selected={issueDate}
                        onChange={handleIssueDateChange}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="তারিখ নির্বাচন করুন"
                        className="w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        showYearDropdown
                        showMonthDropdown
                        dropdownMode="select"
                        yearDropdownItemNumber={15}
                        scrollableYearDropdown
                        maxDate={new Date()}
                        isClearable
                        popperClassName="react-datepicker-popper"
                      />
                    </div>
                  </div>

                  {/* মেয়াদ শেষের তারিখ */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                      মেয়াদ শেষের তারিখ
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 z-10" />
                      <DatePicker
                        selected={expiryDate}
                        onChange={handleExpiryDateChange}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="তারিখ নির্বাচন করুন"
                        className="w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        showYearDropdown
                        showMonthDropdown
                        dropdownMode="select"
                        yearDropdownItemNumber={15}
                        scrollableYearDropdown
                        minDate={issueDate || new Date()}
                        isClearable
                        popperClassName="react-datepicker-popper"
                      />
                    </div>
                  </div>

                  {/* জন্ম তারিখ */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                      জন্ম তারিখ
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 z-10" />
                      <DatePicker
                        selected={dateOfBirth}
                        onChange={handleDateOfBirthChange}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="তারিখ নির্বাচন করুন"
                        className="w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        showYearDropdown
                        showMonthDropdown
                        dropdownMode="select"
                        yearDropdownItemNumber={100}
                        scrollableYearDropdown
                        maxDate={new Date()}
                        isClearable
                        popperClassName="react-datepicker-popper"
                      />
                    </div>
                  </div>

                  {/* এনআইডি নাম্বার */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                      এনআইডি নাম্বার
                    </label>
                    <input
                      type="text"
                      name="nidNumber"
                      value={formData.nidNumber}
                      onChange={handleInputChange}
                      placeholder="১২৩৪৫৬৭৮৯০"
                      className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                    />
                  </div>

                  {/* Nationality */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Nationality
                    </label>
                    <input
                      type="text"
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleInputChange}
                      placeholder="e.g., Bangladeshi"
                      className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                    />
                  </div>

                  {/* Previous Passport */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Previous Passport No
                    </label>
                    <input
                      type="text"
                      name="previousPassport"
                      value={formData.previousPassport}
                      onChange={handleInputChange}
                      placeholder="Old passport number"
                      className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                    />
                  </div>

                  {/* Gender */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: পরিবার তথ্য Section */}
            {currentStep === 3 && (
              <div className="rounded-2xl shadow-xl p-6 lg:p-8 border bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-gray-900/50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Family Details</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Father Name</label>
                    <input
                      type="text"
                      name="fatherName"
                      value={formData.fatherName}
                      onChange={handleInputChange}
                      placeholder="Father's name"
                      className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Mother Name</label>
                    <input
                      type="text"
                      name="motherName"
                      value={formData.motherName}
                      onChange={handleInputChange}
                      placeholder="Mother's name"
                      className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Spouse Name</label>
                    <input
                      type="text"
                      name="spouseName"
                      value={formData.spouseName}
                      onChange={handleInputChange}
                      placeholder="Spouse name (if applicable)"
                      className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Marital Status</label>
                    <select
                      name="maritalStatus"
                      value={formData.maritalStatus}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    >
                      <option value="">Select status</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Document Upload Section */}
            {currentStep === 4 && (
              <div className="rounded-2xl shadow-xl p-6 lg:p-8 border bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-gray-900/50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Document Upload</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Photo Upload */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Photo
                    </label>
                    <div className="border-2 border-dashed rounded-xl p-4 border-gray-300 dark:border-gray-600">
                      {imageUploading ? (
                        <div className="flex flex-col items-center justify-center space-y-2 py-4">
                          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">Uploading...</span>
                        </div>
                      ) : imagePreview || formData.customerImage ? (
                        <div className="flex flex-col items-center space-y-3">
                          <img 
                            src={imagePreview || formData.customerImage} 
                            alt="Profile Photo"
                            className="max-h-48 max-w-full rounded-lg object-contain"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="flex items-center space-x-2 px-3 py-1 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                            <span>Remove</span>
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center cursor-pointer py-4">
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Click to upload photo
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            JPG, PNG (max 5MB)
                          </span>
                          <input
                            type="file"
                            name="customerImage"
                            accept=".jpg,.jpeg,.png"
                            onChange={handleInputChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Passport Copy Upload */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Passport Copy
                    </label>
                    <div className="border-2 border-dashed rounded-xl p-4 border-gray-300 dark:border-gray-600">
                      {passportCopyUploading ? (
                        <div className="flex flex-col items-center justify-center space-y-2 py-4">
                          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">Uploading...</span>
                        </div>
                      ) : passportCopyPreview || formData.passportCopy ? (
                        <div className="flex flex-col items-center space-y-3">
                          {(passportCopyPreview || formData.passportCopy)?.match(/\.(jpg|jpeg|png|gif|webp)$/i) || (passportCopyPreview && passportCopyPreview.startsWith('data:image')) ? (
                            <img 
                              src={passportCopyPreview || formData.passportCopy} 
                              alt="Passport Copy"
                              className="max-h-48 max-w-full rounded-lg object-contain"
                            />
                          ) : (
                            <div className="flex items-center space-x-3 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                              <FileText className="w-8 h-8 text-red-500" />
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                Passport Copy Uploaded
                              </span>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={handleRemovePassportCopy}
                            className="flex items-center space-x-2 px-3 py-1 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                            <span>Remove</span>
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center cursor-pointer py-4">
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Click to upload passport copy
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            PDF, JPG, PNG (max 5MB)
                          </span>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => e.target.files[0] && uploadPassportCopy(e.target.files[0])}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* NID Copy Upload */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                      NID Copy
                    </label>
                    <div className="border-2 border-dashed rounded-xl p-4 border-gray-300 dark:border-gray-600">
                      {nidCopyUploading ? (
                        <div className="flex flex-col items-center justify-center space-y-2 py-4">
                          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">Uploading...</span>
                        </div>
                      ) : nidCopyPreview || formData.nidCopy ? (
                        <div className="flex flex-col items-center space-y-3">
                          {(nidCopyPreview || formData.nidCopy)?.match(/\.(jpg|jpeg|png|gif|webp)$/i) || (nidCopyPreview && nidCopyPreview.startsWith('data:image')) ? (
                            <img 
                              src={nidCopyPreview || formData.nidCopy} 
                              alt="NID Copy"
                              className="max-h-48 max-w-full rounded-lg object-contain"
                            />
                          ) : (
                            <div className="flex items-center space-x-3 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                              <FileText className="w-8 h-8 text-red-500" />
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                NID Copy Uploaded
                              </span>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={handleRemoveNidCopy}
                            className="flex items-center space-x-2 px-3 py-1 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                            <span>Remove</span>
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center cursor-pointer py-4">
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Click to upload NID copy
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            PDF, JPG, PNG (max 5MB)
                          </span>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => e.target.files[0] && uploadNidCopy(e.target.files[0])}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 rounded-xl shadow-lg p-6 border bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-gray-900/50">
              <button
                type="button"
                onClick={() => router.push('/air-ticketing/passengers')}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5 inline mr-2" />
                ফিরে যান
              </button>

              <div className="flex space-x-4">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 flex items-center"
                  >
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    পূর্ববর্তী
                  </button>
                )}
                
                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      nextStep();
                    }}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 flex items-center"
                  >
                    পরবর্তী
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting || imageUploading || passportCopyUploading || nidCopyUploading}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        কাস্টমার যোগ হচ্ছে...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        কাস্টমার যুক্ত করুন
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Reference Customer Search Modal */}
        {showReferenceSearchModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="max-w-2xl w-full rounded-2xl shadow-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  রেফারেন্স কাস্টমার খুঁজুন
                </h3>
                <button
                  onClick={() => setShowReferenceSearchModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Input */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    value={referenceSearchTerm}
                    onChange={(e) => setReferenceSearchTerm(e.target.value)}
                    placeholder="নাম, মোবাইল নম্বর বা কাস্টমার আইডি দিয়ে খুঁজুন..."
                    className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Search Results */}
              <div className="max-h-96 overflow-y-auto">
                {referenceSearchLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600 dark:text-gray-400">খুঁজছি...</span>
                  </div>
                ) : referenceSearchResults.length > 0 ? (
                  <div className="space-y-2">
                    {referenceSearchResults.map((customer) => (
                      <div
                        key={customer.id || customer.customerId}
                        onClick={() => selectReferenceCustomer(customer)}
                        className="p-4 border rounded-lg cursor-pointer transition-all duration-200 border-gray-200 dark:border-gray-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-800 dark:text-white">
                              {customer.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {customer.mobile} • {customer.customerId}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {customer.customerType} • {customer.division}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              selectReferenceCustomer(customer);
                            }}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors duration-200"
                          >
                            নির্বাচন করুন
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : referenceSearchTerm ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400">
                      কোন কাস্টমার পাওয়া যায়নি
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400">
                      রেফারেন্স কাস্টমার খুঁজতে নাম, মোবাইল নম্বর বা কাস্টমার আইডি লিখুন
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EditPassenger;
