import Constants from "expo-constants";

export interface PoemNote {
  id: string;
  title: string;
  content: string;
  status: "writing" | "not published" | "Published";
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

const extra = Constants.expoConfig?.extra ?? {};
const NOTION_API_TOKEN = (extra.notionToken as string | undefined) ?? "";
const NOTION_DATABASE_ID = (extra.notionDatabaseId as string | undefined) ?? "";
const NOTION_API_VERSION = "2022-06-28";
const NOTION_BASE_URL = "https://api.notion.com/v1";
const NOTION_QUERY_URL = `${NOTION_BASE_URL}/databases/${NOTION_DATABASE_ID}/query`;

const headers = {
  Authorization: `Bearer ${NOTION_API_TOKEN}`,
  "Notion-Version": NOTION_API_VERSION,
  "Content-Type": "application/json",
};

function parsePageToNote(page: any): PoemNote {
  const p = page.properties ?? {};
  const tagsProp = p.Tags ?? p.Collection ?? p.Collections;
  const tags = Array.isArray(tagsProp?.multi_select)
    ? tagsProp.multi_select.map((t: { name: string }) => t.name).filter(Boolean)
    : undefined;
  return {
    id: page.id,
    title: p.Title?.title?.[0]?.text?.content ?? "",
    content: p.Content?.rich_text?.[0]?.text?.content ?? "",
    status: (p.Status?.select?.name as PoemNote["status"]) ?? "writing",
    createdAt: page.created_time,
    updatedAt: page.last_edited_time,
    tags,
  };
}

export class NotionConfigError extends Error {
  constructor() {
    super(
      "Notion credentials missing. Set EXPO_PUBLIC_NOTION_TOKEN and EXPO_PUBLIC_NOTION_DATABASE_ID in .env.local."
    );
    this.name = "NotionConfigError";
  }
}

export const fetchNotesFromNotion = async (): Promise<PoemNote[]> => {
  if (!NOTION_API_TOKEN || !NOTION_DATABASE_ID) throw new NotionConfigError();

  const notes: PoemNote[] = [];
  let hasMore = true;
  let cursor: string | undefined = undefined;

  while (hasMore) {
    const res: Response = await fetch(NOTION_QUERY_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({
        filter: { property: "Status", status: { equals: "Published" } },
        sorts: [{ property: "UpdatedAt", direction: "descending" }],
        start_cursor: cursor,
      }),
    });

    if (!res.ok) {
      const text: string = await res.text();
      throw new Error(`Notion API ${res.status}: ${text}`);
    }
    const data: {
      results: unknown[];
      has_more: boolean;
      next_cursor: string | undefined;
    } = await res.json();
    notes.push(...data.results.map(parsePageToNote));
    hasMore = data.has_more;
    cursor = data.next_cursor;
  }

  return notes;
};
