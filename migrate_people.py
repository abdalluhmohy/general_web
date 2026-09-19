import json
import re
from pathlib import Path

import app

app.initialize_database()
data = app.load_state()
if data is None:
    html = Path("gold-nile-partner-dashboard.html").read_text(encoding="utf-8")
    match = re.search(r'<script type="application/json" id="default-data">(.*?)</script>', html, re.S)
    data = json.loads(match.group(1))
if not isinstance(data.get("employees"), list):
    data["employees"] = json.loads(re.search(r'"employees": (\[.*?\]),\n  "tasks"', Path("gold-nile-partner-dashboard.html").read_text(encoding="utf-8"), re.S).group(1))
if not isinstance(data.get("tasks"), list):
    data["tasks"] = json.loads(re.search(r'"tasks": (\[.*?\]),\n  "open"', Path("gold-nile-partner-dashboard.html").read_text(encoding="utf-8"), re.S).group(1))
if not isinstance(data.get("documents"), list):
    data["documents"] = [{"title": title, "doc": ""} for title in [
        "سجل الشركة", "عقد التأسيس", "العقد الاستثماري للشراكة", "ورقة حساب البنك",
        "ورقة الضريبة", "ورقة القيمة المضافة", "ورقة الزكاة", "ورقة تسجيل الغرفة التجارية",
        "ورقة تسجيل الغرفة التجارية للموردين والمصدرين", "تصريح وزارة المعادن للمعمل"
    ]]
data.setdefault("governmentLetters", [])
for account in data.get("banking", {}).get("accounts", []):
    if not account.get("purpose"):
        account["purpose"] = "بيع وشراء الذهب" if account.get("bank") == "بنك الخرطوم" else "الحساب الرئيسي للشركة"
for employee in data.get("employees", []):
    employee.setdefault("isManager", True)
    employee.setdefault("attendanceLog", [])
    employee.setdefault("salary", 0)
    employee.setdefault("currency", "USD")
    employee.setdefault("hireDate", "")
    employee.setdefault("absence", "")
    employee.setdefault("bonuses", 0)
    employee.setdefault("commissions", 0)
    employee.setdefault("passportNumber", "")
    employee.setdefault("passportDoc", "")
    employee.setdefault("photo", "")
app.save_state(data)
print(len(data["employees"]), len(data["tasks"]))
