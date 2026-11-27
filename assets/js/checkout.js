// ============================================================================
// CHECKOUT & ORDER CONFIRMATION ENGINE (checkout.html)
// ============================================================================

let checkoutMode = 'detail';
let activeCheckoutCartIds = [];
let currentSelectedDestinationId = 'sunworld-bana';
let currentSelectedSupplierId = 'partner';
let selectedDate = getSystemTodayParts();
let ticketPackages = {};
let selectedOrderTickets = {};

let orderCustomerData = { fullName: '', phoneNumber: '', email: '', note: '' };
let selectedConfirmPaymentMethod = 'wallet';
let currentCheckoutDeficit = 0;
let currentQrOrderCode = '';

let pendingCustomerQrOrder = null;
let customerQrCountdownTimer = null;
let customerQrRemainingSeconds = 1800;

function getActiveCheckoutCartItems() {
  if (checkoutMode !== 'cart') return [];
  const allCart = TecheraDB.getCart();
  if (Array.isArray(activeCheckoutCartIds) && activeCheckoutCartIds.length > 0) {
    const idSet = new Set(activeCheckoutCartIds);
    const matched = allCart.filter(i => idSet.has(i.cartItemId));
    if (matched.length > 0) return matched;
  }
  const checked = allCart.filter(i => i.checked);
  if (checked.length > 0) return checked;
  return allCart;
}

function getOrderTotalsSnapshot() {
  let totalTickets = 0;
  let totalListed = 0;
  let totalPartner = 0;
  let totalActual = 0;
  let hasFloorError = false;
  for (const pkgId in selectedOrderTickets) {
    const item = selectedOrderTickets[pkgId];
    if (!item) continue;
    const pkg = (ticketPackages && ticketPackages[pkgId]) || (ticketPackages ? ticketPackages[parseInt(pkgId, 10)] : null);
    
    // Always count tickets directly from the order item
    const itemTotalQty = getPackageTotalQty(item);
    totalTickets += itemTotalQty;

    TICKET_TIER_KEYS.forEach(t => {
      const cfg = pkg ? getEffectivePackageTierConfig(pkg, item, t) : null;
      const qty = getTierQty(item, t);
      if (qty <= 0) return;
      const sellPrice = getTierPrice(item, pkg, t);
      const listed = cfg ? (cfg.listedPrice || 0) : (sellPrice || 0);
      const net = cfg ? (cfg.netPrice || 0) : (sellPrice || 0);
      totalListed += qty * listed;
      totalPartner += qty * net;
      totalActual += qty * (sellPrice || net);
      if (qty > 0 && sellPrice < net) hasFloorError = true;
    });
  }
  return { totalTickets, totalListed, totalPartner, totalActual, hasFloorError };
}

function getCartSelectedSnapshot(itemsList) {
  let totalTickets = 0;
  let totalListed = 0;
  let totalPartner = 0;
  let totalActual = 0;
  let hasFloorError = false;
  (itemsList || []).forEach(item => {
    const q = Math.max(0, Number(item.qty) || 0);
    totalTickets += q;
    totalListed += q * (item.listedPrice || item.sellingPrice || 0);
    totalPartner += q * (item.netPrice || item.sellingPrice || 0);
    totalActual += q * (item.sellingPrice || 0);
    if (q > 0 && item.sellingPrice < item.netPrice) hasFloorError = true;
  });
  return { totalTickets, totalListed, totalPartner, totalActual, hasFloorError };
}

function getConfirmationTotalsSnapshot() {
  if (checkoutMode === 'cart') return getCartSelectedSnapshot(getActiveCheckoutCartItems());
  return getOrderTotalsSnapshot();
}

function applyPaymentMethodUi(method) {
  selectedConfirmPaymentMethod = method || 'wallet';
  document.querySelectorAll('.confirm-pm-btn').forEach(btn => {
    const pm = btn.getAttribute('data-pm');
    const active = (pm === selectedConfirmPaymentMethod);
    btn.className = active
      ? 'confirm-pm-btn p-4 rounded-2xl border-2 border-[#F25C22] bg-[#FFF8F5] transition-all cursor-pointer text-left block space-y-1.5 select-none'
      : 'confirm-pm-btn p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all cursor-pointer text-left block space-y-1.5 select-none';
  });

  const wallet = TecheraDB.getWallet();
  const balEl = document.getElementById('confirmWalletBalanceDisplay');
  if (balEl) balEl.innerText = `${formatMoney(wallet.balance)} đ`;

  updateConfirmationFinancialSummary();
}

function selectConfirmPaymentMethod(method) {
  selectedConfirmPaymentMethod = method || 'wallet';
  applyPaymentMethodUi(selectedConfirmPaymentMethod);
  if (method === 'vietqr') {
    openCustomerQrNewTab();
  }
}

function openCustomerQrNewTab() {
  saveFormInputsToState();
  const snap = getConfirmationTotalsSnapshot();
  const isCart = (checkoutMode === 'cart');
  const cartItems = isCart ? getActiveCheckoutCartItems() : [];
  const firstCart = cartItems[0] || null;
  const destId = (firstCart ? firstCart.destId : currentSelectedDestinationId) || 'sunworld-bana';
  const supplierId = (firstCart ? firstCart.supplierId : currentSelectedSupplierId) || 'partner';
  const usageDate = isCart && firstCart ? firstCart.usageDate : selectedDate;
  const customerQrAmount = snap.totalActual || snap.totalPartner;

  if (!currentQrOrderCode) {
    currentQrOrderCode = 'TEC-ORD-' + Math.floor(100000 + Math.random() * 900000);
  }

  const customerSnapshot = {
    fullName: (orderCustomerData.fullName || '').trim() || 'Nguyễn Văn Booker',
    phoneNumber: (orderCustomerData.phoneNumber || '').trim() || '0909123456',
    email: (orderCustomerData.email || '').trim() || 'booker.techera@gmail.com',
    note: orderCustomerData.note || ''
  };

  const qrSnapshot = {
    orderCode: currentQrOrderCode,
    checkoutMode,
    destId,
    supplierId,
    usageDate,
    activeCheckoutCartIds,
    cartItems,
    selectedTickets: selectedOrderTickets,
    customer: customerSnapshot,
    customerData: customerSnapshot,
    customerAmount: customerQrAmount,
    totalTickets: snap.totalTickets
  };

  TecheraDB.saveQrOrder(currentQrOrderCode, qrSnapshot);
  recordOrderToSystem('Đợi thanh toán', customerQrAmount, 'Hiển thị mã QR (Thu khách)', currentQrOrderCode);

  window.open(`customer-qr.html?order=${encodeURIComponent(currentQrOrderCode)}`, '_blank');
}

