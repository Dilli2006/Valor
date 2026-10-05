import { DEPENDENCY_ALLOW_LIST, IMPLICIT_MODULES, MAX_FILE_LINES, MAX_FILES } from "@/lib/constants";
import type { GeneratedFile, Plan, ValidationIssue, ValidationReport } from "@/lib/schemas";

const IMPORT_RE = /(?:import\s+(?:[\s\S]*?\s+from\s+)?|require\(\s*|export\s+[\s\S]*?\s+from\s+)['"]([^'"]+)['"]/g;

export function extractImports(content: string): string[] {
  const out: string[] = [];
  let m: RegExpExecArray | null;
  IMPORT_RE.lastIndex = 0;
  while ((m = IMPORT_RE.exec(content))) out.push(m[1]);
  return out;
}

function normalize(path: string) {
  const parts: string[] = [];
  for (const seg of path.split("/")) {
    if (!seg || seg === ".") continue;
    if (seg === "..") parts.pop();
    else parts.push(seg);
  }
  return parts.join("/");
}

function dirname(path: string) {
  const i = path.lastIndexOf("/");
  return i === -1 ? "" : path.slice(0, i);
}

export function resolveRelative(fromPath: string, spec: string, existing: Set<string>): string | null {
  const base = normalize(`${dirname(fromPath)}/${spec}`);
  const candidates = [base, `${base}.js`, `${base}.jsx`, `${base}.ts`, `${base}.tsx`, `${base}.json`, `${base}/index.js`];
  return candidates.find((c) => existing.has(c)) ?? null;
}

function packageName(spec: string) {
  if (spec.startsWith("@")) return spec.split("/").slice(0, 2).join("/");
  return spec.split("/")[0];
}

/** Post-generation validator: allow-list, file size, import resolution, feature coverage (PRD §8.3, §11 quality gate). */
export function validateProject(files: GeneratedFile[], plan?: Plan, disabledFeatureIds: string[] = []): ValidationReport {
  const issues: ValidationIssue[] = [];
  const paths = new Set(files.map((f) => normalize(f.path)));

  if (files.length > MAX_FILES) issues.push({ level: "warning", path: "*", message: `${files.length} files exceeds the ${MAX_FILES}-file budget` });
  if (!paths.has("App.js")) issues.push({ level: "error", path: "App.js", message: "Missing entry file App.js" });

  for (const f of files) {
    const lines = f.content.split("\n").length;
    if (lines > MAX_FILE_LINES) issues.push({ level: "error", path: f.path, message: `${lines} lines exceeds ${MAX_FILE_LINES}-line limit` });
    if (!/\.(js|jsx|ts|tsx)$/.test(f.path)) continue;
    for (const spec of extractImports(f.content)) {
      if (spec.startsWith(".")) {
        if (!resolveRelative(normalize(f.path), spec, paths)) issues.push({ level: "error", path: f.path, message: `Unresolved import '${spec}'` });
      } else {
        const pkg = packageName(spec);
        if (!(pkg in DEPENDENCY_ALLOW_LIST) && !IMPLICIT_MODULES.includes(pkg)) {
          issues.push({ level: "error", path: f.path, message: `Package '${pkg}' is not on the dependency allow-list` });
        }
      }
    }
    if (/\bfetch\s*\(\s*['"`]https?:/.test(f.content)) issues.push({ level: "warning", path: f.path, message: "External network call detected" });
    if (/\beval\s*\(/.test(f.content)) issues.push({ level: "error", path: f.path, message: "eval() is not allowed" });
  }

  // Feature coverage: each enabled feature's screens should exist as files, or its name should appear in the code.
  const allCode = files.map((f) => f.content).join("\n").toLowerCase();
  const featureCoverage = (plan?.features ?? [])
    .filter((ft) => !disabledFeatureIds.includes(ft.id))
    .map((ft) => {
      const screens = plan!.screens.filter((s) => ft.screenIds.includes(s.id));
      const screenFileHit = screens.some((s) => [...paths].some((p) => p.toLowerCase().includes(s.name.toLowerCase())));
      const keywords = ft.name.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 3);
      const keywordHit = keywords.some((k) => allCode.includes(k));
      return { featureId: ft.id, name: ft.name, covered: screenFileHit || keywordHit };
    });
  for (const c of featureCoverage) if (!c.covered) issues.push({ level: "warning", path: "plan", message: `Feature '${c.name}' not clearly referenced in code` });

  return { ok: !issues.some((i) => i.level === "error"), issues, checkedAt: Date.now(), featureCoverage };
}

/** Plan traceability: no orphan screens or features (PRD §8.2 acceptance). */
export function traceability(plan: Plan, disabled: string[] = []) {
  const features = plan.features.filter((f) => !disabled.includes(f.id));
  const screenIds = new Set(plan.screens.map((s) => s.id));
  const orphanFeatures = features.filter((f) => !f.screenIds.some((id) => screenIds.has(id)));
  const orphanScreens = plan.screens.filter(
    (s) => !features.some((f) => f.screenIds.includes(s.id)) && !s.featureIds.some((id) => features.some((f) => f.id === id)),
  );
  return { ok: orphanFeatures.length === 0 && orphanScreens.length === 0, orphanFeatures, orphanScreens };
}

/** Auto-fix: generate a package.json from the allow-list so dependency versions are always correct. */
export function buildPackageJson(appName: string, files: GeneratedFile[]): GeneratedFile {
  const used = new Set<string>(["expo", "expo-status-bar", "react", "react-native"]);
  for (const f of files) for (const spec of extractImports(f.content)) if (!spec.startsWith(".")) used.add(packageName(spec));
  if (used.has("@react-navigation/native-stack") || used.has("@react-navigation/bottom-tabs")) {
    used.add("@react-navigation/native");
    used.add("react-native-screens");
    used.add("react-native-safe-area-context");
  }
  const dependencies: Record<string, string> = {};
  for (const name of Object.keys(DEPENDENCY_ALLOW_LIST)) if (used.has(name)) dependencies[name] = DEPENDENCY_ALLOW_LIST[name];
  const slug = appName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "lunor-app";
  const pkg = { name: slug, version: "1.0.0", main: "node_modules/expo/AppEntry.js", scripts: { start: "expo start", android: "expo start --android", ios: "expo start --ios", web: "expo start --web" }, dependencies, private: true };
  return { path: "package.json", language: "json", content: JSON.stringify(pkg, null, 2), purpose: "Package manifest generated from the dependency allow-list.", stepId: "step-1" };
}
