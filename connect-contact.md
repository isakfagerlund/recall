## Plan for connecting a contact
Linking by phone number is a good, simpler approach. You’d store the number as the primary key and resolve a contact match when you have Contacts permission.

How it can work:
- Store on the person: `phoneE164`, `rawInput`, `resolvedContactId?`, `resolvedNameSnapshot?`, `resolvedAt?`.
- Normalize to E.164 so comparisons are stable; reject/flag numbers you can’t normalize.
- When permission is available, search contacts for that normalized number. In Expo you can filter via `Contacts.getContactsAsync({ phoneNumber })` (or fetch and match locally by normalized numbers). If exactly one match, set `resolvedContactId` and snapshot name/label; if multiple, ask the user to pick which contact/number.
- UI: show the saved number. If resolved, show “Linked to John Appleseed (mobile)” with “View in Contacts” action; if not resolved, show “No matching contact” with a “Pick contact” button.
- Sync/backups: treat `resolvedContactId` as device-local; snapshot keeps the UI meaningful if the contact changes or permissions are removed. On a new device, you’d re-resolve based on the number.
- Edge cases: same number on multiple contacts; contact deleted; permission denied; number changed. Allow manual override and unlink.

Pros:
- Minimal data to store; works across devices (number travels).
- No need to persist contact ids server-side; you can always re-resolve.

Cons/mitigations:
- Shared numbers create ambiguity—resolve with user choice.
- Number formats vary—normalization is key.
- If the number isn’t in contacts, you don’t auto-link; keep showing the number and offer “Create contact” or “Choose contact”.

If you want, I can sketch the exact TypeScript shape and a small resolver utility for Expo contacts using normalized numbers.