/* ============================================================
   Gold Nile — Dashboard / HR + Tasks + Equipment
   Sections + Forms
   ============================================================ */
(function(){
'use strict';

var GN = window.GN = window.GN || {};

var ICO_EDIT = GN.ICO_EDIT;
var ICO_DEL  = GN.ICO_DEL;

/* ============================================================
   HR Section
   ============================================================ */
GN.sections.hr = function(){
  var employees = GN.dh.list('employees');
  var departments = GN.dh.list('departments');
  var activeCount = employees.filter(function(e){ return e.status === 'active'; }).length;

  var totalSalary = 0;
  employees.forEach(function(e){
    if (e.status === 'active') totalSalary += Number(e.salary || 0) + Number(e.allowances || 0);
  });

  var html = '<div class="kpi-grid">' +
    '<div class="kpi hl"><div class="top"><span class="ic">' + GN.navIcon('team') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('employees')) + '</div>' +
      '<div class="val"><bdi>' + GN.formatNum(employees.length) + '</bdi></div>' +
      '<div class="sub">' + GN.esc(GN.t('present')) + ': ' + GN.formatNum(activeCount) + '</div></div>' +
    '<div class="kpi"><div class="top"><span class="ic g">' + GN.navIcon('team') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('departments')) + '</div>' +
      '<div class="val"><bdi>' + GN.formatNum(departments.length) + '</bdi></div></div>' +
    '<div class="kpi"><div class="top"><span class="ic y">' + GN.navIcon('dollar') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('totalSalary')) + '</div>' +
      '<div class="val"><bdi>' + GN.formatNum(totalSalary) + '</bdi><span class="cur">SDG</span></div></div>' +
    '<div class="kpi"><div class="top"><span class="ic w">' + GN.navIcon('check') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('tasksTitle')) + '</div>' +
      '<div class="val"><bdi>' + GN.formatNum(GN.dh.list('tasks').length) + '</bdi></div></div>' +
  '</div>';

  html += '<div class="card"><div class="card-head"><h3>' + GN.navIcon('team') + ' ' + GN.esc(GN.t('departments')) + '</h3>' +
    '<button class="btn btn-pri btn-sm" data-act="add-dept">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg> ' +
      GN.esc(GN.t('addDepartment')) + '</button></div>';

  if (!departments.length){
    html += '<div class="empty"><div class="ic">' + GN.navIcon('team') + '</div><h4>' + GN.esc(GN.t('noData')) + '</h4></div>';
  } else {
    html += '<div style="display:flex;flex-wrap:wrap;gap:8px">';
    departments.forEach(function(dep, i){
      var cnt = employees.filter(function(e){ return e.department === dep.name; }).length;
      html += '<div data-notif-id="' + GN.escAttr(dep.id || '') + '" style="display:inline-flex;align-items:center;gap:8px;background:var(--nile-l);color:var(--nile);padding:8px 14px;border-radius:12px;font-size:13px;font-weight:600">' +
        GN.esc(dep.name) +
        '<span style="background:rgba(30,107,103,.15);padding:2px 8px;border-radius:8px;font-size:11px">' + cnt + '</span>' +
        '<button class="icon-act del" data-act="del-dept" data-idx="' + i + '" style="width:22px;height:22px;border-radius:6px">' + ICO_DEL + '</button></div>';
    });
    html += '</div>';
  }
  html += '</div>';

  html += '<div class="card"><div class="card-head"><h3>' + GN.navIcon('team') + ' ' + GN.esc(GN.t('employees')) + '</h3>' +
    '<button class="btn btn-pri btn-sm" data-act="add-emp">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg> ' +
      GN.esc(GN.t('addEmployee')) + '</button></div>';

  if (!employees.length){
    html += '<div class="empty"><div class="ic">' + GN.navIcon('team') + '</div>' +
      '<h4>' + GN.esc(GN.t('noData')) + '</h4><p>' + GN.esc(GN.t('addEmployee')) + '</p></div>';
  } else {
    html += '<div class="table-wrap"><table><thead><tr>' +
      '<th>' + GN.esc(GN.t('fullName')) + '</th>' +
      '<th>' + GN.esc(GN.t('department')) + '</th>' +
      '<th>' + GN.esc(GN.t('jobTitle')) + '</th>' +
      '<th>' + GN.esc(GN.t('baseSalary')) + '</th>' +
      '<th>' + GN.esc(GN.t('status')) + '</th><th></th></tr></thead><tbody>';
    employees.forEach(function(e, i){
      var stKey = e.status || 'active';
      var st = (window.GN_CONST && window.GN_CONST.EMP_STATUS[stKey]) || { ar: stKey, color: 'n' };
      html += '<tr data-notif-id="' + GN.escAttr(e.id || '') + '"><td><b>' + GN.esc(e.name || '-') + '</b></td>' +
        '<td>' + GN.esc(e.department || '-') + '</td>' +
        '<td>' + GN.esc(e.role || '-') + '</td>' +
        '<td class="num">' + GN.formatMoneyPlain(e.salary, e.currency || 'SDG') + '</td>' +
        '<td><span class="chip ' + st.color + '"><span class="dot"></span>' + GN.esc(st.ar) + '</span></td>' +
        '<td class="actions">' + GN.dh.actions([
          { act:'edit-emp', idx:i, icon:ICO_EDIT, title:GN.t('edit') },
          { act:'end-emp',  idx:i, icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>', title:GN.t('endEmployee') },
          { act:'del-emp',  idx:i, icon:ICO_DEL,  title:GN.t('delete'), danger:true }
        ]) + '</td></tr>';
    });
    html += '</tbody></table></div>';
  }
  html += '</div>';

  return html;
};

