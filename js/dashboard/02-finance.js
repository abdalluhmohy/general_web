/* ============================================================
   Gold Nile — Dashboard / Finance
   Transactions · Charts · Filters · Investment · Fixed Expenses
   ============================================================ */
(function(){
'use strict';

var GN = window.GN = window.GN || {};

/* Shortcuts */
var ICO_EDIT = GN.ICO_EDIT;
var ICO_DEL  = GN.ICO_DEL;

/* ============================================================
   Filters state
   ============================================================ */
GN.txFilters = {
  search:'', date_from:'', date_to:'', type:'', currency:'',
  source:'', service_type:'', department:'', amount_min:'', amount_max:''
};
GN._txChartRefs = { monthly:null, service:null, dept:null, source:null };

/* ============================================================
   Finance Section
   ============================================================ */
GN.sections.finance = function(){
  var d = GN.dash.data || {};
  var inv = (d.dashboard && d.dashboard.investment) || {};
  var curr = (d.settings && d.settings.currency) || 'USD';
  var capTotal = Number(inv.capital_total || 0);
  var recovered = Number(inv.recovered_total || 0);
  var remaining = Math.max(0, capTotal - recovered);
  var pct = capTotal > 0 ? Math.min(100, Math.round((recovered / capTotal) * 100)) : 0;

  var html = '<div class="fin-head"><div>' +
    '<h2>' + GN.navIcon('dollar') + ' ' + GN.esc(GN.t('finTitle')) + '</h2>' +
    '<span class="sub">' + GN.esc(GN.t('finSub')) + '</span></div>' +
    '<button class="btn btn-pri btn-sm" data-act="add-tx-new">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg> ' +
      GN.esc(GN.t('txAdd')) + '</button></div>';

  html += '<div class="fin-kpis">' +
    '<div class="fin-kpi"><div class="ic">' + GN.navIcon('dollar') + '</div>' +
      '<div class="body"><div class="lbl">' + GN.esc(GN.t('capitalTotal')) + '</div>' +
      '<div class="val">' + GN.formatNum(capTotal) + '<span class="cur">' + GN.esc(curr) + '</span></div></div></div>' +
    '<div class="fin-kpi in"><div class="ic">' + GN.navIcon('check') + '</div>' +
      '<div class="body"><div class="lbl">' + GN.esc(GN.t('recovered')) + '</div>' +
      '<div class="val">' + GN.formatNum(recovered) + '<span class="cur">' + GN.esc(curr) + '</span></div></div></div>' +
    '<div class="fin-kpi out"><div class="ic">' + GN.navIcon('dollar') + '</div>' +
      '<div class="body"><div class="lbl">' + GN.esc(GN.t('remaining')) + '</div>' +
      '<div class="val">' + GN.formatNum(remaining) + '<span class="cur">' + GN.esc(curr) + '</span></div></div></div>' +
    '<div class="fin-kpi net"><div class="ic">' + GN.navIcon('chart') + '</div>' +
      '<div class="body"><div class="lbl">' + GN.esc(GN.t('recoveryPercent')) + '</div>' +
      '<div class="val">' + pct + '<span class="cur">%</span></div></div></div>' +
  '</div>';

  html += '<div class="fin-kpis" id="finOpKpis">' +
    '<div class="fin-kpi"><div class="ic">' + GN.navIcon('dollar') + '</div>' +
      '<div class="body"><div class="lbl">' + GN.esc(GN.t('loading')) + '</div><div class="val">—</div></div></div>' +
    '<div class="fin-kpi"><div class="ic">' + GN.navIcon('dollar') + '</div>' +
      '<div class="body"><div class="lbl">' + GN.esc(GN.t('loading')) + '</div><div class="val">—</div></div></div>' +
    '<div class="fin-kpi"><div class="ic">' + GN.navIcon('dollar') + '</div>' +
      '<div class="body"><div class="lbl">' + GN.esc(GN.t('loading')) + '</div><div class="val">—</div></div></div>' +
    '<div class="fin-kpi"><div class="ic">' + GN.navIcon('check') + '</div>' +
      '<div class="body"><div class="lbl">' + GN.esc(GN.t('loading')) + '</div><div class="val">—</div></div></div>' +
  '</div>';

  /* Gold summary */
  var goldPurchases = (d.dashboard && d.dashboard.gold_purchases) || [];
  var goldSales = (d.dashboard && d.dashboard.gold_sales) || [];
  var goldProfit = 0, totalBoughtG = 0, totalSoldG = 0;
  goldPurchases.forEach(function(p){ totalBoughtG += Number(p.weight || 0); });
  goldSales.forEach(function(s){
    totalSoldG += Number(s.weight || 0);
    goldProfit += Number(s.net_profit || 0);
  });
  var invGrams = totalBoughtG - totalSoldG;

  html += '<div class="fin-kpis">' +
    '<div class="fin-kpi"><div class="ic" style="background:var(--gold-l);color:var(--gold-d)">' + GN.navIcon('gold') + '</div>' +
      '<div class="body"><div class="lbl">' + GN.esc(GN.t('kpiGoldProfit')) + '</div>' +
      '<div class="val" style="color:' + (goldProfit >= 0 ? 'var(--ok)' : 'var(--bad)') + '">' +
        (goldProfit >= 0 ? '+' : '') + GN.formatNum(goldProfit) + '<span class="cur">SDG</span></div></div></div>' +
    '<div class="fin-kpi"><div class="ic" style="background:var(--gold-l);color:var(--gold-d)">' + GN.navIcon('gold') + '</div>' +
      '<div class="body"><div class="lbl">' + GN.esc(GN.t('kpiGoldInventory')) + '</div>' +
      '<div class="val">' + GN.formatNum(invGrams, 2) + '<span class="cur">g</span></div></div></div>' +
    '<div class="fin-kpi"><div class="ic" style="background:var(--gold-l);color:var(--gold-d)">' + GN.navIcon('gold') + '</div>' +
      '<div class="body"><div class="lbl">' + GN.esc(GN.t('kpiGoldPurchases')) + '</div>' +
      '<div class="val">' + GN.formatNum(goldPurchases.length) + '</div></div></div>' +
    '<div class="fin-kpi"><div class="ic" style="background:var(--gold-l);color:var(--gold-d)">' + GN.navIcon('gold') + '</div>' +
      '<div class="body"><div class="lbl">' + GN.esc(GN.t('kpiGoldSales')) + '</div>' +
      '<div class="val">' + GN.formatNum(goldSales.length) + '</div></div></div>' +
  '</div>';

  html += GN.renderTxFilters();

  html += '<div class="fin-charts">' +
    '<div class="chart-card"><h4>' + GN.esc(GN.t('chartMonthlyFlow')) + '</h4><div class="chart-body"><canvas id="chartMonthly"></canvas></div></div>' +
    '<div class="chart-card"><h4>' + GN.esc(GN.t('chartByService')) + '</h4><div class="chart-body"><canvas id="chartService"></canvas></div></div>' +
    '<div class="chart-card"><h4>' + GN.esc(GN.t('chartByDept')) + '</h4><div class="chart-body"><canvas id="chartDept"></canvas></div></div>' +
    '<div class="chart-card"><h4>' + GN.esc(GN.t('chartBySource')) + '</h4><div class="chart-body"><canvas id="chartSource"></canvas></div></div>' +
  '</div>';

  html += '<div class="card"><div class="card-head">' +
    '<h3>' + GN.navIcon('dollar') + ' ' + GN.esc(GN.t('txList')) + '</h3>' +
    '<span class="ff-count" id="txCount">—</span></div>' +
    '<div id="txTableWrap"><div class="empty"><div class="ic">' + GN.navIcon('dollar') + '</div>' +
    '<h4>' + GN.esc(GN.t('loading')) + '</h4></div></div></div>';

  html += '<div class="fin-collapse" id="finCollapseInv">' +
    '<div class="fin-collapse-head" data-collapse="finCollapseInv">' +
      '<h3>' + GN.navIcon('dollar') + ' ' + GN.esc(GN.t('finInvestmentDetails')) + '</h3>' +
      '<span class="chev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="m6 9 6 6 6-6"/></svg></span></div>' +
    '<div class="fin-collapse-body"><div class="fin-collapse-body-inner">' + GN.renderInvestmentDetails(inv, curr) + '</div></div></div>';

  html += '<div class="fin-collapse" id="finCollapseFixed">' +
    '<div class="fin-collapse-head" data-collapse="finCollapseFixed">' +
      '<h3>' + GN.navIcon('dollar') + ' ' + GN.esc(GN.t('finFixedExpenses')) + '</h3>' +
      '<span class="chev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="m6 9 6 6 6-6"/></svg></span></div>' +
    '<div class="fin-collapse-body"><div class="fin-collapse-body-inner">' +
      GN.renderFixedExpenses((d.dashboard && d.dashboard.fixed_expenses) || { daily:[], monthly:[], yearly:[] }, curr) +
    '</div></div></div>';

  setTimeout(GN.loadTransactions, 100);
  return html;
};

GN.renderInvestmentDetails = function(inv, curr){
  var payments = inv.payments || [];
  var html = '<div class="tx-kpis">' +
    '<div class="tx-kpi"><div class="lbl">' + GN.esc(GN.t('capitalCash')) + '</div><div class="val">' + GN.formatNum(inv.capital_cash || 0) + '</div></div>' +
    '<div class="tx-kpi"><div class="lbl">' + GN.esc(GN.t('capitalEquipment')) + '</div><div class="val">' + GN.formatNum(inv.capital_equipment || 0) + '</div></div>' +
    '<div class="tx-kpi"><div class="lbl">' + GN.esc(GN.t('capitalDebt')) + '</div><div class="val">' + GN.formatNum(inv.capital_debt || 0) + '</div></div>' +
  '</div>';

  if (!payments.length){
    html += '<div class="empty" style="padding:20px"><h4>' + GN.esc(GN.t('noData')) + '</h4></div>';
  } else {
    html += '<div class="tx-table-wrap"><table class="tx-table"><thead><tr>' +
      '<th>' + GN.esc(GN.t('date')) + '</th>' +
      '<th>' + GN.esc(GN.t('amount')) + '</th>' +
      '<th>' + GN.esc(GN.t('bank')) + '</th>' +
      '<th>' + GN.esc(GN.t('notes')) + '</th></tr></thead><tbody>';
    payments.forEach(function(p){
      html += '<tr><td>' + GN.esc(GN.formatDate(p.date)) + '</td>' +
        '<td class="num"><bdi>' + GN.formatNum(p.amount) + '</bdi> <span class="cur">' + GN.esc(p.currency || curr) + '</span></td>' +
        '<td>' + GN.esc(p.bank || '-') + '</td>' +
        '<td style="color:var(--ink-2);font-size:12.5px">' + GN.esc(p.notes || '-') + '</td></tr>';
    });
    html += '</tbody></table></div>';
  }
  return html;
};

GN.renderFixedExpenses = function(fixed, curr){
  var html = '<div class="card"><div class="card-head"><h3>' + GN.navIcon('dollar') + ' ' + GN.esc(GN.t('fixedExpensesTitle')) + '</h3></div>';
  var groups = [
    { key:'daily',   label:'dailyFixed',   mult:30 },
    { key:'monthly', label:'monthlyFixed', mult:1 },
    { key:'yearly',  label:'yearlyFixed',  mult:null }
  ];

  html += '<div class="kpi-grid" style="grid-template-columns:repeat(3,1fr)">';
  groups.forEach(function(g){
    var arr = fixed[g.key] || [];
    var total = arr.reduce(function(s, x){ return s + (Number(x.amount) || 0); }, 0);
    var sub = '';
    if (g.key === 'daily')        sub = GN.t('monthlyFixed') + ': ' + GN.formatNum(total * 30);
    else if (g.key === 'monthly') sub = GN.t('thisYear') + ': ' + GN.formatNum(total * 12);
    else                          sub = GN.t('thisYear');

    html += '<div class="kpi"><div class="top"><span class="ic y">' + GN.navIcon('dollar') + '</span>' +
      '<button class="icon-act" data-act="add-fixed" data-key="' + g.key + '" title="' + GN.escAttr(GN.t('add')) + '">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></button></div>' +
      '<div class="lbl">' + GN.esc(GN.t(g.label)) + '</div>' +
      '<div class="val"><bdi>' + GN.formatNum(total) + '</bdi><span class="cur">' + GN.esc(curr) + '</span></div>' +
      '<div class="sub">' + GN.esc(sub) + '</div></div>';
  });
  html += '</div>';

  groups.forEach(function(g){
    var arr = fixed[g.key] || [];
    if (!arr.length) return;
    html += '<h4 style="font-family:Cairo,sans-serif;font-size:14px;margin:18px 0 10px;color:var(--ink-2)">' + GN.esc(GN.t(g.label)) + '</h4>';
    html += '<div class="table-wrap"><table style="min-width:auto"><tbody>';
    arr.forEach(function(x, i){
      html += '<tr><td>' + GN.esc(x.name || '-') + '</td>' +
        '<td class="num" style="text-align:end">' + GN.formatMoneyPlain(x.amount, x.currency || curr) + '</td>' +
        '<td class="actions" style="width:80px">' + GN.dh.sectionActions([
          { act:'edit-fixed', key:g.key, idx:i, icon:ICO_EDIT, title:GN.t('edit') },
          { act:'del-fixed',  key:g.key, idx:i, icon:ICO_DEL,  title:GN.t('delete'), danger:true }
        ]) + '</td></tr>';
    });
    html += '</tbody></table></div>';
  });
  html += '</div>';
  return html;
};

GN.renderTxFilters = function(){
  var f = GN.txFilters;
  return '<div class="fin-filters" id="finFilters">' +
    '<div class="ff-field ff-search"><label>' + GN.esc(GN.t('txFilterSearch')) + '</label>' +
      '<input type="text" id="ff_search" dir="auto" placeholder="' + GN.escAttr(GN.t('txFilterSearchPh')) + '" value="' + GN.escAttr(f.search) + '"></div>' +
    '<div class="ff-field"><label>' + GN.esc(GN.t('txFilterDateFrom')) + '</label>' +
      '<input type="date" id="ff_date_from" value="' + GN.escAttr(f.date_from) + '"></div>' +
    '<div class="ff-field"><label>' + GN.esc(GN.t('txFilterDateTo')) + '</label>' +
      '<input type="date" id="ff_date_to" value="' + GN.escAttr(f.date_to) + '"></div>' +
    '<div class="ff-field"><label>' + GN.esc(GN.t('txFilterType')) + '</label>' +
      '<select id="ff_type"><option value="">' + GN.esc(GN.t('txFilterAll')) + '</option>' +
      '<option value="in"'  + (f.type === 'in'  ? ' selected' : '') + '>' + GN.esc(GN.t('txIn'))  + '</option>' +
      '<option value="out"' + (f.type === 'out' ? ' selected' : '') + '>' + GN.esc(GN.t('txOut')) + '</option></select></div>' +
    '<div class="ff-field"><label>' + GN.esc(GN.t('txFilterCurrency')) + '</label>' +
      '<select id="ff_currency"><option value="">' + GN.esc(GN.t('txFilterAll')) + '</option>' +
      '<option value="SDG"' + (f.currency === 'SDG' ? ' selected' : '') + '>SDG</option>' +
      '<option value="USD"' + (f.currency === 'USD' ? ' selected' : '') + '>USD</option></select></div>' +
    '<div class="ff-field"><label>' + GN.esc(GN.t('txFilterSource')) + '</label>' +
      '<select id="ff_source"><option value="">' + GN.esc(GN.t('txFilterAll')) + '</option>' +
      '<option value="general"'     + (f.source === 'general'     ? ' selected' : '') + '>' + GN.esc(GN.t('txSourceGeneral'))     + '</option>' +
      '<option value="equipment"'   + (f.source === 'equipment'   ? ' selected' : '') + '>' + GN.esc(GN.t('txSourceEquipment'))   + '</option>' +
      '<option value="maintenance"' + (f.source === 'maintenance' ? ' selected' : '') + '>' + GN.esc(GN.t('txSourceMaintenance')) + '</option>' +
      '<option value="operations"'  + (f.source === 'operations'  ? ' selected' : '') + '>' + GN.esc(GN.t('txSourceOperations'))  + '</option>' +
      '<option value="gold"'        + (f.source === 'gold'        ? ' selected' : '') + '>' + GN.esc(GN.t('txSourceGold'))        + '</option></select></div>' +
    '<div class="ff-field"><label>' + GN.esc(GN.t('txFilterService')) + '</label>' +
      '<select id="ff_svc"><option value="">' + GN.esc(GN.t('txFilterAll')) + '</option>' +
      '<option value="gold"'  + (f.service_type === 'gold'  ? ' selected' : '') + '>' + GN.esc(GN.t('txGold'))  + '</option>' +
      '<option value="lab"'   + (f.service_type === 'lab'   ? ' selected' : '') + '>' + GN.esc(GN.t('txLab'))   + '</option>' +
      '<option value="other"' + (f.service_type === 'other' ? ' selected' : '') + '>' + GN.esc(GN.t('txOther')) + '</option></select></div>' +
    '<div class="ff-field"><label>' + GN.esc(GN.t('txFilterAmountMin')) + '</label>' +
      '<input type="number" id="ff_amt_min" min="0" value="' + GN.escAttr(f.amount_min) + '"></div>' +
    '<div class="ff-field"><label>' + GN.esc(GN.t('txFilterAmountMax')) + '</label>' +
      '<input type="number" id="ff_amt_max" min="0" value="' + GN.escAttr(f.amount_max) + '"></div>' +
    '<div class="ff-actions">' +
      '<button class="btn btn-sec btn-sm" data-act="tx-clear">' + GN.esc(GN.t('txFilterClear')) + '</button>' +
      '<button class="btn btn-pri btn-sm" data-act="tx-apply">' + GN.esc(GN.t('txFilterApply')) + '</button></div>' +
  '</div>';
};

GN.readTxFilters = function(){
  var g = function(id){ var el = document.getElementById(id); return el ? el.value.trim() : ''; };
  GN.txFilters = {
    search: g('ff_search'),
    date_from: g('ff_date_from'),
    date_to: g('ff_date_to'),
    type: g('ff_type'),
    currency: g('ff_currency'),
    source: g('ff_source'),
    service_type: g('ff_svc'),
    department: GN.txFilters.department || '',
    amount_min: g('ff_amt_min'),
    amount_max: g('ff_amt_max')
  };
};

GN.clearTxFilters = function(){
  GN.txFilters = {
    search:'', date_from:'', date_to:'', type:'', currency:'',
    source:'', service_type:'', department:'', amount_min:'', amount_max:''
  };
  ['ff_search','ff_date_from','ff_date_to','ff_amt_min','ff_amt_max'].forEach(function(id){
    var el = document.getElementById(id); if (el) el.value = '';
  });
  ['ff_type','ff_currency','ff_source','ff_svc'].forEach(function(id){
    var el = document.getElementById(id); if (el) el.value = '';
  });
  GN.loadTransactions();
};

GN.loadTransactions = function(){
  if (!GN.supa) return;
  var wrap = document.getElementById('txTableWrap');
  if (wrap) wrap.innerHTML = '<div class="empty"><div class="ic">' + GN.navIcon('dollar') + '</div><h4>' + GN.esc(GN.t('loading')) + '</h4></div>';

  var q = GN.supa.from('transactions').select('*');
  var f = GN.txFilters;
  if (f.date_from)     q = q.gte('transaction_date', f.date_from);
  if (f.date_to)       q = q.lte('transaction_date', f.date_to);
  if (f.type)          q = q.eq('type', f.type);
  if (f.currency)      q = q.eq('currency', f.currency);
  if (f.source)        q = q.eq('source', f.source);
  if (f.service_type)  q = q.eq('service_type', f.service_type);
  if (f.department)    q = q.eq('department', f.department);
  if (f.search)        q = q.ilike('description', '%' + f.search + '%');
  if (f.amount_min)    q = q.gte('amount', Number(f.amount_min));
  if (f.amount_max)    q = q.lte('amount', Number(f.amount_max));

  q.order('transaction_date', { ascending: false })
   .order('created_at', { ascending: false })
   .limit(500)
   .then(function(res){
     if (res.error){
       console.error('[tx]', res.error);
       if (wrap) wrap.innerHTML = '<div class="empty"><h4>خطأ في التحميل</h4><p>' + GN.esc(res.error.message) + '</p></div>';
       return;
     }
     var arr = res.data || [];
     GN.renderOpKpis(arr);
     GN.renderTransactionsTable(arr);
     GN.renderTxCharts(arr);
   });
};

GN.renderOpKpis = function(arr){
  var box = document.getElementById('finOpKpis');
  if (!box) return;

  var totalIn = 0, totalOut = 0, count = arr.length;
  arr.forEach(function(t){
    var amt = Number(t.amount_sdg || t.amount || 0);
    if (t.type === 'in') totalIn += amt; else totalOut += amt;
  });

  var cnt = document.getElementById('txCount');
  if (cnt) cnt.textContent = count + ' ' + GN.t('txFilterCount');

  var net = totalIn - totalOut;
  box.innerHTML =
    '<div class="fin-kpi in"><div class="ic">' + GN.navIcon('check') + '</div>' +
      '<div class="body"><div class="lbl">' + GN.esc(GN.t('txTotalIn')) + '</div>' +
      '<div class="val">' + GN.formatNum(totalIn) + '<span class="cur">SDG</span></div></div></div>' +
    '<div class="fin-kpi out"><div class="ic">' + GN.navIcon('dollar') + '</div>' +
      '<div class="body"><div class="lbl">' + GN.esc(GN.t('txTotalOut')) + '</div>' +
      '<div class="val">' + GN.formatNum(totalOut) + '<span class="cur">SDG</span></div></div></div>' +
    '<div class="fin-kpi net"><div class="ic">' + GN.navIcon('chart') + '</div>' +
      '<div class="body"><div class="lbl">' + GN.esc(GN.t('txNet')) + '</div>' +
      '<div class="val" style="color:' + (net >= 0 ? 'var(--ok)' : 'var(--bad)') + '">' +
        (net >= 0 ? '+' : '') + GN.formatNum(net) + '<span class="cur">SDG</span></div></div></div>' +
    '<div class="fin-kpi"><div class="ic">' + GN.navIcon('check') + '</div>' +
      '<div class="body"><div class="lbl">' + GN.esc(GN.t('txFilterResults')) + '</div>' +
      '<div class="val">' + GN.formatNum(count) + '</div></div></div>';
};

GN.renderTxCharts = function(arr){
  if (typeof Chart === 'undefined') return;
  Chart.defaults.font.family = "'Cairo', sans-serif";
  Chart.defaults.font.size = 11;
  Chart.defaults.color = '#5A6B68';

  function destroy(k){
    if (GN._txChartRefs[k]){
      try { GN._txChartRefs[k].destroy(); } catch (e) {}
      GN._txChartRefs[k] = null;
    }
  }
  function wrapEmpty(canvas){
    var parent = canvas.parentElement;
    if (!parent) return;
    canvas.style.display = 'none';
    if (!parent.querySelector('.chart-empty')){
      var div = document.createElement('div');
      div.className = 'chart-empty';
      div.textContent = GN.t('chartNoData');
      parent.appendChild(div);
    }
  }

  /* Monthly */
  var months = {};
  arr.forEach(function(t){
    var dt = (t.transaction_date || '').slice(0, 7);
    if (!dt) return;
    if (!months[dt]) months[dt] = { in:0, out:0 };
    var amt = Number(t.amount_sdg || t.amount || 0);
    if (t.type === 'in') months[dt].in += amt; else months[dt].out += amt;
  });
  var monthKeys = Object.keys(months).sort();

  destroy('monthly');
  var elM = document.getElementById('chartMonthly');
  if (elM && monthKeys.length){
    GN._txChartRefs.monthly = new Chart(elM, {
      type: 'line',
      data: {
        labels: monthKeys,
        datasets: [
          { label: GN.t('chartIn'),  data: monthKeys.map(function(k){ return months[k].in;  }), borderColor:'#2B7A55', backgroundColor:'rgba(43,122,85,.1)',  tension:.35, fill:true, borderWidth:2, pointRadius:3 },
          { label: GN.t('chartOut'), data: monthKeys.map(function(k){ return months[k].out; }), borderColor:'#B33A2A', backgroundColor:'rgba(179,58,42,.1)', tension:.35, fill:true, borderWidth:2, pointRadius:3 }
        ]
      },
      options: {
        responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ position:'bottom', labels:{ boxWidth:12, padding:8 } } },
        scales:{
          y:{ beginAtZero:true, ticks:{ callback:function(v){ return Number(v).toLocaleString(); } } },
          x:{ grid:{ display:false } }
        }
      }
    });
  } else if (elM) wrapEmpty(elM);

  /* Service */
  var svc = { gold:0, lab:0, other:0 };
  arr.forEach(function(t){
    var k = t.service_type || 'other';
    svc[k] = (svc[k] || 0) + Number(t.amount_sdg || t.amount || 0);
  });
  var svcLabels = [], svcData = [];
  if (svc.gold)  { svcLabels.push(GN.t('txGold'));  svcData.push(svc.gold);  }
  if (svc.lab)   { svcLabels.push(GN.t('txLab'));   svcData.push(svc.lab);   }
  if (svc.other) { svcLabels.push(GN.t('txOther')); svcData.push(svc.other); }

  destroy('service');
  var elS = document.getElementById('chartService');
  if (elS && svcData.length){
    GN._txChartRefs.service = new Chart(elS, {
      type: 'doughnut',
      data: {
        labels: svcLabels,
        datasets: [{
          data: svcData,
          backgroundColor: ['#C79A3D','#1E6B67','#5FA19C','#B33A2A'],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive:true, maintainAspectRatio:false, cutout:'62%',
        plugins:{ legend:{ position:'bottom', labels:{ boxWidth:12, padding:8 } } }
      }
    });
  } else if (elS) wrapEmpty(elS);

  /* Department */
  var dept = {};
  arr.forEach(function(t){
    if (t.type !== 'out') return;
    var k = t.department || '—';
    dept[k] = (dept[k] || 0) + Number(t.amount_sdg || t.amount || 0);
  });
  var dKeys = Object.keys(dept).sort(function(a, b){ return dept[b] - dept[a]; }).slice(0, 6);

  destroy('dept');
  var elD = document.getElementById('chartDept');
  if (elD && dKeys.length){
    GN._txChartRefs.dept = new Chart(elD, {
      type: 'bar',
      data: {
        labels: dKeys,
        datasets: [{ label: GN.t('chartOut'), data: dKeys.map(function(k){ return dept[k]; }), backgroundColor:'#1E6B67', borderRadius:6 }]
      },
      options: {
        responsive:true, maintainAspectRatio:false, indexAxis:'y',
        plugins:{ legend:{ display:false } },
        scales:{ x:{ beginAtZero:true, ticks:{ callback:function(v){ return Number(v).toLocaleString(); } } } }
      }
    });
  } else if (elD) wrapEmpty(elD);

  /* Source */
  var srcMap = {};
  arr.forEach(function(t){
    var k = t.source || 'general';
    srcMap[k] = (srcMap[k] || 0) + Number(t.amount_sdg || t.amount || 0);
  });
  var sKeys = Object.keys(srcMap).sort(function(a, b){ return srcMap[b] - srcMap[a]; }).slice(0, 6);
  var srcLabelMap = {
    general:     GN.t('txSourceGeneral'),
    equipment:   GN.t('txSourceEquipment'),
    maintenance: GN.t('txSourceMaintenance'),
    operations:  GN.t('txSourceOperations'),
    gold:        GN.t('txSourceGold')
  };

  destroy('source');
  var elSrc = document.getElementById('chartSource');
  if (elSrc && sKeys.length){
    GN._txChartRefs.source = new Chart(elSrc, {
      type: 'bar',
      data: {
        labels: sKeys.map(function(k){ return srcLabelMap[k] || k; }),
        datasets: [{ label: GN.t('txList'), data: sKeys.map(function(k){ return srcMap[k]; }), backgroundColor:'#C79A3D', borderRadius:6 }]
      },
      options: {
        responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ display:false } },
        scales:{ y:{ beginAtZero:true, ticks:{ callback:function(v){ return Number(v).toLocaleString(); } } } }
      }
    });
  } else if (elSrc) wrapEmpty(elSrc);
};

