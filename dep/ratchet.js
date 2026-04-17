var RATCHET = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to2, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to2, key) && key !== except)
          __defProp(to2, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to2;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // node_modules/nostr-double-ratchet/dist/nostr-double-ratchet.es.js
  var nostr_double_ratchet_es_exports = {};
  __export(nostr_double_ratchet_es_exports, {
    APP_KEYS_EVENT_KIND: () => Lt,
    AppKeys: () => G,
    AppKeysManager: () => Ld,
    ApplicationManager: () => Ld,
    CHAT_MESSAGE_KIND: () => Je,
    CHAT_SETTINGS_KIND: () => Mt,
    DelegateManager: () => Ud,
    DirectMessageSubscriptionTracker: () => El,
    EXPIRATION_TAG: () => Mn,
    GROUP_INVITE_RUMOR_KIND: () => ll,
    GROUP_METADATA_KIND: () => yt,
    GROUP_SENDER_KEY_DISTRIBUTION_KIND: () => wt,
    GROUP_SENDER_KEY_MESSAGE_KIND: () => fl,
    Group: () => bn,
    GroupManager: () => qd,
    INVITE_EVENT_KIND: () => kt,
    INVITE_RESPONSE_KIND: () => Hs,
    InMemoryStorageAdapter: () => Xe,
    Invite: () => fe,
    KIND_CHAT_SETTINGS: () => Yd,
    LocalStorageAdapter: () => dl,
    MESSAGE_EVENT_KIND: () => be,
    NdrRuntime: () => Sl,
    OneToManyChannel: () => en,
    OneToManyMessage: () => $d,
    REACTION_KIND: () => gr,
    RECEIPT_KIND: () => vr,
    RuntimeGroupController: () => jd,
    SENDER_KEY_MAX_SKIP: () => ni,
    SENDER_KEY_MAX_STORED_SKIPPED_KEYS: () => ri,
    SHARED_CHANNEL_KIND: () => Vr,
    SenderKeyState: () => Ve,
    Session: () => Wt,
    SessionGroupRuntime: () => jd,
    SessionManager: () => Bn,
    SharedChannel: () => bl,
    TYPING_KIND: () => wr,
    addGroupAdmin: () => vl,
    addGroupMember: () => yl,
    applyAppKeysSnapshot: () => Er,
    applyMetadataUpdate: () => Td,
    buildAppKeysFilter: () => at,
    buildDirectMessageBackfillFilter: () => ml,
    buildGroupMetadataContent: () => Rd,
    classifyMessageOrigin: () => Yt,
    createEventStream: () => Xd,
    createGroupData: () => Dd,
    createSessionFromAccept: () => Rn,
    decryptInviteResponse: () => ro,
    deepCopyState: () => ud,
    deserializeSessionState: () => cd,
    directMessageSubscriptionAuthors: () => Vd,
    encryptInviteResponse: () => kd,
    evaluateDeviceRegistrationState: () => io,
    generateDeviceId: () => ol,
    generateEphemeralKeypair: () => Wr,
    generateGroupSecret: () => Sr,
    generateSharedSecret: () => Ed,
    getExpirationTimestampSeconds: () => hd,
    getMillisecondTimestamp: () => Qd,
    hasExistingSessionWithRecipient: () => cl,
    isAppKeysEvent: () => Cd,
    isCrossDeviceSelfOrigin: () => Qt,
    isExpired: () => el,
    isGroupAdmin: () => ht,
    isOwnDeviceEvent: () => al,
    isOwnDevicePubkey: () => Xr,
    isReaction: () => nl,
    isReceiptType: () => dd,
    isSelfOrigin: () => Xt,
    isTyping: () => sl,
    kdf: () => He,
    parseGroupMetadata: () => ti,
    parseReaction: () => tl,
    parseReceipt: () => il,
    removeGroupAdmin: () => wl,
    removeGroupMember: () => pl,
    resolveConversationCandidatePubkeys: () => hl,
    resolveExpirationSeconds: () => Dn,
    resolveInviteOwnerRouting: () => Qr,
    resolveRumorPeerPubkey: () => Id,
    resolveSessionPubkeyToOwner: () => ul,
    serializeSessionState: () => ad,
    shouldAdvanceReceiptStatus: () => rl,
    shouldRequireRelayRegistrationConfirmation: () => Ad,
    updateGroupData: () => gl,
    upsertExpirationTag: () => Ws,
    validateMetadataCreation: () => Bd,
    validateMetadataUpdate: () => Nd
  });
  var co = Object.defineProperty;
  var uo = (n, e, t) => e in n ? co(n, e, { enumerable: true, configurable: true, writable: true, value: t }) : n[e] = t;
  var l = (n, e, t) => uo(n, typeof e != "symbol" ? e + "" : e, t);
  function _n(n) {
    return n instanceof Uint8Array || ArrayBuffer.isView(n) && n.constructor.name === "Uint8Array";
  }
  function Ue(n, e = "") {
    if (!Number.isSafeInteger(n) || n < 0) {
      const t = e && `"${e}" `;
      throw new Error(`${t}expected integer >= 0, got ${n}`);
    }
  }
  function _(n, e, t = "") {
    const r = _n(n), i = n == null ? void 0 : n.length, s = e !== void 0;
    if (!r || s && i !== e) {
      const o = t && `"${t}" `, a = s ? ` of length ${e}` : "", c = r ? `length=${i}` : `type=${typeof n}`;
      throw new Error(o + "expected Uint8Array" + a + ", got " + c);
    }
    return n;
  }
  function Ut(n) {
    if (typeof n != "function" || typeof n.create != "function")
      throw new Error("Hash must wrapped by utils.createHasher");
    Ue(n.outputLen), Ue(n.blockLen);
  }
  function Ct(n, e = true) {
    if (n.destroyed)
      throw new Error("Hash instance has been destroyed");
    if (e && n.finished)
      throw new Error("Hash#digest() has already been called");
  }
  function ho(n, e) {
    _(n, void 0, "digestInto() output");
    const t = e.outputLen;
    if (n.length < t)
      throw new Error('"digestInto() output" expected to be of length >=' + t);
  }
  function pt(...n) {
    for (let e = 0; e < n.length; e++)
      n[e].fill(0);
  }
  function tn(n) {
    return new DataView(n.buffer, n.byteOffset, n.byteLength);
  }
  function Ee(n, e) {
    return n << 32 - e | n >>> e;
  }
  var ci = (
    /* @ts-ignore */
    typeof Uint8Array.from([]).toHex == "function" && typeof Uint8Array.fromHex == "function"
  );
  var lo = /* @__PURE__ */ Array.from({ length: 256 }, (n, e) => e.toString(16).padStart(2, "0"));
  function F(n) {
    if (_(n), ci)
      return n.toHex();
    let e = "";
    for (let t = 0; t < n.length; t++)
      e += lo[n[t]];
    return e;
  }
  var Pe = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
  function Pr(n) {
    if (n >= Pe._0 && n <= Pe._9)
      return n - Pe._0;
    if (n >= Pe.A && n <= Pe.F)
      return n - (Pe.A - 10);
    if (n >= Pe.a && n <= Pe.f)
      return n - (Pe.a - 10);
  }
  function H(n) {
    if (typeof n != "string")
      throw new Error("hex string expected, got " + typeof n);
    if (ci)
      return Uint8Array.fromHex(n);
    const e = n.length, t = e / 2;
    if (e % 2)
      throw new Error("hex string expected, got unpadded hex of length " + e);
    const r = new Uint8Array(t);
    for (let i = 0, s = 0; i < t; i++, s += 2) {
      const o = Pr(n.charCodeAt(s)), a = Pr(n.charCodeAt(s + 1));
      if (o === void 0 || a === void 0) {
        const c = n[s] + n[s + 1];
        throw new Error('hex string expected, got non-hex character "' + c + '" at index ' + s);
      }
      r[i] = o * 16 + a;
    }
    return r;
  }
  function ee(...n) {
    let e = 0;
    for (let r = 0; r < n.length; r++) {
      const i = n[r];
      _(i), e += i.length;
    }
    const t = new Uint8Array(e);
    for (let r = 0, i = 0; r < n.length; r++) {
      const s = n[r];
      t.set(s, i), i += s.length;
    }
    return t;
  }
  function fo(n, e = {}) {
    const t = (i, s) => n(s).update(i).digest(), r = n(void 0);
    return t.outputLen = r.outputLen, t.blockLen = r.blockLen, t.create = (i) => n(i), Object.assign(t, e), Object.freeze(t);
  }
  function We(n = 32) {
    const e = typeof globalThis == "object" ? globalThis.crypto : null;
    if (typeof (e == null ? void 0 : e.getRandomValues) != "function")
      throw new Error("crypto.getRandomValues must be defined");
    return e.getRandomValues(new Uint8Array(n));
  }
  var yo = (n) => ({
    oid: Uint8Array.from([6, 9, 96, 134, 72, 1, 101, 3, 4, 2, n])
  });
  function po(n, e, t) {
    return n & e ^ ~n & t;
  }
  function go(n, e, t) {
    return n & e ^ n & t ^ e & t;
  }
  var vo = class {
    constructor(e, t, r, i) {
      l(this, "blockLen");
      l(this, "outputLen");
      l(this, "padOffset");
      l(this, "isLE");
      l(this, "buffer");
      l(this, "view");
      l(this, "finished", false);
      l(this, "length", 0);
      l(this, "pos", 0);
      l(this, "destroyed", false);
      this.blockLen = e, this.outputLen = t, this.padOffset = r, this.isLE = i, this.buffer = new Uint8Array(e), this.view = tn(this.buffer);
    }
    update(e) {
      Ct(this), _(e);
      const { view: t, buffer: r, blockLen: i } = this, s = e.length;
      for (let o = 0; o < s; ) {
        const a = Math.min(i - this.pos, s - o);
        if (a === i) {
          const c = tn(e);
          for (; i <= s - o; o += i)
            this.process(c, o);
          continue;
        }
        r.set(e.subarray(o, o + a), this.pos), this.pos += a, o += a, this.pos === i && (this.process(t, 0), this.pos = 0);
      }
      return this.length += e.length, this.roundClean(), this;
    }
    digestInto(e) {
      Ct(this), ho(e, this), this.finished = true;
      const { buffer: t, view: r, blockLen: i, isLE: s } = this;
      let { pos: o } = this;
      t[o++] = 128, pt(this.buffer.subarray(o)), this.padOffset > i - o && (this.process(r, 0), o = 0);
      for (let d = o; d < i; d++)
        t[d] = 0;
      r.setBigUint64(i - 8, BigInt(this.length * 8), s), this.process(r, 0);
      const a = tn(e), c = this.outputLen;
      if (c % 4)
        throw new Error("_sha2: outputLen must be aligned to 32bit");
      const u = c / 4, h = this.get();
      if (u > h.length)
        throw new Error("_sha2: outputLen bigger than state");
      for (let d = 0; d < u; d++)
        a.setUint32(4 * d, h[d], s);
    }
    digest() {
      const { buffer: e, outputLen: t } = this;
      this.digestInto(e);
      const r = e.slice(0, t);
      return this.destroy(), r;
    }
    _cloneInto(e) {
      e || (e = new this.constructor()), e.set(...this.get());
      const { blockLen: t, buffer: r, length: i, finished: s, destroyed: o, pos: a } = this;
      return e.destroyed = o, e.finished = s, e.length = i, e.pos = a, i % t && e.buffer.set(r), e;
    }
    clone() {
      return this._cloneInto();
    }
  };
  var De = /* @__PURE__ */ Uint32Array.from([
    1779033703,
    3144134277,
    1013904242,
    2773480762,
    1359893119,
    2600822924,
    528734635,
    1541459225
  ]);
  var wo = /* @__PURE__ */ Uint32Array.from([
    1116352408,
    1899447441,
    3049323471,
    3921009573,
    961987163,
    1508970993,
    2453635748,
    2870763221,
    3624381080,
    310598401,
    607225278,
    1426881987,
    1925078388,
    2162078206,
    2614888103,
    3248222580,
    3835390401,
    4022224774,
    264347078,
    604807628,
    770255983,
    1249150122,
    1555081692,
    1996064986,
    2554220882,
    2821834349,
    2952996808,
    3210313671,
    3336571891,
    3584528711,
    113926993,
    338241895,
    666307205,
    773529912,
    1294757372,
    1396182291,
    1695183700,
    1986661051,
    2177026350,
    2456956037,
    2730485921,
    2820302411,
    3259730800,
    3345764771,
    3516065817,
    3600352804,
    4094571909,
    275423344,
    430227734,
    506948616,
    659060556,
    883997877,
    958139571,
    1322822218,
    1537002063,
    1747873779,
    1955562222,
    2024104815,
    2227730452,
    2361852424,
    2428436474,
    2756734187,
    3204031479,
    3329325298
  ]);
  var Re = /* @__PURE__ */ new Uint32Array(64);
  var bo = class extends vo {
    constructor(e) {
      super(64, e, 8, false);
    }
    get() {
      const { A: e, B: t, C: r, D: i, E: s, F: o, G: a, H: c } = this;
      return [e, t, r, i, s, o, a, c];
    }
    // prettier-ignore
    set(e, t, r, i, s, o, a, c) {
      this.A = e | 0, this.B = t | 0, this.C = r | 0, this.D = i | 0, this.E = s | 0, this.F = o | 0, this.G = a | 0, this.H = c | 0;
    }
    process(e, t) {
      for (let d = 0; d < 16; d++, t += 4)
        Re[d] = e.getUint32(t, false);
      for (let d = 16; d < 64; d++) {
        const y = Re[d - 15], f = Re[d - 2], p = Ee(y, 7) ^ Ee(y, 18) ^ y >>> 3, w = Ee(f, 17) ^ Ee(f, 19) ^ f >>> 10;
        Re[d] = w + Re[d - 7] + p + Re[d - 16] | 0;
      }
      let { A: r, B: i, C: s, D: o, E: a, F: c, G: u, H: h } = this;
      for (let d = 0; d < 64; d++) {
        const y = Ee(a, 6) ^ Ee(a, 11) ^ Ee(a, 25), f = h + y + po(a, c, u) + wo[d] + Re[d] | 0, w = (Ee(r, 2) ^ Ee(r, 13) ^ Ee(r, 22)) + go(r, i, s) | 0;
        h = u, u = c, c = a, a = o + f | 0, o = s, s = i, i = r, r = f + w | 0;
      }
      r = r + this.A | 0, i = i + this.B | 0, s = s + this.C | 0, o = o + this.D | 0, a = a + this.E | 0, c = c + this.F | 0, u = u + this.G | 0, h = h + this.H | 0, this.set(r, i, s, o, a, c, u, h);
    }
    roundClean() {
      pt(Re);
    }
    destroy() {
      this.set(0, 0, 0, 0, 0, 0, 0, 0), pt(this.buffer);
    }
  };
  var mo = class extends bo {
    constructor() {
      super(32);
      l(this, "A", De[0] | 0);
      l(this, "B", De[1] | 0);
      l(this, "C", De[2] | 0);
      l(this, "D", De[3] | 0);
      l(this, "E", De[4] | 0);
      l(this, "F", De[5] | 0);
      l(this, "G", De[6] | 0);
      l(this, "H", De[7] | 0);
    }
  };
  var ye = /* @__PURE__ */ fo(
    () => new mo(),
    /* @__PURE__ */ yo(1)
  );
  var Ln = /* @__PURE__ */ BigInt(0);
  var mn = /* @__PURE__ */ BigInt(1);
  function Ot(n, e = "") {
    if (typeof n != "boolean") {
      const t = e && `"${e}" `;
      throw new Error(t + "expected boolean, got type=" + typeof n);
    }
    return n;
  }
  function ui(n) {
    if (typeof n == "bigint") {
      if (!Pt(n))
        throw new Error("positive bigint expected, got " + n);
    } else
      Ue(n);
    return n;
  }
  function mt(n) {
    const e = ui(n).toString(16);
    return e.length & 1 ? "0" + e : e;
  }
  function hi(n) {
    if (typeof n != "string")
      throw new Error("hex string expected, got " + typeof n);
    return n === "" ? Ln : BigInt("0x" + n);
  }
  function bt(n) {
    return hi(F(n));
  }
  function di(n) {
    return hi(F(Eo(_(n)).reverse()));
  }
  function Un(n, e) {
    Ue(e), n = ui(n);
    const t = H(n.toString(16).padStart(e * 2, "0"));
    if (t.length !== e)
      throw new Error("number too large");
    return t;
  }
  function li(n, e) {
    return Un(n, e).reverse();
  }
  function Eo(n) {
    return Uint8Array.from(n);
  }
  function So(n) {
    return Uint8Array.from(n, (e, t) => {
      const r = e.charCodeAt(0);
      if (e.length !== 1 || r > 127)
        throw new Error(`string contains non-ASCII character "${n[t]}" with code ${r} at position ${t}`);
      return r;
    });
  }
  var Pt = (n) => typeof n == "bigint" && Ln <= n;
  function Ko(n, e, t) {
    return Pt(n) && Pt(e) && Pt(t) && e <= n && n < t;
  }
  function ko(n, e, t, r) {
    if (!Ko(e, t, r))
      throw new Error("expected valid " + n + ": " + t + " <= n < " + r + ", got " + e);
  }
  function xo(n) {
    let e;
    for (e = 0; n > Ln; n >>= mn, e += 1)
      ;
    return e;
  }
  var $n = (n) => (mn << BigInt(n)) - mn;
  function Po(n, e, t) {
    if (Ue(n, "hashLen"), Ue(e, "qByteLen"), typeof t != "function")
      throw new Error("hmacFn must be a function");
    const r = (b) => new Uint8Array(b), i = Uint8Array.of(), s = Uint8Array.of(0), o = Uint8Array.of(1), a = 1e3;
    let c = r(n), u = r(n), h = 0;
    const d = () => {
      c.fill(1), u.fill(0), h = 0;
    }, y = (...b) => t(u, ee(c, ...b)), f = (b = i) => {
      u = y(s, b), c = y(), b.length !== 0 && (u = y(o, b), c = y());
    }, p = () => {
      if (h++ >= a)
        throw new Error("drbg: tried max amount of iterations");
      let b = 0;
      const m = [];
      for (; b < e; ) {
        c = y();
        const P = c.slice();
        m.push(P), b += c.length;
      }
      return ee(...m);
    };
    return (b, m) => {
      d(), f(b);
      let P;
      for (; !(P = m(p())); )
        f();
      return d(), P;
    };
  }
  function Fn(n, e = {}, t = {}) {
    if (!n || typeof n != "object")
      throw new Error("expected valid options object");
    function r(s, o, a) {
      const c = n[s];
      if (a && c === void 0)
        return;
      const u = typeof c;
      if (u !== o || c === null)
        throw new Error(`param "${s}" is invalid: expected ${o}, got ${u}`);
    }
    const i = (s, o) => Object.entries(s).forEach(([a, c]) => r(a, c, o));
    i(e, false), i(t, true);
  }
  function Ar(n) {
    const e = /* @__PURE__ */ new WeakMap();
    return (t, ...r) => {
      const i = e.get(t);
      if (i !== void 0)
        return i;
      const s = n(t, ...r);
      return e.set(t, s), s;
    };
  }
  var ue = /* @__PURE__ */ BigInt(0);
  var se = /* @__PURE__ */ BigInt(1);
  var ze = /* @__PURE__ */ BigInt(2);
  var fi = /* @__PURE__ */ BigInt(3);
  var yi = /* @__PURE__ */ BigInt(4);
  var pi = /* @__PURE__ */ BigInt(5);
  var Ao = /* @__PURE__ */ BigInt(7);
  var gi = /* @__PURE__ */ BigInt(8);
  var Io = /* @__PURE__ */ BigInt(9);
  var vi = /* @__PURE__ */ BigInt(16);
  function we(n, e) {
    const t = n % e;
    return t >= ue ? t : e + t;
  }
  function pe(n, e, t) {
    let r = n;
    for (; e-- > ue; )
      r *= r, r %= t;
    return r;
  }
  function Ir(n, e) {
    if (n === ue)
      throw new Error("invert: expected non-zero number");
    if (e <= ue)
      throw new Error("invert: expected positive modulus, got " + e);
    let t = we(n, e), r = e, i = ue, s = se;
    for (; t !== ue; ) {
      const a = r / t, c = r % t, u = i - s * a;
      r = t, t = c, i = s, s = u;
    }
    if (r !== se)
      throw new Error("invert: does not exist");
    return we(i, e);
  }
  function Gn(n, e, t) {
    if (!n.eql(n.sqr(e), t))
      throw new Error("Cannot find square root");
  }
  function wi(n, e) {
    const t = (n.ORDER + se) / yi, r = n.pow(e, t);
    return Gn(n, r, e), r;
  }
  function Mo(n, e) {
    const t = (n.ORDER - pi) / gi, r = n.mul(e, ze), i = n.pow(r, t), s = n.mul(e, i), o = n.mul(n.mul(s, ze), i), a = n.mul(s, n.sub(o, n.ONE));
    return Gn(n, a, e), a;
  }
  function Co(n) {
    const e = $t(n), t = bi(n), r = t(e, e.neg(e.ONE)), i = t(e, r), s = t(e, e.neg(r)), o = (n + Ao) / vi;
    return (a, c) => {
      let u = a.pow(c, o), h = a.mul(u, r);
      const d = a.mul(u, i), y = a.mul(u, s), f = a.eql(a.sqr(h), c), p = a.eql(a.sqr(d), c);
      u = a.cmov(u, h, f), h = a.cmov(y, d, p);
      const w = a.eql(a.sqr(h), c), b = a.cmov(u, h, w);
      return Gn(a, b, c), b;
    };
  }
  function bi(n) {
    if (n < fi)
      throw new Error("sqrt is not defined for small field");
    let e = n - se, t = 0;
    for (; e % ze === ue; )
      e /= ze, t++;
    let r = ze;
    const i = $t(n);
    for (; Mr(i, r) === 1; )
      if (r++ > 1e3)
        throw new Error("Cannot find square root: probably non-prime P");
    if (t === 1)
      return wi;
    let s = i.pow(r, e);
    const o = (e + se) / ze;
    return function(c, u) {
      if (c.is0(u))
        return u;
      if (Mr(c, u) !== 1)
        throw new Error("Cannot find square root");
      let h = t, d = c.mul(c.ONE, s), y = c.pow(u, e), f = c.pow(u, o);
      for (; !c.eql(y, c.ONE); ) {
        if (c.is0(y))
          return c.ZERO;
        let p = 1, w = c.sqr(y);
        for (; !c.eql(w, c.ONE); )
          if (p++, w = c.sqr(w), p === h)
            throw new Error("Cannot find square root");
        const b = se << BigInt(h - p - 1), m = c.pow(d, b);
        h = p, d = c.sqr(m), y = c.mul(y, d), f = c.mul(f, m);
      }
      return f;
    };
  }
  function Oo(n) {
    return n % yi === fi ? wi : n % gi === pi ? Mo : n % vi === Io ? Co(n) : bi(n);
  }
  var Do = [
    "create",
    "isValid",
    "is0",
    "neg",
    "inv",
    "sqrt",
    "sqr",
    "eql",
    "add",
    "sub",
    "mul",
    "pow",
    "div",
    "addN",
    "subN",
    "mulN",
    "sqrN"
  ];
  function Ro(n) {
    const e = {
      ORDER: "bigint",
      BYTES: "number",
      BITS: "number"
    }, t = Do.reduce((r, i) => (r[i] = "function", r), e);
    return Fn(n, t), n;
  }
  function No(n, e, t) {
    if (t < ue)
      throw new Error("invalid exponent, negatives unsupported");
    if (t === ue)
      return n.ONE;
    if (t === se)
      return e;
    let r = n.ONE, i = e;
    for (; t > ue; )
      t & se && (r = n.mul(r, i)), i = n.sqr(i), t >>= se;
    return r;
  }
  function mi(n, e, t = false) {
    const r = new Array(e.length).fill(t ? n.ZERO : void 0), i = e.reduce((o, a, c) => n.is0(a) ? o : (r[c] = o, n.mul(o, a)), n.ONE), s = n.inv(i);
    return e.reduceRight((o, a, c) => n.is0(a) ? o : (r[c] = n.mul(o, r[c]), n.mul(o, a)), s), r;
  }
  function Mr(n, e) {
    const t = (n.ORDER - se) / ze, r = n.pow(e, t), i = n.eql(r, n.ONE), s = n.eql(r, n.ZERO), o = n.eql(r, n.neg(n.ONE));
    if (!i && !s && !o)
      throw new Error("invalid Legendre symbol result");
    return i ? 1 : s ? 0 : -1;
  }
  function Bo(n, e) {
    e !== void 0 && Ue(e);
    const t = e !== void 0 ? e : n.toString(2).length, r = Math.ceil(t / 8);
    return { nBitLength: t, nByteLength: r };
  }
  var To = class {
    constructor(e, t = {}) {
      l(this, "ORDER");
      l(this, "BITS");
      l(this, "BYTES");
      l(this, "isLE");
      l(this, "ZERO", ue);
      l(this, "ONE", se);
      l(this, "_lengths");
      l(this, "_sqrt");
      l(this, "_mod");
      var o;
      if (e <= ue)
        throw new Error("invalid field: expected ORDER > 0, got " + e);
      let r;
      this.isLE = false, t != null && typeof t == "object" && (typeof t.BITS == "number" && (r = t.BITS), typeof t.sqrt == "function" && (this.sqrt = t.sqrt), typeof t.isLE == "boolean" && (this.isLE = t.isLE), t.allowedLengths && (this._lengths = (o = t.allowedLengths) == null ? void 0 : o.slice()), typeof t.modFromBytes == "boolean" && (this._mod = t.modFromBytes));
      const { nBitLength: i, nByteLength: s } = Bo(e, r);
      if (s > 2048)
        throw new Error("invalid field: expected ORDER of <= 2048 bytes");
      this.ORDER = e, this.BITS = i, this.BYTES = s, this._sqrt = void 0, Object.preventExtensions(this);
    }
    create(e) {
      return we(e, this.ORDER);
    }
    isValid(e) {
      if (typeof e != "bigint")
        throw new Error("invalid field element: expected bigint, got " + typeof e);
      return ue <= e && e < this.ORDER;
    }
    is0(e) {
      return e === ue;
    }
    // is valid and invertible
    isValidNot0(e) {
      return !this.is0(e) && this.isValid(e);
    }
    isOdd(e) {
      return (e & se) === se;
    }
    neg(e) {
      return we(-e, this.ORDER);
    }
    eql(e, t) {
      return e === t;
    }
    sqr(e) {
      return we(e * e, this.ORDER);
    }
    add(e, t) {
      return we(e + t, this.ORDER);
    }
    sub(e, t) {
      return we(e - t, this.ORDER);
    }
    mul(e, t) {
      return we(e * t, this.ORDER);
    }
    pow(e, t) {
      return No(this, e, t);
    }
    div(e, t) {
      return we(e * Ir(t, this.ORDER), this.ORDER);
    }
    // Same as above, but doesn't normalize
    sqrN(e) {
      return e * e;
    }
    addN(e, t) {
      return e + t;
    }
    subN(e, t) {
      return e - t;
    }
    mulN(e, t) {
      return e * t;
    }
    inv(e) {
      return Ir(e, this.ORDER);
    }
    sqrt(e) {
      return this._sqrt || (this._sqrt = Oo(this.ORDER)), this._sqrt(this, e);
    }
    toBytes(e) {
      return this.isLE ? li(e, this.BYTES) : Un(e, this.BYTES);
    }
    fromBytes(e, t = false) {
      _(e);
      const { _lengths: r, BYTES: i, isLE: s, ORDER: o, _mod: a } = this;
      if (r) {
        if (!r.includes(e.length) || e.length > i)
          throw new Error("Field.fromBytes: expected " + r + " bytes, got " + e.length);
        const u = new Uint8Array(i);
        u.set(e, s ? 0 : u.length - e.length), e = u;
      }
      if (e.length !== i)
        throw new Error("Field.fromBytes: expected " + i + " bytes, got " + e.length);
      let c = s ? di(e) : bt(e);
      if (a && (c = we(c, o)), !t && !this.isValid(c))
        throw new Error("invalid field element: outside of range 0..ORDER");
      return c;
    }
    // TODO: we don't need it here, move out to separate fn
    invertBatch(e) {
      return mi(this, e);
    }
    // We can't move this out because Fp6, Fp12 implement it
    // and it's unclear what to return in there.
    cmov(e, t, r) {
      return r ? t : e;
    }
  };
  function $t(n, e = {}) {
    return new To(n, e);
  }
  function Ei(n) {
    if (typeof n != "bigint")
      throw new Error("field order must be bigint");
    const e = n.toString(2).length;
    return Math.ceil(e / 8);
  }
  function Si(n) {
    const e = Ei(n);
    return e + Math.ceil(e / 2);
  }
  function Ki(n, e, t = false) {
    _(n);
    const r = n.length, i = Ei(e), s = Si(e);
    if (r < 16 || r < s || r > 1024)
      throw new Error("expected " + s + "-1024 bytes of input, got " + r);
    const o = t ? di(n) : bt(n), a = we(o, e - se) + se;
    return t ? li(a, i) : Un(a, i);
  }
  var it = /* @__PURE__ */ BigInt(0);
  var qe = /* @__PURE__ */ BigInt(1);
  function Dt(n, e) {
    const t = e.negate();
    return n ? t : e;
  }
  function Cr(n, e) {
    const t = mi(n.Fp, e.map((r) => r.Z));
    return e.map((r, i) => n.fromAffine(r.toAffine(t[i])));
  }
  function ki(n, e) {
    if (!Number.isSafeInteger(n) || n <= 0 || n > e)
      throw new Error("invalid window size, expected [1.." + e + "], got W=" + n);
  }
  function nn(n, e) {
    ki(n, e);
    const t = Math.ceil(e / n) + 1, r = 2 ** (n - 1), i = 2 ** n, s = $n(n), o = BigInt(n);
    return { windows: t, windowSize: r, mask: s, maxNumber: i, shiftBy: o };
  }
  function Or(n, e, t) {
    const { windowSize: r, mask: i, maxNumber: s, shiftBy: o } = t;
    let a = Number(n & i), c = n >> o;
    a > r && (a -= s, c += qe);
    const u = e * r, h = u + Math.abs(a) - 1, d = a === 0, y = a < 0, f = e % 2 !== 0;
    return { nextN: c, offset: h, isZero: d, isNeg: y, isNegF: f, offsetF: u };
  }
  var rn = /* @__PURE__ */ new WeakMap();
  var xi = /* @__PURE__ */ new WeakMap();
  function sn(n) {
    return xi.get(n) || 1;
  }
  function Dr(n) {
    if (n !== it)
      throw new Error("invalid wNAF");
  }
  var _o = class {
    // Parametrized with a given Point class (not individual point)
    constructor(e, t) {
      l(this, "BASE");
      l(this, "ZERO");
      l(this, "Fn");
      l(this, "bits");
      this.BASE = e.BASE, this.ZERO = e.ZERO, this.Fn = e.Fn, this.bits = t;
    }
    // non-const time multiplication ladder
    _unsafeLadder(e, t, r = this.ZERO) {
      let i = e;
      for (; t > it; )
        t & qe && (r = r.add(i)), i = i.double(), t >>= qe;
      return r;
    }
    /**
     * Creates a wNAF precomputation window. Used for caching.
     * Default window size is set by `utils.precompute()` and is equal to 8.
     * Number of precomputed points depends on the curve size:
     * 2^(𝑊−1) * (Math.ceil(𝑛 / 𝑊) + 1), where:
     * - 𝑊 is the window size
     * - 𝑛 is the bitlength of the curve order.
     * For a 256-bit curve and window size 8, the number of precomputed points is 128 * 33 = 4224.
     * @param point Point instance
     * @param W window size
     * @returns precomputed point tables flattened to a single array
     */
    precomputeWindow(e, t) {
      const { windows: r, windowSize: i } = nn(t, this.bits), s = [];
      let o = e, a = o;
      for (let c = 0; c < r; c++) {
        a = o, s.push(a);
        for (let u = 1; u < i; u++)
          a = a.add(o), s.push(a);
        o = a.double();
      }
      return s;
    }
    /**
     * Implements ec multiplication using precomputed tables and w-ary non-adjacent form.
     * More compact implementation:
     * https://github.com/paulmillr/noble-secp256k1/blob/47cb1669b6e506ad66b35fe7d76132ae97465da2/index.ts#L502-L541
     * @returns real and fake (for const-time) points
     */
    wNAF(e, t, r) {
      if (!this.Fn.isValid(r))
        throw new Error("invalid scalar");
      let i = this.ZERO, s = this.BASE;
      const o = nn(e, this.bits);
      for (let a = 0; a < o.windows; a++) {
        const { nextN: c, offset: u, isZero: h, isNeg: d, isNegF: y, offsetF: f } = Or(r, a, o);
        r = c, h ? s = s.add(Dt(y, t[f])) : i = i.add(Dt(d, t[u]));
      }
      return Dr(r), { p: i, f: s };
    }
    /**
     * Implements ec unsafe (non const-time) multiplication using precomputed tables and w-ary non-adjacent form.
     * @param acc accumulator point to add result of multiplication
     * @returns point
     */
    wNAFUnsafe(e, t, r, i = this.ZERO) {
      const s = nn(e, this.bits);
      for (let o = 0; o < s.windows && r !== it; o++) {
        const { nextN: a, offset: c, isZero: u, isNeg: h } = Or(r, o, s);
        if (r = a, !u) {
          const d = t[c];
          i = i.add(h ? d.negate() : d);
        }
      }
      return Dr(r), i;
    }
    getPrecomputes(e, t, r) {
      let i = rn.get(t);
      return i || (i = this.precomputeWindow(t, e), e !== 1 && (typeof r == "function" && (i = r(i)), rn.set(t, i))), i;
    }
    cached(e, t, r) {
      const i = sn(e);
      return this.wNAF(i, this.getPrecomputes(i, e, r), t);
    }
    unsafe(e, t, r, i) {
      const s = sn(e);
      return s === 1 ? this._unsafeLadder(e, t, i) : this.wNAFUnsafe(s, this.getPrecomputes(s, e, r), t, i);
    }
    // We calculate precomputes for elliptic curve point multiplication
    // using windowed method. This specifies window size and
    // stores precomputed values. Usually only base point would be precomputed.
    createCache(e, t) {
      ki(t, this.bits), xi.set(e, t), rn.delete(e);
    }
    hasCache(e) {
      return sn(e) !== 1;
    }
  };
  function Lo(n, e, t, r) {
    let i = e, s = n.ZERO, o = n.ZERO;
    for (; t > it || r > it; )
      t & qe && (s = s.add(i)), r & qe && (o = o.add(i)), i = i.double(), t >>= qe, r >>= qe;
    return { p1: s, p2: o };
  }
  function Rr(n, e, t) {
    if (e) {
      if (e.ORDER !== n)
        throw new Error("Field.ORDER must match order: Fp == p, Fn == n");
      return Ro(e), e;
    } else
      return $t(n, { isLE: t });
  }
  function Uo(n, e, t = {}, r) {
    if (r === void 0 && (r = n === "edwards"), !e || typeof e != "object")
      throw new Error(`expected valid ${n} CURVE object`);
    for (const c of ["p", "n", "h"]) {
      const u = e[c];
      if (!(typeof u == "bigint" && u > it))
        throw new Error(`CURVE.${c} must be positive bigint`);
    }
    const i = Rr(e.p, t.Fp, r), s = Rr(e.n, t.Fn, r), a = ["Gx", "Gy", "a", "b"];
    for (const c of a)
      if (!i.isValid(e[c]))
        throw new Error(`CURVE.${c} must be valid field element of CURVE.Fp`);
    return e = Object.freeze(Object.assign({}, e)), { CURVE: e, Fp: i, Fn: s };
  }
  function Pi(n, e) {
    return function(r) {
      const i = n(r);
      return { secretKey: i, publicKey: e(i) };
    };
  }
  var Ai = class {
    constructor(e, t) {
      l(this, "oHash");
      l(this, "iHash");
      l(this, "blockLen");
      l(this, "outputLen");
      l(this, "finished", false);
      l(this, "destroyed", false);
      if (Ut(e), _(t, void 0, "key"), this.iHash = e.create(), typeof this.iHash.update != "function")
        throw new Error("Expected instance of class which extends utils.Hash");
      this.blockLen = this.iHash.blockLen, this.outputLen = this.iHash.outputLen;
      const r = this.blockLen, i = new Uint8Array(r);
      i.set(t.length > r ? e.create().update(t).digest() : t);
      for (let s = 0; s < i.length; s++)
        i[s] ^= 54;
      this.iHash.update(i), this.oHash = e.create();
      for (let s = 0; s < i.length; s++)
        i[s] ^= 106;
      this.oHash.update(i), pt(i);
    }
    update(e) {
      return Ct(this), this.iHash.update(e), this;
    }
    digestInto(e) {
      Ct(this), _(e, this.outputLen, "output"), this.finished = true, this.iHash.digestInto(e), this.oHash.update(e), this.oHash.digestInto(e), this.destroy();
    }
    digest() {
      const e = new Uint8Array(this.oHash.outputLen);
      return this.digestInto(e), e;
    }
    _cloneInto(e) {
      e || (e = Object.create(Object.getPrototypeOf(this), {}));
      const { oHash: t, iHash: r, finished: i, destroyed: s, blockLen: o, outputLen: a } = this;
      return e = e, e.finished = i, e.destroyed = s, e.blockLen = o, e.outputLen = a, e.oHash = t._cloneInto(e.oHash), e.iHash = r._cloneInto(e.iHash), e;
    }
    clone() {
      return this._cloneInto();
    }
    destroy() {
      this.destroyed = true, this.oHash.destroy(), this.iHash.destroy();
    }
  };
  var ct = (n, e, t) => new Ai(n, e).update(t).digest();
  ct.create = (n, e) => new Ai(n, e);
  var Nr = (n, e) => (n + (n >= 0 ? e : -e) / Ii) / e;
  function $o(n, e, t) {
    const [[r, i], [s, o]] = e, a = Nr(o * n, t), c = Nr(-i * n, t);
    let u = n - a * r - c * s, h = -a * i - c * o;
    const d = u < Me, y = h < Me;
    d && (u = -u), y && (h = -h);
    const f = $n(Math.ceil(xo(t) / 2)) + tt;
    if (u < Me || u >= f || h < Me || h >= f)
      throw new Error("splitScalar (endomorphism): failed, k=" + n);
    return { k1neg: d, k1: u, k2neg: y, k2: h };
  }
  function En(n) {
    if (!["compact", "recovered", "der"].includes(n))
      throw new Error('Signature format must be "compact", "recovered", or "der"');
    return n;
  }
  function on(n, e) {
    const t = {};
    for (let r of Object.keys(e))
      t[r] = n[r] === void 0 ? e[r] : n[r];
    return Ot(t.lowS, "lowS"), Ot(t.prehash, "prehash"), t.format !== void 0 && En(t.format), t;
  }
  var Fo = class extends Error {
    constructor(e = "") {
      super(e);
    }
  };
  var Te = {
    // asn.1 DER encoding utils
    Err: Fo,
    // Basic building block is TLV (Tag-Length-Value)
    _tlv: {
      encode: (n, e) => {
        const { Err: t } = Te;
        if (n < 0 || n > 256)
          throw new t("tlv.encode: wrong tag");
        if (e.length & 1)
          throw new t("tlv.encode: unpadded data");
        const r = e.length / 2, i = mt(r);
        if (i.length / 2 & 128)
          throw new t("tlv.encode: long form length too big");
        const s = r > 127 ? mt(i.length / 2 | 128) : "";
        return mt(n) + s + i + e;
      },
      // v - value, l - left bytes (unparsed)
      decode(n, e) {
        const { Err: t } = Te;
        let r = 0;
        if (n < 0 || n > 256)
          throw new t("tlv.encode: wrong tag");
        if (e.length < 2 || e[r++] !== n)
          throw new t("tlv.decode: wrong tlv");
        const i = e[r++], s = !!(i & 128);
        let o = 0;
        if (!s)
          o = i;
        else {
          const c = i & 127;
          if (!c)
            throw new t("tlv.decode(long): indefinite length not supported");
          if (c > 4)
            throw new t("tlv.decode(long): byte length is too big");
          const u = e.subarray(r, r + c);
          if (u.length !== c)
            throw new t("tlv.decode: length bytes not complete");
          if (u[0] === 0)
            throw new t("tlv.decode(long): zero leftmost byte");
          for (const h of u)
            o = o << 8 | h;
          if (r += c, o < 128)
            throw new t("tlv.decode(long): not minimal encoding");
        }
        const a = e.subarray(r, r + o);
        if (a.length !== o)
          throw new t("tlv.decode: wrong value length");
        return { v: a, l: e.subarray(r + o) };
      }
    },
    // https://crypto.stackexchange.com/a/57734 Leftmost bit of first byte is 'negative' flag,
    // since we always use positive integers here. It must always be empty:
    // - add zero byte if exists
    // - if next byte doesn't have a flag, leading zero is not allowed (minimal encoding)
    _int: {
      encode(n) {
        const { Err: e } = Te;
        if (n < Me)
          throw new e("integer: negative integers are not allowed");
        let t = mt(n);
        if (Number.parseInt(t[0], 16) & 8 && (t = "00" + t), t.length & 1)
          throw new e("unexpected DER parsing assertion: unpadded hex");
        return t;
      },
      decode(n) {
        const { Err: e } = Te;
        if (n[0] & 128)
          throw new e("invalid signature integer: negative");
        if (n[0] === 0 && !(n[1] & 128))
          throw new e("invalid signature integer: unnecessary leading zero");
        return bt(n);
      }
    },
    toSig(n) {
      const { Err: e, _int: t, _tlv: r } = Te, i = _(n, void 0, "signature"), { v: s, l: o } = r.decode(48, i);
      if (o.length)
        throw new e("invalid signature: left bytes after parsing");
      const { v: a, l: c } = r.decode(2, s), { v: u, l: h } = r.decode(2, c);
      if (h.length)
        throw new e("invalid signature: left bytes after parsing");
      return { r: t.decode(a), s: t.decode(u) };
    },
    hexFromSig(n) {
      const { _tlv: e, _int: t } = Te, r = e.encode(2, t.encode(n.r)), i = e.encode(2, t.encode(n.s)), s = r + i;
      return e.encode(48, s);
    }
  };
  var Me = BigInt(0);
  var tt = BigInt(1);
  var Ii = BigInt(2);
  var Et = BigInt(3);
  var Go = BigInt(4);
  function Ho(n, e = {}) {
    const t = Uo("weierstrass", n, e), { Fp: r, Fn: i } = t;
    let s = t.CURVE;
    const { h: o, n: a } = s;
    Fn(e, {}, {
      allowInfinityPoint: "boolean",
      clearCofactor: "function",
      isTorsionFree: "function",
      fromBytes: "function",
      toBytes: "function",
      endo: "object"
    });
    const { endo: c } = e;
    if (c && (!r.is0(s.a) || typeof c.beta != "bigint" || !Array.isArray(c.basises)))
      throw new Error('invalid endo: expected "beta": bigint and "basises": array');
    const u = Ci(r, i);
    function h() {
      if (!r.isOdd)
        throw new Error("compression is not supported: Field does not have .isOdd()");
    }
    function d(M, v, g) {
      const { x: E, y: K } = v.toAffine(), A = r.toBytes(E);
      if (Ot(g, "isCompressed"), g) {
        h();
        const k = !r.isOdd(K);
        return ee(Mi(k), A);
      } else
        return ee(Uint8Array.of(4), A, r.toBytes(K));
    }
    function y(M) {
      _(M, void 0, "Point");
      const { publicKey: v, publicKeyUncompressed: g } = u, E = M.length, K = M[0], A = M.subarray(1);
      if (E === v && (K === 2 || K === 3)) {
        const k = r.fromBytes(A);
        if (!r.isValid(k))
          throw new Error("bad point: is not on curve, wrong x");
        const I = w(k);
        let S;
        try {
          S = r.sqrt(I);
        } catch (Y) {
          const $ = Y instanceof Error ? ": " + Y.message : "";
          throw new Error("bad point: is not on curve, sqrt error" + $);
        }
        h();
        const x = r.isOdd(S);
        return (K & 1) === 1 !== x && (S = r.neg(S)), { x: k, y: S };
      } else if (E === g && K === 4) {
        const k = r.BYTES, I = r.fromBytes(A.subarray(0, k)), S = r.fromBytes(A.subarray(k, k * 2));
        if (!b(I, S))
          throw new Error("bad point: is not on curve");
        return { x: I, y: S };
      } else
        throw new Error(`bad point: got length ${E}, expected compressed=${v} or uncompressed=${g}`);
    }
    const f = e.toBytes || d, p = e.fromBytes || y;
    function w(M) {
      const v = r.sqr(M), g = r.mul(v, M);
      return r.add(r.add(g, r.mul(M, s.a)), s.b);
    }
    function b(M, v) {
      const g = r.sqr(v), E = w(M);
      return r.eql(g, E);
    }
    if (!b(s.Gx, s.Gy))
      throw new Error("bad curve params: generator point");
    const m = r.mul(r.pow(s.a, Et), Go), P = r.mul(r.sqr(s.b), BigInt(27));
    if (r.is0(r.add(m, P)))
      throw new Error("bad curve params: a or b");
    function N(M, v, g = false) {
      if (!r.isValid(v) || g && r.is0(v))
        throw new Error(`bad point coordinate ${M}`);
      return v;
    }
    function O(M) {
      if (!(M instanceof T))
        throw new Error("Weierstrass Point expected");
    }
    function X(M) {
      if (!c || !c.basises)
        throw new Error("no endo");
      return $o(M, c.basises, i.ORDER);
    }
    const U = Ar((M, v) => {
      const { X: g, Y: E, Z: K } = M;
      if (r.eql(K, r.ONE))
        return { x: g, y: E };
      const A = M.is0();
      v == null && (v = A ? r.ONE : r.inv(K));
      const k = r.mul(g, v), I = r.mul(E, v), S = r.mul(K, v);
      if (A)
        return { x: r.ZERO, y: r.ZERO };
      if (!r.eql(S, r.ONE))
        throw new Error("invZ was invalid");
      return { x: k, y: I };
    }), Z = Ar((M) => {
      if (M.is0()) {
        if (e.allowInfinityPoint && !r.is0(M.Y))
          return;
        throw new Error("bad point: ZERO");
      }
      const { x: v, y: g } = M.toAffine();
      if (!r.isValid(v) || !r.isValid(g))
        throw new Error("bad point: x or y not field elements");
      if (!b(v, g))
        throw new Error("bad point: equation left != right");
      if (!M.isTorsionFree())
        throw new Error("bad point: not in prime-order subgroup");
      return true;
    });
    function q(M, v, g, E, K) {
      return g = new T(r.mul(g.X, M), g.Y, g.Z), v = Dt(E, v), g = Dt(K, g), v.add(g);
    }
    const C = class C2 {
      /** Does NOT validate if the point is valid. Use `.assertValidity()`. */
      constructor(v, g, E) {
        l(this, "X");
        l(this, "Y");
        l(this, "Z");
        this.X = N("x", v), this.Y = N("y", g, true), this.Z = N("z", E), Object.freeze(this);
      }
      static CURVE() {
        return s;
      }
      /** Does NOT validate if the point is valid. Use `.assertValidity()`. */
      static fromAffine(v) {
        const { x: g, y: E } = v || {};
        if (!v || !r.isValid(g) || !r.isValid(E))
          throw new Error("invalid affine point");
        if (v instanceof C2)
          throw new Error("projective point not allowed");
        return r.is0(g) && r.is0(E) ? C2.ZERO : new C2(g, E, r.ONE);
      }
      static fromBytes(v) {
        const g = C2.fromAffine(p(_(v, void 0, "point")));
        return g.assertValidity(), g;
      }
      static fromHex(v) {
        return C2.fromBytes(H(v));
      }
      get x() {
        return this.toAffine().x;
      }
      get y() {
        return this.toAffine().y;
      }
      /**
       *
       * @param windowSize
       * @param isLazy true will defer table computation until the first multiplication
       * @returns
       */
      precompute(v = 8, g = true) {
        return V.createCache(this, v), g || this.multiply(Et), this;
      }
      // TODO: return `this`
      /** A point on curve is valid if it conforms to equation. */
      assertValidity() {
        Z(this);
      }
      hasEvenY() {
        const { y: v } = this.toAffine();
        if (!r.isOdd)
          throw new Error("Field doesn't support isOdd");
        return !r.isOdd(v);
      }
      /** Compare one point to another. */
      equals(v) {
        O(v);
        const { X: g, Y: E, Z: K } = this, { X: A, Y: k, Z: I } = v, S = r.eql(r.mul(g, I), r.mul(A, K)), x = r.eql(r.mul(E, I), r.mul(k, K));
        return S && x;
      }
      /** Flips point to one corresponding to (x, -y) in Affine coordinates. */
      negate() {
        return new C2(this.X, r.neg(this.Y), this.Z);
      }
      // Renes-Costello-Batina exception-free doubling formula.
      // There is 30% faster Jacobian formula, but it is not complete.
      // https://eprint.iacr.org/2015/1060, algorithm 3
      // Cost: 8M + 3S + 3*a + 2*b3 + 15add.
      double() {
        const { a: v, b: g } = s, E = r.mul(g, Et), { X: K, Y: A, Z: k } = this;
        let I = r.ZERO, S = r.ZERO, x = r.ZERO, D = r.mul(K, K), Y = r.mul(A, A), $ = r.mul(k, k), R = r.mul(K, A);
        return R = r.add(R, R), x = r.mul(K, k), x = r.add(x, x), I = r.mul(v, x), S = r.mul(E, $), S = r.add(I, S), I = r.sub(Y, S), S = r.add(Y, S), S = r.mul(I, S), I = r.mul(R, I), x = r.mul(E, x), $ = r.mul(v, $), R = r.sub(D, $), R = r.mul(v, R), R = r.add(R, x), x = r.add(D, D), D = r.add(x, D), D = r.add(D, $), D = r.mul(D, R), S = r.add(S, D), $ = r.mul(A, k), $ = r.add($, $), D = r.mul($, R), I = r.sub(I, D), x = r.mul($, Y), x = r.add(x, x), x = r.add(x, x), new C2(I, S, x);
      }
      // Renes-Costello-Batina exception-free addition formula.
      // There is 30% faster Jacobian formula, but it is not complete.
      // https://eprint.iacr.org/2015/1060, algorithm 1
      // Cost: 12M + 0S + 3*a + 3*b3 + 23add.
      add(v) {
        O(v);
        const { X: g, Y: E, Z: K } = this, { X: A, Y: k, Z: I } = v;
        let S = r.ZERO, x = r.ZERO, D = r.ZERO;
        const Y = s.a, $ = r.mul(s.b, Et);
        let R = r.mul(g, A), Q = r.mul(E, k), ne = r.mul(K, I), he = r.add(g, E), j = r.add(A, k);
        he = r.mul(he, j), j = r.add(R, Q), he = r.sub(he, j), j = r.add(g, K);
        let re = r.add(A, I);
        return j = r.mul(j, re), re = r.add(R, ne), j = r.sub(j, re), re = r.add(E, K), S = r.add(k, I), re = r.mul(re, S), S = r.add(Q, ne), re = r.sub(re, S), D = r.mul(Y, j), S = r.mul($, ne), D = r.add(S, D), S = r.sub(Q, D), D = r.add(Q, D), x = r.mul(S, D), Q = r.add(R, R), Q = r.add(Q, R), ne = r.mul(Y, ne), j = r.mul($, j), Q = r.add(Q, ne), ne = r.sub(R, ne), ne = r.mul(Y, ne), j = r.add(j, ne), R = r.mul(Q, j), x = r.add(x, R), R = r.mul(re, j), S = r.mul(he, S), S = r.sub(S, R), R = r.mul(he, Q), D = r.mul(re, D), D = r.add(D, R), new C2(S, x, D);
      }
      subtract(v) {
        return this.add(v.negate());
      }
      is0() {
        return this.equals(C2.ZERO);
      }
      /**
       * Constant time multiplication.
       * Uses wNAF method. Windowed method may be 10% faster,
       * but takes 2x longer to generate and consumes 2x memory.
       * Uses precomputes when available.
       * Uses endomorphism for Koblitz curves.
       * @param scalar by which the point would be multiplied
       * @returns New point
       */
      multiply(v) {
        const { endo: g } = e;
        if (!i.isValidNot0(v))
          throw new Error("invalid scalar: out of range");
        let E, K;
        const A = (k) => V.cached(this, k, (I) => Cr(C2, I));
        if (g) {
          const { k1neg: k, k1: I, k2neg: S, k2: x } = X(v), { p: D, f: Y } = A(I), { p: $, f: R } = A(x);
          K = Y.add(R), E = q(g.beta, D, $, k, S);
        } else {
          const { p: k, f: I } = A(v);
          E = k, K = I;
        }
        return Cr(C2, [E, K])[0];
      }
      /**
       * Non-constant-time multiplication. Uses double-and-add algorithm.
       * It's faster, but should only be used when you don't care about
       * an exposed secret key e.g. sig verification, which works over *public* keys.
       */
      multiplyUnsafe(v) {
        const { endo: g } = e, E = this;
        if (!i.isValid(v))
          throw new Error("invalid scalar: out of range");
        if (v === Me || E.is0())
          return C2.ZERO;
        if (v === tt)
          return E;
        if (V.hasCache(this))
          return this.multiply(v);
        if (g) {
          const { k1neg: K, k1: A, k2neg: k, k2: I } = X(v), { p1: S, p2: x } = Lo(C2, E, A, I);
          return q(g.beta, S, x, K, k);
        } else
          return V.unsafe(E, v);
      }
      /**
       * Converts Projective point to affine (x, y) coordinates.
       * @param invertedZ Z^-1 (inverted zero) - optional, precomputation is useful for invertBatch
       */
      toAffine(v) {
        return U(this, v);
      }
      /**
       * Checks whether Point is free of torsion elements (is in prime subgroup).
       * Always torsion-free for cofactor=1 curves.
       */
      isTorsionFree() {
        const { isTorsionFree: v } = e;
        return o === tt ? true : v ? v(C2, this) : V.unsafe(this, a).is0();
      }
      clearCofactor() {
        const { clearCofactor: v } = e;
        return o === tt ? this : v ? v(C2, this) : this.multiplyUnsafe(o);
      }
      isSmallOrder() {
        return this.multiplyUnsafe(o).is0();
      }
      toBytes(v = true) {
        return Ot(v, "isCompressed"), this.assertValidity(), f(C2, this, v);
      }
      toHex(v = true) {
        return F(this.toBytes(v));
      }
      toString() {
        return `<Point ${this.is0() ? "ZERO" : this.toHex()}>`;
      }
    };
    l(C, "BASE", new C(s.Gx, s.Gy, r.ONE)), // zero / infinity / identity point
    l(C, "ZERO", new C(r.ZERO, r.ONE, r.ZERO)), // 0, 1, 0
    // math field
    l(C, "Fp", r), // scalar field
    l(C, "Fn", i);
    let T = C;
    const W = i.BITS, V = new _o(T, e.endo ? Math.ceil(W / 2) : W);
    return T.BASE.precompute(8), T;
  }
  function Mi(n) {
    return Uint8Array.of(n ? 2 : 3);
  }
  function Ci(n, e) {
    return {
      secretKey: e.BYTES,
      publicKey: 1 + n.BYTES,
      publicKeyUncompressed: 1 + 2 * n.BYTES,
      publicKeyHasPrefix: true,
      signature: 2 * e.BYTES
    };
  }
  function zo(n, e = {}) {
    const { Fn: t } = n, r = e.randomBytes || We, i = Object.assign(Ci(n.Fp, t), { seed: Si(t.ORDER) });
    function s(f) {
      try {
        const p = t.fromBytes(f);
        return t.isValidNot0(p);
      } catch {
        return false;
      }
    }
    function o(f, p) {
      const { publicKey: w, publicKeyUncompressed: b } = i;
      try {
        const m = f.length;
        return p === true && m !== w || p === false && m !== b ? false : !!n.fromBytes(f);
      } catch {
        return false;
      }
    }
    function a(f = r(i.seed)) {
      return Ki(_(f, i.seed, "seed"), t.ORDER);
    }
    function c(f, p = true) {
      return n.BASE.multiply(t.fromBytes(f)).toBytes(p);
    }
    function u(f) {
      const { secretKey: p, publicKey: w, publicKeyUncompressed: b } = i;
      if (!_n(f) || "_lengths" in t && t._lengths || p === w)
        return;
      const m = _(f, void 0, "key").length;
      return m === w || m === b;
    }
    function h(f, p, w = true) {
      if (u(f) === true)
        throw new Error("first arg must be private key");
      if (u(p) === false)
        throw new Error("second arg must be public key");
      const b = t.fromBytes(f);
      return n.fromBytes(p).multiply(b).toBytes(w);
    }
    const d = {
      isValidSecretKey: s,
      isValidPublicKey: o,
      randomSecretKey: a
    }, y = Pi(a, c);
    return Object.freeze({ getPublicKey: c, getSharedSecret: h, keygen: y, Point: n, utils: d, lengths: i });
  }
  function qo(n, e, t = {}) {
    Ut(e), Fn(t, {}, {
      hmac: "function",
      lowS: "boolean",
      randomBytes: "function",
      bits2int: "function",
      bits2int_modN: "function"
    }), t = Object.assign({}, t);
    const r = t.randomBytes || We, i = t.hmac || ((v, g) => ct(e, v, g)), { Fp: s, Fn: o } = n, { ORDER: a, BITS: c } = o, { keygen: u, getPublicKey: h, getSharedSecret: d, utils: y, lengths: f } = zo(n, t), p = {
      prehash: true,
      lowS: typeof t.lowS == "boolean" ? t.lowS : true,
      format: "compact",
      extraEntropy: false
    }, w = a * Ii < s.ORDER;
    function b(v) {
      const g = a >> tt;
      return v > g;
    }
    function m(v, g) {
      if (!o.isValidNot0(g))
        throw new Error(`invalid signature ${v}: out of range 1..Point.Fn.ORDER`);
      return g;
    }
    function P() {
      if (w)
        throw new Error('"recovered" sig type is not supported for cofactor >2 curves');
    }
    function N(v, g) {
      En(g);
      const E = f.signature, K = g === "compact" ? E : g === "recovered" ? E + 1 : void 0;
      return _(v, K);
    }
    class O {
      constructor(g, E, K) {
        l(this, "r");
        l(this, "s");
        l(this, "recovery");
        if (this.r = m("r", g), this.s = m("s", E), K != null) {
          if (P(), ![0, 1, 2, 3].includes(K))
            throw new Error("invalid recovery id");
          this.recovery = K;
        }
        Object.freeze(this);
      }
      static fromBytes(g, E = p.format) {
        N(g, E);
        let K;
        if (E === "der") {
          const { r: S, s: x } = Te.toSig(_(g));
          return new O(S, x);
        }
        E === "recovered" && (K = g[0], E = "compact", g = g.subarray(1));
        const A = f.signature / 2, k = g.subarray(0, A), I = g.subarray(A, A * 2);
        return new O(o.fromBytes(k), o.fromBytes(I), K);
      }
      static fromHex(g, E) {
        return this.fromBytes(H(g), E);
      }
      assertRecovery() {
        const { recovery: g } = this;
        if (g == null)
          throw new Error("invalid recovery id: must be present");
        return g;
      }
      addRecoveryBit(g) {
        return new O(this.r, this.s, g);
      }
      recoverPublicKey(g) {
        const { r: E, s: K } = this, A = this.assertRecovery(), k = A === 2 || A === 3 ? E + a : E;
        if (!s.isValid(k))
          throw new Error("invalid recovery id: sig.r+curve.n != R.x");
        const I = s.toBytes(k), S = n.fromBytes(ee(Mi((A & 1) === 0), I)), x = o.inv(k), D = U(_(g, void 0, "msgHash")), Y = o.create(-D * x), $ = o.create(K * x), R = n.BASE.multiplyUnsafe(Y).add(S.multiplyUnsafe($));
        if (R.is0())
          throw new Error("invalid recovery: point at infinify");
        return R.assertValidity(), R;
      }
      // Signatures should be low-s, to prevent malleability.
      hasHighS() {
        return b(this.s);
      }
      toBytes(g = p.format) {
        if (En(g), g === "der")
          return H(Te.hexFromSig(this));
        const { r: E, s: K } = this, A = o.toBytes(E), k = o.toBytes(K);
        return g === "recovered" ? (P(), ee(Uint8Array.of(this.assertRecovery()), A, k)) : ee(A, k);
      }
      toHex(g) {
        return F(this.toBytes(g));
      }
    }
    const X = t.bits2int || function(g) {
      if (g.length > 8192)
        throw new Error("input is too large");
      const E = bt(g), K = g.length * 8 - c;
      return K > 0 ? E >> BigInt(K) : E;
    }, U = t.bits2int_modN || function(g) {
      return o.create(X(g));
    }, Z = $n(c);
    function q(v) {
      return ko("num < 2^" + c, v, Me, Z), o.toBytes(v);
    }
    function T(v, g) {
      return _(v, void 0, "message"), g ? _(e(v), void 0, "prehashed message") : v;
    }
    function W(v, g, E) {
      const { lowS: K, prehash: A, extraEntropy: k } = on(E, p);
      v = T(v, A);
      const I = U(v), S = o.fromBytes(g);
      if (!o.isValidNot0(S))
        throw new Error("invalid private key");
      const x = [q(S), q(I)];
      if (k != null && k !== false) {
        const R = k === true ? r(f.secretKey) : k;
        x.push(_(R, void 0, "extraEntropy"));
      }
      const D = ee(...x), Y = I;
      function $(R) {
        const Q = X(R);
        if (!o.isValidNot0(Q))
          return;
        const ne = o.inv(Q), he = n.BASE.multiply(Q).toAffine(), j = o.create(he.x);
        if (j === Me)
          return;
        const re = o.create(ne * o.create(Y + j * S));
        if (re === Me)
          return;
        let kr = (he.x === j ? 0 : 2) | Number(he.y & tt), xr = re;
        return K && b(re) && (xr = o.neg(re), kr ^= 1), new O(j, xr, w ? void 0 : kr);
      }
      return { seed: D, k2sig: $ };
    }
    function V(v, g, E = {}) {
      const { seed: K, k2sig: A } = W(v, g, E);
      return Po(e.outputLen, o.BYTES, i)(K, A).toBytes(E.format);
    }
    function C(v, g, E, K = {}) {
      const { lowS: A, prehash: k, format: I } = on(K, p);
      if (E = _(E, void 0, "publicKey"), g = T(g, k), !_n(v)) {
        const S = v instanceof O ? ", use sig.toBytes()" : "";
        throw new Error("verify expects Uint8Array signature" + S);
      }
      N(v, I);
      try {
        const S = O.fromBytes(v, I), x = n.fromBytes(E);
        if (A && S.hasHighS())
          return false;
        const { r: D, s: Y } = S, $ = U(g), R = o.inv(Y), Q = o.create($ * R), ne = o.create(D * R), he = n.BASE.multiplyUnsafe(Q).add(x.multiplyUnsafe(ne));
        return he.is0() ? false : o.create(he.x) === D;
      } catch {
        return false;
      }
    }
    function M(v, g, E = {}) {
      const { prehash: K } = on(E, p);
      return g = T(g, K), O.fromBytes(v, "recovered").recoverPublicKey(g).toBytes();
    }
    return Object.freeze({
      keygen: u,
      getPublicKey: h,
      getSharedSecret: d,
      utils: y,
      lengths: f,
      Point: n,
      sign: V,
      verify: C,
      recoverPublicKey: M,
      Signature: O,
      hash: e
    });
  }
  var Ft = {
    p: BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f"),
    n: BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141"),
    h: BigInt(1),
    a: BigInt(0),
    b: BigInt(7),
    Gx: BigInt("0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798"),
    Gy: BigInt("0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8")
  };
  var Vo = {
    beta: BigInt("0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee"),
    basises: [
      [BigInt("0x3086d221a7d46bcde86c90e49284eb15"), -BigInt("0xe4437ed6010e88286f547fa90abfe4c3")],
      [BigInt("0x114ca50f7a8e2f3f657c1108d9d44cfd8"), BigInt("0x3086d221a7d46bcde86c90e49284eb15")]
    ]
  };
  var jo = /* @__PURE__ */ BigInt(0);
  var Sn = /* @__PURE__ */ BigInt(2);
  function Zo(n) {
    const e = Ft.p, t = BigInt(3), r = BigInt(6), i = BigInt(11), s = BigInt(22), o = BigInt(23), a = BigInt(44), c = BigInt(88), u = n * n * n % e, h = u * u * n % e, d = pe(h, t, e) * h % e, y = pe(d, t, e) * h % e, f = pe(y, Sn, e) * u % e, p = pe(f, i, e) * f % e, w = pe(p, s, e) * p % e, b = pe(w, a, e) * w % e, m = pe(b, c, e) * b % e, P = pe(m, a, e) * w % e, N = pe(P, t, e) * h % e, O = pe(N, o, e) * p % e, X = pe(O, r, e) * u % e, U = pe(X, Sn, e);
    if (!Rt.eql(Rt.sqr(U), n))
      throw new Error("Cannot find square root");
    return U;
  }
  var Rt = $t(Ft.p, { sqrt: Zo });
  var Ye = /* @__PURE__ */ Ho(Ft, {
    Fp: Rt,
    endo: Vo
  });
  var Gt = /* @__PURE__ */ qo(Ye, ye);
  var Br = {};
  function Nt(n, ...e) {
    let t = Br[n];
    if (t === void 0) {
      const r = ye(So(n));
      t = ee(r, r), Br[n] = t;
    }
    return ye(ee(t, ...e));
  }
  var Hn = (n) => n.toBytes(true).slice(1);
  var zn = (n) => n % Sn === jo;
  function Kn(n) {
    const { Fn: e, BASE: t } = Ye, r = e.fromBytes(n), i = t.multiply(r);
    return { scalar: zn(i.y) ? r : e.neg(r), bytes: Hn(i) };
  }
  function Oi(n) {
    const e = Rt;
    if (!e.isValidNot0(n))
      throw new Error("invalid x: Fail if x \u2265 p");
    const t = e.create(n * n), r = e.create(t * n + BigInt(7));
    let i = e.sqrt(r);
    zn(i) || (i = e.neg(i));
    const s = Ye.fromAffine({ x: n, y: i });
    return s.assertValidity(), s;
  }
  var ft = bt;
  function Di(...n) {
    return Ye.Fn.create(ft(Nt("BIP0340/challenge", ...n)));
  }
  function Tr(n) {
    return Kn(n).bytes;
  }
  function Jo(n, e, t = We(32)) {
    const { Fn: r } = Ye, i = _(n, void 0, "message"), { bytes: s, scalar: o } = Kn(e), a = _(t, 32, "auxRand"), c = r.toBytes(o ^ ft(Nt("BIP0340/aux", a))), u = Nt("BIP0340/nonce", c, s, i), { bytes: h, scalar: d } = Kn(u), y = Di(h, s, i), f = new Uint8Array(64);
    if (f.set(h, 0), f.set(r.toBytes(r.create(d + y * o)), 32), !Ri(f, i, s))
      throw new Error("sign: Invalid signature produced");
    return f;
  }
  function Ri(n, e, t) {
    const { Fp: r, Fn: i, BASE: s } = Ye, o = _(n, 64, "signature"), a = _(e, void 0, "message"), c = _(t, 32, "publicKey");
    try {
      const u = Oi(ft(c)), h = ft(o.subarray(0, 32));
      if (!r.isValidNot0(h))
        return false;
      const d = ft(o.subarray(32, 64));
      if (!i.isValidNot0(d))
        return false;
      const y = Di(i.toBytes(h), Hn(u), a), f = s.multiplyUnsafe(d).add(u.multiplyUnsafe(i.neg(y))), { x: p, y: w } = f.toAffine();
      return !(f.is0() || !zn(w) || p !== h);
    } catch {
      return false;
    }
  }
  var dt = /* @__PURE__ */ (() => {
    const t = (r = We(48)) => Ki(r, Ft.n);
    return {
      keygen: Pi(t, Tr),
      getPublicKey: Tr,
      sign: Jo,
      verify: Ri,
      Point: Ye,
      utils: {
        randomSecretKey: t,
        taggedHash: Nt,
        lift_x: Oi,
        pointToBytes: Hn
      },
      lengths: {
        secretKey: 32,
        publicKey: 32,
        publicKeyHasPrefix: false,
        signature: 64,
        seed: 48
      }
    };
  })();
  function qn(n) {
    return n instanceof Uint8Array || ArrayBuffer.isView(n) && n.constructor.name === "Uint8Array";
  }
  function Wo(n) {
    if (!qn(n))
      throw new Error("Uint8Array expected");
  }
  function Ni(n, e) {
    return Array.isArray(e) ? e.length === 0 ? true : n ? e.every((t) => typeof t == "string") : e.every((t) => Number.isSafeInteger(t)) : false;
  }
  function Yo(n) {
    if (typeof n != "function")
      throw new Error("function expected");
    return true;
  }
  function Ze(n, e) {
    if (typeof e != "string")
      throw new Error(`${n}: string expected`);
    return true;
  }
  function Vn(n) {
    if (!Number.isSafeInteger(n))
      throw new Error(`invalid integer: ${n}`);
  }
  function kn(n) {
    if (!Array.isArray(n))
      throw new Error("array expected");
  }
  function Bt(n, e) {
    if (!Ni(true, e))
      throw new Error(`${n}: array of strings expected`);
  }
  function Bi(n, e) {
    if (!Ni(false, e))
      throw new Error(`${n}: array of numbers expected`);
  }
  // @__NO_SIDE_EFFECTS__
  function Ti(...n) {
    const e = (s) => s, t = (s, o) => (a) => s(o(a)), r = n.map((s) => s.encode).reduceRight(t, e), i = n.map((s) => s.decode).reduce(t, e);
    return { encode: r, decode: i };
  }
  // @__NO_SIDE_EFFECTS__
  function _i(n) {
    const e = typeof n == "string" ? n.split("") : n, t = e.length;
    Bt("alphabet", e);
    const r = new Map(e.map((i, s) => [i, s]));
    return {
      encode: (i) => (kn(i), i.map((s) => {
        if (!Number.isSafeInteger(s) || s < 0 || s >= t)
          throw new Error(`alphabet.encode: digit index outside alphabet "${s}". Allowed: ${n}`);
        return e[s];
      })),
      decode: (i) => (kn(i), i.map((s) => {
        Ze("alphabet.decode", s);
        const o = r.get(s);
        if (o === void 0)
          throw new Error(`Unknown letter: "${s}". Allowed: ${n}`);
        return o;
      }))
    };
  }
  // @__NO_SIDE_EFFECTS__
  function Li(n = "") {
    return Ze("join", n), {
      encode: (e) => (Bt("join.decode", e), e.join(n)),
      decode: (e) => (Ze("join.decode", e), e.split(n))
    };
  }
  // @__NO_SIDE_EFFECTS__
  function Xo(n, e = "=") {
    return Vn(n), Ze("padding", e), {
      encode(t) {
        for (Bt("padding.encode", t); t.length * n % 8; )
          t.push(e);
        return t;
      },
      decode(t) {
        Bt("padding.decode", t);
        let r = t.length;
        if (r * n % 8)
          throw new Error("padding: invalid, string should have whole number of bytes");
        for (; r > 0 && t[r - 1] === e; r--)
          if ((r - 1) * n % 8 === 0)
            throw new Error("padding: invalid, string has too much padding");
        return t.slice(0, r);
      }
    };
  }
  var Ui = (n, e) => e === 0 ? n : Ui(e, n % e);
  var Tt = /* @__NO_SIDE_EFFECTS__ */ (n, e) => n + (e - Ui(n, e));
  var At = /* @__PURE__ */ (() => {
    let n = [];
    for (let e = 0; e < 40; e++)
      n.push(2 ** e);
    return n;
  })();
  function xn(n, e, t, r) {
    if (kn(n), e <= 0 || e > 32)
      throw new Error(`convertRadix2: wrong from=${e}`);
    if (t <= 0 || t > 32)
      throw new Error(`convertRadix2: wrong to=${t}`);
    if (/* @__PURE__ */ Tt(e, t) > 32)
      throw new Error(`convertRadix2: carry overflow from=${e} to=${t} carryBits=${/* @__PURE__ */ Tt(e, t)}`);
    let i = 0, s = 0;
    const o = At[e], a = At[t] - 1, c = [];
    for (const u of n) {
      if (Vn(u), u >= o)
        throw new Error(`convertRadix2: invalid data word=${u} from=${e}`);
      if (i = i << e | u, s + e > 32)
        throw new Error(`convertRadix2: carry overflow pos=${s} from=${e}`);
      for (s += e; s >= t; s -= t)
        c.push((i >> s - t & a) >>> 0);
      const h = At[s];
      if (h === void 0)
        throw new Error("invalid carry");
      i &= h - 1;
    }
    if (i = i << t - s & a, !r && s >= e)
      throw new Error("Excess padding");
    if (!r && i > 0)
      throw new Error(`Non-zero padding: ${i}`);
    return r && s > 0 && c.push(i >>> 0), c;
  }
  // @__NO_SIDE_EFFECTS__
  function $i(n, e = false) {
    if (Vn(n), n <= 0 || n > 32)
      throw new Error("radix2: bits should be in (0..32]");
    if (/* @__PURE__ */ Tt(8, n) > 32 || /* @__PURE__ */ Tt(n, 8) > 32)
      throw new Error("radix2: carry overflow");
    return {
      encode: (t) => {
        if (!qn(t))
          throw new Error("radix2.encode input should be Uint8Array");
        return xn(Array.from(t), 8, n, !e);
      },
      decode: (t) => (Bi("radix2.decode", t), Uint8Array.from(xn(t, n, 8, e)))
    };
  }
  function _r(n) {
    return Yo(n), function(...e) {
      try {
        return n.apply(null, e);
      } catch {
      }
    };
  }
  var Qo = typeof Uint8Array.from([]).toBase64 == "function" && typeof Uint8Array.fromBase64 == "function";
  var ea = (n, e) => {
    Ze("base64", n);
    const t = /^[A-Za-z0-9=+/]+$/, r = "base64";
    if (n.length > 0 && !t.test(n))
      throw new Error("invalid base64");
    return Uint8Array.fromBase64(n, { alphabet: r, lastChunkHandling: "strict" });
  };
  var xe = Qo ? {
    encode(n) {
      return Wo(n), n.toBase64();
    },
    decode(n) {
      return ea(n);
    }
  } : /* @__PURE__ */ Ti(/* @__PURE__ */ $i(6), /* @__PURE__ */ _i("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"), /* @__PURE__ */ Xo(6), /* @__PURE__ */ Li(""));
  var Pn = /* @__PURE__ */ Ti(/* @__PURE__ */ _i("qpzry9x8gf2tvdw0s3jn54khce6mua7l"), /* @__PURE__ */ Li(""));
  var Lr = [996825010, 642813549, 513874426, 1027748829, 705979059];
  function lt(n) {
    const e = n >> 25;
    let t = (n & 33554431) << 5;
    for (let r = 0; r < Lr.length; r++)
      (e >> r & 1) === 1 && (t ^= Lr[r]);
    return t;
  }
  function Ur(n, e, t = 1) {
    const r = n.length;
    let i = 1;
    for (let s = 0; s < r; s++) {
      const o = n.charCodeAt(s);
      if (o < 33 || o > 126)
        throw new Error(`Invalid prefix (${n})`);
      i = lt(i) ^ o >> 5;
    }
    i = lt(i);
    for (let s = 0; s < r; s++)
      i = lt(i) ^ n.charCodeAt(s) & 31;
    for (let s of e)
      i = lt(i) ^ s;
    for (let s = 0; s < 6; s++)
      i = lt(i);
    return i ^= t, Pn.encode(xn([i % At[30]], 30, 5, false));
  }
  // @__NO_SIDE_EFFECTS__
  function ta(n) {
    const e = n === "bech32" ? 1 : 734539939, t = /* @__PURE__ */ $i(5), r = t.decode, i = t.encode, s = _r(r);
    function o(d, y, f = 90) {
      Ze("bech32.encode prefix", d), qn(y) && (y = Array.from(y)), Bi("bech32.encode", y);
      const p = d.length;
      if (p === 0)
        throw new TypeError(`Invalid prefix length ${p}`);
      const w = p + 7 + y.length;
      if (f !== false && w > f)
        throw new TypeError(`Length ${w} exceeds limit ${f}`);
      const b = d.toLowerCase(), m = Ur(b, y, e);
      return `${b}1${Pn.encode(y)}${m}`;
    }
    function a(d, y = 90) {
      Ze("bech32.decode input", d);
      const f = d.length;
      if (f < 8 || y !== false && f > y)
        throw new TypeError(`invalid string length: ${f} (${d}). Expected (8..${y})`);
      const p = d.toLowerCase();
      if (d !== p && d !== d.toUpperCase())
        throw new Error("String must be lowercase or uppercase");
      const w = p.lastIndexOf("1");
      if (w === 0 || w === -1)
        throw new Error('Letter "1" must be present between prefix and data only');
      const b = p.slice(0, w), m = p.slice(w + 1);
      if (m.length < 6)
        throw new Error("Data must be at least 6 characters long");
      const P = Pn.decode(m).slice(0, -6), N = Ur(b, P, e);
      if (!m.endsWith(N))
        throw new Error(`Invalid checksum in ${d}: expected "${N}"`);
      return { prefix: b, words: P };
    }
    const c = _r(a);
    function u(d) {
      const { prefix: y, words: f } = a(d, false);
      return { prefix: y, words: f, bytes: r(f) };
    }
    function h(d, y) {
      return o(d, i(y));
    }
    return {
      encode: o,
      decode: a,
      encodeFromBytes: h,
      decodeToBytes: u,
      decodeUnsafe: c,
      fromWords: r,
      fromWordsUnsafe: s,
      toWords: i
    };
  }
  var st = /* @__PURE__ */ ta("bech32");
  function na(n) {
    return n instanceof Uint8Array || ArrayBuffer.isView(n) && n.constructor.name === "Uint8Array";
  }
  function $r(n) {
    if (typeof n != "boolean")
      throw new Error(`boolean expected, not ${n}`);
  }
  function an(n) {
    if (!Number.isSafeInteger(n) || n < 0)
      throw new Error("positive integer expected, got " + n);
  }
  function ce(n, e, t = "") {
    const r = na(n), i = n == null ? void 0 : n.length, s = e !== void 0;
    if (!r || s && i !== e) {
      const o = t && `"${t}" `, a = s ? ` of length ${e}` : "", c = r ? `length=${i}` : `type=${typeof n}`;
      throw new Error(o + "expected Uint8Array" + a + ", got " + c);
    }
    return n;
  }
  function te(n) {
    return new Uint32Array(n.buffer, n.byteOffset, Math.floor(n.byteLength / 4));
  }
  function ot(...n) {
    for (let e = 0; e < n.length; e++)
      n[e].fill(0);
  }
  var ra = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68;
  function ia(n, e) {
    return n.buffer === e.buffer && // best we can do, may fail with an obscure Proxy
    n.byteOffset < e.byteOffset + e.byteLength && // a starts before b end
    e.byteOffset < n.byteOffset + n.byteLength;
  }
  function Fi(n, e) {
    if (ia(n, e) && n.byteOffset < e.byteOffset)
      throw new Error("complex overlap of input and output is not supported");
  }
  function sa(n, e) {
    if (e == null || typeof e != "object")
      throw new Error("options must be defined");
    return Object.assign(n, e);
  }
  function Gi(n, e) {
    if (n.length !== e.length)
      return false;
    let t = 0;
    for (let r = 0; r < n.length; r++)
      t |= n[r] ^ e[r];
    return t === 0;
  }
  var oa = /* @__NO_SIDE_EFFECTS__ */ (n, e) => {
    function t(r, ...i) {
      if (ce(r, void 0, "key"), !ra)
        throw new Error("Non little-endian hardware is not yet supported");
      if (n.nonceLength !== void 0) {
        const h = i[0];
        ce(h, n.varSizeNonce ? void 0 : n.nonceLength, "nonce");
      }
      const s = n.tagLength;
      s && i[1] !== void 0 && ce(i[1], void 0, "AAD");
      const o = e(r, ...i), a = (h, d) => {
        if (d !== void 0) {
          if (h !== 2)
            throw new Error("cipher output not supported");
          ce(d, void 0, "output");
        }
      };
      let c = false;
      return {
        encrypt(h, d) {
          if (c)
            throw new Error("cannot encrypt() twice with same key + nonce");
          return c = true, ce(h), a(o.encrypt.length, d), o.encrypt(h, d);
        },
        decrypt(h, d) {
          if (ce(h), s && h.length < s)
            throw new Error('"ciphertext" expected length bigger than tagLength=' + s);
          return a(o.decrypt.length, d), o.decrypt(h, d);
        }
      };
    }
    return Object.assign(t, n), t;
  };
  function Hi(n, e, t = true) {
    if (e === void 0)
      return new Uint8Array(n);
    if (e.length !== n)
      throw new Error('"output" expected Uint8Array of length ' + n + ", got: " + e.length);
    if (t && !nt(e))
      throw new Error("invalid output, must be aligned");
    return e;
  }
  function nt(n) {
    return n.byteOffset % 4 === 0;
  }
  function je(n) {
    return Uint8Array.from(n);
  }
  var Le = 16;
  var aa = 283;
  function ca(n) {
    if (![16, 24, 32].includes(n.length))
      throw new Error('"aes key" expected Uint8Array of length 16/24/32, got length=' + n.length);
  }
  function jn(n) {
    return n << 1 ^ aa & -(n >> 7);
  }
  function et(n, e) {
    let t = 0;
    for (; e > 0; e >>= 1)
      t ^= n & -(e & 1), n = jn(n);
    return t;
  }
  var An = /* @__PURE__ */ (() => {
    const n = new Uint8Array(256);
    for (let t = 0, r = 1; t < 256; t++, r ^= jn(r))
      n[t] = r;
    const e = new Uint8Array(256);
    e[0] = 99;
    for (let t = 0; t < 255; t++) {
      let r = n[255 - t];
      r |= r << 8, e[n[t]] = (r ^ r >> 4 ^ r >> 5 ^ r >> 6 ^ r >> 7 ^ 99) & 255;
    }
    return ot(n), e;
  })();
  var ua = /* @__PURE__ */ An.map((n, e) => An.indexOf(e));
  var ha = (n) => n << 24 | n >>> 8;
  var cn = (n) => n << 8 | n >>> 24;
  function zi(n, e) {
    if (n.length !== 256)
      throw new Error("Wrong sbox length");
    const t = new Uint32Array(256).map((u, h) => e(n[h])), r = t.map(cn), i = r.map(cn), s = i.map(cn), o = new Uint32Array(256 * 256), a = new Uint32Array(256 * 256), c = new Uint16Array(256 * 256);
    for (let u = 0; u < 256; u++)
      for (let h = 0; h < 256; h++) {
        const d = u * 256 + h;
        o[d] = t[u] ^ r[h], a[d] = i[u] ^ s[h], c[d] = n[u] << 8 | n[h];
      }
    return { sbox: n, sbox2: c, T0: t, T1: r, T2: i, T3: s, T01: o, T23: a };
  }
  var Zn = /* @__PURE__ */ zi(An, (n) => et(n, 3) << 24 | n << 16 | n << 8 | et(n, 2));
  var qi = /* @__PURE__ */ zi(ua, (n) => et(n, 11) << 24 | et(n, 13) << 16 | et(n, 9) << 8 | et(n, 14));
  var da = /* @__PURE__ */ (() => {
    const n = new Uint8Array(16);
    for (let e = 0, t = 1; e < 16; e++, t = jn(t))
      n[e] = t;
    return n;
  })();
  function Vi(n) {
    ce(n);
    const e = n.length;
    ca(n);
    const { sbox2: t } = Zn, r = [];
    nt(n) || r.push(n = je(n));
    const i = te(n), s = i.length, o = (c) => Ke(t, c, c, c, c), a = new Uint32Array(e + 28);
    a.set(i);
    for (let c = s; c < a.length; c++) {
      let u = a[c - 1];
      c % s === 0 ? u = o(ha(u)) ^ da[c / s - 1] : s > 6 && c % s === 4 && (u = o(u)), a[c] = a[c - s] ^ u;
    }
    return ot(...r), a;
  }
  function la(n) {
    const e = Vi(n), t = e.slice(), r = e.length, { sbox2: i } = Zn, { T0: s, T1: o, T2: a, T3: c } = qi;
    for (let u = 0; u < r; u += 4)
      for (let h = 0; h < 4; h++)
        t[u + h] = e[r - u - 4 + h];
    ot(e);
    for (let u = 4; u < r - 4; u++) {
      const h = t[u], d = Ke(i, h, h, h, h);
      t[u] = s[d & 255] ^ o[d >>> 8 & 255] ^ a[d >>> 16 & 255] ^ c[d >>> 24];
    }
    return t;
  }
  function _e(n, e, t, r, i, s) {
    return n[t << 8 & 65280 | r >>> 8 & 255] ^ e[i >>> 8 & 65280 | s >>> 24 & 255];
  }
  function Ke(n, e, t, r, i) {
    return n[e & 255 | t & 65280] | n[r >>> 16 & 255 | i >>> 16 & 65280] << 16;
  }
  function Fr(n, e, t, r, i) {
    const { sbox2: s, T01: o, T23: a } = Zn;
    let c = 0;
    e ^= n[c++], t ^= n[c++], r ^= n[c++], i ^= n[c++];
    const u = n.length / 4 - 2;
    for (let p = 0; p < u; p++) {
      const w = n[c++] ^ _e(o, a, e, t, r, i), b = n[c++] ^ _e(o, a, t, r, i, e), m = n[c++] ^ _e(o, a, r, i, e, t), P = n[c++] ^ _e(o, a, i, e, t, r);
      e = w, t = b, r = m, i = P;
    }
    const h = n[c++] ^ Ke(s, e, t, r, i), d = n[c++] ^ Ke(s, t, r, i, e), y = n[c++] ^ Ke(s, r, i, e, t), f = n[c++] ^ Ke(s, i, e, t, r);
    return { s0: h, s1: d, s2: y, s3: f };
  }
  function fa(n, e, t, r, i) {
    const { sbox2: s, T01: o, T23: a } = qi;
    let c = 0;
    e ^= n[c++], t ^= n[c++], r ^= n[c++], i ^= n[c++];
    const u = n.length / 4 - 2;
    for (let p = 0; p < u; p++) {
      const w = n[c++] ^ _e(o, a, e, i, r, t), b = n[c++] ^ _e(o, a, t, e, i, r), m = n[c++] ^ _e(o, a, r, t, e, i), P = n[c++] ^ _e(o, a, i, r, t, e);
      e = w, t = b, r = m, i = P;
    }
    const h = n[c++] ^ Ke(s, e, i, r, t), d = n[c++] ^ Ke(s, t, e, i, r), y = n[c++] ^ Ke(s, r, t, e, i), f = n[c++] ^ Ke(s, i, r, t, e);
    return { s0: h, s1: d, s2: y, s3: f };
  }
  function ya(n) {
    if (ce(n), n.length % Le !== 0)
      throw new Error("aes-(cbc/ecb).decrypt ciphertext should consist of blocks with size " + Le);
  }
  function pa(n, e, t) {
    ce(n);
    let r = n.length;
    const i = r % Le;
    if (!e && i !== 0)
      throw new Error("aec/(cbc-ecb): unpadded plaintext with disabled padding");
    nt(n) || (n = je(n));
    const s = te(n);
    if (e) {
      let a = Le - i;
      a || (a = Le), r = r + a;
    }
    t = Hi(r, t), Fi(n, t);
    const o = te(t);
    return { b: s, o, out: t };
  }
  function ga(n, e) {
    if (!e)
      return n;
    const t = n.length;
    if (!t)
      throw new Error("aes/pcks5: empty ciphertext not allowed");
    const r = n[t - 1];
    if (r <= 0 || r > 16)
      throw new Error("aes/pcks5: wrong padding");
    const i = n.subarray(0, -r);
    for (let s = 0; s < r; s++)
      if (n[t - s - 1] !== r)
        throw new Error("aes/pcks5: wrong padding");
    return i;
  }
  function va(n) {
    const e = new Uint8Array(16), t = te(e);
    e.set(n);
    const r = Le - n.length;
    for (let i = Le - r; i < Le; i++)
      e[i] = r;
    return t;
  }
  var ji = /* @__PURE__ */ oa({ blockSize: 16, nonceLength: 16 }, function(e, t, r = {}) {
    const i = !r.disablePadding;
    return {
      encrypt(s, o) {
        const a = Vi(e), { b: c, o: u, out: h } = pa(s, i, o);
        let d = t;
        const y = [a];
        nt(d) || y.push(d = je(d));
        const f = te(d);
        let p = f[0], w = f[1], b = f[2], m = f[3], P = 0;
        for (; P + 4 <= c.length; )
          p ^= c[P + 0], w ^= c[P + 1], b ^= c[P + 2], m ^= c[P + 3], { s0: p, s1: w, s2: b, s3: m } = Fr(a, p, w, b, m), u[P++] = p, u[P++] = w, u[P++] = b, u[P++] = m;
        if (i) {
          const N = va(s.subarray(P * 4));
          p ^= N[0], w ^= N[1], b ^= N[2], m ^= N[3], { s0: p, s1: w, s2: b, s3: m } = Fr(a, p, w, b, m), u[P++] = p, u[P++] = w, u[P++] = b, u[P++] = m;
        }
        return ot(...y), h;
      },
      decrypt(s, o) {
        ya(s);
        const a = la(e);
        let c = t;
        const u = [a];
        nt(c) || u.push(c = je(c));
        const h = te(c);
        o = Hi(s.length, o), nt(s) || u.push(s = je(s)), Fi(s, o);
        const d = te(s), y = te(o);
        let f = h[0], p = h[1], w = h[2], b = h[3];
        for (let m = 0; m + 4 <= d.length; ) {
          const P = f, N = p, O = w, X = b;
          f = d[m + 0], p = d[m + 1], w = d[m + 2], b = d[m + 3];
          const { s0: U, s1: Z, s2: q, s3: T } = fa(a, f, p, w, b);
          y[m++] = U ^ P, y[m++] = Z ^ N, y[m++] = q ^ O, y[m++] = T ^ X;
        }
        return ot(...u), ga(o, i);
      }
    };
  });
  var Zi = (n) => Uint8Array.from(n.split(""), (e) => e.charCodeAt(0));
  var wa = Zi("expand 16-byte k");
  var ba = Zi("expand 32-byte k");
  var ma = te(wa);
  var Ea = te(ba);
  function B(n, e) {
    return n << e | n >>> 32 - e;
  }
  function In(n) {
    return n.byteOffset % 4 === 0;
  }
  var St = 64;
  var Sa = 16;
  var Ji = 2 ** 32 - 1;
  var Gr = Uint32Array.of();
  function Ka(n, e, t, r, i, s, o, a) {
    const c = i.length, u = new Uint8Array(St), h = te(u), d = In(i) && In(s), y = d ? te(i) : Gr, f = d ? te(s) : Gr;
    for (let p = 0; p < c; o++) {
      if (n(e, t, r, h, o, a), o >= Ji)
        throw new Error("arx: counter overflow");
      const w = Math.min(St, c - p);
      if (d && w === St) {
        const b = p / 4;
        if (p % 4 !== 0)
          throw new Error("arx: invalid block position");
        for (let m = 0, P; m < Sa; m++)
          P = b + m, f[P] = y[P] ^ h[m];
        p += St;
        continue;
      }
      for (let b = 0, m; b < w; b++)
        m = p + b, s[m] = i[m] ^ u[b];
      p += w;
    }
  }
  function ka(n, e) {
    const { allowShortKeys: t, extendNonceFn: r, counterLength: i, counterRight: s, rounds: o } = sa({ allowShortKeys: false, counterLength: 8, counterRight: false, rounds: 20 }, e);
    if (typeof n != "function")
      throw new Error("core must be a function");
    return an(i), an(o), $r(s), $r(t), (a, c, u, h, d = 0) => {
      ce(a, void 0, "key"), ce(c, void 0, "nonce"), ce(u, void 0, "data");
      const y = u.length;
      if (h === void 0 && (h = new Uint8Array(y)), ce(h, void 0, "output"), an(d), d < 0 || d >= Ji)
        throw new Error("arx: counter overflow");
      if (h.length < y)
        throw new Error(`arx: output (${h.length}) is shorter than data (${y})`);
      const f = [];
      let p = a.length, w, b;
      if (p === 32)
        f.push(w = je(a)), b = Ea;
      else if (p === 16 && t)
        w = new Uint8Array(32), w.set(a), w.set(a, 16), b = ma, f.push(w);
      else
        throw ce(a, 32, "arx key"), new Error("invalid key size");
      In(c) || f.push(c = je(c));
      const m = te(w);
      if (r) {
        if (c.length !== 24)
          throw new Error("arx: extended nonce must be 24 bytes");
        r(b, m, te(c.subarray(0, 16)), m), c = c.subarray(16);
      }
      const P = 16 - i;
      if (P !== c.length)
        throw new Error(`arx: nonce must be ${P} or 16 bytes`);
      if (P !== 12) {
        const O = new Uint8Array(12);
        O.set(c, s ? 0 : 12 - c.length), c = O, f.push(c);
      }
      const N = te(c);
      return Ka(n, b, m, N, u, h, d, o), ot(...f), h;
    };
  }
  function xa(n, e, t, r, i, s = 20) {
    let o = n[0], a = n[1], c = n[2], u = n[3], h = e[0], d = e[1], y = e[2], f = e[3], p = e[4], w = e[5], b = e[6], m = e[7], P = i, N = t[0], O = t[1], X = t[2], U = o, Z = a, q = c, T = u, W = h, V = d, C = y, M = f, v = p, g = w, E = b, K = m, A = P, k = N, I = O, S = X;
    for (let D = 0; D < s; D += 2)
      U = U + W | 0, A = B(A ^ U, 16), v = v + A | 0, W = B(W ^ v, 12), U = U + W | 0, A = B(A ^ U, 8), v = v + A | 0, W = B(W ^ v, 7), Z = Z + V | 0, k = B(k ^ Z, 16), g = g + k | 0, V = B(V ^ g, 12), Z = Z + V | 0, k = B(k ^ Z, 8), g = g + k | 0, V = B(V ^ g, 7), q = q + C | 0, I = B(I ^ q, 16), E = E + I | 0, C = B(C ^ E, 12), q = q + C | 0, I = B(I ^ q, 8), E = E + I | 0, C = B(C ^ E, 7), T = T + M | 0, S = B(S ^ T, 16), K = K + S | 0, M = B(M ^ K, 12), T = T + M | 0, S = B(S ^ T, 8), K = K + S | 0, M = B(M ^ K, 7), U = U + V | 0, S = B(S ^ U, 16), E = E + S | 0, V = B(V ^ E, 12), U = U + V | 0, S = B(S ^ U, 8), E = E + S | 0, V = B(V ^ E, 7), Z = Z + C | 0, A = B(A ^ Z, 16), K = K + A | 0, C = B(C ^ K, 12), Z = Z + C | 0, A = B(A ^ Z, 8), K = K + A | 0, C = B(C ^ K, 7), q = q + M | 0, k = B(k ^ q, 16), v = v + k | 0, M = B(M ^ v, 12), q = q + M | 0, k = B(k ^ q, 8), v = v + k | 0, M = B(M ^ v, 7), T = T + W | 0, I = B(I ^ T, 16), g = g + I | 0, W = B(W ^ g, 12), T = T + W | 0, I = B(I ^ T, 8), g = g + I | 0, W = B(W ^ g, 7);
    let x = 0;
    r[x++] = o + U | 0, r[x++] = a + Z | 0, r[x++] = c + q | 0, r[x++] = u + T | 0, r[x++] = h + W | 0, r[x++] = d + V | 0, r[x++] = y + C | 0, r[x++] = f + M | 0, r[x++] = p + v | 0, r[x++] = w + g | 0, r[x++] = b + E | 0, r[x++] = m + K | 0, r[x++] = P + A | 0, r[x++] = N + k | 0, r[x++] = O + I | 0, r[x++] = X + S | 0;
  }
  var Ht = /* @__PURE__ */ ka(xa, {
    counterRight: false,
    counterLength: 4,
    allowShortKeys: false
  });
  function Wi(n, e, t) {
    return Ut(n), t === void 0 && (t = new Uint8Array(n.outputLen)), ct(n, t, e);
  }
  var un = /* @__PURE__ */ Uint8Array.of(0);
  var Hr = /* @__PURE__ */ Uint8Array.of();
  function Yi(n, e, t, r = 32) {
    Ut(n), Ue(r, "length");
    const i = n.outputLen;
    if (r > 255 * i)
      throw new Error("Length must be <= 255*HashLen");
    const s = Math.ceil(r / i);
    t === void 0 ? t = Hr : _(t, void 0, "info");
    const o = new Uint8Array(s * i), a = ct.create(n, e), c = a._cloneInto(), u = new Uint8Array(a.outputLen);
    for (let h = 0; h < s; h++)
      un[0] = h + 1, c.update(h === 0 ? Hr : u).update(t).update(un).digestInto(u), o.set(u, i * h), a._cloneInto(c);
    return a.destroy(), c.destroy(), pt(u, un), o.slice(0, r);
  }
  var Pa = Object.defineProperty;
  var L = (n, e) => {
    for (var t in e)
      Pa(n, t, { get: e[t], enumerable: true });
  };
  var Qe = /* @__PURE__ */ Symbol("verified");
  var Aa = (n) => n instanceof Object;
  function zt(n) {
    if (!Aa(n) || typeof n.kind != "number" || typeof n.content != "string" || typeof n.created_at != "number" || typeof n.pubkey != "string" || !n.pubkey.match(/^[a-f0-9]{64}$/) || !Array.isArray(n.tags))
      return false;
    for (let e = 0; e < n.tags.length; e++) {
      let t = n.tags[e];
      if (!Array.isArray(t))
        return false;
      for (let r = 0; r < t.length; r++)
        if (typeof t[r] != "string")
          return false;
    }
    return true;
  }
  var Ia = {};
  L(Ia, {
    binarySearch: () => Jn,
    bytesToHex: () => F,
    hexToBytes: () => H,
    insertEventIntoAscendingList: () => Oa,
    insertEventIntoDescendingList: () => Ca,
    mergeReverseSortedLists: () => Da,
    normalizeURL: () => Ma,
    utf8Decoder: () => Ce,
    utf8Encoder: () => ve
  });
  var Ce = new TextDecoder("utf-8");
  var ve = new TextEncoder();
  function Ma(n) {
    try {
      n.indexOf("://") === -1 && (n = "wss://" + n);
      let e = new URL(n);
      return e.protocol === "http:" ? e.protocol = "ws:" : e.protocol === "https:" && (e.protocol = "wss:"), e.pathname = e.pathname.replace(/\/+/g, "/"), e.pathname.endsWith("/") && (e.pathname = e.pathname.slice(0, -1)), (e.port === "80" && e.protocol === "ws:" || e.port === "443" && e.protocol === "wss:") && (e.port = ""), e.searchParams.sort(), e.hash = "", e.toString();
    } catch {
      throw new Error(`Invalid URL: ${n}`);
    }
  }
  function Ca(n, e) {
    const [t, r] = Jn(n, (i) => e.id === i.id ? 0 : e.created_at === i.created_at ? -1 : i.created_at - e.created_at);
    return r || n.splice(t, 0, e), n;
  }
  function Oa(n, e) {
    const [t, r] = Jn(n, (i) => e.id === i.id ? 0 : e.created_at === i.created_at ? -1 : e.created_at - i.created_at);
    return r || n.splice(t, 0, e), n;
  }
  function Jn(n, e) {
    let t = 0, r = n.length - 1;
    for (; t <= r; ) {
      const i = Math.floor((t + r) / 2), s = e(n[i]);
      if (s === 0)
        return [i, true];
      s < 0 ? r = i - 1 : t = i + 1;
    }
    return [t, false];
  }
  function Da(n, e) {
    var o, a;
    const t = new Array(n.length + e.length);
    t.length = 0;
    let r = 0, i = 0, s = [];
    for (; r < n.length && i < e.length; ) {
      let c;
      if (((o = n[r]) == null ? void 0 : o.created_at) > ((a = e[i]) == null ? void 0 : a.created_at) ? (c = n[r], r++) : (c = e[i], i++), t.length > 0 && t[t.length - 1].created_at === c.created_at) {
        if (s.includes(c.id))
          continue;
      } else
        s.length = 0;
      t.push(c), s.push(c.id);
    }
    for (; r < n.length; ) {
      const c = n[r];
      if (r++, t.length > 0 && t[t.length - 1].created_at === c.created_at) {
        if (s.includes(c.id))
          continue;
      } else
        s.length = 0;
      t.push(c), s.push(c.id);
    }
    for (; i < e.length; ) {
      const c = e[i];
      if (i++, t.length > 0 && t[t.length - 1].created_at === c.created_at) {
        if (s.includes(c.id))
          continue;
      } else
        s.length = 0;
      t.push(c), s.push(c.id);
    }
    return t;
  }
  var Ra = class {
    generateSecretKey() {
      return dt.utils.randomSecretKey();
    }
    getPublicKey(n) {
      return F(dt.getPublicKey(n));
    }
    finalizeEvent(n, e) {
      const t = n;
      return t.pubkey = F(dt.getPublicKey(e)), t.id = ge(t), t.sig = F(dt.sign(H(ge(t)), e)), t[Qe] = true, t;
    }
    verifyEvent(n) {
      if (typeof n[Qe] == "boolean")
        return n[Qe];
      const e = ge(n);
      if (e !== n.id)
        return n[Qe] = false, false;
      try {
        const t = dt.verify(H(n.sig), H(e), H(n.pubkey));
        return n[Qe] = t, t;
      } catch {
        return n[Qe] = false, false;
      }
    }
  };
  function Na(n) {
    if (!zt(n))
      throw new Error("can't serialize event with wrong or missing properties");
    return JSON.stringify([0, n.pubkey, n.created_at, n.kind, n.tags, n.content]);
  }
  function ge(n) {
    let e = ye(ve.encode(Na(n)));
    return F(e);
  }
  var qt = new Ra();
  var me = qt.generateSecretKey;
  var ie = qt.getPublicKey;
  var oe = qt.finalizeEvent;
  var ut = qt.verifyEvent;
  var Ba = {};
  L(Ba, {
    Application: () => jc,
    BadgeAward: () => Ha,
    BadgeDefinition: () => $c,
    BlockedRelaysList: () => Sc,
    BlossomServerList: () => Mc,
    BookmarkList: () => bc,
    Bookmarksets: () => _c,
    Calendar: () => eu,
    CalendarEventRSVP: () => tu,
    ChannelCreation: () => rs,
    ChannelHideMessage: () => os,
    ChannelMessage: () => ss,
    ChannelMetadata: () => is,
    ChannelMuteUser: () => as,
    ChatMessage: () => za,
    ClassifiedListing: () => Wc,
    ClientAuth: () => us,
    Comment: () => Qa,
    CommunitiesList: () => mc,
    CommunityDefinition: () => su,
    CommunityPostApproval: () => ac,
    Contacts: () => $a,
    CreateOrUpdateProduct: () => Hc,
    CreateOrUpdateStall: () => Gc,
    Curationsets: () => Lc,
    Date: () => Xc,
    DirectMessageRelaysList: () => Ac,
    DraftClassifiedListing: () => Yc,
    DraftLong: () => qc,
    Emojisets: () => Vc,
    EncryptedDirectMessage: () => Fa,
    EventDeletion: () => Ga,
    FavoriteRelays: () => kc,
    FileMessage: () => Va,
    FileMetadata: () => Xa,
    FileServerPreference: () => Ic,
    Followsets: () => Nc,
    ForumThread: () => qa,
    GenericRepost: () => er,
    Genericlists: () => Bc,
    GiftWrap: () => cs,
    GroupMetadata: () => ou,
    HTTPAuth: () => tr,
    Handlerinformation: () => iu,
    Handlerrecommendation: () => ru,
    Highlights: () => yc,
    InterestsList: () => xc,
    Interestsets: () => Fc,
    JobFeedback: () => hc,
    JobRequest: () => cc,
    JobResult: () => uc,
    Label: () => oc,
    LightningPubRPC: () => Oc,
    LiveChatMessage: () => ec,
    LiveEvent: () => Zc,
    LongFormArticle: () => zc,
    Metadata: () => La,
    Mutelist: () => gc,
    NWCWalletInfo: () => Cc,
    NWCWalletRequest: () => hs,
    NWCWalletResponse: () => Dc,
    NormalVideo: () => Za,
    NostrConnect: () => Rc,
    OpenTimestamps: () => Wa,
    Photo: () => ja,
    Pinlist: () => vc,
    Poll: () => Ya,
    PollResponse: () => pc,
    PrivateDirectMessage: () => ns,
    ProblemTracker: () => rc,
    ProfileBadges: () => Uc,
    PublicChatsList: () => Ec,
    Reaction: () => Qn,
    RecommendRelay: () => Ua,
    RelayList: () => wc,
    RelayReview: () => nu,
    Relaysets: () => Tc,
    Report: () => ic,
    Reporting: () => sc,
    Repost: () => Xn,
    Seal: () => ts,
    SearchRelaysList: () => Kc,
    ShortTextNote: () => es,
    ShortVideo: () => Ja,
    Time: () => Qc,
    UserEmojiList: () => Pc,
    UserStatuses: () => Jc,
    Voice: () => tc,
    VoiceComment: () => nc,
    Zap: () => fc,
    ZapGoal: () => dc,
    ZapRequest: () => lc,
    classifyKind: () => Ta,
    isAddressableKind: () => Yn,
    isEphemeralKind: () => Qi,
    isKind: () => _a,
    isRegularKind: () => Xi,
    isReplaceableKind: () => Wn
  });
  function Xi(n) {
    return n < 1e4 && n !== 0 && n !== 3;
  }
  function Wn(n) {
    return n === 0 || n === 3 || 1e4 <= n && n < 2e4;
  }
  function Qi(n) {
    return 2e4 <= n && n < 3e4;
  }
  function Yn(n) {
    return 3e4 <= n && n < 4e4;
  }
  function Ta(n) {
    return Xi(n) ? "regular" : Wn(n) ? "replaceable" : Qi(n) ? "ephemeral" : Yn(n) ? "parameterized" : "unknown";
  }
  function _a(n, e) {
    const t = e instanceof Array ? e : [e];
    return zt(n) && t.includes(n.kind) || false;
  }
  var La = 0;
  var es = 1;
  var Ua = 2;
  var $a = 3;
  var Fa = 4;
  var Ga = 5;
  var Xn = 6;
  var Qn = 7;
  var Ha = 8;
  var za = 9;
  var qa = 11;
  var ts = 13;
  var ns = 14;
  var Va = 15;
  var er = 16;
  var ja = 20;
  var Za = 21;
  var Ja = 22;
  var rs = 40;
  var is = 41;
  var ss = 42;
  var os = 43;
  var as = 44;
  var Wa = 1040;
  var cs = 1059;
  var Ya = 1068;
  var Xa = 1063;
  var Qa = 1111;
  var ec = 1311;
  var tc = 1222;
  var nc = 1244;
  var rc = 1971;
  var ic = 1984;
  var sc = 1984;
  var oc = 1985;
  var ac = 4550;
  var cc = 5999;
  var uc = 6999;
  var hc = 7e3;
  var dc = 9041;
  var lc = 9734;
  var fc = 9735;
  var yc = 9802;
  var pc = 1018;
  var gc = 1e4;
  var vc = 10001;
  var wc = 10002;
  var bc = 10003;
  var mc = 10004;
  var Ec = 10005;
  var Sc = 10006;
  var Kc = 10007;
  var kc = 10012;
  var xc = 10015;
  var Pc = 10030;
  var Ac = 10050;
  var Ic = 10096;
  var Mc = 10063;
  var Cc = 13194;
  var Oc = 21e3;
  var us = 22242;
  var hs = 23194;
  var Dc = 23195;
  var Rc = 24133;
  var tr = 27235;
  var Nc = 3e4;
  var Bc = 30001;
  var Tc = 30002;
  var _c = 30003;
  var Lc = 30004;
  var Uc = 30008;
  var $c = 30009;
  var Fc = 30015;
  var Gc = 30017;
  var Hc = 30018;
  var zc = 30023;
  var qc = 30024;
  var Vc = 30030;
  var jc = 30078;
  var Zc = 30311;
  var Jc = 30315;
  var Wc = 30402;
  var Yc = 30403;
  var Xc = 31922;
  var Qc = 31923;
  var eu = 31924;
  var tu = 31925;
  var nu = 31987;
  var ru = 31989;
  var iu = 31990;
  var su = 34550;
  var ou = 39e3;
  var au = {};
  L(au, {
    getHex64: () => nr,
    getInt: () => ds,
    getSubscriptionId: () => cu,
    matchEventId: () => uu,
    matchEventKind: () => du,
    matchEventPubkey: () => hu
  });
  function nr(n, e) {
    let t = e.length + 3, r = n.indexOf(`"${e}":`) + t, i = n.slice(r).indexOf('"') + r + 1;
    return n.slice(i, i + 64);
  }
  function ds(n, e) {
    let t = e.length, r = n.indexOf(`"${e}":`) + t + 3, i = n.slice(r), s = Math.min(i.indexOf(","), i.indexOf("}"));
    return parseInt(i.slice(0, s), 10);
  }
  function cu(n) {
    let e = n.slice(0, 22).indexOf('"EVENT"');
    if (e === -1)
      return null;
    let t = n.slice(e + 7 + 1).indexOf('"');
    if (t === -1)
      return null;
    let r = e + 7 + 1 + t, i = n.slice(r + 1, 80).indexOf('"');
    if (i === -1)
      return null;
    let s = r + 1 + i;
    return n.slice(r + 1, s);
  }
  function uu(n, e) {
    return e === nr(n, "id");
  }
  function hu(n, e) {
    return e === nr(n, "pubkey");
  }
  function du(n, e) {
    return e === ds(n, "kind");
  }
  var lu = {};
  L(lu, {
    makeAuthEvent: () => fu
  });
  function fu(n, e) {
    return {
      kind: us,
      created_at: Math.floor(Date.now() / 1e3),
      tags: [
        ["relay", n],
        ["challenge", e]
      ],
      content: ""
    };
  }
  var yu;
  try {
    yu = WebSocket;
  } catch {
  }
  var pu;
  try {
    pu = WebSocket;
  } catch {
  }
  var gu = {};
  L(gu, {
    BECH32_REGEX: () => ls,
    Bech32MaxSize: () => rr,
    NostrTypeGuard: () => vu,
    decode: () => Vt,
    decodeNostrURI: () => bu,
    encodeBytes: () => Zt,
    naddrEncode: () => xu,
    neventEncode: () => ku,
    noteEncode: () => Su,
    nprofileEncode: () => Ku,
    npubEncode: () => Eu,
    nsecEncode: () => mu
  });
  var vu = {
    isNProfile: (n) => /^nprofile1[a-z\d]+$/.test(n || ""),
    isNEvent: (n) => /^nevent1[a-z\d]+$/.test(n || ""),
    isNAddr: (n) => /^naddr1[a-z\d]+$/.test(n || ""),
    isNSec: (n) => /^nsec1[a-z\d]{58}$/.test(n || ""),
    isNPub: (n) => /^npub1[a-z\d]{58}$/.test(n || ""),
    isNote: (n) => /^note1[a-z\d]+$/.test(n || ""),
    isNcryptsec: (n) => /^ncryptsec1[a-z\d]+$/.test(n || "")
  };
  var rr = 5e3;
  var ls = /[\x21-\x7E]{1,83}1[023456789acdefghjklmnpqrstuvwxyz]{6,}/;
  function wu(n) {
    const e = new Uint8Array(4);
    return e[0] = n >> 24 & 255, e[1] = n >> 16 & 255, e[2] = n >> 8 & 255, e[3] = n & 255, e;
  }
  function bu(n) {
    try {
      return n.startsWith("nostr:") && (n = n.substring(6)), Vt(n);
    } catch {
      return { type: "invalid", data: null };
    }
  }
  function Vt(n) {
    var i, s, o, a, c, u, h;
    let { prefix: e, words: t } = st.decode(n, rr), r = new Uint8Array(st.fromWords(t));
    switch (e) {
      case "nprofile": {
        let d = hn(r);
        if (!((i = d[0]) != null && i[0]))
          throw new Error("missing TLV 0 for nprofile");
        if (d[0][0].length !== 32)
          throw new Error("TLV 0 should be 32 bytes");
        return {
          type: "nprofile",
          data: {
            pubkey: F(d[0][0]),
            relays: d[1] ? d[1].map((y) => Ce.decode(y)) : []
          }
        };
      }
      case "nevent": {
        let d = hn(r);
        if (!((s = d[0]) != null && s[0]))
          throw new Error("missing TLV 0 for nevent");
        if (d[0][0].length !== 32)
          throw new Error("TLV 0 should be 32 bytes");
        if (d[2] && d[2][0].length !== 32)
          throw new Error("TLV 2 should be 32 bytes");
        if (d[3] && d[3][0].length !== 4)
          throw new Error("TLV 3 should be 4 bytes");
        return {
          type: "nevent",
          data: {
            id: F(d[0][0]),
            relays: d[1] ? d[1].map((y) => Ce.decode(y)) : [],
            author: (o = d[2]) != null && o[0] ? F(d[2][0]) : void 0,
            kind: (a = d[3]) != null && a[0] ? parseInt(F(d[3][0]), 16) : void 0
          }
        };
      }
      case "naddr": {
        let d = hn(r);
        if (!((c = d[0]) != null && c[0]))
          throw new Error("missing TLV 0 for naddr");
        if (!((u = d[2]) != null && u[0]))
          throw new Error("missing TLV 2 for naddr");
        if (d[2][0].length !== 32)
          throw new Error("TLV 2 should be 32 bytes");
        if (!((h = d[3]) != null && h[0]))
          throw new Error("missing TLV 3 for naddr");
        if (d[3][0].length !== 4)
          throw new Error("TLV 3 should be 4 bytes");
        return {
          type: "naddr",
          data: {
            identifier: Ce.decode(d[0][0]),
            pubkey: F(d[2][0]),
            kind: parseInt(F(d[3][0]), 16),
            relays: d[1] ? d[1].map((y) => Ce.decode(y)) : []
          }
        };
      }
      case "nsec":
        return { type: e, data: r };
      case "npub":
      case "note":
        return { type: e, data: F(r) };
      default:
        throw new Error(`unknown prefix ${e}`);
    }
  }
  function hn(n) {
    let e = {}, t = n;
    for (; t.length > 0; ) {
      let r = t[0], i = t[1], s = t.slice(2, 2 + i);
      if (t = t.slice(2 + i), s.length < i)
        throw new Error(`not enough data to read on TLV ${r}`);
      e[r] = e[r] || [], e[r].push(s);
    }
    return e;
  }
  function mu(n) {
    return Zt("nsec", n);
  }
  function Eu(n) {
    return Zt("npub", H(n));
  }
  function Su(n) {
    return Zt("note", H(n));
  }
  function jt(n, e) {
    let t = st.toWords(e);
    return st.encode(n, t, rr);
  }
  function Zt(n, e) {
    return jt(n, e);
  }
  function Ku(n) {
    let e = ir({
      0: [H(n.pubkey)],
      1: (n.relays || []).map((t) => ve.encode(t))
    });
    return jt("nprofile", e);
  }
  function ku(n) {
    let e;
    n.kind !== void 0 && (e = wu(n.kind));
    let t = ir({
      0: [H(n.id)],
      1: (n.relays || []).map((r) => ve.encode(r)),
      2: n.author ? [H(n.author)] : [],
      3: e ? [new Uint8Array(e)] : []
    });
    return jt("nevent", t);
  }
  function xu(n) {
    let e = new ArrayBuffer(4);
    new DataView(e).setUint32(0, n.kind, false);
    let t = ir({
      0: [ve.encode(n.identifier)],
      1: (n.relays || []).map((r) => ve.encode(r)),
      2: [H(n.pubkey)],
      3: [new Uint8Array(e)]
    });
    return jt("naddr", t);
  }
  function ir(n) {
    let e = [];
    return Object.entries(n).reverse().forEach(([t, r]) => {
      r.forEach((i) => {
        let s = new Uint8Array(i.length + 2);
        s.set([parseInt(t)], 0), s.set([i.length], 1), s.set(i, 2), e.push(s);
      });
    }), ee(...e);
  }
  var Pu = {};
  L(Pu, {
    decrypt: () => Au,
    encrypt: () => fs
  });
  function fs(n, e, t) {
    const r = n instanceof Uint8Array ? n : H(n), i = Gt.getSharedSecret(r, H("02" + e)), s = ys(i);
    let o = Uint8Array.from(We(16)), a = ve.encode(t), c = ji(s, o).encrypt(a), u = xe.encode(new Uint8Array(c)), h = xe.encode(new Uint8Array(o.buffer));
    return `${u}?iv=${h}`;
  }
  function Au(n, e, t) {
    const r = n instanceof Uint8Array ? n : H(n);
    let [i, s] = t.split("?iv="), o = Gt.getSharedSecret(r, H("02" + e)), a = ys(o), c = xe.decode(s), u = xe.decode(i), h = ji(a, c).decrypt(u);
    return Ce.decode(h);
  }
  function ys(n) {
    return n.slice(1, 33);
  }
  var Iu = {};
  L(Iu, {
    NIP05_REGEX: () => sr,
    isNip05: () => Mu,
    isValid: () => Du,
    queryProfile: () => ps,
    searchDomain: () => Ou,
    useFetchImplementation: () => Cu
  });
  var sr = /^(?:([\w.+-]+)@)?([\w_-]+(\.[\w_-]+)+)$/;
  var Mu = (n) => sr.test(n || "");
  var Jt;
  try {
    Jt = fetch;
  } catch {
  }
  function Cu(n) {
    Jt = n;
  }
  async function Ou(n, e = "") {
    try {
      const t = `https://${n}/.well-known/nostr.json?name=${e}`, r = await Jt(t, { redirect: "manual" });
      if (r.status !== 200)
        throw Error("Wrong response code");
      return (await r.json()).names;
    } catch {
      return {};
    }
  }
  async function ps(n) {
    var i;
    const e = n.match(sr);
    if (!e)
      return null;
    const [, t = "_", r] = e;
    try {
      const s = `https://${r}/.well-known/nostr.json?name=${t}`, o = await Jt(s, { redirect: "manual" });
      if (o.status !== 200)
        throw Error("Wrong response code");
      const a = await o.json(), c = a.names[t];
      return c ? { pubkey: c, relays: (i = a.relays) == null ? void 0 : i[c] } : null;
    } catch {
      return null;
    }
  }
  async function Du(n, e) {
    const t = await ps(e);
    return t ? t.pubkey === n : false;
  }
  var Ru = {};
  L(Ru, {
    parse: () => Nu
  });
  function Nu(n) {
    const e = {
      reply: void 0,
      root: void 0,
      mentions: [],
      profiles: [],
      quotes: []
    };
    let t, r;
    for (let i = n.tags.length - 1; i >= 0; i--) {
      const s = n.tags[i];
      if (s[0] === "e" && s[1]) {
        const [o, a, c, u, h] = s, d = {
          id: a,
          relays: c ? [c] : [],
          author: h
        };
        if (u === "root") {
          e.root = d;
          continue;
        }
        if (u === "reply") {
          e.reply = d;
          continue;
        }
        if (u === "mention") {
          e.mentions.push(d);
          continue;
        }
        t ? r = d : t = d, e.mentions.push(d);
        continue;
      }
      if (s[0] === "q" && s[1]) {
        const [o, a, c] = s;
        e.quotes.push({
          id: a,
          relays: c ? [c] : []
        });
      }
      if (s[0] === "p" && s[1]) {
        e.profiles.push({
          pubkey: s[1],
          relays: s[2] ? [s[2]] : []
        });
        continue;
      }
    }
    return e.root || (e.root = r || t || e.reply), e.reply || (e.reply = t || e.root), [e.reply, e.root].forEach((i) => {
      if (!i)
        return;
      let s = e.mentions.indexOf(i);
      if (s !== -1 && e.mentions.splice(s, 1), i.author) {
        let o = e.profiles.find((a) => a.pubkey === i.author);
        o && o.relays && (i.relays || (i.relays = []), o.relays.forEach((a) => {
          var c;
          ((c = i.relays) == null ? void 0 : c.indexOf(a)) === -1 && i.relays.push(a);
        }), o.relays = i.relays);
      }
    }), e.mentions.forEach((i) => {
      if (i.author) {
        let s = e.profiles.find((o) => o.pubkey === i.author);
        s && s.relays && (i.relays || (i.relays = []), s.relays.forEach((o) => {
          i.relays.indexOf(o) === -1 && i.relays.push(o);
        }), s.relays = i.relays);
      }
    }), e;
  }
  var Bu = {};
  L(Bu, {
    fetchRelayInformation: () => _u,
    useFetchImplementation: () => Tu
  });
  var gs;
  try {
    gs = fetch;
  } catch {
  }
  function Tu(n) {
    gs = n;
  }
  async function _u(n) {
    return await (await fetch(n.replace("ws://", "http://").replace("wss://", "https://"), {
      headers: { Accept: "application/nostr+json" }
    })).json();
  }
  var Lu = {};
  L(Lu, {
    getPow: () => Uu,
    minePow: () => Fu
  });
  function Uu(n) {
    let e = 0;
    for (let t = 0; t < 64; t += 8) {
      const r = parseInt(n.substring(t, t + 8), 16);
      if (r === 0)
        e += 32;
      else {
        e += Math.clz32(r);
        break;
      }
    }
    return e;
  }
  function $u(n) {
    let e = 0;
    for (let t = 0; t < n.length; t++) {
      const r = n[t];
      if (r === 0)
        e += 8;
      else {
        e += Math.clz32(r) - 24;
        break;
      }
    }
    return e;
  }
  function Fu(n, e) {
    let t = 0;
    const r = n, i = ["nonce", t.toString(), e.toString()];
    for (r.tags.push(i); ; ) {
      const s = Math.floor((/* @__PURE__ */ new Date()).getTime() / 1e3);
      s !== r.created_at && (t = 0, r.created_at = s), i[1] = (++t).toString();
      const o = ye(
        ve.encode(JSON.stringify([0, r.pubkey, r.created_at, r.kind, r.tags, r.content]))
      );
      if ($u(o) >= e) {
        r.id = F(o);
        break;
      }
    }
    return r;
  }
  var Gu = {};
  L(Gu, {
    unwrapEvent: () => Qu,
    unwrapManyEvents: () => eh,
    wrapEvent: () => Ms,
    wrapManyEvents: () => Xu
  });
  var Hu = {};
  L(Hu, {
    createRumor: () => xs,
    createSeal: () => Ps,
    createWrap: () => As,
    unwrapEvent: () => hr,
    unwrapManyEvents: () => Is,
    wrapEvent: () => _t,
    wrapManyEvents: () => Wu
  });
  var z = {};
  L(z, {
    decrypt: () => ur,
    encrypt: () => cr,
    getConversationKey: () => or,
    v2: () => Zu
  });
  var vs = 1;
  var ws = 65535;
  function or(n, e) {
    const t = Gt.getSharedSecret(n, H("02" + e)).subarray(1, 33);
    return Wi(ye, t, ve.encode("nip44-v2"));
  }
  function bs(n, e) {
    const t = Yi(ye, n, e, 76);
    return {
      chacha_key: t.subarray(0, 32),
      chacha_nonce: t.subarray(32, 44),
      hmac_key: t.subarray(44, 76)
    };
  }
  function ar(n) {
    if (!Number.isSafeInteger(n) || n < 1)
      throw new Error("expected positive integer");
    if (n <= 32)
      return 32;
    const e = 1 << Math.floor(Math.log2(n - 1)) + 1, t = e <= 256 ? 32 : e / 8;
    return t * (Math.floor((n - 1) / t) + 1);
  }
  function zu(n) {
    if (!Number.isSafeInteger(n) || n < vs || n > ws)
      throw new Error("invalid plaintext size: must be between 1 and 65535 bytes");
    const e = new Uint8Array(2);
    return new DataView(e.buffer).setUint16(0, n, false), e;
  }
  function qu(n) {
    const e = ve.encode(n), t = e.length, r = zu(t), i = new Uint8Array(ar(t) - t);
    return ee(r, e, i);
  }
  function Vu(n) {
    const e = new DataView(n.buffer).getUint16(0), t = n.subarray(2, 2 + e);
    if (e < vs || e > ws || t.length !== e || n.length !== 2 + ar(e))
      throw new Error("invalid padding");
    return Ce.decode(t);
  }
  function ms(n, e, t) {
    if (t.length !== 32)
      throw new Error("AAD associated data must be 32 bytes");
    const r = ee(t, e);
    return ct(ye, n, r);
  }
  function ju(n) {
    if (typeof n != "string")
      throw new Error("payload must be a valid string");
    const e = n.length;
    if (e < 132 || e > 87472)
      throw new Error("invalid payload length: " + e);
    if (n[0] === "#")
      throw new Error("unknown encryption version");
    let t;
    try {
      t = xe.decode(n);
    } catch (s) {
      throw new Error("invalid base64: " + s.message);
    }
    const r = t.length;
    if (r < 99 || r > 65603)
      throw new Error("invalid data length: " + r);
    const i = t[0];
    if (i !== 2)
      throw new Error("unknown encryption version " + i);
    return {
      nonce: t.subarray(1, 33),
      ciphertext: t.subarray(33, -32),
      mac: t.subarray(-32)
    };
  }
  function cr(n, e, t = We(32)) {
    const { chacha_key: r, chacha_nonce: i, hmac_key: s } = bs(e, t), o = qu(n), a = Ht(r, i, o), c = ms(s, a, t);
    return xe.encode(ee(new Uint8Array([2]), t, a, c));
  }
  function ur(n, e) {
    const { nonce: t, ciphertext: r, mac: i } = ju(n), { chacha_key: s, chacha_nonce: o, hmac_key: a } = bs(e, t), c = ms(a, r, t);
    if (!Gi(c, i))
      throw new Error("invalid MAC");
    const u = Ht(s, o, r);
    return Vu(u);
  }
  var Zu = {
    utils: {
      getConversationKey: or,
      calcPaddedLen: ar
    },
    encrypt: cr,
    decrypt: ur
  };
  var Ju = 2880 * 60;
  var Es = () => Math.round(Date.now() / 1e3);
  var Ss = () => Math.round(Es() - Math.random() * Ju);
  var Ks = (n, e) => or(n, e);
  var ks = (n, e, t) => cr(JSON.stringify(n), Ks(e, t));
  var zr = (n, e) => JSON.parse(ur(n.content, Ks(e, n.pubkey)));
  function xs(n, e) {
    const t = {
      created_at: Es(),
      content: "",
      tags: [],
      ...n,
      pubkey: ie(e)
    };
    return t.id = ge(t), t;
  }
  function Ps(n, e, t) {
    return oe(
      {
        kind: ts,
        content: ks(n, e, t),
        created_at: Ss(),
        tags: []
      },
      e
    );
  }
  function As(n, e) {
    const t = me();
    return oe(
      {
        kind: cs,
        content: ks(n, t, e),
        created_at: Ss(),
        tags: [["p", e]]
      },
      t
    );
  }
  function _t(n, e, t) {
    const r = xs(n, e), i = Ps(r, e, t);
    return As(i, t);
  }
  function Wu(n, e, t) {
    if (!t || t.length === 0)
      throw new Error("At least one recipient is required.");
    const r = ie(e), i = [_t(n, e, r)];
    return t.forEach((s) => {
      i.push(_t(n, e, s));
    }), i;
  }
  function hr(n, e) {
    const t = zr(n, e);
    return zr(t, e);
  }
  function Is(n, e) {
    let t = [];
    return n.forEach((r) => {
      t.push(hr(r, e));
    }), t.sort((r, i) => r.created_at - i.created_at), t;
  }
  function Yu(n, e, t, r) {
    const i = {
      created_at: Math.ceil(Date.now() / 1e3),
      kind: ns,
      tags: [],
      content: e
    };
    return (Array.isArray(n) ? n : [n]).forEach(({ publicKey: o, relayUrl: a }) => {
      i.tags.push(a ? ["p", o, a] : ["p", o]);
    }), r && i.tags.push(["e", r.eventId, r.relayUrl || "", "reply"]), t && i.tags.push(["subject", t]), i;
  }
  function Ms(n, e, t, r, i) {
    const s = Yu(e, t, r, i);
    return _t(s, n, e.publicKey);
  }
  function Xu(n, e, t, r, i) {
    if (!e || e.length === 0)
      throw new Error("At least one recipient is required.");
    return [{ publicKey: ie(n) }, ...e].map(
      (o) => Ms(n, o, t, r, i)
    );
  }
  var Qu = hr;
  var eh = Is;
  var th = {};
  L(th, {
    finishRepostEvent: () => nh,
    getRepostedEvent: () => rh,
    getRepostedEventPointer: () => Cs
  });
  function nh(n, e, t, r) {
    var o;
    let i;
    const s = [...n.tags ?? [], ["e", e.id, t], ["p", e.pubkey]];
    return e.kind === es ? i = Xn : (i = er, s.push(["k", String(e.kind)])), oe(
      {
        kind: i,
        tags: s,
        content: n.content === "" || (o = e.tags) != null && o.find((a) => a[0] === "-") ? "" : JSON.stringify(e),
        created_at: n.created_at
      },
      r
    );
  }
  function Cs(n) {
    if (![Xn, er].includes(n.kind))
      return;
    let e, t;
    for (let r = n.tags.length - 1; r >= 0 && (e === void 0 || t === void 0); r--) {
      const i = n.tags[r];
      i.length >= 2 && (i[0] === "e" && e === void 0 ? e = i : i[0] === "p" && t === void 0 && (t = i));
    }
    if (e !== void 0)
      return {
        id: e[1],
        relays: [e[2], t == null ? void 0 : t[2]].filter((r) => typeof r == "string"),
        author: t == null ? void 0 : t[1]
      };
  }
  function rh(n, { skipVerification: e } = {}) {
    const t = Cs(n);
    if (t === void 0 || n.content === "")
      return;
    let r;
    try {
      r = JSON.parse(n.content);
    } catch {
      return;
    }
    if (r.id === t.id && !(!e && !ut(r)))
      return r;
  }
  var ih = {};
  L(ih, {
    NOSTR_URI_REGEX: () => dr,
    parse: () => oh,
    test: () => sh
  });
  var dr = new RegExp(`nostr:(${ls.source})`);
  function sh(n) {
    return typeof n == "string" && new RegExp(`^${dr.source}$`).test(n);
  }
  function oh(n) {
    const e = n.match(new RegExp(`^${dr.source}$`));
    if (!e)
      throw new Error(`Invalid Nostr URI: ${n}`);
    return {
      uri: e[0],
      value: e[1],
      decoded: Vt(e[1])
    };
  }
  var ah = {};
  L(ah, {
    finishReactionEvent: () => ch,
    getReactedEventPointer: () => uh
  });
  function ch(n, e, t) {
    const r = e.tags.filter((i) => i.length >= 2 && (i[0] === "e" || i[0] === "p"));
    return oe(
      {
        ...n,
        kind: Qn,
        tags: [...n.tags ?? [], ...r, ["e", e.id], ["p", e.pubkey]],
        content: n.content ?? "+"
      },
      t
    );
  }
  function uh(n) {
    if (n.kind !== Qn)
      return;
    let e, t;
    for (let r = n.tags.length - 1; r >= 0 && (e === void 0 || t === void 0); r--) {
      const i = n.tags[r];
      i.length >= 2 && (i[0] === "e" && e === void 0 ? e = i : i[0] === "p" && t === void 0 && (t = i));
    }
    if (!(e === void 0 || t === void 0))
      return {
        id: e[1],
        relays: [e[2], t[2]].filter((r) => r !== void 0),
        author: t[1]
      };
  }
  var hh = {};
  L(hh, {
    parse: () => lh
  });
  var dn = /\W/m;
  var qr = /[^\w\/] |[^\w\/]$|$|,| /m;
  var dh = 42;
  function* lh(n) {
    let e = [];
    if (typeof n != "string") {
      for (let s = 0; s < n.tags.length; s++) {
        const o = n.tags[s];
        o[0] === "emoji" && o.length >= 3 && e.push({ type: "emoji", shortcode: o[1], url: o[2] });
      }
      n = n.content;
    }
    const t = n.length;
    let r = 0, i = 0;
    e:
      for (; i < t; ) {
        const s = n.indexOf(":", i), o = n.indexOf("#", i);
        if (s === -1 && o === -1)
          break e;
        if (s === -1 || o >= 0 && o < s) {
          if (o === 0 || n[o - 1].match(dn)) {
            const a = n.slice(o + 1, o + dh).match(dn), c = a ? o + 1 + a.index : t;
            yield { type: "text", text: n.slice(r, o) }, yield { type: "hashtag", value: n.slice(o + 1, c) }, i = c, r = i;
            continue e;
          }
          i = o + 1;
          continue e;
        }
        if (n.slice(s - 5, s) === "nostr") {
          const a = n.slice(s + 60).match(dn), c = a ? s + 60 + a.index : t;
          try {
            let u, { data: h, type: d } = Vt(n.slice(s + 1, c));
            switch (d) {
              case "npub":
                u = { pubkey: h };
                break;
              case "note":
                u = { id: h };
                break;
              case "nsec":
                i = c + 1;
                continue;
              default:
                u = h;
            }
            r !== s - 5 && (yield { type: "text", text: n.slice(r, s - 5) }), yield { type: "reference", pointer: u }, i = c, r = i;
            continue e;
          } catch {
            i = s + 1;
            continue e;
          }
        } else if (n.slice(s - 5, s) === "https" || n.slice(s - 4, s) === "http") {
          const a = n.slice(s + 4).match(qr), c = a ? s + 4 + a.index : t, u = n[s - 1] === "s" ? 5 : 4;
          try {
            let h = new URL(n.slice(s - u, c));
            if (h.hostname.indexOf(".") === -1)
              throw new Error("invalid url");
            if (r !== s - u && (yield { type: "text", text: n.slice(r, s - u) }), /\.(png|jpe?g|gif|webp|heic|svg)$/i.test(h.pathname)) {
              yield { type: "image", url: h.toString() }, i = c, r = i;
              continue e;
            }
            if (/\.(mp4|avi|webm|mkv|mov)$/i.test(h.pathname)) {
              yield { type: "video", url: h.toString() }, i = c, r = i;
              continue e;
            }
            if (/\.(mp3|aac|ogg|opus|wav|flac)$/i.test(h.pathname)) {
              yield { type: "audio", url: h.toString() }, i = c, r = i;
              continue e;
            }
            yield { type: "url", url: h.toString() }, i = c, r = i;
            continue e;
          } catch {
            i = c + 1;
            continue e;
          }
        } else if (n.slice(s - 3, s) === "wss" || n.slice(s - 2, s) === "ws") {
          const a = n.slice(s + 4).match(qr), c = a ? s + 4 + a.index : t, u = n[s - 1] === "s" ? 3 : 2;
          try {
            let h = new URL(n.slice(s - u, c));
            if (h.hostname.indexOf(".") === -1)
              throw new Error("invalid ws url");
            r !== s - u && (yield { type: "text", text: n.slice(r, s - u) }), yield { type: "relay", url: h.toString() }, i = c, r = i;
            continue e;
          } catch {
            i = c + 1;
            continue e;
          }
        } else {
          for (let a = 0; a < e.length; a++) {
            const c = e[a];
            if (n[s + c.shortcode.length + 1] === ":" && n.slice(s + 1, s + c.shortcode.length + 1) === c.shortcode) {
              r !== s && (yield { type: "text", text: n.slice(r, s) }), yield c, i = s + c.shortcode.length + 2, r = i;
              continue e;
            }
          }
          i = s + 1;
          continue e;
        }
      }
    r !== t && (yield { type: "text", text: n.slice(r) });
  }
  var fh = {};
  L(fh, {
    channelCreateEvent: () => yh,
    channelHideMessageEvent: () => vh,
    channelMessageEvent: () => gh,
    channelMetadataEvent: () => ph,
    channelMuteUserEvent: () => wh
  });
  var yh = (n, e) => {
    let t;
    if (typeof n.content == "object")
      t = JSON.stringify(n.content);
    else if (typeof n.content == "string")
      t = n.content;
    else
      return;
    return oe(
      {
        kind: rs,
        tags: [...n.tags ?? []],
        content: t,
        created_at: n.created_at
      },
      e
    );
  };
  var ph = (n, e) => {
    let t;
    if (typeof n.content == "object")
      t = JSON.stringify(n.content);
    else if (typeof n.content == "string")
      t = n.content;
    else
      return;
    return oe(
      {
        kind: is,
        tags: [["e", n.channel_create_event_id], ...n.tags ?? []],
        content: t,
        created_at: n.created_at
      },
      e
    );
  };
  var gh = (n, e) => {
    const t = [["e", n.channel_create_event_id, n.relay_url, "root"]];
    return n.reply_to_channel_message_event_id && t.push(["e", n.reply_to_channel_message_event_id, n.relay_url, "reply"]), oe(
      {
        kind: ss,
        tags: [...t, ...n.tags ?? []],
        content: n.content,
        created_at: n.created_at
      },
      e
    );
  };
  var vh = (n, e) => {
    let t;
    if (typeof n.content == "object")
      t = JSON.stringify(n.content);
    else if (typeof n.content == "string")
      t = n.content;
    else
      return;
    return oe(
      {
        kind: os,
        tags: [["e", n.channel_message_event_id], ...n.tags ?? []],
        content: t,
        created_at: n.created_at
      },
      e
    );
  };
  var wh = (n, e) => {
    let t;
    if (typeof n.content == "object")
      t = JSON.stringify(n.content);
    else if (typeof n.content == "string")
      t = n.content;
    else
      return;
    return oe(
      {
        kind: as,
        tags: [["p", n.pubkey_to_mute], ...n.tags ?? []],
        content: t,
        created_at: n.created_at
      },
      e
    );
  };
  var bh = {};
  L(bh, {
    EMOJI_SHORTCODE_REGEX: () => Os,
    matchAll: () => mh,
    regex: () => lr,
    replaceAll: () => Eh
  });
  var Os = /:(\w+):/;
  var lr = () => new RegExp(`\\B${Os.source}\\B`, "g");
  function* mh(n) {
    const e = n.matchAll(lr());
    for (const t of e)
      try {
        const [r, i] = t;
        yield {
          shortcode: r,
          name: i,
          start: t.index,
          end: t.index + r.length
        };
      } catch {
      }
  }
  function Eh(n, e) {
    return n.replaceAll(lr(), (t, r) => e({
      shortcode: t,
      name: r
    }));
  }
  var Sh = {};
  L(Sh, {
    useFetchImplementation: () => Kh,
    validateGithub: () => kh
  });
  var fr;
  try {
    fr = fetch;
  } catch {
  }
  function Kh(n) {
    fr = n;
  }
  async function kh(n, e, t) {
    try {
      return await (await fr(`https://gist.github.com/${e}/${t}/raw`)).text() === `Verifying that I control the following Nostr public key: ${n}`;
    } catch {
      return false;
    }
  }
  var xh = {};
  L(xh, {
    makeNwcRequestEvent: () => Ah,
    parseConnectionString: () => Ph
  });
  function Ph(n) {
    const { host: e, pathname: t, searchParams: r } = new URL(n), i = t || e, s = r.get("relay"), o = r.get("secret");
    if (!i || !s || !o)
      throw new Error("invalid connection string");
    return { pubkey: i, relay: s, secret: o };
  }
  async function Ah(n, e, t) {
    const i = fs(e, n, JSON.stringify({
      method: "pay_invoice",
      params: {
        invoice: t
      }
    })), s = {
      kind: hs,
      created_at: Math.round(Date.now() / 1e3),
      content: i,
      tags: [["p", n]]
    };
    return oe(s, e);
  }
  var Ih = {};
  L(Ih, {
    normalizeIdentifier: () => Mh
  });
  function Mh(n) {
    return n = n.trim().toLowerCase(), n = n.normalize("NFKC"), Array.from(n).map((e) => new RegExp("\\p{Letter}", "u").test(e) || new RegExp("\\p{Number}", "u").test(e) ? e : "-").join("");
  }
  var Ch = {};
  L(Ch, {
    getSatoshisAmountFromBolt11: () => Th,
    getZapEndpoint: () => Dh,
    makeZapReceipt: () => Bh,
    makeZapRequest: () => Rh,
    useFetchImplementation: () => Oh,
    validateZapRequest: () => Nh
  });
  var yr;
  try {
    yr = fetch;
  } catch {
  }
  function Oh(n) {
    yr = n;
  }
  async function Dh(n) {
    try {
      let e = "", { lud06: t, lud16: r } = JSON.parse(n.content);
      if (r) {
        let [o, a] = r.split("@");
        e = new URL(`/.well-known/lnurlp/${o}`, `https://${a}`).toString();
      } else if (t) {
        let { words: o } = st.decode(t, 1e3), a = st.fromWords(o);
        e = Ce.decode(a);
      } else
        return null;
      let s = await (await yr(e)).json();
      if (s.allowsNostr && s.nostrPubkey)
        return s.callback;
    } catch {
    }
    return null;
  }
  function Rh(n) {
    let e = {
      kind: 9734,
      created_at: Math.round(Date.now() / 1e3),
      content: n.comment || "",
      tags: [
        ["p", "pubkey" in n ? n.pubkey : n.event.pubkey],
        ["amount", n.amount.toString()],
        ["relays", ...n.relays]
      ]
    };
    if ("event" in n) {
      if (e.tags.push(["e", n.event.id]), Wn(n.event.kind)) {
        const t = ["a", `${n.event.kind}:${n.event.pubkey}:`];
        e.tags.push(t);
      } else if (Yn(n.event.kind)) {
        let t = n.event.tags.find(([i, s]) => i === "d" && s);
        if (!t)
          throw new Error("d tag not found or is empty");
        const r = ["a", `${n.event.kind}:${n.event.pubkey}:${t[1]}`];
        e.tags.push(r);
      }
      e.tags.push(["k", n.event.kind.toString()]);
    }
    return e;
  }
  function Nh(n) {
    let e;
    try {
      e = JSON.parse(n);
    } catch {
      return "Invalid zap request JSON.";
    }
    if (!zt(e))
      return "Zap request is not a valid Nostr event.";
    if (!ut(e))
      return "Invalid signature on zap request.";
    let t = e.tags.find(([s, o]) => s === "p" && o);
    if (!t)
      return "Zap request doesn't have a 'p' tag.";
    if (!t[1].match(/^[a-f0-9]{64}$/))
      return "Zap request 'p' tag is not valid hex.";
    let r = e.tags.find(([s, o]) => s === "e" && o);
    return r && !r[1].match(/^[a-f0-9]{64}$/) ? "Zap request 'e' tag is not valid hex." : e.tags.find(([s, o]) => s === "relays" && o) ? null : "Zap request doesn't have a 'relays' tag.";
  }
  function Bh({
    zapRequest: n,
    preimage: e,
    bolt11: t,
    paidAt: r
  }) {
    let i = JSON.parse(n), s = i.tags.filter(([a]) => a === "e" || a === "p" || a === "a"), o = {
      kind: 9735,
      created_at: Math.round(r.getTime() / 1e3),
      content: "",
      tags: [...s, ["P", i.pubkey], ["bolt11", t], ["description", n]]
    };
    return e && o.tags.push(["preimage", e]), o;
  }
  function Th(n) {
    if (n.length < 50)
      return 0;
    n = n.substring(0, 50);
    const e = n.lastIndexOf("1");
    if (e === -1)
      return 0;
    const t = n.substring(0, e);
    if (!t.startsWith("lnbc"))
      return 0;
    const r = t.substring(4);
    if (r.length < 1)
      return 0;
    const i = r[r.length - 1], s = i.charCodeAt(0) - 48, o = s >= 0 && s <= 9;
    let a = r.length - 1;
    if (o && a++, a < 1)
      return 0;
    const c = parseInt(r.substring(0, a));
    switch (i) {
      case "m":
        return c * 1e5;
      case "u":
        return c * 100;
      case "n":
        return c / 10;
      case "p":
        return c / 1e4;
      default:
        return c * 1e8;
    }
  }
  var _h = {};
  L(_h, {
    Negentropy: () => Rs,
    NegentropyStorageVector: () => $h,
    NegentropySync: () => Fh
  });
  var ln = 97;
  var rt = 32;
  var Ds = 16;
  var $e = {
    Skip: 0,
    Fingerprint: 1,
    IdList: 2
  };
  var Ie = class {
    constructor(n) {
      l(this, "_raw");
      l(this, "length");
      typeof n == "number" ? (this._raw = new Uint8Array(n), this.length = 0) : n instanceof Uint8Array ? (this._raw = new Uint8Array(n), this.length = n.length) : (this._raw = new Uint8Array(512), this.length = 0);
    }
    unwrap() {
      return this._raw.subarray(0, this.length);
    }
    get capacity() {
      return this._raw.byteLength;
    }
    extend(n) {
      if (n instanceof Ie && (n = n.unwrap()), typeof n.length != "number")
        throw Error("bad length");
      const e = n.length + this.length;
      if (this.capacity < e) {
        const t = this._raw, r = Math.max(this.capacity * 2, e);
        this._raw = new Uint8Array(r), this._raw.set(t);
      }
      this._raw.set(n, this.length), this.length += n.length;
    }
    shift() {
      const n = this._raw[0];
      return this._raw = this._raw.subarray(1), this.length--, n;
    }
    shiftN(n = 1) {
      const e = this._raw.subarray(0, n);
      return this._raw = this._raw.subarray(n), this.length -= n, e;
    }
  };
  function Kt(n) {
    let e = 0;
    for (; ; ) {
      if (n.length === 0)
        throw Error("parse ends prematurely");
      let t = n.shift();
      if (e = e << 7 | t & 127, (t & 128) === 0)
        break;
    }
    return e;
  }
  function Ae(n) {
    if (n === 0)
      return new Ie(new Uint8Array([0]));
    let e = [];
    for (; n !== 0; )
      e.push(n & 127), n >>>= 7;
    e.reverse();
    for (let t = 0; t < e.length - 1; t++)
      e[t] |= 128;
    return new Ie(new Uint8Array(e));
  }
  function Lh(n) {
    return It(n, 1)[0];
  }
  function It(n, e) {
    if (n.length < e)
      throw Error("parse ends prematurely");
    return n.shiftN(e);
  }
  var Uh = class {
    constructor() {
      l(this, "buf");
      this.setToZero();
    }
    setToZero() {
      this.buf = new Uint8Array(rt);
    }
    add(n) {
      let e = 0, t = 0, r = new DataView(this.buf.buffer), i = new DataView(n.buffer);
      for (let s = 0; s < 8; s++) {
        let o = s * 4, a = r.getUint32(o, true), c = i.getUint32(o, true), u = a;
        u += e, u += c, u > 4294967295 && (t = 1), r.setUint32(o, u & 4294967295, true), e = t, t = 0;
      }
    }
    negate() {
      let n = new DataView(this.buf.buffer);
      for (let t = 0; t < 8; t++) {
        let r = t * 4;
        n.setUint32(r, ~n.getUint32(r, true));
      }
      let e = new Uint8Array(rt);
      e[0] = 1, this.add(e);
    }
    getFingerprint(n) {
      let e = new Ie();
      return e.extend(this.buf), e.extend(Ae(n)), ye(e.unwrap()).subarray(0, Ds);
    }
  };
  var $h = class {
    constructor() {
      l(this, "items");
      l(this, "sealed");
      this.items = [], this.sealed = false;
    }
    insert(n, e) {
      if (this.sealed)
        throw Error("already sealed");
      const t = H(e);
      if (t.byteLength !== rt)
        throw Error("bad id size for added item");
      this.items.push({ timestamp: n, id: t });
    }
    seal() {
      if (this.sealed)
        throw Error("already sealed");
      this.sealed = true, this.items.sort(fn);
      for (let n = 1; n < this.items.length; n++)
        if (fn(this.items[n - 1], this.items[n]) === 0)
          throw Error("duplicate item inserted");
    }
    unseal() {
      this.sealed = false;
    }
    size() {
      return this._checkSealed(), this.items.length;
    }
    getItem(n) {
      if (this._checkSealed(), n >= this.items.length)
        throw Error("out of range");
      return this.items[n];
    }
    iterate(n, e, t) {
      this._checkSealed(), this._checkBounds(n, e);
      for (let r = n; r < e && t(this.items[r], r); ++r)
        ;
    }
    findLowerBound(n, e, t) {
      return this._checkSealed(), this._checkBounds(n, e), this._binarySearch(this.items, n, e, (r) => fn(r, t) < 0);
    }
    fingerprint(n, e) {
      let t = new Uh();
      return t.setToZero(), this.iterate(n, e, (r) => (t.add(r.id), true)), t.getFingerprint(e - n);
    }
    _checkSealed() {
      if (!this.sealed)
        throw Error("not sealed");
    }
    _checkBounds(n, e) {
      if (n > e || e > this.items.length)
        throw Error("bad range");
    }
    _binarySearch(n, e, t, r) {
      let i = t - e;
      for (; i > 0; ) {
        let s = e, o = Math.floor(i / 2);
        s += o, r(n[s]) ? (e = ++s, i -= o + 1) : i = o;
      }
      return e;
    }
  };
  var Rs = class {
    constructor(n, e = 6e4) {
      l(this, "storage");
      l(this, "frameSizeLimit");
      l(this, "lastTimestampIn");
      l(this, "lastTimestampOut");
      if (e < 4096)
        throw Error("frameSizeLimit too small");
      this.storage = n, this.frameSizeLimit = e, this.lastTimestampIn = 0, this.lastTimestampOut = 0;
    }
    _bound(n, e) {
      return { timestamp: n, id: e || new Uint8Array(0) };
    }
    initiate() {
      let n = new Ie();
      return n.extend(new Uint8Array([ln])), this.splitRange(0, this.storage.size(), this._bound(Number.MAX_VALUE), n), F(n.unwrap());
    }
    reconcile(n, e, t) {
      const r = new Ie(H(n));
      this.lastTimestampIn = this.lastTimestampOut = 0;
      let i = new Ie();
      i.extend(new Uint8Array([ln]));
      let s = Lh(r);
      if (s < 96 || s > 111)
        throw Error("invalid negentropy protocol version byte");
      if (s !== ln)
        throw Error("unsupported negentropy protocol version requested: " + (s - 96));
      let o = this.storage.size(), a = this._bound(0), c = 0, u = false;
      for (; r.length !== 0; ) {
        let h = new Ie(), d = () => {
          u && (u = false, h.extend(this.encodeBound(a)), h.extend(Ae($e.Skip)));
        }, y = this.decodeBound(r), f = Kt(r), p = c, w = this.storage.findLowerBound(c, o, y);
        if (f === $e.Skip)
          u = true;
        else if (f === $e.Fingerprint) {
          let b = It(r, Ds), m = this.storage.fingerprint(p, w);
          Ns(b, m) !== 0 ? (d(), this.splitRange(p, w, y, h)) : u = true;
        } else if (f === $e.IdList) {
          let b = Kt(r), m = {};
          for (let P = 0; P < b; P++) {
            let N = It(r, rt);
            m[F(N)] = N;
          }
          if (u = true, this.storage.iterate(p, w, (P) => {
            let N = P.id;
            const O = F(N);
            return m[O] ? delete m[F(N)] : e == null || e(O), true;
          }), t)
            for (let P of Object.values(m))
              t(F(P));
        } else
          throw Error("unexpected mode");
        if (this.exceededFrameSizeLimit(i.length + h.length)) {
          let b = this.storage.fingerprint(w, o);
          i.extend(this.encodeBound(this._bound(Number.MAX_VALUE))), i.extend(Ae($e.Fingerprint)), i.extend(b);
          break;
        } else
          i.extend(h);
        c = w, a = y;
      }
      return i.length === 1 ? null : F(i.unwrap());
    }
    splitRange(n, e, t, r) {
      let i = e - n, s = 16;
      if (i < s * 2)
        r.extend(this.encodeBound(t)), r.extend(Ae($e.IdList)), r.extend(Ae(i)), this.storage.iterate(n, e, (o) => (r.extend(o.id), true));
      else {
        let o = Math.floor(i / s), a = i % s, c = n;
        for (let u = 0; u < s; u++) {
          let h = o + (u < a ? 1 : 0), d = this.storage.fingerprint(c, c + h);
          c += h;
          let y;
          if (c === e)
            y = t;
          else {
            let f, p;
            this.storage.iterate(c - 1, c + 1, (w, b) => (b === c - 1 ? f = w : p = w, true)), y = this.getMinimalBound(f, p);
          }
          r.extend(this.encodeBound(y)), r.extend(Ae($e.Fingerprint)), r.extend(d);
        }
      }
    }
    exceededFrameSizeLimit(n) {
      return n > this.frameSizeLimit - 200;
    }
    decodeTimestampIn(n) {
      let e = Kt(n);
      return e = e === 0 ? Number.MAX_VALUE : e - 1, this.lastTimestampIn === Number.MAX_VALUE || e === Number.MAX_VALUE ? (this.lastTimestampIn = Number.MAX_VALUE, Number.MAX_VALUE) : (e += this.lastTimestampIn, this.lastTimestampIn = e, e);
    }
    decodeBound(n) {
      let e = this.decodeTimestampIn(n), t = Kt(n);
      if (t > rt)
        throw Error("bound key too long");
      let r = It(n, t);
      return { timestamp: e, id: r };
    }
    encodeTimestampOut(n) {
      if (n === Number.MAX_VALUE)
        return this.lastTimestampOut = Number.MAX_VALUE, Ae(0);
      let e = n;
      return n -= this.lastTimestampOut, this.lastTimestampOut = e, Ae(n + 1);
    }
    encodeBound(n) {
      let e = new Ie();
      return e.extend(this.encodeTimestampOut(n.timestamp)), e.extend(Ae(n.id.length)), e.extend(n.id), e;
    }
    getMinimalBound(n, e) {
      if (e.timestamp !== n.timestamp)
        return this._bound(e.timestamp);
      {
        let t = 0, r = e.id, i = n.id;
        for (let s = 0; s < rt && r[s] === i[s]; s++)
          t++;
        return this._bound(e.timestamp, e.id.subarray(0, t + 1));
      }
    }
  };
  function Ns(n, e) {
    for (let t = 0; t < n.byteLength; t++) {
      if (n[t] < e[t])
        return -1;
      if (n[t] > e[t])
        return 1;
    }
    return n.byteLength > e.byteLength ? 1 : n.byteLength < e.byteLength ? -1 : 0;
  }
  function fn(n, e) {
    return n.timestamp === e.timestamp ? Ns(n.id, e.id) : n.timestamp - e.timestamp;
  }
  var Fh = class {
    constructor(n, e, t, r = {}) {
      l(this, "relay");
      l(this, "storage");
      l(this, "neg");
      l(this, "filter");
      l(this, "subscription");
      l(this, "onhave");
      l(this, "onneed");
      this.relay = n, this.storage = e, this.neg = new Rs(e), this.onhave = r.onhave, this.onneed = r.onneed, this.filter = t, this.subscription = this.relay.prepareSubscription([{}], { label: r.label || "negentropy" }), this.subscription.oncustom = (i) => {
        var s, o, a, c;
        switch (i[0]) {
          case "NEG-MSG": {
            i.length < 3 && console.warn(`got invalid NEG-MSG from ${this.relay.url}: ${i}`);
            try {
              const u = this.neg.reconcile(i[2], this.onhave, this.onneed);
              u ? this.relay.send(`["NEG-MSG", "${this.subscription.id}", "${u}"]`) : (this.close(), (s = r.onclose) == null || s.call(r));
            } catch (u) {
              console.error("negentropy reconcile error:", u), (o = r == null ? void 0 : r.onclose) == null || o.call(r, `reconcile error: ${u}`);
            }
            break;
          }
          case "NEG-CLOSE": {
            const u = i[2];
            console.warn("negentropy error:", u), (a = r.onclose) == null || a.call(r, u);
            break;
          }
          case "NEG-ERR":
            (c = r.onclose) == null || c.call(r);
        }
      };
    }
    async start() {
      const n = this.neg.initiate();
      this.relay.send(`["NEG-OPEN","${this.subscription.id}",${JSON.stringify(this.filter)},"${n}"]`);
    }
    close() {
      this.relay.send(`["NEG-CLOSE","${this.subscription.id}"]`), this.subscription.close();
    }
  };
  var Gh = {};
  L(Gh, {
    getToken: () => Hh,
    hashPayload: () => pr,
    unpackEventFromToken: () => Ts,
    validateEvent: () => Gs,
    validateEventKind: () => Ls,
    validateEventMethodTag: () => $s,
    validateEventPayloadTag: () => Fs,
    validateEventTimestamp: () => _s,
    validateEventUrlTag: () => Us,
    validateToken: () => zh
  });
  var Bs = "Nostr ";
  async function Hh(n, e, t, r = false, i) {
    const s = {
      kind: tr,
      tags: [
        ["u", n],
        ["method", e]
      ],
      created_at: Math.round((/* @__PURE__ */ new Date()).getTime() / 1e3),
      content: ""
    };
    i && s.tags.push(["payload", pr(i)]);
    const o = await t(s);
    return (r ? Bs : "") + xe.encode(ve.encode(JSON.stringify(o)));
  }
  async function zh(n, e, t) {
    const r = await Ts(n).catch((s) => {
      throw s;
    });
    return await Gs(r, e, t).catch((s) => {
      throw s;
    });
  }
  async function Ts(n) {
    if (!n)
      throw new Error("Missing token");
    n = n.replace(Bs, "");
    const e = Ce.decode(xe.decode(n));
    if (!e || e.length === 0 || !e.startsWith("{"))
      throw new Error("Invalid token");
    return JSON.parse(e);
  }
  function _s(n) {
    return n.created_at ? Math.round((/* @__PURE__ */ new Date()).getTime() / 1e3) - n.created_at < 60 : false;
  }
  function Ls(n) {
    return n.kind === tr;
  }
  function Us(n, e) {
    const t = n.tags.find((r) => r[0] === "u");
    return t ? t.length > 0 && t[1] === e : false;
  }
  function $s(n, e) {
    const t = n.tags.find((r) => r[0] === "method");
    return t ? t.length > 0 && t[1].toLowerCase() === e.toLowerCase() : false;
  }
  function pr(n) {
    const e = ye(ve.encode(JSON.stringify(n)));
    return F(e);
  }
  function Fs(n, e) {
    const t = n.tags.find((i) => i[0] === "payload");
    if (!t)
      return false;
    const r = pr(e);
    return t.length > 0 && t[1] === r;
  }
  async function Gs(n, e, t, r) {
    if (!ut(n))
      throw new Error("Invalid nostr event, signature invalid");
    if (!Ls(n))
      throw new Error("Invalid nostr event, kind invalid");
    if (!_s(n))
      throw new Error("Invalid nostr event, created_at timestamp invalid");
    if (!Us(n, e))
      throw new Error("Invalid nostr event, url tag invalid");
    if (!$s(n, t))
      throw new Error("Invalid nostr event, method tag invalid");
    if (r && typeof r == "object" && Object.keys(r).length > 0 && !Fs(n, r))
      throw new Error("Invalid nostr event, payload tag does not match request body hash");
    return true;
  }
  var be = 1060;
  var kt = 30078;
  var Hs = 1059;
  var Lt = 30078;
  var Je = 14;
  var Mt = 10448;
  var Yd = Mt;
  var gr = 7;
  var vr = 15;
  var wr = 25;
  var Vr = 4;
  var Mn = "expiration";
  var zs = (n) => n instanceof Uint8Array;
  var yn = (n) => new DataView(n.buffer, n.byteOffset, n.byteLength);
  var Se = (n, e) => n << 32 - e | n >>> e;
  var qh = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68;
  if (!qh)
    throw new Error("Non little-endian hardware is not supported");
  var Vh = Array.from({ length: 256 }, (n, e) => e.toString(16).padStart(2, "0"));
  function ae(n) {
    if (!zs(n))
      throw new Error("Uint8Array expected");
    let e = "";
    for (let t = 0; t < n.length; t++)
      e += Vh[n[t]];
    return e;
  }
  function J(n) {
    if (typeof n != "string")
      throw new Error("hex string expected, got " + typeof n);
    const e = n.length;
    if (e % 2)
      throw new Error("padded hex string expected, got unpadded hex of length " + e);
    const t = new Uint8Array(e / 2);
    for (let r = 0; r < t.length; r++) {
      const i = r * 2, s = n.slice(i, i + 2), o = Number.parseInt(s, 16);
      if (Number.isNaN(o) || o < 0)
        throw new Error("Invalid byte sequence");
      t[r] = o;
    }
    return t;
  }
  function jh(n) {
    if (typeof n != "string")
      throw new Error(`utf8ToBytes expected string, got ${typeof n}`);
    return new Uint8Array(new TextEncoder().encode(n));
  }
  function gt(n) {
    if (typeof n == "string" && (n = jh(n)), !zs(n))
      throw new Error(`expected Uint8Array, got ${typeof n}`);
    return n;
  }
  var qs = class {
    // Safe version that clones internal state
    clone() {
      return this._cloneInto();
    }
  };
  function Vs(n) {
    const e = (r) => n().update(gt(r)).digest(), t = n();
    return e.outputLen = t.outputLen, e.blockLen = t.blockLen, e.create = () => n(), e;
  }
  function Cn(n) {
    if (!Number.isSafeInteger(n) || n < 0)
      throw new Error(`Wrong positive integer: ${n}`);
  }
  function Zh(n) {
    if (typeof n != "boolean")
      throw new Error(`Expected boolean, not ${n}`);
  }
  function js(n, ...e) {
    if (!(n instanceof Uint8Array))
      throw new Error("Expected Uint8Array");
    if (e.length > 0 && !e.includes(n.length))
      throw new Error(`Expected Uint8Array of length ${e}, not of length=${n.length}`);
  }
  function Jh(n) {
    if (typeof n != "function" || typeof n.create != "function")
      throw new Error("Hash should be wrapped by utils.wrapConstructor");
    Cn(n.outputLen), Cn(n.blockLen);
  }
  function Wh(n, e = true) {
    if (n.destroyed)
      throw new Error("Hash instance has been destroyed");
    if (e && n.finished)
      throw new Error("Hash#digest() has already been called");
  }
  function Yh(n, e) {
    js(n);
    const t = e.outputLen;
    if (n.length < t)
      throw new Error(`digestInto() expects output buffer of length at least ${t}`);
  }
  var ke = {
    number: Cn,
    bool: Zh,
    bytes: js,
    hash: Jh,
    exists: Wh,
    output: Yh
  };
  var Zs = class extends qs {
    constructor(e, t) {
      super(), this.finished = false, this.destroyed = false, ke.hash(e);
      const r = gt(t);
      if (this.iHash = e.create(), typeof this.iHash.update != "function")
        throw new Error("Expected instance of class which extends utils.Hash");
      this.blockLen = this.iHash.blockLen, this.outputLen = this.iHash.outputLen;
      const i = this.blockLen, s = new Uint8Array(i);
      s.set(r.length > i ? e.create().update(r).digest() : r);
      for (let o = 0; o < s.length; o++)
        s[o] ^= 54;
      this.iHash.update(s), this.oHash = e.create();
      for (let o = 0; o < s.length; o++)
        s[o] ^= 106;
      this.oHash.update(s), s.fill(0);
    }
    update(e) {
      return ke.exists(this), this.iHash.update(e), this;
    }
    digestInto(e) {
      ke.exists(this), ke.bytes(e, this.outputLen), this.finished = true, this.iHash.digestInto(e), this.oHash.update(e), this.oHash.digestInto(e), this.destroy();
    }
    digest() {
      const e = new Uint8Array(this.oHash.outputLen);
      return this.digestInto(e), e;
    }
    _cloneInto(e) {
      e || (e = Object.create(Object.getPrototypeOf(this), {}));
      const { oHash: t, iHash: r, finished: i, destroyed: s, blockLen: o, outputLen: a } = this;
      return e = e, e.finished = i, e.destroyed = s, e.blockLen = o, e.outputLen = a, e.oHash = t._cloneInto(e.oHash), e.iHash = r._cloneInto(e.iHash), e;
    }
    destroy() {
      this.destroyed = true, this.oHash.destroy(), this.iHash.destroy();
    }
  };
  var br = (n, e, t) => new Zs(n, e).update(t).digest();
  br.create = (n, e) => new Zs(n, e);
  function Xh(n, e, t) {
    return ke.hash(n), t === void 0 && (t = new Uint8Array(n.outputLen)), br(n, gt(t), gt(e));
  }
  var pn = new Uint8Array([0]);
  var jr = new Uint8Array();
  function Qh(n, e, t, r = 32) {
    if (ke.hash(n), ke.number(r), r > 255 * n.outputLen)
      throw new Error("Length should be <= 255*HashLen");
    const i = Math.ceil(r / n.outputLen);
    t === void 0 && (t = jr);
    const s = new Uint8Array(i * n.outputLen), o = br.create(n, e), a = o._cloneInto(), c = new Uint8Array(o.outputLen);
    for (let u = 0; u < i; u++)
      pn[0] = u + 1, a.update(u === 0 ? jr : c).update(t).update(pn).digestInto(c), s.set(c, n.outputLen * u), o._cloneInto(a);
    return o.destroy(), a.destroy(), c.fill(0), pn.fill(0), s.slice(0, r);
  }
  function ed(n, e, t, r) {
    if (typeof n.setBigUint64 == "function")
      return n.setBigUint64(e, t, r);
    const i = BigInt(32), s = BigInt(4294967295), o = Number(t >> i & s), a = Number(t & s), c = r ? 4 : 0, u = r ? 0 : 4;
    n.setUint32(e + c, o, r), n.setUint32(e + u, a, r);
  }
  var td = class extends qs {
    constructor(e, t, r, i) {
      super(), this.blockLen = e, this.outputLen = t, this.padOffset = r, this.isLE = i, this.finished = false, this.length = 0, this.pos = 0, this.destroyed = false, this.buffer = new Uint8Array(e), this.view = yn(this.buffer);
    }
    update(e) {
      ke.exists(this);
      const { view: t, buffer: r, blockLen: i } = this;
      e = gt(e);
      const s = e.length;
      for (let o = 0; o < s; ) {
        const a = Math.min(i - this.pos, s - o);
        if (a === i) {
          const c = yn(e);
          for (; i <= s - o; o += i)
            this.process(c, o);
          continue;
        }
        r.set(e.subarray(o, o + a), this.pos), this.pos += a, o += a, this.pos === i && (this.process(t, 0), this.pos = 0);
      }
      return this.length += e.length, this.roundClean(), this;
    }
    digestInto(e) {
      ke.exists(this), ke.output(e, this), this.finished = true;
      const { buffer: t, view: r, blockLen: i, isLE: s } = this;
      let { pos: o } = this;
      t[o++] = 128, this.buffer.subarray(o).fill(0), this.padOffset > i - o && (this.process(r, 0), o = 0);
      for (let d = o; d < i; d++)
        t[d] = 0;
      ed(r, i - 8, BigInt(this.length * 8), s), this.process(r, 0);
      const a = yn(e), c = this.outputLen;
      if (c % 4)
        throw new Error("_sha2: outputLen should be aligned to 32bit");
      const u = c / 4, h = this.get();
      if (u > h.length)
        throw new Error("_sha2: outputLen bigger than state");
      for (let d = 0; d < u; d++)
        a.setUint32(4 * d, h[d], s);
    }
    digest() {
      const { buffer: e, outputLen: t } = this;
      this.digestInto(e);
      const r = e.slice(0, t);
      return this.destroy(), r;
    }
    _cloneInto(e) {
      e || (e = new this.constructor()), e.set(...this.get());
      const { blockLen: t, buffer: r, length: i, finished: s, destroyed: o, pos: a } = this;
      return e.length = i, e.pos = a, e.finished = s, e.destroyed = o, i % t && e.buffer.set(r), e;
    }
  };
  var nd = (n, e, t) => n & e ^ ~n & t;
  var rd = (n, e, t) => n & e ^ n & t ^ e & t;
  var id = new Uint32Array([
    1116352408,
    1899447441,
    3049323471,
    3921009573,
    961987163,
    1508970993,
    2453635748,
    2870763221,
    3624381080,
    310598401,
    607225278,
    1426881987,
    1925078388,
    2162078206,
    2614888103,
    3248222580,
    3835390401,
    4022224774,
    264347078,
    604807628,
    770255983,
    1249150122,
    1555081692,
    1996064986,
    2554220882,
    2821834349,
    2952996808,
    3210313671,
    3336571891,
    3584528711,
    113926993,
    338241895,
    666307205,
    773529912,
    1294757372,
    1396182291,
    1695183700,
    1986661051,
    2177026350,
    2456956037,
    2730485921,
    2820302411,
    3259730800,
    3345764771,
    3516065817,
    3600352804,
    4094571909,
    275423344,
    430227734,
    506948616,
    659060556,
    883997877,
    958139571,
    1322822218,
    1537002063,
    1747873779,
    1955562222,
    2024104815,
    2227730452,
    2361852424,
    2428436474,
    2756734187,
    3204031479,
    3329325298
  ]);
  var Ne = new Uint32Array([
    1779033703,
    3144134277,
    1013904242,
    2773480762,
    1359893119,
    2600822924,
    528734635,
    1541459225
  ]);
  var Be = new Uint32Array(64);
  var Js = class extends td {
    constructor() {
      super(64, 32, 8, false), this.A = Ne[0] | 0, this.B = Ne[1] | 0, this.C = Ne[2] | 0, this.D = Ne[3] | 0, this.E = Ne[4] | 0, this.F = Ne[5] | 0, this.G = Ne[6] | 0, this.H = Ne[7] | 0;
    }
    get() {
      const { A: e, B: t, C: r, D: i, E: s, F: o, G: a, H: c } = this;
      return [e, t, r, i, s, o, a, c];
    }
    // prettier-ignore
    set(e, t, r, i, s, o, a, c) {
      this.A = e | 0, this.B = t | 0, this.C = r | 0, this.D = i | 0, this.E = s | 0, this.F = o | 0, this.G = a | 0, this.H = c | 0;
    }
    process(e, t) {
      for (let d = 0; d < 16; d++, t += 4)
        Be[d] = e.getUint32(t, false);
      for (let d = 16; d < 64; d++) {
        const y = Be[d - 15], f = Be[d - 2], p = Se(y, 7) ^ Se(y, 18) ^ y >>> 3, w = Se(f, 17) ^ Se(f, 19) ^ f >>> 10;
        Be[d] = w + Be[d - 7] + p + Be[d - 16] | 0;
      }
      let { A: r, B: i, C: s, D: o, E: a, F: c, G: u, H: h } = this;
      for (let d = 0; d < 64; d++) {
        const y = Se(a, 6) ^ Se(a, 11) ^ Se(a, 25), f = h + y + nd(a, c, u) + id[d] + Be[d] | 0, w = (Se(r, 2) ^ Se(r, 13) ^ Se(r, 22)) + rd(r, i, s) | 0;
        h = u, u = c, c = a, a = o + f | 0, o = s, s = i, i = r, r = f + w | 0;
      }
      r = r + this.A | 0, i = i + this.B | 0, s = s + this.C | 0, o = o + this.D | 0, a = a + this.E | 0, c = c + this.F | 0, u = u + this.G | 0, h = h + this.H | 0, this.set(r, i, s, o, a, c, u, h);
    }
    roundClean() {
      Be.fill(0);
    }
    destroy() {
      this.set(0, 0, 0, 0, 0, 0, 0, 0), this.buffer.fill(0);
    }
  };
  var sd = class extends Js {
    constructor() {
      super(), this.A = -1056596264, this.B = 914150663, this.C = 812702999, this.D = -150054599, this.E = -4191439, this.F = 1750603025, this.G = 1694076839, this.H = -1090891868, this.outputLen = 28;
    }
  };
  var Zr = Vs(() => new Js());
  Vs(() => new sd());
  var od = 1;
  function ad(n) {
    return JSON.stringify({
      version: od,
      rootKey: ae(n.rootKey),
      theirCurrentNostrPublicKey: n.theirCurrentNostrPublicKey,
      theirNextNostrPublicKey: n.theirNextNostrPublicKey,
      ourCurrentNostrKey: n.ourCurrentNostrKey ? {
        publicKey: n.ourCurrentNostrKey.publicKey,
        privateKey: ae(n.ourCurrentNostrKey.privateKey)
      } : void 0,
      ourNextNostrKey: {
        publicKey: n.ourNextNostrKey.publicKey,
        privateKey: ae(n.ourNextNostrKey.privateKey)
      },
      receivingChainKey: n.receivingChainKey ? ae(n.receivingChainKey) : void 0,
      sendingChainKey: n.sendingChainKey ? ae(n.sendingChainKey) : void 0,
      sendingChainMessageNumber: n.sendingChainMessageNumber,
      receivingChainMessageNumber: n.receivingChainMessageNumber,
      previousSendingChainMessageCount: n.previousSendingChainMessageCount,
      skippedKeys: Object.fromEntries(
        Object.entries(n.skippedKeys).map(([e, t]) => [
          e,
          {
            headerKeys: t.headerKeys.map((r) => ae(r)),
            messageKeys: Object.fromEntries(
              Object.entries(t.messageKeys).map(([r, i]) => [
                r,
                ae(i)
              ])
            )
          }
        ])
      )
    });
  }
  function cd(n) {
    const e = JSON.parse(n);
    if (!e.version) {
      const t = {};
      return e.skippedMessageKeys && Object.entries(e.skippedMessageKeys).forEach(([r, i]) => {
        var s;
        t[r] = {
          headerKeys: ((s = e.skippedHeaderKeys) == null ? void 0 : s[r]) || [],
          messageKeys: i
        };
      }), {
        rootKey: J(e.rootKey),
        theirCurrentNostrPublicKey: e.theirCurrentNostrPublicKey,
        theirNextNostrPublicKey: e.theirNextNostrPublicKey,
        ourCurrentNostrKey: e.ourCurrentNostrKey ? {
          publicKey: e.ourCurrentNostrKey.publicKey,
          privateKey: J(e.ourCurrentNostrKey.privateKey)
        } : void 0,
        ourNextNostrKey: {
          publicKey: e.ourNextNostrKey.publicKey,
          privateKey: J(e.ourNextNostrKey.privateKey)
        },
        receivingChainKey: e.receivingChainKey ? J(e.receivingChainKey) : void 0,
        sendingChainKey: e.sendingChainKey ? J(e.sendingChainKey) : void 0,
        sendingChainMessageNumber: e.sendingChainMessageNumber,
        receivingChainMessageNumber: e.receivingChainMessageNumber,
        previousSendingChainMessageCount: e.previousSendingChainMessageCount,
        skippedKeys: t
      };
    }
    return {
      rootKey: J(e.rootKey),
      theirCurrentNostrPublicKey: e.theirCurrentNostrPublicKey,
      theirNextNostrPublicKey: e.theirNextNostrPublicKey,
      ourCurrentNostrKey: e.ourCurrentNostrKey ? {
        publicKey: e.ourCurrentNostrKey.publicKey,
        privateKey: J(e.ourCurrentNostrKey.privateKey)
      } : void 0,
      ourNextNostrKey: {
        publicKey: e.ourNextNostrKey.publicKey,
        privateKey: J(e.ourNextNostrKey.privateKey)
      },
      receivingChainKey: e.receivingChainKey ? J(e.receivingChainKey) : void 0,
      sendingChainKey: e.sendingChainKey ? J(e.sendingChainKey) : void 0,
      sendingChainMessageNumber: e.sendingChainMessageNumber,
      receivingChainMessageNumber: e.receivingChainMessageNumber,
      previousSendingChainMessageCount: e.previousSendingChainMessageCount,
      skippedKeys: Object.fromEntries(
        Object.entries(e.skippedKeys || {}).map(([t, r]) => [
          t,
          {
            headerKeys: r.headerKeys.map((i) => J(i)),
            messageKeys: Object.fromEntries(
              Object.entries(r.messageKeys).map(([i, s]) => [
                i,
                J(s)
              ])
            )
          }
        ])
      )
    };
  }
  function ud(n) {
    return {
      rootKey: new Uint8Array(n.rootKey),
      theirCurrentNostrPublicKey: n.theirCurrentNostrPublicKey,
      theirNextNostrPublicKey: n.theirNextNostrPublicKey,
      ourCurrentNostrKey: n.ourCurrentNostrKey ? {
        publicKey: n.ourCurrentNostrKey.publicKey,
        privateKey: new Uint8Array(n.ourCurrentNostrKey.privateKey)
      } : void 0,
      ourNextNostrKey: {
        publicKey: n.ourNextNostrKey.publicKey,
        privateKey: new Uint8Array(n.ourNextNostrKey.privateKey)
      },
      receivingChainKey: n.receivingChainKey ? new Uint8Array(n.receivingChainKey) : void 0,
      sendingChainKey: n.sendingChainKey ? new Uint8Array(n.sendingChainKey) : void 0,
      sendingChainMessageNumber: n.sendingChainMessageNumber,
      receivingChainMessageNumber: n.receivingChainMessageNumber,
      previousSendingChainMessageCount: n.previousSendingChainMessageCount,
      skippedKeys: Object.fromEntries(
        Object.entries(n.skippedKeys).map(([e, t]) => [
          e,
          {
            headerKeys: t.headerKeys.map((r) => new Uint8Array(r)),
            messageKeys: Object.fromEntries(
              Object.entries(t.messageKeys).map(([r, i]) => [r, new Uint8Array(i)])
            )
          }
        ])
      )
    };
  }
  async function* Xd(n) {
    const e = [];
    let t = null;
    const r = n.onEvent((i) => {
      t ? (t(i), t = null) : e.push(i);
    });
    try {
      for (; ; )
        e.length > 0 ? yield e.shift() : yield new Promise((i) => {
          t = i;
        });
    } finally {
      r();
    }
  }
  function He(n, e = new Uint8Array(32), t = 1) {
    const r = Xh(Zr, n, e), i = [];
    for (let s = 1; s <= t; s++)
      i.push(Qh(Zr, r, new Uint8Array([s]), 32));
    return i;
  }
  function Qd(n) {
    var t;
    const e = (t = n.tags) == null ? void 0 : t.find((r) => r[0] === "ms");
    return e ? parseInt(e[1]) : n.created_at * 1e3;
  }
  function On(n, e) {
    if (typeof n != "number" || !Number.isFinite(n))
      throw new Error(`${e} must be a finite number (unix seconds)`);
    if (!Number.isSafeInteger(n))
      throw new Error(`${e} must be an integer (unix seconds)`);
    if (n < 0)
      throw new Error(`${e} must be >= 0`);
    return n;
  }
  function Dn(n, e) {
    if (!n) return;
    const t = n.expiresAt !== void 0, r = n.ttlSeconds !== void 0;
    if (t && r)
      throw new Error("Provide either expiresAt or ttlSeconds, not both");
    if (t)
      return On(n.expiresAt, "expiresAt");
    if (r) {
      const i = On(n.ttlSeconds, "ttlSeconds");
      return e + i;
    }
  }
  function Ws(n, e) {
    var r;
    const t = On(e, "expiresAt");
    for (let i = n.length - 1; i >= 0; i--)
      ((r = n[i]) == null ? void 0 : r[0]) === Mn && n.splice(i, 1);
    n.push([Mn, String(t)]);
  }
  function hd(n) {
    var r;
    const e = (r = n.tags) == null ? void 0 : r.find((i) => i[0] === Mn);
    if (!e) return;
    const t = Number(e[1]);
    if (Number.isFinite(t) && !(!Number.isSafeInteger(t) || t < 0))
      return t;
  }
  function el(n, e) {
    const t = hd(n);
    return t !== void 0 && t <= e;
  }
  function tl(n) {
    var t, r;
    return n.kind !== gr ? null : { type: "reaction", messageId: ((r = (t = n.tags) == null ? void 0 : t.find((i) => i[0] === "e")) == null ? void 0 : r[1]) || "", emoji: n.content };
  }
  function nl(n) {
    return n.kind === gr;
  }
  var Jr = {
    delivered: 1,
    seen: 2
  };
  function dd(n) {
    return n === "delivered" || n === "seen";
  }
  function rl(n, e) {
    const t = n ? Jr[n] ?? 0 : 0;
    return (Jr[e] ?? 0) > t;
  }
  function il(n) {
    var t;
    if (n.kind !== vr || !dd(n.content)) return null;
    const e = ((t = n.tags) == null ? void 0 : t.filter((r) => r[0] === "e").map((r) => r[1])) || [];
    return e.length === 0 ? null : {
      type: n.content,
      messageIds: e
    };
  }
  function sl(n) {
    return n.kind === wr;
  }
  var ld = 1e3;
  var fd = "0000000000000000000000000000000000000000000000000000000000000000";
  var Wt = class _Wt {
    // 1. CHANNEL PUBLIC INTERFACE
    constructor(e, t) {
      l(this, "skippedSubscription");
      l(this, "nostrUnsubscribe");
      l(this, "nostrNextUnsubscribe");
      l(this, "internalSubscriptions", /* @__PURE__ */ new Map());
      l(this, "currentInternalSubscriptionId", 0);
      l(this, "name");
      this.nostrSubscribe = e, this.state = t, this.name = Math.random().toString(36).substring(2, 6);
    }
    /**
     * Initializes a new secure communication session
     * @param nostrSubscribe Function to subscribe to Nostr events. Make sure it deduplicates events (doesn't return the same event twice), otherwise you'll see decryption errors!
     * @param theirEphemeralNostrPublicKey The ephemeral public key of the other party for the initial handshake
     * @param ourEphemeralNostrPrivateKey Our ephemeral private key for the initial handshake
     * @param isInitiator Whether we are initiating the conversation (true) or responding (false)
     * @param sharedSecret Initial shared secret for securing the first message chain
     * @param name Optional name for the session (for debugging)
     * @returns A new Session instance
     */
    static init(e, t, r, i, s, o) {
      const a = me();
      let c, u, h, d;
      i ? ([c, u] = He(s, z.getConversationKey(a, t), 2), h = {
        publicKey: ie(r),
        privateKey: r
      }, d = {
        publicKey: ie(a),
        privateKey: a
      }) : (c = s, u = void 0, h = void 0, d = {
        publicKey: ie(r),
        privateKey: r
      });
      const y = {
        rootKey: c,
        theirNextNostrPublicKey: t,
        ourCurrentNostrKey: h,
        ourNextNostrKey: d,
        receivingChainKey: void 0,
        sendingChainKey: u,
        sendingChainMessageNumber: 0,
        receivingChainMessageNumber: 0,
        previousSendingChainMessageCount: 0,
        skippedKeys: {}
      }, f = new _Wt(e, y);
      return o && (f.name = o), f;
    }
    /**
     * Sends a text message through the encrypted session.
     * Sent in a Nostr event with the kind CHAT_MESSAGE_KIND.
     * @param text The plaintext message to send
     * @param options Optional expiration options for disappearing messages
     * @returns A verified Nostr event containing the encrypted message. You need to publish this event to the Nostr network.
     * @throws Error if we are not the initiator and trying to send the first message
     */
    send(e, t = {}) {
      return this.sendEvent({
        content: e,
        kind: Je
      }, t);
    }
    /**
     * Sends a reply to a specific message through the encrypted session.
     * @param text The reply text content
     * @param replyTo The ID of the message being replied to
     * @param options Optional expiration options for disappearing messages
     * @returns A verified Nostr event containing the encrypted reply. You need to publish this event to the Nostr network.
     * @throws Error if we are not the initiator and trying to send the first message
     */
    sendReply(e, t, r = {}) {
      return this.sendEvent({
        content: e,
        kind: Je,
        tags: [["e", t]]
      }, r);
    }
    /**
     * Sends a reaction to a message through the encrypted session.
     * @param messageId The ID of the message being reacted to
     * @param emoji The emoji or reaction content (e.g., "👍", "❤️", "+1")
     * @param options Optional expiration options for disappearing messages
     * @returns A verified Nostr event containing the encrypted reaction. You need to publish this event to the Nostr network.
     * @throws Error if we are not the initiator and trying to send the first message
     */
    sendReaction(e, t, r = {}) {
      return this.sendEvent({
        content: t,
        kind: gr,
        tags: [["e", e]]
      }, r);
    }
    /**
     * Sends a typing indicator through the encrypted session.
     * @param options Optional expiration options for disappearing messages
     * @returns A verified Nostr event containing the encrypted typing indicator. You need to publish this event to the Nostr network.
     */
    sendTyping(e = {}) {
      return this.sendEvent({
        content: "typing",
        kind: wr
      }, e);
    }
    /**
     * Sends a delivery/read receipt through the encrypted session.
     * @param receiptType Either "delivered" or "seen"
     * @param messageIds The IDs of the messages being acknowledged
     * @param options Optional expiration options for disappearing messages
     * @returns A verified Nostr event containing the encrypted receipt. You need to publish this event to the Nostr network.
     */
    sendReceipt(e, t, r = {}) {
      return this.sendEvent({
        content: e,
        kind: vr,
        tags: t.map((i) => ["e", i])
      }, r);
    }
    /**
     * Send a partial Nostr event through the encrypted session.
     * In addition to chat messages, it could be files, webrtc negotiation or many other types of messages.
     * @param event Partial Nostr event to send. Must be unsigned. Id and will be generated if not provided.
     * @param options Optional expiration options for disappearing messages
     * @returns A verified Nostr event containing the encrypted message. You need to publish this event to the Nostr network.
     * @throws Error if we are not the initiator and trying to send the first message
     */
    sendEvent(e, t = {}) {
      if (!this.state.theirNextNostrPublicKey || !this.state.ourCurrentNostrKey)
        throw new Error("we are not the initiator, so we can't send the first message");
      if ("sig" in e)
        throw new Error("Event must be unsigned " + JSON.stringify(e));
      const r = Date.now(), i = {
        ...e,
        content: e.content || "",
        kind: e.kind || be,
        created_at: e.created_at || Math.floor(r / 1e3),
        tags: e.tags || [],
        pubkey: e.pubkey || fd
      };
      i.tags.some(([d]) => d === "ms") || i.tags.push(["ms", String(r)]);
      const s = Dn(t, Math.floor(r / 1e3));
      s !== void 0 && Ws(i.tags, s), i.id = ge(i);
      const [o, a] = this.ratchetEncrypt(JSON.stringify(i)), c = z.getConversationKey(this.state.ourCurrentNostrKey.privateKey, this.state.theirNextNostrPublicKey), u = z.encrypt(JSON.stringify(o), c);
      return { event: oe({
        content: a,
        kind: be,
        tags: [["header", u]],
        created_at: Math.floor(r / 1e3)
      }, this.state.ourCurrentNostrKey.privateKey), innerEvent: i };
    }
    /**
     * Subscribes to incoming messages on this session
     * @param callback Function to be called when a message is received
     * @returns Unsubscribe function to stop receiving messages
     */
    onEvent(e) {
      const t = this.currentInternalSubscriptionId++;
      return this.internalSubscriptions.set(t, e), this.subscribeToNostrEvents(), () => this.internalSubscriptions.delete(t);
    }
    /**
     * Stop listening to incoming messages
     */
    close() {
      var e, t, r;
      (e = this.nostrUnsubscribe) == null || e.call(this), (t = this.nostrNextUnsubscribe) == null || t.call(this), (r = this.skippedSubscription) == null || r.call(this), this.internalSubscriptions.clear();
    }
    // 2. RATCHET FUNCTIONS
    ratchetEncrypt(e) {
      const [t, r] = He(this.state.sendingChainKey, new Uint8Array([1]), 2);
      return this.state.sendingChainKey = t, [{
        number: this.state.sendingChainMessageNumber++,
        nextPublicKey: this.state.ourNextNostrKey.publicKey,
        previousChainLength: this.state.previousSendingChainMessageCount
      }, z.encrypt(e, r)];
    }
    ratchetDecrypt(e, t, r) {
      const i = this.trySkippedMessageKeys(e, t, r);
      if (i) return i;
      this.skipMessageKeys(e.number, r);
      const [s, o] = He(this.state.receivingChainKey, new Uint8Array([1]), 2);
      return this.state.receivingChainKey = s, this.state.receivingChainMessageNumber++, z.decrypt(t, o);
    }
    ratchetStep() {
      this.state.previousSendingChainMessageCount = this.state.sendingChainMessageNumber, this.state.sendingChainMessageNumber = 0, this.state.receivingChainMessageNumber = 0;
      const e = z.getConversationKey(this.state.ourNextNostrKey.privateKey, this.state.theirNextNostrPublicKey), [t, r] = He(this.state.rootKey, e, 2);
      this.state.receivingChainKey = r, this.state.ourCurrentNostrKey = this.state.ourNextNostrKey;
      const i = me();
      this.state.ourNextNostrKey = {
        publicKey: ie(i),
        privateKey: i
      };
      const s = z.getConversationKey(this.state.ourNextNostrKey.privateKey, this.state.theirNextNostrPublicKey), [o, a] = He(t, s, 2);
      this.state.rootKey = o, this.state.sendingChainKey = a;
    }
    // 3. MESSAGE KEY FUNCTIONS
    skipMessageKeys(e, t) {
      if (!(e <= this.state.receivingChainMessageNumber)) {
        if (e > this.state.receivingChainMessageNumber + ld)
          throw new Error("Too many skipped messages");
        if (!this.state.skippedKeys[t]) {
          if (this.state.skippedKeys[t] = {
            headerKeys: [],
            messageKeys: {}
          }, this.state.ourCurrentNostrKey) {
            const i = z.getConversationKey(this.state.ourCurrentNostrKey.privateKey, t);
            this.state.skippedKeys[t].headerKeys.includes(i) || this.state.skippedKeys[t].headerKeys.push(i);
          }
          const r = z.getConversationKey(this.state.ourNextNostrKey.privateKey, t);
          this.state.skippedKeys[t].headerKeys.includes(r) || this.state.skippedKeys[t].headerKeys.push(r);
        }
        for (; this.state.receivingChainMessageNumber < e; ) {
          const [r, i] = He(this.state.receivingChainKey, new Uint8Array([1]), 2);
          this.state.receivingChainKey = r, this.state.skippedKeys[t].messageKeys[this.state.receivingChainMessageNumber] = i, this.state.receivingChainMessageNumber++;
        }
      }
    }
    trySkippedMessageKeys(e, t, r) {
      const i = this.state.skippedKeys[r];
      if (!i) return null;
      const s = i.messageKeys[e.number];
      return s ? (delete i.messageKeys[e.number], Object.keys(i.messageKeys).length === 0 && delete this.state.skippedKeys[r], z.decrypt(t, s)) : null;
    }
    // 4. NOSTR EVENT HANDLING
    decryptHeader(e) {
      const t = e.tags[0][1];
      if (this.state.ourCurrentNostrKey) {
        const s = z.getConversationKey(this.state.ourCurrentNostrKey.privateKey, e.pubkey);
        try {
          return [JSON.parse(z.decrypt(t, s)), false, false];
        } catch {
        }
      }
      const r = z.getConversationKey(this.state.ourNextNostrKey.privateKey, e.pubkey);
      try {
        return [JSON.parse(z.decrypt(t, r)), true, false];
      } catch {
      }
      const i = this.state.skippedKeys[e.pubkey];
      if (i != null && i.headerKeys)
        for (const s of i.headerKeys)
          try {
            return [JSON.parse(z.decrypt(t, s)), false, true];
          } catch {
          }
      throw new Error("Failed to decrypt header with current and skipped header keys");
    }
    handleNostrEvent(e) {
      var i, s;
      const t = ud(this.state);
      let r = false;
      try {
        const [o, a, c] = this.decryptHeader(e);
        if (!c && this.state.theirNextNostrPublicKey !== o.nextPublicKey && (this.state.theirCurrentNostrPublicKey = this.state.theirNextNostrPublicKey, this.state.theirNextNostrPublicKey = o.nextPublicKey, r = true), !c)
          a && (this.skipMessageKeys(o.previousChainLength, e.pubkey), this.ratchetStep());
        else if (!((i = this.state.skippedKeys[e.pubkey]) != null && i.messageKeys[o.number]))
          return;
        const u = this.ratchetDecrypt(o, e.content, e.pubkey), h = JSON.parse(u);
        if (!zt(h)) {
          this.state = t;
          return;
        }
        h.id = ge(h), r && ((s = this.nostrUnsubscribe) == null || s.call(this), this.nostrUnsubscribe = this.nostrNextUnsubscribe, this.nostrNextUnsubscribe = this.nostrSubscribe(
          { authors: [this.state.theirNextNostrPublicKey], kinds: [be] },
          (d) => this.handleNostrEvent(d)
        )), this.internalSubscriptions.forEach((d) => d(h, e));
      } catch (o) {
        if (this.state = t, o instanceof Error && (o.message.includes("Failed to decrypt header") || o.message === "invalid MAC"))
          return;
        throw o;
      }
    }
    subscribeToNostrEvents() {
      if (this.nostrNextUnsubscribe) return;
      this.nostrNextUnsubscribe = this.nostrSubscribe(
        { authors: [this.state.theirNextNostrPublicKey], kinds: [be] },
        (t) => this.handleNostrEvent(t)
      ), this.state.theirCurrentNostrPublicKey && (this.nostrUnsubscribe = this.nostrSubscribe(
        { authors: [this.state.theirCurrentNostrPublicKey], kinds: [be] },
        (t) => this.handleNostrEvent(t)
      ));
      const e = Object.keys(this.state.skippedKeys);
      e.length && (this.skippedSubscription = this.nostrSubscribe(
        { authors: e, kinds: [be] },
        (t) => this.handleNostrEvent(t)
      ));
    }
  };
  var yd = new TextDecoder("utf-8");
  var Ys = new TextEncoder();
  var Xs = 1;
  var Qs = 65535;
  function vt(n, e) {
    const t = Gt.getSharedSecret(n, H("02" + e)).subarray(1, 33);
    return Wi(ye, t, Ys.encode("nip44-v2"));
  }
  function eo(n, e) {
    const t = Yi(ye, n, e, 76);
    return {
      chacha_key: t.subarray(0, 32),
      chacha_nonce: t.subarray(32, 44),
      hmac_key: t.subarray(44, 76)
    };
  }
  function mr(n) {
    if (!Number.isSafeInteger(n) || n < 1)
      throw new Error("expected positive integer");
    if (n <= 32)
      return 32;
    const e = 1 << Math.floor(Math.log2(n - 1)) + 1, t = e <= 256 ? 32 : e / 8;
    return t * (Math.floor((n - 1) / t) + 1);
  }
  function pd(n) {
    if (!Number.isSafeInteger(n) || n < Xs || n > Qs)
      throw new Error("invalid plaintext size: must be between 1 and 65535 bytes");
    const e = new Uint8Array(2);
    return new DataView(e.buffer).setUint16(0, n, false), e;
  }
  function gd(n) {
    const e = Ys.encode(n), t = e.length, r = pd(t), i = new Uint8Array(mr(t) - t);
    return ee(r, e, i);
  }
  function vd(n) {
    const e = new DataView(n.buffer).getUint16(0), t = n.subarray(2, 2 + e);
    if (e < Xs || e > Qs || t.length !== e || n.length !== 2 + mr(e))
      throw new Error("invalid padding");
    return yd.decode(t);
  }
  function to(n, e, t) {
    if (t.length !== 32)
      throw new Error("AAD associated data must be 32 bytes");
    const r = ee(t, e);
    return ct(ye, n, r);
  }
  function wd(n) {
    if (typeof n != "string")
      throw new Error("payload must be a valid string");
    const e = n.length;
    if (e < 132 || e > 87472)
      throw new Error("invalid payload length: " + e);
    if (n[0] === "#")
      throw new Error("unknown encryption version");
    let t;
    try {
      t = xe.decode(n);
    } catch (s) {
      throw new Error("invalid base64: " + s.message);
    }
    const r = t.length;
    if (r < 99 || r > 65603)
      throw new Error("invalid data length: " + r);
    const i = t[0];
    if (i !== 2)
      throw new Error("unknown encryption version " + i);
    return {
      nonce: t.subarray(1, 33),
      ciphertext: t.subarray(33, -32),
      mac: t.subarray(-32)
    };
  }
  function bd(n, e, t = We(32)) {
    const { chacha_key: r, chacha_nonce: i, hmac_key: s } = eo(e, t), o = gd(n), a = Ht(r, i, o), c = to(s, a, t);
    return xe.encode(ee(new Uint8Array([2]), t, a, c));
  }
  function md(n, e) {
    const { nonce: t, ciphertext: r, mac: i } = wd(n), { chacha_key: s, chacha_nonce: o, hmac_key: a } = eo(e, t), c = to(a, r, t);
    if (!Gi(c, i))
      throw new Error("invalid MAC");
    const u = Ht(s, o, r);
    return vd(u);
  }
  var Oe = {
    utils: {
      getConversationKey: vt,
      calcPaddedLen: mr
    },
    encrypt: bd,
    decrypt: md
  };
  function Wr() {
    const n = me();
    return { publicKey: ie(n), privateKey: n };
  }
  function Ed() {
    return ae(me());
  }
  function ol() {
    return ae(me()).slice(0, 16);
  }
  var Sd = 2880 * 60;
  var no = () => Math.round(Date.now() / 1e3);
  var Kd = () => Math.round(no() - Math.random() * Sd);
  async function kd(n) {
    const {
      inviteeSessionPublicKey: e,
      inviteePublicKey: t,
      inviteePrivateKey: r,
      inviterPublicKey: i,
      inviterEphemeralPublicKey: s,
      sharedSecret: o,
      ownerPublicKey: a,
      encrypt: c
    } = n, u = J(o), h = c ?? (async (P, N) => {
      if (!r)
        throw new Error("inviteePrivateKey is required when encrypt function is not provided");
      return z.encrypt(P, vt(r, N));
    }), d = JSON.stringify({
      sessionKey: e,
      ...a && { ownerPublicKey: a }
    }), y = await h(d, i), f = {
      pubkey: t,
      content: z.encrypt(y, u),
      created_at: no()
    }, p = me(), w = ie(p), b = JSON.stringify(f), m = {
      kind: Hs,
      pubkey: w,
      content: z.encrypt(b, vt(p, s)),
      created_at: Kd(),
      tags: [["p", s]]
    };
    return {
      innerEvent: f,
      envelope: m,
      randomSenderPublicKey: w,
      randomSenderPrivateKey: p
    };
  }
  async function ro(n) {
    const {
      envelopeContent: e,
      envelopeSenderPubkey: t,
      inviterEphemeralPrivateKey: r,
      inviterPrivateKey: i,
      sharedSecret: s,
      decrypt: o
    } = n, a = J(s), c = z.decrypt(
      e,
      vt(r, t)
    ), u = JSON.parse(c), h = u.pubkey, d = z.decrypt(u.content, a), f = await (o ?? (async (b, m) => {
      if (!i)
        throw new Error("inviterPrivateKey is required when decrypt function is not provided");
      return z.decrypt(b, vt(i, m));
    }))(d, h);
    let p, w;
    try {
      const b = JSON.parse(f);
      p = b.sessionKey, w = b.ownerPublicKey;
    } catch {
      p = f;
    }
    return {
      inviteeIdentity: h,
      inviteeSessionPublicKey: p,
      ownerPublicKey: w
    };
  }
  function Rn(n) {
    const {
      nostrSubscribe: e,
      theirPublicKey: t,
      ourSessionPrivateKey: r,
      sharedSecret: i,
      isSender: s,
      name: o
    } = n, a = J(i);
    return Wt.init(e, t, r, s, a, o);
  }
  var gn = () => Math.round(Date.now() / 1e3);
  var xd = "double-ratchet/invites/public";
  function Pd(n) {
    var e;
    return (e = n.tags.find(([t]) => t === "d")) == null ? void 0 : e[1];
  }
  function Yr(n) {
    return Pd(n) === xd;
  }
  var fe = class _fe {
    constructor(e, t, r, i, s, o, a = [], c = gn(), u, h) {
      this.inviterEphemeralPublicKey = e, this.sharedSecret = t, this.inviter = r, this.inviterEphemeralPrivateKey = i, this.deviceId = s, this.maxUses = o, this.usedBy = a, this.createdAt = c, this.purpose = u, this.ownerPubkey = h;
    }
    static createNew(e, t, r, i) {
      if (!e)
        throw new Error("Inviter public key is required");
      const s = Wr(), o = Ed();
      return new _fe(
        s.publicKey,
        o,
        e,
        s.privateKey,
        t,
        r,
        [],
        gn(),
        i == null ? void 0 : i.purpose,
        i == null ? void 0 : i.ownerPubkey
      );
    }
    static fromUrl(e) {
      const r = new URL(e).hash.slice(1);
      if (!r)
        throw new Error("No invite data found in the URL hash.");
      const i = decodeURIComponent(r);
      let s;
      try {
        s = JSON.parse(i);
      } catch (w) {
        throw new Error("Invite data in URL hash is not valid JSON: " + w);
      }
      const {
        inviter: o,
        ephemeralKey: a,
        inviterEphemeralPublicKey: c,
        sharedSecret: u,
        purpose: h,
        owner: d,
        ownerPubkey: y
      } = s, f = a || c;
      if (!o || !f || !u)
        throw new Error("Missing required fields (inviter, ephemeralKey, sharedSecret) in invite data.");
      const p = d || y;
      return new _fe(
        f,
        u,
        o,
        void 0,
        void 0,
        void 0,
        [],
        gn(),
        h === "link" || h === "chat" ? h : void 0,
        p && /^[0-9a-fA-F]{64}$/.test(p) ? p : void 0
      );
    }
    static deserialize(e) {
      const t = JSON.parse(e);
      return new _fe(
        t.inviterEphemeralPublicKey,
        t.sharedSecret,
        t.inviter,
        t.inviterEphemeralPrivateKey ? new Uint8Array(t.inviterEphemeralPrivateKey) : void 0,
        t.deviceId,
        t.maxUses,
        t.usedBy,
        t.createdAt,
        t.purpose,
        t.ownerPubkey
      );
    }
    static fromEvent(e) {
      var u, h, d, y;
      if (!e.sig)
        throw new Error("Event is not signed");
      if (!ut(e))
        throw new Error("Event signature is invalid");
      const { tags: t } = e;
      if (!t)
        throw new Error("Invalid invite event: missing tags");
      const r = (u = t.find(([f]) => f === "ephemeralKey")) == null ? void 0 : u[1], i = (h = t.find(([f]) => f === "sharedSecret")) == null ? void 0 : h[1], s = e.pubkey, o = (d = t.find(([f]) => f === "d")) == null ? void 0 : d[1], a = (y = o == null ? void 0 : o.split("/")) == null ? void 0 : y[2], c = a === "public" ? void 0 : a;
      if (!r || !i)
        throw new Error("Invalid invite event: missing session key or sharedSecret");
      return new _fe(
        r,
        i,
        s,
        void 0,
        // inviterEphemeralPrivateKey not available when parsing from event
        c
      );
    }
    static fromUser(e, t, r) {
      const i = {
        kinds: [kt],
        authors: [e],
        "#l": ["double-ratchet/invites"]
      }, s = /* @__PURE__ */ new Set();
      let o = null, a = null, c = null, u = null;
      const h = () => o ?? a, d = () => {
        u && clearTimeout(u), u = setTimeout(() => {
          u = null;
          const f = h();
          !f || f.eventId === c || (c = f.eventId, r(f.invite));
        }, 100);
      }, y = t(i, (f) => {
        if (f.pubkey === e && !s.has(f.id)) {
          s.add(f.id);
          try {
            const w = {
              invite: _fe.fromEvent(f),
              createdAt: f.created_at,
              eventId: f.id
            };
            Yr(f) ? (!o || f.created_at >= o.createdAt) && (o = w) : (!a || f.created_at >= a.createdAt) && (a = w), d();
          } catch {
          }
        }
      });
      return () => {
        u && (clearTimeout(u), u = null), y();
      };
    }
    static waitFor(e, t, r = 500) {
      return new Promise((i) => {
        let s = null, o = null;
        const a = () => (s == null ? void 0 : s.invite) ?? (o == null ? void 0 : o.invite) ?? null, c = setTimeout(() => {
          u(), i(a());
        }, r), u = t(
          {
            kinds: [kt],
            authors: [e],
            "#l": ["double-ratchet/invites"]
          },
          (h) => {
            if (h.pubkey === e) {
              try {
                const d = _fe.fromEvent(h);
                Yr(h) ? (!s || h.created_at >= s.createdAt) && (s = { invite: d, createdAt: h.created_at }) : (!o || h.created_at >= o.createdAt) && (o = { invite: d, createdAt: h.created_at });
              } catch {
              }
              clearTimeout(c), setTimeout(() => {
                u(), i(a());
              }, 100);
            }
          }
        );
      });
    }
    /**
     * Save Invite as JSON. Includes the inviter's session private key, so don't share this.
     */
    serialize() {
      return JSON.stringify({
        inviterEphemeralPublicKey: this.inviterEphemeralPublicKey,
        sharedSecret: this.sharedSecret,
        inviter: this.inviter,
        inviterEphemeralPrivateKey: this.inviterEphemeralPrivateKey ? Array.from(this.inviterEphemeralPrivateKey) : void 0,
        deviceId: this.deviceId,
        maxUses: this.maxUses,
        usedBy: this.usedBy,
        createdAt: this.createdAt,
        purpose: this.purpose,
        ownerPubkey: this.ownerPubkey
      });
    }
    /**
     * Invite parameters are in the URL's hash so they are not sent to the server.
     */
    getUrl(e = "https://chat.iris.to") {
      const t = {
        inviter: this.inviter,
        ephemeralKey: this.inviterEphemeralPublicKey,
        sharedSecret: this.sharedSecret,
        ...this.purpose ? { purpose: this.purpose } : {},
        ...this.ownerPubkey ? { owner: this.ownerPubkey } : {}
      }, r = new URL(e);
      return r.hash = encodeURIComponent(JSON.stringify(t)), r.toString();
    }
    getEvent() {
      if (!this.deviceId)
        throw new Error("Device ID is required");
      return {
        kind: kt,
        pubkey: this.inviter,
        content: "",
        created_at: this.createdAt,
        tags: [
          ["ephemeralKey", this.inviterEphemeralPublicKey],
          ["sharedSecret", this.sharedSecret],
          ["d", "double-ratchet/invites/" + this.deviceId],
          ["l", "double-ratchet/invites"]
        ]
      };
    }
    /**
     * Creates a tombstone event that replaces the invite, signaling device revocation.
     * The tombstone has the same d-tag but no keys, making it invalid as an invite.
     */
    getDeletionEvent() {
      if (!this.deviceId)
        throw new Error("Device ID is required");
      return {
        kind: kt,
        pubkey: this.inviter,
        content: "",
        created_at: Math.floor(Date.now() / 1e3),
        tags: [
          ["d", "double-ratchet/invites/" + this.deviceId],
          ["l", "double-ratchet/invites"]
        ]
      };
    }
    /**
         * Called by the invitee. Accepts the invite and creates a new session with the inviter.
         *
         * @param nostrSubscribe - A function to subscribe to Nostr events
         * @param inviteePublicKey - The invitee's identity public key (also serves as device ID)
         * @param encryptor - The invitee's secret key or a signing/encrypt function
         * @param ownerPublicKey - The invitee's owner/Nostr identity public key (optional for single-device users)
         * @returns An object containing the new session and an event to be published
         *
         * 1. Inner event: No signature, content encrypted with DH(inviter, invitee).
         *    Purpose: Authenticate invitee. Contains invitee session key and ownerPublicKey.
         * 2. Envelope: No signature, content encrypted with DH(inviter, random key).
         *    Purpose: Contains inner event. Hides invitee from others who might have the shared Nostr key.
    
         * Note: You need to publish the returned event on Nostr using NDK or another Nostr system of your choice,
         * so the inviter can create the session on their side.
         */
    async accept(e, t, r, i) {
      const s = Wr(), o = this.inviter || this.inviterEphemeralPublicKey, a = Rn({
        nostrSubscribe: e,
        theirPublicKey: this.inviterEphemeralPublicKey,
        ourSessionPrivateKey: s.privateKey,
        sharedSecret: this.sharedSecret,
        isSender: true
      }), c = typeof r == "function" ? r : void 0, u = typeof r == "function" ? void 0 : r, h = await kd({
        inviteeSessionPublicKey: s.publicKey,
        inviteePublicKey: t,
        inviteePrivateKey: u,
        inviterPublicKey: o,
        inviterEphemeralPublicKey: this.inviterEphemeralPublicKey,
        sharedSecret: this.sharedSecret,
        ownerPublicKey: i,
        encrypt: c
      });
      return { session: a, event: oe(h.envelope, h.randomSenderPrivateKey) };
    }
    listen(e, t, r) {
      if (!this.inviterEphemeralPrivateKey)
        throw new Error("Inviter session key is not available");
      const i = /* @__PURE__ */ new Set(), s = {
        kinds: [Hs],
        "#p": [this.inviterEphemeralPublicKey]
      };
      return t(s, async (o) => {
        try {
          if (i.has(o.id) || (i.add(o.id), this.maxUses && this.usedBy.length >= this.maxUses))
            return;
          const a = typeof e == "function" ? e : void 0, c = typeof e == "function" ? void 0 : e, u = await ro({
            envelopeContent: o.content,
            envelopeSenderPubkey: o.pubkey,
            inviterEphemeralPrivateKey: this.inviterEphemeralPrivateKey,
            inviterPrivateKey: c,
            sharedSecret: this.sharedSecret,
            decrypt: a
          });
          this.usedBy.push(u.inviteeIdentity);
          const h = Rn({
            nostrSubscribe: t,
            theirPublicKey: u.inviteeSessionPublicKey,
            ourSessionPrivateKey: this.inviterEphemeralPrivateKey,
            sharedSecret: this.sharedSecret,
            isSender: false,
            name: o.id
          });
          r(h, u.inviteeIdentity);
        } catch {
        }
      });
    }
  };
  function Er(n) {
    const {
      currentAppKeys: e,
      currentCreatedAt: t = 0,
      incomingAppKeys: r,
      incomingCreatedAt: i
    } = n;
    return !e || i > t ? {
      decision: "advanced",
      appKeys: r,
      createdAt: i
    } : i < t ? {
      decision: "stale",
      appKeys: e,
      createdAt: t
    } : {
      decision: "merged_equal_timestamp",
      appKeys: e.merge(r),
      createdAt: t
    };
  }
  function io(n) {
    const {
      currentDevicePubkey: e,
      registeredDevices: t,
      hasLocalAppKeys: r = false,
      appKeysManagerReady: i = false,
      sessionManagerReady: s = false
    } = n, o = (e == null ? void 0 : e.trim().toLowerCase()) ?? null, a = o !== null && t.some(
      (u) => u.identityPubkey.trim().toLowerCase() === o
    ), c = t.length > 0;
    return {
      isCurrentDeviceRegistered: a,
      hasKnownRegisteredDevices: c,
      noPreviousDevicesFound: c === false,
      requiresDeviceRegistration: o !== null && a === false,
      canSendPrivateMessages: i && s && (r || a || c)
    };
  }
  function Ad(n) {
    const e = io(n);
    return e.requiresDeviceRegistration && e.hasKnownRegisteredDevices;
  }
  function Xr(n, e, t, r) {
    return n ? n === e || t && n === t ? true : r.some((i) => i.identityPubkey === n) : false;
  }
  function al(n, e, t, r, i) {
    return Xr(n, t, r, i) || Xr(e, t, r, i);
  }
  function cl(n, e) {
    if (!n || !e) return false;
    for (const [t, r] of n.entries()) {
      const i = r == null ? void 0 : r.devices;
      if (i)
        for (const s of i.values()) {
          const o = [s.activeSession, ...s.inactiveSessions ?? []];
          for (const a of o) {
            if (!a) continue;
            const c = a.state;
            if (c && (t === e || c.theirCurrentNostrPublicKey === e || c.theirNextNostrPublicKey === e))
              return true;
          }
        }
    }
    return false;
  }
  function ul(n, e) {
    var t, r;
    if (!n || !e) return e;
    for (const [i, s] of n.entries()) {
      if (i === e)
        return i;
      const o = s == null ? void 0 : s.devices;
      if (o != null && o.has(e) || (((r = (t = s == null ? void 0 : s.appKeys) == null ? void 0 : t.getAllDevices) == null ? void 0 : r.call(t)) ?? []).some((c) => c.identityPubkey === e))
        return i;
      if (o)
        for (const c of o.values()) {
          const u = [c.activeSession, ...c.inactiveSessions ?? []];
          for (const h of u) {
            if (!h) continue;
            const d = h.state;
            if (d && (d.theirCurrentNostrPublicKey === e || d.theirNextNostrPublicKey === e))
              return i;
          }
        }
    }
    return e;
  }
  function so(n, e) {
    var t;
    return (t = n == null ? void 0 : n.find((r) => r[0] === e)) == null ? void 0 : t[1];
  }
  function Id(n) {
    var i;
    const e = n.ownerPubkey.trim().toLowerCase(), t = n.rumor.pubkey.trim().toLowerCase(), r = (i = n.senderPubkey) == null ? void 0 : i.trim().toLowerCase();
    return t === e || r === e ? so(n.rumor.tags, "p") : n.rumor.pubkey;
  }
  function hl(n) {
    var c;
    const e = n.ownerPubkey.trim().toLowerCase(), t = n.senderPubkey.trim().toLowerCase(), r = n.rumor.pubkey.trim().toLowerCase(), i = (c = so(n.rumor.tags, "p")) == null ? void 0 : c.trim().toLowerCase(), s = (r === e || t === e) && (i == null || i.length === 0 || i === e), o = [], a = (u) => {
      const h = u == null ? void 0 : u.trim().toLowerCase();
      !h || o.includes(h) || o.push(h);
    };
    return s ? (r !== e && a(r), t !== e && a(t), a(e), o) : (a(
      Id({
        ownerPubkey: e,
        rumor: n.rumor,
        senderPubkey: t
      })
    ), a(t), o);
  }
  function Qr(n) {
    var s, o;
    const e = n.devicePubkey.trim().toLowerCase(), t = ((s = n.claimedOwnerPublicKey) == null ? void 0 : s.trim().toLowerCase()) || e;
    return t === e ? {
      ownerPublicKey: e,
      claimedOwnerPublicKey: t,
      verifiedWithAppKeys: t === e,
      usedLinkBootstrapException: false,
      fellBackToDeviceIdentity: false
    } : ((o = n.appKeys) == null ? void 0 : o.getAllDevices().some((a) => a.identityPubkey === e)) ?? false ? {
      ownerPublicKey: t,
      claimedOwnerPublicKey: t,
      verifiedWithAppKeys: true,
      usedLinkBootstrapException: false,
      fellBackToDeviceIdentity: false
    } : n.invitePurpose === "link" && t === n.currentOwnerPublicKey.trim().toLowerCase() ? {
      ownerPublicKey: t,
      claimedOwnerPublicKey: t,
      verifiedWithAppKeys: false,
      usedLinkBootstrapException: true,
      fellBackToDeviceIdentity: false
    } : {
      ownerPublicKey: e,
      claimedOwnerPublicKey: t,
      verifiedWithAppKeys: false,
      usedLinkBootstrapException: false,
      fellBackToDeviceIdentity: true
    };
  }
  var vn = () => Math.round(Date.now() / 1e3);
  var oo = "double-ratchet/app-keys";
  var Md = (n) => n.length >= 3 && n[0] === "device" && typeof n[1] == "string" && typeof n[2] == "string";
  function at(n) {
    const e = Array.isArray(n) ? n.filter(Boolean) : n ? [n] : void 0;
    return e && e.length > 0 ? {
      kinds: [Lt],
      authors: e
    } : {
      kinds: [Lt]
    };
  }
  function Cd(n) {
    return n.kind !== Lt ? false : n.tags.some(
      (e) => e[0] === "d" && e[1] === oo
    );
  }
  var Od = (n) => {
    if (!n || typeof n != "object") return null;
    const e = n, t = e.identityPubkey ?? e.identity_pubkey, r = e.updatedAt ?? e.updated_at, i = e.deviceLabel ?? e.device_label, s = e.clientLabel ?? e.client_label;
    return typeof t != "string" || typeof r != "number" || i !== void 0 && typeof i != "string" || s !== void 0 && typeof s != "string" ? null : {
      identityPubkey: t,
      updatedAt: r,
      ...i !== void 0 ? { deviceLabel: i } : {},
      ...s !== void 0 ? { clientLabel: s } : {}
    };
  };
  var G = class _G {
    constructor(e = [], t = []) {
      l(this, "devices", /* @__PURE__ */ new Map());
      l(this, "deviceLabels", /* @__PURE__ */ new Map());
      e.forEach((r) => this.devices.set(r.identityPubkey, r)), t.forEach(({ identityPubkey: r, ...i }) => {
        this.deviceLabels.set(r, i);
      });
    }
    /**
     * Creates a new device identity entry.
     * Note: This only creates the identity entry. The device must separately
     * create and publish its own Invite event with ephemeral keys.
     */
    createDeviceEntry(e) {
      return {
        identityPubkey: e,
        createdAt: vn()
      };
    }
    addDevice(e) {
      this.devices.has(e.identityPubkey) || this.devices.set(e.identityPubkey, e);
    }
    removeDevice(e) {
      this.devices.delete(e), this.deviceLabels.delete(e);
    }
    getDevice(e) {
      return this.devices.get(e);
    }
    getAllDevices() {
      return Array.from(this.devices.values());
    }
    setDeviceLabels(e, t, r = vn()) {
      this.deviceLabels.set(e, {
        deviceLabel: t.deviceLabel,
        clientLabel: t.clientLabel,
        updatedAt: r
      });
    }
    getDeviceLabels(e) {
      return this.deviceLabels.get(e);
    }
    getAllDeviceLabels() {
      return Array.from(this.deviceLabels.entries()).map(([e, t]) => ({
        identityPubkey: e,
        ...t
      }));
    }
    getEncryptedContent(e) {
      const t = this.getAllDeviceLabels().filter(
        ({ identityPubkey: o }) => this.devices.has(o)
      );
      if (t.length === 0 || !e)
        return "";
      const r = ie(e), i = Oe.utils.getConversationKey(
        e,
        r
      ), s = {
        type: "app-keys-labels",
        v: 1,
        deviceLabels: t
      };
      return Oe.encrypt(JSON.stringify(s), i);
    }
    loadEncryptedContent(e, t) {
      if (!e) return;
      const r = ie(t), i = Oe.utils.getConversationKey(
        t,
        r
      ), s = Oe.decrypt(e, i), o = JSON.parse(s);
      if (o.type !== "app-keys-labels" || o.v !== 1)
        throw new Error("Unsupported AppKeys label payload");
      const c = (Array.isArray(o.deviceLabels) ? o.deviceLabels : Array.isArray(o.device_labels) ? o.device_labels : []).map(Od).filter((u) => u !== null);
      this.deviceLabels.clear(), c.forEach(({ identityPubkey: u, ...h }) => {
        this.devices.has(u) && this.deviceLabels.set(u, h);
      });
    }
    getEvent(e) {
      const t = this.getAllDevices().map((r) => [
        "device",
        r.identityPubkey,
        String(r.createdAt)
      ]);
      return {
        kind: Lt,
        pubkey: "",
        // Signer will set this
        content: this.getEncryptedContent(e),
        created_at: vn(),
        tags: [
          ["d", oo],
          ["version", "1"],
          ...t
        ]
      };
    }
    static fromEvent(e, t) {
      if (!e.sig)
        throw new Error("Event is not signed");
      if (!ut(e))
        throw new Error("Event signature is invalid");
      if (!Cd(e))
        throw new Error("Event is not an AppKeys snapshot");
      const r = e.tags.filter(Md).map(([, s, o]) => ({
        identityPubkey: s,
        createdAt: parseInt(o, 10) || e.created_at
      })), i = new _G(r);
      return t && e.content && i.loadEncryptedContent(e.content, t), i;
    }
    serialize() {
      return JSON.stringify({
        devices: this.getAllDevices(),
        deviceLabels: this.getAllDeviceLabels()
      });
    }
    static deserialize(e) {
      const t = JSON.parse(e);
      return new _G(t.devices, t.deviceLabels || []);
    }
    merge(e) {
      const t = [...this.devices.values(), ...e.devices.values()].reduce((o, a) => {
        const c = o.get(a.identityPubkey);
        return (!c || a.createdAt < c.createdAt) && o.set(a.identityPubkey, a), o;
      }, /* @__PURE__ */ new Map()), r = [...this.deviceLabels.entries(), ...e.deviceLabels.entries()].reduce((o, [a, c]) => {
        const u = o.get(a);
        return (!u || c.updatedAt > u.updatedAt) && o.set(a, c), o;
      }, /* @__PURE__ */ new Map()), i = new Set(t.keys()), s = Array.from(r.entries()).filter(([o]) => i.has(o)).map(([o, a]) => ({
        identityPubkey: o,
        ...a
      }));
      return new _G(Array.from(t.values()), s);
    }
    /**
     * Subscribe to AppKeys events from a user.
     * Similar to Invite.fromUser pattern.
     */
    static fromUser(e, t, r) {
      return t(
        at(e),
        (i) => {
          if (i.pubkey === e)
            try {
              const s = _G.fromEvent(i);
              r(s);
            } catch {
            }
        }
      );
    }
    /**
     * Wait for AppKeys from a user with timeout.
     * Returns the most recent AppKeys received within the timeout, or null.
     * Note: Uses the most recent event by created_at, not merging, since
     * device revocation is determined by absence from the list.
     */
    static waitFor(e, t, r = 500) {
      return new Promise((i) => {
        let s = null;
        setTimeout(() => {
          o(), i((s == null ? void 0 : s.list) ?? null);
        }, r);
        const o = t(
          at(e),
          (a) => {
            if (a.pubkey === e)
              try {
                const c = _G.fromEvent(a), u = Er({
                  currentAppKeys: s == null ? void 0 : s.list,
                  currentCreatedAt: s == null ? void 0 : s.createdAt,
                  incomingAppKeys: c,
                  incomingCreatedAt: a.created_at
                });
                if (u.decision === "stale")
                  return;
                s = { list: u.appKeys, createdAt: u.createdAt };
              } catch {
              }
          }
        );
      });
    }
  };
  var Xe = class {
    constructor() {
      l(this, "store", /* @__PURE__ */ new Map());
    }
    async get(e) {
      return this.store.get(e);
    }
    async put(e, t) {
      this.store.set(e, t);
    }
    async del(e) {
      this.store.delete(e);
    }
    async list(e = "") {
      const t = [], r = Array.from(this.store.keys());
      for (const i of r)
        i.startsWith(e) && t.push(i);
      return t;
    }
  };
  var dl = class {
    constructor(e = "session_") {
      l(this, "keyPrefix");
      this.keyPrefix = e;
    }
    getFullKey(e) {
      return `${this.keyPrefix}${e}`;
    }
    async get(e) {
      try {
        const t = localStorage.getItem(this.getFullKey(e));
        return t ? JSON.parse(t) : void 0;
      } catch {
        return;
      }
    }
    async put(e, t) {
      try {
        localStorage.setItem(this.getFullKey(e), JSON.stringify(t));
      } catch (r) {
        throw r instanceof Error ? r : new Error(String(r));
      }
    }
    async del(e) {
      try {
        localStorage.removeItem(this.getFullKey(e));
      } catch {
      }
    }
    async list(e = "") {
      const t = [], r = this.getFullKey(e);
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const s = localStorage.key(i);
          s && s.startsWith(r) && t.push(s.substring(this.keyPrefix.length));
        }
      } catch {
      }
      return t;
    }
  };
  var ei = class {
    constructor(e, t) {
      l(this, "storage");
      l(this, "prefix");
      this.storage = e, this.prefix = t;
    }
    async add(e, t) {
      const r = t.id + "/" + e, i = { id: r, targetKey: e, event: t, createdAt: Date.now() };
      return await this.storage.put(`${this.prefix}${r}`, i), r;
    }
    async getForTarget(e) {
      const t = await this.storage.list(this.prefix), r = [];
      for (const s of t) {
        const o = await this.storage.get(s);
        o && o.targetKey === e && r.push(o);
      }
      return r.sort((s, o) => s.createdAt - o.createdAt);
    }
    async removeForTarget(e) {
      const t = await this.storage.list(this.prefix);
      for (const r of t) {
        const i = await this.storage.get(r);
        i && i.targetKey === e && await this.storage.del(r);
      }
    }
    async removeByTargetAndEventId(e, t) {
      await this.remove(t + "/" + e);
    }
    async remove(e) {
      await this.storage.del(`${this.prefix}${e}`);
    }
  };
  var yt = 40;
  var ll = 10445;
  var wt = 10446;
  var fl = 10447;
  function ht(n, e) {
    return n.admins.includes(e);
  }
  function Sr() {
    const n = crypto.getRandomValues(new Uint8Array(32));
    return ae(n);
  }
  function Dd(n, e, t) {
    const r = [e, ...t.filter((i) => i !== e)];
    return {
      id: crypto.randomUUID(),
      name: n,
      members: r,
      admins: [e],
      createdAt: Date.now(),
      secret: Sr(),
      accepted: true
    };
  }
  function Rd(n, e) {
    const t = {
      id: n.id,
      name: n.name,
      members: n.members,
      admins: n.admins,
      ...n.description && { description: n.description },
      ...n.picture && { picture: n.picture },
      ...!(e != null && e.excludeSecret) && n.secret && { secret: n.secret }
    };
    return JSON.stringify(t);
  }
  function ti(n) {
    try {
      const e = JSON.parse(n), { id: t, name: r, members: i, admins: s } = e;
      return !t || !r || !Array.isArray(i) || !Array.isArray(s) || s.length === 0 ? null : e;
    } catch {
      return null;
    }
  }
  function Nd(n, e, t, r) {
    return ht(n, t) ? e.members.includes(r) ? "accept" : "removed" : "reject";
  }
  function Bd(n, e, t) {
    return !(!n.admins.includes(e) || !n.members.includes(t));
  }
  function Td(n, e) {
    return {
      ...n,
      name: e.name,
      members: e.members,
      admins: e.admins,
      description: e.description,
      picture: e.picture,
      secret: e.secret || n.secret
    };
  }
  function yl(n, e, t) {
    return !ht(n, t) || n.members.includes(e) ? null : {
      ...n,
      members: [...n.members, e],
      secret: Sr()
    };
  }
  function pl(n, e, t) {
    return !ht(n, t) || !n.members.includes(e) || e === t ? null : {
      ...n,
      members: n.members.filter((r) => r !== e),
      admins: n.admins.filter((r) => r !== e),
      secret: Sr()
    };
  }
  function gl(n, e, t) {
    if (!ht(n, t)) return null;
    const r = { ...n };
    return e.name !== void 0 && (r.name = e.name), e.description !== void 0 && (r.description = e.description), e.picture !== void 0 && (r.picture = e.picture), r;
  }
  function vl(n, e, t) {
    return !ht(n, t) || !n.members.includes(e) || n.admins.includes(e) ? null : {
      ...n,
      admins: [...n.admins, e]
    };
  }
  function wl(n, e, t) {
    return !ht(n, t) || !n.admins.includes(e) || n.admins.length <= 1 ? null : {
      ...n,
      admins: n.admins.filter((r) => r !== e)
    };
  }
  function Yt(n) {
    const {
      ourOwnerPubkey: e,
      ourDevicePubkey: t,
      senderOwnerPubkey: r,
      senderDevicePubkey: i
    } = n;
    return r ? r !== e ? "remote-owner" : !t || !i ? "unknown" : i === t ? "local-device" : "same-owner-other-device" : !t || !i ? "unknown" : i === t ? "local-device" : "unknown";
  }
  function Xt(n) {
    return n === "local-device" || n === "same-owner-other-device";
  }
  function Qt(n) {
    return n === "same-owner-other-device";
  }
  var de = class de2 {
    constructor(e, t) {
      l(this, "activeSession");
      l(this, "inactiveSessions", []);
      l(this, "state", "new");
      l(this, "createdAt");
      l(this, "ensurePromise");
      l(this, "inviteSubscription");
      l(this, "sessionSubscriptions", /* @__PURE__ */ new Map());
      l(this, "inviteAcceptancePromise");
      l(this, "inviteBackfillPromise");
      l(this, "hasAttemptedInviteBackfill", false);
      this.deviceId = e, this.deps = t, this.createdAt = t.createdAt ?? Date.now();
    }
    static sessionCanSend(e) {
      return !!(e.state.theirNextNostrPublicKey && e.state.ourCurrentNostrKey);
    }
    static sessionCanReceive(e) {
      return !!(e.state.receivingChainKey || e.state.theirCurrentNostrPublicKey || e.state.receivingChainMessageNumber > 0);
    }
    static sessionHasActivity(e) {
      return e.state.sendingChainMessageNumber > 0 || e.state.receivingChainMessageNumber > 0;
    }
    static sessionPriority(e) {
      const t = de2.sessionCanSend(e), r = de2.sessionCanReceive(e);
      return [
        t && r ? 3 : t ? 2 : r ? 1 : 0,
        e.state.receivingChainMessageNumber,
        e.state.sendingChainMessageNumber
      ];
    }
    detachSession(e) {
      const t = this.sessionSubscriptions.get(e.name);
      (t == null ? void 0 : t.session) === e && (t.unsubscribe(), this.sessionSubscriptions.delete(e.name)), e.close();
    }
    pruneDuplicateSessions(e) {
      if (this.activeSession && this.activeSession !== e && this.activeSession.name === e.name) {
        const i = this.activeSession;
        this.activeSession = void 0, this.detachSession(i);
      }
      const t = this.inactiveSessions.filter(
        (i) => i !== e && i.name === e.name
      );
      this.inactiveSessions = this.inactiveSessions.filter(
        (i) => i === e || i.name !== e.name
      );
      for (const i of t)
        this.detachSession(i);
      const r = this.sessionSubscriptions.get(e.name);
      r && r.session !== e && (r.unsubscribe(), r.session.close(), this.sessionSubscriptions.delete(e.name));
    }
    hasEstablishedActiveSession() {
      return this.activeSession ? de2.sessionCanSend(this.activeSession) && (de2.sessionCanReceive(this.activeSession) || de2.sessionHasActivity(this.activeSession)) : false;
    }
    ensureSetup() {
      return this.state === "revoked" ? Promise.resolve() : this.state === "session-ready" ? this.flushMessageQueue().catch(() => {
      }) : this.ensurePromise ? this.ensurePromise : (this.ensurePromise = this.doEnsureSetup().finally(() => {
        this.ensurePromise = void 0;
      }), this.ensurePromise);
    }
    async doEnsureSetup() {
      if (this.state !== "revoked") {
        if (this.activeSession) {
          this.state = "session-ready", await this.flushMessageQueue();
          return;
        }
        if (this.inactiveSessions.length > 0) {
          this.ensureInviteSubscription(), this.state = "waiting-for-invite";
          return;
        }
        if (this.deviceId !== this.deps.ourDeviceId) {
          if (this.ensureInviteSubscription(), await this.ensureInviteBackfill(), this.activeSession) {
            this.state = "session-ready", await this.flushMessageQueue();
            return;
          }
          this.state = "waiting-for-invite";
        }
      }
    }
    ensureInviteSubscription() {
      this.inviteSubscription || this.state === "revoked" || (this.inviteSubscription = fe.fromUser(
        this.deviceId,
        this.deps.nostr.subscribe,
        (e) => {
          this.acceptInvite(e).catch(() => {
          });
        }
      ));
    }
    ensureInviteBackfill() {
      return this.state === "revoked" || this.hasAttemptedInviteBackfill ? Promise.resolve() : this.inviteBackfillPromise ? this.inviteBackfillPromise : (this.hasAttemptedInviteBackfill = true, this.inviteBackfillPromise = this.doInviteBackfill().finally(() => {
        this.inviteBackfillPromise = void 0;
      }), this.inviteBackfillPromise);
    }
    async doInviteBackfill() {
      const e = await fe.waitFor(this.deviceId, this.deps.nostr.subscribe, 1e3).catch(() => null);
      e && await this.acceptInvite(e).catch(() => {
      });
    }
    acceptInvite(e) {
      return this.state === "revoked" ? Promise.reject(new Error("Device is revoked")) : (e.deviceId || e.inviter) !== this.deviceId ? Promise.reject(new Error("Invite does not target this device")) : this.hasEstablishedActiveSession() ? Promise.resolve(this.activeSession) : this.activeSession && de2.sessionCanSend(this.activeSession) ? Promise.resolve(this.activeSession) : this.inviteAcceptancePromise ? this.inviteAcceptancePromise : (this.inviteAcceptancePromise = this.doAcceptInvite(e).finally(() => {
        this.inviteAcceptancePromise = void 0;
      }), this.inviteAcceptancePromise);
    }
    async doAcceptInvite(e) {
      this.state = "accepting-invite";
      try {
        const t = this.deps.identityKey, r = t instanceof Uint8Array ? t : t.encrypt, { session: i, event: s } = await e.accept(
          this.deps.nostr.subscribe,
          this.deps.ourDeviceId,
          r,
          this.deps.ourOwnerPubkey
        );
        return await this.deps.nostr.publish(s), this.installSession(i, false, { preferActive: true }), await this.publishInviteBootstrap(i), this.state = "session-ready", await this.flushMessageQueue(), i;
      } catch (t) {
        throw this.state = "waiting-for-invite", t;
      }
    }
    async publishInviteBootstrap(e) {
      try {
        const { event: t } = e.sendTyping({
          expiresAt: Math.floor(Date.now() / 1e3)
        });
        await this.deps.nostr.publish(t);
      } catch {
      }
    }
    installSession(e, t = false, r = {}) {
      const { persist: i = true, preferActive: s = false } = r;
      this.pruneDuplicateSessions(e);
      const o = (a, c = {}) => {
        const { force: u = false } = c, h = this.activeSession;
        if (h === a || (h == null ? void 0 : h.name) === a.name) {
          this.activeSession = a, this.inactiveSessions = this.inactiveSessions.filter(
            (y) => y !== a && y.name !== a.name
          );
          return;
        }
        if (this.inactiveSessions = this.inactiveSessions.filter(
          (y) => y !== a && y.name !== a.name
        ), u) {
          h && this.inactiveSessions.unshift(h), this.activeSession = a, this.trimInactiveSessions();
          return;
        }
        s && h && !this.hasEstablishedActiveSession() ? (this.inactiveSessions.unshift(h), this.activeSession = a) : h && de2.sessionPriority(h) >= de2.sessionPriority(a) ? (this.inactiveSessions.unshift(a), this.activeSession = h) : (h && this.inactiveSessions.unshift(h), this.activeSession = a), this.trimInactiveSessions();
      };
      if (t ? this.inactiveSessions.some(
        (c) => c === e || c.name === e.name
      ) || (this.inactiveSessions.unshift(e), this.trimInactiveSessions()) : o(e), !this.sessionSubscriptions.has(e.name)) {
        const a = e.onEvent((c) => {
          var y;
          const u = this.deps.ownerPubkey, h = ((y = this.activeSession) == null ? void 0 : y.name) === e.name || this.inactiveSessions.some((f) => f === e || f.name === e.name);
          (u === this.deviceId || this.deps.user.isDeviceAuthorized(this.deviceId) || h) && (o(e, { force: true }), this.deps.user.onDeviceRumor(this.deviceId, c), this.state = "session-ready", this.flushMessageQueue().catch(() => {
          }), this.deps.user.onDeviceDirty());
        });
        this.sessionSubscriptions.set(e.name, { session: e, unsubscribe: a });
      }
      this.activeSession && (this.state = "session-ready"), i && this.deps.user.onDeviceDirty();
    }
    trimInactiveSessions() {
      if (this.inactiveSessions.length <= de2.MAX_INACTIVE_SESSIONS)
        return;
      const e = this.inactiveSessions.splice(de2.MAX_INACTIVE_SESSIONS);
      for (const t of e)
        this.detachSession(t);
    }
    async flushMessageQueue() {
      if (!this.activeSession || this.state === "revoked")
        return;
      const e = await this.deps.messageQueue.getForTarget(this.deviceId);
      if (e.length !== 0) {
        for (const t of e)
          try {
            const { event: r } = this.activeSession.sendEvent(t.event);
            await this.deps.nostr.publish(r), await this.deps.messageQueue.removeByTargetAndEventId(this.deviceId, t.event.id);
          } catch {
          }
        this.deps.user.onDeviceDirty();
      }
    }
    deactivateCurrentSession() {
      this.activeSession && (this.inactiveSessions.push(this.activeSession), this.activeSession = void 0, this.state = "waiting-for-invite", this.deps.user.onDeviceDirty());
    }
    async revoke() {
      this.state = "revoked", this.close(), this.activeSession = void 0, this.inactiveSessions = [], await this.deps.messageQueue.removeForTarget(this.deviceId).catch(() => {
      }), this.deps.user.onDeviceDirty();
    }
    close() {
      var t;
      (t = this.inviteSubscription) == null || t.call(this), this.inviteSubscription = void 0;
      const e = /* @__PURE__ */ new Set();
      this.activeSession && e.add(this.activeSession);
      for (const r of this.inactiveSessions)
        e.add(r);
      for (const r of this.sessionSubscriptions.values())
        e.add(r.session);
      for (const r of e)
        this.detachSession(r);
      this.sessionSubscriptions.clear();
    }
  };
  l(de, "MAX_INACTIVE_SESSIONS", 10);
  var Nn = de;
  var _d = class {
    constructor(e, t) {
      l(this, "appKeys");
      l(this, "state", "new");
      l(this, "devices", /* @__PURE__ */ new Map());
      l(this, "setupPromise");
      l(this, "appKeysSubscription");
      l(this, "latestAppKeysCreatedAt", 0);
      this.publicKey = e, this.deps = t;
    }
    setState(e) {
      this.state = e;
    }
    ensureDevice(e, t) {
      if (!e)
        throw new Error("Device record must include a deviceId");
      const r = this.devices.get(e);
      if (r)
        return r;
      const i = new Nn(e, {
        ownerPubkey: this.publicKey,
        user: this,
        nostr: this.deps.nostr,
        messageQueue: this.deps.messageQueue,
        ourDeviceId: this.deps.ourDeviceId,
        ourOwnerPubkey: this.deps.ourOwnerPubkey,
        identityKey: this.deps.identityKey,
        createdAt: t
      });
      return this.devices.set(e, i), i;
    }
    setAppKeys(e) {
      this.appKeys = e;
    }
    async queueOutboundMessage(e) {
      if (!this.appKeys) {
        await this.deps.discoveryQueue.add(this.publicKey, e);
        return;
      }
      const t = this.getTargetDeviceIds();
      if (t.length === 0) {
        await this.deps.discoveryQueue.add(this.publicKey, e);
        return;
      }
      for (const r of t)
        await this.deps.messageQueue.add(r, e);
    }
    ensureSetup() {
      return this.state === "ready" ? Promise.all(
        this.getTargetDeviceIds().map(
          (e) => this.ensureDevice(e).ensureSetup().catch(() => {
          })
        )
      ).then(() => {
      }) : this.setupPromise ? this.setupPromise : (this.setupPromise = this.doEnsureSetup().finally(() => {
        this.setupPromise = void 0;
      }), this.setupPromise);
    }
    async doEnsureSetup() {
      if (this.ensureAppKeysSubscription(), !this.appKeys) {
        this.setState("new");
        return;
      }
      this.setState("appkeys-known"), await this.expandDiscoveryQueue();
      for (const e of this.getTargetDeviceIds())
        this.ensureDevice(e).ensureSetup().catch(() => {
        });
      this.setState("ready");
    }
    async onAppKeys(e) {
      this.appKeys = e, this.setState("appkeys-known"), this.deps.manager.updateDelegateMapping(this.publicKey, e);
      const t = new Set(
        e.getAllDevices().map((r) => r.identityPubkey).filter(Boolean)
      );
      for (const [r, i] of this.devices)
        t.has(r) || (await i.revoke(), this.devices.delete(r), this.deps.manager.removeDelegateMapping(r));
      for (const r of t)
        this.ensureDevice(r);
      await this.expandDiscoveryQueue(), await Promise.all(
        this.getTargetDeviceIds().map(
          (r) => {
            var i;
            return (i = this.devices.get(r)) == null ? void 0 : i.ensureSetup().catch(() => {
            });
          }
        )
      ), this.setState("ready"), this.onDeviceDirty();
    }
    ensureAppKeysSubscription() {
      this.appKeysSubscription || (this.appKeysSubscription = this.deps.nostr.subscribe(
        at(this.publicKey),
        (e) => {
          try {
            const t = G.fromEvent(e), r = Er({
              currentAppKeys: this.appKeys,
              currentCreatedAt: this.latestAppKeysCreatedAt,
              incomingAppKeys: t,
              incomingCreatedAt: e.created_at
            });
            if (r.decision === "stale")
              return;
            this.latestAppKeysCreatedAt = r.createdAt, this.onAppKeys(r.appKeys).catch(() => {
            });
          } catch {
          }
        }
      ));
    }
    async expandDiscoveryQueue() {
      const e = await this.deps.discoveryQueue.getForTarget(this.publicKey);
      if (e.length === 0)
        return;
      const t = this.getTargetDeviceIds();
      if (t.length !== 0)
        for (const r of e) {
          let i = true;
          for (const s of t)
            try {
              await this.deps.messageQueue.add(s, r.event);
            } catch {
              i = false;
            }
          i && await this.deps.discoveryQueue.remove(r.id).catch(() => {
          });
        }
    }
    getTargetDeviceIds() {
      return this.appKeys ? this.appKeys.getAllDevices().map((e) => e.identityPubkey).filter(
        (e) => !!e && e !== this.deps.ourDeviceId
      ) : [];
    }
    isDeviceAuthorized(e) {
      return this.publicKey === e ? true : this.appKeys ? this.appKeys.getAllDevices().some((t) => t.identityPubkey === e) : false;
    }
    onDeviceRumor(e, t) {
      this.deps.manager.handleDeviceRumor(this.publicKey, e, t);
    }
    onDeviceDirty() {
      this.deps.manager.persistUserRecord(this.publicKey);
    }
    deactivateCurrentSessions() {
      for (const e of this.devices.values())
        e.deactivateCurrentSession();
    }
    close() {
      var e;
      (e = this.appKeysSubscription) == null || e.call(this), this.appKeysSubscription = void 0;
      for (const t of this.devices.values())
        t.close();
    }
  };
  var le = class le2 {
    constructor(e, t, r, i, s, o, a, c) {
      l(this, "storageVersion", "1");
      l(this, "versionPrefix");
      l(this, "deviceId");
      l(this, "storage");
      l(this, "nostrSubscribe");
      l(this, "nostrPublish");
      l(this, "identityKey");
      l(this, "ourPublicKey");
      l(this, "ownerPublicKey");
      l(this, "nostrFacade");
      l(this, "inviteKeys");
      l(this, "userRecords", /* @__PURE__ */ new Map());
      l(this, "messageQueue");
      l(this, "discoveryQueue");
      l(this, "delegateToOwner", /* @__PURE__ */ new Map());
      l(this, "processedInviteResponses", /* @__PURE__ */ new Set());
      l(this, "pendingInviteResponses", /* @__PURE__ */ new Map());
      l(this, "defaultExpiration");
      l(this, "peerExpiration", /* @__PURE__ */ new Map());
      l(this, "groupExpiration", /* @__PURE__ */ new Map());
      l(this, "autoAdoptChatSettings", true);
      l(this, "userRecordWriteChain", /* @__PURE__ */ new Map());
      l(this, "userSetupPromises", /* @__PURE__ */ new Map());
      l(this, "bootstrapRetryTimeouts", /* @__PURE__ */ new Set());
      l(this, "ourInviteResponseSubscription", null);
      l(this, "internalSubscriptions", /* @__PURE__ */ new Set());
      l(this, "initialized", false);
      this.userRecords = /* @__PURE__ */ new Map(), this.nostrSubscribe = i, this.nostrPublish = s, this.ourPublicKey = e, this.identityKey = t, this.deviceId = r, this.ownerPublicKey = o, this.inviteKeys = a, this.storage = c || new Xe(), this.versionPrefix = `v${this.storageVersion}`, this.messageQueue = new ei(this.storage, "v1/message-queue/"), this.discoveryQueue = new ei(this.storage, "v1/discovery-queue/"), this.nostrFacade = {
        subscribe: this.nostrSubscribe,
        publish: async (u) => {
          await this.nostrPublish(u);
        }
      };
    }
    static sessionCanSend(e) {
      return !!(e.state.theirNextNostrPublicKey && e.state.ourCurrentNostrKey);
    }
    static sessionCanReceive(e) {
      return !!(e.state.receivingChainKey || e.state.theirCurrentNostrPublicKey || e.state.receivingChainMessageNumber > 0);
    }
    static sessionHasActivity(e) {
      return e.state.sendingChainMessageNumber > 0 || e.state.receivingChainMessageNumber > 0;
    }
    expirationDefaultKey() {
      return `${this.versionPrefix}/expiration/default`;
    }
    expirationPeerPrefix() {
      return `${this.versionPrefix}/expiration/peer/`;
    }
    expirationPeerKey(e) {
      return `${this.expirationPeerPrefix()}${e}`;
    }
    expirationGroupPrefix() {
      return `${this.versionPrefix}/expiration/group/`;
    }
    expirationGroupKey(e) {
      return `${this.expirationGroupPrefix()}${encodeURIComponent(e)}`;
    }
    validateExpirationOptions(e) {
      e && Dn(e, 0);
    }
    async loadExpirationSettings() {
      const e = await this.storage.get(this.expirationDefaultKey());
      if (e)
        try {
          this.validateExpirationOptions(e), this.defaultExpiration = e;
        } catch {
        }
      const t = await this.storage.list(this.expirationPeerPrefix());
      for (const i of t) {
        const s = i.slice(this.expirationPeerPrefix().length);
        if (!s) continue;
        const o = await this.storage.get(i);
        if (o !== void 0) {
          if (o === null) {
            this.peerExpiration.set(s, null);
            continue;
          }
          try {
            this.validateExpirationOptions(o), this.peerExpiration.set(s, o);
          } catch {
          }
        }
      }
      const r = await this.storage.list(this.expirationGroupPrefix());
      for (const i of r) {
        const s = i.slice(this.expirationGroupPrefix().length);
        if (!s) continue;
        let o;
        try {
          o = decodeURIComponent(s);
        } catch {
          continue;
        }
        const a = await this.storage.get(i);
        if (a !== void 0) {
          if (a === null) {
            this.groupExpiration.set(o, null);
            continue;
          }
          try {
            this.validateExpirationOptions(a), this.groupExpiration.set(o, a);
          } catch {
          }
        }
      }
    }
    async init() {
      if (this.initialized) return;
      this.initialized = true, await this.runMigrations().catch(() => {
      }), await this.loadAllUserRecords().catch(() => {
      }), await this.loadExpirationSettings().catch(() => {
      });
      const e = this.getOrCreateUserRecord(this.ownerPublicKey);
      this.upsertDeviceRecord(e, this.deviceId), this.startInviteResponseListener(), Array.from(this.userRecords.keys()).forEach((t) => this.setupUser(t));
    }
    /**
     * Start listening for invite responses on our ephemeral key.
     * This is used by devices to receive session establishment responses.
     */
    startInviteResponseListener() {
      const { publicKey: e, privateKey: t } = this.inviteKeys.ephemeralKeypair, r = this.inviteKeys.sharedSecret;
      this.ourInviteResponseSubscription = this.nostrSubscribe(
        {
          kinds: [1059],
          // INVITE_RESPONSE_KIND
          "#p": [e]
        },
        async (i) => {
          var s;
          if (!(this.processedInviteResponses.has(i.id) || this.pendingInviteResponses.has(i.id)))
            try {
              const o = await ro({
                envelopeContent: i.content,
                envelopeSenderPubkey: i.pubkey,
                inviterEphemeralPrivateKey: t,
                inviterPrivateKey: this.identityKey instanceof Uint8Array ? this.identityKey : void 0,
                sharedSecret: r,
                decrypt: this.identityKey instanceof Uint8Array ? void 0 : this.identityKey.decrypt
              });
              if (o.inviteeIdentity === this.deviceId)
                return;
              const a = o.ownerPublicKey || this.resolveToOwner(o.inviteeIdentity), c = {
                eventId: i.id,
                ownerPublicKey: a,
                deviceId: o.inviteeIdentity,
                inviteeSessionPublicKey: o.inviteeSessionPublicKey,
                ephemeralPrivateKey: t,
                sharedSecret: r
              }, u = await this.fetchAppKeys(a);
              if (u && (this.updateDelegateMapping(a, u), this.installInviteResponseSession(c, u)))
                return;
              const h = (s = this.userRecords.get(a)) == null ? void 0 : s.appKeys;
              if (this.installInviteResponseSession(c, h))
                return;
              this.queuePendingInviteResponse(c), this.setupUser(a).catch(() => {
              });
            } catch {
            }
        }
      );
    }
    /**
     * Fetch a user's AppKeys from relays.
     * Returns null if not found within timeout.
     */
    fetchAppKeys(e, t = 2e3) {
      return new Promise((r) => {
        let i = null, s = false;
        const o = () => {
          s || (s = true, c(), r((i == null ? void 0 : i.appKeys) ?? null));
        }, a = setTimeout(o, t), c = this.nostrSubscribe(
          at(e),
          (u) => {
            if (!s)
              try {
                const h = G.fromEvent(u);
                !i || u.created_at > i.created_at ? i = { created_at: u.created_at, appKeys: h } : u.created_at === i.created_at && (i = {
                  created_at: u.created_at,
                  appKeys: i.appKeys.merge(h)
                }), clearTimeout(a), setTimeout(o, 100);
              } catch {
              }
          }
        );
      });
    }
    // -------------------
    // User and Device Records helpers
    // -------------------
    getOrCreateUserRecord(e) {
      let t = this.userRecords.get(e);
      return t || (t = new _d(e, {
        manager: {
          updateDelegateMapping: (r, i) => {
            this.updateDelegateMapping(r, i);
          },
          removeDelegateMapping: (r) => {
            this.delegateToOwner.delete(r);
          },
          handleDeviceRumor: (r, i, s) => {
            this.handleDeviceRumor(r, i, s);
          },
          persistUserRecord: (r) => {
            this.storeUserRecord(r).catch(() => {
            });
          }
        },
        nostr: this.nostrFacade,
        messageQueue: this.messageQueue,
        discoveryQueue: this.discoveryQueue,
        ourDeviceId: this.deviceId,
        ourOwnerPubkey: this.ownerPublicKey,
        identityKey: this.identityKey
      }), this.userRecords.set(e, t)), t;
    }
    handleDeviceRumor(e, t, r) {
      var c;
      const i = this.userRecords.get(e), s = e === t || ((c = i == null ? void 0 : i.appKeys) == null ? void 0 : c.getAllDevices().some((u) => u.identityPubkey === t)) || false;
      e !== this.ownerPublicKey && (!(i != null && i.appKeys) || !s) && this.fetchAppKeys(e).then((u) => {
        u && (i == null || i.onAppKeys(u).catch(() => {
        }));
      }).catch(() => {
      }), this.maybeAutoAdoptChatSettings(r, e);
      const o = Yt({
        ourOwnerPubkey: this.ownerPublicKey,
        ourDevicePubkey: this.deviceId,
        senderOwnerPubkey: e,
        senderDevicePubkey: t
      }), a = {
        fromDeviceId: t,
        senderOwnerPubkey: e,
        senderDevicePubkey: t,
        origin: o,
        isSelf: Xt(o),
        isCrossDeviceSelf: Qt(o)
      };
      for (const u of this.internalSubscriptions)
        u(r, e, a);
    }
    upsertDeviceRecord(e, t) {
      return e.ensureDevice(t);
    }
    sessionKeyPrefix(e) {
      return `${this.versionPrefix}/session/${e}/`;
    }
    userRecordKey(e) {
      return `${this.userRecordKeyPrefix()}${e}`;
    }
    userRecordKeyPrefix() {
      return `${this.versionPrefix}/user/`;
    }
    versionKey() {
      return "storage-version";
    }
    /**
     * Resolve a pubkey to its owner if it's a known delegate device.
     * Returns the input pubkey if not a known delegate.
     */
    resolveToOwner(e) {
      return this.delegateToOwner.get(e) || e;
    }
    /**
     * Update the delegate-to-owner mapping from an AppKeys.
     * Extracts delegate device pubkeys and maps them to the owner.
     * Persists the mapping in the user record for restart recovery.
     */
    updateDelegateMapping(e, t) {
      var o;
      const r = this.getOrCreateUserRecord(e), i = new Set(
        t.getAllDevices().map((a) => a.identityPubkey).filter(Boolean)
      ), s = (((o = r.appKeys) == null ? void 0 : o.getAllDevices()) || []).map((a) => a.identityPubkey).filter(Boolean);
      for (const a of s)
        i.has(a) || (this.delegateToOwner.delete(a), this.messageQueue.removeForTarget(a).catch(() => {
        }));
      r.appKeys = t;
      for (const a of i)
        this.delegateToOwner.set(a, e);
      this.retryPendingInviteResponses(e, t), this.storeUserRecord(e).catch(() => {
      });
    }
    queuePendingInviteResponse(e) {
      if (!this.pendingInviteResponses.has(e.eventId)) {
        if (this.pendingInviteResponses.size >= 1e3) {
          const t = this.pendingInviteResponses.keys().next().value;
          t && this.pendingInviteResponses.delete(t);
        }
        this.pendingInviteResponses.set(e.eventId, e);
      }
    }
    installInviteResponseSession(e, t) {
      if (!(e.deviceId === e.ownerPublicKey || ((t == null ? void 0 : t.getAllDevices().some(
        (c) => c.identityPubkey === e.deviceId
      )) ?? false)))
        return false;
      const s = this.getOrCreateUserRecord(e.ownerPublicKey), o = this.upsertDeviceRecord(s, e.deviceId), a = Rn({
        nostrSubscribe: this.nostrSubscribe,
        theirPublicKey: e.inviteeSessionPublicKey,
        ourSessionPrivateKey: e.ephemeralPrivateKey,
        sharedSecret: e.sharedSecret,
        isSender: false,
        name: e.eventId
      });
      return o.installSession(a, true), this.pendingInviteResponses.delete(e.eventId), this.processedInviteResponses.add(e.eventId), this.storeUserRecord(e.ownerPublicKey).catch(() => {
      }), true;
    }
    retryPendingInviteResponses(e, t) {
      for (const r of this.pendingInviteResponses.values())
        r.ownerPublicKey === e && this.installInviteResponseSession(r, t);
    }
    /**
     * Check if a device is currently authorized by the owner's AppKeys.
     * Returns true if the device is in the owner's current AppKeys.
     */
    isDeviceAuthorized(e, t) {
      var i;
      const r = (i = this.userRecords.get(e)) == null ? void 0 : i.appKeys;
      return r ? r.getAllDevices().some((s) => s.identityPubkey === t) : false;
    }
    async setupUser(e) {
      const t = this.userSetupPromises.get(e);
      if (t)
        return t;
      const r = this.doSetupUser(e).finally(() => {
        this.userSetupPromises.get(e) === r && this.userSetupPromises.delete(e);
      });
      return this.userSetupPromises.set(e, r), r;
    }
    async doSetupUser(e) {
      const t = this.getOrCreateUserRecord(e);
      await t.ensureSetup().catch(() => {
      });
      const r = await this.fetchAppKeys(e).catch(() => null);
      if (r) {
        await t.onAppKeys(r).catch(() => {
        });
        return;
      }
      (e !== this.ownerPublicKey || this.deviceId === this.ownerPublicKey) && !t.appKeys && !t.devices.has(e) && (await this.upsertDeviceRecord(t, e).ensureSetup().catch(() => {
      }), await this.storeUserRecord(e).catch(() => {
      }));
    }
    onEvent(e) {
      return this.internalSubscriptions.add(e), () => {
        this.internalSubscriptions.delete(e);
      };
    }
    /**
     * Enable/disable automatically adopting incoming `chat-settings` events (kind 10448).
     * When enabled, receiving a valid settings payload updates per-peer expiration defaults.
     */
    setAutoAdoptChatSettings(e) {
      this.autoAdoptChatSettings = e;
    }
    getDeviceId() {
      return this.deviceId;
    }
    getUserRecords() {
      return this.userRecords;
    }
    /**
     * Set a global default expiration for outgoing rumors sent via this SessionManager.
     * Pass `undefined` to clear.
     */
    async setDefaultExpiration(e) {
      this.validateExpirationOptions(e), this.defaultExpiration = e;
      const t = this.expirationDefaultKey();
      if (!e) {
        await this.storage.del(t).catch(() => {
        });
        return;
      }
      await this.storage.put(t, e).catch(() => {
      });
    }
    /**
     * Set a per-peer default expiration for outgoing rumors. Pass `undefined` to clear.
     */
    async setExpirationForPeer(e, t) {
      if (this.validateExpirationOptions(t || void 0), t === void 0) {
        this.peerExpiration.delete(e), await this.storage.del(this.expirationPeerKey(e)).catch(() => {
        });
        return;
      }
      this.peerExpiration.set(e, t), await this.storage.put(this.expirationPeerKey(e), t).catch(() => {
      });
    }
    /**
     * Set a per-group default expiration, keyed by groupId (typically carried via `["l", groupId]`).
     * Pass `undefined` to clear.
     */
    async setExpirationForGroup(e, t) {
      if (this.validateExpirationOptions(t || void 0), t === void 0) {
        this.groupExpiration.delete(e), await this.storage.del(this.expirationGroupKey(e)).catch(() => {
        });
        return;
      }
      this.groupExpiration.set(e, t), await this.storage.put(this.expirationGroupKey(e), t).catch(() => {
      });
    }
    close() {
      var e;
      for (const t of this.bootstrapRetryTimeouts)
        clearTimeout(t);
      this.bootstrapRetryTimeouts.clear();
      for (const t of this.userRecords.values())
        t.close();
      (e = this.ourInviteResponseSubscription) == null || e.call(this);
    }
    deactivateCurrentSessions(e) {
      const t = this.userRecords.get(e);
      t && (t.deactivateCurrentSessions(), this.storeUserRecord(e).catch(() => {
      }));
    }
    async deleteChat(e) {
      return this.deleteUser(this.resolveToOwner(e));
    }
    async deleteUser(e) {
      await this.init();
      const t = this.resolveToOwner(e);
      if (t === this.ownerPublicKey) return;
      const r = this.userRecords.get(t);
      if (r) {
        r.close();
        for (const i of r.devices.values())
          await i.revoke();
        this.userRecords.delete(t);
      }
      if (await this.discoveryQueue.removeForTarget(t), r)
        for (const [i] of r.devices)
          await this.messageQueue.removeForTarget(i);
      await Promise.allSettled([
        this.deleteUserSessionsFromStorage(t),
        this.storage.del(this.userRecordKey(t))
      ]);
    }
    async deleteUserSessionsFromStorage(e) {
      const t = this.sessionKeyPrefix(e), r = await this.storage.list(t);
      await Promise.all(r.map((i) => this.storage.del(i)));
    }
    async flushMessageQueue(e) {
      const t = this.resolveToOwner(e), r = this.userRecords.get(t), i = r == null ? void 0 : r.devices.get(e);
      i && (await i.flushMessageQueue(), await this.storeUserRecord(t).catch(() => {
      }));
    }
    planBootstrapEvents(e) {
      const t = Math.floor(Date.now() / 1e3) + le2.INVITE_BOOTSTRAP_EXPIRATION_SECONDS;
      return le2.INVITE_BOOTSTRAP_RETRY_DELAYS_MS.map(
        () => e.sendTyping({ expiresAt: t }).event
      );
    }
    scheduleBootstrapRetryEvents(e) {
      e.slice(1).forEach((t, r) => {
        const i = setTimeout(() => {
          this.bootstrapRetryTimeouts.delete(i), this.nostrPublish(t).catch(() => {
          });
        }, le2.INVITE_BOOTSTRAP_RETRY_DELAYS_MS[r + 1]);
        this.bootstrapRetryTimeouts.add(i);
      });
    }
    async sendLinkBootstrap(e, t) {
      var s;
      const r = this.userRecords.get(e), i = (s = r == null ? void 0 : r.devices.get(t)) == null ? void 0 : s.activeSession;
      if (i)
        try {
          const o = this.planBootstrapEvents(i), [a] = o;
          if (!a)
            return;
          await this.nostrPublish(a), this.scheduleBootstrapRetryEvents(o), await this.storeUserRecord(e).catch(() => {
          });
        } catch {
        }
    }
    async sendInviteBootstrap(e) {
      try {
        const t = this.planBootstrapEvents(e), [r] = t;
        if (!r)
          return;
        await this.nostrPublish(r), this.scheduleBootstrapRetryEvents(t);
      } catch {
      }
    }
    async acceptInvite(e, t = {}) {
      var N;
      await this.init();
      const r = e.deviceId || e.inviter;
      if (!r)
        throw new Error("Invite device id is required");
      if (r === this.deviceId)
        throw new Error("Cannot accept invite from this device");
      const i = t.ownerPublicKey === r, s = t.ownerPublicKey || e.ownerPubkey || this.resolveToOwner(r) || r;
      let o = s, a = null;
      if (s !== r) {
        const O = await this.fetchAppKeys(s).catch(() => null);
        if (O) {
          const X = Qr({
            devicePubkey: r,
            claimedOwnerPublicKey: s,
            invitePurpose: e.purpose,
            currentOwnerPublicKey: this.ownerPublicKey,
            appKeys: O
          });
          X.fellBackToDeviceIdentity || (a = O, this.updateDelegateMapping(s, O)), o = X.ownerPublicKey;
        } else {
          const X = (N = this.userRecords.get(s)) == null ? void 0 : N.appKeys;
          o = Qr({
            devicePubkey: r,
            claimedOwnerPublicKey: s,
            invitePurpose: e.purpose,
            currentOwnerPublicKey: this.ownerPublicKey,
            appKeys: X
          }).ownerPublicKey;
        }
      }
      const c = this.getOrCreateUserRecord(o);
      a && o === s && (c.appKeys = a);
      const u = c.devices.get(r), h = [
        ...u != null && u.activeSession ? [u.activeSession] : [],
        ...(u == null ? void 0 : u.inactiveSessions) ?? []
      ], d = h.find(
        (O) => le2.sessionCanSend(O) && (le2.sessionCanReceive(O) || le2.sessionHasActivity(O))
      );
      if (d)
        return { ownerPublicKey: o, deviceId: r, session: d };
      const y = h.length > 0;
      if (i && e.purpose !== "link" && y && h.every(
        (O) => !le2.sessionCanSend(O) && !le2.sessionCanReceive(O) && !le2.sessionHasActivity(O)
      ))
        return { ownerPublicKey: o, deviceId: r, session: h[0] };
      const p = this.identityKey instanceof Uint8Array ? this.identityKey : this.identityKey.encrypt, w = e.purpose === "link" ? this.ownerPublicKey : await this.resolveInviteeOwnerClaim(o), { session: b, event: m } = await e.accept(
        this.nostrSubscribe,
        this.ourPublicKey,
        p,
        w
      );
      await this.nostrPublish(m);
      const P = this.upsertDeviceRecord(c, r);
      return this.delegateToOwner.set(r, o), P.installSession(b, false, { preferActive: true }), await this.sendInviteBootstrap(b), e.purpose === "link" && o === this.ownerPublicKey && await this.sendLinkBootstrap(o, r), await this.flushMessageQueue(r).catch(() => {
      }), await this.storeUserRecord(o).catch(() => {
      }), { ownerPublicKey: o, deviceId: r, session: b };
    }
    async resolveInviteeOwnerClaim(e) {
      if (!(e === this.ownerPublicKey && this.deviceId !== this.ownerPublicKey && !this.isDeviceAuthorized(this.ownerPublicKey, this.deviceId)))
        return this.ownerPublicKey;
    }
    async sendEvent(e, t) {
      var f;
      await this.init(), await Promise.allSettled([
        this.setupUser(e),
        this.setupUser(this.ownerPublicKey)
      ]);
      const r = t, i = /* @__PURE__ */ new Set([e, this.ownerPublicKey]);
      for (const p of i) {
        const w = this.userRecords.get(p), b = /* @__PURE__ */ new Set();
        for (const m of ((f = w == null ? void 0 : w.appKeys) == null ? void 0 : f.getAllDevices()) ?? [])
          m.identityPubkey && m.identityPubkey !== this.deviceId && b.add(m.identityPubkey);
        for (const m of (w == null ? void 0 : w.devices.keys()) ?? [])
          m && m !== this.deviceId && b.add(m);
        if (b.size > 0)
          for (const m of b)
            await this.messageQueue.add(m, r);
        else
          await this.discoveryQueue.add(p, r);
      }
      const s = this.getOrCreateUserRecord(e), o = this.getOrCreateUserRecord(this.ownerPublicKey), a = Array.from(s.devices.values()), c = Array.from(o.devices.values()), u = /* @__PURE__ */ new Map();
      for (const p of [...a, ...c])
        p.deviceId !== this.deviceId && u.set(p.deviceId, p);
      const h = Array.from(u.values()), d = [], y = [];
      for (const p of h) {
        const { activeSession: w } = p;
        if (!w)
          continue;
        const b = this.resolveToOwner(p.deviceId);
        if (!(b !== p.deviceId && !this.isDeviceAuthorized(b, p.deviceId)))
          try {
            const { event: m } = w.sendEvent(t);
            d.push(m), y.push(p.deviceId);
          } catch {
          }
      }
      return await this.storeUserRecord(e).catch(() => {
      }), this.ownerPublicKey !== e && await this.storeUserRecord(this.ownerPublicKey).catch(() => {
      }), await Promise.allSettled(
        d.map(
          (p, w) => this.nostrPublish(p).then(() => {
            const b = y[w];
            this.messageQueue.removeByTargetAndEventId(b, t.id).catch(() => {
            }), this.flushMessageQueue(b).catch(() => {
            });
          })
        )
      ), r;
    }
    async sendMessage(e, t, r = {}) {
      var u;
      const { kind: i = Je, tags: s = [] } = r, o = Date.now(), a = this.buildMessageTags(e, s), c = {
        content: t,
        kind: i,
        created_at: Math.floor(o / 1e3),
        tags: a,
        pubkey: this.ourPublicKey,
        id: ""
        // Will compute next
      };
      if (c.tags.some(([h]) => h === "ms") || c.tags.push(["ms", String(o)]), i !== yt && i !== Mt) {
        const h = Math.floor(o / 1e3), d = (u = a.find((p) => p[0] === "l")) == null ? void 0 : u[1];
        let y = r.expiration;
        const f = r.expiresAt !== void 0 || r.ttlSeconds !== void 0;
        if (y === void 0 && f && (y = { expiresAt: r.expiresAt, ttlSeconds: r.ttlSeconds }), y !== null) {
          let p = false, w;
          if (y !== void 0)
            w = y;
          else if (d && this.groupExpiration.has(d)) {
            const b = this.groupExpiration.get(d);
            b === null ? p = true : w = b;
          } else if (this.peerExpiration.has(e)) {
            const b = this.peerExpiration.get(e);
            b === null ? p = true : w = b;
          } else
            w = this.defaultExpiration;
          if (!p && w) {
            const b = Dn(w, h);
            b !== void 0 && Ws(c.tags, b);
          }
        }
      }
      return c.id = ge(c), this.sendEvent(e, c).catch(() => {
      }), c;
    }
    /**
     * Send an encrypted 1:1 chat settings event (inner kind 10448).
     *
     * Settings events themselves should never expire; they are sent without a NIP-40 expiration tag.
     */
    async sendChatSettings(e, t) {
      const r = {
        type: "chat-settings",
        v: 1,
        messageTtlSeconds: t
      };
      return this.sendMessage(e, JSON.stringify(r), {
        kind: Mt,
        expiration: null
      });
    }
    /**
     * Convenience: set per-peer disappearing-message TTL and notify the peer via a settings event.
     *
     * `messageTtlSeconds`:
     * - `> 0`: set per-peer ttlSeconds
     * - `0` or `null`: disable per-peer expiration even if a global default exists
     * - `undefined`: clear per-peer override (fall back to global default)
     */
    async setChatSettingsForPeer(e, t) {
      return t === void 0 ? await this.setExpirationForPeer(e, void 0) : t === null || t === 0 ? await this.setExpirationForPeer(e, null) : await this.setExpirationForPeer(e, { ttlSeconds: t }), this.sendChatSettings(e, t);
    }
    async sendReceipt(e, t, r) {
      if (r.length !== 0)
        return this.sendMessage(e, t, {
          kind: vr,
          tags: r.map((i) => ["e", i])
        });
    }
    async sendTyping(e) {
      return this.sendMessage(e, "typing", {
        kind: wr
      });
    }
    maybeAutoAdoptChatSettings(e, t) {
      var u, h;
      if (!this.autoAdoptChatSettings || e.kind !== Mt) return;
      let r;
      try {
        r = JSON.parse(e.content);
      } catch {
        return;
      }
      const i = r;
      if ((i == null ? void 0 : i.type) !== "chat-settings" || (i == null ? void 0 : i.v) !== 1) return;
      const s = (h = (u = e.tags) == null ? void 0 : u.find((d) => d[0] === "p")) == null ? void 0 : h[1], o = this.ownerPublicKey, a = s && s !== o ? s : t && t !== o ? t : void 0;
      if (!a || a === o) return;
      const c = i.messageTtlSeconds;
      if (c === void 0) {
        this.setExpirationForPeer(a, void 0).catch(() => {
        });
        return;
      }
      if (c === null) {
        this.setExpirationForPeer(a, null).catch(() => {
        });
        return;
      }
      if (!(typeof c != "number" || !Number.isFinite(c) || !Number.isSafeInteger(c) || c < 0)) {
        if (c === 0) {
          this.setExpirationForPeer(a, null).catch(() => {
          });
          return;
        }
        this.setExpirationForPeer(a, { ttlSeconds: c }).catch(() => {
        });
      }
    }
    buildMessageTags(e, t) {
      return t.some(
        (s) => s[0] === "p" && s[1] === e
      ) ? [...t] : [["p", e], ...t];
    }
    storeUserRecord(e) {
      var u;
      const t = this.userRecords.get(e), r = Array.from((t == null ? void 0 : t.devices.entries()) || []), i = (h) => ({
        name: h.name,
        state: ad(h.state)
      }), s = {
        publicKey: e,
        devices: r.map(
          ([, h]) => ({
            deviceId: h.deviceId,
            activeSession: h.activeSession ? i(h.activeSession) : null,
            inactiveSessions: h.inactiveSessions.map(i),
            createdAt: h.createdAt
          })
        ),
        appKeys: (u = t == null ? void 0 : t.appKeys) == null ? void 0 : u.serialize()
      }, o = this.userRecordKey(e), c = (this.userRecordWriteChain.get(o) || Promise.resolve()).catch(() => {
      }).then(() => this.storage.put(o, s));
      return this.userRecordWriteChain.set(o, c), c;
    }
    loadUserRecord(e) {
      return this.storage.get(this.userRecordKey(e)).then((t) => {
        if (!t) return;
        const r = this.getOrCreateUserRecord(e);
        r.close(), r.devices.clear();
        const i = (o) => {
          const a = new Wt(this.nostrSubscribe, cd(o.state));
          return a.name = o.name, this.processedInviteResponses.add(o.name), a;
        };
        let s;
        if (t.appKeys)
          try {
            s = G.deserialize(t.appKeys);
          } catch {
          }
        if (r.setAppKeys(s), s)
          for (const o of s.getAllDevices())
            o.identityPubkey && this.delegateToOwner.set(o.identityPubkey, e);
        for (const o of t.devices) {
          const {
            deviceId: a,
            activeSession: c,
            inactiveSessions: u,
            createdAt: h
          } = o;
          try {
            const d = r.ensureDevice(a, h);
            for (const y of u.map(i).reverse())
              d.installSession(y, true, { persist: false });
            c && d.installSession(i(c), false, { persist: false });
          } catch {
          }
        }
      }).catch(() => {
      });
    }
    loadAllUserRecords() {
      const e = this.userRecordKeyPrefix();
      return this.storage.list(e).then((t) => Promise.all(
        t.map((r) => {
          const i = r.slice(e.length);
          return this.loadUserRecord(i);
        })
      ));
    }
    async runMigrations() {
      let e = await this.storage.get(this.versionKey());
      if (!e) {
        const r = await this.storage.list("invite/");
        await Promise.all(r.map((o) => this.storage.del(o)));
        const i = "user/", s = await this.storage.list(i);
        await Promise.all(
          s.map(async (o) => {
            try {
              const a = o.slice(i.length), c = await this.storage.get(o);
              if (c) {
                const u = this.userRecordKey(a), h = {
                  publicKey: c.publicKey,
                  devices: c.devices.map((d) => ({
                    deviceId: d.deviceId,
                    activeSession: null,
                    createdAt: d.createdAt,
                    inactiveSessions: []
                  }))
                };
                await this.storage.put(u, h), await this.storage.del(o);
              }
            } catch {
            }
          })
        ), e = "1", await this.storage.put(this.versionKey(), e);
      }
    }
  };
  l(le, "INVITE_BOOTSTRAP_EXPIRATION_SECONDS", 60), l(le, "INVITE_BOOTSTRAP_RETRY_DELAYS_MS", [0, 500, 1500]);
  var Bn = le;
  var Ld = class {
    constructor(e) {
      l(this, "nostrPublish");
      l(this, "storage");
      l(this, "ownerIdentityKey");
      l(this, "appKeys", null);
      l(this, "initialized", false);
      l(this, "storageVersion", "3");
      this.nostrPublish = e.nostrPublish, this.storage = e.storage || new Xe(), this.ownerIdentityKey = e.ownerIdentityKey;
    }
    get versionPrefix() {
      return `v${this.storageVersion}`;
    }
    async init() {
      this.initialized || (this.initialized = true, this.appKeys = await this.loadAppKeys(), this.appKeys || (this.appKeys = new G()));
    }
    getAppKeys() {
      return this.appKeys;
    }
    getOwnDevices() {
      var e;
      return ((e = this.appKeys) == null ? void 0 : e.getAllDevices()) || [];
    }
    /**
     * Add a device to the AppKeys.
     * Only adds identity info - the device publishes its own Invite separately.
     * This is a local-only operation - call publish() to publish to relays.
     */
    addDevice(e) {
      this.appKeys || (this.appKeys = new G());
      const t = {
        identityPubkey: e.identityPubkey,
        createdAt: Math.floor(Date.now() / 1e3)
      };
      this.appKeys.addDevice(t), (e.deviceLabel || e.clientLabel) && this.appKeys.setDeviceLabels(e.identityPubkey, {
        deviceLabel: e.deviceLabel,
        clientLabel: e.clientLabel
      }), this.saveAppKeys(this.appKeys).catch(() => {
      });
    }
    setDeviceLabels(e, t) {
      this.appKeys || (this.appKeys = new G()), this.appKeys.setDeviceLabels(e, t), this.saveAppKeys(this.appKeys).catch(() => {
      });
    }
    getDeviceLabels(e) {
      var t;
      return (t = this.appKeys) == null ? void 0 : t.getDeviceLabels(e);
    }
    /**
     * Revoke a device from the AppKeys.
     * This is a local-only operation - call publish() to publish to relays.
     */
    revokeDevice(e) {
      this.appKeys && (this.appKeys.removeDevice(e), this.saveAppKeys(this.appKeys).catch(() => {
      }));
    }
    /**
     * Publish the current AppKeys to relays.
     * This is the only way to publish - addDevice/revokeDevice are local-only.
     */
    async publish() {
      this.appKeys || (this.appKeys = new G());
      const e = this.appKeys.getEvent(this.ownerIdentityKey);
      await this.nostrPublish(e);
    }
    /**
     * Replace the local AppKeys with the given list and save to storage.
     * Used for authority transfer - receive list from another device, then call publish().
     */
    async setAppKeys(e) {
      this.appKeys = e, await this.saveAppKeys(e);
    }
    /**
     * Cleanup resources. Currently a no-op but kept for API consistency.
     */
    close() {
    }
    appKeysKey() {
      return `${this.versionPrefix}/app-keys-manager/app-keys`;
    }
    async loadAppKeys() {
      const e = await this.storage.get(this.appKeysKey());
      if (!e) return null;
      try {
        return G.deserialize(e);
      } catch {
        return null;
      }
    }
    async saveAppKeys(e) {
      await this.storage.put(this.appKeysKey(), e.serialize());
    }
  };
  var Ud = class {
    constructor(e) {
      l(this, "nostrSubscribe");
      l(this, "nostrPublish");
      l(this, "storage");
      l(this, "devicePublicKey", "");
      l(this, "devicePrivateKey", new Uint8Array());
      l(this, "invite", null);
      l(this, "ownerPubkeyFromActivation");
      l(this, "initialized", false);
      l(this, "subscriptions", []);
      l(this, "storageVersion", "1");
      this.nostrSubscribe = e.nostrSubscribe, this.nostrPublish = e.nostrPublish, this.storage = e.storage || new Xe();
    }
    get versionPrefix() {
      return `v${this.storageVersion}`;
    }
    async init() {
      if (this.initialized) return;
      this.initialized = true;
      const e = await this.storage.get(this.identityPublicKeyKey()), t = await this.storage.get(this.identityPrivateKeyKey());
      e && t ? (this.devicePublicKey = e, this.devicePrivateKey = new Uint8Array(t)) : (this.devicePrivateKey = me(), this.devicePublicKey = ie(this.devicePrivateKey), await this.storage.put(this.identityPublicKeyKey(), this.devicePublicKey), await this.storage.put(this.identityPrivateKeyKey(), Array.from(this.devicePrivateKey)));
      const r = await this.storage.get(this.ownerPubkeyKey());
      r && (this.ownerPubkeyFromActivation = r);
      const i = await this.loadInvite();
      this.invite = i || fe.createNew(this.devicePublicKey, this.devicePublicKey), await this.saveInvite(this.invite);
    }
    /**
     * Get the registration payload for adding this device to an AppKeysManager.
     * Must be called after init().
     */
    getRegistrationPayload() {
      return { identityPubkey: this.devicePublicKey };
    }
    getIdentityPublicKey() {
      return this.devicePublicKey;
    }
    getIdentityKey() {
      return this.devicePrivateKey;
    }
    getInvite() {
      return this.invite;
    }
    getOwnerPublicKey() {
      return this.ownerPubkeyFromActivation || null;
    }
    /**
     * Publish the current device invite.
     * Clients should call this only after activation/session-manager setup so
     * invite responses are observed by the active listener.
     */
    async publishInvite() {
      if (await this.init(), !this.invite)
        throw new Error("Invite not initialized");
      const e = this.invite.getEvent(), t = oe(e, this.devicePrivateKey);
      await this.nostrPublish(t);
    }
    /**
     * Rotate this device's invite - generates new ephemeral keys and shared secret.
     */
    async rotateInvite() {
      await this.init(), this.invite = fe.createNew(this.devicePublicKey, this.devicePublicKey), await this.saveInvite(this.invite), await this.publishInvite();
    }
    /**
     * Activate this device with a known owner.
     * Use this when you know the device has been added (e.g., main device adding itself).
     * Skips fetching from relay - just stores the owner pubkey.
     */
    async activate(e) {
      this.ownerPubkeyFromActivation = e, await this.storage.put(this.ownerPubkeyKey(), e);
    }
    /**
     * Wait for this device to be activated (added to an AppKeys).
     * Returns the owner's public key once activated.
     * For delegate devices that don't know the owner ahead of time.
     */
    async waitForActivation(e = 6e4) {
      return this.ownerPubkeyFromActivation ? this.ownerPubkeyFromActivation : new Promise((t, r) => {
        const i = setTimeout(() => {
          s(), r(new Error("Activation timeout"));
        }, e), s = this.nostrSubscribe(
          at(),
          async (o) => {
            try {
              G.fromEvent(o).getDevice(this.devicePublicKey) && (clearTimeout(i), s(), this.ownerPubkeyFromActivation = o.pubkey, await this.storage.put(this.ownerPubkeyKey(), o.pubkey), t(o.pubkey));
            } catch {
            }
          }
        );
        this.subscriptions.push(s);
      });
    }
    /**
     * Check if this device has been revoked from the owner's AppKeys.
     * @param options.timeoutMs - Timeout for each attempt (default 2000ms)
     * @param options.retries - Number of retry attempts (default 2)
     */
    async isRevoked(e = {}) {
      const { timeoutMs: t = 2e3, retries: r = 2 } = e, i = this.getOwnerPublicKey();
      if (!i) return false;
      for (let s = 0; s <= r; s++) {
        const o = await G.waitFor(i, this.nostrSubscribe, t);
        if (o)
          return !o.getDevice(this.devicePublicKey);
      }
      return true;
    }
    close() {
      for (const e of this.subscriptions)
        e();
      this.subscriptions = [];
    }
    /**
     * Create a SessionManager for this device.
     */
    createSessionManager(e) {
      if (!this.initialized)
        throw new Error("DelegateManager must be initialized before creating SessionManager");
      const t = this.getOwnerPublicKey();
      if (!t)
        throw new Error("Owner public key required for SessionManager - device must be activated first");
      if (!this.invite || !this.invite.inviterEphemeralPrivateKey)
        throw new Error("Invite with ephemeral keys required for SessionManager");
      const r = {
        publicKey: this.invite.inviterEphemeralPublicKey,
        privateKey: this.invite.inviterEphemeralPrivateKey
      }, i = this.invite.sharedSecret;
      return new Bn(
        this.devicePublicKey,
        this.devicePrivateKey,
        this.devicePublicKey,
        // Use identityPubkey as deviceId
        this.nostrSubscribe,
        this.nostrPublish,
        t,
        { ephemeralKeypair: r, sharedSecret: i },
        e || this.storage
      );
    }
    ownerPubkeyKey() {
      return `${this.versionPrefix}/device-manager/owner-pubkey`;
    }
    inviteKey() {
      return `${this.versionPrefix}/device-manager/invite`;
    }
    async loadInvite() {
      const e = await this.storage.get(this.inviteKey());
      if (!e) return null;
      try {
        return fe.deserialize(e);
      } catch {
        return null;
      }
    }
    async saveInvite(e) {
      await this.storage.put(this.inviteKey(), e.serialize());
    }
    identityPublicKeyKey() {
      return `${this.versionPrefix}/device-manager/identity-public-key`;
    }
    identityPrivateKeyKey() {
      return `${this.versionPrefix}/device-manager/identity-private-key`;
    }
  };
  var bl = class {
    constructor(e) {
      l(this, "publicKey");
      l(this, "secretKey");
      l(this, "conversationKey");
      this.secretKey = e, this.publicKey = ie(e), this.conversationKey = Oe.utils.getConversationKey(
        e,
        this.publicKey
      );
    }
    /** Encrypt a Rumor and return a signed outer event ready for publishing */
    createEvent(e) {
      const t = JSON.stringify(e), r = Oe.encrypt(t, this.conversationKey);
      return oe(
        {
          kind: Vr,
          content: r,
          tags: [["p", this.publicKey]],
          created_at: Math.floor(Date.now() / 1e3)
        },
        this.secretKey
      );
    }
    /** Decrypt an outer event and return the inner Rumor */
    decryptEvent(e) {
      const t = Oe.decrypt(e.content, this.conversationKey);
      return JSON.parse(t);
    }
    /** Check if an event belongs to this channel */
    isChannelEvent(e) {
      return e.pubkey === this.publicKey && e.kind === Vr;
    }
  };
  function Kr(n) {
    const e = globalThis.Buffer;
    if (e)
      return e.from(n).toString("base64");
    if (typeof btoa != "function")
      throw new Error("base64Encode: no base64 encoder available");
    let t = "";
    const r = 32768;
    for (let i = 0; i < n.length; i += r) {
      const s = n.subarray(i, i + r);
      t += String.fromCharCode(...s);
    }
    return btoa(t);
  }
  function Tn(n) {
    const e = globalThis.Buffer;
    if (e)
      return new Uint8Array(e.from(n, "base64"));
    if (typeof atob != "function")
      throw new Error("base64Decode: no base64 decoder available");
    const t = atob(n), r = new Uint8Array(t.length);
    for (let i = 0; i < t.length; i++)
      r[i] = t.charCodeAt(i);
    return r;
  }
  var $d = class {
    constructor(e, t, r) {
      this.keyId = e, this.messageNumber = t, this.ciphertext = r;
    }
    decrypt(e) {
      return e.decryptFromBytes(this.messageNumber, this.ciphertext);
    }
  };
  var en = class _en {
    constructor(e = be) {
      l(this, "outerKind");
      this.outerKind = e;
    }
    static default() {
      return new _en(be);
    }
    outerEventKind() {
      return this.outerKind;
    }
    buildOuterContent(e, t, r) {
      const i = new Uint8Array(8 + r.length), s = new DataView(i.buffer);
      return s.setUint32(0, e >>> 0, false), s.setUint32(4, t >>> 0, false), i.set(r, 8), Kr(i);
    }
    parseOuterContent(e) {
      const t = Tn(e);
      if (t.length < 8)
        throw new Error("one-to-many payload too short");
      const r = new DataView(t.buffer, t.byteOffset, t.byteLength), i = r.getUint32(0, false), s = r.getUint32(4, false), o = t.subarray(8);
      return new $d(i, s, o);
    }
    encryptToOuterEvent(e, t, r, i) {
      const { messageNumber: s, ciphertext: o } = t.encryptToBytes(r), a = this.buildOuterContent(t.keyId, s, o);
      return oe(
        {
          kind: this.outerKind,
          content: a,
          tags: [],
          created_at: i
        },
        e
      );
    }
  };
  var ni = 1e4;
  var ri = 2e3;
  var Fd = new TextEncoder().encode("ndr-sender-key-v1");
  function wn(n) {
    const [e, t] = He(n, Fd, 2);
    return [e, t];
  }
  function ii(n, e) {
    const t = Kr(e);
    return Oe.decrypt(t, n);
  }
  var Ve = class _Ve {
    constructor(e, t, r) {
      l(this, "keyId");
      l(this, "chainKey");
      l(this, "iteration");
      l(this, "skippedMessageKeys");
      if (!Number.isInteger(e) || e < 0 || e > 4294967295)
        throw new Error("Invalid keyId (expected u32)");
      if (!(t instanceof Uint8Array) || t.length !== 32)
        throw new Error("Invalid chainKey (expected 32 bytes)");
      if (!Number.isInteger(r) || r < 0 || r > 4294967295)
        throw new Error("Invalid iteration (expected u32)");
      this.keyId = e >>> 0, this.chainKey = new Uint8Array(t), this.iteration = r >>> 0, this.skippedMessageKeys = /* @__PURE__ */ new Map();
    }
    chainKeyBytes() {
      return new Uint8Array(this.chainKey);
    }
    iterationNumber() {
      return this.iteration;
    }
    skippedLen() {
      return this.skippedMessageKeys.size;
    }
    encryptToBytes(e) {
      const t = this.iteration, [r, i] = wn(this.chainKey);
      this.chainKey = r, this.iteration = this.iteration + 1 >>> 0;
      const s = Oe.encrypt(e, i), o = Tn(s);
      return { messageNumber: t, ciphertext: o };
    }
    encrypt(e) {
      const { messageNumber: t, ciphertext: r } = this.encryptToBytes(e);
      return { messageNumber: t, ciphertext: Kr(r) };
    }
    decryptFromBytes(e, t) {
      const r = e >>> 0;
      if (r < this.iteration) {
        const a = this.skippedMessageKeys.get(r);
        if (!a)
          throw new Error("Missing skipped sender key message");
        return this.skippedMessageKeys.delete(r), ii(a, t);
      }
      if (r - this.iteration >>> 0 > ni)
        throw new Error("TooManySkippedMessages");
      for (; this.iteration < r; ) {
        const [a, c] = wn(this.chainKey);
        this.chainKey = a, this.skippedMessageKeys.set(this.iteration, c), this.iteration = this.iteration + 1 >>> 0;
      }
      const [s, o] = wn(this.chainKey);
      return this.chainKey = s, this.iteration = this.iteration + 1 >>> 0, this.pruneSkipped(), ii(o, t);
    }
    decrypt(e, t) {
      const r = e >>> 0;
      if (r >= this.iteration && r - this.iteration >>> 0 > ni)
        throw new Error("TooManySkippedMessages");
      const i = Tn(t);
      return this.decryptFromBytes(r, i);
    }
    toJSON() {
      const e = {};
      for (const [t, r] of this.skippedMessageKeys.entries())
        e[String(t)] = ae(r);
      return {
        keyId: this.keyId,
        chainKey: ae(this.chainKey),
        iteration: this.iteration,
        skippedMessageKeys: Object.keys(e).length ? e : void 0
      };
    }
    static fromJSON(e) {
      const t = new _Ve(e.keyId, J(e.chainKey), e.iteration);
      if (e.skippedMessageKeys)
        for (const [r, i] of Object.entries(e.skippedMessageKeys)) {
          const s = Number.parseInt(r, 10);
          if (!Number.isFinite(s)) continue;
          const o = J(i);
          o.length === 32 && t.skippedMessageKeys.set(s >>> 0, o);
        }
      return t;
    }
    static fromDistribution(e) {
      return new _Ve(e.keyId, J(e.chainKey), e.iteration);
    }
    pruneSkipped() {
      if (this.skippedMessageKeys.size <= ri)
        return;
      const e = Array.from(this.skippedMessageKeys.keys()).sort((r, i) => r - i), t = this.skippedMessageKeys.size - ri;
      for (const r of e.slice(0, t))
        this.skippedMessageKeys.delete(r);
    }
  };
  function si(n, e) {
    const t = n == null ? void 0 : n.find((r) => r[0] === e);
    return t == null ? void 0 : t[1];
  }
  function oi() {
    const n = new Uint32Array(1);
    return crypto.getRandomValues(n), n[0] >>> 0;
  }
  function Fe(n) {
    return typeof n == "string" && /^[0-9a-f]{64}$/i.test(n);
  }
  function Gd(n) {
    try {
      const e = JSON.parse(n);
      return !e || typeof e != "object" || typeof e.groupId != "string" || typeof e.keyId != "number" || !Number.isInteger(e.keyId) || e.keyId < 0 || typeof e.chainKey != "string" || !/^[0-9a-f]{64}$/i.test(e.chainKey) || typeof e.iteration != "number" || !Number.isInteger(e.iteration) || e.iteration < 0 || typeof e.createdAt != "number" || !Number.isInteger(e.createdAt) || e.createdAt < 0 || e.senderEventPubkey !== void 0 && typeof e.senderEventPubkey != "string" ? null : e;
    } catch {
      return null;
    }
  }
  var bn = class {
    // key: `${senderEventPubkey}:${keyId}`
    constructor(e) {
      l(this, "data");
      l(this, "ourOwnerPubkey");
      l(this, "ourDevicePubkey");
      l(this, "memberOwnerPubkeys");
      l(this, "storage");
      l(this, "oneToMany");
      l(this, "storageVersion", "1");
      l(this, "versionPrefix");
      l(this, "initialized", false);
      l(this, "senderDeviceToEvent", /* @__PURE__ */ new Map());
      l(this, "senderEventToDevice", /* @__PURE__ */ new Map());
      l(this, "senderDeviceToOwner", /* @__PURE__ */ new Map());
      l(this, "pendingOuter", /* @__PURE__ */ new Map());
      this.data = e.data, this.ourOwnerPubkey = e.ourOwnerPubkey, this.ourDevicePubkey = e.ourDevicePubkey, this.memberOwnerPubkeys = [...e.data.members], this.storage = e.storage || new Xe(), this.oneToMany = e.oneToMany || en.default(), this.versionPrefix = `v${this.storageVersion}/broadcast-channel`;
    }
    groupId() {
      return this.data.id;
    }
    setData(e) {
      this.data = e, this.memberOwnerPubkeys = [...e.members];
    }
    setMembers(e) {
      this.memberOwnerPubkeys = [...e];
    }
    async listSenderEventPubkeys() {
      return await this.init(), await this.purgeInactiveSenders(), Array.from(new Set(this.senderDeviceToEvent.values()));
    }
    async getSenderEventPubkeyForDevice(e) {
      return await this.init(), await this.purgeInactiveSenders(), this.senderDeviceToEvent.get(e);
    }
    async init() {
      if (this.initialized) return;
      this.initialized = true;
      const e = `${this.versionPrefix}/group/${this.groupId()}/sender/`, t = await this.storage.list(e);
      for (const r of t)
        if (r.endsWith("/sender-event-pubkey")) {
          const i = r.slice(e.length).split("/")[0], s = await this.storage.get(r);
          typeof s == "string" && Fe(s) && Fe(i) && this.setSenderEventMapping(i, s);
        } else if (r.endsWith("/sender-owner-pubkey")) {
          const i = r.slice(e.length).split("/")[0], s = await this.storage.get(r);
          typeof s == "string" && Fe(i) && this.senderDeviceToOwner.set(i, s);
        }
    }
    groupSenderPrefix(e) {
      return `${this.versionPrefix}/group/${this.groupId()}/sender/${e}`;
    }
    senderEventSecretKeyKey(e) {
      return `${this.groupSenderPrefix(e)}/sender-event-secret-key`;
    }
    senderEventPubkeyKey(e) {
      return `${this.groupSenderPrefix(e)}/sender-event-pubkey`;
    }
    senderOwnerPubkeyKey(e) {
      return `${this.groupSenderPrefix(e)}/sender-owner-pubkey`;
    }
    latestKeyIdKey(e) {
      return `${this.groupSenderPrefix(e)}/latest-key-id`;
    }
    senderKeyStateKey(e, t) {
      return `${this.groupSenderPrefix(e)}/key/${t >>> 0}`;
    }
    setSenderEventMapping(e, t) {
      const r = this.senderDeviceToEvent.get(e);
      r && r !== t && this.senderEventToDevice.delete(r), this.senderDeviceToEvent.set(e, t), this.senderEventToDevice.set(t, e);
    }
    isMemberOwnerPubkey(e) {
      return this.memberOwnerPubkeys.includes(e);
    }
    isSenderDeviceActive(e) {
      if (e === this.ourDevicePubkey)
        return this.isMemberOwnerPubkey(this.ourOwnerPubkey);
      const t = this.senderDeviceToOwner.get(e);
      return typeof t == "string" && this.isMemberOwnerPubkey(t);
    }
    async removeSenderDeviceState(e) {
      const t = this.senderDeviceToEvent.get(e);
      if (t) {
        this.senderDeviceToEvent.delete(e), this.senderEventToDevice.delete(t);
        for (const s of Array.from(this.pendingOuter.keys()))
          s.startsWith(`${t}:`) && this.pendingOuter.delete(s);
      } else
        this.senderDeviceToEvent.delete(e);
      for (const [s, o] of Array.from(
        this.senderEventToDevice.entries()
      ))
        if (o === e) {
          this.senderEventToDevice.delete(s);
          for (const a of Array.from(this.pendingOuter.keys()))
            a.startsWith(`${s}:`) && this.pendingOuter.delete(a);
        }
      this.senderDeviceToOwner.delete(e);
      const r = this.groupSenderPrefix(e), i = await this.storage.list(r);
      await Promise.allSettled(i.map((s) => this.storage.del(s)));
    }
    async purgeInactiveSenders() {
      const e = /* @__PURE__ */ new Set([
        ...this.senderDeviceToEvent.keys(),
        ...this.senderDeviceToOwner.keys(),
        ...this.senderEventToDevice.values()
      ]);
      for (const t of e)
        this.isSenderDeviceActive(t) || await this.removeSenderDeviceState(t);
    }
    pendingKey(e, t) {
      return `${e}:${t >>> 0}`;
    }
    queuePending(e, t, r) {
      const i = this.pendingKey(e, t), s = this.pendingOuter.get(i) || [];
      s.push(r), this.pendingOuter.set(i, s);
    }
    async drainPending(e, t) {
      const r = this.pendingKey(e, t), i = this.pendingOuter.get(r);
      if (!i || i.length === 0) return [];
      this.pendingOuter.delete(r);
      const s = i.map((a) => {
        try {
          const c = this.oneToMany.parseOuterContent(a.content);
          return { outer: a, n: c.messageNumber };
        } catch {
          return { outer: a, n: 0 };
        }
      }).sort((a, c) => a.n - c.n), o = [];
      for (const { outer: a } of s) {
        const c = await this.handleOuterEvent(a);
        c && o.push(c);
      }
      return o;
    }
    async ensureOurSenderEventKeys() {
      await this.init();
      const e = await this.storage.get(this.senderEventSecretKeyKey(this.ourDevicePubkey));
      if (typeof e == "string" && /^[0-9a-f]{64}$/i.test(e)) {
        const i = J(e);
        if (i.length === 32) {
          const s = ie(i);
          return this.setSenderEventMapping(this.ourDevicePubkey, s), await this.storage.put(this.senderEventPubkeyKey(this.ourDevicePubkey), s), { senderEventSecretKey: i, senderEventPubkey: s, changed: false };
        }
      }
      const t = me(), r = ie(t);
      return await this.storage.put(this.senderEventSecretKeyKey(this.ourDevicePubkey), ae(t)), await this.storage.put(this.senderEventPubkeyKey(this.ourDevicePubkey), r), this.setSenderEventMapping(this.ourDevicePubkey, r), { senderEventSecretKey: t, senderEventPubkey: r, changed: true };
    }
    async loadSenderKeyState(e, t) {
      const r = await this.storage.get(this.senderKeyStateKey(e, t));
      if (!r) return null;
      try {
        return Ve.fromJSON(r);
      } catch {
        return null;
      }
    }
    async saveSenderKeyState(e, t) {
      await this.storage.put(this.senderKeyStateKey(e, t.keyId), t.toJSON());
    }
    async ensureOurSenderKeyState(e) {
      if (await this.init(), e) {
        const o = oi(), a = me(), c = new Ve(o, a, 0);
        return await this.saveSenderKeyState(this.ourDevicePubkey, c), await this.storage.put(this.latestKeyIdKey(this.ourDevicePubkey), o), { state: c, created: true };
      }
      const t = await this.storage.get(this.latestKeyIdKey(this.ourDevicePubkey));
      if (typeof t == "number" && Number.isInteger(t) && t >= 0) {
        const o = await this.loadSenderKeyState(this.ourDevicePubkey, t >>> 0);
        if (o)
          return { state: o, created: false };
      }
      const r = oi(), i = me(), s = new Ve(r, i, 0);
      return await this.saveSenderKeyState(this.ourDevicePubkey, s), await this.storage.put(this.latestKeyIdKey(this.ourDevicePubkey), r), { state: s, created: true };
    }
    buildDistribution(e, t, r) {
      return {
        groupId: this.groupId(),
        keyId: r.keyId,
        chainKey: ae(r.chainKeyBytes()),
        iteration: r.iterationNumber(),
        createdAt: e,
        senderEventPubkey: t
      };
    }
    buildDistributionRumor(e, t, r) {
      const i = {
        kind: wt,
        content: JSON.stringify(r),
        created_at: e,
        tags: [
          ["l", this.groupId()],
          ["key", String(r.keyId >>> 0)],
          ["ms", String(t)]
        ],
        pubkey: this.ourDevicePubkey,
        id: ""
      };
      return i.id = ge(i), i;
    }
    buildGroupInnerRumor(e, t, r) {
      const i = [...r.tags || []];
      i.some((o) => o[0] === "l") || i.unshift(["l", this.groupId()]), i.some((o) => o[0] === "ms") || i.push(["ms", String(t)]);
      const s = {
        kind: r.kind,
        content: r.content,
        created_at: e,
        tags: i,
        pubkey: this.ourDevicePubkey,
        id: ""
      };
      return s.id = ge(s), s;
    }
    senderKeyRecipientOwnerPubkeys() {
      return Array.from(
        new Set(
          this.memberOwnerPubkeys.filter((e) => typeof e == "string" && e.length > 0)
        )
      );
    }
    /**
     * Rotate our sender key (new keyId + chain key) and distribute it to group members.
     */
    async rotateSenderKey(e) {
      await this.init();
      const t = e.nowMs ?? Date.now(), r = Math.floor(t / 1e3), { senderEventPubkey: i } = await this.ensureOurSenderEventKeys(), { state: s } = await this.ensureOurSenderKeyState(true), o = this.buildDistribution(r, i, s), a = this.buildDistributionRumor(r, t, o);
      return await Promise.allSettled(
        this.senderKeyRecipientOwnerPubkeys().map((c) => e.sendPairwise(c, a))
      ), o;
    }
    /**
     * Send an inner group event over one-to-many transport.
     * - Ensures we have sender-event keys and a sender key state.
     * - Distributes sender key to group members if needed.
     * - Publishes exactly one outer event via OneToManyChannel.
     */
    async sendEvent(e, t) {
      await this.init();
      const r = t.nowMs ?? Date.now(), i = Math.floor(r / 1e3), { senderEventSecretKey: s, senderEventPubkey: o, changed: a } = await this.ensureOurSenderEventKeys(), { state: c, created: u } = await this.ensureOurSenderKeyState(false);
      if (u || a) {
        const f = this.buildDistribution(i, o, c), p = this.buildDistributionRumor(i, r, f);
        await Promise.allSettled(
          this.senderKeyRecipientOwnerPubkeys().map((w) => t.sendPairwise(w, p))
        );
      }
      const h = this.buildGroupInnerRumor(i, r, e), d = JSON.stringify(h), y = this.oneToMany.encryptToOuterEvent(s, c, d, i);
      return await this.saveSenderKeyState(this.ourDevicePubkey, c), await t.publishOuter(y), { outer: y, inner: h };
    }
    /**
     * Send a regular group chat message (kind 14).
     */
    async sendMessage(e, t) {
      return this.sendEvent(
        {
          kind: Je,
          content: e
        },
        t
      );
    }
    /**
     * Handle an incoming 1:1 session rumor (decrypted Double Ratchet event).
     *
     * Currently this only consumes sender-key distribution rumors (kind 10446) for this group.
     * It may return decrypted outer group events that were pending until the distribution arrived.
     *
     * `fromSenderDevicePubkey` must come from authenticated session context (not `event.pubkey`).
     */
    async handleIncomingSessionEvent(e, t, r) {
      if (await this.init(), !this.memberOwnerPubkeys.includes(t))
        return [];
      if (si(e.tags, "l") !== this.groupId()) return [];
      if (e.kind !== wt) return [];
      const s = Gd(e.content);
      if (!s) return [];
      if (s.groupId !== this.groupId()) return [];
      const o = r;
      if (!o || !Fe(o)) return [];
      if (Fe(e.pubkey) && e.pubkey !== o) return [];
      if (this.senderDeviceToOwner.set(o, t), await this.storage.put(this.senderOwnerPubkeyKey(o), t), s.senderEventPubkey && Fe(s.senderEventPubkey) && (this.setSenderEventMapping(o, s.senderEventPubkey), await this.storage.put(this.senderEventPubkeyKey(o), s.senderEventPubkey)), !await this.storage.get(this.senderKeyStateKey(o, s.keyId))) {
        const c = Ve.fromDistribution(s);
        await this.saveSenderKeyState(o, c);
      }
      return s.senderEventPubkey && Fe(s.senderEventPubkey) ? await this.drainPending(s.senderEventPubkey, s.keyId) : [];
    }
    /**
     * Handle an incoming one-to-many outer event (authored by a per-sender sender-event pubkey).
     *
     * Returns a decrypted inner rumor if possible, or null if we're missing mapping/state and queued it.
     */
    async handleOuterEvent(e) {
      if (await this.init(), await this.purgeInactiveSenders(), e.kind !== be || !ut(e)) return null;
      let t;
      try {
        const d = this.oneToMany.parseOuterContent(e.content);
        t = { keyId: d.keyId, messageNumber: d.messageNumber, ciphertext: d.ciphertext };
      } catch {
        return null;
      }
      const r = e.pubkey, i = this.senderEventToDevice.get(r);
      if (!i)
        return this.queuePending(r, t.keyId, e), null;
      if (!this.isSenderDeviceActive(i))
        return await this.removeSenderDeviceState(i), null;
      const s = await this.loadSenderKeyState(i, t.keyId);
      if (!s)
        return this.queuePending(r, t.keyId, e), null;
      let o;
      try {
        o = s.decryptFromBytes(t.messageNumber, t.ciphertext);
      } catch {
        return null;
      }
      await this.saveSenderKeyState(i, s);
      let a;
      try {
        a = JSON.parse(o);
      } catch {
        a = {
          kind: Je,
          content: o,
          created_at: e.created_at,
          tags: [["l", this.groupId()]],
          pubkey: i,
          id: ""
        }, a.id = ge(a);
      }
      const c = si(a.tags, "l");
      if (c && c !== this.groupId())
        return null;
      const u = this.senderDeviceToOwner.get(i) || await this.storage.get(this.senderOwnerPubkeyKey(i)) || void 0, h = Yt({
        ourOwnerPubkey: this.ourOwnerPubkey,
        ourDevicePubkey: this.ourDevicePubkey,
        senderOwnerPubkey: u,
        senderDevicePubkey: i
      });
      return {
        groupId: this.groupId(),
        senderEventPubkey: r,
        senderDevicePubkey: i,
        senderOwnerPubkey: u,
        origin: h,
        isSelf: Xt(h),
        isCrossDeviceSelf: Qt(h),
        outerEventId: e.id,
        outerCreatedAt: e.created_at,
        keyId: t.keyId,
        messageNumber: t.messageNumber,
        inner: a
      };
    }
  };
  function Hd(n, e) {
    const t = n == null ? void 0 : n.find((r) => r[0] === e);
    return t == null ? void 0 : t[1];
  }
  function zd(n) {
    return typeof n == "string" && /^[0-9a-f]{64}$/i.test(n);
  }
  function ai(n) {
    try {
      const e = JSON.parse(n);
      return !e || typeof e != "object" || typeof e.groupId != "string" || typeof e.keyId != "number" || !Number.isInteger(e.keyId) || e.keyId < 0 || typeof e.chainKey != "string" || !/^[0-9a-f]{64}$/i.test(e.chainKey) || typeof e.iteration != "number" || !Number.isInteger(e.iteration) || e.iteration < 0 || typeof e.createdAt != "number" || !Number.isInteger(e.createdAt) || e.createdAt < 0 || e.senderEventPubkey !== void 0 && typeof e.senderEventPubkey != "string" ? null : e;
    } catch {
      return null;
    }
  }
  var qd = class {
    constructor(e) {
      l(this, "ourOwnerPubkey");
      l(this, "ourDevicePubkey");
      l(this, "storage");
      l(this, "oneToMany");
      l(this, "nostrSubscribe");
      l(this, "nostrFetch");
      l(this, "onDecryptedEvent");
      l(this, "onError");
      l(this, "suppressLocalDeviceEcho");
      l(this, "outerBackfillLookbackSeconds");
      l(this, "outerBackfillDurationMs");
      l(this, "outerBackfillRetryDelaysMs");
      l(this, "groups", /* @__PURE__ */ new Map());
      l(this, "senderEventToGroup", /* @__PURE__ */ new Map());
      l(this, "groupToSenderEvents", /* @__PURE__ */ new Map());
      l(this, "pendingOuterBySenderEvent", /* @__PURE__ */ new Map());
      l(this, "pendingSessionByGroup", /* @__PURE__ */ new Map());
      l(this, "seenOuterEventIds", /* @__PURE__ */ new Set());
      l(this, "seenOuterEventOrder", []);
      l(this, "outerUnsubscribe", null);
      l(this, "outerAuthorsKey", "");
      l(this, "outerAuthors", []);
      l(this, "outerBackfillUnsubscribes", /* @__PURE__ */ new Set());
      l(this, "outerBackfillTimers", /* @__PURE__ */ new Set());
      l(this, "maxPendingPerSenderEvent", 128);
      l(this, "maxSeenOuterEventIds", 4096);
      l(this, "operationQueue", Promise.resolve());
      this.ourOwnerPubkey = e.ourOwnerPubkey, this.ourDevicePubkey = e.ourDevicePubkey, this.storage = e.storage || new Xe(), this.oneToMany = e.oneToMany || en.default(), this.nostrSubscribe = e.nostrSubscribe, this.nostrFetch = e.nostrFetch, this.onDecryptedEvent = e.onDecryptedEvent, this.onError = e.onError, this.suppressLocalDeviceEcho = e.suppressLocalDeviceEcho ?? true, this.outerBackfillLookbackSeconds = e.outerBackfillLookbackSeconds ?? 3600, this.outerBackfillDurationMs = e.outerBackfillDurationMs ?? 2e3, this.outerBackfillRetryDelaysMs = this.normalizeRetryDelays(
        e.outerBackfillRetryDelaysMs ?? [0, 500, 1500]
      );
    }
    enqueueOperation(e) {
      const r = this.operationQueue.catch(() => {
      }).then(e);
      return this.operationQueue = r.then(
        () => {
        },
        () => {
        }
      ), r;
    }
    async upsertGroup(e) {
      await this.enqueueOperation(async () => {
        const t = e.id;
        let r = this.groups.get(t);
        r ? r.setData(e) : (r = new bn({
          data: e,
          ourOwnerPubkey: this.ourOwnerPubkey,
          ourDevicePubkey: this.ourDevicePubkey,
          storage: this.storage,
          oneToMany: this.oneToMany
        }), this.groups.set(t, r)), await this.refreshGroupSenderMappings(t), await this.syncOuterSubscription();
      });
    }
    removeGroup(e) {
      this.groups.delete(e), this.pendingSessionByGroup.delete(e);
      const t = this.groupToSenderEvents.get(e);
      if (t)
        for (const r of t)
          this.senderEventToGroup.get(r) === e && this.senderEventToGroup.delete(r), this.pendingOuterBySenderEvent.delete(r);
      this.groupToSenderEvents.delete(e), this.syncOuterSubscription();
    }
    destroy() {
      var e;
      try {
        (e = this.outerUnsubscribe) == null || e.call(this);
      } catch {
      }
      this.outerUnsubscribe = null, this.outerAuthorsKey = "", this.outerAuthors = [], this.clearOuterBackfills(), this.groups.clear(), this.senderEventToGroup.clear(), this.groupToSenderEvents.clear(), this.pendingOuterBySenderEvent.clear(), this.pendingSessionByGroup.clear(), this.seenOuterEventIds.clear(), this.seenOuterEventOrder.length = 0;
    }
    /**
     * High-level helper for app flows:
     * - Creates local group data and stores it in this manager.
     * - By default, fans out group metadata (kind 40) to members over pairwise sessions.
     *
     * Note: `createGroupData` remains pure/local-only. Use this method when you want
     * creation + delivery in one step.
     */
    async createGroup(e, t, r = {}) {
      return this.enqueueOperation(async () => {
        const i = Dd(e, this.ourOwnerPubkey, t);
        let s = this.groups.get(i.id);
        if (s ? s.setData(i) : (s = new bn({
          data: i,
          ourOwnerPubkey: this.ourOwnerPubkey,
          ourDevicePubkey: this.ourDevicePubkey,
          storage: this.storage,
          oneToMany: this.oneToMany
        }), this.groups.set(i.id, s)), await this.refreshGroupSenderMappings(i.id), await this.syncOuterSubscription(), !(r.fanoutMetadata ?? true))
          return {
            group: i,
            fanout: {
              enabled: false,
              attempted: 0,
              succeeded: [],
              failed: []
            }
          };
        if (!r.sendPairwise)
          throw new Error("sendPairwise is required when fanoutMetadata is enabled");
        const a = r.nowMs ?? Date.now(), c = {
          kind: yt,
          content: Rd(i),
          created_at: Math.floor(a / 1e3),
          tags: [
            ["l", i.id],
            ["ms", String(a)]
          ],
          pubkey: this.ourDevicePubkey,
          id: ""
        };
        c.id = ge(c);
        const u = i.members.filter((f) => f !== this.ourOwnerPubkey), h = await Promise.allSettled(
          u.map(async (f) => {
            const p = {
              ...c,
              tags: [...c.tags, ["p", f]]
            };
            return p.id = ge(p), await r.sendPairwise(f, p), f;
          })
        ), d = [], y = [];
        for (let f = 0; f < h.length; f += 1) {
          const p = h[f], w = u[f];
          p.status === "fulfilled" ? d.push(w) : y.push(w);
        }
        return {
          group: i,
          metadataRumor: c,
          fanout: {
            enabled: true,
            attempted: u.length,
            succeeded: d,
            failed: y
          }
        };
      });
    }
    async sendMessage(e, t, r) {
      return this.sendEvent(
        e,
        {
          kind: Je,
          content: t
        },
        r
      );
    }
    async sendEvent(e, t, r) {
      return this.enqueueOperation(async () => {
        const i = this.groups.get(e);
        if (!i)
          throw new Error(`Unknown group: ${e}`);
        try {
          const s = await i.sendEvent(t, r);
          return await this.refreshGroupSenderMappings(e), await this.syncOuterSubscription(), s;
        } catch (s) {
          throw this.reportError(s, { operation: "sendEvent", groupId: e }), s;
        }
      });
    }
    async rotateSenderKey(e, t) {
      return this.enqueueOperation(async () => {
        const r = this.groups.get(e);
        if (!r)
          throw new Error(`Unknown group: ${e}`);
        try {
          const i = await r.rotateSenderKey(t);
          return await this.refreshGroupSenderMappings(e), await this.syncOuterSubscription(), i;
        } catch (i) {
          throw this.reportError(i, { operation: "rotateSenderKey", groupId: e }), i;
        }
      });
    }
    async handleIncomingSessionEvent(e, t, r) {
      return this.enqueueOperation(async () => {
        let s = Hd(e.tags, "l"), o = null, a = null;
        if (e.kind === wt ? (o = ai(e.content), o != null && o.groupId && (s = o.groupId)) : e.kind === yt && (a = ti(e.content), !s && (a != null && a.id) && (s = a.id)), !s) return [];
        try {
          if (e.kind === yt) {
            const d = await this.handleIncomingMetadataEvent(
              s,
              e,
              t,
              r,
              a
            ), y = this.routeIncomingEvents(d);
            return this.emitDecryptedEvents(y), y;
          }
          const c = this.groups.get(s);
          if (!c)
            return this.queuePendingSessionEvent(
              s,
              e,
              t,
              r
            ), [];
          const u = await this.handleIncomingSessionEventForKnownGroup(
            s,
            c,
            e,
            t,
            r,
            o
          ), h = this.routeIncomingEvents(u);
          return this.emitDecryptedEvents(h), h;
        } catch (c) {
          return this.reportError(c, { operation: "handleIncomingSessionEvent", groupId: s, eventId: e.id }), [];
        }
      });
    }
    async handleOuterEvent(e) {
      return this.enqueueOperation(async () => {
        if (e.kind !== this.oneToMany.outerEventKind() || this.hasSeenOuterEvent(e.id)) return null;
        this.rememberOuterEvent(e.id);
        const t = e.pubkey, r = this.senderEventToGroup.get(t);
        if (!r)
          return this.queuePendingOuter(t, e), null;
        const i = this.groups.get(r);
        if (!i)
          return this.queuePendingOuter(t, e), null;
        try {
          const s = await i.handleOuterEvent(e);
          return s && this.shouldDropLocalEcho(s) ? null : (s && this.emitDecryptedEvents([s]), s);
        } catch (s) {
          return this.reportError(s, {
            operation: "handleOuterEvent",
            groupId: r,
            senderEventPubkey: t,
            eventId: e.id
          }), null;
        }
      });
    }
    async syncOuterSubscription() {
      var i;
      if (!this.nostrSubscribe && !this.nostrFetch) return;
      let e = Array.from(this.senderEventToGroup.keys());
      if (this.suppressLocalDeviceEcho && e.length > 0) {
        const s = await this.listLocalSenderEventPubkeys();
        e = e.filter((o) => !s.has(o));
      }
      e.sort();
      const t = e.filter((s) => !this.outerAuthors.includes(s)), r = e.join(",");
      if (r !== this.outerAuthorsKey) {
        try {
          (i = this.outerUnsubscribe) == null || i.call(this);
        } catch {
        }
        if (this.outerUnsubscribe = null, this.outerAuthorsKey = r, this.outerAuthors = e, e.length !== 0) {
          if (!this.nostrSubscribe) {
            this.startOuterBackfill(t);
            return;
          }
          try {
            this.outerUnsubscribe = this.nostrSubscribe(
              {
                kinds: [this.oneToMany.outerEventKind()],
                authors: e
              },
              (s) => {
                this.handleOuterEvent(s).catch((o) => {
                  this.reportError(o, {
                    operation: "handleOuterEvent",
                    senderEventPubkey: s.pubkey,
                    eventId: s.id
                  });
                });
              }
            ), this.startOuterBackfill(t);
          } catch (s) {
            this.reportError(s, { operation: "syncOuterSubscription" });
          }
        }
      }
    }
    managedGroupIds() {
      return Array.from(this.groups.keys()).sort();
    }
    knownSenderEventPubkeys() {
      return Array.from(this.senderEventToGroup.keys()).sort();
    }
    startOuterBackfill(e) {
      if (!(!this.nostrSubscribe && !this.nostrFetch || e.length === 0) && !(this.outerBackfillLookbackSeconds <= 0) && !(!this.nostrFetch && this.outerBackfillDurationMs <= 0))
        for (const t of this.outerBackfillRetryDelaysMs) {
          if (t <= 0) {
            this.runOuterBackfillAttempt(e);
            continue;
          }
          const r = setTimeout(() => {
            this.outerBackfillTimers.delete(r), this.runOuterBackfillAttempt(e);
          }, t);
          this.outerBackfillTimers.add(r);
        }
    }
    currentBackfillAuthors(e) {
      return Array.from(
        new Set(
          e.filter(
            (r) => r && this.senderEventToGroup.has(r) && this.outerAuthors.includes(r)
          )
        )
      ).sort();
    }
    async runOuterBackfillAttempt(e) {
      const t = this.currentBackfillAuthors(e);
      if (t.length !== 0) {
        if (this.nostrFetch) {
          await this.fetchOuterBackfill(t);
          return;
        }
        this.openOuterBackfillSubscription(t);
      }
    }
    async fetchOuterBackfill(e) {
      if (!this.nostrFetch) return;
      const t = Math.max(0, Math.floor(Date.now() / 1e3) - this.outerBackfillLookbackSeconds);
      try {
        const r = await this.nostrFetch({
          kinds: [this.oneToMany.outerEventKind()],
          authors: e,
          since: t
        });
        for (const i of this.sortOuterEvents(r))
          await this.handleOuterEvent(i).catch((s) => {
            this.reportError(s, {
              operation: "handleOuterEvent",
              senderEventPubkey: i.pubkey,
              eventId: i.id
            });
          });
      } catch (r) {
        this.reportError(r, { operation: "syncOuterSubscription" });
      }
    }
    openOuterBackfillSubscription(e) {
      if (!this.nostrSubscribe) return;
      const t = Math.max(0, Math.floor(Date.now() / 1e3) - this.outerBackfillLookbackSeconds);
      try {
        const r = this.nostrSubscribe(
          {
            kinds: [this.oneToMany.outerEventKind()],
            authors: e,
            since: t
          },
          (s) => {
            this.handleOuterEvent(s).catch((o) => {
              this.reportError(o, {
                operation: "handleOuterEvent",
                senderEventPubkey: s.pubkey,
                eventId: s.id
              });
            });
          }
        );
        this.outerBackfillUnsubscribes.add(r);
        const i = setTimeout(() => {
          this.outerBackfillTimers.delete(i), this.outerBackfillUnsubscribes.delete(r);
          try {
            r();
          } catch {
          }
        }, this.outerBackfillDurationMs);
        this.outerBackfillTimers.add(i);
      } catch (r) {
        this.reportError(r, { operation: "syncOuterSubscription" });
      }
    }
    clearOuterBackfills() {
      for (const e of this.outerBackfillTimers)
        clearTimeout(e);
      this.outerBackfillTimers.clear();
      for (const e of this.outerBackfillUnsubscribes)
        try {
          e();
        } catch {
        }
      this.outerBackfillUnsubscribes.clear();
    }
    emitDecryptedEvents(e) {
      if (this.onDecryptedEvent)
        for (const t of e)
          this.onDecryptedEvent(t);
    }
    queuePendingSessionEvent(e, t, r, i) {
      const s = this.pendingSessionByGroup.get(e) || [];
      s.push({
        event: t,
        fromOwnerPubkey: r,
        fromSenderDevicePubkey: i
      }), this.pendingSessionByGroup.set(e, s);
    }
    async handleIncomingMetadataEvent(e, t, r, i, s) {
      const o = s ?? ti(t.content);
      if (!o) return [];
      const a = this.buildMetadataEvent(
        e,
        t,
        r,
        i
      ), c = this.groups.get(e);
      if (c) {
        const h = Nd(
          c.data,
          o,
          r,
          this.ourOwnerPubkey
        );
        if (h === "reject")
          return [];
        if (h === "removed")
          return this.removeGroup(e), [a];
        c.setData(Td(c.data, o));
      } else {
        if (!Bd(o, r, this.ourOwnerPubkey))
          return [];
        const h = new bn({
          data: {
            id: o.id,
            name: o.name,
            members: o.members,
            admins: o.admins,
            createdAt: t.created_at * 1e3,
            ...o.description ? { description: o.description } : {},
            ...o.picture ? { picture: o.picture } : {},
            ...o.secret ? { secret: o.secret } : {},
            accepted: false
          },
          ourOwnerPubkey: this.ourOwnerPubkey,
          ourDevicePubkey: this.ourDevicePubkey,
          storage: this.storage,
          oneToMany: this.oneToMany
        });
        this.groups.set(e, h);
      }
      await this.refreshGroupSenderMappings(e), await this.syncOuterSubscription();
      const u = await this.drainPendingSessionEvents(e);
      return [a, ...u];
    }
    buildMetadataEvent(e, t, r, i) {
      const s = i || t.pubkey, o = Yt({
        ourOwnerPubkey: this.ourOwnerPubkey,
        ourDevicePubkey: this.ourDevicePubkey,
        senderOwnerPubkey: r,
        senderDevicePubkey: s
      });
      return {
        groupId: e,
        senderEventPubkey: s,
        senderDevicePubkey: s,
        senderOwnerPubkey: r,
        origin: o,
        isSelf: Xt(o),
        isCrossDeviceSelf: Qt(o),
        outerEventId: t.id,
        outerCreatedAt: t.created_at,
        keyId: 0,
        messageNumber: 0,
        inner: t
      };
    }
    async drainPendingSessionEvents(e) {
      const t = this.pendingSessionByGroup.get(e);
      if (!t || t.length === 0)
        return [];
      this.pendingSessionByGroup.delete(e);
      const r = this.groups.get(e);
      if (!r)
        return [];
      const i = [];
      for (const s of t) {
        const o = s.event.kind === wt ? ai(s.event.content) : null;
        i.push(
          ...await this.handleIncomingSessionEventForKnownGroup(
            e,
            r,
            s.event,
            s.fromOwnerPubkey,
            s.fromSenderDevicePubkey,
            o
          )
        );
      }
      return i;
    }
    async handleIncomingSessionEventForKnownGroup(e, t, r, i, s, o) {
      const a = await t.handleIncomingSessionEvent(
        r,
        i,
        s
      ), c = [];
      if (o != null && o.senderEventPubkey && zd(o.senderEventPubkey)) {
        this.bindSenderEventToGroup(e, o.senderEventPubkey);
        const u = await this.drainPendingOuterForSenderEvent(
          o.senderEventPubkey,
          t
        );
        c.push(...u);
      }
      return await this.refreshGroupSenderMappings(e), await this.syncOuterSubscription(), [...a, ...c];
    }
    bindSenderEventToGroup(e, t) {
      this.senderEventToGroup.set(t, e);
      const r = this.groupToSenderEvents.get(e) || /* @__PURE__ */ new Set();
      r.add(t), this.groupToSenderEvents.set(e, r);
    }
    async refreshGroupSenderMappings(e) {
      const t = this.groups.get(e);
      if (!t) return;
      let r;
      try {
        r = await t.listSenderEventPubkeys();
      } catch (o) {
        this.reportError(o, { operation: "upsertGroup", groupId: e });
        return;
      }
      const i = new Set(r), s = this.groupToSenderEvents.get(e) || /* @__PURE__ */ new Set();
      for (const o of s) {
        if (i.has(o)) continue;
        this.senderEventToGroup.get(o) === e && this.senderEventToGroup.delete(o), this.pendingOuterBySenderEvent.delete(o);
      }
      for (const o of i)
        this.senderEventToGroup.set(o, e);
      this.groupToSenderEvents.set(e, i);
    }
    queuePendingOuter(e, t) {
      const r = this.pendingOuterBySenderEvent.get(e) || [];
      r.length >= this.maxPendingPerSenderEvent && r.shift(), r.push(t), this.pendingOuterBySenderEvent.set(e, r);
    }
    async drainPendingOuterForSenderEvent(e, t) {
      const r = this.pendingOuterBySenderEvent.get(e);
      if (!r || r.length === 0) return [];
      this.pendingOuterBySenderEvent.delete(e);
      const i = r.map((o) => {
        try {
          const a = this.oneToMany.parseOuterContent(o.content);
          return { outer: o, messageNumber: a.messageNumber };
        } catch {
          return { outer: o, messageNumber: 0 };
        }
      }).sort((o, a) => o.messageNumber - a.messageNumber), s = [];
      for (const { outer: o } of i) {
        const a = await t.handleOuterEvent(o);
        a && s.push(a);
      }
      return s;
    }
    reportError(e, t) {
      var r;
      (r = this.onError) == null || r.call(this, e, t);
    }
    shouldDropLocalEcho(e) {
      return this.suppressLocalDeviceEcho && e.origin === "local-device";
    }
    routeIncomingEvents(e) {
      return this.suppressLocalDeviceEcho ? e.filter((t) => !this.shouldDropLocalEcho(t)) : e;
    }
    async listLocalSenderEventPubkeys() {
      const e = /* @__PURE__ */ new Set();
      return await Promise.allSettled(
        Array.from(this.groups.values()).map(async (t) => {
          const r = await t.getSenderEventPubkeyForDevice(this.ourDevicePubkey);
          r && e.add(r);
        })
      ), e;
    }
    normalizeRetryDelays(e) {
      const t = Array.from(
        new Set(
          e.filter((r) => Number.isFinite(r) && r >= 0).map((r) => Math.floor(r))
        )
      ).sort((r, i) => r - i);
      return t.length > 0 ? t : [0];
    }
    hasSeenOuterEvent(e) {
      return this.seenOuterEventIds.has(e);
    }
    rememberOuterEvent(e) {
      if (!this.seenOuterEventIds.has(e))
        for (this.seenOuterEventIds.add(e), this.seenOuterEventOrder.push(e); this.seenOuterEventOrder.length > this.maxSeenOuterEventIds; ) {
          const t = this.seenOuterEventOrder.shift();
          t && this.seenOuterEventIds.delete(t);
        }
    }
    sortOuterEvents(e) {
      return [...e].sort((t, r) => {
        if (t.pubkey !== r.pubkey) return t.pubkey.localeCompare(r.pubkey);
        let i = 0, s = 0, o = 0, a = 0;
        try {
          const c = this.oneToMany.parseOuterContent(t.content);
          i = c.keyId, o = c.messageNumber;
        } catch {
        }
        try {
          const c = this.oneToMany.parseOuterContent(r.content);
          s = c.keyId, a = c.messageNumber;
        } catch {
        }
        return i !== s ? i - s : o !== a ? o - a : t.created_at !== r.created_at ? t.created_at - r.created_at : t.id.localeCompare(r.id);
      });
    }
  };
  var ao = (n) => {
    if (typeof n != "string") return null;
    const e = n.trim().toLowerCase();
    return /^[0-9a-f]{64}$/.test(e) ? e : null;
  };
  function Vd(n) {
    if (!Array.isArray(n.kinds) || !n.kinds.includes(be))
      return [];
    if (!Array.isArray(n.authors))
      return [];
    const e = [], t = /* @__PURE__ */ new Set();
    for (const r of n.authors) {
      const i = ao(r);
      !i || t.has(i) || (t.add(i), e.push(i));
    }
    return e;
  }
  function ml(n, e, t = 200) {
    const r = [], i = /* @__PURE__ */ new Set();
    for (const s of n) {
      const o = ao(s);
      !o || i.has(o) || (i.add(o), r.push(o));
    }
    return {
      kinds: [be],
      authors: r,
      since: e,
      limit: t
    };
  }
  var El = class {
    constructor() {
      l(this, "nextToken", 1);
      l(this, "authorsByToken", /* @__PURE__ */ new Map());
      l(this, "authorRefCounts", /* @__PURE__ */ new Map());
    }
    registerFilter(e) {
      const t = this.nextToken++, r = Vd(e);
      if (r.length === 0)
        return { token: t, addedAuthors: [] };
      this.authorsByToken.set(t, r);
      const i = [];
      for (const s of r) {
        const o = this.authorRefCounts.get(s) || 0;
        o === 0 && i.push(s), this.authorRefCounts.set(s, o + 1);
      }
      return { token: t, addedAuthors: i };
    }
    unregister(e) {
      const t = this.authorsByToken.get(e);
      if (t) {
        this.authorsByToken.delete(e);
        for (const r of t) {
          const i = Math.max((this.authorRefCounts.get(r) || 1) - 1, 0);
          i === 0 ? this.authorRefCounts.delete(r) : this.authorRefCounts.set(r, i);
        }
      }
    }
    trackedAuthors() {
      return Array.from(this.authorRefCounts.keys()).sort();
    }
  };
  var jd = class {
    constructor(e) {
      l(this, "nostrSubscribe");
      l(this, "nostrPublish");
      l(this, "nostrFetch");
      l(this, "groupStorage");
      l(this, "waitForSessionManagerFn");
      l(this, "getOwnerPubkey");
      l(this, "getCurrentDevicePubkey");
      l(this, "onReadyStateChange");
      l(this, "groupManager", null);
      l(this, "groupManagerInitPromise", null);
      l(this, "sessionManager", null);
      l(this, "sessionBridgeCleanup", null);
      l(this, "groupEventCallbacks", /* @__PURE__ */ new Set());
      this.nostrSubscribe = e.nostrSubscribe, this.nostrPublish = e.nostrPublish, this.nostrFetch = e.nostrFetch, this.groupStorage = e.groupStorage || new Xe(), "sessionManager" in e ? (this.sessionManager = e.sessionManager, this.waitForSessionManagerFn = async () => e.sessionManager, this.getOwnerPubkey = () => e.ourOwnerPubkey, this.getCurrentDevicePubkey = () => e.ourDevicePubkey) : (this.waitForSessionManagerFn = e.waitForSessionManager, this.getOwnerPubkey = e.getOwnerPubkey, this.getCurrentDevicePubkey = e.getCurrentDevicePubkey), this.onReadyStateChange = e.onReadyStateChange;
    }
    getGroupManager() {
      return this.groupManager;
    }
    getManager() {
      return this.getGroupManager();
    }
    async waitForManager(e) {
      return this.groupManager ? this.groupManager : this.groupManagerInitPromise ? this.groupManagerInitPromise : (this.groupManagerInitPromise = (async () => {
        var o;
        const t = await this.waitForSessionManagerFn(e), r = this.getOwnerPubkey() || e, i = this.getCurrentDevicePubkey();
        if (!r || !i)
          throw new Error(
            "Owner and current device pubkeys are required to initialize GroupManager"
          );
        const s = new qd({
          ourOwnerPubkey: r,
          ourDevicePubkey: i,
          storage: this.groupStorage,
          nostrSubscribe: this.nostrSubscribe,
          nostrFetch: this.nostrFetch,
          onDecryptedEvent: (a) => {
            this.emitGroupEvent(a);
          }
        });
        return this.groupManager = s, (o = this.onReadyStateChange) == null || o.call(this, true), this.setSessionManager(t), s;
      })().finally(() => {
        this.groupManagerInitPromise = null;
      }), this.groupManagerInitPromise);
    }
    async waitForGroupManager(e) {
      return this.waitForManager(e);
    }
    onGroupEvent(e) {
      return this.groupEventCallbacks.add(e), () => {
        this.groupEventCallbacks.delete(e);
      };
    }
    setSessionManager(e) {
      this.sessionManager === e && this.sessionBridgeCleanup || (this.clearSessionBridge(), this.sessionManager = e, !(!e || !this.groupManager) && (this.sessionBridgeCleanup = e.onEvent((t, r, i) => {
        var a;
        const s = (i == null ? void 0 : i.senderOwnerPubkey) || r, o = (i == null ? void 0 : i.senderDevicePubkey) || t.pubkey;
        this.shouldEmitPairwiseGroupEvent(t, o) && this.emitGroupEvent(
          this.buildPairwiseGroupEvent(
            t,
            s,
            o
          )
        ), (a = this.groupManager) == null || a.handleIncomingSessionEvent(
          t,
          s,
          o
        );
      })));
    }
    async upsertGroup(e, t) {
      await (await this.waitForManager(t)).upsertGroup(e);
    }
    async syncGroups(e, t) {
      const r = await this.waitForManager(t), i = new Set(e.map((s) => s.id));
      for (const s of e)
        await r.upsertGroup(s);
      for (const s of r.managedGroupIds())
        i.has(s) || r.removeGroup(s);
    }
    removeGroup(e) {
      var t;
      (t = this.groupManager) == null || t.removeGroup(e);
    }
    async createGroup(e, t, r = {}) {
      return (await this.waitForManager()).createGroup(e, t, {
        fanoutMetadata: r.fanoutMetadata,
        nowMs: r.nowMs,
        sendPairwise: async (s, o) => {
          await (await this.waitForSessionManagerFn()).sendEvent(s, o);
        }
      });
    }
    async sendGroupEvent(e, t, r = {}) {
      return (await this.waitForManager()).sendEvent(e, t, {
        nowMs: r.nowMs,
        sendPairwise: async (s, o) => {
          await (await this.waitForSessionManagerFn()).sendEvent(s, o);
        },
        publishOuter: async (s) => {
          await this.nostrPublish(s);
        }
      });
    }
    async sendGroupMessage(e, t, r = {}) {
      return this.sendGroupEvent(
        e,
        {
          kind: Je,
          content: t
        },
        r
      );
    }
    close() {
      var e, t;
      this.clearSessionBridge(), (e = this.groupManager) == null || e.destroy(), this.groupManager = null, this.groupManagerInitPromise = null, this.sessionManager = null, (t = this.onReadyStateChange) == null || t.call(this, false);
    }
    clearSessionBridge() {
      var e;
      (e = this.sessionBridgeCleanup) == null || e.call(this), this.sessionBridgeCleanup = null;
    }
    shouldEmitPairwiseGroupEvent(e, t) {
      var r;
      return !((r = e.tags) != null && r.some((i) => i[0] === "l" && typeof i[1] == "string")) || e.kind === yt || e.kind === wt ? false : e.pubkey === t;
    }
    buildPairwiseGroupEvent(e, t, r) {
      var o, a;
      const i = ((a = (o = e.tags) == null ? void 0 : o.find((c) => c[0] === "l")) == null ? void 0 : a[1]) || "", s = Yt({
        ourOwnerPubkey: this.getOwnerPubkey() || "",
        ourDevicePubkey: this.getCurrentDevicePubkey() || void 0,
        senderOwnerPubkey: t,
        senderDevicePubkey: r
      });
      return {
        groupId: i,
        senderEventPubkey: r,
        senderDevicePubkey: r,
        senderOwnerPubkey: t,
        origin: s,
        isSelf: Xt(s),
        isCrossDeviceSelf: Qt(s),
        outerEventId: e.id,
        outerCreatedAt: e.created_at,
        keyId: 0,
        messageNumber: 0,
        inner: e
      };
    }
    emitGroupEvent(e) {
      for (const t of this.groupEventCallbacks)
        t(e);
    }
  };
  var Zd = 1e4;
  var Jd = 2e3;
  var xt = (n) => new G(n.getAllDevices(), n.getAllDeviceLabels());
  var Ge = () => Math.floor(Date.now() / 1e3);
  var Sl = class {
    constructor(e) {
      l(this, "nostrSubscribe");
      l(this, "nostrPublish");
      l(this, "nostrFetch");
      l(this, "storage");
      l(this, "sessionStorage");
      l(this, "groupStorage");
      l(this, "groupController");
      l(this, "ownerIdentityKey");
      l(this, "appKeysFetchTimeoutMs");
      l(this, "appKeysFastTimeoutMs");
      l(this, "appKeysManager", null);
      l(this, "delegateManager", null);
      l(this, "sessionManager", null);
      l(this, "appKeysInitPromise", null);
      l(this, "delegateInitPromise", null);
      l(this, "sessionManagerInitPromise", null);
      l(this, "appKeysSubscriptionCleanup", null);
      l(this, "appKeysSubscriptionOwnerPubkey", null);
      l(this, "stateListeners", /* @__PURE__ */ new Set());
      l(this, "sessionEventCallbacks", /* @__PURE__ */ new Set());
      l(this, "sessionEventCleanup", /* @__PURE__ */ new Map());
      l(this, "state", {
        ownerPubkey: null,
        currentDevicePubkey: null,
        registeredDevices: [],
        hasLocalAppKeys: false,
        lastAppKeysCreatedAt: 0,
        appKeysManagerReady: false,
        delegateManagerReady: false,
        sessionManagerReady: false,
        groupManagerReady: false,
        appKeysSubscriptionActive: false,
        isCurrentDeviceRegistered: false,
        hasKnownRegisteredDevices: false,
        noPreviousDevicesFound: true,
        requiresDeviceRegistration: false,
        canSendPrivateMessages: false
      });
      this.nostrSubscribe = e.nostrSubscribe, this.nostrPublish = e.nostrPublish, this.nostrFetch = e.nostrFetch, this.storage = e.storage || new Xe(), this.sessionStorage = e.sessionStorage || this.storage, this.groupStorage = e.groupStorage || this.sessionStorage, this.groupController = new jd({
        nostrSubscribe: this.nostrSubscribe,
        nostrPublish: this.nostrPublish,
        nostrFetch: this.nostrFetch,
        groupStorage: this.groupStorage,
        waitForSessionManager: (t) => this.waitForSessionManager(t),
        getOwnerPubkey: () => this.state.ownerPubkey,
        getCurrentDevicePubkey: () => this.state.currentDevicePubkey,
        onReadyStateChange: (t) => {
          this.syncState({
            groupManagerReady: t
          });
        }
      }), this.ownerIdentityKey = e.ownerIdentityKey, this.appKeysFetchTimeoutMs = e.appKeysFetchTimeoutMs || Zd, this.appKeysFastTimeoutMs = e.appKeysFastTimeoutMs || Jd;
    }
    getState() {
      return {
        ...this.state,
        registeredDevices: [...this.state.registeredDevices]
      };
    }
    onStateChange(e) {
      return this.stateListeners.add(e), e(this.getState()), () => {
        this.stateListeners.delete(e);
      };
    }
    onSessionEvent(e) {
      return this.sessionEventCallbacks.add(e), this.sessionManager && !this.sessionEventCleanup.has(e) && this.sessionEventCleanup.set(
        e,
        this.sessionManager.onEvent(e)
      ), () => {
        this.sessionEventCallbacks.delete(e);
        const t = this.sessionEventCleanup.get(e);
        t == null || t(), this.sessionEventCleanup.delete(e);
      };
    }
    getAppKeysManager() {
      return this.appKeysManager;
    }
    getDelegateManager() {
      return this.delegateManager;
    }
    getSessionManager() {
      return this.sessionManager;
    }
    getGroupManager() {
      return this.groupController.getManager();
    }
    async initManagers() {
      await Promise.all([this.initAppKeysManager(), this.initDelegateManager()]);
    }
    async initForOwner(e) {
      await this.initManagers();
      const t = await this.initSessionManager(e);
      return await this.initGroupManager(e), this.startAppKeysSubscription(e), t;
    }
    async waitForSessionManager(e) {
      if (this.sessionManager)
        return this.sessionManager;
      if (!e)
        throw new Error("Owner pubkey required to initialize SessionManager");
      return this.initForOwner(e);
    }
    async waitForGroupManager(e) {
      return this.groupController.waitForManager(e);
    }
    async initAppKeysManager() {
      if (!this.appKeysManager)
        return this.appKeysInitPromise ? this.appKeysInitPromise : (this.appKeysInitPromise = (async () => {
          const e = new Ld({
            nostrPublish: this.nostrPublish,
            storage: this.storage,
            ownerIdentityKey: this.ownerIdentityKey
          });
          await e.init(), this.appKeysManager = e;
          const t = e.getAppKeys();
          this.syncState({
            appKeysManagerReady: true,
            registeredDevices: e.getOwnDevices(),
            hasLocalAppKeys: !!(t && t.getAllDevices().length > 0)
          });
        })().finally(() => {
          this.appKeysInitPromise = null;
        }), this.appKeysInitPromise);
    }
    async initDelegateManager() {
      if (!this.delegateManager)
        return this.delegateInitPromise ? this.delegateInitPromise : (this.delegateInitPromise = (async () => {
          const e = new Ud({
            nostrSubscribe: this.nostrSubscribe,
            nostrPublish: this.nostrPublish,
            storage: this.storage
          });
          await e.init(), this.delegateManager = e, this.syncState({
            delegateManagerReady: true,
            currentDevicePubkey: e.getIdentityPublicKey(),
            ownerPubkey: e.getOwnerPublicKey()
          });
        })().finally(() => {
          this.delegateInitPromise = null;
        }), this.delegateInitPromise);
    }
    async initSessionManager(e) {
      if (this.sessionManager) {
        if (this.state.ownerPubkey && this.state.ownerPubkey !== e)
          throw new Error(
            `NdrRuntime already initialized for owner ${this.state.ownerPubkey}`
          );
        return this.sessionManager;
      }
      return this.sessionManagerInitPromise ? this.sessionManagerInitPromise : (this.sessionManagerInitPromise = (async () => {
        if (await this.initDelegateManager(), !this.delegateManager)
          throw new Error("DelegateManager not initialized");
        await this.delegateManager.activate(e);
        const t = this.delegateManager.createSessionManager(
          this.sessionStorage
        );
        return this.attachSessionEventCallbacks(t), await t.init(), this.sessionManager = t, this.syncState({
          ownerPubkey: e,
          sessionManagerReady: true
        }), this.groupController.setSessionManager(t), t;
      })().catch((t) => {
        throw this.clearAttachedSessionEventCallbacks(), this.groupController.setSessionManager(null), t;
      }).finally(() => {
        this.sessionManagerInitPromise = null;
      }), this.sessionManagerInitPromise);
    }
    async initGroupManager(e) {
      return this.groupController.waitForManager(e);
    }
    onGroupEvent(e) {
      return this.groupController.onGroupEvent(e);
    }
    async setupUser(e, t) {
      await (await this.waitForSessionManager(
        this.resolveActiveOwnerPubkey(t)
      )).setupUser(e);
    }
    async sendEvent(e, t, r) {
      return (await this.waitForSessionManager(
        this.resolveActiveOwnerPubkey(r)
      )).sendEvent(e, t);
    }
    async sendMessage(e, t, r = {}, i) {
      return (await this.waitForSessionManager(
        this.resolveActiveOwnerPubkey(i)
      )).sendMessage(e, t, r);
    }
    async sendChatSettings(e, t, r) {
      return (await this.waitForSessionManager(
        this.resolveActiveOwnerPubkey(r)
      )).sendChatSettings(e, t);
    }
    async setChatSettingsForPeer(e, t, r) {
      return (await this.waitForSessionManager(
        this.resolveActiveOwnerPubkey(r)
      )).setChatSettingsForPeer(e, t);
    }
    async sendReceipt(e, t, r, i) {
      return (await this.waitForSessionManager(
        this.resolveActiveOwnerPubkey(i)
      )).sendReceipt(e, t, r);
    }
    async sendTyping(e, t) {
      return (await this.waitForSessionManager(
        this.resolveActiveOwnerPubkey(t)
      )).sendTyping(e);
    }
    async setDefaultExpiration(e, t) {
      await (await this.waitForSessionManager(
        this.resolveActiveOwnerPubkey(t)
      )).setDefaultExpiration(e);
    }
    async setExpirationForPeer(e, t, r) {
      await (await this.waitForSessionManager(
        this.resolveActiveOwnerPubkey(r)
      )).setExpirationForPeer(e, t);
    }
    async setExpirationForGroup(e, t, r) {
      await (await this.waitForSessionManager(
        this.resolveActiveOwnerPubkey(r)
      )).setExpirationForGroup(e, t);
    }
    async deleteChat(e, t) {
      await (await this.waitForSessionManager(
        this.resolveActiveOwnerPubkey(t)
      )).deleteChat(e);
    }
    async resolveBaseAppKeys(e, t = this.appKeysFetchTimeoutMs) {
      var s;
      const r = Math.min(this.appKeysFastTimeoutMs, t);
      try {
        const o = await G.waitFor(
          e,
          this.nostrSubscribe,
          r
        );
        if (o)
          return o;
      } catch {
      }
      const i = (s = this.appKeysManager) == null ? void 0 : s.getAppKeys();
      if (i && i.getAllDevices().length > 0)
        return xt(i);
      if (t > r)
        try {
          const o = Math.max(t - r, 0), a = await G.waitFor(
            e,
            this.nostrSubscribe,
            o
          );
          if (a)
            return a;
        } catch {
        }
      return new G();
    }
    startAppKeysSubscription(e) {
      this.appKeysSubscriptionCleanup && this.appKeysSubscriptionOwnerPubkey === e || (this.stopAppKeysSubscription(), this.appKeysSubscriptionOwnerPubkey = e, this.appKeysSubscriptionCleanup = this.nostrSubscribe(
        at(e),
        async (t) => {
          if (t.pubkey === e)
            try {
              const r = G.fromEvent(t);
              await this.applyIncomingAppKeys(r, t.created_at);
            } catch {
            }
        }
      ), this.syncState({
        ownerPubkey: e,
        appKeysSubscriptionActive: true
      }));
    }
    stopAppKeysSubscription() {
      var e;
      (e = this.appKeysSubscriptionCleanup) == null || e.call(this), this.appKeysSubscriptionCleanup = null, this.appKeysSubscriptionOwnerPubkey = null, this.syncState({
        appKeysSubscriptionActive: false
      });
    }
    async refreshOwnAppKeysFromRelay(e, t = this.appKeysFastTimeoutMs) {
      const r = await G.waitFor(
        e,
        this.nostrSubscribe,
        t
      );
      return r ? await this.applyIncomingAppKeys(r, Ge()) !== "stale" : false;
    }
    async prepareRegistration(e) {
      if (await this.initManagers(), !this.delegateManager)
        throw new Error("DelegateManager not initialized");
      const t = await this.resolveBaseAppKeys(
        e.ownerPubkey,
        e.timeoutMs
      ), r = xt(t), i = this.buildRegistrationPayload(
        this.delegateManager,
        e
      );
      return r.addDevice({
        identityPubkey: i.identityPubkey,
        createdAt: Ge()
      }), (i.deviceLabel || i.clientLabel) && r.setDeviceLabels(i.identityPubkey, i), {
        appKeys: r,
        devices: r.getAllDevices(),
        baseDevices: t.getAllDevices(),
        newDeviceIdentity: i.identityPubkey
      };
    }
    async prepareRegistrationForIdentity(e) {
      await this.initAppKeysManager();
      const t = await this.resolveBaseAppKeys(
        e.ownerPubkey,
        e.timeoutMs
      ), r = xt(t);
      return r.addDevice({
        identityPubkey: e.identityPubkey,
        createdAt: Ge()
      }), (e.deviceLabel || e.clientLabel) && r.setDeviceLabels(e.identityPubkey, e), {
        appKeys: r,
        devices: r.getAllDevices(),
        baseDevices: t.getAllDevices(),
        newDeviceIdentity: e.identityPubkey
      };
    }
    async publishPreparedRegistration(e) {
      var i;
      await this.initAppKeysManager();
      const t = Ad({
        currentDevicePubkey: this.state.currentDevicePubkey,
        registeredDevices: e.baseDevices,
        hasLocalAppKeys: e.baseDevices.length > 0,
        appKeysManagerReady: this.state.appKeysManagerReady,
        sessionManagerReady: this.state.sessionManagerReady
      }), r = await this.publishAppKeys(e.appKeys);
      return await ((i = this.appKeysManager) == null ? void 0 : i.setAppKeys(e.appKeys)), this.syncState({
        registeredDevices: e.devices,
        hasLocalAppKeys: e.devices.length > 0,
        lastAppKeysCreatedAt: r.created_at ?? Ge()
      }), {
        createdAt: r.created_at ?? Ge(),
        relayConfirmationRequired: t
      };
    }
    async prepareRevocation(e) {
      const t = await this.resolveBaseAppKeys(
        e.ownerPubkey,
        e.timeoutMs
      ), r = xt(t);
      return r.removeDevice(e.identityPubkey), {
        appKeys: r,
        devices: r.getAllDevices(),
        revokedIdentity: e.identityPubkey
      };
    }
    async publishPreparedRevocation(e) {
      var r;
      await this.initAppKeysManager();
      const t = await this.publishAppKeys(e.appKeys);
      return await ((r = this.appKeysManager) == null ? void 0 : r.setAppKeys(e.appKeys)), this.syncState({
        registeredDevices: e.devices,
        hasLocalAppKeys: e.devices.length > 0,
        lastAppKeysCreatedAt: t.created_at ?? Ge()
      }), t.created_at ?? Ge();
    }
    async registerCurrentDevice(e) {
      const t = await this.prepareRegistration(e), r = await this.publishPreparedRegistration(t);
      return r.relayConfirmationRequired && (await this.waitForCurrentDeviceRegistrationOnRelay(
        e.ownerPubkey,
        t.newDeviceIdentity,
        e.timeoutMs || this.appKeysFetchTimeoutMs
      ), await this.refreshOwnAppKeysFromRelay(
        e.ownerPubkey,
        e.timeoutMs || this.appKeysFastTimeoutMs
      ).catch(() => {
      })), {
        createdAt: r.createdAt,
        relayConfirmationRequired: r.relayConfirmationRequired
      };
    }
    async registerDeviceIdentity(e) {
      const t = await this.prepareRegistrationForIdentity(e);
      return this.publishPreparedRegistration(t);
    }
    async revokeDevice(e) {
      const t = await this.prepareRevocation(e);
      return this.publishPreparedRevocation(t);
    }
    async ensureCurrentDeviceRegistered(e, t) {
      return await this.initManagers(), this.state.isCurrentDeviceRegistered ? false : (await this.registerCurrentDevice({
        ownerPubkey: e,
        timeoutMs: t
      }), true);
    }
    async republishInvite() {
      if (await this.initDelegateManager(), !this.delegateManager)
        throw new Error("DelegateManager not initialized");
      await this.delegateManager.publishInvite();
    }
    async rotateInvite() {
      if (await this.initDelegateManager(), !this.delegateManager)
        throw new Error("DelegateManager not initialized");
      await this.delegateManager.rotateInvite();
    }
    async createLinkInvite(e) {
      if (await this.initDelegateManager(), !this.delegateManager)
        throw new Error("DelegateManager not initialized");
      const t = this.delegateManager.getInvite();
      if (!t)
        throw new Error("DelegateManager invite not initialized");
      const r = fe.deserialize(t.serialize());
      return r.purpose = "link", e && (r.ownerPubkey = e), r;
    }
    async acceptInvite(e, t) {
      const r = (t == null ? void 0 : t.ownerPublicKey) || this.state.ownerPubkey || e.ownerPubkey || e.inviter;
      return (await this.waitForSessionManager(r)).acceptInvite(e, t);
    }
    async acceptLinkInvite(e, t) {
      return this.acceptInvite(e, {
        ownerPublicKey: t
      });
    }
    async upsertGroup(e, t) {
      await this.groupController.upsertGroup(e, t);
    }
    async syncGroups(e, t) {
      await this.groupController.syncGroups(e, t);
    }
    removeGroup(e) {
      this.groupController.removeGroup(e);
    }
    async createGroup(e, t, r = {}) {
      return this.groupController.createGroup(e, t, r);
    }
    async sendGroupEvent(e, t, r = {}) {
      return this.groupController.sendGroupEvent(e, t, r);
    }
    async sendGroupMessage(e, t, r = {}) {
      return this.groupController.sendGroupMessage(e, t, r);
    }
    close() {
      var e, t, r;
      this.stopAppKeysSubscription(), this.clearAttachedSessionEventCallbacks(), this.groupController.close(), (e = this.appKeysManager) == null || e.close(), (t = this.delegateManager) == null || t.close(), (r = this.sessionManager) == null || r.close(), this.appKeysManager = null, this.delegateManager = null, this.sessionManager = null, this.appKeysInitPromise = null, this.delegateInitPromise = null, this.sessionManagerInitPromise = null, this.syncState({
        ownerPubkey: null,
        currentDevicePubkey: null,
        registeredDevices: [],
        hasLocalAppKeys: false,
        lastAppKeysCreatedAt: 0,
        appKeysManagerReady: false,
        delegateManagerReady: false,
        sessionManagerReady: false,
        groupManagerReady: false,
        appKeysSubscriptionActive: false
      });
    }
    attachSessionEventCallbacks(e) {
      this.clearAttachedSessionEventCallbacks();
      for (const t of this.sessionEventCallbacks)
        this.sessionEventCleanup.set(t, e.onEvent(t));
    }
    clearAttachedSessionEventCallbacks() {
      for (const e of this.sessionEventCleanup.values())
        e();
      this.sessionEventCleanup.clear();
    }
    resolveActiveOwnerPubkey(e) {
      var r;
      const t = e || this.state.ownerPubkey || ((r = this.delegateManager) == null ? void 0 : r.getOwnerPublicKey()) || null;
      if (!t)
        throw new Error("Owner pubkey required to initialize SessionManager");
      return t;
    }
    buildRegistrationPayload(e, t) {
      return {
        ...e.getRegistrationPayload(),
        ...t.deviceLabel ? { deviceLabel: t.deviceLabel } : {},
        ...t.clientLabel ? { clientLabel: t.clientLabel } : {}
      };
    }
    async applyIncomingAppKeys(e, t) {
      var i, s;
      await this.initAppKeysManager();
      const r = Er({
        currentAppKeys: (i = this.appKeysManager) == null ? void 0 : i.getAppKeys(),
        currentCreatedAt: this.state.lastAppKeysCreatedAt,
        incomingAppKeys: e,
        incomingCreatedAt: t
      });
      return r.decision === "stale" || (await ((s = this.appKeysManager) == null ? void 0 : s.setAppKeys(r.appKeys)), this.syncState({
        registeredDevices: r.appKeys.getAllDevices(),
        hasLocalAppKeys: r.appKeys.getAllDevices().length > 0,
        lastAppKeysCreatedAt: r.createdAt
      })), r.decision;
    }
    async publishAppKeys(e) {
      return this.nostrPublish(e.getEvent(this.ownerIdentityKey));
    }
    async waitForCurrentDeviceRegistrationOnRelay(e, t, r) {
      const i = await G.waitFor(
        e,
        this.nostrSubscribe,
        r
      );
      if (!((i == null ? void 0 : i.getAllDevices().some((o) => o.identityPubkey === t)) ?? false))
        throw new Error(
          `Relay AppKeys for ${e} do not include current device ${t}`
        );
    }
    syncState(e) {
      const t = {
        ...this.state,
        ...e
      }, r = io({
        currentDevicePubkey: t.currentDevicePubkey,
        registeredDevices: t.registeredDevices,
        hasLocalAppKeys: t.hasLocalAppKeys,
        appKeysManagerReady: t.appKeysManagerReady,
        sessionManagerReady: t.sessionManagerReady
      });
      this.state = {
        ...t,
        ...r
      };
      for (const i of this.stateListeners)
        i(this.getState());
    }
  };
  return __toCommonJS(nostr_double_ratchet_es_exports);
})();
/*! Bundled license information:

nostr-double-ratchet/dist/nostr-double-ratchet.es.js:
  (*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) *)
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)
  (*! scure-base - MIT License (c) 2022 Paul Miller (paulmillr.com) *)
  (*! noble-ciphers - MIT License (c) 2023 Paul Miller (paulmillr.com) *)
*/
