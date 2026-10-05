/* ============================================================
   Gold Nile — Dashboard / Payables & Payments
   KPIs · Tabs · Table · Approve · Pay · Cancel · Delete
   + Auto-create Expense from paid Payable (Hybrid approach)
   ============================================================ */
(function(){
'use strict';

var GN = window.GN = window.GN || {};

/* ============================================================
   Payables Section
   ============================================================ */
GN.payablesFilter = { status: 'all' };

GN.sections.payables = function(){
  var html = '';
  html += '<div class="fin-head"><div>' +
    '<h2>' + GN.navIcon('wallet') + ' ' + GN.esc(GN.t('payTitle')) + '</h2>' +
    '<span class="sub">' + GN.esc(GN.t('paySub')) + '</span></div>' +
    '<button class="btn btn-pri btn-sm" data-act="pay-add">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg> ' +
      GN.esc(GN.t('payAdd')) + '</button></div>';

  html += '<div class="pay-kpis" id="payKpis"></div>';
  html += '<div id="payTabsWrap"></div>';
  html += '<div id="payTableWrap"><div class="empty"><div class="ic">' + GN.navIcon('wallet') + '</div><h4>' + GN.esc(GN.t('loading')) + '</h4></div></div>';

  setTimeout(GN.loadPayables, 100);
  return html;
};

GN.loadPayables = function(){
  if (!GN.supa) return;
  var wrap = document.getElementById('payTableWrap');
  if (wrap) wrap.innerHTML = '<div class="empty"><div class="ic">' + GN.navIcon('wallet') + '</div><h4>' + GN.esc(GN.t('loading')) + '</h4></div>';

  GN.supa.from('payment_orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500)
    .then(function(res){
      if (res.error){
        console.error('[pay]', res.error);
        if (wrap) wrap.innerHTML = '<div class="empty"><h4>خطأ في التحميل</h4><p>' + GN.esc(res.error.message) + '</p></div>';
        return;
      }
      var arr = res.data || [];
      GN.renderPayablesKPIs(arr);
      GN.renderPayablesTabs(arr);
      GN.renderPayablesTable(arr);
    });
};

GN.renderPayablesKPIs = function(arr){
  var box = document.getElementById('payKpis');
  if (!box) return;

  var now = new Date();
  var monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  var today = new Date().toISOString().slice(0, 10);
  var pendingCount = 0, pendingAmount = 0, paidMonth = 0, overdueCount = 0;

  arr.forEach(function(p){
    var amt = Number(p.amount_sdg || p.amount || 0);
    if (p.status === 'pending' || p.status === 'approved'){
      pendingCount++;
      pendingAmount += amt;
      if (p.due_date && p.due_date < today) overdueCount++;
    }
    if (p.status === 'paid' && p.paid_at && p.paid_at >= monthStart){
      paidMonth += amt;
    }
  });

  box.innerHTML =
    '<div class="pay-kpi pending"><div class="ic">' + GN.navIcon('wallet') + '</div>' +
      '<div class="body"><div class="lbl">' + GN.esc(GN.t('payKpiPending')) + '</div>' +
      '<div class="val">' + GN.formatNum(pendingCount) + '</div></div></div>' +
    '<div class="pay-kpi"><div class="ic" style="background:var(--gold-l);color:var(--gold-d)">' + GN.navIcon('dollar') + '</div>' +
      '<div class="body"><div class="lbl">' + GN.esc(GN.t('payTotalPending')) + '</div>' +
      '<div class="val">' + GN.formatNum(pendingAmount) + '</div></div></div>' +
    '<div class="pay-kpi paid"><div class="ic">' + GN.navIcon('check') + '</div>' +
      '<div class="body"><div class="lbl">' + GN.esc(GN.t('payKpiPaid')) + '</div>' +
      '<div class="val">' + GN.formatNum(paidMonth) + '</div></div></div>' +
    '<div class="pay-kpi overdue"><div class="ic">' + GN.navIcon('check') + '</div>' +
      '<div class="body"><div class="lbl">' + GN.esc(GN.t('payKpiOverdue')) + '</div>' +
      '<div class="val">' + GN.formatNum(overdueCount) + '</div></div></div>';
};

GN.renderPayablesTabs = function(arr){
  var wrap = document.getElementById('payTabsWrap');
  if (!wrap) return;

  var counts = { all: arr.length, pending: 0, approved: 0, paid: 0, cancelled: 0 };
  arr.forEach(function(p){ if (counts[p.status] != null) counts[p.status]++; });

  var tabs = [
    { key:'all',       label: GN.t('payAll') },
    { key:'pending',   label: GN.t('payPending') },
    { key:'approved',  label: GN.t('payApproved') },
    { key:'paid',      label: GN.t('payPaid') },
    { key:'cancelled', label: GN.t('payCancelled') }
  ];
  var active = GN.payablesFilter.status || 'all';

  wrap.innerHTML = '<div class="pay-tabs">' + tabs.map(function(t){
    var on = (t.key === active) ? ' on' : '';
    var cnt = counts[t.key] != null ? '<span class="cnt">' + counts[t.key] + '</span>' : '';
    return '<button class="pay-tab' + on + '" data-pay-tab="' + t.key + '">' + GN.esc(t.label) + cnt + '</button>';
  }).join('') + '</div>';

  GN.$$('[data-pay-tab]').forEach(function(btn){
    btn.addEventListener('click', function(){
      GN.payablesFilter.status = btn.getAttribute('data-pay-tab');
      GN.loadPayables();
    });
  });
};

GN.renderPayablesTable = function(arr){
  var wrap = document.getElementById('payTableWrap');
  if (!wrap) return;

  var activeTab = GN.payablesFilter.status || 'all';
  var filtered = (activeTab === 'all') ? arr : arr.filter(function(p){ return p.status === activeTab; });

  if (!filtered.length){
    wrap.innerHTML = '<div class="card"><div class="empty"><div class="ic">' + GN.navIcon('wallet') + '</div>' +
      '<h4>' + GN.esc(GN.t('payEmpty')) + '</h4>' +
      '<p>' + GN.esc(GN.t('payEmptyAdd')) + '</p></div></div>';
    return;
  }

  var isAdmin = GN.session.isOwner && GN.session.isAdmin;
  var today = new Date().toISOString().slice(0, 10);

  wrap.innerHTML = '<div class="card"><div class="card-head">' +
    '<h3>' + GN.navIcon('wallet') + ' ' + GN.esc(GN.t('payTitle')) + '</h3>' +
    '<span class="ff-count">' + filtered.length + '</span></div>' +
    '<div class="tx-table-wrap"><table class="tx-table"><thead><tr>' +
    '<th>' + GN.esc(GN.t('payCode')) + '</th>' +
    '<th>' + GN.esc(GN.t('payType')) + '</th>' +
    '<th>' + GN.esc(GN.t('payBeneficiary')) + '</th>' +
    '<th>' + GN.esc(GN.t('payAmount')) + '</th>' +
    '<th>' + GN.esc(GN.t('payDueDate')) + '</th>' +
    '<th>' + GN.esc(GN.t('payStatus')) + '</th>' +
    (isAdmin ? '<th></th>' : '') +
  '</tr></thead><tbody>' + filtered.map(function(p){
    var currencyCode = p.currency || 'SDG';
    var sdg = Number(p.amount_sdg || 0);
    var isOverdue = (p.status === 'pending' || p.status === 'approved') && p.due_date && p.due_date < today;

    var typeLbl = p.type === 'agent'     ? GN.t('payTypeAgent')
                : p.type === 'vendor'    ? GN.t('payTypeVendor')
                : p.type === 'salary'    ? GN.t('payTypeSalary')
                : p.type === 'operating' ? GN.t('payTypeOperating')
                : p.type === 'tax'       ? GN.t('payTypeTax')
                : GN.t('payTypeOther');

    var statusLbl = p.status === 'pending'   ? GN.t('payPending')
                  : p.status === 'approved'  ? GN.t('payApproved')
                  : p.status === 'paid'      ? GN.t('payPaid')
                  : GN.t('payCancelled');

    var actions = '';
    if (isAdmin){
      actions = '<div class="pay-actions">';
      if (p.status === 'pending'){
        actions += '<button class="pay-act approve" data-pay-act="approve" data-pay-id="' + GN.escAttr(p.id) + '" title="' + GN.escAttr(GN.t('payApprove')) + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M20 6 9 17l-5-5"/></svg></button>';
      }
      if (p.status === 'approved'){
        actions += '<button class="pay-act pay" data-pay-act="pay" data-pay-id="' + GN.escAttr(p.id) + '" title="' + GN.escAttr(GN.t('payMarkPaid')) + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="6" width="20" height="14" rx="3"/><path d="M2 10h20M16 14h2"/></svg></button>';
      }
      if (p.status === 'pending' || p.status === 'approved'){
        actions += '<button class="pay-act cancel" data-pay-act="cancel" data-pay-id="' + GN.escAttr(p.id) + '" title="' + GN.escAttr(GN.t('payCancel')) + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="m6 6 12 12"/></svg></button>';
      }
      if (p.status === 'cancelled'){
        actions += '<button class="pay-act del" data-pay-act="del" data-pay-id="' + GN.escAttr(p.id) + '" title="' + GN.escAttr(GN.t('delete')) + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M8 6V4h8v2M6 6v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6"/></svg></button>';
      }
      actions += '</div>';
    }

    return '<tr data-notif-id="' + GN.escAttr(p.id) + '">' +
      '<td><span class="pay-code">' + GN.esc(p.code || '-') + '</span></td>' +
      '<td><span class="pay-type ' + GN.esc(p.type) + '">' + GN.esc(typeLbl) + '</span></td>' +
      '<td><div class="pay-benef"><b>' + GN.esc(p.beneficiary_name || '-') + '</b>' +
        (p.beneficiary_bank ? '<small>' + GN.esc(p.beneficiary_bank) + (p.beneficiary_account ? ' — ' + GN.esc(p.beneficiary_account) : '') + '</small>' : '') +
      '</div></td>' +
      '<td><span class="pay-amount">' + GN.formatNum(p.amount, 2) + ' <span style="font-size:10.5px;color:var(--ink-3)">' + GN.esc(currencyCode) + '</span>' +
        (currencyCode === 'USD' && sdg ? '<span class="sdg">≈ ' + GN.formatNum(sdg) + ' SDG</span>' : '') +
      '</span></td>' +
      '<td><span class="pay-due' + (isOverdue ? ' overdue' : '') + '">' + GN.esc(GN.formatDate(p.due_date)) + '</span></td>' +
      '<td><span class="pay-status ' + GN.esc(p.status) + '"><span class="dot"></span>' + GN.esc(statusLbl) + '</span></td>' +
      (isAdmin ? '<td>' + actions + '</td>' : '') +
    '</tr>';
  }).join('') + '</tbody></table></div></div>';

  GN.$$('[data-pay-act]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var act = btn.getAttribute('data-pay-act');
      var id = btn.getAttribute('data-pay-id');
      if (act === 'approve')      GN.approvePayable(id);
      else if (act === 'pay')     GN.markPayablePaid(id);
      else if (act === 'cancel')  GN.cancelPayable(id);
      else if (act === 'del')     GN.deletePayable(id);
    });
  });
};

