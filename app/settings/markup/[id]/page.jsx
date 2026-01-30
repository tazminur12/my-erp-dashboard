'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '../../../component/DashboardLayout';
import { ArrowLeft, Edit, Loader2, DollarSign, Plane, MapPin, Calendar, Clock, CreditCard, Tag,Percent, Settings } from 'lucide-react';
import Link from 'next/link';

const MarkupDetails = () => {
  const params = useParams(); // Unwrap params if needed, but in client components it's usually direct or a promise in newer Next.js
  // In Next.js 15, params is a Promise. Let's use React.use() or await if async, 
  // but simpler: stick to standard hook usage and handle if it's async in a useEffect or similar if needed.
  // Actually in standard client components in App Router, useParams returns the object directly in older versions, 
  // but in Next 15 it might be strict. Let's assume standard behavior for now.
  
  const [id, setId] = useState(null);
  const [markup, setMarkup] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Handle params unwrapping
    const unwrapParams = async () => {
      try {
        const resolvedParams = await params;
        setId(resolvedParams.id);
      } catch (e) {
        // Fallback if not a promise
        setId(params.id);
      }
    };
    unwrapParams();
  }, [params]);

  useEffect(() => {
    if (!id) return;

    const fetchMarkup = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/settings/markup/${id}`);
        const data = await response.json();
        
        if (data.success) {
          setMarkup(data.data);
        } else {
          setError(data.error || 'Failed to fetch markup details');
        }
      } catch (err) {
        setError('An error occurred while fetching details');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarkup();
  }, [id]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !markup) {
    return (
      <DashboardLayout>
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
          <div className="max-w-3xl mx-auto text-center pt-20">
            <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Details</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'Markup not found'}</p>
            <Link 
              href="/settings/markup"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to List
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Helper component for detail rows
  const DetailRow = ({ label, value, subValue, icon: Icon, fullWidth = false }) => (
    <div className={`p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 ${fullWidth ? 'col-span-full' : ''}`}>
      <div className="flex items-start gap-3">
        {Icon && <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400"><Icon className="w-5 h-5" /></div>}
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
          <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white whitespace-pre-wrap">{value || 'N/A'}</p>
          {subValue && <p className="text-xs text-gray-500 mt-0.5">{subValue}</p>}
        </div>
      </div>
    </div>
  );

  const SectionTitle = ({ title }) => (
    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 mt-8 pb-2 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
      {title}
    </h3>
  );

  return (
    <DashboardLayout>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-12">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link 
                href="/settings/markup"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-600 dark:text-gray-300"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Markup Details</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">ID: {markup._id}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                markup.status === 'active' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {markup.status?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-8">
          
          {/* General Information */}
          <SectionTitle title="General Configuration" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <DetailRow label="Provider" value={markup.provider} icon={Settings} />
            <DetailRow label="Priority" value={markup.priority} icon={Tag} />
            <DetailRow 
              label="Fly Type" 
              value={markup.fly_type === 'any' ? 'Any' : markup.fly_type === 'intl' ? 'International' : 'Domestic'} 
              icon={Plane} 
            />
          </div>

          {/* Location & Journey */}
          <SectionTitle title="Location & Journey" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailRow 
              label="Origin" 
              value={markup.origin} 
              subValue={`${markup.is_include_origin ? 'Include' : ''} ${markup.is_exclude_origin ? 'Exclude' : ''}`} 
              icon={MapPin} 
            />
            <DetailRow 
              label="Journey Type" 
              value={[
                markup.is_outbound && 'Outbound',
                markup.is_inbound && 'Inbound',
                markup.is_freedom && 'Freedom'
              ].filter(Boolean).join(', ')} 
              icon={Plane} 
            />
          </div>

          {/* Airline & Routes */}
          <SectionTitle title="Airlines & Routes" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailRow 
              label="Airlines" 
              value={markup.airlines} 
              subValue={markup.is_suspend_airline ? 'Suspended' : ''} 
              icon={Plane} 
            />
            <DetailRow label="Routes" value={markup.routes} icon={MapPin} />
            <DetailRow label="Cabin Classes" value={markup.cabin_classes} icon={Settings} />
            <DetailRow label="Fare Basis" value={markup.fare_basis} icon={Tag} />
          </div>

          {/* Financials - Commission */}
          <SectionTitle title="Commissions & Markup" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <DetailRow 
              label="GDS Commission" 
              value={`Prov: ${markup.commission_provision} | Less: ${markup.commission_less_applied}`} 
              subValue={`Type: ${markup.commission_type}`}
              icon={DollarSign} 
            />
            <DetailRow 
              label="PLB Commission" 
              value={`Less Applied: ${markup.plb_commission_less_applied}`} 
              subValue="Percentage"
              icon={Percent} 
            />
            <DetailRow 
              label="Markup (On Base Fare)" 
              value={markup.markup_value} 
              subValue={`Type: ${markup.markup_type}`}
              icon={DollarSign} 
            />
            <DetailRow 
              label="Segment Cashback" 
              value={markup.segment_cashback} 
              icon={CreditCard} 
            />
          </div>

          {/* Service Charges */}
          <SectionTitle title="Service Charges" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DetailRow 
              label="Service Charge" 
              value={markup.service_charge} 
              subValue={`Type: ${markup.service_charge_type?.replace('_', ' ')}`}
              icon={DollarSign} 
            />
            <DetailRow 
              label="Date Change Charge" 
              value={markup.date_change_charge} 
              icon={Calendar} 
            />
            <DetailRow 
              label="Refund Charge" 
              value={markup.refund_charge} 
              icon={Clock} 
            />
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default MarkupDetails;
