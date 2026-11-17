// ============================================================================
// BOOKING CART PAGE ENGINE (cart.html)
// ============================================================================

let isCartEditMode = false;
let activeCartDatePkgKey = null;
let cartPickerViewDate = { month: 11, year: 2026 };
let pendingCartDeleteState = null;

function getCartItemDisplayTitle(item) {
  return (item && (item.serviceGroupLabel || item.pkgTitle)) || 'Gói dịch vụ vé';
}

function getPkgGroupKey(item) {
  if (!item) return '';
  const dateStr = formatDateObjDMY(item.usageDate);
  const restId = item.selectedRestaurantId || '';
  const slotId = item.selectedTimeSlotId || '';
  return `${item.destId}___${item.pkgId}___${dateStr}___${restId}___${slotId}`;
}

function getCartGroupedBySiteAndPackage(itemsList) {
  const list = Array.isArray(itemsList) ? itemsList : TecheraDB.getCart();
  const sitesMap = new Map();

  list.forEach(item => {
    if (!sitesMap.has(item.destId)) {
      sitesMap.set(item.destId, {
        destId: item.destId,
        destName: item.destName || 'Khu du lịch',
        destImage: item.destImage || '',
        supplierName: item.supplierName || 'Đối tác KDL',
        pkgGroupsMap: new Map(),
        items: []
      });
    }

    const siteGroup = sitesMap.get(item.destId);
    siteGroup.items.push(item);

    const pkgKey = getPkgGroupKey(item);
    if (!siteGroup.pkgGroupsMap.has(pkgKey)) {
      siteGroup.pkgGroupsMap.set(pkgKey, {
        pkgGroupKey: pkgKey,
        destId: item.destId,
        destName: item.destName || 'Khu du lịch',
        destImage: item.destImage || '',
        supplierId: item.supplierId,
        supplierName: item.supplierName || 'Đối tác KDL',
        pkgId: item.pkgId,
        pkgTitle: item.pkgTitle,
        serviceGroupLabel: item.serviceGroupLabel || item.pkgTitle,
        marketLabel: item.marketLabel || '',
        diningText: item.diningText || '',
        hasDiningConfig: !!item.hasDiningConfig,
        selectedRestaurantId: item.selectedRestaurantId || null,
        selectedTimeSlotId: item.selectedTimeSlotId || null,
        usageDate: item.usageDate,
        discountRate: item.discountRate || 0,
        paxItems: []
      });
    }

    siteGroup.pkgGroupsMap.get(pkgKey).paxItems.push(item);
  });

  const tierOrder = { senior: 1, child: 2, adult: 3 };
  let totalPackagesCount = 0;
  let totalTicketsCount = 0;

  const sites = Array.from(sitesMap.values()).map(site => {
    const pkgGroups = Array.from(site.pkgGroupsMap.values()).map(pkg => {
      // Sắp xếp các đối tượng theo thứ tự: Cao tuổi -> Trẻ em -> Người lớn (khớp sơ đồ đặc tả)
      pkg.paxItems.sort((a, b) => (tierOrder[a.tierKey] || 99) - (tierOrder[b.tierKey] || 99));

      pkg.totalTickets = pkg.paxItems.reduce((sum, i) => sum + (Number(i.qty) || 0), 0);
      pkg.totalAmount = pkg.paxItems.reduce((sum, i) => sum + ((Number(i.qty) || 0) * (Number(i.sellingPrice) || 0)), 0);
      pkg.allChecked = pkg.paxItems.length > 0 && pkg.paxItems.every(i => i.checked);
      pkg.hasCheckedPax = pkg.paxItems.some(i => i.checked);

      totalPackagesCount++;
      totalTicketsCount += pkg.totalTickets;

      return pkg;
    });

    site.pkgGroups = pkgGroups;
    site.allGroupChecked = site.items.length > 0 && site.items.every(i => i.checked);
    site.hasCheckedItems = site.items.some(i => i.checked);
    return site;
  });

  return { sites, totalPackagesCount, totalTicketsCount };
}

function getCartSelectedSnapshot(itemsList) {
  const list = Array.isArray(itemsList) ? itemsList : TecheraDB.getCart().filter(i => i.checked);
  let totalTickets = 0;
  let totalListed = 0;
  let totalPartner = 0;
  let totalActual = 0;
  let hasFloorError = false;

  list.forEach(item => {
    const q = Math.max(0, item.qty || 0);
    totalTickets += q;
    totalListed += q * (item.listedPrice || item.sellingPrice || 0);
    totalPartner += q * (item.netPrice || item.sellingPrice || 0);
    totalActual += q * (item.sellingPrice || 0);
    if (q > 0 && item.sellingPrice < item.netPrice) hasFloorError = true;
  });
  return { totalTickets, totalListed, totalPartner, totalActual, hasFloorError };
}

