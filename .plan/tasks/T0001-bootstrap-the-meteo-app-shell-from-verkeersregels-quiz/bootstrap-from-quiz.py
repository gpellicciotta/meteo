#!/usr/bin/env python3
"""Copy the reusable application shell from verkeersregels-quiz into meteo.

Mechanical command for T0001: rerunning it reproduces the same output.

Usage:
  python bootstrap-from-quiz.py {{quiz-root}} {{meteo-root}}

It copies shared files verbatim, prunes quiz-only rules from the stylesheet, and
filters the Dutch and English string dictionaries down to the shell keys.
"""

from __future__ import annotations

import json
import re
import shutil
import sys
from pathlib import Path

VERBATIM_FILES = [
    ".github/FUNDING.yml",
    "LICENSE.md",
    "manifest.webmanifest",
    "favicon.ico",
    "assets/favicon.svg",
    "assets/icons/apple-touch-icon.png",
    "assets/icons/icon-192.png",
    "assets/icons/icon-512.png",
    "assets/icons/icon-maskable-192.png",
    "assets/icons/icon-maskable-512.png",
    "js/changelog.js",
    "js/i18n.js",
    "js/icons.js",
    "js/pwa.js",
    "js/theme.js",
    "scripts/_cli_common.py",
    "scripts/generate-pwa-icons.py",
    "scripts/generate-sw.py",
    "scripts/run-review-server.py",
]

# A CSS selector containing any of these tokens styles a quiz-only feature.
CSS_DENY_TOKENS = [
    "#screen-quiz", "#screen-result", "#screen-carousel", "#screen-stats",
    ".quiz-", "#quiz-", ".result-", "#result-", ".carousel", "#carousel",
    ".stats-", "#stats-", ".btn-stats", "#btn-stats",
    "#btn-next", ".btn-next", ".next-icon", ".option", "#options",
    "#question-", ".question-", "#explanation", ".explanation",
    ".badge-since", ".table-", "#progress-fill", ".progress-bar",
    "confetti", "firework", ".btn-review-errors", "#btn-start-errors",
    ".report-", "#modal-report", ".btn-report-round", "#btn-report",
    ".modal-question", "#modal-question", ".modal-feedback", ".modal-checkbox-label",
    "print-signs", ".signs-", ".about-signs-print", ".mode-icon", "#btn-mode-toggle",
    ".share-toast", "#share-toast", ".filter-notice", "#filter-notice",
    ".start-mode-", ".start-buttons", ".colorblind", "#modal-quiz-cancel",
    ".source-link", "kbd", "#modal-changelog", ".modal-dialog-changelog",
    ".modal-changelog-body", ".modal-actions-changelog", ".btn-carousel",
    ".badge-result", ".start-report-btn",
]

STRING_KEEP_PATTERNS = [
    r"^title\.quiz$",
    r"^start\.(description|copyright|offline|btn_(config|about|install|lang)_\w+)$",
    r"^config\.(title|screen_aria|btn_close_aria|section_general|introduction_general"
    r"|label_language|label_theme|label_theme_color|theme_\w+|color_\w+|btn_save)$",
    r"^changelog\.(loading|error|error_link)$",
    r"^version\.unknown$",
    r"^about\.(?!icon_(mode|report|stats|law|share|print)_|source\d|print_signs_btn)[\w.]+$",
    r"^lang\.(nl|en|btn_aria|btn_tooltip)$",
]


def split_css(text: str) -> list[tuple[str, str]]:
    """Split CSS into top-level items: ("ws"|"comment"|"rule"|"at", raw text)."""
    items: list[tuple[str, str]] = []
    i, n = 0, len(text)
    while i < n:
        if text[i].isspace():
            j = i
            while j < n and text[j].isspace():
                j += 1
            items.append(("ws", text[i:j]))
            i = j
            continue
        if text.startswith("/*", i):
            j = text.index("*/", i) + 2
            items.append(("comment", text[i:j]))
            i = j
            continue
        depth, j, quote = 0, i, None
        while j < n:
            c = text[j]
            if quote:
                if c == quote:
                    quote = None
            elif c in "\"'":
                quote = c
            elif text.startswith("/*", j):
                j = text.index("*/", j) + 1
            elif c == "{":
                depth += 1
            elif c == "}":
                depth -= 1
                if depth == 0:
                    j += 1
                    break
            elif c == ";" and depth == 0:
                j += 1
                break
            j += 1
        raw = text[i:j]
        items.append(("at" if raw.startswith("@") else "rule", raw))
        i = j
    return items


