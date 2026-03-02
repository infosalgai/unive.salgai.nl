# Code Audit Report – Univé Vragenlijst (Next.js/TypeScript)

**Status:** Actieplan uitgevoerd (toast-fix, CSS, theme-provider, styles/globals, duplicate use-toast, sidebar, use-mobile, send + task-from-summary routes + lib/task verwijderd, summarize vereenvoudigd, .env.example toegevoegd). Build geslaagd.

**Scope:** Single-purpose app: `/toegang` → `/intro` → `/vragenlijst` → `/vragenlijst/review` → `/vragenlijst/samenvatting`.  
**Constraint:** AI summary mechanism and API contracts remain unchanged.

---

## 1. Routes / Pages

| Route | File | Verdict | Notes |
|-------|------|---------|--------|
| `/` | `app/page.tsx` | **KEEP** | Gate (toegangscode). |
| `/toegang` | `app/toegang/page.tsx` | **KEEP** | Redirect to `/`; useful for legacy/bookmarks. |
| `/intro` | `app/intro/page.tsx` | **KEEP** | Intro + CTA to vragenlijst. |
| `/vragenlijst` | `app/vragenlijst/page.tsx` | **KEEP** | Wizard (22 steps). |
| `/vragenlijst/review` | `app/vragenlijst/review/page.tsx` | **KEEP** | Review + “Genereer samenvatting”. |
| `/vragenlijst/samenvatting` | `app/vragenlijst/samenvatting/page.tsx` | **KEEP** | AI summary, revise, confirm. |

### API routes

| Route | File | Verdict | Notes |
|-------|------|---------|--------|
| `POST /api/timeout/summarize` | `app/api/timeout/summarize/route.ts` | **KEEP** | Used by samenvatting page. Contract unchanged. |
| `POST /api/timeout/send` | `app/api/timeout/send/route.ts` | **INVESTIGATE** | Stub; not called from app. Keep if future “versturen” will use it; else REMOVE. |
| `POST /api/timeout/task-from-summary` | `app/api/timeout/task-from-summary/route.ts` | **INVESTIGATE** | Not called from app. Summary says “Ja, versturen” does not call it yet. Keep if contract is required; else REMOVE. |

---

## 2. Unused / Likely Removable Code

### 2.1 Components (unused in app flow)

- [ ] **`components/theme-provider.tsx`** – Not imported anywhere. **REMOVE** (or use if you add theme switching).
- [ ] **`components/ui/sidebar.tsx`** – Only used by itself / internal UI; no app page uses it. **REMOVE** if no future sidebar.
- [ ] **`components/ui/use-mobile.tsx`** – Only used by `sidebar.tsx`. If sidebar is removed, **REMOVE** (or keep if you use `useIsMobile` elsewhere later).
- [ ] **`hooks/use-mobile.tsx`** – Only used by `components/ui/sidebar.tsx`. **REMOVE** with sidebar (or keep one `use-mobile` in `hooks` and delete the UI copy if present).

### 2.2 UI components (likely unused – only by other UI, not by app pages)

Used only by other `components/ui/*` or not at all in app:

- [ ] `accordion`, `aspect-ratio`, `avatar`, `breadcrumb`, `button-group`, `calendar`, `carousel`, `chart`, `collapsible`, `command`, `context-menu`, `drawer`, `dropdown-menu`, `empty`, `field`, `form`, `hover-card`, `input-otp`, `input-group`, `kbd`, `menubar`, `navigation-menu`, `pagination`, `popover`, `resizable`, `scroll-area`, `sheet`, `skeleton`, `sonner`, `spinner`, `table`, `tabs`, `toggle`, `toggle-group`, `tooltip`

**Action:** Confirm none are used in app or in a component that is; then remove in batches to avoid breaking imports.

### 2.3 Libs

- [ ] **`lib/task/generateTaskFromSummary.ts`** – Only used by `app/api/timeout/task-from-summary/route.ts`. **REMOVE** if that API route is removed.
- [ ] **`lib/task/taskSchema.ts`** – Used by `generateTaskFromSummary`. **REMOVE** with task-from-summary flow.
- [ ] **`lib/task/taskPrompt.ts`** – Used by `generateTaskFromSummary`. **REMOVE** with task-from-summary flow.

### 2.4 Duplicate / redundant

