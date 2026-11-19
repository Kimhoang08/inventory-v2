/**
 * TECHERA B2B PORTAL - AGENCIES & PARTNERS MANAGEMENT
 * Đồng bộ chuẩn giao diện Lịch sử Dòng tiền (cashflow-table.css)
 */

// 1. DIRECTORY CÁC NHÀ CUNG CẤP & KHU VUI CHƠI TRỰC THUỘC
const SUPPLIERS_SITES_DIRECTORY = {
  'Sun World': [
    { id: '#KV-101', name: 'Sun World Ba Na Hills', location: 'Đà Nẵng', supplier: 'Sun World' },
    { id: '#KV-102', name: 'Sun World Fansipan Legend', location: 'Sa Pa, Lào Cai', supplier: 'Sun World' },
    { id: '#KV-103', name: 'Sun World Hon Thom', location: 'Phú Quốc, Kiên Giang', supplier: 'Sun World' },
    { id: '#KV-104', name: 'Sun World Hạ Long', location: 'Hạ Long, Quảng Ninh', supplier: 'Sun World' },
    { id: '#KV-105', name: 'Sun World Bà Đen Mountain', location: 'Tây Ninh', supplier: 'Sun World' }
  ],
  'VinWonders': [
    { id: '#KV-116', name: 'VinWonders Phú Quốc', location: 'Phú Quốc, Kiên Giang', supplier: 'VinWonders' },
    { id: '#KV-117', name: 'VinWonders Nha Trang', location: 'Nha Trang, Khánh Hòa', supplier: 'VinWonders' },
    { id: '#KV-118', name: 'VinWonders Nam Hội An', location: 'Thăng Bình, Quảng Nam', supplier: 'VinWonders' },
    { id: '#KV-119', name: 'VinWonders Grand World', location: 'Phú Quốc, Kiên Giang', supplier: 'VinWonders' },
    { id: '#KV-120', name: 'Vinpearl Safari Phú Quốc', location: 'Phú Quốc, Kiên Giang', supplier: 'VinWonders' }
  ],
  'NovaDreams': [
    { id: '#KV-131', name: 'NovaDreams Phan Thiết', location: 'Phan Thiết, Bình Thuận', supplier: 'NovaDreams' },
    { id: '#KV-132', name: 'Circus Land Phan Thiết', location: 'Phan Thiết, Bình Thuận', supplier: 'NovaDreams' },
    { id: '#KV-133', name: 'Wonderland Water Park', location: 'Phan Thiết, Bình Thuận', supplier: 'NovaDreams' }
  ],
  'TECHERA': [
    { id: '#KV-141', name: 'Công viên Nước Đầm Sen', location: 'Quận 11, TP. Hồ Chí Minh', supplier: 'TECHERA' },
    { id: '#KV-142', name: 'Khu du lịch Suối Tiên', location: 'TP. Thủ Đức, TP. Hồ Chí Minh', supplier: 'TECHERA' },
    { id: '#KV-143', name: 'Bảo tàng Tranh 3D Art in Paradise', location: 'Đà Nẵng', supplier: 'TECHERA' },
    { id: '#KV-144', name: 'Khu Du Lịch Núi Thần Tài', location: 'Hòa Vang, Đà Nẵng', supplier: 'TECHERA' }
  ]
};

const ADMINS_LIST = [
  'Nguyễn Văn An (Sale Manager)',
  'Trần Thị Mai (Booking CSKH)',
  'Lê Quốc Bảo (Account Lead)',
  'Phạm Minh Tuấn (Sale Admin)',
  'Hoàng Thảo Linh (CSKH)'
];

