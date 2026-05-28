import { useRouter } from 'expo-router';

import { Badge, Card, ListRow, SectionTitle, StatCard } from '@/components/kit';
import { Screen } from '@/components/sidebar';
import { useStore } from '@/data/store';
import { formatCurrency } from '@/utils';
import { View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { period, kitnets, locatarios, lancamentos, solicitacoes } = useStore();

  const doPeriodo = lancamentos.filter((l) => l.periodKey === period.key);
  const totalLancamentos = doPeriodo.reduce((sum, l) => sum + l.valor, 0);
  const totalAlugueis = locatarios.reduce((sum, l) => sum + l.valorLocacao, 0);
  const abertas = solicitacoes.filter((s) => s.status !== 'concluida');

  return (
    <Screen title="Home">
      <Card>
        <SectionTitle hint={period.label}>Período atual</SectionTitle>
        <Badge label={`Faturamento previsto: ${formatCurrency(totalAlugueis + totalLancamentos)}`} tone="success" />
      </Card>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        <StatCard icon="business" label="Kitnets" value={String(kitnets.length)} />
        <StatCard icon="people" label="Locatários" value={String(locatarios.length)} />
        <StatCard
          icon="cash"
          label="Lançamentos do mês"
          value={formatCurrency(totalLancamentos)}
          tone="warning"
        />
        <StatCard
          icon="construct"
          label="Solicitações abertas"
          value={String(abertas.length)}
          tone="danger"
        />
      </View>

      <Card>
        <SectionTitle>Atalhos</SectionTitle>
        <ListRow
          icon="business-outline"
          title="Cadastrar kitnet"
          subtitle="Adicione uma nova unidade"
          right={<Badge label="Ir" />}
          onPress={() => router.push('/kitnets' as never)}
        />
        <ListRow
          icon="people-outline"
          title="Cadastrar locatário"
          subtitle="Vincule um inquilino a uma kitnet"
          right={<Badge label="Ir" />}
          onPress={() => router.push('/locatarios' as never)}
        />
        <ListRow
          icon="stats-chart-outline"
          title="Visão geral dos lançamentos"
          subtitle="Dashboard do período"
          right={<Badge label="Ir" />}
          onPress={() => router.push('/lancamentos/visao-geral' as never)}
        />
        <ListRow
          icon="cash-outline"
          title="Fechar período"
          subtitle="Resumo e faturamento por locatário"
          right={<Badge label="Ir" />}
          onPress={() => router.push('/faturamento/fechamento' as never)}
        />
      </Card>
    </Screen>
  );
}