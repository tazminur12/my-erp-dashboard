'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '../../component/DashboardLayout';
import { 
  CreditCard, 
  Save, 
  ArrowLeft,
  User,
  DollarSign,
  AlertCircle,
  Search,
  CheckCircle,
  Download,
  Mail,
  Banknote,
  CreditCard as CreditCardIcon,
  Smartphone,
  Receipt,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Loader2,
  ArrowRightLeft,
  Building,
  Info,
  FileText,
  Calendar,
  Building2, 
  Globe,
  MoreHorizontal,
  X,
  Plus,
  Package,
  MessageCircle,
  Users,
  Utensils,
  Car,
  ShoppingCart,
  Gamepad2,
  Heart,
  Book,
  Home,
  Phone
} from 'lucide-react';
import { generateSalmaReceiptPDF } from '../../utils/pdfGenerator';
import Swal from 'sweetalert2';

const NewTransaction = () => {
  // All queries removed - using empty data/defaults
  const isDark = false; // Default theme
  const userProfile = { email: 'user@example.com', branchId: 'main_branch' }; // Default user
  const axiosSecure = null; // Not used without queries
  
  // Transaction mutations - implemented with useState and fetch
  const [createTransactionPending, setCreateTransactionPending] = useState(false);
  const [completeTransactionPending, setCompleteTransactionPending] = useState(false);
  const [bankAccountTransferPending, setBankAccountTransferPending] = useState(false);
  const [createPersonalExpensePending, setCreatePersonalExpensePending] = useState(false);
  const [createBankAccountTransactionPending, setCreateBankAccountTransactionPending] = useState(false);

  const createTransactionMutation = {
    mutate: async (data, options) => {
      try {
        setCreateTransactionPending(true);
        const response = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const result = await response.json();
        
        if (response.ok && result.success) {
          options?.onSuccess?.(result);
        } else {
          const error = new Error(result.message || result.error || 'Failed to create transaction');
          error.response = { 
            data: result, 
            status: response.status 
          };
          options?.onError?.(error);
        }
      } catch (error) {
        // Network or parsing error
        const networkError = new Error(error.message || 'Network error occurred');
        networkError.response = { 
          data: { message: error.message, error: 'Network error' }, 
          status: 0 
        };
        options?.onError?.(networkError);
      } finally {
        setCreateTransactionPending(false);
      }
    },
    isPending: createTransactionPending
  };

  const completeTransactionMutation = {
    mutate: async (txId, options) => {
      // Transaction is already completed in POST endpoint, so just call onSuccess
      try {
        setCompleteTransactionPending(true);
        // Fetch the completed transaction
        const response = await fetch(`/api/transactions/${txId}`);
        const result = await response.json();
        
        if (response.ok && result.success) {
          options?.onSuccess?.(result);
        } else {
          const error = new Error(result.message || 'Failed to complete transaction');
          error.response = { data: result, status: response.status };
          options?.onError?.(error);
        }
      } catch (error) {
        options?.onError?.(error);
      } finally {
        setCompleteTransactionPending(false);
      }
    },
    isPending: completeTransactionPending
  };

  const bankAccountTransferMutation = {
    mutate: async (data, options) => {
      try {
        setBankAccountTransferPending(true);
        const response = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...data,
            transactionType: 'transfer',
            fromAccountId: data.fromAccountId,
            toAccountId: data.toAccountId,
            amount: data.amount,
            charge: data.charge || 0,
            notes: data.notes,
            reference: data.reference
          })
        });
        const result = await response.json();
        
        if (response.ok && result.success) {
          options?.onSuccess?.(result);
        } else {
          const error = new Error(result.message || result.error || 'Failed to transfer');
          error.response = { 
            data: result, 
            status: response.status 
          };
          options?.onError?.(error);
        }
      } catch (error) {
        const networkError = new Error(error.message || 'Network error occurred');
        networkError.response = { 
          data: { message: error.message, error: 'Network error' }, 
          status: 0 
        };
        options?.onError?.(networkError);
      } finally {
        setBankAccountTransferPending(false);
      }
    },
    isPending: bankAccountTransferPending
  };

  const createPersonalExpenseTxV2 = {
    mutate: async (data, options) => {
      try {
        setCreatePersonalExpensePending(true);
        // Create personal expense transaction
        const response = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scope: 'personal-expense',
            transactionType: 'debit',
            partyType: 'personal-expense',
            partyId: data.personalExpenseProfileId,
            personalExpenseProfileId: data.personalExpenseProfileId,
            type: 'expense',
            date: data.date,
            amount: data.amount,
            description: data.description,
            tags: data.tags || []
          })
        });
        const result = await response.json();
        
        if (response.ok && result.success) {
          options?.onSuccess?.(result);
        } else {
          const error = new Error(result.message || result.error || 'Failed to create personal expense');
          error.response = { 
            data: result, 
            status: response.status 
          };
          options?.onError?.(error);
        }
      } catch (error) {
        const networkError = new Error(error.message || 'Network error occurred');
        networkError.response = { 
          data: { message: error.message, error: 'Network error' }, 
          status: 0 
        };
        options?.onError?.(networkError);
      } finally {
        setCreatePersonalExpensePending(false);
      }
    },
    isPending: createPersonalExpensePending
  };
  // Bank Accounts - state for data
  const [accounts, setAccounts] = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [accountsError, setAccountsError] = useState(null);
  
  // Air Customers - state for data
  const [airCustomers, setAirCustomers] = useState([]);
  const [airCustomersLoading, setAirCustomersLoading] = useState(false);
  
  // Use empty array for customers
  const effectiveCustomers = [];
  const categories = [];
  const categoriesLoading = false;
  const categoriesError = null;
  const transactionsData = { transactions: [] }; // Empty transactions for balance calculation
  // Personal expense profiles
  const [personalExpenseProfiles, setPersonalExpenseProfiles] = useState([]);
  const [personalCatsLoading, setPersonalCatsLoading] = useState(false);
  
  // Haji and Umrah - state for data
  const [hajiData, setHajiData] = useState({ data: [] });
  const [hajiLoading, setHajiLoading] = useState(false);
  const hajiError = null;
  const [umrahData, setUmrahData] = useState({ data: [] });
  const [umrahLoading, setUmrahLoading] = useState(false);
  const umrahError = null;
  
  // Agent and Vendor - state for data
  const [agentResults, setAgentResults] = useState([]);
  const [agentLoading, setAgentLoading] = useState(false);
  const [vendorResults, setVendorResults] = useState([]);
  const [vendorLoading, setVendorLoading] = useState(false);
  
  // Loans and Money Exchange - state for data
  const [loansSearch, setLoansSearch] = useState([]);
  const [loansSearchLoading, setLoansSearchLoading] = useState(false);
  const [moneyExchangeList, setMoneyExchangeList] = useState([]);
  const [moneyExchangeLoading, setMoneyExchangeLoading] = useState(false);
  
  // Bank account mutations - implemented with fetch
  const createBankAccountTransactionMutation = {
    mutate: async (data, options) => {
      try {
        setCreateBankAccountTransactionPending(true);
        const response = await fetch(`/api/bank-accounts/${data.id}/transactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transactionType: data.transactionType,
            amount: data.amount,
            description: data.description,
            reference: data.reference,
            notes: data.notes,
            category: data.category,
            paymentDetails: data.paymentDetails
          })
        });
        const result = await response.json();
        
        if (response.ok) {
          options?.onSuccess?.(result);
        } else {
          const error = new Error(result.error || result.message || 'Failed to create bank transaction');
          error.response = { 
            data: result, 
            status: response.status 
          };
          options?.onError?.(error);
        }
      } catch (error) {
        const networkError = new Error(error.message || 'Network error occurred');
        networkError.response = { 
          data: { message: error.message, error: 'Network error' }, 
          status: 0 
        };
        options?.onError?.(networkError);
      } finally {
        setCreateBankAccountTransactionPending(false);
      }
    },
    isPending: createBankAccountTransactionPending
  };

  const transferBetweenAccountsMutation = {
    mutate: async (data, options) => {
      try {
        setBankAccountTransferPending(true);
        const response = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transactionType: 'transfer',
            fromAccountId: data.fromAccountId,
            toAccountId: data.toAccountId,
            amount: data.amount,
            notes: data.notes,
            reference: data.reference
          })
        });
        const result = await response.json();
        
        if (response.ok && result.success) {
          options?.onSuccess?.(result);
        } else {
          const error = new Error(result.message || 'Failed to transfer');
          error.response = { data: result, status: response.status };
          options?.onError?.(error);
        }
      } catch (error) {
        options?.onError?.(error);
      } finally {
        setBankAccountTransferPending(false);
      }
    },
    isPending: bankAccountTransferPending
  };
  // Settings categories - empty
  const settingsCategories = [];
  const settingsCategoriesLoading = false;

  // SMS helpers
  // Next.js uses process.env.NEXT_PUBLIC_* for client-side env vars
  const smsApiKey = process.env.NEXT_PUBLIC_SMS_API_KEY || '';
  const normalizePhoneForSms = (rawPhone) => {
    if (!rawPhone) return null;
    const digitsOnly = String(rawPhone).replace(/\D/g, '');
    if (digitsOnly.startsWith('880')) return digitsOnly;
    if (digitsOnly.startsWith('0')) return `88${digitsOnly}`;
    if (digitsOnly.startsWith('1')) return `880${digitsOnly}`;
    return digitsOnly || null;
  };
  const sendTransactionSms = async ({ phone, amount, transactionId }) => {
    const to = normalizePhoneForSms(phone);
    if (!smsApiKey || !to) return;

    const amountText = Number(amount || 0).toLocaleString('en-US');
    const message = `আপনার লেনদেন সফলভাবে গৃহীত হয়েছে।\nপরিমানঃ ${amountText} BDT\nwww.salmaair.com`;

    const payload = new URLSearchParams();
    payload.append('api_key', smsApiKey);
    payload.append('msg', message);
    payload.append('to', to);
    payload.append('type', 'unicode'); // Bangla text
    const approvedSender = 'Salma Air';
    const senderIdEnv = (process.env.NEXT_PUBLIC_SMS_SENDER_ID || '').trim();
    const senderId = senderIdEnv && senderIdEnv !== approvedSender ? approvedSender : approvedSender;
    payload.append('senderid', senderId);
    payload.append('sender_id', senderId);

    try {
      const response = await fetch('https://api.sms.net.bd/sendsm', {
        method: 'POST',
        body: payload
      });
      if (!response.ok) {
        const errText = await response.text();
        console.error('Transaction SMS failed response text:', errText);
        throw new Error(`SMS API responded with ${response.status}`);
      }
      const body = await response.text();
      console.log('Transaction SMS sent:', { to, message, senderId, body, transactionId });
    } catch (err) {
      console.error('Failed to send SMS:', err);
    }
  };

  // Last submitted transaction summary (for post-submission summary page)
  const [submittedTransaction, setSubmittedTransaction] = useState(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Transaction Type
    transactionType: '',
    
    // Step 2: Customer Type Selection (for credit/debit)
    selectedCustomerType: '', // 'airCustomer', 'vendor', 'agent', 'haji', 'umrah', 'loan', 'personalExpense', 'mirajIndustries', 'officeExpenses', 'moneyExchange', 'investment', 'asset'
    
    // Step 3: Customer Selection (for credit/debit)
    customerType: 'customer', // 'customer', 'vendor', 'agent', 'haji', 'umrah'
    customerId: '',
    uniqueId: '',
    personalExpenseProfileId: '',
    linkedCustomerId: null, // For haji/umrah: linked customer profile ID for syncing
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerAddress: '',
    
    // Customer Bank Account Details
    customerBankAccount: {
      bankName: '',
      accountNumber: ''
    },
    
    // Step 3: Category (for credit/debit)
    category: '',
    operatingExpenseCategoryId: '',
    operatingExpenseCategory: null, // Store operating expense category object for Office Expenses
    // Slug for backend detection (e.g., 'hajj', 'umrah')
    serviceCategory: '',
    
    // Step 4: Invoice Selection (for credit/debit)
    selectedInvoice: null,
    invoiceId: '',
    
    // Package selection for agent transactions
    selectedPackage: null,
    selectedPackageId: '',
    
    // Step 5: Payment Method (for credit/debit)
    paymentMethod: '',
    paymentDetails: {
      bankName: '',
      accountNumber: '',
      chequeNumber: '',
      mobileProvider: '',
      transactionId: '',
      amount: '',
      reference: '',
      charge: ''
    },
    
    // Account Selection for Credit/Debit transactions
    sourceAccount: {
      id: '',
      name: '',
      bankName: '',
      accountNumber: '',
      balance: 0
    },
    destinationAccount: {
      id: '',
      name: '',
      bankName: '',
      accountNumber: '',
      balance: 0
    },
    
    // Account Manager for Credit/Debit transactions
    debitAccountManager: {
      id: '',
      name: '',
      phone: '',
      email: '',
      designation: '',
      department: ''
    },
    creditAccountManager: {
      id: '',
      name: '',
      phone: '',
      email: '',
      designation: '',
      department: ''
    },
    
    // Account Transfer Fields
    // Step 2: Debit Account (for transfer)
    debitAccount: {
      id: '',
      name: '',
      bankName: '',
      accountNumber: '',
      balance: 0
    },
    
    // Step 3: Credit Account (for transfer)
    creditAccount: {
      id: '',
      name: '',
      bankName: '',
      accountNumber: '',
      balance: 0
    },
    
    // Step 4: Account Manager (for transfer)
    accountManager: {
      id: '',
      name: '',
      phone: '',
      email: '',
      designation: '',
      department: ''
    },
    
    // Transfer Details
    transferAmount: '',
    transferCharge: '',
    transferReference: '',
    transferNotes: '',
    
    // Step 5: Additional Info
    notes: '',
    date: new Date().toISOString().split('T')[0],
    
    // Employee Reference
    employeeReference: {
      id: '',
      name: '',
      employeeId: '',
      position: '',
      department: ''
    },
    // Selected Loan info (when picking from Loans tab)
    loanInfo: {
      id: '',
      name: '',
      direction: '' // 'giving' | 'receiving'
    },
    // Selected money exchange info (when picking from Money Exchange tab)
    moneyExchangeInfo: null,
    // Selected investment info (when picking investment)
    investmentInfo: null
  });

  // Invoice query hook - removed, using empty data
  const invoices = [];
  const invoicesLoading = false;
  const invoicesError = null;

  // Loans for selected customer - empty data
  const customerLoans = [];
  const customerLoansLoading = false;

  // Loans search list - empty data
  const effectiveInvoices = [];
  const isUsingDemoInvoices = true;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSearchType, setSelectedSearchType] = useState('airCustomer');
  
  // Map selectedCustomerType to selectedSearchType for step 3
  const getSearchTypeForStep3 = () => {
    if (!formData.selectedCustomerType) return 'airCustomer';
    // Map customer type to search type - show only selected type
    const mapping = {
      'airCustomer': 'airCustomer',
      'vendor': 'vendor',
      'agent': 'agent',
      'haji': 'haji',
      'umrah': 'umrah',
      'loan': 'loans',
      'personalExpense': 'personal', // Show personal expense categories
      'mirajIndustries': 'miraj',
      'officeExpenses': 'office',
      'moneyExchange': 'moneyExchange',
      'investment': 'investment',
      'asset': 'asset'
    };
    return mapping[formData.selectedCustomerType] || 'airCustomer';
  };
  
  // Use selectedCustomerType for step 3, otherwise use selectedSearchType
  const effectiveSearchType = currentStep === 3 && formData.selectedCustomerType 
    ? getSearchTypeForStep3() 
    : selectedSearchType;
  const [invoiceSearchTerm, setInvoiceSearchTerm] = useState('');
  const [debitAccountSearchTerm, setDebitAccountSearchTerm] = useState('');
  const [creditAccountSearchTerm, setCreditAccountSearchTerm] = useState('');
  const [accountManagerSearchTerm, setAccountManagerSearchTerm] = useState('');
  const [showAccountManagerDropdown, setShowAccountManagerDropdown] = useState(false);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [errors, setErrors] = useState({});
  const [showHeader, setShowHeader] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [accountSearchTerm, setAccountSearchTerm] = useState('');
  
  // Fetch data from backend APIs
  useEffect(() => {
    // Fetch Air Customers
    const fetchAirCustomers = async () => {
      try {
        setAirCustomersLoading(true);
        const response = await fetch('/api/air-customers?limit=10000');
        if (response.ok) {
          const data = await response.json();
          setAirCustomers(data.customers || data.data || []);
        }
      } catch (error) {
        console.error('Error fetching air customers:', error);
      } finally {
        setAirCustomersLoading(false);
      }
    };

    // Fetch Agents
    const fetchAgents = async () => {
      try {
        setAgentLoading(true);
        const response = await fetch('/api/agents?limit=10000');
        if (response.ok) {
          const data = await response.json();
          setAgentResults(data.agents || data.data || []);
        }
      } catch (error) {
        console.error('Error fetching agents:', error);
      } finally {
        setAgentLoading(false);
      }
    };

    // Fetch Vendors
    const fetchVendors = async () => {
      try {
        setVendorLoading(true);
        const response = await fetch('/api/vendors?limit=10000');
        if (response.ok) {
          const data = await response.json();
          setVendorResults(data.vendors || data.data || []);
        }
      } catch (error) {
        console.error('Error fetching vendors:', error);
      } finally {
        setVendorLoading(false);
      }
    };

    // Fetch Haji
    const fetchHajis = async () => {
      try {
        setHajiLoading(true);
        const response = await fetch('/api/hajj-umrah/hajis?limit=10000');
        if (response.ok) {
          const data = await response.json();
          setHajiData({ data: data.hajis || data.data || [] });
        }
      } catch (error) {
        console.error('Error fetching hajis:', error);
      } finally {
        setHajiLoading(false);
      }
    };

    // Fetch Umrah
    const fetchUmrahs = async () => {
      try {
        setUmrahLoading(true);
        const response = await fetch('/api/hajj-umrah/umrahs?limit=10000');
        if (response.ok) {
          const data = await response.json();
          setUmrahData({ data: data.umrahs || data.data || [] });
        }
      } catch (error) {
        console.error('Error fetching umrahs:', error);
      } finally {
        setUmrahLoading(false);
      }
    };

    // Fetch Investments - IATA & Airlines Capping and Others Invest
    const fetchInvestments = async () => {
      try {
        setInvestmentLoading(true);
        // Fetch both types of investments in parallel
        const [iataResponse, othersResponse] = await Promise.all([
          fetch('/api/investments/iata-airlines-capping?limit=10000'),
          fetch('/api/investments/others-invest?limit=10000')
        ]);
        
        const iataData = iataResponse.ok ? await iataResponse.json() : { investments: [], data: [] };
        const othersData = othersResponse.ok ? await othersResponse.json() : { investments: [], data: [] };
        
        // Combine both investment types
        const iataInvestments = (iataData.investments || iataData.data || []).map(inv => ({
          ...inv,
          investmentCategory: 'IATA & Airlines Capping',
          name: inv.airlineName || 'IATA/Airlines Investment',
          amount: inv.cappingAmount || 0,
          type: inv.investmentType || 'IATA'
        }));
        
        const othersInvestments = (othersData.investments || othersData.data || []).map(inv => ({
          ...inv,
          investmentCategory: 'Others Invest',
          name: inv.investmentName || 'Other Investment',
          amount: inv.investmentAmount || 0,
          type: inv.investmentType || 'Other'
        }));
        
        // Combine all investments
        const allInvestments = [...iataInvestments, ...othersInvestments];
        setInvestmentData({ data: allInvestments });
      } catch (error) {
        console.error('Error fetching investments:', error);
      } finally {
        setInvestmentLoading(false);
      }
    };

    // Fetch Loans - Receiving and Giving
    const fetchLoans = async () => {
      try {
        setLoansSearchLoading(true);
        // Fetch giving loans
        const givingResponse = await fetch('/api/loans/giving?limit=10000');
        const givingData = givingResponse.ok ? await givingResponse.json() : { loans: [] };
        // Fetch receiving loans
        const receivingResponse = await fetch('/api/loans/receiving?limit=10000');
        const receivingData = receivingResponse.ok ? await receivingResponse.json() : { loans: [] };
        
        const allLoans = [
          ...(givingData.loans || givingData.data || []).map(loan => ({ ...loan, loanDirection: 'giving', direction: 'giving' })),
          ...(receivingData.loans || receivingData.data || []).map(loan => ({ ...loan, loanDirection: 'receiving', direction: 'receiving' }))
        ];
        setLoansSearch(allLoans);
        console.log('✅ Fetched loans:', { giving: givingData.loans?.length || 0, receiving: receivingData.loans?.length || 0, total: allLoans.length });
      } catch (error) {
        console.error('Error fetching loans:', error);
      } finally {
        setLoansSearchLoading(false);
      }
    };

    // Fetch Money Exchange - fetch actual money exchange transactions
    const fetchMoneyExchange = async () => {
      try {
        setMoneyExchangeLoading(true);
        const response = await fetch('/api/money-exchange?limit=10000');
        if (response.ok) {
          const data = await response.json();
          // Use exchanges or data array from the response
          setMoneyExchangeList(data.exchanges || data.data || []);
        }
      } catch (error) {
        console.error('Error fetching money exchange:', error);
      } finally {
        setMoneyExchangeLoading(false);
      }
    };

    // Fetch Miraj Industries: কর্মচারী, আয়, খরচ
    const fetchMirajData = async () => {
      setMirajEmployeesLoading(true);
      setMirajIncomesLoading(true);
      setMirajExpensesLoading(true);
      try {
        const [empRes, incRes, expRes] = await Promise.all([
          fetch('/api/miraj-industries/farm-employees?limit=1000'),
          fetch('/api/miraj-industries/farm-incomes'),
          fetch('/api/miraj-industries/farm-expenses')
        ]);
        if (empRes.ok) {
          const d = await empRes.json();
          setMirajEmployees(d.employees || []);
        }
        if (incRes.ok) {
          const d = await incRes.json();
          setMirajIncomes(d.incomes || d.data || []);
        }
        if (expRes.ok) {
          const d = await expRes.json();
          setMirajExpenses(d.expenses || d.data || []);
        }
      } catch (error) {
        console.error('Error fetching Miraj data:', error);
      } finally {
        setMirajEmployeesLoading(false);
        setMirajIncomesLoading(false);
        setMirajExpensesLoading(false);
      }
    };

    // Fetch Operating Expense Categories
    const fetchOperatingExpenseCategories = async () => {
      setOpExLoading(true);
      try {
        const response = await fetch('/api/operating-expenses/categories');
        if (response.ok) {
          const data = await response.json();
          setOpExCategories(data.categories || []);
        }
      } catch (error) {
        console.error('Error fetching operating expense categories:', error);
      } finally {
        setOpExLoading(false);
      }
    };

    // Fetch only the selected type's data when step 3 is reached
    if (currentStep === 3 && formData.selectedCustomerType) {
      const selectedType = formData.selectedCustomerType;
      
      // Fetch only the selected type's data
      if (selectedType === 'airCustomer') {
        fetchAirCustomers();
      } else if (selectedType === 'agent') {
        fetchAgents();
      } else if (selectedType === 'vendor') {
        fetchVendors();
      } else if (selectedType === 'haji') {
        fetchHajis();
      } else if (selectedType === 'umrah') {
        fetchUmrahs();
      } else if (selectedType === 'loan') {
        fetchLoans();
      } else if (selectedType === 'moneyExchange') {
        fetchMoneyExchange();
      } else if (selectedType === 'mirajIndustries') {
        fetchMirajData();
      } else if (selectedType === 'officeExpenses') {
        fetchOperatingExpenseCategories();
      } else if (selectedType === 'personalExpense') {
        const fetchPersonalExpenseProfiles = async () => {
          try {
            setPersonalCatsLoading(true);
            const res = await fetch('/api/personal-expense?limit=1000');
            const data = await res.json();
            if (res.ok) {
              setPersonalExpenseProfiles(data.items || data.data || []);
            }
          } catch (err) {
            console.error('Error fetching personal expense profiles:', err);
          } finally {
            setPersonalCatsLoading(false);
          }
        };
        fetchPersonalExpenseProfiles();
      } else if (selectedType === 'investment') {
        fetchInvestments();
      }
    }
  }, [currentStep, formData.selectedCustomerType]);

  // Fetch Bank Accounts
  useEffect(() => {
    const fetchBankAccounts = async () => {
      try {
        setAccountsLoading(true);
        setAccountsError(null);
        const response = await fetch('/api/bank-accounts?status=active');
        if (response.ok) {
          const data = await response.json();
          const bankAccounts = data.bankAccounts || data.data || [];
          // Format accounts for the component
          const formattedAccounts = bankAccounts.map(account => ({
            id: account.id || account._id,
            name: account.accountTitle || account.accountHolder || `${account.bankName} - ${account.accountNumber}`,
            accountTitle: account.accountTitle,
            accountHolder: account.accountHolder,
            bankName: account.bankName,
            accountNumber: account.accountNumber,
            accountType: account.accountType,
            accountCategory: account.accountCategory || 'bank',
            balance: account.currentBalance ?? 0,
            logo: account.logo,
            branchName: account.branchName,
            currency: account.currency || 'BDT',
            status: account.status || 'active'
          }));
          setAccounts(formattedAccounts);
        } else {
          const errorData = await response.json();
          setAccountsError(errorData.error || 'Failed to fetch bank accounts');
        }
      } catch (error) {
        console.error('Error fetching bank accounts:', error);
        setAccountsError(error.message || 'Failed to fetch bank accounts');
      } finally {
        setAccountsLoading(false);
      }
    };

    // Fetch bank accounts when component mounts or when payment step (4 or 5) is reached
    fetchBankAccounts();
  }, [currentStep]);

  // Fetch Employees for Account Manager Selection
  useEffect(() => {
    const fetchEmployees = async () => {
      // Only fetch if dropdown is shown or search term is provided
      if (!showAccountManagerDropdown && (!accountManagerSearchTerm || accountManagerSearchTerm.trim().length < 2)) {
        return;
      }

      try {
        setEmployeeLoading(true);
        setEmployeeSearchError(null);
        
        const searchTerm = accountManagerSearchTerm.trim();
        const response = await fetch(`/api/employees?status=active&limit=100`);
        
        if (response.ok) {
          const data = await response.json();
          const employees = data.employees || data.data || [];
          
          // Filter employees based on search term (if provided)
          let filteredEmployees = employees;
          if (searchTerm && searchTerm.length >= 2) {
            filteredEmployees = employees.filter(employee => {
              const searchLower = searchTerm.toLowerCase();
              const fullName = employee.fullName || `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
              const position = employee.position || '';
              const phone = employee.phone || '';
              const email = employee.email || '';
              const employeeId = employee.employeeId || '';
              
              return (
                fullName.toLowerCase().includes(searchLower) ||
                position.toLowerCase().includes(searchLower) ||
                phone.includes(searchTerm) ||
                email.toLowerCase().includes(searchLower) ||
                employeeId.toLowerCase().includes(searchLower)
              );
            });
          }

          // Format employees for display
          const formattedEmployees = filteredEmployees.map(employee => {
            const fullName = employee.fullName || `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
            return {
              _id: employee.id || employee._id,
              id: employee.id || employee._id,
              name: fullName,
              fullName: fullName,
              firstName: employee.firstName || '',
              lastName: employee.lastName || '',
              designation: employee.position || '',
              position: employee.position || '',
              phone: employee.phone || '',
              email: employee.email || '',
              employeeId: employee.employeeId || '',
              department: employee.department || '',
              branch: employee.branch || ''
            };
          });

          setEmployeeSearchResults(formattedEmployees);
        } else {
          const errorData = await response.json();
          setEmployeeSearchError(errorData.error || 'Failed to fetch employees');
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
        setEmployeeSearchError(error.message || 'Failed to fetch employees');
      } finally {
        setEmployeeLoading(false);
      }
    };

    // Debounce the search
    const timer = setTimeout(() => {
      fetchEmployees();
    }, 300);

    return () => clearTimeout(timer);
  }, [accountManagerSearchTerm, showAccountManagerDropdown]);
  
  // Search hooks - using state (declared above)

  // Vendor bank accounts - empty data
  const vendorBankAccounts = [];
  const vendorBankAccountsLoading = false;

  // Agent packages - empty data
  const agentPackages = [];
  const packagesLoading = false;

  // Haji data - empty
  const hajjiDetail = null;
  const hajjiDetailLoading = false;

  // Haji family summary - empty
  const hajjiFamilySummary = null;
  const hajjiFamilyLoading = false;

  // Umrah data - empty
  const umrahDetail = null;
  const umrahDetailLoading = false;
  
  // Account Manager search - state for employees
  const accountManagerSearchTermStr = accountManagerSearchTerm ? String(accountManagerSearchTerm).trim() : '';
  const shouldSearch = accountManagerSearchTermStr.length >= 2;
  const [employeeSearchResults, setEmployeeSearchResults] = useState([]);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [employeeSearchError, setEmployeeSearchError] = useState(null);

  // Loans search - using state (declared above)
  
  // Miraj Industries: employees, আয়, খরচ
  const [mirajEmployees, setMirajEmployees] = useState([]);
  const [mirajEmployeesLoading, setMirajEmployeesLoading] = useState(false);
  const [mirajIncomes, setMirajIncomes] = useState([]);
  const [mirajIncomesLoading, setMirajIncomesLoading] = useState(false);
  const [mirajExpenses, setMirajExpenses] = useState([]);
  const [mirajExpensesLoading, setMirajExpensesLoading] = useState(false);
  
  // Office expenses categories
  const [opExCategories, setOpExCategories] = useState([]);
  const [opExLoading, setOpExLoading] = useState(false);
  
  // Money exchange listings - using state (declared above)
  
  // Investment data - similar to haji and umrah
  const [investmentData, setInvestmentData] = useState({ data: [] });
  const [investmentLoading, setInvestmentLoading] = useState(false);
  
  // Asset queries - empty data
  const assetsList = [];
  const assetsLoading = false;
  
  // Payment methods
  const paymentMethods = [
    { 
      id: 'cash', 
      name: 'ক্যাশ', 
      icon: Banknote, 
      color: 'from-green-500 to-green-600',
      fields: ['reference'],
      accountCategory: 'cash'
    },
    { 
      id: 'bank-transfer', 
      name: 'ব্যাংক ট্রান্সফার', 
      icon: CreditCardIcon, 
      color: 'from-blue-500 to-blue-600',
      fields: ['bankName', 'accountNumber', 'reference'],
      accountCategory: 'bank'
    },
    { 
      id: 'cheque', 
      name: 'চেক', 
      icon: Receipt, 
      color: 'from-orange-500 to-orange-600',
      fields: ['reference'], // Removed: chequeNumber, bankName, accountNumber
      accountCategory: 'bank'
    },
    { 
      id: 'mobile-banking', 
      name: 'মোবাইল ব্যাংকিং', 
      icon: Smartphone, 
      color: 'from-purple-500 to-purple-600',
      fields: ['reference'], // Removed: mobileProvider, transactionId
      accountCategory: 'mobile_banking'
    },
    { 
      id: 'others', 
      name: 'অন্যান্য', 
      icon: ArrowRightLeft, 
      color: 'from-gray-500 to-gray-600',
      fields: ['reference'],
      accountCategory: 'others'
    }
  ];

  // Helper: Avoid "false" showing in placeholders by mapping field → text
  // Helper function to calculate charge with correct sign based on transaction type
  const getChargeWithSign = () => {
    const rawCharge = parseFloat(formData.paymentDetails.charge || 0);
    if (!rawCharge || rawCharge <= 0) return 0;
    
    // Credit: charge is negative (-)
    // Debit: charge is positive (+)
    // Transfer: charge is negative (-)
    if (formData.transactionType === 'credit' || formData.transactionType === 'transfer') {
      return -rawCharge;
    } else if (formData.transactionType === 'debit') {
      return rawCharge;
    }
    return 0;
  };

  // Helper function to get total amount (amount + charge with sign)
  const getTotalAmount = () => {
    const amount = parseFloat(formData.paymentDetails.amount || 0);
    const charge = getChargeWithSign();
    return amount + charge;
  };

  const getPaymentFieldPlaceholder = (field) => {
    switch (field) {
      case 'bankName':
        return 'ব্যাংকের নাম লিখুন...';
      case 'accountNumber':
        return 'অ্যাকাউন্ট নম্বর লিখুন...';
      case 'cardNumber':
        return 'কার্ড নম্বর লিখুন...';
      case 'chequeNumber':
        return 'চেক নম্বর লিখুন...';
      case 'mobileProvider':
        return 'মোবাইল প্রোভাইডার লিখুন...';
      case 'transactionId':
        return 'ট্রানজেকশন আইডি লিখুন...';
      case 'reference':
        return 'রেফারেন্স লিখুন...';
      default:
        return 'তথ্য লিখুন...';
    }
  };
  
  // Filter accounts based on search term and payment method
  const filteredAccounts = accounts.filter(account => {
    // Filter by payment method if selected
    if (formData.paymentMethod) {
      const selectedPaymentMethod = paymentMethods.find(
        method => method.id === formData.paymentMethod
      );

      // Only show accounts that match the method's category (cash/bank/mobile_banking/other)
      if (
        selectedPaymentMethod &&
        account.accountCategory !== selectedPaymentMethod.accountCategory
      ) {
        return false;
      }
    }

    // Filter by search term
    if (accountSearchTerm) {
      const lowerSearch = accountSearchTerm.toLowerCase();
      return (
        account.name?.toLowerCase().includes(lowerSearch) ||
        account.bankName?.toLowerCase().includes(lowerSearch) ||
        account.accountNumber?.toLowerCase().includes(lowerSearch)
      );
    }

    return true;
  });

  
  // Bank accounts are now fetched via React Query
  
  // Mock account managers
  const [accountManagers] = useState([
    {
      id: 'AM-001',
      name: 'মোঃ রফিকুল ইসলাম',
      phone: '+8801712345678',
      email: 'rafiqul@company.com',
      designation: 'সিনিয়র একাউন্ট ম্যানেজার'
    },
    {
      id: 'AM-002',
      name: 'মোসাঃ ফাতেমা খাতুন',
      phone: '+8801812345678',
      email: 'fatema@company.com',
      designation: 'একাউন্ট ম্যানেজার'
    },
    {
      id: 'AM-003',
      name: 'মোঃ করিম উদ্দিন',
      phone: '+8801912345678',
      email: 'karim@company.com',
      designation: 'এসোসিয়েট একাউন্ট ম্যানেজার'
    }
  ]);
  
  // Filter invoices based on search term
  const filteredInvoices = effectiveInvoices.filter(invoice => {
    if (!invoiceSearchTerm.trim()) return true;
    
    const searchLower = invoiceSearchTerm.toLowerCase();
    return (
      (invoice.invoiceNumber || '').toLowerCase().includes(searchLower) ||
      (invoice.customerName || '').toLowerCase().includes(searchLower) ||
      (invoice.description || '').toLowerCase().includes(searchLower) ||
      (invoice.amount || 0).toString().includes(searchLower)
    );
  });

  // Filter accounts based on search terms
  const filteredDebitAccounts = accounts.filter(account => {
    if (!debitAccountSearchTerm.trim()) return true;
    
    const searchLower = debitAccountSearchTerm.toLowerCase();
    return (
      (account.name || '').toLowerCase().includes(searchLower) ||
      (account.bankName || '').toLowerCase().includes(searchLower) ||
      String(account.accountNumber || '').includes(debitAccountSearchTerm) ||
      (account.type || '').toLowerCase().includes(searchLower)
    );
  });

  const filteredCreditAccounts = accounts.filter(account => {
    if (!creditAccountSearchTerm.trim()) return true;
    
    const searchLower = creditAccountSearchTerm.toLowerCase();
    return (
      (account.name || '').toLowerCase().includes(searchLower) ||
      (account.bankName || '').toLowerCase().includes(searchLower) ||
      String(account.accountNumber || '').includes(creditAccountSearchTerm) ||
      (account.type || '').toLowerCase().includes(searchLower)
    );
  });

  // Use employee search results for account managers
  const filteredAccountManagers = employeeSearchResults;

  // Customers are now fetched via React Query

  // Agent and vendor search are now handled by React Query hooks

  // Transform categories data to match the expected structure
  const categoryGroups = categories.map(category => ({
    id: category.id,
    name: category.name,
    description: category.description,
    icon: category.icon,
    subCategories: category.subCategories || []
  }));

  // Dynamic steps based on transaction type
  const getSteps = () => {
    if (formData.transactionType === 'transfer') {
      return [
        { number: 1, title: 'লেনদেন টাইপ', description: 'একাউন্ট টু একাউন্ট ট্রান্সফার' },
        { number: 2, title: 'ডেবিট একাউন্ট', description: 'ডেবিট একাউন্ট নির্বাচন করুন' },
        { number: 3, title: 'ক্রেডিট একাউন্ট', description: 'ক্রেডিট একাউন্ট নির্বাচন করুন' },
        { number: 4, title: 'ট্রান্সফার বিবরণ', description: 'ট্রান্সফার পরিমাণ ও একাউন্ট ম্যানেজার নির্বাচন' },
        { number: 5, title: 'কনফার্মেশন', description: 'এসএমএস কনফার্মেশন এবং সংরক্ষণ' }
      ];
    } else if (formData.transactionType === 'debit') {
      return [
        { number: 1, title: 'লেনদেন টাইপ', description: 'ডেবিট (ব্যয়) নির্বাচন করুন' },
        { number: 2, title: 'কাস্টমার টাইপ', description: 'কাস্টমার টাইপ নির্বাচন করুন' },
        { number: 3, title: 'কাস্টমার নির্বাচন', description: 'কাস্টমার সিলেক্ট করুন' },
        { number: 4, title: 'পেমেন্ট মেথড', description: 'পেমেন্টের ধরন নির্বাচন করুন' },
        { number: 5, title: 'কনফার্মেশন', description: 'তথ্য যাচাই এবং সংরক্ষণ' }
      ];
    } else {
      // Credit transaction
      if (formData.customerType === 'agent') {
        // For agent credit transactions, add balance information step
        return [
          { number: 1, title: 'লেনদেন টাইপ', description: 'ক্রেডিট (আয়) নির্বাচন করুন' },
          { number: 2, title: 'কাস্টমার টাইপ', description: 'কাস্টমার টাইপ নির্বাচন করুন' },
          { number: 3, title: 'কাস্টমার নির্বাচন', description: 'কাস্টমার সিলেক্ট করুন' },
          { number: 4, title: 'এজেন্টের ব্যালেন্স তথ্য', description: 'এজেন্টের বর্তমান ব্যালেন্স এবং বকেয়া পরিমাণ দেখুন' },
          { number: 5, title: 'পেমেন্ট মেথড', description: 'পেমেন্টের ধরন নির্বাচন করুন' },
          { number: 6, title: 'কনফার্মেশন', description: 'তথ্য যাচাই এবং সংরক্ষণ' }
        ];
      } else if (formData.customerType === 'haji' || formData.customerType === 'umrah') {
        // For hajji/umrah credit transactions, add balance information step
        return [
          { number: 1, title: 'লেনদেন টাইপ', description: 'ক্রেডিট (আয়) নির্বাচন করুন' },
          { number: 2, title: 'কাস্টমার টাইপ', description: 'কাস্টমার টাইপ নির্বাচন করুন' },
          { number: 3, title: 'কাস্টমার নির্বাচন', description: 'কাস্টমার সিলেক্ট করুন' },
          { number: 4, title: formData.customerType === 'haji' ? 'হাজ্বীর ব্যালেন্স তথ্য' : 'উমরাহ যাত্রীর ব্যালেন্স তথ্য', description: formData.customerType === 'haji' ? 'হাজ্বীর বর্তমান ব্যালেন্স এবং বকেয়া পরিমাণ দেখুন' : 'উমরাহ যাত্রীর বর্তমান ব্যালেন্স এবং বকেয়া পরিমাণ দেখুন' },
          { number: 5, title: 'পেমেন্ট মেথড', description: 'পেমেন্টের ধরন নির্বাচন করুন' },
          { number: 6, title: 'কনফার্মেশন', description: 'তথ্য যাচাই এবং সংরক্ষণ' }
        ];
      } else {
        // For non-agent credit transactions
        return [
          { number: 1, title: 'লেনদেন টাইপ', description: 'ক্রেডিট (আয়) নির্বাচন করুন' },
          { number: 2, title: 'কাস্টমার টাইপ', description: 'কাস্টমার টাইপ নির্বাচন করুন' },
          { number: 3, title: 'কাস্টমার নির্বাচন', description: 'কাস্টমার সিলেক্ট করুন' },
          { number: 4, title: 'পেমেন্ট মেথড', description: 'পেমেন্টের ধরন নির্বাচন করুন' },
          { number: 5, title: 'কনফার্মেশন', description: 'তথ্য যাচাই এবং সংরক্ষণ' }
        ];
      }
    }
  };

  const steps = getSteps();

  // Helper function to get step color for transfer transactions
  const getStepColor = (stepNumber, isActive, isCompleted) => {
    if (formData.transactionType === 'transfer') {
      if (stepNumber === 2) {
        // Debit Account step - Red
        if (isActive) return { bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', circle: 'bg-red-500' };
        if (isCompleted) return { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400', circle: 'bg-green-500' };
        return { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-500 dark:text-gray-400', circle: 'bg-gray-300 dark:bg-gray-600' };
      } else if (stepNumber === 3) {
        // Credit Account step - Green
        if (isActive) return { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400', circle: 'bg-green-500' };
        if (isCompleted) return { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400', circle: 'bg-green-500' };
        return { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-500 dark:text-gray-400', circle: 'bg-gray-300 dark:bg-gray-600' };
      }
    }
    // Default colors for other steps
    if (isActive) return { bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', circle: 'bg-blue-500' };
    if (isCompleted) return { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400', circle: 'bg-green-500' };
    return { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-500 dark:text-gray-400', circle: 'bg-gray-300 dark:bg-gray-600' };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCustomerSelect = (customer) => {
    // Priority: Use customer.customerType if explicitly provided (for haji/umrah)
    // Then check selectedSearchType for airCustomer
    // Otherwise, use the customer's type or default to 'customer'
    const resolvedType = customer.customerType 
      ? customer.customerType 
      : (selectedSearchType === 'airCustomer' 
          ? 'airCustomer' 
          : (customer.type || customer._type || 'customer'));
    const autoCategory = resolvedType === 'haji' ? 'হাজ্জ প্যাকেজ' : (resolvedType === 'umrah' ? 'ওমরাহ প্যাকেজ' : undefined);
    const autoSelectedOption = resolvedType === 'haji' ? 'hajj' : (resolvedType === 'umrah' ? 'umrah' : undefined);
    const autoServiceCategory = resolvedType === 'haji' ? 'hajj' : (resolvedType === 'umrah' ? 'umrah' : undefined);
    const exchangeInfo = resolvedType === 'money-exchange' ? (customer.moneyExchangeInfo || {}) : null;
    const exchangeAmount = exchangeInfo && (exchangeInfo.amount_bdt ?? exchangeInfo.amount);
    
    // For haji/umrah, extract linked customerId if available (for syncing to customer profile)
    // Haji/Umrah records have a customerId field that links to the customer profile
    // This is different from the haji/umrah record's own _id
    const linkedCustomerId = (resolvedType === 'haji' || resolvedType === 'umrah') 
      ? (customer.customerId || customer.linkedCustomerId || customer.airCustomerId || customer.referenceCustomerId || null)
      : null;
    
    // Debug log for haji/umrah selection
    if (resolvedType === 'haji' || resolvedType === 'umrah') {
      console.log('Haji/Umrah Selection Debug:', {
        resolvedType,
        customerId: customer.id || customer._id || customer.customerId,
        linkedCustomerId: linkedCustomerId,
        customerObject: customer
      });
    }

    setFormData(prev => ({
      ...prev,
      customerId: (customer.id || customer.customerId) ? String(customer.id || customer.customerId) : '',
      uniqueId: customer.uniqueId || customer.customerId || '',
      // Store linked customerId for haji/umrah to sync with customer profile
      linkedCustomerId: linkedCustomerId ? String(linkedCustomerId) : null,
      customerName: customer.name,
      customerPhone: customer.mobile || customer.phone || customer.mobileNumber || customer.contactNo || '',
      customerEmail: customer.email,
      customerAddress: customer.address || customer.fullAddress || '',
      customerType: resolvedType,
      // ✅ employeeReference automatically set করুন Miraj Employee select করার সময়
      employeeReference: customer.employeeReference || 
        (resolvedType === 'miraj-employee' ? {
          id: customer.id || customer.customerId,
          name: customer.name || 'N/A',
          employeeId: customer.employeeId || customer.id || customer.customerId,
          position: customer.position || '',
          department: customer.department || ''
        } : prev.employeeReference),
      // Store operating expense category ID and object for office expenses
      operatingExpenseCategoryId: resolvedType === 'office' ? String(customer.id || customer.customerId) : undefined,
      operatingExpenseCategory: resolvedType === 'office' ? {
        id: customer.id || customer.customerId,
        name: customer.name || customer.categoryName || '',
        categoryName: customer.name || customer.categoryName || ''
      } : undefined,
    // Store personal profile id for personal expense
    ...(resolvedType === 'personal-expense' && customer.personalExpenseProfileId
      ? { personalExpenseProfileId: customer.personalExpenseProfileId }
      : {}),
      moneyExchangeInfo: resolvedType === 'money-exchange'
        ? (customer.moneyExchangeInfo || null)
        : null,
      paymentMethod: resolvedType === 'money-exchange' ? 'cash' : prev.paymentMethod,
      paymentDetails: {
        ...prev.paymentDetails,
        ...(resolvedType === 'money-exchange' && exchangeAmount != null
          ? { amount: String(exchangeAmount) }
          : {}),
        ...(resolvedType === 'money-exchange' && exchangeInfo?.id
          ? { reference: exchangeInfo.id }
          : {})
      },
      // Autofill fields for proper Umrah/Hajj backend mapping
      ...(autoCategory ? { category: autoCategory } : {}),
      ...(autoSelectedOption ? { selectedOption: autoSelectedOption } : {}),
      ...(autoServiceCategory ? { serviceCategory: autoServiceCategory } : {}),
      selectedInvoice: null,
      invoiceId: '',
      agentDueInfo: null,
      // Package selection for agent transactions
      selectedPackage: null,
      selectedPackageId: ''
    }));
    setSearchLoading(false);
  };

  const handleAgentSelect = async (agent) => {
    const agentId = agent._id || agent.id;
    
    // Fetch full agent details to get latest balance information
    try {
      const response = await fetch(`/api/agents/${agentId}`);
      if (response.ok) {
        const data = await response.json();
        const fullAgent = data.agent || data;
        
        setFormData(prev => ({
          ...prev,
          customerId: agentId,
          uniqueId: fullAgent.uniqueId || fullAgent.agentId || agent.uniqueId || agent.agentId || '',
          customerName: fullAgent.tradeName || fullAgent.ownerName || agent.tradeName || agent.ownerName || '',
          customerPhoto: fullAgent.profilePicture || fullAgent.profile_picture || agent.profilePicture || agent.profile_picture || '',
          customerPhone: fullAgent.contactNo || fullAgent.phone || fullAgent.mobile || agent.contactNo || agent.phone || agent.mobile || '',
          customerEmail: fullAgent.email || '',
          customerAddress: fullAgent.tradeLocation || fullAgent.address || agent.tradeLocation || agent.address || '',
          customerType: 'agent',
          // Store agent due amounts from full agent data
          agentDueInfo: {
            totalDue: fullAgent.totalDue !== undefined ? fullAgent.totalDue : (fullAgent.total_due || 0),
            hajDue: fullAgent.hajDue !== undefined ? fullAgent.hajDue : (fullAgent.haj_due || 0),
            umrahDue: fullAgent.umrahDue !== undefined ? fullAgent.umrahDue : (fullAgent.umrah_due || 0),
            totalDeposit: fullAgent.totalDeposit !== undefined ? fullAgent.totalDeposit : (fullAgent.total_deposit || 0),
            totalPaid: fullAgent.totalPaid !== undefined ? fullAgent.totalPaid : (fullAgent.total_paid || 0),
            hajPaid: fullAgent.hajPaid !== undefined ? fullAgent.hajPaid : (fullAgent.haj_paid || 0),
            umrahPaid: fullAgent.umrahPaid !== undefined ? fullAgent.umrahPaid : (fullAgent.umrah_paid || 0),
            totalAdvance: fullAgent.totalAdvance !== undefined ? fullAgent.totalAdvance : (fullAgent.total_advance || 0),
            hajAdvance: fullAgent.hajAdvance !== undefined ? fullAgent.hajAdvance : (fullAgent.haj_advance || 0),
            umrahAdvance: fullAgent.umrahAdvance !== undefined ? fullAgent.umrahAdvance : (fullAgent.umrah_advance || 0)
          }
        }));
      } else {
        // Fallback to agent data from list if API call fails
        setFormData(prev => ({
          ...prev,
          customerId: agentId,
          uniqueId: agent.uniqueId || agent.agentId || '',
          customerName: agent.tradeName || agent.ownerName || '',
          customerPhoto: agent.profilePicture || agent.profile_picture || '',
          customerPhone: agent.contactNo || agent.phone || agent.mobile || agent.mobileNumber || '',
          customerEmail: '',
          customerAddress: agent.address || agent.fullAddress || '',
          customerType: 'agent',
          // Store agent due amounts from list data
          agentDueInfo: {
            totalDue: agent.totalDue || 0,
            hajDue: agent.hajDue || 0,
            umrahDue: agent.umrahDue || 0,
            totalDeposit: agent.totalDeposit || 0,
            totalPaid: agent.totalPaid || 0,
            hajPaid: agent.hajPaid || 0,
            umrahPaid: agent.umrahPaid || 0,
            totalAdvance: agent.totalAdvance || 0,
            hajAdvance: agent.hajAdvance || 0,
            umrahAdvance: agent.umrahAdvance || 0
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching agent details:', error);
      // Fallback to agent data from list
      setFormData(prev => ({
        ...prev,
        customerId: agentId,
        uniqueId: agent.uniqueId || agent.agentId || '',
        customerName: agent.tradeName || agent.ownerName || '',
          customerPhoto: agent.profilePicture || agent.profile_picture || '',
          customerPhone: agent.contactNo || agent.phone || agent.mobile || agent.mobileNumber || '',
        customerEmail: '',
        customerAddress: agent.address || agent.fullAddress || '',
        customerType: 'agent',
        agentDueInfo: {
          totalDue: agent.totalDue || 0,
          hajDue: agent.hajDue || 0,
          umrahDue: agent.umrahDue || 0,
          totalDeposit: agent.totalDeposit || 0,
          totalPaid: agent.totalPaid || 0,
          hajPaid: agent.hajPaid || 0,
          umrahPaid: agent.umrahPaid || 0,
          totalAdvance: agent.totalAdvance || 0,
          hajAdvance: agent.hajAdvance || 0,
          umrahAdvance: agent.umrahAdvance || 0
        }
      }));
    }
    setSearchLoading(false);
  };

  const handleVendorSelect = (vendor) => {
    setFormData(prev => ({
      ...prev,
      customerId: vendor._id || vendor.id,
      uniqueId: vendor.uniqueId || vendor.vendorId || '',
      customerName: vendor.tradeName || vendor.vendorName || vendor.name || '',
      customerPhone: vendor.contactNo || vendor.phone || vendor.mobile || vendor.mobileNumber || '',
      customerEmail: vendor.email || '',
      customerAddress: vendor.address || vendor.fullAddress || '',
      customerType: 'vendor',
      // Clear agent due info when selecting vendor
      agentDueInfo: null
    }));
    setSearchLoading(false);
  };

  const handleLoanSelect = (loan) => {
    // Loan API uses: fullName, contactPhone, contactEmail, businessName
    const loanName = loan.fullName || loan.customerName || loan.borrowerName || loan.businessName || loan.tradeName || loan.ownerName || loan.name || 'Unknown';
    const loanPhone = loan.contactPhone || loan.customerPhone || loan.phone || loan.mobile || loan.mobileNumber || loan.contactNo || loan.borrowerPhone || loan.borrowerMobile || loan.emergencyPhone || '';
    const loanEmail = loan.contactEmail || loan.customerEmail || loan.email || loan.borrowerEmail || '';
    const loanAddress = loan.presentAddress || loan.permanentAddress || loan.businessAddress || loan.address || loan.fullAddress || loan.customerAddress || loan.borrowerAddress || '';
    
    setFormData(prev => ({
      ...prev,
      // Treat loan as a selectable party
      customerType: 'loan',
      customerId: (loan._id || loan.id || loan.loanId) ? String(loan._id || loan.id || loan.loanId) : '',
      uniqueId: loan.uniqueId || loan.loanId || '',
      customerName: loanName,
      customerPhone: loanPhone,
      customerEmail: loanEmail,
      customerAddress: loanAddress,
      loanInfo: {
        id: loan._id || loan.id || loan.loanId,
        name: loanName,
        direction: loan.loanDirection || loan.direction || '',
        customerId: loan.customerId || loan.relatedCustomerId || loan.linkedCustomerId || null,
        customerPhone: loanPhone,
        customerEmail: loanEmail
      }
    }));
    setSearchLoading(false);
  };

  const handleInvestmentSelect = (investment) => {
    setFormData(prev => ({
      ...prev,
      customerType: 'investment',
      customerId: (investment._id || investment.id) ? String(investment._id || investment.id) : '',
      uniqueId: investment.id || investment._id || '',
      customerName: investment.name || investment.airlineName || investment.investmentName || 'Investment',
      customerAddress: '',
      investmentInfo: {
        id: investment._id || investment.id,
        name: investment.name || investment.airlineName || investment.investmentName || 'Investment',
        category: investment.investmentCategory || 'Investment',
        type: investment.type || investment.investmentType || 'Other',
        amount: investment.cappingAmount || investment.investmentAmount || 0
      }
    }));
    setSearchLoading(false);
  };

  const handleInvoiceSelect = (invoice) => {
    setFormData(prev => ({
      ...prev,
      selectedInvoice: invoice,
      invoiceId: invoice.id || invoice._id,
      paymentDetails: {
        ...prev.paymentDetails,
        amount: (invoice.amount || 0).toString()
      }
    }));
  };

  const handleAccountSelect = (account, type) => {
    setFormData(prev => ({
      ...prev,
      [type]: {
        id: account.id,
        name: account.name,
        bankName: account.bankName,
        accountNumber: account.accountNumber,
        balance: account.balance
      }
    }));
  };

  const handleAccountManagerSelect = (manager) => {
    // Extract name from multiple possible fields (matching UI display logic)
    // Check all possible name fields and skip empty strings
    let managerName = '';
    
    // Priority 1: Direct name fields
    const name1 = manager.name?.trim();
    const name2 = manager.fullName?.trim();
    const name3 = manager.employeeName?.trim();
    const name4 = manager.userName?.trim();
    const name5 = manager.displayName?.trim();
    
    managerName = name1 || name2 || name3 || name4 || name5 || '';
    
    // Priority 2: Combine firstName + lastName if no direct name found
    if (!managerName) {
      const firstName = manager.firstName?.trim() || '';
      const lastName = manager.lastName?.trim() || '';
      const combinedName = `${firstName} ${lastName}`.trim();
      if (combinedName) managerName = combinedName;
    }
    
    // Priority 3: Try other possible name fields
    if (!managerName) {
      managerName = manager.employeeName?.trim() 
        || manager.accountManagerName?.trim()
        || '';
    }
    
    // Extract ID from multiple possible fields
    const managerId = manager._id 
      || manager.id 
      || manager.employeeId
      || '';
    
    // Extract phone from multiple possible fields
    const managerPhone = manager.phone?.trim()
      || manager.phoneNumber?.trim()
      || manager.mobile?.trim()
      || manager.mobileNumber?.trim()
      || '';
    
    // Extract email from multiple possible fields
    const managerEmail = manager.email?.trim()
      || manager.emailAddress?.trim()
      || '';
    
    // Only set accountManager if we have at least an ID or name
    if (managerId || managerName) {
      setFormData(prev => ({
        ...prev,
        accountManager: {
          id: managerId,
          name: managerName,
          phone: managerPhone,
          email: managerEmail,
          designation: manager.designation || manager.position || '',
          department: manager.department || ''
        }
      }));
      // Update search term to show selected employee name
      setAccountManagerSearchTerm(managerName);
      setShowAccountManagerDropdown(false);
      
      // Debug log to verify data
      console.log('Account Manager Selected:', {
        originalManager: manager,
        originalManagerKeys: Object.keys(manager),
        extractedData: {
          id: managerId,
          name: managerName,
          phone: managerPhone,
          email: managerEmail
        }
      });
    } else {
      console.warn('⚠️ Account Manager selected but no ID or name found!', {
        manager: manager,
        managerKeys: Object.keys(manager)
      });
    }
    
    // Clear search term after selection
    setAccountManagerSearchTerm('');
  };

  const handleEmployeeReferenceSelect = (employee) => {
    setFormData(prev => ({
      ...prev,
      employeeReference: {
        id: employee.id || employee.employeeId,
        name: employee.firstName && employee.lastName 
          ? `${employee.firstName} ${employee.lastName}` 
          : employee.name || 'Unknown Employee',
        employeeId: employee.employeeId || employee.id,
        position: employee.position || '',
        department: employee.department || ''
      }
    }));
  };

  const toggleCategoryGroup = (groupId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const handleCategorySelect = (categoryId) => {
    setFormData(prev => ({ ...prev, category: prev.category === categoryId ? '' : categoryId }));
    setErrors(prev => ({ ...prev, category: '' }));
  };
  const handleAccountSelectForTransaction = (account, type) => {
    setFormData(prev => ({
      ...prev,
      [type]: {
        id: account.id,
        name: account.name,
        bankName: account.bankName,
        accountNumber: account.accountNumber,
        balance: account.balance
      }
    }));
    // Clear search term after selection
    setAccountSearchTerm('');
  };

  // Filter categories based on search term
  const filteredCategoryGroups = categoryGroups
    .map(group => {
      const filteredSubCategories = (group.subCategories || []).filter(subCategory =>
        ((subCategory.name || '').toLowerCase().includes(categorySearchTerm.toLowerCase())) ||
        ((subCategory.description || '').toLowerCase().includes(categorySearchTerm.toLowerCase()))
      );
      
      return {
        ...group,
        subCategories: filteredSubCategories
      };
    })
    .filter(group => 
      (group.subCategories || []).length > 0 ||
      (group.name || '').toLowerCase().includes(categorySearchTerm.toLowerCase()) ||
      (group.description || '').toLowerCase().includes(categorySearchTerm.toLowerCase())
    );

  // When a category is selected, hide all other categories and show only the selected one
  const visibleCategoryGroups = formData.category
    ? categoryGroups
        .map(group => ({
          ...group,
          subCategories: group.subCategories.filter(subCategory => subCategory.id === formData.category)
        }))
        .filter(group => group.subCategories.length > 0)
    : filteredCategoryGroups;
  const validateStep = (step) => {
    const newErrors = {};

    if (formData.transactionType === 'transfer') {
      // Transfer validation flow
      switch (step) {
        case 1:
          if (!formData.transactionType) {
            newErrors.transactionType = 'লেনদেনের ধরন নির্বাচন করুন';
          } else if (!['credit', 'debit', 'transfer'].includes(formData.transactionType)) {
            newErrors.transactionType = 'লেনদেনের ধরন অবৈধ';
          }
          break;
        case 2:
          if (!formData.debitAccount.id) {
            newErrors.debitAccount = 'ডেবিট একাউন্ট নির্বাচন করুন';
          }
          break;
        case 3:
          if (!formData.creditAccount.id) {
            newErrors.creditAccount = 'ক্রেডিট একাউন্ট নির্বাচন করুন';
          } else if (formData.debitAccount.id === formData.creditAccount.id) {
            newErrors.creditAccount = 'ডেবিট এবং ক্রেডিট একাউন্ট একই হতে পারে না';
          }
          break;
        case 4:
          if (!formData.transferAmount) {
            newErrors.transferAmount = 'ট্রান্সফার পরিমাণ লিখুন';
          } else if (isNaN(parseFloat(formData.transferAmount)) || parseFloat(formData.transferAmount) <= 0) {
            newErrors.transferAmount = 'পরিমাণ ০ এর চেয়ে বেশি হতে হবে';
          } else if (parseFloat(formData.transferAmount) > formData.debitAccount.balance) {
            newErrors.transferAmount = 'পরিমাণ একাউন্ট ব্যালেন্সের চেয়ে বেশি হতে পারে না';
          }
          break;
        case 5:
          // Final confirmation step
          break;
      }
    } else {
      // Regular credit/debit validation flow
      if (formData.transactionType === 'debit') {
        // Debit flow: skip invoice step
        switch (step) {
          case 1:
            if (!formData.transactionType) {
              newErrors.transactionType = 'লেনদেনের ধরন নির্বাচন করুন';
            } else if (!['credit', 'debit', 'transfer'].includes(formData.transactionType)) {
              newErrors.transactionType = 'লেনদেনের ধরন অবৈধ';
            }
            break;
          case 2:
            if (!formData.selectedCustomerType) {
              newErrors.selectedCustomerType = 'কাস্টমার টাইপ নির্বাচন করুন';
            }
            break;
          case 3:
            // For personal expense, customer selection is required (profile)
            if (!formData.customerId) {
              newErrors.customerId = 'কাস্টমার নির্বাচন করুন';
            }
            break;
          case 4:
            if (!formData.paymentMethod) {
              newErrors.paymentMethod = 'পেমেন্ট মেথড নির্বাচন করুন';
            } else if (!['cash', 'bank-transfer', 'cheque', 'mobile-banking', 'others'].includes(formData.paymentMethod)) {
              newErrors.paymentMethod = 'পেমেন্ট মেথড অবৈধ';
            }
            // Only validate amount and accounts if payment method is selected
            if (formData.paymentMethod) {
              if (!formData.paymentDetails.amount) {
                newErrors.amount = 'পরিমাণ লিখুন';
              } else if (isNaN(parseFloat(formData.paymentDetails.amount)) || parseFloat(formData.paymentDetails.amount) <= 0) {
                newErrors.amount = 'পরিমাণ ০ এর চেয়ে বেশি হতে হবে';
              }
              // Validate source account (where money goes from)
              if (!formData.sourceAccount.id) {
                newErrors.sourceAccount = 'সোর্স একাউন্ট নির্বাচন করুন';
              }
            }
            break;
          case 5:
            // Final confirmation step for debit
            break;
        }
      } else {
        // Credit flow: include invoice step
        switch (step) {
          case 1:
            if (!formData.transactionType) {
              newErrors.transactionType = 'লেনদেনের ধরন নির্বাচন করুন';
            } else if (!['credit', 'debit', 'transfer'].includes(formData.transactionType)) {
              newErrors.transactionType = 'লেনদেনের ধরন অবৈধ';
            }
            break;
          case 2:
          if (!formData.selectedCustomerType) {
            newErrors.selectedCustomerType = 'কাস্টমার টাইপ নির্বাচন করুন';
          }
          break;
          case 3:
            // For investment flow, customer selection is not required (similar to personal/miraj)
            if (effectiveSearchType !== 'investment' && !formData.customerId) {
              newErrors.customerId = 'কাস্টমার নির্বাচন করুন';
            }
          break;
        case 4:
          // Agent/Hajji/Umrah balance step - no validation needed, just display
          if (formData.customerType === 'agent') {
            // For agents, validate selectedOption
            if (!formData.selectedOption) {
              newErrors.selectedOption = 'পেমেন্টের ধরন নির্বাচন করুন';
            }
          }
          // For hajji/umrah, no validation needed at balance step
          // For credit non-agent/hajji/umrah, step 4 is skipped, so no validation needed here
          break;
        case 5:
          // For credit non-agent/hajji/umrah: step 5 is payment method (step 4 is skipped for non-agent/hajji/umrah)
          // For credit agent/hajji/umrah: step 5 is payment method validation
          if (formData.customerType === 'agent' || formData.customerType === 'haji' || formData.customerType === 'umrah') {
            // For credit agent: step 5 is payment method validation
            if (!formData.paymentMethod) {
              newErrors.paymentMethod = 'পেমেন্ট মেথড নির্বাচন করুন';
            } else if (!['cash', 'bank-transfer', 'cheque', 'mobile-banking', 'others'].includes(formData.paymentMethod)) {
              newErrors.paymentMethod = 'পেমেন্ট মেথড অবৈধ';
            }
            // Only validate amount if payment method is selected
            if (formData.paymentMethod) {
              if (!formData.paymentDetails.amount) {
                newErrors.amount = 'পরিমাণ লিখুন';
              } else if (isNaN(parseFloat(formData.paymentDetails.amount)) || parseFloat(formData.paymentDetails.amount) <= 0) {
                newErrors.amount = 'পরিমাণ ০ এর চেয়ে বেশি হতে হবে';
              }
              // For agent credit transactions, require destination account
              if (!formData.destinationAccount.id) {
                newErrors.destinationAccount = 'ডেস্টিনেশন একাউন্ট নির্বাচন করুন';
              }
            }
          } else {
            // For credit non-agent: step 5 is payment method validation
            if (!formData.paymentMethod) {
              newErrors.paymentMethod = 'পেমেন্ট মেথড নির্বাচন করুন';
            } else if (!['cash', 'bank-transfer', 'cheque', 'mobile-banking', 'others'].includes(formData.paymentMethod)) {
              newErrors.paymentMethod = 'পেমেন্ট মেথড অবৈধ';
            }
            // Only validate amount if payment method is selected
            if (formData.paymentMethod) {
              if (!formData.paymentDetails.amount) {
                newErrors.amount = 'পরিমাণ লিখুন';
              } else if (isNaN(parseFloat(formData.paymentDetails.amount)) || parseFloat(formData.paymentDetails.amount) <= 0) {
                newErrors.amount = 'পরিমাণ ০ এর চেয়ে বেশি হতে হবে';
              }
              // For non-agent credit transactions, destination account can fallback to business account
              // If there is no business/account fallback available, require destination account explicitly
              const hasAnyAccount = Array.isArray(accounts) && accounts.length > 0;
              if (!hasAnyAccount && !formData.destinationAccount.id) {
                newErrors.destinationAccount = 'ডেস্টিনেশন একাউন্ট নির্বাচন করুন (কোন ডিফল্ট একাউন্ট নেই)';
              }
            }
          }
          break;
        case 6:
          // Final confirmation step for all credit transactions (no validation needed)
          break;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const nextStep = () => {
    if (validateStep(currentStep)) {
      let maxSteps;
      if (formData.transactionType === 'transfer') {
        maxSteps = 5;
      } else if (formData.transactionType === 'debit') {
        maxSteps = 5;
      } else {
        // Credit flow: for agents/hajji/umrah, 6 steps (balance info, payment method, confirmation)
        maxSteps = (formData.customerType === 'agent' || formData.customerType === 'haji' || formData.customerType === 'umrah') ? 6 : 6;
      }
      
      // For credit non-agent/hajji/umrah, skip step 4 (invoice selection) and go directly to step 5 (payment method) from step 3
      if (formData.transactionType === 'credit' && formData.customerType !== 'agent' && formData.customerType !== 'haji' && formData.customerType !== 'umrah' && currentStep === 3) {
        setCurrentStep(5); // Skip step 4, go directly to payment method
      } else if (formData.transactionType === 'credit' && (formData.customerType === 'agent' || formData.customerType === 'haji' || formData.customerType === 'umrah') && currentStep === 4) {
        setCurrentStep(5); // Go to payment method from balance display
      } else if (formData.transactionType === 'credit' && (formData.customerType === 'agent' || formData.customerType === 'haji' || formData.customerType === 'umrah') && currentStep === 5) {
        setCurrentStep(6); // Go to confirmation from payment method
      } else if (formData.transactionType === 'debit' && currentStep === 4) {
        // For debit, go directly to step 5 (confirmation) from step 4
        setCurrentStep(5);
      } else {
        setCurrentStep(prev => Math.min(prev + 1, maxSteps));
      }
    }
  };

  const prevStep = () => {
    // For credit non-agent/hajji/umrah, skip step 4 (invoice selection) and go back to step 3 (customer selection) from step 5
    if (formData.transactionType === 'credit' && formData.customerType !== 'agent' && formData.customerType !== 'haji' && formData.customerType !== 'umrah' && currentStep === 5) {
      setCurrentStep(3); // Skip step 4, go back to customer selection
    } else if (formData.transactionType === 'credit' && (formData.customerType === 'agent' || formData.customerType === 'haji' || formData.customerType === 'umrah') && currentStep === 6) {
      setCurrentStep(5); // Go back from confirmation to payment method
    } else if (formData.transactionType === 'credit' && (formData.customerType === 'agent' || formData.customerType === 'haji' || formData.customerType === 'umrah') && currentStep === 5) {
      setCurrentStep(4); // Go back from payment method to balance display
    } else if (formData.transactionType === 'debit' && currentStep === 5) {
      // For debit, go back from step 5 to step 4
      setCurrentStep(4);
    } else {
      setCurrentStep(prev => Math.max(prev - 1, 1));
    }
  };

  const goToStep = (step) => {
    if (step < currentStep || validateStep(currentStep)) {
      setCurrentStep(step);
    }
  };

  const handleSubmit = () => {
    console.log('TXN Save clicked', {
      currentStep,
      transactionType: formData.transactionType,
      customerType: formData.customerType,
      customerId: formData.customerId,
      paymentMethod: formData.paymentMethod,
      amount: formData?.paymentDetails?.amount,
    });
    const finalStep = formData.transactionType === 'credit' && (formData.customerType === 'agent' || formData.customerType === 'haji' || formData.customerType === 'umrah') ? 7 : 6;
    const isValid = validateStep(finalStep);
    if (!isValid) {
      console.warn('TXN validation failed at final step', { finalStep, errors });
      return;
    }

    // Handle account-to-account transfer
    if (formData.transactionType === 'transfer') {
      const transferAmount = parseFloat(formData.transferAmount);
      if (!transferAmount || transferAmount <= 0) {
        setErrors(prev => ({ ...prev, transferAmount: 'পরিমাণ ০ এর চেয়ে বেশি হতে হবে' }));
        return;
      }

      // Validate debit account has sufficient balance
      if (transferAmount > formData.debitAccount.balance) {
        setErrors(prev => ({ ...prev, transferAmount: 'পরিমাণ একাউন্ট ব্যালেন্সের চেয়ে বেশি হতে পারে না' }));
        return;
      }
      
      // Call new backend transfer API using the dedicated transfer hook
      // Calculate charge with correct sign for transfer (negative)
      const rawCharge = parseFloat(formData.transferCharge || 0);
      const transferCharge = rawCharge > 0 ? -rawCharge : 0; // Transfer charge is negative

      const transferPayload = {
        transactionType: 'transfer',
        serviceCategory: 'Account Transfer',
        fromAccountId: formData.debitAccount.id,
        toAccountId: formData.creditAccount.id,
        amount: transferAmount,
        charge: transferCharge || null,
        reference: formData.transferReference || `TXN-${Date.now()}`,
        notes: formData.transferNotes || `Transfer from ${formData.debitAccount.bankName} (${formData.debitAccount.accountNumber}) to ${formData.creditAccount.bankName} (${formData.creditAccount.accountNumber})`,
        createdBy: userProfile?.email || 'unknown_user',
        branchId: userProfile?.branchId || 'main_branch',
        accountManager: formData.accountManager || null
      };

      // Use the dedicated bank account transfer mutation
      bankAccountTransferMutation.mutate(transferPayload, {
        onSuccess: (response) => {
          console.log('Transfer completed:', response);

          const txId = response?.transaction?.transactionId || response?.transaction?._id || response?.transactionId || 'N/A';
          
          // Show success message
          Swal.fire({
            title: 'সফল!',
            text: `ট্রান্সফার সফলভাবে সম্পন্ন হয়েছে (ID: ${txId})`,
            icon: 'success',
            confirmButtonText: 'ঠিক আছে',
            confirmButtonColor: '#10B981',
            background: isDark ? '#1F2937' : '#F9FAFB'
          });

          // Save submission summary for post-submission page
          setSubmittedTransaction({
            mode: 'transfer',
            transactionId:
              response?.transactionId ||
              response?.data?.transactionId ||
              response?.id ||
              null,
            transactionType: 'transfer',
            amount: transferAmount,
            date: new Date().toISOString().split('T')[0],
            customerId: null,
            customerName: null,
            customerPhone: null,
            customerEmail: null,
            category: formData.category || null,
            paymentMethod: 'bank-transfer',
            paymentDetails: {
              reference: transferPayload.reference,
              notes: transferPayload.notes,
              charge: transferCharge || ''
            },
            notes: formData.transferNotes || '',
            fromAccount: formData.debitAccount,
            toAccount: formData.creditAccount,
            // Also add as debitAccount and creditAccount for consistency
            debitAccount: formData.debitAccount,
            creditAccount: formData.creditAccount,
            accountManager: formData.accountManager || null
          });

          // Reset form after successful submission
          resetForm();
        },
        onError: (error) => {
          console.error('Transfer failed:', error);
          const backendError = error?.response?.data || error?.response;
          const message = backendError?.message || backendError?.error || error?.message || 'ট্রান্সফার করতে সমস্যা হয়েছে।';
          
          Swal.fire({
            title: 'ত্রুটি!',
            text: message,
            icon: 'error',
            confirmButtonText: 'ঠিক আছে',
            confirmButtonColor: '#EF4444',
            background: isDark ? '#1F2937' : '#FEF2F2'
          });
        }
      });

      return;
    }

    // Personal Expense (debit-only) short-circuit
    if (formData.transactionType === 'debit' && selectedSearchType === 'personal') {
      const amountNum = parseFloat(formData?.paymentDetails?.amount || '0');
      if (!(amountNum > 0)) {
        setErrors(prev => ({ ...prev, amount: 'পরিমাণ ০ এর চেয়ে বেশি হতে হবে' }));
        return;
      }

      // Ensure a source account is selected so bank balance can be updated
      if (!formData?.sourceAccount?.id) {
        setErrors(prev => ({ ...prev, sourceAccount: 'সোর্স একাউন্ট নির্বাচন করুন' }));
        Swal.fire({
          title: 'ত্রুটি!',
          text: 'সোর্স একাউন্ট নির্বাচন করুন',
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
          background: isDark ? '#1F2937' : '#FEF2F2'
        });
        return;
      }

      if (!formData.personalExpenseProfileId) {
        setErrors(prev => ({ ...prev, customerId: 'ব্যক্তিগত প্রোফাইল নির্বাচন করুন' }));
        return;
      }

      const payload = {
        date: formData.date,
        amount: amountNum,
        personalExpenseProfileId: formData.personalExpenseProfileId,
        description: formData.notes || formData.customerName || 'Personal Expense',
        tags: [],
      };

      createPersonalExpenseTxV2.mutate(payload, {
        onSuccess: (transactionData) => {
          // Also create a bank account transaction to update balance
          const description = `Personal Expense - ${formData.customerName || 'N/A'}`;
          const reference = formData.paymentDetails?.reference || `PE-${Date.now()}`;
          
          // Note: Category invalidation is handled in the mutation's onSuccess callback
          // The category totalAmount should be updated by the backend
          createBankAccountTransactionMutation.mutate(
            {
              id: formData.sourceAccount.id,
              transactionType: 'debit',
              amount: amountNum,
              // Include description for bank account transaction
              category: formData.category || undefined,
              // Also embed under paymentDetails for broader compatibility with list renderers
              paymentDetails: { ...(formData.paymentDetails || {}), category: formData.category || undefined },
              description,
              reference,
              createdBy: userProfile?.email || 'unknown_user',
              branchId: userProfile?.branchId || 'main_branch',
              notes: formData.notes || ''
            },
            {
              onSuccess: () => {
                // Save submission summary for post-submission page
                setSubmittedTransaction({
                  mode: 'personal',
                  transactionId: reference,
                  transactionType: 'debit',
                  amount: amountNum,
                  date: formData.date,
                  customerId: null,
                  customerName: null,
                  customerPhone: null,
                  customerEmail: null,
                  category: formData.category || null,
                  paymentMethod: formData.paymentMethod || 'cash',
                  paymentDetails: {
                    ...formData.paymentDetails,
                    reference
                  },
                  notes: formData.notes || '',
                  fromAccount: formData.sourceAccount || null,
                  toAccount: null,
                  accountManager: formData.accountManager || null
                });

                resetForm();
              },
              onError: (error) => {
                const message = error?.response?.data?.error || error?.message || 'ব্যাংক ব্যালেন্স আপডেট করতে সমস্যা হয়েছে।';
                Swal.fire({
                  title: 'সতর্কতা!',
                  text: `ব্যয় সংরক্ষিত হয়েছে, কিন্তু ব্যাংক আপডেট হয়নি: ${message}`,
                  icon: 'warning',
                  confirmButtonText: 'ঠিক আছে',
                  confirmButtonColor: '#F59E0B',
                  background: isDark ? '#1F2937' : '#FEF2F2'
                });
                resetForm();
              }
            }
          );
        },
        onError: (error) => {
          const message = error?.response?.data?.message || error?.message || 'ট্রানজেকশন সংরক্ষণ করতে সমস্যা হয়েছে।';
          Swal.fire({
            title: 'ত্রুটি!',
            text: message,
            icon: 'error',
            confirmButtonText: 'ঠিক আছে',
            confirmButtonColor: '#EF4444',
            background: isDark ? '#1F2937' : '#FEF2F2'
          });
        }
      });

      return;
    }

    // Handle regular transactions (credit/debit)
    // Basic final guards for credit/debit
    if (!formData.customerId) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'কাস্টমার নির্বাচন করুন',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
        background: isDark ? '#1F2937' : '#FEF2F2'
      });
      console.warn('TXN blocked: no customerId');
      return;
    }

    if (!formData.paymentMethod) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'পেমেন্ট মেথড নির্বাচন করুন',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
        background: isDark ? '#1F2937' : '#FEF2F2'
      });
      console.warn('TXN blocked: no paymentMethod');
      return;
    }

    const amount = parseFloat(formData.paymentDetails.amount);
    if (!amount || amount <= 0) {
      setErrors(prev => ({ ...prev, amount: 'পরিমাণ ০ এর চেয়ে বেশি হতে হবে' }));
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'পরিমাণ ০ এর চেয়ে বেশি হতে হবে',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
        background: isDark ? '#1F2937' : '#FEF2F2'
      });
      console.warn('TXN blocked: invalid amount', { amountRaw: formData.paymentDetails.amount });
      return;
    }

    // Map customerType to partyType for backend compatibility
    const mapPartyType = (customerType) => {
      if (customerType === 'vendor') return 'vendor';
      if (customerType === 'agent') return 'agent';
      if (customerType === 'haji') return 'haji';
      if (customerType === 'umrah') return 'umrah';
      if (customerType === 'loan') return 'loan';
      if (customerType === 'airCustomer') return 'customer';
      if (customerType === 'money-exchange' || customerType === 'moneyExchange') return 'money-exchange';
      if (customerType === 'investment') return 'investment';
      return 'customer';
    };

    // Choose account based on transaction type
    const isDebit = formData.transactionType === 'debit';
    const isCredit = formData.transactionType === 'credit';
    const isAgent = formData.customerType === 'agent';
    // Fallback when nothing is selected
    const businessFallback = accounts.find(a => a.type === 'business') || accounts[0];
    // For credit: use the selected company account input (sourceAccount) as the receiving/target account.
    // If not selected, try destinationAccount (agent flow), else fallback.
    const selectedAccount = isDebit
      ? formData.sourceAccount
      : (isCredit
          ? (formData.sourceAccount?.id
              ? formData.sourceAccount
              : (formData.destinationAccount?.id ? formData.destinationAccount : businessFallback))
          : undefined);

    // Validate required account selection for credit/debit
    if (isDebit && !selectedAccount?.id) {
      const msg = isDebit ? 'সোর্স একাউন্ট নির্বাচন করুন' : 'ডেস্টিনেশন একাউন্ট নির্বাচন করুন';
      setErrors(prev => ({
        ...prev,
        [isDebit ? 'sourceAccount' : 'destinationAccount']: msg
      }));
      Swal.fire({
        title: 'ত্রুটি!',
        text: msg,
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
        background: isDark ? '#1F2937' : '#FEF2F2'
      });
      return;
    }

    // Prepare transaction data for the unified createTransaction mutation
    const resolvedServiceCategory =
      // Prefer explicit serviceCategory if provided (e.g., 'hajj' | 'umrah')
      (formData.serviceCategory && String(formData.serviceCategory).trim()) ||
      // For agents, use selectedOption slug
      ((formData.customerType === 'agent' && formData.selectedOption) ? formData.selectedOption :
      // For haji/umrah customers, enforce slug
      (formData.customerType === 'haji' ? 'hajj' : (formData.customerType === 'umrah' ? 'umrah' :
      // For loans, map by transaction type
      (formData.customerType === 'loan' ? (isDebit ? 'loan-giving' : 'loan-repayment') : 
       formData.customerType === 'investment' ? 'investment' : formData.category))));

    // Resolve category with fallbacks based on customerType
    const resolvedCategory = 
      formData.category && formData.category.trim() 
        ? formData.category 
        : (formData.customerType === 'haji' ? 'হাজ্জ প্যাকেজ' :
           formData.customerType === 'umrah' ? 'ওমরাহ প্যাকেজ' :
           formData.customerType === 'miraj-employee' ? 'মিরাজ ইন্ডাস্ট্রিজ - কর্মচারী' :
           formData.customerType === 'miraj-income' ? 'মিরাজ ইন্ডাস্ট্রিজ - আয়' :
           formData.customerType === 'miraj-expense' ? 'মিরাজ ইন্ডাস্ট্রিজ - ব্যয়' :
           formData.customerType === 'office' && formData.operatingExpenseCategory 
             ? `অফিস ব্যয় - ${formData.operatingExpenseCategory.name || formData.operatingExpenseCategory.categoryName || ''}`
             : formData.customerType === 'money-exchange' ? 'মানি এক্সচেঞ্জ' :
           formData.customerType === 'investment' ? 'বিনিয়োগ' :
           formData.customerType === 'airCustomer' ? 'এয়ার টিকেট' :
           formData.customerType === 'vendor' ? 'ভেন্ডর' :
           formData.customerType === 'agent' ? 'এজেন্ট' :
           resolvedServiceCategory || '');

    // Prepare moneyExchangeInfo if this is a money-exchange transaction
    let moneyExchangeInfo = null;
    if ((formData.customerType === 'money-exchange' || formData.customerType === 'moneyExchange') && formData.moneyExchangeInfo) {
      const exchange = formData.moneyExchangeInfo;
      moneyExchangeInfo = {
        id: exchange.id || exchange._id || formData.customerId || null,
        fullName: exchange.fullName || exchange.currencyName || formData.customerName || null,
        mobileNumber: exchange.mobileNumber || exchange.mobile || formData.customerPhone || null,
        type: exchange.type || null,
        currencyCode: exchange.currencyCode || null,
        currencyName: exchange.currencyName || null,
        exchangeRate: exchange.exchangeRate || null,
        quantity: exchange.quantity || null,
        amount_bdt: exchange.amount_bdt || exchange.amount || amount || null
      };
    }

    // Prepare investmentInfo if this is an investment transaction
    let investmentInfo = null;
    if (formData.customerType === 'investment' && formData.investmentInfo) {
      const investment = formData.investmentInfo;
      investmentInfo = {
        id: investment.id || formData.customerId || null,
        name: investment.name || formData.customerName || null,
        category: investment.category || null,
        type: investment.type || null,
        amount: investment.amount || null
      };
    }

    // Determine operating expense category (support both ID and object)
    const operatingExpenseCategoryId = (formData.customerType === 'office' && isDebit && formData.operatingExpenseCategoryId) 
      ? String(formData.operatingExpenseCategoryId) 
      : undefined;
    const operatingExpenseCategory = (formData.customerType === 'office' && isDebit && formData.operatingExpenseCategory) 
      ? formData.operatingExpenseCategory 
      : undefined;

    const unifiedTransactionData = {
      transactionType: formData.transactionType,
      // Add partyType and partyId for backend API compatibility
      partyType: mapPartyType(formData.customerType),
      partyId: formData.customerId ? String(formData.customerId) : undefined,
      // Keep customerId for backward compatibility
      customerId: formData.customerId ? String(formData.customerId) : undefined,
      // For haji/umrah: pass linked customerId to sync with customer profile
      // Backend will use this to update linked customer profile
      linkedCustomerId: (formData.customerType === 'haji' || formData.customerType === 'umrah') && formData.linkedCustomerId
        ? String(formData.linkedCustomerId)
        : undefined,
      // Add customerType for backend auto-detection
      customerType: formData.customerType || undefined,
      // Add targetAccountId for backend API (for credit/debit transactions)
      targetAccountId: selectedAccount?.id || null,
      // Only set debitAccount for debit transactions
      debitAccount: isDebit ? {
        id: formData.sourceAccount.id,
        name: formData.sourceAccount.name,
        bankName: formData.sourceAccount.bankName,
        accountNumber: formData.sourceAccount.accountNumber
      } : null,
      // Only set creditAccount for credit transactions (use selectedAccount for consistency)
      creditAccount: isCredit && selectedAccount?.id ? {
        id: selectedAccount.id,
        name: selectedAccount.name || selectedAccount.accountName,
        bankName: selectedAccount.bankName,
        accountNumber: selectedAccount.accountNumber
      } : null,
      paymentDetails: {
        amount: amount,
        bankName: formData.paymentDetails.bankName || null,
        accountNumber: formData.paymentDetails.accountNumber || null,
        chequeNumber: formData.paymentDetails.chequeNumber || null,
        mobileProvider: formData.paymentDetails.mobileProvider || null,
        transactionId: formData.paymentDetails.transactionId || null,
        reference: formData.paymentDetails.reference || null,
        charge: getChargeWithSign() || null
      },
      serviceCategory: resolvedServiceCategory,
      category: resolvedCategory,
      // subCategory can be extracted from category if it's a subcategory ID
      // (Currently, subcategories are stored in formData.category, so we'll let backend handle it)
      paymentMethod: formData.paymentMethod,
      customerBankAccount: {
        bankName: formData.customerBankAccount.bankName || null,
        accountNumber: formData.customerBankAccount.accountNumber || null
      },
      // Provide display fields so list can show name for Haji/Umrah too
      customerName: formData.customerName || undefined,
      customerPhone: formData.customerPhone || undefined,
      customerEmail: formData.customerEmail || undefined,
      customerAddress: formData.customerAddress || undefined,
      // Some backends use partyName for generic parties
      partyName: formData.customerName || undefined,
      // Pass meta to backend for better categorization (agent: hajj/umrah/others)
      meta: formData.selectedOption ? { 
        selectedOption: formData.selectedOption,
        packageId: formData.selectedPackageId || undefined
      } : undefined,
      notes: formData.notes || null,
      invoiceId: formData.invoiceId || null,
      accountManagerId: formData.accountManager?.id || null,
      date: new Date().toISOString().split('T')[0],
      createdBy: userProfile?.email || 'unknown_user',
      branchId: userProfile?.branchId || 'main_branch',
      employeeReference: formData.employeeReference?.id ? formData.employeeReference : null,
      // Charge with correct sign (Credit: negative, Debit: positive, Transfer: negative)
      charge: getChargeWithSign() || null,
      // Loan info for loan transactions
      loanInfo: formData.customerType === 'loan' && formData.loanInfo ? {
        id: formData.loanInfo.id || formData.customerId || null,
        name: formData.loanInfo.name || formData.customerName || null,
        direction: formData.loanInfo.direction || null,
        customerId: formData.loanInfo.customerId || null,
        customerPhone: formData.loanInfo.customerPhone || formData.customerPhone || null,
        customerEmail: formData.loanInfo.customerEmail || formData.customerEmail || null
      } : null,
      // Include operating expense category (support both ID and object)
      operatingExpenseCategoryId: operatingExpenseCategoryId,
      operatingExpenseCategory: operatingExpenseCategory,
      // Money exchange information (for money-exchange party type)
      moneyExchangeInfo: moneyExchangeInfo,
      // Investment information (for investment party type)
      investmentInfo: investmentInfo
    };

    // Log the data being sent for debugging
    console.log('Submitting credit/debit transaction payload:', unifiedTransactionData);
    console.log('Agent Transaction Debug Info:', {
      customerType: formData.customerType,
      partyType: unifiedTransactionData.partyType,
      partyId: unifiedTransactionData.partyId,
      transactionType: unifiedTransactionData.transactionType,
      serviceCategory: unifiedTransactionData.serviceCategory,
      selectedOption: formData.selectedOption,
      amount: amount,
      meta: unifiedTransactionData.meta
    });

    // Capture accountManager before form reset (important for PDF generation)
    // Extract name properly from formData.accountManager
    let capturedAccountManager = null;
    if (formData.accountManager) {
      let managerName = '';
      
      // Extract name from multiple possible fields
      if (typeof formData.accountManager === 'string') {
        managerName = formData.accountManager.trim();
      } else if (typeof formData.accountManager === 'object') {
        const name1 = formData.accountManager.name?.trim();
        const name2 = formData.accountManager.fullName?.trim();
        const name3 = formData.accountManager.employeeName?.trim();
        const name4 = formData.accountManager.userName?.trim();
        const name5 = formData.accountManager.displayName?.trim();
        
        managerName = name1 || name2 || name3 || name4 || name5 || '';
        
        // If still no name, try firstName + lastName
        if (!managerName) {
          const firstName = formData.accountManager.firstName?.trim() || '';
          const lastName = formData.accountManager.lastName?.trim() || '';
          const combinedName = `${firstName} ${lastName}`.trim();
          if (combinedName) managerName = combinedName;
        }
      }
      
      // Only capture if we have at least an ID or name
      const managerId = formData.accountManager.id || formData.accountManager._id || '';
      if (managerId || managerName) {
        capturedAccountManager = {
          id: managerId,
          name: managerName,
          phone: formData.accountManager.phone?.trim() || '',
          email: formData.accountManager.email?.trim() || ''
        };
      }
    }
    
    console.log('Captured Account Manager before submit:', {
      formDataAccountManager: formData.accountManager,
      capturedAccountManager: capturedAccountManager
    });
    
    createTransactionMutation.mutate(unifiedTransactionData, {
      onSuccess: async (response) => {
        console.log('Transaction response:', response);
        
        const txId =
          response?.transaction?.transactionId ||
          response?.transaction?._id ||
          response?.data?.transaction?.transactionId ||
          response?.data?.transaction?._id ||
          response?.data?.transactionId ||
          response?.transactionId;
        if (!txId) {
          console.error('No transaction ID found in response');
          Swal.fire({
            title: 'সতর্কতা!',
            text: 'লেনদেন তৈরি হয়েছে কিন্তু Transaction ID পাওয়া যায়নি',
            icon: 'warning',
            confirmButtonText: 'ঠিক আছে',
            confirmButtonColor: '#F59E0B',
            background: isDark ? '#1F2937' : '#FEF2F2'
          });
          resetForm();
          return;
        }

        // Show success message
        Swal.fire({
          title: 'সফল!',
          text: `লেনদেন সফলভাবে সংরক্ষিত হয়েছে (ID: ${txId})`,
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
          background: isDark ? '#1F2937' : '#F9FAFB'
        });

        // Complete the transaction atomically on backend (idempotent)
        // This will update accounts, parties (agent/customer/vendor), and invoices
        completeTransactionMutation.mutate(txId, {
          onSuccess: async (completeData) => {
            console.log('Transaction completed successfully:', completeData);
            
            // Query invalidation removed - queries are not used

            // Notify customer via SMS (best-effort)
            await sendTransactionSms({
              phone: unifiedTransactionData.customerPhone || formData.customerPhone,
              amount,
              transactionId: txId
            });

            // Extract accountManager from backend response if available, otherwise use captured one
            const responseAccountManager = completeData?.transaction?.accountManager 
              || completeData?.accountManager
              || response?.transaction?.accountManager
              || response?.accountManager;
            
            // Use response accountManager if available, otherwise use captured one
            const finalAccountManager = responseAccountManager || capturedAccountManager;

            // Save submission summary for post-submission page
            setSubmittedTransaction({
              mode: 'transaction',
              transactionId: txId,
              transactionType: unifiedTransactionData.transactionType,
              amount,
              date: unifiedTransactionData.date,
              customerId: unifiedTransactionData.customerId,
              customerName: unifiedTransactionData.customerName,
              customerPhone: unifiedTransactionData.customerPhone,
              customerEmail: unifiedTransactionData.customerEmail,
              customerAddress: unifiedTransactionData.customerAddress || formData.customerAddress || '',
              category: unifiedTransactionData.category,
              paymentMethod: unifiedTransactionData.paymentMethod,
              paymentDetails: unifiedTransactionData.paymentDetails,
              notes: unifiedTransactionData.notes,
              fromAccount: unifiedTransactionData.debitAccount,
              toAccount: unifiedTransactionData.creditAccount,
              accountManager: finalAccountManager
            });
            
            console.log('Submitted Transaction Account Manager:', {
              capturedAccountManager,
              responseAccountManager,
              finalAccountManager
            });
          },
          onError: (error) => {
            console.error('Transaction completion failed:', error);
            console.error('Full error object:', JSON.stringify(error, null, 2));
            
            // Extract error message from backend
            let errorMessage = 'লেনদেন তৈরি হয়েছে কিন্তু সম্পূর্ণ করতে সমস্যা হয়েছে।';
            const backendError = error?.response?.data;
            const errorStatus = error?.response?.status;
            
            // Check for specific backend errors - prioritize backend response
            if (backendError?.message) {
              errorMessage = backendError.message;
            } else if (backendError?.error) {
              errorMessage = backendError.error;
            } else if (error?.message) {
              errorMessage = error.message;
            }
            
            // Check if it's a ReferenceError about employees (check both backend response and error message)
            const isEmployeesError = 
              errorMessage.includes('employees is not defined') ||
              backendError?.message?.includes('employees is not defined') ||
              backendError?.error?.includes('employees is not defined') ||
              backendError?.details?.includes('employees is not defined') ||
              error?.message?.includes('employees is not defined');
            
            if (isEmployeesError) {
              errorMessage = '❌ Backend Error: employees collection is not defined\n\n';
              errorMessage += 'সমস্যা: Backend-এ এখনো কোথাও `employees` collection reference আছে।\n\n';
              errorMessage += 'সমাধান: Backend code-এ নিম্নলিখিত endpoints check করুন:\n';
              errorMessage += '1. POST /api/transactions (transaction create)\n';
              errorMessage += '2. POST /api/transactions/:id/complete (transaction complete)\n';
              errorMessage += '3. DELETE /api/transactions/:id (transaction delete)\n\n';
              errorMessage += 'সব `employees` collection reference `farmEmployees` দিয়ে replace করুন।';
            }
            
            // Add details if available
            if (backendError?.details) {
              if (typeof backendError.details === 'string') {
                errorMessage += `\n\n📋 বিস্তারিত:\n${backendError.details}`;
              } else if (Array.isArray(backendError.details)) {
                errorMessage += `\n\n📋 বিস্তারিত:\n${backendError.details.join('\n')}`;
              } else if (typeof backendError.details === 'object') {
                errorMessage += `\n\n📋 বিস্তারিত:\n${JSON.stringify(backendError.details, null, 2)}`;
              }
            }
            
            // Add stack trace if available (for debugging)
            if (backendError?.stack) {
              errorMessage += `\n\n🔍 Stack Trace:\n${backendError.stack}`;
            }
            
            // Add status code info
            if (errorStatus) {
              errorMessage += `\n\nStatus Code: ${errorStatus}`;
            }
            
            Swal.fire({
              title: isEmployeesError ? '❌ Backend Configuration Error' : 'সতর্কতা!',
              html: `<div style="text-align: left; white-space: pre-wrap; font-family: monospace; font-size: 12px;">${errorMessage}</div>`,
              icon: isEmployeesError ? 'error' : 'warning',
              confirmButtonText: 'ঠিক আছে',
              confirmButtonColor: isEmployeesError ? '#EF4444' : '#F59E0B',
              background: isDark ? '#1F2937' : '#FEF2F2',
              width: '700px'
            });
            
            // Query invalidation removed - queries are not used
          }
        });

        // Reset form after successful submission (summary is kept in submittedTransaction state)
        resetForm();
      },
      onError: (error) => {
        console.error('Create transaction failed:', error);
        console.error('Full error object:', JSON.stringify(error, null, 2));
        
        const backendError = error?.response?.data || error?.response;
        const errorStatus = error?.response?.status || 500;
        let message = backendError?.message || backendError?.error || error?.message || 'লেনদেন তৈরি করতে সমস্যা হয়েছে।';
        
        // Check if it's a ReferenceError about employees
        const isEmployeesError = 
          message.includes('employees is not defined') ||
          backendError?.message?.includes('employees is not defined') ||
          backendError?.error?.includes('employees is not defined') ||
          backendError?.details?.includes('employees is not defined');
        
        if (isEmployeesError) {
          message = '❌ Backend Error: employees collection is not defined\n\n';
          message += 'সমস্যা: Backend-এ এখনো কোথাও `employees` collection reference আছে।\n\n';
          message += 'সমাধান: Backend code-এ নিম্নলিখিত endpoints check করুন:\n';
          message += '1. POST /api/transactions (transaction create)\n';
          message += '2. POST /api/transactions/:id/complete (transaction complete)\n';
          message += '3. DELETE /api/transactions/:id (transaction delete)\n\n';
          message += 'সব `employees` collection reference `farmEmployees` দিয়ে replace করুন।';
          
          if (backendError?.details) {
            if (typeof backendError.details === 'string') {
              message += `\n\n📋 বিস্তারিত:\n${backendError.details}`;
            } else if (typeof backendError.details === 'object') {
              message += `\n\n📋 বিস্তারিত:\n${JSON.stringify(backendError.details, null, 2)}`;
            }
          }
          
          if (backendError?.stack) {
            message += `\n\n🔍 Stack Trace:\n${backendError.stack}`;
          }
          
          if (errorStatus) {
            message += `\n\nStatus Code: ${errorStatus}`;
          }
        } else if (backendError?.details) {
          if (typeof backendError.details === 'string') {
            message += `\n\nবিস্তারিত: ${backendError.details}`;
          } else if (Array.isArray(backendError.details)) {
            message += `\n\nবিস্তারিত: ${backendError.details.join(', ')}`;
          }
        }
        
        Swal.fire({
          title: isEmployeesError ? '❌ Backend Configuration Error' : 'ত্রুটি!',
          html: isEmployeesError ? `<div style="text-align: left; white-space: pre-wrap; font-family: monospace; font-size: 12px;">${message}</div>` : message,
          icon: 'error',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#EF4444',
          background: isDark ? '#1F2937' : '#FEF2F2'
        });
      },
      onSettled: () => {
        console.log('Create transaction settled');
      }
    });
  };
  // Helper function to reset form
  const resetForm = () => {
    setFormData({
      transactionType: '',
      customerType: 'customer',
      customerId: '',
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      personalExpenseProfileId: '',
      customerBankAccount: {
        bankName: '',
        accountNumber: ''
      },
      category: '',
      operatingExpenseCategoryId: '',
      serviceCategory: '',
      selectedInvoice: null,
      invoiceId: '',
      paymentMethod: '',
      paymentDetails: {
        bankName: '',
        accountNumber: '',
        chequeNumber: '',
        mobileProvider: '',
        transactionId: '',
        amount: '',
        reference: '',
        charge: ''
      },
      sourceAccount: {
        id: '',
        name: '',
        bankName: '',
        accountNumber: '',
        balance: 0
      },
      destinationAccount: {
        id: '',
        name: '',
        bankName: '',
        accountNumber: '',
        balance: 0
      },
      debitAccount: {
        id: '',
        name: '',
        bankName: '',
        accountNumber: '',
        balance: 0
      },
      creditAccount: {
        id: '',
        name: '',
        bankName: '',
        accountNumber: '',
        balance: 0
      },
      transferAmount: '',
      transferCharge: '',
      transferReference: '',
      transferNotes: '',
      notes: '',
      date: new Date().toISOString().split('T')[0],
      employeeReference: {
        id: '',
        name: '',
        employeeId: '',
        position: '',
        department: ''
      },
      loanInfo: {
        id: '',
        name: '',
        direction: ''
      },
      moneyExchangeInfo: null
    });
    setCurrentStep(1);
    setSearchTerm('');
    setSelectedSearchType('airCustomer');
    setDebitAccountSearchTerm('');
    setCreditAccountSearchTerm('');
  };

  const generatePDF = async () => {
    try {
      // Show loading alert
      Swal.fire({
        title: 'PDF তৈরি হচ্ছে...',
        text: 'রিসিট ডাউনলোড হচ্ছে',
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        background: isDark ? '#1F2937' : '#F9FAFB'
      });

      // Prepare transaction data for PDF
      const pdfData = {
        transactionId: `TXN-${Date.now()}`,
        transactionType: formData.transactionType,
        customerId: formData.customerId,
        uniqueId: formData.uniqueId,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail,
        customerAddress: formData.customerAddress,
        category: formData.category,
        paymentMethod: formData.paymentMethod,
        paymentDetails: formData.paymentDetails,
        notes: formData.notes,
        date: formData.date,
        createdBy: userProfile?.email || 'unknown_user',
        branchId: userProfile?.branchId || 'main_branch'
      };

      // Try to generate PDF with HTML rendering first
      let result = await generateSalmaReceiptPDF(pdfData, isDark);
      
      // If HTML rendering fails, fallback to simple PDF
      if (!result.success) {
        console.log('HTML PDF generation failed, trying simple PDF...');
        result = generateSalmaReceiptPDF (pdfData);
      }

      // Close loading alert
      Swal.close();

      if (result.success) {
        Swal.fire({
          title: 'সফল!',
          text: `PDF সফলভাবে ডাউনলোড হয়েছে: ${result.filename}`,
          icon: 'success',
          confirmButtonText: 'ঠিক আছে',
          confirmButtonColor: '#10B981',
          background: isDark ? '#1F2937' : '#F9FAFB',
          customClass: {
            title: 'text-green-600 font-bold text-xl',
            popup: 'rounded-2xl shadow-2xl'
          }
        });
      } else {
        throw new Error(result.error || 'PDF generation failed');
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      Swal.close();
      
      Swal.fire({
        title: 'ত্রুটি!',
        text: `PDF তৈরি করতে সমস্যা হয়েছে: ${error.message}`,
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#EF4444',
        background: isDark ? '#1F2937' : '#FEF2F2',
        customClass: {
          title: 'text-red-600 font-bold text-xl',
          popup: 'rounded-2xl shadow-2xl'
        }
      });
    }
  };

  // Post-submission helpers
  const handleNewTransaction = () => {
    setSubmittedTransaction(null);
    resetForm();
  };

  const handleDownloadReceipt = async (language = 'bn', showHeader = true) => {
  if (!submittedTransaction) return;

  try {
    // Show loading alert
    Swal.fire({
      title: language === 'en' ? 'Generating PDF...' : 'PDF তৈরি হচ্ছে...',
      text: language === 'en' ? 'Receipt is being prepared' : 'রিসিট তৈরি হচ্ছে',
      icon: 'info',
      showConfirmButton: false,
      allowOutsideClick: false,
      background: isDark ? '#1F2937' : '#F9FAFB'
    });

    // Prepare PDF data with selected language
    // Extract accountManager name - comprehensive extraction from all possible locations
    let accountManagerName = '';
    
    // Priority 1: Direct accountManager object with name
    if (submittedTransaction.accountManager) {
      if (typeof submittedTransaction.accountManager === 'string') {
        const nameStr = submittedTransaction.accountManager.trim();
        if (nameStr) accountManagerName = nameStr;
      } else if (typeof submittedTransaction.accountManager === 'object') {
        // Try all possible name fields, but skip empty strings
        const name1 = submittedTransaction.accountManager.name?.trim();
        const name2 = submittedTransaction.accountManager.fullName?.trim();
        const name3 = submittedTransaction.accountManager.accountManagerName?.trim();
        const name4 = submittedTransaction.accountManager.employeeName?.trim();
        const name5 = submittedTransaction.accountManager.userName?.trim();
        const name6 = submittedTransaction.accountManager.displayName?.trim();
        
        accountManagerName = name1 || name2 || name3 || name4 || name5 || name6 || '';
        
        // If still no name, try firstName + lastName
        if (!accountManagerName) {
          const firstName = submittedTransaction.accountManager.firstName?.trim() || '';
          const lastName = submittedTransaction.accountManager.lastName?.trim() || '';
          const combinedName = `${firstName} ${lastName}`.trim();
          if (combinedName) accountManagerName = combinedName;
        }
      }
    }
    
    // Priority 2: Top-level accountManagerName field
    if (!accountManagerName && submittedTransaction.accountManagerName) {
      accountManagerName = submittedTransaction.accountManagerName;
    }
    
    // Priority 3: Check formData if submittedTransaction doesn't have it (fallback)
    if (!accountManagerName && formData.accountManager) {
      if (typeof formData.accountManager === 'string') {
        const nameStr = formData.accountManager.trim();
        if (nameStr) accountManagerName = nameStr;
      } else if (typeof formData.accountManager === 'object') {
        // Check all possible name fields, but skip empty strings
        const name1 = formData.accountManager.name?.trim();
        const name2 = formData.accountManager.fullName?.trim();
        const name3 = formData.accountManager.accountManagerName?.trim();
        const name4 = formData.accountManager.employeeName?.trim();
        const name5 = formData.accountManager.userName?.trim();
        const name6 = formData.accountManager.displayName?.trim();
        
        accountManagerName = name1 || name2 || name3 || name4 || name5 || name6 || '';
        
        // If still no name, try firstName + lastName
        if (!accountManagerName) {
          const firstName = formData.accountManager.firstName?.trim() || '';
          const lastName = formData.accountManager.lastName?.trim() || '';
          const combinedName = `${firstName} ${lastName}`.trim();
          if (combinedName) accountManagerName = combinedName;
        }
      }
    }
    
    // Clean up - remove any whitespace
    accountManagerName = accountManagerName ? accountManagerName.trim() : '';
    
    console.log('PDF Data - Account Manager Debug:', {
      submittedTransactionAccountManager: submittedTransaction.accountManager,
      submittedTransactionAccountManagerType: typeof submittedTransaction.accountManager,
      formDataAccountManager: formData.accountManager,
      formDataAccountManagerType: typeof formData.accountManager,
      extractedAccountManagerName: accountManagerName,
      accountManagerNameLength: accountManagerName?.length,
      allAccountManagerKeys: submittedTransaction.accountManager && typeof submittedTransaction.accountManager === 'object' 
        ? Object.keys(submittedTransaction.accountManager) 
        : []
    });
    
    // Extract address from multiple possible sources
    let extractedAddress = '';
    
    // Priority 1: Top-level customerAddress
    if (submittedTransaction.customerAddress && typeof submittedTransaction.customerAddress === 'string') {
      const addr = submittedTransaction.customerAddress.trim();
      if (addr && addr !== '[Full Address]') extractedAddress = addr;
    }
    
    // Priority 2: Customer object
    if (!extractedAddress && submittedTransaction.customer && typeof submittedTransaction.customer === 'object') {
      const customerAddr = submittedTransaction.customer.address ||
                          submittedTransaction.customer.fullAddress ||
                          submittedTransaction.customer.customerAddress ||
                          submittedTransaction.customer.location;
      if (customerAddr && typeof customerAddr === 'string') {
        const addr = customerAddr.trim();
        if (addr && addr !== '[Full Address]') extractedAddress = addr;
      }
    }
    
    // Priority 3: Party object
    if (!extractedAddress && submittedTransaction.party && typeof submittedTransaction.party === 'object') {
      const partyAddr = submittedTransaction.party.address ||
                        submittedTransaction.party.fullAddress ||
                        submittedTransaction.party.location;
      if (partyAddr && typeof partyAddr === 'string') {
        const addr = partyAddr.trim();
        if (addr && addr !== '[Full Address]') extractedAddress = addr;
      }
    }
    
    // Priority 4: FormData (for newly created transactions)
    if (!extractedAddress && formData.customerAddress && typeof formData.customerAddress === 'string') {
      const addr = formData.customerAddress.trim();
      if (addr && addr !== '[Full Address]') extractedAddress = addr;
    }
    
    // Check if this is a Bank Transfer transaction
    const isBankTransfer = submittedTransaction.transactionType === 'transfer' 
      || submittedTransaction.mode === 'transfer'
      || (submittedTransaction.fromAccount && submittedTransaction.toAccount)
      || (submittedTransaction.debitAccount && submittedTransaction.creditAccount);
    
    // Extract debit and credit account names for Bank Transfer
    let debitAccountName = '';
    let creditAccountName = '';
    
    if (isBankTransfer) {
      // Try multiple possible locations for account names
      debitAccountName = submittedTransaction.debitAccount?.name 
        || submittedTransaction.debitAccount?.accountName
        || submittedTransaction.fromAccount?.name
        || submittedTransaction.fromAccount?.accountName
        || '[Debit Account]';
      
      creditAccountName = submittedTransaction.creditAccount?.name
        || submittedTransaction.creditAccount?.accountName
        || submittedTransaction.toAccount?.name
        || submittedTransaction.toAccount?.accountName
        || '[Credit Account]';
    }
    
    const pdfData = {
      transactionId: submittedTransaction.transactionId || `TXN-${Date.now()}`,
      transactionType: submittedTransaction.transactionType,
      customerId: submittedTransaction.customerId,
      uniqueId: submittedTransaction.uniqueId,
      customerName: submittedTransaction.customerName || '',
      customerPhone: submittedTransaction.customerPhone || '',
      customerEmail: submittedTransaction.customerEmail || '',
      customerAddress: (extractedAddress && extractedAddress.trim() && extractedAddress !== '[Full Address]') ? extractedAddress.trim() : '[Full Address]',
      category: submittedTransaction.category || '',
      paymentMethod: submittedTransaction.paymentMethod || '',
      bankName: submittedTransaction.paymentDetails?.bankName || '',
      accountNumber: submittedTransaction.paymentDetails?.accountNumber || '',
      accountManagerName: accountManagerName || '',
      amount: submittedTransaction.amount || 0,
      notes: submittedTransaction.notes || '',
      date: submittedTransaction.date || new Date().toISOString().split('T')[0],
      createdBy: userProfile?.email || 'unknown_user',
      branchId: userProfile?.branchId || 'main_branch',
      language: language, // এটাই মূল — 'bn' অথবা 'en'
      // Bank Transfer specific fields
      isBankTransfer: isBankTransfer,
      debitAccountName: debitAccountName,
      creditAccountName: creditAccountName,
    };

    // Final validation - log if accountManagerName is missing
    if (!pdfData.accountManagerName && (submittedTransaction.accountManager || formData.accountManager)) {
      console.warn('⚠️ Account Manager selected but name not extracted!', {
        submittedTransactionAccountManager: submittedTransaction.accountManager,
        formDataAccountManager: formData.accountManager,
        pdfDataAccountManagerName: pdfData.accountManagerName
      });
    }

    // Generate PDF using the updated generator (supports bn/en and showHeader)
    const result = await generateSalmaReceiptPDF(pdfData, { language, showHeader });

    Swal.close();

    if (result.success) {
      Swal.fire({
        title: language === 'en' ? 'Success!' : 'সফল!',
        text: language === 'en' 
          ? `PDF downloaded successfully: ${result.filename}` 
          : `PDF সফলভাবে ডাউনলোড হয়েছে`,
        icon: 'success',
        confirmButtonText: language === 'en' ? 'OK' : 'ঠিক আছে',
        background: isDark ? '#1F2937' : '#F9FAFB'
      });
    } else {
      throw new Error(result.error || 'PDF generation failed');
    }
  } catch (error) {
    console.error('Receipt PDF download error:', error);
    Swal.close();
    Swal.fire({
      title: language === 'en' ? 'Error!' : 'ত্রুটি!',
      text: language === 'en' 
        ? 'There was a problem generating the PDF' 
        : 'PDF তৈরি করতে সমস্যা হয়েছে',
      icon: 'error',
      confirmButtonText: language === 'en' ? 'OK' : 'ঠিক আছে',
      background: isDark ? '#1F2937' : '#FEF2F2'
    });
  }
};

  const handlePrintReceipt = async (language = 'bn', showHeader = true) => {
    if (!submittedTransaction) return;

    try {
      // Show loading alert
      Swal.fire({
        title: language === 'en' ? 'Generating PDF...' : 'PDF তৈরি হচ্ছে...',
        text: language === 'en' ? 'Receipt is being prepared' : 'রিসিট তৈরি হচ্ছে',
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        background: isDark ? '#1F2937' : '#F9FAFB'
      });

      // Prepare PDF data with selected language
      // Extract accountManager name - comprehensive extraction from all possible locations
      let accountManagerName = '';
      
      // Priority 1: Direct accountManager object with name
      if (submittedTransaction.accountManager) {
        if (typeof submittedTransaction.accountManager === 'string') {
          accountManagerName = submittedTransaction.accountManager;
        } else if (typeof submittedTransaction.accountManager === 'object') {
          // Try all possible name fields
          accountManagerName = submittedTransaction.accountManager.name 
            || submittedTransaction.accountManager.fullName
            || submittedTransaction.accountManager.accountManagerName
            || submittedTransaction.accountManager.employeeName
            || submittedTransaction.accountManager.userName
            || submittedTransaction.accountManager.displayName
            || '';
        }
      }
      
      // Priority 2: Top-level accountManagerName field
      if (!accountManagerName && submittedTransaction.accountManagerName) {
        accountManagerName = submittedTransaction.accountManagerName;
      }
      
      // Priority 3: Check formData if submittedTransaction doesn't have it (fallback)
      if (!accountManagerName && formData.accountManager) {
        if (typeof formData.accountManager === 'string') {
          const nameStr = formData.accountManager.trim();
          if (nameStr) accountManagerName = nameStr;
        } else if (typeof formData.accountManager === 'object') {
          // Check all possible name fields, but skip empty strings
          const name1 = formData.accountManager.name?.trim();
          const name2 = formData.accountManager.fullName?.trim();
          const name3 = formData.accountManager.accountManagerName?.trim();
          const name4 = formData.accountManager.employeeName?.trim();
          const name5 = formData.accountManager.userName?.trim();
          const name6 = formData.accountManager.displayName?.trim();
          
          accountManagerName = name1 || name2 || name3 || name4 || name5 || name6 || '';
          
          // If still no name, try firstName + lastName
          if (!accountManagerName) {
            const firstName = formData.accountManager.firstName?.trim() || '';
            const lastName = formData.accountManager.lastName?.trim() || '';
            const combinedName = `${firstName} ${lastName}`.trim();
            if (combinedName) accountManagerName = combinedName;
          }
        }
      }
      
      // Clean up - remove any whitespace
      accountManagerName = accountManagerName ? accountManagerName.trim() : '';
      
      // Extract address from multiple possible sources
      let extractedAddress = '';
      
      // Priority 1: Top-level customerAddress
      if (submittedTransaction.customerAddress && typeof submittedTransaction.customerAddress === 'string') {
        const addr = submittedTransaction.customerAddress.trim();
        if (addr && addr !== '[Full Address]') extractedAddress = addr;
      }
      
      // Priority 2: Customer object
      if (!extractedAddress && submittedTransaction.customer && typeof submittedTransaction.customer === 'object') {
        const customerAddr = submittedTransaction.customer.address ||
                            submittedTransaction.customer.fullAddress ||
                            submittedTransaction.customer.customerAddress ||
                            submittedTransaction.customer.location;
        if (customerAddr && typeof customerAddr === 'string') {
          const addr = customerAddr.trim();
          if (addr && addr !== '[Full Address]') extractedAddress = addr;
        }
      }
      
      // Priority 3: Party object
      if (!extractedAddress && submittedTransaction.party && typeof submittedTransaction.party === 'object') {
        const partyAddr = submittedTransaction.party.address ||
                          submittedTransaction.party.fullAddress ||
                          submittedTransaction.party.location;
        if (partyAddr && typeof partyAddr === 'string') {
          const addr = partyAddr.trim();
          if (addr && addr !== '[Full Address]') extractedAddress = addr;
        }
      }
      
      // Priority 4: FormData (for newly created transactions)
      if (!extractedAddress && formData.customerAddress && typeof formData.customerAddress === 'string') {
        const addr = formData.customerAddress.trim();
        if (addr && addr !== '[Full Address]') extractedAddress = addr;
      }
      
      // Check if this is a Bank Transfer transaction
      const isBankTransfer = submittedTransaction.transactionType === 'transfer' 
        || submittedTransaction.mode === 'transfer'
        || (submittedTransaction.fromAccount && submittedTransaction.toAccount)
        || (submittedTransaction.debitAccount && submittedTransaction.creditAccount);
      
      // Extract debit and credit account names for Bank Transfer
      let debitAccountName = '';
      let creditAccountName = '';
      
      if (isBankTransfer) {
        // Try multiple possible locations for account names
        debitAccountName = submittedTransaction.debitAccount?.name 
          || submittedTransaction.debitAccount?.accountName
          || submittedTransaction.fromAccount?.name
          || submittedTransaction.fromAccount?.accountName
          || '[Debit Account]';
        
        creditAccountName = submittedTransaction.creditAccount?.name
          || submittedTransaction.creditAccount?.accountName
          || submittedTransaction.toAccount?.name
          || submittedTransaction.toAccount?.accountName
          || '[Credit Account]';
      }
      
      const pdfData = {
        transactionId: submittedTransaction.transactionId || `TXN-${Date.now()}`,
        transactionType: submittedTransaction.transactionType,
        customerId: submittedTransaction.customerId,
        uniqueId: submittedTransaction.uniqueId,
        customerName: submittedTransaction.customerName || '',
        customerPhone: submittedTransaction.customerPhone || '',
        customerEmail: submittedTransaction.customerEmail || '',
        customerAddress: (extractedAddress && extractedAddress.trim() && extractedAddress !== '[Full Address]') ? extractedAddress.trim() : '[Full Address]',
        category: submittedTransaction.category || '',
        paymentMethod: submittedTransaction.paymentMethod || '',
        bankName: submittedTransaction.paymentDetails?.bankName || '',
        accountNumber: submittedTransaction.paymentDetails?.accountNumber || '',
        accountManagerName: accountManagerName || '',
        amount: submittedTransaction.amount || 0,
        notes: submittedTransaction.notes || '',
        date: submittedTransaction.date || new Date().toISOString().split('T')[0],
        createdBy: userProfile?.email || 'unknown_user',
        branchId: userProfile?.branchId || 'main_branch',
        language: language,
        // Bank Transfer specific fields
        isBankTransfer: isBankTransfer,
        debitAccountName: debitAccountName,
        creditAccountName: creditAccountName,
      };

      // Final validation - log if accountManagerName is missing
      if (!pdfData.accountManagerName && (submittedTransaction.accountManager || formData.accountManager)) {
        console.warn('⚠️ Account Manager selected but name not extracted in Print!', {
          submittedTransactionAccountManager: submittedTransaction.accountManager,
          formDataAccountManager: formData.accountManager,
          pdfDataAccountManagerName: pdfData.accountManagerName
        });
      }

      // Generate PDF without downloading
      const result = await generateSalmaReceiptPDF(pdfData, { language, showHeader, download: false });

      Swal.close();

      if (result.success && result.pdf) {
        // Get PDF as blob
        const pdfBlob = result.pdf.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        
        // Create hidden iframe to load PDF
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        iframe.src = pdfUrl;
        
        document.body.appendChild(iframe);
        
        // Wait for PDF to load in iframe, then print
        iframe.onload = () => {
          setTimeout(() => {
            try {
              // Focus the iframe and trigger print
              iframe.contentWindow.focus();
              iframe.contentWindow.print();
              
              // Clean up after print
              setTimeout(() => {
                document.body.removeChild(iframe);
                URL.revokeObjectURL(pdfUrl);
              }, 1000);
            } catch (e) {
              // If cross-origin or other error, try opening in new window
              console.log('Iframe print failed, opening in new window:', e);
              document.body.removeChild(iframe);
              const printWindow = window.open(pdfUrl, '_blank');
              if (printWindow) {
                setTimeout(() => {
                  printWindow.print();
                  setTimeout(() => {
                    URL.revokeObjectURL(pdfUrl);
                  }, 1000);
                }, 1000);
              } else {
                URL.revokeObjectURL(pdfUrl);
                throw new Error('Popup blocked. Please allow popups for this site.');
              }
            }
          }, 1000);
        };
        
        // Fallback: if onload doesn't fire
        setTimeout(() => {
          if (iframe.parentNode) {
            try {
              iframe.contentWindow.print();
              setTimeout(() => {
                document.body.removeChild(iframe);
                URL.revokeObjectURL(pdfUrl);
              }, 1000);
            } catch (e) {
              // Fallback to new window
              document.body.removeChild(iframe);
              const printWindow = window.open(pdfUrl, '_blank');
              if (printWindow) {
                setTimeout(() => {
                  printWindow.print();
                  setTimeout(() => {
                    URL.revokeObjectURL(pdfUrl);
                  }, 1000);
                }, 1000);
              } else {
                URL.revokeObjectURL(pdfUrl);
              }
            }
          }
        }, 3000);
      } else {
        throw new Error(result.error || 'PDF generation failed');
      }
    } catch (error) {
      console.error('Receipt PDF print error:', error);
      Swal.close();
      Swal.fire({
        title: language === 'en' ? 'Error!' : 'ত্রুটি!',
        text: language === 'en' 
          ? 'There was a problem generating the PDF' 
          : 'PDF তৈরি করতে সমস্যা হয়েছে',
        icon: 'error',
        confirmButtonText: language === 'en' ? 'OK' : 'ঠিক আছে',
        background: isDark ? '#1F2937' : '#FEF2F2'
      });
    }
  };

  const handleShareWhatsApp = () => {
    if (typeof window === 'undefined' || !submittedTransaction) return;

    const rawPhone = submittedTransaction.customerPhone || '';
    const digitsOnly = String(rawPhone).replace(/\D/g, '');
    const phone = digitsOnly || '';

    const messageLines = [
      'Transaction Receipt',
      submittedTransaction.transactionId ? `ID: ${submittedTransaction.transactionId}` : '',
      submittedTransaction.customerName ? `Customer: ${submittedTransaction.customerName}` : '',
      submittedTransaction.amount ? `Amount: ৳${submittedTransaction.amount}` : '',
      submittedTransaction.date ? `Date: ${submittedTransaction.date}` : '',
    ].filter(Boolean);

    const message = messageLines.join('\n');
    const baseUrl = 'https://wa.me/';
    const url = `${baseUrl}${phone}?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank');
  };

  // Filter customers based on selected type
  const customersToFilter = selectedSearchType === 'airCustomer' ? airCustomers : [];
  const filteredCustomers = customersToFilter.filter(customer =>
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.mobile?.includes(searchTerm) ||
    customer.phone?.includes(searchTerm) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  

  const selectedPaymentMethod = paymentMethods.find(method => method.id === formData.paymentMethod);
  
  // Find selected category from all sub-categories
  const selectedCategory = categoryGroups
    .flatMap(group => group.subCategories)
    .find(cat => cat.id === formData.category);

  // Get default business account (main business account)
  const defaultBusinessAccount = accounts.find(account => account.type === 'business') || accounts[0];

  // Calculate customer balance from transactions
  const calculateCustomerBalance = (customerId) => {
    if (!customerId || !transactionsData?.transactions) return 0;
    
    const customerTransactions = transactionsData.transactions.filter(transaction => 
      transaction.customerId === customerId
    );
    
    let balance = 0;
    customerTransactions.forEach(transaction => {
      const amount = transaction.paymentDetails?.amount || transaction.amount || 0;
      if (transaction.transactionType === 'credit') {
        balance += amount;
      } else if (transaction.transactionType === 'debit') {
        balance -= amount;
      }
    });
    
    return balance;
  };
  const customerBalance = formData.customerId ? calculateCustomerBalance(formData.customerId) : 0;

  // If a transaction has just been submitted, show submission summary page instead of the multi-step form
  if (submittedTransaction) {
    const {
      transactionId,
      transactionType,
      amount,
      date,
      customerName,
      customerPhone,
      customerEmail,
      category,
      paymentMethod,
      fromAccount,
      toAccount,
      mode,
      paymentDetails
    } = submittedTransaction;

    // Charge is already stored with correct sign in paymentDetails.charge
    // (Credit/Transfer: negative, Debit: positive)
    const submissionCharge = parseFloat(paymentDetails?.charge || 0);
    const hasCharge = submissionCharge !== 0 && !isNaN(submissionCharge);
    
    // Calculate total amount for submission summary
    const getSubmissionTotalAmount = () => {
      const amountValue = parseFloat(amount || 0);
      return amountValue + submissionCharge; // charge already has correct sign
    };

    const submissionTotalAmount = getSubmissionTotalAmount();

    return (
      <DashboardLayout>
        <div className={`min-h-screen p-2 sm:p-4 lg:p-6 transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  লেনদেন সফলভাবে সংরক্ষণ হয়েছে
                </h1>
                <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Submission summary &amp; actions (EN/BN) – Download, Print, WhatsApp, New Transaction
                </p>
              </div>
            </div>
          </div>

          {/* Summary card */}
          <div className={`mb-4 sm:mb-6 rounded-xl shadow-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} p-4 sm:p-6`}>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-blue-600" />
              লেনদেনের সারসংক্ষেপ / Submission Summary
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 text-sm">
                {transactionId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Transaction ID:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{transactionId}</span>
                  </div>
                )}
                {transactionType && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Type:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {transactionType === 'credit'
                        ? 'ক্রেডিট (আয়)'
                        : transactionType === 'debit'
                        ? 'ডেবিট (ব্যয়)'
                        : 'একাউন্ট টু একাউন্ট ট্রান্সফার'}
                    </span>
                  </div>
                )}
                {category && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">ক্যাটাগরি:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{category}</span>
                  </div>
                )}
                {paymentMethod && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Payment Method:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{paymentMethod}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-sm">
                {amount !== undefined && amount !== null && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">পরিমাণ:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">৳{parseFloat(amount || 0).toLocaleString()}</span>
                  </div>
                )}
                {hasCharge && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">চার্জ:</span>
                    <span className={`font-semibold ${submissionCharge < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                      {submissionCharge < 0 ? '-' : '+'}৳{Math.abs(submissionCharge).toLocaleString()}
                    </span>
                  </div>
                )}
                {hasCharge && (
                  <div className="flex justify-between border-t border-dashed border-gray-300 dark:border-gray-600 pt-2 mt-2">
                    <span className="text-gray-600 dark:text-gray-400 font-semibold">মোট পরিমাণ:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      ৳{submissionTotalAmount.toLocaleString()}
                    </span>
                  </div>
                )}
                {date && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Date:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{date}</span>
                  </div>
                )}
                {customerName && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Customer:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{customerName}</span>
                  </div>
                )}
                {customerPhone && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Mobile:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{customerPhone}</span>
                  </div>
                )}
                {customerEmail && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Email:</span>
                    <span className="font-semibold text-gray-900 dark:text-white break-all">{customerEmail}</span>
                  </div>
                )}
              </div>
            </div>

            {(mode === 'transfer' || fromAccount || toAccount) && (
              <div className="mt-4 pt-4 border-t border-dashed border-gray-300 dark:border-gray-700 text-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fromAccount && (
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white mb-1">From Account</p>
                    <p className="text-gray-700 dark:text-gray-300">
                      {fromAccount.name || fromAccount.bankName} ({fromAccount.accountNumber})
                    </p>
                  </div>
                )}
                {toAccount && (
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white mb-1">To Account</p>
                    <p className="text-gray-700 dark:text-gray-300">
                      {toAccount.name || toAccount.bankName} ({toAccount.accountNumber})
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Header Toggle */}
          <div className={`mb-4 p-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showHeader}
                onChange={(e) => setShowHeader(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Header দেখান (Logo, Title, Tagline)
              </span>
            </label>
          </div>

          {/* Action buttons */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Download buttons EN/BN */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => handleDownloadReceipt('en', showHeader)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md transition-all"
                >
                  <Download className="w-4 h-4" />
                  Download (EN)
                </button>
                <button
                  onClick={() => handleDownloadReceipt('bn', showHeader)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold shadow-md transition-all"
                >
                  <Download className="w-4 h-4" />
                  ডাউনলোড (BN)
                </button>
              </div>

              {/* Print buttons EN/BN */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => handlePrintReceipt('en', showHeader)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-800 text-white text-sm font-semibold shadow-md transition-all"
                >
                  <FileText className="w-4 h-4" />
                  Print (EN)
                </button>
                <button
                  onClick={() => handlePrintReceipt('bn', showHeader)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white text-sm font-semibold shadow-md transition-all"
                >
                  <FileText className="w-4 h-4" />
                  প্রিন্ট (BN)
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-between">
              {/* WhatsApp share */}
              <button
                onClick={handleShareWhatsApp}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-semibold shadow-md transition-all w-full sm:w-auto"
              >
                <MessageCircle className="w-4 h-4" />
                Send by WhatsApp / WhatsApp এ শেয়ার করুন
              </button>

              {/* New transaction */}
              <button
                onClick={handleNewTransaction}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md transition-all w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                নতুন লেনদেন / New Transaction
              </button>
            </div>
          </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className={`transition-colors duration-300 ${
        isDark 
          ? 'bg-gray-900' 
          : 'bg-gray-50'
      }`}>
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  নতুন লেনদেন
                </h1>
                <p className={`text-xs sm:text-sm transition-colors duration-300 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Step-by-Step লেনদেন প্রক্রিয়া
                </p>
              </div>
            </div>
            
            <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 self-start sm:self-auto">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">ফিরে যান</span>
            </button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className={`mb-4 sm:mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2 sm:p-4 border transition-colors duration-300 ${
          isDark ? 'border-gray-700' : 'border-gray-100'
        }`}>
          {/* Mobile Steps */}
          <div className="flex md:hidden items-center justify-between overflow-x-auto">
            {steps.map((step, index) => {
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              const stepColor = getStepColor(step.number, isActive, isCompleted);
              
              return (
                <div key={step.number} className="flex items-center min-w-0">
                  <button
                    onClick={() => goToStep(step.number)}
                    className={`flex items-center gap-1 p-1 sm:p-2 rounded-lg transition-all duration-300 ${stepColor.bg} ${stepColor.text} ${currentStep >= step.number ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'}`}
                  >
                    <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold ${stepColor.circle} text-white`}>
                      {isCompleted ? <CheckCircle className="w-2 h-2 sm:w-3 sm:h-3" /> : step.number}
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-xs font-semibold truncate max-w-16">{step.title.split(' ')[0]}</div>
                    </div>
                  </button>
                  {index < steps.length - 1 && (
                    <ChevronRight className={`w-3 h-3 sm:w-4 sm:h-4 mx-0.5 sm:mx-1 transition-colors duration-300 ${
                      isCompleted ? 'text-green-500' : 'text-gray-400'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Desktop Steps */}
          <div className="hidden md:flex items-center justify-between">
            {steps.map((step, index) => {
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              const stepColor = getStepColor(step.number, isActive, isCompleted);
              
              return (
                <div key={step.number} className="flex items-center">
                  <button
                    onClick={() => goToStep(step.number)}
                    className={`flex items-center gap-2 p-2 rounded-lg transition-all duration-300 ${stepColor.bg} ${stepColor.text} ${currentStep >= step.number ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'}`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${stepColor.circle} text-white`}>
                      {isCompleted ? <CheckCircle className="w-3 h-3" /> : step.number}
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold">{step.title}</div>
                      <div className="text-xs opacity-75">{step.description}</div>
                    </div>
                  </button>
                  {index < steps.length - 1 && (
                    <ChevronRight className={`w-4 h-4 mx-1 transition-colors duration-300 ${
                      isCompleted ? 'text-green-500' : 'text-gray-400'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border transition-colors duration-300 ${
          isDark ? 'border-gray-700' : 'border-gray-100'
        }`}>
          {/* Step 1: Transaction Type */}
          {currentStep === 1 && (
            <div className="p-3 sm:p-4 lg:p-6">
              <div className="text-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                  লেনদেনের ধরন নির্বাচন করুন
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  আপনি কোন ধরনের লেনদেন করতে চান?
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-w-6xl mx-auto">
                <button
                  onClick={() => {
                    setFormData(prev => ({ ...prev, transactionType: 'credit' }));
                    setErrors(prev => ({ ...prev, transactionType: '' }));
                  }}
                  className={`p-3 sm:p-4 lg:p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                    formData.transactionType === 'credit'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-green-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 dark:text-white mb-1">
                      ক্রেডিট (আয়)
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      কাস্টমার থেকে অর্থ গ্রহণ
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setFormData(prev => ({ ...prev, transactionType: 'debit' }));
                    setErrors(prev => ({ ...prev, transactionType: '' }));
                  }}
                  className={`p-3 sm:p-4 lg:p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                    formData.transactionType === 'debit'
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-red-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 dark:text-white mb-1">
                      ডেবিট (ব্যয়)
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      ভেন্ডর বা সেবা প্রদানকারীকে অর্থ প্রদান
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setFormData(prev => ({ ...prev, transactionType: 'transfer' }));
                    setErrors(prev => ({ ...prev, transactionType: '' }));
                  }}
                  className={`p-3 sm:p-4 lg:p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                    formData.transactionType === 'transfer'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <ArrowRightLeft className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 dark:text-white mb-1">
                      একাউন্ট টু একাউন্ট
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      এক একাউন্ট থেকে অন্য একাউন্টে ট্রান্সফার
                    </p>
                  </div>
                </button>
              </div>

              {errors.transactionType && (
                <p className="text-red-500 text-center mt-3 sm:mt-4 flex items-center justify-center gap-2 text-xs sm:text-sm">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  {errors.transactionType}
                </p>
              )}
            </div>
          )}

          {/* Step 2: Category Selection (for credit/debit) or Debit Account Selection (for transfer) */}
          {currentStep === 2 && (
            <div className="p-3 sm:p-4 lg:p-6">
              {formData.transactionType === 'transfer' ? (
                // Transfer: Debit Account Selection
                <div className="text-center mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                    ডেবিট একাউন্ট নির্বাচন করুন
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    অর্থ উত্তোলনের জন্য একাউন্ট সিলেক্ট করুন
                  </p>
                </div>
              ) : (
                // Credit/Debit: Customer Type Selection
                <div className="text-center mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                    কাস্টমার টাইপ নির্বাচন করুন
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    আপনি কোন ধরনের কাস্টমারের সাথে লেনদেন করবেন?
                  </p>
                </div>
              )}

                {formData.transactionType === 'transfer' ? (
                  // Transfer: Debit Account List
                <div className="max-w-4xl mx-auto">
                    {/* Debit Account Search Bar */}
                    <div className="relative mb-3 sm:mb-4">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="ডেবিট একাউন্ট খুঁজুন... (নাম, ব্যাংক, একাউন্ট নম্বর)"
                        value={debitAccountSearchTerm}
                        onChange={(e) => setDebitAccountSearchTerm(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'border-gray-300'
                        }`}
                      />
                    </div>

                    <div className="space-y-2 sm:space-y-3 max-h-60 sm:max-h-80 overflow-y-auto">
                    {filteredDebitAccounts.map((account) => (
                      <button
                        key={account.id}
                        onClick={() => handleAccountSelect(account, 'debitAccount')}
                        className={`w-full p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 hover:scale-[1.02] ${
                          formData.debitAccount?.id === account.id
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-red-300'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                            {/* Bank Logo */}
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border-2 ${
                              formData.debitAccount?.id === account.id
                                ? 'border-red-500 ring-2 ring-red-200 dark:ring-red-900'
                                : 'border-gray-200 dark:border-gray-600'
                            }`}>
                              {account.logo ? (
                                <img 
                                  src={account.logo} 
                                  alt={account.bankName || 'Bank Logo'} 
                                  className="w-full h-full object-cover rounded-full"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              ) : null}
                              {!account.logo && (
                                <div className={`w-full h-full rounded-full flex items-center justify-center ${
                                  formData.debitAccount?.id === account.id
                                    ? 'bg-red-100 dark:bg-red-800'
                                    : 'bg-gray-100 dark:bg-gray-700'
                                }`}>
                                  <Building2 className={`w-5 h-5 sm:w-6 sm:h-6 ${
                                    formData.debitAccount?.id === account.id
                                      ? 'text-red-600 dark:text-red-400'
                                      : 'text-gray-600 dark:text-gray-400'
                                  }`} />
                                </div>
                              )}
                            </div>
                            <div className="text-left min-w-0 flex-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                                {account.bankName} - {account.accountTitle || account.name}
                              </h3>
                              {account.accountHolder && (
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                                  {account.accountHolder}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                                A/C: {account.accountNumber}
                              </p>
                            </div>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="text-base sm:text-lg font-bold text-green-600 dark:text-green-400">
                              ৳{account.balance.toLocaleString()}
                            </p>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              account.type === 'business' 
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                : account.type === 'hajj'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : account.type === 'umrah'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                            }`}>
                              {account.type === 'business' ? 'ব্যবসায়িক' : 
                               account.type === 'hajj' ? 'হজ্জ' : 
                               account.type === 'umrah' ? 'উমরাহ' :
                               account.type === 'airline' ? 'এয়ারলাইন' :
                               account.type === 'visa' ? 'ভিসা' : 'সঞ্চয়'}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                    </div>
                </div>
                ) : null}
                
                {formData.transactionType !== 'transfer' && (
                // Credit/Debit: Customer Type Selection
                  <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {[
                        { value: 'airCustomer', label: 'এয়ার টিকেটিং', icon: '✈️', color: 'blue' },
                        { value: 'vendor', label: 'ভেন্ডর ও পার্টনার', icon: '🏪', color: 'purple' },
                        { value: 'agent', label: 'এজেন্ট', icon: '👤', color: 'green' },
                        { value: 'haji', label: 'হজ্ব', icon: '🕋', color: 'amber' },
                        { value: 'umrah', label: 'উমরাহ', icon: '🕌', color: 'indigo' },
                        { value: 'loan', label: 'ঋণ ও স্বল্পমেয়াদী লেনদেন', icon: '💰', color: 'red' },
                        { value: 'personalExpense', label: 'ব্যক্তিগত/ পারিবারিক', icon: '💳', color: 'pink' },
                        { value: 'mirajIndustries', label: 'মিরাজ ইন্ডাস্ট্রিজ', icon: '🏭', color: 'orange' },
                        { value: 'officeExpenses', label: 'অফিস ব্যয়', icon: '🏢', color: 'teal' },
                        { value: 'moneyExchange', label: 'মানি এক্সচেঞ্জ', icon: '💱', color: 'cyan' },
                        { value: 'investment', label: 'বিনিয়োগ', icon: '📈', color: 'emerald' },
                        { value: 'asset', label: 'সম্পদ', icon: '📦', color: 'slate' }
                      ].map((type) => (
                        <button
                          key={type.value}
                          onClick={() => {
                            setFormData(prev => ({ ...prev, selectedCustomerType: type.value }));
                            setErrors(prev => ({ ...prev, selectedCustomerType: '' }));
                            // Clear customer selection when type changes
                            setFormData(prev => ({
                              ...prev,
                              customerId: '',
                              customerName: '',
                              customerPhone: '',
                              customerEmail: '',
                              personalExpenseProfileId: '',
                              customerAddress: '',
                              customerType: type.value === 'airCustomer' ? 'customer' : type.value
                            }));
                          }}
                          className={`p-4 sm:p-5 rounded-lg border-2 transition-all duration-200 hover:scale-105 text-left ${
                            formData.selectedCustomerType === type.value
                              ? `border-${type.color}-500 bg-${type.color}-50 dark:bg-${type.color}-900/20`
                              : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-2xl sm:text-3xl">{type.icon}</div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                                {type.label}
                              </h4>
                            </div>
                            {formData.selectedCustomerType === type.value && (
                              <CheckCircle className={`w-5 h-5 text-${type.color}-500 flex-shrink-0`} />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>

                    {errors.selectedCustomerType && (
                      <p className="text-red-500 text-center mt-3 sm:mt-4 flex items-center justify-center gap-2 text-xs sm:text-sm">
                        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                        {errors.selectedCustomerType}
                      </p>
                    )}
                  </div>
                )}
            </div>
          )}
          {/* Step 3: Customer Selection (for credit/debit) or Credit Account Selection (for transfer) */}
          {currentStep === 3 && (
            <div className="p-3 sm:p-4 lg:p-6">
              {formData.transactionType === 'transfer' ? (
                // Transfer: Credit Account Selection
                <div className="text-center mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                    ক্রেডিট একাউন্ট নির্বাচন করুন
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    অর্থ জমা করার জন্য একাউন্ট সিলেক্ট করুন
                  </p>
                </div>
              ) : (
                // Credit/Debit: Customer Selection
                <div className="text-center mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                    কাস্টমার নির্বাচন করুন
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    লেনদেনের জন্য কাস্টমার সিলেক্ট করুন
                  </p>
                </div>
              )}

              {formData.transactionType === 'transfer' ? (
                // Transfer: Credit Account List
                <div className="max-w-4xl mx-auto">
                  {/* Credit Account Search Bar */}
                  <div className="relative mb-3 sm:mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="ক্রেডিট একাউন্ট খুঁজুন... (নাম, ব্যাংক, একাউন্ট নম্বর)"
                      value={creditAccountSearchTerm}
                      onChange={(e) => setCreditAccountSearchTerm(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'border-gray-300'
                      }`}
                    />
                  </div>

                  <div className="space-y-2 sm:space-y-3 max-h-60 sm:max-h-80 overflow-y-auto">
                    {filteredCreditAccounts
                      .filter(account => account.id !== formData.debitAccount?.id) // Exclude selected debit account
                      .map((account) => (
                        <button
                          key={account.id}
                          onClick={() => handleAccountSelect(account, 'creditAccount')}
                          className={`w-full p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 hover:scale-[1.02] ${
                            formData.creditAccount?.id === account.id
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                              : 'border-gray-200 dark:border-gray-600 hover:border-green-300'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                              {/* Bank Logo */}
                              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border-2 ${
                                formData.creditAccount?.id === account.id
                                  ? 'border-green-500 ring-2 ring-green-200 dark:ring-green-900'
                                  : 'border-gray-200 dark:border-gray-600'
                              }`}>
                                {account.logo ? (
                                  <img 
                                    src={account.logo} 
                                    alt={account.bankName || 'Bank Logo'} 
                                    className="w-full h-full object-cover rounded-full"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                ) : null}
                                {!account.logo && (
                                  <div className={`w-full h-full rounded-full flex items-center justify-center ${
                                    formData.creditAccount?.id === account.id
                                      ? 'bg-green-100 dark:bg-green-800'
                                      : 'bg-gray-100 dark:bg-gray-700'
                                  }`}>
                                    <Building2 className={`w-5 h-5 sm:w-6 sm:h-6 ${
                                      formData.creditAccount?.id === account.id
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-gray-600 dark:text-gray-400'
                                    }`} />
                                  </div>
                                )}
                              </div>
                              <div className="text-left min-w-0 flex-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                                  {account.bankName} - {account.accountTitle || account.name}
                                </h3>
                                {account.accountHolder && (
                                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                                    {account.accountHolder}
                                  </p>
                                )}
                                <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                                  A/C: {account.accountNumber}
                                </p>
                              </div>
                            </div>
                            <div className="text-left sm:text-right">
                              <p className="text-base sm:text-lg font-bold text-green-600 dark:text-green-400">
                                ৳{account.balance.toLocaleString()}
                              </p>
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                account.type === 'business' 
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                  : account.type === 'hajj'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                  : account.type === 'umrah'
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                              }`}>
                                {account.type === 'business' ? 'ব্যবসায়িক' : 
                                 account.type === 'hajj' ? 'হজ্জ' : 
                                 account.type === 'umrah' ? 'উমরাহ' :
                                 account.type === 'airline' ? 'এয়ারলাইন' :
                                 account.type === 'visa' ? 'ভিসা' : 'সঞ্চয়'}
                              </span>
                            </div>
                          </div>
                        </button>
                      ))}
                  </div>

                  {errors.creditAccount && (
                    <p className="text-red-500 text-center mt-3 sm:mt-4 flex items-center justify-center gap-2 text-xs sm:text-sm">
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      {errors.creditAccount}
                    </p>
                  )}
                </div>
              ) : (
                // Credit/Debit: Customer Selection
                <div className="max-w-4xl mx-auto">
                  {/* Show selected customer type */}
                  {formData.selectedCustomerType && (
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        নির্বাচিত টাইপ: <span className="font-semibold">
                          {formData.selectedCustomerType === 'airCustomer' ? 'এয়ার কাস্টমার' : 
                           formData.selectedCustomerType === 'vendor' ? 'ভেন্ডর' : 
                           formData.selectedCustomerType === 'agent' ? 'এজেন্ট' :
                           formData.selectedCustomerType === 'haji' ? 'হাজি' :
                           formData.selectedCustomerType === 'umrah' ? 'উমরাহ' :
                           formData.selectedCustomerType === 'loan' ? 'ঋণ' : 
                           formData.selectedCustomerType === 'personalExpense' ? 'ব্যক্তিগত ব্যয়' :
                           formData.selectedCustomerType === 'mirajIndustries' ? 'মিরাজ ইন্ডাস্ট্রিজ' :
                           formData.selectedCustomerType === 'officeExpenses' ? 'অফিস ব্যয়' :
                           formData.selectedCustomerType === 'moneyExchange' ? 'মানি এক্সচেঞ্জ' :
                           formData.selectedCustomerType === 'investment' ? 'বিনিয়োগ' :
                           formData.selectedCustomerType === 'asset' ? 'সম্পদ' :
                           formData.selectedCustomerType}
                        </span>
                      </p>
                    </div>
                  )}
                  {/* Search Bar */}
                  <div className="relative mb-3 sm:mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    {searchLoading && (
                      <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                    )}
                    <input
                      type="text"
                      placeholder={
                        effectiveSearchType === 'airCustomer'
                          ? 'এয়ার কাস্টমার খুঁজুন... (নাম/ফোন/ইমেইল)'
                          : effectiveSearchType === 'vendor'
                          ? 'ভেন্ডর খুঁজুন... (নাম/ফোন)'
                          : effectiveSearchType === 'agent'
                          ? 'এজেন্ট খুঁজুন... (নাম/ফোন)'
                          : effectiveSearchType === 'haji'
                          ? 'হাজি খুঁজুন... (নাম/ফোন/পাসপোর্ট)'
                          : effectiveSearchType === 'umrah'
                          ? 'উমরাহ খুঁজুন... (নাম/ফোন/পাসপোর্ট)'
                          : effectiveSearchType === 'loans'
                          ? 'লোন খুঁজুন... (আইডি/নাম)'
                          : effectiveSearchType === 'personal'
                          ? 'ক্যাটাগরি খুঁজুন... (নাম/বর্ণনা)'
                          : effectiveSearchType === 'office'
                          ? 'Office Expenses – ক্যাটাগরি আইডি/নাম খুঁজুন'
                          : effectiveSearchType === 'moneyExchange'
                          ? 'মানি এক্সচেঞ্জ আইডি/নাম খুঁজুন'
                          : effectiveSearchType === 'investment'
                          ? 'বিনিয়োগ খুঁজুন... (নাম/টাইপ/এয়ারলাইন)'
                          : effectiveSearchType === 'asset'
                          ? 'সম্পদ খুঁজুন... (নাম/টাইপ)'
                          : effectiveSearchType === 'miraj'
                          ? 'কর্মচারী, আয় বা খরচ খুঁজুন... (নাম/পদ/মোবাইল/ভেন্ডর/সোর্স)'
                          : 'Miraj Industries – ক্যাটাগরি/অপশন খুঁজুন'
                      }
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full pl-10 pr-10 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'border-gray-300'
                      }`}
                    />
                  </div>

                  {/* Customer / Agent / Vendor List */}
                  <div className="space-y-2 max-h-60 sm:max-h-80 overflow-y-auto">
                    {(effectiveSearchType === 'agent' && (agentLoading || searchLoading)) ||
                     (effectiveSearchType === 'vendor' && (vendorLoading || searchLoading)) ||
                     (effectiveSearchType === 'airCustomer' && (airCustomersLoading || searchLoading)) ||
                     (effectiveSearchType === 'haji' && (hajiLoading || searchLoading)) ||
                     (effectiveSearchType === 'umrah' && (umrahLoading || searchLoading)) ||
                     (effectiveSearchType === 'loans' && (loansSearchLoading || searchLoading)) ||
                    (effectiveSearchType === 'office' && (opExLoading || searchLoading)) ||
                    (effectiveSearchType === 'moneyExchange' && (moneyExchangeLoading || searchLoading)) ||
                    (effectiveSearchType === 'personal' && (personalCatsLoading || searchLoading)) ||
                    (effectiveSearchType === 'investment' && (investmentLoading || searchLoading)) ||
                    (effectiveSearchType === 'asset' && (assetsLoading || searchLoading)) ||
                    (effectiveSearchType === 'miraj' && (mirajEmployeesLoading || mirajIncomesLoading || mirajExpensesLoading || searchLoading)) ? (
                      <div className="flex items-center justify-center py-6 sm:py-8">
                        <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-blue-500" />
                        <span className="ml-2 text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                          {effectiveSearchType === 'airCustomer' ? 'এয়ার কাস্টমার লোড হচ্ছে...' : 
                           effectiveSearchType === 'vendor' ? 'ভেন্ডর লোড হচ্ছে...' : 
                           effectiveSearchType === 'agent' ? 'এজেন্ট লোড হচ্ছে...' :
                           effectiveSearchType === 'haji' ? 'হাজি লোড হচ্ছে...' :
                           effectiveSearchType === 'umrah' ? 'উমরাহ লোড হচ্ছে...' :
                           effectiveSearchType === 'personal' ? 'ক্যাটাগরি লোড হচ্ছে...' :
                           effectiveSearchType === 'miraj' ? 'কর্মচারী, আয় ও খরচ লোড হচ্ছে...' :
                           effectiveSearchType === 'office' ? 'অফিস খরচ ক্যাটাগরি লোড হচ্ছে...' :
                           effectiveSearchType === 'moneyExchange' ? 'মানি এক্সচেঞ্জ ডেটা লোড হচ্ছে...' :
                           effectiveSearchType === 'investment' ? 'বিনিয়োগ লোড হচ্ছে...' :
                           effectiveSearchType === 'asset' ? 'সম্পদ লোড হচ্ছে...' :
                           'লোন লোড হচ্ছে...'}
                        </span>
                      </div>
                    ) : effectiveSearchType === 'office' ? (
                      // Office Expenses categories list
                      (() => {
                        const filteredCategories = (opExCategories || []).filter(c => {
                          if (!searchTerm) return true;
                          const t = searchTerm.toLowerCase();
                          return (c.name || '').toLowerCase().includes(t) ||
                                 (c.banglaName || '').toLowerCase().includes(t) ||
                                 (c.description || '').toLowerCase().includes(t);
                        });

                        return filteredCategories.length > 0 ? (
                          filteredCategories.map((cat) => (
                        <button
                          key={`office-${cat.id}`}
                          onClick={() => handleCustomerSelect({
                            id: cat.id,
                            name: cat.name,
                            customerType: 'office'
                          })}
                          className={`w-full p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 hover:scale-[1.02] ${
                            formData.customerId === cat.id
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-center space-x-3 sm:space-x-4">
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                              formData.customerId === cat.id
                                ? 'bg-blue-100 dark:bg-blue-800'
                                : 'bg-gray-100 dark:bg-gray-700'
                            }`}>
                              <FileText className={`w-5 h-5 sm:w-6 sm:h-6 ${
                                formData.customerId === cat.id
                                  ? 'text-blue-600 dark:text-blue-400'
                                  : 'text-gray-600 dark:text-gray-400'
                              }`} />
                            </div>
                            <div className="text-left min-w-0 flex-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                                {cat.name || cat.banglaName || 'Unnamed'}
                              </h3>
                              {cat.banglaName && cat.name !== cat.banglaName && (
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                                  {cat.banglaName}
                                </p>
                              )}
                              {cat.description && (
                                <p className="text-xs text-gray-500 dark:text-gray-500 truncate mt-1">
                                  {cat.description}
                                </p>
                              )}
                              {cat.totalAmount !== undefined && (
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                  মোট: ৳{Number(cat.totalAmount || 0).toLocaleString('bn-BD')}
                                  {cat.itemCount !== undefined && cat.itemCount > 0 && (
                                    <span className="ml-2">({cat.itemCount} টি)</span>
                                  )}
                                </p>
                              )}
                            </div>
                            {formData.customerId === cat.id && (
                              <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                            )}
                          </div>
                        </button>
                          ))
                        ) : (
                          <div className="text-center py-6 sm:py-8 text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                            {searchTerm ? 'কোন অফিস ব্যয় ক্যাটাগরি পাওয়া যায়নি' : 'কোন অফিস ব্যয় ক্যাটাগরি নেই। নতুন ক্যাটাগরি যোগ করুন।'}
                          </div>
                        );
                      })()
                    ) : effectiveSearchType === 'moneyExchange' ? (
                      moneyExchangeList.length > 0 ? (
                        moneyExchangeList.map((exchange) => (
                          <button
                            key={`money-exchange-${exchange.id}`}
                            onClick={() => handleCustomerSelect({
                              id: exchange.id,
                              name: exchange.fullName || `${exchange.type === 'Sell' ? 'বিক্রয়' : 'ক্রয়'} - ${exchange.currencyName || exchange.currencyCode || 'Currency'}`,
                              customerType: 'money-exchange',
                              mobile: exchange.mobileNumber,
                              moneyExchangeInfo: exchange
                            })}
                            className={`w-full p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 hover:scale-[1.02] ${
                              formData.customerId === exchange.id
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  formData.customerId === exchange.id
                                    ? 'bg-blue-100 dark:bg-blue-800'
                                    : 'bg-indigo-100 dark:bg-indigo-900/30'
                                }`}>
                                  <ArrowRightLeft className={`w-5 h-5 sm:w-6 sm:h-6 ${
                                    formData.customerId === exchange.id
                                      ? 'text-blue-600 dark:text-blue-400'
                                      : 'text-indigo-600 dark:text-indigo-300'
                                  }`} />
                                </div>
                                <div className="text-left min-w-0 flex-1">
                                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                                    {exchange.fullName || exchange.currencyName || exchange.currencyCode || 'Money Exchange'}
                                  </h3>
                                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                                    {exchange.type === 'Sell' ? 'বিক্রয় (Sell)' : 'ক্রয় (Buy)'} • {exchange.currencyName || exchange.currencyCode || 'N/A'}
                                  </p>
                                  {exchange.amount_bdt ? (
                                    <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                                      ৳{Number(exchange.amount_bdt || 0).toLocaleString()} • {exchange.quantity} @ {exchange.exchangeRate}
                                    </p>
                                  ) : null}
                                </div>
                              </div>
                              {formData.customerId === exchange.id && (
                                <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                              )}
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="text-center py-6 sm:py-8 text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                          {moneyExchangeList.length === 0 ? 'কোন মানি এক্সচেঞ্জ ডেটা নেই' : 'লেনদেনের ধরন নির্বাচন করুন' }
                        </div>
                      )
                    ) : effectiveSearchType === 'haji' ? (
                      // Haji Results
                      hajiData?.data?.length > 0 ? (
                        hajiData.data
                          .filter(haji => 
                            !searchTerm || 
                            haji.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            haji.mobile?.includes(searchTerm) ||
                            haji.passportNumber?.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .map((haji) => (
                            <button
                              key={`haji-${haji._id || haji.id}`}
                              onClick={() => handleCustomerSelect({
                                id: haji._id || haji.id,
                                name: haji.name,
                                phone: haji.mobile,
                                email: haji.email,
                                address: haji.address || haji.fullAddress || '',
                                uniqueId: haji.uniqueId || haji.customerId || haji.hajiId || '',
                                customerType: 'haji',
                                // Pass customerId field from haji record (this links to customer profile)
                                // This is different from haji._id (which is the haji record's own ID)
                                customerId: haji.customerId || haji.linkedCustomerId || haji.airCustomerId || haji.referenceCustomerId || null
                              })}
                              className={`w-full p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 hover:scale-[1.02] ${
                                formData.customerId === (haji._id || haji.id)
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                  : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                              }`}
                            >
                              <div className="flex items-center space-x-3 sm:space-x-4">
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden flex-shrink-0 ${
                                  formData.customerId === (haji._id || haji.id)
                                    ? 'bg-blue-100 dark:bg-blue-800'
                                    : 'bg-green-100 dark:bg-green-800'
                                }`}>
                                  {(() => {
                                    const photoUrl = haji.photo || haji.photoUrl || haji.image;
                                    return photoUrl ? (
                                      <img 
                                        src={photoUrl} 
                                        alt={haji.name || 'Haji'} 
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          e.target.style.display = 'none';
                                          e.target.nextSibling.style.display = 'flex';
                                        }}
                                      />
                                    ) : null;
                                  })()}
                                  <div className={`w-full h-full rounded-full flex items-center justify-center ${
                                    (haji.photo || haji.photoUrl || haji.image) ? 'hidden' : 'flex'
                                  }`}>
                                    <User className={`w-5 h-5 sm:w-6 sm:h-6 ${
                                      formData.customerId === (haji._id || haji.id)
                                        ? 'text-blue-600 dark:text-blue-400'
                                        : 'text-green-600 dark:text-green-400'
                                    }`} />
                                  </div>
                                </div>
                                <div className="text-left min-w-0 flex-1">
                                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base break-words">
                                    {haji.name}
                                  </h3>
                                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                                    {haji.mobile || 'N/A'}
                                  </p>
                                  {(haji.address || haji.fullAddress) && (
                                    <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                                      {haji.address || haji.fullAddress}
                                    </p>
                                  )}
                                  {haji.passportNumber && (
                                    <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                                      🛂 পাসপোর্ট: {haji.passportNumber}
                                    </p>
                                  )}
                                </div>
                                {formData.customerId === (haji._id || haji.id) && (
                                  <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                )}
                              </div>
                            </button>
                          ))
                      ) : (
                        <div className="text-center py-6 sm:py-8 text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                          {searchTerm ? 'কোন হাজি পাওয়া যায়নি' : 'কোন হাজি নেই'}
                        </div>
                      )
                    ) : effectiveSearchType === 'umrah' ? (
                      // Umrah Results
                      umrahData?.data?.length > 0 ? (
                        umrahData.data
                          .filter(umrah => 
                            !searchTerm || 
                            umrah.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            umrah.mobile?.includes(searchTerm) ||
                            umrah.passportNumber?.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .map((umrah) => (
                            <button
                              key={`umrah-${umrah._id || umrah.id}`}
                              onClick={() => handleCustomerSelect({
                                id: umrah._id || umrah.id,
                                name: umrah.name,
                                phone: umrah.mobile,
                                email: umrah.email,
                                address: umrah.address || umrah.fullAddress || '',
                                uniqueId: umrah.uniqueId || umrah.customerId || umrah.umrahId || '',
                                customerType: 'umrah',
                                // Pass customerId field from umrah record (this links to customer profile)
                                // This is different from umrah._id (which is the umrah record's own ID)
                                customerId: umrah.customerId || umrah.linkedCustomerId || umrah.airCustomerId || umrah.referenceCustomerId || null
                              })}
                              className={`w-full p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 hover:scale-[1.02] ${
                                formData.customerId === (umrah._id || umrah.id)
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                  : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                              }`}
                            >
                              <div className="flex items-center space-x-3 sm:space-x-4">
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden flex-shrink-0 ${
                                  formData.customerId === (umrah._id || umrah.id)
                                    ? 'bg-blue-100 dark:bg-blue-800'
                                    : 'bg-purple-100 dark:bg-purple-800'
                                }`}>
                                  {(() => {
                                    const photoUrl = umrah.photo || umrah.photoUrl || umrah.image;
                                    return photoUrl ? (
                                      <img 
                                        src={photoUrl} 
                                        alt={umrah.name || 'Umrah'} 
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          e.target.style.display = 'none';
                                          e.target.nextSibling.style.display = 'flex';
                                        }}
                                      />
                                    ) : null;
                                  })()}
                                  <div className={`w-full h-full rounded-full flex items-center justify-center ${
                                    (umrah.photo || umrah.photoUrl || umrah.image) ? 'hidden' : 'flex'
                                  }`}>
                                    <User className={`w-5 h-5 sm:w-6 sm:h-6 ${
                                      formData.customerId === (umrah._id || umrah.id)
                                        ? 'text-blue-600 dark:text-blue-400'
                                        : 'text-purple-600 dark:text-purple-400'
                                    }`} />
                                  </div>
                                </div>
                                <div className="text-left min-w-0 flex-1">
                                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base break-words">
                                    {umrah.name}
                                  </h3>
                                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                                    📞 {umrah.mobile || 'N/A'}
                                  </p>
                                  {(umrah.address || umrah.fullAddress) && (
                                    <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                                      📍 {umrah.address || umrah.fullAddress}
                                    </p>
                                  )}
                                  {umrah.passportNumber && (
                                    <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                                      পাসপোর্ট: {umrah.passportNumber}
                                    </p>
                                  )}
                                </div>
                                {formData.customerId === (umrah._id || umrah.id) && (
                                  <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                )}
                              </div>
                            </button>
                          ))
                      ) : (
                        <div className="text-center py-6 sm:py-8 text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                          {searchTerm ? 'কোন উমরাহ পাওয়া যায়নি' : 'কোন উমরাহ নেই'}
                        </div>
                      )
                    ) : effectiveSearchType === 'agent' ? (
                        agentResults.length > 0 ? (
                        agentResults.map((agent) => (
                          <button
                            key={`agent-${agent._id || agent.id}`}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleAgentSelect(agent);
                            }}
                            className={`w-full p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 hover:scale-102 ${
                              formData.customerId === (agent._id || agent.id)
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-700">
                                  {(agent.profilePicture || agent.profile_picture) ? (
                                    <img 
                                      src={agent.profilePicture || agent.profile_picture} 
                                      alt={agent.tradeName || agent.ownerName} 
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                      }}
                                    />
                                  ) : null}
                                  <div className={`w-full h-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center ${
                                    (agent.profilePicture || agent.profile_picture) ? 'hidden' : 'flex'
                                  }`}>
                                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                                  </div>
                                </div>
                                <div className="text-left min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm truncate">
                                      {agent.tradeName || agent.ownerName}
                                    </h3>
                                    <span className="inline-block px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-xs rounded-full">
                                      Agent
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                    📞 {agent.contactNo || agent.phone || agent.mobile || 'N/A'}
                                  </p>
                                  {(agent.address || agent.fullAddress || agent.tradeLocation) && (
                                    <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                                      📍 {agent.address || agent.fullAddress || agent.tradeLocation}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {formData.customerId === (agent._id || agent.id) && (
                                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                              )}
                            </div>
                          </button>
                        ))) : (
                          <div className="text-center py-6 sm:py-8 text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                            {searchTerm ? 'কোন এজেন্ট পাওয়া যায়নি' : 'কোন এজেন্ট নেই'}
                          </div>
                        )
                    ) : effectiveSearchType === 'vendor' ? (
                        vendorResults.length > 0 ? (
                        vendorResults.map((vendor) => (
                          <button
                            key={`vendor-${vendor._id || vendor.id}`}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleVendorSelect(vendor);
                            }}
                            className={`w-full p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 hover:scale-102 ${
                              formData.customerId === (vendor._id || vendor.id)
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                {vendor.logo ? (
                                  <img 
                                    src={vendor.logo} 
                                    alt={vendor.tradeName || vendor.vendorName || vendor.name} 
                                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0 border border-gray-200 dark:border-gray-700" 
                                  />
                                ) : (
                                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                                  </div>
                                )}
                                <div className="text-left min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm truncate">
                                      {vendor.tradeName || vendor.vendorName || vendor.name}
                                    </h3>
                                    <span className={`inline-block px-1.5 py-0.5 text-xs rounded-full ${
                                      vendor._type === 'agent' 
                                        ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                                        : 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                                    }`}>
                                      {vendor._type === 'agent' ? 'Agent' : 'Vendor'}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                    📞 {vendor.contactNo || vendor.phone || vendor.mobile || 'N/A'}
                                  </p>
                                  {(vendor.address || vendor.fullAddress || vendor.tradeLocation) && (
                                    <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                                      📍 {vendor.address || vendor.fullAddress || vendor.tradeLocation}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {formData.customerId === (vendor._id || vendor.id) && (
                                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                              )}
                            </div>
                          </button>
                        ))) : (
                          <div className="text-center py-6 sm:py-8 text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                            {searchTerm ? 'কোন ভেন্ডর পাওয়া যায়নি' : 'কোন ভেন্ডর নেই'}
                          </div>
                        )
                        ) : effectiveSearchType === 'loans' ? (
                      (() => {
                        // Filter loans based on search term
                        const filteredLoans = loansSearch.filter((loan) => {
                          if (!searchTerm) return true;
                          const term = searchTerm.toLowerCase();
                          const loanName = (loan.fullName || loan.customerName || loan.borrowerName || loan.businessName || loan.tradeName || loan.ownerName || loan.name || '').toLowerCase();
                          const loanId = (loan.loanId || loan._id || loan.id || '').toString().toLowerCase();
                          const loanPhone = (loan.contactPhone || loan.customerPhone || loan.phone || loan.mobile || loan.mobileNumber || loan.contactNo || '').toLowerCase();
                          return loanName.includes(term) || loanId.includes(term) || loanPhone.includes(term);
                        });
                        return filteredLoans.length > 0 ? (
                          filteredLoans.map((loan) => (
                          <button
                            key={`loan-${loan._id || loan.id || loan.loanId}`}
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleLoanSelect(loan); }}
                            className={`w-full p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 text-left hover:scale-[1.01] ${
                              (formData.loanInfo?.id && (formData.loanInfo.id === (loan._id || loan.id || loan.loanId)))
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : (isDark ? 'border-gray-600 bg-gray-800 hover:border-blue-300' : 'border-gray-200 bg-white hover:border-blue-300')
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                                  <Receipt className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="text-left min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm truncate">
                                      {loan.customerName || loan.borrowerName || loan.fullName || loan.businessName || loan.tradeName || loan.ownerName || loan.name || 'Unknown'}
                                    </h3>
                                    <span className={`inline-block px-1.5 py-0.5 text-xs rounded-full ${
                                      (loan.loanDirection || loan.direction) === 'giving'
                                        ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                        : 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                                    }`}>
                                      {(loan.loanDirection || loan.direction) === 'giving' ? 'Giving' : 'Receiving'}
                                    </span>
                                  </div>
                                  {loan.loanId && (
                                    <p className="text-xs text-gray-500 dark:text-gray-500 truncate mt-1">
                                      ID: {loan.loanId}
                                    </p>
                                  )}
                                  {(loan.contactPhone || loan.customerPhone || loan.phone) && (
                                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                      📞 {loan.contactPhone || loan.customerPhone || loan.phone || loan.mobile || loan.mobileNumber || 'N/A'}
                                    </p>
                                  )}
                                  {(loan.totalAmount !== undefined || loan.totalDue !== undefined || loan.paidAmount !== undefined) && (
                                    <div className="flex items-center gap-2 mt-1 text-xs">
                                      {loan.totalAmount !== undefined && (
                                        <span className="text-gray-500 dark:text-gray-500">
                                          মোট: ৳{Number(loan.totalAmount || 0).toLocaleString('bn-BD')}
                                        </span>
                                      )}
                                      {loan.paidAmount !== undefined && (
                                        <span className="text-green-600 dark:text-green-400">
                                          পরিশোধ: ৳{Number(loan.paidAmount || 0).toLocaleString('bn-BD')}
                                        </span>
                                      )}
                                      {loan.totalDue !== undefined && (
                                        <span className="text-red-600 dark:text-red-400">
                                          বাকি: ৳{Number(loan.totalDue || 0).toLocaleString('bn-BD')}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                              {(formData.loanInfo?.id && (formData.loanInfo.id === (loan._id || loan.id || loan.loanId))) && (
                                <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                              )}
                            </div>
                          </button>
                        ))
                        ) : (
                          <div className="text-center py-6 sm:py-8 text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                            {searchTerm ? 'কোন লোন পাওয়া যায়নি' : 'কোন লোন নেই'}
                          </div>
                        );
                      })()
                    ) : effectiveSearchType === 'investment' ? (
                      // Investment Results - similar to haj and umrah
                      investmentData?.data?.length > 0 ? (
                        investmentData.data
                          .filter(investment => 
                            !searchTerm || 
                            (investment.name || investment.airlineName || investment.investmentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (investment.type || investment.investmentType || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (investment.airlineName || '').toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .map((investment) => (
                            <button
                              key={`investment-${investment.id || investment._id}`}
                              onClick={() => handleCustomerSelect({
                                id: investment.id || investment._id,
                                name: investment.name || investment.airlineName || investment.investmentName || 'Investment',
                                customerType: 'investment',
                                investmentInfo: investment
                              })}
                              className={`w-full p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 hover:scale-[1.02] ${
                                formData.customerId === String(investment.id || investment._id)
                                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                                  : 'border-gray-200 dark:border-gray-600 hover:border-emerald-300'
                              }`}
                            >
                              <div className="flex items-center space-x-3 sm:space-x-4">
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden flex-shrink-0 ${
                                  formData.customerId === String(investment.id || investment._id)
                                    ? 'bg-emerald-100 dark:bg-emerald-800'
                                    : 'bg-emerald-100 dark:bg-emerald-800'
                                }`}>
                                  {(() => {
                                    const logoUrl = investment.logo;
                                    return logoUrl ? (
                                      <img 
                                        src={logoUrl} 
                                        alt={investment.name || 'Investment'} 
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          e.target.style.display = 'none';
                                          e.target.nextSibling.style.display = 'flex';
                                        }}
                                      />
                                    ) : null;
                                  })()}
                                  <div className={`w-full h-full rounded-full flex items-center justify-center ${
                                    investment.logo ? 'hidden' : 'flex'
                                  }`}>
                                    <TrendingUp className={`w-5 h-5 sm:w-6 sm:h-6 ${
                                      formData.customerId === String(investment.id || investment._id)
                                        ? 'text-emerald-600 dark:text-emerald-400'
                                        : 'text-emerald-600 dark:text-emerald-400'
                                    }`} />
                                  </div>
                                </div>
                                <div className="text-left min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base break-words">
                                      {investment.name || investment.airlineName || investment.investmentName || 'Investment'}
                                    </h3>
                                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                      investment.investmentCategory === 'IATA & Airlines Capping'
                                        ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                        : 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                                    }`}>
                                      {investment.investmentCategory === 'IATA & Airlines Capping' ? 'IATA/Airlines' : 'Others'}
                                    </span>
                                  </div>
                                  {investment.type && (
                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                                      {investment.type || investment.investmentType}
                                    </p>
                                  )}
                                  {(investment.amount || investment.cappingAmount || investment.investmentAmount) && (
                                    <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                                      ৳{Number(investment.amount || investment.cappingAmount || investment.investmentAmount || 0).toLocaleString('bn-BD')}
                                    </p>
                                  )}
                                </div>
                                {formData.customerId === String(investment.id || investment._id) && (
                                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                )}
                              </div>
                            </button>
                          ))
                      ) : (
                        <div className="text-center py-6 sm:py-8 text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                          {searchTerm ? 'কোন বিনিয়োগ পাওয়া যায়নি' : 'কোন বিনিয়োগ নেই'}
                        </div>
                      )
                    ) : effectiveSearchType === 'asset' ? (
                      // Asset Results
                      assetsList.length > 0 ? (
                        assetsList
                          .filter(asset => 
                            !searchTerm || 
                            asset.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            asset.type?.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .map((asset) => (
                            <button
                              key={`asset-${asset.id || asset._id}`}
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleCustomerSelect({
                                  id: asset.id || asset._id,
                                  name: asset.name,
                                  customerType: 'asset',
                                  assetInfo: asset
                                });
                              }}
                              className={`w-full p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 text-left hover:scale-[1.01] ${
                                formData.customerId === String(asset.id || asset._id)
                                  ? 'border-slate-500 bg-slate-50 dark:bg-slate-900/20'
                                  : (isDark ? 'border-gray-600 bg-gray-800 hover:border-slate-300' : 'border-gray-200 bg-white hover:border-slate-300')
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 dark:bg-slate-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Package className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-400" />
                                  </div>
                                  <div className="text-left min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <h3 className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm truncate">
                                        {asset.name || 'সম্পদ'}
                                      </h3>
                                      {asset.type && (
                                        <span className="inline-block px-1.5 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-900/20 text-slate-700 dark:text-slate-400">
                                          {asset.type}
                                        </span>
                                      )}
                                    </div>
                                    {asset.providerCompanyName && (
                                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                        {asset.providerCompanyName}
                                      </p>
                                    )}
                                    {asset.totalPaidAmount > 0 && (
                                      <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                                        ৳{asset.totalPaidAmount.toLocaleString('bn-BD')}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                {formData.customerId === String(asset.id || asset._id) && (
                                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 flex-shrink-0" />
                                )}
                              </div>
                            </button>
                          ))
                      ) : (
                        <div className="text-center py-6 sm:py-8 text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                          {searchTerm ? 'কোন সম্পদ পাওয়া যায়নি' : 'কোন সম্পদ নেই'}
                        </div>
                      )
                    ) : effectiveSearchType === 'miraj' ? (
                      // Miraj Industries: show employees, income, and expense categories
                      (() => {
                        const filteredEmployees = mirajEmployees.filter(emp => {
                          if (!searchTerm) return true;
                          const term = searchTerm.toLowerCase();
                          return (emp.name || '').toLowerCase().includes(term) ||
                                 (emp.position || '').toLowerCase().includes(term) ||
                                 (emp.phone || '').includes(searchTerm);
                        });

                        // Filter incomes
                        const filteredIncomes = mirajIncomes.filter(item => {
                          if (!searchTerm) return true;
                          const term = searchTerm.toLowerCase();
                          const name = item.customer || item.source || '';
                          return name.toLowerCase().includes(term) ||
                                 (item.description || '').toLowerCase().includes(term);
                        });

                        // Filter expenses
                        const filteredExpenses = mirajExpenses.filter(item => {
                          if (!searchTerm) return true;
                          const term = searchTerm.toLowerCase();
                          const name = item.vendor || item.category || '';
                          return name.toLowerCase().includes(term) ||
                                 (item.description || '').toLowerCase().includes(term) ||
                                 (item.category || '').toLowerCase().includes(term);
                        });

                        const hasEmployees = filteredEmployees.length > 0;
                        const hasIncomes = filteredIncomes.length > 0;
                        const hasExpenses = filteredExpenses.length > 0;

                        if (!hasEmployees && !hasIncomes && !hasExpenses) {
                          return (
                            <div className="text-center py-6 sm:py-8 text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                              {searchTerm ? 'কোন আয়, খরচ বা কর্মচারী পাওয়া যায়নি' : 'কোন আয়, খরচ বা কর্মচারী নেই। মিরাজ ইন্ডাস্ট্রিজ থেকে যোগ করুন।'}
                            </div>
                          );
                        }

                        return (
                          <>
                            {/* Employees Section */}
                            {hasEmployees && (
                              <>
                                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                  কর্মচারী ব্যবস্থাপনা
                                </div>
                                {filteredEmployees.map((employee) => (
                                  <button
                                    key={`miraj-employee-${employee.id || employee._id}`}
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleCustomerSelect({
                                        id: employee.id || employee._id,
                                        name: employee.name || 'N/A',
                                        customerType: 'miraj-employee',
                                        phone: employee.phone || '',
                                        email: employee.email || '',
                                        address: employee.address || '',
                                        position: employee.position || '',
                                        department: employee.department || '',
                                        employeeId: employee.employeeId || employee.id || employee._id,
                                        // ✅ employeeReference automatically set করুন
                                        employeeReference: {
                                          id: employee.id || employee._id,
                                          name: employee.name || 'N/A',
                                          employeeId: employee.employeeId || employee.id || employee._id,
                                          position: employee.position || '',
                                          department: employee.department || ''
                                        }
                                      });
                                    }}
                                    className={`w-full p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 hover:scale-102 mb-2 ${
                                      formData.customerId === (employee.id || employee._id)
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                                          <User className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400" />
                                        </div>
                                        <div className="text-left min-w-0 flex-1">
                                          <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm truncate">
                                              {employee.name || 'N/A'}
                                            </h3>
                                          </div>
                                          {employee.position && (
                                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                              {employee.position}
                                            </p>
                                          )}
                                          {employee.phone && (
                                            <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                                              📞 {employee.phone}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                      {formData.customerId === (employee.id || employee._id) && (
                                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                                      )}
                                    </div>
                                  </button>
                                ))}
                              </>
                            )}

                            {/* Farm Income Section */}
                            {hasIncomes && (
                              <>
                                {(hasEmployees || hasExpenses) && (
                                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mt-4">
                                    আয়-খরচ (আয়)
                                  </div>
                                )}
                                {filteredIncomes.map((item) => (
                                  <button
                                    key={`miraj-income-${item.id}`}
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleCustomerSelect({
                                        id: item.id,
                                        name: item.customer || item.source || 'Income',
                                        customerType: 'miraj-income'
                                      });
                                    }}
                                    className={`w-full p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 hover:scale-102 mb-2 ${
                                      formData.customerId === item.id && formData.customerType === 'miraj-income'
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                                          <Receipt className="w-4 h-4 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div className="text-left min-w-0 flex-1">
                                          <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm truncate">
                                              {item.customer || item.source || 'Income'}
                                            </h3>
                                            <span className="inline-block px-1.5 py-0.5 text-xs rounded-full bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                                              আয়
                                            </span>
                                          </div>
                                          {item.description && (
                                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{item.description}</p>
                                          )}
                                        </div>
                                      </div>
                                      {typeof item.amount !== 'undefined' && (
                                        <div className="text-right">
                                          <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                                            +৳{Number(item.amount || 0).toLocaleString()}
                                          </p>
                                        </div>
                                      )}
                                      {formData.customerId === item.id && formData.customerType === 'miraj-income' && (
                                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0 ml-2" />
                                      )}
                                    </div>
                                  </button>
                                ))}
                              </>
                            )}

                            {/* Farm Expense Section */}
                            {hasExpenses && (
                              <>
                                {(hasEmployees || hasIncomes) && (
                                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mt-4">
                                    আয়-খরচ (খরচ)
                                  </div>
                                )}
                                {filteredExpenses.map((item) => (
                                  <button
                                    key={`miraj-expense-${item.id}`}
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleCustomerSelect({
                                        id: item.id,
                                        name: item.vendor || 'Expense',
                                        customerType: 'miraj-expense'
                                      });
                                    }}
                                    className={`w-full p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 hover:scale-102 mb-2 ${
                                      formData.customerId === item.id && formData.customerType === 'miraj-expense'
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                                          <Receipt className="w-4 h-4 text-red-600 dark:text-red-400" />
                                        </div>
                                        <div className="text-left min-w-0 flex-1">
                                          <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm truncate">
                                              {item.vendor || 'Expense'}
                                            </h3>
                                            <span className="inline-block px-1.5 py-0.5 text-xs rounded-full bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400">
                                              খরচ
                                            </span>
                                          </div>
                                          {item.description && (
                                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{item.description}</p>
                                          )}
                                        </div>
                                      </div>
                                      {typeof item.amount !== 'undefined' && (
                                        <div className="text-right">
                                          <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                                            -৳{Number(item.amount || 0).toLocaleString()}
                                          </p>
                                        </div>
                                      )}
                                      {formData.customerId === item.id && formData.customerType === 'miraj-expense' && (
                                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0 ml-2" />
                                      )}
                                    </div>
                                  </button>
                                ))}
                              </>
                            )}
                          </>
                        );
                      })()
                    ) : effectiveSearchType === 'personal' ? (
                      // Personal Expense Profiles - show as selectable cards
                      (() => {
                        const filteredProfiles = (personalExpenseProfiles || []).filter(profile => {
                          if (!searchTerm) return true;
                          const term = searchTerm.toLowerCase();
                          return (profile.name || '').toLowerCase().includes(term) ||
                                 (profile.mobile || '').includes(searchTerm) ||
                                 (profile.relationship || '').toLowerCase().includes(term);
                        });

                        return filteredProfiles.length > 0 ? (
                          filteredProfiles.map((profile) => (
                            <button
                              key={profile.id || profile._id}
                              type="button"
                              onClick={() => handleCustomerSelect({
                                id: profile.id || profile._id,
                                name: profile.name,
                                customerType: 'personal-expense',
                                personalExpenseProfileId: profile.id || profile._id
                              })}
                              className={`w-full p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 hover:scale-[1.02] ${
                                formData.customerId === (profile.id || profile._id)
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                  : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                              }`}
                            >
                              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 ${
                                  formData.customerId === (profile.id || profile._id)
                                    ? 'bg-blue-100 dark:bg-blue-800'
                                    : 'bg-pink-100 dark:bg-pink-900/20'
                                }`}>
                                  {profile.photo ? (
                                    <img src={profile.photo} alt={profile.name || 'Profile'} className="w-full h-full object-cover" />
                                  ) : (
                                    <User className={`w-5 h-5 sm:w-6 sm:h-6 ${
                                      formData.customerId === (profile.id || profile._id)
                                        ? 'text-blue-600 dark:text-blue-400'
                                        : 'text-pink-600 dark:text-pink-400'
                                    }`} />
                                  )}
                                </div>
                                <div className="text-left min-w-0 flex-1">
                                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                                    {profile.name || 'Unnamed'}
                                  </h3>
                                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                                    {profile.mobile || '—'}
                                  </p>
                                  {profile.relationship && (
                                    <p className="text-xs text-gray-500 dark:text-gray-500 truncate mt-1">
                                      সম্পর্ক: {profile.relationship}
                                    </p>
                                  )}
                                </div>
                                {formData.customerId === (profile.id || profile._id) && (
                                  <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                )}
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="text-center py-6 sm:py-8 text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                            {searchTerm ? 'কোন প্রোফাইল পাওয়া যায়নি' : 'কোন প্রোফাইল নেই'}
                          </div>
                        );
                      })()
                    ) : filteredCustomers.length > 0 && effectiveSearchType === 'airCustomer' ? (
                      filteredCustomers.map((customer) => (
                      <button
                          key={customer.id || customer.customerId}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleCustomerSelect(customer);
                          }}
                          className={`w-full p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 hover:scale-102 ${
                            formData.customerId === (customer.id || customer.customerId)
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                        }`}
                      >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="text-left min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm truncate">
                                    {customer.name}
                                  </h3>
                                  {customer.customerType === 'vendor' || customer.customerType === 'Vendor' ? (
                                    <span className="inline-block px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-xs rounded-full">
                                      Vendor
                                    </span>
                                  ) : customer.customerType === 'agent' || customer.customerType === 'Agent' ? (
                                    <span className="inline-block px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-xs rounded-full">
                                      Agent
                                    </span>
                                  ) : null}
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                  📞 {customer.mobile || customer.phone || customer.contactNo || 'N/A'}
                                </p>
                                {(customer.email) && (
                                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                    ✉️ {customer.email}
                                  </p>
                                )}
                                {(customer.address || customer.fullAddress) && (
                                  <p className="text-xs text-gray-500 dark:text-gray-500 truncate mt-1">
                                    📍 {customer.address || customer.fullAddress}
                                  </p>
                                )}
                                {customer.customerType && customer.customerType !== 'vendor' && customer.customerType !== 'Vendor' && customer.customerType !== 'agent' && customer.customerType !== 'Agent' && (
                                  <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs rounded-full mt-1">
                                    {customer.customerType}
                                  </span>
                                )}
                              </div>
                            </div>
                            {formData.customerId === (customer.id || customer.customerId) && (
                              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                            )}
                        </div>
                      </button>
                      ))
                    ) : (
                      <div className="text-center py-6 sm:py-8 text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                        {effectiveSearchType === 'airCustomer' ? (searchTerm ? 'কোন এয়ার কাস্টমার পাওয়া যায়নি' : 'কোন এয়ার কাস্টমার নেই') : 
                         effectiveSearchType === 'vendor' ? (searchTerm ? 'কোন ভেন্ডর পাওয়া যায়নি' : 'কোন ভেন্ডর নেই') : 
                         effectiveSearchType === 'agent' ? (searchTerm ? 'কোন এজেন্ট পাওয়া যায়নি' : 'কোন এজেন্ট নেই') :
                         effectiveSearchType === 'haji' ? (searchTerm ? 'কোন হাজি পাওয়া যায়নি' : 'কোন হাজি নেই') :
                          effectiveSearchType === 'umrah' ? (searchTerm ? 'কোন উমরাহ পাওয়া যায়নি' : 'কোন উমরাহ নেই') :
                          effectiveSearchType === 'loans' ? (searchTerm ? 'কোন লোন পাওয়া যায়নি' : 'কোন লোন নেই') :
                          effectiveSearchType === 'miraj' ? (searchTerm ? 'কোন আয়, খরচ বা কর্মচারী পাওয়া যায়নি' : 'কোন আয়, খরচ বা কর্মচারী নেই। মিরাজ ইন্ডাস্ট্রিজ থেকে যোগ করুন।') :
                          effectiveSearchType === 'moneyExchange' ? (moneyExchangeList.length === 0 ? 'কোন মানি এক্সচেঞ্জ ডেটা নেই' : 'লেনদেনের ধরন নির্বাচন করুন') :
                          effectiveSearchType === 'investment' ? (searchTerm ? 'কোন বিনিয়োগ পাওয়া যায়নি' : 'কোন বিনিয়োগ নেই') :
                          effectiveSearchType === 'asset' ? (searchTerm ? 'কোন সম্পদ পাওয়া যায়নি' : 'কোন সম্পদ নেই') :
                         'কোন ডেটা নেই'}
                      </div>
                    )}
                  </div>

                  {errors.customerId && (
                    <p className="text-red-500 text-center mt-3 sm:mt-4 flex items-center justify-center gap-2 text-xs sm:text-sm">
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      {errors.customerId}
                    </p>
                  )}

                {/* Selected customer's Loan IDs (hidden as per requirement) */}
                {false && formData.customerId && (
                  <div className="mt-4">
                    <h3 className={`text-sm sm:text-base font-semibold ${isDark ? 'text-gray-100' : 'text-gray-800'} mb-2`}>
                      নির্বাচিত কাস্টমারের লোন আইডি
                    </h3>
                    {customerLoansLoading ? (
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>লোড হচ্ছে...</span>
                      </div>
                    ) : customerLoans.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {customerLoans.map((loan) => (
                          <span
                            key={loan._id || loan.id || loan.loanId}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                          >
                            <Receipt className="w-3 h-3" />
                            {loan.loanId || loan.id || loan._id}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 dark:text-gray-400">কোনো লোন পাওয়া যায়নি</p>
                    )}
                  </div>
                )}
                </div>
              )}
            </div>
          )}
          {/* Step 4: Agent Balance Display (for credit with agent) or Hajji/Umrah Balance Display (for credit with hajji/umrah) or Invoice Selection (for credit with customer) or Account Manager Selection (for transfer) or Payment Method (for debit) */}
          {/* Skip step 4 for credit non-agent/hajji/umrah transactions - invoice selection is removed */}
          {currentStep === 4 && !(formData.transactionType === 'credit' && formData.customerType !== 'agent' && formData.customerType !== 'haji' && formData.customerType !== 'umrah') && (
            <div className="p-3 sm:p-4 lg:p-6">
              {formData.transactionType === 'credit' && formData.customerType === 'agent' ? (
                // Agent Balance Display
                <div className="text-center mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                    এজেন্টের ব্যালেন্স তথ্য
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    এজেন্টের বর্তমান ব্যালেন্স এবং বকেয়া পরিমাণ দেখুন
                  </p>
                </div>
              ) : formData.transactionType === 'credit' && (formData.customerType === 'haji' || formData.customerType === 'umrah') ? (
                // Hajji/Umrah Balance Display
                <div className="text-center mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {formData.customerType === 'haji' ? 'হাজ্বীর ব্যালেন্স তথ্য' : 'উমরাহ যাত্রীর ব্যালেন্স তথ্য'}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {formData.customerType === 'haji' ? 'হাজ্বীর বর্তমান ব্যালেন্স এবং বকেয়া পরিমাণ দেখুন' : 'উমরাহ যাত্রীর বর্তমান ব্যালেন্স এবং বকেয়া পরিমাণ দেখুন'}
                  </p>
                </div>
              ) : formData.transactionType === 'transfer' ? (
                // Transfer: Transfer Details and Account Manager Selection
                <div className="text-center mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                    ট্রান্সফার বিবরণ ও একাউন্ট ম্যানেজার নির্বাচন
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    ট্রান্সফার পরিমাণ লিখুন এবং অনুমোদনের জন্য একাউন্ট ম্যানেজার সিলেক্ট করুন
                  </p>
                </div>
              ) : formData.transactionType === 'debit' ? (
                // Debit: Payment Method Selection
                <div className="text-center mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                    পেমেন্ট মেথড নির্বাচন করুন
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    পেমেন্টের ধরন এবং বিবরণ নির্বাচন করুন
                  </p>
                </div>
              ) : (
                // Credit: Invoice Selection (only for agent, but this condition should not be reached)
                <div className="text-center mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                    ইনভয়েস নির্বাচন করুন
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    পেমেন্টের জন্য ইনভয়েস সিলেক্ট করুন
                  </p>
                </div>
              )}

              <div className="max-w-6xl mx-auto">
                {formData.transactionType === 'credit' && formData.customerType === 'agent' ? (
                  // Agent Balance Display
                  <div className="space-y-4 sm:space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 sm:p-6 border border-blue-200 dark:border-blue-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        {formData.customerPhoto ? (
                          <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
                            <img 
                              src={formData.customerPhoto} 
                              alt="Agent" 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div className="w-full h-full bg-blue-100 dark:bg-blue-900/20 hidden items-center justify-center">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                          </div>
                        ) : (
                          <User className="w-5 h-5 text-blue-600" />
                        )}
                        {formData.customerName} - ব্যালেন্স তথ্য
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Total Deposit */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">মোট ডিপোজিট</p>
                              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                ৳{Number(formData.agentDueInfo?.totalDeposit || 0).toLocaleString('bn-BD')}
                              </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                              <DollarSign className="w-6 h-6 text-green-600" />
                            </div>
                          </div>
                        </div>

                        {/* Total Due */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">মোট বকেয়া</p>
                              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                ৳{Number(formData.agentDueInfo?.totalDue || 0).toLocaleString('bn-BD')}
                              </p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                              <AlertCircle className="w-6 h-6 text-orange-600" />
                            </div>
                          </div>
                        </div>

                        {/* Umrah Due */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">উমরাহ বকেয়া</p>
                              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                ৳{Number(formData.agentDueInfo?.umrahDue || 0).toLocaleString('bn-BD')}
                              </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                              <Calendar className="w-6 h-6 text-purple-600" />
                            </div>
                          </div>
                        </div>

                        {/* Hajj Due */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">হজ্জ বকেয়া</p>
                              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                ৳{Number(formData.agentDueInfo?.hajDue || 0).toLocaleString('bn-BD')}
                              </p>
                            </div>
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                              <Building className="w-6 h-6 text-red-600" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                        <div className="flex items-start gap-3">
                          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-blue-800 dark:text-blue-200">
                            <p className="font-medium mb-1">ব্যালেন্স তথ্য সম্পর্কে:</p>
                            <ul className="space-y-1 text-xs">
                              <li>• মোট ব্যালেন্স: এজেন্টের সামগ্রিক ব্যালেন্স</li>
                              <li>• মোট বকেয়া: সমস্ত বকেয়া পরিমাণের যোগফল</li>
                              <li>• উমরাহ বকেয়া: উমরাহ প্যাকেজের জন্য বকেয়া</li>
                              <li>• হজ্জ বকেয়া: হজ্জ প্যাকেজের জন্য বকেয়া</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Selection Options */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 sm:p-6 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                          <Building className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                          নির্বাচন করুন
                        </h3>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                        {/* Hajj Option */}
                        <div 
                          className={`rounded-lg p-4 border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                            formData.selectedOption === 'hajj' 
                              ? 'bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-400 dark:border-amber-500 shadow-lg' 
                              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600'
                          }`}
                          onClick={() => setFormData(prev => ({ ...prev, selectedOption: 'hajj', selectedPackage: null, selectedPackageId: '' }))}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className={`text-sm font-medium ${
                                formData.selectedOption === 'hajj' 
                                  ? 'text-amber-700 dark:text-amber-300' 
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}>হজ্জ বাবদ</p>
                              <p className={`text-xs mt-1 ${
                                formData.selectedOption === 'hajj' 
                                  ? 'text-amber-600 dark:text-amber-400' 
                                  : 'text-gray-600 dark:text-gray-400'
                              }`}>হজ্জের জন্য পেমেন্ট</p>
                            </div>
                            <Building className={`w-6 h-6 ${
                              formData.selectedOption === 'hajj' 
                                ? 'text-amber-600 dark:text-amber-400' 
                                : 'text-gray-600 dark:text-gray-400'
                            }`} />
                          </div>
                        </div>
                        
                        {/* Umrah Option */}
                        <div 
                          className={`rounded-lg p-4 border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                            formData.selectedOption === 'umrah' 
                              ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-400 dark:border-blue-500 shadow-lg' 
                              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600'
                          }`}
                          onClick={() => setFormData(prev => ({ ...prev, selectedOption: 'umrah', selectedPackage: null, selectedPackageId: '' }))}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className={`text-sm font-medium ${
                                formData.selectedOption === 'umrah' 
                                  ? 'text-blue-700 dark:text-blue-300' 
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}>উমরাহ বাবদ</p>
                              <p className={`text-xs mt-1 ${
                                formData.selectedOption === 'umrah' 
                                  ? 'text-blue-600 dark:text-blue-400' 
                                  : 'text-gray-600 dark:text-gray-400'
                              }`}>উমরাহর জন্য পেমেন্ট</p>
                            </div>
                            <Globe className={`w-6 h-6 ${
                              formData.selectedOption === 'umrah' 
                                ? 'text-blue-600 dark:text-blue-400' 
                                : 'text-gray-600 dark:text-gray-400'
                            }`} />
                          </div>
                        </div>
                        
                        {/* Others Option */}
                        <div 
                          className={`rounded-lg p-4 border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                            formData.selectedOption === 'others' 
                              ? 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 border-gray-400 dark:border-gray-500 shadow-lg' 
                              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600'
                          }`}
                          onClick={() => setFormData(prev => ({ ...prev, selectedOption: 'others', selectedPackage: null, selectedPackageId: '' }))}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className={`text-sm font-medium ${
                                formData.selectedOption === 'others' 
                                  ? 'text-gray-700 dark:text-gray-300' 
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}>অনন্যা বাবদ</p>
                              <p className={`text-xs mt-1 ${
                                formData.selectedOption === 'others' 
                                  ? 'text-gray-600 dark:text-gray-400' 
                                  : 'text-gray-600 dark:text-gray-400'
                              }`}>অন্যান্য পেমেন্ট</p>
                            </div>
                            <DollarSign className={`w-6 h-6 ${
                              formData.selectedOption === 'others' 
                                ? 'text-gray-600 dark:text-gray-400' 
                                : 'text-gray-600 dark:text-gray-400'
                            }`} />
                          </div>
                        </div>
                      </div>
                      
                      {/* Error Display */}
                      {errors.selectedOption && (
                        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {errors.selectedOption}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : formData.transactionType === 'credit' && (formData.customerType === 'haji' || formData.customerType === 'umrah') ? (
                  // Hajji/Umrah Balance Display
                  <div className="space-y-4 sm:space-y-6">
                    {(hajjiDetailLoading || umrahDetailLoading || hajjiFamilyLoading) ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        <span className="ml-3 text-gray-600 dark:text-gray-400">লোড হচ্ছে...</span>
                      </div>
                    ) : (
                      <>
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 sm:p-6 border border-blue-200 dark:border-blue-700">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-600" />
                            {formData.customerName} - ব্যালেন্স তথ্য
                          </h3>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Total Amount */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">মোট বিল</p>
                                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    ৳{Number(
                                      formData.customerType === 'haji' 
                                        ? (hajjiDetail?.totalAmount || 0)
                                        : (umrahDetail?.totalAmount || umrahDetail?.displayTotalAmount || 0)
                                    ).toLocaleString('bn-BD')}
                                  </p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                  <DollarSign className="w-6 h-6 text-blue-600" />
                                </div>
                              </div>
                            </div>

                            {/* Paid Amount */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">পরিশোধিত</p>
                                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    ৳{Number(
                                      formData.customerType === 'haji'
                                        ? (hajjiDetail?.paidAmount || 0)
                                        : (umrahDetail?.paidAmount || umrahDetail?.displayPaidAmount || 0)
                                    ).toLocaleString('bn-BD')}
                                  </p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                  <CheckCircle className="w-6 h-6 text-green-600" />
                                </div>
                              </div>
                            </div>

                            {/* Total Due */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">মোট বকেয়া</p>
                                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                    ৳{Number(
                                      formData.customerType === 'haji'
                                        ? (hajjiDetail?.due || 0)
                                        : (umrahDetail?.due || umrahDetail?.displayDue || 0)
                                    ).toLocaleString('bn-BD')}
                                  </p>
                                </div>
                                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                                  <AlertCircle className="w-6 h-6 text-orange-600" />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Family Summary for Hajji */}
                          {formData.customerType === 'haji' && hajjiFamilySummary && (hajjiFamilySummary.members?.length > 0 || hajjiFamilySummary.familyTotal > 0) && (
                            <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <Users className="w-4 h-4 text-purple-600" />
                                পরিবারের তথ্য
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">পরিবারের মোট</p>
                                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                                    ৳{Number(hajjiFamilySummary.familyTotal || 0).toLocaleString('bn-BD')}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">পরিবারের পরিশোধিত</p>
                                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                    ৳{Number(hajjiFamilySummary.familyPaid || 0).toLocaleString('bn-BD')}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">পরিবারের বকেয়া</p>
                                  <p className="text-lg font-bold text-red-600 dark:text-red-400">
                                    ৳{Number(hajjiFamilySummary.familyDue || 0).toLocaleString('bn-BD')}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Relations Display */}
                          {formData.customerType === 'haji' && hajjiFamilySummary && hajjiFamilySummary.members && hajjiFamilySummary.members.length > 0 && (
                            <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-700">
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <Users className="w-4 h-4 text-indigo-600" />
                                লিঙ্ক করা হাজ্বী ({hajjiFamilySummary.members.length} জন)
                              </h4>
                              <div className="space-y-2 max-h-48 overflow-y-auto">
                                {hajjiFamilySummary.members.map((member, idx) => (
                                  <div key={member._id || member.id || idx} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {member.name || `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'N/A'}
                                      </p>
                                      <p className="text-xs text-gray-600 dark:text-gray-400">
                                        {member.mobile || member.phone || 'N/A'} | {member.relationType || 'সম্পর্ক'}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs text-gray-600 dark:text-gray-400">বকেয়া</p>
                                      <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                                        ৳{Number(member.due || 0).toLocaleString('bn-BD')}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                            <div className="flex items-start gap-3">
                              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                              <div className="text-sm text-blue-800 dark:text-blue-200">
                                <p className="font-medium mb-1">ব্যালেন্স তথ্য সম্পর্কে:</p>
                                <ul className="space-y-1 text-xs">
                                  <li>• মোট বিল: {formData.customerType === 'haji' ? 'হাজ্বীর' : 'উমরাহ যাত্রীর'} মোট বিল পরিমাণ</li>
                                  <li>• পরিশোধিত: {formData.customerType === 'haji' ? 'হাজ্বীর' : 'উমরাহ যাত্রীর'} পরিশোধিত পরিমাণ</li>
                                  <li>• মোট বকেয়া: {formData.customerType === 'haji' ? 'হাজ্বীর' : 'উমরাহ যাত্রীর'} মোট বকেয়া পরিমাণ</li>
                                  {formData.customerType === 'haji' && <li>• হজ্জ বকেয়া: হজ্জ প্যাকেজের জন্য বকেয়া</li>}
                                  {formData.customerType === 'haji' && hajjiFamilySummary?.members?.length > 0 && <li>• লিঙ্ক করা হাজ্বী: এই হাজ্বীর একাউন্টে যুক্ত হাজ্বীদের তালিকা</li>}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : formData.transactionType === 'transfer' ? (
                  // Transfer: Transfer Details first, then Account Manager Selection
                  <div className="space-y-4 sm:space-y-6">
                    {/* Transfer Amount Input */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 sm:p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        ট্রান্সফার বিবরণ
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            ট্রান্সফার পরিমাণ *
                          </label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="number"
                              name="transferAmount"
                              value={formData.transferAmount}
                              onChange={handleInputChange}
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                              className={`w-full pl-10 pr-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                                isDark 
                                  ? 'bg-white border-gray-300 text-gray-900' 
                                  : 'border-gray-300'
                              } ${errors.transferAmount ? 'border-red-500 focus:ring-red-500' : ''}`}
                            />
                          </div>
                          {errors.transferAmount && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.transferAmount}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            চার্জ (Charge)
                          </label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="number"
                              name="transferCharge"
                              value={formData.transferCharge}
                              onChange={handleInputChange}
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                              className={`w-full pl-10 pr-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                                isDark 
                                  ? 'bg-white border-gray-300 text-gray-900' 
                                  : 'border-gray-300'
                              } ${errors.transferCharge ? 'border-red-500 focus:ring-red-500' : ''}`}
                            />
                          </div>
                          {errors.transferCharge && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.transferCharge}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          একাউন্ট ম্যানেজার নির্বাচন
                          </label>
                          
                          {/* Account Manager Search Bar */}
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              placeholder="একাউন্ট ম্যানেজার খুঁজুন... (নাম, পদবী, ফোন, ইমেইল)"
                              value={accountManagerSearchTerm}
                              onChange={(e) => setAccountManagerSearchTerm(e.target.value)}
                              className={`w-full pl-10 pr-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                                isDark 
                                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                  : 'border-gray-300'
                              }`}
                            />
                          </div>

                          {/* Account Manager List */}
                          {accountManagerSearchTerm && (
                            <div className="mt-2 space-y-2 max-h-60 overflow-y-auto border rounded-lg p-2">
                              {employeeLoading ? (
                                <div className="flex items-center justify-center py-4">
                                  <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                                  <span className="ml-2 text-gray-600 dark:text-gray-400">খুঁজছি...</span>
                                </div>
                              ) : employeeSearchError ? (
                                <div className="text-center py-4 text-red-500 dark:text-red-400 text-sm">
                                  <div className="flex items-center justify-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>খোঁজার সময় সমস্যা হয়েছে। আবার চেষ্টা করুন।</span>
                                  </div>
                                </div>
                              ) : employeeSearchResults.length === 0 ? (
                                <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                                  {accountManagerSearchTerm ? 'কোনো একাউন্ট ম্যানেজার পাওয়া যায়নি' : 'একাউন্ট ম্যানেজার খুঁজতে টাইপ করুন'}
                                </div>
                              ) : (
                                employeeSearchResults.map((employee) => (
                                  <button
                                    key={employee._id || employee.id}
                                    onClick={() => handleAccountManagerSelect(employee)}
                                    className={`w-full p-3 rounded-lg border-2 transition-all duration-200 hover:scale-[1.01] ${
                                      formData.accountManager?.id === employee._id
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                                    }`}
                                  >
                                    <div className="flex items-center space-x-3">
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                        formData.accountManager?.id === employee._id
                                          ? 'bg-blue-100 dark:bg-blue-800'
                                          : 'bg-gray-100 dark:bg-gray-700'
                                      }`}>
                                        <User className={`w-5 h-5 ${
                                          formData.accountManager?.id === employee._id
                                            ? 'text-blue-600 dark:text-blue-400'
                                            : 'text-gray-600 dark:text-gray-400'
                                        }`} />
                                      </div>
                                      <div className="flex-1 text-left">
                                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                          {employee.name || `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'নাম নেই'}
                                        </h4>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                          {employee.designation || employee.position || 'পদবী নেই'}
                                        </p>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                          {(employee.phone || employee.phoneNumber) && (
                                            <span className="text-xs text-blue-600 dark:text-blue-400">
                                              📞 {employee.phone || employee.phoneNumber}
                                            </span>
                                          )}
                                          {(employee.email || employee.emailAddress) && (
                                            <span className="text-xs text-green-600 dark:text-green-400">
                                              ✉️ {employee.email || employee.emailAddress}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      {formData.accountManager?.id === employee._id && (
                                        <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                      )}
                                    </div>
                                  </button>
                                ))
                              )}
                            </div>
                          )}

                          {/* Selected Account Manager Display */}
                          {formData.accountManager?.name && !accountManagerSearchTerm && (
                            <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                                    <User className="w-5 h-5 text-green-600 dark:text-green-400" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                      {formData.accountManager.name}
                                    </h4>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                      {formData.accountManager.designation}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => setFormData(prev => ({ ...prev, accountManager: { id: '', name: '', phone: '', email: '' } }))}
                                  className="text-red-500 hover:text-red-700 text-sm"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : formData.transactionType === 'debit' ? (
                  // Debit: Payment Method Selection
                  <div className="space-y-4 sm:space-y-6">
                    {/* Payment Method Selection */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 sm:p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                        পেমেন্ট মেথড
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {paymentMethods.map((method) => (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method.id }))}
                            className={`p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                              formData.paymentMethod === method.id
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                            }`}
                          >
                            <div className="text-center">
                              <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r ${method.color} rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3`}>
                                <method.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                              </div>
                              <h3 className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm">
                                {method.name}
                              </h3>
                            </div>
                          </button>
                        ))}
                      </div>
                      {errors.paymentMethod && (
                        <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.paymentMethod}
                        </p>
                      )}
                    </div>

                    {/* Account Selection */}
                    {selectedPaymentMethod && (
                      <div className="mb-4 sm:mb-6">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-blue-600" />
                          অ্যাকাউন্ট নির্বাচন
                        </h3>
                        
                        <div className={`grid gap-3 sm:gap-4 ${
                          formData.transactionType === 'debit' && formData.customerType === 'vendor' && formData.customerId
                            ? 'grid-cols-1 md:grid-cols-2'
                            : 'grid-cols-1'
                        }`}>
                          {/* Source Account */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                              আমাদের অ্যাকাউন্ট (যেখান থেকে টাকা পাঠানো হবে) *
                            </label>
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input
                                type="text"
                                placeholder="অ্যাকাউন্ট খুঁজুন..."
                                value={accountSearchTerm}
                                onChange={(e) => setAccountSearchTerm(e.target.value)}
                                className={`w-full pl-10 pr-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                                  isDark 
                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                    : 'border-gray-300'
                                }`}
                              />
                            </div>
                            
                            {/* Account Selection Dropdown */}
                            <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                              {accountsLoading ? (
                                <div className="flex items-center justify-center py-4">
                                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">অ্যাকাউন্ট লোড হচ্ছে...</span>
                                </div>
                              ) : filteredAccounts.length > 0 ? (
                                filteredAccounts.map((account) => (
                                  <button
                                    key={account.id}
                                    type="button"
                                    onClick={() => {
                                      setFormData(prev => ({
                                        ...prev,
                                        sourceAccount: {
                                          id: account.id,
                                          name: account.name,
                                          bankName: account.bankName,
                                          accountNumber: account.accountNumber,
                                          balance: account.balance
                                        }
                                      }));
                                      setErrors(prev => ({ ...prev, sourceAccount: '' }));
                                    }}
                                    className={`w-full p-3 text-left rounded-lg border transition-all duration-200 hover:scale-102 ${
                                      formData.sourceAccount.id === account.id
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                                    }`}
                                  >
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                                          {account.name}
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                          {account.bankName} - {account.accountNumber}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                          ৳{account.balance.toLocaleString()}
                                        </p>
                                      </div>
                                    </div>
                                  </button>
                                ))
                              ) : (
                                <div className="text-center py-4">
                                  <p className="text-gray-500 dark:text-gray-400 text-sm">কোন অ্যাকাউন্ট পাওয়া যায়নি</p>
                                </div>
                              )}
                            </div>
                            
                            {errors.sourceAccount && (
                              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors.sourceAccount}
                              </p>
                            )}
                          </div>

                          {/* Vendor Bank Accounts - Only show when vendor is selected for debit */}
                          {formData.transactionType === 'debit' && formData.customerType === 'vendor' && formData.customerId && (
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                ভেন্ডরের ব্যাংক অ্যাকাউন্ট
                              </label>
                              <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                                {vendorBankAccountsLoading ? (
                                  <div className="flex items-center justify-center py-4">
                                    <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">ব্যাংক অ্যাকাউন্ট লোড হচ্ছে...</span>
                                  </div>
                                ) : vendorBankAccounts.length > 0 ? (
                                  vendorBankAccounts.map((bankAccount) => (
                                    <div
                                      key={bankAccount._id}
                                      className={`w-full p-3 rounded-lg border transition-all duration-200 ${
                                        formData.paymentDetails.vendorBankAccountId === bankAccount._id
                                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                          : 'border-gray-200 dark:border-gray-600'
                                      }`}
                                    >
                                      <div className="flex justify-between items-center">
                                        <div className="flex-1">
                                          <p className="font-medium text-gray-900 dark:text-white text-sm">
                                            {bankAccount.bankName}
                                          </p>
                                          <p className="text-xs text-gray-600 dark:text-gray-400">
                                            A/C: {bankAccount.accountNumber}
                                          </p>
                                          {bankAccount.branchName && (
                                            <p className="text-xs text-gray-500 dark:text-gray-500">
                                              Branch: {bankAccount.branchName}
                                            </p>
                                          )}
                                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                            {bankAccount.accountHolder}
                                          </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          {bankAccount.isPrimary && (
                                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                                              Primary
                                            </span>
                                          )}
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setFormData(prev => ({
                                                ...prev,
                                                paymentDetails: {
                                                  ...prev.paymentDetails,
                                                  vendorBankAccountId: bankAccount._id,
                                                  vendorBankName: bankAccount.bankName,
                                                  vendorAccountNumber: bankAccount.accountNumber,
                                                  vendorBranchName: bankAccount.branchName || '',
                                                  vendorAccountHolder: bankAccount.accountHolder
                                                }
                                              }));
                                            }}
                                            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                              formData.paymentDetails.vendorBankAccountId === bankAccount._id
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-purple-600 hover:text-white'
                                            }`}
                                          >
                                            {formData.paymentDetails.vendorBankAccountId === bankAccount._id ? 'Selected' : 'Select'}
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-center py-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">কোন ব্যাংক অ্যাকাউন্ট পাওয়া যায়নি</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Account Manager Selection for Debit - Shown only at Step 5 (confirmation) */}

                    {/* Payment Details */}
                    {selectedPaymentMethod && formData.sourceAccount.id && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 sm:p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <selectedPaymentMethod.icon className="w-5 h-5 text-blue-600" />
                          {selectedPaymentMethod.name}
                        </h3>
                        
                        <div className="space-y-4">
                          {/* Amount */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                              পরিমাণ *
                            </label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input
                                type="number"
                                placeholder="পরিমাণ লিখুন..."
                                value={formData.paymentDetails.amount}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  paymentDetails: { ...prev.paymentDetails, amount: e.target.value }
                                }))}
                                className={`w-full pl-10 pr-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                                  isDark 
                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                    : 'border-gray-300'
                                }`}
                              />
                            </div>
                            {errors.amount && (
                              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors.amount}
                              </p>
                            )}
                          </div>

                          {/* Charge Field - For cash, bank-transfer, cheque, and mobile-banking */}
                          {(formData.paymentMethod === 'cash' || formData.paymentMethod === 'bank-transfer' || formData.paymentMethod === 'cheque' || formData.paymentMethod === 'mobile-banking') && (
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                চার্জ
                              </label>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                  type="number"
                                  placeholder="চার্জ লিখুন..."
                                  value={formData.paymentDetails.charge || ''}
                                  onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    paymentDetails: { ...prev.paymentDetails, charge: e.target.value }
                                  }))}
                                  min="0"
                                  step="0.01"
                                  className={`w-full pl-10 pr-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                                    isDark 
                                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                      : 'border-gray-300'
                                  }`}
                                />
                              </div>
                            </div>
                          )}

                          {/* Total Amount Summary */}
                          {formData.paymentDetails.amount && (
                            <div>
                              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-3 sm:p-4 border border-blue-200 dark:border-blue-800">
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">পরিমাণ:</span>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                      ৳{parseFloat(formData.paymentDetails.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                  </div>
                                  {formData.paymentDetails.charge && parseFloat(formData.paymentDetails.charge || 0) > 0 && (
                                    <>
                                      <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">চার্জ:</span>
                                        <span className={`text-sm font-semibold ${
                                          getChargeWithSign() < 0 
                                            ? 'text-red-600 dark:text-red-400' 
                                            : 'text-green-600 dark:text-green-400'
                                        }`}>
                                          {getChargeWithSign() < 0 ? '-' : '+'}৳{Math.abs(getChargeWithSign()).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center pt-2 border-t border-blue-200 dark:border-blue-700">
                                        <span className="text-base font-bold text-gray-900 dark:text-white">মোট পরিমাণ:</span>
                                        <span className="text-base font-bold text-blue-600 dark:text-blue-400">
                                          ৳{getTotalAmount().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Dynamic Fields based on Payment Method */}
                          {selectedPaymentMethod.fields
                            .filter(field => {
                              // For vendor debit transactions, remove bankName and accountNumber from bank-transfer
                              if (formData.transactionType === 'debit' && formData.customerType === 'vendor' && formData.customerId) {
                                if (formData.paymentMethod === 'bank-transfer') {
                                  return field !== 'bankName' && field !== 'accountNumber';
                                }
                              }
                              return true;
                            })
                            .map((field) => (
                            <div key={field}>
                              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                {field === 'bankName' && 'ব্যাংকের নাম'}
                                {field === 'accountNumber' && 'অ্যাকাউন্ট নম্বর'}
                                {field === 'cardNumber' && 'কার্ড নম্বর'}
                                {field === 'chequeNumber' && 'চেক নম্বর'}
                                {field === 'mobileProvider' && 'মোবাইল প্রোভাইডার'}
                                {field === 'transactionId' && 'ট্রানজেকশন আইডি'}
                                {field === 'reference' && 'রেফারেন্স'}
                                {field !== 'reference' && ' *'}
                              </label>
                              <input
                                type="text"
                                placeholder={getPaymentFieldPlaceholder(field)}
                                value={formData.paymentDetails[field] || ''}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  paymentDetails: { ...prev.paymentDetails, [field]: e.target.value }
                                }))}
                                className={`w-full px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                                  isDark 
                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                    : 'border-gray-300'
                                }`}
                              />
                              {errors[field] && (
                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  {errors[field]}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Credit: Invoice Selection
                  <div className="space-y-4 sm:space-y-6">
                    {/* Invoice Selection */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 sm:p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-green-600" />
                        ইনভয়েস তালিকা
                        {isUsingDemoInvoices && (
                          <span className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
                            ডেমো ডেটা
                          </span>
                        )}
                      </h3>
                      
                      <div className="space-y-3">
                        {invoicesError ? (
                          <div className="text-center py-8 text-red-500">
                            <AlertCircle className="w-8 h-8 mx-auto mb-3" />
                            <p>ইনভয়েস লোড করতে সমস্যা হয়েছে</p>
                          </div>
                        ) : (
                          <>
                            {invoicesLoading && formData.customerId && (
                              <div className="text-center py-2 text-blue-500 dark:text-blue-400">
                                <Loader2 className="w-4 h-4 mx-auto mb-1 animate-spin inline" />
                                <p className="text-sm">লাইভ ডেটা লোড হচ্ছে...</p>
                              </div>
                            )}
                            {filteredInvoices.length > 0 ? (
                          filteredInvoices.map((invoice) => (
                            <button
                              key={invoice.id || invoice._id}
                              type="button"
                              onClick={() => handleInvoiceSelect(invoice)}
                              className={`w-full p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 hover:scale-102 ${
                                formData.selectedInvoice?.id === (invoice.id || invoice._id)
                                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                  : 'border-gray-200 dark:border-gray-600 hover:border-green-300'
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <div className="text-left">
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    ইনভয়েস #{invoice.invoiceNumber || invoice.invoiceId}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    পরিমাণ: ৳{(invoice.amount || 0).toLocaleString()}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-US') : 
                                     invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString('en-US') : 
                                     'তারিখ নেই'}
                                  </p>
                                </div>
                              </div>
                            </button>
                          ))
                            ) : (
                              <div className="text-center py-8">
                                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500 dark:text-gray-400">কোন ইনভয়েস পাওয়া যায়নি</p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      {isUsingDemoInvoices && (
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            <span>
                              <strong>ডেমো ডেটা:</strong> এই ইনভয়েসগুলো শুধুমাত্র প্রদর্শনের জন্য। 
                              {formData.customerId ? ' নির্বাচিত কাস্টমারের জন্য কোন ইনভয়েস পাওয়া যায়নি।' : ' কোন কাস্টমার নির্বাচন করা হয়নি।'}
                            </span>
                          </p>
                        </div>
                      )}
                      {errors.invoiceId && (
                        <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.invoiceId}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Invoice Selection (for credit with agent) - HIDDEN FOR AGENTS */}
          {false && currentStep === 5 && formData.transactionType === 'credit' && formData.customerType === 'agent' && (
            <div className="p-3 sm:p-4 lg:p-6">
              <div className="text-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                  ইনভয়েস নির্বাচন করুন
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  পেমেন্টের জন্য ইনভয়েস সিলেক্ট করুন
                </p>
              </div>

              <div className="max-w-6xl mx-auto">
                <div className="space-y-4 sm:space-y-6">
                  {/* Invoice Selection */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-green-600" />
                      ইনভয়েস তালিকা
                      {isUsingDemoInvoices && (
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
                          ডেমো ডেটা
                        </span>
                      )}
                    </h3>
                    
                    <div className="space-y-3">
                      {invoicesError ? (
                        <div className="text-center py-8 text-red-500">
                          <AlertCircle className="w-8 h-8 mx-auto mb-3" />
                          <p>ইনভয়েস লোড করতে সমস্যা হয়েছে</p>
                        </div>
                      ) : (
                        <>
                          {invoicesLoading && formData.customerId && (
                            <div className="text-center py-2 text-blue-500 dark:text-blue-400">
                              <Loader2 className="w-4 h-4 mx-auto mb-1 animate-spin inline" />
                              <p className="text-sm">লাইভ ডেটা লোড হচ্ছে...</p>
                            </div>
                          )}
                          {filteredInvoices.length > 0 ? (
                        filteredInvoices.map((invoice) => (
                          <button
                            key={invoice.id || invoice._id}
                            type="button"
                            onClick={() => handleInvoiceSelect(invoice)}
                            className={`w-full p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 hover:scale-102 ${
                              formData.selectedInvoice?.id === (invoice.id || invoice._id)
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                : 'border-gray-200 dark:border-gray-600 hover:border-green-300'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <div className="text-left">
                                <p className="font-medium text-gray-900 dark:text-white">
                                  ইনভয়েস #{invoice.invoiceNumber || invoice.invoiceId}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  পরিমাণ: ৳{(invoice.amount || 0).toLocaleString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-US') : 
                                   invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString('en-US') : 
                                   'তারিখ নেই'}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))
                          ) : (
                            <div className="text-center py-8">
                              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                              <p className="text-gray-500 dark:text-gray-400">কোন ইনভয়েস পাওয়া যায়নি</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    {isUsingDemoInvoices && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
                          <Info className="w-4 h-4" />
                          <span>
                            <strong>ডেমো ডেটা:</strong> এই ইনভয়েসগুলো শুধুমাত্র প্রদর্শনের জন্য। 
                            {formData.customerId ? ' নির্বাচিত কাস্টমারের জন্য কোন ইনভয়েস পাওয়া যায়নি।' : ' কোন কাস্টমার নির্বাচন করা হয়নি।'}
                          </span>
                        </p>
                      </div>
                    )}
                    {errors.invoiceId && (
                      <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.invoiceId}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Step 5: Invoice Selection (for credit with customer) or Account Manager Selection (for transfer) or Payment Method (for debit) - REMOVED - DUPLICATE */}
          {false && currentStep === 5 && !(formData.transactionType === 'credit' && formData.customerType === 'agent') && (
            <div className="p-3 sm:p-4 lg:p-6">
              {formData.transactionType === 'transfer' ? (
                // Transfer: Transfer Details and Account Manager Selection
                <div className="text-center mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                    ট্রান্সফার বিবরণ ও একাউন্ট ম্যানেজার নির্বাচন
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    ট্রান্সফার পরিমাণ লিখুন এবং অনুমোদনের জন্য একাউন্ট ম্যানেজার সিলেক্ট করুন
                  </p>
                </div>
              ) : formData.transactionType === 'debit' ? (
                // Debit: Payment Method Selection
                <div className="text-center mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                    পেমেন্ট মেথড নির্বাচন করুন
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    পেমেন্টের ধরন এবং বিবরণ নির্বাচন করুন
                  </p>
                </div>
              ) : (
                // Credit: Invoice Selection
                <div className="text-center mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                    ইনভয়েস নির্বাচন করুন
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    পেমেন্টের জন্য ইনভয়েস সিলেক্ট করুন
                  </p>
                </div>
              )}

              <div className="max-w-6xl mx-auto">
                {formData.transactionType === 'transfer' ? (
                  // Transfer: Transfer Details first, then Account Manager Selection
                  <div className="space-y-4 sm:space-y-6">
                    {/* Transfer Amount Input */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 sm:p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        ট্রান্সফার বিবরণ
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            ট্রান্সফার পরিমাণ *
                          </label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="number"
                              name="transferAmount"
                              value={formData.transferAmount}
                              onChange={handleInputChange}
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                              className={`w-full pl-10 pr-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                                isDark 
                                  ? 'bg-white border-gray-300 text-gray-900' 
                                  : 'border-gray-300'
                              } ${errors.transferAmount ? 'border-red-500 focus:ring-red-500' : ''}`}
                            />
                          </div>
                          {errors.transferAmount && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.transferAmount}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            রেফারেন্স নোট
                          </label>
                          <input
                            type="text"
                            name="transferReference"
                            value={formData.transferReference}
                            onChange={handleInputChange}
                            placeholder="ট্রান্সফার রেফারেন্স..."
                            className={`w-full px-3 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                              isDark 
                                ? 'bg-white border-gray-300 text-gray-900' 
                                : 'border-gray-300'
                            }`}
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          ট্রান্সফার নোট
                        </label>
                        <textarea
                          name="transferNotes"
                          value={formData.transferNotes}
                          onChange={handleInputChange}
                          placeholder="ট্রান্সফার সম্পর্কে অতিরিক্ত নোট..."
                          rows={3}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm resize-none ${
                            isDark 
                              ? 'bg-white border-gray-300 text-gray-900' 
                              : 'border-gray-300'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Account Manager Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="একাউন্ট ম্যানেজার খুঁজুন... (নাম, পদবী, ফোন, ইমেইল)"
                        value={accountManagerSearchTerm}
                        onChange={(e) => setAccountManagerSearchTerm(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'border-gray-300'
                        }`}
                      />
                    </div>

                    {/* Account Manager List */}
                    {accountManagerSearchTerm && (
                      <div className="mt-2 space-y-2 max-h-60 overflow-y-auto border rounded-lg p-2">
                        {employeeLoading ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                            <span className="ml-2 text-gray-600 dark:text-gray-400">খুঁজছি...</span>
                          </div>
                        ) : employeeSearchError ? (
                          <div className="text-center py-4 text-red-500 dark:text-red-400 text-sm">
                            <AlertCircle className="w-5 h-5 mx-auto mb-2" />
                            <p>{typeof employeeSearchError === 'string' ? employeeSearchError : employeeSearchError.message || 'কর্মচারী লোড করতে সমস্যা হয়েছে'}</p>
                          </div>
                        ) : employeeSearchResults.length === 0 ? (
                          <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                            {accountManagerSearchTerm ? 'কোনো কর্মচারী পাওয়া যায়নি' : 'কর্মচারী খুঁজতে টাইপ করুন'}
                          </div>
                        ) : (
                          employeeSearchResults.slice(0, 20).map((employee) => (
                            <button
                              key={employee._id || employee.id}
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault(); // Prevent input blur
                                handleAccountManagerSelect(employee);
                                setShowAccountManagerDropdown(false);
                                setAccountManagerSearchTerm(employee.name);
                              }}
                              className={`w-full p-3 rounded-lg border-2 transition-all duration-200 hover:scale-[1.01] ${
                                formData.accountManager?.id === employee._id
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                  : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  formData.accountManager?.id === employee._id
                                    ? 'bg-blue-100 dark:bg-blue-800'
                                    : 'bg-gray-100 dark:bg-gray-700'
                                }`}>
                                  <User className={`w-5 h-5 ${
                                    formData.accountManager?.id === employee._id
                                      ? 'text-blue-600 dark:text-blue-400'
                                      : 'text-gray-600 dark:text-gray-400'
                                  }`} />
                                </div>
                                <div className="flex-1 text-left">
                                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                    {employee.name}
                                  </h4>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {employee.designation}
                                  </p>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {employee.phone && (
                                      <span className="text-xs text-blue-600 dark:text-blue-400">
                                        📞 {employee.phone}
                                      </span>
                                    )}
                                    {employee.email && (
                                      <span className="text-xs text-green-600 dark:text-green-400">
                                        ✉️ {employee.email}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {formData.accountManager?.id === employee._id && (
                                  <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                )}
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}

                    {/* Selected Account Manager Display */}
                    {formData.accountManager?.name && !showAccountManagerDropdown && (
                      <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                              <User className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                {formData.accountManager.name}
                              </h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {formData.accountManager.designation}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setFormData(prev => ({ ...prev, accountManager: { id: '', name: '', phone: '', email: '' } }));
                              setAccountManagerSearchTerm('');
                            }}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : formData.transactionType === 'debit' ? (
                  // Debit: Payment Method Selection
                  <>

                    {/* Payment Method Selection */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                      {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, paymentMethod: method.id }));
                          setErrors(prev => ({ ...prev, paymentMethod: '' }));
                        }}
                        className={`p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                          formData.paymentMethod === method.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                        }`}
                      >
                        <div className="text-center">
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r ${method.color} rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3`}>
                            <method.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          </div>
                          <h3 className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm">
                            {method.name}
                          </h3>
                        </div>
                      </button>
                    ))}
                  </div>


                  {/* Account Selection */}
                  {selectedPaymentMethod && (
                    <div className="mb-4 sm:mb-6">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                        অ্যাকাউন্ট নির্বাচন
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {/* Source Account */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            আমাদের অ্যাকাউন্ট (যেখান থেকে টাকা যাবে) *
                          </label>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              placeholder="অ্যাকাউন্ট খুঁজুন..."
                              value={accountSearchTerm}
                              onChange={(e) => setAccountSearchTerm(e.target.value)}
                              className={`w-full pl-10 pr-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                                isDark 
                                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                  : 'border-gray-300'
                              }`}
                            />
                          </div>
                          
                          {/* Account Selection Dropdown */}
                          <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                            {accountsLoading ? (
                              <div className="flex items-center justify-center py-4">
                                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">অ্যাকাউন্ট লোড হচ্ছে...</span>
                              </div>
                            ) : accountsError ? (
                              <div className="text-center py-4 text-red-500 dark:text-red-400">
                                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                                <p className="text-sm">
                                  অ্যাকাউন্ট লোড করতে সমস্যা হয়েছে
                                </p>
                                <p className="text-xs mt-1">
                                  {typeof accountsError === 'string' ? accountsError : accountsError.message || 'আবার চেষ্টা করুন'}
                                </p>
                              </div>
                            ) : filteredAccounts.length === 0 ? (
                              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                                <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">
                                  {accountSearchTerm ? 'খোঁজার সাথে মিলে যাওয়া কোন অ্যাকাউন্ট পাওয়া যায়নি' : 'কোন অ্যাকাউন্ট পাওয়া যায়নি'}
                                </p>
                                <p className="text-xs mt-1">
                                  {accountSearchTerm ? 'অন্য নাম দিয়ে খুঁজুন' : 'ব্যাংক অ্যাকাউন্ট সেটিংস থেকে অ্যাকাউন্ট যোগ করুন'}
                                </p>
                              </div>
                            ) : (
                              filteredAccounts.map((account) => (
                              <button
                                key={account.id}
                                onClick={() => handleAccountSelectForTransaction(account, 'sourceAccount')}
                                className={`w-full p-2 rounded-lg border-2 transition-all duration-200 text-left ${
                                  formData.sourceAccount.id === account.id
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <CreditCard className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                      <h4 className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm truncate">
                                        {account.name}
                                      </h4>
                                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                        {account.bankName} - {account.accountNumber}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <p className="text-xs font-semibold text-green-600 dark:text-green-400">
                                      ৳{account.balance.toLocaleString()}
                                    </p>
                                    {formData.sourceAccount.id === account.id && (
                                      <CheckCircle className="w-4 h-4 text-blue-500 mt-1" />
                                    )}
                                  </div>
                                </div>
                              </button>
                              ))
                            )}
                          </div>
                          {errors.sourceAccount && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.sourceAccount}
                            </p>
                          )}
                        </div>

                        {/* Destination Account - Our Company Account */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          আমাদের অ্যাকাউন্ট (যেখান টাকা জমা হবে) 
                          </label>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              placeholder="অ্যাকাউন্ট খুঁজুন..."
                              value={accountSearchTerm}
                              onChange={(e) => setAccountSearchTerm(e.target.value)}
                              className={`w-full pl-10 pr-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                                isDark 
                                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                  : 'border-gray-300'
                              }`}
                            />
                          </div>
                          
                          {/* Destination Account Selection Dropdown */}
                          <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                            {accountsLoading ? (
                              <div className="flex items-center justify-center py-4">
                                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">অ্যাকাউন্ট লোড হচ্ছে...</span>
                              </div>
                            ) : accountsError ? (
                              <div className="text-center py-4 text-red-500 dark:text-red-400">
                                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                                <p className="text-sm">
                                  অ্যাকাউন্ট লোড করতে সমস্যা হয়েছে
                                </p>
                                <p className="text-xs mt-1">
                                  {typeof accountsError === 'string' ? accountsError : accountsError.message || 'আবার চেষ্টা করুন'}
                                </p>
                              </div>
                            ) : filteredAccounts.length === 0 ? (
                              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                                <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">
                                  {accountSearchTerm ? 'খোঁজার সাথে মিলে যাওয়া কোন অ্যাকাউন্ট পাওয়া যায়নি' : 'কোন অ্যাকাউন্ট পাওয়া যায়নি'}
                                </p>
                                <p className="text-xs mt-1">
                                  {accountSearchTerm ? 'অন্য নাম দিয়ে খুঁজুন' : 'ব্যাংক অ্যাকাউন্ট সেটিংস থেকে অ্যাকাউন্ট যোগ করুন'}
                                </p>
                              </div>
                            ) : (
                              filteredAccounts.map((account) => (
                              <button
                                key={account.id}
                                onClick={() => handleAccountSelectForTransaction(account, 'destinationAccount')}
                                className={`w-full p-2 rounded-lg border-2 transition-all duration-200 text-left ${
                                  formData.destinationAccount.id === account.id
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <CreditCard className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                      <h4 className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm truncate">
                                        {account.name}
                                      </h4>
                                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                        {account.bankName} - {account.accountNumber}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <p className="text-xs font-semibold text-green-600 dark:text-green-400">
                                      ৳{account.balance.toLocaleString()}
                                    </p>
                                    {formData.destinationAccount.id === account.id && (
                                      <CheckCircle className="w-4 h-4 text-blue-500 mt-1" />
                                    )}
                                  </div>
                                </div>
                              </button>
                              ))
                            )}
                          </div>
                          {errors.destinationAccount && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.destinationAccount}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Customer Information Section */}
                      <div className="mt-4 sm:mt-6">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                          কাস্টমার (যার কাছে টাকা যাবে)
                        </h4>
                        <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 mb-3">
                            <div className="flex items-center gap-2">
                              <User className="w-5 h-5 text-blue-600" />
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                  {formData.customerName}
                                </h4>
                                {formData.customerPhone && (
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    📞 {formData.customerPhone}
                                  </p>
                                )}
                              </div>
                            </div>
                          
                          {/* Customer Bank Account Details */}
                          {formData.paymentMethod === 'bank-transfer' && (
                            <div className="space-y-3">
                              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                কাস্টমারের ব্যাংক একাউন্ট বিবরণ *
                              </h4>
                              
                              <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                  ব্যাংকের নাম
                                </label>
                                <input
                                  type="text"
                                  name="customerBankAccount.bankName"
                                  value={formData.customerBankAccount.bankName}
                                  onChange={handleInputChange}
                                  placeholder="ব্যাংকের নাম লিখুন..."
                                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm ${
                                    isDark 
                                      ? 'bg-white border-gray-300 text-gray-900' 
                                      : 'border-gray-300'
                                  } ${errors.customerBankName ? 'border-red-500 focus:ring-red-500' : ''}`}
                                />
                                {errors.customerBankName && (
                                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.customerBankName}
                                  </p>
                                )}
                              </div>
                              
                              <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                  একাউন্ট নম্বর
                                </label>
                                <input
                                  type="text"
                                  name="customerBankAccount.accountNumber"
                                  value={formData.customerBankAccount.accountNumber}
                                  onChange={handleInputChange}
                                  placeholder="একাউন্ট নম্বর লিখুন..."
                                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm ${
                                    isDark 
                                      ? 'bg-white border-gray-300 text-gray-900' 
                                      : 'border-gray-300'
                                  } ${errors.customerAccountNumber ? 'border-red-500 focus:ring-red-500' : ''}`}
                                />
                                {errors.customerAccountNumber && (
                                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.customerAccountNumber}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Account Manager Selection for Credit */}
                  {formData.destinationAccount.id && (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 sm:p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-green-600" />
                        একাউন্ট ম্যানেজার নির্বাচন
                      </h3>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          একাউন্ট ম্যানেজার নির্বাচন
                        </label>
                        
                        {/* Account Manager Search Bar */}
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="একাউন্ট ম্যানেজার খুঁজুন... (নাম, পদবী, ফোন, ইমেইল)"
                            value={accountManagerSearchTerm}
                            onChange={(e) => setAccountManagerSearchTerm(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                              isDark 
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                : 'border-gray-300'
                            }`}
                          />
                        </div>

                        {/* Account Manager List */}
                        {accountManagerSearchTerm && (
                          <div className="mt-2 space-y-2 max-h-60 overflow-y-auto border rounded-lg p-2">
                            {employeeLoading ? (
                              <div className="flex items-center justify-center py-4">
                                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                                <span className="ml-2 text-gray-600 dark:text-gray-400">খুঁজছি...</span>
                              </div>
                            ) : employeeSearchError ? (
                              <div className="text-center py-4 text-red-500 dark:text-red-400 text-sm">
                                <div className="flex items-center justify-center gap-2">
                                  <AlertCircle className="w-4 h-4" />
                                  <span>খোঁজার সময় সমস্যা হয়েছে। আবার চেষ্টা করুন।</span>
                                </div>
                              </div>
                            ) : employeeSearchResults.length === 0 ? (
                              <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                                {accountManagerSearchTerm ? 'কোনো একাউন্ট ম্যানেজার পাওয়া যায়নি' : 'একাউন্ট ম্যানেজার খুঁজতে টাইপ করুন'}
                              </div>
                            ) : (
                              employeeSearchResults.map((employee) => (
                                <button
                                  key={employee._id || employee.id}
                                  onClick={() => {
                                    setFormData(prev => ({
                                      ...prev,
                                      creditAccountManager: {
                                        id: employee._id || employee.id,
                                        name: employee.name || `${employee.firstName || ''} ${employee.lastName || ''}`.trim(),
                                        phone: employee.phone || employee.phoneNumber,
                                        email: employee.email || employee.emailAddress,
                                        designation: employee.designation || employee.position
                                      }
                                    }));
                                    setAccountManagerSearchTerm('');
                                  }}
                                  className={`w-full p-3 rounded-lg border-2 transition-all duration-200 hover:scale-[1.01] ${
                                    formData.creditAccountManager?.id === employee._id
                                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                      : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                                  }`}
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                      formData.creditAccountManager?.id === employee._id
                                        ? 'bg-blue-100 dark:bg-blue-800'
                                        : 'bg-gray-100 dark:bg-gray-700'
                                    }`}>
                                      <User className={`w-5 h-5 ${
                                        formData.creditAccountManager?.id === employee._id
                                          ? 'text-blue-600 dark:text-blue-400'
                                          : 'text-gray-600 dark:text-gray-400'
                                      }`} />
                                    </div>
                                    <div className="flex-1 text-left">
                                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                        {employee.name || `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'নাম নেই'}
                                      </h4>
                                      <p className="text-xs text-gray-600 dark:text-gray-400">
                                        {employee.designation || employee.position || 'পদবী নেই'}
                                      </p>
                                      <div className="flex flex-wrap gap-2 mt-1">
                                        {(employee.phone || employee.phoneNumber) && (
                                          <span className="text-xs text-blue-600 dark:text-blue-400">
                                            📞 {employee.phone || employee.phoneNumber}
                                          </span>
                                        )}
                                        {(employee.email || employee.emailAddress) && (
                                          <span className="text-xs text-green-600 dark:text-green-400">
                                            ✉️ {employee.email || employee.emailAddress}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    {formData.creditAccountManager?.id === employee._id && (
                                      <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    )}
                                  </div>
                                </button>
                              ))
                            )}
                          </div>
                        )}

                        {/* Selected Account Manager Display */}
                        {formData.creditAccountManager?.name && !accountManagerSearchTerm && (
                          <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                                  <User className="w-5 h-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                    {formData.creditAccountManager.name}
                                  </h4>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {formData.creditAccountManager.designation}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => setFormData(prev => ({ ...prev, creditAccountManager: { id: '', name: '', phone: '', email: '', designation: '' } }))}
                                className="text-red-500 hover:text-red-700 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Payment Details Form */}
                  {selectedPaymentMethod && (
                    <div className={`p-3 sm:p-4 rounded-lg border-2 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800`}>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <selectedPaymentMethod.icon className="w-4 h-4 text-blue-600" />
                        {selectedPaymentMethod.name}
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {/* Amount */}
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            পরিমাণ *
                          </label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="number"
                              name="paymentDetails.amount"
                              value={formData.paymentDetails.amount}
                              onChange={handleInputChange}
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                              className={`w-full pl-10 pr-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                                isDark 
                                  ? 'bg-white border-gray-300 text-gray-900' 
                                  : 'border-gray-300'
                              } ${errors.amount ? 'border-red-500 focus:ring-red-500' : ''}`}
                            />
                          </div>
                          {errors.amount && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.amount}
                            </p>
                          )}
                        </div>

                        {/* Charge Field - Only for bank-transfer, cheque, and mobile-banking */}
                        {(formData.paymentMethod === 'bank-transfer' || formData.paymentMethod === 'cheque' || formData.paymentMethod === 'mobile-banking') && (
                          <div className="sm:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                              চার্জ
                            </label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input
                                type="number"
                                name="paymentDetails.charge"
                                value={formData.paymentDetails.charge || ''}
                                onChange={handleInputChange}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                className={`w-full pl-10 pr-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                                  isDark 
                                    ? 'bg-white border-gray-300 text-gray-900' 
                                    : 'border-gray-300'
                                }`}
                              />
                            </div>
                          </div>
                        )}

                        {/* Dynamic Fields based on Payment Method */}
                        {selectedPaymentMethod.fields.map((field) => (
                          <div key={field}>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                              {field === 'bankName' && 'ব্যাংকের নাম'}
                              {field === 'accountNumber' && 'অ্যাকাউন্ট নম্বর'}
                              {field === 'chequeNumber' && 'চেক নম্বর'}
                              {field === 'mobileProvider' && 'মোবাইল ব্যাংকিং প্রোভাইডার'}
                              {field === 'transactionId' && 'ট্রানজেকশন আইডি'}
                              {field === 'reference' && 'রেফারেন্স'}
                            </label>
                            <input
                              type="text"
                              name={`paymentDetails.${field}`}
                              value={formData.paymentDetails[field]}
                              onChange={handleInputChange}
                              placeholder={`${field === 'bankName' ? 'ব্যাংকের নাম' : 
                                           field === 'accountNumber' ? 'অ্যাকাউন্ট নম্বর' :
                                           field === 'chequeNumber' ? 'চেক নম্বর' :
                                           field === 'mobileProvider' ? 'প্রোভাইডার' :
                                           field === 'transactionId' ? 'ট্রানজেকশন আইডি' :
                                           'রেফারেন্স'} লিখুন...`}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                                isDark 
                                  ? 'bg-white border-gray-300 text-gray-900' 
                                  : 'border-gray-300'
                              }`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                    {errors.paymentMethod && 
                      <p className="text-red-500 text-center mt-4 flex items-center justify-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        {errors.paymentMethod}
                      </p>
                    }
                  </>
                ) : (
                  // Credit: Invoice Selection
                  <>
                    {/* Customer Balance Display */}
                    {formData.customerId && (
                      <div className="mb-4 sm:mb-6">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 sm:p-6 border border-blue-200 dark:border-blue-800">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                                  {formData.customerName}
                                </h3>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  {formData.customerPhone}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                বর্তমান ব্যালেন্স
                              </p>
                              <p className={`text-lg sm:text-xl font-bold ${
                                customerBalance >= 0 
                                  ? 'text-green-600 dark:text-green-400' 
                                  : 'text-red-600 dark:text-red-400'
                              }`}>
                                {customerBalance >= 0 ? '+' : ''}৳{Math.abs(customerBalance).toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500">
                                {customerBalance >= 0 ? 'আমাদের কাছে পাওনা' : 'আমাদের কাছে ঋণ'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Agent Due Amounts Display */}
                    {formData.customerType === 'agent' && formData.agentDueInfo && (
                      <div className="mb-4 sm:mb-6">
                        <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg p-4 sm:p-6 border border-orange-200 dark:border-orange-800">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-800 rounded-full flex items-center justify-center">
                              <DollarSign className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                              এজেন্টের বকেয়া পরিমাণ
                            </h3>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                            {/* Total Due */}
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs text-gray-600 dark:text-gray-300">মোট বকেয়া</p>
                                  <p className="text-lg font-semibold text-gray-900 dark:text-white">৳{formData.agentDueInfo.totalDue?.toLocaleString() || '0'}</p>
                                </div>
                                <DollarSign className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                              </div>
                            </div>
                            
                            {/* Hajj Due */}
                            <div className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-lg p-3 border border-amber-200 dark:border-amber-700">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs text-amber-700 dark:text-amber-300">হাজ্জ বকেয়া</p>
                                  <p className="text-lg font-semibold text-amber-900 dark:text-amber-100">৳{formData.agentDueInfo.hajDue?.toLocaleString() || '0'}</p>
                                </div>
                                <Building className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                              </div>
                            </div>
                            
                            {/* Umrah Due */}
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs text-blue-700 dark:text-blue-300">ওমরাহ বকেয়া</p>
                                  <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">৳{formData.agentDueInfo.umrahDue?.toLocaleString() || '0'}</p>
                                </div>
                                <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Invoice Search - Only show for non-agent customers */}
                    {formData.customerType !== 'agent' && (
                      <>
                        <div className="mb-4 sm:mb-6">
                      <div className="relative max-w-md mx-auto">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                        <input
                          type="text"
                          placeholder="ইনভয়েস সার্চ করুন... (নাম্বার, কাস্টমার, বর্ণনা)"
                          value={invoiceSearchTerm}
                          onChange={(e) => setInvoiceSearchTerm(e.target.value)}
                          className={`w-full pl-10 pr-4 py-2 sm:py-3 rounded-lg border-2 transition-colors text-sm sm:text-base ${
                            isDark 
                              ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                        />
                      </div>
                      {invoiceSearchTerm && (
                        <p className="text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
                          {filteredInvoices.length} টি ইনভয়েস পাওয়া গেছে
                        </p>
                      )}
                        </div>

                        {/* Invoice List */}
                    <div className="space-y-2 sm:space-y-3 max-h-60 sm:max-h-96 overflow-y-auto">
                      {filteredInvoices.length === 0 ? (
                        <div className="text-center py-8">
                          <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                            {invoiceSearchTerm ? 'কোন ইনভয়েস পাওয়া যায়নি' : 'কোন ইনভয়েস নেই'}
                          </p>
                          {invoiceSearchTerm && (
                            <button
                              onClick={() => setInvoiceSearchTerm('')}
                              className="mt-2 text-blue-600 hover:text-blue-700 text-sm underline"
                            >
                              সব ইনভয়েস দেখুন
                            </button>
                          )}
                        </div>
                      ) : (
                        filteredInvoices.map((invoice) => (
                          <button
                            key={invoice.id || invoice._id}
                            onClick={() => handleInvoiceSelect(invoice)}
                            className={`w-full p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 hover:scale-[1.02] ${
                              formData.selectedInvoice?.id === (invoice.id || invoice._id)
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  formData.selectedInvoice?.id === (invoice.id || invoice._id)
                                    ? 'bg-blue-100 dark:bg-blue-800'
                                    : 'bg-gray-100 dark:bg-gray-700'
                                }`}>
                                  <Receipt className={`w-5 h-5 sm:w-6 sm:h-6 ${
                                    formData.selectedInvoice?.id === (invoice.id || invoice._id)
                                      ? 'text-blue-600 dark:text-blue-400'
                                      : 'text-gray-600 dark:text-gray-400'
                                  }`} />
                                </div>
                                <div className="text-left min-w-0 flex-1">
                                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                                    {invoice.invoiceNumber || invoice.invoiceId}
                                  </h3>
                                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                                    {invoice.customerName || 'কাস্টমার নাম নেই'}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                                    {invoice.description || 'বিবরণ নেই'}
                                  </p>
                                </div>
                              </div>
                              <div className="text-left sm:text-right">
                                <p className="text-base sm:text-lg font-bold text-green-600 dark:text-green-400">
                                  ৳{(invoice.amount || 0).toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                  Due: {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 
                                        invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : 
                                        'তারিখ নেই'}
                                </p>
                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                  (invoice.status || 'Pending') === 'Pending' 
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                    : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                }`}>
                                  {invoice.status}
                                </span>
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>

                        {errors.invoiceId && (
                          <p className="text-red-500 text-center mt-3 sm:mt-4 flex items-center justify-center gap-2 text-xs sm:text-sm">
                            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                            {errors.invoiceId}
                          </p>
                        )}
                      </>
                    )}

                    {/* Error Messages for Transfer */}
                    {formData.transactionType === 'transfer' && errors.accountManager && (
                      <p className="text-red-500 text-center mt-3 sm:mt-4 flex items-center justify-center gap-2 text-xs sm:text-sm">
                        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                        {errors.accountManager}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Payment Method (for credit with agent) */}
          {currentStep === 5 && formData.transactionType === 'credit' && formData.customerType === 'agent' && (
            <div className="p-3 sm:p-4 lg:p-6">

              <div className="max-w-6xl mx-auto">
                <div className="space-y-4 sm:space-y-6">
                </div>
              </div>
            </div>
          )}
          {/* Step 5: Payment Method (for credit with customer) or Confirmation with SMS (for transfer) or Confirmation (for debit) or Payment Method (for credit with agent) */}
          {currentStep === 5 && (
            <div className="p-3 sm:p-4 lg:p-6">
              {formData.transactionType === 'transfer' ? (
                // Transfer: Confirmation with SMS
                <div className="text-center mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                    ট্রান্সফার কনফার্মেশন
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    এসএমএস কনফার্মেশন এবং ট্রান্সফার সম্পূর্ণ করুন
                  </p>
                </div>
              ) : formData.transactionType === 'debit' ? (
                // Debit: Confirmation
                <div className="text-center mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                    তথ্য যাচাই এবং কনফার্মেশন
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    সব তথ্য সঠিক কিনা যাচাই করুন এবং কনফার্ম করুন
                  </p>
                </div>
              ) : (
                // Credit: Payment Method Selection
                <div className="text-center mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                    পেমেন্ট মেথড নির্বাচন করুন
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    পেমেন্টের ধরন এবং বিবরণ নির্বাচন করুন
                  </p>
                </div>
              )}

              {formData.transactionType === 'transfer' ? (
                // Transfer: Confirmation with SMS
                <div className="max-w-4xl mx-auto">
                  {/* Transfer Summary */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 sm:p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <ArrowRightLeft className="w-5 h-5 text-blue-600" />
                      ট্রান্সফার সারাংশ
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-red-200 dark:border-red-800">
                        <div className="flex items-center gap-3 mb-3">
                          {/* Bank Logo */}
                          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-red-300 dark:border-red-700 flex-shrink-0">
                            {formData.debitAccount?.logo ? (
                              <img 
                                src={formData.debitAccount.logo} 
                                alt={formData.debitAccount?.bankName || 'Bank Logo'} 
                                className="w-full h-full object-cover rounded-full"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : null}
                            {!formData.debitAccount?.logo && (
                              <div className="w-full h-full rounded-full flex items-center justify-center bg-red-100 dark:bg-red-800">
                                <Building2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-red-600 dark:text-red-400">ডেবিট একাউন্ট</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{formData.debitAccount?.bankName}</p>
                          </div>
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{formData.debitAccount?.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">A/C: {formData.debitAccount?.accountNumber}</p>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-3 mb-3">
                          {/* Bank Logo */}
                          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-green-300 dark:border-green-700 flex-shrink-0">
                            {formData.creditAccount?.logo ? (
                              <img 
                                src={formData.creditAccount.logo} 
                                alt={formData.creditAccount?.bankName || 'Bank Logo'} 
                                className="w-full h-full object-cover rounded-full"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : null}
                            {!formData.creditAccount?.logo && (
                              <div className="w-full h-full rounded-full flex items-center justify-center bg-green-100 dark:bg-green-800">
                                <Building2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-green-600 dark:text-green-400">ক্রেডিট একাউন্ট</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{formData.creditAccount?.bankName}</p>
                          </div>
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{formData.creditAccount?.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">A/C: {formData.creditAccount?.accountNumber}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">ট্রান্সফার পরিমাণ:</span>
                        <span className="text-lg font-bold text-green-600 dark:text-green-400">৳{parseFloat(formData.transferAmount || 0).toLocaleString()}</span>
                      </div>
                      {formData.transferCharge && parseFloat(formData.transferCharge) > 0 && (
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">চার্জ:</span>
                          <span className="text-sm font-semibold text-red-600 dark:text-red-400">-৳{parseFloat(formData.transferCharge || 0).toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">মোট পরিমাণ:</span>
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          ৳{(parseFloat(formData.transferAmount || 0) - parseFloat(formData.transferCharge || 0)).toLocaleString()}
                        </span>
                      </div>
                      {formData.transferReference && (
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">রেফারেন্স:</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{formData.transferReference}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Account Manager Info */}
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 sm:p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-green-600" />
                      নির্বাচিত একাউন্ট ম্যানেজার
                    </h3>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{formData.accountManager?.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{formData.accountManager?.designation}</p>
                      <div className="flex flex-col sm:flex-row gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span>📞 {formData.accountManager?.phone}</span>
                        <span>✉️ {formData.accountManager?.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Transfer Notes */}
                  {formData.transferNotes && (
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 sm:p-6 mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">ট্রান্সফার নোট</h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{formData.transferNotes}</p>
                    </div>
                  )}

                  {/* Action Buttons for Transfer */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center mt-6">
                    <button
                      onClick={handleSubmit}
                      disabled={createTransactionMutation.isPending || createBankAccountTransactionMutation.isPending || bankAccountTransferMutation.isPending || createPersonalExpenseTxV2.isPending}
                      className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-blue-400 disabled:to-purple-400 text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg text-sm sm:text-base"
                    >
                      {(createTransactionMutation.isPending || createBankAccountTransactionMutation.isPending || bankAccountTransferMutation.isPending) ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="hidden sm:inline">ট্রান্সফার হচ্ছে...</span>
                          <span className="sm:hidden">ট্রান্সফার...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span className="hidden sm:inline">ট্রান্সফার সম্পন্ন করুন</span>
                          <span className="sm:hidden">ট্রান্সফার সম্পন্ন</span>
                        </>
                      )}
                    </button>
                  
                  </div>
                </div>
              ) : formData.transactionType === 'debit' ? (
                // Debit: Confirmation
                <div className="max-w-6xl mx-auto">
                  {/* Transaction Summary */}
                  <div className={`p-3 sm:p-4 rounded-lg border-2 border-gray-200 dark:border-gray-600 mb-3 sm:mb-4 ${
                    isDark ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-blue-600" />
                      লেনদেনের সারসংক্ষেপ
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-600 dark:text-gray-400">লেনদেনের ধরন:</span>
                          <span className="font-semibold text-red-600">
                            ডেবিট (ব্যয়)
                          </span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-600 dark:text-gray-400">কাস্টমার:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {formData.customerName}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-600 dark:text-gray-400">তারিখ:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {new Date(formData.date).toLocaleDateString('bn-BD')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-600 dark:text-gray-400">পেমেন্ট মেথড:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {selectedPaymentMethod?.name}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-600 dark:text-gray-400">পরিমাণ:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            ৳{formData.paymentDetails.amount ? parseFloat(formData.paymentDetails.amount).toLocaleString() : '0'}
                          </span>
                        </div>
                        {(formData.paymentMethod === 'bank-transfer' || formData.paymentMethod === 'cheque' || formData.paymentMethod === 'mobile-banking') && formData.paymentDetails.charge && parseFloat(formData.paymentDetails.charge) > 0 && (
                          <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-gray-600 dark:text-gray-400">চার্জ:</span>
                            <span className={`font-semibold ${getChargeWithSign() < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                              {getChargeWithSign() < 0 ? '-' : '+'}৳{Math.abs(getChargeWithSign()).toLocaleString()}
                            </span>
                          </div>
                        )}
                        {(formData.paymentMethod === 'bank-transfer' || formData.paymentMethod === 'cheque' || formData.paymentMethod === 'mobile-banking') && formData.paymentDetails.charge && parseFloat(formData.paymentDetails.charge) > 0 && (
                          <div className="flex justify-between text-xs sm:text-sm border-t pt-2 mt-2">
                            <span className="text-gray-600 dark:text-gray-400 font-semibold">মোট পরিমাণ:</span>
                            <span className="font-bold text-blue-600 dark:text-blue-400">
                              ৳{getTotalAmount().toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Account Manager Selection */}
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 sm:p-6 mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-green-600" />
                      একাউন্ট ম্যানেজার নির্বাচন
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        একাউন্ট ম্যানেজার নির্বাচন
                      </label>
                      
                      {/* Account Manager Search Bar */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="একাউন্ট ম্যানেজার খুঁজুন... (কমপক্ষে ২টি অক্ষর টাইপ করুন)"
                          value={accountManagerSearchTerm}
                          onChange={(e) => setAccountManagerSearchTerm(e.target.value)}
                          className={`w-full pl-10 pr-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                            isDark 
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                              : 'border-gray-300'
                          }`}
                        />
                        {accountManagerSearchTerm && accountManagerSearchTerm.trim().length < 2 && (
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            কমপক্ষে ২টি অক্ষর টাইপ করুন
                          </p>
                        )}
                      </div>

                      {/* Account Manager List */}
                      {shouldSearch && (
                        <div className="mt-2 space-y-2 max-h-60 overflow-y-auto border rounded-lg p-2">
                          {employeeLoading ? (
                            <div className="flex items-center justify-center py-4">
                              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                              <span className="ml-2 text-gray-600 dark:text-gray-400">খুঁজছি...</span>
                            </div>
                          ) : employeeSearchError ? (
                            <div className="text-center py-4 text-red-500 dark:text-red-400 text-sm">
                              <div className="flex flex-col items-center justify-center gap-2">
                                <AlertCircle className="w-5 h-5" />
                                <span>খোঁজার সময় সমস্যা হয়েছে</span>
                                <span className="text-xs text-gray-500 dark:text-gray-500">
                                  {employeeSearchError?.message || 'Backend endpoint error. Please try again.'}
                                </span>
                              </div>
                            </div>
                          ) : employeeSearchResults.length === 0 ? (
                            <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                              কোনো একাউন্ট ম্যানেজার পাওয়া যায়নি
                            </div>
                          ) : (
                            employeeSearchResults.map((employee) => {
                              const employeeId = employee._id || employee.id || employee.employeeId;
                              const employeeName = employee.name || `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'নাম নেই';
                              const employeePosition = employee.designation || employee.position || employee.position || 'পদবী নেই';
                              const employeePhone = employee.phone || employee.phoneNumber || '';
                              const employeeEmail = employee.email || employee.emailAddress || '';
                              const employeeDepartment = employee.department || '';
                              
                              return (
                                <button
                                  key={employeeId}
                                  onClick={() => {
                                    setFormData(prev => ({
                                      ...prev,
                                      accountManager: {
                                        id: employeeId,
                                        name: employeeName,
                                        phone: employeePhone,
                                        email: employeeEmail,
                                        designation: employeePosition,
                                        department: employeeDepartment
                                      }
                                    }));
                                    setAccountManagerSearchTerm('');
                                  }}
                                  className={`w-full p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 hover:scale-[1.01] ${
                                    formData.accountManager?.id === employeeId
                                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                      : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                                  }`}
                                >
                                  <div className="flex items-center space-x-3 sm:space-x-4">
                                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                                      formData.accountManager?.id === employeeId
                                        ? 'bg-blue-100 dark:bg-blue-800'
                                        : 'bg-gray-100 dark:bg-gray-700'
                                    }`}>
                                      <User className={`w-5 h-5 sm:w-6 sm:h-6 ${
                                        formData.accountManager?.id === employeeId
                                          ? 'text-blue-600 dark:text-blue-400'
                                          : 'text-gray-600 dark:text-gray-400'
                                      }`} />
                                    </div>
                                    <div className="flex-1 text-left min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                                          {employeeName}
                                        </h4>
                                        {employee.employeeId && (
                                          <span className="text-xs text-gray-500 dark:text-gray-400">
                                            ({employee.employeeId})
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                                        {employeePosition}
                                      </p>
                                      {employeeDepartment && (
                                        <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                                          {employeeDepartment}
                                        </p>
                                      )}
                                      <div className="flex flex-wrap gap-2 mt-1">
                                        {employeePhone && (
                                          <span className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                            <Phone className="w-3 h-3" />
                                            {employeePhone}
                                          </span>
                                        )}
                                        {employeeEmail && (
                                          <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                            <Mail className="w-3 h-3" />
                                            {employeeEmail}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    {formData.accountManager?.id === employeeId && (
                                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                    )}
                                  </div>
                                </button>
                              );
                            })
                          )}
                        </div>
                      )}

                      {/* Selected Account Manager Display */}
                      {formData.accountManager?.name && !accountManagerSearchTerm && (
                        <div className="mt-2 p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center flex-shrink-0">
                                <User className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                                  {formData.accountManager.name}
                                </h4>
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                                  {formData.accountManager.designation || formData.accountManager.position || 'পদবী নেই'}
                                </p>
                                {formData.accountManager.department && (
                                  <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                                    {formData.accountManager.department}
                                  </p>
                                )}
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {formData.accountManager.phone && (
                                    <span className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                      <Phone className="w-3 h-3" />
                                      {formData.accountManager.phone}
                                    </span>
                                  )}
                                  {formData.accountManager.email && (
                                    <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                      <Mail className="w-3 h-3" />
                                      {formData.accountManager.email}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => setFormData(prev => ({ ...prev, accountManager: { id: '', name: '', phone: '', email: '', designation: '', department: '' } }))}
                              className="text-red-500 hover:text-red-700 text-sm flex-shrink-0 ml-2"
                            >
                              সরান
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      অতিরিক্ত নোট
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="2"
                      placeholder="লেনদেন সম্পর্কে অতিরিক্ত তথ্য লিখুন..."
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'border-gray-300'
                      }`}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                    <button
                      onClick={handleSubmit}
                      disabled={createTransactionMutation.isPending || createBankAccountTransactionMutation.isPending || bankAccountTransferMutation.isPending || createPersonalExpenseTxV2.isPending}
                      className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-blue-400 disabled:to-purple-400 text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg text-sm sm:text-base"
                    >
                      {(createTransactionMutation.isPending || createBankAccountTransactionMutation.isPending || bankAccountTransferMutation.isPending) ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="hidden sm:inline">
                            {formData.transactionType === 'transfer' ? 'ট্রান্সফার হচ্ছে...' : 'সংরক্ষণ হচ্ছে...'}
                          </span>
                          <span className="sm:hidden">
                            {formData.transactionType === 'transfer' ? 'ট্রান্সফার...' : 'সংরক্ষণ...'}
                          </span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span className="hidden sm:inline">
                            {formData.transactionType === 'transfer' ? 'ট্রান্সফার সম্পন্ন করুন' : 'লেনদেন সংরক্ষণ করুন'}
                          </span>
                          <span className="sm:hidden">
                            {formData.transactionType === 'transfer' ? 'ট্রান্সফার' : 'সংরক্ষণ'}
                          </span>
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => {}} // Email functionality
                      className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg text-sm sm:text-base"
                    >
                      <Mail className="w-4 h-4" />
                      <span className="hidden sm:inline">SMS পাঠান</span>
                      <span className="sm:hidden">SMS</span>
                    </button>
                  </div>
                </div>
              ) : (
                // Credit: Payment Method Selection
                <div className="max-w-6xl mx-auto">

                  {/* Payment Method Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => {
                        setFormData(prev => ({ ...prev, paymentMethod: method.id }));
                        setErrors(prev => ({ ...prev, paymentMethod: '' }));
                      }}
                      className={`p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                        formData.paymentMethod === method.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r ${method.color} rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3`}>
                          <method.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm">
                          {method.name}
                        </h3>
                      </div>
                    </button>
                  ))}
                </div>


                {/* Account Selection */}
                {selectedPaymentMethod && (
                  <div className="mb-4 sm:mb-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                      অ্যাকাউন্ট নির্বাচন
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-3 sm:gap-4">
                      {/* Destination Account */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          আমাদের অ্যাকাউন্ট (যেখানে টাকা আসবে) *
                        </label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="অ্যাকাউন্ট খুঁজুন..."
                            value={accountSearchTerm}
                            onChange={(e) => setAccountSearchTerm(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                              isDark 
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                : 'border-gray-300'
                            }`}
                          />
                        </div>
                        
                        {/* Account Selection Dropdown */}
                        <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                          {accountsLoading ? (
                            <div className="flex items-center justify-center py-4">
                              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">অ্যাকাউন্ট লোড হচ্ছে...</span>
                            </div>
                          ) : filteredAccounts.length === 0 ? (
                            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                              <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">
                                {accountSearchTerm ? 'খোঁজার সাথে মিলে যাওয়া কোন অ্যাকাউন্ট পাওয়া যায়নি' : 'কোন অ্যাকাউন্ট পাওয়া যায়নি'}
                              </p>
                              <p className="text-xs mt-1">
                                {accountSearchTerm ? 'অন্য নাম দিয়ে খুঁজুন' : 'ব্যাংক অ্যাকাউন্ট সেটিংস থেকে অ্যাকাউন্ট যোগ করুন'}
                              </p>
                            </div>
                          ) : (
                            filteredAccounts.map((account) => (
                            <button
                              key={account.id}
                              onClick={() => handleAccountSelectForTransaction(account, 'destinationAccount')}
                              className={`w-full p-2 rounded-lg border-2 transition-all duration-200 text-left ${
                                formData.destinationAccount.id === account.id
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                  : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <CreditCard className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                  <div className="min-w-0 flex-1">
                                    <h4 className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm truncate">
                                      {account.name}
                                    </h4>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                      {account.bankName} - {account.accountNumber}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className="text-xs font-semibold text-green-600 dark:text-green-400">
                                    ৳{account.balance.toLocaleString()}
                                  </p>
                                  {formData.destinationAccount.id === account.id && (
                                    <CheckCircle className="w-4 h-4 text-blue-500 mt-1" />
                                  )}
                                </div>
                              </div>
                            </button>
                            ))
                          )}
                        </div>
                        {errors.destinationAccount && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.destinationAccount}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Details Form */}
                {selectedPaymentMethod && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                      <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <selectedPaymentMethod.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        {selectedPaymentMethod.name} - বিবরণ
                      </h3>
                    </div>
                    
                    <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      {/* Amount */}
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          পরিমাণ <span className="text-red-500">*</span>
                        </label>
                        <div className="relative group">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center text-gray-500 dark:text-gray-400 group-focus-within:bg-blue-50 group-focus-within:text-blue-500 transition-colors font-bold text-lg">
                            ৳
                          </div>
                          <input
                            type="number"
                            name="paymentDetails.amount"
                            value={formData.paymentDetails.amount}
                            onChange={handleInputChange}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            className={`w-full pl-14 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-base font-medium ${
                              isDark 
                                ? 'bg-gray-900 border-gray-600 text-white placeholder-gray-500' 
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                            } ${errors.amount ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                          />
                        </div>
                        {errors.amount && (
                          <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1.5 animate-in slide-in-from-top-1 fade-in duration-200">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {errors.amount}
                          </p>
                        )}
                      </div>

                      {/* Charge Field - For cash, bank-transfer, cheque, and mobile-banking */}
                      {(formData.paymentMethod === 'cash' || formData.paymentMethod === 'bank-transfer' || formData.paymentMethod === 'cheque' || formData.paymentMethod === 'mobile-banking') && (
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            চার্জ (যদি থাকে)
                          </label>
                          <div className="relative group">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center text-gray-500 dark:text-gray-400 group-focus-within:bg-orange-50 group-focus-within:text-orange-500 transition-colors font-bold text-lg">
                              ৳
                            </div>
                            <input
                              type="number"
                              name="paymentDetails.charge"
                              value={formData.paymentDetails.charge || ''}
                              onChange={handleInputChange}
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                              className={`w-full pl-14 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 text-base font-medium ${
                                isDark 
                                  ? 'bg-gray-900 border-gray-600 text-white placeholder-gray-500' 
                                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                              }`}
                            />
                          </div>
                        </div>
                      )}

                      {/* Total Amount Summary */}
                      {formData.paymentDetails.amount && (
                        <div className="sm:col-span-2">
                          <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-bl-full -mr-4 -mt-4"></div>
                            
                            <div className="relative space-y-3">
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600 dark:text-gray-400">মূল পরিমাণ</span>
                                <span className="font-semibold text-gray-900 dark:text-white font-mono">
                                  ৳{parseFloat(formData.paymentDetails.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              </div>
                              
                              {formData.paymentDetails.charge && parseFloat(formData.paymentDetails.charge || 0) > 0 && (
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-gray-600 dark:text-gray-400">চার্জ</span>
                                  <span className={`font-semibold font-mono ${
                                    getChargeWithSign() < 0 
                                      ? 'text-red-600 dark:text-red-400' 
                                      : 'text-orange-600 dark:text-orange-400'
                                  }`}>
                                    {getChargeWithSign() < 0 ? '-' : '+'}৳{Math.abs(getChargeWithSign()).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </span>
                                </div>
                              )}
                              
                              <div className="pt-3 mt-1 border-t border-dashed border-gray-300 dark:border-gray-600 flex justify-between items-end">
                                <span className="text-sm font-bold text-gray-800 dark:text-gray-200">সর্বমোট</span>
                                <span className="text-xl font-bold text-blue-600 dark:text-blue-400 font-mono">
                                  ৳{getTotalAmount().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Dynamic Fields based on Payment Method */}
                      {selectedPaymentMethod.fields.map((field) => (
                        <div key={field} className={field === 'reference' ? 'sm:col-span-2' : ''}>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            {field === 'bankName' && 'ব্যাংকের নাম'}
                            {field === 'accountNumber' && 'অ্যাকাউন্ট নম্বর'}
                            {field === 'chequeNumber' && 'চেক নম্বর'}
                            {field === 'mobileProvider' && 'মোবাইল ব্যাংকিং প্রোভাইডার'}
                            {field === 'transactionId' && 'ট্রানজেকশন আইডি'}
                            {field === 'reference' && 'রেফারেন্স'}
                          </label>
                          <input
                            type="text"
                            name={`paymentDetails.${field}`}
                            value={formData.paymentDetails[field]}
                            onChange={handleInputChange}
                            placeholder={`${field === 'bankName' ? 'ব্যাংকের নাম' : 
                                         field === 'accountNumber' ? 'অ্যাকাউন্ট নম্বর' :
                                         field === 'chequeNumber' ? 'চেক নম্বর' :
                                         field === 'mobileProvider' ? 'প্রোভাইডার' :
                                         field === 'transactionId' ? 'ট্রানজেকশন আইডি' :
                                         'রেফারেন্স'} লিখুন...`}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-sm ${
                              isDark 
                                ? 'bg-gray-900 border-gray-600 text-white placeholder-gray-500' 
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                            }`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                  {errors.paymentMethod && 
                    <p className="text-red-500 text-center mt-4 flex items-center justify-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      {errors.paymentMethod}
                    </p>
                  }
                </div>
              )}
            </div>
          )}

          {/* Step 6: Confirmation (for credit with customer) or Confirmation (for credit with agent) */}
          {currentStep === 6 && (
            <div className="p-3 sm:p-4 lg:p-6">
              <div className="text-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                  তথ্য যাচাই এবং কনফার্মেশন
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  সব তথ্য সঠিক কিনা যাচাই করুন এবং কনফার্ম করুন
                </p>
              </div>

              <div className="max-w-6xl mx-auto">
                {/* Transaction Summary */}
                <div className={`p-3 sm:p-4 rounded-lg border-2 border-gray-200 dark:border-gray-600 mb-3 sm:mb-4 ${
                  isDark ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-blue-600" />
                    লেনদেনের সারসংক্ষেপ
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600 dark:text-gray-400">লেনদেনের ধরন:</span>
                        <span className={`font-semibold ${
                          formData.transactionType === 'credit' ? 'text-green-600' : 
                          formData.transactionType === 'debit' ? 'text-red-600' : 'text-blue-600'
                        }`}>
                          {formData.transactionType === 'credit' ? 'ক্রেডিট (আয়)' : 
                           formData.transactionType === 'debit' ? 'ডেবিট (ব্যয়)' : 'একাউন্ট টু একাউন্ট ট্রান্সফার'}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600 dark:text-gray-400">কাস্টমার:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formData.customerName}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600 dark:text-gray-400">তারিখ:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {new Date(formData.date).toLocaleDateString('bn-BD')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600 dark:text-gray-400">পেমেন্ট মেথড:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {selectedPaymentMethod?.name}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600 dark:text-gray-400">পরিমাণ:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          ৳{formData.paymentDetails.amount ? parseFloat(formData.paymentDetails.amount).toLocaleString() : '0'}
                        </span>
                      </div>
                      {(formData.paymentMethod === 'cash' || formData.paymentMethod === 'bank-transfer' || formData.paymentMethod === 'cheque' || formData.paymentMethod === 'mobile-banking') && formData.paymentDetails.charge && parseFloat(formData.paymentDetails.charge) > 0 && (
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-600 dark:text-gray-400">চার্জ:</span>
                          <span className={`font-semibold ${getChargeWithSign() < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                            {getChargeWithSign() < 0 ? '-' : '+'}৳{Math.abs(getChargeWithSign()).toLocaleString()}
                          </span>
                        </div>
                      )}
                      {(formData.paymentMethod === 'cash' || formData.paymentMethod === 'bank-transfer' || formData.paymentMethod === 'cheque' || formData.paymentMethod === 'mobile-banking') && formData.paymentDetails.charge && parseFloat(formData.paymentDetails.charge) > 0 && (
                        <div className="flex justify-between text-xs sm:text-sm border-t pt-2 mt-2">
                          <span className="text-gray-600 dark:text-gray-400 font-semibold">মোট পরিমাণ:</span>
                          <span className="font-bold text-blue-600 dark:text-blue-400">
                            ৳{getTotalAmount().toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Account Manager Selection */}
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 sm:p-6 mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-green-600" />
                    একাউন্ট ম্যানেজার নির্বাচন
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      একাউন্ট ম্যানেজার নির্বাচন
                    </label>
                    
                    {/* Account Manager Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="একাউন্ট ম্যানেজার খুঁজুন... (নাম, পদবী, ফোন, ইমেইল)"
                        value={accountManagerSearchTerm}
                        onChange={(e) => setAccountManagerSearchTerm(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'border-gray-300'
                        }`}
                      />
                    </div>

                    {/* Account Manager List */}
                    {accountManagerSearchTerm && (
                      <div className="mt-2 space-y-2 max-h-60 overflow-y-auto border rounded-lg p-2">
                        {employeeLoading ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                            <span className="ml-2 text-gray-600 dark:text-gray-400">খুঁজছি...</span>
                          </div>
                        ) : employeeSearchError ? (
                          <div className="text-center py-4 text-red-500 dark:text-red-400 text-sm">
                            <div className="flex items-center justify-center gap-2">
                              <AlertCircle className="w-4 h-4" />
                              <span>খোঁজার সময় সমস্যা হয়েছে। আবার চেষ্টা করুন।</span>
                            </div>
                          </div>
                        ) : employeeSearchResults.length === 0 ? (
                          <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                            {accountManagerSearchTerm ? 'কোনো একাউন্ট ম্যানেজার পাওয়া যায়নি' : 'একাউন্ট ম্যানেজার খুঁজতে টাইপ করুন'}
                          </div>
                        ) : (
                          employeeSearchResults.map((employee) => (
                            <button
                              key={employee._id || employee.id}
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  employeeReference: {
                                    id: employee._id || employee.id,
                                    name: employee.name || `${employee.firstName || ''} ${employee.lastName || ''}`.trim(),
                                    employeeId: employee.employeeId || employee.id,
                                    position: employee.designation || employee.position || '',
                                    department: employee.department || ''
                                  }
                                }));
                                setAccountManagerSearchTerm('');
                              }}
                              className={`w-full p-3 rounded-lg border-2 transition-all duration-200 hover:scale-[1.01] ${
                                formData.employeeReference?.id === employee._id
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                  : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  formData.employeeReference?.id === employee._id
                                    ? 'bg-blue-100 dark:bg-blue-800'
                                    : 'bg-gray-100 dark:bg-gray-700'
                                }`}>
                                  <User className={`w-5 h-5 ${
                                    formData.employeeReference?.id === employee._id
                                      ? 'text-blue-600 dark:text-blue-400'
                                      : 'text-gray-600 dark:text-gray-400'
                                  }`} />
                                </div>
                                <div className="flex-1 text-left">
                                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                    {employee.name || `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'নাম নেই'}
                                  </h4>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {employee.designation || employee.position || 'পদবী নেই'}
                                  </p>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {(employee.phone || employee.phoneNumber) && (
                                      <span className="text-xs text-blue-600 dark:text-blue-400">
                                        📞 {employee.phone || employee.phoneNumber}
                                      </span>
                                    )}
                                    {(employee.email || employee.emailAddress) && (
                                      <span className="text-xs text-green-600 dark:text-green-400">
                                        ✉️ {employee.email || employee.emailAddress}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {formData.employeeReference?.id === employee._id && (
                                  <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                )}
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}

                    {/* Selected Account Manager Display */}
                    {formData.employeeReference?.name && !accountManagerSearchTerm && (
                      <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                              <User className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                {formData.employeeReference.name}
                              </h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {formData.employeeReference.position}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setFormData(prev => ({ ...prev, employeeReference: { id: '', name: '', employeeId: '', position: '', department: '' } }))}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    অতিরিক্ত নোট
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="2"
                    placeholder="লেনদেন সম্পর্কে অতিরিক্ত তথ্য লিখুন..."
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300'
                    }`}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                  <button
                    onClick={handleSubmit}
                    disabled={createTransactionMutation.isPending || createBankAccountTransactionMutation.isPending || createPersonalExpenseTxV2.isPending}
                    className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-blue-400 disabled:to-purple-400 text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg text-sm sm:text-base"
                  >
                    {(createTransactionMutation.isPending || createBankAccountTransactionMutation.isPending) ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="hidden sm:inline">
                          {formData.transactionType === 'transfer' ? 'ট্রান্সফার হচ্ছে...' : 'সংরক্ষণ হচ্ছে...'}
                        </span>
                        <span className="sm:hidden">
                          {formData.transactionType === 'transfer' ? 'ট্রান্সফার...' : 'সংরক্ষণ...'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span className="hidden sm:inline">
                          {formData.transactionType === 'transfer' ? 'ট্রান্সফার সম্পন্ন করুন' : 'লেনদেন সংরক্ষণ করুন'}
                        </span>
                        <span className="sm:hidden">
                          {formData.transactionType === 'transfer' ? 'ট্রান্সফার' : 'সংরক্ষণ'}
                        </span>
                      </>
                    )}
                  </button>
                  
                 
               
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-4 sm:mt-6">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
              currentStep === 1
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-gray-600 hover:bg-gray-700 text-white'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">আগের ধাপ</span>
            <span className="sm:hidden">পেছনে</span>
          </button>

          <button
            onClick={nextStep}
            disabled={currentStep === (formData.transactionType === 'transfer'
              ? 5
              : formData.transactionType === 'debit'
                ? 5
                : 6)}
            className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
              currentStep === (formData.transactionType === 'transfer'
                ? 5
                : formData.transactionType === 'debit'
                  ? 5
                  : 6)
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <span className="hidden sm:inline">পরের ধাপ</span>
            <span className="sm:hidden">আগে</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NewTransaction;