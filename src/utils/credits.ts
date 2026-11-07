/**
 * Regra oficial de consumo de créditos para locução de ofertas:
 * - Locução Simples: 10 créditos iniciais (cobre de 1 a 5 produtos no mesmo anúncio; +2 créditos por produto adicional)
 * - Geração em Lote (Estúdio): 10 créditos por produto (cada produto gera um áudio completo independente com vinheta e trilha)
 *
 * Exemplos Simples:
 * - 1 produto = 10 créditos
 * - 3 produtos = 10 créditos
 * - 5 produtos = 10 créditos
 * - 6 produtos = 12 créditos (10 + 2)
 * - 7 produtos = 14 créditos (10 + 4)
 * - 10 produtos = 20 créditos (10 + 10)
 *
 * Exemplos Lote:
 * - 1 produto em lote = 10 créditos (1 x 10)
 * - 3 produtos em lote = 30 créditos (3 x 10)
 * - 5 produtos em lote = 50 créditos (5 x 10)
 * - 10 produtos em lote = 100 créditos (10 x 10)
 */
export function calculateCreditCost(productCount: number = 1, isBatch: boolean = false): number {
  const count = Math.max(1, Math.floor(productCount || 1));
  if (isBatch) {
    return count * 10;
  }
  if (count <= 5) {
    return 10;
  }
  return 10 + (count - 5) * 2;
}

