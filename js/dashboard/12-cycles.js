/* ============================================================
   Gold Nile — Dashboard / Gold Cycles + Brokerages
   Cycles (buy/sell) + Broker mode (commission only)
   ============================================================ */
(function(){
'use strict';

var GN = window.GN = window.GN || {};

GN.cyclesFilter = { status: 'all', date_from: '', date_to: '', state_id: '' };
GN._cyclesCache = [];

/* ============================================================
   Section
   ============================================================ */
GN.sections.cycles = function(){
  var isAdmin = GN.session.isOwner && GN.session.isAdmin;

  var html = '<div class="fin-head"><div>' +
    '<h2>' + GN.navIcon('gold') + ' ' + GN.esc(GN.t('cyclesTitle')) + '</h2>' +
    '<span class="sub">' + GN.esc(GN.t('cyclesSub')) + '</span></div>' +
    (isAdmin
      ? '<div style="display:flex;gap:6px;flex-wrap:wrap">' +
          '<button class="btn btn-gold btn-sm" data-act="brokerage-add">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M17 3 21 7l-4 4M3 7h18M7 21 3 17l4-4M21 17H3"/></svg> ' +
            'وساطة جديدة</button>' +
          '<button class="btn btn-pri btn-sm" data-act="cycle-add">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg> ' +
            GN.esc(GN.t('cycleAdd')) + '</button>' +
        '</div>'
      : '') +
  '</div>';

  html += '<div class="kpi-grid" id="cyclesKpis">' +
    '<div class="kpi"><div class="top"><span class="ic">' + GN.navIcon('gold') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('loading')) + '</div><div class="val">—</div></div>' +
    '<div class="kpi"><div class="top"><span class="ic ok">' + GN.navIcon('check') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('loading')) + '</div><div class="val">—</div></div>' +
    '<div class="kpi"><div class="top"><span class="ic y">' + GN.navIcon('dollar') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('loading')) + '</div><div class="val">—</div></div>' +
    '<div class="kpi"><div class="top"><span class="ic b">' + GN.navIcon('check') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('loading')) + '</div><div class="val">—</div></div>' +
  '</div>';

  html += GN.renderCyclesFilters();

  html += '<div class="card"><div class="card-head">' +
    '<h3>' + GN.navIcon('gold') + ' ' + GN.esc(GN.t('cyclesList')) + '</h3>' +
    '<span class="ff-count" id="cyclesCount">—</span></div>' +
    '<div id="cyclesTableWrap"><div class="empty"><div class="ic">' + GN.navIcon('gold') + '</div>' +
    '<h4>' + GN.esc(GN.t('loading')) + '</h4></div></div></div>';

  setTimeout(GN.loadCycles, 100);
  return html;
};

/* ============================================================
   Filters
   ============================================================ */
GN.renderCyclesFilters = function(){
  var f = GN.cyclesFilter;
  return '<div class="fin-filters" id="cyclesFilters">' +
    '<div class="ff-field"><label>' + GN.esc(GN.t('cyFilterStatus')) + '</label>' +
      '<select id="cf_status">' +
        '<option value="all"'     + (f.status === 'all'     ? ' selected' : '') + '>' + GN.esc(GN.t('cyFilterAll')) + '</option>' +
        '<option value="open"'    + (f.status === 'open'    ? ' selected' : '') + '>' + GN.esc(GN.t('cycleOpen')) + '</option>' +
        '<option value="partial"' + (f.status === 'partial' ? ' selected' : '') + '>' + GN.esc(GN.t('cyclePartial')) + '</option>' +
        '<option value="closed"'  + (f.status === 'closed'  ? ' selected' : '') + '>' + GN.esc(GN.t('cycleClosed')) + '</option>' +
      '</select></div>' +
    '<div class="ff-field"><label>' + GN.esc(GN.t('cyFilterFrom')) + '</label>' +
      '<input type="date" id="cf_date_from" value="' + GN.escAttr(f.date_from) + '"></div>' +
    '<div class="ff-field"><label>' + GN.esc(GN.t('cyFilterTo')) + '</label>' +
      '<input type="date" id="cf_date_to" value="' + GN.escAttr(f.date_to) + '"></div>' +
    '<div class="ff-field"><label>' + GN.esc(GN.t('cyFilterState')) + '</label>' +
      '<select id="cf_state"><option value="">' + GN.esc(GN.t('cyFilterAll')) + '</option></select></div>' +
    '<div class="ff-actions">' +
      '<button class="btn btn-sec btn-sm" data-act="cycles-clear">' + GN.esc(GN.t('cyFilterClear')) + '</button>' +
      '<button class="btn btn-pri btn-sm" data-act="cycles-apply">' + GN.esc(GN.t('cyFilterApply')) + '</button></div>' +
  '</div>';
};

GN.readCyclesFilters = function(){
  var g = function(id){ var el = document.getElementById(id); return el ? el.value.trim() : ''; };
  GN.cyclesFilter = {
    status: g('cf_status') || 'all',
    date_from: g('cf_date_from'),
    date_to: g('cf_date_to'),
    state_id: g('cf_state')
  };
};

GN.clearCyclesFilters = function(){
  GN.cyclesFilter = { status:'all', date_from:'', date_to:'', state_id:'' };
  GN.renderSection('cycles');
};

/* ============================================================
   Load
   ============================================================ */
GN.loadCycles = function(){
  if (!GN.supa) return;
  var wrap = document.getElementById('cyclesTableWrap');
  if (wrap){
    wrap.innerHTML = '<div class="empty"><div class="ic">' + GN.navIcon('gold') + '</div>' +
      '<h4>' + GN.esc(GN.t('loading')) + '</h4></div>';
  }

  var f = GN.cyclesFilter;
  var q = GN.supa.from('gold_cycles').select('*');
  if (f.status && f.status !== 'all') q = q.eq('status', f.status);
  if (f.date_from) q = q.gte('start_date', f.date_from);
  if (f.date_to)   q = q.lte('start_date', f.date_to + 'T23:59:59');
  if (f.state_id)  q = q.eq('purchase_state_id', f.state_id);

  q.order('start_date', { ascending: false }).limit(500).then(function(res){
    if (res.error){
      console.error('[cycles]', res.error);
      if (wrap) wrap.innerHTML = '<div class="empty"><h4>خطأ في التحميل</h4><p>' + GN.esc(res.error.message) + '</p></div>';
      return;
    }
    GN._cyclesCache = res.data || [];
    GN.renderCyclesKPIs(GN._cyclesCache);
    GN.renderCyclesTable(GN._cyclesCache);
    GN.loadStatesIntoFilter();
  });
};

GN.loadStatesIntoFilter = function(){
  var sel = document.getElementById('cf_state');
  if (!sel) return;
  GN.supa.from('locations').select('id,name').eq('type','state').eq('is_active', true).order('display_order').then(function(res){
    if (res.error || !res.data) return;
    var cur = GN.cyclesFilter.state_id;
    var opts = '<option value="">' + GN.esc(GN.t('cyFilterAll')) + '</option>';
    res.data.forEach(function(s){
      opts += '<option value="' + GN.escAttr(s.id) + '"' + (s.id === cur ? ' selected' : '') + '>' + GN.esc(s.name) + '</option>';
    });
    sel.innerHTML = opts;
  });
};

/* ============================================================
   KPIs
   ============================================================ */
GN.renderCyclesKPIs = function(arr){
  var box = document.getElementById('cyclesKpis');
  if (!box) return;

  var openCount = 0, closedCount = 0, overdueCount = 0;
  var totalPurchasedG = 0, totalSoldG = 0;

  arr.forEach(function(c){
    if (c.status === 'open' || c.status === 'partial') openCount++;
    else if (c.status === 'closed' || c.status === 'transferred') closedCount++;

    var days;
    if (c.end_date && c.start_date){
      days = Math.ceil((new Date(c.end_date) - new Date(c.start_date)) / 86400000);
    } else if (c.start_date){
      days = Math.ceil((Date.now() - new Date(c.start_date).getTime()) / 86400000);
    } else {
      days = 0;
    }
    if ((c.status === 'open' || c.status === 'partial') && days > (c.target_days || 0)){
      overdueCount++;
    }

    totalPurchasedG += Number(c.quantity_grams || 0);
    totalSoldG += Number(c.sold_grams || 0);
  });

  box.innerHTML =
    '<div class="kpi hl"><div class="top"><span class="ic">' + GN.navIcon('gold') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('kpiCyclesOpen')) + '</div>' +
      '<div class="val"><bdi>' + GN.formatNum(openCount) + '</bdi></div>' +
      '<div class="sub">' + GN.esc(GN.t('kpiCyclesClosed')) + ': ' + GN.formatNum(closedCount) + '</div></div>' +
    '<div class="kpi"><div class="top"><span class="ic b">' + GN.navIcon('check') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('kpiCyclesOverdue')) + '</div>' +
      '<div class="val" style="color:' + (overdueCount > 0 ? 'var(--bad)' : 'var(--ink)') + '"><bdi>' + GN.formatNum(overdueCount) + '</bdi></div></div>' +
    '<div class="kpi"><div class="top"><span class="ic g">' + GN.navIcon('gold') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('kpiGramsPurchased')) + '</div>' +
      '<div class="val"><bdi>' + GN.formatNum(totalPurchasedG, 2) + '</bdi><span class="cur">g</span></div></div>' +
    '<div class="kpi"><div class="top"><span class="ic ok">' + GN.navIcon('gold') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('kpiGramsSold')) + '</div>' +
      '<div class="val"><bdi>' + GN.formatNum(totalSoldG, 2) + '</bdi><span class="cur">g</span></div></div>';
};

/* ============================================================
   Table
   ============================================================ */
