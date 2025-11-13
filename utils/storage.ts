/* ─── PoemNote Type ───────────────────────────────────────── */
export interface PoemNote {
  id: string;  // Notion page ID
  title: string;
  content: string;
  status: 'writing' | 'not published' | 'Published';
  createdAt: string;
  updatedAt: string;
}

/* ─── Hardcoded Notion Config ────────────────────────────── */
const NOTION_API_TOKEN = '***NOTION_TOKEN_REMOVED***'; // Replace with your actual token
const NOTION_DATABASE_ID = '209419347bda80089684fc2ae3e15149';
const NOTION_API_VERSION = '2022-06-28';
const NOTION_BASE_URL = 'https://api.notion.com/v1';

const NOTION_QUERY_URL = `${NOTION_BASE_URL}/databases/${NOTION_DATABASE_ID}/query`;
const NOTION_PAGE_URL = `${NOTION_BASE_URL}/pages`;

const headers = {
  'Authorization': `Bearer ${NOTION_API_TOKEN}`,
  'Notion-Version': NOTION_API_VERSION,
  'Content-Type': 'application/json',
};

const VALID_STATUSES = ['writing', 'not published', 'Published'] as const;

/* ─── Helpers ─────────────────────────────────────────────── */
function buildProperties(note: Omit<PoemNote, 'id' | 'createdAt' | 'updatedAt'>) {
  const safeStatus = VALID_STATUSES.includes(note.status) ? note.status : 'writing';

  return {
    Title: { title: [{ text: { content: note.title } }] },
    Content: { rich_text: [{ text: { content: note.content } }] },
    Status: { select: { name: safeStatus } },
  };
}

function parsePageToNote(page: any): PoemNote {
  const p = page.properties;
  return {
    id: page.id,
    title: p.Title?.title?.[0]?.text?.content ?? '',
    content: p.Content?.rich_text?.[0]?.text?.content ?? '',
    status: (p.Status?.select?.name as PoemNote['status']) ?? 'writing',
    createdAt: page.created_time,
    updatedAt: page.last_edited_time,
  };
}

/* ─── Fetch all notes ─────────────────────────────────────── */
export const getNotesFromNotion = async (): Promise<PoemNote[]> => {
  const notes: PoemNote[] = [];
  let hasMore = true;
  let cursor: string | undefined = undefined;

  try {
    while (hasMore) {
      const res = await fetch(NOTION_QUERY_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          filter: {
            property: 'Status',
            status: {
              equals: 'Published',
            },
          },
          sorts: [{ property: 'UpdatedAt', direction: 'descending' }],
          start_cursor: cursor,
        }),
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      notes.push(...data.results.map(parsePageToNote));
      hasMore = data.has_more;
      cursor = data.next_cursor;
    }

    return notes;
  } catch (err) {
    console.error('Error loading notes from Notion:', err);
    return [];
  }
};