function openQuickWalletModalFromCheckout() {
  const wallet = TecheraDB.getWallet();
  const snap = getConfirmationTotalsSnapshot();
  const finalPayable = snap.totalPartner;
  let deficit = 0;
  if (!wallet.allowNegativeBalance) {
    deficit = Math.max(0, finalPayable - wallet.balance);
  } else {
    const after = wallet.balance - finalPayable;
    if (after < MAX_NEGATIVE_WALLET_LIMIT) {
      deficit = Math.abs(after - MAX_NEGATIVE_WALLET_LIMIT);
    }
  }
  const topupAmount = deficit > 0 ? deficit : (currentCheckoutDeficit || 7760000);
  if (typeof window.openQuickWalletModal === 'function' && window.openQuickWalletModal !== openQuickWalletModalFromCheckout) {
    window.openQuickWalletModal(topupAmount);
  }
}

function updateConfirmationFinancialSummary() {
  const wallet = TecheraDB.getWallet();
  const snap = getConfirmationTotalsSnapshot();
  const finalPayable = snap.totalPartner;

  const setTxt = (id, txt) => { const el = document.getElementById(id); if (el) el.innerText = txt; };
  setTxt('confirmTicketTotalCountBadge', `${snap.totalTickets} vé`);
  setTxt('card2TotalTicketsBadge', `${snap.totalTickets} vé đã chọn`);
  setTxt('confirmTotalListed', `${formatMoney(snap.totalListed)} đ`);
  setTxt('confirmDiscountAmount', `- ${formatMoney(Math.max(0, snap.totalListed - snap.totalPartner))} đ`);
  setTxt('confirmTotalNet', `${formatMoney(snap.totalPartner)} đ`);
  setTxt('order_grand_total', `${formatMoney(finalPayable)} đ`);

  const balEl = document.getElementById('confirmWalletBalanceDisplay');
  if (balEl) balEl.innerText = `${formatMoney(wallet.balance)} đ`;

  const confirmWalletAfterPayStatus = document.getElementById('confirmWalletAfterPayStatus');
  const confirmWalletAfterPayDeficit = document.getElementById('confirmWalletAfterPayDeficit');
  const confirmWalletAfterPay = document.getElementById('confirmWalletAfterPay');
  const btnTopupDeficit = document.getElementById('btnOpenTopupFromDeficit');

  currentCheckoutDeficit = 0;
  let isInsufficientBalance = false;

  if (selectedConfirmPaymentMethod === 'wallet') {
    const walletAfter = wallet.balance - finalPayable;
    if (walletAfter >= 0) {
      if (confirmWalletAfterPayStatus) {
        confirmWalletAfterPayStatus.innerText = `${formatMoney(walletAfter)} đ`;
        confirmWalletAfterPayStatus.className = 'font-bold text-[#0F172A] text-xs sm:text-sm';
      }
      if (confirmWalletAfterPayDeficit) confirmWalletAfterPayDeficit.classList.add('hidden');
      if (confirmWalletAfterPay) {
        confirmWalletAfterPay.innerText = `${formatMoney(walletAfter)} đ`;
        confirmWalletAfterPay.className = 'font-bold text-[#0F172A]';
      }
      if (btnTopupDeficit) btnTopupDeficit.classList.add('hidden');
    } else if (wallet.allowNegativeBalance && walletAfter >= MAX_NEGATIVE_WALLET_LIMIT) {
      if (confirmWalletAfterPayStatus) {
        confirmWalletAfterPayStatus.innerText = `${formatSignedVnd(walletAfter)} (Thấu chi hợp lệ)`;
        confirmWalletAfterPayStatus.className = 'font-bold text-[#0F172A] text-xs sm:text-sm';
      }
      if (confirmWalletAfterPayDeficit) confirmWalletAfterPayDeficit.classList.add('hidden');
      if (confirmWalletAfterPay) {
        confirmWalletAfterPay.innerText = `${formatSignedVnd(walletAfter)} (Thấu chi hợp lệ)`;
        confirmWalletAfterPay.className = 'font-bold text-[#0F172A]';
      }
      if (btnTopupDeficit) btnTopupDeficit.classList.add('hidden');
    } else if (wallet.allowNegativeBalance && walletAfter < MAX_NEGATIVE_WALLET_LIMIT) {
      isInsufficientBalance = true;
      currentCheckoutDeficit = Math.abs(walletAfter - MAX_NEGATIVE_WALLET_LIMIT);
      if (confirmWalletAfterPayStatus) {
        confirmWalletAfterPayStatus.innerText = 'Vượt hạn mức âm';
        confirmWalletAfterPayStatus.className = 'font-bold text-rose-600 text-xs sm:text-sm';
      }
      if (confirmWalletAfterPayDeficit) {
        confirmWalletAfterPayDeficit.innerText = `(Thiếu ${formatMoney(currentCheckoutDeficit)} đ)`;
        confirmWalletAfterPayDeficit.classList.remove('hidden');
      }
      if (confirmWalletAfterPay) {
        confirmWalletAfterPay.innerText = `Vượt hạn mức âm (Thiếu ${formatMoney(currentCheckoutDeficit)} đ)`;
        confirmWalletAfterPay.className = 'font-bold text-rose-600';
      }
      if (btnTopupDeficit) btnTopupDeficit.classList.remove('hidden');
    } else {
      isInsufficientBalance = true;
      currentCheckoutDeficit = Math.abs(walletAfter);
      if (confirmWalletAfterPayStatus) {
        confirmWalletAfterPayStatus.innerText = 'Số dư ví không đủ';
        confirmWalletAfterPayStatus.className = 'font-bold text-rose-600 text-xs sm:text-sm';
      }
      if (confirmWalletAfterPayDeficit) {
        confirmWalletAfterPayDeficit.innerText = `(Thiếu ${formatMoney(currentCheckoutDeficit)} đ)`;
        confirmWalletAfterPayDeficit.classList.remove('hidden');
      }
      if (confirmWalletAfterPay) {
        confirmWalletAfterPay.innerText = `Số dư ví không đủ (Thiếu ${formatMoney(currentCheckoutDeficit)} đ)`;
        confirmWalletAfterPay.className = 'font-bold text-rose-600';
      }
      if (btnTopupDeficit) btnTopupDeficit.classList.remove('hidden');
    }
  } else {
    // Phương thức Hiển thị mã QR
    if (confirmWalletAfterPayStatus) {
      confirmWalletAfterPayStatus.innerText = 'Quét VietQR thu khách (Giữ chỗ 30 phút)';
      confirmWalletAfterPayStatus.className = 'font-bold text-[#0F172A] text-xs sm:text-sm';
    }
    if (confirmWalletAfterPayDeficit) confirmWalletAfterPayDeficit.classList.add('hidden');
    if (confirmWalletAfterPay) {
      confirmWalletAfterPay.innerText = 'Quét VietQR thu khách (Giữ chỗ 30 phút)';
      confirmWalletAfterPay.className = 'font-bold text-[#0F172A]';
    }
    if (btnTopupDeficit) btnTopupDeficit.classList.add('hidden');
  }

  const btnPayNow = document.getElementById('btnFinalPayNow');
  if (btnPayNow) {
    if (snap.totalTickets === 0) {
      btnPayNow.disabled = true;
      btnPayNow.className = 'w-full bg-slate-200 text-slate-400 py-4 px-4 rounded-xl font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-2 shadow-none cursor-not-allowed opacity-70 transition-all select-none';
      btnPayNow.innerHTML = '<span>Chưa có vé để thanh toán</span>';
    } else if (selectedConfirmPaymentMethod === 'wallet' && isInsufficientBalance) {
      btnPayNow.disabled = true;
      btnPayNow.className = 'w-full bg-slate-200 text-slate-400 py-4 px-4 rounded-xl font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-2 shadow-none cursor-not-allowed opacity-75 transition-all select-none';
      btnPayNow.innerHTML = '<span>SỐ DƯ VÍ KHÔNG ĐỦ</span>';
    } else {
      btnPayNow.disabled = false;
      btnPayNow.className = 'w-full bg-[#F25C22] hover:bg-[#d84814] active:scale-[0.99] text-white py-4 px-4 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 transition-all cursor-pointer select-none';
      btnPayNow.innerHTML = '<span>Xác nhận &amp; Thanh toán</span>';
    }
  }
}

