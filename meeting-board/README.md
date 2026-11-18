# TGC Live Meeting Board (Apps Script)

Source for the live meeting board web app (script `1ZoOfqPL…`).
`backup-2026-11-18/` is the code that was live before this rebuild (never pushed; excluded by `.claspignore`).

## Push + deploy (same URL)
```
cd meeting-board
clasp push
clasp deploy -i AKfycbyHcHf4ZN0QO_zWCXjsxCpeJ3Z8yGT6bfKVzOIdFFsuDZLfrwbloYyn1HFuMSGMyV_e -d "Meeting board v3"
```
`-i` updates the existing deployment, so the live URL stays the same.

## One-time, in the script editor (Run button)
1. `setupNewBoard`  — builds tabs, rebuilds the form, fixes Meeting Notes formulas, installs the form trigger.
2. `testWithTestUser` — submits one TEST USER answer and checks where it landed (see the log).
3. `deleteTestData` — removes every trace of TEST USER.
