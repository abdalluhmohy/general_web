/* Gold Nile - Utilities v1.0.0 */
(function(){
  'use strict';

  var GN = window.GN = window.GN || {};

  /* ============================================================
     DOM
     ============================================================ */
  GN.$  = function(sel, root){ return (root || document).querySelector(sel); };
  GN.$$ = function(sel, root){ return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  GN.el = function(tag, attrs, children){
    var el = document.createElement(tag);
    if (attrs) {
      for (var k in attrs) {
        var v = attrs[k];
        if (k === 'class') el.className = v;
        else if (k === 'html') el.innerHTML = v;
        else if (k === 'text') el.textContent = v;
        else if (k === 'style' && typeof v === 'object') {
          for (var s in v) el.style[s] = v[s];
        }
        else if (k.indexOf('on') === 0 && typeof v === 'function') {
          el.addEventListener(k.slice(2).toLowerCase(), v);
        }
        else if (v === true) el.setAttribute(k, '');
        else if (v === false || v == null) continue;
        else el.setAttribute(k, v);
      }
    }
    if (children) {
      if (!Array.isArray(children)) children = [children];
      children.forEach(function(c){
        if (c == null) return;
        el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
      });
    }
    return el;
  };

  /* ============================================================
     Escape
     ============================================================ */
  GN.esc = function(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];
    });
  };
  GN.escAttr = GN.esc;

  /* ============================================================
     Numbers & Currency
     ============================================================ */
  GN.nf  = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
  GN.nf2 = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });

  GN.formatNum = function(n, decimals){
    if (n == null || isNaN(n)) return '-';
    var fmt = decimals === 2 ? GN.nf2 : GN.nf;
    return fmt.format(n);
  };

  /**
   * إرجاع رمز العملة من الكود (SDG → ج.س)
   * @param {string} code
   * @returns {string}
   */
  GN.currencySymbol = function(code){
    var cur = code || 'USD';
    var list = (window.GN_CONST && window.GN_CONST.CURRENCIES) || [];
    var found = list.filter(function(x){ return x.code === cur; })[0];
    return found ? found.symbol : cur;
  };

  GN.formatMoney = function(n, currency){
    if (n == null || isNaN(n)) return '-';
    var symbol = GN.currencySymbol(currency || 'USD');
    return '<bdi class="num">' + GN.nf2.format(n) + '</bdi> <span class="cur">' + symbol + '</span>';
  };

  GN.formatMoneyPlain = function(n, currency){
    if (n == null || isNaN(n)) return '-';
    var symbol = GN.currencySymbol(currency || 'USD');
    return GN.nf2.format(n) + ' ' + symbol;
  };

  GN.parseNum = function(v){
    if (v === '' || v == null) return null;
    var n = Number(String(v).replace(/,/g, ''));
    return isFinite(n) ? n : null;
  };

  /* ============================================================
     Dates
     ============================================================ */
  GN.today = function(){ return new Date().toISOString().slice(0, 10); };
  GN.now = function(){ return new Date().toISOString(); };

  GN.formatDate = function(d, lang){
    if (!d) return '-';
    try {
      var dt = typeof d === 'string' ? new Date(d) : d;
      if (isNaN(dt.getTime())) return String(d);
      var l = lang || GN.lang || 'ar';
      var loc = l === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB';
      return dt.toLocaleDateString(loc, { year:'numeric', month:'short', day:'numeric' });
    } catch (e) { return String(d); }
  };

  GN.formatDateTime = function(d, lang){
    if (!d) return '-';
    try {
      var dt = typeof d === 'string' ? new Date(d) : d;
      if (isNaN(dt.getTime())) return String(d);
      var l = lang || GN.lang || 'ar';
      var loc = l === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB';
      return dt.toLocaleString(loc, { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
    } catch (e) { return String(d); }
  };

  GN.relativeTime = function(d, lang){
    if (!d) return '';
    try {
      var dt = typeof d === 'string' ? new Date(d) : d;
      var diff = (Date.now() - dt.getTime()) / 1000;
      var l = lang || GN.lang || 'ar';
      if (diff < 60) return l === 'ar' ? 'الآن' : 'Just now';
      if (diff < 3600) {
        var m = Math.floor(diff / 60);
        return l === 'ar' ? m + ' دقيقة' : m + 'm ago';
      }
      if (diff < 86400) {
        var h = Math.floor(diff / 3600);
        return l === 'ar' ? h + ' ساعة' : h + 'h ago';
      }
      if (diff < 2592000) {
        var dd = Math.floor(diff / 86400);
        return l === 'ar' ? dd + ' يوم' : dd + 'd ago';
      }
      return GN.formatDate(dt, l);
    } catch (e) { return ''; }
  };

  GN.daysBetween = function(d1, d2){
    var a = new Date(d1), b = new Date(d2);
    return Math.round((b - a) / 86400000);
  };

  GN.daysLeft = function(endDate){
    if (!endDate) return null;
    return GN.daysBetween(new Date(), new Date(endDate));
  };

  GN.monthKey = function(d){
    var dt = d ? new Date(d) : new Date();
    return dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0');
  };

  GN.monthName = function(key, lang){
    if (!key) return '';
    var parts = key.split('-');
    var y = Number(parts[0]), m = Number(parts[1]);
    var dt = new Date(y, m - 1, 1);
    var l = lang || GN.lang || 'ar';
    var loc = l === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB';
    return dt.toLocaleDateString(loc, { year:'numeric', month:'long' });
  };

  /* ============================================================
     IDs & Codes
     ============================================================ */
  GN.uid = function(){
    if (window.crypto && window.crypto.randomUUID) return crypto.randomUUID();
    return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
  };

  GN.genCode = function(prefix, existing, digits){
    digits = digits || 4;
    var year = new Date().getFullYear();
    var list = (existing || []).filter(function(x){ return x && x.code && x.code.indexOf(prefix) === 0; });
    var max = 0;
    list.forEach(function(x){
      var num = parseInt(String(x.code).split('-').pop(), 10);
      if (num > max) max = num;
    });
    var next = String(max + 1).padStart(digits, '0');
    return prefix + '-' + year + '-' + next;
  };

  /* ============================================================
     Objects
     ============================================================ */
  GN.clone = function(obj){
    if (obj == null) return obj;
    if (typeof structuredClone === 'function') return structuredClone(obj);
    return JSON.parse(JSON.stringify(obj));
  };

  GN.getPath = function(obj, path){
    return path.split('.').reduce(function(o, k){ return o == null ? o : o[k]; }, obj);
  };

  GN.setPath = function(obj, path, val){
    var keys = path.split('.');
    var last = keys.pop();
    var target = keys.reduce(function(o, k){
      if (o[k] == null) o[k] = {};
      return o[k];
    }, obj);
    target[last] = val;
  };

  GN.delPath = function(obj, path){
    var keys = path.split('.');
    var last = keys.pop();
    var target = keys.reduce(function(o, k){ return o == null ? o : o[k]; }, obj);
    if (target) delete target[last];
  };

  GN.mergeDeep = function(target, source){
    if (!source) return target;
    for (var k in source) {
      if (source[k] && typeof source[k] === 'object' && !Array.isArray(source[k])) {
        target[k] = GN.mergeDeep(target[k] || {}, source[k]);
      } else {
        target[k] = source[k];
      }
    }
    return target;
  };

  GN.sortBy = function(arr, key, dir){
    var d = dir === 'desc' ? -1 : 1;
    return (arr || []).slice().sort(function(a, b){
      var av = GN.getPath(a, key), bv = GN.getPath(b, key);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * d;
      return String(av).localeCompare(String(bv), 'ar') * d;
    });
  };

  GN.groupBy = function(arr, key){
    var out = {};
    (arr || []).forEach(function(item){
      var k = typeof key === 'function' ? key(item) : GN.getPath(item, key);
      if (!out[k]) out[k] = [];
      out[k].push(item);
    });
    return out;
  };

  GN.sum = function(arr, key){
    return (arr || []).reduce(function(s, item){
      var v = typeof key === 'function' ? key(item) : GN.getPath(item, key);
      return s + (Number(v) || 0);
    }, 0);
  };

  /* ============================================================
     Local Storage
     ============================================================ */
  GN.ls = {
    get: function(key, def){
      try {
        var v = localStorage.getItem(key);
        return v == null ? def : JSON.parse(v);
      } catch (e) { return def; }
    },
    set: function(key, val){
      try { localStorage.setItem(key, JSON.stringify(val)); return true; }
      catch (e) { return false; }
    },
    del: function(key){
      try { localStorage.removeItem(key); return true; }
      catch (e) { return false; }
    }
  };

  /* ============================================================
     Timing
     ============================================================ */
  GN.debounce = function(fn, ms){
    var t;
    return function(){
      var args = arguments, ctx = this;
      clearTimeout(t);
      t = setTimeout(function(){ fn.apply(ctx, args); }, ms || 300);
    };
  };

  GN.throttle = function(fn, ms){
    var last = 0;
    return function(){
      var now = Date.now();
      if (now - last >= ms) {
        last = now;
        fn.apply(this, arguments);
      }
    };
  };

  /* ============================================================
     Validation
     ============================================================ */
  GN.isEmail = function(s){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || '').trim());
  };

  GN.isURL = function(s){
    s = String(s || '').trim();
    if (!s) return false;
    try {
      var u = new URL(s);
      return u.protocol === 'https:' || u.protocol === 'http:';
    } catch (e) { return false; }
  };

  GN.isPhone = function(s){
    return /^[+\d][\d\s\-()]{6,}$/.test(String(s || '').trim());
  };

  GN.safeDocURL = function(s){
    s = String(s || '').trim();
    if (!s) return null;
    if (/^(javascript|vbscript|blob|data):/i.test(s)) return null;
    if (!GN.isURL(s)) return null;
    return s;
  };

  /* ============================================================
     Colors & Initials
     ============================================================ */
  GN.randomColor = function(){
    var colors = ['#1E6B67','#C79A3D','#2B7A55','#B33A2A','#8C6A1F','#3E8C86','#5FA19C'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  /**
   * استخراج أول حرف من الاسم (يعمل مع العربية والإنجليزية)
   */
  GN.initial = function(name){
    if (name == null) return '?';
    var s = String(name).trim();
    if (!s) return '?';
    // استخدام Array.from للتعامل الصحيح مع الحروف العربية والـ emojis
    var chars = Array.from(s);
    return chars[0].toUpperCase();
  };

  /* ============================================================
     Download
     ============================================================ */
  GN.download = function(filename, content, mime){
    var blob = new Blob([content], { type: mime || 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
  };

  GN.downloadJSON = function(filename, obj){
    GN.download(filename, JSON.stringify(obj, null, 2), 'application/json;charset=utf-8');
  };

  GN.downloadCSV = function(filename, rows){
    var csv = rows.map(function(row){
      return row.map(function(cell){
        return '"' + String(cell == null ? '' : cell).replace(/"/g, '""') + '"';
      }).join(',');
    }).join('\r\n');
    GN.download(filename, '\ufeff' + csv, 'text/csv;charset=utf-8');
  };

  /* ============================================================
     Clipboard
     ============================================================ */
  GN.copyText = function(text){
    return new Promise(function(resolve){
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function(){ resolve(true); }, function(){ fallback(); });
      } else { fallback(); }
      function fallback(){
        try {
          var ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          ta.remove();
          resolve(true);
        } catch (e) { resolve(false); }
      }
    });
  };

  /* ============================================================
     Modals
     ============================================================ */
  GN.openModal = function(id){
    var el = document.getElementById(id);
    if (!el) return;
    el.classList.add('on');
    document.body.style.overflow = 'hidden';
  };

  GN.closeModal = function(id){
    var el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('on');
    if (!document.querySelector('.overlay.on')) document.body.style.overflow = '';
  };

  GN.closeAllModals = function(){
    var open = document.querySelectorAll('.overlay.on');
    for (var i = 0; i < open.length; i++) open[i].classList.remove('on');
    document.body.style.overflow = '';
  };

  /* ============================================================
     Toast
     ============================================================ */
  var toastTimer;
  GN.toast = function(msg, type){
    var el = document.getElementById('toast');
    var msgEl = document.getElementById('toastMsg');
    if (!el || !msgEl) { console.log('[toast]', msg); return; }
    msgEl.textContent = msg;
    el.className = 'toast ' + (type || '');
    el.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ el.classList.remove('on'); }, 2800);
  };

  /* ============================================================
     Loading
     ============================================================ */
  GN.showLoading = function(text){
    var el = document.getElementById('loadingOverlay');
    var txt = document.getElementById('loadingText');
    if (!el) return;
    if (txt && text) txt.textContent = text;
    el.hidden = false;
  };

  GN.hideLoading = function(){
    var el = document.getElementById('loadingOverlay');
    if (el) el.hidden = true;
  };

  /* ============================================================
     Confirm Dialog
     ============================================================ */
  GN.confirm = function(opts){
    return new Promise(function(resolve){
      var modal = document.getElementById('confirmModal');
      var title = document.getElementById('confirmTitle');
      var text = document.getElementById('confirmText');
      var okBtn = document.getElementById('confirmOk');
      var cancelBtn = document.getElementById('confirmCancel');
      var icon = document.getElementById('confirmIcon');
      if (!modal) { resolve(window.confirm((opts && opts.text) || 'Are you sure?')); return; }
      var o = Object.assign({
        title: 'Confirm',
        text: 'Are you sure?',
        okText: 'Yes',
        cancelText: 'Cancel',
        danger: true
      }, opts || {});
      title.textContent = o.title;
      text.textContent = o.text;
      okBtn.textContent = o.okText;
      cancelBtn.textContent = o.cancelText;
      icon.className = 'modal-icon ' + (o.danger ? 'bad' : 'ok');
      modal.classList.add('on');
      document.body.style.overflow = 'hidden';
      function cleanup(result){
        modal.classList.remove('on');
        if (!document.querySelector('.overlay.on')) document.body.style.overflow = '';
        okBtn.removeEventListener('click', onOk);
        cancelBtn.removeEventListener('click', onCancel);
        modal.removeEventListener('click', onBg);
        resolve(result);
      }
      function onOk(){ cleanup(true); }
      function onCancel(){ cleanup(false); }
      function onBg(e){ if (e.target === modal) cleanup(false); }
      okBtn.addEventListener('click', onOk);
      cancelBtn.addEventListener('click', onCancel);
      modal.addEventListener('click', onBg);
    });
  };

  /* ============================================================
     Ready
     ============================================================ */
  GN.ready = function(fn){
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else { fn(); }
  };

  /* ============================================================
     Dates init (set today on empty date inputs)
     ============================================================ */
  GN.initDates = function(root){
    var inputs = (root || document).querySelectorAll('input[type="date"]');
    for (var i = 0; i < inputs.length; i++) {
      if (!inputs[i].value) inputs[i].value = GN.today();
    }
  };

  /* ============================================================
     File readers
     ============================================================ */
  GN.readFile = function(file){
    return new Promise(function(resolve, reject){
      var reader = new FileReader();
      reader.onload = function(e){ resolve(e.target.result); };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  GN.readFileText = function(file){
    return new Promise(function(resolve, reject){
      var reader = new FileReader();
      reader.onload = function(e){ resolve(e.target.result); };
      reader.onerror = reject;
      reader.readAsText(file, 'utf-8');
    });
  };

  /* ============================================================
     Scroll
     ============================================================ */
  GN.scrollTo = function(sel, offset){
    var el = document.querySelector(sel);
    if (!el) return;
    var top = el.getBoundingClientRect().top + window.scrollY - (offset || 90);
    window.scrollTo({ top: top, behavior: 'smooth' });
  };

  console.log('[Gold Nile] utils.js loaded');

})();