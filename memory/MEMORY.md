# Memory

## Code Style

- Always add explicit TypeScript types to all useState calls, e.g. `useState<string>('')` not `useState('')`.
- All destructive actions (delete, remove) must be confirmed with `Alert.alert` before executing. No delete should fire immediately on tap.
