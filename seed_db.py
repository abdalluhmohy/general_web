import json
import re
from pathlib import Path

import app

html = Path("gold-nile-partner-dashboard.html").read_text(encoding="utf-8")
match = re.search(
    r'<script type="application/json" id="default-data">(.*?)</script>',
    html,
    re.S,
)
if not match:
    raise SystemExit("default data was not found")
data = json.loads(match.group(1))
app.save_state(data)
banking = data.get("banking", {})
print(
    "seeded accounts=%d journal=%d transfers=%d"
    % (
        len(banking.get("accounts", [])),
        len(banking.get("journal", [])),
        len(banking.get("transfers", [])),
    )
)
