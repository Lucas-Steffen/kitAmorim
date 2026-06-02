import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/data/auth-context';
import { SidebarProvider } from '@/components/sidebar';
import { StoreProvider } from '@/data/store';

export default function AppLayout() {
  const { token } = useAuth();

  if (!token) return <Redirect href="/" />;

  return (
    <StoreProvider>
      <SidebarProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </SidebarProvider>
    </StoreProvider>
  );
}