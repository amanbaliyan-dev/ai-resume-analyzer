export function getClientEnv() {
  const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  if (!clerkPublishableKey) {
    throw new Error(
      "Missing VITE_CLERK_PUBLISHABLE_KEY. Copy .env.example to .env.local and configure Clerk."
    );
  }

  return { clerkPublishableKey };
}