// 2. DATASET ĐẠI LÝ MẪU (CHUẨN FORM & MODEL ĐẠI LÝ)
let agenciesData = [
  {
    id: '32',
    code: 'DL-032',
    username: 'bamien_travel',
    name: 'CÔNG TY TNHH DVDL BA MIEN HCM',
    email: 'contact@bamientravel.vn',
    phone: '0903123456',
    taxId: '0312456789',
    address: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    minDeposit: 1000000,
    admin: 'Nguyễn Văn An (Sale Manager)',
    supplier: 'VinWonders',
    balance: 1975000,
    status: 'Hoạt động',
    avatar: '',
    sites: [
      { id: '#KV-116', name: 'VinWonders Phú Quốc', location: 'Phú Quốc, Kiên Giang', supplier: 'VinWonders', updatedAt: '2026-11-19 14:30:15', discount: 12 },
      { id: '#KV-117', name: 'VinWonders Nha Trang', location: 'Nha Trang, Khánh Hòa', supplier: 'VinWonders', updatedAt: '2026-11-18 09:15:22', discount: 10 }
    ]
  },
  {
    id: '45',
    code: 'DL-045',
    username: 'vietholiday',
    name: 'DU LỊCH VIỆT HOLIDAY',
    email: 'b2b@vietholiday.com',
    phone: '0912345678',
    taxId: '0100123456',
    address: '45 Đinh Tiên Hoàng, Quận Hoàn Kiếm, Hà Nội',
    minDeposit: 2000000,
    admin: 'Trần Thị Mai (Booking CSKH)',
    supplier: 'Sun World',
    balance: 8200000,
    status: 'Hoạt động',
    avatar: '',
    sites: [
      { id: '#KV-101', name: 'Sun World Ba Na Hills', location: 'Đà Nẵng', supplier: 'Sun World', updatedAt: '2026-11-19 11:20:00', discount: 14 },
      { id: '#KV-102', name: 'Sun World Fansipan Legend', location: 'Sa Pa, Lào Cai', supplier: 'Sun World', updatedAt: '2026-11-17 16:45:10', discount: 12 }
    ]
  },
  {
    id: '58',
    code: 'DL-058',
    username: 'tester_a',
    name: 'Đại lý Tester A',
    email: 'tester.a@techera.vn',
    phone: '0987654321',
    taxId: '0315998877',
    address: '72 Lê Thánh Tôn, Quận 1, TP. Hồ Chí Minh',
    minDeposit: 1000000,
    admin: 'Lê Quốc Bảo (Account Lead)',
    supplier: 'VinWonders',
    balance: 0,
    status: 'Hoạt động',
    avatar: '',
    sites: [
      { id: '#KV-116', name: 'VinWonders Phú Quốc', location: 'Phú Quốc, Kiên Giang', supplier: 'VinWonders', updatedAt: '2026-11-19 15:00:10', discount: 10 },
      { id: '#KV-117', name: 'VinWonders Nha Trang', location: 'Nha Trang, Khánh Hòa', supplier: 'VinWonders', updatedAt: '2026-11-19 14:12:45', discount: 8 }
    ]
  },
  {
    id: '64',
    code: 'DL-064',
    username: 'saigontourist_pro',
    name: 'SAIGON TOURIST PRO',
    email: 'info@saigontourist-pro.vn',
    phone: '0908112233',
    taxId: '0300456123',
    address: '23 Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    minDeposit: 5000000,
    admin: 'Lê Quốc Bảo (Account Lead)',
    supplier: 'TECHERA',
    balance: 14500000,
    status: 'Hoạt động',
    avatar: '',
    sites: [
      { id: '#KV-141', name: 'Công viên Nước Đầm Sen', location: 'Quận 11, TP. Hồ Chí Minh', supplier: 'TECHERA', updatedAt: '2026-11-18 10:05:30', discount: 15 },
      { id: '#KV-142', name: 'Khu du lịch Suối Tiên', location: 'TP. Thủ Đức, TP. Hồ Chí Minh', supplier: 'TECHERA', updatedAt: '2026-11-16 14:20:00', discount: 15 }
    ]
  },
  {
    id: '71',
    code: 'DL-071',
    username: 'vietravel_b2b',
    name: 'VIETRAVEL B2B',
    email: 'vietravel.b2b@vietravel.com',
    phone: '0909887766',
    taxId: '0301234567',
    address: '190 Pasteur, Phường Võ Thị Sáu, Quận 3, TP. Hồ Chí Minh',
    minDeposit: 5000000,
    admin: 'Phạm Minh Tuấn (Sale Admin)',
    supplier: 'Sun World',
    balance: 35000000,
    status: 'Hoạt động',
    avatar: '',
    sites: [
      { id: '#KV-101', name: 'Sun World Ba Na Hills', location: 'Đà Nẵng', supplier: 'Sun World', updatedAt: '2026-11-19 16:30:00', discount: 15 },
      { id: '#KV-103', name: 'Sun World Hon Thom', location: 'Phú Quốc, Kiên Giang', supplier: 'Sun World', updatedAt: '2026-11-19 16:30:00', discount: 15 },
      { id: '#KV-104', name: 'Sun World Hạ Long', location: 'Hạ Long, Quảng Ninh', supplier: 'Sun World', updatedAt: '2026-11-19 16:30:00', discount: 14 }
    ]
  },
  {
    id: '83',
    code: 'DL-083',
    username: 'benthanh_tourist',
    name: 'BEN THANH TOURIST B2B',
    email: 'benthanh@benthanhtourist.vn',
    phone: '0903998877',
    taxId: '0302345678',
    address: '82 Calmette, Phường Nguyễn Thái Bình, Quận 1, TP. Hồ Chí Minh',
    minDeposit: 2000000,
    admin: 'Hoàng Thảo Linh (CSKH)',
    supplier: 'VinWonders',
    balance: 4100000,
    status: 'Hoạt động',
    avatar: '',
    sites: [
      { id: '#KV-118', name: 'VinWonders Nam Hội An', location: 'Thăng Bình, Quảng Nam', supplier: 'VinWonders', updatedAt: '2026-11-15 08:30:00', discount: 10 }
    ]
  },
  {
    id: '92',
    code: 'DL-092',
    username: 'fiditour_travel',
    name: 'FIDITOUR TRAVEL',
    email: 'b2b@fiditour.com',
    phone: '0918776655',
    taxId: '0303456789',
    address: '129 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
    minDeposit: 2000000,
    admin: 'Nguyễn Văn An (Sale Manager)',
    supplier: 'NovaDreams',
    balance: 0,
    status: 'Ngừng hoạt động',
    avatar: '',
    sites: [
      { id: '#KV-131', name: 'NovaDreams Phan Thiết', location: 'Phan Thiết, Bình Thuận', supplier: 'NovaDreams', updatedAt: '2026-11-10 11:00:00', discount: 8 }
    ]
  },
  {
    id: '105',
    code: 'DL-105',
    username: 'datviet_tour',
    name: 'DAT VIET TOUR',
    email: 'info@datviettour.com.vn',
    phone: '0909554433',
    taxId: '0304567890',
    address: '198 Phan Văn Trị, Phường 10, Quận Gò Vấp, TP. Hồ Chí Minh',
    minDeposit: 1000000,
    admin: 'Trần Thị Mai (Booking CSKH)',
    supplier: 'Sun World',
    balance: 6500000,
    status: 'Hoạt động',
    avatar: '',
    sites: [
      { id: '#KV-101', name: 'Sun World Ba Na Hills', location: 'Đà Nẵng', supplier: 'Sun World', updatedAt: '2026-11-18 17:10:00', discount: 12 }
    ]
  },
  {
    id: '118',
    code: 'DL-118',
    username: 'redtours_hn',
    name: 'HANOI RED TOURS',
    email: 'redtours@hanoiredtours.com.vn',
    phone: '0913223344',
    taxId: '-',
    address: '63 Hàng Trống, Quận Hoàn Kiếm, Hà Nội',
    minDeposit: 1000000,
    admin: 'Phạm Minh Tuấn (Sale Admin)',
    supplier: 'Sun World',
    balance: 3200000,
    status: 'Hoạt động',
    avatar: '',
    sites: [
      { id: '#KV-102', name: 'Sun World Fansipan Legend', location: 'Sa Pa, Lào Cai', supplier: 'Sun World', updatedAt: '2026-11-14 09:40:00', discount: 10 }
    ]
  },
  {
    id: '127',
    code: 'DL-127',
    username: 'pq_sunshine',
    name: 'PHÚ QUỐC SUNSHINE TOURS',
    email: 'booking@pqsunshine.vn',
    phone: '0978112244',
    taxId: '1702112233',
    address: 'Khu phố 7, Phường Dương Đông, TP. Phú Quốc, Kiên Giang',
    minDeposit: 1000000,
    admin: 'Hoàng Thảo Linh (CSKH)',
    supplier: 'VinWonders',
    balance: 11600000,
    status: 'Hoạt động',
    avatar: '',
    sites: [
      { id: '#KV-116', name: 'VinWonders Phú Quốc', location: 'Phú Quốc, Kiên Giang', supplier: 'VinWonders', updatedAt: '2026-11-19 10:25:00', discount: 12 },
      { id: '#KV-119', name: 'VinWonders Grand World', location: 'Phú Quốc, Kiên Giang', supplier: 'VinWonders', updatedAt: '2026-11-19 10:25:00', discount: 10 }
    ]
  }
];

