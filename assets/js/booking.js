// ============================================================================
// BOOKING DETAIL PAGE ENGINE (booking.html)
// ============================================================================

let currentSelectedDestinationId = 'sunworld-bana';
let currentSelectedSupplierId = 'partner';
let ticketPackages = {};
let hasConfirmedDate = false;
let isCalendarExpanded = true;
const __bookingTodayInit = getSystemTodayParts();
let selectedDate = { ...__bookingTodayInit };
let viewDate = { month: __bookingTodayInit.month, year: __bookingTodayInit.year };
let pickerMonth = __bookingTodayInit.month;
let pickerYear = __bookingTodayInit.year;

let activeServiceTab = null;
let activeMarketTab = null;
let packageConfigStates = {};
let selectedOrderTickets = {};
let bookingSessionDiscountRate = 0;
let bookingSessionPax = { adult: 1, child: 0, senior: 0 };
let pendingModalSupplierId = 'partner';
let editingCartItemId = null;

function persistBookingContext() {
  TecheraDB.saveBookingContext({
    destId: currentSelectedDestinationId,
    supplierId: currentSelectedSupplierId,
    hasConfirmedDate,
    selectedDate,
    quickPax: bookingSessionPax,
    selectedOrderTickets,
    discountRate: bookingSessionDiscountRate
  });
}

function syncBookingFlowVisibility() {
  const hasSupplier = !!currentSelectedSupplierId;
  const isUnavailable = isBookingDateUnavailable(selectedDate.day, selectedDate.month, selectedDate.year);
  const showSection3 = hasSupplier && hasConfirmedDate;
  const showTier1 = showSection3 && !isUnavailable;
  const showTier2 = showTier1 && (activeServiceTab !== null);

  const resolvedPkg = (showTier2 && activeMarketTab !== null) ? getActiveFilteredPackage() : null;
  const validPkg = (resolvedPkg && !resolvedPkg.notFoundBySearch) ? resolvedPkg : null;
  const showTier34Wrap = showTier2 && (activeMarketTab !== null) && !!resolvedPkg;
  const state = validPkg ? getOrInitPackageConfigState(validPkg) : null;
  const showSection4 = !!(validPkg && isPackagePaxEnabled(validPkg, state));

  const dateSection = document.getElementById('dateSelectionSection');
  const packagesSection = document.getElementById('bookingPackagesSection');
  const tier1Block = document.getElementById('tier1ServiceGroupBlock');
  const tier2Block = document.getElementById('tier2MarketBlock');
  const tier34Wrap = document.getElementById('ticketListContainer');
  const paxSection = document.getElementById('paxQuantitySection');
  const sidebarWrapper = document.getElementById('orderSidebarWrapper');

  if (dateSection) dateSection.classList.toggle('hidden', !hasSupplier);
  if (packagesSection) packagesSection.classList.toggle('hidden', !showSection3);
  if (tier1Block) tier1Block.classList.toggle('hidden', !showTier1);
  if (tier2Block) tier2Block.classList.toggle('hidden', !showTier2);
  if (tier34Wrap) tier34Wrap.classList.toggle('hidden', !showTier34Wrap);
  if (paxSection) paxSection.classList.toggle('hidden', !showSection4);
  if (sidebarWrapper) sidebarWrapper.classList.toggle('lg:block', hasSupplier);

  const stepDate = document.getElementById('stepperStepDate');
  const stepPkg = document.getElementById('stepperStepPackage');
  const stepQty = document.getElementById('stepperStepQty');
  if (stepDate) stepDate.className = hasSupplier ? 'flex items-center gap-2 text-slate-800 font-bold' : 'flex items-center gap-2 text-slate-400 font-semibold';
  if (stepPkg) stepPkg.className = showSection3 ? 'flex items-center gap-2 text-slate-800 font-bold' : 'flex items-center gap-2 text-slate-400 font-semibold';
  if (stepQty) stepQty.className = showSection4 ? 'flex items-center gap-2 text-slate-800 font-bold' : 'flex items-center gap-2 text-slate-400 font-semibold';
}

function getSupplierLogoMarkup(sup) {
  if (sup.id === 'techera') {
    return `
      <div class="w-12 h-12 rounded-xl bg-[#0B132B] border border-slate-800 flex items-center justify-center shrink-0 shadow-xs">
        <svg class="w-6 h-6 text-[#F25C22]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2a1 1 0 0 1 1 1v4.07l2.88-2.88a1 1 0 1 1 1.41 1.41L14.41 8.5H18.5a1 1 0 1 1 0 2h-4.09l2.88 2.88a1 1 0 1 1-1.41 1.41L13 11.91V16a1 1 0 1 1-2 0v-4.09l-2.88 2.88a1 1 0 0 1-1.41-1.41L9.59 10.5H5.5a1 1 0 0 1 0-2h4.09L6.71 5.62a1 1 0 0 1 1.41-1.41L11 7.07V3a1 1 0 0 1 1-1z" />
        </svg>
      </div>`;
  }
  // Thẻ 1: Icon vuông hiển thị Logo Tập đoàn KDL (Logo đính kèm), nền trắng bo góc viền nhẹ sắc nét; fallback nền cam gradient với chữ viết tắt
  const dest = TecheraDB.getDestinationById(currentSelectedDestinationId);
  const chain = dest ? (dest.chainLabel || '') : '';
  let brandLogo = sup.logo || '';
  if (!brandLogo) {
    if (chain.includes('SUNWORLD')) brandLogo = 'assets/images/brands/sunworld.png';
    else if (chain.includes('VINWONDERS')) brandLogo = 'assets/images/brands/vinwonders.png';
    else if (chain.includes('NOVADREAMS')) brandLogo = 'assets/images/brands/novadreams.png';
    else if (chain.includes('DAMSEN')) brandLogo = 'assets/images/brands/damsen.png';
    else if (chain.includes('TTC')) brandLogo = 'assets/images/brands/ttc.png';
  }

  const shortCode = sup.shortLabel || 'SW';

  if (brandLogo) {
    return `
      <div class="w-12 h-12 rounded-xl bg-white border border-slate-200/90 flex items-center justify-center p-1.5 shrink-0 shadow-xs overflow-hidden">
        <img src="${brandLogo}" alt="${sup.name}" class="max-h-full max-w-full object-contain" onerror="this.onerror=null; this.parentElement.outerHTML='<div class=\\'w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 via-[#F25C22] to-rose-500 flex items-center justify-center shrink-0 shadow-xs font-black text-white text-base tracking-wider\\'>${shortCode}</div>';" />
      </div>`;
  }

  return `
    <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 via-[#F25C22] to-rose-500 flex items-center justify-center shrink-0 shadow-xs font-black text-white text-base tracking-wider">
      <span>${shortCode}</span>
    </div>`;
}

function renderBookingSuppliers() {
  const subtitleEl = document.getElementById('detailSupplierSubtitle');
  const sidebarBadge = document.getElementById('orderSidebarSupplierBadge');
  const suppliers = getSuppliersForDestination(currentSelectedDestinationId);
  if (!currentSelectedSupplierId || !suppliers.some(s => s.id === currentSelectedSupplierId)) {
    currentSelectedSupplierId = suppliers[0] ? suppliers[0].id : 'partner';
  }
  const activeSup = suppliers.find(s => s.id === currentSelectedSupplierId) || suppliers[0];
  if (subtitleEl && activeSup) {
    if (activeSup.id === 'techera') {
      subtitleEl.innerText = 'Kho nội bộ Techera';
    } else {
      subtitleEl.innerText = activeSup.name || 'Tập đoàn đối tác';
    }
  }
  if (sidebarBadge && activeSup) {
    const channelName = activeSup.id === 'techera' ? 'Kho nội bộ Techera' : 'API Đối tác';
    sidebarBadge.innerHTML = `<span class="truncate">NCC: ${activeSup.name} - ${channelName}</span>`;
  }
}

function openSupplierSelectModal() {
  const suppliers = getSuppliersForDestination(currentSelectedDestinationId);
  pendingModalSupplierId = currentSelectedSupplierId || (suppliers[0] ? suppliers[0].id : 'partner');
  renderSupplierModalList();
  const drawer = document.getElementById('modalSelectSupplier');
  const backdrop = document.getElementById('supplierDrawerBackdrop');
  const panel = document.getElementById('supplierDrawerPanel');
  if (!drawer) return;
  drawer.classList.remove('hidden');
  setTimeout(() => {
    if (backdrop) { backdrop.classList.remove('opacity-0'); backdrop.classList.add('opacity-100'); }
    if (panel) { panel.classList.remove('translate-y-full'); panel.classList.add('translate-y-0'); }
  }, 10);
}

function closeSupplierSelectModal() {
  const drawer = document.getElementById('modalSelectSupplier');
  const backdrop = document.getElementById('supplierDrawerBackdrop');
  const panel = document.getElementById('supplierDrawerPanel');
  if (!drawer) return;
  if (backdrop) { backdrop.classList.remove('opacity-100'); backdrop.classList.add('opacity-0'); }
  if (panel) { panel.classList.remove('translate-y-0'); panel.classList.add('translate-y-full'); }
  setTimeout(() => drawer.classList.add('hidden'), 300);
}

function selectPendingModalSupplier(supplierId) {
  pendingModalSupplierId = supplierId;
  renderSupplierModalList();
}

function renderSupplierModalList() {
  const container = document.getElementById('supplierModalList');
  if (!container) return;
  const suppliers = getSuppliersForDestination(currentSelectedDestinationId);
  container.innerHTML = suppliers.map(sup => {
    const isSel = (sup.id === pendingModalSupplierId);
    const isTechera = (sup.id === 'techera');
    const badgeText = isTechera
      ? 'Kho nội bộ Techera – Kho nội bộ, chiết khấu ưu đãi'
      : 'API Đối tác KDL – Xuất vé QR trực tiếp từ KDL';
    const badgeCls = isTechera
      ? 'bg-[#FFF7ED] text-[#F25C22] border border-orange-200/80'
      : 'border border-blue-200 bg-blue-50/70 text-blue-700';

    return `
      <div role="radio" aria-checked="${isSel ? 'true' : 'false'}" onclick="selectPendingModalSupplier('${sup.id}')"
           class="w-full text-left p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3.5 active:scale-[0.99] select-none ${isSel ? 'border-[#F25C22] bg-orange-50/50 shadow-xs ring-2 ring-orange-100' : 'border-slate-200 bg-white hover:border-orange-300'}">
        <div class="flex items-center gap-3.5 min-w-0">
          ${getSupplierLogoMarkup(sup)}
          <div class="min-w-0 space-y-1">
            <div class="text-sm font-black text-slate-900 truncate">${sup.name}</div>
            <div>
              <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${badgeCls}">
                ${badgeText}
              </span>
            </div>
          </div>
        </div>
        <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSel ? 'border-[#F25C22] bg-[#F25C22] text-white' : 'border-slate-300 bg-white'}">
          ${isSel ? '<i class="fa-solid fa-check text-[10px]"></i>' : ''}
        </div>
      </div>`;
  }).join('');
}

function confirmSupplierModalSelection() {
  const chosen = pendingModalSupplierId || currentSelectedSupplierId || 'partner';
  closeSupplierSelectModal();
  if (chosen !== currentSelectedSupplierId) {
    selectBookingSupplier(chosen);
  }
}

function selectBookingSupplier(supplierId) {
  if (currentSelectedSupplierId === supplierId) return;
  const prevServiceTab = activeServiceTab;
  const prevMarketTab = activeMarketTab;
  const prevOrderEntry = Object.values(selectedOrderTickets)[0] || null;
  const prevPkg = prevOrderEntry ? ticketPackages[prevOrderEntry.id] : getActiveFilteredPackage();
  const prevConfigState = prevOrderEntry || (prevPkg && !prevPkg.notFoundBySearch ? packageConfigStates[prevPkg.id] : null);
  const prevRestId = prevConfigState ? prevConfigState.selectedRestaurantId : null;
  const prevSlotId = prevConfigState ? prevConfigState.selectedTimeSlotId : null;
  const prevPkgTitle = (prevPkg && !prevPkg.notFoundBySearch) ? prevPkg.title : null;

  // Bảo toàn số lượng khách đã chọn
  if (prevOrderEntry && getPackageTotalQty(prevOrderEntry) > 0) {
    bookingSessionPax = {
      adult: prevOrderEntry.adultQty || 0,
      child: prevOrderEntry.childQty || 0,
      senior: prevOrderEntry.seniorQty || 0
    };
  }

  currentSelectedSupplierId = supplierId;
  selectedOrderTickets = {};
  packageConfigStates = {};
  refreshPackagesForCurrentSelection(false);

  const sup = getSuppliersForDestination(currentSelectedDestinationId).find(s => s.id === supplierId);
  const supName = sup ? sup.name : supplierId;

  // Bảo toàn gói dịch vụ và số lượng khách nếu có gói tương ứng
  const availGroups = getAvailableServiceGroups();
  if (prevServiceTab && availGroups.some(g => g.id === prevServiceTab)) {
    activeServiceTab = prevServiceTab;
    const availMarkets = getAvailableMarketsForGroup(activeServiceTab);
    if (prevMarketTab && availMarkets.some(m => m.id === prevMarketTab)) {
      activeMarketTab = prevMarketTab;
      const candidates = Object.values(ticketPackages).filter(p => p.serviceGroup === activeServiceTab && p.marketId === activeMarketTab);
      const matchedPkg = (prevPkgTitle && candidates.find(p => p.title === prevPkgTitle)) || candidates[0] || null;
      if (matchedPkg) {
        const newState = getOrInitPackageConfigState(matchedPkg);
        if (matchedPkg.hasDiningConfig) {
          const matchedRest = prevRestId ? (matchedPkg.diningRestaurants || []).find(r => r.id === prevRestId) : null;
          if (matchedRest && newState) {
            newState.selectedRestaurantId = matchedRest.id;
            const matchedSlot = prevSlotId ? (matchedRest.slots || []).find(s => s.id === prevSlotId) : null;
            if (matchedSlot && matchedSlot.isAvailable && matchedSlot.capacity > 0) {
              newState.selectedTimeSlotId = matchedSlot.id;
              activateConfiguredPackageInOrderDrawer(matchedPkg, false);
            }
          }
        } else {
          activateConfiguredPackageInOrderDrawer(matchedPkg, false);
        }
      }
    }
  }

  renderBookingSuppliers();
  renderPackageFilterTabs();
  renderDirectPackageConfigPanel();
  renderPaxQuantitySection();
  syncBookingFlowVisibility();
  renderOrderTicketsAccordions();
  recalculateTotals();

  if (isUnavailable) showToast('Ngày đã hết lịch', `Ngày ${formatDateObjDMY(selectedDate)} đã hết vé tại ${supName}, vui lòng chọn ngày khác.`, 'error');
  else showToast('Đã đổi Nhà cung cấp', `Đã chuyển sang ${supName}. Ngày sử dụng và số lượng khách được bảo toàn.`, 'success');
}

