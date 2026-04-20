import { Linking, Alert } from 'react-native';

// ─── APP DEFINITIONS ──────────────────────────────────
export interface AppEntry {
  name: string;
  category: 'communication' | 'social' | 'entertainment' | 'navigation' | 'productivity' | 'system' | 'browser';
  icon: string;
  color: string;
  androidPackage?: string;
  urlScheme: string;
  webFallback: string;
  keywords: string[];
}

export const APPS: AppEntry[] = [
  // COMMUNICATION
  { name:'Gmail', category:'communication', icon:'📧', color:'#EA4335',
    androidPackage:'com.google.android.gm', urlScheme:'googlegmail://',
    webFallback:'https://mail.google.com', keywords:['gmail','mail','email'] },
  { name:'WhatsApp', category:'communication', icon:'💬', color:'#25D366',
    androidPackage:'com.whatsapp', urlScheme:'whatsapp://send',
    webFallback:'https://wa.me', keywords:['whatsapp','whats app','chat'] },
  { name:'Telegram', category:'communication', icon:'✈️', color:'#0088CC',
    androidPackage:'org.telegram.messenger', urlScheme:'tg://',
    webFallback:'https://t.me', keywords:['telegram'] },
  { name:'Messenger', category:'communication', icon:'💭', color:'#0084FF',
    androidPackage:'com.facebook.orca', urlScheme:'fb-messenger://',
    webFallback:'https://m.me', keywords:['messenger','facebook chat'] },
  { name:'SMS', category:'communication', icon:'📱', color:'#00BCD4',
    urlScheme:'sms:', webFallback:'sms:', keywords:['sms','text','message'] },
  { name:'Phone', category:'communication', icon:'📞', color:'#4CAF50',
    urlScheme:'tel:', webFallback:'tel:', keywords:['phone','call','dial'] },

  // SOCIAL
  { name:'Twitter / X', category:'social', icon:'𝕏', color:'#1DA1F2',
    androidPackage:'com.twitter.android', urlScheme:'twitter://',
    webFallback:'https://twitter.com', keywords:['twitter','x','tweet'] },
  { name:'Instagram', category:'social', icon:'📸', color:'#E1306C',
    androidPackage:'com.instagram.android', urlScheme:'instagram://',
    webFallback:'https://instagram.com', keywords:['instagram','insta'] },
  { name:'Facebook', category:'social', icon:'👥', color:'#1877F2',
    androidPackage:'com.facebook.katana', urlScheme:'fb://',
    webFallback:'https://facebook.com', keywords:['facebook','fb'] },
  { name:'TikTok', category:'social', icon:'🎵', color:'#FF0050',
    androidPackage:'com.zhiliaoapp.musically', urlScheme:'snssdk1233://',
    webFallback:'https://tiktok.com', keywords:['tiktok','tik tok'] },
  { name:'LinkedIn', category:'social', icon:'💼', color:'#0A66C2',
    androidPackage:'com.linkedin.android', urlScheme:'linkedin://',
    webFallback:'https://linkedin.com', keywords:['linkedin'] },

  // ENTERTAINMENT
  { name:'YouTube', category:'entertainment', icon:'▶️', color:'#FF0000',
    androidPackage:'com.google.android.youtube', urlScheme:'vnd.youtube://',
    webFallback:'https://youtube.com', keywords:['youtube','yt','video'] },
  { name:'Spotify', category:'entertainment', icon:'🎧', color:'#1DB954',
    androidPackage:'com.spotify.music', urlScheme:'spotify://',
    webFallback:'https://open.spotify.com', keywords:['spotify','music'] },
  { name:'Netflix', category:'entertainment', icon:'🎬', color:'#E50914',
    androidPackage:'com.netflix.mediaclient', urlScheme:'nflx://',
    webFallback:'https://netflix.com', keywords:['netflix','movies'] },
  { name:'Twitch', category:'entertainment', icon:'🎮', color:'#9147FF',
    androidPackage:'tv.twitch.android.app', urlScheme:'twitch://',
    webFallback:'https://twitch.tv', keywords:['twitch','gaming','stream'] },

  // NAVIGATION
  { name:'Google Maps', category:'navigation', icon:'🗺️', color:'#4285F4',
    androidPackage:'com.google.android.apps.maps', urlScheme:'geo://',
    webFallback:'https://maps.google.com', keywords:['maps','google maps','directions','navigate'] },
  { name:'Uber', category:'navigation', icon:'🚗', color:'#000000',
    androidPackage:'com.ubercab', urlScheme:'uber://',
    webFallback:'https://m.uber.com', keywords:['uber','ride','taxi'] },

  // PRODUCTIVITY
  { name:'Calendar', category:'productivity', icon:'📅', color:'#1A73E8',
    androidPackage:'com.google.android.calendar', urlScheme:'content://com.android.calendar',
    webFallback:'https://calendar.google.com', keywords:['calendar','schedule','event'] },
  { name:'Google Drive', category:'productivity', icon:'💾', color:'#FFA000',
    androidPackage:'com.google.android.apps.docs', urlScheme:'googledrive://',
    webFallback:'https://drive.google.com', keywords:['drive','google drive','files'] },
  { name:'Google Keep', category:'productivity', icon:'📝', color:'#FBBC04',
    androidPackage:'com.google.android.keep', urlScheme:'googlekeep://',
    webFallback:'https://keep.google.com', keywords:['keep','notes','note'] },
  { name:'Google Docs', category:'productivity', icon:'📄', color:'#4285F4',
    androidPackage:'com.google.android.apps.docs.editors.docs', urlScheme:'googledocs://',
    webFallback:'https://docs.google.com', keywords:['docs','google docs','document'] },

  // SYSTEM
  { name:'Settings', category:'system', icon:'⚙️', color:'#607D8B',
    urlScheme:'android.settings.SETTINGS', webFallback:'', keywords:['settings','setting','preferences'] },
  { name:'Camera', category:'system', icon:'📷', color:'#FF7043',
    urlScheme:'intent://camera', webFallback:'', keywords:['camera','photo','picture'] },
  { name:'Calculator', category:'system', icon:'🔢', color:'#FF9800',
    androidPackage:'com.google.android.calculator', urlScheme:'calculator://',
    webFallback:'https://www.google.com/search?q=calculator', keywords:['calculator','calculate','math'] },
  { name:'Gallery', category:'system', icon:'🖼️', color:'#9C27B0',
    urlScheme:'content://media', webFallback:'', keywords:['gallery','photos','pictures'] },

  // BROWSER
  { name:'Chrome', category:'browser', icon:'🌐', color:'#4285F4',
    androidPackage:'com.android.chrome', urlScheme:'googlechrome://',
    webFallback:'https://www.google.com', keywords:['chrome','browser','web','internet'] },
  { name:'Web Search', category:'browser', icon:'🔍', color:'#00BCD4',
    urlScheme:'_search', webFallback:'', keywords:['search','google','bing','find'] },
];

