// ============================================================================
// CRM CUSTOMERS PAGE ENGINE (crm.html)
// ============================================================================

let crmSourceFilter = 'ALL';
let crmCustomersPage = 1;
const CRM_PAGE_SIZE = 12;

function selectCrmSourceFilter(source) {
  crmSourceFilter = source;
  crmCustomersPage = 1;
  document.querySelectorAll('#crmSourceFilterPills button').forEach(btn => {
    const active = btn.getAttribute('data-crm-source') === source;
    btn.className = active
      ? 'px-3 py-1.5 rounded-full text-xs font-bold border border-brand-500 bg-brand-50 text-brand-600 cursor-pointer'
      : 'px-3 py-1.5 rounded-full text-xs font-bold border border-slate-200 bg-white text-slate-600 hover:border-brand-300 cursor-pointer';
  });
  renderCrmCustomersView();
}

function applyCrmFilters() {
  crmCustomersPage = 1;
  renderCrmCustomersView();
}

function changeCrmCustomersPage(p) {
  crmCustomersPage = p;
  renderCrmCustomersView();
}

function openAddCrmCustomerModal() {
  const modal = document.getElementById('modalAddCrmCustomer');
  if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
}

function closeAddCrmCustomerModal() {
  const modal = document.getElementById('modalAddCrmCustomer');
  if (modal) { modal.classList.remove('flex'); modal.classList.add('hidden'); }
}

function submitAddCrmCustomer(e) {
  e.preventDefault();
  const name = (document.getElementById('newCrmName')?.value || '').trim();
  const phone = (document.getElementById('newCrmPhone')?.value || '').trim();
  const email = (document.getElementById('newCrmEmail')?.value || '').trim();
  const source = document.getElementById('newCrmSource')?.value || 'Zalo';
  const city = (document.getElementById('newCrmCity')?.value || '').trim() || 'TP.HCM';
  const note = (document.getElementById('newCrmNote')?.value || '').trim();

  if (!name || !phone) {
    showToast('Thiếu thông tin', 'Vui lòng nhập Tên khách hàng và Số điện thoại.', 'error');
    return;
  }

  const res = TecheraDB.addCustomer({ name, phone, email, source, city, note });
  if (!res.added) {
    showToast('Khách hàng đã tồn tại', 'Số điện thoại hoặc Email này đã có trong hệ thống CRM.', 'error');
    return;
  }
  closeAddCrmCustomerModal();
  document.getElementById('formAddCrmCustomer')?.reset();
  renderCrmCustomersView();
  showToast('Đã thêm khách hàng', `${name} đã được lưu vào cơ sở dữ liệu CRM.`);
}

