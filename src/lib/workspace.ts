export const LIMITES = { usuarios: 50, scrums: 100, criados: 2, convidados: 2, equipe: 6 } as const;
export function diasParaExclusao(ultimoAcesso: string, agora: number) {
  const dias = Math.floor((agora - Date.parse(ultimoAcesso)) / 86400000);
  return dias >= 25 && dias < 30 ? 30 - dias : null;
}
export function podeCriar(quantidade: number) { return quantidade < LIMITES.criados; }
export function podeParticipar(quantidade: number) { return quantidade < LIMITES.convidados; }