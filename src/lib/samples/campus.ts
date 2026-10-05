import type { Brief, ExplainOverview, GeneratedFile, LearningPath, Plan, Understanding } from "@/lib/schemas";

export const campusIdea = "A campus events app where students can browse, save and get reminders for events.";

export const campusUnderstanding: Understanding = {
  refused: false,
  refusalReason: "",
  appName: "CampusPulse",
  summary: "Discover campus events, save the ones you like and get reminded before they start.",
  targetUsers: "University students who miss events because announcements are scattered across groups and posters",
  problem: "Event information is fragmented, and students forget events they were interested in.",
  platform: "Cross-platform mobile (iOS + Android) via Expo",
  features: ["Browse upcoming events", "Search and filter by category", "Event details", "Save events", "Event reminders"],
  assumptions: ["Events are pre-loaded sample data (no organiser backend in v1)", "Single student user, data stored on device", "Reminders are shown in-app; push notifications are out of scope"],
  risks: ["Without a backend, event data is static", "Students may expect real push notifications"],
  questions: [
    { id: "q1", question: "How should students find events?", why: "Determines the main screen components.", suggestions: ["Search + category filters", "Calendar view", "Simple list only"] },
    { id: "q2", question: "When should reminders trigger?", why: "Affects the reminder data model and UI.", suggestions: ["User picks 15 min / 1 hour / 1 day before", "Always 1 hour before"] },
    { id: "q3", question: "Do students need accounts?", why: "Accounts require a backend, which is out of MVP scope.", suggestions: ["No, keep it on-device", "Yes, later version"] },
  ],
};

export const campusBrief: Brief = {
  appName: "CampusPulse",
  summary: campusUnderstanding.summary,
  targetUsers: campusUnderstanding.targetUsers,
  problem: campusUnderstanding.problem,
  platform: campusUnderstanding.platform,
  features: campusUnderstanding.features,
  assumptions: campusUnderstanding.assumptions,
  answeredQuestions: [
    { question: "How should students find events?", answer: "Search + category filters" },
    { question: "When should reminders trigger?", answer: "User picks 15 min / 1 hour / 1 day before" },
    { question: "Do students need accounts?", answer: "No, keep it on-device" },
  ],
};

export const campusPlan: Plan = {
  scope: "A single-user campus events browser with search, category filters, saved events and in-app reminders, all stored on device.",
  features: [
    { id: "f1", name: "Browse events", description: "Scrollable list of upcoming events with date, time and location", priority: "must", effort: "S", screenIds: ["s1"] },
    { id: "f2", name: "Search & category filter", description: "Filter events by text and by category chips", priority: "must", effort: "M", screenIds: ["s1"] },
    { id: "f3", name: "Event details", description: "Full description, organiser and location", priority: "must", effort: "S", screenIds: ["s2"] },
    { id: "f4", name: "Save events", description: "Bookmark events and see them in one place", priority: "must", effort: "S", screenIds: ["s2", "s3"] },
    { id: "f5", name: "Event reminders", description: "Choose 15 min / 1 hour / 1 day before and see upcoming reminders", priority: "should", effort: "M", screenIds: ["s2", "s4"] },
    { id: "f6", name: "Persist on device", description: "Saved events and reminders survive app restarts", priority: "should", effort: "S", screenIds: ["s3", "s4"] },
  ],
  screens: [
    { id: "s1", name: "EventsScreen", title: "Events", purpose: "Browse, search and filter upcoming events", components: ["SearchBar", "CategoryChips", "EventCard list"], featureIds: ["f1", "f2"] },
    { id: "s2", name: "EventDetailScreen", title: "Event", purpose: "See full details, save and set a reminder", components: ["Banner", "Details", "SaveButton", "ReminderOptions"], featureIds: ["f3", "f4", "f5"] },
    { id: "s3", name: "SavedScreen", title: "Saved", purpose: "Quick access to bookmarked events", components: ["EventCard list", "EmptyState"], featureIds: ["f4", "f6"] },
    { id: "s4", name: "RemindersScreen", title: "Reminders", purpose: "Upcoming reminders with countdowns", components: ["ReminderRow list", "EmptyState"], featureIds: ["f5", "f6"] },
  ],
  navigation: {
    type: "tabs+stack",
    tabs: ["s1", "s3", "s4"],
    edges: [
      { from: "s1", to: "s2", label: "Tap event card" },
      { from: "s3", to: "s2", label: "Tap saved event" },
      { from: "s4", to: "s2", label: "Tap reminder" },
    ],
  },
  entities: [
    { name: "Event", fields: [{ name: "id", type: "string" }, { name: "title", type: "string" }, { name: "category", type: "string" }, { name: "date", type: "ISO string" }, { name: "location", type: "string" }, { name: "organizer", type: "string" }, { name: "description", type: "string" }], relationships: [] },
    { name: "Reminder", fields: [{ name: "id", type: "string" }, { name: "eventId", type: "string" }, { name: "minutesBefore", type: "number" }], relationships: ["eventId → Event.id (one reminder per event)"] },
    { name: "SavedIds", fields: [{ name: "savedIds", type: "string[]" }], relationships: ["each id → Event.id"] },
  ],
  stack: [
    { choice: "Expo (React Native)", reason: "One JavaScript codebase for iOS and Android with instant preview in Snack and no native setup." },
    { choice: "React Navigation (bottom tabs + native stack)", reason: "Three top-level areas map to tabs; the detail screen is pushed on a stack so back navigation works naturally." },
    { choice: "React Context + useReducer", reason: "A small, predictable global store for saved ids and reminders without adding Redux." },
    { choice: "AsyncStorage", reason: "Simple key-value persistence so saves and reminders survive restarts — no backend needed." },
    { choice: "@expo/vector-icons (Ionicons)", reason: "Ships with Expo; recognisable icons for tabs, bookmarks and time." },
  ],
  buildSteps: [
    { id: "step-1", title: "Project skeleton & theme", description: "App.js, theme tokens and React Navigation theme" },
    { id: "step-2", title: "Seed data & date helpers", description: "Sample events relative to today and formatting utilities" },
    { id: "step-3", title: "Global state & persistence", description: "AppContext with useReducer and AsyncStorage" },
    { id: "step-4", title: "Navigation", description: "Bottom tabs inside a native stack" },
    { id: "step-5", title: "Events list with search & filters", description: "EventsScreen, EventCard, CategoryChips" },
    { id: "step-6", title: "Event details, save & reminders", description: "EventDetailScreen with actions" },
    { id: "step-7", title: "Saved & Reminders tabs", description: "Lists with empty states" },
    { id: "step-8", title: "Polish & README", description: "Accessibility labels, empty states, docs" },
  ],
  outOfScope: ["Organiser accounts and event submission", "Backend / cloud sync", "Real push notifications (expo-notifications)", "Ticketing or payments"],
};