function renderOrderConfirmationPage() {
  const nameInput = document.getElementById('cust_full_name');
  const phoneInput = document.getElementById('cust_phone_number');
  const emailInput = document.getElementById('cust_email_address');
  const noteInput = document.getElementById('order_customer_note');
  if (nameInput) nameInput.value = orderCustomerData.fullName || '';
  if (phoneInput) phoneInput.value = orderCustomerData.phoneNumber || '';
  if (emailInput) emailInput.value = orderCustomerData.email || '';
  if (noteInput) { noteInput.value = orderCustomerData.note || ''; updateNoteCharCount(); }
  hideAllCustomerErrors();

  const isCartCheckout = (checkoutMode === 'cart');
  const cartCheckoutItems = isCartCheckout ? getActiveCheckoutCartItems() : [];
  const firstCart = cartCheckoutItems[0] || null;
  const dest = TecheraDB.getDestinationById(firstCart ? firstCart.destId : currentSelectedDestinationId);
  let destName = dest ? dest.name : 'Sun World Ba Na Hills';
  const destImage = dest ? dest.imageUrl : 'assets/images/destinations/sunworld-bana.jpg';
  const suppliers = getSuppliersForDestination(dest ? dest.id : currentSelectedDestinationId);
  const activeSupId = firstCart ? firstCart.supplierId : currentSelectedSupplierId;
  const sup = suppliers.find(s => s.id === activeSupId) || suppliers[0];

  let chainCorpName = 'Tập đoàn Sun World';
  if (dest && dest.chainLabel) {
    if (dest.chainLabel.includes('VINWONDERS')) chainCorpName = 'Tập đoàn VinWonders';
    else if (dest.chainLabel.includes('NOVADREAMS')) chainCorpName = 'Tập đoàn NovaDreams';
    else if (dest.chainLabel.includes('TTC')) chainCorpName = 'Tập đoàn TTC World';
    else if (dest.chainLabel.includes('DAMSEN')) chainCorpName = 'Công viên Đầm Sen';
  }

  let supSubtitle = '';
  if (sup) {
    if (sup.id === 'techera') {
      supSubtitle = `${chainCorpName} • Kho nội bộ Techera`;
    } else if (!sup.name || sup.name === chainCorpName || sup.name.toLowerCase().includes(chainCorpName.toLowerCase())) {
      supSubtitle = `${chainCorpName} • API Đối tác KDL`;
    } else {
      supSubtitle = `${chainCorpName} • ${sup.name}`;
    }
  } else {
    supSubtitle = `${chainCorpName} • API Đối tác KDL`;
  }

  if (isCartCheckout && cartCheckoutItems.length > 0) {
    const uniqueDests = [...new Set(cartCheckoutItems.map(i => i.destName))];
    destName = uniqueDests.length > 1 ? `${uniqueDests.length} Khu du lịch (${uniqueDests.join(', ')})` : uniqueDests[0];
    const uniqueSups = [...new Set(cartCheckoutItems.map(i => i.supplierName || 'Đối tác KDL'))]
      .filter(s => s && s !== chainCorpName && !s.toLowerCase().includes(chainCorpName.toLowerCase()));
    const supsLabel = uniqueSups.length > 0 ? uniqueSups.join(', ') : 'API Đối tác KDL';
    supSubtitle = `${chainCorpName} • ${supsLabel}`;
  }

  const setTxt = (id, txt) => { const el = document.getElementById(id); if (el) el.innerText = txt; };
  setTxt('confirmTopVenueName', destName);
  setTxt('confirmSupplierHeaderInfo', supSubtitle);
  setTxt('card2DestName', destName);
  setTxt('card2SupplierSubtitle', supSubtitle);

  const container = document.getElementById('confirmTicketItemsContainer');
  if (!container) return;

  let html = '';
  let totalTicketsCount = 0;
  let allUsageDatesSet = new Set();

  if (isCartCheckout) {
    // Nhóm các item giỏ hàng theo gói dịch vụ (pkgGroup)
    const pkgGroupsMap = new Map();
    cartCheckoutItems.forEach(item => {
      const dateStr = formatDateObjDMY(item.usageDate);
      allUsageDatesSet.add(dateStr);
      const groupKey = `${item.destId}___${item.pkgId}___${dateStr}___${item.selectedRestaurantId || ''}___${item.selectedTimeSlotId || ''}`;
      if (!pkgGroupsMap.has(groupKey)) {
        pkgGroupsMap.set(groupKey, {
          destName: item.destName || destName,
          destImage: item.destImage || destImage,
          pkgTitle: item.pkgTitle || 'Gói dịch vụ',
          dateStr: dateStr,
          marketLabel: item.marketLabel || 'Ngoại tỉnh',
          diningText: item.diningText || '',
          paxItems: [],
          totalTickets: 0,
          totalSubtotal: 0
        });
      }
      const grp = pkgGroupsMap.get(groupKey);
      const q = Math.max(0, Number(item.qty) || 0);
      grp.paxItems.push(item);
      grp.totalTickets += q;
      grp.totalSubtotal += q * (item.sellingPrice || 0);
      totalTicketsCount += q;
    });

    pkgGroupsMap.forEach(grp => {
      if (grp.totalTickets <= 0) return;

      const paxLinesHtml = grp.paxItems.map(p => `
        <div class="flex items-center justify-between text-xs text-[#475569]">
          <span class="font-normal">${p.tierLabel}: <strong class="font-bold text-[#0F172A]">${p.qty} vé</strong></span>
          <span class="font-bold text-[#0F172A]">${formatMoney(p.sellingPrice)} đ/vé</span>
        </div>
      `).join('');

      const conditionText = [grp.dateStr ? `Ngày sử dụng: ${grp.dateStr}` : '', grp.marketLabel, grp.diningText].filter(Boolean).join(' • ');

      html += `
        <div class="p-4 sm:p-5 rounded-2xl border border-slate-200/90 bg-white space-y-3.5 shadow-2xs">
          <!-- Phần thông tin định danh (Hàng trên) -->
          <div class="flex items-start gap-3">
            <img src="${grp.destImage}" alt="${grp.pkgTitle}" class="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200 shadow-2xs">
            <div class="flex-1 min-w-0">
              <h3 class="text-sm sm:text-base font-bold text-[#0F172A] uppercase leading-snug tracking-tight line-clamp-2">${grp.pkgTitle}</h3>
              ${conditionText ? `<div class="text-xs text-[#475569] font-normal mt-1">${conditionText}</div>` : ''}
            </div>
          </div>

          <!-- Khung chi tiết đối tượng & Tạm tính gói -->
          <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div class="space-y-1.5">${paxLinesHtml}</div>
            <div class="pt-2 border-t border-slate-200/80 flex items-center justify-between">
              <span class="text-xs font-bold text-[#475569] uppercase tracking-wide">TẠM TÍNH:</span>
              <span class="font-black text-base sm:text-lg text-[#F25C22]">${formatMoney(grp.totalSubtotal)} đ</span>
            </div>
          </div>

          <!-- Ghi chú chính sách hoàn/hủy -->
          <div class="bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-[11px] text-[#475569] font-medium">
            <span>Vé không hoàn hủy trong ngày sử dụng • Miễn phí đổi ngày trước 24h.</span>
          </div>
        </div>`;
    });
  } else {
    // Mode 'detail' (mua trực tiếp từ màn hình booking)
    const formattedUsageDate = formatDateObjDMY(selectedDate);
    allUsageDatesSet.add(formattedUsageDate);

    Object.keys(selectedOrderTickets).forEach(k => {
      const pkgId = parseInt(k, 10);
      const pkg = (ticketPackages && ticketPackages[pkgId]) || (ticketPackages ? ticketPackages[k] : null) || { id: pkgId, title: 'Vé tham quan', marketLabel: 'Ngoại tỉnh' };
      const orderItem = selectedOrderTickets[k] || selectedOrderTickets[pkgId];
      if (!orderItem) return;
      const qty = getPackageTotalQty(orderItem);
      if (qty <= 0) return;
      totalTicketsCount += qty;

      let packageSubtotal = 0;
      const tierRows = [];
      TICKET_TIER_KEYS.forEach(t => {
        const cfg = getEffectivePackageTierConfig(pkg, orderItem, t);
        const q = getTierQty(orderItem, t);
        if (!cfg || q <= 0) return;
        const sellPrice = getTierPrice(orderItem, pkg, t);
        packageSubtotal += q * sellPrice;
        tierRows.push(`
          <div class="flex items-center justify-between text-xs text-[#475569]">
            <span class="font-normal">${cfg.label}: <strong class="font-bold text-[#0F172A]">${q} vé</strong></span>
            <span class="font-bold text-[#0F172A]">${formatMoney(sellPrice)} đ/vé</span>
          </div>
        `);
      });

      const diningRest = getSelectedDiningRestaurant(pkg, orderItem);
      const diningSlot = getSelectedDiningSlot(pkg, orderItem);
      const diningText = (pkg.hasDiningConfig && diningRest && diningSlot)
        ? `${diningRest.name} • ${diningSlot.timeRange}`
        : '';
      const marketLabel = pkg.marketLabel || 'Ngoại tỉnh';
      const conditionText = [formattedUsageDate ? `Ngày sử dụng: ${formattedUsageDate}` : '', marketLabel, diningText].filter(Boolean).join(' • ');

      html += `
        <div class="p-4 sm:p-5 rounded-2xl border border-slate-200/90 bg-white space-y-3.5 shadow-2xs">
          <!-- Phần thông tin định danh (Hàng trên) -->
          <div class="flex items-start gap-3">
            <img src="${destImage}" alt="${pkg.title}" class="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200 shadow-2xs">
            <div class="flex-1 min-w-0">
              <h3 class="text-sm sm:text-base font-bold text-[#0F172A] uppercase leading-snug tracking-tight line-clamp-2">${pkg.title}</h3>
              ${conditionText ? `<div class="text-xs text-[#475569] font-normal mt-1">${conditionText}</div>` : ''}
            </div>
          </div>

          <!-- Khung chi tiết đối tượng & Tạm tính gói -->
          <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div class="space-y-1.5">${tierRows.join('')}</div>
            <div class="pt-2 border-t border-slate-200/80 flex items-center justify-between">
              <span class="text-xs font-bold text-[#475569] uppercase tracking-wide">TẠM TÍNH:</span>
              <span class="font-black text-base sm:text-lg text-[#F25C22]">${formatMoney(packageSubtotal)} đ</span>
            </div>
          </div>

          <!-- Ghi chú chính sách hoàn/hủy -->
          <div class="bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-[11px] text-[#475569] font-medium">
            <span>Vé không hoàn hủy trong ngày sử dụng • Miễn phí đổi ngày trước 24h.</span>
          </div>
        </div>`;
    });
  }

  if (!html) {
    html = `
      <div class="py-10 px-4 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white space-y-3">
        <div class="text-sm font-bold text-slate-700">Chưa có sản phẩm nào trong phiên thanh toán</div>
        <div class="flex items-center justify-center gap-2">
          <a href="index.html" class="px-4 py-2 rounded-xl bg-[#F25C22] text-white font-bold text-xs hover:bg-[#d84814]">Khám phá &amp; Đặt vé</a>
          <a href="cart.html" class="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50">Mở Giỏ hàng</a>
        </div>
      </div>`;
  }

  container.innerHTML = html;
  const snap = getConfirmationTotalsSnapshot();
  const displayTotalTickets = (snap && snap.totalTickets > 0) ? snap.totalTickets : totalTicketsCount;
  setTxt('confirmTicketTotalCountBadge', `${displayTotalTickets} vé`);
  setTxt('card2TotalTicketsBadge', `${displayTotalTickets} vé đã chọn`);

  const datesList = Array.from(allUsageDatesSet);
  const formattedDatesSummary = datesList.length > 0 ? datesList.join(', ') : '-';
  setTxt('confirmSummaryDateLabel', formattedDatesSummary);

  applyPaymentMethodUi(selectedConfirmPaymentMethod);
  updateConfirmationFinancialSummary();
}

