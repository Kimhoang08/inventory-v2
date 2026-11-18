// ============================================================================
// DATABASE: ORDERS, STAFF DIRECTORY, AGENCIES & WALLETS
// ============================================================================

const REPORT_TODAY = '2026-11-18';

const REPORT_CHANNEL_SUBTYPES = {
  'ALL': [{ value: 'ALL', label: 'Tất cả loại' }],
  'Website': [
    { value: 'ALL', label: 'Tất cả loại' },
    { value: 'Booking', label: 'Booking' },
    { value: 'App', label: 'App' },
    { value: 'CTV', label: 'CTV' }
  ],
  'Đại lý (TA)': [
    { value: '-', label: '-' }
  ],
  'Nội bộ': [
    { value: 'ALL', label: 'Tất cả loại' },
    { value: 'Sale', label: 'Sale' },
    { value: 'M.A', label: 'M.A' }
  ]
};

const REPORT_STAFF_DIRECTORY = {
  Sale: [
    'Nguyễn Văn An (Sale)',
    'Trần Thị Mai (Sale)',
    'Lê Quốc Bảo (Sale)',
    'Phạm Minh Tuấn (Sale)',
    'Hoàng Thảo Linh (Sale)'
  ],
  TA: [
    'CONG TY TNHH DVDL BA MIEN HCM',
    'DU LỊCH VIỆT HOLIDAY',
    'SAIGON TOURIST PRO',
    'VIETRAVEL B2B',
    'BEN THANH TOURIST B2B',
    'FIDITOUR TRAVEL',
    'DAT VIET TOUR',
    'TST TOURIST PRO',
    'HANOI RED TOURS',
    'PHÚ QUỐC SUNSHINE TOURS'
  ],
  CTV: [
    'CTV Minh Anh',
    'CTV Hoàng Nam',
    'KOL Thảo Vy',
    'CTV Bảo Trâm',
    'CTV Gia Huy',
    'KOL Khánh Linh',
    'CTV Tuấn Kiệt',
    'CTV Ngọc Hân',
    'KOL Quang Vinh',
    'CTV Thanh Trúc',
    'CTV Đức Thịnh',
    'KOL Phương Anh',
    'CTV Hải Yến',
    'CTV Trọng Tấn',
    'KOL Bích Ngọc',
    'CTV Nhật Minh',
    'CTV Lan Phương',
    'KOL Duy Khánh',
    'CTV Mỹ Duyên',
    'CTV Thành Đạt'
  ]
};

const SALES_ASSIGNMENTS_DIRECTORY = {};
REPORT_STAFF_DIRECTORY.TA.forEach((taName, idx) => {
  SALES_ASSIGNMENTS_DIRECTORY[taName] = REPORT_STAFF_DIRECTORY.Sale[Math.floor(idx / 2)];
});
REPORT_STAFF_DIRECTORY.CTV.forEach((ctvName, idx) => {
  SALES_ASSIGNMENTS_DIRECTORY[ctvName] = REPORT_STAFF_DIRECTORY.Sale[Math.floor(idx / 4)];
});
REPORT_STAFF_DIRECTORY.Sale.forEach(sName => {
  SALES_ASSIGNMENTS_DIRECTORY[sName] = sName;
});

const REPORT_CORP_SITES = {
  'Sun World': [
    'Sun World Ba Na Hills',
    'Sun World Bà Đen Mountain',
    'Sun World Hon Thom',
    'Sun World Hạ Long',
    'Sun World Fansipan Legend'
  ],
  'VinWonders': [
    'VinWonders Phú Quốc',
    'VinWonders Nha Trang',
    'VinWonders Nam Hội An',
    'VinWonders Grand World'
  ],
  'Khác': [
    'Công viên Nước Đầm Sen',
    'Khu du lịch Suối Tiên'
  ]
};

const agencyWalletsDataset = REPORT_STAFF_DIRECTORY.TA.map((name, idx) => ({
  code: `DL-${String(idx + 1).padStart(3, '0')}`,
  name,
  salesOwner: SALES_ASSIGNMENTS_DIRECTORY[name],
  balance: 25000000 + ((idx * 9750000) % 55000000),
  debtUsed: 60000000 + ((idx * 42500000) % 280000000),
  debtLimit: 800000000,
  status: 'Hoạt động'
}));