- [ ] **Toast:** `hooks/use-toast.ts` and `components/ui/use-toast.ts` both implement `useToast` / `toast`. **Toaster** (layout) uses `@/hooks/use-toast`; **vragenlijst/page** uses `@/components/ui/use-toast`. If they use separate state, milestone toasts (25/50/75%) may not show. **INVESTIGATE** and consolidate to a single source (e.g. use `@/hooks/use-toast` everywhere).

### 2.5 Styles

- [ ] **`styles/globals.css`** – Not imported by the app (app uses `app/globals.css`). Contains Vitalr tokens and font import. **REMOVE** or merge any needed tokens into `app/globals.css` and delete.

---

## 3. Suspicious / Incorrect Logic, Types, Edge Cases

### 3.1 Incorrect or risky

- [ ] **Toast state split:** Different toast modules (see 2.4) can mean milestone toasts never appear in the Toaster. **Fix:** Use one `useToast` (e.g. from `hooks/use-toast`) in both Toaster and `app/vragenlijst/page.tsx`.
- [ ] **`app/globals.css` – undefined CSS variables:** In `@theme inline`, `--color-primary-dark`, `--color-accent-dark`, `--color-heading`, `--color-body`, `--color-subtle` reference `var(--primary-dark)` etc., but **`:root` does not define** `--primary-dark`, `--accent-dark`, `--heading`, `--body`, `--subtle`. Those variables are undefined; any class using them (e.g. `bg-primary-dark`) will fail. **Fix:** Define them in `:root` or remove the theme entries that reference them.
- [ ] **`ignoreBuildErrors: true`** in `next.config.mjs` – TypeScript errors do not fail the build. **Risky.** Consider turning off and fixing type errors.

### 3.2 Summarize route – legacy vs Univé

- [ ] **`app/api/timeout/summarize/route.ts`** still contains a large **time-out / “time-out coach”** path: `buildUserPrompt`, `SYSTEM_PROMPT`, `REVISE_SYSTEM_PROMPT`, and label maps (`HOOFDOORZAAK_LABELS`, `SINDS_LABELS`, etc.) for a different questionnaire. The app only sends Univé `formData`; the non-Univé path is dead for this app. **Simplification:** Remove the legacy time-out branch and all related constants/functions if the product is Univé-only, **or** keep and document as “reserved for other flows.” Do not change request/response contract.

### 3.3 Edge cases / validation

- [ ] **`isUniveStepValid` (q8):** When `q8 === "Ja meerdere"` or `"Ja beperkt"`, q9 is required (min 1 choice). When user switches from “Ja” to “Nee”, q9 is not cleared – allowed, but consider clearing q9 when q8 becomes “Nee” for cleaner data.
- [ ] **Access guard:** Relies on `localStorage`; no server check. Clearing storage bypasses the gate. Acceptable for a simple code gate; document as intentional.
- [ ] **Samenvatting page:** If `localStorage` has no `univeFormV2`, it falls back to `UNIVE_INITIAL_FORM_DATA` and still calls summarize – API will get empty/default answers. Consider redirecting to `/vragenlijst` when there is no stored form.

### 3.4 Types

- [ ] **`err: any`** in `app/api/timeout/summarize/route.ts` (catch block). Prefer `unknown` and narrow, or a typed error.
- [ ] **OpenAI `responses.create` / `output_text`:** Relies on non-generic response shape; ensure compatibility with the OpenAI SDK version you use (and model “gpt-5.2”).

---

## 4. Dead Env Vars and Config

### 4.1 Env vars in use

- **`OPENAI_API_KEY`** – Used by `app/api/timeout/summarize/route.ts` and `lib/task/generateTaskFromSummary.ts`. Required for summarize.
- **`NEXT_PUBLIC_APP_URL`** – Used in `app/layout.tsx` for `metadataBase`. Optional; falls back to `https://unive.salgai.nl`.

### 4.2 No `.env` / `.env.example` in repo

- No `.env*` files found in the project (likely gitignored). **Action:** Add a `.env.example` with `OPENAI_API_KEY=` and optionally `NEXT_PUBLIC_APP_URL=` so deployments know what to set.

### 4.3 Config

- **`next.config.mjs`:** `typescript.ignoreBuildErrors: true` – weakens type safety (see 3.1).
- **`images.unoptimized: true`** – Acceptable for this app; document if intentional for deployment.

