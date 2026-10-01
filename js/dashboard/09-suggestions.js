/* ============================================================
   Gold Nile — Dashboard / Suggestions & Voting
   Cards · Voting · Delete · Add form
   ============================================================ */
(function(){
'use strict';

var GN = window.GN = window.GN || {};

/* ============================================================
   Suggestions Section
   ============================================================ */
GN.sections.suggestions = function(){
  if (!GN.session.isLogged){
    return '<div class="card"><div class="empty"><div class="ic">' + GN.navIcon('vote') + '</div>' +
      '<h4>' + GN.esc(GN.t('sugNoSuggestions')) + '</h4></div></div>';
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
  var box = document.getElementById('sugList');
  if (!box) return;

  GN.supa.from('suggestions').select('*').order('created_at', { ascending: false }).then(function(res){
    if (res.error){
      console.error('[sug]', res.error);
      box.innerHTML = '<div class="empty"><h4>خطأ</h4></div>';
      return;
    }
    GN.supa.from('profiles').select('id', { count: 'exact', head: true }).eq('status', 'allowed').then(function(cRes){
      GN._totalUsers = (cRes && cRes.count) || 0;
      GN.renderSuggestions(res.data || []);
    });
  });
};

GN.renderSuggestions = function(arr){
  var box = document.getElementById('sugList');
  if (!box) return;

  if (!arr.length){
    box.innerHTML = '<div class="card"><div class="empty"><div class="ic">' + GN.navIcon('vote') + '</div>' +
      '<h4>' + GN.esc(GN.t('sugNoSuggestions')) + '</h4>' +
      '<p>' + GN.esc(GN.t('sugAddFirst')) + '</p></div></div>';
    return;
  }

  var currentId = GN.session.user ? GN.session.user.id : null;
  var isOwner = GN.session.isOwner;
  var totalUsers = GN._totalUsers || 0;
  var regular = [], voting = [];

  arr.forEach(function(s){
    if ((s.type || 'suggestion') === 'vote') voting.push(s);
    else regular.push(s);
  });

  function sortDesc(a){
    return a.slice().sort(function(x, y){
      return (y.created_at || '').localeCompare(x.created_at || '');
    });
  }

  function renderCard(s){
    var votes = s.votes || {};
    var yes = [], no = [], abstain = [];

    Object.keys(votes).forEach(function(uid){
      var v = votes[uid];
      if (!v || !v.vote) return;
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
    if (isApproved){
      badge = '<span class="sug-badge approved"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M20 6 9 17l-5-5"/></svg>' + GN.esc(GN.t('sugApproved')) + '</span>';
    } else if (isVote){
      badge = '<span class="sug-badge pending">' + GN.esc(GN.t('sugPending')) + '</span>';
    }

    var segmented = isVote
      ? '<div class="segmented">' +
          '<button class="seg-btn yes' + (myVote === 'yes' ? ' active' : '') + '" data-vote="yes" data-vote-id="' + GN.escAttr(s.id) + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M20 6 9 17l-5-5"/></svg><b class="num">' + yes.length + '</b></button>' +
          '<button class="seg-btn no' + (myVote === 'no' ? ' active' : '') + '" data-vote="no" data-vote-id="' + GN.escAttr(s.id) + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg><b class="num">' + no.length + '</b></button>' +
          '<button class="seg-btn abstain' + (myVote === 'abstain' ? ' active' : '') + '" data-vote="abstain" data-vote-id="' + GN.escAttr(s.id) + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M5 12h14"/></svg><b class="num">' + abstain.length + '</b></button>' +
        '</div>'
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
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      GN.voteSuggestion(btn.getAttribute('data-vote-id'), btn.getAttribute('data-vote'));
    });
  });

  GN.$$('[data-sug-del]').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      GN.deleteSuggestion(btn.getAttribute('data-sug-del'));
    });
  });
};

/* ============================================================
   Add form
   ============================================================ */
