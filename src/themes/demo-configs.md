# Previewing Each Variant

To preview a variant locally, open `src/config/gym.config.json` and change the
`templateVariant` field (and optionally `primaryColor`) to one of the following:

---

## V1 — Dark Power (current default)
```json
"templateVariant": "V1",
"primaryColor": "#FF4E1A"
```
Orange on black. Bold, aggressive. The default.

---

## V2 — Clean Pro
```json
"templateVariant": "V2",
"primaryColor": "#10B981"
```
Emerald green on charcoal. Professional, modern, rounded.

---

## V3 — Energy Rush
```json
"templateVariant": "V3",
"primaryColor": "#FACC15"
```
Electric yellow on pure black. Zero radius, maximum energy.
Note: Primary color text will be black (high contrast on yellow).

---

## V4 — Urban Grit
```json
"templateVariant": "V4",
"primaryColor": "#D97706"
```
Amber on warm dark brown. Industrial, raw, street-level.
Includes a subtle grain texture overlay.

---

## V5 — Midnight Blue
```json
"templateVariant": "V5",
"primaryColor": "#06B6D4"
```
Cyan on deep navy-black. Modern, tech-forward, glowing.

---

## Custom brand color

Any variant respects the gym's `primaryColor` from their config.
For example, a boxing gym using V4 (Urban Grit) with their own red:
```json
"templateVariant": "V4",
"primaryColor": "#DC2626"
```

The auto-deploy pipeline injects both values from the intake form submission.
