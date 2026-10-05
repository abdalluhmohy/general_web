/* ============================================================
   Gold Nile — Dashboard / Locations (States → Cities → Places)
   Full tree management
   ============================================================ */
(function(){
'use strict';

var GN = window.GN = window.GN || {};

GN._locationsTree = { states: [], cities: [], places: [] };

/* ============================================================
   Section
   ============================================================ */
GN.sections.locations = function(){
  var isAdmin = GN.session.isOwner && GN.session.isAdmin;

  var html = '<div class="fin-head"><div>' +
    '<h2>' + GN.navIcon('map') + ' ' + GN.esc(GN.t('locationsTitle')) + '</h2>' +
    '<span class="sub">' + GN.esc(GN.t('locationsSub')) + '</span></div>' +
    (isAdmin
      ? '<button class="btn btn-pri btn-sm" data-act="loc-add-state">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg> ' +
          GN.esc(GN.t('locAddState')) + '</button>'
      : '') +
  '</div>';

  html += '<div class="kpi-grid" id="locKpis">' +
    '<div class="kpi"><div class="top"><span class="ic">' + GN.navIcon('map') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('loading')) + '</div><div class="val">—</div></div>' +
    '<div class="kpi"><div class="top"><span class="ic">' + GN.navIcon('map') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('loading')) + '</div><div class="val">—</div></div>' +
    '<div class="kpi"><div class="top"><span class="ic">' + GN.navIcon('map') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('loading')) + '</div><div class="val">—</div></div>' +
    '<div class="kpi"><div class="top"><span class="ic">' + GN.navIcon('map') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('loading')) + '</div><div class="val">—</div></div>' +
  '</div>';

  html += '<div id="locTreeWrap"><div class="empty"><div class="ic">' + GN.navIcon('map') + '</div>' +
    '<h4>' + GN.esc(GN.t('loading')) + '</h4></div></div>';

  setTimeout(GN.loadLocations, 100);
  return html;
};

/* ============================================================
   Load all locations once
   ============================================================ */
GN.loadLocations = function(){
  if (!GN.supa) return;

  GN.supa.from('locations')
    .select('*')
    .order('display_order', { ascending: true })
    .order('name', { ascending: true })
    .then(function(res){
      if (res.error){
        console.error('[locations]', res.error);
        var w = document.getElementById('locTreeWrap');
        if (w) w.innerHTML = '<div class="empty"><h4>خطأ</h4><p>' + GN.esc(res.error.message) + '</p></div>';
        return;
      }
      var all = res.data || [];
      GN._locationsTree.states = all.filter(function(x){ return x.type === 'state'; });
      GN._locationsTree.cities = all.filter(function(x){ return x.type === 'city'; });
      GN._locationsTree.places = all.filter(function(x){ return x.type === 'place'; });
      GN.renderLocationsKPIs();
      GN.renderLocationsTree();
    });
};

/* ============================================================
   KPIs
   ============================================================ */
GN.renderLocationsKPIs = function(){
  var box = document.getElementById('locKpis');
  if (!box) return;
  var s = GN._locationsTree.states.length;
  var c = GN._locationsTree.cities.length;
  var p = GN._locationsTree.places.length;

  box.innerHTML =
    '<div class="kpi hl"><div class="top"><span class="ic">' + GN.navIcon('map') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('locStates')) + '</div>' +
      '<div class="val"><bdi>' + GN.formatNum(s) + '</bdi></div></div>' +
    '<div class="kpi"><div class="top"><span class="ic g">' + GN.navIcon('map') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('locCities')) + '</div>' +
      '<div class="val"><bdi>' + GN.formatNum(c) + '</bdi></div></div>' +
    '<div class="kpi"><div class="top"><span class="ic y">' + GN.navIcon('map') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('locPlaces')) + '</div>' +
      '<div class="val"><bdi>' + GN.formatNum(p) + '</bdi></div></div>' +
    '<div class="kpi"><div class="top"><span class="ic ok">' + GN.navIcon('check') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('locTotal')) + '</div>' +
      '<div class="val"><bdi>' + GN.formatNum(s + c + p) + '</bdi></div></div>';
};

/* ============================================================
   Render tree
   ============================================================ */
