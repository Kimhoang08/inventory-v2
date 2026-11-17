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
  { id: 'channel', label: 'Kênh bán', defaultVisible: false },
  { id: 'subType', label: 'Loại theo kênh', defaultVisible: false },
  { id: 'amount', label: 'Tổng thanh toán', defaultVisible: false },
  { id: 'listedPrice', label: 'Tổng giá niêm yết', defaultVisible: false },
  { id: 'discountAmount', label: 'Tổng giá giảm (Voucher)', defaultVisible: false },
  { id: 'commissionAmount', label: 'Tổng hoa hồng', defaultVisible: false },
  { id: 'costAmount', label: 'Tổng giá nhập', defaultVisible: false },
  { id: 'netProfit', label: 'Lợi nhuận thuần', defaultVisible: false }
];

const EXTRA_HISTORICAL_CASHFLOW_ORDERS = [
  { d: '2026-02-14', c: 'Đại lý', st: 'Đại lý cấp 1', s: 'Sun World Ba Na Hills', rev: 45000000, profit: 5400000, stat: 'Đã xuất vé' },
  { d: '2026-03-20', c: 'Website', st: 'Khách lẻ (B2C)', s: 'VinWonders Phú Quốc', rev: 6800000, profit: 880000, stat: 'Đã xuất vé' },
  { d: '2026-05-18', c: 'Đại lý', st: 'OTA', s: 'Sun World Fansipan', rev: 28500000, profit: 3400000, stat: 'Đã xuất vé' },
  { d: '2026-06-25', c: 'Nội bộ', st: 'Nhân viên kinh doanh', s: 'VinWonders Nha Trang', rev: 14200000, profit: 1700000, stat: 'Đã xuất vé' },
  { d: '2026-08-15', c: 'Đại lý', st: 'Đại lý cấp 2', s: 'Sun World Hạ Long', rev: 19600000, profit: 2350000, stat: 'Đã xuất vé' },
  { d: '2026-09-02', c: 'Website', st: 'Khách lẻ (B2C)', s: 'Công viên Nước Đầm Sen', rev: 3200000, profit: 450000, stat: 'Đã xuất vé' },
  { d: '2025-11-15', c: 'Đại lý', st: 'Đại lý cấp 1', s: 'Sun World Ba Na Hills', rev: 52000000, profit: 6240000, stat: 'Đã xuất vé' },
  { d: '2025-07-20', c: 'Website', st: 'Khách lẻ (B2C)', s: 'VinWonders Phú Quốc', rev: 8900000, profit: 1100000, stat: 'Đã xuất vé' },
  { d: '2024-08-10', c: 'Đại lý', st: 'OTA', s: 'Sun World Fansipan', rev: 41000000, profit: 4920000, stat: 'Đã xuất vé' },
  { d: '2023-10-05', c: 'Website', st: 'Khách lẻ (B2C)', s: 'VinWonders Nha Trang', rev: 5600000, profit: 720000, stat: 'Đã xuất vé' },
  { d: '2022-12-18', c: 'Đại lý', st: 'Đại lý cấp 1', s: 'Sun World Ba Na Hills', rev: 38000000, profit: 4560000, stat: 'Đã xuất vé' }
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

    const dateStr = o.createdDate || '2026-11-10';
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
