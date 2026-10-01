/* ============================================================
   Gold Nile — Dashboard / Gold Trading
   Purchases · Sales · Agents · Agent Payable auto-creation
   ============================================================ */
(function(){
'use strict';

var GN = window.GN = window.GN || {};

var ICO_EDIT = GN.ICO_EDIT;
var ICO_DEL  = GN.ICO_DEL;

/* ============================================================
   Gold Section
   ============================================================ */
GN.sections.gold = function(){
  var d = GN.dash.data || {};
  var purchases = (d.dashboard && d.dashboard.gold_purchases) || [];
  var sales     = (d.dashboard && d.dashboard.gold_sales) || [];
  var agents    = (d.dashboard && d.dashboard.gold_agents) || [];

  var totalBought = 0, totalSold = 0, totalProfit = 0, totalCost = 0;
  purchases.forEach(function(p){ totalBought += Number(p.weight || 0); totalCost += Number(p.total || 0); });
  sales.forEach(function(s){ totalSold += Number(s.weight || 0); totalProfit += Number(s.net_profit || 0); });
  var remaining = totalBought - totalSold;

  var html = '<div class="kpi-grid">' +
    '<div class="kpi hl"><div class="top"><span class="ic">' + GN.navIcon('gold') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('inventory')) + '</div>' +
      '<div class="val"><bdi>' + GN.formatNum(remaining, 2) + '</bdi><span class="cur">g</span></div>' +
      '<div class="sub">' + GN.esc(GN.t('total')) + ': ' + GN.formatNum(totalBought, 2) + 'g</div></div>' +
    '<div class="kpi"><div class="top"><span class="ic g">' + GN.navIcon('gold') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('purchases')) + '</div>' +
      '<div class="val"><bdi>' + GN.formatNum(purchases.length) + '</bdi></div>' +
      '<div class="sub">' + GN.esc(GN.t('total')) + ': ' + GN.formatNum(totalCost) + '</div></div>' +
    '<div class="kpi"><div class="top"><span class="ic y">' + GN.navIcon('dollar') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('sales')) + '</div>' +
      '<div class="val"><bdi>' + GN.formatNum(sales.length) + '</bdi></div></div>' +
    '<div class="kpi"><div class="top"><span class="ic ok">' + GN.navIcon('dollar') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('netProfit')) + '</div>' +
      '<div class="val" style="color:' + (totalProfit >= 0 ? 'var(--ok)' : 'var(--bad)') + '">' +
        '<bdi>' + (totalProfit >= 0 ? '+' : '') + GN.formatNum(totalProfit) + '</bdi></div></div>' +
  '</div>';

  html += '<div style="text-align:end;margin-bottom:14px;display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap">' +
    '<button class="btn btn-sec btn-sm" data-act="export-gold">' + GN.esc(GN.t('exportExcel')) + '</button>' +
    '<button class="btn btn-gold btn-sm" data-act="add-purchase">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg> ' +
      GN.esc(GN.t('addPurchase')) + '</button>' +
    '<button class="btn btn-pri btn-sm" data-act="add-sale">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg> ' +
      GN.esc(GN.t('addSale')) + '</button>' +
  '</div>';

  /* Purchases */
  html += '<div class="card"><div class="card-head"><h3>' + GN.navIcon('gold') + ' ' + GN.esc(GN.t('purchases')) + '</h3></div>';
  if (!purchases.length){
    html += '<div class="empty"><div class="ic">' + GN.navIcon('gold') + '</div><h4>' + GN.esc(GN.t('noData')) + '</h4></div>';
  } else {
    html += '<div class="table-wrap"><table><thead><tr>' +
      '<th>' + GN.esc(GN.t('purchaseCode')) + '</th>' +
      '<th>' + GN.esc(GN.t('date')) + '</th>' +
      '<th>' + GN.esc(GN.t('weight')) + '</th>' +
      '<th>' + GN.esc(GN.t('karat')) + '</th>' +
      '<th>' + GN.esc(GN.t('pricePerGram')) + '</th>' +
      '<th>' + GN.esc(GN.t('totalPrice')) + '</th>' +
      '<th>' + GN.esc(GN.t('agentId')) + '</th><th></th></tr></thead><tbody>';
    purchases.forEach(function(p, i){
      html += '<tr data-notif-id="' + GN.escAttr(p.id || '') + '">' +
        '<td><bdi dir="ltr">' + GN.esc(p.code || '-') + '</bdi></td>' +
        '<td>' + GN.esc(GN.formatDate(p.date)) + '</td>' +
        '<td class="num">' + GN.formatNum(p.weight, 2) + 'g</td>' +
        '<td>' + GN.esc(p.karat || '-') + '</td>' +
        '<td class="num">' + GN.formatMoneyPlain(p.price_per_gram, p.currency || 'SDG') + '</td>' +
        '<td class="num">' + GN.formatMoneyPlain(p.total, p.currency || 'SDG') + '</td>' +
        '<td>' + GN.esc(p.agent_id || '-') + '</td>' +
        '<td class="actions">' + GN.dh.sectionActions([
          { act:'edit-purchase', idx:i, icon:ICO_EDIT, title:GN.t('edit') },
          { act:'del-purchase',  idx:i, icon:ICO_DEL,  title:GN.t('delete'), danger:true }
        ]) + '</td></tr>';
    });
    html += '</tbody></table></div>';
  }
  html += '</div>';

  /* Sales */
  html += '<div class="card"><div class="card-head"><h3>' + GN.navIcon('dollar') + ' ' + GN.esc(GN.t('sales')) + '</h3></div>';
  if (!sales.length){
    html += '<div class="empty"><div class="ic">' + GN.navIcon('dollar') + '</div><h4>' + GN.esc(GN.t('noData')) + '</h4></div>';
  } else {
    html += '<div class="table-wrap"><table><thead><tr>' +
      '<th>' + GN.esc(GN.t('saleCode')) + '</th>' +
      '<th>' + GN.esc(GN.t('date')) + '</th>' +
      '<th>' + GN.esc(GN.t('linkedPurchase')) + '</th>' +
      '<th>' + GN.esc(GN.t('weight')) + '</th>' +
      '<th>' + GN.esc(GN.t('pricePerGram')) + '</th>' +
      '<th>' + GN.esc(GN.t('totalPrice')) + '</th>' +
      '<th>' + GN.esc(GN.t('netProfit')) + '</th><th></th></tr></thead><tbody>';
    sales.forEach(function(s, i){
      var profit = Number(s.net_profit || 0);
      html += '<tr data-notif-id="' + GN.escAttr(s.id || '') + '">' +
        '<td><bdi dir="ltr">' + GN.esc(s.code || '-') + '</bdi></td>' +
        '<td>' + GN.esc(GN.formatDate(s.date)) + '</td>' +
        '<td><bdi dir="ltr">' + GN.esc(s.purchase_code || '-') + '</bdi></td>' +
        '<td class="num">' + GN.formatNum(s.weight, 2) + 'g</td>' +
        '<td class="num">' + GN.formatMoneyPlain(s.price_per_gram, s.currency || 'USD') + '</td>' +
        '<td class="num">' + GN.formatMoneyPlain(s.total, s.currency || 'USD') + '</td>' +
        '<td class="num" style="color:' + (profit >= 0 ? 'var(--ok)' : 'var(--bad)') + ';font-weight:700">' +
          (profit >= 0 ? '+' : '') + GN.formatMoneyPlain(profit, s.currency || 'USD') + '</td>' +
        '<td class="actions">' + GN.dh.sectionActions([
          { act:'edit-sale', idx:i, icon:ICO_EDIT, title:GN.t('edit') },
          { act:'del-sale',  idx:i, icon:ICO_DEL,  title:GN.t('delete'), danger:true }
        ]) + '</td></tr>';
    });
    html += '</tbody></table></div>';
  }
  html += '</div>';

  /* Agents */
  html += '<div class="card"><div class="card-head">' +
    '<h3>' + GN.navIcon('team') + ' ' + GN.esc(GN.t('agentType')) + '</h3>' +
    '<button class="btn btn-pri btn-sm" data-act="add-agent">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg> ' +
      GN.esc(GN.t('add')) + '</button></div>';
  if (!agents.length){
    html += '<div class="empty"><div class="ic">' + GN.navIcon('team') + '</div><h4>' + GN.esc(GN.t('noData')) + '</h4></div>';
  } else {
    html += '<div class="table-wrap"><table><thead><tr>' +
      '<th>' + GN.esc(GN.t('agentId')) + '</th>' +
      '<th>' + GN.esc(GN.t('name')) + '</th>' +
      '<th>' + GN.esc(GN.t('agentType')) + '</th>' +
      '<th>' + GN.esc(GN.t('agentCommission')) + '</th><th></th></tr></thead><tbody>';
    agents.forEach(function(a, i){
      html += '<tr data-notif-id="' + GN.escAttr(a.id || '') + '">' +
        '<td><bdi dir="ltr">' + GN.esc(a.code || '-') + '</bdi></td>' +
        '<td>' + GN.esc(a.name || '-') + '</td>' +
        '<td>' + (a.type === 'buy' ? GN.esc(GN.t('buyAgent')) : GN.esc(GN.t('sellAgent'))) + '</td>' +
        '<td class="num">' + GN.formatNum(a.commission, 2) + '%</td>' +
        '<td class="actions">' + GN.dh.sectionActions([
          { act:'edit-agent', idx:i, icon:ICO_EDIT, title:GN.t('edit') },
          { act:'del-agent',  idx:i, icon:ICO_DEL,  title:GN.t('delete'), danger:true }
        ]) + '</td></tr>';
    });
    html += '</tbody></table></div>';
  }
  html += '</div>';

  return html;
};

