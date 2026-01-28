'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut as nextAuthSignOut } from 'next-auth/react';
import { navigation } from './navigation';
import { X, ChevronRight, ChevronDown } from 'lucide-react';
import { useRoleAccess } from '../hooks/useRoleAccess';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState({});
  const { role, moduleAccess, loading: accessLoading, hasModuleAccess } = useRoleAccess();

  /** Filter nav by role's moduleAccess. Items without `module` (Profile, Logout) always show. */
  const filteredNavigation = useMemo(() => {
    if (accessLoading) return navigation;
    
    // Recursive function to filter items
    const filterItems = (items) => {
      return items.filter((item) => {
        // 1. Check direct role restriction
        if (item.roles && (!role || !item.roles.includes(role.slug || role))) {
          return false;
        }

        // 2. Check module access
        if (item.module && !hasModuleAccess(item.module)) {
          return false;
        }

        // 3. Filter children recursively if they exist
        if (item.children) {
          const filteredChildren = filterItems(item.children);
          // Return a new item with filtered children
          return {
            ...item,
            children: filteredChildren
          };
          
          // Optional: Hide parent if no children visible (uncomment if desired)
          // if (filteredChildren.length === 0) return false;
        }

        return true;
      });
    };

    // Use original navigation, filtering returns new array of objects
    return filterItems(navigation);

  }, [accessLoading, moduleAccess, hasModuleAccess, role]);

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
    // Only run this logic if we have filtered items
    if (!filteredNavigation || filteredNavigation.length === 0) return;

    // Use a timeout to avoid synchronous state updates during render
    const timer = setTimeout(() => {
      const newExpandedItems = {};
      let hasChanges = false;

      filteredNavigation.forEach((item, index) => {
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
            hasChanges = true;
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
      
      // Only update state if there are actual items to expand
      if (hasChanges) {
        setExpandedItems(prev => ({...prev, ...newExpandedItems}));
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname, filteredNavigation]);

  const toggleExpand = (key) => {
    setExpandedItems((prev) => {
      // Logic for Accordion behavior (one open at a time)
      
      // Determine the level of the clicked item
      // Top level: "0", "1", "2" (no hyphens)
      // Second level: "0-1", "2-3" (one hyphen)
      // Third level: "0-1-2" (two hyphens)
      
      const keyString = String(key);
      const hyphenCount = (keyString.match(/-/g) || []).length;
      
      // If it's a top-level item (0 hyphens)
      if (hyphenCount === 0) {
        const newState = {};
        
        // Preserve open states of nested items for the clicked parent IF we are opening it
        // But for simplicity and true accordion, we usually just close others.
        
        // If opening the clicked item
        if (!prev[key]) {
          newState[key] = true;
        } 
        // If closing, newState remains empty (all closed)
        
        return newState;
      }
      
      // If it's a nested item (e.g., inside Hajj & Umrah -> Hajj Management)
      // We want to close siblings at the same level but keep the parent open.
      
      // Get the parent key (e.g., for "0-1", parent is "0")
      const parentKey = keyString.substring(0, keyString.lastIndexOf('-'));
      
      const newState = { ...prev };
      
      // Find all keys that are siblings (start with same parentKey + '-' and have same hyphen count)
      Object.keys(prev).forEach(existingKey => {
        const existingKeyString = String(existingKey);
        const existingHyphenCount = (existingKeyString.match(/-/g) || []).length;
        
        // Check if it's a sibling (same parent, same level)
        if (existingKeyString.startsWith(parentKey + '-') && 
            existingHyphenCount === hyphenCount && 
            existingKeyString !== keyString) {
          newState[existingKey] = false; // Close sibling
        }
      });
      
      // Toggle the clicked item
      newState[key] = !prev[key];
      
      // Ensure parent remains open (safety check)
      if (newState[key]) {
        let currentParent = parentKey;
        while (currentParent) {
          newState[currentParent] = true;
          if (currentParent.includes('-')) {
            currentParent = currentParent.substring(0, currentParent.lastIndexOf('-'));
          } else {
            // Reached top level
            newState[currentParent] = true;
            break;
          }
        }
      }
      
      return newState;
    });
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

        {/* Navigation — filtered by role's moduleAccess */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {filteredNavigation.map((item, index) => renderNavItem(item, index))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
