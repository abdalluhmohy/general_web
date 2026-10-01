/* ============================================================
   Gold Nile — Dashboard / Website Management
   Board · Articles · Social · Contact tabs
   ============================================================ */
(function(){
'use strict';

var GN = window.GN = window.GN || {};

/* ============================================================
   Website Section
   ============================================================ */
GN.websiteTab = 'board';

GN.sections.website = function(){
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

/* ============================================================
   Board
   ============================================================ */
GN.renderWebsiteBoard = function(){
  var list_ = GN.dash.data && Array.isArray(GN.dash.data.board) ? GN.dash.data.board : [];
  var isAdmin = GN.session.isOwner && GN.session.isAdmin;

  var html = '';
  html += '<div class="fin-head"><div>' +
    '<h2>' + GN.navIcon('team') + ' ' + GN.esc(GN.t('webTabBoard')) + '</h2>' +
    '<span class="sub">' + GN.esc(GN.t('webBoardCount')) + ': ' + list_.length + '</span></div>' +
    (isAdmin
      ? '<button class="btn btn-pri btn-sm" data-act="web-board-add">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg> ' +
          GN.esc(GN.t('boardAddMember')) + '</button>'
      : '') +
  '</div>';

  if (!list_.length){
    html += '<div class="card"><div class="empty"><div class="ic">' + GN.navIcon('team') + '</div>' +
      '<h4>' + GN.esc(GN.t('boardEmpty')) + '</h4>' +
      '<p>' + GN.esc(GN.t('webBoardAddFirst')) + '</p></div></div>';
    return html;
  }

  var sorted = list_.map(function(m, i){ return { m: m, i: i }; }).sort(function(a, b){
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
  GN.$$('[data-web-tab]').forEach(function(btn){
    btn.addEventListener('click', function(){
      GN.websiteTab = btn.getAttribute('data-web-tab');
      GN.renderSection('website');
    });
  });

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
      if (link) link.href = val || '#';
    });

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
   Board Form
   ============================================================ */
GN.openWebsiteBoardForm = function(idx){
  if (!GN.session.isOwner){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  if (!GN.dash.data.public) GN.dash.data.public = {};
  if (!Array.isArray(GN.dash.data.board)) GN.dash.data.board = [];
  var list_ = GN.dash.data.board;

  var isEdit = idx >= 0;
  var item = isEdit ? list_[idx] : { name:'', role:'', subtitle:'', quote:'', photo:'', flag:'sd', order:'' };

  var body = document.getElementById('formModalBody');
  var titleEl = document.getElementById('formModalTitle');
  if (!body || !titleEl) return;
  titleEl.textContent = isEdit ? GN.t('boardEditMember') : GN.t('boardAddMember');

  function opt(list_, sel){
    return list_.map(function(o){
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

  var sub = document.getElementById('formModalSubmit');
  if (sub) sub.style.display = '';

  GN.openModal('formModal');

  var submitBtn = document.getElementById('formModalSubmit');
  submitBtn.onclick = function(){
    var name = document.getElementById('wb_name').value.trim();
    if (!name){ GN.toast(GN.t('fieldRequired'), 'bad'); return; }

    var obj = {
      id: isEdit ? list_[idx].id : GN.uid(),
      name: name,
      role: document.getElementById('wb_role').value.trim(),
      subtitle: document.getElementById('wb_subtitle').value.trim(),
      flag: document.getElementById('wb_flag').value,
      order: document.getElementById('wb_order').value ? Number(document.getElementById('wb_order').value) : '',
      photo: document.getElementById('wb_photo').value.trim(),
      quote: document.getElementById('wb_quote').value.trim()
    };

    if (isEdit) list_[idx] = obj;
    else list_.push(obj);

    submitBtn.disabled = true;
    GN.savePublicData(GN.dash.data).then(function(ok){
      submitBtn.disabled = false;
      if (ok){
        GN.toast(isEdit ? GN.t('savedSuccess') : GN.t('addedSuccess'), 'ok');
        if (!isEdit){
          GN.notify.send({
            type:'add', section:'website', target:'board', target_id: obj.id,
            title: GN.t('notifAdd') + ' · ' + GN.t('webTabBoard'),
            body: GN.t('boardAddMember') + ': ' + name
          });
        }
        GN.closeModal('formModal');
        GN.renderSection('website');
      } else {
        GN.toast(GN.t('saveFailed'), 'bad');
      }
    });
  };
};

/* ============================================================
   Articles
   ============================================================ */
GN.renderWebsiteArticles = function(){
  if (!Array.isArray(GN.dash.data.news)) GN.dash.data.news = [];
  var list_ = GN.dash.data.news;
  var sorted = list_.slice().sort(function(a, b){
    return (b.date || '').localeCompare(a.date || '');
  });

  var html = '';
  html += '<div class="fin-head"><div>' +
    '<h2>' + GN.navIcon('file') + ' ' + GN.esc(GN.t('webTabArticles')) + '</h2>' +
    '<span class="sub">' + GN.esc(GN.t('newsCount')) + ': ' + list_.length + '</span></div>' +
    '<button class="btn btn-pri btn-sm" data-act="web-news-add">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg> ' +
      GN.esc(GN.t('newsAddNew')) + '</button></div>';

  if (!list_.length){
    html += '<div class="card"><div class="empty">' +
      '<div class="ic">' + GN.navIcon('file') + '</div>' +
      '<h4>' + GN.esc(GN.t('newsEmpty2')) + '</h4>' +
      '<p>' + GN.esc(GN.t('newsEmptyHint')) + '</p></div></div>';
    return html;
  }

  html += '<div class="web-board-grid" style="grid-template-columns:repeat(auto-fill,minmax(320px,1fr))">';
  sorted.forEach(function(n){
    var realIdx = list_.indexOf(n);
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

GN.openWebsiteArticleForm = function(idx){
  if (!GN.session.isOwner || !GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  if (!Array.isArray(GN.dash.data.news)) GN.dash.data.news = [];
  var list_ = GN.dash.data.news;

  var isEdit = idx >= 0;
  var item = isEdit ? list_[idx] : { title:'', text:'', image:'', date: GN.today() };

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

  var sub = document.getElementById('formModalSubmit');
  if (sub) sub.style.display = '';

  GN.openModal('formModal');

  var submitBtn = document.getElementById('formModalSubmit');
  submitBtn.onclick = function(){
    var title = document.getElementById('wn_title').value.trim();
    var text = document.getElementById('wn_text').value.trim();
    if (!title || !text){ GN.toast(GN.t('fieldRequired'), 'bad'); return; }

    var obj = {
      id: isEdit ? list_[idx].id : GN.uid(),
      title: title,
      text: text,
      image: document.getElementById('wn_image').value.trim(),
      date: document.getElementById('wn_date').value || GN.today()
    };

    if (isEdit) list_[idx] = obj;
    else list_.unshift(obj);

    submitBtn.disabled = true;
    GN.savePublicData(GN.dash.data).then(function(ok){
      submitBtn.disabled = false;
      if (ok){
        GN.toast(isEdit ? GN.t('savedSuccess') : GN.t('addedSuccess'), 'ok');
        if (!isEdit){
          GN.notify.send({
            type:'add', section:'website', target:'article', target_id: obj.id,
            title: GN.t('notifAdd') + ' · ' + GN.t('webTabArticles'),
            body: GN.t('newsAddNew') + ': ' + title
          });
        }
        GN.closeModal('formModal');
        GN.renderSection('website');
      } else {
        GN.toast(GN.t('saveFailed'), 'bad');
      }
    });
  };
};

/* ============================================================
   Social
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

console.log('[Gold Nile] dashboard/07-website.js loaded');
})();