function autofillAgentInfo() {
  orderCustomerData.fullName = 'Nguyễn Thị Kim Hoàng';
  orderCustomerData.phoneNumber = '0987654321';
  orderCustomerData.email = 'hoangntk@gmail.com';

  const n = document.getElementById('cust_full_name');
  const p = document.getElementById('cust_phone_number');
  const e = document.getElementById('cust_email_address');
  if (n) n.value = orderCustomerData.fullName;
  if (p) p.value = orderCustomerData.phoneNumber;
  if (e) e.value = orderCustomerData.email;

  hideAllCustomerErrors();
  showToast('Điền nhanh thành công', 'Đã dùng thông tin Đại lý (Nguyễn Thị Kim Hoàng - 0987 654 321).', 'info');
}

function openFamiliarCustomerModal() {
  const searchEl = document.getElementById('familiarCustomerSearchInput');
  if (searchEl) searchEl.value = '';
  renderFamiliarCustomerModalList();
  const modal = document.getElementById('modalSelectFamiliarCustomer');
  if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
  if (searchEl) setTimeout(() => searchEl.focus(), 50);
}

function closeFamiliarCustomerModal() {
  const modal = document.getElementById('modalSelectFamiliarCustomer');
  if (modal) { modal.classList.remove('flex'); modal.classList.add('hidden'); }
}

