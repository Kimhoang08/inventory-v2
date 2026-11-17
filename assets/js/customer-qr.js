// ============================================================================
// CUSTOMER VIETQR PAYMENT PAGE ENGINE (customer-qr.html)
// ============================================================================

let currentQrOrderCode = '';
let currentQrOrderAmount = 0;
let qrCountdownRemainingSeconds = 900;
let qrCountdownTimer = null;
let qrSnapshot = null;

function startQrCountdown(seconds = 900) {
  if (qrCountdownTimer) clearInterval(qrCountdownTimer);
  qrCountdownRemainingSeconds = seconds;
  updateQrCountdownDisplay();
  qrCountdownTimer = setInterval(() => {
    qrCountdownRemainingSeconds--;
    if (qrCountdownRemainingSeconds <= 0) {
      clearInterval(qrCountdownTimer);
      qrCountdownTimer = null;
      showToast('Hết thời gian thanh toán', 'Đã hết thời gian thanh toán, vui lòng tạo đơn mới.', 'error');
      setTimeout(() => { window.location.href = 'checkout.html'; }, 1500);
      return;
    }
    updateQrCountdownDisplay();
  }, 1000);
}

function updateQrCountdownDisplay() {
  const el = document.getElementById('qrCountdownDisplay');
  if (!el) return;
  const m = Math.floor(qrCountdownRemainingSeconds / 60);
  const s = qrCountdownRemainingSeconds % 60;
  el.innerText = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function renderCustomerQrPaymentPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const requestedOrder = urlParams.get('order') || localStorage.getItem('techera_latest_qr_order') || '';
  if (requestedOrder) {
    currentQrOrderCode = requestedOrder;
    qrSnapshot = TecheraDB.getQrOrder(requestedOrder);
  }
  if (!currentQrOrderCode) {
    currentQrOrderCode = 'TEC-ORD-' + Math.floor(100000 + Math.random() * 900000);
  }

  const destId = (qrSnapshot && qrSnapshot.destId) || 'sunworld-bana';
  const supplierId = (qrSnapshot && qrSnapshot.supplierId) || 'partner';
  const usageDate = (qrSnapshot && qrSnapshot.usageDate) || getSystemTodayParts();
  const isCart = !!(qrSnapshot && qrSnapshot.checkoutMode === 'cart');
  const cartItems = isCart ? (qrSnapshot.cartItems || []) : [];
  const selectedTickets = (qrSnapshot && qrSnapshot.selectedTickets) || {};
  const ticketPackages = buildActiveTicketPackages(destId, supplierId, usageDate);

  let customerAmount = 0;
  let ticketsHtml = '';

  if (isCart) {
    cartItems.forEach(ci => {
      if ((ci.qty || 0) <= 0) return;
      const lineCollected = ci.qty * (ci.sellingPrice || 0);
      customerAmount += lineCollected;
      ticketsHtml += `
        <div class="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/80 space-y-2.5">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0 flex-1">
              <div class="text-[10px] font-bold text-brand-600 truncate">${ci.destName}</div>
              <div class="font-extrabold text-slate-900 text-xs sm:text-sm leading-snug">${ci.pkgTitle}</div>
              <div class="mt-1 flex flex-wrap items-center gap-1.5">
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-300 font-extrabold text-[10px]"><i class="fa-solid fa-user-tag text-[9px]"></i><span>${ci.marketLabel || 'Địa phương'}</span></span>
                ${ci.diningText ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-50 text-brand-700 border border-brand-200 font-bold text-[10px]"><i class="fa-solid fa-utensils text-[9px]"></i><span>${ci.diningText}</span></span>` : ''}
              </div>
            </div>
            <div class="text-right shrink-0">
              <span class="text-[10px] text-slate-400 font-semibold block">Tạm tính</span>
              <span class="font-black text-brand-500 text-sm sm:text-base">${formatMoney(lineCollected)} đ</span>
            </div>
          </div>
          <div class="pt-2 border-t border-slate-200/70 flex items-center justify-between text-xs text-slate-700">
            <span class="font-medium"><strong class="text-slate-900 font-bold">${ci.tierLabel}:</strong> ${ci.qty} vé x ${formatMoney(ci.sellingPrice)} đ</span>
            <span class="font-extrabold text-slate-900">${formatMoney(lineCollected)} đ</span>
          </div>
        </div>`;
    });
  } else {
    Object.keys(selectedTickets).forEach(k => {
      const pkgId = parseInt(k, 10);
      const pkg = ticketPackages[pkgId];
      const orderItem = selectedTickets[pkgId];
      if (!pkg || !orderItem) return;
      const totalQty = getPackageTotalQty(orderItem);
      if (totalQty <= 0) return;

      const lineTotal = TICKET_TIER_KEYS.reduce((s, t) => s + (getTierQty(orderItem, t) * getTierPrice(orderItem, pkg, t)), 0);
      customerAmount += lineTotal;
      const diningRest = getSelectedDiningRestaurant(pkg, orderItem);
      const diningSlot = getSelectedDiningSlot(pkg, orderItem);
      const mLabel = pkg.marketLabel || 'Địa phương';

      const tierRows = [];
      TICKET_TIER_KEYS.forEach(t => {
        const cfg = getEffectivePackageTierConfig(pkg, orderItem, t);
        const q = getTierQty(orderItem, t);
        if (cfg && q > 0) {
          const p = getTierPrice(orderItem, pkg, t);
          tierRows.push({ label: cfg.label, qty: q, price: p, total: q * p });
        }
      });

      ticketsHtml += `
        <div class="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/80 space-y-2.5">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0 flex-1">
              <div class="font-extrabold text-slate-900 text-xs sm:text-sm leading-snug">${pkg.title}</div>
              <div class="mt-1 flex flex-wrap items-center gap-1.5">
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-300 font-extrabold text-[10px]"><i class="fa-solid fa-user-tag text-[9px]"></i><span>${mLabel}</span></span>
                ${(pkg.hasDiningConfig && diningRest && diningSlot) ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-50 text-brand-700 border border-brand-200 font-bold text-[10px]"><i class="fa-solid fa-utensils text-[9px]"></i><span>${diningRest.name} • ${diningSlot.timeRange}</span></span>` : ''}
              </div>
            </div>
            <div class="text-right shrink-0">
              <span class="text-[10px] text-slate-400 font-semibold block">Tạm tính</span>
              <span class="font-black text-brand-500 text-sm sm:text-base">${formatMoney(lineTotal)} đ</span>
            </div>
          </div>
          <div class="pt-2 border-t border-slate-200/70 space-y-1.5">
            ${tierRows.map(tr => `<div class="flex items-center justify-between text-xs text-slate-700"><span class="font-medium"><strong class="text-slate-900 font-bold">${tr.label}:</strong> ${tr.qty} vé x ${formatMoney(tr.price)} đ</span><span class="font-extrabold text-slate-900">${formatMoney(tr.total)} đ</span></div>`).join('')}
          </div>
        </div>`;
    });
  }

  currentQrOrderAmount = customerAmount;
  const setTxt = (id, txt) => { const el = document.getElementById(id); if (el) el.innerText = txt; };
  setTxt('qrOrderCodeBadge', currentQrOrderCode);
  setTxt('qrTransferContent', currentQrOrderCode);
  setTxt('qrTotalPayableText', formatMoney(customerAmount) + ' đ');
  setTxt('qrCustomerPayableAmount', formatMoney(customerAmount) + ' đ');

  // Cập nhật Thông tin khách hàng
  const cust = (qrSnapshot && (qrSnapshot.customer || qrSnapshot.customerData)) || {
    fullName: 'Nguyễn Văn Booker',
    phoneNumber: '0909123456',
    email: 'booker.techera@gmail.com'
  };
  setTxt('qrCustomerFullName', cust.fullName || 'Nguyễn Văn Booker');
  setTxt('qrCustomerPhone', cust.phoneNumber || '0909123456');
  setTxt('qrCustomerEmail', cust.email || 'booker.techera@gmail.com');

  const dest = TecheraDB.getDestinationById(destId);
  const sup = getSuppliersForDestination(destId).find(s => s.id === supplierId);
  const destImgEl = document.getElementById('qrDestImage');
  if (destImgEl) destImgEl.src = dest ? dest.imageUrl : '';
  setTxt('qrDestTitle', dest ? dest.name : 'Sun World Ba Na Hills');
  let corpName = 'Tập đoàn Sun World';
  if (dest && dest.chainLabel) {
    if (dest.chainLabel.includes('VINWONDERS')) corpName = 'Tập đoàn VinWonders';
    else if (dest.chainLabel.includes('NOVADREAMS')) corpName = 'Tập đoàn NovaDreams';
    else if (dest.chainLabel.includes('TTC')) corpName = 'Tập đoàn TTC World';
    else if (dest.chainLabel.includes('DAMSEN')) corpName = 'Công viên Đầm Sen';
  }
  const supTitle = sup && sup.id === 'techera' ? 'Nhà cung cấp Techera' : corpName;
  setTxt('qrSupplierTitle', `NCC: ${supTitle}`);
  setTxt('qrUsageDateText', formatDateObjDMY(usageDate));

  const ticketsContainer = document.getElementById('qrTicketsListContainer');
  if (ticketsContainer) ticketsContainer.innerHTML = ticketsHtml || '<div class="text-xs text-slate-400">Chưa có thông tin vé</div>';

  const qrImg = document.getElementById('vietQrImageElement');
  if (qrImg) {
    qrImg.src = `https://api.vietqr.io/image/970422-999988886666-compact2.jpg?amount=${customerAmount}&addInfo=${currentQrOrderCode}&accountName=CTCP%20CONG%20NGHE%20TECHERA`;
  }
  startQrCountdown(900);

  // Đảm bảo không hiển thị nút floating giỏ hàng hoặc speed dial trên trang QR
  const mobCart = document.getElementById('btnMobileFloatingCart');
  if (mobCart) mobCart.remove();
  const deskCart = document.getElementById('btnDesktopFloatingCart');
  if (deskCart) deskCart.remove();
  const speedDial = document.getElementById('floatingSpeedDialWrap');
  if (speedDial) speedDial.remove();
  const footerNav = document.getElementById('globalMobileFooterNav');
  if (footerNav) footerNav.remove();
}

function copyPublicPaymentLink() {
  const url = window.location.href;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => showToast('Đã sao chép link', 'Link thanh toán đơn hàng đã được sao chép.', 'success'));
  } else {
    showToast('Đã tạo link thanh toán', url, 'success');
  }
}