GN.renderLocationsTree = function(){
  var wrap = document.getElementById('locTreeWrap');
  if (!wrap) return;
  var isAdmin = GN.session.isOwner && GN.session.isAdmin;
  var states = GN._locationsTree.states;

  if (!states.length){
    wrap.innerHTML = '<div class="card"><div class="empty"><div class="ic">' + GN.navIcon('map') + '</div>' +
      '<h4>' + GN.esc(GN.t('locEmpty')) + '</h4>' +
      '<p>' + GN.esc(GN.t('locEmptyAdd')) + '</p></div></div>';
    return;
  }

  function citiesOf(stateId){
    return GN._locationsTree.cities.filter(function(c){ return c.parent_id === stateId; });
  }
  function placesOf(cityId){
    return GN._locationsTree.places.filter(function(p){ return p.parent_id === cityId; });
  }

  var html = '<div class="loc-tree">';

  states.forEach(function(state){
    var cities = citiesOf(state.id);
    var totalPlaces = 0;
    cities.forEach(function(c){ totalPlaces += placesOf(c.id).length; });

    html += '<div class="loc-state" data-loc-state="' + GN.escAttr(state.id) + '">';

    /* State header */
    html += '<div class="loc-state-head">' +
      '<button type="button" class="loc-toggle" data-loc-toggle="' + GN.escAttr(state.id) + '">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="m9 18 6-6-6-6"/></svg>' +
      '</button>' +
      '<div class="loc-state-info">' +
        '<span class="loc-ic">' + GN.navIcon('map') + '</span>' +
        '<div>' +
          '<div class="loc-name">' + GN.esc(state.name) + '</div>' +
          '<div class="loc-meta">' + cities.length + ' ' + GN.esc(GN.t('locCities')) + ' · ' + totalPlaces + ' ' + GN.esc(GN.t('locPlaces')) + '</div>' +
        '</div>' +
      '</div>' +
      (isAdmin
        ? '<div class="loc-actions">' +
            '<button class="icon-act" data-loc-add-city="' + GN.escAttr(state.id) + '" title="' + GN.escAttr(GN.t('locAddCity')) + '">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>' +
            '</button>' +
            '<button class="icon-act" data-loc-edit="' + GN.escAttr(state.id) + '" title="' + GN.escAttr(GN.t('edit')) + '">' + GN.ICO_EDIT + '</button>' +
            '<button class="icon-act del" data-loc-del="' + GN.escAttr(state.id) + '" title="' + GN.escAttr(GN.t('delete')) + '">' + GN.ICO_DEL + '</button>' +
          '</div>'
        : '') +
    '</div>';

    /* Cities */
    html += '<div class="loc-body" data-loc-body="' + GN.escAttr(state.id) + '">';

    if (!cities.length){
      html += '<div class="loc-empty-sub">' + GN.esc(GN.t('locNoCities')) + '</div>';
    } else {
      cities.forEach(function(city){
        var places = placesOf(city.id);
        html += '<div class="loc-city">' +
          '<div class="loc-city-head">' +
            '<button type="button" class="loc-toggle sm" data-loc-toggle="' + GN.escAttr(city.id) + '">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="m9 18 6-6-6-6"/></svg>' +
            '</button>' +
            '<span class="loc-city-name">' + GN.esc(city.name) + '</span>' +
            '<span class="loc-badge">' + places.length + '</span>' +
            (isAdmin
              ? '<div class="loc-actions sm">' +
                  '<button class="icon-act sm" data-loc-add-place="' + GN.escAttr(city.id) + '" title="' + GN.escAttr(GN.t('locAddPlace')) + '">' +
                    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>' +
                  '</button>' +
                  '<button class="icon-act sm" data-loc-edit="' + GN.escAttr(city.id) + '" title="' + GN.escAttr(GN.t('edit')) + '">' + GN.ICO_EDIT + '</button>' +
                  '<button class="icon-act sm del" data-loc-del="' + GN.escAttr(city.id) + '" title="' + GN.escAttr(GN.t('delete')) + '">' + GN.ICO_DEL + '</button>' +
                '</div>'
              : '') +
          '</div>' +
          '<div class="loc-body-inner" data-loc-body="' + GN.escAttr(city.id) + '">';

        if (!places.length){
          html += '<div class="loc-empty-sub">' + GN.esc(GN.t('locNoPlaces')) + '</div>';
        } else {
          html += '<div class="loc-places">';
          places.forEach(function(place){
            html += '<div class="loc-place">' +
              '<span class="loc-place-dot"></span>' +
              '<span class="loc-place-name">' + GN.esc(place.name) + '</span>' +
              (isAdmin
                ? '<div class="loc-actions sm">' +
                    '<button class="icon-act sm" data-loc-edit="' + GN.escAttr(place.id) + '" title="' + GN.escAttr(GN.t('edit')) + '">' + GN.ICO_EDIT + '</button>' +
                    '<button class="icon-act sm del" data-loc-del="' + GN.escAttr(place.id) + '" title="' + GN.escAttr(GN.t('delete')) + '">' + GN.ICO_DEL + '</button>' +
                  '</div>'
                : '') +
            '</div>';
          });
          html += '</div>';
        }
        html += '</div></div>';
      });
    }

    html += '</div></div>';
  });

  html += '</div>';
  wrap.innerHTML = html;

  /* Bind toggles */
  GN.$$('[data-loc-toggle]').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      var id = btn.getAttribute('data-loc-toggle');
      var body = document.querySelector('[data-loc-body="' + id + '"]');
      if (!body) return;
      var isOpen = body.classList.toggle('open');
      btn.classList.toggle('rotated', isOpen);
    });
  });

  /* Bind actions */
  GN.$$('[data-loc-add-city]').forEach(function(b){
    b.addEventListener('click', function(e){ e.stopPropagation(); GN.openLocationForm('city', b.getAttribute('data-loc-add-city')); });
  });
  GN.$$('[data-loc-add-place]').forEach(function(b){
    b.addEventListener('click', function(e){ e.stopPropagation(); GN.openLocationForm('place', b.getAttribute('data-loc-add-place')); });
  });
  GN.$$('[data-loc-edit]').forEach(function(b){
    b.addEventListener('click', function(e){ e.stopPropagation(); GN.openLocationForm(null, null, b.getAttribute('data-loc-edit')); });
  });
  GN.$$('[data-loc-del]').forEach(function(b){
    b.addEventListener('click', function(e){ e.stopPropagation(); GN.deleteLocation(b.getAttribute('data-loc-del')); });
  });
};