GN.bindSection.gold = function(){
  GN.bindAction('add-purchase',  function(){ GN.openPurchaseForm(-1); });
  GN.bindAction('edit-purchase', function(btn){ GN.openPurchaseForm(+btn.getAttribute('data-idx')); });
  GN.bindAction('del-purchase',  function(btn){ GN.delPurchase(+btn.getAttribute('data-idx')); });
  GN.bindAction('add-sale',      function(){ GN.openSaleForm(-1); });
  GN.bindAction('edit-sale',     function(btn){ GN.openSaleForm(+btn.getAttribute('data-idx')); });
  GN.bindAction('del-sale',      function(btn){ GN.delSale(+btn.getAttribute('data-idx')); });
  GN.bindAction('add-agent',     function(){ GN.openAgentForm(-1); });
  GN.bindAction('edit-agent',    function(btn){ GN.openAgentForm(+btn.getAttribute('data-idx')); });
  GN.bindAction('del-agent',     function(btn){ GN.delAgent(+btn.getAttribute('data-idx')); });
  GN.bindAction('export-gold',   function(){ GN.exportGoldExcel(); });
};

/* ============================================================
   Agent select helper
   ============================================================ */
GN.renderAgentSelect = function(selectedCode){
  var agents = GN.dh.list('gold_agents');
  if (!agents.length){
    return '<div class="field full"><div class="input-wrap" style="background:var(--warn-l);color:var(--warn);padding:12px;font-size:12.5px">' +
      GN.esc(GN.t('noAgentsYet')) + '</div></div>';
  }
  var opts = '<option value="">— ' + GN.esc(GN.t('selectAgent')) + ' —</option>';
  agents.forEach(function(a){
    var sel = (a.code === selectedCode) ? ' selected' : '';
    opts += '<option value="' + GN.escAttr(a.code) + '"' +
      ' data-commission="' + (a.commission || 0) + '"' +
      ' data-bank="' + GN.escAttr(a.bank_name || '') + '"' +
      ' data-account="' + GN.escAttr(a.account_number || '') + '"' +
      ' data-phone="' + GN.escAttr(a.phone || '') + '"' +
      ' data-method="' + (a.payment_method || 'cash') + '"' +
      ' data-name="' + GN.escAttr(a.name || '') + '"' +
      sel + '>' + GN.esc(a.code + ' — ' + a.name) + '</option>';
  });
  return '<div class="field"><label>' + GN.esc(GN.t('selectAgent')) + ' <span class="req">*</span></label>' +
    '<div class="input-wrap"><select id="agent_select">' + opts + '</select></div></div>' +
    '<div class="field"><label>' + GN.esc(GN.t('agentCommission')) + ' %</label>' +
    '<div class="input-wrap"><input type="number" id="commission" step="0.01" min="0" value=""></div></div>' +
    '<div class="field full" id="agent_info_wrap" style="display:none">' +
      '<div class="agent-info-box">' +
        '<div class="agent-info-title">' + GN.esc(GN.t('agentInfoTitle')) + '</div>' +
        '<div class="agent-info-row"><span>' + GN.esc(GN.t('agentBank')) + ':</span> <b id="ai_bank">—</b></div>' +
        '<div class="agent-info-row"><span>' + GN.esc(GN.t('agentAccount')) + ':</span> <b id="ai_account" dir="ltr">—</b></div>' +
        '<div class="agent-info-row"><span>' + GN.esc(GN.t('agentPhone')) + ':</span> <b id="ai_phone" dir="ltr">—</b></div>' +
        '<div class="agent-info-row"><span>' + GN.esc(GN.t('agentMethod')) + ':</span> <b id="ai_method">—</b></div>' +
      '</div>' +
    '</div>';
};