function refreshPackagesForCurrentSelection(resetSelection = false) {
  renderBookingSuppliers();
  if (!currentSelectedSupplierId) {
    ticketPackages = {};
    activeServiceTab = null;
    activeMarketTab = null;
    selectedOrderTickets = {};
    packageConfigStates = {};
    syncBookingFlowVisibility();
    renderOrderTicketsAccordions();
    recalculateTotals();
    return;
  }

  ticketPackages = buildActiveTicketPackages(currentSelectedDestinationId, currentSelectedSupplierId, selectedDate);
  if (resetSelection) {
    selectedOrderTickets = {};
    packageConfigStates = {};
    activeServiceTab = null;
    activeMarketTab = null;
  }

  const isUnavailable = isBookingDateUnavailable(selectedDate.day, selectedDate.month, selectedDate.year);
  const noBanner = document.getElementById('noPackagesAvailableBanner');
  const noBannerDesc = document.getElementById('noPackagesAvailableDesc');
  const toolbar = document.getElementById('packageFilterToolbar');
  const lockBanner = document.getElementById('orderSidebarLockBanner');

  if (noBanner) noBanner.classList.toggle('hidden', !isUnavailable);
  if (noBannerDesc) {
    const activeSup = getSuppliersForDestination(currentSelectedDestinationId).find(s => s.id === currentSelectedSupplierId);
    const supName = activeSup ? activeSup.name : 'Nhà cung cấp này';
    noBannerDesc.innerText = isUnavailable
      ? `Ngày ${formatDateObjDMY(selectedDate)} đã hết vé tại ${supName}, vui lòng chọn ngày khác.`
      : 'Vui lòng chọn ngày khác.';
  }
  if (toolbar) toolbar.classList.toggle('hidden', isUnavailable);
  if (lockBanner) lockBanner.classList.toggle('hidden', !isUnavailable);

  const policy = getDatePricePolicy(selectedDate.day, selectedDate.month, selectedDate.year);
  const summaryDatePolicy = document.getElementById('summaryDatePolicy');
  if (summaryDatePolicy) summaryDatePolicy.innerText = isUnavailable ? 'Hết lịch mở bán' : policy.label;

  renderTicketCatalogCards();
  updateCatalogCardsState();
  syncBookingFlowVisibility();
  renderOrderTicketsAccordions();
  recalculateTotals();
}

// ============================================================================
// CALENDAR & MONTH/YEAR PICKER
// ============================================================================

function renderCalendar() {
  const container = document.getElementById('calendarGrid');
  if (!container) return;
  container.innerHTML = '';

  const totalDays = new Date(viewDate.year, viewDate.month, 0).getDate();
  const firstDayDate = new Date(viewDate.year, viewDate.month - 1, 1);
  const firstDayIndex = (firstDayDate.getDay() + 6) % 7;

  const prevMonthLastDate = new Date(viewDate.year, viewDate.month - 1, 0).getDate();
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const prevDay = prevMonthLastDate - i;
    const cell = document.createElement('div');
    cell.className = 'flex items-center justify-center h-10 rounded-xl text-slate-300 select-none opacity-40 cursor-not-allowed';
    cell.innerHTML = `<span class="text-xs font-semibold">${prevDay}</span>`;
    container.appendChild(cell);
  }

  const systemToday = getSystemTodayParts();
  for (let d = 1; d <= totalDays; d++) {
    const dOfWeek = (firstDayIndex + d - 1) % 7;
    const isWeekend = (dOfWeek === 5 || dOfWeek === 6);
    const isPast = isBeforeSystemToday(d, viewDate.month, viewDate.year, systemToday);
    const isUnavailable = !isPast && isBookingDateUnavailable(d, viewDate.month, viewDate.year);
    const isSelected = (!isPast && selectedDate.year === viewDate.year && selectedDate.month === viewDate.month && selectedDate.day === d);

    const cell = document.createElement('div');
    if (isPast) {
      cell.className = 'flex items-center justify-center h-10 rounded-xl text-slate-300 select-none opacity-40 cursor-not-allowed';
      cell.innerHTML = `<span class="text-xs font-semibold">${d}</span>`;
    } else if (isSelected) {
      const selectedBg = isUnavailable ? 'bg-rose-500 shadow-rose-500/30' : 'bg-[#F25C22] shadow-orange-500/30';
      cell.className = `flex flex-col items-center justify-center h-10 rounded-xl ${selectedBg} text-white font-extrabold shadow-md cursor-pointer transform scale-105 transition-all text-sm`;
      cell.innerHTML = `<span>${d}</span>${isUnavailable ? '<span class="text-[8px] font-bold leading-none opacity-90">Hết</span>' : ''}`;
    } else if (isUnavailable) {
      cell.className = 'flex flex-col items-center justify-center h-10 rounded-xl bg-[#FFF1F2] border border-rose-200 text-rose-500 font-bold hover:bg-rose-100/80 cursor-pointer transition-all text-xs';
      cell.title = 'Ngày tạm hết lịch - Bấm để kiểm tra trạng thái';
      cell.innerHTML = `<span class="line-through leading-none">${d}</span><span class="text-[8px] font-bold text-rose-500 leading-none mt-0.5">Hết lịch</span>`;
      cell.onclick = () => selectDate(d, isWeekend);
    } else {
      const weekendClass = isWeekend ? 'bg-[#FEFCE8] border border-amber-200/80 text-[#F25C22] font-bold' : 'bg-white border border-slate-200/80 text-slate-900 font-semibold';
      cell.className = `flex items-center justify-center h-10 rounded-xl ${weekendClass} hover:border-brand-400 hover:bg-brand-50/60 cursor-pointer transition-all shadow-2xs text-xs`;
      cell.innerHTML = `<span>${d}</span>`;
      cell.onclick = () => selectDate(d, isWeekend);
    }
    container.appendChild(cell);
  }

  const totalCells = (firstDayIndex + totalDays > 35) ? 42 : 35;
  const remaining = totalCells - (firstDayIndex + totalDays);
  for (let j = 1; j <= remaining; j++) {
    const cell = document.createElement('div');
    cell.className = 'flex items-center justify-center h-10 rounded-xl text-slate-300 select-none opacity-40 cursor-not-allowed';
    cell.innerHTML = `<span class="text-xs font-semibold">${j}</span>`;
    container.appendChild(cell);
  }
  updateMonthNavigationUI();
}

function toggleCalendarAccordion(forceState) {
  isCalendarExpanded = (typeof forceState === 'boolean') ? forceState : !isCalendarExpanded;
  const container = document.getElementById('calendar_container');
  const summary = document.getElementById('selected_date_summary');
  const chevron = document.getElementById('chevronCalendarIcon');

  if (isCalendarExpanded) {
    if (container) {
      container.classList.remove('hidden', 'collapsed-box');
      container.classList.add('expanded-box');
    }
    if (summary) {
      summary.classList.add('hidden');
      summary.classList.remove('expanded-box');
      summary.classList.add('collapsed-box');
    }
    if (chevron) {
      chevron.classList.remove('fa-chevron-down', 'rotate-180');
      chevron.classList.add('fa-chevron-up');
    }
  } else {
    syncSelectedDateLabels();
    if (container) {
      container.classList.add('hidden');
      container.classList.remove('expanded-box');
      container.classList.add('collapsed-box');
    }
    if (summary) {
      summary.classList.remove('hidden', 'collapsed-box');
      summary.classList.add('expanded-box');
    }
    if (chevron) {
      chevron.classList.remove('fa-chevron-up');
      chevron.classList.add('fa-chevron-down', 'rotate-180');
    }
  }
}

function syncSelectedDateLabels() {
  const pad = n => (n < 10 ? '0' + n : '' + n);
  const dt = new Date(selectedDate.year, selectedDate.month - 1, selectedDate.day);
  const dow = dt.getDay();
  const isWeekend = (dow === 0 || dow === 6);
  const formattedDate = `${selectedDate.dayName}, ${pad(selectedDate.day)}/${pad(selectedDate.month)}/${selectedDate.year}`;

  const summary = document.getElementById('selected_date_summary');
  if (summary) {
    summary.innerHTML = `
      <div onclick="toggleCalendarSection()" class="rounded-xl bg-slate-100 border border-slate-200/90 px-3.5 py-2.5 flex items-center justify-between gap-3 cursor-pointer select-none hover:bg-slate-200/60 transition-colors shadow-2xs">
        <div class="text-xs sm:text-sm font-semibold text-[#0F172A] truncate">
          ${formattedDate}
        </div>
        <i class="fa-solid fa-chevron-down text-xs text-slate-400"></i>
      </div>`;
  }

  const expandedOpenHoursText = document.getElementById('expandedOpenHoursText');
  if (expandedOpenHoursText) expandedOpenHoursText.innerText = isWeekend ? '08:00 – 21:00' : '08:00 – 21:00';
  const summaryDateLabel = document.getElementById('summaryDateLabel');
  if (summaryDateLabel) summaryDateLabel.innerText = `Ngày dùng: ${pad(selectedDate.day)}/${pad(selectedDate.month)}/${selectedDate.year} (${isWeekend ? 'Cuối tuần' : 'Ngày thường'})`;
  return { formattedDate, isWeekend };
}

function selectDate(day, isWeekend) {
  const dayName = computeDayNameVi(day, viewDate.month, viewDate.year);
  selectedDate = { day, month: viewDate.month, year: viewDate.year, dayName };
  hasConfirmedDate = true;
  renderCalendar();
  const { formattedDate } = syncSelectedDateLabels();
  toggleCalendarAccordion(false);
  refreshPackagesForCurrentSelection(true);

  if (isBookingDateUnavailable(day, selectedDate.month, selectedDate.year)) {
    showToast('Không có gói dịch vụ khả dụng', 'Không có gói dịch vụ khả dụng cho ngày này, vui lòng chọn ngày khác!', 'error');
  } else {
    const policy = getDatePricePolicy(day, selectedDate.month, selectedDate.year);
    showToast('Cập nhật ngày tham quan', `Đã chọn: ${formattedDate} (${policy.label}). Bảng giá & tồn kho đã cập nhật.`);
  }
}

function setQuickDatePreset(preset) {
  const target = new Date();
  if (preset === 'tomorrow') target.setDate(target.getDate() + 1);
  else if (preset !== 'today') return;
  const targetDay = target.getDate();
  const targetMonth = target.getMonth() + 1;
  const targetYear = target.getFullYear();
  const dow = target.getDay();
  viewDate = { month: targetMonth, year: targetYear };
  pickerMonth = targetMonth;
  pickerYear = targetYear;
  updateMonthNavigationUI();
  selectDate(targetDay, dow === 0 || dow === 6);
}

function toggleMonthYearPicker() {
  const popover = document.getElementById('popover_month_year_picker');
  const chevron = document.getElementById('triggerMonthYearChevron');
  if (!popover) return;
  const isHidden = popover.classList.contains('hidden');
  if (isHidden) {
    pickerMonth = viewDate.month;
    pickerYear = viewDate.year;
    renderMonthGrid();
    popover.classList.remove('hidden');
    scrollSelectedWheelItemsIntoView();
    if (chevron) chevron.classList.add('rotate-180');
  } else {
    closeMonthYearPicker();
  }
}

function closeMonthYearPicker() {
  const popover = document.getElementById('popover_month_year_picker');
  const chevron = document.getElementById('triggerMonthYearChevron');
  if (popover && !popover.classList.contains('hidden')) popover.classList.add('hidden');
  if (chevron) chevron.classList.remove('rotate-180');
}

function renderMonthGrid() {
  const systemToday = getSystemTodayParts();
  const years = [systemToday.year, systemToday.year + 1, systemToday.year + 2];
  const monthWheelEl = document.getElementById('wheelMonthList');
  const yearWheelEl = document.getElementById('wheelYearList');

  if (monthWheelEl) {
    let mHtml = '';
    for (let m = 1; m <= 12; m++) {
      mHtml += `<button type="button" data-wheel-month="${m}" onclick="selectWheelMonth(${m}, event)" class="w-full py-2 px-3 rounded-lg text-xs text-center snap-center transition-all cursor-pointer">Tháng ${m}</button>`;
    }
    monthWheelEl.innerHTML = mHtml;
  }
  if (yearWheelEl) {
    yearWheelEl.innerHTML = years.map(y => `<button type="button" data-wheel-year="${y}" onclick="selectWheelYear(${y}, event)" class="w-full py-2.5 px-3 rounded-lg text-xs text-center snap-center transition-all cursor-pointer">Năm ${y}</button>`).join('');
  }
  updateWheelSelectionStyles();
}

function updateWheelSelectionStyles() {
  const monthWheelEl = document.getElementById('wheelMonthList');
  const yearWheelEl = document.getElementById('wheelYearList');
  const baseMonthCls = 'w-full py-2 px-3 rounded-lg text-xs text-center snap-center transition-all cursor-pointer ';
  const baseYearCls = 'w-full py-2.5 px-3 rounded-lg text-xs text-center snap-center transition-all cursor-pointer ';

  if (monthWheelEl) {
    monthWheelEl.querySelectorAll('[data-wheel-month]').forEach(btn => {
      const m = parseInt(btn.getAttribute('data-wheel-month'), 10);
      btn.className = baseMonthCls + (m === pickerMonth ? 'bg-brand-500 text-white font-black shadow-xs' : 'text-slate-700 font-bold hover:bg-orange-50 hover:text-brand-600');
    });
  }
  if (yearWheelEl) {
    yearWheelEl.querySelectorAll('[data-wheel-year]').forEach(btn => {
      const y = parseInt(btn.getAttribute('data-wheel-year'), 10);
      btn.className = baseYearCls + (y === pickerYear ? 'bg-slate-900 text-white font-black shadow-xs' : 'text-slate-700 font-bold hover:bg-orange-50 hover:text-brand-600');
    });
  }
}

