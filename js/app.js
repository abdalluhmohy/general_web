/* Gold Nile - App v1.0.0 · Entry point */
(function(){
  'use strict';

  var GN = window.GN = window.GN || {};

  /* ============================================================
     Show / hide screens
     ============================================================ */
 GN.showPublic = function(){
  var pub = document.getElementById('publicSite');
  var dash = document.getElementById('dashboard');
  if (pub) pub.hidden = false;
  if (dash) dash.hidden = true;
  document.body.classList.remove('admin-on');
  document.body.classList.add('public-view');
};

GN.showDashboard = function(){
  var pub = document.getElementById('publicSite');
  var dash = document.getElementById('dashboard');
  if (pub) pub.hidden = true;
  if (dash) dash.hidden = false;
  document.body.classList.remove('public-view');
};

  GN.hideSplash = function(){
    var s = document.getElementById('splash');
    if (!s) return;
    s.classList.add('hide');
    setTimeout(function(){
      if (s.parentNode) s.parentNode.removeChild(s);
    }, 600);
  };

  /* ============================================================
     Login flow
     ============================================================ */
  GN.initLoginForm = function(){
    var form = document.getElementById('loginModal');
    var submit = document.getElementById('loginSubmit');
    var email = document.getElementById('loginEmail');
    var pw = document.getElementById('loginPassword');
    var msg = document.getElementById('loginMsg');
    var eye = document.getElementById('togglePassword');
    var forgot = document.getElementById('forgotLink');
    var stepLogin = document.getElementById('stepLogin');
    var stepRole = document.getElementById('stepRole');

    /* Open login modal */
    GN.$$('[data-open-login]').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.preventDefault();
        if (stepLogin) stepLogin.style.display = 'block';
        if (stepRole) stepRole.classList.remove('on');
        if (msg) msg.textContent = '';
        GN.openModal('loginModal');
        setTimeout(function(){ if (email) email.focus(); }, 200);
      });
    });

    /* Close buttons */
    GN.$$('[data-close-modal="loginModal"]').forEach(function(btn){
      btn.addEventListener('click', function(){ GN.closeModal('loginModal'); });
    });

    /* Toggle password */
    if (eye) {
      eye.addEventListener('click', function(){
        if (pw) pw.type = pw.type === 'password' ? 'text' : 'password';
      });
    }

    /* Forgot password */
    if (forgot) {
      forgot.addEventListener('click', function(e){
        e.preventDefault();
        GN.toast(GN.t('contactOwner'), 'ok');
      });
    }

    /* Submit login */
    if (submit) {
      submit.addEventListener('click', function(){
        var em = email ? email.value.trim() : '';
        var pwd = pw ? pw.value : '';
        if (!em || !pwd) {
          if (msg) msg.textContent = GN.t('fieldRequired');
          return;
        }
        if (msg) { msg.textContent = GN.t('loading'); msg.classList.remove('ok'); }
        submit.disabled = true;

        GN.login(em, pwd).then(function(res){
          submit.disabled = false;
          if (!res.ok) {
            if (msg) msg.textContent = GN.errorMessage(res.error);
            return;
          }

          /* Owner: show role choice */
          if (GN.session.isOwner) {
            if (stepLogin) stepLogin.style.display = 'none';
            if (stepRole) stepRole.classList.add('on');
            if (msg) msg.textContent = '';
          } else {
            /* Reader: enter dashboard directly */
            GN.closeModal('loginModal');
            GN.enterDashboard(false);
          }
        });
      });
    }

    /* Role choice */
    GN.$$('.role-card[data-role]').forEach(function(card){
      card.addEventListener('click', function(){
        var role = card.getAttribute('data-role');
        var isAdmin = role === 'admin';
        GN.closeModal('loginModal');
        GN.enterDashboard(isAdmin);
      });
    });

    /* Enter key */
    if (pw) {
      pw.addEventListener('keydown', function(e){
        if (e.key === 'Enter') { e.preventDefault(); if (submit) submit.click(); }
      });
    }
    if (email) {
      email.addEventListener('keydown', function(e){
        if (e.key === 'Enter') { e.preventDefault(); if (pw) pw.focus(); }
      });
    }
  };

  /* ============================================================
     Enter dashboard
     ============================================================ */
  GN.enterDashboard = function(asAdmin){
    GN.showDashboard();
    if (asAdmin && GN.session.isOwner) {
      GN.setAdminMode(true);
      GN.enableAdminEditing();
    } else {
      GN.setAdminMode(false);
      GN.disableAdminEditing();
    }
    GN.initDashboard().then(function(){
      GN.toast(GN.t('loginSuccess') + ' · ' + (GN.session.profile && GN.session.profile.full_name || ''), 'ok');
    });
  };

  /* ============================================================
     Load and show public site
     ============================================================ */
  GN.enterPublic = function(){
    GN.showPublic();
    GN.initPublicSite();
    return GN.loadPublicData().then(function(data){
      var normalized = GN.normalizeData(data);
      GN.renderPublicPage(normalized);
      GN.applyTranslations();
      return normalized;
    });
  };

  /* ============================================================
     Boot
     ============================================================ */
  GN.boot = function(){
    GN.applyTranslations();

    /* Bootstrap auth first */
    GN.bootstrapAuth().then(function(res){
      if (res.ok) {
        /* Logged in: show dashboard */
        setTimeout(function(){
          GN.hideSplash();
          GN.showDashboard();
          GN.initDashboard();
        }, 400);
      } else {
        /* Not logged in: show public site */
        setTimeout(function(){
          GN.hideSplash();
          GN.enterPublic();
        }, 400);
      }
      /* Always bind login form */
      GN.initLoginForm();
    }).catch(function(err){
      console.error('[app] boot error:', err);
      GN.hideSplash();
      GN.enterPublic();
      GN.initLoginForm();
    });
  };

  /* ============================================================
     Global error handler
     ============================================================ */
  window.addEventListener('error', function(e){
    console.error('[global error]', e.message, e.filename, e.lineno);
  });
  window.addEventListener('unhandledrejection', function(e){
    console.error('[unhandled promise]', e.reason);
  });

  /* ============================================================
     Language toggle
     ============================================================ */
  GN.toggleLang = function(){
    GN.setLang(GN.lang === 'ar' ? 'en' : 'ar');
    GN.applyTranslations();

    /* Re-render sections if dashboard is active */
    var dash = document.getElementById('dashboard');
    if (dash && !dash.hidden) {
      GN.renderSidebar();
      GN.renderBottomNav();
      GN.renderSection(GN.dash.current);
      GN.renderUserChip();
      GN.renderNotifications();
    }

    /* Re-render public page if visible */
    var pub = document.getElementById('publicSite');
    if (pub && !pub.hidden && GN.publicData) {
      GN.renderPublicPage(GN.publicData);
    }
        /* Update crumb date */
    if (typeof GN.renderCrumbDate === 'function') GN.renderCrumbDate();
  };

  /* ============================================================
     Ready
     ============================================================ */
  GN.ready(function(){
    /* Small delay to make sure all scripts loaded */
    setTimeout(GN.boot, 100);
  });

  console.log('[Gold Nile] app.js loaded — v' + ((window.GN_CONFIG && window.GN_CONFIG.VERSION) || '1.0.0'));

})();