function renderFamiliarCustomerModalList() {
  const listEl = document.getElementById('familiarCustomerModalList');
  if (!listEl) return;
  const searchEl = document.getElementById('familiarCustomerSearchInput');
  const q = searchEl ? searchEl.value.toLowerCase().trim() : '';
  const all = TecheraDB.getCustomersAggregated();
  const filtered = all.filter(c => !q || `${c.name} ${c.phone} ${c.email} ${c.source}`.toLowerCase().includes(q))
    .sort((a, b) => b.totalSpent - a.totalSpent);

  if (filtered.length === 0) {
    listEl.innerHTML = `<div class="py-8 text-center text-xs text-slate-400 font-semibold">Không tìm thấy khách quen phù hợp với "${q}".</div>`;
    return;
  }
  listEl.innerHTML = filtered.map(c => `
    <button type="button" onclick="selectFamiliarCustomer('${c.id}')" class="w-full text-left bg-white hover:bg-orange-50/70 rounded-2xl border border-slate-200 hover:border-orange-300 p-3.5 transition-all cursor-pointer shadow-2xs space-y-1.5 active:scale-[0.99]">
      <div class="flex items-center justify-between gap-2">
        <span class="font-extrabold text-xs sm:text-sm text-slate-900 truncate">${c.name}</span>
        ${getCrmSourceBadgeHtml(c.source)}
      </div>
      <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600">
        <span><i class="fa-solid fa-phone text-[10px] text-slate-400 mr-1"></i><strong class="text-slate-800">${c.phone}</strong></span>
        <span class="truncate"><i class="fa-regular fa-envelope text-[10px] text-slate-400 mr-1"></i>${c.email}</span>
      </div>
      <div class="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
        <span class="text-slate-500">${c.orderCount} đơn đã đặt</span>
        <span class="font-black text-[#F25C22]">Đã chi: ${formatMoney(c.totalSpent)} đ</span>
      </div>
    </button>`).join('');
}

function selectFamiliarCustomer(custId) {
  const cust = TecheraDB.getCustomersAggregated().find(c => c.id === custId);
  if (!cust) return;
  orderCustomerData.fullName = cust.name;
  orderCustomerData.phoneNumber = cust.phone;
  orderCustomerData.email = cust.email;
  const n = document.getElementById('cust_full_name');
  const p = document.getElementById('cust_phone_number');
  const e = document.getElementById('cust_email_address');
  if (n) n.value = cust.name;
  if (p) p.value = cust.phone;
  if (e) e.value = cust.email;
  hideAllCustomerErrors();
  closeFamiliarCustomerModal();
  showToast('Đã chọn khách quen', `Đã điền thông tin ${cust.name} (${cust.phone}).`, 'success');
}

