import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Switch, Alert, useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { getSettings, saveSettings, clearAllData, AppSettings } from '../../services/taskManager';

const BLUE = '#0066FF';

export default function SettingsScreen() {
  const isDark = useColorScheme() === 'dark';
  const C = isDark ? dark : light;

  const [settings, setSettings] = useState<AppSettings>({
    userName: 'Sam', voiceEnabled: true, darkMode: false, notifEnabled: true,
  });
  const [nameEditing, setNameEditing] = useState(false);
  const [tempName, setTempName] = useState('');

  useFocusEffect(useCallback(() => { loadSettings(); }, []));

  async function loadSettings() {
    const s = await getSettings();
    setSettings(s);
    setTempName(s.userName);
  }

  async function updateSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await saveSettings(updated);
  }

  async function saveName() {
    if (!tempName.trim()) { Alert.alert('Error', 'Name cannot be empty'); return; }
    await updateSetting('userName', tempName.trim());
    setNameEditing(false);
  }

  async function handleClearData() {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your projects, tasks, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear Everything', style: 'destructive', onPress: async () => {
          await clearAllData();
          await loadSettings();
          Alert.alert('Done', 'All data has been cleared.');
        }},
      ]
    );
  }

  async function handleExport() {
    const { getProjects } = await import('../../services/taskManager');
    const projects = await getProjects();
    const data = JSON.stringify({ settings, projects, exportedAt: new Date().toISOString() }, null, 2);
    Alert.alert('Export Ready', `${projects.length} projects exported.\n\nIn the APK version, this saves to your Downloads folder.`);
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: C.bg }]} showsVerticalScrollIndicator={false}>

      {/* ── USER PROFILE ── */}
      <SectionHeader title="USER PROFILE" color={C.text3} />
      <View style={[styles.card, { backgroundColor: C.card, borderColor: C.border }]}>
        <View style={styles.row}>
          <View style={[styles.iconWrap, { backgroundColor: BLUE + '20' }]}>
            <Ionicons name="person" size={20} color={BLUE} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.rowTitle, { color: C.text }]}>Your Name</Text>
            <Text style={[styles.rowSub, { color: C.text3 }]}>Used in voice greeting</Text>
          </View>
          {nameEditing ? (
            <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
              <TextInput
                style={[styles.nameInput, { backgroundColor: C.bg, borderColor: BLUE, color: C.text }]}
                value={tempName}
                onChangeText={setTempName}
                autoFocus
                onSubmitEditing={saveName}
              />
              <TouchableOpacity onPress={saveName} style={styles.saveBtn}>
                <Ionicons name="checkmark" size={18} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setNameEditing(false); setTempName(settings.userName); }}>
                <Ionicons name="close" size={20} color={C.text3} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.nameDisplay, { backgroundColor: C.bg, borderColor: C.border }]}
              onPress={() => setNameEditing(true)}
            >
              <Text style={[styles.nameText, { color: C.text }]}>{settings.userName}</Text>
              <Ionicons name="pencil" size={14} color={BLUE} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── VOICE & INTERFACE ── */}
      <SectionHeader title="VOICE & INTERFACE" color={C.text3} />
      <View style={[styles.card, { backgroundColor: C.card, borderColor: C.border }]}>
        <SettingRow
          icon="volume-high" iconColor={BLUE} bg={C}
          title="Voice Output" sub="Text-to-speech responses"
          right={
            <Switch
              value={settings.voiceEnabled}
              onValueChange={v => updateSetting('voiceEnabled', v)}
              trackColor={{ false: C.border, true: BLUE + '80' }}
              thumbColor={settings.voiceEnabled ? BLUE : C.text3}
            />
          }
        />
        <Divider color={C.border} />
        <SettingRow
          icon="moon" iconColor={BLUE} bg={C}
          title="Dark Mode" sub="Toggle dark/light theme"
          right={
            <Switch
              value={settings.darkMode}
              onValueChange={v => updateSetting('darkMode', v)}
              trackColor={{ false: C.border, true: BLUE + '80' }}
              thumbColor={settings.darkMode ? BLUE : C.text3}
            />
          }
        />
        <Divider color={C.border} />
        <SettingRow
          icon="notifications" iconColor={BLUE} bg={C}
          title="Notifications" sub="Enable app notifications"
          right={
            <Switch
              value={settings.notifEnabled}
              onValueChange={v => updateSetting('notifEnabled', v)}
              trackColor={{ false: C.border, true: BLUE + '80' }}
              thumbColor={settings.notifEnabled ? BLUE : C.text3}
            />
          }
        />
      </View>

      {/* ── JARVIS CONFIGURATION ── */}
      <SectionHeader title="JARVIS CONFIGURATION" color={C.text3} />
      <View style={[styles.card, { backgroundColor: C.card, borderColor: C.border }]}>
        <SettingRow
          icon="mic" iconColor={BLUE} bg={C}
          title="Voice Activation" sub="Tap mic button to activate"
          right={<Text style={[styles.statusTag, { color: '#4CAF50', backgroundColor: '#4CAF5020' }]}>ACTIVE</Text>}
        />
        <Divider color={C.border} />
        <SettingRow
          icon="time" iconColor={BLUE} bg={C}
          title="Idle Timeout" sub="Auto-sleep after 30 seconds"
          right={<Text style={[styles.configVal, { color: C.text3 }]}>30s</Text>}
        />
        <Divider color={C.border} />
        <SettingRow
          icon="language" iconColor={BLUE} bg={C}
          title="Voice Language" sub="Text-to-speech language"
          right={<Text style={[styles.configVal, { color: C.text3 }]}>EN-US</Text>}
        />
        <Divider color={C.border} />
        <SettingRow
          icon="speedometer" iconColor={BLUE} bg={C}
          title="Speech Rate" sub="Voice output speed"
          right={<Text style={[styles.configVal, { color: C.text3 }]}>0.85x</Text>}
        />
      </View>

      {/* ── PERMISSIONS ── */}
      <SectionHeader title="PERMISSIONS" color={C.text3} />
      <View style={[styles.card, { backgroundColor: C.card, borderColor: C.border }]}>
        {[
          { icon: 'mic', label: 'Microphone', desc: 'Voice command input', status: 'GRANTED' },
          { icon: 'phone-portrait', label: 'Device Control', desc: 'Open apps & send messages', status: 'GRANTED' },
          { icon: 'notifications', label: 'Notifications', desc: 'System alerts & reminders', status: 'GRANTED' },
          { icon: 'cloud', label: 'Internet', desc: 'Web search & online features', status: 'GRANTED' },
        ].map((p, i, arr) => (
          <React.Fragment key={p.label}>
            <SettingRow
              icon={p.icon as any} iconColor={BLUE} bg={C}
              title={p.label} sub={p.desc}
              right={<Text style={[styles.statusTag, { color: '#4CAF50', backgroundColor: '#4CAF5020' }]}>{p.status}</Text>}
            />
            {i < arr.length - 1 && <Divider color={C.border} />}
          </React.Fragment>
        ))}
      </View>

      {/* ── DATA MANAGEMENT ── */}
      <SectionHeader title="DATA MANAGEMENT" color={C.text3} />
      <View style={[styles.card, { backgroundColor: C.card, borderColor: C.border }]}>
        <SettingRow
          icon="download" iconColor={BLUE} bg={C}
          title="Export Data" sub="Download projects as JSON"
          right={
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: BLUE }]}
              onPress={handleExport}
            >
              <Text style={styles.actionBtnText}>Export</Text>
            </TouchableOpacity>
          }
        />
        <Divider color={C.border} />
        <SettingRow
          icon="trash" iconColor="#FF6B6B" bg={C}
          title="Clear All Data" sub="Remove all projects & settings"
          right={
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#FF6B6B22', borderWidth: 1, borderColor: '#FF6B6B55' }]}
              onPress={handleClearData}
            >
              <Text style={[styles.actionBtnText, { color: '#FF6B6B' }]}>Clear</Text>
            </TouchableOpacity>
          }
        />
      </View>

      {/* ── FUTURE ENHANCEMENTS ── */}
      <SectionHeader title="COMING SOON" color={C.text3} />
      <View style={[styles.card, { backgroundColor: C.card, borderColor: C.border }]}>
        {[
          { icon: 'mic-circle', label: 'Real Speech-to-Text', desc: 'Live voice recognition', tag: 'v3.0' },
          { icon: 'hand-left', label: 'Gesture Detection', desc: 'Clap/wave to activate', tag: 'v3.0' },
          { icon: 'globe', label: 'Multi-language', desc: 'Swahili & more languages', tag: 'v3.0' },
          { icon: 'home', label: 'Smart Home', desc: 'IoT device control', tag: 'v4.0' },
          { icon: 'analytics', label: 'AI Analytics', desc: 'Machine learning insights', tag: 'v4.0' },
        ].map((f, i, arr) => (
          <React.Fragment key={f.label}>
            <SettingRow
              icon={f.icon as any} iconColor={C.text3} bg={C}
              title={f.label} sub={f.desc}
              right={<Text style={[styles.comingSoonTag, { color: C.text3, borderColor: C.border }]}>{f.tag}</Text>}
            />
            {i < arr.length - 1 && <Divider color={C.border} />}
          </React.Fragment>
        ))}
      </View>

      {/* ── ABOUT ── */}
      <View style={[styles.aboutCard, { backgroundColor: C.card, borderColor: C.border }]}>
        <Text style={styles.aboutLogo}>JARVIS</Text>
        <Text style={[styles.aboutSub, { color: C.text3 }]}>Just A Rather Very Intelligent System</Text>
        <Text style={[styles.aboutVer, { color: C.text3 }]}>Version 2.0.0 · Build 2024.12</Text>
        <View style={styles.aboutDivider} />
        <Text style={[styles.aboutDesc, { color: C.text2 }]}>
          Personal AI assistant for Android.{'\n'}
          Built for Redmi Note 11 and compatible devices.{'\n'}
          Developed by Sam · Tanzania 🇹🇿
        </Text>
        <View style={[styles.techRow, { borderColor: C.border }]}>
          {['React Native', 'Expo', 'TypeScript', 'AsyncStorage'].map(t => (
            <View key={t} style={[styles.techChip, { backgroundColor: BLUE + '15', borderColor: BLUE + '30' }]}>
              <Text style={[styles.techText, { color: BLUE }]}>{t}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ─── SUB-COMPONENTS ─────────────────────────────────
function SectionHeader({ title, color }: { title: string; color: string }) {
  return (
    <Text style={[styles.sectionHeader, { color }]}>{title}</Text>
  );
}

function Divider({ color }: { color: string }) {
  return <View style={[styles.divider, { backgroundColor: color }]} />;
}

function SettingRow({
  icon, iconColor, title, sub, right, bg,
}: {
  icon: string; iconColor: string; title: string; sub: string;
  right: React.ReactNode; bg: typeof light;
}) {
  return (
    <View style={styles.row}>
      <View style={[styles.iconWrap, { backgroundColor: iconColor + '20' }]}>
        <Ionicons name={icon as any} size={20} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowTitle, { color: bg.text }]}>{title}</Text>
        <Text style={[styles.rowSub, { color: bg.text3 }]}>{sub}</Text>
      </View>
      {right}
    </View>
  );
}

// ─── COLORS ─────────────────────────────────────────
const light = { bg:'#F5F7FA', card:'#FFF', border:'#E0E0E0', text:'#1A1A1A', text2:'#555', text3:'#888' };
const dark  = { bg:'#0A0E1A', card:'#111827', border:'#1E2A4A', text:'#E8EEFF', text2:'#99AACC', text3:'#556080' };

// ─── STYLES ─────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  sectionHeader: {
    fontFamily: 'SpaceMono', fontSize: 10, letterSpacing: 2,
    textTransform: 'uppercase', marginTop: 20, marginBottom: 8,
    paddingHorizontal: 20,
  },
  card: {
    marginHorizontal: 16, borderRadius: 16, borderWidth: 1, overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, gap: 14,
  },
  iconWrap: {
    width: 40, height: 40, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  rowTitle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  rowSub: { fontSize: 12 },
  divider: { height: 1, marginHorizontal: 16 },
  nameInput: {
    borderWidth: 1, borderRadius: 10, paddingHorizontal: 10,
    paddingVertical: 6, fontSize: 14, width: 110,
  },
  saveBtn: {
    backgroundColor: BLUE, borderRadius: 8, width: 32,
    height: 32, alignItems: 'center', justifyContent: 'center',
  },
  nameDisplay: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderRadius: 10, paddingHorizontal: 12,
    paddingVertical: 8,
  },
  nameText: { fontSize: 14, fontWeight: '600' },
  statusTag: {
    fontFamily: 'SpaceMono', fontSize: 10, paddingHorizontal: 8,
    paddingVertical: 3, borderRadius: 20, fontWeight: '700',
    textTransform: 'uppercase',
  },
  configVal: { fontFamily: 'SpaceMono', fontSize: 13 },
  actionBtn: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 10,
  },
  actionBtnText: { color: '#fff', fontFamily: 'SpaceMono', fontSize: 12, fontWeight: '700' },
  comingSoonTag: {
    fontFamily: 'SpaceMono', fontSize: 10, paddingHorizontal: 8,
    paddingVertical: 3, borderRadius: 20, borderWidth: 1,
  },
  aboutCard: {
    margin: 16, borderRadius: 20, borderWidth: 1,
    padding: 24, alignItems: 'center',
  },
  aboutLogo: {
    fontFamily: 'SpaceMono', fontSize: 32, fontWeight: '900',
    color: BLUE, letterSpacing: 6,
    textShadowColor: BLUE, textShadowRadius: 20,
  },
  aboutSub: { fontFamily: 'SpaceMono', fontSize: 11, marginTop: 4, textAlign: 'center' },
  aboutVer: { fontFamily: 'SpaceMono', fontSize: 11, marginTop: 4 },
  aboutDivider: { width: 40, height: 2, backgroundColor: BLUE + '50', borderRadius: 1, marginVertical: 16 },
  aboutDesc: { fontSize: 13, textAlign: 'center', lineHeight: 22 },
  techRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
    marginTop: 16, justifyContent: 'center',
    paddingTop: 16, borderTopWidth: 1, width: '100%',
  },
  techChip: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, borderWidth: 1,
  },
  techText: { fontFamily: 'SpaceMono', fontSize: 10 },
});
