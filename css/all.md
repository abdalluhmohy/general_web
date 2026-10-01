
# Gold Nile — دليل المشروع الشامل
# Zaheb Alnile — Complete Project Guide

> **الغرض من هذا الملف:** أن يُعطى لأي مطوّر أو وكيل ذكي (AI) ليفهم المشروع كاملًا من أول قراءة دون الحاجة لتفحيص كل ملف.

**آخر تحديث:** 2026
**الإصدار:** 1.0.0
**حالة المشروع:** يعمل في الإنتاج (Render + Supabase)

---

## 1. نظرة عامة

### 1.1 ما هو المشروع؟
نظام ويب داخلي لشركة سودانية اسمها **ذهب النيل للأعمال المتكاملة المحدودة**، متخصصة في:
- فحص الذهب والمعادن (أجهزة فيشر 520)
- البيع والشراء
- تقنيات الذكاء الاصطناعي في التعدين

### 1.2 الغرض
- **موقع عام** (Public Site): عرض الشركة، خدماتها، مجلس الإدارة، الأخبار، التواصل.
- **لوحة تحكم** (Dashboard): إدارة كاملة لكل عمليات الشركة (مالية، بنوك، ذهب، HR، معدات، مستندات، مستخدمون، موقع).

### 1.3 الجمهور المستهدف
- **المالك (Owner):** أنت — يملك كل الصلاحيات.
- **الشركاء (Readers):** 4-5 أشخاص — صلاحية قراءة فقط.
- **الزوار:** لا يحتاجون تسجيل دخول للموقع العام.

### 1.4 نموذج التشغيل
- عدد المستخدمين: **صغير (5-10)**.
- لا تسجيل ذاتي (Self Sign-up معطّل تمامًا).
- المستخدمون يُنشؤون يدويًا من المالك.
- البيانات صغيرة نسبيًا (لكن تنمو).

---

## 2. المعمارية العامة

### 2.1 الطبقات
┌─────────────────────────────────────────────────────┐
│ المتصفح (Client) │
│ HTML · CSS · Vanilla JS (بدون build tools) │
└─────────────────┬───────────────────────────────────┘
│
│ HTTPS
▼
┌─────────────────────────────────────────────────────┐
│ Render (Python Static Server) │
│ app.py · Serves static files + 1 API endpoint │
└─────────────────┬───────────────────────────────────┘
│
│ HTTPS (REST + Realtime)
▼
┌─────────────────────────────────────────────────────┐
│ Supabase (Backend-as-a-Service) │
│ Auth · PostgreSQL · RLS · Storage │
└─────────────────────────────────────────────────────┘

text

### 2.2 التقنيات
| الطبقة | التقنية | السبب |
|---|---|---|
| Frontend | HTML/CSS/Vanilla JS | بساطة، لا build، مناسب لحجم المشروع |
| Backend | Python stdlib (http.server) | لا مكتبات خارجية، خفيف |
| Database | Supabase (PostgreSQL) | Auth + REST + RLS جاهزة |
| Hosting | Render | مجاني، يدعم Python |
| Charts | Chart.js (CDN) | تقارير بصرية |
| Fonts | Cairo · Reem Kufi | عربية جميلة |
| Icons | Inline SVG | لا اعتماد خارجي |

### 2.3 لماذا هذه المعمارية؟
- **بدون build tools:** يمكن تعديل الملفات مباشرة في الإنتاج.
- **Supabase بدل backend مخصص:** يوفر 90% من العمل.
- **Vanilla JS:** لا framework overhead على متصفحات بطيئة.
- **ملف واحد للمنطق (`app.py`):** بسيط، لا ORM، لا تعقيد.

---

