// ============================================================================
// DATABASE: CASH FLOW COLUMNS CONFIG & RECONCILIATION BUILDER
// ============================================================================

const CASH_FLOW_COLUMNS_CONFIG = [
  { id: 'orderCode', label: 'Mã đơn hàng', defaultVisible: true },
  { id: 'txCode', label: 'Mã giao dịch', defaultVisible: true },
  { id: 'beneficiary', label: 'Người thụ hưởng & Mã ĐL', defaultVisible: true },
  { id: 'group', label: 'Nhóm Thu/Chi', defaultVisible: true },
  { id: 'type', label: 'Loại', defaultVisible: true },
  { id: 'paymentMethod', label: 'Phương thức thanh toán', defaultVisible: true },
  { id: 'status', label: 'Trạng thái', defaultVisible: true },
  { id: 'createdDate', label: 'Thời gian tạo', defaultVisible: true },
  { id: 'updatedDate', label: 'Cập nhật', defaultVisible: true },
  { id: 'amount', label: 'Tổng thanh toán', defaultVisible: true },
  { id: 'channel', label: 'Kênh bán', defaultVisible: false },
  { id: 'subType', label: 'Loại theo kênh', defaultVisible: false },
  { id: 'listedPrice', label: 'Tổng giá niêm yết', defaultVisible: false },
  { id: 'discountAmount', label: 'Tổng giá giảm (Voucher)', defaultVisible: false },
  { id: 'commissionAmount', label: 'Tổng hoa hồng', defaultVisible: false },
  { id: 'costAmount', label: 'Tổng giá nhập', defaultVisible: false },
  { id: 'netProfit', label: 'Lợi nhuận thuần', defaultVisible: false }
];

const CASH_FLOW_ORDER_COLUMNS_CONFIG = [
  { id: 'orderCode', label: 'Mã đơn hàng', defaultVisible: true },
  { id: 'beneficiary', label: 'Người thụ hưởng & Mã ĐL', defaultVisible: true },
  { id: 'expectedRevenue', label: 'Dự kiến thu', defaultVisible: true },
  { id: 'expectedCost', label: 'Dự kiến chi', defaultVisible: true },
  { id: 'actualRevenue', label: 'Tổng thu thực tế', defaultVisible: true },
  { id: 'actualCost', label: 'Tổng chi thực tế', defaultVisible: true },
  { id: 'createdDate', label: 'Thời gian tạo đơn', defaultVisible: true },
  { id: 'updatedDate', label: 'Cập nhật', defaultVisible: true },
  { id: 'listedPrice', label: 'Tổng giá niêm yết', defaultVisible: false },
  { id: 'discountAmount', label: 'Tổng giá giảm', defaultVisible: false },
  { id: 'commissionAmount', label: 'Tổng hoa hồng', defaultVisible: false },
  { id: 'costAmount', label: 'Tổng giá nhập', defaultVisible: false },
  { id: 'netProfit', label: 'Lợi nhuận thuần', defaultVisible: false }
];

