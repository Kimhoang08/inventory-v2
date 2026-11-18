/* ==========================================================================
   Techera Portal — Phân tích Kênh Bán & Hiệu quả Kinh doanh (Analytics)
   Module độc lập cho analytics.html, đồng bộ 100% với TecheraDB và Chart.js.
   ========================================================================== */

let analyticsSiteChartInstance = null;
let analyticsCorpPieChartInstance = null;

// Tham chiếu dataset đơn hàng từ TecheraDB / orders.db.js
let reportOrdersDataset = (typeof TecheraDB !== 'undefined' && TecheraDB.getOrders)
  ? TecheraDB.getOrders()
  : (typeof generateMockOrdersDataset === 'function' ? generateMockOrdersDataset() : []);
window.reportOrdersDataset = reportOrdersDataset;

    const reportStates = {
      analytics: {
        channel: 'ALL',
        subType: 'ALL',
        staff: 'ALL',
        corp: 'ALL',
        site: 'ALL',
        dateTag: 'this_month',
        dateStart: '2026-11-01',
        dateEnd: '2026-11-18'
      },
      business: {
        channel: 'ALL',
        subType: 'ALL',
        staff: 'ALL',
        corp: 'ALL',
        site: 'ALL',
        dateTag: 'this_month',
        dateStart: '2026-11-01',
        dateEnd: '2026-11-18'
      }
    };

    function parseIsoDate(iso) {
      const [y, m, d] = iso.split('-').map(Number);
      return new Date(y, m - 1, d);
    }

    function toIsoDate(dt) {
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, '0');
      const d = String(dt.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }

    function formatDisplayDate(iso) {
      const [y, m, d] = iso.split('-');
      return `${d}/${m}/${y}`;
    }

    function diffDaysInclusive(startIso, endIso) {
      const s = parseIsoDate(startIso);
      const e = parseIsoDate(endIso);
      return Math.round((e - s) / 86400000);
    }

    function getAvailableStaffForFilter(channel, subType) {
      if (channel === 'Website') {
        if (subType === 'Booking' || subType === 'App') return ['-'];
        if (subType === 'CTV') return ['ALL', ...REPORT_STAFF_DIRECTORY.CTV];
        return ['ALL', ...REPORT_STAFF_DIRECTORY.CTV, '-'];
      }
      if (channel === 'Đại lý (TA)') {
        return ['ALL', ...REPORT_STAFF_DIRECTORY.TA];
      }
      if (channel === 'Nội bộ') {
        if (subType === 'M.A') return ['-'];
        if (subType === 'Sale') return ['ALL', ...REPORT_STAFF_DIRECTORY.Sale];
        return ['ALL', ...REPORT_STAFF_DIRECTORY.Sale, '-'];
      }
      return [
        'ALL',
        ...REPORT_STAFF_DIRECTORY.TA,
        ...REPORT_STAFF_DIRECTORY.CTV,
        ...REPORT_STAFF_DIRECTORY.Sale,
        '-'
      ];
    }

    function getAvailableSitesForFilter(corp) {
      if (corp === 'ALL') {
        return ['ALL', ...Object.values(REPORT_CORP_SITES).flat()];
      }
      return ['ALL', ...(REPORT_CORP_SITES[corp] || [])];
    }

    function syncReportFilterControls(reportKey) {
      const st = reportStates[reportKey];
      const prefix = reportKey;

      const chEl = document.getElementById(`${prefix}FilterChannel`);
      const subEl = document.getElementById(`${prefix}FilterSubType`);
      const corpEl = document.getElementById(`${prefix}FilterCorp`);
      const startEl = document.getElementById(`${prefix}DateStart`);
      const endEl = document.getElementById(`${prefix}DateEnd`);

      if (chEl) chEl.value = st.channel;
      if (corpEl) corpEl.value = st.corp;

      // Sync SubType options (depends on Channel)
      if (subEl) {
        const opts = REPORT_CHANNEL_SUBTYPES[st.channel] || REPORT_CHANNEL_SUBTYPES['ALL'];
        subEl.innerHTML = opts.map(o => `<option value="${o.value}">${o.label}</option>`).join('');
        const validVals = opts.map(o => o.value);
        if (!validVals.includes(st.subType)) {
          st.subType = opts[0].value;
        }
        subEl.value = st.subType;
        subEl.disabled = (st.channel === 'Đại lý (TA)' || st.channel === 'ALL');
      }

      // Sync Staff state (depends on Channel + SubType)
      const staffOpts = getAvailableStaffForFilter(st.channel, st.subType);
      if (!staffOpts.includes(st.staff)) {
        st.staff = staffOpts[0];
      }
      const staffBtn = document.getElementById(`${prefix}StaffBtn`);
      const staffLabel = document.getElementById(`${prefix}StaffLabel`);
      if (staffBtn) {
        staffBtn.disabled = (staffOpts.length === 1 && staffOpts[0] === '-');
      }
      if (staffLabel) {
        staffLabel.innerText = st.staff === 'ALL' ? 'Tất cả nhân viên' : (st.staff === '-' ? '- (Không áp dụng)' : st.staff);
      }

      // Sync Site state (depends on Corp)
      const siteOpts = getAvailableSitesForFilter(st.corp);
      if (!siteOpts.includes(st.site)) {
        st.site = 'ALL';
      }
      const siteLabel = document.getElementById(`${prefix}SiteLabel`);
      if (siteLabel) {
        siteLabel.innerText = st.site === 'ALL' ? 'Tất cả khu du lịch' : st.site;
      }

      // Sync Date tags + inputs
      document.querySelectorAll(`.${prefix}-date-tag`).forEach(btn => {
        const isAct = btn.dataset.tag === st.dateTag;
        btn.className = `${prefix}-date-tag px-3 py-1.5 rounded-full text-xs font-bold border cursor-pointer transition-all ${
          isAct
            ? 'border-brand-500 bg-brand-50 text-brand-600'
            : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300'
        } ${btn.dataset.tag === 'custom' ? 'inline-flex items-center gap-1' : ''}`;
      });
      if (startEl) startEl.value = st.dateStart;
      if (endEl) endEl.value = st.dateEnd;

      renderSearchableOptions(reportKey, 'staff');
      renderSearchableOptions(reportKey, 'site');
    }

    function toggleSearchableDropdown(reportKey, fieldKey) {
      const targetId = `${reportKey}${fieldKey === 'staff' ? 'Staff' : 'Site'}Popover`;
      const pop = document.getElementById(targetId);
      if (!pop) return;

      ['analyticsStaffPopover', 'analyticsSitePopover', 'businessStaffPopover', 'businessSitePopover'].forEach(id => {
        if (id !== targetId) {
          const el = document.getElementById(id);
          if (el) el.classList.add('hidden');
        }
      });

      pop.classList.toggle('hidden');
      if (!pop.classList.contains('hidden')) {
        renderSearchableOptions(reportKey, fieldKey);
        const searchEl = document.getElementById(`${reportKey}${fieldKey === 'staff' ? 'Staff' : 'Site'}Search`);
        if (searchEl) setTimeout(() => searchEl.focus(), 50);
      }
    }

    function renderSearchableOptions(reportKey, fieldKey) {
      const st = reportStates[reportKey];
      const cap = fieldKey === 'staff' ? 'Staff' : 'Site';
      const listEl = document.getElementById(`${reportKey}${cap}List`);
      const searchEl = document.getElementById(`${reportKey}${cap}Search`);
      if (!listEl) return;

      const query = (searchEl?.value || '').trim().toLowerCase();
      const rawOptions = fieldKey === 'staff'
        ? getAvailableStaffForFilter(st.channel, st.subType)
        : getAvailableSitesForFilter(st.corp);

      const filtered = rawOptions.filter(opt => {
        const display = opt === 'ALL'
          ? (fieldKey === 'staff' ? 'Tất cả nhân viên' : 'Tất cả khu du lịch')
          : opt;
        return display.toLowerCase().includes(query);
      });

      if (filtered.length === 0) {
        listEl.innerHTML = `<div class="px-2.5 py-2 text-slate-400 text-center">Không tìm thấy kết quả</div>`;
        return;
      }

      listEl.innerHTML = filtered.map(opt => {
        const selected = st[fieldKey] === opt;
        const label = opt === 'ALL'
          ? (fieldKey === 'staff' ? 'Tất cả nhân viên' : 'Tất cả khu du lịch')
          : opt;
        const safeOpt = opt.replace(/'/g, "\\'");
        return `
          <button type="button"
                  onclick="selectSearchableOption('${reportKey}', '${fieldKey}', '${safeOpt}')"
                  class="w-full text-left px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                    selected ? 'bg-brand-50 text-brand-600 font-bold' : 'text-slate-700 hover:bg-slate-50 font-medium'
                  }">
            <span class="truncate">${label}</span>
            ${selected ? '<span class="text-brand-500 text-[10px]">✓</span>' : ''}
          </button>
        `;
      }).join('');
    }

    function selectSearchableOption(reportKey, fieldKey, value) {
      reportStates[reportKey][fieldKey] = value;
      const cap = fieldKey === 'staff' ? 'Staff' : 'Site';
      const pop = document.getElementById(`${reportKey}${cap}Popover`);
      if (pop) pop.classList.add('hidden');
      syncReportFilterControls(reportKey);
      renderReportView(reportKey);
    }

    function onReportChannelChange(reportKey) {
      const chEl = document.getElementById(`${reportKey}FilterChannel`);
      reportStates[reportKey].channel = chEl ? chEl.value : 'ALL';
      reportStates[reportKey].subType = reportStates[reportKey].channel === 'Đại lý (TA)' ? '-' : 'ALL';
      reportStates[reportKey].staff = 'ALL';
      syncReportFilterControls(reportKey);
      renderReportView(reportKey);
    }

    function onReportSubTypeChange(reportKey) {
      const subEl = document.getElementById(`${reportKey}FilterSubType`);
      reportStates[reportKey].subType = subEl ? subEl.value : 'ALL';
      reportStates[reportKey].staff = 'ALL';
      syncReportFilterControls(reportKey);
      renderReportView(reportKey);
    }

    function onReportCorpChange(reportKey) {
      const corpEl = document.getElementById(`${reportKey}FilterCorp`);
      reportStates[reportKey].corp = corpEl ? corpEl.value : 'ALL';
      reportStates[reportKey].site = 'ALL';
      syncReportFilterControls(reportKey);
      renderReportView(reportKey);
    }

    function selectReportDateTag(reportKey, tag) {
      const st = reportStates[reportKey];
      st.dateTag = tag;
      if (tag === '7d') {
        st.dateStart = '2026-11-12';
        st.dateEnd = '2026-11-18';
      } else if (tag === '30d') {
        st.dateStart = '2026-10-20';
        st.dateEnd = '2026-11-18';
      } else if (tag === 'this_month') {
        st.dateStart = '2026-11-01';
        st.dateEnd = '2026-11-18';
      } else if (tag === 'quarter') {
        st.dateStart = '2026-10-01';
        st.dateEnd = '2026-11-18';
      }
      syncReportFilterControls(reportKey);
      renderReportView(reportKey);
    }

    function onReportCustomDateChange(reportKey) {
      const st = reportStates[reportKey];
      const startEl = document.getElementById(`${reportKey}DateStart`);
      const endEl = document.getElementById(`${reportKey}DateEnd`);
      if (!startEl || !endEl || !startEl.value || !endEl.value) return;

      let startIso = startEl.value;
      let endIso = endEl.value;

      if (startIso > endIso) {
        const tmp = startIso;
        startIso = endIso;
        endIso = tmp;
      }

      // Business Rule: Tùy chỉnh tối đa 3 tháng (92 ngày)
      const diff = diffDaysInclusive(startIso, endIso);
      if (diff > 92) {
        const capped = parseIsoDate(startIso);
        capped.setDate(capped.getDate() + 92);
        endIso = toIsoDate(capped);
        showToast('Giới hạn khoảng thời gian', 'Bộ lọc thời gian tùy chỉnh cho phép chọn tối đa 3 tháng.', 'error');
      }

      st.dateTag = 'custom';
      st.dateStart = startIso;
      st.dateEnd = endIso;
      syncReportFilterControls(reportKey);
      renderReportView(reportKey);
    }

    function resetReportFilters(reportKey) {
      reportStates[reportKey] = {
        channel: 'ALL',
        subType: 'ALL',
        staff: 'ALL',
        corp: 'ALL',
        site: 'ALL',
        dateTag: 'this_month',
        dateStart: '2026-11-01',
        dateEnd: '2026-11-18'
      };
      if (reportKey === 'analytics' && analyticsRangePickerInstance) {
        analyticsRangePickerInstance.setRange('2026-11-01', '2026-11-18', 'this_month');
      }
      const staffSearch = document.getElementById(`${reportKey}StaffSearch`);
      const siteSearch = document.getElementById(`${reportKey}SiteSearch`);
      if (staffSearch) staffSearch.value = '';
      if (siteSearch) siteSearch.value = '';
      syncReportFilterControls(reportKey);
      renderReportView(reportKey);
      showToast('Làm mới bộ lọc', 'Đã đặt lại bộ lọc về mặc định.');
    }

    function renderReportView(reportKey) {
      if (reportKey === 'analytics') renderAnalyticsReport();
      else if (typeof renderBusinessReport === "function") renderBusinessReport();
    }

    function filterOrdersByDimensions(orders, st) {
      const seenCodes = new Set();
      return orders.filter(o => {
        // Chỉ tính 1 mã đơn, cho dù có đổi trạng thái
        if (seenCodes.has(o.orderCode)) return false;
        seenCodes.add(o.orderCode);

        if (st.channel !== 'ALL' && o.channel !== st.channel) return false;
        if (st.subType !== 'ALL' && o.subType !== st.subType) return false;
        if (st.staff !== 'ALL' && o.staff !== st.staff) return false;
        if (st.corp !== 'ALL' && o.corp !== st.corp) return false;
        if (st.site !== 'ALL' && o.site !== st.site) return false;
        return true;
      });
    }

    function getOrdersInWindow(st, startIso, endIso, includeDraftUseDateWindow = false) {
      const dimOrders = filterOrdersByDimensions(reportOrdersDataset, st);
      return dimOrders.filter(o => {
        if (o.status === 'Nháp' && includeDraftUseDateWindow) {
          // Đơn Nháp tính từ thời điểm "Ngày sử dụng" trở về trước 30 ngày:
          // Ngày sử dụng có trong bộ lọc thời gian -> Tính Dự kiến; không có -> Không tính
          const inFilterRange = (o.useDate >= startIso && o.useDate <= endIso);
          const daysToUse = diffDaysInclusive(REPORT_TODAY, o.useDate);
          return inFilterRange && daysToUse <= 30 && daysToUse >= -30;
        }
        return o.createdDate >= startIso && o.createdDate <= endIso;
      });
    }

    // -------------------------------------------------------------------------
    // A. BÁO CÁO PHÂN TÍCH RENDERER
    // -------------------------------------------------------------------------
    function renderContributionCardBars(containerId, items, totalVal, valueFormatter, barColorCls) {
      const el = document.getElementById(containerId);
      if (!el) return;
      if (items.length === 0 || totalVal <= 0) {
        el.innerHTML = `<div class="text-xs text-slate-400 italic py-2">Chưa có dữ liệu đóng góp trong bộ lọc.</div>`;
        return;
      }
      el.innerHTML = items.map(item => {
        const pct = totalVal > 0 ? ((item.value / totalVal) * 100) : 0;
        return `
          <div class="space-y-1">
            <div class="flex items-center justify-between text-xs">
              <span class="font-bold text-slate-700">${item.label}</span>
              <span class="font-extrabold text-slate-900">${valueFormatter(item.value)} <span class="text-slate-400 font-semibold">(${pct.toFixed(1)}%)</span></span>
            </div>
            <div class="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div class="h-full rounded-full ${item.color || barColorCls}" style="width: ${Math.max(4, pct).toFixed(1)}%"></div>
            </div>
          </div>
        `;
      }).join('');
    }

    function renderAnalyticsReport() {
      if (!analyticsRangePickerInstance && typeof initAnalyticsDateRangePicker === 'function') {
        initAnalyticsDateRangePicker();
      }
      const st = reportStates.analytics;
      syncReportFilterControls('analytics');

      // Lấy các đơn hợp lệ (không tính Hủy / Hoàn tiền) trong khoảng thời gian lọc
      const orders = getOrdersInWindow(st, st.dateStart, st.dateEnd, false)
        .filter(o => o.status !== 'Đã hủy' && o.status !== 'Hoàn tiền');

      const totalProfit = orders.reduce((s, o) => s + o.profit, 0);
      const totalRevenue = orders.reduce((s, o) => s + o.revenue, 0);
      const totalTickets = orders.reduce((s, o) => s + o.tickets, 0);

      const profitEl = document.getElementById('analyticsProfitTotal');
      const revEl = document.getElementById('analyticsRevenueTotal');
      const tickEl = document.getElementById('analyticsTicketsTotal');
      if (profitEl) profitEl.innerText = `${formatMoney(totalProfit)} đ`;
      if (revEl) revEl.innerText = `${formatMoney(totalRevenue)} đ`;
      if (tickEl) tickEl.innerText = `${totalTickets} vé`;

      // Business Rule: Khi chọn 1 nhân viên phụ trách cụ thể -> chỉ hiển thị số tổng, ẩn thanh tiến độ & giá trị
      const isSingleStaff = (st.staff !== 'ALL' && st.staff !== '-');
      const profitBars = document.getElementById('analyticsProfitBars');
      const revBars = document.getElementById('analyticsRevenueBars');
      const tickBars = document.getElementById('analyticsTicketsBars');

      if (isSingleStaff) {
        [profitBars, revBars, tickBars].forEach(b => {
          if (b) {
            b.classList.add('hidden');
            b.innerHTML = '';
          }
        });
      } else {
        [profitBars, revBars, tickBars].forEach(b => {
          if (b) b.classList.remove('hidden');
        });

        const channelsMeta = [
          { key: 'Đại lý (TA)', label: 'Đại lý (TA)', color: 'bg-blue-500' },
          { key: 'Website', label: 'Website', color: 'bg-brand-500' },
          { key: 'Nội bộ', label: 'Nội bộ', color: 'bg-emerald-500' }
        ];

        const groupByChannel = (prop) => channelsMeta
          .map(ch => ({
            label: ch.label,
            color: ch.color,
            value: orders.filter(o => o.channel === ch.key).reduce((s, o) => s + o[prop], 0)
          }))
          .filter(x => x.value > 0);

        renderContributionCardBars('analyticsProfitBars', groupByChannel('profit'), totalProfit, v => `${formatMoney(v)} đ`, 'bg-emerald-500');
        renderContributionCardBars('analyticsRevenueBars', groupByChannel('revenue'), totalRevenue, v => `${formatMoney(v)} đ`, 'bg-blue-500');
        renderContributionCardBars('analyticsTicketsBars', groupByChannel('tickets'), totalTickets, v => `${v} vé`, 'bg-orange-500');
      }

      // 4. Doanh thu theo Khu du lịch (Site) - Bar Chart
      const siteMap = {};
      orders.forEach(o => {
        siteMap[o.site] = (siteMap[o.site] || 0) + o.revenue;
      });
      const siteEntries = Object.entries(siteMap).sort((a, b) => b[1] - a[1]);
      const siteCanvas = document.getElementById('analyticsSiteChart');
      if (siteCanvas && typeof Chart !== 'undefined') {
        if (analyticsSiteChartInstance) analyticsSiteChartInstance.destroy();
        analyticsSiteChartInstance = new Chart(siteCanvas.getContext('2d'), {
          type: 'bar',
          data: {
            labels: siteEntries.map(([name]) => name.replace('Sun World ', '').replace('VinWonders ', 'VW ')),
            datasets: [{
              label: 'Doanh thu (triệu đ)',
              data: siteEntries.map(([, val]) => +(val / 1000000).toFixed(2)),
              backgroundColor: '#F15A24',
              borderRadius: 8,
              maxBarThickness: 38
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: '#0F172A',
                callbacks: {
                  label: (ctx) => ` Doanh thu: ${ctx.parsed.y.toFixed(2)} triệu đ`
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: { color: '#E2E8F0' },
                border: { display: false, dash: [4, 4] },
                ticks: { font: { size: 11, weight: '600' }, color: '#64748B' }
              },
              x: {
                grid: { display: false },
                border: { display: false },
                ticks: { font: { size: 11, weight: '600' }, color: '#475569' }
              }
            }
          }
        });
      }

      // 5. Doanh thu theo Tập đoàn (Biểu đồ tròn)
      const corpColors = {
        'Sun World': '#F15A24',
        'VinWonders': '#3B82F6',
        'Khác': '#10B981'
      };
      const corpTotals = ['Sun World', 'VinWonders', 'Khác']
        .map(c => ({
          name: c,
          value: orders.filter(o => o.corp === c).reduce((s, o) => s + o.revenue, 0),
          color: corpColors[c]
        }))
        .filter(c => c.value > 0);

      const corpCanvas = document.getElementById('analyticsCorpPieChart');
      const corpLegend = document.getElementById('analyticsCorpLegend');
      if (corpCanvas && typeof Chart !== 'undefined') {
        if (analyticsCorpPieChartInstance) analyticsCorpPieChartInstance.destroy();
        analyticsCorpPieChartInstance = new Chart(corpCanvas.getContext('2d'), {
          type: 'doughnut',
          data: {
            labels: corpTotals.map(c => c.name),
            datasets: [{
              data: corpTotals.map(c => +(c.value / 1000000).toFixed(2)),
              backgroundColor: corpTotals.map(c => c.color),
              borderWidth: 2,
              borderColor: '#FFFFFF'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '62%',
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: '#0F172A',
                callbacks: {
                  label: (ctx) => ` ${ctx.label}: ${ctx.parsed.toFixed(2)} triệu đ`
                }
              }
            }
          }
        });
      }

      if (corpLegend) {
        if (corpTotals.length === 0) {
          corpLegend.innerHTML = `<div class="text-slate-400 italic">Không có dữ liệu</div>`;
        } else {
          corpLegend.innerHTML = corpTotals.map(c => {
            const pct = totalRevenue > 0 ? ((c.value / totalRevenue) * 100).toFixed(1) : '0.0';
            return `
              <div class="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="w-3 h-3 rounded-full shrink-0" style="background:${c.color}"></span>
                  <span class="font-bold text-slate-800 truncate">${c.name}</span>
                </div>
                <div class="text-right shrink-0">
                  <div class="font-extrabold text-slate-900">${formatMoney(c.value)} đ</div>
                  <div class="text-[10px] font-bold text-slate-400">${pct}%</div>
                </div>
              </div>
            `;
          }).join('');
        }
      }

      if (window.lucide) lucide.createIcons();
    }

    let currentAnalyticsModalMetric = 'revenue';
    let currentAnalyticsModalTab = 'Website';

    function openAnalyticsDetailModal(metricType) {
      currentAnalyticsModalMetric = metricType;
      const modal = document.getElementById('modalAnalyticsDetail');
      const titleEl = document.getElementById('modalAnalyticsDetailTitle');
      const subEl = document.getElementById('modalAnalyticsDetailSubtitle');
      if (!modal) return;

      const titles = {
        profit: 'Chi tiết Lợi nhuận đóng góp',
        revenue: 'Chi tiết Doanh thu đóng góp',
        tickets: 'Chi tiết Tỷ lệ số lượng theo vé'
      };
      if (titleEl) titleEl.innerText = titles[metricType] || 'Chi tiết phân tích';

      const st = reportStates.analytics;
      const isAllFiltersDefault = (
        st.channel === 'ALL' &&
        st.subType === 'ALL' &&
        st.staff === 'ALL' &&
        st.corp === 'ALL' &&
        st.site === 'ALL'
      );

      if (subEl) {
        subEl.innerText = isAllFiltersDefault
          ? 'TH 1: Hiển thị toàn bộ dữ liệu theo 3 tab Kênh bán (Website | Đại lý | Nội bộ)'
          : 'TH 2: Chỉ hiển thị tab & khu vực chứa dữ liệu phù hợp bộ lọc';
      }

      const orders = getOrdersInWindow(st, st.dateStart, st.dateEnd, false)
        .filter(o => o.status !== 'Đã hủy' && o.status !== 'Hoàn tiền');

      const tabConfigs = [
        { tabKey: 'Website', channelName: 'Website', types: ['Booking', 'App', 'CTV'] },
        { tabKey: 'Đại lý', channelName: 'Đại lý (TA)', types: ['-'] },
        { tabKey: 'Nội bộ', channelName: 'Nội bộ', types: ['Sale', 'M.A'] }
      ];

      // TH 1: tất cả bộ lọc là Tất cả -> hiện cả 3 tab; TH 2: chỉ hiển thị tab chứa dữ liệu khớp bộ lọc
      const visibleTabs = isAllFiltersDefault
        ? tabConfigs
        : tabConfigs.filter(tc => orders.some(o => o.channel === tc.channelName));

      const tabsEl = document.getElementById('modalAnalyticsDetailTabs');
      const bodyEl = document.getElementById('modalAnalyticsDetailBody');
      const footEl = document.getElementById('modalAnalyticsDetailFootNote');

      if (visibleTabs.length === 0) {
        if (tabsEl) tabsEl.innerHTML = '';
        if (bodyEl) bodyEl.innerHTML = `<div class="py-10 text-center text-slate-400 font-medium">Không có dữ liệu phù hợp với bộ lọc hiện tại.</div>`;
        if (footEl) footEl.innerText = '0 bản ghi';
      } else {
        if (!visibleTabs.some(t => t.tabKey === currentAnalyticsModalTab)) {
          currentAnalyticsModalTab = visibleTabs[0].tabKey;
        }
        renderAnalyticsModalTabsAndBody(visibleTabs, orders, isAllFiltersDefault);
      }

      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function renderAnalyticsModalTabsAndBody(visibleTabs, orders, isAllFiltersDefault) {
      const tabsEl = document.getElementById('modalAnalyticsDetailTabs');
      const bodyEl = document.getElementById('modalAnalyticsDetailBody');
      const footEl = document.getElementById('modalAnalyticsDetailFootNote');

      if (tabsEl) {
        tabsEl.innerHTML = visibleTabs.map(tc => {
          const isAct = tc.tabKey === currentAnalyticsModalTab;
          return `
            <button type="button"
                    onclick="switchAnalyticsModalTab('${tc.tabKey}')"
                    class="px-4 py-2.5 text-xs font-extrabold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                      isAct ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                    }">
              ${tc.tabKey}
            </button>
          `;
        }).join('');
      }

      const activeConfig = visibleTabs.find(t => t.tabKey === currentAnalyticsModalTab) || visibleTabs[0];
      const tabOrders = orders.filter(o => o.channel === activeConfig.channelName);
      const grandTotalMetric = orders.reduce((s, o) => s + (currentAnalyticsModalMetric === 'profit' ? o.profit : (currentAnalyticsModalMetric === 'tickets' ? o.tickets : o.revenue)), 0);

      // Trong từng tab, chia khu vực theo Loại
      const visibleTypes = isAllFiltersDefault
        ? activeConfig.types
        : activeConfig.types.filter(tp => tabOrders.some(o => o.subType === tp));

      if (bodyEl) {
        bodyEl.innerHTML = visibleTypes.map(tp => {
          const typeOrders = tabOrders.filter(o => o.subType === tp);
          const typeLabel = tp === '-' ? 'Đại lý (TA)' : tp;
          const totalRev = typeOrders.reduce((s, o) => s + o.revenue, 0);
          const totalProfit = typeOrders.reduce((s, o) => s + o.profit, 0);
          const totalTickets = typeOrders.reduce((s, o) => s + o.tickets, 0);

          const rowsHtml = typeOrders.length === 0
            ? `<div class="p-3 text-xs text-slate-400 italic">Không có phát sinh trong giai đoạn này.</div>`
            : typeOrders.map(o => {
                const val = currentAnalyticsModalMetric === 'profit' ? o.profit : (currentAnalyticsModalMetric === 'tickets' ? o.tickets : o.revenue);
                const share = grandTotalMetric > 0 ? ((val / grandTotalMetric) * 100).toFixed(1) : '0.0';
                return `
                  <div class="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 bg-white border-t border-slate-100 text-xs">
                    <div class="min-w-0">
                      <div class="font-bold text-slate-800">${o.staff === '-' ? o.customerName : o.staff}</div>
                      <div class="text-[11px] text-slate-400">${o.orderCode} • ${o.site}</div>
                    </div>
                    <div class="flex items-center gap-4 shrink-0 text-right">
                      <div>
                        <div class="text-[10px] text-slate-400 font-semibold">Số vé</div>
                        <div class="font-bold text-slate-700">${o.tickets}</div>
                      </div>
                      <div>
                        <div class="text-[10px] text-slate-400 font-semibold">Doanh thu</div>
                        <div class="font-bold text-slate-900">${formatMoney(o.revenue)} đ</div>
                      </div>
                      <div>
                        <div class="text-[10px] text-slate-400 font-semibold">Lợi nhuận</div>
                        <div class="font-bold text-emerald-600">${formatMoney(o.profit)} đ</div>
                      </div>
                      <span class="px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 font-extrabold text-[11px]">${share}%</span>
                    </div>
                  </div>
                `;
              }).join('');

          return `
            <div class="rounded-2xl border border-slate-200/80 overflow-hidden bg-slate-50/70">
              <div class="px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 bg-slate-100/80">
                <span class="font-extrabold text-xs text-slate-800">Loại: ${typeLabel} (${typeOrders.length} đơn)</span>
                <div class="flex items-center gap-3 text-[11px] font-bold text-slate-600">
                  <span>Vé: <strong class="text-slate-900">${totalTickets}</strong></span>
                  <span>DT: <strong class="text-blue-700">${formatMoney(totalRev)} đ</strong></span>
                  <span>LN: <strong class="text-emerald-600">${formatMoney(totalProfit)} đ</strong></span>
                </div>
              </div>
              <div>${rowsHtml}</div>
            </div>
          `;
        }).join('');
      }

      if (footEl) {
        footEl.innerText = `Hiển thị ${tabOrders.length} đơn trong tab ${activeConfig.tabKey}`;
      }
    }

    function switchAnalyticsModalTab(tabKey) {
      currentAnalyticsModalTab = tabKey;
      openAnalyticsDetailModal(currentAnalyticsModalMetric);
    }

    function closeReportModal(modalId) {
      const m = document.getElementById(modalId);
      if (m) {
        m.classList.remove('flex');
        m.classList.add('hidden');
      }
    }

    // -------------------------------------------------------------------------
    // B. BÁO CÁO HIỆU QUẢ KINH DOANH RENDERER
    // -------------------------------------------------------------------------
    function formatPctDiffHtml(curr, prev) {
      if (prev <= 0 && curr <= 0) {
        return `<span class="text-emerald-600">↑ 0.00%</span> <span class="text-slate-400 font-medium">so với kỳ trước</span>`;
      }
      if (prev <= 0 && curr > 0) {
        return `<span class="text-emerald-600">↑ 100.00%</span> <span class="text-slate-400 font-medium">so với kỳ trước</span>`;
      }
      const pct = ((curr - prev) / prev) * 100;
      const isUp = pct >= 0;
      const cls = isUp ? 'text-emerald-600' : 'text-rose-500';
      const arrow = isUp ? '↑' : '↓';
      return `<span class="${cls}">${arrow} ${Math.abs(pct).toFixed(2)}%</span> <span class="text-slate-400 font-medium">so với kỳ trước</span>`;
    }

    function getStatusBadgeHtml(status) {
      const map = {
        'Đã xuất vé': 'bg-emerald-50 text-emerald-700 border-emerald-200',
        'Đã xác nhận': 'bg-blue-50 text-blue-700 border-blue-200',
        'Đang xử lý': 'bg-amber-50 text-amber-700 border-amber-200',
        'Nháp': 'bg-slate-100 text-slate-600 border-slate-200',
        'Đã hủy': 'bg-rose-50 text-rose-600 border-rose-200',
        'Hoàn tiền': 'bg-purple-50 text-purple-700 border-purple-200'
      };
      const cls = map[status] || 'bg-slate-100 text-slate-700 border-slate-200';
      return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${cls}">${status}</span>`;
    }



let analyticsRangePickerInstance = null;

function initAnalyticsDateRangePicker() {
  if (typeof createStandardDateRangePicker === 'function' && document.getElementById('analytics_btnDateTrigger')) {
    if (!analyticsRangePickerInstance) {
      analyticsRangePickerInstance = createStandardDateRangePicker({
        prefix: 'analytics',
        defaultStart: reportStates.analytics.dateStart || '2026-11-01',
        defaultEnd: reportStates.analytics.dateEnd || '2026-11-18',
        defaultPreset: 'this_month',
        onApply: (start, end, preset) => {
          reportStates.analytics.dateStart = start;
          reportStates.analytics.dateEnd = end;
          reportStates.analytics.dateTag = preset;
          renderAnalyticsReport();
        }
      });
    }
  }
}

// Tự động khởi chạy khi load trang analytics
window.addEventListener('DOMContentLoaded', () => {
  initAnalyticsDateRangePicker();
  if (document.getElementById('viewReportAnalytics') || document.getElementById('analyticsSiteChart') || document.getElementById('analyticsCorpPieChart') || document.getElementById('analytics_btnDateTrigger')) {
    renderAnalyticsReport();
  }
});

// Xuất các hàm ra phạm vi toàn cục cho inline event handlers
window.initAnalyticsDateRangePicker = initAnalyticsDateRangePicker;
window.resetReportFilters = resetReportFilters;
window.onReportChannelChange = onReportChannelChange;
window.onReportSubTypeChange = onReportSubTypeChange;
window.onReportCorpChange = onReportCorpChange;
window.toggleSearchableDropdown = toggleSearchableDropdown;
window.renderSearchableOptions = renderSearchableOptions;
window.selectSearchableOption = selectSearchableOption;
window.selectReportDateTag = selectReportDateTag;
window.onReportCustomDateChange = onReportCustomDateChange;
window.openAnalyticsDetailModal = openAnalyticsDetailModal;
window.closeReportModal = closeReportModal;
window.renderAnalyticsReport = renderAnalyticsReport;
