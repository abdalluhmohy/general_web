/* Gold Nile - Dashboard (Part 1 of 2) */
(function(){
'use strict';
var GN = window.GN = window.GN || {};

GN.dash = { current: 'home', data: null, notifs: [] };

GN.navGroups = [
  { title: 'groupMain', items: [
    { key:'home', icon:'home', label:'navHome' },
    { key:'suggestions', icon:'vote', label:'navSuggestions' }
  ]},
    { title: 'groupFinance', items: [
    { key:'finance',   icon:'dollar', label:'navFinance' },
    { key:'banking',   icon:'bank',   label:'navBanking' },
    { key:'gold',      icon:'gold',   label:'navGold' },
    { key:'payables',  icon:'wallet', label:'navPayables' }
  ]},
  { title: 'groupHR', items: [
    { key:'hr',   icon:'team',  label:'navHR' },
    { key:'tasks',icon:'check', label:'navTasks' }
  ]},
  { title: 'groupOps', items: [
    { key:'equipment', icon:'tool', label:'navEquipment' },
    { key:'docs',      icon:'file', label:'navDocs' }
  ]},
  { title: 'groupAdmin', items: [
    { key:'website',  icon:'file', label:'navWebsite',  ownerOnly:true , adminOnly:true },
    { key:'users',    icon:'lock', label:'navUsers',    ownerOnly:true , adminOnly:true },
    { key:'settings', icon:'cog',  label:'navSettings', ownerOnly:true , adminOnly:true}
  ]}
];

GN.navIcon = function(name){
  var icons = {
    home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="m3 11 9-8 9 8v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2v-9Z"/></svg>',
    dollar:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    bank:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><rect x="3" y="7" width="18" height="13" rx="2.5"/><path d="M3 11h18M7 15h2M12 15h5"/></svg>',
    gold:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M7 3h10l2 6H5l2-6Z"/><path d="M5 9v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9"/><path d="M9 14h6"/></svg>',
    team:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5"/><circle cx="17" cy="9" r="2.5"/></svg>',
    check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
    tool:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M14.7 6.3a4 4 0 1 0 5 5L21 12l-9 9-3-3 9-9-1.3-1.3Z"/><path d="M6 6l3 3"/></svg>',
    file:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>',
    lock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><rect x="4" y="10" width="16" height="10" rx="2.5"/><path d="M8 10V7a4 4 0 1 1 8 0v3"/></svg>',
    wallet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><rect x="2" y="6" width="20" height="14" rx="3"/><path d="M2 10h20M16 14h2"/><path d="M6 6V5a2 2 0 0 1 2-2h10"/></svg>',
    vote:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M9 18h6M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.4 1 1.1 1 1.8V17h6v-.5c0-.7.4-1.4 1-1.8A7 7 0 0 0 12 2Z"/></svg>',
    chart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M3 3v18h18"/><path d="m7 14 4-4 4 4 6-6"/></svg>',
    cog:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>'
  };
  return icons[name] || icons.home;
};

var ICO_EDIT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';
var ICO_DEL  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M8 6V4h8v2M6 6v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6M10 11v6M14 11v6"/></svg>';
var ICO_VIEW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>';
GN.ICO_EDIT = ICO_EDIT; GN.ICO_DEL = ICO_DEL; GN.ICO_VIEW = ICO_VIEW;

function d(){ return GN.dash.data || {}; }
function dash(){ return (d().dashboard = d().dashboard || {}); }
function list(name){ return dash()[name] || (dash()[name] = []); }
function settings(){ return (d().settings = d().settings || {}); }
function currency(){ return settings().currency || 'USD'; }

function save(){
  return GN.savePublicData(GN.dash.data).then(function(ok){
    if (ok){ GN.toast(GN.t('savedSuccess'), 'ok'); GN.renderSection(GN.dash.current); }
    else GN.toast(GN.t('saveFailed'), 'bad');
    return ok;
  });
}
function askDelete(){ return GN.confirm({ title: GN.t('confirmDelete'), text: GN.t('confirmDeleteNote'), okText: GN.t('delete'), cancelText: GN.t('cancel'), danger: true }); }
function sectionActions(arr){
  return '<div class="row-actions">' + arr.map(function(a){
    return '<button class="icon-act' + (a.danger ? ' del' : '') + '" data-act="' + a.act + '"' +
      (a.idx != null ? ' data-idx="' + a.idx + '"' : '') +
      (a.key ? ' data-key="' + a.key + '"' : '') +
      ' title="' + GN.escAttr(a.title || '') + '">' + a.icon + '</button>';
  }).join('') + '</div>';
}
function actions(a, arr){
  return '<div class="row-actions">' + arr.map(function(x){
    return '<button class="icon-act' + (x.danger ? ' del' : '') + '" data-act="' + x.act + '" data-idx="' + x.idx + '" title="' + GN.escAttr(x.title) + '">' + x.icon + '</button>';
  }).join('') + '</div>';
}

GN.renderSidebar = function(){
  var nav = document.getElementById('sideNav'); if (!nav) return;
  var html = '';
  GN.navGroups.forEach(function(group){
    var items = group.items.filter(function(it){
      if (it.ownerOnly && !GN.session.isOwner) return false;
      if (it.adminOnly && !GN.session.isAdmin) return false;
      return true;
    });
    if (!items.length) return;
    html += '<div class="nav-group"><span data-i18n="' + group.title + '">' + GN.esc(GN.t(group.title)) + '</span>';
    items.forEach(function(it){
      var on = GN.dash.current === it.key ? ' on' : '';
      html += '<a class="nav-link' + on + '" data-nav="' + it.key + '">' + GN.navIcon(it.icon) + ' <span data-i18n="' + it.label + '">' + GN.esc(GN.t(it.label)) + '</span></a>';
    });
    html += '</div>';
  });
  nav.innerHTML = html;
  GN.$$('.nav-link[data-nav]').forEach(function(link){
    link.addEventListener('click', function(){ GN.goTo(link.getAttribute('data-nav')); });
  });
};

GN.renderBottomNav = function(){
  var nav = document.getElementById('bottomNav'); if (!nav) return;
  var items = [
    { key:'home', icon:'home', label:'navHome' },
    { key:'suggestions', icon:'vote', label:'navSuggestions' },
    { key:'finance', icon:'dollar', label:'navFinance' },
    { key:'banking', icon:'bank', label:'navBanking' },
    { key:'hr', icon:'team', label:'navHR' },
    { key:'settings', icon:'cog', label:'navSettings' }
  ];
  nav.innerHTML = items.map(function(it){
    var on = GN.dash.current === it.key ? ' on' : '';
    return '<a class="' + on + '" data-nav="' + it.key + '">' + GN.navIcon(it.icon) + '<span data-i18n="' + it.label + '">' + GN.esc(GN.t(it.label)) + '</span></a>';
  }).join('');
  GN.$$('.bottom-nav a[data-nav]').forEach(function(link){
    link.addEventListener('click', function(){ GN.goTo(link.getAttribute('data-nav')); });
  });
};

GN.renderUserChip = function(){
  var p = GN.session.profile; if (!p) return;
  var name = p.full_name || p.email || 'User';
  var initial = GN.initial(name);
  var roleLabel = p.role === 'owner' ? (GN.session.isAdmin ? GN.t('roleAdmin') : GN.t('roleReader')) : GN.t('roleReader');
  var sideAv = document.getElementById('sideUserAv');
  var sideName = document.getElementById('sideUserName');
  var sideRole = document.getElementById('sideUserRole');
  if (sideAv) sideAv.textContent = initial;
  if (sideName) sideName.textContent = name;
  if (sideRole) sideRole.textContent = roleLabel;
  var chipAv = document.getElementById('userChipAv');
  var chipName = document.getElementById('userChipName');
  var chipRole = document.getElementById('userChipRole');
  if (chipAv) chipAv.textContent = initial;
  if (chipName) chipName.textContent = name;
  if (chipRole){ chipRole.textContent = roleLabel; chipRole.classList.toggle('admin', !!GN.session.isAdmin); }
  var welcomeEl = document.getElementById('crumbWelcome');
  if (welcomeEl) welcomeEl.textContent = 'مرحبًا، ' + name + ' 👋';
};

GN.goTo = function(key){
  GN.dash.current = key;
  GN.$$('.nav-link[data-nav]').forEach(function(l){ l.classList.toggle('on', l.getAttribute('data-nav') === key); });
  GN.$$('.bottom-nav a[data-nav]').forEach(function(l){ l.classList.toggle('on', l.getAttribute('data-nav') === key); });
  var titleKey = null;
  GN.navGroups.forEach(function(g){ g.items.forEach(function(it){ if (it.key === key) titleKey = it.label; }); });
  var titleEl = document.getElementById('crumbTitle');
  if (titleEl && titleKey) titleEl.textContent = GN.t(titleKey);
  GN.renderSection(key);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

GN.renderSection = function(key){
  var content = document.getElementById('dashContent'); if (!content) return;
  var fn = GN.sections[key];
  if (!fn){ content.innerHTML = '<div class="empty"><h4>—</h4><p>' + GN.esc(GN.t('noData')) + '</p></div>'; return; }
  content.innerHTML = fn();
  GN.bindSection(key);
};

GN.sections = {};
GN.bindSection = function(key){ var fn = GN.bindSection[key]; if (typeof fn === 'function') fn(); };
GN.bindAction = function(act, fn){
  GN.$$('[data-act="' + act + '"]').forEach(function(btn){
    btn.addEventListener('click', function(e){ e.preventDefault(); fn(btn, e); });
  });
};
/* ============================================================
   PAYABLES — Phase 4: KPIs + Tabs + Table
   ============================================================ */
GN.payablesFilter = { status: 'all' };

GN.sections.payables = function(){
  var html = '';
  html += '<div class="fin-head"><div>' +
    '<h2>' + GN.navIcon('wallet') + ' ' + GN.esc(GN.t('payTitle')) + '</h2>' +
    '<span class="sub">' + GN.esc(GN.t('paySub')) + '</span></div>' +
    '<button class="btn btn-pri btn-sm" data-act="pay-add">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg> ' +
      GN.esc(GN.t('payAdd')) + '</button></div>';
  html += '<div class="pay-kpis" id="payKpis"></div>';
  html += '<div id="payTabsWrap"></div>';
  html += '<div id="payTableWrap"><div class="empty"><div class="ic">' + GN.navIcon('wallet') + '</div><h4>' + GN.esc(GN.t('loading')) + '</h4></div></div>';
  setTimeout(GN.loadPayables, 100);
  return html;
};

GN.loadPayables = function(){
  if (!GN.supa) return;
  var wrap = document.getElementById('payTableWrap');
  if (wrap) wrap.innerHTML = '<div class="empty"><div class="ic">' + GN.navIcon('wallet') + '</div><h4>' + GN.esc(GN.t('loading')) + '</h4></div>';

  GN.supa.from('payment_orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500)
    .then(function(res){
      if (res.error){
        console.error('[pay]', res.error);
        if (wrap) wrap.innerHTML = '<div class="empty"><h4>خطأ في التحميل</h4><p>' + GN.esc(res.error.message) + '</p></div>';
        return;
      }
      var arr = res.data || [];
      GN.renderPayablesKPIs(arr);
      GN.renderPayablesTabs(arr);
      GN.renderPayablesTable(arr);
    });
};

GN.renderPayablesKPIs = function(arr){
  var box = document.getElementById('payKpis'); if (!box) return;
  var now = new Date();
  var monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  var today = new Date().toISOString().slice(0, 10);
  var pendingCount = 0, pendingAmount = 0, paidMonth = 0, overdueCount = 0;

  arr.forEach(function(p){
    var amt = Number(p.amount_sdg || p.amount || 0);
    if (p.status === 'pending' || p.status === 'approved'){
      pendingCount++;
      pendingAmount += amt;
      if (p.due_date && p.due_date < today) overdueCount++;
    }
    if (p.status === 'paid' && p.paid_at && p.paid_at >= monthStart){
      paidMonth += amt;
    }
  });

  box.innerHTML =
    '<div class="pay-kpi pending"><div class="ic">' + GN.navIcon('wallet') + '</div>' +
      '<div class="body"><div class="lbl">' + GN.esc(GN.t('payKpiPending')) + '</div>' +
      '<div class="val">' + GN.formatNum(pendingCount) + '</div></div></div>' +
    '<div class="pay-kpi"><div class="ic" style="background:var(--gold-l);color:var(--gold-d)">' + GN.navIcon('dollar') + '</div>' +
      '<div class="body"><div class="lbl">' + GN.esc(GN.t('payTotalPending')) + '</div>' +
      '<div class="val">' + GN.formatNum(pendingAmount) + '</div></div></div>' +
    '<div class="pay-kpi paid"><div class="ic">' + GN.navIcon('check') + '</div>' +
      '<div class="body"><div class="lbl">' + GN.esc(GN.t('payKpiPaid')) + '</div>' +
      '<div class="val">' + GN.formatNum(paidMonth) + '</div></div></div>' +
    '<div class="pay-kpi overdue"><div class="ic">' + GN.navIcon('check') + '</div>' +
      '<div class="body"><div class="lbl">' + GN.esc(GN.t('payKpiOverdue')) + '</div>' +
      '<div class="val">' + GN.formatNum(overdueCount) + '</div></div></div>';
};

GN.renderPayablesTabs = function(arr){
  var wrap = document.getElementById('payTabsWrap'); if (!wrap) return;
  var counts = { all: arr.length, pending: 0, approved: 0, paid: 0, cancelled: 0 };
  arr.forEach(function(p){ if (counts[p.status] != null) counts[p.status]++; });
  var tabs = [
    { key:'all', label: GN.t('payAll') },
    { key:'pending', label: GN.t('payPending') },
    { key:'approved', label: GN.t('payApproved') },
    { key:'paid', label: GN.t('payPaid') },
    { key:'cancelled', label: GN.t('payCancelled') }
  ];
  var active = GN.payablesFilter.status || 'all';
  wrap.innerHTML = '<div class="pay-tabs">' + tabs.map(function(t){
    var on = (t.key === active) ? ' on' : '';
    var cnt = counts[t.key] != null ? '<span class="cnt">' + counts[t.key] + '</span>' : '';
    return '<button class="pay-tab' + on + '" data-pay-tab="' + t.key + '">' + GN.esc(t.label) + cnt + '</button>';
  }).join('') + '</div>';

  GN.$$('[data-pay-tab]').forEach(function(btn){
    btn.addEventListener('click', function(){
      GN.payablesFilter.status = btn.getAttribute('data-pay-tab');
      GN.loadPayables();
    });
  });
};

GN.renderPayablesTable = function(arr){
  var wrap = document.getElementById('payTableWrap'); if (!wrap) return;
  var activeTab = GN.payablesFilter.status || 'all';
  var filtered = (activeTab === 'all') ? arr : arr.filter(function(p){ return p.status === activeTab; });

  if (!filtered.length){
    wrap.innerHTML = '<div class="card"><div class="empty"><div class="ic">' + GN.navIcon('wallet') + '</div>' +
      '<h4>' + GN.esc(GN.t('payEmpty')) + '</h4>' +
      '<p>' + GN.esc(GN.t('payEmptyAdd')) + '</p></div></div>';
    return;
  }

  var isAdmin = GN.session.isOwner && GN.session.isAdmin;
  var today = new Date().toISOString().slice(0, 10);

  wrap.innerHTML = '<div class="card"><div class="card-head">' +
    '<h3>' + GN.navIcon('wallet') + ' ' + GN.esc(GN.t('payTitle')) + '</h3>' +
    '<span class="ff-count">' + filtered.length + '</span></div>' +
    '<div class="tx-table-wrap"><table class="tx-table"><thead><tr>' +
    '<th>' + GN.esc(GN.t('payCode')) + '</th>' +
    '<th>' + GN.esc(GN.t('payType')) + '</th>' +
    '<th>' + GN.esc(GN.t('payBeneficiary')) + '</th>' +
    '<th>' + GN.esc(GN.t('payAmount')) + '</th>' +
    '<th>' + GN.esc(GN.t('payDueDate')) + '</th>' +
    '<th>' + GN.esc(GN.t('payStatus')) + '</th>' +
    (isAdmin ? '<th></th>' : '') +
  '</tr></thead><tbody>' + filtered.map(function(p){
    var currencyCode = p.currency || 'SDG';
    var sdg = Number(p.amount_sdg || 0);
    var isOverdue = (p.status === 'pending' || p.status === 'approved') && p.due_date && p.due_date < today;

    var typeLbl = p.type === 'agent' ? GN.t('payTypeAgent')
                : p.type === 'vendor' ? GN.t('payTypeVendor')
                : p.type === 'salary' ? GN.t('payTypeSalary')
                : p.type === 'operating' ? GN.t('payTypeOperating')
                : p.type === 'tax' ? GN.t('payTypeTax')
                : GN.t('payTypeOther');

    var statusLbl = p.status === 'pending' ? GN.t('payPending')
                  : p.status === 'approved' ? GN.t('payApproved')
                  : p.status === 'paid' ? GN.t('payPaid')
                  : GN.t('payCancelled');

    var actions = '';
    if (isAdmin){
      actions = '<div class="pay-actions">';
      if (p.status === 'pending'){
        actions += '<button class="pay-act approve" data-pay-act="approve" data-pay-id="' + GN.escAttr(p.id) + '" title="' + GN.escAttr(GN.t('payApprove')) + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M20 6 9 17l-5-5"/></svg></button>';
      }
      if (p.status === 'approved'){
        actions += '<button class="pay-act pay" data-pay-act="pay" data-pay-id="' + GN.escAttr(p.id) + '" title="' + GN.escAttr(GN.t('payMarkPaid')) + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="6" width="20" height="14" rx="3"/><path d="M2 10h20M16 14h2"/></svg></button>';
      }
      if (p.status === 'pending' || p.status === 'approved'){
        actions += '<button class="pay-act cancel" data-pay-act="cancel" data-pay-id="' + GN.escAttr(p.id) + '" title="' + GN.escAttr(GN.t('payCancel')) + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="m6 6 12 12"/></svg></button>';
      }
      if (p.status === 'cancelled'){
        actions += '<button class="pay-act del" data-pay-act="del" data-pay-id="' + GN.escAttr(p.id) + '" title="' + GN.escAttr(GN.t('delete')) + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M8 6V4h8v2M6 6v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6"/></svg></button>';
      }
      actions += '</div>';
    }

    return '<tr>' +
      '<td><span class="pay-code">' + GN.esc(p.code || '-') + '</span></td>' +
      '<td><span class="pay-type ' + GN.esc(p.type) + '">' + GN.esc(typeLbl) + '</span></td>' +
      '<td><div class="pay-benef"><b>' + GN.esc(p.beneficiary_name || '-') + '</b>' +
        (p.beneficiary_bank ? '<small>' + GN.esc(p.beneficiary_bank) + (p.beneficiary_account ? ' — ' + GN.esc(p.beneficiary_account) : '') + '</small>' : '') +
      '</div></td>' +
      '<td><span class="pay-amount">' + GN.formatNum(p.amount, 2) + ' <span style="font-size:10.5px;color:var(--ink-3)">' + GN.esc(currencyCode) + '</span>' +
        (currencyCode === 'USD' && sdg ? '<span class="sdg">≈ ' + GN.formatNum(sdg) + ' SDG</span>' : '') +
      '</span></td>' +
      '<td><span class="pay-due' + (isOverdue ? ' overdue' : '') + '">' + GN.esc(GN.formatDate(p.due_date)) + '</span></td>' +
      '<td><span class="pay-status ' + GN.esc(p.status) + '"><span class="dot"></span>' + GN.esc(statusLbl) + '</span></td>' +
      (isAdmin ? '<td>' + actions + '</td>' : '') +
    '</tr>';
  }).join('') + '</tbody></table></div></div>';

  GN.$$('[data-pay-act]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var act = btn.getAttribute('data-pay-act');
      var id = btn.getAttribute('data-pay-id');
      if (act === 'approve') GN.approvePayable(id);
      else if (act === 'pay') GN.markPayablePaid(id);
      else if (act === 'cancel') GN.cancelPayable(id);
      else if (act === 'del') GN.deletePayable(id);
    });
  });
};

GN.approvePayable = function(id){
  if (!GN.session.isOwner){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }

  var body = document.getElementById('formModalBody');
  var titleEl = document.getElementById('formModalTitle');
  if (!body || !titleEl) return;
  titleEl.textContent = GN.t('approveTitle');

  body.innerHTML = '<div class="form-grid">' +
    '<div class="field full" style="background:var(--nile-l);color:var(--nile);padding:10px 12px;border-radius:10px;font-size:12.5px;font-weight:600;text-align:center">' +
      GN.esc(GN.t('approveHint')) +
    '</div>' +
    '<div class="field"><label>' + GN.esc(GN.t('invoiceNumber')) + '</label>' +
      '<div class="input-wrap"><input type="text" id="ap_inv_no" dir="ltr" placeholder="INV-12345"></div></div>' +
    '<div class="field"><label>' + GN.esc(GN.t('invoiceUrl')) + '</label>' +
      '<div class="input-wrap"><input type="url" id="ap_inv_url" dir="ltr" placeholder="https://..."></div></div>' +
    '<div class="field full"><label>' + GN.esc(GN.t('notes')) + '</label>' +
      '<div class="input-wrap"><textarea id="ap_notes" rows="3"></textarea></div></div>' +
  '</div>';

  GN.openModal('formModal');

  var submitBtn = document.getElementById('formModalSubmit');
  submitBtn.onclick = function(){
    var invNo = document.getElementById('ap_inv_no').value.trim();
    var invUrl = document.getElementById('ap_inv_url').value.trim();
    var notes = document.getElementById('ap_notes').value.trim();

    submitBtn.disabled = true;
    var update = {
      status: 'approved',
      updated_at: new Date().toISOString()
    };
    if (invNo) update.notes = (notes ? notes + ' | ' : '') + 'INV#: ' + invNo;
    else if (notes) update.notes = notes;
    if (invUrl) update.invoice_url = invUrl;

    GN.supa.from('payment_orders').update(update).eq('id', id).then(function(res){
      submitBtn.disabled = false;
      if (res.error){ GN.toast(res.error.message, 'bad'); return; }
      GN.toast(GN.t('payApproved_msg'), 'ok');
      GN.closeModal('formModal');
      GN.loadPayables();
    });
  };
};

GN.cancelPayable = function(id){
  if (!GN.session.isOwner){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  GN.confirm({
    title: GN.t('payCancel'), text: GN.t('payCancelConfirm'),
    okText: GN.t('payCancel'), cancelText: GN.t('cancel'), danger: true
  }).then(function(ok){
    if (!ok) return;
    GN.supa.from('payment_orders').update({ status: 'cancelled', updated_at: new Date().toISOString() }).eq('id', id).then(function(res){
      if (res.error){ GN.toast(res.error.message, 'bad'); return; }
      GN.toast(GN.t('payCancelled_msg'), 'ok');
      GN.loadPayables();
    });
  });
};

GN.deletePayable = function(id){
  if (!GN.session.isOwner){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  GN.confirm({
    title: GN.t('delete'), text: GN.t('payDeleteConfirm'),
    okText: GN.t('delete'), cancelText: GN.t('cancel'), danger: true
  }).then(function(ok){
    if (!ok) return;
    GN.supa.from('payment_orders').delete().eq('id', id).then(function(res){
      if (res.error){ GN.toast(res.error.message, 'bad'); return; }
      GN.toast(GN.t('deletedSuccess'), 'ok');
      GN.loadPayables();
    });
  });
};

GN.markPayablePaid = function(id){
  GN.toast('Phase 5 — قريبًا', 'bad');
};

GN.bindSection.payables = function(){
  GN.bindAction('pay-add', function(){
    if (!GN.session.isOwner || !GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
    GN.toast('Phase 5 — قريبًا', 'bad');
  });
};


GN.bindSection.payables = function(){ /* سيُضاف لاحقًا */ };


GN.sections.home = function(){
  var dt = GN.dash.data || {};
  var inv = (dt.dashboard && dt.dashboard.investment) || {};
  var capTotal = Number(inv.capital_total || 0);
  var recovered = Number(inv.recovered_total || 0);
  var remaining = Math.max(0, capTotal - recovered);
  var pct = capTotal > 0 ? Math.min(100, Math.round((recovered / capTotal) * 100)) : 0;
  var employees = (dt.dashboard && dt.dashboard.employees || []).filter(function(e){ return e.status === 'active'; });
  var tasks = (dt.dashboard && dt.dashboard.tasks || []).filter(function(t){ return t.status !== 'done' && t.status !== 'cancelled'; });
  var banks = (dt.dashboard && dt.dashboard.banks) || [];
  var curr = (dt.settings && dt.settings.currency) || 'USD';
  var html = '<div class="kpi-grid">' +
    '<div class="kpi hl"><div class="top"><span class="ic">' + GN.navIcon('dollar') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('kpiCapital')) + '</div>' +
      '<div class="val"><bdi>' + GN.formatNum(capTotal) + '</bdi><span class="cur">' + GN.esc(curr) + '</span></div></div>' +
    '<div class="kpi"><div class="top"><span class="ic ok">' + GN.navIcon('check') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('kpiRecovered')) + '</div>' +
      '<div class="val"><bdi>' + GN.formatNum(recovered) + '</bdi><span class="cur">' + GN.esc(curr) + '</span></div>' +
      '<div class="sub">' + GN.esc(GN.t('recoveryPercent')) + ': ' + pct + '%</div></div>' +
    '<div class="kpi"><div class="top"><span class="ic y">' + GN.navIcon('team') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('kpiEmployees')) + '</div>' +
      '<div class="val"><bdi>' + GN.formatNum(employees.length) + '</bdi></div></div>' +
    '<div class="kpi"><div class="top"><span class="ic w">' + GN.navIcon('check') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('kpiTasks')) + '</div>' +
      '<div class="val"><bdi>' + GN.formatNum(tasks.length) + '</bdi></div></div>' +
  '</div>';
  html += '<div class="card"><div class="card-head"><h3>' + GN.navIcon('dollar') + ' ' + GN.esc(GN.t('investmentTitle')) + '</h3>' +
    '<span style="font-size:12px;color:var(--ink-2)">' + GN.formatNum(recovered) + ' / ' + GN.formatNum(capTotal) + ' ' + GN.esc(curr) + '</span></div>' +
    '<div class="progress"><span style="width:' + pct + '%;background:linear-gradient(90deg,#1E6B67,#3E8C86)"></span></div>' +
    '<div style="display:flex;justify-content:space-between;margin-top:12px;font-size:13px;color:var(--ink-2);flex-wrap:wrap;gap:8px">' +
      '<span>' + GN.esc(GN.t('recovered')) + ': <b style="color:var(--ok)">' + GN.formatNum(recovered) + '</b></span>' +
      '<span>' + GN.esc(GN.t('remaining')) + ': <b style="color:var(--gold-d)">' + GN.formatNum(remaining) + '</b></span>' +
      '<span>' + GN.esc(GN.t('recoveryPercent')) + ': <b>' + pct + '%</b></span>' +
    '</div></div>';
  if (banks.length){
    html += '<div class="card"><div class="card-head"><h3>' + GN.navIcon('bank') + ' ' + GN.esc(GN.t('banksList')) + '</h3></div>';
    html += '<div class="table-wrap"><table><thead><tr>' +
      '<th>' + GN.esc(GN.t('bankName')) + '</th><th>' + GN.esc(GN.t('accountNumber')) + '</th><th>' + GN.esc(GN.t('balance')) + '</th></tr></thead><tbody>';
    banks.forEach(function(b){
      html += '<tr><td>' + GN.esc(b.name || '-') + '</td>' +
        '<td><bdi dir="ltr">' + GN.esc(b.account_number || '-') + '</bdi></td>' +
        '<td class="num">' + GN.formatNum(b.balance || 0) + ' ' + GN.esc(b.currency || curr) + '</td></tr>';
    });
    html += '</tbody></table></div></div>';
  }
  return html;
};
GN.bindSection.home = function(){};

