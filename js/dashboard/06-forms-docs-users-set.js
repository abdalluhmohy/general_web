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

console.log('[Gold Nile] dashboard/06-forms-docs-users-set.js loaded');
})();