GN.bindSection.hr = function(){
  GN.bindAction('add-dept', function(){ GN.openDeptForm(-1); });
  GN.bindAction('del-dept', function(btn){
    var idx = +btn.getAttribute('data-idx');
    var dep = GN.dh.list('departments')[idx];
    GN.dh.askDelete().then(function(ok){
      if (!ok) return;
      if (dep && dep.id) GN.notify.markDeleted('hr', 'department', dep.id);
      GN.dh.list('departments').splice(idx, 1);
      GN.dh.save();
    });
  });
  GN.bindAction('add-emp',  function(){ GN.openEmpForm(-1); });
  GN.bindAction('edit-emp', function(btn){ GN.openEmpForm(+btn.getAttribute('data-idx')); });
  GN.bindAction('end-emp',  function(btn){ GN.openEndEmpForm(+btn.getAttribute('data-idx')); });
  GN.bindAction('del-emp',  function(btn){
    var idx = +btn.getAttribute('data-idx');
    var emp = GN.dh.list('employees')[idx];
    GN.dh.askDelete().then(function(ok){
      if (!ok) return;
      if (emp && emp.id) GN.notify.markDeleted('hr', 'employee', emp.id);
      GN.dh.list('employees').splice(idx, 1);
      GN.dh.save();
    });
  });
};

/* ============================================================
   Tasks Section
   ============================================================ */
