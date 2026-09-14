const SECTION_HEADERS = [
  'Description / Details',
  'The webpage should include',
  'Design Expectations',
  'Submission Guidelines',
  'Important Note',
  'Requirements',
  'Deliverables',
  'Instructions',
  'Objectives',
  'Overview',
];

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isSectionHeader(label: string) {
  const normalized = label.trim().toLowerCase();
  return SECTION_HEADERS.some((header) => normalized === header.toLowerCase());
}

function linkifyUrls(text: string) {
  return text.replace(/(https?:\/\/[^\s<>)]+)/g, '[$1]($1)');
}

function normalizeRawDescription(raw: string) {
  let text = raw.replace(/\r\n/g, '\n').trim();

  const orderedHeaders = [...SECTION_HEADERS].sort((a, b) => b.length - a.length);
  for (const header of orderedHeaders) {
    const pattern = new RegExp(`(^|\\s)(${escapeRegex(header)}:)`, 'gi');
    text = text.replace(pattern, '\n\n$2\n');
  }

  text = text.replace(/\s*[•·]\s+/g, '\n• ');
  text = text.replace(/\n{3,}/g, '\n\n');

  return text;
}

function splitBulletItems(text: string) {
  return text
    .split(/\n?•\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatLine(line: string): string[] {
  const trimmed = line.trim();
  if (!trimmed) return [];

  const headerOnly = trimmed.match(/^([^:]+):\s*$/);
  if (headerOnly && isSectionHeader(headerOnly[1])) {
    return [`### ${headerOnly[1].trim()}`];
  }

  const headerWithContent = trimmed.match(/^([^:]+):\s*(.+)$/);
  if (headerWithContent && isSectionHeader(headerWithContent[1])) {
    return [`### ${headerWithContent[1].trim()}`, ...formatLine(headerWithContent[2])];
  }

  if (/^[-*]\s+/.test(trimmed)) {
    return [`- ${linkifyUrls(trimmed.replace(/^[-*]\s+/, ''))}`];
  }

  if (trimmed.startsWith('•')) {
    return [`- ${linkifyUrls(trimmed.replace(/^•\s*/, ''))}`];
  }

  const bulletItems = splitBulletItems(trimmed);
  if (bulletItems.length > 1) {
    return bulletItems.map((item) => `- ${linkifyUrls(item)}`);
  }

  return [linkifyUrls(trimmed)];
}

export function formatTaskDescription(raw?: string | null) {
  if (!raw?.trim()) return 'No description provided.';

  const normalized = normalizeRawDescription(raw);
  const blocks = normalized.split(/\n{2,}/);
  const output: string[] = [];

  for (const block of blocks) {
    const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
    for (const line of lines) {
      output.push(...formatLine(line));
    }
  }

  return output.join('\n\n');
}
