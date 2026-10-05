/* ============================================================
   Gold Nile — Dashboard / Expenses
   Category tree · Register expenses · Filters · Party linking
   ============================================================ */
(function(){
'use strict';

var GN = window.GN = window.GN || {};

GN._expCatsCache = [];
GN._expensesCache = [];
GN._expFilter = { category_id: '', party_type: '', date_from: '', date_to: '' };

/* ============================================================
   Section
   ============================================================ */
GN.sections.expenses = function(){
  var isAdmin = GN.session.isOwner && GN.session.isAdmin;

  var html = '<div class="fin-head"><div>' +
    '<h2>' + GN.navIcon('receipt') + ' ' + GN.esc(GN.t('expTitle')) + '</h2>' +
    '<span class="sub">' + GN.esc(GN.t('expSub')) + '</span></div>' +
    (isAdmin
      ? '<div style="display:flex;gap:6px;flex-wrap:wrap">' +
          '<button class="btn btn-sec btn-sm" data-act="exp-manage-cats">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg> ' +
            GN.esc(GN.t('expManageCats')) + '</button>' +
          '<button class="btn btn-pri btn-sm" data-act="exp-add">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg> ' +
            GN.esc(GN.t('expAdd')) + '</button>' +
        '</div>'
      : '') +
  '</div>';

  html += '<div class="kpi-grid" id="expKpis">' +
    '<div class="kpi"><div class="top"><span class="ic">' + GN.navIcon('receipt') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('loading')) + '</div><div class="val">—</div></div>' +
    '<div class="kpi"><div class="top"><span class="ic y">' + GN.navIcon('dollar') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('loading')) + '</div><div class="val">—</div></div>' +
    '<div class="kpi"><div class="top"><span class="ic g">' + GN.navIcon('chart') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('loading')) + '</div><div class="val">—</div></div>' +
    '<div class="kpi"><div class="top"><span class="ic ok">' + GN.navIcon('check') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('loading')) + '</div><div class="val">—</div></div>' +
  '</div>';

  html += GN.renderExpFilters();

  html += '<div class="card"><div class="card-head">' +
    '<h3>' + GN.navIcon('receipt') + ' ' + GN.esc(GN.t('expList')) + '</h3>' +
    '<span class="ff-count" id="expCount">—</span></div>' +
    '<div id="expTableWrap"><div class="empty"><div class="ic">' + GN.navIcon('receipt') + '</div>' +
    '<h4>' + GN.esc(GN.t('loading')) + '</h4></div></div></div>';

  setTimeout(GN.loadExpensesData, 100);
  return html;
};

/* ============================================================
   Filters
   ============================================================ */
GN.renderExpFilters = function(){
  var f = GN._expFilter;
  return '<div class="fin-filters" id="expFilters">' +
    '<div class="ff-field"><label>' + GN.esc(GN.t('expFilterCat')) + '</label>' +
      '<select id="exf_cat"><option value="">' + GN.esc(GN.t('cyFilterAll')) + '</option></select></div>' +
    '<div class="ff-field"><label>' + GN.esc(GN.t('expFilterParty')) + '</label>' +
      '<select id="exf_party">' +
        '<option value="">' + GN.esc(GN.t('cyFilterAll')) + '</option>' +
        '<option value="employee"' + (f.party_type === 'employee' ? ' selected' : '') + '>' + GN.esc(GN.t('expPartyEmployee')) + '</option>' +
        '<option value="agent"' + (f.party_type === 'agent' ? ' selected' : '') + '>' + GN.esc(GN.t('expPartyAgent')) + '</option>' +
        '<option value="cycle"' + (f.party_type === 'cycle' ? ' selected' : '') + '>' + GN.esc(GN.t('expPartyCycle')) + '</option>' +
        '<option value="general"' + (f.party_type === 'general' ? ' selected' : '') + '>' + GN.esc(GN.t('expPartyGeneral')) + '</option>' +
      '</select></div>' +
    '<div class="ff-field"><label>' + GN.esc(GN.t('cyFilterFrom')) + '</label>' +
      '<input type="date" id="exf_from" value="' + GN.escAttr(f.date_from) + '"></div>' +
    '<div class="ff-field"><label>' + GN.esc(GN.t('cyFilterTo')) + '</label>' +
      '<input type="date" id="exf_to" value="' + GN.escAttr(f.date_to) + '"></div>' +
    '<div class="ff-actions">' +
      '<button class="btn btn-sec btn-sm" data-act="exp-clear">' + GN.esc(GN.t('cyFilterClear')) + '</button>' +
      '<button class="btn btn-pri btn-sm" data-act="exp-apply">' + GN.esc(GN.t('cyFilterApply')) + '</button>' +
    '</div>' +
  '</div>';
};

