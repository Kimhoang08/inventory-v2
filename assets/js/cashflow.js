/* ==========================================================================
   Techera Portal — Lịch sử Dòng tiền, Đối soát & Hóa đơn VAT
   Được tách từ index01.html (dòng 15195-16502) với đầy đủ 100% tính năng 17 cột, modal và xuất CSV.
   ========================================================================== */

    // =========================================================================
    // 11. CASH FLOW HISTORY & RECONCILIATION ENGINE (LỊCH SỬ DÒNG TIỀN)
    // =========================================================================
    // Cấu hình 17 cột được nạp từ database/cashflow.db.js; thiết lập fallback nếu chưa có
    if (typeof window.CASH_FLOW_COLUMNS_CONFIG === 'undefined' && typeof CASH_FLOW_COLUMNS_CONFIG === 'undefined') {
      window.CASH_FLOW_COLUMNS_CONFIG = [
        { id: 'orderCode', label: 'Mã đơn hàng', defaultVisible: true },
        { id: 'txCode', label: 'Mã giao dịch', defaultVisible: true },
        { id: 'beneficiary', label: 'Người thụ hưởng & Mã ĐL', defaultVisible: true },
        { id: 'group', label: 'Nhóm Thu/Chi', defaultVisible: true },
        { id: 'type', label: 'Loại', defaultVisible: true },
        { id: 'paymentMethod', label: 'Phương thức thanh toán', defaultVisible: true },
        { id: 'status', label: 'Trạng thái', defaultVisible: true },
        { id: 'createdDate', label: 'Thời gian tạo', defaultVisible: true },
        { id: 'updatedDate', label: 'Cập nhật', defaultVisible: true },
        { id: 'channel', label: 'Kênh bán', defaultVisible: false },
        { id: 'subType', label: 'Loại theo kênh', defaultVisible: false },
        { id: 'amount', label: 'Tổng thanh toán', defaultVisible: false },
        { id: 'listedPrice', label: 'Tổng giá niêm yết', defaultVisible: false },
        { id: 'discountAmount', label: 'Tổng giá giảm (Voucher)', defaultVisible: false },
        { id: 'commissionAmount', label: 'Tổng hoa hồng', defaultVisible: false },
        { id: 'costAmount', label: 'Tổng giá nhập', defaultVisible: false },
        { id: 'netProfit', label: 'Lợi nhuận thuần', defaultVisible: false }
      ];
    }

    let cashFlowVisibleColumns = {};
    CASH_FLOW_COLUMNS_CONFIG.forEach(c => {
      cashFlowVisibleColumns[c.id] = c.defaultVisible;
    });

    const cashFlowFilterState = {
      search: '',
      group: 'ALL',
      type: 'ALL',
      channel: 'ALL',
      subType: 'ALL',
      status: 'ALL',
      period: 'THIS_MONTH',
      dateFrom: '',
      dateTo: ''
    };

    let cashFlowCurrentPage = 1;
    const CASH_FLOW_PAGE_SIZE = 12;
    let cashFlowMasterDataset = [];
    let cashFlowOrdersMap = {};
    let cashFlowFilteredDataset = [];
    let currentCashFlowDetailOrderCode = null;
    let currentInvoiceListTab = 'ALL';

    function initCashFlowEngine() {
      if (cashFlowMasterDataset.length === 0) {
        buildCashFlowDataFromOrders();
      }
      populateCashFlowFilterDropdowns();
      syncCashFlowVisibleColumnCount();
      applyCashFlowFilters();
    }

    function buildCashFlowDataFromOrders() {
      cashFlowMasterDataset = [];
      cashFlowOrdersMap = {};
      let txSeq = 1001;

      // Lấy từ dataset orders hoặc mock orders (TecheraDB hoặc reportOrdersDataset)
      const baseOrders = (typeof TecheraDB !== 'undefined' && TecheraDB.getOrders)
        ? TecheraDB.getOrders()
        : ((typeof reportOrdersDataset !== 'undefined' && Array.isArray(reportOrdersDataset) && reportOrdersDataset.length > 0)
          ? reportOrdersDataset
          : []);

      // Mở rộng thêm dữ liệu lịch sử các năm 2022 - 2026 và các quý để kiểm thử đầy đủ bộ lọc thời gian
      const extendedOrders = [...baseOrders];
      const extraHistoricalDates = [
        { d: '2026-02-14', c: 'Đại lý', st: 'Đại lý cấp 1', s: 'Sun World Ba Na Hills', rev: 45000000, profit: 5400000, stat: 'Đã xuất vé', q: 'Q1' },
        { d: '2026-03-20', c: 'Website', st: 'Khách lẻ (B2C)', s: 'VinWonders Phú Quốc', rev: 6800000, profit: 880000, stat: 'Đã xuất vé', q: 'Q1' },
        { d: '2026-05-18', c: 'Đại lý', st: 'OTA', s: 'Sun World Fansipan', rev: 28500000, profit: 3400000, stat: 'Đã xuất vé', q: 'Q2' },
        { d: '2026-06-25', c: 'Nội bộ', st: 'Nhân viên kinh doanh', s: 'VinWonders Nha Trang', rev: 14200000, profit: 1700000, stat: 'Đã xuất vé', q: 'Q2' },
        { d: '2026-08-15', c: 'Đại lý', st: 'Đại lý cấp 2', s: 'Sun World Hạ Long', rev: 19600000, profit: 2350000, stat: 'Đã xuất vé', q: 'Q3' },
        { d: '2026-09-02', c: 'Website', st: 'Khách lẻ (B2C)', s: 'Công viên Nước Đầm Sen', rev: 3200000, profit: 450000, stat: 'Đã xuất vé', q: 'Q3' },
        { d: '2025-11-15', c: 'Đại lý', st: 'Đại lý cấp 1', s: 'Sun World Ba Na Hills', rev: 52000000, profit: 6240000, stat: 'Đã xuất vé', y: '2025' },
        { d: '2025-07-20', c: 'Website', st: 'Khách lẻ (B2C)', s: 'VinWonders Phú Quốc', rev: 8900000, profit: 1100000, stat: 'Đã xuất vé', y: '2025' },
        { d: '2024-08-10', c: 'Đại lý', st: 'OTA', s: 'Sun World Fansipan', rev: 41000000, profit: 4920000, stat: 'Đã xuất vé', y: '2024' },
        { d: '2023-10-05', c: 'Website', st: 'Khách lẻ (B2C)', s: 'VinWonders Nha Trang', rev: 5600000, profit: 720000, stat: 'Đã xuất vé', y: '2023' },
        { d: '2022-12-18', c: 'Đại lý', st: 'Đại lý cấp 1', s: 'Sun World Ba Na Hills', rev: 38000000, profit: 4560000, stat: 'Đã xuất vé', y: '2022' }
      ];

      extraHistoricalDates.forEach((ex, idx) => {
        extendedOrders.push({
          orderCode: `ORD-HIST-${ex.d.slice(2, 4)}${ex.d.slice(5, 7)}-${String(idx + 1).padStart(3, '0')}`,
          createdDate: ex.d,
          useDate: ex.d,
          customerName: ex.c === 'Đại lý' ? `Công ty Lữ hành Saigontourist #${idx + 1}` : (ex.c === 'Website' ? `Khách hàng Lê Quốc ${String.fromCharCode(65 + idx)}` : `NVKD Techera ${idx + 1}`),
          customerPhone: `090${idx} 888 777`,
          customerEmail: `order.${idx}@traveltech.vn`,
          channel: ex.c,
          subType: ex.st,
          staff: 'Techera Ops',
          salesOwner: 'Admin Techera',
          corp: ex.s.includes('Sun World') ? 'Sun World' : (ex.s.includes('VinWonders') ? 'VinWonders' : 'Khác'),
          site: ex.s,
          packageName: `Combo Vé Tham Quan & Cáp Treo - ${ex.s}`,
          tickets: Math.max(2, Math.round(ex.rev / 850000)),
          revenue: ex.rev,
          netCost: ex.rev - ex.profit,
          profit: ex.profit,
          status: ex.stat
        });
      });

      // Tạo cấu trúc dữ liệu cho từng đơn hàng và các dòng giao dịch thu chi đối soát
      extendedOrders.forEach((o, oIdx) => {
        const orderCode = o.orderCode || `ORD-2611-${String(oIdx + 1).padStart(3, '0')}`;
        const revenue = Number(o.revenue) || 1500000;
        const netCost = Number(o.netCost) || Math.round(revenue * 0.85);
        const profit = Number(o.profit) || Math.round(revenue * 0.15);
        const listedPrice = Math.round(revenue * 1.08);
        const discountAmount = Math.max(0, listedPrice - revenue);
        const commissionAmount = Math.round(revenue * 0.05);
        const paymentFee = Math.round(revenue * 0.012);
        const netProfit = Math.max(0, profit - commissionAmount - paymentFee);

        let channel = 'Đại lý';
        if (o.channel) {
          if (o.channel.includes('Website') || o.channel.includes('B2C')) channel = 'Website';
          else if (o.channel.includes('Nội bộ') || o.channel.includes('Sale')) channel = 'Nội bộ';
          else channel = 'Đại lý';
        }

        let subType = 'Khách lẻ (B2C)';
        if (channel === 'Đại lý') {
          subType = (oIdx % 3 === 0) ? 'Đại lý cấp 1' : ((oIdx % 3 === 1) ? 'Đại lý cấp 2' : 'OTA');
        } else if (channel === 'Nội bộ') {
          subType = 'Nhân viên kinh doanh';
        } else {
          subType = 'Khách lẻ (B2C)';
        }

        const dateStr = o.createdDate || '2026-11-10';
        const createdDate = `${dateStr} ${String(8 + (oIdx % 10)).padStart(2, '0')}:${String(10 + (oIdx % 45)).padStart(2, '0')}`;
        const updatedDate = `${dateStr} ${String(14 + (oIdx % 8)).padStart(2, '0')}:${String(15 + (oIdx % 40)).padStart(2, '0')}`;

        // Hóa đơn VAT: khoảng 82% Đã xuất, 18% Chưa xuất
        const isInvoiceIssued = (oIdx % 6 !== 0) && (o.status !== 'Nháp' && o.status !== 'Đang xử lý');
        const invoiceStatus = isInvoiceIssued ? 'Đã xuất' : 'Chưa xuất';
        const invoiceCode = isInvoiceIssued ? `HD-26${dateStr.slice(5, 7)}-${String(1000 + oIdx)}` : '';
        const invoiceDate = isInvoiceIssued ? dateStr : '';

        const agencyCode = (channel === 'Đại lý')
          ? `DL-${String((oIdx % 25) + 1).padStart(2, '0')}`
          : ((channel === 'Website') ? 'KH-LE' : `NB-${String((oIdx % 10) + 1).padStart(2, '0')}`);

        const custName = o.customerName || (channel === 'Đại lý' ? `Đại lý Du lịch ${o.staff || 'Việt Nam'}` : 'Khách lẻ Techera');
        const custPhone = o.customerPhone || `0912 ${String(100 + (oIdx % 900))} ${String(100 + (oIdx % 900))}`;
        const custEmail = o.customerEmail || `booking.${oIdx + 1}@techera.vn`;
        const paymentMethod = o.paymentMethod || ((oIdx % 3 === 0) ? 'Ví điện tử' : ((oIdx % 3 === 1) ? 'Chuyển khoản QR' : 'Cổng VNPAY'));

        const isPending = (o.status === 'Đang xử lý' || o.status === 'Nháp');
        const isFailed = (o.status === 'Đã hủy');
        const isSuccess = (!isPending && !isFailed);

        const orderObj = {
          orderCode,
          source: (channel === 'Đại lý' ? 'Đại lý B2B' : (channel === 'Website' ? 'Website Booking' : 'Nội bộ Techera')),
          orderType: o.packageName || (o.site ? `Vé tham quan ${o.site}` : 'Combo Cáp treo & Buffet'),
          customerName: custName,
          customerEmail: custEmail,
          customerPhone: custPhone,
          channel,
          subType,
          expectedRevenue: isPending ? revenue : 0,
          expectedCost: isPending ? netCost : 0,
          actualRevenue: isSuccess ? revenue : 0,
          actualCost: isSuccess ? (netCost + commissionAmount + paymentFee) : 0,
          createdDate,
          updatedDate,
          orderStatus: o.status || 'Đã xuất vé',
          invoiceStatus,
          invoiceCode,
          invoiceDate,
          listedPrice,
          discountAmount,
          commissionAmount,
          costAmount: netCost,
          netProfit,
          paymentMethod,
          agencyCode,
          site: o.site || 'Khu vui chơi',
          corp: o.corp || 'Sun World'
        };

        if (typeof TecheraDB !== 'undefined' && TecheraDB.getInvoiceOverrides) {
          const overrides = TecheraDB.getInvoiceOverrides();
          if (overrides && overrides[orderCode]) {
            Object.assign(orderObj, overrides[orderCode]);
          }
        }
        cashFlowOrdersMap[orderCode] = orderObj;

        // TẠO CÁC DÒNG GIAO DỊCH CON RIÊNG BIỆT CHO ĐỐI SOÁT
        // 1. Khoản Thu: Thu bán vé (hoặc Thu tiền cọc)
        cashFlowMasterDataset.push({
          txCode: `TX-THU-26${dateStr.slice(5, 7)}-${String(txSeq++).padStart(5, '0')}`,
          orderCode,
          beneficiaryName: custName,
          agencyCode,
          group: 'Thu',
          type: isPending ? 'Thu tiền cọc' : 'Thu bán vé',
          paymentMethod,
          status: isSuccess ? 'Thành công' : (isPending ? 'Chờ xử lý' : 'Thất bại'),
          createdDate,
          updatedDate,
          channel,
          subType,
          amount: revenue,
          listedPrice,
          discountAmount,
          commissionAmount,
          costAmount: netCost,
          netProfit,
          invoiceStatus,
          invoiceCode,
          invoiceDate
        });

        // 2. Khoản Chi: Chi giá vốn nhập vé (trả Nhà cung cấp KDL)
        cashFlowMasterDataset.push({
          txCode: `TX-VON-26${dateStr.slice(5, 7)}-${String(txSeq++).padStart(5, '0')}`,
          orderCode,
          beneficiaryName: `${orderObj.corp} (${orderObj.site})`,
          agencyCode: `NCC-${String((oIdx % 6) + 1).padStart(2, '0')}`,
          group: 'Chi',
          type: 'Chi giá vốn nhập vé',
          paymentMethod: 'Ủy nhiệm chi ngân hàng',
          status: isSuccess ? 'Thành công' : (isPending ? 'Chờ xử lý' : 'Thất bại'),
          createdDate,
          updatedDate,
          channel,
          subType,
          amount: -netCost,
          listedPrice,
          discountAmount,
          commissionAmount,
          costAmount: netCost,
          netProfit,
          invoiceStatus,
          invoiceCode,
          invoiceDate
        });

        // 3. Khoản Chi: Chi hoa hồng đại lý / CTV
        if (channel === 'Đại lý' || channel === 'Nội bộ') {
          cashFlowMasterDataset.push({
            txCode: `TX-HH-26${dateStr.slice(5, 7)}-${String(txSeq++).padStart(5, '0')}`,
            orderCode,
            beneficiaryName: custName,
            agencyCode,
            group: 'Chi',
            type: 'Chi hoa hồng đại lý',
            paymentMethod: 'Ví điện tử đại lý',
            status: isSuccess ? 'Thành công' : (isPending ? 'Chờ xử lý' : 'Thất bại'),
            createdDate,
            updatedDate,
            channel,
            subType,
            amount: -commissionAmount,
            listedPrice,
            discountAmount,
            commissionAmount,
            costAmount: netCost,
            netProfit,
            invoiceStatus,
            invoiceCode,
            invoiceDate
          });
        }

        // 4. Khoản Chi: Chi phí cổng thanh toán
        cashFlowMasterDataset.push({
          txCode: `TX-PHI-26${dateStr.slice(5, 7)}-${String(txSeq++).padStart(5, '0')}`,
          orderCode,
          beneficiaryName: 'Cổng thanh toán VNPAY / VietQR',
          agencyCode: 'GATEWAY-01',
          group: 'Chi',
          type: 'Chi phí cổng thanh toán',
          paymentMethod: 'Khấu trừ tự động',
          status: isSuccess ? 'Thành công' : 'Thất bại',
          createdDate,
          updatedDate,
          channel,
          subType,
          amount: -paymentFee,
          listedPrice,
          discountAmount,
          commissionAmount,
          costAmount: netCost,
          netProfit,
          invoiceStatus,
          invoiceCode,
          invoiceDate
        });

        // 5. Khoản Chi: Chi hoàn vé (Nếu đơn ở trạng thái Hoàn tiền hoặc Đã hủy)
        if (o.status === 'Hoàn tiền' || o.status === 'Đã hủy') {
          cashFlowMasterDataset.push({
            txCode: `TX-HOAN-26${dateStr.slice(5, 7)}-${String(txSeq++).padStart(5, '0')}`,
            orderCode,
            beneficiaryName: custName,
            agencyCode,
            group: 'Chi',
            type: 'Chi hoàn vé',
            paymentMethod: 'Chuyển khoản hoàn tiền',
            status: 'Thành công',
            createdDate,
            updatedDate,
            channel,
            subType,
            amount: -revenue,
            listedPrice,
            discountAmount,
            commissionAmount,
            costAmount: netCost,
            netProfit: -revenue,
            invoiceStatus: 'Chưa xuất',
            invoiceCode: '',
            invoiceDate: ''
          });
        }
      });
    }

    function addOrderToCashFlowEngine(newOrder) {
      if (!newOrder) return;
      const orderCode = newOrder.orderCode;
      const revenue = Number(newOrder.revenue) || 0;
      const profit = Number(newOrder.profit) || Math.round(revenue * 0.15);
      const netCost = Math.max(0, revenue - profit);
      const listedPrice = Math.round(revenue * 1.08);
      const discountAmount = Math.max(0, listedPrice - revenue);
      const commissionAmount = Math.round(revenue * 0.05);
      const paymentFee = Math.round(revenue * 0.012);
      const netProfit = Math.max(0, profit - commissionAmount - paymentFee);

      const now = new Date();
      const pad = n => String(n).padStart(2, '0');
      const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
      const dateStr = newOrder.createdDate || '2026-11-10';
      const createdDate = `${dateStr} ${timeStr}`;
      const updatedDate = createdDate;

      let channel = 'Đại lý';
      if (newOrder.channel) {
        if (newOrder.channel.includes('Website')) channel = 'Website';
        else if (newOrder.channel.includes('Nội bộ')) channel = 'Nội bộ';
      }

      const orderObj = {
        orderCode,
        source: channel === 'Đại lý' ? 'Đại lý B2B' : (channel === 'Website' ? 'Website Booking' : 'Nội bộ Techera'),
        orderType: newOrder.site ? `Vé ${newOrder.site}` : 'Vé tham quan',
        customerName: newOrder.customerName || 'Đại lý Techera',
        customerEmail: 'khachhang@techera.vn',
        customerPhone: '0912 345 678',
        channel,
        subType: channel === 'Website' ? 'Khách lẻ (B2C)' : 'Đại lý cấp 1',
        expectedRevenue: newOrder.status === 'Đã xuất vé' ? 0 : revenue,
        expectedCost: newOrder.status === 'Đã xuất vé' ? 0 : netCost,
        actualRevenue: newOrder.status === 'Đã xuất vé' ? revenue : 0,
        actualCost: newOrder.status === 'Đã xuất vé' ? (netCost + commissionAmount + paymentFee) : 0,
        createdDate,
        updatedDate,
        orderStatus: newOrder.status || 'Đã xuất vé',
        invoiceStatus: 'Chưa xuất',
        invoiceCode: '',
        invoiceDate: '',
        listedPrice,
        discountAmount,
        commissionAmount,
        costAmount: netCost,
        netProfit,
        paymentMethod: newOrder.paymentMethod || 'Ví điện tử',
        agencyCode: 'DL-01',
        site: newOrder.site || 'KDL',
        corp: newOrder.corp || 'Sun World'
      };

      cashFlowOrdersMap[orderCode] = orderObj;

      let txSeq = Math.floor(10000 + Math.random() * 90000);
      // Dòng 1: Thu
      cashFlowMasterDataset.unshift({
        txCode: `TX-THU-2611-${txSeq++}`,
        orderCode,
        beneficiaryName: orderObj.customerName,
        agencyCode: orderObj.agencyCode,
        group: 'Thu',
        type: newOrder.status === 'Đã xuất vé' ? 'Thu bán vé' : 'Thu tiền cọc',
        paymentMethod: orderObj.paymentMethod,
        status: newOrder.status === 'Đã xuất vé' ? 'Thành công' : 'Chờ xử lý',
        createdDate,
        updatedDate,
        channel,
        subType: orderObj.subType,
        amount: revenue,
        listedPrice,
        discountAmount,
        commissionAmount,
        costAmount: netCost,
        netProfit,
        invoiceStatus: 'Chưa xuất',
        invoiceCode: '',
        invoiceDate: ''
      });

      // Dòng 2: Chi giá vốn
      cashFlowMasterDataset.unshift({
        txCode: `TX-VON-2611-${txSeq++}`,
        orderCode,
        beneficiaryName: `${orderObj.corp} (${orderObj.site})`,
        agencyCode: 'NCC-SW-01',
        group: 'Chi',
        type: 'Chi giá vốn nhập vé',
        paymentMethod: 'Ủy nhiệm chi ngân hàng',
        status: newOrder.status === 'Đã xuất vé' ? 'Thành công' : 'Chờ xử lý',
        createdDate,
        updatedDate,
        channel,
        subType: orderObj.subType,
        amount: -netCost,
        listedPrice,
        discountAmount,
        commissionAmount,
        costAmount: netCost,
        netProfit,
        invoiceStatus: 'Chưa xuất',
        invoiceCode: '',
        invoiceDate: ''
      });

      // Refresh view nếu đang ở cashflow
      if (typeof currentAppView !== 'undefined' && currentAppView === 'cashflow') {
        applyCashFlowFilters();
      }
    }

    function populateCashFlowFilterDropdowns() {
      onCashFlowGroupFilterChange();
      onCashFlowChannelFilterChange();
    }

    function onCashFlowGroupFilterChange() {
      const groupEl = document.getElementById('cfFilterGroup');
      const typeEl = document.getElementById('cfFilterType');
      if (!groupEl || !typeEl) return;

      const group = groupEl.value;
      const prevVal = typeEl.value;

      let optionsHtml = `<option value="ALL">Tất cả loại phiếu</option>`;
      if (group === 'Thu') {
        optionsHtml += `
          <option value="Thu bán vé">Thu bán vé</option>
          <option value="Thu tiền cọc">Thu tiền cọc</option>
        `;
      } else if (group === 'Chi') {
        optionsHtml += `
          <option value="Chi giá vốn nhập vé">Chi giá vốn nhập vé</option>
          <option value="Chi hoa hồng đại lý">Chi hoa hồng đại lý</option>
          <option value="Chi phí cổng thanh toán">Chi phí cổng thanh toán</option>
          <option value="Chi hoàn vé">Chi hoàn vé</option>
        `;
      } else {
        optionsHtml += `
          <optgroup label="Nhóm Thu">
            <option value="Thu bán vé">Thu bán vé</option>
            <option value="Thu tiền cọc">Thu tiền cọc</option>
          </optgroup>
          <optgroup label="Nhóm Chi">
            <option value="Chi giá vốn nhập vé">Chi giá vốn nhập vé</option>
            <option value="Chi hoa hồng đại lý">Chi hoa hồng đại lý</option>
            <option value="Chi phí cổng thanh toán">Chi phí cổng thanh toán</option>
            <option value="Chi hoàn vé">Chi hoàn vé</option>
          </optgroup>
        `;
      }

      typeEl.innerHTML = optionsHtml;
      if (Array.from(typeEl.options).some(o => o.value === prevVal)) {
        typeEl.value = prevVal;
      } else {
        typeEl.value = 'ALL';
      }
      applyCashFlowFilters();
    }

    function onCashFlowChannelFilterChange() {
      const channelEl = document.getElementById('cfFilterChannel');
      const subTypeEl = document.getElementById('cfFilterSubType');
      if (!channelEl || !subTypeEl) return;

      const ch = channelEl.value;
      const prevVal = subTypeEl.value;

      let opts = `<option value="ALL">Tất cả Loại thuộc kênh</option>`;
      if (ch === 'Website') {
        opts += `
          <option value="Khách lẻ (B2C)">Khách lẻ (B2C)</option>
          <option value="Khách đoàn trực tuyến">Khách đoàn trực tuyến</option>
        `;
      } else if (ch === 'Đại lý') {
        opts += `
          <option value="Đại lý cấp 1">Đại lý cấp 1</option>
          <option value="Đại lý cấp 2">Đại lý cấp 2</option>
          <option value="OTA">OTA (Online Travel Agent)</option>
        `;
      } else if (ch === 'Nội bộ') {
        opts += `
          <option value="Nhân viên kinh doanh">Nhân viên kinh doanh</option>
          <option value="Booking nội bộ">Booking nội bộ</option>
        `;
      } else {
        opts += `
          <option value="Khách lẻ (B2C)">Khách lẻ (B2C)</option>
          <option value="Đại lý cấp 1">Đại lý cấp 1</option>
          <option value="Đại lý cấp 2">Đại lý cấp 2</option>
          <option value="OTA">OTA (Online Travel Agent)</option>
          <option value="Nhân viên kinh doanh">Nhân viên kinh doanh</option>
        `;
      }

      subTypeEl.innerHTML = opts;
      if (Array.from(subTypeEl.options).some(o => o.value === prevVal)) {
        subTypeEl.value = prevVal;
      } else {
        subTypeEl.value = 'ALL';
      }
      applyCashFlowFilters();
    }

    function onCashFlowPeriodChange() {
      const periodEl = document.getElementById('cfFilterPeriod');
      const customWrap = document.getElementById('cfCustomDateWrap');
      if (!periodEl) return;

      const period = periodEl.value;
      if (customWrap) {
        if (period === 'CUSTOM') {
          customWrap.classList.remove('hidden');
          customWrap.classList.add('flex');
          const fromInput = document.getElementById('cfCustomDateFrom');
          const toInput = document.getElementById('cfCustomDateTo');
          if (fromInput && !fromInput.value) fromInput.value = '2026-11-01';
          if (toInput && !toInput.value) toInput.value = '2026-11-10';
        } else {
          customWrap.classList.add('hidden');
          customWrap.classList.remove('flex');
        }
      }
      applyCashFlowFilters();
    }

    function resetCashFlowFilters() {
      const searchEl = document.getElementById('cfFilterSearch');
      const groupEl = document.getElementById('cfFilterGroup');
      const channelEl = document.getElementById('cfFilterChannel');
      const statusEl = document.getElementById('cfFilterStatus');
      const periodEl = document.getElementById('cfFilterPeriod');
      const customWrap = document.getElementById('cfCustomDateWrap');

      if (searchEl) searchEl.value = '';
      if (groupEl) groupEl.value = 'ALL';
      if (channelEl) channelEl.value = 'ALL';
      if (statusEl) statusEl.value = 'ALL';
      if (periodEl) periodEl.value = 'THIS_MONTH';
      if (customWrap) {
        customWrap.classList.add('hidden');
        customWrap.classList.remove('flex');
      }

      populateCashFlowFilterDropdowns();
      cashFlowCurrentPage = 1;
      applyCashFlowFilters();
    }

    function applyCashFlowFilters() {
      const searchEl = document.getElementById('cfFilterSearch');
      const groupEl = document.getElementById('cfFilterGroup');
      const typeEl = document.getElementById('cfFilterType');
      const channelEl = document.getElementById('cfFilterChannel');
      const subTypeEl = document.getElementById('cfFilterSubType');
      const statusEl = document.getElementById('cfFilterStatus');
      const periodEl = document.getElementById('cfFilterPeriod');
      const fromEl = document.getElementById('cfCustomDateFrom');
      const toEl = document.getElementById('cfCustomDateTo');

      const q = searchEl ? searchEl.value.toLowerCase().trim() : '';
      const group = groupEl ? groupEl.value : 'ALL';
      const type = typeEl ? typeEl.value : 'ALL';
      const channel = channelEl ? channelEl.value : 'ALL';
      const subType = subTypeEl ? subTypeEl.value : 'ALL';
      const status = statusEl ? statusEl.value : 'ALL';
      const period = periodEl ? periodEl.value : 'THIS_MONTH';
      const customFrom = fromEl ? fromEl.value : '';
      const customTo = toEl ? toEl.value : '';

      cashFlowFilteredDataset = cashFlowMasterDataset.filter(tx => {
        // 1. Nhóm
        if (group !== 'ALL' && tx.group !== group) return false;

        // 2. Loại phiếu
        if (type !== 'ALL' && tx.type !== type) return false;

        // 3. Kênh bán
        if (channel !== 'ALL' && tx.channel !== channel) return false;

        // 4. Loại thuộc kênh bán
        if (subType !== 'ALL' && tx.subType !== subType) return false;

        // 5. Trạng thái
        if (status !== 'ALL' && tx.status !== status) return false;

        // 6. Thời gian
        const dtStr = (tx.createdDate || '').slice(0, 10);
        if (period === 'THIS_MONTH') {
          if (!dtStr.startsWith('2026-11')) return false;
        } else if (period === '7_DAYS') {
          if (dtStr < '2026-11-04' || dtStr > '2026-11-10') return false;
        } else if (period === '30_DAYS') {
          if (dtStr < '2026-10-12' || dtStr > '2026-11-10') return false;
        } else if (period === 'Q1') {
          const m = dtStr.slice(5, 7);
          if (!dtStr.startsWith('2026') || !['01', '02', '03'].includes(m)) return false;
        } else if (period === 'Q2') {
          const m = dtStr.slice(5, 7);
          if (!dtStr.startsWith('2026') || !['04', '05', '06'].includes(m)) return false;
        } else if (period === 'Q3') {
          const m = dtStr.slice(5, 7);
          if (!dtStr.startsWith('2026') || !['07', '08', '09'].includes(m)) return false;
        } else if (period === 'Q4') {
          const m = dtStr.slice(5, 7);
          if (!dtStr.startsWith('2026') || !['10', '11', '12'].includes(m)) return false;
        } else if (period.startsWith('YEAR_')) {
          const y = period.replace('YEAR_', '');
          if (!dtStr.startsWith(y)) return false;
        } else if (period === 'CUSTOM') {
          if (customFrom && dtStr < customFrom) return false;
          if (customTo && dtStr > customTo) return false;
        }

        // Search query
        if (q) {
          const hay = `${tx.txCode} ${tx.orderCode} ${tx.beneficiaryName} ${tx.agencyCode} ${tx.type} ${tx.paymentMethod} ${tx.channel}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }

        return true;
      });

      updateCashFlowKpis();
      renderCashFlowTable();
    }

    function updateCashFlowKpis() {
      // 1. Tổng giao dịch
      const countEl = document.getElementById('cfKpiTotalCount');
      if (countEl) countEl.innerText = formatMoney(cashFlowFilteredDataset.length) + ' GD';

      // 2. Tổng thu: Thực thu từ giao dịch Thu ở trạng thái Thành công
      const totalIncome = cashFlowFilteredDataset
        .filter(t => t.group === 'Thu' && t.status === 'Thành công')
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      const incEl = document.getElementById('cfKpiTotalIncome');
      if (incEl) incEl.innerText = `${formatMoney(totalIncome)} đ`;

      // 3. Tổng chi: Thực chi từ giao dịch Chi ở trạng thái Thành công
      const totalExpense = cashFlowFilteredDataset
        .filter(t => t.group === 'Chi' && t.status === 'Thành công')
        .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);
      const expEl = document.getElementById('cfKpiTotalExpense');
      if (expEl) expEl.innerText = `${formatMoney(totalExpense)} đ`;

      // 4. Dự kiến thu: Giao dịch Thu đang Chờ xử lý
      const expIncome = cashFlowFilteredDataset
        .filter(t => t.group === 'Thu' && t.status === 'Chờ xử lý')
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      const expIncEl = document.getElementById('cfKpiExpectedIncome');
      if (expIncEl) expIncEl.innerText = `${formatMoney(expIncome)} đ`;

      // 5. Dự kiến chi: Giao dịch Chi đang Chờ xử lý
      const expExpense = cashFlowFilteredDataset
        .filter(t => t.group === 'Chi' && t.status === 'Chờ xử lý')
        .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);
      const expExpEl = document.getElementById('cfKpiExpectedExpense');
      if (expExpEl) expExpEl.innerText = `${formatMoney(expExpense)} đ`;

      // 6. Hóa đơn chưa xuất / đã xuất: Tỷ lệ % từ tập đơn hàng theo bộ lọc
      const relevantOrderCodes = new Set(cashFlowFilteredDataset.map(t => t.orderCode));
      let totalOrders = 0;
      let issuedCount = 0;
      let pendingCount = 0;

      relevantOrderCodes.forEach(code => {
        const ord = cashFlowOrdersMap[code];
        if (ord) {
          totalOrders++;
          if (ord.invoiceStatus === 'Đã xuất') issuedCount++;
          else pendingCount++;
        }
      });

      // Nếu bộ lọc rỗng, dùng số liệu tổng thể
      if (totalOrders === 0) {
        const allOrders = Object.values(cashFlowOrdersMap);
        totalOrders = allOrders.length;
        issuedCount = allOrders.filter(o => o.invoiceStatus === 'Đã xuất').length;
        pendingCount = totalOrders - issuedCount;
      }

      const ratio = totalOrders > 0 ? Math.round((issuedCount / totalOrders) * 100) : 0;
      const ratioEl = document.getElementById('cfKpiInvoiceRatio');
      if (ratioEl) {
        ratioEl.innerHTML = `${ratio}% <span class="text-[11px] font-semibold text-emerald-700">đã xuất</span>`;
      }
      const barIssued = document.getElementById('cfKpiInvoiceBarIssued');
      const barPending = document.getElementById('cfKpiInvoiceBarPending');
      if (barIssued) barIssued.style.width = `${ratio}%`;
      if (barPending) barPending.style.width = `${100 - ratio}%`;

      const txtIssued = document.getElementById('cfKpiInvoiceIssuedText');
      const txtPending = document.getElementById('cfKpiInvoicePendingText');
      if (txtIssued) txtIssued.innerText = `${issuedCount} đã xuất`;
      if (txtPending) txtPending.innerText = `${pendingCount} chưa xuất ➔`;
    }

    function renderCashFlowHistoryView() {
      initCashFlowEngine();
      syncCashFlowVisibleColumnCount();
      applyCashFlowFilters();
    }

    function syncCashFlowVisibleColumnCount() {
      const activeCount = CASH_FLOW_COLUMNS_CONFIG.filter(c => cashFlowVisibleColumns[c.id]).length;
      const countEl = document.getElementById('cfVisibleColumnsCount');
      if (countEl) countEl.innerText = activeCount;
    }

    function renderCashFlowTable() {
      const headerEl = document.getElementById('cfTableHeader');
      const bodyEl = document.getElementById('cfTableBody');
      const countEl = document.getElementById('cfTableRecordCount');
      const footerEl = document.getElementById('cfTablePaginationFooter');

      if (countEl) {
        countEl.innerText = `${formatMoney(cashFlowFilteredDataset.length)} giao dịch`;
      }

      // Render thead dựa trên CASH_FLOW_COLUMNS_CONFIG & cashFlowVisibleColumns
      if (headerEl) {
        const activeCols = CASH_FLOW_COLUMNS_CONFIG.filter(c => cashFlowVisibleColumns[c.id]);
        headerEl.innerHTML = `
          <tr>
            ${activeCols.map(c => {
              let alignClass = 'text-left';
              if (['amount', 'listedPrice', 'discountAmount', 'commissionAmount', 'costAmount', 'netProfit'].includes(c.id)) {
                alignClass = 'text-right';
              } else if (['group', 'status'].includes(c.id)) {
                alignClass = 'text-center';
              }
              return `<th class="py-3 px-3.5 whitespace-nowrap ${alignClass}">${c.label}</th>`;
            }).join('')}
            <th class="py-3 px-3.5 text-center whitespace-nowrap sticky right-0 bg-slate-50/95 backdrop-blur-xs shadow-[-6px_0_12px_rgba(0,0,0,0.03)] z-20">Thao tác</th>
          </tr>
        `;
      }

      // Pagination
      const totalRecords = cashFlowFilteredDataset.length;
      const totalPages = Math.max(1, Math.ceil(totalRecords / CASH_FLOW_PAGE_SIZE));
      cashFlowCurrentPage = Math.min(Math.max(1, cashFlowCurrentPage), totalPages);
      const startIdx = (cashFlowCurrentPage - 1) * CASH_FLOW_PAGE_SIZE;
      const endIdx = Math.min(startIdx + CASH_FLOW_PAGE_SIZE, totalRecords);
      const pageSlice = cashFlowFilteredDataset.slice(startIdx, endIdx);

      if (bodyEl) {
        if (pageSlice.length === 0) {
          const colSpan = CASH_FLOW_COLUMNS_CONFIG.filter(c => cashFlowVisibleColumns[c.id]).length + 1;
          bodyEl.innerHTML = `
            <tr>
              <td colspan="${colSpan}" class="py-12 text-center text-slate-400 font-semibold">
                <i class="fa-solid fa-receipt text-3xl mb-2 block text-slate-300"></i>
                Không tìm thấy giao dịch dòng tiền phù hợp với bộ lọc hiện tại.
              </td>
            </tr>
          `;
        } else {
          bodyEl.innerHTML = pageSlice.map(tx => {
            const activeCols = CASH_FLOW_COLUMNS_CONFIG.filter(c => cashFlowVisibleColumns[c.id]);
            return `
              <tr class="hover:bg-slate-50/80 transition-colors">
                ${activeCols.map(c => {
                  return renderCashFlowCell(c.id, tx);
                }).join('')}
                <!-- Cột thao tác: Icon con mắt 👁 -->
                <td class="py-2.5 px-3.5 text-center whitespace-nowrap sticky right-0 bg-white/95 backdrop-blur-xs shadow-[-6px_0_12px_rgba(0,0,0,0.03)] z-10">
                  <button type="button" onclick="openCashFlowDetailModal('${tx.orderCode}', '${tx.txCode}')" class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-brand-50 hover:text-brand-600 text-slate-600 flex items-center justify-center transition-all cursor-pointer mx-auto shadow-2xs" title="Xem chi tiết đơn hàng (Icon con mắt)">
                    <i class="fa-solid fa-eye text-xs"></i>
                  </button>
                </td>
              </tr>
            `;
          }).join('');
        }
      }

      // Render Pagination Footer
      if (footerEl) {
        footerEl.innerHTML = `
          <div class="text-xs text-slate-500 font-medium">
            Đang hiển thị <strong class="text-slate-800">${totalRecords > 0 ? startIdx + 1 : 0}</strong> - <strong class="text-slate-800">${endIdx}</strong> trong tổng số <strong class="text-slate-900">${formatMoney(totalRecords)}</strong> giao dịch
          </div>
          <div class="flex items-center gap-1.5">
            <button type="button" onclick="changeCashFlowPage(${cashFlowCurrentPage - 1})" ${cashFlowCurrentPage <= 1 ? 'disabled' : ''} class="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none text-xs font-bold text-slate-700 cursor-pointer shadow-2xs">
              <i class="fa-solid fa-angle-left mr-1"></i>Trước
            </button>
            <span class="px-3 py-1 text-xs font-extrabold text-slate-700">Trang ${cashFlowCurrentPage} / ${totalPages}</span>
            <button type="button" onclick="changeCashFlowPage(${cashFlowCurrentPage + 1})" ${cashFlowCurrentPage >= totalPages ? 'disabled' : ''} class="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none text-xs font-bold text-slate-700 cursor-pointer shadow-2xs">
              Sau<i class="fa-solid fa-angle-right ml-1"></i>
            </button>
          </div>
        `;
      }
    }

    function renderCashFlowCell(colId, tx) {
      switch (colId) {
        case 'orderCode':
          return `<td class="py-2.5 px-3.5 whitespace-nowrap">
            <button type="button" onclick="openCashFlowDetailModal('${tx.orderCode}')" class="font-extrabold text-brand-600 hover:text-brand-700 hover:underline cursor-pointer text-xs">
              ${tx.orderCode}
            </button>
          </td>`;
        case 'txCode':
          return `<td class="py-2.5 px-3.5 whitespace-nowrap font-mono font-bold text-slate-800 text-[11px]">${tx.txCode}</td>`;
        case 'beneficiary':
          return `<td class="py-2.5 px-3.5 whitespace-nowrap">
            <div class="font-bold text-slate-900 text-xs">${tx.beneficiaryName}</div>
            <div class="text-[10px] text-slate-400 font-medium">${tx.agencyCode || '-'}</div>
          </td>`;
        case 'group':
          const isThu = tx.group === 'Thu';
          return `<td class="py-2.5 px-3.5 text-center whitespace-nowrap">
            <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black ${isThu ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}">
              ${tx.group}
            </span>
          </td>`;
        case 'type':
          return `<td class="py-2.5 px-3.5 whitespace-nowrap font-semibold text-slate-700 text-xs">${tx.type}</td>`;
        case 'paymentMethod':
          return `<td class="py-2.5 px-3.5 whitespace-nowrap text-slate-600 text-xs">${tx.paymentMethod}</td>`;
        case 'status':
          let stColor = 'bg-slate-100 text-slate-600 border-slate-200';
          if (tx.status === 'Thành công') stColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
          else if (tx.status === 'Chờ xử lý') stColor = 'bg-amber-50 text-amber-700 border-amber-200';
          else if (tx.status === 'Thất bại') stColor = 'bg-rose-50 text-rose-700 border-rose-200';
          return `<td class="py-2.5 px-3.5 text-center whitespace-nowrap">
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${stColor}">
              ${tx.status}
            </span>
          </td>`;
        case 'createdDate':
          return `<td class="py-2.5 px-3.5 whitespace-nowrap text-slate-500 text-xs">${tx.createdDate}</td>`;
        case 'updatedDate':
          return `<td class="py-2.5 px-3.5 whitespace-nowrap text-slate-500 text-xs">${tx.updatedDate}</td>`;
        case 'channel':
          return `<td class="py-2.5 px-3.5 whitespace-nowrap text-slate-800 font-semibold text-xs">${tx.channel}</td>`;
        case 'subType':
          return `<td class="py-2.5 px-3.5 whitespace-nowrap text-slate-600 text-xs">${tx.subType}</td>`;
        case 'amount':
          const isPos = tx.amount >= 0;
          return `<td class="py-2.5 px-3.5 whitespace-nowrap text-right font-black text-xs ${isPos ? 'text-emerald-600' : 'text-rose-600'}">
            ${isPos ? '+' : ''}${formatMoney(tx.amount)} đ
          </td>`;
        case 'listedPrice':
          return `<td class="py-2.5 px-3.5 whitespace-nowrap text-right text-slate-600 text-xs">${formatMoney(tx.listedPrice)} đ</td>`;
        case 'discountAmount':
          return `<td class="py-2.5 px-3.5 whitespace-nowrap text-right text-amber-600 text-xs font-semibold">-${formatMoney(tx.discountAmount)} đ</td>`;
        case 'commissionAmount':
          return `<td class="py-2.5 px-3.5 whitespace-nowrap text-right text-indigo-600 text-xs font-semibold">-${formatMoney(tx.commissionAmount)} đ</td>`;
        case 'costAmount':
          return `<td class="py-2.5 px-3.5 whitespace-nowrap text-right text-slate-600 text-xs">${formatMoney(tx.costAmount)} đ</td>`;
        case 'netProfit':
          const pPos = tx.netProfit >= 0;
          return `<td class="py-2.5 px-3.5 whitespace-nowrap text-right text-xs font-bold ${pPos ? 'text-emerald-600' : 'text-rose-600'}">
            ${formatMoney(tx.netProfit)} đ
          </td>`;
        default:
          return `<td class="py-2.5 px-3.5 text-xs">-</td>`;
      }
    }

    function changeCashFlowPage(p) {
      cashFlowCurrentPage = p;
      renderCashFlowTable();
    }

    // =========================================================================
    // MODAL XEM CHI TIẾT (ICON CON MẮT 👁) & CẬP NHẬT TRẠNG THÁI HÓA ĐƠN
    // =========================================================================
    function openCashFlowDetailModal(orderCode) {
      const modal = document.getElementById('modalCashFlowDetail');
      if (!modal) return;

      currentCashFlowDetailOrderCode = orderCode;
      let order = cashFlowOrdersMap[orderCode];
      if (!order) {
        // Fallback tạo từ dataset
        const tx = cashFlowMasterDataset.find(t => t.orderCode === orderCode);
        if (tx) {
          order = {
            orderCode: tx.orderCode,
            source: tx.channel || 'Website Booking',
            orderType: tx.type || 'Gói vé dịch vụ',
            customerName: tx.beneficiaryName,
            customerEmail: 'khachhang@techera.vn',
            customerPhone: '0912 345 678',
            channel: tx.channel,
            subType: tx.subType,
            expectedRevenue: 0,
            expectedCost: 0,
            actualRevenue: Math.abs(tx.amount),
            actualCost: Math.round(Math.abs(tx.amount) * 0.85),
            createdDate: tx.createdDate,
            updatedDate: tx.updatedDate,
            orderStatus: tx.status === 'Thành công' ? 'Đã xuất vé' : tx.status,
            invoiceStatus: tx.invoiceStatus || 'Chưa xuất',
            invoiceCode: tx.invoiceCode || '',
            invoiceDate: tx.invoiceDate || '',
            listedPrice: tx.listedPrice,
            discountAmount: tx.discountAmount,
            commissionAmount: tx.commissionAmount,
            costAmount: tx.costAmount,
            netProfit: tx.netProfit,
            paymentMethod: tx.paymentMethod,
            agencyCode: tx.agencyCode
          };
          cashFlowOrdersMap[orderCode] = order;
        } else {
          return;
        }
      }

      // Điền 13 trường dữ liệu
      const setTxt = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.innerText = val || '-';
      };

      setTxt('cfDetailOrderCodeBadge', order.orderCode);
      setTxt('cfDetailSource', order.source || order.channel);
      setTxt('cfDetailType', order.orderType);
      setTxt('cfDetailOrderCode', order.orderCode);
      setTxt('cfDetailCustName', order.customerName);
      setTxt('cfDetailCustEmail', order.customerEmail);
      setTxt('cfDetailCustPhone', order.customerPhone);
      setTxt('cfDetailExpectedIncome', `${formatMoney(order.expectedRevenue)} đ`);
      setTxt('cfDetailExpectedExpense', `${formatMoney(order.expectedCost)} đ`);
      setTxt('cfDetailActualIncome', `${formatMoney(order.actualRevenue)} đ`);
      setTxt('cfDetailActualExpense', `${formatMoney(order.actualCost)} đ`);
      setTxt('cfDetailCreatedDate', order.createdDate);
      setTxt('cfDetailStatus', order.orderStatus);
      setTxt('cfDetailUpdatedDate', order.updatedDate);

      // Trạng thái hóa đơn
      if (typeof TecheraDB !== 'undefined' && TecheraDB.saveInvoiceOverride) {
        TecheraDB.saveInvoiceOverride(currentCashFlowDetailOrderCode, {
          invoiceStatus: order.invoiceStatus,
          invoiceCode: order.invoiceCode,
          invoiceDate: order.invoiceDate,
          updatedDate: order.updatedDate
        });
      }
      syncCashFlowDetailInvoiceSection(order);

      // Render danh sách các khoản Thu/Chi đối soát của đơn hàng này
      const relatedTxs = cashFlowMasterDataset.filter(t => t.orderCode === orderCode);
      const countEl = document.getElementById('cfDetailTxCount');
      if (countEl) countEl.innerText = `${relatedTxs.length} khoản phát sinh`;

      const tbody = document.getElementById('cfDetailTxTableBody');
      if (tbody) {
        tbody.innerHTML = relatedTxs.map(t => `
          <tr class="hover:bg-slate-50/70">
            <td class="py-2 px-3 font-mono text-[11px] font-bold text-slate-800">${t.txCode}</td>
            <td class="py-2 px-3">
              <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${t.group === 'Thu' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}">${t.group}</span>
            </td>
            <td class="py-2 px-3 font-semibold text-slate-700">${t.type}</td>
            <td class="py-2 px-3 text-slate-600">${t.beneficiaryName}</td>
            <td class="py-2 px-3 text-right font-bold ${t.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'}">${t.amount >= 0 ? '+' : ''}${formatMoney(t.amount)} đ</td>
            <td class="py-2 px-3 text-slate-500">${t.paymentMethod}</td>
            <td class="py-2 px-3 text-center">
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${t.status === 'Thành công' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}">${t.status}</span>
            </td>
          </tr>
        `).join('');
      }

      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function syncCashFlowDetailInvoiceSection(order) {
      const badge = document.getElementById('cfDetailInvoiceStatusBadge');
      const numDisplay = document.getElementById('cfDetailInvoiceNumberDisplay');
      const dateDisplay = document.getElementById('cfDetailInvoiceDateDisplay');

      const isIssued = (order.invoiceStatus === 'Đã xuất');
      if (badge) {
        badge.innerText = order.invoiceStatus;
        badge.className = `inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-extrabold ${isIssued ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'}`;
      }
      if (numDisplay) {
        numDisplay.innerText = order.invoiceCode ? `Số HĐ: ${order.invoiceCode}` : 'Chưa có số HĐ';
      }
      if (dateDisplay) {
        dateDisplay.innerText = order.invoiceDate ? `(Ngày: ${order.invoiceDate})` : '';
      }

      // Pre-fill inputs
      const codeInput = document.getElementById('cfInputInvoiceCode');
      const dateInput = document.getElementById('cfInputInvoiceDate');
      const statusSelect = document.getElementById('cfSelectInvoiceStatus');

      if (codeInput) codeInput.value = order.invoiceCode || '';
      if (dateInput) dateInput.value = order.invoiceDate || '2026-11-10';
      if (statusSelect) statusSelect.value = order.invoiceStatus || 'Đã xuất';

      toggleInvoiceEditForm(false);
    }

    function closeCashFlowDetailModal() {
      const modal = document.getElementById('modalCashFlowDetail');
      if (modal) {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
      }
      currentCashFlowDetailOrderCode = null;
    }

    function toggleInvoiceEditForm(forceShow = null) {
      const wrap = document.getElementById('cfInvoiceEditFormWrap');
      const notice = document.getElementById('cfInvoiceUpdateNotice');
      if (!wrap) return;

      if (notice) notice.classList.add('hidden');
      if (forceShow === null) {
        wrap.classList.toggle('hidden');
      } else if (forceShow) {
        wrap.classList.remove('hidden');
      } else {
        wrap.classList.add('hidden');
      }
    }

    function submitCashFlowInvoiceUpdate() {
      if (!currentCashFlowDetailOrderCode) return;
      const order = cashFlowOrdersMap[currentCashFlowDetailOrderCode];
      if (!order) return;

      const codeInput = document.getElementById('cfInputInvoiceCode');
      const dateInput = document.getElementById('cfInputInvoiceDate');
      const statusSelect = document.getElementById('cfSelectInvoiceStatus');
      const notice = document.getElementById('cfInvoiceUpdateNotice');

      let newStatus = statusSelect ? statusSelect.value : 'Đã xuất';
      let newDate = dateInput ? dateInput.value : '2026-11-10';
      let newCode = codeInput ? codeInput.value.trim() : '';

      if (newStatus === 'Đã xuất' && !newCode) {
        newCode = `HD-2611-${Math.floor(1000 + Math.random() * 9000)}`;
        if (codeInput) codeInput.value = newCode;
      }

      order.invoiceStatus = newStatus;
      order.invoiceCode = newStatus === 'Đã xuất' ? newCode : '';
      order.invoiceDate = newStatus === 'Đã xuất' ? newDate : '';
      order.updatedDate = `${newDate} ${new Date().toTimeString().slice(0, 5)}`;

      // Cập nhật các giao dịch liên quan
      cashFlowMasterDataset.forEach(tx => {
        if (tx.orderCode === currentCashFlowDetailOrderCode) {
          tx.invoiceStatus = order.invoiceStatus;
          tx.invoiceCode = order.invoiceCode;
          tx.invoiceDate = order.invoiceDate;
          tx.updatedDate = order.updatedDate;
        }
      });

      syncCashFlowDetailInvoiceSection(order);
      if (notice) notice.classList.remove('hidden');

      // Tự động đồng bộ các card KPI và danh sách hóa đơn
      updateCashFlowKpis();
      renderCashFlowTable();
    }

    // =========================================================================
    // MODAL DANH SÁCH HÓA ĐƠN VAT (TRIGGER TỪ CARD HÓA ĐƠN)
    // =========================================================================
    function openInvoiceListModal() {
      const modal = document.getElementById('modalInvoiceList');
      if (!modal) return;

      currentInvoiceListTab = 'ALL';
      const searchInput = document.getElementById('invoiceSearchInput');
      if (searchInput) searchInput.value = '';

      switchInvoiceTab('ALL');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function closeInvoiceListModal() {
      const modal = document.getElementById('modalInvoiceList');
      if (modal) {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
      }
    }

    function switchInvoiceTab(tab) {
      currentInvoiceListTab = tab;
      ['tabInvoiceAll', 'tabInvoiceIssued', 'tabInvoicePending'].forEach(tId => {
        const el = document.getElementById(tId);
        if (el) {
          el.className = 'px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-slate-600 hover:text-slate-900 cursor-pointer';
        }
      });

      const activeEl = document.getElementById(
        tab === 'ALL' ? 'tabInvoiceAll' : (tab === 'ISSUED' ? 'tabInvoiceIssued' : 'tabInvoicePending')
      );
      if (activeEl) {
        activeEl.className = 'px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-white text-slate-900 shadow-2xs cursor-pointer';
      }

      renderInvoiceListTable();
    }

    function renderInvoiceListTable() {
      const tbody = document.getElementById('invoiceListTableBody');
      const searchInput = document.getElementById('invoiceSearchInput');
      const summaryEl = document.getElementById('invoiceListFooterSummary');
      if (!tbody) return;

      const q = searchInput ? searchInput.value.toLowerCase().trim() : '';
      const allOrders = Object.values(cashFlowOrdersMap);

      const issuedTotal = allOrders.filter(o => o.invoiceStatus === 'Đã xuất').length;
      const pendingTotal = allOrders.filter(o => o.invoiceStatus !== 'Đã xuất').length;

      const countAll = document.getElementById('invoiceCountAll');
      const countIssued = document.getElementById('invoiceCountIssued');
      const countPending = document.getElementById('invoiceCountPending');
      if (countAll) countAll.innerText = allOrders.length;
      if (countIssued) countIssued.innerText = issuedTotal;
      if (countPending) countPending.innerText = pendingTotal;

      const filtered = allOrders.filter(o => {
        if (currentInvoiceListTab === 'ISSUED' && o.invoiceStatus !== 'Đã xuất') return false;
        if (currentInvoiceListTab === 'PENDING' && o.invoiceStatus === 'Đã xuất') return false;
        if (q) {
          const hay = `${o.orderCode} ${o.invoiceCode} ${o.customerName} ${o.customerPhone}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      });

      if (summaryEl) {
        summaryEl.innerText = `Hiển thị ${filtered.length} / ${allOrders.length} hóa đơn đơn hàng`;
      }

      if (filtered.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="8" class="py-8 text-center text-slate-400 font-semibold">
              Không tìm thấy hóa đơn phù hợp.
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = filtered.map(o => {
        const isIssued = o.invoiceStatus === 'Đã xuất';
        return `
          <tr class="hover:bg-slate-50 transition-colors">
            <td class="py-2.5 px-3 font-extrabold text-brand-600 font-mono">${o.orderCode}</td>
            <td class="py-2.5 px-3 font-mono font-bold ${isIssued ? 'text-slate-900' : 'text-slate-400 italic'}">
              ${o.invoiceCode || 'Chưa gán số HĐ'}
            </td>
            <td class="py-2.5 px-3 font-semibold text-slate-800">${o.customerName}</td>
            <td class="py-2.5 px-3 text-slate-500">${(o.createdDate || '').slice(0, 10)}</td>
            <td class="py-2.5 px-3 text-slate-500">${(o.updatedDate || '').slice(0, 10)}</td>
            <td class="py-2.5 px-3 text-right font-black text-slate-900">${formatMoney(o.actualRevenue || o.expectedRevenue)} đ</td>
            <td class="py-2.5 px-3 text-center">
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black border ${isIssued ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}">
                ${o.invoiceStatus}
              </span>
            </td>
            <td class="py-2.5 px-3 text-center">
              <button type="button" onclick="quickEditInvoiceFromList('${o.orderCode}')" class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-brand-50 hover:text-brand-600 text-slate-700 font-bold text-xs transition-colors cursor-pointer">
                Cập nhật
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }

    function quickEditInvoiceFromList(orderCode) {
      closeInvoiceListModal();
      openCashFlowDetailModal(orderCode);
      toggleInvoiceEditForm(true);
    }

    // =========================================================================
    // MODAL TÙY CHỈNH 17 CỘT DỮ LIỆU
    // =========================================================================
    function openColumnCustomizerModal() {
      const modal = document.getElementById('modalCashFlowColumns');
      const defaultWrap = document.getElementById('cfColsDefaultList');
      const customWrap = document.getElementById('cfColsCustomList');
      if (!modal) return;

      const defaultCols = CASH_FLOW_COLUMNS_CONFIG.slice(0, 9);
      const customCols = CASH_FLOW_COLUMNS_CONFIG.slice(9);

      if (defaultWrap) {
        defaultWrap.innerHTML = defaultCols.map(c => `
          <label class="flex items-center gap-2 p-2 rounded-xl border border-slate-200/80 hover:bg-slate-50 transition-colors cursor-pointer select-none">
            <input type="checkbox" id="chkCol_${c.id}" ${cashFlowVisibleColumns[c.id] ? 'checked' : ''} class="w-4 h-4 rounded text-brand-600 border-slate-300 focus:ring-brand-500 cursor-pointer">
            <span class="text-xs font-bold text-slate-700">${c.label}</span>
          </label>
        `).join('');
      }

      if (customWrap) {
        customWrap.innerHTML = customCols.map(c => `
          <label class="flex items-center gap-2 p-2 rounded-xl border border-slate-200/80 hover:bg-slate-50 transition-colors cursor-pointer select-none">
            <input type="checkbox" id="chkCol_${c.id}" ${cashFlowVisibleColumns[c.id] ? 'checked' : ''} class="w-4 h-4 rounded text-brand-600 border-slate-300 focus:ring-brand-500 cursor-pointer">
            <span class="text-xs font-semibold text-slate-700">${c.label}</span>
          </label>
        `).join('');
      }

      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function closeColumnCustomizerModal() {
      const modal = document.getElementById('modalCashFlowColumns');
      if (modal) {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
      }
    }

    function selectAllCashFlowColumns(selectAll = true) {
      CASH_FLOW_COLUMNS_CONFIG.forEach(c => {
        const chk = document.getElementById(`chkCol_${c.id}`);
        if (chk) chk.checked = selectAll;
      });
    }

    function resetCashFlowColumnsToDefault() {
      CASH_FLOW_COLUMNS_CONFIG.forEach(c => {
        const chk = document.getElementById(`chkCol_${c.id}`);
        if (chk) chk.checked = c.defaultVisible;
      });
    }

    function saveColumnCustomizerSelection() {
      CASH_FLOW_COLUMNS_CONFIG.forEach(c => {
        const chk = document.getElementById(`chkCol_${c.id}`);
        if (chk) {
          cashFlowVisibleColumns[c.id] = chk.checked;
        }
      });
      syncCashFlowVisibleColumnCount();
      renderCashFlowTable();
      closeColumnCustomizerModal();
    }

    // =========================================================================
    // XUẤT FILE DỮ LIỆU DÒNG TIỀN (EXCEL / CSV)
    // =========================================================================
    function exportCashFlowDataCsv() {
      if (!cashFlowFilteredDataset || cashFlowFilteredDataset.length === 0) {
        alert("Không có dữ liệu giao dịch để xuất!");
        return;
      }

      const activeCols = CASH_FLOW_COLUMNS_CONFIG.filter(c => cashFlowVisibleColumns[c.id]);
      const headerRow = activeCols.map(c => `"${c.label}"`).join(',');

      const dataRows = cashFlowFilteredDataset.map(tx => {
        return activeCols.map(c => {
          let val = tx[c.id];
          if (c.id === 'beneficiary') val = `${tx.beneficiaryName} (${tx.agencyCode})`;
          if (typeof val === 'number') return val;
          return `"${String(val || '').replace(/"/g, '""')}"`;
        }).join(',');
      });

      const csvContent = '﻿' + [headerRow, ...dataRows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Lich_su_dong_tien_Techera_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }


// Tự động khởi tạo giao diện theo trang cashflow
window.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("viewCashFlowHistory") || document.getElementById("cfTableBody")) {
    initCashFlowEngine();
  }
});

// Xuất các hàm ra phạm vi toàn cục cho inline event handlers trong cashflow.html
window.openColumnCustomizerModal = openColumnCustomizerModal;
window.closeColumnCustomizerModal = closeColumnCustomizerModal;
window.exportCashFlowDataCsv = exportCashFlowDataCsv;
window.openInvoiceListModal = openInvoiceListModal;
window.closeInvoiceListModal = closeInvoiceListModal;
window.applyCashFlowFilters = applyCashFlowFilters;
window.onCashFlowGroupFilterChange = onCashFlowGroupFilterChange;
window.onCashFlowChannelFilterChange = onCashFlowChannelFilterChange;
window.onCashFlowPeriodChange = onCashFlowPeriodChange;
window.resetCashFlowFilters = resetCashFlowFilters;
window.closeCashFlowDetailModal = closeCashFlowDetailModal;
window.toggleInvoiceEditForm = toggleInvoiceEditForm;
window.submitCashFlowInvoiceUpdate = submitCashFlowInvoiceUpdate;
window.switchInvoiceTab = switchInvoiceTab;
window.renderInvoiceListTable = renderInvoiceListTable;
window.selectAllCashFlowColumns = selectAllCashFlowColumns;
window.resetCashFlowColumnsToDefault = resetCashFlowColumnsToDefault;
window.saveColumnCustomizerSelection = saveColumnCustomizerSelection;
window.changeCashFlowPage = changeCashFlowPage;
window.openCashFlowDetailModal = openCashFlowDetailModal;
window.quickEditInvoiceFromList = quickEditInvoiceFromList;
