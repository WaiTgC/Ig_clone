import { Redirect, Stack } from "expo-router";
import { useAuth } from "~/src/app/Providers/AuthProvider";

export default function AuthLayout() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Stack />;
}
