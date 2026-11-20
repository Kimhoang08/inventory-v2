/**
 * TECHERA B2B PORTAL - BANK HUB ENGINE & TRANSACTIONS MANAGEMENT
 * Chuẩn đồng bộ phong cách Lịch sử Dòng tiền (cashflow-table.css)
 */

// DATASET GIAO DỊCH NẠP TIỀN BANKHUB (TOPUP)
const BANK_HUB_DATASET = [
  {
    id: 1,
    date: '18/11/2026 09:17:25',
    txCode: 'BH-2611-00892',
    partyType: 'AGENCY', // 'AGENCY' | 'RETAIL'
    partyName: 'CÔNG TY TNHH DVDL BA MIEN HCM',
    partyCode: 'DL-032',
    agencyId: '32',
    partyPhone: '0903123456',
    gateway: 'Vietcombank 247',
    accountNumber: '1038699999',
    accountName: 'CÔNG TY TNHH DVDL BA MIEN HCM',
    refCode: 'FT263229841289',
    content: 'MA32TOPUP10000000',
    amount: 10000000,
    status: 'MATCHED'
  },
  {
    id: 2,
    date: '18/11/2026 09:02:14',
    txCode: 'BH-2611-00891',
    partyType: 'AGENCY',
    partyName: 'DU LỊCH VIỆT HOLIDAY',
    partyCode: 'DL-045',
    agencyId: '45',
    partyPhone: '0912345678',
    gateway: 'MB Bank API',
    accountNumber: '99998888TECHERA',
    accountName: 'DU LICH VIET HOLIDAY',
    refCode: 'MB263224512903',
    content: 'TA045TOPUP25000000',
    amount: 25000000,
    status: 'MATCHED'
  },
  {
    id: 3,
    date: '18/11/2026 08:45:10',
    txCode: 'BH-2611-00890',
    partyType: 'RETAIL',
    partyName: 'Nguyễn Minh Quân',
    partyCode: 'KH-001',
    agencyId: '',
    partyPhone: '0903128451',
    gateway: 'Vietcombank 247',
    accountNumber: '1038699999',
    accountName: 'NGUYEN MINH QUAN',
    refCode: 'FT263229840912',
    content: 'TOPUP0903128451S1500000',
    amount: 1500000,
    status: 'MATCHED'
  },
  {
    id: 4,
    date: '18/11/2026 08:30:55',
    txCode: 'BH-2611-00889',
    partyType: 'AGENCY',
    partyName: 'SAIGON TOURIST PRO',
    partyCode: 'DL-089',
    agencyId: '89',
    partyPhone: '0908889999',
    gateway: 'Vietcombank 247',
    accountNumber: '1038699999',
    accountName: 'CONG TY SAIGONTOURIST TRAVEL',
    refCode: 'FT263229840112',
    content: 'TA089TOPUP50000000',
    amount: 50000000,
    status: 'MATCHED'
  },
  {
    id: 5,
    date: '18/11/2026 08:12:30',
    txCode: 'BH-2611-00888',
    partyType: 'AGENCY',
    partyName: 'Đại lý Tester A',
    partyCode: 'DL-058',
    agencyId: '58',
    partyPhone: '0987654321',
    gateway: 'Sacombank',
    accountNumber: '060288991122',
    accountName: '', // Chưa có dữ liệu -> hiển thị '-'
    refCode: 'SCB982341029',
    content: 'MA58TOPUP5000000',
    amount: 5000000,
    status: 'MATCHED'
  },
  {
    id: 6,
    date: '17/11/2026 16:50:18',
    txCode: 'BH-2611-00887',
    partyType: 'RETAIL',
    partyName: 'Lê Thị Thu Hà',
    partyCode: 'KH-002',
    agencyId: '',
    partyPhone: '0918456723',
    gateway: 'MB Bank API',
    accountNumber: '99998888TECHERA',
    accountName: 'LE THI THU HA',
    refCode: 'MB263219082341',
    content: 'TOPUP0918456723S2500000',
    amount: 2500000,
    status: 'MATCHED'
  },
  {
    id: 7,
    date: '17/11/2026 15:35:42',
    txCode: 'BH-2611-00886',
    partyType: 'AGENCY',
    partyName: 'VIETRAVEL B2B',
    partyCode: 'DL-012',
    agencyId: '12',
    partyPhone: '0903334455',
    gateway: 'Vietcombank 247',
    accountNumber: '1038699999',
    accountName: 'CONG TY CP VIETRAVEL CORP',
    refCode: 'FT263218552190',
    content: 'MA12TOPUP100000000',
    amount: 100000000,
    status: 'MATCHED'
  },
  {
    id: 8,
    date: '17/11/2026 14:20:09',
    txCode: 'BH-2611-00885',
    partyType: 'RETAIL',
    partyName: 'Trần Đức Thắng',
    partyCode: 'KH-003',
    agencyId: '',
    partyPhone: '0987234119',
    gateway: 'VietinBank OpenBanking',
    accountNumber: '110022334455',
    accountName: 'TRAN DUC THANG',
    refCode: 'CTG263214200911',
    content: 'TOPUP0987234119S8500000',
    amount: 8500000,
    status: 'MATCHED'
  },
  {
    id: 9,
    date: '17/11/2026 11:15:33',
    txCode: 'BH-2611-00884',
    partyType: 'AGENCY',
    partyName: 'BEN THANH TOURIST B2B',
    partyCode: 'DL-076',
    agencyId: '76',
    partyPhone: '0918776655',
    gateway: 'MB Bank API',
    accountNumber: '99998888TECHERA',
    accountName: 'CONG TY BEN THANH TOURIST',
    refCode: 'MB263211153388',
    content: 'TA076TOPUP30000000',
    amount: 30000000,
    status: 'MATCHED'
  },
  {
    id: 10,
    date: '17/11/2026 10:05:47',
    txCode: 'BH-2611-00883',
    partyType: 'AGENCY',
    partyName: 'FIDITOUR TRAVEL',
    partyCode: 'DL-064',
    agencyId: '64',
    partyPhone: '0909112233',
    gateway: 'Sacombank',
    accountNumber: '060288991122',
    accountName: 'CONG TY CP FIDITOUR',
    refCode: 'SCB9817726410',
    content: 'MA64TOPUP15000000',
    amount: 15000000,
    status: 'MATCHED'
  },
  {
    id: 11,
    date: '16/11/2026 17:40:22',
    txCode: 'BH-2611-00882',
    partyType: 'RETAIL',
    partyName: 'Võ Hoàng Long',
    partyCode: 'KH-005',
    agencyId: '',
    partyPhone: '0909543218',
    gateway: 'ACB FastPay',
    accountNumber: '2468101214',
    accountName: 'VO HOANG LONG',
    refCode: 'ACB263207402219',
    content: 'TOPUP0909543218S3200000',
    amount: 3200000,
    status: 'MATCHED'
  },
  {
    id: 12,
    date: '16/11/2026 14:10:15',
    txCode: 'BH-2611-00881',
    partyType: 'AGENCY',
    partyName: 'DAT VIET TOUR',
    partyCode: 'DL-091',
    agencyId: '91',
    partyPhone: '0902998877',
    gateway: 'Vietcombank 247',
    accountNumber: '1038699999',
    accountName: 'DAT VIET TOURIST CORP',
    refCode: 'FT263204101566',
    content: 'TA091TOPUP20000000',
    amount: 20000000,
    status: 'MATCHED'
  },
  {
    id: 13,
    date: '16/11/2026 09:25:00',
    txCode: 'BH-2611-00880',
    partyType: 'RETAIL',
    partyName: 'Đoàn Khách Công Ty An Phát',
    partyCode: 'KH-006',
    agencyId: '',
    partyPhone: '0902665890',
    gateway: 'Vietcombank 247',
    accountNumber: '1038699999',
    accountName: 'CTY CP TAP DOAN AN PHAT',
    refCode: 'FT263209250012',
    content: 'TOPUP0902665890S45000000',
    amount: 45000000,
    status: 'MATCHED'
  },
  {
    id: 14,
    date: '15/11/2026 16:30:11',
    txCode: 'BH-2611-00879',
    partyType: 'AGENCY',
    partyName: 'CÔNG TY TNHH DVDL BA MIEN HCM',
    partyCode: 'DL-032',
    agencyId: '32',
    partyPhone: '0903123456',
    gateway: 'MB Bank API',
    accountNumber: '99998888TECHERA',
    accountName: 'CÔNG TY TNHH DVDL BA MIEN HCM',
    refCode: 'MB263196301144',
    content: 'TA032TOPUP50000000',
    amount: 50000000,
    status: 'MATCHED'
  },
  {
    id: 15,
    date: '15/11/2026 11:45:50',
    txCode: 'BH-2611-00878',
    partyType: 'RETAIL',
    partyName: 'Hoàng Gia Bảo',
    partyCode: 'KH-007',
    agencyId: '',
    partyPhone: '0974332198',
    gateway: 'Sacombank',
    accountNumber: '060288991122',
    accountName: '', // Chưa có dữ liệu -> hiển thị '-'
    refCode: 'SCB9815114550',
    content: 'TOPUP0974332198S1200000',
    amount: 1200000,
    status: 'MATCHED'
  },
  {
    id: 16,
    date: '15/11/2026 08:20:30',
    txCode: 'BH-2611-00877',
    partyType: 'AGENCY',
    partyName: 'DU LỊCH VIỆT HOLIDAY',
    partyCode: 'DL-045',
    agencyId: '45',
    partyPhone: '0912345678',
    gateway: 'VietinBank OpenBanking',
    accountNumber: '110022334455',
    accountName: 'DU LICH VIET HOLIDAY',
    refCode: 'CTG263198203099',
    content: 'MA45TOPUP15000000',
    amount: 15000000,
    status: 'MATCHED'
  }
];

