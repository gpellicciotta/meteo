"""Four-decimal ratios for pairs that round to 4.50."""
import pathlib

source = pathlib.Path(__file__).with_name("contrast.py").read_text(encoding="utf-8").split("def main")[0]
exec(source)
for fg, bg in (("#dc2626", "#f5f7fa"), ("#6b7280", "#f5f7fa")):
    print(f"{fg} on {bg}: {ratio(fg, bg):.4f}")
