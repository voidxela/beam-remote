# AGENTS.md

> **Note:** Expo has changed. Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.

## Project Context
Beam is a high-performance, cross-platform universal TV remote. Development is currently focused on Phase 6 (Premium Features), targeting the Roku ecosystem first to accelerate the MVP release. Refer to @DESIGN.md for project context and roadmap.

## Architectural Directives
* **The Registry Pattern:** UI components must remain entirely device-agnostic. All hardware communication routes exclusively through `/src/network/adapters/AdapterRegistry.ts`. Never import specific adapters (e.g., `RokuAdapter`) directly into screen components.
* **Optimistic UI:** Standard keystrokes are "fire-and-forget". Do not block the JS thread awaiting network responses. Failures trigger non-blocking UI notifications via `DeviceEventEmitter.emit("SHOW_TOAST")`.
* **Capability Checking:** Before dispatching a command, verify the hardware supports it by checking the device's `supportedKeys` array. Gracefully disable unsupported UI elements using opacity; do not remove them from the layout.

## State & Persistence Rules
* **Global State:** Managed via Zustand.
* **Storage:** We use `react-native-mmkv` v4.
  * Instantiation must be done via `createMMKV()`.
  * Item deletion must strictly use the `.remove()` method.
  * When applying TypeScript interfaces, ensure `MMKV` is imported and strictly utilized as a type, not a value, to avoid linter errors.

## Immutability & Hardware Quirks
* **Layout Anchoring:** Muscle memory for the D-Pad is critical. The bottom `AdBanner` container acts as an immutable 90px floor. For premium users, **do not unmount** the container; apply a transparent background and remove borders to maintain mathematical spacing.
* **The Dummy Space Emitter:** The native keyboard integration relies on a stateless event emitter initialized with a single dummy space (`" "`). Autocorrect and predictive text must remain disabled (`keyboardType="visible-password"`). Do not attempt to refactor this into bi-directional state synchronization.

# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.