function handleCustomerInput(field, val) {
  orderCustomerData[field] = val;
  if (field === 'note') updateNoteCharCount();
  const map = {
    fullName: ['cust_full_name', 'err_cust_full_name'],
    phoneNumber: ['cust_phone_number', 'err_cust_phone_number'],
    email: ['cust_email_address', 'err_cust_email_address']
  };
  if (map[field]) {
    const inputEl = document.getElementById(map[field][0]);
    const errEl = document.getElementById(map[field][1]);
    if (inputEl) inputEl.classList.remove('border-rose-500', 'ring-2', 'ring-rose-500/20');
    if (errEl) errEl.classList.add('hidden');
  }
}

function updateNoteCharCount() {
  const noteEl = document.getElementById('order_customer_note');
  const countEl = document.getElementById('charCountNote');
  if (noteEl && countEl) countEl.innerText = `${noteEl.value.length}/500 ký tự`;
}

function showFieldError(inputId, errId) {
  const inputEl = document.getElementById(inputId);
  const errEl = document.getElementById(errId);
  if (inputEl) inputEl.classList.add('border-rose-500', 'ring-2', 'ring-rose-500/20');
  if (errEl) errEl.classList.remove('hidden');
}

function hideAllCustomerErrors() {
  ['cust_full_name', 'cust_phone_number', 'cust_email_address'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('border-rose-500', 'ring-2', 'ring-rose-500/20');
  });
  ['err_cust_full_name', 'err_cust_phone_number', 'err_cust_email_address'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });
}

function saveFormInputsToState() {
  const n = document.getElementById('cust_full_name');
  const p = document.getElementById('cust_phone_number');
  const e = document.getElementById('cust_email_address');
  const note = document.getElementById('order_customer_note');
  if (n) orderCustomerData.fullName = n.value;
  if (p) orderCustomerData.phoneNumber = p.value;
  if (e) orderCustomerData.email = e.value;
  if (note) orderCustomerData.note = note.value;
}

function recordOrderToSystem(statusLabel, finalAmount, paymentMethodText = 'Ví điện tử', explicitOrderCode = null) {
  const isCartCheckout = (checkoutMode === 'cart');
  const cartItems = isCartCheckout ? getActiveCheckoutCartItems() : [];
  const firstCart = cartItems[0] || null;
  const dest = TecheraDB.getDestinationById(firstCart ? firstCart.destId : currentSelectedDestinationId);
  const sup = getSuppliersForDestination(dest ? dest.id : currentSelectedDestinationId).find(s => s.id === (firstCart ? firstCart.supplierId : currentSelectedSupplierId));
  const snap = getConfirmationTotalsSnapshot();
  const pad = n => (n < 10 ? '0' + n : '' + n);
  const refDate = firstCart ? firstCart.usageDate : selectedDate;
  const useDateStr = `${refDate.year}-${pad(refDate.month)}-${pad(refDate.day)}`;
  const orderCode = explicitOrderCode || ('TEC-ORD-' + Math.floor(100000 + Math.random() * 900000));
  const custName = (orderCustomerData.fullName || '').trim() || 'Nguyễn Văn Booker';
  const custPhone = (orderCustomerData.phoneNumber || '').trim() || '0909123456';
  const custEmail = (orderCustomerData.email || '').trim() || 'booker.techera@gmail.com';
  const profit = Math.max(0, snap.totalActual - finalAmount);

  // Lưu hoặc cập nhật CRM
  const crmRes = TecheraDB.addCustomer({ fullName: custName, phoneNumber: custPhone, email: custEmail, source: 'Zalo' });

  let siteSummary = dest ? dest.name : 'Sun World Ba Na Hills';
  if (isCartCheckout && cartItems.length > 0) {
    siteSummary = [...new Set(cartItems.map(i => i.destName))].join(', ');
  }

  const newOrder = {
    orderCode,
    createdDate: REPORT_TODAY,
    useDate: useDateStr,
    customerId: crmRes && crmRes.customer ? crmRes.customer.id : undefined,
    customerName: custName,
    customerPhone: custPhone,
    customerEmail: custEmail,
    customerSource: crmRes && crmRes.customer ? crmRes.customer.source : 'Zalo',
    channel: 'Đại lý (TA)',
    subType: '-',
    staff: sup ? sup.name : 'Techera B2B',
    salesOwner: 'Nguyễn Văn An (Sale)',
    corp: dest && dest.chainLabel ? dest.chainLabel : 'Khác',
    site: siteSummary,
    packageName: isCartCheckout && firstCart ? firstCart.pkgTitle : 'Vé tham quan KDL',
    tickets: snap.totalTickets,
    revenue: finalAmount,
    netCost: Math.max(0, finalAmount - profit),
    profit,
    status: statusLabel,
    paymentMethod: paymentMethodText
  };

  TecheraDB.addOrder(newOrder);
  return newOrder;
}

