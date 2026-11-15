"""WCAG 2.2 contrast of meteo b766712 and bright 6cd1671 color pairs."""


def lum(hex_color):
    h = hex_color.lstrip("#")
    channels = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in channels]
    return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]


def ratio(a, b):
    la, lb = sorted((lum(a), lum(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)


def blend(fg, alpha, bg):
    f = [int(fg.lstrip("#")[i:i + 2], 16) for i in (0, 2, 4)]
    b = [int(bg.lstrip("#")[i:i + 2], 16) for i in (0, 2, 4)]
    return "#" + "".join(f"{round(alpha * x + (1 - alpha) * y):02x}" for x, y in zip(f, b))


GROUNDS = {
    "light": {"bg": "#f5f7fa", "surface": "#ffffff", "sunken": "#f8fafc"},
    "dark": {"bg": "#0f172a", "surface": "#1e293b", "sunken": "#141f33"},
}

METEO = {
    ("light", "blue"): dict(fill="#1a56db", hover="#163f9e", label="#ffffff", tint="#eff6ff", ptext="#0369a1", pborder="#bae6fd", focus_rgb="#1a56db", focus_a=0.18),
    ("light", "yellow"): dict(fill="#ca8a04", hover="#a16207", label="#ffffff", tint="#fefce8", ptext="#854d0e", pborder="#fde047", focus_rgb="#ca8a04", focus_a=0.20),
    ("light", "red"): dict(fill="#dc2626", hover="#b91c1c", label="#ffffff", tint="#fef2f2", ptext="#991b1b", pborder="#fca5a5", focus_rgb="#dc2626", focus_a=0.20),
    ("dark", "blue"): dict(fill="#2563eb", hover="#1d4ed8", label="#ffffff", tint="#172554", ptext="#93c5fd", pborder="#1e40af", focus_rgb="#2563eb", focus_a=0.30),
    ("dark", "yellow"): dict(fill="#d97706", hover="#b45309", label="#ffffff", tint="#451a03", ptext="#fde68a", pborder="#78350f", focus_rgb="#d97706", focus_a=0.30),
    ("dark", "red"): dict(fill="#dc2626", hover="#b91c1c", label="#ffffff", tint="#450a0a", ptext="#fca5a5", pborder="#991b1b", focus_rgb="#dc2626", focus_a=0.30),
}

BRIGHT = {
    ("light", "blue"): dict(fill="#1a56db", hover="#163f9e", active="#163f9e", label="#ffffff"),
    ("light", "yellow"): dict(fill="#b88000", hover="#b88000", active="#b88000", label="#111827"),
    ("light", "red"): dict(fill="#dc2626", hover="#b91c1c", active="#b91c1c", label="#ffffff"),
    ("dark", "blue"): dict(fill="#60a5fa", hover="#93c5fd", active="#bfdbfe", label="#0f172a"),
    ("dark", "yellow"): dict(fill="#d97706", hover="#d97706", active="#d97706", label="#111827"),
    ("dark", "red"): dict(fill="#f87171", hover="#fca5a5", active="#fecaca", label="#0f172a"),
}
BRIGHT_LINK = {"light": "#163f9e", "dark": "#93c5fd"}
BRIGHT_FOCUS = {"light": "#1a56db", "dark": "#60a5fa"}


def mark(value, need):
    return f"{value:5.2f} {'pass' if value >= need else 'FAIL'}"


def grounds_row(color, theme, need):
    g = GROUNDS[theme]
    return " / ".join(mark(ratio(color, g[k]), need) for k in ("bg", "surface", "sunken"))


def main():
    print("Grounds order: bg / surface / sunken.")
    for (theme, accent), m in METEO.items():
        b = BRIGHT[(theme, accent)]
        print(f"\n== {theme} {accent} ==")
        print(f"meteo  fill  {m['fill']} label {m['label']}: {mark(ratio(m['fill'], m['label']), 4.5)}")
        print(f"meteo  hover {m['hover']} label {m['label']}: {mark(ratio(m['hover'], m['label']), 4.5)}")
        print(f"bright fill  {b['fill']} label {b['label']}: {mark(ratio(b['fill'], b['label']), 4.5)}")
        print(f"bright hover {b['hover']} label {b['label']}: {mark(ratio(b['hover'], b['label']), 4.5)}")
        print(f"bright activ {b['active']} label {b['label']}: {mark(ratio(b['active'], b['label']), 4.5)}")
        print(f"meteo  fill as icon/border  (3:1): {grounds_row(m['fill'], theme, 3)}")
        print(f"bright fill as icon/border  (3:1): {grounds_row(b['fill'], theme, 3)}")
        print(f"meteo  fill as text       (4.5:1): {grounds_row(m['fill'], theme, 4.5)}")
        print(f"meteo  hover as text      (4.5:1): {grounds_row(m['hover'], theme, 4.5)}")
        link = BRIGHT_LINK[theme]
        print(f"bright link {link}       (4.5:1): {grounds_row(link, theme, 4.5)}")
        print(f"meteo  fill text on tint {m['tint']} (4.5:1): {mark(ratio(m['fill'], m['tint']), 4.5)}")
        print(f"meteo  hover text on tint       (4.5:1): {mark(ratio(m['hover'], m['tint']), 4.5)}")
        print(f"meteo  primary-text on tint     (4.5:1): {mark(ratio(m['ptext'], m['tint']), 4.5)}")
        glow = blend(m["focus_rgb"], m["focus_a"], GROUNDS[theme]["surface"])
        print(f"meteo  focus glow {glow} vs surface (3:1): {mark(ratio(glow, GROUNDS[theme]['surface']), 3)}")
        print(f"meteo  close-button ring {m['pborder']} (3:1): {grounds_row(m['pborder'], theme, 3)}")
        focus = BRIGHT_FOCUS[theme]
        print(f"bright focus {focus}       (3:1): {grounds_row(focus, theme, 3)}")

    print("\n== grounds and text, theme-wide ==")
    pairs = [
        ("light", "meteo text #1f2933", "#1f2933", 4.5),
        ("light", "bright text #0f172a", "#0f172a", 4.5),
        ("light", "meteo muted #6b7280", "#6b7280", 4.5),
        ("light", "bright muted #596270", "#596270", 4.5),
        ("light", "meteo border #cbd5e1", "#cbd5e1", 3),
        ("light", "bright border-strong #788595", "#788595", 3),
        ("dark", "meteo text #f1f5f9", "#f1f5f9", 4.5),
        ("dark", "bright text #f5f7fa", "#f5f7fa", 4.5),
        ("dark", "meteo/bright muted #94a3b8", "#94a3b8", 4.5),
        ("dark", "meteo border #475569", "#475569", 3),
        ("dark", "bright border-strong #788595", "#788595", 3),
    ]
    for theme, name, color, need in pairs:
        print(f"{theme:5} {name:32} ({need}:1): {grounds_row(color, theme, need)}")
    hover_light = blend("#000000", 0.05, "#ffffff")
    hover_dark = blend("#ffffff", 0.10, "#1e293b")
    print(f"light meteo btn-tint-hover on surface = {hover_light}; bright surface-hover = #f8fafc")
    print(f"dark  meteo btn-tint-hover on surface = {hover_dark}; bright surface-hover = #141f33")
    print(f"light primary on meteo hover ground {hover_light}: blue {ratio('#1a56db', hover_light):.2f}, yellow {ratio('#ca8a04', hover_light):.2f}, red {ratio('#dc2626', hover_light):.2f}")
    print(f"dark  primary on meteo hover ground {hover_dark}: blue {ratio('#2563eb', hover_dark):.2f}, yellow {ratio('#d97706', hover_dark):.2f}, red {ratio('#dc2626', hover_dark):.2f}")
    print(f"ADR check: white on #ca8a04 {ratio('#ffffff', '#ca8a04'):.2f}, white on #d97706 {ratio('#ffffff', '#d97706'):.2f}")
    print(f"ADR check: #111827 on #ca8a04 {ratio('#111827', '#ca8a04'):.2f}, #111827 on #d97706 {ratio('#111827', '#d97706'):.2f}")
    print(f"Override check: white on #b88000 {ratio('#ffffff', '#b88000'):.2f}")


# Token values that reproduce meteo's look; hover and active share meteo's -dark value.
LOSSLESS = {
    ("light", "blue"): dict(primary="#1a56db", hover="#163f9e", on="#ffffff", link="#1a56db", link_hover="#163f9e", focus="#1a56db"),
    ("light", "yellow"): dict(primary="#ca8a04", hover="#a16207", on="#ffffff", link="#ca8a04", link_hover="#a16207", focus="#ca8a04"),
    ("light", "red"): dict(primary="#dc2626", hover="#b91c1c", on="#ffffff", link="#dc2626", link_hover="#b91c1c", focus="#dc2626"),
    ("dark", "blue"): dict(primary="#2563eb", hover="#1d4ed8", on="#ffffff", link="#2563eb", link_hover="#1d4ed8", focus="#2563eb"),
    ("dark", "yellow"): dict(primary="#d97706", hover="#b45309", on="#ffffff", link="#d97706", link_hover="#b45309", focus="#d97706"),
    ("dark", "red"): dict(primary="#dc2626", hover="#b91c1c", on="#ffffff", link="#dc2626", link_hover="#b91c1c", focus="#dc2626"),
}

# AA-passing accent text candidates: meteo's own --color-primary-text values.
LINK_CANDIDATES = {
    ("light", "blue"): "#0369a1", ("light", "yellow"): "#854d0e", ("light", "red"): "#991b1b",
    ("dark", "blue"): "#93c5fd", ("dark", "yellow"): "#fde68a", ("dark", "red"): "#fca5a5",
}


def token_test(theme, values):
    """Token-test pairs of support.webapp tests/unit/contract.js; bright hover, selected, active grounds equal sunken."""
    g = GROUNDS[theme]
    fails = []
    for ground_name, ground in g.items():
        for role in ("link", "link_hover"):
            if ratio(values[role], ground) < 4.5:
                fails.append(f"{role} on {ground_name} {ratio(values[role], ground):.2f}")
        for role in ("primary", "focus"):
            if ratio(values[role], ground) < 3:
                fails.append(f"{role} on {ground_name} {ratio(values[role], ground):.2f}")
    for state in ("primary", "hover"):
        if ratio(values["on"], values[state]) < 4.5:
            fails.append(f"on-primary on {state} {ratio(values['on'], values[state]):.2f}")
    return fails


# Meteo's value where it passes AA, else the package or meteo's AA text value; white yellow labels stay.
RECOMMENDED = {
    ("light", "blue"): dict(primary="#1a56db", hover="#163f9e", on="#ffffff", link="#1a56db", link_hover="#163f9e", focus="#1a56db"),
    ("light", "yellow"): dict(primary="#b88000", hover="#a16207", on="#ffffff", link="#a16207", link_hover="#854d0e", focus="#b88000"),
    ("light", "red"): dict(primary="#dc2626", hover="#b91c1c", on="#ffffff", link="#b91c1c", link_hover="#991b1b", focus="#dc2626"),
    ("dark", "blue"): dict(primary="#60a5fa", hover="#93c5fd", on="#0f172a", link="#93c5fd", link_hover="#93c5fd", focus="#60a5fa"),
    ("dark", "yellow"): dict(primary="#d97706", hover="#b45309", on="#ffffff", link="#d97706", link_hover="#fde68a", focus="#d97706"),
    ("dark", "red"): dict(primary="#dc2626", hover="#b91c1c", on="#ffffff", link="#fca5a5", link_hover="#fca5a5", focus="#dc2626"),
}


def overrides():
    print("\n== lossless override set against the token-test pairs ==")
    for key, values in LOSSLESS.items():
        fails = token_test(key[0], values)
        print(f"{key[0]:5} {key[1]:6}: {'all pass' if not fails else '; '.join(fails)}")
    print("\n== recommended override set against the token-test pairs ==")
    for key, values in RECOMMENDED.items():
        fails = token_test(key[0], values)
        print(f"{key[0]:5} {key[1]:6}: {'all pass' if not fails else '; '.join(fails)}")
    print("\n== AA link candidates (meteo --color-primary-text), 4.5:1 ==")
    for (theme, accent), color in LINK_CANDIDATES.items():
        print(f"{theme:5} {accent:6} {color}: {grounds_row(color, theme, 4.5)}")
    print("\n== yellow and dark alternatives ==")
    for fill, label in (("#ca8a04", "#111827"), ("#a16207", "#ffffff"), ("#a16207", "#111827"), ("#b45309", "#ffffff"), ("#b45309", "#111827"), ("#2563eb", "#ffffff"), ("#1d4ed8", "#ffffff")):
        print(f"label {label} on {fill}: {mark(ratio(label, fill), 4.5)}")
    for color, theme in (("#a16207", "light"), ("#b88000", "light"), ("#1d4ed8", "dark"), ("#b45309", "dark"), ("#b91c1c", "dark")):
        print(f"{color} as icon on {theme} grounds (3:1): {grounds_row(color, theme, 3)}")
    print("\n== hover distinguishability, fill vs hover fill ==")
    for key, values in LOSSLESS.items():
        b = BRIGHT[key]
        print(f"{key[0]:5} {key[1]:6}: meteo {ratio(values['primary'], values['hover']):.2f}, bright {ratio(b['fill'], b['hover']):.2f}")


main()
overrides()
