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

/**
 * Rút gọn số tiền cho các Card chỉ số / KPI Cards:
 * - Dưới 1.000.000: Hiển thị đầy đủ kèm đơn vị (VD: 850.000 đ)
 * - Từ 1.000.000 đến dưới 1.000.000.000 (M): bỏ 4 số cuối, lấy tối đa 2 chữ số thập phân (VD: 1.875.000 -> 1.87M, 254.353.700 -> 254.35M)
 * - Từ 1.000.000.000 trở lên (B): chia 1 tỷ, làm tròn 2 chữ số thập phân (VD: 1.800.000.000 -> 1.8B, 2.439.030.000 -> 2.44B)
 */
function formatKpiCurrency(amount) {
  const num = Number(amount) || 0;
  const isNeg = num < 0;
  const absNum = Math.abs(num);

  let formatted = '';
  if (absNum < 1e6) {
    formatted = `${formatMoney(absNum)} đ`;
  } else if (absNum < 1e9) {
    const val = Math.floor(absNum / 10000) / 100;
    formatted = `${parseFloat(val.toFixed(2))}M`;
  } else {
    const val = Math.round((absNum / 1e9) * 100) / 100;
    formatted = `${parseFloat(val.toFixed(2))}B`;
  }

  return isNeg ? `-${formatted}` : formatted;
}

function formatCompactVndShort(amount) {
  return formatKpiCurrency(amount);
}

/**
 * Gán giá trị rút gọn cho phần tử Card chỉ số, lưu trữ song song rawValue và formattedShortValue,
 * hỗ trợ popover sáng hiển thị số chi tiết ngay khi rê chuột vào toàn bộ vùng Card.
 * @param {HTMLElement|string} elOrId - Phần tử DOM hoặc ID
 * @param {number} amount - Số tiền gốc
 * @param {string} [prefix=''] - Tiền tố (ví dụ '+', '-')
 */
function setKpiCardValue(elOrId, amount, prefix = '') {
  const el = typeof elOrId === 'string' ? document.getElementById(elOrId) : elOrId;
  if (!el) return;
  const num = Number(amount) || 0;
  const isShortened = Math.abs(num) >= 1000000;
  const compact = formatKpiCurrency(num);
  const full = `${formatMoney(Math.abs(num))} đ`;
  const fullText = (num < 0 ? `-${full}` : full);
  const displayVal = prefix ? `${prefix}${compact}` : compact;
  const tooltipVal = prefix ? `${prefix}${fullText}` : fullText;

  el.setAttribute('data-kpi-compact', displayVal);
  el.setAttribute('data-kpi-full', tooltipVal);
  el.setAttribute('data-kpi-raw', num);
  el.classList.add('kpi-card-value');

  if (isShortened) {
    el.classList.add('cursor-pointer', 'kpi-shortened');
  } else {
    el.classList.remove('kpi-shortened');
  }

  // Xóa thuộc tính title mặc định để không bị popup đen mặc định của trình duyệt che mất
  el.removeAttribute('title');

  // Nếu người dùng đang mở rộng số chi tiết, giữ nguyên hiển thị số đầy đủ
  if (el.classList.contains('kpi-expanded')) {
    el.innerText = tooltipVal;
  } else {
    el.innerText = displayVal;
  }

  // Gán thông tin nhận diện cho Card cha để rê chuột vào bất kỳ vị trí nào trên Card cũng kích hoạt Popover
  const parentCard = el.closest ? el.closest('.kpi-card, [class*="rounded-2xl"], [class*="rounded-3xl"], [class*="rounded-xl"]') : null;
  if (parentCard) {
    if (!el.id) {
      el.id = 'kpi_val_' + Math.random().toString(36).substr(2, 9);
    }
    parentCard.setAttribute('data-kpi-card', 'true');
    parentCard.setAttribute('data-kpi-card-target', el.id);
    parentCard.setAttribute('data-kpi-raw', num);
    const cardLabel = extractKpiCardLabel(parentCard, el);
    if (cardLabel) parentCard.setAttribute('data-kpi-label', cardLabel);
    parentCard.removeAttribute('title');
  }
}

/**
 * Tạo chuỗi HTML rút gọn cho Card chỉ số kèm thuộc tính đối soát chi tiết
 */
