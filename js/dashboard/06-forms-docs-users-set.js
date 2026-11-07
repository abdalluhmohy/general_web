/* ============================================================
   Gold Nile — Dashboard / Form Helpers + Docs + Users + Settings
   ============================================================ */
(function(){
'use strict';

var GN = window.GN = window.GN || {};

var ICO_EDIT = GN.ICO_EDIT;
var ICO_DEL  = GN.ICO_DEL;

/* ============================================================
   Form Helpers
   ============================================================ */
GN.openForm = function(titleKey, fields){
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

  var sub = document.getElementById('formModalSubmit');
  if (sub) sub.style.display = '';

  GN.openModal('formModal');
};

GN.readForm = function(ids){
  var out = {};
  ids.forEach(function(id){
    var el = document.getElementById(id);
    if (el) out[id] = el.value.trim();
  });
  return out;
};

GN.onSubmit = function(fn){
  var btn = document.getElementById('formModalSubmit');
  if (!btn) return;
  btn.onclick = function(){
    fn(function(ok){
      if (ok){
        GN.closeModal('formModal');
        GN.dh.save();
      }
    });
  };
};

/* ============================================================
   Documents Section
   ============================================================ */
GN.docFilter = { search: '', category: '', expiry: '' };

GN.sections.docs = function(){
  var docs = GN.dh.list('documents');
  var letters = GN.dh.list('letters');
  var cats = GN.dh.list('doc_categories');

  var today = new Date().toISOString().slice(0, 10);
  var soonLimit = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

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

  var catOptions = '<option value="">' + GN.esc(GN.t('docFilterAll')) + '</option>' +
    cats.map(function(c){
      return '<option value="' + GN.escAttr(c) + '"' + (GN.docFilter.category === c ? ' selected' : '') + '>' + GN.esc(c) + '</option>';
    }).join('');

  html += '<div class="doc-toolbar">' +
    '<div class="doc-search">' +
      '<input type="text" id="doc_search" placeholder="' + GN.escAttr(GN.t('docSearchPh')) + '" value="' + GN.escAttr(GN.docFilter.search) + '">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>' +
    '</div>' +
    '<select id="doc_cat_filter">' + catOptions + '</select>' +
    '<select id="doc_expiry_filter">' +
      '<option value="">' + GN.esc(GN.t('docExpiryAll')) + '</option>' +
      '<option value="valid"'   + (GN.docFilter.expiry === 'valid'   ? ' selected' : '') + '>' + GN.esc(GN.t('docExpiryValid'))   + '</option>' +
      '<option value="soon"'    + (GN.docFilter.expiry === 'soon'    ? ' selected' : '') + '>' + GN.esc(GN.t('docExpirySoon'))    + '</option>' +
      '<option value="expired"' + (GN.docFilter.expiry === 'expired' ? ' selected' : '') + '>' + GN.esc(GN.t('docExpiryExpired')) + '</option>' +
      '<option value="none"'    + (GN.docFilter.expiry === 'none'    ? ' selected' : '') + '>' + GN.esc(GN.t('docExpiryNone'))    + '</option>' +
    '</select>' +
    (GN.session.isOwner
      ? '<button class="doc-btn-manage" data-act="doc-manage-cats">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg> ' +
          GN.esc(GN.t('docManageCategories')) + '</button>'
      : '') +
  '</div>';

  html += '<div class="doc-section-title">' + GN.navIcon('file') + ' ' + GN.esc(GN.t('docsTitle')) +
    '<span class="cnt">' + docs.length + '</span></div>';
  html += '<div class="doc-grid" id="docGrid">' + GN.renderDocCards(docs, 'doc') + '</div>';

  html += '<div class="doc-section-title" style="margin-top:24px">' + GN.navIcon('file') + ' ' + GN.esc(GN.t('letters')) +
    '<span class="cnt">' + letters.length + '</span></div>';
  html += '<div class="doc-grid" id="letterGrid">' + GN.renderDocCards(letters, 'letter') + '</div>';

  return html;
};

GN.renderDocCards = function(arr, prefix){
  var today = new Date().toISOString().slice(0, 10);
  var soonLimit = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

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
      if (f.expiry === 'none'    && x.expiry_date) return false;
      if (f.expiry === 'valid'   && (!x.expiry_date || x.expiry_date < today)) return false;
      if (f.expiry === 'soon'    && (!x.expiry_date || x.expiry_date < today || x.expiry_date > soonLimit)) return false;
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

  return filtered.map(function(x){
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

    return '<div class="' + cardClass + '" data-notif-id="' + GN.escAttr(x.id || '') + '">' +
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

GN.openManageCategories = function(){
  if (!GN.session.isOwner){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  var cats = GN.dh.list('doc_categories');

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
        GN.dh.save().then(function(){
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
    GN.dh.save().then(function(){
      document.getElementById('cat_new').value = '';
      document.getElementById('catList').innerHTML = renderList();
      bindDelete();
    });
  };

  var sub = document.getElementById('formModalSubmit');
  if (sub) sub.style.display = 'none';
};

GN.bindSection.docs = function(){
  var s = document.getElementById('doc_search');
  if (s){
    s.addEventListener('input', function(){
      GN.docFilter.search = s.value.trim();
      var g1 = document.getElementById('docGrid');
      var g2 = document.getElementById('letterGrid');
      if (g1) g1.innerHTML = GN.renderDocCards(GN.dh.list('documents'), 'doc');
      if (g2) g2.innerHTML = GN.renderDocCards(GN.dh.list('letters'), 'letter');
      GN.bindSection.docs();
    });
  }
  var cf = document.getElementById('doc_cat_filter');
  if (cf){
    cf.addEventListener('change', function(){
      GN.docFilter.category = cf.value;
      var g1 = document.getElementById('docGrid');
      var g2 = document.getElementById('letterGrid');
      if (g1) g1.innerHTML = GN.renderDocCards(GN.dh.list('documents'), 'doc');
      if (g2) g2.innerHTML = GN.renderDocCards(GN.dh.list('letters'), 'letter');
      GN.bindSection.docs();
    });
  }
  var ef = document.getElementById('doc_expiry_filter');
  if (ef){
    ef.addEventListener('change', function(){
      GN.docFilter.expiry = ef.value;
      var g1 = document.getElementById('docGrid');
      var g2 = document.getElementById('letterGrid');
      if (g1) g1.innerHTML = GN.renderDocCards(GN.dh.list('documents'), 'doc');
      if (g2) g2.innerHTML = GN.renderDocCards(GN.dh.list('letters'), 'letter');
      GN.bindSection.docs();
    });
  }

  GN.bindAction('doc-add', function(){
    if (!GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
    GN.openDocForm(-1);
  });

  GN.bindAction('doc-manage-cats', function(){ GN.openManageCategories(); });

  GN.$$('[data-act="edit-doc"]').forEach(function(b){
    b.addEventListener('click', function(){ GN.openDocForm(+b.getAttribute('data-idx')); });
  });
  GN.$$('[data-act="del-doc"]').forEach(function(b){
    b.addEventListener('click', function(){
      var idx = +b.getAttribute('data-idx');
      var item = GN.dh.list('documents')[idx];
      GN.dh.askDelete().then(function(ok){
        if (ok){
          if (item && item.id) GN.notify.markDeleted('docs', 'document', item.id);
          GN.dh.list('documents').splice(idx, 1);
          GN.dh.save();
        }
      });
    });
  });
  GN.$$('[data-act="edit-letter"]').forEach(function(b){
    b.addEventListener('click', function(){ GN.openLetterForm(+b.getAttribute('data-idx')); });
  });
  GN.$$('[data-act="del-letter"]').forEach(function(b){
    b.addEventListener('click', function(){
      var idx = +b.getAttribute('data-idx');
      var item = GN.dh.list('letters')[idx];
      GN.dh.askDelete().then(function(ok){
        if (ok){
          if (item && item.id) GN.notify.markDeleted('docs', 'letter', item.id);
          GN.dh.list('letters').splice(idx, 1);
          GN.dh.save();
        }
      });
    });
  });
};

GN.openDocForm = function(idx){
  if (!GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  var arr = GN.dh.list('documents');
  var cats = GN.dh.list('doc_categories');
  var item = idx >= 0 ? arr[idx] : {};
  var catOpts = [{ value:'', label:'—' }].concat(cats.map(function(c){ return { value:c, label:c }; }));

  GN.openForm('docAdd', [
    { id:'name',             label: GN.t('docName'),   req:true, full:true, value:item.name || '' },
    { id:'category',         label: GN.t('docCategory'), type:'select', options:catOpts, value:item.category || '' },
    { id:'reference_number', label: GN.t('docRefNumber'), dir:'ltr', value:item.reference_number || '' },
    { id:'date',             label: GN.t('addedDate'),   type:'date', value:item.date || GN.today() },
    { id:'expiry_date',      label: GN.t('docExpiryDate'), type:'date', value:item.expiry_date || '' },
    { id:'url',              label: GN.t('docUrl'), dir:'ltr', full:true, placeholder:'https://...', value:item.url || '' }
  ]);

  GN.onSubmit(function(done){
    var v = GN.readForm(['name','category','reference_number','date','expiry_date','url']);
    if (!v.name){ GN.toast(GN.t('fieldRequired'), 'bad'); done(false); return; }
    var isNew = idx < 0;
    var obj = {
      id: isNew ? GN.uid() : arr[idx].id,
      name: v.name,
      category: v.category,
      reference_number: v.reference_number,
      date: v.date,
      expiry_date: v.expiry_date,
      url: v.url
    };
    if (idx >= 0) Object.assign(arr[idx], obj);
    else arr.push(obj);
    if (isNew){
      GN.notify.send({
        type:'add', section:'docs', target:'document', target_id: obj.id,
        title: GN.t('notifAdd') + ' · ' + GN.t('docsTitle'),
        body: GN.t('docAdd') + ': ' + v.name
      });
    }
    done(true);
  });
};

GN.openLetterForm = function(idx){
  if (!GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  var arr = GN.dh.list('letters');
  var cats = GN.dh.list('doc_categories');
  var item = idx >= 0 ? arr[idx] : {};
  var catOpts = [{ value:'', label:'—' }].concat(cats.map(function(c){ return { value:c, label:c }; }));

  GN.openForm('letterAdd', [
    { id:'name',             label: GN.t('docName'), req:true, full:true, value:item.name || '' },
    { id:'category',         label: GN.t('docCategory'), type:'select', options:catOpts, value:item.category || '' },
    { id:'reference_number', label: GN.t('docRefNumber'), dir:'ltr', value:item.reference_number || '' },
    { id:'date',             label: GN.t('addedDate'),   type:'date', value:item.date || GN.today() },
    { id:'expiry_date',      label: GN.t('docExpiryDate'), type:'date', value:item.expiry_date || '' },
    { id:'url',              label: GN.t('docUrl'), dir:'ltr', full:true, placeholder:'https://...', value:item.url || '' }
  ]);

  GN.onSubmit(function(done){
    var v = GN.readForm(['name','category','reference_number','date','expiry_date','url']);
    if (!v.name){ GN.toast(GN.t('fieldRequired'), 'bad'); done(false); return; }
    var isNew = idx < 0;
    var obj = {
      id: isNew ? GN.uid() : arr[idx].id,
      name: v.name,
      category: v.category,
      reference_number: v.reference_number,
      date: v.date,
      expiry_date: v.expiry_date,
      url: v.url
    };
    if (idx >= 0) Object.assign(arr[idx], obj);
    else arr.push(obj);
    if (isNew){
      GN.notify.send({
        type:'add', section:'docs', target:'letter', target_id: obj.id,
        title: GN.t('notifAdd') + ' · ' + GN.t('letters'),
        body: GN.t('letterAdd') + ': ' + v.name
      });
    }
    done(true);
  });
};

/* ============================================================
   Users Section
   ============================================================ */
GN.sections.users = function(){
  if (!GN.session.isOwner){
    return '<div class="card"><div class="empty"><div class="ic">' + GN.navIcon('lock') + '</div>' +
      '<h4>' + GN.esc(GN.t('readOnlyNotice')) + '</h4></div></div>';
  }

  var html = '<div class="card"><div class="card-head"><h3>' + GN.navIcon('lock') + ' ' + GN.esc(GN.t('usersTitle')) + '</h3>' +
    '<button class="btn btn-pri btn-sm" data-act="add-user">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg> ' +
      GN.esc(GN.t('addUser')) + '</button></div>' +
    '<div id="usersList"><div class="empty"><h4>' + GN.esc(GN.t('loading')) + '</h4></div></div></div>';

  setTimeout(function(){
    GN.listProfiles().then(function(users){
      var box = document.getElementById('usersList');
      if (!box) return;
      if (!users.length){
        box.innerHTML = '<div class="empty"><div class="ic">' + GN.navIcon('team') + '</div><h4>' + GN.esc(GN.t('noData')) + '</h4></div>';
        return;
      }
      var h = '<div class="table-wrap"><table><thead><tr>' +
        '<th>' + GN.esc(GN.t('fullName')) + '</th>' +
        '<th>' + GN.esc(GN.t('userEmail')) + '</th>' +
        '<th>' + GN.esc(GN.t('userRole')) + '</th>' +
        '<th>' + GN.esc(GN.t('userStatus')) + '</th>' +
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

GN.bindSection.users = function(){
  GN.bindAction('add-user', function(){ GN.openUserForm(); });
};

GN.openUserForm = function(){
  if (!GN.session.isOwner){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }

  GN.openForm('addUser', [
    { id:'full_name', label: GN.t('fullName'), req:true, full:true },
    { id:'email',     label: GN.t('userEmail'), type:'email', dir:'ltr', req:true },
    { id:'password',  label: GN.t('userPassword'), type:'password', dir:'ltr', req:true }
  ]);

  GN.onSubmit(function(done){
    var v = GN.readForm(['full_name','email','password']);
    if (!v.full_name || !v.email || !v.password){ GN.toast(GN.t('fieldRequired'), 'bad'); done(false); return; }
    if (!GN.isEmail(v.email)){ GN.toast(GN.t('fieldInvalidEmail'), 'bad'); done(false); return; }
    if (v.password.length < 8){ GN.toast(GN.t('fieldTooShort'), 'bad'); done(false); return; }
    GN.addMember(v.email, v.password, v.full_name).then(function(res){
      if (res.ok){
        GN.toast(GN.t('addedSuccess'), 'ok');
        GN.closeModal('formModal');
        GN.goTo('users');
      } else {
        GN.toast(GN.errorMessage(res.error), 'bad');
        done(false);
      }
    });
  });
};

/* ============================================================
   Settings Section (Owner + Admin only)
   ============================================================ */
GN.sections.settings = function(){
  if (!GN.session.isOwner || !GN.session.isAdmin){
    return '<div class="card"><div class="empty">' +
      '<div class="ic">' + GN.navIcon('lock') + '</div>' +
      '<h4>' + GN.esc(GN.t('readOnlyNotice')) + '</h4></div></div>';
  }

  var s = GN.dh.settings();
  var contact = s.contact || {};
  var inv = GN.dh.dash().investment || {};

  var html = '<div class="card"><div class="card-head"><h3>' + GN.navIcon('cog') + ' ' + GN.esc(GN.t('generalSettings')) + '</h3></div>' +
    '<div class="form-grid">' +
      '<div class="field"><label>' + GN.esc(GN.t('companyName')) + '</label>' +
        '<div class="input-wrap"><input type="text" data-set="company_name" value="' + GN.escAttr(s.company_name || '') + '"></div></div>' +
      '<div class="field"><label>' + GN.esc(GN.t('companyShort')) + '</label>' +
        '<div class="input-wrap"><input type="text" data-set="company_short" value="' + GN.escAttr(s.company_short || '') + '"></div></div>' +
      '<div class="field full"><label>' + GN.esc(GN.t('companyTagline')) + '</label>' +
        '<div class="input-wrap"><input type="text" data-set="company_tagline" value="' + GN.escAttr(s.company_tagline || '') + '"></div></div>' +
    '     </div></div>';
    /* ===== إدارة رأس المال والديون ===== */
  var capEntries = inv.capital_entries || [];
  var debtList = inv.debts || [];

  html += '<div class="card"><div class="card-head">' +
    '<h3>' + GN.navIcon('dollar') + ' هيكل رأس المال والديون</h3>' +
    '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-inline-start:auto">' +
      '<button class="btn btn-pri btn-sm" data-act="add-capital-entry">+ إيداع رأس مال</button>' +
      '<button class="btn btn-danger btn-sm" data-act="add-debt">+ تسجيل دين</button>' +
    '</div></div>';

  if (!capEntries.length && !debtList.length){
    html += '<div class="empty"><div class="ic">' + GN.navIcon('dollar') + '</div>' +
      '<h4>لا توجد قيود مالية بعد</h4><p>اضغط "إيداع رأس مال" أو "تسجيل دين" للبدء</p></div>';
  } else {
    html += '<div class="table-wrap"><table style="min-width:auto"><thead><tr>' +
      '<th>النوع</th><th>المبلغ</th><th>البيان</th><th>الحساب</th><th>الحالة</th><th></th>' +
      '</tr></thead><tbody>';

    capEntries.forEach(function(e, i){
      html += '<tr>' +
        '<td><span class="chip ok"><span class="dot"></span>رأس مال</span></td>' +
        '<td class="num" dir="ltr">' + GN.formatNum(e.amount) + ' ' + GN.esc(e.currency) + '</td>' +
        '<td>' + GN.esc(e.description || '-') + '</td>' +
        '<td style="font-size:12px;color:var(--ink-2)">' + GN.esc(e.account_name || 'الخزنة') + '</td>' +
        '<td><span class="chip ok">مستلم</span></td>' +
        '<td class="actions"></td></tr>';
    });

        // عرض الديون
    debtList.forEach(function(d, i){
      var total = Number(d.amount) || 0;
      var paid = Number(d.paid_amount) || 0;
      var remaining = total - paid;
      var isSettled = remaining <= 0;
      
      var status = isSettled 
        ? '<span class="chip ok"><span class="dot"></span>مُسدد ومغلق</span>' 
        : '<span class="chip w"><span class="dot"></span>نشط</span>';
      
      html += '<tr>' +
        '<td><span class="chip b"><span class="dot"></span>دين</span></td>' +
        '<td class="num" dir="ltr">' + GN.formatNum(remaining) + ' ' + GN.esc(d.currency) + '</td>' +
        '<td>' + GN.esc(d.description || '-') + '</td>' +
        '<td style="font-size:12px;color:var(--ink-2)">' + GN.esc(d.account_name || 'الخزنة') + '</td>' +
        '<td>' + status + '</td>' +
        '<td class="actions" style="display:flex;gap:4px">';
      
      if (!isSettled) {
        html += '<button class="icon-act" data-act="pay-debt" data-idx="' + i + '" title="سداد دفعة">' + GN.ICO_EDIT + '</button>';
      }
      html += '<button class="icon-act" data-act="view-debt" data-idx="' + i + '" title="سجل السداد"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg></button>';
      
      html += '</td></tr>';
    });

    html += '</tbody></table></div>';
  }
  html += '</div>';
  /* Careers — انضم إلينا */
  var careersUrl = s.careers_form_url || '';
  html += '<div class="card"><div class="card-head"><h3>' + GN.navIcon('team') + ' ' + GN.esc(GN.t('careersBtn')) + '</h3></div>' +
    '<div class="form-grid">' +
      '<div class="field full"><label>' + GN.esc(GN.t('careersFormUrl')) + '</label>' +
        '<div class="input-wrap"><input type="url" dir="ltr" data-set="careers_form_url" placeholder="' + GN.escAttr(GN.t('careersFormUrlPh')) + '" value="' + GN.escAttr(careersUrl) + '"></div>' +
        '<div class="helper">' + GN.esc(GN.t('careersFormUrlHint')) + '</div>' +
      '</div>' +
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
  GN.bindAction('pay-debt', function(btn){ GN.openDebtPaymentForm(+btn.getAttribute('data-idx')); });
  GN.bindAction('view-debt', function(btn){ GN.openDebtHistory(+btn.getAttribute('data-idx')); });
  GN.bindAction('add-capital-entry', function(){ GN.openCapitalEntryForm(); });
  GN.bindAction('add-debt', function(){ GN.openDebtForm(); });
  GN.bindAction('save-settings', function(){
    GN.$$('[data-set]').forEach(function(inp){
      GN.dh.settings()[inp.getAttribute('data-set')] = inp.value.trim();
    });
    GN.$$('[data-inv]').forEach(function(inp){
      var k = inp.getAttribute('data-inv');
      GN.dh.dash().investment = GN.dh.dash().investment || {};
      GN.dh.dash().investment[k] = Number(inp.value) || 0;
    });
    GN.$$('[data-contact-set]').forEach(function(inp){
      var k = inp.getAttribute('data-contact-set');
      GN.dh.settings().contact = GN.dh.settings().contact || {};
      GN.dh.settings().contact[k] = inp.value.trim();
    });
    GN.dh.save();
  });

  GN.bindAction('export-all', function(){
    GN.downloadJSON('gold-nile-backup-' + GN.today() + '.json', GN.dash.data);
    GN.toast(GN.t('success'), 'ok');
  });

  GN.bindAction('import-all', function(){
    var f = document.getElementById('importFile');
    if (f) f.click();
  });

  var f = document.getElementById('importFile');
  if (f){
    f.addEventListener('change', function(e){
      var file = e.target.files[0];
      if (!file) return;
      GN.readFileText(file).then(function(txt){
        try {
          GN.dash.data = GN.normalizeData(JSON.parse(txt));
          GN.dh.save();
        } catch (err){
          GN.toast(GN.t('error'), 'bad');
        }
      });
      e.target.value = '';
    });
  }

  GN.bindAction('reset-all', function(){
    GN.confirm({
      title: GN.t('resetData'),
      text: GN.t('resetWarning'),
      okText: GN.t('delete'),
      cancelText: GN.t('cancel'),
      danger: true
    }).then(function(ok){
      if (!ok) return;
      GN.dash.data = GN.clone(window.GN_DEFAULT_DATA);
      GN.dh.save();
    });
  });
};
/* ============================================================
   Capital Entry Form (إيداع رأس مال)
   ============================================================ */
GN.openCapitalEntryForm = function(){
  if (!GN.session.isOwner || !GN.session.isAdmin){
    GN.toast(GN.t('readOnlyNotice'), 'bad'); return;
  }

  var banks = GN.dh.list('banks');
  var bankOpts = banks.map(function(b){
    return '<option value="' + GN.escAttr(b.id) + '" data-currency="' + GN.escAttr(b.currency) + '">' + 
      GN.esc(b.name) + ' (' + GN.esc(b.currency) + ': ' + GN.formatNum(b.balance || 0) + ')</option>';
  }).join('');

  var body = document.getElementById('formModalBody');
  var titleEl = document.getElementById('formModalTitle');
  if (!body || !titleEl) return;
  titleEl.textContent = 'إيداع رأس مال';

  body.innerHTML = '<div class="form-grid">' +
    '<div class="field full"><label>الحساب المستلم <span class="req">*</span></label>' +
      '<div class="input-wrap"><select id="ce_account">' + bankOpts + '</select></div></div>' +
    '<div class="field"><label>المبلغ <span class="req">*</span></label>' +
      '<div class="input-wrap"><input type="number" id="ce_amount" step="0.01" min="0" placeholder="0"></div></div>' +
    '<div class="field"><label>العملة</label>' +
      '<div class="input-wrap"><input type="text" id="ce_currency" readonly style="background:var(--bg-alt)"></div></div>' +
    '<div class="field full"><label>البيان / المصدر</label>' +
      '<div class="input-wrap"><input type="text" id="ce_desc" placeholder="مثال: إيداع المالك" maxlength="100"></div></div>' +
  '</div>';

  var accSel = document.getElementById('ce_account');
  var curEl = document.getElementById('ce_currency');
  function syncCurrency(){
    var opt = accSel.options[accSel.selectedIndex];
    curEl.value = opt ? opt.getAttribute('data-currency') : 'SDG';
  }
  accSel.addEventListener('change', syncCurrency);
  syncCurrency();

  var sub = document.getElementById('formModalSubmit');
  if (sub) sub.style.display = '';
  GN.openModal('formModal');

  sub.onclick = function(){
    var accId = accSel.value;
    var amount = Number(document.getElementById('ce_amount').value) || 0;
    var desc = document.getElementById('ce_desc').value.trim();
    var currency = curEl.value;

    if (!amount || amount <= 0){ GN.toast('أدخل مبلغاً صحيحاً', 'bad'); return; }

    var bank = banks.filter(function(b){ return b.id === accId; })[0];
    if (!bank){ GN.toast('الحساب غير موجود', 'bad'); return; }

    var inv = GN.dh.dash().investment = GN.dh.dash().investment || {};
    inv.capital_entries = inv.capital_entries || [];

    var entry = {
      id: GN.uid(),
      amount: amount,
      currency: currency,
      description: desc || 'إيداع رأس مال',
      account_id: accId,
      account_name: bank.name,
      date: GN.now()
    };

    inv.capital_entries.push(entry);
    bank.balance = Number(bank.balance || 0) + amount;

    sub.disabled = true;
    GN.savePublicData(GN.dash.data).then(function(ok){
      sub.disabled = false;
      if (ok){
        GN.toast('تم تسجيل الإيداع وتحديث الرصيد', 'ok');
        GN.notify.send({
          type: 'add', section: 'settings', target: 'capital_entry', target_id: entry.id,
          title: 'إيداع رأس مال',
          body: GN.formatNum(amount) + ' ' + currency + ' → ' + bank.name
        });
        GN.closeModal('formModal');
        GN.renderSection('settings');
      } else {
        GN.toast(GN.t('saveFailed'), 'bad');
      }
    });
  };
};

/* ============================================================
   Debt Form (تسجيل دين)
   ============================================================ */
GN.openDebtForm = function(){
  if (!GN.session.isOwner || !GN.session.isAdmin){
    GN.toast(GN.t('readOnlyNotice'), 'bad'); return;
  }

  var banks = GN.dh.list('banks');
  var bankOpts = banks.map(function(b){
    return '<option value="' + GN.escAttr(b.id) + '" data-currency="' + GN.escAttr(b.currency) + '">' + 
      GN.esc(b.name) + ' (' + GN.esc(b.currency) + ')</option>';
  }).join('');

  var body = document.getElementById('formModalBody');
  var titleEl = document.getElementById('formModalTitle');
  if (!body || !titleEl) return;
  titleEl.textContent = 'تسجيل دين جديد';

  body.innerHTML = '<div class="form-grid">' +
    '<div class="field full"><label>الجهة الدائنة / البيان <span class="req">*</span></label>' +
      '<div class="input-wrap"><input type="text" id="df_desc" placeholder="مثال: قرض من شريك" maxlength="100"></div></div>' +
    '<div class="field"><label>المبلغ الأصلي <span class="req">*</span></label>' +
      '<div class="input-wrap"><input type="number" id="df_amount" step="0.01" min="0" placeholder="0"></div></div>' +
    '<div class="field"><label>الحساب المستلم <span class="req">*</span></label>' +
      '<div class="input-wrap"><select id="df_account">' + bankOpts + '</select></div></div>' +
    '<div class="field full"><label>العملة</label>' +
      '<div class="input-wrap"><input type="text" id="df_currency" readonly style="background:var(--bg-alt)"></div></div>' +
  '</div>';

  var accSel = document.getElementById('df_account');
  var curEl = document.getElementById('df_currency');
  function syncCurrency(){
    var opt = accSel.options[accSel.selectedIndex];
    curEl.value = opt ? opt.getAttribute('data-currency') : 'SDG';
  }
  accSel.addEventListener('change', syncCurrency);
  syncCurrency();

  var sub = document.getElementById('formModalSubmit');
  if (sub) sub.style.display = '';
  GN.openModal('formModal');

  sub.onclick = function(){
    var desc = document.getElementById('df_desc').value.trim();
    var amount = Number(document.getElementById('df_amount').value) || 0;
    var accId = accSel.value;
    var currency = curEl.value;

    if (!desc){ GN.toast('البيان مطلوب', 'bad'); return; }
    if (!amount || amount <= 0){ GN.toast('أدخل مبلغاً صحيحاً', 'bad'); return; }

    var bank = banks.filter(function(b){ return b.id === accId; })[0];
    if (!bank){ GN.toast('الحساب غير موجود', 'bad'); return; }

    var inv = GN.dh.dash().investment = GN.dh.dash().investment || {};
    inv.debts = inv.debts || [];

    var debt = {
      id: GN.uid(),
      amount: amount,
      paid_amount: 0,
      currency: currency,
      description: desc,
      account_id: accId,
      account_name: bank.name,
      status: 'active',
      payment_history: [],
      date: GN.now()
    };

    inv.debts.push(debt);
    bank.balance = Number(bank.balance || 0) + amount; // الدين يزيد السيولة

    sub.disabled = true;
    GN.savePublicData(GN.dash.data).then(function(ok){
      sub.disabled = false;
      if (ok){
        GN.toast('تم تسجيل الدين وإضافته للسيولة', 'ok');
        GN.notify.send({
          type: 'add', section: 'settings', target: 'debt', target_id: debt.id,
          title: 'دين جديد',
          body: desc + ' — ' + GN.formatNum(amount) + ' ' + currency
        });
        GN.closeModal('formModal');
        GN.renderSection('settings');
      } else {
        GN.toast(GN.t('saveFailed'), 'bad');
      }
    });
  };
};
/* ============================================================
   Debt Payment Form (سداد دفعة من دين)
   ============================================================ */
GN.openDebtPaymentForm = function(debtIdx){
  if (!GN.session.isOwner || !GN.session.isAdmin) return;

  var inv = GN.dh.dash().investment;
  var debt = inv.debts[debtIdx];
  if (!debt) return;

  var total = Number(debt.amount);
  var paid = Number(debt.paid_amount || 0);
  var remaining = total - paid;
  var debtCurrency = debt.currency;

  // جلب الحسابات (البنوك + الخزنة)
  var banks = GN.dh.list('banks');
  
  var sourceOpts = banks.map(function(b){
    return '<option value="bank_' + GN.escAttr(b.id) + '" data-currency="' + GN.escAttr(b.currency) + '">' + 
      GN.esc(b.name) + ' (' + GN.esc(b.currency) + ': ' + GN.formatNum(b.balance || 0) + ')</option>';
  }).join('');

  // إضافة وعاء الأرباح كخيار
  sourceOpts += '<option value="pool_profit" data-currency="SDG">وعاء أرباح الذهب (Profit Pool)</option>';

  var body = document.getElementById('formModalBody');
  var titleEl = document.getElementById('formModalTitle');
  titleEl.textContent = 'سداد دفعة - ' + debt.description;

  body.innerHTML = '<div class="form-grid">' +
    '<div class="field full" style="background:var(--warn-l);color:var(--warn);padding:10px;border-radius:10px;text-align:center;font-weight:700">' +
      'المتبقي: ' + GN.formatNum(remaining) + ' ' + debtCurrency +
    '</div>' +
    
    '<div class="field full"><label>مصدر السداد <span class="req">*</span></label>' +
      '<div class="input-wrap"><select id="dp_source">' + sourceOpts + '</select></div></div>' +
    
    '<div class="field"><label>المبلغ المدفوع <span class="req">*</span></label>' +
      '<div class="input-wrap"><input type="number" id="dp_amount" step="0.01" min="0" placeholder="0"></div></div>' +
      
    '<div class="field"><label>عملة السداد</label>' +
      '<div class="input-wrap"><input type="text" id="dp_pay_currency" readonly style="background:var(--bg-alt)"></div></div>' +

    '<div class="field full" id="dp_rate_wrap" style="display:none">' +
      '<label style="color:var(--nile);font-weight:700">سعر الصرف مقابل ' + debtCurrency + ' <span class="req">*</span></label>' +
      '<div class="input-wrap"><input type="number" id="dp_rate" step="0.01" min="0" placeholder="مثال: 2500"></div>' +
    '</div>' +

    '<div class="field full" style="background:var(--nile-l);color:var(--nile);padding:10px;border-radius:10px;text-align:center" id="dp_calc_preview">' +
      'سيتم خصم 0 ' + debtCurrency +
    '</div>' +

    '<div class="field full"><label>ملاحظات / مرجع التحويل</label>' +
      '<div class="input-wrap"><input type="text" id="dp_notes" placeholder="رقم الحوالة، الخ..."></div></div>' +
  '</div>';

  var sourceSel = document.getElementById('dp_source');
  var payCurEl = document.getElementById('dp_pay_currency');
  var rateWrap = document.getElementById('dp_rate_wrap');
  var rateEl = document.getElementById('dp_rate');
  var amtEl = document.getElementById('dp_amount');
  var previewEl = document.getElementById('dp_calc_preview');

  function updateUI(){
    var opt = sourceSel.options[sourceSel.selectedIndex];
    var payCur = opt.getAttribute('data-currency');
    payCurEl.value = payCur;

    if (payCur !== debtCurrency) {
      rateWrap.style.display = 'block';
      rateEl.required = true;
    } else {
      rateWrap.style.display = 'none';
      rateEl.required = false;
      rateEl.value = '';
    }
    calc();
  }

  function calc(){
    var amt = Number(amtEl.value) || 0;
    var payCur = payCurEl.value;
    var deductAmount = amt;

    if (payCur !== debtCurrency) {
      var rate = Number(rateEl.value) || 0;
      if (rate > 0) deductAmount = amt / rate; // نحسب كم يعادل بعملة الدين
    }
    
    previewEl.innerHTML = 'سيتم خصم <b>' + GN.formatNum(deductAmount, 2) + ' ' + debtCurrency + '</b> من قيمة الدين';
  }

  sourceSel.addEventListener('change', updateUI);
  amtEl.addEventListener('input', calc);
  rateEl.addEventListener('input', calc);
  updateUI();

  var sub = document.getElementById('formModalSubmit');
  if (sub) sub.style.display = '';
  GN.openModal('formModal');

  sub.onclick = function(){
    var sourceVal = sourceSel.value;
    var payCur = payCurEl.value;
    var amt = Number(amtEl.value) || 0;
    var rate = Number(rateEl.value) || 1;
    var notes = document.getElementById('dp_notes').value.trim();

    if (amt <= 0) { GN.toast('أدخل مبلغاً صحيحاً', 'bad'); return; }

    var deductAmountInDebtCur = payCur === debtCurrency ? amt : (amt / rate);
    if (deductAmountInDebtCur > remaining + 0.01) {
      GN.toast('المبلغ المدفوع أكبر من المتبقي!', 'bad'); return;
    }

    sub.disabled = true;

    // 1. خصم المبلغ من المصدر
    if (sourceVal.startsWith('bank_')) {
      var bankId = sourceVal.replace('bank_', '');
      var bank = banks.filter(function(b){ return b.id === bankId; })[0];
      if (!bank || Number(bank.balance) < amt) {
        GN.toast('رصيد الحساب لا يكفي', 'bad'); sub.disabled = false; return;
      }
      bank.balance = Number(bank.balance) - amt;
      
      // إضافة حركة صادرة في الحساب البنكي
      if (GN.addBankTransfer) {
        GN.addBankTransfer({
          bank_id: bank.id,
          type: 'out',
          amount: amt,
          currency: payCur,
          party: 'سداد دين: ' + debt.description,
          notes: notes,
          source: 'debt',
          source_id: debt.id,
          date: GN.today()
        });
      }
    } else if (sourceVal === 'pool_profit') {
      // خصم من وعاء الأرباح (يحتاج اتصال بـ Supabase)
      // ملاحظة: سنفترض هنا أن الوعاء بالجنيه SDG
      if (payCur !== 'SDG') { GN.toast('وعاء الأرباح بالجنيه فقط', 'bad'); sub.disabled = false; return; }
      
      GN.supa.from('fund_pools').select('id,balance').eq('code', 'profit').single().then(function(res){
        if (res.data) {
          var pool = res.data;
          var newBal = Number(pool.balance) - amt;
          if (newBal < 0) { GN.toast('رصيد وعاء الأرباح لا يكفي', 'bad'); sub.disabled = false; return; }
          
          GN.supa.from('fund_pools').update({ balance: newBal }).eq('id', pool.id).then(function(){
            // سجل حركة الوعاء
            GN.supa.from('fund_transactions').insert({
              pool_id: pool.id, type: 'out', amount: amt, currency: 'SDG',
              reason: 'سداد دين: ' + debt.description, notes: notes, created_by: GN.session.user.id
            }).then(function(){
              finalizePayment();
            });
          });
        }
      });
      return; // ننتظر الـ Promise
    }

    finalizePayment();

    function finalizePayment(){
      // 2. تحديث سجل الدين
      debt.paid_amount = Number(debt.paid_amount || 0) + deductAmountInDebtCur;
      debt.payment_history = debt.payment_history || [];
      
      debt.payment_history.push({
        id: GN.uid(),
        date: GN.now(),
        amount_paid: amt,
        pay_currency: payCur,
        exchange_rate: rate,
        amount_in_debt_currency: deductAmountInDebtCur,
        source_name: sourceVal.startsWith('bank_') ? 'حساب بنكي' : 'وعاء أرباح',
        notes: notes
      });

      if (Number(debt.paid_amount) >= total - 0.01) {
        debt.status = 'settled';
      }

      GN.savePublicData(GN.dash.data).then(function(ok){
        sub.disabled = false;
        if (ok) {
          GN.toast('تم تسجيل السداد بنجاح', 'ok');
          GN.closeModal('formModal');
          GN.renderSection('settings');
        } else {
          GN.toast(GN.t('saveFailed'), 'bad');
        }
      });
    }
  };
};

/* ============================================================
   View Debt History (سجل السداد)
   ============================================================ */
GN.openDebtHistory = function(debtIdx){
  var debt = GN.dh.dash().investment.debts[debtIdx];
  if (!debt) return;

  var body = document.getElementById('formModalBody');
  var titleEl = document.getElementById('formModalTitle');
  titleEl.textContent = 'سجل السداد: ' + debt.description;

  var history = debt.payment_history || [];
  var html = '<div class="table-wrap"><table><thead><tr>' +
    '<th>التاريخ</th><th>المبلغ المدفوع</th><th>المصدر</th><th>الخصم من الدين</th><th>ملاحظات</th>' +
    '</tr></thead><tbody>';

  if (!history.length) {
    html += '<tr><td colspan="5" style="text-align:center;padding:20px">لا توجد دفعات سابقة</td></tr>';
  } else {
    history.forEach(function(h){
      html += '<tr>' +
        '<td>' + GN.formatDate(h.date) + '</td>' +
        '<td class="num" dir="ltr">' + GN.formatNum(h.amount_paid) + ' ' + GN.esc(h.pay_currency) + '</td>' +
        '<td style="font-size:12px">' + GN.esc(h.source_name) + '</td>' +
        '<td class="num" dir="ltr">' + GN.formatNum(h.amount_in_debt_currency) + ' ' + GN.esc(debt.currency) + '</td>' +
        '<td style="font-size:12px;color:var(--ink-2)">' + GN.esc(h.notes || '-') + '</td>' +
      '</tr>';
    });
  }
  html += '</tbody></table></div>';
  
  body.innerHTML = html;
  var sub = document.getElementById('formModalSubmit');
  if (sub) sub.style.display = 'none'; // إخفاء زر الحفظ
  GN.openModal('formModal');
};
/* ============================================================
   Capital Entry Form (إيداع رأس مال)
   ============================================================ */
GN.openCapitalEntryForm = function(){
  if (!GN.session.isOwner || !GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }

  var banks = GN.dh.list('banks');
  var bankOpts = banks.map(function(b){
    return '<option value="' + GN.escAttr(b.id) + '" data-currency="' + GN.escAttr(b.currency) + '">' + 
      GN.esc(b.name) + ' (' + GN.esc(b.currency) + ': ' + GN.formatNum(b.balance || 0) + ')</option>';
  }).join('');

  var body = document.getElementById('formModalBody');
  var titleEl = document.getElementById('formModalTitle');
  if (!body || !titleEl) return;
  titleEl.textContent = 'إيداع رأس مال';

  body.innerHTML = '<div class="form-grid">' +
    '<div class="field full"><label>الحساب المستلم <span class="req">*</span></label>' +
      '<div class="input-wrap"><select id="ce_account">' + bankOpts + '</select></div></div>' +
    '<div class="field"><label>المبلغ <span class="req">*</span></label>' +
      '<div class="input-wrap"><input type="number" id="ce_amount" step="0.01" min="0" placeholder="0"></div></div>' +
    '<div class="field"><label>العملة</label>' +
      '<div class="input-wrap"><input type="text" id="ce_currency" readonly style="background:var(--bg-alt)"></div></div>' +
    '<div class="field full"><label>البيان / المصدر</label>' +
      '<div class="input-wrap"><input type="text" id="ce_desc" placeholder="مثال: إيداع المالك" maxlength="100"></div></div>' +
  '</div>';

  var accSel = document.getElementById('ce_account');
  var curEl = document.getElementById('ce_currency');
  function syncCurrency(){
    var opt = accSel.options[accSel.selectedIndex];
    curEl.value = opt ? opt.getAttribute('data-currency') : 'SDG';
  }
  accSel.addEventListener('change', syncCurrency);
  syncCurrency();

  var sub = document.getElementById('formModalSubmit');
  if (sub) sub.style.display = '';
  GN.openModal('formModal');

  sub.onclick = function(){
    var accId = accSel.value;
    var amount = Number(document.getElementById('ce_amount').value) || 0;
    var desc = document.getElementById('ce_desc').value.trim();
    var currency = curEl.value;

    if (!amount || amount <= 0){ GN.toast('أدخل مبلغاً صحيحاً', 'bad'); return; }

    var bank = banks.filter(function(b){ return b.id === accId; })[0];
    if (!bank){ GN.toast('الحساب غير موجود', 'bad'); return; }

    var inv = GN.dh.dash().investment = GN.dh.dash().investment || {};
    inv.capital_entries = inv.capital_entries || [];

    var entry = {
      id: GN.uid(), amount: amount, currency: currency,
      description: desc || 'إيداع رأس مال', account_id: accId,
      account_name: bank.name, date: GN.now()
    };

    inv.capital_entries.push(entry);
    bank.balance = Number(bank.balance || 0) + amount;

    sub.disabled = true;
    GN.savePublicData(GN.dash.data).then(function(ok){
      sub.disabled = false;
      if (ok){
        GN.toast('تم تسجيل الإيداع وتحديث الرصيد', 'ok');
        GN.closeModal('formModal');
        GN.renderSection('settings');
      } else {
        GN.toast(GN.t('saveFailed'), 'bad');
      }
    });
  };
};

/* ============================================================
   Debt Form (تسجيل دين)
   ============================================================ */
GN.openDebtForm = function(){
  if (!GN.session.isOwner || !GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }

  var banks = GN.dh.list('banks');
  var bankOpts = banks.map(function(b){
    return '<option value="' + GN.escAttr(b.id) + '" data-currency="' + GN.escAttr(b.currency) + '">' + 
      GN.esc(b.name) + ' (' + GN.esc(b.currency) + ')</option>';
  }).join('');

  var body = document.getElementById('formModalBody');
  var titleEl = document.getElementById('formModalTitle');
  if (!body || !titleEl) return;
  titleEl.textContent = 'تسجيل دين جديد';

  body.innerHTML = '<div class="form-grid">' +
    '<div class="field full"><label>الجهة الدائنة / البيان <span class="req">*</span></label>' +
      '<div class="input-wrap"><input type="text" id="df_desc" placeholder="مثال: قرض من شريك" maxlength="100"></div></div>' +
    '<div class="field"><label>المبلغ الأصلي <span class="req">*</span></label>' +
      '<div class="input-wrap"><input type="number" id="df_amount" step="0.01" min="0" placeholder="0"></div></div>' +
    '<div class="field"><label>الحساب المستلم <span class="req">*</span></label>' +
      '<div class="input-wrap"><select id="df_account">' + bankOpts + '</select></div></div>' +
    '<div class="field full"><label>العملة</label>' +
      '<div class="input-wrap"><input type="text" id="df_currency" readonly style="background:var(--bg-alt)"></div></div>' +
  '</div>';

  var accSel = document.getElementById('df_account');
  var curEl = document.getElementById('df_currency');
  function syncCurrency(){
    var opt = accSel.options[accSel.selectedIndex];
    curEl.value = opt ? opt.getAttribute('data-currency') : 'SDG';
  }
  accSel.addEventListener('change', syncCurrency);
  syncCurrency();

  var sub = document.getElementById('formModalSubmit');
  if (sub) sub.style.display = '';
  GN.openModal('formModal');

  sub.onclick = function(){
    var desc = document.getElementById('df_desc').value.trim();
    var amount = Number(document.getElementById('df_amount').value) || 0;
    var accId = accSel.value;
    var currency = curEl.value;

    if (!desc){ GN.toast('البيان مطلوب', 'bad'); return; }
    if (!amount || amount <= 0){ GN.toast('أدخل مبلغاً صحيحاً', 'bad'); return; }

    var bank = banks.filter(function(b){ return b.id === accId; })[0];
    if (!bank){ GN.toast('الحساب غير موجود', 'bad'); return; }

    var inv = GN.dh.dash().investment = GN.dh.dash().investment || {};
    inv.debts = inv.debts || [];

    var debt = {
      id: GN.uid(), amount: amount, paid_amount: 0, currency: currency,
      description: desc, account_id: accId, account_name: bank.name,
      status: 'active', payment_history: [], date: GN.now()
    };

    inv.debts.push(debt);
    bank.balance = Number(bank.balance || 0) + amount; // الدين يزيد السيولة

    sub.disabled = true;
    GN.savePublicData(GN.dash.data).then(function(ok){
      sub.disabled = false;
      if (ok){
        GN.toast('تم تسجيل الدين وإضافته للسيولة', 'ok');
        GN.closeModal('formModal');
        GN.renderSection('settings');
      } else {
        GN.toast(GN.t('saveFailed'), 'bad');
      }
    });
  };
};

/* ============================================================
   Debt Payment Form (سداد دفعة من دين) - الإصدار النهائي
   ============================================================ */
GN.openDebtPaymentForm = function(defaultIdx){
  if (!GN.session.isOwner || !GN.session.isAdmin) return;

  var inv = GN.dh.dash().investment = GN.dh.dash().investment || {};
  var allDebts = inv.debts || [];
  
  var activeDebts = [];
  allDebts.forEach(function(d, idx) {
    var rem = Number(d.amount) - Number(d.paid_amount || 0);
    if (rem > 0.01) activeDebts.push({ debt: d, originalIdx: idx });
  });

  if (!activeDebts.length) { GN.toast('لا توجد ديون نشطة للسداد', 'bad'); return; }

  var debtOpts = activeDebts.map(function(item) {
    var d = item.debt;
    var rem = Number(d.amount) - Number(d.paid_amount || 0);
    return '<option value="' + item.originalIdx + '">' + 
      GN.esc(d.description) + ' (متبقي: ' + GN.formatNum(rem) + ' ' + d.currency + ')' + 
      '</option>';
  }).join('');

  var banks = GN.dh.list('banks');
  var sourceOpts = banks.map(function(b){
    return '<option value="bank_' + GN.escAttr(b.id) + '" data-currency="' + GN.escAttr(b.currency) + '">' + 
      GN.esc(b.name) + ' (' + GN.esc(b.currency) + ': ' + GN.formatNum(b.balance || 0) + ')</option>';
  }).join('');
  sourceOpts += '<option value="pool_profit" data-currency="SDG">وعاء أرباح الذهب (Profit Pool)</option>';

  var body = document.getElementById('formModalBody');
  var titleEl = document.getElementById('formModalTitle');
  titleEl.textContent = 'سداد دفعة من الديون';

  body.innerHTML = '<div class="form-grid">' +
    '<div class="field full"><label>اختر الدين <span class="req">*</span></label>' +
      '<div class="input-wrap"><select id="dp_debt_idx">' + debtOpts + '</select></div></div>' +
    '<div class="field full"><label>مصدر السداد <span class="req">*</span></label>' +
      '<div class="input-wrap"><select id="dp_source">' + sourceOpts + '</select></div></div>' +
    '<div class="field"><label>المبلغ المدفوع <span class="req">*</span></label>' +
      '<div class="input-wrap"><input type="number" id="dp_amount" step="0.01" min="0" placeholder="0"></div></div>' +
    '<div class="field"><label>عملة السداد</label>' +
      '<div class="input-wrap"><input type="text" id="dp_pay_currency" readonly style="background:var(--bg-alt)"></div></div>' +
    '<div class="field full" id="dp_rate_wrap" style="display:none">' +
      '<label style="color:var(--nile);font-weight:700">سعر الصرف مقابل عملة الدين <span class="req">*</span></label>' +
      '<div class="input-wrap"><input type="number" id="dp_rate" step="0.01" min="0" placeholder="مثال: 2500"></div></div>' +
    '<div class="field full" style="background:var(--nile-l);color:var(--nile);padding:10px;border-radius:10px;text-align:center" id="dp_calc_preview">سيتم خصم 0 من قيمة الدين</div>' +
    '<div class="field full"><label>ملاحظات</label>' +
      '<div class="input-wrap"><input type="text" id="dp_notes" placeholder="رقم الحوالة..."></div></div>' +
  '</div>';

  var debtSel = document.getElementById('dp_debt_idx');
  var sourceSel = document.getElementById('dp_source');
  var payCurEl = document.getElementById('dp_pay_currency');
  var rateWrap = document.getElementById('dp_rate_wrap');
  var rateEl = document.getElementById('dp_rate');
  var amtEl = document.getElementById('dp_amount');
  var previewEl = document.getElementById('dp_calc_preview');

  function getSelectedDebt() { return allDebts[Number(debtSel.value)]; }

  function updateUI(){
    var debt = getSelectedDebt();
    var opt = sourceSel.options[sourceSel.selectedIndex];
    var payCur = opt.getAttribute('data-currency');
    
    payCurEl.value = payCur;
    if (payCur !== debt.currency) {
      rateWrap.style.display = 'block'; rateEl.required = true;
    } else {
      rateWrap.style.display = 'none'; rateEl.required = false; rateEl.value = '';
    }
    calc();
  }

    function calc(){
    var debt = getSelectedDebt();
    var amt = Number(amtEl.value) || 0;
    var payCur = payCurEl.value;
    var deductAmount = amt;
    var sourceVal = sourceSel.value;

    // حساب المبلغ المخصوم من الدين
    if (payCur !== debt.currency) {
      var rate = Number(rateEl.value) || 0;
      if (rate > 0) deductAmount = amt / rate;
    }

    // جلب رصيد المصدر الحالي
    var sourceBalance = 0;
    if (sourceVal.startsWith('bank_')) {
      var bankId = sourceVal.replace('bank_', '');
      var bank = banks.filter(function(b){ return b.id === bankId; })[0];
      if (bank) sourceBalance = Number(bank.balance || 0);
    } else if (sourceVal === 'pool_profit') {
      // وعاء الأرباح نتحقق منه عند الحفظ لأن رصيده في قاعدة البيانات
      sourceBalance = 999999999; // نتركه يمر هنا
    }

    // عرض النتيجة
    previewEl.innerHTML = 'سيتم خصم <b>' + GN.formatNum(deductAmount, 2) + ' ' + debt.currency + '</b> من قيمة الدين';

    // التحقق من كفاية الرصيد
    if (sourceVal.startsWith('bank_') && amt > sourceBalance) {
      previewEl.innerHTML = '<span style="color:var(--bad)">⚠️ رصيد الحساب غير كافٍ! (المتاح: ' + GN.formatNum(sourceBalance) + ' ' + payCur + ')</span>';
      previewEl.style.background = 'var(--bad-l)';
    } else {
      previewEl.style.background = 'var(--nile-l)';
    }
  }

  if (defaultIdx != null && defaultIdx !== undefined) debtSel.value = defaultIdx;

  debtSel.addEventListener('change', updateUI);
  sourceSel.addEventListener('change', updateUI);
  amtEl.addEventListener('input', calc);
  rateEl.addEventListener('input', calc);
  updateUI();

  var sub = document.getElementById('formModalSubmit');
  if (sub) sub.style.display = '';
  GN.openModal('formModal');

  sub.onclick = function(){
    var debtIdx = Number(debtSel.value);
    var debt = allDebts[debtIdx];
    var sourceVal = sourceSel.value;
    var payCur = payCurEl.value;
    var amt = Number(amtEl.value) || 0;
    var rate = Number(rateEl.value) || 1;
    var notes = document.getElementById('dp_notes').value.trim();
    var remaining = Number(debt.amount) - Number(debt.paid_amount || 0);

    if (amt <= 0) { GN.toast('أدخل مبلغاً صحيحاً', 'bad'); return; }
    var deductAmountInDebtCur = payCur === debt.currency ? amt : (amt / rate);
    if (deductAmountInDebtCur > remaining + 0.01) { GN.toast('المبلغ المدفوع أكبر من المتبقي!', 'bad'); return; }

    sub.disabled = true;

    if (sourceVal.startsWith('bank_')) {
      var bankId = sourceVal.replace('bank_', '');
      var bank = banks.filter(function(b){ return b.id === bankId; })[0];
      
      if (Number(bank.balance) < amt) { GN.toast('رصيد الحساب لا يكفي!', 'bad'); sub.disabled = false; return; }
      
      var newBal = Number(bank.balance) - amt;
      bank.balance = newBal < 0.01 ? 0 : newBal; // تصفير السالب
      
      if (GN.addBankTransfer) {
        GN.addBankTransfer({
          bank_id: bank.id, type: 'out', amount: amt, currency: payCur,
          party: 'سداد دين: ' + debt.description, notes: notes,
          source: 'debt', source_id: debt.id, date: GN.today()
        });
      }
    } else if (sourceVal === 'pool_profit') {
      if (payCur !== 'SDG') { GN.toast('وعاء الأرباح بالجنيه فقط', 'bad'); sub.disabled = false; return; }
      
      GN.supa.from('fund_pools').select('id,balance').eq('code', 'profit').single().then(function(res){
        if (res.data) {
          var pool = res.data;
          var newBal = Number(pool.balance) - amt;
          if (newBal < 0) { GN.toast('رصيد وعاء الأرباح لا يكفي', 'bad'); sub.disabled = false; return; }
          
          GN.supa.from('fund_pools').update({ balance: newBal }).eq('id', pool.id).then(function(){
            GN.supa.from('fund_transactions').insert({
              pool_id: pool.id, type: 'out', amount: amt, currency: 'SDG',
              reason: 'سداد دين: ' + debt.description, notes: notes, created_by: GN.session.user.id
            }).then(function(){ finalizePayment(); });
          });
        }
      });
      return;
    }

    finalizePayment();

    function finalizePayment(){
      debt.paid_amount = Number(debt.paid_amount || 0) + deductAmountInDebtCur;
      debt.payment_history = debt.payment_history || [];
      debt.payment_history.push({
        id: GN.uid(), date: GN.now(), amount_paid: amt, pay_currency: payCur,
        exchange_rate: rate, amount_in_debt_currency: deductAmountInDebtCur,
        source_name: sourceVal.startsWith('bank_') ? 'حساب بنكي' : 'وعاء أرباح', notes: notes
      });

      if (Number(debt.paid_amount) >= Number(debt.amount) - 0.01) debt.status = 'settled';

      GN.savePublicData(GN.dash.data).then(function(ok){
        sub.disabled = false;
        if (ok) {
          GN.toast('تم تسجيل السداد وتحديث الأرصدة', 'ok');
          GN.closeModal('formModal');
          GN.renderSection('settings');
        } else {
          GN.toast(GN.t('saveFailed'), 'bad');
        }
      });
    }
  };
};
/* ============================================================
   1. Debts Section (شاشة الديون والالتزامات)
   ============================================================ */
GN.sections.debts = function(){
  var inv = GN.dh.dash().investment = GN.dh.dash().investment || {};
  var debtList = inv.debts || [];
  var isAdmin = GN.session.isOwner && GN.session.isAdmin;

  var html = '<div class="fin-head"><div>' +
    '<h2>' + GN.navIcon('dollar') + ' الديون والالتزامات</h2>' +
    '<span class="sub">إدارة ديون الشركة وسجل السداد</span></div>' +
    (isAdmin ? '<button class="btn btn-danger btn-sm" data-act="add-debt">+ تسجيل دين</button>' : '') +
  '</div>';

  if (!debtList.length) {
    html += '<div class="card"><div class="empty"><div class="ic">' + GN.navIcon('dollar') + '</div>' +
      '<h4>لا توجد ديون مسجلة</h4><p>اضغط "تسجيل دين" للبدء</p></div></div>';
    return html;
  }

  html += '<div class="kpi-grid" style="grid-template-columns:repeat(auto-fit,minmax(320px,1fr))">';
  
  debtList.forEach(function(d, i){
    var total = Number(d.amount) || 0;
    var paid = Number(d.paid_amount) || 0;
    var remaining = total - paid;
    var isSettled = remaining <= 0.01;
    
    var statusChip = isSettled 
      ? '<span class="chip ok"><span class="dot"></span>مُسدد</span>' 
      : '<span class="chip w"><span class="dot"></span>نشط</span>';

    html += '<div class="card" style="margin:0">' +
      '<div class="card-head">' +
        '<h3>' + GN.esc(d.description) + '</h3>' +
        statusChip +
      '</div>' +
      '<div style="font-size:12px;color:var(--ink-2);line-height:1.9">' +
        '<div><b>تاريخ الأخذ:</b> ' + GN.formatDate(d.date) + '</div>' +
        '<div><b>الحساب المستلم:</b> ' + GN.esc(d.account_name) + '</div>' +
      '</div>' +
      '<div style="margin-top:14px;padding-top:14px;border-top:1px dashed var(--line);text-align:center">' +
        '<div class="lbl" style="font-size:11.5px;color:var(--ink-2)">المتبقي من الدين</div>' +
        '<div style="font-family:\'Reem Kufi\',sans-serif;font-size:26px;font-weight:700;color:' + (isSettled ? 'var(--ink)' : 'var(--bad)') + ';margin-top:4px">' +
          '<bdi>' + GN.formatNum(remaining) + '</bdi> <span style="font-size:13px;color:var(--ink-2)">' + GN.esc(d.currency) + '</span></div></div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px">' +
        '<div style="text-align:center;padding:8px;background:var(--bg);border-radius:10px">' +
          '<div style="font-size:10.5px;color:var(--ink-3);font-weight:700">الأصلي</div>' +
          '<div style="font-weight:700;color:var(--ink)">' + GN.formatNum(total) + '</div></div>' +
        '<div style="text-align:center;padding:8px;background:var(--ok-l);border-radius:10px">' +
          '<div style="font-size:10.5px;color:var(--ok);font-weight:700">المسدد</div>' +
          '<div style="font-weight:700;color:var(--ok)">' + GN.formatNum(paid) + '</div></div>' +
      '</div>' +
      '<div style="display:flex;gap:8px;margin-top:12px">' +
        (!isSettled && isAdmin ? '<button class="btn btn-pri btn-sm" style="flex:1" data-act="pay-debt" data-idx="' + i + '">سداد دفعة</button>' : '') +
        '<button class="btn btn-sec btn-sm" style="flex:1" data-act="view-debt" data-idx="' + i + '">السجل</button>' +
      '</div></div>';
  });
  
  html += '</div>';
  return html;
};

GN.bindSection.debts = function(){
  GN.bindAction('add-debt', function(){ GN.openDebtForm(); });
  GN.bindAction('pay-debt', function(btn){ GN.openDebtPaymentForm(btn.getAttribute('data-idx')); });
  GN.bindAction('view-debt', function(btn){ GN.openDebtHistory(btn.getAttribute('data-idx')); });
};


/* ============================================================
   2. Partners Wallets Section (محافظ الشركاء + احتجاز الأرباح)
   ============================================================ */
GN.sections.partners = function(){
  var isAdmin = GN.session.isOwner && GN.session.isAdmin;
  var html = '<div class="fin-head"><div>' +
    '<h2>' + GN.navIcon('users') + ' محافظ الشركاء والأرباح</h2>' +
    '<span class="sub">' + (isAdmin ? 'إدارة نسب الشركاء وتوزيع الأرباح' : 'محفظتك الشخصية والأرباح') + '</span></div>' +
  '</div>';
  html += '<div id="partnersWrap"><div class="empty"><h4>' + GN.esc(GN.t('loading')) + '</h4></div></div>';
  setTimeout(GN.loadPartnersWallets, 100);
  return html;
};

GN.loadPartnersWallets = function(){
  if (!GN.supa) return;
  
  GN.supa.from('profiles').select('*').order('created_at', { ascending: true }).then(function(res){
    var wrap = document.getElementById('partnersWrap');
    if (!wrap) return;
    
    var profiles = res.data || [];
    var inv = GN.dh.dash().investment = GN.dh.dash().investment || {};
    var wallets = inv.partner_wallets || {};
    var retainedProfit = Number(inv.retained_profit || 0); 
    var exchangeRate = 2500; // سعر الصرف الافتراضي للدولار (يمكنك ربطه بحقل في الإعدادات لاحقاً)
    var isAdmin = GN.session.isOwner && GN.session.isAdmin;
    
    // --- واجهة الشريك ---
    if (!isAdmin) {
      var myWallet = wallets[GN.session.user.id] || { percentage: 0, balance_sdg: 0, balance_usd: 0, history: [] };
      
      var html = '<div class="kpi-grid" style="grid-template-columns:1fr 1fr 1fr; margin-bottom:14px">' +
        '<div class="kpi hl"><div class="top"><span class="ic">' + GN.navIcon('wallet') + '</span></div>' +
        '<div class="lbl">أرباحك بالجنيه</div><div class="val" style="color:var(--gold-d);font-size:22px">' + GN.formatNum(myWallet.balance_sdg || 0) + ' <span class="cur">SDG</span></div></div>' +
        
        '<div class="kpi hl"><div class="top"><span class="ic">' + GN.navIcon('dollar') + '</span></div>' +
        '<div class="lbl">أرباحك بالدولار</div><div class="val" style="color:var(--ok);font-size:22px">' + GN.formatNum(myWallet.balance_usd || 0) + ' <span class="cur">USD</span></div></div>' +
        
        '<div class="kpi"><div class="top"><span class="ic g">' + GN.navIcon('chart') + '</span></div>' +
        '<div class="lbl">نسبتك</div><div class="val">' + (myWallet.percentage || 0) + '%</div></div>' +
      '</div>';

      html += '<div style="text-align:end;margin-bottom:14px">' +
        '<button class="btn btn-gold" data-act="withdraw-profit">سحب الأرباح (Withdraw)</button>' +
      '</div>';

      html += '<div class="card"><div class="card-head"><h3>سجل الحركات (توزيعات وسحوبات)</h3></div>';
      html += '<div class="table-wrap"><table><thead><tr><th>التاريخ</th><th>العملية</th><th>المبلغ</th><th>البيان</th></tr></thead><tbody>';
      var history = myWallet.history || [];
      if (!history.length) {
        html += '<tr><td colspan="4" style="text-align:center;padding:20px">لا توجد حركات سابقة</td></tr>';
      } else {
        history.forEach(function(h){
          var isWithdraw = h.type === 'withdraw';
          html += '<tr>' +
            '<td>' + GN.formatDate(h.date) + '</td>' +
            '<td>' + (isWithdraw ? '<span class="chip b">سحب</span>' : '<span class="chip ok">إيداع أرباح</span>') + '</td>' +
            '<td class="num" style="color:' + (isWithdraw ? 'var(--bad)' : 'var(--ok)') + '">' + 
              (isWithdraw ? '-' : '+') + GN.formatNum(h.amount) + ' ' + h.currency + 
              (h.exchange_rate && h.exchange_rate !== 1 ? '<div style="font-size:10px;color:var(--ink-3)">(سعر الصرف: ' + h.exchange_rate + ')</div>' : '') + 
            '</td>' +
            '<td>' + GN.esc(h.notes) + '</td>' +
          '</tr>';
        });
      }
      html += '</tbody></table></div></div>';
      
      wrap.innerHTML = html;
      GN.bindAction('withdraw-profit', function(){ GN.openWithdrawForm(myWallet, inv); });
      return;
    }

    // --- واجهة المالك ---
    // ... (بقية كود المالك كما هو، أضفنا فقط balance_usd للحساب)
    var totalSdg = 0, totalUsd = 0;
    Object.values(wallets).forEach(function(w) {
      totalSdg += Number(w.balance_sdg || 0);
      totalUsd += Number(w.balance_usd || 0);
    });

    var html = '<div class="kpi-grid" style="margin-bottom:14px">' +
        '<div class="kpi hl"><div class="top"><span class="ic">' + GN.navIcon('wallet') + '</span></div>' +
        '<div class="lbl">إجمالي محافظ الشركاء (SDG)</div><div class="val">' + GN.formatNum(totalSdg) + ' <span class="cur">SDG</span></div></div>' +
        
        '<div class="kpi hl"><div class="top"><span class="ic">' + GN.navIcon('dollar') + '</span></div>' +
        '<div class="lbl">إجمالي محافظ الشركاء (USD)</div><div class="val">' + GN.formatNum(totalUsd) + ' <span class="cur">USD</span></div></div>' +

        '<div class="kpi"><div class="top"><span class="ic ok">' + GN.navIcon('check') + '</span></div>' +
        '<div class="lbl">أرباح الشركة المحتجزة</div><div class="val" style="color:var(--nile)">' + GN.formatNum(retainedProfit) + ' <span class="cur">SDG</span></div></div>' +
    '</div>';

    html += '<div class="card"><div class="card-head">' +
      '<h3>' + GN.navIcon('users') + ' قائمة الشركاء</h3>' +
      '<div style="display:flex; gap:6px">' +
        '<button class="btn btn-sec btn-sm" data-act="retain-profit">+ احتجاز أرباح</button>' +
        '<button class="btn btn-gold btn-sm" data-act="distribute-profits">+ توزيع أرباح</button>' +
      '</div>' +
    '</div>';
    
    html += '<div class="table-wrap"><table><thead><tr>' +
      '<th>الشريك</th><th>النسبة %</th><th>الرصيد (SDG)</th><th>الرصيد (USD)</th><th>إجراءات</th>' +
    '</tr></thead><tbody>';

    profiles.forEach(function(p){
      var wallet = wallets[p.auth_user_id] || { percentage: 0, balance_sdg: 0, balance_usd: 0, history: [] };
      var pctVal = wallet.percentage || 0;
      
      html += '<tr>' +
        '<td><b>' + GN.esc(p.full_name || p.email) + '</b></td>' +
        '<td><input type="number" class="pct-input" data-uid="' + p.auth_user_id + '" value="' + pctVal + '" style="width:70px; padding:4px; border:1px solid var(--line); border-radius:6px" min="0" max="100"> %</td>' +
        '<td class="num" style="font-weight:800; color:var(--gold-d)">' + GN.formatNum(wallet.balance_sdg || 0) + '</td>' +
        '<td class="num" style="font-weight:800; color:var(--ok)">' + GN.formatNum(wallet.balance_usd || 0) + '</td>' +
        '<td><button class="icon-act" data-act="view-partner" data-uid="' + p.auth_user_id + '" title="سجل التوزيعات"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg></button></td>' +
      '</tr>';
    });

    html += '</tbody></table></div>' +
      '<div style="text-align:end;margin-top:14px"><button class="btn btn-pri" data-act="save-partners-pct">حفظ النسب</button></div></div>';

    wrap.innerHTML = html;
    
    GN.bindAction('save-partners-pct', function(){
      GN.$$('.pct-input').forEach(function(inp){
        var uid = inp.getAttribute('data-uid');
        if (!wallets[uid]) wallets[uid] = { percentage: 0, balance_sdg: 0, balance_usd: 0, history: [] };
        wallets[uid].percentage = Number(inp.value) || 0;
      });
      inv.partner_wallets = wallets;
      GN.savePublicData(GN.dash.data).then(function(){ GN.toast('تم حفظ النسب', 'ok'); });
    });

    GN.bindAction('retain-profit', function(){ GN.openRetainProfitForm(inv); });
    GN.bindAction('distribute-profits', function(){ GN.openDistributeProfitsForm(profiles, wallets, inv, exchangeRate); });
    GN.bindAction('view-partner', function(btn){
      var uid = btn.getAttribute('data-uid');
      var profile = profiles.filter(function(x){ return x.auth_user_id === uid; })[0];
      GN.openPartnerHistory(profile, wallets[uid]);
    });
  });
};  

GN.loadPartnersWallets = function(){
  if (!GN.supa) return;
  
  GN.supa.from('profiles').select('*').order('created_at', { ascending: true }).then(function(res){
    var wrap = document.getElementById('partnersWrap');
    if (!wrap) return;
    
    var profiles = res.data || [];
    var inv = GN.dh.dash().investment = GN.dh.dash().investment || {};
    var wallets = inv.partner_wallets || {};
    var retainedProfit = Number(inv.retained_profit || 0); // الأرباح المحتجزة
    var isAdmin = GN.session.isOwner && GN.session.isAdmin;
    
    // --- واجهة الشريك (يظهر له فقط محفظته) ---
    if (!isAdmin) {
      var myWallet = wallets[GN.session.user.id] || { percentage: 0, balance: 0, history: [] };
      
      var html = '<div class="kpi-grid" style="grid-template-columns:1fr 1fr 1fr; margin-bottom:14px">' +
        '<div class="kpi hl"><div class="top"><span class="ic">' + GN.navIcon('wallet') + '</span></div>' +
        '<div class="lbl">رصيد أرباحك</div><div class="val" style="color:var(--gold-d);font-size:22px">' + GN.formatNum(myWallet.balance || 0) + ' <span class="cur">SDG</span></div></div>' +
        
        '<div class="kpi"><div class="top"><span class="ic g">' + GN.navIcon('chart') + '</span></div>' +
        '<div class="lbl">نسبتك في الشركة</div><div class="val">' + (myWallet.percentage || 0) + '%</div></div>' +

        '<div class="kpi"><div class="top"><span class="ic ok">' + GN.navIcon('check') + '</span></div>' +
        '<div class="lbl">أرباح محتجزة (للشركة)</div><div class="val" style="color:var(--nile)">' + GN.formatNum(retainedProfit) + ' <span class="cur">SDG</span></div></div>' +
      '</div>';

      html += '<div class="card"><div class="card-head"><h3>سجل أرباحك السابقة</h3></div>';
      html += '<div class="table-wrap"><table><thead><tr><th>التاريخ</th><th>المبلغ المستلم</th><th>البيان</th></tr></thead><tbody>';
      var history = myWallet.history || [];
      if (!history.length) {
        html += '<tr><td colspan="3" style="text-align:center;padding:20px">لا توجد توزيعات أرباح سابقة</td></tr>';
      } else {
        history.forEach(function(h){
          html += '<tr><td>' + GN.formatDate(h.date) + '</td><td class="num" style="color:var(--ok)">+' + GN.formatNum(h.amount) + ' SDG</td><td>' + GN.esc(h.notes) + '</td></tr>';
        });
      }
      html += '</tbody></table></div></div>';
      
      wrap.innerHTML = html;
      return;
    }

    // --- واجهة المالك (يرى كل شيء) ---
    var html = '<div class="kpi-grid" style="margin-bottom:14px">' +
        '<div class="kpi hl"><div class="top"><span class="ic">' + GN.navIcon('wallet') + '</span></div>' +
        '<div class="lbl">إجمالي أرصدة محافظ الشركاء</div><div class="val">' + GN.formatNum(Object.values(wallets).reduce((s, w) => s + Number(w.balance || 0), 0)) + ' <span class="cur">SDG</span></div></div>' +
        
        '<div class="kpi"><div class="top"><span class="ic ok">' + GN.navIcon('check') + '</span></div>' +
        '<div class="lbl">أرباح الشركة المحتجزة</div><div class="val" style="color:var(--nile)">' + GN.formatNum(retainedProfit) + ' <span class="cur">SDG</span></div></div>' +
    '</div>';

    html += '<div class="card"><div class="card-head">' +
      '<h3>' + GN.navIcon('users') + ' قائمة الشركاء</h3>' +
      '<div style="display:flex; gap:6px">' +
        '<button class="btn btn-sec btn-sm" data-act="retain-profit">+ احتجاز أرباح</button>' +
        '<button class="btn btn-gold btn-sm" data-act="distribute-profits">+ توزيع أرباح</button>' +
      '</div>' +
    '</div>';
    
    html += '<div class="table-wrap"><table><thead><tr>' +
      '<th>الشريك</th><th>الدور</th><th>النسبة %</th><th>المحفظة الحالية</th><th>إجراءات</th>' +
    '</tr></thead><tbody>';

    profiles.forEach(function(p){
      var wallet = wallets[p.auth_user_id] || { percentage: 0, balance: 0, history: [] };
      var pctVal = wallet.percentage || 0;
      
      html += '<tr>' +
        '<td><b>' + GN.esc(p.full_name || p.email) + '</b></td>' +
        '<td>' + (p.role === 'owner' ? 'مالك' : 'شريك') + '</td>' +
        '<td><input type="number" class="pct-input" data-uid="' + p.auth_user_id + '" value="' + pctVal + '" style="width:70px; padding:4px; border:1px solid var(--line); border-radius:6px" min="0" max="100"> %</td>' +
        '<td class="num" style="font-weight:800; color:var(--gold-d)">' + GN.formatNum(wallet.balance || 0) + ' SDG</td>' +
        '<td><button class="icon-act" data-act="view-partner" data-uid="' + p.auth_user_id + '" title="سجل التوزيعات"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg></button></td>' +
      '</tr>';
    });

    html += '</tbody></table></div>' +
      '<div style="text-align:end;margin-top:14px"><button class="btn btn-pri" data-act="save-partners-pct">حفظ النسب</button></div></div>';

    wrap.innerHTML = html;
    
    GN.bindAction('save-partners-pct', function(){
      GN.$$('.pct-input').forEach(function(inp){
        var uid = inp.getAttribute('data-uid');
        if (!wallets[uid]) wallets[uid] = { percentage: 0, balance: 0, history: [] };
        wallets[uid].percentage = Number(inp.value) || 0;
      });
      inv.partner_wallets = wallets;
      GN.savePublicData(GN.dash.data).then(function(){ GN.toast('تم حفظ النسب', 'ok'); });
    });

    GN.bindAction('retain-profit', function(){ GN.openRetainProfitForm(inv); });
    GN.bindAction('distribute-profits', function(){ GN.openDistributeProfitsForm(profiles, wallets, inv); });

    GN.bindAction('view-partner', function(btn){
      var uid = btn.getAttribute('data-uid');
      var profile = profiles.filter(function(x){ return x.auth_user_id === uid; })[0];
      GN.openPartnerHistory(profile, wallets[uid]);
    });
  });
};

/* نموذج احتجاز أرباح للشركة */
GN.openRetainProfitForm = function(inv){
  var body = document.getElementById('formModalBody');
  document.getElementById('formModalTitle').textContent = 'احتجاز أرباح للشركة';

  body.innerHTML = '<div class="form-grid">' +
    '<div class="field full" style="background:var(--nile-l);color:var(--nile);padding:10px;border-radius:10px;text-align:center">' +
      'الأرباح المحتجزة الحالية: ' + GN.formatNum(inv.retained_profit || 0) + ' SDG' +
    '</div>' +
    '<div class="field full"><label>المبلغ المراد احتجازه (SDG) <span class="req">*</span></label>' +
      '<div class="input-wrap"><input type="number" id="ret_amount" placeholder="مثلاً: 50000"></div>' +
    '</div>' +
    '<div class="field full"><label>البيان / السبب</label>' +
      '<div class="input-wrap"><input type="text" id="ret_notes" value="احتجاز أرباح شهر"></div>' +
    '</div>' +
  '</div>';

  var sub = document.getElementById('formModalSubmit');
  sub.style.display = '';
  GN.openModal('formModal');

  sub.onclick = function(){
    var amt = Number(document.getElementById('ret_amount').value) || 0;
    if (amt <= 0) { GN.toast('أدخل مبلغاً صحيحاً', 'bad'); return; }

    inv.retained_profit = Number(inv.retained_profit || 0) + amt;
    
    GN.savePublicData(GN.dash.data).then(function(ok){
      if (ok) { GN.toast('تم احتجاز الأرباح', 'ok'); GN.closeModal('formModal'); GN.loadPartnersWallets(); }
    });
  };
};

/* نموذج سحب الأرباح من المحفظة */
GN.openWithdrawForm = function(wallet, inv){
  var body = document.getElementById('formModalBody');
  document.getElementById('formModalTitle').textContent = 'سحب الأرباح';
  
  var exchangeRate = 2500; // افتراضي

  body.innerHTML = '<div class="form-grid">' +
    '<div class="field full" style="background:var(--ok-l);color:var(--ok);padding:10px;border-radius:10px;text-align:center;font-weight:700">' +
      'المتاح: ' + GN.formatNum(wallet.balance_sdg || 0) + ' SDG / ' + GN.formatNum(wallet.balance_usd || 0) + ' USD' +
    '</div>' +
    '<div class="field"><label>سحب من عملة</label>' +
      '<div class="input-wrap"><select id="wd_curr"><option value="SDG">جنيه سوداني (SDG)</option><option value="USD">دولار أمريكي (USD)</option></select></div>' +
    '</div>' +
    '<div class="field"><label>المبلغ <span class="req">*</span></label>' +
      '<div class="input-wrap"><input type="number" id="wd_amount" placeholder="0"></div>' +
    '</div>' +
    '<div class="field full"><label>البيان / ملاحظات</label>' +
      '<div class="input-wrap"><input type="text" id="wd_notes" value="سحب أرباح شخصية"></div>' +
    '</div>' +
  '</div>';

  var sub = document.getElementById('formModalSubmit');
  sub.style.display = '';
  GN.openModal('formModal');

  sub.onclick = function(){
    var curr = document.getElementById('wd_curr').value;
    var amt = Number(document.getElementById('wd_amount').value) || 0;
    var notes = document.getElementById('wd_notes').value;

    if (amt <= 0) { GN.toast('أدخل مبلغاً صحيحاً', 'bad'); return; }

    if (curr === 'SDG' && amt > Number(wallet.balance_sdg || 0)) { GN.toast('رصيد الجنيه غير كافٍ', 'bad'); return; }
    if (curr === 'USD' && amt > Number(wallet.balance_usd || 0)) { GN.toast('رصيد الدولار غير كافٍ', 'bad'); return; }

    // خصم المبلغ
    if (curr === 'SDG') wallet.balance_sdg = Number(wallet.balance_sdg) - amt;
    else wallet.balance_usd = Number(wallet.balance_usd) - amt;

    // تسجيل الحركة
    wallet.history = wallet.history || [];
    wallet.history.push({
      id: GN.uid(),
      date: GN.now(),
      type: 'withdraw',
      amount: amt,
      currency: curr,
      notes: notes
    });

    GN.savePublicData(GN.dash.data).then(function(ok){
      if (ok) {
        GN.toast('تم السحب بنجاح', 'ok');
        GN.closeModal('formModal');
        GN.loadPartnersWallets();
      }
    });
  };
};
GN.openDistributeProfitsForm = function(profiles, wallets, inv, exchangeRate){
  var body = document.getElementById('formModalBody');
  var titleEl = document.getElementById('formModalTitle');
  titleEl.textContent = 'توزيع الأرباح الشهرية';

  var inputsHtml = '';
  var totalPct = 0;
  profiles.forEach(function(p){
    var w = wallets[p.auth_user_id] || { percentage: 0 };
    totalPct += Number(w.percentage || 0);
    if (w.percentage > 0) {
      inputsHtml += '<tr>' +
        '<td>' + GN.esc(p.full_name || p.email) + ' (' + w.percentage + '%)</td>' +
        '<td><input type="number" class="dist-input" data-uid="' + p.auth_user_id + '" data-pct="' + w.percentage + '" style="width:120px;padding:4px;border:1px solid var(--line);border-radius:6px" placeholder="0"></td>' +
      '</tr>';
    }
  });

  body.innerHTML = '<div class="form-grid">' +
    '<div class="field full" style="background:var(--nile-l);color:var(--nile);padding:10px;border-radius:10px;text-align:center">' +
      'إجمالي نسب الشركاء المسجلة: ' + totalPct + '%' +
    '</div>' +
    '<div class="field"><label>العملة الموزعة</label>' +
      '<div class="input-wrap"><select id="dist_curr"><option value="SDG">جنيه سوداني (SDG)</option><option value="USD">دولار أمريكي (USD)</option></select></div>' +
    '</div>' +
    '<div class="field"><label>إجمالي الربح المراد توزيعه <span class="req">*</span></label>' +
      '<div class="input-wrap"><input type="number" id="dist_total" placeholder="مثلاً: 100000"></div>' +
    '</div>' +
    '<div class="field full"><label>ملاحظات التوزيع</label>' +
      '<div class="input-wrap"><input type="text" id="dist_notes" value="توزيع أرباح شهر"></div>' +
    '</div>' +
    '<div class="table-wrap" style="margin-top:14px"><table><thead><tr>' +
      '<th>الشريك (النسبة)</th><th>المبلغ المستحق</th>' +
    '</tr></thead><tbody>' + inputsHtml + '</tbody></table></div>' +
  '</div>';

  var totEl = document.getElementById('dist_total');
  var currEl = document.getElementById('dist_curr');
  var inputs = body.querySelectorAll('.dist-input');

  totEl.addEventListener('input', function(){
    var total = Number(this.value) || 0;
    inputs.forEach(function(inp){
      var pct = Number(inp.getAttribute('data-pct')) || 0;
      var share = (total * pct) / 100;
      inp.value = share > 0 ? share.toFixed(2) : '';
    });
  });

  var sub = document.getElementById('formModalSubmit');
  if (sub) sub.style.display = '';
  GN.openModal('formModal');

  sub.onclick = function(){
    var totalAmount = Number(totEl.value) || 0;
    var currency = currEl.value;
    var notes = document.getElementById('dist_notes').value;
    if (totalAmount <= 0) { GN.toast('أدخل مبلغ التوزيع', 'bad'); return; }

    var distDate = GN.now();

    inputs.forEach(function(inp){
      var uid = inp.getAttribute('data-uid');
      var amt = Number(inp.value) || 0;
      if (amt > 0) {
        if (!wallets[uid]) wallets[uid] = { percentage: 0, balance_sdg: 0, balance_usd: 0, history: [] };
        
        if (currency === 'SDG') wallets[uid].balance_sdg = Number(wallets[uid].balance_sdg || 0) + amt;
        else wallets[uid].balance_usd = Number(wallets[uid].balance_usd || 0) + amt;

        wallets[uid].history = wallets[uid].history || [];
        wallets[uid].history.push({
          id: GN.uid(), date: distDate, type: 'deposit', amount: amt, currency: currency, notes: notes
        });
      }
    });

    inv.partner_wallets = wallets;

    sub.disabled = true;
    GN.savePublicData(GN.dash.data).then(function(ok){
      sub.disabled = false;
      if (ok) {
        GN.toast('تم التوزيع للمحافظ', 'ok');
        GN.closeModal('formModal');
        GN.loadPartnersWallets();
      }
    });
  };
};
/* ============================================================
   طلبات السحب (Withdrawals Section) - للأدمن
   ============================================================ */
GN.sections.withdrawals = function(){
  if (!GN.session.isOwner && !GN.session.isAdmin) return '<div class="empty">ليس لديك صلاحية</div>';
  var inv = GN.dh.dash().investment = GN.dh.dash().investment || {};
  var requests = inv.withdrawal_requests || [];
  var pending = requests.filter(function(r){ return r.status === 'pending'; });

  var html = '<div class="fin-head"><div><h2>' + GN.navIcon('dollar') + ' طلبات سحب الأرباح</h2></div></div>';
  if (!pending.length) return html + '<div class="card"><div class="empty"><h4>لا توجد طلبات معلقة</h4></div></div>';

  html += '<div class="table-wrap"><table><thead><tr><th>الشريك</th><th>التاريخ</th><th>المبلغ</th><th>ملاحظات</th><th>إجراء</th></tr></thead><tbody>';
  pending.forEach(function(r){
    html += '<tr><td><b>' + GN.esc(r.user_name) + '</b></td><td>' + GN.formatDate(r.date) + '</td><td class="num" style="color:var(--bad)">' + GN.formatNum(r.amount) + ' ' + r.currency + '</td><td>' + GN.esc(r.notes) + '</td>' +
      '<td><button class="btn btn-pri btn-sm" data-act="approve-wd" data-id="' + r.id + '">اعتماد وصرف</button></td></tr>';
  });
  return html + '</tbody></table></div>';
};

GN.bindSection.withdrawals = function(){
  GN.bindAction('approve-wd', function(btn){ GN.openApproveWithdrawForm(btn.getAttribute('data-id')); });
};

/* نموذج اعتماد السحب */
GN.openApproveWithdrawForm = function(reqId){
  var inv = GN.dh.dash().investment;
  var req = inv.withdrawal_requests.filter(function(r){ return r.id === reqId; })[0];
  if (!req) return;

  var body = document.getElementById('formModalBody');
  document.getElementById('formModalTitle').textContent = 'اعتماد سحب: ' + req.user_name;
  body.innerHTML = '<div class="form-grid">' +
    '<div class="field full" style="background:var(--nile-l);color:var(--nile);padding:10px;text-align:center">المطلوب: ' + GN.formatNum(req.amount) + ' ' + req.currency + '</div>' +
    '<div class="field full"><label>رقم الحوالة / الفاتورة</label><div class="input-wrap"><input type="text" id="aw_ref" placeholder="TRF-123"></div></div>' +
    '<div class="field"><label>المبلغ بالسوداني</label><div class="input-wrap"><input type="number" id="aw_sdg" value="' + (req.currency==='SDG'?req.amount:0) + '"></div></div>' +
    '<div class="field"><label>ما يعادله بالدولار</label><div class="input-wrap"><input type="number" id="aw_usd" value="' + (req.currency==='USD'?req.amount:0) + '"></div></div>' +
  '</div>';
  var sub = document.getElementById('formModalSubmit'); sub.style.display = ''; GN.openModal('formModal');
  sub.onclick = function(){
    var wallets = inv.partner_wallets || {};
    var w = wallets[req.user_id];
    if (w) {
      if (req.currency === 'SDG') w.balance_sdg = Number(w.balance_sdg) - req.amount;
      else w.balance_usd = Number(w.balance_usd) - req.amount;
      w.history.push({ id: GN.uid(), date: GN.now(), type: 'withdraw', amount: req.amount, currency: req.currency, notes: 'تم ' + document.getElementById('aw_ref').value });
    }
    req.status = 'approved';
    GN.savePublicData(GN.dash.data).then(function(){
      GN.toast('تم الاعتماد وخصم المبلغ', 'ok'); GN.closeModal('formModal'); GN.renderSection('withdrawals');
    });
  };
};

/* إضافة زر توزيع أرباح في وعاء الأرباح */
GN.openDistributeProfitsFromPool = function(){
  GN.supa.from('fund_pools').select('balance').eq('code', 'profit').single().then(function(res){
    var poolBalance = Number(res.data.balance) || 0;
    if (poolBalance <= 0) { GN.toast('رصيد وعاء الأرباح صفر', 'bad'); return; }

    var body = document.getElementById('formModalBody');
    document.getElementById('formModalTitle').textContent = 'توزيع أرباح وعاء الشركة';

    body.innerHTML = '<div class="form-grid">' +
      '<div class="field full" style="background:var(--ok-l);color:var(--ok);padding:10px;text-align:center">إجمالي رصيد الأرباح: ' + GN.formatNum(poolBalance) + ' SDG</div>' +
      '<div class="field full"><label>المبلغ المحتجز للشركة (لا يوزع)</label><div class="input-wrap"><input type="number" id="dp_retain" placeholder="0"></div></div>' +
      '<div class="field full"><label>المبلغ المراد توزيعه على الشركاء</label><div class="input-wrap"><input type="number" id="dp_distribute" readonly style="background:var(--bg-alt);font-weight:bold;color:var(--gold-d)"></div></div>' +
    '</div>';

    var retainEl = document.getElementById('dp_retain');
    var distEl = document.getElementById('dp_distribute');
    
    retainEl.addEventListener('input', function(){
      var ret = Number(this.value) || 0;
      if (ret > poolBalance) { ret = poolBalance; this.value = ret; }
      distEl.value = poolBalance - ret;
    });

    var sub = document.getElementById('formModalSubmit'); sub.style.display = ''; GN.openModal('formModal');

    sub.onclick = function(){
      var retainAmt = Number(retainEl.value) || 0;
      var distAmt = poolBalance - retainAmt;
      if (distAmt <= 0) { GN.toast('لا يوجد مبلغ للتوزيع', 'bad'); return; }

      var inv = GN.dh.dash().investment = GN.dh.dash().investment || {};
      var wallets = inv.partner_wallets || {};

      Object.keys(wallets).forEach(function(uid){
        var w = wallets[uid];
        var pct = Number(w.percentage || 0);
        if (pct > 0) {
          var share = (distAmt * pct) / 100;
          w.balance_sdg = Number(w.balance_sdg || 0) + share;
          w.history = w.history || [];
          w.history.push({ id: GN.uid(), date: GN.now(), type: 'deposit', amount: share, currency: 'SDG', notes: 'توزيع أرباح من الوعاء العام' });
          
          GN.notify.send({ type: 'in', section: 'partners', target: 'wallet_add', title: 'تم إيداع أرباح في محفظتك', body: 'تم إضافة ' + GN.formatNum(share) + ' SDG إلى محفظتك.' });
        }
      });

      GN.supa.from('fund_pools').select('id,balance').eq('code', 'profit').single().then(function(pr){
        var newPoolBal = Number(pr.data.balance) - distAmt;
        GN.supa.from('fund_pools').update({ balance: newPoolBal }).eq('id', pr.data.id).then(function(){
          GN.supa.from('fund_transactions').insert({ pool_id: pr.data.id, type: 'out', amount: distAmt, currency: 'SDG', reason: 'توزيع أرباح على الشركاء', created_by: GN.session.user.id }).then(function(){
            inv.retained_profit = Number(inv.retained_profit || 0) + retainAmt;
            GN.savePublicData(GN.dash.data).then(function(){
              GN.toast('تم التوزيع بنجاح وإرسال إشعارات للشركاء', 'ok'); GN.closeModal('formModal'); GN.loadFunds();
            });
          });
        });
      });
    };
  });
};
console.log('[Gold Nile] dashboard/06-forms-docs-users-set.js loaded');
})();