GN.sections.tasks = function(){
  var tasks = GN.dh.list('tasks');
  var open     = tasks.filter(function(t){ return ['new','inprogress','onhold'].indexOf(t.status) !== -1; });
  var done     = tasks.filter(function(t){ return t.status === 'done'; });
  var canceled = tasks.filter(function(t){ return t.status === 'cancelled'; });

  var html = '<div class="kpi-grid">' +
    '<div class="kpi hl"><div class="top"><span class="ic">' + GN.navIcon('check') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('openTasks')) + '</div><div class="val"><bdi>' + GN.formatNum(open.length) + '</bdi></div></div>' +
    '<div class="kpi"><div class="top"><span class="ic ok">' + GN.navIcon('check') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('doneTasks')) + '</div><div class="val"><bdi>' + GN.formatNum(done.length) + '</bdi></div></div>' +
    '<div class="kpi"><div class="top"><span class="ic b">' + GN.navIcon('check') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('taskCancelled')) + '</div><div class="val"><bdi>' + GN.formatNum(canceled.length) + '</bdi></div></div>' +
  '</div>';

  function renderTasks(arr, title){
    if (!arr.length) return '';
    var h = '<div class="card"><div class="card-head"><h3>' + GN.navIcon('check') + ' ' + GN.esc(title) + '</h3></div>';
    h += '<div class="table-wrap"><table><thead><tr>' +
      '<th>' + GN.esc(GN.t('taskTitle')) + '</th>' +
      '<th>' + GN.esc(GN.t('assignee')) + '</th>' +
      '<th>' + GN.esc(GN.t('dueDate')) + '</th>' +
      '<th>' + GN.esc(GN.t('priority')) + '</th>' +
      '<th>' + GN.esc(GN.t('status')) + '</th><th></th></tr></thead><tbody>';
    arr.forEach(function(t){
      var idx = tasks.indexOf(t);
      var st = (window.GN_CONST && window.GN_CONST.TASK_STATUS[t.status]) || { ar: t.status, color: 'n' };
      var pr = (window.GN_CONST && window.GN_CONST.TASK_PRIORITY[t.priority]) || { ar: t.priority, color: 'n' };
      h += '<tr data-notif-id="' + GN.escAttr(t.id || '') + '"><td><b>' + GN.esc(t.title || '-') + '</b></td>' +
        '<td>' + GN.esc(t.assignee_name || '-') + '</td>' +
        '<td>' + GN.esc(GN.formatDate(t.due_date)) + '</td>' +
        '<td><span class="chip ' + pr.color + '">' + GN.esc(pr.ar) + '</span></td>' +
        '<td><span class="chip ' + st.color + '"><span class="dot"></span>' + GN.esc(st.ar) + '</span></td>' +
        '<td class="actions">' + GN.dh.actions([
          { act:'edit-task', idx:idx, icon:ICO_EDIT, title:GN.t('edit') },
          { act:'del-task',  idx:idx, icon:ICO_DEL,  title:GN.t('delete'), danger:true }
        ]) + '</td></tr>';
    });
    h += '</tbody></table></div></div>';
    return h;
  }

  html += '<div style="text-align:end;margin-bottom:14px">' +
    '<button class="btn btn-pri btn-sm" data-act="add-task">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg> ' +
      GN.esc(GN.t('addTask')) + '</button></div>';

  html += renderTasks(open, GN.t('openTasks'));
  html += renderTasks(done, GN.t('doneTasks'));
  html += renderTasks(canceled, GN.t('taskCancelled'));

  if (!tasks.length){
    html += '<div class="card"><div class="empty"><div class="ic">' + GN.navIcon('check') + '</div>' +
      '<h4>' + GN.esc(GN.t('noData')) + '</h4><p>' + GN.esc(GN.t('addTask')) + '</p></div></div>';
  }
  return html;
};

GN.bindSection.tasks = function(){
  GN.bindAction('add-task',  function(){ GN.openTaskForm(-1); });
  GN.bindAction('edit-task', function(btn){ GN.openTaskForm(+btn.getAttribute('data-idx')); });
  GN.bindAction('del-task',  function(btn){
    var idx = +btn.getAttribute('data-idx');
    var task = GN.dh.list('tasks')[idx];
    GN.dh.askDelete().then(function(ok){
      if (!ok) return;
      if (task && task.id) GN.notify.markDeleted('tasks', 'task', task.id);
      GN.dh.list('tasks').splice(idx, 1);
      GN.dh.save();
    });
  });
};

/* ============================================================
   Equipment Section
   ============================================================ */
