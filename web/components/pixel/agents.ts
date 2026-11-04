import type { ComponentType } from "react";
import { ClaudeFigure, CodexFigure } from "@/components/agents/Figures";

export type AgentDef = {
  id: string;
  name: string;
  accent: string;
  /** desenho vetorial do personagem */
  Figure: ComponentType<{ waving?: boolean; className?: string }>;
  /** posição inicial (fração da tela) e velocidade de cruzeiro em px/s */
  start: { x: number; y: number };
  velocity: { x: number; y: number };
  /** giro em graus por segundo */
  spin: number;
};

export const agents: AgentDef[] = [
  {
    id: "claude",
    name: "Claude",
    accent: "#d97757",
    Figure: ClaudeFigure,
    start: { x: 0.07, y: 0.3 },
    velocity: { x: 18, y: -11 },
    spin: 6,
  },
  {
    id: "codex",
    name: "Codex",
    accent: "#5b7cfa",
    Figure: CodexFigure,
    start: { x: 0.82, y: 0.22 },
    velocity: { x: -14, y: 13 },
    spin: -5,
  },
];