function renderBookingCartPage() {
  const bookingCartItems = TecheraDB.getCart();
  const container = document.getElementById('cartPageItemsContainer');
  const headerPackagesCountEl = document.getElementById('cartHeaderPackagesCount');
  const headerTotalTicketsBadge = document.getElementById('cartHeaderTotalTicketsBadge');
  const headerCountEl = document.getElementById('cartPageHeaderCount');
  const toggleEditBtn = document.getElementById('btnToggleCartEditMode');
  const batchDeleteBtn = document.getElementById('btnBatchDeleteCartItems');
  const editSelectedCountEl = document.getElementById('cartEditSelectedCount');
  const policyNoticeEl = document.getElementById('cartPolicyNotice');
  const stickyBarEl = document.getElementById('cartStickyBottomBar');
  const selectAllChk = document.getElementById('cartSelectAllCheckbox');
  const stickyAllCountEl = document.getElementById('cartStickyAllCount');
  const stickyTicketsCountEl = document.getElementById('cartStickyTicketsCount');
  const stickyTotalEl = document.getElementById('cartStickyTotalAmount');
  const checkoutSelectedCountEl = document.getElementById('cartCheckoutSelectedCount');
  const checkoutBtn = document.getElementById('btnCheckoutFromCartPage');
  if (!container) return;

  const { sites, totalPackagesCount, totalTicketsCount } = getCartGroupedBySiteAndPackage(bookingCartItems);
  const checkedItems = bookingCartItems.filter(i => i.checked);
  const checkedCount = checkedItems.length;
  const checkedTicketsCount = checkedItems.reduce((sum, i) => sum + (Number(i.qty) || 0), 0);
  const snap = getCartSelectedSnapshot(checkedItems);

  if (headerPackagesCountEl) headerPackagesCountEl.innerText = totalPackagesCount;
  if (headerTotalTicketsBadge) headerTotalTicketsBadge.innerText = `${totalTicketsCount} vé`;
  if (headerCountEl) headerCountEl.innerText = totalPackagesCount;
  if (stickyAllCountEl) stickyAllCountEl.innerText = checkedCount;
  if (stickyTicketsCountEl) stickyTicketsCountEl.innerText = checkedTicketsCount;
  if (stickyTotalEl) stickyTotalEl.innerText = `${formatMoney(snap.totalActual)} đ`;
  if (checkoutSelectedCountEl) checkoutSelectedCountEl.innerText = checkedCount;
  if (checkoutBtn) checkoutBtn.disabled = (checkedCount === 0);

  if (selectAllChk) {
    selectAllChk.disabled = (bookingCartItems.length === 0);
    selectAllChk.checked = (bookingCartItems.length > 0 && checkedCount === bookingCartItems.length);
    selectAllChk.indeterminate = (checkedCount > 0 && checkedCount < bookingCartItems.length);
  }

  if (toggleEditBtn) {
    if (isCartEditMode) {
      toggleEditBtn.innerText = 'Xong';
      toggleEditBtn.className = 'px-4 py-1.5 rounded-full border border-[#F25C22] bg-[#FFF7ED] text-[#F25C22] font-black text-xs transition-colors cursor-pointer shadow-2xs';
    } else {
      toggleEditBtn.innerText = 'Sửa';
      toggleEditBtn.className = 'px-4 py-1.5 rounded-full border border-slate-300 bg-white hover:border-[#F25C22] hover:text-[#F25C22] text-xs font-extrabold text-slate-700 shadow-2xs transition-all cursor-pointer';
    }
    toggleEditBtn.disabled = (bookingCartItems.length === 0);
    toggleEditBtn.classList.toggle('opacity-40', bookingCartItems.length === 0);
  }

  if (batchDeleteBtn) {
    const showBatch = (isCartEditMode && bookingCartItems.length > 0);
    batchDeleteBtn.classList.toggle('hidden', !showBatch);
    batchDeleteBtn.classList.toggle('inline-flex', showBatch);
    batchDeleteBtn.disabled = (checkedCount === 0);
    if (editSelectedCountEl) editSelectedCountEl.innerText = checkedCount;
  }

  if (policyNoticeEl) policyNoticeEl.classList.toggle('hidden', bookingCartItems.length === 0);
  if (stickyBarEl) stickyBarEl.classList.toggle('hidden', bookingCartItems.length === 0);

  if (bookingCartItems.length === 0) {
    container.innerHTML = `
      <div class="py-14 px-5 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white shadow-2xs">
        <div class="w-14 h-14 rounded-full bg-orange-50 text-[#F25C22] flex items-center justify-center mx-auto mb-3 text-xl">
          <i class="fa-solid fa-cart-shopping"></i>
        </div>
        <div class="text-base font-black text-slate-800">Giỏ hàng của bạn đang trống</div>
        <div class="text-xs text-slate-400 mt-1 mb-4">Vui lòng chọn Khu du lịch và thêm các gói dịch vụ vào giỏ hàng.</div>
        <a href="index.html" class="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#F25C22] hover:bg-[#d84814] text-white font-extrabold text-xs shadow-md shadow-orange-500/25 transition-all cursor-pointer">
          <i class="fa-solid fa-ticket"></i>
          <span>Khám phá điểm đến ngay</span>
        </a>
      </div>`;
    updateHeaderCartBadges();
    return;
  }

  let html = '';

  sites.forEach(site => {
    const pkgCardsHtml = site.pkgGroups.map(pkg => {
      const dateStr = formatDateObjDMY(pkg.usageDate);
      const displayTitle = pkg.serviceGroupLabel || pkg.pkgTitle;
      const defaultImg = 'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?auto=format&fit=crop&w=700&q=80';

      // 4. Khối Đối tượng (Pax Breakdown Box)
      const paxRowsHtml = pkg.paxItems.map((item, idx) => {
        const itemLineTotal = (item.qty || 0) * (item.sellingPrice || 0);
        return `
          <div class="space-y-1.5 ${idx > 0 ? 'pt-2.5 border-t border-slate-200/60' : ''}" data-cart-pax-item="${item.cartItemId}">
            <div class="flex items-baseline justify-between gap-2">
              <div class="text-xs font-black text-slate-900 truncate">
                <span>${item.tierLabel}</span>
                ${item.tierCondition ? `<span class="text-slate-400 font-medium text-[11px] ml-1">(${item.tierCondition})</span>` : ''}
              </div>
              <div class="text-xs font-black text-slate-900 whitespace-nowrap">
                ${formatMoney(item.sellingPrice)} đ/vé
              </div>
            </div>
            <div class="flex items-center justify-between gap-2">
              <!-- Bộ điều chỉnh số lượng [ - N + ] dạng viên thuốc -->
              <div class="inline-flex items-center gap-1 bg-white border border-slate-200 rounded-full p-0.5 shadow-2xs">
                <button type="button" onclick="updateCartItemQty('${item.cartItemId}', -1)" title="Giảm số lượng" aria-label="Giảm số lượng ${item.tierLabel}" class="w-6 h-6 rounded-full bg-white hover:bg-slate-100 text-[#334155] font-black text-xs flex items-center justify-center border border-slate-200 cursor-pointer active:scale-95 transition-all">-</button>
                <span class="w-8 text-center text-xs font-black text-slate-900">${item.qty}</span>
                <button type="button" onclick="updateCartItemQty('${item.cartItemId}', 1)" title="Tăng số lượng" aria-label="Tăng số lượng ${item.tierLabel}" class="w-6 h-6 rounded-full bg-[#F25C22] hover:bg-[#d84814] text-white font-black text-xs flex items-center justify-center shadow-2xs cursor-pointer active:scale-95 transition-all">+</button>
              </div>
              <!-- Thành tiền của riêng đối tượng -->
              <div class="text-xs sm:text-sm font-black text-[#F25C22] whitespace-nowrap">
                ${formatMoney(itemLineTotal)} đ
              </div>
            </div>
          </div>`;
      }).join('');

      return `
        <!-- Thẻ Chi tiết Gói dịch vụ (Package Item Card) -->
        <div class="p-3.5 sm:p-4.5 space-y-3.5 ${pkg.allChecked ? 'bg-white' : 'bg-slate-50/40'} transition-colors border-t border-slate-100" data-pkg-group-key="${pkg.pkgGroupKey}">
          <!-- Phần đầu gói: Checkbox, Thumbnail, Tên vé, Badges và Bộ chọn ngày -->
          <div class="flex items-start gap-3">
            <!-- Cột ngoài cùng bên trái: Checkbox & Ảnh đại diện -->
            <div class="pt-0.5 shrink-0 flex items-start gap-2.5">
              <input type="checkbox" ${pkg.allChecked ? 'checked' : ''} onchange="toggleCartPackageSelection('${pkg.pkgGroupKey}', this.checked)" aria-label="Chọn gói ${displayTitle}" class="w-4 h-4 rounded border-slate-300 text-[#F25C22] focus:ring-[#F25C22] cursor-pointer accent-[#F25C22] mt-1 shrink-0">
              <img src="${pkg.destImage || defaultImg}" alt="${displayTitle}" class="w-16 h-16 sm:w-20 sm:h-20 aspect-square object-cover rounded-xl border border-slate-200 shrink-0 bg-slate-100 shadow-2xs">
            </div>

            <!-- Cột thông tin gói bên phải ảnh -->
            <div class="min-w-0 flex-1 space-y-1.5">
              <!-- Hàng 1: Tên vé & Cụm icon thao tác -->
              <div class="flex items-start justify-between gap-2">
                <div class="text-xs sm:text-sm font-black text-slate-900 leading-snug tracking-tight">
                  ${displayTitle}
                </div>
                <div class="flex items-center gap-1 shrink-0">
                  <button type="button" onclick="prepareEditCartPackageInBooking('${pkg.pkgGroupKey}')" title="Chỉnh sửa cấu hình gói" class="w-7 h-7 rounded-lg text-slate-400 hover:text-[#F25C22] hover:bg-orange-50 flex items-center justify-center transition-colors cursor-pointer">
                    <i class="fa-solid fa-pen-to-square text-xs"></i>
                  </button>
                  <button type="button" onclick="requestDeleteCartPackage('${pkg.pkgGroupKey}')" title="Xóa gói khỏi giỏ hàng" class="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer">
                    <i class="fa-regular fa-trash-can text-xs"></i>
                  </button>
                </div>
              </div>

              <!-- Hàng 2: Badge Thị trường áp dụng -->
              ${pkg.marketLabel ? `
                <div>
                  <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-orange-200/90 bg-white text-[11px] font-bold text-[#F25C22] shadow-2xs leading-snug">
                    <i class="fa-solid fa-globe text-blue-500 text-[10px]"></i>
                    <span>Áp dụng cho khách ${pkg.marketLabel}</span>
                  </span>
                </div>` : ''}

              <!-- Hàng 3: Badge Nhà hàng & Khung giờ (Chỉ hiển thị với gói có ẩm thực) -->
              ${pkg.diningText ? `
                <div>
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-orange-200/80 bg-[#FFF7ED] text-[11px] font-bold text-[#F25C22] shadow-2xs leading-snug">
                    <i class="fa-solid fa-utensils text-[9px] text-[#F25C22]"></i>
                    <span>${pkg.diningText}</span>
                  </span>
                </div>` : ''}

              <!-- Hàng 4: Bộ chọn nhanh Ngày sử dụng -->
              <div class="pt-0.5">
                <button type="button" onclick="openCartPackageDatePicker('${pkg.pkgGroupKey}')" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#F1F5F9] hover:bg-orange-50 hover:border-orange-200 border border-slate-200/90 text-xs font-semibold text-slate-700 transition-colors cursor-pointer shadow-2xs">
                  <i class="fa-regular fa-calendar text-[#F25C22] text-xs"></i>
                  <span>Ngày: <strong class="text-slate-900 font-extrabold">${dateStr}</strong></span>
                  <i class="fa-solid fa-chevron-down text-[9px] text-slate-400 ml-0.5"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Khu vực 3: Bảng chi tiết Đối tượng & Số lượng (Pax Breakdown Box) -->
          <div class="rounded-2xl bg-[#F8FAFC] border border-slate-200/80 p-3 sm:p-3.5 space-y-2.5">
            ${paxRowsHtml}
          </div>

          <!-- Khu vực 4: Tổng kết Gói dịch vụ (Package Subtotal Footer) -->
          <div class="flex items-baseline justify-between pt-1">
            <span class="text-xs font-black text-slate-700">Tổng gói (${pkg.totalTickets} vé):</span>
            <span class="text-sm sm:text-base font-black text-slate-900 tracking-tight">${formatMoney(pkg.totalAmount)} đ</span>
          </div>
        </div>`;
    }).join('');

    // 2. Card Nhóm theo Khu du lịch (Site Group Card)
    html += `
      <div class="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden" data-cart-site-group="${site.destId}">
        <!-- 2.1. Header Nhóm Khu du lịch (Site Header) -->
        <div class="px-3.5 sm:px-4 py-3 bg-white flex items-center justify-between gap-2.5">
          <div class="inline-flex items-center gap-2.5 min-w-0 flex-1">
            <input type="checkbox" data-cart-group-checkbox="${site.destId}" ${site.allGroupChecked ? 'checked' : ''} onchange="toggleCartGroupSelection('${site.destId}', this.checked)" aria-label="Chọn toàn bộ ${site.destName}" class="w-4 h-4 rounded border-slate-300 text-[#F25C22] focus:ring-[#F25C22] cursor-pointer accent-[#F25C22] shrink-0">
            <i class="fa-solid fa-store text-[#F25C22] text-xs shrink-0"></i>
            <a href="booking.html?dest=${encodeURIComponent(site.destId)}" title="Xem chi tiết ${site.destName}" class="text-xs sm:text-sm font-black text-slate-900 hover:text-[#F25C22] transition-colors cursor-pointer truncate flex items-center gap-1 group text-left">
              <span>${site.destName}</span>
              <span class="text-slate-400 group-hover:text-[#F25C22] font-normal">›</span>
            </a>
          </div>
          <!-- Nút + Thêm vé -->
          <a href="booking.html?dest=${encodeURIComponent(site.destId)}" title="Đặt thêm dịch vụ tại ${site.destName}" class="px-3 py-1 rounded-full bg-[#FFF7ED] border border-orange-200/80 text-[#F25C22] hover:bg-orange-100 text-xs font-black shrink-0 flex items-center gap-1 transition-colors cursor-pointer shadow-2xs">
            <span>+ Thêm vé</span>
          </a>
        </div>

        <!-- Danh sách các Thẻ Gói vé thuộc KDL -->
        <div class="divide-y divide-slate-100">${pkgCardsHtml}</div>
      </div>`;
  });

  container.innerHTML = html;

  // Cập nhật trạng thái indeterminate cho checkbox KDL
  sites.forEach(site => {
    const chk = document.querySelector(`[data-cart-group-checkbox="${site.destId}"]`);
    if (chk) {
      const cnt = site.items.filter(i => i.checked).length;
      chk.indeterminate = (cnt > 0 && cnt < site.items.length);
    }
  });

  updateHeaderCartBadges();
}

function prepareEditCartPackageInBooking(pkgGroupKey) {
  const items = TecheraDB.getCart();
  const pkgItems = items.filter(i => getPkgGroupKey(i) === pkgGroupKey);
  if (pkgItems.length === 0) return;
  const first = pkgItems[0];

  const ticketEntry = {
    id: first.pkgId,
    isExpanded: true,
    selectedRestaurantId: first.selectedRestaurantId || null,
    selectedTimeSlotId: first.selectedTimeSlotId || null,
    adultQty: 0,
    childQty: 0,
    seniorQty: 0,
    adultSellingPrice: 0,
    childSellingPrice: 0,
    seniorSellingPrice: 0
  };

  pkgItems.forEach(it => {
    if (it.tierKey === 'adult') {
      ticketEntry.adultQty = it.qty;
      ticketEntry.adultSellingPrice = it.sellingPrice;
    } else if (it.tierKey === 'child') {
      ticketEntry.childQty = it.qty;
      ticketEntry.childSellingPrice = it.sellingPrice;
    } else if (it.tierKey === 'senior') {
      ticketEntry.seniorQty = it.qty;
      ticketEntry.seniorSellingPrice = it.sellingPrice;
    }
  });

  TecheraDB.saveBookingContext({
    destId: first.destId,
    supplierId: first.supplierId,
    hasConfirmedDate: true,
    selectedDate: first.usageDate,
    quickPax: { adult: ticketEntry.adultQty, child: ticketEntry.childQty, senior: ticketEntry.seniorQty },
    selectedOrderTickets: { [first.pkgId]: ticketEntry },
    discountRate: first.discountRate || 0
  });

  window.location.href = `booking.html?dest=${encodeURIComponent(first.destId)}`;
}

function toggleCartEditMode() {
  isCartEditMode = !isCartEditMode;
  renderBookingCartPage();
}

function toggleCartGroupSelection(destId, isChecked) {
  const items = TecheraDB.getCart();
  items.forEach(item => {
    if (item.destId === destId) item.checked = !!isChecked;
  });
  TecheraDB.saveCart(items);
  renderBookingCartPage();
}

function toggleCartPackageSelection(pkgGroupKey, isChecked) {
  const items = TecheraDB.getCart();
  items.forEach(item => {
    if (getPkgGroupKey(item) === pkgGroupKey) item.checked = !!isChecked;
  });
  TecheraDB.saveCart(items);
  renderBookingCartPage();
}

function toggleCartSelectAll(isChecked) {
  const items = TecheraDB.getCart();
  items.forEach(item => { item.checked = !!isChecked; });
  TecheraDB.saveCart(items);
  renderBookingCartPage();
}

function updateCartItemQty(cartItemId, delta) {
  const items = TecheraDB.getCart();
  const item = items.find(i => i.cartItemId === cartItemId);
  if (!item) return;

  const currentQty = Number(item.qty) || 1;
  const next = currentQty + delta;

  // Khi người dùng bấm nút - từ 1 xuống 0
  if (next <= 0) {
    const pkgKey = getPkgGroupKey(item);
    const packageItems = items.filter(i => getPkgGroupKey(i) === pkgKey);
    const tierName = item.tierLabel || 'đối tượng';

    if (packageItems.length <= 1) {
      // Ngoại lệ 5: Gói vé chỉ còn duy nhất 1 đối tượng với Số lượng == 1
      openCartDeleteConfirmModal(
        [item.cartItemId],
        'Xác nhận xóa đối tượng',
        'Gói vé phải có tối thiểu 1 khách. Bạn có muốn xóa toàn bộ gói vé này khỏi giỏ hàng không?',
        `Đã xóa toàn bộ gói vé khỏi giỏ hàng.`
      );
    } else {
      // Quy tắc 2: Bật hộp thoại xác nhận xóa đối tượng khỏi gói vé
      openCartDeleteConfirmModal(
        [item.cartItemId],
        'Xác nhận xóa đối tượng',
        `Bạn có muốn xóa đối tượng ${tierName} khỏi gói vé này không?`,
        `Đã xóa đối tượng ${tierName} khỏi gói vé.`
      );
    }
    return;
  }

  const maxCap = item.stockLimit || 50;
  if (next > maxCap) {
    showToast('Vượt hạn mức chỗ', `Ngày ${formatDateObjDMY(item.usageDate)} chỉ còn tối đa ${maxCap} chỗ khả dụng cho dịch vụ này.`, 'error');
    return;
  }
  item.qty = next;
  TecheraDB.saveCart(items);
  renderBookingCartPage();
}

function openCartPackageDatePicker(pkgGroupKey) {
  const items = TecheraDB.getCart();
  const first = items.find(i => getPkgGroupKey(i) === pkgGroupKey);
  if (!first) return;

  activeCartDatePkgKey = pkgGroupKey;
  cartPickerViewDate = {
    month: first.usageDate ? first.usageDate.month : 11,
    year: first.usageDate ? first.usageDate.year : 2026
  };

  const titleEl = document.getElementById('cartDatePickerPkgTitle');
  if (titleEl) titleEl.innerText = `${first.destName} • ${getCartItemDisplayTitle(first)}`;

  renderCartDatePickerGrid();
  const modal = document.getElementById('modalCartDatePicker');
  if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
}

function closeCartDatePickerModal() {
  const modal = document.getElementById('modalCartDatePicker');
  if (modal) { modal.classList.remove('flex'); modal.classList.add('hidden'); }
  activeCartDatePkgKey = null;
}

function changeCartCalendarMonth(delta) {
  let m = cartPickerViewDate.month + delta;
  let y = cartPickerViewDate.year;
  if (m < 1) { m = 12; y--; }
  else if (m > 12) { m = 1; y++; }
  if (y < 2026 || (y === 2026 && m < 10)) {
    showToast('Giới hạn thời gian', 'Không thể lùi về các tháng trong quá khứ.', 'error');
    return;
  }
  if (y > 2028) {
    showToast('Giới hạn thời gian', 'Hệ thống chỉ mở đặt vé tối đa đến hết năm 2028.', 'error');
    return;
  }
  cartPickerViewDate = { month: m, year: y };
  renderCartDatePickerGrid();
}

function renderCartDatePickerGrid() {
  const grid = document.getElementById('cartDatePickerGrid');
  const monthTitle = document.getElementById('cartDatePickerMonthTitle');
  const items = TecheraDB.getCart();
  const first = items.find(i => getPkgGroupKey(i) === activeCartDatePkgKey);
  if (!grid) return;

  const { month, year } = cartPickerViewDate;
  if (monthTitle) monthTitle.innerText = `THÁNG ${month < 10 ? '0' + month : month} / ${year}`;
  const totalDays = new Date(year, month, 0).getDate();
  const firstDayIndex = (new Date(year, month - 1, 1).getDay() + 6) % 7;

  let html = '';
  for (let i = 0; i < firstDayIndex; i++) html += `<div class="h-9"></div>`;
  for (let d = 1; d <= totalDays; d++) {
    const dOfWeek = (firstDayIndex + d - 1) % 7;
    const isWeekend = (dOfWeek === 5 || dOfWeek === 6);
    const isUnavail = isBookingDateUnavailable(d, month, year);
    const isSelected = !!(first && first.usageDate && first.usageDate.day === d && first.usageDate.month === month && first.usageDate.year === year);
    const policy = getDatePricePolicy(d, month, year);

    let cls = 'h-9 rounded-xl text-xs font-bold flex flex-col items-center justify-center transition-all ';
    if (isUnavail) cls += 'bg-slate-100 text-slate-300 line-through cursor-not-allowed';
    else if (isSelected) cls += 'bg-[#F25C22] text-white shadow-sm ring-2 ring-orange-200 cursor-pointer';
    else if (policy.code === 'holiday' || isWeekend) cls += 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 cursor-pointer';
    else cls += 'bg-white hover:bg-orange-50 hover:text-[#F25C22] text-slate-700 border border-slate-200/80 cursor-pointer';

    html += `<button type="button" onclick="applyCartPackageNewDate(${d}, ${month}, ${year})" class="${cls}"><span>${d}</span></button>`;
  }
  grid.innerHTML = html;
}

function applyCartPackageNewDate(day, month, year) {
  const items = TecheraDB.getCart();
  const pkgItems = items.filter(i => getPkgGroupKey(i) === activeCartDatePkgKey);
  if (pkgItems.length === 0) return;

  if (isBookingDateUnavailable(day, month, year)) {
    showToast('Ngày không khả dụng', 'Ngày này đã hết lịch mở bán hoặc tạm bảo trì, vui lòng chọn ngày khác!', 'error');
    return;
  }

  const newDate = { day, month, year, dayName: computeDayNameVi(day, month, year) };
  const newPolicy = getDatePricePolicy(day, month, year);
  let hasPriceChanged = false;
  let hasCapacityAdjusted = false;

  pkgItems.forEach(item => {
    let newListed = item.baseWeekdayListed ? roundPriceThousand(item.baseWeekdayListed * newPolicy.multiplier) : item.listedPrice;
    let newNet = item.baseWeekdayNet ? roundPriceThousand(item.baseWeekdayNet * newPolicy.multiplier) : item.netPrice;
    let newSelling = item.baseWeekdaySelling ? roundPriceThousand(item.baseWeekdaySelling * newPolicy.multiplier) : item.sellingPrice;
    if (newSelling < newNet) newSelling = newNet;
    if (newSelling > newListed) newListed = newSelling;

    if (newSelling !== item.sellingPrice) hasPriceChanged = true;

    const newStockLimit = ((day + (item.pkgId || 1) * 3 + (item.supplierId === 'techera' ? 5 : 2)) % 14) + 5;
    item.usageDate = newDate;
    item.listedPrice = newListed;
    item.netPrice = newNet;
    item.sellingPrice = newSelling;
    item.stockLimit = newStockLimit;

    if (item.qty > newStockLimit) {
      item.qty = newStockLimit;
      hasCapacityAdjusted = true;
    }
  });

  TecheraDB.saveCart(items);
  closeCartDatePickerModal();
  renderBookingCartPage();

  const title = getCartItemDisplayTitle(pkgItems[0]);
  let msg = `Đã đổi ngày sử dụng sang ${formatDateObjDMY(newDate)} (${newPolicy.label}).`;
  if (hasPriceChanged) {
    msg += ' Đơn giá các đối tượng đã tự động cập nhật theo chính sách ngày mới.';
  }
  if (hasCapacityAdjusted) {
    msg += ' (Đã tự động điều chỉnh số lượng theo hạn mức chỗ khả dụng).';
  }
  showToast('Cập nhật ngày sử dụng', msg, 'success');
}

function openCartDeleteConfirmModal(ids, titleText, descText, successMsg = null) {
  pendingCartDeleteState = { ids: Array.isArray(ids) ? ids : [ids], successMsg };
  const titleEl = document.getElementById('cartDeleteConfirmTitle');
  const descEl = document.getElementById('cartDeleteConfirmDesc');
  if (titleEl) titleEl.innerText = titleText;
  if (descEl) descEl.innerText = descText;
  const modal = document.getElementById('modalCartDeleteConfirm');
  if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
}

function closeCartDeleteConfirmModal() {
  const modal = document.getElementById('modalCartDeleteConfirm');
  if (modal) { modal.classList.remove('flex'); modal.classList.add('hidden'); }
  pendingCartDeleteState = null;
}

function requestDeleteCartPackage(pkgGroupKey) {
  const items = TecheraDB.getCart();
  const pkgItems = items.filter(i => getPkgGroupKey(i) === pkgGroupKey);
  if (pkgItems.length === 0) return;
  const first = pkgItems[0];
  const title = getCartItemDisplayTitle(first);
  const totalQty = pkgItems.reduce((sum, i) => sum + (Number(i.qty) || 0), 0);
  const ids = pkgItems.map(i => i.cartItemId);
  openCartDeleteConfirmModal(ids, 'Xóa gói dịch vụ khỏi giỏ hàng?', `Bạn có chắc muốn xóa "${title}" (${totalQty} vé) khỏi giỏ hàng không?`, `Đã xóa gói "${title}" khỏi giỏ hàng.`);
}

function requestBatchDeleteCartItems() {
  const checkedIds = TecheraDB.getCart().filter(i => i.checked).map(i => i.cartItemId);
  if (checkedIds.length === 0) {
    showToast('Chưa chọn mục cần xóa', 'Vui lòng tick chọn ít nhất 01 mục để xóa.', 'error');
    return;
  }
  openCartDeleteConfirmModal(checkedIds, `Xóa ${checkedIds.length} vé đã chọn?`, `Bạn có chắc muốn xóa ${checkedIds.length} vé đang được tick chọn khỏi giỏ hàng không?`, `Đã xóa ${checkedIds.length} vé khỏi giỏ hàng.`);
}

function confirmDeleteCartItems() {
  if (!pendingCartDeleteState || !Array.isArray(pendingCartDeleteState.ids)) return;
  const removeSet = new Set(pendingCartDeleteState.ids);
  const successMsg = pendingCartDeleteState.successMsg;
  let items = TecheraDB.getCart();
  items = items.filter(i => !removeSet.has(i.cartItemId));
  if (items.length === 0) isCartEditMode = false;
  TecheraDB.saveCart(items);
  closeCartDeleteConfirmModal();
  renderBookingCartPage();
  showToast('Đã xóa thành công', successMsg || 'Đã xóa thành công khỏi giỏ hàng.', 'success');
}

function handleCheckoutFromCart() {
  const checkedItems = TecheraDB.getCart().filter(i => i.checked && (i.qty || 0) > 0);
  if (checkedItems.length === 0) {
    showToast('Chưa chọn vé thanh toán', 'Vui lòng tick chọn ít nhất 01 dịch vụ trong giỏ hàng.', 'error');
    return;
  }

  const uniqueSites = [...new Set(checkedItems.map(i => i.destId))];
  if (uniqueSites.length > 1) {
    showToast('Không thể thanh toán các Khu Du Lịch khác nhau!', 'Vui lòng chỉ chọn các gói vé thuộc cùng một Khu du lịch để tiếp tục thanh toán.', 'error');
    return;
  }

  for (const item of checkedItems) {
    if (isBookingDateUnavailable(item.usageDate.day, item.usageDate.month, item.usageDate.year)) {
      showToast('Ngày không khả dụng', `Dịch vụ "${item.pkgTitle}" có ngày sử dụng không khả dụng, vui lòng đổi ngày trước khi thanh toán.`, 'error');
      return;
    }
    if (item.sellingPrice < item.netPrice) {
      showToast('Lỗi giá sàn đối tác', `Dịch vụ "${item.pkgTitle}" có giá thấp hơn giá sàn B2B.`, 'error');
      return;
    }
  }

  TecheraDB.saveCheckoutSession({
    mode: 'cart',
    activeCheckoutCartIds: checkedItems.map(i => i.cartItemId),
    destId: checkedItems[0].destId,
    supplierId: checkedItems[0].supplierId,
    usageDate: checkedItems[0].usageDate
  });
  window.location.href = 'checkout.html?mode=cart';
}

window.addEventListener('DOMContentLoaded', () => {
  renderSharedShell({ activePage: 'cart', pageTitle: 'Giỏ hàng đặt vé', showGlobalHeader: false, hasBottomBar: true });
  renderBookingCartPage();
});

// Compatibility Aliases & Global Exports for cart.html
window.confirmDeleteSelectedCartItems = requestBatchDeleteCartItems;
window.toggleSelectAllCartItems = toggleCartSelectAll;
window.proceedToCheckoutFromCart = handleCheckoutFromCart;
window.closeCartDatePicker = closeCartDatePickerModal;
window.changeCartDatePickerMonth = changeCartCalendarMonth;
window.closeCartDeleteModal = closeCartDeleteConfirmModal;
window.executeCartDeleteConfirmed = confirmDeleteCartItems;
window.toggleCartEditMode = toggleCartEditMode;
window.requestBatchDeleteCartItems = requestBatchDeleteCartItems;
window.toggleCartSelectAll = toggleCartSelectAll;
window.handleCheckoutFromCart = handleCheckoutFromCart;
window.closeCartDatePickerModal = closeCartDatePickerModal;
window.changeCartCalendarMonth = changeCartCalendarMonth;
window.closeCartDeleteConfirmModal = closeCartDeleteConfirmModal;
window.confirmDeleteCartItems = confirmDeleteCartItems;
window.toggleCartGroupSelection = toggleCartGroupSelection;
window.toggleCartPackageSelection = toggleCartPackageSelection;
window.updateCartItemQty = updateCartItemQty;
window.prepareEditCartPackageInBooking = prepareEditCartPackageInBooking;
window.requestDeleteCartPackage = requestDeleteCartPackage;
window.openCartPackageDatePicker = openCartPackageDatePicker;
window.applyCartPackageNewDate = applyCartPackageNewDate;