GN.readExpFilters = function(){
  var g = function(id){ var el = document.getElementById(id); return el ? el.value.trim() : ''; };
  GN._expFilter = {
    category_id: g('exf_cat'),
    party_type: g('exf_party'),
    date_from: g('exf_from'),
    date_to: g('exf_to')
  };
};

GN.clearExpFilters = function(){
  GN._expFilter = { category_id: '', party_type: '', date_from: '', date_to: '' };
  GN.renderSection('expenses');
};

/* ============================================================
   Load data
   ============================================================ */
GN.loadExpensesData = function(){
  if (!GN.supa) return;

  var wrap = document.getElementById('expTableWrap');
  if (wrap){
    wrap.innerHTML = '<div class="empty"><div class="ic">' + GN.navIcon('receipt') + '</div>' +
      '<h4>' + GN.esc(GN.t('loading')) + '</h4></div>';
  }

  Promise.all([
    GN.supa.from('expense_categories').select('*').order('display_order').order('name_ar'),
    (function(){
      var q = GN.supa.from('expenses').select('*');
      var f = GN._expFilter;
      if (f.category_id) q = q.eq('category_id', f.category_id);
      if (f.party_type)  q = q.eq('party_type', f.party_type);
      if (f.date_from)   q = q.gte('expense_date', f.date_from);
      if (f.date_to)     q = q.lte('expense_date', f.date_to);
      return q.order('expense_date', { ascending: false }).limit(500);
    })()
  ]).then(function(res){
    if (res[0].error){
      console.error('[expenses]', res[0].error);
      if (wrap) wrap.innerHTML = '<div class="empty"><h4>خطأ</h4><p>' + GN.esc(res[0].error.message) + '</p></div>';
      return;
    }
    GN._expCatsCache = res[0].data || [];
    GN._expensesCache = res[1].error ? [] : (res[1].data || []);

    /* Populate cat filter */
    var catSel = document.getElementById('exf_cat');
    if (catSel){
      var cur = GN._expFilter.category_id;
      var opts = '<option value="">' + GN.esc(GN.t('cyFilterAll')) + '</option>';
      GN._expCatsCache.forEach(function(c){
        var indent = c.parent_id ? '   └ ' : '';
        opts += '<option value="' + GN.escAttr(c.id) + '"' + (c.id === cur ? ' selected' : '') + '>' + indent + GN.esc(c.name_ar) + '</option>';
      });
      catSel.innerHTML = opts;
    }

    GN.renderExpKPIs();
    GN.renderExpTable();
  });
};

/* ============================================================
   KPIs
   ============================================================ */