function scrollSelectedWheelItemsIntoView() {
  const monthWheelEl = document.getElementById('wheelMonthList');
  const yearWheelEl = document.getElementById('wheelYearList');
  if (monthWheelEl) {
    const activeMonthBtn = monthWheelEl.querySelector(`[data-wheel-month="${pickerMonth}"]`);
    if (activeMonthBtn) activeMonthBtn.scrollIntoView({ block: 'center' });
  }
  if (yearWheelEl) {
    const activeYearBtn = yearWheelEl.querySelector(`[data-wheel-year="${pickerYear}"]`);
    if (activeYearBtn) activeYearBtn.scrollIntoView({ block: 'center' });
  }
}

function selectWheelYear(targetYear, ev) {
  if (ev && typeof ev.stopPropagation === 'function') ev.stopPropagation();
  const systemToday = getSystemTodayParts();
  if (targetYear < systemToday.year || targetYear > systemToday.year + 2) return;
  pickerYear = targetYear;
  updateWheelSelectionStyles();
}

function selectWheelMonth(selectedMonth, ev) {
  if (ev && typeof ev.stopPropagation === 'function') ev.stopPropagation();
  if (selectedMonth < 1 || selectedMonth > 12) return;
  pickerMonth = selectedMonth;
  updateWheelSelectionStyles();
}

function applyMonthYearPicker() {
  viewDate.year = pickerYear;
  viewDate.month = pickerMonth;
  updateMonthNavigationUI();
  renderCalendar();
  closeMonthYearPicker();
  showToast('Chuyển lịch đặt vé', `Đang xem lịch Tháng ${viewDate.month}/${viewDate.year}.`);
}

function updateMonthNavigationUI() {
  const systemToday = getSystemTodayParts();
  const minYear = systemToday.year;
  const maxYear = systemToday.year + 2;
  const triggerText = document.getElementById('triggerMonthYearText');
  if (triggerText) triggerText.innerText = `Tháng ${viewDate.month}/${viewDate.year}`;
  const btnPrev = document.getElementById('btn_prev_month');
  if (btnPrev) btnPrev.disabled = (viewDate.year < minYear) || (viewDate.year === minYear && viewDate.month <= systemToday.month);
  const btnNext = document.getElementById('btn_next_month');
  if (btnNext) btnNext.disabled = (viewDate.year >= maxYear && viewDate.month >= 12);
}

function navigateMonth(direction) {
  const systemToday = getSystemTodayParts();
  const maxYear = systemToday.year + 2;
  let newMonth = viewDate.month + direction;
  let newYear = viewDate.year;
  if (newMonth < 1) { newMonth = 12; newYear -= 1; }
  else if (newMonth > 12) { newMonth = 1; newYear += 1; }
  if (direction < 0 && isBeforeSystemMonth(newYear, newMonth, systemToday)) {
    showToast('Giới hạn thời gian', 'Không thể lùi về các tháng trong quá khứ.', 'error');
    return;
  }
  if (newYear > maxYear) {
    showToast('Giới hạn thời gian', `Hệ thống chỉ mở đặt vé trước tối đa 2 năm (đến hết ${maxYear}).`, 'error');
    return;
  }
  viewDate = { month: newMonth, year: newYear };
  pickerMonth = newMonth;
  pickerYear = newYear;
  updateMonthNavigationUI();
  renderCalendar();
}

// ============================================================================
// 4-TIER PACKAGE CONFIGURATOR & DINING
// ============================================================================

function getAvailableServiceGroups() {
  const pkgs = Object.values(ticketPackages);
  return SERVICE_GROUP_DEFINITIONS.filter(g => pkgs.some(p => p.serviceGroup === g.id));
}

function getAvailableMarketsForGroup(groupId) {
  const pkgs = Object.values(ticketPackages).filter(p => p.serviceGroup === groupId);
  return MARKET_REGION_DEFINITIONS.filter(m => pkgs.some(p => p.marketId === m.id));
}

function ensureValidTwoTierSelection(resetToDefault = false) {
  if (resetToDefault) {
    activeServiceTab = null;
    activeMarketTab = null;
    return;
  }
  const availGroups = getAvailableServiceGroups();
  if (activeServiceTab && !availGroups.some(g => g.id === activeServiceTab)) {
    activeServiceTab = null;
    activeMarketTab = null;
    return;
  }
  if (activeServiceTab) {
    const availMarkets = getAvailableMarketsForGroup(activeServiceTab);
    if (activeMarketTab && !availMarkets.some(m => m.id === activeMarketTab)) activeMarketTab = null;
  }
}

function renderPackageFilterTabs() {
  const primaryEl = document.getElementById('primaryServiceTabs');
  const secondaryEl = document.getElementById('secondaryMarketTabs');
  const availGroups = getAvailableServiceGroups();
  const availMarkets = activeServiceTab ? getAvailableMarketsForGroup(activeServiceTab) : [];
  const searchInput = document.getElementById('searchTicketInput');
  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';

  if (primaryEl) {
    primaryEl.innerHTML = availGroups.map(g => {
      const isActive = (g.id === activeServiceTab);
      const pkgsInGroup = Object.values(ticketPackages).filter(p => p.serviceGroup === g.id);
      const isMatched = !query || g.label.toLowerCase().includes(query) || pkgsInGroup.some(p => {
        const text = `${p.title} ${p.serviceGroupLabel || ''} ${p.marketLabel || ''} ${p.description || ''} ${(p.diningRestaurants || []).map(r => r.name).join(' ')}`.toLowerCase();
        return text.includes(query);
      });

      let stateCls = '';
      if (isActive) {
        stateCls = 'bg-[#F25C19] text-white border-[#F25C19] shadow-xs font-bold';
      } else if (query && isMatched) {
        stateCls = 'bg-slate-100 text-[#0F172A] border border-slate-300 font-bold';
      } else if (query && !isMatched) {
        stateCls = 'opacity-35 grayscale bg-slate-50 text-slate-400 border border-slate-200';
      } else {
        stateCls = 'bg-white text-[#0F172A] border border-[#E2E8F0] hover:border-slate-300 font-medium';
      }

      return `
        <button type="button" role="tab" aria-selected="${isActive ? 'true' : 'false'}" onclick="selectServiceGroupTab('${g.id}')"
                class="whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer inline-flex items-center ${stateCls}">
          <span>${g.label}</span>
        </button>`;
    }).join('');
  }

  if (secondaryEl) {
    secondaryEl.innerHTML = availMarkets.map(m => {
      const isActive = (m.id === activeMarketTab);
      const pkgsInMarket = Object.values(ticketPackages).filter(p => p.serviceGroup === activeServiceTab && p.marketId === m.id);
      const isMatched = !query || m.label.toLowerCase().includes(query) || pkgsInMarket.some(p => {
        const text = `${p.title} ${p.serviceGroupLabel || ''} ${p.marketLabel || ''} ${p.description || ''} ${(p.diningRestaurants || []).map(r => r.name).join(' ')}`.toLowerCase();
        return text.includes(query);
      });

      let stateCls = '';
      if (isActive) {
        stateCls = 'bg-[#F25C19] text-white border-[#F25C19] shadow-xs font-bold';
      } else if (query && isMatched) {
        stateCls = 'bg-slate-100 text-[#0F172A] border border-slate-300 font-bold';
      } else if (query && !isMatched) {
        stateCls = 'opacity-35 grayscale bg-white text-slate-400 border border-slate-200';
      } else {
        stateCls = 'bg-white text-[#0F172A] border border-[#E2E8F0] hover:border-slate-300 font-medium';
      }

      return `
        <button type="button" role="tab" aria-selected="${isActive ? 'true' : 'false'}" onclick="selectMarketRegionTab('${m.id}')"
                class="whitespace-nowrap px-3 py-1.5 rounded-full text-xs transition-all cursor-pointer inline-flex items-center ${stateCls}">
          <span>${m.label}</span>
        </button>`;
    }).join('');
  }
}

function handleRealtimeSearchInput(val) {
  const clearBtn = document.getElementById('btnSearchClear');
  if (clearBtn) {
    clearBtn.classList.toggle('hidden', !val || val.length === 0);
  }
  const query = (val || '').trim().toLowerCase();
  if (query) {
    const availGroups = getAvailableServiceGroups();
    const matchedGroup = availGroups.find(g => {
      if (g.label.toLowerCase().includes(query)) return true;
      const pkgs = Object.values(ticketPackages).filter(p => p.serviceGroup === g.id);
      return pkgs.some(p => {
        const text = `${p.title} ${p.serviceGroupLabel || ''} ${p.marketLabel || ''} ${p.description || ''} ${(p.diningRestaurants || []).map(r => r.name).join(' ')}`.toLowerCase();
        return text.includes(query);
      });
    });
    if (matchedGroup && matchedGroup.id !== activeServiceTab) {
      activeServiceTab = matchedGroup.id;
      const availMarkets = getAvailableMarketsForGroup(activeServiceTab);
      if (!activeMarketTab || !availMarkets.some(m => m.id === activeMarketTab)) {
        activeMarketTab = availMarkets[0] ? availMarkets[0].id : null;
      }
      packageConfigStates = {};
      selectedOrderTickets = {};
    }
  }
  renderPackageFilterTabs();
  renderDirectPackageConfigPanel();
  renderPaxQuantitySection();
  syncBookingFlowVisibility();
}

function clearRealtimeSearch() {
  const searchInput = document.getElementById('searchTicketInput');
  if (searchInput) searchInput.value = '';
  const clearBtn = document.getElementById('btnSearchClear');
  if (clearBtn) clearBtn.classList.add('hidden');
  renderPackageFilterTabs();
  renderDirectPackageConfigPanel();
  renderPaxQuantitySection();
  syncBookingFlowVisibility();
}

function getOrInitPackageConfigState(pkg) {
  if (!pkg) return null;
  if (selectedOrderTickets[pkg.id]) {
    packageConfigStates[pkg.id] = selectedOrderTickets[pkg.id];
    return selectedOrderTickets[pkg.id];
  }
  if (!packageConfigStates[pkg.id]) {
    packageConfigStates[pkg.id] = {
      id: pkg.id,
      isExpanded: true,
      selectedRestaurantId: null,
      selectedTimeSlotId: null,
      adultQty: 0,
      childQty: 0,
      seniorQty: 0,
      adultSellingPrice: pkg.adult ? pkg.adult.defaultSelling : 0,
      childSellingPrice: pkg.child ? pkg.child.defaultSelling : 0,
      seniorSellingPrice: pkg.senior ? pkg.senior.defaultSelling : (pkg.adult ? pkg.adult.defaultSelling : 0)
    };
  }
  return packageConfigStates[pkg.id];
}

function getActiveFilteredPackage() {
  if (!activeServiceTab || !activeMarketTab) return null;
  const searchEl = document.getElementById('searchTicketInput');
  const query = searchEl ? searchEl.value.toLowerCase().trim() : '';
  const candidates = Object.values(ticketPackages).filter(p => p.serviceGroup === activeServiceTab && p.marketId === activeMarketTab);
  if (candidates.length === 0) return null;
  const filtered = query ? candidates.filter(p => (`${p.title} ${p.serviceGroupLabel} ${p.marketLabel}`).toLowerCase().includes(query)) : candidates;
  if (filtered.length === 0) return { notFoundBySearch: true };
  return filtered.find(p => !!selectedOrderTickets[p.id]) || filtered[0];
}

function applyTwoTierFilterToCards() {
  renderDirectPackageConfigPanel();
  renderPaxQuantitySection();
  syncBookingFlowVisibility();
}

function selectServiceGroupTab(groupId) {
  if (activeServiceTab === groupId) return;
  activeServiceTab = groupId;
  activeMarketTab = null;
  packageConfigStates = {};
  renderPackageFilterTabs();
  renderDirectPackageConfigPanel();
  renderPaxQuantitySection();
  syncBookingFlowVisibility();
  renderOrderTicketsAccordions();
  recalculateTotals();
}

function activateConfiguredPackageInOrderDrawer(pkg, autoOpenMobile = true) {
  if (!pkg || pkg.notFoundBySearch) return;
  const state = getOrInitPackageConfigState(pkg);
  if (!state) return;

  if (getPackageTotalQty(state) === 0) {
    const allotment = getPackageEffectiveAllotment(pkg, state);
    const desiredAdult = (bookingSessionPax && bookingSessionPax.adult > 0) ? Math.max(2, bookingSessionPax.adult) : 2;
    const desiredChild = (bookingSessionPax && bookingSessionPax.child > 0) ? bookingSessionPax.child : 0;
    const desiredSenior = (bookingSessionPax && bookingSessionPax.senior > 0) ? bookingSessionPax.senior : 0;
    const totalDesired = desiredAdult + desiredChild + desiredSenior;
    if (totalDesired <= allotment) {
      state.adultQty = desiredAdult;
      state.childQty = desiredChild;
      state.seniorQty = desiredSenior;
    } else {
      state.adultQty = Math.min(2, allotment);
    }
  }
  if (bookingSessionDiscountRate !== null) {
    applyGlobalDiscountRateToOrderItem(pkg, state, bookingSessionDiscountRate);
  }

  // Thu gọn các gói vé trước đó, chỉ mở gói mới nhất
  Object.keys(selectedOrderTickets).forEach(k => {
    if (selectedOrderTickets[k] && k != pkg.id) {
      selectedOrderTickets[k].isExpanded = false;
    }
  });
  state.isExpanded = true;
  selectedOrderTickets[pkg.id] = state;

  renderOrderTicketsAccordions();
  recalculateTotals();
  if (autoOpenMobile && window.innerWidth < 1024) openMobilePaymentDetailDrawer();
}

function selectMarketRegionTab(marketId) {
  activeMarketTab = marketId;
  const resolved = getActiveFilteredPackage();
  if (resolved && !resolved.notFoundBySearch) packageConfigStates[resolved.id] = null;

  renderPackageFilterTabs();
  renderDirectPackageConfigPanel();
  renderPaxQuantitySection();
  syncBookingFlowVisibility();

  if (resolved && !resolved.notFoundBySearch && !resolved.hasDiningConfig) {
    activateConfiguredPackageInOrderDrawer(resolved, true);
  } else {
    renderOrderTicketsAccordions();
    recalculateTotals();
  }
}