function renderKpiValueMarkup(amount, prefix = '') {
  const num = Number(amount) || 0;
  const isShortened = Math.abs(num) >= 1000000;
  const compact = formatKpiCurrency(num);
  const full = `${formatMoney(Math.abs(num))} đ`;
  const fullText = (num < 0 ? `-${full}` : full);
  const display = prefix ? `${prefix}${compact}` : compact;
  const fullAmount = prefix ? `${prefix}${fullText}` : fullText;
  const shortenedClass = isShortened ? ' kpi-shortened' : '';
  return `<span data-kpi-compact="${display}" data-kpi-full="${fullAmount}" data-kpi-raw="${num}" class="kpi-card-value${shortenedClass}">${display}</span>`;
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
  const rate = (typeof bookingSessionDiscountRate === 'number') ? bookingSessionDiscountRate : 0;
  if (rate > 0) {
    const discount = Math.round(cfg.listedPrice * (rate / 100));
    return Math.max(0, cfg.listedPrice - discount);
  }
  return cfg.listedPrice;
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

// ============================================================================
// STANDARDIZED DATE RANGE PICKER COMPONENT FACTORY
// Presets: 7 ngày, 30 ngày, Tháng này, Quý, Tùy chỉnh + Two-step Selection Mode
// ============================================================================

function createStandardDateRangePicker(config = {}) {
  const prefix = config.prefix || 'datePicker';
  const baseDate = config.baseDate || '2026-11-18';
  let appliedStart = config.defaultStart || '2026-11-01';
  let appliedEnd = config.defaultEnd || '2026-11-18';
  let appliedPreset = config.defaultPreset || 'this_month';
  const onApplyCallback = config.onApply || function() {};
  const onCancelCallback = config.onCancel || function() {};

  let tempRangeStart = appliedStart;
  let tempRangeEnd = appliedEnd;
  let tempPreset = appliedPreset;
  let calendarSelectPhase = 'completed'; // 'start', 'end', 'completed'

  let calendarYear = 2026;
  let calendarMonth = 10; // 0-based: 10 = Tháng 11

  const syncYearMonth = (targetIso) => {
    const t = targetIso || tempRangeEnd || tempRangeStart || baseDate;
    const parts = String(t).split('-');
    if (parts.length === 3) {
      calendarYear = parseInt(parts[0], 10);
      calendarMonth = parseInt(parts[1], 10) - 1;
    }
  };
  syncYearMonth(tempRangeEnd);

  function formatVnDate(isoDate) {
    if (!isoDate) return '';
    const parts = String(isoDate).split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return isoDate;
  }

  function getPresetsMap() {
    const [y, m, d] = baseDate.split('-').map(Number);
    const base = new Date(y, m - 1, d);

    // 7 ngày gần nhất
    const d7 = new Date(base);
    d7.setDate(d7.getDate() - 6);

    // 30 ngày gần nhất
    const d30 = new Date(base);
    d30.setDate(d30.getDate() - 29);

    // Tháng này (từ ngày 01 đến ngày hiện tại)
    const dMonthStart = new Date(y, m - 1, 1);

    // Quý này (Quý 4: 01/10 đến nay)
    const qMonthStart = Math.floor((m - 1) / 3) * 3;
    const dQuarterStart = new Date(y, qMonthStart, 1);

    const fmt = dt => {
      const yr = dt.getFullYear();
      const mo = String(dt.getMonth() + 1).padStart(2, '0');
      const da = String(dt.getDate()).padStart(2, '0');
      return `${yr}-${mo}-${da}`;
    };

    return {
      '7_days': { start: fmt(d7), end: baseDate, label: '7 ngày' },
      '30_days': { start: fmt(d30), end: baseDate, label: '30 ngày' },
      'this_month': { start: fmt(dMonthStart), end: baseDate, label: 'Tháng này' },
      'quarter': { start: fmt(dQuarterStart), end: baseDate, label: 'Quý' },
      'custom': { label: 'Tùy chỉnh' }
    };
  }

  function updatePresetPillsUI() {
    const pills = [
      { id: `${prefix}_btnPreset_7days`, key: '7_days', label: '7 ngày' },
      { id: `${prefix}_btnPreset_30days`, key: '30_days', label: '30 ngày' },
      { id: `${prefix}_btnPreset_this_month`, key: 'this_month', label: 'Tháng này' },
      { id: `${prefix}_btnPreset_quarter`, key: 'quarter', label: 'Quý' },
      { id: `${prefix}_btnPreset_custom`, key: 'custom', label: 'Tùy chỉnh' }
    ];

    pills.forEach(p => {
      const el = document.getElementById(p.id);
      if (!el) return;
      if (tempPreset === p.key) {
        el.className = 'preset-tag-btn px-2.5 sm:px-3 py-1.5 rounded-lg font-bold bg-blue-600 text-white shadow-xs cursor-pointer whitespace-nowrap transition-all flex items-center gap-1.5';
      } else {
        el.className = 'preset-tag-btn px-2.5 sm:px-3 py-1.5 rounded-lg font-bold border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 cursor-pointer whitespace-nowrap transition-all flex items-center gap-1.5';
      }
    });

    const dot = document.getElementById(`${prefix}_customDot`);
    if (dot) {
      if (tempPreset === 'custom') {
        dot.classList.remove('hidden');
        dot.className = 'w-1.5 h-1.5 rounded-full bg-white shrink-0';
      } else {
        dot.classList.add('hidden');
      }
    }

    const labelEl = document.getElementById(`${prefix}_activeTagLabel`);
    if (labelEl) {
      const activeObj = pills.find(p => p.key === tempPreset);
      labelEl.innerText = activeObj ? activeObj.label : 'Tùy chỉnh';
    }

    const startCard = document.getElementById(`${prefix}_displayStartDate`);
    const endCard = document.getElementById(`${prefix}_displayEndDate`);
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

  function renderCalendarGrid() {
    const titleEl = document.getElementById(`${prefix}_calendarMonthTitle`);
    if (titleEl) {
      titleEl.innerText = `Tháng ${calendarMonth + 1}, ${calendarYear}`;
    }

    const gridEl = document.getElementById(`${prefix}_calendarGrid`);
    if (!gridEl) return;

    const firstDayObj = new Date(calendarYear, calendarMonth, 1);
    const jsDay = firstDayObj.getDay();
    const startDayOffset = jsDay === 0 ? 6 : jsDay - 1;

    const totalDays = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const prevMonthTotalDays = new Date(calendarYear, calendarMonth, 0).getDate();

    let html = '';

    for (let i = startDayOffset - 1; i >= 0; i--) {
      const prevDay = prevMonthTotalDays - i;
      html += `<div class="h-8 flex items-center justify-center text-slate-300 text-[11px] pointer-events-none select-none">${prevDay}</div>`;
    }

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
            <button type="button" onclick="${prefix}_onDayClick(event, '${isoDate}')" class="w-7 h-7 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs cursor-pointer active:scale-95 transition-transform z-10">
              ${day}
            </button>
          </div>
        `;
      } else if (isOnlyStartPicked) {
        html += `
          <div class="h-8 flex items-center justify-center relative">
            <button type="button" onclick="${prefix}_onDayClick(event, '${isoDate}')" class="w-7 h-7 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-md ring-4 ring-blue-100 cursor-pointer active:scale-95 transition-transform z-10">
              ${day}
            </button>
          </div>
        `;
      } else if (isStart) {
        html += `
          <div class="h-8 flex items-center justify-center relative bg-gradient-to-r from-transparent to-blue-50/90 rounded-l-full">
            <button type="button" onclick="${prefix}_onDayClick(event, '${isoDate}')" class="w-7 h-7 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs cursor-pointer active:scale-95 transition-transform z-10">
              ${day}
            </button>
          </div>
        `;
      } else if (isEnd) {
        html += `
          <div class="h-8 flex items-center justify-center relative bg-gradient-to-l from-transparent to-blue-50/90 rounded-r-full">
            <button type="button" onclick="${prefix}_onDayClick(event, '${isoDate}')" class="w-7 h-7 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs cursor-pointer active:scale-95 transition-transform z-10">
              ${day}
            </button>
          </div>
        `;
      } else if (isInRange) {
        html += `
          <div class="h-8 flex items-center justify-center bg-blue-50/90">
            <button type="button" onclick="${prefix}_onDayClick(event, '${isoDate}')" class="w-full h-full text-blue-900 font-bold text-xs flex items-center justify-center cursor-pointer hover:bg-blue-100/70 transition-colors">
              ${day}
            </button>
          </div>
        `;
      } else {
        html += `
          <div class="h-8 flex items-center justify-center">
            <button type="button" onclick="${prefix}_onDayClick(event, '${isoDate}')" class="w-7 h-7 rounded-full hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center transition-colors cursor-pointer">
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

  function toggleDatePopover(event) {
    if (event) event.stopPropagation();
    const popover = document.getElementById(`${prefix}_popoverDateRange`);
    const backdrop = document.getElementById(`${prefix}_datePopoverBackdrop`);
    if (!popover) return;

    const isOpening = popover.classList.contains('hidden');
    if (isOpening) {
      tempRangeStart = appliedStart;
      tempRangeEnd = appliedEnd;
      tempPreset = appliedPreset;
      calendarSelectPhase = 'completed';

      syncYearMonth(tempRangeEnd || tempRangeStart);
      updatePresetPillsUI();
      renderCalendarGrid();
      popover.classList.remove('hidden');
      if (backdrop) backdrop.classList.remove('hidden');

      // Tự động căn chỉnh thông minh ngay bên dưới ô input kích hoạt để không bị tràn viền màn hình
      const trigger = document.getElementById(`${prefix}_btnDateTrigger`);
      if (trigger && typeof window !== 'undefined') {
        const windowWidth = window.innerWidth;
        if (windowWidth < 640) {
          // Trên mobile: Định vị fixed trọn vẹn theo viewport, bung ngay bên dưới ô input kích hoạt, căn giữa màn hình chống cắt cụt lửng
          const triggerRect = trigger.getBoundingClientRect();
          const popoverWidth = Math.min(windowWidth - 24, 360);
          const leftPos = Math.max(12, Math.floor((windowWidth - popoverWidth) / 2));
          
          const availableHeightBelow = window.innerHeight - triggerRect.bottom - 16;
          const estimatedHeight = 440;
          let topPos;
          if (availableHeightBelow >= 280 || triggerRect.top < 280) {
            topPos = Math.max(10, Math.floor(triggerRect.bottom + 6));
            popover.style.maxHeight = `${Math.max(260, window.innerHeight - topPos - 16)}px`;
          } else {
            topPos = Math.max(10, Math.floor(triggerRect.top - estimatedHeight - 6));
            popover.style.maxHeight = `${Math.max(260, triggerRect.top - 16)}px`;
          }

          popover.style.position = 'fixed';
          popover.style.top = `${topPos}px`;
          popover.style.left = `${leftPos}px`;
          popover.style.right = 'auto';
          popover.style.width = `${popoverWidth}px`;
          popover.style.maxWidth = `${windowWidth - 24}px`;
          popover.style.zIndex = '60';
          popover.style.overflowY = 'auto';
        } else {
          // Trên desktop: căn trái hoặc phải theo mép màn hình
          popover.style.position = '';
          popover.style.top = '';
          popover.style.left = '';
          popover.style.right = '';
          popover.style.width = '';
          popover.style.maxWidth = '';
          popover.style.maxHeight = '';
          popover.style.zIndex = '';
          popover.style.overflowY = '';
          const rect = trigger.getBoundingClientRect();
          if (rect.left + 360 > windowWidth - 16) {
            popover.classList.remove('left-0');
            popover.classList.add('right-0');
          } else {
            popover.classList.add('left-0');
            popover.classList.remove('right-0');
          }
        }
      }
    } else {
      cancel(event);
    }
  }

  function selectPreset(event, presetKey) {
    if (event) event.stopPropagation();
    tempPreset = presetKey;
    const presets = getPresetsMap();

    if (presetKey === 'custom') {
      tempRangeStart = null;
      tempRangeEnd = null;
      calendarSelectPhase = 'start';
    } else if (presets[presetKey]) {
      tempRangeStart = presets[presetKey].start;
      tempRangeEnd = presets[presetKey].end;
      calendarSelectPhase = 'completed';
    }

    syncYearMonth(tempRangeEnd || tempRangeStart);
    updatePresetPillsUI();
    renderCalendarGrid();
  }

  function onDayClick(event, isoDate) {
    if (event) event.stopPropagation();

    if (calendarSelectPhase === 'start' || calendarSelectPhase === 'completed' || !tempRangeStart) {
      tempRangeStart = isoDate;
      tempRangeEnd = null;
      calendarSelectPhase = 'end';
      tempPreset = 'custom';
    } else if (calendarSelectPhase === 'end') {
      if (isoDate < tempRangeStart) {
        tempRangeStart = isoDate;
        tempRangeEnd = null;
        calendarSelectPhase = 'end';
        tempPreset = 'custom';
      } else {
        tempRangeEnd = isoDate;
        calendarSelectPhase = 'completed';
        tempPreset = 'custom';
      }
    }

    updatePresetPillsUI();
    renderCalendarGrid();
  }

  function navigateMonth(event, delta) {
    if (event) event.stopPropagation();
    calendarMonth += delta;
    if (calendarMonth < 0) {
      calendarMonth = 11;
      calendarYear--;
    } else if (calendarMonth > 11) {
      calendarMonth = 0;
      calendarYear++;
    }
    renderCalendarGrid();
  }

  function cancel(event) {
    if (event) event.stopPropagation();
    tempRangeStart = appliedStart;
    tempRangeEnd = appliedEnd;
    tempPreset = appliedPreset;
    calendarSelectPhase = 'completed';
    const popover = document.getElementById(`${prefix}_popoverDateRange`);
    const backdrop = document.getElementById(`${prefix}_datePopoverBackdrop`);
    if (popover) {
      popover.classList.add('hidden');
      popover.style.position = '';
      popover.style.top = '';
      popover.style.left = '';
      popover.style.right = '';
      popover.style.width = '';
      popover.style.maxWidth = '';
      popover.style.maxHeight = '';
      popover.style.zIndex = '';
      popover.style.overflowY = '';
    }
    if (backdrop) backdrop.classList.add('hidden');
    onCancelCallback();
  }

  function apply(event) {
    if (event) event.stopPropagation();

    if (tempRangeStart && !tempRangeEnd) {
      tempRangeEnd = tempRangeStart;
    }
    if (!tempRangeStart && !tempRangeEnd) {
      const presets = getPresetsMap();
      tempRangeStart = presets.this_month.start;
      tempRangeEnd = presets.this_month.end;
      tempPreset = 'this_month';
    }

    appliedStart = tempRangeStart;
    appliedEnd = tempRangeEnd;
    appliedPreset = tempPreset;

    const displayEl = document.getElementById(`${prefix}_dateDisplayText`);
    if (displayEl) {
      if (appliedStart === appliedEnd) {
        displayEl.innerText = formatVnDate(appliedStart);
      } else {
        displayEl.innerText = `${formatVnDate(appliedStart)} - ${formatVnDate(appliedEnd)}`;
      }
    }

    const popover = document.getElementById(`${prefix}_popoverDateRange`);
    const backdrop = document.getElementById(`${prefix}_datePopoverBackdrop`);
    if (popover) {
      popover.classList.add('hidden');
      popover.style.position = '';
      popover.style.top = '';
      popover.style.left = '';
      popover.style.right = '';
      popover.style.width = '';
      popover.style.maxWidth = '';
      popover.style.maxHeight = '';
      popover.style.zIndex = '';
      popover.style.overflowY = '';
    }
    if (backdrop) backdrop.classList.add('hidden');

    onApplyCallback(appliedStart, appliedEnd, appliedPreset);
  }

  function setRange(startDate, endDate, presetKey = 'custom') {
    appliedStart = startDate;
    appliedEnd = endDate;
    appliedPreset = presetKey;
    tempRangeStart = startDate;
    tempRangeEnd = endDate;
    tempPreset = presetKey;
    calendarSelectPhase = 'completed';

    const displayEl = document.getElementById(`${prefix}_dateDisplayText`);
    if (displayEl) {
      if (appliedStart === appliedEnd) {
        displayEl.innerText = formatVnDate(appliedStart);
      } else {
        displayEl.innerText = `${formatVnDate(appliedStart)} - ${formatVnDate(appliedEnd)}`;
      }
    }
    syncYearMonth(appliedEnd);
    updatePresetPillsUI();
    renderCalendarGrid();
  }

  // Click outside to cancel & close
  document.addEventListener('click', (e) => {
    const popover = document.getElementById(`${prefix}_popoverDateRange`);
    const trigger = document.getElementById(`${prefix}_btnDateTrigger`);
    if (!popover || popover.classList.contains('hidden')) return;

    const path = (typeof e.composedPath === 'function') ? e.composedPath() : [];
    if (path.includes(popover) || path.includes(trigger)) return;
    if (trigger && trigger.contains(e.target)) return;
    if (popover && popover.contains(e.target)) return;

    cancel(e);
  });

  // Handle window resize or orientation change when popover is open
  window.addEventListener('resize', () => {
    const popover = document.getElementById(`${prefix}_popoverDateRange`);
    const trigger = document.getElementById(`${prefix}_btnDateTrigger`);
    if (!popover || popover.classList.contains('hidden')) return;

    if (window.innerWidth < 640 && trigger) {
      const triggerRect = trigger.getBoundingClientRect();
      const popoverWidth = Math.min(window.innerWidth - 24, 360);
      const leftPos = Math.max(12, Math.floor((window.innerWidth - popoverWidth) / 2));
      const topPos = Math.max(10, Math.floor(triggerRect.bottom + 6));
      popover.style.left = `${leftPos}px`;
      popover.style.top = `${topPos}px`;
      popover.style.width = `${popoverWidth}px`;
      popover.style.maxWidth = `${window.innerWidth - 24}px`;
      popover.style.maxHeight = `${Math.max(260, window.innerHeight - topPos - 16)}px`;
    } else {
      cancel();
    }
  });

  // Export functions globally
  window[`${prefix}_toggleDatePopover`] = toggleDatePopover;
  window[`${prefix}_selectPreset`] = selectPreset;
  window[`${prefix}_onDayClick`] = onDayClick;
  window[`${prefix}_navigateMonth`] = navigateMonth;
  window[`${prefix}_cancel`] = cancel;
  window[`${prefix}_apply`] = apply;

  // Initial render
  updatePresetPillsUI();
  renderCalendarGrid();
  const initDisplay = document.getElementById(`${prefix}_dateDisplayText`);
  if (initDisplay) {
    if (appliedStart === appliedEnd) {
      initDisplay.innerText = formatVnDate(appliedStart);
    } else {
      initDisplay.innerText = `${formatVnDate(appliedStart)} - ${formatVnDate(appliedEnd)}`;
    }
  }

  return {
    getStartDate: () => appliedStart,
    getEndDate: () => appliedEnd,
    getPreset: () => appliedPreset,
    setRange
  };
}

window.createStandardDateRangePicker = createStandardDateRangePicker;

function renderStandardDateRangePickerHTML(prefix, options = {}) {
  const alignClass = options.align === 'left' ? 'left-0 sm:right-auto' : 'left-0 md:left-auto md:right-0';
  const label = options.defaultLabel || '01/11/2026 - 18/11/2026';
  return `
    <div class="relative date-range-picker-wrap">
      <!-- 1. Trigger Button -->
      <button
        id="${prefix}_btnDateTrigger"
        type="button"
        onclick="${prefix}_toggleDatePopover(event)"
        class="sfc-daterange-trigger w-full sm:w-auto min-w-[210px] px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold bg-white text-slate-800 flex items-center justify-between gap-2.5 cursor-pointer hover:border-slate-300 transition-colors text-left shadow-2xs"
      >
        <span class="inline-flex items-center gap-2 truncate">
          <span class="text-[10px] font-bold tracking-wider text-slate-400 uppercase">THỜI GIAN:</span>
          <i class="fa-regular fa-calendar text-amber-500 text-xs shrink-0"></i>
          <span id="${prefix}_dateDisplayText" class="text-slate-800 font-semibold">${label}</span>
        </span>
        <i class="fa-solid fa-chevron-down text-[10px] text-slate-400 shrink-0"></i>
      </button>

      <!-- 2. Dropdown Popover -->
      <div id="${prefix}_datePopoverBackdrop" class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 hidden sm:hidden" onclick="${prefix}_cancel(event)"></div>
      <div
        id="${prefix}_popoverDateRange"
        onclick="event.stopPropagation()"
        class="sfc-daterange-popover hidden absolute top-full ${alignClass} w-[calc(100vw-1.5rem)] sm:w-[360px] md:w-[380px] max-w-[360px] mt-1.5 z-50 bg-white rounded-2xl border border-slate-200/90 shadow-[0_20px_50px_rgba(15,23,42,0.22)] p-4 space-y-3.5 transition-all text-left ring-1 ring-slate-900/5"
      >
        <!-- 1. Header -->
        <div class="flex items-center justify-between pb-2.5 border-b border-slate-100">
          <span class="text-xs font-bold text-slate-900">Chọn khoảng thời gian</span>
          <span class="text-[11px] font-semibold text-slate-500">Đang chọn: <span id="${prefix}_activeTagLabel" class="font-bold text-blue-600">Tháng này</span></span>
        </div>

        <!-- 2. Ô hiển thị Khoảng ngày (Từ ngày - Đến ngày) -->
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <span class="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">TỪ NGÀY</span>
            <span id="${prefix}_displayStartDate" class="font-black text-slate-800 text-xs tracking-tight">01/11/2026</span>
          </div>
          <div class="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <span class="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">ĐẾN NGÀY</span>
            <span id="${prefix}_displayEndDate" class="font-black text-slate-800 text-xs tracking-tight">18/11/2026</span>
          </div>
        </div>

        <!-- 3. Nút Chọn nhanh (Preset Tags / Pills) -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-xs">
          <button type="button" id="${prefix}_btnPreset_7days" onclick="${prefix}_selectPreset(event, '7_days')" class="sfc-preset-chip preset-tag-btn px-2.5 sm:px-3 py-1.5 rounded-lg font-bold border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 cursor-pointer whitespace-nowrap transition-all">
            7 ngày
          </button>
          <button type="button" id="${prefix}_btnPreset_30days" onclick="${prefix}_selectPreset(event, '30_days')" class="sfc-preset-chip preset-tag-btn px-2.5 sm:px-3 py-1.5 rounded-lg font-bold border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 cursor-pointer whitespace-nowrap transition-all">
            30 ngày
          </button>
          <button type="button" id="${prefix}_btnPreset_this_month" onclick="${prefix}_selectPreset(event, 'this_month')" class="sfc-preset-chip preset-tag-btn px-2.5 sm:px-3 py-1.5 rounded-lg font-bold bg-blue-600 text-white shadow-xs cursor-pointer whitespace-nowrap transition-all">
            Tháng này
          </button>
          <button type="button" id="${prefix}_btnPreset_quarter" onclick="${prefix}_selectPreset(event, 'quarter')" class="sfc-preset-chip preset-tag-btn px-2.5 sm:px-3 py-1.5 rounded-lg font-bold border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 cursor-pointer whitespace-nowrap transition-all">
            Quý
          </button>
          <button type="button" id="${prefix}_btnPreset_custom" onclick="${prefix}_selectPreset(event, 'custom')" class="sfc-preset-chip preset-tag-btn px-2.5 sm:px-3 py-1.5 rounded-lg font-bold border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 cursor-pointer whitespace-nowrap transition-all flex items-center gap-1.5">
            <span>Tùy chỉnh</span>
            <span id="${prefix}_customDot" class="w-1.5 h-1.5 rounded-full bg-blue-600 hidden"></span>
          </button>
        </div>

        <!-- 4 & 5. Khối Lịch & Khoảng chọn (Calendar Grid) -->
        <div class="pt-2 border-t border-slate-100 space-y-2">
          <!-- Điều hướng tháng -->
          <div class="flex items-center justify-between px-1">
            <button type="button" onclick="${prefix}_navigateMonth(event, -1)" class="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-center text-xs transition-colors cursor-pointer" aria-label="Tháng trước">
              <i class="fa-solid fa-chevron-left"></i>
            </button>
            <span id="${prefix}_calendarMonthTitle" class="text-xs font-black text-slate-800">Tháng 11, 2026</span>
            <button type="button" onclick="${prefix}_navigateMonth(event, 1)" class="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-center text-xs transition-colors cursor-pointer" aria-label="Tháng sau">
              <i class="fa-solid fa-chevron-right"></i>
            </button>
          </div>

          <!-- Thứ trong tuần -->
          <div class="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 py-1">
            <span>T2</span>
            <span>T3</span>
            <span>T4</span>
            <span>T5</span>
            <span>T6</span>
            <span>T7</span>
            <span>CN</span>
          </div>

          <!-- Lưới ngày -->
          <div id="${prefix}_calendarGrid" class="grid grid-cols-7 gap-y-1 text-center text-xs font-medium">
            <!-- Dynamically rendered days -->
          </div>
        </div>

        <!-- 6. Chân Dropdown (Footer Actions) -->
        <div class="flex items-center justify-end gap-2 pt-2.5 border-t border-slate-100">
          <button type="button" onclick="${prefix}_cancel(event)" class="sfc-btn-secondary px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer">
            Hủy
          </button>
          <button type="button" onclick="${prefix}_apply(event)" class="sfc-btn-primary px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer">
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  `;
}

// ============================================================================
// INSTANT GLOBAL KPI LIGHT POPOVER & EXPAND ENGINE
// (HIỂN THỊ SỐ TIỀN CHI TIẾT GỌN SÁNG KHI RÊ CHUỘT VÀO TOÀN BỘ VÙNG CARD CHỈ SỐ)
// ============================================================================
let techeraKpiTooltipEl = null;
let techeraKpiActiveTarget = null;
let techeraKpiHideTimeout = null;

function initTecheraKpiTooltip() {
  if (techeraKpiTooltipEl || typeof document === 'undefined') return;

  techeraKpiTooltipEl = document.createElement('div');
  techeraKpiTooltipEl.id = 'techeraKpiTooltip';
  techeraKpiTooltipEl.innerHTML = `
    <div class="techera-kpi-bubble">
      <div class="techera-kpi-bubble-label">
        <span id="techeraKpiTooltipIcon" class="techera-kpi-bubble-icon"><i class="fa-solid fa-coins text-sky-500"></i></span>
        <span id="techeraKpiTooltipLabel" class="techera-kpi-bubble-title">Chỉ số</span>
      </div>
      <div class="techera-kpi-bubble-value" id="techeraKpiTooltipValue">0 đ</div>
    </div>
    <div class="techera-kpi-arrow techera-kpi-arrow-down" id="techeraKpiTooltipArrow"></div>
  `;
  document.body.appendChild(techeraKpiTooltipEl);

  // Sự kiện rê chuột (hover) trên toàn bộ vùng Card trên Desktop
  document.addEventListener('mouseover', handleKpiTooltipMouseOver, { passive: true });
  document.addEventListener('mouseout', handleKpiTooltipMouseOut, { passive: true });

  // Sự kiện chạm (tap) trên Mobile (< 1024px) & click
  document.addEventListener('touchstart', handleKpiTouchStart, { passive: true });
  document.addEventListener('click', handleKpiClick);

  // Tự động quét và đăng ký dữ liệu cho toàn bộ Card chỉ số
  autoRegisterKpiCardElements();
}


/**
 * Kiểm tra xem một phần tử KPI có phải là CHỈ SỐ TIỀN TỆ (MONEY) hay không.
 * Các chỉ số là SỐ LƯỢNG (đơn hàng, vé, đại lý, lượt, giao dịch...) KHÔNG áp dụng tooltip/click.
 */
function isKpiCurrency(valEl, card, label, fullVal, compactVal, rawVal) {
  if (valEl) {
    if (valEl.getAttribute('data-kpi-type') === 'quantity') return false;
    if (valEl.getAttribute('data-kpi-type') === 'currency') return true;
    if (valEl.hasAttribute('data-kpi-currency')) return true;
  }
  if (card) {
    if (card.getAttribute('data-kpi-type') === 'quantity') return false;
    if (card.getAttribute('data-kpi-type') === 'currency') return true;
  }

  const full = (fullVal || (valEl ? valEl.getAttribute('data-kpi-full') : '') || '').trim();
  const compact = (compactVal || (valEl ? valEl.getAttribute('data-kpi-compact') : '') || (valEl ? (valEl.innerText || valEl.textContent) : '') || '').trim();
  const lbl = (label || (card ? card.getAttribute('data-kpi-label') : '') || '').toLowerCase();

  // 1. Chứa đơn vị tiền tệ rõ ràng: đ, ₫, VND, VNĐ, $
  if (/([đ₫]|vnd|vnđ|\$)/i.test(full) || /([đ₫]|vnd|vnđ|\$)/i.test(compact)) {
    return true;
  }

  // 2. Chứa hậu tố rút gọn tiền tệ M hoặc B (hàng triệu, hàng tỷ) mà không chứa từ khóa đơn vị số lượng
  if (/^[-+]?\d+(\.\d+)?\s*[MB]$/i.test(compact)) {
    if (/(đơn|đơn hàng|vé|đại lý|khách|giao dịch|gd|lệnh|người|lượt|item|tài khoản|sản phẩm)/i.test(lbl)) {
      return false;
    }
    return true;
  }

  // 3. Nhãn đặc trưng cho tiền tệ/tài chính
  if (/(doanh thu|chi phí|dòng tiền|số dư|lợi nhuận|tiền|thuế|vat|thu nhập|công nợ|nạp ví|tổng tiền|giá trị)/i.test(lbl)) {
    if (/(đơn|vé|đại lý|khách|giao dịch|gd|lệnh|người|lượt|item|tài khoản|sản phẩm)/i.test(compact) ||
        /(đơn|vé|đại lý|khách|giao dịch|gd|lệnh|người|lượt|item|tài khoản|sản phẩm)/i.test(full)) {
      return false;
    }
    return true;
  }

  // 4. Nếu rõ ràng là đơn vị số lượng -> KHÔNG PHẢI TIỀN
  if (/(đơn|đơn hàng|vé|đại lý|khách|giao dịch|gd|lệnh|người|lượt|item|tài khoản|sản phẩm|số lượng|count|hoàn tất|đang xử lý|đã hủy|thất bại|active)/i.test(lbl) ||
      /(đơn|đơn hàng|vé|đại lý|khách|giao dịch|gd|lệnh|người|lượt|item|tài khoản|sản phẩm)/i.test(compact) ||
      /(đơn|đơn hàng|vé|đại lý|khách|giao dịch|gd|lệnh|người|lượt|item|tài khoản|sản phẩm)/i.test(full)) {
    return false;
  }

  return false;
}
window.isKpiCurrency = isKpiCurrency;
/**
 * Tự động đăng ký các Card chỉ số và con số rút gọn trong DOM
 * CHỈ áp dụng cho các Card liên quan đến SỐ TIỀN (MONEY), bỏ qua các card dạng SỐ LƯỢNG.
 */
function autoRegisterKpiCardElements() {
  if (typeof document === 'undefined') return;
  // Quét các phần tử mang class .kpi-card-value
  const elements = document.querySelectorAll('.kpi-card-value');
  elements.forEach(el => {
    let rawVal = el.getAttribute('data-kpi-raw');
    let full = el.getAttribute('data-kpi-full');
    let txt = (el.innerText || el.textContent || '').trim();

    if (!el.getAttribute('data-kpi-compact') && txt && txt !== full) {
      el.setAttribute('data-kpi-compact', txt);
    }
    const compact = el.getAttribute('data-kpi-compact') || txt;

    // Suy luận rawVal nếu chưa được gán trực tiếp
    if (!rawVal) {
      if (/^[-+]?\d+(\.\d+)?\s*[MB]/i.test(compact)) {
        let numText = compact.replace(/[^\d.MB-]/gi, '');
        let isNeg = numText.startsWith('-');
        numText = numText.replace('-', '');
        let mult = 1e6;
        if (numText.toUpperCase().endsWith('B')) mult = 1e9;
        rawVal = parseFloat(numText) * mult * (isNeg ? -1 : 1);
        el.setAttribute('data-kpi-raw', rawVal);
      } else if (full && /\d/.test(full)) {
        const clean = full.replace(/[^\d-]/g, '');
        if (clean) {
          rawVal = parseFloat(clean);
          el.setAttribute('data-kpi-raw', rawVal);
        }
      }
    }

    const parentCard = el.closest ? el.closest('.kpi-card, [class*="rounded-2xl"], [class*="rounded-3xl"], [class*="rounded-xl"]') : null;
    const cardLabel = extractKpiCardLabel(parentCard, el);

    // NẾU LÀ CARD SỐ LƯỢNG (KHÔNG PHẢI TIỀN): GỠ BỎ HOÀN TOÀN TƯƠNG TÁC
    if (!isKpiCurrency(el, parentCard, cardLabel, full, compact, rawVal)) {
      el.classList.remove('kpi-shortened', 'cursor-pointer', 'kpi-card-value', 'kpi-expanded');
      el.removeAttribute('title');
      if (parentCard) {
        parentCard.removeAttribute('data-kpi-card');
        parentCard.removeAttribute('data-kpi-card-target');
        parentCard.removeAttribute('title');
      }
      return;
    }

    const num = parseFloat(rawVal);
    const isShortened = !isNaN(num) && Math.abs(num) >= 1000000;
    if (isShortened) {
      el.classList.add('kpi-shortened', 'cursor-pointer');
    }

    // Xóa title mặc định của trình duyệt để không bị popup đen che
    el.removeAttribute('title');

    // Đăng ký cho Card cha
    if (parentCard && parentCard !== el) {
      if (!el.id) {
        el.id = 'kpi_val_' + Math.random().toString(36).substr(2, 9);
      }
      parentCard.setAttribute('data-kpi-card', 'true');
      parentCard.setAttribute('data-kpi-card-target', el.id);
      if (!isNaN(num)) parentCard.setAttribute('data-kpi-raw', num);
      if (cardLabel) parentCard.setAttribute('data-kpi-label', cardLabel);
      parentCard.removeAttribute('title');
    }
  });
}

/**
 * Trích xuất nhãn/tên chỉ số sạch sẽ từ cấu trúc Card
 */
function extractKpiCardLabel(card, valEl) {
  if (card && card.hasAttribute('data-kpi-label')) {
    const l = card.getAttribute('data-kpi-label');
    if (l) return l;
  }
  if (valEl && valEl.hasAttribute('data-kpi-label')) {
    const l = valEl.getAttribute('data-kpi-label');
    if (l) return l;
  }

  // Quét bên trong cấu trúc của Card hiện tại
  if (card) {
    // 1. Nếu valEl có phần tử đứng ngay trước trong cùng container
    if (valEl && valEl.previousElementSibling && card.contains(valEl)) {
      const prevText = (valEl.previousElementSibling.innerText || '').trim();
      if (prevText && prevText.length < 50 && !prevText.includes('đ') && !/^[+-]?\d/.test(prevText)) {
        return prevText;
      }
    }

    // 2. Quét các thẻ nhãn phổ biến trong Card
    const labelCandidates = card.querySelectorAll('[class*="text-[11px]"], [class*="text-[10px]"], [class*="text-xs"], [class*="uppercase"]');
    for (const node of labelCandidates) {
      if (valEl && (node.contains(valEl) || node === valEl)) continue;
      const txt = (node.innerText || node.textContent || '').trim();
      if (txt && txt.length < 40 && !txt.includes('%') && !txt.includes('đ') && !/^[+-]?\d/.test(txt)) {
        return txt;
      }
    }
  }

  return 'Chỉ số tài chính';
}

/**
 * Trích xuất HTML icon nhận diện của Card (ưu tiên icon badge, loại bỏ icon watermark to mờ)
 */
function extractKpiCardIconHTML(card) {
  if (!card) return '<i class="fa-solid fa-coins text-sky-500 text-[11px]"></i>';

  // 1. Icon nằm trong badge hình vuông/tròn bo góc nhỏ (w-10, w-8, w-7, rounded-xl...)
  const badgeIcon = card.querySelector('.w-10 i, .w-8 i, .w-7 i, [class*="rounded-xl"] i, [class*="rounded-lg"] i');
  if (badgeIcon) {
    const classes = badgeIcon.className.replace(/text-(base|lg|sm|xs|2xl|3xl|4xl|5xl)/g, '').trim();
    return `<i class="${classes} text-[11px]"></i>`;
  }

  // 2. Icon thông thường không phải watermark absolute
  const generalIcon = card.querySelector('i.fa-solid:not(.absolute), i.fa-regular:not(.absolute), i.fa-brands:not(.absolute)');
  if (generalIcon) {
    const classes = generalIcon.className.replace(/text-(base|lg|sm|xs|2xl|3xl|4xl|5xl)/g, '').trim();
    return `<i class="${classes} text-[11px]"></i>`;
  }

  return '<i class="fa-solid fa-coins text-sky-500 text-[11px]"></i>';
}

/**
 * Trích xuất ngữ cảnh Card chỉ số từ phần tử DOM mục tiêu
 */
function getKpiCardContext(target) {
  if (!target || target === document.body || target === document.documentElement) return null;

  // 1. Tìm container Card cha
  let card = target.closest ? target.closest('[data-kpi-card="true"], .kpi-card, [data-kpi-card-target]') : null;
  if (!card && target.closest) {
    const candidate = target.closest('[class*="rounded-2xl"], [class*="rounded-3xl"], [class*="rounded-xl"]');
    if (candidate && candidate.querySelector('.kpi-card-value, [data-kpi-raw]')) {
      card = candidate;
    }
  }

  // 2. Tìm phần tử hiển thị con số bên trong Card
  let valEl = null;
  if (card) {
    const targetId = card.getAttribute('data-kpi-card-target');
    if (targetId) valEl = document.getElementById(targetId);
    if (!valEl) valEl = card.querySelector('.kpi-card-value, [data-kpi-raw]');
  } else {
    valEl = target.closest ? target.closest('.kpi-card-value, [data-kpi-raw]') : null;
    if (valEl) {
      card = valEl.closest ? valEl.closest('.kpi-card, [class*="rounded-2xl"], [class*="rounded-3xl"], [class*="rounded-xl"]') : null;
    }
  }

  if (!card || !valEl) return null;

  // Lấy rawValue (số nguyên gốc từ hệ thống)
  let rawVal = null;
  if (valEl.hasAttribute('data-kpi-raw')) {
    rawVal = parseFloat(valEl.getAttribute('data-kpi-raw'));
  } else if (card.hasAttribute('data-kpi-raw')) {
    rawVal = parseFloat(card.getAttribute('data-kpi-raw'));
  }

  let fullText = valEl.getAttribute('data-kpi-full') || '';
  let compactText = valEl.getAttribute('data-kpi-compact') || valEl.textContent.trim();

  // Suy luận số nếu rawVal chưa có
  if (rawVal === null || isNaN(rawVal)) {
    if (/^[-+]?\d+(\.\d+)?\s*[MB]/i.test(compactText)) {
      let numText = compactText.replace(/[^\d.MB-]/gi, '');
      let isNeg = numText.startsWith('-');
      numText = numText.replace('-', '');
      let mult = 1e6;
      if (numText.toUpperCase().endsWith('B')) mult = 1e9;
      rawVal = parseFloat(numText) * mult * (isNeg ? -1 : 1);
    } else if (fullText && /\d/.test(fullText)) {
      const cleanNum = fullText.replace(/[^\d-]/g, '');
      if (cleanNum) rawVal = parseFloat(cleanNum);
    }
  }

  // QUY TẮC NGHIỆP VỤ:
  // Chỉ áp dụng tooltip cho card LIÊN QUAN ĐẾN SỐ TIỀN (MONEY), card số lượng bỏ qua.
  const label = extractKpiCardLabel(card, valEl);
  if (!isKpiCurrency(valEl, card, label, fullText, compactText, rawVal)) {
    return null;
  }

  // Chỉ hiển thị tooltip số chi tiết khi giá trị đã bị rút gọn (rawValue >= 1.000.000);
  // nếu số nhỏ hơn 1.000.000 thì bản thân Card đã hiển thị số đầy đủ nên không cần bật tooltip dư thừa.
  if (rawVal === null || isNaN(rawVal) || Math.abs(rawVal) < 1000000) {
    return null;
  }

  // Định dạng chuẩn tiền tệ Việt Nam (1.870.000 đ, 1.250.000.000 đ)
  if (!fullText) {
    const isNeg = rawVal < 0;
    fullText = (isNeg ? '-' : '') + formatMoney(Math.abs(rawVal)) + ' đ';
  }

  const iconHTML = extractKpiCardIconHTML(card);

  return {
    card,
    valEl,
    rawVal,
    fullText,
    compactText,
    label,
    iconHTML
  };
}

/**
 * Hiển thị Popover sáng màu chứa Icon + Tên chỉ số + Số tiền đầy đủ
 */
function showKpiTooltip(ctx) {
  if (!ctx) return;
  if (!techeraKpiTooltipEl) initTecheraKpiTooltip();
  if (!techeraKpiTooltipEl) return;

  if (techeraKpiHideTimeout) {
    clearTimeout(techeraKpiHideTimeout);
    techeraKpiHideTimeout = null;
  }

  const valEl = document.getElementById('techeraKpiTooltipValue');
  const labelEl = document.getElementById('techeraKpiTooltipLabel');
  const iconSpan = document.getElementById('techeraKpiTooltipIcon');

  if (valEl) valEl.innerText = ctx.fullText;
  if (labelEl) labelEl.innerText = ctx.label;
  if (iconSpan && ctx.iconHTML) iconSpan.innerHTML = ctx.iconHTML;

  // Xóa title mặc định của trình duyệt để ngăn chặn xung đột
  if (ctx.valEl && ctx.valEl.hasAttribute('title')) ctx.valEl.removeAttribute('title');
  if (ctx.card && ctx.card.hasAttribute('title')) ctx.card.removeAttribute('title');

  techeraKpiActiveTarget = ctx.card;
  techeraKpiTooltipEl.style.display = 'block';

  // Tính toán vị trí hiển thị popover và mũi nhọn (arrow)
  const cardRect = ctx.card.getBoundingClientRect();
  const valRect = ctx.valEl.getBoundingClientRect();
  const tooltipRect = techeraKpiTooltipEl.getBoundingClientRect();
  const arrowEl = document.getElementById('techeraKpiTooltipArrow');

  // Căn giữa theo phần tử con số
  let left = valRect.left + valRect.width / 2 - tooltipRect.width / 2;
  const minLeft = 12;
  const maxLeft = (window.innerWidth || 1024) - tooltipRect.width - 12;
  const clampedLeft = Math.max(minLeft, Math.min(left, maxLeft));

  // Căn chỉnh mũi nhọn luôn trỏ thẳng vào giữa phần tử hiển thị con số
  if (arrowEl) {
    let arrowOffset = (valRect.left + valRect.width / 2) - clampedLeft;
    arrowOffset = Math.max(16, Math.min(arrowOffset, tooltipRect.width - 16));
    arrowEl.style.left = `${arrowOffset}px`;
    arrowEl.style.marginLeft = '-5px';
  }

  // Đặt popover nằm phía trên hẳn toàn bộ Card (cách mép trên Card 8px) để không che lấp nhãn và icon bên trong
  let top = cardRect.top - tooltipRect.height - 8;
  let arrowDown = true;

  // Tự động đảo chiều xuống dưới nếu sát mép trên màn hình
  if (top < 10) {
    top = cardRect.bottom + 8;
    arrowDown = false;
  }

  if (arrowEl) {
    arrowEl.className = arrowDown ? 'techera-kpi-arrow techera-kpi-arrow-down' : 'techera-kpi-arrow techera-kpi-arrow-up';
  }

  techeraKpiTooltipEl.style.left = `${clampedLeft}px`;
  techeraKpiTooltipEl.style.top = `${top}px`;

  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(() => {
      techeraKpiTooltipEl?.classList.add('visible');
    });
  } else {
    techeraKpiTooltipEl?.classList.add('visible');
  }
}

/**
 * Ẩn popover với độ trễ nhẹ mượt mà
 */
function hideKpiTooltip(delay = 80) {
  if (techeraKpiActiveTarget) {
    techeraKpiActiveTarget = null;
  }

  if (techeraKpiTooltipEl) {
    techeraKpiTooltipEl.classList.remove('visible');
    if (techeraKpiHideTimeout) clearTimeout(techeraKpiHideTimeout);

    if (delay === 0) {
      techeraKpiTooltipEl.style.display = 'none';
    } else {
      techeraKpiHideTimeout = setTimeout(() => {
        if (techeraKpiTooltipEl && !techeraKpiTooltipEl.classList.contains('visible')) {
          techeraKpiTooltipEl.style.display = 'none';
        }
      }, delay);
    }
  }
}

/**
 * Xử lý sự kiện rê chuột (hover) trên toàn bộ vùng Card chỉ số
 */
function handleKpiTooltipMouseOver(e) {
  const target = e.target;
  if (!target) return;

  // Bỏ qua các phần tử nhập liệu, nút bấm, dropdown bên trong Card
  if (target.closest('button, a, input, select, textarea, [data-dropdown-toggle], .flatpickr-calendar')) {
    hideKpiTooltip();
    return;
  }

  const ctx = getKpiCardContext(target);
  if (!ctx) {
    hideKpiTooltip();
    return;
  }

  // Nếu chuột di chuyển giữa các phần tử con trong cùng một Card thì giữ nguyên popover không chớp nháy
  if (techeraKpiActiveTarget && (techeraKpiActiveTarget === ctx.card || techeraKpiActiveTarget === ctx.valEl)) {
    if (techeraKpiHideTimeout) {
      clearTimeout(techeraKpiHideTimeout);
      techeraKpiHideTimeout = null;
    }
    return;
  }

  showKpiTooltip(ctx);
}

/**
 * Xử lý sự kiện rời chuột (mouseout) khỏi vùng Card chỉ số
 */
function handleKpiTooltipMouseOut(e) {
  const relatedTarget = e.relatedTarget;
  if (techeraKpiActiveTarget && relatedTarget && techeraKpiActiveTarget.contains(relatedTarget)) {
    return; // Vẫn đang ở bên trong Card
  }
  hideKpiTooltip();
}

/**
 * Xử lý chạm (tap) trên Mobile (< 1024px)
 */
function handleKpiTouchStart(e) {
  const target = e.target;
  if (!target) return;

  if (target.closest('button, a, input, select, textarea, [data-dropdown-toggle], .flatpickr-calendar')) {
    hideKpiTooltip(0);
    return;
  }

  const ctx = getKpiCardContext(target);
  if (ctx) {
    if (techeraKpiActiveTarget === (ctx.card || ctx.valEl) && techeraKpiTooltipEl?.classList.contains('visible')) {
      hideKpiTooltip(0);
    } else {
      showKpiTooltip(ctx);
    }
  } else {
    // Chạm ra ngoài Card: tự động ẩn popover
    hideKpiTooltip(0);
  }
}

let techeraKpiToastTimeout = null;
function showKpiToast(message, isExpanded = true) {
  if (typeof document === 'undefined') return;
  let toastEl = document.getElementById('techeraKpiToast');
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.id = 'techeraKpiToast';
    toastEl.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999999] px-4 py-2.5 rounded-2xl bg-slate-900/95 text-white text-xs font-semibold shadow-2xl backdrop-blur-md border border-slate-700/80 flex items-center gap-2 transition-all duration-200 pointer-events-none opacity-0 translate-y-3 select-none';
    document.body.appendChild(toastEl);
  }

  toastEl.innerHTML = isExpanded 
    ? `<i class="fa-solid fa-circle-check text-emerald-400 text-sm"></i> <span>Số đầy đủ: <strong class="text-sky-300 font-mono tracking-tight text-[13px] ml-1">${message}</strong></span>`
    : `<i class="fa-solid fa-compress text-amber-400 text-sm"></i> <span>Đã thu gọn: <strong class="text-amber-200 font-mono tracking-tight text-[13px] ml-1">${message}</strong></span>`;

  toastEl.classList.remove('opacity-0', 'translate-y-3');
  toastEl.classList.add('opacity-100', 'translate-y-0');

  if (techeraKpiToastTimeout) clearTimeout(techeraKpiToastTimeout);
  techeraKpiToastTimeout = setTimeout(() => {
    toastEl.classList.remove('opacity-100', 'translate-y-0');
    toastEl.classList.add('opacity-0', 'translate-y-3');
  }, 2200);
}