GN.renderExpKPIs = function(){
  var box = document.getElementById('expKpis');
  if (!box) return;

  var items = GN._expensesCache;
  var total = 0, count = items.length, thisMonth = 0;
  var now = new Date();
  var monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);

  var byCat = {};
  items.forEach(function(e){
    var amt = Number(e.amount || 0);
    total += amt;
    if (e.expense_date >= monthStart) thisMonth += amt;
    var cid = e.category_id || 'other';
    byCat[cid] = (byCat[cid] || 0) + amt;
  });

  /* Top category */
  var topCatId = null, topCatAmt = 0;
  Object.keys(byCat).forEach(function(k){
    if (byCat[k] > topCatAmt){ topCatAmt = byCat[k]; topCatId = k; }
  });
  var topCatName = '—';
  if (topCatId){
    var c = GN._expCatsCache.filter(function(x){ return x.id === topCatId; })[0];
    if (c) topCatName = c.name_ar;
  }

  box.innerHTML =
    '<div class="kpi hl"><div class="top"><span class="ic">' + GN.navIcon('receipt') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('expKpiCount')) + '</div>' +
      '<div class="val"><bdi>' + GN.formatNum(count) + '</bdi></div></div>' +
    '<div class="kpi"><div class="top"><span class="ic y">' + GN.navIcon('dollar') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('expKpiTotal')) + '</div>' +
      '<div class="val"><bdi>' + GN.formatNum(total) + '</bdi><span class="cur">SDG</span></div></div>' +
    '<div class="kpi"><div class="top"><span class="ic g">' + GN.navIcon('chart') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('expKpiTopCat')) + '</div>' +
      '<div class="val" style="font-size:15px">' + GN.esc(topCatName) + '</div>' +
      '<div class="sub">' + GN.formatMoneyPlain(topCatAmt, 'SDG') + '</div></div>' +
    '<div class="kpi"><div class="top"><span class="ic ok">' + GN.navIcon('check') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('expKpiMonth')) + '</div>' +
      '<div class="val"><bdi>' + GN.formatNum(thisMonth) + '</bdi><span class="cur">SDG</span></div></div>';
};

/* ============================================================
   Table
   ============================================================ */
GN.renderExpTable = function(){
  var wrap = document.getElementById('expTableWrap');
  var cnt = document.getElementById('expCount');
  if (!wrap) return;
  var items = GN._expensesCache;
  if (cnt) cnt.textContent = items.length;

  if (!items.length){
    wrap.innerHTML = '<div class="empty"><div class="ic">' + GN.navIcon('receipt') + '</div>' +
      '<h4>' + GN.esc(GN.t('expEmpty')) + '</h4>' +
      '<p>' + GN.esc(GN.t('expEmptyAdd')) + '</p></div>';
    return;
  }

  var isAdmin = GN.session.isOwner && GN.session.isAdmin;
  var catMap = {};
  GN._expCatsCache.forEach(function(c){ catMap[c.id] = c.name_ar; });

  var partyLbls = {
    employee: GN.t('expPartyEmployee'),
    agent:    GN.t('expPartyAgent'),
    cycle:    GN.t('expPartyCycle'),
    general:  GN.t('expPartyGeneral')
  };

  var rows = items.map(function(e){
    var catName = catMap[e.category_id] || '—';
    var partyLbl = partyLbls[e.party_type] || '—';

    var fromPayable = !!e.source_payable_id;
    var payableBadge = fromPayable
      ? ' <span class="chip n" style="font-size:10px;padding:2px 6px">' + GN.esc(GN.t('expFromPayable') || 'من استحقاق') + '</span>'
      : '';

    return '<tr data-notif-id="' + GN.escAttr(e.id) + '">' +
      '<td>' + GN.esc(GN.formatDate(e.expense_date)) + '</td>' +
      '<td>' + GN.esc(catName) + payableBadge + '</td>' +
      '<td>' + GN.esc(partyLbl) + (e.party_name ? ' — ' + GN.esc(e.party_name) : '') + '</td>' +
      '<td style="font-size:12.5px;color:var(--ink-2);max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + GN.esc(e.description || '-') + '</td>' +
      '<td class="num" style="font-weight:800">' + GN.formatMoneyPlain(e.amount, e.currency || 'SDG') + '</td>' +
      '<td><span class="chip ' + (e.status === 'paid' ? 'ok' : (e.status === 'pending' ? 'w' : 'b')) + '"><span class="dot"></span>' +
        GN.esc(e.status === 'paid' ? GN.t('expStatusPaid') : (e.status === 'pending' ? GN.t('expStatusPending') : GN.t('expStatusCancelled'))) + '</span></td>' +
      (isAdmin
        ? '<td class="actions"><div class="row-actions">' +
            '<button class="icon-act" data-exp-act="edit" data-exp-id="' + GN.escAttr(e.id) + '" title="' + GN.escAttr(GN.t('edit')) + '">' + GN.ICO_EDIT + '</button>' +
            '<button class="icon-act del" data-exp-act="del" data-exp-id="' + GN.escAttr(e.id) + '" title="' + GN.escAttr(GN.t('delete')) + '">' + GN.ICO_DEL + '</button>' +
          '</div></td>'
        : '') +
    '</tr>';
  }).join('');

  wrap.innerHTML = '<div class="table-wrap"><table><thead><tr>' +
    '<th>' + GN.esc(GN.t('date')) + '</th>' +
    '<th>' + GN.esc(GN.t('expCategory')) + '</th>' +
    '<th>' + GN.esc(GN.t('expParty')) + '</th>' +
    '<th>' + GN.esc(GN.t('notes')) + '</th>' +
    '<th>' + GN.esc(GN.t('txAmount')) + '</th>' +
    '<th>' + GN.esc(GN.t('cycleStatus')) + '</th>' +
    (isAdmin ? '<th></th>' : '') +
  '</tr></thead><tbody>' + rows + '</tbody></table></div>';

  GN.$$('[data-exp-act]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var act = btn.getAttribute('data-exp-act');
      var id = btn.getAttribute('data-exp-id');
      if (act === 'edit') GN.openExpenseForm(id);
      else if (act === 'del') GN.deleteExpense(id);
    });
  });
};

