export const esFinDeSemana = (fecha: string): boolean => {
  const [y, m, d] = fecha.split("-").map(Number);
  const dia = new Date(y, m - 1, d).getDay();
  return dia === 0 || dia === 6;
};

export const esFeriado = (fecha: string): boolean =>
  feriados2026.includes(fecha);

export const diaBloqueado = (fecha: string): boolean =>
  esFinDeSemana(fecha) || esFeriado(fecha);

export const feriados2026 = [
  "2026-01-01",
  "2026-02-16",
  "2026-02-17",
  "2026-03-23",
  "2026-03-24",
  "2026-04-02",
  "2026-04-03",
  "2026-05-01",
  "2026-05-25",
  "2026-06-15",
  "2026-06-20",
  "2026-07-09",
  "2026-07-10",
  "2026-08-17",
  "2026-10-12",
  "2026-11-23",
  "2026-12-07",
  "2026-12-08",
  "2026-12-25",
];