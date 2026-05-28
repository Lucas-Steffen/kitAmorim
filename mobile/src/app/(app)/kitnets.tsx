import { useState } from 'react';
import { Text, View } from 'react-native';

import {
  Badge,
  Card,
  EmptyState,
  Fab,
  Field,
  FormModal,
  Input,
  PhotosField,
} from '@/components/kit';
import { Screen } from '@/components/sidebar';
import { useStore } from '@/data/store';
import { colors } from '@/theme';
import { formatCurrency } from '@/utils';

export default function KitnetsScreen() {
  const { kitnets, addKitnet } = useStore();
  const [open, setOpen] = useState(false);

  const [numero, setNumero] = useState('');
  const [endereco, setEndereco] = useState('');
  const [valor, setValor] = useState('');
  const [fotos, setFotos] = useState<string[]>([]);

  const valid = numero.trim() && endereco.trim() && valor.trim();

  function reset() {
    setNumero('');
    setEndereco('');
    setValor('');
    setFotos([]);
  }

  function submit() {
    addKitnet({
      numero: numero.trim(),
      endereco: endereco.trim(),
      valor: Number(valor.replace(',', '.')) || 0,
      fotos,
    });
    reset();
    setOpen(false);
  }

  return (
    <Screen title="Cadastro de Kitnet" footer={<Fab label="Nova kitnet" onPress={() => setOpen(true)} />}>
      {kitnets.length === 0 ? (
        <EmptyState icon="business-outline" text="Nenhuma kitnet cadastrada ainda." />
      ) : (
        kitnets.map((k) => (
          <Card key={k.id}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>Kitnet {k.numero}</Text>
              <Badge label={formatCurrency(k.valor)} tone="success" />
            </View>
            <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 4 }}>{k.endereco}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 8 }}>
              {k.fotos.length} foto(s)
            </Text>
          </Card>
        ))
      )}

      <FormModal
        visible={open}
        title="Nova kitnet"
        onClose={() => {
          reset();
          setOpen(false);
        }}
        onSubmit={submit}
        submitDisabled={!valid}>
        <Field label="N° da Kitnet">
          <Input value={numero} onChangeText={setNumero} placeholder="Ex.: 101" />
        </Field>
        <Field label="Endereço">
          <Input value={endereco} onChangeText={setEndereco} placeholder="Rua, número — bairro" />
        </Field>
        <Field label="Valor (mensal)">
          <Input value={valor} onChangeText={setValor} placeholder="0,00" keyboardType="decimal-pad" prefix="R$" />
        </Field>
        <Field label="Fotos">
          <PhotosField value={fotos} onChange={setFotos} />
        </Field>
      </FormModal>
    </Screen>
  );
}