/* ============================================================
   Add / Edit Location Form
   ============================================================ */
GN.openLocationForm = function(type, parentId, editId){
  if (!GN.session.isOwner || !GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }

  var isEdit = !!editId;
  var item = null;

  if (isEdit){
    var all = GN._locationsTree.states.concat(GN._locationsTree.cities, GN._locationsTree.places);
    item = all.filter(function(x){ return x.id === editId; })[0];
    if (!item) return;
    type = item.type;
    parentId = item.parent_id;
  }

  var titleMap = {
    state: isEdit ? GN.t('locEditState') : GN.t('locAddState'),
    city:  isEdit ? GN.t('locEditCity')  : GN.t('locAddCity'),
    place: isEdit ? GN.t('locEditPlace') : GN.t('locAddPlace')
  };
  var labelMap = {
    state: GN.t('locStateName'),
    city:  GN.t('locCityName'),
    place: GN.t('locPlaceName')
  };
  var phMap = {
    state: 'مثال: الخرطوم',
    city:  'مثال: أم درمان',
    place: 'مثال: سوق الذهب'
  };

  var body = document.getElementById('formModalBody');
  var titleEl = document.getElementById('formModalTitle');
  if (!body || !titleEl) return;

  titleEl.textContent = titleMap[type] || '';

  body.innerHTML = '<div class="form-grid">' +
    '<div class="field full"><label>' + GN.esc(labelMap[type]) + ' <span class="req">*</span></label>' +
      '<div class="input-wrap"><input type="text" id="loc_name" maxlength="80" placeholder="' + GN.escAttr(phMap[type]) + '" value="' + GN.escAttr(item ? item.name : '') + '"></div></div>' +
    '<div class="field full"><label>' + GN.esc(GN.t('locOrder') || 'ترتيب العرض') + '</label>' +
      '<div class="input-wrap"><input type="number" id="loc_order" min="0" max="999" value="' + GN.escAttr(item ? item.display_order : 0) + '"></div></div>' +
  '</div>';

  var sub = document.getElementById('formModalSubmit');
  if (sub) sub.style.display = '';
  GN.openModal('formModal');

  sub.onclick = function(){
    var name = document.getElementById('loc_name').value.trim();
    if (!name){ GN.toast(GN.t('fieldRequired'), 'bad'); return; }

    var payload = {
      name: name,
      type: type,
      display_order: Number(document.getElementById('loc_order').value) || 0
    };
    if (parentId) payload.parent_id = parentId;

    sub.disabled = true;

    var promise;
    if (isEdit){
      promise = GN.supa.from('locations').update(payload).eq('id', editId);
    } else {
      promise = GN.supa.from('locations').insert(payload);
    }

    promise.then(function(res){
      sub.disabled = false;
      if (res.error){ GN.toast(res.error.message, 'bad'); return; }
      GN.toast(isEdit ? GN.t('savedSuccess') : GN.t('addedSuccess'), 'ok');
      GN.closeModal('formModal');
      GN.loadLocations();
    });
  };
};

/* ============================================================
   Delete Location
   ============================================================ */
GN.deleteLocation = function(id){
  if (!GN.session.isOwner){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }

  var all = GN._locationsTree.states.concat(GN._locationsTree.cities, GN._locationsTree.places);
  var item = all.filter(function(x){ return x.id === id; })[0];
  if (!item) return;

  var typeLbl = item.type === 'state' ? GN.t('locStates') : (item.type === 'city' ? GN.t('locCities') : GN.t('locPlaces'));

  GN.confirm({
    title: GN.t('delete'),
    text: 'حذف ' + item.name + '؟ سيُحذف كل ما يتبعه من ' + typeLbl + ' فرعية.',
    okText: GN.t('delete'),
    cancelText: GN.t('cancel'),
    danger: true
  }).then(function(ok){
    if (!ok) return;
    GN.supa.from('locations').delete().eq('id', id).then(function(res){
      if (res.error){ GN.toast(res.error.message, 'bad'); return; }
      GN.toast(GN.t('deletedSuccess'), 'ok');
      GN.loadLocations();
    });
  });
};

/* ============================================================
   Bind
   ============================================================ */
GN.bindSection.locations = function(){
  GN.bindAction('loc-add-state', function(){
    if (!GN.session.isOwner || !GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
    GN.openLocationForm('state', null);
  });
};

console.log('[Gold Nile] dashboard/13-locations.js loaded');
})();