// STATE BỘ LỌC VÀ PHÂN TRANG
let bankHubFilterState = {
  keyword: '',
  gateway: 'ALL',
  partyType: 'ALL',
  timeRange: 'MONTH',
  page: 1,
  pageSize: 10
};

// ============================================================================
// HÀM KHỞI TẠO & RENDER BẢNG BANKHUB
// ============================================================================

function initBankHubPage() {
  renderBankHubKpis();
  applyBankHubFilters();
  bindBankHubFilterEvents();
}

/**
 * Tính toán & hiển thị 4 Card KPI đầu trang
 */
function renderBankHubKpis() {
  const dataset = BANK_HUB_DATASET;
  const totalAmount = dataset.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const agencyAmount = dataset
    .filter(item => item.partyType === 'AGENCY')
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const retailAmount = dataset
    .filter(item => item.partyType === 'RETAIL')
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const matchedCount = dataset.length;

  // Dòng tiền nạp tháng (Quy mô tháng tổng thể: 1.250.000.000 đ)
  const monthlyTotal = 1250000000;
  if (typeof setKpiCardValue === 'function') {
    setKpiCardValue('bankHubKpiTotalAmount', monthlyTotal);
    setKpiCardValue('bankHubKpiAgencyAmount', agencyAmount + 850000000); // Tỷ lệ đại lý tích lũy
    setKpiCardValue('bankHubKpiRetailAmount', retailAmount + 80000000); // Tỷ lệ khách lẻ tích lũy
  } else {
    const el = document.getElementById('bankHubKpiTotalAmount');
    if (el) el.innerText = '1.25B';
  }

  const countEl = document.getElementById('bankHubKpiMatchedCount');
  if (countEl) {
    countEl.innerText = `${matchedCount} / 342 lệnh`;
    countEl.setAttribute('title', '342 giao dịch khớp lệnh tự động 100% trong tháng 11/2026');
  }
}