GN.sections.equipment = function(){
  var eq = GN.dh.list('equipment');
  var maint = GN.dh.list('maintenance');
  var totalCost = 0;
  eq.forEach(function(e){ totalCost += Number(e.total_cost || 0); });

  var html = '<div class="kpi-grid">' +
    '<div class="kpi hl"><div class="top"><span class="ic">' + GN.navIcon('tool') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('equipmentList')) + '</div>' +
      '<div class="val"><bdi>' + GN.formatNum(eq.length) + '</bdi></div></div>' +
    '<div class="kpi"><div class="top"><span class="ic y">' + GN.navIcon('dollar') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('totalCost')) + '</div>' +
      '<div class="val"><bdi>' + GN.formatNum(totalCost) + '</bdi><span class="cur">USD</span></div></div>' +
    '<div class="kpi"><div class="top"><span class="ic w">' + GN.navIcon('tool') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('maintenance')) + '</div>' +
      '<div class="val"><bdi>' + GN.formatNum(maint.length) + '</bdi></div></div>' +
    '<div class="kpi"><div class="top"><span class="ic ok">' + GN.navIcon('check') + '</span></div>' +
      '<div class="lbl">' + GN.esc(GN.t('received')) + '</div>' +
      '<div class="val"><bdi>' + GN.formatNum(eq.filter(function(e){ return e.received; }).length) + '</bdi></div></div>' +
  '</div>';

  html += '<div class="card"><div class="card-head"><h3>' + GN.navIcon('tool') + ' ' + GN.esc(GN.t('equipmentList')) + '</h3>' +
    '<button class="btn btn-pri btn-sm" data-act="add-eq">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg> ' +
      GN.esc(GN.t('addEquipment')) + '</button></div>';

  if (!eq.length){
    html += '<div class="empty"><div class="ic">' + GN.navIcon('tool') + '</div><h4>' + GN.esc(GN.t('noData')) + '</h4></div>';
  } else {
    html += '<div class="table-wrap"><table><thead><tr>' +
      '<th>' + GN.esc(GN.t('equipmentName')) + '</th>' +
      '<th>' + GN.esc(GN.t('category')) + '</th>' +
      '<th>' + GN.esc(GN.t('expectedPrice')) + '</th>' +
      '<th>' + GN.esc(GN.t('received')) + '</th>' +
      '<th>' + GN.esc(GN.t('totalCost')) + '</th><th></th></tr></thead><tbody>';
    eq.forEach(function(e, i){
      var statusChip = e.received
        ? '<span class="chip ok"><span class="dot"></span>' + GN.esc(GN.t('received')) + '</span>'
        : '<span class="chip n"><span class="dot"></span>' + GN.esc(GN.t('priceEstimate')) + '</span>';
      html += '<tr data-notif-id="' + GN.escAttr(e.id || '') + '"><td><b>' + GN.esc(e.name || '-') + '</b>' +
        (e.model ? '<div style="font-size:11.5px;color:var(--ink-2)">' + GN.esc(e.model) + '</div>' : '') + '</td>' +
        '<td>' + GN.esc(e.category || '-') + '</td>' +
        '<td class="num">' + GN.formatMoneyPlain(e.expected_price, 'USD') + '</td>' +
        '<td>' + statusChip + '</td>' +
        '<td class="num">' + (e.total_cost ? GN.formatMoneyPlain(e.total_cost, 'USD') : '-') + '</td>' +
        '<td class="actions">' + GN.dh.actions([
          { act:'edit-eq', idx:i, icon:ICO_EDIT, title:GN.t('edit') },
          { act:'del-eq',  idx:i, icon:ICO_DEL,  title:GN.t('delete'), danger:true }
        ]) + '</td></tr>';
    });
    html += '</tbody></table></div>';
  }
  html += '</div>';

  html += '<div class="card"><div class="card-head"><h3>' + GN.navIcon('tool') + ' ' + GN.esc(GN.t('maintenance')) + '</h3>' +
    '<button class="btn btn-pri btn-sm" data-act="add-maint">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg> ' +
      GN.esc(GN.t('addMaintenance')) + '</button></div>';

  if (!maint.length){
    html += '<div class="empty"><div class="ic">' + GN.navIcon('tool') + '</div><h4>' + GN.esc(GN.t('noData')) + '</h4></div>';
  } else {
    html += '<div class="table-wrap"><table><thead><tr>' +
      '<th>' + GN.esc(GN.t('date')) + '</th>' +
      '<th>' + GN.esc(GN.t('equipmentName')) + '</th>' +
      '<th>' + GN.esc(GN.t('problemDescription')) + '</th>' +
      '<th>' + GN.esc(GN.t('totalCost')) + '</th><th></th></tr></thead><tbody>';
    maint.forEach(function(m, i){
      html += '<tr data-notif-id="' + GN.escAttr(m.id || '') + '">' +
        '<td>' + GN.esc(GN.formatDate(m.date)) + '</td>' +
        '<td>' + GN.esc(m.equipment || '-') + '</td>' +
        '<td>' + GN.esc(m.problem || '-') + '</td>' +
        '<td class="num">' + GN.formatMoneyPlain(m.cost, m.currency || 'USD') + '</td>' +
        '<td class="actions">' + GN.dh.actions([
          { act:'edit-maint', idx:i, icon:ICO_EDIT, title:GN.t('edit') },
          { act:'del-maint',  idx:i, icon:ICO_DEL,  title:GN.t('delete'), danger:true }
        ]) + '</td></tr>';
    });
    html += '</tbody></table></div>';
  }
  html += '</div>';

  return html;
};