GN.renderNotifications = function(){
  var list_el = document.getElementById('notifList');
  var badge = document.getElementById('notifBadge');
  if (!list_el) return;
  var notifs = GN.dash.notifs || [];
  var unread = notifs.filter(function(n){ return !n.read; }).length;
  if (badge){ if (unread > 0){ badge.hidden = false; badge.textContent = unread > 99 ? '99+' : String(unread); } else badge.hidden = true; }
  if (!notifs.length){ list_el.innerHTML = '<div class="notif-empty">' + GN.esc(GN.t('noNotifications')) + '</div>'; return; }
  list_el.innerHTML = notifs.slice(0, 50).map(function(n){
    var iconName = n.type === 'in' ? 'in' : (n.type === 'out' ? 'out' : 'info');
    var iconSvg = n.type === 'in'
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>'
      : (n.type === 'out' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>');
    return '<div class="notif-item' + (n.read ? '' : ' unread') + '">' +
      '<div class="ic ' + iconName + '">' + iconSvg + '</div>' +
      '<div class="txt"><b>' + GN.esc(n.title || '') + '</b>' +
      '<p>' + GN.esc(n.body || '') + '</p>' +
      '<span class="meta">' + GN.esc(GN.relativeTime(n.date)) + '</span></div></div>';
  }).join('');
};
GN.pushNotification = function(notif){
  notif.id = notif.id || GN.uid();
  notif.date = notif.date || GN.now();
  notif.read = false;
  GN.dash.notifs.unshift(notif);
  GN.renderNotifications();
  GN.persistNotifications();
};
GN.persistNotifications = function(){
  if (!GN.dash.data || !GN.dash.data.dashboard) return;
  GN.dash.data.dashboard.notifications = GN.dash.notifs.slice(0, 100);
  GN.savePublicData(GN.dash.data);
};
GN.initNotifications = function(){
  var btn = document.getElementById('notifBtn');
  var close = document.getElementById('notifClose');
  var panel = document.getElementById('notifPanel');
  if (btn) btn.addEventListener('click', function(){
    if (panel) panel.classList.add('on');
    setTimeout(function(){
      GN.dash.notifs.forEach(function(n){ n.read = true; });
      GN.renderNotifications();
      GN.persistNotifications();
    }, 800);
  });
  if (close) close.addEventListener('click', function(){ if (panel) panel.classList.remove('on'); });
};

GN.initLogout = function(){
  var el1 = document.getElementById('logoutBtnSide');
  var el2 = document.getElementById('userChip');
  function doLogout(){
    GN.confirm({
      title: GN.t('logout'), text: 'هل تريد تسجيل الخروج؟',
      okText: GN.t('logout'), cancelText: GN.t('cancel'), danger: false
    }).then(function(ok){
      if (!ok) return;
      GN.logout().then(function(){ window.location.reload(); });
    });
  }
  if (el1) el1.addEventListener('click', doLogout);
  if (el2) el2.addEventListener('click', doLogout);
};

GN.initRefresh = function(){
  var btn = document.getElementById('refreshBtn');
  if (btn) btn.addEventListener('click', function(){
    GN.showLoading();
    GN.reloadDashboard().then(function(){ GN.hideLoading(); GN.toast(GN.t('updatedSuccess'), 'ok'); });
  });
};

GN.reloadDashboard = function(){
  return GN.loadPublicData().then(function(data){
    GN.dash.data = GN.normalizeData(data);
    GN.dash.notifs = (GN.dash.data.dashboard && GN.dash.data.dashboard.notifications) || [];
    GN.renderUserChip();
    GN.renderSidebar();
    GN.renderBottomNav();
    GN.renderNotifications();
    GN.renderSection(GN.dash.current);
    return true;
  });
};

GN.initDashboard = function(){
  GN.renderUserChip();
  GN.renderSidebar();
  GN.renderBottomNav();
  GN.initNotifications();
  GN.initLogout();
  GN.initRefresh();
  GN.$$('.overlay').forEach(function(ov){
    ov.addEventListener('click', function(e){ if (e.target === ov) GN.closeModal(ov.id); });
  });
  GN.$$('[data-close-modal]').forEach(function(btn){
    btn.addEventListener('click', function(){ GN.closeModal(btn.getAttribute('data-close-modal')); });
  });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') GN.closeAllModals(); });
  (function initModeToggle(){
    var btn = document.getElementById('modeToggleBtn');
    if (!btn) return;
    if (GN.session.isOwner) btn.hidden = false;
    else { btn.hidden = true; return; }
    function syncBtn(){
      if (GN.session.isAdmin){ btn.title = 'تبديل إلى وضع القارئ'; btn.classList.add('active-admin'); }
      else { btn.title = 'تبديل إلى وضع الأدمن'; btn.classList.remove('active-admin'); }
    }
    syncBtn();
    btn.addEventListener('click', function(){
      var on = GN.toggleAdminMode();
      if (on){ GN.enableAdminEditing(); GN.toast('وضع الأدمن مفعّل ✓', 'ok'); }
      else { GN.disableAdminEditing(); GN.toast('وضع القارئ مفعّل'); }
      syncBtn();
      GN.renderSidebar();
      GN.renderUserChip();
      GN.renderSection(GN.dash.current);
    });
  })();
  return GN.reloadDashboard();
};

/* ============================================================
   WEBSITE MANAGEMENT
   ============================================================ */
GN.websiteTab = 'board';
GN.sections.website = function(){
  /* Block non-admin access */
  if (!GN.session.isOwner || !GN.session.isAdmin){
    return '<div class="card"><div class="empty">' +
      '<div class="ic">' + GN.navIcon('lock') + '</div>' +
      '<h4>' + GN.esc(GN.t('readOnlyNotice')) + '</h4></div></div>';
  }

  var tab = GN.websiteTab || 'board';

  var tabs = [
    { key:'board',    label: GN.t('webTabBoard') },
    { key:'articles', label: GN.t('webTabArticles') },
    { key:'social',   label: GN.t('webTabSocial') },
    { key:'contact',  label: GN.t('webTabContact') },
    { key:'settings', label: GN.t('webTabSettings') }
  ];

  var html = '';
  html += '<div class="fin-head"><div>' +
    '<h2>' + GN.navIcon('file') + ' ' + GN.esc(GN.t('websiteTitle')) + '</h2>' +
    '<span class="sub">' + GN.esc(GN.t('websiteSub')) + '</span></div></div>';

  html += '<div class="pay-tabs">' + tabs.map(function(t){
    var on = (t.key === tab) ? ' on' : '';
    return '<button class="pay-tab' + on + '" data-web-tab="' + t.key + '">' + GN.esc(t.label) + '</button>';
  }).join('') + '</div>';

  html += '<div id="websiteContent">' + GN.renderWebsiteContent(tab) + '</div>';

  return html;
};

GN.renderWebsiteContent = function(tab){
  if (tab === 'board')    return GN.renderWebsiteBoard();
  if (tab === 'articles') return GN.renderWebsiteArticles();
  if (tab === 'social')   return GN.renderWebsiteSocial();
  return '<div class="card"><div class="empty">' +
    '<div class="ic">' + GN.navIcon('cog') + '</div>' +
    '<h4>' + GN.esc(GN.t('webComingSoon')) + '</h4></div></div>';
};

GN.renderWebsiteBoard = function(){
  var list = GN.dash.data && Array.isArray(GN.dash.data.board) ? GN.dash.data.board : [];
  var isAdmin = GN.session.isOwner && GN.session.isAdmin;

  var html = '';
  html += '<div class="fin-head"><div>' +
    '<h2>' + GN.navIcon('team') + ' ' + GN.esc(GN.t('webTabBoard')) + '</h2>' +
    '<span class="sub">' + GN.esc(GN.t('webBoardCount')) + ': ' + list.length + '</span></div>' +
    (isAdmin
      ? '<button class="btn btn-pri btn-sm" data-act="web-board-add">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg> ' +
          GN.esc(GN.t('boardAddMember')) + '</button>'
      : '') +
  '</div>';

  if (!list.length){
    html += '<div class="card"><div class="empty"><div class="ic">' + GN.navIcon('team') + '</div>' +
      '<h4>' + GN.esc(GN.t('boardEmpty')) + '</h4>' +
      '<p>' + GN.esc(GN.t('webBoardAddFirst')) + '</p></div></div>';
    return html;
  }

  var sorted = list.map(function(m, i){ return { m: m, i: i }; }).sort(function(a, b){
    var ao = (a.m.order != null && a.m.order !== '') ? Number(a.m.order) : 999;
    var bo = (b.m.order != null && b.m.order !== '') ? Number(b.m.order) : 999;
    return ao - bo;
  });

  html += '<div class="web-board-grid">' + sorted.map(function(o){
    var m = o.m;
    var realIdx = o.i;
    var flagLabel = m.flag === 'sd' ? GN.t('boardFlagSudan') : (m.flag === 'om' ? GN.t('boardFlagOman') : GN.t('boardFlagEgypt'));
    var photo = m.photo
      ? '<img src="' + GN.escAttr(m.photo) + '" alt="" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'grid\'"><div class="fallback" style="display:none">' + GN.esc(GN.initial(m.name || '?')) + '</div>'
      : '<div class="fallback">' + GN.esc(GN.initial(m.name || '?')) + '</div>';

    return '<div class="web-board-card" data-wb-idx="' + realIdx + '">' +
      '<div class="web-board-photo">' + photo + '</div>' +
      '<div class="web-board-info">' +
        (m.role ? '<div class="web-board-role">' + GN.esc(m.role) + '</div>' : '') +
        '<div class="web-board-name">' + GN.esc(m.name || '-') + '</div>' +
        (m.subtitle ? '<div class="web-board-sub">' + GN.esc(m.subtitle) + '</div>' : '') +
        '<div class="web-board-meta">' +
          '<span class="web-board-flag flag-' + GN.escAttr(m.flag || 'sd') + '">' + GN.esc(flagLabel) + '</span>' +
          (m.order ? '<span class="web-board-order">#' + GN.esc(m.order) + '</span>' : '') +
        '</div>' +
        (m.quote ? '<div class="web-board-quote">' + GN.esc(m.quote) + '</div>' : '') +
        (isAdmin
          ? '<div class="web-board-actions">' +
              '<button class="web-act edit" data-wb-edit="' + realIdx + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg> ' + GN.esc(GN.t('edit')) + '</button>' +
              '<button class="web-act del" data-wb-del="' + realIdx + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M8 6V4h8v2M6 6v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6"/></svg> ' + GN.esc(GN.t('delete')) + '</button>' +
            '</div>'
          : '') +
      '</div>' +
    '</div>';
  }).join('') + '</div>';

  return html;
};

GN.bindSection.website = function(){
  /* Tabs */
  GN.$$('[data-web-tab]').forEach(function(btn){
    btn.addEventListener('click', function(){
      GN.websiteTab = btn.getAttribute('data-web-tab');
      GN.renderSection('website');
    });
  });

  /* ===== Board ===== */
  GN.bindAction('web-board-add', function(){
    if (!GN.session.isOwner || !GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
    GN.openWebsiteBoardForm(-1);
  });

  GN.$$('[data-wb-edit]').forEach(function(b){
    b.addEventListener('click', function(){
      if (!GN.session.isOwner || !GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
      GN.openWebsiteBoardForm(+b.getAttribute('data-wb-edit'));
    });
  });

  GN.$$('[data-wb-del]').forEach(function(b){
    b.addEventListener('click', function(){
      if (!GN.session.isOwner || !GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
      var idx = +b.getAttribute('data-wb-del');
      GN.confirm({
        title: GN.t('delete'),
        text: GN.t('boardDeleteConfirm'),
        okText: GN.t('delete'),
        cancelText: GN.t('cancel'),
        danger: true
      }).then(function(ok){
        if (!ok) return;
        GN.dash.data.board.splice(idx, 1);
        GN.savePublicData(GN.dash.data).then(function(saved){
          if (saved){ GN.toast(GN.t('deletedSuccess'), 'ok'); GN.renderSection('website'); }
          else GN.toast(GN.t('saveFailed'), 'bad');
        });
      });
    });
  });

  /* ===== Articles ===== */
  GN.bindAction('web-news-add', function(){
    if (!GN.session.isOwner || !GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
    GN.openWebsiteArticleForm(-1);
  });

  GN.$$('[data-wn-edit]').forEach(function(b){
    b.addEventListener('click', function(){
      if (!GN.session.isOwner || !GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
      GN.openWebsiteArticleForm(+b.getAttribute('data-wn-edit'));
    });
  });

  GN.$$('[data-wn-del]').forEach(function(b){
    b.addEventListener('click', function(){
      if (!GN.session.isOwner || !GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
      var idx = +b.getAttribute('data-wn-del');
      GN.confirm({
        title: GN.t('delete'),
        text: GN.t('newsDeleteConfirm'),
        okText: GN.t('delete'),
        cancelText: GN.t('cancel'),
        danger: true
      }).then(function(ok){
        if (!ok) return;
        if (!Array.isArray(GN.dash.data.news)) GN.dash.data.news = [];
        GN.dash.data.news.splice(idx, 1);
        GN.savePublicData(GN.dash.data).then(function(saved){
          if (saved){ GN.toast(GN.t('deletedSuccess'), 'ok'); GN.renderSection('website'); }
          else GN.toast(GN.t('saveFailed'), 'bad');
        });
      });
    });
  });


  /* ===== Social Media ===== */
  GN.$$('[data-social-input]').forEach(function(input){
    input.addEventListener('input', function(){
      var key = input.getAttribute('data-social-input');
      var val = input.value.trim();
      if (!GN.dash.data.settings) GN.dash.data.settings = {};
      if (!GN.dash.data.settings.social) GN.dash.data.settings.social = {};
      GN.dash.data.settings.social[key] = val;

      var row = input.closest('.social-row');
      var link = row ? row.querySelector('[data-social-open]') : null;
      if (row){
        if (val) row.classList.add('has-url');
        else row.classList.remove('has-url');
      }
      if (link){
        link.href = val || '#';
      }
    });

    /* Save on blur */
    input.addEventListener('blur', function(){
      if (!GN.session.isOwner || !GN.session.isAdmin) return;
      GN.savePublicData(GN.dash.data).then(function(ok){
        if (ok) GN.toast(GN.t('socialSaved'), 'ok');
        else GN.toast(GN.t('saveFailed'), 'bad');
      });
    });
  });

  GN.$$('[data-social-clear]').forEach(function(btn){
    btn.addEventListener('click', function(){
      if (!GN.session.isOwner || !GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
      var key = btn.getAttribute('data-social-clear');
      var row = btn.closest('.social-row');
      var input = row ? row.querySelector('[data-social-input]') : null;
      if (input) input.value = '';
      if (GN.dash.data.settings && GN.dash.data.settings.social){
        GN.dash.data.settings.social[key] = '';
      }
      if (row) row.classList.remove('has-url');
      var link = row ? row.querySelector('[data-social-open]') : null;
      if (link) link.href = '#';

      GN.savePublicData(GN.dash.data).then(function(ok){
        if (ok) GN.toast(GN.t('deletedSuccess'), 'ok');
      });
    });
  });
};

/* ============================================================
   WEBSITE BOARD — Add/Edit Form
   ============================================================ */
GN.openWebsiteBoardForm = function(idx){
  if (!GN.session.isOwner){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  if (!GN.dash.data.public) GN.dash.data.public = {};
  if (!Array.isArray(GN.dash.data.board)) GN.dash.data.board = [];
  var list = GN.dash.data.board;

  var isEdit = idx >= 0;
  var item = isEdit ? list[idx] : { name:'', role:'', subtitle:'', quote:'', photo:'', flag:'sd', order:'' };

  var body = document.getElementById('formModalBody');
  var titleEl = document.getElementById('formModalTitle');
  if (!body || !titleEl) return;
  titleEl.textContent = isEdit ? GN.t('boardEditMember') : GN.t('boardAddMember');

  function opt(list, sel){
    return list.map(function(o){
      return '<option value="' + GN.escAttr(o.value) + '"' + (o.value === sel ? ' selected' : '') + '>' + GN.esc(o.label) + '</option>';
    }).join('');
  }

  body.innerHTML = '<div class="form-grid">' +
    '<div class="field full"><label>' + GN.esc(GN.t('boardName')) + ' <span class="req">*</span></label>' +
      '<div class="input-wrap"><input type="text" id="wb_name" maxlength="100" value="' + GN.escAttr(item.name || '') + '"></div></div>' +
    '<div class="field"><label>' + GN.esc(GN.t('boardRole')) + '</label>' +
      '<div class="input-wrap"><input type="text" id="wb_role" maxlength="100" value="' + GN.escAttr(item.role || '') + '"></div></div>' +
    '<div class="field"><label>' + GN.esc(GN.t('boardSubtitle')) + '</label>' +
      '<div class="input-wrap"><input type="text" id="wb_subtitle" maxlength="100" value="' + GN.escAttr(item.subtitle || '') + '"></div></div>' +
    '<div class="field"><label>' + GN.esc(GN.t('boardFlag')) + '</label>' +
      '<div class="input-wrap"><select id="wb_flag">' +
        opt([
          { value:'sd', label: GN.t('boardFlagSudan') },
          { value:'om', label: GN.t('boardFlagOman') },
          { value:'eg', label: GN.t('boardFlagEgypt') }
        ], item.flag || 'sd') +
      '</select></div></div>' +
    '<div class="field"><label>' + GN.esc(GN.t('boardOrder')) + '</label>' +
      '<div class="input-wrap"><input type="number" id="wb_order" min="1" max="99" value="' + GN.escAttr(item.order == null ? '' : item.order) + '"></div></div>' +
    '<div class="field full"><label>' + GN.esc(GN.t('boardPhotoUrl')) + '</label>' +
      '<div class="input-wrap"><input type="url" id="wb_photo" dir="ltr" placeholder="https://..." value="' + GN.escAttr(item.photo || '') + '"></div></div>' +
    '<div class="field full"><label>' + GN.esc(GN.t('boardQuote')) + '</label>' +
      '<div class="input-wrap"><textarea id="wb_quote" rows="4" maxlength="500">' + GN.esc(item.quote || '') + '</textarea></div></div>' +
  '</div>';

  GN.openModal('formModal');

  var submitBtn = document.getElementById('formModalSubmit');
  submitBtn.onclick = function(){
    var name = document.getElementById('wb_name').value.trim();
    if (!name){ GN.toast(GN.t('fieldRequired'), 'bad'); return; }

    var obj = {
      name: name,
      role: document.getElementById('wb_role').value.trim(),
      subtitle: document.getElementById('wb_subtitle').value.trim(),
      flag: document.getElementById('wb_flag').value,
      order: document.getElementById('wb_order').value ? Number(document.getElementById('wb_order').value) : '',
      photo: document.getElementById('wb_photo').value.trim(),
      quote: document.getElementById('wb_quote').value.trim()
    };

    if (isEdit) list[idx] = obj;
    else list.push(obj);

    submitBtn.disabled = true;
    GN.savePublicData(GN.dash.data).then(function(ok){
      submitBtn.disabled = false;
      if (ok){
        GN.toast(isEdit ? GN.t('savedSuccess') : GN.t('addedSuccess'), 'ok');
        GN.closeModal('formModal');
        GN.renderSection('website');
      } else {
        GN.toast(GN.t('saveFailed'), 'bad');
      }
    });
  };
};

/* ============================================================
   WEBSITE ARTICLES — List
   ============================================================ */
GN.renderWebsiteArticles = function(){
  if (!Array.isArray(GN.dash.data.news)) GN.dash.data.news = [];
  var list = GN.dash.data.news;
  var sorted = list.slice().sort(function(a, b){
    return (b.date || '').localeCompare(a.date || '');
  });

  var html = '';
  html += '<div class="fin-head"><div>' +
    '<h2>' + GN.navIcon('file') + ' ' + GN.esc(GN.t('webTabArticles')) + '</h2>' +
    '<span class="sub">' + GN.esc(GN.t('newsCount')) + ': ' + list.length + '</span></div>' +
    '<button class="btn btn-pri btn-sm" data-act="web-news-add">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg> ' +
      GN.esc(GN.t('newsAddNew')) + '</button></div>';

  if (!list.length){
    html += '<div class="card"><div class="empty">' +
      '<div class="ic">' + GN.navIcon('file') + '</div>' +
      '<h4>' + GN.esc(GN.t('newsEmpty2')) + '</h4>' +
      '<p>' + GN.esc(GN.t('newsEmptyHint')) + '</p></div></div>';
    return html;
  }

  html += '<div class="web-board-grid" style="grid-template-columns:repeat(auto-fill,minmax(320px,1fr))">';
  sorted.forEach(function(n){
    var realIdx = list.indexOf(n);
    var photo = n.image
      ? '<img src="' + GN.escAttr(n.image) + '" alt="" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'grid\'"><div class="fallback" style="display:none">' + GN.esc(GN.initial(n.title || '?')) + '</div>'
      : '<div class="fallback">' + GN.esc(GN.initial(n.title || '?')) + '</div>';

    html += '<div class="web-board-card" style="flex-direction:column">' +
      '<div class="web-board-photo" style="width:100%;height:160px">' + photo + '</div>' +
      '<div class="web-board-info">' +
        (n.date ? '<div class="web-board-role">' + GN.esc(GN.formatDate(n.date)) + '</div>' : '') +
        '<div class="web-board-name">' + GN.esc(n.title || '-') + '</div>' +
        (n.text ? '<div class="web-board-quote">' + GN.esc(n.text.slice(0, 140)) + (n.text.length > 140 ? '…' : '') + '</div>' : '') +
        '<div class="web-board-actions">' +
          '<button class="web-act edit" data-wn-edit="' + realIdx + '">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg> ' + GN.esc(GN.t('edit')) +
          '</button>' +
          '<button class="web-act del" data-wn-del="' + realIdx + '">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M8 6V4h8v2M6 6v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6"/></svg> ' + GN.esc(GN.t('delete')) +
          '</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  });
  html += '</div>';
  return html;
};

/* ============================================================
   WEBSITE ARTICLE — Add/Edit Form
   ============================================================ */
GN.openWebsiteArticleForm = function(idx){
  if (!GN.session.isOwner || !GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  if (!Array.isArray(GN.dash.data.news)) GN.dash.data.news = [];
  var list = GN.dash.data.news;

  var isEdit = idx >= 0;
  var item = isEdit ? list[idx] : { title:'', text:'', image:'', date: GN.today() };

  var body = document.getElementById('formModalBody');
  var titleEl = document.getElementById('formModalTitle');
  if (!body || !titleEl) return;
  titleEl.textContent = isEdit ? GN.t('newsEdit') : GN.t('newsAddNew');

  body.innerHTML = '<div class="form-grid">' +
    '<div class="field full"><label>' + GN.esc(GN.t('newsTitleLabel')) + ' <span class="req">*</span></label>' +
      '<div class="input-wrap"><input type="text" id="wn_title" maxlength="140" value="' + GN.escAttr(item.title || '') + '"></div></div>' +
    '<div class="field full"><label>' + GN.esc(GN.t('newsImageUrl')) + '</label>' +
      '<div class="input-wrap"><input type="url" id="wn_image" dir="ltr" placeholder="https://..." value="' + GN.escAttr(item.image || '') + '"></div></div>' +
    '<div class="field full"><label>' + GN.esc(GN.t('newsContentLabel')) + ' <span class="req">*</span></label>' +
      '<div class="input-wrap"><textarea id="wn_text" rows="8" maxlength="5000">' + GN.esc(item.text || '') + '</textarea></div></div>' +
    '<div class="field"><label>' + GN.esc(GN.t('newsDateLabel')) + '</label>' +
      '<div class="input-wrap"><input type="date" id="wn_date" value="' + GN.escAttr(item.date || GN.today()) + '"></div></div>' +
  '</div>';

  GN.openModal('formModal');

  var submitBtn = document.getElementById('formModalSubmit');
  submitBtn.onclick = function(){
    var title = document.getElementById('wn_title').value.trim();
    var text = document.getElementById('wn_text').value.trim();
    if (!title || !text){ GN.toast(GN.t('fieldRequired'), 'bad'); return; }

    var obj = {
      title: title,
      text: text,
      image: document.getElementById('wn_image').value.trim(),
      date: document.getElementById('wn_date').value || GN.today()
    };

    if (isEdit) list[idx] = obj;
    else list.unshift(obj);

    submitBtn.disabled = true;
    GN.savePublicData(GN.dash.data).then(function(ok){
      submitBtn.disabled = false;
      if (ok){
        GN.toast(isEdit ? GN.t('savedSuccess') : GN.t('addedSuccess'), 'ok');
        GN.closeModal('formModal');
        GN.renderSection('website');
      } else {
        GN.toast(GN.t('saveFailed'), 'bad');
      }
    });
  };
};

/* ============================================================
   WEBSITE — Social Media
   ============================================================ */
GN.renderWebsiteSocial = function(){
  if (!GN.dash.data.settings) GN.dash.data.settings = {};
  if (!GN.dash.data.settings.social) GN.dash.data.settings.social = {};
  var social = GN.dash.data.settings.social;

  var platforms = (window.GN_CONST && window.GN_CONST.SOCIALS) || [
    { key:'linkedin',  name:'LinkedIn' },
    { key:'twitter',   name:'Twitter / X' },
    { key:'tiktok',    name:'TikTok' },
    { key:'youtube',   name:'YouTube' },
    { key:'instagram', name:'Instagram' },
    { key:'facebook',  name:'Facebook' }
  ];

  var html = '';
  html += '<div class="fin-head"><div>' +
    '<h2>' + GN.navIcon('cog') + ' ' + GN.esc(GN.t('socialManage')) + '</h2>' +
    '<span class="sub">' + GN.esc(GN.t('socialManageSub')) + '</span></div></div>';

  html += '<div class="social-admin-grid-v2">' +
    platforms.map(function(p){
      var url = social[p.key] || '';
      var hasUrl = !!url;
      return '<div class="social-row ' + GN.esc(p.key) + (hasUrl ? ' has-url' : '') + '" data-social-row="' + GN.escAttr(p.key) + '">' +
        '<div class="brand-ic">' + (GN.socialSvg ? GN.socialSvg(p.key) : GN.navIcon('cog')) + '</div>' +
        '<div class="info">' +
          '<div class="name">' +
            '<span class="status"></span>' +
            GN.esc(p.name) +
          '</div>' +
          '<input type="url" data-social-input="' + GN.escAttr(p.key) + '" dir="ltr" placeholder="' + GN.escAttr(GN.t('socialUrlPh')) + '" value="' + GN.escAttr(url) + '">' +
        '</div>' +
        '<div class="actions">' +
          '<a href="' + (hasUrl ? GN.escAttr(url) : '#') + '" target="_blank" rel="noopener" data-social-open="' + GN.escAttr(p.key) + '" title="' + GN.escAttr(GN.t('socialOpenLink')) + '">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14 21 3"/></svg>' +
          '</a>' +
          '<button type="button" data-social-clear="' + GN.escAttr(p.key) + '" title="' + GN.escAttr(GN.t('socialClear')) + '">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
          '</button>' +
        '</div>' +
      '</div>';
    }).join('') +
  '</div>';

  return html;
};
console.log('[Gold Nile] dashboard.js part 1 loaded');

/* ===== FINANCE / BANKING / GOLD ===== */

GN.txFilters = { search:'', date_from:'', date_to:'', type:'', currency:'', source:'', service_type:'', department:'', amount_min:'', amount_max:'' };
GN._txChartRefs = { monthly:null, service:null, dept:null, source:null };

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
    /* Gold summary KPIs */
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
  if (!payments.length){ html += '<div class="empty" style="padding:20px"><h4>' + GN.esc(GN.t('noData')) + '</h4></div>'; }
  else {
    html += '<div class="tx-table-wrap"><table class="tx-table"><thead><tr>' +
      '<th>' + GN.esc(GN.t('date')) + '</th><th>' + GN.esc(GN.t('amount')) + '</th>' +
      '<th>' + GN.esc(GN.t('bank')) + '</th><th>' + GN.esc(GN.t('notes')) + '</th></tr></thead><tbody>';
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
    { key:'daily', label:'dailyFixed', mult:30 },
    { key:'monthly', label:'monthlyFixed', mult:1 },
    { key:'yearly', label:'yearlyFixed', mult:null }
  ];
  html += '<div class="kpi-grid" style="grid-template-columns:repeat(3,1fr)">';
  groups.forEach(function(g){
    var arr = fixed[g.key] || [];
    var total = arr.reduce(function(s, x){ return s + (Number(x.amount) || 0); }, 0);
    var sub = '';
    if (g.key === 'daily') sub = GN.t('monthlyFixed') + ': ' + GN.formatNum(total * 30);
    else if (g.key === 'monthly') sub = GN.t('thisYear') + ': ' + GN.formatNum(total * 12);
    else sub = GN.t('thisYear');
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
        '<td class="actions" style="width:80px">' + sectionActions([
          { act:'edit-fixed', key:g.key, idx:i, icon:ICO_EDIT, title:GN.t('edit') },
          { act:'del-fixed', key:g.key, idx:i, icon:ICO_DEL, title:GN.t('delete'), danger:true }
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
      '<option value="in"' + (f.type === 'in' ? ' selected' : '') + '>' + GN.esc(GN.t('txIn')) + '</option>' +
      '<option value="out"' + (f.type === 'out' ? ' selected' : '') + '>' + GN.esc(GN.t('txOut')) + '</option></select></div>' +
    '<div class="ff-field"><label>' + GN.esc(GN.t('txFilterCurrency')) + '</label>' +
      '<select id="ff_currency"><option value="">' + GN.esc(GN.t('txFilterAll')) + '</option>' +
      '<option value="SDG"' + (f.currency === 'SDG' ? ' selected' : '') + '>SDG</option>' +
      '<option value="USD"' + (f.currency === 'USD' ? ' selected' : '') + '>USD</option></select></div>' +
    '<div class="ff-field"><label>' + GN.esc(GN.t('txFilterSource')) + '</label>' +
      '<select id="ff_source"><option value="">' + GN.esc(GN.t('txFilterAll')) + '</option>' +
      '<option value="general"' + (f.source === 'general' ? ' selected' : '') + '>' + GN.esc(GN.t('txSourceGeneral')) + '</option>' +
      '<option value="equipment"' + (f.source === 'equipment' ? ' selected' : '') + '>' + GN.esc(GN.t('txSourceEquipment')) + '</option>' +
      '<option value="maintenance"' + (f.source === 'maintenance' ? ' selected' : '') + '>' + GN.esc(GN.t('txSourceMaintenance')) + '</option>' +
      '<option value="operations"' + (f.source === 'operations' ? ' selected' : '') + '>' + GN.esc(GN.t('txSourceOperations')) + '</option>' +
      '<option value="gold"' + (f.source === 'gold' ? ' selected' : '') + '>' + GN.esc(GN.t('txSourceGold')) + '</option></select></div>' +
    '<div class="ff-field"><label>' + GN.esc(GN.t('txFilterService')) + '</label>' +
      '<select id="ff_svc"><option value="">' + GN.esc(GN.t('txFilterAll')) + '</option>' +
      '<option value="gold"' + (f.service_type === 'gold' ? ' selected' : '') + '>' + GN.esc(GN.t('txGold')) + '</option>' +
      '<option value="lab"' + (f.service_type === 'lab' ? ' selected' : '') + '>' + GN.esc(GN.t('txLab')) + '</option>' +
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
    search: g('ff_search'), date_from: g('ff_date_from'), date_to: g('ff_date_to'),
    type: g('ff_type'), currency: g('ff_currency'), source: g('ff_source'),
    service_type: g('ff_svc'), department: GN.txFilters.department || '',
    amount_min: g('ff_amt_min'), amount_max: g('ff_amt_max')
  };
};

GN.clearTxFilters = function(){
  GN.txFilters = { search:'', date_from:'', date_to:'', type:'', currency:'', source:'', service_type:'', department:'', amount_min:'', amount_max:'' };
  ['ff_search','ff_date_from','ff_date_to','ff_amt_min','ff_amt_max'].forEach(function(id){ var el = document.getElementById(id); if (el) el.value = ''; });
  ['ff_type','ff_currency','ff_source','ff_svc'].forEach(function(id){ var el = document.getElementById(id); if (el) el.value = ''; });
  GN.loadTransactions();
};

GN.loadTransactions = function(){
  if (!GN.supa) return;
  var wrap = document.getElementById('txTableWrap');
  if (wrap) wrap.innerHTML = '<div class="empty"><div class="ic">' + GN.navIcon('dollar') + '</div><h4>' + GN.esc(GN.t('loading')) + '</h4></div>';
  var q = GN.supa.from('transactions').select('*');
  var f = GN.txFilters;
  if (f.date_from) q = q.gte('transaction_date', f.date_from);
  if (f.date_to) q = q.lte('transaction_date', f.date_to);
  if (f.type) q = q.eq('type', f.type);
  if (f.currency) q = q.eq('currency', f.currency);
  if (f.source) q = q.eq('source', f.source);
  if (f.service_type) q = q.eq('service_type', f.service_type);
  if (f.department) q = q.eq('department', f.department);
  if (f.search) q = q.ilike('description', '%' + f.search + '%');
  if (f.amount_min) q = q.gte('amount', Number(f.amount_min));
  if (f.amount_max) q = q.lte('amount', Number(f.amount_max));
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
  var box = document.getElementById('finOpKpis'); if (!box) return;
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
  function destroy(k){ if (GN._txChartRefs[k]){ try{ GN._txChartRefs[k].destroy(); }catch(e){} GN._txChartRefs[k] = null; } }
  function wrapEmpty(canvas){
    var parent = canvas.parentElement; if (!parent) return;
    canvas.style.display = 'none';
    if (!parent.querySelector('.chart-empty')){
      var div = document.createElement('div');
      div.className = 'chart-empty';
      div.textContent = GN.t('chartNoData');
      parent.appendChild(div);
    }
  }
  var months = {};
  arr.forEach(function(t){
    var dt = (t.transaction_date || '').slice(0,7);
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
      data: { labels: monthKeys, datasets: [
        { label: GN.t('chartIn'), data: monthKeys.map(function(k){ return months[k].in; }), borderColor:'#2B7A55', backgroundColor:'rgba(43,122,85,.1)', tension:.35, fill:true, borderWidth:2, pointRadius:3 },
        { label: GN.t('chartOut'), data: monthKeys.map(function(k){ return months[k].out; }), borderColor:'#B33A2A', backgroundColor:'rgba(179,58,42,.1)', tension:.35, fill:true, borderWidth:2, pointRadius:3 }
      ]},
      options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'bottom', labels:{ boxWidth:12, padding:8 } } }, scales:{ y:{ beginAtZero:true, ticks:{ callback:function(v){ return Number(v).toLocaleString(); } } }, x:{ grid:{ display:false } } } }
    });
  } else if (elM) wrapEmpty(elM);
  var svc = { gold:0, lab:0, other:0 };
  arr.forEach(function(t){ var k = t.service_type || 'other'; svc[k] = (svc[k] || 0) + Number(t.amount_sdg || t.amount || 0); });
  var svcLabels = [], svcData = [];
  if (svc.gold) { svcLabels.push(GN.t('txGold')); svcData.push(svc.gold); }
  if (svc.lab) { svcLabels.push(GN.t('txLab')); svcData.push(svc.lab); }
  if (svc.other) { svcLabels.push(GN.t('txOther')); svcData.push(svc.other); }
  destroy('service');
  var elS = document.getElementById('chartService');
  if (elS && svcData.length){
    GN._txChartRefs.service = new Chart(elS, {
      type: 'doughnut',
      data: { labels: svcLabels, datasets:[{ data: svcData, backgroundColor:['#C79A3D','#1E6B67','#5FA19C','#B33A2A'], borderWidth:2, borderColor:'#fff' }] },
      options: { responsive:true, maintainAspectRatio:false, cutout:'62%', plugins:{ legend:{ position:'bottom', labels:{ boxWidth:12, padding:8 } } } }
    });
  } else if (elS) wrapEmpty(elS);
  var dept = {};
  arr.forEach(function(t){
    if (t.type !== 'out') return;
    var k = t.department || '—';
    dept[k] = (dept[k] || 0) + Number(t.amount_sdg || t.amount || 0);
  });
  var dKeys = Object.keys(dept).sort(function(a,b){ return dept[b]-dept[a]; }).slice(0,6);
  destroy('dept');
  var elD = document.getElementById('chartDept');
  if (elD && dKeys.length){
    GN._txChartRefs.dept = new Chart(elD, {
      type: 'bar',
      data: { labels: dKeys, datasets:[{ label: GN.t('chartOut'), data: dKeys.map(function(k){ return dept[k]; }), backgroundColor:'#1E6B67', borderRadius:6 }] },
      options: { responsive:true, maintainAspectRatio:false, indexAxis:'y', plugins:{ legend:{ display:false } }, scales:{ x:{ beginAtZero:true, ticks:{ callback:function(v){ return Number(v).toLocaleString(); } } } } }
    });
  } else if (elD) wrapEmpty(elD);
  var srcMap = {};
  arr.forEach(function(t){
    var k = t.source || 'general';
    srcMap[k] = (srcMap[k] || 0) + Number(t.amount_sdg || t.amount || 0);
  });
  var sKeys = Object.keys(srcMap).sort(function(a,b){ return srcMap[b]-srcMap[a]; }).slice(0,6);
  var srcLabelMap = { general: GN.t('txSourceGeneral'), equipment: GN.t('txSourceEquipment'), maintenance: GN.t('txSourceMaintenance'), operations: GN.t('txSourceOperations'), gold: GN.t('txSourceGold') };
  destroy('source');
  var elSrc = document.getElementById('chartSource');
  if (elSrc && sKeys.length){
    GN._txChartRefs.source = new Chart(elSrc, {
      type: 'bar',
      data: { labels: sKeys.map(function(k){ return srcLabelMap[k] || k; }), datasets:[{ label: GN.t('txList'), data: sKeys.map(function(k){ return srcMap[k]; }), backgroundColor:'#C79A3D', borderRadius:6 }] },
      options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false } }, scales:{ y:{ beginAtZero:true, ticks:{ callback:function(v){ return Number(v).toLocaleString(); } } } } }
    });
  } else if (elSrc) wrapEmpty(elSrc);
};

GN.renderTransactionsTable = function(arr){
  var wrap = document.getElementById('txTableWrap'); if (!wrap) return;
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
    var catLabel = t.transaction_category === 'buy_sell' ? GN.t('txCatBuySell') : (t.transaction_category === 'service' ? GN.t('txCatService') : GN.t('txCatOther'));
    var svcLabel = t.service_type === 'gold' ? GN.t('txGold') : (t.service_type === 'lab' ? GN.t('txLab') : GN.t('txOther'));
    return '<tr>' +
      '<td><span class="tx-type-chip ' + (isIn ? 'in' : 'out') + '">' + GN.esc(isIn ? GN.t('txIn') : GN.t('txOut')) + '</span></td>' +
      '<td><bdi>' + GN.esc(GN.formatDate(t.transaction_date)) + '</bdi></td>' +
      '<td><span class="tx-amount ' + (isIn ? 'in' : 'out') + '">' +
        (isIn ? '+' : '−') + ' ' + GN.formatNum(t.amount, 2) + ' <span class="cur">' + GN.esc(cur) + '</span>' +
        (cur === 'USD' && amountSdg ? '<span class="sdg">≈ ' + GN.formatNum(amountSdg) + ' SDG</span>' : '') +
      '</span></td>' +
      '<td>' + GN.esc(catLabel) + '<div style="font-size:10.5px;color:var(--ink-3);margin-top:2px">' + GN.esc(svcLabel) + '</div></td>' +
      '<td>' + GN.esc(t.department || '-') + '</td>' +
      '<td><div class="tx-desc-cell" title="' + GN.escAttr(t.description || '') + '">' + GN.esc(t.description || '-') + '</div></td>' +
      '<td>' + (t.attachment_url ? '<a class="tx-attach-link" href="' + GN.escAttr(t.attachment_url) + '" target="_blank" rel="noopener" title="فتح المرفق"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg></a>' : '—') + '</td>' +
      (isAdmin ? '<td><div class="tx-actions">' +
        '<button class="tx-act-btn" data-tx-act="edit" data-tx-id="' + GN.escAttr(t.id) + '" title="' + GN.escAttr(GN.t('txEdit')) + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg></button>' +
        '<button class="tx-act-btn del" data-tx-act="del" data-tx-id="' + GN.escAttr(t.id) + '" title="' + GN.escAttr(GN.t('delete')) + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M8 6V4h8v2M6 6v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6"/></svg></button>' +
      '</div></td>' : '') +
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

GN.openTransactionForm = function(item){
  if (!GN.session.isOwner || !GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  var isEdit = !!item;
  var t = item || {
    type: 'out', transaction_date: GN.today(), currency: 'SDG',
    transaction_category: 'other', service_type: 'other', source: 'general',
    payment_method: 'cash', bank_id: '', amount: 0
  };
  var banks = (GN.dash.data && GN.dash.data.dashboard && GN.dash.data.dashboard.banks) || [];
  var body = document.getElementById('formModalBody');
  var titleEl = document.getElementById('formModalTitle');
  if (!body || !titleEl) return;
  titleEl.textContent = isEdit ? GN.t('txEdit') : GN.t('txAdd');
  function opt(list, sel){
    return list.map(function(o){
      return '<option value="' + GN.escAttr(o.value) + '"' + (o.value === sel ? ' selected' : '') + '>' + GN.esc(o.label) + '</option>';
    }).join('');
  }
  var selType = t.type || 'out';
  var selCur = t.currency || 'SDG';
  var selCat = t.transaction_category || 'other';
  var selSvc = t.service_type || 'other';
  var selSrc = t.source || 'general';
  var selPay = t.payment_method || 'cash';
  var selBank = t.bank_id || '';
  var bankOptions = '';
  if (!banks.length){ bankOptions = '<option value="">' + GN.esc(GN.t('txNoBanks')) + '</option>'; }
  else {
    bankOptions = '<option value="">' + GN.esc(GN.t('txSelectBank')) + '</option>' +
      banks.map(function(b){
        var bal = Number(b.balance || 0);
        return '<option value="' + GN.escAttr(b.id) + '"' + (b.id === selBank ? ' selected' : '') + '>' +
          GN.esc(b.name) + ' — ' + GN.formatNum(bal) + ' ' + GN.esc(b.currency || 'SDG') + '</option>';
      }).join('');
  }
  body.innerHTML =
    '<div class="form-grid tx-form-wrap' + (selCur === 'USD' ? ' usd' : '') + '" id="txFormWrap">' +
      '<div class="field full"><label>' + GN.esc(GN.t('txCategoryLabel')) + ' <span class="req">*</span></label>' +
        '<div class="input-wrap"><select id="tf_cat">' +
          opt([{ value:'buy_sell', label: GN.t('txCatBuySell') }, { value:'service', label: GN.t('txCatService') }, { value:'other', label: GN.t('txCatOther') }], selCat) +
        '</select></div></div>' +
      '<div class="field"><label>' + GN.esc(GN.t('txPaymentSource')) + ' <span class="req">*</span></label>' +
        '<div class="input-wrap"><select id="tf_pay">' +
          opt([{ value:'cash', label: GN.t('txPayCash') }, { value:'bank', label: GN.t('txPayBank') }], selPay) +
        '</select></div></div>' +
      '<div class="field" id="tf_bank_wrap" style="display:' + (selPay === 'bank' ? 'block' : 'none') + '">' +
        '<label>' + GN.esc(GN.t('txSelectBank')) + ' <span class="req">*</span></label>' +
        '<div class="input-wrap"><select id="tf_bank">' + bankOptions + '</select></div></div>' +
      '<div class="field"><label>' + GN.esc(GN.t('txType')) + ' <span class="req">*</span></label>' +
        '<div class="input-wrap"><select id="tf_type">' +
          opt([{ value:'in', label: GN.t('txIn') }, { value:'out', label: GN.t('txOut') }], selType) +
        '</select></div></div>' +
      '<div class="field"><label>' + GN.esc(GN.t('txDate')) + ' <span class="req">*</span></label>' +
        '<div class="input-wrap"><input type="date" id="tf_date" value="' + GN.escAttr(t.transaction_date || GN.today()) + '"></div></div>' +
      '<div class="field"><label>' + GN.esc(GN.t('txAmount')) + ' <span class="req">*</span></label>' +
        '<div class="input-wrap"><input type="number" id="tf_amount" step="0.01" min="0" value="' + (t.amount || '') + '"></div></div>' +
      '<div class="field"><label>' + GN.esc(GN.t('txCurrency')) + ' <span class="req">*</span></label>' +
        '<div class="input-wrap"><select id="tf_currency">' +
          opt([{ value:'SDG', label:'SDG — جنيه سوداني' }, { value:'USD', label:'USD — دولار أمريكي' }], selCur) +
        '</select></div></div>' +
      '<div class="field tx-usd-only"><label>' + GN.esc(GN.t('txExchangeRate')) + ' <span class="req">*</span></label>' +
        '<div class="input-wrap"><input type="number" id="tf_rate" step="0.01" min="0" value="' + (t.exchange_rate || '') + '"></div></div>' +
      '<div class="field tx-usd-only"><label>' + GN.esc(GN.t('txAmountSdg')) + ' <span class="hint">' + GN.esc(GN.t('txAutoCalc')) + '</span></label>' +
        '<div class="input-wrap"><input type="number" id="tf_amount_sdg" readonly value="' + (t.amount_sdg || '') + '"></div></div>' +
      '<div class="field"><label>' + GN.esc(GN.t('txServiceType')) + '</label>' +
        '<div class="input-wrap"><select id="tf_svc">' +
          opt([{ value:'gold', label: GN.t('txGold') }, { value:'lab', label: GN.t('txLab') }, { value:'other', label: GN.t('txOther') }], selSvc) +
        '</select></div></div>' +
      '<div class="field"><label>' + GN.esc(GN.t('txSource')) + '</label>' +
        '<div class="input-wrap"><select id="tf_source">' +
          opt([{ value:'general', label: GN.t('txSourceGeneral') }, { value:'equipment', label: GN.t('txSourceEquipment') }, { value:'maintenance', label: GN.t('txSourceMaintenance') }, { value:'operations', label: GN.t('txSourceOperations') }, { value:'gold', label: GN.t('txSourceGold') }], selSrc) +
        '</select></div></div>' +
      '<div class="field"><label>' + GN.esc(GN.t('txDepartment')) + '</label>' +
        '<div class="input-wrap"><input type="text" id="tf_dept" value="' + GN.escAttr(t.department || '') + '"></div></div>' +
      '<div class="field"><label>' + GN.esc(GN.t('txAttachment')) + '</label>' +
        '<div class="input-wrap"><input type="url" id="tf_attach" dir="ltr" value="' + GN.escAttr(t.attachment_url || '') + '" placeholder="https://..."></div></div>' +
      '<div class="field full"><label>' + GN.esc(GN.t('txDescription')) + ' <span class="req">*</span></label>' +
        '<div class="input-wrap"><textarea id="tf_desc" rows="3">' + GN.esc(t.description || '') + '</textarea></div></div>' +
      '<div class="field"><label>' + GN.esc(GN.t('txTaxGeneral')) + '</label>' +
        '<div class="input-wrap"><input type="number" id="tf_tax_general" step="0.01" min="0" value="' + (t.tax_general || 0) + '"></div></div>' +
      '<div class="field"><label>' + GN.esc(GN.t('txTaxVat')) + '</label>' +
        '<div class="input-wrap"><input type="number" id="tf_tax_vat" step="0.01" min="0" value="' + (t.tax_vat || 0) + '"></div></div>' +
      '<div class="field"><label>' + GN.esc(GN.t('txTaxGoldSpecial')) + '</label>' +
        '<div class="input-wrap"><input type="number" id="tf_tax_gs" step="0.01" min="0" value="' + (t.tax_gold_special || 0) + '"></div></div>' +
      '<div class="field"><label>' + GN.esc(GN.t('txTaxGoldVat')) + '</label>' +
        '<div class="input-wrap"><input type="number" id="tf_tax_gv" step="0.01" min="0" value="' + (t.tax_gold_vat || 0) + '"></div></div>' +
    '</div>';
  GN.openModal('formModal');
  var wrap = document.getElementById('txFormWrap');
  var curSel = document.getElementById('tf_currency');
  var amtEl = document.getElementById('tf_amount');
  var rateEl = document.getElementById('tf_rate');
  var sdgEl = document.getElementById('tf_amount_sdg');
  var paySel = document.getElementById('tf_pay');
  var bankWrap = document.getElementById('tf_bank_wrap');
  var bankSel = document.getElementById('tf_bank');
  function recalc(){
    if (curSel.value === 'USD'){
      wrap.classList.add('usd');
      var amt = Number(amtEl.value) || 0;
      var rate = Number(rateEl.value) || 0;
      sdgEl.value = rate > 0 ? (amt * rate).toFixed(2) : '';
    } else { wrap.classList.remove('usd'); sdgEl.value = ''; }
  }
  curSel.addEventListener('change', recalc);
  amtEl.addEventListener('input', recalc);
  rateEl.addEventListener('input', recalc);
  recalc();
  paySel.addEventListener('change', function(){ bankWrap.style.display = paySel.value === 'bank' ? 'block' : 'none'; });
  var submitBtn = document.getElementById('formModalSubmit');
  submitBtn.onclick = function(){
    var payload = {
      type: document.getElementById('tf_type').value,
      transaction_date: document.getElementById('tf_date').value,
      amount: Number(document.getElementById('tf_amount').value) || 0,
      currency: document.getElementById('tf_currency').value,
      exchange_rate: Number(document.getElementById('tf_rate').value) || null,
      amount_sdg: Number(document.getElementById('tf_amount_sdg').value) || null,
      transaction_category: document.getElementById('tf_cat').value,
      service_type: document.getElementById('tf_svc').value,
      source: document.getElementById('tf_source').value,
      department: document.getElementById('tf_dept').value.trim(),
      description: document.getElementById('tf_desc').value.trim(),
      attachment_url: document.getElementById('tf_attach').value.trim(),
      tax_general: Number(document.getElementById('tf_tax_general').value) || 0,
      tax_vat: Number(document.getElementById('tf_tax_vat').value) || 0,
      tax_gold_special: Number(document.getElementById('tf_tax_gs').value) || 0,
      tax_gold_vat: Number(document.getElementById('tf_tax_gv').value) || 0,
      payment_method: paySel.value,
      bank_id: paySel.value === 'bank' ? (bankSel.value || '') : '',
      bank_name: ''
    };
    if (payload.payment_method === 'bank' && !payload.bank_id){ GN.toast(GN.t('fieldRequired'), 'bad'); return; }
    if (payload.bank_id){
      var bk = banks.filter(function(x){ return x.id === payload.bank_id; })[0];
      if (bk) payload.bank_name = bk.name;
    }
    if (!payload.amount || payload.amount <= 0){ GN.toast(GN.t('fieldRequired'), 'bad'); return; }
    if (!payload.description){ GN.toast(GN.t('fieldRequired'), 'bad'); return; }
    if (payload.currency === 'USD' && (!payload.exchange_rate || payload.exchange_rate <= 0)){ GN.toast(GN.t('fieldRequired'), 'bad'); return; }
    submitBtn.disabled = true;
    function reverseTx(tx){
      if (tx.payment_method !== 'bank' || !tx.bank_id) return Promise.resolve();
      var dlt = tx.type === 'in' ? -Number(tx.amount) : Number(tx.amount);
      return new Promise(function(resolve){ GN.applyBankChange(tx.bank_id, dlt, resolve); });
    }
    function applyTx(tx){
      if (tx.payment_method !== 'bank' || !tx.bank_id) return Promise.resolve();
      var dlt = tx.type === 'in' ? Number(tx.amount) : -Number(tx.amount);
      return new Promise(function(resolve){ GN.applyBankChange(tx.bank_id, dlt, resolve); });
    }
    var dbPromise;
    if (isEdit){
      payload.updated_at = new Date().toISOString();
      dbPromise = GN.supa.from('transactions').update(payload).eq('id', t.id);
    } else {
      payload.created_by = GN.session.user.id;
      payload.created_by_name = (GN.session.profile && (GN.session.profile.full_name || GN.session.profile.email)) || '';
      dbPromise = GN.supa.from('transactions').insert(payload);
    }
    dbPromise.then(function(res){
      if (res.error){
        submitBtn.disabled = false;
        console.error('[tx save]', res.error);
        GN.toast(res.error.message, 'bad');
        return;
      }
      var chain = Promise.resolve();
      if (isEdit) chain = chain.then(function(){ return reverseTx(t); });
      chain = chain.then(function(){ return applyTx(payload); });
      chain.then(function(){
        submitBtn.disabled = false;
        GN.toast(isEdit ? GN.t('savedSuccess') : GN.t('txSaved'), 'ok');
        GN.closeModal('formModal');
        GN.loadTransactions();
      });
    });
  };
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
  GN.confirm({ title: GN.t('delete'), text: GN.t('txDeleteConfirm'), okText: GN.t('delete'), cancelText: GN.t('cancel'), danger: true }).then(function(ok){
    if (!ok) return;
    GN.supa.from('transactions').select('*').eq('id', id).single().then(function(fRes){
      if (fRes.error){ GN.toast(fRes.error.message, 'bad'); return; }
      var tx = fRes.data;
      GN.supa.from('transactions').delete().eq('id', id).then(function(res){
        if (res.error){ GN.toast(res.error.message, 'bad'); return; }
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
  GN.bindAction('add-payment', function(){ GN.openPaymentForm(-1); });
  GN.bindAction('edit-payment', function(btn){ GN.openPaymentForm(+btn.getAttribute('data-idx')); });
  GN.bindAction('del-payment', function(btn){ GN.delPayment(+btn.getAttribute('data-idx')); });
  GN.bindAction('add-fixed', function(btn){ GN.openFixedForm(btn.getAttribute('data-key'), -1); });
  GN.bindAction('edit-fixed', function(btn){ GN.openFixedForm(btn.getAttribute('data-key'), +btn.getAttribute('data-idx')); });
  GN.bindAction('del-fixed', function(btn){ GN.delFixed(btn.getAttribute('data-key'), +btn.getAttribute('data-idx')); });
  GN.bindAction('tx-apply', function(){ GN.readTxFilters(); GN.loadTransactions(); });
  GN.bindAction('tx-clear', function(){ GN.clearTxFilters(); });
  var s = document.getElementById('ff_search');
  if (s) s.addEventListener('keydown', function(e){ if (e.key === 'Enter'){ GN.readTxFilters(); GN.loadTransactions(); } });
  GN.$$('[data-collapse]').forEach(function(head){
    head.addEventListener('click', function(){
      var id = head.getAttribute('data-collapse');
      var el = document.getElementById(id);
      if (el) el.classList.toggle('open');
    });
  });
};

GN.sections.banking = function(){
  var d = GN.dash.data || {};
  var banks = (d.dashboard && d.dashboard.banks) || [];
  var transfers = (d.dashboard && d.dashboard.transfers) || [];
  var totalBalance = 0, totalIn = 0, totalOut = 0, globalCurrency = 'USD';
  banks.forEach(function(b){ totalBalance += Number(b.balance || 0); if (b.currency) globalCurrency = b.currency; });
  transfers.forEach(function(t){ var amt = Number(t.amount || 0); if (t.type === 'in') totalIn += amt; else totalOut += amt; });
  var html = '<div class="kpi-grid">' +
    '<div class="kpi hl"><div class="top"><span class="ic">' + GN.navIcon('bank') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('consolidatedBalance')) + '</div>' +
      '<div class="val"><bdi>' + GN.formatNum(totalBalance) + '</bdi><span class="cur">' + GN.esc(globalCurrency) + '</span></div></div>' +
    '<div class="kpi"><div class="top"><span class="ic ok">' + GN.navIcon('check') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('incomingTotal')) + '</div>' +
      '<div class="val"><bdi>' + GN.formatNum(totalIn) + '</bdi><span class="cur">' + GN.esc(globalCurrency) + '</span></div></div>' +
    '<div class="kpi"><div class="top"><span class="ic b">' + GN.navIcon('dollar') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('outgoingTotal')) + '</div>' +
      '<div class="val"><bdi>' + GN.formatNum(totalOut) + '</bdi><span class="cur">' + GN.esc(globalCurrency) + '</span></div></div>' +
    '<div class="kpi"><div class="top"><span class="ic y">' + GN.navIcon('bank') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('banksList')) + '</div>' +
      '<div class="val"><bdi>' + GN.formatNum(banks.length) + '</bdi></div></div>' +
  '</div>';
  html += '<div style="text-align:end;margin-bottom:14px">' +
    '<button class="btn btn-pri btn-sm" data-act="add-bank">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg> ' +
      GN.esc(GN.t('addBank')) + '</button></div>';
  if (!banks.length){
    html += '<div class="card"><div class="empty"><div class="ic">' + GN.navIcon('bank') + '</div><h4>' + GN.esc(GN.t('noData')) + '</h4><p>' + GN.esc(GN.t('addBank')) + '</p></div></div>';
  } else {
    html += '<div class="kpi-grid" style="grid-template-columns:repeat(auto-fit,minmax(320px,1fr))">';
    banks.forEach(function(b, i){
      var bankIn = 0, bankOut = 0;
      transfers.forEach(function(t){
        if (t.bank_id === b.id || t.bank === b.name){
          if (t.type === 'in') bankIn += Number(t.amount || 0); else bankOut += Number(t.amount || 0);
        }
      });
      html += '<div class="card" style="margin:0"><div class="card-head">' +
        '<h3 class="bank-name-link" data-bank-detail="' + i + '" style="font-size:15px">' + GN.esc(b.name || '-') + '</h3>' +
        '<div class="row-actions">' +
          '<button class="icon-act" data-act="edit-bank" data-idx="' + i + '" title="' + GN.escAttr(GN.t('edit')) + '">' + ICO_EDIT + '</button>' +
          '<button class="icon-act del" data-act="del-bank" data-idx="' + i + '" title="' + GN.escAttr(GN.t('delete')) + '">' + ICO_DEL + '</button>' +
        '</div></div>' +
        '<div style="font-size:12px;color:var(--ink-2);line-height:1.9">' +
          (b.branch ? '<div><b>' + GN.esc(GN.t('bankBranch')) + ':</b> ' + GN.esc(b.branch) + '</div>' : '') +
          (b.account_name ? '<div><b>' + GN.esc(GN.t('accountName')) + ':</b> ' + GN.esc(b.account_name) + '</div>' : '') +
          (b.account_number ? '<div><b>' + GN.esc(GN.t('accountNumber')) + ':</b> <bdi dir="ltr">' + GN.esc(b.account_number) + '</bdi></div>' : '') +
          (b.iban ? '<div><b>' + GN.esc(GN.t('iban')) + ':</b> <bdi dir="ltr">' + GN.esc(b.iban) + '</bdi></div>' : '') +
          (b.swift ? '<div><b>' + GN.esc(GN.t('swift')) + ':</b> <bdi dir="ltr">' + GN.esc(b.swift) + '</bdi></div>' : '') +
        '</div>' +
        '<div style="margin-top:14px;padding-top:14px;border-top:1px dashed var(--line);text-align:center">' +
          '<div class="lbl" style="font-size:11.5px;color:var(--ink-2)">' + GN.esc(GN.t('currentBalance')) + '</div>' +
          '<div style="font-family:Reem Kufi,sans-serif;font-size:26px;font-weight:700;color:var(--ink);margin-top:4px">' +
            '<bdi>' + GN.formatNum(b.balance || 0) + '</bdi> <span style="font-size:13px;color:var(--ink-2)">' + GN.esc(b.currency || globalCurrency) + '</span></div></div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px">' +
          '<div style="text-align:center;padding:8px;background:var(--ok-l);border-radius:10px">' +
            '<div style="font-size:10.5px;color:var(--ok);font-weight:700">' + GN.esc(GN.t('incomingTotal')) + '</div>' +
            '<div style="font-weight:700;color:var(--ok)">' + GN.formatNum(bankIn) + '</div></div>' +
          '<div style="text-align:center;padding:8px;background:var(--bad-l);border-radius:10px">' +
            '<div style="font-size:10.5px;color:var(--bad);font-weight:700">' + GN.esc(GN.t('outgoingTotal')) + '</div>' +
            '<div style="font-weight:700;color:var(--bad)">' + GN.formatNum(bankOut) + '</div></div>' +
        '</div>' +
        '<div style="display:flex;gap:8px;margin-top:12px">' +
          '<button class="btn btn-pri btn-sm" style="flex:1" data-act="add-in" data-bank-idx="' + i + '">' + GN.esc(GN.t('addIncoming')) + '</button>' +
          '<button class="btn btn-danger btn-sm" style="flex:1" data-act="add-out" data-bank-idx="' + i + '">' + GN.esc(GN.t('addOutgoing')) + '</button>' +
        '</div></div>';
    });
    html += '</div>';
  }
  html += '<div class="card" style="margin-top:18px"><div class="card-head">' +
    '<h3>' + GN.navIcon('bank') + ' ' + GN.esc(GN.t('transfersLog')) + '</h3>' +
    '<button class="btn btn-sec btn-sm" data-act="export-transfers">' + GN.esc(GN.t('exportExcel')) + '</button></div>';
  if (!transfers.length){
    html += '<div class="empty"><div class="ic">' + GN.navIcon('bank') + '</div><h4>' + GN.esc(GN.t('noData')) + '</h4></div>';
  } else {
    var sortedTr = transfers.slice().sort(function(a, b){ return (b.date || '').localeCompare(a.date || ''); });
    html += '<div class="table-wrap"><table><thead><tr>' +
      '<th>' + GN.esc(GN.t('date')) + '</th><th>' + GN.esc(GN.t('transferType')) + '</th>' +
      '<th>' + GN.esc(GN.t('party')) + '</th><th>' + GN.esc(GN.t('amount')) + '</th>' +
      '<th>' + GN.esc(GN.t('invoiceNumber')) + '</th><th>' + GN.esc(GN.t('attachment')) + '</th><th></th></tr></thead><tbody>';
    sortedTr.forEach(function(t){
      var origIdx = transfers.indexOf(t);
      var typeChip = t.type === 'in'
        ? '<span class="chip ok"><span class="dot"></span>' + GN.esc(GN.t('incoming')) + '</span>'
        : '<span class="chip b"><span class="dot"></span>' + GN.esc(GN.t('outgoing')) + '</span>';
      html += '<tr><td>' + GN.esc(GN.formatDate(t.date)) + '</td>' +
        '<td>' + typeChip + '</td>' +
        '<td>' + GN.esc(t.party || '-') + '</td>' +
        '<td class="num" style="color:' + (t.type === 'in' ? 'var(--ok)' : 'var(--bad)') + '">' +
          (t.type === 'in' ? '+' : '-') + ' ' + GN.formatMoneyPlain(t.amount, t.currency || globalCurrency) + '</td>' +
        '<td><bdi dir="ltr">' + GN.esc(t.invoice || '-') + '</bdi></td>' +
        '<td>' + (t.attachment ? '<a href="' + GN.escAttr(t.attachment) + '" target="_blank" rel="noopener" class="chip n">' + GN.esc(GN.t('view')) + '</a>' : '-') + '</td>' +
        '<td class="actions">' + sectionActions([
          { act:'edit-transfer', idx:origIdx, icon:ICO_EDIT, title:GN.t('edit') },
          { act:'del-transfer', idx:origIdx, icon:ICO_DEL, title:GN.t('delete'), danger:true }
        ]) + '</td></tr>';
    });
    html += '</tbody></table></div>';
  }
  html += '</div>';
  return html;
};

GN.bindSection.banking = function(){
  GN.bindAction('add-bank', function(){ GN.openBankForm(-1); });
  GN.bindAction('edit-bank', function(btn){ GN.openBankForm(+btn.getAttribute('data-idx')); });
  GN.bindAction('del-bank', function(btn){ GN.delBank(+btn.getAttribute('data-idx')); });
  GN.bindAction('add-in', function(btn){ GN.openTransferForm(-1, 'in', +btn.getAttribute('data-bank-idx')); });
  GN.bindAction('add-out', function(btn){ GN.openTransferForm(-1, 'out', +btn.getAttribute('data-bank-idx')); });
  GN.bindAction('edit-transfer', function(btn){ GN.openTransferForm(+btn.getAttribute('data-idx')); });
  GN.bindAction('del-transfer', function(btn){ GN.delTransfer(+btn.getAttribute('data-idx')); });
  GN.bindAction('export-transfers', function(){ GN.exportTransfersExcel(); });
  GN.$$('[data-bank-detail]').forEach(function(el){
    el.addEventListener('click', function(e){
      e.stopPropagation();
      GN.openBankDetails(+el.getAttribute('data-bank-detail'));
    });
  });
};

GN.openBankDetails = function(idx){
  var banks = (GN.dash.data && GN.dash.data.dashboard && GN.dash.data.dashboard.banks) || [];
  var b = banks[idx]; if (!b) return;
  var body = document.getElementById('bankDetailsBody');
  var titleEl = document.getElementById('bankDetailsTitle');
  if (!body) return;
  var isAdmin = GN.session.isAdmin && GN.session.isOwner;
  var empty = '—';
  function row(label, key, ltr){
    var val = (b[key] != null ? String(b[key]) : '').trim() || empty;
    var editable = isAdmin ? ' contenteditable="true"' : '';
    var dirAttr = ltr ? ' dir="ltr"' : '';
    var fieldAttr = isAdmin ? ' data-bank-field="' + key + '"' : '';
    return '<tr><th>' + GN.esc(label) + '</th><td' + dirAttr + editable + fieldAttr + '>' + GN.esc(val) + '</td></tr>';
  }
  var html = '<div class="bank-details-head">' + GN.esc(b.name || 'بيانات الحساب البنكي') + '</div>';
  html += '<table class="bank-details-table"><tbody>';
  html += row('اسم الحساب', 'account_name', false);
  html += row('البنك', 'name', false);
  html += row('الفرع', 'branch', false);
  html += row('رقم الحساب', 'account_number', true);
  html += row('رقم حساب العميل الأساسي', 'customer_number', true);
  html += row('رقم حساب العميل العالمي', 'iban', true);
  html += row('رمز SWIFT', 'swift', true);
  html += '</tbody></table>';
  if (isAdmin) html += '<div class="bank-details-note">اضغط على أي خلية لتعديلها — يُحفظ التعديل تلقائيًا</div>';
  body.innerHTML = html;
  if (titleEl) titleEl.textContent = 'بيانات الحساب البنكي';
  GN.openModal('bankDetailsModal');
  if (isAdmin){
    GN.$$('[data-bank-field]').forEach(function(cell){
      cell.addEventListener('blur', function(){
        var key = cell.getAttribute('data-bank-field');
        var newVal = cell.textContent.trim();
        if (newVal === empty) newVal = '';
        if ((b[key] || '') === newVal) return;
        b[key] = newVal;
        GN.savePublicData(GN.dash.data).then(function(ok){
          if (ok) GN.toast('تم الحفظ', 'ok'); else GN.toast('تعذر الحفظ', 'bad');
        });
      });
      cell.addEventListener('keydown', function(e){
        if (e.key === 'Enter'){ e.preventDefault(); cell.blur(); }
        if (e.key === 'Escape'){ cell.blur(); }
      });
    });
  }
};

GN.sections.gold = function(){
  var d = GN.dash.data || {};
  var purchases = (d.dashboard && d.dashboard.gold_purchases) || [];
  var sales = (d.dashboard && d.dashboard.gold_sales) || [];
  var agents = (d.dashboard && d.dashboard.gold_agents) || [];
  var totalBought = 0, totalSold = 0, totalProfit = 0, totalCost = 0;
  purchases.forEach(function(p){ totalBought += Number(p.weight || 0); totalCost += Number(p.total || 0); });
  sales.forEach(function(s){ totalSold += Number(s.weight || 0); totalProfit += Number(s.net_profit || 0); });
  var remaining = totalBought - totalSold;
  var html = '<div class="kpi-grid">' +
    '<div class="kpi hl"><div class="top"><span class="ic">' + GN.navIcon('gold') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('inventory')) + '</div>' +
      '<div class="val"><bdi>' + GN.formatNum(remaining, 2) + '</bdi><span class="cur">g</span></div>' +
      '<div class="sub">' + GN.esc(GN.t('total')) + ': ' + GN.formatNum(totalBought, 2) + 'g</div></div>' +
    '<div class="kpi"><div class="top"><span class="ic g">' + GN.navIcon('gold') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('purchases')) + '</div>' +
      '<div class="val"><bdi>' + GN.formatNum(purchases.length) + '</bdi></div>' +
      '<div class="sub">' + GN.esc(GN.t('total')) + ': ' + GN.formatNum(totalCost) + '</div></div>' +
    '<div class="kpi"><div class="top"><span class="ic y">' + GN.navIcon('dollar') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('sales')) + '</div>' +
      '<div class="val"><bdi>' + GN.formatNum(sales.length) + '</bdi></div></div>' +
    '<div class="kpi"><div class="top"><span class="ic ok">' + GN.navIcon('dollar') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('netProfit')) + '</div>' +
      '<div class="val" style="color:' + (totalProfit >= 0 ? 'var(--ok)' : 'var(--bad)') + '">' +
        '<bdi>' + (totalProfit >= 0 ? '+' : '') + GN.formatNum(totalProfit) + '</bdi></div></div>' +
  '</div>';
  html += '<div style="text-align:end;margin-bottom:14px;display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap">' +
    '<button class="btn btn-sec btn-sm" data-act="export-gold">' + GN.esc(GN.t('exportExcel')) + '</button>' +
    '<button class="btn btn-gold btn-sm" data-act="add-purchase">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg> ' + GN.esc(GN.t('addPurchase')) + '</button>' +
    '<button class="btn btn-pri btn-sm" data-act="add-sale">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg> ' + GN.esc(GN.t('addSale')) + '</button>' +
  '</div>';
  html += '<div class="card"><div class="card-head"><h3>' + GN.navIcon('gold') + ' ' + GN.esc(GN.t('purchases')) + '</h3></div>';
  if (!purchases.length){
    html += '<div class="empty"><div class="ic">' + GN.navIcon('gold') + '</div><h4>' + GN.esc(GN.t('noData')) + '</h4></div>';
  } else {
    html += '<div class="table-wrap"><table><thead><tr>' +
      '<th>' + GN.esc(GN.t('purchaseCode')) + '</th><th>' + GN.esc(GN.t('date')) + '</th>' +
      '<th>' + GN.esc(GN.t('weight')) + '</th><th>' + GN.esc(GN.t('karat')) + '</th>' +
      '<th>' + GN.esc(GN.t('pricePerGram')) + '</th><th>' + GN.esc(GN.t('totalPrice')) + '</th>' +
      '<th>' + GN.esc(GN.t('agentId')) + '</th><th></th></tr></thead><tbody>';
    purchases.forEach(function(p, i){
      html += '<tr><td><bdi dir="ltr">' + GN.esc(p.code || '-') + '</bdi></td>' +
        '<td>' + GN.esc(GN.formatDate(p.date)) + '</td>' +
        '<td class="num">' + GN.formatNum(p.weight, 2) + 'g</td>' +
        '<td>' + GN.esc(p.karat || '-') + '</td>' +
        '<td class="num">' + GN.formatMoneyPlain(p.price_per_gram, p.currency || 'SDG') + '</td>' +
        '<td class="num">' + GN.formatMoneyPlain(p.total, p.currency || 'SDG') + '</td>' +
        '<td>' + GN.esc(p.agent_id || '-') + '</td>' +
        '<td class="actions">' + sectionActions([
          { act:'edit-purchase', idx:i, icon:ICO_EDIT, title:GN.t('edit') },
          { act:'del-purchase', idx:i, icon:ICO_DEL, title:GN.t('delete'), danger:true }
        ]) + '</td></tr>';
    });
    html += '</tbody></table></div>';
  }
  html += '</div>';
  html += '<div class="card"><div class="card-head"><h3>' + GN.navIcon('dollar') + ' ' + GN.esc(GN.t('sales')) + '</h3></div>';
  if (!sales.length){
    html += '<div class="empty"><div class="ic">' + GN.navIcon('dollar') + '</div><h4>' + GN.esc(GN.t('noData')) + '</h4></div>';
  } else {
    html += '<div class="table-wrap"><table><thead><tr>' +
      '<th>' + GN.esc(GN.t('saleCode')) + '</th><th>' + GN.esc(GN.t('date')) + '</th>' +
      '<th>' + GN.esc(GN.t('linkedPurchase')) + '</th><th>' + GN.esc(GN.t('weight')) + '</th>' +
      '<th>' + GN.esc(GN.t('pricePerGram')) + '</th><th>' + GN.esc(GN.t('totalPrice')) + '</th>' +
      '<th>' + GN.esc(GN.t('netProfit')) + '</th><th></th></tr></thead><tbody>';
    sales.forEach(function(s, i){
      var profit = Number(s.net_profit || 0);
      html += '<tr><td><bdi dir="ltr">' + GN.esc(s.code || '-') + '</bdi></td>' +
        '<td>' + GN.esc(GN.formatDate(s.date)) + '</td>' +
        '<td><bdi dir="ltr">' + GN.esc(s.purchase_code || '-') + '</bdi></td>' +
        '<td class="num">' + GN.formatNum(s.weight, 2) + 'g</td>' +
        '<td class="num">' + GN.formatMoneyPlain(s.price_per_gram, s.currency || 'USD') + '</td>' +
        '<td class="num">' + GN.formatMoneyPlain(s.total, s.currency || 'USD') + '</td>' +
        '<td class="num" style="color:' + (profit >= 0 ? 'var(--ok)' : 'var(--bad)') + ';font-weight:700">' +
          (profit >= 0 ? '+' : '') + GN.formatMoneyPlain(profit, s.currency || 'USD') + '</td>' +
        '<td class="actions">' + sectionActions([
          { act:'edit-sale', idx:i, icon:ICO_EDIT, title:GN.t('edit') },
          { act:'del-sale', idx:i, icon:ICO_DEL, title:GN.t('delete'), danger:true }
        ]) + '</td></tr>';
    });
    html += '</tbody></table></div>';
  }
  html += '</div>';
  html += '<div class="card"><div class="card-head">' +
    '<h3>' + GN.navIcon('team') + ' ' + GN.esc(GN.t('agentType')) + '</h3>' +
    '<button class="btn btn-pri btn-sm" data-act="add-agent">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg> ' + GN.esc(GN.t('add')) + '</button></div>';
  if (!agents.length){
    html += '<div class="empty"><div class="ic">' + GN.navIcon('team') + '</div><h4>' + GN.esc(GN.t('noData')) + '</h4></div>';
  } else {
    html += '<div class="table-wrap"><table><thead><tr>' +
      '<th>' + GN.esc(GN.t('agentId')) + '</th><th>' + GN.esc(GN.t('name')) + '</th>' +
      '<th>' + GN.esc(GN.t('agentType')) + '</th><th>' + GN.esc(GN.t('agentCommission')) + '</th><th></th></tr></thead><tbody>';
    agents.forEach(function(a, i){
      html += '<tr><td><bdi dir="ltr">' + GN.esc(a.code || '-') + '</bdi></td>' +
        '<td>' + GN.esc(a.name || '-') + '</td>' +
        '<td>' + (a.type === 'buy' ? GN.esc(GN.t('buyAgent')) : GN.esc(GN.t('sellAgent'))) + '</td>' +
        '<td class="num">' + GN.formatNum(a.commission, 2) + '%</td>' +
        '<td class="actions">' + sectionActions([
          { act:'edit-agent', idx:i, icon:ICO_EDIT, title:GN.t('edit') },
          { act:'del-agent', idx:i, icon:ICO_DEL, title:GN.t('delete'), danger:true }
        ]) + '</td></tr>';
    });
    html += '</tbody></table></div>';
  }
  html += '</div>';
  return html;
};

GN.bindSection.gold = function(){
  GN.bindAction('add-purchase', function(){ GN.openPurchaseForm(-1); });
  GN.bindAction('edit-purchase', function(btn){ GN.openPurchaseForm(+btn.getAttribute('data-idx')); });
  GN.bindAction('del-purchase', function(btn){ GN.delPurchase(+btn.getAttribute('data-idx')); });
  GN.bindAction('add-sale', function(){ GN.openSaleForm(-1); });
  GN.bindAction('edit-sale', function(btn){ GN.openSaleForm(+btn.getAttribute('data-idx')); });
  GN.bindAction('del-sale', function(btn){ GN.delSale(+btn.getAttribute('data-idx')); });
  GN.bindAction('add-agent', function(){ GN.openAgentForm(-1); });
  GN.bindAction('edit-agent', function(btn){ GN.openAgentForm(+btn.getAttribute('data-idx')); });
  GN.bindAction('del-agent', function(btn){ GN.delAgent(+btn.getAttribute('data-idx')); });
  GN.bindAction('export-gold', function(){ GN.exportGoldExcel(); });
};

console.log('[Gold Nile] dashboard.js part 1 of 2 loaded');
})();
/* Gold Nile - Dashboard (Part 2 of 2) */
(function(){
'use strict';
var GN = window.GN = window.GN || {};

var ICO_EDIT = GN.ICO_EDIT || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';
var ICO_DEL  = GN.ICO_DEL  || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M8 6V4h8v2M6 6v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6M10 11v6M14 11v6"/></svg>';
var ICO_VIEW = GN.ICO_VIEW || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>';

function d(){ return GN.dash.data || {}; }
function dash(){ return (d().dashboard = d().dashboard || {}); }
function list(name){ return dash()[name] || (dash()[name] = []); }
function settings(){ return (d().settings = d().settings || {}); }
function currency(){ return settings().currency || 'USD'; }

function save(){
  return GN.savePublicData(GN.dash.data).then(function(ok){
    if (ok){ GN.toast(GN.t('savedSuccess'), 'ok'); GN.renderSection(GN.dash.current); }
    else GN.toast(GN.t('saveFailed'), 'bad');
    return ok;
  });
}
function askDelete(){ return GN.confirm({ title: GN.t('confirmDelete'), text: GN.t('confirmDeleteNote'), okText: GN.t('delete'), cancelText: GN.t('cancel'), danger: true }); }
function actions(listName, arr){
  return '<div class="row-actions">' + arr.map(function(a){
    return '<button class="icon-act' + (a.danger ? ' del' : '') + '" data-act="' + a.act + '" data-idx="' + a.idx + '" title="' + GN.escAttr(a.title) + '">' + a.icon + '</button>';
  }).join('') + '</div>';
}

GN.sections.hr = function(){
  var employees = list('employees');
  var departments = list('departments');
  var activeCount = employees.filter(function(e){ return e.status === 'active'; }).length;
  var totalSalary = 0;
  employees.forEach(function(e){ if (e.status === 'active') totalSalary += Number(e.salary || 0) + Number(e.allowances || 0); });
  var html = '<div class="kpi-grid">' +
    '<div class="kpi hl"><div class="top"><span class="ic">' + GN.navIcon('team') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('employees')) + '</div>' +
      '<div class="val"><bdi>' + GN.formatNum(employees.length) + '</bdi></div>' +
      '<div class="sub">' + GN.esc(GN.t('present')) + ': ' + GN.formatNum(activeCount) + '</div></div>' +
    '<div class="kpi"><div class="top"><span class="ic g">' + GN.navIcon('team') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('departments')) + '</div>' +
      '<div class="val"><bdi>' + GN.formatNum(departments.length) + '</bdi></div></div>' +
    '<div class="kpi"><div class="top"><span class="ic y">' + GN.navIcon('dollar') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('totalSalary')) + '</div>' +
      '<div class="val"><bdi>' + GN.formatNum(totalSalary) + '</bdi><span class="cur">SDG</span></div></div>' +
    '<div class="kpi"><div class="top"><span class="ic w">' + GN.navIcon('check') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('tasksTitle')) + '</div>' +
      '<div class="val"><bdi>' + GN.formatNum(list('tasks').length) + '</bdi></div></div>' +
  '</div>';
  html += '<div class="card"><div class="card-head"><h3>' + GN.navIcon('team') + ' ' + GN.esc(GN.t('departments')) + '</h3>' +
    '<button class="btn btn-pri btn-sm" data-act="add-dept"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg> ' + GN.esc(GN.t('addDepartment')) + '</button></div>';
  if (!departments.length){
    html += '<div class="empty"><div class="ic">' + GN.navIcon('team') + '</div><h4>' + GN.esc(GN.t('noData')) + '</h4></div>';
  } else {
    html += '<div style="display:flex;flex-wrap:wrap;gap:8px">';
    departments.forEach(function(dep, i){
      var cnt = employees.filter(function(e){ return e.department === dep.name; }).length;
      html += '<div style="display:inline-flex;align-items:center;gap:8px;background:var(--nile-l);color:var(--nile);padding:8px 14px;border-radius:12px;font-size:13px;font-weight:600">' +
        GN.esc(dep.name) + '<span style="background:rgba(30,107,103,.15);padding:2px 8px;border-radius:8px;font-size:11px">' + cnt + '</span>' +
        '<button class="icon-act del" data-act="del-dept" data-idx="' + i + '" style="width:22px;height:22px;border-radius:6px">' + ICO_DEL + '</button></div>';
    });
    html += '</div>';
  }
  html += '</div>';
  html += '<div class="card"><div class="card-head"><h3>' + GN.navIcon('team') + ' ' + GN.esc(GN.t('employees')) + '</h3>' +
    '<button class="btn btn-pri btn-sm" data-act="add-emp"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg> ' + GN.esc(GN.t('addEmployee')) + '</button></div>';
  if (!employees.length){
    html += '<div class="empty"><div class="ic">' + GN.navIcon('team') + '</div><h4>' + GN.esc(GN.t('noData')) + '</h4><p>' + GN.esc(GN.t('addEmployee')) + '</p></div>';
  } else {
    html += '<div class="table-wrap"><table><thead><tr>' +
      '<th>' + GN.esc(GN.t('fullName')) + '</th><th>' + GN.esc(GN.t('department')) + '</th>' +
      '<th>' + GN.esc(GN.t('jobTitle')) + '</th><th>' + GN.esc(GN.t('baseSalary')) + '</th>' +
      '<th>' + GN.esc(GN.t('status')) + '</th><th></th></tr></thead><tbody>';
    employees.forEach(function(e, i){
      var stKey = e.status || 'active';
      var st = (window.GN_CONST && window.GN_CONST.EMP_STATUS[stKey]) || { ar: stKey, color: 'n' };
      html += '<tr><td><b>' + GN.esc(e.name || '-') + '</b></td>' +
        '<td>' + GN.esc(e.department || '-') + '</td>' +
        '<td>' + GN.esc(e.role || '-') + '</td>' +
        '<td class="num">' + GN.formatMoneyPlain(e.salary, e.currency || 'SDG') + '</td>' +
        '<td><span class="chip ' + st.color + '"><span class="dot"></span>' + GN.esc(st.ar) + '</span></td>' +
        '<td class="actions">' + actions('emp', [
          { act:'edit-emp', idx:i, icon:ICO_EDIT, title:GN.t('edit') },
          { act:'end-emp', idx:i, icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>', title:GN.t('endEmployee') },
          { act:'del-emp', idx:i, icon:ICO_DEL, title:GN.t('delete'), danger:true }
        ]) + '</td></tr>';
    });
    html += '</tbody></table></div>';
  }
  html += '</div>';
  return html;
};

GN.bindSection.hr = function(){
  GN.bindAction('add-dept', function(){ GN.openDeptForm(-1); });
  GN.bindAction('del-dept', function(btn){
    var idx = +btn.getAttribute('data-idx');
    askDelete().then(function(ok){ if (!ok) return; list('departments').splice(idx, 1); save(); });
  });
  GN.bindAction('add-emp', function(){ GN.openEmpForm(-1); });
  GN.bindAction('edit-emp', function(btn){ GN.openEmpForm(+btn.getAttribute('data-idx')); });
  GN.bindAction('end-emp', function(btn){ GN.openEndEmpForm(+btn.getAttribute('data-idx')); });
  GN.bindAction('del-emp', function(btn){
    var idx = +btn.getAttribute('data-idx');
    askDelete().then(function(ok){ if (!ok) return; list('employees').splice(idx, 1); save(); });
  });
};

GN.sections.tasks = function(){
  var tasks = list('tasks');
  var open = tasks.filter(function(t){ return ['new','inprogress','onhold'].indexOf(t.status) !== -1; });
  var done = tasks.filter(function(t){ return t.status === 'done'; });
  var canceled = tasks.filter(function(t){ return t.status === 'cancelled'; });
  var html = '<div class="kpi-grid">' +
    '<div class="kpi hl"><div class="top"><span class="ic">' + GN.navIcon('check') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('openTasks')) + '</div><div class="val"><bdi>' + GN.formatNum(open.length) + '</bdi></div></div>' +
    '<div class="kpi"><div class="top"><span class="ic ok">' + GN.navIcon('check') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('doneTasks')) + '</div><div class="val"><bdi>' + GN.formatNum(done.length) + '</bdi></div></div>' +
    '<div class="kpi"><div class="top"><span class="ic b">' + GN.navIcon('check') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('taskCancelled')) + '</div><div class="val"><bdi>' + GN.formatNum(canceled.length) + '</bdi></div></div>' +
  '</div>';
  function renderTasks(arr, title){
    if (!arr.length) return '';
    var h = '<div class="card"><div class="card-head"><h3>' + GN.navIcon('check') + ' ' + GN.esc(title) + '</h3></div>';
    h += '<div class="table-wrap"><table><thead><tr>' +
      '<th>' + GN.esc(GN.t('taskTitle')) + '</th><th>' + GN.esc(GN.t('assignee')) + '</th>' +
      '<th>' + GN.esc(GN.t('dueDate')) + '</th><th>' + GN.esc(GN.t('priority')) + '</th>' +
      '<th>' + GN.esc(GN.t('status')) + '</th><th></th></tr></thead><tbody>';
    arr.forEach(function(t){
      var idx = tasks.indexOf(t);
      var st = (window.GN_CONST && window.GN_CONST.TASK_STATUS[t.status]) || { ar: t.status, color: 'n' };
      var pr = (window.GN_CONST && window.GN_CONST.TASK_PRIORITY[t.priority]) || { ar: t.priority, color: 'n' };
      h += '<tr><td><b>' + GN.esc(t.title || '-') + '</b></td>' +
        '<td>' + GN.esc(t.assignee_name || '-') + '</td>' +
        '<td>' + GN.esc(GN.formatDate(t.due_date)) + '</td>' +
        '<td><span class="chip ' + pr.color + '">' + GN.esc(pr.ar) + '</span></td>' +
        '<td><span class="chip ' + st.color + '"><span class="dot"></span>' + GN.esc(st.ar) + '</span></td>' +
        '<td class="actions">' + actions('task', [
          { act:'edit-task', idx:idx, icon:ICO_EDIT, title:GN.t('edit') },
          { act:'del-task', idx:idx, icon:ICO_DEL, title:GN.t('delete'), danger:true }
        ]) + '</td></tr>';
    });
    h += '</tbody></table></div></div>';
    return h;
  }
  html += '<div style="text-align:end;margin-bottom:14px"><button class="btn btn-pri btn-sm" data-act="add-task"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg> ' + GN.esc(GN.t('addTask')) + '</button></div>';
  html += renderTasks(open, GN.t('openTasks'));
  html += renderTasks(done, GN.t('doneTasks'));
  html += renderTasks(canceled, GN.t('taskCancelled'));
  if (!tasks.length){
    html += '<div class="card"><div class="empty"><div class="ic">' + GN.navIcon('check') + '</div><h4>' + GN.esc(GN.t('noData')) + '</h4><p>' + GN.esc(GN.t('addTask')) + '</p></div></div>';
  }
  return html;
};

GN.bindSection.tasks = function(){
  GN.bindAction('add-task', function(){ GN.openTaskForm(-1); });
  GN.bindAction('edit-task', function(btn){ GN.openTaskForm(+btn.getAttribute('data-idx')); });
  GN.bindAction('del-task', function(btn){
    var idx = +btn.getAttribute('data-idx');
    askDelete().then(function(ok){ if (!ok) return; list('tasks').splice(idx, 1); save(); });
  });
};

GN.sections.equipment = function(){
  var eq = list('equipment');
  var maint = list('maintenance');
  var totalCost = 0;
  eq.forEach(function(e){ totalCost += Number(e.total_cost || 0); });
  var html = '<div class="kpi-grid">' +
    '<div class="kpi hl"><div class="top"><span class="ic">' + GN.navIcon('tool') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('equipmentList')) + '</div><div class="val"><bdi>' + GN.formatNum(eq.length) + '</bdi></div></div>' +
    '<div class="kpi"><div class="top"><span class="ic y">' + GN.navIcon('dollar') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('totalCost')) + '</div>' +
      '<div class="val"><bdi>' + GN.formatNum(totalCost) + '</bdi><span class="cur">USD</span></div></div>' +
    '<div class="kpi"><div class="top"><span class="ic w">' + GN.navIcon('tool') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('maintenance')) + '</div><div class="val"><bdi>' + GN.formatNum(maint.length) + '</bdi></div></div>' +
    '<div class="kpi"><div class="top"><span class="ic ok">' + GN.navIcon('check') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('received')) + '</div><div class="val"><bdi>' + GN.formatNum(eq.filter(function(e){ return e.received; }).length) + '</bdi></div></div>' +
  '</div>';
  html += '<div class="card"><div class="card-head"><h3>' + GN.navIcon('tool') + ' ' + GN.esc(GN.t('equipmentList')) + '</h3>' +
    '<button class="btn btn-pri btn-sm" data-act="add-eq"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg> ' + GN.esc(GN.t('addEquipment')) + '</button></div>';
  if (!eq.length){
    html += '<div class="empty"><div class="ic">' + GN.navIcon('tool') + '</div><h4>' + GN.esc(GN.t('noData')) + '</h4></div>';
  } else {
    html += '<div class="table-wrap"><table><thead><tr>' +
      '<th>' + GN.esc(GN.t('equipmentName')) + '</th><th>' + GN.esc(GN.t('category')) + '</th>' +
      '<th>' + GN.esc(GN.t('expectedPrice')) + '</th><th>' + GN.esc(GN.t('received')) + '</th>' +
      '<th>' + GN.esc(GN.t('totalCost')) + '</th><th></th></tr></thead><tbody>';
    eq.forEach(function(e, i){
      var statusChip = e.received
        ? '<span class="chip ok"><span class="dot"></span>' + GN.esc(GN.t('received')) + '</span>'
        : '<span class="chip n"><span class="dot"></span>' + GN.esc(GN.t('priceEstimate')) + '</span>';
      html += '<tr><td><b>' + GN.esc(e.name || '-') + '</b>' + (e.model ? '<div style="font-size:11.5px;color:var(--ink-2)">' + GN.esc(e.model) + '</div>' : '') + '</td>' +
        '<td>' + GN.esc(e.category || '-') + '</td>' +
        '<td class="num">' + GN.formatMoneyPlain(e.expected_price, 'USD') + '</td>' +
        '<td>' + statusChip + '</td>' +
        '<td class="num">' + (e.total_cost ? GN.formatMoneyPlain(e.total_cost, 'USD') : '-') + '</td>' +
        '<td class="actions">' + actions('eq', [
          { act:'edit-eq', idx:i, icon:ICO_EDIT, title:GN.t('edit') },
          { act:'del-eq', idx:i, icon:ICO_DEL, title:GN.t('delete'), danger:true }
        ]) + '</td></tr>';
    });
    html += '</tbody></table></div>';
  }
  html += '</div>';
  html += '<div class="card"><div class="card-head"><h3>' + GN.navIcon('tool') + ' ' + GN.esc(GN.t('maintenance')) + '</h3>' +
    '<button class="btn btn-pri btn-sm" data-act="add-maint"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg> ' + GN.esc(GN.t('addMaintenance')) + '</button></div>';
  if (!maint.length){
    html += '<div class="empty"><div class="ic">' + GN.navIcon('tool') + '</div><h4>' + GN.esc(GN.t('noData')) + '</h4></div>';
  } else {
    html += '<div class="table-wrap"><table><thead><tr>' +
      '<th>' + GN.esc(GN.t('date')) + '</th><th>' + GN.esc(GN.t('equipmentName')) + '</th>' +
      '<th>' + GN.esc(GN.t('problemDescription')) + '</th><th>' + GN.esc(GN.t('totalCost')) + '</th><th></th></tr></thead><tbody>';
    maint.forEach(function(m, i){
      html += '<tr><td>' + GN.esc(GN.formatDate(m.date)) + '</td>' +
        '<td>' + GN.esc(m.equipment || '-') + '</td>' +
        '<td>' + GN.esc(m.problem || '-') + '</td>' +
        '<td class="num">' + GN.formatMoneyPlain(m.cost, m.currency || 'USD') + '</td>' +
        '<td class="actions">' + actions('maint', [
          { act:'edit-maint', idx:i, icon:ICO_EDIT, title:GN.t('edit') },
          { act:'del-maint', idx:i, icon:ICO_DEL, title:GN.t('delete'), danger:true }
        ]) + '</td></tr>';
    });
    html += '</tbody></table></div>';
  }
  html += '</div>';
  return html;
};

