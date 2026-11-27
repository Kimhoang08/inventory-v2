// ============================================================================
// SITE CATALOG ENGINE (KHÁM PHÁ VIỆT NAM - index.html)
// Mobile-First & Responsive Search & Ticketing Engine
// ============================================================================

const catalogState = {
  keyword: '',
  selectedChains: new Set(),
  selectedRegions: new Set(),
  sortBy: 'popular',
  currentPage: 1,
  itemsPerPage: 6
};

// 1. DYNAMIC SEARCH PLACEHOLDERS & LOCALSTORAGE SEARCH HISTORY
const dynamicSearchPlaceholders = [
  'Vé Safari Nam Hội An',
  'Sun World Ba Na Hills',
  'VinWonders Phú Quốc',
  'Vé cáp treo Hòn Thơm',
  'Ký Ức Hội An',
  'Sun World Fansipan Legend'
];
let placeholderCycleIndex = 0;
let placeholderCycleTimer = null;

const RECENT_SEARCHES_STORAGE_KEY = 'techera_recent_searches_v1';

function loadRecentSearchesFromStorage() {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (_) {}
  return ['Sun World Ba Na Hills', 'VinWonders Phú Quốc', 'Vé cáp treo Hòn Thơm'];
}

function saveRecentSearchesToStorage(list) {
  try {
    localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(list));
  } catch (_) {}
}

let recentSearchHistory = loadRecentSearchesFromStorage();

const trendingHashtagsList = [
  { tag: '#BàNàHills', query: 'Sun World Ba Na Hills' },
  { tag: '#VinWonders', query: 'VinWonders' },
  { tag: '#VéCápTreo', query: 'Cáp treo' },
  { tag: '#ShowKýỨcHộiAn', query: 'Hội An' },
  { tag: '#WaterPark', query: 'Water Park' },
  { tag: '#SafariNamHộiAn', query: 'Nam Hội An' },
  { tag: '#GrandWorld', query: 'Phú Quốc' },
  { tag: '#HònThơm', query: 'Hòn Thơm' },
  { tag: '#Fansipan', query: 'Fansipan' },
  { tag: '#ĐầmSen', query: 'Đầm Sen' }
];
let isTrendingExtraExpanded = false;

// 2. NGÀY SỬ DỤNG & SỐ LƯỢNG KHÁCH (MẶC ĐỊNH ĐỂ TRỐNG THEO YÊU CẦU)
let catalogSelectedDate = null;
const _initCalToday = (typeof getSystemTodayParts === 'function') ? getSystemTodayParts() : { month: 11, year: 2026 };
let catalogDatePickerView = { month: _initCalToday.month || 11, year: _initCalToday.year || 2026 };
let catalogQuickDateSelected = false;
let catalogQuickPax = { adult: 0, child: 0, senior: 0 };
let catalogQuickPaxTouched = false;

// Active Drawer Tab ('chains' | 'regions')
let activeDrawerTab = 'chains';

// 3. REGIONAL & CHAIN MATCHING ENGINE
function matchDestinationRegion(itemRegion, selectedRegion) {
  if (!itemRegion || !selectedRegion) return false;
  const normDash = str => str.replace(/[–—]/g, '-').trim();
  const r1 = normDash(itemRegion);
  const r2 = normDash(selectedRegion);
  if (r1.toLowerCase() === r2.toLowerCase()) return true;

  const normItem = (typeof removeVietnameseTones === 'function')
    ? removeVietnameseTones(r1).toLowerCase()
    : r1.toLowerCase();
  const normSel = (typeof removeVietnameseTones === 'function')
    ? removeVietnameseTones(r2).toLowerCase()
    : r2.toLowerCase();

  if (normItem.includes(normSel) || normSel.includes(normItem)) return true;
  if ((normSel.includes('hcm') || normSel.includes('ho chi minh')) && (normItem.includes('hcm') || normItem.includes('ho chi minh'))) return true;
  if (normSel.includes('hoi an') && (normItem.includes('hoi an') || normItem.includes('quang nam'))) return true;
  if (normSel.includes('ha long') && (normItem.includes('ha long') || normItem.includes('quang ninh'))) return true;
  if ((normSel.includes('cam ranh') || normSel.includes('khanh hoa')) && (normItem.includes('khanh hoa') || normItem.includes('cam ranh') || normItem.includes('nha trang'))) return true;
  if (normSel.includes('kien giang') && (normItem.includes('phu quoc') || normItem.includes('hon thom') || normItem.includes('kien giang'))) return true;
  if (normSel.includes('binh thuan') && (normItem.includes('phan thiet') || normItem.includes('binh thuan'))) return true;
  if (normSel.includes('ha nam') && normItem.includes('ha nam')) return true;
  if (normSel.includes('da nang') && normItem.includes('da nang')) return true;
  return false;
}

function matchDestinationChain(itemChain, itemChainLabel, selectedChain) {
  if (!selectedChain) return false;
  const c1 = (itemChain || '').toUpperCase().trim();
  const c2 = (itemChainLabel || '').toUpperCase().trim();
  const sel = (selectedChain || '').toUpperCase().trim();
  if (c1 === sel || c2 === sel) return true;
  if ((sel === 'SUNWORLD' || sel === 'SUNWORLD_BANA') && (c1.includes('SUNWORLD') || c2.includes('SUNWORLD') || c1.includes('BANA') || c2.includes('BÀ NÀ'))) return true;
  if (sel === 'VINWONDERS' && (c1.includes('VINWONDERS') || c2.includes('VINWONDERS'))) return true;
  if (sel === 'NOVADREAMS' && (c1.includes('NOVADREAMS') || c2.includes('NOVADREAMS') || c2.includes('NOVALAND'))) return true;
  if (sel === 'DAMSEN_WORLD' && (c1.includes('DAMSEN') || c2.includes('DAMSEN') || c2.includes('ĐẦM SEN'))) return true;
  if (sel === 'TTC' && (c1.includes('TTC') || c2.includes('TTC'))) return true;
  if (sel === 'SUOITIEN' && (c1.includes('SUOITIEN') || c2.includes('SUỐI TIÊN') || c2.includes('SUOI TIEN'))) return true;
  if (sel.includes('OFFLINE') && (c1.includes('OFFLINE') || c2.includes('OFFLINE') || c1.includes('KHÁC') || c1.includes('KHAC'))) return true;
  return false;
}

