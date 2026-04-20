# JARVIS — Personal AI Assistant v2.0
### Just A Rather Very Intelligent System

> Voice-controlled Android assistant for Redmi Note 11 and compatible devices.
> Built with React Native + Expo · TypeScript · AsyncStorage

---

## 📱 FEATURES

### ✅ Implemented
| Feature | Status | Notes |
|---|---|---|
| Voice Activation (Tap-to-activate) | ✅ | Blue edge animation + TTS greeting |
| Edge sweep animation (500ms) | ✅ | All 4 edges flash blue on activation |
| Personalized greeting ("Hello Sam") | ✅ | Reads user name from settings |
| Text-to-Speech responses | ✅ | expo-speech, rate 0.85, pitch 0.75 |
| Command log / history | ✅ | Last 10 commands shown on home |
| Project management (CRUD) | ✅ | Create, edit, delete, list projects |
| Task management (CRUD) | ✅ | Add, toggle, delete tasks per project |
| Task priority (low/med/high) | ✅ | Color-coded badges |
| Project progress tracking | ✅ | Auto-calculates from completed tasks |
| Project status (active/done/paused) | ✅ | Visual status badges + cycle toggle |
| 26+ app launcher | ✅ | Communication, social, entertainment… |
| Web search (Google/Bing/DDG) | ✅ | Opens browser with query |
| Email composer | ✅ | Opens default mail app |
| SMS composer | ✅ | Opens default SMS app |
| Maps / navigation | ✅ | Google Maps with location query |
| Dark mode | ✅ | System-aware + manual toggle |
| Settings persistence | ✅ | AsyncStorage |
| Data export (JSON) | ✅ | Downloads projects |
| 30-second auto-idle | ✅ | Resets voice state |
| Responsive layout | ✅ | Works on all Android screen sizes |

### 🔜 Planned (v3.0+)
- Real-time speech-to-text (react-native-voice)
- Gesture activation (clap/wave detection)
- Swahili language support
- Smart home / IoT control
- ML-powered command prediction
- Offline mode

---

## 🏗️ PROJECT STRUCTURE

```
jarvis-app/
├── app/
│   ├── _layout.tsx              ← Root layout (font loading, splash)
│   └── (tabs)/
│       ├── _layout.tsx          ← Tab navigator (Home/Actions/Projects/Settings)
│       ├── index.tsx            ← 🏠 Home: voice activation, mic, greeting, log
│       ├── actions.tsx          ← ⚡ Actions: 26+ app launcher grid
│       ├── projects.tsx         ← 📊 Projects: list + detail + tasks
│       └── settings.tsx         ← ⚙️ Settings: name, voice, theme, data
│
├── services/
│   ├── taskManager.ts           ← Project/task CRUD + AsyncStorage
│   ├── deviceControl.ts         ← App launching, web search, SMS, email, maps
│   └── voiceCommandProcessor.ts ← NLP command parser + response generator
│
├── hooks/
│   └── useSpeechRecognition.ts  ← TTS/STT hook (Web Speech API + native)
│
├── constants/
│   └── theme.ts                 ← Colors, typography, spacing, animation consts
│
├── assets/
│   └── fonts/
│       └── SpaceMono-Regular.ttf
│
├── app.json                     ← Expo config (permissions, package name)
├── eas.json                     ← EAS Build config (APK + AAB)
├── package.json
├── tsconfig.json
└── babel.config.js
```

---

## 🚀 SETUP & BUILD (Termux on Redmi Note 11)

### Step 1 — Install Prerequisites

```bash
# In Termux
pkg update && pkg upgrade -y
pkg install nodejs git -y
npm install -g expo-cli eas-cli
```

### Step 2 — Clone & Install

```bash
# Create project
git clone https://github.com/samdone763/jarvis-assistant.git
cd jarvis-assistant

# OR manually set up
mkdir jarvis-app && cd jarvis-app
# Copy all project files here

# Install dependencies
npm install
```

### Step 3 — Add Font Asset

Download SpaceMono font and place it at:
```
assets/fonts/SpaceMono-Regular.ttf
```

Free download: https://fonts.google.com/specimen/Space+Mono
(Download → Extract → copy `SpaceMono-Regular.ttf`)

### Step 4 — Test in Browser (no phone needed)

```bash
npx expo start --web
```

Open the URL shown in your browser to preview all screens.

### Step 5 — Build APK via EAS (Recommended)

```bash
# Login to Expo account (free)
eas login

# Configure project
eas build:configure

# Build APK (takes ~5-10 min on EAS servers)
eas build --platform android --profile preview
```

EAS builds on their cloud servers — no local Android SDK needed!
Download the APK link when done and install on your Redmi Note 11.

### Step 6 — Install APK on Device

```bash
# Via Termux (if built locally)
adb install jarvis.apk

# Or transfer the APK file and tap to install
# Enable: Settings → Install Unknown Apps → Allow
```

---

## 🔧 ALTERNATIVE: Build via GitHub Actions

Create `.github/workflows/build.yml`:

```yaml
name: Build Jarvis APK
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - name: Install deps
        run: npm install
      - name: Setup EAS
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - name: Build APK
        run: eas build --platform android --profile preview --non-interactive
```

