/* ==========================================================================
   Techera Portal — Dashboard Tổng quan (KPIs, Doanh thu kênh & Biểu đồ)
   Module độc lập cho dashboard.html, đồng bộ 100% với TecheraDB và Chart.js.
   ========================================================================== */

let reportOrdersDataset = (typeof TecheraDB !== 'undefined' && TecheraDB.getOrders)
  ? TecheraDB.getOrders()
  : (typeof generateMockOrdersDataset === 'function' ? generateMockOrdersDataset() : []);
window.reportOrdersDataset = reportOrdersDataset;

    // =========================================================================
    // 11B. DASHBOARD TỔNG QUAN ENGINE (KPI, CHART.JS & CHANNEL REVENUE)
    // =========================================================================
    let revenueChartInstance = null;

    const dashboardPresets = {
      nov_1_10: {
        rangeLabel: '01/11/2026 - 18/11/2026',
        kpis: {
          revenue: { value: '6.4M', dir: 'down', pct: '29.48%' },
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
          revenue: { value: '9.1M', dir: 'up', pct: '18.20%' },
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
          revenue: { value: '5.1M', dir: 'down', pct: '12.40%' },
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
          revenue: { value: '6.4M', dir: 'down', pct: '29.48%' },
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
        if (valEl) valEl.innerText = item.value;
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

    let dashboardRangePickerInstance = null;

    function initDashboardOverview() {
      if (typeof syncDashboardPresetsAndChannelsFromOrders === 'function') {
        syncDashboardPresetsAndChannelsFromOrders();
      }

      if (typeof createStandardDateRangePicker === 'function' && document.getElementById('dash_btnDateTrigger')) {
        if (!dashboardRangePickerInstance) {
          dashboardRangePickerInstance = createStandardDateRangePicker({
            prefix: 'dash',
            defaultStart: '2026-11-01',
            defaultEnd: '2026-11-18',
            defaultPreset: 'this_month',
            onApply: (start, end, preset) => {
              const fmt = (iso) => {
                if (!iso) return '';
                const parts = String(iso).split('-');
                return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : iso;
              };
              const rangeLabel = start === end ? fmt(start) : `${fmt(start)} - ${fmt(end)}`;
              const presetKey = preset === '30_days' ? 'oct_full' : (preset === '7_days' ? 'last_7' : 'nov_1_10');
              applyDashboardDatePreset(rangeLabel, presetKey);
            }
          });
        }
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
          revenue: { value: formatCompactVndShort(totalRev), dir: 'up', pct: '18.45%' },
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



// Tự động khởi chạy khi load trang dashboard
window.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('viewDashboardOverview') || document.getElementById('revenueTimelineChart')) {
    initDashboardOverview();
  }
});

// Xuất các hàm ra phạm vi toàn cục cho inline event handlers
window.toggleDashboardDatePopover = toggleDashboardDatePopover;
window.resetDashboardDateFilter = resetDashboardDateFilter;
window.applyDashboardDatePreset = applyDashboardDatePreset;
window.applyCustomDashboardDateRange = applyCustomDashboardDateRange;
window.toggleChartDataset = toggleChartDataset;
window.openChannelDetailModal = openChannelDetailModal;
window.closeChannelDetailModal = closeChannelDetailModal;
window.changeDashChannelPage = changeDashChannelPage;
window.initDashboardOverview = initDashboardOverview;