/* ============================================================
   Approve
   ============================================================ */
GN.approvePayable = function(id){
  if (!GN.session.isOwner){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }

  var body = document.getElementById('formModalBody');
  var titleEl = document.getElementById('formModalTitle');
  if (!body || !titleEl) return;
  titleEl.textContent = GN.t('approveTitle');

  body.innerHTML = '<div class="form-grid">' +
    '<div class="field full" style="background:var(--nile-l);color:var(--nile);padding:10px 12px;border-radius:10px;font-size:12.5px;font-weight:600;text-align:center">' +
      GN.esc(GN.t('approveHint')) +
    '</div>' +
    '<div class="field"><label>' + GN.esc(GN.t('invoiceNumber')) + '</label>' +
      '<div class="input-wrap"><input type="text" id="ap_inv_no" dir="ltr" placeholder="INV-12345"></div></div>' +
    '<div class="field"><label>' + GN.esc(GN.t('invoiceUrl')) + '</label>' +
      '<div class="input-wrap"><input type="url" id="ap_inv_url" dir="ltr" placeholder="https://..."></div></div>' +
    '<div class="field full"><label>' + GN.esc(GN.t('notes')) + '</label>' +
      '<div class="input-wrap"><textarea id="ap_notes" rows="3"></textarea></div></div>' +
  '</div>';

  var sub = document.getElementById('formModalSubmit');
  if (sub) sub.style.display = '';

  GN.openModal('formModal');

  var submitBtn = document.getElementById('formModalSubmit');
  submitBtn.onclick = function(){
    var invNo = document.getElementById('ap_inv_no').value.trim();
    var invUrl = document.getElementById('ap_inv_url').value.trim();
    var notes = document.getElementById('ap_notes').value.trim();

    submitBtn.disabled = true;
    var update = {
      status: 'approved',
      updated_at: new Date().toISOString()
    };
    if (invNo) update.notes = (notes ? notes + ' | ' : '') + 'INV#: ' + invNo;
    else if (notes) update.notes = notes;
    if (invUrl) update.invoice_url = invUrl;

    GN.supa.from('payment_orders').update(update).eq('id', id).then(function(res){
      submitBtn.disabled = false;
      if (res.error){ GN.toast(res.error.message, 'bad'); return; }
      GN.toast(GN.t('payApproved_msg'), 'ok');
      GN.notify.send({
        type:'edit', section:'payables', target:'payable', target_id: id,
        title: GN.t('payApproved'),
        body: GN.t('payApproved_msg') + (invNo ? ' — ' + invNo : '')
      });
      GN.closeModal('formModal');
      GN.loadPayables();
    });
  };
};

