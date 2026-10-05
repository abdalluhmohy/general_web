/* ============================================================
   Gold Nile — Dashboard / Agents (Manage + Commission Reports)
   ============================================================ */
(function(){
'use strict';

var GN = window.GN = window.GN || {};

GN._agentsCache = [];
GN._agentsStats = {};

/* ============================================================
   Section
   ============================================================ */
GN.sections.agents = function(){
  var isAdmin = GN.session.isOwner && GN.session.isAdmin;

  var html = '<div class="fin-head"><div>' +
    '<h2>' + GN.navIcon('users') + ' ' + GN.esc(GN.t('agentsTitle')) + '</h2>' +
    '<span class="sub">' + GN.esc(GN.t('agentsSub')) + '</span></div>' +
    (isAdmin
      ? '<button class="btn btn-pri btn-sm" data-act="agent-add">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg> ' +
          GN.esc(GN.t('agentAdd')) + '</button>'
      : '') +
  '</div>';

  html += '<div class="kpi-grid" id="agentsKpis">' +
    '<div class="kpi"><div class="top"><span class="ic">' + GN.navIcon('users') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('loading')) + '</div><div class="val">—</div></div>' +
    '<div class="kpi"><div class="top"><span class="ic ok">' + GN.navIcon('check') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('loading')) + '</div><div class="val">—</div></div>' +
    '<div class="kpi"><div class="top"><span class="ic y">' + GN.navIcon('dollar') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('loading')) + '</div><div class="val">—</div></div>' +
    '<div class="kpi"><div class="top"><span class="ic g">' + GN.navIcon('gold') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('loading')) + '</div><div class="val">—</div></div>' +
  '</div>';

  html += '<div class="card"><div class="card-head">' +
    '<h3>' + GN.navIcon('users') + ' ' + GN.esc(GN.t('agentsList')) + '</h3>' +
    '<span class="ff-count" id="agentsCount">—</span></div>' +
    '<div id="agentsTableWrap"><div class="empty"><div class="ic">' + GN.navIcon('users') + '</div>' +
    '<h4>' + GN.esc(GN.t('loading')) + '</h4></div></div></div>';

  setTimeout(GN.loadAgents, 100);
  return html;
};

/* ============================================================
   Load
   ============================================================ */
GN.loadAgents = function(){
  if (!GN.supa) return;

  var wrap = document.getElementById('agentsTableWrap');
  if (wrap){
    wrap.innerHTML = '<div class="empty"><div class="ic">' + GN.navIcon('users') + '</div>' +
      '<h4>' + GN.esc(GN.t('loading')) + '</h4></div>';
  }

  Promise.all([
    GN.supa.from('agents').select('*').order('name'),
    GN.supa.from('gold_cycles').select('purchase_agent_id,purchase_commission_amount'),
    GN.supa.from('gold_cycle_sales').select('sale_agent_id,sale_commission_amount,profit_status')
  ]).then(function(res){
    if (res[0].error){
      console.error('[agents]', res[0].error);
      if (wrap) wrap.innerHTML = '<div class="empty"><h4>خطأ</h4><p>' + GN.esc(res[0].error.message) + '</p></div>';
      return;
    }
    var agents = res[0].data || [];
    var cycles = res[1].error ? [] : (res[1].data || []);
    var sales = res[2].error ? [] : (res[2].data || []);

    /* Compute stats per agent */
    var stats = {};
    agents.forEach(function(a){
      stats[a.id] = {
        buyOps: 0, buyCommission: 0,
        sellOps: 0, sellCommission: 0,
        pendingCommission: 0, realizedCommission: 0,
        totalCommission: 0
      };
    });

    cycles.forEach(function(c){
      if (!c.purchase_agent_id || !stats[c.purchase_agent_id]) return;
      stats[c.purchase_agent_id].buyOps++;
      var amt = Number(c.purchase_commission_amount || 0);
      stats[c.purchase_agent_id].buyCommission += amt;
      stats[c.purchase_agent_id].totalCommission += amt;
      stats[c.purchase_agent_id].pendingCommission += amt; /* commission pending until sale */
    });

    sales.forEach(function(s){
      if (!s.sale_agent_id || !stats[s.sale_agent_id]) return;
      stats[s.sale_agent_id].sellOps++;
      var amt = Number(s.sale_commission_amount || 0);
      stats[s.sale_agent_id].sellCommission += amt;
      stats[s.sale_agent_id].totalCommission += amt;
      if (s.profit_status === 'realized'){
        stats[s.sale_agent_id].realizedCommission += amt;
      } else {
        stats[s.sale_agent_id].pendingCommission += amt;
      }
    });

    GN._agentsCache = agents;
    GN._agentsStats = stats;

    GN.renderAgentsKPIs();
    GN.renderAgentsTable();
  });
};