GN.renderCyclesTable = function(arr){
  var wrap = document.getElementById('cyclesTableWrap');
  var cnt = document.getElementById('cyclesCount');
  if (!wrap) return;
  if (cnt) cnt.textContent = arr.length;

  if (!arr.length){
    wrap.innerHTML = '<div class="empty"><div class="ic">' + GN.navIcon('gold') + '</div>' +
      '<h4>' + GN.esc(GN.t('cyclesEmpty')) + '</h4>' +
      '<p>' + GN.esc(GN.t('cyclesEmptyAdd')) + '</p></div>';
    return;
  }

  var isAdmin = GN.session.isOwner && GN.session.isAdmin;

  var rows = arr.map(function(c){
    var statusLbl, statusCls;
    if (c.status === 'open'){ statusLbl = GN.t('cycleOpen'); statusCls = 'n'; }
    else if (c.status === 'partial'){ statusLbl = GN.t('cyclePartial'); statusCls = 'w'; }
    else if (c.status === 'closed'){ statusLbl = GN.t('cycleClosed'); statusCls = 'ok'; }
    else { statusLbl = GN.t('cycleTransferred'); statusCls = 'ok'; }

    var days;
    if (c.end_date){
      days = Math.ceil((new Date(c.end_date) - new Date(c.start_date)) / 86400000);
    } else {
      days = Math.ceil((Date.now() - new Date(c.start_date).getTime()) / 86400000);
    }
    var daysStyle = (days > (c.target_days || 0)) ? ' style="color:var(--bad);font-weight:700"' : '';

    return '<tr data-notif-id="' + GN.escAttr(c.id) + '">' +
      '<td><bdi dir="ltr" style="font-family:monospace;font-size:12px">' + GN.esc(c.code || '-') + '</bdi></td>' +
      '<td>' + GN.esc(GN.formatDate(c.start_date)) + '</td>' +
      '<td' + daysStyle + '>' + days + ' / ' + (c.target_days || 0) + '</td>' +
      '<td>' + GN.esc(c.karat || '-') + '</td>' +
      '<td class="num">' + GN.formatNum(c.quantity_grams, 2) + 'g</td>' +
      '<td class="num">' + GN.formatNum(c.sold_grams, 2) + 'g</td>' +
      '<td class="num">' + GN.formatNum(c.remaining_grams, 2) + 'g</td>' +
      '<td class="num">' + GN.formatMoneyPlain(c.purchase_total, 'SDG') + '</td>' +
      '<td><span class="chip ' + statusCls + '"><span class="dot"></span>' + GN.esc(statusLbl) + '</span></td>' +
      (isAdmin
        ? '<td class="actions"><div class="row-actions">' +
            '<button class="icon-act" data-cycle-act="view" data-cycle-id="' + GN.escAttr(c.id) + '" title="' + GN.escAttr(GN.t('view')) + '">' + GN.ICO_VIEW + '</button>' +
            '<button class="icon-act" data-cycle-act="edit" data-cycle-id="' + GN.escAttr(c.id) + '" title="' + GN.escAttr(GN.t('edit')) + '">' + GN.ICO_EDIT + '</button>' +
            '<button class="icon-act del" data-cycle-act="del" data-cycle-id="' + GN.escAttr(c.id) + '" title="' + GN.escAttr(GN.t('delete')) + '">' + GN.ICO_DEL + '</button>' +
          '</div></td>'
        : '<td class="actions"><div class="row-actions">' +
            '<button class="icon-act" data-cycle-act="view" data-cycle-id="' + GN.escAttr(c.id) + '" title="' + GN.escAttr(GN.t('view')) + '">' + GN.ICO_VIEW + '</button>' +
          '</div></td>') +
    '</tr>';
  }).join('');

  wrap.innerHTML = '<div class="table-wrap"><table><thead><tr>' +
    '<th>' + GN.esc(GN.t('cycleCode')) + '</th>' +
    '<th>' + GN.esc(GN.t('cycleStart')) + '</th>' +
    '<th>' + GN.esc(GN.t('cycleDays')) + '</th>' +
    '<th>' + GN.esc(GN.t('cycleKarat')) + '</th>' +
    '<th>' + GN.esc(GN.t('cycleQuantity')) + '</th>' +
    '<th>' + GN.esc(GN.t('cycleSold')) + '</th>' +
    '<th>' + GN.esc(GN.t('cycleRemaining')) + '</th>' +
    '<th>' + GN.esc(GN.t('cycleTotal')) + '</th>' +
    '<th>' + GN.esc(GN.t('cycleStatus')) + '</th>' +
    '<th></th></tr></thead><tbody>' + rows + '</tbody></table></div>';

  GN.$$('[data-cycle-act]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var act = btn.getAttribute('data-cycle-act');
      var id = btn.getAttribute('data-cycle-id');
      if (act === 'view') GN.viewCycleDetails(id);
      else if (act === 'edit') GN.openCycleForm(id);
      else if (act === 'del') GN.deleteCycle(id);
    });
  });
};

/* ============================================================
   Code Generators
   ============================================================ */
GN.generateCycleCode = function(){
  return GN.supa.from('gold_cycles')
    .select('code')
    .ilike('code', 'GLD-' + new Date().getFullYear() + '-%')
    .order('code', { ascending: false })
    .limit(1)
    .then(function(res){
      var year = new Date().getFullYear();
      var next = 1;
      if (!res.error && res.data && res.data[0] && res.data[0].code){
        var parts = res.data[0].code.split('-');
        var last = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(last)) next = last + 1;
      }
      return 'GLD-' + year + '-' + String(next).padStart(4, '0');
    });
};

GN.generateBrokerCode = function(){
  return GN.supa.from('gold_brokerages')
    .select('code')
    .ilike('code', 'BRK-' + new Date().getFullYear() + '-%')
    .order('code', { ascending: false })
    .limit(1)
    .then(function(res){
      var year = new Date().getFullYear();
      var next = 1;
      if (!res.error && res.data && res.data[0] && res.data[0].code){
        var parts = res.data[0].code.split('-');
        var last = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(last)) next = last + 1;
      }
      return 'BRK-' + year + '-' + String(next).padStart(4, '0');
    });
};

/* ============================================================
   Brokerage Form
   ============================================================ */
GN.openBrokerageForm = function(id){
  if (!GN.session.isOwner || !GN.session.isAdmin){
    GN.toast(GN.t('readOnlyNotice'), 'bad'); return;
  }

  var isEdit = !!id;
  var body = document.getElementById('formModalBody');
  var titleEl = document.getElementById('formModalTitle');
  if (!body || !titleEl) return;

  titleEl.textContent = isEdit ? 'تعديل وساطة' : 'وساطة جديدة';
  body.innerHTML = '<div class="empty"><h4>' + GN.esc(GN.t('loading')) + '</h4></div>';
  GN.openModal('formModal');

  function buildForm(item, code){
    item = item || {};
    code = code || '';

    var banks = GN.dh.list('banks');
    var bankOpts = '<option value="">— لا يوجد —</option>' + banks.map(function(b){
      return '<option value="' + GN.escAttr(b.id) + '"' + (item.bank_id === b.id ? ' selected' : '') + '>' + GN.esc(b.name) + '</option>';
    }).join('');

    var today = new Date().toISOString().slice(0, 10);

    body.innerHTML =
      '<div class="form-grid">' +

        '<div class="field"><label>الكود</label>' +
          '<div class="input-wrap"><input type="text" id="bk_code" readonly value="' + GN.escAttr(item.code || code) + '" dir="ltr" style="font-family:monospace;background:var(--bg-alt)"></div></div>' +

        '<div class="field"><label>النوع <span class="req">*</span></label>' +
          '<div class="input-wrap"><select id="bk_type">' +
            '<option value="sale"'     + ((item.type || 'sale') === 'sale'     ? ' selected' : '') + '>بيع</option>' +
            '<option value="purchase"' + (item.type === 'purchase' ? ' selected' : '') + '>شراء</option>' +
            '<option value="other"'    + (item.type === 'other'    ? ' selected' : '') + '>أخرى</option>' +
          '</select></div></div>' +

        '<div class="field full"><label>السبب / الوصف <span class="req">*</span></label>' +
          '<div class="input-wrap"><input type="text" id="bk_reason" maxlength="200" value="' + GN.escAttr(item.reason || '') + '" placeholder="مثال: وساطة بين أحمد ومحمد في بيع 50 جرام"></div></div>' +

        '<div class="field"><label>المبلغ الإجمالي (SDG) <span class="req">*</span></label>' +
          '<div class="input-wrap"><input type="number" id="bk_amount" step="0.01" min="0" value="' + (item.amount || '') + '"></div></div>' +

        '<div class="field"><label>التاريخ <span class="req">*</span></label>' +
          '<div class="input-wrap"><input type="date" id="bk_date" value="' + GN.escAttr(item.broker_date || today) + '"></div></div>' +

      '</div>' +

      '<div style="margin-top:18px;padding-top:14px;border-top:1px solid var(--line-2)">' +
        '<div style="font-weight:800;font-size:13px;margin-bottom:10px;color:var(--gold-d)">عمولة الشركة</div>' +
        '<div class="form-grid">' +
          '<div class="field"><label>نوع العمولة</label>' +
            '<div class="input-wrap"><select id="bk_comm_type">' +
              '<option value="percent"' + ((item.commission_type || 'percent') === 'percent' ? ' selected' : '') + '>نسبة %</option>' +
              '<option value="fixed"' + (item.commission_type === 'fixed' ? ' selected' : '') + '>مبلغ ثابت</option>' +
            '</select></div></div>' +
          '<div class="field"><label>القيمة <span class="req">*</span></label>' +
            '<div class="input-wrap"><input type="number" id="bk_comm_value" step="0.01" min="0" value="' + (item.commission_value || '') + '"></div></div>' +
          '<div class="field full"><label>قيمة العمولة المحسوبة (SDG)</label>' +
            '<div class="input-wrap"><input type="number" id="bk_comm_amount" readonly style="background:var(--gold-l);color:var(--gold-dd);font-weight:800;font-size:15px"></div></div>' +
        '</div>' +
      '</div>' +

      '<div style="margin-top:18px;padding-top:14px;border-top:1px solid var(--line-2)">' +
        '<div style="font-weight:800;font-size:13px;margin-bottom:10px;color:var(--bad)">الضرائب والرسوم (تُخصم من العمولة)</div>' +
        '<div class="form-grid">' +
          '<div class="field"><label>المبلغ (SDG)</label>' +
            '<div class="input-wrap"><input type="number" id="bk_taxes" step="0.01" min="0" value="' + (item.taxes_fees || 0) + '"></div></div>' +
          '<div class="field"><label>الوصف</label>' +
            '<div class="input-wrap"><input type="text" id="bk_taxes_desc" maxlength="100" value="' + GN.escAttr(item.taxes_fees_desc || '') + '" placeholder="مثال: ضريبة تصدير 2%"></div></div>' +
        '</div>' +
      '</div>' +

      '<div style="margin-top:18px;padding-top:14px;border-top:1px solid var(--line-2);background:var(--ok-l);border-radius:12px;padding:14px">' +
        '<div style="text-align:center">' +
          '<div style="font-size:12px;font-weight:700;color:var(--ok);margin-bottom:4px">صافي ربح الشركة</div>' +
          '<div style="font-family:\'Reem Kufi\',sans-serif;font-size:24px;font-weight:700;color:var(--ok)" id="bk_net_display">0 SDG</div>' +
        '</div>' +
      '</div>' +

      '<div style="margin-top:18px;padding-top:14px;border-top:1px solid var(--line-2)">' +
        '<div class="form-grid">' +
          '<div class="field full"><label>الحساب البنكي (اختياري - لتسجيل الحوالة)</label>' +
            '<div class="input-wrap"><select id="bk_bank">' + bankOpts + '</select></div></div>' +
          '<div class="field full"><label>مرفق (رابط)</label>' +
            '<div class="input-wrap"><input type="url" id="bk_attach" dir="ltr" placeholder="https://..." value="' + GN.escAttr(item.attachment_url || '') + '"></div></div>' +
          '<div class="field full"><label>ملاحظات</label>' +
            '<div class="input-wrap"><textarea id="bk_notes" rows="2">' + GN.esc(item.notes || '') + '</textarea></div></div>' +
        '</div>' +
      '</div>';

    function calc(){
      var amt = Number(document.getElementById('bk_amount').value) || 0;
      var ctype = document.getElementById('bk_comm_type').value;
      var cval = Number(document.getElementById('bk_comm_value').value) || 0;
      var tax = Number(document.getElementById('bk_taxes').value) || 0;

      var comm = ctype === 'percent' ? (amt * cval / 100) : cval;
      var net = comm - tax;

      document.getElementById('bk_comm_amount').value = comm.toFixed(2);
      document.getElementById('bk_net_display').textContent = GN.formatMoneyPlain(net, 'SDG');
    }

    ['bk_amount','bk_comm_value','bk_taxes'].forEach(function(id){
      document.getElementById(id).addEventListener('input', calc);
    });
    document.getElementById('bk_comm_type').addEventListener('change', calc);
    calc();

    var submitBtn = document.getElementById('formModalSubmit');
    submitBtn.textContent = isEdit ? GN.t('saveChanges') : 'حفظ الوساطة';
    submitBtn.style.display = '';
    submitBtn.onclick = function(){
      var type = document.getElementById('bk_type').value;
      var reason = document.getElementById('bk_reason').value.trim();
      var amount = Number(document.getElementById('bk_amount').value) || 0;
      var date = document.getElementById('bk_date').value;
      var ctype = document.getElementById('bk_comm_type').value;
      var cval = Number(document.getElementById('bk_comm_value').value) || 0;
      var tax = Number(document.getElementById('bk_taxes').value) || 0;
      var taxDesc = document.getElementById('bk_taxes_desc').value.trim();
      var bankId = document.getElementById('bk_bank').value || '';
      var bankName = '';
      if (bankId){
        var bank = banks.filter(function(b){ return b.id === bankId; })[0];
        if (bank) bankName = bank.name;
      }

      if (!reason){ GN.toast('السبب مطلوب', 'bad'); return; }
      if (!amount || amount <= 0){ GN.toast('المبلغ الإجمالي مطلوب', 'bad'); return; }
      if (!cval || cval <= 0){ GN.toast('قيمة العمولة مطلوبة', 'bad'); return; }

      var comm = ctype === 'percent' ? (amount * cval / 100) : cval;
      var net = comm - tax;

      var payload = {
        code: document.getElementById('bk_code').value,
        type: type,
        reason: reason,
        amount: amount,
        currency: 'SDG',
        commission_type: ctype,
        commission_value: cval,
        commission_amount: comm,
        taxes_fees: tax,
        taxes_fees_desc: taxDesc,
        net_profit: net,
        broker_date: date,
        bank_id: bankId,
        bank_name: bankName,
        attachment_url: document.getElementById('bk_attach').value.trim(),
        notes: document.getElementById('bk_notes').value.trim(),
        updated_at: new Date().toISOString()
      };

      submitBtn.disabled = true;

      var promise;
      if (isEdit){
        promise = GN.supa.from('gold_brokerages').update(payload).eq('id', id).select();
      } else {
        payload.created_by = GN.session.user.id;
        promise = GN.supa.from('gold_brokerages').insert(payload).select();
      }

      promise.then(function(res){
        if (res.error){
          submitBtn.disabled = false;
          console.error('[broker]', res.error);
          GN.toast(res.error.message, 'bad');
          return;
        }

        var newId = isEdit ? id : (res.data && res.data[0] ? res.data[0].id : null);

        /* 1) إضافة صافي الربح إلى وعاء أرباح الذهب */
        var addToProfitPool = function(){
          return GN.supa.from('fund_pools').select('id,balance').eq('code', 'profit').single().then(function(fr){
            if (fr.error || !fr.data) return false;

            var pool = fr.data;
            var newBalance = Number(pool.balance || 0) + net;

            return GN.supa.from('fund_pools').update({
              balance: newBalance,
              updated_at: new Date().toISOString()
            }).eq('id', pool.id).then(function(){
              /* سجل حركة الوعاء */
              return GN.supa.from('fund_transactions').insert({
                pool_id: pool.id,
                type: 'in',
                amount: net,
                currency: 'SDG',
                reason: 'وساطة ' + (payload.code || '') + ' — ' + reason,
                reference_type: 'manual',
                reference_id: newId,
                notes: 'عمولة ' + GN.formatNum(comm) + ' − ضرائب ' + GN.formatNum(tax),
                created_by: GN.session.user.id
              });
            }).then(function(){
              return true;
            });
          });
        };

        /* 2) إذا فيه بنك → سجّل حوالة واردة */
        var addBankTransfer = function(){
          if (!bankId) return Promise.resolve(false);
          return GN.addBankTransfer({
            bank_id: bankId,
            type: 'in',
            amount: net,
            currency: 'SDG',
            party: 'وساطة ' + (payload.code || ''),
            notes: reason,
            source: 'feed_pool',
            source_id: newId,
            date: date
          }).then(function(){ return true; });
        };

        addToProfitPool().then(function(){
          addBankTransfer().then(function(){
            submitBtn.disabled = false;
            GN.toast(isEdit ? GN.t('savedSuccess') : '✓ تم حفظ الوساطة — ' + GN.formatNum(net) + ' SDG إلى وعاء الأرباح', 'ok');

            GN.notify.send({
              type: 'add',
              section: 'cycles',
              target: 'brokerage',
              target_id: newId || '',
              title: (isEdit ? 'تعديل' : 'إضافة') + ' · وساطة',
              body: payload.code + ' — صافي ' + GN.formatNum(net) + ' SDG'
            });

            GN.closeModal('formModal');
            GN.loadCycles();
          });
        });
      });
    };
  }

  if (isEdit){
    GN.supa.from('gold_brokerages').select('*').eq('id', id).single().then(function(res){
      if (res.error){ GN.toast(res.error.message, 'bad'); GN.closeModal('formModal'); return; }
      buildForm(res.data, res.data.code);
    });
  } else {
    GN.generateBrokerCode().then(function(code){
      buildForm(null, code);
    });
  }
};

