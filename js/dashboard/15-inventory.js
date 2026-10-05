/* ============================================================
   Gold Nile — Dashboard / Gold Inventory
   Traceable stock · Sell from inventory · Realize profits
   ============================================================ */
(function(){
'use strict';

var GN = window.GN = window.GN || {};

GN._inventoryCache = [];
GN._inventoryFilter = { karat: '', status: '' };

/* ============================================================
   Section
   ============================================================ */
GN.sections.inventory = function(){
  var html = '<div class="fin-head"><div>' +
    '<h2>' + GN.navIcon('box') + ' ' + GN.esc(GN.t('invTitle')) + '</h2>' +
    '<span class="sub">' + GN.esc(GN.t('invSub')) + '</span></div></div>';

  html += '<div class="kpi-grid" id="invKpis">' +
    '<div class="kpi"><div class="top"><span class="ic">' + GN.navIcon('box') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('loading')) + '</div><div class="val">—</div></div>' +
    '<div class="kpi"><div class="top"><span class="ic g">' + GN.navIcon('gold') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('loading')) + '</div><div class="val">—</div></div>' +
    '<div class="kpi"><div class="top"><span class="ic y">' + GN.navIcon('dollar') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('loading')) + '</div><div class="val">—</div></div>' +
    '<div class="kpi"><div class="top"><span class="ic ok">' + GN.navIcon('check') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('loading')) + '</div><div class="val">—</div></div>' +
  '</div>';

  html += GN.renderInventoryFilters();

  html += '<div class="card"><div class="card-head">' +
    '<h3>' + GN.navIcon('box') + ' ' + GN.esc(GN.t('invList')) + '</h3>' +
    '<span class="ff-count" id="invCount">—</span></div>' +
    '<div id="invTableWrap"><div class="empty"><div class="ic">' + GN.navIcon('box') + '</div>' +
    '<h4>' + GN.esc(GN.t('loading')) + '</h4></div></div></div>';

  setTimeout(GN.loadInventory, 100);
  return html;
};

/* ============================================================
   Filters
   ============================================================ */
GN.renderInventoryFilters = function(){
  var f = GN._inventoryFilter;
  return '<div class="fin-filters" id="invFilters">' +
    '<div class="ff-field"><label>' + GN.esc(GN.t('invFilterKarat')) + '</label>' +
      '<select id="if_karat">' +
        '<option value="">' + GN.esc(GN.t('cyFilterAll')) + '</option>' +
        '<option value="18"' + (f.karat === '18' ? ' selected' : '') + '>18</option>' +
        '<option value="21"' + (f.karat === '21' ? ' selected' : '') + '>21</option>' +
        '<option value="22"' + (f.karat === '22' ? ' selected' : '') + '>22</option>' +
        '<option value="24"' + (f.karat === '24' ? ' selected' : '') + '>24</option>' +
      '</select></div>' +
    '<div class="ff-field"><label>' + GN.esc(GN.t('invFilterStatus')) + '</label>' +
      '<select id="if_status">' +
        '<option value="">' + GN.esc(GN.t('cyFilterAll')) + '</option>' +
        '<option value="available"' + (f.status === 'available' ? ' selected' : '') + '>' + GN.esc(GN.t('invStatusAvailable')) + '</option>' +
        '<option value="partial"' + (f.status === 'partial' ? ' selected' : '') + '>' + GN.esc(GN.t('invStatusPartial')) + '</option>' +
        '<option value="sold"' + (f.status === 'sold' ? ' selected' : '') + '>' + GN.esc(GN.t('invStatusSold')) + '</option>' +
      '</select></div>' +
    '<div class="ff-actions">' +
      '<button class="btn btn-sec btn-sm" data-act="inv-clear">' + GN.esc(GN.t('cyFilterClear')) + '</button>' +
      '<button class="btn btn-pri btn-sm" data-act="inv-apply">' + GN.esc(GN.t('cyFilterApply')) + '</button></div>' +
  '</div>';
};

GN.readInventoryFilters = function(){
  GN._inventoryFilter = {
    karat: (document.getElementById('if_karat') || {}).value || '',
    status: (document.getElementById('if_status') || {}).value || ''
  };
};

GN.clearInventoryFilters = function(){
  GN._inventoryFilter = { karat: '', status: '' };
  GN.renderSection('inventory');
};

/* ============================================================
   Load
   ============================================================ */