/* ============================================================
   KPIs
   ============================================================ */
GN.renderAgentsKPIs = function(){
  var box = document.getElementById('agentsKpis');
  if (!box) return;

  var agents = GN._agentsCache;
  var stats = GN._agentsStats;

  var activeCount = agents.filter(function(a){ return a.status === 'active'; }).length;

  var totalPending = 0, totalRealized = 0;
  Object.keys(stats).forEach(function(id){
    totalPending += Number(stats[id].pendingCommission || 0);
    totalRealized += Number(stats[id].realizedCommission || 0);
  });

  box.innerHTML =
    '<div class="kpi hl"><div class="top"><span class="ic">' + GN.navIcon('users') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('agentKpiTotal')) + '</div>' +
      '<div class="val"><bdi>' + GN.formatNum(agents.length) + '</bdi></div>' +
      '<div class="sub">' + GN.esc(GN.t('agentKpiActive')) + ': ' + GN.formatNum(activeCount) + '</div></div>' +
    '<div class="kpi"><div class="top"><span class="ic y">' + GN.navIcon('dollar') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('agentKpiPending')) + '</div>' +
      '<div class="val" style="color:var(--warn)"><bdi>' + GN.formatNum(totalPending) + '</bdi><span class="cur">SDG</span></div></div>' +
    '<div class="kpi"><div class="top"><span class="ic ok">' + GN.navIcon('check') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('agentKpiRealized')) + '</div>' +
      '<div class="val" style="color:var(--ok)"><bdi>' + GN.formatNum(totalRealized) + '</bdi><span class="cur">SDG</span></div></div>' +
    '<div class="kpi"><div class="top"><span class="ic g">' + GN.navIcon('dollar') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('agentKpiGrandTotal')) + '</div>' +
      '<div class="val"><bdi>' + GN.formatNum(totalPending + totalRealized) + '</bdi><span class="cur">SDG</span></div></div>';
};

/* ============================================================
   Table
   ============================================================ */
