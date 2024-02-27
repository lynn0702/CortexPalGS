function rollCortexPal(diceString, suggestbest, keep) {
  if(!diceString) return;
  return new DicePool(parseToDice(diceString)).roll(suggestbest, keep)
}