/* ============================================================
   Quick Add — Locations & Agents
   ============================================================ */
GN.quickAddLocation = function(type, parentId, onDone){
  var titles = { state: 'ولاية جديدة', city: 'مدينة جديدة', place: 'مكان / سوق جديد' };
  var labels = { state: 'اسم الولاية', city: 'اسم المدينة', place: 'اسم المكان / السوق' };

  GN.quickAddOverlay(titles[type], [
    { id:'qa_name', label: labels[type], req:true, placeholder:'مثال: الأبيار' }
  ], function(values, closeFn){
    if (!values.qa_name){ GN.toast(GN.t('fieldRequired'), 'bad'); return; }
    var payload = { type: type, name: values.qa_name };
    if (parentId) payload.parent_id = parentId;
    if (type === 'state') payload.display_order = 100;

    GN.supa.from('locations').insert(payload).select().then(function(res){
      if (res.error){ GN.toast(res.error.message, 'bad'); return; }
      GN.toast('تمت الإضافة', 'ok');
      closeFn();
      if (onDone && res.data && res.data[0]) onDone(res.data[0]);
    });
  });
};

GN.quickAddAgent = function(onDone){
  GN.quickAddOverlay('مندوب جديد', [
    { id:'qa_code',       label:'الكود', req:true, dir:'ltr', placeholder:'AG-001' },
    { id:'qa_name',       label:'الاسم', req:true },
    { id:'qa_phone',      label:'الهاتف', dir:'ltr' },
    { id:'qa_buy_pct',    label:'عمولة الشراء %', type:'number', placeholder:'0' },
    { id:'qa_sell_pct',   label:'عمولة البيع %', type:'number', placeholder:'0' },
    { id:'qa_method',     label:'طريقة الدفع', type:'select', options:[
      { value:'cash', label:'نقدي' }, { value:'bank', label:'حوالة بنكية' }
    ], value:'cash' },
    { id:'qa_bank',       label:'اسم البنك (إن كانت حوالة)' },
    { id:'qa_account',    label:'رقم الحساب (إن كانت حوالة)', dir:'ltr' }
  ], function(v, closeFn){
    if (!v.qa_code || !v.qa_name){ GN.toast(GN.t('fieldRequired'), 'bad'); return; }
    var payload = {
      code: v.qa_code, name: v.qa_name, phone: v.qa_phone || '',
      buy_commission_pct: Number(v.qa_buy_pct) || 0,
      sell_commission_pct: Number(v.qa_sell_pct) || 0,
      payment_method: v.qa_method || 'cash',
      bank_name: v.qa_bank || '', account_number: v.qa_account || ''
    };
    GN.supa.from('agents').insert(payload).select().then(function(res){
      if (res.error){ GN.toast(res.error.message, 'bad'); return; }
      GN.toast('تمت الإضافة', 'ok');
      closeFn();
      if (onDone && res.data && res.data[0]) onDone(res.data[0]);
    });
  });
};

GN.quickAddOverlay = function(title, fields, onSave){
  var old = document.getElementById('quickAddOverlay');
  if (old) old.remove();

  var overlay = document.createElement('div');
  overlay.id = 'quickAddOverlay';
  overlay.className = 'overlay on';
  overlay.style.zIndex = '300';

  var fieldsHTML = fields.map(function(f){
    var input;
    if (f.type === 'select'){
      input = '<select id="' + f.id + '">' + (f.options || []).map(function(o){
        return '<option value="' + GN.escAttr(o.value) + '"' + (o.value === f.value ? ' selected' : '') + '>' + GN.esc(o.label) + '</option>';
      }).join('') + '</select>';
    } else {
      input = '<input type="' + (f.type || 'text') + '" id="' + f.id + '"' +
        (f.dir ? ' dir="' + f.dir + '"' : '') +
        (f.placeholder ? ' placeholder="' + GN.escAttr(f.placeholder) + '"' : '') +
        ' value="' + GN.escAttr(f.value || '') + '">';
    }
    return '<div class="field"><label>' + GN.esc(f.label) + (f.req ? ' <span class="req">*</span>' : '') + '</label>' +
      '<div class="input-wrap">' + input + '</div></div>';
  }).join('');

  overlay.innerHTML =
    '<div class="modal sm" style="text-align:start">' +
      '<div class="modal-head"><h3>' + GN.esc(title) + '</h3></div>' +
      '<div class="modal-body" style="max-height:70vh;overflow-y:auto">' + fieldsHTML + '</div>' +
      '<div class="modal-foot">' +
        '<button class="btn btn-sec" data-qa-cancel type="button">إلغاء</button>' +
        '<button class="btn btn-pri" data-qa-save type="button">حفظ</button>' +
      '</div>' +
    '</div>';

  document.body.appendChild(overlay);
  function closeFn(){ overlay.remove(); }

  overlay.querySelector('[data-qa-cancel]').onclick = closeFn;
  overlay.addEventListener('click', function(e){ if (e.target === overlay) closeFn(); });
  overlay.querySelector('[data-qa-save]').onclick = function(){
    var values = {};
    fields.forEach(function(f){
      var el = document.getElementById(f.id);
      if (el) values[f.id] = el.value.trim();
    });
    onSave(values, closeFn);
  };
};

GN.loadLocationsForSelect = function(selectId, type, parentId, selectedId){
  var sel = document.getElementById(selectId);
  if (!sel) return;
  var q = GN.supa.from('locations').select('id,name').eq('type', type).eq('is_active', true);
  if (parentId) q = q.eq('parent_id', parentId);
  q.order('display_order').order('name').then(function(res){
    if (res.error) return;
    var opts = '<option value="">—</option>';
    (res.data || []).forEach(function(l){
      opts += '<option value="' + GN.escAttr(l.id) + '"' + (l.id === selectedId ? ' selected' : '') + '>' + GN.esc(l.name) + '</option>';
    });
    sel.innerHTML = opts;
  });
};

GN.loadAgentsForSelect = function(selectId, selectedId){
  var sel = document.getElementById(selectId);
  if (!sel) return;
  GN.supa.from('agents').select('id,code,name,buy_commission_pct,sell_commission_pct').eq('status', 'active').order('name').then(function(res){
    if (res.error) return;
    var opts = '<option value="">— لا يوجد مندوب —</option>';
    (res.data || []).forEach(function(a){
      opts += '<option value="' + GN.escAttr(a.id) + '"' +
        ' data-buy-pct="' + (a.buy_commission_pct || 0) + '"' +
        ' data-sell-pct="' + (a.sell_commission_pct || 0) + '"' +
        (a.id === selectedId ? ' selected' : '') + '>' +
        GN.esc(a.code + ' — ' + a.name) + '</option>';
    });
    sel.innerHTML = opts;
  });
};

