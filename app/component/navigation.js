import {
  LayoutDashboard,
  Users,
  CreditCard,
  Building2,
  Plane,
  User,
  Briefcase,
  Building,
  DollarSign,
  Settings,
  UserCircle,
  LogOut,
  Plus,
  List,
  Receipt,
  FileText,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Calculator,
  Home,
  Utensils,
  Zap,
  Monitor,
  Globe,
  History,
  BarChart3,
  Shield,
  Bell,
  Database,
  ChevronDown,
  Wallet,
  FileSpreadsheet,
  FileCheck,
  Edit,
  Package,
  Search,
  ClipboardList,
  BookOpen,
  Eye,
  Scale,
  Megaphone,
  Laptop,
  RotateCcw,
  ShoppingCart,
  Calendar,
  Mail,
  MessageSquare,
  FolderOpen
} from 'lucide-react';

/** Module IDs for access control. Sidebar filters by role's moduleAccess. */
export const MODULES = {
  dashboard: 'dashboard',
  transactions: 'transactions',
  customers: 'customers',
  agents: 'agents',
  ledger: 'ledger',
  reports: 'reports',
  audit: 'audit',
  settings: 'settings',
};

export const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    module: MODULES.dashboard,
    current: true
  },
  {
    name: 'Transactions',
    icon: CreditCard,
    module: MODULES.transactions,
    children: [
      { name: 'Transactions List', href: '/transactions', icon: List },
      { name: 'New Transaction', href: '/transactions/new', icon: Plus },
      { name: 'Today Transaction', href: '/transactions/today', icon: Calendar }
    ]
  },
  {
    name: 'Vendors',
    icon: Building2,
    module: MODULES.customers,
    children: [
      { name: 'Vendor Dashboard', href: '/vendors/dashboard', icon: LayoutDashboard },
      { name: 'Vendor List', href: '/vendors', icon: List },
      { name: 'Vendor Bill Genarate', href: '/vendors/bill', icon: Plus }
    ]
  },
  {
    name: 'Hajj & Umrah',
    icon: '🕋',
    module: MODULES.customers,
    children: [
      { name: 'Dashboard', href: '/hajj-umrah/dashboard', icon: LayoutDashboard },
      {
        name: 'Hajj',
        icon: Users,
        children: [
          { name: 'Haji List', href: '/hajj-umrah/hajj/haji-list', icon: List },
          { name: 'HL Manage', href: '/hajj-umrah/hajj/license-management', icon: Shield },
          { name: 'Hotel Management', href: '/hajj-umrah/hajj/hotel-management', icon: Building2 },
          { name: 'Haj Package', href: '/hajj-umrah/hajj/package-list', icon: List },
          { name: 'SAR Management (Hajj)', href: '/hajj-umrah/sar-management', icon: Scale }
        ]
      },
      {
        name: 'Umrah',
        icon: Users,
        children: [
          { name: 'Umrah Haji List', href: '/hajj-umrah/umrah/haji-list', icon: List },
          { name: 'Umrah Package', href: '/hajj-umrah/umrah/umrah-package-list', icon: List },
          { name: 'SAR Management (Umrah)', href: '/hajj-umrah/umrah/sar-management', icon: Scale }
        ]
      },
      {
        name: 'Hajj & Umrah B2B',
        icon: Building2,
        children: [
          { name: 'Hajj & Umrah Agent List', href: '/hajj-umrah/b2b-agent', icon: Users },
          { name: 'Create New Agent', href: '/hajj-umrah/b2b-agent/agent/add', icon: Plus },
          { name: 'Agent Package', href: '/hajj-umrah/b2b-agent/agent-packages', icon: List }
        ]
      }
    ]
  },
  {
    name: 'Air Ticketing',
    icon: Plane,
    module: MODULES.customers,
    children: [
      { name: 'Dashboard', href: '/air-ticketing/dashboard', icon: LayoutDashboard },
      { name: 'Passenger List', href: '/air-ticketing/passengers', icon: Users },
      { name: 'New Ticket Sale', href: '/air-ticketing/tickets/add', icon: Plus },
      { name: 'Manage Booking', href: '/air-ticketing/tickets', icon: List },
      { name: 'B2B Agent', href: '/air-ticketing/agents', icon: Users },
      {
        name: 'Old Ticketing Service',
        href: '/air-ticketing/old/dashboard',
        icon: History,
        children: [
          { name: 'ড্যাশবোর্ড', href: '/air-ticketing/old/dashboard', icon: LayoutDashboard },
          { name: 'Ticket Check', href: '/air-ticketing/ticket-check/list', icon: FileCheck },
          { name: 'Old Ticket Reissue', href: '/air-ticketing/old/ticket-reissue/list', icon: List }
        ]
      },
      { name: 'Airline List', href: '/air-ticketing/airlines', icon: List },
      { name: 'GDS', href: '/air-ticketing/gds', icon: List },
      { name: 'IATA Monitor', href: '/air-ticketing/iata-monitor', icon: Monitor }
    ]
  },
  {
    name: 'Additional Services',
    icon: Package,
    module: MODULES.customers,
    children: [
      { name: 'Dashboard', href: '/additional-services/dashboard', icon: LayoutDashboard },
      { name: 'Customer List', href: '/additional-services/customer-list', icon: Users },
      { name: 'Passport Service', href: '/additional-services/passport-service', icon: FileCheck },
      { name: 'Manpower Service', href: '/additional-services/manpower-service', icon: Briefcase },
      { name: 'Visa Processing', href: '/additional-services/visa-processing', icon: FileText },
      { name: "Other's Service", href: '/additional-services/other-services', icon: Package }
    ]
  },
  {
    name: 'স্বল্পমেয়াদী লেনদেন',
    icon: Calculator,
    module: MODULES.ledger,
    children: [
      { name: 'ড্যাশবোর্ড', href: '/loan/dashboard', icon: LayoutDashboard },
      { name: 'ঋণ গ্রহণ', href: '/loan/receiving-list', icon: TrendingUp },
      { name: 'ঋণ প্রদান', href: '/loan/giving-list', icon: TrendingDown },
    ]
  },
  // {
  //   name: 'Fly Oval Limited',
  //   icon: Plane,
  //   children: [
  //     { name: 'Dashboard', href: '/fly-oval', icon: LayoutDashboard },
  //     { name: 'Transactions', href: '/fly-oval/transaction', icon: CreditCard },
  //     { name: 'Customers', href: '/fly-oval/customers', icon: Users },
  //     { name: 'Agent List', href: '/fly-oval/agents', icon: Users },
  //     { name: 'Account', href: '/fly-oval/account', icon: User },
  //     { name: 'TopUp History', href: '/fly-oval/topup-history', icon: TrendingUp },
  //     { name: 'Ledger', href: '/fly-oval/ledger', icon: BookOpen },
  //     { name: 'Reports', href: '/fly-oval/reports', icon: BarChart3 },
  //     { name: 'Audit', href: '/fly-oval/audit', icon: Eye }
  //   ]
  // },
  {
    name: 'Miraj Industries',
    icon: Building,
    module: MODULES.reports,
    children: [
      { name: 'ড্যাশবোর্ড', href: '/miraj-industries/dashboard', icon: LayoutDashboard },
      { name: 'গবাদি পশু ব্যবস্থাপনা', href: '/miraj-industries/cattle-management', icon: Users },
      { name: 'দুধ উৎপাদন রেকর্ড', href: '/miraj-industries/milk-production', icon: TrendingUp },
      { name: 'খাদ্য ব্যবস্থাপনা', href: '/miraj-industries/feed-management', icon: Utensils },
      { name: 'স্বাস্থ্য ও পশুচিকিৎসা', href: '/miraj-industries/health-records', icon: Shield },
      { name: 'প্রজনন ও বাচ্চা প্রসব', href: '/miraj-industries/breeding-records', icon: Plus },
      { name: 'আয়-খরচ রিপোর্ট', href: '/miraj-industries/financial-report', icon: BarChart3 },
      { name: 'কর্মচারী ব্যবস্থাপনা', href: '/miraj-industries/employee-management', icon: Users }
    ]
  },
  {
    name: 'Account',
    icon: Wallet,
    module: MODULES.ledger,
    children: [
      { name: 'Bank Accounts', href: '/account/bank-accounts', icon: CreditCard },
      {
        name: 'Investments',
        icon: TrendingUp,
        children: [
          { name: 'IATA & Airlines Capping', href: '/account/investments/iata-airlines-capping', icon: Plane },
          { name: 'Others Invest', href: '/account/investments/others-invest', icon: TrendingUp }
        ]
      },
      { name: 'Asset Management', href: '/account/asset-management', icon: Building }
    ]
  },
  {
    name: 'Personal',
    icon: User,
    module: MODULES.ledger,
    children: [
      { name: 'Personal Dashboard', href: '/personal/dashboard', icon: LayoutDashboard },
      { name: 'Personal Expense', href: '/personal/expense', icon: TrendingDown },
      { name: 'Family Assets', href: '/personal/family-assets', icon: Building },
    ]
  },
  {
    name: 'Office Management',
    icon: Home,
    module: MODULES.ledger,
    children: [
      { name: 'Office Dashboard', href: '/office-management/dashboard', icon: LayoutDashboard },
      {
        name: 'HR Management',
        icon: Users,
        children: [
          { name: 'Employeers', href: '/office-management/hr/employee/list', icon: Users },
          { name: 'Payroll', href: '/office-management/hr/payroll', icon: Receipt },
          { name: 'Employee Attendance', href: '/office-management/hr/attendance', icon: ClipboardList }
        ]
      },
      { name: 'Operating Expenses', href: '/office-management/operating-expenses', icon: DollarSign },
    ]
  },
  {
    name: 'Money Exchange',
    icon: Globe,
    module: MODULES.ledger,
    children: [
      { name: 'Dashboard', href: '/money-exchange/dashboard', icon: LayoutDashboard },
      { name: 'New Exchange', href: '/money-exchange/new', icon: Plus },
      { name: 'List', href: '/money-exchange/list', icon: List },
      { name: 'Dealer List', href: '/money-exchange/dealer-list', icon: List }
    ]
  },
  {
    name: 'Marketing Zone',
    icon: Megaphone,
    module: MODULES.reports,
    children: [
      { name: 'SMS Marketing', href: '/marketing/sms-marketing', icon: MessageSquare },
      { name: 'All Contacts', href: '/marketing/contacts', icon: Users },
      { name: 'Groups', href: '/marketing/groups', icon: FolderOpen },
      { name: 'Email Marketing', href: '/marketing/email-marketing', icon: Mail }
    ]
  },
  {
    name: 'Settings',
    icon: Settings,
    module: MODULES.settings,
    children: [
      { name: 'User Management', href: '/settings/users', icon: Users },
      { name: 'Branch Management', href: '/settings/branch', icon: Building2 },
      { name: 'Permission Management', href: '/settings/permissions', icon: Shield },
      { name: 'Module Access', href: '/settings/module-access', icon: Eye },
      { name: 'System Settings', href: '/settings/system', icon: Settings },
    ]
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: UserCircle
    // no module: always visible
  },
  {
    name: 'Logout',
    href: null,
    icon: LogOut,
    action: 'logout'
    // no module: always visible
  }
];