Add `EXPO_TOKEN` secret in your GitHub repo settings.
APK downloads automatically as a build artifact.

---

## 🎙️ VOICE COMMANDS REFERENCE

| Command | Action |
|---|---|
| "Open WhatsApp" | Launches WhatsApp |
| "Open YouTube" | Launches YouTube |
| "Open Gmail" | Opens email composer |
| "Open Settings" | Goes to Settings screen |
| "Open Google Maps" | Opens maps |
| "Search React Native" | Google search |
| "Create a project called OST" | Creates new project |
| "Show my projects" | Opens Projects tab |
| "What time is it?" | Speaks current time |
| "What is today's date?" | Speaks current date |
| "Help" | Lists available commands |
| "Navigate to Dar es Salaam" | Opens Maps with location |
| "Send SMS" | Opens SMS composer |
| "Send email" | Opens email composer |

---

## 🎨 DESIGN SYSTEM

### Colors
```
Primary Blue:    #0066FF   — Buttons, highlights, active states
Light Blue:      #4d94ff   — Gradients, secondary accents
Blue Dim:        #0066FF26 — Backgrounds, hover states
Success Green:   #4CAF50   — Completed tasks/projects
Warning Orange:  #FF9800   — Paused status
Error Red:       #FF6B6B   — Delete actions, errors
Dark BG:         #0A0E1A   — Dark mode background
Card Dark:       #111827   — Dark mode card surface
```

### Typography
- **Display / Titles**: SpaceMono (monospace, tech aesthetic)
- **Body**: System default (Exo 2 in web preview)
- **Title Letter Spacing**: 2–6px for Orbitron-style look

### Animations
- Edge sweep: 500ms opacity pulse on all 4 borders
- Mic pulse: keyframe scale 1 → 1.04 → 1 (1000ms loop)
- Screen glow: inset box-shadow pulse when Jarvis active
- Modals: slide-up from bottom (300ms)
- Progress bars: width transition 500ms

---

## 🔒 ANDROID PERMISSIONS

Declared in `app.json`:
```
RECORD_AUDIO       ← Voice commands
INTERNET           ← Web search, API calls
SEND_SMS           ← SMS composer
CALL_PHONE         ← Phone dialer
VIBRATE            ← Haptic feedback
RECEIVE_BOOT_COMPLETED ← Future: auto-start
```

---

## 📊 DATA MODELS

### Project
```typescript
{
  id: string;              // timestamp-based unique ID
  name: string;            // required
  description: string;     // optional
  date: string;            // ISO 8601 creation date
  status: 'active' | 'completed' | 'paused';
  tasks: Task[];
  progress: number;        // 0-100, auto-calculated
  color?: string;          // hex color
  tags?: string[];
}
```

### Task
```typescript
{
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}
```

### AppSettings
```typescript
{
  userName: string;        // shown in greeting
  voiceEnabled: boolean;   // TTS on/off
  darkMode: boolean;
  notifEnabled: boolean;
}
```

---

## 📦 ADDING REAL SPEECH-TO-TEXT (v3.0)

To enable live voice recognition, install `react-native-voice`:

```bash
npx expo install react-native-voice
```

Then in `hooks/useSpeechRecognition.ts`, replace the native section:

```typescript
import Voice from '@react-native-voice/voice';

Voice.onSpeechResults = (e) => {
  const text = e.value?.[0] || '';
  setTranscript(text);
  // Pass to command processor
};

const startListeningNative = () => {
  Voice.start('en-US');
  setListening(true);
};

const stopListeningNative = () => {
  Voice.stop();
  setListening(false);
};
```

Add to `app.json` under `android.permissions`:
```json
"android.permission.RECORD_AUDIO"
```

---

## 🐛 TROUBLESHOOTING

| Problem | Fix |
|---|---|
| App won't install | Enable "Install Unknown Apps" in Settings |
| Voice not working | Check microphone permission in App Settings |
| TTS not speaking | Toggle Voice Output in Settings → re-enable |
| Build fails on EAS | Run `eas build:configure` first |
| npm install errors | Run `npm install --legacy-peer-deps` |
| Font not loading | Ensure `SpaceMono-Regular.ttf` is in `assets/fonts/` |
| AsyncStorage errors | Run `npx expo install @react-native-async-storage/async-storage` |
| Apps not opening | Grant "Open other apps" permission on HyperOS |

---

## 🧪 TESTING CHECKLIST

- [ ] App launches on Redmi Note 11
- [ ] Blue edge animation fires on mic tap
- [ ] TTS greeting plays ("Hello Sam, what should I do?")
- [ ] All 5 screens navigate correctly
- [ ] Projects create, edit, delete
- [ ] Tasks add, toggle, delete
- [ ] Progress bar updates correctly
- [ ] All 26 apps launch (or open web fallback)
- [ ] Web search opens browser
- [ ] Settings save and persist after restart
- [ ] Dark mode toggles correctly
- [ ] Name change reflects in greeting
- [ ] 30-second idle resets Jarvis state
- [ ] No crashes during normal use

---

## 📄 LICENSE

MIT License · Built by Sam · Tanzania 🇹🇿 · 2024

---

*"The day I stop learning is the day I stop living." — Tony Stark (probably)*