GN.bindSection.equipment = function(){
  GN.bindAction('add-eq',  function(){ GN.openEqForm(-1); });
  GN.bindAction('edit-eq', function(btn){ GN.openEqForm(+btn.getAttribute('data-idx')); });
  GN.bindAction('del-eq',  function(btn){
    var idx = +btn.getAttribute('data-idx');
    var item = GN.dh.list('equipment')[idx];
    GN.dh.askDelete().then(function(ok){
      if (ok){
        if (item && item.id) GN.notify.markDeleted('equipment', 'equipment', item.id);
        GN.dh.list('equipment').splice(idx, 1);
        GN.dh.save();
      }
    });
  });
  GN.bindAction('add-maint',  function(){ GN.openMaintForm(-1); });
  GN.bindAction('edit-maint', function(btn){ GN.openMaintForm(+btn.getAttribute('data-idx')); });
  GN.bindAction('del-maint',  function(btn){
    var idx = +btn.getAttribute('data-idx');
    var item = GN.dh.list('maintenance')[idx];
    GN.dh.askDelete().then(function(ok){
      if (ok){
        if (item && item.id) GN.notify.markDeleted('equipment', 'maintenance', item.id);
        GN.dh.list('maintenance').splice(idx, 1);
        GN.dh.save();
      }
    });
  });
};

/* ============================================================
   HR Forms
   ============================================================ */