// STATE MANAGEMENT
let agencyFilterState = {
  search: '',
  status: 'ALL'
};

let agencyPaginationState = {
  page: 1,
  pageSize: 10
};

let currentViewingAgencyId = null;
let currentEditingAgencyId = null;
let currentDiscountSiteTarget = null; // { agencyId, siteId }

// Multi-select state on Form Modal
let formSelectedSiteIds = new Set();
let formAvailableSites = [];

// ============================================================================
// FORMATTERS & HELPERS
// ============================================================================
function formatCurrencyVND(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '0 đ';
  return (Number(amount) || 0).toLocaleString('vi-VN') + ' đ';
}

function parseCurrencyVND(str) {
  if (!str) return 0;
  return Number(String(str).replace(/[^\d]/g, '')) || 0;
}

function formatDateTimeParts(dateStr) {
  if (!dateStr) return { date: '-', time: '-' };
  const parts = dateStr.split(' ');
  const d = parts[0] ? parts[0].split('-').reverse().join('/') : '-';
  const t = parts[1] || '00:00:00';
  return { date: d, time: t };
}

// ============================================================================
// 1. RENDER BẢNG QUẢN LÝ ĐẠI LÝ (VIEW 1)
// ============================================================================
function getFilteredAgencies() {
  const q = (agencyFilterState.search || '').trim().toLowerCase();
  const st = agencyFilterState.status;

  return agenciesData.filter(a => {
    if (st !== 'ALL' && a.status !== st) return false;
    if (q) {
      const matchName = (a.name || '').toLowerCase().includes(q);
      const matchId = String(a.id).toLowerCase().includes(q) || (a.code || '').toLowerCase().includes(q);
      const matchEmail = (a.email || '').toLowerCase().includes(q);
      const matchPhone = (a.phone || '').toLowerCase().includes(q);
      const matchTax = (a.taxId || '').toLowerCase().includes(q);
      if (!matchName && !matchId && !matchEmail && !matchPhone && !matchTax) return false;
    }
    return true;
  });
}

