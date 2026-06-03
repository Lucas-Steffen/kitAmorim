import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { createContext, useContext, useState, type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/data/auth-context';
import { colors, radius, spacing } from '@/theme';

type IoniconName = keyof typeof Ionicons.glyphMap;

type MenuItem = { label: string; icon: IoniconName; href: string };
type MenuSection = { title?: string; items: MenuItem[] };

export const MENU: MenuSection[] = [
  {
    items: [
      { label: 'Home', icon: 'home-outline', href: '/home' },
      { label: 'Cadastro de Kitnet', icon: 'business-outline', href: '/kitnets' },
      { label: 'Cadastro de Locatários', icon: 'people-outline', href: '/locatarios' },
    ],
  },
  {
    title: 'Lançamentos',
    items: [
      { label: 'Visão Geral', icon: 'stats-chart-outline', href: '/lancamentos/visao-geral' },
      { label: 'Água', icon: 'water-outline', href: '/lancamentos/agua' },
      { label: 'Energia', icon: 'flash-outline', href: '/lancamentos/energia' },
      { label: 'Taxas/Multas', icon: 'alert-circle-outline', href: '/lancamentos/taxas' },
      { label: 'Internet', icon: 'wifi-outline', href: '/lancamentos/internet' },
    ],
  },
  {
    title: 'Contratos',
    items: [
      { label: 'Modelos de contratos', icon: 'document-text-outline', href: '/contratos/modelos' },
      { label: 'Geração de contratos', icon: 'create-outline', href: '/contratos/geracao' },
    ],
  },
  {
    title: 'Faturamento',
    items: [{ label: 'Fechamento do período', icon: 'cash-outline', href: '/faturamento/fechamento' }],
  },
  {
    title: 'Solicitações',
    items: [
      { label: 'Dashboard', icon: 'grid-outline', href: '/solicitacoes/dashboard' },
      { label: 'Tipos de solicitações', icon: 'list-outline', href: '/solicitacoes/tipos' },
      { label: 'Solicitações em aberto', icon: 'construct-outline', href: '/solicitacoes/abertas' },
    ],
  },
];

// ---------- Context ----------

type SidebarCtx = { open: () => void; close: () => void; isOpen: boolean };
const Ctx = createContext<SidebarCtx | null>(null);

export function useSidebar(): SidebarCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useSidebar deve ser usado dentro de <SidebarProvider>');
  return ctx;
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  return (
    <Ctx.Provider value={{ isOpen, open: () => setOpen(true), close: () => setOpen(false) }}>
      {children}
      <Sidebar />
    </Ctx.Provider>
  );
}

// ---------- Sidebar ----------

function Sidebar() {
  const { isOpen, close } = useSidebar();
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  function go(href: string) {
    close();
    router.push(href as never);
  }

  function handleLogout() {
    close();
    logout();
    router.replace('/');
  }

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={close} statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.panel}>
          <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom', 'left']}>
            <View style={styles.brand}>
              <View style={styles.brandIcon}>
                <Ionicons name="business" size={22} color={colors.accent} />
              </View>
              <View>
                <Text style={styles.brandTitle}>KitAmorim</Text>
                <Text style={styles.brandSub}>Gestão de kitnets</Text>
              </View>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }} style={{ flex: 1 }}>
              {MENU.map((section, i) => (
                <View key={section.title ?? `s${i}`} style={styles.section}>
                  {section.title ? <Text style={styles.sectionLabel}>{section.title}</Text> : null}
                  {section.items.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <TouchableOpacity
                        key={item.href}
                        activeOpacity={0.7}
                        style={[styles.item, active && styles.itemActive]}
                        onPress={() => go(item.href)}>
                        <Ionicons
                          name={item.icon}
                          size={20}
                          color={active ? colors.accent : colors.textSecondary}
                        />
                        <Text style={[styles.itemText, active && styles.itemTextActive]}>{item.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </ScrollView>

            <View style={styles.logoutWrap}>
              <TouchableOpacity activeOpacity={0.7} style={styles.logoutBtn} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={20} color={colors.danger} />
                <Text style={styles.logoutText}>Sair</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
        <Pressable style={styles.scrim} onPress={close} />
      </View>
    </Modal>
  );
}

// ---------- Header ----------

export function AppHeader({ title }: { title: string }) {
  const { open } = useSidebar();
  return (
    <View style={styles.header}>
      <TouchableOpacity hitSlop={10} onPress={open} style={styles.menuBtn}>
        <Ionicons name="menu" size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.headerTitle} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}

// ---------- Screen wrapper ----------

export function Screen({
  title,
  children,
  scroll = true,
  footer,
}: {
  title: string;
  children: ReactNode;
  scroll?: boolean;
  footer?: ReactNode;
}) {
  return (
    <View style={styles.screen}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <AppHeader title={title} />
        {scroll ? (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.content, { flex: 1 }]}>{children}</View>
        )}
        {footer}
      </SafeAreaView>
    </View>
  );
}

const PANEL_WIDTH = 290;

const styles = StyleSheet.create({
  overlay: { flex: 1, flexDirection: 'row', backgroundColor: colors.overlay },
  panel: { width: PANEL_WIDTH, backgroundColor: colors.backgroundAlt, borderRightWidth: 1, borderRightColor: colors.border },
  scrim: { flex: 1 },

  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  brandIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  brandSub: { color: colors.textSecondary, fontSize: 12 },

  section: { paddingTop: spacing.md },
  sectionLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  itemActive: { backgroundColor: colors.accentSoft },
  itemText: { color: colors.textSecondary, fontSize: 15, fontWeight: '500' },
  itemTextActive: { color: colors.text, fontWeight: '700' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuBtn: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card },
  headerTitle: { color: colors.text, fontSize: 20, fontWeight: '700', flex: 1 },

  logoutWrap: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.md,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoft,
  },
  logoutText: { color: colors.danger, fontSize: 15, fontWeight: '600' },

  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl * 2 },
});