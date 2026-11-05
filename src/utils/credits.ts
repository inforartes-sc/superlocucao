/**
 * Regra oficial de consumo de créditos para locução de ofertas:
 * - De 1 a 5 produtos: consumo fixo de 5 créditos
 * - A partir do 5º produto: 1 crédito adicional por produto a mais
 *
 * Exemplos:
 * - 1 produto = 5 créditos
 * - 3 produtos = 5 créditos
 * - 5 produtos = 5 créditos
 * - 6 produtos = 6 créditos (5 + 1)
 * - 7 produtos = 7 créditos (5 + 2)
 * - 10 produtos = 10 créditos (5 + 5)
 */
export function calculateCreditCost(productCount: number = 1): number {
  const count = Math.max(1, Math.floor(productCount || 1));
  if (count <= 5) {
    return 5;
  }
  return 5 + (count - 5);
}