// 4. BỘ LỌC TẬP ĐOÀN & KHU VỰC (SLIDE-OVER DRAWER)
function renderFilterCheckboxes() {
  const chainsContainer = document.getElementById('filterChainsContainer');
  const chains = (typeof filterChainsList !== 'undefined') ? filterChainsList : [
    { id: 'DAMSEN_WORLD', name: 'DAMSEN_WORLD' },
    { id: 'NOVADREAMS', name: 'NOVADREAMS' },
    { id: 'SUNWORLD', name: 'SUNWORLD' },
    { id: 'SUOITIEN', name: 'SUOITIEN' },
    { id: 'TTC', name: 'TTC' },
    { id: 'VINWONDERS', name: 'VINWONDERS' },
    { id: 'KHÁC (OFFLINE)', name: 'KHÁC (OFFLINE)' }
  ];

  if (chainsContainer) {
    chainsContainer.innerHTML = chains.map(item => {
      const chainId = typeof item === 'object' ? item.id : item;
      const chainName = typeof item === 'object' ? (item.name || item.id) : item;
      const isChecked = catalogState.selectedChains.has(chainId);
      return `
        <label class="flex items-center gap-2 p-2.5 rounded-xl border transition-all cursor-pointer select-none text-left ${isChecked ? 'bg-orange-50/90 border-brand-500 shadow-2xs ring-1 ring-brand-500/30' : 'bg-white border-slate-200/90 hover:border-slate-300'}">
          <input type="checkbox"
                 value="${chainId}"
                 onchange="toggleFilterChain('${chainId}')"
                 ${isChecked ? 'checked' : ''}
                 class="w-4 h-4 rounded text-brand-500 focus:ring-brand-500 accent-brand-500 cursor-pointer shrink-0">
          <span class="font-extrabold text-[11px] sm:text-xs ${isChecked ? 'text-brand-700 font-black' : 'text-slate-700'} truncate">${chainName}</span>
        </label>
      `;
    }).join('');
  }

  const regionsContainer = document.getElementById('filterRegionsContainer');
  const regions = (typeof filterRegionsList !== 'undefined') ? filterRegionsList : [
    'Bình Thuận',
    'Hạ Long',
    'Cam Ranh – Khánh Hòa',
    'HCM',
    'Đà Nẵng',
    'Hà Nam',
    'Hội An',
    'Kiên Giang'
  ];

  if (regionsContainer) {
    regionsContainer.innerHTML = regions.map(reg => {
      const regId = typeof reg === 'object' ? reg.id : reg;
      const regName = typeof reg === 'object' ? (reg.name || reg.id) : reg;
      const isChecked = catalogState.selectedRegions.has(regId);
      return `
        <label class="flex items-center gap-2 p-2.5 rounded-xl border transition-all cursor-pointer select-none text-left ${isChecked ? 'bg-orange-50/90 border-brand-500 shadow-2xs ring-1 ring-brand-500/30' : 'bg-white border-slate-200/90 hover:border-slate-300'}">
          <input type="checkbox"
                 value="${regId}"
                 onchange="toggleFilterRegion('${regId}')"
                 ${isChecked ? 'checked' : ''}
                 class="w-4 h-4 rounded text-brand-500 focus:ring-brand-500 accent-brand-500 cursor-pointer shrink-0">
          <span class="font-extrabold text-[11px] sm:text-xs ${isChecked ? 'text-brand-700 font-black' : 'text-slate-700'} truncate">${regName}</span>
        </label>
      `;
    }).join('');
  }

  updateFilterBadges();
  calculateDrawerMatchingCount();
}

function toggleFilterChain(chainId) {
  if (catalogState.selectedChains.has(chainId)) catalogState.selectedChains.delete(chainId);
  else catalogState.selectedChains.add(chainId);
  renderFilterCheckboxes();
}

function toggleFilterRegion(regionId) {
  if (catalogState.selectedRegions.has(regionId)) catalogState.selectedRegions.delete(regionId);
  else catalogState.selectedRegions.add(regionId);
  renderFilterCheckboxes();
}

function clearCheckboxGroup(group) {
  if (group === 'chain') {
    catalogState.selectedChains.clear();
  } else if (group === 'region') {
    catalogState.selectedRegions.clear();
  }
  renderFilterCheckboxes();
}

function switchDrawerTab(tab) {
  activeDrawerTab = tab;
  const tabChains = document.getElementById('tabBtnChains');
  const tabRegions = document.getElementById('tabBtnRegions');
  const contentChains = document.getElementById('drawerTabChainsContent');
  const contentRegions = document.getElementById('drawerTabRegionsContent');

  if (tab === 'chains') {
    if (tabChains) {
      tabChains.className = 'flex-1 py-2 px-3 rounded-xl font-black text-xs text-brand-600 bg-orange-50 border border-brand-200 text-center transition-all cursor-pointer shadow-2xs';
    }
    if (tabRegions) {
      tabRegions.className = 'flex-1 py-2 px-3 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-50 border border-slate-200 text-center transition-all cursor-pointer';
    }
    if (contentChains) contentChains.classList.remove('hidden');
    if (contentRegions) contentRegions.classList.add('hidden');
  } else {
    if (tabRegions) {
      tabRegions.className = 'flex-1 py-2 px-3 rounded-xl font-black text-xs text-brand-600 bg-orange-50 border border-brand-200 text-center transition-all cursor-pointer shadow-2xs';
    }
    if (tabChains) {
      tabChains.className = 'flex-1 py-2 px-3 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-50 border border-slate-200 text-center transition-all cursor-pointer';
    }
    if (contentRegions) contentRegions.classList.remove('hidden');
    if (contentChains) contentChains.classList.add('hidden');
  }
}

function calculateDrawerMatchingCount() {
  const applyBtn = document.getElementById('btnDrawerApplyFilters');
  const cBadge = document.getElementById('drawerBadgeChainsCount');
  const rBadge = document.getElementById('drawerBadgeRegionsCount');

  const cCount = catalogState.selectedChains.size;
  const rCount = catalogState.selectedRegions.size;
  const totalCount = cCount + rCount;

  if (applyBtn) {
    applyBtn.innerText = totalCount > 0 ? `Áp dụng (${totalCount})` : 'Áp dụng';
  }
  if (cBadge) cBadge.innerText = cCount > 0 ? `(${cCount})` : '';
  if (rBadge) rBadge.innerText = rCount > 0 ? `(${rCount})` : '';
}