GN.bindSection.equipment = function(){
  GN.bindAction('add-eq', function(){ GN.openEqForm(-1); });
  GN.bindAction('edit-eq', function(btn){ GN.openEqForm(+btn.getAttribute('data-idx')); });
  GN.bindAction('del-eq', function(btn){
    var idx = +btn.getAttribute('data-idx');
    askDelete().then(function(ok){ if (ok){ list('equipment').splice(idx, 1); save(); } });
  });
  GN.bindAction('add-maint', function(){ GN.openMaintForm(-1); });
  GN.bindAction('edit-maint', function(btn){ GN.openMaintForm(+btn.getAttribute('data-idx')); });
  GN.bindAction('del-maint', function(btn){
    var idx = +btn.getAttribute('data-idx');
    askDelete().then(function(ok){ if (ok){ list('maintenance').splice(idx, 1); save(); } });
  });
};

/* ============================================================
   DOCS & LETTERS — Grid of cards
   ============================================================ */
GN.docFilter = { search: '', category: '', expiry: '' };

GN.sections.docs = function(){
  var docs = list('documents');
  var letters = list('letters');
  var cats = list('doc_categories');

  /* KPIs */
  var today = new Date().toISOString().slice(0, 10);
  var soonLimit = new Date(Date.now() + 30*24*60*60*1000).toISOString().slice(0, 10);
  var expiringCount = 0, expiredCount = 0, catSet = {};
  docs.concat(letters).forEach(function(d){
    if (d.category) catSet[d.category] = true;
    if (!d.expiry_date) return;
    if (d.expiry_date < today) expiredCount++;
    else if (d.expiry_date <= soonLimit) expiringCount++;
  });
  var catCount = Object.keys(catSet).length;

  var html = '';
  html += '<div class="fin-head"><div>' +
    '<h2>' + GN.navIcon('file') + ' ' + GN.esc(GN.t('docsTitle')) + '</h2>' +
    '<span class="sub">' + GN.esc(GN.t('docsSubtitle') || 'المستندات والخطابات') + '</span></div>' +
    '<button class="btn btn-pri btn-sm" data-act="doc-add">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg> ' +
      GN.esc(GN.t('docAdd')) + '</button></div>';

  html += '<div class="doc-kpis">' +
    '<div class="doc-kpi"><div class="ic">' + GN.navIcon('file') + '</div>' +
      '<div class="body"><div class="lbl">' + GN.esc(GN.t('docCountTotal')) + '</div>' +
      '<div class="val">' + GN.formatNum(docs.length + letters.length) + '</div></div></div>' +
    '<div class="doc-kpi"><div class="ic">' + GN.navIcon('cog') + '</div>' +
      '<div class="body"><div class="lbl">' + GN.esc(GN.t('docCountCategories')) + '</div>' +
      '<div class="val">' + GN.formatNum(catCount) + '</div></div></div>' +
    '<div class="doc-kpi soon"><div class="ic">' + GN.navIcon('check') + '</div>' +
      '<div class="body"><div class="lbl">' + GN.esc(GN.t('docCountExpiring')) + '</div>' +
      '<div class="val">' + GN.formatNum(expiringCount) + '</div></div></div>' +
    '<div class="doc-kpi expired"><div class="ic">' + GN.navIcon('check') + '</div>' +
      '<div class="body"><div class="lbl">' + GN.esc(GN.t('docCountExpired')) + '</div>' +
      '<div class="val">' + GN.formatNum(expiredCount) + '</div></div></div>' +
  '</div>';

  /* Toolbar */
  var catOptions = '<option value="">' + GN.esc(GN.t('docFilterAll')) + '</option>' +
    cats.map(function(c){ return '<option value="' + GN.escAttr(c) + '"' + (GN.docFilter.category === c ? ' selected' : '') + '>' + GN.esc(c) + '</option>'; }).join('');

  html += '<div class="doc-toolbar">' +
    '<div class="doc-search">' +
      '<input type="text" id="doc_search" placeholder="' + GN.escAttr(GN.t('docSearchPh')) + '" value="' + GN.escAttr(GN.docFilter.search) + '">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>' +
    '</div>' +
    '<select id="doc_cat_filter">' + catOptions + '</select>' +
    '<select id="doc_expiry_filter">' +
      '<option value="">' + GN.esc(GN.t('docExpiryAll')) + '</option>' +
      '<option value="valid"' + (GN.docFilter.expiry === 'valid' ? ' selected' : '') + '>' + GN.esc(GN.t('docExpiryValid')) + '</option>' +
      '<option value="soon"' + (GN.docFilter.expiry === 'soon' ? ' selected' : '') + '>' + GN.esc(GN.t('docExpirySoon')) + '</option>' +
      '<option value="expired"' + (GN.docFilter.expiry === 'expired' ? ' selected' : '') + '>' + GN.esc(GN.t('docExpiryExpired')) + '</option>' +
      '<option value="none"' + (GN.docFilter.expiry === 'none' ? ' selected' : '') + '>' + GN.esc(GN.t('docExpiryNone')) + '</option>' +
    '</select>' +
    (GN.session.isOwner ? '<button class="doc-btn-manage" data-act="doc-manage-cats">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg> ' +
      GN.esc(GN.t('docManageCategories')) + '</button>' : '') +
  '</div>';

  /* Documents section */
  html += '<div class="doc-section-title">' + GN.navIcon('file') + ' ' + GN.esc(GN.t('docsTitle')) +
    '<span class="cnt">' + docs.length + '</span></div>';
  html += '<div class="doc-grid" id="docGrid">' + GN.renderDocCards(docs, 'doc') + '</div>';

  /* Letters section */
  html += '<div class="doc-section-title" style="margin-top:24px">' + GN.navIcon('file') + ' ' + GN.esc(GN.t('letters')) +
    '<span class="cnt">' + letters.length + '</span></div>';
  html += '<div class="doc-grid" id="letterGrid">' + GN.renderDocCards(letters, 'letter') + '</div>';

  return html;
};

