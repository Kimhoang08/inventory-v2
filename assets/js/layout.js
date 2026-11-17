// ============================================================================
// SHARED APPLICATION LAYOUT SHELL (SIDEBAR, HEADER, SPEED DIAL, BOTTOM NAV, MODALS)
// ============================================================================

let isSidebarExpanded = true;
let isMobileSidebarOpen = false;
let isFloatingSpeedDialOpen = false;
let quickWalletOpenedFromCheckout = false;

function buildSidebarLinkClasses(isActive) {
  if (isActive) {
    return 'nav-item-btn flex items-center px-3 py-2.5 rounded-xl text-brand-600 bg-brand-50 border border-brand-200/70 font-bold text-xs transition-all shadow-2xs';
  }
  return 'nav-item-btn flex items-center px-3 py-2.5 rounded-xl text-[#1E293B] hover:text-brand-500 hover:bg-brand-50/60 font-semibold text-xs transition-all';
}

function buildSubLinkClasses(isActive) {
  if (isActive) {
    return 'sidebar-sub-link block py-1.5 px-2.5 text-brand-600 bg-brand-50/80 rounded-lg transition-colors font-bold leading-snug';
  }
  return 'sidebar-sub-link block py-1.5 px-2.5 text-slate-600 hover:text-brand-500 hover:bg-slate-50 rounded-lg transition-colors font-medium leading-snug';
}