/* ============================================================
   Purchase Form
   ============================================================ */
GN.openPurchaseForm = function(idx){
  if (!GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  var arr = GN.dh.list('gold_purchases');
  var item = idx >= 0 ? arr[idx] : {};
  var banks = GN.dh.list('banks');
  var bankOptions = [{ value:'', label: '— ' + GN.t('txSelectBank') + ' —' }].concat(
    banks.map(function(b){
      return { value: b.id, label: b.name + ' — ' + GN.formatNum(b.balance || 0) + ' ' + (b.currency || 'SDG') };
    })
  );
  var hasAgent = !!(item.agent_id);

  GN.openForm('addPurchase', [
    { id:'date',           label: GN.t('date'),           type:'date',   value:item.date || GN.today() },
    { id:'weight',         label: GN.t('weight'),         type:'number', req:true, value:item.weight || 0 },
    { id:'karat',          label: GN.t('karat'),          value:item.karat || '21' },
    { id:'price_per_gram', label: GN.t('pricePerGram') + ' (SDG)', type:'number', req:true, value:item.price_per_gram || 0 },
    { id:'pay_method',     label: GN.t('txPaymentSource'), type:'select',
      options:[{ value:'cash', label: GN.t('txPayCash') }, { value:'bank', label: GN.t('txPayBank') }],
      value:item.pay_method || 'cash' },
    { id:'bank_id',        label: GN.t('txSelectBank'), type:'select', options:bankOptions, value:item.bank_id || '' },
    { id:'place',          label: GN.t('purchasePlace'), full:true, value:item.place || '' }
  ]);

  var body = document.getElementById('formModalBody');
  var formGrid = body.querySelector('.form-grid');
  if (!formGrid) return;

  var agentSectionHTML =
    '<div class="field full" style="margin-top:6px"><label class="chk-label" style="cursor:pointer;display:flex;align-items:center;gap:8px">' +
      '<input type="checkbox" id="has_agent" style="width:auto"' + (hasAgent ? ' checked' : '') + '>' +
      '<span>' + GN.esc(GN.t('hasAgent')) + '</span>' +
    '</label></div>' +
    '<div id="agent_block" style="display:' + (hasAgent ? 'contents' : 'none') + '">' +
      GN.renderAgentSelect(item.agent_id || '') +
    '</div>' +
    '<div class="field full"><label>' + GN.esc(GN.t('attachment')) + ' (URL)</label>' +
      '<div class="input-wrap"><input type="url" id="attachment" dir="ltr" placeholder="https://..." value="' + GN.escAttr(item.attachment || '') + '"></div></div>' +
    '<div class="field full"><label>' + GN.esc(GN.t('notes')) + '</label>' +
      '<div class="input-wrap"><textarea id="notes" rows="3">' + GN.esc(item.notes || '') + '</textarea></div></div>';

  var extra = document.createElement('div');
  extra.className = 'form-grid';
  extra.style.marginTop = '14px';
  extra.innerHTML = agentSectionHTML;
  formGrid.parentElement.appendChild(extra);

  var methodEl = document.getElementById('pay_method');
  var bankField = document.getElementById('bank_id');
  if (methodEl && bankField){
    var bankWrap = bankField.parentElement.parentElement;
    bankWrap.style.display = (methodEl.value === 'bank') ? '' : 'none';
    methodEl.addEventListener('change', function(){
      bankWrap.style.display = (methodEl.value === 'bank') ? '' : 'none';
    });
  }

  var chk = document.getElementById('has_agent');
  var agentBlock = document.getElementById('agent_block');
  var agentSel = document.getElementById('agent_select');
  var commEl = document.getElementById('commission');
  var infoWrap = document.getElementById('agent_info_wrap');
  var aiBank = document.getElementById('ai_bank');
  var aiAcc = document.getElementById('ai_account');
  var aiPhone = document.getElementById('ai_phone');
  var aiMethod = document.getElementById('ai_method');

  function updateAgentInfo(){
    if (!agentSel || !agentSel.value){
      if (infoWrap) infoWrap.style.display = 'none';
      return;
    }
    var opt = agentSel.options[agentSel.selectedIndex];
    var comm = opt.getAttribute('data-commission') || '0';
    var bank = opt.getAttribute('data-bank') || '—';
    var acc = opt.getAttribute('data-account') || '—';
    var phone = opt.getAttribute('data-phone') || '—';
    var method = opt.getAttribute('data-method') || 'cash';

    if (commEl) commEl.value = comm;
    if (aiBank) aiBank.textContent = bank;
    if (aiAcc) aiAcc.textContent = acc;
    if (aiPhone) aiPhone.textContent = phone;
    if (aiMethod) aiMethod.textContent = (method === 'bank') ? GN.t('payMethodBank') : GN.t('payMethodCash');
    if (infoWrap) infoWrap.style.display = 'block';
  }

  if (chk && agentBlock){
    chk.addEventListener('change', function(){
      agentBlock.style.display = chk.checked ? 'contents' : 'none';
      if (!chk.checked){
        if (agentSel) agentSel.value = '';
        if (commEl) commEl.value = '';
        if (infoWrap) infoWrap.style.display = 'none';
      }
    });
  }
  if (agentSel){
    agentSel.addEventListener('change', updateAgentInfo);
    updateAgentInfo();
  }

  var submitBtn = document.getElementById('formModalSubmit');
  submitBtn.onclick = function(){
    var v = GN.readForm(['date','weight','karat','price_per_gram','pay_method','bank_id','place','attachment','notes']);
    var w = Number(v.weight), ppg = Number(v.price_per_gram);
    if (!w || !ppg){ GN.toast(GN.t('fieldRequired'), 'bad'); return; }
    if (v.pay_method === 'bank' && !v.bank_id){ GN.toast(GN.t('fieldRequired'), 'bad'); return; }

    var agentCode = chk && chk.checked && agentSel ? agentSel.value : '';
    var commPct = agentCode && commEl ? (Number(commEl.value) || 0) : 0;
    if (chk && chk.checked && !agentCode){ GN.toast(GN.t('fieldRequired'), 'bad'); return; }

    var total = w * ppg;
    var comm = total * commPct / 100;
    var prevTotal = idx >= 0 ? Number(arr[idx].total || 0) : 0;
    var prevBankId = idx >= 0 ? arr[idx].bank_id : '';
    var prevMethod = idx >= 0 ? arr[idx].pay_method : '';

    var isNew = idx < 0;
    var obj = {
      id: isNew ? GN.uid() : arr[idx].id,
      date: v.date,
      weight: w,
      karat: v.karat,
      price_per_gram: ppg,
      total: total,
      pay_method: v.pay_method,
      bank_id: v.bank_id || '',
      place: v.place,
      agent_id: agentCode,
      commission: commPct,
      commission_amount: comm,
      currency: 'SDG',
      attachment: v.attachment,
      notes: v.notes
    };
    if (idx >= 0) Object.assign(arr[idx], obj);
    else { obj.code = GN.genCode('GOLD-B', arr); arr.push(obj); }

    function reverseOld(cb){
      if (idx >= 0 && prevMethod === 'bank' && prevBankId){
        GN.applyBankChange(prevBankId, prevTotal, cb);
      } else cb(true);
    }
    function applyNew(cb){
      if (obj.pay_method === 'bank' && obj.bank_id){
        GN.applyBankChange(obj.bank_id, -total, cb);
      } else cb(true);
    }

    reverseOld(function(){
      applyNew(function(){
        if (isNew){
          GN.notify.send({
            type:'add', section:'gold', target:'purchase', target_id: obj.id,
            title: GN.t('notifAdd') + ' · ' + GN.t('purchases'),
            body: GN.t('addPurchase') + ': ' + GN.formatNum(w, 2) + 'g'
          });
        }
        if (isNew && obj.agent_id && comm > 0){
          GN.createAgentPayable(obj, 'gold_purchase').then(function(){
            GN.toast(GN.t('payCreatedAuto'), 'ok');
            GN.closeModal('formModal');
            GN.dh.save();
          });
        } else {
          GN.closeModal('formModal');
          GN.dh.save();
        }
      });
    });
  };
};

GN.delPurchase = function(idx){
  var arr = GN.dh.list('gold_purchases');
  if (!arr[idx]) return;
  var item = arr[idx];
  GN.dh.askDelete().then(function(ok){
    if (!ok) return;
    var prevTotal = Number(item.total || 0);
    var prevBankId = item.bank_id;
    var prevMethod = item.pay_method;
    if (item && item.id) GN.notify.markDeleted('gold', 'purchase', item.id);
    arr.splice(idx, 1);
    if (prevMethod === 'bank' && prevBankId){
      GN.applyBankChange(prevBankId, prevTotal, function(){
        GN.dh.save();
        setTimeout(function(){ GN.loadTransactions && GN.loadTransactions(); }, 200);
      });
    } else {
      GN.dh.save();
      setTimeout(function(){ GN.loadTransactions && GN.loadTransactions(); }, 200);
    }
  });
};

/* ============================================================
   Sale Form
   ============================================================ */
GN.openSaleForm = function(idx){
  if (!GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  var arr = GN.dh.list('gold_sales');
  var purchases = GN.dh.list('gold_purchases');
  var item = idx >= 0 ? arr[idx] : {};
  var banks = GN.dh.list('banks');
  var bankOptions = [{ value:'', label: '— ' + GN.t('txSelectBank') + ' —' }].concat(
    banks.map(function(b){
      return { value: b.id, label: b.name + ' — ' + GN.formatNum(b.balance || 0) + ' ' + (b.currency || 'SDG') };
    })
  );
  var purchOptions = purchases.map(function(p){
    return { value: p.id, label: (p.code || '') + ' - ' + GN.formatNum(p.weight, 2) + 'g ' + (p.karat || '') };
  });
  var hasAgent = !!(item.agent_id);

  GN.openForm('addSale', [
    { id:'purchase_id',    label: GN.t('linkedPurchase'), type:'select', options:purchOptions, value:item.purchase_id || '' },
    { id:'date',           label: GN.t('date'), type:'date', value:item.date || GN.today() },
    { id:'weight',         label: GN.t('weight'), type:'number', req:true, value:item.weight || 0 },
    { id:'price_per_gram', label: GN.t('pricePerGram'), type:'number', req:true, value:item.price_per_gram || 0 },
    { id:'currency',       label: GN.t('currency'), type:'select',
      options:[{ value:'SDG', label:'SDG' }, { value:'USD', label:'USD' }],
      value:item.currency || 'USD' },
    { id:'receive_method', label: GN.t('txPaymentSource'), type:'select',
      options:[{ value:'cash', label: GN.t('txPayCash') }, { value:'bank', label: GN.t('txPayBank') }],
      value:item.receive_method || 'cash' },
    { id:'bank_id',        label: GN.t('txSelectBank'), type:'select', options:bankOptions, value:item.bank_id || '' },
    { id:'buyer',          label: GN.t('buyer'), value:item.buyer || '' }
  ]);

  var body = document.getElementById('formModalBody');
  var formGrid = body.querySelector('.form-grid');
  if (!formGrid) return;

  var agentSectionHTML =
    '<div class="field full" style="margin-top:6px"><label class="chk-label" style="cursor:pointer;display:flex;align-items:center;gap:8px">' +
      '<input type="checkbox" id="has_agent" style="width:auto"' + (hasAgent ? ' checked' : '') + '>' +
      '<span>' + GN.esc(GN.t('hasAgent')) + '</span>' +
    '</label></div>' +
    '<div id="agent_block" style="display:' + (hasAgent ? 'contents' : 'none') + '">' +
      GN.renderAgentSelect(item.agent_id || '') +
    '</div>' +
    '<div class="field full"><label>' + GN.esc(GN.t('attachment')) + ' (URL)</label>' +
      '<div class="input-wrap"><input type="url" id="attachment" dir="ltr" placeholder="https://..." value="' + GN.escAttr(item.attachment || '') + '"></div></div>';

  var extra = document.createElement('div');
  extra.className = 'form-grid';
  extra.style.marginTop = '14px';
  extra.innerHTML = agentSectionHTML;
  formGrid.parentElement.appendChild(extra);

  var methodEl = document.getElementById('receive_method');
  var bankField = document.getElementById('bank_id');
  if (methodEl && bankField){
    var bankWrap = bankField.parentElement.parentElement;
    bankWrap.style.display = (methodEl.value === 'bank') ? '' : 'none';
    methodEl.addEventListener('change', function(){
      bankWrap.style.display = (methodEl.value === 'bank') ? '' : 'none';
    });
  }

  var chk = document.getElementById('has_agent');
  var agentBlock = document.getElementById('agent_block');
  var agentSel = document.getElementById('agent_select');
  var commEl = document.getElementById('commission');
  var infoWrap = document.getElementById('agent_info_wrap');
  var aiBank = document.getElementById('ai_bank');
  var aiAcc = document.getElementById('ai_account');
  var aiPhone = document.getElementById('ai_phone');
  var aiMethod = document.getElementById('ai_method');

  function updateAgentInfo(){
    if (!agentSel || !agentSel.value){
      if (infoWrap) infoWrap.style.display = 'none';
      return;
    }
    var opt = agentSel.options[agentSel.selectedIndex];
    if (commEl) commEl.value = opt.getAttribute('data-commission') || '0';
    if (aiBank) aiBank.textContent = opt.getAttribute('data-bank') || '—';
    if (aiAcc) aiAcc.textContent = opt.getAttribute('data-account') || '—';
    if (aiPhone) aiPhone.textContent = opt.getAttribute('data-phone') || '—';
    if (aiMethod) aiMethod.textContent = (opt.getAttribute('data-method') === 'bank') ? GN.t('payMethodBank') : GN.t('payMethodCash');
    if (infoWrap) infoWrap.style.display = 'block';
  }

  if (chk && agentBlock){
    chk.addEventListener('change', function(){
      agentBlock.style.display = chk.checked ? 'contents' : 'none';
      if (!chk.checked){
        if (agentSel) agentSel.value = '';
        if (commEl) commEl.value = '';
        if (infoWrap) infoWrap.style.display = 'none';
      }
    });
  }
  if (agentSel){
    agentSel.addEventListener('change', updateAgentInfo);
    updateAgentInfo();
  }

  var submitBtn = document.getElementById('formModalSubmit');
  submitBtn.onclick = function(){
    var v = GN.readForm(['purchase_id','date','weight','price_per_gram','currency','receive_method','bank_id','buyer','attachment']);
    var w = Number(v.weight), ppg = Number(v.price_per_gram);
    if (!w || !ppg){ GN.toast(GN.t('fieldRequired'), 'bad'); return; }
    if (v.receive_method === 'bank' && !v.bank_id){ GN.toast(GN.t('fieldRequired'), 'bad'); return; }

    var agentCode = chk && chk.checked && agentSel ? agentSel.value : '';
    var commPct = agentCode && commEl ? (Number(commEl.value) || 0) : 0;
    if (chk && chk.checked && !agentCode){ GN.toast(GN.t('fieldRequired'), 'bad'); return; }

    var total = w * ppg;
    var comm = total * commPct / 100;
    var purchase = purchases.filter(function(p){ return p.id === v.purchase_id; })[0];
    var cost = purchase ? (Number(purchase.price_per_gram || 0) * w) : 0;
    var netProfit = total - cost - comm;

    var prevTotal = idx >= 0 ? Number(arr[idx].total || 0) : 0;
    var prevBankId = idx >= 0 ? arr[idx].bank_id : '';
    var prevMethod = idx >= 0 ? arr[idx].receive_method : '';

    var isNew = idx < 0;
    var obj = {
      id: isNew ? GN.uid() : arr[idx].id,
      purchase_id: v.purchase_id,
      purchase_code: purchase ? purchase.code : '',
      date: v.date,
      weight: w,
      price_per_gram: ppg,
      total: total,
      currency: v.currency,
      buyer: v.buyer,
      receive_method: v.receive_method,
      bank_id: v.bank_id || '',
      agent_id: agentCode,
      commission: commPct,
      commission_amount: comm,
      cost: cost,
      net_profit: netProfit,
      attachment: v.attachment
    };
    if (idx >= 0) Object.assign(arr[idx], obj);
    else { obj.code = GN.genCode('GOLD-S', arr); arr.push(obj); }

    function reverseOld(cb){
      if (idx >= 0 && prevMethod === 'bank' && prevBankId){
        GN.applyBankChange(prevBankId, -prevTotal, cb);
      } else cb(true);
    }
    function applyNew(cb){
      if (obj.receive_method === 'bank' && obj.bank_id){
        GN.applyBankChange(obj.bank_id, total, cb);
      } else cb(true);
    }

    reverseOld(function(){
      applyNew(function(){
        if (isNew){
          GN.notify.send({
            type:'add', section:'gold', target:'sale', target_id: obj.id,
            title: GN.t('notifAdd') + ' · ' + GN.t('sales'),
            body: GN.t('addSale') + ': ' + GN.formatNum(w, 2) + 'g'
          });
        }
        if (isNew && obj.agent_id && comm > 0){
          GN.createAgentPayable(obj, 'gold_sale').then(function(){
            GN.toast(GN.t('payCreatedAuto'), 'ok');
            GN.closeModal('formModal');
            GN.dh.save();
          });
        } else {
          GN.closeModal('formModal');
          GN.dh.save();
        }
      });
    });
  };
};

GN.delSale = function(idx){
  var arr = GN.dh.list('gold_sales');
  if (!arr[idx]) return;
  var item = arr[idx];
  GN.dh.askDelete().then(function(ok){
    if (!ok) return;
    var prevTotal = Number(item.total || 0);
    var prevBankId = item.bank_id;
    var prevMethod = item.receive_method;
    if (item && item.id) GN.notify.markDeleted('gold', 'sale', item.id);
    arr.splice(idx, 1);
    if (prevMethod === 'bank' && prevBankId){
      GN.applyBankChange(prevBankId, -prevTotal, function(){
        GN.dh.save();
        setTimeout(function(){ GN.loadTransactions && GN.loadTransactions(); }, 200);
      });
    } else {
      GN.dh.save();
      setTimeout(function(){ GN.loadTransactions && GN.loadTransactions(); }, 200);
    }
  });
};

/* ============================================================
   Agent Form
   ============================================================ */
GN.openAgentForm = function(idx){
  if (!GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  var arr = GN.dh.list('gold_agents');
  var item = idx >= 0 ? arr[idx] : {};

  GN.openForm('add', [
    { id:'code',           label: GN.t('agentId') + ' (كود فريد)', dir:'ltr', req:true, value:item.code || '' },
    { id:'name',           label: GN.t('name') + ' (الاسم الكامل)', req:true, value:item.name || '' },
    { id:'type',           label: GN.t('agentType'), type:'select',
      options:[{ value:'buy', label: GN.t('buyAgent') }, { value:'sell', label: GN.t('sellAgent') }],
      value:item.type || 'buy' },
    { id:'commission',     label: GN.t('agentCommission') + ' %', type:'number', value:item.commission || 0 },
    { id:'phone',          label: GN.t('payPhone'), dir:'ltr', value:item.phone || '' },
    { id:'payment_method', label: GN.t('payMethod') + ' (طريقة استلام العمولة)', type:'select',
      options:[{ value:'cash', label: GN.t('payMethodCash') }, { value:'bank', label: GN.t('payMethodBank') }],
      value:item.payment_method || 'cash' },
    { id:'bank_name',      label: GN.t('payBankName'), full:true, value:item.bank_name || '' },
    { id:'account_number', label: GN.t('payAccountNumber'), dir:'ltr', full:true, value:item.account_number || '' }
  ]);

  GN.onSubmit(function(done){
    var v = GN.readForm(['code','name','type','commission','phone','payment_method','bank_name','account_number']);
    if (!v.code || !v.name){ GN.toast(GN.t('fieldRequired'), 'bad'); done(false); return; }
    if (v.payment_method === 'bank' && (!v.bank_name || !v.account_number)){
      GN.toast('البنك ورقم الحساب مطلوبان لطريقة الحوالة البنكية', 'bad');
      done(false);
      return;
    }
    var isNew = idx < 0;
    var obj = {
      id: isNew ? GN.uid() : arr[idx].id,
      code: v.code,
      name: v.name,
      type: v.type,
      commission: Number(v.commission) || 0,
      phone: v.phone || '',
      payment_method: v.payment_method || 'cash',
      bank_name: v.bank_name || '',
      account_number: v.account_number || ''
    };
    if (idx >= 0) Object.assign(arr[idx], obj);
    else arr.push(obj);
    if (isNew){
      GN.notify.send({
        type:'add', section:'gold', target:'agent', target_id: obj.id,
        title: GN.t('notifAdd') + ' · ' + GN.t('agentType'),
        body: v.name
      });
    }
    done(true);
  });
};

GN.delAgent = function(idx){
  var arr = GN.dh.list('gold_agents');
  if (!arr[idx]) return;
  var item = arr[idx];
  GN.dh.askDelete().then(function(ok){
    if (ok){
      if (item && item.id) GN.notify.markDeleted('gold', 'agent', item.id);
      arr.splice(idx, 1);
      GN.dh.save();
    }
  });
};

/* ============================================================
   Export
   ============================================================ */
GN.exportGoldExcel = function(){
  var rows = [['Type','Code','Date','Weight','Karat','Price/G','Total','Currency','Agent','Profit']];
  GN.dh.list('gold_purchases').forEach(function(p){
    rows.push(['Purchase', p.code, p.date, p.weight, p.karat, p.price_per_gram, p.total, p.currency, p.agent_id, '']);
  });
  GN.dh.list('gold_sales').forEach(function(s){
    rows.push(['Sale', s.code, s.date, s.weight, '', s.price_per_gram, s.total, s.currency, s.agent_id, s.net_profit]);
  });
  GN.downloadCSV('gold-trading-' + GN.today() + '.csv', rows);
  GN.toast(GN.t('success'), 'ok');
};

console.log('[Gold Nile] dashboard/04-gold.js loaded');
})();