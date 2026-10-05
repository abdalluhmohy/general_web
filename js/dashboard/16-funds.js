/* ============================================================
   Gold Nile — Dashboard / Fund Pools
   Virtual pools · Deposits · Withdrawals · Transfers · FX
   ============================================================ */
(function(){
'use strict';

var GN = window.GN = window.GN || {};

GN._fundsCache = [];
GN._fundsTxCache = [];

/* ============================================================
   Section
   ============================================================ */
GN.sections.funds = function(){
  var isAdmin = GN.session.isOwner && GN.session.isAdmin;

  var html = '<div class="fin-head"><div>' +
    '<h2>' + GN.navIcon('wallet') + ' ' + GN.esc(GN.t('fundsTitle')) + '</h2>' +
    '<span class="sub">' + GN.esc(GN.t('fundsSub')) + '</span></div>' +
    (isAdmin
      ? '<div style="display:flex;gap:6px;flex-wrap:wrap">' +
          '<button class="btn btn-sec btn-sm" data-act="fund-deposit">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 19V5M5 12l7 7 7-7"/></svg> ' +
            GN.esc(GN.t('fundDeposit')) + '</button>' +
          '<button class="btn btn-sec btn-sm" data-act="fund-withdraw">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12l7-7 7 7"/></svg> ' +
            GN.esc(GN.t('fundWithdraw')) + '</button>' +
          '<button class="btn btn-gold btn-sm" data-act="fund-transfer">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M7 17 17 7M17 7H8M17 7v9"/></svg> ' +
            GN.esc(GN.t('fundTransfer')) + '</button>' +
          '<button class="btn btn-pri btn-sm" data-act="fund-fx">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M17 3 21 7l-4 4M3 7h18M7 21 3 17l4-4M21 17H3"/></svg> ' +
            GN.esc(GN.t('fundFx')) + '</button>' +
        '</div>'
      : '') +
  '</div>';

  html += '<div id="fundsGridWrap"><div class="empty"><div class="ic">' + GN.navIcon('wallet') + '</div>' +
    '<h4>' + GN.esc(GN.t('loading')) + '</h4></div></div>';

  html += '<div class="card" style="margin-top:18px"><div class="card-head">' +
    '<h3>' + GN.navIcon('chart') + ' ' + GN.esc(GN.t('fundsHistory')) + '</h3>' +
    '<span class="ff-count" id="fundsTxCount">—</span></div>' +
    '<div id="fundsTxWrap"><div class="empty"><div class="ic">' + GN.navIcon('wallet') + '</div>' +
    '<h4>' + GN.esc(GN.t('loading')) + '</h4></div></div></div>';

  setTimeout(GN.loadFunds, 100);
  return html;
};

/* ============================================================
   Load
   ============================================================ */
GN.loadFunds = function(){
  if (!GN.supa) return;

  Promise.all([
    GN.supa.from('fund_pools').select('*').order('code'),
    GN.supa.from('fund_transactions')
      .select('*, fund_pools:pool_id(code, name_ar, currency)')
      .order('created_at', { ascending: false })
      .limit(300)
  ]).then(function(res){
    if (res[0].error){
      console.error('[funds]', res[0].error);
      return;
    }
    GN._fundsCache = res[0].data || [];
    GN._fundsTxCache = res[1].error ? [] : (res[1].data || []);
    GN.renderFundsGrid();
    GN.renderFundsTransactions();
  });
};

/* ============================================================
   Grid of pool cards
   ============================================================ */
GN.renderFundsGrid = function(){
  var wrap = document.getElementById('fundsGridWrap');
  if (!wrap) return;

  var pools = GN._fundsCache;
  if (!pools.length){
    wrap.innerHTML = '<div class="empty"><h4>' + GN.esc(GN.t('fundsEmpty')) + '</h4></div>';
    return;
  }

  var banks = GN.dh.list('banks') || [];
  var isAdmin = GN.session.isOwner && GN.session.isAdmin;

  var iconMap = {
    gold:   'gold',
    profit: 'dollar',
    usd:    'dollar'
  };
  var colorMap = {
    gold:   { bg:'linear-gradient(145deg,#F5EBD1,#E5D5A8)', fg:'var(--gold-d)' },
    profit: { bg:'linear-gradient(145deg,#DDF3E3,#B5E0C4)', fg:'var(--ok)' },
    usd:    { bg:'linear-gradient(145deg,#E1EFED,#B8D9D5)', fg:'var(--nile)' }
  };

  var html = '<div class="kpi-grid" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr))">';

  pools.forEach(function(p){
    var icon = iconMap[p.code] || 'wallet';
    var style = colorMap[p.code] || { bg:'var(--bg-alt)', fg:'var(--ink-2)' };
    var txCount = GN._fundsTxCache.filter(function(t){ return t.pool_id === p.id; }).length;

    /* Resolve linked bank */
    var linkedBank = null;
    if (p.type === 'bank_account' && p.bank_id){
      linkedBank = banks.filter(function(b){ return b.id === p.bank_id; })[0];
    }

    html += '<div class="card" style="margin:0;position:relative;overflow:hidden">' +
      '<div style="position:absolute;top:0;inset-inline:0;height:4px;background:' + style.bg + '"></div>' +

      /* Header */
      '<div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">' +
        '<div style="width:48px;height:48px;border-radius:14px;display:grid;place-items:center;background:' + style.bg + ';color:' + style.fg + ';flex:none">' +
          GN.navIcon(icon) +
        '</div>' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-family:\'Cairo\',sans-serif;font-size:15px;font-weight:800;color:var(--ink);line-height:1.3">' + GN.esc(p.name_ar) + '</div>' +
          '<div style="font-size:11.5px;color:var(--ink-3);font-weight:600">' + GN.esc(p.currency) + ' · ' + GN.esc(p.type === 'virtual' ? GN.t('fundVirtual') : GN.t('fundBank')) + '</div>' +
        '</div>' +
        (isAdmin
          ? '<button class="icon-act" data-fund-edit="' + GN.escAttr(p.id) + '" title="' + GN.escAttr(GN.t('fundEditPool')) + '">' + GN.ICO_EDIT + '</button>'
          : '') +
      '</div>' +

      /* Balance */
      '<div style="text-align:center;padding:14px 0;border-top:1px dashed var(--line);border-bottom:1px dashed var(--line);margin-bottom:12px">' +
        '<div style="font-size:11px;color:var(--ink-2);font-weight:700;margin-bottom:4px">' + GN.esc(GN.t('fundBalance')) + '</div>' +
        '<div style="font-family:\'Reem Kufi\',sans-serif;font-size:26px;font-weight:700;color:var(--ink)">' +
          '<bdi>' + GN.formatNum(p.balance || 0) + '</bdi> <span style="font-size:13px;color:var(--ink-2)">' + GN.esc(p.currency) + '</span>' +
        '</div>' +
      '</div>' +

      /* Bank link */
      (linkedBank
        ? '<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:var(--nile-l);color:var(--nile);border-radius:10px;font-size:11.5px;font-weight:700;margin-bottom:12px">' +
            GN.navIcon('bank') +
            '<span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + GN.esc(linkedBank.name) + '</span>' +
            '<span style="font-size:10.5px;opacity:.75" dir="ltr">' + GN.esc((linkedBank.account_number || '').slice(-4)) + '...</span>' +
          '</div>'
        : '<div style="padding:8px 10px;background:var(--bg-alt);color:var(--ink-3);border-radius:10px;font-size:11.5px;font-weight:600;margin-bottom:12px;text-align:center">' +
            GN.esc(GN.t('fundNoBank')) +
          '</div>') +

      /* Footer */
      '<div style="display:flex;gap:8px;justify-content:space-between;font-size:11.5px;color:var(--ink-3);font-weight:600">' +
        '<span>' + GN.esc(GN.t('fundTxCount')) + ': ' + txCount + '</span>' +
        (isAdmin
          ? '<button class="btn btn-sec btn-sm" data-fund-history="' + GN.escAttr(p.id) + '" style="padding:4px 10px;font-size:11px;min-height:28px">' + GN.esc(GN.t('fundViewHistory')) + '</button>'
          : '') +
      '</div>' +
    '</div>';
  });

  html += '</div>';
  wrap.innerHTML = html;

  GN.$$('[data-fund-history]').forEach(function(b){
    b.addEventListener('click', function(){
      GN.openFundHistory(b.getAttribute('data-fund-history'));
    });
  });

  GN.$$('[data-fund-edit]').forEach(function(b){
    b.addEventListener('click', function(){
      GN.openPoolEditForm(b.getAttribute('data-fund-edit'));
    });
  });
};

/* ============================================================
   Global transactions list
   ============================================================ */
GN.renderFundsTransactions = function(){
  var wrap = document.getElementById('fundsTxWrap');
  var cnt = document.getElementById('fundsTxCount');
  if (!wrap) return;

  var txs = GN._fundsTxCache;
  if (cnt) cnt.textContent = txs.length;

  if (!txs.length){
    wrap.innerHTML = '<div class="empty"><div class="ic">' + GN.navIcon('wallet') + '</div>' +
      '<h4>' + GN.esc(GN.t('fundsNoTx')) + '</h4></div>';
    return;
  }

  var rows = txs.slice(0, 100).map(function(t){
    var isIn = t.type === 'in' || t.type === 'transfer_in';
    var isOut = t.type === 'out' || t.type === 'transfer_out';
    var sign = isIn ? '+' : '-';
    var color = isIn ? 'var(--ok)' : 'var(--bad)';

    var typeLbl =
      t.type === 'in' ? GN.t('fundTxIn') :
      t.type === 'out' ? GN.t('fundTxOut') :
      t.type === 'transfer_in' ? GN.t('fundTxTransIn') :
      GN.t('fundTxTransOut');

    var poolName = t.fund_pools ? t.fund_pools.name_ar : '—';

    return '<tr>' +
      '<td>' + GN.esc(GN.formatDate(t.created_at)) + '</td>' +
      '<td>' + GN.esc(poolName) + '</td>' +
      '<td><span class="chip ' + (isIn ? 'ok' : 'b') + '"><span class="dot"></span>' + GN.esc(typeLbl) + '</span></td>' +
      '<td class="num" style="color:' + color + ';font-weight:800;white-space:nowrap">' + sign + ' ' + GN.formatMoneyPlain(t.amount, t.currency) + '</td>' +
      '<td style="font-size:12.5px;color:var(--ink-2)">' + GN.esc(t.reason || '-') + '</td>' +
      (t.exchange_rate ? '<td class="num" style="font-size:12px;color:var(--nile)">× ' + GN.formatNum(t.exchange_rate, 4) + '</td>' : '<td>—</td>') +
    '</tr>';
  }).join('');

  wrap.innerHTML = '<div class="table-wrap"><table><thead><tr>' +
    '<th>' + GN.esc(GN.t('txDate')) + '</th>' +
    '<th>' + GN.esc(GN.t('fundPool')) + '</th>' +
    '<th>' + GN.esc(GN.t('txType')) + '</th>' +
    '<th>' + GN.esc(GN.t('txAmount')) + '</th>' +
    '<th>' + GN.esc(GN.t('txDescription')) + '</th>' +
    '<th>' + GN.esc(GN.t('fundRate')) + '</th>' +
  '</tr></thead><tbody>' + rows + '</tbody></table></div>';
};

/* ============================================================
   Fund history modal
   ============================================================ */
GN.openFundHistory = function(poolId){
  var pool = GN._fundsCache.filter(function(p){ return p.id === poolId; })[0];
  if (!pool) return;

  var overlay = document.getElementById('fundHistoryOverlay');
  if (overlay) overlay.remove();

  overlay = document.createElement('div');
  overlay.id = 'fundHistoryOverlay';
  overlay.className = 'overlay on';
  overlay.style.zIndex = '250';

  overlay.innerHTML = '<div class="modal wide" style="max-width:720px">' +
    '<div class="modal-head">' +
      '<h3>' + GN.esc(pool.name_ar) + ' — ' + GN.esc(GN.t('fundsHistory')) + '</h3>' +
      '<button class="close" type="button" data-fh-close><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>' +
    '</div>' +
    '<div class="modal-body" style="max-height:70vh;overflow-y:auto" id="fhBody">' +
      '<div class="empty"><h4>' + GN.esc(GN.t('loading')) + '</h4></div>' +
    '</div>' +
  '</div>';

  document.body.appendChild(overlay);
  function closeFn(){ overlay.remove(); }
  overlay.querySelector('[data-fh-close]').onclick = closeFn;
  overlay.addEventListener('click', function(e){ if (e.target === overlay) closeFn(); });

  GN.supa.from('fund_transactions')
    .select('*')
    .eq('pool_id', poolId)
    .order('created_at', { ascending: false })
    .limit(200)
    .then(function(res){
      var txs = res.data || [];
      var body = document.getElementById('fhBody');
      if (!body) return;

      if (!txs.length){
        body.innerHTML = '<div class="empty"><div class="ic">' + GN.navIcon('wallet') + '</div><h4>' + GN.esc(GN.t('fundsNoTx')) + '</h4></div>';
        return;
      }

      var rows = txs.map(function(t){
        var isIn = t.type === 'in' || t.type === 'transfer_in';
        var sign = isIn ? '+' : '-';
        var color = isIn ? 'var(--ok)' : 'var(--bad)';
        return '<tr>' +
          '<td>' + GN.esc(GN.formatDate(t.created_at)) + '</td>' +
          '<td class="num" style="color:' + color + ';font-weight:800">' + sign + ' ' + GN.formatMoneyPlain(t.amount, t.currency) + '</td>' +
          '<td style="font-size:12px">' + GN.esc(t.reason || '-') + '</td>' +
        '</tr>';
      }).join('');

      body.innerHTML = '<div class="table-wrap"><table><thead><tr>' +
        '<th>' + GN.esc(GN.t('txDate')) + '</th>' +
        '<th>' + GN.esc(GN.t('txAmount')) + '</th>' +
        '<th>' + GN.esc(GN.t('txDescription')) + '</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table></div>';
    });
};

/* ============================================================
   Deposit / Withdraw / Transfer / FX forms
   ============================================================ */
GN.fundForm = function(mode){
  if (!GN.session.isOwner || !GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }

  var body = document.getElementById('formModalBody');
  var titleEl = document.getElementById('formModalTitle');
  if (!body || !titleEl) return;

  var titles = {
    deposit:  GN.t('fundDeposit'),
    withdraw: GN.t('fundWithdraw'),
    transfer: GN.t('fundTransfer'),
    fx:       GN.t('fundFx')
  };
  titleEl.textContent = titles[mode];

  var poolOpts = GN._fundsCache.map(function(p){
    return '<option value="' + GN.escAttr(p.id) + '">' + GN.esc(p.name_ar) + ' (' + GN.esc(p.currency) + ': ' + GN.formatNum(p.balance) + ')</option>';
  }).join('');

  var html = '';

  if (mode === 'deposit' || mode === 'withdraw'){
    html = '<div class="form-grid">' +
      '<div class="field full"><label>' + GN.esc(GN.t('fundPool')) + ' <span class="req">*</span></label>' +
        '<div class="input-wrap"><select id="f_pool">' + poolOpts + '</select></div></div>' +
      '<div class="field"><label>' + GN.esc(GN.t('txAmount')) + ' <span class="req">*</span></label>' +
        '<div class="input-wrap"><input type="number" id="f_amount" step="0.01" min="0"></div></div>' +
      '<div class="field"><label>' + GN.esc(GN.t('fundReason')) + ' <span class="req">*</span></label>' +
        '<div class="input-wrap"><input type="text" id="f_reason" placeholder="' + GN.escAttr(mode === 'deposit' ? 'تحويل من الحساب العام' : 'مصروف / سحب') + '"></div></div>' +
      '<div class="field full"><label>' + GN.esc(GN.t('fundRef')) + '</label>' +
        '<div class="input-wrap"><input type="text" id="f_ref" dir="ltr" placeholder="TRF-12345"></div></div>' +
      '<div class="field full"><label>' + GN.esc(GN.t('notes')) + '</label>' +
        '<div class="input-wrap"><textarea id="f_notes" rows="2"></textarea></div></div>' +
    '</div>';

  } else if (mode === 'transfer'){
    html = '<div class="form-grid">' +
      '<div class="field full" style="background:var(--nile-l);color:var(--nile);padding:10px;border-radius:10px;font-size:12.5px;font-weight:600;text-align:center">' +
        GN.esc(GN.t('fundTransferNote')) +
      '</div>' +
      '<div class="field"><label>' + GN.esc(GN.t('fundFromPool')) + ' <span class="req">*</span></label>' +
        '<div class="input-wrap"><select id="f_from">' + poolOpts + '</select></div></div>' +
      '<div class="field"><label>' + GN.esc(GN.t('fundToPool')) + ' <span class="req">*</span></label>' +
        '<div class="input-wrap"><select id="f_to">' + poolOpts + '</select></div></div>' +
      '<div class="field"><label>' + GN.esc(GN.t('txAmount')) + ' <span class="req">*</span></label>' +
        '<div class="input-wrap"><input type="number" id="f_amount" step="0.01" min="0"></div></div>' +
      '<div class="field"><label>' + GN.esc(GN.t('fundReason')) + ' <span class="req">*</span></label>' +
        '<div class="input-wrap"><input type="text" id="f_reason" placeholder="نقل رأس مال"></div></div>' +
      '<div class="field full"><label>' + GN.esc(GN.t('notes')) + '</label>' +
        '<div class="input-wrap"><textarea id="f_notes" rows="2"></textarea></div></div>' +
    '</div>';

  } else if (mode === 'fx'){
    var usdPools = GN._fundsCache.filter(function(p){ return p.currency === 'USD'; });
    var sdgPools = GN._fundsCache.filter(function(p){ return p.currency === 'SDG'; });
    var usdOpts = usdPools.map(function(p){
      return '<option value="' + GN.escAttr(p.id) + '">' + GN.esc(p.name_ar) + ' (' + GN.formatNum(p.balance) + ' USD)</option>';
    }).join('');
    var sdgOpts = sdgPools.map(function(p){
      return '<option value="' + GN.escAttr(p.id) + '">' + GN.esc(p.name_ar) + ' (' + GN.formatNum(p.balance) + ' SDG)</option>';
    }).join('');

    html = '<div class="form-grid">' +
      '<div class="field full" style="background:var(--gold-l);color:var(--gold-d);padding:10px;border-radius:10px;font-size:12.5px;font-weight:700;text-align:center">' +
        GN.esc(GN.t('fundFxNote')) +
      '</div>' +
      '<div class="field"><label>' + GN.esc(GN.t('fundFxDir')) + '</label>' +
        '<div class="input-wrap"><select id="fx_dir">' +
          '<option value="usd_to_sdg">USD → SDG</option>' +
          '<option value="sdg_to_usd">SDG → USD</option>' +
        '</select></div></div>' +
      '<div class="field"><label>' + GN.esc(GN.t('fundRate')) + ' <span class="req">*</span></label>' +
        '<div class="input-wrap"><input type="number" id="fx_rate" step="0.01" min="0" placeholder="مثال: 2500"></div></div>' +
      '<div class="field"><label>' + GN.esc(GN.t('fundFromPool')) + '</label>' +
        '<div class="input-wrap"><select id="fx_from"></select></div></div>' +
      '<div class="field"><label>' + GN.esc(GN.t('fundToPool')) + '</label>' +
        '<div class="input-wrap"><select id="fx_to"></select></div></div>' +
      '<div class="field"><label>' + GN.esc(GN.t('fundFxAmount')) + ' <span class="req">*</span></label>' +
        '<div class="input-wrap"><input type="number" id="fx_amount" step="0.01" min="0"></div></div>' +
      '<div class="field full"><label>' + GN.esc(GN.t('fundFxResult')) + '</label>' +
        '<div class="input-wrap"><input type="number" id="fx_result" readonly style="background:var(--gold-l);color:var(--gold-dd);font-weight:800"></div></div>' +
      '<div class="field full"><label>' + GN.esc(GN.t('fundReason')) + ' <span class="req">*</span></label>' +
        '<div class="input-wrap"><input type="text" id="fx_reason" placeholder="شراء دولار / تحويل"></div></div>' +
      '<div class="field full"><label>' + GN.esc(GN.t('notes')) + '</label>' +
        '<div class="input-wrap"><textarea id="fx_notes" rows="2"></textarea></div></div>' +
    '</div>';
  }

  /* Insert HTML FIRST */
  body.innerHTML = html;

  var sub = document.getElementById('formModalSubmit');
  if (sub) sub.style.display = '';
  GN.openModal('formModal');

  /* ============================================================
     Bank info banner — ONLY for deposit/withdraw
     ============================================================ */
  if (mode === 'deposit' || mode === 'withdraw'){
    (function bindBankBanner(){
      var poolSel = document.getElementById('f_pool');
      if (!poolSel) return;

      function updateBankInfo(){
        var pid = poolSel.value;
        var p = GN._fundsCache.filter(function(x){ return x.id === pid; })[0];
        var oldBanner = document.getElementById('f_bank_banner');
        if (oldBanner) oldBanner.remove();

        if (!p || p.type !== 'bank_account' || !p.bank_id) return;
        var banks = GN.dh.list('banks') || [];
        var bank = banks.filter(function(b){ return b.id === p.bank_id; })[0];
        if (!bank) return;

        var banner = document.createElement('div');
        banner.id = 'f_bank_banner';
        banner.style.cssText = 'background:var(--nile-l);color:var(--nile);padding:10px 12px;border-radius:10px;font-size:12.5px;font-weight:700;text-align:center;margin-bottom:12px';
        banner.textContent = '🏦 ' + GN.t('fundLinkedNote') + ': ' + bank.name + (bank.account_number ? ' — ...' + bank.account_number.slice(-4) : '');

        var formGrid = body.querySelector('.form-grid');
        if (formGrid) formGrid.parentNode.insertBefore(banner, formGrid);
      }

      poolSel.addEventListener('change', updateBankInfo);
      updateBankInfo();
    })();
  }

  /* ============================================================
     FX specific wiring
     ============================================================ */
  if (mode === 'fx'){
    var dirSel = document.getElementById('fx_dir');
    var fromSel = document.getElementById('fx_from');
    var toSel = document.getElementById('fx_to');
    var amtIn = document.getElementById('fx_amount');
    var rateIn = document.getElementById('fx_rate');
    var resultIn = document.getElementById('fx_result');
    var usdPools = GN._fundsCache.filter(function(p){ return p.currency === 'USD'; });
    var sdgPools = GN._fundsCache.filter(function(p){ return p.currency === 'SDG'; });
    var usdOptions = usdPools.map(function(p){
      return '<option value="' + GN.escAttr(p.id) + '">' + GN.esc(p.name_ar) + ' (' + GN.formatNum(p.balance) + ' USD)</option>';
    }).join('');
    var sdgOptions = sdgPools.map(function(p){
      return '<option value="' + GN.escAttr(p.id) + '">' + GN.esc(p.name_ar) + ' (' + GN.formatNum(p.balance) + ' SDG)</option>';
    }).join('');

    function refreshFxPools(){
      if (dirSel.value === 'usd_to_sdg'){
        fromSel.innerHTML = usdOptions;
        toSel.innerHTML = sdgOptions;
      } else {
        fromSel.innerHTML = sdgOptions;
        toSel.innerHTML = usdOptions;
      }
    }
    function calcFx(){
      var amt = Number(amtIn.value) || 0;
      var rate = Number(rateIn.value) || 0;
      resultIn.value = (amt * rate).toFixed(2);
    }
    dirSel.addEventListener('change', function(){ refreshFxPools(); calcFx(); });
    amtIn.addEventListener('input', calcFx);
    rateIn.addEventListener('input', calcFx);
    refreshFxPools();
  }

  /* ============================================================
     Submit
     ============================================================ */
  sub.onclick = function(){
    sub.disabled = true;

    if (mode === 'deposit' || mode === 'withdraw'){
      var poolId = document.getElementById('f_pool').value;
      var amount = Number(document.getElementById('f_amount').value) || 0;
      var reason = document.getElementById('f_reason').value.trim();
      if (!amount || !reason){ GN.toast(GN.t('fieldRequired'), 'bad'); sub.disabled = false; return; }

      var pool = GN._fundsCache.filter(function(p){ return p.id === poolId; })[0];
      if (!pool){ GN.toast('حوض غير موجود', 'bad'); sub.disabled = false; return; }

      var delta = mode === 'deposit' ? amount : -amount;
      var newBalance = Number(pool.balance || 0) + delta;
      if (newBalance < 0){ GN.toast('الرصيد لا يكفي', 'bad'); sub.disabled = false; return; }

      var txPayload = {
        pool_id: poolId,
        type: mode === 'deposit' ? 'in' : 'out',
        amount: amount,
        currency: pool.currency,
        reason: reason,
        reference_type: 'manual',
        notes: document.getElementById('f_notes').value.trim(),
        created_by: GN.session.user.id
      };

      GN.supa.from('fund_transactions').insert(txPayload).then(function(r){
        if (r.error){ GN.toast(r.error.message, 'bad'); sub.disabled = false; return; }
        GN.supa.from('fund_pools').update({ balance: newBalance, updated_at: new Date().toISOString() }).eq('id', poolId).then(function(){
          GN.toast(mode === 'deposit' ? 'تم الإيداع' : 'تم السحب', 'ok');
          GN.closeModal('formModal');
          GN.loadFunds();
        });
      });

    } else if (mode === 'transfer'){
      var fromId = document.getElementById('f_from').value;
      var toId = document.getElementById('f_to').value;
      var amount2 = Number(document.getElementById('f_amount').value) || 0;
      var reason2 = document.getElementById('f_reason').value.trim();
      if (fromId === toId){ GN.toast('لا يمكن التحويل لنفس الحوض', 'bad'); sub.disabled = false; return; }
      if (!amount2 || !reason2){ GN.toast(GN.t('fieldRequired'), 'bad'); sub.disabled = false; return; }

      var fromPool = GN._fundsCache.filter(function(p){ return p.id === fromId; })[0];
      var toPool = GN._fundsCache.filter(function(p){ return p.id === toId; })[0];
      if (!fromPool || !toPool){ GN.toast('خطأ في الأوعية', 'bad'); sub.disabled = false; return; }
      if (fromPool.currency !== toPool.currency){
        GN.toast('العملات مختلفة — استخدم تحويل العملات', 'bad'); sub.disabled = false; return;
      }
      if (Number(fromPool.balance || 0) < amount2){ GN.toast('الرصيد لا يكفي', 'bad'); sub.disabled = false; return; }

      var txs = [
        { pool_id: fromId, type: 'transfer_out', amount: amount2, currency: fromPool.currency, reason: reason2, counterparty_pool_id: toId, reference_type: 'manual', created_by: GN.session.user.id },
        { pool_id: toId, type: 'transfer_in', amount: amount2, currency: toPool.currency, reason: reason2, counterparty_pool_id: fromId, reference_type: 'manual', created_by: GN.session.user.id }
      ];

      GN.supa.from('fund_transactions').insert(txs).then(function(r){
        if (r.error){ GN.toast(r.error.message, 'bad'); sub.disabled = false; return; }

        GN.supa.from('fund_pools').update({ balance: Number(fromPool.balance) - amount2, updated_at: new Date().toISOString() }).eq('id', fromId).then(function(){
          GN.supa.from('fund_pools').update({ balance: Number(toPool.balance) + amount2, updated_at: new Date().toISOString() }).eq('id', toId).then(function(){
            GN.toast('تم التحويل', 'ok');
            GN.closeModal('formModal');
            GN.loadFunds();
          });
        });
      });

    } else if (mode === 'fx'){
      var dir = document.getElementById('fx_dir').value;
      var fromId2 = document.getElementById('fx_from').value;
      var toId2 = document.getElementById('fx_to').value;
      var amount3 = Number(document.getElementById('fx_amount').value) || 0;
      var rate = Number(document.getElementById('fx_rate').value) || 0;
      var reason3 = document.getElementById('fx_reason').value.trim();
      if (!amount3 || !rate || !reason3){ GN.toast(GN.t('fieldRequired'), 'bad'); sub.disabled = false; return; }

      var fromPool2 = GN._fundsCache.filter(function(p){ return p.id === fromId2; })[0];
      var toPool2 = GN._fundsCache.filter(function(p){ return p.id === toId2; })[0];
      if (!fromPool2 || !toPool2){ GN.toast('خطأ في الأوعية', 'bad'); sub.disabled = false; return; }
      if (Number(fromPool2.balance || 0) < amount3){ GN.toast('الرصيد لا يكفي', 'bad'); sub.disabled = false; return; }

      var toAmount = amount3 * rate;

      var fxPayload = {
        from_currency: dir === 'usd_to_sdg' ? 'USD' : 'SDG',
        to_currency: dir === 'usd_to_sdg' ? 'SDG' : 'USD',
        from_amount: amount3,
        to_amount: toAmount,
        rate: rate,
        reason: reason3,
        source_pool_id: fromId2,
        target_pool_id: toId2,
        notes: document.getElementById('fx_notes').value.trim(),
        created_by: GN.session.user.id
      };

      GN.supa.from('currency_exchanges').insert(fxPayload).then(function(r){
        if (r.error){ GN.toast(r.error.message, 'bad'); sub.disabled = false; return; }

        var txs2 = [
          { pool_id: fromId2, type: 'out', amount: amount3, currency: fromPool2.currency, reason: reason3 + ' (شراء ' + toPool2.currency + ')', reference_type: 'manual', exchange_rate: rate, created_by: GN.session.user.id },
          { pool_id: toId2, type: 'in', amount: toAmount, currency: toPool2.currency, reason: reason3 + ' (من ' + fromPool2.currency + ')', reference_type: 'manual', exchange_rate: rate, created_by: GN.session.user.id }
        ];

        GN.supa.from('fund_transactions').insert(txs2).then(function(){
          GN.supa.from('fund_pools').update({ balance: Number(fromPool2.balance) - amount3, updated_at: new Date().toISOString() }).eq('id', fromId2).then(function(){
            GN.supa.from('fund_pools').update({ balance: Number(toPool2.balance) + toAmount, updated_at: new Date().toISOString() }).eq('id', toId2).then(function(){
              GN.toast('تم تحويل العملة', 'ok');
              GN.closeModal('formModal');
              GN.loadFunds();
            });
          });
        });
      });
    }
  };
};

/* ============================================================
   Bind
   ============================================================ */
GN.bindSection.funds = function(){
  GN.bindAction('fund-deposit',  function(){ GN.fundForm('deposit'); });
  GN.bindAction('fund-withdraw', function(){ GN.fundForm('withdraw'); });
  GN.bindAction('fund-transfer', function(){ GN.fundForm('transfer'); });
  GN.bindAction('fund-fx',       function(){ GN.fundForm('fx'); });
};
/* ============================================================
   Pool Edit Form (name + type + bank link)
   ============================================================ */
GN.openPoolEditForm = function(poolId){
  if (!GN.session.isOwner || !GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }

  var pool = GN._fundsCache.filter(function(p){ return p.id === poolId; })[0];
  if (!pool) return;

  var banks = GN.dh.list('banks') || [];

  var body = document.getElementById('formModalBody');
  var titleEl = document.getElementById('formModalTitle');
  if (!body || !titleEl) return;

  titleEl.textContent = GN.t('fundEditPool');

  var bankOpts = '<option value="">— ' + GN.esc(GN.t('fundNoBank')) + ' —</option>';
  banks.forEach(function(b){
    bankOpts += '<option value="' + GN.escAttr(b.id) + '"' +
      (pool.bank_id === b.id ? ' selected' : '') + '>' +
      GN.esc(b.name) + ' · ' + GN.esc(b.currency || '') + (b.account_number ? ' · ' + GN.esc(b.account_number.slice(-4)) : '') +
      '</option>';
  });

  body.innerHTML =
    '<div class="form-grid">' +

      '<div class="field full"><label>' + GN.esc(GN.t('fundPoolName')) + ' <span class="req">*</span></label>' +
        '<div class="input-wrap"><input type="text" id="fpe_name" value="' + GN.escAttr(pool.name_ar || '') + '"></div></div>' +

      '<div class="field full"><label>' + GN.esc(GN.t('fundPoolType')) + '</label>' +
        '<div class="input-wrap"><select id="fpe_type">' +
          '<option value="virtual"' + (pool.type === 'virtual' ? ' selected' : '') + '>' + GN.esc(GN.t('fundTypeVirtual')) + '</option>' +
          '<option value="bank_account"' + (pool.type === 'bank_account' ? ' selected' : '') + '>' + GN.esc(GN.t('fundTypeBank')) + '</option>' +
        '</select></div></div>' +

      '<div class="field full" id="fpe_bank_wrap" style="display:' + (pool.type === 'bank_account' ? 'block' : 'none') + '">' +
        '<label>' + GN.esc(GN.t('fundSelectBank')) + '</label>' +
        '<div class="input-wrap"><select id="fpe_bank">' + bankOpts + '</select></div>' +
        (banks.length === 0
          ? '<div style="font-size:11.5px;color:var(--warn);margin-top:6px;padding:6px 10px;background:var(--warn-l);border-radius:8px">' +
              GN.esc(GN.t('fundNoBanksYet')) +
            '</div>'
          : '') +
      '</div>' +

      '<div class="field full"><div style="font-size:11.5px;color:var(--ink-3);padding:8px 10px;background:var(--bg-alt);border-radius:8px">' +
        '💰 ' + GN.esc(pool.currency) + ' · ' + GN.esc(GN.t('fundCurrencyLocked')) +
      '</div></div>' +

      '<div class="field full">' +
        '<button type="button" class="btn btn-danger" data-fpe-delete style="width:100%">' +
          GN.esc(GN.t('fundDeletePool')) +
        '</button>' +
      '</div>' +

    '</div>';

  var sub = document.getElementById('formModalSubmit');
  if (sub) sub.style.display = '';
  GN.openModal('formModal');

  /* Toggle bank select */
  var typeSel = document.getElementById('fpe_type');
  var bankWrap = document.getElementById('fpe_bank_wrap');
  typeSel.addEventListener('change', function(){
    bankWrap.style.display = this.value === 'bank_account' ? 'block' : 'none';
  });

  /* Delete button */
  body.querySelector('[data-fpe-delete]').onclick = function(){
    GN.confirm({
      title: GN.t('fundDeletePool'),
      text: GN.t('fundDeletePoolConfirm'),
      okText: GN.t('delete'),
      cancelText: GN.t('cancel'),
      danger: true
    }).then(function(ok){
      if (!ok) return;
      GN.supa.from('fund_transactions').delete().eq('pool_id', poolId).then(function(){
        GN.supa.from('fund_pools').delete().eq('id', poolId).then(function(res){
          if (res.error){ GN.toast(res.error.message, 'bad'); return; }
          GN.toast(GN.t('deletedSuccess'), 'ok');
          GN.closeModal('formModal');
          GN.loadFunds();
        });
      });
    });
  };

  /* Submit */
  sub.onclick = function(){
    var name = document.getElementById('fpe_name').value.trim();
    if (!name){ GN.toast(GN.t('fieldRequired'), 'bad'); return; }

    var type = document.getElementById('fpe_type').value;
    var bankId = document.getElementById('fpe_bank').value || '';

    if (type === 'bank_account' && !bankId){
      GN.toast('اختر الحساب البنكي', 'bad');
      return;
    }

    var payload = {
      name_ar: name,
      type: type,
      bank_id: type === 'bank_account' ? bankId : '',
      updated_at: new Date().toISOString()
    };

    sub.disabled = true;
    GN.supa.from('fund_pools').update(payload).eq('id', poolId).then(function(res){
      sub.disabled = false;
      if (res.error){ GN.toast(res.error.message, 'bad'); return; }
      GN.toast(GN.t('savedSuccess'), 'ok');
      GN.closeModal('formModal');
      GN.loadFunds();
    });
  };
};
console.log('[Gold Nile] dashboard/16-funds.js loaded');
})();