function renderSharedShell(config = {}) {
  // Đảm bảo body là flex row để Sidebar (lg:sticky) và #mainAppWrapper nằm ngang cạnh nhau
  document.body.classList.add('min-h-screen', 'flex', 'overflow-x-hidden');
  const existingMain = document.getElementById('mainAppWrapper');
  if (existingMain) {
    existingMain.classList.add('flex-1', 'min-w-0');
  }

  // Tránh chèn trùng sidebar/header nếu renderSharedShell được gọi lại
  if (document.getElementById('verticalSidebar')) {
    syncWalletAndDebtDisplays();
    updateHeaderCartBadges();
    syncNotificationBadges();
    return;
  }

  const rawPage = (config.activePage || 'catalog').replace(/\.html$/i, '');
  const activePage = rawPage === 'index' ? 'catalog' : (rawPage === 'business-report' ? 'business' : rawPage);
  const pageTitle = config.pageTitle || 'Khám phá Việt Nam';
  const showGlobalHeader = config.showGlobalHeader !== false;
  const hasBottomBar = config.hasBottomBar !== false;
  const hideFloatingCart = !!config.hideFloatingCart || activePage === 'customer-qr' || (typeof window !== 'undefined' && window.location.pathname.includes('customer-qr'));

  isSidebarExpanded = (typeof TecheraDB !== 'undefined') ? TecheraDB.isSidebarExpanded() : true;

  const isProductsGroupActive = ['booking', 'orders', 'refund-requests', 'product-sync'].includes(activePage);
  const isPaymentGroupActive = ['wallet'].includes(activePage);
  const isRbacGroupActive = ['users-management', 'rbac-matrix', 'audit-logs'].includes(activePage);
  const isNotifGroupActive = ['notifications'].includes(activePage);

  // 1. Backdrop + Vertical Sidebar
  const sidebarHtml = `
    <div id="sidebarBackdrop" onclick="toggleVerticalSidebar(false)" class="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs hidden transition-opacity lg:hidden"></div>
    <aside id="verticalSidebar" class="${isSidebarExpanded ? 'sidebar-expanded w-64' : 'sidebar-collapsed w-[72px]'} fixed inset-y-0 right-0 lg:right-auto lg:left-0 z-50 translate-x-full lg:translate-x-0 lg:sticky lg:top-0 h-screen lg:z-30 bg-white border-l lg:border-l-0 lg:border-r border-slate-200 flex flex-col justify-between transition-all duration-300 ease-in-out shrink-0 select-none shadow-xs">
      <div class="relative">
        <div id="sidebar_brand_logo" class="h-16 px-4 border-b border-slate-100 flex items-center justify-between gap-3 transition-all overflow-hidden">
          <a href="index.html" class="flex items-center gap-3 min-w-0">
            <div class="w-9 h-9 rounded-xl bg-brand-50 border border-brand-200/80 flex items-center justify-center shrink-0 shadow-2xs">
              <svg class="w-5 h-5 text-brand-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a1 1 0 0 1 1 1v4.07l2.88-2.88a1 1 0 1 1 1.41 1.41L14.41 8.5H18.5a1 1 0 1 1 0 2h-4.09l2.88 2.88a1 1 0 1 1-1.41 1.41L13 11.91V16a1 1 0 1 1-2 0v-4.09l-2.88 2.88a1 1 0 0 1-1.41-1.41L9.59 10.5H5.5a1 1 0 0 1 0-2h4.09L6.71 5.62a1 1 0 0 1 1.41-1.41L11 7.07V3a1 1 0 0 1 1-1z" />
              </svg>
            </div>
            <div class="sidebar-brand-text flex flex-col leading-tight min-w-0">
              <span class="font-extrabold text-base tracking-wider text-slate-900">TECHERA</span>
              <span class="text-[9px] font-bold text-brand-500 uppercase tracking-widest">B2B PORTAL</span>
            </div>
          </a>
          <div class="flex items-center gap-1.5">
            <button type="button" onclick="toggleVerticalSidebar()" title="Thu gọn / Mở rộng menu" class="hidden lg:flex w-7 h-7 rounded-lg bg-slate-50 hover:bg-orange-50 text-slate-400 hover:text-brand-600 border border-slate-200 items-center justify-center shrink-0 cursor-pointer transition-colors">
              <i id="btnSidebarArrow" class="fa-solid fa-chevron-left text-[10px] transition-transform ${isSidebarExpanded ? '' : 'rotate-180'}"></i>
            </button>
            <button type="button" onclick="toggleVerticalSidebar(false)" aria-label="Đóng menu" class="lg:hidden w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 cursor-pointer">
              <i class="fa-solid fa-xmark text-xs"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-1 scrollbar-none">
        <div class="nav-group-label pt-1 pb-1.5 px-3 text-[11px] font-extrabold uppercase tracking-wider text-[#94A3B8]">TRANG CHỦ &amp; DASHBOARD</div>
        <div class="space-y-1">
          <div class="nav-group-item relative group">
            <a href="index.html" class="${buildSidebarLinkClasses(activePage === 'catalog' || activePage === 'index')}">
              <div class="w-6 h-6 flex items-center justify-center shrink-0 ${activePage === 'catalog' || activePage === 'index' ? 'text-brand-500' : 'text-slate-500 group-hover:text-brand-500'} transition-colors">
                <i class="fa-solid fa-house text-sm"></i>
              </div>
              <span class="nav-text-content truncate ml-2.5">Trang chủ (Khám phá)</span>
            </a>
            <div class="nav-tooltip absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 pointer-events-none z-50">Trang chủ (Khám phá)</div>
          </div>
          <div class="nav-group-item relative group">
            <a href="dashboard.html" class="${buildSidebarLinkClasses(activePage === 'dashboard')}">
              <div class="w-6 h-6 flex items-center justify-center shrink-0 ${activePage === 'dashboard' ? 'text-brand-500' : 'text-slate-500 group-hover:text-brand-500'} transition-colors">
                <i class="fa-solid fa-gauge-high text-sm"></i>
              </div>
              <span class="nav-text-content truncate ml-2.5">Dashboard Tổng quan</span>
            </a>
            <div class="nav-tooltip absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 pointer-events-none z-50">Dashboard Tổng quan</div>
          </div>
        </div>

        <div class="nav-group-label pt-4 pb-1.5 px-3 text-[11px] font-extrabold uppercase tracking-wider text-[#94A3B8]">BÁO CÁO NÂNG CAO</div>
        <div class="space-y-1">
          <div class="nav-group-item relative group">
            <a href="analytics.html" class="${buildSidebarLinkClasses(activePage === 'analytics')}">
              <div class="w-6 h-6 flex items-center justify-center shrink-0 ${activePage === 'analytics' ? 'text-brand-500' : 'text-slate-500 group-hover:text-brand-500'} transition-colors">
                <i class="fa-solid fa-chart-pie text-sm"></i>
              </div>
              <span class="nav-text-content truncate ml-2.5">Báo cáo Phân tích</span>
            </a>
            <div class="nav-tooltip absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 pointer-events-none z-50">Báo cáo Phân tích</div>
          </div>
          <div class="nav-group-item relative group">
            <a href="business-report.html" class="${buildSidebarLinkClasses(activePage === 'business')}">
              <div class="w-6 h-6 flex items-center justify-center shrink-0 ${activePage === 'business' ? 'text-brand-500' : 'text-slate-500 group-hover:text-brand-500'} transition-colors">
                <i class="fa-solid fa-chart-line text-sm"></i>
              </div>
              <span class="nav-text-content truncate ml-2.5">Hiệu quả kinh doanh</span>
            </a>
            <div class="nav-tooltip absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 pointer-events-none z-50">Hiệu quả kinh doanh</div>
          </div>
          <div class="nav-group-item relative group">
            <a href="ticket-issuance-report.html" class="${buildSidebarLinkClasses(activePage === 'ticket-issuance-report')}">
              <div class="w-6 h-6 flex items-center justify-center shrink-0 ${activePage === 'ticket-issuance-report' ? 'text-brand-500' : 'text-slate-500 group-hover:text-brand-500'} transition-colors">
                <i class="fa-solid fa-receipt text-sm"></i>
              </div>
              <span class="nav-text-content truncate ml-2.5">Báo cáo Xuất vé</span>
            </a>
            <div class="nav-tooltip absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 pointer-events-none z-50">Báo cáo Xuất vé</div>
          </div>
        </div>

        <div class="nav-group-label pt-4 pb-1.5 px-3 text-[11px] font-extrabold uppercase tracking-wider text-[#94A3B8]">QUẢN LÝ KHO VÉ</div>
        <div class="space-y-1">
          <div class="nav-group-item relative group">
            <a href="cashflow.html" class="${buildSidebarLinkClasses(activePage === 'cashflow')}">
              <div class="w-6 h-6 flex items-center justify-center shrink-0 ${activePage === 'cashflow' ? 'text-brand-500' : 'text-slate-500 group-hover:text-brand-500'} transition-colors">
                <i class="fa-solid fa-money-bill-transfer text-sm"></i>
              </div>
              <span class="nav-text-content truncate ml-2.5">Lịch sử Dòng tiền</span>
            </a>
            <div class="nav-tooltip absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 pointer-events-none z-50">Lịch sử Dòng tiền</div>
          </div>

          <div class="nav-group-item relative group">
            <button type="button" onclick="toggleSidebarSubmenu('productsOrders')" class="${buildSidebarLinkClasses(isProductsGroupActive)} w-full justify-between cursor-pointer">
              <div class="flex items-center min-w-0">
                <div class="w-6 h-6 flex items-center justify-center shrink-0 ${isProductsGroupActive ? 'text-brand-500' : 'text-slate-500 group-hover:text-brand-500'} transition-colors">
                  <i class="fa-solid fa-boxes-stacked text-sm"></i>
                </div>
                <span class="nav-text-content truncate ml-2.5">Sản phẩm và Đơn hàng</span>
              </div>
              <i id="chevron-productsOrders" class="fa-solid fa-chevron-down text-[10px] text-slate-400 group-hover:text-brand-500 transition-transform duration-200 nav-text-content ${isProductsGroupActive ? 'rotate-180' : ''}"></i>
            </button>
            <div id="submenu-productsOrders" class="submenu-accordion ${isProductsGroupActive ? '' : 'hidden'} pl-8 pr-2 py-1 space-y-1 text-xs">
              <a href="booking.html" class="${buildSubLinkClasses(activePage === 'booking')}">Đặt vé chi tiết</a>
              <a href="orders.html" class="${buildSubLinkClasses(activePage === 'orders')}">Danh sách Đơn hàng</a>
              <a href="refund-requests.html" class="${buildSubLinkClasses(activePage === 'refund-requests')}">Yêu cầu Hoàn/Hủy</a>
              <a href="product-sync.html" class="${buildSubLinkClasses(activePage === 'product-sync')}">Đồng bộ sản phẩm</a>
            </div>
            <div class="nav-flyout absolute left-full top-0 ml-3 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-2 px-1 opacity-0 pointer-events-none z-50">
              <div class="px-3 py-1.5 text-xs font-extrabold text-slate-900 border-b border-slate-100 mb-1 flex items-center gap-1.5">
                <i class="fa-solid fa-boxes-stacked text-brand-500 text-xs"></i>
                <span>Sản phẩm và Đơn hàng</span>
              </div>
              <a href="booking.html" class="block px-3 py-1.5 text-xs text-slate-600 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors">Đặt vé chi tiết</a>
              <a href="orders.html" class="block px-3 py-1.5 text-xs text-slate-600 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors">Danh sách Đơn hàng</a>
              <a href="refund-requests.html" class="block px-3 py-1.5 text-xs text-slate-600 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors">Yêu cầu Hoàn/Hủy</a>
              <a href="product-sync.html" class="block px-3 py-1.5 text-xs text-slate-600 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors">Đồng bộ sản phẩm</a>
            </div>
          </div>

          <div class="nav-group-item relative group">
            <button type="button" onclick="toggleSidebarSubmenu('paymentMethods')" class="${buildSidebarLinkClasses(isPaymentGroupActive)} w-full justify-between cursor-pointer">
              <div class="flex items-center min-w-0">
                <div class="w-6 h-6 flex items-center justify-center shrink-0 ${isPaymentGroupActive ? 'text-brand-500' : 'text-slate-500 group-hover:text-brand-500'} transition-colors">
                  <i class="fa-solid fa-credit-card text-sm"></i>
                </div>
                <span class="nav-text-content truncate ml-2.5">Hình thức Thanh toán</span>
              </div>
              <i id="chevron-paymentMethods" class="fa-solid fa-chevron-down text-[10px] text-slate-400 group-hover:text-brand-500 transition-transform duration-200 nav-text-content ${isPaymentGroupActive ? 'rotate-180' : ''}"></i>
            </button>
            <div id="submenu-paymentMethods" class="submenu-accordion ${isPaymentGroupActive ? '' : 'hidden'} pl-8 pr-2 py-1 space-y-1 text-xs">
              <a href="wallet.html" class="${buildSubLinkClasses(activePage === 'wallet')}">Ví điện tử &amp; Nạp tiền</a>
            </div>
            <div class="nav-flyout absolute left-full top-0 ml-3 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-2 px-1 opacity-0 pointer-events-none z-50">
              <div class="px-3 py-1.5 text-xs font-extrabold text-slate-900 border-b border-slate-100 mb-1 flex items-center gap-1.5">
                <i class="fa-solid fa-credit-card text-brand-500 text-xs"></i>
                <span>Hình thức Thanh toán</span>
              </div>
              <a href="wallet.html" class="block px-3 py-1.5 text-xs text-slate-600 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors">Ví điện tử &amp; Nạp tiền</a>
            </div>
          </div>
        </div>

        <!-- QUẢN LÝ NHÀ CUNG CẤP -->
        <div class="nav-group-label pt-4 pb-1.5 px-3 text-[11px] font-extrabold uppercase tracking-wider text-[#94A3B8]">QUẢN LÝ NHÀ CUNG CẤP</div>
        <div class="space-y-1">
          <div class="nav-group-item relative group">
            <a href="suppliers.html" class="${buildSidebarLinkClasses(activePage === 'suppliers')}">
              <div class="w-6 h-6 flex items-center justify-center shrink-0 ${activePage === 'suppliers' ? 'text-brand-500' : 'text-slate-500 group-hover:text-brand-500'} transition-colors">
                <i class="fa-solid fa-hotel text-sm"></i>
              </div>
              <span class="nav-text-content truncate ml-2.5">Thông tin Nhà cung cấp</span>
            </a>
            <div class="nav-tooltip absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 pointer-events-none z-50">Thông tin Nhà cung cấp</div>
          </div>
        </div>

        <!-- QUẢN LÝ ĐẠI LÝ -->
        <div class="nav-group-label pt-4 pb-1.5 px-3 text-[11px] font-extrabold uppercase tracking-wider text-[#94A3B8]">QUẢN LÝ ĐẠI LÝ</div>
        <div class="space-y-1">
          <div class="nav-group-item relative group">
            <a href="agencies.html" class="${buildSidebarLinkClasses(activePage === 'agencies')}">
              <div class="w-6 h-6 flex items-center justify-center shrink-0 ${activePage === 'agencies' ? 'text-brand-500' : 'text-slate-500 group-hover:text-brand-500'} transition-colors">
                <i class="fa-solid fa-handshake text-sm"></i>
              </div>
              <span class="nav-text-content truncate ml-2.5">Thông tin Đại lý</span>
            </a>
            <div class="nav-tooltip absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 pointer-events-none z-50">Thông tin Đại lý</div>
          </div>
        </div>

        <!-- KÊNH BÁN & TÀI CHÍNH (Bank Hub, Website B2C, Hoá đơn VAT) -->
        <div class="nav-group-label pt-4 pb-1.5 px-3 text-[11px] font-extrabold uppercase tracking-wider text-[#94A3B8]">KÊNH BÁN &amp; NGÂN HÀNG</div>
        <div class="space-y-1">
          <div class="nav-group-item relative group">
            <a href="bank-hub.html" class="${buildSidebarLinkClasses(activePage === 'bank-hub')}">
              <div class="w-6 h-6 flex items-center justify-center shrink-0 ${activePage === 'bank-hub' ? 'text-brand-500' : 'text-slate-500 group-hover:text-brand-500'} transition-colors">
                <i class="fa-solid fa-building-columns text-sm"></i>
              </div>
              <span class="nav-text-content truncate ml-2.5">Bank Hub</span>
            </a>
            <div class="nav-tooltip absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 pointer-events-none z-50">Bank Hub (Đối soát &amp; VietQR Pro)</div>
          </div>

          <div class="nav-group-item relative group">
            <a href="website-b2c.html" class="${buildSidebarLinkClasses(activePage === 'website-b2c')}">
              <div class="w-6 h-6 flex items-center justify-center shrink-0 ${activePage === 'website-b2c' ? 'text-brand-500' : 'text-slate-500 group-hover:text-brand-500'} transition-colors">
                <i class="fa-solid fa-globe text-sm"></i>
              </div>
              <span class="nav-text-content truncate ml-2.5">Website B2C</span>
            </a>
            <div class="nav-tooltip absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 pointer-events-none z-50">Kênh bán lẻ Website B2C</div>
          </div>

          <div class="nav-group-item relative group">
            <a href="vat-invoices.html" class="${buildSidebarLinkClasses(activePage === 'vat-invoices')}">
              <div class="w-6 h-6 flex items-center justify-center shrink-0 ${activePage === 'vat-invoices' ? 'text-brand-500' : 'text-slate-500 group-hover:text-brand-500'} transition-colors">
                <i class="fa-solid fa-file-invoice-dollar text-sm"></i>
              </div>
              <span class="nav-text-content truncate ml-2.5">Hoá đơn VAT</span>
            </a>
            <div class="nav-tooltip absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 pointer-events-none z-50">Quản lý Hoá đơn VAT</div>
          </div>
        </div>

        <!-- QUẢN LÝ TÀI KHOẢN, VAI TRÒ & PHÂN QUYỀN, NHẬT KÝ HOẠT ĐỘNG -->
        <div class="nav-group-label pt-4 pb-1.5 px-3 text-[11px] font-extrabold uppercase tracking-wider text-[#94A3B8]">PHÂN QUYỀN &amp; NHẬT KÝ</div>
        <div class="space-y-1">
          <div class="nav-group-item relative group">
            <button type="button" onclick="toggleSidebarSubmenu('rbacAudit')" class="${buildSidebarLinkClasses(isRbacGroupActive)} w-full justify-between cursor-pointer">
              <div class="flex items-center min-w-0">
                <div class="w-6 h-6 flex items-center justify-center shrink-0 ${isRbacGroupActive ? 'text-brand-500' : 'text-slate-500 group-hover:text-brand-500'} transition-colors">
                  <i class="fa-solid fa-user-shield text-sm"></i>
                </div>
                <span class="nav-text-content truncate ml-2.5">Tài khoản &amp; Phân quyền</span>
              </div>
              <i id="chevron-rbacAudit" class="fa-solid fa-chevron-down text-[10px] text-slate-400 group-hover:text-brand-500 transition-transform duration-200 nav-text-content ${isRbacGroupActive ? 'rotate-180' : ''}"></i>
            </button>
            <div id="submenu-rbacAudit" class="submenu-accordion ${isRbacGroupActive ? '' : 'hidden'} pl-8 pr-2 py-1 space-y-1 text-xs">
              <a href="users-management.html" class="${buildSubLinkClasses(activePage === 'users-management')}">Quản lý tài khoản người dùng</a>
              <a href="rbac-matrix.html" class="${buildSubLinkClasses(activePage === 'rbac-matrix')}">Ma trận phân quyền RBAC</a>
              <a href="audit-logs.html" class="${buildSubLinkClasses(activePage === 'audit-logs')}">Nhật ký Hoạt động (Audit Log)</a>
            </div>
            <div class="nav-flyout absolute left-full top-0 ml-3 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-2 px-1 opacity-0 pointer-events-none z-50">
              <div class="px-3 py-1.5 text-xs font-extrabold text-slate-900 border-b border-slate-100 mb-1 flex items-center gap-1.5">
                <i class="fa-solid fa-user-shield text-brand-500 text-xs"></i>
                <span>Tài khoản &amp; Phân quyền</span>
              </div>
              <a href="users-management.html" class="block px-3 py-1.5 text-xs text-slate-600 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors">Quản lý tài khoản người dùng</a>
              <a href="rbac-matrix.html" class="block px-3 py-1.5 text-xs text-slate-600 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors">Ma trận phân quyền RBAC</a>
              <a href="audit-logs.html" class="block px-3 py-1.5 text-xs text-slate-600 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors">Nhật ký Hoạt động (Audit Log)</a>
            </div>
          </div>
        </div>

        <!-- TRUNG TÂM THÔNG BÁO HỆ THỐNG -->
        <div class="nav-group-label pt-4 pb-1.5 px-3 text-[11px] font-extrabold uppercase tracking-wider text-[#94A3B8]">THÔNG BÁO HỆ THỐNG</div>
        <div class="space-y-1">
          <div class="nav-group-item relative group">
            <button type="button" onclick="toggleSidebarSubmenu('notificationsHub')" class="${buildSidebarLinkClasses(isNotifGroupActive)} w-full justify-between cursor-pointer">
              <div class="flex items-center min-w-0">
                <div class="w-6 h-6 flex items-center justify-center shrink-0 ${isNotifGroupActive ? 'text-brand-500' : 'text-slate-500 group-hover:text-brand-500'} transition-colors">
                  <i class="fa-solid fa-bell text-sm"></i>
                </div>
                <span class="nav-text-content truncate ml-2.5">Trung tâm Thông báo</span>
              </div>
              <i id="chevron-notificationsHub" class="fa-solid fa-chevron-down text-[10px] text-slate-400 group-hover:text-brand-500 transition-transform duration-200 nav-text-content ${isNotifGroupActive ? 'rotate-180' : ''}"></i>
            </button>
            <div id="submenu-notificationsHub" class="submenu-accordion ${isNotifGroupActive ? '' : 'hidden'} pl-8 pr-2 py-1 space-y-1 text-xs">
              <a href="notifications.html?tab=wallet" class="${buildSubLinkClasses(activePage === 'notifications')}">Thông báo biến động số dư ví</a>
              <a href="notifications.html?tab=orders" class="${buildSubLinkClasses(activePage === 'notifications')}">Thông báo trạng thái đơn hàng</a>
            </div>
            <div class="nav-flyout absolute left-full top-0 ml-3 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-2 px-1 opacity-0 pointer-events-none z-50">
              <div class="px-3 py-1.5 text-xs font-extrabold text-slate-900 border-b border-slate-100 mb-1 flex items-center gap-1.5">
                <i class="fa-solid fa-bell text-brand-500 text-xs"></i>
                <span>Trung tâm Thông báo</span>
              </div>
              <a href="notifications.html?tab=wallet" class="block px-3 py-1.5 text-xs text-slate-600 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors">Thông báo biến động số dư ví</a>
              <a href="notifications.html?tab=orders" class="block px-3 py-1.5 text-xs text-slate-600 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors">Thông báo trạng thái đơn hàng</a>
            </div>
          </div>
        </div>

        <!-- QUẢN LÝ KHÁCH HÀNG -->
        <div class="nav-group-label pt-4 pb-1.5 px-3 text-[11px] font-extrabold uppercase tracking-wider text-[#94A3B8]">QUẢN LÝ KHÁCH HÀNG</div>
        <div class="space-y-1">
          <div class="nav-group-item relative group">
            <a href="crm.html" class="${buildSidebarLinkClasses(activePage === 'crm')}">
              <div class="w-6 h-6 flex items-center justify-center shrink-0 ${activePage === 'crm' ? 'text-brand-500' : 'text-slate-500 group-hover:text-brand-500'} transition-colors">
                <i class="fa-solid fa-address-card text-sm"></i>
              </div>
              <span class="nav-text-content truncate ml-2.5">CRM Khách hàng</span>
            </a>
            <div class="nav-tooltip absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 pointer-events-none z-50">CRM Khách hàng</div>
          </div>
        </div>

        <div class="nav-group-label pt-4 pb-1.5 px-3 text-[11px] font-extrabold uppercase tracking-wider text-[#94A3B8]">TÀI KHOẢN &amp; HỆ THỐNG</div>
        <div class="space-y-1 pb-2">
          <div class="nav-group-item relative group">
            <a href="account.html" class="${buildSidebarLinkClasses(activePage === 'account')}">
              <div class="w-6 h-6 flex items-center justify-center shrink-0 ${activePage === 'account' ? 'text-brand-500' : 'text-slate-500 group-hover:text-brand-500'} transition-colors">
                <i class="fa-solid fa-user-gear text-sm"></i>
              </div>
              <span class="nav-text-content truncate ml-2.5">Hồ sơ Đại lý</span>
            </a>
            <div class="nav-tooltip absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 pointer-events-none z-50">Hồ sơ Đại lý</div>
          </div>
          <div class="nav-group-item relative group">
            <button type="button" onclick="confirmResetDemoDatabase()" class="nav-item-btn w-full flex items-center px-3 py-2.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50/70 font-semibold text-xs transition-all cursor-pointer">
              <div class="w-6 h-6 flex items-center justify-center shrink-0 text-slate-400 group-hover:text-rose-500 transition-colors">
                <i class="fa-solid fa-database text-sm"></i>
              </div>
              <span class="nav-text-content truncate ml-2.5">Khôi phục DB mẫu</span>
            </button>
            <div class="nav-tooltip absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 pointer-events-none z-50">Khôi phục DB mẫu</div>
          </div>
        </div>
      </div>

      <div class="p-3 border-t border-slate-100 bg-slate-50/60">
        <div class="flex items-center gap-2.5 p-1.5 rounded-xl">
          <div class="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 ring-4 ring-emerald-100"></div>
          <div class="nav-text-content text-[11px] leading-tight text-slate-500 min-w-0">
            <span class="font-bold text-slate-700 block truncate">Hệ thống sẵn sàng</span>
            <span class="text-[10px] text-slate-400">v2.4.1 B2B • Multi-Page</span>
          </div>
        </div>
      </div>
    </aside>
  `;

  // 2. Global Header (inserted at top of #mainAppWrapper)
  const headerHtml = `
    <header id="globalAppHeader" class="${showGlobalHeader ? '' : 'hidden'} relative z-30 w-full max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-1 bg-transparent border-0 shadow-none">
      <div class="flex items-center justify-between gap-3 bg-transparent border-0 shadow-none">
        <div class="flex items-center gap-2.5 min-w-0">
          <span id="globalHeaderPageTitle" class="font-black text-slate-900 text-base sm:text-lg tracking-tight truncate">${pageTitle}</span>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <a href="wallet.html" class="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-brand-400 text-xs font-bold text-slate-700 shadow-2xs transition-colors">
            <i class="fa-solid fa-wallet text-brand-500"></i>
            <span id="headerBalanceDisplay">đ 1.000.000</span>
          </a>
          <a href="cart.html" class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-brand-400 text-xs font-bold text-slate-700 shadow-2xs transition-colors">
            <i class="fa-solid fa-cart-shopping text-brand-500"></i>
            <span>Giỏ hàng</span>
            <span id="headerCartCount" class="px-1.5 py-0.5 rounded-full bg-brand-500 text-white text-[10px] font-black hidden">0</span>
          </a>
        </div>
      </div>
    </header>
  `;

  // 3. Global Floating Widgets, Bottom Nav & Shared Modals
  const bottomPosCls = hasBottomBar ? 'bottom-24 lg:bottom-8' : 'bottom-6';
  const extrasHtml = `
    <!-- NOTIFICATION TOAST -->
    <div id="toastNotification" class="fixed top-5 right-5 z-[80] transform -translate-y-16 opacity-0 pointer-events-none transition-all duration-300 ease-out bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_20px_45px_rgba(15,23,42,0.12),0_4px_12px_rgba(15,23,42,0.06)] border border-emerald-200/90 ring-1 ring-emerald-500/10 max-w-sm sm:max-w-md w-full sm:w-[420px] overflow-hidden">
      <div class="p-3 sm:p-3.5 flex items-center gap-3">
        <div class="w-[38px] h-[38px] rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center text-sm shrink-0 shadow-2xs" id="toastIcon">
          <i class="fa-solid fa-check"></i>
        </div>
        <div class="flex-1 min-w-0 pr-1">
          <div class="font-extrabold text-slate-900 text-xs sm:text-sm leading-tight truncate" id="toastTitle">Thông báo</div>
          <div class="text-slate-600 text-[11px] sm:text-xs leading-snug line-clamp-2 mt-0.5 font-medium" id="toastDesc">Thao tác thành công.</div>
        </div>
        <button type="button" onclick="hideToast()" class="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer transition-colors shrink-0" aria-label="Đóng thông báo">
          <i class="fa-solid fa-xmark text-xs"></i>
        </button>
      </div>
      <div class="h-1 w-full bg-slate-100 overflow-hidden">
        <div id="toastProgressBar" class="h-full bg-emerald-500 transition-all ease-linear" style="width: 100%;"></div>
      </div>
    </div>

    ${hideFloatingCart ? '' : `
    <!-- FLOATING SPEED DIAL (DESKTOP) -->
    <div id="floatingSpeedDialWrap" class="fixed right-4 ${bottomPosCls} z-[45] flex flex-col items-end gap-2.5">
      <div id="floatingSpeedDialActions" class="hidden flex-col items-end gap-2.5">
        <button type="button" onclick="openAgencyAccountModal()" title="Thông tin tài khoản / Hồ sơ đại lý" class="w-10 h-10 rounded-full bg-white hover:bg-orange-50 text-slate-700 hover:text-brand-600 border border-slate-200 shadow-lg flex items-center justify-center transition-all cursor-pointer">
          <i class="fa-solid fa-user text-sm"></i>
        </button>
        <button type="button" onclick="openNotificationsCenterModal()" title="Thông báo hệ thống" class="w-10 h-10 rounded-full bg-white hover:bg-orange-50 text-slate-700 hover:text-brand-600 border border-slate-200 shadow-lg flex items-center justify-center transition-all cursor-pointer relative">
          <i class="fa-solid fa-bell text-sm"></i>
          <span id="speedDialBellNotifBadge" class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white">1</span>
        </button>
        <a href="index.html" title="Đặt vé - Khám phá Việt Nam" class="w-10 h-10 rounded-full bg-white hover:bg-orange-50 text-brand-600 border border-brand-200 shadow-lg flex items-center justify-center transition-all cursor-pointer">
          <i class="fa-solid fa-ticket text-sm"></i>
        </a>
        <button type="button" onclick="openQuickWalletModal()" title="Ví điện tử - Nạp tiền nhanh" class="w-10 h-10 rounded-full bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 shadow-lg flex items-center justify-center transition-all cursor-pointer">
          <i class="fa-solid fa-wallet text-sm"></i>
        </button>
      </div>

      <a href="cart.html" id="btnDesktopFloatingCart" title="Mở giỏ hàng" class="relative w-12 h-12 rounded-full bg-white hover:bg-orange-50 text-brand-600 border border-brand-200 shadow-xl hidden lg:flex items-center justify-center transition-all cursor-pointer">
        <i class="fa-solid fa-cart-shopping text-base"></i>
        <span id="desktopFloatingCartBadge" class="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 rounded-full bg-brand-500 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white shadow-xs">0</span>
      </a>

      <button type="button" id="btnFloatingSpeedDial" onclick="toggleFloatingSpeedDial()" title="Tiện ích nhanh" class="relative w-12 h-12 rounded-full bg-brand-500 hover:bg-brand-600 text-white shadow-xl shadow-brand-500/30 hidden lg:flex items-center justify-center transition-all cursor-pointer">
        <i id="iconFloatingSettingGear" class="fa-solid fa-gear text-lg transition-transform duration-200"></i>
        <span id="speedDialGearNotifBadge" class="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white shadow-xs">1</span>
      </button>
    </div>

    <!-- MOBILE FLOATING CART BUTTON -->
    <a href="cart.html" id="btnMobileFloatingCart" title="Mở giỏ hàng" class="lg:hidden fixed right-4 bottom-24 z-[45] w-12 h-12 rounded-full bg-white hover:bg-orange-50 text-brand-600 border border-brand-200/90 shadow-xl shadow-slate-900/15 flex items-center justify-center">
      <i class="fa-solid fa-cart-shopping text-base"></i>
      <span id="mobileFloatingCartBadge" class="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 rounded-full bg-brand-500 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white shadow-xs">0</span>
    </a>`}

    ${hasBottomBar ? `
    <!-- GLOBAL MOBILE BOTTOM NAVIGATION FOOTER -->
    <nav id="globalMobileFooterNav" aria-label="Thanh điều hướng đáy" class="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-6px_24px_rgba(15,23,42,0.08)] h-16 px-2">
      <div class="max-w-lg mx-auto h-full grid grid-cols-5 items-center">
        <button type="button" onclick="goBackPage('index.html')" aria-label="Quay lại" class="flex items-center justify-center h-full text-slate-600 hover:text-brand-600 active:scale-95 transition-all cursor-pointer">
          <svg class="w-6 h-6" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"></path><path d="m12 19-7-7 7-7"></path></svg>
        </button>
        <button type="button" onclick="openNotificationsCenterModal()" aria-label="Thông báo" class="relative flex items-center justify-center h-full text-slate-600 hover:text-brand-600 active:scale-95 transition-all cursor-pointer">
          <span class="relative inline-flex items-center justify-center w-6 h-6">
            <svg class="w-6 h-6" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>
            <span id="footerNotifBadge" class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-rose-600 ring-2 ring-white"></span>
          </span>
        </button>
        <div class="flex items-center justify-center h-full relative">
          <a href="cart.html" aria-label="Giỏ hàng và Vé" style="width:58px;height:58px;border:3px solid #FFFFFF;background-color:#F25C22;box-shadow:0 8px 20px rgba(242,92,34,0.35);" class="-mt-7 rounded-full text-white flex items-center justify-center active:scale-95 transition-transform relative">
            <i class="fa-solid fa-ticket text-xl text-white"></i>
          </a>
        </div>
        <button id="btnFooterWallet" type="button" onclick="openQuickWalletModal()" aria-label="Ví điện tử" class="flex items-center justify-center h-full text-slate-600 hover:text-brand-600 active:scale-95 transition-all cursor-pointer">
          <svg class="w-6 h-6" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"></path><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"></path></svg>
        </button>
        <button type="button" onclick="toggleVerticalSidebar()" aria-label="Menu hệ thống" class="flex items-center justify-center h-full text-slate-600 hover:text-brand-600 active:scale-95 transition-all cursor-pointer">
          <svg class="w-6 h-6" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="20" y1="12" y2="12"></line><line x1="4" x2="20" y1="18" y2="18"></line></svg>
        </button>
      </div>
    </nav>` : ''}

    <!-- MODAL HỒ SƠ ĐẠI LÝ -->
    <div id="modalAgencyAccountProfile" class="fixed inset-0 z-[55] bg-black/50 backdrop-blur-[2px] hidden items-end justify-center p-0" onclick="if(event.target === this) closeAgencyAccountModal()">
      <div class="bg-white w-full max-w-lg rounded-t-3xl shadow-[0_-12px_40px_rgba(15,23,42,0.22)] flex flex-col max-h-[88vh] overflow-hidden">
        <div class="w-11 h-1.5 rounded-full bg-slate-300 mx-auto mt-2.5 mb-1 shrink-0"></div>
        <div class="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div class="flex items-center gap-2.5">
            <span class="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 border border-brand-200 flex items-center justify-center"><i class="fa-solid fa-user-tie text-xs"></i></span>
            <h3 class="text-sm sm:text-base font-black text-slate-900">Thông tin tài khoản Đại lý</h3>
          </div>
          <button type="button" onclick="closeAgencyAccountModal()" class="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"><i class="fa-solid fa-xmark text-xs"></i></button>
        </div>
        <div class="p-5 space-y-3 text-xs">
          <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div class="flex justify-between"><span class="text-slate-500">Tên đại lý:</span><strong class="text-slate-900">Đại lý HuyEra B2B</strong></div>
            <div class="flex justify-between"><span class="text-slate-500">Mã đối tác:</span><strong class="text-brand-600 font-mono">TA-TECHERA-089</strong></div>
            <div class="flex justify-between"><span class="text-slate-500">Hạng tài khoản:</span><strong class="text-emerald-700">Platinum Partner</strong></div>
            <div class="flex justify-between"><span class="text-slate-500">Email nhận vé:</span><strong class="text-slate-800">booking@huyera.vn</strong></div>
          </div>
          <div class="grid grid-cols-2 gap-2.5">
            <div class="p-3 rounded-xl bg-blue-50/80 border border-blue-200">
              <span class="text-[10.5px] text-blue-700 font-semibold block">Số dư ví khả dụng</span>
              <strong id="accountModalWalletBalance" class="text-sm font-black text-blue-900">1.000.000 đ</strong>
            </div>
            <div class="p-3 rounded-xl bg-amber-50/80 border border-amber-200">
              <span class="text-[10.5px] text-amber-800 font-semibold block">Công nợ còn lại</span>
              <strong id="accountModalDebtAvail" class="text-sm font-black text-amber-900">47.903.500 đ</strong>
            </div>
          </div>
          <div class="pt-1 flex justify-end">
            <a href="account.html" class="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs">Xem trang Hồ sơ đầy đủ</a>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL TRUNG TÂM THÔNG BÁO -->
    <div id="modalNotificationsCenter" class="fixed inset-0 z-[55] bg-black/50 backdrop-blur-[2px] hidden items-end justify-center p-0" onclick="if(event.target === this) closeNotificationsCenterModal()">
      <div class="bg-white w-full max-w-lg rounded-t-3xl shadow-[0_-12px_40px_rgba(15,23,42,0.22)] flex flex-col max-h-[88vh] overflow-hidden">
        <div class="w-11 h-1.5 rounded-full bg-slate-300 mx-auto mt-2.5 mb-1 shrink-0"></div>
        <div class="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 gap-2 shrink-0">
          <div class="flex items-center gap-2.5 min-w-0">
            <span class="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0"><i class="fa-solid fa-bell text-xs"></i></span>
            <h3 class="text-sm sm:text-base font-black text-slate-900 truncate">Trung tâm Thông báo Hệ thống</h3>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button type="button" onclick="markAllNotificationsRead()" class="text-[11px] font-bold text-brand-600 hover:text-brand-700 px-2 py-1 rounded-lg hover:bg-orange-50 cursor-pointer">Đã đọc tất cả</button>
            <button type="button" onclick="closeNotificationsCenterModal()" class="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"><i class="fa-solid fa-xmark text-xs"></i></button>
          </div>
        </div>
        <div class="px-5 pt-2 pb-1.5 border-b border-slate-100 flex items-center gap-1.5 text-xs bg-slate-50/50 shrink-0 overflow-x-auto">
          <button type="button" onclick="setNotificationsFilter('all')" id="btnNotifTab_all" class="px-3 py-1.5 rounded-lg font-bold bg-white text-brand-600 shadow-2xs border border-slate-200 cursor-pointer whitespace-nowrap">Tất cả</button>
          <button type="button" onclick="setNotificationsFilter('wallet')" id="btnNotifTab_wallet" class="px-3 py-1.5 rounded-lg font-semibold text-slate-500 hover:text-slate-800 cursor-pointer whitespace-nowrap">Biến động số dư ví</button>
          <button type="button" onclick="setNotificationsFilter('orders')" id="btnNotifTab_orders" class="px-3 py-1.5 rounded-lg font-semibold text-slate-500 hover:text-slate-800 cursor-pointer whitespace-nowrap">Trạng thái đơn hàng</button>
        </div>
        <div id="notificationsCenterList" class="p-4 sm:p-5 space-y-2.5 max-h-[65vh] overflow-y-auto text-xs"></div>
      </div>
    </div>

    <!-- MODAL VÍ ĐIỆN TỬ & NẠP TIỀN NHANH -->
    <div id="modalQuickWallet" class="fixed inset-0 z-[55] bg-black/50 backdrop-blur-[2px] hidden items-end justify-center p-0 transition-opacity duration-300" onclick="if(event.target === this) closeQuickWalletModal()">
      <div id="quickWalletSheetContainer" class="bg-white w-full max-w-lg rounded-t-3xl shadow-[0_-12px_40px_rgba(15,23,42,0.22)] flex flex-col max-h-[88vh] overflow-hidden transform transition-transform duration-300 ease-out translate-y-full">
        <!-- Thanh nắm kéo (Drag Handle) & Header Modal -->
        <div class="pt-3 px-5 pb-3 border-b border-slate-100 bg-white shrink-0 space-y-2">
          <div class="w-12 h-1.5 rounded-full bg-slate-300 mx-auto"></div>
          <div class="flex items-center justify-between gap-2 pt-1">
            <div class="flex items-center gap-3 min-w-0">
              <span class="w-9 h-9 rounded-xl bg-[#EFF6FF] text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
                <i class="fa-solid fa-wallet text-sm"></i>
              </span>
              <div class="min-w-0">
                <h3 class="text-sm sm:text-base font-black text-slate-900 truncate">Ví điện tử &amp; Nạp tiền nhanh</h3>
                <p class="text-[11px] text-slate-500 font-medium truncate">Không làm gián đoạn đơn hàng đang đặt</p>
              </div>
            </div>
            <button type="button" onclick="closeQuickWalletModal()" aria-label="Đóng" class="w-8 h-8 rounded-full bg-[#F1F5F9] hover:bg-slate-200 text-slate-500 flex items-center justify-center shrink-0 cursor-pointer transition-colors">
              <i class="fa-solid fa-xmark text-xs"></i>
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/50 text-xs custom-scrollbar">
          <!-- Khu vực 2: Thẻ Số dư Ví & Cấu hình Thấu chi (Wallet Balance & Overdraft Card) -->
          <div class="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 text-white shadow-md space-y-3.5">
            <!-- Nửa trên thẻ -->
            <div class="flex items-start justify-between gap-2">
              <div>
                <div class="text-[10.5px] font-bold text-blue-200 uppercase tracking-wider">SỐ DƯ VÍ HIỆN TẠI</div>
                <div id="quickWalletModalBalance" class="text-2xl sm:text-3xl font-black tracking-tight mt-0.5">1.000.000 đ</div>
              </div>
              <span class="text-[11px] font-bold px-3 py-1 rounded-full bg-white/15 text-blue-100 border border-white/10 shrink-0">
                Hạn mức âm: -10.000.000 đ
              </span>
            </div>

            <!-- Nửa dưới thẻ (ngăn cách bởi đường kẻ ngang mảnh bán trong suốt) -->
            <div class="pt-3 border-t border-white/15 flex items-center justify-between gap-3">
              <span class="text-xs font-semibold text-blue-100">Cho phép xuất vé âm tiền (Thấu chi ví)</span>
              <input type="checkbox" id="chkAllowNegativeBalance" onchange="toggleAllowNegativeBalance(this.checked)" class="w-5 h-5 rounded border border-white/60 bg-white text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600">
            </div>
          </div>

          <!-- Khu vực 3: Khối Nạp tiền vào ví qua VietQR (VietQR Top-up Section) -->
          <div class="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 space-y-3.5 shadow-2xs">
            <div class="font-black text-slate-900 text-sm">Nạp tiền vào ví qua VietQR</div>
            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1.5">Số tiền muốn nạp (VND)</label>
              <div class="relative flex items-center">
                <input type="text" id="quickWalletTopupInput" oninput="formatQuickWalletTopupInput(this)" placeholder="0" class="w-full px-4 py-3 pr-10 rounded-xl border border-slate-300 text-base sm:text-lg font-black text-slate-900 focus:outline-none focus:border-[#F25C22] focus:ring-1 focus:ring-[#F25C22]">
                <span class="absolute right-4 text-sm font-black text-slate-400 pointer-events-none">đ</span>
              </div>
            </div>

            <!-- Lưới 4 nút chọn nhanh mệnh giá (2 cột x 2 hàng) -->
            <div class="grid grid-cols-2 gap-2.5">
              <button type="button" data-amt="1000000" onclick="setQuickWalletAmount(1000000)" class="quick-wallet-preset-btn py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:border-orange-300 text-xs font-bold text-slate-700 cursor-pointer transition-all text-center">1.000.000 đ</button>
              <button type="button" data-amt="5000000" onclick="setQuickWalletAmount(5000000)" class="quick-wallet-preset-btn py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:border-orange-300 text-xs font-bold text-slate-700 cursor-pointer transition-all text-center">5.000.000 đ</button>
              <button type="button" data-amt="10000000" onclick="setQuickWalletAmount(10000000)" class="quick-wallet-preset-btn py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:border-orange-300 text-xs font-bold text-slate-700 cursor-pointer transition-all text-center">10.000.000 đ</button>
              <button type="button" data-amt="20000000" onclick="setQuickWalletAmount(20000000)" class="quick-wallet-preset-btn py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:border-orange-300 text-xs font-bold text-slate-700 cursor-pointer transition-all text-center">20.000.000 đ</button>
            </div>

            <!-- Nút hành động chính (Primary CTA) -->
            <button type="button" onclick="generateQuickWalletQr()" class="w-full py-3.5 px-4 rounded-xl bg-[#F25C22] hover:bg-[#d84814] active:scale-[0.99] text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-md shadow-orange-500/25 cursor-pointer transition-all">
              Tạo mã QR nạp tiền
            </button>

            <!-- Hộp mã QR VietQR động sinh ra -->
            <div id="quickWalletQrBox" class="hidden pt-3 border-t border-slate-100 space-y-3">
              <div class="flex items-center gap-3.5 p-3.5 rounded-xl bg-sky-50 border border-sky-200">
                <div class="w-24 h-24 bg-white p-1 rounded-xl border border-sky-200 shrink-0 flex items-center justify-center shadow-2xs">
                  <img id="quickWalletQrImage" src="https://img.vietqr.io/image/MB-0909888777-compact2.png?amount=1000000&addInfo=NAPVI%20TA089" alt="VietQR Nạp ví" class="w-full h-full object-contain rounded-lg">
                </div>
                <div class="min-w-0 space-y-1 text-xs">
                  <div class="font-black text-sky-900">VietQR Nạp Ví Đại Lý</div>
                  <div class="text-slate-600">Số tiền: <strong id="quickWalletQrAmountLabel" class="text-[#F25C22] text-sm font-black">1.000.000 đ</strong></div>
                  <div class="text-slate-600">MBBank • <strong>0909 888 777</strong></div>
                  <div class="text-slate-500">Nội dung: <strong class="font-mono text-slate-800">NAPVI TA089</strong></div>
                </div>
              </div>
              <button type="button" onclick="confirmQuickWalletTopupWebhook()" class="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm cursor-pointer transition-colors">
                Xác nhận đã chuyển khoản (Cập nhật số dư tức thì)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL ĐỒNG BỘ SẢN PHẨM -->
    <div id="modalProductSync" class="fixed inset-0 z-[55] bg-black/50 backdrop-blur-[2px] hidden items-center justify-center p-4" onclick="if(event.target === this) closeProductSyncModal()">
      <div class="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 space-y-4">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <span class="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
              <i class="fa-solid fa-arrows-rotate text-sm"></i>
            </span>
            <div>
              <h3 class="text-base font-extrabold text-slate-900">Đồng bộ Sản phẩm &amp; Giá vé</h3>
              <p class="text-xs text-slate-500">Cập nhật danh mục gói vé và allotment từ nhà cung cấp</p>
            </div>
          </div>
          <button type="button" onclick="closeProductSyncModal()" class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer">
            <i class="fa-solid fa-xmark text-xs"></i>
          </button>
        </div>

        <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs">
          <div class="flex items-center justify-between">
            <span class="text-slate-600 font-medium">Lần đồng bộ gần nhất:</span>
            <strong class="text-slate-800">17/11/2026 14:15 • Hôm nay</strong>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-600 font-medium">Quy mô danh mục:</span>
            <strong class="text-blue-700 font-bold">11 Khu vui chơi • 38 Gói vé</strong>
          </div>
          <div class="space-y-1.5 pt-2 border-t border-slate-200/60">
            <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Trạng thái cổng kết nối API</div>
            <div class="flex items-center justify-between py-1 border-b border-slate-100">
              <span class="flex items-center gap-1.5 text-slate-700">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Sun World API Gateway
              </span>
              <span class="text-emerald-700 font-bold text-[11px]">Đã kết nối (42ms)</span>
            </div>
            <div class="flex items-center justify-between py-1 border-b border-slate-100">
              <span class="flex items-center gap-1.5 text-slate-700">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span> VinWonders Live API
              </span>
              <span class="text-emerald-700 font-bold text-[11px]">Đã kết nối (58ms)</span>
            </div>
            <div class="flex items-center justify-between py-1">
              <span class="flex items-center gap-1.5 text-slate-700">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span> TECHERA Inventory Engine
              </span>
              <span class="text-emerald-700 font-bold text-[11px]">Sẵn sàng (Real-time)</span>
            </div>
          </div>
        </div>

        <div id="productSyncStatusBox" class="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs space-y-1.5">
          <div class="flex items-center justify-between">
            <span id="productSyncStatusTxt" class="font-bold text-blue-900">Sẵn sàng đồng bộ dữ liệu</span>
            <span id="productSyncPercent" class="text-blue-700 font-mono font-bold">100%</span>
          </div>
          <div class="w-full h-1.5 rounded-full bg-blue-200 overflow-hidden">
            <div id="productSyncBar" class="h-full bg-blue-600 rounded-full transition-all duration-500" style="width: 100%;"></div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-1">
          <button type="button" onclick="closeProductSyncModal()" class="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">
            Đóng
          </button>
          <button id="btnStartProductSync" type="button" onclick="triggerProductSyncNow()" class="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-2">
            <i class="fa-solid fa-arrows-rotate text-xs"></i>
            <span>Bắt đầu Đồng bộ ngay</span>
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL QUẢN LÝ NHÀ CUNG CẤP -->
    <div id="modalSupplierManagement" class="fixed inset-0 z-[55] bg-black/50 backdrop-blur-[2px] hidden items-center justify-center p-4" onclick="if(event.target === this) closeSupplierManagementModal()">
      <div class="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-6 space-y-4 max-h-[90vh] flex flex-col">
        <div class="flex items-start justify-between shrink-0">
          <div class="flex items-center gap-3">
            <span class="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
              <i class="fa-solid fa-hotel text-sm"></i>
            </span>
            <div>
              <h3 class="text-base font-extrabold text-slate-900">Thông tin Nhà cung cấp</h3>
              <p class="text-xs text-slate-500">Danh mục các tập đoàn &amp; đối tác cung cấp dịch vụ vé</p>
            </div>
          </div>
          <button type="button" onclick="closeSupplierManagementModal()" class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer">
            <i class="fa-solid fa-xmark text-xs"></i>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto space-y-3 text-xs pr-1">
          <!-- Supplier 1: Sun World -->
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2.5">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <strong class="text-slate-900 text-sm font-bold">Sun World (Tập đoàn Sun Group)</strong>
              </div>
              <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Đang liên kết</span>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-600">
              <div><span class="text-slate-400 block">Số KDL trực thuộc:</span><strong>5 Điểm đến</strong></div>
              <div><span class="text-slate-400 block">Chiết khấu B2B:</span><strong class="text-brand-600 font-bold">14% - 15%</strong></div>
              <div><span class="text-slate-400 block">Hình thức xuất vé:</span><strong>API QR tức thì</strong></div>
              <div><span class="text-slate-400 block">Đầu mối phụ trách:</span><strong>Mr. Hoàng Long (Sun Group)</strong></div>
              <div><span class="text-slate-400 block">Hotline hỗ trợ:</span><strong>1900 1234</strong></div>
              <div><span class="text-slate-400 block">Hợp đồng B2B:</span><strong>HĐ-SG-2026-088</strong></div>
            </div>
            <div class="text-[11px] text-slate-500 bg-white p-2.5 rounded-xl border border-slate-200/70">
              Khu vui chơi: Sun World Ba Na Hills, Bà Đen Mountain, Hòn Thơm Phú Quốc, Hạ Long, Fansipan Legend.
            </div>
          </div>

          <!-- Supplier 2: VinWonders -->
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2.5">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <strong class="text-slate-900 text-sm font-bold">VinWonders (Tập đoàn Vingroup)</strong>
              </div>
              <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Đang liên kết</span>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-600">
              <div><span class="text-slate-400 block">Số KDL trực thuộc:</span><strong>4 Điểm đến</strong></div>
              <div><span class="text-slate-400 block">Chiết khấu B2B:</span><strong class="text-brand-600 font-bold">14.5%</strong></div>
              <div><span class="text-slate-400 block">Hình thức xuất vé:</span><strong>Token API e-Ticket</strong></div>
              <div><span class="text-slate-400 block">Đầu mối phụ trách:</span><strong>Ms. Thu Hà (Key Account)</strong></div>
              <div><span class="text-slate-400 block">Hotline hỗ trợ:</span><strong>1900 2345</strong></div>
              <div><span class="text-slate-400 block">Hợp đồng B2B:</span><strong>HĐ-VW-2026-042</strong></div>
            </div>
            <div class="text-[11px] text-slate-500 bg-white p-2.5 rounded-xl border border-slate-200/70">
              Khu vui chơi: VinWonders Phú Quốc, VinWonders Nha Trang, Nam Hội An, VinWonders Grand World.
            </div>
          </div>

          <!-- Supplier 3: Khác -->
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2.5">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <strong class="text-slate-900 text-sm font-bold">Đối tác Độc lập (Đầm Sen &amp; Suối Tiên)</strong>
              </div>
              <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Đang liên kết</span>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-600">
              <div><span class="text-slate-400 block">Số KDL trực thuộc:</span><strong>2 Điểm đến TP.HCM</strong></div>
              <div><span class="text-slate-400 block">Chiết khấu B2B:</span><strong class="text-brand-600 font-bold">16%</strong></div>
              <div><span class="text-slate-400 block">Hình thức xuất vé:</span><strong>Mã vạch Barcode / QR</strong></div>
              <div><span class="text-slate-400 block">Đầu mối phụ trách:</span><strong>Mr. Minh Tuấn</strong></div>
              <div><span class="text-slate-400 block">Hotline hỗ trợ:</span><strong>1900 3456</strong></div>
              <div><span class="text-slate-400 block">Hợp đồng B2B:</span><strong>HĐ-DL-2026-019</strong></div>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end pt-2 border-t border-slate-100 shrink-0">
          <button type="button" onclick="closeSupplierManagementModal()" class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer">
            Đóng
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL QUẢN LÝ ĐẠI LÝ -->
    <div id="modalAgencyManagement" class="fixed inset-0 z-[55] bg-black/50 backdrop-blur-[2px] hidden items-center justify-center p-4" onclick="if(event.target === this) closeAgencyManagementModal()">
      <div class="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-6 space-y-4 max-h-[90vh] flex flex-col">
        <div class="flex items-start justify-between shrink-0">
          <div class="flex items-center gap-3">
            <span class="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
              <i class="fa-solid fa-users-rectangle text-sm"></i>
            </span>
            <div>
              <h3 class="text-base font-extrabold text-slate-900">Thông tin Đại lý</h3>
              <p class="text-xs text-slate-500">Mạng lưới 10 đại lý lữ hành đối tác chiến lược (TA Partner)</p>
            </div>
          </div>
          <button type="button" onclick="closeAgencyManagementModal()" class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer">
            <i class="fa-solid fa-xmark text-xs"></i>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto space-y-2.5 text-xs pr-1">
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <strong class="text-slate-900 font-bold block text-sm">CÔNG TY TNHH DVDL BA MIEN HCM</strong>
              <span class="text-slate-500">Mã: TA-BAMIEN • NVKD phụ trách: Nguyễn Văn An (Sale)</span>
            </div>
            <div class="text-right">
              <span class="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10.5px]">Platinum</span>
              <div class="text-[11px] text-slate-500 mt-1">Hạn mức nợ: <strong>50.000.000 đ</strong></div>
            </div>
          </div>

          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <strong class="text-slate-900 font-bold block text-sm">DU LỊCH VIỆT HOLIDAY</strong>
              <span class="text-slate-500">Mã: TA-VIETHOLIDAY • NVKD phụ trách: Trần Thị Mai (Sale)</span>
            </div>
            <div class="text-right">
              <span class="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10.5px]">Platinum</span>
              <div class="text-[11px] text-slate-500 mt-1">Hạn mức nợ: <strong>50.000.000 đ</strong></div>
            </div>
          </div>

          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <strong class="text-slate-900 font-bold block text-sm">SAIGON TOURIST PRO</strong>
              <span class="text-slate-500">Mã: TA-SAIGONTOUR • NVKD phụ trách: Lê Quốc Bảo (Sale)</span>
            </div>
            <div class="text-right">
              <span class="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold text-[10.5px]">Gold</span>
              <div class="text-[11px] text-slate-500 mt-1">Hạn mức nợ: <strong>50.000.000 đ</strong></div>
            </div>
          </div>

          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <strong class="text-slate-900 font-bold block text-sm">VIETRAVEL B2B</strong>
              <span class="text-slate-500">Mã: TA-VIETRAVEL • NVKD phụ trách: Phạm Minh Tuấn (Sale)</span>
            </div>
            <div class="text-right">
              <span class="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10.5px]">Platinum</span>
              <div class="text-[11px] text-slate-500 mt-1">Hạn mức nợ: <strong>50.000.000 đ</strong></div>
            </div>
          </div>

          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <strong class="text-slate-900 font-bold block text-sm">BEN THANH TOURIST B2B</strong>
              <span class="text-slate-500">Mã: TA-BENTHANH • NVKD phụ trách: Hoàng Thảo Linh (Sale)</span>
            </div>
            <div class="text-right">
              <span class="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold text-[10.5px]">Gold</span>
              <div class="text-[11px] text-slate-500 mt-1">Hạn mức nợ: <strong>50.000.000 đ</strong></div>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end pt-2 border-t border-slate-100 shrink-0">
          <button type="button" onclick="closeAgencyManagementModal()" class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer">
            Đóng
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL BANK HUB -->
    <div id="modalBankHub" class="fixed inset-0 z-[55] bg-black/50 backdrop-blur-[2px] hidden items-center justify-center p-4" onclick="if(event.target === this) closeBankHubModal()">
      <div class="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 space-y-4">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <span class="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
              <i class="fa-solid fa-building-columns text-sm"></i>
            </span>
            <div>
              <h3 class="text-base font-extrabold text-slate-900">Bank Hub</h3>
              <p class="text-xs text-slate-500">Trung tâm kết nối thanh toán ngân hàng &amp; Open Banking</p>
            </div>
          </div>
          <button type="button" onclick="closeBankHubModal()" class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer">
            <i class="fa-solid fa-xmark text-xs"></i>
          </button>
        </div>

        <div class="p-4 rounded-2xl bg-gradient-to-br from-emerald-700 to-slate-900 text-white space-y-3">
          <div class="flex items-center justify-between text-xs text-emerald-200">
            <span>CỔNG VIETQR PRO 24/7</span>
            <span class="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">Hoạt động bình thường</span>
          </div>
          <div class="space-y-0.5">
            <div class="text-[11px] text-emerald-200">Số tài khoản nhận tiền:</div>
            <div class="text-xl font-black font-mono tracking-wider">1038699999</div>
            <div class="text-xs font-bold">CÔNG TY TNHH CÔNG NGHỆ TECHERA</div>
          </div>
          <div class="text-[11px] text-emerald-200 pt-2 border-t border-white/10 flex items-center justify-between">
            <span>Ngân hàng: <strong>Vietcombank (VCB)</strong></span>
            <span>Chi nhánh: <strong>Tân Định, TP.HCM</strong></span>
          </div>
        </div>

        <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
          <div class="font-bold text-slate-800">Tính năng Đối soát tự động</div>
          <div class="space-y-1 text-slate-600 text-[11px]">
            <div>• Tự động quét và khớp lệnh thanh toán chuyển khoản qua webhook Napas 247.</div>
            <div>• Cộng số dư tức thì vào Ví điện tử Đại lý sau 1-3 giây khi nhận được tiền.</div>
            <div>• Đồng bộ dữ liệu sao kê dòng tiền với trang Lịch sử dòng tiền.</div>
          </div>
        </div>

        <div class="flex items-center justify-end pt-1">
          <button type="button" onclick="closeBankHubModal()" class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer">
            Đóng
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL WEBSITE B2C -->
    <div id="modalWebsiteB2C" class="fixed inset-0 z-[55] bg-black/50 backdrop-blur-[2px] hidden items-center justify-center p-4" onclick="if(event.target === this) closeWebsiteB2CModal()">
      <div class="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 space-y-4">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <span class="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center shrink-0">
              <i class="fa-solid fa-globe text-sm"></i>
            </span>
            <div>
              <h3 class="text-base font-extrabold text-slate-900">Website B2C</h3>
              <p class="text-xs text-slate-500">Cổng thông tin bán lẻ vé tham quan trực tuyến</p>
            </div>
          </div>
          <button type="button" onclick="closeWebsiteB2CModal()" class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer">
            <i class="fa-solid fa-xmark text-xs"></i>
          </button>
        </div>

        <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
          <div class="flex items-center justify-between">
            <span class="text-slate-600">Trạng thái cổng bán lẻ:</span>
            <span class="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">Đang nhận đơn trực tiếp</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-600">Địa chỉ truy cập công khai:</span>
            <strong class="text-blue-700 font-mono">https://techera.vn/booking</strong>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-600">Chính sách giá bán lẻ:</span>
            <strong class="text-slate-800">Niêm yết tiêu chuẩn (+5% margin)</strong>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-600">Thanh toán tự động:</span>
            <strong class="text-slate-800">VietQR, VNPAY, Thẻ Quốc tế</strong>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-1">
          <button type="button" onclick="closeWebsiteB2CModal()" class="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">
            Đóng
          </button>
          <a href="index.html" class="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5">
            <i class="fa-solid fa-arrow-up-right-from-square text-[11px]"></i>
            <span>Mở trang B2C Catalog</span>
          </a>
        </div>
      </div>
    </div>

    <!-- MODAL HOÁ ĐƠN VAT -->
    <div id="modalVatInvoices" class="fixed inset-0 z-[55] bg-black/50 backdrop-blur-[2px] hidden items-center justify-center p-4" onclick="if(event.target === this) closeVatInvoicesModal()">
      <div class="bg-white w-full max-w-xl rounded-3xl shadow-2xl p-6 space-y-4 max-h-[90vh] flex flex-col">
        <div class="flex items-start justify-between shrink-0">
          <div class="flex items-center gap-3">
            <span class="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center shrink-0">
              <i class="fa-solid fa-file-invoice-dollar text-sm"></i>
            </span>
            <div>
              <h3 class="text-base font-extrabold text-slate-900">Hoá đơn VAT</h3>
              <p class="text-xs text-slate-500">Quản lý và xuất hoá đơn điện tử e-Invoice theo đơn vé</p>
            </div>
          </div>
          <button type="button" onclick="closeVatInvoicesModal()" class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer">
            <i class="fa-solid fa-xmark text-xs"></i>
          </button>
        </div>

        <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs grid grid-cols-2 gap-2 shrink-0">
          <div><span class="text-slate-400 block">Đơn vị phát hành:</span><strong class="text-slate-800">CÔNG TY TNHH TECHERA</strong></div>
          <div><span class="text-slate-400 block">Mã số thuế (MST):</span><strong class="text-slate-800 font-mono">0317899999</strong></div>
          <div><span class="text-slate-400 block">Ký hiệu mẫu hoá đơn:</span><strong class="text-slate-800 font-mono">1C26TTR</strong></div>
          <div><span class="text-slate-400 block">Hệ thống hoá đơn:</span><strong class="text-slate-800">VNPT Invoice Live</strong></div>
        </div>

        <div class="flex-1 overflow-y-auto space-y-2 text-xs pr-1">
          <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Hoá đơn VAT đã xuất gần đây</div>
          <div class="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
            <div class="flex items-center justify-between">
              <span class="font-mono font-bold text-blue-700">HD-2026-00412</span>
              <span class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10.5px]">Đã ký số</span>
            </div>
            <div class="text-slate-700">Khách: <strong>CÔNG TY TNHH DVDL BA MIEN HCM</strong> • 4.704.000 đ</div>
            <div class="text-[11px] text-slate-400">Đơn hàng: ORD-2611-001 • Vé Cáp Treo &amp; Buffet Ba Na Hills</div>
          </div>
          <div class="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
            <div class="flex items-center justify-between">
              <span class="font-mono font-bold text-blue-700">HD-2026-00411</span>
              <span class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10.5px]">Đã ký số</span>
            </div>
            <div class="text-slate-700">Khách: <strong>DU LỊCH VIỆT HOLIDAY</strong> • 6.400.000 đ</div>
            <div class="text-[11px] text-slate-400">Đơn hàng: ORD-2611-004 • Vé VinWonders Phú Quốc</div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 shrink-0">
          <button type="button" onclick="closeVatInvoicesModal()" class="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">
            Đóng
          </button>
          <button type="button" onclick="showToast('Yêu cầu xuất hoá đơn', 'Hệ thống đã gửi yêu cầu xuất hoá đơn VAT sang bộ phận Kế toán xử lý.')" class="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold cursor-pointer">
            + Lập yêu cầu xuất VAT
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL QUẢN LÝ TÀI KHOẢN, VAI TRÒ & PHÂN QUYỀN, NHẬT KÝ HOẠT ĐỘNG -->
    <div id="modalRbacAudit" class="fixed inset-0 z-[55] bg-black/50 backdrop-blur-[2px] hidden items-center justify-center p-4" onclick="if(event.target === this) closeRbacModal()">
      <div class="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-6 space-y-4 max-h-[90vh] flex flex-col">
        <div class="flex items-start justify-between shrink-0">
          <div class="flex items-center gap-3">
            <span class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0">
              <i class="fa-solid fa-user-shield text-sm"></i>
            </span>
            <div>
              <h3 class="text-base font-extrabold text-slate-900">Quản lý Tài khoản &amp; Phân quyền</h3>
              <p class="text-xs text-slate-500">Tài khoản người dùng, Ma trận RBAC và Nhật ký Audit Log</p>
            </div>
          </div>
          <button type="button" onclick="closeRbacModal()" class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer">
            <i class="fa-solid fa-xmark text-xs"></i>
          </button>
        </div>

        <!-- 3 Tabs điều hướng -->
        <div class="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 text-xs shrink-0">
          <button type="button" id="tabRbac_accounts" onclick="switchRbacTab('accounts')" class="flex-1 py-1.5 text-center rounded-xl font-bold transition-all bg-white text-slate-900 shadow-2xs cursor-pointer">
            Tài khoản người dùng
          </button>
          <button type="button" id="tabRbac_matrix" onclick="switchRbacTab('matrix')" class="flex-1 py-1.5 text-center rounded-xl font-semibold text-slate-500 hover:text-slate-800 transition-all cursor-pointer">
            Ma trận RBAC
          </button>
          <button type="button" id="tabRbac_audit" onclick="switchRbacTab('audit')" class="flex-1 py-1.5 text-center rounded-xl font-semibold text-slate-500 hover:text-slate-800 transition-all cursor-pointer">
            Nhật ký Audit Log
          </button>
        </div>

        <!-- Tab Content 1: Accounts -->
        <div id="rbacContent_accounts" class="flex-1 overflow-y-auto space-y-2.5 text-xs pr-1">
          <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <strong class="text-slate-900 block font-bold">Nguyễn Diệu Linh (Super Admin)</strong>
              <span class="text-slate-500">admin@techera.vn • Nội bộ</span>
            </div>
            <span class="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold text-[10.5px]">Toàn quyền Admin</span>
          </div>
          <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <strong class="text-slate-900 block font-bold">Nguyễn Thị Kim Hoàng (Sales Manager)</strong>
              <span class="text-slate-500">hoang.sale@techera.vn • Ban Kinh doanh</span>
            </div>
            <span class="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10.5px]">Trưởng phòng KD</span>
          </div>
          <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <strong class="text-slate-900 block font-bold">Lê Văn Tuấn (Kế toán Vé)</strong>
              <span class="text-slate-500">ketoan@techera.vn • Ban Tài chính</span>
            </div>
            <span class="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold text-[10.5px]">Kế toán &amp; VAT</span>
          </div>
          <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <strong class="text-slate-900 block font-bold">Đại lý HuyEra B2B (Partner Account)</strong>
              <span class="text-slate-500">booking@huyera.vn • Đối tác TA-089</span>
            </div>
            <span class="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10.5px]">Đại lý B2B</span>
          </div>
        </div>

        <!-- Tab Content 2: Matrix -->
        <div id="rbacContent_matrix" class="flex-1 overflow-y-auto space-y-2 text-xs pr-1 hidden">
          <table class="w-full text-left border-collapse text-[11px]">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
              <tr>
                <th class="p-2">Chức năng hệ thống</th>
                <th class="p-2 text-center">Admin</th>
                <th class="p-2 text-center">Sales</th>
                <th class="p-2 text-center">Kế toán</th>
                <th class="p-2 text-center">Đại lý B2B</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr><td class="p-2 font-medium">Xem kho vé &amp; Đặt đơn</td><td class="p-2 text-center text-emerald-600">✓</td><td class="p-2 text-center text-emerald-600">✓</td><td class="p-2 text-center text-emerald-600">✓</td><td class="p-2 text-center text-emerald-600">✓</td></tr>
              <tr><td class="p-2 font-medium">Xuất vé QR điện tử</td><td class="p-2 text-center text-emerald-600">✓</td><td class="p-2 text-center text-emerald-600">✓</td><td class="p-2 text-center text-slate-300">-</td><td class="p-2 text-center text-emerald-600">✓</td></tr>
              <tr><td class="p-2 font-medium">Duyệt Yêu cầu Hoàn/Hủy vé</td><td class="p-2 text-center text-emerald-600">✓</td><td class="p-2 text-center text-emerald-600">✓</td><td class="p-2 text-center text-emerald-600">✓</td><td class="p-2 text-center text-slate-300">-</td></tr>
              <tr><td class="p-2 font-medium">Nạp tiền &amp; Quản lý ví</td><td class="p-2 text-center text-emerald-600">✓</td><td class="p-2 text-center text-slate-300">-</td><td class="p-2 text-center text-emerald-600">✓</td><td class="p-2 text-center text-emerald-600">✓</td></tr>
              <tr><td class="p-2 font-medium">Xuất hoá đơn VAT điện tử</td><td class="p-2 text-center text-emerald-600">✓</td><td class="p-2 text-center text-slate-300">-</td><td class="p-2 text-center text-emerald-600">✓</td><td class="p-2 text-center text-slate-300">-</td></tr>
              <tr><td class="p-2 font-medium">Xem Báo cáo Tài chính</td><td class="p-2 text-center text-emerald-600">✓</td><td class="p-2 text-center text-emerald-600">✓</td><td class="p-2 text-center text-emerald-600">✓</td><td class="p-2 text-center text-slate-300">-</td></tr>
            </tbody>
          </table>
        </div>

        <!-- Tab Content 3: Audit Log -->
        <div id="rbacContent_audit" class="flex-1 overflow-y-auto space-y-2 text-xs pr-1 hidden">
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
            <div class="flex items-center justify-between text-[11px]">
              <span class="font-bold text-slate-900">Xuất vé QR đơn hàng #ORD-2611-001</span>
              <span class="text-slate-400">17/11/2026 14:32</span>
            </div>
            <div class="text-slate-600 text-[11px]">Người thực hiện: <strong>Nguyễn Thị Kim Hoàng</strong> • IP: 14.161.22.45</div>
          </div>
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
            <div class="flex items-center justify-between text-[11px]">
              <span class="font-bold text-slate-900">Hoàn tiền vé đơn hàng #ORD-2611-008</span>
              <span class="text-slate-400">17/11/2026 13:45</span>
            </div>
            <div class="text-slate-600 text-[11px]">Người thực hiện: <strong>Lê Văn Tuấn</strong> • Hoàn 4.704.000 đ về Ví B2B</div>
          </div>
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
            <div class="flex items-center justify-between text-[11px]">
              <span class="font-bold text-slate-900">Nạp tiền vào ví đại lý +1.000.000 đ</span>
              <span class="text-slate-400">17/11/2026 11:20</span>
            </div>
            <div class="text-slate-600 text-[11px]">Hệ thống: <strong>Bank Hub VietQR Webhook</strong> • Khớp lệnh tự động</div>
          </div>
        </div>

        <div class="flex items-center justify-end pt-2 border-t border-slate-100 shrink-0">
          <button type="button" onclick="closeRbacModal()" class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer">
            Đóng
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('afterbegin', sidebarHtml);
  const mainWrapper = document.getElementById('mainAppWrapper');
  if (mainWrapper) {
    mainWrapper.insertAdjacentHTML('afterbegin', headerHtml);
  }
  document.body.insertAdjacentHTML('beforeend', extrasHtml);

  syncWalletAndDebtDisplays();
  updateHeaderCartBadges();
  syncNotificationBadges();
  renderNotificationsCenterList();
  initDraggableFloatingCart();
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function initDraggableFloatingCart() {
  const btn = document.getElementById('btnMobileFloatingCart');
  if (!btn || btn.__dragInitialized) return;
  btn.__dragInitialized = true;

  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let startLeft = 0;
  let startTop = 0;
  let hasMoved = false;

  const onPointerDown = (e) => {
    if (e.button && e.button !== 0) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    if (clientX === undefined || clientY === undefined) return;

    isDragging = true;
    hasMoved = false;
    startX = clientX;
    startY = clientY;

    const rect = btn.getBoundingClientRect();
    startLeft = rect.left;
    startTop = rect.top;

    btn.style.transition = 'none';

    const onPointerMove = (ev) => {
      if (!isDragging) return;
      const curX = ev.clientX || (ev.touches && ev.touches[0].clientX);
      const curY = ev.clientY || (ev.touches && ev.touches[0].clientY);
      if (curX === undefined || curY === undefined) return;

      const dx = curX - startX;
      const dy = curY - startY;

      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        hasMoved = true;
        if (ev.cancelable) ev.preventDefault();
      }

      if (!hasMoved) return;

      let newLeft = startLeft + dx;
      let newTop = startTop + dy;

      const btnW = btn.offsetWidth || 48;
      const btnH = btn.offsetHeight || 48;
      const maxLeft = window.innerWidth - btnW - 8;
      const maxTop = window.innerHeight - btnH - 68;

      newLeft = Math.max(8, Math.min(newLeft, maxLeft));
      newTop = Math.max(56, Math.min(newTop, maxTop));

      btn.style.left = `${newLeft}px`;
      btn.style.top = `${newTop}px`;
      btn.style.right = 'auto';
      btn.style.bottom = 'auto';
    };

    const onPointerUp = () => {
      if (!isDragging) return;
      isDragging = false;
      btn.style.transition = 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)';

      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);

      if (hasMoved) {
        const btnW = btn.offsetWidth || 48;
        const rect = btn.getBoundingClientRect();
        const midX = window.innerWidth / 2;
        const snapLeft = (rect.left + btnW / 2) < midX ? 12 : (window.innerWidth - btnW - 12);
        btn.style.left = `${snapLeft}px`;
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('touchmove', onPointerMove, { passive: false });
    window.addEventListener('touchend', onPointerUp);
  };

  btn.addEventListener('pointerdown', onPointerDown);
  btn.addEventListener('touchstart', onPointerDown, { passive: true });
  btn.addEventListener('click', (e) => {
    if (hasMoved) {
      e.preventDefault();
      e.stopPropagation();
      hasMoved = false;
    }
  });
}

function toggleVerticalSidebar(forceState) {
  const sidebar = document.getElementById('verticalSidebar');
  const arrow = document.getElementById('btnSidebarArrow');
  const backdrop = document.getElementById('sidebarBackdrop');
  const isMobile = window.innerWidth < 1024;

  if (isMobile) {
    isMobileSidebarOpen = typeof forceState === 'boolean' ? forceState : !isMobileSidebarOpen;
    if (sidebar) {
      sidebar.classList.remove('sidebar-collapsed', 'w-[72px]', '-translate-x-full');
      sidebar.classList.add('sidebar-expanded', 'w-64');
      sidebar.classList.toggle('translate-x-0', isMobileSidebarOpen);
      sidebar.classList.toggle('translate-x-full', !isMobileSidebarOpen);
    }
    if (backdrop) backdrop.classList.toggle('hidden', !isMobileSidebarOpen);
    return;
  }

  isSidebarExpanded = typeof forceState === 'boolean' ? forceState : !isSidebarExpanded;
  if (typeof TecheraDB !== 'undefined') TecheraDB.setSidebarExpanded(isSidebarExpanded);

  if (sidebar) {
    sidebar.classList.toggle('sidebar-expanded', isSidebarExpanded);
    sidebar.classList.toggle('w-64', isSidebarExpanded);
    sidebar.classList.toggle('sidebar-collapsed', !isSidebarExpanded);
    sidebar.classList.toggle('w-[72px]', !isSidebarExpanded);
  }
  if (arrow) arrow.classList.toggle('rotate-180', !isSidebarExpanded);
  if (backdrop) backdrop.classList.add('hidden');
}

function toggleSidebarSubmenu(menuId) {
  if (window.innerWidth >= 1024 && !isSidebarExpanded) {
    toggleVerticalSidebar(true);
  }
  const submenu = document.getElementById(`submenu-${menuId}`);
  const chevron = document.getElementById(`chevron-${menuId}`);
  if (!submenu) return;
  const isHidden = submenu.classList.contains('hidden');
  submenu.classList.toggle('hidden', !isHidden);
  if (chevron) chevron.classList.toggle('rotate-180', isHidden);
}

function toggleFloatingSpeedDial(forceState) {
  isFloatingSpeedDialOpen = typeof forceState === 'boolean' ? forceState : !isFloatingSpeedDialOpen;
  const actions = document.getElementById('floatingSpeedDialActions');
  const gear = document.getElementById('iconFloatingSettingGear');
  if (actions) {
    actions.classList.toggle('hidden', !isFloatingSpeedDialOpen);
    actions.classList.toggle('flex', isFloatingSpeedDialOpen);
  }
  if (gear) gear.classList.toggle('rotate-90', isFloatingSpeedDialOpen);
}

function syncWalletAndDebtDisplays() {
  if (typeof TecheraDB === 'undefined') return;
  const w = TecheraDB.getWallet();
  const balText = formatSignedVnd(w.balance);
  const debtAvail = Math.max(0, (w.debtLimit || 50000000) - (w.debtUsed || 0));
  const debtText = formatMoney(debtAvail) + ' đ';

  const setTxt = (id, txt) => {
    const el = document.getElementById(id);
    if (el) el.innerText = txt;
  };
  setTxt('headerBalanceDisplay', 'đ ' + formatMoney(w.balance));
  setTxt('pmWalletBalLabel', `Số dư: ${balText}`);
  setTxt('pmDebtAvailLabel', `Còn: ${debtText}`);
  setTxt('walletPageBalanceDisplay', balText);
  setTxt('walletPageDebtAvailDisplay', debtText);
  setTxt('profileWalletBalanceDisplay', balText);
  setTxt('profileDebtAvailDisplay', debtText);
  setTxt('accountModalWalletBalance', balText);
  setTxt('accountModalDebtAvail', debtText);

  document.querySelectorAll('.js-wallet-balance-text').forEach(el => {
    el.innerText = balText;
  });
  document.querySelectorAll('.js-wallet-debt-text').forEach(el => {
    el.innerText = formatMoney(w.debtUsed || 0) + ' đ';
  });
}

function updateHeaderCartBadges() {
  if (typeof TecheraDB === 'undefined') return;
  const totalQty = TecheraDB.getCartTotalQty();
  ['headerCartCount', 'desktopFloatingCartBadge', 'mobileFloatingCartBadge', 'detailHeaderCartBadge'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.innerText = totalQty;
      el.classList.toggle('hidden', totalQty <= 0);
    }
  });
  document.querySelectorAll('.header-cart-badge').forEach(el => {
    el.innerText = totalQty;
  });
}

function syncNotificationBadges() {
  if (typeof TecheraDB === 'undefined') return;
  const unread = TecheraDB.getNotifications().filter(n => !n.read).length;
  ['speedDialBellNotifBadge', 'speedDialGearNotifBadge'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.innerText = unread;
      el.classList.toggle('hidden', unread <= 0);
    }
  });
  const footerBadge = document.getElementById('footerNotifBadge');
  if (footerBadge) footerBadge.classList.toggle('hidden', unread <= 0);
}

function renderNotificationsCenterList() {
  const listEl = document.getElementById('notificationsCenterList');
  if (!listEl || typeof TecheraDB === 'undefined') return;
  const list = TecheraDB.getNotifications();
  if (list.length === 0) {
    listEl.innerHTML = `<div class="py-8 text-center text-slate-400 font-semibold">Không có thông báo nào.</div>`;
    return;
  }
  listEl.innerHTML = list.map(n => `
    <div onclick="markNotificationRead('${n.id}')" class="p-3 rounded-xl border ${n.read ? 'bg-white border-slate-200/80' : 'bg-orange-50/60 border-brand-200'} cursor-pointer transition-colors space-y-1">
      <div class="flex items-center justify-between gap-2">
        <span class="font-extrabold text-slate-900">${n.title}</span>
        <span class="text-[10px] text-slate-400 shrink-0">${n.time}</span>
      </div>
      <div class="text-[11px] text-slate-600">${n.desc}</div>
    </div>
  `).join('');
}

function markNotificationRead(notifId) {
  const list = TecheraDB.getNotifications();
  const target = list.find(n => n.id === notifId);
  if (target) {
    target.read = true;
    TecheraDB.saveNotifications(list);
    syncNotificationBadges();
    renderNotificationsCenterList();
  }
}

function markAllNotificationsRead() {
  const list = TecheraDB.getNotifications().map(n => ({ ...n, read: true }));
  TecheraDB.saveNotifications(list);
  syncNotificationBadges();
  renderNotificationsCenterList();
}

function openNotificationsCenterModal() {
  renderNotificationsCenterList();
  const modal = document.getElementById('modalNotificationsCenter');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeNotificationsCenterModal() {
  const modal = document.getElementById('modalNotificationsCenter');
  if (modal) {
    modal.classList.remove('flex');
    modal.classList.add('hidden');
  }
}

function openAgencyAccountModal() {
  syncWalletAndDebtDisplays();
  const modal = document.getElementById('modalAgencyAccountProfile');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeAgencyAccountModal() {
  const modal = document.getElementById('modalAgencyAccountProfile');
  if (modal) {
    modal.classList.remove('flex');
    modal.classList.add('hidden');
  }
}

function highlightQuickWalletPreset(amt) {
  document.querySelectorAll('.quick-wallet-preset-btn').forEach(btn => {
    const bAmt = Number(btn.getAttribute('data-amt'));
    const isSel = (bAmt === amt);
    btn.className = isSel
      ? 'quick-wallet-preset-btn py-2.5 px-3 rounded-xl border-2 border-[#F25C22] bg-orange-50 text-[#F25C22] font-black text-xs cursor-pointer transition-all shadow-2xs text-center'
      : 'quick-wallet-preset-btn py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:border-orange-300 text-xs font-bold text-slate-700 cursor-pointer transition-all text-center';
  });
}

function openQuickWalletModal(prefillDeficit = null) {
  quickWalletOpenedFromCheckout = (prefillDeficit !== null && prefillDeficit > 0);
  const w = TecheraDB.getWallet();
  const balEl = document.getElementById('quickWalletModalBalance');
  if (balEl) {
    balEl.innerText = `${formatMoney(w.balance)} đ`;
    balEl.className = w.balance < 0
      ? 'text-2xl sm:text-3xl font-black tracking-tight mt-0.5 text-rose-300'
      : 'text-2xl sm:text-3xl font-black tracking-tight mt-0.5 text-white';
  }
  const chkEl = document.getElementById('chkAllowNegativeBalance');
  if (chkEl) chkEl.checked = !!w.allowNegativeBalance;

  const inputEl = document.getElementById('quickWalletTopupInput');
  if (inputEl) {
    if (prefillDeficit !== null && prefillDeficit > 0) {
      const defAmt = Math.ceil(prefillDeficit);
      inputEl.value = formatMoney(defAmt);
      highlightQuickWalletPreset(defAmt);
    } else {
      inputEl.value = '';
      highlightQuickWalletPreset(0);
    }
  }
  const qrBox = document.getElementById('quickWalletQrBox');
  if (qrBox) qrBox.classList.add('hidden');

  const modal = document.getElementById('modalQuickWallet');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    const sheet = document.getElementById('quickWalletSheetContainer');
    if (sheet) {
      sheet.classList.remove('translate-y-0');
      sheet.classList.add('translate-y-full');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          sheet.classList.remove('translate-y-full');
          sheet.classList.add('translate-y-0');
        });
      });
    }
  }
}

function closeQuickWalletModal() {
  const modal = document.getElementById('modalQuickWallet');
  if (modal) {
    const sheet = document.getElementById('quickWalletSheetContainer');
    if (sheet) {
      sheet.classList.remove('translate-y-0');
      sheet.classList.add('translate-y-full');
      setTimeout(() => {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
      }, 250);
    } else {
      modal.classList.remove('flex');
      modal.classList.add('hidden');
    }
  }
  quickWalletOpenedFromCheckout = false;
}

function formatQuickWalletTopupInput(inputEl) {
  if (!inputEl) return;
  const num = parseMoney(inputEl.value);
  inputEl.value = num > 0 ? formatMoney(num) : '';
  highlightQuickWalletPreset(num);
}

function setQuickWalletAmount(amt) {
  const inputEl = document.getElementById('quickWalletTopupInput');
  if (inputEl) inputEl.value = formatMoney(amt);
  highlightQuickWalletPreset(amt);
}

function toggleAllowNegativeBalance(isAllowed) {
  const w = TecheraDB.getWallet();
  w.allowNegativeBalance = !!isAllowed;
  TecheraDB.saveWallet(w);
  syncWalletAndDebtDisplays();
  if (typeof updateConfirmationFinancialSummary === 'function') {
    updateConfirmationFinancialSummary();
  }
  showToast(
    isAllowed ? 'Đã bật Thấu chi ví' : 'Đã tắt Thấu chi ví',
    isAllowed ? 'Hệ thống cho phép xuất vé âm tiền trong hạn mức -10.000.000 đ.' : 'Đã chuyển về xuất vé theo số dư khả dụng thực tế.',
    'info'
  );
}

function generateQuickWalletQr() {
  const inputEl = document.getElementById('quickWalletTopupInput');
  const amt = parseMoney(inputEl ? inputEl.value : '0');
  if (amt <= 0) {
    showToast('Số tiền không hợp lệ', 'Vui lòng nhập số tiền nạp lớn hơn 0 đ.', 'error');
    return;
  }
  const lbl = document.getElementById('quickWalletQrAmountLabel');
  if (lbl) lbl.innerText = `${formatMoney(amt)} đ`;
  const imgEl = document.getElementById('quickWalletQrImage');
  if (imgEl) {
    imgEl.src = `https://img.vietqr.io/image/MB-0909888777-compact2.png?amount=${amt}&addInfo=NAPVI%20TA089`;
  }
  const qrBox = document.getElementById('quickWalletQrBox');
  if (qrBox) qrBox.classList.remove('hidden');
}

