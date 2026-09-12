'use client';

import React, { useState, useEffect } from 'react';
import { storageService, realtimeHub, soundEngine } from '@imenu/utils';
import { useSidebar } from './AdminLayoutShell';
import { Bell, Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

export const AdminHeader: React.FC = () => {
  const { isMobile, isCollapsed, toggleSidebar } = useSidebar();
  const [isOpen, setIsOpen] = useState(true);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [showNotificationList, setShowNotificationList] = useState(false);

  useEffect(() => {
    const unsub = realtimeHub.subscribe('*', (payload) => {
      if (payload.type === 'NEW_ORDER') {
        soundEngine.playNewOrderChime();
        setNotifications((prev) => [
          `Đơn hàng mới từ ${payload.data.tableName} (${payload.data.items.length} món)`,
          ...prev,
        ]);
      } else if (payload.type === 'CALL_STAFF') {
        soundEngine.playNewOrderChime();
        setNotifications((prev) => [
          `🔔 ${payload.data.tableName}: "${payload.data.reason}"`,
          ...prev,
        ]);
      } else if (payload.type === 'PAYMENT_REQUESTED') {
        soundEngine.playReadyChime();
        setNotifications((prev) => [
          `💵 Yêu cầu thanh toán đơn hàng ${payload.data.orderId}`,
          ...prev,
        ]);
      }
    });

    return () => unsub();
  }, []);

  return (
    <header className="h-16 bg-white border-b border-[#e4e8e5] sticky top-0 z-30 flex items-center justify-between px-3 sm:px-6 shadow-2xs w-full min-w-0 max-w-full">
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Sidebar Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="p-2 -ml-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          title={isMobile ? 'Mở thanh điều hướng' : isCollapsed ? 'Mở rộng thanh bên' : 'Thu gọn thanh bên'}
          aria-label="Đóng/Mở thanh điều hướng"
        >
          {isMobile ? (
            <Menu className="w-5 h-5" />
          ) : isCollapsed ? (
            <PanelLeftOpen className="w-5 h-5 text-[#176044]" />
          ) : (
            <PanelLeftClose className="w-5 h-5 text-slate-600" />
          )}
        </button>

        {/* Store Status Toggle */}
        <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-slate-100 text-xs font-semibold">
          <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <span className="text-slate-700 hidden sm:inline">{isOpen ? 'Đang mở cửa' : 'Tạm đóng cửa'}</span>
          <span className="text-slate-700 sm:hidden">{isOpen ? 'Mở cửa' : 'Đóng'}</span>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="ml-0.5 sm:ml-1 text-[10px] text-[#176044] font-bold hover:underline cursor-pointer"
          >
            Đổi
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotificationList(!showNotificationList)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl relative cursor-pointer"
            title="Thông báo"
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-bounce">
                {notifications.length}
              </span>
            )}
          </button>

          {showNotificationList && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 space-y-2 z-50 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 font-bold text-slate-800">
                <span>Thông báo Real-time</span>
                {notifications.length > 0 && (
                  <button
                    onClick={() => setNotifications([])}
                    className="text-[10px] text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    Xóa hết
                  </button>
                )}
              </div>
              <div className="max-h-56 overflow-y-auto space-y-1.5">
                {notifications.length === 0 ? (
                  <p className="text-center py-4 text-slate-400">Không có thông báo mới</p>
                ) : (
                  notifications.map((msg, i) => (
                    <div key={i} className="p-2 bg-slate-50 rounded-lg text-slate-700 font-medium">
                      {msg}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User profile */}
        <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-[#124a36] text-white grid place-items-center font-bold text-xs shrink-0">
            A
          </div>
          <div className="hidden md:block text-left">
            <strong className="text-xs text-slate-900 block leading-tight">Nguyễn Minh An</strong>
            <small className="text-[10px] text-slate-500">Chủ nhà hàng</small>
          </div>
        </div>
      </div>
    </header>
  );
};
