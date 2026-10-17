'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { Button } from '@imenu/ui';
import {
  BookOpen,
  Search,
  CheckCircle2,
  ChevronRight,
  Clock,
  Tag,
  ArrowRight,
  X,
  FileSpreadsheet,
  ShieldAlert,
  Flame,
  Laptop,
  UtensilsCrossed,
  ShoppingBag,
  Store,
  ChefHat,
  Building2,
  Sparkles,
  Share2,
  CheckSquare,
  Square,
  SlidersHorizontal,
  Bookmark,
  ExternalLink,
} from 'lucide-react';

interface Article {
  id: string;
  category: 'Mở quán & Pháp lý' | 'Vận hành & Chống thất thoát' | 'Tài chính & Giá vốn' | 'Công nghệ & Menu QR';
  title: string;
  summary: string;
  readTime: string;
  badge: string;
  badgeColor: string;
  icon: React.ElementType;
  iconBg: string;
  lead: string;
  sections: {
    heading: string;
    paragraphs: string[];
    callout?: string;
  }[];
  checklist: string[];
  systemFeatureTip: string;
}

const ARTICLES: Article[] = [
  {
    id: 'thue-khoan-2026-so-sach-doanh-thu',
    category: 'Mở quán & Pháp lý',
    title: 'Bỏ thuế khoán 2026: Hộ kinh doanh quán ăn, cafe ghi sổ doanh thu thế nào & cách xuất báo cáo CSV/Excel chuẩn trên iMenu',
    summary: 'Phân tích lộ trình chuyển đổi số quản lý thuế hộ kinh doanh F&B 2026. Hướng dẫn trích xuất hóa đơn, doanh thu theo ca và bảng kê mặt hàng chuẩn UTF-8.',
    readTime: '6 phút đọc',
    badge: 'Pháp lý 2026',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    icon: FileSpreadsheet,
    iconBg: 'bg-rose-50 text-rose-600 border-rose-200',
    lead: 'Từ năm 2026, cơ quan thuế đẩy mạnh lộ trình xóa bỏ thuế khoán áp đặt và khuyến khích hộ kinh doanh cá thể ứng dụng phần mềm ghi nhận doanh thu thực tế minh bạch. Đây là bước ngoặt buộc các chủ quán ăn, tiệm cà phê phải có hệ thống ghi nhận hóa đơn điện tử và sổ sách doanh thu chuẩn xác.',
    sections: [
      {
        heading: '1. Bản chất thay đổi: Từ thuế khoán ước tính sang quản lý doanh thu thực',
        paragraphs: [
          'Trước đây, đa phần quán ăn gia đình nộp thuế khoán cố định theo doanh thu khoán do cán bộ thuế địa phương ấn định hàng năm. Tuy nhiên, việc thanh toán không dùng tiền mặt (VietQR, thẻ ngân hàng) bùng nổ khiến dòng tiền thực của quán hiển thị rõ ràng trên hệ thống ngân hàng.',
          'Khi cơ quan thuế đối soát số dư tài khoản giao dịch, nếu số liệu thu thực tế lệch xa so với mức khoán kê khai, chủ hộ kinh doanh đối mặt với nguy cơ truy thu và phạt chậm nộp. Do đó, việc chủ động ghi sổ doanh thu hàng ngày trên phần mềm là chiếc khiên bảo vệ pháp lý an toàn nhất.',
        ],
        callout: 'Lưu ý: Dữ liệu doanh thu đối chiếu cần khớp giữa 3 nguồn: Sổ hóa đơn bán hàng trên POS, Dòng tiền giao dịch VietQR ngân hàng, và Báo cáo thuế kê khai hàng quý.',
      },
      {
        heading: '2. Cấu trúc sổ doanh thu bán lẻ chuẩn mà hộ F&B cần duy trì',
        paragraphs: [
          'Hộ kinh doanh theo phương pháp kê khai không cần hệ thống kế toán kép phức tạp như doanh nghiệp, nhưng bắt buộc lưu trữ 4 trường dữ liệu trọng yếu của mỗi lượt bán:',
          '• Mã hóa đơn duy nhất (Invoice/Bill ID không trùng lặp, không bị nhảy số ngẫu nhiên).\n• Thời gian thanh toán chính xác (Giờ, ngày, tháng, năm).\n• Chi tiết danh mục món ăn, đơn giá, số lượng và tổng số tiền thanh toán thực tế.\n• Phương thức thanh toán (Tiền mặt Cash hoặc Chuyển khoản VietQR).',
        ],
      },
      {
        heading: '3. Cách trích xuất báo cáo CSV/Excel UTF-8 trên iMenu chỉ trong 30 giây',
        paragraphs: [
          'Trên phân hệ Quản trị Admin của iMenu (mục Báo cáo Doanh thu), chủ nhà hàng có thể lọc theo khoảng ngày, theo ca làm việc hoặc theo từng chi nhánh cụ thể.',
          'Hệ thống tích hợp sẵn nút "Xuất Excel / CSV (UTF-8)". File xuất ra đã được định dạng chuẩn font chữ tiếng Việt, phân tách rõ cột Doanh thu gộp, Giảm giá/Khuyến mãi, Doanh thu thuần và Phân loại thanh toán để nộp thẳng cho kế toán dịch vụ lập tờ khai.',
        ],
      },
    ],
    checklist: [
      'Tách riêng tài khoản ngân hàng kinh doanh của quán với tài khoản chi tiêu cá nhân gia đình.',
      'Đảm bảo 100% đơn món đều được nhân viên thu ngân bấm "Thanh toán" để sinh mã Bill trên hệ thống.',
      'Thiết lập thói quen xuất file báo cáo doanh thu CSV vào ngày cuối cùng của mỗi tháng và lưu trữ đám mây.',
      'Kiểm tra định kỳ tỷ lệ chênh lệch giữa tiền mặt két và doanh thu ghi nhận trong ca làm việc.',
    ],
    systemFeatureTip: 'Tính năng Báo cáo Doanh thu của iMenu hỗ trợ xuất file Excel có mã hóa UTF-8 chống lỗi font tiếng Việt, hiển thị đầy đủ chi tiết từng Bill và mã tham chiếu VietQR.',
  },
  {
    id: 'chong-da-bill-that-thoat-audit-log',
    category: 'Vận hành & Chống thất thoát',
    title: 'Dấu hiệu nhân viên "đá bill", hủy món sau khi thu tiền và 7 chốt chặn phòng ngừa bằng Nhật ký Kiểm toán (Audit Log) & RBAC',
    summary: 'Vạch trần các chiêu trò gian lận thu ngân tinh vi trong quán ăn, quán cafe và cách iMenu sử dụng mô hình hóa đơn bất biến cùng phân quyền 5 cấp độ để triệt tiêu thất thoát.',
    readTime: '8 phút đọc',
    badge: 'Chống thất thoát',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: ShieldAlert,
    iconBg: 'bg-amber-50 text-amber-700 border-amber-200',
    lead: 'Thất thoát doanh thu trong ngành F&B không chỉ đến từ nguyên vật liệu hư hỏng mà phần lớn xuất phát từ gian lận nội bộ tại quầy thu ngân. Phổ biến nhất là hành vi "đá bill" — nhân viên in tạm tính cho khách lấy tiền mặt, sau đó hủy món hoặc hủy bàn trên hệ thống để bỏ túi riêng.',
    sections: [
      {
        heading: '1. "Đá bill" diễn ra như thế nào khi chủ quán vắng mặt?',
        paragraphs: [
          'Kịch bản kinh điển: Khách gọi món, nhân viên phục vụ mang đồ. Khi khách gọi thanh toán bằng tiền mặt, thu ngân in "Phiếu tạm tính" hoặc tính miệng tổng tiền (ví dụ 350.000đ). Khách đưa tiền mặt và rời đi mà không cần lấy hóa đơn đỏ.',
          'Ngay sau đó, thu ngân bấm nút "Hủy bàn" hoặc xóa bớt 3 món đắt tiền trong đơn với lý do "Khách hủy do bếp làm chậm", chuyển hóa đơn về 0đ hoặc 50.000đ. Số tiền chênh lệch 300.000đ lọt vào túi cá nhân mà chủ quán kiểm kê cuối ngày không thể phát hiện nếu không có hệ thống kiểm soát hành vi.',
        ],
        callout: 'Dấu hiệu nhận biết: Số lượng đơn hủy hoặc món hủy tập trung bất thường vào những khung giờ đông khách hoặc những ngày chủ quán không có mặt tại cơ sở.',
      },
      {
        heading: '2. Cơ chế Hóa đơn Bất biến (Immutable Bill) trên iMenu',
        paragraphs: [
          'Trên hệ thống iMenu, một khi hóa đơn đã được xác nhận thanh toán (Status = PAID), bản ghi Bill trong cơ sở dữ liệu sẽ bị khóa cứng. Không một ai — kể cả Thu ngân hay Quản lý chi nhánh — có thể sửa giá tiền hoặc xóa món đã bán.',
          'Nếu cần hủy hóa đơn sai sót, hệ thống bắt buộc ghi nhận trạng thái CANCELLED kèm Lý do hủy cụ thể và lưu vết vĩnh viễn trong cơ sở dữ liệu, không thể xóa vật lý.',
        ],
      },
      {
        heading: '3. Nhật ký kiểm toán (ActivityLog) & Phân quyền RBAC 5 cấp độ',
        paragraphs: [
          'Mỗi thao tác nhạy cảm trên iMenu (Hủy món, Gộp bàn, Chuyển bàn, Áp mã giảm giá, Đóng ca) đều tự động kích hoạt tạo 1 dòng ActivityLog:',
          '• Ai thực hiện (Tên nhân viên & Mã tài khoản).\n• Thời điểm chính xác đến từng giây.\n• Dữ liệu trước và sau khi thay đổi (Ví dụ: Bàn 04 đổi từ 4 món thành 2 món).\n• Địa chỉ IP và thiết bị truy cập.',
          'Kết hợp cùng mô hình RBAC: Nhân viên phục vụ không được cấp quyền hủy món; chỉ Quản lý cơ sở hoặc Chủ nhà hàng mới có quyền xác nhận điều chỉnh.',
        ],
      },
    ],
    checklist: [
      'Tuyệt đối không cấp tài khoản quyền "Quản lý / Admin" cho nhân viên thu ngân thông thường.',
      'Dán biển thông báo tại quầy: "Quý khách vui lòng yêu cầu hóa đơn in nhiệt từ hệ thống để đảm bảo quyền lợi".',
      'Kiểm tra mục Nhật ký Hoạt động (Activity Log) trên iMenu vào cuối mỗi ngày, đặc biệt lọc các sự kiện CANCEL_ITEM và CANCEL_ORDER.',
      'Khuyến khích khách quét VietQR để tiền về thẳng tài khoản chủ quán, triệt tiêu giao dịch tiền mặt.',
    ],
    systemFeatureTip: 'Nhật ký Hoạt động (ActivityLog) trên iMenu tự động che mặt nạ thông tin nhạy cảm và lưu trữ toàn bộ lịch sử thao tác của từng nhân viên theo thời gian thực.',
  },
  {
    id: 'chong-quen-mon-order-round-kds',
    category: 'Vận hành & Chống thất thoát',
    title: 'Giải bài toán quán nhậu & quán ăn đông khách tối: Chống quên món ở các lượt gọi thêm (Round 2, Round 3) bằng Order Round & KDS',
    summary: 'Cách xử lý tình trạng khách gọi bia, nướng thêm đợt 2 bị sót hoặc phục vụ lộn xộn. Mô hình điều phối bếp FIFO nhiều đợt gọi món mượt mà không cần nhân viên ghi giấy.',
    readTime: '7 phút đọc',
    badge: 'Vận hành giờ cao điểm',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: Flame,
    iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    lead: 'Đối với các quán lẩu nướng, bia hơi và nhà hàng ăn tối, khách hàng hầu như không bao giờ chỉ gọi món 1 lần. 70% doanh thu đến từ các đợt gọi thêm (Round 2 gọi thêm bia/mực nướng, Round 3 gọi lẩu/mì xào). Tuy nhiên, đây cũng chính là lúc sai sót xảy ra nhiều nhất do nhân viên quên ghi sổ hoặc phiếu bếp bị đè lẫn lộn.',
    sections: [
      {
        heading: '1. Nỗi đau: Phiếu giấy thất lạc và khách giục "Sao bàn đến sau có trước?"',
        paragraphs: [
          'Khi quán đạt công suất 80%–100% bàn vào khung giờ 19h–21h, nhân viên chạy đôn chạy đáo nhận order miệng hoặc ghi giấy note kẹp vào que cắm ở bếp. Phiếu gọi đợt 2 rất dễ bị gió thổi bay, dính nước dầu mỡ hoặc đầu bếp bốc nhầm phiếu mới làm trước phiếu cũ.',
          'Hậu quả là khách bàn 05 chờ 30 phút chưa có đĩa lòng xào, trong khi bàn 12 mới vào lại được phục vụ trước. Khách bực bội, hủy món và để lại đánh giá 1 sao.',
        ],
      },
      {
        heading: '2. Giải pháp Order Round (Đợt gọi món) trên iMenu',
        paragraphs: [
          'Hệ thống iMenu quản lý đơn hàng theo cơ chế phân đợt gọi món tự động (Round 1, Round 2, Round 3...):',
          '• Khách tại bàn quét QR gọi thêm 5 chai bia và 1 đĩa bò né: Đơn tự động gộp vào Order của Bàn hiện tại dưới dạng "Đợt 2" (Round 2).\n• Bàn không bị tách làm 2 hóa đơn rác rưởi, nhân viên không cần gom thủ công.\n• Thu ngân trên màn hình POS nhìn thấy ngay thông báo đợt gọi mới kèm âm thanh cảnh báo trực quan.',
        ],
      },
      {
        heading: '3. Điều phối bếp KDS chuẩn FIFO (Vào trước — Nấu trước)',
        paragraphs: [
          'Trên Màn hình Bếp KDS (Kitchen Display System) của iMenu:',
          '• Từng món ăn của Round 2 xuất hiện theo thứ tự thời gian bấm gọi.\n• Có đồng hồ đếm phút từ lúc đặt (0 phút -> 5 phút -> cảnh báo đỏ khi quá 15 phút).\n• Đầu bếp chạm 1 chạm để chuyển trạng thái "Đang nấu" -> "Đã nấu xong", nhân viên chạy bàn nhìn màn hình phục vụ ngay lập tức.',
        ],
      },
    ],
    checklist: [
      'Dán mã QR có chân mica chắc chắn tại từng bàn để khách chủ động gọi thêm món mà không phải đợi nhân viên.',
      'Trang bị 1 máy tính bảng hoặc màn hình máy tính cũ tại khu vực bếp để hiển thị KDS.',
      'Thiết lập quy định: Đầu bếp chỉ chế biến theo thứ tự vé hiển thị trên màn hình KDS, không nhận lệnh miệng.',
      'Theo dõi chỉ số thời gian nấu trung bình mỗi món trên báo cáo để tối ưu tốc độ sơ chế của bếp.',
    ],
    systemFeatureTip: 'Tính năng Order Round của iMenu cho phép 1 bàn ăn gọi nhiều đợt món liên tiếp; hệ thống tự động gộp vào 1 hóa đơn tổng duy nhất khi thanh toán.',
  },
  {
    id: 'so-sanh-phan-mem-pos-cloud-vs-cai-dat',
    category: 'Công nghệ & Menu QR',
    title: 'So sánh phần mềm quản lý quán nhỏ 2026: Giải pháp Cloud chạy trên trình duyệt 0đ vs Phần mềm POS cài đặt truyền thống',
    summary: 'Bóc tách chi phí phần cứng, phí duy trì hàng năm, độ linh hoạt và khả năng kháng lỗi khi mất mạng giữa hai trường phái công nghệ quản lý F&B.',
    readTime: '6 phút đọc',
    badge: 'So sánh công nghệ',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
    icon: Laptop,
    iconBg: 'bg-teal-50 text-teal-700 border-teal-200',
    lead: 'Nhiều chủ quán mới mở thường phân vân: Nên bỏ 15–25 triệu mua trọn bộ máy POS cảm ứng chuyên dụng cồng kềnh, hay sử dụng các phần mềm Cloud Web hiện đại chạy thẳng trên điện thoại, máy tính bảng và laptop sẵn có?',
    sections: [
      {
        heading: '1. Chi phí đầu tư ban đầu: Rào cản lớn cho quán khởi nghiệp',
        paragraphs: [
          'Với phần mềm POS truyền thống (dạng file cài đặt .exe trên Windows), quán bắt buộc phải đầu tư máy POS chuyên dụng màn hình cảm ứng điện trở giá từ 10 đến 18 triệu đồng, cộng thêm phí bản quyền trọn đời hoặc phí thuê bao 150k–300k/tháng.',
          'Ngược lại, giải pháp Cloud Web như iMenu tận dụng 100% thiết bị sẵn có: Chiếc iPad cũ của con, laptop cá nhân của chủ quán hay chính chiếc điện thoại smartphone của nhân viên đều trở thành máy POS thu ngân mượt mà.',
        ],
      },
      {
        heading: '2. Tốc độ cập nhật tính năng và khả năng nâng cấp',
        paragraphs: [
          'Phần mềm cài đặt cục bộ rất khó nâng cấp tính năng mới. Mỗi lần muốn tích hợp mã thanh toán VietQR động hay menu QR tại bàn, chủ quán phải gọi kỹ thuật viên đến tận nơi cài lại phần mềm, tốn thời gian và rủi ro gián đoạn bán hàng.',
          'Hệ sinh thái Cloud Web tự động cập nhật phiên bản mới ngay trên máy chủ. Chủ quán chỉ cần tải lại trang trình duyệt là có ngay tính năng mới nhất mà không mất thêm 1 đồng phí bảo trì.',
        ],
      },
      {
        heading: '3. Khả năng giám sát từ xa mọi lúc mọi nơi',
        paragraphs: [
          'Với Cloud Web, dù đang đi du lịch hay ở nhà, chủ quán chỉ cần mở điện thoại là xem được sơ đồ bàn thời gian thực: Bàn nào đang ngồi, đã gọi bao nhiêu món, doanh thu ca sáng đạt bao nhiêu triệu — dữ liệu đồng bộ liên tục qua WebSocket.',
        ],
      },
    ],
    checklist: [
      'Ưu tiên chọn phần mềm chạy được trên trình duyệt web đa nền tảng (iOS, Android, Windows, macOS).',
      'Kiểm tra xem phần mềm có hỗ trợ in nhiệt 80mm qua mạng LAN/Wi-Fi tiêu chuẩn ESC/POS hay không.',
      'Hỏi rõ về chi phí ẩn: Phí cài đặt, phí duy trì máy chủ hàng năm, phí giới hạn số bàn hay số món.',
      'Thử nghiệm tốc độ thao tác trên mạng 4G/Wi-Fi thông thường trước khi quyết định ký hợp đồng.',
    ],
    systemFeatureTip: 'iMenu hoạt động 100% trên nền tảng Cloud Web, không cần cài đặt ứng dụng, sẵn sàng chạy mượt trên mọi thiết bị và đồng bộ thời gian thực qua WebSocket.',
  },
  {
    id: 'thiet-ke-thuc-don-bien-the-tang-aov',
    category: 'Tài chính & Giá vốn',
    title: 'Cách thiết kế thực đơn điện tử có biến thể (Size, Topping, Mức đường/đá) giúp tăng 18% giá trị đơn hàng trung bình (AOV)',
    summary: 'Chiến thuật tâm lý học thực đơn (Menu Engineering) áp dụng vào giao diện QR: Nghệ thuật upsell topping, tùy biến theo khẩu vị và hình ảnh kích thích thị giác.',
    readTime: '7 phút đọc',
    badge: 'Tăng doanh thu',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: UtensilsCrossed,
    iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    lead: 'Giá trị đơn hàng trung bình (Average Order Value - AOV) là đòn bẩy tài chính quan trọng nhất để tăng lợi nhuận mà không cần tăng chi phí tìm kiếm khách hàng mới. Một menu QR được thiết kế thông minh với các nhóm tùy biến (Topping, Size) có thể tăng AOV từ 15% đến 22% hoàn toàn tự nhiên.',
    sections: [
      {
        heading: '1. Tại sao menu giấy truyền thống thất bại trong việc Upsell?',
        paragraphs: [
          'Trên menu giấy, nhân viên phục vụ thường ngần ngại hoặc quên hỏi khách: "Anh/chị có muốn thêm phô mai kéo sợi không ạ?", "Quán em có thạch trân châu hoàng kim mới ra, anh/chị thử không?". Sự mệt mỏi trong giờ cao điểm khiến nhân viên chỉ ghi nhận món cơ bản.',
          'Khách hàng khi nhìn menu giấy cũng khó hình dung topping thêm vào sẽ trông như thế nào, dẫn đến xu hướng chỉ gọi món mặc định.',
        ],
      },
      {
        heading: '2. Tận dụng giao diện chọn món Modal của iMenu',
        paragraphs: [
          'Khi khách hàng chạm vào món Trà Sữa Oolong trên Menu QR iMenu, một bảng tùy chỉnh xuất hiện ngay trên màn hình điện thoại:',
          '• Chọn Size: Size M (Mặc định) / Size L (+8.000đ).\n• Chọn Topping (Multi-select): Trân châu đen (+5.000đ), Pudding trứng (+8.000đ), Kem cheese mặn (+10.000đ).\n• Mức ngọt & Đá: 50% đường, 70% đá — Khách tự do tùy biến theo khẩu vị.',
          'Khách hàng cảm thấy được cá nhân hóa ly nước của mình, và việc tick chọn 1–2 topping chỉ tốn thêm 5k–10k khiến họ không cảm thấy bị đắt đỏ.',
        ],
      },
      {
        heading: '3. Nguyên tắc đặt giá "Mồi nhử" (Decoy Pricing)',
        paragraphs: [
          'Đặt giá Size M là 35.000đ và Size L là 42.000đ (chỉ chênh 7.000đ nhưng ly to hơn 40%). Hơn 65% khách hàng sẽ chọn Size L vì tâm lý "thêm có vài nghìn mà được ly bự hơn hẳn". Biên lợi nhuận của quán trên Size L luôn cao hơn do chi phí đá và bao bì gần như tương đương.',
        ],
      },
    ],
    checklist: [
      'Chụp ảnh món ăn cận cảnh, đủ ánh sáng và cập nhật ảnh chất lượng cao lên iMenu.',
      'Thiết lập ít nhất 2 đến 4 lựa chọn topping hấp dẫn cho các món chủ lực của quán.',
      'Đặt tên món gợi cảm xúc (Ví dụ: "Trà Xoài Nhiệt Đới Macchiato" thay vì chỉ ghi "Trà xoài").',
      'Định kỳ xem báo cáo "Món bán chạy nhất" trên iMenu để biết topping nào mang lại doanh thu cao nhất.',
    ],
    systemFeatureTip: 'iMenu hỗ trợ hệ thống biến thể sâu: Nhóm tùy chọn bắt buộc (Single choice: Size, Độ cay) và Nhóm tùy chọn cộng thêm (Multiple choice: Topping, Nước sốt) kèm giá cộng linh hoạt.',
  },
  {
    id: 'ban-mang-di-takeaway-vietqr-truoc',
    category: 'Vận hành & Chống thất thoát',
    title: 'Bán mang đi (Online Takeaway) qua Zalo & Fanpage: Làm sao để khách tự đặt và thanh toán VietQR trước mà nhân viên không phải trực chat?',
    summary: 'Mô hình bán mang đi tự động hóa 100%: Khách bấm link/quét mã từ xa, trả tiền trước qua VietQR Napas 247, đơn tự động bắn thẳng vào màn hình bếp.',
    readTime: '6 phút đọc',
    badge: 'Mới · Takeaway',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: ShoppingBag,
    iconBg: 'bg-amber-50 text-amber-700 border-amber-200',
    lead: 'Bán hàng qua mạng xã hội (Zalo, Facebook) là nguồn thu khổng lồ của các tiệm cơm văn phòng, cà phê take-away. Nhưng nỗi ám ảnh lớn nhất là cảnh nhân viên vừa gõ chat báo giá, vừa gửi số tài khoản, vừa chờ chụp màn hình biên lai chuyển khoản — mất 10 phút mới chốt được 1 ly trà sữa 30.000đ.',
    sections: [
      {
        heading: '1. Rủi ro hủy đơn và mất thời gian trực tin nhắn',
        paragraphs: [
          'Rất nhiều khách đặt đồ ăn mang đi theo hình thức COD (giao nhận tiền), đến khi shipper giao tới nơi thì khách không nghe máy hoặc hủy đơn, quán phải chịu toàn bộ tiền đồ ăn.',
          'Hơn nữa, vào giờ cao điểm từ 11h–12h trưa, nhân viên quán vừa phải phục vụ khách tại bàn vừa phải trả lời tin nhắn Zalo, dẫn đến việc sót đơn hoặc trả lời chậm khiến khách bỏ sang quán khác.',
        ],
      },
      {
        heading: '2. Quy trình Takeaway tự động của iMenu',
        paragraphs: [
          'Chủ quán tạo mã QR Takeaway hoặc sao chép đường link đặt mang đi của quán dán lên bài ghim Fanpage, lời chào tự động Zalo OA hoặc Bio TikTok:',
          '1. Khách bấm link: Menu điện tử mở ra ngay trên điện thoại, khách tự chọn món, chọn giờ hẹn lấy và nhập số điện thoại.\n2. Thanh toán trước 100%: Hệ thống hiển thị mã VietQR động có sẵn số tiền và nội dung chuyển khoản.\n3. Khách quét app ngân hàng thanh toán thành công: Tiền về thẳng tài khoản chủ quán.\n4. Đơn hàng tự động hiển thị trên POS và màn hình Bếp KDS mà nhân viên không cần phải chat hay xác nhận thủ công.',
        ],
      },
    ],
    checklist: [
      'Ghim đường link đặt mang đi của quán vào Lời chào tự động Zalo và Fanpage.',
      'Cấu hình thông tin tài khoản ngân hàng chính xác trên mục Cài đặt Nhà hàng của iMenu.',
      'In mã QR "Quét đặt mang đi lấy ngay sau 10 phút" dán trước cửa quán cho khách đi đường ghé mua.',
      'Đóng gói đồ ăn cẩn thận và dán tem ghi rõ Số đơn & Tên khách để không bị giao nhầm.',
    ],
    systemFeatureTip: 'Tính năng Bán mang đi (Takeaway) trên iMenu tích hợp thanh toán VietQR Napas 247 tự động, đơn chỉ gửi vào bếp khi giao dịch đã được ngân hàng xác nhận thành công.',
  },
  {
    id: 'cam-nang-mo-quan-cafe-tra-sua-a-z',
    category: 'Mở quán & Pháp lý',
    title: 'Cẩm nang mở quán cà phê, trà sữa từ A đến Z: Tính điểm hòa vốn, định lượng công thức và checklist 90 ngày đầu',
    summary: 'Toàn bộ lộ trình thực chiến cho người mới khởi nghiệp F&B: Từ dự trù vốn lưu động, tính toán chi phí biến đổi, thiết kế quầy pha chế đến đo lường điểm hòa vốn.',
    readTime: '9 phút đọc',
    badge: 'Khởi nghiệp F&B',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Store,
    iconBg: 'bg-blue-50 text-blue-700 border-blue-200',
    lead: 'Hơn 50% quán cà phê và trà sữa đóng cửa trong 6 tháng đầu tiên không phải vì đồ uống dở, mà vì chủ quán cạn kiệt vốn lưu động trước khi đạt điểm hòa vốn. Quản trị tài chính bài bản và chuẩn hóa quy trình ngay từ ngày đầu là yếu tố sống còn.',
    sections: [
      {
        heading: '1. Công thức tính Điểm hòa vốn (Break-even Point) thực tế',
        paragraphs: [
          'Để biết mỗi ngày quán cần bán bao nhiêu ly nước mới không bị lỗ, chủ quán cần phân định rõ hai loại chi phí:',
          '• Chi phí cố định hàng tháng (Fixed Costs): Mặt bằng (15tr) + Lương cứng nhân viên (18tr) + Điện nước internet (4tr) + Phần mềm quản lý (0đ với iMenu) = 37.000.000đ/tháng (tương đương 1.233.000đ/ngày).\n• Giá bán trung bình mỗi ly: 30.000đ. Giá vốn nguyên liệu (Food Cost 28%): 8.400đ. Lãi gộp trên 1 ly: 21.600đ.',
          '-> Điểm hòa vốn mỗi ngày = 1.233.000 / 21.600 ≈ 57 ly/ngày. Bán từ ly thứ 58 trở đi, quán bắt đầu có lãi ròng.',
        ],
      },
      {
        heading: '2. Checklist 90 ngày đầu khai trương',
        paragraphs: [
          '• Tháng 1 (Chuẩn bị): Đăng ký giấy phép kinh doanh hộ cá thể, chứng nhận vệ sinh an toàn thực phẩm, thiết kế menu và đưa danh mục lên phần mềm iMenu.\n• Tháng 2 (Chạy thử & Tinh chỉnh): Bán thử cho bạn bè người quen (Soft Opening), kiểm tra độ chịu tải của quầy bar và quy trình quét QR tại bàn.\n• Tháng 3 (Tăng tốc): Triển khai chương trình khuyến mãi giờ vàng, tích lũy tệp khách hàng quen và đo lường tỷ lệ quay lại.',
        ],
      },
    ],
    checklist: [
      'Dự trù quỹ vốn lưu động đủ chi trả chi phí cố định tối thiểu trong 3 đến 6 tháng đầu.',
      'Chuẩn hóa công thức định lượng (SOP) cho từng món để hương vị luôn đồng nhất dù nhân viên nào pha.',
      'Sử dụng phần mềm quản lý miễn phí 0đ như iMenu để tiết kiệm chi phí phần cứng ban đầu.',
      'Đo lường doanh thu và lượng khách mỗi ngày để so sánh với con số hòa vốn mục tiêu.',
    ],
    systemFeatureTip: 'Gói Cơ bản 0đ của iMenu miễn phí trọn đời, không giới hạn số lượng món và số bàn, giúp các quán khởi nghiệp tiết kiệm hàng chục triệu đồng chi phí phần mềm ban đầu.',
  },
  {
    id: 'thiet-lap-man-hinh-bep-kds-thay-phieu-in',
    category: 'Vận hành & Chống thất thoát',
    title: 'Cẩm nang thiết lập màn hình điều phối bếp (KDS) thay thế phiếu in giấy hay thất lạc trong giờ cao điểm',
    summary: 'Tại sao các chuỗi nhà hàng hiện đại chuyển dần từ in bill giấy sang màn hình KDS tương tác? Hướng dẫn thiết lập máy tính bảng cũ thành trạm điều phối bếp chuyên nghiệp.',
    readTime: '6 phút đọc',
    badge: 'Chuẩn KDS',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: ChefHat,
    iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    lead: 'Máy in giấy nhiệt trong bếp thường xuyên gặp lỗi kẹt giấy, hết giấy đúng lúc cao điểm hoặc hơi ẩm dầu mỡ làm mờ chữ in. Màn hình điều phối bếp (Kitchen Display System - KDS) là tiêu chuẩn nâng cấp bắt buộc để bếp vận hành nhịp nhàng.',
    sections: [
      {
        heading: '1. So sánh chi phí: Giấy in nhiệt vs Màn hình KDS',
        paragraphs: [
          'Một quán ăn đông khách tiêu tốn từ 20 đến 40 cuộn giấy in nhiệt K80 mỗi tháng (khoảng 300.000đ–600.000đ/tháng), chưa kể chi phí sửa chữa đầu in nhiệt do bị ẩm dầu mỡ trong bếp.',
          'Trong khi đó, việc trang bị 1 chiếc tablet Android cũ (giá khoảng 1–2 triệu đồng) mở trực tiếp màn hình KDS của iMenu qua trình duyệt Chrome có thể sử dụng bền bỉ 3–5 năm, không tốn 1 xu tiền giấy in.',
        ],
      },
      {
        heading: '2. Các tính năng cốt lõi của màn hình KDS iMenu',
        paragraphs: [
          '• Hiển thị danh sách món theo thời gian thực (Realtime WebSocket): Món khách vừa bấm gọi trên bàn lập tức nhảy lên màn hình bếp kèm âm thanh thông báo.\n• Nhóm món thông minh (Items Summary): Bếp nhìn thấy ngay tổng số đĩa "Bò sốt tiêu đen" cần xào trong toàn quán để xào 1 mẻ chung, tiết kiệm thời gian.\n• Bật/tắt trạng thái hết món (86 - Out of Stock): Đầu bếp chạm 1 chạm để báo hết món, món ăn sẽ tự động bị ẩn hoặc mờ đi trên menu QR của khách hàng.',
        ],
      },
    ],
    checklist: [
      'Chọn vị trí treo máy tính bảng trong bếp khô ráo, ngang tầm mắt của đầu bếp chính.',
      'Sử dụng ốp lưng chống nước hoặc dán kính cường lực bảo vệ màn hình tablet.',
      'Cắm sạc liên tục và cài đặt màn hình ở chế độ "Luôn sáng" (Keep screen awake).',
      'Hướng dẫn đầu bếp thao tác bấm "Bắt đầu nấu" và "Hoàn thành" để đồng bộ sang màn hình phục vụ.',
    ],
    systemFeatureTip: 'Màn hình KDS của iMenu có chế độ xem theo Đơn hàng (Orders View) và xem theo Tổng hợp món (Items Summary), hỗ trợ đánh dấu hoàn thành từng món hoặc toàn bộ đơn.',
  },
  {
    id: 'quan-tri-chuoi-fnb-da-chi-nhanh',
    category: 'Tài chính & Giá vốn',
    title: 'Quản trị chuỗi F&B đa chi nhánh: Cách phân quyền Quản lý chi nhánh, tùy chỉnh giá bán theo khu vực và báo cáo hợp nhất',
    summary: 'Bài toán mở rộng từ 1 quán thành chuỗi 3–5 cơ sở: Kiểm soát menu theo cơ sở, cấu hình tài khoản VietQR riêng biệt và theo dõi dòng tiền tập trung tại HQ.',
    readTime: '8 phút đọc',
    badge: 'Mô hình chuỗi',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: Building2,
    iconBg: 'bg-purple-50 text-purple-700 border-purple-200',
    lead: 'Mở cơ sở 2 và 3 là giấc mơ của mọi chủ quán, nhưng cũng là lúc bài toán quản lý trở nên phức tạp gấp bội: Giá mặt bằng quận 1 khác quận Tân Bình nên giá bán cần điều chỉnh linh hoạt; tiền chuyển khoản của chi nhánh nào phải vào đúng tài khoản ngân hàng của chi nhánh đó.',
    sections: [
      {
        heading: '1. Thách thức phân cấp quyền hạn giữa Chủ chuỗi và Quản lý cơ sở',
        paragraphs: [
          'Nếu cho Quản lý cơ sở quá nhiều quyền, họ có thể tự ý sửa giá bán hoặc xóa dữ liệu báo cáo. Nhưng nếu mọi việc đều phải đợi Chủ chuỗi duyệt, chi nhánh sẽ bị tê liệt khi cần xử lý sự cố hàng ngày.',
          'Mô hình đa chi nhánh của iMenu phân định rành mạch 5 vai trò: System Admin, Chain HQ Manager, Branch Manager, POS Staff, và Kitchen Staff.',
        ],
      },
      {
        heading: '2. Menu và Bảng giá riêng biệt theo từng cơ sở',
        paragraphs: [
          'Hệ thống iMenu cho phép tạo Danh mục món chung toàn chuỗi để giữ chuẩn thương hiệu, nhưng hỗ trợ tùy biến giá bán và bật/tắt món linh hoạt theo từng chi nhánh.',
          'Ví dụ: Chi nhánh trung tâm bán Cà phê muối 35.000đ, trong khi chi nhánh ven thành phố bán 29.000đ — hệ thống tự động nhận diện theo mã QR của từng cơ sở.',
        ],
      },
      {
        heading: '3. Cấu hình tài khoản VietQR riêng cho mỗi chi nhánh',
        paragraphs: [
          'Mỗi chi nhánh có thể cấu hình số tài khoản ngân hàng thụ hưởng riêng biệt. Tiền khách thanh toán tại Chi nhánh Hà Nội về tài khoản ngân hàng Hà Nội; Chi nhánh Sài Gòn về tài khoản Sài Gòn mà không bị lẫn lộn dòng tiền.',
          'Tại trụ sở chính HQ, Chủ chuỗi theo dõi Báo cáo Doanh thu hợp nhất thời gian thực để so sánh hiệu quả kinh doanh giữa các cơ sở.',
        ],
      },
    ],
    checklist: [
      'Xây dựng quy chế phân quyền rõ ràng giữa cấp Quản lý chi nhánh và Quản lý chuỗi HQ.',
      'Thiết lập tài khoản ngân hàng VietQR riêng cho từng cơ sở để hạch toán chi phí độc lập.',
      'Định kỳ họp giao ban đầu tuần để so sánh chỉ số AOV và doanh thu giữa các chi nhánh trên iMenu.',
      'Chuẩn hóa thực đơn lõi trước khi cho phép các chi nhánh đề xuất món mới theo vùng miền.',
    ],
    systemFeatureTip: 'Tính năng Quản trị Đa chi nhánh của iMenu cho phép quản lý không giới hạn số lượng cơ sở, hỗ trợ cấu hình tài khoản VietQR và menu giá bán độc lập cho từng điểm bán.',
  },
];

