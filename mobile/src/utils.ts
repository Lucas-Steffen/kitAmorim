/** Utilitários de período (sempre o mês atual) e formatação pt-BR. */

export type Period = {
  start: Date;
  end: Date;
  /** Ex.: "2026-05" — chave estável para filtrar lançamentos. */
  key: string;
  /** Ex.: "Maio de 2026" */
  label: string;
};

const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

/** Período do primeiro ao último dia do mês atual. */
export function getCurrentPeriod(reference: Date = new Date()): Period {
  const year = reference.getFullYear();
  const month = reference.getMonth();
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  const key = `${year}-${String(month + 1).padStart(2, '0')}`;
  return { start, end, key, label: `${MONTHS[month]} de ${year}` };
}

export function periodKeyOf(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function formatCurrency(value: number): string {
  const fixed = Math.abs(value).toFixed(2);
  const [intPart, decPart] = fixed.split('.');
  const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const sign = value < 0 ? '-' : '';
  return `${sign}R$ ${withThousands},${decPart}`;
}

export function formatDate(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${d}/${m}/${date.getFullYear()}`;
}

/** Converte "dd/mm/aaaa" em Date. Retorna null se inválido. */
export function parseDateBR(value: string): Date | null {
  const m = value.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  const date = new Date(year, month - 1, day);
  if (date.getDate() !== day || date.getMonth() !== month - 1) return null;
  return date;
}

/** Soma meses a uma data preservando o dia (ajusta fim de mês). */
export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  const targetDay = d.getDate();
  d.setMonth(d.getMonth() + months);
  if (d.getDate() < targetDay) d.setDate(0);
  return d;
}

export function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}