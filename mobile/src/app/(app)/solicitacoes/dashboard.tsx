import { View } from 'react-native';

import { Card, EmptyState, KeyValue, SectionTitle, StatCard } from '@/components/kit';
import { Screen } from '@/components/sidebar';
import { useStore } from '@/data/store';

export default function SolicitacoesDashboard() {
  const { solicitacoes, tipos, getTipo } = useStore();

  const abertas = solicitacoes.filter((s) => s.status === 'aberta').length;
  const andamento = solicitacoes.filter((s) => s.status === 'em_andamento').length;
  const concluidas = solicitacoes.filter((s) => s.status === 'concluida').length;

  const porTipo = tipos
    .map((t) => ({ tipo: t, total: solicitacoes.filter((s) => s.tipoId === t.id).length }))
    .filter((x) => x.total > 0)
    .sort((a, b) => b.total - a.total);

  return (
    <Screen title="Solicitações · Dashboard">
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        <StatCard icon="albums-outline" label="Total" value={String(solicitacoes.length)} />
        <StatCard icon="alert-circle" label="Abertas" value={String(abertas)} tone="danger" />
        <StatCard icon="time-outline" label="Em andamento" value={String(andamento)} tone="warning" />
        <StatCard icon="checkmark-circle" label="Concluídas" value={String(concluidas)} tone="success" />
      </View>

      <Card>
        <SectionTitle>Por tipo de solicitação</SectionTitle>
        {porTipo.length === 0 ? (
          <EmptyState icon="grid-outline" text="Nenhuma solicitação registrada." />
        ) : (
          porTipo.map((p) => (
            <KeyValue key={p.tipo.id} label={getTipo(p.tipo.id)?.nome ?? p.tipo.nome} value={String(p.total)} />
          ))
        )}
      </Card>
    </Screen>
  );
}