GN.loadInventory = function(){
  if (!GN.supa) return;

  var wrap = document.getElementById('invTableWrap');
  if (wrap){
    wrap.innerHTML = '<div class="empty"><div class="ic">' + GN.navIcon('box') + '</div>' +
      '<h4>' + GN.esc(GN.t('loading')) + '</h4></div>';
  }

  var f = GN._inventoryFilter;
  var q = GN.supa.from('gold_inventory').select('*');
  if (f.karat)  q = q.eq('karat', f.karat);
  if (f.status) q = q.eq('status', f.status);

  q.order('entry_date', { ascending: false }).limit(500).then(function(res){
    if (res.error){
      console.error('[inventory]', res.error);
      if (wrap) wrap.innerHTML = '<div class="empty"><h4>خطأ</h4><p>' + GN.esc(res.error.message) + '</p></div>';
      return;
    }
    GN._inventoryCache = res.data || [];
    GN.renderInventoryKPIs();
    GN.renderInventoryTable();
  });
};

/* ============================================================
   KPIs
   ============================================================ */
GN.renderInventoryKPIs = function(){
  var box = document.getElementById('invKpis');
  if (!box) return;

  var items = GN._inventoryCache;
  var totalG = 0, totalCost = 0, availableCount = 0;
  items.forEach(function(it){
    totalG += Number(it.remaining_grams || 0);
    totalCost += Number(it.cost_per_gram || 0) * Number(it.remaining_grams || 0);
    if (it.status === 'available') availableCount++;
  });
  var avgCost = totalG > 0 ? (totalCost / totalG) : 0;

  box.innerHTML =
    '<div class="kpi hl"><div class="top"><span class="ic">' + GN.navIcon('box') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('invKpiItems')) + '</div>' +
      '<div class="val"><bdi>' + GN.formatNum(items.length) + '</bdi></div>' +
      '<div class="sub">' + GN.esc(GN.t('invKpiAvailable')) + ': ' + GN.formatNum(availableCount) + '</div></div>' +
    '<div class="kpi"><div class="top"><span class="ic g">' + GN.navIcon('gold') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('invKpiWeight')) + '</div>' +
      '<div class="val"><bdi>' + GN.formatNum(totalG, 2) + '</bdi><span class="cur">g</span></div></div>' +
    '<div class="kpi"><div class="top"><span class="ic y">' + GN.navIcon('dollar') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('invKpiValue')) + '</div>' +
      '<div class="val"><bdi>' + GN.formatNum(totalCost) + '</bdi><span class="cur">SDG</span></div></div>' +
    '<div class="kpi"><div class="top"><span class="ic ok">' + GN.navIcon('chart') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('invKpiAvgCost')) + '</div>' +
      '<div class="val"><bdi>' + GN.formatNum(avgCost) + '</bdi><span class="cur">SDG/g</span></div></div>';
};

/* ============================================================
   Table
   ============================================================ */