/**
 * Lọc dữ liệu theo điều kiện tìm kiếm, cổng, loại đối tượng và khoảng thời gian
 */
function getFilteredBankHubData() {
  const kw = (bankHubFilterState.keyword || '').trim().toLowerCase();
  const kwNoTone = typeof removeVietnameseTones === 'function' ? removeVietnameseTones(kw) : kw;

  return BANK_HUB_DATASET.filter(item => {
    // 1. Cổng thanh toán
    if (bankHubFilterState.gateway !== 'ALL') {
      if (item.gateway !== bankHubFilterState.gateway) return false;
    }

    // 2. Phân loại Khách hàng / Đại lý
    if (bankHubFilterState.partyType !== 'ALL') {
      if (item.partyType !== bankHubFilterState.partyType) return false;
    }

    // 3. Khoảng thời gian
    if (bankHubFilterState.timeRange === 'TODAY') {
      if (!item.date.startsWith('18/11/2026')) return false;
    }

    // 4. Từ khóa tìm kiếm đa năng
    if (kw) {
      const pName = (item.partyName || '').toLowerCase();
      const pNameNoTone = typeof removeVietnameseTones === 'function' ? removeVietnameseTones(pName) : pName;
      const match =
        (item.txCode || '').toLowerCase().includes(kw) ||
        (item.refCode || '').toLowerCase().includes(kw) ||
        (item.content || '').toLowerCase().includes(kw) ||
        (item.gateway || '').toLowerCase().includes(kw) ||
        (item.accountNumber || '').toLowerCase().includes(kw) ||
        (item.accountName || '').toLowerCase().includes(kw) ||
        (item.partyPhone || '').toLowerCase().includes(kw) ||
        (item.partyCode || '').toLowerCase().includes(kw) ||
        pName.includes(kw) ||
        pNameNoTone.includes(kwNoTone);

      if (!match) return false;
    }

    return true;
  });
}

