export const formatCurrencyInCents = (ammount: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(ammount / 100);
};