function renderAgenciesTable() {
  const tbody = document.getElementById('agenciesTableBody');
  const mobileContainer = document.getElementById('agenciesMobileContainer');
  const emptyNotice = document.getElementById('agenciesEmptyNotice');
  const paginationFooter = document.getElementById('agenciesPaginationFooter');

  const filtered = getFilteredAgencies();
  const total = filtered.length;
  const pageSize = agencyPaginationState.pageSize;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (agencyPaginationState.page > totalPages) agencyPaginationState.page = totalPages;
  if (agencyPaginationState.page < 1) agencyPaginationState.page = 1;

  const startIdx = (agencyPaginationState.page - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, total);
  const pageSlice = filtered.slice(startIdx, endIdx);

  // Update counts
  const countEl = document.getElementById('agenciesCountBadge');
  if (countEl) countEl.innerText = `${total} Đại lý`;

  if (total === 0) {
    if (tbody) tbody.innerHTML = '';
    if (mobileContainer) mobileContainer.innerHTML = '';
    if (emptyNotice) emptyNotice.classList.remove('hidden');
    if (paginationFooter) paginationFooter.classList.add('hidden');
    return;
  }

  if (emptyNotice) emptyNotice.classList.add('hidden');
  if (paginationFooter) paginationFooter.classList.remove('hidden');

  // Render Desktop Rows (>= 1024px)
  if (tbody) {
    tbody.innerHTML = pageSlice.map(a => {
      const isOnline = a.status === 'Hoạt động';
      const statusBadge = isOnline
        ? `<span class="cf-badge cf-badge-success"><span class="cf-badge-dot"></span>Hoạt động</span>`
        : `<span class="cf-badge cf-badge-danger"><span class="cf-badge-dot"></span>Ngừng hoạt động</span>`;

      return `
        <tr class="cf-row group">
          <!-- 1. TÊN ĐẠI LÝ (2 tầng: Dòng trên tên đậm, dòng dưới ID) -->
          <td class="cf-cell whitespace-nowrap">
            <div class="cf-two-tier">
              <span class="cf-two-tier-title font-bold text-slate-900" title="${a.name}">${a.name}</span>
              <span class="cf-two-tier-sub">ID: ${a.id}</span>
            </div>
          </td>

          <!-- 2. EMAIL -->
          <td class="cf-cell whitespace-nowrap">
            <span class="font-mono text-xs text-slate-600">${a.email || '-'}</span>
          </td>

          <!-- 3. SĐT -->
          <td class="cf-cell whitespace-nowrap">
            <span class="font-mono text-xs text-slate-700 font-semibold">${a.phone || '-'}</span>
          </td>

          <!-- 4. MÃ SỐ THUẾ -->
          <td class="cf-cell whitespace-nowrap">
            <span class="font-mono text-xs text-slate-700">${a.taxId || '-'}</span>
          </td>

          <!-- 5. SỐ DƯ VÍ (Badge pastel xanh lá chữ đậm) -->
          <td class="cf-cell whitespace-nowrap">
            <span class="cf-badge cf-badge-success font-extrabold text-xs">
              ${formatCurrencyVND(a.balance)}
            </span>
          </td>

          <!-- 6. TRẠNG THÁI -->
          <td class="cf-cell whitespace-nowrap">
            ${statusBadge}
          </td>

          <!-- 7. THAO TÁC (Cụm 2 icon: Quả địa cầu 🌐 & Chỉnh sửa ✏️) -->
          <td class="cf-cell cf-action-cell">
            <div class="flex items-center justify-center gap-1.5 whitespace-nowrap">
              <!-- Icon Quả địa cầu 🌐 -->
              <button
                type="button"
                onclick="openAgencySites('${a.id}')"
                class="cf-action-btn hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200"
                title="Danh sách site kết nối của đại lý"
              >
                <i class="fa-solid fa-globe text-blue-600 text-xs"></i>
              </button>

              <!-- Icon Chỉnh sửa ✏️ -->
              <button
                type="button"
                onclick="openEditAgencyModal('${a.id}')"
                class="cf-action-btn hover:text-amber-600 hover:bg-amber-50 hover:border-amber-200"
                title="Chỉnh sửa thông tin đại lý"
              >
                <i class="fa-regular fa-pen-to-square text-slate-600 text-xs"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Render Mobile Cards (< 1024px)
  if (mobileContainer) {
    mobileContainer.innerHTML = pageSlice.map(a => {
      const isOnline = a.status === 'Hoạt động';
      const statusBadge = isOnline
        ? `<span class="cf-badge cf-badge-success text-[10px]"><span class="cf-badge-dot"></span>Hoạt động</span>`
        : `<span class="cf-badge cf-badge-danger text-[10px]"><span class="cf-badge-dot"></span>Ngừng hoạt động</span>`;

      return `
        <div class="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3">
          <!-- Hàng 1: Tên đại lý + ID + Badge trạng thái -->
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <h4 class="font-extrabold text-sm text-slate-900 leading-tight">${a.name}</h4>
              <span class="text-xs text-slate-400 font-mono">ID: ${a.id}</span>
            </div>
            ${statusBadge}
          </div>

          <!-- Hàng 2: Grid thông tin liên hệ -->
          <div class="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100">
            <div>
              <div class="text-[10.5px] text-slate-400 uppercase font-semibold">Email</div>
              <div class="font-mono text-slate-700 truncate" title="${a.email}">${a.email}</div>
            </div>
            <div>
              <div class="text-[10.5px] text-slate-400 uppercase font-semibold">Số điện thoại</div>
              <div class="font-mono text-slate-800 font-semibold">${a.phone}</div>
            </div>
            <div>
              <div class="text-[10.5px] text-slate-400 uppercase font-semibold">Mã số thuế</div>
              <div class="font-mono text-slate-700">${a.taxId || '-'}</div>
            </div>
            <div>
              <div class="text-[10.5px] text-slate-400 uppercase font-semibold">Số dư ví</div>
              <div class="font-extrabold text-emerald-700 font-mono">${formatCurrencyVND(a.balance)}</div>
            </div>
          </div>

          <!-- Hàng 3: Cụm nút Thao tác -->
          <div class="flex items-center justify-between pt-1">
            <span class="text-[11px] text-slate-400">${(a.sites || []).length} site liên kết</span>
            <div class="flex items-center gap-2">
              <button
                type="button"
                onclick="openAgencySites('${a.id}')"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-colors cursor-pointer"
              >
                <i class="fa-solid fa-globe text-xs"></i>
                <span>Xem Site</span>
              </button>
              <button
                type="button"
                onclick="openEditAgencyModal('${a.id}')"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <i class="fa-regular fa-pen-to-square text-xs"></i>
                <span>Sửa</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Render Footer Pagination Info
  const pageInfoEl = document.getElementById('agenciesPaginationInfo');
  if (pageInfoEl) {
    pageInfoEl.innerText = total > 0
      ? `Hiển thị ${startIdx + 1}–${endIdx} / ${total} đại lý`
      : 'Hiển thị 0 đại lý';
  }

  // Render pagination buttons
  const paginBtnContainer = document.getElementById('agenciesPaginationButtons');
  if (paginBtnContainer) {
    let btnsHtml = `
      <button
        type="button"
        onclick="changeAgenciesPage(${agencyPaginationState.page - 1})"
        ${agencyPaginationState.page <= 1 ? 'disabled' : ''}
        class="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center text-xs transition-colors cursor-pointer"
      >
        <i class="fa-solid fa-angle-left"></i>
      </button>
    `;

    for (let p = 1; p <= totalPages; p++) {
      const isCur = (p === agencyPaginationState.page);
      btnsHtml += `
        <button
          type="button"
          onclick="changeAgenciesPage(${p})"
          class="w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            isCur
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
          }"
        >
          ${p}
        </button>
      `;
    }

    btnsHtml += `
      <button
        type="button"
        onclick="changeAgenciesPage(${agencyPaginationState.page + 1})"
        ${agencyPaginationState.page >= totalPages ? 'disabled' : ''}
        class="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center text-xs transition-colors cursor-pointer"
      >
        <i class="fa-solid fa-angle-right"></i>
      </button>
    `;
    paginBtnContainer.innerHTML = btnsHtml;
  }
}

function changeAgenciesPage(page) {
  agencyPaginationState.page = page;
  renderAgenciesTable();
  window.scrollTo({ top: 120, behavior: 'smooth' });
}

function changeAgenciesPageSize(size) {
  agencyPaginationState.pageSize = parseInt(size, 10) || 10;
  agencyPaginationState.page = 1;
  renderAgenciesTable();
}

function onAgencyFilterSearch(val) {
  agencyFilterState.search = val;
  agencyPaginationState.page = 1;
  renderAgenciesTable();
}

function onAgencyStatusFilterChange(val) {
  agencyFilterState.status = val;
  agencyPaginationState.page = 1;
  renderAgenciesTable();
}

function resetAgenciesFilters() {
  agencyFilterState.search = '';
  agencyFilterState.status = 'ALL';
  const searchInput = document.getElementById('agencySearchInput');
  const statusSelect = document.getElementById('agencyStatusFilter');
  if (searchInput) searchInput.value = '';
  if (statusSelect) statusSelect.value = 'ALL';
  agencyPaginationState.page = 1;
  renderAgenciesTable();
}

// ============================================================================
// 2. MODAL FORM TẠO MỚI & CHỈNH SỬA ĐẠI LÝ
// ============================================================================
function openCreateAgencyModal() {
  currentEditingAgencyId = null;
  const modal = document.getElementById('modalAgencyForm');
  const modalTitle = document.getElementById('modalAgencyFormTitle');
  const submitBtn = document.getElementById('btnSubmitAgencyModal');
  if (!modal) return;

  if (modalTitle) modalTitle.innerText = 'Tạo mới đại lý';
  if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-plus text-xs mr-1"></i> Tạo mới';

  // Reset form inputs
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  };

  setVal('formAgencyUsername', '');
  setVal('formAgencyPassword', 'Abc@12345');
  setVal('formAgencyPhone', '');
  setVal('formAgencyEmail', '');
  setVal('formAgencyName', '');
  setVal('formAgencyTaxId', '');
  setVal('formAgencyAddress', '');
  setVal('formAgencyMinDeposit', '1.000.000');
  setVal('formAgencyAdmin', '');
  setVal('formAgencySupplier', '');

  // Reset Avatar Preview
  resetAvatarUploadPreview();

  // Reset Sites multi-select
  formSelectedSiteIds.clear();
  formAvailableSites = [];
  renderSitesMultiSelectControl();

  modal.classList.remove('hidden');
  document.body.classList.add('overflow-hidden');
}

function openEditAgencyModal(agencyId) {
  const agency = agenciesData.find(a => String(a.id) === String(agencyId));
  if (!agency) return;

  currentEditingAgencyId = String(agency.id);
  const modal = document.getElementById('modalAgencyForm');
  const modalTitle = document.getElementById('modalAgencyFormTitle');
  const submitBtn = document.getElementById('btnSubmitAgencyModal');
  if (!modal) return;

  if (modalTitle) modalTitle.innerText = `Chỉnh sửa đại lý - ${agency.name}`;
  if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-check text-xs mr-1"></i> Lưu thay đổi';

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  };

  setVal('formAgencyUsername', agency.username || '');
  setVal('formAgencyPassword', 'Abc@12345');
  setVal('formAgencyPhone', agency.phone || '');
  setVal('formAgencyEmail', agency.email || '');
  setVal('formAgencyName', agency.name || '');
  setVal('formAgencyTaxId', agency.taxId || '');
  setVal('formAgencyAddress', agency.address || '');
  setVal('formAgencyMinDeposit', (agency.minDeposit || 1000000).toLocaleString('vi-VN'));
  setVal('formAgencyAdmin', agency.admin || '');
  setVal('formAgencySupplier', agency.supplier || '');

  // Set selected sites
  formSelectedSiteIds.clear();
  (agency.sites || []).forEach(s => formSelectedSiteIds.add(s.id));

  // Load available sites for this supplier
  if (agency.supplier && SUPPLIERS_SITES_DIRECTORY[agency.supplier]) {
    formAvailableSites = SUPPLIERS_SITES_DIRECTORY[agency.supplier];
  } else {
    formAvailableSites = [];
  }
  renderSitesMultiSelectControl();

  // Avatar
  resetAvatarUploadPreview();

  modal.classList.remove('hidden');
  document.body.classList.add('overflow-hidden');
}

function closeAgencyFormModal() {
  const modal = document.getElementById('modalAgencyForm');
  if (modal) modal.classList.add('hidden');
  document.body.classList.remove('overflow-hidden');
}

function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    if (btn) btn.innerHTML = '<i class="fa-regular fa-eye-slash text-slate-400"></i>';
  } else {
    input.type = 'password';
    if (btn) btn.innerHTML = '<i class="fa-regular fa-eye text-slate-400"></i>';
  }
}

