var redstore = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // node_modules/@nostr/gadgets/redstore/index.js
  var index_exports = {};
  __export(index_exports, {
    DatabaseError: () => DatabaseError,
    RedEventStore: () => RedEventStore,
    isLocal: () => isLocal,
    seenOn: () => seenOn
  });

  // node_modules/@noble/hashes/utils.js
  function isBytes(a) {
    return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
  }
  function abytes(value, length, title = "") {
    const bytes = isBytes(value);
    const len = value?.length;
    const needsLen = length !== void 0;
    if (!bytes || needsLen && len !== length) {
      const prefix = title && `"${title}" `;
      const ofLen = needsLen ? ` of length ${length}` : "";
      const got = bytes ? `length=${len}` : `type=${typeof value}`;
      throw new Error(prefix + "expected Uint8Array" + ofLen + ", got " + got);
    }
    return value;
  }
  function aexists(instance, checkFinished = true) {
    if (instance.destroyed)
      throw new Error("Hash instance has been destroyed");
    if (checkFinished && instance.finished)
      throw new Error("Hash#digest() has already been called");
  }
  function aoutput(out, instance) {
    abytes(out, void 0, "digestInto() output");
    const min = instance.outputLen;
    if (out.length < min) {
      throw new Error('"digestInto() output" expected to be of length >=' + min);
    }
  }
  function clean(...arrays) {
    for (let i = 0; i < arrays.length; i++) {
      arrays[i].fill(0);
    }
  }
  function createView(arr) {
    return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
  }
  function rotr(word, shift) {
    return word << 32 - shift | word >>> shift;
  }
  var hasHexBuiltin = /* @__PURE__ */ (() => (
    // @ts-ignore
    typeof Uint8Array.from([]).toHex === "function" && typeof Uint8Array.fromHex === "function"
  ))();
  var asciis = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
  function asciiToBase16(ch) {
    if (ch >= asciis._0 && ch <= asciis._9)
      return ch - asciis._0;
    if (ch >= asciis.A && ch <= asciis.F)
      return ch - (asciis.A - 10);
    if (ch >= asciis.a && ch <= asciis.f)
      return ch - (asciis.a - 10);
    return;
  }
  function hexToBytes(hex) {
    if (typeof hex !== "string")
      throw new Error("hex string expected, got " + typeof hex);
    if (hasHexBuiltin)
      return Uint8Array.fromHex(hex);
    const hl = hex.length;
    const al = hl / 2;
    if (hl % 2)
      throw new Error("hex string expected, got unpadded hex of length " + hl);
    const array = new Uint8Array(al);
    for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
      const n1 = asciiToBase16(hex.charCodeAt(hi));
      const n2 = asciiToBase16(hex.charCodeAt(hi + 1));
      if (n1 === void 0 || n2 === void 0) {
        const char = hex[hi] + hex[hi + 1];
        throw new Error('hex string expected, got non-hex character "' + char + '" at index ' + hi);
      }
      array[ai] = n1 * 16 + n2;
    }
    return array;
  }
  function createHasher(hashCons, info = {}) {
    const hashC = (msg, opts) => hashCons(opts).update(msg).digest();
    const tmp = hashCons(void 0);
    hashC.outputLen = tmp.outputLen;
    hashC.blockLen = tmp.blockLen;
    hashC.create = (opts) => hashCons(opts);
    Object.assign(hashC, info);
    return Object.freeze(hashC);
  }
  var oidNist = (suffix) => ({
    oid: Uint8Array.from([6, 9, 96, 134, 72, 1, 101, 3, 4, 2, suffix])
  });

  // node_modules/@noble/hashes/_md.js
  function Chi(a, b, c) {
    return a & b ^ ~a & c;
  }
  function Maj(a, b, c) {
    return a & b ^ a & c ^ b & c;
  }
  var HashMD = class {
    blockLen;
    outputLen;
    padOffset;
    isLE;
    // For partial updates less than block size
    buffer;
    view;
    finished = false;
    length = 0;
    pos = 0;
    destroyed = false;
    constructor(blockLen, outputLen, padOffset, isLE) {
      this.blockLen = blockLen;
      this.outputLen = outputLen;
      this.padOffset = padOffset;
      this.isLE = isLE;
      this.buffer = new Uint8Array(blockLen);
      this.view = createView(this.buffer);
    }
    update(data) {
      aexists(this);
      abytes(data);
      const { view, buffer, blockLen } = this;
      const len = data.length;
      for (let pos = 0; pos < len; ) {
        const take = Math.min(blockLen - this.pos, len - pos);
        if (take === blockLen) {
          const dataView = createView(data);
          for (; blockLen <= len - pos; pos += blockLen)
            this.process(dataView, pos);
          continue;
        }
        buffer.set(data.subarray(pos, pos + take), this.pos);
        this.pos += take;
        pos += take;
        if (this.pos === blockLen) {
          this.process(view, 0);
          this.pos = 0;
        }
      }
      this.length += data.length;
      this.roundClean();
      return this;
    }
    digestInto(out) {
      aexists(this);
      aoutput(out, this);
      this.finished = true;
      const { buffer, view, blockLen, isLE } = this;
      let { pos } = this;
      buffer[pos++] = 128;
      clean(this.buffer.subarray(pos));
      if (this.padOffset > blockLen - pos) {
        this.process(view, 0);
        pos = 0;
      }
      for (let i = pos; i < blockLen; i++)
        buffer[i] = 0;
      view.setBigUint64(blockLen - 8, BigInt(this.length * 8), isLE);
      this.process(view, 0);
      const oview = createView(out);
      const len = this.outputLen;
      if (len % 4)
        throw new Error("_sha2: outputLen must be aligned to 32bit");
      const outLen = len / 4;
      const state = this.get();
      if (outLen > state.length)
        throw new Error("_sha2: outputLen bigger than state");
      for (let i = 0; i < outLen; i++)
        oview.setUint32(4 * i, state[i], isLE);
    }
    digest() {
      const { buffer, outputLen } = this;
      this.digestInto(buffer);
      const res = buffer.slice(0, outputLen);
      this.destroy();
      return res;
    }
    _cloneInto(to) {
      to ||= new this.constructor();
      to.set(...this.get());
      const { blockLen, buffer, length, finished, destroyed, pos } = this;
      to.destroyed = destroyed;
      to.finished = finished;
      to.length = length;
      to.pos = pos;
      if (length % blockLen)
        to.buffer.set(buffer);
      return to;
    }
    clone() {
      return this._cloneInto();
    }
  };
  var SHA256_IV = /* @__PURE__ */ Uint32Array.from([
    1779033703,
    3144134277,
    1013904242,
    2773480762,
    1359893119,
    2600822924,
    528734635,
    1541459225
  ]);

  // node_modules/@noble/hashes/sha2.js
  var SHA256_K = /* @__PURE__ */ Uint32Array.from([
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
  var SHA256_W = /* @__PURE__ */ new Uint32Array(64);
  var SHA2_32B = class extends HashMD {
    constructor(outputLen) {
      super(64, outputLen, 8, false);
    }
    get() {
      const { A, B, C, D, E, F, G, H } = this;
      return [A, B, C, D, E, F, G, H];
    }
    // prettier-ignore
    set(A, B, C, D, E, F, G, H) {
      this.A = A | 0;
      this.B = B | 0;
      this.C = C | 0;
      this.D = D | 0;
      this.E = E | 0;
      this.F = F | 0;
      this.G = G | 0;
      this.H = H | 0;
    }
    process(view, offset) {
      for (let i = 0; i < 16; i++, offset += 4)
        SHA256_W[i] = view.getUint32(offset, false);
      for (let i = 16; i < 64; i++) {
        const W15 = SHA256_W[i - 15];
        const W2 = SHA256_W[i - 2];
        const s0 = rotr(W15, 7) ^ rotr(W15, 18) ^ W15 >>> 3;
        const s1 = rotr(W2, 17) ^ rotr(W2, 19) ^ W2 >>> 10;
        SHA256_W[i] = s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16] | 0;
      }
      let { A, B, C, D, E, F, G, H } = this;
      for (let i = 0; i < 64; i++) {
        const sigma1 = rotr(E, 6) ^ rotr(E, 11) ^ rotr(E, 25);
        const T1 = H + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i] | 0;
        const sigma0 = rotr(A, 2) ^ rotr(A, 13) ^ rotr(A, 22);
        const T2 = sigma0 + Maj(A, B, C) | 0;
        H = G;
        G = F;
        F = E;
        E = D + T1 | 0;
        D = C;
        C = B;
        B = A;
        A = T1 + T2 | 0;
      }
      A = A + this.A | 0;
      B = B + this.B | 0;
      C = C + this.C | 0;
      D = D + this.D | 0;
      E = E + this.E | 0;
      F = F + this.F | 0;
      G = G + this.G | 0;
      H = H + this.H | 0;
      this.set(A, B, C, D, E, F, G, H);
    }
    roundClean() {
      clean(SHA256_W);
    }
    destroy() {
      this.set(0, 0, 0, 0, 0, 0, 0, 0);
      clean(this.buffer);
    }
  };
  var _SHA256 = class extends SHA2_32B {
    // We cannot use array here since array allows indexing by variable
    // which means optimizer/compiler cannot use registers.
    A = SHA256_IV[0] | 0;
    B = SHA256_IV[1] | 0;
    C = SHA256_IV[2] | 0;
    D = SHA256_IV[3] | 0;
    E = SHA256_IV[4] | 0;
    F = SHA256_IV[5] | 0;
    G = SHA256_IV[6] | 0;
    H = SHA256_IV[7] | 0;
    constructor() {
      super(32);
    }
  };
  var sha256 = /* @__PURE__ */ createHasher(
    () => new _SHA256(),
    /* @__PURE__ */ oidNist(1)
  );

  // node_modules/@jsr/nostr__tools/utils.js
  var utf8Decoder = new TextDecoder("utf-8");
  var utf8Encoder = new TextEncoder();

  // node_modules/@nostr/gadgets/redstore/index.js
  var import_meta = {};
  var DatabaseError = class extends Error {
    constructor(message) {
      super(message);
      this.name = "DatabaseError";
    }
  };
  var RedEventStore = class _RedEventStore {
    #initialized;
    #fullyInitialized = false;
    #manuallyClosed = false;
    worker;
    name;
    requests = {};
    serial = 1;
    /**
     * creates a new event store instance.
     * @param dbName - name of the indexedDB database (default: '@nostr/gadgets/events')
     */
    constructor(worker, dbName = "@gadgets-redstore") {
      this.name = dbName;
      this.worker = worker || new Worker(new URL("./redstore-worker.js", import_meta.url), {
        type: "module"
      });
      this.worker.addEventListener("message", (ev) => {
        const [id, success, result] = ev.data;
        const { resolve, reject } = this.requests[id];
        if (success) resolve(result);
        else reject("worker: " + result);
        delete this.requests[id];
      });
    }
    async call(method, data) {
      const id = this.serial++;
      const resp = await new Promise((resolve, reject) => {
        this.requests[id] = {
          resolve,
          reject
        };
        this.worker.postMessage([
          id,
          method,
          data
        ]);
      });
      return resp;
    }
    /**
     * initializes the database.
     * @returns boolean - true if we're the main database operators, false if we're just forwarding calls to others.
     */
    async init(force) {
      if (this.#manuallyClosed && !force) {
        return Promise.reject(new DatabaseError("database was manually closed. to reopen call init(true)"));
      }
      if (this.#manuallyClosed) {
        this.#manuallyClosed = false;
      } else if (this.#initialized) return this.#initialized;
      this.#initialized = this.call("init", {
        fileName: this.name
      });
      this.#initialized.then(() => {
        this.#fullyInitialized = true;
      });
      return this.#initialized;
    }
    /**
     * closes the database.
     */
    async close() {
      if (this.#initialized) {
        try {
          await this.call("close", {});
        } catch {
        }
        this.#fullyInitialized = false;
        this.#manuallyClosed = true;
        this.#initialized = Promise.reject(new DatabaseError("database was manually closed and cannot be reopened"));
      }
    }
    /**
     * erase the database (deletes the db file).
     */
    async delete() {
      if (this.#initialized && !this.#manuallyClosed) {
        throw new Error("can't erase an open database, close() first.");
      }
      return _RedEventStore.delete(this.name);
    }
    saveBatch = null;
    saveBatchTimeout = null;
    /**
     * saves (or replaces) a nostr event to the store with automatic batching for performance.
     * uses a 300ms debounced timeout to batch multiple calls together.
     *
     * @param event - the nostr event to save
     * @param seenOn - optional array of relay URLs where this event was seen
     * @param lastAttempt - optional timestamp, used by the replaceable fetchers
     * @returns boolean - true if the event was new, false if it was already saved
     * @throws {DatabaseError} if event values are out of bounds or storage fails
     */
    async saveEvent(event, { seenOn: seenOn2, lastAttempt } = {}) {
      if (!this.#fullyInitialized) await this.init();
      if (event.created_at > 4294967295 || event.kind > 65535) {
        throw new DatabaseError("event with values out of expected boundaries");
      }
      if (!this.saveBatch) {
        this.saveBatch = [
          [],
          [],
          [],
          []
        ];
      }
      if (this.saveBatchTimeout) {
        clearTimeout(this.saveBatchTimeout);
      }
      this.saveBatchTimeout = setTimeout(() => {
        const batch2 = this.saveBatch;
        if (!batch2) return;
        const lastAttempts = batch2[1];
        const rawEvents = batch2[2];
        const tasks = batch2[3];
        this.saveBatch = null;
        this.saveBatchTimeout = null;
        this.call("saveEvents", {
          lastAttempts,
          rawEvents
        }).then((results) => {
          for (let i = 0; i < tasks.length; i++) {
            tasks[i].resolve(results[i]);
          }
        }).catch((error) => {
          for (let i = 0; i < tasks.length; i++) {
            tasks[i].reject(error instanceof Error ? error : new Error(String(error)));
          }
        });
      }, 300);
      const batch = this.saveBatch;
      let idx = batch[0].indexOf(event.id);
      if (idx !== -1) return batch[3][idx].p;
      let extra = "";
      if (seenOn2) {
        extra += `,"seen_on":${JSON.stringify(seenOn2)}`;
      }
      idx = batch[0].push(event.id) - 1;
      let task = batch[3][idx] = {};
      batch[1][idx] = lastAttempt || 0;
      batch[2][idx] = utf8Encoder.encode(`{"pubkey":"${event.pubkey}","id":"${event.id}","kind":${event.kind},"created_at":${event.created_at},"sig":"${event.sig}","tags":${JSON.stringify(event.tags)},"content":${JSON.stringify(event.content)}${extra}}`);
      task.p = new Promise(function(resolve, reject) {
        task.resolve = resolve;
        task.reject = reject;
      });
      return task.p;
    }
    /**
     * deletes events from the store by their ID.
     * removes the events and all associated indexes.
     *
     * @param ids - hex-encoded event IDs to delete
     * @returns the ids of the deleted events, ignoring those that we couldn't find
     * @throws {DatabaseError} if deletion fails
     */
    async deleteEvents(ids) {
      if (!this.#fullyInitialized) await this.init();
      return this.call("deleteEvents", [
        {
          ids
        }
      ]);
    }
    async deleteReplaceable(kind, author) {
      if (!this.#fullyInitialized) await this.init();
      await this.call("deleteEvents", [
        {
          kinds: [
            kind
          ],
          authors: [
            author
          ]
        }
      ]);
    }
    async deleteEventsFilters(filters) {
      if (!this.#fullyInitialized) await this.init();
      return this.call("deleteEvents", filters);
    }
    /**
     * queries events using a nostr filter, any filters supported (except "search").
     * the actual limit of the query will be the minimum between the filter "limit" if it exists
     * and the maxLimit param.
     *
     * @param filter - nostr filter specification
     * @param maxLimit - maximum number of events to return (default: 500)
     * @returns events matching the filter criteria
     */
    async queryEvents(filter, maxLimit = 2500) {
      if (!this.#fullyInitialized) await this.init();
      filter.limit = filter.limit ? Math.min(filter.limit, maxLimit) : maxLimit;
      return (await this.call("queryEvents", filter)).map((b) => {
        const event = JSON.parse(utf8Decoder.decode(b));
        event[isLocalSymbol] = true;
        event[seenOnSymbol] = event.seen_on;
        delete event.seen_on;
        return event;
      });
    }
    async loadReplaceables(specs) {
      if (!this.#fullyInitialized) await this.init();
      const binQuery = new Uint8Array(18 * specs.length);
      for (let i = 0; i < specs.length; i++) {
        const offset = i * 18;
        binQuery[offset] = specs[i][0] >> 8 & 255;
        binQuery[offset + 1] = specs[i][0] & 255;
        binQuery.set(hexToBytes(specs[i][1].slice(48, 64)), offset + 2);
        if (specs[i][2]) {
          const dtaghash = sha256(utf8Encoder.encode(specs[i][2]));
          binQuery.set(dtaghash.slice(0, 8), offset + 10);
        }
      }
      return (await this.call("loadReplaceables", binQuery)).map((b, i) => {
        const kind = specs[i][0];
        const hasDtag = specs[i][2] !== void 0;
        const isAddressableBundle = kind >= 3e4 && kind < 4e4 && !hasDtag;
        if (isAddressableBundle) {
          if (!b[1]) return [
            b[0],
            []
          ];
          const events = b[1].map((eventBytes) => {
            const event = JSON.parse(utf8Decoder.decode(eventBytes));
            event[isLocalSymbol] = true;
            event[seenOnSymbol] = event.seen_on;
            delete event.seen_on;
            return event;
          });
          return [
            b[0],
            events
          ];
        } else {
          if (!b[1]) return [
            b[0],
            void 0
          ];
          const event = JSON.parse(utf8Decoder.decode(b[1]));
          event[isLocalSymbol] = true;
          event[seenOnSymbol] = event.seen_on;
          delete event.seen_on;
          return [
            b[0],
            event
          ];
        }
      });
    }
    /**
     * only for use by the outbox module.
     */
    async getOutboxBounds() {
      if (!this.#fullyInitialized) await this.init();
      const response = await this.call("getOutboxBounds", {});
      return JSON.parse(utf8Decoder.decode(response));
    }
    /**
     * only for use by the outbox module.
     */
    async setOutboxBound(pubkey, bound) {
      if (!this.#fullyInitialized) await this.init();
      await this.call("setOutboxBound", {
        pubkey,
        bound
      });
    }
    /**
     * deletes a database file from OPFS.
     *
     * @param dbName - name of the database to delete
     * @returns boolean - true if deletion was successful
     */
    static async delete(dbName) {
      const dir = await navigator.storage.getDirectory();
      await dir.removeEntry(dbName);
    }
    /**
     * lists all existing database files in OPFS with their stats.
     *
     * @returns array of database info objects with name, size, and lastModified
     */
    static async list() {
      const result = [];
      const dir = await navigator.storage.getDirectory();
      await walkDir(dir);
      return result;
      async function walkDir(dir2, base = "") {
        for await (let [name, entry] of dir2.entries()) {
          if (entry.kind === "file") {
            const file = await entry.getFile();
            result.push({
              name: base + name,
              size: file.size,
              lastModified: file.lastModified
            });
          } else {
            walkDir(entry, name + "/");
          }
        }
      }
    }
  };
  var isLocalSymbol = /* @__PURE__ */ Symbol("this event is stored locally");
  var seenOnSymbol = /* @__PURE__ */ Symbol("relays where this event was seen");
  function isLocal(event) {
    return event[isLocalSymbol] || false;
  }
  function seenOn(event) {
    return event[seenOnSymbol] || [];
  }
  return __toCommonJS(index_exports);
})();
/*! Bundled license information:

@noble/hashes/utils.js:
  (*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) *)
*/
