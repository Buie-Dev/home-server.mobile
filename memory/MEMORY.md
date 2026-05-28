# Memory

## Code Style

- Always add explicit TypeScript types to all useState calls, e.g. `useState<string>('')` not `useState('')`.
- All destructive actions (delete, remove) must be confirmed with `Alert.alert` before executing. No delete should fire immediately on tap.
- All filtering (by category, subcategory, date, etc.) must be done on the backend via query params. Never filter arrays on the frontend.
