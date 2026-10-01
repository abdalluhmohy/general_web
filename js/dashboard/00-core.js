/* ============================================================
   Gold Nile — Dashboard / Core
   State · NavGroups · Helpers · Sidebar · Drawer · Home
   ============================================================ */
(function(){
'use strict';

var GN = window.GN = window.GN || {};

/* ============================================================
   State (يُحافظ عليه إن وُجد)
   ============================================================ */
if (!GN.dash) {
  GN.dash = { current: 'home', data: null, notifs: [] };
}
if (!GN.sections)    GN.sections = {};
if (!GN.bindSection) GN.bindSection = {};

/* ============================================================
   Nav groups
   ============================================================ */
GN.navGroups = [
  { title: 'groupMain', items: [
    { key:'home',        icon:'home',  label:'navHome' },
    { key:'suggestions', icon:'vote',  label:'navSuggestions' }
  ]},
  { title: 'groupFinance', items: [
    { key:'finance',  icon:'dollar', label:'navFinance' },
    { key:'banking',  icon:'bank',   label:'navBanking' },
    { key:'gold',     icon:'gold',   label:'navGold' },
    { key:'payables', icon:'wallet', label:'navPayables' }
  ]},
  { title: 'groupHR', items: [
    { key:'hr',    icon:'team',  label:'navHR' },
    { key:'tasks', icon:'check', label:'navTasks' }
  ]},
  { title: 'groupOps', items: [
    { key:'equipment', icon:'tool', label:'navEquipment' },
    { key:'docs',      icon:'file', label:'navDocs' }
  ]},
  { title: 'groupAdmin', items: [
    { key:'website',  icon:'file', label:'navWebsite',  ownerOnly:true, adminOnly:true },
    { key:'users',    icon:'lock', label:'navUsers',    ownerOnly:true, adminOnly:true },
    { key:'settings', icon:'cog',  label:'navSettings', ownerOnly:true, adminOnly:true }
  ]}
];

/* ============================================================
   Nav icons
   ============================================================ */
GN.navIcon = function(name){
  var icons = {
    home:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="m3 11 9-8 9 8v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2v-9Z"/></svg>',
    dollar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    bank:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><rect x="3" y="7" width="18" height="13" rx="2.5"/><path d="M3 11h18M7 15h2M12 15h5"/></svg>',
    gold:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M7 3h10l2 6H5l2-6Z"/><path d="M5 9v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9"/><path d="M9 14h6"/></svg>',
    team:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5"/><circle cx="17" cy="9" r="2.5"/></svg>',
    check:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
    tool:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M14.7 6.3a4 4 0 1 0 5 5L21 12l-9 9-3-3 9-9-1.3-1.3Z"/><path d="M6 6l3 3"/></svg>',
    file:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>',
    lock:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><rect x="4" y="10" width="16" height="10" rx="2.5"/><path d="M8 10V7a4 4 0 1 1 8 0v3"/></svg>',
    wallet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><rect x="2" y="6" width="20" height="14" rx="3"/><path d="M2 10h20M16 14h2"/><path d="M6 6V5a2 2 0 0 1 2-2h10"/></svg>',
    vote:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M9 18h6M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.4 1 1.1 1 1.8V17h6v-.5c0-.7.4-1.4 1-1.8A7 7 0 0 0 12 2Z"/></svg>',
    chart:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M3 3v18h18"/><path d="m7 14 4-4 4 4 6-6"/></svg>',
    cog:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>'
  };
  return icons[name] || icons.home;
};

/* ============================================================
   Shared icons
   ============================================================ */
GN.ICO_EDIT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';
GN.ICO_DEL  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M8 6V4h8v2M6 6v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6M10 11v6M14 11v6"/></svg>';
GN.ICO_VIEW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>';

/* ============================================================
   Shared helpers (GN.dh.*)
   ============================================================ */
GN.dh = {
  d: function(){
    return GN.dash.data || {};
  },
  dash: function(){
    if (!GN.dash.data) GN.dash.data = {};
    if (!GN.dash.data.dashboard) GN.dash.data.dashboard = {};
    return GN.dash.data.dashboard;
  },
  list: function(name){
    var dt = GN.dh.dash();
    if (!dt[name]) dt[name] = [];
    return dt[name];
  },
  settings: function(){
    if (!GN.dash.data) GN.dash.data = {};
    if (!GN.dash.data.settings) GN.dash.data.settings = {};
    return GN.dash.data.settings;
  },
  currency: function(){
    return GN.dh.settings().currency || 'USD';
  },
  save: function(){
    return GN.savePublicData(GN.dash.data).then(function(ok){
      if (ok){
        GN.toast(GN.t('savedSuccess'), 'ok');
        GN.renderSection(GN.dash.current);
      } else {
        GN.toast(GN.t('saveFailed'), 'bad');
      }
      return ok;
    });
  },
  askDelete: function(){
    return GN.confirm({
      title: GN.t('confirmDelete'),
      text: GN.t('confirmDeleteNote'),
      okText: GN.t('delete'),
      cancelText: GN.t('cancel'),
      danger: true
    });
  },
  sectionActions: function(arr){
    return '<div class="row-actions">' + arr.map(function(a){
      return '<button class="icon-act' + (a.danger ? ' del' : '') + '" data-act="' + a.act + '"' +
        (a.idx != null ? ' data-idx="' + a.idx + '"' : '') +
        (a.key ? ' data-key="' + a.key + '"' : '') +
        ' title="' + GN.escAttr(a.title || '') + '">' + a.icon + '</button>';
    }).join('') + '</div>';
  },
  actions: function(arr){
    return '<div class="row-actions">' + arr.map(function(x){
      return '<button class="icon-act' + (x.danger ? ' del' : '') + '" data-act="' + x.act + '" data-idx="' + x.idx + '" title="' + GN.escAttr(x.title) + '">' + x.icon + '</button>';
    }).join('') + '</div>';
  }
};

/* ============================================================
   Drawer (mobile)
   ============================================================ */
GN.openDrawer = function(){
  var side = document.getElementById('dashSide');
  var overlay = document.getElementById('drawerOverlay');
  if (side) side.classList.add('open');
  if (overlay) overlay.classList.add('on');
  document.body.style.overflow = 'hidden';
  document.body.classList.add('drawer-open');
};

GN.closeDrawer = function(){
  var side = document.getElementById('dashSide');
  var overlay = document.getElementById('drawerOverlay');
  if (side) side.classList.remove('open');
  if (overlay) overlay.classList.remove('on');
  document.body.style.overflow = '';
  document.body.classList.remove('drawer-open');
};

GN.toggleDrawer = function(){
  var side = document.getElementById('dashSide');
  if (!side) return;
  if (side.classList.contains('open')) GN.closeDrawer();
  else GN.openDrawer();
};

/* ============================================================
   Sidebar
   ============================================================ */
GN.renderSidebar = function(){
  var nav = document.getElementById('sideNav');
  if (!nav) return;
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
      html += '<a class="nav-link' + on + '" data-nav="' + it.key + '">' +
        GN.navIcon(it.icon) +
        ' <span data-i18n="' + it.label + '">' + GN.esc(GN.t(it.label)) + '</span></a>';
    });
    html += '</div>';
  });
  nav.innerHTML = html;
  GN.$$('.nav-link[data-nav]').forEach(function(link){
    link.addEventListener('click', function(){
      GN.goTo(link.getAttribute('data-nav'));
      if (window.innerWidth <= 960) GN.closeDrawer();
    });
  });
};