function confirmQuickWalletTopupWebhook() {
  const inputEl = document.getElementById('quickWalletTopupInput');
  const amt = parseMoney(inputEl ? inputEl.value : '0');
  if (amt <= 0) return;

  const w = TecheraDB.adjustWalletBalance(amt, { isTopup: true, method: 'Nạp tiền nhanh VietQR' });
  const balEl = document.getElementById('quickWalletModalBalance');
  if (balEl) {
    balEl.innerText = `${formatMoney(w.balance)} đ`;
    balEl.className = w.balance < 0
      ? 'text-2xl sm:text-3xl font-black tracking-tight mt-0.5 text-rose-300'
      : 'text-2xl sm:text-3xl font-black tracking-tight mt-0.5 text-white';
  }
  TecheraDB.pushNotification({
    title: 'Nạp tiền vào ví thành công',
    desc: `+${formatMoney(amt)} đ qua Nạp tiền nhanh VietQR. Số dư hiện tại: ${formatSignedVnd(w.balance)}.`,
    type: 'success'
  });

  syncWalletAndDebtDisplays();
  syncNotificationBadges();
  renderNotificationsCenterList();
  if (typeof recalculateTotals === 'function') recalculateTotals();
  if (typeof updateConfirmationFinancialSummary === 'function') updateConfirmationFinancialSummary();
  if (typeof renderWalletTopupHistory === 'function') renderWalletTopupHistory();

  showToast('Nạp tiền thành công', `Ví đã được cộng +${formatMoney(amt)} đ. Số dư mới: ${formatMoney(w.balance)} đ.`, 'success');
  const qrBox = document.getElementById('quickWalletQrBox');
  if (qrBox) qrBox.classList.add('hidden');
  if (quickWalletOpenedFromCheckout) closeQuickWalletModal();
}

