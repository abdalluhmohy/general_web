/* ============================================================
   Gold Nile — Dashboard / Banking
   Banks · Transfers · Per-currency KPIs · Bank Details
   + Colored tags + Unified Logger + Feed Pool button
   ============================================================ */
(function(){
'use strict';

var GN = window.GN = window.GN || {};

var ICO_EDIT = GN.ICO_EDIT;
var ICO_DEL  = GN.ICO_DEL;

/* ============================================================
   Bank color palette
   ============================================================ */
var BANK_COLORS = [
  { bg:'#F5EBD1', fg:'#8C6A1F' },
  { bg:'#E1EFED', fg:'#1E6B67' },
  { bg:'#E5EEF7', fg:'#2C6398' },
  { bg:'#F0E5F5', fg:'#7A4B9E' },
  { bg:'#F6E1DD', fg:'#B33A2A' },
  { bg:'#DDF3E3', fg:'#2B7A55' },
  { bg:'#FBEED2', fg:'#B26A00' },
  { bg:'#E8E8F5', fg:'#4A4A9E' }
];

GN._bankColor = function(bankId){
  if (!bankId) return BANK_COLORS[0];
  var hash = 0;
  var s = String(bankId);
  for (var i = 0; i < s.length; i++){
    hash = ((hash << 5) - hash) + s.charCodeAt(i);
    hash = hash & hash;
  }
  return BANK_COLORS[Math.abs(hash) % BANK_COLORS.length];
};

GN._bankTag = function(bankId, bankName){
  if (!bankName) return '<span style="color:var(--ink-3)">—</span>';
  var c = GN._bankColor(bankId);
  return '<span style="display:inline-block;padding:3px 10px;border-radius:12px;background:' + c.bg + ';color:' + c.fg + ';font-size:11.5px;font-weight:800;white-space:nowrap">' + GN.esc(bankName) + '</span>';
};

/* ============================================================
   Unified Bank Transfer Logger
   ============================================================ */
GN.addBankTransfer = function(opts){
  opts = opts || {};
  if (!opts.bank_id) return Promise.resolve(false);

  var arr = GN.dh.list('transfers');
  var banks = GN.dh.list('banks');
  var bank = banks.filter(function(b){ return b.id === opts.bank_id; })[0];
  if (!bank) return Promise.resolve(false);

  var amount = Number(opts.amount || 0);
  if (amount <= 0) return Promise.resolve(false);

  var type = opts.type || 'out';
  var record = {
    id: GN.uid(),
    type: type,
    date: opts.date || GN.today(),
    bank_id: bank.id,
    bank_name: bank.name,
    amount: amount,
    currency: opts.currency || bank.currency || 'SDG',
    party: opts.party || '',
    invoice: opts.invoice || '',
    attachment: opts.attachment || '',
    notes: opts.notes || '',
    source: opts.source || 'manual',
    source_id: opts.source_id || '',
    created_at: GN.now()
  };

  arr.push(record);
  bank.balance = Number(bank.balance || 0) + (type === 'in' ? amount : -amount);

  return GN.savePublicData(GN.dash.data).then(function(ok){
    return ok ? record : false;
  });
};

GN.removeBankTransfer = function(source, sourceId){
  if (!source || !sourceId) return Promise.resolve(false);
  var arr = GN.dh.list('transfers');
  var banks = GN.dh.list('banks');
  var removed = false;

  for (var i = arr.length - 1; i >= 0; i--){
    var t = arr[i];
    if (t.source === source && String(t.source_id) === String(sourceId)){
      if (t.bank_id){
        var bank = banks.filter(function(b){ return b.id === t.bank_id; })[0];
        if (bank){
          var amt = Number(t.amount || 0);
          bank.balance = Number(bank.balance || 0) - (t.type === 'in' ? amt : -amt);
        }
      }
      arr.splice(i, 1);
      removed = true;
    }
  }

  if (removed){
    return GN.savePublicData(GN.dash.data).then(function(){ return true; });
  }
  return Promise.resolve(false);
};

/* ============================================================
   Banking Section
   ============================================================ */
GN.sections.banking = function(){
  var d = GN.dash.data || {};
  var banks = (d.dashboard && d.dashboard.banks) || [];
  var transfers = (d.dashboard && d.dashboard.transfers) || [];
  var pools = GN.dh.list('fund_pools');

  /* Per-currency grouping */
  var currencies = {};
  banks.forEach(function(b){
    var c = b.currency || 'SDG';
    if (!currencies[c]) currencies[c] = { banks: [], totalBalance: 0, totalIn: 0, totalOut: 0 };
    currencies[c].banks.push(b);
    currencies[c].totalBalance += Number(b.balance || 0);
  });

  transfers.forEach(function(t){
    var c = t.currency || 'SDG';
    if (!currencies[c]) currencies[c] = { banks: [], totalBalance: 0, totalIn: 0, totalOut: 0 };
    var amt = Number(t.amount || 0);
    if (t.type === 'in') currencies[c].totalIn += amt;
    else currencies[c].totalOut += amt;
  });

  var currKeys = Object.keys(currencies).sort();

  var flags = (window.GN_CONST && window.GN_CONST.CURRENCIES) || [];
  function flagOf(code){
    var found = flags.filter(function(x){ return x.code === code; })[0];
    return found ? (found.flag || '') + ' ' + code : code;
  }

  var html = '';

  if (!banks.length && !transfers.length){
    html += '<div class="card"><div class="empty"><div class="ic">' + GN.navIcon('bank') + '</div>' +
      '<h4>' + GN.esc(GN.t('noData')) + '</h4><p>' + GN.esc(GN.t('addBank')) + '</p></div></div>';
  } else {
    currKeys.forEach(function(c){
      var info = currencies[c];
      var net = info.totalIn - info.totalOut;
      html += '<div style="margin-bottom:16px">' +
        '<div style="font-family:\'Cairo\',sans-serif;font-size:14px;font-weight:800;color:var(--ink-2);margin-bottom:8px;display:flex;align-items:center;gap:8px">' +
          '<span>' + GN.esc(flagOf(c)) + '</span>' +
          '<span style="flex:1;height:1px;background:var(--line-2)"></span>' +
        '</div>' +
        '<div class="kpi-grid">' +
          '<div class="kpi hl"><div class="top"><span class="ic">' + GN.navIcon('bank') + '</span></div>' +
            '<div class="lbl">' + GN.esc(GN.t('consolidatedBalance')) + '</div>' +
            '<div class="val"><bdi>' + GN.formatNum(info.totalBalance) + '</bdi><span class="cur">' + GN.esc(c) + '</span></div></div>' +
          '<div class="kpi"><div class="top"><span class="ic ok">' + GN.navIcon('check') + '</span></div>' +
            '<div class="lbl">' + GN.esc(GN.t('incomingTotal')) + '</div>' +
            '<div class="val"><bdi>' + GN.formatNum(info.totalIn) + '</bdi><span class="cur">' + GN.esc(c) + '</span></div></div>' +
          '<div class="kpi"><div class="top"><span class="ic b">' + GN.navIcon('dollar') + '</span></div>' +
            '<div class="lbl">' + GN.esc(GN.t('outgoingTotal')) + '</div>' +
            '<div class="val"><bdi>' + GN.formatNum(info.totalOut) + '</bdi><span class="cur">' + GN.esc(c) + '</span></div></div>' +
          '<div class="kpi"><div class="top"><span class="ic ' + (net >= 0 ? 'ok' : 'b') + '">' + GN.navIcon('chart') + '</span></div>' +
            '<div class="lbl">' + GN.esc(GN.t('txNet')) + '</div>' +
            '<div class="val" style="color:' + (net >= 0 ? 'var(--ok)' : 'var(--bad)') + '">' +
              (net >= 0 ? '+' : '') + GN.formatNum(net) + '<span class="cur">' + GN.esc(c) + '</span></div></div>' +
        '</div>' +
      '</div>';
    });
  }

  html += '<div style="text-align:end;margin-bottom:14px">' +
    '<button class="btn btn-pri btn-sm" data-act="add-bank">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg> ' +
      GN.esc(GN.t('addBank')) + '</button></div>';

  /* Bank cards */
  if (banks.length){
    html += '<div class="kpi-grid" style="grid-template-columns:repeat(auto-fit,minmax(320px,1fr))">';
    banks.forEach(function(b, i){
      var bankIn = 0, bankOut = 0;
      transfers.forEach(function(t){
        if (t.bank_id === b.id || t.bank === b.name){
          if (t.type === 'in') bankIn += Number(t.amount || 0);
          else bankOut += Number(t.amount || 0);
        }
      });

      /* Find pools linked to this bank */
      var linkedPools = pools.filter(function(p){
        return p.type === 'bank_account' && p.bank_id === b.id;
      });

      var poolsHtml = '';
      if (linkedPools.length){
        poolsHtml = '<div style="margin-top:10px;padding-top:10px;border-top:1px dashed var(--line);font-size:11.5px">' +
          '<div style="font-weight:800;color:var(--ink-3);margin-bottom:6px">الأوعية المرتبطة:</div>' +
          linkedPools.map(function(p){
            return '<div style="display:flex;justify-content:space-between;padding:3px 0">' +
              '<span style="color:var(--ink-2);font-weight:600">' + GN.esc(p.name_ar) + '</span>' +
              '<bdi style="font-weight:800;color:var(--gold-d)">' + GN.formatNum(p.balance || 0) + ' ' + GN.esc(p.currency) + '</bdi>' +
            '</div>';
          }).join('') +
        '</div>';
      }

      html += '<div class="card" style="margin:0" data-notif-id="' + GN.escAttr(b.id || '') + '">' +
        '<div class="card-head">' +
        '<h3 class="bank-name-link" data-bank-detail="' + i + '" style="font-size:15px">' + GN.esc(b.name || '-') + '</h3>' +
        '<div class="row-actions">' +
          '<button class="icon-act" data-act="edit-bank" data-idx="' + i + '" title="' + GN.escAttr(GN.t('edit')) + '">' + ICO_EDIT + '</button>' +
          '<button class="icon-act del" data-act="del-bank" data-idx="' + i + '" title="' + GN.escAttr(GN.t('delete')) + '">' + ICO_DEL + '</button>' +
        '</div></div>' +
        '<div style="font-size:12px;color:var(--ink-2);line-height:1.9">' +
          (b.branch        ? '<div><b>' + GN.esc(GN.t('bankBranch')) + ':</b> ' + GN.esc(b.branch) + '</div>' : '') +
          (b.account_name  ? '<div><b>' + GN.esc(GN.t('accountName')) + ':</b> ' + GN.esc(b.account_name) + '</div>' : '') +
          (b.account_number? '<div><b>' + GN.esc(GN.t('accountNumber')) + ':</b> <bdi dir="ltr">' + GN.esc(b.account_number) + '</bdi></div>' : '') +
          (b.iban          ? '<div><b>' + GN.esc(GN.t('iban')) + ':</b> <bdi dir="ltr">' + GN.esc(b.iban) + '</bdi></div>' : '') +
          (b.swift         ? '<div><b>' + GN.esc(GN.t('swift')) + ':</b> <bdi dir="ltr">' + GN.esc(b.swift) + '</bdi></div>' : '') +
        '</div>' +
        '<div style="margin-top:14px;padding-top:14px;border-top:1px dashed var(--line);text-align:center">' +
          '<div class="lbl" style="font-size:11.5px;color:var(--ink-2)">' + GN.esc(GN.t('currentBalance')) + '</div>' +
          '<div style="font-family:Reem Kufi,sans-serif;font-size:26px;font-weight:700;color:var(--ink);margin-top:4px">' +
            '<bdi>' + GN.formatNum(b.balance || 0) + '</bdi> <span style="font-size:13px;color:var(--ink-2)">' + GN.esc(b.currency || 'SDG') + '</span></div></div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px">' +
          '<div style="text-align:center;padding:8px;background:var(--ok-l);border-radius:10px">' +
            '<div style="font-size:10.5px;color:var(--ok);font-weight:700">' + GN.esc(GN.t('incomingTotal')) + '</div>' +
            '<div style="font-weight:700;color:var(--ok)">' + GN.formatNum(bankIn) + '</div></div>' +
          '<div style="text-align:center;padding:8px;background:var(--bad-l);border-radius:10px">' +
            '<div style="font-size:10.5px;color:var(--bad);font-weight:700">' + GN.esc(GN.t('outgoingTotal')) + '</div>' +
            '<div style="font-weight:700;color:var(--bad)">' + GN.formatNum(bankOut) + '</div></div>' +
        '</div>' +
        poolsHtml +
        '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:12px">' +
          '<button class="btn btn-pri btn-sm" data-act="add-in" data-bank-idx="' + i + '" style="font-size:11.5px">' + GN.esc(GN.t('addIncoming')) + '</button>' +
          '<button class="btn btn-danger btn-sm" data-act="add-out" data-bank-idx="' + i + '" style="font-size:11.5px">' + GN.esc(GN.t('addOutgoing')) + '</button>' +
          '<button class="btn btn-gold btn-sm" data-act="feed-pool" data-bank-idx="' + i + '" style="font-size:11.5px" title="تغذية وعاء">تغذية</button>' +
        '</div></div>';
    });
    html += '</div>';
  }

  /* Transfers log */
  html += '<div class="card" style="margin-top:18px"><div class="card-head">' +
    '<h3>' + GN.navIcon('bank') + ' ' + GN.esc(GN.t('transfersLog')) + '</h3>' +
    '<button class="btn btn-sec btn-sm" data-act="export-transfers">' + GN.esc(GN.t('exportExcel')) + '</button></div>';

  if (!transfers.length){
    html += '<div class="empty"><div class="ic">' + GN.navIcon('bank') + '</div><h4>' + GN.esc(GN.t('noData')) + '</h4></div>';
  } else {
    var sortedTr = transfers.slice().sort(function(a, b){
  /* الأحدث أولًا: قارن بـ created_at أولًا، ثم date، ثم id */
    var aKey = (a.created_at || a.date || '') + '|' + (a.id || '');
    var bKey = (b.created_at || b.date || '') + '|' + (b.id || '');
    return bKey.localeCompare(aKey);
});

    var sourceLabels = {
      payable:       'استحقاق',
      gold_purchase: 'شراء ذهب',
      gold_sale:     'بيع ذهب',
      expense:       'مصروف',
      fund:          'وعاء',
      feed_pool:     'تغذية وعاء',
      manual:        'يدوي'
    };

    html += '<div class="table-wrap"><table><thead><tr>' +
      '<th>' + GN.esc(GN.t('date')) + '</th>' +
      '<th>' + GN.esc(GN.t('bankName')) + '</th>' +
      '<th>' + GN.esc(GN.t('transferType')) + '</th>' +
      '<th>' + GN.esc(GN.t('party')) + '</th>' +
      '<th>' + GN.esc(GN.t('amount')) + '</th>' +
      '<th>' + GN.esc(GN.t('invoiceNumber')) + '</th>' +
      '<th>المصدر</th>' +
      '<th>' + GN.esc(GN.t('attachment')) + '</th><th></th></tr></thead><tbody>';

    sortedTr.forEach(function(t){
      var origIdx = transfers.indexOf(t);
      var bankName = t.bank_name || '';
      var bankId   = t.bank_id || '';
      if (!bankName){
        var bank = banks.filter(function(b){
          return b.id === t.bank_id || b.name === t.bank;
        })[0];
        if (bank){
          bankName = bank.name;
          bankId = bank.id;
        }
      }

      var typeChip = t.type === 'in'
        ? '<span class="chip ok"><span class="dot"></span>' + GN.esc(GN.t('incoming')) + '</span>'
        : '<span class="chip b"><span class="dot"></span>' + GN.esc(GN.t('outgoing')) + '</span>';

      var sourceBadge = (t.source && t.source !== 'manual')
        ? '<span class="chip n" style="font-size:10.5px">' + GN.esc(sourceLabels[t.source] || t.source) + '</span>'
        : '<span style="color:var(--ink-3);font-size:11px">يدوي</span>';

      html += '<tr data-notif-id="' + GN.escAttr(t.id || '') + '">' +
        '<td>' + GN.esc(GN.formatDate(t.date)) + '</td>' +
        '<td>' + GN._bankTag(bankId, bankName) + '</td>' +
        '<td>' + typeChip + '</td>' +
        '<td>' + GN.esc(t.party || '-') + '</td>' +
        '<td class="num" style="color:' + (t.type === 'in' ? 'var(--ok)' : 'var(--bad)') + ';font-weight:800">' +
          (t.type === 'in' ? '+' : '-') + ' ' + GN.formatMoneyPlain(t.amount, t.currency || 'SDG') + '</td>' +
        '<td><bdi dir="ltr">' + GN.esc(t.invoice || '-') + '</bdi></td>' +
        '<td>' + sourceBadge + '</td>' +
        '<td>' + (t.attachment ? '<a href="' + GN.escAttr(t.attachment) + '" target="_blank" rel="noopener" class="chip n">' + GN.esc(GN.t('view')) + '</a>' : '-') + '</td>' +
        '<td class="actions">' + GN.dh.sectionActions([
          { act:'edit-transfer', idx:origIdx, icon:ICO_EDIT, title:GN.t('edit') },
          { act:'del-transfer',  idx:origIdx, icon:ICO_DEL,  title:GN.t('delete'), danger:true }
        ]) + '</td></tr>';
    });
    html += '</tbody></table></div>';
  }
  html += '</div>';
  return html;
};

GN.bindSection.banking = function(){
  GN.bindAction('add-bank',      function(){ GN.openBankForm(-1); });
  GN.bindAction('edit-bank',     function(btn){ GN.openBankForm(+btn.getAttribute('data-idx')); });
  GN.bindAction('del-bank',      function(btn){ GN.delBank(+btn.getAttribute('data-idx')); });
  GN.bindAction('add-in',        function(btn){ GN.openTransferForm(-1, 'in', +btn.getAttribute('data-bank-idx')); });
  GN.bindAction('add-out',       function(btn){ GN.openTransferForm(-1, 'out', +btn.getAttribute('data-bank-idx')); });
  GN.bindAction('edit-transfer', function(btn){ GN.openTransferForm(+btn.getAttribute('data-idx')); });
  GN.bindAction('del-transfer',  function(btn){ GN.delTransfer(+btn.getAttribute('data-idx')); });
  GN.bindAction('export-transfers', function(){ GN.exportTransfersExcel(); });
  GN.bindAction('feed-pool',     function(btn){ GN.openFeedPoolForm(+btn.getAttribute('data-bank-idx')); });

  GN.$$('[data-bank-detail]').forEach(function(el){
    el.addEventListener('click', function(e){
      e.stopPropagation();
      GN.openBankDetails(+el.getAttribute('data-bank-detail'));
    });
  });
};

/* ============================================================
   Feed Pool Form — نقل مبلغ من بنك إلى وعاء
   ============================================================ */
GN.openFeedPoolForm = function(bankIdx){
  if (!GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }

  var banks = GN.dh.list('banks');
  var bank = banks[bankIdx];
  if (!bank){ GN.toast('البنك غير موجود', 'bad'); return; }

  var pools = GN.dh.list('fund_pools');
  var eligible = pools.filter(function(p){ return p.is_active !== false; });

  if (!eligible.length){
    GN.toast('لا توجد أوعية مالية', 'bad');
    return;
  }

  var poolOpts = eligible.map(function(p){
    return '<option value="' + GN.escAttr(p.id) + '"' +
      ' data-currency="' + GN.escAttr(p.currency) + '"' +
      ' data-bank-id="' + GN.escAttr(p.bank_id || '') + '">' +
      GN.esc(p.name_ar) + ' (' + GN.esc(p.currency) + ': ' + GN.formatNum(p.balance || 0) + ')' +
      '</option>';
  }).join('');

  var body = document.getElementById('formModalBody');
  var titleEl = document.getElementById('formModalTitle');
  if (!body || !titleEl) return;
  titleEl.textContent = 'تغذية وعاء من: ' + bank.name;

  body.innerHTML = '<div class="form-grid">' +
    '<div class="field full" style="background:var(--gold-l);color:var(--gold-d);padding:10px 12px;border-radius:10px;font-size:12.5px;font-weight:700;text-align:center">' +
      'الرصيد الحالي في ' + GN.esc(bank.name) + ': ' + GN.formatNum(bank.balance || 0) + ' ' + GN.esc(bank.currency || 'SDG') +
    '</div>' +
    '<div class="field full"><label>الوعاء المستلم <span class="req">*</span></label>' +
      '<div class="input-wrap"><select id="fp_pool">' + poolOpts + '</select></div></div>' +
    '<div class="field"><label>المبلغ <span class="req">*</span></label>' +
      '<div class="input-wrap"><input type="number" id="fp_amount" step="0.01" min="0" placeholder="0"></div></div>' +
    '<div class="field"><label>العملة</label>' +
      '<div class="input-wrap"><input type="text" id="fp_currency" readonly style="background:var(--bg-alt)"></div></div>' +
    '<div class="field full"><label>السبب / المرجع</label>' +
      '<div class="input-wrap"><input type="text" id="fp_reason" value="تغذية وعاء ذهب"></div></div>' +
    '<div class="field full"><label>ملاحظات</label>' +
      '<div class="input-wrap"><textarea id="fp_notes" rows="2"></textarea></div></div>' +
  '</div>';

  var poolSel = document.getElementById('fp_pool');
  var curEl = document.getElementById('fp_currency');

  function syncCurrency(){
    var opt = poolSel.options[poolSel.selectedIndex];
    curEl.value = opt ? opt.getAttribute('data-currency') : bank.currency;
  }
  poolSel.addEventListener('change', syncCurrency);
  syncCurrency();

  var sub = document.getElementById('formModalSubmit');
  if (sub) sub.style.display = '';
  GN.openModal('formModal');

  sub.onclick = function(){
    var poolId = poolSel.value;
    var amount = Number(document.getElementById('fp_amount').value) || 0;
    var reason = document.getElementById('fp_reason').value.trim();
    var notes  = document.getElementById('fp_notes').value.trim();

    if (!poolId || !amount || amount <= 0){ GN.toast(GN.t('fieldRequired'), 'bad'); return; }

    var pool = eligible.filter(function(p){ return p.id === poolId; })[0];
    if (!pool){ GN.toast('الوعاء غير موجود', 'bad'); return; }

    if (Number(bank.balance || 0) < amount){
      GN.toast('رصيد البنك لا يكفي', 'bad');
      return;
    }

    sub.disabled = true;

    /* 1) حوالة صادرة من البنك */
    GN.addBankTransfer({
      bank_id: bank.id,
      type: 'out',
      amount: amount,
      currency: pool.currency || bank.currency,
      party: pool.name_ar,
      notes: reason + (notes ? ' — ' + notes : ''),
      source: 'feed_pool',
      source_id: poolId,
      date: GN.today()
    }).then(function(){
      /* 2) زيادة رصيد الوعاء */
      pool.balance = Number(pool.balance || 0) + amount;

      /* 3) إذا الوعاء مرتبط بحساب بنكي → حوالة واردة */
      if (pool.type === 'bank_account' && pool.bank_id && pool.bank_id !== bank.id){
        GN.addBankTransfer({
          bank_id: pool.bank_id,
          type: 'in',
          amount: amount,
          currency: pool.currency || bank.currency,
          party: bank.name,
          notes: 'استلام تغذية من ' + bank.name,
          source: 'feed_pool',
          source_id: poolId,
          date: GN.today()
        }).then(function(){
          finalize();
        });
      } else {
        finalize();
      }
    });

    function finalize(){
      /* 4) سجل حركة الوعاء */
      GN.supa.from('fund_transactions').insert({
        pool_id: poolId,
        type: 'in',
        amount: amount,
        currency: pool.currency || bank.currency,
        reason: reason + ' من ' + bank.name,
        reference_type: 'initial_deposit',
        notes: notes,
        created_by: GN.session.user.id
      }).then(function(){
        GN.savePublicData(GN.dash.data).then(function(){
          sub.disabled = false;
          GN.toast('تمت التغذية — ' + GN.formatNum(amount) + ' ' + (pool.currency || bank.currency), 'ok');
          GN.notify.send({
            type: 'edit',
            section: 'banking',
            target: 'bank',
            target_id: bank.id,
            title: 'تغذية وعاء',
            body: GN.formatNum(amount) + ' ' + (pool.currency || bank.currency) + ' → ' + pool.name_ar
          });
          GN.closeModal('formModal');
          GN.renderSection('banking');
        });
      });
    }
  };
};

/* ============================================================
   Bank Details Modal
   ============================================================ */
GN.openBankDetails = function(idx){
  var banks = (GN.dash.data && GN.dash.data.dashboard && GN.dash.data.dashboard.banks) || [];
  var b = banks[idx];
  if (!b) return;

  var body = document.getElementById('bankDetailsBody');
  var titleEl = document.getElementById('bankDetailsTitle');
  if (!body) return;

  var isAdmin = GN.session.isAdmin && GN.session.isOwner;
  var empty = '—';

  function row(label, key, ltr){
    var val = (b[key] != null ? String(b[key]) : '').trim() || empty;
    var editable = isAdmin ? ' contenteditable="true"' : '';
    var dirAttr = ltr ? ' dir="ltr"' : '';
    var fieldAttr = isAdmin ? ' data-bank-field="' + key + '"' : '';
    return '<tr><th>' + GN.esc(label) + '</th><td' + dirAttr + editable + fieldAttr + '>' + GN.esc(val) + '</td></tr>';
  }

  var html = '<div class="bank-details-head">' + GN.esc(b.name || 'بيانات الحساب البنكي') + '</div>';
  html += '<table class="bank-details-table"><tbody>';
  html += row('اسم الحساب', 'account_name', false);
  html += row('البنك', 'name', false);
  html += row('الفرع', 'branch', false);
  html += row('رقم الحساب', 'account_number', true);
  html += row('رقم حساب العميل الأساسي', 'customer_number', true);
  html += row('رقم حساب العميل العالمي', 'iban', true);
  html += row('رمز SWIFT', 'swift', true);
  html += '</tbody></table>';
  if (isAdmin) html += '<div class="bank-details-note">اضغط على أي خلية لتعديلها — يُحفظ التعديل تلقائيًا</div>';

  body.innerHTML = html;
  if (titleEl) titleEl.textContent = 'بيانات الحساب البنكي';

  GN.openModal('bankDetailsModal');

  if (isAdmin){
    GN.$$('[data-bank-field]').forEach(function(cell){
      cell.addEventListener('blur', function(){
        var key = cell.getAttribute('data-bank-field');
        var newVal = cell.textContent.trim();
        if (newVal === empty) newVal = '';
        if ((b[key] || '') === newVal) return;
        b[key] = newVal;
        GN.savePublicData(GN.dash.data).then(function(ok){
          if (ok) GN.toast('تم الحفظ', 'ok');
          else    GN.toast('تعذر الحفظ', 'bad');
        });
      });
      cell.addEventListener('keydown', function(e){
        if (e.key === 'Enter'){ e.preventDefault(); cell.blur(); }
        if (e.key === 'Escape'){ cell.blur(); }
      });
    });
  }
};

/* ============================================================
   Bank Form
   ============================================================ */
GN.openBankForm = function(idx){
  if (!GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  var arr = GN.dh.list('banks');
  var item = idx >= 0 ? arr[idx] : {};

  GN.openForm('addBank', [
    { id:'name',            label: GN.t('bankName'), req:true, full:true, value:item.name || '' },
    { id:'branch',          label: GN.t('bankBranch'), value:item.branch || '' },
    { id:'account_name',    label: GN.t('accountName'), value:item.account_name || '' },
    { id:'account_number',  label: GN.t('accountNumber'), dir:'ltr', value:item.account_number || '' },
    { id:'customer_number', label: 'رقم حساب العميل الأساسي', dir:'ltr', value:item.customer_number || '' },
    { id:'iban',            label: GN.t('iban'), dir:'ltr', value:item.iban || '' },
    { id:'swift',           label: GN.t('swift'), dir:'ltr', value:item.swift || '' },
    { id:'balance',         label: GN.t('balance'), type:'number', value:item.balance || 0 },
    { id:'currency',        label: GN.t('currency'), value:item.currency || 'SDG' }
  ]);

  GN.onSubmit(function(done){
    var v = GN.readForm(['name','branch','account_name','account_number','customer_number','iban','swift','balance','currency']);
    if (!v.name){ GN.toast(GN.t('fieldRequired'), 'bad'); done(false); return; }
    var isNew = idx < 0;
    var obj = {
      id: isNew ? GN.uid() : arr[idx].id,
      name: v.name,
      branch: v.branch,
      account_name: v.account_name,
      account_number: v.account_number,
      customer_number: v.customer_number,
      iban: v.iban,
      swift: v.swift,
      balance: Number(v.balance) || 0,
      currency: v.currency || 'SDG'
    };
    if (idx >= 0) Object.assign(arr[idx], obj);
    else arr.push(obj);
    if (isNew){
      GN.notify.send({
        type:'add', section:'banking', target:'bank', target_id: obj.id,
        title: GN.t('notifAdd') + ' · ' + GN.t('navBanking'),
        body: GN.t('addBank') + ': ' + v.name
      });
    }
    done(true);
  });
};

GN.delBank = function(idx){
  var arr = GN.dh.list('banks');
  if (!arr[idx]) return;
  var item = arr[idx];
  GN.dh.askDelete().then(function(ok){
    if (!ok) return;
    if (item && item.id) GN.notify.markDeleted('banking', 'bank', item.id);
    arr.splice(idx, 1);
    GN.dh.save();
  });
};

/* ============================================================
   Transfer Form
   ============================================================ */
GN.openTransferForm = function(idx, type, bankIdx){
  if (!GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  var arr = GN.dh.list('transfers');
  var banks = GN.dh.list('banks');
  var item = idx >= 0 ? arr[idx] : { type: type || 'in', bank_id: banks[bankIdx] ? banks[bankIdx].id : '' };
  var bankOptions = banks.map(function(b){ return { value: b.id, label: b.name + ' (' + (b.currency || 'SDG') + ')' }; });

  GN.openForm(type === 'out' ? 'addOutgoing' : 'addIncoming', [
    { id:'date',       label: GN.t('date'), type:'date', value:item.date || GN.today() },
    { id:'bank_id',    label: GN.t('bankName'), type:'select', options:bankOptions, value:item.bank_id || '' },
    { id:'amount',     label: GN.t('amount'), type:'number', req:true, value:item.amount || 0 },
    { id:'currency',   label: GN.t('currency'), value:item.currency || 'SDG' },
    { id:'party',      label: GN.t('party'), value:item.party || '' },
    { id:'invoice',    label: GN.t('invoiceNumber'), dir:'ltr', value:item.invoice || '' },
    { id:'attachment', label: GN.t('attachment') + ' (URL)', dir:'ltr', full:true, placeholder:'https://...', value:item.attachment || '' },
    { id:'notes',      label: GN.t('notes'), type:'textarea', full:true, value:item.notes || '' }
  ]);

  var submitBtn = document.getElementById('formModalSubmit');
  if (submitBtn){
    submitBtn.onclick = function(){
      var v = GN.readForm(['date','bank_id','amount','currency','party','invoice','attachment','notes']);
      if (!v.amount || Number(v.amount) <= 0){ GN.toast(GN.t('fieldRequired'), 'bad'); return; }

      var bank = banks.filter(function(b){ return b.id === v.bank_id; })[0];
      var bankName = bank ? bank.name : '';

      var isNew = idx < 0;
      var obj = {
        id: isNew ? GN.uid() : arr[idx].id,
        type: item.type || type || 'in',
        date: v.date,
        bank_id: v.bank_id,
        bank_name: bankName,
        amount: Number(v.amount) || 0,
        currency: v.currency || 'SDG',
        party: v.party,
        invoice: v.invoice,
        attachment: v.attachment,
        notes: v.notes,
        source: 'manual',
        created_at: isNew ? GN.now() : arr[idx].created_at
      };

      if (bank){
        if (isNew){
          bank.balance = Number(bank.balance || 0) + (obj.type === 'in' ? obj.amount : -obj.amount);
        } else {
          var oldAmt = Number(arr[idx].amount || 0);
          var oldType = arr[idx].type || 'in';
          var oldBankId = arr[idx].bank_id;
          var oldBank = banks.filter(function(b){ return b.id === oldBankId; })[0];
          if (oldBank){
            oldBank.balance = Number(oldBank.balance || 0) - (oldType === 'in' ? oldAmt : -oldAmt);
          }
          bank.balance = Number(bank.balance || 0) + (obj.type === 'in' ? obj.amount : -obj.amount);
        }
      }

      if (isNew) arr.push(obj);
      else Object.assign(arr[idx], obj);

      if (isNew){
        GN.notify.send({
          type: obj.type === 'in' ? 'add' : 'delete',
          section:'banking', target:'transfer', target_id: obj.id,
          title: (obj.type === 'in' ? GN.t('notifTransferIn') : GN.t('notifTransferOut')),
          body: (obj.type === 'in' ? '+' : '-') + GN.formatNum(obj.amount) + ' ' + obj.currency + ' - ' + obj.party
        });
      }

      submitBtn.disabled = true;
      GN.savePublicData(GN.dash.data).then(function(saved){
        submitBtn.disabled = false;
        if (saved){
          GN.toast(isNew ? 'تم تسجيل الحوالة' : GN.t('savedSuccess'), 'ok');
        } else {
          GN.toast(GN.t('saveFailed'), 'bad');
        }
        GN.closeModal('formModal');
        GN.renderSection('banking');
      });
    };
  }
};

GN.delTransfer = function(idx){
  var arr = GN.dh.list('transfers');
  if (!arr[idx]) return;
  var item = arr[idx];
  var banks = GN.dh.list('banks');
  GN.dh.askDelete().then(function(ok){
    if (!ok) return;

    if (item && item.bank_id){
      var bank = banks.filter(function(b){ return b.id === item.bank_id; })[0];
      if (bank){
        var amt = Number(item.amount || 0);
        bank.balance = Number(bank.balance || 0) - (item.type === 'in' ? amt : -amt);
      }
    }

    if (item && item.id) GN.notify.markDeleted('banking', 'transfer', item.id);
    arr.splice(idx, 1);

    GN.savePublicData(GN.dash.data).then(function(saved){
      if (saved) GN.toast(GN.t('deletedSuccess'), 'ok');
      GN.renderSection('banking');
    });
  });
};

GN.exportTransfersExcel = function(){
  var arr = GN.dh.list('transfers');
  var rows = [['Date','Bank','Type','Party','Amount','Currency','Invoice','Source','Notes']];
  arr.forEach(function(t){
    rows.push([t.date, t.bank_name || '', t.type, t.party, t.amount, t.currency, t.invoice, t.source || 'manual', t.notes]);
  });
  GN.downloadCSV('transfers-' + GN.today() + '.csv', rows);
  GN.toast(GN.t('success'), 'ok');
};

console.log('[Gold Nile] dashboard/03-banking.js loaded');
})();