function renderTicketCatalogCards() {
  const container = document.getElementById('ticketListContainer');
  if (!container) return;
  if (Object.keys(ticketPackages).length === 0) {
    activeServiceTab = null;
    activeMarketTab = null;
    renderPackageFilterTabs();
    container.innerHTML = '';
    return;
  }
  ensureValidTwoTierSelection(false);
  renderPackageFilterTabs();
  renderDirectPackageConfigPanel();
  renderPaxQuantitySection();
}

function getPackageDetailedInfoHtml(pkg, state) {
  if (!pkg) return '';
  const isCombo = pkg.category === 'combo' || (pkg.serviceGroup && pkg.serviceGroup.includes('combo'));
  const isBuffetOnly = pkg.serviceGroup === 'buffet-only';
  const rest = state ? getSelectedDiningRestaurant(pkg, state) : null;
  const restName = rest ? rest.name : (pkg.diningRestaurants && pkg.diningRestaurants[0] ? pkg.diningRestaurants[0].name : 'Nhà hàng trong gói');

  let includesList = [];
  if (isBuffetOnly) {
    includesList = [
      `01 suất Buffet ẩm thực trưa quốc tế tại ${restName}.`,
      'Thực đơn phong phú hơn 70 món Á - Âu, tráng miệng & nước uống theo tiêu chuẩn.',
      'Ưu tiên giữ bàn đặt trước theo khung giờ đã đăng ký.'
    ];
  } else if (isCombo) {
    includesList = [
      'Vé cáp treo khứ hồi 2 chiều theo lộ trình tiêu chuẩn đỉnh Bà Nà Hills.',
      `01 suất Buffet ẩm thực trưa quốc tế tại ${restName}.`,
      'Miễn phí tham quan Cầu Vàng, Làng Pháp, Vườn hoa Le Jardin D\'Amour, Hầm rượu Debay.',
      'Vui chơi không giới hạn tại Công viên giải trí Fantasy Park (hơn 105 trò chơi).'
    ];
  } else {
    includesList = [
      'Vé cáp treo khứ hồi 2 chiều theo lộ trình tiêu chuẩn đỉnh Bà Nà Hills.',
      'Miễn phí tham quan Cầu Vàng, Làng Pháp, Vườn hoa Le Jardin D\'Amour, Hầm rượu Debay.',
      'Vui chơi không giới hạn tại Công viên giải trí Fantasy Park (hơn 105 trò chơi).'
    ];
  }

  const isLocalMarket = pkg.marketId === 'local';

  return `
    <div class="space-y-3.5 text-xs leading-relaxed text-slate-600">
      <!-- 1. Dịch vụ bao gồm -->
      <div>
        <div class="font-black text-slate-900 uppercase tracking-wide text-[11px] flex items-center gap-1.5 mb-1.5 text-brand-600">
          <i class="fa-solid fa-circle-check text-xs text-[#F25C22]"></i>
          <span>1. Dịch vụ bao gồm</span>
        </div>
        <ul class="space-y-1 pl-4 list-disc marker:text-[#F25C22]">
          ${includesList.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>

      <!-- 2. Quy định độ tuổi / chiều cao -->
      <div class="pt-2.5 border-t border-slate-200/60">
        <div class="font-black text-slate-900 uppercase tracking-wide text-[11px] flex items-center gap-1.5 mb-1.5 text-blue-600">
          <i class="fa-solid fa-ruler-vertical text-xs text-blue-600"></i>
          <span>2. Quy định độ tuổi / chiều cao</span>
        </div>
        <ul class="space-y-1 pl-4 list-disc marker:text-blue-500">
          <li><strong>Người lớn:</strong> Áp dụng cho khách cao từ 1m4 trở lên (≥ 1m4).</li>
          <li><strong>Trẻ em:</strong> Áp dụng cho khách cao từ 1m đến dưới 1m4 (1m – 1m4).</li>
          <li><strong>Em bé:</strong> Khách cao dưới 1m (< 1m) được miễn phí toàn bộ dịch vụ vé &amp; ẩm thực.</li>
        </ul>
      </div>

      <!-- 3. Lưu ý sử dụng & Chính sách hoàn/đổi -->
      <div class="pt-2.5 border-t border-slate-200/60">
        <div class="font-black text-slate-900 uppercase tracking-wide text-[11px] flex items-center gap-1.5 mb-1.5 text-amber-600">
          <i class="fa-solid fa-triangle-exclamation text-xs text-amber-600"></i>
          <span>3. Lưu ý sử dụng &amp; Chính sách hoàn/đổi</span>
        </div>
        <ul class="space-y-1 pl-4 list-disc marker:text-amber-500">
          <li>Vé điện tử QR xuất tức thì, chỉ có giá trị sử dụng trong ngày tham quan đã chọn.</li>
          ${isLocalMarket ? '<li class="font-bold text-rose-600">Đối với vé Địa phương: Bắt buộc xuất trình CCCD/Hộ chiếu thường trú tại cửa kiểm soát.</li>' : ''}
          <li>Thời gian phục vụ Buffet trưa: 10:30 – 15:00 (vui lòng đến đúng khung giờ đã đăng ký).</li>
          <li>Chính sách hoàn/đổi: Vé đã xuất không hỗ trợ hoàn, hủy hoặc thay đổi ngày theo quy định đối tác KDL.</li>
        </ul>
      </div>
    </div>`;
}

function renderDirectPackageConfigPanel() {
  const container = document.getElementById('ticketListContainer');
  if (!container) return;
  const pkg = getActiveFilteredPackage();
  if (!pkg) { container.innerHTML = ''; return; }
  if (pkg.notFoundBySearch) {
    container.innerHTML = `
      <div class="py-6 px-4 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/70">
        <div class="text-sm font-bold text-slate-700">Không tìm thấy gói vé phù hợp với từ khóa</div>
        <button type="button" onclick="clearRealtimeSearch()" class="mt-2 text-xs font-bold text-brand-600 underline cursor-pointer">Xóa bộ lọc tìm kiếm</button>
      </div>`;
    return;
  }
  const state = getOrInitPackageConfigState(pkg);
  const diningHtml = pkg.hasDiningConfig ? buildDiningSelectorMarkup(pkg, state, 'card') : '';
  container.innerHTML = `
    <div class="ticket-card space-y-3" id="ticket-card-${pkg.id}">
      ${diningHtml ? `<div id="card-dining-panel-${pkg.id}">${diningHtml}</div>` : ''}

      <!-- Accordion Chi tiết gói dịch vụ -->
      <div class="pt-3 border-t border-slate-100">
        <button type="button" onclick="toggleTicketDetail(${pkg.id})" class="w-full flex items-center justify-between text-xs font-bold text-slate-700 hover:text-brand-600 cursor-pointer select-none py-1 transition-colors">
          <span class="flex items-center gap-1.5">
            <span class="text-slate-400">•</span>
            <span class="font-extrabold text-slate-800 hover:text-brand-600">Xem chi tiết gói dịch vụ</span>
          </span>
          <i id="chevronDetail-${pkg.id}" class="fa-solid fa-chevron-down text-xs text-slate-400 transition-transform duration-200"></i>
        </button>
        <div id="ticketDetailContent-${pkg.id}" class="collapse-transition collapsed-box mt-2.5 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80">
          ${getPackageDetailedInfoHtml(pkg, state)}
        </div>
      </div>
    </div>`;
}

function renderPaxQuantitySection() {
  const container = document.getElementById('paxQuantityListContainer');
  const summaryEl = document.getElementById('paxSectionConfigSummary');
  if (!container) return;
  const pkg = getActiveFilteredPackage();
  const state = pkg ? getOrInitPackageConfigState(pkg) : null;
  if (!pkg || !state || !isPackagePaxEnabled(pkg, state)) {
    container.innerHTML = '';
    if (summaryEl) summaryEl.innerText = '';
    return;
  }
  if (summaryEl) {
    const rest = getSelectedDiningRestaurant(pkg, state);
    const slot = getSelectedDiningSlot(pkg, state);
    summaryEl.innerText = [pkg.serviceGroupLabel, pkg.marketLabel, rest ? rest.name : '', slot ? slot.timeRange : ''].filter(Boolean).join(' • ');
  }
  const allotmentLimit = getPackageEffectiveAllotment(pkg, state);
  container.innerHTML = TICKET_TIER_KEYS.map(t => {
    const cfg = getEffectivePackageTierConfig(pkg, state, t);
    if (!cfg) return '';
    const qty = getTierQty(state, t);
    return `
      <div class="flex items-center justify-between gap-3 bg-slate-50/70 rounded-xl border border-slate-200/80 px-3.5 py-3">
        <div class="min-w-0">
          <div class="text-xs font-extrabold text-slate-900 truncate">${cfg.label}</div>
          <div class="text-[10.5px] text-slate-400 truncate">${cfg.condition || ''}</div>
          <div class="flex items-baseline gap-1.5 mt-0.5">
            <span class="text-xs sm:text-sm font-black text-brand-500">${formatMoney(cfg.netPrice)} đ</span>
            <span class="text-[10.5px] text-slate-400 line-through">${formatMoney(cfg.listedPrice)} đ</span>
          </div>
        </div>
        <div class="flex items-center gap-1.5 shrink-0">
          <button type="button" onclick="updateDirectPackageQty(${pkg.id}, '${t}', -1)" ${qty <= 0 ? 'disabled' : ''} class="w-7 h-7 rounded-lg border border-[#F15A24] bg-white text-slate-700 hover:bg-orange-50 font-bold flex items-center justify-center disabled:opacity-30 disabled:border-slate-200 disabled:text-slate-300 disabled:cursor-not-allowed transition-all text-xs cursor-pointer"><i class="fa-solid fa-minus text-[10px]"></i></button>
          <input type="number" min="0" max="${allotmentLimit}" value="${qty}" onchange="handleDirectManualQty(${pkg.id}, '${t}', this.value)" class="w-9 text-center font-extrabold text-xs text-slate-900 bg-transparent focus:outline-none">
          <button type="button" onclick="updateDirectPackageQty(${pkg.id}, '${t}', 1)" class="w-7 h-7 rounded-lg border border-[#F15A24] bg-[#F15A24] hover:bg-[#d84814] text-white font-bold flex items-center justify-center active:scale-95 transition-all text-xs cursor-pointer"><i class="fa-solid fa-plus text-[10px]"></i></button>
        </div>
      </div>`;
  }).join('');
}

function toggleTicketDetail(packageId) {
  const content = document.getElementById(`ticketDetailContent-${packageId}`);
  const chevron = document.getElementById(`chevronDetail-${packageId}`);
  if (!content) return;
  const isCollapsed = content.classList.contains('collapsed-box');
  if (isCollapsed) {
    content.classList.remove('collapsed-box');
    content.classList.add('expanded-box');
    if (chevron) {
      chevron.classList.remove('fa-chevron-down');
      chevron.classList.add('fa-chevron-up');
    }
  } else {
    content.classList.remove('expanded-box');
    content.classList.add('collapsed-box');
    if (chevron) {
      chevron.classList.remove('fa-chevron-up');
      chevron.classList.add('fa-chevron-down');
    }
  }
}

function updateCatalogCardsState() {
  renderDirectPackageConfigPanel();
  renderPaxQuantitySection();
}

function syncDiningCardPanels() {
  renderDirectPackageConfigPanel();
  renderPaxQuantitySection();
  syncBookingFlowVisibility();
}

function selectPackageRestaurant(pkgId, restaurantId) {
  const pkg = ticketPackages[pkgId];
  if (!pkg || !pkg.hasDiningConfig) return;
  const orderItem = getOrInitPackageConfigState(pkg);
  if (!orderItem) return;
  orderItem.selectedRestaurantId = restaurantId;
  orderItem.selectedTimeSlotId = null;
  orderItem.adultQty = 0;
  orderItem.childQty = 0;
  orderItem.seniorQty = 0;
  delete selectedOrderTickets[pkgId];
  syncDiningCardPanels();
  renderOrderTicketsAccordions();
  recalculateTotals();
}

function selectPackageTimeSlot(pkgId, slotId) {
  const pkg = ticketPackages[pkgId];
  if (!pkg || !pkg.hasDiningConfig) return;
  const orderItem = getOrInitPackageConfigState(pkg);
  if (!orderItem) return;
  const rest = getSelectedDiningRestaurant(pkg, orderItem);
  if (!rest) { showToast('Chưa chọn Nhà hàng', 'Vui lòng chọn Nhà hàng phục vụ trước.', 'error'); return; }
  const validSlot = (rest.slots || []).find(s => s.id === slotId);
  if (!validSlot || validSlot.isSoldOut || validSlot.capacity <= 0) {
    showToast('Khung giờ đã hết chỗ', 'Khung giờ này hiện đã hết chỗ, vui lòng chọn khung giờ khác.', 'error');
    return;
  }
  orderItem.selectedTimeSlotId = slotId;
  TICKET_TIER_KEYS.forEach(t => {
    const effCfg = getEffectivePackageTierConfig(pkg, orderItem, t);
    if (effCfg) orderItem[getTierPriceKey(t)] = effCfg.defaultSelling;
  });
  if (getPackageTotalQty(orderItem) > validSlot.capacity) {
    orderItem.adultQty = 0; orderItem.childQty = 0; orderItem.seniorQty = 0;
    delete selectedOrderTickets[pkgId];
  }
  syncDiningCardPanels();
  activateConfiguredPackageInOrderDrawer(pkg, true);
}