function confirmResetDemoDatabase() {
  if (typeof TecheraDB === 'undefined') return;
  if (confirm('Khôi phục toàn bộ dữ liệu mẫu (Đơn hàng, CRM, Giỏ hàng, Ví, Dòng tiền) về trạng thái mặc định?')) {
    TecheraDB.resetAll();
    window.location.reload();
  }
}


// ============================================================================
// NEW FEATURE MODALS & NAVIGATION HANDLERS (SUPPLIERS, AGENCIES, BANK HUB, ETC.)
// ============================================================================

let currentNotifFilter = 'all';

function setNotificationsFilter(type) {
  currentNotifFilter = type;
  const types = ['all', 'wallet', 'orders'];
  types.forEach(t => {
    const btn = document.getElementById(`btnNotifTab_${t}`);
    if (btn) {
      if (t === type) {
        btn.className = 'px-3 py-1.5 rounded-lg font-bold bg-white text-brand-600 shadow-2xs border border-slate-200 cursor-pointer whitespace-nowrap';
      } else {
        btn.className = 'px-3 py-1.5 rounded-lg font-semibold text-slate-500 hover:text-slate-800 cursor-pointer whitespace-nowrap';
      }
    }
  });
  renderNotificationsCenterList();
}

function openNotificationsCenterFiltered(type) {
  openNotificationsCenterModal();
  setNotificationsFilter(type);
}