/* ============================================================
   Cycle Form (regular buy/sell cycle)
   ============================================================ */
GN.openCycleForm = function(id){
  if (!GN.session.isOwner || !GN.session.isAdmin){
    GN.toast(GN.t('readOnlyNotice'), 'bad'); return;
  }

  var isEdit = !!id;
  var body = document.getElementById('formModalBody');
  var titleEl = document.getElementById('formModalTitle');
  if (!body || !titleEl) return;

  titleEl.textContent = isEdit ? (GN.t('cycleEdit') || 'تعديل دورة') : GN.t('cycleAdd');
  body.innerHTML = '<div class="empty"><h4>' + GN.esc(GN.t('loading')) + '</h4></div>';
  GN.openModal('formModal');

  function buildForm(item, code){
    item = item || {};
    code = code || '';

    var now = new Date();
    var todayDate = now.toISOString().slice(0, 10);
    var nowTime = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

    body.innerHTML =
      '<div class="form-grid">' +

        '<div class="field"><label>' + GN.esc(GN.t('cycleCode')) + '</label>' +
          '<div class="input-wrap"><input type="text" id="cy_code" readonly value="' + GN.escAttr(item.code || code) + '" dir="ltr" style="font-family:monospace;background:var(--bg-alt)"></div></div>' +

        '<div class="field"><label>' + GN.esc(GN.t('cycleTargetDays') || 'المدة المستهدفة (أيام)') + ' <span class="req">*</span></label>' +
          '<div class="input-wrap"><input type="number" id="cy_target_days" min="1" max="365" value="' + (item.target_days || 3) + '"></div></div>' +

        '<div class="field"><label>' + GN.esc(GN.t('cycleStartDate') || 'تاريخ البداية') + ' <span class="req">*</span></label>' +
          '<div class="input-wrap"><input type="date" id="cy_date" value="' + GN.escAttr(item.start_date ? item.start_date.slice(0,10) : todayDate) + '"></div></div>' +

        '<div class="field"><label>' + GN.esc(GN.t('cycleStartTime') || 'وقت البداية') + '</label>' +
          '<div class="input-wrap"><input type="time" id="cy_time" value="' + GN.escAttr(item.start_date ? item.start_date.slice(11,16) : nowTime) + '"></div></div>' +

        '<div class="field"><label>' + GN.esc(GN.t('cycleKarat')) + ' <span class="req">*</span></label>' +
          '<div class="input-wrap"><select id="cy_karat">' +
            '<option value="18"' + (item.karat === '18' ? ' selected' : '') + '>18</option>' +
            '<option value="21"' + ((item.karat || '21') === '21' ? ' selected' : '') + '>21</option>' +
            '<option value="22"' + (item.karat === '22' ? ' selected' : '') + '>22</option>' +
            '<option value="24"' + (item.karat === '24' ? ' selected' : '') + '>24</option>' +
          '</select></div></div>' +

        '<div class="field"><label>' + GN.esc(GN.t('cycleQuantity')) + ' (g) <span class="req">*</span></label>' +
          '<div class="input-wrap"><input type="number" id="cy_quantity" step="0.001" min="0" value="' + (item.quantity_grams || '') + '"></div></div>' +

        '<div class="field"><label>' + GN.esc(GN.t('cyclePurchasePrice') || 'سعر الشراء/جرام') + ' (SDG) <span class="req">*</span></label>' +
          '<div class="input-wrap"><input type="number" id="cy_ppg" step="0.01" min="0" value="' + (item.purchase_price_per_gram || '') + '"></div></div>' +

        '<div class="field"><label>' + GN.esc(GN.t('cyclePurchaseTotal') || 'إجمالي الشراء') + '</label>' +
          '<div class="input-wrap"><input type="number" id="cy_purchase_total" readonly style="background:var(--bg-alt);font-weight:700" value=""></div></div>' +

      '</div>' +

      '<div style="margin-top:18px;padding-top:14px;border-top:1px solid var(--line-2)">' +
        '<div style="font-weight:800;font-size:13px;margin-bottom:10px;color:var(--ink-2)">' + GN.esc(GN.t('cycleLocationSection') || 'موقع الشراء') + '</div>' +
        '<div class="form-grid">' +
          '<div class="field"><label>' + GN.esc(GN.t('cycleState') || 'الولاية') + '</label>' +
            '<div class="input-wrap" style="display:flex;gap:6px">' +
              '<select id="cy_state" style="flex:1"><option value="">—</option></select>' +
              '<button type="button" class="btn btn-sec btn-sm" data-cy-quick="state" style="min-height:42px;padding:0 12px">+</button>' +
            '</div></div>' +
          '<div class="field"><label>' + GN.esc(GN.t('cycleCity') || 'المدينة') + '</label>' +
            '<div class="input-wrap" style="display:flex;gap:6px">' +
              '<select id="cy_city" style="flex:1"><option value="">—</option></select>' +
              '<button type="button" class="btn btn-sec btn-sm" data-cy-quick="city" style="min-height:42px;padding:0 12px">+</button>' +
            '</div></div>' +
          '<div class="field full"><label>' + GN.esc(GN.t('cyclePlace') || 'المكان / السوق') + '</label>' +
            '<div class="input-wrap" style="display:flex;gap:6px">' +
              '<select id="cy_place" style="flex:1"><option value="">—</option></select>' +
              '<button type="button" class="btn btn-sec btn-sm" data-cy-quick="place" style="min-height:42px;padding:0 12px">+</button>' +
            '</div></div>' +
        '</div>' +
      '</div>' +

      '<div style="margin-top:18px;padding-top:14px;border-top:1px solid var(--line-2)">' +
        '<div style="font-weight:800;font-size:13px;margin-bottom:10px;color:var(--ink-2)">' + GN.esc(GN.t('cycleAgentSection') || 'المندوب') + ' (اختياري)</div>' +
        '<div class="form-grid">' +
          '<div class="field"><label>' + GN.esc(GN.t('cycleSelectAgent') || 'المندوب') + '</label>' +
            '<div class="input-wrap" style="display:flex;gap:6px">' +
              '<select id="cy_agent" style="flex:1"><option value="">— لا يوجد مندوب —</option></select>' +
              '<button type="button" class="btn btn-sec btn-sm" data-cy-quick="agent" style="min-height:42px;padding:0 12px">+</button>' +
            '</div></div>' +
          '<div class="field"><label>' + GN.esc(GN.t('cycleCommissionBuy') || 'عمولة الشراء %') + '</label>' +
            '<div class="input-wrap"><input type="number" id="cy_agent_pct" step="0.001" min="0" value="' + (item.purchase_commission_pct || 0) + '"></div></div>' +
        '</div>' +
      '</div>' +

      '<div style="margin-top:18px;padding-top:14px;border-top:1px solid var(--line-2)">' +
        '<div style="font-weight:800;font-size:13px;margin-bottom:10px;color:var(--ink-2)">' + GN.esc(GN.t('cycleTaxSection') || 'الضريبة والرسوم') + '</div>' +
        '<div class="form-grid">' +
          '<div class="field"><label>' + GN.esc(GN.t('cycleTaxType') || 'نوع الضريبة') + '</label>' +
            '<div class="input-wrap"><select id="cy_tax_type">' +
              '<option value="none"' + ((item.purchase_tax_type || 'none') === 'none' ? ' selected' : '') + '>' + GN.esc(GN.t('cycleTaxNone') || 'لا يوجد') + '</option>' +
              '<option value="percent"' + (item.purchase_tax_type === 'percent' ? ' selected' : '') + '>' + GN.esc(GN.t('cycleTaxPercent') || 'نسبة %') + '</option>' +
              '<option value="fixed"' + (item.purchase_tax_type === 'fixed' ? ' selected' : '') + '>' + GN.esc(GN.t('cycleTaxFixed') || 'مبلغ ثابت') + '</option>' +
            '</select></div></div>' +
          '<div class="field"><label>' + GN.esc(GN.t('cycleTaxValue') || 'قيمة الضريبة') + '</label>' +
            '<div class="input-wrap"><input type="number" id="cy_tax_value" step="0.01" min="0" value="' + (item.purchase_tax_value || 0) + '"></div></div>' +
          '<div class="field"><label>' + GN.esc(GN.t('cycleFee') || 'رسوم إضافية (مبلغ)') + '</label>' +
            '<div class="input-wrap"><input type="number" id="cy_fee" step="0.01" min="0" value="' + (item.purchase_fee_amount || 0) + '"></div></div>' +
          '<div class="field"><label>' + GN.esc(GN.t('cycleFeeDesc') || 'وصف الرسوم') + '</label>' +
            '<div class="input-wrap"><input type="text" id="cy_fee_desc" value="' + GN.escAttr(item.purchase_fee_desc || '') + '" placeholder="مثال: نقل، رسوم سوق"></div></div>' +
        '</div>' +
      '</div>' +

      '<div style="margin-top:18px;padding-top:14px;border-top:1px solid var(--line-2)">' +
        '<div class="form-grid">' +
          '<div class="field full"><label>' + GN.esc(GN.t('cycleAttachment') || 'مرفق (رابط)') + '</label>' +
            '<div class="input-wrap"><input type="url" id="cy_attach" dir="ltr" placeholder="https://..." value="' + GN.escAttr(item.attachment_url || '') + '"></div></div>' +
          '<div class="field full"><label>' + GN.esc(GN.t('notes')) + '</label>' +
            '<div class="input-wrap"><textarea id="cy_notes" rows="3">' + GN.esc(item.notes || '') + '</textarea></div></div>' +
        '</div>' +
      '</div>';

    function calc(){
      var qty = Number(document.getElementById('cy_quantity').value) || 0;
      var ppg = Number(document.getElementById('cy_ppg').value) || 0;
      var total = qty * ppg;
      document.getElementById('cy_purchase_total').value = total.toFixed(2);
    }
    document.getElementById('cy_quantity').addEventListener('input', calc);
    document.getElementById('cy_ppg').addEventListener('input', calc);
    calc();

    GN.loadLocationsForSelect('cy_state', 'state', null, item.purchase_state_id);
    if (item.purchase_state_id) GN.loadLocationsForSelect('cy_city', 'city', item.purchase_state_id, item.purchase_city_id);
    if (item.purchase_city_id) GN.loadLocationsForSelect('cy_place', 'place', item.purchase_city_id, item.purchase_place_id);
    GN.loadAgentsForSelect('cy_agent', item.purchase_agent_id);

    var agentSel = document.getElementById('cy_agent');
    if (agentSel) agentSel.addEventListener('change', function(){
      var opt = agentSel.options[agentSel.selectedIndex];
      var pct = opt.getAttribute('data-buy-pct');
      if (pct) document.getElementById('cy_agent_pct').value = pct;
    });

    var stateSel = document.getElementById('cy_state');
    if (stateSel) stateSel.addEventListener('change', function(){
      GN.loadLocationsForSelect('cy_city', 'city', stateSel.value, null);
      document.getElementById('cy_place').innerHTML = '<option value="">—</option>';
    });

    var citySel = document.getElementById('cy_city');
    if (citySel) citySel.addEventListener('change', function(){
      GN.loadLocationsForSelect('cy_place', 'place', citySel.value, null);
    });

    body.querySelectorAll('[data-cy-quick]').forEach(function(b){
      b.addEventListener('click', function(){
        var what = b.getAttribute('data-cy-quick');
        if (what === 'state'){
          GN.quickAddLocation('state', null, function(item){
            GN.loadLocationsForSelect('cy_state', 'state', null, item.id);
          });
        } else if (what === 'city'){
          var sid = document.getElementById('cy_state').value;
          if (!sid){ GN.toast('اختر الولاية أولًا', 'bad'); return; }
          GN.quickAddLocation('city', sid, function(item){
            GN.loadLocationsForSelect('cy_city', 'city', sid, item.id);
          });
        } else if (what === 'place'){
          var cid = document.getElementById('cy_city').value;
          if (!cid){ GN.toast('اختر المدينة أولًا', 'bad'); return; }
          GN.quickAddLocation('place', cid, function(item){
            GN.loadLocationsForSelect('cy_place', 'place', cid, item.id);
          });
        } else if (what === 'agent'){
          GN.quickAddAgent(function(item){
            GN.loadAgentsForSelect('cy_agent', item.id);
            var pct = item.buy_commission_pct || 0;
            if (pct) document.getElementById('cy_agent_pct').value = pct;
          });
        }
      });
    });

    var submitBtn = document.getElementById('formModalSubmit');
    submitBtn.textContent = isEdit ? GN.t('saveChanges') : GN.t('save');
    submitBtn.style.display = '';
    submitBtn.onclick = function(){
      var qty = Number(document.getElementById('cy_quantity').value) || 0;
      var ppg = Number(document.getElementById('cy_ppg').value) || 0;
      var targetDays = Number(document.getElementById('cy_target_days').value) || 3;
      var startDate = document.getElementById('cy_date').value;
      var startTime = document.getElementById('cy_time').value || '00:00';

      if (!qty || !ppg){ GN.toast(GN.t('fieldRequired'), 'bad'); return; }
      if (!startDate){ GN.toast(GN.t('fieldRequired'), 'bad'); return; }

      var total = qty * ppg;
      var taxType = document.getElementById('cy_tax_type').value;
      var taxValue = Number(document.getElementById('cy_tax_value').value) || 0;
      var taxAmount = 0;
      if (taxType === 'percent') taxAmount = total * taxValue / 100;
      else if (taxType === 'fixed') taxAmount = taxValue;

      var agentId = document.getElementById('cy_agent').value || null;
      var agentPct = Number(document.getElementById('cy_agent_pct').value) || 0;
      var commissionAmount = total * agentPct / 100;

      var startISO = startDate + 'T' + startTime + ':00';

      var payload = {
        code: document.getElementById('cy_code').value,
        status: 'open',
        start_date: startISO,
        target_days: targetDays,
        karat: document.getElementById('cy_karat').value,
        quantity_grams: qty,
        purchase_price_per_gram: ppg,
        purchase_total: total,
        purchase_state_id: document.getElementById('cy_state').value || null,
        purchase_city_id:  document.getElementById('cy_city').value || null,
        purchase_place_id: document.getElementById('cy_place').value || null,
        purchase_agent_id: agentId,
        purchase_commission_pct: agentPct,
        purchase_commission_amount: commissionAmount,
        purchase_tax_type: taxType,
        purchase_tax_value: taxValue,
        purchase_tax_amount: taxAmount,
        purchase_fee_amount: Number(document.getElementById('cy_fee').value) || 0,
        purchase_fee_desc: document.getElementById('cy_fee_desc').value.trim(),
        attachment_url: document.getElementById('cy_attach').value.trim(),
        notes: document.getElementById('cy_notes').value.trim(),
        remaining_grams: qty,
        sold_grams: 0,
        transferred_grams: 0,
        created_by: GN.session.user ? GN.session.user.id : null
      };

      submitBtn.disabled = true;

      var promise;
      if (isEdit){
        payload.updated_at = new Date().toISOString();
        promise = GN.supa.from('gold_cycles').update(payload).eq('id', id).select();
      } else {
        promise = GN.supa.from('gold_cycles').insert(payload).select();
      }

      promise.then(function(res){
        submitBtn.disabled = false;
        if (res.error){
          console.error('[cycle save]', res.error);
          GN.toast(res.error.message, 'bad');
          return;
        }

        var newId = isEdit ? id : (res.data && res.data[0] ? res.data[0].id : null);
        GN.toast(isEdit ? GN.t('savedSuccess') : 'تم إنشاء الدورة', 'ok');

        if (!isEdit && agentId && commissionAmount > 0){
          GN.supa.from('agents').select('id,code,name,phone,bank_name,account_number,payment_method').eq('id', agentId).single().then(function(aRes){
            if (aRes.error || !aRes.data){
              finishCycleSave();
              return;
            }
            var agent = aRes.data;
            var p = GN.session.profile;
            var payCode = 'PAY-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-4);

            GN.supa.from('payment_orders').insert({
              code: payCode,
              type: 'agent',
              beneficiary_name: agent.name || '',
              beneficiary_bank: agent.bank_name || '',
              beneficiary_account: agent.account_number || '',
              beneficiary_phone: agent.phone || '',
              payment_method: agent.payment_method || 'cash',
              amount: commissionAmount,
              currency: 'SDG',
              amount_sdg: commissionAmount,
              due_date: null,
              status: 'pending',
              linked_source: 'gold_purchase',
              linked_id: newId || '',
              linked_desc: payload.code || '',
              notes: 'عمولة مندوب شراء — ' + (payload.code || ''),
              created_by: GN.session.user.id,
              created_by_name: (p && (p.full_name || p.email)) || ''
            }).then(function(){
              GN.toast('✓ تم إنشاء استحقاق المندوب تلقائيًا', 'ok');
              finishCycleSave();
            });
          });
        } else {
          finishCycleSave();
        }

        function finishCycleSave(){
          GN.notify.send({
            type: 'add',
            section: 'cycles',
            target: 'cycle',
            target_id: newId || '',
            title: (isEdit ? 'تعديل' : 'إضافة') + ' · دورات الذهب',
            body: payload.code + ' — ' + GN.formatNum(qty, 2) + 'g × ' + GN.formatNum(ppg, 2)
          });

          GN.closeModal('formModal');
          GN.loadCycles();
        }
      });
    };
  }

  if (isEdit){
    GN.supa.from('gold_cycles').select('*').eq('id', id).single().then(function(res){
      if (res.error){ GN.toast(res.error.message, 'bad'); GN.closeModal('formModal'); return; }
      buildForm(res.data, res.data.code);
    });
  } else {
    GN.generateCycleCode().then(function(code){
      buildForm(null, code);
    });
  }
};

