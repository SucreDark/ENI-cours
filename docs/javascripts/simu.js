/* Simulateur de terminal : moteur PowerShell puis bash / cmd */
/* ============================================================
   Simulateur : moteur PowerShell (onglet « Windows – PowerShell »)
   Mini-PowerShell orienté objet : cmdlets du cours (Systèmes clients M3 et M11),
   pipeline |, Select-Object, Where-Object (simple et -FilterScript), Format-*,
   redirections > >> 2> 2>$null 2>&1, alias.
   Utilisé par simu.js via window.ENI_SIMU_PS(api).
   ============================================================ */
(function () {
  "use strict";

  // ---------- Missions (contenu des cours uniquement) ----------
  function sel(c) { // propriétés demandées dans Select-Object
    var m = c.match(/select-object ([^|]+)/); if (!m) return [];
    return m[1].replace(/-property /, "").split(/[ ,]+/).filter(Boolean);
  }
  function aProps(c, liste) { var p = sel(c); return liste.every(function (x) { return p.indexOf(x) !== -1; }); }
  var MISSIONS = [
    { id: "ver", txt: "Affiche la version de PowerShell.", ind: "Systèmes clients M3, exercice 2", sol: "$PSVersionTable", ok: function (c) { return c === "$psversiontable" || c === "get-host"; } },
    { id: "ex", txt: "Affiche seulement les exemples de l'aide de Get-Service.", ind: "Systèmes clients M3 : l'aide de PowerShell", sol: "Get-Help -Examples Get-Service", ok: function (c) { return /^get-help /.test(c) && / -examples?( |$)/.test(c) && /get-service/.test(c); } },
    { id: "gci", txt: "Affiche le contenu du dossier C:\\Users.", ind: "Systèmes clients M3, exercice 3", sol: "Get-ChildItem -Path C:\\Users", ok: function (c) { return /^get-childitem( -path)? c:\\users\\?$/.test(c); } },
    { id: "alias", txt: "Affiche les alias (pour trouver ceux de Get-ChildItem).", ind: "Systèmes clients M3 : Get-Alias", sol: "Get-Alias", ok: function (c) { return /^get-alias/.test(c); } },
    { id: "gc", txt: "Affiche le contenu du fichier C:\\PowerShell\\Intro.txt, puis va à la racine de C:\\.", ind: "Systèmes clients M3, exercice 4", sol: "Get-Content C:\\PowerShell\\Intro.txt  puis  Set-Location C:\\", ok: function (c, s) { return s.luIntro && s.cwd === "C:\\"; } },
    { id: "cmd", txt: "Trouve toutes les cmdlets qui créent quelque chose lié aux utilisateurs.", ind: "Systèmes clients M3, exercice 5 (Get-Command + jokers)", sol: "Get-Command new-*user*", ok: function (c) { return /^get-command new-\*user\*$/.test(c); } },
    { id: "date", txt: "Affiche le numéro du jour dans l'année.", ind: "Systèmes clients M11, exercice 1", sol: "Get-Date | Select DayOfYear", ok: function (c) { return /^get-date \| select-object/.test(c) && aProps(c, ["dayofyear"]); } },
    { id: "net", txt: "Affiche le nom, le statut et la vitesse des cartes réseau, uniquement celles qui sont « Up ».", ind: "Systèmes clients M11 : pipeline + filtrage basique", sol: "Get-NetAdapter | Select Name,Status,LinkSpeed | Where Status -like Up", ok: function (c, s) { return /^get-netadapter/.test(c) && aProps(c, ["name", "status", "linkspeed"]) && /where-object .*status -(c?like|c?eq) ["']?up/.test(c); } },
    { id: "svc", txt: "Affiche les services démarrés ET en démarrage automatique (nom et statut).", ind: "Systèmes clients M11, exercice 5 (-FilterScript, $_ et -and)", sol: 'Get-Service | Where -FilterScript { $_.Status -like "Running" -and $_.StartType -like "Automatic" } | Select Name,Status', ok: function (c) { return /^get-service/.test(c) && /where-object/.test(c) && /running/.test(c) && /automatic/.test(c) && / -and /.test(c) && aProps(c, ["name", "status"]); } },
    { id: "smb", txt: "Affiche le nom et le chemin des partages administratifs.", ind: "Systèmes clients M11, exercice 6 (joker *$)", sol: "Get-SmbShare | Select Name,Path | Where Name -like *$", ok: function (c) { return /^get-smbshare/.test(c) && aProps(c, ["name", "path"]) && /where-object .*name -c?like ["']?\*\$/.test(c); } },
    { id: "redir", txt: "Enregistre la liste des utilisateurs locaux dans C:\\temp\\LocalUserList.txt, puis affiche ce fichier.", ind: "Systèmes clients M11 : la redirection de flux", sol: "Get-LocalUser > C:\\temp\\LocalUserList.txt  puis  Get-Content C:\\temp\\LocalUserList.txt", ok: function (c, s) { return s.redirUsers && /^get-content c:\\temp\\localuserlist\.txt$/.test(c); } }
  ];

  // ---------- Données simulées ----------
  var GB = 1073741824;
  var DATA = {
    process: [["svchost", 1452, 1.2, 812], ["explorer", 4120, 25.4, 2184], ["msedge", 6532, 88.1, 1630], ["powershell", 7012, 2.3, 640], ["lsass", 704, 3.9, 1260], ["spoolsv", 2480, .5, 410], ["System", 4, 210.7, 4800]].map(function (p) { return { Handles: p[3], "CPU(s)": p[2], Id: p[1], ProcessName: p[0], Name: p[0] }; }),
    service: [["Running", "Automatic", "Dhcp", "Client DHCP"], ["Running", "Automatic", "Dnscache", "Client DNS"], ["Running", "Automatic", "Spooler", "Spouleur d'impression"], ["Running", "Automatic", "LanmanServer", "Serveur"], ["Running", "Manual", "Netman", "Connexions réseau"], ["Stopped", "Manual", "RemoteRegistry", "Registre à distance"], ["Running", "Automatic", "mpssvc", "Pare-feu Windows Defender"], ["Stopped", "Disabled", "Fax", "Télécopie"], ["Running", "Manual", "wuauserv", "Windows Update"], ["Stopped", "Manual", "WinRM", "Gestion à distance de Windows (WS-Management)"]]
      .map(function (s) { return { Status: s[0], Name: s[2], DisplayName: s[3], StartType: s[1] }; }),
    netadapter: [{ Name: "Ethernet0", InterfaceDescription: "Intel(R) 82574L Gigabit Network Connection", ifIndex: 4, Status: "Up", MacAddress: "00-0C-29-3E-5B-7A", LinkSpeed: "1 Gbps" },
      { Name: "Wi-Fi", InterfaceDescription: "Intel(R) Wi-Fi 6 AX201 160MHz", ifIndex: 7, Status: "Disconnected", MacAddress: "F4-26-79-1B-0C-22", LinkSpeed: "0 bps" },
      { Name: "Ethernet1", InterfaceDescription: "Realtek USB GbE Family Controller", ifIndex: 12, Status: "Up", MacAddress: "00-E0-4C-68-01-9F", LinkSpeed: "100 Mbps" }],
    localuser: [{ Name: "Administrateur", Enabled: false, Description: "Compte d'utilisateur d'administration" }, { Name: "DefaultAccount", Enabled: false, Description: "Compte utilisateur géré par le système." },
      { Name: "Invité", Enabled: false, Description: "Compte d'utilisateur invité" }, { Name: "user", Enabled: true, Description: "" }, { Name: "WDAGUtilityAccount", Enabled: false, Description: "Compte d'utilisateur géré et utilisé par le système pour les scénarios Windows Defender Application Guard." }],
    localgroup: [["Administrateurs", "Les membres du groupe Administrateurs disposent d'un accès complet et illimité à l'ordinateur et au domaine"], ["Utilisateurs", "Les utilisateurs ne peuvent pas effectuer de modifications accidentelles ou intentionnelles à l'échelle du système"], ["Invités", "Les membres du groupe Invités disposent par défaut du même accès que les membres du groupe Utilisateurs"], ["Utilisateurs du Bureau à distance", "Les membres de ce groupe disposent des droits nécessaires pour ouvrir une session à distance"]].map(function (g) { return { Name: g[0], Description: g[1] }; }),
    smbshare: [{ Name: "ADMIN$", ScopeName: "*", Path: "C:\\Windows", Description: "Administration à distance" }, { Name: "C$", ScopeName: "*", Path: "C:\\", Description: "Partage par défaut" },
      { Name: "IPC$", ScopeName: "*", Path: "", Description: "IPC distant" }, { Name: "Compta", ScopeName: "*", Path: "D:\\Partages\\Compta", Description: "" }],
    volume: [{ DriveLetter: "C", FileSystemLabel: "", FileSystemType: "NTFS", DriveType: "Fixed", HealthStatus: "Healthy", OperationalStatus: "OK", SizeRemaining: 21.4 * GB, Size: 59.4 * GB },
      { DriveLetter: "D", FileSystemLabel: "Donnees", FileSystemType: "NTFS", DriveType: "Fixed", HealthStatus: "Healthy", OperationalStatus: "OK", SizeRemaining: 12.6 * GB, Size: 20 * GB },
      { DriveLetter: "E", FileSystemLabel: "Archives", FileSystemType: "ReFS", DriveType: "Fixed", HealthStatus: "Healthy", OperationalStatus: "OK", SizeRemaining: 4.2 * GB, Size: 24 * GB },
      { DriveLetter: "", FileSystemLabel: "Réservé au système", FileSystemType: "NTFS", DriveType: "Fixed", HealthStatus: "Healthy", OperationalStatus: "OK", SizeRemaining: .2 * GB, Size: .5 * GB }],
    firewall: [["Partage de fichiers et d'imprimantes (Demande d'écho - Trafic entrant ICMPv4)", "False", "Domain, Private", "Inbound", "Allow"], ["Bureau à distance - Mode utilisateur (TCP-In)", "False", "Any", "Inbound", "Allow"], ["Diffusion en continu sur le réseau Windows Media (UDP-In)", "True", "Private", "Inbound", "Allow"], ["Réseau principal - DNS (UDP-Out)", "True", "Any", "Outbound", "Allow"], ["Réseau principal - Protocole DHCP (DHCP-In)", "True", "Any", "Inbound", "Allow"]]
      .map(function (r, i) { return { Name: "{" + (1000 + i) + "}", DisplayName: r[0], Enabled: r[1], Profile: r[2], Direction: r[3], Action: r[4] }; }),
    eventlog: [[48213, 4624, "L'ouverture de session d'un compte s'est correctement déroulée."], [48212, 4672, "Privilèges spéciaux attribués à une nouvelle ouverture de session."], [48211, 4624, "L'ouverture de session d'un compte s'est correctement déroulée."], [48210, 4634, "Fermeture de session d'un compte."], [48209, 4625, "Échec d'ouverture de session d'un compte."]]
      .map(function (e, i) { var d = new Date(Date.now() - i * 3600e3); return { Index: e[0], TimeWritten: d.toLocaleString("fr-FR"), EntryType: e[1] === 4625 ? "FailureAudit" : "SuccessAudit", Source: "Microsoft-Windows-Security-Auditing", EventID: e[1], InstanceId: e[1], Message: e[2] }; }),
    timezone: [{ Id: "Romance Standard Time", DisplayName: "(UTC+01:00) Bruxelles, Copenhague, Madrid, Paris", StandardName: "Paris, Madrid", DaylightName: "Paris, Madrid (heure d'été)", BaseUtcOffset: "01:00:00", SupportsDaylightSavingTime: "True" }],
    verb: [["Add", "Common"], ["Clear", "Common"], ["Copy", "Common"], ["Get", "Common"], ["New", "Common"], ["Remove", "Common"], ["Rename", "Common"], ["Set", "Common"], ["Enable", "Lifecycle"], ["Disable", "Lifecycle"], ["Start", "Lifecycle"], ["Stop", "Lifecycle"], ["Update", "Data"], ["Format", "Common"], ["Select", "Common"]].map(function (v) { return { Verb: v[0], Group: v[1] }; })
  };
  var CMDLETS = ["Add-LocalGroupMember", "Add-Printer", "Clear-Host", "Copy-Item", "Disable-LocalUser", "Enable-LocalUser", "Format-List", "Format-Table", "Format-Wide", "Get-Alias", "Get-ChildItem", "Get-Command", "Get-Content", "Get-Date", "Get-EventLog", "Get-Help", "Get-Host", "Get-LocalGroup", "Get-LocalGroupMember", "Get-LocalUser", "Get-Location", "Get-NetAdapter", "Get-NetFirewallRule", "Get-Printer", "Get-PrinterDriver", "Get-Process", "Get-Service", "Get-SmbShare", "Get-TimeZone", "Get-Verb", "Get-Volume", "New-Item", "New-LocalGroup", "New-LocalUser", "New-NetFirewallRule", "New-SmbShare", "Remove-Item", "Remove-LocalGroup", "Remove-LocalUser", "Remove-Printer", "Rename-LocalUser", "Select-Object", "Set-LocalUser", "Set-Location", "Update-Help", "Where-Object"];
  var SOURCE = { LocalUser: "Microsoft.PowerShell.LocalAccounts", LocalGroup: "Microsoft.PowerShell.LocalAccounts", LocalGroupMember: "Microsoft.PowerShell.LocalAccounts", NetAdapter: "NetAdapter", NetFirewallRule: "NetSecurity", SmbShare: "SmbShare", Volume: "Storage", Printer: "PrintManagement", PrinterDriver: "PrintManagement" };
  var ALIAS = { "?": "Where-Object", where: "Where-Object", select: "Select-Object", fl: "Format-List", ft: "Format-Table", fw: "Format-Wide", gc: "Get-Content", cat: "Get-Content", type: "Get-Content", cd: "Set-Location", sl: "Set-Location", chdir: "Set-Location", pwd: "Get-Location", gl: "Get-Location", ls: "Get-ChildItem", dir: "Get-ChildItem", gci: "Get-ChildItem", help: "Get-Help", man: "Get-Help", cls: "Clear-Host", clear: "Clear-Host", gcm: "Get-Command", gal: "Get-Alias", gsv: "Get-Service", ps: "Get-Process", gps: "Get-Process", ni: "New-Item", rm: "Remove-Item", del: "Remove-Item", copy: "Copy-Item", cp: "Copy-Item" };
  var EXEMPLES = {
    "get-service": "Get-Service | Where -FilterScript { $_.Status -like \"Running\" -and $_.StartType -like \"Automatic\" } | Select Name,Status",
    "get-childitem": "Get-ChildItem -Path C:\\Users", "get-content": "Get-Content C:\\PowerShell\\Intro.txt", "get-command": "Get-Command new-*user*",
    "get-netadapter": "Get-NetAdapter | Select Name,Status,LinkSpeed | Where Status -like Up", "get-smbshare": "Get-SmbShare | Select Name,Path | Where Name -like *$",
    "get-date": "Get-Date | Select DayOfYear", "format-list": "Get-Service | FL -Property Name,Status,DisplayName", "format-table": "Get-TimeZone | FT -Property StandardName,BaseUtcOffset -AutoSize",
    "format-wide": "Get-Process | FW -Property ID -Column 5", "get-localuser": "Get-LocalUser > C:\\temp\\LocalUserList.txt", "where-object": "Get-NetAdapter | Where Status -like Up",
    "select-object": "Get-NetAdapter | Select Name,Status,LinkSpeed", "get-volume": "Get-Volume | Where -FilterScript { $_.SizeRemaining -gt 8GB -and $_.Size -lt 25GB }",
    "get-eventlog": "Get-EventLog -LogName Security | Where EventID -eq 4624 | Select EventID,TimeWritten,Message", "get-netfirewallrule": "Get-NetFirewallRule | Where Enabled -like 'True' | Select DisplayName,Profile,Direction,Action"
  };
  var VUE = { // propriétés affichées par défaut (+ forme)
    process: [["Handles", "CPU(s)", "Id", "ProcessName"], "table"], service: [["Status", "Name", "DisplayName"], "table"],
    netadapter: [["Name", "InterfaceDescription", "ifIndex", "Status", "MacAddress", "LinkSpeed"], "table"], localuser: [["Name", "Enabled", "Description"], "table"],
    localgroup: [["Name", "Description"], "table"], smbshare: [["Name", "ScopeName", "Path", "Description"], "table"],
    volume: [["DriveLetter", "FileSystemLabel", "FileSystemType", "DriveType", "HealthStatus", "OperationalStatus", "SizeRemaining", "Size"], "table"],
    firewall: [["Name", "DisplayName", "Enabled", "Profile", "Direction", "Action"], "list"], eventlog: [["Index", "TimeWritten", "EntryType", "Source", "InstanceId", "Message"], "table"],
    timezone: [["Id", "DisplayName", "StandardName", "BaseUtcOffset"], "list"], verb: [["Verb", "Group"], "table"], command: [["CommandType", "Name", "Version", "Source"], "table"],
    alias: [["CommandType", "Name"], "table"], date: [["DateTime"], "date"], item: [["Mode", "LastWriteTime", "Length", "Name"], "table"], kv: [["Name", "Value"], "table"]
  };
  var TAILLES = { Size: 1, SizeRemaining: 1 };

  window.ENI_SIMU_PS = function (api) {
    var etat = { cwd: "C:\\Users\\user", luIntro: false, redirUsers: false };
    var FS = { "c:\\": ["PowerShell", "temp", "Users", "Windows", "Program Files"], "c:\\powershell": ["Intro.txt"], "c:\\temp": [], "c:\\users": ["Public", "user"], "c:\\users\\public": [],
      "c:\\users\\user": ["Desktop", "Documents", "Downloads"], "c:\\users\\user\\desktop": [], "c:\\users\\user\\documents": [], "c:\\users\\user\\downloads": [], "c:\\windows": ["System32", "explorer.exe"], "c:\\windows\\system32": [], "c:\\program files": [] };
    var FICH = { "c:\\powershell\\intro.txt": "Bienvenue dans PowerShell !\nUne cmdlet = Verbe-Nom (Get-Help, Get-Command…).\nGet-Command pour trouver, Get-Help pour comprendre.", "c:\\windows\\explorer.exe": "MZ…" };

    function chemin(p) {
      p = (p || "").replace(/^["']|["']$/g, "").replace(/\//g, "\\");
      if (!p || p === ".") return etat.cwd;
      var abs = /^[a-z]:/i.test(p) ? p : (p[0] === "\\" ? "C:" + p : etat.cwd.replace(/\\$/, "") + "\\" + p), parts = [];
      abs.split("\\").forEach(function (s, i) { if (i === 0) { parts.push(s.toUpperCase()); return; } if (!s || s === ".") return; if (s === "..") { if (parts.length > 1) parts.pop(); } else parts.push(s); });
      var r = parts.join("\\"); if (parts.length === 1) r += "\\"; return r;
    }
    function cle(p) { var k = p.toLowerCase().replace(/\\+$/, ""); return k.length <= 2 ? k + "\\" : k; }
    function joindre(d, n) { return d.replace(/\\+$/, "") + "\\" + n; }
    function nomReel(p) { // retrouve la casse d'origine
      var parts = p.split("\\").filter(Boolean), cur = parts[0].toUpperCase();
      for (var i = 1; i < parts.length; i++) { var l = FS[cle(cur)] || [], n = l.filter(function (x) { return x.toLowerCase() === parts[i].toLowerCase(); })[0] || parts[i]; cur = joindre(cur, n); }
      return parts.length === 1 ? cur + "\\" : cur;
    }

    // ---------- Formatage ----------
    function val(o, p) { var v = o[p]; if (v === undefined) { for (var k in o) if (k.toLowerCase() === p.toLowerCase()) return o[k]; return ""; } return v; }
    function vrai(p, o) { for (var k in o) if (k.toLowerCase() === p.toLowerCase()) return k; return p; }
    function aff(p, v) {
      if (v === true) return "True"; if (v === false) return "False"; if (v === null || v === undefined) return "";
      if (TAILLES[p] && typeof v === "number") return (v / GB).toFixed(2).replace(".", ",") + " GB";
      if (typeof v === "number" && !Number.isInteger(v)) return v.toFixed(2).replace(".", ",");
      return String(v);
    }
    function table(objs, props) {
      if (!objs.length) return [];
      var w = props.map(function (p) { return Math.max(p.length, Math.min(60, objs.reduce(function (m, o) { return Math.max(m, aff(p, val(o, p)).length); }, 0))); });
      var l = ["", props.map(function (p, i) { return (p + " ".repeat(w[i])).slice(0, w[i]); }).join(" ").replace(/\s+$/, ""), props.map(function (p, i) { return ("-".repeat(p.length) + " ".repeat(w[i])).slice(0, w[i]); }).join(" ").replace(/\s+$/, "")];
      objs.forEach(function (o) { l.push(props.map(function (p, i) { var s = aff(p, val(o, p)); if (s.length > w[i]) s = s.slice(0, w[i] - 3) + "..."; return (s + " ".repeat(w[i])).slice(0, w[i]); }).join(" ").replace(/\s+$/, "")); });
      l.push(""); return l;
    }
    function liste(objs, props) {
      var w = Math.max.apply(null, props.map(function (p) { return p.length; })), l = [""];
      objs.forEach(function (o) { props.forEach(function (p) { l.push((p + " ".repeat(w)).slice(0, w) + " : " + aff(p, val(o, p))); }); l.push(""); });
      return l;
    }
    function large(objs, prop, cols) {
      cols = cols || 2; var vals = objs.map(function (o) { return aff(prop, val(o, prop)); }), w = Math.max.apply(null, vals.map(function (v) { return v.length; }).concat([4])) + 4, l = [""];
      for (var i = 0; i < vals.length; i += cols) l.push(vals.slice(i, i + cols).map(function (v) { return (v + " ".repeat(w)).slice(0, w); }).join("").replace(/\s+$/, ""));
      l.push(""); return l;
    }
    function rendu(r) {
      if (r.text) return r.text;
      var objs = r.objs || []; if (!objs.length) return [];
      if (r.type === "date" && !r.props) return ["", objs[0].DateTime, ""];
      var props = r.props || (VUE[r.type] || [Object.keys(objs[0])])[0];
      if (r.type === "item" && !r.props) return ["", "    Répertoire : " + r.dossier, ""].concat(table(objs, props).slice(1));
      var forme = r.props ? (props.length > 4 ? "list" : "table") : (VUE[r.type] || [0, "table"])[1];
      return forme === "list" ? liste(objs, props) : table(objs, props);
    }

    // ---------- Comparaisons / filtres ----------
    function nombre(v) {
      if (typeof v === "number") return v; if (typeof v === "boolean") return null;
      var s = String(v).trim(), m = s.match(/^(-?[\d.,]+)\s*(kb|mb|gb|tb)?$/i);
      if (m) return parseFloat(m[1].replace(",", ".")) * ({ kb: 1024, mb: 1048576, gb: GB, tb: GB * 1024 }[(m[2] || "").toLowerCase()] || 1);
      m = s.match(/^([\d.]+)\s*(k|m|g)?bps$/i); if (m) return parseFloat(m[1]) * ({ k: 1e3, m: 1e6, g: 1e9 }[(m[2] || "").toLowerCase()] || 1);
      return null;
    }
    function comparer(a, op, b) {
      var cs = op[0] === "c"; if (cs) op = op.slice(1);
      if (op[0] === "i") op = op.slice(1);
      var sa = aff("", a), sb = String(b);
      if (op === "like" || op === "notlike") {
        var rx = new RegExp("^" + sb.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".") + "$", cs ? "" : "i"), t = rx.test(sa);
        return op === "like" ? t : !t;
      }
      var na = nombre(a), nb = nombre(b);
      if (na !== null && nb !== null) return { eq: na === nb, ne: na !== nb, gt: na > nb, ge: na >= nb, lt: na < nb, le: na <= nb }[op];
      if (!cs) { sa = sa.toLowerCase(); sb = sb.toLowerCase(); }
      var c = sa < sb ? -1 : sa > sb ? 1 : 0;
      return { eq: c === 0, ne: c !== 0, gt: c > 0, ge: c >= 0, lt: c < 0, le: c <= 0 }[op];
    }
    function decouper(s) { // découpe en mots en respectant les guillemets
      var t = [], m, rx = /"([^"]*)"|'([^']*)'|(\S+)/g;
      while ((m = rx.exec(s))) t.push(m[1] !== undefined ? m[1] : m[2] !== undefined ? m[2] : m[3]);
      return t;
    }
    function condition(expr) { // $_.Prop -op val (-and|-or …)
      var t = decouper(expr), conds = [], liens = [];
      for (var i = 0; i < t.length;) {
        var p = t[i].replace(/^\$(_|psitem)\./i, ""), op = (t[i + 1] || "").replace(/^-/, "").toLowerCase(), v = t[i + 2];
        if (!op || v === undefined) throw new Error("Expression de filtre incomplète : « " + expr.trim() + " »");
        if (v === "$true") v = "True"; if (v === "$false") v = "False";
        conds.push([p, op, v]); i += 3;
        if (t[i]) { liens.push(t[i].toLowerCase()); i++; }
      }
      return function (o) {
        var r = comparer(val(o, conds[0][0]), conds[0][1], conds[0][2]);
        for (var k = 1; k < conds.length; k++) { var x = comparer(val(o, conds[k][0]), conds[k][1], conds[k][2]); r = liens[k - 1] === "-or" ? (r || x) : (r && x); }
        return r;
      };
    }

    // ---------- Cmdlets ----------
    function objs(type, l) { return { objs: l.map(function (o) { var c = {}; for (var k in o) c[k] = o[k]; return c; }), type: type }; }
    function param(args, nom) { for (var i = 0; i < args.length; i++) if (args[i].toLowerCase() === "-" + nom) return args[i + 1]; return null; }
    function positionnels(args, avecValeur) {
      var r = []; for (var i = 0; i < args.length; i++) { if (args[i][0] === "-" && args[i].length > 1) { if ((avecValeur || []).indexOf(args[i].slice(1).toLowerCase()) !== -1) i++; continue; } r.push(args[i]); } return r;
    }
    function aide(nom, args) {
      var n = CMDLETS.filter(function (c) { return c.toLowerCase() === (ALIAS[nom.toLowerCase()] || nom).toLowerCase(); })[0];
      if (/^about_/i.test(nom)) {
        if (/\*/.test(nom)) return ["", "Name                              Category  Module  Synopsis", "----                              --------  ------  --------", "about_Aliases                     HelpFile          Décrit comment utiliser des alias", "about_Comparison_Operators        HelpFile          Décrit les opérateurs de comparaison", "about_Pipelines                   HelpFile          Combiner des commandes dans des pipelines", "about_Redirection                 HelpFile          Rediriger la sortie vers des fichiers", ""];
        return ["", "RUBRIQUE", "    " + nom, "", "    (simulateur) Rubrique d'aide conceptuelle. Voir le cours : Systèmes clients M11.", ""];
      }
      if (!n) return { err: "Get-Help : Get-Help n'a pas trouvé " + nom + " dans une rubrique d'aide." };
      var low = n.toLowerCase(), ex = EXEMPLES[low] || n;
      if (args.some(function (a) { return /^-examples?$/i.test(a); })) return ["", "NOM", "    " + n, "", "    -------------------------- EXEMPLE 1 --------------------------", "", "    PS C:\\> " + ex, ""];
      if (args.some(function (a) { return /^-online$/i.test(a); })) return ["(simulateur) Ouvrirait l'aide à jour de " + n + " sur le site de Microsoft."];
      if (args.some(function (a) { return /^-showwindow$/i.test(a); })) return ["(simulateur) Ouvrirait l'aide de " + n + " dans une fenêtre séparée."];
      return ["", "NOM", "    " + n, "", "SYNTAXE", "    " + n + " [<paramètres>] [<CommonParameters>]", "", "ALIAS", "    " + (Object.keys(ALIAS).filter(function (a) { return ALIAS[a] === n; }).join(", ") || "Aucun(e)"), "", "REMARQUES",
        "    Pour voir les exemples, tapez : \"get-help " + n + " -examples\".", "    Pour obtenir les informations les plus récentes, tapez : \"get-help " + n + " -online\".", ""];
    }
    function lister(dossier) {
      var k = cle(dossier), l = FS[k];
      if (!l) return null;
      return l.map(function (n) { var p = cle(joindre(k, n)), dir = !!FS[p]; return { Mode: dir ? "d-----" : "-a----", LastWriteTime: "09/11/2026     08:" + ("0" + (n.length * 7 % 60)).slice(-2), Length: dir ? "" : (FICH[p] || "").length, Name: n }; });
    }
    var CMD = {
      "get-process": function () { return objs("process", DATA.process); },
      "get-service": function (a) { var n = positionnels(a)[0]; return objs("service", DATA.service.filter(function (s) { return !n || comparer(s.Name, "like", n); })); },
      "get-netadapter": function () { return objs("netadapter", DATA.netadapter); },
      "get-localuser": function () { return objs("localuser", DATA.localuser); },
      "get-localgroup": function () { return objs("localgroup", DATA.localgroup); },
      "get-smbshare": function () { return objs("smbshare", DATA.smbshare); },
      "get-volume": function () { return objs("volume", DATA.volume); },
      "get-netfirewallrule": function () { return objs("firewall", DATA.firewall); },
      "get-timezone": function () { return objs("timezone", DATA.timezone); },
      "get-verb": function () { return objs("verb", DATA.verb); },
      "get-eventlog": function (a) {
        var l = param(a, "logname") || positionnels(a, ["newest"])[0];
        if (!l) return { err: "Get-EventLog : paramètre -LogName manquant (ex. Get-EventLog -LogName Security)." };
        if (!/^security$/i.test(l)) return { text: ["", "(simulateur) Seul le journal Security est simulé.", ""] };
        return objs("eventlog", DATA.eventlog);
      },
      "get-date": function () {
        var d = new Date(), j = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5);
        return { objs: [{ DateTime: d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) + " " + d.toLocaleTimeString("fr-FR"), Day: d.getDate(), DayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][d.getDay()], DayOfYear: j, Month: d.getMonth() + 1, Year: d.getFullYear(), Hour: d.getHours(), Minute: d.getMinutes() }], type: "date" };
      },
      "get-host": function () { return { text: ["", "Name             : ConsoleHost", "Version          : 5.1.19041.5129", "CurrentCulture   : fr-FR", "CurrentUICulture : fr-FR", ""] }; },
      "$psversiontable": function () { return { objs: [["PSVersion", "5.1.19041.5129"], ["PSEdition", "Desktop"], ["PSCompatibleVersions", "{1.0, 2.0, 3.0, 4.0...}"], ["BuildVersion", "10.0.19041.5129"], ["CLRVersion", "4.0.30319.42000"], ["WSManStackVersion", "3.0"], ["PSRemotingProtocolVersion", "2.3"], ["SerializationVersion", "1.1.0.1"]].map(function (x) { return { Name: x[0], Value: x[1] }; }), type: "kv" }; },
      "get-help": function (a) { var n = positionnels(a)[0]; if (!n) return { text: ["", "RUBRIQUE", "    Système d'aide de Windows PowerShell", "", "    Get-Help <cmdlet>, Get-Help -Examples <cmdlet>, Help about_*", ""] }; var r = aide(n, a); return r.err ? r : { text: r }; },
      "update-help": function () { return { text: ["(simulateur) Update-Help : nécessite internet et les droits administrateur (-Force pour dépasser la limite d'une mise à jour par jour)."] }; },
      "get-command": function (a) {
        var verbe = param(a, "verb"), nomP = param(a, "noun"), motif = positionnels(a, ["verb", "noun"])[0];
        var l = CMDLETS.filter(function (c) { var p = c.split("-"); return (!verbe || comparer(p[0], "like", verbe)) && (!nomP || comparer(p[1], "like", nomP)) && (!motif || comparer(c, "like", motif)); });
        return { objs: l.map(function (c) { var src = SOURCE[c.split("-")[1]] || (/-(Item|Content|Location|ChildItem|Service|Process)$/.test(c) ? "Microsoft.PowerShell.Management" : "Microsoft.PowerShell.Utility"); return { CommandType: "Cmdlet", Name: c, Version: src === "Microsoft.PowerShell.Utility" || src === "Microsoft.PowerShell.Management" ? "3.1.0.0" : "1.0.0.0", Source: src }; }), type: "command" };
      },
      "get-alias": function (a) {
        var def = param(a, "definition"), n = positionnels(a, ["definition"])[0];
        var l = Object.keys(ALIAS).sort().filter(function (k) { return (!def || ALIAS[k].toLowerCase() === def.toLowerCase()) && (!n || comparer(k, "like", n)); });
        return { objs: l.map(function (k) { return { CommandType: "Alias", Name: k + " -> " + ALIAS[k], Definition: ALIAS[k] }; }), type: "alias" };
      },
      "get-location": function () { return { text: ["", "Path", "----", etat.cwd, ""] }; },
      "set-location": function (a) {
        var p = param(a, "path") || positionnels(a, ["path"])[0]; if (!p) { etat.cwd = "C:\\Users\\user"; return { text: [] }; }
        if (p === "~") p = "C:\\Users\\user";
        var c = chemin(p); if (!FS[cle(c)]) return { err: "Set-Location : Impossible de trouver le chemin d'accès « " + c + " », car il n'existe pas." };
        etat.cwd = nomReel(c); return { text: [] };
      },
      "get-childitem": function (a) {
        var p = chemin(param(a, "path") || positionnels(a, ["path"])[0]), l = lister(p);
        if (!l) return FICH[cle(p)] !== undefined ? { objs: [{ Mode: "-a----", LastWriteTime: "09/11/2026     08:00", Length: FICH[cle(p)].length, Name: p.split("\\").pop() }], type: "item", dossier: p.replace(/\\[^\\]+$/, "") } : { err: "Get-ChildItem : Impossible de trouver le chemin d'accès « " + p + " », car il n'existe pas." };
        return { objs: l, type: "item", dossier: nomReel(p) };
      },
      "get-content": function (a) {
        var p = param(a, "path") || positionnels(a, ["path"])[0]; if (!p) return { err: "Get-Content : paramètre -Path manquant." };
        var c = chemin(p), k = cle(c);
        if (FICH[k] === undefined) return { err: "Get-Content : Impossible de trouver le chemin d'accès « " + c + " », car il n'existe pas." };
        if (k === "c:\\powershell\\intro.txt") etat.luIntro = true;
        return { text: FICH[k].split("\n") };
      },
      "clear-host": function () { return { clear: true }; },
      "select-object": function (a, entree) {
        if (!entree || !entree.objs) return { err: "Select-Object : aucun objet en entrée (utilise le pipeline |)." };
        var first = param(a, "first"), props = positionnels(a, ["first", "last"]).join(",").split(",").map(function (s) { return s.trim(); }).filter(Boolean);
        var l = entree.objs.slice(0, first ? +first : undefined);
        if (!props.length) return { objs: l, type: entree.type, props: entree.props };
        if (props.length === 1 && props[0] === "*") { var tous = Object.keys(l[0] || {}); return { objs: l, type: entree.type, props: tous }; }
        var vrais = props.map(function (p) { return l[0] ? vrai(p, l[0]) : p; });
        return { objs: l.map(function (o) { var n = {}; vrais.forEach(function (p) { n[p] = val(o, p); }); return n; }), type: entree.type, props: vrais };
      },
      "where-object": function (a, entree, brut) {
        if (!entree || !entree.objs) return { err: "Where-Object : aucun objet en entrée (utilise le pipeline |)." };
        var m = brut.match(/\{(.*)\}/), f;
        try { f = m ? condition(m[1]) : condition(a.join(" ").replace(/^-property /i, "")); } catch (e) { return { err: "Where-Object : " + e.message }; }
        return { objs: entree.objs.filter(f), type: entree.type, props: entree.props };
      },
      "format-list": function (a, entree) { if (!entree || !entree.objs) return { text: [] }; var p = positionnels(a).join(",").split(",").filter(Boolean); if (!p.length) p = entree.props || (VUE[entree.type] || [Object.keys(entree.objs[0] || {})])[0]; if (p[0] === "*") p = Object.keys(entree.objs[0] || {}); p = p.map(function (x) { return entree.objs[0] ? vrai(x, entree.objs[0]) : x; }); return { text: liste(entree.objs, p) }; },
      "format-table": function (a, entree) { if (!entree || !entree.objs) return { text: [] }; var p = positionnels(a).join(",").split(",").filter(Boolean); if (!p.length) p = entree.props || (VUE[entree.type] || [Object.keys(entree.objs[0] || {})])[0]; if (p[0] === "*") p = Object.keys(entree.objs[0] || {}); p = p.map(function (x) { return entree.objs[0] ? vrai(x, entree.objs[0]) : x; }); return { text: table(entree.objs, p) }; },
      "format-wide": function (a, entree) { if (!entree || !entree.objs) return { text: [] }; var p = positionnels(a, ["column"])[0] || (entree.props || (VUE[entree.type] || [["Name"]])[0])[0]; return { text: large(entree.objs, entree.objs[0] ? vrai(p, entree.objs[0]) : p, +param(a, "column") || 2) }; }
    };

    // ---------- Normalisation (pour les missions) ----------
    function etapes(ligne) {
      var r = [], cur = "", q = null, acc = 0;
      for (var i = 0; i < ligne.length; i++) {
        var ch = ligne[i];
        if (q) { if (ch === q) q = null; cur += ch; continue; }
        if (ch === '"' || ch === "'") { q = ch; cur += ch; continue; }
        if (ch === "{") acc++; if (ch === "}") acc--;
        if (ch === "|" && !acc) { r.push(cur.trim()); cur = ""; continue; }
        cur += ch;
      }
      r.push(cur.trim()); return r;
    }
    function normaliser(ligne) {
      return etapes(ligne).map(function (e) {
        var t = e.split(/\s+/), n = t[0].toLowerCase(); n = (ALIAS[n] || n).toLowerCase();
        return [n].concat(t.slice(1)).join(" ").toLowerCase().replace(/\s*,\s*/g, ",").replace(/^(select-object|format-list|format-table) -property /, "$1 ");
      }).join(" | ");
    }

    // ---------- Exécution ----------
    function executer(ligne) {
      // redirections (à la fin de la ligne)
      var redir = null, err2 = null, m;
      if ((m = ligne.match(/\s+2>&1\s*$/))) { err2 = "joint"; ligne = ligne.slice(0, m.index); }
      if ((m = ligne.match(/\s+2>\s*\$null\s*$/i))) { err2 = "null"; ligne = ligne.slice(0, m.index); }
      if ((m = ligne.match(/\s+2(>>?)\s*(\S+)\s*$/))) { err2 = { f: m[2], ajout: m[1] === ">>" }; ligne = ligne.slice(0, m.index); }
      if ((m = ligne.match(/\s+1?(>>?)\s*(\S+)(\s+2>&1)?\s*$/))) { redir = { f: m[2], ajout: m[1] === ">>" }; if (m[3]) err2 = "joint"; ligne = ligne.slice(0, m.index); }
      var et = etapes(ligne), res = null, sortie = [], erreur = null, premier = "";
      for (var i = 0; i < et.length; i++) {
        var toks = decouper(et[i]); if (!toks.length) continue;
        var n = toks[0].toLowerCase(); n = (ALIAS[n] || n).toLowerCase(); if (!i) premier = n;
        if (toks.slice(1).some(function (x) { return x === "-?"; })) { res = { text: aide(toks[0], []) }; continue; }
        var f = CMD[n];
        if (!f) {
          if (CMDLETS.some(function (c) { return c.toLowerCase() === n; })) { erreur = toks[0] + " : (simulateur) cette cmdlet existe mais n'est pas simulée ici. Essaie Get-Help " + toks[0] + "."; break; }
          if (/^\(get-/.test(n)) { erreur = "(simulateur) La syntaxe (Get-…).Propriété n'est pas simulée : utilise | Select Propriété."; break; }
          erreur = toks[0] + " : Le terme « " + toks[0] + " » n'est pas reconnu comme nom d'applet de commande, fonction, fichier de script ou programme exécutable.\nVérifiez l'orthographe du nom, ou si un chemin d'accès existe, vérifiez que le chemin d'accès est correct et réessayez.";
          break;
        }
        res = f(toks.slice(1), res, et[i]);
        if (res.err) { erreur = res.err; break; }
        if (res.clear) return { clear: true };
      }
      if (!erreur && res) sortie = rendu(res);
      var errLignes = erreur ? erreur.split("\n") : [];
      function ecrireFichier(r, lignes) {
        var c = chemin(r.f), dossier = cle(c.replace(/\\[^\\]+$/, "") || "C:\\");
        if (!FS[dossier] && !FS[dossier + "\\"]) return "out-file : Une partie du chemin d'accès « " + c + " » est introuvable.";
        var k = cle(c), nom = c.split("\\").pop();
        if (FICH[k] === undefined) (FS[dossier] || FS[dossier + "\\"]).push(nom);
        FICH[k] = (r.ajout && FICH[k] ? FICH[k] + "\n" : "") + lignes.join("\n");
        return null;
      }
      var aff = [];
      if (redir) {
        var contenu = sortie.concat(err2 === "joint" ? errLignes : []), e = ecrireFichier(redir, contenu);
        if (e) aff.push({ t: e, err: true });
        else if (premier === "get-localuser" && cle(chemin(redir.f)) === "c:\\temp\\localuserlist.txt" && !erreur) etat.redirUsers = true;
        if (erreur && err2 !== "joint" && err2 !== "null" && !err2) aff.push({ t: errLignes.join("\n"), err: true });
      } else {
        sortie.forEach(function (l) { aff.push({ t: l }); });
        if (erreur) {
          if (err2 === "null") { /* rien */ }
          else if (err2 && err2.f) { var e2 = ecrireFichier(err2, errLignes); if (e2) aff.push({ t: e2, err: true }); }
          else aff.push({ t: errLignes.join("\n"), err: true });
        }
      }
      return { lignes: aff, norm: normaliser(ligne.trim()) };
    }

    return {
      missions: MISSIONS, etat: etat,
      prompt: function () { return "PS " + etat.cwd + "> "; },
      accueil: "Windows PowerShell\nCopyright (C) Microsoft Corporation. Tous droits réservés.\n\nTape les cmdlets vues en cours (Get-Help, Get-Command…). « aide » pour l'aide du simulateur.",
      aide: "Cmdlets simulées : Get-Help, Get-Command, Get-Alias, Get-Verb, $PSVersionTable, Get-Host, Get-ChildItem, Get-Content, Set-Location, Get-Location,\nGet-Process, Get-Service, Get-NetAdapter, Get-LocalUser, Get-LocalGroup, Get-SmbShare, Get-Volume, Get-NetFirewallRule, Get-EventLog, Get-TimeZone, Get-Date,\nSelect-Object, Where-Object (simple ou -FilterScript { }), Format-List/Table/Wide, redirections > >> 2> 2>$null 2>&1, Clear-Host. Alias : select, where, ?, fl, ft, fw, gc, cd, ls, dir, gci…",
      executer: executer, normaliser: normaliser, cmdlets: CMDLETS.concat(Object.keys(ALIAS), ["$PSVersionTable"])
    };
  };
})();
/* ============================================================
   Simulateur de terminal (page Réviser > Simulateur)
   Faux terminal Linux (bash) et Windows (cmd) avec des sorties réalistes
   et des missions basées uniquement sur les commandes des cours.
   Bloc dans la page : <div id="app-simu"></div>
   ============================================================ */
(function () {
  "use strict";

  // ---------------- Missions ----------------
  var MISSIONS = {
    linux: [
      { id: "sh", txt: "Lance le Bourne shell (sh), puis reviens dans bash avec la commande compatible avec presque tous les shells.", ind: "Linux M2 : les shells, exit / logout", sol: "sh  puis  exit", ok: function (c, s) { return c === "exit" && s.quitte === "sh"; } },
      { id: "pwd", txt: "Affiche le dossier dans lequel tu te trouves.", ind: "Linux M3 : « où on est dans les dossiers »", sol: "pwd", ok: function (c) { return c === "pwd"; } },
      { id: "id", txt: "Affiche ton UID, ton GID et tes groupes.", ind: "Linux M3 : infos de groupes, UID, GID", sol: "id", ok: function (c) { return c === "id"; } },
      { id: "who", txt: "Affiche les utilisateurs connectés.", ind: "Linux M3", sol: "who", ok: function (c) { return c === "who"; } },
      { id: "date", txt: "Affiche la date au format « lundi 24 septembre 2009 ».", ind: "Linux M3 : date avec un format (%A %d %B %Y)", sol: 'date "+%A %d %B %Y"', ok: function (c) { return /^date ["']\+%A %d %B %Y["']$/.test(c); } },
      { id: "cal", txt: "Affiche le calendrier de janvier 1900.", ind: "Linux M3 : cal [mois] [année]", sol: "cal 1 1900", ok: function (c) { return /^cal 0?1 1900$/.test(c); } },
      { id: "cd", txt: "Va dans /var/log, puis reviens dans ton répertoire personnel.", ind: "Linux M4 : cd avec un chemin absolu, puis cd (ou cd ~)", sol: "cd /var/log  puis  cd", ok: function (c, s) { return s.vuLog && s.cwd === "/home/user"; } },
      { id: "ipaddr", txt: "Affiche les adresses IP de la machine.", ind: "Réseau M5 : la commande ip", sol: "ip addr", ok: function (c) { return /^ip (-4 )?(a|addr|address)( show)?$/.test(c); } },
      { id: "iproute", txt: "Affiche la table de routage.", ind: "Réseau M5 : ip …", sol: "ip route", ok: function (c) { return /^ip r(oute)?( show)?$/.test(c); } },
      { id: "ping", txt: "Envoie exactement 4 pings vers 8.8.8.8.", ind: "Réseau M5 : option -c sous Linux", sol: "ping -c 4 8.8.8.8", ok: function (c) { return /^ping -c ?4 8\.8\.8\.8$/.test(c); } },
      { id: "route", txt: "Ajoute une route vers 10.0.0.0/8 via 192.168.1.254 (il faut les droits).", ind: "Réseau M5 : ip route add réseau/masque via passerelle", sol: "sudo ip route add 10.0.0.0/8 via 192.168.1.254", ok: function (c) { return /^sudo ip r(oute)? add 10\.0\.0\.0\/8 via 192\.168\.1\.254$/.test(c); } }
    ],
    windows: [
      { id: "ipconfig", txt: "Affiche ton adresse IP, ton masque et ta passerelle.", ind: "Réseau M5 : ipconfig", sol: "ipconfig", ok: function (c) { return c === "ipconfig"; } },
      { id: "all", txt: "Affiche toutes les informations réseau détaillées (MAC, DNS, DHCP…).", ind: "Réseau M5 : ipconfig + option", sol: "ipconfig /all", ok: function (c) { return c === "ipconfig /all"; } },
      { id: "renew", txt: "Ton PC est en APIPA (169.254.x.x) : libère puis redemande une IP au DHCP.", ind: "Réseau M5, exercice 1", sol: "ipconfig /release  puis  ipconfig /renew", ok: function (c, s) { return c === "ipconfig /renew" && s.renouvele; } },
      { id: "flush", txt: "Un site a changé d'IP mais ton PC va toujours à l'ancienne : vide le cache DNS.", ind: "Réseau M5, exercice 2", sol: "ipconfig /flushdns", ok: function (c) { return c === "ipconfig /flushdns"; } },
      { id: "ping", txt: "Envoie exactement 4 pings vers 8.8.8.8.", ind: "Réseau M5 : option -n sous Windows", sol: "ping -n 4 8.8.8.8", ok: function (c) { return /^ping -n ?4 8\.8\.8\.8$/.test(c); } },
      { id: "arp", txt: "Affiche la table ARP (correspondances IP / MAC).", ind: "Réseau M4 : ARP", sol: "arp -a", ok: function (c) { return c === "arp -a"; } },
      { id: "netstat", txt: "Affiche toutes les connexions et les ports, au format numérique.", ind: "Réseau M5 : netstat", sol: "netstat -an", ok: function (c) { return c === "netstat -an"; } },
      { id: "tracert", txt: "Trace la route vers www.google.com sans résolution de noms, 15 sauts maximum.", ind: "Réseau M5, exercice 7", sol: "tracert /d /h 15 www.google.com", ok: function (c) { return /^tracert /.test(c) && / \/d( |$)/.test(c) && /\/h 15/.test(c) && /google\.com/.test(c); } },
      { id: "nslookup", txt: "Diagnostique la résolution de noms de www.facebook.com.", ind: "Systèmes clients M7, exercice 3", sol: "nslookup www.facebook.com", ok: function (c) { return c === "nslookup www.facebook.com"; } },
      { id: "netuser", txt: "Liste les comptes utilisateurs locaux en ligne de commande.", ind: "Systèmes clients M5 : net user / net localgroup", sol: "net user", ok: function (c) { return c === "net user"; } },
      { id: "driverquery", txt: "Liste les pilotes installés en affichant s'ils sont signés.", ind: "Systèmes clients M9 : driverquery", sol: "driverquery /si", ok: function (c) { return /^driverquery \/si$/.test(c); } }
    ]
  };
  if (window.ENI_SIMU_PS) MISSIONS.powershell = window.ENI_SIMU_PS({}).missions;
  window.ENI_SIMU_MISSIONS = { linux: MISSIONS.linux.length, windows: MISSIONS.windows.length, powershell: (MISSIONS.powershell || []).length };

  // ---------------- Système de fichiers Linux ----------------
  var FS = {
    "/": ["bin", "boot", "dev", "etc", "home", "lib", "media", "mnt", "opt", "proc", "root", "sbin", "sys", "tmp", "var"],
    "/home": ["user"], "/home/user": ["Documents", "Images", "Téléchargements", "notes.txt"],
    "/home/user/Documents": ["cours-linux.txt"], "/home/user/Images": [], "/home/user/Téléchargements": [],
    "/var": ["log", "www"], "/var/log": ["syslog", "auth.log", "dpkg.log"], "/var/www": [], "/etc": ["hostname", "hosts", "passwd", "network"], "/etc/network": ["interfaces"],
    "/tmp": [], "/media": [], "/mnt": [], "/opt": [], "/boot": ["vmlinuz", "initrd.img"], "/bin": ["bash", "ls", "cat", "date", "ping"], "/sbin": ["ip", "reboot"],
    "/dev": ["sda", "sda1", "tty1"], "/lib": [], "/proc": ["cpuinfo", "meminfo"], "/sys": [], "/root": null
  };
  var FICHIERS = {
    "/home/user/notes.txt": "Penser à réviser le Module 4 : fichiers et dossiers.",
    "/home/user/Documents/cours-linux.txt": "pwd, cd, cd .., cd ~ … voir le site !",
    "/etc/hostname": "debian", "/etc/hosts": "127.0.0.1\tlocalhost\n127.0.1.1\tdebian",
    "/var/log/syslog": "Nov  9 08:00:01 debian systemd[1]: Started Daily apt download activities.\nNov  9 08:02:13 debian dhclient[512]: bound to 192.168.1.25 -- renewal in 41257 seconds."
  };
  function chemin(cwd, arg) {
    if (!arg || arg === "~") return "/home/user";
    var p = arg.indexOf("~/") === 0 ? "/home/user/" + arg.slice(2) : (arg[0] === "/" ? arg : cwd + "/" + arg), out = [];
    p.split("/").forEach(function (s) { if (!s || s === ".") return; if (s === "..") out.pop(); else out.push(s); });
    return "/" + out.join("/");
  }
  var JOURS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"],
    MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  function p2(n) { return ("0" + n).slice(-2); }
  function formatDate(fmt, d) {
    return fmt.replace(/%([AdBYHMSXnmy])/g, function (_, k) {
      return { A: JOURS[d.getDay()], d: p2(d.getDate()), B: MOIS[d.getMonth()], Y: d.getFullYear(), H: p2(d.getHours()), M: p2(d.getMinutes()), S: p2(d.getSeconds()),
        X: p2(d.getHours()) + ":" + p2(d.getMinutes()) + ":" + p2(d.getSeconds()), n: "\n", m: p2(d.getMonth() + 1), y: String(d.getFullYear()).slice(2) }[k];
    });
  }
  function calMois(m, y, avecAnnee) {
    var t = MOIS[m] + (avecAnnee ? " " + y : ""), l = [];
    l.push((" ".repeat(Math.max(0, Math.floor((20 - t.length) / 2))) + t));
    l.push("di lu ma me je ve sa");
    var d = new Date(y, m, 1), nb = new Date(y, m + 1, 0).getDate(), ligne = "   ".repeat(d.getDay());
    for (var j = 1; j <= nb; j++) { ligne += (j < 10 ? " " : "") + j + " "; if ((d.getDay() + j) % 7 === 0) { l.push(ligne.replace(/\s+$/, "")); ligne = ""; } }
    if (ligne) l.push(ligne.replace(/\s+$/, ""));
    return l.join("\n");
  }
  function ms() { return 12 + Math.floor(Math.random() * 6); }

  // ---------------- Appli ----------------
  function appSimu(root) {
    var E = window.ENI, esc = E.esc, store = E.store;
    var os = store.get("simu:os", "linux"), etat, busy = false;
    root.innerHTML = '<div class="eni-simu-onglets"><span class="grp">🐧 Linux</span><button type="button" data-os="linux">bash</button><span class="grp">🪟 Windows</span><button type="button" data-os="windows">cmd</button><button type="button" data-os="powershell">PowerShell</button></div>' +
      '<div class="eni-simu"><div class="eni-simu-term"><div class="eni-term-barre"><i></i><i></i><i></i><span class="titre"></span></div><div class="eni-term-sortie"></div><div class="eni-term-ligne"><span class="ps"></span><input type="text" spellcheck="false" autocomplete="off" aria-label="Commande"></div></div>' +
      '<div class="eni-simu-missions"><h4>$ missions <span class="cpt"></span></h4><ol></ol><button type="button" class="exo-btn sec b-raz">↺ Recommencer les missions</button></div></div>';
    var sortie = root.querySelector(".eni-term-sortie"), inp = root.querySelector("input"), ps = root.querySelector(".ps"), ol = root.querySelector("ol"), hist = [], hpos = 0;

    function ecrire(txt, cls) { var d = document.createElement("div"); d.className = cls || ""; d.textContent = txt; sortie.appendChild(d); sortie.scrollTop = sortie.scrollHeight; }
    function lignes(arr, delai, fin) { // affichage progressif (ping, tracert…)
      busy = true; var i = 0;
      (function suite() { if (i >= arr.length) { busy = false; if (fin) fin(); inp.focus(); return; } ecrire(arr[i++]); setTimeout(suite, delai); })();
    }
    var psh = null;
    function prompt() {
      if (os === "powershell") return psh.prompt();
      if (os === "linux" && etat.shells.length) { var sh = etat.shells[etat.shells.length - 1]; return /csh/.test(sh) ? "% " : "$ "; }
      if (os === "linux") { var c = etat.cwd === "/home/user" ? "~" : etat.cwd.replace(/^\/home\/user/, "~"); return "user@debian:" + c + "$ "; }
      return etat.cwd + ">";
    }
    function majPs() { ps.textContent = prompt(); }
    function faits() { return store.get("simu:" + os, {}); }
    function majMissions() {
      var f = faits(), l = MISSIONS[os], prochaine = -1;
      ol.innerHTML = l.map(function (m, k) {
        if (!f[m.id] && prochaine < 0) prochaine = k;
        return '<li class="' + (f[m.id] ? "fait" : (k === prochaine ? "cur" : "")) + '"><span>' + esc(m.txt) + "</span>" +
          (f[m.id] ? "" : '<span class="aide"><button type="button" data-k="' + k + '" data-t="ind">Indice</button> <button type="button" data-k="' + k + '" data-t="sol">Solution</button></span><span class="rep"></span>') + "</li>";
      }).join("");
      var n = Object.keys(f).length; root.querySelector(".cpt").textContent = "[" + n + "/" + l.length + "]";
      [].forEach.call(ol.querySelectorAll("button"), function (b) {
        b.onclick = function () { var m = l[+b.getAttribute("data-k")]; b.parentNode.nextSibling.textContent = b.getAttribute("data-t") === "ind" ? "💡 " + m.ind : "→ " + m.sol; };
      });
    }
    function verifierMissions(c) {
      var f = faits(), l = MISSIONS[os], nouv = false;
      l.forEach(function (m) { if (!f[m.id] && m.ok(c, etat)) { f[m.id] = 1; nouv = true; E.toast("✔ Mission réussie : " + esc(m.txt)); } });
      if (nouv) {
        store.set("simu:" + os, f); majMissions(); E.stat("simu");
        if (Object.keys(f).length === l.length) ecrire("*** Toutes les missions " + { linux: "bash", windows: "cmd", powershell: "PowerShell" }[os] + " sont réussies ! ***", "ok");
      }
    }
    function demarrer(nouvelOs) {
      os = nouvelOs; store.set("simu:os", os);
      if (os === "powershell") { psh = window.ENI_SIMU_PS({}); etat = psh.etat; }
      else etat = os === "linux" ? { cwd: "/home/user", routes: [], vuLog: false, shells: [] } : { cwd: "C:\\Users\\user", libere: false, apipa: true, ip: "169.254.73.12" };
      [].forEach.call(root.querySelectorAll("[data-os]"), function (b) { b.classList.toggle("on", b.getAttribute("data-os") === os); });
      root.querySelector(".eni-simu").setAttribute("data-os", os);
      root.querySelector(".titre").textContent = os === "linux" ? "user@debian: ~" : os === "powershell" ? "Windows PowerShell" : "Invite de commandes";
      sortie.innerHTML = "";
      if (os === "powershell") ecrire(psh.accueil);
      else if (os === "linux") ecrire("Debian GNU/Linux 12 debian tty1\nTape les commandes vues en cours. « help » pour l'aide du simulateur.");
      else ecrire("Microsoft Windows [version 10.0.19045]\n(c) Microsoft Corporation. Tous droits réservés.\n\nTape les commandes vues en cours. « help » pour l'aide du simulateur.");
      majPs(); majMissions(); inp.focus();
    }

    // ---------------- Linux ----------------
    function linux(c, a) {
      var sudo = false;
      if (a[0] === "sudo") { sudo = true; a = a.slice(1); c = a.join(" "); if (!a.length) { ecrire("usage: sudo commande"); return; } }
      var cmd = a[0];
      switch (cmd) {
        case "help": ecrire("Commandes du simulateur : pwd cd ls cat id who whoami logname tty date cal echo hostname\nip (addr, link, route, neigh) ping arp netstat clear history exit"); break;
        case "pwd": ecrire(etat.cwd); break;
        case "cd":
          var p = chemin(etat.cwd, a[1]);
          if (a[1] === "-") { ecrire("bash: cd: OLDPWD non défini", "err"); break; }
          if (p === "/root" && !sudo) { ecrire("bash: cd: /root: Permission non accordée", "err"); break; }
          if (!(p in FS)) { ecrire("bash: cd: " + a[1] + ": " + (FICHIERS[p] !== undefined ? "N'est pas un dossier" : "Aucun fichier ou dossier de ce type"), "err"); break; }
          etat.cwd = p; if (p === "/var/log") etat.vuLog = true; majPs(); break;
        case "ls": case "ll":
          var opts = a.filter(function (x) { return x[0] === "-"; }).join(""), cible;
          var arg = a.slice(1).filter(function (x) { return x[0] !== "-"; })[0]; cible = chemin(etat.cwd, arg || ".");
          if (cible === "/root" && !sudo) { ecrire("ls: impossible d'ouvrir le répertoire '/root': Permission non accordée", "err"); break; }
          var l = FS[cible];
          if (l === undefined) { ecrire(FICHIERS[cible] !== undefined ? arg : "ls: impossible d'accéder à '" + arg + "': Aucun fichier ou dossier de ce type", FICHIERS[cible] !== undefined ? "" : "err"); break; }
          l = (l || []).slice(); if (/a/.test(opts) || cmd === "ll") l = [".", ".."].concat(cible === "/home/user" ? [".bashrc", ".profile"] : []).concat(l);
          if (/l/.test(opts) || cmd === "ll") ecrire("total " + l.length * 4 + "\n" + l.map(function (n) { var dir = (chemin(cible, n) in FS) || n === "." || n === ".."; return (dir ? "drwxr-xr-x 2" : "-rw-r--r-- 1") + " user user " + (dir ? " 4096" : "  220") + " nov.  9 08:00 " + n; }).join("\n"));
          else ecrire(l.join("  ")); break;
        case "cat":
          if (!a[1]) { ecrire("(cat attend un fichier)"); break; }
          var f = chemin(etat.cwd, a[1]);
          if (f === "/etc/passwd") ecrire("root:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000:user,,,:/home/user:/bin/bash");
          else if (FICHIERS[f] !== undefined) ecrire(FICHIERS[f]);
          else ecrire("cat: " + a[1] + ": " + (f in FS ? "est un dossier" : "Aucun fichier ou dossier de ce type"), "err"); break;
        case "id": ecrire(sudo ? "uid=0(root) gid=0(root) groupes=0(root)" : "uid=1000(user) gid=1000(user) groupes=1000(user),24(cdrom),25(floppy),27(sudo),29(audio),30(dip),44(video),46(plugdev),100(users),106(netdev)"); break;
        case "whoami": ecrire(sudo ? "root" : "user"); break;
        case "logname": ecrire("user"); break;
        case "who": ecrire("user     tty1         " + formatDate("%Y-%m-%d", new Date()) + " 08:00"); break;
        case "tty": ecrire("/dev/tty1"); break;
        case "hostname": ecrire("debian"); break;
        case "date":
          var fmt = c.match(/^date\s+["']?\+(.*?)["']?$/);
          ecrire(fmt ? formatDate(fmt[1], new Date()) : formatDate("%A %d %B %Y, %H:%M:%S CET", new Date()).replace(/^(\w+) 0?/, "$1 ")); break;
        case "cal":
          var n = a.slice(1).map(Number), now = new Date();
          if (n.length === 0) ecrire(calMois(now.getMonth(), now.getFullYear(), true));
          else if (n.length === 1 && n[0] > 0) { var out = ["                            " + n[0]]; for (var mo = 0; mo < 12; mo++) out.push(calMois(mo, n[0], false)); ecrire(out.join("\n\n")); }
          else if (n.length === 2 && n[0] >= 1 && n[0] <= 12) ecrire(calMois(n[0] - 1, n[1], true));
          else ecrire("cal: mois invalide", "err"); break;
        case "echo": ecrire(a.slice(1).join(" ").replace(/["']/g, "").replace(/\$HOME/g, "/home/user").replace(/\$(USER|LOGNAME)/g, "user").replace(/\$SHELL/g, "/bin/bash").replace(/\$PWD/g, etat.cwd).replace(/\$HOSTNAME/g, "debian").replace(/\$LANG/g, "fr_FR.UTF-8").replace(/\$PATH/g, "/usr/local/bin:/usr/bin:/bin:/usr/local/games:/usr/games").replace(/\$\$/g, "1234").replace(/\$0/g, etat.shells.length ? etat.shells[etat.shells.length - 1] : "-bash")); break;
        case "ip":
          var sous = a[1] || "", reste = a.slice(2);
          if (sous === "-4") { sous = a[2]; reste = a.slice(3); }
          if (/^(a|addr|address)$/.test(sous) && (!reste.length || reste[0] === "show")) {
            var v4 = a[1] === "-4";
            ecrire((v4 ? "" : "1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000\n    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00\n") + (v4 ? "1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536\n" : "") + "    inet 127.0.0.1/8 scope host lo\n" +
              "2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000\n" + (v4 ? "" : "    link/ether 00:0c:29:3e:5b:7a brd ff:ff:ff:ff:ff:ff\n") +
              "    inet 192.168.1.25/24 brd 192.168.1.255 scope global dynamic eth0" + (v4 ? "" : "\n    inet6 fe80::20c:29ff:fe3e:5b7a/64 scope link"));
          } else if (/^(l|link)$/.test(sous) && !reste.length) ecrire("1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 state UNKNOWN\n    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00\n2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 state UP\n    link/ether 00:0c:29:3e:5b:7a brd ff:ff:ff:ff:ff:ff");
          else if (/^(r|route)$/.test(sous) && (!reste.length || reste[0] === "show")) ecrire("default via 192.168.1.1 dev eth0\n" + etat.routes.map(function (r) { return r + " dev eth0"; }).join("\n") + (etat.routes.length ? "\n" : "") + "192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.25");
          else if (/^(r|route)$/.test(sous) && (reste[0] === "add" || reste[0] === "del")) {
            if (!sudo) { ecrire("RTNETLINK answers: Operation not permitted", "err"); break; }
            var m = c.match(/route (add|del) (\d+\.\d+\.\d+\.\d+\/\d+)(?: via (\d+\.\d+\.\d+\.\d+))?/);
            if (!m) { ecrire("Error: argument invalide. Syntaxe : ip route add réseau/masque via passerelle", "err"); break; }
            var r = m[2] + (m[3] ? " via " + m[3] : "");
            if (m[1] === "add") { if (etat.routes.some(function (x) { return x.indexOf(m[2]) === 0; })) ecrire("RTNETLINK answers: File exists", "err"); else etat.routes.push(r); }
            else etat.routes = etat.routes.filter(function (x) { return x.indexOf(m[2]) !== 0; });
          } else if (/^(n|neigh)$/.test(sous)) ecrire("192.168.1.1 dev eth0 lladdr 3c:52:82:aa:10:01 REACHABLE");
          else ecrire("Object \"" + sous + "\" is unknown, try \"ip help\".", "err"); break;
        case "ping":
          var cible2 = a.filter(function (x, k) { return k > 0 && x[0] !== "-" && !/^\d+(\.\d+)?$/.test(x) || /^\d+\.\d+\.\d+\.\d+$/.test(x); })[0];
          var cm = c.match(/-c ?(\d+)/), nb = cm ? Math.min(+cm[1], 10) : 4, q = /(^| )-q( |$)/.test(c);
          if (!cible2) { ecrire("ping: usage error: Destination address required", "err"); break; }
          var ipd = /^\d/.test(cible2) ? cible2 : "142.250.179.100", taille = (c.match(/-s ?(\d+)/) || [0, 56])[1], out2 = ["PING " + cible2 + " (" + ipd + ") " + taille + "(" + (+taille + 28) + ") bytes of data."], tps = [];
          for (var i = 1; i <= nb; i++) { var t = ms() + Math.random(); tps.push(t); if (!q) out2.push((+taille + 8) + " bytes from " + ipd + ": icmp_seq=" + i + " ttl=117 time=" + t.toFixed(1) + " ms"); }
          if (!cm) out2.push("^C");
          out2.push("", "--- " + cible2 + " ping statistics ---", nb + " packets transmitted, " + nb + " received, 0% packet loss, time " + (nb - 1) * 1001 + "ms",
            "rtt min/avg/max/mdev = " + Math.min.apply(null, tps).toFixed(3) + "/" + (tps.reduce(function (s, x) { return s + x; }, 0) / nb).toFixed(3) + "/" + Math.max.apply(null, tps).toFixed(3) + "/0.912 ms");
          lignes(out2, 350, function () { verifierMissions(c0); }); return "async";
        case "traceroute": ecrire("bash: traceroute : commande introuvable\n(Sous Debian/Ubuntu : sudo apt install traceroute)", "err"); break;
        case "arp": ecrire("? (192.168.1.1) at 3c:52:82:aa:10:01 [ether] on eth0"); break;
        case "netstat": ecrire("Connexions Internet actives (serveurs et établies)\nProto Recv-Q Send-Q Adresse locale          Adresse distante        Etat\ntcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN\ntcp        0      0 192.168.1.25:22         192.168.1.50:51522      ESTABLISHED"); break;
        case "man": ecrire(a[1] ? "(simulateur) La page de manuel de « " + a[1] + " » : /mot pour chercher, n/N, h pour l'aide, q pour quitter." : "Quelle page de manuel voulez-vous ?"); break;
        case "passwd": ecrire("Changement du mot de passe pour user.\n(simulateur : rien n'est modifié)"); break;
        case "sh": case "ksh": case "csh": case "tcsh": case "bash":
          etat.shells.push(cmd); majPs();
          ecrire({ sh: "(Bourne shell : prompt « $ », pas de logout ni d'historique avec les flèches)", ksh: "(Korn shell : compatible Bourne shell)", csh: "(C shell : prompt « % »)", tcsh: "(tcsh : C shell amélioré)", bash: "(nouveau bash dans le bash)" }[cmd] + "  → exit pour revenir"); break;
        case "exit": case "logout":
          if (etat.shells.length) {
            var cur = etat.shells[etat.shells.length - 1];
            if (cmd === "logout") { ecrire(cur === "sh" || cur === "ksh" ? cmd + ": 1: logout: not found" : "bash: logout: pas un shell de connexion : utilisez « exit »", "err"); break; }
            etat.quitte = etat.shells.pop(); majPs(); break;
          }
          ecrire("logout\n(simulateur : la session reste ouverte 😉)"); break;
        default: ecrire("bash: " + cmd + " : commande introuvable", "err");
      }
    }

    // ---------------- Windows ----------------
    function windows(c, a) {
      var cmd = a[0];
      var carte = function (detail) {
        var ip = etat.libere ? null : etat.ip, apipa = etat.apipa && !etat.libere;
        var l = ["", "Configuration IP de Windows", ""];
        if (detail) l.push("   Nom de l'hôte . . . . . . . . . . : DESKTOP-PC", "   Type de noeud. . . . . . . . . .  : Hybride", "   Routage IP activé . . . . . . . . : Non", "");
        l.push("Carte Ethernet Ethernet0 :", "");
        if (detail) l.push("   Description. . . . . . . . . . . : Intel(R) 82574L Gigabit Network Connection", "   Adresse physique . . . . . . . . : 00-0C-29-3E-5B-7A", "   DHCP activé. . . . . . . . . . . : Oui");
        if (!ip) { l.push("   Suffixe DNS propre à la connexion. . . :", "   Adresse IPv6 de liaison locale. . . . .: fe80::4c1a:2b9e:51d3:7e10%4", "   Passerelle par défaut. . . . . . . . . :"); return l.join("\n"); }
        l.push("   Suffixe DNS propre à la connexion. . . : " + (apipa ? "" : "home"), "   Adresse IPv6 de liaison locale. . . . .: fe80::4c1a:2b9e:51d3:7e10%4",
          "   " + (apipa ? "Adresse d'autoconfiguration IPv4 . . . " : "Adresse IPv4. . . . . . . . . . . . . .") + ": " + ip + (detail && !apipa ? "(préféré)" : ""),
          "   Masque de sous-réseau. . . . . . . . . : " + (apipa ? "255.255.0.0" : "255.255.255.0"), "   Passerelle par défaut. . . . . . . . . : " + (apipa ? "" : "192.168.1.1"));
        if (detail && !apipa) l.push("   Serveur DHCP . . . . . . . . . . : 192.168.1.1", "   Bail obtenu. . . . . . . . . . . : " + new Date().toLocaleString("fr-FR"), "   Serveurs DNS . . . . . . . . . . : 192.168.1.1");
        return l.join("\n");
      };
      switch (cmd) {
        case "help": ecrire("Commandes du simulateur : ipconfig (/all /release /renew /flushdns /displaydns /registerdns)\nping (-n -t) tracert (/d /h /w /4 /6) netstat (-a -n -an -r -e) arp (-a -d) nslookup net (user, localgroup)\ndriverquery (/si) pnputil /enum-drivers hostname whoami cd cls ver echo powershell"); break;
        case "nslookup":
          if (!a[1]) { ecrire("Serveur par défaut :   box.home\nAddress:  192.168.1.1\n\n> (simulateur : précise un nom, ex. nslookup www.facebook.com)"); break; }
          var nomH = a[1], ips = { "www.facebook.com": ["star-mini.c10r.facebook.com", "157.240.202.35", "2a03:2880:f1ff:83:face:b00c:0:25de"], "www.google.com": ["www.google.com", "142.250.179.100", "2a00:1450:4007:80c::2004"] }[nomH];
          if (!ips) { ecrire("Serveur :   box.home\nAddress:  192.168.1.1\n\n*** box.home ne parvient pas à trouver " + nomH + " : Non-existent domain", "err"); break; }
          ecrire("Serveur :   box.home\nAddress:  192.168.1.1\n\nRéponse ne faisant pas autorité :\nNom :    " + ips[0] + "\nAddresses:  " + ips[2] + "\n          " + ips[1] + (ips[0] !== nomH ? "\nAliases:  " + nomH : "")); break;
        case "net":
          if (a[1] === "user" && !a[2]) ecrire("\nComptes d'utilisateurs de \\\\DESKTOP-PC\n\n-------------------------------------------------------------------------------\nAdministrateur           DefaultAccount           Invité\nuser                     WDAGUtilityAccount\nLa commande s'est terminée correctement.");
          else if (a[1] === "localgroup" && !a[2]) ecrire("\nAlias pour \\\\DESKTOP-PC\n\n-------------------------------------------------------------------------------\n*Administrateurs\n*Invités\n*Utilisateurs\n*Utilisateurs du Bureau à distance\nLa commande s'est terminée correctement.");
          else if (a[1] === "help" || (a[1] === "user" || a[1] === "localgroup") && /\/add$/.test(c)) ecrire(a[1] === "help" ? "La syntaxe de cette commande est :\nNET HELP commande  (ex. net help user)" : "Erreur système 5.\n\nAccès refusé. (il faut une invite de commandes en administrateur)", a[1] === "help" ? "" : "err");
          else if (a[1] === "user" || a[1] === "localgroup") ecrire("Le nom d'utilisateur ou de groupe est introuvable.\n\nVous obtiendrez une aide supplémentaire en entrant NET HELPMSG 2221.", "err");
          else ecrire("La syntaxe de cette commande est :\n\nNET\n    [ ACCOUNTS | COMPUTER | CONFIG | CONTINUE | FILE | GROUP | HELP |\n      HELPMSG | LOCALGROUP | PAUSE | SESSION | SHARE | START |\n      STATISTICS | STOP | TIME | USE | USER | VIEW ]"); break;
        case "driverquery":
          if (/\/si/.test(c)) ecrire("\nDeviceName                     InfName      IsSigned Manufacturer\n============================== ============ ======== ============================\nIntel(R) 82574L Gigabit Netwo  net1ic64.inf TRUE     Intel\nVMware SVGA 3D                 vm3d.inf     TRUE     VMware, Inc.\nRealtek USB GbE Family Contro  oem3.inf     TRUE     Realtek\nImprimante Atelier             oem7.inf     FALSE    Fabricant inconnu");
          else ecrire("\nNom de module Nom complet               Type de pilote  Date de liaison\n============= ======================== =============== ======================\n1394ohci      1394 OHCI Compliant Host Noyau           21/01/2003 00:00:00\nACPI          Microsoft ACPI Driver    Noyau           13/07/2027 00:00:00\ne1iexpress    Intel(R) PRO/1000 PCI Ex Noyau           24/05/2019 10:17:49\nTcpip         Pilote TCP/IP            Noyau           12/03/2021 05:20:04"); break;
        case "pnputil":
          if (a[1] === "/enum-drivers") ecrire("Utilitaire PnP Microsoft\n\nNom publié :        oem3.inf\nNom d'origine :     rtux64w10.inf\nNom du fournisseur : Realtek\nNom de classe :     Cartes réseau\nVersion du pilote : 10.45.1.0\nNom du signataire : Microsoft Windows Hardware Compatibility Publisher\n\nNom publié :        oem7.inf\nNom d'origine :     atelier.inf\nNom du fournisseur : Fabricant inconnu\nNom de classe :     Imprimantes");
          else if (a[1] === "/add-driver") ecrire("Utilitaire PnP Microsoft\n\nÉchec de l'ajout du package de pilotes : Accès refusé.\n(il faut une invite de commandes en administrateur)", "err");
          else ecrire("Utilitaire PnP Microsoft\n\nSYNTAXE :  pnputil [/enum-drivers] [/add-driver <fichier.inf>] …"); break;
        case "command.com": case "command": ecrire("'" + cmd + "' n'est pas reconnu en tant que commande interne\nou externe, un programme exécutable ou un fichier de commandes.\n(command.com = shell des OS basés sur MS-DOS : absent de Windows 10, on utilise cmd.exe)", "err"); break;
        case "cmd": case "cmd.exe": ecrire("Microsoft Windows [version 10.0.19045]\n(c) Microsoft Corporation. Tous droits réservés.\n(simulateur : nouveau cmd.exe dans le cmd)"); break;
        case "powershell": case "powershell.exe": ecrire("(ouverture de l'onglet PowerShell…)"); setTimeout(function () { demarrer("powershell"); }, 500); break;
        case "ipconfig":
          var o = (a[1] || "").toLowerCase();
          if (!o) ecrire(carte(false));
          else if (o === "/all") ecrire(carte(true));
          else if (o === "/release") { etat.libere = true; ecrire(carte(false)); }
          else if (o === "/renew") {
            busy = true; ecrire("(recherche d'un serveur DHCP…)");
            var etaitLibere = etat.libere;
            setTimeout(function () { etat.renouvele = etaitLibere; etat.libere = false; etat.apipa = false; etat.ip = "192.168.1.25"; ecrire(carte(false)); busy = false; verifierMissions(c0); inp.focus(); }, 1200);
            return "async";
          }
          else if (o === "/flushdns") ecrire("\nConfiguration IP de Windows\n\nCache de résolution DNS vidé.");
          else if (o === "/displaydns") ecrire("\nConfiguration IP de Windows\n\n    www.google.com\n    ----------------------------------------\n    Nom d'enregistrement . . : www.google.com\n    Type d'enregistrement. . : 1\n    Durée de vie . . . . . . : 182\n    Section. . . . . . . . . : Réponse\n    Enregistrement (hôte) A  : 142.250.179.100");
          else if (o === "/registerdns") ecrire("\nConfiguration IP de Windows\n\nL'inscription des enregistrements de ressources DNS pour toutes les cartes de cet ordinateur a été initiée.");
          else ecrire("Erreur : option de ligne de commande non reconnue : " + a[1], "err"); break;
        case "ping":
          var dest = a.slice(1).filter(function (x, k, arr) { return x[0] !== "-" && !(k > 0 && /^-[nlw]$/i.test(arr[k - 1])); })[0];
          if (!dest) { ecrire("Syntaxe : ping [-t] [-n nombre] [-l taille] cible", "err"); break; }
          if (etat.libere || etat.apipa) { lignes(["", "Envoi d'une requête 'Ping'  " + dest + " avec 32 octets de données :", "PING : échec de la transmission. Défaillance générale.", "PING : échec de la transmission. Défaillance générale.", "", "(Pas d'IP valide : pense à ipconfig /renew)"], 400); return "async"; }
          var nm = c.match(/-n ?(\d+)/i), n = nm ? Math.min(+nm[1], 10) : 4, cont = /-t/i.test(c), ipd = /^\d/.test(dest) ? dest : "142.250.179.100", tps = [];
          var out = ["", "Envoi d'une requête 'Ping'  " + (ipd === dest ? dest : dest + " [" + ipd + "]") + " avec 32 octets de données :"];
          for (var i = 0; i < (cont ? 6 : n); i++) { var t = ms(); tps.push(t); out.push("Réponse de " + ipd + " : octets=32 temps=" + t + " ms TTL=117"); }
          if (cont) out.push("^C");
          out.push("", "Statistiques Ping pour " + ipd + ":", "    Paquets : envoyés = " + tps.length + ", reçus = " + tps.length + ", perdus = 0 (perte 0%),", "Durée approximative des boucles en millisecondes :",
            "    Minimum = " + Math.min.apply(null, tps) + "ms, Maximum = " + Math.max.apply(null, tps) + "ms, Moyenne = " + Math.round(tps.reduce(function (s, x) { return s + x; }, 0) / tps.length) + "ms");
          lignes(out, 400, function () { verifierMissions(c0); }); return "async";
        case "tracert":
          var d2 = a.slice(1).filter(function (x, k, arr) { return x[0] !== "/" && !(k > 0 && /^\/[hw]$/i.test(arr[k - 1])); })[0];
          if (!d2) { ecrire("Syntaxe : tracert [/d] [/h sauts_maxi] [/w délai] nom_cible", "err"); break; }
          var noDns = / \/d( |$)/i.test(c), maxh = +((c.match(/\/h (\d+)/i) || [0, 30])[1]);
          var sauts = [["192.168.1.1", "box.home"], ["80.10.236.1", "lns-bzn-21.ftth.fr"], ["193.253.83.170", "ae51-0.nrstl103.rbci.orange.net"], ["193.252.98.161", "ae41-0.nipoi201.rbci.orange.net"], ["72.14.211.26", "72.14.211.26"], ["142.250.179.100", "par21s19-in-f4.1e100.net"]];
          var out3 = ["", "Détermination de l'itinéraire vers " + d2 + " [142.250.179.100]", "avec un maximum de " + maxh + " sauts :", ""];
          sauts.slice(0, maxh).forEach(function (s, k) { var t = 1 + k * 3; out3.push(("  " + (k + 1)).slice(-3) + "    " + (t + 1) + " ms    " + t + " ms    " + (t + 2) + " ms  " + (noDns || s[0] === s[1] ? s[0] : s[1] + " [" + s[0] + "]")); });
          out3.push("", "Itinéraire déterminé.");
          lignes(out3, 450, function () { verifierMissions(c0); }); return "async";
        case "netstat":
          var num = /-a?n|-an/i.test(c), r = /-r/i.test(c), e = /-e/i.test(c);
          if (r) ecrire("===========================================================================\nIPv4 Table de routage\n===========================================================================\nItinéraires actifs :\nDestination réseau    Masque réseau  Adr. passerelle   Adr. interface Métrique\n          0.0.0.0          0.0.0.0      192.168.1.1     192.168.1.25     25\n      192.168.1.0    255.255.255.0         On-link      192.168.1.25    281");
          else if (e) ecrire("Statistiques de l'interface\n\n                           Reçus            Envoyés\nOctets                   48211765            5873120\nPaquets unicast             61237              32190\nErreurs                         0                  0");
          else ecrire("\nConnexions actives\n\n  Proto  Adresse locale         Adresse distante       État\n  TCP    " + (num ? "0.0.0.0:135            0.0.0.0:0              LISTENING" : "0.0.0.0:epmap          DESKTOP-PC:0           LISTENING") + "\n  TCP    " + (num ? "0.0.0.0:445            0.0.0.0:0              LISTENING" : "0.0.0.0:microsoft-ds   DESKTOP-PC:0           LISTENING") + "\n  TCP    " + (num ? "192.168.1.25:50412     142.250.179.100:443    ESTABLISHED" : "DESKTOP-PC:50412       par21s19-in-f4:https   ESTABLISHED") + "\n  TCP    " + (num ? "192.168.1.25:50430     20.190.159.2:443       TIME_WAIT" : "DESKTOP-PC:50430       20.190.159.2:https     TIME_WAIT")); break;
        case "arp":
          if ((a[1] || "").toLowerCase() === "-a") ecrire("\nInterface : 192.168.1.25 --- 0x4\n  Adresse Internet      Adresse physique      Type\n  192.168.1.1           3c-52-82-aa-10-01     dynamique\n  192.168.1.255         ff-ff-ff-ff-ff-ff     statique\n  224.0.0.22            01-00-5e-00-00-16     statique");
          else if ((a[1] || "").toLowerCase() === "-d") ecrire("L'opération demandée nécessite une élévation (exécuter en tant qu'administrateur).", "err");
          else ecrire("Affiche et modifie les tables de traduction d'adresses IP en adresses physiques.\n\nARP -s inet_addr eth_addr\nARP -d inet_addr\nARP -a", ""); break;
        case "hostname": ecrire("DESKTOP-PC"); break;
        case "whoami": ecrire("desktop-pc\\user"); break;
        case "ver": ecrire("\nMicrosoft Windows [version 10.0.19045.5131]"); break;
        case "cd": if (!a[1]) ecrire(etat.cwd); else if (a[1] === "..") { etat.cwd = etat.cwd.replace(/\\[^\\]+$/, "") || "C:\\"; if (etat.cwd === "C:") etat.cwd = "C:\\"; majPs(); } else if (a[1] === "\\") { etat.cwd = "C:\\"; majPs(); } else ecrire("Le chemin d'accès spécifié est introuvable.", "err"); break;
        case "echo": ecrire(a.slice(1).join(" ").replace(/%username%/ig, "user").replace(/%computername%/ig, "DESKTOP-PC")); break;
        case "exit": ecrire("(simulateur : la fenêtre reste ouverte 😉)"); break;
        default: ecrire("'" + cmd + "' n'est pas reconnu en tant que commande interne\nou externe, un programme exécutable ou un fichier de commandes.", "err");
      }
    }

    var c0 = "";
    function executer(brut) {
      ecrire(prompt() + brut, "cmd");
      var c = brut.trim().replace(/\s+/g, " "); if (!c) return;
      hist.push(c); hpos = hist.length;
      if (/^(clear|cls)$/i.test(c)) { sortie.innerHTML = ""; return; }
      if (c === "history") { ecrire(hist.map(function (x, i) { return ("    " + (i + 1)).slice(-5) + "  " + x; }).join("\n")); return; }
      if (os === "powershell") {
        if (/^(aide|help-simu)$/i.test(c)) { ecrire(psh.aide); return; }
        if (/^exit$/i.test(c)) { ecrire("(simulateur : la console reste ouverte 😉)"); return; }
        var rp = psh.executer(c);
        if (rp.clear) { sortie.innerHTML = ""; return; }
        rp.lignes.forEach(function (l) { ecrire(l.t, l.err ? "err" : ""); });
        majPs(); verifierMissions(rp.norm); return;
      }
      c0 = os === "windows" ? c.toLowerCase() : c;
      var a = c0.split(" ");
      var r = os === "linux" ? linux(c0, a) : windows(c0, a);
      if (r !== "async") verifierMissions(c0);
    }
    inp.addEventListener("keydown", function (e) {
      e.stopPropagation();
      if (busy) { if (e.key === "c" && e.ctrlKey) ecrire("^C"); e.preventDefault(); return; }
      if (e.key === "Enter") { executer(inp.value); inp.value = ""; }
      else if (e.key === "ArrowUp") { if (hpos > 0) inp.value = hist[--hpos]; e.preventDefault(); }
      else if (e.key === "ArrowDown") { hpos = Math.min(hist.length, hpos + 1); inp.value = hist[hpos] || ""; e.preventDefault(); }
      else if (e.key === "l" && e.ctrlKey) { e.preventDefault(); sortie.innerHTML = ""; }
    });
    sortie.onclick = function () { inp.focus(); };
    [].forEach.call(root.querySelectorAll("[data-os]"), function (b) { b.onclick = function () { demarrer(b.getAttribute("data-os")); }; });
    root.querySelector(".b-raz").onclick = function () { if (confirm("Remettre à zéro les missions " + { linux: "bash", windows: "cmd", powershell: "PowerShell" }[os] + " ?")) { store.del("simu:" + os); demarrer(os); } };
    demarrer(os);
  }

  function init() { var el = document.getElementById("app-simu"); if (el && window.ENI) { el.classList.add("eni-app"); appSimu(el); } }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
