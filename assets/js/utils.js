// ============================================================================
// SHARED UTILITIES: FORMATTERS, DATES, PRICING, PAGINATION & TOAST
// ============================================================================

const MAX_NEGATIVE_WALLET_LIMIT = -10000000;
const TICKET_TIER_KEYS = ['adult', 'child', 'senior'];
const TICKET_TIER_LABELS = {
  adult: 'Người lớn',
  child: 'Trẻ em',
  senior: 'Người cao tuổi'
};

function formatMoney(amount) {
  const num = Math.round(Number(amount) || 0);
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function parseMoney(valueStr) {
  if (typeof valueStr === 'number') return Math.round(valueStr);
  const cleaned = String(valueStr || '').replace(/[^\d]/g, '');
  return cleaned ? parseInt(cleaned, 10) : 0;
}

function formatSignedVnd(amount) {
  return amount < 0 ? `-${formatMoney(Math.abs(amount))} đ` : `${formatMoney(amount)} đ`;
}

function formatCompactVndShort(amount) {
  if (amount >= 1e9) return `${(amount / 1e9).toFixed(2)} tỷ`;
  if (amount >= 1e6) return `${(amount / 1e6).toFixed(1)}M`;
  return `${formatMoney(amount)} đ`;
}

function removeVietnameseTones(str) {
  if (!str) return '';
  str = String(str).toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  str = str.replace(/đ/g, 'd');
  return str;
}

// ============================================================================
// DATE HELPERS
// ============================================================================

function getSystemTodayParts() {
  const now = new Date();
  const daysNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  return {
    day: now.getDate(),
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    dayName: daysNames[now.getDay()]
  };
}

function isBeforeSystemMonth(year, month, minDate = getSystemTodayParts()) {
  return (year < minDate.year) || (year === minDate.year && month < minDate.month);
}

function isBeforeSystemToday(day, month, year, minDate = getSystemTodayParts()) {
  if (isBeforeSystemMonth(year, month, minDate)) return true;
  return (year === minDate.year && month === minDate.month && day < minDate.day);
}

function isBookingDateUnavailable(day, month, year) {
  return day === 25;
}

function getDatePricePolicy(day, month, year) {
  const dt = new Date(year, month - 1, day);
  const dow = dt.getDay();
  if ((month === 11 && day === 20) || (month === 12 && day === 24)) {
    return { code: 'holiday', label: 'Giá Lễ Tết (+15%)', multiplier: 1.15 };
  }
  if (dow === 0 || dow === 6) {
    return { code: 'weekend', label: 'Giá cuối tuần (+8%)', multiplier: 1.08 };
  }
  return { code: 'weekday', label: 'Giá ngày thường', multiplier: 1.0 };
}

function formatDateObjDMY(dObj) {
  if (!dObj) return '';
  const pad = n => (n < 10 ? '0' + n : '' + n);
  return `${pad(dObj.day)}/${pad(dObj.month)}/${dObj.year}`;
}

function computeDayNameVi(day, month, year) {
  const names = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  return names[new Date(year, month - 1, day).getDay()];
}

function parseIsoDate(iso) {
  const [y, m, d] = String(iso || '2026-11-10').split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function toIsoDate(dt) {
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDisplayDate(iso) {
  if (!iso || iso.length < 10) return iso || '-';
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`;
}

function diffDaysInclusive(startIso, endIso) {
  const ms = parseIsoDate(endIso) - parseIsoDate(startIso);
  return Math.floor(ms / 86400000) + 1;
}

// ============================================================================
// PRICING, PACKAGES & DINING HELPERS
// ============================================================================

function roundPriceThousand(val) {
  return Math.round((val || 0) / 1000) * 1000;
}

function hasDiningServiceInTitle(title) {
  return /buffet|set\s*ăn|ẩm thực|ăn trưa|ăn tối|bữa trưa|bữa tối/i.test(title || '');
}

function buildPackageDiningConfig(src, destId, dateObj, isTechera) {
  const title = (src && src.title) ? src.title : '';
  const hasDining = hasDiningServiceInTitle(title);
  if (!hasDining) return null;

  const isDinner = /tối|by night|hoàng hôn/i.test(title);
  const venuePair = (typeof VENUE_DINING_RESTAURANTS !== 'undefined' && VENUE_DINING_RESTAURANTS[destId]) ? VENUE_DINING_RESTAURANTS[destId] : {};
  const baseRestaurants = (isDinner && venuePair.dinner)
    ? venuePair.dinner
    : (venuePair.lunch || [
        { id: 'nha-hang-a', name: 'Nhà hàng A' },
        { id: 'nha-hang-b', name: 'Nhà hàng B' }
      ]);

  const capSeed = ((dateObj && dateObj.day) || 18) + ((src && src.id) || 1) + (isTechera ? 3 : 0);
  const makeCap = (offset) => ((capSeed + offset) % 10) + 8;

  const restaurants = baseRestaurants.map((r, rIdx) => {
    const restPriceAdj = rIdx === 0 ? 0 : 30000;
    const slots = isDinner
      ? [
          { id: `${r.id}-s1`, timeRange: '17:30 - 19:00', priceAdj: 0, capacity: makeCap(2), isSoldOut: false, isAvailable: true },
          { id: `${r.id}-s2`, timeRange: '19:00 - 20:30', priceAdj: 20000, capacity: makeCap(5), isSoldOut: false, isAvailable: true },
          { id: `${r.id}-s3`, timeRange: '20:30 - 22:00', priceAdj: 0, capacity: 0, isSoldOut: true, isAvailable: false }
        ]
      : [
          { id: `${r.id}-s1`, timeRange: '10:30 - 12:00', priceAdj: 0, capacity: makeCap(1), isSoldOut: false, isAvailable: true },
          { id: `${r.id}-s2`, timeRange: '11:00 - 12:30', priceAdj: 0, capacity: makeCap(2), isSoldOut: false, isAvailable: true },
          { id: `${r.id}-s3`, timeRange: '12:30 - 14:00', priceAdj: -20000, capacity: makeCap(4), isSoldOut: false, isAvailable: true },
          { id: `${r.id}-s4`, timeRange: '14:00 - 15:30', priceAdj: -20000, capacity: 0, isSoldOut: true, isAvailable: false }
        ];

    return { id: r.id, name: r.name, priceAdj: restPriceAdj, slots };
  });

  return { hasDiningConfig: true, diningRestaurants: restaurants };
}

function getSelectedDiningRestaurant(pkg, orderItem) {
  if (!pkg || !pkg.hasDiningConfig || !orderItem || !orderItem.selectedRestaurantId) return null;
  return (pkg.diningRestaurants || []).find(r => r.id === orderItem.selectedRestaurantId) || null;
}

function getSelectedDiningSlot(pkg, orderItem) {
  const rest = getSelectedDiningRestaurant(pkg, orderItem);
  if (!rest || !orderItem || !orderItem.selectedTimeSlotId) return null;
  return (rest.slots || []).find(s => s.id === orderItem.selectedTimeSlotId) || null;
}

function getEffectivePackageTierConfig(pkg, orderItem, tierKey) {
  const base = pkg ? pkg[tierKey] : null;
  if (!base) return null;
  if (!pkg.hasDiningConfig) return base;
  const rest = getSelectedDiningRestaurant(pkg, orderItem);
  const slot = getSelectedDiningSlot(pkg, orderItem);
  if (!rest && !slot) return base;

  const tierScale = tierKey === 'child' ? 0.7 : (tierKey === 'senior' ? 0.8 : 1);
  const adj = roundPriceThousand((((rest && rest.priceAdj) || 0) + ((slot && slot.priceAdj) || 0)) * tierScale);
  const listedPrice = Math.max(50000, base.listedPrice + adj);
  const netPrice = Math.max(40000, Math.min(listedPrice, base.netPrice + adj));
  const defaultSelling = Math.max(netPrice, Math.min(listedPrice, base.defaultSelling + adj));
  return { ...base, listedPrice, netPrice, defaultSelling };
}

function getPackageEffectiveAllotment(pkg, orderItem) {
  if (!pkg) return 0;
  const baseStock = typeof pkg.stockAvailable === 'number' ? pkg.stockAvailable : 50;
  if (!pkg.hasDiningConfig) return baseStock;
  const slot = getSelectedDiningSlot(pkg, orderItem);
  return slot ? slot.capacity : baseStock;
}

function isPackagePaxEnabled(pkg, orderItem) {
  if (!pkg) return false;
  if (!pkg.hasDiningConfig) return true;
  const slot = getSelectedDiningSlot(pkg, orderItem);
  return !!(slot && !slot.isSoldOut && slot.capacity > 0);
}

function classifyPackageServiceGroup(src) {
  const title = (src && src.title ? src.title : '').toLowerCase();
  const hasBuffetOrFood = hasDiningServiceInTitle(title);
  const isBuffetOnly = hasBuffetOrFood && /không kèm cáp|không kèm vé|chỉ buffet|vé buffet/.test(title);
  if (isBuffetOnly) return 'buffet-only';
  if (hasBuffetOrFood || (src && src.category === 'combo' && /buffet|set ăn|ẩm thực/.test(title))) return 'combo-buffet';
  return 'entrance';
}

function getMarketsForServiceGroup(groupId) {
  if (groupId === 'entrance') return ['local', 'domestic', 'china'];
  if (groupId === 'combo-buffet') return ['local', 'domestic', 'korea'];
  return ['local', 'domestic'];
}

function buildActiveTicketPackages(destId, supplierId, dateObj) {
  if (typeof venuePackagesDatabase === 'undefined') return {};
  const baseMap = venuePackagesDatabase[destId] || venuePackagesDatabase['sunworld-bana'] || {};
  const policy = getDatePricePolicy(dateObj.day, dateObj.month, dateObj.year);
  const isTechera = (supplierId === 'techera');
  const result = {};

  const addPackageMarketVariants = (src, forceBuffetOnly = false) => {
    const serviceGroup = forceBuffetOnly ? 'buffet-only' : classifyPackageServiceGroup(src);
    const groupMeta = SERVICE_GROUP_DEFINITIONS.find(g => g.id === serviceGroup) || SERVICE_GROUP_DEFINITIONS[0];
    const allowedMarkets = getMarketsForServiceGroup(serviceGroup);
    const netFactor = isTechera ? 0.96 : 1.0;

    allowedMarkets.forEach((marketId, mIdx) => {
      const marketMeta = MARKET_REGION_DEFINITIONS.find(m => m.id === marketId) || MARKET_REGION_DEFINITIONS[0];
      const pkgId = src.id * 10 + (mIdx + 1);
      const mMult = marketMeta.multiplier || 1.0;

      const makeTier = (tier, seniorRatio = 1) => {
        const listedPrice = roundPriceThousand(tier.listedPrice * policy.multiplier * seniorRatio * mMult);
        const netPrice = roundPriceThousand(tier.netPrice * policy.multiplier * seniorRatio * mMult * netFactor);
        const defaultSelling = roundPriceThousand(tier.defaultSelling * policy.multiplier * seniorRatio * mMult * (isTechera ? 0.98 : 1.0));
        return {
          ...tier,
          listedPrice,
          netPrice: Math.min(netPrice, listedPrice),
          defaultSelling: Math.max(Math.min(defaultSelling, listedPrice), Math.min(netPrice, listedPrice))
        };
      };

      const adultTier = makeTier(src.adult, 1);
      const childTier = makeTier(src.child, 1);
      const seniorTier = src.senior
        ? makeTier(src.senior, 1)
        : {
            ...makeTier(src.adult, 0.8),
            label: 'Người cao tuổi',
            condition: 'Từ 60 tuổi trở lên (CCCD)'
          };

      const stockSeed = ((dateObj.day + src.id * 3 + mIdx * 2 + (isTechera ? 5 : 2)) % 14) + 5;
      const diningMeta = buildPackageDiningConfig(src, destId, dateObj, isTechera);

      result[pkgId] = {
        ...src,
        id: pkgId,
        baseId: src.id,
        serviceGroup,
        serviceGroupLabel: groupMeta.label,
        marketId,
        marketLabel: marketMeta.label,
        marketBadgeCls: marketMeta.badgeCls,
        title: `${src.title} (${marketMeta.label})`,
        adult: adultTier,
        child: childTier,
        senior: seniorTier,
        stockAvailable: stockSeed,
        discountTag: isTechera ? `${src.discountTag} • Kho Techera` : src.discountTag,
        ...(diningMeta || {})
      };
    });
  };

  Object.keys(baseMap).forEach(k => {
    const id = parseInt(k, 10);
    if (!isTechera && id > 6) return;
    addPackageMarketVariants(baseMap[k]);
  });

  const hasBuffetOnly = Object.values(result).some(p => p.serviceGroup === 'buffet-only');
  if (!hasBuffetOnly) {
    addPackageMarketVariants({
      id: 90,
      title: 'VÉ BUFFET TRƯA ẨM THỰC ĐẶC SẢN (CHỈ SUẤT ĂN)',
      category: 'combo',
      discountTag: 'Ẩm thực độc lập',
      adult: { listedPrice: 350000, netPrice: 280000, defaultSelling: 320000, label: 'Người lớn', condition: 'Cao trên 1m4' },
      child: { listedPrice: 220000, netPrice: 175000, defaultSelling: 200000, label: 'Trẻ em', condition: 'Cao từ 1m – 1m4' },
      usageGuide: '• Suất ăn Buffet độc lập phục vụ từ 11:00 – 14:30 tại hệ thống nhà hàng trong khu du lịch.',
      notes: '• Không bao gồm vé vào cổng hoặc cáp treo. Xuất trình mã QR tại quầy lễ tân nhà hàng.'
    }, true);
  }

  if (isTechera) {
    addPackageMarketVariants({
      id: 95,
      title: 'COMBO ĐỘC QUYỀN TECHERA (VÉ + BUFFET + ƯU ĐÃI B2B)',
      category: 'combo',
      discountTag: 'Độc quyền Techera',
      adult: { listedPrice: 1120000, netPrice: 880000, defaultSelling: 990000, label: 'Người lớn', condition: 'Cao trên 1m4' },
      child: { listedPrice: 820000, netPrice: 640000, defaultSelling: 730000, label: 'Trẻ em', condition: 'Cao từ 1m – 1m4' },
      usageGuide: '• Gói ưu đãi phân bổ riêng từ kho Techera B2B.<br>• Quét mã QR trực tiếp tại cổng soát vé.',
      notes: '• Hỗ trợ đổi ngày linh hoạt trước 24h.'
    });
  }

  return result;
}

function getTierQtyKey(tier) {
  return tier === 'adult' ? 'adultQty' : (tier === 'child' ? 'childQty' : 'seniorQty');
}

function getTierPriceKey(tier) {
  return tier === 'adult' ? 'adultSellingPrice' : (tier === 'child' ? 'childSellingPrice' : 'seniorSellingPrice');
}

function getTierQty(orderItem, tier) {
  if (!orderItem) return 0;
  return orderItem[getTierQtyKey(tier)] || 0;
}

function getTierPrice(orderItem, pkg, tier) {
  const cfg = getEffectivePackageTierConfig(pkg, orderItem, tier);
  if (!cfg) return 0;
  const key = getTierPriceKey(tier);
  if (orderItem && typeof orderItem[key] === 'number') return orderItem[key];
  return cfg.defaultSelling;
}

function getPackageTotalQty(orderItem) {
  if (!orderItem) return 0;
  return (orderItem.adultQty || 0) + (orderItem.childQty || 0) + (orderItem.seniorQty || 0);
}

function computeDiscountPercent(listed, actual) {
  if (!listed || listed <= 0 || actual >= listed) return 0;
  return Math.round(((listed - actual) / listed) * 100);
}

function getVoucherDiscountAmount(voucherCode, basePartnerTotal) {
  if (!voucherCode || typeof VOUCHER_RULES === 'undefined' || !VOUCHER_RULES[voucherCode]) return 0;
  const rule = VOUCHER_RULES[voucherCode];
  if (basePartnerTotal < (rule.minAmount || 0)) return 0;
  return Math.min(rule.discount, basePartnerTotal);
}

// ============================================================================
// STATUS & CRM BADGES + PAGINATION + TOAST
// ============================================================================

function getOrderStatusBadgeHtml(status) {
  const map = {
    'Đã xuất vé': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Đã xác nhận': 'bg-blue-50 text-blue-700 border-blue-200',
    'Đang xử lý': 'bg-amber-50 text-amber-700 border-amber-200',
    'Đợi thanh toán': 'bg-sky-50 text-sky-700 border-sky-200',
    'Nháp': 'bg-slate-100 text-slate-600 border-slate-200',
    'Đã hủy': 'bg-rose-50 text-rose-700 border-rose-200',
    'Hoàn tiền': 'bg-purple-50 text-purple-700 border-purple-200'
  };
  const cls = map[status] || 'bg-slate-100 text-slate-600 border-slate-200';
  return `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-bold border ${cls} whitespace-nowrap">${status}</span>`;
}

function getCrmSourceBadgeHtml(source) {
  const map = {
    'Zalo': 'bg-sky-50 text-sky-700 border-sky-200',
    'Facebook': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Email': 'bg-amber-50 text-amber-700 border-amber-200',
    'TikTok': 'bg-slate-900 text-white border-slate-900'
  };
  const cls = map[source] || 'bg-slate-100 text-slate-700 border-slate-200';
  return `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${cls}">${source || 'Zalo'}</span>`;
}

function renderStatusBadge(status) {
  return getOrderStatusBadgeHtml(status);
}

function renderChannelBadge(channel) {
  const map = {
    'Đại lý (TA)': 'bg-orange-50 text-brand-700 border-orange-200',
    'Website': 'bg-blue-50 text-blue-700 border-blue-200',
    'Nội bộ': 'bg-emerald-50 text-emerald-700 border-emerald-200'
  };
  const cls = map[channel] || 'bg-slate-100 text-slate-600 border-slate-200';
  return `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${cls} whitespace-nowrap">${channel || '-'}</span>`;
}

function renderTierBadge(tier) {
  const map = {
    'Diamond': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Platinum': 'bg-purple-50 text-purple-700 border-purple-200',
    'Gold': 'bg-amber-50 text-amber-700 border-amber-200',
    'Silver': 'bg-slate-100 text-slate-700 border-slate-200'
  };
  const cls = map[tier] || 'bg-slate-100 text-slate-600 border-slate-200';
  return `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${cls} whitespace-nowrap">${tier || 'Standard'}</span>`;
}

function renderGenericPaginationFooter(containerId, currentPage, totalItems, pageSize, handlerName, unitLabel = 'mục') {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (totalItems === 0) {
    container.innerHTML = `<span class="text-xs font-medium text-slate-400">Không có ${unitLabel} để phân trang</span>`;
    return;
  }

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startItem = (safePage - 1) * pageSize + 1;
  const endItem = Math.min(safePage * pageSize, totalItems);

  let pageBtns = '';
  for (let p = 1; p <= totalPages; p++) {
    const isActive = (p === safePage);
    pageBtns += `
      <button type="button"
              onclick="${handlerName}(${p})"
              class="min-w-[32px] h-8 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/25'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-300 hover:text-brand-600'
              }">
        ${p}
      </button>
    `;
  }

  container.innerHTML = `
    <div class="text-xs font-semibold text-slate-500">
      Hiển thị <strong class="text-slate-900">${startItem}–${endItem}</strong> / <strong class="text-slate-900">${totalItems}</strong> ${unitLabel}
      <span class="text-slate-400 ml-1">(Trang ${safePage}/${totalPages})</span>
    </div>
    <div class="flex items-center gap-1.5 flex-wrap">
      <button type="button"
              onclick="${handlerName}(${Math.max(1, safePage - 1)})"
              ${safePage <= 1 ? 'disabled' : ''}
              class="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-xs transition-colors cursor-pointer"
              aria-label="Trang trước">
        <i class="fa-solid fa-chevron-left text-[10px]"></i>
      </button>
      ${pageBtns}
      <button type="button"
              onclick="${handlerName}(${Math.min(totalPages, safePage + 1)})"
              ${safePage >= totalPages ? 'disabled' : ''}
              class="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-xs transition-colors cursor-pointer"
              aria-label="Trang sau">
        <i class="fa-solid fa-chevron-right text-[10px]"></i>
      </button>
    </div>
  `;
}

let toastTimer = null;
function showToast(title, desc, type = 'success') {
  const toast = document.getElementById('toastNotification');
  const toastTitle = document.getElementById('toastTitle');
  const toastDesc = document.getElementById('toastDesc');
  const toastIcon = document.getElementById('toastIcon');
  const progressBar = document.getElementById('toastProgressBar');

  if (!toast) return;
  if (toastTitle) toastTitle.innerText = title || 'Thông báo';
  if (toastDesc) toastDesc.innerText = desc || '';

  if (type === 'error') {
    toast.className = 'fixed top-5 right-5 z-[80] transform transition-all duration-300 ease-out bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_20px_45px_rgba(15,23,42,0.12),0_4px_12px_rgba(15,23,42,0.06)] border border-rose-200/90 ring-1 ring-rose-500/10 max-w-sm sm:max-w-md w-full sm:w-[420px] overflow-hidden';
    if (toastIcon) {
      toastIcon.className = 'w-[38px] h-[38px] rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center text-sm shrink-0 shadow-2xs';
      toastIcon.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>';
    }
    if (progressBar) progressBar.className = 'h-full bg-rose-500 transition-all ease-linear';
  } else if (type === 'info') {
    toast.className = 'fixed top-5 right-5 z-[80] transform transition-all duration-300 ease-out bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_20px_45px_rgba(15,23,42,0.12),0_4px_12px_rgba(15,23,42,0.06)] border border-sky-200/90 ring-1 ring-sky-500/10 max-w-sm sm:max-w-md w-full sm:w-[420px] overflow-hidden';
    if (toastIcon) {
      toastIcon.className = 'w-[38px] h-[38px] rounded-xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center text-sm shrink-0 shadow-2xs';
      toastIcon.innerHTML = '<i class="fa-solid fa-circle-info"></i>';
    }
    if (progressBar) progressBar.className = 'h-full bg-sky-500 transition-all ease-linear';
  } else {
    toast.className = 'fixed top-5 right-5 z-[80] transform transition-all duration-300 ease-out bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_20px_45px_rgba(15,23,42,0.12),0_4px_12px_rgba(15,23,42,0.06)] border border-emerald-200/90 ring-1 ring-emerald-500/10 max-w-sm sm:max-w-md w-full sm:w-[420px] overflow-hidden';
    if (toastIcon) {
      toastIcon.className = 'w-[38px] h-[38px] rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center text-sm shrink-0 shadow-2xs';
      toastIcon.innerHTML = '<i class="fa-solid fa-check"></i>';
    }
    if (progressBar) progressBar.className = 'h-full bg-emerald-500 transition-all ease-linear';
  }

  if (progressBar) {
    progressBar.style.transitionDuration = '0ms';
    progressBar.style.width = '100%';
  }

  toast.classList.remove('-translate-y-16', 'opacity-0', 'pointer-events-none');
  toast.classList.add('translate-y-0', 'opacity-100', 'pointer-events-auto');

  if (progressBar) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        progressBar.style.transitionDuration = '4000ms';
        progressBar.style.width = '0%';
      });
    });
  }

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => hideToast(), 4000);
}

function hideToast() {
  const toast = document.getElementById('toastNotification');
  if (toast) {
    toast.classList.add('-translate-y-16', 'opacity-0', 'pointer-events-none');
    toast.classList.remove('translate-y-0', 'opacity-100', 'pointer-events-auto');
  }
}

function goBackPage(fallbackUrl = 'index.html') {
  if (window.history.length > 1 && document.referrer && document.referrer.includes(window.location.host)) {
    window.history.back();
  } else {
    window.location.href = fallbackUrl;
  }
}

window.goBackPage = goBackPage;
