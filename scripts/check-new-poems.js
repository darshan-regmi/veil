const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");

const NOTION_TOKEN = process.env.NOTION_TOKEN ?? "";
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID ?? "";
const CREDENTIALS_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS ?? "";

const NOTION_API_VERSION = "2022-06-28";
const NOTION_QUERY_URL = `https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`;
const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const EXPO_RECEIPTS_URL = "https://exp.host/--/api/v2/push/getReceipts";
const FEED_MARKER_PATH = "config/poemFeed";

const log = (msg) => console.log(`[check-new-poems] ${msg}`);

function pick(collection) {
  if (!collection) return {};
  const first = (prop) => collection[prop]?.[0]?.[0]?.text?.content;
  return {
    title: first("Title") ?? "",
    content: first("Content") ?? "",
    status: collection["Status"]?.select?.name ?? "",
    createdAt: collection["CreatedAt"]?.date?.start ?? "",
  };
}

async function fetchPublishedPoems() {
  const all = [];
  let cursor;
  let hasMore = true;
  while (hasMore) {
    const res = await fetch(NOTION_QUERY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        "Notion-Version": NOTION_API_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filter: { property: "Status", status: { equals: "Published" } },
        sorts: [{ property: "UpdatedAt", direction: "descending" }],
        start_cursor: cursor,
      }),
    });
    if (!res.ok) {
      throw new Error(`Notion API ${res.status}: ${await res.text()}`);
    }
    const data = await res.json();
    for (const page of data.results ?? []) {
      const parsed = pick(page.properties);
      if (parsed.status === "Published" && parsed.title) {
        all.push({
          id: page.id,
          ...parsed,
          created_time: page.created_time,
        });
      }
    }
    hasMore = data.has_more;
    cursor = data.next_cursor;
  }
  return all.sort((a, b) => a.created_time.localeCompare(b.created_time));
}

function parseCreatedAt(poem) {
  return poem.createdAt || poem.created_time;
}

function notificationText(poem) {
  const lines = (poem.content ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const preview = lines.slice(0, 2).join("  ");
  return {
    title: poem.title,
    body: preview ? `${preview}  Enjoy reading...` : "A new poem is waiting for you.  Enjoy reading...",
  };
}

async function fetchTokenDocs(db) {
  const snap = await db.collection("pushTokens").get();
  return snap.docs
    .map((d) => ({ id: d.id, token: d.data().token }))
    .filter((t) => typeof t.token === "string" && t.token.length > 0);
}

async function sendPushMessages(db, messages, tokenDocIds) {
  for (let i = 0; i < messages.length; i += 100) {
    const chunk = messages.slice(i, i + 100);
    const res = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(chunk),
    });
    if (!res.ok) {
      throw new Error(`Expo push API ${res.status}: ${await res.text()}`);
    }
    const { data: tickets } = await res.json();
    const ticketIds = [];
    for (const ticket of tickets ?? []) {
      if (ticket.status === "error") {
        console.warn(`[check-new-poems] Push ticket error for ${ticket.details?.expoPushToken}: ${ticket.message}`);
      } else {
        ticketIds.push(ticket.id);
      }
    }
    await pruneRejectedTokens(db, tickets, tokenDocIds);
    if (ticketIds.length > 0) {
      await checkReceipts(ticketIds);
    }
  }
}

async function pruneRejectedTokens(db, tickets, tokenDocIds) {
  for (const ticket of tickets ?? []) {
    const message = ticket.message ?? "";
    if (/DeviceNotRegistered|InvalidCredentials|MessageRateExceeded/i.test(message)) {
      const token = ticket.details?.expoPushToken;
      const docId = token ? tokenDocIds[token] : null;
      if (docId) {
        await db.collection("pushTokens").doc(docId).delete().catch(() => {});
      }
    }
  }
}

async function checkReceipts(ticketIds) {
  const res = await fetch(EXPO_RECEIPTS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids: ticketIds }),
  });
  if (!res.ok) return;
  const { data: receipts } = await res.json();
  for (const [id, receipt] of Object.entries(receipts ?? {})) {
    if (receipt.status === "error") {
      console.warn(`[check-new-poems] Push receipt error for ${id}: ${receipt.message}`);
    }
  }
}

async function main() {
  if (!NOTION_TOKEN || !NOTION_DATABASE_ID) {
    throw new Error("Missing NOTION_TOKEN or NOTION_DATABASE_ID environment variable");
  }
  if (!CREDENTIALS_PATH) {
    throw new Error("Missing GOOGLE_APPLICATION_CREDENTIALS (path to Firebase service account JSON)");
  }

  admin.initializeApp({ credential: admin.credential.cert(CREDENTIALS_PATH) });
  const db = getFirestore();

  const poems = await fetchPublishedPoems();
  const markerRef = db.doc(FEED_MARKER_PATH);
  const markerSnap = await markerRef.get();

  const newestCreatedAt = poems.length > 0 ? parseCreatedAt(poems[poems.length - 1]) : null;
  if (!markerSnap.exists) {
    if (newestCreatedAt) {
      await markerRef.set({ latestCreatedAt: newestCreatedAt });
    }
    log("Initialized poem feed marker; skipping notification backfill");
    return;
  }

  const latestKnown = markerSnap.data().latestCreatedAt;
  let newPoems = poems.filter((p) => parseCreatedAt(p) > latestKnown);

  if (newPoems.length === 0) {
    log("No new published poems");
    return;
  }

  if (newPoems.length > 20) {
    newPoems = newPoems.slice(-20);
  }

  const tokenDocs = await fetchTokenDocs(db);
  log(`Pushing ${newPoems.length} poems to ${tokenDocs.length} tokens`);
  if (tokenDocs.length === 0) {
    await markerRef.update({ latestCreatedAt: newestCreatedAt });
    return;
  }

  const tokenDocIds = Object.fromEntries(tokenDocs.map((t) => [t.token, t.id]));
  const messages = [];
  for (const poem of newPoems) {
    const { title, body } = notificationText(poem);
    for (const t of tokenDocs) {
      messages.push({
        to: t.token,
        sound: "default",
        title,
        body,
        data: { poemId: poem.id },
        channelId: "default",
        priority: "high",
      });
    }
  }

  if (messages.length > 0) {
    await sendPushMessages(db, messages, tokenDocIds);
  }
  await markerRef.update({ latestCreatedAt: newestCreatedAt });
  log("Done");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(`[check-new-poems] FAILED: ${err.message}`);
    process.exit(1);
  });