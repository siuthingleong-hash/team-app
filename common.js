// What the two phone pages share: the saved sign-in on this device, and fetching the latest published files.
(function (g) {
  var KEY = 'team-portal.session';
  function saved() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }
  function remember(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
  function forget() { try { localStorage.removeItem(KEY); } catch (e) {} }
  // always the latest publish, so a removed member or app stops working on the next open
  function bytes(path) {
    return fetch(path + '?t=' + Date.now(), { cache: 'no-store' }).then(function (r) {
      if (r.status === 404) { var e = new Error('gone'); e.gone = true; throw e; }
      if (!r.ok) throw new Error('network');
      return r.arrayBuffer();
    });
  }
  function record(s) {
    return bytes('data/m/' + s.lookup + '.bin').then(function (b) { return Vault.open(s.kek, b); }).then(function (p) { return JSON.parse(new TextDecoder().decode(p)); });
  }
  g.Portal = { saved: saved, remember: remember, forget: forget, bytes: bytes, record: record };
})(globalThis);
