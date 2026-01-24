'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { signOut as nextAuthSignOut } from 'next-auth/react';
import { navigation } from './navigation';
import { X, ChevronRight, ChevronDown } from 'lucide-react';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [expandedItems, setExpandedItems] = useState({});

  // Check if text contains Bengali characters
  const containsBengali = (text) => {
    const bengaliRegex = /[\u0980-\u09FF]/;
    return bengaliRegex.test(text);
  };

  // Check if a navigation item or any of its children matches the current path
  const isActive = (item) => {
    if (item.href === pathname) return true;
    if (item.children) {
      return item.children.some((child) => {
        if (child.href === pathname) return true;
        if (child.children) {
          return child.children.some((grandchild) => grandchild.href === pathname);
        }
        return false;
      });
    }
    return false;
  };

  // Auto-expand parent items if current path matches a child
  useEffect(() => {
    const newExpandedItems = {};
    navigation.forEach((item, index) => {
      if (item.children) {
        const hasActiveChild = item.children.some((child) => {
          if (child.href === pathname) return true;
          if (child.children) {
            return child.children.some((grandchild) => grandchild.href === pathname);
          }
          return false;
        });
        if (hasActiveChild) {
          newExpandedItems[index] = true;
          // Also expand nested children if they have active grandchildren
          item.children.forEach((child, childIndex) => {
            if (child.children) {
              const hasActiveGrandchild = child.children.some(
                (grandchild) => grandchild.href === pathname
              );
              if (hasActiveGrandchild) {
                newExpandedItems[`${index}-${childIndex}`] = true;
              }
            }
          });
        }
      }
    });
    setExpandedItems(newExpandedItems);
  }, [pathname]);

  const toggleExpand = (key) => {
    setExpandedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleNavClick = (item) => {
    // Handle logout action
    if (item.action === 'logout') {
      nextAuthSignOut({ callbackUrl: '/login' });
      return;
    }

    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const renderNavItem = (item, index, parentIndex = null) => {
    const key = parentIndex !== null ? `${parentIndex}-${index}` : index;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems[key];
    const active = isActive(item);

    if (hasChildren) {
      return (
        <div key={key} className="mb-1">
          <button
            onClick={() => toggleExpand(key)}
            className={`w-full flex items-center justify-between px-4 py-3 text-sm rounded-lg transition-all duration-200 ${
              active
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            style={{ fontFamily: "'Google Sans', sans-serif", fontWeight: 700 }}
          >
            <div className="flex items-center space-x-3">
              {typeof item.icon === 'string' ? (
                <span className="text-xl">{item.icon}</span>
              ) : (
                <item.icon className="h-5 w-5" />
              )}
              <span className="sidebar-nav-text">{item.name}</span>
            </div>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>

          {isExpanded && (
            <div className="mt-1 ml-4 space-y-1 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
              {item.children.map((child, childIndex) =>
                renderNavItem(child, childIndex, index)
              )}
            </div>
          )}
        </div>
      );
    }

    // Handle items without href (like logout)
    if (!item.href) {
      return (
        <button
          key={key}
          onClick={() => handleNavClick(item)}
          className={`w-full flex items-center space-x-3 px-4 py-3 text-sm rounded-lg transition-all duration-200 ${
            active
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          style={{ fontFamily: "'Google Sans', sans-serif", fontWeight: 700 }}
        >
          {typeof item.icon === 'string' ? (
            <span className="text-xl">{item.icon}</span>
          ) : (
            <item.icon className="h-5 w-5" />
          )}
          <span className="sidebar-nav-text">{item.name}</span>
        </button>
      );
    }

    // Regular link item
    return (
      <Link
        key={key}
        href={item.href}
        onClick={() => handleNavClick(item)}
        className={`flex items-center space-x-3 px-4 py-3 text-sm rounded-lg transition-all duration-200 ${
          active
            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
        style={{ fontFamily: "'Google Sans', sans-serif", fontWeight: 700 }}
      >
        {typeof item.icon === 'string' ? (
          <span className="text-xl">{item.icon}</span>
        ) : (
          <item.icon className="h-5 w-5" />
        )}
        <span className="sidebar-nav-text">{item.name}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-50 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 flex flex-col shadow-lg`}
        style={{ fontFamily: "'Google Sans', sans-serif" }}
      >
        {/* Sidebar Header */}
        <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between">
            {/* Logo and Text Container */}
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {/* Logo */}
              <div className="flex-shrink-0">
                <Image
                  src="/All_Logo/BIN-RASHID-LOGO.png"
                  alt="Bin Rashid Group Logo"
                  width={50}
                  height={50}
                  className="object-contain"
                  priority
                />
              </div>
              {/* Text */}
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-gray-900 dark:text-white truncate" style={{ fontFamily: "'Google Sans', sans-serif", fontWeight: 700, lineHeight: '1.2' }}>
                  Bin Rashid ERP
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5" style={{ fontFamily: "'Google Sans', sans-serif", fontWeight: 500 }}>
                  Dashboard
                </p>
              </div>
            </div>
            {/* Close button for mobile */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden flex-shrink-0 p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200 ml-2"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {navigation.map((item, index) => renderNavItem(item, index))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