/* ============================================================
   Cycle Details
   ============================================================ */
GN.viewCycleDetails = function(id){
  var overlay = document.getElementById('cycleDetailsOverlay');
  if (overlay) overlay.remove();

  overlay = document.createElement('div');
  overlay.id = 'cycleDetailsOverlay';
  overlay.className = 'overlay on';
  overlay.style.zIndex = '250';

  overlay.innerHTML = '<div class="modal wide" style="max-width:900px">' +
    '<div class="modal-head">' +
      '<h3 id="cdTitle">' + GN.esc(GN.t('loading')) + '</h3>' +
      '<button class="close" type="button" data-cd-close><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>' +
    '</div>' +
    '<div class="modal-body" id="cdBody" style="max-height:75vh;overflow-y:auto">' +
      '<div class="empty"><h4>' + GN.esc(GN.t('loading')) + '</h4></div>' +
    '</div>' +
    '<div class="modal-foot" id="cdFoot"></div>' +
  '</div>';

  document.body.appendChild(overlay);

  function closeFn(){ overlay.remove(); }
  overlay.querySelector('[data-cd-close]').onclick = closeFn;
  overlay.addEventListener('click', function(e){ if (e.target === overlay) closeFn(); });

  Promise.all([
    GN.supa.from('gold_cycles').select('*').eq('id', id).single(),
    GN.supa.from('gold_cycle_sales').select('*').eq('cycle_id', id).order('sale_date', { ascending: false })
  ]).then(function(results){
    var cRes = results[0];
    var sRes = results[1];
    if (cRes.error){ GN.toast(cRes.error.message, 'bad'); closeFn(); return; }
    var cycle = cRes.data;
    var sales = sRes.data || [];
    GN.renderCycleDetails(cycle, sales, overlay, closeFn);
  });
};