// Khi đổi Nhà cung cấp trên form
function onFormSupplierChange(supplierVal) {
  formSelectedSiteIds.clear();
  if (supplierVal && SUPPLIERS_SITES_DIRECTORY[supplierVal]) {
    formAvailableSites = SUPPLIERS_SITES_DIRECTORY[supplierVal];
  } else {
    formAvailableSites = [];
  }
  renderSitesMultiSelectControl();
}

// Render điều khiển multi-select sites
function renderSitesMultiSelectControl() {
  const container = document.getElementById('sitesMultiSelectWrapper');
  const disabledBox = document.getElementById('sitesDisabledNotice');
  const activeBox = document.getElementById('sitesActiveContainer');
  const tagsContainer = document.getElementById('sitesSelectedTags');
  const listContainer = document.getElementById('sitesChecklistOptions');
  const searchInput = document.getElementById('sitesSearchInput');

  if (!container || !disabledBox || !activeBox) return;

  const supplier = document.getElementById('formAgencySupplier')?.value;

  if (!supplier || formAvailableSites.length === 0) {
    disabledBox.classList.remove('hidden');
    activeBox.classList.add('hidden');
    return;
  }

  disabledBox.classList.add('hidden');
  activeBox.classList.remove('hidden');

  // Render Tags
  if (tagsContainer) {
    if (formSelectedSiteIds.size === 0) {
      tagsContainer.innerHTML = `<span class="text-xs text-slate-400 italic">Chưa chọn khu vui chơi nào</span>`;
    } else {
      const selectedSites = formAvailableSites.filter(s => formSelectedSiteIds.has(s.id));
      tagsContainer.innerHTML = selectedSites.map(s => `
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold animate-in fade-in duration-150">
          <span>${s.name}</span>
          <button type="button" onclick="removeSelectedSiteTag('${s.id}')" class="text-blue-400 hover:text-blue-700 cursor-pointer">
            <i class="fa-solid fa-xmark text-[11px]"></i>
          </button>
        </span>
      `).join('');
    }
  }

  // Render Checklist
  filterSitesChecklist(searchInput ? searchInput.value : '');
}

