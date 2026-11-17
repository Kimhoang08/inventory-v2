/* ==========================================================================
   Techera Portal — Ví Đại lý & Hồ sơ Tài khoản (wallet.html & account.html)
   Phụ thuộc: db-store.js, utils.js, layout.js
   ========================================================================== */

let selectedWalletTopupMethod = 'vietqr';

function selectWalletTopupPreset(amount) {
  const input = document.getElementById('walletTopupAmountInput');
  if (input) input.value = String(amount);

  document.querySelectorAll('.wallet-preset-btn').forEach(btn => {
    const val = parseInt(btn.getAttribute('data-amount') || '0', 10);
    const active = (val === amount);
    btn.className = active
      ? 'wallet-preset-btn py-2.5 px-3 rounded-xl border-2 border-brand-500 bg-orange-50/70 text-xs font-extrabold text-brand-700 cursor-pointer transition-colors'
      : 'wallet-preset-btn py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-brand-400 hover:bg-orange-50 text-xs font-bold text-slate-700 cursor-pointer transition-colors';
  });
  syncWalletTopupAmountPreview();
}

function selectWalletTopupMethod(method) {
  selectedWalletTopupMethod = method || 'vietqr';
  document.querySelectorAll('.wallet-pm-btn').forEach(btn => {
    const pm = btn.getAttribute('data-wallet-pm');
    const active = (pm === selectedWalletTopupMethod);
    btn.className = active
      ? 'wallet-pm-btn p-3.5 rounded-xl border-2 border-brand-500 bg-orange-50/50 text-left cursor-pointer transition-all'
      : 'wallet-pm-btn p-3.5 rounded-xl border border-slate-200 bg-white hover:border-brand-300 text-left cursor-pointer transition-all';
  });
}

function syncWalletTopupAmountPreview() {
  const input = document.getElementById('walletTopupAmountInput');
  const preview = document.getElementById('walletTopupQrAmountPreview');
  if (!input || !preview) return;
  const val = Math.max(0, parseInt(input.value || '0', 10) || 0);
  preview.innerText = `${formatMoney(val)} đ`;
}

function renderWalletTopupHistory() {
  const histEl = document.getElementById('walletTopupHistoryList');
  if (!histEl) return;
  const wallet = TecheraDB.getWallet();
  const list = wallet.topupHistory || [];
  if (list.length === 0) {
    histEl.innerHTML = `<div class="p-4 text-center text-xs text-slate-400">Chưa có giao dịch nạp tiền gần đây.</div>`;
    return;
  }

  histEl.innerHTML = list.map(item => `
    <div class="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between gap-3">
      <div>
        <div class="font-bold text-emerald-900 text-xs">${item.note || ('Nạp tiền qua ' + (item.method || 'VietQR 24/7'))}</div>
        <div class="text-[11px] text-emerald-700">${item.timeLabel || item.time || 'Vừa xong'} • Mã GD: <span class="font-mono font-semibold">${item.id || item.txCode}</span></div>
      </div>
      <span class="font-black text-emerald-700 text-xs">+${formatMoney(item.amount)} đ</span>
    </div>`).join('');
}

function submitWalletTopup() {
  const input = document.getElementById('walletTopupAmountInput');
  const amount = input ? (parseInt(input.value || '0', 10) || 0) : 10000000;
  if (amount < 100000) {
    showToast('Số tiền chưa hợp lệ', 'Vui lòng nhập số tiền nạp tối thiểu 100.000 đ.', 'error');
    return;
  }

  const methodMap = {
    vietqr: 'VietQR 24/7',
    bank: 'Chuyển khoản ngân hàng B2B',
    vnpay: 'Cổng thanh toán VNPAY'
  };
  const methodLabel = methodMap[selectedWalletTopupMethod] || 'VietQR 24/7';
  const txCode = 'TOPUP-' + Math.floor(10000 + Math.random() * 89999);

  const updatedWallet = TecheraDB.adjustWalletBalance(amount, {
    txCode,
    method: methodLabel,
    time: new Date().toLocaleString('vi-VN', { hour12: false })
  });

  TecheraDB.pushNotification({
    title: 'Nạp tiền Ví thành công',
    message: `Đã cộng +${formatMoney(amount)} đ qua ${methodLabel} (Mã ${txCode}).`,
    time: 'Vừa xong',
    type: 'success'
  });

  syncWalletAndDebtDisplays();
  renderWalletTopupHistory();
  showToast('Nạp tiền ví thành công', `Đã cộng +${formatMoney(amount)} đ vào Ví Đại lý. Số dư mới: ${formatMoney(updatedWallet.balance)} đ.`, 'success');
}

function initAccountProfilePage() {
  const wallet = TecheraDB.getWallet();
  const orders = TecheraDB.getOrders();
  const customers = TecheraDB.getCustomers();

  const setText = (id, v) => { const el = document.getElementById(id); if (el) el.innerText = v; };
  setText('accPageWalletBalance', `${formatMoney(wallet.balance)} đ`);
  setText('accPageDebtAmount', `${formatMoney(wallet.debtUsed || wallet.debt || 0)} đ`);
  setText('accPageTotalOrders', `${orders.length} đơn`);
  setText('accPageTotalCustomers', `${customers.length} khách`);
}

function saveAccountProfileForm(e) {
  if (e) e.preventDefault();
  showToast('Đã lưu hồ sơ', 'Thông tin đại lý và cấu hình xuất hóa đơn VAT đã được cập nhật.', 'success');
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('walletTopupAmountInput')) {
    selectWalletTopupPreset(10000000);
    selectWalletTopupMethod('vietqr');
    renderWalletTopupHistory();
    syncWalletAndDebtDisplays();
  }
  if (document.getElementById('accPageWalletBalance')) {
    initAccountProfilePage();
  }
});

// Compatibility Aliases & Global Exports for wallet.html & account.html
window.selectWalletTopupPreset = selectWalletTopupPreset;
window.selectWalletTopupMethod = selectWalletTopupMethod;
window.syncWalletTopupAmountPreview = syncWalletTopupAmountPreview;
window.submitWalletTopup = submitWalletTopup;
window.saveAccountProfileForm = saveAccountProfileForm;
