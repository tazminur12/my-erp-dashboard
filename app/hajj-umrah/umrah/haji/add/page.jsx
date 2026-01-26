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
  Loader2,
  Building,
  Users
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
            <span className="text-sm text-gray-600 dark:text-gray-400">আপলোড হচ্ছে...</span>
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
              <span>{label} সরান</span>
            </button>
          </div>
        ) : isPdf || (value && typeof value === 'string') ? (
          <div className="flex flex-col items-center space-y-3">
            <div className="flex items-center space-x-3 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <FileText className="w-8 h-8 text-red-500" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {label} আপলোড হয়েছে
                </span>
                {isPdf && (
                  <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    PDF দেখুন
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
              <span>{label} সরান</span>
            </button>
          </div>
        ) : (
          <label htmlFor={`file-${name}`} className="block text-center cursor-pointer">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              আপলোড করতে ক্লিক করুন বা ফাইল টেনে আনুন
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

const AddUmrahHaji = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const umrahIdParam = searchParams.get('id');
  const editMode = !!umrahIdParam;

  const [loading, setLoading] = useState(false);
  const [packages, setPackages] = useState([]);
  const [agents, setAgents] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([]);
  const [umrahLoading, setUmrahLoading] = useState(false);

  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const stepTitles = [
    'ব্যক্তিগত তথ্য',
    'যোগাযোগ তথ্য',
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
    spouseName: '',
    occupation: '',
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
    departureDate: '',
    returnDate: '',
    totalAmount: 0,
    paidAmount: 0,
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    previousHajj: false,
    previousUmrah: true,
    specialRequirements: '',
    notes: '',
    passportCopy: null,
    nidCopy: null,
    photo: null,
    customerType: 'umrah',
    customerId: '',
    referenceBy: '',
    referenceCustomerId: '',
    serviceType: 'umrah',
    serviceStatus: '',
    isActive: true,
    manualSerialNumber: '',
    pidNo: '',
    ngSerialNo: '',
    trackingNo: '',
    banglaName: '',
    nationality: 'Bangladeshi',
    employerId: '',
    sourceType: 'office', // 'office' or 'agent'
    branchId: '',
    referenceHaji: ''
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

  // Fetch packages, agents, employees
  useEffect(() => {
    fetchPackages();
    fetchAgents();
    fetchEmployees();
    fetchBranches();
  }, []);

  // Fetch umrah data for edit mode
  useEffect(() => {
    if (editMode && umrahIdParam) {
      fetchUmrahData();
    }
  }, [editMode, umrahIdParam]);

  const fetchPackages = async () => {
    try {
      // TODO: Replace with actual API endpoint
      // const response = await fetch('/api/packages?type=umrah');
      // const data = await response.json();
      // setPackages(data.packages || []);
      setPackages([]);
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents');
      const data = await response.json();
      setAgents(data.agents || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await fetch('/api/branches');
      const data = await response.json();
      if (response.ok) {
        setBranches(data.branches || []);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
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

  const fetchUmrahData = async () => {
    try {
      setUmrahLoading(true);
      const response = await fetch(`/api/hajj-umrah/umrahs/${umrahIdParam}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch umrah data');
      }
      
      const data = await response.json();
      const umrah = data.umrah;
      
      // Transform database fields to form data format
      setFormData({
        name: umrah.name || '',
        firstName: umrah.first_name || '',
        lastName: umrah.last_name || '',
        fatherName: umrah.father_name || '',
        motherName: umrah.mother_name || '',
        spouseName: umrah.spouse_name || '',
        occupation: umrah.occupation || '',
        passportNumber: umrah.passport_number || '',
        passportType: umrah.passport_type || 'ordinary',
        issueDate: umrah.issue_date || '',
        expiryDate: umrah.expiry_date || '',
        nidNumber: umrah.nid_number || '',
        dateOfBirth: umrah.date_of_birth || '',
        gender: umrah.gender || 'male',
        maritalStatus: umrah.marital_status || 'single',
        mobile: umrah.mobile || '',
        whatsappNo: umrah.whatsapp_no || '',
        email: umrah.email || '',
        address: umrah.address || '',
        division: umrah.division || '',
        district: umrah.district || '',
        upazila: umrah.upazila || '',
        area: umrah.area || '',
        postCode: umrah.post_code || '',
        emergencyContact: umrah.emergency_contact || '',
        emergencyPhone: umrah.emergency_phone || '',
        packageId: umrah.package_id || '',
        agentId: umrah.agent_id || '',
        departureDate: umrah.departure_date || '',
        returnDate: umrah.return_date || '',
        totalAmount: umrah.total_amount || 0,
        paidAmount: umrah.paid_amount || 0,
        paymentMethod: umrah.payment_method || 'cash',
        paymentStatus: umrah.payment_status || 'pending',
        previousHajj: umrah.previous_hajj || false,
        previousUmrah: umrah.previous_umrah !== undefined ? umrah.previous_umrah : true,
        specialRequirements: umrah.special_requirements || '',
        notes: umrah.notes || '',
        customerId: umrah.customer_id || '',
        referenceBy: umrah.reference_by || '',
        referenceCustomerId: umrah.reference_customer_id || '',
        employerId: umrah.employer_id || umrah.employerId || '',
        sourceType: umrah.source_type || (umrah.agent_id ? 'agent' : 'office'),
        branchId: umrah.branch_id || '',
        referenceHaji: umrah.reference_haji || '',
        serviceStatus: umrah.service_status || '',
        isActive: umrah.is_active !== undefined ? umrah.is_active : true,
        manualSerialNumber: umrah.manual_serial_number || '',
        pidNo: umrah.pid_no || '',
        ngSerialNo: umrah.ng_serial_no || '',
        trackingNo: umrah.tracking_no || '',
        nationality: umrah.nationality || 'Bangladeshi',
        photo: umrah.photo || umrah.photo_url || null,
        passportCopy: umrah.passport_copy || umrah.passport_copy_url || null,
        nidCopy: umrah.nid_copy || umrah.nid_copy_url || null
      });
      
      // Set previews
      if (umrah.photo || umrah.photo_url) {
        setPhotoPreview(umrah.photo || umrah.photo_url);
      }
      if (umrah.passport_copy || umrah.passport_copy_url) {
        const passportUrl = umrah.passport_copy || umrah.passport_copy_url;
        if (passportUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) || passportUrl.startsWith('http')) {
          setPassportPreview(passportUrl);
        }
      }
      if (umrah.nid_copy || umrah.nid_copy_url) {
        const nidUrl = umrah.nid_copy || umrah.nid_copy_url;
        if (nidUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) || nidUrl.startsWith('http')) {
          setNidPreview(nidUrl);
        }
      }
    } catch (error) {
      console.error('Error fetching umrah data:', error);
      Swal.fire({
        icon: 'error',
        title: 'ডেটা লোড করতে ত্রুটি',
        text: error.message || 'উমরাহ ডেটা লোড করতে ব্যর্থ হয়েছে',
        confirmButtonColor: '#3b82f6',
      });
    } finally {
      setUmrahLoading(false);
    }
  };

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
      if (!validateCloudinaryConfig()) {
        Swal.fire({
          icon: 'error',
          title: 'কনফিগারেশন ত্রুটি',
          text: 'Cloudinary configuration is incomplete. Please check your .env.local file.',
          confirmButtonColor: '#3b82f6',
        });
        return;
      }

      if (fieldName === 'photo' && !file.type.startsWith('image/')) {
        Swal.fire({
          icon: 'error',
          title: 'ফাইল টাইপ ত্রুটি',
          text: 'অনুগ্রহ করে একটি বৈধ ছবি ফাইল নির্বাচন করুন',
          confirmButtonColor: '#3b82f6',
        });
        return;
      }

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
      let folder = 'umrah-documents';
      if (fieldName === 'photo') {
        folder = 'umrah-photos';
      } else if (fieldName === 'passportCopy') {
        folder = 'umrah-documents/passport';
      } else if (fieldName === 'nidCopy') {
        folder = 'umrah-documents/nid';
      }

      const imageUrl = await uploadToCloudinary(file, folder);

      // Update form data
      setFormData(prev => ({
        ...prev,
        [fieldName]: imageUrl
      }));

      const fieldLabels = {
        photo: 'ছবি',
        passportCopy: 'পাসপোর্ট কপি',
        nidCopy: 'NID কপি'
      };
      
      Swal.fire({
        icon: 'success',
        title: 'সফল!',
        text: `${fieldLabels[fieldName] || 'ফাইল'} Cloudinary এ আপলোড হয়েছে!`,
        confirmButtonColor: '#3b82f6',
        timer: 2000,
      });
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      Swal.fire({
        icon: 'error',
        title: 'আপলোড ত্রুটি',
        text: error.message || 'ফাইল আপলোড করতে সমস্যা হয়েছে',
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
      nextStep(e);
      return;
    }
    
    if (!validateForm()) return;
    setLoading(true);

    try {
      const computedName = (formData.name && formData.name.trim())
        ? formData.name.trim()
        : `${formData.firstName || ''} ${formData.lastName || ''}`.trim();

      const umrahPayload = {
        name: computedName,
        first_name: formData.firstName || formData.name.split(' ')[0] || '',
        last_name: formData.lastName || formData.name.split(' ').slice(1).join(' ') || '',
        manual_serial_number: formData.manualSerialNumber,
        pid_no: formData.pidNo,
        ng_serial_no: formData.ngSerialNo,
        tracking_no: formData.trackingNo,
        bangla_name: formData.banglaName,
        mobile: formData.mobile,
        whatsapp_no: formData.whatsappNo,
        email: formData.email,
        occupation: formData.occupation,
        address: formData.address,
        division: formData.division,
        district: formData.district,
        upazila: formData.upazila,
        area: formData.area,
        post_code: formData.postCode,
        passport_number: formData.passportNumber,
        passport_type: formData.passportType,
        issue_date: formData.issueDate,
        expiry_date: formData.expiryDate,
        date_of_birth: formData.dateOfBirth,
        nid_number: formData.nidNumber,
        nationality: formData.nationality,
        gender: formData.gender,
        father_name: formData.fatherName,
        mother_name: formData.motherName,
        spouse_name: formData.spouseName,
        marital_status: formData.maritalStatus,
        service_type: 'umrah',
        service_status: formData.serviceStatus,
        is_active: formData.isActive,
        notes: formData.notes,
        reference_by: formData.referenceBy,
        reference_customer_id: formData.referenceCustomerId,
        total_amount: Number(formData.totalAmount) || 0,
        paid_amount: Number(formData.paidAmount) || 0,
        payment_method: formData.paymentMethod,
        payment_status: formData.paymentStatus,
        departure_date: formData.departureDate,
        return_date: formData.returnDate,
        previous_hajj: formData.previousHajj,
        previous_umrah: formData.previousUmrah,
        special_requirements: formData.specialRequirements,
        package_id: formData.packageId,
        agent_id: formData.agentId,
        employer_id: formData.employerId,
        source_type: formData.sourceType,
        branch_id: formData.branchId,
        reference_haji: formData.referenceHaji,
        photo: formData.photo,
        passport_copy: formData.passportCopy,
        nid_copy: formData.nidCopy
      };

      if (editMode) {
        const response = await fetch(`/api/hajj-umrah/umrahs/${umrahIdParam}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(umrahPayload)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update umrah');
        }

        const data = await response.json();
        const updatedUmrah = data.umrah;
        const umrahId = updatedUmrah?.customer_id || updatedUmrah?.id || umrahIdParam;
        
        Swal.fire({
          icon: 'success',
          title: 'উমরাহ আপডেট করা হয়েছে!',
          text: 'উমরাহ তথ্য সফলভাবে আপডেট করা হয়েছে।',
          confirmButtonColor: '#3b82f6',
        }).then(() => {
          router.push(`/hajj-umrah/umrah/haji/${umrahId}`);
        });
        return;
      }

      // Create new umrah
      const response = await fetch('/api/hajj-umrah/umrahs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(umrahPayload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create umrah');
      }

      const data = await response.json();
      const createdUmrah = data.umrah;
      const umrahId = createdUmrah?.customer_id || createdUmrah?.id;
      
      Swal.fire({
        icon: 'success',
        title: 'উমরাহ তৈরি করা হয়েছে!',
        text: 'নতুন উমরাহ সফলভাবে তৈরি করা হয়েছে।',
        confirmButtonColor: '#3b82f6',
      }).then(() => {
        if (umrahId) {
          router.push(`/hajj-umrah/umrah/haji/${umrahId}`);
        } else {
          router.push('/hajj-umrah/umrah/haji-list');
        }
      });
    } catch (error) {
      console.error('Error creating/updating Umrah:', error);
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
              href="/hajj-umrah/umrah/haji-list"
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editMode ? 'উমরাহ তথ্য সম্পাদনা করুন' : 'নতুন উমরাহ যোগ করুন'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {editMode ? 'উমরাহ তথ্য আপডেট করুন' : 'একটি নতুন উমরাহ নিবন্ধন করুন'}
              </p>
            </div>
          </div>
        </div>

        {editMode && umrahLoading && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
              <span className="text-blue-700 dark:text-blue-300">উমরাহ ডেটা লোড হচ্ছে...</span>
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
            if (e.key === 'Enter' && currentStep !== totalSteps) {
              e.preventDefault();
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
                  label="বাংলা নাম"
                  name="banglaName"
                  value={formData.banglaName}
                  onChange={handleInputChange}
                  placeholder="বাংলায় নাম লিখুন"
                />
                <InputGroup
                  label="প্রথম নাম (English)"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
                <InputGroup
                  label="শেষ নাম (English)"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    পূর্ণ নাম <span className="text-red-500">*</span>
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
                  label="পাসপোর্ট নম্বর"
                  name="passportNumber"
                  value={formData.passportNumber}
                  onChange={handleInputChange}
                />
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    পাসপোর্ট টাইপ
                  </label>
                  <select
                    name="passportType"
                    value={formData.passportType || 'ordinary'}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors duration-200"
                  >
                    <option value="">পাসপোর্ট টাইপ নির্বাচন করুন</option>
                    <option value="ordinary">Ordinary Passport (সাধারণ পাসপোর্ট)</option>
                    <option value="official">Official Passport (সরাসরি সরকারি পাসপোর্ট)</option>
                    <option value="diplomatic">Diplomatic Passport (কূটনৈতিক পাসপোর্ট)</option>
                  </select>
                </div>
                <InputGroup
                  label="পাসপোর্ট মেয়াদ শেষ"
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
                  placeholder="PRP থেকে ট্র্যাকিং নম্বর চেক করুন"
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
                    { value: 'widowed', label: 'বিধবা' }
                  ]}
                />
                <SelectGroup
                  label="উমরাহ হাজ্বীর স্ট্যাটাস"
                  name="serviceStatus"
                  value={formData.serviceStatus}
                  onChange={handleInputChange}
                  options={[
                    { value: 'পাসপোর্ট রেডি নয়', label: 'পাসপোর্ট রেডি নয়' },
                    { value: 'পাসপোর্ট রেডি', label: 'পাসপোর্ট রেডি' },
                    { value: 'প্যাকেজ যুক্ত', label: 'প্যাকেজ যুক্ত' },
                    { value: 'রেডি ফর উমরাহ', label: 'রেডি ফর উমরাহ' },
                    { value: 'উমরাহ সম্পন্ন', label: 'উমরাহ সম্পন্ন' },
                    { value: 'রিফান্ডেড', label: 'রিফান্ডেড' },
                    { value: 'অন্যান্য', label: 'অন্যান্য' }
                  ]}
                />
              </div>
            </FormSection>
          )}

          {/* Step 2: Contact Information */}
          {currentStep === 2 && (
            <FormSection title="যোগাযোগ তথ্য" icon={Phone}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputGroup
                  label="মোবাইল নম্বর"
                  name="mobile"
                  type="tel"
                  required
                  value={formData.mobile}
                  onChange={handleInputChange}
                />
                <InputGroup
                  label="WhatsApp নম্বর"
                  name="whatsappNo"
                  type="tel"
                  value={formData.whatsappNo}
                  onChange={handleInputChange}
                />
                <InputGroup
                  label="ইমেইল"
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

          {/* Step 3: Additional Information (Modified) */}
          {currentStep === 3 && (
            <FormSection title="অতিরিক্ত তথ্য ও রেফারেন্স" icon={FileText}>
              <div className="space-y-6">
                
                {/* Office vs Agent Selection */}
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    রেফারেন্স উৎস নির্বাচন করুন
                  </label>
                  <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="sourceType"
                        value="office"
                        checked={formData.sourceType === 'office'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                        <Building className="w-4 h-4 mr-2 text-blue-500" />
                        অফিস
                      </span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="sourceType"
                        value="agent"
                        checked={formData.sourceType === 'agent'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                        <Users className="w-4 h-4 mr-2 text-green-500" />
                        এজেন্ট
                      </span>
                    </label>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.sourceType === 'office' ? (
                      <>
                        <SelectGroup
                          label="ব্রাঞ্চ নির্বাচন করুন"
                          name="branchId"
                          value={formData.branchId}
                          onChange={(e) => {
                            handleInputChange(e);
                            // Clear employer when branch changes
                            setFormData(prev => ({ ...prev, employerId: '', branchId: e.target.value }));
                          }}
                          options={branches.map(b => ({
                            id: b.id,
                            name: b.name
                          }))}
                        />
                        <SelectGroup
                          label="কর্মচারী নির্বাচন করুন"
                          name="employerId"
                          value={formData.employerId}
                          onChange={handleInputChange}
                          disabled={!formData.branchId}
                          options={employees
                            .filter(emp => !formData.branchId || emp.branch === formData.branchId || emp.branch === branches.find(b => b.id === formData.branchId)?.name) // Filter by branch if selected
                            .map(emp => ({
                              id: emp.id,
                              name: `${emp.fullName || emp.firstName} (${emp.employeeId})`
                            }))
                          }
                        />
                      </>
                    ) : (
                      <div className="md:col-span-2">
                        <SelectGroup
                          label="এজেন্ট নির্বাচন করুন"
                          name="agentId"
                          value={formData.agentId}
                          onChange={handleInputChange}
                          options={agents.map(agent => ({
                            id: agent._id || agent.id,
                            name: `${agent.tradeName || agent.ownerName} (${agent.contactNo || ''})`
                          }))}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputGroup
                    label="রেফারেন্স (হাজী)"
                    name="referenceHaji"
                    placeholder="হাজীর নাম বা আইডি লিখুন"
                    value={formData.referenceHaji}
                    onChange={handleInputChange}
                  />
                  
                  {/* Reuse existing referenceBy if needed or keep it hidden/synced */}
                </div>

                <div className="flex items-center space-x-6 pt-2">
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

          {/* Step 4: Document Upload (Was Step 6) */}
          {currentStep === 4 && (
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
              href="/hajj-umrah/umrah/haji-list"
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
                      {editMode ? 'উমরাহ আপডেট করুন' : 'উমরাহ সংরক্ষণ করুন'}
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

const AddUmrahHajiWrapper = () => {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="p-6 flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    }>
      <AddUmrahHaji />
    </Suspense>
  );
};

export default AddUmrahHajiWrapper;