function toggleKpiElementValue(el) {
  if (!el) return false;
  // Chỉ cho phép toggle hiển thị số đầy đủ với card SỐ TIỀN
  const parentCard = el.closest ? el.closest('.kpi-card, [data-kpi-card="true"], [class*="rounded-2xl"], [class*="rounded-3xl"], [class*="rounded-xl"]') : null;
  if (!isKpiCurrency(el, parentCard)) return false;
  let fullVal = el.getAttribute('data-kpi-full');
  let compactVal = el.getAttribute('data-kpi-compact');
  let rawVal = el.getAttribute('data-kpi-raw');

  if (!fullVal && rawVal) {
    const num = parseFloat(rawVal);
    if (!isNaN(num)) fullVal = `${formatMoney(Math.abs(num))} đ`;
  }

  if (!compactVal) {
    compactVal = (el.innerText || el.textContent || '').trim();
    if (compactVal && compactVal !== fullVal) {
      el.setAttribute('data-kpi-compact', compactVal);
    }
  }

  // Nếu không có số đầy đủ hoặc số đầy đủ giống y nguyên số hiển thị thì không toggle
  if (!fullVal || fullVal === compactVal) return false;

  const isExpanded = el.classList.contains('kpi-expanded');
  if (isExpanded) {
    el.innerText = compactVal || fullVal;
    el.classList.remove('kpi-expanded');
    showKpiToast(compactVal, false);
  } else {
    el.innerText = fullVal;
    el.classList.add('kpi-expanded');
    showKpiToast(fullVal, true);
  }

  // Hiệu ứng nhịp nảy (pulse) nhẹ tạo cảm giác phản hồi xúc giác
  el.classList.remove('kpi-pulse');
  void el.offsetWidth; // force reflow
  el.classList.add('kpi-pulse');

  // Đóng popover trôi nổi để không che mất con số đã mở rộng
  hideKpiTooltip(0);
  return true;
}

