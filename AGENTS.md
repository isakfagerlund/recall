# Recall - Expo React Native App

## Commands
- **Typecheck**: `npx tsc --noEmit`
- **Start dev server**: `bun start` or `expo start`
- **Run iOS**: `bun run ios`
- **Run Android**: `bun run android`
- No test runner configured yet (only snapshot tests exist)

## Architecture
- **Framework**: Expo SDK 54 + React Native 0.81 with React 19
- **Router**: expo-router (file-based routing in `app/` directory)
- **AI**: Uses AI SDK (`ai` package) with Apple's on-device model (`@react-native-ai/apple`) for structured text generation
- **Validation**: Zod v4 for schema validation and type inference
- **Permissions**: Contacts (expo-contacts), Audio recording (expo-audio), Calendar access (planned)

## Code Style
- **TypeScript**: Strict mode enabled (`tsconfig.json`)
- **Imports**: Use `@/` alias for absolute imports (e.g., `@/components`, `@/types`)
- **Types**: Extract reusable types/schemas to `types/` directory (e.g., `types/person.ts`)
- **Formatting**: Follow existing conventions (no explicit formatter configured)
- **Components**: React functional components with TypeScript, explicit types for props and state
- **Error Handling**: Use proper error type checking with `instanceof Error` in catch blocks
