/**
 * storageKeys.js — centralised registry of every localStorage key used by Henry.
 *
 * Keeping all keys in one place prevents typo-drift across modules and makes
 * future key migrations (renaming, versioning) trivially safe.
 */

/** Audit trail entries (array of audit-log objects, capped at 100). */
export const STORAGE_KEY_AUDIT = 'henry.audit.logs';

/** Archive records (array of archive-entry objects, capped at 100). */
export const STORAGE_KEY_ARCHIVE = 'henry.archive.records.v1';

/** ChatDock open/closed state ('open' | 'closed'). */
export const STORAGE_KEY_CHAT_DOCK = 'henry.ui.chatDock';

/** Chat message history (array, capped at 50 messages). */
export const STORAGE_KEY_CHAT_HISTORY = 'henry.ui.chatHistory';

/** Left-rail collapse state ('expanded' | 'collapsed'). */
export const STORAGE_KEY_LEFT_RAIL = 'henry.ui.leftRail';

/** FooterActionBar collapse state ('expanded' | 'collapsed'). */
export const STORAGE_KEY_FOOTER_BAR = 'henry.ui.footerBar';

/** UI density preference ('compact' | 'comfortable'). */
export const STORAGE_KEY_DENSITY = 'henry.ui.density';

/** Theme preference ('light' | 'dark' | 'system'). */
export const STORAGE_KEY_THEME = 'henry.ui.theme';

/** LLM provider preference ('ollama' | 'groq'). */
export const STORAGE_KEY_LLM_PROVIDER = 'henry.llm.provider';

/** Groq API key (user-supplied, stored in localStorage, never leaves the browser). */
export const STORAGE_KEY_GROQ_API_KEY = 'henry.llm.groqApiKey';

/**
 * Persisted document state (serialised JSON of the document Redux slice).
 * Version suffix policy: bump `.vN` only for breaking schema changes and
 * migrate from the previous key at app boot before removing older keys.
 */
export const STORAGE_KEY_DOCUMENT = 'henry.document.state.v1';
