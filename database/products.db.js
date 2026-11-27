// ============================================================================
// DATABASE: PRODUCTS, DESTINATIONS, PACKAGES, SUPPLIERS & VOUCHERS
// ============================================================================

const destinationsDatabase = [
  {
    id: "sunworld-bana",
    name: "Sun World Ba Na Hills",
    chain: "SUNWORLD",
    chainLabel: "SUNWORLD",
    region: "Đà Nẵng",
    address: "Thôn An Sơn, Hòa Ninh, Hòa Vang, TP Đà Nẵng",
    fromPrice: 650000,
    hasDiscount: true,
    rating: 4.9,
    imageUrl: "assets/images/destinations/sunworld-bana.jpg",
    popularIndex: 99
  },
  {
    id: "sunworld-fansipan",
    name: "Sun World Fansipan Legend",
    chain: "SUNWORLD",
    chainLabel: "SUNWORLD",
    region: "Hà Nam",
    address: "Đường Nguyễn Chí Thanh, Thị xã Sa Pa, Lào Cai",
    fromPrice: 750000,
    hasDiscount: true,
    rating: 4.8,
    imageUrl: "assets/images/destinations/sunworld-fansipan.jpg",
    popularIndex: 95
  },
  {
    id: "vinwonders-phuquoc",
    name: "VinWonders Phú Quốc",
    chain: "VINWONDERS",
    chainLabel: "VINWONDERS",
    region: "Kiên Giang",
    address: "Khu Bãi Dài, Gành Dầu, TP Phú Quốc, Kiên Giang",
    fromPrice: 950000,
    hasDiscount: true,
    rating: 4.9,
    imageUrl: "assets/images/destinations/vinwonders-phuquoc.jpg",
    popularIndex: 98
  },
  {
    id: "vinwonders-nhatrang",
    name: "VinWonders Nha Trang",
    chain: "VINWONDERS",
    chainLabel: "VINWONDERS",
    region: "Cam Ranh - Khánh Hòa",
    address: "Đảo Hòn Tre, Vĩnh Nguyên, TP Nha Trang, Khánh Hòa",
    fromPrice: 880000,
    hasDiscount: true,
    rating: 4.8,
    imageUrl: "assets/images/destinations/vinwonders-nhatrang.jpg",
    popularIndex: 96
  },
  {
    id: "sunworld-halong",
    name: "Sun World Ha Long Complex",
    chain: "SUNWORLD",
    chainLabel: "SUNWORLD",
    region: "Hạ Long",
    address: "Đường Hạ Long, Phường Bãi Cháy, TP Hạ Long, Quảng Ninh",
    fromPrice: 350000,
    hasDiscount: true,
    rating: 4.7,
    imageUrl: "assets/images/destinations/sunworld-halong.jpg",
    popularIndex: 92
  },
  {
    id: "novaworld-phanthiet",
    name: "NovaDreams – Wonderland Water Park (Novaland)",
    chain: "NOVADREAMS",
    chainLabel: "NOVADREAMS / NOVALAND",
    region: "Bình Thuận",
    address: "Lạc Long Quân, Tiến Thành, TP Phan Thiết, Bình Thuận",
    fromPrice: 250000,
    hasDiscount: true,
    rating: 4.7,
    imageUrl: "assets/images/destinations/novaworld-phanthiet.jpg",
    popularIndex: 90
  },
  {
    id: "vinwonders-namhoian",
    name: "VinWonders Nam Hội An",
    chain: "VINWONDERS",
    chainLabel: "VINWONDERS",
    region: "Hội An",
    address: "Đường Võ Chí Công, Bình Minh, Thăng Bình, Quảng Nam",
    fromPrice: 600000,
    hasDiscount: true,
    rating: 4.8,
    imageUrl: "assets/images/destinations/vinwonders-namhoian.jpg",
    popularIndex: 94
  },
  {
    id: "damsen-world",
    name: "Công viên Văn hóa Đầm Sen",
    chain: "DAMSEN_WORLD",
    chainLabel: "DAMSEN WORLD",
    region: "HCM",
    address: "Số 3 Hòa Bình, Phường 3, Quận 11, TP Hồ Chí Minh",
    fromPrice: 140000,
    hasDiscount: true,
    rating: 4.6,
    imageUrl: "assets/images/destinations/damsen-world.jpg",
    popularIndex: 88
  },
  {
    id: "suoitien-themepark",
    name: "Khu du lịch Văn hóa Suối Tiên",
    chain: "SUOITIEN",
    chainLabel: "SUỐI TIÊN",
    region: "HCM",
    address: "120 Xa lộ Hà Nội, Phường Tân Phú, TP Thủ Đức, TP HCM",
    fromPrice: 150000,
    hasDiscount: true,
    rating: 4.5,
    imageUrl: "assets/images/destinations/suoitien-themepark.jpg",
    popularIndex: 87
  },
  {
    id: "ttc-world",
    name: "Thung lũng Tình Yêu – TTC World",
    chain: "TTC",
    chainLabel: "TTC WORLD",
    region: "Lâm Đồng",
    address: "3-5-7 Đường Mai Anh Đào, Phường 8, TP Đà Lạt, Lâm Đồng",
    fromPrice: 250000,
    hasDiscount: true,
    rating: 4.6,
    imageUrl: "assets/images/destinations/ttc-world.jpg",
    popularIndex: 89
  },
  {
    id: "sunworld-honthom",
    name: "Sun World Hòn Thơm Nature Park",
    chain: "SUNWORLD",
    chainLabel: "SUNWORLD",
    region: "Kiên Giang",
    address: "Bãi Đất Đỏ, Phường An Thới, TP Phú Quốc, Kiên Giang",
    fromPrice: 600000,
    hasDiscount: true,
    rating: 4.9,
    imageUrl: "assets/images/destinations/sunworld-honthom.jpg",
    popularIndex: 97
  },
  {
    id: "offline-asia-park",
    name: "Asia Park – Da Nang Downtown",
    chain: "KHÁC (OFFLINE)",
    chainLabel: "TECHERA",
    region: "Đà Nẵng",
    address: "Số 1 Phan Đăng Lưu, Hòa Cường Bắc, Hải Châu, Đà Nẵng",
    fromPrice: 200000,
    hasDiscount: true,
    rating: 4.7,
    imageUrl: "assets/images/destinations/offline-asia-park.jpg",
    popularIndex: 91
  }
];

const filterChainsList = [
  { id: "DAMSEN_WORLD", name: "DAMSEN_WORLD" },
  { id: "NOVADREAMS", name: "NOVADREAMS" },
  { id: "SUNWORLD", name: "SUNWORLD" },
  { id: "SUOITIEN", name: "SUOITIEN" },
  { id: "TTC", name: "TTC" },
  { id: "VINWONDERS", name: "VINWONDERS" },
  { id: "KHÁC (OFFLINE)", name: "KHÁC (OFFLINE)" }
];

const filterRegionsList = [
  "Bình Thuận",
  "Hạ Long",
  "Cam Ranh – Khánh Hòa",
  "HCM",
  "Đà Nẵng",
  "Hà Nam",
  "Hội An",
  "Kiên Giang"
];

const VOUCHER_RULES = {
  'TECHERA50': { discount: 50000, minAmount: 0, label: 'TECHERA50 (-50.000 đ)' },
  'VIPB2B100': { discount: 100000, minAmount: 0, label: 'VIPB2B100 (-100.000 đ)' },
  'KDL150': { discount: 150000, minAmount: 2000000, label: 'KDL150 (-150.000 đ)' }
};