GN.openDeptForm = function(idx){
  if (!GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  var arr = GN.dh.list('departments');
  var item = idx >= 0 ? arr[idx] : { name:'' };

  GN.openForm('addDepartment', [
    { id:'name', label: GN.t('name'), req:true, value:item.name || '' }
  ]);

  GN.onSubmit(function(done){
    var v = GN.readForm(['name']);
    if (!v.name){ GN.toast(GN.t('fieldRequired'), 'bad'); done(false); return; }
    var isNew = idx < 0;
    var obj = { name: v.name, id: idx >= 0 ? arr[idx].id : GN.uid() };
    if (idx >= 0) Object.assign(arr[idx], obj);
    else arr.push(obj);
    if (isNew){
      GN.notify.send({
        type:'add', section:'hr', target:'department', target_id: obj.id,
        title: GN.t('notifAdd') + ' · ' + GN.t('departments'),
        body: GN.t('addDepartment') + ': ' + v.name
      });
    }
    done(true);
  });
};

GN.openEmpForm = function(idx){
  if (!GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  var arr = GN.dh.list('employees');
  var deps = GN.dh.list('departments');
  var item = idx >= 0 ? arr[idx] : {};
  var depOptions = [{ value:'', label:'-' }].concat(deps.map(function(x){ return { value:x.name, label:x.name }; }));

  var statusOptions = [];
  var st = (window.GN_CONST && window.GN_CONST.EMP_STATUS) || {};
  for (var k in st) statusOptions.push({ value:k, label: st[k].ar });

  GN.openForm('addEmployee', [
    { id:'name',        label: GN.t('fullName'),            req:true, full:true, value:item.name || '' },
    { id:'department',  label: GN.t('department'),          type:'select', options:depOptions, value:item.department || '' },
    { id:'role',        label: GN.t('jobTitle'),            value:item.role || '' },
    { id:'phone',       label: GN.t('contactPhoneLabel'),   dir:'ltr', value:item.phone || '' },
    { id:'nationality', label: GN.t('nationality'),         value:item.nationality || '' },
    { id:'passport',    label: GN.t('passportNumber'),      dir:'ltr', value:item.passport || '' },
    { id:'salary',      label: GN.t('baseSalary') + ' (SDG)', type:'number', value:item.salary || 0 },
    { id:'allowances',  label: GN.t('allowances') + ' (SDG)', type:'number', value:item.allowances || 0 },
    { id:'hire_date',   label: GN.t('hireDate'),            type:'date', value:item.hire_date || GN.today() },
    { id:'status',      label: GN.t('status'),              type:'select', options:statusOptions, value:item.status || 'active' }
  ]);

  GN.onSubmit(function(done){
    var v = GN.readForm(['name','department','role','phone','nationality','passport','salary','allowances','hire_date','status']);
    if (!v.name){ GN.toast(GN.t('fieldRequired'), 'bad'); done(false); return; }
    var isNew = idx < 0;
    var obj = {
      id: isNew ? GN.uid() : arr[idx].id,
      name: v.name,
      department: v.department,
      role: v.role,
      phone: v.phone,
      nationality: v.nationality,
      passport: v.passport,
      salary: Number(v.salary) || 0,
      allowances: Number(v.allowances) || 0,
      hire_date: v.hire_date,
      status: v.status,
      currency: 'SDG'
    };
    if (idx >= 0) Object.assign(arr[idx], obj);
    else arr.push(obj);
    if (isNew){
      GN.notify.send({
        type:'add', section:'hr', target:'employee', target_id: obj.id,
        title: GN.t('notifAdd') + ' · ' + GN.t('employees'),
        body: GN.t('addEmployee') + ': ' + v.name
      });
    }
    done(true);
  });
};

GN.openEndEmpForm = function(idx){
  if (!GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  var arr = GN.dh.list('employees');
  var item = arr[idx];
  if (!item) return;

  GN.openForm('endEmployee', [
    { id:'status',     label: GN.t('status'),    type:'select',
      options:[{ value:'resigned', label: GN.t('resigned') }, { value:'fired', label: GN.t('fired') }],
      value:'resigned' },
    { id:'end_date',   label: GN.t('endDate'),   type:'date', value:GN.today() },
    { id:'end_reason', label: GN.t('endReason'), type:'textarea', full:true }
  ]);

  GN.onSubmit(function(done){
    var v = GN.readForm(['status','end_date','end_reason']);
    item.status = v.status;
    item.end_date = v.end_date;
    item.end_reason = v.end_reason;
    done(true);
  });
};

GN.openTaskForm = function(idx){
  if (!GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  var arr = GN.dh.list('tasks');
  var emps = GN.dh.list('employees');
  var item = idx >= 0 ? arr[idx] : {};

  var assigneeOptions = [{ value:'', label:'-' }, { value:'__me', label: GN.t('assigneeMe') }]
    .concat(emps.map(function(e){ return { value: e.id, label: e.name }; }));

  var stOptions = [];
  var ts = (window.GN_CONST && window.GN_CONST.TASK_STATUS) || {};
  for (var k in ts) stOptions.push({ value:k, label: ts[k].ar });

  var prOptions = [];
  var pr = (window.GN_CONST && window.GN_CONST.TASK_PRIORITY) || {};
  for (var k2 in pr) prOptions.push({ value:k2, label: pr[k2].ar });

  GN.openForm('addTask', [
    { id:'title',       label: GN.t('taskTitle'),   req:true, full:true, value:item.title || '' },
    { id:'description', label: GN.t('description'), type:'textarea', full:true, value:item.description || '' },
    { id:'assignee',    label: GN.t('assignee'),    type:'select', options:assigneeOptions, value:item.assignee || '' },
    { id:'status',      label: GN.t('status'),      type:'select', options:stOptions, value:item.status || 'new' },
    { id:'priority',    label: GN.t('priority'),    type:'select', options:prOptions, value:item.priority || 'normal' },
    { id:'start_date',  label: GN.t('startDate'),   type:'date', value:item.start_date || GN.today() },
    { id:'due_date',    label: GN.t('dueDate'),     type:'date', value:item.due_date || '' }
  ]);

  GN.onSubmit(function(done){
    var v = GN.readForm(['title','description','assignee','status','priority','start_date','due_date']);
    if (!v.title){ GN.toast(GN.t('fieldRequired'), 'bad'); done(false); return; }

    var assigneeName = '';
    if (v.assignee === '__me'){
      assigneeName = (GN.session.profile && GN.session.profile.full_name) || 'Me';
    } else {
      var emp = emps.filter(function(e){ return e.id === v.assignee; })[0];
      if (emp) assigneeName = emp.name;
    }

    var isNew = idx < 0;
    var obj = {
      id: isNew ? GN.uid() : arr[idx].id,
      title: v.title,
      description: v.description,
      assignee: v.assignee,
      assignee_name: assigneeName,
      status: v.status,
      priority: v.priority,
      start_date: v.start_date,
      due_date: v.due_date,
      updated_at: GN.now()
    };
    if (idx >= 0) Object.assign(arr[idx], obj);
    else { obj.code = GN.genCode('TASK', arr); obj.created_at = GN.now(); arr.push(obj); }
    if (isNew){
      GN.notify.send({
        type:'add', section:'tasks', target:'task', target_id: obj.id,
        title: GN.t('notifAdd') + ' · ' + GN.t('navTasks'),
        body: GN.t('addTask') + ': ' + v.title
      });
    }
    done(true);
  });
};

GN.openEqForm = function(idx){
  if (!GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  var arr = GN.dh.list('equipment');
  var item = idx >= 0 ? arr[idx] : {};

  GN.openForm('addEquipment', [
    { id:'name',           label: GN.t('equipmentName'), req:true, full:true, value:item.name || '' },
    { id:'model',          label: GN.t('model'),         value:item.model || '' },
    { id:'category',       label: GN.t('category'),      value:item.category || '' },
    { id:'expected_price', label: GN.t('expectedPrice') + ' (USD)', type:'number', value:item.expected_price || 0 },
    { id:'total_cost',     label: GN.t('totalCost') + ' (USD)',     type:'number', value:item.total_cost || 0 },
    { id:'notes',          label: GN.t('notes'), type:'textarea', full:true, value:item.notes || '' }
  ]);

  GN.onSubmit(function(done){
    var v = GN.readForm(['name','model','category','expected_price','total_cost','notes']);
    if (!v.name){ GN.toast(GN.t('fieldRequired'), 'bad'); done(false); return; }
    var isNew = idx < 0;
    var obj = {
      id: isNew ? GN.uid() : arr[idx].id,
      name: v.name,
      model: v.model,
      category: v.category,
      expected_price: Number(v.expected_price) || 0,
      total_cost: Number(v.total_cost) || 0,
      notes: v.notes,
      received: Number(v.total_cost) > 0
    };
    if (idx >= 0) Object.assign(arr[idx], obj);
    else arr.push(obj);
    if (isNew){
      GN.notify.send({
        type:'add', section:'equipment', target:'equipment', target_id: obj.id,
        title: GN.t('notifAdd') + ' · ' + GN.t('navEquipment'),
        body: GN.t('addEquipment') + ': ' + v.name
      });
    }
    done(true);
  });
};

GN.openMaintForm = function(idx){
  if (!GN.session.isAdmin){ GN.toast(GN.t('readOnlyNotice'), 'bad'); return; }
  var arr = GN.dh.list('maintenance');
  var eq = GN.dh.list('equipment');
  var item = idx >= 0 ? arr[idx] : {};
  var eqOptions = eq.map(function(e){ return { value: e.name, label: e.name }; });

  GN.openForm('addMaintenance', [
    { id:'equipment', label: GN.t('equipmentName'), type:'select', options:eqOptions, value:item.equipment || '' },
    { id:'date',      label: GN.t('date'), type:'date', value:item.date || GN.today() },
    { id:'problem',   label: GN.t('problemDescription'), type:'textarea', full:true, value:item.problem || '' },
    { id:'cost',      label: GN.t('totalCost'), type:'number', value:item.cost || 0 }
  ]);

  GN.onSubmit(function(done){
    var v = GN.readForm(['equipment','date','problem','cost']);
    var isNew = idx < 0;
    var obj = {
      id: isNew ? GN.uid() : arr[idx].id,
      equipment: v.equipment,
      date: v.date,
      problem: v.problem,
      cost: Number(v.cost) || 0,
      currency: 'USD'
    };
    if (idx >= 0) Object.assign(arr[idx], obj);
    else arr.push(obj);
    if (isNew){
      GN.notify.send({
        type:'add', section:'equipment', target:'maintenance', target_id: obj.id,
        title: GN.t('notifAdd') + ' · ' + GN.t('maintenance'),
        body: GN.t('addMaintenance') + ': ' + v.equipment
      });
    }
    done(true);
  });
};

console.log('[Gold Nile] dashboard/05-hr-tasks-equip.js loaded');
})();