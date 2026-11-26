// ============================================================================
// DATABASE STORE ENGINE (TecheraDB - Persistent localStorage + Seed Fallback)
// ============================================================================

(function (global) {
  const STORAGE_KEYS = {
    CUSTOMERS: 'techera_db_customers_v1',
    ORDERS: 'techera_db_orders_v1',
    CART: 'techera_db_cart_v1',
    CART_INIT_DONE: 'techera_db_cart_seeded_v1',
    WALLET: 'techera_db_wallet_v1',
    NOTIFICATIONS: 'techera_db_notifications_v1',
    BOOKING_CONTEXT: 'techera_db_booking_ctx_v1',
    CHECKOUT_SESSION: 'techera_db_checkout_session_v1',
    INVOICE_OVERRIDES: 'techera_db_invoice_overrides_v1',
    SIDEBAR_EXPANDED: 'techera_ui_sidebar_expanded_v1'
  };

  function safeRead(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null || raw === undefined) return fallback;
      return JSON.parse(raw);
    } catch (_) {
      return fallback;
    }
  }

  function safeWrite(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
      return true;
    } catch (_) {
      return false;
    }
  }

  function computeDayName(day, month, year) {
    const names = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    return names[new Date(year, month - 1, day).getDay()];
  }

  function buildDefaultCartSeed() {
    const vinDest = (typeof destinationsDatabase !== 'undefined')
      ? destinationsDatabase.find(d => d.id === 'vinwonders-nhatrang')
      : null;
    const sunDest = (typeof destinationsDatabase !== 'undefined')
      ? destinationsDatabase.find(d => d.id === 'sunworld-bana')
      : null;

    const dateVin = { day: 21, month: 11, year: 2026, dayName: computeDayName(21, 11, 2026) };
    const dateSun = { day: 22, month: 11, year: 2026, dayName: computeDayName(22, 11, 2026) };

    return [
      {
        cartItemId: 'cart-demo-vin-1',
        destId: 'vinwonders-nhatrang',
        destName: vinDest ? vinDest.name : 'VinWonders Nha Trang',
        destImage: vinDest ? vinDest.imageUrl : 'assets/images/destinations/vinwonders-nhatrang.jpg',
        supplierId: 'partner',
        supplierName: 'Vingroup API trực tiếp',
        pkgId: 22,
        pkgTitle: 'VINWONDERS TIÊU CHUẨN SAU 16:00 & BUFFET',
        serviceGroupLabel: 'Vé cáp treo + Buffet',
        marketLabel: 'Ngoại tỉnh',
        category: 'combo',
        hasDiningConfig: true,
        selectedRestaurantId: 'coral',
        selectedTimeSlotId: 'coral-s1',
        diningText: 'Nhà hàng Coral • 11:00 - 12:30',
        tierKey: 'adult',
        tierLabel: 'Người lớn',
        tierCondition: '140cm trở lên',
        usageDate: dateVin,
        baseWeekdayListed: 1065000,
        baseWeekdayNet: 833000,
        baseWeekdaySelling: 926000,
        listedPrice: 1150000,
        netPrice: 900000,
        sellingPrice: 1000000,
        qty: 2,
        stockLimit: 15,
        checked: true
      },
      {
        cartItemId: 'cart-demo-sun-1',
        destId: 'sunworld-bana',
        destName: sunDest ? sunDest.name : 'Sun World Ba Na Hills',
        destImage: sunDest ? sunDest.imageUrl : 'assets/images/destinations/sunworld-bana.jpg',
        supplierId: 'partner',
        supplierName: 'Tập đoàn Sun World',
        pkgId: 11,
        pkgTitle: 'VÉ CÁP TREO SUN WORLD BÀ NÀ HILLS & BUFFET',
        serviceGroupLabel: 'Vé cáp treo + Buffet',
        marketLabel: 'Địa phương',
        category: 'combo',
        hasDiningConfig: true,
        selectedRestaurantId: 'arapang',
        selectedTimeSlotId: 'arapang-s1',
        diningText: 'Nhà hàng Arapang • 11:00 - 12:30',
        tierKey: 'adult',
        tierLabel: 'Người lớn',
        tierCondition: '140cm trở lên',
        usageDate: dateSun,
        baseWeekdayListed: 1157000,
        baseWeekdayNet: 907000,
        baseWeekdaySelling: 1032000,
        listedPrice: 1250000,
        netPrice: 980000,
        sellingPrice: 1115000,
        qty: 2,
        stockLimit: 18,
        checked: true
      }
    ];
  }

  function buildDefaultWalletSeed() {
    return {
      balance: 1000000,
      debtUsed: 2096500,
      debtLimit: 50000000,
      allowNegativeBalance: false,
      topupHistory: [
        {
          id: 'TOPUP-88210',
          method: 'VietQR 24/7',
          amount: 10000000,
          timeLabel: '09:15 • Hôm nay',
          note: 'Nạp tiền qua VietQR 24/7'
        }
      ]
    };
  }

  function buildDefaultNotificationsSeed() {
    return [
      {
        id: 'notif-init-1',
        title: 'Chào mừng đến Techera B2B Portal',
        desc: 'Số dư ví hiện tại: 1.000.000 đ • Hạn mức công nợ: 50.000.000 đ.',
        time: 'Vừa xong',
        read: false,
        type: 'info'
      }
    ];
  }

  const TecheraDB = {
    // 1. PRODUCTS & DESTINATIONS
    getDestinations() {
      return typeof destinationsDatabase !== 'undefined' ? destinationsDatabase : [];
    },
    getDestinationById(destId) {
      return this.getDestinations().find(d => d.id === destId) || this.getDestinations()[0] || null;
    },
    getVenuePackagesMap(destId) {
      if (typeof venuePackagesDatabase === 'undefined') return {};
      return venuePackagesDatabase[destId] || venuePackagesDatabase['sunworld-bana'] || {};
    },

    // 2. CRM CUSTOMERS
    getCustomers() {
      let stored = safeRead(STORAGE_KEYS.CUSTOMERS, null);
      if (!Array.isArray(stored) || stored.length === 0) {
        stored = (typeof CRM_CUSTOMERS_SEED !== 'undefined') ? [...CRM_CUSTOMERS_SEED] : [];
        safeWrite(STORAGE_KEYS.CUSTOMERS, stored);
      }
      return stored;
    },
    saveCustomers(list) {
      safeWrite(STORAGE_KEYS.CUSTOMERS, list);
    },
    addCustomer(customerData) {
      const list = this.getCustomers();
      const name = (customerData.name || customerData.fullName || '').trim();
      const phone = (customerData.phone || customerData.phoneNumber || '').trim();
      const email = (customerData.email || '').trim().toLowerCase();
      if (!name || (!phone && !email)) return { added: false, customer: null };

      const normPhone = phone.replace(/\s+/g, '');
      const existing = list.find(c => {
        const cPhone = (c.phone || '').replace(/\s+/g, '');
        const cEmail = (c.email || '').trim().toLowerCase();
        return (normPhone && cPhone === normPhone) || (email && cEmail === email);
      });
      if (existing) return { added: false, customer: existing };

      const newCust = {
        id: `CUS-${String(list.length + 1).padStart(3, '0')}`,
        name,
        phone: phone || normPhone,
        email,
        source: customerData.source || 'Zalo',
        tier: customerData.tier || 'Mới',
        city: customerData.city || 'TP.HCM',
        note: customerData.note || ''
      };
      list.unshift(newCust);
      this.saveCustomers(list);
      return { added: true, customer: newCust };
    },
    getCustomersAggregated() {
      const customers = this.getCustomers();
      const orders = this.getOrders();
      const map = {};
      customers.forEach(c => {
        map[c.id] = { ...c, orderCount: 0, totalSpent: 0, totalTickets: 0, lastOrderDate: '' };
      });
      orders.forEach(o => {
        if (o.status === 'Đã hủy' || o.status === 'Hoàn tiền') return;
        const target = map[o.customerId] || Object.values(map).find(c =>
          c.name === o.customerName ||
          (o.customerPhone && c.phone && c.phone.replace(/\s+/g, '') === o.customerPhone.replace(/\s+/g, ''))
        );
        if (target) {
          target.orderCount += 1;
          target.totalSpent += (Number(o.revenue) || 0);
          target.totalTickets += (Number(o.tickets) || 0);
          if (!target.lastOrderDate || o.createdDate > target.lastOrderDate) {
            target.lastOrderDate = o.createdDate;
          }
        }
      });
      return Object.values(map);
    },

    // 3. ORDERS
    getOrders() {
      let stored = safeRead(STORAGE_KEYS.ORDERS, null);
      if (!Array.isArray(stored) || stored.length === 0) {
        const custs = this.getCustomers();
        stored = (typeof generateMockOrdersDataset === 'function')
          ? generateMockOrdersDataset(custs)
          : [];
        safeWrite(STORAGE_KEYS.ORDERS, stored);
      }
      return stored;
    },
    saveOrders(list) {
      safeWrite(STORAGE_KEYS.ORDERS, list);
    },
    addOrder(newOrder) {
      const orders = this.getOrders();
      orders.unshift(newOrder);
      this.saveOrders(orders);
      return newOrder;
    },
    updateOrderStatus(orderCode, newStatus) {
      const orders = this.getOrders();
      const idx = orders.findIndex(o => o.orderCode === orderCode);
      if (idx === -1) return null;
      orders[idx].status = newStatus;
      this.saveOrders(orders);
      return orders[idx];
    },

    // 4. CART
    getCart() {
      const seeded = localStorage.getItem(STORAGE_KEYS.CART_INIT_DONE);
      if (!seeded) {
        const demo = buildDefaultCartSeed();
        safeWrite(STORAGE_KEYS.CART, demo);
        localStorage.setItem(STORAGE_KEYS.CART_INIT_DONE, '1');
        return demo;
      }
      const stored = safeRead(STORAGE_KEYS.CART, []);
      return Array.isArray(stored) ? stored : [];
    },
    saveCart(items) {
      localStorage.setItem(STORAGE_KEYS.CART_INIT_DONE, '1');
      safeWrite(STORAGE_KEYS.CART, Array.isArray(items) ? items : []);
    },
    getCartTotalQty() {
      return this.getCart().reduce((sum, i) => sum + (Number(i.qty) || 0), 0);
    },

    // 5. WALLET
    getWallet() {
      const stored = safeRead(STORAGE_KEYS.WALLET, null);
      if (!stored || typeof stored.balance !== 'number') {
        const seed = buildDefaultWalletSeed();
        safeWrite(STORAGE_KEYS.WALLET, seed);
        return seed;
      }
      return stored;
    },
    saveWallet(walletObj) {
      safeWrite(STORAGE_KEYS.WALLET, walletObj);
    },
    adjustWalletBalance(delta, meta = {}) {
      const w = this.getWallet();
      w.balance = Number(w.balance || 0) + Number(delta || 0);
      if (delta > 0 && meta.isTopup) {
        w.topupHistory = w.topupHistory || [];
        w.topupHistory.unshift({
          id: 'TOPUP-' + Math.floor(10000 + Math.random() * 90000),
          method: meta.method || 'VietQR 24/7',
          amount: delta,
          timeLabel: 'Vừa xong • Hôm nay',
          note: `Nạp tiền qua ${meta.method || 'VietQR 24/7'}`
        });
      }
      this.saveWallet(w);
      return w;
    },

    // 6. NOTIFICATIONS
    getNotifications() {
      const stored = safeRead(STORAGE_KEYS.NOTIFICATIONS, null);
      if (!Array.isArray(stored)) {
        const seed = buildDefaultNotificationsSeed();
        safeWrite(STORAGE_KEYS.NOTIFICATIONS, seed);
        return seed;
      }
      return stored;
    },
    saveNotifications(list) {
      safeWrite(STORAGE_KEYS.NOTIFICATIONS, list);
    },
    pushNotification(notif) {
      const list = this.getNotifications();
      list.unshift({
        id: 'notif-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        title: notif.title || 'Thông báo hệ thống',
        desc: notif.desc || '',
        time: notif.time || 'Vừa xong',
        read: false,
        type: notif.type || 'info'
      });
      this.saveNotifications(list.slice(0, 40));
      return list;
    },

    // 7. BOOKING CONTEXT & CHECKOUT SESSION
    getBookingContext() {
      return safeRead(STORAGE_KEYS.BOOKING_CONTEXT, {
        destId: 'sunworld-bana',
        supplierId: 'partner',
        hasConfirmedDate: false,
        selectedDate: null,
        quickPax: { adult: 2, child: 0, senior: 0 },
        selectedOrderTickets: {},
        discountRate: 0
      });
    },
    saveBookingContext(ctx) {
      safeWrite(STORAGE_KEYS.BOOKING_CONTEXT, ctx);
    },
    getCheckoutSession() {
      return safeRead(STORAGE_KEYS.CHECKOUT_SESSION, null);
    },
    saveCheckoutSession(session) {
      safeWrite(STORAGE_KEYS.CHECKOUT_SESSION, session);
    },

    // 8. CASH FLOW & INVOICE OVERRIDES
    getInvoiceOverrides() {
      return safeRead(STORAGE_KEYS.INVOICE_OVERRIDES, {});
    },
    saveInvoiceOverride(orderCode, patch) {
      const map = this.getInvoiceOverrides();
      map[orderCode] = { ...(map[orderCode] || {}), ...patch };
      safeWrite(STORAGE_KEYS.INVOICE_OVERRIDES, map);
      return map;
    },
    getCashFlowData() {
      if (typeof buildCashFlowRecordsFromOrders !== 'function') {
        return { dataset: [], ordersMap: {} };
      }
      return buildCashFlowRecordsFromOrders(this.getOrders(), this.getInvoiceOverrides());
    },

    // 9. QR ORDER SNAPSHOTS
    saveQrOrder(orderCode, snapshot) {
      safeWrite('techera_qr_order_' + orderCode, snapshot);
      try { localStorage.setItem('techera_latest_qr_order', orderCode); } catch (_) {}
    },
    getQrOrder(orderCode) {
      return safeRead('techera_qr_order_' + orderCode, null);
    },

    // 10. UI PREFERENCES
    isSidebarExpanded() {
      const val = safeRead(STORAGE_KEYS.SIDEBAR_EXPANDED, true);
      return val !== false;
    },
    setSidebarExpanded(val) {
      safeWrite(STORAGE_KEYS.SIDEBAR_EXPANDED, !!val);
    },

    // 11. RESET ALL DEMO DATA
    resetAll() {
      Object.values(STORAGE_KEYS).forEach(k => {
        try { localStorage.removeItem(k); } catch (_) {}
      });
    }
  };

  global.TecheraDB = TecheraDB;
})(window);