GN.renderInventoryTable = function(){
  var wrap = document.getElementById('invTableWrap');
  var cnt = document.getElementById('invCount');
  if (!wrap) return;
  var items = GN._inventoryCache;
  if (cnt) cnt.textContent = items.length;

  if (!items.length){
    wrap.innerHTML = '<div class="empty"><div class="ic">' + GN.navIcon('box') + '</div>' +
      '<h4>' + GN.esc(GN.t('invEmpty')) + '</h4>' +
      '<p>' + GN.esc(GN.t('invEmptyAdd')) + '</p></div>';
    return;
  }

  var isAdmin = GN.session.isOwner && GN.session.isAdmin;

  var rows = items.map(function(it){
    var statusCls = it.status === 'available' ? 'ok' : (it.status === 'partial' ? 'w' : 'n');
    var statusLbl = it.status === 'available' ? GN.t('invStatusAvailable')
                  : it.status === 'partial' ? GN.t('invStatusPartial')
                  : GN.t('invStatusSold');

    var currentValue = Number(it.cost_per_gram || 0) * Number(it.remaining_grams || 0);

    return '<tr data-notif-id="' + GN.escAttr(it.id) + '">' +
      '<td>' + GN.esc(GN.formatDate(it.entry_date)) + '</td>' +
      '<td>' + GN.esc(it.karat || '-') + '</td>' +
      '<td class="num">' + GN.formatNum(it.weight_grams, 2) + 'g</td>' +
      '<td class="num"><b>' + GN.formatNum(it.remaining_grams, 2) + 'g</b></td>' +
      '<td class="num">' + GN.formatMoneyPlain(it.cost_per_gram, 'SDG') + '</td>' +
      '<td class="num">' + GN.formatMoneyPlain(currentValue, 'SDG') + '</td>' +
      '<td>' + GN.esc(it.storage_location || '-') + '</td>' +
      '<td><span class="chip ' + statusCls + '"><span class="dot"></span>' + GN.esc(statusLbl) + '</span></td>' +
      (isAdmin
        ? '<td class="actions"><div class="row-actions">' +
            (it.status !== 'sold'
              ? '<button class="icon-act" data-inv-act="sell" data-inv-id="' + GN.escAttr(it.id) + '" title="بيع من المخزون"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></button>'
              : '') +
            '<button class="icon-act" data-inv-act="view" data-inv-id="' + GN.escAttr(it.id) + '" title="' + GN.escAttr(GN.t('view')) + '">' + GN.ICO_VIEW + '</button>' +
            '<button class="icon-act del" data-inv-act="del" data-inv-id="' + GN.escAttr(it.id) + '" title="' + GN.escAttr(GN.t('delete')) + '">' + GN.ICO_DEL + '</button>' +
          '</div></td>'
        : '<td class="actions"><div class="row-actions">' +
            '<button class="icon-act" data-inv-act="view" data-inv-id="' + GN.escAttr(it.id) + '" title="' + GN.escAttr(GN.t('view')) + '">' + GN.ICO_VIEW + '</button>' +
          '</div></td>') +
    '</tr>';
  }).join('');

  wrap.innerHTML = '<div class="table-wrap"><table><thead><tr>' +
    '<th>' + GN.esc(GN.t('invEntryDate')) + '</th>' +
    '<th>' + GN.esc(GN.t('cycleKarat')) + '</th>' +
    '<th>' + GN.esc(GN.t('invWeight')) + '</th>' +
    '<th>' + GN.esc(GN.t('invRemaining')) + '</th>' +
    '<th>' + GN.esc(GN.t('invCostPerGram')) + '</th>' +
    '<th>' + GN.esc(GN.t('invValue')) + '</th>' +
    '<th>' + GN.esc(GN.t('invStorage')) + '</th>' +
    '<th>' + GN.esc(GN.t('cycleStatus')) + '</th>' +
    '<th></th></tr></thead><tbody>' + rows + '</tbody></table></div>';

  GN.$$('[data-inv-act]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var act = btn.getAttribute('data-inv-act');
      var id = btn.getAttribute('data-inv-id');
      if (act === 'view') GN.viewInventoryDetails(id);
      else if (act === 'sell') GN.openInventorySaleForm(id);
      else if (act === 'del') GN.deleteInventoryItem(id);
    });
  });
};

/* ============================================================
   View Details
   ============================================================ */
GN.viewInventoryDetails = function(id){
  var item = GN._inventoryCache.filter(function(x){ return x.id === id; })[0];
  if (!item) return;

  var overlay = document.getElementById('invDetailsOverlay');
  if (overlay) overlay.remove();

  overlay = document.createElement('div');
  overlay.id = 'invDetailsOverlay';
  overlay.className = 'overlay on';
  overlay.style.zIndex = '250';

  overlay.innerHTML = '<div class="modal wide" style="max-width:760px">' +
    '<div class="modal-head">' +
      '<h3>' + GN.esc(GN.t('invDetailsTitle')) + ' — ' + GN.formatNum(item.remaining_grams, 2) + 'g</h3>' +
      '<button class="close" type="button" data-ivd-close><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>' +
    '</div>' +
    '<div class="modal-body" id="ivdBody"><div class="empty"><h4>' + GN.esc(GN.t('loading')) + '</h4></div></div>' +
  '</div>';

  document.body.appendChild(overlay);
  function closeFn(){ overlay.remove(); }
  overlay.querySelector('[data-ivd-close]').onclick = closeFn;
  overlay.addEventListener('click', function(e){ if (e.target === overlay) closeFn(); });

  /* Load source cycle + sales */
  Promise.all([
    item.source_cycle_id
      ? GN.supa.from('gold_cycles').select('code').eq('id', item.source_cycle_id).single()
      : Promise.resolve({ data: null }),
    GN.supa.from('inventory_sales').select('*').eq('inventory_id', id).order('sale_date', { ascending: false })
  ]).then(function(res){
    var sourceCycle = res[0].data;
    var sales = res[1].data || [];
    GN._renderInventoryDetailsBody(item, sourceCycle, sales);
  });
};

