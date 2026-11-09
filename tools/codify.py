"""Met en `code` les commandes écrites en clair dans les pages (hors blocs de code, liens, titres)."""
import re, sys, glob
CMDLET = r"(?:Get|Set|New|Remove|Add|Enable|Disable|Rename|Update|Format|Select|Where|Test|Install|Import|Export|Start|Stop|Restart|Clear|Write|Out|Invoke|Mount|Dismount|Initialize|Resize)-[A-Z][A-Za-z]+"
FILES = r"[\w-]+\.(?:msc|cpl|exe|ps1|sh|diagcab)"
WORDS = r"(?:ipconfig|tracert|traceroute|netstat|nslookup|diskpart|regedit|msinfo32|driverquery|pnputil|sysprep|gpupdate|gpedit|devmgmt|\$PSVersionTable|\$PSItem|\$_|\$HOME|\$PATH|\$null)"
PAT = re.compile(rf"(?<![`\w/\\.$-])((?:{CMDLET})|(?:{FILES})|(?:{WORDS})(?:\s/[a-z]+)?)(?![`\w])")
def protect(line):
    keep = []
    def sub(m):
        keep.append(m.group(0)); return f"\x00{len(keep)-1}\x00"
    line = re.sub(r"`[^`]*`|\[[^\]]*\]\([^)]*\)|https?://\S+|<[^>]+>|\{[^}]*\}", sub, line)
    return line, keep
def restore(line, keep):
    return re.sub(r"\x00(\d+)\x00", lambda m: keep[int(m.group(1))], line)
total = 0
for f in sorted(glob.glob(sys.argv[1] + "/**/*.md", recursive=True)):
    out, fence, fm, n = [], False, False, 0
    lines = open(f).read().split("\n")
    for i, l in enumerate(lines):
        s = l.strip()
        if i == 0 and s == "---": fm = True; out.append(l); continue
        if fm:
            out.append(l); fm = s != "---"; continue
        if s.startswith("```"): fence = not fence; out.append(l); continue
        if fence or s.startswith("#") or s.startswith("!!!") or s.startswith("???"):
            out.append(l); continue
        p, keep = protect(l)
        p2, k = PAT.subn(r"`\1`", p)
        n += k; out.append(restore(p2, keep))
    if n:
        open(f, "w").write("\n".join(out)); print(n, f.split("/cours/")[-1]); total += n
print("total", total)
