'use client';

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '../../../../component/DashboardLayout';
import Swal from 'sweetalert2';
import {
  ArrowLeft,
  Save,
  User,
  Phone,
  CreditCard,
  Package,
  FileText,
  Upload,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { uploadToCloudinary, validateCloudinaryConfig } from '../../../../../config/cloudinary';
import divisionDataJson from '../../../../jsondata/AllDivision.json';

// Subcomponents
const FormSection = React.memo(({ title, icon: Icon, children }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
    <div className="flex items-center space-x-3 mb-6">
      <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
    </div>
    {children}
  </div>
));
FormSection.displayName = 'FormSection';

const InputGroup = React.memo(({ label, name, type = 'text', required = false, value, onChange, ...props }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value ?? ''}
      onChange={onChange}
      required={required}
      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors duration-200"
      {...props}
    />
  </div>
));
InputGroup.displayName = 'InputGroup';

const SelectGroup = React.memo(({ label, name, options = [], required = false, value, onChange, disabled = false }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      name={name}
      value={value ?? ''}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition-colors duration-200"
    >
      <option value="">Select {label}</option>
      {options.map((option, idx) => (
        <option key={option.id || option.value || idx} value={option.id || option.value}>
          {option.name || option.label}
        </option>
      ))}
    </select>
  </div>
));
SelectGroup.displayName = 'SelectGroup';

const FileUploadGroup = React.memo(({ label, name, accept, required = false, value, onFileChange, onRemoveFile, preview, uploading }) => {
  const isImage = preview || (value && typeof value === 'string' && (value.match(/\.(jpg|jpeg|png|gif|webp)$/i) || (value.startsWith('http') && !value.match(/\.pdf(\?|$)/i))));
  const isPdf = value && typeof value === 'string' && (value.match(/\.pdf(\?|$)/i) || (value.includes('pdf') && !value.match(/\.(jpg|jpeg|png|gif|webp)$/i)));

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
        {uploading ? (
          <div className="flex flex-col items-center justify-center space-y-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Uploading...</span>
          </div>
        ) : isImage ? (
          <div className="flex flex-col items-center space-y-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview || value}
              alt={label}
              className="max-h-48 max-w-full rounded-lg object-contain"
            />
            <button
              type="button"
              onClick={onRemoveFile}
              className="flex items-center space-x-2 px-3 py-1 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Remove {label}</span>
            </button>
          </div>
        ) : isPdf || (value && typeof value === 'string') ? (
          <div className="flex flex-col items-center space-y-3">
            <div className="flex items-center space-x-3 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <FileText className="w-8 h-8 text-red-500" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {label} Uploaded
                </span>
                {isPdf && (
                  <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View PDF
                  </a>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onRemoveFile}
              className="flex items-center space-x-2 px-3 py-1 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Remove {label}</span>
            </button>
          </div>
        ) : (
          <label htmlFor={`file-${name}`} className="block text-center cursor-pointer">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Click to upload or drag and drop
            </span>
            <input
              id={`file-${name}`}
              type="file"
              accept={accept}
              onChange={onFileChange}
              className="hidden"
            />
          </label>
        )}
      </div>
    </div>
  );
});
FileUploadGroup.displayName = 'FileUploadGroup';

