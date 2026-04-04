/**
 * Vercel Serverless Function · נתיב: POST /api/course-chat
 * משתני סביבה: ANTHROPIC_API_KEY (חובה) · ANTHROPIC_MODEL (אופציונלי, רק אם מחרוזת לא ריקה)
 * ברירת מחדל: Claude Haiku 4.5 (מחליף את Haiku 3 שסולק / לא זמין)
 */
var DEFAULT_ANTHROPIC_MODEL = "claude-haiku-4-5-20251001";
function normalizeBody(req) {
  var body = req.body;
  if (body == null) return {};
  if (Buffer.isBuffer(body)) {
    try {
      return JSON.parse(body.toString("utf8") || "{}");
    } catch (e) {
      return null;
    }
  }
  if (typeof body === "string") {
    try {
      return JSON.parse(body || "{}");
    } catch (e) {
      return null;
    }
  }
  if (typeof body === "object") return body;
  return {};
}

function extractAnthropicText(data) {
  if (!data || !Array.isArray(data.content)) return "";
  var out = [];
  for (var i = 0; i < data.content.length; i++) {
    var b = data.content[i];
    if (b && b.type === "text" && b.text) out.push(b.text);
  }
  return out.join("\n").trim();
}

async function courseChat(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  var body = normalizeBody(req);
  if (body === null) {
    return res.status(400).json({ ok: false, error: "invalid_json" });
  }

  var apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || !String(apiKey).trim()) {
    return res.status(503).json({ ok: false, error: "server_missing_key" });
  }

  var system = body.system;
  var messages = body.messages;
  if (!system || typeof system !== "string" || !Array.isArray(messages)) {
    return res.status(400).json({ ok: false, error: "bad_request" });
  }

  var envModel = process.env.ANTHROPIC_MODEL;
  var model =
    envModel && String(envModel).trim()
      ? String(envModel).trim()
      : DEFAULT_ANTHROPIC_MODEL;

  var anthropicPayload = {
    model: model,
    max_tokens: 2048,
    system: String(system).slice(0, 180000),
    messages: messages.map(function (m) {
      return {
        role: m.role === "assistant" ? "assistant" : "user",
        content: [
          {
            type: "text",
            text: String(m.content != null ? m.content : ""),
          },
        ],
      };
    }),
  };

  try {
    var r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify(anthropicPayload),
    });

    var raw = await r.text();
    var data;
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch (e) {
      return res.status(502).json({
        ok: false,
        error: "upstream_error",
        detail: raw ? String(raw).slice(0, 240) : "non_json",
      });
    }

    if (!r.ok) {
      var msg =
        (data && data.error && data.error.message) ||
        (data && data.message) ||
        String(r.status);
      return res.status(502).json({
        ok: false,
        error: "upstream_error",
        detail: msg,
      });
    }

    var text = extractAnthropicText(data);
    return res.status(200).json({ ok: true, text: text });
  } catch (e) {
    var errMsg =
      e && typeof e.message === "string" ? e.message : String(e || "error");
    return res.status(500).json({
      ok: false,
      error: "proxy_failed",
      detail: errMsg,
    });
  }
}

module.exports = courseChat;
