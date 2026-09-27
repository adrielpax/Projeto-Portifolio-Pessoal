// Configurações globais do protótipo
export const TILE = 16;          // tamanho do bloco em pixels de arte
export const WORLD_W = 1400;     // largura do mundo em blocos
export const WORLD_H = 420;      // altura do mundo em blocos
export const BASE_W = 640;       // resolução interna alvo (pixels de arte)
export const BASE_H = 360;
export const DAY_LEN = 240;      // segundos por ciclo dia/noite
export const REACH = 6 * TILE;   // alcance do jogador

export const T = { AIR: 0, DIRT: 1, GRASS: 2, STONE: 3, COPPER: 4, CRYSTAL: 5, PLANK: 6, TRUNK: 7, TORCH: 8, PLATFORM: 9, DOOR_C: 10, DOOR_O: 11 };
export const W = { NONE: 0, DIRT: 1, STONE: 2, WOOD: 3 };

export const SOLID = new Uint8Array(16);
[T.DIRT, T.GRASS, T.STONE, T.COPPER, T.CRYSTAL, T.PLANK, T.DOOR_C].forEach((t) => (SOLID[t] = 1));

// segundos "de picareta" para quebrar
export const HARDNESS = { [T.DIRT]: 0.3, [T.GRASS]: 0.3, [T.STONE]: 0.7, [T.COPPER]: 1.0, [T.CRYSTAL]: 1.3, [T.PLANK]: 0.45, [T.TRUNK]: 0.5, [T.TORCH]: 0.05, [T.PLATFORM]: 0.2, [T.DOOR_C]: 0.45, [T.DOOR_O]: 0.45 };
export const WALL_HARDNESS = 0.4;

// bloco quebrado -> item recebido
export const DROP = { [T.DIRT]: T.DIRT, [T.GRASS]: T.DIRT, [T.STONE]: T.STONE, [T.COPPER]: T.COPPER, [T.CRYSTAL]: T.CRYSTAL, [T.PLANK]: T.PLANK, [T.TRUNK]: T.PLANK, [T.TORCH]: T.TORCH };