const AppJs = `import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { AppProvider } from './src/store/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
import { colors } from './src/theme';

// Customise React Navigation's built-in dark theme with our own colors
const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.card,
    text: colors.text,
    primary: colors.primary,
    border: colors.border,
  },
};

// The root component: global state wraps navigation, which wraps every screen
export default function App() {
  return (
    <AppProvider>
      <NavigationContainer theme={navTheme}>
        <StatusBar style="light" />
        <AppNavigator />
      </NavigationContainer>
    </AppProvider>
  );
}
`;

const themeJs = `// Design tokens: change a value here and every screen updates
export const colors = {
  bg: '#0b0b0f',
  card: '#16161d',
  cardAlt: '#1e1e27',
  border: '#262631',
  text: '#f4f4f6',
  muted: '#9b9bab',
  primary: '#ef4444',
  primarySoft: 'rgba(239,68,68,0.15)',
  success: '#22c55e',
};

// spacing(4) => 16 — keeps spacing consistent
export const spacing = (n) => n * 4;

export const radius = { sm: 8, md: 12, lg: 18, pill: 999 };

export const typography = {
  h1: { fontSize: 26, fontWeight: '800', color: colors.text },
  h2: { fontSize: 18, fontWeight: '700', color: colors.text },
  body: { fontSize: 15, color: colors.text, lineHeight: 22 },
  caption: { fontSize: 12, color: colors.muted },
};
`;

const seedJs = `// Build a date N days from today at a given hour, so events are always upcoming
const daysFromNow = (days, hour) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

export const CATEGORIES = ['All', 'Tech', 'Music', 'Sports', 'Career', 'Clubs'];

export const SEED_EVENTS = [
  { id: 'e1', title: 'Hack Night: Build a Mobile App in 3 Hours', category: 'Tech', date: daysFromNow(1, 18), location: 'Innovation Lab, Block C', organizer: 'Coding Club', emoji: '💻', color: '#3b1d1d', description: 'Team up and ship a tiny app with Expo. Mentors, pizza and prizes for the best demo.' },
  { id: 'e2', title: 'Open Mic & Acoustic Evening', category: 'Music', date: daysFromNow(2, 19), location: 'Central Lawn Amphitheatre', organizer: 'Music Society', emoji: '🎸', color: '#1d2a3b', description: 'Sign up on the spot to perform, or just bring friends and enjoy the music under the stars.' },
  { id: 'e3', title: 'Inter-Department Football Finals', category: 'Sports', date: daysFromNow(3, 16), location: 'University Stadium', organizer: 'Sports Council', emoji: '⚽', color: '#1d3b2a', description: 'Cheer for your department in the season finale. Free entry with student ID.' },
  { id: 'e4', title: 'Resume Clinic with Industry Recruiters', category: 'Career', date: daysFromNow(4, 11), location: 'Placement Cell, Room 204', organizer: 'Career Services', emoji: '📄', color: '#3b351d', description: 'Get 1:1 feedback on your resume from recruiters at top tech companies. Bring a printed copy.' },
  { id: 'e5', title: 'Photography Walk: Campus at Golden Hour', category: 'Clubs', date: daysFromNow(5, 17), location: 'Main Gate', organizer: 'Lens Club', emoji: '📷', color: '#2e1d3b', description: 'A guided walk to capture the best spots on campus. Phones welcome — no fancy camera needed.' },
  { id: 'e6', title: 'AI & Careers Panel', category: 'Tech', date: daysFromNow(7, 15), location: 'Auditorium A', organizer: 'Lunor Student Chapter', emoji: '🤖', color: '#3b1d2e', description: 'Alumni working in AI share how they got started and answer your questions live.' },
];
`;