GN._renderInventoryDetailsBody = function(item, sourceCycle, sales){
  var body = document.getElementById('ivdBody');
  if (!body) return;

  var totalSoldG = 0, totalRevenue = 0, totalProfit = 0, totalRealized = 0, totalPending = 0;
  sales.forEach(function(s){
    totalSoldG += Number(s.quantity_grams || 0);
    totalRevenue += Number(s.selling_total || 0);
    totalProfit += Number(s.net_profit || 0);
    if (s.profit_status === 'realized') totalRealized += Number(s.net_profit || 0);
    else totalPending += Number(s.net_profit || 0);
  });

  var isAdmin = GN.session.isOwner && GN.session.isAdmin;

  var html = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">' +

    '<div class="card" style="margin:0"><div class="card-head"><h3>بيانات المخزون</h3></div>' +
      '<table style="width:100%;font-size:12.5px">' +
        '<tr><td style="padding:5px 0;color:var(--ink-2);font-weight:700">تاريخ الإدخال</td><td style="text-align:end">' + GN.esc(GN.formatDate(item.entry_date)) + '</td></tr>' +
        '<tr><td style="padding:5px 0;color:var(--ink-2);font-weight:700">العيار</td><td style="text-align:end">' + GN.esc(item.karat || '-') + '</td></tr>' +
        '<tr><td style="padding:5px 0;color:var(--ink-2);font-weight:700">الوزن الأصلي</td><td style="text-align:end">' + GN.formatNum(item.weight_grams, 2) + 'g</td></tr>' +
        '<tr><td style="padding:5px 0;color:var(--ink-2);font-weight:700">المتبقي</td><td style="text-align:end;font-weight:800">' + GN.formatNum(item.remaining_grams, 2) + 'g</td></tr>' +
        '<tr><td style="padding:5px 0;color:var(--ink-2);font-weight:700">سعر التكلفة/g</td><td style="text-align:end">' + GN.formatMoneyPlain(item.cost_per_gram, 'SDG') + '</td></tr>' +
        (sourceCycle ? '<tr><td style="padding:5px 0;color:var(--ink-2);font-weight:700">الدورة المصدر</td><td style="text-align:end"><bdi dir="ltr" style="font-family:monospace;font-size:11.5px">' + GN.esc(sourceCycle.code) + '</bdi></td></tr>' : '') +
        (item.storage_location ? '<tr><td style="padding:5px 0;color:var(--ink-2);font-weight:700">موقع التخزين</td><td style="text-align:end">' + GN.esc(item.storage_location) + '</td></tr>' : '') +
      '</table>' +
    '</div>' +

    '<div class="card" style="margin:0"><div class="card-head"><h3>ملخص البيعات</h3></div>' +
      '<table style="width:100%;font-size:12.5px">' +
        '<tr><td style="padding:5px 0;color:var(--ink-2);font-weight:700">عدد البيعات</td><td style="text-align:end">' + GN.formatNum(sales.length) + '</td></tr>' +
        '<tr><td style="padding:5px 0;color:var(--ink-2);font-weight:700">إجمالي المُباع</td><td style="text-align:end">' + GN.formatNum(totalSoldG, 2) + 'g</td></tr>' +
        '<tr><td style="padding:5px 0;color:var(--ink-2);font-weight:700">إجمالي الإيراد</td><td style="text-align:end">' + GN.formatMoneyPlain(totalRevenue, 'SDG') + '</td></tr>' +
        '<tr style="border-top:1px solid var(--line-2)"><td style="padding:8px 0;font-weight:800">صافي الربح</td><td style="text-align:end;font-weight:800;font-size:14px;color:' + (totalProfit >= 0 ? 'var(--ok)' : 'var(--bad)') + '">' + (totalProfit >= 0 ? '+' : '') + GN.formatMoneyPlain(totalProfit, 'SDG') + '</td></tr>' +
        '<tr><td style="padding:5px 0;color:var(--ok);font-weight:700">محقق</td><td style="text-align:end;color:var(--ok)">' + GN.formatMoneyPlain(totalRealized, 'SDG') + '</td></tr>' +
        '<tr><td style="padding:5px 0;color:var(--warn);font-weight:700">معلق</td><td style="text-align:end;color:var(--warn)">' + GN.formatMoneyPlain(totalPending, 'SDG') + '</td></tr>' +
      '</table>' +
    '</div>' +
  '</div>';

  /* Sales list */
  html += '<div class="card"><div class="card-head"><h3>' + GN.navIcon('dollar') + ' سجل البيعات (' + sales.length + ')</h3></div>';

  if (!sales.length){
    html += '<div class="empty"><div class="ic">' + GN.navIcon('dollar') + '</div><h4>لا توجد بيعات بعد</h4></div>';
  } else {
    html += '<div class="table-wrap"><table><thead><tr>' +
      '<th>التاريخ</th><th>الكمية</th><th>سعر البيع/g</th><th>الإجمالي</th>' +
      '<th>صافي الربح</th><th>الحالة</th>' +
      (isAdmin ? '<th></th>' : '') +
    '</tr></thead><tbody>';

    sales.forEach(function(s){
      var pColor = Number(s.net_profit) >= 0 ? 'var(--ok)' : 'var(--bad)';
      var statusBadge = s.profit_status === 'realized'
        ? '<span class="chip ok"><span class="dot"></span>محقق</span>'
        : '<span class="chip w"><span class="dot"></span>معلق</span>';

      html += '<tr>' +
        '<td>' + GN.esc(GN.formatDate(s.sale_date)) + '</td>' +
        '<td class="num">' + GN.formatNum(s.quantity_grams, 2) + 'g</td>' +
        '<td class="num">' + GN.formatMoneyPlain(s.selling_price_per_gram, 'SDG') + '</td>' +
        '<td class="num">' + GN.formatMoneyPlain(s.selling_total, 'SDG') + '</td>' +
        '<td class="num" style="color:' + pColor + ';font-weight:800">' + (Number(s.net_profit) >= 0 ? '+' : '') + GN.formatMoneyPlain(s.net_profit, 'SDG') + '</td>' +
        '<td>' + statusBadge + '</td>' +
        (isAdmin ? '<td class="actions"><div class="row-actions">' +
          (s.profit_status === 'pending'
            ? '<button class="icon-act" data-invsale-act="realize" data-sale-id="' + GN.escAttr(s.id) + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M20 6 9 17l-5-5"/></svg></button>'
            : '') +
          '<button class="icon-act del" data-invsale-act="del" data-sale-id="' + GN.escAttr(s.id) + '" data-inv-id="' + GN.escAttr(item.id) + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M8 6V4h8v2M6 6v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6"/></svg></button>' +
        '</div></td>' : '') +
      '</tr>';
    });
    html += '</tbody></table></div>';
  }
  html += '</div>';

  body.innerHTML = html;

  /* Wire actions */
  var overlay = document.getElementById('invDetailsOverlay');
  overlay.querySelectorAll('[data-invsale-act]').forEach(function(b){
    b.onclick = function(){
      var act = b.getAttribute('data-invsale-act');
      var sid = b.getAttribute('data-sale-id');
      if (act === 'realize'){
        /* Reuse cycle realize logic */
        GN.realizeProfit(sid, null, function(){
          GN.viewInventoryDetails(item.id);
          GN.loadInventory();
        });
      } else if (act === 'del'){
        GN.deleteInventorySale(sid, item.id);
      }
    };
  });
};