const DEFAULT_CASH_FLOW_CATEGORIES = [
  // Thu
  { id: 'CAT-THU-01', group: 'Thu', code: 'TOPUP_DL', name: 'Thu TOPUP Đại lý', description: 'Nạp tiền vào ví điện tử đại lý B2B', status: 'ACTIVE' },
  { id: 'CAT-THU-02', group: 'Thu', code: 'THU_BAN_VE', name: 'Thu bán vé', description: 'Doanh thu bán vé trực tiếp hoặc qua đại lý', status: 'ACTIVE' },
  { id: 'CAT-THU-03', group: 'Thu', code: 'THU_COC', name: 'Thu tiền cọc', description: 'Đặt cọc giữ chỗ combo/dịch vụ đoàn', status: 'ACTIVE' },
  { id: 'CAT-THU-04', group: 'Thu', code: 'THU_TAP_DOAN', name: 'Thu từ Tập đoàn', description: 'Thưởng doanh số, chiết khấu hoàn từ Sun/Vin/Nova', status: 'ACTIVE' },
  { id: 'CAT-THU-05', group: 'Thu', code: 'THU_KH_LE', name: 'Thu Khách lẻ', description: 'Thu tiền bán lẻ trực tuyến hoặc tại quầy', status: 'ACTIVE' },
  { id: 'CAT-THU-06', group: 'Thu', code: 'THU_CONG_NO', name: 'Thanh toán công nợ', description: 'Đại lý thanh toán công nợ định kỳ theo hợp đồng', status: 'ACTIVE' },

  // Chi
  { id: 'CAT-CHI-01', group: 'Chi', code: 'TOPUP_CORP', name: 'Chi TOPUP Tập đoàn', description: 'Ký quỹ / Topup tài khoản Sun, Vin, Nova', status: 'ACTIVE' },
  { id: 'CAT-CHI-02', group: 'Chi', code: 'CHI_VON_VE', name: 'Chi giá vốn nhập vé', description: 'Thanh toán chi phí nhập vé cho nhà cung cấp/tập đoàn', status: 'ACTIVE' },
  { id: 'CAT-CHI-03', group: 'Chi', code: 'CHI_HOAN_DL', name: 'Chi hoàn Đại lý', description: 'Hoàn tiền vé hoặc rút số dư ví đại lý', status: 'ACTIVE' },
  { id: 'CAT-CHI-04', group: 'Chi', code: 'CHI_HOAN_VE', name: 'Chi hoàn vé', description: 'Hoàn tiền cho khách hàng khi hủy vé', status: 'ACTIVE' },
  { id: 'CAT-CHI-05', group: 'Chi', code: 'CHI_HOA_HONG', name: 'Chi hoa hồng đại lý', description: 'Thanh toán hoa hồng cho đại lý cấp 1, cấp 2, OTA', status: 'ACTIVE' },
  { id: 'CAT-CHI-06', group: 'Chi', code: 'CHI_KOL_CTV', name: 'Chi KOLs / CTV', description: 'Chi phí tiếp thị liên kết, hoa hồng cho KOLs, CTV', status: 'ACTIVE' },
  { id: 'CAT-CHI-07', group: 'Chi', code: 'CHI_VOUCHER', name: 'Chi Voucher', description: 'Chi phí tài trợ khuyến mãi, Voucher giảm giá', status: 'ACTIVE' },
  { id: 'CAT-CHI-08', group: 'Chi', code: 'CHI_CONG_TT', name: 'Chi phí cổng thanh toán', description: 'Phí dịch vụ cổng thanh toán VNPAY, VietQR', status: 'ACTIVE' },
  { id: 'CAT-CHI-09', group: 'Chi', code: 'CHI_KH_LE', name: 'Chi Khách lẻ', description: 'Chi bồi hoàn hoặc hỗ trợ phát sinh cho khách lẻ', status: 'ACTIVE' }
];