function renderCrmCustomersView() {
  const allCustomers = TecheraDB.getCustomersAggregated();

  const summaryEl = document.getElementById('crmSourceSummaryCards');
  if (summaryEl) {
    const totalSpentAll = allCustomers.reduce((s, c) => s + c.totalSpent, 0);
    const sources = [
      { key: 'ALL', label: 'Tổng khách hàng', color: 'text-slate-900', count: allCustomers.length, spent: totalSpentAll },
      ...['Zalo', 'Facebook', 'Email', 'TikTok'].map(src => {
        const list = allCustomers.filter(c => c.source === src);
        return {
          key: src,
          label: `Nguồn ${src}`,
          color: src === 'Zalo' ? 'text-sky-600' : src === 'Facebook' ? 'text-indigo-600' : src === 'Email' ? 'text-amber-600' : 'text-slate-900',
          count: list.length,
          spent: list.reduce((s, c) => s + c.totalSpent, 0)
        };
      })
    ];
    summaryEl.innerHTML = sources.map(s => `
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-3.5 sm:p-4 space-y-1">
        <div class="text-[11px] font-bold text-slate-500 uppercase">${s.label}</div>
        <div class="text-lg sm:text-xl font-black ${s.color}">${s.count} khách</div>
        <div class="text-[11px] font-bold text-emerald-600">${formatMoney(s.spent)} đ</div>
      </div>`).join('');
  }

  const searchEl = document.getElementById('crmSearchInput');
  const sortEl = document.getElementById('crmSortSelect');
  const q = searchEl ? searchEl.value.toLowerCase().trim() : '';
  const sortMode = sortEl ? sortEl.value : 'spent_desc';

  const filtered = allCustomers.filter(c => {
    if (crmSourceFilter !== 'ALL' && c.source !== crmSourceFilter) return false;
    if (q) {
      const hay = `${c.name} ${c.phone} ${c.email} ${c.source} ${c.city || ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  }).sort((a, b) => sortMode === 'orders_desc' ? (b.orderCount - a.orderCount) : (b.totalSpent - a.totalSpent));

  const totalPages = Math.max(1, Math.ceil(filtered.length / CRM_PAGE_SIZE));
  crmCustomersPage = Math.min(Math.max(1, crmCustomersPage), totalPages);
  const slice = filtered.slice((crmCustomersPage - 1) * CRM_PAGE_SIZE, crmCustomersPage * CRM_PAGE_SIZE);

  const tbody = document.getElementById('crmCustomersTableBody');
  if (tbody) {
    tbody.innerHTML = slice.length === 0
      ? `<tr><td colspan="8" class="py-10 text-center text-slate-400 font-semibold">Không có khách hàng nào khớp bộ lọc.</td></tr>`
      : slice.map((c, idx) => `
        <tr class="hover:bg-slate-50/80 transition-colors">
          <td class="py-3 px-4 text-slate-400 font-bold">${(crmCustomersPage - 1) * CRM_PAGE_SIZE + idx + 1}</td>
          <td class="py-3 px-4">
            <div class="font-extrabold text-slate-900">${c.name}</div>
            <div class="text-[10.5px] text-slate-400">${c.tier || 'Khách hàng'} • ${c.city || 'Việt Nam'}</div>
          </td>
          <td class="py-3 px-4 font-semibold text-slate-700">${c.phone}</td>
          <td class="py-3 px-4 text-slate-600">${c.email || '-'}</td>
          <td class="py-3 px-4 text-center">${getCrmSourceBadgeHtml(c.source)}</td>
          <td class="py-3 px-4 text-right font-bold text-slate-700">${c.orderCount} đơn (${c.totalTickets} vé)</td>
          <td class="py-3 px-4 text-right font-black text-brand-600">${formatMoney(c.totalSpent)} đ</td>
          <td class="py-3 px-4 text-slate-500 text-[11px] max-w-[180px] truncate" title="${c.note || ''}">${c.note || '-'}</td>
        </tr>`).join('');
  }

  const mob = document.getElementById('crmCustomersMobileCards');
  if (mob) {
    mob.innerHTML = slice.length === 0
      ? `<div class="py-8 text-center text-xs text-slate-400 font-semibold">Không có khách hàng nào khớp bộ lọc.</div>`
      : slice.map(c => `
        <div class="bg-white rounded-2xl border border-slate-200/80 p-3.5 space-y-1.5 shadow-2xs">
          <div class="flex items-center justify-between gap-2">
            <span class="font-extrabold text-xs text-slate-900">${c.name}</span>
            ${getCrmSourceBadgeHtml(c.source)}
          </div>
          <div class="text-[11px] text-slate-600">${c.phone} • ${c.email || '-'}</div>
          <div class="pt-1.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <span class="text-slate-500">${c.orderCount} đơn (${c.totalTickets} vé)</span>
            <span class="font-black text-brand-600">${formatMoney(c.totalSpent)} đ</span>
          </div>
        </div>`).join('');
  }

  renderGenericPaginationFooter('crmCustomersPaginationFooter', crmCustomersPage, filtered.length, CRM_PAGE_SIZE, 'changeCrmCustomersPage', 'khách hàng');
}

window.addEventListener('DOMContentLoaded', () => {
  renderSharedShell({ activePage: 'crm', pageTitle: 'CRM Quản lý Khách hàng' });
  renderCrmCustomersView();
});

// Compatibility Aliases & Global Exports for crm.html
window.submitNewCrmCustomer = submitAddCrmCustomer;
window.openAddCrmCustomerModal = openAddCrmCustomerModal;
window.closeAddCrmCustomerModal = closeAddCrmCustomerModal;
window.selectCrmSourceFilter = selectCrmSourceFilter;
window.applyCrmFilters = applyCrmFilters;
window.changeCrmCustomersPage = changeCrmCustomersPage;
window.submitAddCrmCustomer = submitAddCrmCustomer;
window.renderCrmCustomersView = renderCrmCustomersView;