GN.renderDocCards = function(arr, prefix){
  var today = new Date().toISOString().slice(0, 10);
  var soonLimit = new Date(Date.now() + 30*24*60*60*1000).toISOString().slice(0, 10);

  /* Filter */
  var f = GN.docFilter;
  var filtered = arr.filter(function(x){
    if (f.search){
      var s = f.search.toLowerCase();
      var nm = (x.name || '').toLowerCase();
      var rf = (x.reference_number || '').toLowerCase();
      if (nm.indexOf(s) === -1 && rf.indexOf(s) === -1) return false;
    }
    if (f.category && x.category !== f.category) return false;
    if (f.expiry){
      if (f.expiry === 'none' && x.expiry_date) return false;
      if (f.expiry === 'valid' && (!x.expiry_date || x.expiry_date < today)) return false;
      if (f.expiry === 'soon' && (!x.expiry_date || x.expiry_date < today || x.expiry_date > soonLimit)) return false;
      if (f.expiry === 'expired' && (!x.expiry_date || x.expiry_date >= today)) return false;
    }
    return true;
  });

  if (!filtered.length){
    return '<div class="doc-empty-grid">' +
      '<div class="ic">' + GN.navIcon('file') + '</div>' +
      '<h4>' + GN.esc(f.search || f.category || f.expiry ? GN.t('docNoResults') : (prefix === 'letter' ? GN.t('letterEmpty') : GN.t('docEmpty'))) + '</h4>' +
      '<p>' + GN.esc(GN.t('docEmptyHint')) + '</p></div>';
  }

  var isAdmin = GN.session.isOwner && GN.session.isAdmin;
  var actPrefix = prefix === 'letter' ? 'letter' : 'doc';

  return filtered.map(function(x, i){
    var realIdx = arr.indexOf(x);
    var status = 'valid';
    var expLbl = '';
    if (x.expiry_date){
      if (x.expiry_date < today){ status = 'expired'; expLbl = GN.t('docExpiryExpired'); }
      else if (x.expiry_date <= soonLimit){ status = 'soon'; expLbl = GN.t('docExpirySoon'); }
      else { status = 'valid'; expLbl = GN.t('docExpiryValid'); }
    }

    var cardClass = 'doc-card';
    if (status === 'expired') cardClass += ' expired';
    else if (status === 'soon') cardClass += ' expiring-soon';

    var actions = '<div class="doc-card-actions">';
    if (x.url){
      actions += '<a class="doc-act" href="' + GN.escAttr(x.url) + '" target="_blank" rel="noopener">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>' +
        GN.esc(GN.t('docView')) + '</a>';
    }
    if (isAdmin){
      actions += '<button class="doc-act" data-act="edit-' + actPrefix + '" data-idx="' + realIdx + '">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg></button>';
      actions += '<button class="doc-act del" data-act="del-' + actPrefix + '" data-idx="' + realIdx + '">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M8 6V4h8v2M6 6v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6"/></svg></button>';
    }
    actions += '</div>';

    return '<div class="' + cardClass + '">' +
      '<div class="doc-card-head">' +
        '<div class="doc-card-icon' + (prefix === 'letter' ? ' letter' : '') + '">' + GN.navIcon('file') + '</div>' +
        (x.category ? '<span class="doc-cat-badge">' + GN.esc(x.category) + '</span>' : '') +
      '</div>' +
      '<div class="doc-card-title">' + GN.esc(x.name || '-') + '</div>' +
      '<div class="doc-card-meta">' +
        (x.reference_number ? '<div class="row"><span>' + GN.esc(GN.t('docRefNumber')) + ':</span><b class="ltr">' + GN.esc(x.reference_number) + '</b></div>' : '') +
        '<div class="row"><span>' + GN.esc(GN.t('addedDate')) + ':</span><b>' + GN.esc(GN.formatDate(x.date)) + '</b></div>' +
        (x.expiry_date ? '<div class="row"><span>' + GN.esc(GN.t('docExpiryDate')) + ':</span><b>' + GN.esc(GN.formatDate(x.expiry_date)) + '</b></div>' : '') +
        (x.expiry_date ? '<div><span class="doc-expiry-badge ' + status + '"><span class="dot"></span>' + GN.esc(expLbl) + '</span></div>' : '') +
      '</div>' +
      actions +
    '</div>';
  }).join('');
};

