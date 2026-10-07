/* ============================================================
   Gold Nile — Dashboard / Reports Center
   12 reports · Shared filters · Search · Print · CSV Export
   + Brokerages report
   ============================================================ */
(function(){
'use strict';

var GN = window.GN = window.GN || {};

GN.reportsTab = 'cycles';
GN.reportsFilter = { date_from: '', date_to: '' };
GN._reportDataCache = {};

/* ============================================================
   Section
   ============================================================ */
GN.sections.reports = function(){
  var tabs = [
    { key:'cycles',     label: GN.t('repTabCycles') },
    { key:'brokerages', label: GN.t('repTabBrokerages') },
    { key:'geography',  label: GN.t('repTabGeography') },
    { key:'agents',     label: GN.t('repTabAgents') },
    { key:'inventory',  label: GN.t('repTabInventory') },
    { key:'expenses',   label: GN.t('repTabExpenses') },
    { key:'profits',    label: GN.t('repTabProfits') },
    { key:'taxes',      label: GN.t('repTabTaxes') },
    { key:'performance',label: GN.t('repTabPerformance') },
    { key:'company',    label: GN.t('repTabCompany') },
    { key:'usd',        label: GN.t('repTabUsd') },
    { key:'fx',         label: GN.t('repTabFx') }
  ];

  var active = GN.reportsTab || 'cycles';
  var f = GN.reportsFilter;

  var html = '<div class="fin-head"><div>' +
    '<h2>' + GN.navIcon('chart') + ' ' + GN.esc(GN.t('repTitle')) + '</h2>' +
    '<span class="sub">' + GN.esc(GN.t('repSub')) + '</span></div>' +
    '<div style="display:flex;gap:6px;flex-wrap:wrap">' +
      '<button class="btn btn-sec btn-sm" data-act="rep-print">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg> ' +
        GN.esc(GN.t('repPrint')) + '</button>' +
      '<button class="btn btn-gold btn-sm" data-act="rep-export">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg> ' +
        GN.esc(GN.t('repExport')) + '</button>' +
    '</div></div>';

  /* Filters */
  html += '<div class="fin-filters" style="grid-template-columns:repeat(4,1fr)">' +
    '<div class="ff-field"><label>' + GN.esc(GN.t('cyFilterFrom')) + '</label>' +
      '<input type="date" id="rep_from" value="' + GN.escAttr(f.date_from) + '"></div>' +
    '<div class="ff-field"><label>' + GN.esc(GN.t('cyFilterTo')) + '</label>' +
      '<input type="date" id="rep_to" value="' + GN.escAttr(f.date_to) + '"></div>' +
    '<div class="ff-field"><label>&nbsp;</label>' +
      '<div style="display:flex;gap:6px">' +
        '<button class="btn btn-pri btn-sm" data-act="rep-apply" style="flex:1">' + GN.esc(GN.t('cyFilterApply')) + '</button>' +
        '<button class="btn btn-sec btn-sm" data-act="rep-clear" style="flex:1">' + GN.esc(GN.t('cyFilterClear')) + '</button>' +
      '</div></div>' +
    '<div class="ff-field"><label>&nbsp;</label>' +
      '<button class="btn btn-sec btn-sm" data-act="rep-quick-month" style="width:100%">' + GN.esc(GN.t('repQuickMonth')) + '</button></div>' +
  '</div>';

  /* Search bar */
  html += '<div class="rep-search-bar">' +
    '<span class="rep-search-ic">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>' +
    '</span>' +
    '<input type="text" id="repSearch" placeholder="' + GN.escAttr(GN.t('repSearchPh')) + '">' +
    '<span class="rep-search-count" id="repSearchCount"></span>' +
    '<button type="button" class="rep-search-clear" id="repSearchClear" title="' + GN.escAttr(GN.t('repSearchClear')) + '">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
    '</button>' +
  '</div>';

  /* Tabs */
  html += '<div class="pay-tabs" style="flex-wrap:wrap">' + tabs.map(function(t){
    var on = (t.key === active) ? ' on' : '';
    return '<button class="pay-tab' + on + '" data-rep-tab="' + t.key + '">' + GN.esc(t.label) + '</button>';
  }).join('') + '</div>';

  /* Content */
  html += '<div id="repContent"><div class="empty"><div class="ic">' + GN.navIcon('chart') + '</div>' +
    '<h4>' + GN.esc(GN.t('loading')) + '</h4></div></div>';

  setTimeout(GN.runReport, 100);
  return html;
};

/* ============================================================
   Run current report
   ============================================================ */
GN.runReport = function(){
  var box = document.getElementById('repContent');
  if (!box) return;
  box.innerHTML = '<div class="empty"><div class="ic">' + GN.navIcon('chart') + '</div>' +
    '<h4>' + GN.esc(GN.t('loading')) + '</h4></div>';

  var fn = GN.reportBuilders[GN.reportsTab];
  if (!fn){
    box.innerHTML = '<div class="empty"><h4>—</h4></div>';
    return;
  }
  fn().then(function(html){
    if (box) box.innerHTML = html;
    GN.bindReportActions();

    var inp = document.getElementById('repSearch');
    if (inp) inp.value = '';
    var cnt = document.getElementById('repSearchCount');
    if (cnt){ cnt.textContent = ''; cnt.classList.remove('has-results','no-results'); }
  }).catch(function(err){
    console.error('[report]', err);
    if (box) box.innerHTML = '<div class="empty"><h4>خطأ في التقرير</h4><p>' + GN.esc(err.message || '') + '</p></div>';
  });
};

/* ============================================================
   Helpers
   ============================================================ */
GN.repDateRange = function(){
  var f = GN.reportsFilter;
  return { from: f.date_from, to: f.date_to };
};

GN.repApplyFilters = function(q, dateField){
  var r = GN.repDateRange();
  if (r.from) q = q.gte(dateField, r.from);
  if (r.to) q = q.lte(dateField, r.to + 'T23:59:59');
  return q;
};

GN.repKpis = function(items){
  return '<div class="kpi-grid" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">' +
    items.map(function(it){
      return '<div class="kpi ' + (it.hl ? 'hl' : '') + '">' +
        '<div class="top"><span class="ic ' + (it.color || '') + '">' + GN.navIcon(it.icon || 'chart') + '</span></div>' +
        '<div class="lbl">' + GN.esc(it.lbl) + '</div>' +
        '<div class="val">' + (it.valHtml || GN.formatNum(it.val)) + '</div>' +
        (it.sub ? '<div class="sub">' + GN.esc(it.sub) + '</div>' : '') +
      '</div>';
    }).join('') + '</div>';
};

GN.repTable = function(headers, rows, opts){
  opts = opts || {};
  if (!rows.length){
    return '<div class="card"><div class="empty"><div class="ic">' + GN.navIcon('chart') + '</div>' +
      '<h4>' + GN.esc(opts.empty || GN.t('noData')) + '</h4></div></div>';
  }
  return '<div class="card"><div class="card-head">' +
    '<h3>' + GN.navIcon('chart') + ' ' + GN.esc(opts.title || '') + '</h3>' +
    '<span class="ff-count">' + rows.length + '</span></div>' +
    '<div class="table-wrap"><table><thead><tr>' +
    headers.map(function(h){ return '<th>' + GN.esc(h) + '</th>'; }).join('') +
    '</tr></thead><tbody>' + rows.map(function(r){
      return '<tr>' + r.map(function(c, i){
        var cls = (i > 0 && typeof c === 'string' && /^-?[\d,.]+$/.test(c.replace(/,/g,''))) ? ' class="num"' : '';
        return '<td' + cls + '>' + c + '</td>';
      }).join('') + '</tr>';
    }).join('') + '</tbody></table></div></div>';
};

/* ============================================================
   Report Builders
   ============================================================ */
GN.reportBuilders = {};

/* ---------- 1) CYCLES ---------- */
GN.reportBuilders.cycles = function(){
  var q = GN.supa.from('gold_cycles').select('*');
  q = GN.repApplyFilters(q, 'start_date');
  return q.order('start_date', { ascending: false }).then(function(res){
    if (res.error) throw res.error;
    var data = res.data || [];
    GN._reportDataCache.cycles = data;

    var totalBought = 0, totalSold = 0;
    var openCount = 0, closedCount = 0;
    data.forEach(function(c){
      totalBought += Number(c.quantity_grams || 0);
      totalSold += Number(c.sold_grams || 0);
      if (c.status === 'open' || c.status === 'partial') openCount++;
      else closedCount++;
    });

    var kpis = GN.repKpis([
      { lbl: 'عدد الدورات', val: data.length, icon: 'gold', hl: true },
      { lbl: 'مفتوحة', val: openCount, icon: 'check', color: 'y' },
      { lbl: 'مغلقة', val: closedCount, icon: 'check', color: 'ok' },
      { lbl: 'إجمالي الجرامات المشتراة', valHtml: GN.formatNum(totalBought, 2) + 'g', icon: 'gold', color: 'g' },
      { lbl: 'إجمالي الجرامات المبيعة', valHtml: GN.formatNum(totalSold, 2) + 'g', icon: 'gold', color: 'g' }
    ]);

    var rows = data.map(function(c){
      var statusLbl = c.status === 'open' ? 'مفتوحة'
                    : c.status === 'partial' ? 'بيع جزئي'
                    : c.status === 'closed' ? 'مغلقة'
                    : 'مُرحّلة';
      var days = c.end_date
        ? Math.ceil((new Date(c.end_date) - new Date(c.start_date)) / 86400000)
        : Math.ceil((Date.now() - new Date(c.start_date).getTime()) / 86400000);
      return [
        '<bdi dir="ltr" style="font-family:monospace">' + GN.esc(c.code) + '</bdi>',
        GN.esc(GN.formatDate(c.start_date)),
        c.end_date ? GN.esc(GN.formatDate(c.end_date)) : '—',
        days + ' / ' + (c.target_days || 0),
        GN.formatNum(c.quantity_grams, 2) + 'g',
        GN.formatNum(c.sold_grams, 2) + 'g',
        GN.formatNum(c.remaining_grams, 2) + 'g',
        GN.formatMoneyPlain(c.purchase_total, 'SDG'),
        GN.esc(statusLbl)
      ];
    });

    return kpis + GN.repTable(
      ['الكود', 'البداية', 'النهاية', 'أيام (فعلي/هدف)', 'الكمية', 'المُباع', 'المتبقي', 'إجمالي الشراء', 'الحالة'],
      rows,
      { title: 'تقرير الدورات', empty: 'لا توجد دورات في هذه الفترة' }
    );
  });
};

/* ---------- 2) BROKERAGES ---------- */
GN.reportBuilders.brokerages = function(){
  var q = GN.supa.from('gold_brokerages').select('*');
  q = GN.repApplyFilters(q, 'broker_date');
  return q.order('broker_date', { ascending: false }).limit(500).then(function(res){
    if (res.error) throw res.error;
    var data = res.data || [];
    GN._reportDataCache.brokerages = data;

    var totalAmount = 0, totalComm = 0, totalTax = 0, totalNet = 0;
    var saleCount = 0, purchaseCount = 0, otherCount = 0;

    data.forEach(function(b){
      totalAmount += Number(b.amount || 0);
      totalComm += Number(b.commission_amount || 0);
      totalTax += Number(b.taxes_fees || 0);
      totalNet += Number(b.net_profit || 0);
      if (b.type === 'sale') saleCount++;
      else if (b.type === 'purchase') purchaseCount++;
      else otherCount++;
    });

    var kpis = GN.repKpis([
      { lbl: 'عدد الوساطات', val: data.length, icon: 'chart', hl: true },
      { lbl: 'إجمالي المبالغ', valHtml: GN.formatNum(totalAmount) + ' SDG', icon: 'dollar', color: 'g' },
      { lbl: 'إجمالي العمولات', valHtml: GN.formatNum(totalComm) + ' SDG', icon: 'wallet', color: 'ok' },
      { lbl: 'إجمالي الضرائب', valHtml: GN.formatNum(totalTax) + ' SDG', icon: 'receipt', color: 'b' },
      { lbl: 'صافي أرباح الوساطة', valHtml: GN.formatNum(totalNet) + ' SDG', icon: 'check', color: 'ok' },
      { lbl: 'بيع / شراء / أخرى', valHtml: saleCount + ' / ' + purchaseCount + ' / ' + otherCount, icon: 'chart' }
    ]);

    var typeLbls = { sale: 'بيع', purchase: 'شراء', other: 'أخرى' };

    var rows = data.map(function(b){
      var typeLbl = typeLbls[b.type] || b.type;
      var commTypeLbl = b.commission_type === 'percent'
        ? GN.formatNum(b.commission_value, 2) + '%'
        : GN.formatMoneyPlain(b.commission_value, 'SDG');

      return [
        '<bdi dir="ltr" style="font-family:monospace;font-size:11.5px">' + GN.esc(b.code || '—') + '</bdi>',
        GN.esc(GN.formatDate(b.broker_date)),
        GN.esc(typeLbl),
        GN.esc((b.reason || '—').slice(0, 60)),
        GN.formatMoneyPlain(b.amount, b.currency || 'SDG'),
        commTypeLbl,
        GN.formatMoneyPlain(b.commission_amount, 'SDG'),
        GN.formatMoneyPlain(b.taxes_fees, 'SDG'),
        '<b style="color:var(--ok)">' + GN.formatMoneyPlain(b.net_profit, 'SDG') + '</b>'
      ];
    });

    return kpis + GN.repTable(
      ['الكود', 'التاريخ', 'النوع', 'السبب', 'المبلغ الإجمالي', 'العمولة', 'قيمة العمولة', 'الضرائب', 'صافي الربح'],
      rows,
      { title: 'تقرير الوساطات', empty: 'لا توجد وساطات في هذه الفترة' }
    );
  });
};

/* ---------- 3) GEOGRAPHY ---------- */
GN.reportBuilders.geography = function(){
  return Promise.all([
    (function(){ var q = GN.supa.from('gold_cycles').select('quantity_grams,purchase_total,purchase_state_id,purchase_city_id,purchase_place_id'); return GN.repApplyFilters(q, 'start_date'); })(),
    GN.supa.from('locations').select('id,name,type'),
    (function(){ var q = GN.supa.from('gold_cycle_sales').select('quantity_grams,selling_total,net_profit,sale_state_id,sale_city_id,sale_place_id'); return GN.repApplyFilters(q, 'sale_date'); })()
  ]).then(function(res){
    var cycles = res[0].error ? [] : (res[0].data || []);
    var locations = res[1].error ? [] : (res[1].data || []);
    var sales = res[2].error ? [] : (res[2].data || []);

    var locMap = {};
    locations.forEach(function(l){ locMap[l.id] = l.name; });

    var byCity = {};
    cycles.forEach(function(c){
      var cid = c.purchase_city_id || 'unknown';
      var key = 'شراء:' + (locMap[cid] || '—');
      if (!byCity[key]) byCity[key] = { grams: 0, total: 0, profit: 0, type: 'شراء', city: locMap[cid] || '—' };
      byCity[key].grams += Number(c.quantity_grams || 0);
      byCity[key].total += Number(c.purchase_total || 0);
    });

    sales.forEach(function(s){
      var cid = s.sale_city_id || 'unknown';
      var key = 'بيع:' + (locMap[cid] || '—');
      if (!byCity[key]) byCity[key] = { grams: 0, total: 0, profit: 0, type: 'بيع', city: locMap[cid] || '—' };
      byCity[key].grams += Number(s.quantity_grams || 0);
      byCity[key].total += Number(s.selling_total || 0);
      byCity[key].profit += Number(s.net_profit || 0);
    });

    var rows = Object.keys(byCity).map(function(k){
      var x = byCity[k];
      return [
        GN.esc(x.type),
        GN.esc(x.city),
        GN.formatNum(x.grams, 2) + 'g',
        GN.formatMoneyPlain(x.total, 'SDG'),
        x.profit !== 0 ? '<span style="color:' + (x.profit >= 0 ? 'var(--ok)' : 'var(--bad)') + ';font-weight:700">' + (x.profit >= 0 ? '+' : '') + GN.formatMoneyPlain(x.profit, 'SDG') + '</span>' : '—'
      ];
    });

    GN._reportDataCache.geography = rows;

    return GN.repTable(
      ['النوع', 'المدينة', 'الكمية', 'الإجمالي', 'صافي الربح'],
      rows,
      { title: 'التقرير الجغرافي', empty: 'لا توجد بيانات جغرافية' }
    );
  });
};

/* ---------- 4) AGENTS ---------- */
GN.reportBuilders.agents = function(){
  return Promise.all([
    GN.supa.from('agents').select('*').order('name'),
    (function(){ var q = GN.supa.from('gold_cycles').select('purchase_agent_id,purchase_commission_amount'); return GN.repApplyFilters(q, 'start_date'); })(),
    (function(){ var q = GN.supa.from('gold_cycle_sales').select('sale_agent_id,sale_commission_amount,profit_status'); return GN.repApplyFilters(q, 'sale_date'); })()
  ]).then(function(res){
    var agents = res[0].error ? [] : (res[0].data || []);
    var cycles = res[1].error ? [] : (res[1].data || []);
    var sales = res[2].error ? [] : (res[2].data || []);

    var stats = {};
    agents.forEach(function(a){
      stats[a.id] = { name: a.name, code: a.code, buyOps: 0, sellOps: 0, buyComm: 0, sellComm: 0, pending: 0, realized: 0 };
    });

    cycles.forEach(function(c){
      if (c.purchase_agent_id && stats[c.purchase_agent_id]){
        stats[c.purchase_agent_id].buyOps++;
        var amt = Number(c.purchase_commission_amount || 0);
        stats[c.purchase_agent_id].buyComm += amt;
        stats[c.purchase_agent_id].pending += amt;
      }
    });

    sales.forEach(function(s){
      if (s.sale_agent_id && stats[s.sale_agent_id]){
        stats[s.sale_agent_id].sellOps++;
        var amt = Number(s.sale_commission_amount || 0);
        stats[s.sale_agent_id].sellComm += amt;
        if (s.profit_status === 'realized') stats[s.sale_agent_id].realized += amt;
        else stats[s.sale_agent_id].pending += amt;
      }
    });

    var rows = agents.map(function(a){
      var st = stats[a.id];
      var total = st.buyComm + st.sellComm;
      return [
        '<bdi dir="ltr" style="font-family:monospace;font-size:11.5px">' + GN.esc(a.code) + '</bdi>',
        GN.esc(a.name),
        GN.formatNum(st.buyOps) + ' / ' + GN.formatNum(st.sellOps),
        GN.formatMoneyPlain(st.buyComm, 'SDG'),
        GN.formatMoneyPlain(st.sellComm, 'SDG'),
        '<b>' + GN.formatMoneyPlain(total, 'SDG') + '</b>',
        '<span style="color:var(--warn)">' + GN.formatMoneyPlain(st.pending, 'SDG') + '</span>',
        '<span style="color:var(--ok)">' + GN.formatMoneyPlain(st.realized, 'SDG') + '</span>'
      ];
    });

    GN._reportDataCache.agents = rows;

    var totalPending = 0, totalRealized = 0;
    agents.forEach(function(a){
      totalPending += stats[a.id].pending;
      totalRealized += stats[a.id].realized;
    });

    var kpis = GN.repKpis([
      { lbl: 'عدد المناديب', val: agents.length, icon: 'users', hl: true },
      { lbl: 'عمولات معلقة', valHtml: GN.formatNum(totalPending) + ' SDG', icon: 'dollar', color: 'y' },
      { lbl: 'عمولات محققة', valHtml: GN.formatNum(totalRealized) + ' SDG', icon: 'check', color: 'ok' }
    ]);

    return kpis + GN.repTable(
      ['الكود', 'الاسم', 'شراء / بيع', 'عمولة شراء', 'عمولة بيع', 'الإجمالي', 'معلّق', 'محقق'],
      rows,
      { title: 'تقرير المناديب', empty: 'لا يوجد مناديب' }
    );
  });
};

/* ---------- 5) INVENTORY ---------- */
GN.reportBuilders.inventory = function(){
  return Promise.all([
    (function(){ var q = GN.supa.from('gold_inventory').select('*'); return GN.repApplyFilters(q, 'entry_date'); })(),
    (function(){ var q = GN.supa.from('inventory_sales').select('*'); return GN.repApplyFilters(q, 'sale_date'); })()
  ]).then(function(res){
    var inv = res[0].error ? [] : (res[0].data || []);
    var sales = res[1].error ? [] : (res[1].data || []);

    var totalG = 0, totalValue = 0, totalSold = 0;
    inv.forEach(function(i){
      totalG += Number(i.remaining_grams || 0);
      totalValue += Number(i.remaining_grams || 0) * Number(i.cost_per_gram || 0);
    });
    sales.forEach(function(s){
      totalSold += Number(s.quantity_grams || 0);
    });

    var kpis = GN.repKpis([
      { lbl: 'عدد القطع', val: inv.length, icon: 'box', hl: true },
      { lbl: 'الجرامات المتبقية', valHtml: GN.formatNum(totalG, 2) + 'g', icon: 'gold', color: 'g' },
      { lbl: 'قيمة المخزون', valHtml: GN.formatNum(totalValue) + ' SDG', icon: 'dollar', color: 'y' },
      { lbl: 'المُباع من المخزون', valHtml: GN.formatNum(totalSold, 2) + 'g', icon: 'check', color: 'ok' }
    ]);

    var rows = inv.map(function(i){
      var statusLbl = i.status === 'available' ? 'متاح' : i.status === 'partial' ? 'جزئي' : 'مُباع';
      var val = Number(i.remaining_grams || 0) * Number(i.cost_per_gram || 0);
      return [
        GN.esc(GN.formatDate(i.entry_date)),
        GN.esc(i.karat || '—'),
        GN.formatNum(i.weight_grams, 2) + 'g',
        GN.formatNum(i.remaining_grams, 2) + 'g',
        GN.formatMoneyPlain(i.cost_per_gram, 'SDG'),
        GN.formatMoneyPlain(val, 'SDG'),
        GN.esc(statusLbl)
      ];
    });

    GN._reportDataCache.inventory = rows;

    return kpis + GN.repTable(
      ['تاريخ الإدخال', 'العيار', 'الوزن الأصلي', 'المتبقي', 'التكلفة/g', 'القيمة', 'الحالة'],
      rows,
      { title: 'تقرير المخزون', empty: 'المخزون فارغ' }
    );
  });
};

/* ---------- 6) EXPENSES ---------- */
GN.reportBuilders.expenses = function(){
  return Promise.all([
    (function(){ var q = GN.supa.from('expenses').select('*'); return GN.repApplyFilters(q, 'expense_date'); })(),
    GN.supa.from('expense_categories').select('id,name_ar')
  ]).then(function(res){
    var expenses = res[0].error ? [] : (res[0].data || []);
    var cats = res[1].error ? [] : (res[1].data || []);

    var catMap = {};
    cats.forEach(function(c){ catMap[c.id] = c.name_ar; });

    var total = 0, byCat = {};
    expenses.forEach(function(e){
      var amt = Number(e.amount || 0);
      total += amt;
      var cn = catMap[e.category_id] || 'غير مصنّف';
      byCat[cn] = (byCat[cn] || 0) + amt;
    });

    var kpis = GN.repKpis([
      { lbl: 'عدد المصروفات', val: expenses.length, icon: 'receipt', hl: true },
      { lbl: 'الإجمالي', valHtml: GN.formatNum(total) + ' SDG', icon: 'dollar', color: 'y' }
    ]);

    var catRows = Object.keys(byCat).sort(function(a, b){ return byCat[b] - byCat[a]; }).map(function(k){
      var pct = total > 0 ? ((byCat[k] / total) * 100).toFixed(1) : 0;
      return [GN.esc(k), GN.formatMoneyPlain(byCat[k], 'SDG'), pct + '%'];
    });

    var catTable = GN.repTable(
      ['التصنيف', 'الإجمالي', 'النسبة'],
      catRows,
      { title: 'ملخص حسب التصنيف', empty: 'لا توجد بيانات' }
    );

    var rows = expenses.map(function(e){
      return [
        GN.esc(GN.formatDate(e.expense_date)),
        GN.esc(catMap[e.category_id] || '—'),
        GN.esc(e.party_name || '—'),
        GN.esc((e.description || '').slice(0, 60)),
        GN.formatMoneyPlain(e.amount, e.currency || 'SDG'),
        GN.esc(e.status === 'paid' ? 'مدفوع' : e.status === 'pending' ? 'معلّق' : 'ملغى')
      ];
    });

    GN._reportDataCache.expenses = rows;

    return kpis + catTable + GN.repTable(
      ['التاريخ', 'التصنيف', 'الطرف', 'الوصف', 'المبلغ', 'الحالة'],
      rows,
      { title: 'تفاصيل المصروفات', empty: 'لا توجد مصروفات في هذه الفترة' }
    );
  });
};

/* ---------- 7) PROFITS ---------- */
GN.reportBuilders.profits = function(){
  return Promise.all([
    (function(){ var q = GN.supa.from('gold_cycle_sales').select('*'); return GN.repApplyFilters(q, 'sale_date'); })(),
    (function(){ var q = GN.supa.from('inventory_sales').select('*'); return GN.repApplyFilters(q, 'sale_date'); })(),
    (function(){ var q = GN.supa.from('gold_brokerages').select('*'); return GN.repApplyFilters(q, 'broker_date'); })()
  ]).then(function(res){
    var cycleSales = res[0].error ? [] : (res[0].data || []);
    var invSales = res[1].error ? [] : (res[1].data || []);
    var brokerages = res[2].error ? [] : (res[2].data || []);

    var pending = 0, realized = 0, totalG = 0, grossProfit = 0, totalRevenue = 0;
    var all = cycleSales.concat(invSales);

    all.forEach(function(s){
      var p = Number(s.net_profit || 0);
      if (s.profit_status === 'realized') realized += p;
      else pending += p;
      totalG += Number(s.quantity_grams || 0);
      grossProfit += Number(s.gross_profit || 0);
      totalRevenue += Number(s.selling_total || 0);
    });

    /* Brokerage profits */
    var brokerProfit = 0;
    brokerages.forEach(function(b){ brokerProfit += Number(b.net_profit || 0); });

    var kpis = GN.repKpis([
      { lbl: 'إجمالي الإيراد', valHtml: GN.formatNum(totalRevenue) + ' SDG', icon: 'dollar', hl: true },
      { lbl: 'الربح الإجمالي', valHtml: GN.formatNum(grossProfit) + ' SDG', icon: 'chart', color: 'g' },
      { lbl: 'الربح المعلّق', valHtml: GN.formatNum(pending) + ' SDG', icon: 'dollar', color: 'y' },
      { lbl: 'الربح المحقق', valHtml: GN.formatNum(realized) + ' SDG', icon: 'check', color: 'ok' },
      { lbl: 'أرباح الوساطة', valHtml: GN.formatNum(brokerProfit) + ' SDG', icon: 'chart', color: 'g' },
      { lbl: 'إجمالي المبيع', valHtml: GN.formatNum(totalG, 2) + 'g', icon: 'gold', color: 'g' }
    ]);

    var rows = all.map(function(s){
      var src = s.inventory_id ? 'مخزون' : 'دورة';
      var statusLbl = s.profit_status === 'realized' ? '<span class="chip ok">محقق</span>' : '<span class="chip w">معلق</span>';
      return [
        GN.esc(GN.formatDate(s.sale_date)),
        GN.esc(src),
        GN.formatNum(s.quantity_grams, 2) + 'g',
        GN.formatMoneyPlain(s.selling_total, 'SDG'),
        GN.formatMoneyPlain(s.cost_basis, 'SDG'),
        '<b style="color:' + (Number(s.net_profit) >= 0 ? 'var(--ok)' : 'var(--bad)') + '">' + (Number(s.net_profit) >= 0 ? '+' : '') + GN.formatMoneyPlain(s.net_profit, 'SDG') + '</b>',
        statusLbl
      ];
    });

    /* Add brokerage rows */
    brokerages.forEach(function(b){
      rows.push([
        GN.esc(GN.formatDate(b.broker_date)),
        '<span class="chip n" style="font-size:10px">وساطة</span>',
        '—',
        GN.formatMoneyPlain(b.amount, 'SDG'),
        GN.formatMoneyPlain(b.taxes_fees, 'SDG'),
        '<b style="color:var(--ok)">+' + GN.formatMoneyPlain(b.net_profit, 'SDG') + '</b>',
        '<span class="chip ok">محقق</span>'
      ]);
    });

    rows.sort(function(a, b){
      return (b[0] || '').localeCompare(a[0] || '');
    });

    GN._reportDataCache.profits = rows;

    return kpis + GN.repTable(
      ['التاريخ', 'المصدر', 'الكمية', 'الإيراد', 'التكلفة', 'صافي الربح', 'الحالة'],
      rows,
      { title: 'تقرير الأرباح', empty: 'لا توجد أرباح في هذه الفترة' }
    );
  });
};

/* ---------- 8) TAXES ---------- */
GN.reportBuilders.taxes = function(){
  return Promise.all([
    (function(){ var q = GN.supa.from('gold_cycles').select('code,start_date,purchase_tax_type,purchase_tax_value,purchase_tax_amount,purchase_fee_amount,purchase_fee_desc'); return GN.repApplyFilters(q, 'start_date'); })(),
    (function(){ var q = GN.supa.from('gold_cycle_sales').select('sale_date,sale_tax_type,sale_tax_value,sale_tax_amount,sale_fee_amount,sale_fee_desc'); return GN.repApplyFilters(q, 'sale_date'); })(),
    (function(){ var q = GN.supa.from('gold_brokerages').select('code,broker_date,taxes_fees,taxes_fees_desc'); return GN.repApplyFilters(q, 'broker_date'); })()
  ]).then(function(res){
    var cycles = res[0].error ? [] : (res[0].data || []);
    var sales = res[1].error ? [] : (res[1].data || []);
    var brokerages = res[2].error ? [] : (res[2].data || []);

    var totalBuyTax = 0, totalBuyFee = 0, totalSellTax = 0, totalSellFee = 0, totalBrokerTax = 0;
    cycles.forEach(function(c){
      totalBuyTax += Number(c.purchase_tax_amount || 0);
      totalBuyFee += Number(c.purchase_fee_amount || 0);
    });
    sales.forEach(function(s){
      totalSellTax += Number(s.sale_tax_amount || 0);
      totalSellFee += Number(s.sale_fee_amount || 0);
    });
    brokerages.forEach(function(b){
      totalBrokerTax += Number(b.taxes_fees || 0);
    });

    var grand = totalBuyTax + totalBuyFee + totalSellTax + totalSellFee + totalBrokerTax;

    var kpis = GN.repKpis([
      { lbl: 'إجمالي الضرائب والرسوم', valHtml: GN.formatNum(grand) + ' SDG', icon: 'receipt', hl: true },
      { lbl: 'ضريبة الشراء', valHtml: GN.formatNum(totalBuyTax) + ' SDG', icon: 'dollar', color: 'y' },
      { lbl: 'رسوم الشراء', valHtml: GN.formatNum(totalBuyFee) + ' SDG', icon: 'dollar', color: 'y' },
      { lbl: 'ضريبة البيع', valHtml: GN.formatNum(totalSellTax) + ' SDG', icon: 'dollar', color: 'b' },
      { lbl: 'رسوم البيع', valHtml: GN.formatNum(totalSellFee) + ' SDG', icon: 'dollar', color: 'b' },
      { lbl: 'ضرائب الوساطة', valHtml: GN.formatNum(totalBrokerTax) + ' SDG', icon: 'dollar', color: 'b' }
    ]);

    var rows = [];
    cycles.forEach(function(c){
      if (!c.purchase_tax_amount && !c.purchase_fee_amount) return;
      rows.push([
        GN.esc(GN.formatDate(c.start_date)),
        '<bdi dir="ltr" style="font-family:monospace;font-size:11.5px">' + GN.esc(c.code || '—') + '</bdi>',
        'شراء',
        c.purchase_tax_type === 'percent' ? c.purchase_tax_value + '%' : (c.purchase_tax_type === 'fixed' ? 'ثابت' : '—'),
        GN.formatMoneyPlain(c.purchase_tax_amount || 0, 'SDG'),
        GN.formatMoneyPlain(c.purchase_fee_amount || 0, 'SDG'),
        GN.esc(c.purchase_fee_desc || '—')
      ]);
    });
    sales.forEach(function(s){
      if (!s.sale_tax_amount && !s.sale_fee_amount) return;
      rows.push([
        GN.esc(GN.formatDate(s.sale_date)),
        '—',
        'بيع',
        s.sale_tax_type === 'percent' ? s.sale_tax_value + '%' : (s.sale_tax_type === 'fixed' ? 'ثابت' : '—'),
        GN.formatMoneyPlain(s.sale_tax_amount || 0, 'SDG'),
        GN.formatMoneyPlain(s.sale_fee_amount || 0, 'SDG'),
        GN.esc(s.sale_fee_desc || '—')
      ]);
    });
    brokerages.forEach(function(b){
      if (!b.taxes_fees) return;
      rows.push([
        GN.esc(GN.formatDate(b.broker_date)),
        '<bdi dir="ltr" style="font-family:monospace;font-size:11.5px">' + GN.esc(b.code || '—') + '</bdi>',
        '<span class="chip n" style="font-size:10px">وساطة</span>',
        '—',
        GN.formatMoneyPlain(b.taxes_fees, 'SDG'),
        '—',
        GN.esc(b.taxes_fees_desc || '—')
      ]);
    });

    GN._reportDataCache.taxes = rows;

    return kpis + GN.repTable(
      ['التاريخ', 'المرجع', 'النوع', 'النسبة/النوع', 'الضريبة', 'الرسوم', 'وصف الرسوم'],
      rows,
      { title: 'التقرير الضريبي', empty: 'لا توجد ضرائب أو رسوم' }
    );
  });
};

/* ---------- 9) PERFORMANCE ---------- */
GN.reportBuilders.performance = function(){
  var q = GN.supa.from('gold_cycles').select('*');
  q = GN.repApplyFilters(q, 'start_date');
  return q.then(function(res){
    if (res.error) throw res.error;
    var data = res.data || [];

    var onTime = 0, late = 0, totalDays = 0, totalTarget = 0, count = 0;
    data.forEach(function(c){
      var days = c.end_date
        ? Math.ceil((new Date(c.end_date) - new Date(c.start_date)) / 86400000)
        : Math.ceil((Date.now() - new Date(c.start_date).getTime()) / 86400000);
      totalDays += days;
      totalTarget += Number(c.target_days || 0);
      count++;
      if (days <= Number(c.target_days || 0)) onTime++;
      else late++;
    });

    var avgActual = count > 0 ? (totalDays / count).toFixed(1) : 0;
    var avgTarget = count > 0 ? (totalTarget / count).toFixed(1) : 0;
    var perf = totalTarget > 0 ? Math.round((totalTarget / totalDays) * 100) : 0;

    var kpis = GN.repKpis([
      { lbl: 'عدد الدورات', val: count, icon: 'gold', hl: true },
      { lbl: 'في الوقت المحدد', val: onTime, icon: 'check', color: 'ok' },
      { lbl: 'متأخرة', val: late, icon: 'check', color: 'b' },
      { lbl: 'متوسط فعلي', valHtml: avgActual + ' يوم', icon: 'chart', color: 'g' },
      { lbl: 'متوسط مستهدف', valHtml: avgTarget + ' يوم', icon: 'chart', color: 'y' },
      { lbl: 'معدل الالتزام', valHtml: perf + '%', icon: 'chart' }
    ]);

    var rows = data.map(function(c){
      var days = c.end_date
        ? Math.ceil((new Date(c.end_date) - new Date(c.start_date)) / 86400000)
        : Math.ceil((Date.now() - new Date(c.start_date).getTime()) / 86400000);
      var target = Number(c.target_days || 0);
      var status = days <= target ? '<span class="chip ok">في الوقت</span>' : '<span class="chip b">متأخرة</span>';
      var variance = days - target;
      return [
        '<bdi dir="ltr" style="font-family:monospace;font-size:11.5px">' + GN.esc(c.code) + '</bdi>',
        GN.formatNum(c.quantity_grams, 2) + 'g',
        days + ' يوم',
        target + ' يوم',
        (variance > 0 ? '+' : '') + variance,
        status
      ];
    });

    GN._reportDataCache.performance = rows;

    return kpis + GN.repTable(
      ['الكود', 'الكمية', 'الفعلي', 'المستهدف', 'الفرق', 'الحالة'],
      rows,
      { title: 'تقرير الأداء', empty: 'لا توجد دورات' }
    );
  });
};

/* ---------- 10) COMPANY BALANCE ---------- */
GN.reportBuilders.company = function(){
  var q = GN.supa.from('fund_transactions').select('*, fund_pools:pool_id(code, name_ar, currency)');
  q = GN.repApplyFilters(q, 'created_at');
  return q.order('created_at', { ascending: false }).limit(500).then(function(res){
    if (res.error) throw res.error;
    var txs = res.data || [];

    var totalIn = 0, totalOut = 0;
    txs.forEach(function(t){
      if (t.type === 'in' || t.type === 'transfer_in') totalIn += Number(t.amount || 0);
      else totalOut += Number(t.amount || 0);
    });

    var kpis = GN.repKpis([
      { lbl: 'عدد الحركات', val: txs.length, icon: 'wallet', hl: true },
      { lbl: 'إجمالي الوارد', valHtml: GN.formatNum(totalIn) + ' SDG', icon: 'check', color: 'ok' },
      { lbl: 'إجمالي الصادر', valHtml: GN.formatNum(totalOut) + ' SDG', icon: 'dollar', color: 'b' },
      { lbl: 'الصافي', valHtml: GN.formatNum(totalIn - totalOut) + ' SDG', icon: 'chart' }
    ]);

    var rows = txs.map(function(t){
      var isIn = t.type === 'in' || t.type === 'transfer_in';
      var typeLbl = t.type === 'in' ? 'إيداع' : t.type === 'out' ? 'سحب' : t.type === 'transfer_in' ? 'تحويل وارد' : 'تحويل صادر';
      return [
        GN.esc(GN.formatDate(t.created_at)),
        GN.esc(t.fund_pools ? t.fund_pools.name_ar : '—'),
        GN.esc(typeLbl),
        '<span style="color:' + (isIn ? 'var(--ok)' : 'var(--bad)') + ';font-weight:700">' + (isIn ? '+' : '-') + ' ' + GN.formatMoneyPlain(t.amount, t.currency) + '</span>',
        GN.esc(t.reason || '—')
      ];
    });

    GN._reportDataCache.company = rows;

    return kpis + GN.repTable(
      ['التاريخ', 'الحوض', 'النوع', 'المبلغ', 'السبب'],
      rows,
      { title: 'تقرير رصيد الشركة', empty: 'لا توجد حركات' }
    );
  });
};

/* ---------- 11) USD ---------- */
GN.reportBuilders.usd = function(){
  return Promise.all([
    GN.supa.from('fund_pools').select('*').eq('currency', 'USD'),
    (function(){ var q = GN.supa.from('fund_transactions').select('*, fund_pools:pool_id(code, name_ar, currency)'); return GN.repApplyFilters(q, 'created_at'); })()
  ]).then(function(res){
    var usdPools = res[0].error ? [] : (res[0].data || []);
    var allTx = res[1].error ? [] : (res[1].data || []);

    var usdPoolIds = usdPools.map(function(p){ return p.id; });
    var usdTx = allTx.filter(function(t){ return usdPoolIds.indexOf(t.pool_id) !== -1; });

    var totalIn = 0, totalOut = 0;
    usdTx.forEach(function(t){
      if (t.type === 'in' || t.type === 'transfer_in') totalIn += Number(t.amount || 0);
      else totalOut += Number(t.amount || 0);
    });

    var kpis = GN.repKpis([
      { lbl: 'رصيد USD الحالي', valHtml: GN.formatNum(usdPools.reduce(function(s, p){ return s + Number(p.balance || 0); }, 0)) + ' USD', icon: 'dollar', hl: true },
      { lbl: 'إجمالي الإيداع', valHtml: GN.formatNum(totalIn) + ' USD', icon: 'check', color: 'ok' },
      { lbl: 'إجمالي السحب', valHtml: GN.formatNum(totalOut) + ' USD', icon: 'dollar', color: 'b' }
    ]);

    var rows = usdTx.map(function(t){
      var isIn = t.type === 'in' || t.type === 'transfer_in';
      return [
        GN.esc(GN.formatDate(t.created_at)),
        GN.esc(t.fund_pools ? t.fund_pools.name_ar : '—'),
        GN.esc(isIn ? 'إيداع' : 'سحب'),
        '<span style="color:' + (isIn ? 'var(--ok)' : 'var(--bad)') + ';font-weight:700">' + (isIn ? '+' : '-') + ' ' + GN.formatMoneyPlain(t.amount, 'USD') + '</span>',
        GN.esc(t.reason || '—')
      ];
    });

    GN._reportDataCache.usd = rows;

    return kpis + GN.repTable(
      ['التاريخ', 'الحوض', 'النوع', 'المبلغ', 'السبب'],
      rows,
      { title: 'تقرير الدولار', empty: 'لا توجد حركات دولارية' }
    );
  });
};

/* ---------- 12) FX ---------- */
GN.reportBuilders.fx = function(){
  var q = GN.supa.from('currency_exchanges').select('*');
  q = GN.repApplyFilters(q, 'exchange_date');
  return q.order('exchange_date', { ascending: false }).then(function(res){
    if (res.error) throw res.error;
    var data = res.data || [];

    var avgRate = 0;
    data.forEach(function(f){ avgRate += Number(f.rate || 0); });
    avgRate = data.length > 0 ? (avgRate / data.length).toFixed(2) : 0;

    var kpis = GN.repKpis([
      { lbl: 'عدد العمليات', val: data.length, icon: 'chart', hl: true },
      { lbl: 'متوسط سعر الصرف', valHtml: GN.formatNum(avgRate, 2), icon: 'dollar', color: 'y' }
    ]);

    var rows = data.map(function(f){
      return [
        GN.esc(GN.formatDate(f.exchange_date)),
        GN.esc(f.from_currency + ' → ' + f.to_currency),
        GN.formatMoneyPlain(f.from_amount, f.from_currency),
        GN.formatMoneyPlain(f.to_amount, f.to_currency),
        GN.formatNum(f.rate, 4),
        GN.esc(f.reason || '—')
      ];
    });

    GN._reportDataCache.fx = rows;

    return kpis + GN.repTable(
      ['التاريخ', 'الاتجاه', 'المبلغ المصدر', 'المبلغ الناتج', 'السعر', 'السبب'],
      rows,
      { title: 'تقرير تحويل العملات', empty: 'لا توجد عمليات تحويل' }
    );
  });
};

/* ============================================================
   Search
   ============================================================ */
GN.filterReportTable = function(query){
  var box = document.getElementById('repContent');
  var countEl = document.getElementById('repSearchCount');
  if (!box) return;

  var tables = box.querySelectorAll('table');
  var totalRows = 0;
  var visibleRows = 0;
  var q = (query || '').toLowerCase().trim();

  tables.forEach(function(tbl){
    var rows = tbl.querySelectorAll('tbody tr');
    rows.forEach(function(tr){
      totalRows++;
      if (!q){
        tr.style.display = '';
        visibleRows++;
        return;
      }
      var text = (tr.textContent || '').toLowerCase();
      if (text.indexOf(q) !== -1){
        tr.style.display = '';
        visibleRows++;
      } else {
        tr.style.display = 'none';
      }
    });
  });

  if (countEl){
    if (!q){
      countEl.textContent = '';
      countEl.classList.remove('has-results', 'no-results');
    } else if (visibleRows > 0){
      countEl.textContent = visibleRows + ' / ' + totalRows;
      countEl.classList.add('has-results');
      countEl.classList.remove('no-results');
    } else {
      countEl.textContent = GN.t('repSearchNone');
      countEl.classList.add('no-results');
      countEl.classList.remove('has-results');
    }
  }
};

GN.clearReportSearch = function(){
  var inp = document.getElementById('repSearch');
  if (inp){
    inp.value = '';
    GN.filterReportTable('');
    inp.focus();
  }
};

GN._bindReportSearch = function(){
  var inp = document.getElementById('repSearch');
  if (!inp || inp._bound) return;
  inp._bound = true;

  inp.addEventListener('input', GN.debounce(function(){
    GN.filterReportTable(inp.value);
  }, 200));

  inp.addEventListener('keydown', function(e){
    if (e.key === 'Escape'){ GN.clearReportSearch(); }
  });

  var clr = document.getElementById('repSearchClear');
  if (clr) clr.addEventListener('click', GN.clearReportSearch);
};

/* ============================================================
   Print
   ============================================================ */
GN.printReport = function(){
  var box = document.getElementById('repContent');
  if (!box) return;

  var tabName = {
    cycles: GN.t('repTabCycles'),
    brokerages: GN.t('repTabBrokerages'),
    geography: GN.t('repTabGeography'),
    agents: GN.t('repTabAgents'),
    inventory: GN.t('repTabInventory'),
    expenses: GN.t('repTabExpenses'),
    profits: GN.t('repTabProfits'),
    taxes: GN.t('repTabTaxes'),
    performance: GN.t('repTabPerformance'),
    company: GN.t('repTabCompany'),
    usd: GN.t('repTabUsd'),
    fx: GN.t('repTabFx')
  }[GN.reportsTab] || GN.t('repTitle');

  var f = GN.reportsFilter;
  var rangeTxt = '';
  if (f.date_from || f.date_to){
    rangeTxt = '<div style="font-size:12px;color:#666;margin-bottom:12px">' +
      (f.date_from ? GN.t('cyFilterFrom') + ': ' + GN.esc(f.date_from) : '') +
      (f.date_from && f.date_to ? ' · ' : '') +
      (f.date_to ? GN.t('cyFilterTo') + ': ' + GN.esc(f.date_to) : '') +
    '</div>';
  }

  var html =
    '<!DOCTYPE html>' +
    '<html dir="rtl" lang="ar">' +
    '<head>' +
      '<meta charset="utf-8">' +
      '<title>' + GN.esc(tabName) + '</title>' +
      '<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">' +
      '<style>' +
        'body{font-family:Cairo,sans-serif;padding:20px;color:#222;direction:rtl}' +
        'h1{font-size:20px;margin:0 0 6px;color:#0F2E2D}' +
        '.meta{font-size:12px;color:#666;margin-bottom:16px}' +
        '.kpi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:8px;margin-bottom:16px}' +
        '.kpi{border:1px solid #ddd;border-radius:8px;padding:10px;background:#fafafa}' +
        '.kpi .lbl{font-size:11px;color:#666;margin-bottom:4px}' +
        '.kpi .val{font-size:16px;font-weight:800;color:#0F2E2D}' +
        'table{width:100%;border-collapse:collapse;font-size:11px;margin-top:8px;page-break-inside:auto}' +
        'th,td{border:1px solid #ccc;padding:6px 8px;text-align:start}' +
        'th{background:#F2F2F2;font-weight:800}' +
        'tr{page-break-inside:avoid}' +
        'svg{display:none}' +
        '.card{border:0;margin:0;padding:0;box-shadow:none}' +
        '.card-head{border-bottom:2px solid #C79A3D;padding-bottom:6px;margin-bottom:6px}' +
        '.card-head h3{font-size:14px;margin:0}' +
        '.ff-count{font-size:11px;color:#666;margin-inline-start:8px}' +
        '@media print{body{padding:0}}' +
      '</style>' +
    '</head>' +
    '<body>' +
      '<h1>' + GN.esc(tabName) + '</h1>' +
      '<div class="meta">' + GN.esc(GN.t('repPrintDate')) + ': ' + GN.formatDate(new Date()) + '</div>' +
      rangeTxt +
      box.innerHTML +
      '<script>setTimeout(function(){window.print();},400);<\/script>' +
    '</body>' +
    '</html>';

  var w = window.open('', '_blank', 'width=900,height=700');
  if (!w){
    GN.toast('الرجاء السماح بالنوافذ المنبثقة للطباعة', 'bad');
    return;
  }
  w.document.write(html);
  w.document.close();
};

/* ============================================================
   Export CSV
   ============================================================ */
GN.exportCurrentReport = function(){
  var tab = GN.reportsTab;
  var data = GN._reportDataCache[tab];
  if (!data || !data.length){
    GN.toast('لا توجد بيانات للتصدير', 'bad');
    return;
  }

  function strip(html){
    var d = document.createElement('div');
    d.innerHTML = html;
    return (d.textContent || d.innerText || '').trim();
  }

  var rows = data.map(function(r){
    return r.map(function(c){ return strip(c); });
  });

  var tabName = {
    cycles:'Cycles', brokerages:'Brokerages', geography:'Geography', agents:'Agents',
    inventory:'Inventory', expenses:'Expenses', profits:'Profits',
    taxes:'Taxes', performance:'Performance', company:'Company',
    usd:'USD', fx:'FX'
  }[tab] || tab;

  var filename = 'report-' + tabName + '-' + GN.today() + '.csv';
  GN.downloadCSV(filename, rows);
  GN.toast('تم تصدير ' + rows.length + ' صفًا', 'ok');
};

/* ============================================================
   Bind Section
   ============================================================ */
GN.bindSection.reports = function(){
  GN.bindAction('rep-apply', function(){
    GN.reportsFilter.date_from = (document.getElementById('rep_from') || {}).value || '';
    GN.reportsFilter.date_to = (document.getElementById('rep_to') || {}).value || '';
    GN.runReport();
  });

  GN.bindAction('rep-clear', function(){
    GN.reportsFilter = { date_from: '', date_to: '' };
    GN.renderSection('reports');
  });

  GN.bindAction('rep-quick-month', function(){
    var now = new Date();
    var first = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    var last = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
    GN.reportsFilter.date_from = first;
    GN.reportsFilter.date_to = last;
    var f = document.getElementById('rep_from');
    var t = document.getElementById('rep_to');
    if (f) f.value = first;
    if (t) t.value = last;
    GN.runReport();
  });

  GN.bindAction('rep-export', function(){ GN.exportCurrentReport(); });
  GN.bindAction('rep-print',  function(){ GN.printReport(); });

  GN._bindReportSearch();

  GN.$$('[data-rep-tab]').forEach(function(btn){
    btn.addEventListener('click', function(){
      GN.reportsTab = btn.getAttribute('data-rep-tab');
      GN.$$('[data-rep-tab]').forEach(function(b){
        b.classList.toggle('on', b === btn);
      });
      GN.runReport();
    });
  });
};

GN.bindReportActions = function(){ /* placeholder */ };

console.log('[Gold Nile] dashboard/18-reports.js loaded');
})();