const dateJs = `const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// "Tue, 7 Oct"
export function formatDate(iso) {
  const d = new Date(iso);
  return DAYS[d.getDay()] + ', ' + d.getDate() + ' ' + MONTHS[d.getMonth()];
}

// "6:00 PM"
export function formatTime(iso) {
  const d = new Date(iso);
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const hours = d.getHours() % 12 || 12;
  return hours + ':' + minutes + ' ' + (d.getHours() >= 12 ? 'PM' : 'AM');
}

// "in 5h" / "in 2d"
export function timeUntil(iso) {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return 'now';
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return 'in ' + Math.max(hours, 1) + 'h';
  return 'in ' + Math.floor(hours / 24) + 'd';
}

export const REMINDER_OPTIONS = [
  { label: '15 min before', minutes: 15 },
  { label: '1 hour before', minutes: 60 },
  { label: '1 day before', minutes: 1440 },
];

export function reminderLabel(minutes) {
  const found = REMINDER_OPTIONS.find((o) => o.minutes === minutes);
  return found ? found.label : minutes + ' min before';
}
`;

const contextJs = `import React, { createContext, useContext, useEffect, useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SEED_EVENTS } from '../data/seed';

const STORAGE_KEY = 'campuspulse:v1';
const AppContext = createContext(null);

const initialState = {
  events: SEED_EVENTS, // read-only sample data
  savedIds: [], // ids of bookmarked events
  reminders: [], // { id, eventId, minutesBefore }
  hydrated: false, // true once AsyncStorage has been read
};

// A reducer is a pure function: (current state, action) => new state
function reducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, ...action.payload, hydrated: true };
    case 'TOGGLE_SAVE': {
      const isSaved = state.savedIds.includes(action.id);
      const savedIds = isSaved ? state.savedIds.filter((id) => id !== action.id) : [...state.savedIds, action.id];
      return { ...state, savedIds };
    }
    case 'SET_REMINDER': {
      // One reminder per event: replace any existing one
      const others = state.reminders.filter((r) => r.eventId !== action.eventId);
      const reminder = { id: String(Date.now()), eventId: action.eventId, minutesBefore: action.minutesBefore };
      return { ...state, reminders: [...others, reminder] };
    }
    case 'REMOVE_REMINDER':
      return { ...state, reminders: state.reminders.filter((r) => r.eventId !== action.eventId) };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // 1) Load saved data once when the app starts
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        const saved = raw ? JSON.parse(raw) : {};
        dispatch({ type: 'HYDRATE', payload: { savedIds: saved.savedIds || [], reminders: saved.reminders || [] } });
      })
      .catch(() => dispatch({ type: 'HYDRATE', payload: {} }));
  }, []);

  // 2) Save whenever the user's data changes (after the first load)
  useEffect(() => {
    if (!state.hydrated) return;
    const data = JSON.stringify({ savedIds: state.savedIds, reminders: state.reminders });
    AsyncStorage.setItem(STORAGE_KEY, data).catch(() => {});
  }, [state.savedIds, state.reminders, state.hydrated]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

// Custom hook so screens can write: const { state, dispatch } = useApp();
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
`;

const navJs = `import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import EventsScreen from '../screens/EventsScreen';
import EventDetailScreen from '../screens/EventDetailScreen';
import SavedScreen from '../screens/SavedScreen';
import RemindersScreen from '../screens/RemindersScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS = { Events: 'calendar', Saved: 'bookmark', Reminders: 'notifications' };

const headerStyle = {
  headerStyle: { backgroundColor: colors.bg },
  headerTintColor: colors.text,
  headerShadowVisible: false,
};

// The three top-level areas live in bottom tabs
function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...headerStyle,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons name={focused ? TAB_ICONS[route.name] : TAB_ICONS[route.name] + '-outline'} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Events" component={EventsScreen} />
      <Tab.Screen name="Saved" component={SavedScreen} />
      <Tab.Screen name="Reminders" component={RemindersScreen} />
    </Tab.Navigator>
  );
}

// The stack sits on top of the tabs so EventDetail slides in with a back button
export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ ...headerStyle, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="Home" component={Tabs} options={{ headerShown: false }} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} options={{ title: 'Event' }} />
    </Stack.Navigator>
  );
}
`;

const eventCardJs = `import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import { formatDate, formatTime } from '../utils/date';

// A reusable card. It receives data and callbacks through props.
export default function EventCard({ event, saved, onPress, onToggleSave }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel={'Open ' + event.title}>
      <View style={[styles.banner, { backgroundColor: event.color }]}>
        <Text style={styles.emoji}>{event.emoji}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.category}>{event.category.toUpperCase()}</Text>
        <Text style={styles.title} numberOfLines={2}>{event.title}</Text>
        <View style={styles.row}>
          <Ionicons name="time-outline" size={13} color={colors.muted} />
          <Text style={styles.meta}>{formatDate(event.date)} · {formatTime(event.date)}</Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="location-outline" size={13} color={colors.muted} />
          <Text style={styles.meta} numberOfLines={1}>{event.location}</Text>
        </View>
      </View>
      <Pressable onPress={onToggleSave} hitSlop={12} style={styles.save} accessibilityLabel={saved ? 'Remove from saved' : 'Save event'}>
        <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={22} color={saved ? colors.primary : colors.muted} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing(3), marginBottom: spacing(3), alignItems: 'center' },
  pressed: { opacity: 0.85 },
  banner: { width: 64, height: 64, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 28 },
  body: { flex: 1, marginLeft: spacing(3) },
  category: { color: colors.primary, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  title: { color: colors.text, fontSize: 15, fontWeight: '700', marginVertical: 2 },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  meta: { color: colors.muted, fontSize: 12, marginLeft: 4, flexShrink: 1 },
  save: { padding: spacing(1) },
});
`;