GN.renderAgentsTable = function(){
  var wrap = document.getElementById('agentsTableWrap');
  var cnt = document.getElementById('agentsCount');
  if (!wrap) return;

  var agents = GN._agentsCache;
  var stats = GN._agentsStats;
  if (cnt) cnt.textContent = agents.length;

  if (!agents.length){
    wrap.innerHTML = '<div class="empty"><div class="ic">' + GN.navIcon('users') + '</div>' +
      '<h4>' + GN.esc(GN.t('agentsEmpty')) + '</h4>' +
      '<p>' + GN.esc(GN.t('agentsEmptyAdd')) + '</p></div>';
    return;
  }

  var isAdmin = GN.session.isOwner && GN.session.isAdmin;

  var rows = agents.map(function(a){
    var st = stats[a.id] || { buyOps:0, sellOps:0, buyCommission:0, sellCommission:0, pendingCommission:0, realizedCommission:0, totalCommission:0 };
    var statusCls = a.status === 'active' ? 'ok' : 'b';
    var statusLbl = a.status === 'active' ? GN.t('agentStatusActive') : GN.t('agentStatusInactive');

    return '<tr data-notif-id="' + GN.escAttr(a.id) + '">' +
      '<td><bdi dir="ltr" style="font-family:monospace;font-size:12px">' + GN.esc(a.code || '-') + '</bdi></td>' +
      '<td><b>' + GN.esc(a.name || '-') + '</b></td>' +
      '<td><bdi dir="ltr" style="font-size:12px">' + GN.esc(a.phone || '-') + '</bdi></td>' +
      '<td class="num">' + GN.formatNum(a.buy_commission_pct || 0, 2) + '%</td>' +
      '<td class="num">' + GN.formatNum(a.sell_commission_pct || 0, 2) + '%</td>' +
      '<td class="num">' + GN.formatNum(st.buyOps) + ' / ' + GN.formatNum(st.sellOps) + '</td>' +
      '<td class="num" style="color:var(--warn);font-weight:700">' + GN.formatMoneyPlain(st.pendingCommission, 'SDG') + '</td>' +
      '<td class="num" style="color:var(--ok);font-weight:700">' + GN.formatMoneyPlain(st.realizedCommission, 'SDG') + '</td>' +
      '<td><span class="chip ' + statusCls + '"><span class="dot"></span>' + GN.esc(statusLbl) + '</span></td>' +
      (isAdmin
        ? '<td class="actions"><div class="row-actions">' +
            '<button class="icon-act" data-agent-act="view" data-agent-id="' + GN.escAttr(a.id) + '" title="' + GN.escAttr(GN.t('view')) + '">' + GN.ICO_VIEW + '</button>' +
            '<button class="icon-act" data-agent-act="edit" data-agent-id="' + GN.escAttr(a.id) + '" title="' + GN.escAttr(GN.t('edit')) + '">' + GN.ICO_EDIT + '</button>' +
            '<button class="icon-act del" data-agent-act="del" data-agent-id="' + GN.escAttr(a.id) + '" title="' + GN.escAttr(GN.t('delete')) + '">' + GN.ICO_DEL + '</button>' +
          '</div></td>'
        : '<td class="actions"><div class="row-actions">' +
            '<button class="icon-act" data-agent-act="view" data-agent-id="' + GN.escAttr(a.id) + '" title="' + GN.escAttr(GN.t('view')) + '">' + GN.ICO_VIEW + '</button>' +
          '</div></td>') +
    '</tr>';
  }).join('');

  wrap.innerHTML = '<div class="table-wrap"><table><thead><tr>' +
    '<th>' + GN.esc(GN.t('agentCode')) + '</th>' +
    '<th>' + GN.esc(GN.t('agentName')) + '</th>' +
    '<th>' + GN.esc(GN.t('agentPhone')) + '</th>' +
    '<th>' + GN.esc(GN.t('agentBuyPct')) + '</th>' +
    '<th>' + GN.esc(GN.t('agentSellPct')) + '</th>' +
    '<th>' + GN.esc(GN.t('agentOps')) + '</th>' +
    '<th>' + GN.esc(GN.t('agentPending')) + '</th>' +
    '<th>' + GN.esc(GN.t('agentRealized')) + '</th>' +
    '<th>' + GN.esc(GN.t('agentStatus')) + '</th>' +
    '<th></th></tr></thead><tbody>' + rows + '</tbody></table></div>';

  GN.$$('[data-agent-act]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var act = btn.getAttribute('data-agent-act');
      var id = btn.getAttribute('data-agent-id');
      if (act === 'view') GN.viewAgentDetails(id);
      else if (act === 'edit') GN.openAgentForm(id);
      else if (act === 'del') GN.deleteAgent(id);
    });
  });
};

/* ============================================================
   Add / Edit Agent Form
   ============================================================ */
