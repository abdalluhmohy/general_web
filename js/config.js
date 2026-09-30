/* ============================================================
   Gold Nile — Configuration
   الإعدادات + البيانات الافتراضية + الثوابت
   ============================================================ */

(function(){
  'use strict';

  /* ============================================================
     🔑 Supabase — عدّل هذه القيم بمعلومات مشروعك
     ============================================================ */
  window.GN_CONFIG = {

    SUPABASE_URL: 'https://nhktkdypmslwpkriavan.supabase.co',
    SUPABASE_KEY: 'sb_publishable_55-H-XB1HlWBG2r4CUZ8uw_QYxEwlMi',

    // مسار الخادم (Render) — اتركه فارغًا للتطوير المحلي
    API_URL: '',

    // معلومات عامة
    APP_NAME: 'ذهب النيل للأعمال المتكاملة المحدودة',
    APP_NAME_EN: 'Zaheb Alnile for Integrated Services Ltd.',
    APP_SHORT: 'ذهب النيل',
    DEFAULT_LANG: 'ar',
    VERSION: '1.0.0',

    // مفاتيح التخزين المحلي
    STORAGE: {
      LANG: 'gn_lang',
      SESSION: 'gn_session',
      ADMIN_MODE: 'gn_admin_mode',
      NOTIF_READ: 'gn_notif_read'
    },

    // جدول قاعدة البيانات
    TABLE_STATE: 'dashboard_state',
    STATE_ID: 1,

    // العملات المدعومة
    CURRENCIES: ['SDG','USD','SAR','OMR','AED','EUR','EGP'],

    CURRENCY_FLAGS: {
      SDG: '🇸🇩',
      USD: '🇺🇸',
      SAR: '🇸🇦',
      OMR: '🇴🇲',
      AED: '🇦🇪',
      EUR: '🇪🇺',
      EGP: '🇪🇬'
    }
  };

  /* ============================================================
     ✔ تحقق أولي من الإعدادات الحرجة
     ============================================================ */
  (function validateConfig(){
    var cfg = window.GN_CONFIG;
    if (!cfg.SUPABASE_URL || cfg.SUPABASE_URL.indexOf('supabase.co') === -1) {
      console.warn('[config] ⚠️ SUPABASE_URL غير صالح أو مفقود');
    }
    if (!cfg.SUPABASE_KEY || cfg.SUPABASE_KEY.length < 20) {
      console.warn('[config] ⚠️ SUPABASE_KEY مفقود أو قصير جدًا');
    }
    if (cfg.SUPABASE_KEY && cfg.SUPABASE_KEY.indexOf('service_role') !== -1) {
      console.error('[config] 🚨 خطر أمني: لا تضع service_role key في الواجهة!');
    }
  })();

  /* ============================================================
     📦 البيانات الافتراضية — أول تشغيل فقط
     ============================================================ */
  window.GN_DEFAULT_DATA = {

    // ============ الإعدادات العامة ============
    settings: {
      company_name: 'ذهب النيل للأعمال المتكاملة المحدودة',
      company_short: 'ذهب النيل',
      company_tagline: 'للأعمال المتكاملة المحدودة',
      company_status: 'مرحلة ترخيص معمل فحص الذهب وتجهيز المعدات',

      // الاستثمار والرأسمال
      capital_total: 66000,
      capital_cash: 20000,
      capital_equipment: 46000,
      capital_debt: 5000,
      recovered_total: 0,

      // نسب الملكية
      ownership_phase1: { oman: 50, egypt: 5, owner: 45 },
      ownership_phase2: { oman: 30, egypt: 5, owner: 65 },

      // الشعار والهوية
      logo_url: '',
      favicon_url: '',

      // سعر الصرف الافتراضي
      default_sdg_rate: 2500,

      // بيانات التواصل
      contact: {
        email: 'abdalluh.albaz@gmail.com',
        phone: '00249101794016',
        whatsapp: ''
      },

      // روابط السوشيال ميديا
      social: {
        linkedin: '',
        twitter: '',
        tiktok: '',
        youtube: '',
        instagram: '',
        facebook: ''
      }
    },

    // ============ الصفحة العامة ============
    public: {
      brand: {
        name: 'ذهب النيل',
        tagline: 'للأعمال المتكاملة المحدودة'
      },
      hero: {
        kicker: 'شركة سودانية جديدة · قطاع التعدين والذهب',
        title: 'حيث يلتقي <em>عراقة الذهب</em> بدقة التقنية الحديثة',
        lead: 'ذهب النيل للأعمال المتكاملة المحدودة — شركة سودانية متخصصة في فحص الذهب والمعادن بأحدث أجهزة فيشر 520، والبيع والشراء، وتوظيف تقنيات الذكاء الاصطناعي في التعدين وجيولوجيا الأرض.',
        cta1: 'تعرّف على خدماتنا',
        cta2: 'تابع أخبارنا'
      },
      vision: {
        tag: 'رؤيتنا',
        title: 'أن نكون المرجع الموثوق في فحص وتقييم الذهب بالسودان',
        text: 'تسعى <strong>ذهب النيل للأعمال المتكاملة المحدودة</strong> إلى أن تكون المرجع الموثوق في فحص وتقييم الذهب والمعادن بالسودان، عبر <strong>معايير عالمية</strong> وأجهزة معتمدة وتقنيات ذكاء اصطناعي متقدمة، تخدم المعدّن والمشتري والمستثمر على حد سواء.'
      },
      services: {
        tag: 'خدماتنا',
        title: 'ثلاث خدمات أساسية بمعايير احترافية',
        sub: 'نغطي رحلة الذهب من الأرض إلى السوق، بتقنيات متقدمة وفريق متخصص.'
      },
      advantages: {
        tag: 'لماذا ذهب النيل؟',
        title: 'ما يميزنا عن غيرنا'
      },
      board: {
        tag: 'مجلس الإدارة',
        title: 'قيادة تجمع ثلاث خبرات دولية',
        sub: 'اضغط على أي بطاقة لعرض الاسم والمنصب وكلمة العضو.'
      },
      news: {
        tag: 'الأخبار والمقالات',
        title: 'آخر مستجدات الشركة والقطاع',
        sub: 'مقالات وتحديثات يكتبها فريق ذهب النيل.'
      },
      social: {
        title: 'تابعنا على منصاتنا',
        sub: 'آخر الأخبار والتحديثات عبر حساباتنا الرسمية.'
      },
      contact: {
        tag: 'تواصل معنا',
        title: 'نسعد بتواصلك',
        sub: 'للاستفسارات والشراكات، تواصل معنا عبر أي قناة.'
      },
      cta: {
        title: 'بوابة الشركاء',
        text: 'دخول خاص لأعضاء مجلس الإدارة والشركاء الموثقين، للاطلاع على لوحة المتابعة الكاملة.',
        btn: 'دخول الشركاء'
      },
      footer: {
        about: 'شركة سودانية متخصصة في فحص الذهب والمعادن، والبيع والشراء، وتقنيات الذكاء الاصطناعي في التعدين.',
        rights: '© 2026 ذهب النيل للأعمال المتكاملة المحدودة · جميع الحقوق محفوظة'
      }
    },

    // ============ قوائم المحتوى ============
    services: [],
    advantages: [],
    board: [],
    news: [],

    // ============ الداشبورد ============
    dashboard: {
      banks: [],
      transfers: [],
      gold_purchases: [],
      gold_sales: [],
      gold_agents: [],

      investment: {
        capital_total: 66000,
        capital_cash: 20000,
        capital_equipment: 46000,
        capital_debt: 5000,
        recovered_total: 0,
        payments: []
      },
      fixed_expenses: { daily: [], monthly: [], yearly: [] },
      transactions: [],
      exchange_rates: [],

      departments: [],
      employees: [],
      attendance: [],
      payroll: [],
      leaves: [],
      warnings: [],
      bonuses: [],
      tasks: [],

      equipment: [],
      equipment_purchases: [],
      maintenance: [],

      documents: [],
      letters: [],

      users: [],
      notifications: [],
      activity_log: []
    }
  };

  /* ============================================================
     🕐 ثوابت عامة
     ============================================================ */
  window.GN_CONST = {

    // حالات الموظف
    EMP_STATUS: {
      active:   { ar:'على رأس العمل',  en:'Active',     color:'ok' },
      leave:    { ar:'إجازة',          en:'On Leave',   color:'n'  },
      stopped:  { ar:'موقوف',          en:'Suspended',  color:'w'  },
      resigned: { ar:'استقال',         en:'Resigned',   color:'n'  },
      fired:    { ar:'مُفصول',         en:'Terminated', color:'b'  }
    },

    // حالات المهمة
    TASK_STATUS: {
      new:        { ar:'جديدة',       en:'New',         color:'n'  },
      inprogress: { ar:'قيد التنفيذ', en:'In Progress', color:'w'  },
      onhold:     { ar:'معلّقة',      en:'On Hold',     color:'w'  },
      done:       { ar:'منجزة',       en:'Done',        color:'ok' },
      postponed:  { ar:'مؤجلة',       en:'Postponed',   color:'n'  },
      cancelled:  { ar:'ملغاة',       en:'Cancelled',   color:'b'  }
    },

    // أولويات المهمة
    TASK_PRIORITY: {
      normal: { ar:'عادية', en:'Normal', color:'n' },
      high:   { ar:'مهمة',  en:'High',   color:'w' },
      urgent: { ar:'عاجلة', en:'Urgent', color:'b' }
    },

    // حالات الترخيص
    LICENSE_STATUS: {
      valid:    { ar:'ساري',              en:'Valid',         color:'ok' },
      soon:     { ar:'قارب على الانتهاء', en:'Expiring Soon', color:'w'  },
      urgent:   { ar:'ينتهي قريبًا',      en:'Urgent',        color:'b'  },
      expired:  { ar:'منتهي',             en:'Expired',       color:'b'  },
      renewing: { ar:'قيد التجديد',       en:'Renewing',      color:'n'  }
    },

    // حالات المعدة
    EQUIP_STATUS: {
      planned:  { ar:'مخطط',  en:'Planned',  color:'n'  },
      ordered:  { ar:'مطلوب', en:'Ordered',  color:'w'  },
      received: { ar:'مستلم', en:'Received', color:'ok' },
      broken:   { ar:'معطل',  en:'Broken',   color:'b'  }
    },

    // منصات السوشيال
    SOCIALS: [
      { key:'linkedin',  name:'LinkedIn',  color:'#0A66C2' },
      { key:'twitter',   name:'Twitter',   color:'#000000' },
      { key:'tiktok',    name:'TikTok',    color:'#FF0050' },
      { key:'youtube',   name:'YouTube',   color:'#FF0000' },
      { key:'instagram', name:'Instagram', color:'#E4405F' },
      { key:'facebook',  name:'Facebook',  color:'#1877F2' }
    ],

    // العملات
    CURRENCIES: [
      { code:'SDG', name:'جنيه سوداني',  symbol:'ج.س', flag:'🇸🇩' },
      { code:'USD', name:'دولار أمريكي', symbol:'$',    flag:'🇺🇸' },
      { code:'SAR', name:'ريال سعودي',   symbol:'ر.س', flag:'🇸🇦' },
      { code:'OMR', name:'ريال عماني',   symbol:'ر.ع', flag:'🇴🇲' },
      { code:'AED', name:'درهم إماراتي', symbol:'د.إ', flag:'🇦🇪' },
      { code:'EUR', name:'يورو',         symbol:'€',    flag:'🇪🇺' },
      { code:'EGP', name:'جنيه مصري',    symbol:'ج.م', flag:'🇪🇬' }
    ]
  };

})();