const EXTRA_HISTORICAL_CASHFLOW_ORDERS = [
  // Tháng 11/2026 (Ngày hiện tại 18/11/2026 & các ngày trong tháng)
  { d: '2026-11-18', c: 'Đại lý', st: 'Đại lý cấp 1', s: 'Sun World Ba Na Hills', rev: 48500000, profit: 5820000, stat: 'Đã xuất vé' },
  { d: '2026-11-18', c: 'Website', st: 'Khách lẻ (B2C)', s: 'VinWonders Phú Quốc', rev: 7200000, profit: 950000, stat: 'Đã xuất vé' },
  { d: '2026-11-18', c: 'Đại lý', st: 'OTA', s: 'NovaWorld Phan Thiết', rev: 22400000, profit: 2680000, stat: 'Đã xuất vé' },
  { d: '2026-11-18', c: 'Nội bộ', st: 'Nhân viên kinh doanh', s: 'Sun World Fansipan', rev: 14500000, profit: 1740000, stat: 'Đang xử lý' },
  { d: '2026-11-17', c: 'Đại lý', st: 'Đại lý cấp 2', s: 'VinWonders Nha Trang', rev: 26800000, profit: 3210000, stat: 'Đã xuất vé' },
  { d: '2026-11-17', c: 'Website', st: 'Khách lẻ (B2C)', s: 'Sun World Hon Thom', rev: 5600000, profit: 780000, stat: 'Đã xuất vé' },
  { d: '2026-11-17', c: 'Đại lý', st: 'Đại lý cấp 1', s: 'VinWonders Nam Hội An', rev: 33400000, profit: 4000000, stat: 'Đã xuất vé' },
  { d: '2026-11-16', c: 'Đại lý', st: 'OTA', s: 'Sun World Bà Đen Mountain', rev: 18200000, profit: 2180000, stat: 'Đã xuất vé' },
  { d: '2026-11-16', c: 'Nội bộ', st: 'Nhân viên kinh doanh', s: 'Sun World Ba Na Hills', rev: 12000000, profit: 1440000, stat: 'Đang xử lý' },
  { d: '2026-11-15', c: 'Đại lý', st: 'Đại lý cấp 1', s: 'Sun World Hạ Long', rev: 31500000, profit: 3780000, stat: 'Đã xuất vé' },
  { d: '2026-11-15', c: 'Website', st: 'Khách lẻ (B2C)', s: 'Công viên Nước Đầm Sen', rev: 3400000, profit: 510000, stat: 'Đã xuất vé' },
  { d: '2026-11-14', c: 'Đại lý', st: 'OTA', s: 'VinWonders Phú Quốc', rev: 45000000, profit: 5400000, stat: 'Đã xuất vé' },
  { d: '2026-11-14', c: 'Đại lý', st: 'Đại lý cấp 2', s: 'Sun World Fansipan', rev: 19800000, profit: 2370000, stat: 'Hoàn tiền' },
  { d: '2026-11-13', c: 'Đại lý', st: 'Đại lý cấp 1', s: 'Sun World Ba Na Hills', rev: 58000000, profit: 6960000, stat: 'Đã xuất vé' },
  { d: '2026-11-12', c: 'Website', st: 'Khách lẻ (B2C)', s: 'VinWonders Nha Trang', rev: 8400000, profit: 1100000, stat: 'Đã xuất vé' },
  { d: '2026-11-11', c: 'Nội bộ', st: 'Nhân viên kinh doanh', s: 'NovaWorld Phan Thiết', rev: 16500000, profit: 1980000, stat: 'Đã xuất vé' },
  { d: '2026-11-10', c: 'Đại lý', st: 'OTA', s: 'Sun World Hon Thom', rev: 32000000, profit: 3840000, stat: 'Đã xuất vé' },
  { d: '2026-11-09', c: 'Đại lý', st: 'Đại lý cấp 1', s: 'VinWonders Nam Hội An', rev: 39500000, profit: 4740000, stat: 'Đã xuất vé' },
  { d: '2026-11-08', c: 'Website', st: 'Khách lẻ (B2C)', s: 'Khu du lịch Suối Tiên', rev: 4200000, profit: 630000, stat: 'Đã xuất vé' },
  { d: '2026-11-07', c: 'Đại lý', st: 'Đại lý cấp 2', s: 'Sun World Bà Đen Mountain', rev: 21500000, profit: 2580000, stat: 'Đã xuất vé' },
  { d: '2026-11-06', c: 'Đại lý', st: 'OTA', s: 'Sun World Ba Na Hills', rev: 52000000, profit: 6240000, stat: 'Đã xuất vé' },
  { d: '2026-11-05', c: 'Nội bộ', st: 'Nhân viên kinh doanh', s: 'VinWonders Phú Quốc', rev: 13500000, profit: 1620000, stat: 'Đang xử lý' },
  { d: '2026-11-04', c: 'Đại lý', st: 'Đại lý cấp 1', s: 'Sun World Fansipan', rev: 36000000, profit: 4320000, stat: 'Đã xuất vé' },
  { d: '2026-11-03', c: 'Website', st: 'Khách lẻ (B2C)', s: 'VinWonders Nha Trang', rev: 7100000, profit: 920000, stat: 'Đã xuất vé' },
  { d: '2026-11-02', c: 'Đại lý', st: 'OTA', s: 'NovaWorld Phan Thiết', rev: 24800000, profit: 2970000, stat: 'Đã xuất vé' },
  { d: '2026-11-01', c: 'Đại lý', st: 'Đại lý cấp 1', s: 'Sun World Ba Na Hills', rev: 66000000, profit: 7920000, stat: 'Đã xuất vé' },

  // Dữ liệu kiểm thử lịch sử các quý và các năm trước
  { d: '2026-02-14', c: 'Đại lý', st: 'Đại lý cấp 1', s: 'Sun World Ba Na Hills', rev: 45000000, profit: 5400000, stat: 'Đã xuất vé', q: 'Q1' },
  { d: '2026-03-20', c: 'Website', st: 'Khách lẻ (B2C)', s: 'VinWonders Phú Quốc', rev: 6800000, profit: 880000, stat: 'Đã xuất vé', q: 'Q1' },
  { d: '2026-05-18', c: 'Đại lý', st: 'OTA', s: 'Sun World Fansipan', rev: 28500000, profit: 3400000, stat: 'Đã xuất vé', q: 'Q2' },
  { d: '2026-06-25', c: 'Nội bộ', st: 'Nhân viên kinh doanh', s: 'VinWonders Nha Trang', rev: 14200000, profit: 1700000, stat: 'Đã xuất vé', q: 'Q2' },
  { d: '2026-08-15', c: 'Đại lý', st: 'Đại lý cấp 2', s: 'Sun World Hạ Long', rev: 19600000, profit: 2350000, stat: 'Đã xuất vé', q: 'Q3' },
  { d: '2026-09-02', c: 'Website', st: 'Khách lẻ (B2C)', s: 'Công viên Nước Đầm Sen', rev: 3200000, profit: 450000, stat: 'Đã xuất vé', q: 'Q3' },
  { d: '2025-11-15', c: 'Đại lý', st: 'Đại lý cấp 1', s: 'Sun World Ba Na Hills', rev: 52000000, profit: 6240000, stat: 'Đã xuất vé', y: '2025' },
  { d: '2025-07-20', c: 'Website', st: 'Khách lẻ (B2C)', s: 'VinWonders Phú Quốc', rev: 8900000, profit: 1100000, stat: 'Đã xuất vé', y: '2025' },
  { d: '2024-08-10', c: 'Đại lý', st: 'OTA', s: 'Sun World Fansipan', rev: 41000000, profit: 4920000, stat: 'Đã xuất vé', y: '2024' },
  { d: '2023-10-05', c: 'Website', st: 'Khách lẻ (B2C)', s: 'VinWonders Nha Trang', rev: 5600000, profit: 720000, stat: 'Đã xuất vé', y: '2023' },
  { d: '2022-12-18', c: 'Đại lý', st: 'Đại lý cấp 1', s: 'Sun World Ba Na Hills', rev: 38000000, profit: 4560000, stat: 'Đã xuất vé', y: '2022' }
];

