// ============================================================================
// ORDERS LIST ENGINE: VERTICAL SCROLL LAYOUT & ADVANCED FILTERS (orders.html)
// ============================================================================

let ordersListPage = 1;
const ORDERS_LIST_PAGE_SIZE = 10;

let ordersListFilterState = {
  search: '',
  status: 'ALL',
  paymentStatus: 'ALL',
  datePreset: 'this_month',
  startDate: '2026-11-01',
  endDate: '2026-11-18',
  channel: 'ALL',
  corp: 'ALL',
  region: 'ALL',
  tab: 'ALL'
};

let currentRefundOrderCode = null;

// Khu vực địa lý theo địa điểm KDL
const SITE_REGION_MAPPING = {
  'Sun World Ba Na Hills': 'Đà Nẵng',
  'Sun World Bà Đen Mountain': 'Tây Ninh',
  'Sun World Hon Thom': 'Kiên Giang',
  'Sun World Hạ Long': 'Quảng Ninh',
  'Sun World Fansipan Legend': 'Lào Cai',
  'VinWonders Phú Quốc': 'Kiên Giang',
  'VinWonders Nha Trang': 'Khánh Hòa',
  'VinWonders Nam Hội An': 'Quảng Nam',
  'VinWonders Grand World': 'Kiên Giang',
  'Công viên Nước Đầm Sen': 'TP. Hồ Chí Minh',
  'Khu du lịch Suối Tiên': 'TP. Hồ Chí Minh'
};

function getOrderRegion(order) {
  if (order.region) return order.region;
  if (order.site && SITE_REGION_MAPPING[order.site]) return SITE_REGION_MAPPING[order.site];
  return 'Khác';
}

function getOrderPaymentStatus(order) {
  if (order.paymentStatus) return order.paymentStatus;
  const s = order.status || '';
  if (s === 'Đã hoàn tiền' || s === 'Hoàn tiền') return 'Đã hoàn tiền';
  if (s === 'Đã hủy') return 'Đã hủy';
  if (s === 'Thất bại') return 'Thất bại';
  if (s === 'Đang hoàn tiền') return 'Đang hoàn tiền';
  if (['Đã xuất vé', 'Đã xác nhận', 'Đã thanh toán', 'Hoàn tất'].includes(s)) return 'Thành công';
  return 'Đang chờ';
}

function getCustomerInitials(name) {
  if (!name) return 'KH';
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'KH';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  // Lấy chữ cái đầu của 2 từ đầu (ví dụ: "Nguyễn Diệu Linh" -> "ND", "Kim Hoàng" -> "KH")
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function formatOrderCreatedDateTime(dateStr, seed = 0) {
  if (!dateStr) return '06/11/2026 11:55';
  if (dateStr.includes('T') || dateStr.includes(' ')) {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const pad = n => String(n).padStart(2, '0');
      return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }
  }
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const hours = 8 + (Math.abs(seed) % 10);
    const mins = Math.abs(seed * 7) % 60;
    const pad = n => String(n).padStart(2, '0');
    return `${parts[2]}/${parts[1]}/${parts[0]} ${pad(hours)}:${pad(mins)}`;
  }
  return dateStr;
}

function formatCompactRevenue(amount) {
  return typeof formatKpiCurrency === 'function' ? formatKpiCurrency(amount) : `${formatMoney(amount)} đ`;
}

function getStatusBadgeMarkup(status) {
  switch (status) {
    case 'Đã xuất vé':
      return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-bold whitespace-nowrap bg-emerald-50 text-emerald-700 border border-emerald-200">Đã xuất vé</span>`;
    case 'Đã xác nhận':
      return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-bold whitespace-nowrap bg-blue-50 text-blue-700 border border-blue-200">Đã xác nhận</span>`;
    case 'Đang xử lý':
      return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-bold whitespace-nowrap bg-amber-50 text-amber-700 border border-amber-200">Đang xử lý</span>`;
    case 'Đợi thanh toán':
      return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-bold whitespace-nowrap bg-sky-50 text-sky-700 border border-sky-200">Đợi thanh toán</span>`;
    case 'Nháp':
      return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-bold whitespace-nowrap bg-slate-100 text-slate-600 border border-slate-200">Nháp</span>`;
    case 'Đã hủy':
      return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-bold whitespace-nowrap bg-orange-50 text-orange-700 border border-orange-200">Đã hủy</span>`;
    case 'Đã hoàn tiền':
    case 'Hoàn tiền':
      return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-bold whitespace-nowrap bg-purple-50 text-purple-700 border border-purple-200">Đã hoàn tiền</span>`;
    case 'Thất bại':
      return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-bold whitespace-nowrap bg-rose-50 text-rose-700 border border-rose-200">Thất bại</span>`;
    default:
      return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-bold whitespace-nowrap bg-slate-100 text-slate-600 border border-slate-200">${status || 'Chờ xử lý'}</span>`;
  }
}

// ============================================================================
// DATE RANGE PICKER HANDLERS
// ============================================================================

// ============================================================================
// DATE RANGE PICKER DROPDOWN & CALENDAR CONTROLLER
// ============================================================================

let calendarYear = 2026;
let calendarMonth = 10; // 0-based: 10 = Tháng 11
let tempRangeStart = '2026-11-01';
let tempRangeEnd = '2026-11-17';
let tempPreset = 'this_month'; // '7_days', '30_days', 'this_month', 'custom'
let calendarSelectPhase = 'completed'; // 'start' (chờ chọn ngày bắt đầu), 'end' (chờ chọn ngày kết thúc), 'completed' (đã chọn đủ 2 ngày)

function formatVnDate(isoDate) {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return isoDate;
}