GN.openAgentForm = function(id){
  if (!GN.session.isOwner || !GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }

  var isEdit = !!id;
  var item = isEdit ? GN._agentsCache.filter(function(x){ return x.id === id; })[0] : null;
  if (isEdit && !item) return;

  var body = document.getElementById('formModalBody');
  var titleEl = document.getElementById('formModalTitle');
  if (!body || !titleEl) return;

  titleEl.textContent = isEdit ? GN.t('agentEdit') : GN.t('agentAdd');

  body.innerHTML = '<div class="form-grid">' +
    '<div class="field"><label>' + GN.esc(GN.t('agentCode')) + ' <span class="req">*</span></label>' +
      '<div class="input-wrap"><input type="text" id="ag_code" dir="ltr" maxlength="20" value="' + GN.escAttr(item ? item.code : '') + '" placeholder="AG-001"></div></div>' +
    '<div class="field"><label>' + GN.esc(GN.t('agentName')) + ' <span class="req">*</span></label>' +
      '<div class="input-wrap"><input type="text" id="ag_name" maxlength="80" value="' + GN.escAttr(item ? item.name : '') + '"></div></div>' +
    '<div class="field"><label>' + GN.esc(GN.t('agentPhone')) + '</label>' +
      '<div class="input-wrap"><input type="tel" id="ag_phone" dir="ltr" value="' + GN.escAttr(item ? item.phone : '') + '"></div></div>' +
    '<div class="field"><label>' + GN.esc(GN.t('agentStatus')) + '</label>' +
      '<div class="input-wrap"><select id="ag_status">' +
        '<option value="active"' + ((item ? item.status : 'active') === 'active' ? ' selected' : '') + '>' + GN.esc(GN.t('agentStatusActive')) + '</option>' +
        '<option value="inactive"' + (item && item.status === 'inactive' ? ' selected' : '') + '>' + GN.esc(GN.t('agentStatusInactive')) + '</option>' +
      '</select></div></div>' +
    '<div class="field"><label>' + GN.esc(GN.t('agentBuyPct')) + ' %</label>' +
      '<div class="input-wrap"><input type="number" id="ag_buy_pct" step="0.001" min="0" max="100" value="' + GN.escAttr(item ? item.buy_commission_pct : 0) + '"></div></div>' +
    '<div class="field"><label>' + GN.esc(GN.t('agentSellPct')) + ' %</label>' +
      '<div class="input-wrap"><input type="number" id="ag_sell_pct" step="0.001" min="0" max="100" value="' + GN.escAttr(item ? item.sell_commission_pct : 0) + '"></div></div>' +
    '<div class="field full"><label>' + GN.esc(GN.t('agentMethod')) + '</label>' +
      '<div class="input-wrap"><select id="ag_method">' +
        '<option value="cash"' + ((item ? item.payment_method : 'cash') === 'cash' ? ' selected' : '') + '>' + GN.esc(GN.t('payMethodCash')) + '</option>' +
        '<option value="bank"' + (item && item.payment_method === 'bank' ? ' selected' : '') + '>' + GN.esc(GN.t('payMethodBank')) + '</option>' +
      '</select></div></div>' +
    '<div class="field"><label>' + GN.esc(GN.t('agentBankName')) + '</label>' +
      '<div class="input-wrap"><input type="text" id="ag_bank" value="' + GN.escAttr(item ? item.bank_name : '') + '"></div></div>' +
    '<div class="field"><label>' + GN.esc(GN.t('agentAccount')) + '</label>' +
      '<div class="input-wrap"><input type="text" id="ag_account" dir="ltr" value="' + GN.escAttr(item ? item.account_number : '') + '"></div></div>' +
    '<div class="field full"><label>' + GN.esc(GN.t('notes')) + '</label>' +
      '<div class="input-wrap"><textarea id="ag_notes" rows="2">' + GN.esc(item ? item.notes : '') + '</textarea></div></div>' +
  '</div>';

  var sub = document.getElementById('formModalSubmit');
  if (sub) sub.style.display = '';
  GN.openModal('formModal');

  sub.onclick = function(){
    var code = document.getElementById('ag_code').value.trim();
    var name = document.getElementById('ag_name').value.trim();
    if (!code || !name){ GN.toast(GN.t('fieldRequired'), 'bad'); return; }

    var method = document.getElementById('ag_method').value;
    var bank = document.getElementById('ag_bank').value.trim();
    var acc = document.getElementById('ag_account').value.trim();

    if (method === 'bank' && (!bank || !acc)){
      GN.toast('البنك ورقم الحساب مطلوبان لطريقة الحوالة', 'bad');
      return;
    }

    var payload = {
      code: code,
      name: name,
      phone: document.getElementById('ag_phone').value.trim(),
      status: document.getElementById('ag_status').value,
      buy_commission_pct: Number(document.getElementById('ag_buy_pct').value) || 0,
      sell_commission_pct: Number(document.getElementById('ag_sell_pct').value) || 0,
      payment_method: method,
      bank_name: bank,
      account_number: acc,
      notes: document.getElementById('ag_notes').value.trim(),
      updated_at: new Date().toISOString()
    };

    sub.disabled = true;
    var promise;
    if (isEdit){
      promise = GN.supa.from('agents').update(payload).eq('id', id);
    } else {
      promise = GN.supa.from('agents').insert(payload);
    }

    promise.then(function(res){
      sub.disabled = false;
      if (res.error){ GN.toast(res.error.message, 'bad'); return; }
      GN.toast(isEdit ? GN.t('savedSuccess') : GN.t('addedSuccess'), 'ok');
      if (!isEdit){
        GN.notify.send({
          type: 'add',
          section: 'agents',
          target: 'agent',
          title: 'إضافة مندوب · ' + name,
          body: 'عمولة شراء ' + payload.buy_commission_pct + '% · بيع ' + payload.sell_commission_pct + '%'
        });
      }
      GN.closeModal('formModal');
      GN.loadAgents();
    });
  };
};

