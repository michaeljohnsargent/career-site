/**
 * Belt and braces for the system prompt's "plain prose only" instruction.
 * Models emit markdown out of habit, and this chat renders text verbatim, so
 * a stray pair of asterisks shows up as literal stars in front of a recruiter.
 * Strips the emphasis markers without touching the words between them.
 */
export function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*\*([\s\S]+?)\*\*\*/g, "$1")
    .replace(/\*\*([\s\S]+?)\*\*/g, "$1")
    .replace(/(^|\s)\*([^\s*][\s\S]*?[^\s*]|[^\s*])\*(?=\s|$)/g, "$1$2")
    .replace(/(^|\s)__([\s\S]+?)__(?=\s|$)/g, "$1$2")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "");
}