const VENUE_DINING_RESTAURANTS = {
  "sunworld-bana": {
    lunch: [
      { id: "four-seasons", name: "Nhà hàng Four Seasons" },
      { id: "beer-plaza", name: "Nhà hàng Beer Plaza" }
    ],
    dinner: [
      { id: "beer-plaza-night", name: "Nhà hàng Beer Plaza (Tối)" },
      { id: "arapang-night", name: "Nhà hàng Arapang Terrace" }
    ]
  },
  "sunworld-honthom": {
    lunch: [
      { id: "mango", name: "Nhà hàng Mango" },
      { id: "arena-beach", name: "Nhà hàng Arena Beach" }
    ]
  },
  "sunworld-fansipan": {
    lunch: [
      { id: "van-sam", name: "Nhà hàng Vân Sam" },
      { id: "do-quyen", name: "Nhà hàng Đỗ Quyên" }
    ]
  },
  "vinwonders-nhatrang": {
    lunch: [
      { id: "coral", name: "Nhà hàng Coral" },
      { id: "wind-sea", name: "Nhà hàng Wind & Sea" }
    ]
  },
  "vinwonders-namhoian": {
    lunch: [
      { id: "cho-que", name: "Nhà hàng Chợ Quê" },
      { id: "harbour", name: "Nhà hàng Harbour" }
    ]
  },
  "sunworld-halong": {
    lunch: [
      { id: "taiyo", name: "Nhà hàng Taiyo" },
      { id: "dragon", name: "Nhà hàng Dragon Buffet" }
    ]
  },
  "novaworld-phanthiet": {
    lunch: [
      { id: "miami-beach", name: "Nhà hàng Miami Beach" },
      { id: "ocean-terrace", name: "Nhà hàng Ocean Terrace" }
    ]
  }
};

const SERVICE_GROUP_DEFINITIONS = [
  { id: 'entrance', label: 'Vé cáp treo', icon: 'fa-cable-car', shortDesc: 'Vé vào cổng & cáp treo' },
  { id: 'combo-buffet', label: 'Vé cáp treo + Buffet', icon: 'fa-utensils', shortDesc: 'Combo vé & ẩm thực' },
  { id: 'buffet-only', label: 'Vé Buffet', icon: 'fa-bowl-food', shortDesc: 'Chỉ suất ăn Buffet' }
];

const MARKET_REGION_DEFINITIONS = [
  { id: 'local', label: 'Địa phương', icon: 'fa-location-dot', multiplier: 0.92, badgeCls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'domestic', label: 'Ngoại tỉnh', icon: 'fa-map', multiplier: 1.0, badgeCls: 'bg-sky-50 text-sky-700 border-sky-200' },
  { id: 'china', label: 'Trung Quốc', icon: 'fa-globe-asia', multiplier: 1.05, badgeCls: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'korea', label: 'Hàn Quốc', icon: 'fa-plane-arrival', multiplier: 1.05, badgeCls: 'bg-violet-50 text-violet-700 border-violet-200' }
];