// ─── LAUNCH APP ────────────────────────────────────────
export async function launchApp(app: AppEntry): Promise<boolean> {
  if (app.urlScheme === '_search') return false; // handled by caller
  if (app.urlScheme === 'android.settings.SETTINGS') {
    await Linking.openSettings();
    return true;
  }
  try {
    // Try native app first
    if (app.androidPackage) {
      const nativeUrl = `intent://#Intent;package=${app.androidPackage};scheme=${app.urlScheme.replace('://', '')};end`;
      const supported = await Linking.canOpenURL(app.urlScheme);
      if (supported) {
        await Linking.openURL(app.urlScheme);
        return true;
      }
    }
    // Fallback to web
    if (app.webFallback) {
      await Linking.openURL(app.webFallback);
      return true;
    }
    return false;
  } catch (e) {
    console.error(`Failed to launch ${app.name}:`, e);
    if (app.webFallback) {
      await Linking.openURL(app.webFallback);
      return true;
    }
    return false;
  }
}

// ─── FIND APP BY KEYWORD ──────────────────────────────
export function findApp(query: string): AppEntry | null {
  const lower = query.toLowerCase();
  return APPS.find(a =>
    a.keywords.some(k => lower.includes(k)) || lower.includes(a.name.toLowerCase())
  ) || null;
}

// ─── WEB SEARCH ───────────────────────────────────────
export async function openWebSearch(
  query: string,
  engine: 'google' | 'bing' | 'duckduckgo' = 'google'
): Promise<void> {
  const urls = {
    google: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
    bing: `https://www.bing.com/search?q=${encodeURIComponent(query)}`,
    duckduckgo: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
  };
  await Linking.openURL(urls[engine]);
}

// ─── SEND SMS ─────────────────────────────────────────
export async function sendSMS(phone: string, body: string): Promise<void> {
  const url = `sms:${phone}?body=${encodeURIComponent(body)}`;
  await Linking.openURL(url);
}

// ─── OPEN MAPS ────────────────────────────────────────
export async function openMaps(location: string): Promise<void> {
  const url = `https://maps.google.com/maps?q=${encodeURIComponent(location)}`;
  await Linking.openURL(url);
}

// ─── SEND EMAIL ───────────────────────────────────────
export async function sendEmail(to: string, subject: string, body: string): Promise<void> {
  const url = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  await Linking.openURL(url);
}