/* ============================================================
   Delete Agent
   ============================================================ */
GN.deleteAgent = function(id){
  if (!GN.session.isOwner){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }

  GN.confirm({
    title: GN.t('delete'),
    text: 'حذف هذا المندوب؟ لن تتأثر الدورات المرتبطة به.',
    okText: GN.t('delete'),
    cancelText: GN.t('cancel'),
    danger: true
  }).then(function(ok){
    if (!ok) return;
    GN.supa.from('agents').delete().eq('id', id).then(function(res){
      if (res.error){ GN.toast(res.error.message, 'bad'); return; }
      GN.notify.markDeleted('agents', 'agent', id);
      GN.toast(GN.t('deletedSuccess'), 'ok');
      GN.loadAgents();
    });
  });
};

/* ============================================================
   View Agent Details
   ============================================================ */
GN.viewAgentDetails = function(id){
  var agent = GN._agentsCache.filter(function(x){ return x.id === id; })[0];
  if (!agent) return;
  var st = GN._agentsStats[id] || {};

  var overlay = document.getElementById('agentDetailsOverlay');
  if (overlay) overlay.remove();

  overlay = document.createElement('div');
  overlay.id = 'agentDetailsOverlay';
  overlay.className = 'overlay on';
  overlay.style.zIndex = '250';

  var methodLbl = agent.payment_method === 'bank' ? GN.t('payMethodBank') : GN.t('payMethodCash');
  var statusLbl = agent.status === 'active' ? GN.t('agentStatusActive') : GN.t('agentStatusInactive');

  overlay.innerHTML = '<div class="modal wide" style="max-width:640px">' +
    '<div class="modal-head">' +
      '<h3>' + GN.esc(agent.name) + ' — ' + GN.esc(agent.code) + '</h3>' +
      '<button class="close" type="button" data-ad-close><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>' +
    '</div>' +
    '<div class="modal-body">' +

      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">' +
        '<div class="card" style="margin:0"><div class="card-head"><h3>البيانات</h3></div>' +
          '<table style="width:100%;font-size:12.5px">' +
            '<tr><td style="padding:5px 0;color:var(--ink-2);font-weight:700">الحالة</td><td style="text-align:end">' + GN.esc(statusLbl) + '</td></tr>' +
            '<tr><td style="padding:5px 0;color:var(--ink-2);font-weight:700">الهاتف</td><td style="text-align:end" dir="ltr">' + GN.esc(agent.phone || '-') + '</td></tr>' +
            '<tr><td style="padding:5px 0;color:var(--ink-2);font-weight:700">عمولة الشراء</td><td style="text-align:end">' + GN.formatNum(agent.buy_commission_pct || 0, 2) + '%</td></tr>' +
            '<tr><td style="padding:5px 0;color:var(--ink-2);font-weight:700">عمولة البيع</td><td style="text-align:end">' + GN.formatNum(agent.sell_commission_pct || 0, 2) + '%</td></tr>' +
            '<tr><td style="padding:5px 0;color:var(--ink-2);font-weight:700">طريقة الدفع</td><td style="text-align:end">' + GN.esc(methodLbl) + '</td></tr>' +
            (agent.bank_name ? '<tr><td style="padding:5px 0;color:var(--ink-2);font-weight:700">البنك</td><td style="text-align:end">' + GN.esc(agent.bank_name) + '</td></tr>' : '') +
            (agent.account_number ? '<tr><td style="padding:5px 0;color:var(--ink-2);font-weight:700">الحساب</td><td style="text-align:end" dir="ltr">' + GN.esc(agent.account_number) + '</td></tr>' : '') +
          '</table>' +
        '</div>' +

        '<div class="card" style="margin:0"><div class="card-head"><h3>العمولات</h3></div>' +
          '<table style="width:100%;font-size:12.5px">' +
            '<tr><td style="padding:5px 0;color:var(--ink-2);font-weight:700">عمليات الشراء</td><td style="text-align:end">' + GN.formatNum(st.buyOps || 0) + '</td></tr>' +
            '<tr><td style="padding:5px 0;color:var(--ink-2);font-weight:700">عمليات البيع</td><td style="text-align:end">' + GN.formatNum(st.sellOps || 0) + '</td></tr>' +
            '<tr><td style="padding:5px 0;color:var(--ok);font-weight:700">عمولة شراء</td><td style="text-align:end;color:var(--ok)">' + GN.formatMoneyPlain(st.buyCommission || 0, 'SDG') + '</td></tr>' +
            '<tr><td style="padding:5px 0;color:var(--ok);font-weight:700">عمولة بيع</td><td style="text-align:end;color:var(--ok)">' + GN.formatMoneyPlain(st.sellCommission || 0, 'SDG') + '</td></tr>' +
            '<tr style="border-top:1px solid var(--line-2)"><td style="padding:8px 0;font-weight:800">الإجمالي</td><td style="text-align:end;font-weight:800;font-size:14px">' + GN.formatMoneyPlain(st.totalCommission || 0, 'SDG') + '</td></tr>' +
          '</table>' +
        '</div>' +
      '</div>' +

      '<div class="card" style="margin:0"><div class="card-head"><h3>حالة الاستحقاق</h3></div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
          '<div style="text-align:center;padding:12px;background:var(--warn-l);border-radius:10px">' +
            '<div style="font-size:11px;color:var(--warn);font-weight:800">معلّق</div>' +
            '<div style="font-weight:800;color:var(--warn);margin-top:4px;font-size:16px">' + GN.formatMoneyPlain(st.pendingCommission || 0, 'SDG') + '</div>' +
          '</div>' +
          '<div style="text-align:center;padding:12px;background:var(--ok-l);border-radius:10px">' +
            '<div style="font-size:11px;color:var(--ok);font-weight:800">محقق</div>' +
            '<div style="font-weight:800;color:var(--ok);margin-top:4px;font-size:16px">' + GN.formatMoneyPlain(st.realizedCommission || 0, 'SDG') + '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +

    '</div>' +
    '<div class="modal-foot">' +
      '<button class="btn btn-sec" data-ad-close2>' + GN.t('close') + '</button>' +
    '</div>' +
  '</div>';

  document.body.appendChild(overlay);

  function closeFn(){ overlay.remove(); }
  overlay.querySelector('[data-ad-close]').onclick = closeFn;
  overlay.querySelector('[data-ad-close2]').onclick = closeFn;
  overlay.addEventListener('click', function(e){ if (e.target === overlay) closeFn(); });
};

/* ============================================================
   Bind
   ============================================================ */
GN.bindSection.agents = function(){
  GN.bindAction('agent-add', function(){
    if (!GN.session.isOwner || !GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
    GN.openAgentForm(null);
  });
};

console.log('[Gold Nile] dashboard/14-agents.js loaded');
})();