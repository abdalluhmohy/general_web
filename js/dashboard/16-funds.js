/* ============================================================
   Gold Nile — Dashboard / Fund Pools
   Gold Capital · Gold Profit · Bank-linked · Direct to bank
   "أرباح → دولار" replaces FX form · USD pool removed
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
          '<button class="btn btn-pri btn-sm" data-act="fund-usd">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> ' +
            'أرباح → دولار</button>' +
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
    GN.supa.from('fund_pools').select('*').eq('is_active', true).order('code'),
    GN.supa.from('fund_transactions')
      .select('*, fund_pools:pool_id(code, name_ar, currency)')
      .order('created_at', { ascending: false })
      .limit(300)
  ]).then(function(res){
    if (res[0].error){
      console.error('[funds]', res[0].error);
      return;
    }
    /* استبعاد الوعاء الدولاري */
    GN._fundsCache = (res[0].data || []).filter(function(p){ return p.code !== 'usd'; });
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

  var iconMap = { gold: 'gold', profit: 'dollar' };
  var colorMap = {
    gold:   { bg:'linear-gradient(145deg,#F5EBD1,#E5D5A8)', fg:'var(--gold-d)' },
    profit: { bg:'linear-gradient(145deg,#DDF3E3,#B5E0C4)', fg:'var(--ok)' }
  };

  var html = '<div class="kpi-grid" style="grid-template-columns:repeat(auto-fit,minmax(320px,1fr))">';

  pools.forEach(function(p){
    var icon = iconMap[p.code] || 'wallet';
    var style = colorMap[p.code] || { bg:'var(--bg-alt)', fg:'var(--ink-2)' };
    var txCount = GN._fundsTxCache.filter(function(t){ return t.pool_id === p.id; }).length;

    var linkedBank = null;
    if (p.type === 'bank_account' && p.bank_id){
      linkedBank = banks.filter(function(b){ return b.id === p.bank_id; })[0];
    }

    var hasBalance = Number(p.balance || 0) > 0;

    html += '<div class="card" style="margin:0;position:relative;overflow:hidden">' +
      '<div style="position:absolute;top:0;inset-inline:0;height:4px;background:' + style.bg + '"></div>' +

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

      '<div style="text-align:center;padding:14px 0;border-top:1px dashed var(--line);border-bottom:1px dashed var(--line);margin-bottom:12px">' +
        '<div style="font-size:11px;color:var(--ink-2);font-weight:700;margin-bottom:4px">' + GN.esc(GN.t('fundBalance')) + '</div>' +
        '<div style="font-family:\'Reem Kufi\',sans-serif;font-size:26px;font-weight:700;color:var(--ink)">' +
          '<bdi>' + GN.formatNum(p.balance || 0) + '</bdi> <span style="font-size:13px;color:var(--ink-2)">' + GN.esc(p.currency) + '</span>' +
        '</div>' +
      '</div>' +

      (linkedBank
        ? '<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:var(--nile-l);color:var(--nile);border-radius:10px;font-size:11.5px;font-weight:700;margin-bottom:12px">' +
            GN.navIcon('bank') +
            '<span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + GN.esc(linkedBank.name) + '</span>' +
            '<span style="font-size:10.5px;opacity:.75" dir="ltr">' + GN.esc((linkedBank.account_number || '').slice(-4)) + '...</span>' +
          '</div>'
        : '<div style="padding:8px 10px;background:var(--bg-alt);color:var(--ink-3);border-radius:10px;font-size:11.5px;font-weight:600;margin-bottom:12px;text-align:center">' +
            GN.esc(GN.t('fundNoBank')) +
          '</div>') +

      (isAdmin && hasBalance
        ? '<div style="display:flex;gap:6px;margin-bottom:10px">' +
            '<button class="btn btn-gold btn-sm" data-fund-withdraw-to-bank="' + GN.escAttr(p.id) + '" style="flex:1;font-size:11.5px">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="width:14px;height:14px"><path d="M12 5v14M5 12l7 7 7-7"/></svg> ' +
              'سحب إلى بنك</button>' +
            (p.code === 'profit'
              ? '<button class="btn btn-pri btn-sm" data-fund-to-usd="' + GN.escAttr(p.id) + '" style="flex:1;font-size:11.5px">' +
                  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="width:14px;height:14px"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> ' +
                  'أرباح → دولار</button>'
              : '') +
          '</div>'
        : (isAdmin && p.code === 'profit'
            ? '<div style="display:flex;gap:6px;margin-bottom:10px">' +
                '<button class="btn btn-pri btn-sm" data-fund-to-usd="' + GN.escAttr(p.id) + '" style="flex:1;font-size:11.5px">' +
                  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="width:14px;height:14px"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> ' +
                  'أرباح → دولار</button>' +
              '</div>'
            : '')) +

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

  GN.$$('[data-fund-withdraw-to-bank]').forEach(function(b){
    b.addEventListener('click', function(){
      GN.openWithdrawToBankForm(b.getAttribute('data-fund-withdraw-to-bank'));
    });
  });

  GN.$$('[data-fund-to-usd]').forEach(function(b){
    b.addEventListener('click', function(){
      GN.openProfitToUsdForm(b.getAttribute('data-fund-to-usd'));
    });
  });
};

/* ============================================================
   Withdraw to Bank Form (سحب من أي وعاء إلى بنك بنفس العملة)
   ============================================================ */
GN.openWithdrawToBankForm = function(poolId){
  if (!GN.session.isOwner || !GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }

  var pool = GN._fundsCache.filter(function(p){ return p.id === poolId; })[0];
  if (!pool) return;

  var banks = GN.dh.list('banks') || [];
  var eligibleBanks = banks.filter(function(b){
    return (b.currency || 'SDG') === pool.currency;
  });

  if (!eligibleBanks.length){
    GN.toast('لا يوجد حساب بنكي بنفس العملة (' + pool.currency + ')', 'bad');
    return;
  }

  var body = document.getElementById('formModalBody');
  var titleEl = document.getElementById('formModalTitle');
  if (!body || !titleEl) return;
  titleEl.textContent = 'سحب من ' + pool.name_ar + ' إلى حساب بنكي';

  var bankOpts = eligibleBanks.map(function(b){
    return '<option value="' + GN.escAttr(b.id) + '">' + GN.esc(b.name) + ' — ' + GN.formatNum(b.balance || 0) + ' ' + GN.esc(b.currency || 'SDG') + '</option>';
  }).join('');

  body.innerHTML = '<div class="form-grid">' +

    '<div class="field full" style="background:var(--gold-l);color:var(--gold-d);padding:10px 12px;border-radius:10px;font-size:12.5px;font-weight:700;text-align:center">' +
      'الرصيد المتاح في الوعاء: ' + GN.formatNum(pool.balance || 0) + ' ' + GN.esc(pool.currency) +
    '</div>' +

    '<div class="field full"><label>الحساب البنكي المستلم <span class="req">*</span></label>' +
      '<div class="input-wrap"><select id="wb_bank">' + bankOpts + '</select></div></div>' +

    '<div class="field"><label>المبلغ <span class="req">*</span></label>' +
      '<div class="input-wrap" style="display:flex;gap:6px">' +
        '<input type="number" id="wb_amount" step="0.01" min="0" max="' + (pool.balance || 0) + '" placeholder="0" style="flex:1">' +
        '<button type="button" class="btn btn-sec btn-sm" data-wb-all style="min-height:42px;padding:0 12px;font-size:12px">الكل</button>' +
      '</div></div>' +

    '<div class="field"><label>العملة</label>' +
      '<div class="input-wrap"><input type="text" readonly value="' + GN.esc(pool.currency) + '" style="background:var(--bg-alt)"></div></div>' +

    '<div class="field full"><label>السبب / المرجع <span class="req">*</span></label>' +
      '<div class="input-wrap"><input type="text" id="wb_reason" placeholder="مثال: أرباح دورة GLD-2026-0001"></div></div>' +

    '<div class="field full"><label>رقم الحوالة (اختياري)</label>' +
      '<div class="input-wrap"><input type="text" id="wb_ref" dir="ltr" placeholder="TRF-12345"></div></div>' +

    '<div class="field full"><label>ملاحظات</label>' +
      '<div class="input-wrap"><textarea id="wb_notes" rows="2"></textarea></div></div>' +

  '</div>';

  var sub = document.getElementById('formModalSubmit');
  if (sub) sub.style.display = '';
  GN.openModal('formModal');

  body.querySelector('[data-wb-all]').onclick = function(){
    document.getElementById('wb_amount').value = pool.balance || 0;
  };

  sub.onclick = function(){
    var amount = Number(document.getElementById('wb_amount').value) || 0;
    var bankId = document.getElementById('wb_bank').value;
    var reason = document.getElementById('wb_reason').value.trim();
    var ref = document.getElementById('wb_ref').value.trim();
    var notes = document.getElementById('wb_notes').value.trim();

    if (!amount || amount <= 0){ GN.toast('أدخل مبلغًا صحيحًا', 'bad'); return; }
    if (amount > Number(pool.balance || 0)){ GN.toast('المبلغ أكبر من الرصيد المتاح', 'bad'); return; }
    if (!bankId){ GN.toast('اختر الحساب البنكي', 'bad'); return; }
    if (!reason){ GN.toast('السبب مطلوب', 'bad'); return; }

    sub.disabled = true;
    var newPoolBalance = Number(pool.balance || 0) - amount;

    GN.addBankTransfer({
      bank_id: bankId,
      type: 'in',
      amount: amount,
      currency: pool.currency,
      party: pool.name_ar,
      invoice: ref,
      notes: reason + (notes ? ' — ' + notes : ''),
      source: 'fund',
      source_id: pool.id,
      date: GN.today()
    }).then(function(){
      GN.supa.from('fund_pools').update({
        balance: newPoolBalance,
        updated_at: new Date().toISOString()
      }).eq('id', pool.id).then(function(){
        GN.supa.from('fund_transactions').insert({
          pool_id: pool.id,
          type: 'out',
          amount: amount,
          currency: pool.currency,
          reason: reason + ' — سحب إلى ' + (
            (eligibleBanks.filter(function(b){ return b.id === bankId; })[0] || {}).name || 'بنك'
          ),
          reference_type: 'manual',
          notes: notes,
          created_by: GN.session.user.id
        }).then(function(){
          sub.disabled = false;
          GN.toast('✓ تم السحب إلى البنك — ' + GN.formatNum(amount) + ' ' + pool.currency, 'ok');
          GN.notify.send({
            type: 'edit',
            section: 'funds',
            target: 'pool',
            target_id: pool.id,
            title: 'سحب من وعاء',
            body: GN.formatNum(amount) + ' ' + pool.currency + ' — ' + reason
          });
          GN.closeModal('formModal');
          GN.loadFunds();
        });
      });
    });
  };
};

/* ============================================================
   Profit → USD Form
   تحويل من وعاء الأرباح (SDG) إلى حساب بنكي USD
   ============================================================ */
GN.openProfitToUsdForm = function(poolId){
  if (!GN.session.isOwner || !GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }

  var pool = GN._fundsCache.filter(function(p){ return p.id === poolId; })[0];
  if (!pool) return;

  var banks = GN.dh.list('banks') || [];
  var usdBanks = banks.filter(function(b){ return (b.currency || 'SDG') === 'USD'; });

  if (!usdBanks.length){
    GN.toast('لا يوجد حساب بنكي بالدولار', 'bad');
    return;
  }

  var body = document.getElementById('formModalBody');
  var titleEl = document.getElementById('formModalTitle');
  if (!body || !titleEl) return;
  titleEl.textContent = 'تحويل أرباح إلى دولار';

  var bankOpts = usdBanks.map(function(b){
    return '<option value="' + GN.escAttr(b.id) + '">' + GN.esc(b.name) + ' — ' + GN.formatNum(b.balance || 0) + ' USD</option>';
  }).join('');

  body.innerHTML = '<div class="form-grid">' +

    '<div class="field full" style="background:var(--ok-l);color:var(--ok);padding:10px 12px;border-radius:10px;font-size:12.5px;font-weight:700;text-align:center">' +
      'رصيد وعاء الأرباح: ' + GN.formatNum(pool.balance || 0) + ' SDG' +
    '</div>' +

    '<div class="field"><label>المبلغ بالجنيه (SDG) <span class="req">*</span></label>' +
      '<div class="input-wrap" style="display:flex;gap:6px">' +
        '<input type="number" id="pu_sdg" step="0.01" min="0" max="' + (pool.balance || 0) + '" placeholder="0" style="flex:1">' +
        '<button type="button" class="btn btn-sec btn-sm" data-pu-all style="min-height:42px;padding:0 12px;font-size:12px">الكل</button>' +
      '</div></div>' +

    '<div class="field"><label>سعر شراء الدولار (SDG) <span class="req">*</span></label>' +
      '<div class="input-wrap"><input type="number" id="pu_rate" step="0.01" min="0" placeholder="مثال: 2500"></div></div>' +

    '<div class="field full" style="background:var(--gold-l);color:var(--gold-dd);padding:14px;border-radius:12px">' +
      '<div style="text-align:center">' +
        '<div style="font-size:12px;font-weight:700;color:var(--gold-d);margin-bottom:4px">ستحصل على</div>' +
        '<div style="font-family:\'Reem Kufi\',sans-serif;font-size:26px;font-weight:800" id="pu_result">0.00 USD</div>' +
      '</div>' +
    '</div>' +

    '<div class="field full"><label>الحساب البنكي بالدولار <span class="req">*</span></label>' +
      '<div class="input-wrap"><select id="pu_bank">' + bankOpts + '</select></div></div>' +

    '<div class="field full"><label>السبب / المرجع <span class="req">*</span></label>' +
      '<div class="input-wrap"><input type="text" id="pu_reason" placeholder="مثال: تحويل أرباح دورة GLD-2026-0001"></div></div>' +

    '<div class="field full"><label>رقم الحوالة (اختياري)</label>' +
      '<div class="input-wrap"><input type="text" id="pu_ref" dir="ltr" placeholder="TRF-12345"></div></div>' +

    '<div class="field full"><label>ملاحظات</label>' +
      '<div class="input-wrap"><textarea id="pu_notes" rows="2"></textarea></div></div>' +

  '</div>';

  var sub = document.getElementById('formModalSubmit');
  if (sub) sub.style.display = '';
  GN.openModal('formModal');

  var sdgEl = document.getElementById('pu_sdg');
  var rateEl = document.getElementById('pu_rate');
  var resultEl = document.getElementById('pu_result');

  function calc(){
    var sdg = Number(sdgEl.value) || 0;
    var rate = Number(rateEl.value) || 0;
    var usd = rate > 0 ? (sdg / rate) : 0;
    resultEl.textContent = GN.formatNum(usd, 2) + ' USD';
  }
  sdgEl.addEventListener('input', calc);
  rateEl.addEventListener('input', calc);

  body.querySelector('[data-pu-all]').onclick = function(){
    sdgEl.value = pool.balance || 0;
    calc();
  };

  sub.onclick = function(){
    var sdgAmount = Number(sdgEl.value) || 0;
    var rate = Number(rateEl.value) || 0;
    var bankId = document.getElementById('pu_bank').value;
    var reason = document.getElementById('pu_reason').value.trim();
    var ref = document.getElementById('pu_ref').value.trim();
    var notes = document.getElementById('pu_notes').value.trim();

    if (!sdgAmount || sdgAmount <= 0){ GN.toast('أدخل المبلغ بالجنيه', 'bad'); return; }
    if (sdgAmount > Number(pool.balance || 0)){ GN.toast('المبلغ أكبر من رصيد الوعاء', 'bad'); return; }
    if (!rate || rate <= 0){ GN.toast('أدخل سعر شراء الدولار', 'bad'); return; }
    if (!bankId){ GN.toast('اختر الحساب البنكي', 'bad'); return; }
    if (!reason){ GN.toast('السبب مطلوب', 'bad'); return; }

    sub.disabled = true;

    var usdAmount = sdgAmount / rate;
    var newPoolBalance = Number(pool.balance || 0) - sdgAmount;
    var bank = usdBanks.filter(function(b){ return b.id === bankId; })[0];

    /* 1) سجل صرف العملة */
    GN.supa.from('currency_exchanges').insert({
      from_currency: 'SDG',
      to_currency: 'USD',
      from_amount: sdgAmount,
      to_amount: usdAmount,
      rate: rate,
      reason: reason,
      source_pool_id: pool.id,
      target_pool_id: null,
      notes: notes,
      created_by: GN.session.user.id
    }).then(function(){
      /* 2) خصم من وعاء الأرباح */
      GN.supa.from('fund_pools').update({
        balance: newPoolBalance,
        updated_at: new Date().toISOString()
      }).eq('id', pool.id).then(function(){
        /* 3) حركة صادرة في الوعاء */
        GN.supa.from('fund_transactions').insert({
          pool_id: pool.id,
          type: 'out',
          amount: sdgAmount,
          currency: 'SDG',
          reason: reason + ' — تحويل إلى دولار (سعر ' + GN.formatNum(rate) + ')',
          reference_type: 'manual',
          exchange_rate: rate,
          notes: notes,
          created_by: GN.session.user.id
        }).then(function(){
          /* 4) حوالة واردة إلى الحساب البنكي بالدولار */
          GN.addBankTransfer({
            bank_id: bankId,
            type: 'in',
            amount: usdAmount,
            currency: 'USD',
            party: pool.name_ar,
            invoice: ref,
            notes: reason + (notes ? ' — ' + notes : ''),
            source: 'fund',
            source_id: pool.id,
            date: GN.today()
          }).then(function(){
            sub.disabled = false;
            GN.toast('✓ تم التحويل — ' + GN.formatNum(usdAmount, 2) + ' USD إلى ' + (bank ? bank.name : ''), 'ok');
            GN.notify.send({
              type: 'edit',
              section: 'funds',
              target: 'pool',
              target_id: pool.id,
              title: 'تحويل أرباح إلى دولار',
              body: GN.formatNum(sdgAmount) + ' SDG → ' + GN.formatNum(usdAmount, 2) + ' USD'
            });
            GN.closeModal('formModal');
            GN.loadFunds();
          });
        });
      });
    });
  };
};

/* ============================================================
   Transactions list
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
   Pool Edit Form
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

  var typeSel = document.getElementById('fpe_type');
  var bankWrap = document.getElementById('fpe_bank_wrap');
  typeSel.addEventListener('change', function(){
    bankWrap.style.display = this.value === 'bank_account' ? 'block' : 'none';
  });

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

/* ============================================================
   Deposit / Withdraw / Transfer (بدون FX)
   ============================================================ */
GN.fundForm = function(mode){
  if (!GN.session.isOwner || !GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }

  var body = document.getElementById('formModalBody');
  var titleEl = document.getElementById('formModalTitle');
  if (!body || !titleEl) return;

  var titles = {
    deposit:  GN.t('fundDeposit'),
    withdraw: GN.t('fundWithdraw'),
    transfer: GN.t('fundTransfer')
  };
  titleEl.textContent = titles[mode];

  var poolOpts = GN._fundsCache.map(function(p){
    return '<option value="' + GN.escAttr(p.id) + '" data-balance="' + (p.balance || 0) + '" data-currency="' + GN.escAttr(p.currency) + '">' +
      GN.esc(p.name_ar) + ' (' + GN.esc(p.currency) + ': ' + GN.formatNum(p.balance) + ')</option>';
  }).join('');

  var html = '';

  if (mode === 'deposit' || mode === 'withdraw'){
    html = '<div class="form-grid">' +
      '<div class="field full"><label>' + GN.esc(GN.t('fundPool')) + ' <span class="req">*</span></label>' +
        '<div class="input-wrap"><select id="f_pool">' + poolOpts + '</select></div></div>' +
      '<div class="field"><label>' + GN.esc(GN.t('txAmount')) + ' <span class="req">*</span></label>' +
        '<div class="input-wrap" style="display:flex;gap:6px">' +
          '<input type="number" id="f_amount" step="0.01" min="0" style="flex:1">' +
          '<button type="button" class="btn btn-sec btn-sm" data-f-all style="min-height:42px;padding:0 12px;font-size:12px">الكل</button>' +
        '</div></div>' +
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
        '<div class="input-wrap"><select id="f_from">' + poolOpts + '</select></div>' +
        '<div style="font-size:11px;color:var(--ink-3);margin-top:4px" id="f_from_balance"></div></div>' +
      '<div class="field"><label>' + GN.esc(GN.t('fundToPool')) + ' <span class="req">*</span></label>' +
        '<div class="input-wrap"><select id="f_to">' + poolOpts + '</select></div></div>' +
      '<div class="field"><label>' + GN.esc(GN.t('txAmount')) + ' <span class="req">*</span></label>' +
        '<div class="input-wrap" style="display:flex;gap:6px">' +
          '<input type="number" id="f_amount" step="0.01" min="0" style="flex:1">' +
          '<button type="button" class="btn btn-sec btn-sm" data-f-all style="min-height:42px;padding:0 12px;font-size:12px">الكل</button>' +
        '</div></div>' +
      '<div class="field"><label>' + GN.esc(GN.t('fundReason')) + ' <span class="req">*</span></label>' +
        '<div class="input-wrap"><input type="text" id="f_reason" placeholder="نقل رأس مال"></div></div>' +
      '<div class="field full"><label>' + GN.esc(GN.t('notes')) + '</label>' +
        '<div class="input-wrap"><textarea id="f_notes" rows="2"></textarea></div></div>' +
    '</div>';
  }

  body.innerHTML = html;

  var sub = document.getElementById('formModalSubmit');
  if (sub) sub.style.display = '';
  GN.openModal('formModal');

  /* "الكل" */
  var allBtn = body.querySelector('[data-f-all]');
  if (allBtn){
    allBtn.onclick = function(){
      var poolSel = document.getElementById(mode === 'transfer' ? 'f_from' : 'f_pool');
      if (!poolSel) return;
      var opt = poolSel.options[poolSel.selectedIndex];
      var balance = Number(opt.getAttribute('data-balance') || 0);
      document.getElementById('f_amount').value = balance;
    };
  }

  /* عرض الرصيد تحت "من الحوض" في التحويل */
  if (mode === 'transfer'){
    var fromSel = document.getElementById('f_from');
    var fromBal = document.getElementById('f_from_balance');
    function updateFromBalance(){
      var opt = fromSel.options[fromSel.selectedIndex];
      var bal = opt ? (opt.getAttribute('data-balance') || 0) : 0;
      if (fromBal) fromBal.textContent = 'الرصيد المتاح: ' + GN.formatNum(bal);
    }
    fromSel.addEventListener('change', updateFromBalance);
    updateFromBalance();
  }

  sub.onclick = function(){
    sub.disabled = true;

    if (mode === 'deposit' || mode === 'withdraw'){
      var poolId = document.getElementById('f_pool').value;
      var amount = Number(document.getElementById('f_amount').value) || 0;
      var reason = document.getElementById('f_reason').value.trim();
      var ref = document.getElementById('f_ref').value.trim();
      var notes = document.getElementById('f_notes').value.trim();

      if (!amount || !reason){ GN.toast(GN.t('fieldRequired'), 'bad'); sub.disabled = false; return; }

      var pool = GN._fundsCache.filter(function(p){ return p.id === poolId; })[0];
      if (!pool){ GN.toast('حوض غير موجود', 'bad'); sub.disabled = false; return; }

      var delta = mode === 'deposit' ? amount : -amount;
      var newBalance = Number(pool.balance || 0) + delta;
      if (newBalance < 0){ GN.toast('الرصيد لا يكفي', 'bad'); sub.disabled = false; return; }

      var afterTx = function(){
        GN.savePublicData(GN.dash.data).then(function(){
          sub.disabled = false;
          GN.toast(mode === 'deposit' ? 'تم الإيداع' : 'تم السحب', 'ok');
          GN.closeModal('formModal');
          GN.loadFunds();
        });
      };

      if (pool.type === 'bank_account' && pool.bank_id){
        GN.addBankTransfer({
          bank_id: pool.bank_id,
          type: mode === 'deposit' ? 'in' : 'out',
          amount: amount,
          currency: pool.currency,
          party: reason,
          invoice: ref,
          notes: (mode === 'deposit' ? 'إيداع' : 'سحب') + ' — ' + pool.name_ar,
          source: 'fund',
          source_id: poolId,
          date: GN.today()
        }).then(function(){
          pool.balance = newBalance;
          GN.supa.from('fund_transactions').insert({
            pool_id: poolId,
            type: mode === 'deposit' ? 'in' : 'out',
            amount: amount,
            currency: pool.currency,
            reason: reason,
            reference_type: 'manual',
            notes: notes,
            created_by: GN.session.user.id
          }).then(afterTx);
        });
      } else {
        pool.balance = newBalance;
        GN.supa.from('fund_transactions').insert({
          pool_id: poolId,
          type: mode === 'deposit' ? 'in' : 'out',
          amount: amount,
          currency: pool.currency,
          reason: reason,
          reference_type: 'manual',
          notes: notes,
          created_by: GN.session.user.id
        }).then(afterTx);
      }

    } else if (mode === 'transfer'){
      var fromId = document.getElementById('f_from').value;
      var toId = document.getElementById('f_to').value;
      var amount2 = Number(document.getElementById('f_amount').value) || 0;
      var reason2 = document.getElementById('f_reason').value.trim();
      var notes2 = document.getElementById('f_notes').value.trim();

      if (fromId === toId){ GN.toast('لا يمكن التحويل لنفس الحوض', 'bad'); sub.disabled = false; return; }
      if (!amount2 || !reason2){ GN.toast(GN.t('fieldRequired'), 'bad'); sub.disabled = false; return; }

      var fromPool = GN._fundsCache.filter(function(p){ return p.id === fromId; })[0];
      var toPool = GN._fundsCache.filter(function(p){ return p.id === toId; })[0];
      if (!fromPool || !toPool){ GN.toast('خطأ في الأوعية', 'bad'); sub.disabled = false; return; }
      if (fromPool.currency !== toPool.currency){
        GN.toast('العملات مختلفة — استخدم "أرباح → دولار"', 'bad'); sub.disabled = false; return;
      }
      if (Number(fromPool.balance || 0) < amount2){ GN.toast('الرصيد لا يكفي', 'bad'); sub.disabled = false; return; }

      var txs = [
        { pool_id: fromId, type: 'transfer_out', amount: amount2, currency: fromPool.currency, reason: reason2, counterparty_pool_id: toId, reference_type: 'manual', created_by: GN.session.user.id },
        { pool_id: toId, type: 'transfer_in', amount: amount2, currency: toPool.currency, reason: reason2, counterparty_pool_id: fromId, reference_type: 'manual', created_by: GN.session.user.id }
      ];

      GN.supa.from('fund_transactions').insert(txs).then(function(r){
        if (r.error){ GN.toast(r.error.message, 'bad'); sub.disabled = false; return; }

        fromPool.balance = Number(fromPool.balance) - amount2;
        toPool.balance = Number(toPool.balance) + amount2;

        var afterTransfer = function(){
          GN.savePublicData(GN.dash.data).then(function(){
            sub.disabled = false;
            GN.toast('تم التحويل', 'ok');
            GN.closeModal('formModal');
            GN.loadFunds();
          });
        };

        var promises = [];
        if (fromPool.type === 'bank_account' && fromPool.bank_id){
          promises.push(GN.addBankTransfer({
            bank_id: fromPool.bank_id, type: 'out', amount: amount2, currency: fromPool.currency,
            party: toPool.name_ar, notes: reason2, source: 'fund', source_id: fromId, date: GN.today()
          }));
        }
        if (toPool.type === 'bank_account' && toPool.bank_id){
          promises.push(GN.addBankTransfer({
            bank_id: toPool.bank_id, type: 'in', amount: amount2, currency: toPool.currency,
            party: fromPool.name_ar, notes: reason2, source: 'fund', source_id: toId, date: GN.today()
          }));
        }
        Promise.all(promises).then(afterTransfer);
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
  GN.bindAction('fund-usd',      function(){
    var profitPool = GN._fundsCache.filter(function(p){ return p.code === 'profit'; })[0];
    if (!profitPool){ GN.toast('وعاء الأرباح غير موجود', 'bad'); return; }
    GN.openProfitToUsdForm(profitPool.id);
  });
};

console.log('[Gold Nile] dashboard/16-funds.js loaded');
})();