const chipsJs = `import React from 'react';
import { ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../theme';

// Horizontal list of filter chips. "selected" and "onSelect" come from the parent screen.
export default function CategoryChips({ categories, selected, onSelect }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {categories.map((cat) => {
        const active = cat === selected;
        return (
          <Pressable key={cat} onPress={() => onSelect(cat)} style={[styles.chip, active && styles.active]} accessibilityState={{ selected: active }}>
            <Text style={[styles.text, active && styles.activeText]}>{cat}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingVertical: spacing(2) },
  chip: { paddingHorizontal: spacing(4), paddingVertical: spacing(2), borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, marginRight: spacing(2) },
  active: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  text: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  activeText: { color: colors.text },
});
`;

const eventsScreenJs = `import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../store/AppContext';
import EventCard from '../components/EventCard';
import CategoryChips from '../components/CategoryChips';
import { CATEGORIES } from '../data/seed';
import { colors, spacing, radius, typography } from '../theme';

export default function EventsScreen({ navigation }) {
  const { state, dispatch } = useApp();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

  // Recompute the filtered list only when its inputs change
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.events
      .filter((e) => category === 'All' || e.category === category)
      .filter((e) => !q || e.title.toLowerCase().includes(q) || e.location.toLowerCase().includes(q))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [state.events, query, category]);

  return (
    <View style={styles.container}>
      <Text style={typography.h1}>What's on campus</Text>
      <Text style={[typography.caption, styles.sub]}>{state.events.length} upcoming events this week</Text>

      <View style={styles.search}>
        <Ionicons name="search" size={16} color={colors.muted} />
        <TextInput value={query} onChangeText={setQuery} placeholder="Search events or places" placeholderTextColor={colors.muted} style={styles.input} accessibilityLabel="Search events" />
      </View>

      <CategoryChips categories={CATEGORIES} selected={category} onSelect={setCategory} />

      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EventCard
            event={item}
            saved={state.savedIds.includes(item.id)}
            onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
            onToggleSave={() => dispatch({ type: 'TOGGLE_SAVE', id: item.id })}
          />
        )}
        ListEmptyComponent={<Text style={styles.empty}>No events match your search.</Text>}
        contentContainerStyle={{ paddingBottom: spacing(6) }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing(4), paddingTop: spacing(2) },
  sub: { marginTop: 2, marginBottom: spacing(3) },
  search: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing(3) },
  input: { flex: 1, color: colors.text, paddingVertical: spacing(3), marginLeft: spacing(2), fontSize: 14 },
  empty: { color: colors.muted, textAlign: 'center', marginTop: spacing(10) },
});
`;

const detailScreenJs = `import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../store/AppContext';
import { colors, spacing, radius, typography } from '../theme';
import { formatDate, formatTime, REMINDER_OPTIONS, reminderLabel } from '../utils/date';

export default function EventDetailScreen({ route }) {
  const { state, dispatch } = useApp();
  // The id was passed by navigation.navigate('EventDetail', { eventId })
  const event = state.events.find((e) => e.id === route.params.eventId);
  if (!event) return <Text style={styles.missing}>Event not found.</Text>;

  const saved = state.savedIds.includes(event.id);
  const reminder = state.reminders.find((r) => r.eventId === event.id);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: spacing(10) }}>
      <View style={[styles.banner, { backgroundColor: event.color }]}>
        <Text style={styles.emoji}>{event.emoji}</Text>
      </View>
      <Text style={styles.category}>{event.category.toUpperCase()}</Text>
      <Text style={typography.h1}>{event.title}</Text>

      <View style={styles.infoRow}><Ionicons name="calendar-outline" size={16} color={colors.primary} /><Text style={styles.info}>{formatDate(event.date)} at {formatTime(event.date)}</Text></View>
      <View style={styles.infoRow}><Ionicons name="location-outline" size={16} color={colors.primary} /><Text style={styles.info}>{event.location}</Text></View>
      <View style={styles.infoRow}><Ionicons name="people-outline" size={16} color={colors.primary} /><Text style={styles.info}>Hosted by {event.organizer}</Text></View>

      <Text style={[typography.body, styles.desc]}>{event.description}</Text>

      <Pressable onPress={() => dispatch({ type: 'TOGGLE_SAVE', id: event.id })} style={[styles.button, saved && styles.buttonSaved]} accessibilityRole="button">
        <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={18} color="#fff" />
        <Text style={styles.buttonText}>{saved ? 'Saved' : 'Save event'}</Text>
      </Pressable>

      <Text style={[typography.h2, styles.section]}>Remind me</Text>
      <View style={styles.options}>
        {REMINDER_OPTIONS.map((opt) => {
          const active = reminder && reminder.minutesBefore === opt.minutes;
          return (
            <Pressable key={opt.minutes} onPress={() => dispatch({ type: 'SET_REMINDER', eventId: event.id, minutesBefore: opt.minutes })} style={[styles.option, active && styles.optionActive]}>
              <Text style={[styles.optionText, active && { color: colors.text }]}>{opt.label}</Text>
            </Pressable>
          );
        })}
      </View>
      {reminder ? (
        <Pressable onPress={() => dispatch({ type: 'REMOVE_REMINDER', eventId: event.id })} style={styles.remove}>
          <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          <Text style={styles.removeText}>Reminder set: {reminderLabel(reminder.minutesBefore)} · tap to remove</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing(4) },
  missing: { color: colors.muted, padding: spacing(6) },
  banner: { height: 140, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', marginBottom: spacing(4) },
  emoji: { fontSize: 56 },
  category: { color: colors.primary, fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: spacing(1) },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing(2) },
  info: { color: colors.text, marginLeft: spacing(2), fontSize: 14 },
  desc: { marginTop: spacing(4), color: colors.muted },
  button: { marginTop: spacing(5), backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing(3.5), flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  buttonSaved: { backgroundColor: '#7f1d1d' },
  buttonText: { color: '#fff', fontWeight: '700', marginLeft: spacing(2) },
  section: { marginTop: spacing(6), marginBottom: spacing(2) },
  options: { flexDirection: 'row', flexWrap: 'wrap' },
  option: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, borderRadius: radius.pill, paddingHorizontal: spacing(3.5), paddingVertical: spacing(2), marginRight: spacing(2), marginBottom: spacing(2) },
  optionActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  optionText: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  remove: { flexDirection: 'row', alignItems: 'center', marginTop: spacing(2) },
  removeText: { color: colors.muted, marginLeft: spacing(2), fontSize: 13 },
});
`;

