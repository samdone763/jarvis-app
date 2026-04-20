import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  ScrollView, Platform, useColorScheme, Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { useFocusEffect, useRouter } from 'expo-router';
import { getProjects, getSettings, Project } from '../../services/taskManager';
import { parseCommand, generateResponse } from '../../services/voiceCommandProcessor';
import { findApp, launchApp } from '../../services/deviceControl';

const BLUE = '#0066FF';

// ─── COMMAND LOG ENTRY ────────────────────────────────
interface LogEntry { who: 'JARVIS' | 'YOU'; msg: string; id: string; }

export default function HomeScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const router = useRouter();

  const [userName, setUserName] = useState('Sam');
  const [jarvisActive, setJarvisActive] = useState(false);
  const [listening, setListening] = useState(false);
  const [statusText, setStatusText] = useState('TAP MICROPHONE TO ACTIVATE');
  const [greetMsg, setGreetMsg] = useState('HELLO SAM — TAP MIC TO START');
  const [log, setLog] = useState<LogEntry[]>([{ who: 'JARVIS', msg: 'System initialized. Ready for commands.', id: '0' }]);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);

  // Animations
  const edgeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const micScale = useRef(new Animated.Value(1)).current;
  const greetOpacity = useRef(new Animated.Value(1)).current;
  const pulseRef = useRef<Animated.CompositeAnimation | null>(null);
  const idleTimer = useRef<NodeJS.Timeout | null>(null);

  useFocusEffect(useCallback(() => {
    loadData();
  }, []));

  async function loadData() {
    const settings = await getSettings();
    setUserName(settings.userName);
    const projects = await getProjects();
    setRecentProjects(projects.slice(-3).reverse());
  }

  // ── EDGE ANIMATION ──
  function fireEdgeAnimation() {
    Animated.sequence([
      Animated.timing(edgeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.timing(edgeAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start();
  }

  // ── PULSE ANIMATION ──
  function startPulse() {
    pulseRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    );
    pulseRef.current.start();
  }

  function stopPulse() {
    pulseRef.current?.stop();
    pulseAnim.setValue(1);
  }

  // ── MIC PRESS ──
  function activateJarvis() {
    if (Platform.OS === 'android') Vibration.vibrate(50);

    // Animate mic
    Animated.sequence([
      Animated.timing(micScale, { toValue: 0.88, duration: 80, useNativeDriver: true }),
      Animated.timing(micScale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();

    if (jarvisActive) {
      // Open voice command simulator
      setListening(true);
      setStatusText('LISTENING...');
    } else {
      // First tap — activate
      fireEdgeAnimation();
      setJarvisActive(true);
      startPulse();

      const greeting = `Hello ${userName}, what should I do?`;
      setGreetMsg(`HELLO ${userName.toUpperCase()}, WHAT SHOULD I DO?`);
      setStatusText('JARVIS ONLINE — LISTENING FOR COMMANDS');
      addLog('JARVIS', `Hello ${userName}! I'm ready for commands.`);

      // TTS
      Speech.speak(greeting, {
        rate: 0.85, pitch: 0.75, language: 'en-US',
        onDone: () => setListening(true),
      });

      // Auto-idle after 30s
      resetIdleTimer();
    }
  }

  function resetIdleTimer() {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(idleJarvis, 30000);
  }

  function idleJarvis() {
    setJarvisActive(false);
    setListening(false);
    stopPulse();
    setStatusText('TAP MICROPHONE TO ACTIVATE');
    setGreetMsg(`HELLO ${userName.toUpperCase()} — TAP MIC TO START`);
  }

  // ── PROCESS COMMAND ──
  async function processCommand(input: string) {
    setListening(false);
    addLog('YOU', input);
    resetIdleTimer();

    const cmd = parseCommand(input);
    const response = generateResponse(cmd, userName);
    addLog('JARVIS', response);

    const settings = await getSettings();
    if (settings.voiceEnabled) Speech.speak(response, { rate: 0.85, pitch: 0.75 });

    switch (cmd.type) {
      case 'show_projects': router.push('/(tabs)/projects'); break;
      case 'show_actions': router.push('/(tabs)/actions'); break;
      case 'open_settings': router.push('/(tabs)/settings'); break;
      case 'web_search':
        if (cmd.query) {
          const { openWebSearch } = await import('../../services/deviceControl');
          await openWebSearch(cmd.query);
        }
        break;
      case 'open_app': {
        const app = findApp(cmd.app || '');
        if (app) await launchApp(app);
        break;
      }
      case 'navigation': {
        const { openMaps } = await import('../../services/deviceControl');
        if (cmd.location) await openMaps(cmd.location);
        break;
      }
      case 'create_project':
        router.push('/(tabs)/projects');
        break;
    }
  }

  function addLog(who: 'JARVIS' | 'YOU', msg: string) {
    setLog(prev => [...prev.slice(-9), { who, msg, id: Date.now().toString() }]);
  }

  // ── DEMO COMMANDS ──
  const demoCommands = [
    'Open WhatsApp',
    'Search React Native tutorials',
    'Show my projects',
    'What time is it',
    'Open YouTube',
    'Create a project called Jarvis App',
    'Navigate to Dar es Salaam',
    'Open Google Maps',
  ];

  const C = isDark ? darkColors : lightColors;

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      {/* Edge animation overlay */}
      <Animated.View
        pointerEvents="none"
        style={[styles.edgeOverlay, { opacity: edgeAnim }]}
      >
        <View style={[styles.edgeTop, { backgroundColor: BLUE }]} />
        <View style={[styles.edgeBottom, { backgroundColor: BLUE }]} />
        <View style={[styles.edgeLeft, { backgroundColor: BLUE }]} />
        <View style={[styles.edgeRight, { backgroundColor: BLUE }]} />
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HERO */}
        <View style={[styles.hero, { backgroundColor: C.card2 }]}>
          {/* Ring + Mic */}
          <View style={[styles.ring, jarvisActive && styles.ringActive]}>
            <Animated.View style={{ transform: [{ scale: micScale }] }}>
              <TouchableOpacity
                style={[styles.micBtn, jarvisActive && styles.micBtnActive]}
                onPress={activateJarvis}
                activeOpacity={0.8}
              >
                <Ionicons name="mic" size={36} color="white" />
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Greeting Box */}
          <Animated.View
            style={[
              styles.greetBox,
              { backgroundColor: C.card, borderColor: BLUE + '30' },
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <Text style={styles.greetText}>{greetMsg}</Text>
            <Text style={[styles.greetSub, { color: C.text3 }]}>
              {jarvisActive ? '[ JARVIS v2.0 ONLINE ]' : '[ JARVIS v2.0 READY ]'}
            </Text>
          </Animated.View>

          <Text style={[styles.statusBar, { color: C.text3 }]}>{statusText}</Text>
        </View>

        {/* DEMO COMMANDS (shown when listening) */}
        {listening && (
          <View style={styles.demoSection}>
            <Text style={[styles.sectionTitle, { color: C.text3 }]}>TAP A COMMAND</Text>
            {demoCommands.map(cmd => (
              <TouchableOpacity
                key={cmd}
                style={[styles.demoCmd, { backgroundColor: C.card, borderColor: BLUE + '40' }]}
                onPress={() => processCommand(cmd)}
                activeOpacity={0.7}
              >
                <Ionicons name="chatbubble-ellipses-outline" size={14} color={BLUE} />
                <Text style={[styles.demoCmdText, { color: C.text }]}>"{cmd}"</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.cancelBtn, { backgroundColor: C.card }]}
              onPress={() => { setListening(false); setStatusText('JARVIS ACTIVE — TAP TO LISTEN'); }}
            >
              <Text style={{ color: '#FF6B6B', fontFamily: 'SpaceMono', fontSize: 13 }}>✕ Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* QUICK ACTIONS */}
        {!listening && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: C.text3 }]}>QUICK COMMANDS</Text>
            <View style={styles.quickGrid}>
              {[
                { icon: 'logo-whatsapp', label: 'WhatsApp', cmd: 'Open WhatsApp' },
                { icon: 'search', label: 'Search', cmd: 'Search the web' },
                { icon: 'grid', label: 'Projects', cmd: 'Show my projects' },
                { icon: 'logo-youtube', label: 'YouTube', cmd: 'Open YouTube' },
                { icon: 'time', label: 'Time', cmd: 'What time is it' },
                { icon: 'map', label: 'Maps', cmd: 'Open Google Maps' },
              ].map(q => (
                <TouchableOpacity
                  key={q.label}
                  style={[styles.quickBtn, { backgroundColor: C.card, borderColor: C.border }]}
                  onPress={() => { activateJarvis(); setTimeout(() => processCommand(q.cmd), 400); }}
                  activeOpacity={0.7}
                >
                  <Ionicons name={q.icon as any} size={24} color={BLUE} />
                  <Text style={[styles.quickLabel, { color: C.text2 }]}>{q.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* COMMAND LOG */}
        {!listening && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: C.text3 }]}>COMMAND HISTORY</Text>
            {log.map(e => (
              <View key={e.id} style={styles.logEntry}>
                <View style={[
                  styles.logTag,
                  { backgroundColor: e.who === 'JARVIS' ? '#4CAF5020' : BLUE + '20' }
                ]}>
                  <Text style={[
                    styles.logTagText,
                    { color: e.who === 'JARVIS' ? '#4CAF50' : BLUE }
                  ]}>{e.who}</Text>
                </View>
                <Text style={[styles.logMsg, { color: C.text2 }]}>{e.msg}</Text>
              </View>
            ))}
          </View>
        )}

        {/* RECENT PROJECTS */}
        {!listening && recentProjects.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: C.text3 }]}>RECENT PROJECTS</Text>
            {recentProjects.map(p => {
              const done = p.tasks.filter(t => t.completed).length;
              const total = p.tasks.length;
              const pct = total ? Math.round(done / total * 100) : 0;
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.recentCard, { backgroundColor: C.card, borderColor: C.border }]}
                  onPress={() => router.push('/(tabs)/projects')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.recentName, { color: C.text }]}>{p.name}</Text>
                  <View style={styles.recentMeta}>
                    <Text style={[styles.recentMetaText, { color: C.text3 }]}>{p.status}</Text>
                    <Text style={[styles.recentMetaText, { color: C.text3 }]}>{done}/{total} tasks</Text>
                    <Text style={[styles.recentMetaText, { color: BLUE }]}>{pct}%</Text>
                  </View>
                  <View style={[styles.progressBar, { backgroundColor: C.border }]}>
                    <View style={[styles.progressFill, { width: `${pct}%` as any }]} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

// ─── COLORS ──────────────────────────────────────────
const lightColors = {
  bg: '#F5F7FA', card: '#FFFFFF', card2: '#F0F4FF',
  text: '#1A1A1A', text2: '#555', text3: '#888', border: '#E0E0E0',
};
const darkColors = {
  bg: '#0A0E1A', card: '#111827', card2: '#1a2035',
  text: '#E8EEFF', text2: '#99AACC', text3: '#556080', border: '#1E2A4A',
};

// ─── STYLES ───────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  edgeOverlay: { position: 'absolute', inset: 0, zIndex: 99, pointerEvents: 'none' },
  edgeTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, shadowColor: '#0066FF', shadowOpacity: 1, shadowRadius: 10 },
  edgeBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, shadowColor: '#0066FF', shadowOpacity: 1, shadowRadius: 10 },
  edgeLeft: { position: 'absolute', top: 0, bottom: 0, left: 0, width: 3, shadowColor: '#0066FF', shadowOpacity: 1, shadowRadius: 10 },
  edgeRight: { position: 'absolute', top: 0, bottom: 0, right: 0, width: 3, shadowColor: '#0066FF', shadowOpacity: 1, shadowRadius: 10 },
  hero: { alignItems: 'center', paddingTop: 32, paddingBottom: 24, paddingHorizontal: 20, gap: 20 },
  ring: {
    width: 150, height: 150, borderRadius: 75,
    borderWidth: 2, borderColor: '#0066FF30',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#0066FF', shadowOpacity: 0.2, shadowRadius: 20, elevation: 8,
  },
  ringActive: { borderColor: '#0066FF', shadowOpacity: 0.5 },
  micBtn: {
    width: 86, height: 86, borderRadius: 43,
    backgroundColor: '#0066FF', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#0066FF', shadowOpacity: 0.6, shadowRadius: 16, elevation: 12,
  },
  micBtnActive: { backgroundColor: '#003DB3' },
  greetBox: {
    width: '100%', borderRadius: 16, padding: 16,
    alignItems: 'center', borderWidth: 1,
    shadowColor: '#0066FF', shadowOpacity: 0.15, shadowRadius: 12, elevation: 4,
  },
  greetText: {
    fontFamily: 'SpaceMono', fontSize: 13, color: '#0066FF',
    letterSpacing: 1, textAlign: 'center', fontWeight: '700',
  },
  greetSub: { fontFamily: 'SpaceMono', fontSize: 11, marginTop: 4 },
  statusBar: { fontFamily: 'SpaceMono', fontSize: 11, letterSpacing: 1, textAlign: 'center' },
  section: { paddingHorizontal: 20, paddingTop: 16 },
  demoSection: { paddingHorizontal: 20, paddingTop: 16, gap: 8 },
  sectionTitle: {
    fontFamily: 'SpaceMono', fontSize: 10, letterSpacing: 2,
    textTransform: 'uppercase', marginBottom: 12,
  },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickBtn: {
    width: '30%', alignItems: 'center', padding: 14, borderRadius: 14,
    borderWidth: 1, gap: 8,
  },
  quickLabel: { fontFamily: 'SpaceMono', fontSize: 10 },
  demoCmd: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 12, borderRadius: 12, borderWidth: 1,
  },
  demoCmdText: { fontFamily: 'SpaceMono', fontSize: 12 },
  cancelBtn: {
    alignItems: 'center', padding: 12, borderRadius: 12,
    marginTop: 4,
  },
  logEntry: { flexDirection: 'row', gap: 8, marginBottom: 8, alignItems: 'flex-start' },
  logTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, marginTop: 2 },
  logTagText: { fontFamily: 'SpaceMono', fontSize: 10, fontWeight: '700' },
  logMsg: { flex: 1, fontSize: 12, lineHeight: 18, fontFamily: 'SpaceMono' },
  recentCard: {
    borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1, borderLeftWidth: 4, borderLeftColor: '#0066FF',
  },
  recentName: { fontSize: 14, fontWeight: '700', marginBottom: 6 },
  recentMeta: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  recentMetaText: { fontFamily: 'SpaceMono', fontSize: 11 },
  progressBar: { height: 4, borderRadius: 2 },
  progressFill: { height: 4, borderRadius: 2, backgroundColor: '#0066FF' },
});
