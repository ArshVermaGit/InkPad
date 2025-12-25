# 🖋️ InkPad: The Infinity Edition
**The world's most perfect text-to-handwriting converter.**

InkPad is a premium, high-fidelity web application designed to transform digital text into organic, realistic handwriting. Built with the **Infinity Design System**, it combines glassmorphism aesthetics with a powerful procedural rendering engine.

---

## 🚀 Technology Stack
- **Framework**: React 18 + Vite
- **State**: Zustand (with Persistence)
- **Animations**: Framer Motion
- **Styling**: Vanilla CSS (Modern Flex/Grid) + Glassmorphism
- **Rendering**: HTML5 Canvas (Organic Simulation)
- **Export**: jsPDF + custom Image Processing

---

## 📄 Pages (`src/pages`)
- **`LandingPage.tsx`**: A stunning, animated entry point showcasing the project's design philosophy.
- **`EditorPage.tsx`**: The core application workspace. Features a floating stack preview and an integrated writing surface.
- **`GalleryPage.tsx`**: A discovery hub for paper presets (Yellow Pad, Vintage, Blue Lines, etc.).
- **`StylesPage.tsx`**: Exploration laboratory for handwriting fonts and organic style variations.
- **`AboutPage.tsx`**: Designer profile and technical background for the re-engineering project.

---

## 🏗️ Core Components (`src/components`)
- **`TextEditor.tsx`**: Immersive, auto-paging writing surface with debounced state synchronization.
- **`PreviewPanel.tsx`**: High-fidelity procedural paper engine. Orchestrates real-time visual feedback.
- **`EditorSidebar.tsx`**: Advanced control center for styles, layout, and precision rendering effects.
- **`ExportModal.tsx`**: Configuration layer for high-DPI PDF and multi-page image bundling.
- **`CanvasRenderer.tsx`**: Modular rendering component used for isolated paper snippets and preset previews.
- **`WritingTools.tsx`**: Floating glassmorphism toolbar for rapid ink and pen selection.
- **`PageNavigator.tsx`**: Intelligent controls for multi-page documents and direct sheet navigation.
- **`TemplateLibrary.tsx`**: Personal and community template management system.
- **`BatchOperations.tsx`**: Bulk action engine for clearing, duplicating, or exporting entire documents.

---

## ✨ UI System (`src/components/ui`)
A custom library of micro-animated components:
- **`RippleButton`**: Physics-based touch feedback.
- **`Toast`**: Contextual notifications for state changes.
- **`Tooltip`**: Intelligent layout-aware guidance.
- **`AnimatedSwitch` / `Checkbox`**: Styled toggles for rendering settings.
- **`PageLoader` / `LoadingSpinner`**: Premium feedback during rendering cycles.

---

## ⚙️ Functional Documentation

### 🎨 Rendering Engine (`src/utils/handwriting.ts`)
- **`getFontFamily(id, customFonts)`**: Resolves style IDs to CSS font strings.
- **`drawAgingEffects(ctx, width, height, settings)`**: Procedural sepia, water stains, and burn marks.
- **`drawPaperEdges(ctx, width, height, edgeWear)`**: Simulates paper fraying, yellowing, and 3D lift.
- **`renderHandwriting(...)`**: Master loop for ink bleeding, pressure, and jitter.

### 📦 State Actions (`src/lib/store.ts`)
- **`setText(text)`**: Primary input update.
- **`addPage(idx)` / `duplicatePage(idx)`**: Document structure manipulation.
- **`updateSettings(settings)`**: Precision adjustment of the rendering engine.
- **`toggleHumanize()`**: Activation of the organic text transformation engine.

### 📄 Layout & Flow (`src/utils/pagination.ts`)
- **`calculatePagination(options)`**: Maps lines of text to physical paper sheets in 1:1 real-time.
- **`getPageMargins(idx)`**: Resolves computed margins for complex asymmetric layouts.

### 🤖 Intelligence (`src/utils/humanizer.ts`)
- **`humanizeText(text, intensity)`**: Injects typos, filler words, and natural phrasing.
- **`generateImperfections(text)`**: Procedural placement of cross-outs and ink blots.

---

## 🛠️ Developer Commands
```bash
# Start development server
npm run dev

# Run type-checking
npm run type-check

# Build for production
npm run build
```
