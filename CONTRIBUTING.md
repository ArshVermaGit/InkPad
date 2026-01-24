# Contributing to InkPad ✍️

Thank you for your interest in contributing to InkPad! This project aims to create the most realistic digital handwriting experience.

## Getting Started

1. **Fork and Clone**: Fork the repository and clone it to your local machine.
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Set Up Environment**:
   Create a `.env` file in the root:
   ```env
   VITE_GOOGLE_API_KEY=your_gemini_api_key
   ```
4. **Run Development Server**:
   ```bash
   npm run dev
   ```

## Project Structure

- `src/components`: UI components (Modals, Layouts, etc.)
- `src/lib/store.ts`: Global state management via Zustand.
- `src/pages/EditorPage.tsx`: The main rendering engine and editor logic.
- `src/pages/LandingPage.tsx`: The splash page.
- `src/types/index.ts`: Centralized TypeScript definitions.

## Key Technologies

- **React + Vite**: Fast development and modern architecture.
- **Zustand**: Lightweight global state.
- **Framer Motion**: Smooth animations.
- **Lucide React**: Beautiful icons.
- **Google Gemini API**: Free AI humanization.

## Improving the Rendering Engine

The rendering pipeline in `EditorPage.tsx` goes through:

1. **Tokenization**: Breaking text into paragraphs and lines.
2. **Pagination**: Handling page breaks and widow/orphan protection.
3. **Simulation**: Applying jitter, pressure, and smudge effects using deterministic randomness.

## Roadmap

- [ ] PDF export optimization
- [ ] Custom handwriting font uploads
- [ ] Handwriting style presets
- [ ] Dark mode support

Please feel free to open a Pull Request or a GitHub Issue!
