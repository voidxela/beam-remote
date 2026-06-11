# PROJECT DESIGN DOCUMENT (v4.0)

## Beam: Universal TV Remote

**Project Context:** Development is currently executing Phase 6 (Premium Features), prioritizing Roku to accelerate the MVP release. 

---

### 1. Architectural Paradigms & Constraints

All AI agents and developers must strictly adhere to `AGENTS.md`. Key pillars include:
* **The Registry Pattern:** UI components must be completely device-agnostic. All hardware commands route through `AdapterRegistry.ts`.
* **Capability Matrix:** The UI dynamically reads a device's `supportedKeys` array to enable/disable buttons. 
* **Optimistic Networking:** Keystrokes are fire-and-forget. Blocking the UI thread to await network results is strictly prohibited. Failures trigger silent, non-blocking toasts via `DeviceEventEmitter`.
* **Zero-Frame Hydration:** Persistent state is managed via Zustand + `react-native-mmkv` v4.
* **Layout Immutability:** UI elements must not cause layout shifts. Paywalls or disabled states rely on opacity and pointer event interception.

---

### 2. Current Status & Milestones Achieved

* **Phase 3 (Core Refactoring) & Phase 4 (Monetization):** Complete. MMKV fast-boot, AdMob anchoring, and the Dummy Space Emitter keyboard are in production.
* **Phase 4.5 (Universal Protocol & Stability):** Complete. 
  * Replaced regex parsing with `fast-xml-parser`.
  * Implemented an async heartbeat (`pingDevice`) to track real-time connection state.
  * Added hardware volume and power controls mapped to device capabilities.

---

### 3. Current Focus: Phase 6 (Premium Power-User Features)

* **Objective:** Drive subscription conversions by building out the gated `<PremiumFeature>` blocks.
* **Active Task:** **App Launcher.** Fetch installed applications from the active TV and render a horizontal, scrolling quick-launch bar above the D-Pad.
* **Upcoming Tasks:** * **Macros:** Sequential programmable actions (e.g., "Power On -> Wait 2s -> Launch Netflix").
  * **Payments:** Connect `useMonetizationStore` to RevenueCat for real transactions.

---

### 4. Roadmap (Deferred)

* **Phase 5: Ecosystem Expansion.** Expand `AdapterRegistry` to support LG (webOS) and Android TV.
* **Phase 7: OS-Level Hooks.** iOS Live Activities, Android Media Controls, and Smartwatch companion apps.