/* ============================================================
   Sell from inventory
   ============================================================ */
GN.openInventorySaleForm = function(invId){
  if (!GN.session.isOwner || !GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }

  var item = GN._inventoryCache.filter(function(x){ return x.id === invId; })[0];
  if (!item) return;

  var body = document.getElementById('formModalBody');
  var titleEl = document.getElementById('formModalTitle');
  if (!body || !titleEl) return;

  titleEl.textContent = 'بيع من المخزون — ' + GN.formatNum(item.remaining_grams, 2) + 'g متاح';
  var maxG = Number(item.remaining_grams || 0);
  var now = new Date();
  var todayDate = now.toISOString().slice(0,10);
  var nowTime = String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');

  body.innerHTML =
    '<div class="form-grid">' +
      '<div class="field full" style="background:var(--gold-l);color:var(--gold-d);padding:10px 12px;border-radius:10px;font-size:12.5px;font-weight:700;text-align:center">' +
        'المتبقي: ' + GN.formatNum(maxG, 2) + 'g · التكلفة: ' + GN.formatMoneyPlain(item.cost_per_gram, 'SDG') + '/g' +
      '</div>' +

      '<div class="field"><label>تاريخ البيع <span class="req">*</span></label>' +
        '<div class="input-wrap"><input type="date" id="ivs_date" value="' + todayDate + '"></div></div>' +
      '<div class="field"><label>وقت البيع</label>' +
        '<div class="input-wrap"><input type="time" id="ivs_time" value="' + nowTime + '"></div></div>' +

      '<div class="field"><label>الكمية (g) <span class="req">*</span></label>' +
        '<div class="input-wrap"><input type="number" id="ivs_qty" step="0.001" min="0.001" max="' + maxG + '" value="' + maxG + '"></div></div>' +
      '<div class="field"><label>سعر البيع/جرام <span class="req">*</span></label>' +
        '<div class="input-wrap"><input type="number" id="ivs_ppg" step="0.01" min="0"></div></div>' +

      '<div class="field full"><label>إجمالي البيع</label>' +
        '<div class="input-wrap"><input type="number" id="ivs_total" readonly style="background:var(--bg-alt);font-weight:700"></div></div>' +
    '</div>' +

    /* Location */
    '<div style="margin-top:18px;padding-top:14px;border-top:1px solid var(--line-2)">' +
      '<div style="font-weight:800;font-size:13px;margin-bottom:10px;color:var(--ink-2)">موقع البيع</div>' +
      '<div class="form-grid">' +
        '<div class="field"><label>الولاية</label><div class="input-wrap"><select id="ivs_state"><option value="">—</option></select></div></div>' +
        '<div class="field"><label>المدينة</label><div class="input-wrap"><select id="ivs_city"><option value="">—</option></select></div></div>' +
        '<div class="field full"><label>المكان / السوق</label><div class="input-wrap"><select id="ivs_place"><option value="">—</option></select></div></div>' +
      '</div>' +
    '</div>' +

    /* Agent */
    '<div style="margin-top:18px;padding-top:14px;border-top:1px solid var(--line-2)">' +
      '<div style="font-weight:800;font-size:13px;margin-bottom:10px;color:var(--ink-2)">المندوب (اختياري)</div>' +
      '<div class="form-grid">' +
        '<div class="field"><label>المندوب</label><div class="input-wrap"><select id="ivs_agent"><option value="">— لا يوجد —</option></select></div></div>' +
        '<div class="field"><label>عمولة البيع %</label><div class="input-wrap"><input type="number" id="ivs_agent_pct" step="0.001" min="0" value="0"></div></div>' +
      '</div>' +
    '</div>' +

    /* Tax & Fee */
    '<div style="margin-top:18px;padding-top:14px;border-top:1px solid var(--line-2)">' +
      '<div style="font-weight:800;font-size:13px;margin-bottom:10px;color:var(--ink-2)">الضريبة والرسوم</div>' +
      '<div class="form-grid">' +
        '<div class="field"><label>نوع الضريبة</label>' +
          '<div class="input-wrap"><select id="ivs_tax_type">' +
            '<option value="none">لا يوجد</option>' +
            '<option value="percent">نسبة %</option>' +
            '<option value="fixed">مبلغ ثابت</option>' +
          '</select></div></div>' +
        '<div class="field"><label>قيمة الضريبة</label><div class="input-wrap"><input type="number" id="ivs_tax_value" step="0.01" min="0" value="0"></div></div>' +
        '<div class="field"><label>رسوم إضافية</label><div class="input-wrap"><input type="number" id="ivs_fee" step="0.01" min="0" value="0"></div></div>' +
        '<div class="field"><label>وصف الرسوم</label><div class="input-wrap"><input type="text" id="ivs_fee_desc"></div></div>' +
      '</div>' +
    '</div>' +

    /* Summary */
    '<div style="margin-top:18px;padding-top:14px;border-top:1px solid var(--line-2)">' +
      '<div class="form-grid">' +
        '<div class="field"><label>تكلفة البضاعة</label><div class="input-wrap"><input type="number" id="ivs_cost" readonly style="background:var(--bg-alt)"></div></div>' +
        '<div class="field full"><label style="color:var(--gold-d);font-weight:800">صافي الربح المتوقع</label><div class="input-wrap"><input type="number" id="ivs_net" readonly style="background:var(--gold-l);color:var(--gold-dd);font-weight:800;font-size:16px"></div></div>' +
      '</div>' +
    '</div>' +

    /* Meta */
    '<div style="margin-top:18px;padding-top:14px;border-top:1px solid var(--line-2)">' +
      '<div class="form-grid">' +
        '<div class="field full"><label>مرفق (رابط)</label><div class="input-wrap"><input type="url" id="ivs_attach" dir="ltr" placeholder="https://..."></div></div>' +
        '<div class="field full"><label>ملاحظات</label><div class="input-wrap"><textarea id="ivs_notes" rows="2"></textarea></div></div>' +
      '</div>' +
    '</div>';

  /* Load locations + agents */
  GN.loadLocationsForSelect('ivs_state', 'state', null, null);
  GN.loadAgentsForSelect('ivs_agent', null);

  document.getElementById('ivs_state').addEventListener('change', function(){
    GN.loadLocationsForSelect('ivs_city', 'city', this.value, null);
    document.getElementById('ivs_place').innerHTML = '<option value="">—</option>';
  });
  document.getElementById('ivs_city').addEventListener('change', function(){
    GN.loadLocationsForSelect('ivs_place', 'place', this.value, null);
  });
  document.getElementById('ivs_agent').addEventListener('change', function(){
    var opt = this.options[this.selectedIndex];
    var pct = opt.getAttribute('data-sell-pct');
    if (pct) document.getElementById('ivs_agent_pct').value = pct;
  });

  /* Calculations */
  function recalc(){
    var qty = Number(document.getElementById('ivs_qty').value) || 0;
    var ppg = Number(document.getElementById('ivs_ppg').value) || 0;
    var total = qty * ppg;

    var costBasis = qty * Number(item.cost_per_gram || 0);
    var grossProfit = total - costBasis;

    var agentPct = Number(document.getElementById('ivs_agent_pct').value) || 0;
    var commAmt = total * agentPct / 100;

    var taxType = document.getElementById('ivs_tax_type').value;
    var taxValue = Number(document.getElementById('ivs_tax_value').value) || 0;
    var taxAmount = taxType === 'percent' ? total * taxValue / 100 : (taxType === 'fixed' ? taxValue : 0);

    var fee = Number(document.getElementById('ivs_fee').value) || 0;
    var netProfit = grossProfit - commAmt - taxAmount - fee;

    document.getElementById('ivs_total').value = total.toFixed(2);
    document.getElementById('ivs_cost').value = costBasis.toFixed(2);
    document.getElementById('ivs_net').value = netProfit.toFixed(2);
  }
  ['ivs_qty','ivs_ppg','ivs_agent_pct','ivs_tax_value','ivs_fee'].forEach(function(id){
    document.getElementById(id).addEventListener('input', recalc);
  });
  document.getElementById('ivs_tax_type').addEventListener('change', recalc);
  recalc();

  /* Submit */
  var submitBtn = document.getElementById('formModalSubmit');
  submitBtn.textContent = 'حفظ البيع';
  submitBtn.style.display = '';
  submitBtn.onclick = function(){
    var qty = Number(document.getElementById('ivs_qty').value) || 0;
    var ppg = Number(document.getElementById('ivs_ppg').value) || 0;
    if (!qty || !ppg){ GN.toast(GN.t('fieldRequired'), 'bad'); return; }
    if (qty > maxG + 0.001){ GN.toast('الكمية أكبر من المتاح', 'bad'); return; }

    var total = qty * ppg;
    var costBasis = qty * Number(item.cost_per_gram || 0);
    var grossProfit = total - costBasis;

    var agentId = document.getElementById('ivs_agent').value || null;
    var agentPct = Number(document.getElementById('ivs_agent_pct').value) || 0;
    var commAmt = total * agentPct / 100;

    var taxType = document.getElementById('ivs_tax_type').value;
    var taxValue = Number(document.getElementById('ivs_tax_value').value) || 0;
    var taxAmount = taxType === 'percent' ? total * taxValue / 100 : (taxType === 'fixed' ? taxValue : 0);

    var fee = Number(document.getElementById('ivs_fee').value) || 0;
    var netProfit = grossProfit - commAmt - taxAmount - fee;

    var saleISO = document.getElementById('ivs_date').value + 'T' + document.getElementById('ivs_time').value + ':00';

    var payload = {
      inventory_id: item.id,
      sale_date: saleISO,
      quantity_grams: qty,
      selling_price_per_gram: ppg,
      selling_total: total,
      sale_state_id: document.getElementById('ivs_state').value || null,
      sale_city_id:  document.getElementById('ivs_city').value || null,
      sale_place_id: document.getElementById('ivs_place').value || null,
      sale_agent_id: agentId,
      cost_basis: costBasis,
      gross_profit: grossProfit,
      net_profit: netProfit,
      profit_status: 'pending',
      attachment_url: document.getElementById('ivs_attach').value.trim(),
      notes: document.getElementById('ivs_notes').value.trim()
    };

    submitBtn.disabled = true;
    GN.supa.from('inventory_sales').insert(payload).select().then(function(res){
      submitBtn.disabled = false;
      if (res.error){ GN.toast(res.error.message, 'bad'); console.error(res.error); return; }

      GN.toast('تم تسجيل البيع — الربح معلق', 'ok');

      /* Update inventory item */
      var newRemaining = Math.max(0, maxG - qty);
      var newStatus = newRemaining <= 0.001 ? 'sold' : 'partial';

      GN.supa.from('gold_inventory').update({
        remaining_grams: newRemaining,
        status: newStatus
      }).eq('id', item.id).then(function(){
        GN.notify.send({
          type: 'edit',
          section: 'inventory',
          target: 'inventory_item',
          target_id: item.id,
          title: 'بيع من المخزون',
          body: GN.formatNum(qty, 2) + 'g × ' + GN.formatNum(ppg, 2) + ' = ' + GN.formatNum(total, 2) + ' SDG'
        });
        GN.closeModal('formModal');
        GN.loadInventory();
      });
    });
  };

  GN.openModal('formModal');
};

