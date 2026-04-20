import { findApp, openWebSearch, openMaps } from './deviceControl';

export type CommandType =
  | 'open_app'
  | 'web_search'
  | 'create_project'
  | 'show_projects'
  | 'show_actions'
  | 'open_settings'
  | 'get_time'
  | 'get_date'
  | 'navigation'
  | 'send_sms'
  | 'send_email'
  | 'help'
  | 'unknown';

export interface ParsedCommand {
  type: CommandType;
  raw: string;
  app?: string;
  query?: string;
  projectName?: string;
  location?: string;
  phone?: string;
  email?: string;
  subject?: string;
  body?: string;
}

// ─── MAIN PARSER ──────────────────────────────────────
export function parseCommand(input: string): ParsedCommand {
  const raw = input.trim();
  const lower = raw.toLowerCase();

  // Time
  if (/what(\'s| is) the time|current time|tell me the time|what time/i.test(lower)) {
    return { type: 'get_time', raw };
  }

  // Date
  if (/what(\'s| is) (the |today\'?s? )?date|what day|today\'?s date/i.test(lower)) {
    return { type: 'get_date', raw };
  }

  // Help
  if (/^help$|what can you do|what are your capabilities|jarvis help/i.test(lower)) {
    return { type: 'help', raw };
  }

  // Show projects
  if (/(show|list|view|open|display) (my |all |the )?projects?/i.test(lower)) {
    return { type: 'show_projects', raw };
  }

  // Create project
  if (/(create|new|add|make|start) (a |new )?project/i.test(lower)) {
    const match = raw.match(/(?:project\s+(?:called|named)\s+|called\s+|named\s+)(.+?)(?:\s*$)/i);
    const match2 = raw.match(/project\s+(.+?)(?:\s+project)?\s*$/i);
    const name = match?.[1] || match2?.[1] || '';
    return { type: 'create_project', raw, projectName: name.trim() };
  }

  // Open settings
  if (/(open|go to|show) settings?/i.test(lower)) {
    return { type: 'open_settings', raw };
  }

  // Show actions
  if (/(open|show|go to) (actions?|apps?)/i.test(lower)) {
    return { type: 'show_actions', raw };
  }

  // Navigation / maps
  if (/(navigate|directions? to|take me to|open maps|find on map)/i.test(lower)) {
    const loc = raw.replace(/(navigate|get directions?|directions? to|take me to|open maps?|find on map)\s*/i, '').trim();
    return { type: 'navigation', raw, location: loc };
  }

  // SMS
  if (/(send|text|sms)\s+(a\s+)?(message|text|sms)/i.test(lower)) {
    return { type: 'send_sms', raw };
  }

  // Email
  if (/(send|compose|write)\s+(an?\s+)?(email|mail)/i.test(lower)) {
    return { type: 'send_email', raw };
  }

  // Open app — check known app list first
  const openMatch = raw.match(/(?:open|launch|start|run|go to)\s+(.+?)(?:\s+app)?\s*$/i);
  if (openMatch) {
    const appQuery = openMatch[1].trim();
    const found = findApp(appQuery);
    if (found) return { type: 'open_app', raw, app: found.name };
    // Still return as open_app — executor will handle
    return { type: 'open_app', raw, app: appQuery };
  }

  // Catch direct app names without "open"
  const directApp = findApp(lower);
  if (directApp) return { type: 'open_app', raw, app: directApp.name };

  // Web search
  if (/(search|google|look up|find|bing|search for)/i.test(lower)) {
    const q = raw.replace(/(search( for)?|google|look up|find|bing)\s*/i, '').trim();
    return { type: 'web_search', raw, query: q };
  }

  return { type: 'unknown', raw };
}

// ─── RESPONSE GENERATOR ────────────────────────────────
export function generateResponse(cmd: ParsedCommand, userName = 'Sam'): string {
  switch (cmd.type) {
    case 'get_time': {
      const t = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      return `The current time is ${t}.`;
    }
    case 'get_date': {
      const d = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      return `Today is ${d}.`;
    }
    case 'help':
      return `I can open apps, search the web, manage your projects, and control your device. Try: "Open WhatsApp", "Search React Native tutorials", "Create a project", or "What time is it?"`;
    case 'open_app':
      return `Opening ${cmd.app} now.`;
    case 'web_search':
      return `Searching for "${cmd.query}" on the web.`;
    case 'create_project':
      return cmd.projectName
        ? `Creating project: ${cmd.projectName}.`
        : `Opening project creation form.`;
    case 'show_projects':
      return `Here are your projects, ${userName}.`;
    case 'show_actions':
      return `Opening the actions panel.`;
    case 'open_settings':
      return `Opening settings.`;
    case 'navigation':
      return `Navigating to ${cmd.location}.`;
    case 'send_sms':
      return `Opening SMS composer.`;
    case 'send_email':
      return `Opening email composer.`;
    default:
      return `Command received. Processing: "${cmd.raw}"`;
  }
}