function updateDateRangePresetPills() {
  const pills = [
    { id: 'btnPresetTag_7days', key: '7_days', label: '7 ngày' },
    { id: 'btnPresetTag_30days', key: '30_days', label: '30 ngày' },
    { id: 'btnPresetTag_this_month', key: 'this_month', label: 'Tháng này' },
    { id: 'btnPresetTag_quarter', key: 'quarter', label: 'Quý' },
    { id: 'btnPresetTag_custom', key: 'custom', label: 'Tùy chỉnh' }
  ];

  pills.forEach(p => {
    const el = document.getElementById(p.id);
    if (!el) return;
    if (tempPreset === p.key) {
      el.className = 'preset-tag-btn px-3 py-1.5 rounded-lg font-bold bg-blue-600 text-white shadow-xs cursor-pointer whitespace-nowrap transition-all flex items-center gap-1.5';
    } else {
      el.className = 'preset-tag-btn px-3 py-1.5 rounded-lg font-bold border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 cursor-pointer whitespace-nowrap transition-all flex items-center gap-1.5';
    }
  });

  const dot = document.getElementById('customPresetDot');
  if (dot) {
    if (tempPreset === 'custom') {
      dot.classList.remove('hidden');
      dot.className = 'w-1.5 h-1.5 rounded-full bg-white shrink-0';
    } else {
      dot.classList.add('hidden');
    }
  }

  // Header status text
  const labelEl = document.getElementById('dateRangePickerActiveTagLabel');
  if (labelEl) {
    const activeObj = pills.find(p => p.key === tempPreset);
    labelEl.innerText = activeObj ? activeObj.label : 'Tùy chỉnh';
  }

  // Display start & end cards
  const startCard = document.getElementById('displayRangeStartDate');
  const endCard = document.getElementById('displayRangeEndDate');
  if (startCard) {
    if (tempRangeStart) {
      startCard.innerText = formatVnDate(tempRangeStart);
      startCard.className = 'font-black text-slate-800 text-xs tracking-tight';
    } else {
      startCard.innerText = '--/--/----';
      startCard.className = 'font-bold text-slate-400 text-xs tracking-tight italic';
    }
  }
  if (endCard) {
    if (tempRangeEnd) {
      endCard.innerText = formatVnDate(tempRangeEnd);
      endCard.className = 'font-black text-slate-800 text-xs tracking-tight';
    } else if (calendarSelectPhase === 'end') {
      endCard.innerText = 'Chọn ngày kết thúc';
      endCard.className = 'font-bold text-blue-600 text-xs tracking-tight animate-pulse';
    } else {
      endCard.innerText = '--/--/----';
      endCard.className = 'font-bold text-slate-400 text-xs tracking-tight italic';
    }
  }
}

function selectDateRangeTagPreset(event, preset) {
  if (event) {
    event.stopPropagation();
  }
  tempPreset = preset;
  if (preset === '7_days') {
    tempRangeStart = '2026-11-12';
    tempRangeEnd = '2026-11-18';
    calendarSelectPhase = 'completed';
  } else if (preset === '30_days') {
    tempRangeStart = '2026-10-20';
    tempRangeEnd = '2026-11-18';
    calendarSelectPhase = 'completed';
  } else if (preset === 'this_month') {
    tempRangeStart = '2026-11-01';
    tempRangeEnd = '2026-11-18';
    calendarSelectPhase = 'completed';
  } else if (preset === 'quarter') {
    tempRangeStart = '2026-10-01';
    tempRangeEnd = '2026-11-18';
    calendarSelectPhase = 'completed';
  } else if (preset === 'custom') {
    // Bước 1 – Kích hoạt chế độ Tùy chỉnh:
    // Chuyển trạng thái bộ lọc sang chế độ nhận khoảng (Range Mode),
    // làm mới 2 ô hiển thị TỪ NGÀY và ĐẾN NGÀY, đồng thời GIỮ MỞ Dropdown lịch.
    tempRangeStart = null;
    tempRangeEnd = null;
    calendarSelectPhase = 'start';
  }

  // Sync calendar view month
  const targetDate = tempRangeEnd || tempRangeStart || '2026-11-18';
  const parts = targetDate.split('-');
  if (parts.length === 3) {
    calendarYear = parseInt(parts[0], 10);
    calendarMonth = parseInt(parts[1], 10) - 1;
  }

  updateDateRangePresetPills();
  renderCalendarView();
}

function navigateCalendarMonth(event, delta) {
  if (event) {
    event.stopPropagation();
  }
  calendarMonth += delta;
  if (calendarMonth < 0) {
    calendarMonth = 11;
    calendarYear--;
  } else if (calendarMonth > 11) {
    calendarMonth = 0;
    calendarYear++;
  }
  renderCalendarView();
}

function onCalendarDayClick(event, isoDate) {
  if (event) {
    event.stopPropagation();
  }

  // Luồng nghiệp vụ 2 bước chuẩn cho chế độ "Tùy chỉnh":
  if (calendarSelectPhase === 'start' || calendarSelectPhase === 'completed' || !tempRangeStart) {
    // Bước 2 – Chọn Ngày bắt đầu (Start Date):
    // Người dùng click chọn ngày đầu tiên trên lưới lịch (VD: ngày 01/10/2026).
    // Ô TỪ NGÀY hiển thị giá trị 01/10/2026, ngày đó trên lịch đổi sang trạng thái được highlight (màu xanh đậm),
    // Dropdown KHÔNG ĐƯỢC TỰ ĐỘNG TẮT, hệ thống chuyển sang trạng thái chờ chọn ngày kết thúc.
    tempRangeStart = isoDate;
    tempRangeEnd = null;
    calendarSelectPhase = 'end';
    tempPreset = 'custom';
  } else if (calendarSelectPhase === 'end') {
    // Bước 3 – Chọn Ngày kết thúc (End Date) & Xác nhận:
    // Người dùng click chọn ngày thứ hai (VD: ngày 04/10/2026).
    if (isoDate < tempRangeStart) {
      // Nếu click ngày nhỏ hơn ngày bắt đầu -> ngày này trở thành Ngày bắt đầu mới
      tempRangeStart = isoDate;
      tempRangeEnd = null;
      calendarSelectPhase = 'end';
      tempPreset = 'custom';
    } else {
      // Ngày click >= ngày bắt đầu:
      // Ô ĐẾN NGÀY hiển thị giá trị (VD: 04/10/2026), các ngày nằm giữa ngày 1 và ngày 4 được phủ nền xanh nhạt (Range Highlight).
      // Dropdown VẪN TIẾP TỤC GIỮ MỞ, cho phép người dùng kiểm tra lại dải ngày đã chọn.
      tempRangeEnd = isoDate;
      calendarSelectPhase = 'completed';
      tempPreset = 'custom';
    }
  }

  updateDateRangePresetPills();
  renderCalendarView();
  // Dropdown tiếp tục giữ mở!
}