function buildDiningSelectorMarkup(pkg, orderItem, scopePrefix = 'card') {
  if (!pkg || !pkg.hasDiningConfig || !orderItem) return '';
  const searchInput = document.getElementById('searchTicketInput');
  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
  const selectedRest = getSelectedDiningRestaurant(pkg, orderItem);

  const restaurantsHtml = (pkg.diningRestaurants || []).map(r => {
    const isActive = r.id === orderItem.selectedRestaurantId;
    const isMatched = !query || r.name.toLowerCase().includes(query);
    let restCls = '';
    if (isActive) {
      restCls = 'bg-[#F25C19] text-white border-[#F25C19] shadow-xs font-bold';
    } else if (query && isMatched) {
      restCls = 'bg-slate-100 text-[#0F172A] border border-slate-300 font-bold';
    } else if (query && !isMatched) {
      restCls = 'opacity-35 grayscale bg-white text-slate-400 border border-slate-200';
    } else {
      restCls = 'bg-white text-[#0F172A] border border-[#E2E8F0] hover:border-slate-300 font-medium';
    }

    return `
      <button type="button" onclick="event.stopPropagation(); selectPackageRestaurant(${pkg.id}, '${r.id}')"
              class="px-3.5 py-1.5 rounded-full text-xs border transition-all cursor-pointer inline-flex items-center active:scale-95 ${restCls}">
        <span>${r.name}</span>
      </button>`;
  }).join('');

  const slotsHtml = selectedRest
    ? (selectedRest.slots || []).map(s => {
        const isSlotActive = s.id === orderItem.selectedTimeSlotId;
        const isSoldOut = !s.isAvailable || s.capacity <= 0;
        let slotCls = '';
        if (isSoldOut) {
          slotCls = 'bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed opacity-50 font-medium';
        } else if (isSlotActive) {
          slotCls = 'bg-[#0F172A] text-white border-[#0F172A] shadow-xs cursor-pointer font-bold';
        } else {
          slotCls = 'bg-white text-[#0F172A] border border-[#E2E8F0] hover:border-slate-300 cursor-pointer font-medium';
        }
        return `
          <button type="button" ${isSoldOut ? 'disabled' : ''} onclick="event.stopPropagation(); selectPackageTimeSlot(${pkg.id}, '${s.id}')"
                  class="px-3.5 py-1.5 rounded-full text-xs border transition-all inline-flex items-center active:scale-95 ${slotCls}">
            <span class="${isSoldOut ? 'line-through' : ''}">${s.timeRange}</span>
            ${isSoldOut ? '<span class="text-[9px] font-normal text-rose-500 no-underline ml-1">(Hết)</span>' : ''}
          </button>`;
      }).join('')
    : '';

  return `
    <div class="space-y-3" id="${scopePrefix}-dining-config-${pkg.id}">
      <!-- NHÀ HÀNG -->
      <div class="space-y-2 pt-3 border-t border-slate-100">
        <div class="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
          NHÀ HÀNG
        </div>
        <div class="flex flex-wrap gap-2">${restaurantsHtml}</div>
      </div>

      <!-- KHUNG GIỜ -->
      ${selectedRest ? `
        <div class="space-y-2 pt-3 border-t border-slate-100 animate-fadeIn">
          <div class="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
            KHUNG GIỜ
          </div>
          <div class="flex flex-wrap gap-2">${slotsHtml}</div>
        </div>
      ` : ''}
    </div>`;
}

function applyDirectPackageTierQtyChange(pkgId, type, targetQty) {
  const pkg = ticketPackages[pkgId];
  if (!pkg || !pkg[type]) return false;
  const state = getOrInitPackageConfigState(pkg);
  if (!state) return false;
  if (!isPackagePaxEnabled(pkg, state)) {
    showToast('Chưa chọn đủ thông tin', 'Vui lòng chọn Nhà hàng và Khung giờ trước khi chọn số lượng.', 'error');
    return false;
  }
  let num = parseInt(targetQty, 10);
  if (isNaN(num) || num < 0) num = 0;
  const stockLimit = getPackageEffectiveAllotment(pkg, state);
  const otherQty = TICKET_TIER_KEYS.reduce((sum, t) => t === type ? sum : sum + getTierQty(state, t), 0);
  if (otherQty + num > stockLimit) {
    showToast('Vượt hạn mức chỗ', `Số lượng vượt quá ${stockLimit} chỗ khả dụng.`, 'error');
    return false;
  }
  if (num > 50) num = 50;
  state[getTierQtyKey(type)] = num;
  if (getPackageTotalQty(state) > 0) selectedOrderTickets[pkgId] = state;
  else delete selectedOrderTickets[pkgId];
  syncDiningCardPanels();
  renderOrderTicketsAccordions();
  recalculateTotals();
  return true;
}

function updateDirectPackageQty(pkgId, type, delta) {
  const pkg = ticketPackages[pkgId];
  if (!pkg) return;
  const state = getOrInitPackageConfigState(pkg);
  applyDirectPackageTierQtyChange(pkgId, type, getTierQty(state, type) + delta);
}

function handleDirectManualQty(pkgId, type, rawVal) {
  const num = parseInt(rawVal, 10);
  applyDirectPackageTierQtyChange(pkgId, type, isNaN(num) ? 0 : num);
  syncDiningCardPanels();
}

// ============================================================================
// ACCORDION, INLINE DINING SWITCHER & DISCOUNT SLIDER
// ============================================================================

let drawerDiningSwitcherOpen = {};

function toggleDrawerDiningSwitcher(pkgId) {
  drawerDiningSwitcherOpen[pkgId] = !drawerDiningSwitcherOpen[pkgId];
  renderOrderTicketsAccordions();
}
window.toggleDrawerDiningSwitcher = toggleDrawerDiningSwitcher;

function buildInlineDrawerDiningSwitcher(pkg, orderItem) {
  if (!pkg || !orderItem) return '';
  const selectedRest = getSelectedDiningRestaurant(pkg, orderItem);
  const selectedSlot = getSelectedDiningSlot(pkg, orderItem);
  const isOpen = !!drawerDiningSwitcherOpen[pkg.id];

  const summaryParts = [
    pkg.serviceGroupLabel || pkg.title,
    pkg.marketLabel,
    selectedRest ? selectedRest.name : '',
    selectedSlot ? selectedSlot.timeRange : ''
  ].filter(Boolean);
  const summaryText = summaryParts.length > 0 ? summaryParts.join(' • ') : 'Chưa chọn đủ thông tin';

  if (!pkg.hasDiningConfig) {
    return `
      <div class="p-2.5 rounded-xl bg-slate-50 border border-[#E2E8F0] text-xs">
        <div class="min-w-0 font-medium text-[#0F172A] truncate">
          <span>${summaryText}</span>
        </div>
      </div>`;
  }

  const restPills = (pkg.diningRestaurants || []).map(r => {
    const isActive = r.id === orderItem.selectedRestaurantId;
    return `
      <button type="button" onclick="event.stopPropagation(); switchDrawerPackageRestaurant(${pkg.id}, '${r.id}')"
        class="px-3 py-1.5 rounded-full text-xs transition-all cursor-pointer inline-flex items-center active:scale-95 ${isActive ? 'bg-[#F25C19] text-white border-[#F25C19] shadow-xs font-bold' : 'bg-white text-[#0F172A] border border-[#E2E8F0] hover:border-slate-300 font-medium'}">
        <span>${r.name}</span>
      </button>`;
  }).join('');

  const slotPills = selectedRest ? (selectedRest.slots || []).map(s => {
    const isSlotActive = s.id === orderItem.selectedTimeSlotId;
    const isSoldOut = !s.isAvailable || s.capacity <= 0;
    let slotCls = '';
    if (isSoldOut) {
      slotCls = 'bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed opacity-50 font-medium';
    } else if (isSlotActive) {
      slotCls = 'bg-[#0F172A] text-white border-[#0F172A] shadow-xs font-bold cursor-pointer';
    } else {
      slotCls = 'bg-white text-[#0F172A] border border-[#E2E8F0] hover:border-slate-300 cursor-pointer font-medium';
    }
    return `
      <button type="button" ${isSoldOut ? 'disabled' : ''} onclick="event.stopPropagation(); switchDrawerPackageSlot(${pkg.id}, '${s.id}')"
        class="px-3 py-1.5 rounded-full text-xs border transition-all inline-flex items-center active:scale-95 ${slotCls}">
        <span class="${isSoldOut ? 'line-through' : ''}">${s.timeRange}</span>
        ${isSoldOut ? '<span class="text-[9px] text-rose-500 font-normal no-underline ml-1">(Hết)</span>' : ''}
      </button>`;
  }).join('') : '';

  return `
    <div class="space-y-2">
      <div class="p-2.5 rounded-xl bg-slate-50 border border-[#E2E8F0] flex items-center justify-between gap-2 text-xs">
        <div class="min-w-0 font-medium text-[#0F172A] truncate">
          <span>${summaryText}</span>
        </div>
        <button type="button" onclick="event.stopPropagation(); toggleDrawerDiningSwitcher(${pkg.id})" class="px-2.5 py-1 rounded-lg text-xs font-bold text-[#F25C19] border border-orange-200 bg-white hover:bg-orange-50 transition-colors shrink-0 cursor-pointer">
          ${isOpen ? 'Xong' : 'Đổi'}
        </button>
      </div>
      ${isOpen ? `
        <div class="p-3 rounded-xl bg-slate-50/70 border border-[#E2E8F0] space-y-2.5 animate-fadeIn">
          <div>
            <div class="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Nhà hàng</div>
            <div class="flex flex-wrap gap-1.5">${restPills}</div>
          </div>
          <div>
            <div class="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Khung giờ</div>
            <div class="flex flex-wrap gap-1.5">${slotPills}</div>
          </div>
        </div>
      ` : ''}
    </div>`;
}

function switchDrawerPackageRestaurant(pkgId, restaurantId) {
  const pkg = ticketPackages[pkgId];
  const orderItem = selectedOrderTickets[pkgId] || packageConfigStates[pkgId];
  if (!pkg || !orderItem) return;
  orderItem.selectedRestaurantId = restaurantId;
  const rest = getSelectedDiningRestaurant(pkg, orderItem);
  const availableSlot = rest && (rest.slots || []).find(s => s.isAvailable && s.capacity > 0);
  if (availableSlot) {
    orderItem.selectedTimeSlotId = availableSlot.id;
  } else {
    orderItem.selectedTimeSlotId = null;
  }
  TICKET_TIER_KEYS.forEach(t => {
    const effCfg = getEffectivePackageTierConfig(pkg, orderItem, t);
    if (effCfg) orderItem[getTierPriceKey(t)] = effCfg.defaultSelling;
  });
  if (bookingSessionDiscountRate !== null) {
    applyGlobalDiscountRateToOrderItem(pkg, orderItem, bookingSessionDiscountRate);
  }
  syncDiningCardPanels();
  renderOrderTicketsAccordions();
  recalculateTotals();
}

function switchDrawerPackageSlot(pkgId, slotId) {
  const pkg = ticketPackages[pkgId];
  const orderItem = selectedOrderTickets[pkgId] || packageConfigStates[pkgId];
  if (!pkg || !orderItem) return;
  const rest = getSelectedDiningRestaurant(pkg, orderItem);
  if (!rest) return;
  const slot = (rest.slots || []).find(s => s.id === slotId);
  if (!slot || slot.isSoldOut || slot.capacity <= 0) {
    showToast('Khung giờ đã hết chỗ', 'Vui lòng chọn khung giờ khác còn chỗ.', 'error');
    return;
  }
  orderItem.selectedTimeSlotId = slotId;
  TICKET_TIER_KEYS.forEach(t => {
    const effCfg = getEffectivePackageTierConfig(pkg, orderItem, t);
    if (effCfg) orderItem[getTierPriceKey(t)] = effCfg.defaultSelling;
  });
  if (bookingSessionDiscountRate !== null) {
    applyGlobalDiscountRateToOrderItem(pkg, orderItem, bookingSessionDiscountRate);
  }
  syncDiningCardPanels();
  renderOrderTicketsAccordions();
  recalculateTotals();
}

function buildOrderAccordionsMarkup(scopePrefix = 'desk') {
  const keys = Object.keys(selectedOrderTickets);
  if (keys.length === 0) {
    return `<div class="py-8 px-4 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white"><div class="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2 text-sm"><i class="fa-solid fa-ticket"></i></div><div class="text-xs font-bold text-slate-700">Chưa có gói vé nào được chọn</div><div class="text-[11px] text-slate-400 mt-0.5">Vui lòng chọn loại vé và khung giờ ở danh sách để xem chi tiết</div></div>`;
  }
  let html = '';
  keys.forEach(pkgIdStr => {
    const pkgId = parseInt(pkgIdStr, 10);
    const pkg = ticketPackages[pkgId];
    const orderItem = selectedOrderTickets[pkgId];
    if (!pkg || !orderItem) return;
    const totalGroupQty = getPackageTotalQty(orderItem);
    const stockLimit = getPackageEffectiveAllotment(pkg, orderItem);
    const paxEnabled = isPackagePaxEnabled(pkg, orderItem);
    const selectedRest = getSelectedDiningRestaurant(pkg, orderItem);
    const selectedSlot = getSelectedDiningSlot(pkg, orderItem);
    const inlineDiningHtml = buildInlineDrawerDiningSwitcher(pkg, orderItem);

    const tiersHtml = TICKET_TIER_KEYS.map(t => {
      const effCfg = getEffectivePackageTierConfig(pkg, orderItem, t);
      if (!effCfg) return '';
      return renderSubCategoryItem(pkgId, t, effCfg, getTierQty(orderItem, t), getTierPrice(orderItem, pkg, t), scopePrefix, paxEnabled, stockLimit);
    }).join('');

    html += `
      <div class="rounded-2xl border border-[#E2E8F0] bg-white shadow-2xs overflow-hidden transition-all duration-200" id="${scopePrefix}-accordion-pkg-${pkgId}">
        <div class="bg-white p-3 sm:p-3.5 flex items-center justify-between gap-2.5 cursor-pointer select-none hover:bg-slate-50/60 transition-colors" onclick="toggleOrderTicketAccordion(${pkgId})">
          <div class="flex items-center gap-2 min-w-0 flex-1">
            <button type="button" onclick="event.stopPropagation(); removeTicketFromOrder(${pkgId})" title="Xóa loại vé khỏi đơn" class="w-6 h-6 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center text-xs transition-colors shrink-0 cursor-pointer"><i class="fa-solid fa-xmark text-xs"></i></button>
            <div class="min-w-0 flex-1">
              <span class="font-bold text-xs text-[#0F172A] uppercase tracking-tight truncate block" title="${pkg.title}">${pkg.title}</span>
              ${pkg.hasDiningConfig ? `<span class="text-[10px] text-[#64748B] font-normal block truncate mt-0.5">${selectedSlot ? `${selectedRest ? selectedRest.name : ''} • ${selectedSlot.timeRange}` : 'Chưa chọn Nhà hàng & Khung giờ'}</span>` : ''}
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-[#0F172A] border border-[#E2E8F0]">${totalGroupQty} vé</span>
            <button type="button" class="w-6 h-6 rounded-lg text-slate-400 hover:text-slate-700 flex items-center justify-center text-xs"><i class="fa-solid ${orderItem.isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'} text-[11px]"></i></button>
          </div>
        </div>
        ${orderItem.isExpanded ? `
          <div class="p-3 sm:p-4 bg-white space-y-3 border-t border-[#E2E8F0]">
            ${inlineDiningHtml}
            ${!paxEnabled ? `<div class="text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">Chọn Nhà hàng và Khung giờ để xem giá và chọn số lượng.</div>` : tiersHtml}
          </div>` : ''}
      </div>`;
  });
  return html;
}

