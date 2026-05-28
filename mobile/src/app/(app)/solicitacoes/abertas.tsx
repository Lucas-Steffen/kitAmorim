import { Text, View } from 'react-native';

import { Badge, Card, EmptyState, KeyValue, SectionTitle, StatCard } from '@/components/kit';
import { Screen } from '@/components/sidebar';
import { lancamentoLabels, useStore, type LancamentoTipo } from '@/data/store';
import { colors } from '@/theme';
import { formatCurrency } from '@/utils';

const tipoIcon: Record<LancamentoTipo, 'water' | 'flash' | 'alert-circle' | 'wifi'> = {
  agua: 'water',
  energia: 'flash',
  taxa: 'alert-circle',
  internet: 'wifi',
};

const tipoTone: Record<LancamentoTipo, 'accent' | 'warning' | 'danger' | 'success'> = {
  agua: 'accent',
  energia: 'warning',
  taxa: 'danger',
  internet: 'success',
};

export default function VisaoGeralScreen() {
  const { period, lancamentos, locatarios, getLocatario } = useStore();
  const itens = lancamentos.filter((l) => l.periodKey === period.key);
  const total = itens.reduce((s, l) => s + l.valor, 0);

  const tipos: LancamentoTipo[] = ['agua', 'energia', 'taxa', 'internet'];
  const porTipo = tipos.map((t) => ({
    tipo: t,
    total: itens.filter((l) => l.tipo === t).reduce((s, l) => s + l.valor, 0),
  }));

  const porLocatario = locatarios
    .map((l) => ({
      locatario: l,
      total: itens.filter((x) => x.locatarioId === l.id).reduce((s, x) => s + x.valor, 0),
    }))
    .filter((x) => x.total > 0)
    .sort((a, b) => b.total - a.total);

  return (
    <Screen title="Visão Geral">
      <Card>
        <SectionTitle hint={period.label}>Lançamentos do período</SectionTitle>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
          <Text style={{ color: colors.text, fontSize: 30, fontWeight: '800' }}>{formatCurrency(total)}</Text>
        </View>
        <Badge label={`${itens.length} lançamento(s)`} />
      </Card>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {porTipo.map((p) => (
          <StatCard
            key={p.tipo}
            icon={tipoIcon[p.tipo]}
            tone={tipoTone[p.tipo]}
            label={lancamentoLabels[p.tipo]}
            value={formatCurrency(p.total)}
          />
        ))}
      </View>

      <Card>
        <SectionTitle>Por locatário</SectionTitle>
        {porLocatario.length === 0 ? (
          <EmptyState icon="stats-chart-outline" text="Nenhum lançamento neste período." />
        ) : (
          porLocatario.map((p) => (
            <KeyValue key={p.locatario.id} label={p.locatario.nome} value={formatCurrency(p.total)} />
          ))
        )}
      </Card>
    </Screen>
  );
}