GN.openSuggestionForm = function(){
  if (!GN.session.isLogged){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  if (!GN.supa){ GN.toast('لا يوجد اتصال', 'bad'); return; }

  var body = document.getElementById('formModalBody');
  var titleEl = document.getElementById('formModalTitle');
  if (!body || !titleEl) return;
  titleEl.textContent = GN.t('addSuggestion');

  body.innerHTML = '<div class="form-grid">' +
    '<div class="field full"><label>' + GN.esc(GN.t('sugType')) + ' <span class="req">*</span></label>' +
      '<div class="input-wrap"><select id="sugType">' +
        '<option value="suggestion">' + GN.esc(GN.t('sugTypeNormal')) + '</option>' +
        '<option value="vote">' + GN.esc(GN.t('sugTypeVote')) + '</option>' +
      '</select></div></div>' +
    '<div class="field full"><label>' + GN.esc(GN.t('sugNewTitle')) + ' <span class="req">*</span></label>' +
      '<div class="input-wrap"><input type="text" id="sugTitle" maxlength="140"></div></div>' +
    '<div class="field full"><label>' + GN.esc(GN.t('sugDesc')) + ' <span class="req">*</span></label>' +
      '<div class="input-wrap"><textarea id="sugDesc" rows="7" maxlength="4000"></textarea></div></div>' +
  '</div>';

  var sub = document.getElementById('formModalSubmit');
  if (sub) sub.style.display = '';

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
      type: type,
      title: t,
      description: dsc,
      created_by: u.id,
      created_by_name: (p && (p.full_name || p.email)) || u.email || 'User',
      votes: {}
    }).select().then(function(res){
      submitBtn.disabled = false;
      if (res.error){
        console.error(res.error);
        GN.toast(res.error.message, 'bad');
        return;
      }
      GN.toast(GN.t('addedSuccess'), 'ok');
      if (res.data && res.data[0]){
        GN.notify.send({
          type:'add', section:'suggestions', target:'suggestion', target_id: res.data[0].id,
          title: GN.t('notifAdd') + ' · ' + GN.t('navSuggestions'),
          body: t
        });
      }
      GN.closeModal('formModal');
      GN.loadSuggestions();
    });
  };
};

/* ============================================================
   Voting
   ============================================================ */
GN.voteSuggestion = function(id, vote){
  if (!GN.session.isLogged){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  if (!GN.supa) return;

  var u = GN.session.user;
  var p = GN.session.profile;
  if (!u) return;

  GN.supa.from('suggestions').select('votes').eq('id', id).single().then(function(res){
    if (res.error){ GN.toast(res.error.message, 'bad'); return; }
    var votes = res.data.votes || {};

    if (votes[u.id] && votes[u.id].vote === vote){
      delete votes[u.id];
    } else {
      votes[u.id] = {
        vote: vote,
        name: (p && (p.full_name || p.email)) || u.email || 'User',
        date: GN.now()
      };
    }

    GN.supa.from('suggestions').update({ votes: votes }).eq('id', id).then(function(res2){
      if (res2.error){ GN.toast(res2.error.message, 'bad'); return; }
      GN.toast(GN.t('sugSaved'), 'ok');
      GN.loadSuggestions();
    });
  });
};

/* ============================================================
   Delete
   ============================================================ */
GN.deleteSuggestion = function(id){
  if (!GN.session.isLogged){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  if (!GN.supa) return;

  GN.confirm({
    title: GN.t('delete'),
    text: GN.t('sugDeleteConfirm'),
    okText: GN.t('delete'),
    cancelText: GN.t('cancel'),
    danger: true
  }).then(function(ok){
    if (!ok) return;
    GN.supa.from('suggestions').delete().eq('id', id).then(function(res){
      if (res.error){ GN.toast(res.error.message, 'bad'); return; }
      GN.toast(GN.t('deletedSuccess'), 'ok');
      GN.loadSuggestions();
    });
  });
};

/* ============================================================
   Bind Section
   ============================================================ */
GN.bindSection.suggestions = function(){
  GN.bindAction('add-suggestion', function(){ GN.openSuggestionForm(); });
};

console.log('[Gold Nile] dashboard/09-suggestions.js loaded');
})();