/* القائمة السفلية ملغاة */
GN.renderBottomNav = function(){ /* no-op */ };

/* ============================================================
   User chip
   ============================================================ */
GN.renderUserChip = function(){
  var p = GN.session.profile;
  if (!p) return;

  var isOwnerAdmin = (p.role === 'owner' && GN.session.isAdmin);
  var realName = p.full_name || p.email || 'User';
  var initial = GN.initial(realName);
  var roleLabel = p.role === 'owner'
    ? (GN.session.isAdmin ? GN.t('roleAdmin') : GN.t('roleReader'))
    : GN.t('roleReader');

  var chipDisplayName = isOwnerAdmin ? (GN.t('roleAdmin') || 'أدمن') : realName;

  var sideAv   = document.getElementById('sideUserAv');
  var sideName = document.getElementById('sideUserName');
  var sideRole = document.getElementById('sideUserRole');
  if (sideAv)   sideAv.textContent = initial;
  if (sideName) sideName.textContent = chipDisplayName;
  if (sideRole) sideRole.textContent = roleLabel;

  var chipAv   = document.getElementById('userChipAv');
  var chipName = document.getElementById('userChipName');
  var chipRole = document.getElementById('userChipRole');
  if (chipAv)   chipAv.textContent = initial;
  if (chipName) chipName.textContent = chipDisplayName;
  if (chipRole){
    chipRole.textContent = roleLabel;
    chipRole.classList.toggle('admin', !!GN.session.isAdmin);
  }

  var welcomeEl = document.getElementById('crumbWelcome');
  if (welcomeEl) welcomeEl.textContent = 'مرحبًا، ' + realName + ' 👋';
};

/* ============================================================
   Navigation
   ============================================================ */
GN.goTo = function(key){
  GN.dash.current = key;
  GN.$$('.nav-link[data-nav]').forEach(function(l){
    l.classList.toggle('on', l.getAttribute('data-nav') === key);
  });

  var titleKey = null;
  GN.navGroups.forEach(function(g){
    g.items.forEach(function(it){
      if (it.key === key) titleKey = it.label;
    });
  });
  var titleEl = document.getElementById('crumbTitle');
  if (titleEl && titleKey) titleEl.textContent = GN.t(titleKey);

  GN.renderSection(key);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

GN.renderSection = function(key){
  var content = document.getElementById('dashContent');
  if (!content) return;
  var fn = GN.sections[key];
  if (typeof fn !== 'function'){
    content.innerHTML = '<div class="empty"><h4>—</h4><p>' + GN.esc(GN.t('noData')) + '</p></div>';
    return;
  }
  content.innerHTML = fn();
  if (typeof GN.bindSection[key] === 'function') GN.bindSection[key]();
};

GN.bindAction = function(act, fn){
  GN.$$('[data-act="' + act + '"]').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.preventDefault();
      fn(btn, e);
    });
  });
};

/* ============================================================
   Home section
   ============================================================ */
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

  html += '<div class="card"><div class="card-head">' +
    '<h3>' + GN.navIcon('dollar') + ' ' + GN.esc(GN.t('investmentTitle')) + '</h3>' +
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
      '<th>' + GN.esc(GN.t('bankName')) + '</th>' +
      '<th>' + GN.esc(GN.t('accountNumber')) + '</th>' +
      '<th>' + GN.esc(GN.t('balance')) + '</th></tr></thead><tbody>';
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
/* ============================================================
   Render crumb date (اليوم → التاريخ الفعلي)
   ============================================================ */
GN.renderCrumbDate = function(){
  var el = document.getElementById('crumbSub');
  if (!el) return;
  try {
    var now = new Date();
    var lang = GN.lang || 'ar';
    var loc = lang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB';
    el.textContent = now.toLocaleDateString(loc, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (e) {
    el.textContent = GN.today();
  }
};
console.log('[Gold Nile] dashboard/00-core.js loaded');
})();