function renderCalendarView() {
  const titleEl = document.getElementById('calendarCurrentMonthTitle');
  if (titleEl) {
    titleEl.innerText = `Tháng ${calendarMonth + 1}, ${calendarYear}`;
  }

  const gridEl = document.getElementById('calendarDaysGrid');
  if (!gridEl) return;

  const firstDayObj = new Date(calendarYear, calendarMonth, 1);
  const jsDay = firstDayObj.getDay();
  const startDayOffset = jsDay === 0 ? 6 : jsDay - 1;

  const totalDays = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const prevMonthTotalDays = new Date(calendarYear, calendarMonth, 0).getDate();

  let html = '';

  // Ghost days from previous month
  for (let i = startDayOffset - 1; i >= 0; i--) {
    const prevDay = prevMonthTotalDays - i;
    html += `<div class="h-8 flex items-center justify-center text-slate-300 text-[11px] pointer-events-none select-none">${prevDay}</div>`;
  }

  // Days in current month
  for (let day = 1; day <= totalDays; day++) {
    const dayStr = String(day).padStart(2, '0');
    const mStr = String(calendarMonth + 1).padStart(2, '0');
    const isoDate = `${calendarYear}-${mStr}-${dayStr}`;

    const isStart = tempRangeStart && isoDate === tempRangeStart;
    const isEnd = tempRangeEnd && isoDate === tempRangeEnd;
    const isSingleDayRange = isStart && isEnd;
    const isInRange = tempRangeStart && tempRangeEnd && (isoDate > tempRangeStart && isoDate < tempRangeEnd);
    const isOnlyStartPicked = isStart && !tempRangeEnd;

    if (isSingleDayRange) {
      html += `
        <div class="h-8 flex items-center justify-center relative">
          <button type="button" onclick="onCalendarDayClick(event, '${isoDate}')" class="w-7 h-7 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs cursor-pointer active:scale-95 transition-transform z-10">
            ${day}
          </button>
        </div>
      `;
    } else if (isOnlyStartPicked) {
      // Highlight màu xanh đậm khi chỉ mới chọn Ngày bắt đầu
      html += `
        <div class="h-8 flex items-center justify-center relative">
          <button type="button" onclick="onCalendarDayClick(event, '${isoDate}')" class="w-7 h-7 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-md ring-4 ring-blue-100 cursor-pointer active:scale-95 transition-transform z-10">
            ${day}
          </button>
        </div>
      `;
    } else if (isStart) {
      // Ngày bắt đầu trong dải ngày
      html += `
        <div class="h-8 flex items-center justify-center relative bg-gradient-to-r from-transparent to-blue-50/90 rounded-l-full">
          <button type="button" onclick="onCalendarDayClick(event, '${isoDate}')" class="w-7 h-7 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs cursor-pointer active:scale-95 transition-transform z-10">
            ${day}
          </button>
        </div>
      `;
    } else if (isEnd) {
      // Ngày kết thúc trong dải ngày
      html += `
        <div class="h-8 flex items-center justify-center relative bg-gradient-to-l from-transparent to-blue-50/90 rounded-r-full">
          <button type="button" onclick="onCalendarDayClick(event, '${isoDate}')" class="w-7 h-7 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs cursor-pointer active:scale-95 transition-transform z-10">
            ${day}
          </button>
        </div>
      `;
    } else if (isInRange) {
      // Các ngày nằm giữa ngày bắt đầu và ngày kết thúc: phủ nền xanh nhạt (Range Highlight)
      html += `
        <div class="h-8 flex items-center justify-center bg-blue-50/90">
          <button type="button" onclick="onCalendarDayClick(event, '${isoDate}')" class="w-full h-full text-blue-900 font-bold text-xs flex items-center justify-center cursor-pointer hover:bg-blue-100/70 transition-colors">
            ${day}
          </button>
        </div>
      `;
    } else {
      // Ngày bình thường
      html += `
        <div class="h-8 flex items-center justify-center">
          <button type="button" onclick="onCalendarDayClick(event, '${isoDate}')" class="w-7 h-7 rounded-full hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center transition-colors cursor-pointer">
            ${day}
          </button>
        </div>
      `;
    }
  }

  const totalRendered = startDayOffset + totalDays;
  const trailingCount = (7 - (totalRendered % 7)) % 7;
  for (let i = 1; i <= trailingCount; i++) {
    html += `<div class="h-8 flex items-center justify-center text-slate-300 text-[11px] pointer-events-none select-none">${i}</div>`;
  }

  gridEl.innerHTML = html;
}

function toggleDateRangePickerPopover(event) {
  if (event) {
    event.stopPropagation();
  }
  const popover = document.getElementById('popoverDateRangePicker');
  if (!popover) return;

  const isOpening = popover.classList.contains('hidden');
  if (isOpening) {
    tempRangeStart = ordersListFilterState.startDate || '2026-11-01';
    tempRangeEnd = ordersListFilterState.endDate || '2026-11-17';
    tempPreset = ordersListFilterState.datePreset || 'this_month';
    calendarSelectPhase = 'completed';

    const targetDate = tempRangeEnd || tempRangeStart || '2026-11-17';
    const parts = targetDate.split('-');
    if (parts.length === 3) {
      calendarYear = parseInt(parts[0], 10);
      calendarMonth = parseInt(parts[1], 10) - 1;
    }

    updateDateRangePresetPills();
    renderCalendarView();
    popover.classList.remove('hidden');
  } else {
    popover.classList.add('hidden');
  }
}

function closeDateRangePickerPopover() {
  const popover = document.getElementById('popoverDateRangePicker');
  if (popover) {
    popover.classList.add('hidden');
  }
}

function cancelDateRangePicker(event) {
  if (event) {
    event.stopPropagation();
  }
  tempRangeStart = ordersListFilterState.startDate || '2026-11-01';
  tempRangeEnd = ordersListFilterState.endDate || '2026-11-18';
  tempPreset = ordersListFilterState.datePreset || 'this_month';
  calendarSelectPhase = 'completed';
  closeDateRangePickerPopover();
}

