import React, { useState, useEffect } from "react";
import {
  Alert,
  StyleSheet,
  View,
  TextInput,
  AppState,
  Text,
} from "react-native";
import Button from "~/src/components/Button";
import { supabase } from "~/src/lib/supabase";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    });

    return () => subscription.remove();
  }, []);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    if (!session)
      Alert.alert("Please check your inbox for email verification!");
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Instagram</Text>
        <View style={styles.inputContainer}>
          <TextInput
            onChangeText={(text) => setEmail(text)}
            value={email}
            placeholder="Username"
            autoCapitalize="none"
            style={styles.input}
          />
          <TextInput
            onChangeText={(text) => setPassword(text)}
            value={password}
            secureTextEntry={true}
            placeholder="Password"
            autoCapitalize="none"
            style={styles.input}
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button
            title="Login"
            disabled={loading}
            onPress={() => signInWithEmail()}
            style={styles.loginButton}
          />
        </View>
        <View
          style={styles.signupTextContainer}
          className="flex-col items-center fixed bottom-0 left-0 right-0 p-4 w-[80%] mx-auto"
        >
          <Text style={styles.signupText}>Don’t have an account? </Text>
          <Button
            title="Sign Up"
            disabled={loading}
            onPress={() => signUpWithEmail()}
            style={styles.signupButton}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#833ab4", // Fallback solid color
  },
  content: {
    width: "80%",
    alignItems: "center",
  },
  title: {
    fontFamily: "cursive", // Use 'Pacifico' or similar (install via expo-font if needed)
    fontSize: 40,
    color: "#fff",
    marginBottom: 40,
    textAlign: "center",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    color: "#000",
  },
  buttonContainer: {
    width: "100%",
    marginBottom: 10,
  },
  loginButton: {
    backgroundColor: "#fff",
    borderRadius: 5,
  },
  signupTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  signupText: {
    color: "#fff",
    fontSize: 21,
    marginBottom: 10,
    textAlign: "center",
    width: "100%",
  },
  signupButton: {
    backgroundColor: "transparent",
    padding: 0,
  },
});
