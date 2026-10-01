/* ============================================================
   Gold Nile — Dashboard / Banking
   Banks · Transfers · Per-currency KPIs · Bank Details
   ============================================================ */
(function(){
'use strict';

var GN = window.GN = window.GN || {};

var ICO_EDIT = GN.ICO_EDIT;
var ICO_DEL  = GN.ICO_DEL;

/* ============================================================
   Banking Section — Per-currency KPIs
   ============================================================ */
GN.sections.banking = function(){
  var d = GN.dash.data || {};
  var banks = (d.dashboard && d.dashboard.banks) || [];
  var transfers = (d.dashboard && d.dashboard.transfers) || [];

  /* Group by currency */
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

  /* Flags map */
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
        '<div style="display:flex;gap:8px;margin-top:12px">' +
          '<button class="btn btn-pri btn-sm" style="flex:1" data-act="add-in" data-bank-idx="' + i + '">' + GN.esc(GN.t('addIncoming')) + '</button>' +
          '<button class="btn btn-danger btn-sm" style="flex:1" data-act="add-out" data-bank-idx="' + i + '">' + GN.esc(GN.t('addOutgoing')) + '</button>' +
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
    var sortedTr = transfers.slice().sort(function(a, b){ return (b.date || '').localeCompare(a.date || ''); });
    html += '<div class="table-wrap"><table><thead><tr>' +
      '<th>' + GN.esc(GN.t('date')) + '</th>' +
      '<th>' + GN.esc(GN.t('transferType')) + '</th>' +
      '<th>' + GN.esc(GN.t('party')) + '</th>' +
      '<th>' + GN.esc(GN.t('amount')) + '</th>' +
      '<th>' + GN.esc(GN.t('invoiceNumber')) + '</th>' +
      '<th>' + GN.esc(GN.t('attachment')) + '</th><th></th></tr></thead><tbody>';
    sortedTr.forEach(function(t){
      var origIdx = transfers.indexOf(t);
      var typeChip = t.type === 'in'
        ? '<span class="chip ok"><span class="dot"></span>' + GN.esc(GN.t('incoming')) + '</span>'
        : '<span class="chip b"><span class="dot"></span>' + GN.esc(GN.t('outgoing')) + '</span>';
      html += '<tr data-notif-id="' + GN.escAttr(t.id || '') + '"><td>' + GN.esc(GN.formatDate(t.date)) + '</td>' +
        '<td>' + typeChip + '</td>' +
        '<td>' + GN.esc(t.party || '-') + '</td>' +
        '<td class="num" style="color:' + (t.type === 'in' ? 'var(--ok)' : 'var(--bad)') + '">' +
          (t.type === 'in' ? '+' : '-') + ' ' + GN.formatMoneyPlain(t.amount, t.currency || 'SDG') + '</td>' +
        '<td><bdi dir="ltr">' + GN.esc(t.invoice || '-') + '</bdi></td>' +
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

  GN.$$('[data-bank-detail]').forEach(function(el){
    el.addEventListener('click', function(e){
      e.stopPropagation();
      GN.openBankDetails(+el.getAttribute('data-bank-detail'));
    });
  });
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
   Banking Forms
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

GN.openTransferForm = function(idx, type, bankIdx){
  if (!GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  var arr = GN.dh.list('transfers');
  var banks = GN.dh.list('banks');
  var item = idx >= 0 ? arr[idx] : { type: type || 'in', bank_id: banks[bankIdx] ? banks[bankIdx].id : '' };
  var bankOptions = banks.map(function(b){ return { value: b.id, label: b.name }; });

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

  GN.onSubmit(function(done){
    var v = GN.readForm(['date','bank_id','amount','currency','party','invoice','attachment','notes']);
    if (!v.amount || Number(v.amount) <= 0){ GN.toast(GN.t('fieldRequired'), 'bad'); done(false); return; }

    var isNew = idx < 0;
    var obj = {
      id: isNew ? GN.uid() : arr[idx].id,
      type: item.type || type || 'in',
      date: v.date,
      bank_id: v.bank_id,
      amount: Number(v.amount) || 0,
      currency: v.currency || 'SDG',
      party: v.party,
      invoice: v.invoice,
      attachment: v.attachment,
      notes: v.notes
    };
    if (idx >= 0) Object.assign(arr[idx], obj);
    else arr.push(obj);

    var bank = banks.filter(function(b){ return b.id === v.bank_id; })[0];
    if (bank && isNew){
      bank.balance = Number(bank.balance || 0) + (obj.type === 'in' ? obj.amount : -obj.amount);
    }

    if (isNew){
      GN.notify.send({
        type: obj.type === 'in' ? 'add' : 'delete',
        section:'banking', target:'transfer', target_id: obj.id,
        title: (obj.type === 'in' ? GN.t('notifTransferIn') : GN.t('notifTransferOut')),
        body: (obj.type === 'in' ? '+' : '-') + GN.formatNum(obj.amount) + ' ' + obj.currency + ' - ' + obj.party
      });
    }
    done(true);
  });
};

GN.delTransfer = function(idx){
  var arr = GN.dh.list('transfers');
  if (!arr[idx]) return;
  var item = arr[idx];
  GN.dh.askDelete().then(function(ok){
    if (!ok) return;
    if (item && item.id) GN.notify.markDeleted('banking', 'transfer', item.id);
    arr.splice(idx, 1);
    GN.dh.save();
  });
};

GN.exportTransfersExcel = function(){
  var arr = GN.dh.list('transfers');
  var rows = [['Date','Type','Party','Amount','Currency','Invoice','Notes']];
  arr.forEach(function(t){
    rows.push([t.date, t.type, t.party, t.amount, t.currency, t.invoice, t.notes]);
  });
  GN.downloadCSV('transfers-' + GN.today() + '.csv', rows);
  GN.toast(GN.t('success'), 'ok');
};

console.log('[Gold Nile] dashboard/03-banking.js loaded');
})();