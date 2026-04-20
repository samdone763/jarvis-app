import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Modal, useColorScheme, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { APPS, AppEntry, launchApp, openWebSearch, openMaps, sendEmail, sendSMS } from '../../services/deviceControl';

const BLUE = '#0066FF';
const CATEGORIES = ['all','communication','social','entertainment','navigation','productivity','system','browser'] as const;

export default function ActionsScreen() {
  const isDark = useColorScheme() === 'dark';
  const C = isDark ? dark : light;

  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<string>('all');
  const [searchModal, setSearchModal] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [mapsModal, setMapsModal] = useState(false);
  const [mapsLoc, setMapsLoc] = useState('');
  const [emailModal, setEmailModal] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [smsModal, setSmsModal] = useState(false);
  const [smsPhone, setSmsPhone] = useState('');
  const [smsBody, setSmsBody] = useState('');

  const filtered = APPS.filter(a => {
    const matchCat = cat === 'all' || a.category === cat;
    const matchQ = !query || a.name.toLowerCase().includes(query.toLowerCase()) ||
      a.keywords.some(k => k.includes(query.toLowerCase()));
    return matchCat && matchQ;
  });

  async function handleLaunch(app: AppEntry) {
    if (app.urlScheme === '_search') { setSearchModal(true); return; }
    if (app.name === 'Google Maps') { setMapsModal(true); return; }
    if (app.name === 'Gmail') { setEmailModal(true); return; }
    if (app.name === 'SMS') { setSmsModal(true); return; }
    await launchApp(app);
  }

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      {/* Search */}
      <View style={[styles.searchRow, { backgroundColor: C.card, borderBottomColor: C.border }]}>
        <View style={[styles.searchBar, { backgroundColor: C.bg, borderColor: C.border }]}>
          <Ionicons name="search" size={18} color={C.text3} />
          <TextInput
            style={[styles.searchInput, { color: C.text }]}
            placeholder="Search apps & actions..."
            placeholderTextColor={C.text3}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={C.text3} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        style={[styles.catScroll, { backgroundColor: C.card, borderBottomColor: C.border }]}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}
      >
        {CATEGORIES.map(c => (
          <TouchableOpacity
            key={c}
            style={[styles.chip, { backgroundColor: C.bg, borderColor: C.border },
              cat === c && { backgroundColor: BLUE, borderColor: BLUE }
            ]}
            onPress={() => setCat(c)}
          >
            <Text style={[styles.chipText, { color: C.text3 }, cat === c && { color: '#fff' }]}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Grid */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.grid}>
        {filtered.map(app => (
          <TouchableOpacity
            key={app.name}
            style={[styles.appCard, { backgroundColor: C.card, borderColor: C.border }]}
            onPress={() => handleLaunch(app)}
            activeOpacity={0.7}
          >
            <View style={[styles.appIcon, { backgroundColor: app.color + '22' }]}>
              <Text style={{ fontSize: 26 }}>{app.icon}</Text>
            </View>
            <Text style={[styles.appName, { color: C.text }]} numberOfLines={1}>{app.name}</Text>
            <Text style={[styles.appCat, { color: C.text3 }]}>{app.category}</Text>
          </TouchableOpacity>
        ))}
        {filtered.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="search" size={48} color={C.text3} />
            <Text style={[styles.emptyText, { color: C.text3 }]}>No apps found</Text>
          </View>
        )}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* WEB SEARCH MODAL */}
      <Modal visible={searchModal} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={[styles.modal, { backgroundColor: C.card }]}>
            <Text style={[styles.modalTitle, { color: C.text }]}>Web Search</Text>
            <TextInput
              style={[styles.input, { backgroundColor: C.bg, borderColor: C.border, color: C.text }]}
              placeholder="Search the web..."
              placeholderTextColor={C.text3}
              value={searchQ}
              onChangeText={setSearchQ}
              autoFocus
            />
            <View style={styles.engineRow}>
              {['google','bing','duckduckgo'].map(e => (
                <TouchableOpacity
                  key={e}
                  style={[styles.engineBtn, { backgroundColor: C.bg, borderColor: C.border }]}
                  onPress={async () => {
                    if (searchQ.trim()) {
                      await openWebSearch(searchQ.trim(), e as any);
                      setSearchModal(false); setSearchQ('');
                    }
                  }}
                >
                  <Text style={[styles.engineText, { color: BLUE }]}>
                    {e.charAt(0).toUpperCase() + e.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.cancelRow} onPress={() => setSearchModal(false)}>
              <Text style={{ color: '#FF6B6B', fontFamily: 'SpaceMono' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MAPS MODAL */}
      <Modal visible={mapsModal} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={[styles.modal, { backgroundColor: C.card }]}>
            <Text style={[styles.modalTitle, { color: C.text }]}>Navigate To</Text>
            <TextInput
              style={[styles.input, { backgroundColor: C.bg, borderColor: C.border, color: C.text }]}
              placeholder="Enter location or address..."
              placeholderTextColor={C.text3}
              value={mapsLoc}
              onChangeText={setMapsLoc}
              autoFocus
            />
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={async () => { await openMaps(mapsLoc); setMapsModal(false); setMapsLoc(''); }}
            >
              <Text style={styles.primaryBtnText}>Open Maps</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelRow} onPress={() => setMapsModal(false)}>
              <Text style={{ color: '#FF6B6B', fontFamily: 'SpaceMono' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* EMAIL MODAL */}
      <Modal visible={emailModal} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={[styles.modal, { backgroundColor: C.card }]}>
            <Text style={[styles.modalTitle, { color: C.text }]}>Send Email</Text>
            <TextInput style={[styles.input, { backgroundColor: C.bg, borderColor: C.border, color: C.text }]}
              placeholder="To: email@example.com" placeholderTextColor={C.text3}
              value={emailTo} onChangeText={setEmailTo} keyboardType="email-address" />
            <TextInput style={[styles.input, { backgroundColor: C.bg, borderColor: C.border, color: C.text }]}
              placeholder="Subject" placeholderTextColor={C.text3}
              value={emailSubject} onChangeText={setEmailSubject} />
            <TextInput style={[styles.input, { backgroundColor: C.bg, borderColor: C.border, color: C.text, height: 80 }]}
              placeholder="Message body..." placeholderTextColor={C.text3}
              value={emailBody} onChangeText={setEmailBody} multiline />
            <TouchableOpacity style={styles.primaryBtn}
              onPress={async () => { await sendEmail(emailTo, emailSubject, emailBody); setEmailModal(false); }}>
              <Text style={styles.primaryBtnText}>Send Email</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelRow} onPress={() => setEmailModal(false)}>
              <Text style={{ color: '#FF6B6B', fontFamily: 'SpaceMono' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* SMS MODAL */}
      <Modal visible={smsModal} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={[styles.modal, { backgroundColor: C.card }]}>
            <Text style={[styles.modalTitle, { color: C.text }]}>Send SMS</Text>
            <TextInput style={[styles.input, { backgroundColor: C.bg, borderColor: C.border, color: C.text }]}
              placeholder="Phone number" placeholderTextColor={C.text3}
              value={smsPhone} onChangeText={setSmsPhone} keyboardType="phone-pad" />
            <TextInput style={[styles.input, { backgroundColor: C.bg, borderColor: C.border, color: C.text, height: 80 }]}
              placeholder="Message..." placeholderTextColor={C.text3}
              value={smsBody} onChangeText={setSmsBody} multiline />
            <TouchableOpacity style={styles.primaryBtn}
              onPress={async () => { await sendSMS(smsPhone, smsBody); setSmsModal(false); }}>
              <Text style={styles.primaryBtnText}>Send SMS</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelRow} onPress={() => setSmsModal(false)}>
              <Text style={{ color: '#FF6B6B', fontFamily: 'SpaceMono' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const light = { bg:'#F5F7FA', card:'#FFF', border:'#E0E0E0', text:'#1A1A1A', text2:'#555', text3:'#888' };
const dark = { bg:'#0A0E1A', card:'#111827', border:'#1E2A4A', text:'#E8EEFF', text2:'#99AACC', text3:'#556080' };

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchRow: { padding: 14, borderBottomWidth: 1 },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, gap: 10, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 14 },
  catScroll: { maxHeight: 56, borderBottomWidth: 1 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  chipText: { fontFamily: 'SpaceMono', fontSize: 11 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 10, justifyContent: 'flex-start' },
  appCard: { width: '30.5%', alignItems: 'center', padding: 14, borderRadius: 16, borderWidth: 1, gap: 8 },
  appIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  appName: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  appCat: { fontFamily: 'SpaceMono', fontSize: 9, textAlign: 'center' },
  empty: { width: '100%', alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontFamily: 'SpaceMono', fontSize: 14 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modal: { borderRadius: 24, padding: 24, paddingBottom: 40, gap: 12 },
  modalTitle: { fontFamily: 'SpaceMono', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  input: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 14 },
  engineRow: { flexDirection: 'row', gap: 8 },
  engineBtn: { flex: 1, padding: 10, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  engineText: { fontFamily: 'SpaceMono', fontSize: 12 },
  primaryBtn: { backgroundColor: BLUE, borderRadius: 12, padding: 14, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  cancelRow: { alignItems: 'center', padding: 10 },
});
