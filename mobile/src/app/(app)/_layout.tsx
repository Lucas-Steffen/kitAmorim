import { Stack } from 'expo-router';

import { SidebarProvider } from '@/components/sidebar';
import { StoreProvider } from '@/data/store';

export default function AppLayout() {
  return (
    <StoreProvider>
      <SidebarProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </SidebarProvider>
    </StoreProvider>
  );
}