/* ============================================================
   Delete inventory item
   ============================================================ */
GN.deleteInventoryItem = function(id){
  if (!GN.session.isOwner){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  GN.confirm({
    title: GN.t('delete'),
    text: 'حذف هذا العنصر من المخزون؟ سيُحذف سجل بيعاته أيضًا.',
    okText: GN.t('delete'),
    cancelText: GN.t('cancel'),
    danger: true
  }).then(function(ok){
    if (!ok) return;
    GN.supa.from('gold_inventory').delete().eq('id', id).then(function(res){
      if (res.error){ GN.toast(res.error.message, 'bad'); return; }
      GN.notify.markDeleted('inventory', 'inventory_item', id);
      GN.toast(GN.t('deletedSuccess'), 'ok');
      GN.loadInventory();
    });
  });
};

/* ============================================================
   Delete inventory sale
   ============================================================ */
GN.deleteInventorySale = function(saleId, invId){
  if (!GN.session.isOwner){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  GN.confirm({
    title: 'حذف البيع',
    text: 'هل أنت متأكد؟ سيُعاد الوزن للمخزون.',
    okText: GN.t('delete'),
    cancelText: GN.t('cancel'),
    danger: true
  }).then(function(ok){
    if (!ok) return;

    /* Get the sale first */
    GN.supa.from('inventory_sales').select('quantity_grams').eq('id', saleId).single().then(function(sr){
      if (sr.error){ GN.toast(sr.error.message, 'bad'); return; }
      var qty = Number(sr.data.quantity_grams || 0);

      GN.supa.from('inventory_sales').delete().eq('id', saleId).then(function(res){
        if (res.error){ GN.toast(res.error.message, 'bad'); return; }

        /* Return to inventory */
        GN.supa.from('gold_inventory').select('remaining_grams,weight_grams').eq('id', invId).single().then(function(ir){
          if (ir.error) return;
          var newRemaining = Number(ir.data.remaining_grams || 0) + qty;
          var newStatus = newRemaining >= Number(ir.data.weight_grams || 0) - 0.001 ? 'available' : 'partial';

          GN.supa.from('gold_inventory').update({
            remaining_grams: newRemaining,
            status: newStatus
          }).eq('id', invId).then(function(){
            GN.toast(GN.t('deletedSuccess'), 'ok');
            GN.viewInventoryDetails(invId);
            GN.loadInventory();
          });
        });
      });
    });
  });
};

/* ============================================================
   Bind
   ============================================================ */
GN.bindSection.inventory = function(){
  GN.bindAction('inv-apply', function(){
    GN.readInventoryFilters();
    GN.loadInventory();
  });
  GN.bindAction('inv-clear', function(){
    GN.clearInventoryFilters();
  });
};

console.log('[Gold Nile] dashboard/15-inventory.js loaded');
})();