function calculateDiscountedTierPrice(listedPrice, netPrice, discountPct) {
  const listed = Number(listedPrice) || 0;
  const net = Number(netPrice) || 0;
  const margin = listed - net;
  const pct = Math.max(0, Math.round(Number(discountPct) || 0));
  if (pct === 0 || listed <= 0 || margin <= 0) return { sellingPrice: listed, discountPerTicket: 0 };
  if (pct >= 100) return { sellingPrice: net, discountPerTicket: Math.max(0, listed - net) };
  const rawDiscount = margin * (pct / 100);
  const roundedDiscount = Math.round(rawDiscount / 1000) * 1000;
  if (roundedDiscount <= 0) return { sellingPrice: listed, discountPerTicket: 0 };
  const sellingPrice = Math.max(net, listed - roundedDiscount);
  return { sellingPrice, discountPerTicket: listed - sellingPrice };
}

function applyGlobalDiscountRateToOrderItem(pkg, orderItem, discountPct) {
  if (!pkg || !orderItem || discountPct === null || discountPct === undefined) return;
  TICKET_TIER_KEYS.forEach(t => {
    const cfg = getEffectivePackageTierConfig(pkg, orderItem, t);
    if (!cfg) return;
    const calc = calculateDiscountedTierPrice(cfg.listedPrice, cfg.netPrice, discountPct);
    orderItem[getTierPriceKey(t)] = calc.sellingPrice;
  });
}

function renderGlobalDiscountSelector() {
  const curPct = Math.max(0, Math.min(100, Math.round(Number(bookingSessionDiscountRate) || 0)));
  const isListedActive = (curPct === 0);
  const buildMarkup = (prefix) => `
    <div class="space-y-1.5 pb-2 border-b border-slate-100">
      <div class="text-[10.5px] font-black text-slate-800 uppercase tracking-wider flex items-center justify-between gap-2">
        <span>Chọn mức chiết khấu khách hàng</span>
        <span class="text-[10px] text-slate-400 font-semibold normal-case">(Áp dụng tất cả đối tượng)</span>
      </div>
      <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 shadow-2xs">
        <div class="flex items-center gap-2.5">
          <button type="button" id="${prefix}-btnDiscountListed" onclick="resetDiscountToListedPrice()" class="px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold border transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center ${isListedActive ? 'bg-[#F25C22] text-white border-[#F25C22] shadow-sm shadow-orange-500/25' : 'bg-white text-slate-700 border-slate-200 hover:border-orange-300 hover:text-[#F25C22]'}">
            <span>Áp Niêm Yết</span>
          </button>
          <div class="flex-1 flex items-center min-w-0">
            <input type="range" id="${prefix}-globalDiscountSlider" min="0" max="100" step="1" value="${curPct}" oninput="handleGlobalDiscountChange(this.value, 'slider')" onchange="handleGlobalDiscountChange(this.value, 'slider')" style="accent-color: #F25C22; cursor: pointer;" class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer">
          </div>
          <div class="relative flex items-center shrink-0 w-16">
            <input type="number" id="${prefix}-globalDiscountInput" min="0" max="100" step="1" value="${curPct}" oninput="handleGlobalDiscountChange(this.value, 'input')" onchange="handleGlobalDiscountChange(this.value, 'input')" class="w-full pl-2 pr-5 py-1 text-center text-xs font-black bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#F25C22]">
            <span class="absolute right-2 text-slate-400 text-xs font-bold pointer-events-none">%</span>
          </div>
        </div>
      </div>
    </div>`;

  ['mob', 'desk'].forEach(prefix => {
    const wrap = document.getElementById(prefix === 'mob' ? 'mobileDiscountSelectorWrap' : 'deskDiscountSelectorWrap');
    if (!wrap) return;
    if (prefix === 'desk') {
      wrap.classList.remove('hidden');
    }
    const slider = document.getElementById(prefix + '-globalDiscountSlider');
    const input = document.getElementById(prefix + '-globalDiscountInput');
    const btn = document.getElementById(prefix + '-btnDiscountListed');
    if (!slider || !input || !btn) {
      wrap.innerHTML = buildMarkup(prefix);
    } else {
      if (document.activeElement !== slider) slider.value = curPct;
      if (document.activeElement !== input) input.value = curPct;
      btn.className = `px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center ${isListedActive ? 'bg-[#F25C19] text-white border-[#F25C19] shadow-xs' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'}`;
      btn.innerHTML = `<span>Áp Niêm Yết</span>`;
    }
  });
}

function handleGlobalDiscountChange(rawVal, source = 'slider') {
  let num = parseInt(rawVal, 10);
  if (isNaN(num) || num < 0) num = 0;
  if (num > 100) num = 100;
  bookingSessionDiscountRate = num;
  const isListed = (num === 0);

  ['mob', 'desk'].forEach(prefix => {
    const slider = document.getElementById(prefix + '-globalDiscountSlider');
    const input = document.getElementById(prefix + '-globalDiscountInput');
    const btn = document.getElementById(prefix + '-btnDiscountListed');
    if (slider && (source !== 'slider' || document.activeElement !== slider)) slider.value = num;
    if (input && (source !== 'input' || document.activeElement !== input)) input.value = num;
    if (btn) {
      btn.className = `px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center ${isListed ? 'bg-[#F25C19] text-white border-[#F25C19] shadow-xs' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'}`;
      btn.innerHTML = `<span>Áp Niêm Yết</span>`;
    }
  });

  Object.keys(selectedOrderTickets).forEach(k => {
    const pkg = ticketPackages[k];
    const orderItem = selectedOrderTickets[k];
    if (pkg && orderItem) applyGlobalDiscountRateToOrderItem(pkg, orderItem, num);
  });
  renderOrderTicketsAccordions();
  recalculateTotals();
}

function resetDiscountToListedPrice() {
  handleGlobalDiscountChange(0, 'reset');
}

function renderOrderTicketsAccordions() {
  renderGlobalDiscountSelector();
  [['orderTicketsAccordionContainer', 'desk'], ['mobileDrawerTicketsContainer', 'mob']].forEach(([cid, scope]) => {
    const el = document.getElementById(cid);
    if (el) el.innerHTML = buildOrderAccordionsMarkup(scope);
  });
}

function renderDiscountBadge(discount) {
  if (discount > 0) {
    return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200/80 text-[10.5px] font-bold text-emerald-700"><i class="fa-solid fa-tag text-[9px]"></i><span>Giảm: ${formatMoney(discount)} đ/vé</span></span>`;
  }
  return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200/80 text-[10.5px] font-semibold text-slate-500"><span>Giảm: 0 đ/vé</span></span>`;
}

function renderSubCategoryItem(pkgId, type, config, qty, sellingPrice, scopePrefix = 'desk', paxEnabled = true, maxAllotment = 50) {
  const discount = Math.max(0, config.listedPrice - sellingPrice);
  const lineTotal = qty * sellingPrice;

  return `
    <div class="bg-white rounded-xl p-3 border border-[#E2E8F0] space-y-2.5 ${!paxEnabled ? 'opacity-50' : ''}">
      <!-- Tên đối tượng & điều kiện: Người lớn - Cao trên 1m4 -->
      <div class="flex items-center justify-between text-xs">
        <div class="font-bold text-[#0F172A] flex items-center gap-1 flex-wrap">
          <span>${config.label}</span>
          ${config.condition ? `<span class="text-xs text-[#64748B] font-normal"> - ${config.condition}</span>` : ''}
        </div>
      </div>

      <!-- Khu vực số lượng bên trái & đơn giá bên phải -->
      <div class="flex items-center justify-between gap-3">
        <!-- Bên trái: Bộ đếm số lượng - / 2 / + -->
        <div class="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
          <button type="button" onclick="updateMultiQty(${pkgId}, '${type}', -1)" ${(!paxEnabled || qty <= 0) ? 'disabled' : ''} class="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs cursor-pointer">
            <i class="fa-solid fa-minus text-[10px]"></i>
          </button>
          <span class="w-8 text-center font-bold text-xs text-[#0F172A]">${qty}</span>
          <button type="button" onclick="updateMultiQty(${pkgId}, '${type}', 1)" ${!paxEnabled ? 'disabled' : ''} class="w-7 h-7 rounded-lg bg-[#F25C19] text-white hover:bg-[#d84814] font-bold flex items-center justify-center active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs cursor-pointer">
            <i class="fa-solid fa-plus text-[10px]"></i>
          </button>
        </div>

        <!-- Bên phải: Giá thực nhận đặt cạnh giá niêm yết gạch ngang -->
        <div class="text-right">
          <div class="flex items-baseline justify-end gap-1.5">
            <span class="text-sm font-extrabold text-[#0F172A]">${formatMoney(sellingPrice)} đ</span>
            ${config.listedPrice > sellingPrice ? `<span class="text-xs text-[#94A3B8] line-through font-normal">${formatMoney(config.listedPrice)} đ</span>` : ''}
          </div>
        </div>
      </div>

      <!-- Dòng dưới cùng: Tóm tắt mức giảm trên từng vé & Tổng thành tiền của hạng vé đó -->
      <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-[#64748B]">
        <div>
          ${discount > 0 ? `<span class="text-emerald-600 font-medium text-[11px]">Chiết khấu: -${formatMoney(discount)} đ/vé</span>` : '<span class="text-slate-400 text-[11px]">Giá niêm yết</span>'}
        </div>
        <div class="text-right font-bold text-[#0F172A]">
          <span class="text-[#64748B] font-normal text-[11px]">Thành tiền: </span>
          <span class="text-xs font-bold text-[#0F172A]">${formatMoney(lineTotal)} đ</span>
        </div>
      </div>
    </div>`;
}

function toggleOrderTicketAccordion(pkgId) {
  if (selectedOrderTickets[pkgId]) {
    selectedOrderTickets[pkgId].isExpanded = !selectedOrderTickets[pkgId].isExpanded;
    renderOrderTicketsAccordions();
  }
}

function removeTicketFromOrder(pkgId) {
  if (selectedOrderTickets[pkgId]) {
    const title = ticketPackages[pkgId] ? ticketPackages[pkgId].title : `Gói vé #${pkgId}`;
    delete selectedOrderTickets[pkgId];
    if (packageConfigStates[pkgId]) {
      packageConfigStates[pkgId].adultQty = 0;
      packageConfigStates[pkgId].childQty = 0;
      packageConfigStates[pkgId].seniorQty = 0;
    }
    updateCatalogCardsState();
    renderOrderTicketsAccordions();
    recalculateTotals();
    showToast('Đã loại bỏ gói vé', `Đã xóa "${title}" khỏi đơn hàng.`);
  }
}

function applyPackageTierQtyChange(pkgId, type, targetQty) {
  const orderItem = selectedOrderTickets[pkgId];
  const pkg = ticketPackages[pkgId];
  if (!orderItem || !pkg || !pkg[type]) return false;
  if (!isPackagePaxEnabled(pkg, orderItem)) {
    showToast('Chưa chọn đủ thông tin', 'Vui lòng chọn Nhà hàng và Khung giờ trước khi chọn số lượng.', 'error');
    return false;
  }
  let num = parseInt(targetQty, 10);
  if (isNaN(num) || num < 0) num = 0;
  const stockLimit = getPackageEffectiveAllotment(pkg, orderItem);
  const otherQty = TICKET_TIER_KEYS.reduce((sum, t) => t === type ? sum : sum + getTierQty(orderItem, t), 0);
  if (otherQty + num > stockLimit) {
    showToast('Vượt hạn mức chỗ', `Số lượng vượt quá ${stockLimit} chỗ khả dụng cho ca đã chọn.`, 'error');
    return false;
  }
  if (num > 50) num = 50;
  orderItem[getTierQtyKey(type)] = num;
  if (Object.prototype.hasOwnProperty.call(bookingSessionPax, type)) bookingSessionPax[type] = num;
  syncDiningCardPanels();
  renderOrderTicketsAccordions();
  recalculateTotals();
  return true;
}

function updateMultiQty(pkgId, type, delta) {
  const orderItem = selectedOrderTickets[pkgId];
  if (!orderItem) return;
  applyPackageTierQtyChange(pkgId, type, getTierQty(orderItem, type) + delta);
}

function handleMultiManualQty(pkgId, type, value) {
  const parsed = parseInt(value, 10);
  if (!applyPackageTierQtyChange(pkgId, type, isNaN(parsed) ? 0 : parsed)) {
    renderOrderTicketsAccordions();
    recalculateTotals();
  }
}

function handleMultiSellingPriceInput(pkgId, type, inputElement, originScope = 'desk') {
  if (!selectedOrderTickets[pkgId]) return;
  const rawValue = parseMoney(inputElement.value);
  inputElement.value = formatMoney(rawValue);
  selectedOrderTickets[pkgId][getTierPriceKey(type)] = rawValue;
  if (bookingSessionDiscountRate !== null) {
    bookingSessionDiscountRate = null;
    renderGlobalDiscountSelector();
  }
  const pkg = ticketPackages[pkgId];
  const orderItem = selectedOrderTickets[pkgId];
  const config = getEffectivePackageTierConfig(pkg, orderItem, type);
  if (!config) return;
  const qty = getTierQty(orderItem, type);
  const discount = config.listedPrice - rawValue;
  const isFloorErr = (rawValue < config.netPrice && qty > 0);

  ['desk', 'mob'].forEach(scope => {
    if (scope !== originScope) {
      const sibling = document.getElementById(`${scope}-inputPrice-${pkgId}-${type}`);
      if (sibling) sibling.value = formatMoney(rawValue);
    }
    const lineTotalEl = document.getElementById(`${scope}-lineTotal-${pkgId}-${type}`);
    if (lineTotalEl) lineTotalEl.innerText = `${formatMoney(qty * rawValue)} đ`;
    const discountContainer = document.getElementById(`${scope}-discountLabel-${pkgId}-${type}`);
    if (discountContainer) discountContainer.innerHTML = renderDiscountBadge(discount);
    const errorFloorEl = document.getElementById(`${scope}-errorFloor-${pkgId}-${type}`);
    if (errorFloorEl) errorFloorEl.classList.toggle('hidden', !isFloorErr);
    const tagEl = document.getElementById(`${scope}-tagStatus-${pkgId}-${type}`);
    if (tagEl) {
      const isNowListed = (rawValue >= config.listedPrice);
      tagEl.innerHTML = isNowListed
        ? `<span class="shrink-0 whitespace-nowrap px-1.5 py-0.5 rounded text-[8.5px] font-bold bg-[#FFF7ED] border border-orange-200 text-[#F25C22] leading-none">Áp niêm yết</span>`
        : `<button type="button" onclick="setMultiPricePreset(${pkgId}, '${type}', 'listed')" title="Bấm để quay về giá niêm yết" class="shrink-0 whitespace-nowrap px-1.5 py-0.5 rounded text-[8.5px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer leading-none flex items-center gap-1"><span>Đã chiết khấu</span><i class="fa-solid fa-rotate-left text-[7px]"></i></button>`;
    }
  });
  recalculateTotals();
}

