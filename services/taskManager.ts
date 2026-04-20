import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── INTERFACES ──────────────────────────────────────
export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  date: string;
  status: 'active' | 'completed' | 'paused';
  tasks: Task[];
  progress: number;
  color?: string;
  tags?: string[];
}

export interface AppSettings {
  userName: string;
  voiceEnabled: boolean;
  darkMode: boolean;
  notifEnabled: boolean;
}

// ─── STORAGE KEYS ────────────────────────────────────
const PROJECTS_KEY = 'jarvis_projects';
const SETTINGS_KEY = 'jarvis_settings';

// ─── PROJECT CRUD ────────────────────────────────────
export async function getProjects(): Promise<Project[]> {
  try {
    const raw = await AsyncStorage.getItem(PROJECTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export async function saveProjects(projects: Project[]): Promise<void> {
  await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export async function createProject(name: string, description = ''): Promise<Project> {
  const projects = await getProjects();
  const project: Project = {
    id: Date.now().toString(),
    name,
    description,
    date: new Date().toISOString(),
    status: 'active',
    tasks: [],
    progress: 0,
    color: '#0066FF',
    tags: [],
  };
  projects.push(project);
  await saveProjects(projects);
  return project;
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
  const projects = await getProjects();
  const idx = projects.findIndex(p => p.id === id);
  if (idx === -1) return null;
  projects[idx] = { ...projects[idx], ...updates };
  await saveProjects(projects);
  return projects[idx];
}

export async function deleteProject(id: string): Promise<void> {
  const projects = await getProjects();
  await saveProjects(projects.filter(p => p.id !== id));
}

// ─── TASK CRUD ────────────────────────────────────────
export async function addTask(
  projectId: string,
  title: string,
  priority: Task['priority'] = 'medium',
  description = ''
): Promise<Task | null> {
  const projects = await getProjects();
  const proj = projects.find(p => p.id === projectId);
  if (!proj) return null;
  const task: Task = {
    id: Date.now().toString(),
    title, description, completed: false, priority,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  proj.tasks.push(task);
  recalcProgress(proj);
  await saveProjects(projects);
  return task;
}

export async function toggleTask(projectId: string, taskId: string): Promise<void> {
  const projects = await getProjects();
  const proj = projects.find(p => p.id === projectId);
  if (!proj) return;
  const task = proj.tasks.find(t => t.id === taskId);
  if (!task) return;
  task.completed = !task.completed;
  task.updatedAt = new Date().toISOString();
  recalcProgress(proj);
  await saveProjects(projects);
}

export async function deleteTask(projectId: string, taskId: string): Promise<void> {
  const projects = await getProjects();
  const proj = projects.find(p => p.id === projectId);
  if (!proj) return;
  proj.tasks = proj.tasks.filter(t => t.id !== taskId);
  recalcProgress(proj);
  await saveProjects(projects);
}

export function recalcProgress(project: Project): void {
  const total = project.tasks.length;
  const done = project.tasks.filter(t => t.completed).length;
  project.progress = total > 0 ? Math.round((done / total) * 100) : 0;
  if (project.progress === 100 && total > 0) project.status = 'completed';
}

// ─── SETTINGS ────────────────────────────────────────
export async function getSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : defaultSettings();
  } catch { return defaultSettings(); }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function defaultSettings(): AppSettings {
  return { userName: 'Sam', voiceEnabled: true, darkMode: false, notifEnabled: true };
}

// ─── STATS ───────────────────────────────────────────
export function getProjectStats(projects: Project[]) {
  return {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    paused: projects.filter(p => p.status === 'paused').length,
  };
}

export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove([PROJECTS_KEY, SETTINGS_KEY]);
}
