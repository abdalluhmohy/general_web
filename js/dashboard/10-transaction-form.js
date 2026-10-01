/* ============================================================
   Gold Nile — Dashboard / Transaction Form
   نموذج إضافة/تعديل معاملة مالية
   ============================================================ */
(function(){
'use strict';

var GN = window.GN = window.GN || {};

GN.openTransactionForm = function(item){
  if (!GN.session.isOwner || !GN.session.isAdmin){
    GN.toast(GN.t('readOnlyNotice'), 'bad');
    return;
  }

  var isEdit = !!item;
  var t = item || {
    type: 'out',
    transaction_date: GN.today(),
    currency: 'SDG',
    transaction_category: 'other',
    service_type: 'other',
    source: 'general',
    payment_method: 'cash',
    bank_id: '',
    amount: 0
  };

  var banks = (GN.dash.data && GN.dash.data.dashboard && GN.dash.data.dashboard.banks) || [];
  var body = document.getElementById('formModalBody');
  var titleEl = document.getElementById('formModalTitle');
  if (!body || !titleEl) return;

  titleEl.textContent = isEdit ? GN.t('txEdit') : GN.t('txAdd');

  function opt(list_, sel){
    return list_.map(function(o){
      return '<option value="' + GN.escAttr(o.value) + '"' + (o.value === sel ? ' selected' : '') + '>' + GN.esc(o.label) + '</option>';
    }).join('');
  }

  var selType = t.type || 'out';
  var selCur  = t.currency || 'SDG';
  var selCat  = t.transaction_category || 'other';
  var selSvc  = t.service_type || 'other';
  var selSrc  = t.source || 'general';
  var selPay  = t.payment_method || 'cash';
  var selBank = t.bank_id || '';

  var bankOptions = '';
  if (!banks.length){
    bankOptions = '<option value="">' + GN.esc(GN.t('txNoBanks')) + '</option>';
  } else {
    bankOptions = '<option value="">' + GN.esc(GN.t('txSelectBank')) + '</option>' +
      banks.map(function(b){
        var bal = Number(b.balance || 0);
        return '<option value="' + GN.escAttr(b.id) + '"' + (b.id === selBank ? ' selected' : '') + '>' +
          GN.esc(b.name) + ' — ' + GN.formatNum(bal) + ' ' + GN.esc(b.currency || 'SDG') + '</option>';
      }).join('');
  }

  body.innerHTML =
    '<div class="form-grid tx-form-wrap' + (selCur === 'USD' ? ' usd' : '') + '" id="txFormWrap">' +
      '<div class="field full"><label>' + GN.esc(GN.t('txCategoryLabel')) + ' <span class="req">*</span></label>' +
        '<div class="input-wrap"><select id="tf_cat">' +
          opt([{ value:'buy_sell', label: GN.t('txCatBuySell') }, { value:'service', label: GN.t('txCatService') }, { value:'other', label: GN.t('txCatOther') }], selCat) +
        '</select></div></div>' +
      '<div class="field"><label>' + GN.esc(GN.t('txPaymentSource')) + ' <span class="req">*</span></label>' +
        '<div class="input-wrap"><select id="tf_pay">' +
          opt([{ value:'cash', label: GN.t('txPayCash') }, { value:'bank', label: GN.t('txPayBank') }], selPay) +
        '</select></div></div>' +
      '<div class="field" id="tf_bank_wrap" style="display:' + (selPay === 'bank' ? 'block' : 'none') + '">' +
        '<label>' + GN.esc(GN.t('txSelectBank')) + ' <span class="req">*</span></label>' +
        '<div class="input-wrap"><select id="tf_bank">' + bankOptions + '</select></div></div>' +
      '<div class="field"><label>' + GN.esc(GN.t('txType')) + ' <span class="req">*</span></label>' +
        '<div class="input-wrap"><select id="tf_type">' +
          opt([{ value:'in', label: GN.t('txIn') }, { value:'out', label: GN.t('txOut') }], selType) +
        '</select></div></div>' +
      '<div class="field"><label>' + GN.esc(GN.t('txDate')) + ' <span class="req">*</span></label>' +
        '<div class="input-wrap"><input type="date" id="tf_date" value="' + GN.escAttr(t.transaction_date || GN.today()) + '"></div></div>' +
      '<div class="field"><label>' + GN.esc(GN.t('txAmount')) + ' <span class="req">*</span></label>' +
        '<div class="input-wrap"><input type="number" id="tf_amount" step="0.01" min="0" value="' + (t.amount || '') + '"></div></div>' +
      '<div class="field"><label>' + GN.esc(GN.t('txCurrency')) + ' <span class="req">*</span></label>' +
        '<div class="input-wrap"><select id="tf_currency">' +
          opt([{ value:'SDG', label:'SDG — جنيه سوداني' }, { value:'USD', label:'USD — دولار أمريكي' }], selCur) +
        '</select></div></div>' +
      '<div class="field tx-usd-only"><label>' + GN.esc(GN.t('txExchangeRate')) + ' <span class="req">*</span></label>' +
        '<div class="input-wrap"><input type="number" id="tf_rate" step="0.01" min="0" value="' + (t.exchange_rate || '') + '"></div></div>' +
      '<div class="field tx-usd-only"><label>' + GN.esc(GN.t('txAmountSdg')) + ' <span class="hint">' + GN.esc(GN.t('txAutoCalc')) + '</span></label>' +
        '<div class="input-wrap"><input type="number" id="tf_amount_sdg" readonly value="' + (t.amount_sdg || '') + '"></div></div>' +
      '<div class="field"><label>' + GN.esc(GN.t('txServiceType')) + '</label>' +
        '<div class="input-wrap"><select id="tf_svc">' +
          opt([{ value:'gold', label: GN.t('txGold') }, { value:'lab', label: GN.t('txLab') }, { value:'other', label: GN.t('txOther') }], selSvc) +
        '</select></div></div>' +
      '<div class="field"><label>' + GN.esc(GN.t('txSource')) + '</label>' +
        '<div class="input-wrap"><select id="tf_source">' +
          opt([
            { value:'general',     label: GN.t('txSourceGeneral') },
            { value:'equipment',   label: GN.t('txSourceEquipment') },
            { value:'maintenance', label: GN.t('txSourceMaintenance') },
            { value:'operations',  label: GN.t('txSourceOperations') },
            { value:'gold',        label: GN.t('txSourceGold') }
          ], selSrc) +
        '</select></div></div>' +
      '<div class="field"><label>' + GN.esc(GN.t('txDepartment')) + '</label>' +
        '<div class="input-wrap"><input type="text" id="tf_dept" value="' + GN.escAttr(t.department || '') + '"></div></div>' +
      '<div class="field"><label>' + GN.esc(GN.t('txAttachment')) + '</label>' +
        '<div class="input-wrap"><input type="url" id="tf_attach" dir="ltr" value="' + GN.escAttr(t.attachment_url || '') + '" placeholder="https://..."></div></div>' +
      '<div class="field full"><label>' + GN.esc(GN.t('txDescription')) + ' <span class="req">*</span></label>' +
        '<div class="input-wrap"><textarea id="tf_desc" rows="3">' + GN.esc(t.description || '') + '</textarea></div></div>' +
      '<div class="field"><label>' + GN.esc(GN.t('txTaxGeneral')) + '</label>' +
        '<div class="input-wrap"><input type="number" id="tf_tax_general" step="0.01" min="0" value="' + (t.tax_general || 0) + '"></div></div>' +
      '<div class="field"><label>' + GN.esc(GN.t('txTaxVat')) + '</label>' +
        '<div class="input-wrap"><input type="number" id="tf_tax_vat" step="0.01" min="0" value="' + (t.tax_vat || 0) + '"></div></div>' +
      '<div class="field"><label>' + GN.esc(GN.t('txTaxGoldSpecial')) + '</label>' +
        '<div class="input-wrap"><input type="number" id="tf_tax_gs" step="0.01" min="0" value="' + (t.tax_gold_special || 0) + '"></div></div>' +
      '<div class="field"><label>' + GN.esc(GN.t('txTaxGoldVat')) + '</label>' +
        '<div class="input-wrap"><input type="number" id="tf_tax_gv" step="0.01" min="0" value="' + (t.tax_gold_vat || 0) + '"></div></div>' +
    '</div>';

  var sub = document.getElementById('formModalSubmit');
  if (sub) sub.style.display = '';

  GN.openModal('formModal');

  var wrap = document.getElementById('txFormWrap');
  var curSel = document.getElementById('tf_currency');
  var amtEl = document.getElementById('tf_amount');
  var rateEl = document.getElementById('tf_rate');
  var sdgEl = document.getElementById('tf_amount_sdg');
  var paySel = document.getElementById('tf_pay');
  var bankWrap = document.getElementById('tf_bank_wrap');
  var bankSel = document.getElementById('tf_bank');

  function recalc(){
    if (curSel.value === 'USD'){
      wrap.classList.add('usd');
      var amt = Number(amtEl.value) || 0;
      var rate = Number(rateEl.value) || 0;
      sdgEl.value = rate > 0 ? (amt * rate).toFixed(2) : '';
    } else {
      wrap.classList.remove('usd');
      sdgEl.value = '';
    }
  }
  curSel.addEventListener('change', recalc);
  amtEl.addEventListener('input', recalc);
  rateEl.addEventListener('input', recalc);
  recalc();

  paySel.addEventListener('change', function(){
    bankWrap.style.display = paySel.value === 'bank' ? 'block' : 'none';
  });

  var submitBtn = document.getElementById('formModalSubmit');
  submitBtn.onclick = function(){
    var payload = {
      type: document.getElementById('tf_type').value,
      transaction_date: document.getElementById('tf_date').value,
      amount: Number(document.getElementById('tf_amount').value) || 0,
      currency: document.getElementById('tf_currency').value,
      exchange_rate: Number(document.getElementById('tf_rate').value) || null,
      amount_sdg: Number(document.getElementById('tf_amount_sdg').value) || null,
      transaction_category: document.getElementById('tf_cat').value,
      service_type: document.getElementById('tf_svc').value,
      source: document.getElementById('tf_source').value,
      department: document.getElementById('tf_dept').value.trim(),
      description: document.getElementById('tf_desc').value.trim(),
      attachment_url: document.getElementById('tf_attach').value.trim(),
      tax_general: Number(document.getElementById('tf_tax_general').value) || 0,
      tax_vat: Number(document.getElementById('tf_tax_vat').value) || 0,
      tax_gold_special: Number(document.getElementById('tf_tax_gs').value) || 0,
      tax_gold_vat: Number(document.getElementById('tf_tax_gv').value) || 0,
      payment_method: paySel.value,
      bank_id: paySel.value === 'bank' ? (bankSel.value || '') : '',
      bank_name: ''
    };

    if (payload.payment_method === 'bank' && !payload.bank_id){
      GN.toast(GN.t('fieldRequired'), 'bad');
      return;
    }
    if (payload.bank_id){
      var bk = banks.filter(function(x){ return x.id === payload.bank_id; })[0];
      if (bk) payload.bank_name = bk.name;
    }
    if (!payload.amount || payload.amount <= 0){
      GN.toast(GN.t('fieldRequired'), 'bad');
      return;
    }
    if (!payload.description){
      GN.toast(GN.t('fieldRequired'), 'bad');
      return;
    }
    if (payload.currency === 'USD' && (!payload.exchange_rate || payload.exchange_rate <= 0)){
      GN.toast(GN.t('fieldRequired'), 'bad');
      return;
    }

    submitBtn.disabled = true;

    function reverseTx(tx){
      if (tx.payment_method !== 'bank' || !tx.bank_id) return Promise.resolve();
      var dlt = tx.type === 'in' ? -Number(tx.amount) : Number(tx.amount);
      return new Promise(function(resolve){ GN.applyBankChange(tx.bank_id, dlt, resolve); });
    }
    function applyTx(tx){
      if (tx.payment_method !== 'bank' || !tx.bank_id) return Promise.resolve();
      var dlt = tx.type === 'in' ? Number(tx.amount) : -Number(tx.amount);
      return new Promise(function(resolve){ GN.applyBankChange(tx.bank_id, dlt, resolve); });
    }

    var dbPromise;
    if (isEdit){
      payload.updated_at = new Date().toISOString();
      dbPromise = GN.supa.from('transactions').update(payload).eq('id', t.id).select();
    } else {
      payload.created_by = GN.session.user.id;
      payload.created_by_name = (GN.session.profile && (GN.session.profile.full_name || GN.session.profile.email)) || '';
      dbPromise = GN.supa.from('transactions').insert(payload).select();
    }

    dbPromise.then(function(res){
      if (res.error){
        submitBtn.disabled = false;
        console.error('[tx save]', res.error);
        GN.toast(res.error.message, 'bad');
        return;
      }

      var chain = Promise.resolve();
      if (isEdit) chain = chain.then(function(){ return reverseTx(t); });
      chain = chain.then(function(){ return applyTx(payload); });

      chain.then(function(){
        submitBtn.disabled = false;
        GN.toast(isEdit ? GN.t('savedSuccess') : GN.t('txSaved'), 'ok');

        if (!isEdit && res.data && res.data[0]){
          GN.notify.send({
            type: payload.type === 'in' ? 'add' : 'delete',
            section: 'finance',
            target: 'transaction',
            target_id: res.data[0].id,
            title: GN.t('txAdd') + ' · ' + GN.t('navFinance'),
            body: payload.description + ' — ' + GN.formatNum(payload.amount, 2) + ' ' + payload.currency
          });
        }

        GN.closeModal('formModal');
        GN.loadTransactions();
      });
    });
  };
};

console.log('[Gold Nile] dashboard/10-transaction-form.js loaded');
})();