/* Category manager */
GN.openManageCategories = function(){
  if (!GN.session.isOwner){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  var cats = list('doc_categories');

  var body = document.getElementById('formModalBody');
  var titleEl = document.getElementById('formModalTitle');
  if (!body || !titleEl) return;
  titleEl.textContent = GN.t('docManageTitle');

  function renderList(){
    if (!cats.length){
      return '<div class="cat-empty">' + GN.esc(GN.t('docNoCategories')) + '</div>';
    }
    return cats.map(function(c, i){
      return '<span class="cat-chip">' + GN.esc(c) +
        '<button class="x" data-cat-del="' + i + '" type="button">×</button></span>';
    }).join('');
  }

  body.innerHTML = '<div class="cat-list" id="catList">' + renderList() + '</div>' +
    '<div class="cat-add-row">' +
      '<input type="text" id="cat_new" placeholder="' + GN.escAttr(GN.t('docAddCategoryPh')) + '" maxlength="40">' +
      '<button class="btn btn-pri" id="cat_add_btn" type="button">' + GN.esc(GN.t('add')) + '</button>' +
    '</div>';

  GN.openModal('formModal');

  function bindDelete(){
    GN.$$('[data-cat-del]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var i = +btn.getAttribute('data-cat-del');
        cats.splice(i, 1);
        save().then(function(){
          document.getElementById('catList').innerHTML = renderList();
          bindDelete();
        });
      });
    });
  }
  bindDelete();

  document.getElementById('cat_add_btn').onclick = function(){
    var v = document.getElementById('cat_new').value.trim();
    if (!v) return;
    if (cats.indexOf(v) !== -1){ GN.toast(GN.t('fieldRequired'), 'bad'); return; }
    cats.push(v);
    save().then(function(){
      document.getElementById('cat_new').value = '';
      document.getElementById('catList').innerHTML = renderList();
      bindDelete();
    });
  };

  /* Hide default submit button since we save inline */
  var sub = document.getElementById('formModalSubmit');
  if (sub) sub.style.display = 'none';
};