function handleKpiClick(e) {
  const target = e.target;
  if (!target) return;

  // Bỏ qua nếu bấm vào các phần tử tương tác khác (nút bấm, liên kết, ô nhập liệu, dropdown, bộ chọn ngày)
  if (target.closest('button, a, input, select, textarea, [role="button"], [data-dropdown-toggle], .dropdown-menu, .flatpickr-calendar, .badge-action')) {
    hideKpiTooltip(0);
    return;
  }

  // 1. Bấm trực tiếp vào con số KPI (.kpi-card-value hoặc phần tử mang data-kpi-full)
  const directKpiEl = target.closest('.kpi-card-value, [data-kpi-full]');
  if (directKpiEl) {
    if (toggleKpiElementValue(directKpiEl)) {
      e.stopPropagation();
      return;
    }
  }

  // 2. Bấm vào khối cha gần nhất chứa con số KPI (ví dụ box Thực tế / Dự kiến)
  if (target.parentElement) {
    const siblingKpiEl = target.parentElement.querySelector('.kpi-card-value, [data-kpi-full]');
    if (siblingKpiEl && toggleKpiElementValue(siblingKpiEl)) {
      e.stopPropagation();
      return;
    }
  }

  // 3. Bấm vào vùng card chứa chỉ số (Card KPI hoặc container bo góc có chứa chỉ số)
  const card = target.closest('.kpi-card, [data-kpi-card-target], [data-kpi-card="true"], [class*="rounded-2xl"], [class*="rounded-3xl"], [class*="rounded-xl"]');
  if (card) {
    let targetEl = null;
    const targetId = card.getAttribute('data-kpi-card-target');
    if (targetId) {
      targetEl = document.getElementById(targetId);
    }
    if (!targetEl) {
      targetEl = card.querySelector('.kpi-card-value, [data-kpi-full]');
    }

    if (targetEl && toggleKpiElementValue(targetEl)) {
      e.stopPropagation();
    }
  }
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initTecheraKpiTooltip();
      autoRegisterKpiCardElements();
    });
  } else {
    initTecheraKpiTooltip();
    autoRegisterKpiCardElements();
  }
}

window.renderStandardDateRangePickerHTML = renderStandardDateRangePickerHTML;
window.formatKpiCurrency = formatKpiCurrency;
window.setKpiCardValue = setKpiCardValue;
window.renderKpiValueMarkup = renderKpiValueMarkup;
window.initTecheraKpiTooltip = initTecheraKpiTooltip;
window.toggleKpiElementValue = toggleKpiElementValue;
window.autoRegisterKpiCardElements = autoRegisterKpiCardElements;
window.showKpiToast = showKpiToast;
window.getKpiCardContext = getKpiCardContext;
window.showKpiTooltip = showKpiTooltip;
window.hideKpiTooltip = hideKpiTooltip;