GN.renderCycleDetails = function(c, sales, overlay, closeFn){
  var isAdmin = GN.session.isOwner && GN.session.isAdmin;
  var title = document.getElementById('cdTitle');
  if (title) title.textContent = c.code + ' — ' + GN.t('cyclesTitle');

  var statusLbl, statusCls;
  if (c.status === 'open'){ statusLbl = GN.t('cycleOpen'); statusCls = 'n'; }
  else if (c.status === 'partial'){ statusLbl = GN.t('cyclePartial'); statusCls = 'w'; }
  else if (c.status === 'closed'){ statusLbl = GN.t('cycleClosed'); statusCls = 'ok'; }
  else { statusLbl = GN.t('cycleTransferred'); statusCls = 'ok'; }

  var startD = new Date(c.start_date);
  var endD = c.end_date ? new Date(c.end_date) : new Date();
  var days = Math.ceil((endD - startD) / 86400000);

  var totalSoldG = 0, totalSaleRevenue = 0, totalCostBasis = 0;
  var totalSaleCommission = 0, totalSaleTax = 0, totalSaleFee = 0;
  var totalNetProfit = 0, totalRealized = 0, totalPending = 0;

  sales.forEach(function(s){
    totalSoldG += Number(s.quantity_grams || 0);
    totalSaleRevenue += Number(s.selling_total || 0);
    totalCostBasis += Number(s.cost_basis || 0);
    totalSaleCommission += Number(s.sale_commission_amount || 0);
    totalSaleTax += Number(s.sale_tax_amount || 0);
    totalSaleFee += Number(s.sale_fee_amount || 0);
    totalNetProfit += Number(s.net_profit || 0);
    if (s.profit_status === 'realized') totalRealized += Number(s.net_profit || 0);
    else totalPending += Number(s.net_profit || 0);
  });

  var rowsInfo = [
    ['الحالة', '<span class="chip ' + statusCls + '"><span class="dot"></span>' + GN.esc(statusLbl) + '</span>'],
    ['تاريخ البداية', GN.formatDate(c.start_date) + ' — ' + (c.start_date || '').slice(11,16)],
    ['تاريخ النهاية', c.end_date ? (GN.formatDate(c.end_date) + ' — ' + (c.end_date || '').slice(11,16)) : '—'],
    ['المدة', days + ' / ' + (c.target_days || 0) + ' يوم' + (days > (c.target_days || 0) ? ' <span style="color:var(--bad);font-weight:700">(متأخرة)</span>' : '')],
    ['العيار', c.karat || '—'],
    ['الكمية الإجمالية', GN.formatNum(c.quantity_grams, 2) + ' g'],
    ['المُباع', GN.formatNum(totalSoldG, 2) + ' g'],
    ['المُحوَّل للمخزون', GN.formatNum(c.transferred_grams || 0, 2) + ' g'],
    ['المتبقي', GN.formatNum(c.remaining_grams, 2) + ' g'],
    ['سعر الشراء/جرام', GN.formatMoneyPlain(c.purchase_price_per_gram, 'SDG')],
    ['إجمالي الشراء', GN.formatMoneyPlain(c.purchase_total, 'SDG')],
    ['ضريبة الشراء', GN.formatMoneyPlain(c.purchase_tax_amount || 0, 'SDG')],
    ['رسوم الشراء', GN.formatMoneyPlain(c.purchase_fee_amount || 0, 'SDG') + (c.purchase_fee_desc ? ' (' + c.purchase_fee_desc + ')' : '')],
    ['إجمالي التكلفة', GN.formatMoneyPlain(Number(c.purchase_total) + Number(c.purchase_tax_amount || 0) + Number(c.purchase_fee_amount || 0), 'SDG')]
  ];

  var html = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px;margin-bottom:16px">';

  html += '<div class="card" style="margin:0"><div class="card-head"><h3>' + GN.navIcon('gold') + ' بيانات الدورة</h3></div><table style="width:100%;font-size:12.5px">';
  rowsInfo.forEach(function(r){
    html += '<tr><td style="padding:6px 0;color:var(--ink-2);font-weight:700">' + r[0] + '</td><td style="padding:6px 0;text-align:end">' + r[1] + '</td></tr>';
  });
  html += '</table></div>';

  var netProfitColor = totalNetProfit >= 0 ? 'var(--ok)' : 'var(--bad)';
  html += '<div class="card" style="margin:0"><div class="card-head"><h3>' + GN.navIcon('dollar') + ' الأرباح</h3></div><table style="width:100%;font-size:12.5px">';
  html += '<tr><td style="padding:6px 0;color:var(--ink-2);font-weight:700">إجمالي المبيعات</td><td style="padding:6px 0;text-align:end">' + GN.formatMoneyPlain(totalSaleRevenue, 'SDG') + '</td></tr>';
  html += '<tr><td style="padding:6px 0;color:var(--ink-2);font-weight:700">تكلفة البضاعة المُباعة</td><td style="padding:6px 0;text-align:end">' + GN.formatMoneyPlain(totalCostBasis, 'SDG') + '</td></tr>';
  html += '<tr><td style="padding:6px 0;color:var(--ink-2);font-weight:700">عمولات البيع</td><td style="padding:6px 0;text-align:end">' + GN.formatMoneyPlain(totalSaleCommission, 'SDG') + '</td></tr>';
  html += '<tr><td style="padding:6px 0;color:var(--ink-2);font-weight:700">ضرائب البيع</td><td style="padding:6px 0;text-align:end">' + GN.formatMoneyPlain(totalSaleTax, 'SDG') + '</td></tr>';
  html += '<tr><td style="padding:6px 0;color:var(--ink-2);font-weight:700">رسوم البيع</td><td style="padding:6px 0;text-align:end">' + GN.formatMoneyPlain(totalSaleFee, 'SDG') + '</td></tr>';
  html += '<tr style="border-top:1px solid var(--line-2)"><td style="padding:10px 0;font-weight:800;color:' + netProfitColor + '">صافي الربح</td><td style="padding:10px 0;text-align:end;font-weight:800;color:' + netProfitColor + ';font-size:15px">' + (totalNetProfit >= 0 ? '+' : '') + GN.formatMoneyPlain(totalNetProfit, 'SDG') + '</td></tr>';
  html += '<tr><td style="padding:6px 0;color:var(--ok);font-weight:700">✓ محقق (وصل بنكيًا)</td><td style="padding:6px 0;text-align:end;color:var(--ok);font-weight:700">' + GN.formatMoneyPlain(totalRealized, 'SDG') + '</td></tr>';
  html += '<tr><td style="padding:6px 0;color:var(--warn);font-weight:700">⏳ معلق (بانتظار التحويل)</td><td style="padding:6px 0;text-align:end;color:var(--warn);font-weight:700">' + GN.formatMoneyPlain(totalPending, 'SDG') + '</td></tr>';
  html += '</table></div>';

  html += '</div>';

  if (c.notes || c.attachment_url){
    html += '<div class="card"><div class="card-head"><h3>' + GN.navIcon('file') + ' ملاحظات ومرفقات</h3></div>';
    if (c.notes) html += '<p style="font-size:13px;line-height:1.8;margin-bottom:10px">' + GN.esc(c.notes) + '</p>';
    if (c.attachment_url) html += '<a href="' + GN.escAttr(c.attachment_url) + '" target="_blank" rel="noopener" class="btn btn-sec btn-sm">' + GN.navIcon('file') + ' فتح المرفق</a>';
    html += '</div>';
  }

  html += '<div class="card"><div class="card-head"><h3>' + GN.navIcon('dollar') + ' البيعات الجزئية (' + sales.length + ')</h3></div>';

  if (!sales.length){
    html += '<div class="empty"><div class="ic">' + GN.navIcon('dollar') + '</div><h4>لا توجد بيعات جزئية بعد</h4></div>';
  } else {
    html += '<div class="table-wrap"><table><thead><tr>' +
      '<th>التاريخ</th><th>الكمية</th><th>سعر البيع/g</th><th>الإجمالي</th>' +
      '<th>العمولة</th><th>الضريبة+الرسوم</th><th>صافي الربح</th><th>الحالة</th>' +
      (isAdmin ? '<th></th>' : '') +
    '</tr></thead><tbody>';

    sales.forEach(function(s){
      var profitColor = Number(s.net_profit) >= 0 ? 'var(--ok)' : 'var(--bad)';
      var statusBadge = s.profit_status === 'realized'
        ? '<span class="chip ok"><span class="dot"></span>محقق</span>'
        : '<span class="chip w"><span class="dot"></span>معلق</span>';

      html += '<tr>' +
        '<td>' + GN.esc(GN.formatDate(s.sale_date)) + '</td>' +
        '<td class="num">' + GN.formatNum(s.quantity_grams, 2) + 'g</td>' +
        '<td class="num">' + GN.formatMoneyPlain(s.selling_price_per_gram, 'SDG') + '</td>' +
        '<td class="num">' + GN.formatMoneyPlain(s.selling_total, 'SDG') + '</td>' +
        '<td class="num">' + GN.formatMoneyPlain(s.sale_commission_amount || 0, 'SDG') + '</td>' +
        '<td class="num">' + GN.formatMoneyPlain((Number(s.sale_tax_amount) || 0) + (Number(s.sale_fee_amount) || 0), 'SDG') + '</td>' +
        '<td class="num" style="color:' + profitColor + ';font-weight:800">' + (Number(s.net_profit) >= 0 ? '+' : '') + GN.formatMoneyPlain(s.net_profit, 'SDG') + '</td>' +
        '<td>' + statusBadge + '</td>' +
        (isAdmin ? '<td class="actions"><div class="row-actions">' +
          (s.profit_status === 'pending'
            ? '<button class="icon-act" data-sale-act="realize" data-sale-id="' + GN.escAttr(s.id) + '" title="تحقيق الربح"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M20 6 9 17l-5-5"/></svg></button>'
            : '') +
          '<button class="icon-act del" data-sale-act="del" data-sale-id="' + GN.escAttr(s.id) + '" data-cycle-id="' + GN.escAttr(c.id) + '" title="حذف"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M8 6V4h8v2M6 6v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6"/></svg></button>' +
        '</div></td>' : '') +
      '</tr>';
    });
    html += '</tbody></table></div>';
  }
  html += '</div>';

  var bodyEl = document.getElementById('cdBody');
  if (bodyEl) bodyEl.innerHTML = html;

  var footEl = document.getElementById('cdFoot');
  var canAddSale = isAdmin && Number(c.remaining_grams) > 0 && (c.status === 'open' || c.status === 'partial');
  var canFullSale = isAdmin && Number(c.remaining_grams) > 0 && (c.status === 'open' || c.status === 'partial');
  var canTransfer = isAdmin && Number(c.remaining_grams) > 0;
  var canEdit = isAdmin;

  var footHTML = '';
  if (canFullSale){
    footHTML += '<button class="btn btn-gold" data-cd-full-sale><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M20 6 9 17l-5-5"/></svg> بيع الكامل (' + GN.formatNum(c.remaining_grams, 2) + 'g)</button>';
  }
  if (canAddSale){
    footHTML += '<button class="btn btn-pri" data-cd-sale><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg> بيع جزء</button>';
  }
  if (canTransfer){
    footHTML += '<button class="btn btn-sec" data-cd-transfer><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 8 12 3 3 8v8l9 5 9-5V8Z"/><path d="M3 8l9 5 9-5"/></svg> ترحيل المتبقي للمخزون</button>';
  }
  if (canEdit){
    footHTML += '<button class="btn btn-sec" data-cd-edit>' + GN.t('edit') + '</button>';
  }
  footHTML += '<button class="btn btn-sec" data-cd-close2>' + GN.t('close') + '</button>';
  if (footEl) footEl.innerHTML = footHTML;

  var body = overlay;
  body.querySelectorAll('[data-cd-close2]').forEach(function(b){ b.onclick = closeFn; });
  body.querySelectorAll('[data-cd-sale]').forEach(function(b){
    b.onclick = function(){
      closeFn();
      setTimeout(function(){ GN.openPartialSaleForm(c, null); }, 150);
    };
  });
  body.querySelectorAll('[data-cd-full-sale]').forEach(function(b){
    b.onclick = function(){
      closeFn();
      setTimeout(function(){ GN.openPartialSaleForm(c, null, true); }, 150);
    };
  });
  body.querySelectorAll('[data-cd-transfer]').forEach(function(b){
    b.onclick = function(){
      closeFn();
      setTimeout(function(){ GN.transferCycleToInventory(c, null); }, 150);
    };
  });
  body.querySelectorAll('[data-cd-edit]').forEach(function(b){
    b.onclick = function(){
      closeFn();
      setTimeout(function(){ GN.openCycleForm(c.id); }, 150);
    };
  });

  body.querySelectorAll('[data-sale-act]').forEach(function(b){
    b.onclick = function(){
      var act = b.getAttribute('data-sale-act');
      var sid = b.getAttribute('data-sale-id');
      if (act === 'realize'){
        closeFn();
        setTimeout(function(){ GN.realizeProfit(sid, c.id, null); }, 150);
      }
      else if (act === 'del'){
        GN.deleteCycleSale(sid, c.id, function(){
          closeFn();
          setTimeout(function(){ GN.viewCycleDetails(c.id); }, 150);
        });
      }
    };
  });
};

/* ============================================================
   Partial Sale Form
   ============================================================ */