function handleNavRefundRequests(e) {
  if (e) e.preventDefault();
  if (window.location.pathname.includes('orders.html')) {
    if (typeof applyOrdersListFilters === 'function') {
      const statusEl = document.getElementById('ordersStatusFilter');
      if (statusEl) statusEl.value = 'Đã hoàn tiền';
      if (typeof ordersListFilterState !== 'undefined') {
        ordersListFilterState.status = 'Đã hoàn tiền';
      }
      if (typeof ordersListPage !== 'undefined') {
        ordersListPage = 1;
      }
      if (typeof renderOrdersListView === 'function') {
        renderOrdersListView();
      }
    }
  } else {
    window.location.href = 'orders.html?filter=refund';
  }
}

function openProductSyncModal() {
  const modal = document.getElementById('modalProductSync');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeProductSyncModal() {
  const modal = document.getElementById('modalProductSync');
  if (modal) {
    modal.classList.remove('flex');
    modal.classList.add('hidden');
  }
}

function triggerProductSyncNow() {
  const btn = document.getElementById('btnStartProductSync');
  const bar = document.getElementById('productSyncBar');
  const statusTxt = document.getElementById('productSyncStatusTxt');
  const pctTxt = document.getElementById('productSyncPercent');
  if (btn) btn.disabled = true;
  if (statusTxt) statusTxt.innerText = 'Đang kết nối API Sun World & VinWonders...';
  if (bar) bar.style.width = '35%';
  if (pctTxt) pctTxt.innerText = '35%';

  setTimeout(() => {
    if (statusTxt) statusTxt.innerText = 'Đang đồng bộ 38 gói vé & cập nhật allotment...';
    if (bar) bar.style.width = '75%';
    if (pctTxt) pctTxt.innerText = '75%';
  }, 600);

  setTimeout(() => {
    if (statusTxt) statusTxt.innerText = 'Đồng bộ hoàn tất! Cập nhật 38 gói dịch vụ thành công.';
    if (bar) bar.style.width = '100%';
    if (pctTxt) pctTxt.innerText = '100%';
    if (btn) btn.disabled = false;
    showToast('Đồng bộ thành công', 'Toàn bộ 38 gói vé và lịch vận hành đã được đồng bộ với nhà cung cấp.');
    TecheraDB.pushNotification({
      title: 'Đồng bộ sản phẩm thành công',
      desc: 'Hệ thống đã đồng bộ toàn bộ bảng giá và allotment từ Sun World & VinWonders.',
      type: 'success'
    });
    syncNotificationBadges();
  }, 1200);
}

function openSupplierManagementModal() {
  const modal = document.getElementById('modalSupplierManagement');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeSupplierManagementModal() {
  const modal = document.getElementById('modalSupplierManagement');
  if (modal) {
    modal.classList.remove('flex');
    modal.classList.add('hidden');
  }
}

function openAgencyManagementModal() {
  const modal = document.getElementById('modalAgencyManagement');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeAgencyManagementModal() {
  const modal = document.getElementById('modalAgencyManagement');
  if (modal) {
    modal.classList.remove('flex');
    modal.classList.add('hidden');
  }
}

function openBankHubModal() {
  const modal = document.getElementById('modalBankHub');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeBankHubModal() {
  const modal = document.getElementById('modalBankHub');
  if (modal) {
    modal.classList.remove('flex');
    modal.classList.add('hidden');
  }
}

function openWebsiteB2CModal() {
  const modal = document.getElementById('modalWebsiteB2C');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeWebsiteB2CModal() {
  const modal = document.getElementById('modalWebsiteB2C');
  if (modal) {
    modal.classList.remove('flex');
    modal.classList.add('hidden');
  }
}

function openVatInvoicesModal() {
  const modal = document.getElementById('modalVatInvoices');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeVatInvoicesModal() {
  const modal = document.getElementById('modalVatInvoices');
  if (modal) {
    modal.classList.remove('flex');
    modal.classList.add('hidden');
  }
}

function openRbacModal(tab = 'accounts') {
  switchRbacTab(tab);
  const modal = document.getElementById('modalRbacAudit');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeRbacModal() {
  const modal = document.getElementById('modalRbacAudit');
  if (modal) {
    modal.classList.remove('flex');
    modal.classList.add('hidden');
  }
}

function switchRbacTab(tab) {
  const tabs = ['accounts', 'matrix', 'audit'];
  tabs.forEach(t => {
    const btn = document.getElementById(`tabRbac_${t}`);
    const content = document.getElementById(`rbacContent_${t}`);
    if (btn) {
      if (t === tab) {
        btn.className = 'flex-1 py-1.5 text-center rounded-xl font-bold transition-all bg-white text-slate-900 shadow-2xs cursor-pointer';
      } else {
        btn.className = 'flex-1 py-1.5 text-center rounded-xl font-semibold text-slate-500 hover:text-slate-800 transition-all cursor-pointer';
      }
    }
    if (content) {
      content.classList.toggle('hidden', t !== tab);
    }
  });
}

// Update renderNotificationsCenterList with filter logic
const origRenderNotif = renderNotificationsCenterList;
renderNotificationsCenterList = function() {
  const listEl = document.getElementById('notificationsCenterList');
  if (!listEl || typeof TecheraDB === 'undefined') return;
  const allList = TecheraDB.getNotifications();
  const list = allList.filter(n => {
    if (currentNotifFilter === 'wallet') {
      const text = `${n.title} ${n.desc}`.toLowerCase();
      return text.includes('ví') || text.includes('tiền') || text.includes('số dư') || text.includes('nạp');
    }
    if (currentNotifFilter === 'orders') {
      const text = `${n.title} ${n.desc}`.toLowerCase();
      return text.includes('đơn') || text.includes('vé') || text.includes('xuất') || text.includes('hoàn');
    }
    return true;
  });

  if (list.length === 0) {
    listEl.innerHTML = `<div class="py-8 text-center text-slate-400 font-semibold">Không có thông báo nào phù hợp.</div>`;
    return;
  }
  listEl.innerHTML = list.map(n => `
    <div onclick="markNotificationRead('${n.id}')" class="p-3 rounded-xl border ${n.read ? 'bg-white border-slate-200/80' : 'bg-orange-50/60 border-brand-200'} cursor-pointer transition-colors space-y-1">
      <div class="flex items-center justify-between gap-2">
        <span class="font-extrabold text-slate-900">${n.title}</span>
        <span class="text-[10px] text-slate-400 shrink-0">${n.time}</span>
      </div>
      <div class="text-[11px] text-slate-600">${n.desc}</div>
    </div>
  `).join('');
};

// Global Exports
window.handleNavRefundRequests = handleNavRefundRequests;
window.openProductSyncModal = openProductSyncModal;
window.closeProductSyncModal = closeProductSyncModal;
window.triggerProductSyncNow = triggerProductSyncNow;
window.openSupplierManagementModal = openSupplierManagementModal;
window.closeSupplierManagementModal = closeSupplierManagementModal;
window.openAgencyManagementModal = openAgencyManagementModal;
window.closeAgencyManagementModal = closeAgencyManagementModal;
window.openBankHubModal = openBankHubModal;
window.closeBankHubModal = closeBankHubModal;
window.openWebsiteB2CModal = openWebsiteB2CModal;
window.closeWebsiteB2CModal = closeWebsiteB2CModal;
window.openVatInvoicesModal = openVatInvoicesModal;
window.closeVatInvoicesModal = closeVatInvoicesModal;
window.openRbacModal = openRbacModal;
window.closeRbacModal = closeRbacModal;
window.switchRbacTab = switchRbacTab;
window.setNotificationsFilter = setNotificationsFilter;
window.openNotificationsCenterFiltered = openNotificationsCenterFiltered;
