"""Rebuild src/data/landfills.json from the EPA LMOP Landfill and Project Database.

Usage: python3 -I scripts/data/build-landfills.py <path-to-lmopcompositedata.xlsx>

Source: U.S. EPA, Landfill Methane Outreach Program (LMOP), "LMOP Landfill and Project Database",
file lmopcompositedata.xlsx (https://www.epa.gov/system/files/documents/2024-09/lmopcompositedata.xlsx),
linked from https://www.epa.gov/lmop/lmop-landfill-and-project-database (page last updated July 31, 2026).
Data produced by the EPA are in the public domain (17 U.S.C. § 105). The raw file stays out of git.

Kept: one row per landfill (the file repeats a landfill once per energy project), status "Open" only,
with name, city, county, state, ownership type, owner and operator, and annual waste acceptance.
"""
import json, sys, datetime, openpyxl, collections, os

src = sys.argv[1]
wb = openpyxl.load_workbook(src, read_only=True)
ws = wb["LMOP Database"]
rows = ws.iter_rows(values_only=True)
head = next(rows)
ix = {h: i for i, h in enumerate(head)}
seen = {}
for r in rows:
    lid = r[ix["Landfill ID"]]
    if lid is None or lid in seen:
        continue
    seen[lid] = r
open_ = [r for r in seen.values() if (r[ix["Current Landfill Status"]] or "").strip() == "Open"]
out = []
for r in open_:
    def g(k):
        v = r[ix[k]]
        return v.strip() if isinstance(v, str) else v
    out.append({
        "id": g("Landfill ID"),
        "name": g("Landfill Name"),
        "city": g("City") or "",
        "county": g("County") or "",
        "state": g("State"),
        "own": g("Ownership Type") or "",
        "owner": g("Landfill Owner Organization(s)") or "",
        "operator": g("Landfill Operator Organization") or "",
        "tpy": g("Annual Waste Acceptance Rate (tons per year)"),
        "tpyYear": g("Annual Waste Acceptance Year"),
    })
out.sort(key=lambda x: (x["state"], x["name"]))
by = collections.Counter(x["state"] for x in out)
meta = {
    "source": "U.S. EPA, Landfill Methane Outreach Program, LMOP Landfill and Project Database (lmopcompositedata.xlsx)",
    "fileUrl": "https://www.epa.gov/system/files/documents/2024-09/lmopcompositedata.xlsx",
    "pageUrl": "https://www.epa.gov/lmop/lmop-landfill-and-project-database",
    "pageUpdated": "2026-07-31",
    "downloaded": datetime.date.fromtimestamp(os.path.getmtime(src)).isoformat(),  # date the xlsx was saved
    "uniqueLandfills": len(seen),
    "open": len(out),
    "openPublic": sum(1 for x in out if x["own"] == "Public"),
    "states": len(by),
}
dst = os.path.join(os.path.dirname(__file__), "..", "..", "src", "data", "landfills.json")
json.dump({"meta": meta, "landfills": out}, open(dst, "w"), ensure_ascii=False, separators=(",", ":"))
print(meta)

# Lighter copy for the browser (landfill finder island): one array per landfill,
# [name, city, county, state, ownership (P public, R private, O other), owner].
OWN = {"Public": "P", "Private": "R"}
lite = [[x["name"], x["city"], x["county"], x["state"], OWN.get(x["own"], "O"), x["owner"]] for x in out]
json.dump(lite, open(os.path.join(os.path.dirname(__file__), "..", "..", "src", "data", "landfills-lite.json"), "w"), ensure_ascii=False, separators=(",", ":"))