function updateFilterBadges() {
  const totalActive = catalogState.selectedChains.size + catalogState.selectedRegions.size;
  const drawerBadge = document.getElementById('activeFilterBadgeCount');
  const mobileBadge = document.getElementById('mobileFilterBadgeCount');

  if (drawerBadge) {
    drawerBadge.innerText = String(totalActive);
    drawerBadge.classList.toggle('hidden', totalActive === 0);
    drawerBadge.classList.toggle('inline-flex', totalActive > 0);
  }
  if (mobileBadge) {
    mobileBadge.innerText = String(totalActive);
    mobileBadge.classList.toggle('hidden', totalActive === 0);
    mobileBadge.classList.toggle('inline-flex', totalActive > 0);
  }
}

function resetAllFiltersInDrawer() {
  catalogState.selectedChains.clear();
  catalogState.selectedRegions.clear();
  renderFilterCheckboxes();
}

function resetAllFilters() {
  catalogState.selectedChains.clear();
  catalogState.selectedRegions.clear();
  catalogState.keyword = '';
  const searchInput = document.getElementById('input_search_destination');
  if (searchInput) searchInput.value = '';
  renderFilterCheckboxes();
  applyCatalogFilterDrawer();
  if (typeof showToast === 'function') showToast('Bộ lọc', 'Đã đặt lại toàn bộ điều kiện lọc.');
}

function openFilterDrawer() {
  const drawer = document.getElementById('drawer_search_filter');
  const backdrop = document.getElementById('drawer_filter_backdrop');
  const panel = document.getElementById('drawer_filter_panel');
  if (!drawer || !backdrop || !panel) return;
  renderFilterCheckboxes();
  drawer.classList.remove('hidden');
  setTimeout(() => {
    backdrop.classList.remove('opacity-0');
    backdrop.classList.add('opacity-100');
    panel.classList.remove('translate-x-full');
    panel.classList.add('translate-x-0');
  }, 20);
}

function closeFilterDrawer() {
  const drawer = document.getElementById('drawer_search_filter');
  const backdrop = document.getElementById('drawer_filter_backdrop');
  const panel = document.getElementById('drawer_filter_panel');
  if (!drawer || !backdrop || !panel) return;
  backdrop.classList.remove('opacity-100');
  backdrop.classList.add('opacity-0');
  panel.classList.remove('translate-x-0');
  panel.classList.add('translate-x-full');
  setTimeout(() => drawer.classList.add('hidden'), 300);
}

function applyCatalogFilterDrawer() {
  catalogState.currentPage = 1;
  renderDestinationCards();
  renderPagination();
  updateFilterBadges();
  closeFilterDrawer();
}

// 5. SEARCH & PLACEHOLDER ENGINE
function startDynamicPlaceholderCycle() {
  if (placeholderCycleTimer) clearInterval(placeholderCycleTimer);
  const desktopInput = document.getElementById('input_search_destination');
  const applyPlaceholder = () => {
    const text = dynamicSearchPlaceholders[placeholderCycleIndex % dynamicSearchPlaceholders.length];
    if (desktopInput && !desktopInput.value) desktopInput.placeholder = text;
    placeholderCycleIndex++;
  };
  applyPlaceholder();
  placeholderCycleTimer = setInterval(applyPlaceholder, 3200);
}

function addRecentSearchTerm(term) {
  const clean = (term || '').trim();
  if (!clean) return;
  recentSearchHistory = [clean, ...recentSearchHistory.filter(t => t.toLowerCase() !== clean.toLowerCase())].slice(0, 8);
  saveRecentSearchesToStorage(recentSearchHistory);
  renderRecentAndTrendingTags();
}

function clearRecentSearches() {
  recentSearchHistory = [];
  saveRecentSearchesToStorage([]);
  renderRecentAndTrendingTags();
  if (typeof showToast === 'function') showToast('Lịch sử tìm kiếm', 'Đã xóa toàn bộ lịch sử tìm kiếm gần đây.');
}

function toggleMoreTrendingTags() {
  isTrendingExtraExpanded = !isTrendingExtraExpanded;
  const extraRow = document.getElementById('trendingRowExtra');
  const icon = document.getElementById('iconToggleTrendingRows');
  if (extraRow) {
    extraRow.classList.toggle('hidden', !isTrendingExtraExpanded);
    extraRow.classList.toggle('flex', isTrendingExtraExpanded);
  }
  if (icon) icon.classList.toggle('rotate-180', isTrendingExtraExpanded);
}