function filterSitesChecklist(query) {
  const listContainer = document.getElementById('sitesChecklistOptions');
  if (!listContainer) return;

  const q = (query || '').toLowerCase().trim();
  const matched = formAvailableSites.filter(s => {
    if (!q) return true;
    return s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q) || s.location.toLowerCase().includes(q);
  });

  if (matched.length === 0) {
    listContainer.innerHTML = `<div class="p-3 text-center text-xs text-slate-400">Không tìm thấy khu vui chơi phù hợp</div>`;
    return;
  }

  listContainer.innerHTML = matched.map(s => {
    const isChecked = formSelectedSiteIds.has(s.id);
    return `
      <label class="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer text-xs transition-colors">
        <div class="flex items-center gap-2.5">
          <input
            type="checkbox"
            value="${s.id}"
            ${isChecked ? 'checked' : ''}
            onchange="onToggleSiteCheckbox('${s.id}', this.checked)"
            class="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
          />
          <div>
            <div class="font-bold text-slate-800">${s.name}</div>
            <div class="text-[10px] text-slate-400 font-mono">${s.id} • ${s.location}</div>
          </div>
        </div>
        <span class="text-[10.5px] px-2 py-0.5 rounded-full ${isChecked ? 'bg-blue-100 text-blue-700 font-bold' : 'bg-slate-100 text-slate-500'}">
          ${isChecked ? 'Đã chọn' : 'Chưa chọn'}
        </span>
      </label>
    `;
  }).join('');
}

function onToggleSiteCheckbox(siteId, checked) {
  if (checked) {
    formSelectedSiteIds.add(siteId);
  } else {
    formSelectedSiteIds.delete(siteId);
  }
  renderSitesMultiSelectControl();
}

function removeSelectedSiteTag(siteId) {
  formSelectedSiteIds.delete(siteId);
  renderSitesMultiSelectControl();
}

function selectAllSitesInForm() {
  formAvailableSites.forEach(s => formSelectedSiteIds.add(s.id));
  renderSitesMultiSelectControl();
}

function deselectAllSitesInForm() {
  formSelectedSiteIds.clear();
  renderSitesMultiSelectControl();
}

