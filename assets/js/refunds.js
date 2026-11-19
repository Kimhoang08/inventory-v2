// ============================================================================
// PHÂN HỆ QUẢN LÝ YÊU CẦU HOÀN / HỦY VÉ (REFUND REQUESTS MANAGEMENT)
// ============================================================================

(function() {
  'use strict';

  // 1. DANH MỤC TẬP ĐOÀN VÀ KHU DU LỊCH
  const REFUND_CORP_SITES = {
    'Sun World': [
      'Sun World Ba Na Hills',
      'Sun World Fansipan Legend',
      'Sun World Hạ Long',
      'Sun World Hon Thom',
      'Sun World Bà Đen Mountain'
    ],
    'VinWonders': [
      'VinWonders Phú Quốc',
      'VinWonders Nha Trang',
      'VinWonders Nam Hội An',
      'VinWonders Grand World'
    ],
    'Nova Dreams': [
      'NovaWorld Phan Thiết (Water Park & Circus Land)',
      'NovaDreams Vũng Tàu'
    ],
    'Khác': [
      'Công viên Nước Đầm Sen',
      'Khu du lịch Suối Tiên'
    ]
  };

  // 2. DANH MỤC ĐẠI LÝ B2B TIÊU BIỂU
  const REFUND_AGENCIES = [
    { code: 'DL-8899', name: 'Công ty Cổ phần Du Lịch Việt Nam (Vietravel)', mst: '0312456789' },
    { code: 'DL-4455', name: 'Cty Du Lịch Saigontourist CN Hà Nội', mst: '0100123456' },
    { code: 'DL-2211', name: 'Đại lý Vé Vui Chơi Miền Trung', mst: '0401889922' },
    { code: 'KHO-MA', name: 'Kho Đại lý Miền An (Bán sỉ OTA)', mst: '0319887766' },
    { code: 'DL-HANOI', name: 'Cty TNHH Du Lịch Thủ Đô (Hanoi Travel)', mst: '0109988776' },
    { code: 'DL-DANANG', name: 'Cty CP Tour & Vé Bà Nà Express', mst: '0409876543' }
  ];

  // 3. MOCK DATA YÊU CẦU HOÀN/HỦY VÉ
  let refundDataset = [
    // --- TAB: CHỜ XỬ LÝ (CHO_XU_LY) ---
    {
      requestCode: 'RQRF2611190001',
      refundOrderCode: 'RFD-2611-001',
      originalOrderCode: 'ORD-2611-008',
      serviceDate: '2026-11-22',
      ticketCount: 4,
      corp: 'Sun World',
      site: 'Sun World Ba Na Hills',
      agency: 'Công ty Cổ phần Du Lịch Việt Nam (Vietravel)',
      agencyCode: 'DL-8899',
      requesterName: 'Nguyễn Văn An',
      requesterEmail: 'an.nguyen@vietravel.com',
      requesterPhone: '0903123456',
      taxId: '0312456789',
      status: 'CHO_XU_LY',
      subStatus: 'CHO_TIEP_NHAN',
      createdDate: '2026-11-19 08:30',
      assignedTo: null,
      isMyCreated: true, // Phiếu do chính mình tạo -> Kiểm tra nút Thu hồi
      totalOriginalAmount: 3800000,
      chargeRate: 10,
      chargeAmount: 380000,
      totalRefundAmount: 3420000,
      reason: 'Khách bị delay chuyến bay từ Hà Nội vào Đà Nẵng, có giấy xác nhận của Vietnam Airlines.',
      documents: ['Giay-xac-nhan-delay-VN128.pdf', 'Yeu-cau-hoan-ve-vietravel.jpg'],
      tickets: [
        { type: 'Vé Cáp Treo & Buffet (Người lớn)', qrCode: 'QR-BN-880192', price: 950000, charge: 95000, refund: 855000 },
        { type: 'Vé Cáp Treo & Buffet (Người lớn)', qrCode: 'QR-BN-880193', price: 950000, charge: 95000, refund: 855000 },
        { type: 'Vé Cáp Treo & Buffet (Người lớn)', qrCode: 'QR-BN-880194', price: 950000, charge: 95000, refund: 855000 },
        { type: 'Vé Cáp Treo & Buffet (Người lớn)', qrCode: 'QR-BN-880195', price: 950000, charge: 95000, refund: 855000 }
      ]
    },
    {
      requestCode: 'RQRF2611190002',
      refundOrderCode: 'RFD-2611-002',
      originalOrderCode: 'ORD-2611-012',
      serviceDate: '2026-11-20',
      ticketCount: 2,
      corp: 'VinWonders',
      site: 'VinWonders Phú Quốc',
      agency: 'Cty Du Lịch Saigontourist CN Hà Nội',
      agencyCode: 'DL-4455',
      requesterName: 'Trần Thị Thu Hà',
      requesterEmail: 'ha.tran@saigontourist.net',
      requesterPhone: '0912345678',
      taxId: '0100123456',
      status: 'CHO_XU_LY',
      subStatus: 'CHO_TIEP_NHAN',
      createdDate: '2026-11-19 09:15',
      assignedTo: null,
      isMyCreated: false,
      totalOriginalAmount: 2500000,
      chargeRate: 15,
      chargeAmount: 375000,
      totalRefundAmount: 2125000,
      reason: 'Khách hàng có người nhà ốm đột xuất phải hủy lịch trình Phú Quốc.',
      documents: ['Giay-xac-nhan-y-te.pdf'],
      tickets: [
        { type: 'Vé Cổng + Safari (Người lớn)', qrCode: 'QR-PQ-110291', price: 1250000, charge: 187500, refund: 1062500 },
        { type: 'Vé Cổng + Safari (Người lớn)', qrCode: 'QR-PQ-110292', price: 1250000, charge: 187500, refund: 1062500 }
      ]
    },
    {
      requestCode: 'RQRF2611190003',
      refundOrderCode: 'RFD-2611-003',
      originalOrderCode: 'ORD-2611-015',
      serviceDate: '2026-11-25',
      ticketCount: 6,
      corp: 'Sun World',
      site: 'Sun World Fansipan Legend',
      agency: 'Kho Đại lý Miền An (Bán sỉ OTA)',
      agencyCode: 'KHO-MA',
      requesterName: 'Lê Minh Tuấn',
      requesterEmail: 'tuan.le@mienan.vn',
      requesterPhone: '0938112233',
      taxId: '0319887766',
      status: 'CHO_XU_LY',
      subStatus: 'CHO_TIEP_NHAN',
      createdDate: '2026-11-19 10:00',
      assignedTo: null,
      isMyCreated: false,
      totalOriginalAmount: 5100000,
      chargeRate: 10,
      chargeAmount: 510000,
      totalRefundAmount: 4590000,
      reason: 'Đoàn tour 6 khách chuyển hướng sang tour Mộc Châu, xin hủy hoàn vé Fansipan.',
      documents: ['Bien-ban-chuyen-tour.pdf'],
      tickets: [
        { type: 'Vé Cáp Treo Khứ Hồi Fansipan', qrCode: 'QR-FS-44011', price: 850000, charge: 85000, refund: 765000 },
        { type: 'Vé Cáp Treo Khứ Hồi Fansipan', qrCode: 'QR-FS-44012', price: 850000, charge: 85000, refund: 765000 },
        { type: 'Vé Cáp Treo Khứ Hồi Fansipan', qrCode: 'QR-FS-44013', price: 850000, charge: 85000, refund: 765000 },
        { type: 'Vé Cáp Treo Khứ Hồi Fansipan', qrCode: 'QR-FS-44014', price: 850000, charge: 85000, refund: 765000 },
        { type: 'Vé Cáp Treo Khứ Hồi Fansipan', qrCode: 'QR-FS-44015', price: 850000, charge: 85000, refund: 765000 },
        { type: 'Vé Cáp Treo Khứ Hồi Fansipan', qrCode: 'QR-FS-44016', price: 850000, charge: 85000, refund: 765000 }
      ]
    },

    // --- TAB: ĐANG XỬ LÝ (DANG_XU_LY) ---
    {
      requestCode: 'RQRF2611180004',
      refundOrderCode: 'RFD-2611-004',
      originalOrderCode: 'ORD-2611-005',
      serviceDate: '2026-11-19',
      ticketCount: 3,
      corp: 'Sun World',
      site: 'Sun World Hạ Long',
      agency: 'Cty TNHH Du Lịch Thủ Đô (Hanoi Travel)',
      agencyCode: 'DL-HANOI',
      requesterName: 'Phạm Minh Đức',
      requesterEmail: 'duc.pm@hanoitravel.vn',
      requesterPhone: '02439998888',
      taxId: '0109988776',
      status: 'DANG_XU_LY',
      subStatus: 'DANG_THAM_DINH',
      createdDate: '2026-11-18 14:20',
      assignedTo: 'Trần Thị Mai (Booking CSKH)',
      isMyCreated: false,
      totalOriginalAmount: 2160000,
      chargeRate: 15,
      chargeAmount: 324000,
      totalRefundAmount: 1836000,
      reason: 'Thời tiết Quảng Ninh mưa to gió lớn cấp 6, cáp treo Nữ Hoàng tạm dừng vận hành.',
      documents: ['Thong-bao-dung-van-hanh-ha-long.png'],
      tickets: [
        { type: 'Combo Dragon Park & Cáp Treo', qrCode: 'QR-HL-99201', price: 720000, charge: 108000, refund: 612000 },
        { type: 'Combo Dragon Park & Cáp Treo', qrCode: 'QR-HL-99202', price: 720000, charge: 108000, refund: 612000 },
        { type: 'Combo Dragon Park & Cáp Treo', qrCode: 'QR-HL-99203', price: 720000, charge: 108000, refund: 612000 }
      ]
    },
    {
      requestCode: 'RQRF2611180005',
      refundOrderCode: 'RFD-2611-005',
      originalOrderCode: 'ORD-2611-006',
      serviceDate: '2026-11-21',
      ticketCount: 5,
      corp: 'Nova Dreams',
      site: 'NovaWorld Phan Thiết (Water Park & Circus Land)',
      agency: 'Đại lý Vé Vui Chơi Miền Trung',
      agencyCode: 'DL-2211',
      requesterName: 'Võ Quốc Huy',
      requesterEmail: 'huy.vo@mientrungtour.vn',
      requesterPhone: '0988776655',
      taxId: '0401889922',
      status: 'DANG_XU_LY',
      subStatus: 'DANG_THAM_DINH',
      createdDate: '2026-11-18 16:45',
      assignedTo: 'Nguyễn Văn An (Booking CSKH)',
      isMyCreated: false,
      totalOriginalAmount: 2250000,
      chargeRate: 10,
      chargeAmount: 225000,
      totalRefundAmount: 2025000,
      reason: 'Khách đặt nhầm ngày sử dụng trước 1 tuần, xin hủy đơn để đặt lại đúng ngày.',
      documents: ['Yeu-cau-doi-ve.pdf'],
      tickets: [
        { type: 'Vé Công Viên Nước Wonderland Water Park', qrCode: 'QR-NW-771', price: 450000, charge: 45000, refund: 405000 },
        { type: 'Vé Công Viên Nước Wonderland Water Park', qrCode: 'QR-NW-772', price: 450000, charge: 45000, refund: 405000 },
        { type: 'Vé Công Viên Nước Wonderland Water Park', qrCode: 'QR-NW-773', price: 450000, charge: 45000, refund: 405000 },
        { type: 'Vé Công Viên Nước Wonderland Water Park', qrCode: 'QR-NW-774', price: 450000, charge: 45000, refund: 405000 },
        { type: 'Vé Công Viên Nước Wonderland Water Park', qrCode: 'QR-NW-775', price: 450000, charge: 45000, refund: 405000 }
      ]
    },

    // --- TAB: ĐANG HOÀN TIỀN (DANG_HOAN_TIEN) ---
    {
      requestCode: 'RQRF2611180006',
      refundOrderCode: 'RFD-2611-006',
      originalOrderCode: 'ORD-2611-002',
      serviceDate: '2026-11-18',
      ticketCount: 2,
      corp: 'VinWonders',
      site: 'VinWonders Nha Trang',
      agency: 'Cty CP Tour & Vé Bà Nà Express',
      agencyCode: 'DL-DANANG',
      requesterName: 'Bùi Thanh Thảo',
      requesterEmail: 'thao.bui@banaexpress.vn',
      requesterPhone: '02363889900',
      taxId: '0409876543',
      status: 'DANG_HOAN_TIEN',
      subStatus: 'CHO_GIAI_NGAN',
      createdDate: '2026-11-18 10:15',
      assignedTo: 'Lê Quốc Bảo (Kế toán)',
      isMyCreated: false,
      totalOriginalAmount: 1840000,
      chargeRate: 10,
      chargeAmount: 184000,
      totalRefundAmount: 1656000,
      reason: 'Đã thẩm tra hợp lệ: Vé chưa quét qua cổng kiểm soát, VinWonders đã xác nhận hủy mã QR.',
      documents: ['Xac-nhan-huy-qr-vinwonders.png', 'Bien-ban-duyet-hoan.pdf'],
      tickets: [
        { type: 'Vé Vào Cổng & Cáp Treo VinWonders', qrCode: 'QR-NT-3011', price: 920000, charge: 92000, refund: 828000 },
        { type: 'Vé Vào Cổng & Cáp Treo VinWonders', qrCode: 'QR-NT-3012', price: 920000, charge: 92000, refund: 828000 }
      ]
    },
    {
      requestCode: 'RQRF2611170007',
      refundOrderCode: 'RFD-2611-007',
      originalOrderCode: 'ORD-2611-003',
      serviceDate: '2026-11-17',
      ticketCount: 4,
      corp: 'Sun World',
      site: 'Sun World Hon Thom',
      agency: 'Kho Đại lý Miền An (Bán sỉ OTA)',
      agencyCode: 'KHO-MA',
      requesterName: 'Hoàng Thảo Linh',
      requesterEmail: 'linh.hoang@mienan.vn',
      requesterPhone: '0938112233',
      taxId: '0319887766',
      status: 'DANG_HOAN_TIEN',
      subStatus: 'CHO_GIAI_NGAN',
      createdDate: '2026-11-17 15:00',
      assignedTo: 'Lê Quốc Bảo (Kế toán)',
      isMyCreated: false,
      totalOriginalAmount: 3120000,
      chargeRate: 10,
      chargeAmount: 312000,
      totalRefundAmount: 2808000,
      reason: 'Biển động sóng lớn, tàu cao tốc và cáp treo Hòn Thơm tạm dừng chuyên chở.',
      documents: ['Bien-ban-hoan-hon-thom.pdf'],
      tickets: [
        { type: 'Cáp Treo Hòn Thơm & Công Viên Nước', qrCode: 'QR-HT-5501', price: 780000, charge: 78000, refund: 702000 },
        { type: 'Cáp Treo Hòn Thơm & Công Viên Nước', qrCode: 'QR-HT-5502', price: 780000, charge: 78000, refund: 702000 },
        { type: 'Cáp Treo Hòn Thơm & Công Viên Nước', qrCode: 'QR-HT-5503', price: 780000, charge: 78000, refund: 702000 },
        { type: 'Cáp Treo Hòn Thơm & Công Viên Nước', qrCode: 'QR-HT-5504', price: 780000, charge: 78000, refund: 702000 }
      ]
    },

    // --- TAB: ĐÃ XỬ LÝ (DA_XU_LY) ---
    {
      requestCode: 'RQRF2611160008',
      refundOrderCode: 'RFD-2611-008',
      originalOrderCode: 'ORD-2611-001',
      serviceDate: '2026-11-16',
      ticketCount: 2,
      corp: 'Sun World',
      site: 'Sun World Ba Na Hills',
      agency: 'Công ty Cổ phần Du Lịch Việt Nam (Vietravel)',
      agencyCode: 'DL-8899',
      requesterName: 'Nguyễn Văn An',
      requesterEmail: 'an.nguyen@vietravel.com',
      requesterPhone: '0903123456',
      taxId: '0312456789',
      status: 'DA_XU_LY',
      subStatus: 'HOAN_TAT',
      createdDate: '2026-11-16 09:00',
      assignedTo: 'Trần Thị Mai (Booking CSKH)',
      processedDate: '2026-11-16 14:30',
      isMyCreated: false,
      totalOriginalAmount: 1900000,
      chargeRate: 10,
      chargeAmount: 190000,
      totalRefundAmount: 1710000,
      reason: 'Khách sốt xuất huyết nhập viện, có hồ sơ bệnh án hợp lệ.',
      documents: ['Ho-so-benh-an-bv-cho-ray.pdf', 'Uy-nhiem-chi-hoan-tien.pdf'],
      tickets: [
        { type: 'Vé Cáp Treo & Buffet (Người lớn)', qrCode: 'QR-BN-7102', price: 950000, charge: 95000, refund: 855000 },
        { type: 'Vé Cáp Treo & Buffet (Người lớn)', qrCode: 'QR-BN-7103', price: 950000, charge: 95000, refund: 855000 }
      ]
    },
    {
      requestCode: 'RQRF2611150009',
      refundOrderCode: 'RFD-2611-009',
      originalOrderCode: 'ORD-2611-004',
      serviceDate: '2026-11-15',
      ticketCount: 1,
      corp: 'VinWonders',
      site: 'VinWonders Nam Hội An',
      agency: 'Cty Du Lịch Saigontourist CN Hà Nội',
      agencyCode: 'DL-4455',
      requesterName: 'Đặng Ngọc Lan',
      requesterEmail: 'lan.dang@saigontourist.net',
      requesterPhone: '0912345678',
      taxId: '0100123456',
      status: 'DA_XU_LY',
      subStatus: 'TU_CHOI',
      createdDate: '2026-11-15 11:30',
      assignedTo: 'Nguyễn Văn An (Booking CSKH)',
      processedDate: '2026-11-15 13:00',
      isMyCreated: false,
      totalOriginalAmount: 680000,
      chargeRate: 100,
      chargeAmount: 680000,
      totalRefundAmount: 0,
      reason: 'Khách quên mang vé muốn hoàn vé sau khi giờ dịch vụ đã kết thúc.',
      rejectReason: 'Vé quá hạn sử dụng (quá 24h sau giờ mở cửa công viên), hệ thống VinWonders từ chối hỗ trợ theo quy định.',
      documents: ['Thong-bao-tu-choi-vinwonders.pdf'],
      tickets: [
        { type: 'Vé Vào Cổng Nam Hội An', qrCode: 'QR-HA-1092', price: 680000, charge: 680000, refund: 0 }
      ]
    }
  ];

  // 4. QUẢN LÝ TRẠNG THÁI HIỆN TẠI CỦA VIEW
  let activeTab = 'CHO_XU_LY'; // CHO_XU_LY, DANG_XU_LY, DANG_HOAN_TIEN, DA_XU_LY
  let filterAgency = 'ALL';
  let filterCorp = 'ALL';
  let filterSite = 'ALL';
  let filterSearch = '';
  let filterStartDate = '2026-11-01';
  let filterEndDate = '2026-11-19';
  let filterDatePreset = 'this_month';
  let datePickerInstance = null;
  let viewingRequestCode = null;

  // 5. CÔNG THỨC SINH MÃ YÊU CẦU RQRF
  function generateRefundRequestCode() {
    const today = new Date();
    const yy = String(today.getFullYear()).slice(-2);
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const yymmdd = `${yy}${mm}${dd}`;

    // Lọc các mã cùng ngày để lấy STT lớn nhất
    const prefix = `RQRF${yymmdd}`;
    const sameDay = refundDataset.filter(item => item.requestCode.startsWith(prefix));
    let nextSeq = 1;
    if (sameDay.length > 0) {
      const maxSeq = sameDay.reduce((max, item) => {
        const seqPart = parseInt(item.requestCode.slice(-4), 10) || 0;
        return seqPart > max ? seqPart : max;
      }, 0);
      nextSeq = maxSeq + 1;
    }
    return `${prefix}${String(nextSeq).padStart(4, '0')}`;
  }

  // 6. CÁC HÀM XỬ LÝ DROPDOWN TẬP ĐOÀN & KHU DU LỊCH (CASCADING)
  function populateCorpAndSiteFilters() {
    const corpSelect = document.getElementById('refundCorpFilter');
    const siteSelect = document.getElementById('refundSiteFilter');
    const agencySelect = document.getElementById('refundAgencyFilter');

    if (agencySelect) {
      let agHtml = '<option value="ALL">Tất cả đại lý</option>';
      REFUND_AGENCIES.forEach(a => {
        agHtml += `<option value="${a.name}">${a.code} | ${a.name}</option>`;
      });
      agencySelect.innerHTML = agHtml;
    }

    if (corpSelect) {
      let corpHtml = '<option value="ALL">Tất cả tập đoàn</option>';
      Object.keys(REFUND_CORP_SITES).forEach(corp => {
        corpHtml += `<option value="${corp}">${corp}</option>`;
      });
      corpSelect.innerHTML = corpHtml;
    }

    updateSiteDropdown('ALL');
  }

  function updateSiteDropdown(selectedCorp) {
    const siteSelect = document.getElementById('refundSiteFilter');
    if (!siteSelect) return;

    let siteHtml = '<option value="ALL">Tất cả khu du lịch</option>';
    if (selectedCorp === 'ALL') {
      Object.entries(REFUND_CORP_SITES).forEach(([corp, sites]) => {
        sites.forEach(s => {
          siteHtml += `<option value="${s}">[${corp}] ${s}</option>`;
        });
      });
    } else if (REFUND_CORP_SITES[selectedCorp]) {
      REFUND_CORP_SITES[selectedCorp].forEach(s => {
        siteHtml += `<option value="${s}">${s}</option>`;
      });
    }
    siteSelect.innerHTML = siteHtml;
    filterSite = 'ALL';
  }

  // 7. LỌC DỮ LIỆU DANH SÁCH (FILTER ENGINE)
  function getFilteredDataset() {
    return refundDataset.filter(item => {
      // 1. Lọc theo Tab trạng thái
      if (item.status !== activeTab) return false;

      // 2. Tìm kiếm mờ (partial match) theo: Mã yêu cầu, Mã đơn gốc, hoặc Tên người gửi
      if (filterSearch) {
        const q = filterSearch.toLowerCase().trim();
        const mReq = (item.requestCode || '').toLowerCase().includes(q);
        const mOrd = (item.originalOrderCode || '').toLowerCase().includes(q);
        const mRefOrd = (item.refundOrderCode || '').toLowerCase().includes(q);
        const mSender = (item.requesterName || '').toLowerCase().includes(q);
        const mPhone = (item.requesterPhone || '').toLowerCase().includes(q);
        if (!mReq && !mOrd && !mRefOrd && !mSender && !mPhone) return false;
      }

      // 3. Dropdown Đại lý
      if (filterAgency !== 'ALL' && item.agency !== filterAgency) return false;

      // 4. Dropdown Tập đoàn
      if (filterCorp !== 'ALL' && item.corp !== filterCorp) return false;

      // 5. Dropdown Khu du lịch
      if (filterSite !== 'ALL' && item.site !== filterSite) return false;

      // 6. Lọc khoảng thời gian (Ngày tạo)
      if (filterStartDate && filterEndDate) {
        const itemDate = (item.createdDate || '').slice(0, 10);
        if (itemDate && (itemDate < filterStartDate || itemDate > filterEndDate)) {
          return false;
        }
      }

      return true;
    });
  }

  // Cập nhật số lượng Badge trên 4 Tab
  function updateTabBadges() {
    const tabs = ['CHO_XU_LY', 'DANG_XU_LY', 'DANG_HOAN_TIEN', 'DA_XU_LY'];
    tabs.forEach(tabKey => {
      const count = refundDataset.filter(item => item.status === tabKey).length;
      const badgeEl = document.getElementById(`badgeTab_${tabKey}`);
      if (badgeEl) badgeEl.innerText = count;
    });
  }

  // 8. RENDER BẢNG DANH SÁCH
  function renderRefundTable() {
    const tbody = document.getElementById('refundTableBody');
    const emptyNotice = document.getElementById('refundEmptyNotice');
    const recordCountEl = document.getElementById('refundTableRecordCount');
    if (!tbody) return;

    updateTabBadges();
    const data = getFilteredDataset();

    if (recordCountEl) {
      recordCountEl.innerText = `${data.length} yêu cầu`;
    }

    if (data.length === 0) {
      tbody.innerHTML = '';
      if (emptyNotice) emptyNotice.classList.remove('hidden');
      return;
    }

    if (emptyNotice) emptyNotice.classList.add('hidden');

    tbody.innerHTML = data.map(item => {
      // Định dạng ngày sử dụng T (DD/MM/YYYY)
      const serviceDateFormatted = item.serviceDate ? item.serviceDate.split('-').reverse().join('/') : '-';

      // Badge nhãn tập đoàn
      let corpBadgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
      if (item.corp === 'Sun World') corpBadgeClass = 'bg-amber-50 text-amber-800 border-amber-200';
      else if (item.corp === 'VinWonders') corpBadgeClass = 'bg-rose-50 text-rose-800 border-rose-200';
      else if (item.corp === 'Nova Dreams') corpBadgeClass = 'bg-blue-50 text-blue-800 border-blue-200';

      return `
        <tr class="hover:bg-slate-50/90 transition-colors group">
          <!-- 1. Mã yêu cầu (RQRF...) -->
          <td class="px-3.5 py-3 whitespace-nowrap">
            <span class="font-mono text-xs font-black text-blue-700 tracking-tight block">${item.requestCode}</span>
            <span class="text-[10.5px] text-slate-400 font-medium">${item.createdDate}</span>
          </td>

          <!-- 2. Mã đơn hoàn -->
          <td class="px-3.5 py-3 whitespace-nowrap">
            <span class="font-mono text-xs font-bold text-slate-800 block">${item.refundOrderCode}</span>
          </td>

          <!-- 3. Mã đơn gốc -->
          <td class="px-3.5 py-3 whitespace-nowrap">
            <a href="orders.html?search=${encodeURIComponent(item.originalOrderCode)}" class="font-mono text-xs font-bold text-slate-700 hover:text-brand-600 inline-flex items-center gap-1 transition-colors">
              <span>${item.originalOrderCode}</span>
              <i class="fa-solid fa-arrow-up-right-from-square text-[9px] text-slate-400"></i>
            </a>
          </td>

          <!-- 4. Ngày sử dụng (T) -->
          <td class="px-3.5 py-3 whitespace-nowrap">
            <span class="font-semibold text-xs text-slate-800 block">${serviceDateFormatted}</span>
            <span class="text-[10px] text-amber-600 font-bold">Ngày dùng T</span>
          </td>

          <!-- 5. Số vé hoàn -->
          <td class="px-3.5 py-3 whitespace-nowrap text-center">
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200">
              ${item.ticketCount} vé
            </span>
          </td>

          <!-- 6. Tập đoàn -->
          <td class="px-3.5 py-3 whitespace-nowrap">
            <span class="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-bold border ${corpBadgeClass}">
              ${item.corp}
            </span>
          </td>

          <!-- 7. Khu du lịch -->
          <td class="px-3.5 py-3">
            <span class="font-semibold text-xs text-slate-800 block truncate max-w-[180px]" title="${item.site}">${item.site}</span>
          </td>

          <!-- 8. Đại lý -->
          <td class="px-3.5 py-3">
            <div class="truncate max-w-[170px]" title="${item.agency}">
              <span class="font-bold text-xs text-slate-800 block truncate">${item.agency}</span>
              <span class="text-[10.5px] font-mono text-slate-500 font-medium">${item.agencyCode || '-'}</span>
            </div>
          </td>

          <!-- 9. Người gửi yêu cầu -->
          <td class="px-3.5 py-3 whitespace-nowrap">
            <span class="font-bold text-xs text-slate-800 block">${item.requesterName}</span>
            <span class="text-[10.5px] text-slate-400 font-mono">${item.requesterPhone || '-'}</span>
          </td>

          <!-- 10. Email -->
          <td class="px-3.5 py-3">
            <span class="text-xs text-slate-600 font-medium truncate block max-w-[160px]" title="${item.requesterEmail}">${item.requesterEmail}</span>
          </td>

          <!-- 11. Mã số thuế -->
          <td class="px-3.5 py-3 whitespace-nowrap">
            <span class="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">${item.taxId || '-'}</span>
          </td>

          <!-- 12. Thao tác: Duy nhất Nút Xem chi tiết -->
          <td class="px-3.5 py-3 whitespace-nowrap text-right sticky right-0 bg-white/95 group-hover:bg-slate-50/95 transition-colors shadow-[-4px_0_12px_rgba(0,0,0,0.03)]">
            <button
              type="button"
              onclick="openRefundDetail('${item.requestCode}')"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-brand-500 hover:bg-brand-50 text-slate-700 hover:text-brand-600 text-xs font-bold transition-all shadow-2xs cursor-pointer group/btn"
            >
              <i class="fa-solid fa-eye text-slate-400 group-hover/btn:text-brand-500 text-[11px]"></i>
              <span>Xem chi tiết</span>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  // 9. CHUYỂN TAB TRẠNG THÁI
  function switchRefundTab(tabKey) {
    activeTab = tabKey;
    const tabs = ['CHO_XU_LY', 'DANG_XU_LY', 'DANG_HOAN_TIEN', 'DA_XU_LY'];
    tabs.forEach(k => {
      const btn = document.getElementById(`tabBtn_${k}`);
      if (!btn) return;
      if (k === tabKey) {
        btn.className = 'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all bg-white text-brand-600 shadow-2xs cursor-pointer border border-brand-200/60';
      } else {
        btn.className = 'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 cursor-pointer border border-transparent';
      }
    });

    renderRefundTable();
  }

  // 10. MÀN HÌNH CHI TIẾT ĐƠN HOÀN HỦY (NEXTPAGE WORKSPACE)
  function openRefundDetail(requestCode) {
    viewingRequestCode = requestCode;
    const item = refundDataset.find(r => r.requestCode === requestCode);
    if (!item) return;

    const listView = document.getElementById('viewRefundRequestsList');
    const detailView = document.getElementById('viewRefundRequestDetail');
    if (!listView || !detailView) return;

    listView.classList.add('hidden');
    detailView.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Render thông tin chi tiết
    renderDetailContent(item);
  }

  function closeRefundDetail() {
    viewingRequestCode = null;
    const listView = document.getElementById('viewRefundRequestsList');
    const detailView = document.getElementById('viewRefundRequestDetail');
    if (!listView || !detailView) return;

    detailView.classList.add('hidden');
    listView.classList.remove('hidden');
    renderRefundTable();
  }

  function renderDetailContent(item) {
    // 1. Breadcrumb & Header info
    document.getElementById('dtRequestCode').innerText = item.requestCode;
    document.getElementById('dtRefundOrderCode').innerText = item.refundOrderCode;
    document.getElementById('dtOriginalOrderCode').innerText = item.originalOrderCode;
    document.getElementById('dtCreatedDate').innerText = item.createdDate;
    document.getElementById('dtRequesterName').innerText = item.requesterName;
    document.getElementById('dtRequesterEmail').innerText = item.requesterEmail;
    document.getElementById('dtRequesterPhone').innerText = item.requesterPhone || '-';
    document.getElementById('dtAgencyName').innerText = item.agency;
    document.getElementById('dtAgencyCode').innerText = item.agencyCode || '-';
    document.getElementById('dtTaxId').innerText = item.taxId || '-';
    document.getElementById('dtCorpName').innerText = item.corp;
    document.getElementById('dtSiteName').innerText = item.site;
    document.getElementById('dtServiceDate').innerText = item.serviceDate ? item.serviceDate.split('-').reverse().join('/') : '-';
    document.getElementById('dtReasonText').innerText = item.reason;

    // Trạng thái badge
    const statusBadge = document.getElementById('dtStatusBadge');
    if (statusBadge) {
      if (item.status === 'CHO_XU_LY') {
        statusBadge.className = 'px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200';
        statusBadge.innerHTML = '<i class="fa-solid fa-clock mr-1"></i> Chờ xử lý';
      } else if (item.status === 'DANG_XU_LY') {
        statusBadge.className = 'px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200';
        statusBadge.innerHTML = '<i class="fa-solid fa-spinner mr-1"></i> Đang xử lý';
      } else if (item.status === 'DANG_HOAN_TIEN') {
        statusBadge.className = 'px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200';
        statusBadge.innerHTML = '<i class="fa-solid fa-money-bill-transfer mr-1"></i> Đang hoàn tiền';
      } else {
        if (item.subStatus === 'TU_CHOI') {
          statusBadge.className = 'px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200';
          statusBadge.innerHTML = '<i class="fa-solid fa-ban mr-1"></i> Đã từ chối';
        } else {
          statusBadge.className = 'px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200';
          statusBadge.innerHTML = '<i class="fa-solid fa-circle-check mr-1"></i> Đã hoàn tất';
        }
      }
    }

    // 2. Tài liệu đính kèm
    const docsContainer = document.getElementById('dtDocumentsList');
    if (docsContainer) {
      if (item.documents && item.documents.length > 0) {
        docsContainer.innerHTML = item.documents.map(doc => `
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors">
            <i class="fa-regular fa-file-pdf text-rose-500"></i>
            <span>${doc}</span>
          </div>
        `).join('');
      } else {
        docsContainer.innerHTML = '<span class="text-xs text-slate-400 italic">Không có tệp đính kèm</span>';
      }
    }

    // 3. Khối Từ chối (nếu có lý do từ chối)
    const rejectBox = document.getElementById('dtRejectBox');
    if (rejectBox) {
      if (item.subStatus === 'TU_CHOI' && item.rejectReason) {
        rejectBox.classList.remove('hidden');
        document.getElementById('dtRejectReasonText').innerText = item.rejectReason;
      } else {
        rejectBox.classList.add('hidden');
      }
    }

    // 4. Bảng tính vé và chi phí
    renderDetailTicketsTable(item);

    // 5. Render Button Chân trang theo đúng Quy tắc từng Tab
    renderDetailActionButtons(item);
  }

  function renderDetailTicketsTable(item) {
    const tableBody = document.getElementById('dtTicketsTableBody');
    if (!tableBody) return;

    const isEditable = item.status === 'DANG_XU_LY';

    tableBody.innerHTML = (item.tickets || []).map((t, idx) => {
      return `
        <tr class="divide-x divide-slate-100 border-b border-slate-100">
          <td class="p-3 text-center text-xs font-mono text-slate-400">${idx + 1}</td>
          <td class="p-3">
            <span class="font-bold text-xs text-slate-800 block">${t.type}</span>
            <span class="font-mono text-[11px] text-blue-600 font-semibold">${t.qrCode}</span>
          </td>
          <td class="p-3 text-right font-mono font-bold text-xs text-slate-700">
            ${(t.price || 0).toLocaleString('vi-VN')} đ
          </td>
          <td class="p-3 text-right font-mono text-xs">
            ${isEditable ? `
              <input type="number" onchange="onDetailTicketChargeChange(${idx}, this.value)" value="${t.charge || 0}" class="w-28 px-2 py-1 text-right rounded-lg border border-slate-200 font-mono text-xs font-bold text-rose-600 focus:outline-none focus:border-brand-500">
            ` : `
              <span class="font-bold text-rose-600">-${(t.charge || 0).toLocaleString('vi-VN')} đ</span>
            `}
          </td>
          <td class="p-3 text-right font-mono font-black text-xs text-emerald-600">
            ${(t.refund || 0).toLocaleString('vi-VN')} đ
          </td>
        </tr>
      `;
    }).join('');

    // Cập nhật tổng kết tiền
    document.getElementById('dtTotalOriginal').innerText = `${(item.totalOriginalAmount || 0).toLocaleString('vi-VN')} đ`;
    document.getElementById('dtTotalCharge').innerText = `-${(item.chargeAmount || 0).toLocaleString('vi-VN')} đ`;
    document.getElementById('dtTotalRefund').innerText = `${(item.totalRefundAmount || 0).toLocaleString('vi-VN')} đ`;
  }

  // 11. RENDER CHÂN TRANG THEO QUY TẮC CỦA TỪNG TAB
  function renderDetailActionButtons(item) {
    const footerContainer = document.getElementById('dtActionButtonsContainer');
    if (!footerContainer) return;

    let html = '';

    if (item.status === 'CHO_XU_LY') {
      // TAB 1: CHỜ XỬ LÝ
      // Hiển thị cặp nút: Từ chối & Nhận yêu cầu
      // Nếu là phiếu do chính mình tạo khi chưa có ai tiếp nhận: thêm nút Thu hồi
      html = `
        <div class="flex items-center justify-between w-full">
          <div>
            ${item.isMyCreated ? `
              <button type="button" onclick="actionRevokeRequest('${item.requestCode}')" class="px-4 py-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer">
                <i class="fa-solid fa-rotate-left"></i>
                <span>Thu hồi yêu cầu</span>
              </button>
            ` : `
              <span class="text-xs text-slate-400 italic">Đang chờ chuyên viên CSKH / Kế toán tiếp nhận thẩm tra</span>
            `}
          </div>
          <div class="flex items-center gap-2.5">
            <button type="button" onclick="actionRejectRequest('${item.requestCode}')" class="px-4 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer">
              <i class="fa-solid fa-xmark"></i>
              <span>Từ chối</span>
            </button>
            <button type="button" onclick="actionAcceptRequest('${item.requestCode}')" class="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer">
              <i class="fa-solid fa-hand-holding-hand"></i>
              <span>Nhận yêu cầu</span>
            </button>
          </div>
        </div>
      `;
    } else if (item.status === 'DANG_XU_LY') {
      // TAB 2: ĐANG XỬ LÝ
      // Nhập giá hoàn / charge tiền (lẻ hoặc hàng loạt), đính kèm tài liệu và bấm Duyệt hoặc Từ chối
      html = `
        <div class="flex items-center justify-between w-full">
          <div class="flex items-center gap-2">
            <button type="button" onclick="actionBatchCharge('${item.requestCode}')" class="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer">
              <i class="fa-solid fa-sliders text-slate-500"></i>
              <span>Áp dụng phí Charge hàng loạt</span>
            </button>
            <button type="button" onclick="actionAttachDocument('${item.requestCode}')" class="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer">
              <i class="fa-solid fa-paperclip text-slate-500"></i>
              <span>Đính kèm tài liệu đối soát</span>
            </button>
          </div>
          <div class="flex items-center gap-2.5">
            <button type="button" onclick="actionRejectRequest('${item.requestCode}')" class="px-4 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer">
              <i class="fa-solid fa-xmark"></i>
              <span>Từ chối</span>
            </button>
            <button type="button" onclick="actionApproveRefund('${item.requestCode}')" class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer">
              <i class="fa-solid fa-check"></i>
              <span>Duyệt hoàn vé</span>
            </button>
          </div>
        </div>
      `;
    } else if (item.status === 'DANG_HOAN_TIEN') {
      // TAB 3: ĐANG HOÀN TIỀN
      // Nút Xem chi tiết để theo dõi tiến độ hoặc thực hiện duyệt hoàn tiền nếu có quyền
      html = `
        <div class="flex items-center justify-between w-full">
          <div class="flex items-center gap-2 text-xs text-purple-700 font-bold bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200">
            <i class="fa-solid fa-spinner animate-spin"></i>
            <span>Đã duyệt hạn mức hoàn: ${(item.totalRefundAmount || 0).toLocaleString('vi-VN')} đ - Đang chờ hạch toán giải ngân</span>
          </div>
          <div class="flex items-center gap-2.5">
            <button type="button" onclick="actionConfirmDisbursement('${item.requestCode}')" class="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer">
              <i class="fa-solid fa-wallet"></i>
              <span>Xác nhận hoàn tiền (Ví / TK Ngân hàng)</span>
            </button>
          </div>
        </div>
      `;
    } else {
      // TAB 4: ĐÃ XỬ LÝ (Read-only)
      html = `
        <div class="flex items-center justify-between w-full">
          <div class="text-xs text-slate-500 font-medium">
            <i class="fa-solid fa-lock mr-1 text-slate-400"></i> Hồ sơ hoàn hủy đã đóng và lưu vết kiểm toán hệ thống.
          </div>
          <div class="flex items-center gap-2">
            <button type="button" onclick="window.print()" class="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer">
              <i class="fa-solid fa-print text-slate-400"></i>
              <span>In phiếu</span>
            </button>
            <button type="button" onclick="closeRefundDetail()" class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer">
              <span>Đóng</span>
            </button>
          </div>
        </div>
      `;
    }

    footerContainer.innerHTML = html;
  }

  // 12. CÁC HÀNH ĐỘNG NGHIỆP VỤ (ACTIONS)
  function actionAcceptRequest(requestCode) {
    const item = refundDataset.find(r => r.requestCode === requestCode);
    if (!item) return;

    if (confirm(`Xác nhận tiếp nhận xử lý yêu cầu hoàn vé ${requestCode}?`)) {
      item.status = 'DANG_XU_LY';
      item.subStatus = 'DANG_THAM_DINH';
      item.assignedTo = 'Người dùng hiện tại (CSKH Booking)';

      if (typeof showToast === 'function') {
        showToast('Đã tiếp nhận yêu cầu', `Yêu cầu ${requestCode} đã chuyển sang Tab Đang xử lý.`);
      }
      openRefundDetail(requestCode);
    }
  }

  function actionRevokeRequest(requestCode) {
    const item = refundDataset.find(r => r.requestCode === requestCode);
    if (!item) return;

    if (confirm(`Bạn có chắc chắn muốn THU HỒI yêu cầu hoàn vé ${requestCode}? Thao tác này sẽ hủy phiếu yêu cầu.`)) {
      refundDataset = refundDataset.filter(r => r.requestCode !== requestCode);
      if (typeof showToast === 'function') {
        showToast('Đã thu hồi yêu cầu', `Đã hủy và thu hồi yêu cầu ${requestCode} thành công.`);
      }
      closeRefundDetail();
    }
  }

  function actionRejectRequest(requestCode) {
    const item = refundDataset.find(r => r.requestCode === requestCode);
    if (!item) return;

    const reason = prompt('Vui lòng nhập lý do từ chối yêu cầu hoàn vé:', 'Vé không đủ điều kiện theo quy định của ban quản lý');
    if (reason && reason.trim()) {
      item.status = 'DA_XU_LY';
      item.subStatus = 'TU_CHOI';
      item.rejectReason = reason.trim();
      item.processedDate = new Date().toISOString().slice(0, 16).replace('T', ' ');

      if (typeof showToast === 'function') {
        showToast('Đã từ chối', `Đã từ chối yêu cầu ${requestCode} và chuyển sang Tab Đã xử lý.`);
      }
      openRefundDetail(requestCode);
    }
  }

  function actionApproveRefund(requestCode) {
    const item = refundDataset.find(r => r.requestCode === requestCode);
    if (!item) return;

    if (confirm(`Xác nhận duyệt đề xuất hoàn vé ${requestCode} với số tiền hoàn trả ${item.totalRefundAmount.toLocaleString('vi-VN')} đ?`)) {
      item.status = 'DANG_HOAN_TIEN';
      item.subStatus = 'CHO_GIAI_NGAN';

      if (typeof showToast === 'function') {
        showToast('Duyệt thành công', `Yêu cầu ${requestCode} đã chuyển sang Tab Đang hoàn tiền để kế toán giải ngân.`);
      }
      openRefundDetail(requestCode);
    }
  }

  function actionConfirmDisbursement(requestCode) {
    const item = refundDataset.find(r => r.requestCode === requestCode);
    if (!item) return;

    if (confirm(`Xác nhận hoàn tất giải ngân số tiền ${item.totalRefundAmount.toLocaleString('vi-VN')} đ về Ví / Tài khoản đối tác?`)) {
      item.status = 'DA_XU_LY';
      item.subStatus = 'HOAN_TAT';
      item.processedDate = new Date().toISOString().slice(0, 16).replace('T', ' ');

      // Nếu có TecheraDB, cộng tiền vào ví đại lý
      if (typeof TecheraDB !== 'undefined' && typeof TecheraDB.adjustWalletBalance === 'function') {
        TecheraDB.adjustWalletBalance(item.totalRefundAmount, {
          isTopup: false,
          method: 'Hoàn tiền vé',
          note: `Hoàn tiền yêu cầu #${item.requestCode} (Đơn gốc: ${item.originalOrderCode})`
        });
      }

      if (typeof showToast === 'function') {
        showToast('Hoàn tiền thành công', `Đã hạch toán hoàn tất số tiền ${item.totalRefundAmount.toLocaleString('vi-VN')} đ cho yêu cầu ${requestCode}.`);
      }
      openRefundDetail(requestCode);
    }
  }

  function actionBatchCharge(requestCode) {
    const item = refundDataset.find(r => r.requestCode === requestCode);
    if (!item) return;

    const rateStr = prompt('Nhập % phí phạt hoàn vé muốn áp dụng cho tất cả vé (VD: 10, 15, 20):', String(item.chargeRate || 10));
    if (rateStr !== null) {
      const rate = parseFloat(rateStr) || 0;
      item.chargeRate = rate;
      let totalCharge = 0;
      let totalRefund = 0;

      (item.tickets || []).forEach(t => {
        t.charge = Math.round((t.price * rate) / 100);
        t.refund = t.price - t.charge;
        totalCharge += t.charge;
        totalRefund += t.refund;
      });

      item.chargeAmount = totalCharge;
      item.totalRefundAmount = totalRefund;

      renderDetailTicketsTable(item);
      if (typeof showToast === 'function') {
        showToast('Cập nhật phí hoàn', `Đã áp dụng mức charge ${rate}% cho toàn bộ vé.`);
      }
    }
  }

  function actionAttachDocument(requestCode) {
    const item = refundDataset.find(r => r.requestCode === requestCode);
    if (!item) return;

    const fileName = prompt('Nhập tên tệp tài liệu đối soát muốn đính kèm (VD: Bien-ban-thu-hoi-ve.pdf):', 'Bien-ban-thu-hoi-ve-sunworld.pdf');
    if (fileName && fileName.trim()) {
      if (!item.documents) item.documents = [];
      item.documents.push(fileName.trim());
      renderDetailContent(item);
      if (typeof showToast === 'function') {
        showToast('Đã đính kèm tệp', `Đã tải lên tệp: ${fileName.trim()}`);
      }
    }
  }

  function onDetailTicketChargeChange(ticketIdx, chargeVal) {
    if (!viewingRequestCode) return;
    const item = refundDataset.find(r => r.requestCode === viewingRequestCode);
    if (!item || !item.tickets || !item.tickets[ticketIdx]) return;

    const t = item.tickets[ticketIdx];
    const charge = Math.max(0, Math.min(t.price, parseFloat(chargeVal) || 0));
    t.charge = charge;
    t.refund = t.price - charge;

    // Recalculate totals
    let totalCharge = 0;
    let totalRefund = 0;
    item.tickets.forEach(tk => {
      totalCharge += tk.charge || 0;
      totalRefund += tk.refund || 0;
    });
    item.chargeAmount = totalCharge;
    item.totalRefundAmount = totalRefund;

    renderDetailTicketsTable(item);
  }

  // 13. TẠO YÊU CẦU HOÀN VÉ MỚI (MODAL CREATE)
  function openCreateRefundModal() {
    const modal = document.getElementById('modalCreateRefundRequest');
    if (!modal) return;

    // Tự sinh mã yêu cầu
    const newReqCode = generateRefundRequestCode();
    const reqCodeInput = document.getElementById('newRefundRequestCode');
    if (reqCodeInput) reqCodeInput.value = newReqCode;

    modal.classList.remove('hidden');
  }

  function closeCreateRefundModal() {
    const modal = document.getElementById('modalCreateRefundRequest');
    if (modal) modal.classList.add('hidden');
  }

  function submitNewRefundRequest() {
    const reqCode = document.getElementById('newRefundRequestCode')?.value || generateRefundRequestCode();
    const origOrder = document.getElementById('newOriginalOrderCode')?.value.trim() || 'ORD-2611-099';
    const corp = document.getElementById('newCorpSelect')?.value || 'Sun World';
    const site = document.getElementById('newSiteSelect')?.value || 'Sun World Ba Na Hills';
    const agency = document.getElementById('newAgencySelect')?.value || 'Công ty Cổ phần Du Lịch Việt Nam (Vietravel)';
    const requester = document.getElementById('newRequesterName')?.value.trim() || 'Nguyễn Văn An';
    const email = document.getElementById('newRequesterEmail')?.value.trim() || 'an.nguyen@vietravel.com';
    const ticketCount = parseInt(document.getElementById('newTicketCount')?.value, 10) || 2;
    const unitPrice = parseFloat(document.getElementById('newUnitPrice')?.value) || 950000;
    const reason = document.getElementById('newReasonText')?.value.trim() || 'Lý do hoàn vé đột xuất';

    const totalAmt = ticketCount * unitPrice;
    const charge = Math.round(totalAmt * 0.1);
    const refundAmt = totalAmt - charge;

    const tickets = [];
    for (let i = 1; i <= ticketCount; i++) {
      tickets.push({
        type: 'Vé tham quan tiêu chuẩn',
        qrCode: `QR-${Date.now().toString().slice(-6)}-${i}`,
        price: unitPrice,
        charge: Math.round(unitPrice * 0.1),
        refund: unitPrice - Math.round(unitPrice * 0.1)
      });
    }

    const newRecord = {
      requestCode: reqCode,
      refundOrderCode: `RFD-${reqCode.slice(4)}`,
      originalOrderCode: origOrder,
      serviceDate: '2026-11-25',
      ticketCount: ticketCount,
      corp: corp,
      site: site,
      agency: agency,
      agencyCode: 'DL-8899',
      requesterName: requester,
      requesterEmail: email,
      requesterPhone: '0903123456',
      taxId: '0312456789',
      status: 'CHO_XU_LY',
      subStatus: 'CHO_TIEP_NHAN',
      createdDate: new Date().toISOString().slice(0, 16).replace('T', ' '),
      assignedTo: null,
      isMyCreated: true,
      totalOriginalAmount: totalAmt,
      chargeRate: 10,
      chargeAmount: charge,
      totalRefundAmount: refundAmt,
      reason: reason,
      documents: ['Yeu-cau-hoan-moi.pdf'],
      tickets: tickets
    };

    refundDataset.unshift(newRecord);
    closeCreateRefundModal();

    // Chuyển về Tab Chờ xử lý và render lại
    switchRefundTab('CHO_XU_LY');

    if (typeof showToast === 'function') {
      showToast('Tạo yêu cầu thành công', `Đã tạo yêu cầu hoàn vé ${reqCode} ở trạng thái Chờ xử lý.`);
    }
  }

  // 14. KHỞI TẠO BỘ LỌC THỜI GIAN CHUẨN
  function initRefundDateRangePicker() {
    if (typeof createStandardDateRangePicker === 'function' && document.getElementById('refund_btnDateTrigger')) {
      datePickerInstance = createStandardDateRangePicker({
        prefix: 'refund',
        baseDate: '2026-11-19',
        defaultStart: filterStartDate,
        defaultEnd: filterEndDate,
        defaultPreset: filterDatePreset,
        onApply: (start, end, preset) => {
          filterStartDate = start;
          filterEndDate = end;
          filterDatePreset = preset;
          renderRefundTable();
        },
        onCancel: () => {}
      });
    }
  }

  // 15. RESET BỘ LỌC
  function resetRefundFilters() {
    const sInput = document.getElementById('refundSearchInput');
    const agSelect = document.getElementById('refundAgencyFilter');
    const cSelect = document.getElementById('refundCorpFilter');
    const stSelect = document.getElementById('refundSiteFilter');

    if (sInput) sInput.value = '';
    if (agSelect) agSelect.value = 'ALL';
    if (cSelect) cSelect.value = 'ALL';
    updateSiteDropdown('ALL');
    if (stSelect) stSelect.value = 'ALL';

    filterSearch = '';
    filterAgency = 'ALL';
    filterCorp = 'ALL';
    filterSite = 'ALL';

    if (datePickerInstance && typeof datePickerInstance.setRange === 'function') {
      datePickerInstance.setRange('2026-11-01', '2026-11-19', 'this_month');
    }
    filterStartDate = '2026-11-01';
    filterEndDate = '2026-11-19';
    filterDatePreset = 'this_month';

    renderRefundTable();
  }

  // 16. EVENT LISTENERS & BOOTSTRAP
  function setupFilterEventListeners() {
    const searchInput = document.getElementById('refundSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        filterSearch = e.target.value;
        renderRefundTable();
      });
    }

    const agSelect = document.getElementById('refundAgencyFilter');
    if (agSelect) {
      agSelect.addEventListener('change', (e) => {
        filterAgency = e.target.value;
        renderRefundTable();
      });
    }

    const corpSelect = document.getElementById('refundCorpFilter');
    if (corpSelect) {
      corpSelect.addEventListener('change', (e) => {
        filterCorp = e.target.value;
        updateSiteDropdown(filterCorp);
        renderRefundTable();
      });
    }

    const siteSelect = document.getElementById('refundSiteFilter');
    if (siteSelect) {
      siteSelect.addEventListener('change', (e) => {
        filterSite = e.target.value;
        renderRefundTable();
      });
    }
  }

  // Khởi động phân hệ
  function initRefundSubsystem() {
    populateCorpAndSiteFilters();
    setupFilterEventListeners();
    initRefundDateRangePicker();
    renderRefundTable();

    // Check URL parameters for direct detail viewing
    const urlParams = new URLSearchParams(window.location.search);
    const codeParam = urlParams.get('code');
    if (codeParam) {
      openRefundDetail(codeParam);
    }
  }

  // EXPORT GLOBAL FUNCTIONS
  window.switchRefundTab = switchRefundTab;
  window.openRefundDetail = openRefundDetail;
  window.closeRefundDetail = closeRefundDetail;
  window.resetRefundFilters = resetRefundFilters;
  window.openCreateRefundModal = openCreateRefundModal;
  window.closeCreateRefundModal = closeCreateRefundModal;
  window.submitNewRefundRequest = submitNewRefundRequest;
  window.actionAcceptRequest = actionAcceptRequest;
  window.actionRevokeRequest = actionRevokeRequest;
  window.actionRejectRequest = actionRejectRequest;
  window.actionApproveRefund = actionApproveRefund;
  window.actionConfirmDisbursement = actionConfirmDisbursement;
  window.actionBatchCharge = actionBatchCharge;
  window.actionAttachDocument = actionAttachDocument;
  window.onDetailTicketChargeChange = onDetailTicketChargeChange;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRefundSubsystem);
  } else {
    initRefundSubsystem();
  }
})();