const venuePackagesDatabase = {
  "sunworld-bana": {
    1: {
      id: 1,
      title: "VÉ COMBO CÁP TREO & BUFFET TRƯA QUỐC TẾ – BÀ NÀ HILLS",
      category: "combo",
      discountTag: "Bán chạy nhất",
      adult: { listedPrice: 1150000, netPrice: 980000, defaultSelling: 1050000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 850000, netPrice: 720000, defaultSelling: 800000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Xuất trình mã vé điện tử QR tại cổng kiểm soát cáp treo khứ hồi.<br>• Thời gian phục vụ Buffet trưa: 11:00 – 14:30 tại Nhà hàng Four Seasons (tầng 2 ga đến).",
      notes: "• Người lớn tính từ 140cm trở lên. Trẻ em từ 100cm đến 140cm. Dưới 100cm miễn phí vé.<br>• Vé đã mua không áp dụng hoàn, hủy hoặc quy đổi sang dịch vụ khác."
    },
    2: {
      id: 2,
      title: "VÉ CÁP TREO ĐÀ NẴNG – BÀ NÀ HILLS KHỨ HỒI",
      category: "standard",
      discountTag: "Vé chính hãng",
      adult: { listedPrice: 650000, netPrice: 605000, defaultSelling: 650000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 550000, netPrice: 505000, defaultSelling: 550000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Sử dụng trực tiếp tại tất cả các tuyến cáp treo vận hành trong ngày.<br>• Bao gồm tham quan Cầu Vàng, Làng Pháp, Fantasy Park (105 trò chơi miễn phí).",
      notes: "• Áp dụng cho khách hàng toàn quốc. Xuất trình giấy tờ tùy thân nếu được yêu cầu."
    },
    3: {
      id: 3,
      title: "VÉ CÁP TREO & THAM QUAN CẦU VÀNG + HẦM RƯỢU DEBAY",
      category: "standard",
      discountTag: "Ưu đãi đoàn B2B",
      adult: { listedPrice: 850000, netPrice: 730000, defaultSelling: 800000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 650000, netPrice: 550000, defaultSelling: 600000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Bao gồm cáp treo 2 chiều và vé vào cửa hầm rượu cổ Debay 100 năm tuổi xuyên lòng núi.",
      notes: "• Vé người lớn bao gồm 01 ly vang hoặc cocktail tiêu chuẩn tại quầy Bar Debay."
    },
    4: {
      id: 4,
      title: "COMBO HOÀNG HÔN BA NA BY NIGHT (CÁP TREO + BUFFET TỐI)",
      category: "combo",
      discountTag: "Trọn gói tiết kiệm",
      adult: { listedPrice: 800000, netPrice: 700000, defaultSelling: 760000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 600000, netPrice: 520000, defaultSelling: 570000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Áp dụng lên cáp từ 15:00 hàng ngày. Buffet tối Beer Plaza phục vụ từ 17:30 đến 21:00.",
      notes: "• Thưởng thức trình diễn âm nhạc đường phố và đêm hội đốt lửa trại Châu Âu."
    },
    5: {
      id: 5,
      title: "VÉ TRẢI NGHIỆM TÀU HỎA LEO NÚI & LÂU ĐÀI MẶT TRĂNG",
      category: "standard",
      discountTag: "Khám phá mới",
      adult: { listedPrice: 200000, netPrice: 160000, defaultSelling: 180000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 150000, netPrice: 120000, defaultSelling: 140000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Di chuyển bằng tàu hỏa leo núi tuyến 2 từ Ga Giếng Thần đến Quảng trường Nhật Thực.",
      notes: "• Chiêm ngưỡng các show diễn thực cảnh kỳ ảo và rạp chiếu phim bay 4D tại Lâu đài Mặt Trăng."
    },
    6: {
      id: 6,
      title: "VÉ BUFFET TRƯA ĐA VĂN HÓA (KHÔNG KÈM CÁP TREO)",
      category: "combo",
      discountTag: "Ẩm thực cao cấp",
      adult: { listedPrice: 350000, netPrice: 290000, defaultSelling: 320000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 220000, netPrice: 180000, defaultSelling: 200000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Quét QR tại cổng Nhà hàng Arapang hoặc Beer Plaza (10:30 – 15:00).",
      notes: "• Chỉ áp dụng suất ăn buffet, khách tự túc phương tiện cáp treo lên đỉnh."
    },
    7: {
      id: 7,
      title: "COMBO GIA ĐÌNH 2 LỚN 1 TRẺ – TRỌN GÓI VUI CHƠI",
      category: "combo",
      discountTag: "Ưu đãi gia đình",
      adult: { listedPrice: 2850000, netPrice: 2450000, defaultSelling: 2650000, label: "Gia đình", condition: "2 Lớn + 1 Trẻ" },
      child: { listedPrice: 750000, netPrice: 650000, defaultSelling: 700000, label: "Trẻ phụ thu", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Gói áp dụng nhóm gia đình tiêu chuẩn 2 người lớn kèm 1 trẻ em.",
      notes: "• Bao gồm cáp treo khứ hồi và suất ăn trưa buffet cho cả gia đình."
    },
    8: {
      id: 8,
      title: "VÉ VIP WOW PASS KHÔNG CẦN XẾP HÀNG CÁP TREO",
      category: "combo",
      discountTag: "Dịch vụ VIP",
      adult: { listedPrice: 500000, netPrice: 430000, defaultSelling: 470000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 400000, netPrice: 340000, defaultSelling: 380000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Lối đi ưu tiên Fastpass không xếp hàng tại mọi cổng soát vé và ga cáp treo.",
      notes: "• Số lượng giới hạn 100 vé/ngày để đảm bảo dịch vụ ưu tiên chất lượng cao."
    }
  },

  "sunworld-fansipan": {
    1: {
      id: 1,
      title: "VÉ CÁP TREO FANSIPAN LEGEND KHỨ HỒI",
      category: "standard",
      discountTag: "Bán chạy nhất",
      adult: { listedPrice: 800000, netPrice: 730000, defaultSelling: 780000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 550000, netPrice: 490000, defaultSelling: 530000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Vé cáp treo 2 chiều Ga Hoàng Liên – Ga Fansipan.<br>• Chiêm ngưỡng thung lũng Mường Hoa và dãy Hoàng Liên Sơn hùng vĩ.",
      notes: "• Vé có giá trị sử dụng trong ngày đặt vé. Dưới 1m miễn phí."
    },
    2: {
      id: 2,
      title: "COMBO CÁP TREO FANSIPAN & BUFFET ẨM THỰC TÂY BẮC",
      category: "combo",
      discountTag: "Trọn gói tiết kiệm",
      adult: { listedPrice: 1050000, netPrice: 920000, defaultSelling: 990000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 750000, netPrice: 640000, defaultSelling: 700000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Cáp treo khứ hồi kèm suất Buffet trưa hơn 60 món đặc sản Tây Bắc tại Nhà hàng Vân Sam.",
      notes: "• Giờ phục vụ buffet: 10:30 – 14:30 hàng ngày."
    },
    3: {
      id: 3,
      title: "VÉ TÀU HỎA LEO NÚI MƯỜNG HOA KHỨ HỒI",
      category: "standard",
      discountTag: "Trải nghiệm đặc sắc",
      adult: { listedPrice: 180000, netPrice: 150000, defaultSelling: 165000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 150000, netPrice: 125000, defaultSelling: 140000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Tuyến tàu hỏa leo núi khởi hành từ Trung tâm Sun Plaza Sa Pa đến Ga Hoàng Liên.",
      notes: "• Thiết kế toa tàu cổ điển phong cách Pháp ngắm trọn thung lũng hoa Mường Hoa."
    },
    4: {
      id: 4,
      title: "VÉ TÀU HỎA LEO NÚI ĐỈNH FANSIPAN (CHIỀU LÊN)",
      category: "standard",
      discountTag: "Chinh phục đỉnh cao",
      adult: { listedPrice: 150000, netPrice: 130000, defaultSelling: 140000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 150000, netPrice: 130000, defaultSelling: 140000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Đưa du khách vượt qua 600 bậc đá từ Ga Đỗ Quyên lên thẳng cột cờ Fansipan 3.143m.",
      notes: "• Phù hợp người lớn tuổi và trẻ nhỏ giữ sức khỏe khi lên đỉnh cao."
    },
    5: {
      id: 5,
      title: "TRỌN GÓI CHINH PHỤC NÓC NHÀ ĐÔNG DƯƠNG (CÁP + 2 TUYẾN TÀU)",
      category: "combo",
      discountTag: "All-In-One Tiện lợi",
      adult: { listedPrice: 1150000, netPrice: 1010000, defaultSelling: 1080000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 850000, netPrice: 740000, defaultSelling: 800000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Bao gồm Cáp treo Fansipan khứ hồi + Tàu Mường Hoa khứ hồi + Tàu hỏa lên đỉnh Fansipan.",
      notes: "• Lộ trình trọn vẹn không cần đi bộ nhiều bậc thang."
    },
    6: {
      id: 6,
      title: "VÉ VIP PASS LỐI ĐI ƯU TIÊN GA CÁP TREO FANSIPAN",
      category: "combo",
      discountTag: "Ưu tiên không chờ",
      adult: { listedPrice: 400000, netPrice: 350000, defaultSelling: 380000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 300000, netPrice: 260000, defaultSelling: 285000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Lối đi ưu tiên riêng biệt tại tất cả các cổng kiểm soát ga đi và ga đến.",
      notes: "• Giải pháp hoàn hảo cho mùa lễ hội và cao điểm du lịch Sa Pa."
    }
  },

  "vinwonders-phuquoc": {
    1: {
      id: 1,
      title: "VÉ VÀO CỔNG TIÊU CHUẨN VINWONDERS PHÚ QUỐC",
      category: "standard",
      discountTag: "Bán chạy nhất",
      adult: { listedPrice: 950000, netPrice: 860000, defaultSelling: 910000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 710000, netPrice: 630000, defaultSelling: 680000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Vui chơi không giới hạn tất cả các phân khu trò chơi tại công viên chủ đề lớn nhất Việt Nam.",
      notes: "• Bao gồm Cung điện Hải Vương (Thủy cung hình rùa khổng lồ) và Công viên nước Thế giới Lốc Xoáy."
    },
    2: {
      id: 2,
      title: "COMBO VINWONDERS & VINPEARL SAFARI PHÚ QUỐC (1 NGÀY)",
      category: "combo",
      discountTag: "Tiết kiệm 20%",
      adult: { listedPrice: 1350000, netPrice: 1190000, defaultSelling: 1280000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 1000000, netPrice: 880000, defaultSelling: 950000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Trọn gói tham quan VinWonders Phú Quốc và Công viên chăm sóc bảo tồn động vật bán hoang dã Safari trong 01 ngày.",
      notes: "• Bao gồm xe bus Safari chuyên dụng đưa khách vào khu thú thả tự nhiên."
    },
    3: {
      id: 3,
      title: "COMBO VÉ VUI CHƠI & VOUCHER ẨM THỰC 200.000Đ",
      category: "combo",
      discountTag: "Tặng suất ăn",
      adult: { listedPrice: 1100000, netPrice: 980000, defaultSelling: 1040000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 860000, netPrice: 760000, defaultSelling: 810000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Vé vào cổng VinWonders kèm voucher ăn uống 200k áp dụng tại mọi nhà hàng bên trong công viên.",
      notes: "• Voucher không có giá trị quy đổi thành tiền mặt."
    },
    4: {
      id: 4,
      title: "VÉ VÀO CỔNG SAU 16:00 & THƯỞNG THỨC SHOW ONCE KỲ ẢO",
      category: "standard",
      discountTag: "Giá hoàng hôn",
      adult: { listedPrice: 600000, netPrice: 530000, defaultSelling: 570000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 450000, netPrice: 390000, defaultSelling: 425000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Vào cửa từ 16:00, trải nghiệm các trò chơi đêm và show diễn thực cảnh triệu đô ONCE tại hồ Lâu đài lúc 18:30.",
      notes: "• Khám phá không khí lễ hội về đêm lung linh ánh sáng."
    },
    5: {
      id: 5,
      title: "COMBO GIA ĐÌNH VINWONDERS + SAFARI (2 LỚN 1 TRẺ)",
      category: "combo",
      discountTag: "Gói gia đình B2B",
      adult: { listedPrice: 3350000, netPrice: 2950000, defaultSelling: 3150000, label: "Gia đình", condition: "2 Lớn + 1 Trẻ" },
      child: { listedPrice: 850000, netPrice: 750000, defaultSelling: 800000, label: "Trẻ phụ thu", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Áp dụng trọn gói cho nhóm 2 người lớn và 1 trẻ em vào cả 2 khu VinWonders và Safari.",
      notes: "• Tiết kiệm tối đa chi phí cho kỳ nghỉ của gia đình tại Bắc đảo Phú Quốc."
    },
    6: {
      id: 6,
      title: "DỊCH VỤ FASTPASS LỐI ĐI ƯU TIÊN VINWONDERS PHÚ QUỐC",
      category: "combo",
      discountTag: "Trải nghiệm VIP",
      adult: { listedPrice: 450000, netPrice: 390000, defaultSelling: 420000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 350000, netPrice: 300000, defaultSelling: 330000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Không cần xếp hàng chờ đợi tại 10 trò chơi cảm giác mạnh hot nhất và Cung điện Hải Vương.",
      notes: "• Mỗi người sử dụng 01 vòng tay VIP đeo suốt thời gian tham quan."
    }
  },

  "vinwonders-nhatrang": {
    1: {
      id: 1,
      title: "VÉ CÁP TREO KHỨ HỒI & VUI CHƠI TRỌN GÓI VINWONDERS NHA TRANG",
      category: "standard",
      discountTag: "Bán chạy nhất",
      adult: { listedPrice: 880000, netPrice: 790000, defaultSelling: 840000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 660000, netPrice: 580000, defaultSelling: 630000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Cáp treo vượt biển vịnh Nha Trang khứ hồi và vé vào cổng 6 phân khu vui chơi giải trí kỷ lục.",
      notes: "• Bao gồm công viên nước, đồi thử thách, vịnh cá heo và Tata Show."
    },
    2: {
      id: 2,
      title: "COMBO VÉ VUI CHƠI VINWONDERS & BUFFET TRƯA QUỐC TẾ",
      category: "combo",
      discountTag: "Trọn gói ẩm thực",
      adult: { listedPrice: 1150000, netPrice: 1020000, defaultSelling: 1090000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 850000, netPrice: 740000, defaultSelling: 800000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Vé vui chơi trọn gói kèm suất ăn buffet trưa hơn 100 món tại Nhà hàng Coral / Wind & Sea.",
      notes: "• Giờ phục vụ buffet: 11:00 – 14:00."
    },
    3: {
      id: 3,
      title: "VÉ SAU 16:00 CÁP TREO VƯỢT BIỂN & SHOW DIỄN TATA SHOW",
      category: "standard",
      discountTag: "Giá chiều muộn",
      adult: { listedPrice: 560000, netPrice: 490000, defaultSelling: 530000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 420000, netPrice: 360000, defaultSelling: 395000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Đi cáp treo sang đảo Hòn Tre từ 16:00. Thưởng thức siêu phẩm trình diễn đa phương tiện Tata Show lúc 19:30.",
      notes: "• Ngắm hoàng hôn trên vịnh Nha Trang tuyệt đẹp."
    },
    4: {
      id: 4,
      title: "VÉ TRẢI NGHIỆM ĐƯỜNG TRƯỢT ZIPLINE & TÀU LƯỢN ĐẢO HÒN TRE",
      category: "standard",
      discountTag: "Cảm giác mạnh",
      adult: { listedPrice: 250000, netPrice: 210000, defaultSelling: 235000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 180000, netPrice: 150000, defaultSelling: 170000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Trải nghiệm đường trượt Zipline 3 kỷ lục và Alpine Coaster uốn lượn quanh sườn núi nhìn ra đại dương.",
      notes: "• Đảm bảo yêu cầu an toàn theo quy chuẩn kỹ thuật quốc tế."
    },
    5: {
      id: 5,
      title: "COMBO GIA ĐÌNH VINWONDERS NHA TRANG (2 LỚN 1 TRẺ)",
      category: "combo",
      discountTag: "Ưu đãi đoàn B2B",
      adult: { listedPrice: 2200000, netPrice: 1950000, defaultSelling: 2080000, label: "Gia đình", condition: "2 Lớn + 1 Trẻ" },
      child: { listedPrice: 550000, netPrice: 480000, defaultSelling: 520000, label: "Trẻ phụ thu", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Vé trọn gói cáp treo và vui chơi cho 2 người lớn kèm 1 trẻ em.",
      notes: "• Trẻ em dưới 100cm được miễn phí hoàn toàn."
    },
    6: {
      id: 6,
      title: "VÉ THAM QUAN THỦY CUNG & VƯỜN QUÝ VƯƠNG VINPEARL",
      category: "combo",
      discountTag: "Thiên nhiên kỳ thú",
      adult: { listedPrice: 350000, netPrice: 300000, defaultSelling: 330000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 250000, netPrice: 210000, defaultSelling: 235000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Khám phá thế giới đại dương huyền ảo và vườn thú mở với nhiều loài động thực vật quý hiếm trên thế giới.",
      notes: "• Đã bao gồm show biểu diễn nàng tiên cá và cho cá ăn hàng ngày."
    }
  },

  "sunworld-halong": {
    1: {
      id: 1,
      title: "VÉ CÁP TREO NỮ HOÀNG & VÒNG QUAY MẶT TRỜI SUN WHEEL",
      category: "standard",
      discountTag: "Bán chạy nhất",
      adult: { listedPrice: 350000, netPrice: 300000, defaultSelling: 330000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 250000, netPrice: 210000, defaultSelling: 235000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Vượt vịnh Cửa Lục trên cabin cáp treo 2 tầng đạt 2 kỷ lục Guinness, ngắm toàn cảnh Vịnh Hạ Long từ đỉnh Ba Đèo.",
      notes: "• Bao gồm Vòng quay Mặt Trời Sun Wheel, Vườn Nhật Zen Garden, Bảo tàng tượng sáp."
    },
    2: {
      id: 2,
      title: "VÉ CÔNG VIÊN RỒNG (DRAGON PARK) TRỌN GÓI TRÒ CHƠI",
      category: "standard",
      discountTag: "Thế giới cảm giác mạnh",
      adult: { listedPrice: 300000, netPrice: 255000, defaultSelling: 280000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 200000, netPrice: 165000, defaultSelling: 185000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Trải nghiệm hơn 20 trò chơi hiện đại đẳng cấp quốc tế: Phi Long Thần Tốc, Tê Giác Cuồng Nộ...",
      notes: "• Chơi không giới hạn số lần các trò chơi trong ngày."
    },
    3: {
      id: 3,
      title: "VÉ CÔNG VIÊN NƯỚC VỊNH LỐC XOÁY (TYPHOON WATER PARK)",
      category: "standard",
      discountTag: "Sôi động mùa hè",
      adult: { listedPrice: 350000, netPrice: 300000, defaultSelling: 330000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 250000, netPrice: 210000, defaultSelling: 235000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Công viên nước 12 đại tiện ích nước hàng đầu Đông Nam Á: Sóng Thần Kỳ Bí, Cơn Bão Nhiệt Đới...",
      notes: "• Mở cửa theo mùa vụ (từ tháng 4 đến tháng 10 hàng năm)."
    },
    4: {
      id: 4,
      title: "COMBO 2 CÔNG VIÊN TỰ CHỌN TẠI SUN WORLD HẠ LONG",
      category: "combo",
      discountTag: "Tiết kiệm 30%",
      adult: { listedPrice: 550000, netPrice: 470000, defaultSelling: 510000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 400000, netPrice: 340000, defaultSelling: 375000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Tự do lựa chọn 2 trong 3 công viên: Cáp treo Nữ Hoàng, Công viên Rồng hoặc Công viên Nước.",
      notes: "• Sử dụng trong cùng 01 ngày đặt vé."
    },
    5: {
      id: 5,
      title: "COMBO ALL-IN-ONE 3 CÔNG VIÊN SUN WORLD HẠ LONG",
      category: "combo",
      discountTag: "Trọn gói siêu hời",
      adult: { listedPrice: 700000, netPrice: 590000, defaultSelling: 650000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 500000, netPrice: 420000, defaultSelling: 465000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Vui chơi không giới hạn tại toàn bộ tổ hợp: Cáp treo Nữ Hoàng + Công viên Rồng + Công viên Nước.",
      notes: "• Trải nghiệm trọn vẹn mọi cung bậc cảm xúc tại kỳ quan Hạ Long."
    },
    6: {
      id: 6,
      title: "COMBO CÁP TREO NỮ HOÀNG & SET ĂN TẠI NHÀ HÀNG TAIYO",
      category: "combo",
      discountTag: "Kèm ăn trưa",
      adult: { listedPrice: 500000, netPrice: 420000, defaultSelling: 460000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 380000, netPrice: 315000, defaultSelling: 350000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Bao gồm Cáp treo Nữ hoàng khứ hồi và set menu ẩm thực Nhật Bản/Việt Nam tại đỉnh Ba Đèo.",
      notes: "• Vị trí bàn view ngắm cầu Bãi Cháy lung linh."
    }
  },

  "novaworld-phanthiet": {
    1: {
      id: 1,
      title: "VÉ CỔNG WONDERLAND WATER PARK TRỌN GÓI 13 CỤM TRÒ CHƠI",
      category: "standard",
      discountTag: "Bán chạy nhất",
      adult: { listedPrice: 250000, netPrice: 200000, defaultSelling: 230000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 180000, netPrice: 140000, defaultSelling: 165000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Vui chơi không giới hạn các đường trượt cảm giác mạnh: Tháp Đại Dương, Pháo Đài Bong Bóng, Đảo Cá Heo...",
      notes: "• Tọa lạc ngay mặt tiền biển NovaWorld Phan Thiết, Bình Thuận."
    },
    2: {
      id: 2,
      title: "COMBO WONDERLAND WATER PARK + DINO PARK (CÔNG VIÊN KHỦNG LONG)",
      category: "combo",
      discountTag: "Trọn gói tiết kiệm",
      adult: { listedPrice: 350000, netPrice: 285000, defaultSelling: 320000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 250000, netPrice: 200000, defaultSelling: 230000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Kết hợp giải nhiệt công viên nước và thám hiểm xứ sở khủng long cơ học quy mô lớn nhất Việt Nam.",
      notes: "• Bé được trải nghiệm phòng thí nghiệm khảo cổ học thú vị."
    },
    3: {
      id: 3,
      title: "VÉ KHÁM PHÁ CÔNG VIÊN SAFARI CAFE BÁN HOANG DÃ",
      category: "standard",
      discountTag: "Khám phá mới",
      adult: { listedPrice: 180000, netPrice: 145000, defaultSelling: 165000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 120000, netPrice: 95000, defaultSelling: 110000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Tương tác cho hươu cao cổ, ngựa vằn ăn và ngắm nhìn các loài động vật trong không gian sinh thái hoang dã.",
      notes: "• Đã bao gồm 01 phần nước uống giải khát tại Safari Cafe."
    },
    4: {
      id: 4,
      title: "COMBO ALL-IN-ONE 3 CÔNG VIÊN NOVADREAMS PHAN THIẾT",
      category: "combo",
      discountTag: "Ưu đãi đoàn B2B",
      adult: { listedPrice: 490000, netPrice: 395000, defaultSelling: 450000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 350000, netPrice: 280000, defaultSelling: 320000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Khám phá trọn bộ 3 công viên chủ đề: Wonderland Water Park + Dino Park + Safari Cafe.",
      notes: "• Vé có giá trị sử dụng trong ngày, vào cổng từng công viên 1 lần."
    },
    5: {
      id: 5,
      title: "COMBO GIA ĐÌNH WONDERLAND + SET ĂN ẨM THỰC BỜ BIỂN",
      category: "combo",
      discountTag: "Gói gia đình",
      adult: { listedPrice: 750000, netPrice: 610000, defaultSelling: 680000, label: "Gia đình", condition: "2 Lớn + 1 Trẻ" },
      child: { listedPrice: 200000, netPrice: 160000, defaultSelling: 185000, label: "Trẻ phụ thu", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Gồm vé công viên nước cho cả gia đình kèm set ăn trưa tại nhà hàng ven biển Miami Bikini Beach.",
      notes: "• Thực đơn hải sản tươi ngon Phan Thiết."
    },
    6: {
      id: 6,
      title: "VÉ TRẢI NGHIỆM ĐUA XE F1 GO KART & RẠP PHIM 7D",
      category: "combo",
      discountTag: "Tốc độ đỉnh cao",
      adult: { listedPrice: 220000, netPrice: 175000, defaultSelling: 200000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 170000, netPrice: 135000, defaultSelling: 155000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Thử thách tài lái xe trên đường đua Go-Kart chuyên nghiệp và xem phim chuyển động 7D đa chiều.",
      notes: "• Có huấn luyện viên hướng dẫn trang bị đồ bảo hộ an toàn."
    }
  },

  "vinwonders-namhoian": {
    1: {
      id: 1,
      title: "VÉ TIÊU CHUẨN TRẢI NGHIỆM VINWONDERS NAM HỘI AN",
      category: "standard",
      discountTag: "Bán chạy nhất",
      adult: { listedPrice: 600000, netPrice: 530000, defaultSelling: 570000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 450000, netPrice: 395000, defaultSelling: 425000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Trọn gói vui chơi công viên giải trí, thế giới nước, đảo văn hóa dân gian và khu trò chơi công nghệ trong nhà.",
      notes: "• Thưởng thức không gian kiến trúc giao thoa Đông – Tây độc đáo."
    },
    2: {
      id: 2,
      title: "COMBO VINWONDERS & BUFFET ẨM THỰC BA MIỀN TRUYỀN THỐNG",
      category: "combo",
      discountTag: "Trọn gói ẩm thực",
      adult: { listedPrice: 850000, netPrice: 750000, defaultSelling: 800000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 650000, netPrice: 570000, defaultSelling: 610000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Vé vào cổng kết hợp bữa ăn buffet phong phú các món ngon đặc sản xứ Quảng và ẩm thực ba miền.",
      notes: "• Phục vụ từ 11:30 – 14:00 tại Nhà hàng Chợ Quê."
    },
    3: {
      id: 3,
      title: "VÉ DU THUYỀN RIVER SAFARI & ĐẢO VĂN HÓA DÂN GIAN",
      category: "standard",
      discountTag: "Đặc sắc duy nhất",
      adult: { listedPrice: 350000, netPrice: 295000, defaultSelling: 325000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 260000, netPrice: 220000, defaultSelling: 245000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Du thuyền ngắm nhìn các loài động vật hoang dã hai bên bờ sông trên dòng sông Amazon thu nhỏ.",
      notes: "• Xem trình diễn các nghề thủ công truyền thống: dệt lụa, làm gốm, đan nón lá."
    },
    4: {
      id: 4,
      title: "VÉ THAM QUAN SAU 15:00 & THƯỞNG THỨC 3D MAPPING VỀ BẾN",
      category: "standard",
      discountTag: "Giá ưu đãi chiều",
      adult: { listedPrice: 400000, netPrice: 345000, defaultSelling: 375000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 300000, netPrice: 255000, defaultSelling: 280000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Vào cửa từ 15:00, xem show diễn thực cảnh 'Về Bến' và chiếu 3D Mapping tại Tháp Ánh Sáng.",
      notes: "• Không khí hoàng hôn thơ mộng trên bến sông Hoài thu nhỏ."
    },
    5: {
      id: 5,
      title: "COMBO GIA ĐÌNH NAM HỘI AN TRỌN GÓI VUI CHƠI",
      category: "combo",
      discountTag: "Ưu đãi gia đình",
      adult: { listedPrice: 1500000, netPrice: 1320000, defaultSelling: 1420000, label: "Gia đình", condition: "2 Lớn + 1 Trẻ" },
      child: { listedPrice: 400000, netPrice: 350000, defaultSelling: 380000, label: "Trẻ phụ thu", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Trọn gói kỳ nghỉ vui chơi bổ ích kết nối văn hóa truyền thống cho gia đình.",
      notes: "• Trẻ em dưới 100cm được miễn phí hoàn toàn."
    },
    6: {
      id: 6,
      title: "VÉ ƯU TIÊN KHÔNG XẾP HÀNG CÔNG VIÊN NƯỚC & TRÒ CHƠI CẢM GIÁC MẠNH",
      category: "combo",
      discountTag: "Fastpass VIP",
      adult: { listedPrice: 300000, netPrice: 250000, defaultSelling: 280000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 220000, netPrice: 185000, defaultSelling: 205000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Lối đi ưu tiên tại Tháp rơi tự do 85m kỷ lục, Tàu lượn siêu tốc và Đảo thế giới nước.",
      notes: "• Thỏa thích trải nghiệm không mất thời gian chờ đợi hàng giờ."
    }
  },

  "damsen-world": {
    1: {
      id: 1,
      title: "VÉ TRỌN GÓI ĐẦM SEN (VÀO CỔNG + 30+ TRÒ CHƠI CÔNG VIÊN KHÔ)",
      category: "standard",
      discountTag: "Bán chạy nhất",
      adult: { listedPrice: 260000, netPrice: 205000, defaultSelling: 235000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 180000, netPrice: 140000, defaultSelling: 160000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Bao gồm vé vào cổng và chơi không giới hạn tất cả các trò chơi trong công viên khô: Vòng quay khổng lồ, Tàu lượn...",
      notes: "• Áp dụng từ 08:00 đến 18:00 các ngày trong tuần. Dưới 1m miễn phí."
    },
    2: {
      id: 2,
      title: "VÉ VÀO CỔNG TIÊU CHUẨN CÔNG VIÊN VĂN HÓA ĐẦM SEN",
      category: "standard",
      discountTag: "Tham quan dạo mát",
      adult: { listedPrice: 140000, netPrice: 105000, defaultSelling: 125000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 100000, netPrice: 75000, defaultSelling: 90000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Vé vào cổng dạo mát ngắm cảnh, tham quan vườn thú, vườn hoa Châu Âu và các cảnh quan đặc trưng.",
      notes: "• Khách muốn chơi từng trò chơi có thể mua vé lẻ tại từng quầy."
    },
    3: {
      id: 3,
      title: "VÉ CÔNG VIÊN NƯỚC ĐẦM SEN WATER PARK (TRỌN GÓI HỒ BƠI & MÁNG TRƯỢT)",
      category: "standard",
      discountTag: "Giải nhiệt Sài Gòn",
      adult: { listedPrice: 200000, netPrice: 155000, defaultSelling: 180000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 160000, netPrice: 125000, defaultSelling: 145000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Tắm hồ bơi tạo sóng, sông lười và trải nghiệm hơn 36 thiết bị trò chơi nước hiện đại tại Đầm Sen Nước.",
      notes: "• Cần chuẩn bị trang phục bơi theo quy định công viên nước."
    },
    4: {
      id: 4,
      title: "COMBO LIÊN THÔNG ĐẦM SEN NƯỚC + ĐẦM SEN KHÔ TRỌN NGÀY",
      category: "combo",
      discountTag: "Tiết kiệm 35%",
      adult: { listedPrice: 380000, netPrice: 300000, defaultSelling: 340000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 280000, netPrice: 220000, defaultSelling: 250000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Đi lại tự do giữa Đầm Sen Khô và Đầm Sen Nước qua cổng liên thông trong suốt 1 ngày.",
      notes: "• Gói vé lý tưởng cho đoàn học sinh, gia đình vui chơi trọn vẹn cả ngày."
    },
    5: {
      id: 5,
      title: "COMBO HỌC SINH / ĐOÀN ĐẠI LÝ TRẢI NGHIỆM VĂN HÓA & TRÒ CHƠI",
      category: "combo",
      discountTag: "Ưu đãi đoàn B2B",
      adult: { listedPrice: 220000, netPrice: 165000, defaultSelling: 195000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 150000, netPrice: 115000, defaultSelling: 135000, label: "Học sinh", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Áp dụng cho các đoàn khách B2B đặt trước với mức chiết khấu đối tác cạnh tranh nhất.",
      notes: "• Hỗ trợ khu vực tập trung sinh hoạt đoàn và chụp ảnh kỷ niệm."
    },
    6: {
      id: 6,
      title: "VÉ THAM QUAN THỦY CUNG ĐẦM SEN & VƯỜN CHIM THIÊN NGA",
      category: "combo",
      discountTag: "Khám phá sinh thái",
      adult: { listedPrice: 120000, netPrice: 90000, defaultSelling: 105000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 90000, netPrice: 65000, defaultSelling: 80000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Chiêm ngưỡng các loài sinh vật biển nhiệt đới, cá mập, rùa biển tại Thủy cung Đầm Sen.",
      notes: "• Bao gồm vé chụp hình lưu niệm tại Đồi Lan và Vườn thú mở."
    }
  },

  "suoitien-themepark": {
    1: {
      id: 1,
      title: "VÉ CỔNG & TẮM BIỂN TIÊN ĐỒNG NGỌC NỮ TRỌN GÓI",
      category: "combo",
      discountTag: "Bán chạy nhất",
      adult: { listedPrice: 250000, netPrice: 195000, defaultSelling: 225000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 160000, netPrice: 125000, defaultSelling: 145000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Vào cổng tham quan Suối Tiên và tắm biển nhân tạo nước mặn Tiên Đồng Ngọc Nữ đầu tiên tại Việt Nam.",
      notes: "• Mở cửa từ 07:30 đến 17:00 tất cả các ngày trong năm."
    },
    2: {
      id: 2,
      title: "VÉ VÀO CỔNG TIÊU CHUẨN THAM QUAN SUỐI TIÊN",
      category: "standard",
      discountTag: "Vé chính hãng",
      adult: { listedPrice: 150000, netPrice: 115000, defaultSelling: 135000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 80000, netPrice: 60000, defaultSelling: 70000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Tham quan các công trình lịch sử văn hóa tâm linh huyền thoại: Đền Hùng, Long Hoa Hội, Tượng Phật...",
      notes: "• Trẻ em dưới 1m được miễn phí vé vào cổng."
    },
    3: {
      id: 3,
      title: "VÉ TRẢI NGHIỆM SUỐI TIÊN FARM HÁI TRÁI CÂY KHÔNG GIỚI HẠN",
      category: "standard",
      discountTag: "Nông nghiệp công nghệ cao",
      adult: { listedPrice: 150000, netPrice: 115000, defaultSelling: 135000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 100000, netPrice: 75000, defaultSelling: 90000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Trải nghiệm nông trại theo tiêu chuẩn Nhật Bản: Nho mẫu đơn, sung Mỹ, dừa xiêm, lựu đỏ Ấn Độ...",
      notes: "• Được nếm thử trái cây tươi sạch ngay tại vườn."
    },
    4: {
      id: 4,
      title: "COMBO TIỆN ÍCH SUỐI TIÊN: CỔNG + BIỂN TIÊN ĐỒNG + XE LỬA DU NGOẠN",
      category: "combo",
      discountTag: "Tiết kiệm 30%",
      adult: { listedPrice: 320000, netPrice: 250000, defaultSelling: 285000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 210000, netPrice: 165000, defaultSelling: 190000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Bao gồm vé cổng, biển Tiên Đồng và vé xe lửa đưa đón vòng quanh công viên không lo mỏi chân.",
      notes: "• Tối ưu cho gia đình có trẻ nhỏ và người lớn tuổi."
    },
    5: {
      id: 5,
      title: "VÉ TRỌN GÓI 15 TRÒ CHƠI CẢM GIÁC MẠNH & CỬU ĐỊA NGỤC",
      category: "standard",
      discountTag: "Khám phá huyền bí",
      adult: { listedPrice: 280000, netPrice: 220000, defaultSelling: 250000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 190000, netPrice: 150000, defaultSelling: 170000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Chinh phục Tàu lượn siêu tốc, Tháp rơi tự do, Cối xay gió và mê cung 18 Tầng Địa Ngục rùng rợn.",
      notes: "• Yêu cầu kiểm tra điều kiện sức khỏe đối với trò chơi cảm giác mạnh."
    },
    6: {
      id: 6,
      title: "COMBO ĐOÀN ĐẠI LÝ VUI CHƠI VÀ THƯỞNG THỨC BỮA TRƯA DÂN DÃ",
      category: "combo",
      discountTag: "Ưu đãi đoàn B2B",
      adult: { listedPrice: 420000, netPrice: 330000, defaultSelling: 375000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 280000, netPrice: 220000, defaultSelling: 250000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Vé vui chơi trọn gói kèm suất ăn set menu tại Nhà hàng Phù Đổng.",
      notes: "• Áp dụng đoàn đại lý B2B từ 10 khách trở lên."
    }
  },

  "ttc-world": {
    1: {
      id: 1,
      title: "VÉ VÀO CỔNG THUNG LŨNG TÌNH YÊU & ĐỒNG HOA CẨM TÚ CẦU",
      category: "standard",
      discountTag: "Bán chạy nhất",
      adult: { listedPrice: 250000, netPrice: 200000, defaultSelling: 230000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 125000, netPrice: 100000, defaultSelling: 115000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Vé tham quan danh thắng Thung Lũng Tình Yêu, đồi Vọng Cảnh, vườn hoa Cẩm Tú Cầu và mê cung tình yêu.",
      notes: "• Đã bao gồm vé xe điện di chuyển nội khu giữa các phân khu."
    },
    2: {
      id: 2,
      title: "COMBO THAM QUAN TTC WORLD & BUFFET TRƯA TẠI NHÀ HÀNG HẠNH PHÚC",
      category: "combo",
      discountTag: "Trọn gói ẩm thực",
      adult: { listedPrice: 420000, netPrice: 340000, defaultSelling: 385000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 260000, netPrice: 210000, defaultSelling: 240000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Vé tham quan kết hợp suất buffet trưa rau củ quả tươi ngon chuẩn nông sản Đà Lạt.",
      notes: "• Giờ phục vụ buffet: 11:00 – 14:00 hàng ngày."
    },
    3: {
      id: 3,
      title: "VÉ TRẢI NGHIỆM CẦU KÍNH 7D NGÀN THÔNG ĐẦU TIÊN MIỀN TRUNG",
      category: "standard",
      discountTag: "Check-in siêu hot",
      adult: { listedPrice: 300000, netPrice: 245000, defaultSelling: 275000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 200000, netPrice: 160000, defaultSelling: 180000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Đi bộ trên cầu kính dài 325m vắt ngang qua thung lũng thông reo tuyệt đẹp độ cao gần 100m.",
      notes: "• Trang bị bọc giày nhung bảo vệ mặt kính hiệu ứng 7D sống động."
    },
    4: {
      id: 4,
      title: "COMBO VÉ CỔNG + XE ĐIỆN NỘI KHU + ĐẠP VỊT THƯỞNG NGOẠN HỒ ĐA THIỆN",
      category: "combo",
      discountTag: "Lãng mạn cặp đôi",
      adult: { listedPrice: 350000, netPrice: 280000, defaultSelling: 315000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 210000, netPrice: 170000, defaultSelling: 190000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Thưởng ngoạn mặt nước hồ Đa Thiện bằng thuyền pedalo thiên nga giữa làn sương mờ Đà Lạt.",
      notes: "• Bao gồm áo phao an toàn cho mỗi hành khách."
    },
    5: {
      id: 5,
      title: "COMBO ALL-IN-ONE TTC WORLD (CỔNG + CẦU KÍNH + BUFFET + XE ĐIỆN)",
      category: "combo",
      discountTag: "Trọn gói VIP",
      adult: { listedPrice: 650000, netPrice: 530000, defaultSelling: 595000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 420000, netPrice: 340000, defaultSelling: 385000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Trải nghiệm trọn vẹn toàn bộ dịch vụ cao cấp nhất tại quần thể Thung Lũng Tình Yêu.",
      notes: "• Tiết kiệm hơn 30% so với mua từng dịch vụ riêng lẻ."
    },
    6: {
      id: 6,
      title: "COMBO CHECK-IN ĐỒI MỘNG MƠ & BẢO TÀNG TƯỢNG SÁP ĐÀ LẠT",
      category: "combo",
      discountTag: "Check-in sống ảo",
      adult: { listedPrice: 380000, netPrice: 300000, defaultSelling: 340000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 220000, netPrice: 175000, defaultSelling: 200000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Tham quan vạn lý trường thành thu nhỏ, cây tài lộc và chụp ảnh cùng hơn 30 tượng sáp nhân vật nổi tiếng.",
      notes: "• Tuyệt tác kiến trúc cổ tích giữa rừng thông đại ngàn."
    }
  },

  "sunworld-honthom": {
    1: {
      id: 1,
      title: "VÉ CÁP TREO HÒN THƠM KHỨ HỒI & CÔNG VIÊN NƯỚC AQUATOPIA",
      category: "standard",
      discountTag: "Bán chạy nhất",
      adult: { listedPrice: 600000, netPrice: 530000, defaultSelling: 570000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 450000, netPrice: 395000, defaultSelling: 425000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Tuyến cáp treo 3 dây vượt biển dài nhất thế giới 7.899m từ An Thới sang đảo Hòn Thơm.<br>• Vui chơi công viên nước Aquatopia 21 trò chơi hiện đại.",
      notes: "• Ngắm nhìn toàn cảnh quần đảo An Thới và làng chài rực rỡ sắc màu."
    },
    2: {
      id: 2,
      title: "COMBO CÁP TREO HÒN THƠM & BUFFET TRƯA ĐẢO MANGO",
      category: "combo",
      discountTag: "Ẩm thực đảo ngọc",
      adult: { listedPrice: 850000, netPrice: 740000, defaultSelling: 795000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 600000, netPrice: 520000, defaultSelling: 565000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Cáp treo khứ hồi, công viên nước và thưởng thức buffet trưa hải sản ba miền tại Nhà hàng Mango bãi biển.",
      notes: "• Giờ phục vụ buffet: 11:30 – 14:00."
    },
    3: {
      id: 3,
      title: "COMBO CÁP TREO + AQUATOPIA + LẶN NGẮM SAN HÔ ĐI BỘ BIỂN",
      category: "combo",
      discountTag: "Trải nghiệm kỳ thú",
      adult: { listedPrice: 1450000, netPrice: 1250000, defaultSelling: 1350000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 1150000, netPrice: 990000, defaultSelling: 1070000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Đi bộ dưới đáy biển ngắm rạn san hô tự nhiên tại công viên san hô Nam Phú Quốc với mũ dưỡng khí chuyên dụng.",
      notes: "• Có thợ lặn chuyên nghiệp đi kèm 1 kèm 1 an toàn tuyệt đối."
    },
    4: {
      id: 4,
      title: "VÉ CÔNG VIÊN NƯỚC AQUATOPIA & LÀNG EXOTICA",
      category: "standard",
      discountTag: "Thử thách mạo hiểm",
      adult: { listedPrice: 400000, netPrice: 350000, defaultSelling: 380000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 300000, netPrice: 260000, defaultSelling: 285000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Trải nghiệm tàu lượn siêu tốc bằng gỗ Mộc Xà Thịnh Nộ và Mắt Đại Bàng tại Làng Exotica đảo Hòn Thơm.",
      notes: "• Thỏa sức chinh phục các trò chơi mạo hiểm số 1 châu Á."
    },
    5: {
      id: 5,
      title: "COMBO GIA ĐÌNH HÒN THƠM (CÁP TREO + AQUATOPIA + BUFFET)",
      category: "combo",
      discountTag: "Gói gia đình B2B",
      adult: { listedPrice: 2100000, netPrice: 1820000, defaultSelling: 1960000, label: "Gia đình", condition: "2 Lớn + 1 Trẻ" },
      child: { listedPrice: 550000, netPrice: 480000, defaultSelling: 520000, label: "Trẻ phụ thu", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Trọn gói cáp treo, công viên nước và suất ăn buffet cho 2 người lớn kèm 1 trẻ em.",
      notes: "• Trẻ em dưới 100cm được miễn phí hoàn toàn."
    },
    6: {
      id: 6,
      title: "VÉ VIP CÁP TREO HÒN THƠM PHÒNG CHỜ RIÊNG & LỐI ĐI ƯU TIÊN",
      category: "combo",
      discountTag: "Đẳng cấp VIP",
      adult: { listedPrice: 400000, netPrice: 340000, defaultSelling: 375000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 300000, netPrice: 255000, defaultSelling: 280000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Sử dụng phòng chờ thương gia tại Ga Ánh Dương và lối đi Fastpass riêng lên cáp treo.",
      notes: "• Phục vụ nước ngọt và trái cây tươi đón khách."
    }
  },

  "offline-asia-park": {
    1: {
      id: 1,
      title: "VÉ VÒNG QUAY MẶT TRỜI SUN WHEEL & TRỌN GÓI TRÒ CHƠI NGOÀI TRỜI",
      category: "standard",
      discountTag: "Bán chạy nhất",
      adult: { listedPrice: 200000, netPrice: 155000, defaultSelling: 180000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 130000, netPrice: 100000, defaultSelling: 115000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Trải nghiệm Vòng quay Mặt Trời Sun Wheel ngắm toàn cảnh sông Hàn và thành phố Đà Nẵng về đêm.",
      notes: "• Chơi không giới hạn tất cả các trò chơi ngoài trời trong công viên."
    },
    2: {
      id: 2,
      title: "COMBO ASIA PARK & THƯỞNG THỨC ẨM THỰC CHỢ ĐÊM DA NANG DOWNTOWN",
      category: "combo",
      discountTag: "Trọn gói ẩm thực",
      adult: { listedPrice: 350000, netPrice: 280000, defaultSelling: 315000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 230000, netPrice: 185000, defaultSelling: 210000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Vé vui chơi trọn gói kèm coupon ẩm thực tại Chợ Đêm Da Nang Downtown sầm uất ven sông Hàn.",
      notes: "• Hơn 100 gian hàng ẩm thực đường phố và đặc sản miền Trung."
    },
    3: {
      id: 3,
      title: "VÉ TÀU LƯỢN SIÊU TỐC QUEEN COBRA & THÁP RƠI TỰ DO",
      category: "standard",
      discountTag: "Thách thức giới hạn",
      adult: { listedPrice: 150000, netPrice: 115000, defaultSelling: 135000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 100000, netPrice: 75000, defaultSelling: 90000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Thử thách tàu lượn dạng treo lớn nhất Việt Nam tốc độ 80km/h và Tháp rơi tự do Golden Sky Tower 47m.",
      notes: "• Tuân thủ nghiêm ngặt chỉ dẫn của nhân viên vận hành an toàn."
    },
    4: {
      id: 4,
      title: "COMBO VÉ VUI CHƠI KHÔNG GIỚI HẠN & SHOW DIỄN RỐI NƯỚC",
      category: "combo",
      discountTag: "Nghệ thuật dân gian",
      adult: { listedPrice: 300000, netPrice: 235000, defaultSelling: 270000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 190000, netPrice: 150000, defaultSelling: 170000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Thưởng thức show múa rối nước và múa rối cạn đặc sắc tại Nhà hát Ánh Trăng trong lòng công viên.",
      notes: "• Suất diễn lúc 19:00 và 20:15 hàng đêm."
    },
    5: {
      id: 5,
      title: "COMBO GIA ĐÌNH DU NGOẠN MONORAIL TRÊN CAO & TRÒ CHƠI TRẺ EM",
      category: "combo",
      discountTag: "Ưu đãi gia đình",
      adult: { listedPrice: 450000, netPrice: 350000, defaultSelling: 400000, label: "Gia đình", condition: "2 Lớn + 1 Trẻ" },
      child: { listedPrice: 120000, netPrice: 95000, defaultSelling: 110000, label: "Trẻ phụ thu", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Chuyến tàu điện một ray Monorail trên cao ngắm nhìn 10 nền văn hóa châu Á thu nhỏ.",
      notes: "• Thích hợp cho gia đình có em nhỏ và người cao tuổi."
    },
    6: {
      id: 6,
      title: "VÉ VIP FASTPASS TRẢI NGHIỆM TẤT CẢ TRÒ CHƠI CẢM GIÁC MẠNH",
      category: "combo",
      discountTag: "Ưu tiên VIP",
      adult: { listedPrice: 250000, netPrice: 195000, defaultSelling: 225000, label: "Người lớn", condition: "Cao trên 1m4" },
      child: { listedPrice: 170000, netPrice: 135000, defaultSelling: 155000, label: "Trẻ em", condition: "Cao từ 1m – 1m4" },
      usageGuide: "• Không xếp hàng chờ đợi tại Vòng quay Sun Wheel và các trò chơi cảm giác mạnh hot nhất.",
      notes: "• Tối ưu thời gian khám phá trọn vẹn Da Nang Downtown."
    }
  }
};

function getSuppliersForDestination(destId) {
  const dest = destinationsDatabase.find(d => d.id === destId);
  const chainLabel = dest ? dest.chainLabel : 'SUNWORLD';
  let partnerName = 'Đối tác Khu du lịch (API)';
  let partnerShort = 'SW';
  let partnerAvatarCls = 'from-amber-400 via-orange-500 to-rose-500 text-white';
  let partnerLogo = '';

  if (chainLabel.includes('SUNWORLD')) {
    partnerName = 'Tập đoàn Sun World';
    partnerShort = 'SW';
    partnerAvatarCls = 'from-amber-400 via-orange-500 to-rose-500 text-white';
    partnerLogo = 'assets/images/brands/sunworld.png';
  } else if (chainLabel.includes('VINWONDERS')) {
    partnerName = 'Tập đoàn VinWonders';
    partnerShort = 'VW';
    partnerAvatarCls = 'from-cyan-500 to-blue-700 text-white';
    partnerLogo = 'assets/images/brands/vinwonders.png';
  } else if (chainLabel.includes('NOVADREAMS')) {
    partnerName = 'Tập đoàn NovaDreams';
    partnerShort = 'ND';
    partnerAvatarCls = 'from-emerald-500 to-teal-700 text-white';
    partnerLogo = 'assets/images/brands/novadreams.png';
  } else if (chainLabel.includes('TTC')) {
    partnerName = 'Tập đoàn TTC World';
    partnerShort = 'TTC';
    partnerAvatarCls = 'from-indigo-500 to-violet-700 text-white';
    partnerLogo = 'assets/images/brands/ttc.png';
  } else if (chainLabel.includes('DAMSEN')) {
    partnerName = 'Công viên Đầm Sen';
    partnerShort = 'DS';
    partnerAvatarCls = 'from-pink-500 to-emerald-600 text-white';
    partnerLogo = 'assets/images/brands/damsen.png';
  } else if (dest) {
    partnerName = `BQL ${dest.name}`;
    partnerShort = dest.name.split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'KDL';
  }

  return [
    {
      id: 'partner',
      name: partnerName,
      shortLabel: partnerShort,
      avatarCls: partnerAvatarCls,
      logo: partnerLogo,
      sourceType: 'API Đối tác KDL',
      badgeCls: 'bg-blue-50 text-blue-700 border-blue-200',
      desc: 'Xuất vé QR trực tiếp từ KDL.'
    },
    {
      id: 'techera',
      name: 'Nhà cung cấp Techera',
      shortLabel: 'TC',
      avatarCls: 'from-slate-800 to-slate-950 text-brand-400',
      logo: '',
      sourceType: 'Kho nội bộ Techera',
      badgeCls: 'bg-orange-50 text-brand-600 border-brand-200',
      desc: 'Kho nội bộ, chiết khấu ưu đãi.'
    }
  ];
}
