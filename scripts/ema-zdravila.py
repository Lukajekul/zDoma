#!/usr/bin/env python3
"""Build src/lib/zdravila/ema.json from EMA's public Article 57 Excel (T-74).

One-off, standard library only. Download the file first:
  curl -L -o /tmp/a57.xlsx https://www.ema.europa.eu/en/documents/other/article-57-product-data_en.xlsx
  python3 -I scripts/ema-zdravila.py /tmp/a57.xlsx src/lib/zdravila/ema.json

Keeps medicines authorised in Slovenia or EU-wide that a patient can take at
home (by mouth, inhaled, under the skin, on the skin, ...). Only names and
active substances: no strengths or doses. Active substances of the template
medicines are written in Slovenian (same text as `ucinkovina` in the
templates), so the app can offer the template's dose buttons for any brand.
"""
import html
import json
import re
import sys
import zipfile

COUNTRIES = {"Slovenia", "European Union"}
HOME_ROUTES = {
    "Oral Use", "Oromucosal Use", "Sublingual Use", "Buccal Use", "Inhalation Use", "Subcutaneous Use",
    "Cutaneous Use", "Transdermal Use", "Nasal Use", "Ocular Use", "Rectal Use", "Vaginal Use",
}
# English INN fragment -> Slovenian name, for every active substance used in src/lib/templates.
SL = {
    "acetylsalicylic acid": "acetilsalicilna kislina",
    "apixaban": "apiksaban",
    "aprepitant": "aprepitant",
    "atorvastatin": "atorvastatin",
    "beclometasone": "beklometazondipropionat",
    "formoterol": "formoterol",
    "glycopyrronium": "glikopironij",
    "bisoprolol": "bisoprolol",
    "dapagliflozin": "dapagliflozin",
    "dexamethasone": "deksametazon",
    "furosemide": "furosemid",
    "clopidogrel": "klopidogrel",
    "enoxaparin": "natrijev enoksaparin",
    "ondansetron": "ondansetron",
    "paracetamol": "paracetamol",
    "prednisolone": "prednizolon",
    "ramipril": "ramipril",
    "rivaroxaban": "rivaroksaban",
    "sacubitril": "sakubitril",
    "valsartan": "valsartan",
    "salbutamol": "salbutamol",
    "spironolactone": "spironolakton",
    "ticagrelor": "tikagrelor",
    "umeclidinium": "umeklidinij",
    "vilanterol": "vilanterol",
}
# Combinations written as in the templates.
COMBOS = {
    frozenset({"beklometazondipropionat", "formoterol", "glikopironij"}): "beklometazondipropionat + formoterol + glikopironij",
    frozenset({"sakubitril", "valsartan"}): "sakubitril + valsartan",
    frozenset({"umeklidinij", "vilanterol"}): "umeklidinij + vilanterol",
}
# Substances a template actually lists (single parts of combinations are left out).
PARTS_ONLY = {"beklometazondipropionat", "formoterol", "glikopironij", "sakubitril", "valsartan", "umeklidinij", "vilanterol"}
TEMPLATE = {v for v in SL.values() if v not in PARTS_ONLY} | set(COMBOS.values())


def rows(path):
    z = zipfile.ZipFile(path)
    strings = [
        html.unescape("".join(re.findall(r"<t[^>]*>([^<]*)</t>", si)))
        for si in re.findall(r"<si>(.*?)</si>", z.read("xl/sharedStrings.xml").decode(), re.S)
    ]
    sheet = z.read("xl/worksheets/sheet1.xml").decode()
    for row in re.findall(r"<row[^>]*>(.*?)</row>", sheet, re.S):
        vals = []
        for attrs, body in re.findall(r"<c ([^>]*?)(?:/>|>(.*?)</c>)", row, re.S):
            v = re.search(r"<v>([^<]*)</v>", body or "")
            v = v.group(1) if v else ""
            vals.append(strings[int(v)] if 't="s"' in attrs and v else v)
        yield vals


def slovenian(substances):
    """Slovenian substance text when every part is a template substance, else None."""
    parts = set()
    for s in substances:
        hit = next((sl for en, sl in SL.items() if en in s.lower()), None)
        if not hit:
            return None
        parts.add(hit)
    if len(parts) == 1:
        return next(iter(parts))
    return COMBOS.get(frozenset(parts))


def main(src, out):
    seen, result = set(), []
    for r in rows(src):
        if len(r) < 4 or r[3] not in COUNTRIES:
            continue
        routes = {x.strip() for x in r[2].split(",")}
        if not routes & HOME_ROUTES:
            continue
        name = re.sub(r"\s+", " ", r[0]).strip()
        substances = [s.strip() for s in r[1].split(",") if s.strip()]
        sl = slovenian(substances)
        substance = sl or ", ".join(s.lower() for s in substances)
        if len(substance) > 80:  # vaccines and herbal mixtures
            substance = substance[:77].rstrip(" ,") + "…"
        key = (name.lower(), substance)
        if not name or key in seen:
            continue
        seen.add(key)
        result.append({"ime": name, "ucinkovina": substance, **({"predloga": True} if sl in TEMPLATE else {})})
    result.sort(key=lambda m: m["ime"].lower())
    with open(out, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, separators=(",", ":"))
        f.write("\n")
    print(f"{len(result)} medicines, {sum(1 for m in result if m.get('predloga'))} match a template substance")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