function downloadQrPaymentPoster() {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 760;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 760);
  grad.addColorStop(0, '#FFF7ED');
  grad.addColorStop(1, '#FFFFFF');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 600, 760);
  ctx.fillStyle = '#F15A24';
  ctx.fillRect(0, 0, 600, 100);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('MÃ THANH TOÁN VIETQR TECHERA', 300, 48);
  ctx.font = '14px sans-serif';
  ctx.fillText('Thanh toán đơn hàng nhanh chóng & Nhận vé tức thì', 300, 78);
  ctx.fillStyle = '#1E293B';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('MÃ ĐƠN HÀNG: ' + currentQrOrderCode, 300, 135);
  ctx.fillStyle = '#F15A24';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('SỐ TIỀN: ' + formatMoney(currentQrOrderAmount) + ' đ', 300, 170);
  ctx.fillStyle = '#334155';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Chủ tài khoản: CTCP CÔNG NGHỆ TECHERA', 80, 540);
  ctx.fillText('Ngân hàng: MB Bank (Quân Đội)', 80, 570);
  ctx.fillText('Số tài khoản: 999988886666', 80, 600);
  ctx.fillText('Nội dung chuyển khoản: ' + currentQrOrderCode, 80, 630);
  try {
    const a = document.createElement('a');
    a.download = `Thanh-toan-${currentQrOrderCode}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
    showToast('Đã tải ảnh', `Đã lưu ảnh poster thanh toán ${currentQrOrderCode}.png.`, 'success');
  } catch (_) {
    showToast('Thông báo', 'Vui lòng chụp màn hình mã QR để lưu lại.', 'info');
  }
}

function simulateCustomerPaymentSuccess() {
  if (qrCountdownTimer) { clearInterval(qrCountdownTimer); qrCountdownTimer = null; }
  const orderCode = currentQrOrderCode || ('TEC-ORD-' + Math.floor(100000 + Math.random() * 900000));
  const cust = (qrSnapshot && qrSnapshot.customerData) || {};
  const destId = (qrSnapshot && qrSnapshot.destId) || 'sunworld-bana';
  const dest = TecheraDB.getDestinationById(destId);
  const usageDate = (qrSnapshot && qrSnapshot.usageDate) || getSystemTodayParts();
  const pad = n => String(n).padStart(2, '0');

  const newOrder = {
    orderCode,
    createdDate: REPORT_TODAY,
    useDate: `${usageDate.year}-${pad(usageDate.month)}-${pad(usageDate.day)}`,
    customerName: cust.fullName || 'Khách hàng VietQR',
    customerPhone: cust.phoneNumber || '0909 000 111',
    customerEmail: cust.email || 'booking@techera.vn',
    customerSource: 'Zalo',
    channel: 'Website',
    subType: 'Booking',
    staff: 'Techera B2B',
    salesOwner: 'Nguyễn Văn An (Sale)',
    corp: dest ? dest.chainLabel : 'Sun World',
    site: dest ? dest.name : 'Sun World Ba Na Hills',
    packageName: 'Thanh toán VietQR trực tuyến',
    tickets: 2,
    revenue: currentQrOrderAmount,
    netCost: Math.round(currentQrOrderAmount * 0.85),
    profit: Math.round(currentQrOrderAmount * 0.15),
    status: 'Đã xuất vé',
    paymentMethod: 'VietQR Khách hàng'
  };
  TecheraDB.addOrder(newOrder);
  TecheraDB.pushNotification({
    title: `Thanh toán VietQR thành công #${orderCode}`,
    desc: `Khách đã thanh toán ${formatMoney(currentQrOrderAmount)} đ qua VietQR.`,
    type: 'success'
  });

  if (qrSnapshot && qrSnapshot.checkoutMode === 'cart' && Array.isArray(qrSnapshot.activeCheckoutCartIds)) {
    const paidSet = new Set(qrSnapshot.activeCheckoutCartIds);
    TecheraDB.saveCart(TecheraDB.getCart().filter(i => !paidSet.has(i.cartItemId)));
  }

  const badge = document.getElementById('qrOrderStatusBadge');
  if (badge) {
    badge.className = 'px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-black text-xs flex items-center gap-1.5';
    badge.innerHTML = '<i class="fa-solid fa-check-circle"></i><span>Đã xuất vé thành công</span>';
  }
  showToast('Thanh toán thành công!', `Đơn hàng ${orderCode} đã thanh toán thành công và xuất vé điện tử.`, 'success');
}

window.addEventListener('DOMContentLoaded', () => {
  renderSharedShell({ activePage: 'customer-qr', pageTitle: 'Thanh toán VietQR', showGlobalHeader: false, hideFloatingCart: true });
  renderCustomerQrPaymentPage();
});

// Compatibility Aliases & Global Exports for customer-qr.html
window.downloadQrPosterImage = downloadQrPaymentPoster;
window.simulateWebhookQrPaymentSuccess = simulateCustomerPaymentSuccess;
window.downloadQrPaymentPoster = downloadQrPaymentPoster;
window.simulateCustomerPaymentSuccess = simulateCustomerPaymentSuccess;
window.renderCustomerQrPaymentPage = renderCustomerQrPaymentPage;
window.copyPublicPaymentLink = copyPublicPaymentLink;
