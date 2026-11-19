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

  // 2.1 DANH SÁCH ĐƠN HÀNG ĐỦ ĐIỀU KIỆN HOÀN/HỦY (MOCK_ELIGIBLE_ORDERS)
  // Chỉ liệt kê các đơn hàng đã thanh toán/xuất vé và còn vé khả dụng
  const MOCK_ELIGIBLE_ORDERS = [
    {
      orderId: 'ORD-2611-088',
      customerName: 'Nguyễn Tuấn Kiệt',
      customerPhone: '0918 223 344',
      serviceDate: '2026-11-25', // Trước ngày T (hôm nay 19/11/2026) -> Phạt 30%
      totalPaid: 4750000,
      corp: 'Sun World',
      site: 'Sun World Ba Na Hills',
      packages: [
        {
          packageId: 'PKG-01',
          packageName: 'Vé Cáp treo Ba Na Hills khứ hồi - Người lớn',
          category: 'Cáp treo & Tham quan',
          tickets: [
            { serial: 'BND-2611-00101', name: 'Vé cáp treo Người lớn', price: 950000, status: 'ELIGIBLE' },
            { serial: 'BND-2611-00102', name: 'Vé cáp treo Người lớn', price: 950000, status: 'ELIGIBLE' },
            { serial: 'BND-2611-00103', name: 'Vé cáp treo Người lớn', price: 950000, status: 'PENDING_REFUND' } // Đang có yêu cầu hoàn/hủy
          ]
        },
        {
          packageId: 'PKG-02',
          packageName: 'Vé Buffet trưa Nhà hàng Beer Plaza',
          category: 'Ẩm thực & Buffet',
          tickets: [
            { serial: 'BNB-2611-00201', name: 'Suất buffet trưa Người lớn', price: 350000, status: 'ELIGIBLE' },
            { serial: 'BNB-2611-00202', name: 'Suất buffet trưa Người lớn', price: 350000, status: 'REFUNDED' }, // Đã hoàn
            { serial: 'BNB-2611-00203', name: 'Suất buffet trưa Người lớn', price: 350000, status: 'CANCELLED' } // Đã hủy
          ]
        }
      ]
    },
    {
      orderId: 'ORD-2611-092',
      customerName: 'Trần Minh Tâm',
      customerPhone: '0909 887 766',
      serviceDate: '2026-11-19', // Đúng ngày T (hôm nay 19/11/2026) -> Phạt 50%
      totalPaid: 5100000,
      corp: 'VinWonders',
      site: 'VinWonders Nha Trang',
      packages: [
        {
          packageId: 'PKG-11',
          packageName: 'Vé vào cổng trọn gói VinWonders Nha Trang',
          category: 'Vé vào cổng',
          tickets: [
            { serial: 'VNW-2611-0101', name: 'Vé vào cổng Người lớn', price: 850000, status: 'ELIGIBLE' },
            { serial: 'VNW-2611-0102', name: 'Vé vào cổng Người lớn', price: 850000, status: 'ELIGIBLE' },
            { serial: 'VNW-2611-0103', name: 'Vé vào cổng Người lớn', price: 850000, status: 'ELIGIBLE' },
            { serial: 'VNW-2611-0104', name: 'Vé vào cổng Trẻ em', price: 650000, status: 'REFUNDED' }
          ]
        },
        {
          packageId: 'PKG-12',
          packageName: 'Vé Cáp treo vượt biển khứ hồi',
          category: 'Vận chuyển',
          tickets: [
            { serial: 'VNW-2611-0201', name: 'Cáp treo khứ hồi', price: 200000, status: 'ELIGIBLE' },
            { serial: 'VNW-2611-0202', name: 'Cáp treo khứ hồi', price: 200000, status: 'ELIGIBLE' }
          ]
        }
      ]
    },
    {
      orderId: 'ORD-2611-095',
      customerName: 'Lê Thu Hằng',
      customerPhone: '0983 556 677',
      serviceDate: '2026-11-28', // Trước ngày T -> Phạt 30%
      totalPaid: 3400000,
      corp: 'Sun World',
      site: 'Sun World Fansipan Legend',
      packages: [
        {
          packageId: 'PKG-21',
          packageName: 'Vé Cáp treo Fansipan & Tàu hỏa Mường Hoa',
          category: 'Cáp treo & Tham quan',
          tickets: [
            { serial: 'FSP-2611-0001', name: 'Vé Cáp treo Fansipan', price: 850000, status: 'ELIGIBLE' },
            { serial: 'FSP-2611-0002', name: 'Vé Cáp treo Fansipan', price: 850000, status: 'ELIGIBLE' },
            { serial: 'FSP-2611-0003', name: 'Vé Cáp treo Fansipan', price: 850000, status: 'ELIGIBLE' },
            { serial: 'FSP-2611-0004', name: 'Vé Cáp treo Fansipan', price: 850000, status: 'ELIGIBLE' }
          ]
        }
      ]
    },
    {
      orderId: 'ORD-2611-102',
      customerName: 'Phạm Hoàng Nam',
      customerPhone: '0934 112 233',
      serviceDate: '2026-11-30', // Trước ngày T -> Phạt 30%
      totalPaid: 2800000,
      corp: 'Nova Dreams',
      site: 'NovaWorld Phan Thiết (Water Park & Circus Land)',
      packages: [
        {
          packageId: 'PKG-31',
          packageName: 'Vé Công viên nước Wonderland Water Park',
          category: 'Công viên nước',
          tickets: [
            { serial: 'WLD-2611-001', name: 'Vé ngày Người lớn', price: 350000, status: 'ELIGIBLE' },
            { serial: 'WLD-2611-002', name: 'Vé ngày Người lớn', price: 350000, status: 'ELIGIBLE' },
            { serial: 'WLD-2611-003', name: 'Vé ngày Người lớn', price: 350000, status: 'ELIGIBLE' },
            { serial: 'WLD-2611-004', name: 'Vé ngày Người lớn', price: 350000, status: 'ELIGIBLE' },
            { serial: 'WLD-2611-005', name: 'Vé ngày Trẻ em', price: 250000, status: 'PENDING_REFUND' }
          ]
        }
      ]
    }
  ];


  // 3. MOCK DATA YÊU CẦU HOÀN/HỦY VÉ THEO 3 TAB CHUẨN NGHIỆP VỤ
  let refundDataset = [
    // ========================================================================
    // TAB 1: ĐỢI TIẾP NHẬN (DOI_TIEP_NHAN)
    // Gồm: Đơn từ người gửi tạo (chờ mình tiếp nhận) & Đơn do mình tạo (chờ cấp trên tiếp nhận)
    // ========================================================================
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
      status: 'DOI_TIEP_NHAN',
      subStatus: 'CHO_TIEP_NHAN',
      createdDate: '2026-11-19 08:30',
      assignedTo: null,
      isMyCreated: true, // Đơn do chính mình tạo gửi lên cấp trên (Chờ cấp trên tiếp nhận)
      totalOriginalAmount: 3800000,
      chargeRate: 10,
      chargeAmount: null,
      groupRefundAmount: null,
      totalRefundAmount: null,
      reason: 'Khách bị delay chuyến bay từ Hà Nội vào Đà Nẵng, có giấy xác nhận của Vietnam Airlines.',
      documents: ['Giay-xac-nhan-delay-VN128.pdf', 'Yeu-cau-hoan-ve-vietravel.jpg'],
      tickets: [
        { type: 'Vé Cáp Treo & Buffet (Người lớn)', qrCode: 'QR-BN-880192', price: 950000, refundFromGroup: null, groupPenalty: null, finalRefund: null },
        { type: 'Vé Cáp Treo & Buffet (Người lớn)', qrCode: 'QR-BN-880193', price: 950000, refundFromGroup: null, groupPenalty: null, finalRefund: null },
        { type: 'Vé Cáp Treo & Buffet (Người lớn)', qrCode: 'QR-BN-880194', price: 950000, refundFromGroup: null, groupPenalty: null, finalRefund: null },
        { type: 'Vé Cáp Treo & Buffet (Người lớn)', qrCode: 'QR-BN-880195', price: 950000, refundFromGroup: null, groupPenalty: null, finalRefund: null }
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
      status: 'DOI_TIEP_NHAN',
      subStatus: 'CHO_TIEP_NHAN',
      createdDate: '2026-11-19 09:15',
      assignedTo: null,
      isMyCreated: false, // Đơn do Đại lý gửi lên cho mình xử lý
      totalOriginalAmount: 2500000,
      chargeRate: 15,
      chargeAmount: null,
      groupRefundAmount: null,
      totalRefundAmount: null,
      reason: 'Khách hàng có người nhà ốm đột xuất phải hủy lịch trình Phú Quốc.',
      documents: ['Giay-xac-nhan-y-te.pdf'],
      tickets: [
        { type: 'Vé Cổng + Safari (Người lớn)', qrCode: 'QR-PQ-110291', price: 1250000, refundFromGroup: null, groupPenalty: null, finalRefund: null },
        { type: 'Vé Cổng + Safari (Người lớn)', qrCode: 'QR-PQ-110292', price: 1250000, refundFromGroup: null, groupPenalty: null, finalRefund: null }
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
      status: 'DOI_TIEP_NHAN',
      subStatus: 'CHO_TIEP_NHAN',
      createdDate: '2026-11-19 10:00',
      assignedTo: null,
      isMyCreated: false, // Đơn do Đại lý gửi lên cho mình xử lý
      totalOriginalAmount: 5100000,
      chargeRate: 10,
      chargeAmount: null,
      groupRefundAmount: null,
      totalRefundAmount: null,
      reason: 'Đoàn tour 6 khách chuyển hướng sang tour Mộc Châu, xin hủy hoàn vé Fansipan.',
      documents: ['Bien-ban-chuyen-tour.pdf'],
      tickets: [
        { type: 'Vé Cáp Treo Khứ Hồi Fansipan', qrCode: 'QR-FS-44011', price: 850000, refundFromGroup: null, groupPenalty: null, finalRefund: null },
        { type: 'Vé Cáp Treo Khứ Hồi Fansipan', qrCode: 'QR-FS-44012', price: 850000, refundFromGroup: null, groupPenalty: null, finalRefund: null },
        { type: 'Vé Cáp Treo Khứ Hồi Fansipan', qrCode: 'QR-FS-44013', price: 850000, refundFromGroup: null, groupPenalty: null, finalRefund: null },
        { type: 'Vé Cáp Treo Khứ Hồi Fansipan', qrCode: 'QR-FS-44014', price: 850000, refundFromGroup: null, groupPenalty: null, finalRefund: null },
        { type: 'Vé Cáp Treo Khứ Hồi Fansipan', qrCode: 'QR-FS-44015', price: 850000, refundFromGroup: null, groupPenalty: null, finalRefund: null },
        { type: 'Vé Cáp Treo Khứ Hồi Fansipan', qrCode: 'QR-FS-44016', price: 850000, refundFromGroup: null, groupPenalty: null, finalRefund: null }
      ]
    },

    // ========================================================================
    // TAB 2: ĐANG XỬ LÝ (DANG_XU_LY)
    // Gồm: Đơn đại lý gửi đã được mình tiếp nhận & Đơn do mình tạo đã được cấp trên tiếp nhận
    // ========================================================================
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
      isMyCreated: false, // Đơn đại lý gửi lên, mình đã tiếp nhận, đang nhập tiền hoàn & đối soát
      totalOriginalAmount: 2160000,
      chargeRate: 15,
      chargeAmount: null,
      groupRefundAmount: null,
      totalRefundAmount: null,
      reason: 'Thời tiết Quảng Ninh mưa to gió lớn cấp 6, cáp treo Nữ Hoàng tạm dừng vận hành.',
      documents: ['Thong-bao-dung-van-hanh-ha-long.png'],
      tickets: [
        { type: 'Combo Dragon Park & Cáp Treo', qrCode: 'QR-HL-99201', price: 720000, refundFromGroup: null, groupPenalty: null, finalRefund: null },
        { type: 'Combo Dragon Park & Cáp Treo', qrCode: 'QR-HL-99202', price: 720000, refundFromGroup: null, groupPenalty: null, finalRefund: null },
        { type: 'Combo Dragon Park & Cáp Treo', qrCode: 'QR-HL-99203', price: 720000, refundFromGroup: null, groupPenalty: null, finalRefund: null }
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
      isMyCreated: false, // Đơn đại lý gửi lên, mình đã tiếp nhận, đang xử lý
      totalOriginalAmount: 2250000,
      chargeRate: 10,
      chargeAmount: 225000,
      groupRefundAmount: 2025000,
      totalRefundAmount: 2025000,
      reason: 'Khách đặt nhầm ngày sử dụng trước 1 tuần, xin hủy đơn để đặt lại đúng ngày.',
      documents: ['Yeu-cau-doi-ve.pdf'],
      tickets: [
        { type: 'Vé Công Viên Nước Wonderland Water Park', qrCode: 'QR-NW-771', price: 450000, refundFromGroup: 405000, groupPenalty: 45000, finalRefund: 405000 },
        { type: 'Vé Công Viên Nước Wonderland Water Park', qrCode: 'QR-NW-772', price: 450000, refundFromGroup: 405000, groupPenalty: 45000, finalRefund: 405000 },
        { type: 'Vé Công Viên Nước Wonderland Water Park', qrCode: 'QR-NW-773', price: 450000, refundFromGroup: 405000, groupPenalty: 45000, finalRefund: 405000 },
        { type: 'Vé Công Viên Nước Wonderland Water Park', qrCode: 'QR-NW-774', price: 450000, refundFromGroup: 405000, groupPenalty: 45000, finalRefund: 405000 },
        { type: 'Vé Công Viên Nước Wonderland Water Park', qrCode: 'QR-NW-775', price: 450000, refundFromGroup: 405000, groupPenalty: 45000, finalRefund: 405000 }
      ]
    },
    {
      requestCode: 'RQRF2611180010',
      refundOrderCode: 'RFD-2611-010',
      originalOrderCode: 'ORD-2611-088',
      serviceDate: '2026-11-25',
      ticketCount: 2,
      corp: 'Sun World',
      site: 'Sun World Ba Na Hills',
      agency: 'Công ty Cổ phần Du Lịch Việt Nam (Vietravel)',
      agencyCode: 'DL-8899',
      requesterName: 'Nguyễn Văn An',
      requesterEmail: 'an.nguyen@vietravel.com',
      requesterPhone: '0903123456',
      taxId: '0312456789',
      status: 'DANG_XU_LY',
      subStatus: 'DANG_THAM_DINH',
      createdDate: '2026-11-18 11:00',
      assignedTo: 'Hoàng Minh Thắng (Trưởng phòng Vé)',
      isMyCreated: true, // Đơn do mình tạo, cấp trên đã tiếp nhận và đang thẩm định đối soát
      totalOriginalAmount: 1900000,
      chargeRate: 10,
      chargeAmount: 190000,
      groupRefundAmount: 1710000,
      totalRefundAmount: 1710000,
      reason: 'Khách hàng có lịch công tác đột xuất, xin hủy hoàn cặp vé cáp treo khứ hồi.',
      documents: ['Giay-xac-nhan-lich-cong-tac.pdf'],
      tickets: [
        { type: 'Vé Cáp treo Ba Na Hills khứ hồi', qrCode: 'BND-2611-00101', price: 950000, refundFromGroup: 855000, groupPenalty: 95000, finalRefund: 855000 },
        { type: 'Vé Cáp treo Ba Na Hills khứ hồi', qrCode: 'BND-2611-00102', price: 950000, refundFromGroup: 855000, groupPenalty: 95000, finalRefund: 855000 }
      ]
    },

    // ========================================================================
    // TAB 3: ĐÃ XỬ LÝ (DA_XU_LY)
    // Gồm tất cả đơn hoàn tất: Thành công (duyệt hoàn tiền về) hoặc Từ chối
    // ========================================================================
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
      status: 'DA_XU_LY',
      subStatus: 'THANH_CONG', // Đã duyệt hoàn tiền thành công
      createdDate: '2026-11-18 10:15',
      processedDate: '2026-11-18 15:40',
      assignedTo: 'Lê Quốc Bảo (Kế toán)',
      isMyCreated: false,
      totalOriginalAmount: 1840000,
      chargeRate: 10,
      chargeAmount: 184000,
      groupRefundAmount: 1656000,
      totalRefundAmount: 1656000,
      reason: 'Đã thẩm tra hợp lệ: Vé chưa quét qua cổng kiểm soát, VinWonders đã xác nhận hủy mã QR.',
      documents: ['Xac-nhan-huy-qr-vinwonders.png', 'Bien-ban-duyet-hoan.pdf'],
      tickets: [
        { type: 'Vé Vào Cổng & Cáp Treo VinWonders', qrCode: 'QR-NT-3011', price: 920000, refundFromGroup: 828000, groupPenalty: 92000, finalRefund: 828000 },
        { type: 'Vé Vào Cổng & Cáp Treo VinWonders', qrCode: 'QR-NT-3012', price: 920000, refundFromGroup: 828000, groupPenalty: 92000, finalRefund: 828000 }
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
      status: 'DA_XU_LY',
      subStatus: 'THANH_CONG', // Đã duyệt hoàn tiền thành công
      createdDate: '2026-11-17 15:00',
      processedDate: '2026-11-17 17:20',
      assignedTo: 'Lê Quốc Bảo (Kế toán)',
      isMyCreated: false,
      totalOriginalAmount: 3120000,
      chargeRate: 10,
      chargeAmount: 312000,
      groupRefundAmount: 2808000,
      totalRefundAmount: 2808000,
      reason: 'Biển động sóng lớn, tàu cao tốc và cáp treo Hòn Thơm tạm dừng chuyên chở.',
      documents: ['Bien-ban-hoan-hon-thom.pdf'],
      tickets: [
        { type: 'Cáp Treo Hòn Thơm & Công Viên Nước', qrCode: 'QR-HT-5501', price: 780000, refundFromGroup: 702000, groupPenalty: 78000, finalRefund: 702000 },
        { type: 'Cáp Treo Hòn Thơm & Công Viên Nước', qrCode: 'QR-HT-5502', price: 780000, refundFromGroup: 702000, groupPenalty: 78000, finalRefund: 702000 },
        { type: 'Cáp Treo Hòn Thơm & Công Viên Nước', qrCode: 'QR-HT-5503', price: 780000, refundFromGroup: 702000, groupPenalty: 78000, finalRefund: 702000 },
        { type: 'Cáp Treo Hòn Thơm & Công Viên Nước', qrCode: 'QR-HT-5504', price: 780000, refundFromGroup: 702000, groupPenalty: 78000, finalRefund: 702000 }
      ]
    },
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
      subStatus: 'THANH_CONG', // Đã duyệt hoàn tiền thành công
      createdDate: '2026-11-16 09:00',
      processedDate: '2026-11-16 14:30',
      assignedTo: 'Trần Thị Mai (Booking CSKH)',
      isMyCreated: true, // Đơn do mình tạo được duyệt hoàn tất
      totalOriginalAmount: 1900000,
      chargeRate: 10,
      chargeAmount: 190000,
      groupRefundAmount: 1710000,
      totalRefundAmount: 1710000,
      reason: 'Khách sốt xuất huyết nhập viện, có hồ sơ bệnh án hợp lệ.',
      documents: ['Ho-so-benh-an-bv-cho-ray.pdf', 'Uy-nhiem-chi-hoan-tien.pdf'],
      tickets: [
        { type: 'Vé Cáp Treo & Buffet (Người lớn)', qrCode: 'QR-BN-7102', price: 950000, refundFromGroup: 855000, groupPenalty: 95000, finalRefund: 855000 },
        { type: 'Vé Cáp Treo & Buffet (Người lớn)', qrCode: 'QR-BN-7103', price: 950000, refundFromGroup: 855000, groupPenalty: 95000, finalRefund: 855000 }
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
      subStatus: 'TU_CHOI', // Đơn bị từ chối
      createdDate: '2026-11-15 11:30',
      processedDate: '2026-11-15 13:00',
      assignedTo: 'Nguyễn Văn An (Booking CSKH)',
      isMyCreated: false, // Đơn đại lý gửi bị mình từ chối
      totalOriginalAmount: 680000,
      chargeRate: 100,
      chargeAmount: 680000,
      groupRefundAmount: 0,
      totalRefundAmount: 0,
      reason: 'Khách quên mang vé muốn hoàn vé sau khi giờ dịch vụ đã kết thúc.',
      rejectReason: 'Vé quá hạn hoàn/hủy theo quy định của Tập đoàn',
      rejectDetails: 'Vé quá hạn sử dụng (quá 24h sau giờ mở cửa công viên), hệ thống VinWonders từ chối hỗ trợ theo quy chế bảo mật mã QR.',
      rejectDocuments: ['Thong-bao-tu-choi-vinwonders.pdf'],
      documents: ['Thong-bao-tu-choi-vinwonders.pdf'],
      tickets: [
        { type: 'Vé Vào Cổng Nam Hội An', qrCode: 'QR-HA-1092', price: 680000, refundFromGroup: 0, groupPenalty: 680000, finalRefund: 0 }
      ]
    },
    {
      requestCode: 'RQRF2611140011',
      refundOrderCode: 'RFD-2611-011',
      originalOrderCode: 'ORD-2611-018',
      serviceDate: '2026-11-14',
      ticketCount: 1,
      corp: 'Sun World',
      site: 'Sun World Ba Na Hills',
      agency: 'Công ty Cổ phần Du Lịch Việt Nam (Vietravel)',
      agencyCode: 'DL-8899',
      requesterName: 'Nguyễn Văn An',
      requesterEmail: 'an.nguyen@vietravel.com',
      requesterPhone: '0903123456',
      taxId: '0312456789',
      status: 'DA_XU_LY',
      subStatus: 'TU_CHOI', // Đơn do mình tạo bị cấp trên từ chối
      createdDate: '2026-11-14 08:45',
      processedDate: '2026-11-14 10:15',
      assignedTo: 'Hoàng Minh Thắng (Trưởng phòng Vé)',
      isMyCreated: true,
      totalOriginalAmount: 950000,
      chargeRate: 100,
      chargeAmount: 950000,
      groupRefundAmount: 0,
      totalRefundAmount: 0,
      reason: 'Khách hàng cấp cứu mổ ruột thừa khẩn cấp, xin hủy vé cáp treo Ba Na Hills.',
      rejectReason: 'Thiếu hồ sơ chứng từ đối soát hợp lệ (giấy hoãn/hủy chuyến, bệnh án...)',
      rejectDetails: 'Hồ sơ đính kèm chỉ có ảnh chụp đơn thuốc kê đơn, quy chế Tập đoàn yêu cầu phải có giấy ra viện hoặc giấy xác nhận phẫu thuật mộc đỏ bệnh viện.',
      rejectDocuments: ['Bien-ban-tu-choi-hoan-ve-cap-tren.pdf'],
      documents: ['Don-thuoc-chua-hop-le.jpg', 'Bien-ban-tu-choi-hoan-ve-cap-tren.pdf'],
      tickets: [
        { type: 'Vé Cáp Treo & Buffet (Người lớn)', qrCode: 'QR-BN-9081', price: 950000, refundFromGroup: 0, groupPenalty: 950000, finalRefund: 0 }
      ]
    },
    {
      requestCode: 'RQRF2611130012',
      refundOrderCode: 'RFD-2611-012',
      originalOrderCode: 'ORD-2611-020',
      serviceDate: '2026-11-13',
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
      subStatus: 'THU_HOI', // Đơn do Tôi tạo đã chủ động thu hồi
      createdDate: '2026-11-13 14:00',
      processedDate: '2026-11-13 16:30',
      assignedTo: 'Tôi (Người tạo yêu cầu)',
      isMyCreated: true,
      totalOriginalAmount: 1900000,
      chargeRate: 0,
      chargeAmount: 0,
      groupRefundAmount: 0,
      totalRefundAmount: 0,
      reason: 'Khách hàng báo lại đã thu xếp được công việc, tiếp tục đi tour theo lịch trình cũ nên xin rút lại yêu cầu hoàn hủy.',
      documents: ['Don-xin-rut-yeu-cau.pdf'],
      tickets: [
        { type: 'Vé Cáp treo Ba Na Hills khứ hồi', qrCode: 'QR-BN-9911', price: 950000, refundFromGroup: null, groupPenalty: null, finalRefund: null },
        { type: 'Vé Cáp treo Ba Na Hills khứ hồi', qrCode: 'QR-BN-9912', price: 950000, refundFromGroup: null, groupPenalty: null, finalRefund: null }
      ]
    }
  ];

  // 4. QUẢN LÝ TRẠNG THÁI HIỆN TẠI CỦA VIEW
  let activeTab = 'DOI_TIEP_NHAN'; // 3 Tab chuẩn: DOI_TIEP_NHAN, DANG_XU_LY, DA_XU_LY
  let filterProcessedSubStatus = 'ALL'; // Dropdown lọc tại Tab Đã xử lý: ALL, THANH_CONG, TU_CHOI, THU_HOI
  let filterAgency = 'ALL';
  let filterCorp = 'ALL';
  let filterSite = 'ALL';
  let filterSearch = '';
  let filterStartDate = '2026-11-01';
  let filterEndDate = '2026-11-19';
  let filterDatePreset = 'this_month';
  let refundCurrentPage = 1;
  let refundPageSize = 10;

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
    if (corpSelect) {
      let corpHtml = '<option value="ALL">Tất cả tập đoàn</option>';
      Object.keys(REFUND_CORP_SITES).forEach(corp => {
        corpHtml += `<option value="${corp}">${corp}</option>`;
      });
      corpSelect.innerHTML = corpHtml;
    }

    filterAgencyOptions('');
    filterSiteOptions('');
  }

  function updateSiteDropdown(selectedCorp) {
    filterSite = 'ALL';
    const txt = document.getElementById('selectedSiteText');
    if (txt) txt.textContent = 'Tất cả khu du lịch';
    filterSiteOptions('');
  }
    // 6.1 BỘ LỌC ĐẠI LÝ (SEARCHABLE DROPDOWN CÓ SEARCH BÊN TRONG & XÓA NHANH)
  function toggleAgencyFilterDropdown(forceOpen) {
    const menu = document.getElementById('menuAgencyFilterDropdown');
    const siteMenu = document.getElementById('menuSiteFilterDropdown');
    if (siteMenu) siteMenu.classList.add('hidden');
    if (!menu) return;
    if (forceOpen === true) {
      menu.classList.remove('hidden');
      const input = document.getElementById('searchAgencyFilterInput');
      if (input) setTimeout(() => input.focus(), 50);
    } else if (forceOpen === false) {
      menu.classList.add('hidden');
    } else {
      menu.classList.toggle('hidden');
      if (!menu.classList.contains('hidden')) {
        const input = document.getElementById('searchAgencyFilterInput');
        if (input) setTimeout(() => input.focus(), 50);
      }
    }
  }

  function filterAgencyOptions(query) {
    const list = document.getElementById('listAgencyFilterOptions');
    if (!list) return;

    const q = (query || '').toLowerCase().trim();
    const allAgencies = [
      { code: 'ALL', name: 'Tất cả đại lý', mst: '' },
      ...REFUND_AGENCIES
    ];

    const filtered = allAgencies.filter(a => {
      if (!q) return true;
      return a.code.toLowerCase().includes(q) || a.name.toLowerCase().includes(q) || (a.mst && a.mst.includes(q));
    });

    if (filtered.length === 0) {
      list.innerHTML = `<div class="p-3 text-center text-slate-400 text-xs">Không tìm thấy đại lý phù hợp</div>`;
      return;
    }

    list.innerHTML = filtered.map(a => {
      const isSelected = (filterAgency === a.name || (filterAgency === 'ALL' && a.code === 'ALL'));
      return `
        <button
          type="button"
          onclick="selectAgencyFilter('${a.code === 'ALL' ? 'ALL' : a.name}', '${a.name}')"
          class="w-full px-3 py-2 rounded-xl text-left transition-colors flex items-center justify-between cursor-pointer ${
            isSelected ? 'bg-rose-50 border border-rose-200 text-rose-800 font-bold' : 'hover:bg-slate-50 text-slate-700 font-medium'
          }"
        >
          <span class="truncate">${a.code !== 'ALL' ? `<span class="font-mono text-slate-400 text-[10px] mr-1.5">[${a.code}]</span>` : ''}${a.name}</span>
          ${isSelected ? '<i class="fa-solid fa-check text-rose-600 text-xs shrink-0 ml-1"></i>' : ''}
        </button>
      `;
    }).join('');
  }

  function selectAgencyFilter(agencyVal, agencyLabel) {
    filterAgency = (agencyVal === 'Tất cả đại lý' || agencyVal === 'ALL') ? 'ALL' : agencyVal;
    const txt = document.getElementById('selectedAgencyText');
    const clearBtn = document.getElementById('btnClearAgencyFilter');
    if (txt) txt.textContent = (filterAgency === 'ALL') ? 'Tất cả đại lý' : agencyLabel;
    if (clearBtn) {
      if (filterAgency !== 'ALL') clearBtn.classList.remove('hidden');
      else clearBtn.classList.add('hidden');
    }
    toggleAgencyFilterDropdown(false);
    refundCurrentPage = 1;
    renderRefundTable();
  }

  function clearAgencyFilter(e) {
    if (e) e.stopPropagation();
    const searchInput = document.getElementById('searchAgencyFilterInput');
    if (searchInput) searchInput.value = '';
    filterAgencyOptions('');
    selectAgencyFilter('ALL', 'Tất cả đại lý');
  }

  // 6.2 BỘ LỌC KHU DU LỊCH (SEARCHABLE DROPDOWN CÓ SEARCH BÊN TRONG & XÓA NHANH)
  function toggleSiteFilterDropdown(forceOpen) {
    const menu = document.getElementById('menuSiteFilterDropdown');
    const agMenu = document.getElementById('menuAgencyFilterDropdown');
    if (agMenu) agMenu.classList.add('hidden');
    if (!menu) return;
    if (forceOpen === true) {
      menu.classList.remove('hidden');
      const input = document.getElementById('searchSiteFilterInput');
      if (input) setTimeout(() => input.focus(), 50);
    } else if (forceOpen === false) {
      menu.classList.add('hidden');
    } else {
      menu.classList.toggle('hidden');
      if (!menu.classList.contains('hidden')) {
        const input = document.getElementById('searchSiteFilterInput');
        if (input) setTimeout(() => input.focus(), 50);
      }
    }
  }

  function filterSiteOptions(query) {
    const list = document.getElementById('listSiteFilterOptions');
    if (!list) return;

    const q = (query || '').toLowerCase().trim();
    let availableSites = [{ corp: '', name: 'Tất cả khu du lịch' }];

    if (filterCorp === 'ALL') {
      Object.entries(REFUND_CORP_SITES).forEach(([c, sites]) => {
        sites.forEach(s => availableSites.push({ corp: c, name: s }));
      });
    } else if (REFUND_CORP_SITES[filterCorp]) {
      REFUND_CORP_SITES[filterCorp].forEach(s => availableSites.push({ corp: filterCorp, name: s }));
    }

    const filtered = availableSites.filter(item => {
      if (!q) return true;
      return item.name.toLowerCase().includes(q) || (item.corp && item.corp.toLowerCase().includes(q));
    });

    if (filtered.length === 0) {
      list.innerHTML = `<div class="p-3 text-center text-slate-400 text-xs">Không tìm thấy khu du lịch phù hợp</div>`;
      return;
    }

    list.innerHTML = filtered.map(item => {
      const isSelected = (filterSite === item.name || (filterSite === 'ALL' && item.name === 'Tất cả khu du lịch'));
      return `
        <button
          type="button"
          onclick="selectSiteFilter('${item.name === 'Tất cả khu du lịch' ? 'ALL' : item.name}', '${item.name}')"
          class="w-full px-3 py-2 rounded-xl text-left transition-colors flex items-center justify-between cursor-pointer ${
            isSelected ? 'bg-rose-50 border border-rose-200 text-rose-800 font-bold' : 'hover:bg-slate-50 text-slate-700 font-medium'
          }"
        >
          <span class="truncate">${item.corp ? `<span class="text-[10px] text-slate-400 mr-1.5">[${item.corp}]</span>` : ''}${item.name}</span>
          ${isSelected ? '<i class="fa-solid fa-check text-rose-600 text-xs shrink-0 ml-1"></i>' : ''}
        </button>
      `;
    }).join('');
  }

  function selectSiteFilter(siteVal, siteLabel) {
    filterSite = (siteVal === 'Tất cả khu du lịch' || siteVal === 'ALL') ? 'ALL' : siteVal;
    const txt = document.getElementById('selectedSiteText');
    const clearBtn = document.getElementById('btnClearSiteFilter');
    if (txt) txt.textContent = (filterSite === 'ALL') ? 'Tất cả khu du lịch' : siteLabel;
    if (clearBtn) {
      if (filterSite !== 'ALL') clearBtn.classList.remove('hidden');
      else clearBtn.classList.add('hidden');
    }
    toggleSiteFilterDropdown(false);
    refundCurrentPage = 1;
    renderRefundTable();
  }

  function clearSiteFilter(e) {
    if (e) e.stopPropagation();
    const searchInput = document.getElementById('searchSiteFilterInput');
    if (searchInput) searchInput.value = '';
    filterSiteOptions('');
    selectSiteFilter('ALL', 'Tất cả khu du lịch');
  }

  // 6.3 BỘ LỌC TRẠNG THÁI CON TẠI TAB ĐÃ XỬ LÝ (THÀNH CÔNG / TỪ CHỐI)
  function onProcessedStatusFilterChange(val) {
    filterProcessedSubStatus = val || 'ALL';
    refundCurrentPage = 1;
    renderRefundTable();
  }

  function changeRefundPageSize(newSize) {
    refundPageSize = parseInt(newSize, 10) || 10;
    refundCurrentPage = 1;
    renderRefundTable();
  }

  function goToRefundPage(page) {
    refundCurrentPage = page;
    renderRefundTable();
  }


  // 7. LỌC DỮ LIỆU DANH SÁCH (FILTER ENGINE THEO 3 TAB CHUẨN)
  function getFilteredDataset() {
    return refundDataset.filter(item => {
      // 1. Lọc theo 3 Tab trạng thái
      if (activeTab === 'DOI_TIEP_NHAN') {
        if (item.status !== 'DOI_TIEP_NHAN' && item.status !== 'CHO_XU_LY') return false;
      } else if (activeTab === 'DANG_XU_LY') {
        if (item.status !== 'DANG_XU_LY') return false;
      } else if (activeTab === 'DA_XU_LY') {
        if (item.status !== 'DA_XU_LY' && item.status !== 'DANG_HOAN_TIEN') return false;
        // Lọc trạng thái con (Thành công / Từ chối / Thu hồi) khi ở Tab Đã xử lý
        if (filterProcessedSubStatus === 'TU_CHOI') {
          if (item.subStatus !== 'TU_CHOI') return false;
        } else if (filterProcessedSubStatus === 'THU_HOI') {
          if (item.subStatus !== 'THU_HOI') return false;
        } else if (filterProcessedSubStatus === 'THANH_CONG') {
          if (item.subStatus !== 'THANH_CONG' && item.subStatus !== 'HOAN_TAT') return false;
        }
      } else {
        if (item.status !== activeTab) return false;
      }

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

  // Cập nhật số lượng Badge trên Tab (nếu có element)
  function updateTabBadges() {
    // Đã tinh gọn nhãn theo yêu cầu: không badge số đếm
  }

  // 8. RENDER BẢNG DANH SÁCH (CÓ PHÂN TRANG & CỘT TRẠNG THÁI RIÊNG TẠI TAB ĐÃ XỬ LÝ)
  function renderRefundTable() {
    const tbody = document.getElementById('refundTableBody');
    const emptyNotice = document.getElementById('refundEmptyNotice');
    const paginContainer = document.getElementById('refundPaginationContainer');
    const paginInfo = document.getElementById('refundPaginationInfo');
    const paginButtons = document.getElementById('refundPaginationButtons');
    const thStatus = document.getElementById('thStatusColumn');
    if (!tbody) return;

    // Cột Trạng thái đặt ngay sau Mã yêu cầu, chỉ hiển thị tại Tab Đã xử lý
    if (thStatus) {
      if (activeTab === 'DA_XU_LY') {
        thStatus.classList.remove('hidden');
      } else {
        thStatus.classList.add('hidden');
      }
    }

    const data = getFilteredDataset();
    const totalRecords = data.length;
    const totalPages = Math.max(1, Math.ceil(totalRecords / refundPageSize));

    if (refundCurrentPage > totalPages) refundCurrentPage = totalPages;
    if (refundCurrentPage < 1) refundCurrentPage = 1;

    if (totalRecords === 0) {
      tbody.innerHTML = '';
      if (emptyNotice) emptyNotice.classList.remove('hidden');
      if (paginContainer) paginContainer.classList.add('hidden');
      return;
    }

    if (emptyNotice) emptyNotice.classList.add('hidden');
    if (paginContainer) paginContainer.classList.remove('hidden');

    const startIdx = (refundCurrentPage - 1) * refundPageSize;
    const endIdx = Math.min(startIdx + refundPageSize, totalRecords);
    const pageData = data.slice(startIdx, endIdx);

    tbody.innerHTML = pageData.map(item => {
      // Định dạng ngày sử dụng T (DD/MM/YYYY)
      const serviceDateFormatted = item.serviceDate ? item.serviceDate.split('-').reverse().join('/') : '-';

      // Badge nhãn tập đoàn
      let corpBadgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
      if (item.corp === 'Sun World') corpBadgeClass = 'bg-amber-50 text-amber-800 border-amber-200';
      else if (item.corp === 'VinWonders') corpBadgeClass = 'bg-rose-50 text-rose-800 border-rose-200';
      else if (item.corp === 'Nova Dreams') corpBadgeClass = 'bg-blue-50 text-blue-800 border-blue-200';

      // Phân biệt vai trò người tạo
      const creatorBadge = item.isMyCreated ? `
        <span class="px-1.5 py-0.5 rounded text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200 shrink-0" title="Đơn do bạn tạo gửi lên cấp trên">Tôi tạo</span>
      ` : `
        <span class="px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-200 shrink-0" title="Đơn do Đại lý/Người gửi gửi lên">Đại lý</span>
      `;

      // Cột Trạng thái tại Tab Đã xử lý (Thành công / Từ chối / Thu hồi)
      const isRejected = (item.subStatus === 'TU_CHOI');
      const isRevoked = (item.subStatus === 'THU_HOI');
      let statusBadgeHtml = '';
      if (isRejected) {
        statusBadgeHtml = `
          <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
            <i class="fa-solid fa-circle-xmark text-[10px]"></i>
            <span>Từ chối</span>
          </span>
        `;
      } else if (isRevoked) {
        statusBadgeHtml = `
          <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
            <i class="fa-solid fa-rotate-left text-[10px]"></i>
            <span>Thu hồi</span>
          </span>
        `;
      } else {
        statusBadgeHtml = `
          <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
            <i class="fa-solid fa-circle-check text-[10px]"></i>
            <span>Thành công</span>
          </span>
        `;
      }

      const statusColHtml = (activeTab === 'DA_XU_LY') ? `
        <td class="px-3.5 py-3 whitespace-nowrap">
          ${statusBadgeHtml}
        </td>
      ` : '';

      return `
        <tr class="hover:bg-slate-50/90 transition-colors group">
          <!-- 1. Mã yêu cầu (RQRF...) -->
          <td class="px-3.5 py-3 whitespace-nowrap">
            <span class="font-mono text-xs font-black text-blue-700 tracking-tight block">${item.requestCode}</span>
            <span class="text-[10.5px] text-slate-400 font-medium">${item.createdDate}</span>
          </td>

          <!-- 2. Cột Trạng thái (Bổ sung riêng tại Tab Đã xử lý) -->
          ${statusColHtml}

          <!-- 3. Mã đơn hoàn -->
          <td class="px-3.5 py-3 whitespace-nowrap">
            <span class="font-mono text-xs font-bold text-slate-800 block">${item.refundOrderCode}</span>
          </td>

          <!-- 4. Mã đơn gốc -->
          <td class="px-3.5 py-3 whitespace-nowrap">
            <a href="orders.html?search=${encodeURIComponent(item.originalOrderCode)}" class="font-mono text-xs font-bold text-slate-700 hover:text-brand-600 inline-flex items-center gap-1 transition-colors">
              <span>${item.originalOrderCode}</span>
              <i class="fa-solid fa-arrow-up-right-from-square text-[9px] text-slate-400"></i>
            </a>
          </td>

          <!-- 5. Ngày sử dụng (T) -->
          <td class="px-3.5 py-3 whitespace-nowrap">
            <span class="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">${serviceDateFormatted}</span>
          </td>

          <!-- 6. Số vé hoàn -->
          <td class="px-3.5 py-3 whitespace-nowrap text-center">
            <span class="font-mono text-xs font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
              ${item.ticketCount} vé
            </span>
          </td>

          <!-- 7. Tập đoàn -->
          <td class="px-3.5 py-3 whitespace-nowrap">
            <span class="px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${corpBadgeClass}">
              ${item.corp}
            </span>
          </td>

          <!-- 8. Khu du lịch -->
          <td class="px-3.5 py-3 whitespace-nowrap">
            <span class="text-xs font-semibold text-slate-800">${item.site}</span>
          </td>

          <!-- 9. Đại lý -->
          <td class="px-3.5 py-3 whitespace-nowrap">
            <div class="max-w-[200px] truncate" title="${item.agency}">
              <span class="font-bold text-xs text-slate-800 block truncate">${item.agency}</span>
              <span class="font-mono text-[10.5px] text-slate-400">${item.agencyCode || 'DL-B2B'}</span>
            </div>
          </td>

          <!-- 10. Người gửi yêu cầu (Kèm badge vai trò nhận biết) -->
          <td class="px-3.5 py-3 whitespace-nowrap">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="text-xs font-semibold text-slate-800">${item.requesterName}</span>
              ${creatorBadge}
            </div>
            <span class="text-[10.5px] text-slate-400 font-mono">${item.requesterPhone || ''}</span>
          </td>

          <!-- 11. Email -->
          <td class="px-3.5 py-3 whitespace-nowrap">
            <span class="font-mono text-xs text-slate-600">${item.requesterEmail}</span>
          </td>

          <!-- 12. Mã số thuế -->
          <td class="px-3.5 py-3 whitespace-nowrap">
            <span class="font-mono text-xs text-slate-700 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/70">
              ${item.taxId || '-'}
            </span>
          </td>

          <!-- 13. Thao tác: NÚT ICON CON MẮT VIỀN XANH ĐƠN GIẢN -->
          <td class="px-3.5 py-3 whitespace-nowrap text-right sticky right-0 bg-white group-hover:bg-slate-50/90 shadow-[-4px_0_12px_rgba(0,0,0,0.03)]">
            <button
              type="button"
              onclick="openRefundDetail('${item.requestCode}')"
              class="w-8 h-8 rounded-xl border border-blue-500/40 bg-blue-50/40 hover:bg-blue-600 text-blue-600 hover:text-white inline-flex items-center justify-center transition-all cursor-pointer shadow-2xs group/btn"
              title="Xem chi tiết"
            >
              <i class="fa-regular fa-eye text-xs"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');

        // Cập nhật thông tin phân trang chuẩn theo yêu cầu: Hiển thị 1–10 / 45 yêu cầu
    if (paginInfo) {
      paginInfo.innerHTML = `Hiển thị <strong>${startIdx + 1}–${endIdx}</strong> / <strong>${totalRecords}</strong> yêu cầu`;
    }

    // Cập nhật các nút phân trang (Trước, số trang 1, 2, 3..., Sau)
    if (paginButtons) {
      let btnsHtml = '';
      
      // Nút Trước
      btnsHtml += `
        <button
          type="button"
          onclick="goToRefundPage(${refundCurrentPage - 1})"
          ${refundCurrentPage <= 1 ? 'disabled' : ''}
          class="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs"
          title="Trang trước"
        >
          <i class="fa-solid fa-chevron-left text-[10px]"></i>
          <span>Trước</span>
        </button>
      `;

      for (let p = 1; p <= totalPages; p++) {
        if (p === 1 || p === totalPages || (p >= refundCurrentPage - 1 && p <= refundCurrentPage + 1)) {
          const isActive = (p === refundCurrentPage);
          btnsHtml += `
            <button
              type="button"
              onclick="goToRefundPage(${p})"
              class="min-w-[32px] h-8 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive ? 'bg-rose-600 text-white shadow-2xs' : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }"
            >
              ${p}
            </button>
          `;
        } else if (p === refundCurrentPage - 2 || p === refundCurrentPage + 2) {
          btnsHtml += `<span class="w-6 text-center text-slate-400 text-xs">...</span>`;
        }
      }

      // Nút Sau
      btnsHtml += `
        <button
          type="button"
          onclick="goToRefundPage(${refundCurrentPage + 1})"
          ${refundCurrentPage >= totalPages ? 'disabled' : ''}
          class="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs"
          title="Trang sau"
        >
          <span>Sau</span>
          <i class="fa-solid fa-chevron-right text-[10px]"></i>
        </button>
      `;

      paginButtons.innerHTML = btnsHtml;
    }
  }

  // 9. CHUYỂN TAB TRẠNG THÁI (CHUẨN HÓA 3 TAB)
  function switchRefundTab(tabKey) {
    if (tabKey === 'CHO_XU_LY') tabKey = 'DOI_TIEP_NHAN';
    activeTab = tabKey;
    refundCurrentPage = 1;

    const tabs = ['DOI_TIEP_NHAN', 'DANG_XU_LY', 'DA_XU_LY'];
    tabs.forEach(key => {
      const btn = document.getElementById(`tabBtn_${key}`);
      if (btn) {
        if (key === tabKey) {
          btn.className = 'inline-flex items-center px-4 py-2 rounded-xl text-xs font-black transition-all bg-white text-rose-600 shadow-2xs cursor-pointer border border-rose-200/60';
        } else {
          btn.className = 'inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold transition-all text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 cursor-pointer border border-transparent';
        }
      }
    });

    // Hiển thị dropdown bộ lọc kết quả khi đứng tại Tab Đã xử lý
    const statusFilterWrapper = document.getElementById('refundProcessedStatusFilterWrapper');
    if (statusFilterWrapper) {
      if (tabKey === 'DA_XU_LY') {
        statusFilterWrapper.classList.remove('hidden');
        statusFilterWrapper.classList.add('flex');
      } else {
        statusFilterWrapper.classList.add('hidden');
        statusFilterWrapper.classList.remove('flex');
      }
    }

    renderRefundTable();
  }

    // 10. MÀN HÌNH CHI TIẾT ĐƠN HOÀN HỦY (NEXTPAGE WORKSPACE)
  function openRefundDetail(requestCode) {
    viewingRequestCode = requestCode;
    const item = refundDataset.find(r => r.requestCode === requestCode);
    if (!item) return;

    const listView = document.getElementById('viewRefundRequestsList');
    const detailView = document.getElementById('viewRefundRequestDetail');
    const createView = document.getElementById('viewCreateRefundRequest');
    if (!listView || !detailView) return;

    if (createView) createView.classList.add('hidden');
    listView.classList.add('hidden');
    detailView.classList.remove('hidden');

    // Lưu trạng thái lịch sử điều hướng để nút Back luôn trả về đúng danh sách hoàn hủy
    if (window.history && window.history.pushState) {
      window.history.pushState({ screen: 'refund-detail', requestCode }, '', '#detail-' + requestCode);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Render thông tin chi tiết
    renderDetailContent(item);
    renderDetailTicketsTable(item);
    renderDetailActionButtons(item);
  }

  function closeRefundDetail() {
    const listView = document.getElementById('viewRefundRequestsList');
    const detailView = document.getElementById('viewRefundRequestDetail');
    if (detailView) detailView.classList.add('hidden');
    if (listView) listView.classList.remove('hidden');

    viewingRequestCode = null;

    if (window.history && window.history.pushState) {
      window.history.pushState({ screen: 'refund-list' }, '', window.location.pathname);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

    // 10.1 RENDER CHI TIẾT ĐƠN HOÀN HỦY THEO BỐ CỤC MỚI
  function renderDetailContent(item) {
    // 1. Header phiếu
    const dtReqCode = document.getElementById('dtRequestCode');
    const dtStatusBadge = document.getElementById('dtStatusBadge');
    const dtRefundCode = document.getElementById('dtRefundOrderCode');
    const dtOrigCode = document.getElementById('dtOriginalOrderCode');
    const dtCreatedDate = document.getElementById('dtCreatedDate');

    if (dtReqCode) dtReqCode.textContent = item.requestCode;
    if (dtRefundCode) dtRefundCode.textContent = item.refundOrderCode;
    if (dtOrigCode) dtOrigCode.textContent = item.originalOrderCode;
    if (dtCreatedDate) dtCreatedDate.textContent = item.createdDate || '--';

    if (dtStatusBadge) {
      if (item.status === 'DOI_TIEP_NHAN' || item.status === 'CHO_XU_LY') {
        dtStatusBadge.className = 'px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200';
        dtStatusBadge.textContent = 'Đợi tiếp nhận';
      } else if (item.status === 'DANG_XU_LY') {
        dtStatusBadge.className = 'px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200';
        dtStatusBadge.textContent = 'Đang xử lý';
      } else if (item.status === 'DA_XU_LY') {
        if (item.subStatus === 'TU_CHOI') {
          dtStatusBadge.className = 'px-3 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200';
          dtStatusBadge.textContent = 'Từ chối';
        } else if (item.subStatus === 'THU_HOI') {
          dtStatusBadge.className = 'px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-700 border border-amber-200';
          dtStatusBadge.textContent = 'Thu hồi';
        } else {
          dtStatusBadge.className = 'px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200';
          dtStatusBadge.textContent = 'Thành công';
        }
      } else {
        dtStatusBadge.className = 'px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200';
        dtStatusBadge.textContent = 'Thành công';
      }
    }

    // 1.1 KHỐI THÔNG BÁO ĐÃ THU HỒI YÊU CẦU (CHỈ HIỂN THỊ KHI Ở TAB ĐÃ XỬ LÝ VÀ TRẠNG THÁI THU HỒI)
    const revokeBlock = document.getElementById('dtRevokeNoticeBlock');
    if (revokeBlock) {
      if (item.status === 'DA_XU_LY' && item.subStatus === 'THU_HOI') {
        revokeBlock.classList.remove('hidden');
        const auditInfo = document.getElementById('dtRevokeAuditInfo');
        if (auditInfo) {
          auditInfo.innerHTML = `Thu hồi bởi: <strong>${item.assignedTo || 'Tôi (Người tạo)'}</strong> • Lúc: <span class="font-mono">${item.processedDate || item.createdDate || '--'}</span>`;
        }
      } else {
        revokeBlock.classList.add('hidden');
      }
    }

    // 1.2 KHỐI LÝ DO TỪ CHỐI (CHỈ HIỂN THỊ KHI Ở TAB ĐÃ XỬ LÝ VÀ TRẠNG THÁI TỪ CHỐI)
    const rejectBlock = document.getElementById('dtRejectNoticeBlock');
    if (rejectBlock) {
      if (item.status === 'DA_XU_LY' && item.subStatus === 'TU_CHOI') {
        rejectBlock.classList.remove('hidden');

        const auditInfo = document.getElementById('dtRejectAuditInfo');
        if (auditInfo) {
          auditInfo.innerHTML = `Từ chối bởi: <strong>${item.assignedTo || 'Chuyên viên CSKH / Thẩm định'}</strong> • Lúc: <span class="font-mono">${item.processedDate || '--'}</span>`;
        }

        const reasonContent = document.getElementById('dtRejectReasonContent');
        if (reasonContent) {
          const mainReason = item.rejectReason || 'Vé không đủ điều kiện hoàn hủy theo quy chế của Tập đoàn cung cấp dịch vụ.';
          const detailHtml = item.rejectDetails ? `<div class="mt-2 pt-2 border-t border-rose-100 text-slate-700 font-normal leading-relaxed text-xs"><strong class="font-bold text-rose-700">Chi tiết giải trình:</strong> ${item.rejectDetails}</div>` : '';
          reasonContent.innerHTML = `
            <div class="font-bold text-rose-900 text-xs flex items-center gap-1.5">
              <i class="fa-solid fa-triangle-exclamation text-rose-600"></i>
              <span>${mainReason}</span>
            </div>
            ${detailHtml}
          `;
        }

        const filesWrapper = document.getElementById('dtRejectFilesWrapper');
        const filesList = document.getElementById('dtRejectFilesList');
        const rejectDocs = item.rejectDocuments || [];
        if (filesWrapper && filesList) {
          if (rejectDocs.length > 0) {
            filesWrapper.classList.remove('hidden');
            filesList.innerHTML = rejectDocs.map(docName => `
              <div class="flex items-center justify-between p-2.5 rounded-xl bg-white border border-rose-200 text-xs hover:bg-rose-50/50 transition-colors shadow-2xs">
                <div class="flex items-center gap-2 min-w-0 pr-2">
                  <div class="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <i class="fa-solid fa-file-pdf text-[11px]"></i>
                  </div>
                  <span class="font-bold text-slate-800 truncate text-[11px]">${docName}</span>
                </div>
                <div class="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onclick="previewDetailDocument('${docName}')"
                    class="px-2 py-0.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[10.5px] font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                  >
                    <i class="fa-regular fa-eye text-[9px]"></i>
                    <span>Xem</span>
                  </button>
                  <button
                    type="button"
                    onclick="downloadDetailDocument('${docName}')"
                    class="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-[10.5px] font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                  >
                    <i class="fa-solid fa-download text-[9px]"></i>
                    <span>Tải về</span>
                  </button>
                </div>
              </div>
            `).join('');
          } else {
            filesWrapper.classList.add('hidden');
          }
        }
      } else {
        rejectBlock.classList.add('hidden');
      }
    }

    // 2. KHỐI THÔNG TIN YÊU CẦU (LƯỚI RÚT GỌN 3 CỘT)
    const dtInfoReq = document.getElementById('dtInfoRequestCode');
    const dtInfoCreated = document.getElementById('dtInfoCreatedDate');
    const dtInfoAgency = document.getElementById('dtInfoAgencyName');
    const dtInfoAgencyCode = document.getElementById('dtInfoAgencyCode');
    const dtInfoEmail = document.getElementById('dtInfoRequesterEmail');
    const dtInfoSite = document.getElementById('dtInfoSiteName');
    const dtInfoOrigLink = document.getElementById('dtInfoOriginalOrderLink');
    const dtInfoOrigCode = document.getElementById('dtInfoOriginalOrderCode');
    const dtInfoTicketCount = document.getElementById('dtInfoTicketCount');
    const dtInfoRequester = document.getElementById('dtInfoRequesterName');
    const dtInfoPhone = document.getElementById('dtInfoRequesterPhone');
    const dtInfoCorp = document.getElementById('dtInfoCorpName');
    const dtInfoUpdated = document.getElementById('dtInfoUpdatedDate');
    const dtInfoServiceDate = document.getElementById('dtInfoServiceDate');
    const dtInfoTaxId = document.getElementById('dtInfoTaxId');

    if (dtInfoReq) dtInfoReq.textContent = item.requestCode;
    if (dtInfoCreated) dtInfoCreated.textContent = item.createdDate || '--';
    if (dtInfoAgency) {
      dtInfoAgency.textContent = item.agency || '--';
      dtInfoAgency.title = item.agency || '';
    }
    if (dtInfoAgencyCode) dtInfoAgencyCode.textContent = item.agencyCode ? `[${item.agencyCode}]` : '';
    if (dtInfoEmail) dtInfoEmail.textContent = item.requesterEmail || '--';
    if (dtInfoSite) dtInfoSite.textContent = item.site || '--';
    if (dtInfoOrigCode) dtInfoOrigCode.textContent = item.originalOrderCode || '--';
    if (dtInfoOrigLink) dtInfoOrigLink.href = `orders.html?search=${encodeURIComponent(item.originalOrderCode)}`;
    if (dtInfoTicketCount) dtInfoTicketCount.textContent = `${item.ticketCount || (item.tickets ? item.tickets.length : 0)} vé`;
    if (dtInfoRequester) dtInfoRequester.textContent = item.requesterName || '--';
    if (dtInfoPhone) dtInfoPhone.textContent = item.requesterPhone || '';
    if (dtInfoCorp) dtInfoCorp.textContent = item.corp || '--';
    if (dtInfoUpdated) dtInfoUpdated.textContent = item.createdDate || '--';
    if (dtInfoServiceDate) {
      const sDate = item.serviceDate ? item.serviceDate.split('-').reverse().join('/') : '--';
      dtInfoServiceDate.textContent = sDate;
    }
    if (dtInfoTaxId) dtInfoTaxId.textContent = item.taxId || '--';

    // 3. KHỐI LÝ DO HOÀN/HỦY & HỒ SƠ ĐÍNH KÈM
    const dtReason = document.getElementById('dtReasonText');
    if (dtReason) dtReason.textContent = item.reason || 'Khách yêu cầu hoàn vé theo thỏa thuận dịch vụ.';

    const dtDocsList = document.getElementById('dtDocumentsList');
    const dtDocsCount = document.getElementById('dtDocumentsCount');
    const docs = item.documents && item.documents.length > 0 ? item.documents : [
      'Giay-xac-nhan-delay-chuyen-bay.pdf',
      `Bien-ban-hoan-huy-${item.requestCode}.pdf`
    ];
    if (dtDocsCount) dtDocsCount.textContent = `${docs.length} tệp`;

    if (dtDocsList) {
      dtDocsList.innerHTML = docs.map((docName, idx) => {
        const ext = docName.split('.').pop().toLowerCase();
        let icon = 'fa-file-lines';
        if (['jpg', 'jpeg', 'png'].includes(ext)) icon = 'fa-file-image';
        if (ext === 'pdf') icon = 'fa-file-pdf';

        return `
          <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs hover:bg-slate-100/70 transition-colors">
            <div class="flex items-center gap-2 min-w-0 pr-2">
              <div class="w-6 h-6 rounded-lg bg-white border border-slate-200 text-rose-600 flex items-center justify-center shrink-0">
                <i class="fa-solid ${icon} text-[11px]"></i>
              </div>
              <span class="font-bold text-slate-800 truncate text-[11px]" title="${docName}">${docName}</span>
            </div>
            <div class="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onclick="previewDetailDocument('${docName}')"
                class="px-2 py-0.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[10.5px] font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
              >
                <i class="fa-regular fa-eye text-[9px]"></i>
                <span>Xem</span>
              </button>
              <button
                type="button"
                onclick="downloadDetailDocument('${docName}')"
                class="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-[10.5px] font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
              >
                <i class="fa-solid fa-download text-[9px]"></i>
                <span>Tải về</span>
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    // 4. DẢI 4 CARD CHỈ SỐ TÀI CHÍNH (KÈM CHÚ THÍCH PHỤ)
    const ticketCount = item.ticketCount || (item.tickets ? item.tickets.length : 1);
    let totalOrig = item.totalOriginalAmount || 0;
    if (!totalOrig && item.tickets) {
      totalOrig = item.tickets.reduce((sum, t) => sum + (t.price || 0), 0);
    }
    const totalCost = item.totalCostAmount || Math.round(totalOrig * 0.85);
    // 4. Đồng bộ 4 Card chỉ số tài chính & Dòng tổng kết cuối bảng
    syncDetailTotalsAndCards(item);

    // 5. Khối thông báo Từ chối (nếu có)
    const rejectBox = document.getElementById('dtRejectBox');
    const rejectReason = document.getElementById('dtRejectReasonText');
    if (rejectBox) {
      if (item.subStatus === 'DA_TU_CHOI' && item.rejectReason) {
        rejectBox.classList.remove('hidden');
        if (rejectReason) rejectReason.textContent = item.rejectReason;
      } else {
        rejectBox.classList.add('hidden');
      }
    }
  }

  // 10.2 HÀM TÍNH TOÁN & ĐỒNG BỘ 4 CARD TÀI CHÍNH VÀ FOOTER BẢNG
  function syncDetailTotalsAndCards(item) {
    if (!item || !item.tickets) return;

    let sumOrig = 0;
    let sumPenalty = 0;
    let sumGroupRefund = 0;
    let sumFinalRefund = 0;
    let hasGroupVal = false;
    let hasFinalVal = false;

    item.tickets.forEach(t => {
      const orig = t.price || 0;
      sumOrig += orig;

      if (t.refundFromGroup !== null && t.refundFromGroup !== undefined && t.refundFromGroup !== '') {
        const grp = Math.max(0, parseFloat(t.refundFromGroup) || 0);
        t.refundFromGroup = grp;
        t.groupPenalty = Math.max(0, orig - grp);
        sumGroupRefund += grp;
        sumPenalty += t.groupPenalty;
        hasGroupVal = true;
      } else {
        t.refundFromGroup = null;
        t.groupPenalty = null;
      }

      if (t.finalRefund !== null && t.finalRefund !== undefined && t.finalRefund !== '') {
        const fin = Math.max(0, parseFloat(t.finalRefund) || 0);
        t.finalRefund = fin;
        sumFinalRefund += fin;
        hasFinalVal = true;
      } else {
        t.finalRefund = null;
      }
    });

    const profitAfterRefund = (hasGroupVal && hasFinalVal) ? (sumGroupRefund - sumFinalRefund) : null;

    // Cập nhật footer bảng
    const dtTotalOrig = document.getElementById('dtTotalOriginal');
    const dtTotalPenalty = document.getElementById('dtTotalGroupPenalty');
    const dtTotalGroupRefund = document.getElementById('dtTotalGroupRefund');
    const dtTotalFinalRefund = document.getElementById('dtTotalFinalRefund');
    const dtProfitEl = document.getElementById('dtTotalProfitAfterRefund');

    if (dtTotalOrig) dtTotalOrig.textContent = sumOrig.toLocaleString('vi-VN') + ' đ';
    if (dtTotalPenalty) dtTotalPenalty.textContent = hasGroupVal ? (sumPenalty.toLocaleString('vi-VN') + ' đ') : '--';
    if (dtTotalGroupRefund) dtTotalGroupRefund.textContent = hasGroupVal ? (sumGroupRefund.toLocaleString('vi-VN') + ' đ') : '--';
    if (dtTotalFinalRefund) dtTotalFinalRefund.textContent = hasFinalVal ? (sumFinalRefund.toLocaleString('vi-VN') + ' đ') : '--';

    if (dtProfitEl) {
      if (profitAfterRefund !== null) {
        const prefix = profitAfterRefund > 0 ? '+' : '';
        dtProfitEl.textContent = `${prefix}${profitAfterRefund.toLocaleString('vi-VN')} đ`;
        if (profitAfterRefund >= 0) {
          dtProfitEl.className = 'font-mono font-black text-emerald-700 text-sm';
        } else {
          dtProfitEl.className = 'font-mono font-black text-rose-600 text-sm';
        }
      } else {
        dtProfitEl.textContent = '--';
        dtProfitEl.className = 'font-mono font-bold text-slate-400 text-sm';
      }
    }

    // Cập nhật 4 Card chỉ số tài chính
    const c1Val = document.getElementById('cardTotalOriginalPaid');
    const c1Sub = document.getElementById('cardTotalOriginalSub');
    const c2Val = document.getElementById('cardTotalGroupPenalty') || document.getElementById('cardTotalCost');
    const c2Sub = document.getElementById('cardTotalGroupPenaltySub') || document.getElementById('cardTotalCostSub');
    const c3Val = document.getElementById('cardRefundFromSupplier');
    const c3Sub = document.getElementById('cardRefundFromSupplierSub');
    const c4Val = document.getElementById('cardFinalRefundAmount');
    const c4Sub = document.getElementById('cardFinalRefundSub');

    if (c1Val) c1Val.textContent = sumOrig.toLocaleString('vi-VN') + ' đ';
    if (c1Sub) c1Sub.textContent = `Tổng tiền khách thanh toán trong đơn gốc (${item.tickets.length} vé)`;

    if (c2Val) c2Val.textContent = hasGroupVal ? (sumPenalty.toLocaleString('vi-VN') + ' đ') : '--';
    if (c2Sub) c2Sub.textContent = `Giá KH thanh toán — Giá hoàn từ tập đoàn`;

    if (c3Val) c3Val.textContent = hasGroupVal ? (sumGroupRefund.toLocaleString('vi-VN') + ' đ') : '--';
    if (c3Sub) c3Sub.textContent = `Số tiền Tập đoàn duyệt hoàn lại`;

    if (c4Val) c4Val.textContent = hasFinalVal ? (sumFinalRefund.toLocaleString('vi-VN') + ' đ') : '--';
    if (c4Sub) c4Sub.textContent = `Số tiền hoàn chi trả thực tế cho Đại lý`;

    // Lưu lại vào item data
    item.totalOriginalAmount = sumOrig;
    item.chargeAmount = hasGroupVal ? sumPenalty : null;
    item.groupRefundAmount = hasGroupVal ? sumGroupRefund : null;
    item.totalRefundAmount = hasFinalVal ? sumFinalRefund : null;
    item.profitAfterRefund = profitAfterRefund;
  }

  // 10.3 RENDER BẢNG 6 CỘT SERIAL VÉ TRANG CHI TIẾT
  function renderDetailTicketsTable(item) {
    const tbody = document.getElementById('dtTicketsTableBody');
    if (!tbody) return;

    const tickets = item.tickets || [];
    // Phân quyền: Cho phép chỉnh sửa khi là đơn từ đối tác gửi lên và chưa đóng hồ sơ
    const isEditable = (!item.isMyCreated && (item.status === 'DOI_TIEP_NHAN' || item.status === 'CHO_XU_LY' || item.status === 'DANG_XU_LY'));

    // Hiển thị / ẩn nút Charge hàng loạt trên header bảng vé
    const batchTopBtn = document.getElementById('dtBatchChargeTopBtnWrapper');
    if (batchTopBtn) {
      if (isEditable) {
        batchTopBtn.classList.remove('hidden');
      } else {
        batchTopBtn.classList.add('hidden');
      }
    }

    // Reset checkbox chọn tất cả
    const selectAllCb = document.getElementById('dtSelectAllTickets');
    if (selectAllCb) {
      selectAllCb.checked = false;
      selectAllCb.indeterminate = false;
      selectAllCb.disabled = !isEditable;
    }

    // Đồng bộ số liệu
    syncDetailTotalsAndCards(item);

    tbody.innerHTML = tickets.map((t, idx) => {
      const origPrice = t.price || 0;
      const penaltyText = (t.groupPenalty !== null && t.groupPenalty !== undefined) ? (t.groupPenalty.toLocaleString('vi-VN') + ' đ') : '--';
      const grpVal = (t.refundFromGroup !== null && t.refundFromGroup !== undefined) ? t.refundFromGroup : '';
      const finVal = (t.finalRefund !== null && t.finalRefund !== undefined) ? t.finalRefund : '';

      return `
        <tr class="hover:bg-slate-50/80 transition-colors divide-x divide-slate-100">
          <td class="p-3 text-center font-bold text-slate-500">
            <div class="flex items-center justify-center gap-1.5">
              <input
                type="checkbox"
                class="dt-ticket-select-cb rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer w-3.5 h-3.5"
                data-idx="${idx}"
                onchange="onDetailTicketCheckboxChange()"
                ${!isEditable ? 'disabled' : ''}
              />
              <span>${idx + 1}</span>
            </div>
          </td>
          <td class="p-3">
            <div class="font-bold text-slate-800 text-xs break-words">${t.type || t.name || 'Vé tham quan'}</div>
            <div class="font-mono text-[11px] text-slate-500 font-semibold flex items-center gap-1.5 mt-0.5">
              <i class="fa-solid fa-qrcode text-slate-400"></i>
              <span>${t.qrCode || t.serial || '--'}</span>
            </div>
          </td>
          <td class="p-3 text-right font-mono font-bold text-slate-800 text-xs whitespace-nowrap">
            ${origPrice.toLocaleString('vi-VN')} đ
          </td>
          <td class="p-3 text-right whitespace-nowrap">
            <span id="ticketGroupPenalty_${idx}" class="font-mono font-bold text-rose-600 text-xs">
              ${penaltyText}
            </span>
          </td>
          <td class="p-3 text-right whitespace-nowrap">
            ${isEditable ? `
              <div class="inline-flex items-center gap-1 justify-end">
                <input
                  type="number"
                  id="ticketGroupRefundInput_${idx}"
                  value="${grpVal}"
                  placeholder="Nhập số tiền..."
                  min="0"
                  max="${origPrice}"
                  step="10000"
                  oninput="onDetailGroupRefundChange(${idx}, this.value)"
                  class="w-28 sm:w-32 px-2 py-1 text-right font-mono font-bold text-blue-700 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-blue-500 text-xs"
                />
                <span class="text-[11px] text-slate-400">đ</span>
              </div>
            ` : `
              <span class="font-mono font-bold text-blue-600 text-xs">
                ${grpVal !== '' ? (Number(grpVal).toLocaleString('vi-VN') + ' đ') : '--'}
              </span>
            `}
          </td>
          <td class="p-3 text-right whitespace-nowrap">
            ${isEditable ? `
              <div class="inline-flex items-center gap-1 justify-end">
                <input
                  type="number"
                  id="ticketFinalRefundInput_${idx}"
                  value="${finVal}"
                  placeholder="Nhập số tiền..."
                  min="0"
                  max="${origPrice}"
                  step="10000"
                  oninput="onDetailFinalRefundChange(${idx}, this.value)"
                  class="w-28 sm:w-32 px-2 py-1 text-right font-mono font-black text-emerald-600 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-emerald-500 text-xs"
                />
                <span class="text-[11px] text-slate-400">đ</span>
              </div>
            ` : `
              <span class="font-mono font-black text-emerald-600 text-xs">
                ${finVal !== '' ? (Number(finVal).toLocaleString('vi-VN') + ' đ') : '--'}
              </span>
            `}
          </td>
        </tr>
      `;
    }).join('');

    syncDetailTotalsAndCards(item);
  }

  function onDetailGroupRefundChange(idx, val) {
    if (!viewingRequestCode) return;
    const item = refundDataset.find(r => r.requestCode === viewingRequestCode);
    if (!item || !item.tickets || !item.tickets[idx]) return;

    const t = item.tickets[idx];
    const origPrice = t.price || 0;
    if (val === '' || val === null || val === undefined) {
      t.refundFromGroup = null;
      t.groupPenalty = null;
      const penaltyEl = document.getElementById(`ticketGroupPenalty_${idx}`);
      if (penaltyEl) penaltyEl.textContent = '--';
    } else {
      const numVal = Math.max(0, Math.min(origPrice, parseFloat(val) || 0));
      t.refundFromGroup = numVal;
      t.groupPenalty = Math.max(0, origPrice - numVal);
      const penaltyEl = document.getElementById(`ticketGroupPenalty_${idx}`);
      if (penaltyEl) penaltyEl.textContent = t.groupPenalty.toLocaleString('vi-VN') + ' đ';
    }

    syncDetailTotalsAndCards(item);
  }

  function onDetailFinalRefundChange(idx, val) {
    if (!viewingRequestCode) return;
    const item = refundDataset.find(r => r.requestCode === viewingRequestCode);
    if (!item || !item.tickets || !item.tickets[idx]) return;

    const t = item.tickets[idx];
    const origPrice = t.price || 0;
    if (val === '' || val === null || val === undefined) {
      t.finalRefund = null;
    } else {
      const numVal = Math.max(0, Math.min(origPrice, parseFloat(val) || 0));
      t.finalRefund = numVal;
    }

    syncDetailTotalsAndCards(item);
  }

  function previewDetailDocument(docName) {
    const modal = document.getElementById('modalPreviewUploadedFile');
    const titleEl = document.getElementById('previewFileTitle');
    const contentEl = document.getElementById('previewFileContent');

    if (titleEl) titleEl.textContent = docName;
    if (contentEl) {
      const ext = docName.split('.').pop().toLowerCase();
      let icon = 'fa-file-lines';
      if (['jpg', 'jpeg', 'png'].includes(ext)) icon = 'fa-file-image';
      if (ext === 'pdf') icon = 'fa-file-pdf';

      contentEl.innerHTML = `
        <div class="p-8 text-center space-y-3">
          <div class="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-2xl shadow-xs">
            <i class="fa-solid ${icon}"></i>
          </div>
          <h4 class="font-bold text-sm text-slate-800">${docName}</h4>
          <p class="text-xs text-slate-400 font-mono">Định dạng tệp: ${ext.toUpperCase()}</p>
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 text-left max-w-md mx-auto">
            <p class="font-bold text-slate-700 mb-1">Tài liệu hồ sơ đính kèm hợp lệ:</p>
            <p>Tệp chứng từ đối soát thuộc phiếu yêu cầu hoàn vé số <strong>${viewingRequestCode || ''}</strong>.</p>
          </div>
        </div>
      `;
    }
    if (modal) modal.classList.remove('hidden');
  }

  function downloadDetailDocument(docName) {
    if (typeof showToast === 'function') {
      showToast('Tải tệp thành công', `Đang tải xuống tài liệu: ${docName}`);
    } else {
      alert(`Đang tải xuống tài liệu: ${docName}`);
    }
  }

  // 11. RENDER CHÂN TRANG THEO QUY TẮC CỦA TỪNG TAB & VAI TRÒ 2 LUỒNG
  function renderDetailActionButtons(item) {
    const footerContainer = document.getElementById('dtActionButtonsContainer');
    if (!footerContainer) return;

    let html = '';

    if (item.status === 'DOI_TIEP_NHAN' || item.status === 'CHO_XU_LY') {
      // TAB 1: ĐỢI TIẾP NHẬN
      if (item.isMyCreated) {
        // Luồng 2: Đơn do chính mình tạo gửi lên cấp trên
        html = `
          <div class="flex items-center justify-between w-full flex-wrap gap-3">
            <div class="flex items-center gap-2 text-xs font-semibold text-amber-800 bg-amber-50 px-3.5 py-2 rounded-xl border border-amber-200">
              <i class="fa-solid fa-clock-rotate-left text-amber-600"></i>
              <span>Đơn do bạn tạo — Đang chờ cấp trên tiếp nhận & xác nhận</span>
            </div>
            <div class="flex items-center gap-2">
              <button type="button" onclick="actionRevokeRequest('${item.requestCode}')" class="px-4 py-2 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs">
                <i class="fa-solid fa-rotate-left"></i>
                <span>Thu hồi yêu cầu</span>
              </button>
              <button type="button" onclick="closeRefundDetail()" class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer">
                <span>Đóng</span>
              </button>
            </div>
          </div>
        `;
      } else {
        // Luồng 1: Đơn từ người gửi tạo gửi lên cho mình tiếp nhận
        html = `
          <div class="flex items-center justify-between w-full flex-wrap gap-3">
            <div class="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <i class="fa-solid fa-user-check text-blue-500"></i>
              <span>Yêu cầu từ đối tác cần bạn kiểm tra hồ sơ và tiếp nhận xử lý.</span>
            </div>
            <div class="flex items-center gap-2.5">
              <button type="button" onclick="openRejectRefundModal('${item.requestCode}')" class="px-4 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs">
                <i class="fa-solid fa-xmark"></i>
                <span>Từ chối</span>
              </button>
              <button type="button" onclick="openApproveRefundModal('${item.requestCode}', 'ACCEPT')" class="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer">
                <i class="fa-solid fa-hand-holding-hand"></i>
                <span>Nhận yêu cầu</span>
              </button>
            </div>
          </div>
        `;
      }
    } else if (item.status === 'DANG_XU_LY') {
      // TAB 2: ĐANG XỬ LÝ
      if (item.isMyCreated) {
        // Luồng 2: Cấp trên đang xử lý đơn của mình
        html = `
          <div class="flex items-center justify-between w-full flex-wrap gap-3">
            <div class="flex items-center gap-2 text-xs font-semibold text-blue-800 bg-blue-50 px-3.5 py-2 rounded-xl border border-blue-200">
              <i class="fa-solid fa-spinner animate-spin text-blue-600"></i>
              <span>Đơn do bạn tạo — Cấp trên đã tiếp nhận, đang thẩm định đối soát và nhập số tiền hoàn</span>
            </div>
            <button type="button" onclick="closeRefundDetail()" class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer">
              <span>Đóng</span>
            </button>
          </div>
        `;
      } else {
        // Luồng 1: Mình đang xử lý đơn của đối tác -> Vào chi tiết để nhập số tiền hoàn và duyệt thẳng sang Đã xử lý [Thành công] hoặc Từ chối
        html = `
          <div class="flex items-center justify-between w-full flex-wrap gap-3">
            <div class="flex items-center gap-2 flex-wrap">
              <button type="button" onclick="actionBatchCharge('${item.requestCode}')" class="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer">
                <i class="fa-solid fa-sliders text-slate-500"></i>
                <span>Phí Charge hàng loạt</span>
              </button>
              <button type="button" onclick="actionAttachDocument('${item.requestCode}')" class="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer">
                <i class="fa-solid fa-paperclip text-slate-500"></i>
                <span>Đính kèm tài liệu</span>
              </button>
            </div>
            <div class="flex items-center gap-2.5">
              <button type="button" onclick="openRejectRefundModal('${item.requestCode}')" class="px-4 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs">
                <i class="fa-solid fa-xmark"></i>
                <span>Từ chối</span>
              </button>
              <button type="button" onclick="openApproveRefundModal('${item.requestCode}', 'APPROVE')" class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer">
                <i class="fa-solid fa-check"></i>
                <span>Duyệt hoàn vé</span>
              </button>
            </div>
          </div>
        `;
      }
    } else {
      // TAB 3: ĐÃ XỬ LÝ (Read-only)
      const isRejected = (item.subStatus === 'TU_CHOI');
      const isRevoked = (item.subStatus === 'THU_HOI');
      let statusTag = '';
      if (isRejected) {
        statusTag = `
          <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200">
            <i class="fa-solid fa-circle-xmark"></i> Yêu cầu bị từ chối
          </span>
        `;
      } else if (isRevoked) {
        statusTag = `
          <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-700 border border-amber-200">
            <i class="fa-solid fa-rotate-left"></i> Yêu cầu đã thu hồi
          </span>
        `;
      } else {
        statusTag = `
          <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
            <i class="fa-solid fa-circle-check"></i> Hoàn vé thành công
          </span>
        `;
      }

      html = `
        <div class="flex items-center justify-between w-full flex-wrap gap-3">
          <div class="text-xs text-slate-600 font-medium flex items-center gap-2">
            ${statusTag}
            <span>Hồ sơ hoàn hủy đã hoàn tất lưu vết trên hệ thống.</span>
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

  // 12. CÁC HÀNH ĐỘNG NGHIỆP VỤ & MODALS XỬ LÝ
  let currentRejectRequestCode = null;
  let currentRejectUploadedFileName = '';

  function openRejectRefundModal(requestCode) {
    currentRejectRequestCode = requestCode;
    currentRejectUploadedFileName = '';

    const modal = document.getElementById('modalRejectRefund');
    const subTitle = document.getElementById('rejectModalSubTitle');
    const reasonSelect = document.getElementById('rejectReasonSelect');
    const otherBox = document.getElementById('rejectOtherReasonBox');
    const otherDetail = document.getElementById('rejectOtherReasonDetail');
    const otherErr = document.getElementById('rejectOtherError');
    const fileDisplay = document.getElementById('rejectFileNameDisplay');
    const fileInput = document.getElementById('rejectDocumentFileInput');

    if (subTitle) subTitle.textContent = `Phiếu: ${requestCode}`;
    if (reasonSelect) reasonSelect.value = '';
    if (otherBox) otherBox.classList.add('hidden');
    if (otherDetail) otherDetail.value = '';
    if (otherErr) otherErr.classList.add('hidden');
    if (fileDisplay) fileDisplay.textContent = 'Nhấn để chọn tệp biên bản / email từ chối...';
    if (fileInput) fileInput.value = '';

    if (modal) modal.classList.remove('hidden');
  }

  function closeRejectRefundModal() {
    const modal = document.getElementById('modalRejectRefund');
    if (modal) modal.classList.add('hidden');
    currentRejectRequestCode = null;
  }

  function onRejectReasonSelectChange() {
    const reasonSelect = document.getElementById('rejectReasonSelect');
    const otherBox = document.getElementById('rejectOtherReasonBox');
    const otherErr = document.getElementById('rejectOtherError');

    if (reasonSelect && otherBox) {
      if (reasonSelect.value === 'OTHER') {
        otherBox.classList.remove('hidden');
        const detailInput = document.getElementById('rejectOtherReasonDetail');
        if (detailInput) detailInput.focus();
      } else {
        otherBox.classList.add('hidden');
        if (otherErr) otherErr.classList.add('hidden');
      }
    }
  }

  function onRejectFileChosen(input) {
    if (input && input.files && input.files[0]) {
      currentRejectUploadedFileName = input.files[0].name;
      const fileDisplay = document.getElementById('rejectFileNameDisplay');
      if (fileDisplay) fileDisplay.textContent = `Đã chọn: ${currentRejectUploadedFileName}`;
    }
  }

  function confirmSubmitRejectRefund() {
    if (!currentRejectRequestCode) return;
    const item = refundDataset.find(r => r.requestCode === currentRejectRequestCode);
    if (!item) return;

    const reasonSelect = document.getElementById('rejectReasonSelect');
    const otherDetail = document.getElementById('rejectOtherReasonDetail');
    const otherErr = document.getElementById('rejectOtherError');

    if (!reasonSelect || !reasonSelect.value) {
      alert('Vui lòng chọn lý do từ chối!');
      return;
    }

    const REJECT_REASON_LABELS = {
      'QUAS_HAN_HOAN_HUY': 'Vé quá hạn hoàn/hủy theo quy định của Tập đoàn',
      'DIEU_KIEN_VE_KHONG_CHO_PHEP': 'Loại vé không áp dụng chính sách hoàn hủy (Non-refundable)',
      'THIEU_HO_SO_DOI_SOAT': 'Thiếu hồ sơ chứng từ đối soát hợp lệ (giấy hoãn/hủy chuyến, bệnh án...)',
      'VE_DA_SU_DUNG': 'Vé đã quét qua cổng kiểm soát, không đủ điều kiện hoàn vé',
      'OTHER': 'Lý do khác'
    };

    let finalReasonTitle = REJECT_REASON_LABELS[reasonSelect.value] || reasonSelect.value;
    let detailText = '';
    if (reasonSelect.value === 'OTHER') {
      detailText = (otherDetail?.value || '').trim();
      if (!detailText) {
        if (otherErr) otherErr.classList.remove('hidden');
        if (otherDetail) otherDetail.focus();
        return;
      }
      finalReasonTitle = 'Lý do khác: ' + detailText;
    }

    item.status = 'DA_XU_LY';
    item.subStatus = 'TU_CHOI';
    item.rejectReason = finalReasonTitle;
    item.rejectDetails = detailText;
    item.assignedTo = 'Chuyên viên CSKH / Booking';
    item.processedDate = new Date().toISOString().slice(0, 16).replace('T', ' ');

    if (currentRejectUploadedFileName) {
      if (!item.rejectDocuments) item.rejectDocuments = [];
      item.rejectDocuments.push(currentRejectUploadedFileName);
      if (!item.documents) item.documents = [];
      item.documents.push(currentRejectUploadedFileName);
    }

    closeRejectRefundModal();

    // Tự động chuyển Tab sang ĐÃ XỬ LÝ
    switchRefundTab('DA_XU_LY');

    // Reload giao diện chi tiết real-time ngay tại màn hình hiện tại
    renderDetailContent(item);
    renderDetailTicketsTable(item);
    renderDetailActionButtons(item);

    if (typeof showToast === 'function') {
      showToast('Đã từ chối yêu cầu', `Đã từ chối yêu cầu ${currentRejectRequestCode} và chuyển sang Tab Đã xử lý [Từ chối].`);
    }
  }

  let currentApproveRequestCode = null;
  let currentApproveMode = 'ACCEPT'; // 'ACCEPT' hoặc 'APPROVE'

  function openApproveRefundModal(requestCode, mode = 'ACCEPT') {
    currentApproveRequestCode = requestCode;
    currentApproveMode = mode;
    const item = refundDataset.find(r => r.requestCode === requestCode);
    if (!item) return;

    // Đảm bảo các chỉ số đã được tính toán đầy đủ
    syncDetailTotalsAndCards(item);

    const modal = document.getElementById('modalApproveRefund');
    const titleEl = document.getElementById('approveModalTitle');
    const subTitleEl = document.getElementById('approveModalSubTitle');
    const msgEl = document.getElementById('approveModalMessage');
    const btnText = document.getElementById('btnConfirmApproveText');

    const sumAgency = document.getElementById('approveSummaryAgency');
    const sumTickets = document.getElementById('approveSummaryTicketsCount');
    const sumPaid = document.getElementById('approveSummaryPaid');
    const sumPenalty = document.getElementById('approveSummaryPenalty');
    const sumGroupRef = document.getElementById('approveSummaryGroupRefund');
    const sumFinalRef = document.getElementById('approveSummaryFinalRefund');
    const sumProfit = document.getElementById('approveSummaryProfit');

    if (subTitleEl) subTitleEl.textContent = `Phiếu: ${item.requestCode}`;
    if (sumAgency) sumAgency.textContent = item.agency || '--';
    if (sumTickets) sumTickets.textContent = `${item.ticketCount || (item.tickets ? item.tickets.length : 0)} vé`;
    if (sumPaid) sumPaid.textContent = (item.totalOriginalAmount || 0).toLocaleString('vi-VN') + ' đ';
    if (sumPenalty) sumPenalty.textContent = (item.chargeAmount !== null && item.chargeAmount !== undefined) ? item.chargeAmount.toLocaleString('vi-VN') + ' đ' : '--';
    if (sumGroupRef) sumGroupRef.textContent = (item.groupRefundAmount !== null && item.groupRefundAmount !== undefined) ? item.groupRefundAmount.toLocaleString('vi-VN') + ' đ' : '--';
    if (sumFinalRef) sumFinalRef.textContent = (item.totalRefundAmount !== null && item.totalRefundAmount !== undefined) ? item.totalRefundAmount.toLocaleString('vi-VN') + ' đ' : '--';

    const profit = (item.groupRefundAmount !== null && item.totalRefundAmount !== null) ? (item.groupRefundAmount - item.totalRefundAmount) : null;
    if (sumProfit) {
      if (profit !== null) {
        const pfx = profit > 0 ? '+' : '';
        sumProfit.textContent = `${pfx}${profit.toLocaleString('vi-VN')} đ`;
        sumProfit.className = profit >= 0 ? 'font-mono text-emerald-700 font-black' : 'font-mono text-rose-600 font-black';
      } else {
        sumProfit.textContent = '--';
        sumProfit.className = 'font-mono text-slate-400 font-bold';
      }
    }

    if (mode === 'ACCEPT') {
      if (titleEl) titleEl.textContent = 'Tiếp nhận xử lý yêu cầu hoàn vé';
      if (msgEl) msgEl.textContent = 'Xác nhận tiếp nhận yêu cầu để thẩm định hồ sơ, kiểm tra mã QR và đối soát trực tiếp với Tập đoàn cung cấp dịch vụ.';
      if (btnText) btnText.textContent = 'Xác nhận tiếp nhận';
    } else {
      if (titleEl) titleEl.textContent = 'Xác nhận duyệt đề xuất hoàn vé';
      const finalAmtStr = (item.totalRefundAmount !== null && item.totalRefundAmount !== undefined) ? (item.totalRefundAmount.toLocaleString('vi-VN') + ' đ') : '0 đ';
      if (msgEl) msgEl.textContent = `Xác nhận phê duyệt hoàn vé với số tiền hoàn cuối ${finalAmtStr}. Yêu cầu chuyển thẳng sang Tab Đã xử lý (Thành công).`;
      if (btnText) btnText.textContent = 'Xác nhận & Duyệt hoàn';
    }

    if (modal) modal.classList.remove('hidden');
  }

  function closeApproveRefundModal() {
    const modal = document.getElementById('modalApproveRefund');
    if (modal) modal.classList.add('hidden');
    currentApproveRequestCode = null;
  }

  function confirmSubmitApproveRefund() {
    if (!currentApproveRequestCode) return;
    const item = refundDataset.find(r => r.requestCode === currentApproveRequestCode);
    if (!item) return;

    if (currentApproveMode === 'ACCEPT') {
      item.status = 'DANG_XU_LY';
      item.subStatus = 'DANG_THAM_DINH';
      item.assignedTo = 'Chuyên viên CSKH / Kế toán';

      // Tự động chuyển Tab sang ĐANG XỬ LÝ
      switchRefundTab('DANG_XU_LY');

      if (typeof showToast === 'function') {
        showToast('Đã tiếp nhận yêu cầu', `Yêu cầu ${currentApproveRequestCode} đã được chuyển sang Tab Đang xử lý.`);
      }
    } else {
      // Chuyển thẳng sang Đã xử lý [Thành công] mà không qua bước trung gian
      item.status = 'DA_XU_LY';
      item.subStatus = 'THANH_CONG';
      item.processedDate = new Date().toISOString().slice(0, 16).replace('T', ' ');

      // Tự động chuyển Tab sang ĐÃ XỬ LÝ
      switchRefundTab('DA_XU_LY');

      if (typeof showToast === 'function') {
        showToast('Duyệt hoàn vé thành công', `Yêu cầu ${currentApproveRequestCode} đã hoàn tất và chuyển thẳng sang Tab Đã xử lý [Thành công].`);
      }
    }

    closeApproveRefundModal();

    // Reload giao diện chi tiết real-time ngay tại màn hình hiện tại
    renderDetailContent(item);
    renderDetailTicketsTable(item);
    renderDetailActionButtons(item);
  }

  function actionAcceptRequest(requestCode) {
    openApproveRefundModal(requestCode, 'ACCEPT');
  }

  function actionRevokeRequest(requestCode) {
    const item = refundDataset.find(r => r.requestCode === requestCode);
    if (!item) return;
    if (confirm(`Bạn có chắc chắn muốn THU HỒI yêu cầu hoàn vé ${requestCode}? Yêu cầu sẽ được chuyển sang Tab Đã xử lý với trạng thái Thu hồi.`)) {
      item.status = 'DA_XU_LY';
      item.subStatus = 'THU_HOI';
      item.assignedTo = 'Tôi (Người tạo yêu cầu)';
      item.processedDate = new Date().toISOString().slice(0, 16).replace('T', ' ');

      // Tự động chuyển Tab sang ĐÃ XỬ LÝ
      switchRefundTab('DA_XU_LY');

      // Reload giao diện chi tiết real-time ngay tại màn hình hiện tại
      renderDetailContent(item);
      renderDetailTicketsTable(item);
      renderDetailActionButtons(item);

      if (typeof showToast === 'function') {
        showToast('Đã thu hồi yêu cầu', `Đã thu hồi yêu cầu ${requestCode} và lưu vào Tab Đã xử lý [Thu hồi].`);
      }
    }
  }

  function actionRejectRequest(requestCode) {
    openRejectRefundModal(requestCode);
  }

  function actionApproveRefund(requestCode) {
    openApproveRefundModal(requestCode, 'APPROVE');
  }

  function actionConfirmDisbursement(requestCode) {
    const item = refundDataset.find(r => r.requestCode === requestCode);
    if (!item) return;

    const disbursementAmt = item.totalRefundAmount || 0;
    if (confirm(`Xác nhận hoàn tất giải ngân số tiền ${disbursementAmt.toLocaleString('vi-VN')} đ về Ví / Tài khoản đối tác?`)) {
      item.status = 'DA_XU_LY';
      item.subStatus = 'HOAN_TAT';
      item.processedDate = new Date().toISOString().slice(0, 16).replace('T', ' ');

      // Nếu có TecheraDB, cộng tiền vào ví đại lý
      if (typeof TecheraDB !== 'undefined' && typeof TecheraDB.adjustWalletBalance === 'function') {
        TecheraDB.adjustWalletBalance(disbursementAmt, {
          isTopup: false,
          method: 'Hoàn tiền vé',
          note: `Hoàn tiền yêu cầu #${item.requestCode} (Đơn gốc: ${item.originalOrderCode})`
        });
      }

      if (typeof showToast === 'function') {
        showToast('Hoàn tiền thành công', `Đã hạch toán hoàn tất số tiền ${disbursementAmt.toLocaleString('vi-VN')} đ cho yêu cầu ${requestCode}.`);
      }
      openRefundDetail(requestCode);
    }
  }

  // 12.1 HÀM XỬ LÝ MODAL CHARGE HÀNG LOẠT (CỘT GIÁ HOÀN CUỐI)
  function actionBatchCharge(requestCode) {
    const code = requestCode || viewingRequestCode;
    const item = refundDataset.find(r => r.requestCode === code);
    if (!item || !item.tickets) return;

    const totalTickets = item.tickets.length;
    const selectedCbs = document.querySelectorAll('.dt-ticket-select-cb:checked');
    const selectedCount = selectedCbs.length;

    const modal = document.getElementById('modalBatchCharge');
    const totalCountEl = document.getElementById('batchChargeTotalCount');
    const selectedCountEl = document.getElementById('batchChargeSelectedCount');
    const inputValEl = document.getElementById('batchChargeInputValue');

    if (totalCountEl) totalCountEl.textContent = totalTickets;
    if (selectedCountEl) selectedCountEl.textContent = selectedCount;
    if (inputValEl) inputValEl.value = '';

    // Nếu người dùng đã tick chọn ít nhất 1 vé, ưu tiên chọn radio phạm vi "Chỉ các vé đang được tick chọn"
    const scopeRadios = document.getElementsByName('batchChargeScopeRadio');
    if (scopeRadios) {
      scopeRadios.forEach(r => {
        if (selectedCount > 0 && r.value === 'SELECTED') r.checked = true;
        else if (selectedCount === 0 && r.value === 'ALL') r.checked = true;
      });
    }

    onBatchChargeTypeChange();
    if (modal) modal.classList.remove('hidden');
    if (inputValEl) setTimeout(() => inputValEl.focus(), 100);
  }

  function closeBatchChargeModal() {
    const modal = document.getElementById('modalBatchCharge');
    if (modal) modal.classList.add('hidden');
  }

  function onBatchChargeTypeChange() {
    const radios = document.getElementsByName('batchChargeTypeRadio');
    let selectedType = 'FIXED_AMOUNT';
    radios.forEach(r => {
      if (r.checked) selectedType = r.value;
    });

    const labelEl = document.getElementById('batchChargeInputLabel');
    const inputEl = document.getElementById('batchChargeInputValue');
    const unitEl = document.getElementById('batchChargeInputUnit');
    const helpEl = document.getElementById('batchChargeInputHelp');

    if (selectedType === 'FIXED_AMOUNT') {
      if (labelEl) labelEl.textContent = 'Số tiền hoàn mỗi vé (VNĐ):';
      if (inputEl) {
        inputEl.placeholder = 'VD: 800000';
        inputEl.min = '0';
        inputEl.max = '';
        inputEl.step = '10000';
      }
      if (unitEl) unitEl.textContent = 'đ';
      if (helpEl) helpEl.textContent = 'Điền đồng loạt số tiền này vào cột Giá hoàn cuối cho các vé mục tiêu.';
    } else {
      if (labelEl) labelEl.textContent = 'Tỷ lệ hoàn (% Giá KH thanh toán):';
      if (inputEl) {
        inputEl.placeholder = 'VD: 90 (hoàn 90% giá khách trả)';
        inputEl.min = '0';
        inputEl.max = '100';
        inputEl.step = '1';
      }
      if (unitEl) unitEl.textContent = '%';
      if (helpEl) helpEl.textContent = 'Tự động tính: Giá hoàn cuối = Giá KH thanh toán × Tỷ lệ % áp dụng.';
    }
  }

  function onToggleSelectAllDetailTickets(checked) {
    const cbs = document.querySelectorAll('.dt-ticket-select-cb');
    cbs.forEach(cb => {
      if (!cb.disabled) cb.checked = checked;
    });
    onDetailTicketCheckboxChange();
  }

  function onDetailTicketCheckboxChange() {
    const cbs = document.querySelectorAll('.dt-ticket-select-cb:not(:disabled)');
    const selectedCbs = document.querySelectorAll('.dt-ticket-select-cb:checked');
    const selectAllCb = document.getElementById('dtSelectAllTickets');
    const selectedCountEl = document.getElementById('batchChargeSelectedCount');

    if (selectAllCb) {
      if (cbs.length === 0 || selectedCbs.length === 0) {
        selectAllCb.checked = false;
        selectAllCb.indeterminate = false;
      } else if (selectedCbs.length === cbs.length) {
        selectAllCb.checked = true;
        selectAllCb.indeterminate = false;
      } else {
        selectAllCb.checked = false;
        selectAllCb.indeterminate = true;
      }
    }

    if (selectedCountEl) {
      selectedCountEl.textContent = selectedCbs.length;
    }
  }

  function confirmApplyBatchCharge() {
    if (!viewingRequestCode) return;
    const item = refundDataset.find(r => r.requestCode === viewingRequestCode);
    if (!item || !item.tickets) return;

    const inputValEl = document.getElementById('batchChargeInputValue');
    const rawVal = inputValEl?.value.trim();
    if (!rawVal || isNaN(rawVal) || parseFloat(rawVal) < 0) {
      alert('Vui lòng nhập một giá trị hợp lệ lớn hơn hoặc bằng 0!');
      if (inputValEl) inputValEl.focus();
      return;
    }

    const numVal = parseFloat(rawVal);

    // Xác định kiểu tính
    const typeRadios = document.getElementsByName('batchChargeTypeRadio');
    let calcType = 'FIXED_AMOUNT';
    typeRadios.forEach(r => {
      if (r.checked) calcType = r.value;
    });

    // Xác định phạm vi
    const scopeRadios = document.getElementsByName('batchChargeScopeRadio');
    let scope = 'ALL';
    scopeRadios.forEach(r => {
      if (r.checked) scope = r.value;
    });

    const selectedIdxs = new Set();
    if (scope === 'SELECTED') {
      const selectedCbs = document.querySelectorAll('.dt-ticket-select-cb:checked');
      if (selectedCbs.length === 0) {
        alert('Chưa có vé nào được chọn! Vui lòng tick chọn ít nhất 1 vé hoặc chọn phạm vi "Toàn bộ vé trong bảng".');
        return;
      }
      selectedCbs.forEach(cb => {
        const idx = parseInt(cb.getAttribute('data-idx'), 10);
        if (!isNaN(idx)) selectedIdxs.add(idx);
      });
    }

    let appliedCount = 0;
    item.tickets.forEach((t, idx) => {
      if (scope === 'ALL' || selectedIdxs.has(idx)) {
        const origPrice = t.price || 0;
        let finalVal = 0;
        if (calcType === 'FIXED_AMOUNT') {
          finalVal = Math.min(origPrice, numVal);
        } else {
          const pct = Math.max(0, Math.min(100, numVal));
          finalVal = Math.round((origPrice * pct) / 100);
        }

        t.finalRefund = finalVal;
        appliedCount++;

        // Cập nhật giá trị ô input tương ứng trên giao diện
        const inp = document.getElementById(`ticketFinalRefundInput_${idx}`);
        if (inp) inp.value = finalVal;
      }
    });

    syncDetailTotalsAndCards(item);
    closeBatchChargeModal();

    if (typeof showToast === 'function') {
      showToast('Áp dụng hàng loạt thành công', `Đã cập nhật Giá hoàn cuối cho ${appliedCount} vé.`);
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

  // 13. QUẢN LÝ MÀN HÌNH TẠO YÊU CẦU HOÀN VÉ (CREATE REFUND REQUEST NEXTPAGE WORKSPACE)
  let createRequestCode = '';
  let selectedOrigOrderId = 'ORD-2611-088';
  let selectedTicketSerials = new Set();
  let searchTicketsKeyword = '';
  let uploadedFiles = [];
  let pdfCurrentPage = 1;
  const PDF_PAGE_SIZE = 4; // Mặc định 4 mã vé / trang theo quy cách
  let collapsedAccordionGroups = new Set();

  // 13.1 MỞ NEXTPAGE TẠO YÊU CẦU HOÀN VÉ
  function openCreateRefundNextPage() {
    // Ẩn Danh sách & Chi tiết
    const listView = document.getElementById('viewRefundRequestsList');
    const detailView = document.getElementById('viewRefundRequestDetail');
    const createView = document.getElementById('viewCreateRefundRequest');

    if (listView) listView.classList.add('hidden');
    if (detailView) detailView.classList.add('hidden');
    if (createView) createView.classList.remove('hidden');

    if (window.history && window.history.pushState) {
      window.history.pushState({ screen: 'refund-create' }, '', '#create');
    }

    // Khởi tạo trạng thái form mới
    createRequestCode = generateRefundRequestCode();
    selectedTicketSerials.clear();
    searchTicketsKeyword = '';
    uploadedFiles = [];
    pdfCurrentPage = 1;
    collapsedAccordionGroups.clear();

    const codeInput = document.getElementById('createRequestCode');
    if (codeInput) codeInput.value = createRequestCode;

    // Reset thông tin người gửi nếu chưa có
    const aName = document.getElementById('senderAgencyName');
    const rName = document.getElementById('senderRequesterName');
    const sEmail = document.getElementById('senderEmail');
    const aCode = document.getElementById('senderAgencyCode');
    const sTax = document.getElementById('senderTaxId');
    const sAddr = document.getElementById('senderAddress');

    if (aName && !aName.value) aName.value = 'Công ty TNHH Du lịch & Dịch vụ Khám Phá Việt (Viet Discovery)';
    if (rName && !rName.value) rName.value = 'Trần Hoàng Nam';
    if (sEmail && !sEmail.value) sEmail.value = 'nam.tran@vietdiscovery.vn';
    if (aCode && !aCode.value) aCode.value = 'DL-2410-090';
    if (sTax && !sTax.value) sTax.value = '0318999888';
    if (sAddr && !sAddr.value) sAddr.value = 'Tầng 6, Tòa nhà Bitexco, 02 Hải Triều, P. Bến Nghé, Quận 1, TP. Hồ Chí Minh';

    // Populate dropdown đơn hàng gốc
    populateOrigOrdersDropdown();

    // Chọn đơn hàng mặc định (ORD-2611-088)
    selectOrigOrder('ORD-2611-088');

    // Đưa về Bước 1
    goToStep1(true);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Đóng Nextpage trở về Danh sách
  function closeCreateRefundNextPage() {
    if (selectedTicketSerials.size > 0) {
      if (!confirm('Dữ liệu yêu cầu chưa được gửi. Bạn có chắc chắn muốn quay lại Danh sách?')) {
        return;
      }
    }

    const listView = document.getElementById('viewRefundRequestsList');
    const createView = document.getElementById('viewCreateRefundRequest');
    if (createView) createView.classList.add('hidden');
    if (listView) listView.classList.remove('hidden');

    if (window.history && window.history.pushState) {
      window.history.pushState({ screen: 'refund-list' }, '', window.location.pathname);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Backward compatibility alias
  function openCreateRefundModal() {
    openCreateRefundNextPage();
  }
  function closeCreateRefundModal() {
    closeCreateRefundNextPage();
  }

  // 13.2 POPULATE & TÌM KIẾM ĐƠN HÀNG GỐC TRONG DROPDOWN
  function populateOrigOrdersDropdown() {
    filterOrigOrdersDropdown('');
  }

  function toggleOrigOrderDropdown(forceOpen) {
    const menu = document.getElementById('menuOrigOrderDropdown');
    if (!menu) return;
    if (forceOpen === true) {
      menu.classList.remove('hidden');
    } else if (forceOpen === false) {
      menu.classList.add('hidden');
    } else {
      menu.classList.toggle('hidden');
    }
  }

  function filterOrigOrdersDropdown(query) {
    const listContainer = document.getElementById('listOrigOrderOptions');
    if (!listContainer) return;

    const q = (query || '').toLowerCase().trim();
    const filteredOrders = MOCK_ELIGIBLE_ORDERS.filter(o => {
      // Đếm số vé đủ điều kiện
      let eligibleCount = 0;
      o.packages.forEach(pkg => {
        eligibleCount += pkg.tickets.filter(t => t.status === 'ELIGIBLE').length;
      });
      // Chỉ hiển thị đơn có vé khả dụng
      if (eligibleCount === 0) return false;

      if (!q) return true;
      return o.orderId.toLowerCase().includes(q) ||
             o.customerName.toLowerCase().includes(q) ||
             o.customerPhone.includes(q) ||
             o.corp.toLowerCase().includes(q) ||
             o.site.toLowerCase().includes(q);
    });

    if (filteredOrders.length === 0) {
      listContainer.innerHTML = `
        <div class="p-3 text-center text-slate-400 text-xs font-medium">
          Không tìm thấy đơn hàng đủ điều kiện phù hợp
        </div>
      `;
      return;
    }

    listContainer.innerHTML = filteredOrders.map(o => {
      let eligibleCount = 0;
      let totalCount = 0;
      o.packages.forEach(pkg => {
        pkg.tickets.forEach(t => {
          totalCount++;
          if (t.status === 'ELIGIBLE') eligibleCount++;
        });
      });

      const isSelected = o.orderId === selectedOrigOrderId;
      return `
        <button
          type="button"
          onclick="selectOrigOrder('${o.orderId}')"
          class="w-full px-3 py-2.5 rounded-xl text-left transition-colors flex items-center justify-between cursor-pointer ${
            isSelected ? 'bg-rose-50/80 border border-rose-200 text-rose-900' : 'hover:bg-slate-50 text-slate-700'
          }"
        >
          <div>
            <div class="flex items-center gap-2">
              <span class="font-mono font-bold text-xs ${isSelected ? 'text-rose-700' : 'text-slate-900'}">${o.orderId}</span>
              <span class="text-[11px] font-semibold text-slate-500">• ${o.customerName}</span>
              <span class="text-[10px] text-slate-400 font-mono">(${o.customerPhone})</span>
            </div>
            <div class="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
              <span>${o.site}</span>
              <span>• Ngày đi: <strong class="font-mono">${o.serviceDate}</strong></span>
            </div>
          </div>
          <div class="text-right shrink-0 ml-2">
            <span class="px-2 py-0.5 rounded-md text-[10px] font-bold ${
              eligibleCount > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
            }">
              ${eligibleCount}/${totalCount} vé khả dụng
            </span>
          </div>
        </button>
      `;
    }).join('');
  }

  // 13.3 CHỌN MÃ ĐƠN HÀNG GỐC VÀ TỰ ĐỘNG ĐIỀN DỮ LIỆU (AUTO-FILL)
  function selectOrigOrder(orderId) {
    selectedOrigOrderId = orderId;
    toggleOrigOrderDropdown(false);

    const order = MOCK_ELIGIBLE_ORDERS.find(o => o.orderId === orderId);
    if (!order) return;

    // Cập nhật text trên dropdown trigger
    const triggerText = document.getElementById('selectedOrigOrderText');
    if (triggerText) {
      triggerText.textContent = `${order.orderId} - ${order.customerName} (${order.corp})`;
    }

    // Auto-fill dữ liệu
    const sDateInput = document.getElementById('createServiceDate');
    const totalPaidInput = document.getElementById('createTotalPaid');
    const corpInput = document.getElementById('createCorp');
    const siteInput = document.getElementById('createSite');

    if (sDateInput) sDateInput.value = order.serviceDate;
    if (totalPaidInput) totalPaidInput.value = order.totalPaid.toLocaleString('vi-VN') + ' đ';
    if (corpInput) corpInput.value = order.corp;
    if (siteInput) siteInput.value = order.site;

    // Cập nhật banner chính sách phạt
    updatePenaltyBanner(order.serviceDate);

    // Reset chọn vé khi đổi đơn
    selectedTicketSerials.clear();

    // Render danh sách vé Bước 1
    renderStep1Tickets(searchTicketsKeyword);

    // Cập nhật lại dropdown list active class
    populateOrigOrdersDropdown();
  }

  // 13.4 GỢI Ý CHÍNH SÁCH PHẠT DỰA TRÊN NGÀY ĐI T
  function getPenaltyPolicy(serviceDateStr) {
    const todayStr = '2026-11-19'; // Ngày hiện tại của hệ thống
    if (serviceDateStr > todayStr) {
      return {
        rate: 30,
        badgeText: 'Đang áp dụng: Phạt 30% (Trước ngày đi T)',
        badgeClass: 'bg-amber-500 text-white',
        note: 'Yêu cầu hủy trước ngày sử dụng T. Phí phạt áp dụng 30% giá vé niêm yết.'
      };
    } else if (serviceDateStr === todayStr) {
      return {
        rate: 50,
        badgeText: 'Đang áp dụng: Phạt 50% (Trong ngày đi T)',
        badgeClass: 'bg-rose-500 text-white',
        note: 'Yêu cầu hủy đúng ngày sử dụng T. Phí phạt tăng cường áp dụng 50% giá vé niêm yết.'
      };
    } else {
      return {
        rate: 100,
        badgeText: 'Sau ngày T: Không hỗ trợ hoàn vé',
        badgeClass: 'bg-slate-700 text-white',
        note: 'Đã qua ngày sử dụng T, hệ thống theo quy định không hỗ trợ hoàn vé.'
      };
    }
  }

    function updatePenaltyBanner(serviceDateStr) {
    const policy = getPenaltyPolicy(serviceDateStr);
    const badge = document.getElementById('policyAppliedBadge');
    if (badge) {
      badge.textContent = policy.badgeText;
      badge.className = 'text-xs font-semibold text-slate-700';
    }
  }

  // 13.5 RENDER DANH SÁCH VÉ BƯỚC 1 (ACCORDION GROUPS & TABLES)
  function renderStep1Tickets(searchQuery) {
    const container = document.getElementById('ticketAccordionGroupsContainer');
    if (!container) return;

    const order = MOCK_ELIGIBLE_ORDERS.find(o => o.orderId === selectedOrigOrderId);
    if (!order) {
      container.innerHTML = `<div class="p-6 text-center text-slate-400 text-xs font-semibold">Vui lòng chọn đơn hàng gốc</div>`;
      return;
    }

    const q = (searchQuery || '').toLowerCase().trim();

    let totalEligibleInOrder = 0;
    let totalSelectedInOrder = 0;
    let totalVisibleSerials = 0;
    let totalOrderSerials = 0;

    let allVisibleEligibleSerials = [];

    const groupsHtml = order.packages.map(pkg => {
      // Lọc vé theo từ khóa tìm kiếm
      const filteredTickets = pkg.tickets.filter(t => {
        totalOrderSerials++;
        if (t.status === 'ELIGIBLE') totalEligibleInOrder++;
        if (selectedTicketSerials.has(t.serial)) totalSelectedInOrder++;

        if (!q) return true;
        return t.serial.toLowerCase().includes(q) || t.name.toLowerCase().includes(q);
      });

      if (filteredTickets.length === 0 && q) {
        return ''; // Không có vé khớp trong nhóm này khi search
      }

      totalVisibleSerials += filteredTickets.length;

      // Đếm số vé đã chọn trong nhóm này
      let groupSelectedCount = 0;
      let groupEligibleCount = 0;
      let groupEligibleSerials = [];

      filteredTickets.forEach(t => {
        if (t.status === 'ELIGIBLE') {
          groupEligibleCount++;
          groupEligibleSerials.push(t.serial);
          allVisibleEligibleSerials.push(t.serial);
        }
        if (selectedTicketSerials.has(t.serial)) {
          groupSelectedCount++;
        }
      });

      const isGroupAllSelected = groupEligibleCount > 0 && groupSelectedCount === groupEligibleCount;
      const isGroupIndeterminate = groupSelectedCount > 0 && groupSelectedCount < groupEligibleCount;
      const isCollapsed = collapsedAccordionGroups.has(pkg.packageId);

      // Render từng dòng vé
      let hasDisabledTicketsInGroup = false;
      const rowsHtml = filteredTickets.map((t, idx) => {
        const isEligible = (t.status === 'ELIGIBLE');
        const isSelected = selectedTicketSerials.has(t.serial);
        if (!isEligible) hasDisabledTicketsInGroup = true;

        // Trạng thái vé theo yêu cầu
        let statusBadgeHtml = '';
        if (t.status === 'ELIGIBLE') {
          statusBadgeHtml = `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200"><i class="fa-solid fa-circle-check text-[9px]"></i>Khả dụng</span>`;
        } else if (t.status === 'REFUNDED') {
          statusBadgeHtml = `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"><i class="fa-solid fa-money-bill-transfer text-[9px]"></i>Vé đã hoàn</span>`;
        } else if (t.status === 'CANCELLED') {
          statusBadgeHtml = `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200"><i class="fa-solid fa-ban text-[9px]"></i>Vé đã hủy</span>`;
        } else if (t.status === 'PENDING_REFUND') {
          statusBadgeHtml = `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200"><i class="fa-solid fa-clock text-[9px]"></i>Đang có yêu cầu hoàn/hủy</span>`;
        }

        return `
          <tr class="hover:bg-slate-50/80 transition-colors ${!isEligible ? 'bg-slate-50/40 text-slate-400' : ''}">
            <td class="p-3 text-center">
              <input
                type="checkbox"
                ${isEligible ? '' : 'disabled'}
                ${isSelected ? 'checked' : ''}
                onchange="toggleSelectTicket('${t.serial}', this.checked)"
                class="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300 ${isEligible ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}"
              />
            </td>
            <td class="p-3 text-center font-bold text-xs ${isEligible ? 'text-slate-600' : 'text-slate-400'}">
              ${idx + 1}
            </td>
            <td class="p-3">
              <span class="font-mono font-bold text-xs ${isEligible ? 'text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md' : 'text-slate-400 font-normal line-through'}">
                ${t.serial}
              </span>
            </td>
            <td class="p-3 font-semibold text-xs ${isEligible ? 'text-slate-800' : 'text-slate-400'}">
              ${t.name}
            </td>
            <td class="p-3 font-mono font-bold text-xs text-right ${isEligible ? 'text-slate-700' : 'text-slate-400'}">
              ${t.price.toLocaleString('vi-VN')} đ
            </td>
            <td class="p-3 text-center">
              ${statusBadgeHtml}
            </td>
          </tr>
        `;
      }).join('');

      return `
        <div class="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all">
          <!-- Accordion Header -->
          <div class="p-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <input
                type="checkbox"
                id="chkGroup_${pkg.packageId}"
                ${groupEligibleCount === 0 ? 'disabled' : ''}
                ${isGroupAllSelected ? 'checked' : ''}
                onchange="toggleSelectGroup('${pkg.packageId}', this.checked)"
                class="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300 ${groupEligibleCount > 0 ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}"
              />
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200/70 text-slate-700 uppercase tracking-wider">
                  ${pkg.category || 'Gói vé'}
                </span>
                <h4 class="text-xs sm:text-sm font-extrabold text-slate-800">
                  ${pkg.packageName}
                </h4>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <span class="px-2.5 py-1 rounded-lg text-xs font-bold ${
                groupSelectedCount > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
              }">
                Đã chọn <strong class="font-mono">${groupSelectedCount}</strong>/<strong class="font-mono">${groupEligibleCount}</strong> vé
              </span>
              <button
                type="button"
                onclick="toggleAccordionGroup('${pkg.packageId}')"
                class="w-7 h-7 rounded-lg hover:bg-slate-200/70 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                title="${isCollapsed ? 'Mở rộng nhóm' : 'Thu gọn nhóm'}"
              >
                <i class="fa-solid ${isCollapsed ? 'fa-chevron-down' : 'fa-chevron-up'} text-xs"></i>
              </button>
            </div>
          </div>

          <!-- Accordion Content / Table -->
          <div id="accContent_${pkg.packageId}" class="${isCollapsed ? 'hidden' : ''}">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse text-xs">
                <thead>
                  <tr class="bg-slate-50/50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-100">
                    <th class="p-3 w-12 text-center">Chọn</th>
                    <th class="p-3 w-12 text-center">STT</th>
                    <th class="p-3">Mã Serial</th>
                    <th class="p-3">Tên Vé / Hạng Vé</th>
                    <th class="p-3 text-right">Đơn giá</th>
                    <th class="p-3 text-center">Trạng thái vé</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 font-medium">
                  ${rowsHtml}
                </tbody>
              </table>
            </div>

            ${hasDisabledTicketsInGroup ? `
              <div class="p-2.5 px-4 bg-slate-50/90 border-t border-slate-100 text-[11px] text-slate-500 italic flex items-center gap-1.5">
                <i class="fa-solid fa-circle-info text-slate-400 text-[10px]"></i>
                <span>Ghi chú: Vé đã hoàn, đã hủy hoặc đang có yêu cầu hoàn/hủy bị vô hiệu hóa chọn theo quy định.</span>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = groupsHtml || `
      <div class="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs font-semibold">
        Không có vé nào khớp với từ khóa "${searchQuery}"
      </div>
    `;

    // Cập nhật bộ đếm real-time góc trên bên phải: Đã chọn X/Y vé để gửi yêu cầu
    const selCountEl = document.getElementById('countSelectedTickets');
    const eligCountEl = document.getElementById('countEligibleTickets');
    if (selCountEl) selCountEl.textContent = totalSelectedInOrder;
    if (eligCountEl) eligCountEl.textContent = totalEligibleInOrder;

    // Cập nhật thông tin phân trang & hiển thị: Hiển thị A/B Serial
    const displaySerialEl = document.getElementById('displaySerialCountText');
    if (displaySerialEl) {
      displaySerialEl.textContent = `Hiển thị ${totalVisibleSerials}/${totalOrderSerials} Serial`;
    }

    // Cập nhật checkbox "Tất cả vé"
    const chkAll = document.getElementById('chkSelectAllTickets');
    if (chkAll) {
      if (allVisibleEligibleSerials.length > 0) {
        const allSelected = allVisibleEligibleSerials.every(s => selectedTicketSerials.has(s));
        const someSelected = allVisibleEligibleSerials.some(s => selectedTicketSerials.has(s));
        chkAll.checked = allSelected;
        chkAll.indeterminate = someSelected && !allSelected;
        chkAll.disabled = false;
      } else {
        chkAll.checked = false;
        chkAll.indeterminate = false;
        chkAll.disabled = true;
      }
    }

    // Nút điều hướng Bước 1: Tiếp theo chỉ kích hoạt khi có ít nhất 01 vé được chọn (X >= 1)
    const btnNext = document.getElementById('btnStep1Next');
    const noticeNext = document.getElementById('step1NextNotice');
    if (btnNext) {
      if (totalSelectedInOrder >= 1) {
        btnNext.disabled = false;
        if (noticeNext) noticeNext.classList.add('hidden');
      } else {
        btnNext.disabled = true;
        if (noticeNext) noticeNext.classList.remove('hidden');
      }
    }
  }

  // 13.6 CÁC SỰ KIỆN TƯƠNG TÁC CHỌN VÉ BƯỚC 1
  function toggleSelectTicket(serial, checked) {
    if (checked) {
      selectedTicketSerials.add(serial);
    } else {
      selectedTicketSerials.delete(serial);
    }
    renderStep1Tickets(searchTicketsKeyword);
  }

  function toggleSelectGroup(packageId, checked) {
    const order = MOCK_ELIGIBLE_ORDERS.find(o => o.orderId === selectedOrigOrderId);
    if (!order) return;

    const pkg = order.packages.find(p => p.packageId === packageId);
    if (!pkg) return;

    pkg.tickets.forEach(t => {
      if (t.status === 'ELIGIBLE') {
        if (checked) {
          selectedTicketSerials.add(t.serial);
        } else {
          selectedTicketSerials.delete(t.serial);
        }
      }
    });

    renderStep1Tickets(searchTicketsKeyword);
  }

  function toggleSelectAllTickets(checked) {
    const order = MOCK_ELIGIBLE_ORDERS.find(o => o.orderId === selectedOrigOrderId);
    if (!order) return;

    const q = (searchTicketsKeyword || '').toLowerCase().trim();

    order.packages.forEach(pkg => {
      pkg.tickets.forEach(t => {
        const match = !q || (t.serial.toLowerCase().includes(q) || t.name.toLowerCase().includes(q));
        if (match && t.status === 'ELIGIBLE') {
          if (checked) {
            selectedTicketSerials.add(t.serial);
          } else {
            selectedTicketSerials.delete(t.serial);
          }
        }
      });
    });

    renderStep1Tickets(searchTicketsKeyword);
  }

  function toggleAccordionGroup(packageId) {
    if (collapsedAccordionGroups.has(packageId)) {
      collapsedAccordionGroups.delete(packageId);
    } else {
      collapsedAccordionGroups.add(packageId);
    }
    renderStep1Tickets(searchTicketsKeyword);
  }

  function onSearchTicketsInput(val) {
    searchTicketsKeyword = val;
    renderStep1Tickets(searchTicketsKeyword);
  }

  // 13.7 CHUYỂN BƯỚC (STEPPER 1 & 2)
  function goToStep1(skipScroll) {
    const s1Cont = document.getElementById('containerStep1');
    const s2Cont = document.getElementById('containerStep2');
    const s1Ind = document.getElementById('step1Indicator');
    const s2Ind = document.getElementById('step2Indicator');

    if (s1Cont) s1Cont.classList.remove('hidden');
    if (s2Cont) s2Cont.classList.add('hidden');

    if (s1Ind) {
      s1Ind.className = 'flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold transition-all';
      s1Ind.innerHTML = '<span class="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[11px] font-black">1</span><span>Chọn vé trong đơn</span>';
    }
    if (s2Ind) {
      s2Ind.className = 'flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-xs font-bold transition-all';
      s2Ind.innerHTML = '<span class="w-5 h-5 rounded-full bg-slate-300 text-white flex items-center justify-center text-[11px] font-black">2</span><span>Lý do & Biên bản</span>';
    }

    if (!skipScroll) {
      window.scrollTo({ top: 350, behavior: 'smooth' });
    }
  }

  function goToStep2() {
    // BR1 - 003: Bắt buộc chọn ít nhất 01 vé
    if (selectedTicketSerials.size === 0) {
      alert('Vui lòng chọn ít nhất 01 mã vé để chuyển sang Bước 2.');
      return;
    }

    const s1Cont = document.getElementById('containerStep1');
    const s2Cont = document.getElementById('containerStep2');
    const s1Ind = document.getElementById('step1Indicator');
    const s2Ind = document.getElementById('step2Indicator');

    if (s1Cont) s1Cont.classList.add('hidden');
    if (s2Cont) s2Cont.classList.remove('hidden');

    if (s1Ind) {
      s1Ind.className = 'flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold transition-all cursor-pointer';
      s1Ind.innerHTML = '<i class="fa-solid fa-circle-check text-emerald-600 text-xs"></i><span>1. Đã chọn ' + selectedTicketSerials.size + ' vé</span>';
      s1Ind.onclick = () => goToStep1();
    }
    if (s2Ind) {
      s2Ind.className = 'flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold transition-all';
      s2Ind.innerHTML = '<span class="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[11px] font-black">2</span><span>Lý do & Biên bản</span>';
    }

    // Cập nhật dữ liệu vào Biên bản hoàn hủy ở Bước 2
    populatePdfBiBanData();

    // Reset trang PDF về 1
    pdfCurrentPage = 1;
    renderPdfTicketsTable();

    // Kiểm tra validate Bước 2
    onResumeValidationStep2();

    window.scrollTo({ top: 350, behavior: 'smooth' });
  }

  // 13.8 CẬP NHẬT DỮ LIỆU ĐỘNG VÀO BIÊN BẢN HOÀN HỦY VÉ (AUTO-GENERATED PDF)
  function populatePdfBiBanData() {
    const aName = document.getElementById('senderAgencyName')?.value || 'Công ty TNHH Du lịch & Dịch vụ Khám Phá Việt';
    const aCode = document.getElementById('senderAgencyCode')?.value || 'DL-2410-090';
    const sTax = document.getElementById('senderTaxId')?.value || '0318999888';
    const sAddr = document.getElementById('senderAddress')?.value || 'Tầng 6, Bitexco, Q.1, TP.HCM';
    const rName = document.getElementById('senderRequesterName')?.value || 'Trần Hoàng Nam';

    const order = MOCK_ELIGIBLE_ORDERS.find(o => o.orderId === selectedOrigOrderId) || {};

    const pdfDocNum = document.getElementById('pdfDocNumber');
    if (pdfDocNum) pdfDocNum.textContent = `${createRequestCode}/BB-HT`;

    const pdfAgName = document.getElementById('pdfAgencyName');
    if (pdfAgName) pdfAgName.textContent = aName;

    const pdfAgCode = document.getElementById('pdfAgencyCode');
    if (pdfAgCode) pdfAgCode.textContent = aCode;

    const pdfTax = document.getElementById('pdfTaxId');
    if (pdfTax) pdfTax.textContent = sTax;

    const pdfAddress = document.getElementById('pdfAddress');
    if (pdfAddress) pdfAddress.textContent = sAddr;

    const pdfReq = document.getElementById('pdfRequesterName');
    if (pdfReq) pdfReq.textContent = rName;

    const pdfSign = document.getElementById('pdfSignRequester');
    if (pdfSign) pdfSign.textContent = rName;

    const pdfCorp = document.getElementById('pdfCorp');
    if (pdfCorp) pdfCorp.textContent = order.corp || 'Sun World';

    const pdfSite = document.getElementById('pdfSite');
    if (pdfSite) pdfSite.textContent = order.site || 'Sun World Ba Na Hills';

    const pdfOrig = document.getElementById('pdfOrigOrder');
    if (pdfOrig) pdfOrig.textContent = order.orderId || selectedOrigOrderId;

    const pdfSDate = document.getElementById('pdfServiceDate');
    if (pdfSDate) pdfSDate.textContent = order.serviceDate || '2026-11-25';

    const pdfTot = document.getElementById('pdfTotalTicketsCount');
    if (pdfTot) pdfTot.textContent = `${selectedTicketSerials.size} vé`;

    // Cập nhật lý do
    const reasonVal = document.getElementById('createRefundReason')?.value.trim() || '';
    const pdfReason = document.getElementById('pdfReasonText');
    if (pdfReason) {
      pdfReason.textContent = reasonVal || 'Chưa nhập lý do hoàn vé...';
    }
  }

  function onSenderInfoChange() {
    populatePdfBiBanData();
  }

  // 13.9 PHÂN TRANG VÉ TRONG BIÊN BẢN (MẶC ĐỊNH 4 MÃ VÉ / TRANG)
  function getSelectedTicketsList() {
    const order = MOCK_ELIGIBLE_ORDERS.find(o => o.orderId === selectedOrigOrderId);
    if (!order) return [];

    const list = [];
    order.packages.forEach(pkg => {
      pkg.tickets.forEach(t => {
        if (selectedTicketSerials.has(t.serial)) {
          list.push({
            serial: t.serial,
            name: t.name,
            price: t.price,
            packageName: pkg.packageName
          });
        }
      });
    });
    return list;
  }

  function renderPdfTicketsTable() {
    const tbody = document.getElementById('pdfTicketsTableBody');
    if (!tbody) return;

    const tickets = getSelectedTicketsList();
    const totalTickets = tickets.length;
    const totalPages = Math.max(1, Math.ceil(totalTickets / PDF_PAGE_SIZE));

    if (pdfCurrentPage > totalPages) pdfCurrentPage = totalPages;
    if (pdfCurrentPage < 1) pdfCurrentPage = 1;

    const startIndex = (pdfCurrentPage - 1) * PDF_PAGE_SIZE;
    const pageTickets = tickets.slice(startIndex, startIndex + PDF_PAGE_SIZE);

    if (pageTickets.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-slate-400 text-xs">Chưa có vé nào được chọn</td></tr>`;
    } else {
      tbody.innerHTML = pageTickets.map((t, idx) => `
        <tr class="hover:bg-slate-50 transition-colors">
          <td class="p-2.5 text-center font-bold text-xs text-slate-500">${startIndex + idx + 1}</td>
          <td class="p-2.5 font-mono font-bold text-xs text-slate-900">${t.serial}</td>
          <td class="p-2.5 font-semibold text-xs text-slate-800">${t.name}</td>
          <td class="p-2.5 text-right font-mono font-bold text-xs text-slate-700">${t.price.toLocaleString('vi-VN')} đ</td>
          <td class="p-2.5 text-center">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Đề xuất hoàn</span>
          </td>
        </tr>
      `).join('');
    }

    // Cập nhật nút phân trang
    const pInput = document.getElementById('pdfCurrentPageInput');
    const totPagesEl = document.getElementById('pdfTotalPagesCount');
    const btnPrev = document.getElementById('btnPdfPrevPage');
    const btnNext = document.getElementById('btnPdfNextPage');

    if (pInput) pInput.value = pdfCurrentPage;
    if (totPagesEl) totPagesEl.textContent = totalPages;
    if (btnPrev) btnPrev.disabled = (pdfCurrentPage <= 1);
    if (btnNext) btnNext.disabled = (pdfCurrentPage >= totalPages);
  }

  function changePdfTicketPage(delta) {
    const tickets = getSelectedTicketsList();
    const totalPages = Math.max(1, Math.ceil(tickets.length / PDF_PAGE_SIZE));
    pdfCurrentPage += delta;
    if (pdfCurrentPage < 1) pdfCurrentPage = 1;
    if (pdfCurrentPage > totalPages) pdfCurrentPage = totalPages;
    renderPdfTicketsTable();
  }

  function goToPdfTicketPage(pageNum) {
    const page = parseInt(pageNum, 10);
    const tickets = getSelectedTicketsList();
    const totalPages = Math.max(1, Math.ceil(tickets.length / PDF_PAGE_SIZE));
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      pdfCurrentPage = page;
    }
    renderPdfTicketsTable();
  }

  // 13.10 QUẢN LÝ TỆP ĐÍNH KÈM & PREVIEW
  function handleFileUpload(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop().toLowerCase();
      let icon = 'fa-file-lines';
      if (['jpg', 'jpeg', 'png'].includes(ext)) icon = 'fa-file-image';
      if (ext === 'pdf') icon = 'fa-file-pdf';

      const formattedSize = file.size > 1024 * 1024
        ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
        : (file.size / 1024).toFixed(0) + ' KB';

      uploadedFiles.push({
        name: file.name,
        size: formattedSize,
        icon: icon,
        rawFile: file
      });
    }

    renderUploadedFilesList();
    event.target.value = '';
  }

  function renderUploadedFilesList() {
    const container = document.getElementById('uploadedFilesList');
    if (!container) return;

    if (uploadedFiles.length === 0) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = uploadedFiles.map((f, idx) => `
      <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="w-7 h-7 rounded-lg bg-white border border-slate-200 text-rose-600 flex items-center justify-center shrink-0">
            <i class="fa-solid ${f.icon} text-xs"></i>
          </div>
          <div class="min-w-0">
            <p class="font-bold text-slate-800 truncate">${f.name}</p>
            <p class="text-[10px] text-slate-400 font-mono">${f.size}</p>
          </div>
        </div>
        <div class="flex items-center gap-1.5 shrink-0 ml-2">
          <button
            type="button"
            onclick="previewUploadedFile(${idx})"
            class="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 font-semibold text-[11px] transition-colors cursor-pointer"
          >
            <i class="fa-solid fa-eye mr-1 text-[10px]"></i>Xem trước
          </button>
          <button
            type="button"
            onclick="removeUploadedFile(${idx})"
            class="w-7 h-7 rounded-lg text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
            title="Xóa tệp"
          >
            <i class="fa-solid fa-trash-can text-xs"></i>
          </button>
        </div>
      </div>
    `).join('');
  }

  function removeUploadedFile(index) {
    uploadedFiles.splice(index, 1);
    renderUploadedFilesList();
  }

  function previewUploadedFile(index) {
    const file = uploadedFiles[index];
    if (!file) return;

    const modal = document.getElementById('modalPreviewUploadedFile');
    const titleEl = document.getElementById('previewFileTitle');
    const contentEl = document.getElementById('previewFileContent');

    if (titleEl) titleEl.textContent = file.name;
    if (contentEl) {
      contentEl.innerHTML = `
        <div class="p-8 text-center space-y-3">
          <div class="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto text-2xl shadow-xs">
            <i class="fa-solid ${file.icon}"></i>
          </div>
          <h4 class="font-bold text-sm text-slate-800">${file.name}</h4>
          <p class="text-xs text-slate-500 font-mono">Dung lượng: ${file.size}</p>
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 text-left max-w-md mx-auto">
            <p class="font-bold text-slate-700 mb-1">Tài liệu minh chứng hợp lệ:</p>
            <p>Tệp đã được tải lên và sẵn sàng đính kèm vào hồ sơ yêu cầu hoàn vé số <strong>${createRequestCode}</strong>.</p>
          </div>
        </div>
      `;
    }

    if (modal) modal.classList.remove('hidden');
  }

  function closeUploadedFilePreview() {
    const modal = document.getElementById('modalPreviewUploadedFile');
    if (modal) modal.classList.add('hidden');
  }

  // 13.11 TIỆN ÍCH BIÊN BẢN (TOÀN MÀN HÌNH & TẢI VỀ)
  function openFullscreenPdfModal() {
    const modal = document.getElementById('modalFullscreenPdf');
    const docContainer = document.getElementById('fullscreenPdfContent');
    const sourceDoc = document.getElementById('pdfSheetDocument');

    if (modal && docContainer && sourceDoc) {
      docContainer.innerHTML = sourceDoc.outerHTML;
      modal.classList.remove('hidden');
    }
  }

  function closeFullscreenPdfModal() {
    const modal = document.getElementById('modalFullscreenPdf');
    if (modal) modal.classList.add('hidden');
  }

  function downloadGeneratedPdf() {
    if (typeof showToast === 'function') {
      showToast('Đang tải Biên bản', `Đang kết xuất Biên bản hoàn hủy ${createRequestCode}/BB-HT dạng PDF...`);
    } else {
      alert(`Đang kết xuất Biên bản hoàn hủy ${createRequestCode}/BB-HT dạng PDF...`);
    }
    setTimeout(() => {
      window.print();
    }, 400);
  }

  // 13.12 VALIDATION BƯỚC 2 & GỬI YÊU CẦU HOÀN VÉ (BR1-001 ĐẾN BR1-007)
  function onResumeValidationStep2() {
    populatePdfBiBanData();

    const reason = document.getElementById('createRefundReason')?.value.trim() || '';
    const isLegalChecked = document.getElementById('chkLegalConfirmation')?.checked || false;
    const hasTickets = (selectedTicketSerials.size >= 1);

    const submitBtn = document.getElementById('btnSubmitRefundRequest');
    const reasonErr = document.getElementById('reasonErrorMsg');

    if (!reason && reasonErr) {
      // Chỉ cảnh báo nhẹ
    }

    // BR1 - 005: Bắt buộc nhập lý do
    // BR1 - 006: Chỉ enable nút Gửi khi tick checkbox xác nhận
    // BR1 - 003: Phải chọn ít nhất 01 vé
    const isValid = (hasTickets && reason.length > 0 && isLegalChecked);

    if (submitBtn) {
      submitBtn.disabled = !isValid;
    }
  }

  function submitCompleteRefundRequest() {
    // Kiểm tra lại quy tắc
    if (selectedTicketSerials.size === 0) {
      alert('Vui lòng chọn ít nhất 01 vé cần hoàn!');
      goToStep1();
      return;
    }

    const reason = document.getElementById('createRefundReason')?.value.trim();
    if (!reason) {
      alert('Vui lòng nhập lý do gửi yêu cầu hoàn vé!');
      const reasonEl = document.getElementById('createRefundReason');
      if (reasonEl) reasonEl.focus();
      return;
    }

    const isLegalChecked = document.getElementById('chkLegalConfirmation')?.checked;
    if (!isLegalChecked) {
      alert('Vui lòng xác nhận thông tin trong Biên bản hoàn hủy là chính xác trước khi gửi!');
      return;
    }

    const order = MOCK_ELIGIBLE_ORDERS.find(o => o.orderId === selectedOrigOrderId);
    if (!order) return;

    const aName = document.getElementById('senderAgencyName')?.value || 'Công ty TNHH Du lịch & Dịch vụ Khám Phá Việt (Viet Discovery)';
    const aCode = document.getElementById('senderAgencyCode')?.value || 'DL-2410-090';
    const sTax = document.getElementById('senderTaxId')?.value || '0318999888';
    const sAddr = document.getElementById('senderAddress')?.value || 'Tầng 6, Bitexco, Q.1, TP.HCM';
    const rName = document.getElementById('senderRequesterName')?.value || 'Trần Hoàng Nam';
    const sEmail = document.getElementById('senderEmail')?.value || 'nam.tran@vietdiscovery.vn';

    const policy = getPenaltyPolicy(order.serviceDate);

    // Tính toán tài chính cho các vé đã chọn
    let totalOriginal = 0;
    const ticketItems = [];

    order.packages.forEach(pkg => {
      pkg.tickets.forEach(t => {
        if (selectedTicketSerials.has(t.serial)) {
          totalOriginal += t.price;
          const charge = Math.round(t.price * (policy.rate / 100));
          const refund = Math.max(0, t.price - charge);

          ticketItems.push({
            type: pkg.packageName,
            qrCode: t.serial,
            price: t.price,
            charge: charge,
            refund: refund
          });

          // BR1 - 007: Khóa ngay serial vé này thành PENDING_REFUND trong order để chặn tạo trùng
          t.status = 'PENDING_REFUND';
        }
      });
    });

    const totalCharge = Math.round(totalOriginal * (policy.rate / 100));
    const totalRefund = Math.max(0, totalOriginal - totalCharge);

    // Tạo bản ghi mới vào refundDataset
    const newRecord = {
      requestCode: createRequestCode,
      refundOrderCode: `RFD-${createRequestCode.slice(4)}`,
      originalOrderCode: order.orderId,
      serviceDate: order.serviceDate,
      ticketCount: ticketItems.length,
      corp: order.corp,
      site: order.site,
      agency: aName,
      agencyCode: aCode,
      requesterName: rName,
      requesterEmail: sEmail,
      requesterPhone: order.customerPhone || '0903123456',
      taxId: sTax,
      status: 'DOI_TIEP_NHAN', // Ghi nhận vào Tab Đợi tiếp nhận
      subStatus: 'DA_GUI_YEU_CAU',
      createdDate: new Date().toISOString().slice(0, 16).replace('T', ' '),
      assignedTo: null,
      isMyCreated: true, // Phiếu do chính mình tạo (có quyền thu hồi khi chưa tiếp nhận)
      totalOriginalAmount: totalOriginal,
      chargeRate: policy.rate,
      chargeAmount: totalCharge,
      totalRefundAmount: totalRefund,
      reason: reason,
      documents: [
        `Bien-ban-hoan-huy-${createRequestCode}.pdf`,
        ...uploadedFiles.map(f => f.name)
      ],
      tickets: ticketItems
    };

    refundDataset.unshift(newRecord);

    // Đóng Nextpage và chuyển về Danh sách Tab Đợi tiếp nhận
    const createView = document.getElementById('viewCreateRefundRequest');
    const listView = document.getElementById('viewRefundRequestsList');
    if (createView) createView.classList.add('hidden');
    if (listView) listView.classList.remove('hidden');

    // Chuyển sang Tab Đợi tiếp nhận
    switchRefundTab('DOI_TIEP_NHAN');

    // Hiển thị Toast thông báo
    if (typeof showToast === 'function') {
      showToast('Tạo yêu cầu thành công', `Yêu cầu hoàn vé ${createRequestCode} (${ticketItems.length} vé) đã được gửi và chuyển vào Tab Đợi tiếp nhận.`);
    } else {
      alert(`Tạo yêu cầu thành công!
Yêu cầu hoàn vé ${createRequestCode} (${ticketItems.length} vé) đã được gửi và ghi nhận vào Tab Đợi tiếp nhận.`);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    const cSelect = document.getElementById('refundCorpFilter');

    if (sInput) sInput.value = '';
    if (cSelect) cSelect.value = 'ALL';

    filterSearch = '';
    filterAgency = 'ALL';
    filterCorp = 'ALL';
    filterSite = 'ALL';

    const agTxt = document.getElementById('selectedAgencyText');
    if (agTxt) agTxt.textContent = 'Tất cả đại lý';
    const stTxt = document.getElementById('selectedSiteText');
    if (stTxt) stTxt.textContent = 'Tất cả khu du lịch';

    const agSearchInput = document.getElementById('searchAgencyFilterInput');
    if (agSearchInput) agSearchInput.value = '';
    const stSearchInput = document.getElementById('searchSiteFilterInput');
    if (stSearchInput) stSearchInput.value = '';

    filterAgencyOptions('');
    filterSiteOptions('');

    if (datePickerInstance && typeof datePickerInstance.setRange === 'function') {
      datePickerInstance.setRange('2026-11-01', '2026-11-19', 'this_month');
    }
    filterStartDate = '2026-11-01';
    filterEndDate = '2026-11-19';
    filterDatePreset = 'this_month';
    refundCurrentPage = 1;

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
    filterAgencyOptions('');
    filterSiteOptions('');
    setupFilterEventListeners();
    initRefundDateRangePicker();
    renderRefundTable();

    // Override global goBackPage để khi bấm Back luôn trả về đúng danh sách hoàn hủy
    window.goBackPage = function(fallback) {
      const detailView = document.getElementById('viewRefundRequestDetail');
      const createView = document.getElementById('viewCreateRefundRequest');
      const listView = document.getElementById('viewRefundRequestsList');

      if (detailView && !detailView.classList.contains('hidden')) {
        closeRefundDetail();
        return;
      }
      if (createView && !createView.classList.contains('hidden')) {
        closeCreateRefundNextPage();
        return;
      }
      if (window.history.length > 1 && document.referrer && document.referrer.includes(window.location.host)) {
        window.history.back();
      } else {
        window.location.href = fallback || 'index.html';
      }
    };

    // Lắng nghe popstate (nút Back của trình duyệt / mobile)
    window.addEventListener('popstate', (e) => {
      const detailView = document.getElementById('viewRefundRequestDetail');
      const createView = document.getElementById('viewCreateRefundRequest');
      const listView = document.getElementById('viewRefundRequestsList');

      if (detailView && !detailView.classList.contains('hidden')) {
        detailView.classList.add('hidden');
        if (listView) listView.classList.remove('hidden');
        viewingRequestCode = null;
        return;
      }
      if (createView && !createView.classList.contains('hidden')) {
        createView.classList.add('hidden');
        if (listView) listView.classList.remove('hidden');
        return;
      }
    });

    // Đóng dropdown khi click ra ngoài
    document.addEventListener('click', (e) => {
      const agContainer = document.getElementById('agencyDropdownContainer');
      const agMenu = document.getElementById('menuAgencyFilterDropdown');
      if (agContainer && agMenu && !agContainer.contains(e.target)) {
        agMenu.classList.add('hidden');
      }

      const siteContainer = document.getElementById('siteDropdownContainer');
      const siteMenu = document.getElementById('menuSiteFilterDropdown');
      if (siteContainer && siteMenu && !siteContainer.contains(e.target)) {
        siteMenu.classList.add('hidden');
      }

      const origContainer = document.getElementById('origOrderDropdownContainer');
      const origMenu = document.getElementById('menuOrigOrderDropdown');
      if (origContainer && origMenu && !origContainer.contains(e.target)) {
        origMenu.classList.add('hidden');
      }
    });

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
  window.previewDetailDocument = previewDetailDocument;
  window.downloadDetailDocument = downloadDetailDocument;
  window.closeRefundDetail = closeRefundDetail;
  window.resetRefundFilters = resetRefundFilters;
  window.clearAgencyFilter = clearAgencyFilter;
  window.clearSiteFilter = clearSiteFilter;
  window.toggleAgencyFilterDropdown = toggleAgencyFilterDropdown;
  window.filterAgencyOptions = filterAgencyOptions;
  window.selectAgencyFilter = selectAgencyFilter;
  window.toggleSiteFilterDropdown = toggleSiteFilterDropdown;
  window.filterSiteOptions = filterSiteOptions;
  window.selectSiteFilter = selectSiteFilter;
  window.goToRefundPage = goToRefundPage;
  window.changeRefundPageSize = changeRefundPageSize;
  window.openCreateRefundNextPage = openCreateRefundNextPage;
  window.closeCreateRefundNextPage = closeCreateRefundNextPage;
  window.openCreateRefundModal = openCreateRefundModal;
  window.closeCreateRefundModal = closeCreateRefundModal;
  window.toggleOrigOrderDropdown = toggleOrigOrderDropdown;
  window.filterOrigOrdersDropdown = filterOrigOrdersDropdown;
  window.selectOrigOrder = selectOrigOrder;
  window.toggleSelectTicket = toggleSelectTicket;
  window.toggleSelectGroup = toggleSelectGroup;
  window.toggleSelectAllTickets = toggleSelectAllTickets;
  window.toggleAccordionGroup = toggleAccordionGroup;
  window.onSearchTicketsInput = onSearchTicketsInput;
  window.goToStep1 = goToStep1;
  window.goToStep2 = goToStep2;
  window.onSenderInfoChange = onSenderInfoChange;
  window.onResumeValidationStep2 = onResumeValidationStep2;
  window.handleFileUpload = handleFileUpload;
  window.removeUploadedFile = removeUploadedFile;
  window.previewUploadedFile = previewUploadedFile;
  window.closeUploadedFilePreview = closeUploadedFilePreview;
  window.changePdfTicketPage = changePdfTicketPage;
  window.goToPdfTicketPage = goToPdfTicketPage;
  window.openFullscreenPdfModal = openFullscreenPdfModal;
  window.closeFullscreenPdfModal = closeFullscreenPdfModal;
  window.downloadGeneratedPdf = downloadGeneratedPdf;
  window.submitCompleteRefundRequest = submitCompleteRefundRequest;
  window.actionAcceptRequest = actionAcceptRequest;
  window.actionRevokeRequest = actionRevokeRequest;
  window.actionRejectRequest = actionRejectRequest;
  window.actionApproveRefund = actionApproveRefund;
  window.actionConfirmDisbursement = actionConfirmDisbursement;
  window.actionBatchCharge = actionBatchCharge;
  window.closeBatchChargeModal = closeBatchChargeModal;
  window.onBatchChargeTypeChange = onBatchChargeTypeChange;
  window.onToggleSelectAllDetailTickets = onToggleSelectAllDetailTickets;
  window.onDetailTicketCheckboxChange = onDetailTicketCheckboxChange;
  window.confirmApplyBatchCharge = confirmApplyBatchCharge;
  window.actionAttachDocument = actionAttachDocument;
  window.onDetailTicketChargeChange = onDetailTicketChargeChange;
  window.onDetailGroupRefundChange = onDetailGroupRefundChange;
  window.onDetailFinalRefundChange = onDetailFinalRefundChange;
  window.syncDetailTotalsAndCards = syncDetailTotalsAndCards;
  window.openRejectRefundModal = openRejectRefundModal;
  window.closeRejectRefundModal = closeRejectRefundModal;
  window.onRejectReasonSelectChange = onRejectReasonSelectChange;
  window.onRejectFileChosen = onRejectFileChosen;
  window.confirmSubmitRejectRefund = confirmSubmitRejectRefund;
  window.openApproveRefundModal = openApproveRefundModal;
  window.closeApproveRefundModal = closeApproveRefundModal;
  window.onProcessedStatusFilterChange = onProcessedStatusFilterChange;
  window.confirmSubmitApproveRefund = confirmSubmitApproveRefund;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRefundSubsystem);
  } else {
    initRefundSubsystem();
  }
})();
