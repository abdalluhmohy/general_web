/* Gold Nile - Public Site v1.0.0
   يحتوي على:
   - تحميل وحفظ بيانات الموقع العام
   - عرض الخدمات، المزايا، مجلس الإدارة، الأخبار
   - تعديل المحتوى المباشر (contenteditable) للمالك
   - إدارة الروابط الاجتماعية وبيانات التواصل
   ============================================================ */
(function(){
  'use strict';

  var GN = window.GN = window.GN || {};

  /* ============================================================
     Public data container
     ============================================================ */
  GN.publicData = null;

  /* ============================================================
     Load data from dashboard_state
     ============================================================ */
  GN.loadPublicData = function(){
    if (!GN.supa) return Promise.resolve(null);
    return GN.supa
      .from('dashboard_state')
      .select('data_json,updated_at')
      .eq('id', 1)
      .maybeSingle()
      .then(function(res){
        if (res.error) { console.error('[public] load:', res.error); return null; }
        if (!res.data || !res.data.data_json) return null;
        return res.data.data_json;
      });
  };

  /* ============================================================
     Save data back to dashboard_state (owner + admin only)
     ============================================================ */
  GN.savePublicData = function(data, opts){
    opts = opts || {};
    if (!GN.supa) return Promise.resolve(false);

    /* مسار خاص لتعليم الإشعارات كمقروءة (يُسمح للقرّاء) */
    if (opts.notifOnly){
      if (!GN.session.isLogged) return Promise.resolve(false);
    } else {
      /* المسار العادي: المالك + الأدمن فقط */
      if (!GN.session.isOwner) return Promise.resolve(false);
      if (!GN.session.isAdmin) return Promise.resolve(false);
    }

    return GN.supa
      .from('dashboard_state')
      .upsert({
        id: 1,
        data_json: data,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })
      .then(function(res){
        if (res.error) { console.error('[public] save:', res.error); return false; }
        return true;
      });
};

  /* ============================================================
     Merge with defaults
     ============================================================ */
  GN.normalizeData = function(data){
    var def = GN.clone(window.GN_DEFAULT_DATA || {});
    if (!data) return def;
    return GN.mergeDeep(def, data);
  };

  /* ============================================================
     Apply public page content
     ============================================================ */
  GN.renderPublicPage = function(data){
    if (!data) return;
    GN.publicData = data;

    var pub = data.public || {};

    /* Brand */
    GN.applyEditable('public.brand.name', pub.brand && pub.brand.name);
    GN.applyEditable('public.brand.tagline', pub.brand && pub.brand.tagline);

    /* Hero */
    if (pub.hero) {
      GN.applyEditable('public.hero.kicker', pub.hero.kicker);
      GN.applyEditableHTML('public.hero.title', pub.hero.title);
      GN.applyEditable('public.hero.lead', pub.hero.lead);
      GN.applyEditable('public.hero.cta1', pub.hero.cta1);
      GN.applyEditable('public.hero.cta2', pub.hero.cta2);
    }

    /* Vision */
    if (pub.vision) {
      GN.applyEditable('public.vision.tag', pub.vision.tag);
      GN.applyEditable('public.vision.title', pub.vision.title);
      GN.applyEditableHTML('public.vision.text', pub.vision.text);
    }

    /* Section headers */
    if (pub.services) {
      GN.applyEditable('public.services.tag', pub.services.tag);
      GN.applyEditable('public.services.title', pub.services.title);
      GN.applyEditable('public.services.sub', pub.services.sub);
    }
    if (pub.advantages) {
      GN.applyEditable('public.advantages.tag', pub.advantages.tag);
      GN.applyEditable('public.advantages.title', pub.advantages.title);
    }
    if (pub.board) {
      GN.applyEditable('public.board.tag', pub.board.tag);
      GN.applyEditable('public.board.title', pub.board.title);
      GN.applyEditable('public.board.sub', pub.board.sub);
    }
    if (pub.news) {
      GN.applyEditable('public.news.tag', pub.news.tag);
      GN.applyEditable('public.news.title', pub.news.title);
      GN.applyEditable('public.news.sub', pub.news.sub);
    }
    if (pub.social) {
      GN.applyEditable('public.social.title', pub.social.title);
      GN.applyEditable('public.social.sub', pub.social.sub);
    }
    if (pub.contact) {
      GN.applyEditable('public.contact.tag', pub.contact.tag);
      GN.applyEditable('public.contact.title', pub.contact.title);
      GN.applyEditable('public.contact.sub', pub.contact.sub);
    }
    if (pub.cta) {
      GN.applyEditable('public.cta.title', pub.cta.title);
      GN.applyEditable('public.cta.text', pub.cta.text);
      GN.applyEditable('public.cta.btn', pub.cta.btn);
    }
    if (pub.footer) {
      GN.applyEditable('public.footer.about', pub.footer.about);
      GN.applyEditable('public.footer.rights', pub.footer.rights);
    }

    /* Dynamic sections */
    GN.renderServices(data.services || []);
    GN.renderAdvantages(data.advantages || []);
    GN.renderBoard(data.board || []);
    GN.renderNews(data.news || []);
    GN.renderSocialLinks((data.settings && data.settings.social) || {});
    GN.renderContactInfo((data.settings && data.settings.contact) || {});
  };

  /* ============================================================
     Editable helpers (contenteditable blur save)
     ============================================================ */
  GN.applyEditable = function(path, val){
    if (val == null) return;
    var els = document.querySelectorAll('[data-edit="' + path + '"]');
    for (var i = 0; i < els.length; i++) {
      if (els[i].isContentEditable || document.activeElement === els[i]) continue;
      els[i].textContent = val;
    }
  };

  GN.applyEditableHTML = function(path, val){
    if (val == null) return;
    var els = document.querySelectorAll('[data-edit-html="' + path + '"]');
    for (var i = 0; i < els.length; i++) {
      if (els[i].isContentEditable || document.activeElement === els[i]) continue;
      els[i].innerHTML = val;
    }
  };

  /* ============================================================
     Services
     ============================================================ */
  GN.renderServices = function(list){
    var grid = document.getElementById('servicesGrid');
    if (!grid) return;

    if (!list || !list.length) {
      grid.innerHTML = '';
      return;
    }

    grid.innerHTML = list.map(function(item, i){
      var iconSvg = GN.iconSvg(item.icon || 'default');
      return '<article class="svc" data-svc-idx="' + i + '">' +
        GN.itemActions('services', i) +
        '<div class="ic">' + iconSvg + '</div>' +
        '<h3 data-edit="services.' + i + '.title">' + GN.esc(item.title || '') + '</h3>' +
        '<p data-edit="services.' + i + '.text">' + GN.esc(item.text || '') + '</p>' +
      '</article>';
    }).join('');
  };

  /* ============================================================
     Advantages
     ============================================================ */
  GN.renderAdvantages = function(list){
    var grid = document.getElementById('advGrid');
    if (!grid) return;

    if (!list || !list.length) {
      grid.innerHTML = '';
      return;
    }

    grid.innerHTML = list.map(function(item, i){
      var iconSvg = GN.iconSvg(item.icon || 'default');
      return '<div class="adv-card" data-adv-idx="' + i + '">' +
        GN.itemActions('advantages', i) +
        '<div class="ic">' + iconSvg + '</div>' +
        '<h3 data-edit="advantages.' + i + '.title">' + GN.esc(item.title || '') + '</h3>' +
        '<p data-edit="advantages.' + i + '.text">' + GN.esc(item.text || '') + '</p>' +
      '</div>';
    }).join('');
  };

  /* ============================================================
     Board Members
     ============================================================ */
  GN.renderBoard = function(list){
  if (!Array.isArray(list)) list = [];
  var grid = document.getElementById('boardGrid');
  if (!grid) return;
  grid.className = 'board-grid-v3';

  /* Owner toolbar */
  var toolbar = document.getElementById('boardToolbar');
  if (GN.session.isOwner && !toolbar){
    toolbar = document.createElement('div');
    toolbar.id = 'boardToolbar';
    toolbar.className = 'board-toolbar';
    toolbar.innerHTML = '<button class="btn btn-pri btn-sm" data-act="board-manage">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="width:14px;height:14px"><path d="M12 5v14M5 12h14"/></svg> ' +
      GN.esc(GN.t('boardManage')) + '</button>';
    grid.parentNode.insertBefore(toolbar, grid);
  }

  if (!list.length){
    grid.innerHTML = '<div class="board-empty">' +
      '<h4>' + GN.esc(GN.t('boardEmpty')) + '</h4></div>';
    GN.bindBoardAdmin();
    return;
  }

  /* Sort by order, then flag priority */
  var flagPriority = { sd: 0, om: 1, eg: 2 };
  var sorted = list.slice().sort(function(a, b){
    var ao = (a.order != null && a.order !== '') ? Number(a.order) : 999;
    var bo = (b.order != null && b.order !== '') ? Number(b.order) : 999;
    if (ao !== bo) return ao - bo;
    var ap = flagPriority[a.flag] != null ? flagPriority[a.flag] : 99;
    var bp = flagPriority[b.flag] != null ? flagPriority[b.flag] : 99;
    return ap - bp;
  });

  grid.innerHTML = sorted.map(function(item){
    var realIdx = list.indexOf(item);
    var flag = item.flag || 'sd';
    var flagCount = flag === 'eg' ? 3 : 4;
    var flagSpans = '';
    for (var k = 0; k < flagCount; k++) flagSpans += '<span></span>';

    var photo = item.photo
      ? '<img src="' + GN.escAttr(item.photo) + '" alt="" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'grid\'">' +
        '<div class="fallback" style="display:none">' + GN.esc(GN.initial(item.name || '?')) + '</div>'
      : '<div class="fallback">' + GN.esc(GN.initial(item.name || '?')) + '</div>';

    var adminBtns = GN.session.isOwner
      ? '<div class="bm-v3-admin">' +
          '<button class="edit" data-bm-edit="' + realIdx + '" title="' + GN.escAttr(GN.t('edit')) + '">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>' +
          '</button>' +
          '<button class="del" data-bm-del="' + realIdx + '" title="' + GN.escAttr(GN.t('delete')) + '">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M8 6V4h8v2M6 6v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6"/></svg>' +
          '</button>' +
        '</div>'
      : '';

    return '<div class="bm-v3" data-board-idx="' + realIdx + '">' +
      adminBtns +
      '<div class="bm-v3-photo">' +
        '<div class="bm-v3-flag flag-' + flag + '">' + flagSpans + '</div>' +
        '<div class="bm-v3-photo-inner">' + photo + '</div>' +
      '</div>' +
      '<div class="bm-v3-info">' +
        (item.role ? '<div class="bm-v3-role" data-edit="board.' + realIdx + '.role">' + GN.esc(item.role) + '</div>' : '') +
        '<h3 class="bm-v3-name" data-edit="board.' + realIdx + '.name">' + GN.esc(item.name || '') + '</h3>' +
        (item.subtitle ? '<div class="bm-v3-subtitle" data-edit="board.' + realIdx + '.subtitle">' + GN.esc(item.subtitle) + '</div>' : '') +
        '<div class="bm-v3-divider"></div>' +
        (item.quote
          ? '<div class="bm-v3-quote"><span class="bm-v3-quote-text" data-edit="board.' + realIdx + '.quote">' + GN.esc(item.quote) + '</span></div>'
          : '<div class="bm-v3-quote" style="opacity:.35"><span class="bm-v3-quote-text">—</span></div>') +
      '</div>' +
    '</div>';
  }).join('');

  GN.bindBoardAdmin();
};

  GN.bindBoardAdmin = function(){
    /* Admin manage button */
    var btn = document.querySelector('[data-act="board-manage"]');
    if (btn && !btn._bound){
      btn._bound = true;
      btn.addEventListener('click', function(){
        if (!GN.session.isOwner){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
        GN.openBoardManager();
      });
    }

    /* Edit buttons */
    GN.$$('[data-bm-edit]').forEach(function(b){
      if (b._bound) return;
      b._bound = true;
      b.addEventListener('click', function(e){
        e.stopPropagation();
        GN.openBoardMemberForm(+b.getAttribute('data-bm-edit'));
      });
    });

    /* Delete buttons */
    GN.$$('[data-bm-del]').forEach(function(b){
      if (b._bound) return;
      b._bound = true;
      b.addEventListener('click', function(e){
        e.stopPropagation();
        if (!GN.session.isOwner){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
        var idx = +b.getAttribute('data-bm-del');
        GN.confirm({
          title: GN.t('delete'),
          text: GN.t('boardDeleteConfirm'),
          okText: GN.t('delete'),
          cancelText: GN.t('cancel'),
          danger: true
        }).then(function(ok){
          if (!ok) return;
          GN.publicData.board.splice(idx, 1);
          GN.savePublicData(GN.publicData).then(function(saved){
            if (saved){
              GN.toast(GN.t('deletedSuccess'), 'ok');
              GN.renderBoard(GN.publicData.board);
              GN.enableAdminEditing();
            } else {
              GN.toast(GN.t('saveFailed'), 'bad');
            }
          });
        });
      });
    });
  };

  /* ============================================================
     News (Featured + Archive)
     ============================================================ */
  GN.renderNews = function(list){
    var grid = document.getElementById('newsGrid');
    if (!grid) return;

    if (!Array.isArray(list)) list = [];

    var sorted = list.slice().sort(function(a, b){
      return (b.date || '').localeCompare(a.date || '');
    });

    var featured = sorted[0];
    var archive = sorted.slice(1);

    if (!sorted.length){
      grid.innerHTML = '<div class="news-empty">' + GN.esc(GN.t('newsEmpty2')) + '</div>';
      return;
    }

    var isAdmin = GN.session.isOwner && GN.session.isAdmin;
    var html = '';

    /* Featured */
    if (featured){
      var fImg = featured.image
        ? '<img src="' + GN.escAttr(featured.image) + '" alt="" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'grid\'"><div class="no-img" style="display:none">' + GN.esc((featured.title || '?').charAt(0)) + '</div>'
        : '<div class="no-img">' + GN.esc((featured.title || '?').charAt(0)) + '</div>';

      html += '<div class="news-featured" data-news-featured="1">' +
        '<div class="news-featured-img">' +
          '<span class="news-featured-badge">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 2 15 8l7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6Z"/></svg>' +
            GN.esc(GN.t('newsFeatured')) +
          '</span>' +
          fImg +
        '</div>' +
        '<div class="news-featured-body">' +
          (featured.date ? '<div class="date">' + GN.esc(GN.formatDate(featured.date)) + '</div>' : '') +
          '<h2>' + GN.esc(featured.title || '') + '</h2>' +
          '<p>' + GN.esc(featured.text || '') + '</p>' +
          '<span class="read-more">' +
            GN.esc(GN.t('newsOpenReader')) +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="m15 18-6-6 6-6"/></svg>' +
          '</span>' +
        '</div>' +
      '</div>';
    }

    /* Archive */
    if (archive.length){
      html += '<div class="news-section-title">' + GN.esc(GN.t('newsArchive')) + '</div>';
      html += '<div class="news-grid-v2">';
      archive.forEach(function(item){
        var realIdx = list.indexOf(item);
        var img = item.image
          ? '<img src="' + GN.escAttr(item.image) + '" alt="" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'grid\'"><div class="no-img" style="display:none">' + GN.esc((item.title || '?').charAt(0)) + '</div>'
          : '<div class="no-img">' + GN.esc((item.title || '?').charAt(0)) + '</div>';

        var adminBtns = isAdmin
          ? '<div class="news-admin">' +
              '<button class="edit" data-news-edit="' + realIdx + '" title="' + GN.escAttr(GN.t('edit')) + '">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>' +
              '</button>' +
              '<button class="del" data-news-del="' + realIdx + '" title="' + GN.escAttr(GN.t('delete')) + '">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M8 6V4h8v2M6 6v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6"/></svg>' +
              '</button>' +
            '</div>'
          : '';

        html += '<article class="news-card" data-news-idx="' + realIdx + '">' +
          adminBtns +
          '<div class="thumb">' + img +
            (item.date ? '<span class="date">' + GN.esc(GN.formatDate(item.date)) + '</span>' : '') +
          '</div>' +
          '<div class="body">' +
            '<h3>' + GN.esc(item.title || '') + '</h3>' +
            '<p>' + GN.esc((item.text || '').slice(0, 130)) + ((item.text || '').length > 130 ? '…' : '') + '</p>' +
            '<span class="read">' + GN.esc(GN.t('readMore')) +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="m15 18-6-6 6-6"/></svg>' +
            '</span>' +
          '</div>' +
        '</article>';
      });
      html += '</div>';
    }

    grid.innerHTML = html;

    /* Featured click */
    var f = grid.querySelector('[data-news-featured]');
    if (f && featured){
      f.addEventListener('click', function(){ GN.openReader(featured); });
    }

    /* Archive clicks */
    GN.$$('.news-card').forEach(function(card){
      card.addEventListener('click', function(e){
        if (e.target.closest('[data-news-del]')) return;
        if (e.target.closest('[data-news-edit]')) return;
        var idx = +card.getAttribute('data-news-idx');
        var item = list[idx];
        if (item) GN.openReader(item);
      });
    });

    /* Admin edit */
    GN.$$('[data-news-edit]').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        GN.openWebsiteArticleForm(+btn.getAttribute('data-news-edit'));
      });
    });

    /* Admin delete */
    GN.$$('[data-news-del]').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        var idx = +btn.getAttribute('data-news-del');
        GN.confirm({
          title: GN.t('delete'),
          text: GN.t('newsDeleteConfirm'),
          okText: GN.t('delete'),
          cancelText: GN.t('cancel'),
          danger: true
        }).then(function(ok){
          if (!ok) return;
          list.splice(idx, 1);
          GN.savePublicData(GN.publicData).then(function(saved){
            if (saved){
              GN.toast(GN.t('deletedSuccess'), 'ok');
              GN.renderNews(GN.publicData.news);
              GN.enableAdminEditing();
            } else {
              GN.toast(GN.t('saveFailed'), 'bad');
            }
          });
        });
      });
    });
  };

  /* ============================================================
     Social links
     ============================================================ */
  GN.renderSocialLinks = function(social){
    var grid = document.getElementById('socialGrid');
    if (!grid) return;

    var list = (window.GN_CONST && window.GN_CONST.SOCIALS) || [];
    grid.innerHTML = list.map(function(s){
      var url = social[s.key] || '';
      var cls = 'social-btn ' + s.key + (url ? ' has-url' : '');
      return '<a class="' + cls + '" data-social="' + s.key + '" href="' + (url ? GN.escAttr(url) : '#') + '" target="_blank" rel="noopener" aria-label="' + s.name + '">' +
        GN.socialSvg(s.key) +
      '</a>';
    }).join('');

    var adminGrid = document.getElementById('socialAdminGrid');
    if (adminGrid) {
      adminGrid.innerHTML = list.map(function(s){
        return '<input type="url" data-social-url="' + s.key + '" placeholder="' + s.name + ' URL" dir="ltr" value="' + GN.escAttr(social[s.key] || '') + '">';
      }).join('');
    }
  };

  /* ============================================================
     Contact info
     ============================================================ */
  GN.renderContactInfo = function(contact){
    var emailCard = document.getElementById('contactEmailCard');
    var phoneCard = document.getElementById('contactPhoneCard');
    var waCard = document.getElementById('contactWhatsappCard');
    var emailVal = document.getElementById('contactEmailValue');
    var phoneVal = document.getElementById('contactPhoneValue');
    var waVal = document.getElementById('contactWhatsappValue');

    if (emailCard && emailVal) {
      if (contact.email) {
        emailCard.classList.remove('disabled');
        emailCard.href = 'mailto:' + contact.email;
        emailVal.textContent = contact.email;
      } else {
        emailCard.classList.add('disabled');
        emailCard.href = '#';
        emailVal.textContent = '';
      }
    }
    if (phoneCard && phoneVal) {
      if (contact.phone) {
        phoneCard.classList.remove('disabled');
        phoneCard.href = 'tel:' + contact.phone.replace(/\s+/g, '');
        phoneVal.textContent = contact.phone;
      } else {
        phoneCard.classList.add('disabled');
        phoneCard.href = '#';
        phoneVal.textContent = '';
      }
    }
    if (waCard && waVal) {
      if (contact.whatsapp) {
        waCard.classList.remove('disabled');
        waCard.href = contact.whatsapp;
        waVal.textContent = contact.whatsapp;
      } else {
        waCard.classList.add('disabled');
        waCard.href = '#';
        waVal.textContent = '';
      }
    }

    var inputs = {
      email: document.querySelector('[data-contact-input="email"]'),
      phone: document.querySelector('[data-contact-input="phone"]'),
      whatsapp: document.querySelector('[data-contact-input="whatsapp"]')
    };
    if (inputs.email) inputs.email.value = contact.email || '';
    if (inputs.phone) inputs.phone.value = contact.phone || '';
    if (inputs.whatsapp) inputs.whatsapp.value = contact.whatsapp || '';
  };

  /* ============================================================
     Reader modal (Article)
     ============================================================ */
  GN.openReader = function(item){
    if (!item) return;
    var modal = document.getElementById('readerModal');
    var img = document.getElementById('readerImg');
    var date = document.getElementById('readerDate');
    var title = document.getElementById('readerTitle');
    var text = document.getElementById('readerText');
    if (!modal) return;

    if (item.image) {
      img.style.display = 'block';
      img.src = item.image;
    } else {
      img.style.display = 'none';
      img.removeAttribute('src');
    }
    date.textContent = GN.formatDate(item.date);
    title.textContent = item.title || '';
    text.textContent = item.text || '';

    /* Bind close button (once) */
    var closeBtn = modal.querySelector('[data-close-modal="readerModal"]');
    if (closeBtn && !closeBtn._bound){
      closeBtn._bound = true;
      closeBtn.addEventListener('click', function(e){
        e.stopPropagation();
        GN.closeModal('readerModal');
      });
    }

    /* Click outside closes */
    if (!modal._backdropBound){
      modal._backdropBound = true;
      modal.addEventListener('click', function(e){
        if (e.target === modal) GN.closeModal('readerModal');
      });
    }

    GN.openModal('readerModal');
  };

  /* ============================================================
     Item actions (edit + delete) — for services & advantages
     ============================================================ */
  GN.itemActions = function(listName, idx){
    return '<div class="item-actions">' +
      '<button type="button" class="del" data-del-list="' + listName + '" data-del-idx="' + idx + '">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:14px;height:14px;display:inline-block;vertical-align:-2px;margin-inline-end:4px">' +
          '<path d="M3 6h18M8 6V4h8v2M6 6v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6"/>' +
        '</svg>' +
        GN.esc(GN.t('delete')) +
      '</button>' +
    '</div>';
  };

  /* ============================================================
     Icon SVGs (services & advantages)
     ============================================================ */
  GN.iconSvg = function(name){
    var icons = {
      'scan':   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 20h16M6 20V10l6-4 6 4v10"/><circle cx="12" cy="14" r="2.5"/></svg>',
      'trade':  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M7 3h10l2 6H5l2-6Z"/><path d="M5 9v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9"/><path d="M9 14h6"/></svg>',
      'ai':     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Z"/><circle cx="12" cy="9" r="2.5"/></svg>',
      'shield': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 2 4 6v6c0 5 3.4 9.4 8 10 4.6-.6 8-5 8-10V6l-8-4Z"/></svg>',
      'team':   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="9" cy="9" r="3"/><circle cx="17" cy="9" r="3"/><path d="M3 20c0-3 2.7-5 6-5s6 2 6 5"/><path d="M15 20c0-2 1-3.5 3-4 1.5-.4 3 .8 3 3"/></svg>',
      'chart':  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 3v18h18"/><path d="m7 14 4-4 4 4 6-6"/></svg>',
      'cog':    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>',
      'default':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 3"/></svg>'
    };
    return icons[name] || icons['default'];
  };

  /* ============================================================
     Social SVGs
     ============================================================ */
  GN.socialSvg = function(name){
    var icons = {
      linkedin:  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13Zm1.78 13.02H3.55V9h3.57v11.45Z"/></svg>',
      twitter:   '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231L18.244 2.25Z"/></svg>',
      tiktok:    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1Z"/></svg>',
      youtube:   '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.08 0 12 0 12s0 3.92.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.92 24 12 24 12s0-3.92-.5-5.81ZM9.55 15.57V8.43L15.82 12l-6.27 3.57Z"/></svg>',
      instagram: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C6.17 15.58 6.16 15.2 6.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16Zm0-2.16C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.86 5.86 0 0 0-2.13 1.38A5.86 5.86 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.79.72 1.46 1.38 2.13a5.86 5.86 0 0 0 2.13 1.38c.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.86 5.86 0 0 0 2.13-1.38 5.86 5.86 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.86 5.86 0 0 0-1.38-2.13A5.86 5.86 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0Zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm7.85-10.41a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0Z"/></svg>',
      facebook:  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07c0 6.02 4.39 11.02 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.96h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8v8.44C19.61 23.09 24 18.09 24 12.07Z"/></svg>'
    };
    return icons[name] || '';
  };

  console.log('[Gold Nile] public.js part 1 loaded');

})();