---

## 5. Action Plan (Safe Deletion Order and Checks)

### Phase 1 – Fix correctness (no deletions)

1. [ ] **Toast:** In `app/vragenlijst/page.tsx`, change import from `@/components/ui/use-toast` to `@/hooks/use-toast`. Run app, complete a few steps, confirm 25/50/75% toasts appear.
2. [ ] **CSS variables:** In `app/globals.css`, either define `--primary-dark`, `--accent-dark`, `--heading`, `--body`, `--subtle` in `:root`, or remove the corresponding `@theme inline` entries (and any classes that use them).
3. [ ] **Summarize route:** Replace `err: any` with `unknown` and safe logging; optionally remove or isolate legacy time-out code (without changing API contract).

**Check after Phase 1:** `npm run build`, manual test gate → intro → vragenlijst → review → samenvatting, and summary generation + revise.

---

### Phase 2 – Remove obviously unused app surface

4. [ ] **`app/toegang/page.tsx`:** Keep as-is (redirect); no removal.
5. [ ] **`components/theme-provider.tsx`:** Delete. Search for `ThemeProvider` / `theme-provider`; confirm no imports. **Check:** `npm run build`.
6. [ ] **`styles/globals.css`:** If nothing imports it, delete. If any script or doc references it, update and then delete. **Check:** `npm run build`.

**Check after Phase 2:** Build and smoke test.

---

### Phase 3 – Unused UI and hooks (optional, batch carefully)

7. [ ] **Sidebar and use-mobile:** Remove `components/ui/sidebar.tsx`. Fix or remove any imports (e.g. from `components/ui/use-mobile.tsx`). Then remove `components/ui/use-mobile.tsx` and/or `hooks/use-mobile.tsx` if unused. **Check:** `npm run build`.
8. [ ] **Duplicate use-toast:** After fixing toast usage (Phase 1), remove the duplicate (e.g. keep `hooks/use-toast.ts`, delete `components/ui/use-toast.ts` and update any remaining imports). **Check:** Build + toast flow.

9. [ ] **Bulk UI components:** For each of the components listed in 2.2, confirm “no import from app or from a component that is used in app,” then delete in small batches (e.g. 5–10 at a time). After each batch: **Check:** `npm run build` and quick click-through.

---

### Phase 4 – Unused API and task lib (only if you drop those features)

10. [ ] **Decision:** Will “Ja, versturen” ever call `POST /api/timeout/send` or `POST /api/timeout/task-from-summary`?  
    - If **no:** Remove `app/api/timeout/send/route.ts`, `app/api/timeout/task-from-summary/route.ts`, and `lib/task/*` (generateTaskFromSummary, taskSchema, taskPrompt).  
    - If **yes:** Keep them; document that they are not yet used from the UI.

**Check after Phase 4:** Build, test summarize and confirm flow still works. Ensure no remaining imports point to deleted routes or libs.

---

### Phase 5 – Harden config (optional)

11. [ ] Add `.env.example` with `OPENAI_API_KEY=` and optional `NEXT_PUBLIC_APP_URL=`.
12. [ ] Consider setting `typescript.ignoreBuildErrors: false` and fixing type errors, then re-enabling strict build.

---

## Summary checklists

### Routes

- [x] `/` – KEEP  
- [x] `/toegang` – KEEP  
- [x] `/intro` – KEEP  
- [x] `/vragenlijst` – KEEP  
- [x] `/vragenlijst/review` – KEEP  
- [x] `/vragenlijst/samenvatting` – KEEP  
- [x] `POST /api/timeout/summarize` – KEEP  
- [ ] `POST /api/timeout/send` – INVESTIGATE (remove if never used)  
- [ ] `POST /api/timeout/task-from-summary` – INVESTIGATE (remove if never used)  

### Quick wins

- [ ] Use single toast module and fix import in vragenlijst page.  
- [ ] Fix or remove undefined CSS variables in `app/globals.css`.  
- [ ] Remove `theme-provider.tsx` and `styles/globals.css` if unused.  
- [ ] Add `.env.example`.  

### Do not change

- Request/response of `POST /api/timeout/summarize`.  
- Univé form data shape and `buildUniveSummaryInput` contract.  
- Confirmed summary flow (what is stored/shown after “Ja, versturen”) until you decide to integrate task-from-summary/send.