function setMultiPricePreset(pkgId, type, mode) {
  if (!selectedOrderTickets[pkgId]) return;
  const pkg = ticketPackages[pkgId];
  const config = getEffectivePackageTierConfig(pkg, selectedOrderTickets[pkgId], type);
  if (!config) return;
  selectedOrderTickets[pkgId][getTierPriceKey(type)] = (mode === 'listed') ? config.listedPrice : config.netPrice;
  bookingSessionDiscountRate = null;
  syncDiningCardPanels();
  renderOrderTicketsAccordions();
  recalculateTotals();
}

function getOrderTotalsSnapshot() {
  let totalTickets = 0;
  let totalListed = 0;
  let totalPartner = 0;
  let totalActual = 0;
  let hasFloorError = false;
  for (const pkgId in selectedOrderTickets) {
    const item = selectedOrderTickets[pkgId];
    const pkg = ticketPackages[pkgId];
    if (!pkg || !item) continue;
    TICKET_TIER_KEYS.forEach(t => {
      const cfg = getEffectivePackageTierConfig(pkg, item, t);
      if (!cfg) return;
      const qty = getTierQty(item, t);
      const sellPrice = getTierPrice(item, pkg, t);
      totalTickets += qty;
      totalListed += qty * cfg.listedPrice;
      totalPartner += qty * cfg.netPrice;
      totalActual += qty * sellPrice;
      if (qty > 0 && sellPrice < cfg.netPrice) hasFloorError = true;
    });
  }
  return { totalTickets, totalListed, totalPartner, totalActual, hasFloorError };
}

function recalculateTotals() {
  const snap = getOrderTotalsSnapshot();
  const totalTicketsCount = snap.totalTickets;
  const totalListed = snap.totalListed;
  const totalPartner = snap.totalPartner;
  const totalCollected = snap.totalActual;
  const priceDifference = totalListed - totalPartner;
  const directDiscount = totalListed - totalCollected;
  const profit = totalCollected - totalPartner;
  const finalPayable = totalPartner;
  const wallet = TecheraDB.getWallet();
  const remainingBalance = (wallet.balance || 0) - finalPayable;

  const selectedPackagesCount = Object.keys(selectedOrderTickets).length;
  const setTxt = (id, txt) => { const el = document.getElementById(id); if (el) el.innerText = txt; };
  setTxt('sidebarSelectedCountBadge', `${selectedPackagesCount} gói vé đang chọn`);
  setTxt('totalTicketsCountBadge', totalTicketsCount);
  setTxt('valTotalListed', `${formatMoney(totalListed)} đ`);
  setTxt('valTotalPartner', `${formatMoney(totalPartner)} đ`);
  setTxt('valTotalCollected', `${formatMoney(totalCollected)} đ`);
  setTxt('valPriceDifference', `${formatMoney(priceDifference)} đ`);

  const directDiscountEl = document.getElementById('valDirectDiscount');
  if (directDiscountEl) {
    directDiscountEl.innerText = directDiscount >= 0 ? `- ${formatMoney(directDiscount)} đ` : `+ ${formatMoney(Math.abs(directDiscount))} đ`;
    directDiscountEl.className = directDiscount >= 0 ? 'font-semibold text-emerald-600' : 'font-semibold text-brand-600';
  }
  const profitEl = document.getElementById('valProfit');
  if (profitEl) {
    profitEl.innerText = profit >= 0 ? `+ ${formatMoney(profit)} đ` : `Cảnh báo lỗ (${formatMoney(profit)} đ)`;
    profitEl.className = profit >= 0 ? 'font-black text-sm text-emerald-700' : 'font-black text-sm text-rose-600';
  }
  setTxt('valFinalPayable', `${formatMoney(finalPayable)} đ`);

  const walletRemainingEl = document.getElementById('walletRemaining');
  if (walletRemainingEl) {
    if (remainingBalance >= 0) {
      walletRemainingEl.innerText = `${formatMoney(remainingBalance)} đ (Đủ điều kiện)`;
      walletRemainingEl.className = 'font-bold text-slate-900';
    } else {
      walletRemainingEl.innerText = `Không đủ (${formatMoney(remainingBalance)} đ)`;
      walletRemainingEl.className = 'font-bold text-rose-600';
    }
  }

  const shouldDisable = (snap.hasFloorError || totalTicketsCount === 0);
  ['btnContinueBooking', 'btnMobileFooterContinue', 'btnMobileDrawerContinue'].forEach(btnId => {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.disabled = shouldDisable;
    btn.classList.toggle('opacity-50', shouldDisable);
    btn.classList.toggle('cursor-not-allowed', shouldDisable);
  });

  setTxt('mobileFooterTicketsCount', `${totalTicketsCount} vé`);
  setTxt('mobileFooterFinalPayable', `${formatMoney(finalPayable)} đ`);
  const pad = n => (n < 10 ? '0' + n : '' + n);
  const formattedDateStr = `${selectedDate.dayName}, ${pad(selectedDate.day)}/${pad(selectedDate.month)}/${selectedDate.year}`;
  setTxt('mobileDrawerHeaderBadge', `${formattedDateStr} • ${selectedPackagesCount} gói • ${totalTicketsCount} vé`);
  setTxt('cashflowTotalTicketsBadge', `Tổng ${totalTicketsCount} vé`);
  setTxt('mobileDrawerTotalTickets', totalTicketsCount);
  setTxt('mobileDrawerTotalListed', `${formatMoney(totalListed)} đ`);
  setTxt('mobileDrawerTotalPartner', `${formatMoney(totalPartner)} đ`);
  setTxt('mobileDrawerTotalCollected', `${formatMoney(totalCollected)} đ`);
  setTxt('mobileDrawerPriceDiff', `${formatMoney(priceDifference)} đ`);
  setTxt('mobileDrawerFinalPayable', `${formatMoney(finalPayable)} đ`);
  setTxt('mobileDrawerFinalPayableFooter', `${formatMoney(finalPayable)} đ`);

  const mobProfitSummary = document.getElementById('mobileDrawerProfitSummary');
  if (mobProfitSummary) {
    if (profit >= 0) {
      mobProfitSummary.innerText = `+ ${formatMoney(profit)} đ${directDiscount > 0 ? ` (Chiết khấu: -${formatMoney(directDiscount)} đ)` : ''}`;
      mobProfitSummary.className = 'font-bold text-emerald-600';
    } else {
      mobProfitSummary.innerText = `${formatMoney(profit)} đ`;
      mobProfitSummary.className = 'font-bold text-rose-600';
    }
  }

  const mobDirectDisc = document.getElementById('mobileDrawerDirectDiscount');
  if (mobDirectDisc) {
    mobDirectDisc.innerText = directDiscount >= 0 ? `- ${formatMoney(directDiscount)} đ` : `+ ${formatMoney(Math.abs(directDiscount))} đ`;
    mobDirectDisc.className = directDiscount >= 0 ? 'font-bold text-emerald-600' : 'font-bold text-brand-600';
  }
  const mobProfit = document.getElementById('mobileDrawerProfit');
  if (mobProfit) {
    mobProfit.innerText = profit >= 0 ? `+ ${formatMoney(profit)} đ` : `Cảnh báo lỗ (${formatMoney(profit)} đ)`;
    mobProfit.className = profit >= 0 ? 'font-black text-sm text-emerald-700' : 'font-black text-sm text-rose-600';
  }
  const mobileFooter = document.getElementById('mobileBookingFooterBar');
  if (mobileFooter) mobileFooter.classList.toggle('hidden', !(currentSelectedSupplierId && totalTicketsCount > 0));

  persistBookingContext();
  updateHeaderCartBadges();
}

// ============================================================================
// MOBILE DRAWER & CART / CHECKOUT ACTIONS
// ============================================================================

function openMobilePaymentDetailDrawer() {
  if (window.innerWidth >= 1024) return;
  const mobUsageDateEl = document.getElementById('mobileDrawerUsageDateText');
  if (mobUsageDateEl && selectedDate) mobUsageDateEl.innerText = `${selectedDate.dayName}, ${formatDateObjDMY(selectedDate)}`;
  renderOrderTicketsAccordions();
  recalculateTotals();
  const drawer = document.getElementById('drawerMobilePaymentDetail');
  const backdrop = document.getElementById('drawerMobilePaymentBackdrop');
  const panel = document.getElementById('drawerMobilePaymentPanel');
  if (!drawer) return;
  drawer.classList.remove('hidden');
  setTimeout(() => {
    if (backdrop) { backdrop.classList.remove('opacity-0'); backdrop.classList.add('opacity-100'); }
    if (panel) { panel.classList.remove('translate-y-full'); panel.classList.add('translate-y-0'); }
  }, 10);
}

function closeMobilePaymentDetailDrawer() {
  const drawer = document.getElementById('drawerMobilePaymentDetail');
  const backdrop = document.getElementById('drawerMobilePaymentBackdrop');
  const panel = document.getElementById('drawerMobilePaymentPanel');
  if (!drawer) return;
  if (backdrop) { backdrop.classList.remove('opacity-100'); backdrop.classList.add('opacity-0'); }
  if (panel) { panel.classList.remove('translate-y-0'); panel.classList.add('translate-y-full'); }
  setTimeout(() => drawer.classList.add('hidden'), 300);
}

function syncSelectedOrderToCart() {
  const dest = TecheraDB.getDestinationById(currentSelectedDestinationId);
  const sup = getSuppliersForDestination(currentSelectedDestinationId).find(s => s.id === currentSelectedSupplierId);
  if (!currentSelectedDestinationId || !currentSelectedSupplierId) return 0;

  const cartItems = TecheraDB.getCart();
  const dateSnapshot = {
    day: selectedDate.day,
    month: selectedDate.month,
    year: selectedDate.year,
    dayName: selectedDate.dayName || computeDayNameVi(selectedDate.day, selectedDate.month, selectedDate.year)
  };
  const policy = getDatePricePolicy(dateSnapshot.day, dateSnapshot.month, dateSnapshot.year);
  const dateStr = formatDateObjDMY(dateSnapshot);
  let addedOrUpdated = 0;

  Object.keys(selectedOrderTickets).forEach(k => {
    const pkgId = parseInt(k, 10);
    const orderItem = selectedOrderTickets[pkgId];
    const pkg = ticketPackages[pkgId];
    if (!orderItem || !pkg) return;
    const diningRest = getSelectedDiningRestaurant(pkg, orderItem);
    const diningSlot = getSelectedDiningSlot(pkg, orderItem);
    if (pkg.hasDiningConfig && (!diningRest || !diningSlot)) return;

    const restId = diningRest ? diningRest.id : '';
    const slotId = diningSlot ? diningSlot.id : '';
    const stockLimit = getPackageEffectiveAllotment(pkg, orderItem);

    TICKET_TIER_KEYS.forEach(t => {
      const cfg = getEffectivePackageTierConfig(pkg, orderItem, t);
      if (!cfg) return;
      const qty = getTierQty(orderItem, t);
      if (qty <= 0) return;
      const sellPrice = getTierPrice(orderItem, pkg, t);

      const existing = cartItems.find(ci =>
        ci.destId === currentSelectedDestinationId &&
        ci.supplierId === currentSelectedSupplierId &&
        ci.pkgId === pkgId &&
        ci.tierKey === t &&
        formatDateObjDMY(ci.usageDate) === dateStr &&
        (ci.selectedRestaurantId || '') === restId &&
        (ci.selectedTimeSlotId || '') === slotId
      );

      if (existing) {
        existing.pkgTitle = pkg.title;
        existing.serviceGroupLabel = pkg.serviceGroupLabel || '';
        existing.marketLabel = pkg.marketLabel || '';
        existing.qty = Math.min(stockLimit, qty);
        existing.listedPrice = cfg.listedPrice;
        existing.netPrice = cfg.netPrice;
        existing.sellingPrice = sellPrice;
        existing.discountRate = bookingSessionDiscountRate;
        existing.stockLimit = stockLimit;
        existing.checked = true;
      } else {
        cartItems.unshift({
          cartItemId: `cart-${Date.now()}-${Math.floor(Math.random() * 10000)}-${pkgId}-${t}`,
          destId: currentSelectedDestinationId,
          destName: dest ? dest.name : 'Khu du lịch',
          destImage: dest ? dest.imageUrl : '',
          supplierId: currentSelectedSupplierId,
          supplierName: sup ? sup.name : 'Đối tác KDL',
          pkgId,
          pkgTitle: pkg.title,
          serviceGroupLabel: pkg.serviceGroupLabel || '',
          marketLabel: pkg.marketLabel || '',
          category: pkg.category,
          hasDiningConfig: !!pkg.hasDiningConfig,
          selectedRestaurantId: restId || null,
          selectedTimeSlotId: slotId || null,
          diningText: (diningRest && diningSlot) ? `${diningRest.name} • ${diningSlot.timeRange}` : '',
          tierKey: t,
          tierLabel: cfg.label,
          tierCondition: cfg.condition || '',
          usageDate: dateSnapshot,
          baseWeekdayListed: roundPriceThousand(cfg.listedPrice / policy.multiplier),
          baseWeekdayNet: roundPriceThousand(cfg.netPrice / policy.multiplier),
          baseWeekdaySelling: roundPriceThousand(sellPrice / policy.multiplier),
          listedPrice: cfg.listedPrice,
          netPrice: cfg.netPrice,
          sellingPrice: sellPrice,
          discountRate: bookingSessionDiscountRate,
          qty: Math.min(stockLimit, qty),
          stockLimit,
          checked: true
        });
      }
      addedOrUpdated++;
    });
  });

  if (addedOrUpdated > 0) {
    TecheraDB.saveCart(cartItems);
    updateHeaderCartBadges();
  }
  return addedOrUpdated;
}