GN.renderTransactionsTable = function(arr){
  var wrap = document.getElementById('txTableWrap');
  if (!wrap) return;

  if (!arr.length){
    wrap.innerHTML = '<div class="empty"><div class="ic">' + GN.navIcon('dollar') + '</div>' +
      '<h4>' + GN.esc(GN.t('txEmpty')) + '</h4><p>' + GN.esc(GN.t('txAddFirst')) + '</p></div>';
    return;
  }

  var isAdmin = GN.session.isOwner && GN.session.isAdmin;

  wrap.innerHTML = '<table class="tx-table"><thead><tr>' +
    '<th>' + GN.esc(GN.t('txType')) + '</th>' +
    '<th>' + GN.esc(GN.t('txDate')) + '</th>' +
    '<th>' + GN.esc(GN.t('txAmount')) + '</th>' +
    '<th>' + GN.esc(GN.t('txServiceType')) + '</th>' +
    '<th>' + GN.esc(GN.t('txDepartment')) + '</th>' +
    '<th>' + GN.esc(GN.t('txDescription')) + '</th>' +
    '<th></th>' + (isAdmin ? '<th></th>' : '') +
  '</tr></thead><tbody>' + arr.map(function(t){
    var isIn = t.type === 'in';
    var cur = t.currency || 'SDG';
    var amountSdg = Number(t.amount_sdg || 0);
    var catLabel = t.transaction_category === 'buy_sell'
      ? GN.t('txCatBuySell')
      : (t.transaction_category === 'service' ? GN.t('txCatService') : GN.t('txCatOther'));
    var svcLabel = t.service_type === 'gold'
      ? GN.t('txGold')
      : (t.service_type === 'lab' ? GN.t('txLab') : GN.t('txOther'));

    return '<tr data-notif-id="' + GN.escAttr(t.id || '') + '">' +
      '<td><span class="tx-type-chip ' + (isIn ? 'in' : 'out') + '">' + GN.esc(isIn ? GN.t('txIn') : GN.t('txOut')) + '</span></td>' +
      '<td><bdi>' + GN.esc(GN.formatDate(t.transaction_date)) + '</bdi></td>' +
      '<td><span class="tx-amount ' + (isIn ? 'in' : 'out') + '">' +
        (isIn ? '+' : '−') + ' ' + GN.formatNum(t.amount, 2) + ' <span class="cur">' + GN.esc(cur) + '</span>' +
        (cur === 'USD' && amountSdg ? '<span class="sdg">≈ ' + GN.formatNum(amountSdg) + ' SDG</span>' : '') +
      '</span></td>' +
      '<td>' + GN.esc(catLabel) + '<div style="font-size:10.5px;color:var(--ink-3);margin-top:2px">' + GN.esc(svcLabel) + '</div></td>' +
      '<td>' + GN.esc(t.department || '-') + '</td>' +
      '<td><div class="tx-desc-cell" title="' + GN.escAttr(t.description || '') + '">' + GN.esc(t.description || '-') + '</div></td>' +
      '<td>' + (t.attachment_url
        ? '<a class="tx-attach-link" href="' + GN.escAttr(t.attachment_url) + '" target="_blank" rel="noopener" title="فتح المرفق"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg></a>'
        : '—') + '</td>' +
      (isAdmin
        ? '<td><div class="tx-actions">' +
            '<button class="tx-act-btn" data-tx-act="edit" data-tx-id="' + GN.escAttr(t.id) + '" title="' + GN.escAttr(GN.t('txEdit')) + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg></button>' +
            '<button class="tx-act-btn del" data-tx-act="del" data-tx-id="' + GN.escAttr(t.id) + '" title="' + GN.escAttr(GN.t('delete')) + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M8 6V4h8v2M6 6v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6"/></svg></button>' +
          '</div></td>'
        : '') +
    '</tr>';
  }).join('') + '</tbody></table>';

  GN.$$('[data-tx-act]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var act = btn.getAttribute('data-tx-act');
      var id = btn.getAttribute('data-tx-id');
      if (act === 'del') GN.deleteTransaction(id);
      else if (act === 'edit') GN.editTransaction(id);
    });
  });
};

