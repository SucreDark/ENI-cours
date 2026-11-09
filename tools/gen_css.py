"""Génère docs/stylesheets/cours.css : couleur + logo par cours (logos SVG embarqués, marche hors ligne)."""
import os, re, base64, material, sys
ICONS = os.path.join(os.path.dirname(material.__file__), "templates", ".icons")
COURS = {
 "microsoft-365": ("#d83b01", "material/microsoft-office"),
 "base-des-reseaux": ("#00897b", "material/lan"),
 "systemes-clients-microsoft": ("#0067b8", "fontawesome/brands/windows"),
 "utilisation-linux": ("#e65100", "fontawesome/brands/linux"),
 "administration-linux": ("#6d4c41", "fontawesome/brands/linux"),
 "msp-systemes-clients": ("#5e35b1", "material/briefcase"),
 "itil-gestion-de-parc": ("#00838f", "material/clipboard-list"),
 "infrastructures-reseaux": ("#1565c0", "material/router-network"),
 "services-reseau-microsoft": ("#283593", "material/server-network"),
 "msp-services-reseau": ("#8e24aa", "material/briefcase"),
 "scripting-bash": ("#2e7d32", "simple/gnubash"),
 "powershell": ("#1f3a93", "material/powershell"),
 "automatisation-ia-mco": ("#c2185b", "material/robot"),
 "virtualisation-serveurs": ("#546e7a", "simple/vmware"),
 "services-cloud": ("#0288d1", "material/cloud"),
 "sauvegarde-restauration": ("#388e3c", "material/backup-restore"),
 "reseau-et-securite": ("#c62828", "material/shield-lock"),
 "supervision": ("#ef6c00", "material/monitor-dashboard"),
}
def uri(icon):
    svg = open(os.path.join(ICONS, icon + ".svg")).read()
    svg = re.sub(r"<svg ", '<svg fill="white" ', svg, count=1)
    return "data:image/svg+xml;base64," + base64.b64encode(svg.encode()).decode()
out = ["/* Généré par tools/gen_css.py : une couleur et un logo par cours */"]
for d, (c, ic) in COURS.items():
    out.append(f'body[data-cours="{d}"] {{ --c: {c}; --c-icon: url("{uri(ic)}"); }}')
open(sys.argv[1], "w").write("\n".join(out) + "\n")
print("ok", len(COURS))