function handleAddToCartOnly() {
  const synced = syncSelectedOrderToCart();
  if (synced === 0) {
    showToast('Chưa chọn vé', 'Vui lòng chọn gói vé và số lượng hợp lệ trước khi thêm vào giỏ hàng.', 'error');
    return;
  }
  showToast('Đã thêm vào giỏ hàng', `Đã cập nhật ${synced} mục vé vào Giỏ hàng đặt vé.`, 'success');
}

function handleDrawerAddToCart() {
  handleAddToCartWithFlyAnimation(null);
}

function handleAddToCartWithFlyAnimation(event) {
  const oldTotal = (typeof TecheraDB !== 'undefined' && typeof TecheraDB.getCartTotalQty === 'function')
    ? TecheraDB.getCartTotalQty()
    : 0;

  const synced = syncSelectedOrderToCart();
  if (synced === 0) {
    showToast('Chưa chọn vé', 'Vui lòng chọn loại vé và số lượng hợp lệ trước khi thêm vào giỏ hàng.', 'error');
    return;
  }

  const newTotal = (typeof TecheraDB !== 'undefined' && typeof TecheraDB.getCartTotalQty === 'function')
    ? TecheraDB.getCartTotalQty()
    : (oldTotal + 1);
  const addedTicketsCount = Math.max(1, newTotal - oldTotal);

  // 1. Đóng Drawer mượt mà ngay lập tức khi thẻ vé bắt đầu bay
  closeMobilePaymentDetailDrawer();

  // 2. Xác định nút bấm và nút giỏ hàng nổi đích
  const clickBtn = event ? (event.currentTarget || event.target) : document.getElementById('btnDrawerAddToCart');
  const cartBtn = document.getElementById('btnMobileFloatingCart') || document.getElementById('btnDesktopFloatingCart') || document.querySelector('header a[href="cart.html"]');

  if (clickBtn && cartBtn) {
    const startRect = clickBtn.getBoundingClientRect();
    const targetRect = cartBtn.getBoundingClientRect();

    const startX = startRect.left + startRect.width / 2;
    const startY = startRect.top + startRect.height / 2;
    const endX = targetRect.left + targetRect.width / 2;
    const endY = targetRect.top + targetRect.height / 2;

    // Đỉnh vòng cung bay (Parabolic Arc) hướng vút lên trên
    const midX = (startX + endX) / 2;
    const midY = Math.min(startY, endY) - 150;

    // Tạo Thẻ vé thu nhỏ (Flying Particle)
    const flyer = document.createElement('div');
    flyer.className = 'fixed z-[9999] pointer-events-none flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border-2 border-[#F25C22] text-[#F25C22] shadow-[0_12px_30px_rgba(242,92,34,0.45)] font-black text-xs select-none';
    flyer.innerHTML = `<i class="fa-solid fa-ticket text-xs"></i><span>+${addedTicketsCount} vé</span>`;
    flyer.style.left = `${startX - 35}px`;
    flyer.style.top = `${startY - 18}px`;
    flyer.style.transform = 'scale(1) rotate(0deg)';
    flyer.style.opacity = '1';
    flyer.style.willChange = 'transform, left, top, opacity';
    document.body.appendChild(flyer);

    const duration = 650; // ms
    const startTime = performance.now();

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);

      // Easing Cubic Bezier cho chuyển động mượt mà
      const ease = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      // Tính tọa độ Bézier bậc 2 (Parabolic curve)
      const currentX = (1 - ease) * (1 - ease) * startX + 2 * (1 - ease) * ease * midX + ease * ease * endX;
      const currentY = (1 - ease) * (1 - ease) * startY + 2 * (1 - ease) * ease * midY + ease * ease * endY;
      const currentScale = 1.05 - 0.7 * ease; // Thu nhỏ từ 1.05 -> 0.35
      const currentRotate = ease * 25; // Xoay nhẹ theo góc bay

      flyer.style.left = `${currentX - 35}px`;
      flyer.style.top = `${currentY - 18}px`;
      flyer.style.transform = `scale(${currentScale}) rotate(${currentRotate}deg)`;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        // === Khoảnh khắc chạm giỏ hàng (Cart Impact) ===
        if (flyer.parentNode) flyer.parentNode.removeChild(flyer);

        // Nút giỏ hàng nảy nhẹ (scale-125)
        cartBtn.style.transition = 'transform 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        cartBtn.style.transform = 'scale(1.25)';

        // Hiệu ứng sóng nảy quanh nút giỏ hàng
        const pulseRing = document.createElement('span');
        pulseRing.className = 'absolute inset-0 rounded-full bg-[#F25C22]/30 ring-4 ring-[#F25C22]/40 animate-ping pointer-events-none';
        cartBtn.appendChild(pulseRing);
        setTimeout(() => pulseRing.remove(), 500);

        // Số lượng badge tự động cộng thêm với hiệu ứng nảy số
        const badgeEl = document.getElementById('mobileFloatingCartBadge') || document.getElementById('desktopFloatingCartBadge');
        if (badgeEl) {
          badgeEl.innerText = newTotal;
          badgeEl.classList.remove('hidden');
          badgeEl.style.transition = 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
          badgeEl.style.transform = 'scale(1.4)';
          setTimeout(() => { badgeEl.style.transform = 'scale(1)'; }, 220);
        }

        setTimeout(() => {
          cartBtn.style.transform = 'scale(1)';
          updateHeaderCartBadges();
        }, 250);

        showToast('Đã thêm vào giỏ hàng', `Đã thêm thành công ${addedTicketsCount} vé vào Giỏ hàng!`, 'success');
      }
    }

    requestAnimationFrame(step);
  } else {
    updateHeaderCartBadges();
    showToast('Đã thêm vào giỏ hàng', `Đã lưu thành công ${synced} gói vé vào Giỏ hàng.`, 'success');
  }
}

function handleContinueBooking() {
  if (isBookingDateUnavailable(selectedDate.day, selectedDate.month, selectedDate.year)) {
    showToast('Ngày không khả dụng', 'Không có gói dịch vụ khả dụng cho ngày này, vui lòng chọn ngày khác!', 'error');
    return;
  }
  const snap = getOrderTotalsSnapshot();
  if (snap.totalTickets === 0) {
    showToast('Chưa chọn số lượng', 'Vui lòng chọn ít nhất 01 vé để tiếp tục.', 'error');
    return;
  }
  for (const pkgId in selectedOrderTickets) {
    const item = selectedOrderTickets[pkgId];
    const pkg = ticketPackages[pkgId];
    if (pkg && pkg.hasDiningConfig && getPackageTotalQty(item) > 0 && !getSelectedDiningSlot(pkg, item)) {
      showToast('Thiếu thông tin ẩm thực', `Vui lòng chọn Nhà hàng và Khung giờ cho "${pkg.title}".`, 'error');
      return;
    }
  }
  if (snap.hasFloorError) {
    showToast('Lỗi giá sàn đối tác', 'Giá thực nhận không được thấp hơn giá sàn đối tác B2B. Vui lòng kiểm tra lại!', 'error');
    return;
  }

  TecheraDB.saveCheckoutSession({
    mode: 'detail',
    destId: currentSelectedDestinationId,
    supplierId: currentSelectedSupplierId,
    usageDate: selectedDate,
    selectedOrderTickets,
    discountRate: bookingSessionDiscountRate
  });
  window.location.href = 'checkout.html?mode=detail';
}

function handleDrawerContinueAction() {
  closeMobilePaymentDetailDrawer();
  handleContinueBooking();
}

function handleSaveDraft(statusLabel = 'Nháp') {
  const snap = getOrderTotalsSnapshot();
  if (snap.totalTickets === 0) {
    showToast('Không thể lưu đơn rỗng', 'Vui lòng chọn ít nhất 01 vé trước khi lưu đơn nháp.', 'error');
    return;
  }
  const dest = TecheraDB.getDestinationById(currentSelectedDestinationId);
  const sup = getSuppliersForDestination(currentSelectedDestinationId).find(s => s.id === currentSelectedSupplierId);
  const pad = n => (n < 10 ? '0' + n : '' + n);
  const useDateStr = `${selectedDate.year}-${pad(selectedDate.month)}-${pad(selectedDate.day)}`;
  const orderCode = 'TEC-ORD-' + Math.floor(100000 + Math.random() * 900000);
  const newOrder = {
    orderCode,
    createdDate: REPORT_TODAY,
    useDate: useDateStr,
    customerName: 'Đại lý B2B Techera',
    customerPhone: '0905 889 988',
    customerEmail: 'booking@huyera.vn',
    customerSource: 'Zalo',
    channel: 'Đại lý (TA)',
    subType: '-',
    staff: sup ? sup.name : 'Techera B2B',
    salesOwner: 'Nguyễn Văn An (Sale)',
    corp: dest && dest.chainLabel ? dest.chainLabel : 'Sun World',
    site: dest ? dest.name : 'Sun World Ba Na Hills',
    packageName: 'Đơn đặt vé lưu nháp',
    tickets: snap.totalTickets,
    revenue: snap.totalPartner,
    netCost: snap.totalPartner,
    profit: Math.max(0, snap.totalActual - snap.totalPartner),
    status: statusLabel,
    paymentMethod: 'Chờ xác nhận'
  };
  TecheraDB.addOrder(newOrder);
  showToast('Đã lưu đơn nháp', `Mã đơn ${orderCode} (${snap.totalTickets} vé) đã được lưu vào Danh sách Đơn hàng.`, 'success');
}

window.addEventListener('DOMContentLoaded', () => {
  renderSharedShell({ activePage: 'booking', pageTitle: 'Đặt vé chi tiết', showGlobalHeader: false, hasBottomBar: true, hideFloatingCart: true });

  const urlParams = new URLSearchParams(window.location.search);
  const paramDest = urlParams.get('dest');
  const ctx = TecheraDB.getBookingContext();

  currentSelectedDestinationId = paramDest || (ctx && ctx.destId) || 'sunworld-bana';
  currentSelectedSupplierId = (ctx && ctx.supplierId) || 'partner';
  bookingSessionPax = (ctx && ctx.quickPax) ? ctx.quickPax : { adult: 1, child: 0, senior: 0 };
  bookingSessionDiscountRate = (ctx && typeof ctx.discountRate === 'number') ? ctx.discountRate : 0;

  if (ctx && ctx.selectedDate && ctx.selectedDate.day) {
    selectedDate = ctx.selectedDate;
    viewDate = { month: selectedDate.month, year: selectedDate.year };
    hasConfirmedDate = !!ctx.hasConfirmedDate;
  } else {
    hasConfirmedDate = false;
  }

  const dest = TecheraDB.getDestinationById(currentSelectedDestinationId);
  const detailTitleEl = document.getElementById('detailDestinationName');
  if (detailTitleEl && dest) detailTitleEl.innerText = dest.name;

  const searchInput = document.getElementById('searchTicketInput');
  if (searchInput) searchInput.addEventListener('input', () => applyTwoTierFilterToCards());

  syncSelectedDateLabels();
  renderCalendar();
  toggleCalendarAccordion(!hasConfirmedDate);
  refreshPackagesForCurrentSelection(false);

  // Restore draft tickets if returning to edit the same destination
  if (ctx && ctx.destId === currentSelectedDestinationId && ctx.selectedOrderTickets && Object.keys(ctx.selectedOrderTickets).length > 0) {
    const firstId = parseInt(Object.keys(ctx.selectedOrderTickets)[0], 10);
    const matchedPkg = ticketPackages[firstId];
    if (matchedPkg) {
      activeServiceTab = matchedPkg.serviceGroup;
      activeMarketTab = matchedPkg.marketId;
      selectedOrderTickets = ctx.selectedOrderTickets;
      packageConfigStates[firstId] = selectedOrderTickets[firstId];
      renderPackageFilterTabs();
      renderDirectPackageConfigPanel();
      renderPaxQuantitySection();
      syncBookingFlowVisibility();
      renderOrderTicketsAccordions();
      recalculateTotals();
    }
  }
});

// Compatibility Aliases & Global Exports for booking.html
window.openSupplierModal = openSupplierSelectModal;
window.closeSupplierModal = closeSupplierSelectModal;
window.toggleCalendarSection = toggleCalendarAccordion;
window.changeCalendarMonth = navigateMonth;
window.applyWheelMonthYear = applyMonthYearPicker;
window.continueToCheckoutFromBooking = handleContinueBooking;
window.addSelectedPackagesToCart = handleAddToCartOnly;
window.saveBookingAsDraft = handleSaveDraft;
window.openMobilePaymentDrawer = openMobilePaymentDetailDrawer;
window.closeMobilePaymentDrawer = closeMobilePaymentDetailDrawer;
window.filterPackagesByKeyword = handleRealtimeSearchInput;
window.handleRealtimeSearchInput = handleRealtimeSearchInput;
window.clearRealtimeSearch = clearRealtimeSearch;
window.toggleTicketDetail = toggleTicketDetail;
window.applyListedDiscountPreset = resetDiscountToListedPrice;
window.onGlobalDiscountSliderChange = handleGlobalDiscountChange;
window.onGlobalDiscountInputChange = handleGlobalDiscountChange;
window.openSupplierSelectModal = openSupplierSelectModal;
window.closeSupplierSelectModal = closeSupplierSelectModal;
window.toggleCalendarAccordion = toggleCalendarAccordion;
window.navigateMonth = navigateMonth;
window.applyMonthYearPicker = applyMonthYearPicker;
window.handleContinueBooking = handleContinueBooking;
window.handleAddToCartOnly = handleAddToCartOnly;
window.handleSaveDraft = handleSaveDraft;
window.openMobilePaymentDetailDrawer = openMobilePaymentDetailDrawer;
window.closeMobilePaymentDetailDrawer = closeMobilePaymentDetailDrawer;
window.resetDiscountToListedPrice = resetDiscountToListedPrice;
window.handleGlobalDiscountChange = handleGlobalDiscountChange;
window.handleAddToCartWithFlyAnimation = handleAddToCartWithFlyAnimation;
window.switchDrawerPackageRestaurant = switchDrawerPackageRestaurant;
window.switchDrawerPackageSlot = switchDrawerPackageSlot;
window.confirmSupplierModalSelection = confirmSupplierModalSelection;
window.selectPendingModalSupplier = selectPendingModalSupplier;