const savedScreenJs = `import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../store/AppContext';
import EventCard from '../components/EventCard';
import { colors, spacing, radius, typography } from '../theme';

export default function SavedScreen({ navigation }) {
  const { state, dispatch } = useApp();
  // Derive the saved events from ids — we never store the same data twice
  const saved = state.events.filter((e) => state.savedIds.includes(e.id));

  if (saved.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="bookmark-outline" size={42} color={colors.muted} />
        <Text style={[typography.h2, { marginTop: spacing(3) }]}>No saved events yet</Text>
        <Text style={[typography.caption, styles.center]}>Tap the bookmark on any event to keep it here.</Text>
        <Pressable onPress={() => navigation.navigate('Events')} style={styles.cta}>
          <Text style={styles.ctaText}>Browse events</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={saved}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <EventCard event={item} saved onPress={() => navigation.navigate('EventDetail', { eventId: item.id })} onToggleSave={() => dispatch({ type: 'TOGGLE_SAVE', id: item.id })} />
      )}
      contentContainerStyle={{ padding: spacing(4) }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  empty: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: spacing(8) },
  center: { textAlign: 'center', marginTop: spacing(1) },
  cta: { marginTop: spacing(5), backgroundColor: colors.primary, paddingHorizontal: spacing(5), paddingVertical: spacing(3), borderRadius: radius.md },
  ctaText: { color: '#fff', fontWeight: '700' },
});
`;

const remindersScreenJs = `import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../store/AppContext';
import { colors, spacing, radius, typography } from '../theme';
import { formatDate, formatTime, reminderLabel, timeUntil } from '../utils/date';

export default function RemindersScreen({ navigation }) {
  const { state, dispatch } = useApp();

  // Join each reminder with its event, then sort by when the reminder fires
  const items = state.reminders
    .map((r) => {
      const event = state.events.find((e) => e.id === r.eventId);
      if (!event) return null;
      const fireAt = new Date(new Date(event.date).getTime() - r.minutesBefore * 60000).toISOString();
      return { ...r, event, fireAt };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(a.fireAt) - new Date(b.fireAt));

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="notifications-outline" size={42} color={colors.muted} />
        <Text style={[typography.h2, { marginTop: spacing(3) }]}>No reminders</Text>
        <Text style={[typography.caption, styles.center]}>Open an event and choose when you'd like to be reminded.</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={items}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: spacing(4) }}
      ListHeaderComponent={<Text style={[typography.caption, { marginBottom: spacing(3) }]}>In-app reminders · {items.length} upcoming</Text>}
      renderItem={({ item }) => (
        <Pressable onPress={() => navigation.navigate('EventDetail', { eventId: item.event.id })} style={styles.row}>
          <View style={styles.badge}><Text style={styles.badgeText}>{timeUntil(item.fireAt)}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={1}>{item.event.title}</Text>
            <Text style={styles.meta}>{reminderLabel(item.minutesBefore)} · {formatDate(item.event.date)}, {formatTime(item.event.date)}</Text>
          </View>
          <Pressable onPress={() => dispatch({ type: 'REMOVE_REMINDER', eventId: item.event.id })} hitSlop={10} accessibilityLabel="Remove reminder">
            <Ionicons name="close-circle-outline" size={22} color={colors.muted} />
          </Pressable>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  empty: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: spacing(8) },
  center: { textAlign: 'center', marginTop: spacing(1) },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing(3), marginBottom: spacing(3) },
  badge: { backgroundColor: colors.primarySoft, borderRadius: radius.md, paddingHorizontal: spacing(2.5), paddingVertical: spacing(2), marginRight: spacing(3) },
  badgeText: { color: colors.primary, fontWeight: '800', fontSize: 12 },
  title: { color: colors.text, fontWeight: '700', fontSize: 15 },
  meta: { color: colors.muted, fontSize: 12, marginTop: 2 },
});
`;