/* ============================================================
   Category manager (tree)
   ============================================================ */
GN.openExpCatManager = function(){
  if (!GN.session.isOwner || !GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }

  var overlay = document.getElementById('expCatOverlay');
  if (overlay) overlay.remove();

  overlay = document.createElement('div');
  overlay.id = 'expCatOverlay';
  overlay.className = 'overlay on';
  overlay.style.zIndex = '250';

  overlay.innerHTML = '<div class="modal wide" style="max-width:680px">' +
    '<div class="modal-head">' +
      '<h3>' + GN.esc(GN.t('expManageCats')) + '</h3>' +
      '<button class="close" type="button" data-exc-close><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>' +
    '</div>' +
    '<div class="modal-body" style="max-height:70vh;overflow-y:auto">' +
      '<button class="btn btn-pri" data-exc-add-root style="width:100%;margin-bottom:14px">' +
        '+ ' + GN.esc(GN.t('expAddMainCat')) +
      '</button>' +
      '<div id="excTree"></div>' +
    '</div>' +
  '</div>';

  document.body.appendChild(overlay);

  function closeFn(){ overlay.remove(); }
  overlay.querySelector('[data-exc-close]').onclick = closeFn;
  overlay.addEventListener('click', function(e){ if (e.target === overlay) closeFn(); });

  overlay.querySelector('[data-exc-add-root]').onclick = function(){
    GN.openExpCatForm(null, null, function(){ renderTree(); });
  };

  function renderTree(){
    var tree = document.getElementById('excTree');
    if (!tree) return;

    var roots = GN._expCatsCache.filter(function(c){ return !c.parent_id; });
    if (!roots.length){
      tree.innerHTML = '<div class="empty"><h4>' + GN.esc(GN.t('expNoCats')) + '</h4></div>';
      return;
    }

    var html = '';
    roots.forEach(function(root){
      var subs = GN._expCatsCache.filter(function(c){ return c.parent_id === root.id; });
      html += '<div class="exp-cat-node">' +
        '<div class="exp-cat-head">' +
          '<span class="exp-cat-ic">' + GN.navIcon('receipt') + '</span>' +
          '<span class="exp-cat-name">' + GN.esc(root.name_ar) + '</span>' +
          '<button class="icon-act sm" data-exc-add-sub="' + GN.escAttr(root.id) + '" title="إضافة تصنيف فرعي">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>' +
          '</button>' +
          '<button class="icon-act sm" data-exc-edit="' + GN.escAttr(root.id) + '" title="' + GN.escAttr(GN.t('edit')) + '">' + GN.ICO_EDIT + '</button>' +
          '<button class="icon-act sm del" data-exc-del="' + GN.escAttr(root.id) + '" title="' + GN.escAttr(GN.t('delete')) + '">' + GN.ICO_DEL + '</button>' +
        '</div>';

      if (subs.length){
        html += '<div class="exp-cat-subs">';
        subs.forEach(function(s){
          html += '<div class="exp-cat-sub">' +
            '<span class="exp-cat-dot"></span>' +
            '<span class="exp-cat-name sm">' + GN.esc(s.name_ar) + '</span>' +
            '<button class="icon-act sm" data-exc-edit="' + GN.escAttr(s.id) + '" title="' + GN.escAttr(GN.t('edit')) + '">' + GN.ICO_EDIT + '</button>' +
            '<button class="icon-act sm del" data-exc-del="' + GN.escAttr(s.id) + '" title="' + GN.escAttr(GN.t('delete')) + '">' + GN.ICO_DEL + '</button>' +
          '</div>';
        });
        html += '</div>';
      }

      html += '</div>';
    });
    tree.innerHTML = html;

    /* Bind */
    tree.querySelectorAll('[data-exc-add-sub]').forEach(function(b){
      b.onclick = function(){ GN.openExpCatForm(null, b.getAttribute('data-exc-add-sub'), function(){ renderTree(); }); };
    });
    tree.querySelectorAll('[data-exc-edit]').forEach(function(b){
      b.onclick = function(){ GN.openExpCatForm(b.getAttribute('data-exc-edit'), null, function(){ renderTree(); }); };
    });
    tree.querySelectorAll('[data-exc-del]').forEach(function(b){
      b.onclick = function(){
        var cid = b.getAttribute('data-exc-del');
        GN.confirm({
          title: GN.t('delete'),
          text: 'حذف هذا التصنيف؟ سيُحذف كل ما يتبعه من تصنيفات فرعية.',
          okText: GN.t('delete'),
          cancelText: GN.t('cancel'),
          danger: true
        }).then(function(ok){
          if (!ok) return;
          GN.supa.from('expense_categories').delete().eq('id', cid).then(function(res){
            if (res.error){ GN.toast(res.error.message, 'bad'); return; }
            GN.toast(GN.t('deletedSuccess'), 'ok');
            GN.supa.from('expense_categories').select('*').order('display_order').order('name_ar').then(function(r2){
              if (!r2.error){
                GN._expCatsCache = r2.data || [];
                renderTree();
              }
            });
          });
        });
      };
    });
  }

  renderTree();
};

