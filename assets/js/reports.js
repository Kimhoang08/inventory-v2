/* ==========================================================================
   Techera Portal — Báo cáo & Phân tích (Dashboard, Analytics, Business Report)
   Trích xuất nguyên bản từ index01.html (dòng 12927-13438, 13741-13831, 14114-15193).
   ========================================================================== */

let analyticsSiteChartInstance = null;
let analyticsCorpPieChartInstance = null;

// Tham chiếu dataset đơn hàng từ TecheraDB / orders.db.js
let reportOrdersDataset = (typeof TecheraDB !== "undefined" && TecheraDB.getOrders)
  ? TecheraDB.getOrders()
  : (typeof generateMockOrdersDataset === "function" ? generateMockOrdersDataset() : []);
window.reportOrdersDataset = reportOrdersDataset;

    // =========================================================================
    // 11B. DASHBOARD TỔNG QUAN ENGINE (KPI, CHART.JS & CHANNEL REVENUE)
    // =========================================================================
    let revenueChartInstance = null;

    const dashboardPresets = {
      nov_1_10: {
        rangeLabel: '01/11/2026 - 18/11/2026',
        kpis: {
          revenue: { value: '6.4M', fullValue: '6.400.000 đ', dir: 'down', pct: '29.48%' },
          tickets: { value: '10', dir: 'down', pct: '33.33%' },
          agencies: { value: '8', dir: 'up', pct: '14.29%' },
          kols: { value: '25', dir: 'up', pct: '0.00%' },
          completion: { value: '25.00%', dir: 'up', pct: '8.33%' }
        },
        chart: {
          labels: ['01/11', '03/11', '05/11', '07/11', '09/11', '11/11', '13/11', '15/11', '17/11', '18/11'],
          agency:  [1.2, 1.8, 1.1, 2.4, 3.1, 2.0, 3.6, 2.9, 4.1, 3.3],
          kol:     [0.4, 0.7, 0.5, 0.9, 1.2, 0.8, 1.4, 1.1, 1.6, 1.2],
          booking: [0.3, 0.5, 0.4, 0.6, 0.8, 0.7, 0.9, 0.8, 1.1, 0.9],
          internal:[0.2, 0.3, 0.2, 0.4, 0.5, 0.3, 0.6, 0.4, 0.7, 0.5],
          total:   [2.1, 3.3, 2.2, 4.3, 5.6, 3.8, 6.5, 5.2, 7.5, 5.9]
        }
      },
      oct_full: {
        rangeLabel: '01/10/2026 - 31/10/2026',
        kpis: {
          revenue: { value: '9.1M', fullValue: '9.100.000 đ', dir: 'up', pct: '18.20%' },
          tickets: { value: '15', dir: 'up', pct: '25.00%' },
          agencies: { value: '7', dir: 'up', pct: '16.67%' },
          kols: { value: '25', dir: 'up', pct: '4.17%' },
          completion: { value: '23.08%', dir: 'up', pct: '5.10%' }
        },
        chart: {
          labels: ['01/10', '05/10', '09/10', '13/10', '17/10', '21/10', '25/10', '28/10', '30/10', '31/10'],
          agency:  [2.1, 2.6, 1.9, 3.2, 3.8, 3.0, 4.0, 3.4, 4.3, 3.9],
          kol:     [0.8, 1.0, 0.7, 1.1, 1.3, 1.0, 1.5, 1.2, 1.6, 1.4],
          booking: [0.5, 0.6, 0.5, 0.8, 0.9, 0.7, 1.0, 0.9, 1.2, 1.0],
          internal:[0.3, 0.4, 0.3, 0.5, 0.6, 0.4, 0.6, 0.5, 0.7, 0.6],
          total:   [3.7, 4.6, 3.4, 5.6, 6.6, 5.1, 7.1, 6.0, 7.8, 6.9]
        }
      },
      last_7: {
        rangeLabel: '12/11/2026 - 18/11/2026',
        kpis: {
          revenue: { value: '5.1M', fullValue: '5.100.000 đ', dir: 'down', pct: '12.40%' },
          tickets: { value: '8', dir: 'down', pct: '11.11%' },
          agencies: { value: '8', dir: 'up', pct: '14.29%' },
          kols: { value: '25', dir: 'up', pct: '0.00%' },
          completion: { value: '28.50%', dir: 'up', pct: '10.12%' }
        },
        chart: {
          labels: ['12/11', '13/11', '14/11', '15/11', '16/11', '17/11', '18/11'],
          agency:  [2.4, 3.1, 2.0, 3.6, 2.9, 4.1, 3.3],
          kol:     [0.9, 1.2, 0.8, 1.4, 1.1, 1.6, 1.2],
          booking: [0.6, 0.8, 0.7, 0.9, 0.8, 1.1, 0.9],
          internal:[0.4, 0.5, 0.3, 0.6, 0.4, 0.7, 0.5],
          total:   [4.3, 5.6, 3.8, 6.5, 5.2, 7.5, 5.9]
        }
      },
      nov_full: {
        rangeLabel: '01/11/2026 - 18/11/2026',
        kpis: {
          revenue: { value: '6.4M', fullValue: '6.400.000 đ', dir: 'down', pct: '29.48%' },
          tickets: { value: '10', dir: 'down', pct: '33.33%' },
          agencies: { value: '8', dir: 'up', pct: '14.29%' },
          kols: { value: '25', dir: 'up', pct: '0.00%' },
          completion: { value: '25.00%', dir: 'up', pct: '8.33%' }
        },
        chart: {
          labels: ['01/11', '03/11', '05/11', '07/11', '09/11', '11/11', '13/11', '15/11', '17/11', '18/11'],
          agency:  [1.2, 1.8, 1.1, 2.4, 3.1, 2.0, 3.6, 2.9, 4.1, 3.3],
          kol:     [0.4, 0.7, 0.5, 0.9, 1.2, 0.8, 1.4, 1.1, 1.6, 1.2],
          booking: [0.3, 0.5, 0.4, 0.6, 0.8, 0.7, 0.9, 0.8, 1.1, 0.9],
          internal:[0.2, 0.3, 0.2, 0.4, 0.5, 0.3, 0.6, 0.4, 0.7, 0.5],
          total:   [2.1, 3.3, 2.2, 4.3, 5.6, 3.8, 6.5, 5.2, 7.5, 5.9]
        }
      }
    };

    const channelRevenueData = [
      { rank: 1, avatar: 'BM', name: 'CONG TY TNHH DVDL BA MIEN HCM', role: 'ĐẠI LÝ', tickets: 42, revenue: '36.850.000 đ', growthDir: 'up', growthPct: '18.40%' },
      { rank: 2, avatar: 'SG', name: 'SAIGON TOURIST PRO B2B', role: 'ĐẠI LÝ', tickets: 35, revenue: '31.200.000 đ', growthDir: 'up', growthPct: '14.20%' },
      { rank: 3, avatar: 'TE', name: 'TECHERA NỘI BỘ', role: 'NỘI BỘ', tickets: 28, revenue: '24.650.000 đ', growthDir: 'up', growthPct: '12.50%' },
      { rank: 4, avatar: 'VH', name: 'DU LỊCH VIỆT HOLIDAY', role: 'ĐẠI LÝ', tickets: 24, revenue: '20.400.000 đ', growthDir: 'down', growthPct: '5.19%' },
      { rank: 5, avatar: 'MA', name: 'CTV MINH ANH TRAVEL', role: 'ĐẠI LÝ', tickets: 19, revenue: '16.920.000 đ', growthDir: 'up', growthPct: '9.80%' },
      { rank: 6, avatar: 'VT', name: 'VIETRAVEL ĐỐI TÁC B2B', role: 'ĐẠI LÝ', tickets: 17, revenue: '14.750.000 đ', growthDir: 'up', growthPct: '7.45%' },
      { rank: 7, avatar: 'NA', name: 'NGUYỄN VĂN AN (SALE)', role: 'NỘI BỘ', tickets: 15, revenue: '12.600.000 đ', growthDir: 'up', growthPct: '11.10%' },
      { rank: 8, avatar: 'TV', name: 'KOL THẢO VY REVIEW', role: 'ĐẠI LÝ', tickets: 14, revenue: '11.450.000 đ', growthDir: 'down', growthPct: '3.25%' },
      { rank: 9, avatar: 'HN', name: 'CTV HOÀNG NAM TOUR', role: 'ĐẠI LÝ', tickets: 12, revenue: '9.800.000 đ', growthDir: 'up', growthPct: '6.30%' },
      { rank: 10, avatar: 'TM', name: 'TRẦN THỊ MAI (ADMIN)', role: 'NỘI BỘ', tickets: 10, revenue: '8.450.000 đ', growthDir: 'up', growthPct: '4.90%' },
      { rank: 11, avatar: 'PH', name: 'PHÚ QUỐC SUNSHINE TOURS', role: 'ĐẠI LÝ', tickets: 8, revenue: '6.900.000 đ', growthDir: 'down', growthPct: '2.15%' },
      { rank: 12, avatar: 'QB', name: 'LÊ QUỐC BẢO (SALE)', role: 'NỘI BỘ', tickets: 6, revenue: '4.520.000 đ', growthDir: 'up', growthPct: '8.05%' }
    ];

    let dashChannelPage = 1;
    const DASH_CHANNEL_PAGE_SIZE = 5;

    /**
     * Render unified pagination footer bar for Dashboard & Report tables.
     */
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
        <div class="flex items-center gap-1.5">
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

    function changeDashChannelPage(page) {
      const totalPages = Math.max(1, Math.ceil(channelRevenueData.length / DASH_CHANNEL_PAGE_SIZE));
      dashChannelPage = Math.min(Math.max(1, page), totalPages);
      renderChannelRevenueSection();
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function renderKpiTrendHtml(trend) {
      const isUp = trend.dir === 'up';
      const colorCls = isUp ? 'text-emerald-600' : 'text-rose-500';
      const arrow = isUp ? '↑' : '↓';
      return `
        <span class="inline-flex items-center gap-0.5 font-bold ${colorCls}">
          <span>${arrow}</span><span>${trend.pct}</span>
        </span>
        <span class="text-slate-400">so với tháng trước</span>
      `;
    }

    function updateDashboardKpis(kpis) {
      const map = [
        ['kpiTotalRevenue', 'kpiTotalRevenueTrend', kpis.revenue],
        ['kpiTotalTickets', 'kpiTotalTicketsTrend', kpis.tickets],
        ['kpiActiveAgencies', 'kpiActiveAgenciesTrend', kpis.agencies],
        ['kpiActiveKols', 'kpiActiveKolsTrend', kpis.kols],
        ['kpiCompletionRate', 'kpiCompletionRateTrend', kpis.completion]
      ];
      map.forEach(([valId, trendId, item]) => {
        const valEl = document.getElementById(valId);
        const trendEl = document.getElementById(trendId);
        if (valEl) {
          valEl.innerText = item.value;
          if (item.fullValue) {
            valEl.setAttribute('title', item.fullValue);
            valEl.classList.add('cursor-help');
          } else {
            valEl.removeAttribute('title');
            valEl.classList.remove('cursor-help');
          }
        }
        if (trendEl) trendEl.innerHTML = renderKpiTrendHtml(item);
      });
    }

    function initDashboardChart(chartData) {
      const canvas = document.getElementById('revenueTimelineChart');
      if (!canvas || typeof Chart === 'undefined') return;

      if (revenueChartInstance) {
        revenueChartInstance.destroy();
      }

      const makeDataset = (label, data, color) => ({
        label,
        data,
        borderColor: color,
        backgroundColor: color,
        borderWidth: 2.5,
        tension: 0.4,
        fill: false,
        pointBackgroundColor: '#FFFFFF',
        pointBorderColor: color,
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#FFFFFF',
        pointHoverBorderColor: color,
        pointHoverBorderWidth: 2.5
      });

      revenueChartInstance = new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: {
          labels: chartData.labels,
          datasets: [
            makeDataset('Đại lý', chartData.agency, '#3B82F6'),
            makeDataset('CTV/KOL', chartData.kol, '#8B5CF6'),
            makeDataset('Booking', chartData.booking, '#F15A24'),
            makeDataset('Nội bộ', chartData.internal, '#22C55E'),
            makeDataset('Tổng doanh thu', chartData.total, '#14B8A6')
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: '#0F172A',
              titleColor: '#F8FAFC',
              bodyColor: '#E2E8F0',
              padding: 10,
              cornerRadius: 10,
              usePointStyle: true,
              callbacks: {
                label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)} triệu đ`
              }
            }
          },
          scales: {
            y: {
              min: 0,
              max: 8,
              ticks: {
                stepSize: 2,
                color: '#64748B',
                font: {
                  family: '"Plus Jakarta Sans", Inter, sans-serif',
                  size: 11,
                  weight: '600'
                },
                padding: 8
              },
              border: {
                display: false,
                dash: [4, 4]
              },
              grid: {
                color: '#E2E8F0',
                tickLength: 0
              }
            },
            x: {
              ticks: {
                color: '#64748B',
                font: {
                  family: '"Plus Jakarta Sans", Inter, sans-serif',
                  size: 11,
                  weight: '600'
                },
                padding: 8
              },
              border: {
                display: false
              },
              grid: {
                display: false
              }
            }
          }
        }
      });
    }

    function toggleChartDataset(datasetIndex, btnEl) {
      if (!revenueChartInstance) return;
      const isVisible = revenueChartInstance.isDatasetVisible(datasetIndex);
      revenueChartInstance.setDatasetVisibility(datasetIndex, !isVisible);
      revenueChartInstance.update();
      if (btnEl) {
        btnEl.classList.toggle('opacity-40', isVisible);
      }
    }

    function renderChannelRevenueSection() {
      const tbody = document.getElementById('dashboardChannelTableBody');
      const mobileList = document.getElementById('dashboardChannelMobileList');
      const countLabel = document.getElementById('channelTableCountLabel');

      const totalChannels = channelRevenueData.length;
      const totalPages = Math.max(1, Math.ceil(totalChannels / DASH_CHANNEL_PAGE_SIZE));
      if (dashChannelPage > totalPages) dashChannelPage = totalPages;
      if (dashChannelPage < 1) dashChannelPage = 1;
      const startIdx = (dashChannelPage - 1) * DASH_CHANNEL_PAGE_SIZE;
      const pagedChannels = channelRevenueData.slice(startIdx, startIdx + DASH_CHANNEL_PAGE_SIZE);

      if (countLabel) {
        countLabel.innerText = `${totalChannels} kênh hoạt động`;
      }

      if (tbody) {
        tbody.innerHTML = pagedChannels.map((row, idx) => {
          const globalIdx = startIdx + idx;
          const roleBadge = row.role === 'ĐẠI LÝ'
            ? `<span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-orange-50 text-orange-600 border border-orange-200">ĐẠI LÝ</span>`
            : `<span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">NỘI BỘ</span>`;

          const growthHtml = row.growthDir === 'up'
            ? `<span class="inline-flex items-center gap-1 font-bold text-emerald-600"><span>↑</span><span>${row.growthPct}</span></span>`
            : `<span class="inline-flex items-center gap-1 font-bold text-rose-500"><span>↓</span><span>${row.growthPct}</span></span>`;

          return `
            <tr class="hover:bg-slate-50/80 transition-colors">
              <td class="py-3.5 px-5 text-center">
                <span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-xs shadow-2xs">${row.rank}</span>
              </td>
              <td class="py-3.5 px-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-brand-500 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">${row.avatar}</div>
                  <span class="font-bold text-slate-900 text-xs sm:text-sm">${row.name}</span>
                </div>
              </td>
              <td class="py-3.5 px-4">${roleBadge}</td>
              <td class="py-3.5 px-4 text-right font-bold text-slate-800">${row.tickets}</td>
              <td class="py-3.5 px-4 text-right font-extrabold text-slate-900">${row.revenue}</td>
              <td class="py-3.5 px-4 text-right text-xs">${growthHtml}</td>
              <td class="py-3.5 px-5 text-right">
                <button type="button"
                        onclick="openChannelDetailModal(${globalIdx})"
                        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-600 border border-sky-200/80 font-bold text-xs transition-colors cursor-pointer">
                  <i data-lucide="eye" class="w-3.5 h-3.5"></i>
                  <span>Xem chi tiết</span>
                </button>
              </td>
            </tr>
          `;
        }).join('');
      }

      if (mobileList) {
        mobileList.innerHTML = pagedChannels.map((row, idx) => {
          const globalIdx = startIdx + idx;
          const roleBadge = row.role === 'ĐẠI LÝ'
            ? `<span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-200 shrink-0">ĐẠI LÝ</span>`
            : `<span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 shrink-0">NỘI BỘ</span>`;

          const growthHtml = row.growthDir === 'up'
            ? `<span class="inline-flex items-center gap-0.5 font-bold text-emerald-600 text-sm"><span>↑</span><span>${row.growthPct}</span></span>`
            : `<span class="inline-flex items-center gap-0.5 font-bold text-rose-500 text-sm"><span>↓</span><span>${row.growthPct}</span></span>`;

          return `
            <div class="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
              <!-- Dòng 1: Hạng + Avatar + Tên đại lý + Badge Vai trò -->
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white font-extrabold text-[11px] shrink-0">${row.rank}</span>
                  <div class="w-7 h-7 rounded-full bg-brand-500 text-white font-extrabold text-[11px] flex items-center justify-center shrink-0">${row.avatar}</div>
                  <span class="font-bold text-slate-900 text-xs truncate">${row.name}</span>
                </div>
                ${roleBadge}
              </div>

              <!-- Dòng 2: 2 cột SỐ VÉ và TĂNG TRƯỞNG -->
              <div class="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SỐ VÉ</div>
                  <div class="text-sm font-extrabold text-slate-900 mt-0.5">${row.tickets}</div>
                </div>
                <div>
                  <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TĂNG TRƯỞNG</div>
                  <div class="mt-0.5">${growthHtml}</div>
                </div>
              </div>

              <!-- Dòng 3: DOANH THU (VND) & Xem chi tiết -->
              <div class="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <div>
                  <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">DOANH THU (VND)</div>
                  <div class="text-sm font-black text-slate-900 mt-0.5">${row.revenue}</div>
                </div>
                <button type="button"
                        onclick="openChannelDetailModal(${globalIdx})"
                        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-600 border border-sky-200/80 font-bold text-xs transition-colors cursor-pointer shrink-0">
                  <i data-lucide="eye" class="w-3.5 h-3.5"></i>
                  <span>Xem chi tiết</span>
                </button>
              </div>
            </div>
          `;
        }).join('');
      }

      renderGenericPaginationFooter('dashboardChannelPaginationFooter', dashChannelPage, totalChannels, DASH_CHANNEL_PAGE_SIZE, 'changeDashChannelPage', 'kênh bán');
    }

    function openChannelDetailModal(idx) {
      const row = channelRevenueData[idx];
      const modal = document.getElementById('modalChannelDetail');
      if (!row || !modal) return;

      const avatarEl = document.getElementById('modalChannelAvatar');
      const nameEl = document.getElementById('modalChannelName');
      const roleEl = document.getElementById('modalChannelRole');
      const ticketsEl = document.getElementById('modalChannelTickets');
      const growthEl = document.getElementById('modalChannelGrowth');
      const revEl = document.getElementById('modalChannelRevenue');

      if (avatarEl) avatarEl.innerText = row.avatar;
      if (nameEl) nameEl.innerText = row.name;
      if (roleEl) {
        roleEl.innerText = row.role;
        roleEl.className = row.role === 'ĐẠI LÝ'
          ? 'inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-200 mt-0.5'
          : 'inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 mt-0.5';
      }
      if (ticketsEl) ticketsEl.innerText = `${row.tickets} vé`;
      if (growthEl) {
        growthEl.innerText = `${row.growthDir === 'up' ? '↑' : '↓'} ${row.growthPct}`;
        growthEl.className = `text-lg font-extrabold mt-0.5 ${row.growthDir === 'up' ? 'text-emerald-600' : 'text-rose-500'}`;
      }
      if (revEl) revEl.innerText = row.revenue;

      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function closeChannelDetailModal() {
      const modal = document.getElementById('modalChannelDetail');
      if (modal) {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
      }
    }

    function toggleDashboardDatePopover() {
      const popover = document.getElementById('dashboardDatePopover');
      if (popover) {
        popover.classList.toggle('hidden');
      }
    }

    function applyDashboardDatePreset(label, presetKey) {
      const preset = dashboardPresets[presetKey] || dashboardPresets.nov_1_10;
      const labelEl = document.getElementById('dashboardDateRangeLabel');
      const popover = document.getElementById('dashboardDatePopover');

      if (labelEl) labelEl.innerText = label || preset.rangeLabel;
      if (popover) popover.classList.add('hidden');

      updateDashboardKpis(preset.kpis);
      initDashboardChart(preset.chart);
      showToast('Bộ lọc Dashboard', `Đang hiển thị dữ liệu giai đoạn ${label || preset.rangeLabel}.`);
    }

    function applyCustomDashboardDateRange() {
      const startVal = document.getElementById('dashStartDate')?.value;
      const endVal = document.getElementById('dashEndDate')?.value;
      if (!startVal || !endVal) {
        showToast('Thiếu ngày lọc', 'Vui lòng chọn đầy đủ Từ ngày và Đến ngày.', 'error');
        return;
      }
      const fmt = (iso) => {
        const [y, m, d] = iso.split('-');
        return `${d}/${m}/${y}`;
      };
      const rangeStr = `${fmt(startVal)} - ${fmt(endVal)}`;
      applyDashboardDatePreset(rangeStr, 'nov_1_10');
    }

    function resetDashboardDateFilter() {
      const startEl = document.getElementById('dashStartDate');
      const endEl = document.getElementById('dashEndDate');
      if (startEl) startEl.value = '2026-11-01';
      if (endEl) endEl.value = '2026-11-18';
      applyDashboardDatePreset('01/11/2026 - 18/11/2026', 'nov_1_10');
    }

    function initDashboardOverview() {
      if (typeof syncDashboardPresetsAndChannelsFromOrders === 'function') {
        syncDashboardPresetsAndChannelsFromOrders();
      }
      const initialPreset = dashboardPresets.nov_1_10;
      updateDashboardKpis(initialPreset.kpis);
      initDashboardChart(initialPreset.chart);
      renderChannelRevenueSection();
      if (window.lucide) {
        lucide.createIcons();
      }
    }


    // Đồng bộ Dashboard Tổng quan (KPI, Biểu đồ, Top Kênh bán) theo reportOrdersDataset (> 3 tỷ VND)
    function formatCompactVndShort(amount) {
      if (amount >= 1e9) return `${(amount / 1e9).toFixed(2)} tỷ`;
      if (amount >= 1e6) return `${(amount / 1e6).toFixed(1)}M`;
      return `${formatMoney(amount)} đ`;
    }

    function buildDashboardDataFromOrders(startIso, endIso, rangeLabel) {
      const valid = reportOrdersDataset.filter(o =>
        o.createdDate >= startIso && o.createdDate <= endIso &&
        o.status !== 'Đã hủy' && o.status !== 'Hoàn tiền'
      );
      const totalRev = valid.reduce((s, o) => s + o.revenue, 0);
      const totalTickets = valid.reduce((s, o) => s + o.tickets, 0);
      const issuedCount = valid.filter(o => o.status === 'Đã xuất vé').length;
      const compRate = valid.length ? ((issuedCount / valid.length) * 100).toFixed(2) + '%' : '0.00%';
      const activeAgencies = new Set(valid.filter(o => o.channel === 'Đại lý (TA)').map(o => o.staff)).size;
      const activeKols = new Set(valid.filter(o => o.subType === 'CTV').map(o => o.staff)).size;

      // Group timeline by createdDate sorted asc
      const dateBuckets = {};
      valid.forEach(o => {
        if (!dateBuckets[o.createdDate]) {
          dateBuckets[o.createdDate] = { agency: 0, kol: 0, booking: 0, internal: 0, total: 0 };
        }
        const b = dateBuckets[o.createdDate];
        const m = o.revenue / 1e6;
        if (o.channel === 'Đại lý (TA)') b.agency += m;
        else if (o.subType === 'CTV') b.kol += m;
        else if (o.channel === 'Website') b.booking += m;
        else b.internal += m;
        b.total += m;
      });
      const sortedDates = Object.keys(dateBuckets).sort();
      return {
        rangeLabel,
        kpis: {
          revenue: { 
            value: formatCompactVndShort(totalRev), 
            fullValue: `${formatMoney(totalRev)} đ`, 
            dir: 'up', 
            pct: '18.45%' 
          },
          tickets: { value: formatMoney(totalTickets), dir: 'up', pct: '15.20%' },
          agencies: { value: String(activeAgencies), dir: 'up', pct: '25.00%' },
          kols: { value: String(activeKols), dir: 'up', pct: '11.11%' },
          completion: { value: compRate, dir: 'up', pct: '6.40%' }
        },
        chart: {
          labels: sortedDates.map(d => `${d.slice(8, 10)}/${d.slice(5, 7)}`),
          agency: sortedDates.map(d => Math.round(dateBuckets[d].agency * 10) / 10),
          kol: sortedDates.map(d => Math.round(dateBuckets[d].kol * 10) / 10),
          booking: sortedDates.map(d => Math.round(dateBuckets[d].booking * 10) / 10),
          internal: sortedDates.map(d => Math.round(dateBuckets[d].internal * 10) / 10),
          total: sortedDates.map(d => Math.round(dateBuckets[d].total * 10) / 10)
        }
      };
    }

    function syncDashboardPresetsAndChannelsFromOrders() {
      if (typeof dashboardPresets === 'object' && dashboardPresets) {
        dashboardPresets.nov_1_10 = buildDashboardDataFromOrders('2026-11-01', '2026-11-18', '01/11/2026 - 18/11/2026');
        dashboardPresets.oct_full = buildDashboardDataFromOrders('2026-10-01', '2026-10-31', '01/10/2026 - 31/10/2026');
        dashboardPresets.last_7 = buildDashboardDataFromOrders('2026-11-12', '2026-11-18', '12/11/2026 - 18/11/2026');
        dashboardPresets.nov_full = buildDashboardDataFromOrders('2026-11-01', '2026-11-18', '01/11/2026 - 18/11/2026');
      }
      if (typeof channelRevenueData !== 'undefined' && Array.isArray(channelRevenueData)) {
        const agg = {};
        reportOrdersDataset.forEach(o => {
          if (o.createdDate < '2026-10-12' || o.createdDate > '2026-11-18') return;
          if (o.status === 'Đã hủy' || o.status === 'Hoàn tiền') return;
          const key = (o.staff && o.staff !== '-') ? o.staff : `Website (${o.subType})`;
          const role = o.channel === 'Đại lý (TA)' ? 'ĐẠI LÝ' : (o.subType === 'CTV' ? 'CTV / KOL' : 'NỘI BỘ');
          if (!agg[key]) agg[key] = { name: key, role, tickets: 0, revNum: 0 };
          agg[key].tickets += o.tickets;
          agg[key].revNum += o.revenue;
        });
        const sorted = Object.values(agg).sort((a, b) => b.revNum - a.revNum);
        channelRevenueData.length = 0;
        sorted.forEach((item, idx) => {
          const words = item.name.split(/\s+/).filter(Boolean);
          const avatar = (words[0]?.[0] || 'T') + (words[1]?.[0] || words[0]?.[1] || 'C');
          channelRevenueData.push({
            rank: idx + 1,
            avatar: avatar.toUpperCase(),
            name: item.name,
            role: item.role,
            tickets: item.tickets,
            revenue: `${formatMoney(item.revNum)} đ`,
            growthDir: idx % 7 === 6 ? 'down' : 'up',
            growthPct: `${(8 + ((idx * 3.1) % 18)).toFixed(2)}%`
          });
        });
      }
    }

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
      else renderBusinessReport();
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

    let lastBusinessFilteredOrders = [];

    let bizOrderPage = 1;
    const BIZ_ORDER_PAGE_SIZE = 10;

    function changeBizOrderPage(page) {
      bizOrderPage = Math.max(1, page);
      renderBusinessReport(false);
    }

    function renderBusinessReport(resetPage = true) {
      if (resetPage) bizOrderPage = 1;
      const st = reportStates.business;
      syncReportFilterControls('business');

      // Kỳ hiện tại
      const currRawOrders = getOrdersInWindow(st, st.dateStart, st.dateEnd, false);
      const currExpectedPool = getOrdersInWindow(st, st.dateStart, st.dateEnd, true);

      // Tính kỳ trước cùng độ dài ngày
      const spanDays = Math.max(1, diffDaysInclusive(st.dateStart, st.dateEnd));
      const prevEndDt = parseIsoDate(st.dateStart);
      prevEndDt.setDate(prevEndDt.getDate() - 1);
      const prevStartDt = new Date(prevEndDt.getTime());
      prevStartDt.setDate(prevStartDt.getDate() - spanDays);
      const prevStartIso = toIsoDate(prevStartDt);
      const prevEndIso = toIsoDate(prevEndDt);

      const prevRawOrders = getOrdersInWindow(st, prevStartIso, prevEndIso, false);
      const prevExpectedPool = getOrdersInWindow(st, prevStartIso, prevEndIso, true);

      // Business Rule: Thực tế (không tính Nháp, Đang xử lý, Hủy, Hoàn tiền)
      const isActualStatus = (o) => o.status === 'Đã xác nhận' || o.status === 'Đã xuất vé';
      // Business Rule: Dự kiến (Đã hoàn thành + Xuất vé + Nháp [useDate in filter & <=30d] + Pending, không tính Hủy/Hoàn tiền)
      const isExpectedStatus = (o) => o.status !== 'Đã hủy' && o.status !== 'Hoàn tiền';

      const sumMetrics = (arr) => arr.reduce((acc, o) => {
        const cost = o.revenue - o.profit; // Công thức: Doanh thu - Lợi nhuận = Chi phí
        acc.revenue += o.revenue;
        acc.profit += o.profit;
        acc.cost += cost;
        return acc;
      }, { revenue: 0, cost: 0, profit: 0 });

      const currActual = sumMetrics(currRawOrders.filter(isActualStatus));
      const prevActual = sumMetrics(prevRawOrders.filter(isActualStatus));
      const currExpected = sumMetrics(currExpectedPool.filter(isExpectedStatus));
      const prevExpected = sumMetrics(prevExpectedPool.filter(isExpectedStatus));

      // Business Rule: Khi xem thời gian ở quá khứ (trước ngày hiện tại 2026-11-18) -> Bỏ trường Dự kiến
      const isPastPeriod = st.dateEnd < REPORT_TODAY;
      const pastBadge = document.getElementById('businessPastPeriodBadge');
      if (pastBadge) {
        pastBadge.classList.toggle('hidden', !isPastPeriod);
        pastBadge.classList.toggle('inline-flex', isPastPeriod);
      }

      ['bizRevExpectedBox', 'bizCostExpectedBox', 'bizProfitExpectedBox'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.toggle('hidden', isPastPeriod);
      });
      ['bizCardRevenueGrid', 'bizCardCostGrid', 'bizCardProfitGrid'].forEach(id => {
        const g = document.getElementById(id);
        if (g) {
          g.classList.toggle('sm:grid-cols-2', !isPastPeriod);
          g.classList.toggle('sm:grid-cols-1', isPastPeriod);
        }
      });

      // Populate Card 1, 2, 3
      const setCard = (valId, trendId, val, prevVal) => {
        const vEl = document.getElementById(valId);
        const tEl = document.getElementById(trendId);
        if (vEl) {
          if (typeof setKpiCardValue === 'function') {
            setKpiCardValue(vEl, val);
          } else {
            vEl.innerText = `${formatMoney(val)} đ`;
          }
        }
        if (tEl) tEl.innerHTML = formatPctDiffHtml(val, prevVal);
      };

      setCard('bizRevActualVal', 'bizRevActualTrend', currActual.revenue, prevActual.revenue);
      setCard('bizRevExpectedVal', 'bizRevExpectedTrend', currExpected.revenue, prevExpected.revenue);
      setCard('bizCostActualVal', 'bizCostActualTrend', currActual.cost, prevActual.cost);
      setCard('bizCostExpectedVal', 'bizCostExpectedTrend', currExpected.cost, prevExpected.cost);
      setCard('bizProfitActualVal', 'bizProfitActualTrend', currActual.profit, prevActual.profit);
      setCard('bizProfitExpectedVal', 'bizProfitExpectedTrend', currExpected.profit, prevExpected.profit);

      // Lưu danh sách đơn tổng hợp (hiển thị trong bảng & modal trạng thái)
      // Kết hợp đơn trong kỳ + đơn nháp có Ngày sử dụng nằm trong kỳ lọc
      const mergedMap = new Map();
      [...currRawOrders, ...currExpectedPool].forEach(o => mergedMap.set(o.orderCode, o));
      const allOrders = Array.from(mergedMap.values()).sort((a, b) => b.createdDate.localeCompare(a.createdDate));
      lastBusinessFilteredOrders = allOrders;

      // Card 4: Trạng thái đơn hàng (6 trạng thái)
      const allStatuses = ['Đã xác nhận', 'Đã xuất vé', 'Đang xử lý', 'Đã hủy', 'Hoàn tiền', 'Nháp'];
      const statusGrid = document.getElementById('bizOrderStatusGrid');
      if (statusGrid) {
        statusGrid.innerHTML = allStatuses.map(statusName => {
          const count = allOrders.filter(o => o.status === statusName).length;
          return `
            <div class="px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-1">
              <span class="text-[11px] font-semibold text-slate-600 truncate">${statusName}</span>
              <span class="font-extrabold text-slate-900">${count}</span>
            </div>
          `;
        }).join('');
      }

      // Card 5: Số dư ví Đại lý
      const totalWallet = agencyWalletsDataset.reduce((s, w) => s + w.balance, 0);
      const walletTotalEl = document.getElementById('bizAgencyWalletTotal');
      const walletMiniEl = document.getElementById('bizAgencyWalletMiniList');
      if (walletTotalEl) {
        if (typeof setKpiCardValue === 'function') {
          setKpiCardValue(walletTotalEl, totalWallet);
        } else {
          walletTotalEl.innerText = `${formatMoney(totalWallet)} đ`;
        }
      }
      if (walletMiniEl) {
        walletMiniEl.innerHTML = agencyWalletsDataset.slice(0, 2).map(w => `
          <div class="flex items-center justify-between gap-2">
            <span class="text-slate-600 font-medium truncate">${w.name}</span>
            <span class="font-bold text-slate-900 shrink-0">${formatMoney(w.balance)} đ</span>
          </div>
        `).join('');
      }

      // Card 6: Top 3 nhân viên theo doanh thu (chỉ tính đơn Đã xác nhận/Đã thanh toán & Đã xuất vé)
      const staffRevMap = {};
      allOrders.filter(isActualStatus).forEach(o => {
        const key = o.staff === '-' ? `${o.channel} (${o.subType})` : o.staff;
        staffRevMap[key] = (staffRevMap[key] || 0) + o.revenue;
      });
      const top3 = Object.entries(staffRevMap).sort((a, b) => b[1] - a[1]).slice(0, 3);
      const top3El = document.getElementById('bizTop3StaffList');
      if (top3El) {
        if (top3.length === 0) {
          top3El.innerHTML = `<div class="text-xs text-slate-400 italic py-2">Chưa có doanh thu hoàn thành trong bộ lọc.</div>`;
        } else {
          const rankColors = ['bg-amber-400 text-white', 'bg-slate-400 text-white', 'bg-orange-400 text-white'];
          top3El.innerHTML = top3.map(([name, rev], idx) => `
            <div class="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50/80 border border-slate-100 text-xs">
              <div class="flex items-center gap-2 min-w-0">
                <span class="w-5 h-5 rounded-full ${rankColors[idx]} font-extrabold text-[10px] flex items-center justify-center shrink-0">${idx + 1}</span>
                <span class="font-bold text-slate-800 truncate">${name}</span>
              </div>
              <span class="font-extrabold text-brand-600 shrink-0">${formatMoney(rev)} đ</span>
            </div>
          `).join('');
        }
      }

      // C. Tags hiển thị Tỷ lệ hoàn thành đơn
      const totalCount = allOrders.length;
      const completedCount = allOrders.filter(isActualStatus).length;
      const completionRate = totalCount > 0 ? ((completedCount / totalCount) * 100).toFixed(2) : '0.00';
      const pendingCount = allOrders.filter(o => o.status === 'Đang xử lý').length;
      const draftCount = allOrders.filter(o => o.status === 'Nháp').length;
      const cancelledCount = allOrders.filter(o => o.status === 'Đã hủy' || o.status === 'Hoàn tiền').length;

      const tagsEl = document.getElementById('bizCompletionTagsContainer');
      if (tagsEl) {
        tagsEl.innerHTML = `
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold">
            <span>Hoàn thành: ${completionRate}%</span>
            <span class="text-emerald-500 font-semibold">(${completedCount}/${totalCount} đơn)</span>
          </span>
          <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold">Đang xử lý: ${pendingCount}</span>
          <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-bold">Nháp: ${draftCount}</span>
          <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200 font-bold">Hủy / Hoàn: ${cancelledCount}</span>
        `;
      }

      // D. Bảng Chi tiết hiệu quả theo đơn hàng (Top 10 đơn/trang) + Dòng tổng cộng cuối bảng
      const totalOrderCount = allOrders.length;
      const totalOrderPages = Math.max(1, Math.ceil(totalOrderCount / BIZ_ORDER_PAGE_SIZE));
      if (bizOrderPage > totalOrderPages) bizOrderPage = totalOrderPages;
      if (bizOrderPage < 1) bizOrderPage = 1;
      const orderStartIdx = (bizOrderPage - 1) * BIZ_ORDER_PAGE_SIZE;
      const pagedOrders = allOrders.slice(orderStartIdx, orderStartIdx + BIZ_ORDER_PAGE_SIZE);

      const countBadge = document.getElementById('bizOrderTableCountBadge');
      if (countBadge) {
        countBadge.innerText = totalOrderCount > BIZ_ORDER_PAGE_SIZE
          ? `Hiển thị ${pagedOrders.length}/${totalOrderCount} đơn hàng (10/trang)`
          : `${totalOrderCount} đơn hàng`;
      }

      const tbody = document.getElementById('bizOrderTableBody');
      const tfoot = document.getElementById('bizOrderTableFooter');
      const mobileList = document.getElementById('bizOrderMobileList');
      const mobileSum = document.getElementById('bizOrderMobileSummary');

      const tableTotals = sumMetrics(allOrders);

      if (tbody) {
        if (pagedOrders.length === 0) {
          tbody.innerHTML = `<tr><td colspan="8" class="py-8 text-center text-slate-400 italic">Không có đơn hàng nào khớp với bộ lọc hiện tại.</td></tr>`;
        } else {
          tbody.innerHTML = pagedOrders.map(o => {
            const cost = o.revenue - o.profit;
            return `
              <tr class="hover:bg-slate-50/80 transition-colors">
                <td class="py-3 px-4 font-extrabold text-brand-600 whitespace-nowrap">${o.orderCode}</td>
                <td class="py-3 px-4 whitespace-nowrap">
                  <div class="font-semibold text-slate-800">${formatDisplayDate(o.createdDate)}</div>
                  <div class="text-[10px] text-slate-400">SD: ${formatDisplayDate(o.useDate)}</div>
                </td>
                <td class="py-3 px-4">
                  <div class="font-bold text-slate-900">${o.customerName}</div>
                  <div class="text-[10.5px] text-slate-400">${o.site}</div>
                </td>
                <td class="py-3 px-4 text-right font-bold text-slate-900 whitespace-nowrap">${formatMoney(o.revenue)} đ</td>
                <td class="py-3 px-4 text-right font-semibold text-slate-600 whitespace-nowrap">${formatMoney(cost)} đ</td>
                <td class="py-3 px-4 text-right font-extrabold text-emerald-600 whitespace-nowrap">${formatMoney(o.profit)} đ</td>
                <td class="py-3 px-4 whitespace-nowrap">${getStatusBadgeHtml(o.status)}</td>
                <td class="py-3 px-4 text-slate-700 font-semibold">${o.staff === '-' ? `${o.channel} (${o.subType})` : o.staff}</td>
              </tr>
            `;
          }).join('');
        }
      }

      if (tfoot) {
        tfoot.innerHTML = `
          <tr>
            <td colspan="3" class="py-3.5 px-4 text-left uppercase tracking-wider text-slate-700">TỔNG CỘNG (${allOrders.length} ĐƠN)</td>
            <td class="py-3.5 px-4 text-right text-blue-800 whitespace-nowrap">${formatMoney(tableTotals.revenue)} đ</td>
            <td class="py-3.5 px-4 text-right text-amber-700 whitespace-nowrap">${formatMoney(tableTotals.cost)} đ</td>
            <td class="py-3.5 px-4 text-right text-emerald-700 whitespace-nowrap">${formatMoney(tableTotals.profit)} đ</td>
            <td colspan="2" class="py-3.5 px-4 text-right text-[11px] font-medium text-slate-500">Chi phí = Doanh thu - Lợi nhuận</td>
          </tr>
        `;
      }

      if (mobileList) {
        if (pagedOrders.length === 0) {
          mobileList.innerHTML = `<div class="py-6 text-center text-xs text-slate-400 italic">Không có đơn hàng nào khớp với bộ lọc hiện tại.</div>`;
        } else {
          mobileList.innerHTML = pagedOrders.map(o => {
            const cost = o.revenue - o.profit;
            return `
              <div class="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-2.5 text-xs">
                <div class="flex items-center justify-between gap-2">
                  <span class="font-extrabold text-brand-600">${o.orderCode}</span>
                  ${getStatusBadgeHtml(o.status)}
                </div>
                <div>
                  <div class="font-bold text-slate-900">${o.customerName}</div>
                  <div class="text-[11px] text-slate-400">Tạo: ${formatDisplayDate(o.createdDate)} • SD: ${formatDisplayDate(o.useDate)} • ${o.staff === '-' ? `${o.channel} (${o.subType})` : o.staff}</div>
                </div>
                <div class="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                  <div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase">Doanh thu</div>
                    <div class="font-extrabold text-slate-900 mt-0.5">${formatMoney(o.revenue)} đ</div>
                  </div>
                  <div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase">Chi phí</div>
                    <div class="font-bold text-slate-600 mt-0.5">${formatMoney(cost)} đ</div>
                  </div>
                  <div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase">Lợi nhuận</div>
                    <div class="font-extrabold text-emerald-600 mt-0.5">${formatMoney(o.profit)} đ</div>
                  </div>
                </div>
              </div>
            `;
          }).join('');
        }
      }

      if (mobileSum) {
        mobileSum.innerHTML = `
          <div class="flex items-center justify-between text-slate-700 mb-1">
            <span>TỔNG CỘNG (${allOrders.length} đơn)</span>
            <span class="text-emerald-700">LN: ${formatMoney(tableTotals.profit)} đ</span>
          </div>
          <div class="flex items-center justify-between text-[11px] text-slate-500">
            <span>DT: ${formatMoney(tableTotals.revenue)} đ</span>
            <span>Chi phí: ${formatMoney(tableTotals.cost)} đ</span>
          </div>
        `;
      }

      renderGenericPaginationFooter('bizOrderPaginationFooter', bizOrderPage, totalOrderCount, BIZ_ORDER_PAGE_SIZE, 'changeBizOrderPage', 'đơn hàng');

      if (window.lucide) lucide.createIcons();
    }

    function openBusinessOrderStatusModal() {
      const modal = document.getElementById('modalBusinessOrderStatus');
      const body = document.getElementById('modalBusinessOrderStatusBody');
      if (!modal || !body) return;

      const allStatuses = ['Đã xác nhận', 'Đã xuất vé', 'Đang xử lý', 'Đã hủy', 'Hoàn tiền', 'Nháp'];
      const totalOrders = lastBusinessFilteredOrders.length;

      body.innerHTML = allStatuses.map(statusName => {
        const subset = lastBusinessFilteredOrders.filter(o => o.status === statusName);
        const sumRev = subset.reduce((s, o) => s + o.revenue, 0);
        const pct = totalOrders > 0 ? ((subset.length / totalOrders) * 100).toFixed(1) : '0.0';
        return `
          <div class="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              ${getStatusBadgeHtml(statusName)}
              <span class="text-xs font-bold text-slate-700">${subset.length} đơn (${pct}%)</span>
            </div>
            <div class="text-right">
              <div class="text-[10px] font-bold text-slate-400 uppercase">Tổng giá trị</div>
              <div class="text-sm font-extrabold text-slate-900">${formatMoney(sumRev)} đ</div>
            </div>
          </div>
        `;
      }).join('');

      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function openBusinessAgencyWalletsModal() {
      const modal = document.getElementById('modalBusinessAgencyWallets');
      const body = document.getElementById('modalBusinessAgencyWalletsBody');
      if (!modal || !body) return;

      body.innerHTML = `
        <div class="space-y-3">
          ${agencyWalletsDataset.map(w => `
            <div class="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[10px]">${w.code}</span>
                  <span class="font-extrabold text-xs sm:text-sm text-slate-900">${w.name}</span>
                </div>
              </div>
              <div class="sm:text-right shrink-0">
                <div class="text-[10px] font-bold text-slate-400 uppercase">Số dư khả dụng</div>
                <div class="text-base font-black text-blue-900">${formatMoney(w.balance)} đ</div>
              </div>
            </div>
          `).join('')}
        </div>
      `;

      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }


// Tự động khởi tạo theo trang hiện tại
window.addEventListener("DOMContentLoaded", () => {
  if (typeof TecheraDB !== "undefined" && TecheraDB.getOrders) {
    reportOrdersDataset = TecheraDB.getOrders();
    window.reportOrdersDataset = reportOrdersDataset;
  }

  // 1. Dashboard Overview
  if (document.getElementById("viewDashboardOverview") || document.getElementById("dashboardChannelTbody")) {
    initDashboardOverview();
  }

  // 2. Analytics Report
  if (document.getElementById("viewReportAnalytics") || document.getElementById("anTopSitesBars")) {
    if (typeof createStandardDateRangePicker === 'function' && document.getElementById('analytics_btnDateTrigger')) {
      createStandardDateRangePicker({
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
    syncReportFilterControls("analytics");
    renderAnalyticsReport();
  }

  // 3. Business Report
  if (document.getElementById("viewReportBusiness") || document.getElementById("bizOrdersTbody")) {
    if (typeof createStandardDateRangePicker === 'function' && document.getElementById('biz_btnDateTrigger')) {
      createStandardDateRangePicker({
        prefix: 'biz',
        defaultStart: reportStates.business.dateStart || '2026-11-01',
        defaultEnd: reportStates.business.dateEnd || '2026-11-18',
        defaultPreset: 'this_month',
        onApply: (start, end, preset) => {
          reportStates.business.dateStart = start;
          reportStates.business.dateEnd = end;
          reportStates.business.dateTag = preset;
          renderBusinessReport();
        }
      });
    }
    syncReportFilterControls("business");
    renderBusinessReport();
  }
});

// Compatibility Aliases & Global Exports for business-report.html & reports.js
window.resetReportFilters = resetReportFilters;
window.onReportChannelChange = onReportChannelChange;
window.onReportSubTypeChange = onReportSubTypeChange;
window.onReportCorpChange = onReportCorpChange;
window.toggleSearchableDropdown = toggleSearchableDropdown;
window.renderSearchableOptions = renderSearchableOptions;
window.selectSearchableOption = selectSearchableOption;
window.selectReportDateTag = selectReportDateTag;
window.onReportCustomDateChange = onReportCustomDateChange;
window.openBusinessOrderStatusModal = openBusinessOrderStatusModal;
window.openBusinessAgencyWalletsModal = openBusinessAgencyWalletsModal;
window.closeReportModal = closeReportModal;
window.changeBizOrderPage = changeBizOrderPage;
window.renderBusinessReport = renderBusinessReport;
window.openAnalyticsDetailModal = openAnalyticsDetailModal;
window.renderAnalyticsReport = renderAnalyticsReport;
window.initDashboardOverview = initDashboardOverview;
