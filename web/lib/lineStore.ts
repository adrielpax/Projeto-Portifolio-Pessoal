/**
 * Estado da simulação da linha de produção. A cena 3D escreve aqui a cada
 * quadro (sem re-render) e o painel de indicadores lê algumas vezes por segundo.
 */
export const line = {
  produced: 0,
  rejected: 0,
  /** segundos de simulação (só conta quando a seção está visível) */
  elapsed: 0,
  /** resultado da última inspeção */
  lastInspection: "—" as "OK" | "NOK" | "—",
  /** tempo de ciclo do robô em segundos */
  robotCycle: 2.2,
  /** peças na esteira agora */
  onBelt: 0,
};
