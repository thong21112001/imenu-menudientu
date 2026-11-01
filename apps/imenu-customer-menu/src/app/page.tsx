'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Logo,
  Button,
  Tilt3DCard,
  CinematicSection,
  CinematicScrollProgress,
  AmbientCinematicStage,
} from '@imenu/ui';
import { storageService, apiClient } from '@imenu/utils';
import { Table } from '@imenu/types';
import {
  QrCode,
  ArrowRight,
  Store,
  Clock,
  Utensils,
  Receipt,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';

export default function CustomerIndexPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [activeZone, setActiveZone] = useState<string>('all');
  const [zones, setZones] = useState<{ id: string; name: string }[]>([
    { id: 'all', name: 'Tất cả bàn' },
    { id: 'zone-1', name: 'Tầng 1' },
    { id: 'zone-2', name: 'Tầng 2 (Máy Lạnh)' },
    { id: 'zone-3', name: 'Sân Vườn' },
    { id: 'zone-vip', name: 'Phòng VIP' },
  ]);
  const [restaurantName, setRestaurantName] = useState<string>('Bếp Nhà');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function loadPublicTables() {
      try {
        setIsLoading(true);
        const res = await apiClient.tables.listPublicBySlug('bep-nha');
        if (isMounted && res?.data?.tables && res.data.tables.length > 0) {
          setTables(res.data.tables as any);
          if (res.data.zones && res.data.zones.length > 0) {
            setZones([
              { id: 'all', name: 'Tất cả bàn' },
              ...res.data.zones.map((z: any) => ({
                id: z.id || z._id,
                name: z.name,
              })),
            ]);
          }
          if (res.data.restaurant?.name) {
            setRestaurantName(res.data.restaurant.name);
          }
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn('API listPublicBySlug failed, falling back to storage:', err);
      }

      if (isMounted) {
        const localTables = storageService.getTables();
        setTables(localTables);
        setIsLoading(false);
      }
    }

    loadPublicTables();

    return () => {
      isMounted = false;
    };
  }, []);

  const ban08Table = tables.find((t) => t.code === 'ban-08');
  const ban08Href = `/menu/bep-nha/ban-08${ban08Table?.qrToken ? `?t=${encodeURIComponent(ban08Table.qrToken)}` : ''}`;

  const filteredTables = tables.filter(
    (t) => activeZone === 'all' || t.zoneId === activeZone
  );

  const scenes = [
    { id: 'scene-01', label: 'Mở màn', badge: 'CẢNH 01' },
    { id: 'scene-02', label: 'Bàn 08 3D', badge: 'CẢNH 02' },
    { id: 'scene-03', label: 'Sơ đồ bàn', badge: 'CẢNH 03' },
    { id: 'scene-04', label: 'Nhịp phục vụ', badge: 'CẢNH 04' },
  ];

  return (
    <div className="min-h-screen bg-[#0d1310] text-[#ede7da] flex flex-col justify-between selection:bg-[#dfa035]/30 selection:text-[#ede7da] overflow-x-hidden w-full relative">
      {/* 3D Cinematic Scroll Progress & Ambient Background Stage */}
      <CinematicScrollProgress scenes={scenes} />
      <AmbientCinematicStage variant="dark" />

      {/* MAIN RESPONSIVE WRAPPER */}
      <main className="w-full max-w-lg sm:max-w-2xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-10 sm:space-y-14 flex-1 relative z-10">
        
        {/* CẢNH 01 · MỞ MÀN */}
        <CinematicSection
          id="scene-01"
          sceneBadge="CẢNH 01 · MỞ MÀN"
          className="text-center space-y-4 pt-2 sm:pt-4"
        >
          <div className="inline-flex items-center justify-center p-2.5 rounded-2xl bg-[#151f1b]/90 shadow-xl border border-[#26352e] mb-1">
            <Logo size="lg" light />
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#245846]/20 border border-[#245846]/40 text-[#34a87a] text-xs sm:text-sm font-bold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#dfa035] animate-pulse inline-block" />
              <span>Hệ Thống Thực Đơn Điện Tử · Chiều Sâu 3D & Chạm QR</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#ede7da] tracking-tight">
            Chọn Bàn Trải Nghiệm 3D
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-[#98a69e] max-w-2xl mx-auto leading-relaxed px-2">
            Mô phỏng trải nghiệm quét mã QR thông minh tại nhà hàng {restaurantName}. Tự động định danh bàn, gọi món không chạm, đối soát bill tức thì.
          </p>
        </CinematicSection>

        {/* CẢNH 02 · BÀN 08 3D HERO CARD */}
        <CinematicSection
          id="scene-02"
          sceneBadge="CẢNH 02 · TIÊU ĐIỂM"
          sceneTitle="Bàn 08 · Trải Nghiệm Mẫu Sẵn Sàng"
          sceneSubtitle="Bàn mẫu đã lên sẵn đơn món để quý khách thử nghiệm toàn bộ vòng đời phục vụ."
        >
          <Tilt3DCard
            maxTilt={8}
            className="rounded-3xl p-6 sm:p-8 lg:p-10 border-2 border-[#dfa035]/40 cinematic-card-surface shadow-2xl relative overflow-hidden"
          >
            {/* Subtle lantern-amber background glow */}
            <div className="absolute -right-16 -bottom-16 w-60 h-60 bg-[#dfa035]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-16 -top-16 w-60 h-60 bg-[#245846]/25 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 md:grid md:grid-cols-12 md:gap-8 md:items-center space-y-5 md:space-y-0" style={{ transform: 'translateZ(20px)' }}>
              {/* Left Col: Info & Description */}
              <div className="md:col-span-7 space-y-3.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#dfa035] text-[#080c0a] text-[11px] sm:text-xs font-black tracking-wide uppercase shadow-md">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Gợi Ý Thử Nghiệm Nhanh
                  </span>
                  <span className="text-[11px] sm:text-xs text-[#34a87a] font-semibold flex items-center gap-1.5 bg-[#151f1b]/80 px-2.5 py-1 rounded-full backdrop-blur-sm border border-[#26352e]">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#dfa035] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#dfa035]"></span>
                    </span>
                    Đang có đơn hoạt động
                  </span>
                </div>

                <div>
                  <h2 className="text-xl sm:text-3xl font-black text-[#ede7da] tracking-tight">
                    Bàn 08 · Tầng 2 (Máy Lạnh)
                  </h2>
                  <p className="text-xs sm:text-sm text-[#98a69e] mt-2 leading-relaxed max-w-xl">
                    Bàn này đã được thiết lập sẵn 2 món ăn demo (Phở Bò Tái Nạm, Trà Đào Cam Sả). Thích hợp nhất để test quy trình gọi thêm món, gọi nhân viên, và thanh toán VietQR.
                  </p>
                </div>
              </div>

              {/* Right Col: Metrics & Action CTA */}
              <div className="md:col-span-5 flex flex-col justify-center space-y-4" style={{ transform: 'translateZ(30px)' }}>
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="flex items-center gap-2.5 bg-[#121a16]/80 px-3.5 py-3 rounded-2xl border border-[#26352e]">
                    <Utensils className="w-4 h-4 text-[#dfa035] shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[10px] text-[#98a69e] block uppercase tracking-wider font-semibold">Trạng thái</span>
                      <strong className="text-xs sm:text-[13px] text-[#ede7da] font-bold truncate block">2 món đang nấu</strong>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 bg-[#121a16]/80 px-3.5 py-3 rounded-2xl border border-[#26352e]">
                    <Receipt className="w-4 h-4 text-[#dfa035] shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[10px] text-[#98a69e] block uppercase tracking-wider font-semibold">Tạm tính</span>
                      <strong className="text-xs sm:text-[13px] text-[#dfa035] font-bold truncate block">216.000đ</strong>
                    </div>
                  </div>
                </div>

                <Link href={ban08Href} className="block w-full">
                  <Button
                    variant="amber"
                    size="lg"
                    className="w-full py-3.5 sm:py-4 text-sm sm:text-base font-black shadow-xl hover:shadow-[#dfa035]/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Vào Trải Nghiệm Bàn 08 Ngay</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </Tilt3DCard>
        </CinematicSection>

        {/* CẢNH 03 · SƠ ĐỒ BÀN */}
        <CinematicSection
          id="scene-03"
          sceneBadge="CẢNH 03 · SƠ ĐỒ BÀN"
          sceneTitle={`Danh Sách Bàn Ăn ${restaurantName}`}
          sceneSubtitle="Chọn một vị trí bàn bên dưới để vào không gian thực đơn điện tử."
          className="p-5 sm:p-7 lg:p-8 bg-[#151f1b]/90 backdrop-blur-md rounded-3xl border border-[#26352e] shadow-2xl space-y-6"
        >
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#26352e]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#245846]/20 border border-[#245846]/40 grid place-items-center text-[#34a87a] shrink-0">
                <Store className="w-5 h-5 text-[#34a87a]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-[#ede7da]">
                  Sơ Đồ Phục Vụ Trực Quan
                </h3>
                <p className="text-xs text-[#98a69e] hidden sm:block mt-0.5">
                  Chạm vào một bàn để mở thực đơn điện tử tương tác
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#245846]/20 text-[#34a87a] border border-[#245846]/40">
                {filteredTables.length} bàn hiển thị
              </span>
            </div>
          </div>

          {/* Zone filter pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap items-center">
            {zones.map((z) => {
              const count = z.id === 'all' 
                ? tables.length 
                : tables.filter((t) => t.zoneId === z.id).length;
              return (
                <button
                  key={z.id}
                  onClick={() => setActiveZone(z.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    activeZone === z.id
                      ? 'bg-[#dfa035] text-[#080c0a] shadow-md ring-2 ring-[#dfa035]/30'
                      : 'bg-[#18231e] text-[#98a69e] hover:bg-[#202e27] hover:text-[#ede7da] border border-[#26352e]'
                  }`}
                >
                  <span>{z.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                      activeZone === z.id
                        ? 'bg-[#080c0a]/20 text-[#080c0a]'
                        : 'bg-[#26352e] text-[#98a69e]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Tables Responsive Grid wrapped in Tilt3DCard */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 pt-1">
            {filteredTables.map((tbl) => {
              const isBan08 = tbl.code === 'ban-08';
              const isOccupied = tbl.status === 'Occupied' || isBan08;
              const tableHref = `/menu/bep-nha/${tbl.code}${(tbl as any).qrToken ? `?t=${encodeURIComponent((tbl as any).qrToken)}` : ''}`;

              return (
                <Link key={tbl.id || tbl.code} href={tableHref} className="block group">
                  <Tilt3DCard
                    maxTilt={6}
                    className={`p-4 sm:p-4.5 rounded-2xl border transition-all flex flex-col justify-between min-h-[115px] sm:min-h-[125px] cursor-pointer shadow-xs ${
                      isBan08
                        ? 'bg-[#18231e] border-[#dfa035]/50 ring-1 ring-[#dfa035]/30'
                        : 'bg-[#151f1b] hover:bg-[#18231e] border-[#26352e] hover:border-[#34a87a]/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <strong className="text-sm sm:text-base font-bold text-[#ede7da] group-hover:text-[#dfa035] block transition-colors truncate">
                          {tbl.name}
                        </strong>
                        <span className="text-[11px] sm:text-xs font-medium text-[#98a69e] block mt-0.5 truncate">
                          {tbl.zoneName}
                        </span>
                      </div>

                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#18231e] border border-[#26352e] group-hover:border-[#dfa035] group-hover:bg-[#dfa035] text-[#98a69e] group-hover:text-[#080c0a] grid place-items-center transition-all shrink-0 shadow-xs">
                        <QrCode className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="pt-2.5 flex items-center justify-between border-t border-[#26352e] mt-2">
                      <span
                        className={`text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1.5 ${
                          isOccupied
                            ? 'bg-[#dfa035]/15 text-[#dfa035] border border-[#dfa035]/30'
                            : 'bg-[#34a87a]/15 text-[#34a87a] border border-[#34a87a]/30'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isOccupied ? 'bg-[#dfa035] animate-pulse' : 'bg-[#34a87a]'
                          }`}
                        />
                        {isOccupied ? 'Đang dùng' : 'Bàn trống'}
                      </span>

                      <span className="text-[10px] sm:text-xs font-bold text-[#dfa035] opacity-0 group-hover:opacity-100 transition-all flex items-center gap-0.5">
                        Mở menu →
                      </span>
                    </div>
                  </Tilt3DCard>
                </Link>
              );
            })}
          </div>
        </CinematicSection>

        {/* CẢNH 04 · NHỊP PHỤC VỤ */}
        <CinematicSection
          id="scene-04"
          sceneBadge="CẢNH 04 · NHỊP PHỤC VỤ"
          sceneTitle="Tối Ưu Từng Giây Phút Trải Nghiệm"
          sceneSubtitle="Hệ sinh thái liên thông từ bàn ăn của thực khách đến màn hình bếp và thu ngân."
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 pt-1"
        >
          <Tilt3DCard
            maxTilt={6}
            className="p-5 bg-[#151f1b]/90 backdrop-blur-md rounded-2xl border border-[#26352e] shadow-lg flex sm:flex-col items-center sm:items-start gap-3 sm:gap-0 transition-all hover:border-[#34a87a]/50"
          >
            <div className="w-10 h-10 rounded-xl bg-[#245846]/20 border border-[#245846]/40 grid place-items-center text-[#34a87a] shrink-0 sm:mb-2.5">
              <Smartphone className="w-5 h-5 text-[#34a87a]" />
            </div>
            <div>
              <strong className="text-xs sm:text-sm font-bold text-[#ede7da] block">Gọi Món Ngay</strong>
              <p className="text-[11px] sm:text-xs text-[#98a69e] mt-0.5">Không cần chờ phục vụ, tự quét QR chọn món 3D</p>
            </div>
          </Tilt3DCard>

          <Tilt3DCard
            maxTilt={6}
            className="p-5 bg-[#151f1b]/90 backdrop-blur-md rounded-2xl border border-[#26352e] shadow-lg flex sm:flex-col items-center sm:items-start gap-3 sm:gap-0 transition-all hover:border-[#dfa035]/50"
          >
            <div className="w-10 h-10 rounded-xl bg-[#dfa035]/15 border border-[#dfa035]/30 grid place-items-center text-[#dfa035] shrink-0 sm:mb-2.5">
              <Clock className="w-5 h-5 text-[#dfa035]" />
            </div>
            <div>
              <strong className="text-xs sm:text-sm font-bold text-[#ede7da] block">Bếp Nhận Tức Thì</strong>
              <p className="text-[11px] sm:text-xs text-[#98a69e] mt-0.5">Báo chuông Realtime, chế biến liền tay không chậm trễ</p>
            </div>
          </Tilt3DCard>

          <Tilt3DCard
            maxTilt={6}
            className="p-5 bg-[#151f1b]/90 backdrop-blur-md rounded-2xl border border-[#26352e] shadow-lg flex sm:flex-col items-center sm:items-start gap-3 sm:gap-0 transition-all hover:border-[#c85a32]/50"
          >
            <div className="w-10 h-10 rounded-xl bg-[#c85a32]/15 border border-[#c85a32]/30 grid place-items-center text-[#c85a32] shrink-0 sm:mb-2.5">
              <Receipt className="w-5 h-5 text-[#c85a32]" />
            </div>
            <div>
              <strong className="text-xs sm:text-sm font-bold text-[#ede7da] block">VietQR Chuẩn Xác</strong>
              <p className="text-[11px] sm:text-xs text-[#98a69e] mt-0.5">Quét mã thanh toán tự động, đối soát tức thì</p>
            </div>
          </Tilt3DCard>
        </CinematicSection>
      </main>

      {/* BRAND FOOTER */}
      <footer className="w-full border-t border-[#26352e] bg-[#0b100e]/90 backdrop-blur-md mt-8 py-5 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#98a69e]">
          <div className="flex items-center gap-2">
            <Logo size="sm" light />
            <span className="text-[#26352e] hidden sm:inline">|</span>
            <span className="font-semibold text-[#ede7da] hidden sm:inline">Hệ thống Thực đơn Số hóa QR Thông minh</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-[11px] sm:text-xs text-[#98a69e] flex-wrap justify-center">
            <span className="flex items-center gap-1.5 font-medium text-[#34a87a] bg-[#245846]/20 px-2.5 py-0.5 rounded-full border border-[#245846]/40">
              <span className="w-2 h-2 rounded-full bg-[#34a87a] animate-pulse"></span>
              Hệ thống hoạt động bình thường
            </span>
            <span className="hidden sm:inline text-[#26352e]">•</span>
            <span className="font-medium">Tương thích mọi thiết bị di động</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