GN.applyBankChange = function(bankId, delta, cb){
  if (!bankId || !delta){ if (cb) cb(true); return; }
  var d = GN.dash.data;
  if (!d || !d.dashboard || !d.dashboard.banks){ if (cb) cb(false); return; }

  var b = d.dashboard.banks.filter(function(x){ return x.id === bankId; })[0];
  if (!b){ if (cb) cb(false); return; }

  b.balance = Number(b.balance || 0) + Number(delta);
  GN.savePublicData(d).then(function(ok){ if (cb) cb(ok); });
};

GN.editTransaction = function(id){
  GN.supa.from('transactions').select('*').eq('id', id).single().then(function(res){
    if (res.error){ GN.toast(res.error.message, 'bad'); return; }
    GN.openTransactionForm(res.data);
  });
};

GN.deleteTransaction = function(id){
  if (!GN.session.isOwner){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }

  GN.confirm({
    title: GN.t('delete'),
    text: GN.t('txDeleteConfirm'),
    okText: GN.t('delete'),
    cancelText: GN.t('cancel'),
    danger: true
  }).then(function(ok){
    if (!ok) return;
    GN.supa.from('transactions').select('*').eq('id', id).single().then(function(fRes){
      if (fRes.error){ GN.toast(fRes.error.message, 'bad'); return; }
      var tx = fRes.data;

      GN.supa.from('transactions').delete().eq('id', id).then(function(res){
        if (res.error){ GN.toast(res.error.message, 'bad'); return; }
        GN.notify.markDeleted('finance', 'transaction', id);
        if (tx.payment_method === 'bank' && tx.bank_id){
          var dlt = tx.type === 'in' ? -Number(tx.amount) : Number(tx.amount);
          GN.applyBankChange(tx.bank_id, dlt, function(){
            GN.toast(GN.t('txDeleted'), 'ok');
            GN.loadTransactions();
          });
        } else {
          GN.toast(GN.t('txDeleted'), 'ok');
          GN.loadTransactions();
        }
      });
    });
  });
};