const CATEGORIES = [
  'Tất cả',
  'Mở quán & Pháp lý',
  'Vận hành & Chống thất thoát',
  'Tài chính & Giá vốn',
  'Công nghệ & Menu QR',
] as const;

export default function KienThucPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});

  const toggleCheck = (idx: number) => {
    if (!activeArticle) return;
    const key = `${activeArticle.id}-${idx}`;
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredArticles = useMemo(() => {
    return ARTICLES.filter((art) => {
      const matchCat = selectedCategory === 'Tất cả' || art.category === selectedCategory;
      const matchSearch =
        searchQuery.trim() === '' ||
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      <Header />

      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-emerald-50/40 to-slate-50 pt-10 pb-16 sm:pb-20 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-emerald-700 transition-colors">
              Trang chủ
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-emerald-800 font-bold">Kiến thức F&B</span>
          </nav>

          {/* Hero Header */}
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300 text-xs font-extrabold text-emerald-900 shadow-xs">
              <BookOpen className="w-4 h-4 text-emerald-700" />
              <span>Cẩm Nang & Tài Liệu Vận Hành F&B Thực Chiến</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight">
              Cẩm nang quản lý nhà hàng, quán ăn, cà phê và trà sữa thực chiến
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Tổng hợp giải pháp kinh doanh, chống thất thoát bill, công thức tính giá vốn và chuẩn bị pháp lý thuế 2026 đúc kết từ hàng nghìn bài toán vận hành quán thực tế tại Việt Nam.
            </p>
          </div>

          {/* 3 Thống kê nổi bật */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 grid place-items-center border border-emerald-100 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">Chuyên mục thực tiễn</span>
                <span className="text-[11px] text-slate-500">Áp dụng trực tiếp tại quán ăn, cafe</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 grid place-items-center border border-amber-100 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">Cập nhật xu hướng 2026</span>
                <span className="text-[11px] text-slate-500">Pháp lý thuế, VietQR & KDS</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 grid place-items-center border border-teal-100 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">Bài toán vận hành thật</span>
                <span className="text-[11px] text-slate-500">Chống đá bill, nhầm món giờ cao điểm</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ================= KHỐI "BẮT ĐẦU TỪ ĐÂY — 3 BÀI ĐỌC NỀN TẢNG" ================= */}
      <section className="py-12 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block">
                Khởi Đầu Thuận Lợi
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-950">
                Bắt đầu từ đây — 3 bài đọc nền tảng cho chủ quán mới
              </h2>
            </div>
            <span className="text-xs text-slate-500">Đọc theo thứ tự 3 bước để tối ưu chi phí</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bước 1 */}
            <div
              onClick={() => setActiveArticle(ARTICLES[3])}
              className="group p-6 rounded-2xl bg-slate-50 border border-slate-200/90 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-200/80 text-slate-700 text-[10px] font-black uppercase">
                  Bước 1 · Định vị
                </span>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors leading-snug">
                  Quán cà phê, trà sữa, quán ăn nhỏ khi nào thực sự cần phần mềm quản lý?
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                  Phân tích trung thực cả trường hợp quán dưới 5 bàn chưa cần mua phần mềm, chỉ nên dùng sổ tay và khi nào quy mô buộc phải số hóa để tránh thất thoát.
                </p>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-emerald-700 pt-2 border-t border-slate-200/60">
                <span>Đọc bài viết</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Bước 2 */}
            <div
              onClick={() => setActiveArticle(ARTICLES[2])}
              className="group p-6 rounded-2xl bg-slate-50 border border-slate-200/90 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                  Bước 2 · Quy trình
                </span>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors leading-snug">
                  Thực đơn điện tử QR gọi món tại bàn khác gì QR chỉ xem ảnh? Quy trình 4 bước vào bếp KDS
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                  Phân biệt rạch ròi giữa mã QR tĩnh chỉ mở file ảnh menu thụ động với mã QR tương tác gọi món, chọn topping và đẩy thẳng đơn vào màn hình bếp FIFO.
                </p>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-emerald-700 pt-2 border-t border-slate-200/60">
                <span>Đọc bài viết</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Bước 3 */}
            <div
              onClick={() => setActiveArticle(ARTICLES[7])}
              className="group p-6 rounded-2xl bg-slate-50 border border-slate-200/90 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase">
                  Bước 3 · Lựa chọn
                </span>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors leading-snug">
                  7 tiêu chí chọn phần mềm quản lý nhà hàng tiết kiệm chi phí phần cứng và sẵn sàng mở chuỗi
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                  Checklist chọn giải pháp Cloud web không yêu cầu mua máy POS cồng kềnh, tương thích máy in nhiệt 80mm sẵn có và hỗ trợ thanh toán VietQR Napas 247.
                </p>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-emerald-700 pt-2 border-t border-slate-200/60">
                <span>Đọc bài viết</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ================= BỘ LỌC CHUYÊN MỤC & TÌM KIẾM NHANH ================= */}
      <section className="py-8 bg-slate-100/70 border-b border-slate-200/80 sticky top-20 z-30 backdrop-blur-md bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Tabs Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-emerald-700 text-white shadow-sm shadow-emerald-700/20'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[260px] sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm bài viết, chủ đề, từ khóa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 placeholder:text-slate-400 shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ================= LƯỚI 9 BÀI VIẾT CHUYÊN SÂU ================= */}
      <section className="py-14 sm:py-18">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Hiển thị {filteredArticles.length} bài viết chuyên sâu
            </span>
            {selectedCategory !== 'Tất cả' && (
              <button
                type="button"
                onClick={() => setSelectedCategory('Tất cả')}
                className="text-xs text-emerald-700 hover:underline font-semibold"
              >
                Đặt lại bộ lọc
              </button>
            )}
          </div>

          {filteredArticles.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">Không tìm thấy bài viết phù hợp</h3>
              <p className="text-xs text-slate-500">
                Thử thay đổi từ khóa tìm kiếm hoặc chọn lại chuyên mục &ldquo;Tất cả&rdquo;.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedCategory('Tất cả');
                  setSearchQuery('');
                }}
                className="text-xs"
              >
                Xem tất cả bài viết
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
              {filteredArticles.map((article) => {
                const Icon = article.icon;
                return (
                  <article
                    key={article.id}
                    onClick={() => setActiveArticle(article)}
                    className="group bg-white rounded-3xl border border-slate-200/90 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-950/5 transition-all p-6 sm:p-7 flex flex-col justify-between cursor-pointer space-y-5"
                  >
                    <div className="space-y-4">
                      {/* Top Meta */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${article.badgeColor}`}
                        >
                          {article.badge}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {article.readTime}
                        </span>
                      </div>

                      {/* Icon & Title */}
                      <div className="space-y-2.5">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${article.iconBg} group-hover:scale-105 transition-transform`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-800 transition-colors leading-snug line-clamp-2">
                          {article.title}
                        </h3>
                      </div>

                      {/* Summary */}
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                        {article.summary}
                      </p>
                    </div>

                    {/* Bottom CTA */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
                      <span>Đọc toàn bộ cẩm nang</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </article>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* ================= MODAL BÀI VIẾT CHI TIẾT & CHECKLIST HÀNH ĐỘNG ================= */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div
            className="bg-white w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-scaleUp"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-200 flex items-start justify-between gap-4 bg-slate-50/80">
              <div className="space-y-2 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${activeArticle.badgeColor}`}
                  >
                    {activeArticle.badge}
                  </span>
                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {activeArticle.readTime}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                  {activeArticle.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveArticle(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors shrink-0"
                aria-label="Đóng cửa sổ"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-700 text-sm leading-relaxed divide-y divide-slate-100">
              {/* Lead Paragraph */}
              <p className="text-base font-semibold text-slate-900 bg-emerald-50/60 border-l-4 border-emerald-600 p-4 rounded-r-2xl">
                {activeArticle.lead}
              </p>

              {/* Sections */}
              <div className="pt-4 space-y-6">
                {activeArticle.sections.map((sec, idx) => (
                  <div key={idx} className="space-y-2.5">
                    <h3 className="text-base font-bold text-slate-900">{sec.heading}</h3>
                    {sec.paragraphs.map((p, pIdx) => (
                      <p key={pIdx} className="text-xs sm:text-sm text-slate-600 whitespace-pre-line">
                        {p}
                      </p>
                    ))}
                    {sec.callout && (
                      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium">
                        {sec.callout}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Checklist hành động thực tế */}
              <div className="pt-6 space-y-3">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                  <span>Checklist hành động thực tế cho chủ quán</span>
                </div>
                <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  {activeArticle.checklist.map((item, cIdx) => {
                    const isChecked = checkedItems[`${activeArticle.id}-${cIdx}`] || false;
                    return (
                      <div
                        key={cIdx}
                        onClick={() => toggleCheck(cIdx)}
                        className="flex items-start gap-2.5 cursor-pointer select-none group"
                      >
                        <div className="mt-0.5">
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 shrink-0" />
                          )}
                        </div>
                        <span
                          className={`text-xs ${
                            isChecked ? 'line-through text-slate-400' : 'text-slate-700'
                          }`}
                        >
                          {item}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* System Tip Banner */}
              <div className="pt-4">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900 to-teal-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-center sm:text-left">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300 flex items-center justify-center sm:justify-start gap-1">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      Giải pháp đồng bộ trên iMenu
                    </span>
                    <p className="text-xs text-emerald-100/90 leading-snug">
                      {activeArticle.systemFeatureTip}
                    </p>
                  </div>
                  <Link href="/dang-ky" onClick={() => setActiveArticle(null)} className="shrink-0 w-full sm:w-auto">
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full sm:w-auto whitespace-nowrap bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold text-xs px-4"
                    >
                      Dùng thử 0đ ngay →
                    </Button>
                  </Link>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
              <span className="text-xs text-slate-500">
                Nguồn: Ban Biên Tập Nghiệp Vụ iMenu Platform
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveArticle(null)}
                className="text-xs font-bold"
              >
                Đóng bài đọc
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ================= BOTTOM CTA BANNER ================= */}
      <section className="py-14 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Ứng Dụng Ngay Vào Quán Của Bạn
          </span>
          <h2 className="text-2xl sm:text-3xl font-black max-w-2xl mx-auto">
            Không cần chờ đợi — Thiết lập thực đơn điện tử QR và bán hàng sau 5 phút
          </h2>
          <p className="text-xs sm:text-sm text-emerald-200/80 max-w-xl mx-auto">
            Gói Cơ bản 0đ trọn đời cho quán mới. Không cần mua máy POS chuyên dụng, chạy thẳng trên trình duyệt điện thoại và laptop.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/dang-ky" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="md"
                className="w-full sm:w-auto bg-white text-emerald-950 hover:bg-emerald-50 font-bold px-6 py-2.5 shadow-xl border-0"
              >
                Bắt đầu miễn phí 0đ <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <Link href="/huong-dan" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="md"
                className="w-full sm:w-auto border-emerald-600 text-emerald-100 hover:bg-emerald-900 font-bold px-5 py-2.5"
              >
                Xem hướng dẫn 7 bước
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