const readme = `# CampusPulse

Discover campus events, save the ones you like and get reminded before they start.
Generated with **Lunor AppStudio** (AI-generated — review before real-world use).

## Run it
\`\`\`bash
npm install
npx expo start
\`\`\`
Scan the QR code with Expo Go, or press **w** for web.

## Structure
| File | Feature |
|---|---|
| App.js | Root: state provider + navigation container |
| src/theme.js | Colors, spacing, radius, typography |
| src/data/seed.js | Sample events (always in the future) |
| src/store/AppContext.js | Global state (useReducer) + AsyncStorage persistence |
| src/navigation/AppNavigator.js | Bottom tabs inside a native stack |
| src/screens/EventsScreen.js | Browse, search & category filter |
| src/screens/EventDetailScreen.js | Details, save, set reminder |
| src/screens/SavedScreen.js | Saved events |
| src/screens/RemindersScreen.js | Upcoming reminders |
| src/components/EventCard.js, CategoryChips.js | Reusable UI |
| src/utils/date.js | Date formatting & reminder options |

## Out of scope
Accounts, backend sync, real push notifications, ticketing.
`;

export const campusFiles: GeneratedFile[] = [
  { path: "App.js", language: "javascript", content: AppJs, purpose: "Root component wiring global state and navigation.", stepId: "step-1" },
  { path: "src/theme.js", language: "javascript", content: themeJs, purpose: "Design tokens shared by every screen.", stepId: "step-1" },
  { path: "src/data/seed.js", language: "javascript", content: seedJs, purpose: "Sample events dated relative to today.", stepId: "step-2" },
  { path: "src/utils/date.js", language: "javascript", content: dateJs, purpose: "Date formatting and reminder option helpers.", stepId: "step-2" },
  { path: "src/store/AppContext.js", language: "javascript", content: contextJs, purpose: "Global state with useReducer, persisted to AsyncStorage.", stepId: "step-3" },
  { path: "src/navigation/AppNavigator.js", language: "javascript", content: navJs, purpose: "Bottom tabs nested in a native stack.", stepId: "step-4" },
  { path: "src/components/EventCard.js", language: "javascript", content: eventCardJs, purpose: "Reusable event card with save toggle.", stepId: "step-5" },
  { path: "src/components/CategoryChips.js", language: "javascript", content: chipsJs, purpose: "Horizontal category filter chips.", stepId: "step-5" },
  { path: "src/screens/EventsScreen.js", language: "javascript", content: eventsScreenJs, purpose: "Browse, search and filter events.", stepId: "step-5" },
  { path: "src/screens/EventDetailScreen.js", language: "javascript", content: detailScreenJs, purpose: "Event details with save and reminder actions.", stepId: "step-6" },
  { path: "src/screens/SavedScreen.js", language: "javascript", content: savedScreenJs, purpose: "List of saved events with empty state.", stepId: "step-7" },
  { path: "src/screens/RemindersScreen.js", language: "javascript", content: remindersScreenJs, purpose: "Upcoming reminders sorted by fire time.", stepId: "step-7" },
  { path: "README.md", language: "markdown", content: readme, purpose: "How to run the app and where each feature lives.", stepId: "step-8" },
];

