/**
 * הגבלה לפי IP · UPSTASH_REDIS_REST_URL + TOKEN לאכיפה יציבה
 * COURSE_CHAT_MAX_MESSAGES (ברירת מחדל 30), COURSE_CHAT_LIMIT_WINDOW_SEC (0 = כל הזמן)
 */
var memStore =
  typeof globalThis !== "undefined"
    ? globalThis.__courseChatRateMem || (globalThis.__courseChatRateMem = new Map())
    : new Map();

function parsePositiveInt(v, def) {
  var n = parseInt(String(v == null ? "" : v), 10);
  if (!isFinite(n) || n < 0) return def;
  return n;
}

function rateStorageKey(clientId) {
  var winSec = parsePositiveInt(process.env.COURSE_CHAT_LIMIT_WINDOW_SEC, 0);
  if (!winSec) return "course-chat:" + clientId;
  var bucket = Math.floor(Date.now() / (winSec * 1000));
  return "course-chat:" + clientId + ":" + bucket;
}

function upstashBase() {
  return String(process.env.UPSTASH_REDIS_REST_URL || "").replace(/\/$/, "");
}

async function upstashIncrExpire(key, expireSec) {
  var base = upstashBase();
  var token = process.env.UPSTASH_REDIS_REST_TOKEN || "";
  if (!base || !token) return null;
  var incRes = await fetch(base + "/incr/" + encodeURIComponent(key), {
    headers: { Authorization: "Bearer " + token },
  });
  if (!incRes.ok) return null;
  var incBody = await incRes.json();
  var n = incBody ? incBody.result : null;
  if (typeof n === "string") n = parseInt(n, 10);
  if (typeof n !== "number" || !isFinite(n)) return null;
  if (expireSec > 0 && n === 1) {
    await fetch(base + "/expire/" + encodeURIComponent(key) + "/" + Math.ceil(expireSec), {
      headers: { Authorization: "Bearer " + token },
    });
  }
  return n;
}

async function upstashDecr(key) {
  var base = upstashBase();
  var token = process.env.UPSTASH_REDIS_REST_TOKEN || "";
  if (!base || !token) return;
  await fetch(base + "/decr/" + encodeURIComponent(key), {
    headers: { Authorization: "Bearer " + token },
  });
}

function memIncr(key) {
  var n = (memStore.get(key) || 0) + 1;
  memStore.set(key, n);
  return n;
}

function memDecr(key) {
  var n = memStore.get(key) || 0;
  if (n <= 1) memStore.delete(key);
  else memStore.set(key, n - 1);
}

async function incrementAndGetCount(clientId) {
  var key = rateStorageKey(clientId);
  var winSec = parsePositiveInt(process.env.COURSE_CHAT_LIMIT_WINDOW_SEC, 0);
  var n = await upstashIncrExpire(key, winSec);
  if (n != null) return { count: n, key: key, backend: "upstash" };
  return { count: memIncr(key), key: key, backend: "memory" };
}

async function undoIncrement(meta) {
  if (!meta || !meta.key) return;
  if (meta.backend === "upstash") await upstashDecr(meta.key);
  else memDecr(meta.key);
}

function getMaxMessages() {
  return parsePositiveInt(process.env.COURSE_CHAT_MAX_MESSAGES, 30);
}

async function checkRateLimit(clientId) {
  var max = getMaxMessages();
  if (!max) return { ok: true, meta: null };
  var inc = await incrementAndGetCount(clientId);
  if (inc.count > max) {
    await undoIncrement(inc);
    return { ok: false, limit: max, used: max };
  }
  return { ok: true, meta: inc };
}

async function releaseIfFailed(meta) {
  await undoIncrement(meta);
}

module.exports = {
  getMaxMessages,
  checkRateLimit,
  releaseIfFailed,
};
