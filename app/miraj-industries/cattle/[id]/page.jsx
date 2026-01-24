'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '../../../component/DashboardLayout';
import { 
  ArrowLeft, 
  Calendar, 
  Camera, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Scale, 
  Tag, 
  User, 
  FileText, 
  Heart, 
  Baby,
  Loader2
} from 'lucide-react';

const healthIcon = (status) => {
  switch (status) {
    case 'healthy':
      return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
    case 'sick':
      return <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />;
    case 'under_treatment':
      return <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
    default:
      return <CheckCircle className="w-5 h-5 text-gray-400 dark:text-gray-500" />;
  }
};

const CattleDetails = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [cattle, setCattle] = useState(null);
  const [milkRecords, setMilkRecords] = useState([]);
  const [healthRecords, setHealthRecords] = useState([]);
  const [vaccinationRecords, setVaccinationRecords] = useState([]);
  const [vetVisitRecords, setVetVisitRecords] = useState([]);
  const [breedingRecords, setBreedingRecords] = useState([]);
  const [calvingRecords, setCalvingRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCattleDetails = async () => {
      if (!id) {
        setError('Cattle ID is missing');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch cattle details
        const cattleResponse = await fetch(`/api/miraj-industries/cattle/${id}`);
        const cattleData = await cattleResponse.json();

        if (!cattleResponse.ok) {
          throw new Error(cattleData.error || 'Failed to fetch cattle');
        }

        if (!cattleData.cattle) {
          throw new Error('Cattle data not found');
        }

        setCattle(cattleData.cattle);

        // Fetch related records
        // Milk records
        try {
          const milkResponse = await fetch(`/api/miraj-industries/milk-production?cattleId=${id}`);
          const milkData = await milkResponse.json();
          if (milkResponse.ok) {
            setMilkRecords(milkData.records || milkData.data || []);
          }
        } catch (err) {
          console.error('Error fetching milk records:', err);
        }

        // Health records
        try {
          const healthResponse = await fetch(`/api/miraj-industries/health-records?cattleId=${id}`);
          const healthData = await healthResponse.json();
          if (healthResponse.ok) {
            setHealthRecords(healthData.records || healthData.data || []);
          }
        } catch (err) {
          console.error('Error fetching health records:', err);
        }

        // Vaccination records
        try {
          const vaccinationResponse = await fetch(`/api/miraj-industries/vaccination-records?cattleId=${id}`);
          const vaccinationData = await vaccinationResponse.json();
          if (vaccinationResponse.ok) {
            setVaccinationRecords(vaccinationData.records || vaccinationData.data || []);
          }
        } catch (err) {
          console.error('Error fetching vaccination records:', err);
        }

        // Vet visit records
        try {
          const vetVisitResponse = await fetch(`/api/miraj-industries/vet-visits?cattleId=${id}`);
          const vetVisitData = await vetVisitResponse.json();
          if (vetVisitResponse.ok) {
            setVetVisitRecords(vetVisitData.records || vetVisitData.data || []);
          }
        } catch (err) {
          console.error('Error fetching vet visit records:', err);
        }

        // Breeding records
        try {
          const breedingResponse = await fetch(`/api/miraj-industries/breeding-records?cowId=${id}`);
          const breedingData = await breedingResponse.json();
          if (breedingResponse.ok) {
            setBreedingRecords(breedingData.records || breedingData.data || []);
          }
        } catch (err) {
          console.error('Error fetching breeding records:', err);
        }

        // Calving records
        try {
          const calvingResponse = await fetch(`/api/miraj-industries/calving-records?cowId=${id}`);
          const calvingData = await calvingResponse.json();
          if (calvingResponse.ok) {
            setCalvingRecords(calvingData.records || calvingData.data || []);
          }
        } catch (err) {
          console.error('Error fetching calving records:', err);
        }

      } catch (error) {
        console.error('Error fetching cattle details:', error);
        setError(error.message || 'Failed to load cattle. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCattleDetails();
  }, [id]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">লোড হচ্ছে...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!cattle) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <p className="text-gray-600 dark:text-gray-400">তথ্য পাওয়া যায়নি</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
            ফিরে যান
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0">
              {cattle.image ? (
                <img className="h-24 w-24 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700" src={cattle.image} alt={cattle.name} />
              ) : (
                <div className="h-24 w-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <Camera className="w-10 h-10 text-gray-500 dark:text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{cattle.name}</h1>
                <span className="inline-flex items-center gap-2 text-sm px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  <Tag className="w-4 h-4" /> {cattle.tagNumber || '—'}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-700 dark:text-gray-300">
                <span className="inline-flex items-center gap-1">
                  <User className="w-4 h-4" /> {cattle.gender === 'female' ? 'গাভী' : 'ষাঁড়'}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Scale className="w-4 h-4" /> {cattle.weight || 0} কেজি
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> {cattle.purchaseDate ? new Date(cattle.purchaseDate).toLocaleDateString('bn-BD') : '—'}
                </span>
                <span className="inline-flex items-center gap-2">
                  {healthIcon(cattle.healthStatus)} 
                  <span className="capitalize">
                    {cattle.healthStatus === 'healthy' ? 'সুস্থ' : 
                     cattle.healthStatus === 'sick' ? 'অসুস্থ' : 
                     cattle.healthStatus === 'under_treatment' ? 'চিকিৎসাধীন' : 
                     cattle.healthStatus}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">মৌলিক তথ্য</h3>
              <div className="text-sm text-gray-700 dark:text-gray-300">জাত: <span className="font-medium">{cattle.breed || '—'}</span></div>
              <div className="text-sm text-gray-700 dark:text-gray-300">বয়স: <span className="font-medium">{cattle.age || 0} বছর</span></div>
              <div className="text-sm text-gray-700 dark:text-gray-300">রং: <span className="font-medium">{cattle.color || '—'}</span></div>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">ক্রয় তথ্য</h3>
              <div className="text-sm text-gray-700 dark:text-gray-300">ক্রয় মূল্য: <span className="font-medium">{cattle.purchasePrice ? `৳${Number(cattle.purchasePrice).toLocaleString('bn-BD')}` : '—'}</span></div>
              <div className="text-sm text-gray-700 dark:text-gray-300">বিক্রেতা: <span className="font-medium">{cattle.vendor || '—'}</span></div>
            </div>
          </div>

          {cattle.notes ? (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4" /> নোট
              </h3>
              <p className="text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 p-3 rounded-md mt-2">{cattle.notes}</p>
            </div>
          ) : null}
        </div>

        {/* Milk Production Records */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">দুধ উৎপাদন রেকর্ড</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">তারিখ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">সকাল</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">দুপুর</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">সন্ধ্যা</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">মোট</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">মান</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {milkRecords.length === 0 ? (
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400" colSpan={6}>কোনো রেকর্ড নেই</td>
                  </tr>
                ) : (
                  milkRecords.map(rec => (
                    <tr key={rec.id || rec._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {rec.date ? new Date(rec.date).toLocaleDateString('bn-BD') : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{rec.morningQuantity || 0} লি</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{rec.afternoonQuantity || 0} লি</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{rec.eveningQuantity || 0} লি</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{rec.totalQuantity || 0} লি</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{rec.quality || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Health Records */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">স্বাস্থ্য রেকর্ড</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">তারিখ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">অবস্থা</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">লক্ষণ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">চিকিৎসক</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {healthRecords.length === 0 ? (
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400" colSpan={5}>কোনো রেকর্ড নেই</td>
                  </tr>
                ) : (
                  healthRecords.map((rec) => (
                    <tr key={rec.id || rec._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {rec.date ? new Date(rec.date).toLocaleDateString('bn-BD') : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{rec.condition || '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap max-w-xs truncate text-sm text-gray-900 dark:text-white">{rec.symptoms || '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{rec.vetName || '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white capitalize">{rec.status || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vaccination Records */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">টিকা রেকর্ড</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">তারিখ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">টিকার নাম</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">পরবর্তী তারিখ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">চিকিৎসক</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {vaccinationRecords.length === 0 ? (
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400" colSpan={5}>কোনো রেকর্ড নেই</td>
                  </tr>
                ) : (
                  vaccinationRecords.map((rec) => (
                    <tr key={rec.id || rec._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {rec.date ? new Date(rec.date).toLocaleDateString('bn-BD') : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{rec.vaccineName || '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {rec.nextDueDate ? new Date(rec.nextDueDate).toLocaleDateString('bn-BD') : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{rec.vetName || '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white capitalize">{rec.status || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vet Visit Records */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">চিকিৎসক পরিদর্শন</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">তারিখ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ধরন</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ক্লিনিক</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">উদ্দেশ্য</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">খরচ</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {vetVisitRecords.length === 0 ? (
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400" colSpan={5}>কোনো রেকর্ড নেই</td>
                  </tr>
                ) : (
                  vetVisitRecords.map((rec) => (
                    <tr key={rec.id || rec._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {rec.date ? new Date(rec.date).toLocaleDateString('bn-BD') : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{rec.visitType || '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{rec.clinic || '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap max-w-xs truncate text-sm text-gray-900 dark:text-white">{rec.purpose || '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">৳{Number(rec.cost || 0).toLocaleString('bn-BD')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Breeding Records */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-600 dark:text-pink-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">প্রজনন রেকর্ড</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">তারিখ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ষাঁড়</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">পদ্ধতি</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">স্ট্যাটাস</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">প্রত্যাশিত প্রসব</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {breedingRecords.length === 0 ? (
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400" colSpan={5}>কোনো রেকর্ড নেই</td>
                  </tr>
                ) : (
                  breedingRecords.map((rec) => (
                    <tr key={rec.id || rec._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {rec.breedingDate ? new Date(rec.breedingDate).toLocaleDateString('bn-BD') : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{rec.bullName || rec.bullId || '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {rec.method === 'natural' ? 'প্রাকৃতিক' : 
                         rec.method === 'artificial' ? 'কৃত্রিম' : 
                         rec.method === 'et' ? 'ভ্রূণ স্থানান্তর' : 
                         rec.method || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          rec.success === 'successful' || rec.success === 'confirmed_pregnant' 
                            ? 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20' 
                            : rec.success === 'failed' 
                            ? 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20' 
                            : 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20'
                        }`}>
                          {rec.success === 'pending' ? 'অপেক্ষমান' : 
                           rec.success === 'successful' ? 'সফল' : 
                           rec.success === 'failed' ? 'ব্যর্থ' : 
                           rec.success === 'confirmed_pregnant' ? 'গর্ভবতী নিশ্চিত' : 
                           rec.success || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {rec.expectedCalvingDate ? new Date(rec.expectedCalvingDate).toLocaleDateString('bn-BD') : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Calving Records */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
            <Baby className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">বাচ্চা প্রসব রেকর্ড</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">তারিখ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">লিঙ্গ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ওজন (কেজি)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ধরন</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">স্বাস্থ্য</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">বাচ্চার ID</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {calvingRecords.length === 0 ? (
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400" colSpan={6}>কোনো রেকর্ড নেই</td>
                  </tr>
                ) : (
                  calvingRecords.map((rec) => (
                    <tr key={rec.id || rec._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {rec.calvingDate ? new Date(rec.calvingDate).toLocaleDateString('bn-BD') : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {rec.calfGender === 'male' ? 'ষাঁড়' : rec.calfGender === 'female' ? 'গাভী' : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{rec.calfWeight || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{rec.calvingType || '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          rec.calfHealth === 'healthy' 
                            ? 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20' 
                            : rec.calfHealth === 'sick' || rec.calfHealth === 'deceased'
                            ? 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20' 
                            : 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20'
                        }`}>
                          {rec.calfHealth === 'healthy' ? 'সুস্থ' : 
                           rec.calfHealth === 'weak' ? 'দুর্বল' : 
                           rec.calfHealth === 'sick' ? 'অসুস্থ' : 
                           rec.calfHealth === 'deceased' ? 'মৃত' : 
                           rec.calfHealth || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{rec.calfId || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CattleDetails;