export const campusExplain: ExplainOverview = {
  fileSummaries: [
    { path: "App.js", summary: "The starting point. It wraps the whole app in AppProvider (shared data) and NavigationContainer (screen switching), and applies a dark navigation theme built from theme.js colors.", keyIdentifiers: ["App", "navTheme", "AppProvider", "NavigationContainer"] },
    { path: "src/theme.js", summary: "One place for colors, spacing, corner radius and text styles. Screens import these instead of hard-coding values, so the look stays consistent.", keyIdentifiers: ["colors", "spacing", "radius", "typography"] },
    { path: "src/data/seed.js", summary: "Six sample events. daysFromNow() builds dates relative to today, so the events are always upcoming. CATEGORIES feeds the filter chips.", keyIdentifiers: ["SEED_EVENTS", "CATEGORIES", "daysFromNow"] },
    { path: "src/utils/date.js", summary: "Small pure helpers that turn ISO dates into friendly text and define the three reminder choices.", keyIdentifiers: ["formatDate", "formatTime", "timeUntil", "REMINDER_OPTIONS", "reminderLabel"] },
    { path: "src/store/AppContext.js", summary: "The app's memory. A reducer handles TOGGLE_SAVE, SET_REMINDER and REMOVE_REMINDER; two useEffect hooks load from and save to AsyncStorage. useApp() lets any screen read state and dispatch actions.", keyIdentifiers: ["AppProvider", "useApp", "reducer", "STORAGE_KEY", "HYDRATE"] },
    { path: "src/navigation/AppNavigator.js", summary: "Defines a bottom tab bar (Events, Saved, Reminders) inside a stack, so EventDetail can slide in over any tab with a back button.", keyIdentifiers: ["AppNavigator", "Tabs", "Stack", "Tab", "TAB_ICONS"] },
    { path: "src/components/EventCard.js", summary: "A reusable card that shows one event. It doesn't own any data — the parent passes event, saved, onPress and onToggleSave as props.", keyIdentifiers: ["EventCard", "onToggleSave", "Pressable"] },
    { path: "src/components/CategoryChips.js", summary: "A horizontal scroll of filter chips; highlights the selected category and reports taps through onSelect.", keyIdentifiers: ["CategoryChips", "onSelect", "selected"] },
    { path: "src/screens/EventsScreen.js", summary: "The home tab. Keeps local query and category state, filters events with useMemo, and renders them with FlatList + EventCard.", keyIdentifiers: ["EventsScreen", "useMemo", "visible", "FlatList"] },
    { path: "src/screens/EventDetailScreen.js", summary: "Reads eventId from route.params, shows full details and lets the user save or choose a reminder time.", keyIdentifiers: ["EventDetailScreen", "route.params.eventId", "SET_REMINDER"] },
    { path: "src/screens/SavedScreen.js", summary: "Derives saved events from savedIds and shows them, or a friendly empty state with a Browse button.", keyIdentifiers: ["SavedScreen", "saved"] },
    { path: "src/screens/RemindersScreen.js", summary: "Joins reminders with events, calculates when each reminder fires, sorts them and shows a countdown badge.", keyIdentifiers: ["RemindersScreen", "fireAt", "timeUntil"] },
    { path: "README.md", summary: "How to run the app and a map from files to features.", keyIdentifiers: [] },
  ],
  decisions: [
    { id: "d1", title: "Bottom tabs inside a stack", planRef: "navigation: tabs+stack", rationale: "Events, Saved and Reminders are equal top-level areas, so tabs keep them one tap away. Putting the tabs inside a stack lets EventDetail open over any tab and get a native back button for free." },
    { id: "d2", title: "React Context + useReducer for state", planRef: "stack: React Context + useReducer", rationale: "Only two pieces of user data change (savedIds and reminders). A reducer keeps every change in one predictable function, and Context shares it without adding Redux." },
    { id: "d3", title: "Store ids, not copies", planRef: "entity: SavedIds", rationale: "Saving an event stores just its id. SavedScreen derives the full objects from events, so data can never get out of sync." },
    { id: "d4", title: "AsyncStorage for persistence", planRef: "feature f6: Persist on device", rationale: "Key-value storage is enough for a small JSON blob, works in Expo Go and on web, and avoids needing a backend." },
    { id: "d5", title: "In-app reminders instead of push notifications", planRef: "outOfScope: Real push notifications", rationale: "Push notifications need extra native permissions and packages outside the allow-list. In-app reminders prove the data model now; expo-notifications can be added later." },
  ],
  dataFlow: [
    { step: "User taps the bookmark on an EventCard", file: "src/components/EventCard.js", detail: "onToggleSave (a prop) is called." },
    { step: "The screen dispatches an action", file: "src/screens/EventsScreen.js", detail: "dispatch({ type: 'TOGGLE_SAVE', id: item.id })" },
    { step: "The reducer returns new state", file: "src/store/AppContext.js", detail: "TOGGLE_SAVE adds or removes the id from savedIds (a new array, never mutated)." },
    { step: "State is persisted", file: "src/store/AppContext.js", detail: "The save useEffect runs because savedIds changed and writes JSON to AsyncStorage." },
    { step: "Every screen re-renders", file: "src/screens/SavedScreen.js", detail: "useApp() returns the new state, so the Saved tab and bookmark icons update instantly." },
    { step: "On next launch", file: "src/store/AppContext.js", detail: "The load useEffect reads AsyncStorage and dispatches HYDRATE to restore savedIds and reminders." },
  ],
};

