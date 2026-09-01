/**
 * supabase-doctor — diagnóstico da conexão backend <-> Supabase do Diagnóstico.
 *
 * TEMPORÁRIO / diagnóstico. Não faz DDL, não altera schema, não altera RLS/grants.
 * Escritas: só a RPC de rate limit (com --rpc) e um INSERT+DELETE de teste em
 * `diagnosticos` (só com --write). Ambas OFF por padrão.
 *
 * Uso (onde as env vars existem — ex.: shell da Hostinger, dentro de site/):
 *   node scripts/supabase-doctor.mjs            # só leitura (A-D + SELECT)
 *   node scripts/supabase-doctor.mjs --rpc      # + testa a RPC diagnostico_check_rate_limit
 *   node scripts/supabase-doctor.mjs --rpc --write   # + INSERT/DELETE controlado de QA
 *
 * Lê:  process.env.SUPABASE_URL
 *      process.env.SUPABASE_SERVICE_ROLE_KEY   (pode conter uma key nova sb_secret_...)
 *
 * NUNCA imprime: a key, a URL completa, headers, tokens. Só booleans,
 * o project ref, códigos e mensagens técnicas sanitizadas do PostgREST.
 */

const ARGS = new Set(process.argv.slice(2));
const DO_RPC = ARGS.has("--rpc");
const DO_WRITE = ARGS.has("--write");

const URL_RAW = process.env.SUPABASE_URL ?? "";
const KEY_RAW = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

const out = {
  SUPABASE_URL_PRESENT: false,
  SUPABASE_SECRET_PRESENT: false,
  SUPABASE_KEY_FORMAT: "ausente",
  SUPABASE_URL_SHAPE_OK: false,
  SUPABASE_PROJECT_REF_FROM_URL: null,
  SUPABASE_PROJECT_REF_FROM_KEY: null, // só p/ key JWT legada
  SUPABASE_KEY_ROLE_CLAIM: null, // só p/ key JWT legada
  SUPABASE_PROJECT_REF_MATCH: null,
  SUPABASE_CLIENT_CREATED: false,
  SUPABASE_REST_WITH_BEARER_OK: null, // GET REST com apikey + Authorization: Bearer <key>
  SUPABASE_REST_APIKEY_ONLY_OK: null, // GET REST só com apikey (sem Authorization)
  SUPABASE_SELECT_OK: null, // via @supabase/supabase-js
  SUPABASE_RPC_OK: DO_RPC ? null : "SKIPPED (passe --rpc)",
  SUPABASE_INSERT_OK: DO_WRITE ? null : "SKIPPED (passe --write)",
  SUPABASE_DELETE_OK: DO_WRITE ? null : "SKIPPED (passe --write)",
};
const errors = [];

