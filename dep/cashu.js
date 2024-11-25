// ~/node_modules/.bin/esbuild index.ts --bundle --format=iife --global-name='cashu' --outfile=ts.js
var cashu = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
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
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // ../../../base64-js/index.js
  var require_base64_js = __commonJS({
    "../../../base64-js/index.js"(exports) {
      "use strict";
      exports.byteLength = byteLength;
      exports.toByteArray = toByteArray;
      exports.fromByteArray = fromByteArray;
      var lookup = [];
      var revLookup = [];
      var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
      var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
      for (i = 0, len = code.length; i < len; ++i) {
        lookup[i] = code[i];
        revLookup[code.charCodeAt(i)] = i;
      }
      var i;
      var len;
      revLookup["-".charCodeAt(0)] = 62;
      revLookup["_".charCodeAt(0)] = 63;
      function getLens(b64) {
        var len2 = b64.length;
        if (len2 % 4 > 0) {
          throw new Error("Invalid string. Length must be a multiple of 4");
        }
        var validLen = b64.indexOf("=");
        if (validLen === -1)
          validLen = len2;
        var placeHoldersLen = validLen === len2 ? 0 : 4 - validLen % 4;
        return [validLen, placeHoldersLen];
      }
      function byteLength(b64) {
        var lens = getLens(b64);
        var validLen = lens[0];
        var placeHoldersLen = lens[1];
        return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
      }
      function _byteLength(b64, validLen, placeHoldersLen) {
        return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
      }
      function toByteArray(b64) {
        var tmp;
        var lens = getLens(b64);
        var validLen = lens[0];
        var placeHoldersLen = lens[1];
        var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
        var curByte = 0;
        var len2 = placeHoldersLen > 0 ? validLen - 4 : validLen;
        var i2;
        for (i2 = 0; i2 < len2; i2 += 4) {
          tmp = revLookup[b64.charCodeAt(i2)] << 18 | revLookup[b64.charCodeAt(i2 + 1)] << 12 | revLookup[b64.charCodeAt(i2 + 2)] << 6 | revLookup[b64.charCodeAt(i2 + 3)];
          arr[curByte++] = tmp >> 16 & 255;
          arr[curByte++] = tmp >> 8 & 255;
          arr[curByte++] = tmp & 255;
        }
        if (placeHoldersLen === 2) {
          tmp = revLookup[b64.charCodeAt(i2)] << 2 | revLookup[b64.charCodeAt(i2 + 1)] >> 4;
          arr[curByte++] = tmp & 255;
        }
        if (placeHoldersLen === 1) {
          tmp = revLookup[b64.charCodeAt(i2)] << 10 | revLookup[b64.charCodeAt(i2 + 1)] << 4 | revLookup[b64.charCodeAt(i2 + 2)] >> 2;
          arr[curByte++] = tmp >> 8 & 255;
          arr[curByte++] = tmp & 255;
        }
        return arr;
      }
      function tripletToBase64(num) {
        return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
      }
      function encodeChunk(uint8, start, end) {
        var tmp;
        var output2 = [];
        for (var i2 = start; i2 < end; i2 += 3) {
          tmp = (uint8[i2] << 16 & 16711680) + (uint8[i2 + 1] << 8 & 65280) + (uint8[i2 + 2] & 255);
          output2.push(tripletToBase64(tmp));
        }
        return output2.join("");
      }
      function fromByteArray(uint8) {
        var tmp;
        var len2 = uint8.length;
        var extraBytes = len2 % 3;
        var parts = [];
        var maxChunkLength = 16383;
        for (var i2 = 0, len22 = len2 - extraBytes; i2 < len22; i2 += maxChunkLength) {
          parts.push(encodeChunk(uint8, i2, i2 + maxChunkLength > len22 ? len22 : i2 + maxChunkLength));
        }
        if (extraBytes === 1) {
          tmp = uint8[len2 - 1];
          parts.push(
            lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "=="
          );
        } else if (extraBytes === 2) {
          tmp = (uint8[len2 - 2] << 8) + uint8[len2 - 1];
          parts.push(
            lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "="
          );
        }
        return parts.join("");
      }
    }
  });

  // ../../../ieee754/index.js
  var require_ieee754 = __commonJS({
    "../../../ieee754/index.js"(exports) {
      exports.read = function(buffer, offset, isLE2, mLen, nBytes) {
        var e, m;
        var eLen = nBytes * 8 - mLen - 1;
        var eMax = (1 << eLen) - 1;
        var eBias = eMax >> 1;
        var nBits = -7;
        var i = isLE2 ? nBytes - 1 : 0;
        var d = isLE2 ? -1 : 1;
        var s = buffer[offset + i];
        i += d;
        e = s & (1 << -nBits) - 1;
        s >>= -nBits;
        nBits += eLen;
        for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {
        }
        m = e & (1 << -nBits) - 1;
        e >>= -nBits;
        nBits += mLen;
        for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {
        }
        if (e === 0) {
          e = 1 - eBias;
        } else if (e === eMax) {
          return m ? NaN : (s ? -1 : 1) * Infinity;
        } else {
          m = m + Math.pow(2, mLen);
          e = e - eBias;
        }
        return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
      };
      exports.write = function(buffer, value, offset, isLE2, mLen, nBytes) {
        var e, m, c;
        var eLen = nBytes * 8 - mLen - 1;
        var eMax = (1 << eLen) - 1;
        var eBias = eMax >> 1;
        var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
        var i = isLE2 ? 0 : nBytes - 1;
        var d = isLE2 ? 1 : -1;
        var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
        value = Math.abs(value);
        if (isNaN(value) || value === Infinity) {
          m = isNaN(value) ? 1 : 0;
          e = eMax;
        } else {
          e = Math.floor(Math.log(value) / Math.LN2);
          if (value * (c = Math.pow(2, -e)) < 1) {
            e--;
            c *= 2;
          }
          if (e + eBias >= 1) {
            value += rt / c;
          } else {
            value += rt * Math.pow(2, 1 - eBias);
          }
          if (value * c >= 2) {
            e++;
            c /= 2;
          }
          if (e + eBias >= eMax) {
            m = 0;
            e = eMax;
          } else if (e + eBias >= 1) {
            m = (value * c - 1) * Math.pow(2, mLen);
            e = e + eBias;
          } else {
            m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
            e = 0;
          }
        }
        for (; mLen >= 8; buffer[offset + i] = m & 255, i += d, m /= 256, mLen -= 8) {
        }
        e = e << mLen | m;
        eLen += mLen;
        for (; eLen > 0; buffer[offset + i] = e & 255, i += d, e /= 256, eLen -= 8) {
        }
        buffer[offset + i - d] |= s * 128;
      };
    }
  });

  // ../../../buffer/index.js
  var require_buffer = __commonJS({
    "../../../buffer/index.js"(exports) {
      "use strict";
      var base642 = require_base64_js();
      var ieee754 = require_ieee754();
      var customInspectSymbol = typeof Symbol === "function" && typeof Symbol["for"] === "function" ? Symbol["for"]("nodejs.util.inspect.custom") : null;
      exports.Buffer = Buffer4;
      exports.SlowBuffer = SlowBuffer;
      exports.INSPECT_MAX_BYTES = 50;
      var K_MAX_LENGTH = 2147483647;
      exports.kMaxLength = K_MAX_LENGTH;
      Buffer4.TYPED_ARRAY_SUPPORT = typedArraySupport();
      if (!Buffer4.TYPED_ARRAY_SUPPORT && typeof console !== "undefined" && typeof console.error === "function") {
        console.error(
          "This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support."
        );
      }
      function typedArraySupport() {
        try {
          const arr = new Uint8Array(1);
          const proto = { foo: function() {
            return 42;
          } };
          Object.setPrototypeOf(proto, Uint8Array.prototype);
          Object.setPrototypeOf(arr, proto);
          return arr.foo() === 42;
        } catch (e) {
          return false;
        }
      }
      Object.defineProperty(Buffer4.prototype, "parent", {
        enumerable: true,
        get: function() {
          if (!Buffer4.isBuffer(this))
            return void 0;
          return this.buffer;
        }
      });
      Object.defineProperty(Buffer4.prototype, "offset", {
        enumerable: true,
        get: function() {
          if (!Buffer4.isBuffer(this))
            return void 0;
          return this.byteOffset;
        }
      });
      function createBuffer(length) {
        if (length > K_MAX_LENGTH) {
          throw new RangeError('The value "' + length + '" is invalid for option "size"');
        }
        const buf = new Uint8Array(length);
        Object.setPrototypeOf(buf, Buffer4.prototype);
        return buf;
      }
      function Buffer4(arg, encodingOrOffset, length) {
        if (typeof arg === "number") {
          if (typeof encodingOrOffset === "string") {
            throw new TypeError(
              'The "string" argument must be of type string. Received type number'
            );
          }
          return allocUnsafe(arg);
        }
        return from(arg, encodingOrOffset, length);
      }
      Buffer4.poolSize = 8192;
      function from(value, encodingOrOffset, length) {
        if (typeof value === "string") {
          return fromString(value, encodingOrOffset);
        }
        if (ArrayBuffer.isView(value)) {
          return fromArrayView(value);
        }
        if (value == null) {
          throw new TypeError(
            "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value
          );
        }
        if (isInstance(value, ArrayBuffer) || value && isInstance(value.buffer, ArrayBuffer)) {
          return fromArrayBuffer(value, encodingOrOffset, length);
        }
        if (typeof SharedArrayBuffer !== "undefined" && (isInstance(value, SharedArrayBuffer) || value && isInstance(value.buffer, SharedArrayBuffer))) {
          return fromArrayBuffer(value, encodingOrOffset, length);
        }
        if (typeof value === "number") {
          throw new TypeError(
            'The "value" argument must not be of type number. Received type number'
          );
        }
        const valueOf = value.valueOf && value.valueOf();
        if (valueOf != null && valueOf !== value) {
          return Buffer4.from(valueOf, encodingOrOffset, length);
        }
        const b = fromObject(value);
        if (b)
          return b;
        if (typeof Symbol !== "undefined" && Symbol.toPrimitive != null && typeof value[Symbol.toPrimitive] === "function") {
          return Buffer4.from(value[Symbol.toPrimitive]("string"), encodingOrOffset, length);
        }
        throw new TypeError(
          "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value
        );
      }
      Buffer4.from = function(value, encodingOrOffset, length) {
        return from(value, encodingOrOffset, length);
      };
      Object.setPrototypeOf(Buffer4.prototype, Uint8Array.prototype);
      Object.setPrototypeOf(Buffer4, Uint8Array);
      function assertSize(size) {
        if (typeof size !== "number") {
          throw new TypeError('"size" argument must be of type number');
        } else if (size < 0) {
          throw new RangeError('The value "' + size + '" is invalid for option "size"');
        }
      }
      function alloc(size, fill, encoding) {
        assertSize(size);
        if (size <= 0) {
          return createBuffer(size);
        }
        if (fill !== void 0) {
          return typeof encoding === "string" ? createBuffer(size).fill(fill, encoding) : createBuffer(size).fill(fill);
        }
        return createBuffer(size);
      }
      Buffer4.alloc = function(size, fill, encoding) {
        return alloc(size, fill, encoding);
      };
      function allocUnsafe(size) {
        assertSize(size);
        return createBuffer(size < 0 ? 0 : checked(size) | 0);
      }
      Buffer4.allocUnsafe = function(size) {
        return allocUnsafe(size);
      };
      Buffer4.allocUnsafeSlow = function(size) {
        return allocUnsafe(size);
      };
      function fromString(string, encoding) {
        if (typeof encoding !== "string" || encoding === "") {
          encoding = "utf8";
        }
        if (!Buffer4.isEncoding(encoding)) {
          throw new TypeError("Unknown encoding: " + encoding);
        }
        const length = byteLength(string, encoding) | 0;
        let buf = createBuffer(length);
        const actual = buf.write(string, encoding);
        if (actual !== length) {
          buf = buf.slice(0, actual);
        }
        return buf;
      }
      function fromArrayLike(array) {
        const length = array.length < 0 ? 0 : checked(array.length) | 0;
        const buf = createBuffer(length);
        for (let i = 0; i < length; i += 1) {
          buf[i] = array[i] & 255;
        }
        return buf;
      }
      function fromArrayView(arrayView) {
        if (isInstance(arrayView, Uint8Array)) {
          const copy = new Uint8Array(arrayView);
          return fromArrayBuffer(copy.buffer, copy.byteOffset, copy.byteLength);
        }
        return fromArrayLike(arrayView);
      }
      function fromArrayBuffer(array, byteOffset, length) {
        if (byteOffset < 0 || array.byteLength < byteOffset) {
          throw new RangeError('"offset" is outside of buffer bounds');
        }
        if (array.byteLength < byteOffset + (length || 0)) {
          throw new RangeError('"length" is outside of buffer bounds');
        }
        let buf;
        if (byteOffset === void 0 && length === void 0) {
          buf = new Uint8Array(array);
        } else if (length === void 0) {
          buf = new Uint8Array(array, byteOffset);
        } else {
          buf = new Uint8Array(array, byteOffset, length);
        }
        Object.setPrototypeOf(buf, Buffer4.prototype);
        return buf;
      }
      function fromObject(obj) {
        if (Buffer4.isBuffer(obj)) {
          const len = checked(obj.length) | 0;
          const buf = createBuffer(len);
          if (buf.length === 0) {
            return buf;
          }
          obj.copy(buf, 0, 0, len);
          return buf;
        }
        if (obj.length !== void 0) {
          if (typeof obj.length !== "number" || numberIsNaN(obj.length)) {
            return createBuffer(0);
          }
          return fromArrayLike(obj);
        }
        if (obj.type === "Buffer" && Array.isArray(obj.data)) {
          return fromArrayLike(obj.data);
        }
      }
      function checked(length) {
        if (length >= K_MAX_LENGTH) {
          throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + K_MAX_LENGTH.toString(16) + " bytes");
        }
        return length | 0;
      }
      function SlowBuffer(length) {
        if (+length != length) {
          length = 0;
        }
        return Buffer4.alloc(+length);
      }
      Buffer4.isBuffer = function isBuffer(b) {
        return b != null && b._isBuffer === true && b !== Buffer4.prototype;
      };
      Buffer4.compare = function compare(a, b) {
        if (isInstance(a, Uint8Array))
          a = Buffer4.from(a, a.offset, a.byteLength);
        if (isInstance(b, Uint8Array))
          b = Buffer4.from(b, b.offset, b.byteLength);
        if (!Buffer4.isBuffer(a) || !Buffer4.isBuffer(b)) {
          throw new TypeError(
            'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
          );
        }
        if (a === b)
          return 0;
        let x = a.length;
        let y = b.length;
        for (let i = 0, len = Math.min(x, y); i < len; ++i) {
          if (a[i] !== b[i]) {
            x = a[i];
            y = b[i];
            break;
          }
        }
        if (x < y)
          return -1;
        if (y < x)
          return 1;
        return 0;
      };
      Buffer4.isEncoding = function isEncoding(encoding) {
        switch (String(encoding).toLowerCase()) {
          case "hex":
          case "utf8":
          case "utf-8":
          case "ascii":
          case "latin1":
          case "binary":
          case "base64":
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return true;
          default:
            return false;
        }
      };
      Buffer4.concat = function concat(list, length) {
        if (!Array.isArray(list)) {
          throw new TypeError('"list" argument must be an Array of Buffers');
        }
        if (list.length === 0) {
          return Buffer4.alloc(0);
        }
        let i;
        if (length === void 0) {
          length = 0;
          for (i = 0; i < list.length; ++i) {
            length += list[i].length;
          }
        }
        const buffer = Buffer4.allocUnsafe(length);
        let pos = 0;
        for (i = 0; i < list.length; ++i) {
          let buf = list[i];
          if (isInstance(buf, Uint8Array)) {
            if (pos + buf.length > buffer.length) {
              if (!Buffer4.isBuffer(buf))
                buf = Buffer4.from(buf);
              buf.copy(buffer, pos);
            } else {
              Uint8Array.prototype.set.call(
                buffer,
                buf,
                pos
              );
            }
          } else if (!Buffer4.isBuffer(buf)) {
            throw new TypeError('"list" argument must be an Array of Buffers');
          } else {
            buf.copy(buffer, pos);
          }
          pos += buf.length;
        }
        return buffer;
      };
      function byteLength(string, encoding) {
        if (Buffer4.isBuffer(string)) {
          return string.length;
        }
        if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
          return string.byteLength;
        }
        if (typeof string !== "string") {
          throw new TypeError(
            'The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof string
          );
        }
        const len = string.length;
        const mustMatch = arguments.length > 2 && arguments[2] === true;
        if (!mustMatch && len === 0)
          return 0;
        let loweredCase = false;
        for (; ; ) {
          switch (encoding) {
            case "ascii":
            case "latin1":
            case "binary":
              return len;
            case "utf8":
            case "utf-8":
              return utf8ToBytes2(string).length;
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return len * 2;
            case "hex":
              return len >>> 1;
            case "base64":
              return base64ToBytes(string).length;
            default:
              if (loweredCase) {
                return mustMatch ? -1 : utf8ToBytes2(string).length;
              }
              encoding = ("" + encoding).toLowerCase();
              loweredCase = true;
          }
        }
      }
      Buffer4.byteLength = byteLength;
      function slowToString(encoding, start, end) {
        let loweredCase = false;
        if (start === void 0 || start < 0) {
          start = 0;
        }
        if (start > this.length) {
          return "";
        }
        if (end === void 0 || end > this.length) {
          end = this.length;
        }
        if (end <= 0) {
          return "";
        }
        end >>>= 0;
        start >>>= 0;
        if (end <= start) {
          return "";
        }
        if (!encoding)
          encoding = "utf8";
        while (true) {
          switch (encoding) {
            case "hex":
              return hexSlice(this, start, end);
            case "utf8":
            case "utf-8":
              return utf8Slice(this, start, end);
            case "ascii":
              return asciiSlice(this, start, end);
            case "latin1":
            case "binary":
              return latin1Slice(this, start, end);
            case "base64":
              return base64Slice(this, start, end);
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return utf16leSlice(this, start, end);
            default:
              if (loweredCase)
                throw new TypeError("Unknown encoding: " + encoding);
              encoding = (encoding + "").toLowerCase();
              loweredCase = true;
          }
        }
      }
      Buffer4.prototype._isBuffer = true;
      function swap(b, n, m) {
        const i = b[n];
        b[n] = b[m];
        b[m] = i;
      }
      Buffer4.prototype.swap16 = function swap16() {
        const len = this.length;
        if (len % 2 !== 0) {
          throw new RangeError("Buffer size must be a multiple of 16-bits");
        }
        for (let i = 0; i < len; i += 2) {
          swap(this, i, i + 1);
        }
        return this;
      };
      Buffer4.prototype.swap32 = function swap32() {
        const len = this.length;
        if (len % 4 !== 0) {
          throw new RangeError("Buffer size must be a multiple of 32-bits");
        }
        for (let i = 0; i < len; i += 4) {
          swap(this, i, i + 3);
          swap(this, i + 1, i + 2);
        }
        return this;
      };
      Buffer4.prototype.swap64 = function swap64() {
        const len = this.length;
        if (len % 8 !== 0) {
          throw new RangeError("Buffer size must be a multiple of 64-bits");
        }
        for (let i = 0; i < len; i += 8) {
          swap(this, i, i + 7);
          swap(this, i + 1, i + 6);
          swap(this, i + 2, i + 5);
          swap(this, i + 3, i + 4);
        }
        return this;
      };
      Buffer4.prototype.toString = function toString() {
        const length = this.length;
        if (length === 0)
          return "";
        if (arguments.length === 0)
          return utf8Slice(this, 0, length);
        return slowToString.apply(this, arguments);
      };
      Buffer4.prototype.toLocaleString = Buffer4.prototype.toString;
      Buffer4.prototype.equals = function equals(b) {
        if (!Buffer4.isBuffer(b))
          throw new TypeError("Argument must be a Buffer");
        if (this === b)
          return true;
        return Buffer4.compare(this, b) === 0;
      };
      Buffer4.prototype.inspect = function inspect() {
        let str = "";
        const max = exports.INSPECT_MAX_BYTES;
        str = this.toString("hex", 0, max).replace(/(.{2})/g, "$1 ").trim();
        if (this.length > max)
          str += " ... ";
        return "<Buffer " + str + ">";
      };
      if (customInspectSymbol) {
        Buffer4.prototype[customInspectSymbol] = Buffer4.prototype.inspect;
      }
      Buffer4.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
        if (isInstance(target, Uint8Array)) {
          target = Buffer4.from(target, target.offset, target.byteLength);
        }
        if (!Buffer4.isBuffer(target)) {
          throw new TypeError(
            'The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof target
          );
        }
        if (start === void 0) {
          start = 0;
        }
        if (end === void 0) {
          end = target ? target.length : 0;
        }
        if (thisStart === void 0) {
          thisStart = 0;
        }
        if (thisEnd === void 0) {
          thisEnd = this.length;
        }
        if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
          throw new RangeError("out of range index");
        }
        if (thisStart >= thisEnd && start >= end) {
          return 0;
        }
        if (thisStart >= thisEnd) {
          return -1;
        }
        if (start >= end) {
          return 1;
        }
        start >>>= 0;
        end >>>= 0;
        thisStart >>>= 0;
        thisEnd >>>= 0;
        if (this === target)
          return 0;
        let x = thisEnd - thisStart;
        let y = end - start;
        const len = Math.min(x, y);
        const thisCopy = this.slice(thisStart, thisEnd);
        const targetCopy = target.slice(start, end);
        for (let i = 0; i < len; ++i) {
          if (thisCopy[i] !== targetCopy[i]) {
            x = thisCopy[i];
            y = targetCopy[i];
            break;
          }
        }
        if (x < y)
          return -1;
        if (y < x)
          return 1;
        return 0;
      };
      function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
        if (buffer.length === 0)
          return -1;
        if (typeof byteOffset === "string") {
          encoding = byteOffset;
          byteOffset = 0;
        } else if (byteOffset > 2147483647) {
          byteOffset = 2147483647;
        } else if (byteOffset < -2147483648) {
          byteOffset = -2147483648;
        }
        byteOffset = +byteOffset;
        if (numberIsNaN(byteOffset)) {
          byteOffset = dir ? 0 : buffer.length - 1;
        }
        if (byteOffset < 0)
          byteOffset = buffer.length + byteOffset;
        if (byteOffset >= buffer.length) {
          if (dir)
            return -1;
          else
            byteOffset = buffer.length - 1;
        } else if (byteOffset < 0) {
          if (dir)
            byteOffset = 0;
          else
            return -1;
        }
        if (typeof val === "string") {
          val = Buffer4.from(val, encoding);
        }
        if (Buffer4.isBuffer(val)) {
          if (val.length === 0) {
            return -1;
          }
          return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
        } else if (typeof val === "number") {
          val = val & 255;
          if (typeof Uint8Array.prototype.indexOf === "function") {
            if (dir) {
              return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
            } else {
              return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
            }
          }
          return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
        }
        throw new TypeError("val must be string, number or Buffer");
      }
      function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
        let indexSize = 1;
        let arrLength = arr.length;
        let valLength = val.length;
        if (encoding !== void 0) {
          encoding = String(encoding).toLowerCase();
          if (encoding === "ucs2" || encoding === "ucs-2" || encoding === "utf16le" || encoding === "utf-16le") {
            if (arr.length < 2 || val.length < 2) {
              return -1;
            }
            indexSize = 2;
            arrLength /= 2;
            valLength /= 2;
            byteOffset /= 2;
          }
        }
        function read(buf, i2) {
          if (indexSize === 1) {
            return buf[i2];
          } else {
            return buf.readUInt16BE(i2 * indexSize);
          }
        }
        let i;
        if (dir) {
          let foundIndex = -1;
          for (i = byteOffset; i < arrLength; i++) {
            if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
              if (foundIndex === -1)
                foundIndex = i;
              if (i - foundIndex + 1 === valLength)
                return foundIndex * indexSize;
            } else {
              if (foundIndex !== -1)
                i -= i - foundIndex;
              foundIndex = -1;
            }
          }
        } else {
          if (byteOffset + valLength > arrLength)
            byteOffset = arrLength - valLength;
          for (i = byteOffset; i >= 0; i--) {
            let found = true;
            for (let j = 0; j < valLength; j++) {
              if (read(arr, i + j) !== read(val, j)) {
                found = false;
                break;
              }
            }
            if (found)
              return i;
          }
        }
        return -1;
      }
      Buffer4.prototype.includes = function includes(val, byteOffset, encoding) {
        return this.indexOf(val, byteOffset, encoding) !== -1;
      };
      Buffer4.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
        return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
      };
      Buffer4.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
        return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
      };
      function hexWrite(buf, string, offset, length) {
        offset = Number(offset) || 0;
        const remaining = buf.length - offset;
        if (!length) {
          length = remaining;
        } else {
          length = Number(length);
          if (length > remaining) {
            length = remaining;
          }
        }
        const strLen = string.length;
        if (length > strLen / 2) {
          length = strLen / 2;
        }
        let i;
        for (i = 0; i < length; ++i) {
          const parsed = parseInt(string.substr(i * 2, 2), 16);
          if (numberIsNaN(parsed))
            return i;
          buf[offset + i] = parsed;
        }
        return i;
      }
      function utf8Write(buf, string, offset, length) {
        return blitBuffer(utf8ToBytes2(string, buf.length - offset), buf, offset, length);
      }
      function asciiWrite(buf, string, offset, length) {
        return blitBuffer(asciiToBytes(string), buf, offset, length);
      }
      function base64Write(buf, string, offset, length) {
        return blitBuffer(base64ToBytes(string), buf, offset, length);
      }
      function ucs2Write(buf, string, offset, length) {
        return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
      }
      Buffer4.prototype.write = function write(string, offset, length, encoding) {
        if (offset === void 0) {
          encoding = "utf8";
          length = this.length;
          offset = 0;
        } else if (length === void 0 && typeof offset === "string") {
          encoding = offset;
          length = this.length;
          offset = 0;
        } else if (isFinite(offset)) {
          offset = offset >>> 0;
          if (isFinite(length)) {
            length = length >>> 0;
            if (encoding === void 0)
              encoding = "utf8";
          } else {
            encoding = length;
            length = void 0;
          }
        } else {
          throw new Error(
            "Buffer.write(string, encoding, offset[, length]) is no longer supported"
          );
        }
        const remaining = this.length - offset;
        if (length === void 0 || length > remaining)
          length = remaining;
        if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
          throw new RangeError("Attempt to write outside buffer bounds");
        }
        if (!encoding)
          encoding = "utf8";
        let loweredCase = false;
        for (; ; ) {
          switch (encoding) {
            case "hex":
              return hexWrite(this, string, offset, length);
            case "utf8":
            case "utf-8":
              return utf8Write(this, string, offset, length);
            case "ascii":
            case "latin1":
            case "binary":
              return asciiWrite(this, string, offset, length);
            case "base64":
              return base64Write(this, string, offset, length);
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return ucs2Write(this, string, offset, length);
            default:
              if (loweredCase)
                throw new TypeError("Unknown encoding: " + encoding);
              encoding = ("" + encoding).toLowerCase();
              loweredCase = true;
          }
        }
      };
      Buffer4.prototype.toJSON = function toJSON() {
        return {
          type: "Buffer",
          data: Array.prototype.slice.call(this._arr || this, 0)
        };
      };
      function base64Slice(buf, start, end) {
        if (start === 0 && end === buf.length) {
          return base642.fromByteArray(buf);
        } else {
          return base642.fromByteArray(buf.slice(start, end));
        }
      }
      function utf8Slice(buf, start, end) {
        end = Math.min(buf.length, end);
        const res = [];
        let i = start;
        while (i < end) {
          const firstByte = buf[i];
          let codePoint = null;
          let bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
          if (i + bytesPerSequence <= end) {
            let secondByte, thirdByte, fourthByte, tempCodePoint;
            switch (bytesPerSequence) {
              case 1:
                if (firstByte < 128) {
                  codePoint = firstByte;
                }
                break;
              case 2:
                secondByte = buf[i + 1];
                if ((secondByte & 192) === 128) {
                  tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
                  if (tempCodePoint > 127) {
                    codePoint = tempCodePoint;
                  }
                }
                break;
              case 3:
                secondByte = buf[i + 1];
                thirdByte = buf[i + 2];
                if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
                  tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
                  if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
                    codePoint = tempCodePoint;
                  }
                }
                break;
              case 4:
                secondByte = buf[i + 1];
                thirdByte = buf[i + 2];
                fourthByte = buf[i + 3];
                if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
                  tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
                  if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
                    codePoint = tempCodePoint;
                  }
                }
            }
          }
          if (codePoint === null) {
            codePoint = 65533;
            bytesPerSequence = 1;
          } else if (codePoint > 65535) {
            codePoint -= 65536;
            res.push(codePoint >>> 10 & 1023 | 55296);
            codePoint = 56320 | codePoint & 1023;
          }
          res.push(codePoint);
          i += bytesPerSequence;
        }
        return decodeCodePointsArray(res);
      }
      var MAX_ARGUMENTS_LENGTH = 4096;
      function decodeCodePointsArray(codePoints) {
        const len = codePoints.length;
        if (len <= MAX_ARGUMENTS_LENGTH) {
          return String.fromCharCode.apply(String, codePoints);
        }
        let res = "";
        let i = 0;
        while (i < len) {
          res += String.fromCharCode.apply(
            String,
            codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
          );
        }
        return res;
      }
      function asciiSlice(buf, start, end) {
        let ret = "";
        end = Math.min(buf.length, end);
        for (let i = start; i < end; ++i) {
          ret += String.fromCharCode(buf[i] & 127);
        }
        return ret;
      }
      function latin1Slice(buf, start, end) {
        let ret = "";
        end = Math.min(buf.length, end);
        for (let i = start; i < end; ++i) {
          ret += String.fromCharCode(buf[i]);
        }
        return ret;
      }
      function hexSlice(buf, start, end) {
        const len = buf.length;
        if (!start || start < 0)
          start = 0;
        if (!end || end < 0 || end > len)
          end = len;
        let out = "";
        for (let i = start; i < end; ++i) {
          out += hexSliceLookupTable[buf[i]];
        }
        return out;
      }
      function utf16leSlice(buf, start, end) {
        const bytes2 = buf.slice(start, end);
        let res = "";
        for (let i = 0; i < bytes2.length - 1; i += 2) {
          res += String.fromCharCode(bytes2[i] + bytes2[i + 1] * 256);
        }
        return res;
      }
      Buffer4.prototype.slice = function slice(start, end) {
        const len = this.length;
        start = ~~start;
        end = end === void 0 ? len : ~~end;
        if (start < 0) {
          start += len;
          if (start < 0)
            start = 0;
        } else if (start > len) {
          start = len;
        }
        if (end < 0) {
          end += len;
          if (end < 0)
            end = 0;
        } else if (end > len) {
          end = len;
        }
        if (end < start)
          end = start;
        const newBuf = this.subarray(start, end);
        Object.setPrototypeOf(newBuf, Buffer4.prototype);
        return newBuf;
      };
      function checkOffset(offset, ext, length) {
        if (offset % 1 !== 0 || offset < 0)
          throw new RangeError("offset is not uint");
        if (offset + ext > length)
          throw new RangeError("Trying to access beyond buffer length");
      }
      Buffer4.prototype.readUintLE = Buffer4.prototype.readUIntLE = function readUIntLE(offset, byteLength2, noAssert) {
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert)
          checkOffset(offset, byteLength2, this.length);
        let val = this[offset];
        let mul = 1;
        let i = 0;
        while (++i < byteLength2 && (mul *= 256)) {
          val += this[offset + i] * mul;
        }
        return val;
      };
      Buffer4.prototype.readUintBE = Buffer4.prototype.readUIntBE = function readUIntBE(offset, byteLength2, noAssert) {
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) {
          checkOffset(offset, byteLength2, this.length);
        }
        let val = this[offset + --byteLength2];
        let mul = 1;
        while (byteLength2 > 0 && (mul *= 256)) {
          val += this[offset + --byteLength2] * mul;
        }
        return val;
      };
      Buffer4.prototype.readUint8 = Buffer4.prototype.readUInt8 = function readUInt8(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert)
          checkOffset(offset, 1, this.length);
        return this[offset];
      };
      Buffer4.prototype.readUint16LE = Buffer4.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert)
          checkOffset(offset, 2, this.length);
        return this[offset] | this[offset + 1] << 8;
      };
      Buffer4.prototype.readUint16BE = Buffer4.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert)
          checkOffset(offset, 2, this.length);
        return this[offset] << 8 | this[offset + 1];
      };
      Buffer4.prototype.readUint32LE = Buffer4.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert)
          checkOffset(offset, 4, this.length);
        return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 16777216;
      };
      Buffer4.prototype.readUint32BE = Buffer4.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert)
          checkOffset(offset, 4, this.length);
        return this[offset] * 16777216 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
      };
      Buffer4.prototype.readBigUInt64LE = defineBigIntMethod(function readBigUInt64LE(offset) {
        offset = offset >>> 0;
        validateNumber(offset, "offset");
        const first = this[offset];
        const last = this[offset + 7];
        if (first === void 0 || last === void 0) {
          boundsError(offset, this.length - 8);
        }
        const lo = first + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24;
        const hi = this[++offset] + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + last * 2 ** 24;
        return BigInt(lo) + (BigInt(hi) << BigInt(32));
      });
      Buffer4.prototype.readBigUInt64BE = defineBigIntMethod(function readBigUInt64BE(offset) {
        offset = offset >>> 0;
        validateNumber(offset, "offset");
        const first = this[offset];
        const last = this[offset + 7];
        if (first === void 0 || last === void 0) {
          boundsError(offset, this.length - 8);
        }
        const hi = first * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + this[++offset];
        const lo = this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + last;
        return (BigInt(hi) << BigInt(32)) + BigInt(lo);
      });
      Buffer4.prototype.readIntLE = function readIntLE(offset, byteLength2, noAssert) {
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert)
          checkOffset(offset, byteLength2, this.length);
        let val = this[offset];
        let mul = 1;
        let i = 0;
        while (++i < byteLength2 && (mul *= 256)) {
          val += this[offset + i] * mul;
        }
        mul *= 128;
        if (val >= mul)
          val -= Math.pow(2, 8 * byteLength2);
        return val;
      };
      Buffer4.prototype.readIntBE = function readIntBE(offset, byteLength2, noAssert) {
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert)
          checkOffset(offset, byteLength2, this.length);
        let i = byteLength2;
        let mul = 1;
        let val = this[offset + --i];
        while (i > 0 && (mul *= 256)) {
          val += this[offset + --i] * mul;
        }
        mul *= 128;
        if (val >= mul)
          val -= Math.pow(2, 8 * byteLength2);
        return val;
      };
      Buffer4.prototype.readInt8 = function readInt8(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert)
          checkOffset(offset, 1, this.length);
        if (!(this[offset] & 128))
          return this[offset];
        return (255 - this[offset] + 1) * -1;
      };
      Buffer4.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert)
          checkOffset(offset, 2, this.length);
        const val = this[offset] | this[offset + 1] << 8;
        return val & 32768 ? val | 4294901760 : val;
      };
      Buffer4.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert)
          checkOffset(offset, 2, this.length);
        const val = this[offset + 1] | this[offset] << 8;
        return val & 32768 ? val | 4294901760 : val;
      };
      Buffer4.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert)
          checkOffset(offset, 4, this.length);
        return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
      };
      Buffer4.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert)
          checkOffset(offset, 4, this.length);
        return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
      };
      Buffer4.prototype.readBigInt64LE = defineBigIntMethod(function readBigInt64LE(offset) {
        offset = offset >>> 0;
        validateNumber(offset, "offset");
        const first = this[offset];
        const last = this[offset + 7];
        if (first === void 0 || last === void 0) {
          boundsError(offset, this.length - 8);
        }
        const val = this[offset + 4] + this[offset + 5] * 2 ** 8 + this[offset + 6] * 2 ** 16 + (last << 24);
        return (BigInt(val) << BigInt(32)) + BigInt(first + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24);
      });
      Buffer4.prototype.readBigInt64BE = defineBigIntMethod(function readBigInt64BE(offset) {
        offset = offset >>> 0;
        validateNumber(offset, "offset");
        const first = this[offset];
        const last = this[offset + 7];
        if (first === void 0 || last === void 0) {
          boundsError(offset, this.length - 8);
        }
        const val = (first << 24) + // Overflow
        this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + this[++offset];
        return (BigInt(val) << BigInt(32)) + BigInt(this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + last);
      });
      Buffer4.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert)
          checkOffset(offset, 4, this.length);
        return ieee754.read(this, offset, true, 23, 4);
      };
      Buffer4.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert)
          checkOffset(offset, 4, this.length);
        return ieee754.read(this, offset, false, 23, 4);
      };
      Buffer4.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert)
          checkOffset(offset, 8, this.length);
        return ieee754.read(this, offset, true, 52, 8);
      };
      Buffer4.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert)
          checkOffset(offset, 8, this.length);
        return ieee754.read(this, offset, false, 52, 8);
      };
      function checkInt(buf, value, offset, ext, max, min) {
        if (!Buffer4.isBuffer(buf))
          throw new TypeError('"buffer" argument must be a Buffer instance');
        if (value > max || value < min)
          throw new RangeError('"value" argument is out of bounds');
        if (offset + ext > buf.length)
          throw new RangeError("Index out of range");
      }
      Buffer4.prototype.writeUintLE = Buffer4.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength2, noAssert) {
        value = +value;
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) {
          const maxBytes = Math.pow(2, 8 * byteLength2) - 1;
          checkInt(this, value, offset, byteLength2, maxBytes, 0);
        }
        let mul = 1;
        let i = 0;
        this[offset] = value & 255;
        while (++i < byteLength2 && (mul *= 256)) {
          this[offset + i] = value / mul & 255;
        }
        return offset + byteLength2;
      };
      Buffer4.prototype.writeUintBE = Buffer4.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength2, noAssert) {
        value = +value;
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) {
          const maxBytes = Math.pow(2, 8 * byteLength2) - 1;
          checkInt(this, value, offset, byteLength2, maxBytes, 0);
        }
        let i = byteLength2 - 1;
        let mul = 1;
        this[offset + i] = value & 255;
        while (--i >= 0 && (mul *= 256)) {
          this[offset + i] = value / mul & 255;
        }
        return offset + byteLength2;
      };
      Buffer4.prototype.writeUint8 = Buffer4.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert)
          checkInt(this, value, offset, 1, 255, 0);
        this[offset] = value & 255;
        return offset + 1;
      };
      Buffer4.prototype.writeUint16LE = Buffer4.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert)
          checkInt(this, value, offset, 2, 65535, 0);
        this[offset] = value & 255;
        this[offset + 1] = value >>> 8;
        return offset + 2;
      };
      Buffer4.prototype.writeUint16BE = Buffer4.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert)
          checkInt(this, value, offset, 2, 65535, 0);
        this[offset] = value >>> 8;
        this[offset + 1] = value & 255;
        return offset + 2;
      };
      Buffer4.prototype.writeUint32LE = Buffer4.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert)
          checkInt(this, value, offset, 4, 4294967295, 0);
        this[offset + 3] = value >>> 24;
        this[offset + 2] = value >>> 16;
        this[offset + 1] = value >>> 8;
        this[offset] = value & 255;
        return offset + 4;
      };
      Buffer4.prototype.writeUint32BE = Buffer4.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert)
          checkInt(this, value, offset, 4, 4294967295, 0);
        this[offset] = value >>> 24;
        this[offset + 1] = value >>> 16;
        this[offset + 2] = value >>> 8;
        this[offset + 3] = value & 255;
        return offset + 4;
      };
      function wrtBigUInt64LE(buf, value, offset, min, max) {
        checkIntBI(value, min, max, buf, offset, 7);
        let lo = Number(value & BigInt(4294967295));
        buf[offset++] = lo;
        lo = lo >> 8;
        buf[offset++] = lo;
        lo = lo >> 8;
        buf[offset++] = lo;
        lo = lo >> 8;
        buf[offset++] = lo;
        let hi = Number(value >> BigInt(32) & BigInt(4294967295));
        buf[offset++] = hi;
        hi = hi >> 8;
        buf[offset++] = hi;
        hi = hi >> 8;
        buf[offset++] = hi;
        hi = hi >> 8;
        buf[offset++] = hi;
        return offset;
      }
      function wrtBigUInt64BE(buf, value, offset, min, max) {
        checkIntBI(value, min, max, buf, offset, 7);
        let lo = Number(value & BigInt(4294967295));
        buf[offset + 7] = lo;
        lo = lo >> 8;
        buf[offset + 6] = lo;
        lo = lo >> 8;
        buf[offset + 5] = lo;
        lo = lo >> 8;
        buf[offset + 4] = lo;
        let hi = Number(value >> BigInt(32) & BigInt(4294967295));
        buf[offset + 3] = hi;
        hi = hi >> 8;
        buf[offset + 2] = hi;
        hi = hi >> 8;
        buf[offset + 1] = hi;
        hi = hi >> 8;
        buf[offset] = hi;
        return offset + 8;
      }
      Buffer4.prototype.writeBigUInt64LE = defineBigIntMethod(function writeBigUInt64LE(value, offset = 0) {
        return wrtBigUInt64LE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
      });
      Buffer4.prototype.writeBigUInt64BE = defineBigIntMethod(function writeBigUInt64BE(value, offset = 0) {
        return wrtBigUInt64BE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
      });
      Buffer4.prototype.writeIntLE = function writeIntLE(value, offset, byteLength2, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) {
          const limit = Math.pow(2, 8 * byteLength2 - 1);
          checkInt(this, value, offset, byteLength2, limit - 1, -limit);
        }
        let i = 0;
        let mul = 1;
        let sub = 0;
        this[offset] = value & 255;
        while (++i < byteLength2 && (mul *= 256)) {
          if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
            sub = 1;
          }
          this[offset + i] = (value / mul >> 0) - sub & 255;
        }
        return offset + byteLength2;
      };
      Buffer4.prototype.writeIntBE = function writeIntBE(value, offset, byteLength2, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) {
          const limit = Math.pow(2, 8 * byteLength2 - 1);
          checkInt(this, value, offset, byteLength2, limit - 1, -limit);
        }
        let i = byteLength2 - 1;
        let mul = 1;
        let sub = 0;
        this[offset + i] = value & 255;
        while (--i >= 0 && (mul *= 256)) {
          if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
            sub = 1;
          }
          this[offset + i] = (value / mul >> 0) - sub & 255;
        }
        return offset + byteLength2;
      };
      Buffer4.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert)
          checkInt(this, value, offset, 1, 127, -128);
        if (value < 0)
          value = 255 + value + 1;
        this[offset] = value & 255;
        return offset + 1;
      };
      Buffer4.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert)
          checkInt(this, value, offset, 2, 32767, -32768);
        this[offset] = value & 255;
        this[offset + 1] = value >>> 8;
        return offset + 2;
      };
      Buffer4.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert)
          checkInt(this, value, offset, 2, 32767, -32768);
        this[offset] = value >>> 8;
        this[offset + 1] = value & 255;
        return offset + 2;
      };
      Buffer4.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert)
          checkInt(this, value, offset, 4, 2147483647, -2147483648);
        this[offset] = value & 255;
        this[offset + 1] = value >>> 8;
        this[offset + 2] = value >>> 16;
        this[offset + 3] = value >>> 24;
        return offset + 4;
      };
      Buffer4.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert)
          checkInt(this, value, offset, 4, 2147483647, -2147483648);
        if (value < 0)
          value = 4294967295 + value + 1;
        this[offset] = value >>> 24;
        this[offset + 1] = value >>> 16;
        this[offset + 2] = value >>> 8;
        this[offset + 3] = value & 255;
        return offset + 4;
      };
      Buffer4.prototype.writeBigInt64LE = defineBigIntMethod(function writeBigInt64LE(value, offset = 0) {
        return wrtBigUInt64LE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
      });
      Buffer4.prototype.writeBigInt64BE = defineBigIntMethod(function writeBigInt64BE(value, offset = 0) {
        return wrtBigUInt64BE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
      });
      function checkIEEE754(buf, value, offset, ext, max, min) {
        if (offset + ext > buf.length)
          throw new RangeError("Index out of range");
        if (offset < 0)
          throw new RangeError("Index out of range");
      }
      function writeFloat(buf, value, offset, littleEndian, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) {
          checkIEEE754(buf, value, offset, 4, 34028234663852886e22, -34028234663852886e22);
        }
        ieee754.write(buf, value, offset, littleEndian, 23, 4);
        return offset + 4;
      }
      Buffer4.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
        return writeFloat(this, value, offset, true, noAssert);
      };
      Buffer4.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
        return writeFloat(this, value, offset, false, noAssert);
      };
      function writeDouble(buf, value, offset, littleEndian, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) {
          checkIEEE754(buf, value, offset, 8, 17976931348623157e292, -17976931348623157e292);
        }
        ieee754.write(buf, value, offset, littleEndian, 52, 8);
        return offset + 8;
      }
      Buffer4.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
        return writeDouble(this, value, offset, true, noAssert);
      };
      Buffer4.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
        return writeDouble(this, value, offset, false, noAssert);
      };
      Buffer4.prototype.copy = function copy(target, targetStart, start, end) {
        if (!Buffer4.isBuffer(target))
          throw new TypeError("argument should be a Buffer");
        if (!start)
          start = 0;
        if (!end && end !== 0)
          end = this.length;
        if (targetStart >= target.length)
          targetStart = target.length;
        if (!targetStart)
          targetStart = 0;
        if (end > 0 && end < start)
          end = start;
        if (end === start)
          return 0;
        if (target.length === 0 || this.length === 0)
          return 0;
        if (targetStart < 0) {
          throw new RangeError("targetStart out of bounds");
        }
        if (start < 0 || start >= this.length)
          throw new RangeError("Index out of range");
        if (end < 0)
          throw new RangeError("sourceEnd out of bounds");
        if (end > this.length)
          end = this.length;
        if (target.length - targetStart < end - start) {
          end = target.length - targetStart + start;
        }
        const len = end - start;
        if (this === target && typeof Uint8Array.prototype.copyWithin === "function") {
          this.copyWithin(targetStart, start, end);
        } else {
          Uint8Array.prototype.set.call(
            target,
            this.subarray(start, end),
            targetStart
          );
        }
        return len;
      };
      Buffer4.prototype.fill = function fill(val, start, end, encoding) {
        if (typeof val === "string") {
          if (typeof start === "string") {
            encoding = start;
            start = 0;
            end = this.length;
          } else if (typeof end === "string") {
            encoding = end;
            end = this.length;
          }
          if (encoding !== void 0 && typeof encoding !== "string") {
            throw new TypeError("encoding must be a string");
          }
          if (typeof encoding === "string" && !Buffer4.isEncoding(encoding)) {
            throw new TypeError("Unknown encoding: " + encoding);
          }
          if (val.length === 1) {
            const code = val.charCodeAt(0);
            if (encoding === "utf8" && code < 128 || encoding === "latin1") {
              val = code;
            }
          }
        } else if (typeof val === "number") {
          val = val & 255;
        } else if (typeof val === "boolean") {
          val = Number(val);
        }
        if (start < 0 || this.length < start || this.length < end) {
          throw new RangeError("Out of range index");
        }
        if (end <= start) {
          return this;
        }
        start = start >>> 0;
        end = end === void 0 ? this.length : end >>> 0;
        if (!val)
          val = 0;
        let i;
        if (typeof val === "number") {
          for (i = start; i < end; ++i) {
            this[i] = val;
          }
        } else {
          const bytes2 = Buffer4.isBuffer(val) ? val : Buffer4.from(val, encoding);
          const len = bytes2.length;
          if (len === 0) {
            throw new TypeError('The value "' + val + '" is invalid for argument "value"');
          }
          for (i = 0; i < end - start; ++i) {
            this[i + start] = bytes2[i % len];
          }
        }
        return this;
      };
      var errors = {};
      function E(sym, getMessage, Base) {
        errors[sym] = class NodeError extends Base {
          constructor() {
            super();
            Object.defineProperty(this, "message", {
              value: getMessage.apply(this, arguments),
              writable: true,
              configurable: true
            });
            this.name = `${this.name} [${sym}]`;
            this.stack;
            delete this.name;
          }
          get code() {
            return sym;
          }
          set code(value) {
            Object.defineProperty(this, "code", {
              configurable: true,
              enumerable: true,
              value,
              writable: true
            });
          }
          toString() {
            return `${this.name} [${sym}]: ${this.message}`;
          }
        };
      }
      E(
        "ERR_BUFFER_OUT_OF_BOUNDS",
        function(name) {
          if (name) {
            return `${name} is outside of buffer bounds`;
          }
          return "Attempt to access memory outside buffer bounds";
        },
        RangeError
      );
      E(
        "ERR_INVALID_ARG_TYPE",
        function(name, actual) {
          return `The "${name}" argument must be of type number. Received type ${typeof actual}`;
        },
        TypeError
      );
      E(
        "ERR_OUT_OF_RANGE",
        function(str, range, input) {
          let msg = `The value of "${str}" is out of range.`;
          let received = input;
          if (Number.isInteger(input) && Math.abs(input) > 2 ** 32) {
            received = addNumericalSeparator(String(input));
          } else if (typeof input === "bigint") {
            received = String(input);
            if (input > BigInt(2) ** BigInt(32) || input < -(BigInt(2) ** BigInt(32))) {
              received = addNumericalSeparator(received);
            }
            received += "n";
          }
          msg += ` It must be ${range}. Received ${received}`;
          return msg;
        },
        RangeError
      );
      function addNumericalSeparator(val) {
        let res = "";
        let i = val.length;
        const start = val[0] === "-" ? 1 : 0;
        for (; i >= start + 4; i -= 3) {
          res = `_${val.slice(i - 3, i)}${res}`;
        }
        return `${val.slice(0, i)}${res}`;
      }
      function checkBounds(buf, offset, byteLength2) {
        validateNumber(offset, "offset");
        if (buf[offset] === void 0 || buf[offset + byteLength2] === void 0) {
          boundsError(offset, buf.length - (byteLength2 + 1));
        }
      }
      function checkIntBI(value, min, max, buf, offset, byteLength2) {
        if (value > max || value < min) {
          const n = typeof min === "bigint" ? "n" : "";
          let range;
          if (byteLength2 > 3) {
            if (min === 0 || min === BigInt(0)) {
              range = `>= 0${n} and < 2${n} ** ${(byteLength2 + 1) * 8}${n}`;
            } else {
              range = `>= -(2${n} ** ${(byteLength2 + 1) * 8 - 1}${n}) and < 2 ** ${(byteLength2 + 1) * 8 - 1}${n}`;
            }
          } else {
            range = `>= ${min}${n} and <= ${max}${n}`;
          }
          throw new errors.ERR_OUT_OF_RANGE("value", range, value);
        }
        checkBounds(buf, offset, byteLength2);
      }
      function validateNumber(value, name) {
        if (typeof value !== "number") {
          throw new errors.ERR_INVALID_ARG_TYPE(name, "number", value);
        }
      }
      function boundsError(value, length, type) {
        if (Math.floor(value) !== value) {
          validateNumber(value, type);
          throw new errors.ERR_OUT_OF_RANGE(type || "offset", "an integer", value);
        }
        if (length < 0) {
          throw new errors.ERR_BUFFER_OUT_OF_BOUNDS();
        }
        throw new errors.ERR_OUT_OF_RANGE(
          type || "offset",
          `>= ${type ? 1 : 0} and <= ${length}`,
          value
        );
      }
      var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;
      function base64clean(str) {
        str = str.split("=")[0];
        str = str.trim().replace(INVALID_BASE64_RE, "");
        if (str.length < 2)
          return "";
        while (str.length % 4 !== 0) {
          str = str + "=";
        }
        return str;
      }
      function utf8ToBytes2(string, units) {
        units = units || Infinity;
        let codePoint;
        const length = string.length;
        let leadSurrogate = null;
        const bytes2 = [];
        for (let i = 0; i < length; ++i) {
          codePoint = string.charCodeAt(i);
          if (codePoint > 55295 && codePoint < 57344) {
            if (!leadSurrogate) {
              if (codePoint > 56319) {
                if ((units -= 3) > -1)
                  bytes2.push(239, 191, 189);
                continue;
              } else if (i + 1 === length) {
                if ((units -= 3) > -1)
                  bytes2.push(239, 191, 189);
                continue;
              }
              leadSurrogate = codePoint;
              continue;
            }
            if (codePoint < 56320) {
              if ((units -= 3) > -1)
                bytes2.push(239, 191, 189);
              leadSurrogate = codePoint;
              continue;
            }
            codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
          } else if (leadSurrogate) {
            if ((units -= 3) > -1)
              bytes2.push(239, 191, 189);
          }
          leadSurrogate = null;
          if (codePoint < 128) {
            if ((units -= 1) < 0)
              break;
            bytes2.push(codePoint);
          } else if (codePoint < 2048) {
            if ((units -= 2) < 0)
              break;
            bytes2.push(
              codePoint >> 6 | 192,
              codePoint & 63 | 128
            );
          } else if (codePoint < 65536) {
            if ((units -= 3) < 0)
              break;
            bytes2.push(
              codePoint >> 12 | 224,
              codePoint >> 6 & 63 | 128,
              codePoint & 63 | 128
            );
          } else if (codePoint < 1114112) {
            if ((units -= 4) < 0)
              break;
            bytes2.push(
              codePoint >> 18 | 240,
              codePoint >> 12 & 63 | 128,
              codePoint >> 6 & 63 | 128,
              codePoint & 63 | 128
            );
          } else {
            throw new Error("Invalid code point");
          }
        }
        return bytes2;
      }
      function asciiToBytes(str) {
        const byteArray = [];
        for (let i = 0; i < str.length; ++i) {
          byteArray.push(str.charCodeAt(i) & 255);
        }
        return byteArray;
      }
      function utf16leToBytes(str, units) {
        let c, hi, lo;
        const byteArray = [];
        for (let i = 0; i < str.length; ++i) {
          if ((units -= 2) < 0)
            break;
          c = str.charCodeAt(i);
          hi = c >> 8;
          lo = c % 256;
          byteArray.push(lo);
          byteArray.push(hi);
        }
        return byteArray;
      }
      function base64ToBytes(str) {
        return base642.toByteArray(base64clean(str));
      }
      function blitBuffer(src, dst, offset, length) {
        let i;
        for (i = 0; i < length; ++i) {
          if (i + offset >= dst.length || i >= src.length)
            break;
          dst[i + offset] = src[i];
        }
        return i;
      }
      function isInstance(obj, type) {
        return obj instanceof type || obj != null && obj.constructor != null && obj.constructor.name != null && obj.constructor.name === type.name;
      }
      function numberIsNaN(obj) {
        return obj !== obj;
      }
      var hexSliceLookupTable = function() {
        const alphabet2 = "0123456789abcdef";
        const table = new Array(256);
        for (let i = 0; i < 16; ++i) {
          const i16 = i * 16;
          for (let j = 0; j < 16; ++j) {
            table[i16 + j] = alphabet2[i] + alphabet2[j];
          }
        }
        return table;
      }();
      function defineBigIntMethod(fn) {
        return typeof BigInt === "undefined" ? BufferBigIntNotDefined : fn;
      }
      function BufferBigIntNotDefined() {
        throw new Error("BigInt not supported");
      }
    }
  });

  // ../../../@noble/hashes/_assert.js
  var require_assert = __commonJS({
    "../../../@noble/hashes/_assert.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.isBytes = isBytes4;
      exports.number = number2;
      exports.bool = bool;
      exports.bytes = bytes2;
      exports.hash = hash;
      exports.exists = exists2;
      exports.output = output2;
      function number2(n) {
        if (!Number.isSafeInteger(n) || n < 0)
          throw new Error(`positive integer expected, not ${n}`);
      }
      function bool(b) {
        if (typeof b !== "boolean")
          throw new Error(`boolean expected, not ${b}`);
      }
      function isBytes4(a) {
        return a instanceof Uint8Array || a != null && typeof a === "object" && a.constructor.name === "Uint8Array";
      }
      function bytes2(b, ...lengths) {
        if (!isBytes4(b))
          throw new Error("Uint8Array expected");
        if (lengths.length > 0 && !lengths.includes(b.length))
          throw new Error(`Uint8Array expected of length ${lengths}, not of length=${b.length}`);
      }
      function hash(h) {
        if (typeof h !== "function" || typeof h.create !== "function")
          throw new Error("Hash should be wrapped by utils.wrapConstructor");
        number2(h.outputLen);
        number2(h.blockLen);
      }
      function exists2(instance, checkFinished = true) {
        if (instance.destroyed)
          throw new Error("Hash instance has been destroyed");
        if (checkFinished && instance.finished)
          throw new Error("Hash#digest() has already been called");
      }
      function output2(out, instance) {
        bytes2(out);
        const min = instance.outputLen;
        if (out.length < min) {
          throw new Error(`digestInto() expects output buffer of length at least ${min}`);
        }
      }
      var assert = { number: number2, bool, bytes: bytes2, hash, exists: exists2, output: output2 };
      exports.default = assert;
    }
  });

  // ../../../@noble/hashes/crypto.js
  var require_crypto = __commonJS({
    "../../../@noble/hashes/crypto.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.crypto = void 0;
      exports.crypto = typeof globalThis === "object" && "crypto" in globalThis ? globalThis.crypto : void 0;
    }
  });

  // ../../../@noble/hashes/utils.js
  var require_utils = __commonJS({
    "../../../@noble/hashes/utils.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.Hash = exports.nextTick = exports.byteSwapIfBE = exports.byteSwap = exports.isLE = exports.rotl = exports.rotr = exports.createView = exports.u32 = exports.u8 = void 0;
      exports.isBytes = isBytes4;
      exports.byteSwap32 = byteSwap32;
      exports.bytesToHex = bytesToHex3;
      exports.hexToBytes = hexToBytes2;
      exports.asyncLoop = asyncLoop;
      exports.utf8ToBytes = utf8ToBytes2;
      exports.toBytes = toBytes2;
      exports.concatBytes = concatBytes;
      exports.checkOpts = checkOpts;
      exports.wrapConstructor = wrapConstructor2;
      exports.wrapConstructorWithOpts = wrapConstructorWithOpts;
      exports.wrapXOFConstructorWithOpts = wrapXOFConstructorWithOpts;
      exports.randomBytes = randomBytes2;
      var crypto_1 = require_crypto();
      var _assert_js_1 = require_assert();
      function isBytes4(a) {
        return a instanceof Uint8Array || a != null && typeof a === "object" && a.constructor.name === "Uint8Array";
      }
      var u8 = (arr) => new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
      exports.u8 = u8;
      var u32 = (arr) => new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
      exports.u32 = u32;
      var createView2 = (arr) => new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
      exports.createView = createView2;
      var rotr2 = (word, shift) => word << 32 - shift | word >>> shift;
      exports.rotr = rotr2;
      var rotl = (word, shift) => word << shift | word >>> 32 - shift >>> 0;
      exports.rotl = rotl;
      exports.isLE = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68;
      var byteSwap = (word) => word << 24 & 4278190080 | word << 8 & 16711680 | word >>> 8 & 65280 | word >>> 24 & 255;
      exports.byteSwap = byteSwap;
      exports.byteSwapIfBE = exports.isLE ? (n) => n : (n) => (0, exports.byteSwap)(n);
      function byteSwap32(arr) {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = (0, exports.byteSwap)(arr[i]);
        }
      }
      var hexes3 = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
      function bytesToHex3(bytes2) {
        (0, _assert_js_1.bytes)(bytes2);
        let hex2 = "";
        for (let i = 0; i < bytes2.length; i++) {
          hex2 += hexes3[bytes2[i]];
        }
        return hex2;
      }
      var asciis2 = { _0: 48, _9: 57, _A: 65, _F: 70, _a: 97, _f: 102 };
      function asciiToBase162(char) {
        if (char >= asciis2._0 && char <= asciis2._9)
          return char - asciis2._0;
        if (char >= asciis2._A && char <= asciis2._F)
          return char - (asciis2._A - 10);
        if (char >= asciis2._a && char <= asciis2._f)
          return char - (asciis2._a - 10);
        return;
      }
      function hexToBytes2(hex2) {
        if (typeof hex2 !== "string")
          throw new Error("hex string expected, got " + typeof hex2);
        const hl = hex2.length;
        const al = hl / 2;
        if (hl % 2)
          throw new Error("padded hex string expected, got unpadded hex of length " + hl);
        const array = new Uint8Array(al);
        for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
          const n1 = asciiToBase162(hex2.charCodeAt(hi));
          const n2 = asciiToBase162(hex2.charCodeAt(hi + 1));
          if (n1 === void 0 || n2 === void 0) {
            const char = hex2[hi] + hex2[hi + 1];
            throw new Error('hex string expected, got non-hex character "' + char + '" at index ' + hi);
          }
          array[ai] = n1 * 16 + n2;
        }
        return array;
      }
      var nextTick = async () => {
      };
      exports.nextTick = nextTick;
      async function asyncLoop(iters, tick, cb) {
        let ts = Date.now();
        for (let i = 0; i < iters; i++) {
          cb(i);
          const diff = Date.now() - ts;
          if (diff >= 0 && diff < tick)
            continue;
          await (0, exports.nextTick)();
          ts += diff;
        }
      }
      function utf8ToBytes2(str) {
        if (typeof str !== "string")
          throw new Error(`utf8ToBytes expected string, got ${typeof str}`);
        return new Uint8Array(new TextEncoder().encode(str));
      }
      function toBytes2(data) {
        if (typeof data === "string")
          data = utf8ToBytes2(data);
        (0, _assert_js_1.bytes)(data);
        return data;
      }
      function concatBytes(...arrays) {
        let sum = 0;
        for (let i = 0; i < arrays.length; i++) {
          const a = arrays[i];
          (0, _assert_js_1.bytes)(a);
          sum += a.length;
        }
        const res = new Uint8Array(sum);
        for (let i = 0, pad = 0; i < arrays.length; i++) {
          const a = arrays[i];
          res.set(a, pad);
          pad += a.length;
        }
        return res;
      }
      var Hash2 = class {
        // Safe version that clones internal state
        clone() {
          return this._cloneInto();
        }
      };
      exports.Hash = Hash2;
      var toStr2 = {}.toString;
      function checkOpts(defaults, opts) {
        if (opts !== void 0 && toStr2.call(opts) !== "[object Object]")
          throw new Error("Options should be object or undefined");
        const merged = Object.assign(defaults, opts);
        return merged;
      }
      function wrapConstructor2(hashCons) {
        const hashC = (msg) => hashCons().update(toBytes2(msg)).digest();
        const tmp = hashCons();
        hashC.outputLen = tmp.outputLen;
        hashC.blockLen = tmp.blockLen;
        hashC.create = () => hashCons();
        return hashC;
      }
      function wrapConstructorWithOpts(hashCons) {
        const hashC = (msg, opts) => hashCons(opts).update(toBytes2(msg)).digest();
        const tmp = hashCons({});
        hashC.outputLen = tmp.outputLen;
        hashC.blockLen = tmp.blockLen;
        hashC.create = (opts) => hashCons(opts);
        return hashC;
      }
      function wrapXOFConstructorWithOpts(hashCons) {
        const hashC = (msg, opts) => hashCons(opts).update(toBytes2(msg)).digest();
        const tmp = hashCons({});
        hashC.outputLen = tmp.outputLen;
        hashC.blockLen = tmp.blockLen;
        hashC.create = (opts) => hashCons(opts);
        return hashC;
      }
      function randomBytes2(bytesLength = 32) {
        if (crypto_1.crypto && typeof crypto_1.crypto.getRandomValues === "function") {
          return crypto_1.crypto.getRandomValues(new Uint8Array(bytesLength));
        }
        if (crypto_1.crypto && typeof crypto_1.crypto.randomBytes === "function") {
          return crypto_1.crypto.randomBytes(bytesLength);
        }
        throw new Error("crypto.getRandomValues must be defined");
      }
    }
  });

  // ../../../@noble/hashes/_md.js
  var require_md = __commonJS({
    "../../../@noble/hashes/_md.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.HashMD = exports.Maj = exports.Chi = void 0;
      var _assert_js_1 = require_assert();
      var utils_js_1 = require_utils();
      function setBigUint642(view, byteOffset, value, isLE2) {
        if (typeof view.setBigUint64 === "function")
          return view.setBigUint64(byteOffset, value, isLE2);
        const _32n = BigInt(32);
        const _u32_max = BigInt(4294967295);
        const wh = Number(value >> _32n & _u32_max);
        const wl = Number(value & _u32_max);
        const h = isLE2 ? 4 : 0;
        const l = isLE2 ? 0 : 4;
        view.setUint32(byteOffset + h, wh, isLE2);
        view.setUint32(byteOffset + l, wl, isLE2);
      }
      var Chi2 = (a, b, c) => a & b ^ ~a & c;
      exports.Chi = Chi2;
      var Maj2 = (a, b, c) => a & b ^ a & c ^ b & c;
      exports.Maj = Maj2;
      var HashMD2 = class extends utils_js_1.Hash {
        constructor(blockLen, outputLen, padOffset, isLE2) {
          super();
          this.blockLen = blockLen;
          this.outputLen = outputLen;
          this.padOffset = padOffset;
          this.isLE = isLE2;
          this.finished = false;
          this.length = 0;
          this.pos = 0;
          this.destroyed = false;
          this.buffer = new Uint8Array(blockLen);
          this.view = (0, utils_js_1.createView)(this.buffer);
        }
        update(data) {
          (0, _assert_js_1.exists)(this);
          const { view, buffer, blockLen } = this;
          data = (0, utils_js_1.toBytes)(data);
          const len = data.length;
          for (let pos = 0; pos < len; ) {
            const take = Math.min(blockLen - this.pos, len - pos);
            if (take === blockLen) {
              const dataView = (0, utils_js_1.createView)(data);
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
          (0, _assert_js_1.exists)(this);
          (0, _assert_js_1.output)(out, this);
          this.finished = true;
          const { buffer, view, blockLen, isLE: isLE2 } = this;
          let { pos } = this;
          buffer[pos++] = 128;
          this.buffer.subarray(pos).fill(0);
          if (this.padOffset > blockLen - pos) {
            this.process(view, 0);
            pos = 0;
          }
          for (let i = pos; i < blockLen; i++)
            buffer[i] = 0;
          setBigUint642(view, blockLen - 8, BigInt(this.length * 8), isLE2);
          this.process(view, 0);
          const oview = (0, utils_js_1.createView)(out);
          const len = this.outputLen;
          if (len % 4)
            throw new Error("_sha2: outputLen should be aligned to 32bit");
          const outLen = len / 4;
          const state = this.get();
          if (outLen > state.length)
            throw new Error("_sha2: outputLen bigger than state");
          for (let i = 0; i < outLen; i++)
            oview.setUint32(4 * i, state[i], isLE2);
        }
        digest() {
          const { buffer, outputLen } = this;
          this.digestInto(buffer);
          const res = buffer.slice(0, outputLen);
          this.destroy();
          return res;
        }
        _cloneInto(to) {
          to || (to = new this.constructor());
          to.set(...this.get());
          const { blockLen, buffer, length, finished, destroyed, pos } = this;
          to.length = length;
          to.pos = pos;
          to.finished = finished;
          to.destroyed = destroyed;
          if (length % blockLen)
            to.buffer.set(buffer);
          return to;
        }
      };
      exports.HashMD = HashMD2;
    }
  });

  // ../../../@noble/hashes/sha256.js
  var require_sha256 = __commonJS({
    "../../../@noble/hashes/sha256.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.sha224 = exports.sha256 = exports.SHA256 = void 0;
      var _md_js_1 = require_md();
      var utils_js_1 = require_utils();
      var SHA256_K2 = /* @__PURE__ */ new Uint32Array([
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
      var SHA256_IV2 = /* @__PURE__ */ new Uint32Array([
        1779033703,
        3144134277,
        1013904242,
        2773480762,
        1359893119,
        2600822924,
        528734635,
        1541459225
      ]);
      var SHA256_W2 = /* @__PURE__ */ new Uint32Array(64);
      var SHA2562 = class extends _md_js_1.HashMD {
        constructor() {
          super(64, 32, 8, false);
          this.A = SHA256_IV2[0] | 0;
          this.B = SHA256_IV2[1] | 0;
          this.C = SHA256_IV2[2] | 0;
          this.D = SHA256_IV2[3] | 0;
          this.E = SHA256_IV2[4] | 0;
          this.F = SHA256_IV2[5] | 0;
          this.G = SHA256_IV2[6] | 0;
          this.H = SHA256_IV2[7] | 0;
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
            SHA256_W2[i] = view.getUint32(offset, false);
          for (let i = 16; i < 64; i++) {
            const W15 = SHA256_W2[i - 15];
            const W2 = SHA256_W2[i - 2];
            const s0 = (0, utils_js_1.rotr)(W15, 7) ^ (0, utils_js_1.rotr)(W15, 18) ^ W15 >>> 3;
            const s1 = (0, utils_js_1.rotr)(W2, 17) ^ (0, utils_js_1.rotr)(W2, 19) ^ W2 >>> 10;
            SHA256_W2[i] = s1 + SHA256_W2[i - 7] + s0 + SHA256_W2[i - 16] | 0;
          }
          let { A, B, C, D, E, F, G, H } = this;
          for (let i = 0; i < 64; i++) {
            const sigma1 = (0, utils_js_1.rotr)(E, 6) ^ (0, utils_js_1.rotr)(E, 11) ^ (0, utils_js_1.rotr)(E, 25);
            const T1 = H + sigma1 + (0, _md_js_1.Chi)(E, F, G) + SHA256_K2[i] + SHA256_W2[i] | 0;
            const sigma0 = (0, utils_js_1.rotr)(A, 2) ^ (0, utils_js_1.rotr)(A, 13) ^ (0, utils_js_1.rotr)(A, 22);
            const T2 = sigma0 + (0, _md_js_1.Maj)(A, B, C) | 0;
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
          SHA256_W2.fill(0);
        }
        destroy() {
          this.set(0, 0, 0, 0, 0, 0, 0, 0);
          this.buffer.fill(0);
        }
      };
      exports.SHA256 = SHA2562;
      var SHA224 = class extends SHA2562 {
        constructor() {
          super();
          this.A = 3238371032 | 0;
          this.B = 914150663 | 0;
          this.C = 812702999 | 0;
          this.D = 4144912697 | 0;
          this.E = 4290775857 | 0;
          this.F = 1750603025 | 0;
          this.G = 1694076839 | 0;
          this.H = 3204075428 | 0;
          this.outputLen = 28;
        }
      };
      exports.sha256 = (0, utils_js_1.wrapConstructor)(() => new SHA2562());
      exports.sha224 = (0, utils_js_1.wrapConstructor)(() => new SHA224());
    }
  });

  // ../../../@noble/hashes/hmac.js
  var require_hmac = __commonJS({
    "../../../@noble/hashes/hmac.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.hmac = exports.HMAC = void 0;
      var _assert_js_1 = require_assert();
      var utils_js_1 = require_utils();
      var HMAC = class extends utils_js_1.Hash {
        constructor(hash, _key) {
          super();
          this.finished = false;
          this.destroyed = false;
          (0, _assert_js_1.hash)(hash);
          const key = (0, utils_js_1.toBytes)(_key);
          this.iHash = hash.create();
          if (typeof this.iHash.update !== "function")
            throw new Error("Expected instance of class which extends utils.Hash");
          this.blockLen = this.iHash.blockLen;
          this.outputLen = this.iHash.outputLen;
          const blockLen = this.blockLen;
          const pad = new Uint8Array(blockLen);
          pad.set(key.length > blockLen ? hash.create().update(key).digest() : key);
          for (let i = 0; i < pad.length; i++)
            pad[i] ^= 54;
          this.iHash.update(pad);
          this.oHash = hash.create();
          for (let i = 0; i < pad.length; i++)
            pad[i] ^= 54 ^ 92;
          this.oHash.update(pad);
          pad.fill(0);
        }
        update(buf) {
          (0, _assert_js_1.exists)(this);
          this.iHash.update(buf);
          return this;
        }
        digestInto(out) {
          (0, _assert_js_1.exists)(this);
          (0, _assert_js_1.bytes)(out, this.outputLen);
          this.finished = true;
          this.iHash.digestInto(out);
          this.oHash.update(out);
          this.oHash.digestInto(out);
          this.destroy();
        }
        digest() {
          const out = new Uint8Array(this.oHash.outputLen);
          this.digestInto(out);
          return out;
        }
        _cloneInto(to) {
          to || (to = Object.create(Object.getPrototypeOf(this), {}));
          const { oHash, iHash, finished, destroyed, blockLen, outputLen } = this;
          to = to;
          to.finished = finished;
          to.destroyed = destroyed;
          to.blockLen = blockLen;
          to.outputLen = outputLen;
          to.oHash = oHash._cloneInto(to.oHash);
          to.iHash = iHash._cloneInto(to.iHash);
          return to;
        }
        destroy() {
          this.destroyed = true;
          this.oHash.destroy();
          this.iHash.destroy();
        }
      };
      exports.HMAC = HMAC;
      var hmac = (hash, key, message) => new HMAC(hash, key).update(message).digest();
      exports.hmac = hmac;
      exports.hmac.create = (hash, key) => new HMAC(hash, key);
    }
  });

  // ../../../@noble/curves/abstract/utils.js
  var require_utils2 = __commonJS({
    "../../../@noble/curves/abstract/utils.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.notImplemented = exports.bitMask = void 0;
      exports.isBytes = isBytes4;
      exports.abytes = abytes2;
      exports.abool = abool;
      exports.bytesToHex = bytesToHex3;
      exports.numberToHexUnpadded = numberToHexUnpadded;
      exports.hexToNumber = hexToNumber2;
      exports.hexToBytes = hexToBytes2;
      exports.bytesToNumberBE = bytesToNumberBE;
      exports.bytesToNumberLE = bytesToNumberLE;
      exports.numberToBytesBE = numberToBytesBE;
      exports.numberToBytesLE = numberToBytesLE;
      exports.numberToVarBytesBE = numberToVarBytesBE;
      exports.ensureBytes = ensureBytes;
      exports.concatBytes = concatBytes;
      exports.equalBytes = equalBytes;
      exports.utf8ToBytes = utf8ToBytes2;
      exports.inRange = inRange;
      exports.aInRange = aInRange;
      exports.bitLen = bitLen;
      exports.bitGet = bitGet;
      exports.bitSet = bitSet;
      exports.createHmacDrbg = createHmacDrbg;
      exports.validateObject = validateObject;
      exports.memoized = memoized;
      var _0n = /* @__PURE__ */ BigInt(0);
      var _1n = /* @__PURE__ */ BigInt(1);
      var _2n = /* @__PURE__ */ BigInt(2);
      function isBytes4(a) {
        return a instanceof Uint8Array || a != null && typeof a === "object" && a.constructor.name === "Uint8Array";
      }
      function abytes2(item) {
        if (!isBytes4(item))
          throw new Error("Uint8Array expected");
      }
      function abool(title, value) {
        if (typeof value !== "boolean")
          throw new Error(`${title} must be valid boolean, got "${value}".`);
      }
      var hexes3 = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
      function bytesToHex3(bytes2) {
        abytes2(bytes2);
        let hex2 = "";
        for (let i = 0; i < bytes2.length; i++) {
          hex2 += hexes3[bytes2[i]];
        }
        return hex2;
      }
      function numberToHexUnpadded(num) {
        const hex2 = num.toString(16);
        return hex2.length & 1 ? `0${hex2}` : hex2;
      }
      function hexToNumber2(hex2) {
        if (typeof hex2 !== "string")
          throw new Error("hex string expected, got " + typeof hex2);
        return BigInt(hex2 === "" ? "0" : `0x${hex2}`);
      }
      var asciis2 = { _0: 48, _9: 57, _A: 65, _F: 70, _a: 97, _f: 102 };
      function asciiToBase162(char) {
        if (char >= asciis2._0 && char <= asciis2._9)
          return char - asciis2._0;
        if (char >= asciis2._A && char <= asciis2._F)
          return char - (asciis2._A - 10);
        if (char >= asciis2._a && char <= asciis2._f)
          return char - (asciis2._a - 10);
        return;
      }
      function hexToBytes2(hex2) {
        if (typeof hex2 !== "string")
          throw new Error("hex string expected, got " + typeof hex2);
        const hl = hex2.length;
        const al = hl / 2;
        if (hl % 2)
          throw new Error("padded hex string expected, got unpadded hex of length " + hl);
        const array = new Uint8Array(al);
        for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
          const n1 = asciiToBase162(hex2.charCodeAt(hi));
          const n2 = asciiToBase162(hex2.charCodeAt(hi + 1));
          if (n1 === void 0 || n2 === void 0) {
            const char = hex2[hi] + hex2[hi + 1];
            throw new Error('hex string expected, got non-hex character "' + char + '" at index ' + hi);
          }
          array[ai] = n1 * 16 + n2;
        }
        return array;
      }
      function bytesToNumberBE(bytes2) {
        return hexToNumber2(bytesToHex3(bytes2));
      }
      function bytesToNumberLE(bytes2) {
        abytes2(bytes2);
        return hexToNumber2(bytesToHex3(Uint8Array.from(bytes2).reverse()));
      }
      function numberToBytesBE(n, len) {
        return hexToBytes2(n.toString(16).padStart(len * 2, "0"));
      }
      function numberToBytesLE(n, len) {
        return numberToBytesBE(n, len).reverse();
      }
      function numberToVarBytesBE(n) {
        return hexToBytes2(numberToHexUnpadded(n));
      }
      function ensureBytes(title, hex2, expectedLength) {
        let res;
        if (typeof hex2 === "string") {
          try {
            res = hexToBytes2(hex2);
          } catch (e) {
            throw new Error(`${title} must be valid hex string, got "${hex2}". Cause: ${e}`);
          }
        } else if (isBytes4(hex2)) {
          res = Uint8Array.from(hex2);
        } else {
          throw new Error(`${title} must be hex string or Uint8Array`);
        }
        const len = res.length;
        if (typeof expectedLength === "number" && len !== expectedLength)
          throw new Error(`${title} expected ${expectedLength} bytes, got ${len}`);
        return res;
      }
      function concatBytes(...arrays) {
        let sum = 0;
        for (let i = 0; i < arrays.length; i++) {
          const a = arrays[i];
          abytes2(a);
          sum += a.length;
        }
        const res = new Uint8Array(sum);
        for (let i = 0, pad = 0; i < arrays.length; i++) {
          const a = arrays[i];
          res.set(a, pad);
          pad += a.length;
        }
        return res;
      }
      function equalBytes(a, b) {
        if (a.length !== b.length)
          return false;
        let diff = 0;
        for (let i = 0; i < a.length; i++)
          diff |= a[i] ^ b[i];
        return diff === 0;
      }
      function utf8ToBytes2(str) {
        if (typeof str !== "string")
          throw new Error(`utf8ToBytes expected string, got ${typeof str}`);
        return new Uint8Array(new TextEncoder().encode(str));
      }
      var isPosBig = (n) => typeof n === "bigint" && _0n <= n;
      function inRange(n, min, max) {
        return isPosBig(n) && isPosBig(min) && isPosBig(max) && min <= n && n < max;
      }
      function aInRange(title, n, min, max) {
        if (!inRange(n, min, max))
          throw new Error(`expected valid ${title}: ${min} <= n < ${max}, got ${typeof n} ${n}`);
      }
      function bitLen(n) {
        let len;
        for (len = 0; n > _0n; n >>= _1n, len += 1)
          ;
        return len;
      }
      function bitGet(n, pos) {
        return n >> BigInt(pos) & _1n;
      }
      function bitSet(n, pos, value) {
        return n | (value ? _1n : _0n) << BigInt(pos);
      }
      var bitMask = (n) => (_2n << BigInt(n - 1)) - _1n;
      exports.bitMask = bitMask;
      var u8n = (data) => new Uint8Array(data);
      var u8fr = (arr) => Uint8Array.from(arr);
      function createHmacDrbg(hashLen, qByteLen, hmacFn) {
        if (typeof hashLen !== "number" || hashLen < 2)
          throw new Error("hashLen must be a number");
        if (typeof qByteLen !== "number" || qByteLen < 2)
          throw new Error("qByteLen must be a number");
        if (typeof hmacFn !== "function")
          throw new Error("hmacFn must be a function");
        let v = u8n(hashLen);
        let k = u8n(hashLen);
        let i = 0;
        const reset = () => {
          v.fill(1);
          k.fill(0);
          i = 0;
        };
        const h = (...b) => hmacFn(k, v, ...b);
        const reseed = (seed = u8n()) => {
          k = h(u8fr([0]), seed);
          v = h();
          if (seed.length === 0)
            return;
          k = h(u8fr([1]), seed);
          v = h();
        };
        const gen = () => {
          if (i++ >= 1e3)
            throw new Error("drbg: tried 1000 values");
          let len = 0;
          const out = [];
          while (len < qByteLen) {
            v = h();
            const sl = v.slice();
            out.push(sl);
            len += v.length;
          }
          return concatBytes(...out);
        };
        const genUntil = (seed, pred) => {
          reset();
          reseed(seed);
          let res = void 0;
          while (!(res = pred(gen())))
            reseed();
          reset();
          return res;
        };
        return genUntil;
      }
      var validatorFns = {
        bigint: (val) => typeof val === "bigint",
        function: (val) => typeof val === "function",
        boolean: (val) => typeof val === "boolean",
        string: (val) => typeof val === "string",
        stringOrUint8Array: (val) => typeof val === "string" || isBytes4(val),
        isSafeInteger: (val) => Number.isSafeInteger(val),
        array: (val) => Array.isArray(val),
        field: (val, object) => object.Fp.isValid(val),
        hash: (val) => typeof val === "function" && Number.isSafeInteger(val.outputLen)
      };
      function validateObject(object, validators, optValidators = {}) {
        const checkField = (fieldName, type, isOptional) => {
          const checkVal = validatorFns[type];
          if (typeof checkVal !== "function")
            throw new Error(`Invalid validator "${type}", expected function`);
          const val = object[fieldName];
          if (isOptional && val === void 0)
            return;
          if (!checkVal(val, object)) {
            throw new Error(`Invalid param ${String(fieldName)}=${val} (${typeof val}), expected ${type}`);
          }
        };
        for (const [fieldName, type] of Object.entries(validators))
          checkField(fieldName, type, false);
        for (const [fieldName, type] of Object.entries(optValidators))
          checkField(fieldName, type, true);
        return object;
      }
      var notImplemented = () => {
        throw new Error("not implemented");
      };
      exports.notImplemented = notImplemented;
      function memoized(fn) {
        const map = /* @__PURE__ */ new WeakMap();
        return (arg, ...args) => {
          const val = map.get(arg);
          if (val !== void 0)
            return val;
          const computed = fn(arg, ...args);
          map.set(arg, computed);
          return computed;
        };
      }
    }
  });

  // ../../../@noble/curves/abstract/modular.js
  var require_modular = __commonJS({
    "../../../@noble/curves/abstract/modular.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.isNegativeLE = void 0;
      exports.mod = mod;
      exports.pow = pow;
      exports.pow2 = pow2;
      exports.invert = invert;
      exports.tonelliShanks = tonelliShanks;
      exports.FpSqrt = FpSqrt;
      exports.validateField = validateField;
      exports.FpPow = FpPow;
      exports.FpInvertBatch = FpInvertBatch;
      exports.FpDiv = FpDiv;
      exports.FpLegendre = FpLegendre;
      exports.FpIsSquare = FpIsSquare;
      exports.nLength = nLength;
      exports.Field = Field;
      exports.FpSqrtOdd = FpSqrtOdd;
      exports.FpSqrtEven = FpSqrtEven;
      exports.hashToPrivateScalar = hashToPrivateScalar;
      exports.getFieldBytesLength = getFieldBytesLength;
      exports.getMinHashLength = getMinHashLength;
      exports.mapHashToField = mapHashToField;
      var utils_js_1 = require_utils2();
      var _0n = BigInt(0);
      var _1n = BigInt(1);
      var _2n = BigInt(2);
      var _3n = BigInt(3);
      var _4n = BigInt(4);
      var _5n = BigInt(5);
      var _8n = BigInt(8);
      var _9n = BigInt(9);
      var _16n = BigInt(16);
      function mod(a, b) {
        const result = a % b;
        return result >= _0n ? result : b + result;
      }
      function pow(num, power, modulo) {
        if (modulo <= _0n || power < _0n)
          throw new Error("Expected power/modulo > 0");
        if (modulo === _1n)
          return _0n;
        let res = _1n;
        while (power > _0n) {
          if (power & _1n)
            res = res * num % modulo;
          num = num * num % modulo;
          power >>= _1n;
        }
        return res;
      }
      function pow2(x, power, modulo) {
        let res = x;
        while (power-- > _0n) {
          res *= res;
          res %= modulo;
        }
        return res;
      }
      function invert(number2, modulo) {
        if (number2 === _0n || modulo <= _0n) {
          throw new Error(`invert: expected positive integers, got n=${number2} mod=${modulo}`);
        }
        let a = mod(number2, modulo);
        let b = modulo;
        let x = _0n, y = _1n, u = _1n, v = _0n;
        while (a !== _0n) {
          const q = b / a;
          const r = b % a;
          const m = x - u * q;
          const n = y - v * q;
          b = a, a = r, x = u, y = v, u = m, v = n;
        }
        const gcd2 = b;
        if (gcd2 !== _1n)
          throw new Error("invert: does not exist");
        return mod(x, modulo);
      }
      function tonelliShanks(P) {
        const legendreC = (P - _1n) / _2n;
        let Q, S, Z;
        for (Q = P - _1n, S = 0; Q % _2n === _0n; Q /= _2n, S++)
          ;
        for (Z = _2n; Z < P && pow(Z, legendreC, P) !== P - _1n; Z++)
          ;
        if (S === 1) {
          const p1div4 = (P + _1n) / _4n;
          return function tonelliFast(Fp, n) {
            const root = Fp.pow(n, p1div4);
            if (!Fp.eql(Fp.sqr(root), n))
              throw new Error("Cannot find square root");
            return root;
          };
        }
        const Q1div2 = (Q + _1n) / _2n;
        return function tonelliSlow(Fp, n) {
          if (Fp.pow(n, legendreC) === Fp.neg(Fp.ONE))
            throw new Error("Cannot find square root");
          let r = S;
          let g = Fp.pow(Fp.mul(Fp.ONE, Z), Q);
          let x = Fp.pow(n, Q1div2);
          let b = Fp.pow(n, Q);
          while (!Fp.eql(b, Fp.ONE)) {
            if (Fp.eql(b, Fp.ZERO))
              return Fp.ZERO;
            let m = 1;
            for (let t2 = Fp.sqr(b); m < r; m++) {
              if (Fp.eql(t2, Fp.ONE))
                break;
              t2 = Fp.sqr(t2);
            }
            const ge = Fp.pow(g, _1n << BigInt(r - m - 1));
            g = Fp.sqr(ge);
            x = Fp.mul(x, ge);
            b = Fp.mul(b, g);
            r = m;
          }
          return x;
        };
      }
      function FpSqrt(P) {
        if (P % _4n === _3n) {
          const p1div4 = (P + _1n) / _4n;
          return function sqrt3mod4(Fp, n) {
            const root = Fp.pow(n, p1div4);
            if (!Fp.eql(Fp.sqr(root), n))
              throw new Error("Cannot find square root");
            return root;
          };
        }
        if (P % _8n === _5n) {
          const c1 = (P - _5n) / _8n;
          return function sqrt5mod8(Fp, n) {
            const n2 = Fp.mul(n, _2n);
            const v = Fp.pow(n2, c1);
            const nv = Fp.mul(n, v);
            const i = Fp.mul(Fp.mul(nv, _2n), v);
            const root = Fp.mul(nv, Fp.sub(i, Fp.ONE));
            if (!Fp.eql(Fp.sqr(root), n))
              throw new Error("Cannot find square root");
            return root;
          };
        }
        if (P % _16n === _9n) {
        }
        return tonelliShanks(P);
      }
      var isNegativeLE = (num, modulo) => (mod(num, modulo) & _1n) === _1n;
      exports.isNegativeLE = isNegativeLE;
      var FIELD_FIELDS = [
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
      function validateField(field) {
        const initial = {
          ORDER: "bigint",
          MASK: "bigint",
          BYTES: "isSafeInteger",
          BITS: "isSafeInteger"
        };
        const opts = FIELD_FIELDS.reduce((map, val) => {
          map[val] = "function";
          return map;
        }, initial);
        return (0, utils_js_1.validateObject)(field, opts);
      }
      function FpPow(f, num, power) {
        if (power < _0n)
          throw new Error("Expected power > 0");
        if (power === _0n)
          return f.ONE;
        if (power === _1n)
          return num;
        let p = f.ONE;
        let d = num;
        while (power > _0n) {
          if (power & _1n)
            p = f.mul(p, d);
          d = f.sqr(d);
          power >>= _1n;
        }
        return p;
      }
      function FpInvertBatch(f, nums) {
        const tmp = new Array(nums.length);
        const lastMultiplied = nums.reduce((acc, num, i) => {
          if (f.is0(num))
            return acc;
          tmp[i] = acc;
          return f.mul(acc, num);
        }, f.ONE);
        const inverted = f.inv(lastMultiplied);
        nums.reduceRight((acc, num, i) => {
          if (f.is0(num))
            return acc;
          tmp[i] = f.mul(acc, tmp[i]);
          return f.mul(acc, num);
        }, inverted);
        return tmp;
      }
      function FpDiv(f, lhs, rhs) {
        return f.mul(lhs, typeof rhs === "bigint" ? invert(rhs, f.ORDER) : f.inv(rhs));
      }
      function FpLegendre(order) {
        const legendreConst = (order - _1n) / _2n;
        return (f, x) => f.pow(x, legendreConst);
      }
      function FpIsSquare(f) {
        const legendre = FpLegendre(f.ORDER);
        return (x) => {
          const p = legendre(f, x);
          return f.eql(p, f.ZERO) || f.eql(p, f.ONE);
        };
      }
      function nLength(n, nBitLength) {
        const _nBitLength = nBitLength !== void 0 ? nBitLength : n.toString(2).length;
        const nByteLength = Math.ceil(_nBitLength / 8);
        return { nBitLength: _nBitLength, nByteLength };
      }
      function Field(ORDER, bitLen, isLE2 = false, redef = {}) {
        if (ORDER <= _0n)
          throw new Error(`Expected Field ORDER > 0, got ${ORDER}`);
        const { nBitLength: BITS, nByteLength: BYTES } = nLength(ORDER, bitLen);
        if (BYTES > 2048)
          throw new Error("Field lengths over 2048 bytes are not supported");
        const sqrtP = FpSqrt(ORDER);
        const f = Object.freeze({
          ORDER,
          BITS,
          BYTES,
          MASK: (0, utils_js_1.bitMask)(BITS),
          ZERO: _0n,
          ONE: _1n,
          create: (num) => mod(num, ORDER),
          isValid: (num) => {
            if (typeof num !== "bigint")
              throw new Error(`Invalid field element: expected bigint, got ${typeof num}`);
            return _0n <= num && num < ORDER;
          },
          is0: (num) => num === _0n,
          isOdd: (num) => (num & _1n) === _1n,
          neg: (num) => mod(-num, ORDER),
          eql: (lhs, rhs) => lhs === rhs,
          sqr: (num) => mod(num * num, ORDER),
          add: (lhs, rhs) => mod(lhs + rhs, ORDER),
          sub: (lhs, rhs) => mod(lhs - rhs, ORDER),
          mul: (lhs, rhs) => mod(lhs * rhs, ORDER),
          pow: (num, power) => FpPow(f, num, power),
          div: (lhs, rhs) => mod(lhs * invert(rhs, ORDER), ORDER),
          // Same as above, but doesn't normalize
          sqrN: (num) => num * num,
          addN: (lhs, rhs) => lhs + rhs,
          subN: (lhs, rhs) => lhs - rhs,
          mulN: (lhs, rhs) => lhs * rhs,
          inv: (num) => invert(num, ORDER),
          sqrt: redef.sqrt || ((n) => sqrtP(f, n)),
          invertBatch: (lst) => FpInvertBatch(f, lst),
          // TODO: do we really need constant cmov?
          // We don't have const-time bigints anyway, so probably will be not very useful
          cmov: (a, b, c) => c ? b : a,
          toBytes: (num) => isLE2 ? (0, utils_js_1.numberToBytesLE)(num, BYTES) : (0, utils_js_1.numberToBytesBE)(num, BYTES),
          fromBytes: (bytes2) => {
            if (bytes2.length !== BYTES)
              throw new Error(`Fp.fromBytes: expected ${BYTES}, got ${bytes2.length}`);
            return isLE2 ? (0, utils_js_1.bytesToNumberLE)(bytes2) : (0, utils_js_1.bytesToNumberBE)(bytes2);
          }
        });
        return Object.freeze(f);
      }
      function FpSqrtOdd(Fp, elm) {
        if (!Fp.isOdd)
          throw new Error(`Field doesn't have isOdd`);
        const root = Fp.sqrt(elm);
        return Fp.isOdd(root) ? root : Fp.neg(root);
      }
      function FpSqrtEven(Fp, elm) {
        if (!Fp.isOdd)
          throw new Error(`Field doesn't have isOdd`);
        const root = Fp.sqrt(elm);
        return Fp.isOdd(root) ? Fp.neg(root) : root;
      }
      function hashToPrivateScalar(hash, groupOrder, isLE2 = false) {
        hash = (0, utils_js_1.ensureBytes)("privateHash", hash);
        const hashLen = hash.length;
        const minLen = nLength(groupOrder).nByteLength + 8;
        if (minLen < 24 || hashLen < minLen || hashLen > 1024)
          throw new Error(`hashToPrivateScalar: expected ${minLen}-1024 bytes of input, got ${hashLen}`);
        const num = isLE2 ? (0, utils_js_1.bytesToNumberLE)(hash) : (0, utils_js_1.bytesToNumberBE)(hash);
        return mod(num, groupOrder - _1n) + _1n;
      }
      function getFieldBytesLength(fieldOrder) {
        if (typeof fieldOrder !== "bigint")
          throw new Error("field order must be bigint");
        const bitLength = fieldOrder.toString(2).length;
        return Math.ceil(bitLength / 8);
      }
      function getMinHashLength(fieldOrder) {
        const length = getFieldBytesLength(fieldOrder);
        return length + Math.ceil(length / 2);
      }
      function mapHashToField(key, fieldOrder, isLE2 = false) {
        const len = key.length;
        const fieldLen = getFieldBytesLength(fieldOrder);
        const minLen = getMinHashLength(fieldOrder);
        if (len < 16 || len < minLen || len > 1024)
          throw new Error(`expected ${minLen}-1024 bytes of input, got ${len}`);
        const num = isLE2 ? (0, utils_js_1.bytesToNumberBE)(key) : (0, utils_js_1.bytesToNumberLE)(key);
        const reduced = mod(num, fieldOrder - _1n) + _1n;
        return isLE2 ? (0, utils_js_1.numberToBytesLE)(reduced, fieldLen) : (0, utils_js_1.numberToBytesBE)(reduced, fieldLen);
      }
    }
  });

  // ../../../@noble/curves/abstract/curve.js
  var require_curve = __commonJS({
    "../../../@noble/curves/abstract/curve.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.wNAF = wNAF;
      exports.pippenger = pippenger;
      exports.validateBasic = validateBasic;
      var modular_js_1 = require_modular();
      var utils_js_1 = require_utils2();
      var _0n = BigInt(0);
      var _1n = BigInt(1);
      var pointPrecomputes = /* @__PURE__ */ new WeakMap();
      var pointWindowSizes = /* @__PURE__ */ new WeakMap();
      function wNAF(c, bits) {
        const constTimeNegate = (condition, item) => {
          const neg = item.negate();
          return condition ? neg : item;
        };
        const validateW = (W) => {
          if (!Number.isSafeInteger(W) || W <= 0 || W > bits)
            throw new Error(`Wrong window size=${W}, should be [1..${bits}]`);
        };
        const opts = (W) => {
          validateW(W);
          const windows = Math.ceil(bits / W) + 1;
          const windowSize = 2 ** (W - 1);
          return { windows, windowSize };
        };
        return {
          constTimeNegate,
          // non-const time multiplication ladder
          unsafeLadder(elm, n) {
            let p = c.ZERO;
            let d = elm;
            while (n > _0n) {
              if (n & _1n)
                p = p.add(d);
              d = d.double();
              n >>= _1n;
            }
            return p;
          },
          /**
           * Creates a wNAF precomputation window. Used for caching.
           * Default window size is set by `utils.precompute()` and is equal to 8.
           * Number of precomputed points depends on the curve size:
           * 2^(𝑊−1) * (Math.ceil(𝑛 / 𝑊) + 1), where:
           * - 𝑊 is the window size
           * - 𝑛 is the bitlength of the curve order.
           * For a 256-bit curve and window size 8, the number of precomputed points is 128 * 33 = 4224.
           * @returns precomputed point tables flattened to a single array
           */
          precomputeWindow(elm, W) {
            const { windows, windowSize } = opts(W);
            const points = [];
            let p = elm;
            let base = p;
            for (let window = 0; window < windows; window++) {
              base = p;
              points.push(base);
              for (let i = 1; i < windowSize; i++) {
                base = base.add(p);
                points.push(base);
              }
              p = base.double();
            }
            return points;
          },
          /**
           * Implements ec multiplication using precomputed tables and w-ary non-adjacent form.
           * @param W window size
           * @param precomputes precomputed tables
           * @param n scalar (we don't check here, but should be less than curve order)
           * @returns real and fake (for const-time) points
           */
          wNAF(W, precomputes, n) {
            const { windows, windowSize } = opts(W);
            let p = c.ZERO;
            let f = c.BASE;
            const mask = BigInt(2 ** W - 1);
            const maxNumber = 2 ** W;
            const shiftBy = BigInt(W);
            for (let window = 0; window < windows; window++) {
              const offset = window * windowSize;
              let wbits = Number(n & mask);
              n >>= shiftBy;
              if (wbits > windowSize) {
                wbits -= maxNumber;
                n += _1n;
              }
              const offset1 = offset;
              const offset2 = offset + Math.abs(wbits) - 1;
              const cond1 = window % 2 !== 0;
              const cond2 = wbits < 0;
              if (wbits === 0) {
                f = f.add(constTimeNegate(cond1, precomputes[offset1]));
              } else {
                p = p.add(constTimeNegate(cond2, precomputes[offset2]));
              }
            }
            return { p, f };
          },
          wNAFCached(P, n, transform) {
            const W = pointWindowSizes.get(P) || 1;
            let comp = pointPrecomputes.get(P);
            if (!comp) {
              comp = this.precomputeWindow(P, W);
              if (W !== 1)
                pointPrecomputes.set(P, transform(comp));
            }
            return this.wNAF(W, comp, n);
          },
          // We calculate precomputes for elliptic curve point multiplication
          // using windowed method. This specifies window size and
          // stores precomputed values. Usually only base point would be precomputed.
          setWindowSize(P, W) {
            validateW(W);
            pointWindowSizes.set(P, W);
            pointPrecomputes.delete(P);
          }
        };
      }
      function pippenger(c, field, points, scalars) {
        if (!Array.isArray(points) || !Array.isArray(scalars) || scalars.length !== points.length)
          throw new Error("arrays of points and scalars must have equal length");
        scalars.forEach((s, i) => {
          if (!field.isValid(s))
            throw new Error(`wrong scalar at index ${i}`);
        });
        points.forEach((p, i) => {
          if (!(p instanceof c))
            throw new Error(`wrong point at index ${i}`);
        });
        const wbits = (0, utils_js_1.bitLen)(BigInt(points.length));
        const windowSize = wbits > 12 ? wbits - 3 : wbits > 4 ? wbits - 2 : wbits ? 2 : 1;
        const MASK = (1 << windowSize) - 1;
        const buckets = new Array(MASK + 1).fill(c.ZERO);
        const lastBits = Math.floor((field.BITS - 1) / windowSize) * windowSize;
        let sum = c.ZERO;
        for (let i = lastBits; i >= 0; i -= windowSize) {
          buckets.fill(c.ZERO);
          for (let j = 0; j < scalars.length; j++) {
            const scalar = scalars[j];
            const wbits2 = Number(scalar >> BigInt(i) & BigInt(MASK));
            buckets[wbits2] = buckets[wbits2].add(points[j]);
          }
          let resI = c.ZERO;
          for (let j = buckets.length - 1, sumI = c.ZERO; j > 0; j--) {
            sumI = sumI.add(buckets[j]);
            resI = resI.add(sumI);
          }
          sum = sum.add(resI);
          if (i !== 0)
            for (let j = 0; j < windowSize; j++)
              sum = sum.double();
        }
        return sum;
      }
      function validateBasic(curve) {
        (0, modular_js_1.validateField)(curve.Fp);
        (0, utils_js_1.validateObject)(curve, {
          n: "bigint",
          h: "bigint",
          Gx: "field",
          Gy: "field"
        }, {
          nBitLength: "isSafeInteger",
          nByteLength: "isSafeInteger"
        });
        return Object.freeze({
          ...(0, modular_js_1.nLength)(curve.n, curve.nBitLength),
          ...curve,
          ...{ p: curve.Fp.ORDER }
        });
      }
    }
  });

  // ../../../@noble/curves/abstract/weierstrass.js
  var require_weierstrass = __commonJS({
    "../../../@noble/curves/abstract/weierstrass.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.DER = void 0;
      exports.weierstrassPoints = weierstrassPoints;
      exports.weierstrass = weierstrass;
      exports.SWUFpSqrtRatio = SWUFpSqrtRatio;
      exports.mapToCurveSimpleSWU = mapToCurveSimpleSWU;
      var curve_js_1 = require_curve();
      var mod = require_modular();
      var ut = require_utils2();
      var utils_js_1 = require_utils2();
      function validateSigVerOpts(opts) {
        if (opts.lowS !== void 0)
          (0, utils_js_1.abool)("lowS", opts.lowS);
        if (opts.prehash !== void 0)
          (0, utils_js_1.abool)("prehash", opts.prehash);
      }
      function validatePointOpts(curve) {
        const opts = (0, curve_js_1.validateBasic)(curve);
        ut.validateObject(opts, {
          a: "field",
          b: "field"
        }, {
          allowedPrivateKeyLengths: "array",
          wrapPrivateKey: "boolean",
          isTorsionFree: "function",
          clearCofactor: "function",
          allowInfinityPoint: "boolean",
          fromBytes: "function",
          toBytes: "function"
        });
        const { endo, Fp, a } = opts;
        if (endo) {
          if (!Fp.eql(a, Fp.ZERO)) {
            throw new Error("Endomorphism can only be defined for Koblitz curves that have a=0");
          }
          if (typeof endo !== "object" || typeof endo.beta !== "bigint" || typeof endo.splitScalar !== "function") {
            throw new Error("Expected endomorphism with beta: bigint and splitScalar: function");
          }
        }
        return Object.freeze({ ...opts });
      }
      var { bytesToNumberBE: b2n, hexToBytes: h2b } = ut;
      exports.DER = {
        // asn.1 DER encoding utils
        Err: class DERErr extends Error {
          constructor(m = "") {
            super(m);
          }
        },
        // Basic building block is TLV (Tag-Length-Value)
        _tlv: {
          encode: (tag, data) => {
            const { Err: E } = exports.DER;
            if (tag < 0 || tag > 256)
              throw new E("tlv.encode: wrong tag");
            if (data.length & 1)
              throw new E("tlv.encode: unpadded data");
            const dataLen = data.length / 2;
            const len = ut.numberToHexUnpadded(dataLen);
            if (len.length / 2 & 128)
              throw new E("tlv.encode: long form length too big");
            const lenLen = dataLen > 127 ? ut.numberToHexUnpadded(len.length / 2 | 128) : "";
            return `${ut.numberToHexUnpadded(tag)}${lenLen}${len}${data}`;
          },
          // v - value, l - left bytes (unparsed)
          decode(tag, data) {
            const { Err: E } = exports.DER;
            let pos = 0;
            if (tag < 0 || tag > 256)
              throw new E("tlv.encode: wrong tag");
            if (data.length < 2 || data[pos++] !== tag)
              throw new E("tlv.decode: wrong tlv");
            const first = data[pos++];
            const isLong = !!(first & 128);
            let length = 0;
            if (!isLong)
              length = first;
            else {
              const lenLen = first & 127;
              if (!lenLen)
                throw new E("tlv.decode(long): indefinite length not supported");
              if (lenLen > 4)
                throw new E("tlv.decode(long): byte length is too big");
              const lengthBytes = data.subarray(pos, pos + lenLen);
              if (lengthBytes.length !== lenLen)
                throw new E("tlv.decode: length bytes not complete");
              if (lengthBytes[0] === 0)
                throw new E("tlv.decode(long): zero leftmost byte");
              for (const b of lengthBytes)
                length = length << 8 | b;
              pos += lenLen;
              if (length < 128)
                throw new E("tlv.decode(long): not minimal encoding");
            }
            const v = data.subarray(pos, pos + length);
            if (v.length !== length)
              throw new E("tlv.decode: wrong value length");
            return { v, l: data.subarray(pos + length) };
          }
        },
        // https://crypto.stackexchange.com/a/57734 Leftmost bit of first byte is 'negative' flag,
        // since we always use positive integers here. It must always be empty:
        // - add zero byte if exists
        // - if next byte doesn't have a flag, leading zero is not allowed (minimal encoding)
        _int: {
          encode(num) {
            const { Err: E } = exports.DER;
            if (num < _0n)
              throw new E("integer: negative integers are not allowed");
            let hex2 = ut.numberToHexUnpadded(num);
            if (Number.parseInt(hex2[0], 16) & 8)
              hex2 = "00" + hex2;
            if (hex2.length & 1)
              throw new E("unexpected assertion");
            return hex2;
          },
          decode(data) {
            const { Err: E } = exports.DER;
            if (data[0] & 128)
              throw new E("Invalid signature integer: negative");
            if (data[0] === 0 && !(data[1] & 128))
              throw new E("Invalid signature integer: unnecessary leading zero");
            return b2n(data);
          }
        },
        toSig(hex2) {
          const { Err: E, _int: int, _tlv: tlv } = exports.DER;
          const data = typeof hex2 === "string" ? h2b(hex2) : hex2;
          ut.abytes(data);
          const { v: seqBytes, l: seqLeftBytes } = tlv.decode(48, data);
          if (seqLeftBytes.length)
            throw new E("Invalid signature: left bytes after parsing");
          const { v: rBytes, l: rLeftBytes } = tlv.decode(2, seqBytes);
          const { v: sBytes, l: sLeftBytes } = tlv.decode(2, rLeftBytes);
          if (sLeftBytes.length)
            throw new E("Invalid signature: left bytes after parsing");
          return { r: int.decode(rBytes), s: int.decode(sBytes) };
        },
        hexFromSig(sig) {
          const { _tlv: tlv, _int: int } = exports.DER;
          const seq = `${tlv.encode(2, int.encode(sig.r))}${tlv.encode(2, int.encode(sig.s))}`;
          return tlv.encode(48, seq);
        }
      };
      var _0n = BigInt(0);
      var _1n = BigInt(1);
      var _2n = BigInt(2);
      var _3n = BigInt(3);
      var _4n = BigInt(4);
      function weierstrassPoints(opts) {
        const CURVE = validatePointOpts(opts);
        const { Fp } = CURVE;
        const Fn = mod.Field(CURVE.n, CURVE.nBitLength);
        const toBytes2 = CURVE.toBytes || ((_c, point, _isCompressed) => {
          const a = point.toAffine();
          return ut.concatBytes(Uint8Array.from([4]), Fp.toBytes(a.x), Fp.toBytes(a.y));
        });
        const fromBytes = CURVE.fromBytes || ((bytes2) => {
          const tail = bytes2.subarray(1);
          const x = Fp.fromBytes(tail.subarray(0, Fp.BYTES));
          const y = Fp.fromBytes(tail.subarray(Fp.BYTES, 2 * Fp.BYTES));
          return { x, y };
        });
        function weierstrassEquation(x) {
          const { a, b } = CURVE;
          const x2 = Fp.sqr(x);
          const x3 = Fp.mul(x2, x);
          return Fp.add(Fp.add(x3, Fp.mul(x, a)), b);
        }
        if (!Fp.eql(Fp.sqr(CURVE.Gy), weierstrassEquation(CURVE.Gx)))
          throw new Error("bad generator point: equation left != right");
        function isWithinCurveOrder(num) {
          return ut.inRange(num, _1n, CURVE.n);
        }
        function normPrivateKeyToScalar(key) {
          const { allowedPrivateKeyLengths: lengths, nByteLength, wrapPrivateKey, n: N } = CURVE;
          if (lengths && typeof key !== "bigint") {
            if (ut.isBytes(key))
              key = ut.bytesToHex(key);
            if (typeof key !== "string" || !lengths.includes(key.length))
              throw new Error("Invalid key");
            key = key.padStart(nByteLength * 2, "0");
          }
          let num;
          try {
            num = typeof key === "bigint" ? key : ut.bytesToNumberBE((0, utils_js_1.ensureBytes)("private key", key, nByteLength));
          } catch (error) {
            throw new Error(`private key must be ${nByteLength} bytes, hex or bigint, not ${typeof key}`);
          }
          if (wrapPrivateKey)
            num = mod.mod(num, N);
          ut.aInRange("private key", num, _1n, N);
          return num;
        }
        function assertPrjPoint(other) {
          if (!(other instanceof Point))
            throw new Error("ProjectivePoint expected");
        }
        const toAffineMemo = (0, utils_js_1.memoized)((p, iz) => {
          const { px: x, py: y, pz: z } = p;
          if (Fp.eql(z, Fp.ONE))
            return { x, y };
          const is0 = p.is0();
          if (iz == null)
            iz = is0 ? Fp.ONE : Fp.inv(z);
          const ax = Fp.mul(x, iz);
          const ay = Fp.mul(y, iz);
          const zz = Fp.mul(z, iz);
          if (is0)
            return { x: Fp.ZERO, y: Fp.ZERO };
          if (!Fp.eql(zz, Fp.ONE))
            throw new Error("invZ was invalid");
          return { x: ax, y: ay };
        });
        const assertValidMemo = (0, utils_js_1.memoized)((p) => {
          if (p.is0()) {
            if (CURVE.allowInfinityPoint && !Fp.is0(p.py))
              return;
            throw new Error("bad point: ZERO");
          }
          const { x, y } = p.toAffine();
          if (!Fp.isValid(x) || !Fp.isValid(y))
            throw new Error("bad point: x or y not FE");
          const left = Fp.sqr(y);
          const right = weierstrassEquation(x);
          if (!Fp.eql(left, right))
            throw new Error("bad point: equation left != right");
          if (!p.isTorsionFree())
            throw new Error("bad point: not in prime-order subgroup");
          return true;
        });
        class Point {
          constructor(px, py, pz) {
            this.px = px;
            this.py = py;
            this.pz = pz;
            if (px == null || !Fp.isValid(px))
              throw new Error("x required");
            if (py == null || !Fp.isValid(py))
              throw new Error("y required");
            if (pz == null || !Fp.isValid(pz))
              throw new Error("z required");
            Object.freeze(this);
          }
          // Does not validate if the point is on-curve.
          // Use fromHex instead, or call assertValidity() later.
          static fromAffine(p) {
            const { x, y } = p || {};
            if (!p || !Fp.isValid(x) || !Fp.isValid(y))
              throw new Error("invalid affine point");
            if (p instanceof Point)
              throw new Error("projective point not allowed");
            const is0 = (i) => Fp.eql(i, Fp.ZERO);
            if (is0(x) && is0(y))
              return Point.ZERO;
            return new Point(x, y, Fp.ONE);
          }
          get x() {
            return this.toAffine().x;
          }
          get y() {
            return this.toAffine().y;
          }
          /**
           * Takes a bunch of Projective Points but executes only one
           * inversion on all of them. Inversion is very slow operation,
           * so this improves performance massively.
           * Optimization: converts a list of projective points to a list of identical points with Z=1.
           */
          static normalizeZ(points) {
            const toInv = Fp.invertBatch(points.map((p) => p.pz));
            return points.map((p, i) => p.toAffine(toInv[i])).map(Point.fromAffine);
          }
          /**
           * Converts hash string or Uint8Array to Point.
           * @param hex short/long ECDSA hex
           */
          static fromHex(hex2) {
            const P = Point.fromAffine(fromBytes((0, utils_js_1.ensureBytes)("pointHex", hex2)));
            P.assertValidity();
            return P;
          }
          // Multiplies generator point by privateKey.
          static fromPrivateKey(privateKey) {
            return Point.BASE.multiply(normPrivateKeyToScalar(privateKey));
          }
          // Multiscalar Multiplication
          static msm(points, scalars) {
            return (0, curve_js_1.pippenger)(Point, Fn, points, scalars);
          }
          // "Private method", don't use it directly
          _setWindowSize(windowSize) {
            wnaf.setWindowSize(this, windowSize);
          }
          // A point on curve is valid if it conforms to equation.
          assertValidity() {
            assertValidMemo(this);
          }
          hasEvenY() {
            const { y } = this.toAffine();
            if (Fp.isOdd)
              return !Fp.isOdd(y);
            throw new Error("Field doesn't support isOdd");
          }
          /**
           * Compare one point to another.
           */
          equals(other) {
            assertPrjPoint(other);
            const { px: X1, py: Y1, pz: Z1 } = this;
            const { px: X2, py: Y2, pz: Z2 } = other;
            const U1 = Fp.eql(Fp.mul(X1, Z2), Fp.mul(X2, Z1));
            const U2 = Fp.eql(Fp.mul(Y1, Z2), Fp.mul(Y2, Z1));
            return U1 && U2;
          }
          /**
           * Flips point to one corresponding to (x, -y) in Affine coordinates.
           */
          negate() {
            return new Point(this.px, Fp.neg(this.py), this.pz);
          }
          // Renes-Costello-Batina exception-free doubling formula.
          // There is 30% faster Jacobian formula, but it is not complete.
          // https://eprint.iacr.org/2015/1060, algorithm 3
          // Cost: 8M + 3S + 3*a + 2*b3 + 15add.
          double() {
            const { a, b } = CURVE;
            const b3 = Fp.mul(b, _3n);
            const { px: X1, py: Y1, pz: Z1 } = this;
            let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO;
            let t0 = Fp.mul(X1, X1);
            let t1 = Fp.mul(Y1, Y1);
            let t2 = Fp.mul(Z1, Z1);
            let t3 = Fp.mul(X1, Y1);
            t3 = Fp.add(t3, t3);
            Z3 = Fp.mul(X1, Z1);
            Z3 = Fp.add(Z3, Z3);
            X3 = Fp.mul(a, Z3);
            Y3 = Fp.mul(b3, t2);
            Y3 = Fp.add(X3, Y3);
            X3 = Fp.sub(t1, Y3);
            Y3 = Fp.add(t1, Y3);
            Y3 = Fp.mul(X3, Y3);
            X3 = Fp.mul(t3, X3);
            Z3 = Fp.mul(b3, Z3);
            t2 = Fp.mul(a, t2);
            t3 = Fp.sub(t0, t2);
            t3 = Fp.mul(a, t3);
            t3 = Fp.add(t3, Z3);
            Z3 = Fp.add(t0, t0);
            t0 = Fp.add(Z3, t0);
            t0 = Fp.add(t0, t2);
            t0 = Fp.mul(t0, t3);
            Y3 = Fp.add(Y3, t0);
            t2 = Fp.mul(Y1, Z1);
            t2 = Fp.add(t2, t2);
            t0 = Fp.mul(t2, t3);
            X3 = Fp.sub(X3, t0);
            Z3 = Fp.mul(t2, t1);
            Z3 = Fp.add(Z3, Z3);
            Z3 = Fp.add(Z3, Z3);
            return new Point(X3, Y3, Z3);
          }
          // Renes-Costello-Batina exception-free addition formula.
          // There is 30% faster Jacobian formula, but it is not complete.
          // https://eprint.iacr.org/2015/1060, algorithm 1
          // Cost: 12M + 0S + 3*a + 3*b3 + 23add.
          add(other) {
            assertPrjPoint(other);
            const { px: X1, py: Y1, pz: Z1 } = this;
            const { px: X2, py: Y2, pz: Z2 } = other;
            let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO;
            const a = CURVE.a;
            const b3 = Fp.mul(CURVE.b, _3n);
            let t0 = Fp.mul(X1, X2);
            let t1 = Fp.mul(Y1, Y2);
            let t2 = Fp.mul(Z1, Z2);
            let t3 = Fp.add(X1, Y1);
            let t4 = Fp.add(X2, Y2);
            t3 = Fp.mul(t3, t4);
            t4 = Fp.add(t0, t1);
            t3 = Fp.sub(t3, t4);
            t4 = Fp.add(X1, Z1);
            let t5 = Fp.add(X2, Z2);
            t4 = Fp.mul(t4, t5);
            t5 = Fp.add(t0, t2);
            t4 = Fp.sub(t4, t5);
            t5 = Fp.add(Y1, Z1);
            X3 = Fp.add(Y2, Z2);
            t5 = Fp.mul(t5, X3);
            X3 = Fp.add(t1, t2);
            t5 = Fp.sub(t5, X3);
            Z3 = Fp.mul(a, t4);
            X3 = Fp.mul(b3, t2);
            Z3 = Fp.add(X3, Z3);
            X3 = Fp.sub(t1, Z3);
            Z3 = Fp.add(t1, Z3);
            Y3 = Fp.mul(X3, Z3);
            t1 = Fp.add(t0, t0);
            t1 = Fp.add(t1, t0);
            t2 = Fp.mul(a, t2);
            t4 = Fp.mul(b3, t4);
            t1 = Fp.add(t1, t2);
            t2 = Fp.sub(t0, t2);
            t2 = Fp.mul(a, t2);
            t4 = Fp.add(t4, t2);
            t0 = Fp.mul(t1, t4);
            Y3 = Fp.add(Y3, t0);
            t0 = Fp.mul(t5, t4);
            X3 = Fp.mul(t3, X3);
            X3 = Fp.sub(X3, t0);
            t0 = Fp.mul(t3, t1);
            Z3 = Fp.mul(t5, Z3);
            Z3 = Fp.add(Z3, t0);
            return new Point(X3, Y3, Z3);
          }
          subtract(other) {
            return this.add(other.negate());
          }
          is0() {
            return this.equals(Point.ZERO);
          }
          wNAF(n) {
            return wnaf.wNAFCached(this, n, Point.normalizeZ);
          }
          /**
           * Non-constant-time multiplication. Uses double-and-add algorithm.
           * It's faster, but should only be used when you don't care about
           * an exposed private key e.g. sig verification, which works over *public* keys.
           */
          multiplyUnsafe(sc) {
            ut.aInRange("scalar", sc, _0n, CURVE.n);
            const I = Point.ZERO;
            if (sc === _0n)
              return I;
            if (sc === _1n)
              return this;
            const { endo } = CURVE;
            if (!endo)
              return wnaf.unsafeLadder(this, sc);
            let { k1neg, k1, k2neg, k2 } = endo.splitScalar(sc);
            let k1p = I;
            let k2p = I;
            let d = this;
            while (k1 > _0n || k2 > _0n) {
              if (k1 & _1n)
                k1p = k1p.add(d);
              if (k2 & _1n)
                k2p = k2p.add(d);
              d = d.double();
              k1 >>= _1n;
              k2 >>= _1n;
            }
            if (k1neg)
              k1p = k1p.negate();
            if (k2neg)
              k2p = k2p.negate();
            k2p = new Point(Fp.mul(k2p.px, endo.beta), k2p.py, k2p.pz);
            return k1p.add(k2p);
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
          multiply(scalar) {
            const { endo, n: N } = CURVE;
            ut.aInRange("scalar", scalar, _1n, N);
            let point, fake;
            if (endo) {
              const { k1neg, k1, k2neg, k2 } = endo.splitScalar(scalar);
              let { p: k1p, f: f1p } = this.wNAF(k1);
              let { p: k2p, f: f2p } = this.wNAF(k2);
              k1p = wnaf.constTimeNegate(k1neg, k1p);
              k2p = wnaf.constTimeNegate(k2neg, k2p);
              k2p = new Point(Fp.mul(k2p.px, endo.beta), k2p.py, k2p.pz);
              point = k1p.add(k2p);
              fake = f1p.add(f2p);
            } else {
              const { p, f } = this.wNAF(scalar);
              point = p;
              fake = f;
            }
            return Point.normalizeZ([point, fake])[0];
          }
          /**
           * Efficiently calculate `aP + bQ`. Unsafe, can expose private key, if used incorrectly.
           * Not using Strauss-Shamir trick: precomputation tables are faster.
           * The trick could be useful if both P and Q are not G (not in our case).
           * @returns non-zero affine point
           */
          multiplyAndAddUnsafe(Q, a, b) {
            const G = Point.BASE;
            const mul = (P, a2) => a2 === _0n || a2 === _1n || !P.equals(G) ? P.multiplyUnsafe(a2) : P.multiply(a2);
            const sum = mul(this, a).add(mul(Q, b));
            return sum.is0() ? void 0 : sum;
          }
          // Converts Projective point to affine (x, y) coordinates.
          // Can accept precomputed Z^-1 - for example, from invertBatch.
          // (x, y, z) ∋ (x=x/z, y=y/z)
          toAffine(iz) {
            return toAffineMemo(this, iz);
          }
          isTorsionFree() {
            const { h: cofactor, isTorsionFree } = CURVE;
            if (cofactor === _1n)
              return true;
            if (isTorsionFree)
              return isTorsionFree(Point, this);
            throw new Error("isTorsionFree() has not been declared for the elliptic curve");
          }
          clearCofactor() {
            const { h: cofactor, clearCofactor } = CURVE;
            if (cofactor === _1n)
              return this;
            if (clearCofactor)
              return clearCofactor(Point, this);
            return this.multiplyUnsafe(CURVE.h);
          }
          toRawBytes(isCompressed = true) {
            (0, utils_js_1.abool)("isCompressed", isCompressed);
            this.assertValidity();
            return toBytes2(Point, this, isCompressed);
          }
          toHex(isCompressed = true) {
            (0, utils_js_1.abool)("isCompressed", isCompressed);
            return ut.bytesToHex(this.toRawBytes(isCompressed));
          }
        }
        Point.BASE = new Point(CURVE.Gx, CURVE.Gy, Fp.ONE);
        Point.ZERO = new Point(Fp.ZERO, Fp.ONE, Fp.ZERO);
        const _bits = CURVE.nBitLength;
        const wnaf = (0, curve_js_1.wNAF)(Point, CURVE.endo ? Math.ceil(_bits / 2) : _bits);
        return {
          CURVE,
          ProjectivePoint: Point,
          normPrivateKeyToScalar,
          weierstrassEquation,
          isWithinCurveOrder
        };
      }
      function validateOpts(curve) {
        const opts = (0, curve_js_1.validateBasic)(curve);
        ut.validateObject(opts, {
          hash: "hash",
          hmac: "function",
          randomBytes: "function"
        }, {
          bits2int: "function",
          bits2int_modN: "function",
          lowS: "boolean"
        });
        return Object.freeze({ lowS: true, ...opts });
      }
      function weierstrass(curveDef) {
        const CURVE = validateOpts(curveDef);
        const { Fp, n: CURVE_ORDER } = CURVE;
        const compressedLen = Fp.BYTES + 1;
        const uncompressedLen = 2 * Fp.BYTES + 1;
        function modN(a) {
          return mod.mod(a, CURVE_ORDER);
        }
        function invN(a) {
          return mod.invert(a, CURVE_ORDER);
        }
        const { ProjectivePoint: Point, normPrivateKeyToScalar, weierstrassEquation, isWithinCurveOrder } = weierstrassPoints({
          ...CURVE,
          toBytes(_c, point, isCompressed) {
            const a = point.toAffine();
            const x = Fp.toBytes(a.x);
            const cat = ut.concatBytes;
            (0, utils_js_1.abool)("isCompressed", isCompressed);
            if (isCompressed) {
              return cat(Uint8Array.from([point.hasEvenY() ? 2 : 3]), x);
            } else {
              return cat(Uint8Array.from([4]), x, Fp.toBytes(a.y));
            }
          },
          fromBytes(bytes2) {
            const len = bytes2.length;
            const head = bytes2[0];
            const tail = bytes2.subarray(1);
            if (len === compressedLen && (head === 2 || head === 3)) {
              const x = ut.bytesToNumberBE(tail);
              if (!ut.inRange(x, _1n, Fp.ORDER))
                throw new Error("Point is not on curve");
              const y2 = weierstrassEquation(x);
              let y;
              try {
                y = Fp.sqrt(y2);
              } catch (sqrtError) {
                const suffix = sqrtError instanceof Error ? ": " + sqrtError.message : "";
                throw new Error("Point is not on curve" + suffix);
              }
              const isYOdd = (y & _1n) === _1n;
              const isHeadOdd = (head & 1) === 1;
              if (isHeadOdd !== isYOdd)
                y = Fp.neg(y);
              return { x, y };
            } else if (len === uncompressedLen && head === 4) {
              const x = Fp.fromBytes(tail.subarray(0, Fp.BYTES));
              const y = Fp.fromBytes(tail.subarray(Fp.BYTES, 2 * Fp.BYTES));
              return { x, y };
            } else {
              throw new Error(`Point of length ${len} was invalid. Expected ${compressedLen} compressed bytes or ${uncompressedLen} uncompressed bytes`);
            }
          }
        });
        const numToNByteStr = (num) => ut.bytesToHex(ut.numberToBytesBE(num, CURVE.nByteLength));
        function isBiggerThanHalfOrder(number2) {
          const HALF = CURVE_ORDER >> _1n;
          return number2 > HALF;
        }
        function normalizeS(s) {
          return isBiggerThanHalfOrder(s) ? modN(-s) : s;
        }
        const slcNum = (b, from, to) => ut.bytesToNumberBE(b.slice(from, to));
        class Signature {
          constructor(r, s, recovery) {
            this.r = r;
            this.s = s;
            this.recovery = recovery;
            this.assertValidity();
          }
          // pair (bytes of r, bytes of s)
          static fromCompact(hex2) {
            const l = CURVE.nByteLength;
            hex2 = (0, utils_js_1.ensureBytes)("compactSignature", hex2, l * 2);
            return new Signature(slcNum(hex2, 0, l), slcNum(hex2, l, 2 * l));
          }
          // DER encoded ECDSA signature
          // https://bitcoin.stackexchange.com/questions/57644/what-are-the-parts-of-a-bitcoin-transaction-input-script
          static fromDER(hex2) {
            const { r, s } = exports.DER.toSig((0, utils_js_1.ensureBytes)("DER", hex2));
            return new Signature(r, s);
          }
          assertValidity() {
            ut.aInRange("r", this.r, _1n, CURVE_ORDER);
            ut.aInRange("s", this.s, _1n, CURVE_ORDER);
          }
          addRecoveryBit(recovery) {
            return new Signature(this.r, this.s, recovery);
          }
          recoverPublicKey(msgHash) {
            const { r, s, recovery: rec } = this;
            const h = bits2int_modN((0, utils_js_1.ensureBytes)("msgHash", msgHash));
            if (rec == null || ![0, 1, 2, 3].includes(rec))
              throw new Error("recovery id invalid");
            const radj = rec === 2 || rec === 3 ? r + CURVE.n : r;
            if (radj >= Fp.ORDER)
              throw new Error("recovery id 2 or 3 invalid");
            const prefix = (rec & 1) === 0 ? "02" : "03";
            const R = Point.fromHex(prefix + numToNByteStr(radj));
            const ir = invN(radj);
            const u1 = modN(-h * ir);
            const u2 = modN(s * ir);
            const Q = Point.BASE.multiplyAndAddUnsafe(R, u1, u2);
            if (!Q)
              throw new Error("point at infinify");
            Q.assertValidity();
            return Q;
          }
          // Signatures should be low-s, to prevent malleability.
          hasHighS() {
            return isBiggerThanHalfOrder(this.s);
          }
          normalizeS() {
            return this.hasHighS() ? new Signature(this.r, modN(-this.s), this.recovery) : this;
          }
          // DER-encoded
          toDERRawBytes() {
            return ut.hexToBytes(this.toDERHex());
          }
          toDERHex() {
            return exports.DER.hexFromSig({ r: this.r, s: this.s });
          }
          // padded bytes of r, then padded bytes of s
          toCompactRawBytes() {
            return ut.hexToBytes(this.toCompactHex());
          }
          toCompactHex() {
            return numToNByteStr(this.r) + numToNByteStr(this.s);
          }
        }
        const utils2 = {
          isValidPrivateKey(privateKey) {
            try {
              normPrivateKeyToScalar(privateKey);
              return true;
            } catch (error) {
              return false;
            }
          },
          normPrivateKeyToScalar,
          /**
           * Produces cryptographically secure private key from random of size
           * (groupLen + ceil(groupLen / 2)) with modulo bias being negligible.
           */
          randomPrivateKey: () => {
            const length = mod.getMinHashLength(CURVE.n);
            return mod.mapHashToField(CURVE.randomBytes(length), CURVE.n);
          },
          /**
           * Creates precompute table for an arbitrary EC point. Makes point "cached".
           * Allows to massively speed-up `point.multiply(scalar)`.
           * @returns cached point
           * @example
           * const fast = utils.precompute(8, ProjectivePoint.fromHex(someonesPubKey));
           * fast.multiply(privKey); // much faster ECDH now
           */
          precompute(windowSize = 8, point = Point.BASE) {
            point._setWindowSize(windowSize);
            point.multiply(BigInt(3));
            return point;
          }
        };
        function getPublicKey(privateKey, isCompressed = true) {
          return Point.fromPrivateKey(privateKey).toRawBytes(isCompressed);
        }
        function isProbPub(item) {
          const arr = ut.isBytes(item);
          const str = typeof item === "string";
          const len = (arr || str) && item.length;
          if (arr)
            return len === compressedLen || len === uncompressedLen;
          if (str)
            return len === 2 * compressedLen || len === 2 * uncompressedLen;
          if (item instanceof Point)
            return true;
          return false;
        }
        function getSharedSecret(privateA, publicB, isCompressed = true) {
          if (isProbPub(privateA))
            throw new Error("first arg must be private key");
          if (!isProbPub(publicB))
            throw new Error("second arg must be public key");
          const b = Point.fromHex(publicB);
          return b.multiply(normPrivateKeyToScalar(privateA)).toRawBytes(isCompressed);
        }
        const bits2int = CURVE.bits2int || function(bytes2) {
          const num = ut.bytesToNumberBE(bytes2);
          const delta = bytes2.length * 8 - CURVE.nBitLength;
          return delta > 0 ? num >> BigInt(delta) : num;
        };
        const bits2int_modN = CURVE.bits2int_modN || function(bytes2) {
          return modN(bits2int(bytes2));
        };
        const ORDER_MASK = ut.bitMask(CURVE.nBitLength);
        function int2octets(num) {
          ut.aInRange(`num < 2^${CURVE.nBitLength}`, num, _0n, ORDER_MASK);
          return ut.numberToBytesBE(num, CURVE.nByteLength);
        }
        function prepSig(msgHash, privateKey, opts = defaultSigOpts) {
          if (["recovered", "canonical"].some((k) => k in opts))
            throw new Error("sign() legacy options not supported");
          const { hash, randomBytes: randomBytes2 } = CURVE;
          let { lowS, prehash, extraEntropy: ent } = opts;
          if (lowS == null)
            lowS = true;
          msgHash = (0, utils_js_1.ensureBytes)("msgHash", msgHash);
          validateSigVerOpts(opts);
          if (prehash)
            msgHash = (0, utils_js_1.ensureBytes)("prehashed msgHash", hash(msgHash));
          const h1int = bits2int_modN(msgHash);
          const d = normPrivateKeyToScalar(privateKey);
          const seedArgs = [int2octets(d), int2octets(h1int)];
          if (ent != null && ent !== false) {
            const e = ent === true ? randomBytes2(Fp.BYTES) : ent;
            seedArgs.push((0, utils_js_1.ensureBytes)("extraEntropy", e));
          }
          const seed = ut.concatBytes(...seedArgs);
          const m = h1int;
          function k2sig(kBytes) {
            const k = bits2int(kBytes);
            if (!isWithinCurveOrder(k))
              return;
            const ik = invN(k);
            const q = Point.BASE.multiply(k).toAffine();
            const r = modN(q.x);
            if (r === _0n)
              return;
            const s = modN(ik * modN(m + r * d));
            if (s === _0n)
              return;
            let recovery = (q.x === r ? 0 : 2) | Number(q.y & _1n);
            let normS = s;
            if (lowS && isBiggerThanHalfOrder(s)) {
              normS = normalizeS(s);
              recovery ^= 1;
            }
            return new Signature(r, normS, recovery);
          }
          return { seed, k2sig };
        }
        const defaultSigOpts = { lowS: CURVE.lowS, prehash: false };
        const defaultVerOpts = { lowS: CURVE.lowS, prehash: false };
        function sign(msgHash, privKey, opts = defaultSigOpts) {
          const { seed, k2sig } = prepSig(msgHash, privKey, opts);
          const C = CURVE;
          const drbg = ut.createHmacDrbg(C.hash.outputLen, C.nByteLength, C.hmac);
          return drbg(seed, k2sig);
        }
        Point.BASE._setWindowSize(8);
        function verify(signature, msgHash, publicKey, opts = defaultVerOpts) {
          const sg = signature;
          msgHash = (0, utils_js_1.ensureBytes)("msgHash", msgHash);
          publicKey = (0, utils_js_1.ensureBytes)("publicKey", publicKey);
          if ("strict" in opts)
            throw new Error("options.strict was renamed to lowS");
          validateSigVerOpts(opts);
          const { lowS, prehash } = opts;
          let _sig = void 0;
          let P;
          try {
            if (typeof sg === "string" || ut.isBytes(sg)) {
              try {
                _sig = Signature.fromDER(sg);
              } catch (derError) {
                if (!(derError instanceof exports.DER.Err))
                  throw derError;
                _sig = Signature.fromCompact(sg);
              }
            } else if (typeof sg === "object" && typeof sg.r === "bigint" && typeof sg.s === "bigint") {
              const { r: r2, s: s2 } = sg;
              _sig = new Signature(r2, s2);
            } else {
              throw new Error("PARSE");
            }
            P = Point.fromHex(publicKey);
          } catch (error) {
            if (error.message === "PARSE")
              throw new Error(`signature must be Signature instance, Uint8Array or hex string`);
            return false;
          }
          if (lowS && _sig.hasHighS())
            return false;
          if (prehash)
            msgHash = CURVE.hash(msgHash);
          const { r, s } = _sig;
          const h = bits2int_modN(msgHash);
          const is = invN(s);
          const u1 = modN(h * is);
          const u2 = modN(r * is);
          const R = Point.BASE.multiplyAndAddUnsafe(P, u1, u2)?.toAffine();
          if (!R)
            return false;
          const v = modN(R.x);
          return v === r;
        }
        return {
          CURVE,
          getPublicKey,
          getSharedSecret,
          sign,
          verify,
          ProjectivePoint: Point,
          Signature,
          utils: utils2
        };
      }
      function SWUFpSqrtRatio(Fp, Z) {
        const q = Fp.ORDER;
        let l = _0n;
        for (let o = q - _1n; o % _2n === _0n; o /= _2n)
          l += _1n;
        const c1 = l;
        const _2n_pow_c1_1 = _2n << c1 - _1n - _1n;
        const _2n_pow_c1 = _2n_pow_c1_1 * _2n;
        const c2 = (q - _1n) / _2n_pow_c1;
        const c3 = (c2 - _1n) / _2n;
        const c4 = _2n_pow_c1 - _1n;
        const c5 = _2n_pow_c1_1;
        const c6 = Fp.pow(Z, c2);
        const c7 = Fp.pow(Z, (c2 + _1n) / _2n);
        let sqrtRatio = (u, v) => {
          let tv1 = c6;
          let tv2 = Fp.pow(v, c4);
          let tv3 = Fp.sqr(tv2);
          tv3 = Fp.mul(tv3, v);
          let tv5 = Fp.mul(u, tv3);
          tv5 = Fp.pow(tv5, c3);
          tv5 = Fp.mul(tv5, tv2);
          tv2 = Fp.mul(tv5, v);
          tv3 = Fp.mul(tv5, u);
          let tv4 = Fp.mul(tv3, tv2);
          tv5 = Fp.pow(tv4, c5);
          let isQR = Fp.eql(tv5, Fp.ONE);
          tv2 = Fp.mul(tv3, c7);
          tv5 = Fp.mul(tv4, tv1);
          tv3 = Fp.cmov(tv2, tv3, isQR);
          tv4 = Fp.cmov(tv5, tv4, isQR);
          for (let i = c1; i > _1n; i--) {
            let tv52 = i - _2n;
            tv52 = _2n << tv52 - _1n;
            let tvv5 = Fp.pow(tv4, tv52);
            const e1 = Fp.eql(tvv5, Fp.ONE);
            tv2 = Fp.mul(tv3, tv1);
            tv1 = Fp.mul(tv1, tv1);
            tvv5 = Fp.mul(tv4, tv1);
            tv3 = Fp.cmov(tv2, tv3, e1);
            tv4 = Fp.cmov(tvv5, tv4, e1);
          }
          return { isValid: isQR, value: tv3 };
        };
        if (Fp.ORDER % _4n === _3n) {
          const c12 = (Fp.ORDER - _3n) / _4n;
          const c22 = Fp.sqrt(Fp.neg(Z));
          sqrtRatio = (u, v) => {
            let tv1 = Fp.sqr(v);
            const tv2 = Fp.mul(u, v);
            tv1 = Fp.mul(tv1, tv2);
            let y1 = Fp.pow(tv1, c12);
            y1 = Fp.mul(y1, tv2);
            const y2 = Fp.mul(y1, c22);
            const tv3 = Fp.mul(Fp.sqr(y1), v);
            const isQR = Fp.eql(tv3, u);
            let y = Fp.cmov(y2, y1, isQR);
            return { isValid: isQR, value: y };
          };
        }
        return sqrtRatio;
      }
      function mapToCurveSimpleSWU(Fp, opts) {
        mod.validateField(Fp);
        if (!Fp.isValid(opts.A) || !Fp.isValid(opts.B) || !Fp.isValid(opts.Z))
          throw new Error("mapToCurveSimpleSWU: invalid opts");
        const sqrtRatio = SWUFpSqrtRatio(Fp, opts.Z);
        if (!Fp.isOdd)
          throw new Error("Fp.isOdd is not implemented!");
        return (u) => {
          let tv1, tv2, tv3, tv4, tv5, tv6, x, y;
          tv1 = Fp.sqr(u);
          tv1 = Fp.mul(tv1, opts.Z);
          tv2 = Fp.sqr(tv1);
          tv2 = Fp.add(tv2, tv1);
          tv3 = Fp.add(tv2, Fp.ONE);
          tv3 = Fp.mul(tv3, opts.B);
          tv4 = Fp.cmov(opts.Z, Fp.neg(tv2), !Fp.eql(tv2, Fp.ZERO));
          tv4 = Fp.mul(tv4, opts.A);
          tv2 = Fp.sqr(tv3);
          tv6 = Fp.sqr(tv4);
          tv5 = Fp.mul(tv6, opts.A);
          tv2 = Fp.add(tv2, tv5);
          tv2 = Fp.mul(tv2, tv3);
          tv6 = Fp.mul(tv6, tv4);
          tv5 = Fp.mul(tv6, opts.B);
          tv2 = Fp.add(tv2, tv5);
          x = Fp.mul(tv1, tv3);
          const { isValid, value } = sqrtRatio(tv2, tv6);
          y = Fp.mul(tv1, u);
          y = Fp.mul(y, value);
          x = Fp.cmov(x, tv3, isValid);
          y = Fp.cmov(y, value, isValid);
          const e1 = Fp.isOdd(u) === Fp.isOdd(y);
          y = Fp.cmov(Fp.neg(y), y, e1);
          x = Fp.div(x, tv4);
          return { x, y };
        };
      }
    }
  });

  // ../../../@noble/curves/_shortw_utils.js
  var require_shortw_utils = __commonJS({
    "../../../@noble/curves/_shortw_utils.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.getHash = getHash;
      exports.createCurve = createCurve;
      var hmac_1 = require_hmac();
      var utils_1 = require_utils();
      var weierstrass_js_1 = require_weierstrass();
      function getHash(hash) {
        return {
          hash,
          hmac: (key, ...msgs) => (0, hmac_1.hmac)(hash, key, (0, utils_1.concatBytes)(...msgs)),
          randomBytes: utils_1.randomBytes
        };
      }
      function createCurve(curveDef, defHash) {
        const create = (hash) => (0, weierstrass_js_1.weierstrass)({ ...curveDef, ...getHash(hash) });
        return Object.freeze({ ...create(defHash), create });
      }
    }
  });

  // ../../../@noble/curves/abstract/hash-to-curve.js
  var require_hash_to_curve = __commonJS({
    "../../../@noble/curves/abstract/hash-to-curve.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.expand_message_xmd = expand_message_xmd;
      exports.expand_message_xof = expand_message_xof;
      exports.hash_to_field = hash_to_field;
      exports.isogenyMap = isogenyMap;
      exports.createHasher = createHasher;
      var modular_js_1 = require_modular();
      var utils_js_1 = require_utils2();
      var os2ip = utils_js_1.bytesToNumberBE;
      function i2osp(value, length) {
        anum(value);
        anum(length);
        if (value < 0 || value >= 1 << 8 * length) {
          throw new Error(`bad I2OSP call: value=${value} length=${length}`);
        }
        const res = Array.from({ length }).fill(0);
        for (let i = length - 1; i >= 0; i--) {
          res[i] = value & 255;
          value >>>= 8;
        }
        return new Uint8Array(res);
      }
      function strxor(a, b) {
        const arr = new Uint8Array(a.length);
        for (let i = 0; i < a.length; i++) {
          arr[i] = a[i] ^ b[i];
        }
        return arr;
      }
      function anum(item) {
        if (!Number.isSafeInteger(item))
          throw new Error("number expected");
      }
      function expand_message_xmd(msg, DST, lenInBytes, H) {
        (0, utils_js_1.abytes)(msg);
        (0, utils_js_1.abytes)(DST);
        anum(lenInBytes);
        if (DST.length > 255)
          DST = H((0, utils_js_1.concatBytes)((0, utils_js_1.utf8ToBytes)("H2C-OVERSIZE-DST-"), DST));
        const { outputLen: b_in_bytes, blockLen: r_in_bytes } = H;
        const ell = Math.ceil(lenInBytes / b_in_bytes);
        if (lenInBytes > 65535 || ell > 255)
          throw new Error("expand_message_xmd: invalid lenInBytes");
        const DST_prime = (0, utils_js_1.concatBytes)(DST, i2osp(DST.length, 1));
        const Z_pad = i2osp(0, r_in_bytes);
        const l_i_b_str = i2osp(lenInBytes, 2);
        const b = new Array(ell);
        const b_0 = H((0, utils_js_1.concatBytes)(Z_pad, msg, l_i_b_str, i2osp(0, 1), DST_prime));
        b[0] = H((0, utils_js_1.concatBytes)(b_0, i2osp(1, 1), DST_prime));
        for (let i = 1; i <= ell; i++) {
          const args = [strxor(b_0, b[i - 1]), i2osp(i + 1, 1), DST_prime];
          b[i] = H((0, utils_js_1.concatBytes)(...args));
        }
        const pseudo_random_bytes = (0, utils_js_1.concatBytes)(...b);
        return pseudo_random_bytes.slice(0, lenInBytes);
      }
      function expand_message_xof(msg, DST, lenInBytes, k, H) {
        (0, utils_js_1.abytes)(msg);
        (0, utils_js_1.abytes)(DST);
        anum(lenInBytes);
        if (DST.length > 255) {
          const dkLen = Math.ceil(2 * k / 8);
          DST = H.create({ dkLen }).update((0, utils_js_1.utf8ToBytes)("H2C-OVERSIZE-DST-")).update(DST).digest();
        }
        if (lenInBytes > 65535 || DST.length > 255)
          throw new Error("expand_message_xof: invalid lenInBytes");
        return H.create({ dkLen: lenInBytes }).update(msg).update(i2osp(lenInBytes, 2)).update(DST).update(i2osp(DST.length, 1)).digest();
      }
      function hash_to_field(msg, count, options) {
        (0, utils_js_1.validateObject)(options, {
          DST: "stringOrUint8Array",
          p: "bigint",
          m: "isSafeInteger",
          k: "isSafeInteger",
          hash: "hash"
        });
        const { p, k, m, hash, expand, DST: _DST } = options;
        (0, utils_js_1.abytes)(msg);
        anum(count);
        const DST = typeof _DST === "string" ? (0, utils_js_1.utf8ToBytes)(_DST) : _DST;
        const log2p = p.toString(2).length;
        const L = Math.ceil((log2p + k) / 8);
        const len_in_bytes = count * m * L;
        let prb;
        if (expand === "xmd") {
          prb = expand_message_xmd(msg, DST, len_in_bytes, hash);
        } else if (expand === "xof") {
          prb = expand_message_xof(msg, DST, len_in_bytes, k, hash);
        } else if (expand === "_internal_pass") {
          prb = msg;
        } else {
          throw new Error('expand must be "xmd" or "xof"');
        }
        const u = new Array(count);
        for (let i = 0; i < count; i++) {
          const e = new Array(m);
          for (let j = 0; j < m; j++) {
            const elm_offset = L * (j + i * m);
            const tv = prb.subarray(elm_offset, elm_offset + L);
            e[j] = (0, modular_js_1.mod)(os2ip(tv), p);
          }
          u[i] = e;
        }
        return u;
      }
      function isogenyMap(field, map) {
        const COEFF = map.map((i) => Array.from(i).reverse());
        return (x, y) => {
          const [xNum, xDen, yNum, yDen] = COEFF.map((val) => val.reduce((acc, i) => field.add(field.mul(acc, x), i)));
          x = field.div(xNum, xDen);
          y = field.mul(y, field.div(yNum, yDen));
          return { x, y };
        };
      }
      function createHasher(Point, mapToCurve, def) {
        if (typeof mapToCurve !== "function")
          throw new Error("mapToCurve() must be defined");
        return {
          // Encodes byte string to elliptic curve.
          // hash_to_curve from https://www.rfc-editor.org/rfc/rfc9380#section-3
          hashToCurve(msg, options) {
            const u = hash_to_field(msg, 2, { ...def, DST: def.DST, ...options });
            const u0 = Point.fromAffine(mapToCurve(u[0]));
            const u1 = Point.fromAffine(mapToCurve(u[1]));
            const P = u0.add(u1).clearCofactor();
            P.assertValidity();
            return P;
          },
          // Encodes byte string to elliptic curve.
          // encode_to_curve from https://www.rfc-editor.org/rfc/rfc9380#section-3
          encodeToCurve(msg, options) {
            const u = hash_to_field(msg, 1, { ...def, DST: def.encodeDST, ...options });
            const P = Point.fromAffine(mapToCurve(u[0])).clearCofactor();
            P.assertValidity();
            return P;
          },
          // Same as encodeToCurve, but without hash
          mapToCurve(scalars) {
            if (!Array.isArray(scalars))
              throw new Error("mapToCurve: expected array of bigints");
            for (const i of scalars)
              if (typeof i !== "bigint")
                throw new Error(`mapToCurve: expected array of bigints, got ${i} in array`);
            const P = Point.fromAffine(mapToCurve(scalars)).clearCofactor();
            P.assertValidity();
            return P;
          }
        };
      }
    }
  });

  // ../../../@noble/curves/secp256k1.js
  var require_secp256k1 = __commonJS({
    "../../../@noble/curves/secp256k1.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.encodeToCurve = exports.hashToCurve = exports.schnorr = exports.secp256k1 = void 0;
      var sha256_1 = require_sha256();
      var utils_1 = require_utils();
      var _shortw_utils_js_1 = require_shortw_utils();
      var hash_to_curve_js_1 = require_hash_to_curve();
      var modular_js_1 = require_modular();
      var utils_js_1 = require_utils2();
      var weierstrass_js_1 = require_weierstrass();
      var secp256k1P = BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f");
      var secp256k1N = BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141");
      var _1n = BigInt(1);
      var _2n = BigInt(2);
      var divNearest = (a, b) => (a + b / _2n) / b;
      function sqrtMod(y) {
        const P = secp256k1P;
        const _3n = BigInt(3), _6n = BigInt(6), _11n = BigInt(11), _22n = BigInt(22);
        const _23n = BigInt(23), _44n = BigInt(44), _88n = BigInt(88);
        const b2 = y * y * y % P;
        const b3 = b2 * b2 * y % P;
        const b6 = (0, modular_js_1.pow2)(b3, _3n, P) * b3 % P;
        const b9 = (0, modular_js_1.pow2)(b6, _3n, P) * b3 % P;
        const b11 = (0, modular_js_1.pow2)(b9, _2n, P) * b2 % P;
        const b22 = (0, modular_js_1.pow2)(b11, _11n, P) * b11 % P;
        const b44 = (0, modular_js_1.pow2)(b22, _22n, P) * b22 % P;
        const b88 = (0, modular_js_1.pow2)(b44, _44n, P) * b44 % P;
        const b176 = (0, modular_js_1.pow2)(b88, _88n, P) * b88 % P;
        const b220 = (0, modular_js_1.pow2)(b176, _44n, P) * b44 % P;
        const b223 = (0, modular_js_1.pow2)(b220, _3n, P) * b3 % P;
        const t1 = (0, modular_js_1.pow2)(b223, _23n, P) * b22 % P;
        const t2 = (0, modular_js_1.pow2)(t1, _6n, P) * b2 % P;
        const root = (0, modular_js_1.pow2)(t2, _2n, P);
        if (!Fp.eql(Fp.sqr(root), y))
          throw new Error("Cannot find square root");
        return root;
      }
      var Fp = (0, modular_js_1.Field)(secp256k1P, void 0, void 0, { sqrt: sqrtMod });
      exports.secp256k1 = (0, _shortw_utils_js_1.createCurve)({
        a: BigInt(0),
        // equation params: a, b
        b: BigInt(7),
        // Seem to be rigid: bitcointalk.org/index.php?topic=289795.msg3183975#msg3183975
        Fp,
        // Field's prime: 2n**256n - 2n**32n - 2n**9n - 2n**8n - 2n**7n - 2n**6n - 2n**4n - 1n
        n: secp256k1N,
        // Curve order, total count of valid points in the field
        // Base point (x, y) aka generator point
        Gx: BigInt("55066263022277343669578718895168534326250603453777594175500187360389116729240"),
        Gy: BigInt("32670510020758816978083085130507043184471273380659243275938904335757337482424"),
        h: BigInt(1),
        // Cofactor
        lowS: true,
        // Allow only low-S signatures by default in sign() and verify()
        /**
         * secp256k1 belongs to Koblitz curves: it has efficiently computable endomorphism.
         * Endomorphism uses 2x less RAM, speeds up precomputation by 2x and ECDH / key recovery by 20%.
         * For precomputed wNAF it trades off 1/2 init time & 1/3 ram for 20% perf hit.
         * Explanation: https://gist.github.com/paulmillr/eb670806793e84df628a7c434a873066
         */
        endo: {
          beta: BigInt("0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee"),
          splitScalar: (k) => {
            const n = secp256k1N;
            const a1 = BigInt("0x3086d221a7d46bcde86c90e49284eb15");
            const b1 = -_1n * BigInt("0xe4437ed6010e88286f547fa90abfe4c3");
            const a2 = BigInt("0x114ca50f7a8e2f3f657c1108d9d44cfd8");
            const b2 = a1;
            const POW_2_128 = BigInt("0x100000000000000000000000000000000");
            const c1 = divNearest(b2 * k, n);
            const c2 = divNearest(-b1 * k, n);
            let k1 = (0, modular_js_1.mod)(k - c1 * a1 - c2 * a2, n);
            let k2 = (0, modular_js_1.mod)(-c1 * b1 - c2 * b2, n);
            const k1neg = k1 > POW_2_128;
            const k2neg = k2 > POW_2_128;
            if (k1neg)
              k1 = n - k1;
            if (k2neg)
              k2 = n - k2;
            if (k1 > POW_2_128 || k2 > POW_2_128) {
              throw new Error("splitScalar: Endomorphism failed, k=" + k);
            }
            return { k1neg, k1, k2neg, k2 };
          }
        }
      }, sha256_1.sha256);
      var _0n = BigInt(0);
      var TAGGED_HASH_PREFIXES = {};
      function taggedHash(tag, ...messages) {
        let tagP = TAGGED_HASH_PREFIXES[tag];
        if (tagP === void 0) {
          const tagH = (0, sha256_1.sha256)(Uint8Array.from(tag, (c) => c.charCodeAt(0)));
          tagP = (0, utils_js_1.concatBytes)(tagH, tagH);
          TAGGED_HASH_PREFIXES[tag] = tagP;
        }
        return (0, sha256_1.sha256)((0, utils_js_1.concatBytes)(tagP, ...messages));
      }
      var pointToBytes = (point) => point.toRawBytes(true).slice(1);
      var numTo32b = (n) => (0, utils_js_1.numberToBytesBE)(n, 32);
      var modP = (x) => (0, modular_js_1.mod)(x, secp256k1P);
      var modN = (x) => (0, modular_js_1.mod)(x, secp256k1N);
      var Point = exports.secp256k1.ProjectivePoint;
      var GmulAdd = (Q, a, b) => Point.BASE.multiplyAndAddUnsafe(Q, a, b);
      function schnorrGetExtPubKey(priv) {
        let d_ = exports.secp256k1.utils.normPrivateKeyToScalar(priv);
        let p = Point.fromPrivateKey(d_);
        const scalar = p.hasEvenY() ? d_ : modN(-d_);
        return { scalar, bytes: pointToBytes(p) };
      }
      function lift_x(x) {
        (0, utils_js_1.aInRange)("x", x, _1n, secp256k1P);
        const xx = modP(x * x);
        const c = modP(xx * x + BigInt(7));
        let y = sqrtMod(c);
        if (y % _2n !== _0n)
          y = modP(-y);
        const p = new Point(x, y, _1n);
        p.assertValidity();
        return p;
      }
      var num = utils_js_1.bytesToNumberBE;
      function challenge(...args) {
        return modN(num(taggedHash("BIP0340/challenge", ...args)));
      }
      function schnorrGetPublicKey(privateKey) {
        return schnorrGetExtPubKey(privateKey).bytes;
      }
      function schnorrSign(message, privateKey, auxRand = (0, utils_1.randomBytes)(32)) {
        const m = (0, utils_js_1.ensureBytes)("message", message);
        const { bytes: px, scalar: d } = schnorrGetExtPubKey(privateKey);
        const a = (0, utils_js_1.ensureBytes)("auxRand", auxRand, 32);
        const t = numTo32b(d ^ num(taggedHash("BIP0340/aux", a)));
        const rand = taggedHash("BIP0340/nonce", t, px, m);
        const k_ = modN(num(rand));
        if (k_ === _0n)
          throw new Error("sign failed: k is zero");
        const { bytes: rx, scalar: k } = schnorrGetExtPubKey(k_);
        const e = challenge(rx, px, m);
        const sig = new Uint8Array(64);
        sig.set(rx, 0);
        sig.set(numTo32b(modN(k + e * d)), 32);
        if (!schnorrVerify(sig, m, px))
          throw new Error("sign: Invalid signature produced");
        return sig;
      }
      function schnorrVerify(signature, message, publicKey) {
        const sig = (0, utils_js_1.ensureBytes)("signature", signature, 64);
        const m = (0, utils_js_1.ensureBytes)("message", message);
        const pub = (0, utils_js_1.ensureBytes)("publicKey", publicKey, 32);
        try {
          const P = lift_x(num(pub));
          const r = num(sig.subarray(0, 32));
          if (!(0, utils_js_1.inRange)(r, _1n, secp256k1P))
            return false;
          const s = num(sig.subarray(32, 64));
          if (!(0, utils_js_1.inRange)(s, _1n, secp256k1N))
            return false;
          const e = challenge(numTo32b(r), pointToBytes(P), m);
          const R = GmulAdd(P, s, modN(-e));
          if (!R || !R.hasEvenY() || R.toAffine().x !== r)
            return false;
          return true;
        } catch (error) {
          return false;
        }
      }
      exports.schnorr = (() => ({
        getPublicKey: schnorrGetPublicKey,
        sign: schnorrSign,
        verify: schnorrVerify,
        utils: {
          randomPrivateKey: exports.secp256k1.utils.randomPrivateKey,
          lift_x,
          pointToBytes,
          numberToBytesBE: utils_js_1.numberToBytesBE,
          bytesToNumberBE: utils_js_1.bytesToNumberBE,
          taggedHash,
          mod: modular_js_1.mod
        }
      }))();
      var isoMap = /* @__PURE__ */ (() => (0, hash_to_curve_js_1.isogenyMap)(Fp, [
        // xNum
        [
          "0x8e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38daaaaa8c7",
          "0x7d3d4c80bc321d5b9f315cea7fd44c5d595d2fc0bf63b92dfff1044f17c6581",
          "0x534c328d23f234e6e2a413deca25caece4506144037c40314ecbd0b53d9dd262",
          "0x8e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38daaaaa88c"
        ],
        // xDen
        [
          "0xd35771193d94918a9ca34ccbb7b640dd86cd409542f8487d9fe6b745781eb49b",
          "0xedadc6f64383dc1df7c4b2d51b54225406d36b641f5e41bbc52a56612a8c6d14",
          "0x0000000000000000000000000000000000000000000000000000000000000001"
          // LAST 1
        ],
        // yNum
        [
          "0x4bda12f684bda12f684bda12f684bda12f684bda12f684bda12f684b8e38e23c",
          "0xc75e0c32d5cb7c0fa9d0a54b12a0a6d5647ab046d686da6fdffc90fc201d71a3",
          "0x29a6194691f91a73715209ef6512e576722830a201be2018a765e85a9ecee931",
          "0x2f684bda12f684bda12f684bda12f684bda12f684bda12f684bda12f38e38d84"
        ],
        // yDen
        [
          "0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffff93b",
          "0x7a06534bb8bdb49fd5e9e6632722c2989467c1bfc8e8d978dfb425d2685c2573",
          "0x6484aa716545ca2cf3a70c3fa8fe337e0a3d21162f0d6299a7bf8192bfd2a76f",
          "0x0000000000000000000000000000000000000000000000000000000000000001"
          // LAST 1
        ]
      ].map((i) => i.map((j) => BigInt(j)))))();
      var mapSWU = /* @__PURE__ */ (() => (0, weierstrass_js_1.mapToCurveSimpleSWU)(Fp, {
        A: BigInt("0x3f8731abdd661adca08a5558f0f5d272e953d363cb6f0e5d405447c01a444533"),
        B: BigInt("1771"),
        Z: Fp.create(BigInt("-11"))
      }))();
      var htf = /* @__PURE__ */ (() => (0, hash_to_curve_js_1.createHasher)(exports.secp256k1.ProjectivePoint, (scalars) => {
        const { x, y } = mapSWU(Fp.create(scalars[0]));
        return isoMap(x, y);
      }, {
        DST: "secp256k1_XMD:SHA-256_SSWU_RO_",
        encodeDST: "secp256k1_XMD:SHA-256_SSWU_NU_",
        p: Fp.ORDER,
        m: 1,
        k: 128,
        expand: "xmd",
        hash: sha256_1.sha256
      }))();
      exports.hashToCurve = (() => htf.hashToCurve)();
      exports.encodeToCurve = (() => htf.encodeToCurve)();
    }
  });

  // ../../crypto/modules/esm/util/utils.js
  var require_utils3 = __commonJS({
    "../../crypto/modules/esm/util/utils.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.encodeBase64toUint8 = exports.hexToNumber = exports.bytesToNumber = void 0;
      var utils_1 = require_utils2();
      var buffer_1 = require_buffer();
      function bytesToNumber2(bytes2) {
        return hexToNumber2((0, utils_1.bytesToHex)(bytes2));
      }
      exports.bytesToNumber = bytesToNumber2;
      function hexToNumber2(hex2) {
        return BigInt(`0x${hex2}`);
      }
      exports.hexToNumber = hexToNumber2;
      function encodeBase64toUint82(base64String) {
        return buffer_1.Buffer.from(base64String, "base64");
      }
      exports.encodeBase64toUint8 = encodeBase64toUint82;
    }
  });

  // ../../crypto/modules/esm/common/index.js
  var require_common = __commonJS({
    "../../crypto/modules/esm/common/index.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.deriveKeysetId = exports.deserializeMintKeys = exports.serializeMintKeys = exports.createRandomPrivateKey = exports.getKeysetIdInt = exports.pointFromHex = exports.hashToCurve = void 0;
      var secp256k1_1 = require_secp256k1();
      var sha256_1 = require_sha256();
      var utils_1 = require_utils2();
      var utils_js_1 = require_utils3();
      var buffer_1 = require_buffer();
      var DOMAIN_SEPARATOR = (0, utils_1.hexToBytes)("536563703235366b315f48617368546f43757276655f43617368755f");
      function hashToCurve2(secret) {
        const msgToHash = (0, sha256_1.sha256)(buffer_1.Buffer.concat([DOMAIN_SEPARATOR, secret]));
        const counter = new Uint32Array(1);
        const maxIterations = 2 ** 16;
        for (let i = 0; i < maxIterations; i++) {
          const counterBytes = new Uint8Array(counter.buffer);
          const hash = (0, sha256_1.sha256)(buffer_1.Buffer.concat([msgToHash, counterBytes]));
          try {
            return pointFromHex2((0, utils_1.bytesToHex)(buffer_1.Buffer.concat([new Uint8Array([2]), hash])));
          } catch (error) {
            counter[0]++;
          }
        }
        throw new Error("No valid point found");
      }
      exports.hashToCurve = hashToCurve2;
      function pointFromHex2(hex2) {
        return secp256k1_1.secp256k1.ProjectivePoint.fromHex(hex2);
      }
      exports.pointFromHex = pointFromHex2;
      var getKeysetIdInt = (keysetId) => {
        let keysetIdInt;
        if (/^[a-fA-F0-9]+$/.test(keysetId)) {
          keysetIdInt = (0, utils_js_1.hexToNumber)(keysetId) % BigInt(2 ** 31 - 1);
        } else {
          keysetIdInt = (0, utils_js_1.bytesToNumber)((0, utils_js_1.encodeBase64toUint8)(keysetId)) % BigInt(2 ** 31 - 1);
        }
        return keysetIdInt;
      };
      exports.getKeysetIdInt = getKeysetIdInt;
      function createRandomPrivateKey() {
        return secp256k1_1.secp256k1.utils.randomPrivateKey();
      }
      exports.createRandomPrivateKey = createRandomPrivateKey;
      function serializeMintKeys(mintKeys) {
        const serializedMintKeys = {};
        Object.keys(mintKeys).forEach((p) => {
          serializedMintKeys[p] = (0, utils_1.bytesToHex)(mintKeys[p]);
        });
        return serializedMintKeys;
      }
      exports.serializeMintKeys = serializeMintKeys;
      function deserializeMintKeys(serializedMintKeys) {
        const mintKeys = {};
        Object.keys(serializedMintKeys).forEach((p) => {
          mintKeys[p] = (0, utils_1.hexToBytes)(serializedMintKeys[p]);
        });
        return mintKeys;
      }
      exports.deserializeMintKeys = deserializeMintKeys;
      function deriveKeysetId2(keys) {
        const KEYSET_VERSION = "00";
        const mapBigInt = (k) => {
          return [BigInt(k[0]), k[1]];
        };
        const pubkeysConcat = Object.entries(serializeMintKeys(keys)).map(mapBigInt).sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0).map(([, pubKey]) => (0, utils_1.hexToBytes)(pubKey)).reduce((prev, curr) => mergeUInt8Arrays2(prev, curr), new Uint8Array());
        const hash = (0, sha256_1.sha256)(pubkeysConcat);
        const hashHex = buffer_1.Buffer.from(hash).toString("hex").slice(0, 14);
        return "00" + hashHex;
      }
      exports.deriveKeysetId = deriveKeysetId2;
      function mergeUInt8Arrays2(a1, a2) {
        const mergedArray = new Uint8Array(a1.length + a2.length);
        mergedArray.set(a1);
        mergedArray.set(a2, a1.length);
        return mergedArray;
      }
    }
  });

  // ../../crypto/modules/esm/client/index.js
  var require_client = __commonJS({
    "../../crypto/modules/esm/client/index.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.serializeBlindedMessage = exports.deserializeProof = exports.serializeProof = exports.constructProofFromPromise = exports.unblindSignature = exports.blindMessage = exports.createRandomBlindedMessage = void 0;
      var secp256k1_1 = require_secp256k1();
      var utils_1 = require_utils();
      var utils_js_1 = require_utils3();
      var index_js_1 = require_common();
      function createRandomBlindedMessage() {
        return blindMessage2((0, utils_1.randomBytes)(32));
      }
      exports.createRandomBlindedMessage = createRandomBlindedMessage;
      function blindMessage2(secret, r) {
        const Y = (0, index_js_1.hashToCurve)(secret);
        if (!r) {
          r = (0, utils_js_1.bytesToNumber)(secp256k1_1.secp256k1.utils.randomPrivateKey());
        }
        const rG = secp256k1_1.secp256k1.ProjectivePoint.BASE.multiply(r);
        const B_ = Y.add(rG);
        return { B_, r, secret };
      }
      exports.blindMessage = blindMessage2;
      function unblindSignature(C_, r, A) {
        const C = C_.subtract(A.multiply(r));
        return C;
      }
      exports.unblindSignature = unblindSignature;
      function constructProofFromPromise2(promise, r, secret, key) {
        const A = key;
        const C = unblindSignature(promise.C_, r, A);
        const proof = {
          id: promise.id,
          amount: promise.amount,
          secret,
          C
        };
        return proof;
      }
      exports.constructProofFromPromise = constructProofFromPromise2;
      var serializeProof2 = (proof) => {
        return {
          amount: proof.amount,
          C: proof.C.toHex(true),
          id: proof.id,
          secret: new TextDecoder().decode(proof.secret),
          witness: JSON.stringify(proof.witness)
        };
      };
      exports.serializeProof = serializeProof2;
      var deserializeProof = (proof) => {
        return {
          amount: proof.amount,
          C: (0, index_js_1.pointFromHex)(proof.C),
          id: proof.id,
          secret: new TextEncoder().encode(proof.secret),
          witness: proof.witness ? JSON.parse(proof.witness) : void 0
        };
      };
      exports.deserializeProof = deserializeProof;
      var serializeBlindedMessage = (bm, amount) => {
        return {
          B_: bm.B_.toHex(true),
          amount
        };
      };
      exports.serializeBlindedMessage = serializeBlindedMessage;
    }
  });

  // ../../../@noble/hashes/ripemd160.js
  var require_ripemd160 = __commonJS({
    "../../../@noble/hashes/ripemd160.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.ripemd160 = exports.RIPEMD160 = void 0;
      var _md_js_1 = require_md();
      var utils_js_1 = require_utils();
      var Rho = /* @__PURE__ */ new Uint8Array([7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8]);
      var Id = /* @__PURE__ */ new Uint8Array(new Array(16).fill(0).map((_, i) => i));
      var Pi = /* @__PURE__ */ Id.map((i) => (9 * i + 5) % 16);
      var idxL = [Id];
      var idxR = [Pi];
      for (let i = 0; i < 4; i++)
        for (let j of [idxL, idxR])
          j.push(j[i].map((k) => Rho[k]));
      var shifts = /* @__PURE__ */ [
        [11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8],
        [12, 13, 11, 15, 6, 9, 9, 7, 12, 15, 11, 13, 7, 8, 7, 7],
        [13, 15, 14, 11, 7, 7, 6, 8, 13, 14, 13, 12, 5, 5, 6, 9],
        [14, 11, 12, 14, 8, 6, 5, 5, 15, 12, 15, 14, 9, 9, 8, 6],
        [15, 12, 13, 13, 9, 5, 8, 6, 14, 11, 12, 11, 8, 6, 5, 5]
      ].map((i) => new Uint8Array(i));
      var shiftsL = /* @__PURE__ */ idxL.map((idx, i) => idx.map((j) => shifts[i][j]));
      var shiftsR = /* @__PURE__ */ idxR.map((idx, i) => idx.map((j) => shifts[i][j]));
      var Kl = /* @__PURE__ */ new Uint32Array([
        0,
        1518500249,
        1859775393,
        2400959708,
        2840853838
      ]);
      var Kr = /* @__PURE__ */ new Uint32Array([
        1352829926,
        1548603684,
        1836072691,
        2053994217,
        0
      ]);
      function f(group, x, y, z) {
        if (group === 0)
          return x ^ y ^ z;
        else if (group === 1)
          return x & y | ~x & z;
        else if (group === 2)
          return (x | ~y) ^ z;
        else if (group === 3)
          return x & z | y & ~z;
        else
          return x ^ (y | ~z);
      }
      var R_BUF = /* @__PURE__ */ new Uint32Array(16);
      var RIPEMD160 = class extends _md_js_1.HashMD {
        constructor() {
          super(64, 20, 8, true);
          this.h0 = 1732584193 | 0;
          this.h1 = 4023233417 | 0;
          this.h2 = 2562383102 | 0;
          this.h3 = 271733878 | 0;
          this.h4 = 3285377520 | 0;
        }
        get() {
          const { h0, h1, h2, h3, h4 } = this;
          return [h0, h1, h2, h3, h4];
        }
        set(h0, h1, h2, h3, h4) {
          this.h0 = h0 | 0;
          this.h1 = h1 | 0;
          this.h2 = h2 | 0;
          this.h3 = h3 | 0;
          this.h4 = h4 | 0;
        }
        process(view, offset) {
          for (let i = 0; i < 16; i++, offset += 4)
            R_BUF[i] = view.getUint32(offset, true);
          let al = this.h0 | 0, ar = al, bl = this.h1 | 0, br = bl, cl = this.h2 | 0, cr = cl, dl = this.h3 | 0, dr = dl, el = this.h4 | 0, er = el;
          for (let group = 0; group < 5; group++) {
            const rGroup = 4 - group;
            const hbl = Kl[group], hbr = Kr[group];
            const rl = idxL[group], rr = idxR[group];
            const sl = shiftsL[group], sr = shiftsR[group];
            for (let i = 0; i < 16; i++) {
              const tl = (0, utils_js_1.rotl)(al + f(group, bl, cl, dl) + R_BUF[rl[i]] + hbl, sl[i]) + el | 0;
              al = el, el = dl, dl = (0, utils_js_1.rotl)(cl, 10) | 0, cl = bl, bl = tl;
            }
            for (let i = 0; i < 16; i++) {
              const tr = (0, utils_js_1.rotl)(ar + f(rGroup, br, cr, dr) + R_BUF[rr[i]] + hbr, sr[i]) + er | 0;
              ar = er, er = dr, dr = (0, utils_js_1.rotl)(cr, 10) | 0, cr = br, br = tr;
            }
          }
          this.set(this.h1 + cl + dr | 0, this.h2 + dl + er | 0, this.h3 + el + ar | 0, this.h4 + al + br | 0, this.h0 + bl + cr | 0);
        }
        roundClean() {
          R_BUF.fill(0);
        }
        destroy() {
          this.destroyed = true;
          this.buffer.fill(0);
          this.set(0, 0, 0, 0, 0);
        }
      };
      exports.RIPEMD160 = RIPEMD160;
      exports.ripemd160 = (0, utils_js_1.wrapConstructor)(() => new RIPEMD160());
    }
  });

  // ../../../@noble/hashes/_u64.js
  var require_u64 = __commonJS({
    "../../../@noble/hashes/_u64.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.add5L = exports.add5H = exports.add4H = exports.add4L = exports.add3H = exports.add3L = exports.rotlBL = exports.rotlBH = exports.rotlSL = exports.rotlSH = exports.rotr32L = exports.rotr32H = exports.rotrBL = exports.rotrBH = exports.rotrSL = exports.rotrSH = exports.shrSL = exports.shrSH = exports.toBig = void 0;
      exports.fromBig = fromBig;
      exports.split = split;
      exports.add = add;
      var U32_MASK64 = /* @__PURE__ */ BigInt(2 ** 32 - 1);
      var _32n = /* @__PURE__ */ BigInt(32);
      function fromBig(n, le = false) {
        if (le)
          return { h: Number(n & U32_MASK64), l: Number(n >> _32n & U32_MASK64) };
        return { h: Number(n >> _32n & U32_MASK64) | 0, l: Number(n & U32_MASK64) | 0 };
      }
      function split(lst, le = false) {
        let Ah = new Uint32Array(lst.length);
        let Al = new Uint32Array(lst.length);
        for (let i = 0; i < lst.length; i++) {
          const { h, l } = fromBig(lst[i], le);
          [Ah[i], Al[i]] = [h, l];
        }
        return [Ah, Al];
      }
      var toBig = (h, l) => BigInt(h >>> 0) << _32n | BigInt(l >>> 0);
      exports.toBig = toBig;
      var shrSH = (h, _l, s) => h >>> s;
      exports.shrSH = shrSH;
      var shrSL = (h, l, s) => h << 32 - s | l >>> s;
      exports.shrSL = shrSL;
      var rotrSH = (h, l, s) => h >>> s | l << 32 - s;
      exports.rotrSH = rotrSH;
      var rotrSL = (h, l, s) => h << 32 - s | l >>> s;
      exports.rotrSL = rotrSL;
      var rotrBH = (h, l, s) => h << 64 - s | l >>> s - 32;
      exports.rotrBH = rotrBH;
      var rotrBL = (h, l, s) => h >>> s - 32 | l << 64 - s;
      exports.rotrBL = rotrBL;
      var rotr32H = (_h, l) => l;
      exports.rotr32H = rotr32H;
      var rotr32L = (h, _l) => h;
      exports.rotr32L = rotr32L;
      var rotlSH = (h, l, s) => h << s | l >>> 32 - s;
      exports.rotlSH = rotlSH;
      var rotlSL = (h, l, s) => l << s | h >>> 32 - s;
      exports.rotlSL = rotlSL;
      var rotlBH = (h, l, s) => l << s - 32 | h >>> 64 - s;
      exports.rotlBH = rotlBH;
      var rotlBL = (h, l, s) => h << s - 32 | l >>> 64 - s;
      exports.rotlBL = rotlBL;
      function add(Ah, Al, Bh, Bl) {
        const l = (Al >>> 0) + (Bl >>> 0);
        return { h: Ah + Bh + (l / 2 ** 32 | 0) | 0, l: l | 0 };
      }
      var add3L = (Al, Bl, Cl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0);
      exports.add3L = add3L;
      var add3H = (low, Ah, Bh, Ch) => Ah + Bh + Ch + (low / 2 ** 32 | 0) | 0;
      exports.add3H = add3H;
      var add4L = (Al, Bl, Cl, Dl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0);
      exports.add4L = add4L;
      var add4H = (low, Ah, Bh, Ch, Dh) => Ah + Bh + Ch + Dh + (low / 2 ** 32 | 0) | 0;
      exports.add4H = add4H;
      var add5L = (Al, Bl, Cl, Dl, El) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0) + (El >>> 0);
      exports.add5L = add5L;
      var add5H = (low, Ah, Bh, Ch, Dh, Eh) => Ah + Bh + Ch + Dh + Eh + (low / 2 ** 32 | 0) | 0;
      exports.add5H = add5H;
      var u64 = {
        fromBig,
        split,
        toBig,
        shrSH,
        shrSL,
        rotrSH,
        rotrSL,
        rotrBH,
        rotrBL,
        rotr32H,
        rotr32L,
        rotlSH,
        rotlSL,
        rotlBH,
        rotlBL,
        add,
        add3L,
        add3H,
        add4L,
        add4H,
        add5H,
        add5L
      };
      exports.default = u64;
    }
  });

  // ../../../@noble/hashes/sha512.js
  var require_sha512 = __commonJS({
    "../../../@noble/hashes/sha512.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.sha384 = exports.sha512_256 = exports.sha512_224 = exports.sha512 = exports.SHA384 = exports.SHA512_256 = exports.SHA512_224 = exports.SHA512 = void 0;
      var _md_js_1 = require_md();
      var _u64_js_1 = require_u64();
      var utils_js_1 = require_utils();
      var [SHA512_Kh, SHA512_Kl] = /* @__PURE__ */ (() => _u64_js_1.default.split([
        "0x428a2f98d728ae22",
        "0x7137449123ef65cd",
        "0xb5c0fbcfec4d3b2f",
        "0xe9b5dba58189dbbc",
        "0x3956c25bf348b538",
        "0x59f111f1b605d019",
        "0x923f82a4af194f9b",
        "0xab1c5ed5da6d8118",
        "0xd807aa98a3030242",
        "0x12835b0145706fbe",
        "0x243185be4ee4b28c",
        "0x550c7dc3d5ffb4e2",
        "0x72be5d74f27b896f",
        "0x80deb1fe3b1696b1",
        "0x9bdc06a725c71235",
        "0xc19bf174cf692694",
        "0xe49b69c19ef14ad2",
        "0xefbe4786384f25e3",
        "0x0fc19dc68b8cd5b5",
        "0x240ca1cc77ac9c65",
        "0x2de92c6f592b0275",
        "0x4a7484aa6ea6e483",
        "0x5cb0a9dcbd41fbd4",
        "0x76f988da831153b5",
        "0x983e5152ee66dfab",
        "0xa831c66d2db43210",
        "0xb00327c898fb213f",
        "0xbf597fc7beef0ee4",
        "0xc6e00bf33da88fc2",
        "0xd5a79147930aa725",
        "0x06ca6351e003826f",
        "0x142929670a0e6e70",
        "0x27b70a8546d22ffc",
        "0x2e1b21385c26c926",
        "0x4d2c6dfc5ac42aed",
        "0x53380d139d95b3df",
        "0x650a73548baf63de",
        "0x766a0abb3c77b2a8",
        "0x81c2c92e47edaee6",
        "0x92722c851482353b",
        "0xa2bfe8a14cf10364",
        "0xa81a664bbc423001",
        "0xc24b8b70d0f89791",
        "0xc76c51a30654be30",
        "0xd192e819d6ef5218",
        "0xd69906245565a910",
        "0xf40e35855771202a",
        "0x106aa07032bbd1b8",
        "0x19a4c116b8d2d0c8",
        "0x1e376c085141ab53",
        "0x2748774cdf8eeb99",
        "0x34b0bcb5e19b48a8",
        "0x391c0cb3c5c95a63",
        "0x4ed8aa4ae3418acb",
        "0x5b9cca4f7763e373",
        "0x682e6ff3d6b2b8a3",
        "0x748f82ee5defb2fc",
        "0x78a5636f43172f60",
        "0x84c87814a1f0ab72",
        "0x8cc702081a6439ec",
        "0x90befffa23631e28",
        "0xa4506cebde82bde9",
        "0xbef9a3f7b2c67915",
        "0xc67178f2e372532b",
        "0xca273eceea26619c",
        "0xd186b8c721c0c207",
        "0xeada7dd6cde0eb1e",
        "0xf57d4f7fee6ed178",
        "0x06f067aa72176fba",
        "0x0a637dc5a2c898a6",
        "0x113f9804bef90dae",
        "0x1b710b35131c471b",
        "0x28db77f523047d84",
        "0x32caab7b40c72493",
        "0x3c9ebe0a15c9bebc",
        "0x431d67c49c100d4c",
        "0x4cc5d4becb3e42b6",
        "0x597f299cfc657e2a",
        "0x5fcb6fab3ad6faec",
        "0x6c44198c4a475817"
      ].map((n) => BigInt(n))))();
      var SHA512_W_H = /* @__PURE__ */ new Uint32Array(80);
      var SHA512_W_L = /* @__PURE__ */ new Uint32Array(80);
      var SHA512 = class extends _md_js_1.HashMD {
        constructor() {
          super(128, 64, 16, false);
          this.Ah = 1779033703 | 0;
          this.Al = 4089235720 | 0;
          this.Bh = 3144134277 | 0;
          this.Bl = 2227873595 | 0;
          this.Ch = 1013904242 | 0;
          this.Cl = 4271175723 | 0;
          this.Dh = 2773480762 | 0;
          this.Dl = 1595750129 | 0;
          this.Eh = 1359893119 | 0;
          this.El = 2917565137 | 0;
          this.Fh = 2600822924 | 0;
          this.Fl = 725511199 | 0;
          this.Gh = 528734635 | 0;
          this.Gl = 4215389547 | 0;
          this.Hh = 1541459225 | 0;
          this.Hl = 327033209 | 0;
        }
        // prettier-ignore
        get() {
          const { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
          return [Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl];
        }
        // prettier-ignore
        set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl) {
          this.Ah = Ah | 0;
          this.Al = Al | 0;
          this.Bh = Bh | 0;
          this.Bl = Bl | 0;
          this.Ch = Ch | 0;
          this.Cl = Cl | 0;
          this.Dh = Dh | 0;
          this.Dl = Dl | 0;
          this.Eh = Eh | 0;
          this.El = El | 0;
          this.Fh = Fh | 0;
          this.Fl = Fl | 0;
          this.Gh = Gh | 0;
          this.Gl = Gl | 0;
          this.Hh = Hh | 0;
          this.Hl = Hl | 0;
        }
        process(view, offset) {
          for (let i = 0; i < 16; i++, offset += 4) {
            SHA512_W_H[i] = view.getUint32(offset);
            SHA512_W_L[i] = view.getUint32(offset += 4);
          }
          for (let i = 16; i < 80; i++) {
            const W15h = SHA512_W_H[i - 15] | 0;
            const W15l = SHA512_W_L[i - 15] | 0;
            const s0h = _u64_js_1.default.rotrSH(W15h, W15l, 1) ^ _u64_js_1.default.rotrSH(W15h, W15l, 8) ^ _u64_js_1.default.shrSH(W15h, W15l, 7);
            const s0l = _u64_js_1.default.rotrSL(W15h, W15l, 1) ^ _u64_js_1.default.rotrSL(W15h, W15l, 8) ^ _u64_js_1.default.shrSL(W15h, W15l, 7);
            const W2h = SHA512_W_H[i - 2] | 0;
            const W2l = SHA512_W_L[i - 2] | 0;
            const s1h = _u64_js_1.default.rotrSH(W2h, W2l, 19) ^ _u64_js_1.default.rotrBH(W2h, W2l, 61) ^ _u64_js_1.default.shrSH(W2h, W2l, 6);
            const s1l = _u64_js_1.default.rotrSL(W2h, W2l, 19) ^ _u64_js_1.default.rotrBL(W2h, W2l, 61) ^ _u64_js_1.default.shrSL(W2h, W2l, 6);
            const SUMl = _u64_js_1.default.add4L(s0l, s1l, SHA512_W_L[i - 7], SHA512_W_L[i - 16]);
            const SUMh = _u64_js_1.default.add4H(SUMl, s0h, s1h, SHA512_W_H[i - 7], SHA512_W_H[i - 16]);
            SHA512_W_H[i] = SUMh | 0;
            SHA512_W_L[i] = SUMl | 0;
          }
          let { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
          for (let i = 0; i < 80; i++) {
            const sigma1h = _u64_js_1.default.rotrSH(Eh, El, 14) ^ _u64_js_1.default.rotrSH(Eh, El, 18) ^ _u64_js_1.default.rotrBH(Eh, El, 41);
            const sigma1l = _u64_js_1.default.rotrSL(Eh, El, 14) ^ _u64_js_1.default.rotrSL(Eh, El, 18) ^ _u64_js_1.default.rotrBL(Eh, El, 41);
            const CHIh = Eh & Fh ^ ~Eh & Gh;
            const CHIl = El & Fl ^ ~El & Gl;
            const T1ll = _u64_js_1.default.add5L(Hl, sigma1l, CHIl, SHA512_Kl[i], SHA512_W_L[i]);
            const T1h = _u64_js_1.default.add5H(T1ll, Hh, sigma1h, CHIh, SHA512_Kh[i], SHA512_W_H[i]);
            const T1l = T1ll | 0;
            const sigma0h = _u64_js_1.default.rotrSH(Ah, Al, 28) ^ _u64_js_1.default.rotrBH(Ah, Al, 34) ^ _u64_js_1.default.rotrBH(Ah, Al, 39);
            const sigma0l = _u64_js_1.default.rotrSL(Ah, Al, 28) ^ _u64_js_1.default.rotrBL(Ah, Al, 34) ^ _u64_js_1.default.rotrBL(Ah, Al, 39);
            const MAJh = Ah & Bh ^ Ah & Ch ^ Bh & Ch;
            const MAJl = Al & Bl ^ Al & Cl ^ Bl & Cl;
            Hh = Gh | 0;
            Hl = Gl | 0;
            Gh = Fh | 0;
            Gl = Fl | 0;
            Fh = Eh | 0;
            Fl = El | 0;
            ({ h: Eh, l: El } = _u64_js_1.default.add(Dh | 0, Dl | 0, T1h | 0, T1l | 0));
            Dh = Ch | 0;
            Dl = Cl | 0;
            Ch = Bh | 0;
            Cl = Bl | 0;
            Bh = Ah | 0;
            Bl = Al | 0;
            const All = _u64_js_1.default.add3L(T1l, sigma0l, MAJl);
            Ah = _u64_js_1.default.add3H(All, T1h, sigma0h, MAJh);
            Al = All | 0;
          }
          ({ h: Ah, l: Al } = _u64_js_1.default.add(this.Ah | 0, this.Al | 0, Ah | 0, Al | 0));
          ({ h: Bh, l: Bl } = _u64_js_1.default.add(this.Bh | 0, this.Bl | 0, Bh | 0, Bl | 0));
          ({ h: Ch, l: Cl } = _u64_js_1.default.add(this.Ch | 0, this.Cl | 0, Ch | 0, Cl | 0));
          ({ h: Dh, l: Dl } = _u64_js_1.default.add(this.Dh | 0, this.Dl | 0, Dh | 0, Dl | 0));
          ({ h: Eh, l: El } = _u64_js_1.default.add(this.Eh | 0, this.El | 0, Eh | 0, El | 0));
          ({ h: Fh, l: Fl } = _u64_js_1.default.add(this.Fh | 0, this.Fl | 0, Fh | 0, Fl | 0));
          ({ h: Gh, l: Gl } = _u64_js_1.default.add(this.Gh | 0, this.Gl | 0, Gh | 0, Gl | 0));
          ({ h: Hh, l: Hl } = _u64_js_1.default.add(this.Hh | 0, this.Hl | 0, Hh | 0, Hl | 0));
          this.set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl);
        }
        roundClean() {
          SHA512_W_H.fill(0);
          SHA512_W_L.fill(0);
        }
        destroy() {
          this.buffer.fill(0);
          this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
        }
      };
      exports.SHA512 = SHA512;
      var SHA512_224 = class extends SHA512 {
        constructor() {
          super();
          this.Ah = 2352822216 | 0;
          this.Al = 424955298 | 0;
          this.Bh = 1944164710 | 0;
          this.Bl = 2312950998 | 0;
          this.Ch = 502970286 | 0;
          this.Cl = 855612546 | 0;
          this.Dh = 1738396948 | 0;
          this.Dl = 1479516111 | 0;
          this.Eh = 258812777 | 0;
          this.El = 2077511080 | 0;
          this.Fh = 2011393907 | 0;
          this.Fl = 79989058 | 0;
          this.Gh = 1067287976 | 0;
          this.Gl = 1780299464 | 0;
          this.Hh = 286451373 | 0;
          this.Hl = 2446758561 | 0;
          this.outputLen = 28;
        }
      };
      exports.SHA512_224 = SHA512_224;
      var SHA512_256 = class extends SHA512 {
        constructor() {
          super();
          this.Ah = 573645204 | 0;
          this.Al = 4230739756 | 0;
          this.Bh = 2673172387 | 0;
          this.Bl = 3360449730 | 0;
          this.Ch = 596883563 | 0;
          this.Cl = 1867755857 | 0;
          this.Dh = 2520282905 | 0;
          this.Dl = 1497426621 | 0;
          this.Eh = 2519219938 | 0;
          this.El = 2827943907 | 0;
          this.Fh = 3193839141 | 0;
          this.Fl = 1401305490 | 0;
          this.Gh = 721525244 | 0;
          this.Gl = 746961066 | 0;
          this.Hh = 246885852 | 0;
          this.Hl = 2177182882 | 0;
          this.outputLen = 32;
        }
      };
      exports.SHA512_256 = SHA512_256;
      var SHA384 = class extends SHA512 {
        constructor() {
          super();
          this.Ah = 3418070365 | 0;
          this.Al = 3238371032 | 0;
          this.Bh = 1654270250 | 0;
          this.Bl = 914150663 | 0;
          this.Ch = 2438529370 | 0;
          this.Cl = 812702999 | 0;
          this.Dh = 355462360 | 0;
          this.Dl = 4144912697 | 0;
          this.Eh = 1731405415 | 0;
          this.El = 4290775857 | 0;
          this.Fh = 2394180231 | 0;
          this.Fl = 1750603025 | 0;
          this.Gh = 3675008525 | 0;
          this.Gl = 1694076839 | 0;
          this.Hh = 1203062813 | 0;
          this.Hl = 3204075428 | 0;
          this.outputLen = 48;
        }
      };
      exports.SHA384 = SHA384;
      exports.sha512 = (0, utils_js_1.wrapConstructor)(() => new SHA512());
      exports.sha512_224 = (0, utils_js_1.wrapConstructor)(() => new SHA512_224());
      exports.sha512_256 = (0, utils_js_1.wrapConstructor)(() => new SHA512_256());
      exports.sha384 = (0, utils_js_1.wrapConstructor)(() => new SHA384());
    }
  });

  // ../../../@scure/base/lib/index.js
  var require_lib = __commonJS({
    "../../../@scure/base/lib/index.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.bytes = exports.stringToBytes = exports.str = exports.bytesToString = exports.hex = exports.utf8 = exports.bech32m = exports.bech32 = exports.base58check = exports.createBase58check = exports.base58xmr = exports.base58xrp = exports.base58flickr = exports.base58 = exports.base64urlnopad = exports.base64url = exports.base64nopad = exports.base64 = exports.base32crockford = exports.base32hexnopad = exports.base32hex = exports.base32nopad = exports.base32 = exports.base16 = exports.utils = void 0;
      exports.assertNumber = assertNumber2;
      function assertNumber2(n) {
        if (!Number.isSafeInteger(n))
          throw new Error(`Wrong integer: ${n}`);
      }
      function isBytes4(a) {
        return a instanceof Uint8Array || a != null && typeof a === "object" && a.constructor.name === "Uint8Array";
      }
      function chain2(...args) {
        const id = (a) => a;
        const wrap = (a, b) => (c) => a(b(c));
        const encode = args.map((x) => x.encode).reduceRight(wrap, id);
        const decode = args.map((x) => x.decode).reduce(wrap, id);
        return { encode, decode };
      }
      function alphabet2(alphabet3) {
        return {
          encode: (digits) => {
            if (!Array.isArray(digits) || digits.length && typeof digits[0] !== "number")
              throw new Error("alphabet.encode input should be an array of numbers");
            return digits.map((i) => {
              assertNumber2(i);
              if (i < 0 || i >= alphabet3.length)
                throw new Error(`Digit index outside alphabet: ${i} (alphabet: ${alphabet3.length})`);
              return alphabet3[i];
            });
          },
          decode: (input) => {
            if (!Array.isArray(input) || input.length && typeof input[0] !== "string")
              throw new Error("alphabet.decode input should be array of strings");
            return input.map((letter) => {
              if (typeof letter !== "string")
                throw new Error(`alphabet.decode: not string element=${letter}`);
              const index = alphabet3.indexOf(letter);
              if (index === -1)
                throw new Error(`Unknown letter: "${letter}". Allowed: ${alphabet3}`);
              return index;
            });
          }
        };
      }
      function join2(separator = "") {
        if (typeof separator !== "string")
          throw new Error("join separator should be string");
        return {
          encode: (from) => {
            if (!Array.isArray(from) || from.length && typeof from[0] !== "string")
              throw new Error("join.encode input should be array of strings");
            for (let i of from)
              if (typeof i !== "string")
                throw new Error(`join.encode: non-string input=${i}`);
            return from.join(separator);
          },
          decode: (to) => {
            if (typeof to !== "string")
              throw new Error("join.decode input should be string");
            return to.split(separator);
          }
        };
      }
      function padding2(bits, chr = "=") {
        assertNumber2(bits);
        if (typeof chr !== "string")
          throw new Error("padding chr should be string");
        return {
          encode(data) {
            if (!Array.isArray(data) || data.length && typeof data[0] !== "string")
              throw new Error("padding.encode input should be array of strings");
            for (let i of data)
              if (typeof i !== "string")
                throw new Error(`padding.encode: non-string input=${i}`);
            while (data.length * bits % 8)
              data.push(chr);
            return data;
          },
          decode(input) {
            if (!Array.isArray(input) || input.length && typeof input[0] !== "string")
              throw new Error("padding.encode input should be array of strings");
            for (let i of input)
              if (typeof i !== "string")
                throw new Error(`padding.decode: non-string input=${i}`);
            let end = input.length;
            if (end * bits % 8)
              throw new Error("Invalid padding: string should have whole number of bytes");
            for (; end > 0 && input[end - 1] === chr; end--) {
              if (!((end - 1) * bits % 8))
                throw new Error("Invalid padding: string has too much padding");
            }
            return input.slice(0, end);
          }
        };
      }
      function normalize3(fn) {
        if (typeof fn !== "function")
          throw new Error("normalize fn should be function");
        return { encode: (from) => from, decode: (to) => fn(to) };
      }
      function convertRadix3(data, from, to) {
        if (from < 2)
          throw new Error(`convertRadix: wrong from=${from}, base cannot be less than 2`);
        if (to < 2)
          throw new Error(`convertRadix: wrong to=${to}, base cannot be less than 2`);
        if (!Array.isArray(data))
          throw new Error("convertRadix: data should be array");
        if (!data.length)
          return [];
        let pos = 0;
        const res = [];
        const digits = Array.from(data);
        digits.forEach((d) => {
          assertNumber2(d);
          if (d < 0 || d >= from)
            throw new Error(`Wrong integer: ${d}`);
        });
        while (true) {
          let carry = 0;
          let done = true;
          for (let i = pos; i < digits.length; i++) {
            const digit = digits[i];
            const digitBase = from * carry + digit;
            if (!Number.isSafeInteger(digitBase) || from * carry / from !== carry || digitBase - digit !== from * carry) {
              throw new Error("convertRadix: carry overflow");
            }
            carry = digitBase % to;
            const rounded = Math.floor(digitBase / to);
            digits[i] = rounded;
            if (!Number.isSafeInteger(rounded) || rounded * to + carry !== digitBase)
              throw new Error("convertRadix: carry overflow");
            if (!done)
              continue;
            else if (!rounded)
              pos = i;
            else
              done = false;
          }
          res.push(carry);
          if (done)
            break;
        }
        for (let i = 0; i < data.length - 1 && data[i] === 0; i++)
          res.push(0);
        return res.reverse();
      }
      var gcd2 = (
        /* @__NO_SIDE_EFFECTS__ */
        (a, b) => !b ? a : gcd2(b, a % b)
      );
      var radix2carry2 = (
        /*@__NO_SIDE_EFFECTS__ */
        (from, to) => from + (to - gcd2(from, to))
      );
      function convertRadix22(data, from, to, padding3) {
        if (!Array.isArray(data))
          throw new Error("convertRadix2: data should be array");
        if (from <= 0 || from > 32)
          throw new Error(`convertRadix2: wrong from=${from}`);
        if (to <= 0 || to > 32)
          throw new Error(`convertRadix2: wrong to=${to}`);
        if (radix2carry2(from, to) > 32) {
          throw new Error(`convertRadix2: carry overflow from=${from} to=${to} carryBits=${radix2carry2(from, to)}`);
        }
        let carry = 0;
        let pos = 0;
        const mask = 2 ** to - 1;
        const res = [];
        for (const n of data) {
          assertNumber2(n);
          if (n >= 2 ** from)
            throw new Error(`convertRadix2: invalid data word=${n} from=${from}`);
          carry = carry << from | n;
          if (pos + from > 32)
            throw new Error(`convertRadix2: carry overflow pos=${pos} from=${from}`);
          pos += from;
          for (; pos >= to; pos -= to)
            res.push((carry >> pos - to & mask) >>> 0);
          carry &= 2 ** pos - 1;
        }
        carry = carry << to - pos & mask;
        if (!padding3 && pos >= from)
          throw new Error("Excess padding");
        if (!padding3 && carry)
          throw new Error(`Non-zero padding: ${carry}`);
        if (padding3 && pos > 0)
          res.push(carry >>> 0);
        return res;
      }
      function radix3(num) {
        assertNumber2(num);
        return {
          encode: (bytes2) => {
            if (!isBytes4(bytes2))
              throw new Error("radix.encode input should be Uint8Array");
            return convertRadix3(Array.from(bytes2), 2 ** 8, num);
          },
          decode: (digits) => {
            if (!Array.isArray(digits) || digits.length && typeof digits[0] !== "number")
              throw new Error("radix.decode input should be array of numbers");
            return Uint8Array.from(convertRadix3(digits, num, 2 ** 8));
          }
        };
      }
      function radix22(bits, revPadding = false) {
        assertNumber2(bits);
        if (bits <= 0 || bits > 32)
          throw new Error("radix2: bits should be in (0..32]");
        if (radix2carry2(8, bits) > 32 || radix2carry2(bits, 8) > 32)
          throw new Error("radix2: carry overflow");
        return {
          encode: (bytes2) => {
            if (!isBytes4(bytes2))
              throw new Error("radix2.encode input should be Uint8Array");
            return convertRadix22(Array.from(bytes2), 8, bits, !revPadding);
          },
          decode: (digits) => {
            if (!Array.isArray(digits) || digits.length && typeof digits[0] !== "number")
              throw new Error("radix2.decode input should be array of numbers");
            return Uint8Array.from(convertRadix22(digits, bits, 8, revPadding));
          }
        };
      }
      function unsafeWrapper(fn) {
        if (typeof fn !== "function")
          throw new Error("unsafeWrapper fn should be function");
        return function(...args) {
          try {
            return fn.apply(null, args);
          } catch (e) {
          }
        };
      }
      function checksum2(len, fn) {
        assertNumber2(len);
        if (typeof fn !== "function")
          throw new Error("checksum fn should be function");
        return {
          encode(data) {
            if (!isBytes4(data))
              throw new Error("checksum.encode: input should be Uint8Array");
            const checksum3 = fn(data).slice(0, len);
            const res = new Uint8Array(data.length + len);
            res.set(data);
            res.set(checksum3, data.length);
            return res;
          },
          decode(data) {
            if (!isBytes4(data))
              throw new Error("checksum.decode: input should be Uint8Array");
            const payload = data.slice(0, -len);
            const newChecksum = fn(payload).slice(0, len);
            const oldChecksum = data.slice(-len);
            for (let i = 0; i < len; i++)
              if (newChecksum[i] !== oldChecksum[i])
                throw new Error("Invalid checksum");
            return payload;
          }
        };
      }
      exports.utils = {
        alphabet: alphabet2,
        chain: chain2,
        checksum: checksum2,
        convertRadix: convertRadix3,
        convertRadix2: convertRadix22,
        radix: radix3,
        radix2: radix22,
        join: join2,
        padding: padding2
      };
      exports.base16 = chain2(radix22(4), alphabet2("0123456789ABCDEF"), join2(""));
      exports.base32 = chain2(radix22(5), alphabet2("ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"), padding2(5), join2(""));
      exports.base32nopad = chain2(radix22(5), alphabet2("ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"), join2(""));
      exports.base32hex = chain2(radix22(5), alphabet2("0123456789ABCDEFGHIJKLMNOPQRSTUV"), padding2(5), join2(""));
      exports.base32hexnopad = chain2(radix22(5), alphabet2("0123456789ABCDEFGHIJKLMNOPQRSTUV"), join2(""));
      exports.base32crockford = chain2(radix22(5), alphabet2("0123456789ABCDEFGHJKMNPQRSTVWXYZ"), join2(""), normalize3((s) => s.toUpperCase().replace(/O/g, "0").replace(/[IL]/g, "1")));
      exports.base64 = chain2(radix22(6), alphabet2("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"), padding2(6), join2(""));
      exports.base64nopad = chain2(radix22(6), alphabet2("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"), join2(""));
      exports.base64url = chain2(radix22(6), alphabet2("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"), padding2(6), join2(""));
      exports.base64urlnopad = chain2(radix22(6), alphabet2("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"), join2(""));
      var genBase58 = (abc) => chain2(radix3(58), alphabet2(abc), join2(""));
      exports.base58 = genBase58("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz");
      exports.base58flickr = genBase58("123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ");
      exports.base58xrp = genBase58("rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz");
      var XMR_BLOCK_LEN = [0, 2, 3, 5, 6, 7, 9, 10, 11];
      exports.base58xmr = {
        encode(data) {
          let res = "";
          for (let i = 0; i < data.length; i += 8) {
            const block = data.subarray(i, i + 8);
            res += exports.base58.encode(block).padStart(XMR_BLOCK_LEN[block.length], "1");
          }
          return res;
        },
        decode(str) {
          let res = [];
          for (let i = 0; i < str.length; i += 11) {
            const slice = str.slice(i, i + 11);
            const blockLen = XMR_BLOCK_LEN.indexOf(slice.length);
            const block = exports.base58.decode(slice);
            for (let j = 0; j < block.length - blockLen; j++) {
              if (block[j] !== 0)
                throw new Error("base58xmr: wrong padding");
            }
            res = res.concat(Array.from(block.slice(block.length - blockLen)));
          }
          return Uint8Array.from(res);
        }
      };
      var createBase58check = (sha2562) => chain2(checksum2(4, (data) => sha2562(sha2562(data))), exports.base58);
      exports.createBase58check = createBase58check;
      exports.base58check = exports.createBase58check;
      var BECH_ALPHABET2 = /* @__PURE__ */ chain2(alphabet2("qpzry9x8gf2tvdw0s3jn54khce6mua7l"), join2(""));
      var POLYMOD_GENERATORS = [996825010, 642813549, 513874426, 1027748829, 705979059];
      function bech32Polymod(pre) {
        const b = pre >> 25;
        let chk = (pre & 33554431) << 5;
        for (let i = 0; i < POLYMOD_GENERATORS.length; i++) {
          if ((b >> i & 1) === 1)
            chk ^= POLYMOD_GENERATORS[i];
        }
        return chk;
      }
      function bechChecksum(prefix, words, encodingConst = 1) {
        const len = prefix.length;
        let chk = 1;
        for (let i = 0; i < len; i++) {
          const c = prefix.charCodeAt(i);
          if (c < 33 || c > 126)
            throw new Error(`Invalid prefix (${prefix})`);
          chk = bech32Polymod(chk) ^ c >> 5;
        }
        chk = bech32Polymod(chk);
        for (let i = 0; i < len; i++)
          chk = bech32Polymod(chk) ^ prefix.charCodeAt(i) & 31;
        for (let v of words)
          chk = bech32Polymod(chk) ^ v;
        for (let i = 0; i < 6; i++)
          chk = bech32Polymod(chk);
        chk ^= encodingConst;
        return BECH_ALPHABET2.encode(convertRadix22([chk % 2 ** 30], 30, 5, false));
      }
      function genBech32(encoding) {
        const ENCODING_CONST = encoding === "bech32" ? 1 : 734539939;
        const _words = radix22(5);
        const fromWords = _words.decode;
        const toWords = _words.encode;
        const fromWordsUnsafe = unsafeWrapper(fromWords);
        function encode(prefix, words, limit = 90) {
          if (typeof prefix !== "string")
            throw new Error(`bech32.encode prefix should be string, not ${typeof prefix}`);
          if (words instanceof Uint8Array)
            words = Array.from(words);
          if (!Array.isArray(words) || words.length && typeof words[0] !== "number")
            throw new Error(`bech32.encode words should be array of numbers, not ${typeof words}`);
          if (prefix.length === 0)
            throw new TypeError(`Invalid prefix length ${prefix.length}`);
          const actualLength = prefix.length + 7 + words.length;
          if (limit !== false && actualLength > limit)
            throw new TypeError(`Length ${actualLength} exceeds limit ${limit}`);
          const lowered = prefix.toLowerCase();
          const sum = bechChecksum(lowered, words, ENCODING_CONST);
          return `${lowered}1${BECH_ALPHABET2.encode(words)}${sum}`;
        }
        function decode(str, limit = 90) {
          if (typeof str !== "string")
            throw new Error(`bech32.decode input should be string, not ${typeof str}`);
          if (str.length < 8 || limit !== false && str.length > limit)
            throw new TypeError(`Wrong string length: ${str.length} (${str}). Expected (8..${limit})`);
          const lowered = str.toLowerCase();
          if (str !== lowered && str !== str.toUpperCase())
            throw new Error(`String must be lowercase or uppercase`);
          const sepIndex = lowered.lastIndexOf("1");
          if (sepIndex === 0 || sepIndex === -1)
            throw new Error(`Letter "1" must be present between prefix and data only`);
          const prefix = lowered.slice(0, sepIndex);
          const data = lowered.slice(sepIndex + 1);
          if (data.length < 6)
            throw new Error("Data must be at least 6 characters long");
          const words = BECH_ALPHABET2.decode(data).slice(0, -6);
          const sum = bechChecksum(prefix, words, ENCODING_CONST);
          if (!data.endsWith(sum))
            throw new Error(`Invalid checksum in ${str}: expected "${sum}"`);
          return { prefix, words };
        }
        const decodeUnsafe = unsafeWrapper(decode);
        function decodeToBytes(str) {
          const { prefix, words } = decode(str, false);
          return { prefix, words, bytes: fromWords(words) };
        }
        function encodeFromBytes(prefix, bytes2) {
          return encode(prefix, toWords(bytes2));
        }
        return {
          encode,
          decode,
          encodeFromBytes,
          decodeToBytes,
          decodeUnsafe,
          fromWords,
          fromWordsUnsafe,
          toWords
        };
      }
      exports.bech32 = genBech32("bech32");
      exports.bech32m = genBech32("bech32m");
      exports.utf8 = {
        encode: (data) => new TextDecoder().decode(data),
        decode: (str) => new TextEncoder().encode(str)
      };
      exports.hex = chain2(radix22(4), alphabet2("0123456789abcdef"), join2(""), normalize3((s) => {
        if (typeof s !== "string" || s.length % 2)
          throw new TypeError(`hex.decode: expected string, got ${typeof s} with length ${s.length}`);
        return s.toLowerCase();
      }));
      var CODERS = {
        utf8: exports.utf8,
        hex: exports.hex,
        base16: exports.base16,
        base32: exports.base32,
        base64: exports.base64,
        base64url: exports.base64url,
        base58: exports.base58,
        base58xmr: exports.base58xmr
      };
      var coderTypeError = "Invalid encoding type. Available types: utf8, hex, base16, base32, base64, base64url, base58, base58xmr";
      var bytesToString = (type, bytes2) => {
        if (typeof type !== "string" || !CODERS.hasOwnProperty(type))
          throw new TypeError(coderTypeError);
        if (!isBytes4(bytes2))
          throw new TypeError("bytesToString() expects Uint8Array");
        return CODERS[type].encode(bytes2);
      };
      exports.bytesToString = bytesToString;
      exports.str = exports.bytesToString;
      var stringToBytes = (type, str) => {
        if (!CODERS.hasOwnProperty(type))
          throw new TypeError(coderTypeError);
        if (typeof str !== "string")
          throw new TypeError("stringToBytes() expects string");
        return CODERS[type].decode(str);
      };
      exports.stringToBytes = stringToBytes;
      exports.bytes = exports.stringToBytes;
    }
  });

  // ../../../@scure/bip32/lib/index.js
  var require_lib2 = __commonJS({
    "../../../@scure/bip32/lib/index.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.HDKey = exports.HARDENED_OFFSET = void 0;
      var hmac_1 = require_hmac();
      var ripemd160_1 = require_ripemd160();
      var sha256_1 = require_sha256();
      var sha512_1 = require_sha512();
      var _assert_1 = require_assert();
      var utils_1 = require_utils();
      var secp256k1_1 = require_secp256k1();
      var modular_1 = require_modular();
      var base_1 = require_lib();
      var Point = secp256k1_1.secp256k1.ProjectivePoint;
      var base58check = (0, base_1.createBase58check)(sha256_1.sha256);
      function bytesToNumber2(bytes2) {
        return BigInt(`0x${(0, utils_1.bytesToHex)(bytes2)}`);
      }
      function numberToBytes(num) {
        return (0, utils_1.hexToBytes)(num.toString(16).padStart(64, "0"));
      }
      var MASTER_SECRET = (0, utils_1.utf8ToBytes)("Bitcoin seed");
      var BITCOIN_VERSIONS = { private: 76066276, public: 76067358 };
      exports.HARDENED_OFFSET = 2147483648;
      var hash160 = (data) => (0, ripemd160_1.ripemd160)((0, sha256_1.sha256)(data));
      var fromU32 = (data) => (0, utils_1.createView)(data).getUint32(0, false);
      var toU32 = (n) => {
        if (!Number.isSafeInteger(n) || n < 0 || n > 2 ** 32 - 1) {
          throw new Error(`Invalid number=${n}. Should be from 0 to 2 ** 32 - 1`);
        }
        const buf = new Uint8Array(4);
        (0, utils_1.createView)(buf).setUint32(0, n, false);
        return buf;
      };
      var HDKey = class {
        get fingerprint() {
          if (!this.pubHash) {
            throw new Error("No publicKey set!");
          }
          return fromU32(this.pubHash);
        }
        get identifier() {
          return this.pubHash;
        }
        get pubKeyHash() {
          return this.pubHash;
        }
        get privateKey() {
          return this.privKeyBytes || null;
        }
        get publicKey() {
          return this.pubKey || null;
        }
        get privateExtendedKey() {
          const priv = this.privateKey;
          if (!priv) {
            throw new Error("No private key");
          }
          return base58check.encode(this.serialize(this.versions.private, (0, utils_1.concatBytes)(new Uint8Array([0]), priv)));
        }
        get publicExtendedKey() {
          if (!this.pubKey) {
            throw new Error("No public key");
          }
          return base58check.encode(this.serialize(this.versions.public, this.pubKey));
        }
        static fromMasterSeed(seed, versions = BITCOIN_VERSIONS) {
          (0, _assert_1.bytes)(seed);
          if (8 * seed.length < 128 || 8 * seed.length > 512) {
            throw new Error(`HDKey: wrong seed length=${seed.length}. Should be between 128 and 512 bits; 256 bits is advised)`);
          }
          const I = (0, hmac_1.hmac)(sha512_1.sha512, MASTER_SECRET, seed);
          return new HDKey({
            versions,
            chainCode: I.slice(32),
            privateKey: I.slice(0, 32)
          });
        }
        static fromExtendedKey(base58key, versions = BITCOIN_VERSIONS) {
          const keyBuffer = base58check.decode(base58key);
          const keyView = (0, utils_1.createView)(keyBuffer);
          const version = keyView.getUint32(0, false);
          const opt = {
            versions,
            depth: keyBuffer[4],
            parentFingerprint: keyView.getUint32(5, false),
            index: keyView.getUint32(9, false),
            chainCode: keyBuffer.slice(13, 45)
          };
          const key = keyBuffer.slice(45);
          const isPriv = key[0] === 0;
          if (version !== versions[isPriv ? "private" : "public"]) {
            throw new Error("Version mismatch");
          }
          if (isPriv) {
            return new HDKey({ ...opt, privateKey: key.slice(1) });
          } else {
            return new HDKey({ ...opt, publicKey: key });
          }
        }
        static fromJSON(json) {
          return HDKey.fromExtendedKey(json.xpriv);
        }
        constructor(opt) {
          this.depth = 0;
          this.index = 0;
          this.chainCode = null;
          this.parentFingerprint = 0;
          if (!opt || typeof opt !== "object") {
            throw new Error("HDKey.constructor must not be called directly");
          }
          this.versions = opt.versions || BITCOIN_VERSIONS;
          this.depth = opt.depth || 0;
          this.chainCode = opt.chainCode || null;
          this.index = opt.index || 0;
          this.parentFingerprint = opt.parentFingerprint || 0;
          if (!this.depth) {
            if (this.parentFingerprint || this.index) {
              throw new Error("HDKey: zero depth with non-zero index/parent fingerprint");
            }
          }
          if (opt.publicKey && opt.privateKey) {
            throw new Error("HDKey: publicKey and privateKey at same time.");
          }
          if (opt.privateKey) {
            if (!secp256k1_1.secp256k1.utils.isValidPrivateKey(opt.privateKey)) {
              throw new Error("Invalid private key");
            }
            this.privKey = typeof opt.privateKey === "bigint" ? opt.privateKey : bytesToNumber2(opt.privateKey);
            this.privKeyBytes = numberToBytes(this.privKey);
            this.pubKey = secp256k1_1.secp256k1.getPublicKey(opt.privateKey, true);
          } else if (opt.publicKey) {
            this.pubKey = Point.fromHex(opt.publicKey).toRawBytes(true);
          } else {
            throw new Error("HDKey: no public or private key provided");
          }
          this.pubHash = hash160(this.pubKey);
        }
        derive(path) {
          if (!/^[mM]'?/.test(path)) {
            throw new Error('Path must start with "m" or "M"');
          }
          if (/^[mM]'?$/.test(path)) {
            return this;
          }
          const parts = path.replace(/^[mM]'?\//, "").split("/");
          let child = this;
          for (const c of parts) {
            const m = /^(\d+)('?)$/.exec(c);
            const m1 = m && m[1];
            if (!m || m.length !== 3 || typeof m1 !== "string") {
              throw new Error(`Invalid child index: ${c}`);
            }
            let idx = +m1;
            if (!Number.isSafeInteger(idx) || idx >= exports.HARDENED_OFFSET) {
              throw new Error("Invalid index");
            }
            if (m[2] === "'") {
              idx += exports.HARDENED_OFFSET;
            }
            child = child.deriveChild(idx);
          }
          return child;
        }
        deriveChild(index) {
          if (!this.pubKey || !this.chainCode) {
            throw new Error("No publicKey or chainCode set");
          }
          let data = toU32(index);
          if (index >= exports.HARDENED_OFFSET) {
            const priv = this.privateKey;
            if (!priv) {
              throw new Error("Could not derive hardened child key");
            }
            data = (0, utils_1.concatBytes)(new Uint8Array([0]), priv, data);
          } else {
            data = (0, utils_1.concatBytes)(this.pubKey, data);
          }
          const I = (0, hmac_1.hmac)(sha512_1.sha512, this.chainCode, data);
          const childTweak = bytesToNumber2(I.slice(0, 32));
          const chainCode = I.slice(32);
          if (!secp256k1_1.secp256k1.utils.isValidPrivateKey(childTweak)) {
            throw new Error("Tweak bigger than curve order");
          }
          const opt = {
            versions: this.versions,
            chainCode,
            depth: this.depth + 1,
            parentFingerprint: this.fingerprint,
            index
          };
          try {
            if (this.privateKey) {
              const added = (0, modular_1.mod)(this.privKey + childTweak, secp256k1_1.secp256k1.CURVE.n);
              if (!secp256k1_1.secp256k1.utils.isValidPrivateKey(added)) {
                throw new Error("The tweak was out of range or the resulted private key is invalid");
              }
              opt.privateKey = added;
            } else {
              const added = Point.fromHex(this.pubKey).add(Point.fromPrivateKey(childTweak));
              if (added.equals(Point.ZERO)) {
                throw new Error("The tweak was equal to negative P, which made the result key invalid");
              }
              opt.publicKey = added.toRawBytes(true);
            }
            return new HDKey(opt);
          } catch (err) {
            return this.deriveChild(index + 1);
          }
        }
        sign(hash) {
          if (!this.privateKey) {
            throw new Error("No privateKey set!");
          }
          (0, _assert_1.bytes)(hash, 32);
          return secp256k1_1.secp256k1.sign(hash, this.privKey).toCompactRawBytes();
        }
        verify(hash, signature) {
          (0, _assert_1.bytes)(hash, 32);
          (0, _assert_1.bytes)(signature, 64);
          if (!this.publicKey) {
            throw new Error("No publicKey set!");
          }
          let sig;
          try {
            sig = secp256k1_1.secp256k1.Signature.fromCompact(signature);
          } catch (error) {
            return false;
          }
          return secp256k1_1.secp256k1.verify(sig, hash, this.publicKey);
        }
        wipePrivateData() {
          this.privKey = void 0;
          if (this.privKeyBytes) {
            this.privKeyBytes.fill(0);
            this.privKeyBytes = void 0;
          }
          return this;
        }
        toJSON() {
          return {
            xpriv: this.privateExtendedKey,
            xpub: this.publicExtendedKey
          };
        }
        serialize(version, key) {
          if (!this.chainCode) {
            throw new Error("No chainCode set");
          }
          (0, _assert_1.bytes)(key, 33);
          return (0, utils_1.concatBytes)(toU32(version), new Uint8Array([this.depth]), toU32(this.parentFingerprint), toU32(this.index), this.chainCode, key);
        }
      };
      exports.HDKey = HDKey;
    }
  });

  // ../../../@noble/hashes/pbkdf2.js
  var require_pbkdf2 = __commonJS({
    "../../../@noble/hashes/pbkdf2.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.pbkdf2 = pbkdf2;
      exports.pbkdf2Async = pbkdf2Async;
      var _assert_js_1 = require_assert();
      var hmac_js_1 = require_hmac();
      var utils_js_1 = require_utils();
      function pbkdf2Init(hash, _password, _salt, _opts) {
        (0, _assert_js_1.hash)(hash);
        const opts = (0, utils_js_1.checkOpts)({ dkLen: 32, asyncTick: 10 }, _opts);
        const { c, dkLen, asyncTick } = opts;
        (0, _assert_js_1.number)(c);
        (0, _assert_js_1.number)(dkLen);
        (0, _assert_js_1.number)(asyncTick);
        if (c < 1)
          throw new Error("PBKDF2: iterations (c) should be >= 1");
        const password = (0, utils_js_1.toBytes)(_password);
        const salt = (0, utils_js_1.toBytes)(_salt);
        const DK = new Uint8Array(dkLen);
        const PRF = hmac_js_1.hmac.create(hash, password);
        const PRFSalt = PRF._cloneInto().update(salt);
        return { c, dkLen, asyncTick, DK, PRF, PRFSalt };
      }
      function pbkdf2Output(PRF, PRFSalt, DK, prfW, u) {
        PRF.destroy();
        PRFSalt.destroy();
        if (prfW)
          prfW.destroy();
        u.fill(0);
        return DK;
      }
      function pbkdf2(hash, password, salt, opts) {
        const { c, dkLen, DK, PRF, PRFSalt } = pbkdf2Init(hash, password, salt, opts);
        let prfW;
        const arr = new Uint8Array(4);
        const view = (0, utils_js_1.createView)(arr);
        const u = new Uint8Array(PRF.outputLen);
        for (let ti = 1, pos = 0; pos < dkLen; ti++, pos += PRF.outputLen) {
          const Ti = DK.subarray(pos, pos + PRF.outputLen);
          view.setInt32(0, ti, false);
          (prfW = PRFSalt._cloneInto(prfW)).update(arr).digestInto(u);
          Ti.set(u.subarray(0, Ti.length));
          for (let ui = 1; ui < c; ui++) {
            PRF._cloneInto(prfW).update(u).digestInto(u);
            for (let i = 0; i < Ti.length; i++)
              Ti[i] ^= u[i];
          }
        }
        return pbkdf2Output(PRF, PRFSalt, DK, prfW, u);
      }
      async function pbkdf2Async(hash, password, salt, opts) {
        const { c, dkLen, asyncTick, DK, PRF, PRFSalt } = pbkdf2Init(hash, password, salt, opts);
        let prfW;
        const arr = new Uint8Array(4);
        const view = (0, utils_js_1.createView)(arr);
        const u = new Uint8Array(PRF.outputLen);
        for (let ti = 1, pos = 0; pos < dkLen; ti++, pos += PRF.outputLen) {
          const Ti = DK.subarray(pos, pos + PRF.outputLen);
          view.setInt32(0, ti, false);
          (prfW = PRFSalt._cloneInto(prfW)).update(arr).digestInto(u);
          Ti.set(u.subarray(0, Ti.length));
          await (0, utils_js_1.asyncLoop)(c - 1, asyncTick, () => {
            PRF._cloneInto(prfW).update(u).digestInto(u);
            for (let i = 0; i < Ti.length; i++)
              Ti[i] ^= u[i];
          });
        }
        return pbkdf2Output(PRF, PRFSalt, DK, prfW, u);
      }
    }
  });

  // ../../../@scure/bip39/index.js
  var require_bip39 = __commonJS({
    "../../../@scure/bip39/index.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.generateMnemonic = generateMnemonic;
      exports.mnemonicToEntropy = mnemonicToEntropy2;
      exports.entropyToMnemonic = entropyToMnemonic;
      exports.validateMnemonic = validateMnemonic2;
      exports.mnemonicToSeed = mnemonicToSeed;
      exports.mnemonicToSeedSync = mnemonicToSeedSync;
      var _assert_1 = require_assert();
      var pbkdf2_1 = require_pbkdf2();
      var sha256_1 = require_sha256();
      var sha512_1 = require_sha512();
      var utils_1 = require_utils();
      var base_1 = require_lib();
      var isJapanese = (wordlist2) => wordlist2[0] === "\u3042\u3044\u3053\u304F\u3057\u3093";
      function nfkd2(str) {
        if (typeof str !== "string")
          throw new TypeError(`Invalid mnemonic type: ${typeof str}`);
        return str.normalize("NFKD");
      }
      function normalize3(str) {
        const norm = nfkd2(str);
        const words = norm.split(" ");
        if (![12, 15, 18, 21, 24].includes(words.length))
          throw new Error("Invalid mnemonic");
        return { nfkd: norm, words };
      }
      function assertEntropy2(entropy) {
        (0, _assert_1.bytes)(entropy, 16, 20, 24, 28, 32);
      }
      function generateMnemonic(wordlist2, strength = 128) {
        (0, _assert_1.number)(strength);
        if (strength % 32 !== 0 || strength > 256)
          throw new TypeError("Invalid entropy");
        return entropyToMnemonic((0, utils_1.randomBytes)(strength / 8), wordlist2);
      }
      var calcChecksum2 = (entropy) => {
        const bitsLeft = 8 - entropy.length / 4;
        return new Uint8Array([(0, sha256_1.sha256)(entropy)[0] >> bitsLeft << bitsLeft]);
      };
      function getCoder2(wordlist2) {
        if (!Array.isArray(wordlist2) || wordlist2.length !== 2048 || typeof wordlist2[0] !== "string")
          throw new Error("Wordlist: expected array of 2048 strings");
        wordlist2.forEach((i) => {
          if (typeof i !== "string")
            throw new Error(`Wordlist: non-string element: ${i}`);
        });
        return base_1.utils.chain(base_1.utils.checksum(1, calcChecksum2), base_1.utils.radix2(11, true), base_1.utils.alphabet(wordlist2));
      }
      function mnemonicToEntropy2(mnemonic, wordlist2) {
        const { words } = normalize3(mnemonic);
        const entropy = getCoder2(wordlist2).decode(words);
        assertEntropy2(entropy);
        return entropy;
      }
      function entropyToMnemonic(entropy, wordlist2) {
        assertEntropy2(entropy);
        const words = getCoder2(wordlist2).encode(entropy);
        return words.join(isJapanese(wordlist2) ? "\u3000" : " ");
      }
      function validateMnemonic2(mnemonic, wordlist2) {
        try {
          mnemonicToEntropy2(mnemonic, wordlist2);
        } catch (e) {
          return false;
        }
        return true;
      }
      var salt = (passphrase) => nfkd2(`mnemonic${passphrase}`);
      function mnemonicToSeed(mnemonic, passphrase = "") {
        return (0, pbkdf2_1.pbkdf2Async)(sha512_1.sha512, normalize3(mnemonic).nfkd, salt(passphrase), { c: 2048, dkLen: 64 });
      }
      function mnemonicToSeedSync(mnemonic, passphrase = "") {
        return (0, pbkdf2_1.pbkdf2)(sha512_1.sha512, normalize3(mnemonic).nfkd, salt(passphrase), { c: 2048, dkLen: 64 });
      }
    }
  });

  // ../../../@scure/bip39/wordlists/english.js
  var require_english = __commonJS({
    "../../../@scure/bip39/wordlists/english.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.wordlist = void 0;
      exports.wordlist = `abandon
ability
able
about
above
absent
absorb
abstract
absurd
abuse
access
accident
account
accuse
achieve
acid
acoustic
acquire
across
act
action
actor
actress
actual
adapt
add
addict
address
adjust
admit
adult
advance
advice
aerobic
affair
afford
afraid
again
age
agent
agree
ahead
aim
air
airport
aisle
alarm
album
alcohol
alert
alien
all
alley
allow
almost
alone
alpha
already
also
alter
always
amateur
amazing
among
amount
amused
analyst
anchor
ancient
anger
angle
angry
animal
ankle
announce
annual
another
answer
antenna
antique
anxiety
any
apart
apology
appear
apple
approve
april
arch
arctic
area
arena
argue
arm
armed
armor
army
around
arrange
arrest
arrive
arrow
art
artefact
artist
artwork
ask
aspect
assault
asset
assist
assume
asthma
athlete
atom
attack
attend
attitude
attract
auction
audit
august
aunt
author
auto
autumn
average
avocado
avoid
awake
aware
away
awesome
awful
awkward
axis
baby
bachelor
bacon
badge
bag
balance
balcony
ball
bamboo
banana
banner
bar
barely
bargain
barrel
base
basic
basket
battle
beach
bean
beauty
because
become
beef
before
begin
behave
behind
believe
below
belt
bench
benefit
best
betray
better
between
beyond
bicycle
bid
bike
bind
biology
bird
birth
bitter
black
blade
blame
blanket
blast
bleak
bless
blind
blood
blossom
blouse
blue
blur
blush
board
boat
body
boil
bomb
bone
bonus
book
boost
border
boring
borrow
boss
bottom
bounce
box
boy
bracket
brain
brand
brass
brave
bread
breeze
brick
bridge
brief
bright
bring
brisk
broccoli
broken
bronze
broom
brother
brown
brush
bubble
buddy
budget
buffalo
build
bulb
bulk
bullet
bundle
bunker
burden
burger
burst
bus
business
busy
butter
buyer
buzz
cabbage
cabin
cable
cactus
cage
cake
call
calm
camera
camp
can
canal
cancel
candy
cannon
canoe
canvas
canyon
capable
capital
captain
car
carbon
card
cargo
carpet
carry
cart
case
cash
casino
castle
casual
cat
catalog
catch
category
cattle
caught
cause
caution
cave
ceiling
celery
cement
census
century
cereal
certain
chair
chalk
champion
change
chaos
chapter
charge
chase
chat
cheap
check
cheese
chef
cherry
chest
chicken
chief
child
chimney
choice
choose
chronic
chuckle
chunk
churn
cigar
cinnamon
circle
citizen
city
civil
claim
clap
clarify
claw
clay
clean
clerk
clever
click
client
cliff
climb
clinic
clip
clock
clog
close
cloth
cloud
clown
club
clump
cluster
clutch
coach
coast
coconut
code
coffee
coil
coin
collect
color
column
combine
come
comfort
comic
common
company
concert
conduct
confirm
congress
connect
consider
control
convince
cook
cool
copper
copy
coral
core
corn
correct
cost
cotton
couch
country
couple
course
cousin
cover
coyote
crack
cradle
craft
cram
crane
crash
crater
crawl
crazy
cream
credit
creek
crew
cricket
crime
crisp
critic
crop
cross
crouch
crowd
crucial
cruel
cruise
crumble
crunch
crush
cry
crystal
cube
culture
cup
cupboard
curious
current
curtain
curve
cushion
custom
cute
cycle
dad
damage
damp
dance
danger
daring
dash
daughter
dawn
day
deal
debate
debris
decade
december
decide
decline
decorate
decrease
deer
defense
define
defy
degree
delay
deliver
demand
demise
denial
dentist
deny
depart
depend
deposit
depth
deputy
derive
describe
desert
design
desk
despair
destroy
detail
detect
develop
device
devote
diagram
dial
diamond
diary
dice
diesel
diet
differ
digital
dignity
dilemma
dinner
dinosaur
direct
dirt
disagree
discover
disease
dish
dismiss
disorder
display
distance
divert
divide
divorce
dizzy
doctor
document
dog
doll
dolphin
domain
donate
donkey
donor
door
dose
double
dove
draft
dragon
drama
drastic
draw
dream
dress
drift
drill
drink
drip
drive
drop
drum
dry
duck
dumb
dune
during
dust
dutch
duty
dwarf
dynamic
eager
eagle
early
earn
earth
easily
east
easy
echo
ecology
economy
edge
edit
educate
effort
egg
eight
either
elbow
elder
electric
elegant
element
elephant
elevator
elite
else
embark
embody
embrace
emerge
emotion
employ
empower
empty
enable
enact
end
endless
endorse
enemy
energy
enforce
engage
engine
enhance
enjoy
enlist
enough
enrich
enroll
ensure
enter
entire
entry
envelope
episode
equal
equip
era
erase
erode
erosion
error
erupt
escape
essay
essence
estate
eternal
ethics
evidence
evil
evoke
evolve
exact
example
excess
exchange
excite
exclude
excuse
execute
exercise
exhaust
exhibit
exile
exist
exit
exotic
expand
expect
expire
explain
expose
express
extend
extra
eye
eyebrow
fabric
face
faculty
fade
faint
faith
fall
false
fame
family
famous
fan
fancy
fantasy
farm
fashion
fat
fatal
father
fatigue
fault
favorite
feature
february
federal
fee
feed
feel
female
fence
festival
fetch
fever
few
fiber
fiction
field
figure
file
film
filter
final
find
fine
finger
finish
fire
firm
first
fiscal
fish
fit
fitness
fix
flag
flame
flash
flat
flavor
flee
flight
flip
float
flock
floor
flower
fluid
flush
fly
foam
focus
fog
foil
fold
follow
food
foot
force
forest
forget
fork
fortune
forum
forward
fossil
foster
found
fox
fragile
frame
frequent
fresh
friend
fringe
frog
front
frost
frown
frozen
fruit
fuel
fun
funny
furnace
fury
future
gadget
gain
galaxy
gallery
game
gap
garage
garbage
garden
garlic
garment
gas
gasp
gate
gather
gauge
gaze
general
genius
genre
gentle
genuine
gesture
ghost
giant
gift
giggle
ginger
giraffe
girl
give
glad
glance
glare
glass
glide
glimpse
globe
gloom
glory
glove
glow
glue
goat
goddess
gold
good
goose
gorilla
gospel
gossip
govern
gown
grab
grace
grain
grant
grape
grass
gravity
great
green
grid
grief
grit
grocery
group
grow
grunt
guard
guess
guide
guilt
guitar
gun
gym
habit
hair
half
hammer
hamster
hand
happy
harbor
hard
harsh
harvest
hat
have
hawk
hazard
head
health
heart
heavy
hedgehog
height
hello
helmet
help
hen
hero
hidden
high
hill
hint
hip
hire
history
hobby
hockey
hold
hole
holiday
hollow
home
honey
hood
hope
horn
horror
horse
hospital
host
hotel
hour
hover
hub
huge
human
humble
humor
hundred
hungry
hunt
hurdle
hurry
hurt
husband
hybrid
ice
icon
idea
identify
idle
ignore
ill
illegal
illness
image
imitate
immense
immune
impact
impose
improve
impulse
inch
include
income
increase
index
indicate
indoor
industry
infant
inflict
inform
inhale
inherit
initial
inject
injury
inmate
inner
innocent
input
inquiry
insane
insect
inside
inspire
install
intact
interest
into
invest
invite
involve
iron
island
isolate
issue
item
ivory
jacket
jaguar
jar
jazz
jealous
jeans
jelly
jewel
job
join
joke
journey
joy
judge
juice
jump
jungle
junior
junk
just
kangaroo
keen
keep
ketchup
key
kick
kid
kidney
kind
kingdom
kiss
kit
kitchen
kite
kitten
kiwi
knee
knife
knock
know
lab
label
labor
ladder
lady
lake
lamp
language
laptop
large
later
latin
laugh
laundry
lava
law
lawn
lawsuit
layer
lazy
leader
leaf
learn
leave
lecture
left
leg
legal
legend
leisure
lemon
lend
length
lens
leopard
lesson
letter
level
liar
liberty
library
license
life
lift
light
like
limb
limit
link
lion
liquid
list
little
live
lizard
load
loan
lobster
local
lock
logic
lonely
long
loop
lottery
loud
lounge
love
loyal
lucky
luggage
lumber
lunar
lunch
luxury
lyrics
machine
mad
magic
magnet
maid
mail
main
major
make
mammal
man
manage
mandate
mango
mansion
manual
maple
marble
march
margin
marine
market
marriage
mask
mass
master
match
material
math
matrix
matter
maximum
maze
meadow
mean
measure
meat
mechanic
medal
media
melody
melt
member
memory
mention
menu
mercy
merge
merit
merry
mesh
message
metal
method
middle
midnight
milk
million
mimic
mind
minimum
minor
minute
miracle
mirror
misery
miss
mistake
mix
mixed
mixture
mobile
model
modify
mom
moment
monitor
monkey
monster
month
moon
moral
more
morning
mosquito
mother
motion
motor
mountain
mouse
move
movie
much
muffin
mule
multiply
muscle
museum
mushroom
music
must
mutual
myself
mystery
myth
naive
name
napkin
narrow
nasty
nation
nature
near
neck
need
negative
neglect
neither
nephew
nerve
nest
net
network
neutral
never
news
next
nice
night
noble
noise
nominee
noodle
normal
north
nose
notable
note
nothing
notice
novel
now
nuclear
number
nurse
nut
oak
obey
object
oblige
obscure
observe
obtain
obvious
occur
ocean
october
odor
off
offer
office
often
oil
okay
old
olive
olympic
omit
once
one
onion
online
only
open
opera
opinion
oppose
option
orange
orbit
orchard
order
ordinary
organ
orient
original
orphan
ostrich
other
outdoor
outer
output
outside
oval
oven
over
own
owner
oxygen
oyster
ozone
pact
paddle
page
pair
palace
palm
panda
panel
panic
panther
paper
parade
parent
park
parrot
party
pass
patch
path
patient
patrol
pattern
pause
pave
payment
peace
peanut
pear
peasant
pelican
pen
penalty
pencil
people
pepper
perfect
permit
person
pet
phone
photo
phrase
physical
piano
picnic
picture
piece
pig
pigeon
pill
pilot
pink
pioneer
pipe
pistol
pitch
pizza
place
planet
plastic
plate
play
please
pledge
pluck
plug
plunge
poem
poet
point
polar
pole
police
pond
pony
pool
popular
portion
position
possible
post
potato
pottery
poverty
powder
power
practice
praise
predict
prefer
prepare
present
pretty
prevent
price
pride
primary
print
priority
prison
private
prize
problem
process
produce
profit
program
project
promote
proof
property
prosper
protect
proud
provide
public
pudding
pull
pulp
pulse
pumpkin
punch
pupil
puppy
purchase
purity
purpose
purse
push
put
puzzle
pyramid
quality
quantum
quarter
question
quick
quit
quiz
quote
rabbit
raccoon
race
rack
radar
radio
rail
rain
raise
rally
ramp
ranch
random
range
rapid
rare
rate
rather
raven
raw
razor
ready
real
reason
rebel
rebuild
recall
receive
recipe
record
recycle
reduce
reflect
reform
refuse
region
regret
regular
reject
relax
release
relief
rely
remain
remember
remind
remove
render
renew
rent
reopen
repair
repeat
replace
report
require
rescue
resemble
resist
resource
response
result
retire
retreat
return
reunion
reveal
review
reward
rhythm
rib
ribbon
rice
rich
ride
ridge
rifle
right
rigid
ring
riot
ripple
risk
ritual
rival
river
road
roast
robot
robust
rocket
romance
roof
rookie
room
rose
rotate
rough
round
route
royal
rubber
rude
rug
rule
run
runway
rural
sad
saddle
sadness
safe
sail
salad
salmon
salon
salt
salute
same
sample
sand
satisfy
satoshi
sauce
sausage
save
say
scale
scan
scare
scatter
scene
scheme
school
science
scissors
scorpion
scout
scrap
screen
script
scrub
sea
search
season
seat
second
secret
section
security
seed
seek
segment
select
sell
seminar
senior
sense
sentence
series
service
session
settle
setup
seven
shadow
shaft
shallow
share
shed
shell
sheriff
shield
shift
shine
ship
shiver
shock
shoe
shoot
shop
short
shoulder
shove
shrimp
shrug
shuffle
shy
sibling
sick
side
siege
sight
sign
silent
silk
silly
silver
similar
simple
since
sing
siren
sister
situate
six
size
skate
sketch
ski
skill
skin
skirt
skull
slab
slam
sleep
slender
slice
slide
slight
slim
slogan
slot
slow
slush
small
smart
smile
smoke
smooth
snack
snake
snap
sniff
snow
soap
soccer
social
sock
soda
soft
solar
soldier
solid
solution
solve
someone
song
soon
sorry
sort
soul
sound
soup
source
south
space
spare
spatial
spawn
speak
special
speed
spell
spend
sphere
spice
spider
spike
spin
spirit
split
spoil
sponsor
spoon
sport
spot
spray
spread
spring
spy
square
squeeze
squirrel
stable
stadium
staff
stage
stairs
stamp
stand
start
state
stay
steak
steel
stem
step
stereo
stick
still
sting
stock
stomach
stone
stool
story
stove
strategy
street
strike
strong
struggle
student
stuff
stumble
style
subject
submit
subway
success
such
sudden
suffer
sugar
suggest
suit
summer
sun
sunny
sunset
super
supply
supreme
sure
surface
surge
surprise
surround
survey
suspect
sustain
swallow
swamp
swap
swarm
swear
sweet
swift
swim
swing
switch
sword
symbol
symptom
syrup
system
table
tackle
tag
tail
talent
talk
tank
tape
target
task
taste
tattoo
taxi
teach
team
tell
ten
tenant
tennis
tent
term
test
text
thank
that
theme
then
theory
there
they
thing
this
thought
three
thrive
throw
thumb
thunder
ticket
tide
tiger
tilt
timber
time
tiny
tip
tired
tissue
title
toast
tobacco
today
toddler
toe
together
toilet
token
tomato
tomorrow
tone
tongue
tonight
tool
tooth
top
topic
topple
torch
tornado
tortoise
toss
total
tourist
toward
tower
town
toy
track
trade
traffic
tragic
train
transfer
trap
trash
travel
tray
treat
tree
trend
trial
tribe
trick
trigger
trim
trip
trophy
trouble
truck
true
truly
trumpet
trust
truth
try
tube
tuition
tumble
tuna
tunnel
turkey
turn
turtle
twelve
twenty
twice
twin
twist
two
type
typical
ugly
umbrella
unable
unaware
uncle
uncover
under
undo
unfair
unfold
unhappy
uniform
unique
unit
universe
unknown
unlock
until
unusual
unveil
update
upgrade
uphold
upon
upper
upset
urban
urge
usage
use
used
useful
useless
usual
utility
vacant
vacuum
vague
valid
valley
valve
van
vanish
vapor
various
vast
vault
vehicle
velvet
vendor
venture
venue
verb
verify
version
very
vessel
veteran
viable
vibrant
vicious
victory
video
view
village
vintage
violin
virtual
virus
visa
visit
visual
vital
vivid
vocal
voice
void
volcano
volume
vote
voyage
wage
wagon
wait
walk
wall
walnut
want
warfare
warm
warrior
wash
wasp
waste
water
wave
way
wealth
weapon
wear
weasel
weather
web
wedding
weekend
weird
welcome
west
wet
whale
what
wheat
wheel
when
where
whip
whisper
wide
width
wife
wild
will
win
window
wine
wing
wink
winner
winter
wire
wisdom
wise
wish
witness
wolf
woman
wonder
wood
wool
word
work
world
worry
worth
wrap
wreck
wrestle
wrist
write
wrong
yard
year
yellow
you
young
youth
zebra
zero
zone
zoo`.split("\n");
    }
  });

  // ../../crypto/modules/esm/client/NUT09.js
  var require_NUT09 = __commonJS({
    "../../crypto/modules/esm/client/NUT09.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.deriveSeedFromMnemonic = exports.generateNewMnemonic = exports.deriveBlindingFactor = exports.deriveSecret = void 0;
      var bip32_1 = require_lib2();
      var index_js_1 = require_common();
      var bip39_1 = require_bip39();
      var english_1 = require_english();
      var STANDARD_DERIVATION_PATH = `m/129372'/0'`;
      var DerivationType;
      (function(DerivationType2) {
        DerivationType2[DerivationType2["SECRET"] = 0] = "SECRET";
        DerivationType2[DerivationType2["BLINDING_FACTOR"] = 1] = "BLINDING_FACTOR";
      })(DerivationType || (DerivationType = {}));
      var deriveSecret2 = (seed, keysetId, counter) => {
        return derive(seed, keysetId, counter, DerivationType.SECRET);
      };
      exports.deriveSecret = deriveSecret2;
      var deriveBlindingFactor2 = (seed, keysetId, counter) => {
        return derive(seed, keysetId, counter, DerivationType.BLINDING_FACTOR);
      };
      exports.deriveBlindingFactor = deriveBlindingFactor2;
      var derive = (seed, keysetId, counter, secretOrBlinding) => {
        const hdkey = bip32_1.HDKey.fromMasterSeed(seed);
        const keysetIdInt = (0, index_js_1.getKeysetIdInt)(keysetId);
        const derivationPath = `${STANDARD_DERIVATION_PATH}/${keysetIdInt}'/${counter}'/${secretOrBlinding}`;
        const derived = hdkey.derive(derivationPath);
        if (derived.privateKey === null) {
          throw new Error("Could not derive private key");
        }
        return derived.privateKey;
      };
      var generateNewMnemonic2 = () => {
        const mnemonic = (0, bip39_1.generateMnemonic)(english_1.wordlist, 128);
        return mnemonic;
      };
      exports.generateNewMnemonic = generateNewMnemonic2;
      var deriveSeedFromMnemonic3 = (mnemonic) => {
        const seed = (0, bip39_1.mnemonicToSeedSync)(mnemonic);
        return seed;
      };
      exports.deriveSeedFromMnemonic = deriveSeedFromMnemonic3;
    }
  });

  // ../../crypto/modules/esm/common/NUT11.js
  var require_NUT11 = __commonJS({
    "../../crypto/modules/esm/common/NUT11.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.parseSecret = void 0;
      var parseSecret = (secret) => {
        try {
          if (secret instanceof Uint8Array) {
            secret = new TextDecoder().decode(secret);
          }
          return JSON.parse(secret);
        } catch (e) {
          throw new Error("can't parse secret");
        }
      };
      exports.parseSecret = parseSecret;
    }
  });

  // ../../crypto/modules/esm/client/NUT11.js
  var require_NUT112 = __commonJS({
    "../../crypto/modules/esm/client/NUT11.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.getSignedProof = exports.getSignedProofs = exports.signP2PKsecret = exports.createP2PKsecret = void 0;
      var utils_1 = require_utils2();
      var sha256_1 = require_sha256();
      var secp256k1_1 = require_secp256k1();
      var utils_2 = require_utils();
      var NUT11_js_1 = require_NUT11();
      var createP2PKsecret2 = (pubkey) => {
        const newSecret = [
          "P2PK",
          {
            nonce: (0, utils_1.bytesToHex)((0, utils_2.randomBytes)(32)),
            data: pubkey
          }
        ];
        const parsed = JSON.stringify(newSecret);
        return new TextEncoder().encode(parsed);
      };
      exports.createP2PKsecret = createP2PKsecret2;
      var signP2PKsecret = (secret, privateKey) => {
        const msghash = (0, sha256_1.sha256)(new TextDecoder().decode(secret));
        const sig = secp256k1_1.schnorr.sign(msghash, privateKey);
        return sig;
      };
      exports.signP2PKsecret = signP2PKsecret;
      var getSignedProofs2 = (proofs, privateKey) => {
        return proofs.map((p) => {
          try {
            const parsed = (0, NUT11_js_1.parseSecret)(p.secret);
            if (parsed[0] !== "P2PK") {
              throw new Error("unknown secret type");
            }
            return (0, exports.getSignedProof)(p, (0, utils_1.hexToBytes)(privateKey));
          } catch (error) {
            return p;
          }
        });
      };
      exports.getSignedProofs = getSignedProofs2;
      var getSignedProof = (proof, privateKey) => {
        if (!proof.witness) {
          proof.witness = {
            signatures: [(0, utils_1.bytesToHex)((0, exports.signP2PKsecret)(proof.secret, privateKey))]
          };
        }
        return proof;
      };
      exports.getSignedProof = getSignedProof;
    }
  });

  // index.ts
  var src_exports = {};
  __export(src_exports, {
    CashuMint: () => CashuMint,
    CashuWallet: () => CashuWallet,
    CheckStateEnum: () => CheckStateEnum,
    MeltQuoteState: () => MeltQuoteState,
    MintQuoteState: () => MintQuoteState,
    PaymentRequest: () => PaymentRequest,
    PaymentRequestTransportType: () => PaymentRequestTransportType,
    decodePaymentRequest: () => decodePaymentRequest,
    deriveKeysetId: () => deriveKeysetId,
    deriveSeedFromMnemonic: () => import_NUT092.deriveSeedFromMnemonic,
    generateNewMnemonic: () => import_NUT092.generateNewMnemonic,
    getDecodedToken: () => getDecodedToken,
    getEncodedToken: () => getEncodedToken,
    getEncodedTokenV4: () => getEncodedTokenV4,
    setGlobalRequestOptions: () => setGlobalRequestOptions
  });

  // model/types/mint/responses.ts
  var CheckStateEnum = /* @__PURE__ */ ((CheckStateEnum2) => {
    CheckStateEnum2["UNSPENT"] = "UNSPENT";
    CheckStateEnum2["PENDING"] = "PENDING";
    CheckStateEnum2["SPENT"] = "SPENT";
    return CheckStateEnum2;
  })(CheckStateEnum || {});
  var MeltQuoteState = /* @__PURE__ */ ((MeltQuoteState2) => {
    MeltQuoteState2["UNPAID"] = "UNPAID";
    MeltQuoteState2["PENDING"] = "PENDING";
    MeltQuoteState2["PAID"] = "PAID";
    return MeltQuoteState2;
  })(MeltQuoteState || {});
  var MintQuoteState = /* @__PURE__ */ ((MintQuoteState2) => {
    MintQuoteState2["UNPAID"] = "UNPAID";
    MintQuoteState2["PAID"] = "PAID";
    MintQuoteState2["ISSUED"] = "ISSUED";
    return MintQuoteState2;
  })(MintQuoteState || {});

  // model/types/wallet/paymentRequests.ts
  var PaymentRequestTransportType = /* @__PURE__ */ ((PaymentRequestTransportType2) => {
    PaymentRequestTransportType2["POST"] = "post";
    PaymentRequestTransportType2["NOSTR"] = "nostr";
    return PaymentRequestTransportType2;
  })(PaymentRequestTransportType || {});

  // model/Errors.ts
  var HttpResponseError = class extends Error {
    constructor(message, status) {
      super(message);
      this.status = status;
    }
  };

  // request.ts
  var globalRequestOptions = {};
  function setGlobalRequestOptions(options) {
    globalRequestOptions = options;
  }
  async function _request({
    endpoint,
    requestBody,
    headers: requestHeaders,
    ...options
  }) {
    const body = requestBody ? JSON.stringify(requestBody) : void 0;
    const headers = {
      ...{ Accept: "application/json, text/plain, */*" },
      ...body ? { "Content-Type": "application/json" } : void 0,
      ...requestHeaders
    };
    const response = await fetch(endpoint, { body, headers, ...options });
    if (!response.ok) {
      const { error, detail } = await response.json().catch(() => ({ error: "bad response" }));
      throw new HttpResponseError(error || detail || "bad response", response.status);
    }
    try {
      return await response.json();
    } catch (err) {
      console.error("Failed to parse HTTP response", err);
      throw new HttpResponseError("bad response", response.status);
    }
  }
  async function request(options) {
    const data = await _request({ ...options, ...globalRequestOptions });
    return data;
  }

  // base64.ts
  var import_buffer = __toESM(require_buffer());
  function encodeUint8toBase64Url(bytes2) {
    return import_buffer.Buffer.from(bytes2).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function encodeBase64toUint8(base64String) {
    return import_buffer.Buffer.from(base64String, "base64");
  }
  function encodeJsonToBase64(jsonObj) {
    const jsonString = JSON.stringify(jsonObj);
    return base64urlFromBase64(import_buffer.Buffer.from(jsonString).toString("base64"));
  }
  function encodeBase64ToJson(base64String) {
    const jsonString = import_buffer.Buffer.from(base64urlToBase64(base64String), "base64").toString();
    const jsonObj = JSON.parse(jsonString);
    return jsonObj;
  }
  function base64urlToBase64(str) {
    return str.replace(/-/g, "+").replace(/_/g, "/").split("=")[0];
  }
  function base64urlFromBase64(str) {
    return str.replace(/\+/g, "-").replace(/\//g, "_").split("=")[0];
  }

  // utils/Constants.ts
  var TOKEN_VERSION = "A";
  var TOKEN_PREFIX = "cashu";

  // ../../../@noble/curves/esm/abstract/utils.js
  function isBytes(a) {
    return a instanceof Uint8Array || a != null && typeof a === "object" && a.constructor.name === "Uint8Array";
  }
  function abytes(item) {
    if (!isBytes(item))
      throw new Error("Uint8Array expected");
  }
  var hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
  function bytesToHex(bytes2) {
    abytes(bytes2);
    let hex2 = "";
    for (let i = 0; i < bytes2.length; i++) {
      hex2 += hexes[bytes2[i]];
    }
    return hex2;
  }
  var asciis = { _0: 48, _9: 57, _A: 65, _F: 70, _a: 97, _f: 102 };
  function asciiToBase16(char) {
    if (char >= asciis._0 && char <= asciis._9)
      return char - asciis._0;
    if (char >= asciis._A && char <= asciis._F)
      return char - (asciis._A - 10);
    if (char >= asciis._a && char <= asciis._f)
      return char - (asciis._a - 10);
    return;
  }
  function hexToBytes(hex2) {
    if (typeof hex2 !== "string")
      throw new Error("hex string expected, got " + typeof hex2);
    const hl = hex2.length;
    const al = hl / 2;
    if (hl % 2)
      throw new Error("padded hex string expected, got unpadded hex of length " + hl);
    const array = new Uint8Array(al);
    for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
      const n1 = asciiToBase16(hex2.charCodeAt(hi));
      const n2 = asciiToBase16(hex2.charCodeAt(hi + 1));
      if (n1 === void 0 || n2 === void 0) {
        const char = hex2[hi] + hex2[hi + 1];
        throw new Error('hex string expected, got non-hex character "' + char + '" at index ' + hi);
      }
      array[ai] = n1 * 16 + n2;
    }
    return array;
  }

  // ../../../@noble/hashes/esm/_assert.js
  function isBytes2(a) {
    return a instanceof Uint8Array || a != null && typeof a === "object" && a.constructor.name === "Uint8Array";
  }
  function bytes(b, ...lengths) {
    if (!isBytes2(b))
      throw new Error("Uint8Array expected");
    if (lengths.length > 0 && !lengths.includes(b.length))
      throw new Error(`Uint8Array expected of length ${lengths}, not of length=${b.length}`);
  }
  function exists(instance, checkFinished = true) {
    if (instance.destroyed)
      throw new Error("Hash instance has been destroyed");
    if (checkFinished && instance.finished)
      throw new Error("Hash#digest() has already been called");
  }
  function output(out, instance) {
    bytes(out);
    const min = instance.outputLen;
    if (out.length < min) {
      throw new Error(`digestInto() expects output buffer of length at least ${min}`);
    }
  }

  // ../../../@noble/hashes/esm/crypto.js
  var crypto = typeof globalThis === "object" && "crypto" in globalThis ? globalThis.crypto : void 0;

  // ../../../@noble/hashes/esm/utils.js
  var createView = (arr) => new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
  var rotr = (word, shift) => word << 32 - shift | word >>> shift;
  var isLE = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68;
  var hexes2 = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
  function bytesToHex2(bytes2) {
    bytes(bytes2);
    let hex2 = "";
    for (let i = 0; i < bytes2.length; i++) {
      hex2 += hexes2[bytes2[i]];
    }
    return hex2;
  }
  function utf8ToBytes(str) {
    if (typeof str !== "string")
      throw new Error(`utf8ToBytes expected string, got ${typeof str}`);
    return new Uint8Array(new TextEncoder().encode(str));
  }
  function toBytes(data) {
    if (typeof data === "string")
      data = utf8ToBytes(data);
    bytes(data);
    return data;
  }
  var Hash = class {
    // Safe version that clones internal state
    clone() {
      return this._cloneInto();
    }
  };
  var toStr = {}.toString;
  function wrapConstructor(hashCons) {
    const hashC = (msg) => hashCons().update(toBytes(msg)).digest();
    const tmp = hashCons();
    hashC.outputLen = tmp.outputLen;
    hashC.blockLen = tmp.blockLen;
    hashC.create = () => hashCons();
    return hashC;
  }
  function randomBytes(bytesLength = 32) {
    if (crypto && typeof crypto.getRandomValues === "function") {
      return crypto.getRandomValues(new Uint8Array(bytesLength));
    }
    if (crypto && typeof crypto.randomBytes === "function") {
      return crypto.randomBytes(bytesLength);
    }
    throw new Error("crypto.getRandomValues must be defined");
  }

  // ../../../@noble/hashes/esm/_md.js
  function setBigUint64(view, byteOffset, value, isLE2) {
    if (typeof view.setBigUint64 === "function")
      return view.setBigUint64(byteOffset, value, isLE2);
    const _32n = BigInt(32);
    const _u32_max = BigInt(4294967295);
    const wh = Number(value >> _32n & _u32_max);
    const wl = Number(value & _u32_max);
    const h = isLE2 ? 4 : 0;
    const l = isLE2 ? 0 : 4;
    view.setUint32(byteOffset + h, wh, isLE2);
    view.setUint32(byteOffset + l, wl, isLE2);
  }
  var Chi = (a, b, c) => a & b ^ ~a & c;
  var Maj = (a, b, c) => a & b ^ a & c ^ b & c;
  var HashMD = class extends Hash {
    constructor(blockLen, outputLen, padOffset, isLE2) {
      super();
      this.blockLen = blockLen;
      this.outputLen = outputLen;
      this.padOffset = padOffset;
      this.isLE = isLE2;
      this.finished = false;
      this.length = 0;
      this.pos = 0;
      this.destroyed = false;
      this.buffer = new Uint8Array(blockLen);
      this.view = createView(this.buffer);
    }
    update(data) {
      exists(this);
      const { view, buffer, blockLen } = this;
      data = toBytes(data);
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
      exists(this);
      output(out, this);
      this.finished = true;
      const { buffer, view, blockLen, isLE: isLE2 } = this;
      let { pos } = this;
      buffer[pos++] = 128;
      this.buffer.subarray(pos).fill(0);
      if (this.padOffset > blockLen - pos) {
        this.process(view, 0);
        pos = 0;
      }
      for (let i = pos; i < blockLen; i++)
        buffer[i] = 0;
      setBigUint64(view, blockLen - 8, BigInt(this.length * 8), isLE2);
      this.process(view, 0);
      const oview = createView(out);
      const len = this.outputLen;
      if (len % 4)
        throw new Error("_sha2: outputLen should be aligned to 32bit");
      const outLen = len / 4;
      const state = this.get();
      if (outLen > state.length)
        throw new Error("_sha2: outputLen bigger than state");
      for (let i = 0; i < outLen; i++)
        oview.setUint32(4 * i, state[i], isLE2);
    }
    digest() {
      const { buffer, outputLen } = this;
      this.digestInto(buffer);
      const res = buffer.slice(0, outputLen);
      this.destroy();
      return res;
    }
    _cloneInto(to) {
      to || (to = new this.constructor());
      to.set(...this.get());
      const { blockLen, buffer, length, finished, destroyed, pos } = this;
      to.length = length;
      to.pos = pos;
      to.finished = finished;
      to.destroyed = destroyed;
      if (length % blockLen)
        to.buffer.set(buffer);
      return to;
    }
  };

  // ../../../@noble/hashes/esm/sha256.js
  var SHA256_K = /* @__PURE__ */ new Uint32Array([
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
  var SHA256_IV = /* @__PURE__ */ new Uint32Array([
    1779033703,
    3144134277,
    1013904242,
    2773480762,
    1359893119,
    2600822924,
    528734635,
    1541459225
  ]);
  var SHA256_W = /* @__PURE__ */ new Uint32Array(64);
  var SHA256 = class extends HashMD {
    constructor() {
      super(64, 32, 8, false);
      this.A = SHA256_IV[0] | 0;
      this.B = SHA256_IV[1] | 0;
      this.C = SHA256_IV[2] | 0;
      this.D = SHA256_IV[3] | 0;
      this.E = SHA256_IV[4] | 0;
      this.F = SHA256_IV[5] | 0;
      this.G = SHA256_IV[6] | 0;
      this.H = SHA256_IV[7] | 0;
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
      SHA256_W.fill(0);
    }
    destroy() {
      this.set(0, 0, 0, 0, 0, 0, 0, 0);
      this.buffer.fill(0);
    }
  };
  var sha256 = /* @__PURE__ */ wrapConstructor(() => new SHA256());

  // cbor.ts
  function isResultKeyType(value) {
    return typeof value === "number" || typeof value === "string";
  }
  function encodeCBOR(value) {
    const buffer = [];
    encodeItem(value, buffer);
    return new Uint8Array(buffer);
  }
  function encodeItem(value, buffer) {
    if (value === null) {
      buffer.push(246);
    } else if (value === void 0) {
      buffer.push(247);
    } else if (typeof value === "boolean") {
      buffer.push(value ? 245 : 244);
    } else if (typeof value === "number") {
      encodeUnsigned(value, buffer);
    } else if (typeof value === "string") {
      encodeString(value, buffer);
    } else if (Array.isArray(value)) {
      encodeArray(value, buffer);
    } else if (value instanceof Uint8Array) {
      encodeByteString(value, buffer);
    } else if (typeof value === "object") {
      encodeObject(value, buffer);
    } else {
      throw new Error("Unsupported type");
    }
  }
  function encodeUnsigned(value, buffer) {
    if (value < 24) {
      buffer.push(value);
    } else if (value < 256) {
      buffer.push(24, value);
    } else if (value < 65536) {
      buffer.push(25, value >> 8, value & 255);
    } else if (value < 4294967296) {
      buffer.push(26, value >> 24, value >> 16 & 255, value >> 8 & 255, value & 255);
    } else {
      throw new Error("Unsupported integer size");
    }
  }
  function encodeByteString(value, buffer) {
    const length = value.length;
    if (length < 24) {
      buffer.push(64 + length);
    } else if (length < 256) {
      buffer.push(88, length);
    } else if (length < 65536) {
      buffer.push(89, length >> 8 & 255, length & 255);
    } else if (length < 4294967296) {
      buffer.push(
        90,
        length >> 24 & 255,
        length >> 16 & 255,
        length >> 8 & 255,
        length & 255
      );
    } else {
      throw new Error("Byte string too long to encode");
    }
    for (let i = 0; i < value.length; i++) {
      buffer.push(value[i]);
    }
  }
  function encodeString(value, buffer) {
    const utf8 = new TextEncoder().encode(value);
    const length = utf8.length;
    if (length < 24) {
      buffer.push(96 + length);
    } else if (length < 256) {
      buffer.push(120, length);
    } else if (length < 65536) {
      buffer.push(121, length >> 8 & 255, length & 255);
    } else if (length < 4294967296) {
      buffer.push(
        122,
        length >> 24 & 255,
        length >> 16 & 255,
        length >> 8 & 255,
        length & 255
      );
    } else {
      throw new Error("String too long to encode");
    }
    for (let i = 0; i < utf8.length; i++) {
      buffer.push(utf8[i]);
    }
  }
  function encodeArray(value, buffer) {
    const length = value.length;
    if (length < 24) {
      buffer.push(128 | length);
    } else if (length < 256) {
      buffer.push(152, length);
    } else if (length < 65536) {
      buffer.push(153, length >> 8, length & 255);
    } else {
      throw new Error("Unsupported array length");
    }
    for (const item of value) {
      encodeItem(item, buffer);
    }
  }
  function encodeObject(value, buffer) {
    const keys = Object.keys(value);
    encodeUnsigned(keys.length, buffer);
    buffer[buffer.length - 1] |= 160;
    for (const key of keys) {
      encodeString(key, buffer);
      encodeItem(value[key], buffer);
    }
  }
  function decodeCBOR(data) {
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    const result = decodeItem(view, 0);
    return result.value;
  }
  function decodeItem(view, offset) {
    if (offset >= view.byteLength) {
      throw new Error("Unexpected end of data");
    }
    const initialByte = view.getUint8(offset++);
    const majorType = initialByte >> 5;
    const additionalInfo = initialByte & 31;
    switch (majorType) {
      case 0:
        return decodeUnsigned(view, offset, additionalInfo);
      case 1:
        return decodeSigned(view, offset, additionalInfo);
      case 2:
        return decodeByteString(view, offset, additionalInfo);
      case 3:
        return decodeString(view, offset, additionalInfo);
      case 4:
        return decodeArray(view, offset, additionalInfo);
      case 5:
        return decodeMap(view, offset, additionalInfo);
      case 7:
        return decodeSimpleAndFloat(view, offset, additionalInfo);
      default:
        throw new Error(`Unsupported major type: ${majorType}`);
    }
  }
  function decodeLength(view, offset, additionalInfo) {
    if (additionalInfo < 24)
      return { value: additionalInfo, offset };
    if (additionalInfo === 24)
      return { value: view.getUint8(offset++), offset };
    if (additionalInfo === 25) {
      const value = view.getUint16(offset, false);
      offset += 2;
      return { value, offset };
    }
    if (additionalInfo === 26) {
      const value = view.getUint32(offset, false);
      offset += 4;
      return { value, offset };
    }
    if (additionalInfo === 27) {
      const hi = view.getUint32(offset, false);
      const lo = view.getUint32(offset + 4, false);
      offset += 8;
      return { value: hi * 2 ** 32 + lo, offset };
    }
    throw new Error(`Unsupported length: ${additionalInfo}`);
  }
  function decodeUnsigned(view, offset, additionalInfo) {
    const { value, offset: newOffset } = decodeLength(view, offset, additionalInfo);
    return { value, offset: newOffset };
  }
  function decodeSigned(view, offset, additionalInfo) {
    const { value, offset: newOffset } = decodeLength(view, offset, additionalInfo);
    return { value: -1 - value, offset: newOffset };
  }
  function decodeByteString(view, offset, additionalInfo) {
    const { value: length, offset: newOffset } = decodeLength(view, offset, additionalInfo);
    if (newOffset + length > view.byteLength) {
      throw new Error("Byte string length exceeds data length");
    }
    const value = new Uint8Array(view.buffer, view.byteOffset + newOffset, length);
    return { value, offset: newOffset + length };
  }
  function decodeString(view, offset, additionalInfo) {
    const { value: length, offset: newOffset } = decodeLength(view, offset, additionalInfo);
    if (newOffset + length > view.byteLength) {
      throw new Error("String length exceeds data length");
    }
    const bytes2 = new Uint8Array(view.buffer, view.byteOffset + newOffset, length);
    const value = new TextDecoder().decode(bytes2);
    return { value, offset: newOffset + length };
  }
  function decodeArray(view, offset, additionalInfo) {
    const { value: length, offset: newOffset } = decodeLength(view, offset, additionalInfo);
    const array = [];
    let currentOffset = newOffset;
    for (let i = 0; i < length; i++) {
      const result = decodeItem(view, currentOffset);
      array.push(result.value);
      currentOffset = result.offset;
    }
    return { value: array, offset: currentOffset };
  }
  function decodeMap(view, offset, additionalInfo) {
    const { value: length, offset: newOffset } = decodeLength(view, offset, additionalInfo);
    const map = {};
    let currentOffset = newOffset;
    for (let i = 0; i < length; i++) {
      const keyResult = decodeItem(view, currentOffset);
      if (!isResultKeyType(keyResult.value)) {
        throw new Error("Invalid key type");
      }
      const valueResult = decodeItem(view, keyResult.offset);
      map[keyResult.value] = valueResult.value;
      currentOffset = valueResult.offset;
    }
    return { value: map, offset: currentOffset };
  }
  function decodeFloat16(uint16) {
    const exponent = (uint16 & 31744) >> 10;
    const fraction = uint16 & 1023;
    const sign = uint16 & 32768 ? -1 : 1;
    if (exponent === 0) {
      return sign * 2 ** -14 * (fraction / 1024);
    } else if (exponent === 31) {
      return fraction ? NaN : sign * Infinity;
    }
    return sign * 2 ** (exponent - 15) * (1 + fraction / 1024);
  }
  function decodeSimpleAndFloat(view, offset, additionalInfo) {
    if (additionalInfo < 24) {
      switch (additionalInfo) {
        case 20:
          return { value: false, offset };
        case 21:
          return { value: true, offset };
        case 22:
          return { value: null, offset };
        case 23:
          return { value: void 0, offset };
        default:
          throw new Error(`Unknown simple value: ${additionalInfo}`);
      }
    }
    if (additionalInfo === 24)
      return { value: view.getUint8(offset++), offset };
    if (additionalInfo === 25) {
      const value = decodeFloat16(view.getUint16(offset, false));
      offset += 2;
      return { value, offset };
    }
    if (additionalInfo === 26) {
      const value = view.getFloat32(offset, false);
      offset += 4;
      return { value, offset };
    }
    if (additionalInfo === 27) {
      const value = view.getFloat64(offset, false);
      offset += 8;
      return { value, offset };
    }
    throw new Error(`Unknown simple or float value: ${additionalInfo}`);
  }

  // model/PaymentRequest.ts
  var import_buffer2 = __toESM(require_buffer());
  var PaymentRequest = class {
    constructor(transport, id, amount, unit, mints, description, singleUse = false) {
      this.transport = transport;
      this.id = id;
      this.amount = amount;
      this.unit = unit;
      this.mints = mints;
      this.description = description;
      this.singleUse = singleUse;
    }
    toEncodedRequest() {
      const rawRequest = {
        t: this.transport.map((t) => ({ t: t.type, a: t.target, g: t.tags }))
      };
      if (this.id) {
        rawRequest.i = this.id;
      }
      if (this.amount) {
        rawRequest.a = this.amount;
      }
      if (this.unit) {
        rawRequest.u = this.unit;
      }
      if (this.mints) {
        rawRequest.m = this.mints;
      }
      if (this.description) {
        rawRequest.d = this.description;
      }
      if (this.singleUse) {
        rawRequest.s = this.singleUse;
      }
      const data = encodeCBOR(rawRequest);
      const encodedData = import_buffer2.Buffer.from(data).toString("base64");
      return "creqA" + encodedData;
    }
    getTransport(type) {
      return this.transport.find((t) => t.type === type);
    }
    static fromEncodedRequest(encodedRequest) {
      if (!encodedRequest.startsWith("creq")) {
        throw new Error("unsupported pr: invalid prefix");
      }
      const version = encodedRequest[4];
      if (version !== "A") {
        throw new Error("unsupported pr version");
      }
      const encodedData = encodedRequest.slice(5);
      const data = encodeBase64toUint8(encodedData);
      const decoded = decodeCBOR(data);
      const transports = decoded.t.map((t) => ({ type: t.t, target: t.a, tags: t.g }));
      return new PaymentRequest(
        transports,
        decoded.i,
        decoded.a,
        decoded.u,
        decoded.m,
        decoded.d,
        decoded.s
      );
    }
  };

  // utils.ts
  function splitAmount(value, keyset, amountPreference, isDesc) {
    const chunks = [];
    if (amountPreference) {
      chunks.push(...getPreference(value, keyset, amountPreference));
      value = value - chunks.reduce((curr, acc) => {
        return curr + acc;
      }, 0);
    }
    const sortedKeyAmounts = Object.keys(keyset).map((k) => parseInt(k)).sort((a, b) => b - a);
    sortedKeyAmounts.forEach((amt) => {
      const q = Math.floor(value / amt);
      for (let i = 0; i < q; ++i)
        chunks.push(amt);
      value %= amt;
    });
    return chunks.sort((a, b) => isDesc ? b - a : a - b);
  }
  function hasCorrespondingKey(amount, keyset) {
    return amount in keyset;
  }
  function getPreference(amount, keyset, preferredAmounts) {
    const chunks = [];
    let accumulator = 0;
    preferredAmounts.forEach((pa) => {
      if (!hasCorrespondingKey(pa.amount, keyset)) {
        throw new Error("Provided amount preferences do not match the amounts of the mint keyset.");
      }
      for (let i = 1; i <= pa.count; i++) {
        accumulator += pa.amount;
        if (accumulator > amount) {
          return;
        }
        chunks.push(pa.amount);
      }
    });
    return chunks;
  }
  function getDefaultAmountPreference(amount, keyset) {
    const amounts = splitAmount(amount, keyset);
    return amounts.map((a) => {
      return { amount: a, count: 1 };
    });
  }
  function bytesToNumber(bytes2) {
    return hexToNumber(bytesToHex(bytes2));
  }
  function hexToNumber(hex2) {
    return BigInt(`0x${hex2}`);
  }
  function getEncodedToken(token) {
    return TOKEN_PREFIX + TOKEN_VERSION + encodeJsonToBase64(token);
  }
  function getEncodedTokenV4(token) {
    const idMap = {};
    let mint = void 0;
    for (let i = 0; i < token.token.length; i++) {
      if (!mint) {
        mint = token.token[i].mint;
      } else {
        if (mint !== token.token[i].mint) {
          throw new Error("Multimint token can not be encoded as V4 token");
        }
      }
      for (let j = 0; j < token.token[i].proofs.length; j++) {
        const proof = token.token[i].proofs[j];
        if (idMap[proof.id]) {
          idMap[proof.id].push(proof);
        } else {
          idMap[proof.id] = [proof];
        }
      }
    }
    const tokenTemplate = {
      m: mint,
      u: token.unit || "sat",
      t: Object.keys(idMap).map(
        (id) => ({
          i: hexToBytes(id),
          p: idMap[id].map(
            (p) => ({ a: p.amount, s: p.secret, c: hexToBytes(p.C) })
          )
        })
      )
    };
    if (token.memo) {
      tokenTemplate.d = token.memo;
    }
    const encodedData = encodeCBOR(tokenTemplate);
    const prefix = "cashu";
    const version = "B";
    const base64Data = encodeUint8toBase64Url(encodedData);
    return prefix + version + base64Data;
  }
  function getDecodedToken(token) {
    const uriPrefixes = ["web+cashu://", "cashu://", "cashu:", "cashu"];
    uriPrefixes.forEach((prefix) => {
      if (!token.startsWith(prefix)) {
        return;
      }
      token = token.slice(prefix.length);
    });
    return handleTokens(token);
  }
  function handleTokens(token) {
    const version = token.slice(0, 1);
    const encodedToken = token.slice(1);
    if (version === "A") {
      return encodeBase64ToJson(encodedToken);
    } else if (version === "B") {
      const uInt8Token = encodeBase64toUint8(encodedToken);
      const tokenData = decodeCBOR(uInt8Token);
      const mergedTokenEntry = { mint: tokenData.m, proofs: [] };
      tokenData.t.forEach(
        (tokenEntry) => tokenEntry.p.forEach((p) => {
          mergedTokenEntry.proofs.push({
            secret: p.s,
            C: bytesToHex(p.c),
            amount: p.a,
            id: bytesToHex(tokenEntry.i)
          });
        })
      );
      return { token: [mergedTokenEntry], memo: tokenData.d || "", unit: tokenData.u || "sat" };
    }
    throw new Error("Token version is not supported");
  }
  function deriveKeysetId(keys) {
    const pubkeysConcat = Object.entries(keys).sort((a, b) => +a[0] - +b[0]).map(([, pubKey]) => hexToBytes(pubKey)).reduce((prev, curr) => mergeUInt8Arrays(prev, curr), new Uint8Array());
    const hash = sha256(pubkeysConcat);
    const hashHex = Buffer.from(hash).toString("hex").slice(0, 14);
    return "00" + hashHex;
  }
  function mergeUInt8Arrays(a1, a2) {
    const mergedArray = new Uint8Array(a1.length + a2.length);
    mergedArray.set(a1);
    mergedArray.set(a2, a1.length);
    return mergedArray;
  }
  function isObj(v) {
    return typeof v === "object";
  }
  function joinUrls(...parts) {
    return parts.map((part) => part.replace(/(^\/+|\/+$)/g, "")).join("/");
  }
  function sanitizeUrl(url) {
    return url.replace(/\/$/, "");
  }
  function decodePaymentRequest(paymentRequest) {
    return PaymentRequest.fromEncodedRequest(paymentRequest);
  }

  // legacy/nut-05.ts
  function handleMeltQuoteResponseDeprecated(response) {
    if (!response.state) {
      console.warn(
        "Field 'state' not found in MeltQuoteResponse. Update NUT-05 of mint: https://github.com/cashubtc/nuts/pull/136)"
      );
      if (typeof response.paid === "boolean") {
        response.state = response.paid ? "PAID" /* PAID */ : "UNPAID" /* UNPAID */;
      }
    }
    return response;
  }

  // legacy/nut-04.ts
  function handleMintQuoteResponseDeprecated(response) {
    if (!response.state) {
      console.warn(
        "Field 'state' not found in MintQuoteResponse. Update NUT-04 of mint: https://github.com/cashubtc/nuts/pull/141)"
      );
      if (typeof response.paid === "boolean") {
        response.state = response.paid ? "PAID" /* PAID */ : "UNPAID" /* UNPAID */;
      }
    }
    return response;
  }

  // legacy/nut-06.ts
  function handleMintInfoContactFieldDeprecated(data) {
    if (Array.isArray(data?.contact) && data?.contact.length > 0) {
      data.contact = data.contact.map((contact) => {
        if (Array.isArray(contact) && contact.length === 2 && typeof contact[0] === "string" && typeof contact[1] === "string") {
          return { method: contact[0], info: contact[1] };
        }
        console.warn(
          "Mint returned deprecated 'contact' field. Update NUT-06: https://github.com/cashubtc/nuts/pull/117"
        );
        return contact;
      });
    }
    return data;
  }

  // CashuMint.ts
  var CashuMint = class {
    /**
     * @param _mintUrl requires mint URL to create this object
     * @param _customRequest if passed, use custom request implementation for network communication with the mint
     */
    constructor(_mintUrl, _customRequest) {
      this._mintUrl = _mintUrl;
      this._customRequest = _customRequest;
      this._mintUrl = sanitizeUrl(_mintUrl);
      this._customRequest = _customRequest;
    }
    get mintUrl() {
      return this._mintUrl;
    }
    /**
     * fetches mints info at the /info endpoint
     * @param mintUrl
     * @param customRequest
     */
    static async getInfo(mintUrl, customRequest) {
      const requestInstance = customRequest || request;
      const response = await requestInstance({
        endpoint: joinUrls(mintUrl, "/v1/info")
      });
      const data = handleMintInfoContactFieldDeprecated(response);
      return data;
    }
    /**
     * fetches mints info at the /info endpoint
     */
    async getInfo() {
      return CashuMint.getInfo(this._mintUrl, this._customRequest);
    }
    /**
     * Performs a swap operation with ecash inputs and outputs.
     * @param mintUrl
     * @param swapPayload payload containing inputs and outputs
     * @param customRequest
     * @returns signed outputs
     */
    static async split(mintUrl, swapPayload, customRequest) {
      const requestInstance = customRequest || request;
      const data = await requestInstance({
        endpoint: joinUrls(mintUrl, "/v1/swap"),
        method: "POST",
        requestBody: swapPayload
      });
      if (!isObj(data) || !Array.isArray(data?.signatures)) {
        throw new Error(data.detail ?? "bad response");
      }
      return data;
    }
    /**
     * Performs a swap operation with ecash inputs and outputs.
     * @param swapPayload payload containing inputs and outputs
     * @returns signed outputs
     */
    async split(swapPayload) {
      return CashuMint.split(this._mintUrl, swapPayload, this._customRequest);
    }
    /**
     * Requests a new mint quote from the mint.
     * @param mintUrl
     * @param mintQuotePayload Payload for creating a new mint quote
     * @param customRequest
     * @returns the mint will create and return a new mint quote containing a payment request for the specified amount and unit
     */
    static async createMintQuote(mintUrl, mintQuotePayload, customRequest) {
      const requestInstance = customRequest || request;
      const response = await requestInstance({
        endpoint: joinUrls(mintUrl, "/v1/mint/quote/bolt11"),
        method: "POST",
        requestBody: mintQuotePayload
      });
      const data = handleMintQuoteResponseDeprecated(response);
      return data;
    }
    /**
     * Requests a new mint quote from the mint.
     * @param mintQuotePayload Payload for creating a new mint quote
     * @returns the mint will create and return a new mint quote containing a payment request for the specified amount and unit
     */
    async createMintQuote(mintQuotePayload) {
      return CashuMint.createMintQuote(this._mintUrl, mintQuotePayload, this._customRequest);
    }
    /**
     * Gets an existing mint quote from the mint.
     * @param mintUrl
     * @param quote Quote ID
     * @param customRequest
     * @returns the mint will create and return a Lightning invoice for the specified amount
     */
    static async checkMintQuote(mintUrl, quote, customRequest) {
      const requestInstance = customRequest || request;
      const response = await requestInstance({
        endpoint: joinUrls(mintUrl, "/v1/mint/quote/bolt11", quote),
        method: "GET"
      });
      const data = handleMintQuoteResponseDeprecated(response);
      return data;
    }
    /**
     * Gets an existing mint quote from the mint.
     * @param quote Quote ID
     * @returns the mint will create and return a Lightning invoice for the specified amount
     */
    async checkMintQuote(quote) {
      return CashuMint.checkMintQuote(this._mintUrl, quote, this._customRequest);
    }
    /**
     * Mints new tokens by requesting blind signatures on the provided outputs.
     * @param mintUrl
     * @param mintPayload Payload containing the outputs to get blind signatures on
     * @param customRequest
     * @returns serialized blinded signatures
     */
    static async mint(mintUrl, mintPayload, customRequest) {
      const requestInstance = customRequest || request;
      const data = await requestInstance({
        endpoint: joinUrls(mintUrl, "/v1/mint/bolt11"),
        method: "POST",
        requestBody: mintPayload
      });
      if (!isObj(data) || !Array.isArray(data?.signatures)) {
        throw new Error("bad response");
      }
      return data;
    }
    /**
     * Mints new tokens by requesting blind signatures on the provided outputs.
     * @param mintPayload Payload containing the outputs to get blind signatures on
     * @returns serialized blinded signatures
     */
    async mint(mintPayload) {
      return CashuMint.mint(this._mintUrl, mintPayload, this._customRequest);
    }
    /**
     * Requests a new melt quote from the mint.
     * @param mintUrl
     * @param MeltQuotePayload
     * @returns
     */
    static async createMeltQuote(mintUrl, meltQuotePayload, customRequest) {
      const requestInstance = customRequest || request;
      const response = await requestInstance({
        endpoint: joinUrls(mintUrl, "/v1/melt/quote/bolt11"),
        method: "POST",
        requestBody: meltQuotePayload
      });
      const data = handleMeltQuoteResponseDeprecated(response);
      if (!isObj(data) || typeof data?.amount !== "number" || typeof data?.fee_reserve !== "number" || typeof data?.quote !== "string") {
        throw new Error("bad response");
      }
      return data;
    }
    /**
     * Requests a new melt quote from the mint.
     * @param MeltQuotePayload
     * @returns
     */
    async createMeltQuote(meltQuotePayload) {
      return CashuMint.createMeltQuote(this._mintUrl, meltQuotePayload, this._customRequest);
    }
    /**
     * Gets an existing melt quote.
     * @param mintUrl
     * @param quote Quote ID
     * @returns
     */
    static async checkMeltQuote(mintUrl, quote, customRequest) {
      const requestInstance = customRequest || request;
      const response = await requestInstance({
        endpoint: joinUrls(mintUrl, "/v1/melt/quote/bolt11", quote),
        method: "GET"
      });
      const data = handleMeltQuoteResponseDeprecated(response);
      if (!isObj(data) || typeof data?.amount !== "number" || typeof data?.fee_reserve !== "number" || typeof data?.quote !== "string" || typeof data?.state !== "string" || !Object.values(MeltQuoteState).includes(data.state)) {
        throw new Error("bad response");
      }
      return data;
    }
    /**
     * Gets an existing melt quote.
     * @param quote Quote ID
     * @returns
     */
    async checkMeltQuote(quote) {
      return CashuMint.checkMeltQuote(this._mintUrl, quote, this._customRequest);
    }
    /**
     * Requests the mint to pay for a Bolt11 payment request by providing ecash as inputs to be spent. The inputs contain the amount and the fee_reserves for a Lightning payment. The payload can also contain blank outputs in order to receive back overpaid Lightning fees.
     * @param mintUrl
     * @param meltPayload
     * @param customRequest
     * @returns
     */
    static async melt(mintUrl, meltPayload, customRequest) {
      const requestInstance = customRequest || request;
      const response = await requestInstance({
        endpoint: joinUrls(mintUrl, "/v1/melt/bolt11"),
        method: "POST",
        requestBody: meltPayload
      });
      const data = handleMeltQuoteResponseDeprecated(response);
      if (!isObj(data) || typeof data?.state !== "string" || !Object.values(MeltQuoteState).includes(data.state)) {
        throw new Error("bad response");
      }
      return data;
    }
    /**
     * Ask mint to perform a melt operation. This pays a lightning invoice and destroys tokens matching its amount + fees
     * @param meltPayload
     * @returns
     */
    async melt(meltPayload) {
      return CashuMint.melt(this._mintUrl, meltPayload, this._customRequest);
    }
    /**
     * Checks if specific proofs have already been redeemed
     * @param mintUrl
     * @param checkPayload
     * @param customRequest
     * @returns redeemed and unredeemed ordered list of booleans
     */
    static async check(mintUrl, checkPayload, customRequest) {
      const requestInstance = customRequest || request;
      const data = await requestInstance({
        endpoint: joinUrls(mintUrl, "/v1/checkstate"),
        method: "POST",
        requestBody: checkPayload
      });
      if (!isObj(data) || !Array.isArray(data?.states)) {
        throw new Error("bad response");
      }
      return data;
    }
    /**
     * Get the mints public keys
     * @param mintUrl
     * @param keysetId optional param to get the keys for a specific keyset. If not specified, the keys from all active keysets are fetched
     * @param customRequest
     * @returns
     */
    static async getKeys(mintUrl, keysetId, customRequest) {
      if (keysetId) {
        keysetId = keysetId.replace(/\//g, "_").replace(/\+/g, "-");
      }
      const requestInstance = customRequest || request;
      const data = await requestInstance({
        endpoint: keysetId ? joinUrls(mintUrl, "/v1/keys", keysetId) : joinUrls(mintUrl, "/v1/keys")
      });
      if (!isObj(data) || !Array.isArray(data.keysets)) {
        throw new Error("bad response");
      }
      return data;
    }
    /**
     * Get the mints public keys
     * @param keysetId optional param to get the keys for a specific keyset. If not specified, the keys from all active keysets are fetched
     * @returns the mints public keys
     */
    async getKeys(keysetId, mintUrl) {
      const allKeys = await CashuMint.getKeys(
        mintUrl || this._mintUrl,
        keysetId,
        this._customRequest
      );
      return allKeys;
    }
    /**
     * Get the mints keysets in no specific order
     * @param mintUrl
     * @param customRequest
     * @returns all the mints past and current keysets.
     */
    static async getKeySets(mintUrl, customRequest) {
      const requestInstance = customRequest || request;
      return requestInstance({ endpoint: joinUrls(mintUrl, "/v1/keysets") });
    }
    /**
     * Get the mints keysets in no specific order
     * @returns all the mints past and current keysets.
     */
    async getKeySets() {
      return CashuMint.getKeySets(this._mintUrl, this._customRequest);
    }
    /**
     * Checks if specific proofs have already been redeemed
     * @param checkPayload
     * @returns redeemed and unredeemed ordered list of booleans
     */
    async check(checkPayload) {
      return CashuMint.check(this._mintUrl, checkPayload, this._customRequest);
    }
    static async restore(mintUrl, restorePayload, customRequest) {
      const requestInstance = customRequest || request;
      const data = await requestInstance({
        endpoint: joinUrls(mintUrl, "/v1/restore"),
        method: "POST",
        requestBody: restorePayload
      });
      if (!isObj(data) || !Array.isArray(data?.outputs) || !Array.isArray(data?.promises)) {
        throw new Error("bad response");
      }
      return data;
    }
    async restore(restorePayload) {
      return CashuMint.restore(this._mintUrl, restorePayload, this._customRequest);
    }
  };

  // model/BlindedMessage.ts
  var BlindedMessage = class {
    constructor(amount, B_, id) {
      this.amount = amount;
      this.B_ = B_;
      this.id = id;
    }
    getSerializedBlindedMessage() {
      return { amount: this.amount, B_: this.B_.toHex(true), id: this.id };
    }
  };

  // legacy/cashu-ts.ts
  var deprecatedAmountPreferences = function(pref) {
    console.warn("[DEPRECATION] Use `Preferences` instead of `Array<AmountPreference>`");
    return { sendPreference: pref };
  };
  var isAmountPreference = function(obj) {
    return typeof obj === "object" && obj !== null && "amount" in obj && "count" in obj && typeof obj.amount === "number" && typeof obj.count === "number";
  };
  var isAmountPreferenceArray = function(preference) {
    return Array.isArray(preference) && preference.every((item) => isAmountPreference(item));
  };

  // ../../../@scure/base/lib/esm/index.js
  function assertNumber(n) {
    if (!Number.isSafeInteger(n))
      throw new Error(`Wrong integer: ${n}`);
  }
  function isBytes3(a) {
    return a instanceof Uint8Array || a != null && typeof a === "object" && a.constructor.name === "Uint8Array";
  }
  function chain(...args) {
    const id = (a) => a;
    const wrap = (a, b) => (c) => a(b(c));
    const encode = args.map((x) => x.encode).reduceRight(wrap, id);
    const decode = args.map((x) => x.decode).reduce(wrap, id);
    return { encode, decode };
  }
  function alphabet(alphabet2) {
    return {
      encode: (digits) => {
        if (!Array.isArray(digits) || digits.length && typeof digits[0] !== "number")
          throw new Error("alphabet.encode input should be an array of numbers");
        return digits.map((i) => {
          assertNumber(i);
          if (i < 0 || i >= alphabet2.length)
            throw new Error(`Digit index outside alphabet: ${i} (alphabet: ${alphabet2.length})`);
          return alphabet2[i];
        });
      },
      decode: (input) => {
        if (!Array.isArray(input) || input.length && typeof input[0] !== "string")
          throw new Error("alphabet.decode input should be array of strings");
        return input.map((letter) => {
          if (typeof letter !== "string")
            throw new Error(`alphabet.decode: not string element=${letter}`);
          const index = alphabet2.indexOf(letter);
          if (index === -1)
            throw new Error(`Unknown letter: "${letter}". Allowed: ${alphabet2}`);
          return index;
        });
      }
    };
  }
  function join(separator = "") {
    if (typeof separator !== "string")
      throw new Error("join separator should be string");
    return {
      encode: (from) => {
        if (!Array.isArray(from) || from.length && typeof from[0] !== "string")
          throw new Error("join.encode input should be array of strings");
        for (let i of from)
          if (typeof i !== "string")
            throw new Error(`join.encode: non-string input=${i}`);
        return from.join(separator);
      },
      decode: (to) => {
        if (typeof to !== "string")
          throw new Error("join.decode input should be string");
        return to.split(separator);
      }
    };
  }
  function padding(bits, chr = "=") {
    assertNumber(bits);
    if (typeof chr !== "string")
      throw new Error("padding chr should be string");
    return {
      encode(data) {
        if (!Array.isArray(data) || data.length && typeof data[0] !== "string")
          throw new Error("padding.encode input should be array of strings");
        for (let i of data)
          if (typeof i !== "string")
            throw new Error(`padding.encode: non-string input=${i}`);
        while (data.length * bits % 8)
          data.push(chr);
        return data;
      },
      decode(input) {
        if (!Array.isArray(input) || input.length && typeof input[0] !== "string")
          throw new Error("padding.encode input should be array of strings");
        for (let i of input)
          if (typeof i !== "string")
            throw new Error(`padding.decode: non-string input=${i}`);
        let end = input.length;
        if (end * bits % 8)
          throw new Error("Invalid padding: string should have whole number of bytes");
        for (; end > 0 && input[end - 1] === chr; end--) {
          if (!((end - 1) * bits % 8))
            throw new Error("Invalid padding: string has too much padding");
        }
        return input.slice(0, end);
      }
    };
  }
  function normalize(fn) {
    if (typeof fn !== "function")
      throw new Error("normalize fn should be function");
    return { encode: (from) => from, decode: (to) => fn(to) };
  }
  function convertRadix(data, from, to) {
    if (from < 2)
      throw new Error(`convertRadix: wrong from=${from}, base cannot be less than 2`);
    if (to < 2)
      throw new Error(`convertRadix: wrong to=${to}, base cannot be less than 2`);
    if (!Array.isArray(data))
      throw new Error("convertRadix: data should be array");
    if (!data.length)
      return [];
    let pos = 0;
    const res = [];
    const digits = Array.from(data);
    digits.forEach((d) => {
      assertNumber(d);
      if (d < 0 || d >= from)
        throw new Error(`Wrong integer: ${d}`);
    });
    while (true) {
      let carry = 0;
      let done = true;
      for (let i = pos; i < digits.length; i++) {
        const digit = digits[i];
        const digitBase = from * carry + digit;
        if (!Number.isSafeInteger(digitBase) || from * carry / from !== carry || digitBase - digit !== from * carry) {
          throw new Error("convertRadix: carry overflow");
        }
        carry = digitBase % to;
        const rounded = Math.floor(digitBase / to);
        digits[i] = rounded;
        if (!Number.isSafeInteger(rounded) || rounded * to + carry !== digitBase)
          throw new Error("convertRadix: carry overflow");
        if (!done)
          continue;
        else if (!rounded)
          pos = i;
        else
          done = false;
      }
      res.push(carry);
      if (done)
        break;
    }
    for (let i = 0; i < data.length - 1 && data[i] === 0; i++)
      res.push(0);
    return res.reverse();
  }
  var gcd = (
    /* @__NO_SIDE_EFFECTS__ */
    (a, b) => !b ? a : gcd(b, a % b)
  );
  var radix2carry = (
    /*@__NO_SIDE_EFFECTS__ */
    (from, to) => from + (to - gcd(from, to))
  );
  function convertRadix2(data, from, to, padding2) {
    if (!Array.isArray(data))
      throw new Error("convertRadix2: data should be array");
    if (from <= 0 || from > 32)
      throw new Error(`convertRadix2: wrong from=${from}`);
    if (to <= 0 || to > 32)
      throw new Error(`convertRadix2: wrong to=${to}`);
    if (radix2carry(from, to) > 32) {
      throw new Error(`convertRadix2: carry overflow from=${from} to=${to} carryBits=${radix2carry(from, to)}`);
    }
    let carry = 0;
    let pos = 0;
    const mask = 2 ** to - 1;
    const res = [];
    for (const n of data) {
      assertNumber(n);
      if (n >= 2 ** from)
        throw new Error(`convertRadix2: invalid data word=${n} from=${from}`);
      carry = carry << from | n;
      if (pos + from > 32)
        throw new Error(`convertRadix2: carry overflow pos=${pos} from=${from}`);
      pos += from;
      for (; pos >= to; pos -= to)
        res.push((carry >> pos - to & mask) >>> 0);
      carry &= 2 ** pos - 1;
    }
    carry = carry << to - pos & mask;
    if (!padding2 && pos >= from)
      throw new Error("Excess padding");
    if (!padding2 && carry)
      throw new Error(`Non-zero padding: ${carry}`);
    if (padding2 && pos > 0)
      res.push(carry >>> 0);
    return res;
  }
  function radix(num) {
    assertNumber(num);
    return {
      encode: (bytes2) => {
        if (!isBytes3(bytes2))
          throw new Error("radix.encode input should be Uint8Array");
        return convertRadix(Array.from(bytes2), 2 ** 8, num);
      },
      decode: (digits) => {
        if (!Array.isArray(digits) || digits.length && typeof digits[0] !== "number")
          throw new Error("radix.decode input should be array of numbers");
        return Uint8Array.from(convertRadix(digits, num, 2 ** 8));
      }
    };
  }
  function radix2(bits, revPadding = false) {
    assertNumber(bits);
    if (bits <= 0 || bits > 32)
      throw new Error("radix2: bits should be in (0..32]");
    if (radix2carry(8, bits) > 32 || radix2carry(bits, 8) > 32)
      throw new Error("radix2: carry overflow");
    return {
      encode: (bytes2) => {
        if (!isBytes3(bytes2))
          throw new Error("radix2.encode input should be Uint8Array");
        return convertRadix2(Array.from(bytes2), 8, bits, !revPadding);
      },
      decode: (digits) => {
        if (!Array.isArray(digits) || digits.length && typeof digits[0] !== "number")
          throw new Error("radix2.decode input should be array of numbers");
        return Uint8Array.from(convertRadix2(digits, bits, 8, revPadding));
      }
    };
  }
  function checksum(len, fn) {
    assertNumber(len);
    if (typeof fn !== "function")
      throw new Error("checksum fn should be function");
    return {
      encode(data) {
        if (!isBytes3(data))
          throw new Error("checksum.encode: input should be Uint8Array");
        const checksum2 = fn(data).slice(0, len);
        const res = new Uint8Array(data.length + len);
        res.set(data);
        res.set(checksum2, data.length);
        return res;
      },
      decode(data) {
        if (!isBytes3(data))
          throw new Error("checksum.decode: input should be Uint8Array");
        const payload = data.slice(0, -len);
        const newChecksum = fn(payload).slice(0, len);
        const oldChecksum = data.slice(-len);
        for (let i = 0; i < len; i++)
          if (newChecksum[i] !== oldChecksum[i])
            throw new Error("Invalid checksum");
        return payload;
      }
    };
  }
  var utils = {
    alphabet,
    chain,
    checksum,
    convertRadix,
    convertRadix2,
    radix,
    radix2,
    join,
    padding
  };
  var base16 = /* @__PURE__ */ chain(radix2(4), alphabet("0123456789ABCDEF"), join(""));
  var base32 = /* @__PURE__ */ chain(radix2(5), alphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"), padding(5), join(""));
  var base32nopad = /* @__PURE__ */ chain(radix2(5), alphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"), join(""));
  var base32hex = /* @__PURE__ */ chain(radix2(5), alphabet("0123456789ABCDEFGHIJKLMNOPQRSTUV"), padding(5), join(""));
  var base32hexnopad = /* @__PURE__ */ chain(radix2(5), alphabet("0123456789ABCDEFGHIJKLMNOPQRSTUV"), join(""));
  var base32crockford = /* @__PURE__ */ chain(radix2(5), alphabet("0123456789ABCDEFGHJKMNPQRSTVWXYZ"), join(""), normalize((s) => s.toUpperCase().replace(/O/g, "0").replace(/[IL]/g, "1")));
  var base64 = /* @__PURE__ */ chain(radix2(6), alphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"), padding(6), join(""));
  var base64nopad = /* @__PURE__ */ chain(radix2(6), alphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"), join(""));
  var base64url = /* @__PURE__ */ chain(radix2(6), alphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"), padding(6), join(""));
  var base64urlnopad = /* @__PURE__ */ chain(radix2(6), alphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"), join(""));
  var BECH_ALPHABET = /* @__PURE__ */ chain(alphabet("qpzry9x8gf2tvdw0s3jn54khce6mua7l"), join(""));
  var hex = /* @__PURE__ */ chain(radix2(4), alphabet("0123456789abcdef"), join(""), normalize((s) => {
    if (typeof s !== "string" || s.length % 2)
      throw new TypeError(`hex.decode: expected string, got ${typeof s} with length ${s.length}`);
    return s.toLowerCase();
  }));

  // ../../../@scure/bip39/esm/index.js
  function nfkd(str) {
    if (typeof str !== "string")
      throw new TypeError(`Invalid mnemonic type: ${typeof str}`);
    return str.normalize("NFKD");
  }
  function normalize2(str) {
    const norm = nfkd(str);
    const words = norm.split(" ");
    if (![12, 15, 18, 21, 24].includes(words.length))
      throw new Error("Invalid mnemonic");
    return { nfkd: norm, words };
  }
  function assertEntropy(entropy) {
    bytes(entropy, 16, 20, 24, 28, 32);
  }
  var calcChecksum = (entropy) => {
    const bitsLeft = 8 - entropy.length / 4;
    return new Uint8Array([sha256(entropy)[0] >> bitsLeft << bitsLeft]);
  };
  function getCoder(wordlist2) {
    if (!Array.isArray(wordlist2) || wordlist2.length !== 2048 || typeof wordlist2[0] !== "string")
      throw new Error("Wordlist: expected array of 2048 strings");
    wordlist2.forEach((i) => {
      if (typeof i !== "string")
        throw new Error(`Wordlist: non-string element: ${i}`);
    });
    return utils.chain(utils.checksum(1, calcChecksum), utils.radix2(11, true), utils.alphabet(wordlist2));
  }
  function mnemonicToEntropy(mnemonic, wordlist2) {
    const { words } = normalize2(mnemonic);
    const entropy = getCoder(wordlist2).decode(words);
    assertEntropy(entropy);
    return entropy;
  }
  function validateMnemonic(mnemonic, wordlist2) {
    try {
      mnemonicToEntropy(mnemonic, wordlist2);
    } catch (e) {
      return false;
    }
    return true;
  }

  // ../../../@scure/bip39/esm/wordlists/english.js
  var wordlist = `abandon
ability
able
about
above
absent
absorb
abstract
absurd
abuse
access
accident
account
accuse
achieve
acid
acoustic
acquire
across
act
action
actor
actress
actual
adapt
add
addict
address
adjust
admit
adult
advance
advice
aerobic
affair
afford
afraid
again
age
agent
agree
ahead
aim
air
airport
aisle
alarm
album
alcohol
alert
alien
all
alley
allow
almost
alone
alpha
already
also
alter
always
amateur
amazing
among
amount
amused
analyst
anchor
ancient
anger
angle
angry
animal
ankle
announce
annual
another
answer
antenna
antique
anxiety
any
apart
apology
appear
apple
approve
april
arch
arctic
area
arena
argue
arm
armed
armor
army
around
arrange
arrest
arrive
arrow
art
artefact
artist
artwork
ask
aspect
assault
asset
assist
assume
asthma
athlete
atom
attack
attend
attitude
attract
auction
audit
august
aunt
author
auto
autumn
average
avocado
avoid
awake
aware
away
awesome
awful
awkward
axis
baby
bachelor
bacon
badge
bag
balance
balcony
ball
bamboo
banana
banner
bar
barely
bargain
barrel
base
basic
basket
battle
beach
bean
beauty
because
become
beef
before
begin
behave
behind
believe
below
belt
bench
benefit
best
betray
better
between
beyond
bicycle
bid
bike
bind
biology
bird
birth
bitter
black
blade
blame
blanket
blast
bleak
bless
blind
blood
blossom
blouse
blue
blur
blush
board
boat
body
boil
bomb
bone
bonus
book
boost
border
boring
borrow
boss
bottom
bounce
box
boy
bracket
brain
brand
brass
brave
bread
breeze
brick
bridge
brief
bright
bring
brisk
broccoli
broken
bronze
broom
brother
brown
brush
bubble
buddy
budget
buffalo
build
bulb
bulk
bullet
bundle
bunker
burden
burger
burst
bus
business
busy
butter
buyer
buzz
cabbage
cabin
cable
cactus
cage
cake
call
calm
camera
camp
can
canal
cancel
candy
cannon
canoe
canvas
canyon
capable
capital
captain
car
carbon
card
cargo
carpet
carry
cart
case
cash
casino
castle
casual
cat
catalog
catch
category
cattle
caught
cause
caution
cave
ceiling
celery
cement
census
century
cereal
certain
chair
chalk
champion
change
chaos
chapter
charge
chase
chat
cheap
check
cheese
chef
cherry
chest
chicken
chief
child
chimney
choice
choose
chronic
chuckle
chunk
churn
cigar
cinnamon
circle
citizen
city
civil
claim
clap
clarify
claw
clay
clean
clerk
clever
click
client
cliff
climb
clinic
clip
clock
clog
close
cloth
cloud
clown
club
clump
cluster
clutch
coach
coast
coconut
code
coffee
coil
coin
collect
color
column
combine
come
comfort
comic
common
company
concert
conduct
confirm
congress
connect
consider
control
convince
cook
cool
copper
copy
coral
core
corn
correct
cost
cotton
couch
country
couple
course
cousin
cover
coyote
crack
cradle
craft
cram
crane
crash
crater
crawl
crazy
cream
credit
creek
crew
cricket
crime
crisp
critic
crop
cross
crouch
crowd
crucial
cruel
cruise
crumble
crunch
crush
cry
crystal
cube
culture
cup
cupboard
curious
current
curtain
curve
cushion
custom
cute
cycle
dad
damage
damp
dance
danger
daring
dash
daughter
dawn
day
deal
debate
debris
decade
december
decide
decline
decorate
decrease
deer
defense
define
defy
degree
delay
deliver
demand
demise
denial
dentist
deny
depart
depend
deposit
depth
deputy
derive
describe
desert
design
desk
despair
destroy
detail
detect
develop
device
devote
diagram
dial
diamond
diary
dice
diesel
diet
differ
digital
dignity
dilemma
dinner
dinosaur
direct
dirt
disagree
discover
disease
dish
dismiss
disorder
display
distance
divert
divide
divorce
dizzy
doctor
document
dog
doll
dolphin
domain
donate
donkey
donor
door
dose
double
dove
draft
dragon
drama
drastic
draw
dream
dress
drift
drill
drink
drip
drive
drop
drum
dry
duck
dumb
dune
during
dust
dutch
duty
dwarf
dynamic
eager
eagle
early
earn
earth
easily
east
easy
echo
ecology
economy
edge
edit
educate
effort
egg
eight
either
elbow
elder
electric
elegant
element
elephant
elevator
elite
else
embark
embody
embrace
emerge
emotion
employ
empower
empty
enable
enact
end
endless
endorse
enemy
energy
enforce
engage
engine
enhance
enjoy
enlist
enough
enrich
enroll
ensure
enter
entire
entry
envelope
episode
equal
equip
era
erase
erode
erosion
error
erupt
escape
essay
essence
estate
eternal
ethics
evidence
evil
evoke
evolve
exact
example
excess
exchange
excite
exclude
excuse
execute
exercise
exhaust
exhibit
exile
exist
exit
exotic
expand
expect
expire
explain
expose
express
extend
extra
eye
eyebrow
fabric
face
faculty
fade
faint
faith
fall
false
fame
family
famous
fan
fancy
fantasy
farm
fashion
fat
fatal
father
fatigue
fault
favorite
feature
february
federal
fee
feed
feel
female
fence
festival
fetch
fever
few
fiber
fiction
field
figure
file
film
filter
final
find
fine
finger
finish
fire
firm
first
fiscal
fish
fit
fitness
fix
flag
flame
flash
flat
flavor
flee
flight
flip
float
flock
floor
flower
fluid
flush
fly
foam
focus
fog
foil
fold
follow
food
foot
force
forest
forget
fork
fortune
forum
forward
fossil
foster
found
fox
fragile
frame
frequent
fresh
friend
fringe
frog
front
frost
frown
frozen
fruit
fuel
fun
funny
furnace
fury
future
gadget
gain
galaxy
gallery
game
gap
garage
garbage
garden
garlic
garment
gas
gasp
gate
gather
gauge
gaze
general
genius
genre
gentle
genuine
gesture
ghost
giant
gift
giggle
ginger
giraffe
girl
give
glad
glance
glare
glass
glide
glimpse
globe
gloom
glory
glove
glow
glue
goat
goddess
gold
good
goose
gorilla
gospel
gossip
govern
gown
grab
grace
grain
grant
grape
grass
gravity
great
green
grid
grief
grit
grocery
group
grow
grunt
guard
guess
guide
guilt
guitar
gun
gym
habit
hair
half
hammer
hamster
hand
happy
harbor
hard
harsh
harvest
hat
have
hawk
hazard
head
health
heart
heavy
hedgehog
height
hello
helmet
help
hen
hero
hidden
high
hill
hint
hip
hire
history
hobby
hockey
hold
hole
holiday
hollow
home
honey
hood
hope
horn
horror
horse
hospital
host
hotel
hour
hover
hub
huge
human
humble
humor
hundred
hungry
hunt
hurdle
hurry
hurt
husband
hybrid
ice
icon
idea
identify
idle
ignore
ill
illegal
illness
image
imitate
immense
immune
impact
impose
improve
impulse
inch
include
income
increase
index
indicate
indoor
industry
infant
inflict
inform
inhale
inherit
initial
inject
injury
inmate
inner
innocent
input
inquiry
insane
insect
inside
inspire
install
intact
interest
into
invest
invite
involve
iron
island
isolate
issue
item
ivory
jacket
jaguar
jar
jazz
jealous
jeans
jelly
jewel
job
join
joke
journey
joy
judge
juice
jump
jungle
junior
junk
just
kangaroo
keen
keep
ketchup
key
kick
kid
kidney
kind
kingdom
kiss
kit
kitchen
kite
kitten
kiwi
knee
knife
knock
know
lab
label
labor
ladder
lady
lake
lamp
language
laptop
large
later
latin
laugh
laundry
lava
law
lawn
lawsuit
layer
lazy
leader
leaf
learn
leave
lecture
left
leg
legal
legend
leisure
lemon
lend
length
lens
leopard
lesson
letter
level
liar
liberty
library
license
life
lift
light
like
limb
limit
link
lion
liquid
list
little
live
lizard
load
loan
lobster
local
lock
logic
lonely
long
loop
lottery
loud
lounge
love
loyal
lucky
luggage
lumber
lunar
lunch
luxury
lyrics
machine
mad
magic
magnet
maid
mail
main
major
make
mammal
man
manage
mandate
mango
mansion
manual
maple
marble
march
margin
marine
market
marriage
mask
mass
master
match
material
math
matrix
matter
maximum
maze
meadow
mean
measure
meat
mechanic
medal
media
melody
melt
member
memory
mention
menu
mercy
merge
merit
merry
mesh
message
metal
method
middle
midnight
milk
million
mimic
mind
minimum
minor
minute
miracle
mirror
misery
miss
mistake
mix
mixed
mixture
mobile
model
modify
mom
moment
monitor
monkey
monster
month
moon
moral
more
morning
mosquito
mother
motion
motor
mountain
mouse
move
movie
much
muffin
mule
multiply
muscle
museum
mushroom
music
must
mutual
myself
mystery
myth
naive
name
napkin
narrow
nasty
nation
nature
near
neck
need
negative
neglect
neither
nephew
nerve
nest
net
network
neutral
never
news
next
nice
night
noble
noise
nominee
noodle
normal
north
nose
notable
note
nothing
notice
novel
now
nuclear
number
nurse
nut
oak
obey
object
oblige
obscure
observe
obtain
obvious
occur
ocean
october
odor
off
offer
office
often
oil
okay
old
olive
olympic
omit
once
one
onion
online
only
open
opera
opinion
oppose
option
orange
orbit
orchard
order
ordinary
organ
orient
original
orphan
ostrich
other
outdoor
outer
output
outside
oval
oven
over
own
owner
oxygen
oyster
ozone
pact
paddle
page
pair
palace
palm
panda
panel
panic
panther
paper
parade
parent
park
parrot
party
pass
patch
path
patient
patrol
pattern
pause
pave
payment
peace
peanut
pear
peasant
pelican
pen
penalty
pencil
people
pepper
perfect
permit
person
pet
phone
photo
phrase
physical
piano
picnic
picture
piece
pig
pigeon
pill
pilot
pink
pioneer
pipe
pistol
pitch
pizza
place
planet
plastic
plate
play
please
pledge
pluck
plug
plunge
poem
poet
point
polar
pole
police
pond
pony
pool
popular
portion
position
possible
post
potato
pottery
poverty
powder
power
practice
praise
predict
prefer
prepare
present
pretty
prevent
price
pride
primary
print
priority
prison
private
prize
problem
process
produce
profit
program
project
promote
proof
property
prosper
protect
proud
provide
public
pudding
pull
pulp
pulse
pumpkin
punch
pupil
puppy
purchase
purity
purpose
purse
push
put
puzzle
pyramid
quality
quantum
quarter
question
quick
quit
quiz
quote
rabbit
raccoon
race
rack
radar
radio
rail
rain
raise
rally
ramp
ranch
random
range
rapid
rare
rate
rather
raven
raw
razor
ready
real
reason
rebel
rebuild
recall
receive
recipe
record
recycle
reduce
reflect
reform
refuse
region
regret
regular
reject
relax
release
relief
rely
remain
remember
remind
remove
render
renew
rent
reopen
repair
repeat
replace
report
require
rescue
resemble
resist
resource
response
result
retire
retreat
return
reunion
reveal
review
reward
rhythm
rib
ribbon
rice
rich
ride
ridge
rifle
right
rigid
ring
riot
ripple
risk
ritual
rival
river
road
roast
robot
robust
rocket
romance
roof
rookie
room
rose
rotate
rough
round
route
royal
rubber
rude
rug
rule
run
runway
rural
sad
saddle
sadness
safe
sail
salad
salmon
salon
salt
salute
same
sample
sand
satisfy
satoshi
sauce
sausage
save
say
scale
scan
scare
scatter
scene
scheme
school
science
scissors
scorpion
scout
scrap
screen
script
scrub
sea
search
season
seat
second
secret
section
security
seed
seek
segment
select
sell
seminar
senior
sense
sentence
series
service
session
settle
setup
seven
shadow
shaft
shallow
share
shed
shell
sheriff
shield
shift
shine
ship
shiver
shock
shoe
shoot
shop
short
shoulder
shove
shrimp
shrug
shuffle
shy
sibling
sick
side
siege
sight
sign
silent
silk
silly
silver
similar
simple
since
sing
siren
sister
situate
six
size
skate
sketch
ski
skill
skin
skirt
skull
slab
slam
sleep
slender
slice
slide
slight
slim
slogan
slot
slow
slush
small
smart
smile
smoke
smooth
snack
snake
snap
sniff
snow
soap
soccer
social
sock
soda
soft
solar
soldier
solid
solution
solve
someone
song
soon
sorry
sort
soul
sound
soup
source
south
space
spare
spatial
spawn
speak
special
speed
spell
spend
sphere
spice
spider
spike
spin
spirit
split
spoil
sponsor
spoon
sport
spot
spray
spread
spring
spy
square
squeeze
squirrel
stable
stadium
staff
stage
stairs
stamp
stand
start
state
stay
steak
steel
stem
step
stereo
stick
still
sting
stock
stomach
stone
stool
story
stove
strategy
street
strike
strong
struggle
student
stuff
stumble
style
subject
submit
subway
success
such
sudden
suffer
sugar
suggest
suit
summer
sun
sunny
sunset
super
supply
supreme
sure
surface
surge
surprise
surround
survey
suspect
sustain
swallow
swamp
swap
swarm
swear
sweet
swift
swim
swing
switch
sword
symbol
symptom
syrup
system
table
tackle
tag
tail
talent
talk
tank
tape
target
task
taste
tattoo
taxi
teach
team
tell
ten
tenant
tennis
tent
term
test
text
thank
that
theme
then
theory
there
they
thing
this
thought
three
thrive
throw
thumb
thunder
ticket
tide
tiger
tilt
timber
time
tiny
tip
tired
tissue
title
toast
tobacco
today
toddler
toe
together
toilet
token
tomato
tomorrow
tone
tongue
tonight
tool
tooth
top
topic
topple
torch
tornado
tortoise
toss
total
tourist
toward
tower
town
toy
track
trade
traffic
tragic
train
transfer
trap
trash
travel
tray
treat
tree
trend
trial
tribe
trick
trigger
trim
trip
trophy
trouble
truck
true
truly
trumpet
trust
truth
try
tube
tuition
tumble
tuna
tunnel
turkey
turn
turtle
twelve
twenty
twice
twin
twist
two
type
typical
ugly
umbrella
unable
unaware
uncle
uncover
under
undo
unfair
unfold
unhappy
uniform
unique
unit
universe
unknown
unlock
until
unusual
unveil
update
upgrade
uphold
upon
upper
upset
urban
urge
usage
use
used
useful
useless
usual
utility
vacant
vacuum
vague
valid
valley
valve
van
vanish
vapor
various
vast
vault
vehicle
velvet
vendor
venture
venue
verb
verify
version
very
vessel
veteran
viable
vibrant
vicious
victory
video
view
village
vintage
violin
virtual
virus
visa
visit
visual
vital
vivid
vocal
voice
void
volcano
volume
vote
voyage
wage
wagon
wait
walk
wall
walnut
want
warfare
warm
warrior
wash
wasp
waste
water
wave
way
wealth
weapon
wear
weasel
weather
web
wedding
weekend
weird
welcome
west
wet
whale
what
wheat
wheel
when
where
whip
whisper
wide
width
wife
wild
will
win
window
wine
wing
wink
winner
winter
wire
wisdom
wise
wish
witness
wolf
woman
wonder
wood
wool
word
work
world
worry
worth
wrap
wreck
wrestle
wrist
write
wrong
yard
year
yellow
you
young
youth
zebra
zero
zone
zoo`.split("\n");

  // CashuWallet.ts
  var import_common = __toESM(require_common());
  var import_client = __toESM(require_client());
  var import_NUT09 = __toESM(require_NUT09());
  var import_NUT11 = __toESM(require_NUT112());
  var CashuWallet = class {
    /**
     * @param unit optionally set unit
     * @param keys public keys from the mint. If set, it will override the unit with the keysets unit
     * @param mint Cashu mint instance is used to make api calls
     * @param mnemonicOrSeed mnemonic phrase or Seed to initial derivation key for this wallets deterministic secrets. When the mnemonic is provided, the seed will be derived from it.
     * This can lead to poor performance, in which case the seed should be directly provided
     */
    constructor(mint, options) {
      this._unit = "sat";
      this.mint = mint;
      if (options?.unit)
        this._unit = options?.unit;
      if (options?.keys) {
        this._keys = options.keys;
        this._unit = options.keys.unit;
      }
      if (!options?.mnemonicOrSeed) {
        return;
      }
      if (options?.mnemonicOrSeed instanceof Uint8Array) {
        this._seed = options.mnemonicOrSeed;
        return;
      }
      if (!validateMnemonic(options.mnemonicOrSeed, wordlist)) {
        throw new Error("Tried to instantiate with mnemonic, but mnemonic was invalid");
      }
      this._seed = (0, import_NUT09.deriveSeedFromMnemonic)(options.mnemonicOrSeed);
    }
    get unit() {
      return this._unit;
    }
    get keys() {
      if (!this._keys) {
        throw new Error("Keys are not set");
      }
      return this._keys;
    }
    set keys(keys) {
      this._keys = keys;
      this._unit = keys.unit;
    }
    /**
     * Get information about the mint
     * @returns mint info
     */
    async getMintInfo() {
      return this.mint.getInfo();
    }
    /**
     * Receive an encoded or raw Cashu token (only supports single tokens. It will only process the first token in the token array)
     * @param {(string|Token)} token - Cashu token
     * @param preference optional preference for splitting proofs into specific amounts
     * @param counter? optionally set counter to derive secret deterministically. CashuWallet class must be initialized with seed phrase to take effect
     * @param pubkey? optionally locks ecash to pubkey. Will not be deterministic, even if counter is set!
     * @param privkey? will create a signature on the @param token secrets if set
     * @returns New token with newly created proofs, token entries that had errors
     */
    async receive(token, options) {
      if (typeof token === "string") {
        token = getDecodedToken(token);
      }
      const tokenEntries = token.token;
      const proofs = await this.receiveTokenEntry(tokenEntries[0], {
        keysetId: options?.keysetId,
        preference: options?.preference,
        counter: options?.counter,
        pubkey: options?.pubkey,
        privkey: options?.privkey
      });
      return proofs;
    }
    /**
     * Receive a single cashu token entry
     * @param tokenEntry a single entry of a cashu token
     * @param preference optional preference for splitting proofs into specific amounts.
     * @param counter? optionally set counter to derive secret deterministically. CashuWallet class must be initialized with seed phrase to take effect
     * @param pubkey? optionally locks ecash to pubkey. Will not be deterministic, even if counter is set!
     * @param privkey? will create a signature on the @param tokenEntry secrets if set
     * @returns New token entry with newly created proofs, proofs that had errors
     */
    async receiveTokenEntry(tokenEntry, options) {
      const proofs = [];
      const amount = tokenEntry.proofs.reduce((total, curr) => total + curr.amount, 0);
      let preference = options?.preference;
      const keys = await this.getKeys(options?.keysetId);
      if (!preference) {
        preference = getDefaultAmountPreference(amount, keys);
      }
      const pref = { sendPreference: preference };
      const { payload, blindedMessages } = this.createSwapPayload(
        amount,
        tokenEntry.proofs,
        keys,
        pref,
        options?.counter,
        options?.pubkey,
        options?.privkey
      );
      const { signatures } = await CashuMint.split(tokenEntry.mint, payload);
      const newProofs = this.constructProofs(
        signatures,
        blindedMessages.rs,
        blindedMessages.secrets,
        keys
      );
      proofs.push(...newProofs);
      return proofs;
    }
    /**
     * Splits and creates sendable tokens
     * if no amount is specified, the amount is implied by the cumulative amount of all proofs
     * if both amount and preference are set, but the preference cannot fulfill the amount, then we use the default split
     * @param amount amount to send while performing the optimal split (least proofs possible). can be set to undefined if preference is set
     * @param proofs proofs matching that amount
     * @param preference optional preference for splitting proofs into specific amounts. overrides amount param
     * @param counter? optionally set counter to derive secret deterministically. CashuWallet class must be initialized with seed phrase to take effect
     * @param pubkey? optionally locks ecash to pubkey. Will not be deterministic, even if counter is set!
     * @param privkey? will create a signature on the @param proofs secrets if set
     * @returns promise of the change- and send-proofs
     */
    async send(amount, proofs, options) {
      if (options?.preference) {
        if (isAmountPreferenceArray(options.preference)) {
          options.preference = deprecatedAmountPreferences(options.preference);
        }
        amount = options?.preference?.sendPreference.reduce(
          (acc, curr) => acc + curr.amount * curr.count,
          0
        );
      }
      const keyset = await this.getKeys(options?.keysetId);
      let amountAvailable = 0;
      const proofsToSend = [];
      const proofsToKeep = [];
      proofs.forEach((proof) => {
        if (amountAvailable >= amount) {
          proofsToKeep.push(proof);
          return;
        }
        amountAvailable = amountAvailable + proof.amount;
        proofsToSend.push(proof);
      });
      if (amount > amountAvailable) {
        throw new Error("Not enough funds available");
      }
      if (amount < amountAvailable || options?.preference || options?.pubkey) {
        const { amountKeep, amountSend } = this.splitReceive(amount, amountAvailable);
        const { payload, blindedMessages } = this.createSwapPayload(
          amountSend,
          proofsToSend,
          keyset,
          options?.preference,
          options?.counter,
          options?.pubkey,
          options?.privkey
        );
        const { signatures } = await this.mint.split(payload);
        const proofs2 = this.constructProofs(
          signatures,
          blindedMessages.rs,
          blindedMessages.secrets,
          keyset
        );
        const splitProofsToKeep = [];
        const splitProofsToSend = [];
        let amountKeepCounter = 0;
        proofs2.forEach((proof) => {
          if (amountKeepCounter < amountKeep) {
            amountKeepCounter += proof.amount;
            splitProofsToKeep.push(proof);
            return;
          }
          splitProofsToSend.push(proof);
        });
        return {
          returnChange: [...splitProofsToKeep, ...proofsToKeep],
          send: splitProofsToSend
        };
      }
      return { returnChange: proofsToKeep, send: proofsToSend };
    }
    /**
     * Regenerates
     * @param start set starting point for count (first cycle for each keyset should usually be 0)
     * @param count set number of blinded messages that should be generated
     * @returns proofs
     */
    async restore(start, count, options) {
      const keys = await this.getKeys(options?.keysetId);
      if (!this._seed) {
        throw new Error("CashuWallet must be initialized with mnemonic to use restore");
      }
      const amounts = Array(count).fill(0);
      const { blindedMessages, rs, secrets } = this.createBlindedMessages(amounts, keys.id, start);
      const { outputs, promises } = await this.mint.restore({ outputs: blindedMessages });
      const validRs = rs.filter(
        (_, i) => outputs.map((o) => o.B_).includes(blindedMessages[i].B_)
      );
      const validSecrets = secrets.filter(
        (_, i) => outputs.map((o) => o.B_).includes(blindedMessages[i].B_)
      );
      return {
        proofs: this.constructProofs(promises, validRs, validSecrets, keys)
      };
    }
    /**
     * Initialize the wallet with the mints public keys
     */
    async getKeys(keysetId, unit) {
      if (!this._keys || keysetId !== void 0 && this._keys.id !== keysetId) {
        const allKeys = await this.mint.getKeys(keysetId);
        let keys;
        if (keysetId) {
          keys = allKeys.keysets.find((k) => k.id === keysetId);
        } else {
          keys = allKeys.keysets.find((k) => unit ? k.unit === unit : k.unit === "sat");
        }
        if (!keys) {
          throw new Error(
            `could not initialize keys. No keyset with unit '${unit ? unit : "sat"}' found`
          );
        }
        if (!this._keys) {
          this._keys = keys;
        }
      }
      return this._keys;
    }
    /**
     * Requests a mint quote form the mint. Response returns a Lightning payment request for the requested given amount and unit.
     * @param amount Amount requesting for mint.
     * @param description optional description for the mint quote
     * @returns the mint will return a mint quote with a Lightning invoice for minting tokens of the specified amount and unit
     */
    async createMintQuote(amount, description) {
      const mintQuotePayload = {
        unit: this._unit,
        amount,
        description
      };
      return await this.mint.createMintQuote(mintQuotePayload);
    }
    /**
     * Gets an existing mint quote from the mint.
     * @param quote Quote ID
     * @returns the mint will create and return a Lightning invoice for the specified amount
     */
    async checkMintQuote(quote) {
      return await this.mint.checkMintQuote(quote);
    }
    /**
     * Mint tokens for a given mint quote
     * @param amount amount to request
     * @param quote ID of mint quote
     * @returns proofs
     */
    async mintTokens(amount, quote, options) {
      const keyset = await this.getKeys(options?.keysetId);
      const { blindedMessages, secrets, rs } = this.createRandomBlindedMessages(
        amount,
        keyset,
        options?.preference,
        options?.counter,
        options?.pubkey
      );
      const mintPayload = {
        outputs: blindedMessages,
        quote
      };
      const { signatures } = await this.mint.mint(mintPayload);
      return {
        proofs: this.constructProofs(signatures, rs, secrets, keyset)
      };
    }
    /**
     * Requests a melt quote from the mint. Response returns amount and fees for a given unit in order to pay a Lightning invoice.
     * @param invoice LN invoice that needs to get a fee estimate
     * @returns the mint will create and return a melt quote for the invoice with an amount and fee reserve
     */
    async createMeltQuote(invoice) {
      const meltQuotePayload = {
        unit: this._unit,
        request: invoice
      };
      const meltQuote = await this.mint.createMeltQuote(meltQuotePayload);
      return meltQuote;
    }
    /**
     * Return an existing melt quote from the mint.
     * @param quote ID of the melt quote
     * @returns the mint will return an existing melt quote
     */
    async checkMeltQuote(quote) {
      const meltQuote = await this.mint.checkMeltQuote(quote);
      return meltQuote;
    }
    /**
     * Melt tokens for a melt quote. proofsToSend must be at least amount+fee_reserve form the melt quote.
     * Returns payment proof and change proofs
     * @param meltQuote ID of the melt quote
     * @param proofsToSend proofs to melt
     * @param options.keysetId? optionally set keysetId for blank outputs for returned change.
     * @param options.counter? optionally set counter to derive secret deterministically. CashuWallet class must be initialized with seed phrase to take effect
     * @param options.privkey? optionally set a private key to unlock P2PK locked secrets
     * @returns
     */
    async meltTokens(meltQuote, proofsToSend, options) {
      const keys = await this.getKeys(options?.keysetId);
      const { blindedMessages, secrets, rs } = this.createBlankOutputs(
        meltQuote.fee_reserve,
        keys.id,
        options?.counter
      );
      if (options?.privkey != void 0) {
        proofsToSend = (0, import_NUT11.getSignedProofs)(
          proofsToSend.map((p) => {
            return {
              amount: p.amount,
              C: (0, import_common.pointFromHex)(p.C),
              id: p.id,
              secret: new TextEncoder().encode(p.secret)
            };
          }),
          options.privkey
        ).map((p) => (0, import_client.serializeProof)(p));
      }
      const meltPayload = {
        quote: meltQuote.quote,
        inputs: proofsToSend,
        outputs: [...blindedMessages]
      };
      const meltResponse = await this.mint.melt(meltPayload);
      return {
        isPaid: meltResponse.state === "PAID" /* PAID */,
        preimage: meltResponse.payment_preimage,
        change: meltResponse?.change ? this.constructProofs(meltResponse.change, rs, secrets, keys) : []
      };
    }
    /**
     * Helper function that pays a Lightning invoice directly without having to create a melt quote before
     * The combined amount of Proofs must match the payment amount including fees.
     * @param invoice
     * @param proofsToSend the exact amount to send including fees
     * @param meltQuote melt quote for the invoice
     * @param options.keysetId? optionally set keysetId for blank outputs for returned change.
     * @param options.counter? optionally set counter to derive secret deterministically. CashuWallet class must be initialized with seed phrase to take effect
     * @param options.privkey? optionally set a private key to unlock P2PK locked secrets
     * @returns
     */
    async payLnInvoice(invoice, proofsToSend, meltQuote, options) {
      if (!meltQuote) {
        meltQuote = await this.mint.createMeltQuote({ unit: this._unit, request: invoice });
      }
      return await this.meltTokens(meltQuote, proofsToSend, {
        keysetId: options?.keysetId,
        counter: options?.counter,
        privkey: options?.privkey
      });
    }
    /**
     * Helper function to ingest a Cashu token and pay a Lightning invoice with it.
     * @param invoice Lightning invoice
     * @param token cashu token
     * @param meltQuote melt quote for the invoice
     * @param options.keysetId? optionally set keysetId for blank outputs for returned change.
     * @param options.counter? optionally set counter to derive secret deterministically. CashuWallet class must be initialized with seed phrase to take effect
     */
    async payLnInvoiceWithToken(invoice, token, meltQuote, options) {
      const decodedToken = getDecodedToken(token);
      const proofs = decodedToken.token.filter((x) => x.mint === this.mint.mintUrl).flatMap((t) => t.proofs);
      return this.payLnInvoice(invoice, proofs, meltQuote, {
        keysetId: options?.keysetId,
        counter: options?.counter
      });
    }
    /**
     * Creates a split payload
     * @param amount amount to send
     * @param proofsToSend proofs to split*
     * @param preference optional preference for splitting proofs into specific amounts. overrides amount param
     * @param counter? optionally set counter to derive secret deterministically. CashuWallet class must be initialized with seed phrase to take effect
     * @param pubkey? optionally locks ecash to pubkey. Will not be deterministic, even if counter is set!
     * @param privkey? will create a signature on the @param proofsToSend secrets if set
     * @returns
     */
    createSwapPayload(amount, proofsToSend, keyset, preference, counter, pubkey, privkey) {
      if (isAmountPreferenceArray(preference)) {
        preference = deprecatedAmountPreferences(preference);
      }
      const totalAmount = proofsToSend.reduce((total, curr) => total + curr.amount, 0);
      const keepBlindedMessages = this.createRandomBlindedMessages(
        totalAmount - amount,
        keyset,
        preference?.keepPreference,
        counter
      );
      if (this._seed && counter) {
        counter = counter + keepBlindedMessages.secrets.length;
      }
      const sendBlindedMessages = this.createRandomBlindedMessages(
        amount,
        keyset,
        preference?.sendPreference,
        counter,
        pubkey
      );
      if (privkey) {
        proofsToSend = (0, import_NUT11.getSignedProofs)(
          proofsToSend.map((p) => {
            return {
              amount: p.amount,
              C: (0, import_common.pointFromHex)(p.C),
              id: p.id,
              secret: new TextEncoder().encode(p.secret)
            };
          }),
          privkey
        ).map((p) => (0, import_client.serializeProof)(p));
      }
      const blindedMessages = {
        blindedMessages: [
          ...keepBlindedMessages.blindedMessages,
          ...sendBlindedMessages.blindedMessages
        ],
        secrets: [...keepBlindedMessages.secrets, ...sendBlindedMessages.secrets],
        rs: [...keepBlindedMessages.rs, ...sendBlindedMessages.rs],
        amounts: [...keepBlindedMessages.amounts, ...sendBlindedMessages.amounts]
      };
      const payload = {
        inputs: proofsToSend,
        outputs: [...blindedMessages.blindedMessages]
      };
      return { payload, blindedMessages };
    }
    /**
     * returns proofs that are already spent (use for keeping wallet state clean)
     * @param proofs (only the 'Y' field is required)
     * @returns
     */
    async checkProofsSpent(proofs) {
      const enc = new TextEncoder();
      const Ys = proofs.map((p) => (0, import_common.hashToCurve)(enc.encode(p.secret)).toHex(true));
      const payload = {
        // array of Ys of proofs to check
        Ys
      };
      const { states } = await this.mint.check(payload);
      return proofs.filter((_, i) => {
        const state = states.find((state2) => state2.Y === Ys[i]);
        return state && state.state === "SPENT" /* SPENT */;
      });
    }
    splitReceive(amount, amountAvailable) {
      const amountKeep = amountAvailable - amount;
      const amountSend = amount;
      return { amountKeep, amountSend };
    }
    /**
     * Creates blinded messages for a given amount
     * @param amount amount to create blinded messages for
     * @param amountPreference optional preference for splitting proofs into specific amounts. overrides amount param
     * @param keyksetId? override the keysetId derived from the current mintKeys with a custom one. This should be a keyset that was fetched from the `/keysets` endpoint
     * @param counter? optionally set counter to derive secret deterministically. CashuWallet class must be initialized with seed phrase to take effect
     * @param pubkey? optionally locks ecash to pubkey. Will not be deterministic, even if counter is set!
     * @returns blinded messages, secrets, rs, and amounts
     */
    createRandomBlindedMessages(amount, keyset, amountPreference, counter, pubkey) {
      const amounts = splitAmount(amount, keyset.keys, amountPreference);
      return this.createBlindedMessages(amounts, keyset.id, counter, pubkey);
    }
    /**
     * Creates blinded messages for a according to @param amounts
     * @param amount array of amounts to create blinded messages for
     * @param counter? optionally set counter to derive secret deterministically. CashuWallet class must be initialized with seed phrase to take effect
     * @param keyksetId? override the keysetId derived from the current mintKeys with a custom one. This should be a keyset that was fetched from the `/keysets` endpoint
     * @param pubkey? optionally locks ecash to pubkey. Will not be deterministic, even if counter is set!
     * @returns blinded messages, secrets, rs, and amounts
     */
    createBlindedMessages(amounts, keysetId, counter, pubkey) {
      if (counter != void 0 && !this._seed) {
        throw new Error(
          "Cannot create deterministic messages without seed. Instantiate CashuWallet with a mnemonic, or omit counter param."
        );
      }
      const blindedMessages = [];
      const secrets = [];
      const rs = [];
      for (let i = 0; i < amounts.length; i++) {
        let deterministicR = void 0;
        let secretBytes = void 0;
        if (pubkey) {
          secretBytes = (0, import_NUT11.createP2PKsecret)(pubkey);
        } else if (this._seed && counter != void 0) {
          secretBytes = (0, import_NUT09.deriveSecret)(this._seed, keysetId, counter + i);
          deterministicR = bytesToNumber((0, import_NUT09.deriveBlindingFactor)(this._seed, keysetId, counter + i));
        } else {
          secretBytes = randomBytes(32);
        }
        if (!pubkey) {
          const secretHex = bytesToHex2(secretBytes);
          secretBytes = new TextEncoder().encode(secretHex);
        }
        secrets.push(secretBytes);
        const { B_, r } = (0, import_client.blindMessage)(secretBytes, deterministicR);
        rs.push(r);
        const blindedMessage = new BlindedMessage(amounts[i], B_, keysetId);
        blindedMessages.push(blindedMessage.getSerializedBlindedMessage());
      }
      return { blindedMessages, secrets, rs, amounts };
    }
    /**
     * Creates NUT-08 blank outputs (fee returns) for a given fee reserve
     * See: https://github.com/cashubtc/nuts/blob/main/08.md
     * @param feeReserve amount to cover with blank outputs
     * @param keysetId mint keysetId
     * @param counter? optionally set counter to derive secret deterministically. CashuWallet class must be initialized with seed phrase to take effect
     * @returns blinded messages, secrets, and rs
     */
    createBlankOutputs(feeReserve, keysetId, counter) {
      let count = Math.ceil(Math.log2(feeReserve)) || 1;
      if (count < 0) {
        count = 0;
      }
      const amounts = count ? Array(count).fill(1) : [];
      const { blindedMessages, rs, secrets } = this.createBlindedMessages(amounts, keysetId, counter);
      return { blindedMessages, secrets, rs };
    }
    /**
     * construct proofs from @params promises, @params rs, @params secrets, and @params keyset
     * @param promises array of serialized blinded signatures
     * @param rs arrays of binding factors
     * @param secrets array of secrets
     * @param keyset mint keyset
     * @returns array of serialized proofs
     */
    constructProofs(promises, rs, secrets, keyset) {
      return promises.map((p, i) => {
        const blindSignature = { id: p.id, amount: p.amount, C_: (0, import_common.pointFromHex)(p.C_) };
        const r = rs[i];
        const secret = secrets[i];
        const A = (0, import_common.pointFromHex)(keyset.keys[p.amount]);
        return (0, import_client.constructProofFromPromise)(blindSignature, r, secret, A);
      }).map((p) => (0, import_client.serializeProof)(p));
    }
  };

  // index.ts
  var import_NUT092 = __toESM(require_NUT09());
  return __toCommonJS(src_exports);
})();
/*! Bundled license information:

ieee754/index.js:
  (*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> *)

buffer/index.js:
  (*!
   * The buffer module from node.js, for the browser.
   *
   * @author   Feross Aboukhadijeh <https://feross.org>
   * @license  MIT
   *)

@noble/hashes/utils.js:
  (*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/abstract/utils.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/abstract/modular.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/abstract/curve.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/abstract/weierstrass.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/_shortw_utils.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/secp256k1.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@scure/base/lib/index.js:
  (*! scure-base - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@scure/bip32/lib/index.js:
  (*! scure-bip32 - MIT License (c) 2022 Patricio Palladino, Paul Miller (paulmillr.com) *)

@scure/bip39/index.js:
  (*! scure-bip39 - MIT License (c) 2022 Patricio Palladino, Paul Miller (paulmillr.com) *)

@noble/curves/esm/abstract/utils.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/hashes/esm/utils.js:
  (*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@scure/base/lib/esm/index.js:
  (*! scure-base - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@scure/bip39/esm/index.js:
  (*! scure-bip39 - MIT License (c) 2022 Patricio Palladino, Paul Miller (paulmillr.com) *)
*/
