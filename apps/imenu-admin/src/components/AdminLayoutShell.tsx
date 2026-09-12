'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

interface SidebarContextType {
  isMobile: boolean;
  isSidebarOpen: boolean;
  isCollapsed: boolean;
  toggleSidebar: () => void;
  toggleCollapsed: () => void;
  closeSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isMobile: false,
  isSidebarOpen: false,
  isCollapsed: false,
  toggleSidebar: () => {},
  toggleCollapsed: () => {},
  closeSidebar: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

export const AdminLayoutShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // Auto-detect viewport size & handle auto-responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-close sidebar on route change when on mobile/tablet
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [pathname, isMobile]);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen((prev) => !prev);
    } else {
      setIsCollapsed((prev) => !prev);
    }
  };

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <SidebarContext.Provider
      value={{
        isMobile,
        isSidebarOpen,
        isCollapsed,
        toggleSidebar,
        toggleCollapsed,
        closeSidebar,
      }}
    >
      <div className="min-h-screen bg-[#f4f6f4] antialiased text-[#1e2924] flex w-full max-w-full overflow-x-hidden">
        {/* Mobile Backdrop Overlay */}
        {isMobile && isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity duration-300"
            onClick={closeSidebar}
            aria-label="Đóng thanh điều hướng"
          />
        )}

        {/* Dynamic Sidebar */}
        <AdminSidebar />

        {/* Main Content Area */}
        <div
          className={`flex-1 min-w-0 w-full max-w-full flex flex-col min-h-screen transition-[margin] duration-300 ease-in-out ${
            isMobile ? 'ml-0' : isCollapsed ? 'ml-20' : 'ml-64'
          }`}
        >
          <AdminHeader />
          <main className="p-3 sm:p-6 lg:p-8 flex-1 min-w-0 w-full max-w-full overflow-x-hidden">{children}</main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
};
