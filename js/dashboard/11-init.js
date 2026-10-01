/* ============================================================
   Gold Nile — Dashboard / Init & Lifecycle
   Boot · Logout · Refresh · Mode toggle · Drawer · Polling
   ============================================================ */
(function(){
'use strict';

var GN = window.GN = window.GN || {};

/* ============================================================
   Logout
   ============================================================ */
GN.initLogout = function(){
  var el1 = document.getElementById('logoutBtnSide');
  var el2 = document.getElementById('userChip');

  function doLogout(){
    GN.confirm({
      title: GN.t('logout'),
      text: 'هل تريد تسجيل الخروج؟',
      okText: GN.t('logout'),
      cancelText: GN.t('cancel'),
      danger: false
    }).then(function(ok){
      if (!ok) return;
      GN.logout().then(function(){ window.location.reload(); });
    });
  }

  if (el1) el1.addEventListener('click', doLogout);
  if (el2) el2.addEventListener('click', doLogout);
};

/* ============================================================
   Refresh
   ============================================================ */
GN.initRefresh = function(){
  var btn = document.getElementById('refreshBtn');
  if (btn) btn.addEventListener('click', function(){
    GN.showLoading();
    GN.reloadDashboard().then(function(){
      GN.hideLoading();
      GN.toast(GN.t('updatedSuccess'), 'ok');
    });
  });
};

GN.reloadDashboard = function(){
  return GN.loadPublicData().then(function(data){
    GN.dash.data = GN.normalizeData(data);
    GN.dash.notifs = (GN.dash.data.dashboard && GN.dash.data.dashboard.notifications) || [];

    GN.renderUserChip();
    GN.renderSidebar();
    GN.renderNotifications();
    GN.renderSection(GN.dash.current);

    /* Start polling after first load */
    GN.notify.initPolling();

    return true;
  });
};

/* ============================================================
   Dashboard Init
   ============================================================ */
GN.initDashboard = function(){
  GN.renderUserChip();
  GN.renderSidebar();
  GN.renderCrumbDate();
  GN.initNotifications();
  GN.initLogout();
  GN.initRefresh();

  /* Mobile menu button → drawer */
  var mobileBtn = document.getElementById('mobileMenuBtn');
  if (mobileBtn){
    mobileBtn.addEventListener('click', function(e){
      e.stopPropagation();
      GN.toggleDrawer();
    });
  }

  /* Drawer overlay closes on click */
  var overlay = document.getElementById('drawerOverlay');
  if (overlay){
    overlay.addEventListener('click', function(){
      GN.closeDrawer();
    });
  }

  /* Close modals when clicking backdrop */
  GN.$$('.overlay').forEach(function(ov){
    ov.addEventListener('click', function(e){
      if (e.target === ov) GN.closeModal(ov.id);
    });
  });

  /* Close buttons inside modals */
  GN.$$('[data-close-modal]').forEach(function(btn){
    btn.addEventListener('click', function(){
      GN.closeModal(btn.getAttribute('data-close-modal'));
    });
  });

  /* Escape key closes modals + drawer */
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape'){
      GN.closeAllModals();
      GN.closeDrawer();
    }
  });

  /* Mode toggle button (owner only) */
  (function initModeToggle(){
    var btn = document.getElementById('modeToggleBtn');
    if (!btn) return;
    if (GN.session.isOwner) btn.hidden = false;
    else { btn.hidden = true; return; }

    function syncBtn(){
      if (GN.session.isAdmin){
        btn.title = 'تبديل إلى وضع القارئ';
        btn.classList.add('active-admin');
      } else {
        btn.title = 'تبديل إلى وضع الأدمن';
        btn.classList.remove('active-admin');
      }
    }
    syncBtn();

    btn.addEventListener('click', function(){
      var on = GN.toggleAdminMode();
      if (on){ GN.enableAdminEditing(); GN.toast('وضع الأدمن مفعّل ✓', 'ok'); }
      else   { GN.disableAdminEditing(); GN.toast('وضع القارئ مفعّل'); }
      syncBtn();
      GN.renderSidebar();
      GN.renderUserChip();
      GN.renderSection(GN.dash.current);
    });
  })();

  return GN.reloadDashboard();
};
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
console.log('[Gold Nile] dashboard/11-init.js loaded');
console.log('[Gold Nile] dashboard modules — ALL LOADED ✓');
})();