def split_selectors(prelude: str) -> list[str]:
    """Split a selector list on commas outside parentheses."""
    parts, depth, cur = [], 0, ""
    for c in prelude:
        if c == "(":
            depth += 1
        elif c == ")":
            depth -= 1
        if c == "," and depth == 0:
            parts.append(cur)
            cur = ""
        else:
            cur += c
    parts.append(cur)
    return parts


def is_denied(selector: str) -> bool:
    """Return True when a selector targets a quiz-only feature."""
    return any(token in selector for token in CSS_DENY_TOKENS)


def prune_rule(raw: str) -> str | None:
    """Drop denied selectors from a rule; return None when none remain."""
    brace = raw.index("{")
    selectors = split_selectors(raw[:brace])
    kept = [s for s in selectors if not is_denied(s)]
    if not kept:
        return None
    if len(kept) == len(selectors):
        return raw
    lead = re.match(r"\s*", kept[0]).group(0)
    joined = ",".join(kept).strip()
    return f"{lead}{joined} {raw[brace:]}"


def prune_css(text: str) -> str:
    """Remove quiz-only rules, empty at-rules and orphaned comments."""
    items = split_css(text)
    out: list[tuple[str, str | None]] = []
    for kind, raw in items:
        if kind == "rule":
            out.append((kind, prune_rule(raw)))
        elif kind == "at" and raw.startswith(("@media", "@supports")):
            brace = raw.index("{")
            inner = prune_css(raw[brace + 1:-1])
            out.append((kind, None if not inner.strip() else f"{raw[:brace + 1]}{inner.rstrip()}\n}}"))
        elif kind == "at" and raw.startswith("@keyframes"):
            out.append((kind, None if is_denied(raw[:raw.index("{")]) else raw))
        else:
            out.append((kind, raw))

    # Drop comments whose next significant item was dropped, and section headers
    # immediately followed by another section header or the end of the file.
    result: list[str] = []
    for idx, (kind, raw) in enumerate(out):
        if raw is None:
            continue
        if kind == "comment":
            nxt = next(((k, r) for k, r in out[idx + 1:] if k != "ws"), None)
            is_header = raw.startswith("/* ====")
            if nxt is None and not is_header:
                pass
            elif nxt is not None and nxt[1] is None:
                continue
            elif is_header and (nxt is None or (nxt[0] == "comment" and nxt[1].startswith("/* ===="))):
                continue
        result.append(raw)
    pruned = "".join(result)
    return re.sub(r"\n{3,}", "\n\n", pruned)


def filter_strings(path: Path) -> str:
    """Keep only the dictionary keys the application shell still uses."""
    data = json.loads(path.read_text(encoding="utf-8"))
    kept = {k: v for k, v in data.items() if any(re.match(p, k) for p in STRING_KEEP_PATTERNS)}
    return json.dumps(kept, ensure_ascii=False, indent=2) + "\n"


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print(__doc__)
        return 2
    quiz, meteo = Path(argv[0]), Path(argv[1])
    for rel in VERBATIM_FILES:
        target = meteo / rel
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(quiz / rel, target)
    css = (quiz / "css/style.css").read_text(encoding="utf-8")
    (meteo / "css").mkdir(exist_ok=True)
    (meteo / "css/style.css").write_text(prune_css(css), encoding="utf-8", newline="\n")
    (meteo / "data").mkdir(exist_ok=True)
    for lang in ("nl", "en"):
        text = filter_strings(quiz / f"data/strings.{lang}.json")
        (meteo / f"data/strings.{lang}.json").write_text(text, encoding="utf-8", newline="\n")
    print(f"Copied {len(VERBATIM_FILES)} files, pruned css/style.css, filtered 2 string dictionaries.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