// Avatar upload preview handler
function handleAvatarFileInput(input) {
  if (!input || !input.files || !input.files[0]) return;
  const file = input.files[0];
  if (file.size > 5 * 1024 * 1024) {
    if (typeof showToast === 'function') {
      showToast('Lỗi kích thước file', 'Vui lòng chọn ảnh dung lượng dưới 5MB.');
    }
    input.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = function(e) {
    const previewContainer = document.getElementById('avatarUploadPreviewContainer');
    const previewImg = document.getElementById('avatarUploadPreviewImg');
    const placeholder = document.getElementById('avatarUploadPlaceholder');
    if (previewImg) previewImg.src = e.target.result;
    if (previewContainer) previewContainer.classList.remove('hidden');
    if (placeholder) placeholder.classList.add('hidden');
  };
  reader.readAsDataURL(file);
}

function resetAvatarUploadPreview() {
  const input = document.getElementById('formAgencyAvatarFile');
  const previewContainer = document.getElementById('avatarUploadPreviewContainer');
  const previewImg = document.getElementById('avatarUploadPreviewImg');
  const placeholder = document.getElementById('avatarUploadPlaceholder');
  if (input) input.value = '';
  if (previewImg) previewImg.src = '';
  if (previewContainer) previewContainer.classList.add('hidden');
  if (placeholder) placeholder.classList.remove('hidden');
}

// Lưu form tạo mới hoặc chỉnh sửa đại lý
function submitAgencyForm(e) {
  if (e) e.preventDefault();

  const username = document.getElementById('formAgencyUsername')?.value.trim();
  const phone = document.getElementById('formAgencyPhone')?.value.trim();
  const email = document.getElementById('formAgencyEmail')?.value.trim();
  const name = document.getElementById('formAgencyName')?.value.trim();
  const taxId = document.getElementById('formAgencyTaxId')?.value.trim();
  const address = document.getElementById('formAgencyAddress')?.value.trim();
  const minDepositRaw = document.getElementById('formAgencyMinDeposit')?.value.trim();
  const admin = document.getElementById('formAgencyAdmin')?.value || '';
  const supplier = document.getElementById('formAgencySupplier')?.value || '';

  // Validation
  if (!username) {
    alert('Vui lòng nhập Tên người dùng.');
    document.getElementById('formAgencyUsername')?.focus();
    return;
  }
  if (!phone) {
    alert('Vui lòng nhập Số điện thoại.');
    document.getElementById('formAgencyPhone')?.focus();
    return;
  }
  if (!email) {
    alert('Vui lòng nhập Email.');
    document.getElementById('formAgencyEmail')?.focus();
    return;
  }
  if (!name) {
    alert('Vui lòng nhập Tên đại lý.');
    document.getElementById('formAgencyName')?.focus();
    return;
  }
  if (!taxId) {
    alert('Vui lòng nhập Mã số thuế.');
    document.getElementById('formAgencyTaxId')?.focus();
    return;
  }
  if (!address) {
    alert('Vui lòng nhập Địa chỉ đại lý.');
    document.getElementById('formAgencyAddress')?.focus();
    return;
  }
  if (!minDepositRaw) {
    alert('Vui lòng nhập Số tiền tối thiểu.');
    document.getElementById('formAgencyMinDeposit')?.focus();
    return;
  }
  if (!supplier) {
    alert('Vui lòng chọn Nhà cung cấp.');
    document.getElementById('formAgencySupplier')?.focus();
    return;
  }
  if (formSelectedSiteIds.size === 0) {
    alert('Vui lòng chọn ít nhất một Khu vui chơi (Site kết nối) cho đại lý.');
    return;
  }

  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  // Chuẩn bị danh sách sites từ IDs đã chọn
  const assignedSites = Array.from(formSelectedSiteIds).map(siteId => {
    const found = formAvailableSites.find(s => s.id === siteId);
    return {
      id: siteId,
      name: found ? found.name : siteId,
      location: found ? found.location : 'Việt Nam',
      supplier: supplier,
      updatedAt: dateStr,
      discount: 10
    };
  });

  if (currentEditingAgencyId) {
    // UPDATE
    const targetIdx = agenciesData.findIndex(a => String(a.id) === currentEditingAgencyId);
    if (targetIdx !== -1) {
      agenciesData[targetIdx] = {
        ...agenciesData[targetIdx],
        username,
        phone,
        email,
        name,
        taxId,
        address,
        minDeposit: parseCurrencyVND(minDepositRaw),
        admin,
        supplier,
        sites: assignedSites
      };
      if (typeof showToast === 'function') {
        showToast('Cập nhật thành công', `Đã lưu thay đổi thông tin đại lý ${name}.`);
      }
    }
  } else {
    // CREATE NEW
    const newId = String(Math.floor(Math.random() * 800) + 130);
    const newAgency = {
      id: newId,
      code: `DL-${newId.padStart(3, '0')}`,
      username,
      name,
      email,
      phone,
      taxId,
      address,
      minDeposit: parseCurrencyVND(minDepositRaw),
      admin: admin || 'Nguyễn Văn An (Sale Manager)',
      supplier,
      balance: 0,
      status: 'Hoạt động',
      avatar: '',
      sites: assignedSites
    };
    agenciesData.unshift(newAgency);

    if (typeof showToast === 'function') {
      showToast('Tạo đại lý thành công', `Đại lý ${name} đã được thiết lập với ${assignedSites.length} site kết nối.`);
    }
  }

  closeAgencyFormModal();
  renderAgenciesTable();

  // Nếu đang ở màn hình Sites của đại lý đó, cập nhật luôn view
  if (currentViewingAgencyId && currentViewingAgencyId === currentEditingAgencyId) {
    renderAgencySitesView(currentViewingAgencyId);
  }
}

// ============================================================================
// 3. MÀN HÌNH DANH SÁCH SITE CỦA ĐẠI LÝ (VIEW 2)
// ============================================================================
let sitesPaginationState = {
  page: 1,
  pageSize: 10
};

function openAgencySites(agencyId) {
  const agency = agenciesData.find(a => String(a.id) === String(agencyId));
  if (!agency) return;

  currentViewingAgencyId = String(agency.id);
  sitesPaginationState.page = 1;

  // Ẩn view danh sách đại lý, hiện view site
  document.getElementById('viewAgenciesList')?.classList.add('hidden');
  document.getElementById('viewAgencySites')?.classList.remove('hidden');

  // Render dữ liệu
  renderAgencySitesView(agencyId);

  // Cập nhật URL hash hoặc search mà không reload
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('view', 'sites');
    url.searchParams.set('agencyId', agency.id);
    window.history.pushState({}, '', url.toString());
  } catch (err) {}

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function backToAgenciesList() {
  currentViewingAgencyId = null;
  document.getElementById('viewAgencySites')?.classList.add('hidden');
  document.getElementById('viewAgenciesList')?.classList.remove('hidden');

  try {
    const url = new URL(window.location.href);
    url.searchParams.delete('view');
    url.searchParams.delete('agencyId');
    window.history.pushState({}, '', url.toString());
  } catch (err) {}

  renderAgenciesTable();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderAgencySitesView(agencyId) {
  const agency = agenciesData.find(a => String(a.id) === String(agencyId));
  if (!agency) return;

  const sites = agency.sites || [];
  const total = sites.length;
  const pageSize = sitesPaginationState.pageSize;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (sitesPaginationState.page > totalPages) sitesPaginationState.page = totalPages;
  if (sitesPaginationState.page < 1) sitesPaginationState.page = 1;

  const startIdx = (sitesPaginationState.page - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, total);
  const pageSlice = sites.slice(startIdx, endIdx);

  // Set titles
  const titleEl = document.getElementById('agencySitesPageTitle');
  const subTitleEl = document.getElementById('agencySitesPageSub');
  const badgeEl = document.getElementById('agencySitesCountBadge');

  if (titleEl) titleEl.innerText = `Danh sách site của ${agency.name}`;
  if (subTitleEl) subTitleEl.innerText = `Quản lý và cập nhật thông tin các site trên hệ thống (${agency.supplier || 'Tập đoàn'})`;
  if (badgeEl) badgeEl.innerText = `${total} khu vui chơi`;

  // Desktop Table (>= 1024px)
  const tbody = document.getElementById('agencySitesTableBody');
  if (tbody) {
    if (total === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="py-12 text-center text-slate-400">
            <i class="fa-solid fa-map-location-dot text-3xl mb-2 text-slate-300 block"></i>
            Đại lý chưa kết nối với khu vui chơi nào. Bấm <strong>Chỉnh sửa</strong> để thêm Site kết nối.
          </td>
        </tr>
      `;
    } else {
      tbody.innerHTML = pageSlice.map(s => {
        const timeParts = formatDateTimeParts(s.updatedAt);
        return `
          <tr class="cf-row group">
            <!-- 1. ID (#KV-116) -->
            <td class="cf-cell whitespace-nowrap">
              <span class="cf-code text-blue-700">${s.id}</span>
            </td>

            <!-- 2. TÊN KHU DU LỊCH -->
            <td class="cf-cell whitespace-nowrap">
              <span class="font-extrabold text-xs text-slate-900">${s.name}</span>
            </td>

            <!-- 3. ĐỊA ĐIỂM -->
            <td class="cf-cell whitespace-nowrap">
              <span class="text-xs text-slate-700 font-medium">${s.location}</span>
            </td>

            <!-- 4. NHÀ CUNG CẤP -->
            <td class="cf-cell whitespace-nowrap">
              <span class="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                ${s.supplier}
              </span>
            </td>

            <!-- 5. CẬP NHẬT LÚC (2 dòng: dòng trên ngày DD/MM/YYYY, dòng dưới giờ HH:mm:ss) -->
            <td class="cf-cell whitespace-nowrap">
              <div class="text-xs">
                <div class="font-medium text-slate-800">${timeParts.date}</div>
                <div class="text-[10.5px] text-slate-400 font-mono">${timeParts.time}</div>
              </div>
            </td>

            <!-- 6. THAO TÁC: Nút badge Chiết khấu (nền xanh ngọc pastel, chữ xanh ngọc đậm) -->
            <td class="cf-cell whitespace-nowrap text-center">
              <button
                type="button"
                onclick="openDiscountModal('${agency.id}', '${s.id}')"
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 hover:border-teal-300 transition-all cursor-pointer shadow-2xs"
                title="Cấu hình tỷ lệ chiết khấu cho Site này"
              >
                <i class="fa-solid fa-percent text-[10px]"></i>
                <span>Chiết khấu (${s.discount || 10}%)</span>
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  // Mobile Cards (< 1024px)
  const mobileContainer = document.getElementById('agencySitesMobileContainer');
  if (mobileContainer) {
    if (total === 0) {
      mobileContainer.innerHTML = `
        <div class="bg-white rounded-2xl border border-slate-200/90 p-8 text-center text-slate-400">
          Chưa có site kết nối
        </div>
      `;
    } else {
      mobileContainer.innerHTML = pageSlice.map(s => {
        const timeParts = formatDateTimeParts(s.updatedAt);
        return `
          <div class="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3">
            <!-- Đầu thẻ: Tên in đậm bên trái, nút Chiết khấu bên phải; dưới là mã #KV... -->
            <div class="flex items-start justify-between gap-2">
              <div>
                <h4 class="font-extrabold text-sm text-slate-900">${s.name}</h4>
                <span class="text-xs text-slate-400 font-mono font-bold">${s.id}</span>
              </div>
              <button
                type="button"
                onclick="openDiscountModal('${agency.id}', '${s.id}')"
                class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[11px] bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 transition-colors shrink-0"
              >
                <i class="fa-solid fa-percent text-[9px]"></i>
                <span>Chiết khấu ${s.discount || 10}%</span>
              </button>
            </div>

            <!-- Thân thẻ: Khối bảng 2 cột nhãn – giá trị gọn gàng -->
            <div class="bg-slate-50/70 rounded-xl p-3 space-y-1.5 text-xs border border-slate-100">
              <div class="flex items-center justify-between">
                <span class="text-slate-400 font-medium">ĐỊA ĐIỂM:</span>
                <span class="font-bold text-slate-800">${s.location}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-400 font-medium">NHÀ CUNG CẤP:</span>
                <span class="font-semibold text-slate-800">${s.supplier}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-400 font-medium">CẬP NHẬT:</span>
                <span class="font-mono text-slate-600">${timeParts.date} ${timeParts.time}</span>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // Phân trang
  const countText = total > 0 ? `Hiển thị ${total} của ${total} khu vui chơi` : 'Hiển thị 0 của 0 khu vui chơi';
  const infoDesk = document.getElementById('sitesPaginationInfoDesk');
  const infoMob = document.getElementById('sitesPaginationInfoMob');
  if (infoDesk) infoDesk.innerText = countText;
  if (infoMob) infoMob.innerText = countText;

  // Pagination Controls
  const paginControls = document.getElementById('sitesPaginationControls');
  if (paginControls) {
    paginControls.innerHTML = `
      <button
        type="button"
        onclick="changeSitesPage(${sitesPaginationState.page - 1})"
        ${sitesPaginationState.page <= 1 ? 'disabled' : ''}
        class="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center text-xs transition-colors cursor-pointer"
      >
        <i class="fa-solid fa-angle-left"></i>
      </button>
      <span class="text-xs font-bold text-slate-700 px-2">Trang ${sitesPaginationState.page} / ${totalPages}</span>
      <button
        type="button"
        onclick="changeSitesPage(${sitesPaginationState.page + 1})"
        ${sitesPaginationState.page >= totalPages ? 'disabled' : ''}
        class="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center text-xs transition-colors cursor-pointer"
      >
        <i class="fa-solid fa-angle-right"></i>
      </button>
    `;
  }
}

function changeSitesPage(page) {
  sitesPaginationState.page = page;
  if (currentViewingAgencyId) {
    renderAgencySitesView(currentViewingAgencyId);
  }
}

function changeSitesPageSize(size) {
  sitesPaginationState.pageSize = parseInt(size, 10) || 10;
  sitesPaginationState.page = 1;
  if (currentViewingAgencyId) {
    renderAgencySitesView(currentViewingAgencyId);
  }
}

// ============================================================================
// 4. MODAL CHIẾT KHẤU SITE
// ============================================================================
function openDiscountModal(agencyId, siteId) {
  const agency = agenciesData.find(a => String(a.id) === String(agencyId));
  if (!agency) return;
  const site = (agency.sites || []).find(s => s.id === siteId);
  if (!site) return;

  currentDiscountSiteTarget = { agencyId, siteId };

  const modal = document.getElementById('modalDiscountConfig');
  const siteNameEl = document.getElementById('discountModalSiteName');
  const agencyNameEl = document.getElementById('discountModalAgencyName');
  const inputRateEl = document.getElementById('discountModalRateInput');

  if (siteNameEl) siteNameEl.innerText = `${site.name} (${site.id})`;
  if (agencyNameEl) agencyNameEl.innerText = agency.name;
  if (inputRateEl) inputRateEl.value = site.discount || 10;

  if (modal) modal.classList.remove('hidden');
}

function closeDiscountModal() {
  const modal = document.getElementById('modalDiscountConfig');
  if (modal) modal.classList.add('hidden');
  currentDiscountSiteTarget = null;
}

function saveDiscountConfig() {
  if (!currentDiscountSiteTarget) return;
  const { agencyId, siteId } = currentDiscountSiteTarget;
  const rateInput = document.getElementById('discountModalRateInput');
  const rateVal = parseFloat(rateInput?.value) || 0;

  const agency = agenciesData.find(a => String(a.id) === String(agencyId));
  if (!agency) return;
  const site = (agency.sites || []).find(s => s.id === siteId);
  if (!site) return;

  site.discount = rateVal;
  const now = new Date();
  site.updatedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  closeDiscountModal();
  renderAgencySitesView(agencyId);

  if (typeof showToast === 'function') {
    showToast('Đã lưu chiết khấu', `Tỷ lệ chiết khấu của ${site.name} đã được cập nhật thành ${rateVal}%.`);
  }
}

// ============================================================================
// 5. INITIALIZATION
// ============================================================================
window.addEventListener('DOMContentLoaded', () => {
  // Check URL query parameters
  try {
    const url = new URL(window.location.href);
    const view = url.searchParams.get('view');
    const agencyId = url.searchParams.get('agencyId');

    if (view === 'sites' && agencyId) {
      openAgencySites(agencyId);
    } else {
      renderAgenciesTable();
    }
  } catch (err) {
    renderAgenciesTable();
  }
});