function _parseIsoDateSeed(iso) {
  const [y, m, d] = (iso || REPORT_TODAY).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function _toIsoDateSeed(dt) {
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function generateMockOrdersDataset(customersList) {
  const customers = (Array.isArray(customersList) && customersList.length > 0)
    ? customersList
    : (typeof CRM_CUSTOMERS_SEED !== 'undefined' ? CRM_CUSTOMERS_SEED : []);

  const siteCatalog = [
    { corp: 'Sun World', site: 'Sun World Ba Na Hills', pkg: 'CB Cáp Treo & Buffet Trưa 4Seasons', avgPrice: 950000, marginRate: 0.145 },
    { corp: 'Sun World', site: 'Sun World Bà Đen Mountain', pkg: 'CB Cáp Đỉnh Vân Sơn & Chùa Hang', avgPrice: 650000, marginRate: 0.14 },
    { corp: 'Sun World', site: 'Sun World Hon Thom', pkg: 'Cáp Treo Hòn Thơm & Công Viên Nước', avgPrice: 780000, marginRate: 0.15 },
    { corp: 'Sun World', site: 'Sun World Hạ Long', pkg: 'Combo Dragon Park & Cáp Treo Nữ Hoàng', avgPrice: 720000, marginRate: 0.14 },
    { corp: 'Sun World', site: 'Sun World Fansipan Legend', pkg: 'Vé Cáp Treo Fansipan Khứ Hồi', avgPrice: 850000, marginRate: 0.14 },
    { corp: 'VinWonders', site: 'VinWonders Phú Quốc', pkg: 'Vé Vào Cổng VinWonders + Safari Phú Quốc', avgPrice: 1250000, marginRate: 0.15 },
    { corp: 'VinWonders', site: 'VinWonders Nha Trang', pkg: 'Vé Vào Cổng & Cáp Treo VinWonders', avgPrice: 920000, marginRate: 0.145 },
    { corp: 'VinWonders', site: 'VinWonders Nam Hội An', pkg: 'Vé Vào Cổng & River Safari Nam Hội An', avgPrice: 680000, marginRate: 0.14 },
    { corp: 'VinWonders', site: 'VinWonders Grand World', pkg: 'Combo Bảo Tàng Gấu & Tinh Hoa Việt Nam', avgPrice: 520000, marginRate: 0.15 },
    { corp: 'Khác', site: 'Công viên Nước Đầm Sen', pkg: 'Vé Trọn Gói Công Viên Nước Đầm Sen', avgPrice: 320000, marginRate: 0.16 },
    { corp: 'Khác', site: 'Khu du lịch Suối Tiên', pkg: 'Combo Tham Quan & Biển Tiên Đồng', avgPrice: 360000, marginRate: 0.16 }
  ];

  const novDates = [
    '2026-11-18', '2026-11-17', '2026-11-16', '2026-11-15', '2026-11-14',
    '2026-11-13', '2026-11-12', '2026-11-11', '2026-11-10', '2026-11-09',
    '2026-11-08', '2026-11-07', '2026-11-06', '2026-11-05', '2026-11-04',
    '2026-11-03', '2026-11-02', '2026-11-01', '2026-10-30', '2026-10-28',
    '2026-10-26', '2026-10-24', '2026-10-22', '2026-10-20', '2026-10-18'
  ];
  const octPrevDates = [
    '2026-10-11', '2026-10-09', '2026-10-07', '2026-10-05', '2026-10-03', '2026-10-01',
    '2026-09-28', '2026-09-24', '2026-09-20', '2026-09-16'
  ];

  const orders = [];
  let seq = 1;

  const pushOrder = (createdDate, channel, subType, staff, salesOwner, siteObj, cust, tickets, status, paymentMethod = 'Ví điện tử') => {
    const dt = _parseIsoDateSeed(createdDate);
    dt.setDate(dt.getDate() + (seq % 7) + 2);
    const useDate = _toIsoDateSeed(dt);
    const revenue = Math.round((tickets * siteObj.avgPrice) / 10000) * 10000;
    const profit = Math.round((revenue * siteObj.marginRate) / 5000) * 5000;
    orders.push({
      orderCode: `ORD-26${createdDate.slice(5, 7)}-${String(seq).padStart(3, '0')}`,
      createdDate,
      useDate,
      customerId: cust.id,
      customerName: cust.name,
      customerPhone: cust.phone,
      customerEmail: cust.email,
      customerSource: cust.source,
      channel,
      subType,
      staff,
      salesOwner,
      corp: siteObj.corp,
      site: siteObj.site,
      packageName: siteObj.pkg,
      tickets,
      revenue,
      netCost: revenue - profit,
      profit,
      status,
      paymentMethod
    });
    seq++;
  };

  REPORT_STAFF_DIRECTORY.TA.forEach((taName, taIdx) => {
    const salesOwner = SALES_ASSIGNMENTS_DIRECTORY[taName];
    for (let k = 0; k < 6; k++) {
      const dateStr = novDates[(taIdx * 2 + k * 3) % novDates.length];
      const siteObj = siteCatalog[(taIdx + k * 2) % siteCatalog.length];
      const cust = customers[(taIdx * 3 + k) % customers.length];
      const tickets = 28 + ((taIdx * 5 + k * 7) % 34);
      const status = (k === 5 && taIdx % 4 === 0) ? 'Nháp' : (k === 4 && taIdx % 5 === 0 ? 'Đã hủy' : (k % 2 === 0 ? 'Đã xuất vé' : 'Đã xác nhận'));
      const pm = k % 2 === 0 ? 'Ví điện tử' : 'Chuyển khoản QR';
      pushOrder(dateStr, 'Đại lý (TA)', '-', taName, salesOwner, siteObj, cust, tickets, status, pm);
    }
  });

  REPORT_STAFF_DIRECTORY.CTV.forEach((ctvName, ctvIdx) => {
    const salesOwner = SALES_ASSIGNMENTS_DIRECTORY[ctvName];
    for (let k = 0; k < 3; k++) {
      const dateStr = novDates[(ctvIdx + k * 4) % novDates.length];
      const siteObj = siteCatalog[(ctvIdx + k * 3) % siteCatalog.length];
      const cust = customers[(ctvIdx * 2 + k + 5) % customers.length];
      const tickets = 12 + ((ctvIdx * 3 + k * 5) % 18);
      const status = (k === 2 && ctvIdx % 6 === 0) ? 'Đang xử lý' : (k === 1 && ctvIdx % 9 === 0 ? 'Hoàn tiền' : (k % 2 === 0 ? 'Đã xuất vé' : 'Đã xác nhận'));
      pushOrder(dateStr, 'Website', 'CTV', ctvName, salesOwner, siteObj, cust, tickets, status, 'Cổng VNPAY');
    }
  });

  REPORT_STAFF_DIRECTORY.Sale.forEach((saleName, sIdx) => {
    for (let k = 0; k < 3; k++) {
      const dateStr = novDates[(sIdx * 3 + k * 2) % novDates.length];
      const siteObj = siteCatalog[(sIdx * 2 + k) % siteCatalog.length];
      const cust = customers[(sIdx * 4 + k + 10) % customers.length];
      const tickets = 18 + ((sIdx * 4 + k * 6) % 22);
      const status = (k === 2 && sIdx === 4) ? 'Nháp' : 'Đã xuất vé';
      pushOrder(dateStr, 'Nội bộ', 'Sale', saleName, saleName, siteObj, cust, tickets, status, 'Ví điện tử');
    }
  });

  for (let b = 0; b < 12; b++) {
    const dateStr = novDates[(b * 2) % novDates.length];
    const siteObj = siteCatalog[b % siteCatalog.length];
    const cust = customers[(b * 3 + 2) % customers.length];
    const subType = (b % 2 === 0) ? 'Booking' : 'App';
    const tickets = 10 + (b % 14);
    pushOrder(dateStr, 'Website', subType, '-', REPORT_STAFF_DIRECTORY.Sale[b % 5], siteObj, cust, tickets, 'Đã xuất vé', 'Chuyển khoản QR');
  }

  for (let p = 0; p < 45; p++) {
    const dateStr = octPrevDates[p % octPrevDates.length];
    const siteObj = siteCatalog[(p * 2) % siteCatalog.length];
    const cust = customers[p % customers.length];
    if (p % 3 === 0) {
      const taName = REPORT_STAFF_DIRECTORY.TA[p % 10];
      pushOrder(dateStr, 'Đại lý (TA)', '-', taName, SALES_ASSIGNMENTS_DIRECTORY[taName], siteObj, cust, 28 + (p % 25), p % 11 === 0 ? 'Đã hủy' : 'Đã xuất vé', 'Ví điện tử');
    } else if (p % 3 === 1) {
      const ctvName = REPORT_STAFF_DIRECTORY.CTV[p % 20];
      pushOrder(dateStr, 'Website', 'CTV', ctvName, SALES_ASSIGNMENTS_DIRECTORY[ctvName], siteObj, cust, 14 + (p % 15), 'Đã xuất vé', 'Cổng VNPAY');
    } else {
      const saleName = REPORT_STAFF_DIRECTORY.Sale[p % 5];
      pushOrder(dateStr, 'Nội bộ', 'Sale', saleName, saleName, siteObj, cust, 16 + (p % 18), 'Đã xác nhận', 'Ví điện tử');
    }
  }

  return orders;
}

// Xuất các hằng số và hàm sinh dữ liệu ra phạm vi toàn cục
if (typeof window !== 'undefined') {
  window.REPORT_TODAY = REPORT_TODAY;
  window.REPORT_CHANNEL_SUBTYPES = REPORT_CHANNEL_SUBTYPES;
  window.REPORT_STAFF_DIRECTORY = REPORT_STAFF_DIRECTORY;
  window.SALES_ASSIGNMENTS_DIRECTORY = SALES_ASSIGNMENTS_DIRECTORY;
  window.generateMockOrdersDataset = generateMockOrdersDataset;
  if (!window.reportOrdersDataset) {
    try {
      window.reportOrdersDataset = generateMockOrdersDataset();
    } catch (e) {}
  }
}
