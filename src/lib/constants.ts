/** Build constraints shared by prompts and the post-generation validator (PRD §8.3, §11). */

export const DEPENDENCY_ALLOW_LIST: Record<string, string> = {
  expo: "~52.0.0",
  "expo-status-bar": "~2.0.0",
  react: "18.3.1",
  "react-native": "0.76.5",
  "@react-navigation/native": "^7.0.0",
  "@react-navigation/native-stack": "^7.0.0",
  "@react-navigation/bottom-tabs": "^7.0.0",
  "react-native-screens": "~4.4.0",
  "react-native-safe-area-context": "4.12.0",
  "@react-native-async-storage/async-storage": "1.23.1",
  "@expo/vector-icons": "^14.0.0",
};

/** Packages that are part of the runtime and may be imported without listing. */
export const IMPLICIT_MODULES = ["react", "react-native"];

export const MAX_FILE_LINES = 300;
export const MAX_FILES = 16;
export const MIN_SCREENS = 3;
export const MAX_SCREENS = 6;

export const SNACK_SDK_VERSION = "52.0.0";

export const BUILD_CONVENTIONS = `
PROJECT CONVENTIONS (must follow exactly):
- Plain JavaScript (.js) with React function components and hooks. No TypeScript.
- Entry: App.js at the root. It wraps everything in <AppProvider> and <NavigationContainer>.
- src/theme.js exports { colors, spacing, radius, typography }.
- src/store/AppContext.js exports AppProvider and useApp(); state is held with useReducer/useState and persisted with @react-native-async-storage/async-storage. No backend, no fetch to external URLs.
- src/navigation/AppNavigator.js builds the navigators with @react-navigation/native-stack and/or @react-navigation/bottom-tabs.
- One file per screen in src/screens/<ScreenName>.js (default export). Screen names come from the plan.
- Reusable UI in src/components/<Name>.js (default export).
- Seed realistic sample data in src/data/seed.js so the app looks alive on first launch.
- Icons only via: import { Ionicons } from '@expo/vector-icons';
- Allowed imports ONLY: ${Object.keys(DEPENDENCY_ALLOW_LIST).join(", ")}, and relative imports to files you generate.
- Every relative import must point to a file that exists in the project (include the path without extension, e.g. '../components/EventCard').
- No file longer than ${MAX_FILE_LINES} lines. At most ${MAX_FILES} files total.
- No secrets, no network calls, no eval, no native modules outside the allow-list.
- Use StyleSheet.create for styles and colors from theme.js.
`.trim();