function buildCashFlowRecordsFromOrders(ordersList, invoiceOverrides = {}) {
  const dataset = [];
  const ordersMap = {};
  let txSeq = 1001;

  const baseOrders = Array.isArray(ordersList) ? ordersList : [];
  const extendedOrders = [...baseOrders];

  EXTRA_HISTORICAL_CASHFLOW_ORDERS.forEach((ex, idx) => {
    extendedOrders.push({
      orderCode: `ORD-HIST-${ex.d.slice(2, 4)}${ex.d.slice(5, 7)}-${String(idx + 1).padStart(3, '0')}`,
      createdDate: ex.d,
      useDate: ex.d,
      customerName: ex.c === 'Đại lý' ? `Công ty Lữ hành Saigontourist #${idx + 1}` : (ex.c === 'Website' ? `Khách hàng Lê Quốc ${String.fromCharCode(65 + idx)}` : `NVKD Techera ${idx + 1}`),
      customerPhone: `090${idx} 888 777`,
      customerEmail: `order.${idx}@traveltech.vn`,
      channel: ex.c,
      subType: ex.st,
      staff: 'Techera Ops',
      salesOwner: 'Admin Techera',
      corp: ex.s.includes('Sun World') ? 'Sun World' : (ex.s.includes('VinWonders') ? 'VinWonders' : 'Khác'),
      site: ex.s,
      packageName: `Combo Vé Tham Quan & Cáp Treo - ${ex.s}`,
      tickets: Math.max(2, Math.round(ex.rev / 850000)),
      revenue: ex.rev,
      netCost: ex.rev - ex.profit,
      profit: ex.profit,
      status: ex.stat
    });
  });

  extendedOrders.forEach((o, oIdx) => {
    const orderCode = o.orderCode || `ORD-2611-${String(oIdx + 1).padStart(3, '0')}`;
    const revenue = Number(o.revenue) || 1500000;
    const netCost = Number(o.netCost) || Math.round(revenue * 0.85);
    const profit = Number(o.profit) || Math.round(revenue * 0.15);
    const listedPrice = Math.round(revenue * 1.08);
    const discountAmount = Math.max(0, listedPrice - revenue);
    const commissionAmount = Math.round(revenue * 0.05);
    const paymentFee = Math.round(revenue * 0.012);
    const netProfit = Math.max(0, profit - commissionAmount - paymentFee);

    let channel = 'Đại lý';
    if (o.channel) {
      if (o.channel.includes('Website') || o.channel.includes('B2C')) channel = 'Website';
      else if (o.channel.includes('Nội bộ') || o.channel.includes('Sale')) channel = 'Nội bộ';
      else channel = 'Đại lý';
    }

    let subType = 'Khách lẻ (B2C)';
    if (channel === 'Đại lý') {
      subType = (oIdx % 3 === 0) ? 'Đại lý cấp 1' : ((oIdx % 3 === 1) ? 'Đại lý cấp 2' : 'OTA');
    } else if (channel === 'Nội bộ') {
      subType = 'Nhân viên kinh doanh';
    }

    const dateStr = o.createdDate || '2026-11-18';
    const createdDate = `${dateStr} ${String(8 + (oIdx % 10)).padStart(2, '0')}:${String(10 + (oIdx % 45)).padStart(2, '0')}`;
    const updatedDate = `${dateStr} ${String(14 + (oIdx % 8)).padStart(2, '0')}:${String(15 + (oIdx % 40)).padStart(2, '0')}`;

    const isInvoiceIssuedDefault = (oIdx % 6 !== 0) && (o.status !== 'Nháp' && o.status !== 'Đang xử lý' && o.status !== 'Đợi thanh toán');
    let invoiceStatus = isInvoiceIssuedDefault ? 'Đã xuất' : 'Chưa xuất';
    let invoiceCode = isInvoiceIssuedDefault ? `HD-26${dateStr.slice(5, 7)}-${String(1000 + oIdx)}` : '';
    let invoiceDate = isInvoiceIssuedDefault ? dateStr : '';

    if (invoiceOverrides && invoiceOverrides[orderCode]) {
      const ov = invoiceOverrides[orderCode];
      invoiceStatus = ov.invoiceStatus || invoiceStatus;
      invoiceCode = ov.invoiceCode !== undefined ? ov.invoiceCode : invoiceCode;
      invoiceDate = ov.invoiceDate !== undefined ? ov.invoiceDate : invoiceDate;
    }

    const agencyCode = (channel === 'Đại lý')
      ? `DL-${String((oIdx % 25) + 1).padStart(2, '0')}`
      : ((channel === 'Website') ? 'KH-LE' : `NB-${String((oIdx % 10) + 1).padStart(2, '0')}`);

    const custName = o.customerName || (channel === 'Đại lý' ? `Đại lý Du lịch ${o.staff || 'Việt Nam'}` : 'Khách lẻ Techera');
    const custPhone = o.customerPhone || `0912 ${String(100 + (oIdx % 900))} ${String(100 + (oIdx % 900))}`;
    const custEmail = o.customerEmail || `booking.${oIdx + 1}@techera.vn`;
    const paymentMethod = o.paymentMethod || ((oIdx % 3 === 0) ? 'Ví điện tử' : ((oIdx % 3 === 1) ? 'Chuyển khoản QR' : 'Cổng VNPAY'));

    const isPending = (o.status === 'Đang xử lý' || o.status === 'Nháp' || o.status === 'Đợi thanh toán');
    const isFailed = (o.status === 'Đã hủy');
    const isSuccess = (!isPending && !isFailed);

    const orderObj = {
      orderCode,
      source: (channel === 'Đại lý' ? 'Đại lý B2B' : (channel === 'Website' ? 'Website Booking' : 'Nội bộ Techera')),
      orderType: o.packageName || (o.site ? `Vé tham quan ${o.site}` : 'Combo Cáp treo & Buffet'),
      customerName: custName,
      customerEmail: custEmail,
      customerPhone: custPhone,
      channel,
      subType,
      expectedRevenue: isPending ? revenue : 0,
      expectedCost: isPending ? netCost : 0,
      actualRevenue: isSuccess ? revenue : 0,
      actualCost: isSuccess ? (netCost + commissionAmount + paymentFee) : 0,
      createdDate,
      updatedDate,
      orderStatus: o.status || 'Đã xuất vé',
      invoiceStatus,
      invoiceCode,
      invoiceDate,
      listedPrice,
      discountAmount,
      commissionAmount,
      costAmount: netCost,
      netProfit,
      paymentMethod,
      agencyCode,
      site: o.site || 'Khu vui chơi',
      corp: o.corp || 'Sun World'
    };

    ordersMap[orderCode] = orderObj;

    // 1. Khoản Thu
    dataset.push({
      txCode: `TX-THU-26${dateStr.slice(5, 7)}-${String(txSeq++).padStart(5, '0')}`,
      orderCode,
      beneficiaryName: custName,
      agencyCode,
      group: 'Thu',
      type: isPending ? 'Thu tiền cọc' : 'Thu bán vé',
      paymentMethod,
      status: isSuccess ? 'Thành công' : (isPending ? 'Chờ xử lý' : 'Thất bại'),
      createdDate,
      updatedDate,
      channel,
      subType,
      amount: revenue,
      listedPrice,
      discountAmount,
      commissionAmount,
      costAmount: netCost,
      netProfit,
      invoiceStatus,
      invoiceCode,
      invoiceDate
    });

    // 2. Chi giá vốn
    dataset.push({
      txCode: `TX-VON-26${dateStr.slice(5, 7)}-${String(txSeq++).padStart(5, '0')}`,
      orderCode,
      beneficiaryName: `${orderObj.corp} (${orderObj.site})`,
      agencyCode: `NCC-${String((oIdx % 6) + 1).padStart(2, '0')}`,
      group: 'Chi',
      type: 'Chi giá vốn nhập vé',
      paymentMethod: 'Ủy nhiệm chi ngân hàng',
      status: isSuccess ? 'Thành công' : (isPending ? 'Chờ xử lý' : 'Thất bại'),
      createdDate,
      updatedDate,
      channel,
      subType,
      amount: -netCost,
      listedPrice,
      discountAmount,
      commissionAmount,
      costAmount: netCost,
      netProfit,
      invoiceStatus,
      invoiceCode,
      invoiceDate
    });

    // 3. Chi hoa hồng
    if (channel === 'Đại lý' || channel === 'Nội bộ') {
      dataset.push({
        txCode: `TX-HH-26${dateStr.slice(5, 7)}-${String(txSeq++).padStart(5, '0')}`,
        orderCode,
        beneficiaryName: custName,
        agencyCode,
        group: 'Chi',
        type: 'Chi hoa hồng đại lý',
        paymentMethod: 'Ví điện tử đại lý',
        status: isSuccess ? 'Thành công' : (isPending ? 'Chờ xử lý' : 'Thất bại'),
        createdDate,
        updatedDate,
        channel,
        subType,
        amount: -commissionAmount,
        listedPrice,
        discountAmount,
        commissionAmount,
        costAmount: netCost,
        netProfit,
        invoiceStatus,
        invoiceCode,
        invoiceDate
      });
    }

    // 4. Chi phí cổng thanh toán
    dataset.push({
      txCode: `TX-PHI-26${dateStr.slice(5, 7)}-${String(txSeq++).padStart(5, '0')}`,
      orderCode,
      beneficiaryName: 'Cổng thanh toán VNPAY / VietQR',
      agencyCode: 'GATEWAY-01',
      group: 'Chi',
      type: 'Chi phí cổng thanh toán',
      paymentMethod: 'Khấu trừ tự động',
      status: isSuccess ? 'Thành công' : 'Thất bại',
      createdDate,
      updatedDate,
      channel,
      subType,
      amount: -paymentFee,
      listedPrice,
      discountAmount,
      commissionAmount,
      costAmount: netCost,
      netProfit,
      invoiceStatus,
      invoiceCode,
      invoiceDate
    });

    // 5. Chi hoàn vé
    if (o.status === 'Hoàn tiền' || o.status === 'Đã hủy') {
      dataset.push({
        txCode: `TX-HOAN-26${dateStr.slice(5, 7)}-${String(txSeq++).padStart(5, '0')}`,
        orderCode,
        beneficiaryName: custName,
        agencyCode,
        group: 'Chi',
        type: 'Chi hoàn vé',
        paymentMethod: 'Chuyển khoản hoàn tiền',
        status: 'Thành công',
        createdDate,
        updatedDate,
        channel,
        subType,
        amount: -revenue,
        listedPrice,
        discountAmount,
        commissionAmount,
        costAmount: netCost,
        netProfit: -revenue,
        invoiceStatus: 'Chưa xuất',
        invoiceCode: '',
        invoiceDate: ''
      });
    }
  });

  return { dataset, ordersMap };
}

// Xuất ra window cho các module và trang sử dụng độc lập
if (typeof window !== 'undefined') {
  window.CASH_FLOW_COLUMNS_CONFIG = CASH_FLOW_COLUMNS_CONFIG;
  window.CASH_FLOW_ORDER_COLUMNS_CONFIG = CASH_FLOW_ORDER_COLUMNS_CONFIG;
  window.DEFAULT_CASH_FLOW_CATEGORIES = DEFAULT_CASH_FLOW_CATEGORIES;
  window.EXTRA_HISTORICAL_CASHFLOW_ORDERS = EXTRA_HISTORICAL_CASHFLOW_ORDERS;
  window.DEFAULT_CASH_FLOW_ORDERS_SEED = EXTRA_HISTORICAL_CASHFLOW_ORDERS;
  window.buildCashFlowRecordsFromOrders = buildCashFlowRecordsFromOrders;
}