function applyDateRangePickerSelection(event) {
  if (event) {
    event.stopPropagation();
  }

  // Thao tác đóng Dropdown chỉ xảy ra khi người dùng bấm nút Áp dụng (hoặc bấm ra ngoài vùng chọn / nút Hủy)
  if (tempRangeStart && !tempRangeEnd) {
    tempRangeEnd = tempRangeStart;
  }
  if (!tempRangeStart && !tempRangeEnd) {
    tempRangeStart = '2026-11-01';
    tempRangeEnd = '2026-11-18';
    tempPreset = 'this_month';
  }

  ordersListFilterState.startDate = tempRangeStart;
  ordersListFilterState.endDate = tempRangeEnd;
  ordersListFilterState.datePreset = tempPreset;

  const txtEl = document.getElementById('dateRangePickerDisplayText');
  if (txtEl) {
    if (tempRangeStart === tempRangeEnd) {
      txtEl.innerText = formatVnDate(tempRangeStart);
    } else {
      txtEl.innerText = `${formatVnDate(tempRangeStart)} - ${formatVnDate(tempRangeEnd)}`;
    }
  }

  closeDateRangePickerPopover();
  ordersListPage = 1;
  applyOrdersListFilters();
}

// Đóng popover chỉ khi click ra ngoài vùng chọn
document.addEventListener('click', (e) => {
  const popover = document.getElementById('popoverDateRangePicker');
  const trigger = document.getElementById('btnDateRangePickerTrigger');
  if (!popover || popover.classList.contains('hidden')) return;

  const path = (typeof e.composedPath === 'function') ? e.composedPath() : [];
  if (path.includes(popover) || path.includes(trigger)) {
    return;
  }

  if (trigger && trigger.contains(e.target)) return;
  if (popover && popover.contains(e.target)) return;

  cancelDateRangePicker();
});
// ============================================================================
// FILTER & SEARCH ACTIONS
// ============================================================================

function applyOrdersListFilters() {
  const searchEl = document.getElementById('ordersSearchInput');
  const statusEl = document.getElementById('ordersStatusFilter');
  const paymentStatusEl = document.getElementById('ordersPaymentStatusFilter');
  const channelEl = document.getElementById('ordersChannelFilter');
  const corpEl = document.getElementById('ordersCorpFilter');
  const regionEl = document.getElementById('ordersRegionFilter');

  ordersListFilterState.search = searchEl ? searchEl.value.toLowerCase().trim() : '';
  ordersListFilterState.status = statusEl ? statusEl.value : 'ALL';
  ordersListFilterState.paymentStatus = paymentStatusEl ? paymentStatusEl.value : 'ALL';
  ordersListFilterState.channel = channelEl ? channelEl.value : 'ALL';
  ordersListFilterState.corp = corpEl ? corpEl.value : 'ALL';
  ordersListFilterState.region = regionEl ? regionEl.value : 'ALL';

  ordersListPage = 1;
  renderOrdersListView();
}

function resetOrdersListFilters() {
  const searchEl = document.getElementById('ordersSearchInput');
  const statusEl = document.getElementById('ordersStatusFilter');
  const paymentStatusEl = document.getElementById('ordersPaymentStatusFilter');
  const channelEl = document.getElementById('ordersChannelFilter');
  const corpEl = document.getElementById('ordersCorpFilter');
  const regionEl = document.getElementById('ordersRegionFilter');

  if (searchEl) searchEl.value = '';
  if (statusEl) statusEl.value = 'ALL';
  if (paymentStatusEl) paymentStatusEl.value = 'ALL';
  if (channelEl) channelEl.value = 'ALL';
  if (corpEl) corpEl.value = 'ALL';
  if (regionEl) regionEl.value = 'ALL';

  ordersListFilterState = {
    search: '',
    status: 'ALL',
    paymentStatus: 'ALL',
    datePreset: 'this_month',
    startDate: '2026-11-01',
    endDate: '2026-11-17',
    channel: 'ALL',
    corp: 'ALL',
    region: 'ALL',
    tab: 'ALL'
  };

  const txtEl = document.getElementById('dateRangePickerDisplayText');
  if (txtEl) txtEl.innerText = '01/11/2026 - 18/11/2026';
  tempRangeStart = '2026-11-01';
  tempRangeEnd = '2026-11-18';
  tempPreset = 'this_month';
  updateDateRangePresetPills();

  selectOrdersChannelTab('ALL', false);
  ordersListPage = 1;
  renderOrdersListView();
}

function selectOrdersChannelTab(tab, triggerRender = true) {
  ordersListFilterState.tab = tab;
  const tabs = ['ALL', 'Website', 'Đại lý', 'Nội bộ'];
  tabs.forEach(t => {
    const el = document.getElementById(`tabChannel_${t}`);
    if (el) {
      if (t === tab) {
        el.className = 'flex-1 py-2 text-center rounded-xl font-bold transition-all bg-white text-blue-700 shadow-xs cursor-pointer';
      } else {
        el.className = 'flex-1 py-2 text-center rounded-xl font-semibold text-slate-600 hover:text-slate-900 transition-all cursor-pointer';
      }
    }
  });

  if (triggerRender) {
    ordersListPage = 1;
    renderOrdersListView();
  }
}

function changeOrdersListPage(page) {
  ordersListPage = page;
  renderOrdersListView();
  window.scrollTo({ top: 380, behavior: 'smooth' });
}

// ============================================================================
// MAIN RENDER VIEW: KPIS + ORDER CARDS FEED + PAGINATION
// ============================================================================