/* ============================================================
   Category form
   ============================================================ */
GN.openExpCatForm = function(editId, parentId, onDone){
  if (!GN.session.isOwner || !GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }

  var isEdit = !!editId;
  var item = isEdit ? GN._expCatsCache.filter(function(x){ return x.id === editId; })[0] : null;

  GN.quickAddOverlay(
    isEdit ? GN.t('expEditCat') : (parentId ? GN.t('expAddSubCat') : GN.t('expAddMainCat')),
    [
      { id:'qa_name', label: GN.t('expCatName'), req:true, placeholder:'مثال: نقليات' }
    ],
    function(v, closeFn){
      if (!v.qa_name){ GN.toast(GN.t('fieldRequired'), 'bad'); return; }

      var payload = { name_ar: v.qa_name };
      if (!isEdit && parentId) payload.parent_id = parentId;
      if (!isEdit && !parentId) payload.display_order = 100;

      var promise = isEdit
        ? GN.supa.from('expense_categories').update(payload).eq('id', editId)
        : GN.supa.from('expense_categories').insert(payload);

      promise.then(function(res){
        if (res.error){ GN.toast(res.error.message, 'bad'); return; }
        GN.toast(isEdit ? GN.t('savedSuccess') : GN.t('addedSuccess'), 'ok');
        closeFn();
        GN.supa.from('expense_categories').select('*').order('display_order').order('name_ar').then(function(r){
          if (!r.error){
            GN._expCatsCache = r.data || [];
            if (onDone) onDone();
          }
        });
      });
    }
  );
};

