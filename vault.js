// Encryption shared by the phone pages and the admin tool. There is no server: only someone holding the right key can read a file.
(function (g) {
  var subtle = g.crypto.subtle;
  function hex(b) { return Array.from(new Uint8Array(b), function (x) { return x.toString(16).padStart(2, '0'); }).join(''); }
  function unhex(s) { var a = new Uint8Array(s.length / 2); for (var i = 0; i < a.length; i++) a[i] = parseInt(s.substr(i * 2, 2), 16); return a; }
  function normCode(s) { return String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); }

  // One slow derivation turns a code into the name of the member's file and the key that opens it
  async function session(code, saltHex, iter) {
    var base = await subtle.importKey('raw', new TextEncoder().encode(normCode(code)), 'PBKDF2', false, ['deriveBits']);
    var bits = await subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: unhex(saltHex), iterations: iter }, base, 384);
    return { lookup: hex(bits.slice(0, 16)), kek: hex(bits.slice(16)) };
  }
  function aes(keyHex, use) { return subtle.importKey('raw', unhex(keyHex), 'AES-GCM', false, [use]); }
  async function seal(keyHex, bytes) {
    var iv = g.crypto.getRandomValues(new Uint8Array(12));
    var ct = await subtle.encrypt({ name: 'AES-GCM', iv: iv }, await aes(keyHex, 'encrypt'), bytes);
    var out = new Uint8Array(12 + ct.byteLength); out.set(iv); out.set(new Uint8Array(ct), 12);
    return out;
  }
  async function open(keyHex, bytes) {
    var b = new Uint8Array(bytes);
    return new Uint8Array(await subtle.decrypt({ name: 'AES-GCM', iv: b.slice(0, 12) }, await aes(keyHex, 'decrypt'), b.slice(12)));
  }
  g.Vault = { hex: hex, normCode: normCode, session: session, seal: seal, open: open };
})(globalThis);
