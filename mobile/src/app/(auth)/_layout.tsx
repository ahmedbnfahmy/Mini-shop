import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="login" options={{ title: 'Login', headerShown: false }} />
      {/* Registration and forgot password screens would go here */}
    </Stack>
  );
}