function handleProcessFinalPayment() {
  saveFormInputsToState();
  hideAllCustomerErrors();

  let isValid = true;
  let firstErrorField = null;
  const name = (orderCustomerData.fullName || '').trim();
  const phone = (orderCustomerData.phoneNumber || '').replace(/\s+/g, '');
  const email = (orderCustomerData.email || '').trim();

  const nameRegex = /^[a-zA-ZàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ\s]{2,100}$/;
  if (!name || !nameRegex.test(name)) {
    isValid = false;
    showFieldError('cust_full_name', 'err_cust_full_name');
    firstErrorField = firstErrorField || 'cust_full_name';
  }
  if (!phone || !/^(03|05|07|08|09)[0-9]{8}$/.test(phone)) {
    isValid = false;
    showFieldError('cust_phone_number', 'err_cust_phone_number');
    firstErrorField = firstErrorField || 'cust_phone_number';
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    isValid = false;
    showFieldError('cust_email_address', 'err_cust_email_address');
    firstErrorField = firstErrorField || 'cust_email_address';
  }

  if (!isValid) {
    if (firstErrorField) document.getElementById(firstErrorField)?.focus();
    showToast('Thông tin chưa hợp lệ', 'Vui lòng hoàn thiện đúng định dạng các trường bắt buộc (*).', 'error');
    return;
  }

  const snap = getConfirmationTotalsSnapshot();
  if (snap.totalTickets === 0) {
    showToast('Chưa chọn vé', 'Vui lòng chọn ít nhất 01 vé để tiếp tục.', 'error');
    return;
  }

  const finalPayable = snap.totalPartner;
  const wallet = TecheraDB.getWallet();

  if (selectedConfirmPaymentMethod === 'wallet') {
    const walletAfter = wallet.balance - finalPayable;
    if (!wallet.allowNegativeBalance && walletAfter < 0) {
      updateConfirmationFinancialSummary();
      showToast('Số dư ví không đủ', `Còn thiếu ${formatMoney(Math.abs(walletAfter))} đ. Bấm nút dấu (+) để nạp nhanh.`, 'error');
      return;
    }
    if (wallet.allowNegativeBalance && walletAfter < MAX_NEGATIVE_WALLET_LIMIT) {
      updateConfirmationFinancialSummary();
      showToast('Vượt hạn mức thấu chi', 'Vượt hạn mức âm tối đa -10.000.000 đ.', 'error');
      return;
    }
    TecheraDB.adjustWalletBalance(-finalPayable);
  } else {
    // Phương thức Hiển thị mã QR (Áp dụng cho khách)
    openCustomerQrNewTab();
    showToast('Đơn ở trạng thái Đợi thanh toán', 'Mã QR thu khách đã được mở trong tab mới với hiệu lực giữ chỗ 30 phút.', 'success');
    return;
  }

  const issuedOrder = recordOrderToSystem('Đã xuất vé', finalPayable, 'Ví điện tử');
  TecheraDB.pushNotification({
    title: `Xuất vé thành công #${issuedOrder.orderCode}`,
    desc: `Đã thanh toán ${formatMoney(finalPayable)} đ cho ${issuedOrder.site} (${issuedOrder.tickets} vé).`,
    type: 'success'
  });

  if (checkoutMode === 'cart' && activeCheckoutCartIds.length > 0) {
    const paidSet = new Set(activeCheckoutCartIds);
    TecheraDB.saveCart(TecheraDB.getCart().filter(i => !paidSet.has(i.cartItemId)));
  }

  syncWalletAndDebtDisplays();
  syncNotificationBadges();
  updateHeaderCartBadges();
  showPaymentSuccessModal(issuedOrder.orderCode, finalPayable, 'Ví điện tử');
}

function openCustomerQrPaymentModal(orderObj, customerQrAmount) {
  pendingCustomerQrOrder = { order: orderObj, qrAmount: customerQrAmount };
  customerQrRemainingSeconds = 1800;
  const pad = n => String(n).padStart(2, '0');
  const setTxt = (id, txt) => { const el = document.getElementById(id); if (el) el.innerText = txt; };
  setTxt('customerQrOrderCodeLabel', `Đơn #${orderObj.orderCode} • Đợi thanh toán`);
  setTxt('customerQrPayableAmount', `${formatMoney(customerQrAmount)} đ`);
  setTxt('customerQrMemoLabel', `TT ${orderObj.orderCode}`);
  setTxt('customerQrCountdownLabel', '30:00');

  if (customerQrCountdownTimer) clearInterval(customerQrCountdownTimer);
  customerQrCountdownTimer = setInterval(() => {
    customerQrRemainingSeconds--;
    const m = Math.floor(Math.max(0, customerQrRemainingSeconds) / 60);
    const s = Math.max(0, customerQrRemainingSeconds) % 60;
    setTxt('customerQrCountdownLabel', `${pad(m)}:${pad(s)}`);
    if (customerQrRemainingSeconds <= 0) {
      clearInterval(customerQrCountdownTimer);
      customerQrCountdownTimer = null;
      if (pendingCustomerQrOrder && pendingCustomerQrOrder.order) {
        TecheraDB.updateOrderStatus(pendingCustomerQrOrder.order.orderCode, 'Đã hủy');
        closeCustomerQrPaymentModal();
        showToast('Hết hạn giữ chỗ', `Đơn ${pendingCustomerQrOrder.order.orderCode} đã tự động hủy sau 30 phút.`, 'error');
        pendingCustomerQrOrder = null;
      }
    }
  }, 1000);

  const modal = document.getElementById('modalCustomerQrPayment');
  if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
}

function closeCustomerQrPaymentModal() {
  if (customerQrCountdownTimer) { clearInterval(customerQrCountdownTimer); customerQrCountdownTimer = null; }
  const modal = document.getElementById('modalCustomerQrPayment');
  if (modal) { modal.classList.remove('flex'); modal.classList.add('hidden'); }
}

function simulateCustomerQrPaid() {
  if (!pendingCustomerQrOrder || !pendingCustomerQrOrder.order) return;
  const { order, qrAmount } = pendingCustomerQrOrder;
  TecheraDB.updateOrderStatus(order.orderCode, 'Đã xuất vé');
  closeCustomerQrPaymentModal();
  pendingCustomerQrOrder = null;

  if (checkoutMode === 'cart' && activeCheckoutCartIds.length > 0) {
    const paidSet = new Set(activeCheckoutCartIds);
    TecheraDB.saveCart(TecheraDB.getCart().filter(i => !paidSet.has(i.cartItemId)));
  }
  updateHeaderCartBadges();
  showPaymentSuccessModal(order.orderCode, qrAmount, 'Mã QR Khách hàng');
}