/* ============================================================
   Expense form
   ============================================================ */
GN.openExpenseForm = function(id){
  if (!GN.session.isOwner || !GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }

  var isEdit = !!id;
  var item = isEdit ? GN._expensesCache.filter(function(x){ return x.id === id; })[0] : null;

  var body = document.getElementById('formModalBody');
  var titleEl = document.getElementById('formModalTitle');
  if (!body || !titleEl) return;

  titleEl.textContent = isEdit ? GN.t('expEdit') : GN.t('expAdd');

  /* Category options (indented tree) */
  var catOpts = '<option value="">— ' + GN.esc(GN.t('expSelectCat')) + ' —</option>';
  var roots = GN._expCatsCache.filter(function(c){ return !c.parent_id; });
  roots.forEach(function(r){
    catOpts += '<option value="' + GN.escAttr(r.id) + '"' + (item && item.category_id === r.id ? ' selected' : '') + '>' + GN.esc(r.name_ar) + '</option>';
    var subs = GN._expCatsCache.filter(function(c){ return c.parent_id === r.id; });
    subs.forEach(function(s){
      catOpts += '<option value="' + GN.escAttr(s.id) + '"' + (item && item.category_id === s.id ? ' selected' : '') + '>   └ ' + GN.esc(s.name_ar) + '</option>';
    });
  });

  /* Employee options */
  var employees = GN.dh.list('employees');
  var empOpts = '<option value="">—</option>' + employees.map(function(e){
    return '<option value="' + GN.escAttr(e.id) + '" data-name="' + GN.escAttr(e.name || '') + '"' + (item && item.party_id === e.id ? ' selected' : '') + '>' + GN.esc(e.name || '') + '</option>';
  }).join('');

  /* Agent options */
  var agents = GN.dh.list('gold_agents');
  var agentOpts = '<option value="">—</option>' + agents.map(function(a){
    return '<option value="' + GN.escAttr(a.id) + '" data-name="' + GN.escAttr(a.name || '') + '"' + (item && item.party_id === a.id ? ' selected' : '') + '>' + GN.esc(a.code + ' — ' + a.name) + '</option>';
  }).join('');

  var banks = GN.dh.list('banks');
  var bankOpts = '<option value="">—</option>' + banks.map(function(b){
    return '<option value="' + GN.escAttr(b.id) + '"' + (item && item.bank_id === b.id ? ' selected' : '') + '>' + GN.esc(b.name) + '</option>';
  }).join('');

  var today = new Date().toISOString().slice(0, 10);

  body.innerHTML = '<div class="form-grid">' +
    '<div class="field full"><label>' + GN.esc(GN.t('expCategory')) + ' <span class="req">*</span></label>' +
      '<div class="input-wrap"><select id="ef_cat">' + catOpts + '</select></div></div>' +

    '<div class="field"><label>' + GN.esc(GN.t('date')) + ' <span class="req">*</span></label>' +
      '<div class="input-wrap"><input type="date" id="ef_date" value="' + GN.escAttr(item ? item.expense_date : today) + '"></div></div>' +

    '<div class="field"><label>' + GN.esc(GN.t('txAmount')) + ' <span class="req">*</span></label>' +
      '<div class="input-wrap"><input type="number" id="ef_amount" step="0.01" min="0" value="' + (item ? item.amount : '') + '"></div></div>' +

    '<div class="field full"><label>' + GN.esc(GN.t('expPartyType')) + '</label>' +
      '<div class="input-wrap"><select id="ef_party_type">' +
        '<option value="">— ' + GN.esc(GN.t('expPartyNone')) + ' —</option>' +
        '<option value="employee"' + (item && item.party_type === 'employee' ? ' selected' : '') + '>' + GN.esc(GN.t('expPartyEmployee')) + '</option>' +
        '<option value="agent"' + (item && item.party_type === 'agent' ? ' selected' : '') + '>' + GN.esc(GN.t('expPartyAgent')) + '</option>' +
        '<option value="cycle"' + (item && item.party_type === 'cycle' ? ' selected' : '') + '>' + GN.esc(GN.t('expPartyCycle')) + '</option>' +
        '<option value="general"' + (item && item.party_type === 'general' ? ' selected' : '') + '>' + GN.esc(GN.t('expPartyGeneral')) + '</option>' +
      '</select></div></div>' +

    '<div class="field full" id="ef_party_emp_wrap" style="display:none"><label>' + GN.esc(GN.t('expPartyEmployee')) + '</label>' +
      '<div class="input-wrap"><select id="ef_party_emp">' + empOpts + '</select></div></div>' +

    '<div class="field full" id="ef_party_agent_wrap" style="display:none"><label>' + GN.esc(GN.t('expPartyAgent')) + '</label>' +
      '<div class="input-wrap"><select id="ef_party_agent">' + agentOpts + '</select></div></div>' +

    '<div class="field full" id="ef_party_cycle_wrap" style="display:none"><label>' + GN.esc(GN.t('expPartyCycle')) + '</label>' +
      '<div class="input-wrap"><input type="text" id="ef_party_cycle" placeholder="GLD-2026-0001" value="' + GN.escAttr(item && item.party_type === 'cycle' ? (item.party_name || '') : '') + '" dir="ltr"></div></div>' +

    '<div class="field"><label>' + GN.esc(GN.t('payMethod')) + '</label>' +
      '<div class="input-wrap"><select id="ef_method">' +
        '<option value="cash"' + ((item ? item.payment_method : 'cash') === 'cash' ? ' selected' : '') + '>' + GN.esc(GN.t('payMethodCash')) + '</option>' +
        '<option value="bank"' + (item && item.payment_method === 'bank' ? ' selected' : '') + '>' + GN.esc(GN.t('payMethodBank')) + '</option>' +
      '</select></div></div>' +

    '<div class="field" id="ef_bank_wrap" style="display:' + (item && item.payment_method === 'bank' ? 'block' : 'none') + '">' +
      '<label>' + GN.esc(GN.t('txSelectBank')) + '</label>' +
      '<div class="input-wrap"><select id="ef_bank">' + bankOpts + '</select></div></div>' +

    '<div class="field full"><label>' + GN.esc(GN.t('notes')) + '</label>' +
      '<div class="input-wrap"><textarea id="ef_desc" rows="2">' + GN.esc(item ? item.description : '') + '</textarea></div></div>' +

    '<div class="field full"><label>' + GN.esc(GN.t('cycleAttachment')) + '</label>' +
      '<div class="input-wrap"><input type="url" id="ef_attach" dir="ltr" placeholder="https://..." value="' + GN.escAttr(item ? item.attachment_url : '') + '"></div></div>' +

  '</div>';

  var sub = document.getElementById('formModalSubmit');
  if (sub) sub.style.display = '';
  GN.openModal('formModal');

  /* Party type toggle */
  var ptSel = document.getElementById('ef_party_type');
  var empWrap = document.getElementById('ef_party_emp_wrap');
  var agWrap = document.getElementById('ef_party_agent_wrap');
  var cyWrap = document.getElementById('ef_party_cycle_wrap');

  function toggleParty(){
    var v = ptSel.value;
    empWrap.style.display = v === 'employee' ? 'block' : 'none';
    agWrap.style.display = v === 'agent' ? 'block' : 'none';
    cyWrap.style.display = v === 'cycle' ? 'block' : 'none';
  }
  ptSel.addEventListener('change', toggleParty);
  toggleParty();

  /* Payment method toggle */
  var mSel = document.getElementById('ef_method');
  var bWrap = document.getElementById('ef_bank_wrap');
  mSel.addEventListener('change', function(){
    bWrap.style.display = mSel.value === 'bank' ? 'block' : 'none';
  });

  /* Submit */
  sub.onclick = function(){
    var catId = document.getElementById('ef_cat').value;
    var date = document.getElementById('ef_date').value;
    var amount = Number(document.getElementById('ef_amount').value) || 0;
    if (!catId || !date || !amount){ GN.toast(GN.t('fieldRequired'), 'bad'); return; }

    var partyType = ptSel.value || null;
    var partyId = null, partyName = '';

    if (partyType === 'employee'){
      var empSel = document.getElementById('ef_party_emp');
      partyId = empSel.value || null;
      var eOpt = empSel.options[empSel.selectedIndex];
      partyName = eOpt ? (eOpt.getAttribute('data-name') || '') : '';
    } else if (partyType === 'agent'){
      var agSel = document.getElementById('ef_party_agent');
      partyId = agSel.value || null;
      var aOpt = agSel.options[agSel.selectedIndex];
      partyName = aOpt ? (aOpt.getAttribute('data-name') || '') : '';
    } else if (partyType === 'cycle'){
      partyName = document.getElementById('ef_party_cycle').value.trim();
    }

    var method = mSel.value;
    var bankId = method === 'bank' ? document.getElementById('ef_bank').value : '';

    var payload = {
      category_id: catId,
      expense_date: date,
      amount: amount,
      currency: 'SDG',
      party_type: partyType,
      party_id: partyId,
      party_name: partyName,
      payment_method: method,
      bank_id: bankId,
      description: document.getElementById('ef_desc').value.trim(),
      attachment_url: document.getElementById('ef_attach').value.trim(),
      status: 'paid',
      updated_at: new Date().toISOString()
    };

    sub.disabled = true;
    var promise;
    if (isEdit){
      promise = GN.supa.from('expenses').update(payload).eq('id', id);
    } else {
      payload.created_by = GN.session.user.id;
      promise = GN.supa.from('expenses').insert(payload);
    }

    promise.then(function(res){
      sub.disabled = false;
      if (res.error){ GN.toast(res.error.message, 'bad'); console.error(res.error); return; }

      GN.toast(isEdit ? GN.t('savedSuccess') : GN.t('addedSuccess'), 'ok');

      if (!isEdit){
        GN.notify.send({
          type: 'add',
          section: 'expenses',
          target: 'expense',
          title: 'مصروف جديد',
          body: GN.formatMoneyPlain(amount, 'SDG') + (partyName ? ' — ' + partyName : '')
        });
      }

      GN.closeModal('formModal');
      GN.loadExpensesData();
    });
  };
};

