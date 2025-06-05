import { Slot, Stack, Tabs } from "expo-router";
import "../../global.css";
import AuthProvider from "./Providers/AuthProvider";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}
