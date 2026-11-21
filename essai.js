'use strict';

/* La porte : les deux etats, dans un vrai navigateur. */

const fs = require('fs');
const http = require('http');
const path = require('path');
const t = require('C:/Users/Collegien/Documents/mes-conserves/tests/lib.js');

const SOURCE = __dirname;
const PORT = 3188;
const TYPES = { '.html': 'text/html; charset=utf-8', '.json': 'application/json', '.txt': 'text/plain' };

let lien = { url: '', maj: null };

const srv = http.createServer((req, res) => {
  const chemin = req.url.split('?')[0];
  if (chemin === '/lien.json') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify(lien));
    return;
  }
  const f = path.join(SOURCE, chemin === '/' ? 'index.html' : chemin);
  if (!f.startsWith(path.resolve(SOURCE)) || !fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' });
  res.end(fs.readFileSync(f));
});

let bilan = 0, ratees = 0;
function verifier(quoi, ok) {
  bilan++;
  if (!ok) { ratees++; console.log('  RATE : ' + quoi); } else console.log('  ok   : ' + quoi);
}

(async () => {
  await new Promise((r) => srv.listen(PORT, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + PORT + '/';
  const b = await t.openBrowser(9414);
  if (!b) { console.log('navigateur introuvable'); srv.close(); return; }
  try {
    await b.phone();

    // --- 1. Porte fermee -----------------------------------------------
    console.log('\n  porte fermee');
    lien = { url: '', maj: null };
    await b.goto(base, 1500);
    let txt = await b.evaluate("document.getElementById('etat').textContent.replace(/\\s+/g,' ')");
    verifier('elle annonce la fermeture', /ferm/i.test(txt));
    verifier('elle dit quoi lancer', /porte\.ps1/.test(txt));
    verifier('elle propose de reessayer',
      await b.evaluate("!!document.querySelector('#etat button')"));
    verifier('on reste sur la porte', (await b.evaluate('location.pathname')) === '/');
    const soucis = await b.problems();
    if (soucis.length) console.log('    detail : ' + JSON.stringify(soucis));
    verifier('aucune erreur de page', soucis === '[]');

    // --- 2. Porte ouverte ----------------------------------------------
    console.log('\n  porte ouverte');
    lien = { url: 'https://samrtauet-sketch.github.io/conserves/robots.txt', maj: '2026-11-21T10:00:00Z' };
    await b.goto(base, 600);
    txt = await b.evaluate("document.getElementById('etat').textContent.replace(/\\s+/g,' ')");
    verifier('elle annonce l ouverture', /ouverte/i.test(txt));
    const href = await b.evaluate("(document.querySelector('#etat a.bouton')||{}).href || ''");
    verifier('le bouton mene au tunnel', href === lien.url);
    await t.sleep(1800);
    const ou = await b.evaluate('location.href');
    verifier('elle y emmene toute seule', ou === lien.url);

    // --- 3. Une adresse douteuse ---------------------------------------
    console.log('\n  adresse douteuse');
    for (const mauvaise of ['javascript:alert(1)', 'http://pas-en-https.fr/', 'n importe quoi']) {
      lien = { url: mauvaise, maj: null };
      await b.goto(base, 1200);
      const t2 = await b.evaluate("document.getElementById('etat').textContent.replace(/\\s+/g,' ')");
      const reste = (await b.evaluate('location.host')) === '127.0.0.1:' + PORT;
      verifier('refusee : ' + mauvaise, /ferm/i.test(t2) && reste);
    }

    console.log('\n  ' + bilan + ' verifications, ' + (ratees ? ratees + ' ratee(s)' : 'tout passe'));
  } finally {
    b.close();
    srv.close();
  }
})().catch((e) => { console.error('plantage : ' + e.stack); srv.close(); });