GN.openPartialSaleForm = function(cycle, onSuccess, isFullSale){
  if (!GN.session.isOwner || !GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }

  var body = document.getElementById('formModalBody');
  var titleEl = document.getElementById('formModalTitle');
  if (!body || !titleEl) return;

  titleEl.textContent = isFullSale
    ? 'بيع الكامل — ' + (cycle.code || '')
    : 'بيع جزء من الدورة ' + (cycle.code || '');

  var maxG = Number(cycle.remaining_grams || 0);
  var now = new Date();
  var todayDate = now.toISOString().slice(0,10);
  var nowTime = String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');

  body.innerHTML =
    '<div class="form-grid">' +

      '<div class="field full" style="background:var(--gold-l);color:var(--gold-d);padding:10px 12px;border-radius:10px;font-size:12.5px;font-weight:700;text-align:center">' +
        'المتبقي في الدورة: ' + GN.formatNum(maxG, 2) + ' g · سعر الشراء: ' + GN.formatMoneyPlain(cycle.purchase_price_per_gram, 'SDG') +
      '</div>' +

      '<div class="field"><label>تاريخ البيع <span class="req">*</span></label>' +
        '<div class="input-wrap"><input type="date" id="ps_date" value="' + todayDate + '"></div></div>' +

      '<div class="field"><label>وقت البيع</label>' +
        '<div class="input-wrap"><input type="time" id="ps_time" value="' + nowTime + '"></div></div>' +

      '<div class="field"><label>الكمية (g) <span class="req">*</span></label>' +
        '<div class="input-wrap"><input type="number" id="ps_qty" step="0.001" min="0.001" max="' + maxG + '" value="' + maxG + '"' + (isFullSale ? ' readonly style="background:var(--bg-alt);font-weight:800"' : '') + '></div></div>' +

      '<div class="field"><label>سعر البيع/جرام (SDG) <span class="req">*</span></label>' +
        '<div class="input-wrap"><input type="number" id="ps_ppg" step="0.01" min="0"></div></div>' +

      '<div class="field full"><label>إجمالي البيع</label>' +
        '<div class="input-wrap"><input type="number" id="ps_total" readonly style="background:var(--bg-alt);font-weight:700"></div></div>' +

    '</div>' +

    '<div style="margin-top:18px;padding-top:14px;border-top:1px solid var(--line-2)">' +
      '<div style="font-weight:800;font-size:13px;margin-bottom:10px;color:var(--ink-2)">موقع البيع</div>' +
      '<div class="form-grid">' +
        '<div class="field"><label>الولاية</label><div class="input-wrap"><select id="ps_state"><option value="">—</option></select></div></div>' +
        '<div class="field"><label>المدينة</label><div class="input-wrap"><select id="ps_city"><option value="">—</option></select></div></div>' +
        '<div class="field full"><label>المكان / السوق</label><div class="input-wrap"><select id="ps_place"><option value="">—</option></select></div></div>' +
      '</div>' +
    '</div>' +

    '<div style="margin-top:18px;padding-top:14px;border-top:1px solid var(--line-2)">' +
      '<div style="font-weight:800;font-size:13px;margin-bottom:10px;color:var(--ink-2)">المندوب (اختياري)</div>' +
      '<div class="form-grid">' +
        '<div class="field"><label>المندوب</label><div class="input-wrap"><select id="ps_agent"><option value="">— لا يوجد —</option></select></div></div>' +
        '<div class="field"><label>عمولة البيع %</label><div class="input-wrap"><input type="number" id="ps_agent_pct" step="0.001" min="0" value="0"></div></div>' +
      '</div>' +
    '</div>' +

    '<div style="margin-top:18px;padding-top:14px;border-top:1px solid var(--line-2)">' +
      '<div style="font-weight:800;font-size:13px;margin-bottom:10px;color:var(--ink-2)">الضريبة والرسوم</div>' +
      '<div class="form-grid">' +
        '<div class="field"><label>نوع الضريبة</label>' +
          '<div class="input-wrap"><select id="ps_tax_type">' +
            '<option value="none">لا يوجد</option>' +
            '<option value="percent">نسبة %</option>' +
            '<option value="fixed">مبلغ ثابت</option>' +
          '</select></div></div>' +
        '<div class="field"><label>قيمة الضريبة</label><div class="input-wrap"><input type="number" id="ps_tax_value" step="0.01" min="0" value="0"></div></div>' +
        '<div class="field"><label>رسوم إضافية (مبلغ)</label><div class="input-wrap"><input type="number" id="ps_fee" step="0.01" min="0" value="0"></div></div>' +
        '<div class="field"><label>وصف الرسوم</label><div class="input-wrap"><input type="text" id="ps_fee_desc"></div></div>' +
      '</div>' +
    '</div>' +

    '<div style="margin-top:18px;padding-top:14px;border-top:1px solid var(--line-2)">' +
      '<div class="form-grid">' +
        '<div class="field"><label>تكلفة البضاعة</label><div class="input-wrap"><input type="number" id="ps_cost" readonly style="background:var(--bg-alt)"></div></div>' +
        '<div class="field"><label>الربح الإجمالي</label><div class="input-wrap"><input type="number" id="ps_gross" readonly style="background:var(--bg-alt)"></div></div>' +
        '<div class="field full"><label style="color:var(--gold-d);font-weight:800">صافي الربح المتوقع</label><div class="input-wrap"><input type="number" id="ps_net" readonly style="background:var(--gold-l);color:var(--gold-dd);font-weight:800;font-size:16px"></div></div>' +
      '</div>' +
    '</div>' +

    '<div style="margin-top:18px;padding-top:14px;border-top:1px solid var(--line-2)">' +
      '<div class="form-grid">' +
        '<div class="field full"><label>مرفق (رابط)</label><div class="input-wrap"><input type="url" id="ps_attach" dir="ltr" placeholder="https://..."></div></div>' +
        '<div class="field full"><label>ملاحظات</label><div class="input-wrap"><textarea id="ps_notes" rows="2"></textarea></div></div>' +
      '</div>' +
    '</div>';

  GN.loadLocationsForSelect('ps_state', 'state', null, cycle.purchase_state_id);
  GN.loadAgentsForSelect('ps_agent', null);
  if (cycle.purchase_state_id) GN.loadLocationsForSelect('ps_city', 'city', cycle.purchase_state_id, cycle.purchase_city_id);
  if (cycle.purchase_city_id) GN.loadLocationsForSelect('ps_place', 'place', cycle.purchase_city_id, cycle.purchase_place_id);

  document.getElementById('ps_state').addEventListener('change', function(){
    GN.loadLocationsForSelect('ps_city', 'city', this.value, null);
    document.getElementById('ps_place').innerHTML = '<option value="">—</option>';
  });
  document.getElementById('ps_city').addEventListener('change', function(){
    GN.loadLocationsForSelect('ps_place', 'place', this.value, null);
  });
  document.getElementById('ps_agent').addEventListener('change', function(){
    var opt = this.options[this.selectedIndex];
    var pct = opt.getAttribute('data-sell-pct');
    if (pct) document.getElementById('ps_agent_pct').value = pct;
  });

  function recalc(){
    var qty = Number(document.getElementById('ps_qty').value) || 0;
    var ppg = Number(document.getElementById('ps_ppg').value) || 0;
    var total = qty * ppg;

    var costPerGram = Number(cycle.purchase_price_per_gram) || 0;
    var costBasis = qty * costPerGram;
    var grossProfit = total - costBasis;

    var agentPct = Number(document.getElementById('ps_agent_pct').value) || 0;
    var commissionAmount = total * agentPct / 100;

    var taxType = document.getElementById('ps_tax_type').value;
    var taxValue = Number(document.getElementById('ps_tax_value').value) || 0;
    var taxAmount = 0;
    if (taxType === 'percent') taxAmount = total * taxValue / 100;
    else if (taxType === 'fixed') taxAmount = taxValue;

    var feeAmount = Number(document.getElementById('ps_fee').value) || 0;
    var netProfit = grossProfit - commissionAmount - taxAmount - feeAmount;

    document.getElementById('ps_total').value = total.toFixed(2);
    document.getElementById('ps_cost').value = costBasis.toFixed(2);
    document.getElementById('ps_gross').value = grossProfit.toFixed(2);
    document.getElementById('ps_net').value = netProfit.toFixed(2);
  }

  ['ps_qty','ps_ppg','ps_agent_pct','ps_tax_value','ps_fee'].forEach(function(id){
    document.getElementById(id).addEventListener('input', recalc);
  });
  document.getElementById('ps_tax_type').addEventListener('change', recalc);
  recalc();

  var submitBtn = document.getElementById('formModalSubmit');
  submitBtn.textContent = 'حفظ البيع';
  submitBtn.style.display = '';
  submitBtn.onclick = function(){
    var qty = Number(document.getElementById('ps_qty').value) || 0;
    var ppg = Number(document.getElementById('ps_ppg').value) || 0;
    if (!qty || !ppg){ GN.toast(GN.t('fieldRequired'), 'bad'); return; }
    if (qty > maxG + 0.001){ GN.toast('الكمية أكبر من المتبقي في الدورة', 'bad'); return; }

    var total = qty * ppg;
    var costPerGram = Number(cycle.purchase_price_per_gram) || 0;
    var costBasis = qty * costPerGram;
    var grossProfit = total - costBasis;

    var agentId = document.getElementById('ps_agent').value || null;
    var agentPct = Number(document.getElementById('ps_agent_pct').value) || 0;
    var commissionAmount = total * agentPct / 100;

    var taxType = document.getElementById('ps_tax_type').value;
    var taxValue = Number(document.getElementById('ps_tax_value').value) || 0;
    var taxAmount = taxType === 'percent' ? total * taxValue / 100 : (taxType === 'fixed' ? taxValue : 0);

    var feeAmount = Number(document.getElementById('ps_fee').value) || 0;
    var netProfit = grossProfit - commissionAmount - taxAmount - feeAmount;

    var saleISO = document.getElementById('ps_date').value + 'T' + document.getElementById('ps_time').value + ':00';

    var payload = {
      cycle_id: cycle.id,
      sale_date: saleISO,
      quantity_grams: qty,
      selling_price_per_gram: ppg,
      selling_total: total,
      sale_state_id: document.getElementById('ps_state').value || null,
      sale_city_id:  document.getElementById('ps_city').value || null,
      sale_place_id: document.getElementById('ps_place').value || null,
      sale_agent_id: agentId,
      sale_commission_pct: agentPct,
      sale_commission_amount: commissionAmount,
      sale_tax_type: taxType,
      sale_tax_value: taxValue,
      sale_tax_amount: taxAmount,
      sale_fee_amount: feeAmount,
      sale_fee_desc: document.getElementById('ps_fee_desc').value.trim(),
      cost_basis: costBasis,
      gross_profit: grossProfit,
      net_profit: netProfit,
      profit_status: 'pending',
      attachment_url: document.getElementById('ps_attach').value.trim(),
      notes: document.getElementById('ps_notes').value.trim()
    };

    submitBtn.disabled = true;
    GN.supa.from('gold_cycle_sales').insert(payload).select().then(function(res){
      if (res.error){ submitBtn.disabled = false; GN.toast(res.error.message, 'bad'); console.error(res.error); return; }

      var newSaleId = res.data && res.data[0] ? res.data[0].id : null;

      var createAgentPayable = function(){
        if (!agentId || commissionAmount <= 0){ finalize(); return; }
        GN.supa.from('agents').select('id,code,name,phone,bank_name,account_number,payment_method').eq('id', agentId).single().then(function(aRes){
          if (aRes.error || !aRes.data){ finalize(); return; }
          var agent = aRes.data;
          var p = GN.session.profile;
          var payCode = 'PAY-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-4);

          GN.supa.from('payment_orders').insert({
            code: payCode,
            type: 'agent',
            beneficiary_name: agent.name || '',
            beneficiary_bank: agent.bank_name || '',
            beneficiary_account: agent.account_number || '',
            beneficiary_phone: agent.phone || '',
            payment_method: agent.payment_method || 'cash',
            amount: commissionAmount,
            currency: 'SDG',
            amount_sdg: commissionAmount,
            due_date: null,
            status: 'pending',
            linked_source: 'gold_sale',
            linked_id: newSaleId || '',
            linked_desc: cycle.code || '',
            notes: 'عمولة مندوب بيع — ' + (cycle.code || ''),
            created_by: GN.session.user.id,
            created_by_name: (p && (p.full_name || p.email)) || ''
          }).then(function(){
            GN.toast('✓ تم إنشاء استحقاق المندوب تلقائيًا', 'ok');
            finalize();
          });
        });
      };

      var finalize = function(){
        submitBtn.disabled = false;
        GN.toast('تم تسجيل البيع — الربح معلق', 'ok');
        GN.notify.send({
          type: 'edit',
          section: 'cycles',
          target: 'cycle',
          target_id: cycle.id,
          title: 'بيع جزئي · ' + cycle.code,
          body: GN.formatNum(qty, 2) + 'g × ' + GN.formatNum(ppg, 2) + ' = ' + GN.formatNum(total, 2) + ' SDG'
        });

        GN.recalcCycleTotals(cycle.id).then(function(){
          GN.closeModal('formModal');
          if (onSuccess) onSuccess();
          else GN.loadCycles();
        });
      };

      createAgentPayable();
    });
  };

  GN.openModal('formModal');
};

