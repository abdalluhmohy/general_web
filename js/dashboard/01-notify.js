/* ============================================================
   Gold Nile — Dashboard / Notifications v6 (final merged)
   - Works for Owner, Admin, Reader
   - Saves read state via { notifOnly: true }
   ============================================================ */
(function(){
'use strict';

var GN = window.GN = window.GN || {};
GN.notify = GN.notify || {};
GN.notify.showAll = false;

/* ============================================================
   Send
   ============================================================ */
GN.notify.send = function(params){
  if (!GN.dash.data) return null;
  if (!GN.dash.data.dashboard) GN.dash.data.dashboard = {};
  var notifs = GN.dash.data.dashboard.notifications;
  if (!Array.isArray(notifs)) notifs = GN.dash.data.dashboard.notifications = [];

  var u = GN.session.user;
  var p = GN.session.profile;

  var n = {
    id: GN.uid(),
    type: params.type || 'info',
    section: params.section || '',
    target: params.target || '',
    target_id: params.target_id || '',
    title: params.title || '',
    body: params.body || '',
    date: GN.now(),
    created_by: u ? u.id : null,
    created_by_name: p ? (p.full_name || p.email) : '',
    read_by: {},
    deleted: false
  };

  notifs.unshift(n);
  GN.dash.data.dashboard.notifications = notifs.slice(0, 100);
  GN.dash.notifs = GN.dash.data.dashboard.notifications;

  GN.savePublicData(GN.dash.data);
  GN.renderNotifications();
  return n;
};

/* ============================================================
   Mark deleted
   ============================================================ */
GN.notify.markDeleted = function(section, target, target_id){
  if (!GN.dash.data || !GN.dash.data.dashboard) return;
  var notifs = GN.dash.data.dashboard.notifications || [];
  var changed = false;
  notifs.forEach(function(n){
    if (n.section === section &&
        n.target === target &&
        String(n.target_id) === String(target_id)){
      n.deleted = true;
      changed = true;
    }
  });
  if (changed){
    GN.dash.notifs = notifs;
    GN.savePublicData(GN.dash.data);
    GN.renderNotifications();
  }
};

/* ============================================================
   Mark read (single) — internal
   ============================================================ */
GN.notify._markRead = function(id){
  if (!GN.dash.data || !GN.dash.data.dashboard) return false;
  var u = GN.session.user;
  if (!u) return false;

  var notifs = GN.dash.data.dashboard.notifications || [];
  var n = null;
  for (var i = 0; i < notifs.length; i++){
    if (notifs[i].id === id){ n = notifs[i]; break; }
  }
  if (!n) return false;

  if (!n.read_by) n.read_by = {};
  n.read_by[u.id] = GN.now();
  return true;
};

/* ============================================================
   Mark read + save (works for all roles)
   ============================================================ */
GN.notify.markRead = function(id){
  if (!GN.notify._markRead(id)) return false;
  try { GN.savePublicData(GN.dash.data, { notifOnly: true }); } catch (e) {}
  return true;
};

/* ============================================================
   Mark all read
   ============================================================ */
GN.notify.markAllRead = function(){
  var u = GN.session.user;
  if (!u) return;
  if (!GN.dash.data || !GN.dash.data.dashboard) return;
  var notifs = GN.dash.data.dashboard.notifications || [];
  notifs.forEach(function(n){
    if (!n.read_by) n.read_by = {};
    n.read_by[u.id] = GN.now();
  });
  try { GN.savePublicData(GN.dash.data, { notifOnly: true }); } catch (e) {}
  GN.renderNotifications();
};

/* ============================================================
   Unread count
   ============================================================ */
GN.notify.unreadCount = function(){
  var u = GN.session.user;
  if (!u) return 0;
  var notifs = (GN.dash.data && GN.dash.data.dashboard && GN.dash.data.dashboard.notifications) || [];
  return notifs.filter(function(n){
    if (n.deleted) return false;
    return !(n.read_by && n.read_by[u.id]);
  }).length;
};

/* ============================================================
   Flash element
   ============================================================ */
GN.notify.flash = function(selector){
  var el = document.querySelector(selector);
  if (!el) return;
  el.classList.add('notif-flash');
  try { el.scrollIntoView({ behavior:'smooth', block:'center' }); } catch (e) {}
  setTimeout(function(){ el.classList.remove('notif-flash'); }, 2600);
};

/* ============================================================
   Close panel
   ============================================================ */
GN.notify.closePanel = function(){
  var panel = document.getElementById('notifPanel');
  if (panel) panel.classList.remove('on');
};

/* ============================================================
   Click handler
   ============================================================ */
GN.notify.onClick = function(id){
  if (!id) return;

  var d = GN.dash.data;
  if (!d || !d.dashboard) return;
  var notifs = d.dashboard.notifications || [];
  var n = null;
  for (var i = 0; i < notifs.length; i++){
    if (notifs[i].id === id){ n = notifs[i]; break; }
  }
  if (!n) return;

  /* 1) علّم كمقروء + احفظ */
  GN.notify.markRead(id);

  /* 2) إذا العنصر محذوف */
  if (n.deleted){
    GN.toast(GN.t('notifItemDeleted') || 'تم حذف العنصر من قبل الإدارة', 'bad');
    GN.notify.closePanel();
    GN.renderNotifications();
    return;
  }

  /* 3) أغلق اللوحة */
  GN.notify.closePanel();

  /* 4) أعد الرسم فورًا */
  GN.renderNotifications();

  /* 5) انقل للقسم */
  if (n.section && GN.sections[n.section]){
    setTimeout(function(){ GN.goTo(n.section); }, 80);
  }

  /* 6) وميض الهدف */
  if (n.target_id){
    setTimeout(function(){
      GN.notify.flash('[data-notif-id="' + n.target_id + '"]');
    }, 700);
  }
};

/* ============================================================
   Render
   ============================================================ */
GN.renderNotifications = function(){
  var listEl = document.getElementById('notifList');
  var badge = document.getElementById('notifBadge');
  if (!listEl) return;

  var allNotifs = (GN.dash.data && GN.dash.data.dashboard && GN.dash.data.dashboard.notifications) || [];
  var u = GN.session.user;

  var visible = allNotifs.filter(function(n){
    if (!u) return true;
    var isRead = n.read_by && n.read_by[u.id];
    if (GN.notify.showAll) return true;
    return !isRead;
  });

  var unread = 0;
  allNotifs.forEach(function(n){
    if (n.deleted) return;
    if (!u || !(n.read_by && n.read_by[u.id])) unread++;
  });

  if (badge){
    if (unread > 0){
      badge.hidden = false;
      badge.textContent = unread > 99 ? '99+' : String(unread);
    } else {
      badge.hidden = true;
    }
  }

  var toolbarHTML =
    '<div class="notif-toolbar">' +
      '<div class="notif-toolbar-left">' +
        '<span class="notif-count-badge">' + (unread > 0 ? unread : '0') + '</span>' +
        '<span class="notif-count-lbl">' + (unread > 0 ? 'غير مقروء' : 'لا جديد') + '</span>' +
      '</div>' +
      '<div class="notif-toolbar-right">' +
        '<button class="notif-tb-btn" data-notif-toggle-all type="button">' +
          (GN.notify.showAll ? 'غير المقروء' : 'الكل') +
        '</button>' +
        (unread > 0 ? '<button class="notif-tb-btn primary" data-notif-mark-all type="button">✓ الكل</button>' : '') +
      '</div>' +
    '</div>';

  var bodyHTML;

  if (!visible.length){
    bodyHTML = '<div class="notif-empty">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">' +
        '<path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>' +
        '<path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>' +
      '</svg>' +
      '<h4>لا توجد إشعارات</h4>' +
      '<p>' + (GN.notify.showAll ? 'لم تُستلم أي إشعارات بعد' : 'كل الإشعارات مقروءة ✓') + '</p>' +
    '</div>';
  } else {
    bodyHTML = visible.slice(0, 50).map(function(n){
      var isRead = u && n.read_by && n.read_by[u.id];
      var iconCls = n.type === 'delete' ? 'out' : (n.type === 'add' ? 'in' : 'info');

      var iconSvg;
      if (n.type === 'delete'){
        iconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M3 6h18M8 6V4h8v2M6 6v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6"/></svg>';
      } else if (n.type === 'add'){
        iconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';
      } else if (n.type === 'edit'){
        iconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';
      } else {
        iconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>';
      }

      var initial = GN.initial(n.created_by_name || '?');

      return '<div class="notif-item' + (isRead ? '' : ' unread') + (n.deleted ? ' deleted' : '') + '" data-notif-click="' + GN.escAttr(n.id) + '" role="button" tabindex="0">' +
        '<div class="notif-icon ' + iconCls + '">' + iconSvg + '</div>' +
        '<div class="notif-content">' +
          '<div class="notif-row-top">' +
            '<span class="notif-title">' + GN.esc(n.title || '') + '</span>' +
            '<span class="notif-time">' + GN.esc(GN.relativeTime(n.date)) + '</span>' +
          '</div>' +
          '<p class="notif-body">' + GN.esc(n.body || '') + '</p>' +
          '<div class="notif-row-bot">' +
            '<span class="notif-avatar">' + GN.esc(initial) + '</span>' +
            '<span class="notif-sender">' + GN.esc(n.created_by_name || '') + '</span>' +
          '</div>' +
        '</div>' +
        (n.deleted ? '<span class="notif-del-badge">محذوف</span>' : '') +
      '</div>';
    }).join('');
  }

  listEl.innerHTML = toolbarHTML + bodyHTML;
};

/* ============================================================
   Global click delegation
   ============================================================ */
(function bindGlobalNotifClick(){
  if (GN.notify._globalBound) return;
  GN.notify._globalBound = true;

  document.addEventListener('click', function(e){
    var target = e.target;
    if (!target || !target.closest) return;

    var item = target.closest('[data-notif-click]');
    if (item){
      e.preventDefault();
      e.stopPropagation();
      GN.notify.onClick(item.getAttribute('data-notif-click'));
      return;
    }

    var toggle = target.closest('[data-notif-toggle-all]');
    if (toggle){
      e.preventDefault();
      e.stopPropagation();
      GN.notify.showAll = !GN.notify.showAll;
      GN.renderNotifications();
      return;
    }

    var markAll = target.closest('[data-notif-mark-all]');
    if (markAll){
      e.preventDefault();
      e.stopPropagation();
      GN.notify.markAllRead();
      GN.toast('تم تعليم الكل كمقروء ✓', 'ok');
      return;
    }
  }, true);
})();

/* ============================================================
   Init bell button
   ============================================================ */
GN.initNotifications = function(){
  var btn = document.getElementById('notifBtn');
  var close = document.getElementById('notifClose');
  var panel = document.getElementById('notifPanel');

  if (btn) btn.addEventListener('click', function(e){
    e.stopPropagation();
    if (!panel) return;
    if (panel.classList.contains('on')){
      panel.classList.remove('on');
    } else {
      GN.notify.showAll = false;
      panel.classList.add('on');
      GN.renderNotifications();
    }
  });

  if (close) close.addEventListener('click', function(){
    if (panel) panel.classList.remove('on');
  });

  document.addEventListener('click', function(e){
    if (!panel || !panel.classList.contains('on')) return;
    if (window.innerWidth <= 960) return;
    if (panel.contains(e.target)) return;
    if (btn && btn.contains(e.target)) return;
    panel.classList.remove('on');
  });
};

/* ============================================================
   Polling
   ============================================================ */
GN.notify.initPolling = function(){
  if (GN.notify._pollingStarted) return;
  GN.notify._pollingStarted = true;

  setInterval(function(){
    if (!GN.session.isLogged) return;
    GN.loadPublicData().then(function(data){
      if (!data) return;
      var newNotifs = (data.dashboard && data.dashboard.notifications) || [];
      var oldNotifs = (GN.dash.data && GN.dash.data.dashboard && GN.dash.data.dashboard.notifications) || [];
      if (newNotifs.length !== oldNotifs.length){
        GN.dash.data.dashboard.notifications = newNotifs;
        GN.dash.notifs = newNotifs;
        GN.renderNotifications();
      }
    });
  }, 30000);
};

/* ============================================================
   Legacy
   ============================================================ */
GN.pushNotification = function(notif){
  return GN.notify.send({
    type: notif.type || 'info',
    title: notif.title || '',
    body: notif.body || ''
  });
};

console.log('[Gold Nile] dashboard/01-notify.js loaded');
})();