/**
 * Áp dụng bộ lọc & Render lại bảng
 */
function applyBankHubFilters() {
  const filtered = getFilteredBankHubData();
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / bankHubFilterState.pageSize));

  if (bankHubFilterState.page > totalPages) {
    bankHubFilterState.page = totalPages;
  }

  const startIndex = (bankHubFilterState.page - 1) * bankHubFilterState.pageSize;
  const endIndex = Math.min(startIndex + bankHubFilterState.pageSize, totalItems);
  const pageItems = filtered.slice(startIndex, endIndex);

  renderBankHubTableRows(pageItems, startIndex);
  renderBankHubPagination(totalItems, startIndex, endIndex, totalPages);
}

/**
 * Render cấu trúc 9 cột chuẩn bảng Báo cáo Bankhub
 */
function renderBankHubTableRows(items, startIndex) {
  const tbody = document.getElementById('bankhubTableBody');
  if (!tbody) return;

  if (items.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="11" class="px-6 py-12 text-center text-slate-400">
          <div class="flex flex-col items-center justify-center gap-2">
            <i class="fa-solid fa-receipt text-3xl text-slate-300"></i>
            <span class="font-bold text-xs text-slate-500">Không tìm thấy giao dịch nạp tiền Bankhub nào phù hợp</span>
            <span class="text-[11px] text-slate-400">Vui lòng thử thay đổi từ khóa hoặc điều kiện lọc</span>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = items.map((item, idx) => {
    const stt = startIndex + idx + 1;

    // Cột 3: Khách hàng / Đại lý
    let partyCellHtml = '';
    if (item.partyType === 'AGENCY') {
      const codeLabel = item.partyCode || (item.agencyId ? `ID: ${item.agencyId}` : '-');
      partyCellHtml = `
        <div class="flex flex-col gap-0.5">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Đại lý</span>
            <span class="font-bold text-slate-900 leading-snug">${item.partyName}</span>
          </div>
          <div class="text-[11px] text-slate-500 font-medium flex items-center gap-2">
            <span>Mã ĐL: <strong class="font-mono text-slate-700">${codeLabel}</strong></span>
            ${item.partyPhone ? `<span class="text-slate-400 font-mono">• ${item.partyPhone}</span>` : ''}
          </div>
        </div>
      `;
    } else {
      partyCellHtml = `
        <div class="flex flex-col gap-0.5">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Khách lẻ</span>
            <span class="font-bold text-slate-900 leading-snug">${item.partyName}</span>
          </div>
          <div class="text-[11px] text-slate-500 font-mono">
            SĐT: <span class="font-bold text-slate-700">${item.partyPhone || '-'}</span>
          </div>
        </div>
      `;
    }

    // Cột 4: Cổng thanh toán (kèm icon ngân hàng)
    let gwIcon = 'fa-building-columns text-slate-500';
    if (item.gateway.includes('Vietcombank')) gwIcon = 'fa-building-columns text-emerald-600';
    else if (item.gateway.includes('MB')) gwIcon = 'fa-shield-halved text-blue-600';
    else if (item.gateway.includes('Sacombank')) gwIcon = 'fa-credit-card text-blue-800';
    else if (item.gateway.includes('VietinBank')) gwIcon = 'fa-landmark text-sky-700';
    else if (item.gateway.includes('ACB')) gwIcon = 'fa-vault text-blue-500';

    const gatewayCellHtml = `
      <div class="flex items-center gap-2 whitespace-nowrap">
        <div class="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-[10px] shrink-0">
          <i class="fa-solid ${gwIcon}"></i>
        </div>
        <span class="font-semibold text-slate-800">${item.gateway}</span>
      </div>
    `;

    // Cột 6: Tên tài khoản (hiển thị '-' nếu trống)
    const accountNameDisplay = item.accountName && item.accountName.trim()
      ? `<span class="font-semibold text-slate-800 whitespace-nowrap">${item.accountName}</span>`
      : `<span class="text-slate-400 font-bold">-</span>`;

    // Cột 8: Nội dung chuẩn TOPUP (khung mono xám nhạt)
    const contentBadgeHtml = `
      <span class="inline-block px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200/90 font-mono text-[11px] font-bold text-slate-800 tracking-tight whitespace-nowrap shadow-2xs select-all" title="Bấm đúp để copy nội dung">
        ${item.content}
      </span>
    `;

    // Cột 9: Số tiền (giá trị dương, định dạng tiền tệ, giữ whitespace-nowrap không rớt dòng)
    const formattedAmount = typeof formatMoney === 'function' ? formatMoney(item.amount) : item.amount.toLocaleString('vi-VN');

    return `
      <tr class="cf-row hover:bg-slate-50/85 transition-colors">
        <!-- 1. STT -->
        <td class="cf-cell text-center font-bold text-slate-400 w-12">${stt}</td>

        <!-- 2. Ngày giao dịch (DD/MM/YYYY HH:mm:ss) -->
        <td class="cf-cell whitespace-nowrap">
          <div class="flex items-center gap-1.5 font-medium text-slate-800">
            <i class="fa-regular fa-clock text-slate-400 text-[11px]"></i>
            <span class="font-mono text-slate-700 font-semibold">${item.date}</span>
          </div>
        </td>

        <!-- 3. Mã GD (Bankhub) -->
        <td class="cf-cell whitespace-nowrap">
          <span class="cf-code font-bold text-blue-700 tracking-tight">${item.txCode}</span>
        </td>

        <!-- 4. Khách Hàng / Đại Lý -->
        <td class="cf-cell min-w-[220px]">
          ${partyCellHtml}
        </td>

        <!-- 5. Cổng thanh toán -->
        <td class="cf-cell whitespace-nowrap">
          ${gatewayCellHtml}
        </td>

        <!-- 6. Số TK -->
        <td class="cf-cell whitespace-nowrap">
          <span class="font-mono font-bold text-slate-800 tracking-tight select-all">${item.accountNumber}</span>
        </td>

        <!-- 7. Tên tài khoản -->
        <td class="cf-cell min-w-[180px]">
          ${accountNameDisplay}
        </td>

        <!-- 8. Mã tham chiếu -->
        <td class="cf-cell whitespace-nowrap">
          <span class="cf-code font-bold text-slate-600 text-[11px] tracking-tight select-all">${item.refCode}</span>
        </td>

        <!-- 9. Nội dung nạp tiền -->
        <td class="cf-cell whitespace-nowrap">
          ${contentBadgeHtml}
        </td>

        <!-- 10. Số tiền nạp -->
        <td class="cf-cell whitespace-nowrap text-right pr-5">
          <span class="font-mono font-black text-emerald-600 text-[13px] tracking-tight whitespace-nowrap">+${formattedAmount} đ</span>
        </td>

        <!-- 11. Thao tác chuẩn system-filter-controls -->
        <td class="cf-cell text-center whitespace-nowrap pr-4">
          <div class="sfc-row-actions justify-center">
            <button type="button" onclick="viewBankHubDetail('${item.txCode}')" class="sfc-action-icon" title="Xem chi tiết" aria-label="Xem chi tiết">
              <i class="fa-regular fa-eye"></i>
            </button>
            <button type="button" onclick="editBankHubTransaction('${item.txCode}')" class="sfc-action-icon" title="Chỉnh sửa" aria-label="Chỉnh sửa">
              <i class="fa-regular fa-pen-to-square"></i>
            </button>
            <button type="button" onclick="deleteBankHubTransaction('${item.txCode}')" class="sfc-action-icon sfc-action-icon--danger" title="Xoá" aria-label="Xoá">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Render thanh phân trang
 */
function renderBankHubPagination(totalItems, startIndex, endIndex, totalPages) {
  const infoEl = document.getElementById('bankhubPaginationInfo');
  const controlsEl = document.getElementById('bankhubPaginationControls');
  if (!infoEl || !controlsEl) return;

  if (totalItems === 0) {
    infoEl.innerHTML = 'Hiển thị <span class="font-bold text-slate-800">0</span> giao dịch';
    controlsEl.innerHTML = '';
    return;
  }

  infoEl.innerHTML = `Đang hiển thị <span class="font-bold text-slate-800">${startIndex + 1} - ${endIndex}</span> / <span class="font-bold text-slate-800">${totalItems}</span> giao dịch`;

  let buttonsHtml = '';
  // Nút Prev
  const isPrevDisabled = bankHubFilterState.page <= 1;
  buttonsHtml += `
    <button type="button" onclick="goToBankHubPage(${bankHubFilterState.page - 1})" ${isPrevDisabled ? 'disabled' : ''} class="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold ${isPrevDisabled ? 'text-slate-300 cursor-not-allowed bg-slate-50' : 'text-slate-600 hover:bg-slate-100 cursor-pointer bg-white'} transition-colors">
      <i class="fa-solid fa-chevron-left text-[10px]"></i>
    </button>
  `;

  // Các số trang
  for (let p = 1; p <= totalPages; p++) {
    const isActive = p === bankHubFilterState.page;
    buttonsHtml += `
      <button type="button" onclick="goToBankHubPage(${p})" class="w-8 h-8 rounded-lg text-xs font-bold ${isActive ? 'bg-brand-500 text-white shadow-2xs' : 'border border-slate-200 text-slate-700 hover:bg-slate-100 bg-white cursor-pointer'} transition-colors">
        ${p}
      </button>
    `;
  }

  // Nút Next
  const isNextDisabled = bankHubFilterState.page >= totalPages;
  buttonsHtml += `
    <button type="button" onclick="goToBankHubPage(${bankHubFilterState.page + 1})" ${isNextDisabled ? 'disabled' : ''} class="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold ${isNextDisabled ? 'text-slate-300 cursor-not-allowed bg-slate-50' : 'text-slate-600 hover:bg-slate-100 cursor-pointer bg-white'} transition-colors">
      <i class="fa-solid fa-chevron-right text-[10px]"></i>
    </button>
  `;

  controlsEl.innerHTML = buttonsHtml;
}

function goToBankHubPage(page) {
  bankHubFilterState.page = page;
  applyBankHubFilters();
}

let bankHubSearchDebounceTimer = null;

/**
 * Gán sự kiện cho các ô lọc (Hỗ trợ Debounce 280ms cho ô tìm kiếm và Real-time Instant Filter khi chọn dropdown)
 */
function bindBankHubFilterEvents() {
  const searchInput = document.getElementById('bankHubSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      bankHubFilterState.keyword = e.target.value;
      bankHubFilterState.page = 1;
      if (bankHubSearchDebounceTimer) clearTimeout(bankHubSearchDebounceTimer);
      bankHubSearchDebounceTimer = setTimeout(() => {
        applyBankHubFilters();
      }, 280);
    });
  }

  const gatewaySelect = document.getElementById('bankHubGatewaySelect');
  if (gatewaySelect) {
    gatewaySelect.addEventListener('change', (e) => {
      bankHubFilterState.gateway = e.target.value;
      bankHubFilterState.page = 1;
      applyBankHubFilters();
    });
  }

  const partyTypeSelect = document.getElementById('bankHubPartyTypeSelect');
  if (partyTypeSelect) {
    partyTypeSelect.addEventListener('change', (e) => {
      bankHubFilterState.partyType = e.target.value;
      bankHubFilterState.page = 1;
      applyBankHubFilters();
    });
  }

  const timeRangeSelect = document.getElementById('bankHubTimeRangeSelect');
  if (timeRangeSelect) {
    timeRangeSelect.addEventListener('change', (e) => {
      bankHubFilterState.timeRange = e.target.value;
      bankHubFilterState.page = 1;
      applyBankHubFilters();
    });
  }
}

/**
 * Đặt lại toàn bộ bộ lọc về trạng thái mặc định "Tất cả"
 */
function resetBankHubFilters() {
  bankHubFilterState.keyword = '';
  bankHubFilterState.gateway = 'ALL';
  bankHubFilterState.partyType = 'ALL';
  bankHubFilterState.timeRange = 'ALL';
  bankHubFilterState.page = 1;

  const searchInput = document.getElementById('bankHubSearchInput');
  if (searchInput) searchInput.value = '';
  const gatewaySelect = document.getElementById('bankHubGatewaySelect');
  if (gatewaySelect) gatewaySelect.value = 'ALL';
  const partyTypeSelect = document.getElementById('bankHubPartyTypeSelect');
  if (partyTypeSelect) partyTypeSelect.value = 'ALL';
  const timeRangeSelect = document.getElementById('bankHubTimeRangeSelect');
  if (timeRangeSelect) timeRangeSelect.value = 'ALL';

  applyBankHubFilters();

  if (typeof showToast === 'function') {
    showToast('Đặt lại bộ lọc', 'Đã khôi phục các điều kiện lọc về mặc định', 'info');
  }
}

/**
 * Xem chi tiết giao dịch Bankhub (Thao tác Icon 👁)
 */
function viewBankHubDetail(txCode) {
  const item = BANK_HUB_DATASET.find(x => x.txCode === txCode);
  if (!item) return;

  const modalHtml = `
    <div id="bankHubDetailModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm">
              <i class="fa-solid fa-receipt"></i>
            </div>
            <div>
              <h3 class="font-bold text-slate-900 text-sm">Chi tiết giao dịch Bankhub</h3>
              <p class="text-[11px] text-slate-400 font-mono">${item.txCode}</p>
            </div>
          </div>
          <button type="button" onclick="closeBankHubDetailModal()" class="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="py-4 space-y-3 text-xs">
          <div class="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <div>
              <span class="text-slate-400 font-bold text-[10px] uppercase block">Số tiền nạp</span>
              <span class="font-mono font-extrabold text-emerald-600 text-base">+${typeof formatMoney === 'function' ? formatMoney(item.amount) : item.amount.toLocaleString('vi-VN')} đ</span>
            </div>
            <div>
              <span class="text-slate-400 font-bold text-[10px] uppercase block">Trạng thái đối soát</span>
              <span class="inline-flex items-center gap-1 text-emerald-700 font-bold"><i class="fa-solid fa-circle-check text-xs"></i> Khớp lệnh tự động 100%</span>
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex justify-between py-1 border-b border-slate-100">
              <span class="text-slate-500 font-medium">Thời gian giao dịch:</span>
              <span class="font-mono font-semibold text-slate-800">${item.date}</span>
            </div>
            <div class="flex justify-between py-1 border-b border-slate-100">
              <span class="text-slate-500 font-medium">Đối tượng:</span>
              <span class="font-bold text-slate-800">${item.partyName} (${item.partyType === 'AGENCY' ? 'Đại lý' : 'Khách lẻ'})</span>
            </div>
            <div class="flex justify-between py-1 border-b border-slate-100">
              <span class="text-slate-500 font-medium">Cổng / Ngân hàng:</span>
              <span class="font-semibold text-slate-800">${item.gateway}</span>
            </div>
            <div class="flex justify-between py-1 border-b border-slate-100">
              <span class="text-slate-500 font-medium">Số tài khoản:</span>
              <span class="font-mono font-bold text-slate-800">${item.accountNumber}</span>
            </div>
            <div class="flex justify-between py-1 border-b border-slate-100">
              <span class="text-slate-500 font-medium">Tên tài khoản:</span>
              <span class="font-semibold text-slate-800">${item.accountName || '-'}</span>
            </div>
            <div class="flex justify-between py-1 border-b border-slate-100">
              <span class="text-slate-500 font-medium">Mã tham chiếu NH:</span>
              <span class="font-mono text-slate-700">${item.refCode}</span>
            </div>
            <div class="flex justify-between py-1">
              <span class="text-slate-500 font-medium">Cú pháp nội dung:</span>
              <span class="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">${item.content}</span>
            </div>
          </div>
        </div>

        <div class="flex justify-end pt-3 border-t border-slate-100">
          <button type="button" onclick="closeBankHubDetailModal()" class="sfc-btn-primary">
            Đóng
          </button>
        </div>
      </div>
    </div>
  `;

  const existing = document.getElementById('bankHubDetailModal');
  if (existing) existing.remove();
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function closeBankHubDetailModal() {
  const el = document.getElementById('bankHubDetailModal');
  if (el) el.remove();
}

function editBankHubTransaction(txCode) {
  if (typeof showToast === 'function') {
    showToast('Chỉnh sửa giao dịch', `Mở form cập nhật đối soát cho mã ${txCode}`, 'info');
  } else {
    alert(`Mở form cập nhật đối soát cho mã ${txCode}`);
  }
}

function deleteBankHubTransaction(txCode) {
  if (confirm(`Bạn có chắc chắn muốn xoá/thu hồi giao dịch đối soát ${txCode}?`)) {
    if (typeof showToast === 'function') {
      showToast('Xoá giao dịch', `Đã xoá giao dịch ${txCode}`, 'warning');
    }
  }
}

function toggleColumnCustomizer() {
  if (typeof showToast === 'function') {
    showToast('Tùy chỉnh cột', 'Mở bảng thiết lập ẩn/hiện cột bảng báo cáo', 'info');
  } else {
    alert('Mở bảng thiết lập ẩn/hiện cột');
  }
}

function exportBankhubExcel() {
  const data = getFilteredBankHubData();
  if (data.length === 0) {
    if (typeof showToast === 'function') {
      showToast('Xuất dữ liệu', 'Không có dữ liệu giao dịch nào để xuất.', 'warning');
    } else {
      alert('Không có dữ liệu giao dịch nào để xuất.');
    }
    return;
  }

  const headers = ['STT', 'Ngày giao dịch', 'Mã GD (Bankhub)', 'Loại đối tượng', 'Khách hàng / Đại lý', 'Mã ĐL / SĐT', 'Cổng thanh toán', 'Số TK', 'Tên tài khoản', 'Mã tham chiếu', 'Nội dung nạp', 'Số tiền (VNĐ)'];
  const rows = data.map((item, idx) => [
    idx + 1,
    item.date,
    item.txCode,
    item.partyType === 'AGENCY' ? 'Đại lý' : 'Khách lẻ',
    `"${item.partyName.replace(/"/g, '""')}"`,
    item.partyType === 'AGENCY' ? item.partyCode : item.partyPhone,
    item.gateway,
    `'${item.accountNumber}`,
    `"${(item.accountName || '-').replace(/"/g, '""')}"`,
    item.refCode,
    item.content,
    item.amount
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Bao_Cao_Bankhub_Topup_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  if (typeof showToast === 'function') {
    showToast('Xuất Excel thành công', `Đã xuất ${data.length} giao dịch nạp tiền Bankhub.`);
  }
}

/**
 * Tải lại dữ liệu Bankhub
 */
function refreshBankhubData() {
  bankHubFilterState.keyword = '';
  bankHubFilterState.gateway = 'ALL';
  bankHubFilterState.partyType = 'ALL';
  bankHubFilterState.timeRange = 'MONTH';
  bankHubFilterState.page = 1;

  const searchInput = document.getElementById('bankHubSearchInput');
  if (searchInput) searchInput.value = '';

  const gatewaySelect = document.getElementById('bankHubGatewaySelect');
  if (gatewaySelect) gatewaySelect.value = 'ALL';

  const partyTypeSelect = document.getElementById('bankHubPartyTypeSelect');
  if (partyTypeSelect) partyTypeSelect.value = 'ALL';

  const timeRangeSelect = document.getElementById('bankHubTimeRangeSelect');
  if (timeRangeSelect) timeRangeSelect.value = 'MONTH';

  renderBankHubKpis();
  applyBankHubFilters();

  if (typeof showToast === 'function') {
    showToast('Làm mới thành công', 'Dữ liệu giao dịch Bankhub và chỉ số nạp tiền đã được cập nhật mới nhất.');
  }
}

// Khởi chạy khi DOM sẵn sàng
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBankHubPage);
  } else {
    initBankHubPage();
  }
}

// Global exports
window.initBankHubPage = initBankHubPage;
window.applyBankHubFilters = applyBankHubFilters;
window.goToBankHubPage = goToBankHubPage;
window.exportBankhubExcel = exportBankhubExcel;
window.refreshBankhubData = refreshBankhubData;