/* Gold Nile - Public Site Admin Editing v1.0.0 */
(function(){
  'use strict';

  var GN = window.GN = window.GN || {};

  /* ============================================================
     Admin editing - contenteditable toggle
     ============================================================ */
  GN.enableAdminEditing = function(){
    GN.$$('[data-edit]').forEach(function(el){
      if (el.isContentEditable) return;
      el.setAttribute('contenteditable', 'true');
      el.setAttribute('spellcheck', 'false');
    });
    GN.$$('[data-edit-html]').forEach(function(el){
      if (el.isContentEditable) return;
      el.setAttribute('contenteditable', 'true');
      el.setAttribute('spellcheck', 'false');
    });
  };

  GN.disableAdminEditing = function(){
    GN.$$('[contenteditable="true"]').forEach(function(el){
      el.removeAttribute('contenteditable');
      el.removeAttribute('spellcheck');
      el.blur();
    });
  };

  /* ============================================================
     Handle edits - save on blur
     ============================================================ */
  GN.bindEditEvents = function(){
    document.addEventListener('focusout', function(e){
      var el = e.target;
      if (!el || !el.getAttribute) return;
      var path = el.getAttribute('data-edit') || el.getAttribute('data-edit-html');
      if (!path) return;
      if (!GN.session.isAdmin) return;

      var isHtml = el.hasAttribute('data-edit-html');
      var val = isHtml ? el.innerHTML.trim() : el.textContent.trim();

      if (!GN.publicData) return;

      var current = GN.getPath(GN.publicData, path);
      if (String(current || '') === String(val || '')) return;

      GN.setPath(GN.publicData, path, val);
      GN.savePublicData(GN.publicData).then(function(ok){
        if (ok) GN.toast(GN.t('savedSuccess'), 'ok');
        else GN.toast(GN.t('saveFailed'), 'bad');
      });
    });
  };

  /* ============================================================
     Admin toggle (public site header)
     ============================================================ */
  GN.initAdminToggle = function(){
    var btn = document.getElementById('adminToggle');
    if (!btn) return;

    if (GN.session.isOwner) {
      btn.hidden = false;
    } else {
      btn.hidden = true;
    }

    btn.addEventListener('click', function(){
      var on = GN.toggleAdminMode();
      if (on) {
        GN.enableAdminEditing();
        GN.toast(GN.t('adminModeOn'), 'ok');
      } else {
        GN.disableAdminEditing();
        GN.toast(GN.t('adminModeOff'));
      }
    });
  };

  /* ============================================================
     Add item handlers
     ============================================================ */
  GN.initAddHandlers = function(){
    GN.$$('[data-add]').forEach(function(btn){
      btn.addEventListener('click', function(){
        if (!GN.session.isAdmin) {
          GN.toast(GN.t('readOnlyNotice'), 'bad');
          return;
        }
        var type = btn.getAttribute('data-add');
        GN.addNewItem(type);
      });
    });
  };

  GN.addNewItem = function(type){
    if (!GN.publicData) return;

    var list, defaults;

    switch (type) {
      case 'services':
        list = GN.publicData.services || (GN.publicData.services = []);
        defaults = { title: 'New Service', text: '', icon: 'default' };
        break;
      case 'advantages':
        list = GN.publicData.advantages || (GN.publicData.advantages = []);
        defaults = { title: 'New Advantage', text: '', icon: 'default' };
        break;
      case 'board':
        list = GN.publicData.board || (GN.publicData.board = []);
        defaults = { name: 'New Member', role: '', subtitle: '', quote: '', photo: '', flag: 'sd' };
        break;
      case 'news':
        GN.openNewsForm(-1);
        return;
      default:
        return;
    }

    list.push(defaults);
    GN.savePublicData(GN.publicData).then(function(ok){
      if (ok) {
        GN.toast(GN.t('addedSuccess'), 'ok');
        GN.renderPublicPage(GN.publicData);
        GN.enableAdminEditing();
      } else {
        GN.toast(GN.t('saveFailed'), 'bad');
      }
    });
  };

  /* ============================================================
     Delete item (services / advantages)
     ============================================================ */
  GN.bindDeleteHandlers = function(){
    document.addEventListener('click', function(e){
      var btn = e.target.closest('[data-del-list]');
      if (!btn) return;

      if (!GN.session.isAdmin) {
        GN.toast(GN.t('readOnlyNotice'), 'bad');
        return;
      }

      var listName = btn.getAttribute('data-del-list');
      var idx = +btn.getAttribute('data-del-idx');
      var list = GN.publicData && GN.publicData[listName];
      if (!list || !list[idx]) return;

      GN.confirm({
        title: GN.t('confirmDelete'),
        text: GN.t('confirmDeleteNote'),
        okText: GN.t('delete'),
        cancelText: GN.t('cancel'),
        danger: true
      }).then(function(ok){
        if (!ok) return;
        list.splice(idx, 1);
        GN.savePublicData(GN.publicData).then(function(saved){
          if (saved) {
            GN.toast(GN.t('deletedSuccess'), 'ok');
            GN.renderPublicPage(GN.publicData);
            GN.enableAdminEditing();
          } else {
            GN.toast(GN.t('saveFailed'), 'bad');
          }
        });
      });
    });
  };

  /* ============================================================
     News form (Public quick-add)
     ============================================================ */
  GN.openNewsForm = function(idx){
    if (!GN.session.isAdmin) {
      GN.toast(GN.t('readOnlyNotice'), 'bad');
      return;
    }

    var list = GN.publicData.news || (GN.publicData.news = []);
    var isNew = idx < 0;
    var item = isNew ? { image:'', title:'', text:'', date:GN.today() } : (list[idx] || {});

    var body = document.getElementById('formModalBody');
    var titleEl = document.getElementById('formModalTitle');
    if (!body || !titleEl) return;

    titleEl.textContent = isNew ? GN.t('addNews') : GN.t('edit') + ' ' + GN.t('newsTitle');

    body.innerHTML =
      '<div class="form-grid">' +
        '<div class="field full">' +
          '<label>' + GN.esc(GN.t('docUrl')) + '</label>' +
          '<div class="input-wrap">' +
            '<input type="url" id="nfImage" dir="ltr" placeholder="https://..." value="' + GN.escAttr(item.image || '') + '">' +
          '</div>' +
        '</div>' +
        '<div class="field full">' +
          '<label>' + GN.esc(GN.t('title')) + ' <span class="req">*</span></label>' +
          '<div class="input-wrap">' +
            '<input type="text" id="nfTitle" maxlength="140" value="' + GN.escAttr(item.title || '') + '">' +
          '</div>' +
        '</div>' +
        '<div class="field full">' +
          '<label>' + GN.esc(GN.t('description')) + '</label>' +
          '<div class="input-wrap">' +
            '<textarea id="nfText" rows="6" maxlength="4000">' + GN.esc(item.text || '') + '</textarea>' +
          '</div>' +
        '</div>' +
        '<div class="field">' +
          '<label>' + GN.esc(GN.t('date')) + '</label>' +
          '<div class="input-wrap">' +
            '<input type="date" id="nfDate" value="' + GN.escAttr(item.date || GN.today()) + '">' +
          '</div>' +
        '</div>' +
      '</div>';

    GN.openModal('formModal');

    var submitBtn = document.getElementById('formModalSubmit');
    submitBtn.onclick = function(){
      var title = document.getElementById('nfTitle').value.trim();
      var text = document.getElementById('nfText').value.trim();
      var image = document.getElementById('nfImage').value.trim();
      var date = document.getElementById('nfDate').value;

      if (!title || !text) {
        GN.toast(GN.t('fieldRequired'), 'bad');
        return;
      }

      var newItem = { title: title, text: text, image: image, date: date };

      if (isNew) list.unshift(newItem);
      else list[idx] = newItem;

      GN.savePublicData(GN.publicData).then(function(ok){
        if (ok) {
          GN.toast(GN.t('savedSuccess'), 'ok');
          GN.closeModal('formModal');
          GN.renderPublicPage(GN.publicData);
          GN.enableAdminEditing();
        } else {
          GN.toast(GN.t('saveFailed'), 'bad');
        }
      });
    };
  };

  /* ============================================================
     Delete news
     ============================================================ */
  GN.deleteNews = function(idx){
    if (!GN.session.isAdmin) {
      GN.toast(GN.t('readOnlyNotice'), 'bad');
      return;
    }
    var list = GN.publicData.news || [];
    if (!list[idx]) return;

    GN.confirm({
      title: GN.t('confirmDelete'),
      text: GN.t('confirmDeleteNote'),
      okText: GN.t('delete'),
      cancelText: GN.t('cancel'),
      danger: true
    }).then(function(ok){
      if (!ok) return;
      list.splice(idx, 1);
      GN.savePublicData(GN.publicData).then(function(saved){
        if (saved) {
          GN.toast(GN.t('deletedSuccess'), 'ok');
          GN.renderPublicPage(GN.publicData);
        } else {
          GN.toast(GN.t('saveFailed'), 'bad');
        }
      });
    });
  };

  /* ============================================================
     Social links inputs
     ============================================================ */
  GN.bindSocialInputs = function(){
    GN.$$('[data-social-url]').forEach(function(input){
      input.addEventListener('input', function(){
        if (!GN.session.isAdmin) return;
        var key = input.getAttribute('data-social-url');
        var val = input.value.trim();

        if (!GN.publicData.settings) GN.publicData.settings = {};
        if (!GN.publicData.settings.social) GN.publicData.settings.social = {};
        GN.publicData.settings.social[key] = val;

        var btn = document.querySelector('[data-social="' + key + '"]');
        if (btn) {
          if (val) {
            btn.classList.add('has-url');
            btn.href = val;
          } else {
            btn.classList.remove('has-url');
            btn.href = '#';
          }
        }
      });

      input.addEventListener('blur', function(){
        if (!GN.session.isAdmin) return;
        GN.savePublicData(GN.publicData).then(function(ok){
          if (ok) GN.toast(GN.t('savedSuccess'), 'ok');
        });
      });
    });
  };

  /* ============================================================
     Contact inputs
     ============================================================ */
  GN.bindContactInputs = function(){
    GN.$$('[data-contact-input]').forEach(function(input){
      input.addEventListener('input', function(){
        if (!GN.session.isAdmin) return;
        var key = input.getAttribute('data-contact-input');
        var val = input.value.trim();

        if (!GN.publicData.settings) GN.publicData.settings = {};
        if (!GN.publicData.settings.contact) GN.publicData.settings.contact = {};
        GN.publicData.settings.contact[key] = val;

        GN.renderContactInfo(GN.publicData.settings.contact);
      });

      input.addEventListener('blur', function(){
        if (!GN.session.isAdmin) return;
        GN.savePublicData(GN.publicData).then(function(ok){
          if (ok) GN.toast(GN.t('savedSuccess'), 'ok');
        });
      });
    });
  };

  /* ============================================================
     Photo change (data-edit-img)
     ============================================================ */
  GN.bindPhotoEdits = function(){
    document.addEventListener('click', function(e){
      var el = e.target.closest('[data-edit-img]');
      if (!el) return;
      if (!GN.session.isAdmin) return;
      e.preventDefault();

      var path = el.getAttribute('data-edit-img');
      var current = GN.getPath(GN.publicData, path) || '';
      var val = window.prompt('Image URL:', current);
      if (val == null) return;
      val = val.trim();

      GN.setPath(GN.publicData, path, val);
      GN.savePublicData(GN.publicData).then(function(ok){
        if (ok) {
          GN.toast(GN.t('savedSuccess'), 'ok');
          GN.renderPublicPage(GN.publicData);
          GN.enableAdminEditing();
        }
      });
    });
  };

  /* ============================================================
     Header scroll effect
     ============================================================ */
  GN.initHeaderScroll = function(){
    var top = document.getElementById('top');
    if (!top) return;
    function onScroll(){
      top.classList.toggle('scrolled', window.scrollY > 40);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  };

  /* ============================================================
     Language toggle
     ============================================================ */
  GN.initLangToggle = function(){
    var btn = document.getElementById('langBtn');
    if (btn) btn.addEventListener('click', function(){ GN.toggleLang(); });

    var btnDash = document.getElementById('langBtnDash');
    if (btnDash) btnDash.addEventListener('click', function(){ GN.toggleLang(); });
  };

  /* ============================================================
     Public site init
     ============================================================ */
  GN.initPublicSite = function(){
    GN.initHeaderScroll();
    GN.initLangToggle();
    GN.initAdminToggle();
    GN.initAddHandlers();
    GN.bindDeleteHandlers();
    GN.bindSocialInputs();
    GN.bindContactInputs();
    GN.bindPhotoEdits();
    GN.bindEditEvents();
  };

  /* ============================================================
     BOARD MEMBER FORM (Add / Edit) - Owner only
     ============================================================ */
  GN.openBoardMemberForm = function(idx){
    if (!GN.session.isOwner){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
    var list = GN.publicData.board || (GN.publicData.board = []);
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
        '<div class="input-wrap"><input type="text" id="bm_name" maxlength="80" value="' + GN.escAttr(item.name || '') + '"></div></div>' +
      '<div class="field"><label>' + GN.esc(GN.t('boardRole')) + '</label>' +
        '<div class="input-wrap"><input type="text" id="bm_role" maxlength="80" value="' + GN.escAttr(item.role || '') + '"></div></div>' +
      '<div class="field"><label>' + GN.esc(GN.t('boardSubtitle')) + '</label>' +
        '<div class="input-wrap"><input type="text" id="bm_subtitle" maxlength="80" value="' + GN.escAttr(item.subtitle || '') + '"></div></div>' +
      '<div class="field"><label>' + GN.esc(GN.t('boardFlag')) + '</label>' +
        '<div class="input-wrap"><select id="bm_flag">' +
          opt([
            { value:'sd', label: GN.t('boardFlagSudan') },
            { value:'om', label: GN.t('boardFlagOman') },
            { value:'eg', label: GN.t('boardFlagEgypt') }
          ], item.flag || 'sd') +
        '</select></div></div>' +
      '<div class="field"><label>' + GN.esc(GN.t('boardOrder')) + '</label>' +
        '<div class="input-wrap"><input type="number" id="bm_order" min="1" max="99" value="' + GN.escAttr(item.order == null ? '' : item.order) + '"></div></div>' +
      '<div class="field full"><label>' + GN.esc(GN.t('boardPhotoUrl')) + '</label>' +
        '<div class="input-wrap"><input type="url" id="bm_photo" dir="ltr" placeholder="https://..." value="' + GN.escAttr(item.photo || '') + '"></div></div>' +
      '<div class="field full"><label>' + GN.esc(GN.t('boardQuote')) + '</label>' +
        '<div class="input-wrap"><textarea id="bm_quote" rows="4" maxlength="500">' + GN.esc(item.quote || '') + '</textarea></div></div>' +
    '</div>';

    GN.openModal('formModal');

    var submitBtn = document.getElementById('formModalSubmit');
    submitBtn.onclick = function(){
      var name = document.getElementById('bm_name').value.trim();
      if (!name){ GN.toast(GN.t('fieldRequired'), 'bad'); return; }

      var obj = {
        name: name,
        role: document.getElementById('bm_role').value.trim(),
        subtitle: document.getElementById('bm_subtitle').value.trim(),
        flag: document.getElementById('bm_flag').value,
        order: document.getElementById('bm_order').value ? Number(document.getElementById('bm_order').value) : '',
        photo: document.getElementById('bm_photo').value.trim(),
        quote: document.getElementById('bm_quote').value.trim()
      };

      if (isEdit) list[idx] = obj;
      else list.push(obj);

      GN.savePublicData(GN.publicData).then(function(ok){
        if (ok){
          GN.toast(GN.t('savedSuccess'), 'ok');
          GN.closeModal('formModal');
          GN.renderBoard(GN.publicData.board);
          GN.enableAdminEditing();
        } else {
          GN.toast(GN.t('saveFailed'), 'bad');
        }
      });
    };
  };

  /* ============================================================
     BOARD MANAGER (list of members)
     ============================================================ */
  GN.openBoardManager = function(){
    if (!GN.session.isOwner){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
    var list = GN.publicData.board || [];

    var body = document.getElementById('formModalBody');
    var titleEl = document.getElementById('formModalTitle');
    if (!body || !titleEl) return;
    titleEl.textContent = GN.t('boardMembersList');

    function renderList(){
      if (!list.length){
        return '<div class="cat-empty">' + GN.esc(GN.t('boardEmpty')) + '</div>';
      }
      return list.map(function(m, i){
        return '<div class="cat-chip" style="justify-content:space-between;width:100%;padding:10px 14px">' +
          '<span style="display:flex;align-items:center;gap:8px">' +
            '<b style="font-weight:700">' + GN.esc(m.name || '-') + '</b>' +
            (m.role ? '<small style="color:var(--ink-3)">' + GN.esc(m.role) + '</small>' : '') +
          '</span>' +
          '<span style="display:flex;gap:4px">' +
            '<button class="x" data-bmgr-edit="' + i + '" type="button" style="background:var(--nile-l);color:var(--nile)">✎</button>' +
            '<button class="x" data-bmgr-del="' + i + '" type="button">×</button>' +
          '</span>' +
        '</div>';
      }).join('');
    }

    body.innerHTML =
      '<button class="btn btn-pri" id="bmgr_add" type="button" style="width:100%;margin-bottom:14px">' +
        '+ ' + GN.esc(GN.t('boardAddMember')) + '</button>' +
      '<div class="cat-list" id="bmgr_list" style="flex-direction:column;align-items:stretch">' + renderList() + '</div>';

    var sub = document.getElementById('formModalSubmit');
    if (sub) sub.style.display = 'none';

    GN.openModal('formModal');

    function bindList(){
      GN.$$('[data-bmgr-edit]').forEach(function(b){
        b.addEventListener('click', function(){
          GN.closeModal('formModal');
          setTimeout(function(){ GN.openBoardMemberForm(+b.getAttribute('data-bmgr-edit')); }, 200);
        });
      });
      GN.$$('[data-bmgr-del]').forEach(function(b){
        b.addEventListener('click', function(){
          var i = +b.getAttribute('data-bmgr-del');
          GN.confirm({
            title: GN.t('delete'),
            text: GN.t('boardDeleteConfirm'),
            okText: GN.t('delete'),
            cancelText: GN.t('cancel'),
            danger: true
          }).then(function(ok){
            if (!ok) return;
            list.splice(i, 1);
            GN.savePublicData(GN.publicData).then(function(saved){
              if (saved){
                GN.toast(GN.t('deletedSuccess'), 'ok');
                document.getElementById('bmgr_list').innerHTML = renderList();
                bindList();
                GN.renderBoard(GN.publicData.board);
              }
            });
          });
        });
      });
    }
    bindList();

    document.getElementById('bmgr_add').onclick = function(){
      GN.closeModal('formModal');
      setTimeout(function(){ GN.openBoardMemberForm(-1); }, 200);
    };
  };

  console.log('[Gold Nile] public.js part 2 loaded');

})();