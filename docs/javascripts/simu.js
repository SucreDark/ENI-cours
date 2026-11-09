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
      { id: "tracert", txt: "Trace la route vers www.google.com sans résolution de noms, 15 sauts maximum.", ind: "Réseau M5, exercice 7", sol: "tracert /d /h 15 www.google.com", ok: function (c) { return /^tracert /.test(c) && / \/d( |$)/.test(c) && /\/h 15/.test(c) && /google\.com/.test(c); } }
    ]
  };
  window.ENI_SIMU_MISSIONS = { linux: MISSIONS.linux.length, windows: MISSIONS.windows.length };

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
    root.innerHTML = '<div class="eni-simu-onglets"><button type="button" data-os="linux">🐧 Linux (bash)</button><button type="button" data-os="windows">🪟 Windows (cmd)</button></div>' +
      '<div class="eni-simu"><div class="eni-simu-term"><div class="eni-term-barre"><i></i><i></i><i></i><span class="titre"></span></div><div class="eni-term-sortie"></div><div class="eni-term-ligne"><span class="ps"></span><input type="text" spellcheck="false" autocomplete="off" aria-label="Commande"></div></div>' +
      '<div class="eni-simu-missions"><h4>$ missions <span class="cpt"></span></h4><ol></ol><button type="button" class="exo-btn sec b-raz">↺ Recommencer les missions</button></div></div>';
    var sortie = root.querySelector(".eni-term-sortie"), inp = root.querySelector("input"), ps = root.querySelector(".ps"), ol = root.querySelector("ol"), hist = [], hpos = 0;

    function ecrire(txt, cls) { var d = document.createElement("div"); d.className = cls || ""; d.textContent = txt; sortie.appendChild(d); sortie.scrollTop = sortie.scrollHeight; }
    function lignes(arr, delai, fin) { // affichage progressif (ping, tracert…)
      busy = true; var i = 0;
      (function suite() { if (i >= arr.length) { busy = false; if (fin) fin(); inp.focus(); return; } ecrire(arr[i++]); setTimeout(suite, delai); })();
    }
    function prompt() {
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
        if (Object.keys(f).length === l.length) ecrire(os === "linux" ? "*** Toutes les missions Linux sont réussies ! ***" : "*** Toutes les missions Windows sont réussies ! ***", "ok");
      }
    }
    function demarrer(nouvelOs) {
      os = nouvelOs; store.set("simu:os", os);
      etat = os === "linux" ? { cwd: "/home/user", routes: [], vuLog: false } : { cwd: "C:\\Users\\user", libere: false, apipa: true, ip: "169.254.73.12" };
      [].forEach.call(root.querySelectorAll("[data-os]"), function (b) { b.classList.toggle("on", b.getAttribute("data-os") === os); });
      root.querySelector(".eni-simu").setAttribute("data-os", os);
      root.querySelector(".titre").textContent = os === "linux" ? "user@debian: ~" : "Invite de commandes";
      sortie.innerHTML = "";
      if (os === "linux") ecrire("Debian GNU/Linux 12 debian tty1\nTape les commandes vues en cours. « help » pour l'aide du simulateur.");
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
        case "echo": ecrire(a.slice(1).join(" ").replace(/["']/g, "").replace(/\$HOME/g, "/home/user").replace(/\$(USER|LOGNAME)/g, "user").replace(/\$SHELL/g, "/bin/bash").replace(/\$PWD/g, etat.cwd).replace(/\$HOSTNAME/g, "debian").replace(/\$LANG/g, "fr_FR.UTF-8").replace(/\$PATH/g, "/usr/local/bin:/usr/bin:/bin:/usr/local/games:/usr/games").replace(/\$\$/g, "1234")); break;
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
        case "exit": case "logout": ecrire("logout\n(simulateur : la session reste ouverte 😉)"); break;
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
        case "help": ecrire("Commandes du simulateur : ipconfig (/all /release /renew /flushdns /displaydns /registerdns)\nping (-n -t) tracert (/d /h /w /4 /6) netstat (-a -n -an -r -e) arp (-a -d) hostname whoami cd cls ver echo"); break;
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
    root.querySelector(".b-raz").onclick = function () { if (confirm("Remettre à zéro les missions " + (os === "linux" ? "Linux" : "Windows") + " ?")) { store.del("simu:" + os); demarrer(os); } };
    demarrer(os);
  }

  function init() { var el = document.getElementById("app-simu"); if (el && window.ENI) { el.classList.add("eni-app"); appSimu(el); } }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