const AddHaji = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hajiIdParam = searchParams.get('id');
  const editMode = !!hajiIdParam;

  const [loading, setLoading] = useState(false);
  const [packages, setPackages] = useState([]);
  const [agents, setAgents] = useState([]);
  const [licenses, setLicenses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [hajiLoading, setHajiLoading] = useState(false);

  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 7;

  const stepTitles = [
    'ব্যক্তিগত তথ্য',
    'পাসপোর্ট তথ্য',
    'যোগাযোগ তথ্য',
    'প্যাকেজ তথ্য',
    'আর্থিক তথ্য',
    'অতিরিক্ত তথ্য',
    'ডকুমেন্ট'
  ];

  const nextStep = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const goToStep = (step) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  };

  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [passportUploading, setPassportUploading] = useState(false);
  const [passportPreview, setPassportPreview] = useState(null);
  const [nidUploading, setNidUploading] = useState(false);
  const [nidPreview, setNidPreview] = useState(null);

  // Division data from JSON file
  const divisionData = useMemo(() => {
    return divisionDataJson?.Bangladesh || [];
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    firstName: '',
    lastName: '',
    fatherName: '',
    motherName: '',
    passportNumber: '',
    passportType: 'ordinary',
    issueDate: '',
    expiryDate: '',
    nidNumber: '',
    dateOfBirth: '',
    gender: 'male',
    maritalStatus: 'single',
    mobile: '',
    whatsappNo: '',
    email: '',
    address: '',
    division: '',
    district: '',
    upazila: '',
    area: '',
    postCode: '',
    emergencyContact: '',
    emergencyPhone: '',
    packageId: '',
    agentId: '',
    licenseId: '',
    departureDate: '',
    returnDate: '',
    totalAmount: 0,
    paidAmount: 0,
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    previousHajj: false,
    previousUmrah: false,
    specialRequirements: '',
    notes: '',
    passportCopy: null,
    nidCopy: null,
    photo: null,
    customerType: 'haj',
    customerId: '',
    nationality: 'Bangladeshi',
    spouseName: '',
    occupation: '',
    referenceBy: '',
    referenceCustomerId: '',
    serviceStatus: 'আনপেইড',
    isActive: true,
    manualSerialNumber: '',
    pidNo: '',
    ngSerialNo: '',
    trackingNo: '',
    employerId: ''
  });

  // Location options
  const divisionOptions = useMemo(
    () => divisionData.map((d) => ({ value: d.Division, label: d.Division })),
    [divisionData]
  );

  const districtOptions = useMemo(() => {
    const division = divisionData.find((d) => d.Division === formData.division);
    return (division?.Districts || []).map((d) => ({ value: d.District, label: d.District }));
  }, [formData.division, divisionData]);

  const upazilaOptions = useMemo(() => {
    const division = divisionData.find((d) => d.Division === formData.division);
    const district = (division?.Districts || []).find((dist) => dist.District === formData.district);
    return (district?.Upazilas || []).map((u) => ({ value: u, label: u }));
  }, [formData.division, formData.district, divisionData]);

  // Fetch packages, agents, licenses, employees
  useEffect(() => {
    fetchPackages();
    fetchAgents();
    fetchLicenses();
    fetchEmployees();
  }, []);

  // Fetch haji data for edit mode
  useEffect(() => {
    if (editMode && hajiIdParam) {
      fetchHajiData();
    }
  }, [editMode, hajiIdParam]);

  const fetchPackages = async () => {
    try {
      // TODO: Replace with actual API endpoint
      // const response = await fetch('/api/hajj-umrah/packages');
      // const data = await response.json();
      // setPackages(data.packages || []);
      setPackages([]);
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  };

  const fetchAgents = async () => {
    try {
      // TODO: Replace with actual API endpoint
      // const response = await fetch('/api/agents');
      // const data = await response.json();
      // setAgents(data.agents || []);
      setAgents([]);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const fetchLicenses = async () => {
    try {
      // TODO: Replace with actual API endpoint
      // const response = await fetch('/api/licenses');
      // const data = await response.json();
      // setLicenses(data.licenses || []);
      setLicenses([]);
    } catch (error) {
      console.error('Error fetching licenses:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      const data = await response.json();
      if (response.ok) {
        setEmployees(data.employees || []);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchHajiData = async () => {
    try {
      setHajiLoading(true);
      const response = await fetch(`/api/hajj-umrah/hajis/${hajiIdParam}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch haji data');
      }
      
      const data = await response.json();
      const haji = data.haji;
      
      if (haji) {
        // Populate form with haji data
        const photoUrl = haji.photo || haji.photo_url || '';
        const passportUrl = haji.passport_copy || haji.passport_copy_url || '';
        const nidUrl = haji.nid_copy || haji.nid_copy_url || '';
        
        setFormData({
          name: haji.name || '',
          firstName: haji.first_name || '',
          lastName: haji.last_name || '',
          mobile: haji.mobile || '',
          email: haji.email || '',
          whatsappNo: haji.whatsapp_no || '',
          address: haji.address || '',
          division: haji.division || '',
          district: haji.district || '',
          upazila: haji.upazila || '',
          area: haji.area || '',
          postCode: haji.post_code || '',
          passportNumber: haji.passport_number || '',
          passportType: haji.passport_type || 'ordinary',
          issueDate: haji.issue_date || '',
          expiryDate: haji.expiry_date || '',
          dateOfBirth: haji.date_of_birth || '',
          gender: haji.gender || 'male',
          maritalStatus: haji.marital_status || 'single',
          nationality: haji.nationality || 'Bangladeshi',
          occupation: haji.occupation || '',
          fatherName: haji.father_name || '',
          motherName: haji.mother_name || '',
          spouseName: haji.spouse_name || '',
          nidNumber: haji.nid_number || '',
          manualSerialNumber: haji.manual_serial_number || '',
          pidNo: haji.pid_no || '',
          ngSerialNo: haji.ng_serial_no || '',
          trackingNo: haji.tracking_no || '',
          emergencyContact: haji.emergency_contact || '',
          emergencyPhone: haji.emergency_phone || '',
          packageId: haji.package_id || '',
          agentId: haji.agent_id || '',
          licenseId: haji.license_id || '',
          departureDate: haji.departure_date || '',
          returnDate: haji.return_date || '',
          previousHajj: haji.previous_hajj || false,
          previousUmrah: haji.previous_umrah || false,
          specialRequirements: haji.special_requirements || '',
          totalAmount: haji.total_amount || 0,
          paidAmount: haji.paid_amount || 0,
          paymentMethod: haji.payment_method || 'cash',
          paymentStatus: haji.payment_status || 'pending',
          serviceStatus: haji.service_status || 'আনপেইড',
          isActive: haji.is_active !== undefined ? haji.is_active : true,
          notes: haji.notes || '',
          referenceBy: haji.reference_by || '',
          referenceCustomerId: haji.reference_customer_id || '',
          employerId: haji.employer_id || haji.employerId || '',
          photo: photoUrl,
          passportCopy: passportUrl,
          nidCopy: nidUrl
        });
        
        // Set previews if URLs exist
        if (photoUrl) {
          setPhotoPreview(photoUrl);
        }
        if (passportUrl && passportUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          setPassportPreview(passportUrl);
        }
        if (nidUrl && nidUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          setNidPreview(nidUrl);
        }
      }
    } catch (error) {
      console.error('Error fetching haji data:', error);
      Swal.fire({
        icon: 'error',
        title: 'হাজি লোড করতে ত্রুটি',
        text: error.message || 'হাজি ডেটা লোড করতে ব্যর্থ হয়েছে।',
        confirmButtonColor: '#3b82f6',
      });
    } finally {
      setHajiLoading(false);
    }
  };

  // Auto-update Full Name whenever firstName or lastName changes
  useEffect(() => {
    const composedFirst = (formData.firstName || '').trim();
    const composedLast = (formData.lastName || '').trim();
    const composedFull = `${composedFirst} ${composedLast}`.trim();
    if (composedFull && formData.name !== composedFull) {
      setFormData(prev => ({
        ...prev,
        name: composedFull
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.firstName, formData.lastName]);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const nextValue = type === 'checkbox' ? checked : value;

    if (name === 'firstName' || name === 'lastName') {
      setFormData(prev => {
        const updated = { ...prev, [name]: nextValue };
        const composedFirst = (name === 'firstName' ? nextValue : updated.firstName || '').trim();
        const composedLast = (name === 'lastName' ? nextValue : updated.lastName || '').trim();
        const composedFull = `${composedFirst} ${composedLast}`.trim();
        updated.name = composedFull;
        return updated;
      });
      return;
    }

    if (name === 'division') {
      setFormData(prev => ({
        ...prev,
        division: nextValue,
        district: '',
        upazila: '',
        area: ''
      }));
      return;
    }

    if (name === 'district') {
      setFormData(prev => ({
        ...prev,
        district: nextValue,
        upazila: '',
        area: ''
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: nextValue
    }));
  }, []);

  const handleFileUpload = useCallback((fieldName) => async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Validate Cloudinary configuration
      if (!validateCloudinaryConfig()) {
        Swal.fire({
          icon: 'error',
          title: 'কনফিগারেশন ত্রুটি',
          text: 'Cloudinary configuration is incomplete. Please check your .env.local file.',
          confirmButtonColor: '#3b82f6',
        });
        return;
      }

      // Validate file type
      if (fieldName === 'photo' && !file.type.startsWith('image/')) {
        Swal.fire({
          icon: 'error',
          title: 'ফাইল টাইপ ত্রুটি',
          text: 'অনুগ্রহ করে একটি বৈধ ছবি ফাইল নির্বাচন করুন',
          confirmButtonColor: '#3b82f6',
        });
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: 'error',
          title: 'ফাইল সাইজ বড়',
          text: 'ফাইল সাইজ 5MB এর কম হতে হবে',
          confirmButtonColor: '#3b82f6',
        });
        return;
      }

      // Create preview first
      const reader = new FileReader();
      reader.onload = (e) => {
        if (fieldName === 'photo') {
          setPhotoPreview(e.target.result);
        } else if (fieldName === 'passportCopy' && file.type.startsWith('image/')) {
          setPassportPreview(e.target.result);
        } else if (fieldName === 'nidCopy' && file.type.startsWith('image/')) {
          setNidPreview(e.target.result);
        }
      };
      reader.readAsDataURL(file);

      // Set uploading state
      if (fieldName === 'photo') {
        setPhotoUploading(true);
      } else if (fieldName === 'passportCopy') {
        setPassportUploading(true);
      } else if (fieldName === 'nidCopy') {
        setNidUploading(true);
      }

      // Determine folder based on field name
      let folder = 'hajj-documents';
      if (fieldName === 'photo') {
        folder = 'hajj-photos';
      } else if (fieldName === 'passportCopy') {
        folder = 'hajj-documents/passport';
      } else if (fieldName === 'nidCopy') {
        folder = 'hajj-documents/nid';
      }

      // Upload to Cloudinary
      const imageUrl = await uploadToCloudinary(file, folder);

      // Update form data with Cloudinary URL
      setFormData(prev => ({
        ...prev,
        [fieldName]: imageUrl
      }));

      // Show success message
      console.log(`${fieldName} uploaded successfully to Cloudinary`);
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      Swal.fire({
        icon: 'error',
        title: 'আপলোড ব্যর্থ',
        text: error.message || 'ফাইল আপলোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।',
        confirmButtonColor: '#3b82f6',
      });
      
      // Clear preview on error
      if (fieldName === 'photo') {
        setPhotoPreview(null);
      } else if (fieldName === 'passportCopy') {
        setPassportPreview(null);
      } else if (fieldName === 'nidCopy') {
        setNidPreview(null);
      }
    } finally {
      // Clear uploading state
      if (fieldName === 'photo') {
        setPhotoUploading(false);
      } else if (fieldName === 'passportCopy') {
        setPassportUploading(false);
      } else if (fieldName === 'nidCopy') {
        setNidUploading(false);
      }
    }
  }, []);

  const removeFile = useCallback((fieldName) => () => {
    if (fieldName === 'photo') {
      setPhotoPreview(null);
    } else if (fieldName === 'passportCopy') {
      setPassportPreview(null);
    } else if (fieldName === 'nidCopy') {
      setNidPreview(null);
    }
    setFormData(prev => ({
      ...prev,
      [fieldName]: null
    }));
  }, []);

  const handlePackageChange = useCallback((e) => {
    const packageId = e.target.value;
    const selectedPackage = packages.find(p => p.id === packageId);
    setFormData(prev => ({
      ...prev,
      packageId,
      totalAmount: selectedPackage ? selectedPackage.price : 0
    }));
  }, [packages]);

  const validateForm = () => {
    if (!formData.name || !formData.name.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'যাচাইকরণ ত্রুটি',
        text: 'নাম আবশ্যক',
        confirmButtonColor: '#3b82f6',
      });
      return false;
    }

    if (!formData.mobile || !formData.mobile.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'যাচাইকরণ ত্রুটি',
        text: 'মোবাইল নম্বর আবশ্যক',
        confirmButtonColor: '#3b82f6',
      });
      return false;
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      Swal.fire({
        icon: 'warning',
        title: 'যাচাইকরণ ত্রুটি',
        text: 'সঠিক ইমেইল ঠিকানা দিন',
        confirmButtonColor: '#3b82f6',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only allow submission on the last step
    if (currentStep !== totalSteps) {
      // If not on last step, go to next step instead
      nextStep(e);
      return;
    }
    
    if (!validateForm()) return;
    setLoading(true);

    try {
      const computedName = (formData.name && formData.name.trim())
        ? formData.name.trim()
        : `${formData.firstName || ''} ${formData.lastName || ''}`.trim();

      const hajiPayload = {
        name: computedName,
        firstName: formData.firstName || formData.name.split(' ')[0] || '',
        lastName: formData.lastName || formData.name.split(' ').slice(1).join(' ') || '',
        manualSerialNumber: formData.manualSerialNumber,
        pidNo: formData.pidNo,
        ngSerialNo: formData.ngSerialNo,
        trackingNo: formData.trackingNo,
        mobile: formData.mobile,
        whatsappNo: formData.whatsappNo,
        email: formData.email,
        occupation: formData.occupation,
        address: formData.address,
        division: formData.division,
        district: formData.district,
        upazila: formData.upazila,
        area: formData.area,
        postCode: formData.postCode,
        passportNumber: formData.passportNumber,
        passportType: formData.passportType,
        issueDate: formData.issueDate,
        expiryDate: formData.expiryDate,
        dateOfBirth: formData.dateOfBirth,
        nidNumber: formData.nidNumber,
        nationality: formData.nationality,
        gender: formData.gender,
        fatherName: formData.fatherName,
        motherName: formData.motherName,
        spouseName: formData.spouseName,
        maritalStatus: formData.maritalStatus,
        serviceType: 'hajj',
        serviceStatus: formData.serviceStatus,
        isActive: formData.isActive,
        notes: formData.notes,
        referenceBy: formData.referenceBy,
        referenceCustomerId: formData.referenceCustomerId,
        totalAmount: Number(formData.totalAmount) || 0,
        paidAmount: Number(formData.paidAmount) || 0,
        paymentMethod: formData.paymentMethod,
        paymentStatus: formData.paymentStatus,
        departureDate: formData.departureDate,
        returnDate: formData.returnDate,
        previousHajj: formData.previousHajj,
        previousUmrah: formData.previousUmrah,
        specialRequirements: formData.specialRequirements,
        packageId: formData.packageId,
        agentId: formData.agentId,
        licenseId: formData.licenseId,
        employerId: formData.employerId,
        photo: formData.photo,
        passportCopy: formData.passportCopy,
        nidCopy: formData.nidCopy
      };

      if (editMode) {
        const response = await fetch(`/api/hajj-umrah/hajis/${hajiIdParam}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(hajiPayload)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update haji');
        }

        const data = await response.json();
        const updatedHaji = data.haji;
        const hajiId = updatedHaji?.customer_id || updatedHaji?.id || hajiIdParam;
        
        Swal.fire({
          icon: 'success',
          title: 'হাজি আপডেট করা হয়েছে!',
          text: 'হাজি তথ্য সফলভাবে আপডেট করা হয়েছে।',
          confirmButtonColor: '#3b82f6',
        }).then(() => {
          router.push(`/hajj-umrah/hajj/haji/${hajiId}`);
        });
        return;
      }

      // Create new haji
      const response = await fetch('/api/hajj-umrah/hajis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hajiPayload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create haji');
      }

      const data = await response.json();
      const createdHaji = data.haji;
      const hajiId = createdHaji?.customer_id || createdHaji?.id;
      
      Swal.fire({
        icon: 'success',
        title: 'হাজি তৈরি করা হয়েছে!',
        text: 'নতুন হাজি সফলভাবে তৈরি করা হয়েছে।',
        confirmButtonColor: '#3b82f6',
      }).then(() => {
        if (hajiId) {
          router.push(`/hajj-umrah/hajj/haji/${hajiId}`);
        } else {
          router.push('/hajj-umrah/hajj/haji-list');
        }
      });
    } catch (error) {
      console.error('Error creating/updating Haji:', error);
      Swal.fire({
        icon: 'error',
        title: editMode ? 'আপডেট ব্যর্থ' : 'তৈরি করতে ব্যর্থ',
        text: error.message || 'ত্রুটি হয়েছে। আবার চেষ্টা করুন।',
        confirmButtonColor: '#3b82f6',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/hajj-umrah/hajj/haji-list"
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editMode ? 'হাজি তথ্য সম্পাদনা করুন' : 'নতুন হাজি যোগ করুন'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {editMode ? 'হাজি তথ্য আপডেট করুন' : 'একটি নতুন হাজি নিবন্ধন করুন'}
              </p>
            </div>
          </div>
        </div>

        {editMode && hajiLoading && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
              <span className="text-blue-700 dark:text-blue-300">হাজি ডেটা লোড হচ্ছে...</span>
            </div>
          </div>
        )}

        {/* Step Progress Indicator */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
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
          onKeyDown={(e) => {
            // Prevent form submission on Enter key unless on last step
            if (e.key === 'Enter' && currentStep !== totalSteps) {
              e.preventDefault();
              // If Enter is pressed on a button, let it handle it
              if (e.target.tagName !== 'BUTTON') {
                nextStep(e);
              }
            }
          }}
          className="space-y-6"
        >
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <FormSection title="ব্যক্তিগত তথ্য" icon={User}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <InputGroup
                  label="ম্যানুয়াল সিরিয়াল নম্বর"
                  name="manualSerialNumber"
                  value={formData.manualSerialNumber}
                  onChange={handleInputChange}
                  placeholder="ম্যানুয়াল সিরিয়াল নম্বর দিন"
                />
                <InputGroup
                  label="প্রথম নাম"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
                <InputGroup
                  label="শেষ নাম"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    সম্পূর্ণ নাম <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || `${formData.firstName || ''} ${formData.lastName || ''}`.trim()}
                    readOnly
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                  />
                </div>
                <InputGroup
                  label="পিতার নাম"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleInputChange}
                />
                <InputGroup
                  label="মাতার নাম"
                  name="motherName"
                  value={formData.motherName}
                  onChange={handleInputChange}
                />
                <InputGroup
                  label="স্বামী/স্ত্রীর নাম"
                  name="spouseName"
                  value={formData.spouseName}
                  onChange={handleInputChange}
                />
                <InputGroup
                  label="পেশা"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleInputChange}
                />
                <InputGroup
                  label="জন্ম তারিখ"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                />
                <SelectGroup
                  label="লিঙ্গ"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  options={[
                    { value: 'male', label: 'পুরুষ' },
                    { value: 'female', label: 'মহিলা' }
                  ]}
                />
                <SelectGroup
                  label="বৈবাহিক অবস্থা"
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleInputChange}
                  options={[
                    { value: 'single', label: 'অবিবাহিত' },
                    { value: 'married', label: 'বিবাহিত' },
                    { value: 'divorced', label: 'তালাকপ্রাপ্ত' },
                    { value: 'widowed', label: 'বিধবা/বিধুর' }
                  ]}
                />
                <InputGroup
                  label="জাতীয়তা"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleInputChange}
                />
                <SelectGroup
                  label="হাজি স্ট্যাটাস"
                  name="serviceStatus"
                  value={formData.serviceStatus}
                  onChange={handleInputChange}
                  options={[
                    { value: 'আনপেইড', label: 'আনপেইড' },
                    { value: 'প্রাক-নিবন্ধিত', label: 'প্রাক-নিবন্ধিত' },
                    { value: 'নিবন্ধিত', label: 'নিবন্ধিত' },
                    { value: 'হজ্ব সম্পন্ন', label: 'হজ্ব সম্পন্ন' },
                    { value: 'আর্কাইভ', label: 'আর্কাইভ' },
                    { value: 'রেডি রিপ্লেস', label: 'রেডি রিপ্লেস' },
                    { value: 'রিফান্ডেড', label: 'রিফান্ডেড' },
                    { value: 'অন্যান্য', label: 'অন্যান্য' }
                  ]}
                />
              </div>
            </FormSection>
          )}

          {/* Step 2: Passport Information */}
          {currentStep === 2 && (
            <FormSection title="পাসপোর্ট তথ্য" icon={FileText}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <InputGroup
                  label="পাসপোর্ট নম্বর"
                  name="passportNumber"
                  value={formData.passportNumber}
                  onChange={handleInputChange}
                />
                <InputGroup
                  label="পাসপোর্ট টাইপ"
                  name="passportType"
                  value={formData.passportType || 'ordinary'}
                  onChange={handleInputChange}
                />
                <InputGroup
                  label="ইস্যু তারিখ"
                  name="issueDate"
                  type="date"
                  value={formData.issueDate}
                  onChange={handleInputChange}
                />
                <InputGroup
                  label="মেয়াদ শেষ তারিখ"
                  name="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                />
                <InputGroup
                  label="NID নম্বর"
                  name="nidNumber"
                  value={formData.nidNumber}
                  onChange={handleInputChange}
                />
                <InputGroup
                  label="PID নম্বর"
                  name="pidNo"
                  value={formData.pidNo}
                  onChange={handleInputChange}
                  placeholder="PID নম্বর দিন"
                />
                <InputGroup
                  label="NG সিরিয়াল নম্বর"
                  name="ngSerialNo"
                  value={formData.ngSerialNo}
                  onChange={handleInputChange}
                  placeholder="NG সিরিয়াল নম্বর দিন"
                />
                <InputGroup
                  label="ট্র্যাকিং নম্বর"
                  name="trackingNo"
                  value={formData.trackingNo}
                  onChange={handleInputChange}
                  placeholder="PRP থেকে ট্র্যাকিং নম্বর দিন"
                />
              </div>
            </FormSection>
          )}

          {/* Step 3: Contact Information */}
          {currentStep === 3 && (
            <FormSection title="যোগাযোগ তথ্য" icon={Phone}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputGroup
                  label="মোবাইল নম্বর"
                  name="mobile"
                  type="tel"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  required
                />
                <InputGroup
                  label="WhatsApp নম্বর"
                  name="whatsappNo"
                  type="tel"
                  value={formData.whatsappNo}
                  onChange={handleInputChange}
                />
                <InputGroup
                  label="ইমেইল ঠিকানা"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
                <div className="md:col-span-2">
                  <InputGroup
                    label="ঠিকানা"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>
                <SelectGroup
                  label="বিভাগ"
                  name="division"
                  value={formData.division}
                  onChange={handleInputChange}
                  options={divisionOptions}
                />
                <SelectGroup
                  label="জেলা"
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  options={districtOptions}
                  disabled={!formData.division}
                />
                <SelectGroup
                  label="উপজেলা"
                  name="upazila"
                  value={formData.upazila}
                  onChange={handleInputChange}
                  options={upazilaOptions}
                  disabled={!formData.district}
                />
                <InputGroup
                  label="এলাকা"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                />
                <InputGroup
                  label="পোস্ট কোড"
                  name="postCode"
                  value={formData.postCode}
                  onChange={handleInputChange}
                />
                <InputGroup
                  label="জরুরি যোগাযোগের নাম"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleInputChange}
                />
                <InputGroup
                  label="জরুরি যোগাযোগের ফোন"
                  name="emergencyPhone"
                  type="tel"
                  value={formData.emergencyPhone}
                  onChange={handleInputChange}
                />
              </div>
            </FormSection>
          )}

          {/* Step 4: Package Information */}
          {currentStep === 4 && (
            <FormSection title="প্যাকেজ তথ্য" icon={Package}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectGroup
                  label="প্যাকেজ"
                  name="packageId"
                  value={formData.packageId}
                  options={packages}
                  onChange={handlePackageChange}
                />
                <SelectGroup
                  label="এজেন্ট"
                  name="agentId"
                  value={formData.agentId}
                  options={agents}
                  onChange={handleInputChange}
                />
                <SelectGroup
                  label="লাইসেন্স"
                  name="licenseId"
                  value={formData.licenseId}
                  options={licenses}
                  onChange={handleInputChange}
                />
                <InputGroup
                  label="প্রস্থান তারিখ"
                  name="departureDate"
                  type="date"
                  value={formData.departureDate}
                  onChange={handleInputChange}
                />
                <InputGroup
                  label="ফিরে আসার তারিখ"
                  name="returnDate"
                  type="date"
                  value={formData.returnDate}
                  onChange={handleInputChange}
                />
              </div>
            </FormSection>
          )}

          {/* Step 5: Financial Information */}
          {currentStep === 5 && (
            <FormSection title="আর্থিক তথ্য" icon={CreditCard}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <InputGroup
                  label="মোট পরিমাণ"
                  name="totalAmount"
                  type="number"
                  readOnly
                  value={formData.totalAmount}
                  onChange={handleInputChange}
                />
                <InputGroup
                  label="পরিশোধিত পরিমাণ"
                  name="paidAmount"
                  type="number"
                  min="0"
                  max={formData.totalAmount}
                  value={formData.paidAmount}
                  onChange={handleInputChange}
                />
                <SelectGroup
                  label="পেমেন্ট পদ্ধতি"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  options={[
                    { value: 'cash', label: 'নগদ' },
                    { value: 'bank_transfer', label: 'ব্যাংক ট্রান্সফার' },
                    { value: 'mobile_banking', label: 'মোবাইল ব্যাংকিং' },
                    { value: 'check', label: 'চেক' }
                  ]}
                />
                <SelectGroup
                  label="পেমেন্ট স্ট্যাটাস"
                  name="paymentStatus"
                  value={formData.paymentStatus}
                  onChange={handleInputChange}
                  options={[
                    { value: 'pending', label: 'বিচারাধীন' },
                    { value: 'partial', label: 'আংশিক' },
                    { value: 'paid', label: 'পরিশোধিত' }
                  ]}
                />
              </div>
            </FormSection>
          )}

          {/* Step 6: Additional Information */}
          {currentStep === 6 && (
            <FormSection title="অতিরিক্ত তথ্য" icon={FileText}>
              <div className="space-y-4">
                <div className="flex items-center space-x-6">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="previousHajj"
                      checked={formData.previousHajj}
                      onChange={handleInputChange}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">পূর্ববর্তী হজ্ব অভিজ্ঞতা</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="previousUmrah"
                      checked={formData.previousUmrah}
                      onChange={handleInputChange}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">পূর্ববর্তী উমরাহ অভিজ্ঞতা</span>
                  </label>
                </div>
                <SelectGroup
                  label="কর্মচারী নির্বাচন করুন"
                  name="employerId"
                  value={formData.employerId}
                  onChange={handleInputChange}
                  options={employees.map(emp => ({
                    id: emp.id,
                    name: `${emp.fullName || `${emp.firstName} ${emp.lastName}`.trim()} - ${emp.employeeId || emp.id}`
                  }))}
                />
                <InputGroup
                  label="বিশেষ প্রয়োজনীয়তা"
                  name="specialRequirements"
                  placeholder="যেকোনো বিশেষ খাদ্য, চিকিৎসা বা অন্যান্য প্রয়োজনীয়তা"
                  value={formData.specialRequirements}
                  onChange={handleInputChange}
                />
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    নোট
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors duration-200"
                    placeholder="অতিরিক্ত নোট বা মন্তব্য"
                  />
                </div>
              </div>
            </FormSection>
          )}

          {/* Step 7: Document Upload */}
          {currentStep === 7 && (
            <FormSection title="ডকুমেন্ট আপলোড" icon={Upload}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FileUploadGroup
                  label="পাসপোর্ট কপি"
                  name="passportCopy"
                  accept=".pdf,.jpg,.jpeg,.png"
                  value={formData.passportCopy}
                  onFileChange={handleFileUpload('passportCopy')}
                  onRemoveFile={removeFile('passportCopy')}
                  preview={passportPreview}
                  uploading={passportUploading}
                />
                <FileUploadGroup
                  label="NID কপি"
                  name="nidCopy"
                  accept=".pdf,.jpg,.jpeg,.png"
                  value={formData.nidCopy}
                  onFileChange={handleFileUpload('nidCopy')}
                  onRemoveFile={removeFile('nidCopy')}
                  preview={nidPreview}
                  uploading={nidUploading}
                />
                <FileUploadGroup
                  label="ছবি"
                  name="photo"
                  accept=".jpg,.jpeg,.png"
                  value={formData.photo}
                  onFileChange={handleFileUpload('photo')}
                  onRemoveFile={removeFile('photo')}
                  preview={photoPreview}
                  uploading={photoUploading}
                />
              </div>
            </FormSection>
          )}

          {/* Step Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <Link
              href="/hajj-umrah/hajj/haji-list"
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5 inline mr-2" />
              ফিরে যান
            </Link>

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
                  onClick={nextStep}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 flex items-center"
                >
                  পরবর্তী
                  <ChevronRight className="w-5 h-5 ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      সংরক্ষণ হচ্ছে...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      {editMode ? 'হাজি আপডেট করুন' : 'হাজি সংরক্ষণ করুন'}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

const AddHajiWrapper = () => {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="p-6 flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    }>
      <AddHaji />
    </Suspense>
  );
};

export default AddHajiWrapper;
