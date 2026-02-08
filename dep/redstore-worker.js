// node_modules/@nostr/gadgets/redstore/pkg/gadgets_redstore.js
var wasm;
function addToExternrefTable0(obj) {
  const idx = wasm.__externref_table_alloc();
  wasm.__wbindgen_externrefs.set(idx, obj);
  return idx;
}
function debugString(val) {
  const type = typeof val;
  if (type == "number" || type == "boolean" || val == null) {
    return `${val}`;
  }
  if (type == "string") {
    return `"${val}"`;
  }
  if (type == "symbol") {
    const description = val.description;
    if (description == null) {
      return "Symbol";
    } else {
      return `Symbol(${description})`;
    }
  }
  if (type == "function") {
    const name = val.name;
    if (typeof name == "string" && name.length > 0) {
      return `Function(${name})`;
    } else {
      return "Function";
    }
  }
  if (Array.isArray(val)) {
    const length = val.length;
    let debug = "[";
    if (length > 0) {
      debug += debugString(val[0]);
    }
    for (let i = 1; i < length; i++) {
      debug += ", " + debugString(val[i]);
    }
    debug += "]";
    return debug;
  }
  const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
  let className;
  if (builtInMatches && builtInMatches.length > 1) {
    className = builtInMatches[1];
  } else {
    return toString.call(val);
  }
  if (className == "Object") {
    try {
      return "Object(" + JSON.stringify(val) + ")";
    } catch (_) {
      return "Object";
    }
  }
  if (val instanceof Error) {
    return `${val.name}: ${val.message}
${val.stack}`;
  }
  return className;
}
function getArrayU8FromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}
var cachedDataViewMemory0 = null;
function getDataViewMemory0() {
  if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || cachedDataViewMemory0.buffer.detached === void 0 && cachedDataViewMemory0.buffer !== wasm.memory.buffer) {
    cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
  }
  return cachedDataViewMemory0;
}
function getStringFromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return decodeText(ptr, len);
}
var cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
  if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
    cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
  }
  return cachedUint8ArrayMemory0;
}
function handleError(f, args) {
  try {
    return f.apply(this, args);
  } catch (e) {
    const idx = addToExternrefTable0(e);
    wasm.__wbindgen_exn_store(idx);
  }
}
function isLikeNone(x) {
  return x === void 0 || x === null;
}
function passArray8ToWasm0(arg, malloc) {
  const ptr = malloc(arg.length * 1, 1) >>> 0;
  getUint8ArrayMemory0().set(arg, ptr / 1);
  WASM_VECTOR_LEN = arg.length;
  return ptr;
}
function passStringToWasm0(arg, malloc, realloc) {
  if (realloc === void 0) {
    const buf = cachedTextEncoder.encode(arg);
    const ptr2 = malloc(buf.length, 1) >>> 0;
    getUint8ArrayMemory0().subarray(ptr2, ptr2 + buf.length).set(buf);
    WASM_VECTOR_LEN = buf.length;
    return ptr2;
  }
  let len = arg.length;
  let ptr = malloc(len, 1) >>> 0;
  const mem = getUint8ArrayMemory0();
  let offset = 0;
  for (; offset < len; offset++) {
    const code = arg.charCodeAt(offset);
    if (code > 127) break;
    mem[ptr + offset] = code;
  }
  if (offset !== len) {
    if (offset !== 0) {
      arg = arg.slice(offset);
    }
    ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
    const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
    const ret = cachedTextEncoder.encodeInto(arg, view);
    offset += ret.written;
    ptr = realloc(ptr, len, offset, 1) >>> 0;
  }
  WASM_VECTOR_LEN = offset;
  return ptr;
}
function takeFromExternrefTable0(idx) {
  const value = wasm.__wbindgen_externrefs.get(idx);
  wasm.__externref_table_dealloc(idx);
  return value;
}
var cachedTextDecoder = new TextDecoder("utf-8", { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
var MAX_SAFARI_DECODE_BYTES = 2146435072;
var numBytesDecoded = 0;
function decodeText(ptr, len) {
  numBytesDecoded += len;
  if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
    cachedTextDecoder = new TextDecoder("utf-8", { ignoreBOM: true, fatal: true });
    cachedTextDecoder.decode();
    numBytesDecoded = len;
  }
  return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}
var cachedTextEncoder = new TextEncoder();
if (!("encodeInto" in cachedTextEncoder)) {
  cachedTextEncoder.encodeInto = function(arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
      read: arg.length,
      written: buf.length
    };
  };
}
var WASM_VECTOR_LEN = 0;
var RedstoreFinalization = typeof FinalizationRegistry === "undefined" ? { register: () => {
}, unregister: () => {
} } : new FinalizationRegistry((ptr) => wasm.__wbg_redstore_free(ptr >>> 0, 1));
var Redstore = class {
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    RedstoreFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_redstore_free(ptr, 0);
  }
  /**
   * @param {object} filter
   * @returns {Array<any>}
   */
  query_events(filter) {
    const ret = wasm.redstore_query_events(this.__wbg_ptr, filter);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * @param {Array<any>} filters_arr
   * @returns {any}
   */
  delete_events(filters_arr) {
    const ret = wasm.redstore_delete_events(this.__wbg_ptr, filters_arr);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * @param {string} pubkey
   * @param {number} bound_start
   * @param {number} bound_end
   */
  set_outbox_bound(pubkey, bound_start, bound_end) {
    const ret = wasm.redstore_set_outbox_bound(this.__wbg_ptr, pubkey, bound_start, bound_end);
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0]);
    }
  }
  /**
   * @param {FileSystemSyncAccessHandle} sync_handle
   */
  constructor(sync_handle) {
    const ret = wasm.redstore_new(sync_handle);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    this.__wbg_ptr = ret[0] >>> 0;
    RedstoreFinalization.register(this, this.__wbg_ptr, this);
    return this;
  }
  close() {
    const ptr = this.__destroy_into_raw();
    const ret = wasm.redstore_close(ptr);
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0]);
    }
  }
  /**
   * @param {Array<any>} last_attempts
   * @param {Array<any>} raw_events_arr
   * @returns {any}
   */
  save_events(last_attempts, raw_events_arr) {
    const ret = wasm.redstore_save_events(this.__wbg_ptr, last_attempts, raw_events_arr);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * @param {Uint8Array} specs
   * @returns {Array<any>}
   */
  load_replaceables(specs) {
    const ptr0 = passArray8ToWasm0(specs, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.redstore_load_replaceables(this.__wbg_ptr, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * @returns {Uint8Array}
   */
  get_outbox_bounds() {
    const ret = wasm.redstore_get_outbox_bounds(this.__wbg_ptr);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
};
if (Symbol.dispose) Redstore.prototype[Symbol.dispose] = Redstore.prototype.free;
var EXPECTED_RESPONSE_TYPES = /* @__PURE__ */ new Set(["basic", "cors", "default"]);
async function __wbg_load(module, imports) {
  if (typeof Response === "function" && module instanceof Response) {
    if (typeof WebAssembly.instantiateStreaming === "function") {
      try {
        return await WebAssembly.instantiateStreaming(module, imports);
      } catch (e) {
        const validResponse = module.ok && EXPECTED_RESPONSE_TYPES.has(module.type);
        if (validResponse && module.headers.get("Content-Type") !== "application/wasm") {
          console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);
        } else {
          throw e;
        }
      }
    }
    const bytes = await module.arrayBuffer();
    return await WebAssembly.instantiate(bytes, imports);
  } else {
    const instance = await WebAssembly.instantiate(module, imports);
    if (instance instanceof WebAssembly.Instance) {
      return { instance, module };
    } else {
      return instance;
    }
  }
}
function __wbg_get_imports() {
  const imports = {};
  imports.wbg = {};
  imports.wbg.__wbg___wbindgen_debug_string_adfb662ae34724b6 = function(arg0, arg1) {
    const ret = debugString(arg1);
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
  };
  imports.wbg.__wbg___wbindgen_number_get_9619185a74197f95 = function(arg0, arg1) {
    const obj = arg1;
    const ret = typeof obj === "number" ? obj : void 0;
    getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
  };
  imports.wbg.__wbg___wbindgen_string_get_a2a31e16edf96e42 = function(arg0, arg1) {
    const obj = arg1;
    const ret = typeof obj === "string" ? obj : void 0;
    var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
  };
  imports.wbg.__wbg___wbindgen_throw_dd24417ed36fc46e = function(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
  };
  imports.wbg.__wbg_error_7534b8e9a36f1ab4 = function(arg0, arg1) {
    let deferred0_0;
    let deferred0_1;
    try {
      deferred0_0 = arg0;
      deferred0_1 = arg1;
      console.error(getStringFromWasm0(arg0, arg1));
    } finally {
      wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
    }
  };
  imports.wbg.__wbg_flush_554f5177ae6f76cb = function() {
    return handleError(function(arg0) {
      arg0.flush();
    }, arguments);
  };
  imports.wbg.__wbg_from_29a8414a7a7cd19d = function(arg0) {
    const ret = Array.from(arg0);
    return ret;
  };
  imports.wbg.__wbg_getRandomValues_1c61fac11405ffdc = function() {
    return handleError(function(arg0, arg1) {
      globalThis.crypto.getRandomValues(getArrayU8FromWasm0(arg0, arg1));
    }, arguments);
  };
  imports.wbg.__wbg_getSize_1bf196c4094d8f7b = function() {
    return handleError(function(arg0) {
      const ret = arg0.getSize();
      return ret;
    }, arguments);
  };
  imports.wbg.__wbg_get_6b7bd52aca3f9671 = function(arg0, arg1) {
    const ret = arg0[arg1 >>> 0];
    return ret;
  };
  imports.wbg.__wbg_get_af9dab7e9603ea93 = function() {
    return handleError(function(arg0, arg1) {
      const ret = Reflect.get(arg0, arg1);
      return ret;
    }, arguments);
  };
  imports.wbg.__wbg_keys_f5c6002ff150fc6c = function(arg0) {
    const ret = Object.keys(arg0);
    return ret;
  };
  imports.wbg.__wbg_length_22ac23eaec9d8053 = function(arg0) {
    const ret = arg0.length;
    return ret;
  };
  imports.wbg.__wbg_length_d45040a40c570362 = function(arg0) {
    const ret = arg0.length;
    return ret;
  };
  imports.wbg.__wbg_new_1ba21ce319a06297 = function() {
    const ret = new Object();
    return ret;
  };
  imports.wbg.__wbg_new_25f239778d6112b9 = function() {
    const ret = new Array();
    return ret;
  };
  imports.wbg.__wbg_new_8a6f238a6ece86ea = function() {
    const ret = new Error();
    return ret;
  };
  imports.wbg.__wbg_new_from_slice_f9c22b9153b26992 = function(arg0, arg1) {
    const ret = new Uint8Array(getArrayU8FromWasm0(arg0, arg1));
    return ret;
  };
  imports.wbg.__wbg_new_with_length_12c6de4fac33117a = function(arg0) {
    const ret = new Array(arg0 >>> 0);
    return ret;
  };
  imports.wbg.__wbg_now_69d776cd24f5215b = function() {
    const ret = Date.now();
    return ret;
  };
  imports.wbg.__wbg_prototypesetcall_dfe9b766cdc1f1fd = function(arg0, arg1, arg2) {
    Uint8Array.prototype.set.call(getArrayU8FromWasm0(arg0, arg1), arg2);
  };
  imports.wbg.__wbg_push_7d9be8f38fc13975 = function(arg0, arg1) {
    const ret = arg0.push(arg1);
    return ret;
  };
  imports.wbg.__wbg_read_0063be96fda4ddbb = function() {
    return handleError(function(arg0, arg1, arg2, arg3) {
      const ret = arg0.read(getArrayU8FromWasm0(arg1, arg2), arg3);
      return ret;
    }, arguments);
  };
  imports.wbg.__wbg_set_7df433eea03a5c14 = function(arg0, arg1, arg2) {
    arg0[arg1 >>> 0] = arg2;
  };
  imports.wbg.__wbg_set_at_8ed309b95b9da8e8 = function(arg0, arg1) {
    arg0.at = arg1;
  };
  imports.wbg.__wbg_stack_0ed75d68575b0f3c = function(arg0, arg1) {
    const ret = arg1.stack;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
  };
  imports.wbg.__wbg_truncate_9e72c83b9fc1d156 = function() {
    return handleError(function(arg0, arg1) {
      arg0.truncate(arg1 >>> 0);
    }, arguments);
  };
  imports.wbg.__wbg_write_f87f327ea3e1dd4b = function() {
    return handleError(function(arg0, arg1, arg2, arg3) {
      const ret = arg0.write(getArrayU8FromWasm0(arg1, arg2), arg3);
      return ret;
    }, arguments);
  };
  imports.wbg.__wbindgen_cast_2241b6af4c4b2941 = function(arg0, arg1) {
    const ret = getStringFromWasm0(arg0, arg1);
    return ret;
  };
  imports.wbg.__wbindgen_cast_d6cd19b81560fd6e = function(arg0) {
    const ret = arg0;
    return ret;
  };
  imports.wbg.__wbindgen_init_externref_table = function() {
    const table = wasm.__wbindgen_externrefs;
    const offset = table.grow(4);
    table.set(0, void 0);
    table.set(offset + 0, void 0);
    table.set(offset + 1, null);
    table.set(offset + 2, true);
    table.set(offset + 3, false);
  };
  return imports;
}
function __wbg_finalize_init(instance, module) {
  wasm = instance.exports;
  __wbg_init.__wbindgen_wasm_module = module;
  cachedDataViewMemory0 = null;
  cachedUint8ArrayMemory0 = null;
  wasm.__wbindgen_start();
  return wasm;
}
async function __wbg_init(module_or_path) {
  if (wasm !== void 0) return wasm;
  if (typeof module_or_path !== "undefined") {
    if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
      ({ module_or_path } = module_or_path);
    } else {
      console.warn("using deprecated parameters for the initialization function; pass a single object instead");
    }
  }
  if (typeof module_or_path === "undefined") {
    module_or_path = new URL("gadgets_redstore_bg.wasm", import.meta.url);
  }
  const imports = __wbg_get_imports();
  if (typeof module_or_path === "string" || typeof Request === "function" && module_or_path instanceof Request || typeof URL === "function" && module_or_path instanceof URL) {
    module_or_path = fetch(module_or_path);
  }
  const { instance, module } = await __wbg_load(await module_or_path, imports);
  return __wbg_finalize_init(instance, module);
}
var gadgets_redstore_default = __wbg_init;

// node_modules/@nostr/gadgets/redstore/redstore-worker.js
var syncHandle;
var db = null;
var pendingRequests = /* @__PURE__ */ new Map();
var serial = 1;
var random = Math.round(Math.random() * 1e6);
var fileName = null;
var lastLeaderHeartbeat = 0;
var heartbeatInterval = null;
var checkLeaderInterval = null;
var takeoverInProgress = false;
var HEARTBEAT_INTERVAL = 1e4;
var CHECK_LEADER_INTERVAL = 15e3;
var HEARTBEAT_STALE_THRESHOLD = 13e3;
var bc = new BroadcastChannel("calls");
function broadcast(msg) {
  console.debug("&> bc", msg);
  bc.postMessage(msg);
}
bc.addEventListener("message", async (event) => {
  console.debug("&< bc", event.data);
  const [type, proxyId, ...re] = event.data;
  switch (type) {
    case "call": {
      if (!db) return;
      const result = command(re[0], re[1]);
      broadcast([
        "response",
        proxyId,
        true,
        result
      ]);
      break;
    }
    case "response": {
      const pending = pendingRequests.get(proxyId);
      if (pending) {
        if (re[0]) {
          pending.resolve(re[1]);
        } else {
          pending.reject(new Error(re[1]));
        }
        pendingRequests.delete(proxyId);
      }
      break;
    }
    case "heartbeat": {
      if (!db) {
        lastLeaderHeartbeat = Date.now();
        console.debug("& received heartbeat from leader");
      }
      break;
    }
    case "close": {
      if (!db) {
        console.log("& leader closed, attempting immediate takeover...");
        attemptLeadershipTakeover();
      }
      break;
    }
  }
});
function sendToPage(msg) {
  console.debug("~> page", msg);
  self.postMessage(msg);
}
self.addEventListener("message", async (event) => {
  console.debug("~< page", event.data);
  const [id, method, data] = event.data;
  if (method === "init") {
    fileName = data.fileName;
    try {
      await gadgets_redstore_default();
      const opfsRoot = await navigator.storage.getDirectory();
      const fileHandle = await opfsRoot.getFileHandle(data.fileName, {
        create: true
      });
      syncHandle = await fileHandle.createSyncAccessHandle();
      db = new Redstore(syncHandle);
      startLeaderHeartbeat();
      sendToPage([
        id,
        true,
        true
      ]);
    } catch (error) {
      console.log("~ we didn't get the file:", error);
      startCheckingLeader();
      sendToPage([
        id,
        true,
        false
      ]);
    }
  } else {
    try {
      if (db) {
        if (method === "close") {
          clearIntervals();
          db.close();
          syncHandle.close();
          db = null;
          sendToPage([
            id,
            true,
            true
          ]);
          broadcast([
            "close"
          ]);
          bc.close();
        } else {
          const result = command(method, data);
          sendToPage([
            id,
            true,
            result
          ]);
        }
      } else {
        const result = await new Promise((resolve, reject) => {
          const proxyId = serial++ + random;
          pendingRequests.set(proxyId, {
            resolve,
            reject
          });
          broadcast([
            "call",
            proxyId,
            method,
            data
          ]);
        });
        sendToPage([
          id,
          true,
          result
        ]);
      }
    } catch (error) {
      sendToPage([
        id,
        false,
        String(error)
      ]);
    }
  }
});
function startLeaderHeartbeat() {
  clearIntervals();
  broadcast([
    "heartbeat"
  ]);
  console.debug("& started leader heartbeat");
  heartbeatInterval = setInterval(() => {
    broadcast([
      "heartbeat"
    ]);
    console.debug("& sent heartbeat");
  }, HEARTBEAT_INTERVAL);
}
function startCheckingLeader() {
  clearIntervals();
  lastLeaderHeartbeat = Date.now();
  console.debug("& started checking for leader");
  checkLeaderInterval = setInterval(() => {
    if (db) {
      if (checkLeaderInterval) clearInterval(checkLeaderInterval);
      checkLeaderInterval = null;
      return;
    }
    const timeSinceLastHeartbeat = Date.now() - lastLeaderHeartbeat;
    if (timeSinceLastHeartbeat > HEARTBEAT_STALE_THRESHOLD) {
      console.log("& leader heartbeat stale, attempting takeover...");
      attemptLeadershipTakeover();
    }
  }, CHECK_LEADER_INTERVAL);
}
async function attemptLeadershipTakeover() {
  if (!fileName) {
    console.error("& cannot attempt takeover: no stored filename");
    return;
  }
  if (takeoverInProgress) {
    console.debug("& takeover already in progress, skipping");
    return;
  }
  takeoverInProgress = true;
  try {
    const opfsRoot = await navigator.storage.getDirectory();
    const fileHandle = await opfsRoot.getFileHandle(fileName, {
      create: true
    });
    syncHandle = await fileHandle.createSyncAccessHandle();
    db = new Redstore(syncHandle);
    console.log("& successfully took over as leader");
    startLeaderHeartbeat();
  } catch (error) {
    console.log("& takeover failed, another worker is leader:", error);
    lastLeaderHeartbeat = Date.now();
  } finally {
    takeoverInProgress = false;
  }
}
function clearIntervals() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
  if (checkLeaderInterval) {
    clearInterval(checkLeaderInterval);
    checkLeaderInterval = null;
  }
}
function command(method, data) {
  let result;
  switch (method) {
    case "saveEvents":
      result = db.save_events(data.lastAttempts, data.rawEvents);
      break;
    case "deleteEvents":
      result = db.delete_events(data);
      break;
    case "queryEvents":
      result = db.query_events(data);
      break;
    case "loadReplaceables":
      result = db.load_replaceables(data);
      break;
    case "getOutboxBounds":
      result = db.get_outbox_bounds();
      break;
    case "setOutboxBound":
      result = db.set_outbox_bound(data.pubkey, data.bound[0], data.bound[1]);
      break;
    default:
      throw new Error(`unknown method: ${method}`);
  }
  return result;
}