/** remove valores entre parênteses do padrão PostgREST "Key (col)=(valor)" */
function scrub(s) {
  if (!s) return null;
  const str = String(s);
  if (/^\s*<(!doctype|html)/i.test(str)) return "(resposta HTML, não-JSON — provável URL/host errado ou proxy)";
  return str
    .replace(/=\([^)]*\)/g, "=(<redacted>)")
    .replace(/\b[\w.+-]+@[\w-]+\.[\w.-]+\b/g, "<email>")
    .slice(0, 300);
}
function pushErr(step, e) {
  errors.push({
    step,
    status: e?.status ?? e?.httpStatus ?? null,
    code: e?.code ?? null,
    message: scrub(e?.message),
    hint: scrub(e?.hint),
    details: scrub(e?.details),
  });
}
async function safeBody(res) {
  try {
    const t = await res.text();
    try {
      return JSON.parse(t);
    } catch {
      return { _raw: t.slice(0, 200) };
    }
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------- A/B: presença + formato
out.SUPABASE_URL_PRESENT = URL_RAW.length > 0;
out.SUPABASE_SECRET_PRESENT = KEY_RAW.length > 0;

if (KEY_RAW.startsWith("sb_secret_")) out.SUPABASE_KEY_FORMAT = "sb_secret (nova secret key server-side)";
else if (KEY_RAW.startsWith("sb_publishable_"))
  out.SUPABASE_KEY_FORMAT = "sb_publishable (ERRADO: chave de client, não server)";
else if (/^eyJ[A-Za-z0-9_-]+\.eyJ/.test(KEY_RAW)) {
  out.SUPABASE_KEY_FORMAT = "jwt (service_role/anon legada)";
  try {
    const payload = JSON.parse(Buffer.from(KEY_RAW.split(".")[1], "base64").toString("utf8"));
    out.SUPABASE_PROJECT_REF_FROM_KEY = payload.ref ?? null;
    out.SUPABASE_KEY_ROLE_CLAIM = payload.role ?? null;
  } catch {
    /* ignora */
  }
} else if (KEY_RAW.startsWith("sb_")) out.SUPABASE_KEY_FORMAT = "sb_ (subtipo não reconhecido)";
else if (KEY_RAW.length) out.SUPABASE_KEY_FORMAT = "desconhecido";

// ---------------------------------------------------------------- URL: forma + project ref
let base = null;
try {
  const u = new URL(URL_RAW);
  base = `${u.protocol}//${u.host}`;
  const badPath = u.pathname && u.pathname !== "/" && u.pathname !== "";
  out.SUPABASE_URL_SHAPE_OK = u.protocol === "https:" && !badPath;
  if (!out.SUPABASE_URL_SHAPE_OK)
    errors.push({
      step: "url_shape",
      message: `protocol=${u.protocol} pathname=${u.pathname || "(vazio)"} — esperado https:// sem path (nada de /dashboard, sem barra final)`,
    });
  const m = u.host.match(/^([a-z0-9]{20})\.supabase\.(co|in|red)$/i);
  if (m) out.SUPABASE_PROJECT_REF_FROM_URL = m[1];
  else out.SUPABASE_PROJECT_REF_FROM_URL = `(host não-padrão: ${u.host})`;
} catch {
  errors.push({ step: "url_parse", message: "SUPABASE_URL não é uma URL válida" });
}

if (out.SUPABASE_PROJECT_REF_FROM_KEY && typeof out.SUPABASE_PROJECT_REF_FROM_URL === "string") {
  out.SUPABASE_PROJECT_REF_MATCH = out.SUPABASE_PROJECT_REF_FROM_KEY === out.SUPABASE_PROJECT_REF_FROM_URL;
}

const REST = base ? `${base}/rest/v1` : null;
const canProbe = REST && KEY_RAW;

// ---------------------------------------------------------------- C: probes REST cruas (fetch puro)
if (canProbe) {
  // C1 — como o @supabase/supabase-js faz hoje: apikey + Authorization: Bearer <key>
  try {
    const res = await fetch(`${REST}/diagnosticos?select=id&limit=1`, {
      headers: { apikey: KEY_RAW, Authorization: `Bearer ${KEY_RAW}` },
    });
    out.SUPABASE_REST_WITH_BEARER_OK = res.ok;
    if (!res.ok) {
      const b = await safeBody(res);
      pushErr("rest_get_with_bearer", { status: res.status, ...b });
    }
  } catch (e) {
    out.SUPABASE_REST_WITH_BEARER_OK = false;
    pushErr("rest_get_with_bearer", { message: e?.message, code: "FETCH_THREW" });
  }

  // C2 — só apikey, sem Authorization (isola se o Bearer da secret key atrapalha)
  try {
    const res = await fetch(`${REST}/diagnosticos?select=id&limit=1`, { headers: { apikey: KEY_RAW } });
    out.SUPABASE_REST_APIKEY_ONLY_OK = res.ok;
    if (!res.ok) {
      const b = await safeBody(res);
      pushErr("rest_get_apikey_only", { status: res.status, ...b });
    }
  } catch (e) {
    out.SUPABASE_REST_APIKEY_ONLY_OK = false;
    pushErr("rest_get_apikey_only", { message: e?.message, code: "FETCH_THREW" });
  }
}

// ---------------------------------------------------------------- D/E/F: via @supabase/supabase-js
let sb = null;
try {
  const { createClient } = await import("@supabase/supabase-js");
  if (URL_RAW && KEY_RAW) {
    sb = createClient(URL_RAW, KEY_RAW, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    out.SUPABASE_CLIENT_CREATED = !!sb;
  }
} catch (e) {
  pushErr("import_supabase_js", { message: e?.message });
}

if (sb) {
  // D — SELECT simples
  try {
    const { error } = await sb.from("diagnosticos").select("id").limit(1);
    out.SUPABASE_SELECT_OK = !error;
    if (error) pushErr("select:diagnosticos", error);
  } catch (e) {
    out.SUPABASE_SELECT_OK = false;
    pushErr("select:diagnosticos", { message: e?.message });
  }

  // E — RPC (só com --rpc; faz upsert numa linha da tabela de rate limit)
  if (DO_RPC) {
    try {
      const { data, error } = await sb.rpc("diagnostico_check_rate_limit", {
        p_key: "__supabase_doctor__",
        p_max: 999999,
        p_window_seconds: 1,
      });
      out.SUPABASE_RPC_OK = !error && Array.isArray(data);
      if (error) pushErr("rpc:diagnostico_check_rate_limit", error);
    } catch (e) {
      out.SUPABASE_RPC_OK = false;
      pushErr("rpc:diagnostico_check_rate_limit", { message: e?.message });
    }
  }

  // F — INSERT + DELETE controlado (só com --write)
  if (DO_WRITE) {
    const marker = `__DOCTOR_CONNECTIVITY_TEST__ ${new Date().toISOString()}`;
    let insertedId = null;
    try {
      const { data, error } = await sb
        .from("diagnosticos")
        .insert({
          nome_empresa: marker,
          responsavel: "supabase-doctor",
          whatsapp: "00000000",
          status: "novo",
        })
        .select("id, created_at")
        .single();
      out.SUPABASE_INSERT_OK = !error && !!data?.id;
      if (data?.id) {
        insertedId = data.id;
        out._insert_returned_created_at = !!data.created_at;
      }
      if (error) pushErr("insert:diagnosticos", error);
    } catch (e) {
      out.SUPABASE_INSERT_OK = false;
      pushErr("insert:diagnosticos", { message: e?.message });
    }

    if (insertedId) {
      try {
        const { error } = await sb.from("diagnosticos").delete().eq("id", insertedId);
        out.SUPABASE_DELETE_OK = !error;
        if (error) pushErr("delete:diagnosticos", error);
      } catch (e) {
        out.SUPABASE_DELETE_OK = false;
        pushErr("delete:diagnosticos", { message: e?.message });
      }
    } else {
      out.SUPABASE_DELETE_OK = "N/A (insert não retornou id)";
    }
  }
}

// ---------------------------------------------------------------- Saída
console.log("\n==================== SUPABASE DOCTOR ====================\n");
for (const [k, v] of Object.entries(out)) {
  if (k.startsWith("_")) continue;
  console.log(`${k} = ${v === null ? "?" : v}`);
}
console.log("\n---------------------- ERROS (sanitizados) ----------------------");
if (!errors.length) console.log("(nenhum)");
else for (const e of errors) console.log(JSON.stringify(e));
console.log("\nRPC testada:", DO_RPC ? "sim" : "não (--rpc)", " | INSERT testado:", DO_WRITE ? "sim" : "não (--write)");
console.log("========================================================\n");