GN.bindSection.finance = function(){
  GN.bindAction('add-tx-new', function(){
    if (!GN.session.isOwner || !GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
    GN.openTransactionForm(null);
  });
  GN.bindAction('add-payment',  function(){ GN.openPaymentForm(-1); });
  GN.bindAction('edit-payment', function(btn){ GN.openPaymentForm(+btn.getAttribute('data-idx')); });
  GN.bindAction('del-payment',  function(btn){ GN.delPayment(+btn.getAttribute('data-idx')); });
  GN.bindAction('add-fixed',    function(btn){ GN.openFixedForm(btn.getAttribute('data-key'), -1); });
  GN.bindAction('edit-fixed',   function(btn){ GN.openFixedForm(btn.getAttribute('data-key'), +btn.getAttribute('data-idx')); });
  GN.bindAction('del-fixed',    function(btn){ GN.delFixed(btn.getAttribute('data-key'), +btn.getAttribute('data-idx')); });
  GN.bindAction('tx-apply',     function(){ GN.readTxFilters(); GN.loadTransactions(); });
  GN.bindAction('tx-clear',     function(){ GN.clearTxFilters(); });

  var s = document.getElementById('ff_search');
  if (s) s.addEventListener('keydown', function(e){
    if (e.key === 'Enter'){ GN.readTxFilters(); GN.loadTransactions(); }
  });

  GN.$$('[data-collapse]').forEach(function(head){
    head.addEventListener('click', function(){
      var id = head.getAttribute('data-collapse');
      var el = document.getElementById(id);
      if (el) el.classList.toggle('open');
    });
  });
};

/* ============================================================
   Finance Forms
   ============================================================ */
GN.openPaymentForm = function(idx){
  if (!GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  var inv = GN.dh.dash().investment = GN.dh.dash().investment || {};
  var arr = inv.payments = inv.payments || [];
  var item = idx >= 0 ? arr[idx] : {};

  GN.openForm('add', [
    { id:'date',     label: GN.t('date'), type:'date', value:item.date || GN.today() },
    { id:'amount',   label: GN.t('amount'), type:'number', req:true, value:item.amount || 0 },
    { id:'currency', label: GN.t('currency'), value:item.currency || 'USD' },
    { id:'bank',     label: GN.t('bank'), value:item.bank || '' },
    { id:'notes',    label: GN.t('notes'), type:'textarea', full:true, value:item.notes || '' }
  ]);

  GN.onSubmit(function(done){
    var v = GN.readForm(['date','amount','currency','bank','notes']);
    if (!v.amount || Number(v.amount) <= 0){ GN.toast(GN.t('fieldRequired'), 'bad'); done(false); return; }
    var obj = { id: idx >= 0 ? arr[idx].id : GN.uid(), date: v.date, amount: Number(v.amount), currency: v.currency, bank: v.bank, notes: v.notes };
    if (idx >= 0) Object.assign(arr[idx], obj);
    else arr.push(obj);
    inv.recovered_total = arr.reduce(function(s, x){ return s + Number(x.amount || 0); }, 0);
    done(true);
  });
};

GN.delPayment = function(idx){
  var inv = GN.dh.dash().investment || {};
  var arr = inv.payments || [];
  if (!arr[idx]) return;
  GN.dh.askDelete().then(function(ok){
    if (!ok) return;
    arr.splice(idx, 1);
    inv.recovered_total = arr.reduce(function(s, x){ return s + Number(x.amount || 0); }, 0);
    GN.dh.save();
  });
};

GN.openFixedForm = function(key, idx){
  if (!GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  var fixed = GN.dh.dash().fixed_expenses = GN.dh.dash().fixed_expenses || { daily:[], monthly:[], yearly:[] };
  var arr = fixed[key] = fixed[key] || [];
  var item = idx >= 0 ? arr[idx] : {};

  GN.openForm('add', [
    { id:'name',   label: GN.t('name'), req:true, full:true, value:item.name || '' },
    { id:'amount', label: GN.t('amount'), type:'number', value:item.amount || 0 }
  ]);

  GN.onSubmit(function(done){
    var v = GN.readForm(['name','amount']);
    if (!v.name){ GN.toast(GN.t('fieldRequired'), 'bad'); done(false); return; }
    var obj = { id: idx >= 0 ? arr[idx].id : GN.uid(), name: v.name, amount: Number(v.amount) || 0 };
    if (idx >= 0) Object.assign(arr[idx], obj);
    else arr.push(obj);
    done(true);
  });
};

GN.delFixed = function(key, idx){
  var fixed = GN.dh.dash().fixed_expenses || {};
  var arr = fixed[key] || [];
  if (!arr[idx]) return;
  GN.dh.askDelete().then(function(ok){
    if (!ok) return;
    arr.splice(idx, 1);
    GN.dh.save();
  });
};

console.log('[Gold Nile] dashboard/02-finance.js loaded');
})();