/* ============================================================
   Cancel
   ============================================================ */
GN.cancelPayable = function(id){
  if (!GN.session.isOwner){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  GN.confirm({
    title: GN.t('payCancel'),
    text: GN.t('payCancelConfirm'),
    okText: GN.t('payCancel'),
    cancelText: GN.t('cancel'),
    danger: true
  }).then(function(ok){
    if (!ok) return;
    GN.supa.from('payment_orders')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', id)
      .then(function(res){
        if (res.error){ GN.toast(res.error.message, 'bad'); return; }
        GN.toast(GN.t('payCancelled_msg'), 'ok');
        GN.loadPayables();
      });
  });
};

/* ============================================================
   Delete
   ============================================================ */
GN.deletePayable = function(id){
  if (!GN.session.isOwner){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  GN.confirm({
    title: GN.t('delete'),
    text: GN.t('payDeleteConfirm'),
    okText: GN.t('delete'),
    cancelText: GN.t('cancel'),
    danger: true
  }).then(function(ok){
    if (!ok) return;
    GN.supa.from('payment_orders').delete().eq('id', id).then(function(res){
      if (res.error){ GN.toast(res.error.message, 'bad'); return; }
      GN.notify.markDeleted('payables', 'payable', id);
      GN.toast(GN.t('deletedSuccess'), 'ok');
      GN.loadPayables();
    });
  });
};

/* ============================================================
   Mark Payable Paid
   + Auto-create linked Expense (Hybrid approach)
   ============================================================ */
GN.markPayablePaid = function(id){
  if (!GN.session.isOwner || !GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }

  var banks = GN.dh.list('banks');
  var bankOptions = '';
  if (!banks.length){
    bankOptions = '<option value="">' + GN.esc(GN.t('payNoBanks')) + '</option>';
  } else {
    bankOptions = '<option value="">' + GN.esc(GN.t('paySelectBank')) + '</option>' +
      banks.map(function(b){
        return '<option value="' + GN.escAttr(b.id) + '">' + GN.esc(b.name) + ' — ' + GN.formatNum(b.balance || 0) + ' ' + GN.esc(b.currency || 'SDG') + '</option>';
      }).join('');
  }

  var body = document.getElementById('formModalBody');
  var titleEl = document.getElementById('formModalTitle');
  if (!body || !titleEl) return;
  titleEl.textContent = GN.t('payMarkPaid');

  body.innerHTML = '<div class="form-grid">' +
    '<div class="field full"><label>' + GN.esc(GN.t('payTransferNumber')) + ' <span class="req">*</span></label>' +
      '<div class="input-wrap"><input type="text" id="pp_transfer" dir="ltr" placeholder="مثال: TRF-12345"></div></div>' +
    '<div class="field full"><label>' + GN.esc(GN.t('payInvoiceUrl')) + '</label>' +
      '<div class="input-wrap"><input type="url" id="pp_invoice" dir="ltr" placeholder="https://..."></div></div>' +
    '<div class="field full"><label>' + GN.esc(GN.t('paySelectBank')) + ' <span class="req">*</span></label>' +
      '<div class="input-wrap"><select id="pp_bank">' + bankOptions + '</select></div></div>' +
    '<div class="field full"><label>' + GN.esc(GN.t('payPaidAt')) + '</label>' +
      '<div class="input-wrap"><input type="date" id="pp_date" value="' + GN.today() + '"></div></div>' +
  '</div>';

  var sub = document.getElementById('formModalSubmit');
  if (sub) sub.style.display = '';

  GN.openModal('formModal');

  var submitBtn = document.getElementById('formModalSubmit');
  submitBtn.onclick = function(){
    var transfer = document.getElementById('pp_transfer').value.trim();
    var invoice = document.getElementById('pp_invoice').value.trim();
    var bankId = document.getElementById('pp_bank').value;
    var payDate = document.getElementById('pp_date').value;

    if (!transfer){ GN.toast(GN.t('payTransferRequired'), 'bad'); return; }
    if (!bankId){ GN.toast(GN.t('payBankRequired'), 'bad'); return; }

    submitBtn.disabled = true;
    GN.supa.from('payment_orders').select('*').eq('id', id).single().then(function(res){
      if (res.error){ submitBtn.disabled = false; GN.toast(res.error.message, 'bad'); return; }
      var p = res.data;
      var amt = Number(p.amount_sdg || p.amount || 0);
      var bk = banks.filter(function(x){ return x.id === bankId; })[0];

      GN.supa.from('payment_orders').update({
        status: 'paid',
        paid_at: payDate ? (payDate + 'T00:00:00Z') : new Date().toISOString(),
        paid_by: GN.session.user.id,
        transfer_number: transfer,
        invoice_url: invoice,
        bank_id: bankId,
        bank_name: bk ? bk.name : '',
        updated_at: new Date().toISOString()
      }).eq('id', id).then(function(r2){
        submitBtn.disabled = false;
        if (r2.error){ GN.toast(r2.error.message, 'bad'); return; }

        GN.applyBankChange(bankId, -amt, function(){
          GN.toast(GN.t('payPaid_msg'), 'ok');

          GN.notify.send({
            type:'edit', section:'payables', target:'payable', target_id: id,
            title: GN.t('payPaid'),
            body: GN.t('payPaid_msg') + ' — ' + transfer
          });

          /* ============================================
             ربط تلقائي: إنشاء Expense من Payable
             ============================================ */
          GN._autoCreateExpenseFromPayable({
            id: id,
            code: p.code,
            type: p.type,
            beneficiary_name: p.beneficiary_name,
            amount: p.amount,
            amount_sdg: p.amount_sdg,
            currency: p.currency,
            payment_method: p.payment_method,
            bank_id: bankId,
            bank_name: bk ? bk.name : '',
            invoice_url: invoice,
            notes: p.notes,
            paid_at: payDate ? (payDate + 'T00:00:00Z') : new Date().toISOString()
          }).then(function(created){
            if (created){
              GN.toast('✓ تم تسجيل المصروف تلقائيًا', 'ok');
            }
            GN.closeModal('formModal');
            GN.loadPayables();
          });
        });
      });
    });
  };
};

/* ============================================================
   Auto-create Expense from paid Payable
   ============================================================ */
GN._autoCreateExpenseFromPayable = function(payable){
  if (!payable || !payable.id) return Promise.resolve(false);

  /* 1) تحقق من عدم الوجود مسبقًا (منع التكرار) */
  return GN.supa.from('expenses')
    .select('id')
    .eq('source_payable_id', payable.id)
    .maybeSingle()
    .then(function(check){
      if (check.data && check.data.id){
        /* موجود بالفعل */
        return false;
      }

      /* 2) اختر التصنيف المناسب */
      return GN._findOrCreatePaidObligationCategory().then(function(catId){
        if (!catId) return false;

        var payload = {
          category_id: catId,
          expense_date: (payable.paid_at || new Date().toISOString()).slice(0, 10),
          amount: Number(payable.amount_sdg || payable.amount || 0),
          currency: payable.currency || 'SDG',
          party_type: payable.type === 'agent' ? 'agent'
                    : payable.type === 'salary' ? 'employee'
                    : payable.type === 'tax' ? 'general'
                    : 'general',
          party_id: null,
          party_name: payable.beneficiary_name || '',
          payment_method: payable.payment_method || 'bank',
          bank_id: payable.bank_id || '',
          description: '[استحقاق ' + (payable.code || '') + '] ' + (payable.notes || ''),
          attachment_url: payable.invoice_url || '',
          status: 'paid',
          source_payable_id: payable.id,
          created_by: GN.session.user ? GN.session.user.id : null
        };

        return GN.supa.from('expenses').insert(payload).then(function(res){
          if (res.error){
            console.error('[auto expense]', res.error);
            return false;
          }
          return true;
        });
      });
    });
};

/* ============================================================
   Find or create "التزامات مدفوعة" category
   ============================================================ */
GN._findOrCreatePaidObligationCategory = function(){
  /* ابحث في الذاكرة أولًا */
  var cached = (GN._expCatsCache || []).filter(function(c){
    return c.name_ar === 'التزامات مدفوعة';
  })[0];
  if (cached) return Promise.resolve(cached.id);

  /* ابحث في DB */
  return GN.supa.from('expense_categories')
    .select('id,name_ar')
    .eq('name_ar', 'التزامات مدفوعة')
    .maybeSingle()
    .then(function(res){
      if (res.data && res.data.id){
        return res.data.id;
      }
      /* أنشئها */
      return GN.supa.from('expense_categories')
        .insert({ name_ar: 'التزامات مدفوعة', name_en: 'Paid Obligations', display_order: 5 })
        .select()
        .then(function(r2){
          if (r2.error){
            console.error('[auto cat]', r2.error);
            return null;
          }
          return r2.data && r2.data[0] ? r2.data[0].id : null;
        });
    });
};

/* ============================================================
   Payable Form (Add / Edit)
   ============================================================ */
GN.openPayableForm = function(item){
  if (!GN.session.isOwner || !GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  var isEdit = !!item;
  var t = item || {
    type: 'other',
    payment_method: 'bank',
    amount: 0,
    currency: 'SDG',
    due_date: GN.today()
  };

  function opt(list_, sel){
    return list_.map(function(o){
      return '<option value="' + GN.escAttr(o.value) + '"' + (o.value === sel ? ' selected' : '') + '>' + GN.esc(o.label) + '</option>';
    }).join('');
  }

  var body = document.getElementById('formModalBody');
  var titleEl = document.getElementById('formModalTitle');
  if (!body || !titleEl) return;
  titleEl.textContent = isEdit ? GN.t('payEdit') : GN.t('payAdd');

  body.innerHTML = '<div class="form-grid">' +
    '<div class="field full"><label>' + GN.esc(GN.t('payType')) + ' <span class="req">*</span></label>' +
      '<div class="input-wrap"><select id="pf_type">' +
        opt([
          { value:'agent',     label: GN.t('payTypeAgent') },
          { value:'vendor',    label: GN.t('payTypeVendor') },
          { value:'salary',    label: GN.t('payTypeSalary') },
          { value:'operating', label: GN.t('payTypeOperating') },
          { value:'tax',       label: GN.t('payTypeTax') },
          { value:'other',     label: GN.t('payTypeOther') }
        ], t.type) +
      '</select></div></div>' +
    '<div class="field full"><label>' + GN.esc(GN.t('payBeneficiaryName')) + ' <span class="req">*</span></label>' +
      '<div class="input-wrap"><input type="text" id="pf_name" value="' + GN.escAttr(t.beneficiary_name || '') + '"></div></div>' +
    '<div class="field"><label>' + GN.esc(GN.t('payBankName')) + '</label>' +
      '<div class="input-wrap"><input type="text" id="pf_bank_name" value="' + GN.escAttr(t.beneficiary_bank || '') + '"></div></div>' +
    '<div class="field"><label>' + GN.esc(GN.t('payAccountNumber')) + '</label>' +
      '<div class="input-wrap"><input type="text" id="pf_account" dir="ltr" value="' + GN.escAttr(t.beneficiary_account || '') + '"></div></div>' +
    '<div class="field"><label>' + GN.esc(GN.t('payPhone')) + '</label>' +
      '<div class="input-wrap"><input type="tel" id="pf_phone" dir="ltr" value="' + GN.escAttr(t.beneficiary_phone || '') + '"></div></div>' +
    '<div class="field"><label>' + GN.esc(GN.t('payMethod')) + '</label>' +
      '<div class="input-wrap"><select id="pf_method">' +
        opt([{ value:'bank', label: GN.t('payMethodBank') }, { value:'cash', label: GN.t('payMethodCash') }], t.payment_method) +
      '</select></div></div>' +
    '<div class="field"><label>' + GN.esc(GN.t('payAmount')) + ' <span class="req">*</span></label>' +
      '<div class="input-wrap"><input type="number" id="pf_amount" step="0.01" min="0" value="' + (t.amount || '') + '"></div></div>' +
    '<div class="field"><label>' + GN.esc(GN.t('payCurrency')) + '</label>' +
      '<div class="input-wrap"><select id="pf_currency">' +
        opt([{ value:'SDG', label:'SDG' }, { value:'USD', label:'USD' }], t.currency) +
      '</select></div></div>' +
    '<div class="field"><label>' + GN.esc(GN.t('payExchangeRate')) + '</label>' +
      '<div class="input-wrap"><input type="number" id="pf_rate" step="0.01" min="0" value="' + (t.exchange_rate || '') + '"></div></div>' +
    '<div class="field"><label>' + GN.esc(GN.t('payDueDate')) + '</label>' +
      '<div class="input-wrap"><input type="date" id="pf_due" value="' + GN.escAttr(t.due_date || GN.today()) + '"></div></div>' +
    '<div class="field full"><label>' + GN.esc(GN.t('notes')) + '</label>' +
      '<div class="input-wrap"><textarea id="pf_notes" rows="3">' + GN.esc(t.notes || '') + '</textarea></div></div>' +
  '</div>';

  var sub = document.getElementById('formModalSubmit');
  if (sub) sub.style.display = '';

  GN.openModal('formModal');

  var submitBtn = document.getElementById('formModalSubmit');
  submitBtn.onclick = function(){
    var name = document.getElementById('pf_name').value.trim();
    var amount = Number(document.getElementById('pf_amount').value) || 0;
    if (!name || amount <= 0){ GN.toast(GN.t('fieldRequired'), 'bad'); return; }

    var cur = document.getElementById('pf_currency').value;
    var rate = Number(document.getElementById('pf_rate').value) || 0;
    var amountSdg = cur === 'USD' ? (rate > 0 ? amount * rate : null) : amount;

    var data = {
      type: document.getElementById('pf_type').value,
      beneficiary_name: name,
      beneficiary_bank: document.getElementById('pf_bank_name').value.trim(),
      beneficiary_account: document.getElementById('pf_account').value.trim(),
      beneficiary_phone: document.getElementById('pf_phone').value.trim(),
      payment_method: document.getElementById('pf_method').value,
      amount: amount,
      currency: cur,
      exchange_rate: rate || null,
      amount_sdg: amountSdg,
      due_date: document.getElementById('pf_due').value || null,
      notes: document.getElementById('pf_notes').value.trim(),
      updated_at: new Date().toISOString()
    };

    submitBtn.disabled = true;
    var promise;
    if (isEdit){
      promise = GN.supa.from('payment_orders').update(data).eq('id', t.id).select();
    } else {
      var yr = new Date().getFullYear();
      data.code = 'PAY-' + yr + '-' + String(Date.now()).slice(-4);
      data.status = 'pending';
      data.linked_source = 'manual';
      data.created_by = GN.session.user.id;
      data.created_by_name = (GN.session.profile && (GN.session.profile.full_name || GN.session.profile.email)) || '';
      promise = GN.supa.from('payment_orders').insert(data).select();
    }
    promise.then(function(res){
      submitBtn.disabled = false;
      if (res.error){ GN.toast(res.error.message, 'bad'); return; }
      GN.toast(GN.t('paySaved'), 'ok');
      if (!isEdit && res.data && res.data[0]){
        GN.notify.send({
          type:'add', section:'payables', target:'payable', target_id: res.data[0].id,
          title: GN.t('notifAdd') + ' · ' + GN.t('payTitle'),
          body: name + ' — ' + GN.formatNum(amount, 2) + ' ' + cur
        });
      }
      GN.closeModal('formModal');
      GN.loadPayables();
    });
  };
};

/* ============================================================
   Bind Section
   ============================================================ */
GN.bindSection.payables = function(){
  GN.bindAction('pay-add', function(){
    if (!GN.session.isOwner || !GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
    GN.openPayableForm(null);
  });
};

/* ============================================================
   Agent Payable auto-creation (called from gold forms)
   ============================================================ */
GN.createAgentPayable = function(source, sourceType){
  var agentId = source.agent_id;
  if (!agentId) return Promise.resolve(null);

  var commAmount = Number(source.commission_amount || 0);
  if (commAmount <= 0) return Promise.resolve(null);

  var agents = GN.dh.list('gold_agents');
  var agent = agents.filter(function(a){
    return a.code === agentId || a.id === agentId || a.name === agentId;
  })[0];
  if (!agent) return Promise.resolve(null);

  var p = GN.session.profile;
  var code = 'PAY-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-4);

  return GN.supa.from('payment_orders').insert({
    code: code,
    type: 'agent',
    beneficiary_name: agent.name || '',
    beneficiary_bank: agent.bank_name || '',
    beneficiary_account: agent.account_number || '',
    beneficiary_phone: agent.phone || '',
    payment_method: agent.payment_method || 'cash',
    amount: commAmount,
    currency: 'SDG',
    amount_sdg: commAmount,
    due_date: null,
    status: 'pending',
    linked_source: sourceType,
    linked_id: source.id || '',
    linked_desc: source.code || '',
    notes: 'عمولة مندوب — ' + (source.code || ''),
    created_by: GN.session.user.id,
    created_by_name: (p && (p.full_name || p.email)) || ''
  }).select().then(function(res){
    if (res.error){
      console.error('[pay auto]', res.error);
      return null;
    }
    return res.data && res.data[0];
  });
};

console.log('[Gold Nile] dashboard/08-payables.js loaded');
})();