function showPaymentSuccessModal(bookingCode, totalPaid, paymentMethodLabel = 'Ví điện tử') {
  const modal = document.getElementById('modalPaymentSuccess');
  if (!modal) return;
  const isCartCheckout = (checkoutMode === 'cart');
  const cartItems = isCartCheckout ? getActiveCheckoutCartItems() : [];
  const firstCart = cartItems[0] || null;
  const dest = TecheraDB.getDestinationById(firstCart ? firstCart.destId : currentSelectedDestinationId);
  let destName = dest ? dest.name : 'Sun World Ba Na Hills';
  const sup = getSuppliersForDestination(dest ? dest.id : currentSelectedDestinationId).find(s => s.id === (firstCart ? firstCart.supplierId : currentSelectedSupplierId));
  let supText = sup ? `${sup.name} • ${sup.sourceType}` : 'Tập đoàn Sun World';
  let formattedDate = formatDateObjDMY(selectedDate);
  if (isCartCheckout && cartItems.length > 0) {
    destName = [...new Set(cartItems.map(i => i.destName))].join(', ');
    supText = [...new Set(cartItems.map(i => i.supplierName || 'Đối tác KDL'))].join(' • ');
    formattedDate = [...new Set(cartItems.map(i => formatDateObjDMY(i.usageDate)))].join(', ');
  }

  const setTxt = (id, txt) => { const el = document.getElementById(id); if (el) el.innerText = txt; };
  setTxt('successBookingCode', bookingCode);
  setTxt('successDestName', destName);
  setTxt('successSupplierName', supText);
  setTxt('successCustName', orderCustomerData.fullName);
  setTxt('successCustPhone', orderCustomerData.phoneNumber);
  setTxt('successCustEmail', orderCustomerData.email);
  setTxt('successDate', formattedDate);
  setTxt('successPaymentMethodLabel', `Đã thanh toán (${paymentMethodLabel}):`);
  setTxt('successTotalPaid', `${formatMoney(totalPaid)} đ`);

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function handleSaveOrderPendingOrDraft(statusLabel = 'Nháp') {
  saveFormInputsToState();
  const snap = getConfirmationTotalsSnapshot();
  if (snap.totalTickets === 0) {
    showToast('Không thể lưu đơn rỗng', 'Vui lòng chọn ít nhất 01 vé trước khi lưu đơn.', 'error');
    return;
  }
  const orderRec = recordOrderToSystem(statusLabel, snap.totalPartner, 'Chờ thanh toán');
  showToast('Đã lưu đơn thành công', `Đơn #${orderRec.orderCode} (${orderRec.tickets} vé) đã được lưu vào Danh sách đơn hàng với trạng thái ${statusLabel}.`, 'success');
}

function handleEditOrAddMoreTickets() {
  saveFormInputsToState();
  window.location.href = checkoutMode === 'cart' ? 'cart.html' : `booking.html?dest=${encodeURIComponent(currentSelectedDestinationId)}`;
}

function handleGoBackToBooking() {
  saveFormInputsToState();
  const isCart = (checkoutMode === 'cart');
  const cartItems = isCart ? getActiveCheckoutCartItems() : [];
  const destId = (cartItems[0] ? cartItems[0].destId : currentSelectedDestinationId) || 'sunworld-bana';
  window.location.href = `booking.html?dest=${encodeURIComponent(destId)}`;
}

window.addEventListener('DOMContentLoaded', () => {
  renderSharedShell({ activePage: 'checkout', pageTitle: 'Xác nhận đơn hàng', showGlobalHeader: false, hasBottomBar: true });

  const urlParams = new URLSearchParams(window.location.search);
  const reqMode = urlParams.get('mode');
  const session = TecheraDB.getCheckoutSession();
  const allCart = TecheraDB.getCart();

  if (reqMode === 'cart' || (session && session.mode === 'cart')) {
    checkoutMode = 'cart';
    if (session && Array.isArray(session.activeCheckoutCartIds) && session.activeCheckoutCartIds.length > 0) {
      activeCheckoutCartIds = session.activeCheckoutCartIds;
    } else {
      const checked = allCart.filter(i => i.checked);
      activeCheckoutCartIds = (checked.length > 0 ? checked : allCart).map(i => i.cartItemId);
    }
  } else if (session && session.mode === 'detail') {
    checkoutMode = 'detail';
    currentSelectedDestinationId = session.destId || 'sunworld-bana';
    currentSelectedSupplierId = session.supplierId || 'partner';
    selectedDate = session.usageDate || getSystemTodayParts();
    ticketPackages = buildActiveTicketPackages(currentSelectedDestinationId, currentSelectedSupplierId, selectedDate);
    selectedOrderTickets = session.selectedOrderTickets || {};
  } else if (allCart.length > 0) {
    checkoutMode = 'cart';
    const checked = allCart.filter(i => i.checked);
    activeCheckoutCartIds = (checked.length > 0 ? checked : allCart).map(i => i.cartItemId);
  } else {
    checkoutMode = 'detail';
    currentSelectedDestinationId = 'sunworld-bana';
    currentSelectedSupplierId = 'partner';
    selectedDate = getSystemTodayParts();
    ticketPackages = buildActiveTicketPackages(currentSelectedDestinationId, currentSelectedSupplierId, selectedDate);
  }

  renderOrderConfirmationPage();
});

// Compatibility Aliases & Global Exports
window.goBackFromConfirmation = handleEditOrAddMoreTickets;
window.validateCustomerField = handleCustomerInput;
window.openCustomerQrPaymentPage = openCustomerQrPaymentModal;
window.openCustomerQrNewTab = openCustomerQrNewTab;
window.renderFamiliarCustomersList = renderFamiliarCustomerModalList;
window.closeCustomerQrModal = closeCustomerQrPaymentModal;
window.simulateQrModalSuccess = simulateCustomerQrPaid;
window.selectConfirmPaymentMethod = selectConfirmPaymentMethod;
window.openQuickWalletModalFromCheckout = openQuickWalletModalFromCheckout;
window.handleProcessFinalPayment = handleProcessFinalPayment;
window.openFamiliarCustomerModal = openFamiliarCustomerModal;
window.closeFamiliarCustomerModal = closeFamiliarCustomerModal;
window.handleEditOrAddMoreTickets = handleEditOrAddMoreTickets;
window.handleGoBackToBooking = handleGoBackToBooking;
window.handleCustomerInput = handleCustomerInput;
window.openCustomerQrPaymentModal = openCustomerQrPaymentModal;
window.renderFamiliarCustomerModalList = renderFamiliarCustomerModalList;
window.closeCustomerQrPaymentModal = closeCustomerQrPaymentModal;
window.simulateCustomerQrPaid = simulateCustomerQrPaid;
window.openQuickWalletModalFromCheckout = openQuickWalletModalFromCheckout;
window.autofillAgentInfo = autofillAgentInfo;
window.selectFamiliarCustomer = selectFamiliarCustomer;
window.updateNoteCharCount = updateNoteCharCount;
window.handleSaveOrderPendingOrDraft = handleSaveOrderPendingOrDraft;
