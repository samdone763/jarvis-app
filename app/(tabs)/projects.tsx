import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Modal, TextInput, useColorScheme, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import {
  Project, Task, getProjects, createProject, updateProject,
  deleteProject, addTask, toggleTask, deleteTask, getProjectStats,
} from '../../services/taskManager';

const BLUE = '#0066FF';

type Screen = 'list' | 'detail';

export default function ProjectsScreen() {
  const isDark = useColorScheme() === 'dark';
  const C = isDark ? dark : light;

  const [screen, setScreen] = useState<Screen>('list');
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [selectedPri, setSelectedPri] = useState<Task['priority']>('medium');

  // Modals
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [taskModal, setTaskModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');

  useFocusEffect(useCallback(() => { load(); }, []));

  async function load() {
    const p = await getProjects();
    setProjects(p);
    // Refresh current project if in detail view
    if (currentProject) {
      const updated = p.find(x => x.id === currentProject.id);
      if (updated) setCurrentProject(updated);
    }
  }

  const stats = getProjectStats(projects);

  // ── CREATE ──
  async function handleCreate() {
    if (!newName.trim()) { Alert.alert('Error', 'Please enter a project name'); return; }
    await createProject(newName.trim(), newDesc.trim());
    setCreateModal(false); setNewName(''); setNewDesc('');
    load();
  }

  // ── EDIT ──
  async function handleEdit() {
    if (!currentProject || !newName.trim()) return;
    await updateProject(currentProject.id, { name: newName.trim(), description: newDesc.trim() });
    setEditModal(false);
    load();
  }

  function openEdit() {
    if (!currentProject) return;
    setNewName(currentProject.name);
    setNewDesc(currentProject.description);
    setEditModal(true);
  }

  // ── DELETE PROJECT ──
  async function handleDelete(id: string) {
    Alert.alert('Delete Project', 'Delete this project and all its tasks?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await deleteProject(id);
        setScreen('list');
        setCurrentProject(null);
        load();
      }},
    ]);
  }

  // ── STATUS CYCLE ──
  async function cycleStatus(p: Project) {
    const next = { active: 'completed', completed: 'paused', paused: 'active' } as const;
    await updateProject(p.id, { status: next[p.status] });
    load();
  }

  // ── ADD TASK ──
  async function handleAddTask() {
    if (!currentProject || !taskTitle.trim()) return;
    await addTask(currentProject.id, taskTitle.trim(), selectedPri, taskDesc.trim());
    setTaskModal(false); setTaskTitle(''); setTaskDesc(''); setSelectedPri('medium');
    load();
  }

  // ── TOGGLE TASK ──
  async function handleToggleTask(taskId: string) {
    if (!currentProject) return;
    await toggleTask(currentProject.id, taskId);
    load();
  }

  // ── DELETE TASK ──
  async function handleDeleteTask(taskId: string) {
    if (!currentProject) return;
    await deleteTask(currentProject.id, taskId);
    load();
  }

  // ── SET STATUS ──
  async function setStatus(status: Project['status']) {
    if (!currentProject) return;
    await updateProject(currentProject.id, { status });
    load();
  }

  function openProject(p: Project) {
    setCurrentProject(p);
    setScreen('detail');
  }

  // ─────────────────────────────────────────────────────
  //  RENDER: PROJECT LIST
  // ─────────────────────────────────────────────────────
  if (screen === 'list') return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { num: stats.total, label: 'Total', color: BLUE },
          { num: stats.active, label: 'Active', color: BLUE },
          { num: stats.completed, label: 'Done', color: '#4CAF50' },
          { num: stats.paused, label: 'Paused', color: '#FF9800' },
        ].map(s => (
          <View key={s.label} style={[styles.statCard, { backgroundColor: C.card, borderColor: C.border }]}>
            <Text style={[styles.statNum, { color: s.color }]}>{s.num}</Text>
            <Text style={[styles.statLabel, { color: C.text3 }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* List */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
        {projects.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="grid-outline" size={60} color={C.text3} />
            <Text style={[styles.emptyText, { color: C.text3 }]}>No projects yet</Text>
            <Text style={[styles.emptyHint, { color: C.text3 }]}>Tap + to create your first project</Text>
          </View>
        ) : projects.map(p => {
          const done = p.tasks.filter(t => t.completed).length;
          const total = p.tasks.length;
          const pct = total ? Math.round(done / total * 100) : 0;
          const borderColor = p.status === 'completed' ? '#4CAF50' : p.status === 'paused' ? '#FF9800' : BLUE;
          return (
            <View key={p.id} style={[styles.projCard, { backgroundColor: C.card, borderColor: C.border, borderLeftColor: borderColor }]}>
              <View style={styles.projHeader}>
                <Text style={[styles.projName, { color: C.text }]}>{p.name}</Text>
                <View style={[styles.badge, badgeStyle(p.status)]}>
                  <Text style={[styles.badgeText, badgeTextStyle(p.status)]}>{p.status}</Text>
                </View>
              </View>
              {p.description ? <Text style={[styles.projDesc, { color: C.text2 }]}>{p.description}</Text> : null}
              <View style={styles.progressWrap}>
                <View style={styles.progressLabels}>
                  <Text style={[styles.progressLabel, { color: C.text3 }]}>{done}/{total} tasks</Text>
                  <Text style={[styles.progressLabel, { color: BLUE }]}>{pct}%</Text>
                </View>
                <View style={[styles.progressBar, { backgroundColor: C.border }]}>
                  <View style={[styles.progressFill, { width: `${pct}%` as any }]} />
                </View>
              </View>
              <Text style={[styles.projDate, { color: C.text3 }]}>
                📅 {new Date(p.date).toLocaleDateString()}
              </Text>
              <View style={styles.projActions}>
                <TouchableOpacity style={[styles.btnSm, { backgroundColor: BLUE }]} onPress={() => openProject(p)}>
                  <Text style={{ color: '#fff', fontFamily: 'SpaceMono', fontSize: 11 }}>Open</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btnSm, { backgroundColor: C.bg, borderColor: C.border, borderWidth: 1 }]} onPress={() => cycleStatus(p)}>
                  <Text style={{ color: C.text2, fontFamily: 'SpaceMono', fontSize: 11 }}>Toggle</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btnSm, { backgroundColor: C.bg, borderColor: C.border, borderWidth: 1 }]} onPress={() => handleDelete(p.id)}>
                  <Text style={{ color: '#FF6B6B', fontFamily: 'SpaceMono', fontSize: 11 }}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => { setNewName(''); setNewDesc(''); setCreateModal(true); }}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* CREATE MODAL */}
      <Modal visible={createModal} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={[styles.modal, { backgroundColor: C.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: C.text }]}>New Project</Text>
              <TouchableOpacity onPress={() => setCreateModal(false)}>
                <Ionicons name="close-circle" size={28} color={C.text3} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.label, { color: C.text3 }]}>PROJECT NAME *</Text>
            <TextInput style={[styles.input, { backgroundColor: C.bg, borderColor: C.border, color: C.text }]}
              placeholder="Enter project name..." placeholderTextColor={C.text3}
              value={newName} onChangeText={setNewName} autoFocus />
            <Text style={[styles.label, { color: C.text3 }]}>DESCRIPTION</Text>
            <TextInput style={[styles.input, { backgroundColor: C.bg, borderColor: C.border, color: C.text, height: 80 }]}
              placeholder="What is this project about?" placeholderTextColor={C.text3}
              value={newDesc} onChangeText={setNewDesc} multiline />
            <TouchableOpacity style={styles.primaryBtn} onPress={handleCreate}>
              <Text style={styles.primaryBtnText}>Create Project</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );

  // ─────────────────────────────────────────────────────
  //  RENDER: PROJECT DETAIL
  // ─────────────────────────────────────────────────────
  const p = currentProject!;
  const done = p.tasks.filter(t => t.completed).length;
  const total = p.tasks.length;
  const pct = total ? Math.round(done / total * 100) : 0;

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Detail Header */}
        <View style={[styles.detailHeader, { backgroundColor: C.card, borderBottomColor: C.border }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => { setScreen('list'); load(); }}>
            <Ionicons name="arrow-back" size={20} color={BLUE} />
            <Text style={{ color: BLUE, fontFamily: 'SpaceMono', fontSize: 13 }}>Back</Text>
          </TouchableOpacity>
          <Text style={[styles.detailTitle, { color: C.text }]}>{p.name}</Text>
          <Text style={[styles.detailDate, { color: C.text3 }]}>
            Created {new Date(p.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </Text>
          <View style={styles.detailActions}>
            <TouchableOpacity style={[styles.btnSm, { backgroundColor: BLUE }]} onPress={openEdit}>
              <Text style={{ color: '#fff', fontFamily: 'SpaceMono', fontSize: 11 }}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btnSm, { backgroundColor: '#4CAF5022', borderColor: '#4CAF5055', borderWidth: 1 }]}
              onPress={() => setTaskModal(true)}>
              <Text style={{ color: '#4CAF50', fontFamily: 'SpaceMono', fontSize: 11 }}>+ Task</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btnSm, { backgroundColor: '#FF6B6B22', borderColor: '#FF6B6B55', borderWidth: 1 }]}
              onPress={() => handleDelete(p.id)}>
              <Text style={{ color: '#FF6B6B', fontFamily: 'SpaceMono', fontSize: 11 }}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Status Selector */}
        <View style={styles.statusRow}>
          {(['active','completed','paused'] as const).map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.statusBtn, statusBtnStyle(s), p.status === s && statusBtnActiveStyle(s)]}
              onPress={() => setStatus(s)}
            >
              <Text style={[styles.statusBtnText, p.status === s ? statusBtnActiveTextStyle(s) : { color: C.text3 }]}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Progress */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: C.text3 }]}>PROGRESS</Text>
          <View style={styles.progressRingRow}>
            <View style={styles.progressRingWrap}>
              <View style={styles.progressCircle}>
                <Text style={[styles.progressPct, { color: BLUE }]}>{pct}%</Text>
              </View>
            </View>
            <View>
              <Text style={[styles.progressBig, { color: BLUE }]}>{pct}% Complete</Text>
              <Text style={[styles.progressSub, { color: C.text3 }]}>{done} of {total} tasks done</Text>
            </View>
          </View>
          <View style={[styles.progressBar, { backgroundColor: C.border, height: 8, borderRadius: 4 }]}>
            <View style={[styles.progressFill, { width: `${pct}%` as any, height: 8, borderRadius: 4 }]} />
          </View>
          {p.description ? (
            <Text style={[styles.projDesc, { color: C.text2, marginTop: 12 }]}>{p.description}</Text>
          ) : null}
        </View>

        {/* Tasks */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: C.text3 }]}>TASKS ({total})</Text>
          {total === 0 ? (
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: C.text3 }]}>No tasks yet</Text>
              <Text style={[styles.emptyHint, { color: C.text3 }]}>Tap "+ Task" to add one</Text>
            </View>
          ) : p.tasks.map(t => (
            <View key={t.id} style={[styles.taskCard, { backgroundColor: C.card, borderColor: C.border }]}>
              <TouchableOpacity
                style={[styles.check, { borderColor: C.border }, t.completed && styles.checkDone]}
                onPress={() => handleToggleTask(t.id)}
              >
                {t.completed && <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>✓</Text>}
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text style={[styles.taskTitle, { color: C.text }, t.completed && styles.taskTitleDone]}>
                  {t.title}
                </Text>
                <View style={styles.taskMeta}>
                  <View style={[styles.priBadge, priBadgeStyle(t.priority)]}>
                    <Text style={[styles.priBadgeText, priTextStyle(t.priority)]}>{t.priority}</Text>
                  </View>
                  {t.description ? <Text style={[styles.taskDescSmall, { color: C.text3 }]}>{t.description}</Text> : null}
                </View>
              </View>
              <TouchableOpacity onPress={() => handleDeleteTask(t.id)} style={{ padding: 4 }}>
                <Ionicons name="trash-outline" size={18} color={C.text3} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* EDIT MODAL */}
      <Modal visible={editModal} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={[styles.modal, { backgroundColor: C.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: C.text }]}>Edit Project</Text>
              <TouchableOpacity onPress={() => setEditModal(false)}>
                <Ionicons name="close-circle" size={28} color={C.text3} />
              </TouchableOpacity>
            </View>
            <TextInput style={[styles.input, { backgroundColor: C.bg, borderColor: C.border, color: C.text }]}
              value={newName} onChangeText={setNewName} autoFocus />
            <TextInput style={[styles.input, { backgroundColor: C.bg, borderColor: C.border, color: C.text, height: 80 }]}
              value={newDesc} onChangeText={setNewDesc} multiline />
            <TouchableOpacity style={styles.primaryBtn} onPress={handleEdit}>
              <Text style={styles.primaryBtnText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ADD TASK MODAL */}
      <Modal visible={taskModal} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={[styles.modal, { backgroundColor: C.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: C.text }]}>Add Task</Text>
              <TouchableOpacity onPress={() => setTaskModal(false)}>
                <Ionicons name="close-circle" size={28} color={C.text3} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.label, { color: C.text3 }]}>TASK TITLE *</Text>
            <TextInput style={[styles.input, { backgroundColor: C.bg, borderColor: C.border, color: C.text }]}
              placeholder="What needs to be done?" placeholderTextColor={C.text3}
              value={taskTitle} onChangeText={setTaskTitle} autoFocus />
            <Text style={[styles.label, { color: C.text3 }]}>DESCRIPTION</Text>
            <TextInput style={[styles.input, { backgroundColor: C.bg, borderColor: C.border, color: C.text }]}
              placeholder="Optional details..." placeholderTextColor={C.text3}
              value={taskDesc} onChangeText={setTaskDesc} />
            <Text style={[styles.label, { color: C.text3 }]}>PRIORITY</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
              {(['low','medium','high'] as const).map(pr => (
                <TouchableOpacity key={pr} style={[styles.priBtn, priBtnStyle(pr), selectedPri === pr && priBtnActiveStyle(pr)]}
                  onPress={() => setSelectedPri(pr)}>
                  <Text style={[styles.priBtnText, selectedPri === pr ? priTextStyle(pr) : { color: C.text3 }]}>{pr}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.primaryBtn} onPress={handleAddTask}>
              <Text style={styles.primaryBtnText}>Add Task</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── STYLE HELPERS ────────────────────────────────────
function badgeStyle(s: string) {
  const map: any = { active: { backgroundColor: '#0066FF20' }, completed: { backgroundColor: '#4CAF5020' }, paused: { backgroundColor: '#FF980020' } };
  return map[s] || {};
}
function badgeTextStyle(s: string) {
  const map: any = { active: { color: '#0066FF' }, completed: { color: '#4CAF50' }, paused: { color: '#FF9800' } };
  return map[s] || {};
}
function statusBtnStyle(s: string) { return { flex: 1, padding: 8, borderRadius: 10, borderWidth: 1, borderColor: '#E0E0E0', alignItems: 'center' as const }; }
function statusBtnActiveStyle(s: string) {
  const map: any = { active: { backgroundColor: '#0066FF20', borderColor: '#0066FF' }, completed: { backgroundColor: '#4CAF5020', borderColor: '#4CAF50' }, paused: { backgroundColor: '#FF980020', borderColor: '#FF9800' } };
  return map[s] || {};
}
function statusBtnActiveTextStyle(s: string) {
  const map: any = { active: { color: '#0066FF' }, completed: { color: '#4CAF50' }, paused: { color: '#FF9800' } };
  return map[s] || {};
}
function priBadgeStyle(p: string) {
  const map: any = { high: { backgroundColor: '#FF6B6B20' }, medium: { backgroundColor: '#FF980020' }, low: { backgroundColor: '#4CAF5020' } };
  return map[p] || {};
}
function priTextStyle(p: string) {
  const map: any = { high: { color: '#FF6B6B' }, medium: { color: '#FF9800' }, low: { color: '#4CAF50' } };
  return map[p] || {};
}
function priBtnStyle(p: string) { return { flex: 1, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#E0E0E0', alignItems: 'center' as const }; }
function priBtnActiveStyle(p: string) {
  const map: any = { high: { backgroundColor: '#FF6B6B20', borderColor: '#FF6B6B' }, medium: { backgroundColor: '#FF980020', borderColor: '#FF9800' }, low: { backgroundColor: '#4CAF5020', borderColor: '#4CAF50' } };
  return map[p] || {};
}

const light = { bg:'#F5F7FA', card:'#FFF', border:'#E0E0E0', text:'#1A1A1A', text2:'#555', text3:'#888' };
const dark = { bg:'#0A0E1A', card:'#111827', border:'#1E2A4A', text:'#E8EEFF', text2:'#99AACC', text3:'#556080' };

const styles = StyleSheet.create({
  container: { flex: 1 },
  statsRow: { flexDirection: 'row', padding: 16, gap: 8 },
  statCard: { flex: 1, alignItems: 'center', padding: 12, borderRadius: 14, borderWidth: 1 },
  statNum: { fontFamily: 'SpaceMono', fontSize: 22, fontWeight: '700' },
  statLabel: { fontFamily: 'SpaceMono', fontSize: 9, marginTop: 2, textTransform: 'uppercase' },
  projCard: { borderRadius: 18, padding: 18, marginBottom: 12, borderWidth: 1, borderLeftWidth: 4 },
  projHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  projName: { fontSize: 15, fontWeight: '700', flex: 1, marginRight: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontFamily: 'SpaceMono', fontSize: 10, textTransform: 'uppercase' },
  projDesc: { fontSize: 13, lineHeight: 18, marginBottom: 12 },
  progressWrap: { marginBottom: 10 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontFamily: 'SpaceMono', fontSize: 11 },
  progressBar: { height: 6, borderRadius: 3 },
  progressFill: { height: '100%', backgroundColor: BLUE, borderRadius: 3 },
  projDate: { fontFamily: 'SpaceMono', fontSize: 11, marginBottom: 10 },
  projActions: { flexDirection: 'row', gap: 8 },
  btnSm: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  empty: { alignItems: 'center', paddingTop: 40, gap: 10 },
  emptyText: { fontFamily: 'SpaceMono', fontSize: 14 },
  emptyHint: { fontFamily: 'SpaceMono', fontSize: 11 },
  fab: { position: 'absolute', bottom: 16, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: BLUE, alignItems: 'center', justifyContent: 'center', elevation: 8, shadowColor: BLUE, shadowOpacity: 0.5, shadowRadius: 10 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modal: { borderRadius: 24, padding: 24, paddingBottom: 40, gap: 10 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  modalTitle: { fontFamily: 'SpaceMono', fontSize: 16, fontWeight: '700' },
  label: { fontFamily: 'SpaceMono', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  input: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 14 },
  primaryBtn: { backgroundColor: BLUE, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 4 },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  detailHeader: { padding: 20, borderBottomWidth: 1 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  detailTitle: { fontFamily: 'SpaceMono', fontSize: 18, fontWeight: '700', marginBottom: 4 },
  detailDate: { fontFamily: 'SpaceMono', fontSize: 12, marginBottom: 14 },
  detailActions: { flexDirection: 'row', gap: 8 },
  statusRow: { flexDirection: 'row', padding: 14, gap: 8 },
  statusBtn: { flex: 1, padding: 8, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  statusBtnText: { fontFamily: 'SpaceMono', fontSize: 10, textTransform: 'uppercase' },
  section: { padding: 20, paddingTop: 14 },
  sectionTitle: { fontFamily: 'SpaceMono', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 },
  progressRingRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 14 },
  progressRingWrap: { alignItems: 'center', justifyContent: 'center' },
  progressCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#0066FF20', alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: BLUE },
  progressPct: { fontFamily: 'SpaceMono', fontSize: 14, fontWeight: '700' },
  progressBig: { fontFamily: 'SpaceMono', fontSize: 18, fontWeight: '700' },
  progressSub: { fontFamily: 'SpaceMono', fontSize: 12, marginTop: 4 },
  taskCard: { flexDirection: 'row', alignItems: 'flex-start', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, gap: 12 },
  check: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  checkDone: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  taskTitle: { fontSize: 14, fontWeight: '500', marginBottom: 4 },
  taskTitleDone: { textDecorationLine: 'line-through', opacity: 0.5 },
  taskMeta: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  priBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  priBadgeText: { fontFamily: 'SpaceMono', fontSize: 10, textTransform: 'uppercase' },
  taskDescSmall: { fontSize: 11, fontFamily: 'SpaceMono' },
  priBtn: { flex: 1, padding: 10, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  priBtnText: { fontFamily: 'SpaceMono', fontSize: 12, textTransform: 'uppercase' },
});