GN.bindSection.docs = function(){
  /* Search */
  var s = document.getElementById('doc_search');
  if (s){
    s.addEventListener('input', function(){
      GN.docFilter.search = s.value.trim();
      var g1 = document.getElementById('docGrid');
      var g2 = document.getElementById('letterGrid');
      if (g1) g1.innerHTML = GN.renderDocCards(list('documents'), 'doc');
      if (g2) g2.innerHTML = GN.renderDocCards(list('letters'), 'letter');
      GN.bindSection.docs();
    });
  }
  var cf = document.getElementById('doc_cat_filter');
  if (cf){
    cf.addEventListener('change', function(){
      GN.docFilter.category = cf.value;
      var g1 = document.getElementById('docGrid');
      var g2 = document.getElementById('letterGrid');
      if (g1) g1.innerHTML = GN.renderDocCards(list('documents'), 'doc');
      if (g2) g2.innerHTML = GN.renderDocCards(list('letters'), 'letter');
      GN.bindSection.docs();
    });
  }
  var ef = document.getElementById('doc_expiry_filter');
  if (ef){
    ef.addEventListener('change', function(){
      GN.docFilter.expiry = ef.value;
      var g1 = document.getElementById('docGrid');
      var g2 = document.getElementById('letterGrid');
      if (g1) g1.innerHTML = GN.renderDocCards(list('documents'), 'doc');
      if (g2) g2.innerHTML = GN.renderDocCards(list('letters'), 'letter');
      GN.bindSection.docs();
    });
  }

  /* Add */
  GN.bindAction('doc-add', function(){
    if (!GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
    GN.openDocForm(-1);
  });

  /* Manage categories */
  GN.bindAction('doc-manage-cats', function(){ GN.openManageCategories(); });

  /* Edit/Delete docs */
  GN.$$('[data-act="edit-doc"]').forEach(function(b){
    b.addEventListener('click', function(){ GN.openDocForm(+b.getAttribute('data-idx')); });
  });
  GN.$$('[data-act="del-doc"]').forEach(function(b){
    b.addEventListener('click', function(){
      var idx = +b.getAttribute('data-idx');
      askDelete().then(function(ok){ if (ok){ list('documents').splice(idx, 1); save(); } });
    });
  });
  GN.$$('[data-act="edit-letter"]').forEach(function(b){
    b.addEventListener('click', function(){ GN.openLetterForm(+b.getAttribute('data-idx')); });
  });
  GN.$$('[data-act="del-letter"]').forEach(function(b){
    b.addEventListener('click', function(){
      var idx = +b.getAttribute('data-idx');
      askDelete().then(function(ok){ if (ok){ list('letters').splice(idx, 1); save(); } });
    });
  });
};

GN.bindSection.docs = function(){
  GN.bindAction('add-doc', function(){ GN.openDocForm(-1); });
  GN.bindAction('edit-doc', function(btn){ GN.openDocForm(+btn.getAttribute('data-idx')); });
  GN.bindAction('del-doc', function(btn){
    var idx = +btn.getAttribute('data-idx');
    askDelete().then(function(ok){ if (ok){ list('documents').splice(idx, 1); save(); } });
  });
  GN.bindAction('add-letter', function(){ GN.openLetterForm(-1); });
  GN.bindAction('edit-letter', function(btn){ GN.openLetterForm(+btn.getAttribute('data-idx')); });
  GN.bindAction('del-letter', function(btn){
    var idx = +btn.getAttribute('data-idx');
    askDelete().then(function(ok){ if (ok){ list('letters').splice(idx, 1); save(); } });
  });
};

GN.sections.users = function(){
  if (!GN.session.isOwner){
    return '<div class="card"><div class="empty"><div class="ic">' + GN.navIcon('lock') + '</div><h4>' + GN.esc(GN.t('readOnlyNotice')) + '</h4></div></div>';
  }
  var html = '<div class="card"><div class="card-head"><h3>' + GN.navIcon('lock') + ' ' + GN.esc(GN.t('usersTitle')) + '</h3>' +
    '<button class="btn btn-pri btn-sm" data-act="add-user"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg> ' + GN.esc(GN.t('addUser')) + '</button></div>' +
    '<div id="usersList"><div class="empty"><h4>' + GN.esc(GN.t('loading')) + '</h4></div></div></div>';
  setTimeout(function(){
    GN.listProfiles().then(function(users){
      var box = document.getElementById('usersList'); if (!box) return;
      if (!users.length){ box.innerHTML = '<div class="empty"><div class="ic">' + GN.navIcon('team') + '</div><h4>' + GN.esc(GN.t('noData')) + '</h4></div>'; return; }
      var h = '<div class="table-wrap"><table><thead><tr>' +
        '<th>' + GN.esc(GN.t('fullName')) + '</th><th>' + GN.esc(GN.t('userEmail')) + '</th>' +
        '<th>' + GN.esc(GN.t('userRole')) + '</th><th>' + GN.esc(GN.t('userStatus')) + '</th>' +
        '<th>' + GN.esc(GN.t('lastLogin')) + '</th><th></th></tr></thead><tbody>';
      users.forEach(function(u){
        var st = u.status === 'allowed' ? 'ok' : (u.status === 'pending' ? 'w' : 'b');
        var stLabel = u.status === 'allowed' ? GN.t('statusAllowed') : (u.status === 'pending' ? GN.t('statusPending') : GN.t('statusBlocked'));
        var role = u.role === 'owner' ? GN.t('roleAdmin') : GN.t('roleReader');
        h += '<tr><td><b>' + GN.esc(u.full_name || '-') + '</b></td>' +
          '<td><bdi dir="ltr">' + GN.esc(u.email || '-') + '</bdi></td>' +
          '<td>' + GN.esc(role) + '</td>' +
          '<td><span class="chip ' + st + '"><span class="dot"></span>' + GN.esc(stLabel) + '</span></td>' +
          '<td>' + GN.esc(GN.relativeTime(u.last_login)) + '</td>' +
          '<td class="actions">';
        if (u.role !== 'owner'){
          if (u.status === 'allowed'){
            h += '<button class="icon-act" data-act="user-block" data-uid="' + GN.escAttr(u.auth_user_id) + '" title="' + GN.escAttr(GN.t('deactivateUser')) + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 1 1 8 0v3"/></svg></button>';
          } else {
            h += '<button class="icon-act" data-act="user-allow" data-uid="' + GN.escAttr(u.auth_user_id) + '" title="' + GN.escAttr(GN.t('activateUser')) + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M20 6 9 17l-5-5"/></svg></button>';
          }
        }
        h += '</td></tr>';
      });
      h += '</tbody></table></div>';
      box.innerHTML = h;
      GN.$$('[data-act="user-block"]').forEach(function(b){
        b.addEventListener('click', function(){
          GN.updateProfileStatus(b.getAttribute('data-uid'), 'blocked').then(function(ok){
            if (ok){ GN.toast(GN.t('updatedSuccess'), 'ok'); GN.goTo('users'); }
          });
        });
      });
      GN.$$('[data-act="user-allow"]').forEach(function(b){
        b.addEventListener('click', function(){
          GN.updateProfileStatus(b.getAttribute('data-uid'), 'allowed').then(function(ok){
            if (ok){ GN.toast(GN.t('updatedSuccess'), 'ok'); GN.goTo('users'); }
          });
        });
      });
    });
  }, 100);
  return html;
};
GN.bindSection.users = function(){ GN.bindAction('add-user', function(){ GN.openUserForm(); }); };

GN.sections.settings = function(){
  var s = settings();
  var contact = s.contact || {};
  var inv = dash().investment || {};
  var html = '<div class="card"><div class="card-head"><h3>' + GN.navIcon('cog') + ' ' + GN.esc(GN.t('generalSettings')) + '</h3></div>' +
    '<div class="form-grid">' +
      '<div class="field"><label>' + GN.esc(GN.t('companyName')) + '</label>' +
        '<div class="input-wrap"><input type="text" data-set="company_name" value="' + GN.escAttr(s.company_name || '') + '"></div></div>' +
      '<div class="field"><label>' + GN.esc(GN.t('companyShort')) + '</label>' +
        '<div class="input-wrap"><input type="text" data-set="company_short" value="' + GN.escAttr(s.company_short || '') + '"></div></div>' +
      '<div class="field full"><label>' + GN.esc(GN.t('companyTagline')) + '</label>' +
        '<div class="input-wrap"><input type="text" data-set="company_tagline" value="' + GN.escAttr(s.company_tagline || '') + '"></div></div>' +
    '</div></div>';
  html += '<div class="card"><div class="card-head"><h3>' + GN.navIcon('dollar') + ' ' + GN.esc(GN.t('investmentTitle')) + '</h3></div>' +
    '<div class="form-grid">' +
      '<div class="field"><label>' + GN.esc(GN.t('capitalTotal')) + '</label>' +
        '<div class="input-wrap"><input type="number" data-inv="capital_total" value="' + (inv.capital_total || 0) + '"></div></div>' +
      '<div class="field"><label>' + GN.esc(GN.t('capitalCash')) + '</label>' +
        '<div class="input-wrap"><input type="number" data-inv="capital_cash" value="' + (inv.capital_cash || 0) + '"></div></div>' +
      '<div class="field"><label>' + GN.esc(GN.t('capitalEquipment')) + '</label>' +
        '<div class="input-wrap"><input type="number" data-inv="capital_equipment" value="' + (inv.capital_equipment || 0) + '"></div></div>' +
      '<div class="field"><label>' + GN.esc(GN.t('capitalDebt')) + '</label>' +
        '<div class="input-wrap"><input type="number" data-inv="capital_debt" value="' + (inv.capital_debt || 0) + '"></div></div>' +
      '<div class="field"><label>' + GN.esc(GN.t('recovered')) + '</label>' +
        '<div class="input-wrap"><input type="number" data-inv="recovered_total" value="' + (inv.recovered_total || 0) + '"></div></div>' +
      '<div class="field"><label>' + GN.esc(GN.t('currency')) + '</label>' +
        '<div class="input-wrap"><input type="text" data-set="currency" value="' + GN.escAttr(s.currency || 'USD') + '"></div></div>' +
    '</div>' +
    '<div style="text-align:end;margin-top:14px"><button class="btn btn-pri" data-act="save-settings">' + GN.esc(GN.t('saveChanges')) + '</button></div></div>';
  html += '<div class="card"><div class="card-head"><h3>' + GN.navIcon('cog') + ' ' + GN.esc(GN.t('contactInfo')) + '</h3></div>' +
    '<div class="form-grid">' +
      '<div class="field"><label>' + GN.esc(GN.t('contactEmailLabel')) + '</label>' +
        '<div class="input-wrap"><input type="email" dir="ltr" data-contact-set="email" value="' + GN.escAttr(contact.email || '') + '"></div></div>' +
      '<div class="field"><label>' + GN.esc(GN.t('contactPhoneLabel')) + '</label>' +
        '<div class="input-wrap"><input type="tel" dir="ltr" data-contact-set="phone" value="' + GN.escAttr(contact.phone || '') + '"></div></div>' +
      '<div class="field full"><label>' + GN.esc(GN.t('contactWhatsappLabel')) + '</label>' +
        '<div class="input-wrap"><input type="url" dir="ltr" data-contact-set="whatsapp" value="' + GN.escAttr(contact.whatsapp || '') + '"></div></div>' +
    '</div>' +
    '<div style="text-align:end;margin-top:14px"><button class="btn btn-pri" data-act="save-settings">' + GN.esc(GN.t('saveChanges')) + '</button></div></div>';
  html += '<div class="card"><div class="card-head"><h3>' + GN.navIcon('cog') + ' ' + GN.esc(GN.t('backup')) + '</h3></div>' +
    '<div style="display:flex;gap:10px;flex-wrap:wrap">' +
      '<button class="btn btn-sec" data-act="export-all">' + GN.esc(GN.t('exportAll')) + '</button>' +
      '<button class="btn btn-sec" data-act="import-all">' + GN.esc(GN.t('importAll')) + '</button>' +
      '<button class="btn btn-danger" data-act="reset-all">' + GN.esc(GN.t('resetData')) + '</button>' +
    '</div><input type="file" id="importFile" accept="application/json,.json" hidden></div>';
  return html;
};

GN.bindSection.settings = function(){
  GN.bindAction('save-settings', function(){
    GN.$$('[data-set]').forEach(function(inp){ settings()[inp.getAttribute('data-set')] = inp.value.trim(); });
    GN.$$('[data-inv]').forEach(function(inp){
      var k = inp.getAttribute('data-inv');
      dash().investment = dash().investment || {};
      dash().investment[k] = Number(inp.value) || 0;
    });
    GN.$$('[data-contact-set]').forEach(function(inp){
      var k = inp.getAttribute('data-contact-set');
      settings().contact = settings().contact || {};
      settings().contact[k] = inp.value.trim();
    });
    save();
  });
  GN.bindAction('export-all', function(){
    GN.downloadJSON('gold-nile-backup-' + GN.today() + '.json', GN.dash.data);
    GN.toast(GN.t('success'), 'ok');
  });
  GN.bindAction('import-all', function(){ var f = document.getElementById('importFile'); if (f) f.click(); });
  var f = document.getElementById('importFile');
  if (f){
    f.addEventListener('change', function(e){
      var file = e.target.files[0]; if (!file) return;
      GN.readFileText(file).then(function(txt){
        try { GN.dash.data = GN.normalizeData(JSON.parse(txt)); save(); }
        catch (err){ GN.toast(GN.t('error'), 'bad'); }
      });
      e.target.value = '';
    });
  }
  GN.bindAction('reset-all', function(){
    GN.confirm({ title: GN.t('resetData'), text: GN.t('resetWarning'), okText: GN.t('delete'), cancelText: GN.t('cancel'), danger: true }).then(function(ok){
      if (!ok) return;
      GN.dash.data = GN.clone(window.GN_DEFAULT_DATA);
      save();
    });
  });
};

/* Form Helpers */
function openForm(titleKey, fields){
  var body = document.getElementById('formModalBody');
  var title = document.getElementById('formModalTitle');
  if (!body || !title) return;
  title.textContent = GN.t(titleKey);
  body.innerHTML = '<div class="form-grid">' + fields.map(function(f){
    var cls = 'field' + (f.full ? ' full' : '');
    var input;
    if (f.type === 'textarea'){
      input = '<textarea id="' + f.id + '" rows="4">' + GN.esc(f.value || '') + '</textarea>';
    } else if (f.type === 'select'){
      input = '<select id="' + f.id + '">' + (f.options || []).map(function(o){
        return '<option value="' + GN.escAttr(o.value) + '"' + (o.value === f.value ? ' selected' : '') + '>' + GN.esc(o.label) + '</option>';
      }).join('') + '</select>';
    } else {
      input = '<input type="' + (f.type || 'text') + '" id="' + f.id + '"' +
        (f.dir ? ' dir="' + f.dir + '"' : '') +
        (f.placeholder ? ' placeholder="' + GN.escAttr(f.placeholder) + '"' : '') +
        ' value="' + GN.escAttr(f.value == null ? '' : f.value) + '">';
    }
    return '<div class="' + cls + '"><label>' + GN.esc(f.label) + (f.req ? ' <span class="req">*</span>' : '') + '</label>' +
      '<div class="input-wrap">' + input + '</div></div>';
  }).join('') + '</div>';
  GN.openModal('formModal');
}
function readForm(ids){
  var out = {};
  ids.forEach(function(id){
    var el = document.getElementById(id);
    if (el) out[id] = el.value.trim();
  });
  return out;
}
function onSubmit(fn){
  var btn = document.getElementById('formModalSubmit');
  if (!btn) return;
  btn.onclick = function(){
    fn(function(ok){ if (ok){ GN.closeModal('formModal'); save(); } });
  };
}

/* HR Forms */
GN.openDeptForm = function(idx){
  if (!GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  var arr = list('departments');
  var item = idx >= 0 ? arr[idx] : { name:'' };
  openForm('addDepartment', [{ id:'name', label: GN.t('name'), req:true, value:item.name || '' }]);
  onSubmit(function(done){
    var v = readForm(['name']);
    if (!v.name){ GN.toast(GN.t('fieldRequired'), 'bad'); done(false); return; }
    if (idx >= 0) arr[idx].name = v.name; else arr.push({ name: v.name });
    done(true);
  });
};

GN.openEmpForm = function(idx){
  if (!GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  var arr = list('employees');
  var deps = list('departments');
  var item = idx >= 0 ? arr[idx] : {};
  var depOptions = [{value:'', label:'-'}].concat(deps.map(function(x){ return {value:x.name, label:x.name}; }));
  var statusOptions = [];
  var st = (window.GN_CONST && window.GN_CONST.EMP_STATUS) || {};
  for (var k in st) statusOptions.push({ value:k, label:st[k].ar });
  openForm('addEmployee', [
    { id:'name', label: GN.t('fullName'), req:true, full:true, value:item.name || '' },
    { id:'department', label: GN.t('department'), type:'select', options:depOptions, value:item.department || '' },
    { id:'role', label: GN.t('jobTitle'), value:item.role || '' },
    { id:'phone', label: GN.t('contactPhoneLabel'), dir:'ltr', value:item.phone || '' },
    { id:'nationality', label: GN.t('nationality'), value:item.nationality || '' },
    { id:'passport', label: GN.t('passportNumber'), dir:'ltr', value:item.passport || '' },
    { id:'salary', label: GN.t('baseSalary') + ' (SDG)', type:'number', value:item.salary || 0 },
    { id:'allowances', label: GN.t('allowances') + ' (SDG)', type:'number', value:item.allowances || 0 },
    { id:'hire_date', label: GN.t('hireDate'), type:'date', value:item.hire_date || GN.today() },
    { id:'status', label: GN.t('status'), type:'select', options:statusOptions, value:item.status || 'active' }
  ]);
  onSubmit(function(done){
    var v = readForm(['name','department','role','phone','nationality','passport','salary','allowances','hire_date','status']);
    if (!v.name){ GN.toast(GN.t('fieldRequired'), 'bad'); done(false); return; }
    var obj = { name: v.name, department: v.department, role: v.role, phone: v.phone, nationality: v.nationality, passport: v.passport, salary: Number(v.salary) || 0, allowances: Number(v.allowances) || 0, hire_date: v.hire_date, status: v.status, currency: 'SDG' };
    if (idx >= 0) Object.assign(arr[idx], obj);
    else { obj.id = GN.uid(); arr.push(obj); }
    done(true);
  });
};

GN.openEndEmpForm = function(idx){
  if (!GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  var arr = list('employees');
  var item = arr[idx]; if (!item) return;
  openForm('endEmployee', [
    { id:'status', label: GN.t('status'), type:'select', options:[{ value:'resigned', label: GN.t('resigned') }, { value:'fired', label: GN.t('fired') }], value:'resigned' },
    { id:'end_date', label: GN.t('endDate'), type:'date', value:GN.today() },
    { id:'end_reason', label: GN.t('endReason'), type:'textarea', full:true }
  ]);
  onSubmit(function(done){
    var v = readForm(['status','end_date','end_reason']);
    item.status = v.status; item.end_date = v.end_date; item.end_reason = v.end_reason;
    done(true);
  });
};

GN.openTaskForm = function(idx){
  if (!GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  var arr = list('tasks');
  var emps = list('employees');
  var item = idx >= 0 ? arr[idx] : {};
  var assigneeOptions = [{ value:'', label:'-' }, { value:'__me', label: GN.t('assigneeMe') }].concat(emps.map(function(e){ return { value: e.id, label: e.name }; }));
  var stOptions = []; var ts = (window.GN_CONST && window.GN_CONST.TASK_STATUS) || {};
  for (var k in ts) stOptions.push({ value:k, label:ts[k].ar });
  var prOptions = []; var pr = (window.GN_CONST && window.GN_CONST.TASK_PRIORITY) || {};
  for (var k2 in pr) prOptions.push({ value:k2, label:pr[k2].ar });
  openForm('addTask', [
    { id:'title', label: GN.t('taskTitle'), req:true, full:true, value:item.title || '' },
    { id:'description', label: GN.t('description'), type:'textarea', full:true, value:item.description || '' },
    { id:'assignee', label: GN.t('assignee'), type:'select', options:assigneeOptions, value:item.assignee || '' },
    { id:'status', label: GN.t('status'), type:'select', options:stOptions, value:item.status || 'new' },
    { id:'priority', label: GN.t('priority'), type:'select', options:prOptions, value:item.priority || 'normal' },
    { id:'start_date', label: GN.t('startDate'), type:'date', value:item.start_date || GN.today() },
    { id:'due_date', label: GN.t('dueDate'), type:'date', value:item.due_date || '' }
  ]);
  onSubmit(function(done){
    var v = readForm(['title','description','assignee','status','priority','start_date','due_date']);
    if (!v.title){ GN.toast(GN.t('fieldRequired'), 'bad'); done(false); return; }
    var assigneeName = '';
    if (v.assignee === '__me') assigneeName = (GN.session.profile && GN.session.profile.full_name) || 'Me';
    else { var emp = emps.filter(function(e){ return e.id === v.assignee; })[0]; if (emp) assigneeName = emp.name; }
    var obj = { title: v.title, description: v.description, assignee: v.assignee, assignee_name: assigneeName, status: v.status, priority: v.priority, start_date: v.start_date, due_date: v.due_date, updated_at: GN.now() };
    if (idx >= 0) Object.assign(arr[idx], obj);
    else { obj.id = GN.uid(); obj.code = GN.genCode('TASK', arr); obj.created_at = GN.now(); arr.push(obj); }
    done(true);
  });
};

GN.openEqForm = function(idx){
  if (!GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  var arr = list('equipment');
  var item = idx >= 0 ? arr[idx] : {};
  openForm('addEquipment', [
    { id:'name', label: GN.t('equipmentName'), req:true, full:true, value:item.name || '' },
    { id:'model', label: GN.t('model'), value:item.model || '' },
    { id:'category', label: GN.t('category'), value:item.category || '' },
    { id:'expected_price', label: GN.t('expectedPrice') + ' (USD)', type:'number', value:item.expected_price || 0 },
    { id:'total_cost', label: GN.t('totalCost') + ' (USD)', type:'number', value:item.total_cost || 0 },
    { id:'notes', label: GN.t('notes'), type:'textarea', full:true, value:item.notes || '' }
  ]);
  onSubmit(function(done){
    var v = readForm(['name','model','category','expected_price','total_cost','notes']);
    if (!v.name){ GN.toast(GN.t('fieldRequired'), 'bad'); done(false); return; }
    var obj = { name: v.name, model: v.model, category: v.category, expected_price: Number(v.expected_price) || 0, total_cost: Number(v.total_cost) || 0, notes: v.notes, received: Number(v.total_cost) > 0 };
    if (idx >= 0) Object.assign(arr[idx], obj); else { obj.id = GN.uid(); arr.push(obj); }
    done(true);
  });
};

GN.openMaintForm = function(idx){
  if (!GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  var arr = list('maintenance');
  var eq = list('equipment');
  var item = idx >= 0 ? arr[idx] : {};
  var eqOptions = eq.map(function(e){ return { value: e.name, label: e.name }; });
  openForm('addMaintenance', [
    { id:'equipment', label: GN.t('equipmentName'), type:'select', options:eqOptions, value:item.equipment || '' },
    { id:'date', label: GN.t('date'), type:'date', value:item.date || GN.today() },
    { id:'problem', label: GN.t('problemDescription'), type:'textarea', full:true, value:item.problem || '' },
    { id:'cost', label: GN.t('totalCost'), type:'number', value:item.cost || 0 }
  ]);
  onSubmit(function(done){
    var v = readForm(['equipment','date','problem','cost']);
    var obj = { equipment: v.equipment, date: v.date, problem: v.problem, cost: Number(v.cost) || 0, currency: 'USD' };
    if (idx >= 0) Object.assign(arr[idx], obj); else { obj.id = GN.uid(); arr.push(obj); }
    done(true);
  });
};

GN.openDocForm = function(idx){
  if (!GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  var arr = list('documents');
  var cats = list('doc_categories');
  var item = idx >= 0 ? arr[idx] : {};

  var catOpts = [{ value:'', label:'—' }].concat(cats.map(function(c){ return { value:c, label:c }; }));

  openForm('docAdd', [
    { id:'name', label: GN.t('docName'), req:true, full:true, value:item.name || '' },
    { id:'category', label: GN.t('docCategory'), type:'select', options:catOpts, value:item.category || '' },
    { id:'reference_number', label: GN.t('docRefNumber'), dir:'ltr', value:item.reference_number || '' },
    { id:'date', label: GN.t('addedDate'), type:'date', value:item.date || GN.today() },
    { id:'expiry_date', label: GN.t('docExpiryDate'), type:'date', value:item.expiry_date || '' },
    { id:'url', label: GN.t('docUrl'), dir:'ltr', full:true, placeholder:'https://...', value:item.url || '' }
  ]);
  onSubmit(function(done){
    var v = readForm(['name','category','reference_number','date','expiry_date','url']);
    if (!v.name){ GN.toast(GN.t('fieldRequired'), 'bad'); done(false); return; }
    var obj = {
      name: v.name,
      category: v.category,
      reference_number: v.reference_number,
      date: v.date,
      expiry_date: v.expiry_date,
      url: v.url
    };
    if (idx >= 0) Object.assign(arr[idx], obj);
    else { obj.id = GN.uid(); arr.push(obj); }
    done(true);
  });
};

GN.openLetterForm = function(idx){
  if (!GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  var arr = list('letters');
  var cats = list('doc_categories');
  var item = idx >= 0 ? arr[idx] : {};
  var catOpts = [{ value:'', label:'—' }].concat(cats.map(function(c){ return { value:c, label:c }; }));

  openForm('letterAdd', [
    { id:'name', label: GN.t('docName'), req:true, full:true, value:item.name || '' },
    { id:'category', label: GN.t('docCategory'), type:'select', options:catOpts, value:item.category || '' },
    { id:'reference_number', label: GN.t('docRefNumber'), dir:'ltr', value:item.reference_number || '' },
    { id:'date', label: GN.t('addedDate'), type:'date', value:item.date || GN.today() },
    { id:'expiry_date', label: GN.t('docExpiryDate'), type:'date', value:item.expiry_date || '' },
    { id:'url', label: GN.t('docUrl'), dir:'ltr', full:true, placeholder:'https://...', value:item.url || '' }
  ]);
  onSubmit(function(done){
    var v = readForm(['name','category','reference_number','date','expiry_date','url']);
    if (!v.name){ GN.toast(GN.t('fieldRequired'), 'bad'); done(false); return; }
    var obj = {
      name: v.name,
      category: v.category,
      reference_number: v.reference_number,
      date: v.date,
      expiry_date: v.expiry_date,
      url: v.url
    };
    if (idx >= 0) Object.assign(arr[idx], obj);
    else { obj.id = GN.uid(); arr.push(obj); }
    done(true);
  });
};

GN.openUserForm = function(){
  if (!GN.session.isOwner){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  openForm('addUser', [
    { id:'full_name', label: GN.t('fullName'), req:true, full:true },
    { id:'email', label: GN.t('userEmail'), type:'email', dir:'ltr', req:true },
    { id:'password', label: GN.t('userPassword'), type:'password', dir:'ltr', req:true }
  ]);
  onSubmit(function(done){
    var v = readForm(['full_name','email','password']);
    if (!v.full_name || !v.email || !v.password){ GN.toast(GN.t('fieldRequired'), 'bad'); done(false); return; }
    if (!GN.isEmail(v.email)){ GN.toast(GN.t('fieldInvalidEmail'), 'bad'); done(false); return; }
    if (v.password.length < 8){ GN.toast(GN.t('fieldTooShort'), 'bad'); done(false); return; }
    GN.addMember(v.email, v.password, v.full_name).then(function(res){
      if (res.ok){ GN.toast(GN.t('addedSuccess'), 'ok'); done(true); GN.goTo('users'); }
      else { GN.toast(GN.errorMessage(res.error), 'bad'); done(false); }
    });
  });
};

GN.openBankForm = function(idx){
  if (!GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  var arr = list('banks');
  var item = idx >= 0 ? arr[idx] : {};
  openForm('addBank', [
    { id:'name', label: GN.t('bankName'), req:true, full:true, value:item.name || '' },
    { id:'branch', label: GN.t('bankBranch'), value:item.branch || '' },
    { id:'account_name', label: GN.t('accountName'), value:item.account_name || '' },
    { id:'account_number', label: GN.t('accountNumber'), dir:'ltr', value:item.account_number || '' },
    { id:'customer_number', label: 'رقم حساب العميل الأساسي', dir:'ltr', value:item.customer_number || '' },
    { id:'iban', label: GN.t('iban'), dir:'ltr', value:item.iban || '' },
    { id:'swift', label: GN.t('swift'), dir:'ltr', value:item.swift || '' },
    { id:'balance', label: GN.t('balance'), type:'number', value:item.balance || 0 },
    { id:'currency', label: GN.t('currency'), value:item.currency || 'SDG' }
  ]);
  onSubmit(function(done){
    var v = readForm(['name','branch','account_name','account_number','customer_number','iban','swift','balance','currency']);
    if (!v.name){ GN.toast(GN.t('fieldRequired'), 'bad'); done(false); return; }
    var obj = { name: v.name, branch: v.branch, account_name: v.account_name, account_number: v.account_number, customer_number: v.customer_number, iban: v.iban, swift: v.swift, balance: Number(v.balance) || 0, currency: v.currency || 'SDG' };
    if (idx >= 0) Object.assign(arr[idx], obj); else { obj.id = GN.uid(); arr.push(obj); }
    done(true);
  });
};

GN.delBank = function(idx){
  var arr = list('banks'); if (!arr[idx]) return;
  askDelete().then(function(ok){ if (!ok) return; arr.splice(idx, 1); save(); });
};

GN.openTransferForm = function(idx, type, bankIdx){
  if (!GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  var arr = list('transfers');
  var banks = list('banks');
  var item = idx >= 0 ? arr[idx] : { type: type || 'in', bank_id: banks[bankIdx] ? banks[bankIdx].id : '' };
  var bankOptions = banks.map(function(b){ return { value: b.id, label: b.name }; });
  openForm(type === 'out' ? 'addOutgoing' : 'addIncoming', [
    { id:'date', label: GN.t('date'), type:'date', value:item.date || GN.today() },
    { id:'bank_id', label: GN.t('bankName'), type:'select', options:bankOptions, value:item.bank_id || '' },
    { id:'amount', label: GN.t('amount'), type:'number', req:true, value:item.amount || 0 },
    { id:'currency', label: GN.t('currency'), value:item.currency || 'SDG' },
    { id:'party', label: GN.t('party'), value:item.party || '' },
    { id:'invoice', label: GN.t('invoiceNumber'), dir:'ltr', value:item.invoice || '' },
    { id:'attachment', label: GN.t('attachment') + ' (URL)', dir:'ltr', full:true, placeholder:'https://...', value:item.attachment || '' },
    { id:'notes', label: GN.t('notes'), type:'textarea', full:true, value:item.notes || '' }
  ]);
  onSubmit(function(done){
    var v = readForm(['date','bank_id','amount','currency','party','invoice','attachment','notes']);
    if (!v.amount || Number(v.amount) <= 0){ GN.toast(GN.t('fieldRequired'), 'bad'); done(false); return; }
    var obj = { type: item.type || type || 'in', date: v.date, bank_id: v.bank_id, amount: Number(v.amount) || 0, currency: v.currency || 'SDG', party: v.party, invoice: v.invoice, attachment: v.attachment, notes: v.notes };
    if (idx >= 0) Object.assign(arr[idx], obj); else { obj.id = GN.uid(); arr.push(obj); }
    var bank = banks.filter(function(b){ return b.id === v.bank_id; })[0];
    if (bank && idx < 0){ bank.balance = Number(bank.balance || 0) + (obj.type === 'in' ? obj.amount : -obj.amount); }
    GN.pushNotification({ type: obj.type, title: GN.t(obj.type === 'in' ? 'notifTransferIn' : 'notifTransferOut'), body: (obj.type === 'in' ? '+' : '-') + GN.formatNum(obj.amount) + ' ' + obj.currency + ' - ' + obj.party });
    done(true);
  });
};

GN.delTransfer = function(idx){
  var arr = list('transfers'); if (!arr[idx]) return;
  askDelete().then(function(ok){ if (!ok) return; arr.splice(idx, 1); save(); });
};

GN.openPaymentForm = function(idx){
  if (!GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  var inv = dash().investment = dash().investment || {};
  var arr = inv.payments = inv.payments || [];
  var item = idx >= 0 ? arr[idx] : {};
  openForm('add', [
    { id:'date', label: GN.t('date'), type:'date', value:item.date || GN.today() },
    { id:'amount', label: GN.t('amount'), type:'number', req:true, value:item.amount || 0 },
    { id:'currency', label: GN.t('currency'), value:item.currency || 'USD' },
    { id:'bank', label: GN.t('bank'), value:item.bank || '' },
    { id:'notes', label: GN.t('notes'), type:'textarea', full:true, value:item.notes || '' }
  ]);
  onSubmit(function(done){
    var v = readForm(['date','amount','currency','bank','notes']);
    if (!v.amount || Number(v.amount) <= 0){ GN.toast(GN.t('fieldRequired'), 'bad'); done(false); return; }
    var obj = { date: v.date, amount: Number(v.amount), currency: v.currency, bank: v.bank, notes: v.notes };
    if (idx >= 0) Object.assign(arr[idx], obj); else { obj.id = GN.uid(); arr.push(obj); }
    inv.recovered_total = arr.reduce(function(s, x){ return s + Number(x.amount || 0); }, 0);
    done(true);
  });
};
GN.delPayment = function(idx){
  var inv = dash().investment || {};
  var arr = inv.payments || []; if (!arr[idx]) return;
  askDelete().then(function(ok){
    if (!ok) return;
    arr.splice(idx, 1);
    inv.recovered_total = arr.reduce(function(s, x){ return s + Number(x.amount || 0); }, 0);
    save();
  });
};

GN.openFixedForm = function(key, idx){
  if (!GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  var fixed = dash().fixed_expenses = dash().fixed_expenses || { daily:[], monthly:[], yearly:[] };
  var arr = fixed[key] = fixed[key] || [];
  var item = idx >= 0 ? arr[idx] : {};
  openForm('add', [
    { id:'name', label: GN.t('name'), req:true, full:true, value:item.name || '' },
    { id:'amount', label: GN.t('amount'), type:'number', value:item.amount || 0 }
  ]);
  onSubmit(function(done){
    var v = readForm(['name','amount']);
    if (!v.name){ GN.toast(GN.t('fieldRequired'), 'bad'); done(false); return; }
    var obj = { name: v.name, amount: Number(v.amount) || 0 };
    if (idx >= 0) Object.assign(arr[idx], obj); else { obj.id = GN.uid(); arr.push(obj); }
    done(true);
  });
};
GN.delFixed = function(key, idx){
  var fixed = dash().fixed_expenses || {};
  var arr = fixed[key] || []; if (!arr[idx]) return;
  askDelete().then(function(ok){ if (!ok) return; arr.splice(idx, 1); save(); });
};
GN.renderAgentSelect = function(selectedCode){
  var agents = list('gold_agents');
  if (!agents.length){
    return '<div class="field full"><div class="input-wrap" style="background:var(--warn-l);color:var(--warn);padding:12px;font-size:12.5px">' + GN.esc(GN.t('noAgentsYet')) + '</div></div>';
  }
  var opts = '<option value="">— ' + GN.esc(GN.t('selectAgent')) + ' —</option>';
  agents.forEach(function(a){
    var sel = (a.code === selectedCode) ? ' selected' : '';
    opts += '<option value="' + GN.escAttr(a.code) + '"' +
      ' data-commission="' + (a.commission || 0) + '"' +
      ' data-bank="' + GN.escAttr(a.bank_name || '') + '"' +
      ' data-account="' + GN.escAttr(a.account_number || '') + '"' +
      ' data-phone="' + GN.escAttr(a.phone || '') + '"' +
      ' data-method="' + (a.payment_method || 'cash') + '"' +
      ' data-name="' + GN.escAttr(a.name || '') + '"' +
      sel + '>' + GN.esc(a.code + ' — ' + a.name) + '</option>';
  });
  return '<div class="field"><label>' + GN.esc(GN.t('selectAgent')) + ' <span class="req">*</span></label>' +
    '<div class="input-wrap"><select id="agent_select">' + opts + '</select></div></div>' +
    '<div class="field"><label>' + GN.esc(GN.t('agentCommission')) + ' %</label>' +
    '<div class="input-wrap"><input type="number" id="commission" step="0.01" min="0" value=""></div></div>' +
    '<div class="field full" id="agent_info_wrap" style="display:none">' +
      '<div class="agent-info-box">' +
        '<div class="agent-info-title">' + GN.esc(GN.t('agentInfoTitle')) + '</div>' +
        '<div class="agent-info-row"><span>' + GN.esc(GN.t('agentBank')) + ':</span> <b id="ai_bank">—</b></div>' +
        '<div class="agent-info-row"><span>' + GN.esc(GN.t('agentAccount')) + ':</span> <b id="ai_account" dir="ltr">—</b></div>' +
        '<div class="agent-info-row"><span>' + GN.esc(GN.t('agentPhone')) + ':</span> <b id="ai_phone" dir="ltr">—</b></div>' +
        '<div class="agent-info-row"><span>' + GN.esc(GN.t('agentMethod')) + ':</span> <b id="ai_method">—</b></div>' +
      '</div>' +
    '</div>';
};

GN.openPurchaseForm = function(idx){
  if (!GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  var arr = list('gold_purchases');
  var item = idx >= 0 ? arr[idx] : {};
  var banks = list('banks');
  var bankOptions = [{ value:'', label: '— ' + GN.t('txSelectBank') + ' —' }].concat(banks.map(function(b){
    return { value: b.id, label: b.name + ' — ' + GN.formatNum(b.balance || 0) + ' ' + (b.currency || 'SDG') };
  }));
  var hasAgent = !!(item.agent_id);

  /* Common fields */
  var commonFields = [
    { id:'date', label: GN.t('date'), type:'date', value:item.date || GN.today() },
    { id:'weight', label: GN.t('weight'), type:'number', req:true, value:item.weight || 0 },
    { id:'karat', label: GN.t('karat'), value:item.karat || '21' },
    { id:'price_per_gram', label: GN.t('pricePerGram') + ' (SDG)', type:'number', req:true, value:item.price_per_gram || 0 },
    { id:'pay_method', label: GN.t('txPaymentSource'), type:'select', options:[
      { value:'cash', label: GN.t('txPayCash') },
      { value:'bank', label: GN.t('txPayBank') }
    ], value:item.pay_method || 'cash' },
    { id:'bank_id', label: GN.t('txSelectBank'), type:'select', options:bankOptions, value:item.bank_id || '' },
    { id:'place', label: GN.t('purchasePlace'), full:true, value:item.place || '' }
  ];

  openForm('addPurchase', commonFields);

  /* After openForm, append agent section + rest */
  var body = document.getElementById('formModalBody');
  var formGrid = body.querySelector('.form-grid');
  if (!formGrid) return;

  /* Build agent section HTML */
  var agentSectionHTML =
    '<div class="field full" style="margin-top:6px"><label class="chk-label" style="cursor:pointer;display:flex;align-items:center;gap:8px">' +
      '<input type="checkbox" id="has_agent" style="width:auto"' + (hasAgent ? ' checked' : '') + '>' +
      '<span>' + GN.esc(GN.t('hasAgent')) + '</span>' +
    '</label></div>' +
    '<div id="agent_block" style="display:' + (hasAgent ? 'contents' : 'none') + '">' +
      GN.renderAgentSelect(item.agent_id || '') +
    '</div>' +
    '<div class="field full"><label>' + GN.esc(GN.t('attachment')) + ' (URL)</label>' +
      '<div class="input-wrap"><input type="url" id="attachment" dir="ltr" placeholder="https://..." value="' + GN.escAttr(item.attachment || '') + '"></div></div>' +
    '<div class="field full"><label>' + GN.esc(GN.t('notes')) + '</label>' +
      '<div class="input-wrap"><textarea id="notes" rows="3">' + GN.esc(item.notes || '') + '</textarea></div></div>';

  /* Append as new grid (or into grid) — easier: create a new form-grid below */
  var extra = document.createElement('div');
  extra.className = 'form-grid';
  extra.style.marginTop = '14px';
  extra.innerHTML = agentSectionHTML;
  formGrid.parentElement.appendChild(extra);

  /* Bind bank toggle */
  var methodEl = document.getElementById('pay_method');
  var bankField = document.getElementById('bank_id');
  if (methodEl && bankField){
    var bankWrap = bankField.parentElement.parentElement;
    bankWrap.style.display = (methodEl.value === 'bank') ? '' : 'none';
    methodEl.addEventListener('change', function(){
      bankWrap.style.display = (methodEl.value === 'bank') ? '' : 'none';
    });
  }

  /* Bind agent toggle + auto-fill */
  var chk = document.getElementById('has_agent');
  var agentBlock = document.getElementById('agent_block');
  var agentSel = document.getElementById('agent_select');
  var commEl = document.getElementById('commission');
  var infoWrap = document.getElementById('agent_info_wrap');
  var aiBank = document.getElementById('ai_bank');
  var aiAcc = document.getElementById('ai_account');
  var aiPhone = document.getElementById('ai_phone');
  var aiMethod = document.getElementById('ai_method');

  function updateAgentInfo(){
    if (!agentSel || !agentSel.value){
      if (infoWrap) infoWrap.style.display = 'none';
      return;
    }
    var opt = agentSel.options[agentSel.selectedIndex];
    var comm = opt.getAttribute('data-commission') || '0';
    var bank = opt.getAttribute('data-bank') || '—';
    var acc = opt.getAttribute('data-account') || '—';
    var phone = opt.getAttribute('data-phone') || '—';
    var method = opt.getAttribute('data-method') || 'cash';

    if (commEl && !commEl.value) commEl.value = comm;
    else if (commEl) commEl.value = comm;

    if (aiBank) aiBank.textContent = bank;
    if (aiAcc) aiAcc.textContent = acc;
    if (aiPhone) aiPhone.textContent = phone;
    if (aiMethod) aiMethod.textContent = (method === 'bank') ? GN.t('payMethodBank') : GN.t('payMethodCash');
    if (infoWrap) infoWrap.style.display = 'block';
  }

  if (chk && agentBlock){
    chk.addEventListener('change', function(){
      agentBlock.style.display = chk.checked ? 'contents' : 'none';
      if (!chk.checked){
        if (agentSel) agentSel.value = '';
        if (commEl) commEl.value = '';
        if (infoWrap) infoWrap.style.display = 'none';
      }
    });
  }
  if (agentSel){
    agentSel.addEventListener('change', updateAgentInfo);
    updateAgentInfo();
  }

  var submitBtn = document.getElementById('formModalSubmit');
  submitBtn.onclick = function(){
    var v = readForm(['date','weight','karat','price_per_gram','pay_method','bank_id','place','attachment','notes']);
    var w = Number(v.weight), ppg = Number(v.price_per_gram);
    if (!w || !ppg){ GN.toast(GN.t('fieldRequired'), 'bad'); return; }
    if (v.pay_method === 'bank' && !v.bank_id){ GN.toast(GN.t('fieldRequired'), 'bad'); return; }
    var agentCode = chk && chk.checked && agentSel ? agentSel.value : '';
    var commPct = agentCode && commEl ? (Number(commEl.value) || 0) : 0;
    if (chk && chk.checked && !agentCode){ GN.toast(GN.t('fieldRequired'), 'bad'); return; }
    var total = w * ppg;
    var comm = total * commPct / 100;
    var prevTotal = idx >= 0 ? Number(arr[idx].total || 0) : 0;
    var prevBankId = idx >= 0 ? arr[idx].bank_id : '';
    var prevMethod = idx >= 0 ? arr[idx].pay_method : '';
    var obj = {
      date: v.date, weight: w, karat: v.karat,
      price_per_gram: ppg, total: total,
      pay_method: v.pay_method, bank_id: v.bank_id || '',
      place: v.place, agent_id: agentCode,
      commission: commPct, commission_amount: comm,
      currency: 'SDG',
      attachment: v.attachment, notes: v.notes
    };
    if (idx >= 0) Object.assign(arr[idx], obj);
    else { obj.id = GN.uid(); obj.code = GN.genCode('GOLD-B', arr); arr.push(obj); }

    function reverseOld(cb){
      if (idx >= 0 && prevMethod === 'bank' && prevBankId){ GN.applyBankChange(prevBankId, prevTotal, cb); }
      else { cb(true); }
    }
    function applyNew(cb){
      if (obj.pay_method === 'bank' && obj.bank_id){ GN.applyBankChange(obj.bank_id, -total, cb); }
      else { cb(true); }
    }
    reverseOld(function(){
      applyNew(function(){
        if (idx < 0 && obj.agent_id && comm > 0){
          GN.createAgentPayable(obj, 'gold_purchase').then(function(){
            GN.toast(GN.t('payCreatedAuto'), 'ok');
            GN.closeModal('formModal');
            save();
          });
        } else {
          GN.closeModal('formModal');
          save();
        }
      });
    });
  };
};
GN.delPurchase = function(idx){
  var arr = list('gold_purchases'); if (!arr[idx]) return;
  var item = arr[idx];
  askDelete().then(function(ok){
    if (!ok) return;
    var prevTotal = Number(item.total || 0);
    var prevBankId = item.bank_id;
    var prevMethod = item.pay_method;
    arr.splice(idx, 1);
    if (prevMethod === 'bank' && prevBankId){
      GN.applyBankChange(prevBankId, prevTotal, function(){
        save();
        setTimeout(function(){ GN.loadTransactions && GN.loadTransactions(); }, 200);
      });
    } else {
      save();
      setTimeout(function(){ GN.loadTransactions && GN.loadTransactions(); }, 200);
    }
  });
};

GN.openSaleForm = function(idx){
  if (!GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  var arr = list('gold_sales');
  var purchases = list('gold_purchases');
  var item = idx >= 0 ? arr[idx] : {};
  var banks = list('banks');
  var bankOptions = [{ value:'', label: '— ' + GN.t('txSelectBank') + ' —' }].concat(banks.map(function(b){
    return { value: b.id, label: b.name + ' — ' + GN.formatNum(b.balance || 0) + ' ' + (b.currency || 'SDG') };
  }));
  var purchOptions = purchases.map(function(p){
    return { value: p.id, label: (p.code || '') + ' - ' + GN.formatNum(p.weight, 2) + 'g ' + (p.karat || '') };
  });
  var hasAgent = !!(item.agent_id);

  openForm('addSale', [
    { id:'purchase_id', label: GN.t('linkedPurchase'), type:'select', options:purchOptions, value:item.purchase_id || '' },
    { id:'date', label: GN.t('date'), type:'date', value:item.date || GN.today() },
    { id:'weight', label: GN.t('weight'), type:'number', req:true, value:item.weight || 0 },
    { id:'price_per_gram', label: GN.t('pricePerGram'), type:'number', req:true, value:item.price_per_gram || 0 },
    { id:'currency', label: GN.t('currency'), type:'select', options:[{ value:'SDG', label:'SDG' }, { value:'USD', label:'USD' }], value:item.currency || 'USD' },
    { id:'receive_method', label: GN.t('txPaymentSource'), type:'select', options:[
      { value:'cash', label: GN.t('txPayCash') },
      { value:'bank', label: GN.t('txPayBank') }
    ], value:item.receive_method || 'cash' },
    { id:'bank_id', label: GN.t('txSelectBank'), type:'select', options:bankOptions, value:item.bank_id || '' },
    { id:'buyer', label: GN.t('buyer'), value:item.buyer || '' }
  ]);

  var body = document.getElementById('formModalBody');
  var formGrid = body.querySelector('.form-grid');
  if (!formGrid) return;

  var agentSectionHTML =
    '<div class="field full" style="margin-top:6px"><label class="chk-label" style="cursor:pointer;display:flex;align-items:center;gap:8px">' +
      '<input type="checkbox" id="has_agent" style="width:auto"' + (hasAgent ? ' checked' : '') + '>' +
      '<span>' + GN.esc(GN.t('hasAgent')) + '</span>' +
    '</label></div>' +
    '<div id="agent_block" style="display:' + (hasAgent ? 'contents' : 'none') + '">' +
      GN.renderAgentSelect(item.agent_id || '') +
    '</div>' +
    '<div class="field full"><label>' + GN.esc(GN.t('attachment')) + ' (URL)</label>' +
      '<div class="input-wrap"><input type="url" id="attachment" dir="ltr" placeholder="https://..." value="' + GN.escAttr(item.attachment || '') + '"></div></div>';

  var extra = document.createElement('div');
  extra.className = 'form-grid';
  extra.style.marginTop = '14px';
  extra.innerHTML = agentSectionHTML;
  formGrid.parentElement.appendChild(extra);

  /* Bank toggle */
  var methodEl = document.getElementById('receive_method');
  var bankField = document.getElementById('bank_id');
  if (methodEl && bankField){
    var bankWrap = bankField.parentElement.parentElement;
    bankWrap.style.display = (methodEl.value === 'bank') ? '' : 'none';
    methodEl.addEventListener('change', function(){
      bankWrap.style.display = (methodEl.value === 'bank') ? '' : 'none';
    });
  }

  /* Agent toggle */
  var chk = document.getElementById('has_agent');
  var agentBlock = document.getElementById('agent_block');
  var agentSel = document.getElementById('agent_select');
  var commEl = document.getElementById('commission');
  var infoWrap = document.getElementById('agent_info_wrap');
  var aiBank = document.getElementById('ai_bank');
  var aiAcc = document.getElementById('ai_account');
  var aiPhone = document.getElementById('ai_phone');
  var aiMethod = document.getElementById('ai_method');

  function updateAgentInfo(){
    if (!agentSel || !agentSel.value){ if (infoWrap) infoWrap.style.display = 'none'; return; }
    var opt = agentSel.options[agentSel.selectedIndex];
    if (commEl) commEl.value = opt.getAttribute('data-commission') || '0';
    if (aiBank) aiBank.textContent = opt.getAttribute('data-bank') || '—';
    if (aiAcc) aiAcc.textContent = opt.getAttribute('data-account') || '—';
    if (aiPhone) aiPhone.textContent = opt.getAttribute('data-phone') || '—';
    if (aiMethod) aiMethod.textContent = (opt.getAttribute('data-method') === 'bank') ? GN.t('payMethodBank') : GN.t('payMethodCash');
    if (infoWrap) infoWrap.style.display = 'block';
  }

  if (chk && agentBlock){
    chk.addEventListener('change', function(){
      agentBlock.style.display = chk.checked ? 'contents' : 'none';
      if (!chk.checked){
        if (agentSel) agentSel.value = '';
        if (commEl) commEl.value = '';
        if (infoWrap) infoWrap.style.display = 'none';
      }
    });
  }
  if (agentSel){ agentSel.addEventListener('change', updateAgentInfo); updateAgentInfo(); }

  var submitBtn = document.getElementById('formModalSubmit');
  submitBtn.onclick = function(){
    var v = readForm(['purchase_id','date','weight','price_per_gram','currency','receive_method','bank_id','buyer','attachment']);
    var w = Number(v.weight), ppg = Number(v.price_per_gram);
    if (!w || !ppg){ GN.toast(GN.t('fieldRequired'), 'bad'); return; }
    if (v.receive_method === 'bank' && !v.bank_id){ GN.toast(GN.t('fieldRequired'), 'bad'); return; }
    var agentCode = chk && chk.checked && agentSel ? agentSel.value : '';
    var commPct = agentCode && commEl ? (Number(commEl.value) || 0) : 0;
    if (chk && chk.checked && !agentCode){ GN.toast(GN.t('fieldRequired'), 'bad'); return; }
    var total = w * ppg;
    var comm = total * commPct / 100;
    var purchase = purchases.filter(function(p){ return p.id === v.purchase_id; })[0];
    var cost = purchase ? (Number(purchase.price_per_gram || 0) * w) : 0;
    var netProfit = total - cost - comm;
    var prevTotal = idx >= 0 ? Number(arr[idx].total || 0) : 0;
    var prevBankId = idx >= 0 ? arr[idx].bank_id : '';
    var prevMethod = idx >= 0 ? arr[idx].receive_method : '';
    var obj = {
      purchase_id: v.purchase_id, purchase_code: purchase ? purchase.code : '',
      date: v.date, weight: w, price_per_gram: ppg, total: total,
      currency: v.currency, buyer: v.buyer,
      receive_method: v.receive_method, bank_id: v.bank_id || '',
      agent_id: agentCode,
      commission: commPct, commission_amount: comm,
      cost: cost, net_profit: netProfit,
      attachment: v.attachment
    };
    if (idx >= 0) Object.assign(arr[idx], obj);
    else { obj.id = GN.uid(); obj.code = GN.genCode('GOLD-S', arr); arr.push(obj); }

    function reverseOld(cb){
      if (idx >= 0 && prevMethod === 'bank' && prevBankId){ GN.applyBankChange(prevBankId, -prevTotal, cb); }
      else { cb(true); }
    }
    function applyNew(cb){
      if (obj.receive_method === 'bank' && obj.bank_id){ GN.applyBankChange(obj.bank_id, total, cb); }
      else { cb(true); }
    }
    reverseOld(function(){
      applyNew(function(){
        if (idx < 0 && obj.agent_id && comm > 0){
          GN.createAgentPayable(obj, 'gold_sale').then(function(){
            GN.toast(GN.t('payCreatedAuto'), 'ok');
            GN.closeModal('formModal');
            save();
          });
        } else {
          GN.closeModal('formModal');
          save();
        }
      });
    });
  };
};
GN.delSale = function(idx){
  var arr = list('gold_sales'); if (!arr[idx]) return;
  var item = arr[idx];
  askDelete().then(function(ok){
    if (!ok) return;
    var prevTotal = Number(item.total || 0);
    var prevBankId = item.bank_id;
    var prevMethod = item.receive_method;
    arr.splice(idx, 1);
    if (prevMethod === 'bank' && prevBankId){
      GN.applyBankChange(prevBankId, -prevTotal, function(){
        save();
        setTimeout(function(){ GN.loadTransactions && GN.loadTransactions(); }, 200);
      });
    } else {
      save();
      setTimeout(function(){ GN.loadTransactions && GN.loadTransactions(); }, 200);
    }
  });
};

GN.openAgentForm = function(idx){
  if (!GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  var arr = list('gold_agents');
  var item = idx >= 0 ? arr[idx] : {};

  openForm('add', [
    { id:'code', label: GN.t('agentId') + ' (كود فريد)', dir:'ltr', req:true, value:item.code || '' },
    { id:'name', label: GN.t('name') + ' (الاسم الكامل)', req:true, value:item.name || '' },
    { id:'type', label: GN.t('agentType'), type:'select', options:[
      { value:'buy',  label: GN.t('buyAgent') },
      { value:'sell', label: GN.t('sellAgent') }
    ], value:item.type || 'buy' },
    { id:'commission', label: GN.t('agentCommission') + ' %', type:'number', value:item.commission || 0 },
    { id:'phone', label: GN.t('payPhone'), dir:'ltr', value:item.phone || '' },
    { id:'payment_method', label: GN.t('payMethod') + ' (طريقة استلام العمولة)', type:'select', options:[
      { value:'cash', label: GN.t('payMethodCash') },
      { value:'bank', label: GN.t('payMethodBank') }
    ], value:item.payment_method || 'cash' },
    { id:'bank_name', label: GN.t('payBankName'), full:true, value:item.bank_name || '' },
    { id:'account_number', label: GN.t('payAccountNumber'), dir:'ltr', full:true, value:item.account_number || '' }
  ]);

  onSubmit(function(done){
    var v = readForm(['code','name','type','commission','phone','payment_method','bank_name','account_number']);
    if (!v.code || !v.name){ GN.toast(GN.t('fieldRequired'), 'bad'); done(false); return; }
    if (v.payment_method === 'bank' && (!v.bank_name || !v.account_number)){
      GN.toast('البنك ورقم الحساب مطلوبان لطريقة الحوالة البنكية', 'bad');
      done(false); return;
    }
    var obj = {
      code: v.code, name: v.name, type: v.type,
      commission: Number(v.commission) || 0,
      phone: v.phone || '',
      payment_method: v.payment_method || 'cash',
      bank_name: v.bank_name || '',
      account_number: v.account_number || ''
    };
    if (idx >= 0) Object.assign(arr[idx], obj);
    else { obj.id = GN.uid(); arr.push(obj); }
    done(true);
  });
};
GN.delAgent = function(idx){
  var arr = list('gold_agents'); if (!arr[idx]) return;
  askDelete().then(function(ok){ if (ok){ arr.splice(idx, 1); save(); } });
};

GN.exportTxExcel = function(){
  var arr = list('transactions');
  var rows = [['Date','Type','Description','Amount','Currency','Attachment']];
  arr.forEach(function(t){ rows.push([t.date, t.type, t.description, t.amount, t.currency, t.attachment || '']); });
  GN.downloadCSV('transactions-' + GN.today() + '.csv', rows);
  GN.toast(GN.t('success'), 'ok');
};

GN.exportTransfersExcel = function(){
  var arr = list('transfers');
  var rows = [['Date','Type','Party','Amount','Currency','Invoice','Notes']];
  arr.forEach(function(t){ rows.push([t.date, t.type, t.party, t.amount, t.currency, t.invoice, t.notes]); });
  GN.downloadCSV('transfers-' + GN.today() + '.csv', rows);
  GN.toast(GN.t('success'), 'ok');
};

GN.exportGoldExcel = function(){
  var rows = [['Type','Code','Date','Weight','Karat','Price/G','Total','Currency','Agent','Profit']];
  list('gold_purchases').forEach(function(p){ rows.push(['Purchase', p.code, p.date, p.weight, p.karat, p.price_per_gram, p.total, p.currency, p.agent_id, '']); });
  list('gold_sales').forEach(function(s){ rows.push(['Sale', s.code, s.date, s.weight, '', s.price_per_gram, s.total, s.currency, s.agent_id, s.net_profit]); });
  GN.downloadCSV('gold-trading-' + GN.today() + '.csv', rows);
  GN.toast(GN.t('success'), 'ok');
};

/* ===== SUGGESTIONS ===== */
GN.sections.suggestions = function(){
  if (!GN.session.isLogged){
    return '<div class="card"><div class="empty"><div class="ic">' + GN.navIcon('vote') + '</div><h4>' + GN.esc(GN.t('sugNoSuggestions')) + '</h4></div></div>';
  }
  var html = '<div class="sug-toolbar"><button class="btn btn-pri" data-act="add-suggestion">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg> ' +
    GN.esc(GN.t('addSuggestion')) + '</button></div>';
  html += '<div class="sug-list" id="sugList"><div class="empty"><div class="ic">' + GN.navIcon('vote') + '</div><h4>' + GN.esc(GN.t('loading')) + '</h4></div></div>';
  setTimeout(GN.loadSuggestions, 100);
  return html;
};

GN.loadSuggestions = function(){
  if (!GN.supa) return;
  var box = document.getElementById('sugList'); if (!box) return;
  GN.supa.from('suggestions').select('*').order('created_at', { ascending: false }).then(function(res){
    if (res.error){ console.error('[sug]', res.error); box.innerHTML = '<div class="empty"><h4>خطأ</h4></div>'; return; }
    GN.supa.from('profiles').select('id', { count: 'exact', head: true }).eq('status', 'allowed').then(function(cRes){
      GN._totalUsers = (cRes && cRes.count) || 0;
      GN.renderSuggestions(res.data || []);
    });
  });
};

GN.renderSuggestions = function(arr){
  var box = document.getElementById('sugList'); if (!box) return;
  if (!arr.length){
    box.innerHTML = '<div class="card"><div class="empty"><div class="ic">' + GN.navIcon('vote') + '</div><h4>' + GN.esc(GN.t('sugNoSuggestions')) + '</h4><p>' + GN.esc(GN.t('sugAddFirst')) + '</p></div></div>';
    return;
  }
  var currentId = GN.session.user ? GN.session.user.id : null;
  var isOwner = GN.session.isOwner;
  var totalUsers = GN._totalUsers || 0;
  var regular = [], voting = [];
  arr.forEach(function(s){ if ((s.type || 'suggestion') === 'vote') voting.push(s); else regular.push(s); });
  function sortDesc(a){ return a.slice().sort(function(x, y){ return (y.created_at || '').localeCompare(x.created_at || ''); }); }
  function renderCard(s){
    var votes = s.votes || {};
    var yes = [], no = [], abstain = [];
    Object.keys(votes).forEach(function(uid){
      var v = votes[uid]; if (!v || !v.vote) return;
      if (v.vote === 'yes') yes.push(v.name || '?');
      else if (v.vote === 'no') no.push(v.name || '?');
      else if (v.vote === 'abstain') abstain.push(v.name || '?');
    });
    var myVote = currentId && votes[currentId] ? votes[currentId].vote : '';
    var canDelete = isOwner;
    var totalVotes = yes.length + no.length + abstain.length;
    var isVote = (s.type === 'vote');
    var isApproved = isVote && totalUsers > 0 && yes.length === totalUsers && yes.length === totalVotes;
    var delBtn = canDelete
      ? '<button class="sug-del-btn" data-sug-del="' + GN.escAttr(s.id) + '" title="' + GN.escAttr(GN.t('delete')) + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M8 6V4h8v2M6 6v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6"/></svg></button>'
      : '';
    var badge = '';
    if (isApproved){ badge = '<span class="sug-badge approved"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M20 6 9 17l-5-5"/></svg>' + GN.esc(GN.t('sugApproved')) + '</span>'; }
    else if (isVote){ badge = '<span class="sug-badge pending">' + GN.esc(GN.t('sugPending')) + '</span>'; }
    var segmented = isVote
      ? '<div class="segmented"><button class="seg-btn yes' + (myVote === 'yes' ? ' active' : '') + '" data-vote="yes" data-vote-id="' + GN.escAttr(s.id) + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M20 6 9 17l-5-5"/></svg><b class="num">' + yes.length + '</b></button>' +
        '<button class="seg-btn no' + (myVote === 'no' ? ' active' : '') + '" data-vote="no" data-vote-id="' + GN.escAttr(s.id) + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg><b class="num">' + no.length + '</b></button>' +
        '<button class="seg-btn abstain' + (myVote === 'abstain' ? ' active' : '') + '" data-vote="abstain" data-vote-id="' + GN.escAttr(s.id) + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M5 12h14"/></svg><b class="num">' + abstain.length + '</b></button></div>'
      : '';
    var votersHtml = '';
    if (totalVotes > 0){
      votersHtml = '<div class="sug-voters">' +
        '<div class="sug-voters-group"><span class="sug-voters-lbl yes">✓ ' + GN.esc(GN.t('sugVoteYes')) + ' (' + yes.length + ')</span>' +
        '<ul>' + yes.map(function(n){ return '<li class="yes">' + GN.esc(n) + '</li>'; }).join('') + '</ul></div>' +
        (no.length ? '<div class="sug-voters-group"><span class="sug-voters-lbl no">✗ ' + GN.esc(GN.t('sugVoteNo')) + ' (' + no.length + ')</span>' +
          '<ul>' + no.map(function(n){ return '<li class="no">' + GN.esc(n) + '</li>'; }).join('') + '</ul></div>' : '') +
        (abstain.length ? '<div class="sug-voters-group"><span class="sug-voters-lbl abstain">– ' + GN.esc(GN.t('sugVoteAbstain')) + ' (' + abstain.length + ')</span>' +
          '<ul>' + abstain.map(function(n){ return '<li class="abstain">' + GN.esc(n) + '</li>'; }).join('') + '</ul></div>' : '') +
      '</div>';
    }
    return '<div class="sug-card' + (isVote ? ' is-vote' : ' is-regular') + (isApproved ? ' approved' : '') + '" data-sug-id="' + GN.escAttr(s.id) + '">' +
      '<div class="sug-card-head" data-sug-toggle="' + GN.escAttr(s.id) + '">' +
        (badge ? '<div class="sug-badge-row">' + badge + '</div>' : '') +
        '<h3>' + GN.esc(s.title || '') + '</h3>' +
        '<div class="sug-meta-row">' +
          '<span class="sug-author">' + GN.navIcon('team') + GN.esc(s.created_by_name || '-') + '</span>' +
          '<span class="sug-date">' + GN.esc(GN.formatDateTime(s.created_at)) + '</span>' + delBtn +
        '</div>' + segmented +
        '<div class="sug-chevron"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="m6 9 6 6 6-6"/></svg></div>' +
      '</div>' +
      '<div class="sug-card-body"><div class="sug-body-inner">' +
        '<div class="sug-desc-label">' + GN.esc(GN.t('sugDesc')) + '</div>' +
        '<div class="sug-desc">' + GN.esc(s.description || '-') + '</div>' + votersHtml +
      '</div></div></div>';
  }
  box.innerHTML = '<div class="sug-columns">' +
    '<div class="sug-col sug-col-regular">' + (sortDesc(regular).map(renderCard).join('') || '<div class="sug-col-empty">' + GN.esc(GN.t('sugNoSuggestions')) + '</div>') + '</div>' +
    '<div class="sug-col sug-col-vote">' + (sortDesc(voting).map(renderCard).join('') || '<div class="sug-col-empty">' + GN.esc(GN.t('sugNoSuggestions')) + '</div>') + '</div>' +
  '</div>';
  GN.$$('[data-sug-toggle]').forEach(function(head){
    head.addEventListener('click', function(e){
      if (e.target.closest('[data-vote-id]')) return;
      if (e.target.closest('[data-sug-del]')) return;
      var card = head.closest('.sug-card');
      if (card) card.classList.toggle('open');
    });
  });
  GN.$$('[data-vote-id]').forEach(function(btn){
    btn.addEventListener('click', function(e){ e.stopPropagation(); GN.voteSuggestion(btn.getAttribute('data-vote-id'), btn.getAttribute('data-vote')); });
  });
  GN.$$('[data-sug-del]').forEach(function(btn){
    btn.addEventListener('click', function(e){ e.stopPropagation(); GN.deleteSuggestion(btn.getAttribute('data-sug-del')); });
  });
};

GN.openSuggestionForm = function(){
  if (!GN.session.isLogged){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  if (!GN.supa){ GN.toast('لا يوجد اتصال', 'bad'); return; }
  var body = document.getElementById('formModalBody');
  var titleEl = document.getElementById('formModalTitle');
  if (!body || !titleEl) return;
  titleEl.textContent = GN.t('addSuggestion');
  body.innerHTML = '<div class="form-grid">' +
    '<div class="field full"><label>' + GN.esc(GN.t('sugType')) + ' <span class="req">*</span></label>' +
      '<div class="input-wrap"><select id="sugType"><option value="suggestion">' + GN.esc(GN.t('sugTypeNormal')) + '</option><option value="vote">' + GN.esc(GN.t('sugTypeVote')) + '</option></select></div></div>' +
    '<div class="field full"><label>' + GN.esc(GN.t('sugNewTitle')) + ' <span class="req">*</span></label>' +
      '<div class="input-wrap"><input type="text" id="sugTitle" maxlength="140"></div></div>' +
    '<div class="field full"><label>' + GN.esc(GN.t('sugDesc')) + ' <span class="req">*</span></label>' +
      '<div class="input-wrap"><textarea id="sugDesc" rows="7" maxlength="4000"></textarea></div></div>' +
  '</div>';
  GN.openModal('formModal');
  var submitBtn = document.getElementById('formModalSubmit');
  submitBtn.onclick = function(){
    var type = document.getElementById('sugType').value;
    var t = document.getElementById('sugTitle').value.trim();
    var dsc = document.getElementById('sugDesc').value.trim();
    if (!t || !dsc){ GN.toast(GN.t('fieldRequired'), 'bad'); return; }
    var u = GN.session.user;
    var p = GN.session.profile;
    submitBtn.disabled = true;
    GN.supa.from('suggestions').insert({
      type: type, title: t, description: dsc,
      created_by: u.id,
      created_by_name: (p && (p.full_name || p.email)) || u.email || 'User',
      votes: {}
    }).select().then(function(res){
      submitBtn.disabled = false;
      if (res.error){ console.error(res.error); GN.toast(res.error.message, 'bad'); return; }
      GN.toast(GN.t('addedSuccess'), 'ok');
      GN.closeModal('formModal');
      GN.loadSuggestions();
    });
  };
};

GN.voteSuggestion = function(id, vote){
  if (!GN.session.isLogged){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  if (!GN.supa) return;
  var u = GN.session.user;
  var p = GN.session.profile;
  if (!u) return;
  GN.supa.from('suggestions').select('votes').eq('id', id).single().then(function(res){
    if (res.error){ GN.toast(res.error.message, 'bad'); return; }
    var votes = res.data.votes || {};
    if (votes[u.id] && votes[u.id].vote === vote){ delete votes[u.id]; }
    else { votes[u.id] = { vote: vote, name: (p && (p.full_name || p.email)) || u.email || 'User', date: GN.now() }; }
    GN.supa.from('suggestions').update({ votes: votes }).eq('id', id).then(function(res2){
      if (res2.error){ GN.toast(res2.error.message, 'bad'); return; }
      GN.toast(GN.t('sugSaved'), 'ok');
      GN.loadSuggestions();
    });
  });
};

GN.deleteSuggestion = function(id){
  if (!GN.session.isLogged){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  if (!GN.supa) return;
  GN.confirm({ title: GN.t('delete'), text: GN.t('sugDeleteConfirm'), okText: GN.t('delete'), cancelText: GN.t('cancel'), danger: true }).then(function(ok){
    if (!ok) return;
    GN.supa.from('suggestions').delete().eq('id', id).then(function(res){
      if (res.error){ GN.toast(res.error.message, 'bad'); return; }
      GN.toast(GN.t('deletedSuccess'), 'ok');
      GN.loadSuggestions();
    });
  });
};

GN.bindSection.suggestions = function(){
  GN.bindAction('add-suggestion', function(){ GN.openSuggestionForm(); });
};
/* ============================================================
   PHASE 5 — Payables: Add + Pay
   ============================================================ */

/* Override: markPayablePaid */
GN.markPayablePaid = function(id){
  if (!GN.session.isOwner || !GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  var banks = list('banks');
  var bankOptions = '';
  if (!banks.length){
    bankOptions = '<option value="">' + GN.esc(GN.t('payNoBanks')) + '</option>';
  } else {
    bankOptions = '<option value="">' + GN.esc(GN.t('paySelectBank')) + '</option>' +
      banks.map(function(b){
        return '<option value="' + GN.escAttr(b.id) + '">' + GN.esc(b.name) + ' — ' + GN.formatNum(b.balance || 0) + ' ' + GN.esc(b.currency || 'SDG') + '</option>';
      }).join('');
  }

  var body = document.getElementById('formModalBody');
  var titleEl = document.getElementById('formModalTitle');
  if (!body || !titleEl) return;
  titleEl.textContent = GN.t('payMarkPaid');

  body.innerHTML = '<div class="form-grid">' +
    '<div class="field full"><label>' + GN.esc(GN.t('payTransferNumber')) + ' <span class="req">*</span></label>' +
      '<div class="input-wrap"><input type="text" id="pp_transfer" dir="ltr" placeholder="مثال: TRF-12345"></div></div>' +
    '<div class="field full"><label>' + GN.esc(GN.t('payInvoiceUrl')) + '</label>' +
      '<div class="input-wrap"><input type="url" id="pp_invoice" dir="ltr" placeholder="https://..."></div></div>' +
    '<div class="field full"><label>' + GN.esc(GN.t('paySelectBank')) + ' <span class="req">*</span></label>' +
      '<div class="input-wrap"><select id="pp_bank">' + bankOptions + '</select></div></div>' +
    '<div class="field full"><label>' + GN.esc(GN.t('payPaidAt')) + '</label>' +
      '<div class="input-wrap"><input type="date" id="pp_date" value="' + GN.today() + '"></div></div>' +
  '</div>';

  GN.openModal('formModal');

  var submitBtn = document.getElementById('formModalSubmit');
  submitBtn.onclick = function(){
    var transfer = document.getElementById('pp_transfer').value.trim();
    var invoice = document.getElementById('pp_invoice').value.trim();
    var bankId = document.getElementById('pp_bank').value;
    var payDate = document.getElementById('pp_date').value;

    if (!transfer){ GN.toast(GN.t('payTransferRequired'), 'bad'); return; }
    if (!bankId){ GN.toast(GN.t('payBankRequired'), 'bad'); return; }

    submitBtn.disabled = true;
    GN.supa.from('payment_orders').select('*').eq('id', id).single().then(function(res){
      if (res.error){ submitBtn.disabled = false; GN.toast(res.error.message, 'bad'); return; }
      var p = res.data;
      var amt = Number(p.amount_sdg || p.amount || 0);
      var bk = banks.filter(function(x){ return x.id === bankId; })[0];

      GN.supa.from('payment_orders').update({
        status: 'paid',
        paid_at: payDate ? (payDate + 'T00:00:00Z') : new Date().toISOString(),
        paid_by: GN.session.user.id,
        transfer_number: transfer,
        invoice_url: invoice,
        bank_id: bankId,
        bank_name: bk ? bk.name : '',
        updated_at: new Date().toISOString()
      }).eq('id', id).then(function(r2){
        submitBtn.disabled = false;
        if (r2.error){ GN.toast(r2.error.message, 'bad'); return; }
        GN.applyBankChange(bankId, -amt, function(){
          GN.toast(GN.t('payPaid_msg'), 'ok');
          GN.closeModal('formModal');
          GN.loadPayables();
        });
      });
    });
  };
};

/* Open Payable Form */
GN.openPayableForm = function(item){
  if (!GN.session.isOwner || !GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  var isEdit = !!item;
  var t = item || {
    type: 'other',
    payment_method: 'bank',
    amount: 0,
    currency: 'SDG',
    due_date: GN.today()
  };

  var banks = list('banks');
  var bankOptions = '';
  if (!banks.length){ bankOptions = '<option value="">' + GN.esc(GN.t('payNoBanks')) + '</option>'; }
  else {
    bankOptions = '<option value="">' + GN.esc(GN.t('paySelectBank')) + '</option>' +
      banks.map(function(b){ return '<option value="' + GN.escAttr(b.id) + '">' + GN.esc(b.name) + '</option>'; }).join('');
  }

  function opt(list, sel){
    return list.map(function(o){
      return '<option value="' + GN.escAttr(o.value) + '"' + (o.value === sel ? ' selected' : '') + '>' + GN.esc(o.label) + '</option>';
    }).join('');
  }

  var body = document.getElementById('formModalBody');
  var titleEl = document.getElementById('formModalTitle');
  if (!body || !titleEl) return;
  titleEl.textContent = isEdit ? GN.t('payEdit') : GN.t('payAdd');

  body.innerHTML = '<div class="form-grid">' +
    '<div class="field full"><label>' + GN.esc(GN.t('payType')) + ' <span class="req">*</span></label>' +
      '<div class="input-wrap"><select id="pf_type">' +
        opt([
          { value:'agent',     label: GN.t('payTypeAgent') },
          { value:'vendor',    label: GN.t('payTypeVendor') },
          { value:'salary',    label: GN.t('payTypeSalary') },
          { value:'operating', label: GN.t('payTypeOperating') },
          { value:'tax',       label: GN.t('payTypeTax') },
          { value:'other',     label: GN.t('payTypeOther') }
        ], t.type) +
      '</select></div></div>' +
    '<div class="field full"><label>' + GN.esc(GN.t('payBeneficiaryName')) + ' <span class="req">*</span></label>' +
      '<div class="input-wrap"><input type="text" id="pf_name" value="' + GN.escAttr(t.beneficiary_name || '') + '"></div></div>' +
    '<div class="field"><label>' + GN.esc(GN.t('payBankName')) + '</label>' +
      '<div class="input-wrap"><input type="text" id="pf_bank_name" value="' + GN.escAttr(t.beneficiary_bank || '') + '"></div></div>' +
    '<div class="field"><label>' + GN.esc(GN.t('payAccountNumber')) + '</label>' +
      '<div class="input-wrap"><input type="text" id="pf_account" dir="ltr" value="' + GN.escAttr(t.beneficiary_account || '') + '"></div></div>' +
    '<div class="field"><label>' + GN.esc(GN.t('payPhone')) + '</label>' +
      '<div class="input-wrap"><input type="tel" id="pf_phone" dir="ltr" value="' + GN.escAttr(t.beneficiary_phone || '') + '"></div></div>' +
    '<div class="field"><label>' + GN.esc(GN.t('payMethod')) + '</label>' +
      '<div class="input-wrap"><select id="pf_method">' +
        opt([{ value:'bank', label: GN.t('payMethodBank') }, { value:'cash', label: GN.t('payMethodCash') }], t.payment_method) +
      '</select></div></div>' +
    '<div class="field"><label>' + GN.esc(GN.t('payAmount')) + ' <span class="req">*</span></label>' +
      '<div class="input-wrap"><input type="number" id="pf_amount" step="0.01" min="0" value="' + (t.amount || '') + '"></div></div>' +
    '<div class="field"><label>' + GN.esc(GN.t('payCurrency')) + '</label>' +
      '<div class="input-wrap"><select id="pf_currency">' +
        opt([{ value:'SDG', label:'SDG' }, { value:'USD', label:'USD' }], t.currency) +
      '</select></div></div>' +
    '<div class="field"><label>' + GN.esc(GN.t('payExchangeRate')) + '</label>' +
      '<div class="input-wrap"><input type="number" id="pf_rate" step="0.01" min="0" value="' + (t.exchange_rate || '') + '"></div></div>' +
    '<div class="field"><label>' + GN.esc(GN.t('payDueDate')) + '</label>' +
      '<div class="input-wrap"><input type="date" id="pf_due" value="' + GN.escAttr(t.due_date || GN.today()) + '"></div></div>' +
    '<div class="field full"><label>' + GN.esc(GN.t('notes')) + '</label>' +
      '<div class="input-wrap"><textarea id="pf_notes" rows="3">' + GN.esc(t.notes || '') + '</textarea></div></div>' +
  '</div>';

  GN.openModal('formModal');
  var submitBtn = document.getElementById('formModalSubmit');
  submitBtn.onclick = function(){
    var name = document.getElementById('pf_name').value.trim();
    var amount = Number(document.getElementById('pf_amount').value) || 0;
    if (!name || amount <= 0){ GN.toast(GN.t('fieldRequired'), 'bad'); return; }
    var cur = document.getElementById('pf_currency').value;
    var rate = Number(document.getElementById('pf_rate').value) || 0;
    var amountSdg = cur === 'USD' ? (rate > 0 ? amount * rate : null) : amount;

    var data = {
      type: document.getElementById('pf_type').value,
      beneficiary_name: name,
      beneficiary_bank: document.getElementById('pf_bank_name').value.trim(),
      beneficiary_account: document.getElementById('pf_account').value.trim(),
      beneficiary_phone: document.getElementById('pf_phone').value.trim(),
      payment_method: document.getElementById('pf_method').value,
      amount: amount,
      currency: cur,
      exchange_rate: rate || null,
      amount_sdg: amountSdg,
      due_date: document.getElementById('pf_due').value || null,
      notes: document.getElementById('pf_notes').value.trim(),
      updated_at: new Date().toISOString()
    };

    submitBtn.disabled = true;
    var promise;
    if (isEdit){
      promise = GN.supa.from('payment_orders').update(data).eq('id', t.id);
    } else {
      var yr = new Date().getFullYear();
      data.code = 'PAY-' + yr + '-' + String(Date.now()).slice(-4);
      data.status = 'pending';
      data.linked_source = 'manual';
      data.created_by = GN.session.user.id;
      data.created_by_name = (GN.session.profile && (GN.session.profile.full_name || GN.session.profile.email)) || '';
      promise = GN.supa.from('payment_orders').insert(data);
    }
    promise.then(function(res){
      submitBtn.disabled = false;
      if (res.error){ GN.toast(res.error.message, 'bad'); return; }
      GN.toast(GN.t('paySaved'), 'ok');
      GN.closeModal('formModal');
      GN.loadPayables();
    });
  };
};

/* Override bindSection.payables (from Phase 4) */
GN.bindSection.payables = function(){
  GN.bindAction('pay-add', function(){
    if (!GN.session.isOwner || !GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
    GN.openPayableForm(null);
  });
};
/* Auto-create agent payable on gold transaction */
GN.createAgentPayable = function(source, sourceType){
  var agentId = source.agent_id;
  console.log('[pay auto] محاولة إنشاء استحقاق — agent_id:', agentId);

  if (!agentId){
    console.log('[pay auto] ❌ لا يوجد agent_id');
    return Promise.resolve(null);
  }
  var commAmount = Number(source.commission_amount || 0);
  console.log('[pay auto] عمولة:', commAmount);

  if (commAmount <= 0){
    console.log('[pay auto] ❌ العمولة صفر — تأكد من تعبئة حقل "نسبة العمولة"');
    return Promise.resolve(null);
  }

  var agents = list('gold_agents');
  console.log('[pay auto] المناديب المتاحون:', agents.map(function(a){ return a.code + ' - ' + a.name; }));

  var agent = agents.filter(function(a){
    return a.code === agentId || a.id === agentId || a.name === agentId;
  })[0];

  if (!agent){
    console.log('[pay auto] ❌ لم يُعثر على المندوب بكود:', agentId);
    return Promise.resolve(null);
  }

  console.log('[pay auto] ✅ مندوب موجود:', agent.name);

  var p = GN.session.profile;
  var code = 'PAY-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-4);

  return GN.supa.from('payment_orders').insert({
    code: code,
    type: 'agent',
    beneficiary_name: agent.name || '',
    beneficiary_bank: agent.bank_name || '',
    beneficiary_account: agent.account_number || '',
    beneficiary_phone: agent.phone || '',
    payment_method: agent.payment_method || 'cash',
    amount: commAmount,
    currency: 'SDG',
    amount_sdg: commAmount,
    due_date: null,
    status: 'pending',
    linked_source: sourceType,
    linked_id: source.id || '',
    linked_desc: source.code || '',
    notes: 'عمولة مندوب — ' + (source.code || ''),
    created_by: GN.session.user.id,
    created_by_name: (p && (p.full_name || p.email)) || ''
  }).select().then(function(res){
    if (res.error){ console.error('[pay auto] ❌ خطأ قاعدة البيانات:', res.error); return null; }
    console.log('[pay auto] ✅ تم إنشاء الاستحقاق:', res.data[0].code);
    return res.data && res.data[0];
  });
};

console.log('[Gold Nile] dashboard.js part 2 of 2 loaded');
})();