function renderOrdersListView() {
  const allOrders = TecheraDB.getOrders();
  const q = ordersListFilterState.search;

  // Filter pipeline
  const filtered = allOrders.filter(order => {
    // 1. Search keyword
    if (q) {
      const haystack = `${order.orderCode} ${order.customerName} ${order.customerPhone || ''} ${order.staff || ''} ${order.salesOwner || ''} ${order.site || ''} ${order.packageName || ''}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    // 2. Status filter
    if (ordersListFilterState.status !== 'ALL') {
      if (ordersListFilterState.status === 'Đã hoàn tiền') {
        if (order.status !== 'Đã hoàn tiền' && order.status !== 'Hoàn tiền') return false;
      } else if (order.status !== ordersListFilterState.status) {
        return false;
      }
    }

    // 3. Payment Status filter
    if (ordersListFilterState.paymentStatus !== 'ALL') {
      const pStatus = getOrderPaymentStatus(order);
      if (pStatus !== ordersListFilterState.paymentStatus) return false;
    }

    // 4. Date range filter
    if (ordersListFilterState.startDate && ordersListFilterState.endDate) {
      const createdIso = String(order.createdDate || '').slice(0, 10);
      if (createdIso < ordersListFilterState.startDate || createdIso > ordersListFilterState.endDate) {
        return false;
      }
    }

    // 5. Channel filter from dropdown
    if (ordersListFilterState.channel !== 'ALL') {
      if (!String(order.channel || '').includes(ordersListFilterState.channel)) return false;
    }

    // 6. Corporation filter
    if (ordersListFilterState.corp !== 'ALL') {
      if (order.corp !== ordersListFilterState.corp) return false;
    }

    // 7. Region filter
    if (ordersListFilterState.region !== 'ALL') {
      const reg = getOrderRegion(order);
      if (reg !== ordersListFilterState.region) return false;
    }

    // 8. Segmented Tab
    if (ordersListFilterState.tab !== 'ALL') {
      if (!String(order.channel || '').includes(ordersListFilterState.tab)) return false;
    }

    return true;
  });

  // Calculate KPIs based on current filtered orders
  const completedOrders = filtered.filter(o => ['Đã xuất vé', 'Đã xác nhận', 'Hoàn tất'].includes(o.status));
  const processingOrders = filtered.filter(o => ['Đang xử lý', 'Đợi thanh toán', 'Nháp'].includes(o.status));

  const completedRevenue = completedOrders.reduce((sum, o) => sum + (o.revenue || 0), 0);
  const completedProfit = completedOrders.reduce((sum, o) => sum + (o.profit || 0), 0);

  // Update KPI card DOM
  const setEl = (id, txt) => {
    const el = document.getElementById(id);
    if (el) el.innerText = txt;
  };
  setEl('kpiCompletedOrders', formatMoney(completedOrders.length));
  setEl('kpiProcessingOrders', formatMoney(processingOrders.length));
  if (typeof setKpiCardValue === 'function') {
    setKpiCardValue('kpiActualRevenue', completedRevenue);
    setKpiCardValue('kpiActualProfit', completedProfit);
  } else {
    setEl('kpiActualRevenue', formatCompactRevenue(completedRevenue));
    setEl('kpiActualProfit', `${formatMoney(completedProfit)} đ`);
  }

  // Update feed counter badge
  setEl('ordersFeedCountBadge', filtered.length);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filtered.length / ORDERS_LIST_PAGE_SIZE));
  ordersListPage = Math.min(Math.max(1, ordersListPage), totalPages);
  const pageSlice = filtered.slice((ordersListPage - 1) * ORDERS_LIST_PAGE_SIZE, ordersListPage * ORDERS_LIST_PAGE_SIZE);

  // Render Order Feed: Desktop Table (>= 1024px) & Mobile Cards (< 1024px)
  const container = document.getElementById('ordersFeedContainer');
  if (container) {
    if (pageSlice.length === 0) {
      container.innerHTML = `
        <div class="bg-white rounded-2xl border border-slate-200/90 p-8 text-center space-y-2">
          <div class="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-lg">
            <i class="fa-solid fa-folder-open"></i>
          </div>
          <div class="text-sm font-bold text-slate-700">Không tìm thấy đơn hàng phù hợp</div>
          <p class="text-xs text-slate-400">Hãy thử thay đổi tiêu chí bộ lọc hoặc từ khóa tìm kiếm</p>
          <button type="button" onclick="resetOrdersListFilters()" class="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer">
            <i class="fa-solid fa-arrow-rotate-left text-[10px]"></i> Đặt lại bộ lọc
          </button>
        </div>`;
    } else {
      // 1. DÒNG DỮ LIỆU BẢNG DESKTOP (>= 1024px)
      const desktopRowsHtml = pageSlice.map((o, idx) => {
        const globalIdx = (ordersListPage - 1) * ORDERS_LIST_PAGE_SIZE + idx;
        const initials = getCustomerInitials(o.customerName);
        const isIssued = (o.status === 'Đã xuất vé');

        const channelTag = o.channel || 'Website';
        const subTypeTag = (o.subType && o.subType !== '-') ? o.subType : 'Booking';
        const staffTag = o.salesOwner || (o.staff !== '-' ? o.staff : 'Nguyễn Thị Kim Hoàng');

        return `
          <tr class="group hover:bg-slate-50/80 transition-colors divide-x divide-slate-100">
            <!-- 1. Mã đơn hàng -->
            <td class="p-3.5 whitespace-nowrap">
              <span class="font-bold text-blue-700 text-xs font-mono tracking-tight block">${o.orderCode}</span>
            </td>

            <!-- 2. Thời gian tạo -->
            <td class="p-3.5 whitespace-nowrap">
              <span class="text-xs text-slate-500 font-medium">${formatOrderCreatedDateTime(o.createdDate, globalIdx + 1)}</span>
            </td>

            <!-- 3. Khách hàng / Đại lý -->
            <td class="p-3.5 whitespace-nowrap">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center text-[11px] shrink-0 tracking-wider">
                  ${initials}
                </div>
                <div class="min-w-0">
                  <div class="font-bold text-slate-800 text-xs truncate max-w-[200px]" title="${o.customerName}">${o.customerName}</div>
                  <div class="text-[11px] text-slate-400 font-mono">${o.customerPhone || 'Chưa cập nhật'}</div>
                </div>
              </div>
            </td>

            <!-- 4. Kênh bán & Nguồn -->
            <td class="p-3.5 whitespace-nowrap">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full text-[10.5px] font-semibold">${channelTag}</span>
                <span class="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10.5px] font-semibold">${subTypeTag}</span>
              </div>
              <div class="text-[10.5px] text-slate-400 truncate max-w-[180px] mt-0.5" title="Phụ trách: ${staffTag}">${staffTag}</div>
            </td>

            <!-- 5. Ngày sử dụng -->
            <td class="p-3.5 whitespace-nowrap">
              <span class="font-bold text-slate-800 text-xs bg-slate-100 px-2.5 py-1 rounded-lg">${formatDisplayDate(o.useDate)}</span>
            </td>

            <!-- 6. Tổng tiền -->
            <td class="p-3.5 text-right whitespace-nowrap">
              <span class="font-extrabold text-slate-900 text-xs font-mono">${formatMoney(o.revenue)} đ</span>
            </td>

            <!-- 7. Trạng thái -->
            <td class="p-3.5 whitespace-nowrap text-center">
              ${getStatusBadgeMarkup(o.status)}
            </td>

            <!-- 8. Thao tác (Desktop) -->
            <td class="p-3.5 whitespace-nowrap text-center sticky right-0 bg-white group-hover:bg-slate-50/95 shadow-[-4px_0_12px_rgba(0,0,0,0.03)] z-10">
              <div class="flex items-center justify-center gap-1.5 whitespace-nowrap">
                <!-- Icon con mắt Xem chi tiết -->
                <button
                  type="button"
                  onclick="openOrderDetailModal('${o.orderCode}')"
                  class="w-7 h-7 rounded-lg border border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-colors cursor-pointer shadow-2xs shrink-0"
                  title="Xem chi tiết"
                >
                  <i class="fa-regular fa-eye text-xs"></i>
                </button>
                <!-- Nút Hoàn vé chỉ hiển thị khi Đã xuất vé -->
                ${isIssued ? `
                  <button
                    type="button"
                    onclick="openRefundTicketModal('${o.orderCode}')"
                    class="px-2.5 py-1 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] transition-colors cursor-pointer shadow-2xs inline-flex items-center gap-1 shrink-0 whitespace-nowrap"
                    title="Hoàn vé"
                  >
                    <i class="fa-solid fa-rotate-left text-[10px]"></i>
                    <span>Hoàn vé</span>
                  </button>
                ` : ''}
              </div>
            </td>
          </tr>
        `;
      }).join('');

      // 2. DẠNG THẺ DỌC MOBILE (< 1024px)
      const mobileCardsHtml = pageSlice.map((o, idx) => {
        const globalIdx = (ordersListPage - 1) * ORDERS_LIST_PAGE_SIZE + idx;
        const initials = getCustomerInitials(o.customerName);
        const isIssued = (o.status === 'Đã xuất vé');

        const channelTag = o.channel || 'Website';
        const subTypeTag = (o.subType && o.subType !== '-') ? o.subType : 'Booking';
        const staffTag = o.salesOwner || (o.staff !== '-' ? o.staff : 'Nguyễn Thị Kim Hoàng');

        return `
          <div class="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3 hover:border-blue-300 transition-all">
            <!-- Hàng 1: Mã đơn & Badge trạng thái -->
            <div class="flex items-center justify-between gap-2">
              <span class="font-bold text-blue-700 text-sm font-mono tracking-tight">${o.orderCode}</span>
              ${getStatusBadgeMarkup(o.status)}
            </div>

            <!-- Hàng 2: Thời gian tạo đơn màu xám & Tổng doanh thu màu đen đậm -->
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs text-slate-400 font-medium">${formatOrderCreatedDateTime(o.createdDate, globalIdx + 1)}</span>
              <span class="text-sm sm:text-base font-extrabold text-slate-900 font-mono">${formatMoney(o.revenue)} đ</span>
            </div>

            <!-- Hàng 3: Khách hàng - Avatar tròn xanh dương (2 chữ cái) + Tên đậm + SĐT -->
            <div class="flex items-center gap-3 pt-0.5">
              <div class="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center text-xs shrink-0 tracking-wider">
                ${initials}
              </div>
              <div class="min-w-0 flex-1">
                <div class="font-bold text-slate-800 text-xs sm:text-sm truncate">${o.customerName}</div>
                <div class="text-[11.5px] text-slate-500">${o.customerPhone || 'Chưa cập nhật'}</div>
              </div>
            </div>

            <!-- Hàng 4: Tag chips (Kênh bán, Phân loại, Nhân viên phụ trách) -->
            <div class="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span class="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full text-[10.5px] font-semibold">${channelTag}</span>
              <span class="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10.5px] font-semibold">${subTypeTag}</span>
              <span class="bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full text-[10.5px] truncate max-w-[220px]" title="Phụ trách: ${staffTag}">${staffTag}</span>
            </div>

            <!-- Hàng 5: Nhãn "Ngày sử dụng" bên trái - Giá trị ngày in đậm bên phải -->
            <div class="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
              <span class="text-slate-500 font-medium">Ngày sử dụng</span>
              <span class="font-bold text-slate-800">${formatDisplayDate(o.useDate)}</span>
            </div>

            <!-- Hàng 6: Nút hành động chân Card (Mobile) -->
            <div class="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <!-- Icon con mắt Xem chi tiết -->
              <button
                type="button"
                onclick="openOrderDetailModal('${o.orderCode}')"
                class="w-8 h-8 rounded-xl border border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-colors cursor-pointer shadow-2xs shrink-0"
                title="Xem chi tiết"
              >
                <i class="fa-regular fa-eye text-xs"></i>
              </button>
              <!-- Nút Hoàn vé chỉ hiển thị khi Đã xuất vé -->
              ${isIssued ? `
                <button
                  type="button"
                  onclick="openRefundTicketModal('${o.orderCode}')"
                  class="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors cursor-pointer shadow-2xs inline-flex items-center gap-1.5"
                  title="Hoàn vé"
                >
                  <i class="fa-solid fa-rotate-left text-[11px]"></i>
                  <span>Hoàn vé</span>
                </button>
              ` : ''}
            </div>
          </div>
        `;
      }).join('');

      container.innerHTML = `
        <!-- BẢNG DANH SÁCH DESKTOP (>= 1024px) -->
        <div class="hidden lg:block bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden w-full">
          <div class="overflow-x-auto min-h-[360px]">
            <table class="w-full text-left border-collapse text-xs min-w-[1150px] xl:min-w-[1200px]">
              <thead class="bg-slate-50/95 border-b border-slate-200 text-[11px] font-extrabold text-slate-600 uppercase tracking-wider sticky top-0 z-10">
                <tr class="divide-x divide-slate-200">
                  <th class="p-3.5 whitespace-nowrap min-w-[140px]">MÃ ĐƠN HÀNG</th>
                  <th class="p-3.5 whitespace-nowrap min-w-[150px]">THỜI GIAN TẠO</th>
                  <th class="p-3.5 whitespace-nowrap min-w-[220px]">KHÁCH HÀNG / ĐẠI LÝ</th>
                  <th class="p-3.5 whitespace-nowrap min-w-[180px]">KÊNH BÁN &amp; NGUỒN</th>
                  <th class="p-3.5 whitespace-nowrap min-w-[130px]">NGÀY SỬ DỤNG</th>
                  <th class="p-3.5 text-right whitespace-nowrap min-w-[130px]">TỔNG TIỀN</th>
                  <th class="p-3.5 whitespace-nowrap text-center min-w-[130px]">TRẠNG THÁI</th>
                  <th class="p-3.5 text-center whitespace-nowrap min-w-[140px] w-[140px] sticky right-0 bg-slate-50 shadow-[-4px_0_12px_rgba(0,0,0,0.03)] z-10">THAO TÁC</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${desktopRowsHtml}
              </tbody>
            </table>
          </div>
        </div>

        <!-- BỐ CỤC CARD MOBILE (< 1024px) -->
        <div class="block lg:hidden space-y-3">
          ${mobileCardsHtml}
        </div>
      `;
    }
  }

  // Render pagination
  renderGenericPaginationFooter('ordersListPaginationFooter', ordersListPage, filtered.length, ORDERS_LIST_PAGE_SIZE, 'changeOrdersListPage', 'đơn hàng');
}

// ============================================================================
// DETAIL MODAL HANDLERS
// ============================================================================

let currentOrderDetailOrder = null;

function openOrderDetailModal(orderCode) {
  const order = TecheraDB.getOrders().find(o => o.orderCode === orderCode);
  if (!order) return;
  currentOrderDetailOrder = order;

  const setTxt = (id, txt) => {
    const el = document.getElementById(id);
    if (el) el.innerText = txt;
  };

  // 1. Header Thương hiệu & Định danh Đơn hàng
  setTxt('ordModalCode', order.orderCode || 'TEC-00000267');

  const badgeEl = document.getElementById('ordModalStatusBadge');
  if (badgeEl) {
    const st = order.status || 'Đã xuất vé';
    let stColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    let dotColor = 'bg-emerald-500';
    if (st === 'Đã hoàn tiền') {
      stColor = 'bg-rose-50 text-rose-700 border-rose-200';
      dotColor = 'bg-rose-500';
    } else if (st === 'Đã hủy') {
      stColor = 'bg-slate-100 text-slate-700 border-slate-300';
      dotColor = 'bg-slate-400';
    } else if (st === 'Đang xử lý' || st === 'Đợi thanh toán') {
      stColor = 'bg-amber-50 text-amber-700 border-amber-200';
      dotColor = 'bg-amber-500';
    } else if (st === 'Đã xác nhận') {
      stColor = 'bg-blue-50 text-blue-700 border-blue-200';
      dotColor = 'bg-blue-500';
    }
    badgeEl.innerHTML = `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${stColor} border text-xs font-black whitespace-nowrap"><span class="w-1.5 h-1.5 rounded-full ${dotColor} animate-pulse"></span>● ${st}</span>`;
  }

  // 2. Khối Thông tin Khách hàng & Nguồn Đơn hàng
  setTxt('ordModalCustomer', order.customerName || 'Khách hàng ẩn danh');
  setTxt('ordModalPhone', order.customerPhone || 'Chưa cập nhật');
  setTxt('ordModalEmail', order.customerEmail || 'Chưa cập nhật');

  setTxt('ordModalSource', order.channel || 'Nội bộ');
  setTxt('ordModalType', (order.subType && order.subType !== '-') ? order.subType : 'AGENT');
  setTxt('ordModalOwner', order.salesOwner || order.staff || 'Bé Hoàng');

  // 3. Khối Chi tiết Vé & Tổng kết Thanh toán
  setTxt('ordModalTicketDateBadge', `📅 ${formatVnDate(order.useDate || '2026-10-25')}`);
  setTxt('ordModalServiceTitle', (order.packageName || 'VÉ CÁP COMBO ĐỈNH & CHÙA').toUpperCase());
  setTxt('ordModalSiteSub', `Vé ${order.site || 'Sun World Bà Đen Mountain'}`);

  const qty = order.tickets || 1;
  const rev = order.revenue || 9075000;
  const unitPrice = Math.round(rev / qty);

  setTxt('ordModalPaxType', 'Người lớn');
  setTxt('ordModalPaxTotal', `${formatMoney(rev)} đ`);
  setTxt('ordModalPaxFormula', `Đơn giá: ${qty} × ${formatMoney(unitPrice)} đ`);
  setTxt('ordModalPaxOriginal', `${formatMoney(rev)} đ`);

  setTxt('ordModalSubtotal', `${formatMoney(rev)} đ`);
  setTxt('ordModalGrandTotal', `${formatMoney(rev)} đ`);

  // 4. Card Phân tích Lợi nhuận (Dành cho nội bộ/Đại lý)
  const cost = order.netCost != null ? order.netCost : Math.round(rev * 0.992);
  const profit = order.profit != null ? order.profit : (rev - cost);
  const costPct = rev > 0 ? ((cost / rev) * 100).toFixed(1) : '99.2';
  const profitPct = rev > 0 ? ((profit / rev) * 100).toFixed(1) : '0.8';

  setTxt('ordModalProfitCodeSub', `Đơn hàng #${order.orderCode || 'TEC-00000267'}`);
  setTxt('ordModalProfitRatePaid', `100.0% — ${formatMoney(rev)} đ`);
  setTxt('ordModalProfitRateCost', `${costPct}% — ${formatMoney(cost)} đ`);
  setTxt('ordModalProfitRateReal', `${profitPct}% — ${formatMoney(profit)} đ`);

  // Thanh Footer cố định đáy Modal
  const operatorEmail = (order.customerEmail && order.customerEmail.includes('@'))
    ? order.customerEmail
    : 'benthanhtourist@gmail.com';
  setTxt('ordModalOperatorEmail', operatorEmail);

  const modal = document.getElementById('modalOrderDetail');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeOrderDetailModal() {
  const modal = document.getElementById('modalOrderDetail');
  if (modal) {
    modal.classList.remove('flex');
    modal.classList.add('hidden');
  }
}

function downloadOrderInvoiceImage() {
  if (!currentOrderDetailOrder) return;
  const code = currentOrderDetailOrder.orderCode;
  showToast('Tải ảnh thành công', `Hóa đơn & phiếu xác nhận đơn hàng #${code} đang được lưu về máy.`);
}

function viewOrderTicketOnline() {
  if (!currentOrderDetailOrder) return;
  const code = currentOrderDetailOrder.orderCode;
  window.open(`customer-qr.html?code=${encodeURIComponent(code)}`, '_blank');
}

function issueOrderTicketNow(orderCode) {
  const updated = TecheraDB.updateOrderStatus(orderCode, 'Đã xuất vé');
  if (updated) {
    TecheraDB.pushNotification({
      title: `Xuất vé đơn hàng #${orderCode}`,
      desc: `Đơn hàng ${orderCode} (${updated.site}) đã chuyển trạng thái sang Đã xuất vé.`,
      type: 'success'
    });
    syncNotificationBadges();
    renderOrdersListView();
    showToast('Xuất vé thành công', `Đơn ${orderCode} đã được phát hành vé QR điện tử.`);
  }
}
// ============================================================================
// REFUND MODAL HANDLERS
// ============================================================================

function openRefundTicketModal(orderCode) {
  const order = TecheraDB.getOrders().find(o => o.orderCode === orderCode);
  if (!order) return;

  currentRefundOrderCode = orderCode;

  const setTxt = (id, txt) => {
    const el = document.getElementById(id);
    if (el) el.innerText = txt;
  };

  setTxt('refundModalCode', order.orderCode);
  setTxt('refundModalCustomer', `${order.customerName} (${order.customerPhone || '-'})`);
  setTxt('refundModalPackage', order.packageName || order.site);
  setTxt('refundModalTickets', `${order.tickets} vé`);
  setTxt('refundModalAmount', `${formatMoney(order.revenue)} đ`);

  const modal = document.getElementById('modalRefundTicket');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeRefundTicketModal() {
  currentRefundOrderCode = null;
  const modal = document.getElementById('modalRefundTicket');
  if (modal) {
    modal.classList.remove('flex');
    modal.classList.add('hidden');
  }
}

function confirmExecuteRefund() {
  if (!currentRefundOrderCode) return;
  const orderCode = currentRefundOrderCode;
  const order = TecheraDB.getOrders().find(o => o.orderCode === orderCode);
  if (!order) {
    closeRefundTicketModal();
    return;
  }

  // Pre-fill context cho màn hình Tạo yêu cầu hoàn vé
  const prefillData = {
    orderId: order.orderCode,
    customerName: order.customerName,
    customerPhone: order.customerPhone || '0903 123 456',
    serviceDate: order.useDate || order.createdDate || '2026-11-25',
    totalPaid: order.revenue || 0,
    corp: order.corp || 'Sun World',
    site: order.site || 'Sun World Ba Na Hills',
    ticketsCount: order.tickets || 2,
    agency: (order.channel === 'Đại lý' ? (order.salesOwner || order.customerName) : '') || '',
    packageName: order.packageName || ('Vé tham quan ' + (order.site || 'Ba Na Hills'))
  };

  try {
    sessionStorage.setItem('prefillRefundOrder', JSON.stringify(prefillData));
  } catch (e) {
    console.error('Failed to set sessionStorage prefillRefundOrder', e);
  }

  closeRefundTicketModal();

  // Điều hướng thẳng sang màn hình Tạo Yêu Cầu Hoàn/Hủy Vé
  window.location.href = `refund-requests.html?action=create&orderId=${encodeURIComponent(orderCode)}`;
}

// ============================================================================
// INITIALIZATION
// ============================================================================

window.addEventListener('DOMContentLoaded', () => {
  renderSharedShell({ activePage: 'orders', pageTitle: 'Danh sách Đơn hàng' });
  const urlParams = new URLSearchParams(window.location.search);
  const statusParam = urlParams.get('status');
  const filterParam = urlParams.get('filter');
  if (statusParam || filterParam === 'refund') {
    ordersListFilterState.status = statusParam || 'Đã hoàn tiền';
    const sel = document.getElementById('ordersStatusFilter');
    if (sel) sel.value = ordersListFilterState.status;
  }
  updateDateRangePresetPills();
  renderOrdersListView();
});

// Exports for HTML inline onclick
window.toggleDateRangePickerPopover = toggleDateRangePickerPopover;
window.closeDateRangePickerPopover = closeDateRangePickerPopover;
window.selectDateRangePreset = typeof selectDateRangePreset !== 'undefined' ? selectDateRangePreset : selectDateRangeTagPreset;
window.applyCustomDateRange = typeof applyCustomDateRange !== 'undefined' ? applyCustomDateRange : applyDateRangePickerSelection;
window.applyOrdersListFilters = applyOrdersListFilters;
window.resetOrdersListFilters = resetOrdersListFilters;
window.selectOrdersChannelTab = selectOrdersChannelTab;
window.changeOrdersListPage = changeOrdersListPage;
window.openOrderDetailModal = openOrderDetailModal;
window.closeOrderDetailModal = closeOrderDetailModal;
window.issueOrderTicketNow = issueOrderTicketNow;
window.issueTicketFromOrderModal = () => {
  const codeEl = document.getElementById('ordModalCode');
  if (codeEl && codeEl.innerText) issueOrderTicketNow(codeEl.innerText);
  closeOrderDetailModal();
};
window.openRefundTicketModal = openRefundTicketModal;
window.closeRefundTicketModal = closeRefundTicketModal;
window.confirmExecuteRefund = confirmExecuteRefund;
window.renderOrdersListView = renderOrdersListView;

window.selectDateRangeTagPreset = selectDateRangeTagPreset;
window.navigateCalendarMonth = navigateCalendarMonth;
window.onCalendarDayClick = onCalendarDayClick;
window.applyDateRangePickerSelection = applyDateRangePickerSelection;
window.cancelDateRangePicker = cancelDateRangePicker;
window.updateDateRangePresetPills = updateDateRangePresetPills;
window.renderCalendarView = renderCalendarView;
window.downloadOrderInvoiceImage = downloadOrderInvoiceImage;
window.viewOrderTicketOnline = viewOrderTicketOnline;