/* ============================================================
   Recalc + Transfer + Realize + Delete
   ============================================================ */
GN.recalcCycleTotals = function(cycleId){
  return Promise.all([
    GN.supa.from('gold_cycle_sales').select('quantity_grams').eq('cycle_id', cycleId),
    GN.supa.from('gold_cycles').select('quantity_grams,transferred_grams').eq('id', cycleId).single()
  ]).then(function(results){
    var salesRes = results[0];
    var cycleRes = results[1];
    if (salesRes.error || cycleRes.error){
      console.error('[recalc]', salesRes.error || cycleRes.error);
      return null;
    }
    var sold = (salesRes.data || []).reduce(function(s, x){ return s + Number(x.quantity_grams || 0); }, 0);
    var total = Number(cycleRes.data.quantity_grams || 0);
    var transferred = Number(cycleRes.data.transferred_grams || 0);
    var remaining = Math.max(0, total - sold - transferred);

    var status = cycleRes.data.status;
    if (remaining <= 0 && transferred > 0) status = 'transferred';
    else if (remaining <= 0) status = 'closed';
    else if (sold > 0) status = 'partial';
    else status = 'open';

    var update = {
      sold_grams: sold,
      remaining_grams: remaining,
      status: status,
      updated_at: new Date().toISOString()
    };

    if (remaining <= 0 && (status === 'closed' || status === 'transferred')){
      GN.supa.from('gold_cycles').select('start_date').eq('id', cycleId).single().then(function(r){
        if (!r.error && r.data && r.data.start_date){
          var days = Math.ceil((Date.now() - new Date(r.data.start_date).getTime()) / 86400000);
          update.end_date = new Date().toISOString();
          update.actual_days = days;
          GN.supa.from('gold_cycles').update(update).eq('id', cycleId);
        }
      });
    } else {
      GN.supa.from('gold_cycles').update(update).eq('id', cycleId);
    }

    return update;
  });
};

GN.transferCycleToInventory = function(cycle, onSuccess){
  if (!GN.session.isOwner || !GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }

  var remaining = Number(cycle.remaining_grams || 0);
  if (remaining <= 0){ GN.toast('لا يوجد متبقي للترحيل', 'bad'); return; }

  GN.confirm({
    title: 'ترحيل المتبقي للمخزون',
    text: 'سيتم ترحيل ' + GN.formatNum(remaining, 2) + ' g إلى المخزون بسعر ' + GN.formatMoneyPlain(cycle.purchase_price_per_gram, 'SDG') + ' للجرام. هل أنت متأكد؟',
    okText: 'نعم، رحّل',
    cancelText: GN.t('cancel'),
    danger: false
  }).then(function(ok){
    if (!ok) return;

    var costPerGram = Number(cycle.purchase_price_per_gram) || 0;
    var totalCost = remaining * costPerGram;

    var payload = {
      source_cycle_id: cycle.id,
      entry_date: new Date().toISOString(),
      karat: cycle.karat || '21',
      weight_grams: remaining,
      remaining_grams: remaining,
      cost_per_gram: costPerGram,
      total_cost: totalCost,
      status: 'available',
      notes: 'مرحّل من دورة ' + (cycle.code || '')
    };

    GN.supa.from('gold_inventory').insert(payload).then(function(res){
      if (res.error){ GN.toast(res.error.message, 'bad'); console.error(res.error); return; }

      GN.supa.from('gold_cycles').update({
        transferred_grams: Number(cycle.transferred_grams || 0) + remaining,
        remaining_grams: 0,
        status: 'transferred',
        end_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }).eq('id', cycle.id).then(function(r2){
        if (r2.error){ GN.toast(r2.error.message, 'bad'); return; }
        GN.toast('تم الترحيل للمخزون', 'ok');
        GN.notify.send({
          type: 'edit',
          section: 'cycles',
          target: 'cycle',
          target_id: cycle.id,
          title: 'ترحيل للمخزون · ' + cycle.code,
          body: GN.formatNum(remaining, 2) + 'g — ' + GN.formatNum(totalCost, 2) + ' SDG'
        });
        if (onSuccess) onSuccess();
        else GN.loadCycles();
      });
    });
  });
};

GN.realizeProfit = function(saleId, cycleId, onSuccess){
  if (!GN.session.isOwner || !GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }

  var body = document.getElementById('formModalBody');
  var titleEl = document.getElementById('formModalTitle');
  if (!body || !titleEl) return;

  titleEl.textContent = 'تحقيق الربح — تسجيل الحوالة البنكية';

  GN.supa.from('gold_cycle_sales').select('*').eq('id', saleId).single().then(function(res){
    if (res.error){ GN.toast(res.error.message, 'bad'); return; }
    var sale = res.data;

    body.innerHTML =
      '<div class="form-grid">' +
        '<div class="field full" style="background:var(--ok-l);color:var(--ok);padding:10px 12px;border-radius:10px;font-size:13px;font-weight:700;text-align:center">' +
          'صافي الربح: ' + GN.formatMoneyPlain(sale.net_profit, 'SDG') +
        '</div>' +
        '<div class="field full"><label>رقم الحوالة البنكية <span class="req">*</span></label>' +
          '<div class="input-wrap"><input type="text" id="rp_transfer" dir="ltr" placeholder="TRF-12345"></div></div>' +
        '<div class="field full"><label>رقم الفاتورة</label>' +
          '<div class="input-wrap"><input type="text" id="rp_invoice" dir="ltr" placeholder="INV-12345"></div></div>' +
        '<div class="field full"><label>الحساب البنكي المستلم</label>' +
          '<div class="input-wrap"><select id="rp_bank"><option value="">— اختر —</option></select></div></div>' +
        '<div class="field full"><label>تاريخ التحويل</label>' +
          '<div class="input-wrap"><input type="date" id="rp_date" value="' + GN.today() + '"></div></div>' +
        '<div class="field full"><label>ملاحظات</label>' +
          '<div class="input-wrap"><textarea id="rp_notes" rows="2"></textarea></div></div>' +
      '</div>';

    var banks = GN.dh.list('banks') || [];
    var sel = document.getElementById('rp_bank');
    banks.forEach(function(b){
      var opt = document.createElement('option');
      opt.value = b.id;
      opt.textContent = b.name;
      sel.appendChild(opt);
    });

    var submitBtn = document.getElementById('formModalSubmit');
    submitBtn.textContent = 'تأكيد التحقيق';
    submitBtn.style.display = '';
    GN.openModal('formModal');

    submitBtn.onclick = function(){
      var trf = document.getElementById('rp_transfer').value.trim();
      if (!trf){ GN.toast('رقم الحوالة مطلوب', 'bad'); return; }

      var bankId = document.getElementById('rp_bank').value || '';
      var bankName = '';
      if (bankId){
        var bank = banks.filter(function(b){ return b.id === bankId; })[0];
        if (bank) bankName = bank.name;
      }

      submitBtn.disabled = true;
      GN.supa.from('gold_cycle_sales').update({
        profit_status: 'realized',
        realized_at: new Date().toISOString(),
        bank_transfer_ref: trf,
        bank_invoice_ref: document.getElementById('rp_invoice').value.trim(),
        bank_id: bankId
      }).eq('id', saleId).then(function(r){
        submitBtn.disabled = false;
        if (r.error){ GN.toast(r.error.message, 'bad'); return; }

        GN.toast('تم تحقيق الربح', 'ok');
        GN.notify.send({
          type: 'edit',
          section: 'cycles',
          target: 'cycle',
          target_id: cycleId || '',
          title: 'تحقيق ربح',
          body: GN.formatMoneyPlain(sale.net_profit, 'SDG') + ' — ' + trf
        });

        GN.supa.from('fund_pools').select('id').eq('code','profit').single().then(function(fr){
          if (!fr.error && fr.data){
            GN.supa.from('fund_transactions').insert({
              pool_id: fr.data.id,
              type: 'in',
              amount: sale.net_profit,
              currency: 'SDG',
              reason: 'تحقيق ربح دورة — حوالة ' + trf,
              reference_type: 'profit_realize',
              reference_id: saleId,
              bank_id: bankId
            });
          }
        });

        if (bankId){
          GN.addBankTransfer({
            bank_id: bankId,
            type: 'in',
            amount: sale.net_profit,
            currency: 'SDG',
            party: 'ربح دورة ذهب',
            invoice: trf,
            notes: 'تحقيق ربح — حوالة ' + trf,
            source: 'fund',
            source_id: saleId,
            date: document.getElementById('rp_date').value || GN.today()
          });
        }

        GN.closeModal('formModal');
        if (onSuccess) onSuccess();
        else GN.loadCycles();
      });
    };
  });
};

GN.deleteCycleSale = function(saleId, cycleId, onSuccess){
  if (!GN.session.isOwner){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  GN.confirm({
    title: 'حذف البيع',
    text: 'هل أنت متأكد من حذف هذا البيع؟ سيتم إرجاع الكمية للدورة.',
    okText: GN.t('delete'),
    cancelText: GN.t('cancel'),
    danger: true
  }).then(function(ok){
    if (!ok) return;
    GN.supa.from('gold_cycle_sales').delete().eq('id', saleId).then(function(res){
      if (res.error){ GN.toast(res.error.message, 'bad'); return; }
      GN.toast('تم الحذف', 'ok');
      GN.recalcCycleTotals(cycleId).then(function(){
        if (onSuccess) onSuccess();
        else GN.loadCycles();
      });
    });
  });
};

GN.deleteCycle = function(id){
  if (!GN.session.isOwner){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  GN.confirm({
    title: GN.t('delete'),
    text: 'حذف هذه الدورة؟ سيتم حذف بيعاتها الجزئية أيضًا.',
    okText: GN.t('delete'),
    cancelText: GN.t('cancel'),
    danger: true
  }).then(function(ok){
    if (!ok) return;
    GN.supa.from('gold_cycles').delete().eq('id', id).then(function(res){
      if (res.error){ GN.toast(res.error.message, 'bad'); return; }
      GN.notify.markDeleted('cycles', 'cycle', id);
      GN.toast(GN.t('deletedSuccess'), 'ok');
      GN.loadCycles();
    });
  });
};

/* ============================================================
   Bind Section
   ============================================================ */
GN.bindSection.cycles = function(){
  GN.bindAction('cycle-add', function(){
    if (!GN.session.isOwner || !GN.session.isAdmin){
      GN.toast(GN.t('readOnlyNotice'), 'bad'); return;
    }
    GN.openCycleForm(null);
  });

  GN.bindAction('brokerage-add', function(){
    if (!GN.session.isOwner || !GN.session.isAdmin){
      GN.toast(GN.t('readOnlyNotice'), 'bad'); return;
    }
    GN.openBrokerageForm(null);
  });

  GN.bindAction('cycles-apply', function(){
    GN.readCyclesFilters();
    GN.loadCycles();
  });

  GN.bindAction('cycles-clear', function(){
    GN.clearCyclesFilters();
  });
};

console.log('[Gold Nile] dashboard/12-cycles.js loaded');
})();