## 3. بنية الملفات
gold-nile/
│
├── index.html ← نقطة الدخول (صفحة واحدة)
├── app.py ← سيرفر Python + endpoint إنشاء مستخدم
├── requirements.txt ← لا مكتبات (stdlib فقط)
├── supabase-schema.sql ← مخطط قاعدة البيانات
├── README.md ← توثيق مختصر
├── PROJECT.md ← هذا الملف
│
├── css/
│ └── styles.css ← كل الأنماط (~2700 سطر)
│
└── js/
├── config.js ← الإعدادات + البيانات الافتراضية
├── utils.js ← أدوات عامة
├── i18n.js ← الترجمة AR/EN
├── auth.js ← المصادقة + إدارة المستخدمين
├── public.js ← الموقع العام + التعديل المباشر
├── dashboard.js ← لوحة التحكم كاملة (~5000 سطر)
└── app.js ← نقطة الدخول

text

### 3.1 ترتيب التحميل (`index.html`)
```html
<script src="js/config.js"></script>     <!-- 1. الإعدادات -->
<script src="js/utils.js"></script>      <!-- 2. الأدوات -->
<script src="js/i18n.js"></script>       <!-- 3. الترجمة -->
<script src="js/auth.js"></script>       <!-- 4. المصادقة -->
<script src="js/public.js"></script>     <!-- 5. الموقع العام -->
<script src="js/dashboard.js"></script>  <!-- 6. لوحة التحكم -->
<script src="js/app.js"></script>        <!-- 7. الإقلاع -->
مهم: الترتيب لا يمكن تغييره — كل ملف يعتمد على ما قبله.

4. تفصيل الملفات
4.1 index.html
الغرض: الصفحة الوحيدة (SPA بدون router).

المحتويات الرئيسية:

Splash Screen: شاشة بداية تختفي بعد التحميل.

#publicSite: الموقع العام (Header, Hero, Vision, Services, Advantages, Board, News, Social, Contact, CTA, Footer).

#dashboard: لوحة التحكم (Sidebar, Header, #dashContent, Drawer Overlay).

Modals: Login, Reader, Confirm, Form, Bank Details.

Notifications Panel: لوحة جانبية للإشعارات.

Toast & Loading Overlay: عناصر عامة.

نمط التحكم بالعرض:

#publicSite[hidden] = مخفي.

#dashboard[hidden] = مخفي.

body.public-view = تفعيل Dark Luxe.

body.admin-on = تفعيل وضع التعديل.

4.2 app.py
الغرض: سيرفر Python يخدم الملفات الثابتة + endpoint واحد.

نقاط النهاية:

GET /* → خدمة الملفات الثابتة.

POST /api/admin/create-user → إنشاء مستخدم جديد (يتطلب Bearer token + Owner).

متغيرات البيئة المطلوبة:

text
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
PORT=10000  (اختياري)
رؤوس الأمان المضافة:

X-Content-Type-Options: nosniff

X-Frame-Options: SAMEORIGIN

Referrer-Policy: strict-origin-when-cross-origin

Permissions-Policy: geolocation=(), microphone=(), camera=()

ملاحظة: endpoint لا يُستخدم حاليًا من الواجهة (الواجهة تستخدم signUp مباشرة). سيُربط لاحقًا عبر API_URL في config.js.

4.3 supabase-schema.sql
الغرض: إنشاء قاعدة البيانات كاملة (Idempotent — آمن لإعادة التشغيل).

الجداول:

الجدول	الغرض
profiles	مستخدمو النظام (Auth + Role + Status)
dashboard_state	كل بيانات الموقع في JSON واحد (id=1)
employees	مزامنة الموظفين (للتقارير الخارجية)
transactions	المعاملات المالية (يُستخدم من الواجهة)
payment_orders	الاستحقاقات والمدفوعات (يُستخدم من الواجهة)
suggestions	المقترحات والتصويت (يُستخدم من الواجهة)
دوال الصلاحيات:

is_owner() → تحقق أن المستخدم مالك مفعّل.

is_allowed_reader() → تحقق أن المستخدم مفعّل (أي دور).

الـ Trigger:

on_auth_user_created_goldnile → عند إنشاء مستخدم في auth.users، يُنشأ profile بحالة pending.

سياسات RLS:

profiles: المالك يرى الكل، كل مستخدم يرى نفسه.

dashboard_state: القراءة لكل مستخدم مفعّل، الكتابة للمالك فقط.

employees: نفس النمط.

4.4 css/styles.css
الغرض: كل الأنماط.

البنية (4 أجزاء + Hotfixes):

Part 1: Variables, Reset, Utilities, Splash, Header, Hero, Sections, Vision, Services, Advantages, Board, News, Social, Contact, CTA, Footer.

Part 2: Admin Mode, Modals, Notifications Panel, Toast, Loading, Dashboard Structure.

Part 3: Dashboard Components (KPI, Cards, Tables, Chips, Forms, Finance, Banking, Payables, Docs, Suggestions, Website).

Part 4: Dark Luxe Theme, Reader Mode, Mobile Responsive.

Hotfix 3: Drawer + Bottom Nav Removal + Hamburger + Notifications.

Hotfix 4: Notification Panel flexible height.

متغيرات CSS الأساسية:

css
--bg, --bg-alt, --paper, --paper-2
--ink, --ink-2, --ink-3, --ink-4
--line, --line-2, --line-3
--nile, --nile-d, --nile-l       /* الأخضر النيلي */
--gold, --gold-d, --gold-l       /* الذهبي */
--ok, --bad, --warn              /* حالات */
--shadow-xs, --shadow-sm, ...
--ease
Dark Luxe Theme: يُفعَّل عبر body.public-view ويعيد تعريف كل المتغيرات بألوان داكنة.

4.5 js/config.js
الغرض: الإعدادات العامة.

المحتوى:

window.GN_CONFIG: Supabase URL/Key، API_URL، APP_NAME، VERSION، STORAGE keys، CURRENCIES.

window.GN_DEFAULT_DATA: البيانات الافتراضية (Settings، Public، Dashboard structure).

window.GN_CONST: ثوابت (EMP_STATUS، TASK_STATUS، LICENSE_STATUS، SOCIALS، CURRENCIES).

تحقق أولي: عند التحميل، يتحقق من صحة SUPABASE_URL و SUPABASE_KEY ويحذّر في الـ console.

4.6 js/utils.js
الغرض: دوال مساعدة عامة.

التصنيفات:

DOM: $, $$, el

Escape: esc, escAttr

Numbers: formatNum, formatMoney, formatMoneyPlain, currencySymbol, parseNum

Dates: today, now, formatDate, formatDateTime, relativeTime, daysBetween, monthKey, monthName

IDs: uid, genCode

Objects: clone, getPath, setPath, delPath, mergeDeep, sortBy, groupBy, sum

Storage: ls.get, ls.set, ls.del

Timing: debounce, throttle

Validation: isEmail, isURL, isPhone, safeDocURL

Colors: randomColor, initial

Download: download, downloadJSON, downloadCSV

Clipboard: copyText

Modals: openModal, closeModal, closeAllModals

Toast & Loading: toast, showLoading, hideLoading

Confirm: confirm (Promise-based)

Ready: ready

Files: readFile, readFileText

Scroll: scrollTo

4.7 js/i18n.js
الغرض: الترجمة AR/EN.

البنية:

GN.i18n.ar: كل نصوص عربية (~500 مفتاح).

GN.i18n.en: كل نصوص إنجليزية.

الدوال:

GN.t(key) → ترجمة مفتاح.

GN.setLang(lang) → تغيير اللغة + حفظ + إعادة تطبيق.

GN.applyTranslations() → يمر على [data-i18n], [data-i18n-html], [data-i18n-placeholder], [data-i18n-title].

GN.toggleLang() → تبديل AR ↔ EN.

مفاتيح مهمة:

Navigation: navHome, navFinance, navBanking, navGold, navPayables, navHR, navTasks, navEquipment, navDocs, navWebsite, navUsers, navSettings, navSuggestions.

Groups: groupMain, groupFinance, groupHR, groupOps, groupAdmin.

Notifications: notifAdd, notifTransferIn, notifTransferOut, notifItemDeleted.

Payables: payTitle, payAdd, payPending, payApproved, payPaid, payCancelled, إلخ.

Banking: addBank, incomingTotal, outgoingTotal, consolidatedBalance.

4.8 js/auth.js
الغرض: المصادقة وإدارة المستخدمين.

يُصدّر:

GN.supa → Supabase client.

GN.session → { user, profile, isOwner, isAdmin, isLogged }.

الدوال:

GN.login(email, password) → تسجيل الدخول + جلب profile.

GN.logout() → تسجيل الخروج.

GN.bootstrapAuth() → استعادة الجلسة عند تحميل الصفحة.

GN.setAdminMode(on) → تبديل وضع الأدمن.

GN.toggleAdminMode() → عكس الوضع الحالي.

GN.addMember(email, password, fullName) → إنشاء مستخدم (Owner فقط).

مساران: _addMemberViaBackend (عبر API_URL) أو _addMemberViaSignUp (fallback).

GN.listProfiles() → جلب كل المستخدمين (Owner فقط).

GN.updateProfileStatus(authUserId, status) → تفعيل/حظر.

GN.updateProfileRole(authUserId, role) → تغيير الدور.

GN.resetUserPassword(email) → إعادة تعيين كلمة المرور.

منطق تسجيل الدخول:

signInWithPassword في Supabase.

جلب profile من جدول profiles.

التحقق من status:

pending → رفض + signOut.

blocked → رفض + signOut.

allowed → قبول.

تحديث login_count و last_login.

تعيين GN.session.

4.9 js/public.js
الغرض: الموقع العام + التعديل المباشر + التحميل/الحفظ.

الدوال الأساسية:

GN.loadPublicData() → جلب dashboard_state.data_json.

GN.savePublicData(data) → حفظ (Owner + Admin فقط).

GN.normalizeData(data) → دمج مع GN_DEFAULT_DATA.

GN.renderPublicPage(data) → رسم الصفحة كاملة.

دوال الرسم:

GN.renderServices(list)

GN.renderAdvantages(list)

GN.renderBoard(list) → بطاقات مع flags + edit/delete

GN.renderNews(list) → خبر رئيسي + أرشيف

GN.renderSocialLinks(social)

GN.renderContactInfo(contact)

التعديل المباشر (contenteditable):

GN.enableAdminEditing() → تفعيل contenteditable على [data-edit].

GN.disableAdminEditing() → إلغاء.

GN.bindEditEvents() → حفظ عند blur تلقائيًا.

الأيقونات:

GN.iconSvg(name) → أيقونات الخدمات والمزايا.

GN.socialSvg(name) → أيقونات السوشيال (SVG inline).

النماذج:

GN.openNewsForm(idx)

GN.openBoardMemberForm(idx) → من الموقع.

GN.openBoardManager() → قائمة إدارة.

GN.openWebsiteBoardForm(idx) → من الداشبورد.

GN.openWebsiteArticleForm(idx) → من الداشبورد.

4.10 js/dashboard.js
الغرض: لوحة التحكم كاملة (~5000 سطر).

البنية (5 أجزاء):

Part 1 — Core:

GN.dash → { current, data, notifs }

GN.navGroups → تصنيفات القائمة.

GN.navIcon(name) → أيقونات SVG.

GN.renderSidebar() → بناء القائمة الجانبية.

GN.renderUserChip() → اسم المستخدم + دوره.

GN.goTo(key) → التنقل.

GN.renderSection(key) → عرض قسم.

GN.sections = {} → كل قسم دالة.

GN.bindSection = {} → ربط الأزرار.

GN.sections.home() → KPI + بنوك.

GN.openDrawer, GN.closeDrawer, GN.toggleDrawer → Drawer للجوال.

Part 2 — Notifications + Init + Finance:

GN.renderNotifications() → عرض (مع تتبع القراءة).

GN.pushNotification(notif) → إرسال.

GN.initNotifications() → ربط زر الجرس.

GN.initLogout(), GN.initRefresh(), GN.reloadDashboard().

GN.initDashboard() → نقطة دخول.

GN.sections.finance() → KPIs + Charts + Filters + جدول.

GN.loadTransactions() → جلب من Supabase.

GN.renderTxCharts(arr) → 4 رسوم Chart.js.

GN.renderTransactionsTable(arr).

Part 3 — Notify System + Gold + HR + Tasks + Equipment:

GN.notify.send(params) → إرسال إشعار (يُخزّن في dashboard_state).

GN.notify.markDeleted(section, target, id) → تعليم كـ محذوف.

GN.notify.markRead(id) → تعليم كمقروء (لكل مستخدم).

GN.notify.onClick(id) → الضغط (تنقل + وميض).

GN.notify.flash(selector) → وميض ذهبي.

GN.notify.initPolling() → جلب إشعارات الآخرين كل 30s.

GN.sections.gold(), GN.sections.hr(), GN.sections.tasks(), GN.sections.equipment().

كل نموذج إدخال + onSubmit + GN.notify.send.

Part 4 — Docs + Users + Settings + Forms:

GN.sections.docs() → مع فلترة.

GN.sections.users() → Owner فقط.

GN.sections.settings() → Owner + Admin فقط.

GN.openDeptForm, GN.openEmpForm, GN.openTaskForm, GN.openEqForm, GN.openMaintForm, GN.openDocForm, GN.openLetterForm, GN.openUserForm.

GN.openBankForm, GN.openTransferForm, GN.delBank, GN.delTransfer.

GN.openPaymentForm, GN.openFixedForm, GN.delPayment, GN.delFixed.

GN.openPurchaseForm, GN.openSaleForm, GN.openAgentForm, GN.delPurchase, GN.delSale, GN.delAgent.

GN.openTransactionForm, GN.applyBankChange, GN.editTransaction, GN.deleteTransaction.

Part 5 — Website + Payables + Suggestions + Close:

GN.sections.website() → 4 tabs (Board, Articles, Social, Contact).

GN.sections.payables() → KPIs + Tabs + Table.

GN.sections.suggestions() → cards + voting.

GN.approvePayable, GN.cancelPayable, GN.deletePayable, GN.markPayablePaid, GN.openPayableForm.

GN.openSuggestionForm, GN.voteSuggestion, GN.deleteSuggestion.

GN.createAgentPayable(source, sourceType) → إنشاء استحقاق تلقائي.

إغلاق IIFE في آخر الملف.

قسم البنوك (GN.sections.banking) — تم تصحيحه:

يعرض KPIs لكل عملة على حدة (USD صف، SDG صف، إلخ).

كل بطاقة بنك تعرض وارد/صادر خاص بها.

سجل الحوالات مفصل بالعملة.

4.11 js/app.js
الغرض: نقطة الدخول والتنسيق العام.

الدوال:

GN.showPublic() → عرض الموقع العام + إخفاء الداشبورد.

GN.showDashboard() → عكس ذلك.

GN.hideSplash() → إخفاء شاشة البداية.

GN.initLoginForm() → ربط نموذج الدخول + Role choice.

GN.enterDashboard(asAdmin) → دخول.

GN.enterPublic() → دخول الموقع العام.

GN.boot() → نقطة انطلاق التطبيق.

GN.toggleLang() → تبديل اللغة + إعادة رسم.

تدفق الإقلاع:

GN.applyTranslations().

GN.bootstrapAuth():

ناجح → Dashboard.

فاشل → Public Site.

GN.initLoginForm().

GN.hideSplash() بعد 400ms.

5. تدفقات العمل
5.1 تدفق تسجيل الدخول
text
1. المستخدم يضغط "دخول الشركاء"
2. Login Modal يفتح
3. إدخال email + password
4. GN.login() → Supabase signInWithPassword
5. جلب profile من جدول profiles
6. التحقق من status:
   - allowed → الدخول
   - pending → رفض + signOut
   - blocked → رفض + signOut
7. تحديث login_count + last_login
8. إذا كان Owner → عرض Role choice (Admin / Reader)
9. الدخول للداشبورد
5.2 تدفق الحفظ (Public Site)
text
1. Owner يسجل دخول + Admin Mode
2. تعديل نص مباشر (contenteditable)
3. عند blur:
   - GN.bindEditEvents تلتقط الحدث
   - تحديث GN.publicData
   - GN.savePublicData() → Supabase upsert
   - GN.toast("تم الحفظ")
5.3 تدفق الإشعارات
text
1. Owner يُضيف عنصرًا (بنك، موظف، مهمة...)
2. onSubmit ينجح
3. GN.notify.send({
     type: 'add',
     section: 'banking',
     target: 'bank',
     target_id: obj.id,
     title: 'إضافة · البنوك',
     body: 'اسم البنك'
   })
4. الإشعار يُحفظ في dashboard_state.dashboard.notifications
5. GN.savePublicData() → Supabase
6. يظهر فورًا عندك (renderNotifications)
7. كل 30 ثانية، polling يجلب إشعارات الآخرين
8. عند الضغط على الإشعار:
   - markRead (لكل مستخدم على حدة)
   - إذا deleted: toast "تم الحذف"
   - إذا لا: goTo(section) + flash(target_id)
5.4 تدفق الحذف مع إشعار
text
1. Owner يحذف عنصرًا (مثلاً: بنك)
2. askDelete() → تأكيد
3. GN.notify.markDeleted('banking', 'bank', item.id)
   → يُعلَّم الإشعار المرتبط كـ deleted
4. arr.splice(idx, 1)
5. save()
6. الإشعارات المرتبطة تُظهر بـ:
   - خط على النص
   - خلفية حمراء خفيفة
   - عند الضغط: "تم الحذف" + لا تنقّل
5.5 تدفق Gold ↔ Payables
text
1. Owner يُسجّل شراء ذهب مع مندوب
2. commission_amount محسوب تلقائيًا
3. GN.createAgentPayable(source, 'gold_purchase')
4. إنشاء payment_order بحالة pending
5. يظهر في قسم "المدفوعات والاستحقاقات"
6. عند الاعتماد → approved
7. عند الدفع → paid + خصم من البنك
6. نموذج البيانات
6.1 البنية العامة (dashboard_state.data_json)
json
{
  "settings": {
    "company_name": "...",
    "currency": "USD",
    "contact": { "email": "...", "phone": "..." },
    "social": { "linkedin": "...", ... }
  },
  "public": {
    "brand": {},
    "hero": {},
    "vision": {},
    "services": {},
    "advantages": {},
    "board": {},
    "news": {},
    "social": {},
    "contact": {},
    "cta": {},
    "footer": {}
  },
  "services": [],
  "advantages": [],
  "board": [],
  "news": [],
  "dashboard": {
    "banks": [],
    "transfers": [],
    "gold_purchases": [],
    "gold_sales": [],
    "gold_agents": [],
    "investment": {},
    "fixed_expenses": { "daily": [], "monthly": [], "yearly": [] },
    "transactions": [],
    "departments": [],
    "employees": [],
    "tasks": [],
    "equipment": [],
    "maintenance": [],
    "documents": [],
    "letters": [],
    "doc_categories": [],
    "notifications": []
  }
}
6.2 بنية الإشعار (notifications[i])
json
{
  "id": "uuid",
  "type": "add | edit | delete | info",
  "section": "banking | finance | gold | hr | tasks | ...",
  "target": "bank | transaction | employee | ...",
  "target_id": "uuid",
  "title": "إضافة · البنوك",
  "body": "اسم البنك",
  "date": "ISO timestamp",
  "created_by": "auth_user_id",
  "created_by_name": "اسم المالك",
  "read_by": { "auth_user_id": "ISO timestamp" },
  "deleted": false
}
6.3 جدول profiles
العمود	النوع	ملاحظة
id	bigint	PK
auth_user_id	uuid	ref auth.users
email	text	
full_name	text	
role	text	owner / reader
status	text	pending / allowed / blocked
login_count	integer	
last_login	timestamptz	
created_at	timestamptz	
6.4 جدول dashboard_state
العمود	النوع
id	integer (PK = 1)
data_json	jsonb
updated_at	timestamptz
updated_by	uuid
7. نظام الصلاحيات
7.1 المستويات
المستوى	الوصف
isLogged	مسجّل دخول
isOwner	المالك (role === 'owner')
isAdmin	Owner + Admin Mode مفعّل
Reader	مسجّل + ليس Owner (أو Owner في Reader Mode)
7.2 قواعد الوصول
القسم	Owner	Admin	Reader
Home	✅	✅	✅
Suggestions	✅	✅	✅ (يستطيع التصويت)
Finance	✅	✅	قراءة
Banking	✅	✅	قراءة
Gold	✅	✅	قراءة
Payables	✅	✅	قراءة
HR	✅	✅	قراءة
Tasks	✅	✅	قراءة
Equipment	✅	✅	قراءة
Docs	✅	✅	قراءة
Website	✅	✅	❌ مخفي
Users	✅	✅	❌ مخفي
Settings	✅	✅	❌ مخفي
7.3 RLS على قاعدة البيانات
القراءة: كل مستخدم بحالة allowed.

الكتابة: is_owner() فقط.

8. نظام اللغة (i18n)
8.1 آلية العمل
المفاتيح في GN.i18n.ar و GN.i18n.en.

data-i18n="key" → يُستبدل عند applyTranslations.

data-i18n-html="key" → يُستبدل كـ HTML.

data-i18n-placeholder="key" → placeholder.

data-i18n-title="key" → title.

8.2 تبديل اللغة
GN.setLang('ar'|'en') → يحفظ في localStorage + يعيد تطبيق.

document.documentElement.dir = rtl للعربية، ltr للإنجليزية.

إعادة رسم الأقسام النشطة.

8.3 نصوص في JS
GN.t('key') → ترجمة فورية.

تُستخدم في: الجداول، النماذج، الرسائل، الإشعارات.

9. نظام Dark Luxe
9.1 التفعيل
يُضاف body.public-view على <body> عند عرض الموقع العام.

يُزال عند الدخول للداشبورد.

9.2 المبدأ
إعادة تعريف كل متغيرات CSS بألوان داكنة (كحلي + ذهبي).

بدون تعديل أي عنصر — فقط المتغيرات.

9.3 النطاق
الصفحة العامة فقط.

الداشبورد يبقى فاتحًا دائمًا.

10. سجل التعديلات في الجلسة الأخيرة
10.1 index.html
✅ حذف <head> مكرر.

✅ إزالة تعليقات مؤقتة.

✅ إضافة #drawerOverlay.

10.2 css/styles.css
✅ إصلاح } مفقود في .dashboard svg.

✅ حذف قواعد flip-card القديمة.

✅ دمج التكرار.

✅ إضافة Hotfix 3 (Drawer + Bottom Nav).

✅ إضافة Hotfix 4 (Notification Panel).

✅ ضبط RTL/LTR للـ Drawer والهامبرغر.

10.3 js/dashboard.js
✅ إعادة كتابة كاملة في 5 أجزاء منظمة.

✅ إضافة نظام الإشعارات (GN.notify).

✅ إضافة GN.sections.banking الصحيح (KPIs لكل عملة).

✅ حماية settings للقرّاء.

✅ إزالة القائمة السفلية (renderBottomNav = no-op).

✅ تفعيل Drawer من زر ☰.

✅ إضافة data-notif-id على كل العناصر القابلة للوميض.

✅ استدعاء GN.notify.send في كل عمليات الإضافة.

✅ استدعاء GN.notify.markDeleted في كل عمليات الحذف.

10.4 js/auth.js
✅ دعم API_URL (اختياري).

✅ مساران: _addMemberViaBackend و _addMemberViaSignUp.

10.5 js/public.js
✅ دمج IIFE في ملف واحد.

✅ تنظيف.

10.6 js/config.js
✅ تحقق أولي من الإعدادات.

✅ تحذير من service_role key.

10.7 app.py
✅ إضافة رؤوس أمان.

✅ تنظيف ومعالجة أخطاء أفضل.

11. المشاكل المعروفة
11.1 حالية (منخفضة الأولوية)
dashboard.js ضخم (~5000 سطر) → صيانة صعبة.

بيانات مختلطة (JSON + جداول) → نموذج غير متسق.

endpoint في app.py غير مربوط بالواجهة → سطح هجوم.

لا يوجد activity_log فعلي.

login_count قابل للتزييف من العميل.

11.2 لا مشاكل (كانت موجودة وحُلّت)
✅ CORS مفعّل بشكل صحيح.

✅ RLS يمنع الكتابة من غير Owner.

✅ publishable key فقط (لا service_role في الواجهة).

✅ Sign-ups مُغلقة في Supabase.

12. التحديثات المستقبلية (مقترحة)
12.1 أولوية عالية
ربط API_URL بإنشاء المستخدمين → أمان أعلى.

تقسيم dashboard.js إلى ملفات فرعية.

ترحيل بيانات JSON → جداول Supabase.

12.2 أولوية متوسطة
activity_log فعلي (من فعل ماذا).

Pagination للجداول الكبيرة.

تقارير PDF.

12.3 أولوية منخفضة
PWA (offline support).

Vite + modular JS.

اختبارات آلية.

13. نصائح للوكيل الذكي الذي سيقرأ هذا
13.1 قبل أي تعديل
اقرأ PROJECT.md كاملًا أولًا.

افحص console (F12) قبل أي شيء.

اعرف ترتيب تحميل الملفات.

13.2 عند التعديل
لا تحذف IIFE ((function(){...})()).

احتفظ بمفتاح , الأخير — لا تركه في JSON.

اختبر في console قبل الحفظ.

لا تُعدّل config.js بدون سبب.

لا تلمس supabase-schema.sql في الإنتاج.

13.3 عند إضافة ميزة
أضف مفتاح في i18n.js (AR + EN).

أضف نمط في styles.css في القسم المناسب.

أضف data-notif-id إذا كان العنصر يستقبل إشعارات.

استدعِ GN.notify.send عند الإضافة.

استدعِ GN.notify.markDeleted عند الحذف.

13.4 عند البحث عن شيء
ما تبحث عنه	أين تجده
إعدادات Supabase	js/config.js
ترجمة	js/i18n.js
مصادقة	js/auth.js
قسم معين	GN.sections.<name> في dashboard.js
نموذج إدخال	GN.open<Name>Form في dashboard.js
نمط	css/styles.css
نقطة نهاية API	app.py
14. معلومات التشغيل
14.1 Supabase
URL: في js/config.js → SUPABASE_URL.

Publishable Key: في js/config.js → SUPABASE_KEY.

Service Role Key: متغير بيئة في Render (لا يوجد في الكود).

14.2 Render
Build Command: فارغ.

Start Command: python app.py.

14.3 المستخدمون
Owner: المالك (role='owner').

Readers: 4 شركاء (role='reader').

15. الخلاصة للوكيل
المشروع: SPA عربي/إنجليزي لمشروع ذهب سوداني.

الأدوات: HTML/CSS/JS خام + Supabase + Python server.

البنية: 7 ملفات JS + 1 CSS + 1 HTML + 1 Python + SQL schema.

المنطق الأساسي:

المالك يُدير كل شيء.

الشركاء يقرؤون فقط.

الموقع العام يُعدَّل مباشرة.

كل عملية تُنتج إشعارًا مشتركًا.

العمل المتبقي:

API_URL + تقسيم dashboard.js + ترحيل JSON. 