/* ============================================================
   Delete
   ============================================================ */
GN.deleteExpense = function(id){
  if (!GN.session.isOwner){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  GN.confirm({
    title: GN.t('delete'),
    text: 'حذف هذا المصروف؟',
    okText: GN.t('delete'),
    cancelText: GN.t('cancel'),
    danger: true
  }).then(function(ok){
    if (!ok) return;
    GN.supa.from('expenses').delete().eq('id', id).then(function(res){
      if (res.error){ GN.toast(res.error.message, 'bad'); return; }
      GN.notify.markDeleted('expenses', 'expense', id);
      GN.toast(GN.t('deletedSuccess'), 'ok');
      GN.loadExpensesData();
    });
  });
};

/* ============================================================
   Bind
   ============================================================ */
GN.bindSection.expenses = function(){
  GN.bindAction('exp-add', function(){
    if (!GN.session.isOwner || !GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
    GN.openExpenseForm(null);
  });
  GN.bindAction('exp-manage-cats', function(){ GN.openExpCatManager(); });
  GN.bindAction('exp-apply', function(){ GN.readExpFilters(); GN.loadExpensesData(); });
  GN.bindAction('exp-clear', function(){ GN.clearExpFilters(); });
};

console.log('[Gold Nile] dashboard/17-expenses.js loaded');
})();