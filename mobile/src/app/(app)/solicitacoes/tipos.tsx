import { useState } from 'react';

import { Card, EmptyState, Fab, Field, FormModal, Input, ListRow } from '@/components/kit';
import { Screen } from '@/components/sidebar';
import { useStore } from '@/data/store';

export default function TiposScreen() {
  const { tipos, addTipo, solicitacoes } = useStore();
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState('');

  function submit() {
    addTipo({ nome: nome.trim() });
    setNome('');
    setOpen(false);
  }

  return (
    <Screen title="Tipos de solicitações" footer={<Fab label="Novo tipo" onPress={() => setOpen(true)} />}>
      {tipos.length === 0 ? (
        <EmptyState icon="list-outline" text="Nenhum tipo cadastrado ainda." />
      ) : (
        <Card>
          {tipos.map((t) => (
            <ListRow
              key={t.id}
              icon="pricetag-outline"
              title={t.nome}
              subtitle={`${solicitacoes.filter((s) => s.tipoId === t.id).length} solicitação(ões)`}
            />
          ))}
        </Card>
      )}

      <FormModal
        visible={open}
        title="Novo tipo de solicitação"
        onClose={() => {
          setNome('');
          setOpen(false);
        }}
        onSubmit={submit}
        submitDisabled={!nome.trim()}>
        <Field label="Nome do tipo">
          <Input value={nome} onChangeText={setNome} placeholder="Ex.: Manutenção elétrica" />
        </Field>
      </FormModal>
    </Screen>
  );
}