import { createReadStream, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";

const port = 5197;
const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const dataDir = join(root, "data");
const submissionsFile = join(dataDir, "submissions.json");
const notificationsFile = join(dataDir, "email-notifications.log");

const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
]);

function filePathForRequest(url) {
  const { pathname } = new URL(url, `http://127.0.0.1:${port}`);
  const decodedPath = decodeURIComponent(pathname);
  const safePath = normalize(decodedPath).replace(/^(\.\.[/\\])+/, "");
  const requestedPath = safePath === "/" ? "/index.html" : safePath;
  return join(root, requestedPath);
}

function ensureStore() {
  mkdirSync(dataDir, { recursive: true });
  if (!existsSync(submissionsFile)) writeFileSync(submissionsFile, "[]\n");
}

function readSubmissions() {
  ensureStore();
  return JSON.parse(readFileSync(submissionsFile, "utf8"));
}

function writeSubmissions(submissions) {
  ensureStore();
  writeFileSync(submissionsFile, `${JSON.stringify(submissions, null, 2)}\n`);
}

function readBody(request) {
  return new Promise((resolveBody, rejectBody) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        request.destroy();
        rejectBody(new Error("Request body too large"));
      }
    });
    request.on("end", () => resolveBody(body));
    request.on("error", rejectBody);
  });
}

function csvEscape(value) {
  const text = Array.isArray(value) ? value.join("; ") : String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function submissionsCsv(submissions) {
  const fields = [
    "submittedAt",
    "organizationName",
    "yourName",
    "role",
    "email",
    "organizationType",
    "organizationSize",
    "phaseInterest",
    "investmentReadiness",
    "estimateRange",
    "promptedBy",
    "connections",
    "environments",
    "deliverables",
    "desiredFeeling",
    "currentFeeling",
    "culturalNoise",
    "oneYearSuccess",
    "whyNanasi",
  ];
  return [
    fields.join(","),
    ...submissions.map((submission) => fields.map((field) => csvEscape(submission[field])).join(",")),
  ].join("\n");
}

async function sendNotification(subject, submission) {
  writeFileSync(notificationsFile, `${new Date().toISOString()} | ${subject}\n`, { flag: "a" });

  if (!process.env.NANASI_NOTIFICATION_WEBHOOK_URL) return;

  await fetch(process.env.NANASI_NOTIFICATION_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      subject,
      submission,
    }),
  });
}

async function handleApi(request, response) {
  if (request.method === "GET" && request.url === "/api/submissions") {
    response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    response.end(JSON.stringify(readSubmissions()));
    return true;
  }

  if (request.method === "GET" && request.url === "/api/submissions.csv") {
    response.writeHead(200, {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=\"nanasi-sonic-applications.csv\"",
    });
    response.end(submissionsCsv(readSubmissions()));
    return true;
  }

  if (request.method === "POST" && request.url === "/api/applications") {
    const payload = JSON.parse(await readBody(request));
    const submissions = readSubmissions();
    const submission = {
      id: crypto.randomUUID(),
      submittedAt: new Date().toISOString(),
      ...payload,
    };
    submissions.unshift(submission);
    writeSubmissions(submissions);
    const subject = `New Sonic Identity Application - ${submission.organizationName || "Unknown Organization"}`;
    await sendNotification(subject, submission);
    response.writeHead(201, { "Content-Type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ ok: true, subject }));
    return true;
  }

  return false;
}

const server = createServer(async (request, response) => {
  try {
    if (request.url.startsWith("/api/") && await handleApi(request, response)) return;
  } catch (error) {
    response.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ error: error.message }));
    return;
  }

  const filePath = filePathForRequest(request.url);

  if (!filePath.startsWith(root) || !existsSync(filePath)) {
    const fallbackPath = join(root, "index.html");
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
    createReadStream(fallbackPath).pipe(response);
    return;
  }

  response.writeHead(200, {
    "Content-Type": mimeTypes.get(extname(filePath)) || "application/octet-stream",
    "Cache-Control": "no-store",
  });
  createReadStream(filePath).pipe(response);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Local: http://127.0.0.1:${port}/`);
});