function applyTrendingTag(displayTag, filterQuery) {
  const searchInput = document.getElementById('input_search_destination');
  const kw = filterQuery || displayTag.replace(/^#/, '');
  if (searchInput) searchInput.value = kw;
  catalogState.keyword = kw;
  catalogState.currentPage = 1;
  addRecentSearchTerm(displayTag.replace(/^#/, ''));
  syncClearButtonVisibility();
  renderDestinationCards();
  renderPagination();
  closeDesktopSearchDropdown();
}

function renderRecentAndTrendingTags() {
  const recentSection = document.getElementById('recentSearchTagsList');
  const clearBtn = document.getElementById('btnClearRecentTags');
  const trendingList = document.getElementById('trendingTagsList');
  const trendingExtra = document.getElementById('trendingRowExtra');

  if (recentSection) {
    if (!recentSearchHistory.length) {
      recentSection.innerHTML = '<span class="text-[11px] text-slate-400 italic">Chưa có lịch sử tìm kiếm</span>';
      if (clearBtn) clearBtn.classList.add('hidden');
    } else {
      if (clearBtn) clearBtn.classList.remove('hidden');
      recentSection.innerHTML = recentSearchHistory.map(term => {
        const safe = term.replace(/'/g, "\\'");
        return `
          <button type="button" onclick="quickFilterKeyword('${safe}')" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200/90 text-xs font-semibold transition-all cursor-pointer shadow-2xs">
            <i class="fa-solid fa-clock-rotate-left text-[10px] text-slate-400"></i>
            <span>${term}</span>
          </button>
        `;
      }).join('');
    }
  }

  const renderChip = (item) => {
    const sTag = item.tag.replace(/'/g, "\\'");
    const sQuery = item.query.replace(/'/g, "\\'");
    return `
      <button type="button" onclick="applyTrendingTag('${sTag}', '${sQuery}')" class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-orange-50/70 hover:bg-brand-500 text-brand-600 hover:text-white border border-orange-200/90 font-bold text-xs transition-all shadow-2xs cursor-pointer active:scale-95">
        <span>${item.tag}</span>
      </button>
    `;
  };

  if (trendingList) {
    const primaryTags = trendingHashtagsList.slice(0, 5);
    trendingList.innerHTML = primaryTags.map(renderChip).join('');
  }

  if (trendingExtra) {
    const extraTags = trendingHashtagsList.slice(5);
    trendingExtra.innerHTML = extraTags.map(renderChip).join('');
  }
}

function syncClearButtonVisibility() {
  const desktopInput = document.getElementById('input_search_destination');
  const desktopClear = document.getElementById('btnClearCatalogSearch');
  if (desktopClear && desktopInput) {
    const hasVal = desktopInput.value.trim().length > 0;
    desktopClear.classList.toggle('hidden', !hasVal);
    desktopClear.classList.toggle('flex', hasVal);
  }
}

function clearCatalogSearchInput() {
  const desktopInput = document.getElementById('input_search_destination');
  if (desktopInput) desktopInput.value = '';
  catalogState.keyword = '';
  catalogState.currentPage = 1;
  syncClearButtonVisibility();
  renderDestinationCards();
  renderPagination();
  renderSearchSuggestions('');
}

function handleSearchInputChange(val) {
  catalogState.keyword = val.trim();
  syncClearButtonVisibility();
  renderSearchSuggestions(val);
  if (val.trim()) openDesktopSearchDropdown();
}

function handleSearchSubmit() {
  const searchInput = document.getElementById('input_search_destination');
  const kw = searchInput ? searchInput.value.trim() : '';
  catalogState.keyword = kw;
  catalogState.currentPage = 1;
  if (kw) addRecentSearchTerm(kw);
  syncClearButtonVisibility();
  renderDestinationCards();
  renderPagination();
  closeDesktopSearchDropdown();
}

function quickFilterKeyword(kw) {
  const searchInput = document.getElementById('input_search_destination');
  const cleanKw = kw.replace(/^#/, '');
  if (searchInput) searchInput.value = cleanKw;
  catalogState.keyword = cleanKw;
  catalogState.currentPage = 1;
  addRecentSearchTerm(cleanKw);
  syncClearButtonVisibility();
  renderDestinationCards();
  renderPagination();
  closeDesktopSearchDropdown();
}

function handleSortChange(sortVal) {
  catalogState.sortBy = sortVal;
  catalogState.currentPage = 1;
  renderDestinationCards();
  renderPagination();
}

// 6. SUGGESTIONS DROPDOWN
function openDesktopSearchDropdown() {
  const dd = document.getElementById('desktopSearchDropdown');
  if (!dd) return;
  const desktopInput = document.getElementById('input_search_destination');
  renderSearchSuggestions(desktopInput ? desktopInput.value : '');
  dd.classList.remove('hidden');
}

function closeDesktopSearchDropdown() {
  const dd = document.getElementById('desktopSearchDropdown');
  if (dd) dd.classList.add('hidden');
}

function renderSearchSuggestions(val) {
  const kw = (typeof removeVietnameseTones === 'function')
    ? removeVietnameseTones((val || '').trim()).toLowerCase()
    : (val || '').trim().toLowerCase();
  const deskWrap = document.getElementById('desktopSearchSuggestionsWrap');
  const deskList = document.getElementById('desktopSearchSuggestions');
  const deskCount = document.getElementById('desktopSuggestCount');
  const destinations = TecheraDB.getDestinations();

  const matched = kw
    ? destinations.filter(item => {
        const t = (typeof removeVietnameseTones === 'function') ? removeVietnameseTones(item.name).toLowerCase() : item.name.toLowerCase();
        const l = (typeof removeVietnameseTones === 'function') ? removeVietnameseTones(item.region).toLowerCase() : item.region.toLowerCase();
        const c = (typeof removeVietnameseTones === 'function') ? removeVietnameseTones(item.chainLabel).toLowerCase() : item.chainLabel.toLowerCase();
        return t.includes(kw) || l.includes(kw) || c.includes(kw);
      }).slice(0, 6)
    : destinations.slice(0, 4);

  if (deskWrap && deskList) {
    deskWrap.classList.toggle('hidden', !kw && matched.length === 0);
    if (deskCount) deskCount.innerText = kw ? `${matched.length} gợi ý` : 'Nổi bật';
    deskList.innerHTML = matched.length === 0
      ? `<div class="col-span-1 sm:col-span-2 py-3 text-xs text-slate-400 italic text-center">Không tìm thấy vé phù hợp với "${val}"</div>`
      : matched.map(item => `
          <button type="button" onclick="selectSearchSuggestion('${item.id}', '${item.name.replace(/'/g, "\'")}')" class="flex items-center gap-2.5 p-2 rounded-xl border border-slate-100 hover:border-brand-300 hover:bg-orange-50/40 text-left transition-all cursor-pointer">
            <img src="${item.imageUrl}" alt="" class="w-11 h-11 rounded-lg object-cover shrink-0">
            <div class="min-w-0 flex-1">
              <div class="text-xs font-bold text-slate-900 line-clamp-1">${item.name}</div>
              <div class="text-[11px] text-slate-500 flex items-center justify-between gap-2 mt-0.5">
                <span>${item.region}</span>
                <span class="font-extrabold text-brand-600">Từ ${formatMoney(item.fromPrice)} đ</span>
              </div>
            </div>
          </button>
        `).join('');
  }
}

function selectSearchSuggestion(destId, title) {
  addRecentSearchTerm(title);
  closeDesktopSearchDropdown();
  selectDestinationAndProceed(destId);
}

// 7. DESTINATIONS FILTERING & RENDERING
function getFilteredDestinations() {
  let results = [...TecheraDB.getDestinations()];
  if (catalogState.keyword) {
    const rawKw = (typeof removeVietnameseTones === 'function')
      ? removeVietnameseTones(catalogState.keyword).toLowerCase().trim()
      : catalogState.keyword.toLowerCase().trim();
    const compactKw = rawKw.replace(/\s+/g, '');
    results = results.filter(item => {
      const mName = (typeof removeVietnameseTones === 'function') ? removeVietnameseTones(item.name).toLowerCase() : item.name.toLowerCase();
      const mAddr = (typeof removeVietnameseTones === 'function') ? removeVietnameseTones(item.address).toLowerCase() : item.address.toLowerCase();
      const mChain = (typeof removeVietnameseTones === 'function') ? removeVietnameseTones(item.chainLabel).toLowerCase() : item.chainLabel.toLowerCase();
      const mRegion = (typeof removeVietnameseTones === 'function') ? removeVietnameseTones(item.region).toLowerCase() : item.region.toLowerCase();
      const cName = mName.replace(/\s+/g, '');
      const cChain = mChain.replace(/\s+/g, '');

      return mName.includes(rawKw) ||
        mAddr.includes(rawKw) ||
        mChain.includes(rawKw) ||
        mRegion.includes(rawKw) ||
        cName.includes(compactKw) ||
        cChain.includes(compactKw) ||
        (compactKw.includes('sunworld') && (cName.includes('sunworld') || item.chain.includes('SUNWORLD'))) ||
        (compactKw.includes('vinwonder') && (cName.includes('vinwonder') || item.chain.includes('VINWONDERS'))) ||
        (compactKw.includes('novadream') && (cName.includes('novadreams') || item.chain.includes('NOVADREAMS'))) ||
        (compactKw.includes('damsen') && (cName.includes('damsen') || item.chain.includes('DAMSEN')));
    });
  }

  if (catalogState.selectedChains.size > 0) {
    results = results.filter(item => {
      for (const chainId of catalogState.selectedChains) {
        if (matchDestinationChain(item.chain, item.chainLabel, chainId)) return true;
      }
      return false;
    });
  }

  if (catalogState.selectedRegions.size > 0) {
    results = results.filter(item => {
      for (const regId of catalogState.selectedRegions) {
        if (matchDestinationRegion(item.region, regId)) return true;
      }
      return false;
    });
  }

  if (catalogState.sortBy === 'price_asc') results.sort((a, b) => a.fromPrice - b.fromPrice);
  else if (catalogState.sortBy === 'price_desc') results.sort((a, b) => b.fromPrice - a.fromPrice);
  else if (catalogState.sortBy === 'rating_desc') results.sort((a, b) => b.rating - a.rating);
  else results.sort((a, b) => b.popularIndex - a.popularIndex);

  return results;
}

function renderDestinationCards() {
  const container = document.getElementById('destinationGridContainer');
  const countNumEl = document.getElementById('searchResultCountNum');
  if (!container) return;

  const filtered = getFilteredDestinations();
  const hasFilterActive = (catalogState.keyword || catalogState.selectedChains.size > 0 || catalogState.selectedRegions.size > 0);
  if (countNumEl) countNumEl.innerText = hasFilterActive ? String(filtered.length) : '66';

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-1 sm:col-span-2 lg:col-span-3 py-14 text-center bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-3 px-4">
        <div class="w-14 h-14 rounded-full bg-orange-50 text-brand-500 mx-auto flex items-center justify-center text-xl">
          <i class="fa-solid fa-map-location-dot"></i>
        </div>
        <h4 class="font-black text-slate-800 text-base">Không tìm thấy địa điểm phù hợp</h4>
        <p class="text-xs text-slate-500 max-w-sm mx-auto">Vui lòng thử từ khóa khác hoặc bỏ bớt điều kiện trong bộ lọc Tập đoàn &amp; Khu vực.</p>
        <button type="button" onclick="resetAllFilters()" class="px-4 py-2.5 rounded-xl bg-brand-500 text-white font-extrabold text-xs hover:bg-brand-600 transition-colors shadow-xs cursor-pointer">Xóa bộ lọc</button>
      </div>`;
    return;
  }

  const startIndex = (catalogState.currentPage - 1) * catalogState.itemsPerPage;
  let pagedItems = filtered.slice(startIndex, startIndex + catalogState.itemsPerPage);
  if (pagedItems.length === 0 && filtered.length > 0) pagedItems = filtered.slice(0, catalogState.itemsPerPage);

  container.innerHTML = pagedItems.map(item => `
    <div class="card_destination_item bg-white rounded-3xl border border-slate-200/90 hover:border-brand-400 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer"
         onclick="selectDestinationAndProceed('${item.id}')">
      <div class="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-100">
        <img src="${item.imageUrl}" alt="${item.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy">
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        
        <!-- Nhãn khuyến mãi GIẢM GIÁ TRỰC TIẾP ở góc phải -->
        <div class="absolute top-3 right-3">
          <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide bg-emerald-500 text-white shadow-xs border border-emerald-400">GIẢM GIÁ TRỰC TIẾP</span>
        </div>
        
        <!-- Nhãn thương hiệu -->
        <div class="absolute bottom-3 left-3">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-white/95 backdrop-blur-xs text-brand-600 border border-brand-200 shadow-2xs">${item.chainLabel}</span>
        </div>
        
        <!-- Đánh giá sao -->
        <div class="absolute bottom-3 right-3 flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-slate-900/60 backdrop-blur-xs px-2 py-0.5 rounded-md">
          <i class="fa-solid fa-star text-[10px]"></i>
          <span>${item.rating}</span>
        </div>
      </div>

      <div class="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
        <div>
          <h3 class="font-black text-sm sm:text-base text-slate-900 group-hover:text-brand-500 transition-colors line-clamp-1" title="${item.name}">${item.name}</h3>
          <div class="flex items-start gap-1.5 mt-1.5 text-xs text-slate-500">
            <i class="fa-solid fa-location-dot text-brand-500 text-xs shrink-0 mt-0.5"></i>
            <span class="line-clamp-2 leading-relaxed" title="${item.address}">${item.address}</span>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 flex items-end justify-between">
          <div>
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">GIÁ TỪ</span>
            <div class="text-base sm:text-lg font-black text-brand-500 tracking-tight">${formatMoney(item.fromPrice)}đ</div>
          </div>
          <button type="button" class="w-9 h-9 rounded-full bg-brand-50 group-hover:bg-brand-500 text-brand-500 group-hover:text-white flex items-center justify-center transition-all shadow-2xs group-hover:shadow-md cursor-pointer" title="Đặt vé ngay">
            <i class="fa-solid fa-arrow-right text-xs group-hover:translate-x-0.5 transition-transform"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function renderPagination() {
  const paginationNav = document.getElementById('pagination_site_catalog');
  if (!paginationNav) return;
  const filtered = getFilteredDestinations();
  const hasFilterActive = (catalogState.keyword || catalogState.selectedChains.size > 0 || catalogState.selectedRegions.size > 0);
  const totalPages = hasFilterActive ? Math.max(1, Math.ceil(filtered.length / catalogState.itemsPerPage)) : 11;
  const current = catalogState.currentPage;

  let html = `
    <button type="button" onclick="changeCatalogPage(${Math.max(1, current - 1)})" ${current <= 1 ? 'disabled' : ''} class="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-bold text-xs cursor-pointer" title="Trang trước">
      <i class="fa-solid fa-chevron-left text-[10px]"></i>
    </button>`;

  const renderBtn = (pageNum) => {
    const isActive = (pageNum === current);
    return `<button type="button" onclick="changeCatalogPage(${pageNum})" class="w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${isActive ? 'bg-brand-500 text-white shadow-xs font-black' : 'text-slate-700 hover:bg-slate-100'}">${pageNum}</button>`;
  };

  if (totalPages <= 7) {
    for (let p = 1; p <= totalPages; p++) html += renderBtn(p);
  } else {
    html += renderBtn(1);
    if (current > 3) html += '<span class="px-1 text-slate-400 text-xs select-none">...</span>';
    const startRange = Math.max(2, current - 1);
    const endRange = Math.min(totalPages - 1, current + 1);
    for (let p = startRange; p <= endRange; p++) html += renderBtn(p);
    if (current < totalPages - 2) html += '<span class="px-1 text-slate-400 text-xs select-none">...</span>';
    html += renderBtn(totalPages);
  }

  html += `
    <button type="button" onclick="changeCatalogPage(${Math.min(totalPages, current + 1)})" ${current >= totalPages ? 'disabled' : ''} class="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-bold text-xs cursor-pointer" title="Trang tiếp theo">
      <i class="fa-solid fa-chevron-right text-[10px]"></i>
    </button>`;

  paginationNav.innerHTML = html;
}

function changeCatalogPage(page) {
  catalogState.currentPage = page;
  renderDestinationCards();
  renderPagination();
  const grid = document.getElementById('destinationGridContainer');
  if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// 8. DATE & PAX ACCORDION ENGINE (MOBILE & DESKTOP)
function syncDateDisplays() {
  const el1 = document.getElementById('catalogDateDisplayValue');
  const el2 = document.getElementById('catalogQuickDateLabel');

  if (!catalogSelectedDate || !catalogSelectedDate.day) {
    if (el1) {
      el1.innerText = 'Chọn ngày sử dụng';
      el1.className = 'text-xs sm:text-sm font-medium text-slate-400 truncate';
    }
    if (el2) el2.innerText = 'Chọn ngày sử dụng';
    return;
  }

  const dayName = catalogSelectedDate.dayName || computeDayNameVi(catalogSelectedDate.day, catalogSelectedDate.month, catalogSelectedDate.year);
  const pad = n => (n < 10 ? '0' + n : '' + n);
  const dmy = `${pad(catalogSelectedDate.day)}/${pad(catalogSelectedDate.month)}/${catalogSelectedDate.year}`;
  const label = `${dayName}, ${dmy}`;

  if (el1) {
    el1.innerText = label;
    el1.className = 'text-xs sm:text-sm font-black text-slate-800 truncate';
  }
  if (el2) el2.innerText = label;
}

function syncPaxDisplays() {
  const totalPax = (catalogQuickPax.adult || 0) + (catalogQuickPax.child || 0) + (catalogQuickPax.senior || 0);
  const el1 = document.getElementById('catalogPaxDisplayValue');
  const el2 = document.getElementById('catalogQuickPaxLabel');

  if (totalPax <= 0) {
    if (el1) {
      el1.innerText = 'Chọn số lượng khách';
      el1.className = 'text-xs sm:text-sm font-medium text-slate-400 truncate';
    }
    if (el2) el2.innerText = 'Chọn số lượng khách';
  } else {
    const parts = [];
    if (catalogQuickPax.adult > 0) parts.push(`${catalogQuickPax.adult} Người lớn`);
    if (catalogQuickPax.child > 0) parts.push(`${catalogQuickPax.child} Trẻ em`);
    if (catalogQuickPax.senior > 0) parts.push(`${catalogQuickPax.senior} Người cao tuổi`);
    const label = parts.join(', ');

    if (el1) {
      el1.innerText = label;
      el1.className = 'text-xs sm:text-sm font-black text-slate-800 truncate';
    }
    if (el2) el2.innerText = label;
  }

  const aEl = document.getElementById('catalogQuickAdultQty');
  const cEl = document.getElementById('catalogQuickChildQty');
  const sEl = document.getElementById('catalogQuickSeniorQty');
  if (aEl) aEl.innerText = String(catalogQuickPax.adult || 0);
  if (cEl) cEl.innerText = String(catalogQuickPax.child || 0);
  if (sEl) sEl.innerText = String(catalogQuickPax.senior || 0);

  const btnMinusAdult = document.getElementById('btnPaxMinusAdult');
  const btnMinusChild = document.getElementById('btnPaxMinusChild');
  const btnMinusSenior = document.getElementById('btnPaxMinusSenior');

  if (btnMinusAdult) btnMinusAdult.disabled = ((catalogQuickPax.adult || 0) <= 0);
  if (btnMinusChild) btnMinusChild.disabled = ((catalogQuickPax.child || 0) <= 0);
  if (btnMinusSenior) btnMinusSenior.disabled = ((catalogQuickPax.senior || 0) <= 0);
}

function clearCatalogQuickDate() {
  catalogSelectedDate = null;
  catalogQuickDateSelected = false;
  syncDateDisplays();
  renderCatalogDateGrid();
  closeInlineDatePicker();
  try {
    const ctx = (typeof TecheraDB !== 'undefined' && TecheraDB.getBookingContext) ? TecheraDB.getBookingContext() || {} : {};
    ctx.selectedDate = null;
    ctx.hasConfirmedDate = false;
    if (typeof TecheraDB !== 'undefined' && TecheraDB.saveBookingContext) {
      TecheraDB.saveBookingContext(ctx);
    }
  } catch (_) {}
}

function clearCatalogQuickPax() {
  catalogQuickPax = { adult: 0, child: 0, senior: 0 };
  catalogQuickPaxTouched = false;
  syncPaxDisplays();
}

function toggleInlineDatePicker(force) {
  const datePanel = document.getElementById('inlineDatePickerPanel');
  const paxPanel = document.getElementById('inlinePaxPickerPanel');
  const chevronDate = document.getElementById('iconChevronDate');
  const chevronPax = document.getElementById('iconChevronPax');
  if (!datePanel) return;

  const willOpen = (typeof force === 'boolean') ? force : datePanel.classList.contains('hidden');
  if (paxPanel && !paxPanel.classList.contains('hidden')) {
    paxPanel.classList.add('hidden');
    if (chevronPax) chevronPax.classList.remove('rotate-180');
  }

  if (willOpen) {
    renderCatalogDateGrid();
    datePanel.classList.remove('hidden');
    if (chevronDate) chevronDate.classList.add('rotate-180');
  } else {
    datePanel.classList.add('hidden');
    if (chevronDate) chevronDate.classList.remove('rotate-180');
  }
}
window.toggleInlineDatePicker = toggleInlineDatePicker;
window._catalogToggleInlineDatePicker = toggleInlineDatePicker;

function closeInlineDatePicker() {
  const datePanel = document.getElementById('inlineDatePickerPanel');
  const chevronDate = document.getElementById('iconChevronDate');
  if (datePanel) datePanel.classList.add('hidden');
  if (chevronDate) chevronDate.classList.remove('rotate-180');
}
window.closeInlineDatePicker = closeInlineDatePicker;

function toggleInlinePaxPicker(force) {
  const datePanel = document.getElementById('inlineDatePickerPanel');
  const paxPanel = document.getElementById('inlinePaxPickerPanel');
  const chevronDate = document.getElementById('iconChevronDate');
  const chevronPax = document.getElementById('iconChevronPax');
  if (!paxPanel) return;

  const willOpen = (typeof force === 'boolean') ? force : paxPanel.classList.contains('hidden');
  if (datePanel && !datePanel.classList.contains('hidden')) {
    datePanel.classList.add('hidden');
    if (chevronDate) chevronDate.classList.remove('rotate-180');
  }

  if (willOpen) {
    syncPaxDisplays();
    paxPanel.classList.remove('hidden');
    if (chevronPax) chevronPax.classList.add('rotate-180');
  } else {
    paxPanel.classList.add('hidden');
    if (chevronPax) chevronPax.classList.remove('rotate-180');
  }
}
window.toggleInlinePaxPicker = toggleInlinePaxPicker;
window._catalogToggleInlinePaxPicker = toggleInlinePaxPicker;

function closeInlinePaxPicker() {
  const paxPanel = document.getElementById('inlinePaxPickerPanel');
  const chevronPax = document.getElementById('iconChevronPax');
  if (paxPanel) paxPanel.classList.add('hidden');
  if (chevronPax) chevronPax.classList.remove('rotate-180');
}
window.closeInlinePaxPicker = closeInlinePaxPicker;

function confirmInlinePaxPicker() {
  closeInlinePaxPicker();
  syncPaxDisplays();
  try {
    const ctx = (typeof TecheraDB !== 'undefined' && TecheraDB.getBookingContext) ? TecheraDB.getBookingContext() || {} : {};
    ctx.quickPax = { ...catalogQuickPax };
    if (typeof TecheraDB !== 'undefined' && TecheraDB.saveBookingContext) {
      TecheraDB.saveBookingContext(ctx);
    }
  } catch (_) {}
}
window.confirmInlinePaxPicker = confirmInlinePaxPicker;

function openCatalogDatePicker() {
  toggleInlineDatePicker(true);
}

function closeCatalogDatePicker() {
  closeInlineDatePicker();
}

function openCatalogPaxPicker() {
  toggleInlinePaxPicker(true);
}

function closeCatalogPaxPicker() {
  closeInlinePaxPicker();
}

function toggleCatalogDatePopover(e) {
  if (e && e.stopPropagation) e.stopPropagation();
  toggleInlineDatePicker();
}

function toggleCatalogPaxPopover(e) {
  if (e && e.stopPropagation) e.stopPropagation();
  toggleInlinePaxPicker();
}

function changeCatalogDateMonth(delta) {
  const sysToday = getSystemTodayParts();
  let m = catalogDatePickerView.month + delta;
  let y = catalogDatePickerView.year;
  if (m < 1) { m = 12; y -= 1; }
  else if (m > 12) { m = 1; y += 1; }
  if (delta < 0 && isBeforeSystemMonth(y, m, sysToday)) return;
  if (y > sysToday.year + 2) return;
  catalogDatePickerView = { month: m, year: y };
  renderCatalogDateGrid();
}

function renderCatalogDateGrid() {
  const grid = document.getElementById('catalogDateGrid');
  const title = document.getElementById('catalogDateMonthTitle');
  if (!grid) return;
  const { month, year } = catalogDatePickerView;
  if (title) title.innerText = `Tháng ${month} / ${year}`;

  const sysToday = getSystemTodayParts();
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayRaw = new Date(year, month - 1, 1).getDay();
  const offset = (firstDayRaw === 0) ? 6 : (firstDayRaw - 1);

  let html = '';
  for (let i = 0; i < offset; i++) html += '<div></div>';
  for (let d = 1; d <= daysInMonth; d++) {
    const isPast = isBeforeSystemToday(d, month, year, sysToday);
    const isSelected = catalogQuickDateSelected && catalogSelectedDate && catalogSelectedDate.day === d && catalogSelectedDate.month === month && catalogSelectedDate.year === year;
    html += `
      <button type="button" ${isPast ? 'disabled' : ''} onclick="selectCatalogQuickDate(${d}, ${month}, ${year})"
              class="h-9 rounded-xl text-xs font-black flex items-center justify-center transition-all ${isPast ? 'text-slate-300 cursor-not-allowed opacity-40' : isSelected ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25 scale-105 cursor-pointer font-black' : 'text-slate-700 hover:bg-orange-50 hover:text-brand-600 cursor-pointer'}">
        ${d}
      </button>`;
  }
  grid.innerHTML = html;
}

function selectCatalogQuickDate(day, month, year) {
  const dayName = computeDayNameVi(day, month, year);
  catalogSelectedDate = { day, month, year, dayName };
  catalogQuickDateSelected = true;
  syncDateDisplays();
  renderCatalogDateGrid();
  closeInlineDatePicker();
  try {
    const ctx = (typeof TecheraDB !== 'undefined' && TecheraDB.getBookingContext) ? TecheraDB.getBookingContext() || {} : {};
    ctx.selectedDate = { ...catalogSelectedDate };
    ctx.hasConfirmedDate = true;
    if (typeof TecheraDB !== 'undefined' && TecheraDB.saveBookingContext) {
      TecheraDB.saveBookingContext(ctx);
    }
  } catch (_) {}
}

function selectCatalogQuickTodayPreset() {
  const sysToday = getSystemTodayParts();
  selectCatalogQuickDate(sysToday.day, sysToday.month, sysToday.year);
  catalogDatePickerView = { month: sysToday.month, year: sysToday.year };
  renderCatalogDateGrid();
}

function updateCatalogQuickPax(type, delta) {
  if (!Object.prototype.hasOwnProperty.call(catalogQuickPax, type)) return;
  const current = catalogQuickPax[type] || 0;
  const next = current + delta;
  if (next < 0) return;
  catalogQuickPax[type] = Math.min(50, next);
  catalogQuickPaxTouched = true;
  syncPaxDisplays();
}

// 9. PROCEED TO BOOKING (ĐỒNG BỘ TRUYỀN NGÀY & KHÁCH XUYÊN SUỐT SANG BOOKING.HTML)
function selectDestinationAndProceed(destinationId) {
  TecheraDB.saveBookingContext({
    destId: destinationId,
    supplierId: 'partner',
    hasConfirmedDate: !!catalogQuickDateSelected,
    selectedDate: catalogSelectedDate,
    quickPax: { ...catalogQuickPax },
    selectedOrderTickets: {},
    discountRate: 0
  });
  window.location.href = `booking.html?dest=${encodeURIComponent(destinationId)}`;
}

// 10. INITIALIZATION
document.addEventListener('click', (e) => {
  const wrap = document.getElementById('catalogSearchWrapper');
  if (wrap && !wrap.contains(e.target)) closeDesktopSearchDropdown();
});

window.addEventListener('DOMContentLoaded', () => {
  renderSharedShell({ activePage: 'catalog', pageTitle: 'Khám phá Việt Nam' });
  startDynamicPlaceholderCycle();
  syncDateDisplays();
  syncPaxDisplays();
  renderRecentAndTrendingTags();
  renderFilterCheckboxes();
  renderDestinationCards();
  renderPagination();
});

// 11. COMPATIBILITY ALIASES & GLOBAL EXPORTS
window.onCatalogSearchInput = handleSearchInputChange;
window.clearCatalogSearch = clearCatalogSearchInput;
window.changeCatalogCalMonth = changeCatalogDateMonth;
window.clearRecentSearchTags = clearRecentSearches;
window.applySearchTag = applyTrendingTag;
window.toggleMoreTrendingTags = toggleMoreTrendingTags;
window.resetCatalogFilters = resetAllFilters;
window.applyCatalogFilterDrawer = applyCatalogFilterDrawer;
window.openDesktopSearchDropdown = openDesktopSearchDropdown;
window.closeDesktopSearchDropdown = closeDesktopSearchDropdown;
window.toggleCatalogDatePopover = toggleCatalogDatePopover;
window.toggleCatalogPaxPopover = toggleCatalogPaxPopover;
window.updateCatalogQuickPax = updateCatalogQuickPax;
window.openFilterDrawer = openFilterDrawer;
window.closeFilterDrawer = closeFilterDrawer;
window.selectDestinationAndProceed = selectDestinationAndProceed;
window.handleSearchInputChange = handleSearchInputChange;
window.clearCatalogSearchInput = clearCatalogSearchInput;
window.changeCatalogDateMonth = changeCatalogDateMonth;
window.clearRecentSearches = clearRecentSearches;
window.applyTrendingTag = applyTrendingTag;
window.toggleTrendingExtraRow = toggleMoreTrendingTags;
window.resetAllFilters = resetAllFilters;
window.applyFiltersFromDrawer = applyCatalogFilterDrawer;
window.handleSearchSubmit = handleSearchSubmit;
window.handleSortChange = handleSortChange;
window.quickFilterKeyword = quickFilterKeyword;
window.selectSearchSuggestion = selectSearchSuggestion;
window.openCatalogDatePicker = openCatalogDatePicker;
window.closeCatalogDatePicker = closeCatalogDatePicker;
window.openCatalogPaxPicker = openCatalogPaxPicker;
window.closeCatalogPaxPicker = closeCatalogPaxPicker;
window.switchDrawerTab = switchDrawerTab;
window.resetAllFiltersInDrawer = resetAllFiltersInDrawer;
window.selectCatalogQuickDate = selectCatalogQuickDate;
window.selectCatalogQuickTodayPreset = selectCatalogQuickTodayPreset;
window.toggleInlineDatePicker = toggleInlineDatePicker;
window.closeInlineDatePicker = closeInlineDatePicker;
window.toggleInlinePaxPicker = toggleInlinePaxPicker;
window.closeInlinePaxPicker = closeInlinePaxPicker;
window.confirmInlinePaxPicker = confirmInlinePaxPicker;
window.clearCatalogQuickDate = clearCatalogQuickDate;
window.clearCatalogQuickPax = clearCatalogQuickPax;
window.clearCheckboxGroup = clearCheckboxGroup;
 