export const campusLearn: LearningPath = {
  concepts: [
    { name: "Components & JSX", definition: "Functions that return UI. React Native uses View, Text and Pressable instead of div and button.", file: "src/components/EventCard.js", snippet: "export default function EventCard({ event, saved, onPress, onToggleSave }) {\n  return (\n    <Pressable onPress={onPress} style={...}>" },
    { name: "Props", definition: "Inputs passed from a parent to a child component. They make components reusable.", file: "src/screens/EventsScreen.js", snippet: "<EventCard\n  event={item}\n  saved={state.savedIds.includes(item.id)}\n  onToggleSave={() => dispatch({ type: 'TOGGLE_SAVE', id: item.id })}\n/>" },
    { name: "Local state (useState)", definition: "Data owned by one component that triggers a re-render when it changes.", file: "src/screens/EventsScreen.js", snippet: "const [query, setQuery] = useState('');\nconst [category, setCategory] = useState('All');" },
    { name: "Global state (Context + useReducer)", definition: "Shared data that any screen can read and update through actions.", file: "src/store/AppContext.js", snippet: "case 'TOGGLE_SAVE': {\n  const isSaved = state.savedIds.includes(action.id);\n  ..." },
    { name: "Navigation & params", definition: "Moving between screens and passing data along.", file: "src/screens/EventsScreen.js", snippet: "navigation.navigate('EventDetail', { eventId: item.id })" },
    { name: "Lists (FlatList)", definition: "Efficiently renders long lists by only drawing visible rows.", file: "src/screens/EventsScreen.js", snippet: "<FlatList data={visible} keyExtractor={(item) => item.id} renderItem={...} />" },
    { name: "Side effects & storage", definition: "useEffect runs code after render — here to load and save data with AsyncStorage.", file: "src/store/AppContext.js", snippet: "useEffect(() => {\n  if (!state.hydrated) return;\n  AsyncStorage.setItem(STORAGE_KEY, data);\n}, [state.savedIds, state.reminders, state.hydrated]);" },
  ],
  lessons: [
    { id: "l1", title: "Set up the skeleton and theme", goal: "Create an Expo app with a shared design system", buildStepId: "step-1", files: ["App.js", "src/theme.js"], steps: ["Create a blank Expo app", "Add src/theme.js with colors and spacing", "Render a Text using typography.h1"], exercise: { prompt: "Add a 'warning' color to theme.js and use it for a test Text in App.js.", hints: ["colors is a plain object — add a new key", "Import { colors } and use style={{ color: colors.warning }}"], expectedOutcome: "The text renders in your new warning color." } },
    { id: "l2", title: "Model your data", goal: "Create seed events and date helpers", buildStepId: "step-2", files: ["src/data/seed.js", "src/utils/date.js"], steps: ["Write daysFromNow()", "Create SEED_EVENTS", "Write formatDate and formatTime"], exercise: { prompt: "Add a seventh event in the 'Career' category happening in 10 days.", hints: ["Copy an existing object and change its id", "Use daysFromNow(10, 14)"], expectedOutcome: "The new event appears at the bottom of the Events list." } },
    { id: "l3", title: "Global state with a reducer", goal: "Share saved ids across screens and persist them", buildStepId: "step-3", files: ["src/store/AppContext.js"], steps: ["Create the context and reducer", "Implement TOGGLE_SAVE", "Load and save with AsyncStorage in useEffect"], exercise: { prompt: "Add a CLEAR_SAVED action that removes all saved events.", hints: ["Add a new case to the switch", "Return { ...state, savedIds: [] }"], expectedOutcome: "Dispatching CLEAR_SAVED empties the Saved tab." } },
    { id: "l4", title: "Tabs inside a stack", goal: "Build the navigation structure", buildStepId: "step-4", files: ["src/navigation/AppNavigator.js"], steps: ["Create a Tab navigator with three tabs", "Wrap it in a Stack", "Add EventDetail to the stack"], exercise: { prompt: "Change the Reminders tab icon to 'alarm'.", hints: ["Look at TAB_ICONS", "Ionicons also has 'alarm-outline'"], expectedOutcome: "The tab shows an alarm clock icon." } },
    { id: "l5", title: "Events list, search and filters", goal: "Render, search and filter a list", buildStepId: "step-5", files: ["src/screens/EventsScreen.js", "src/components/EventCard.js", "src/components/CategoryChips.js"], steps: ["Build EventCard with props", "Add the search TextInput", "Filter with useMemo", "Render with FlatList"], exercise: { prompt: "Make the search also match the organizer name.", hints: ["Find the .filter that checks query", "Add || e.organizer.toLowerCase().includes(q)"], expectedOutcome: "Searching 'club' shows Coding Club and Lens Club events." } },
    { id: "l6", title: "Details, save and reminders", goal: "Read route params and dispatch actions", buildStepId: "step-6", files: ["src/screens/EventDetailScreen.js"], steps: ["Read route.params.eventId", "Find the event", "Add the Save button", "Add reminder option chips"], exercise: { prompt: "Add a '3 hours before' reminder option.", hints: ["Edit REMINDER_OPTIONS in utils/date.js", "minutes: 180"], expectedOutcome: "A fourth chip appears and sets a 3-hour reminder." } },
    { id: "l7", title: "Saved and Reminders tabs", goal: "Derive data and design empty states", buildStepId: "step-7", files: ["src/screens/SavedScreen.js", "src/screens/RemindersScreen.js"], steps: ["Derive saved events from ids", "Compute fireAt for reminders", "Add empty states"], exercise: { prompt: "Show the number of saved events in the Saved screen header text.", hints: ["saved.length gives the count", "Add a ListHeaderComponent to the FlatList"], expectedOutcome: "The Saved tab shows e.g. '3 saved events' above the list." } },
  ],
  quiz: [
    { question: "In EventsScreen.js, why is the filtered list wrapped in useMemo?", options: ["So it only recomputes when events, query or category change", "Because FlatList requires memoised data", "To save the list to AsyncStorage", "To make the list scroll horizontally"], answerIndex: 0, explanation: "useMemo caches the result and recalculates only when its dependencies change." },
    { question: "What does the TOGGLE_SAVE case in AppContext.js store?", options: ["A full copy of the event", "Only the event id in savedIds", "The event title", "A timestamp"], answerIndex: 1, explanation: "Storing ids avoids duplicate data; SavedScreen derives the events from ids." },
    { question: "How does EventDetailScreen know which event to show?", options: ["It reads a global selectedEvent variable", "It fetches it from a server", "From route.params.eventId passed by navigation.navigate", "From AsyncStorage"], answerIndex: 2, explanation: "EventsScreen calls navigation.navigate('EventDetail', { eventId }) and the detail screen reads route.params." },
    { question: "Why does the save useEffect check state.hydrated first?", options: ["To avoid overwriting stored data with empty initial state before loading finishes", "Because AsyncStorage only works after hydration on iOS", "To improve rendering speed", "It is required by React Navigation"], answerIndex: 0, explanation: "Without the check, the first render would save empty arrays over the user's real data." },
    { question: "Why are tabs nested inside a stack in AppNavigator.js?", options: ["Tabs cannot exist on their own", "So EventDetail can be pushed over any tab with a back button", "To hide the tab bar permanently", "To load screens faster"], answerIndex: 1, explanation: "The stack hosts the Tabs screen and the EventDetail screen, giving a natural push/back flow." },
  ],
  nextSteps: [
    { title: "Add real notifications", description: "Schedule local notifications with expo-notifications.", url: "https://docs.expo.dev/versions/latest/sdk/notifications/" },
    { title: "Deep dive: React Navigation", description: "Learn nesting navigators and passing params.", url: "https://reactnavigation.org/docs/nesting-navigators" },
    { title: "Managing state", description: "When to use reducers and context.", url: "https://react.dev/learn/scaling-up-with-reducer-and-context" },
    { title: "FlatList performance", description: "Optimise long lists.", url: "https://reactnative.dev/docs/optimizing-flatlist-configuration" },
  ],
};
