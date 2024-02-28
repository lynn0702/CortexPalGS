/**
 * Returns the results of Cortex evaluated Dice Pool Roll.
 * @param {string} diceString A dice string i.e. "d4 2d10 1d12".
 * @param {bool} suggestbest Will toggle on a suggestion of best total and best effect. Defaults to false.
 * @param {number} keep Number of dice to keep for total. Defaults to 2.
 * @param {number} hitchOn Value which will cause a die to hitch. Defaults to 1.
 * @param {bool} displayHitches Will add a count of hitches. Defaults to false. 
 * @return Multline string of the results.
 * @customfunction
*/
function rollCortexPal(diceString, suggestbest, keep, hitchOn, displayHitches) {
  if(!diceString) return;
  return new DicePool(parseToDice(diceString)).roll(suggestbest, keep, hitchOn, displayHitches)
}
/**
 * Returns the best total and effect sugestions of Cortex evaluated Dice Pool Roll.
 * @param {string} diceString A dice string i.e. "d4 2d10 1d12".
 * @param {number} keep Number of dice to keep for total. Defaults to 2.
 * @param {number} hitchOn Value which will cause a die to hitch. Defaults to 1.
 * @param {bool} displayHitches Will add a count of hitches. Defaults to false. 
 * @return Multline string of the results.
 * @customfunction
*/
function rollCortexPalBest(diceString, keep, hitchOn, displayHitches) {
  if(!diceString) return;
  return new DicePool(parseToDice(diceString)).getBest(null, keep, hitchOn, displayHitches)
}
/**
 * Returns the best total sugestions of Cortex evaluated Dice Pool Roll.
 * @param {string} diceString A dice string i.e. "d4 2d10 1d12".
 * @param {number} keep Number of dice to keep for total. Defaults to 2.
 * @param {number} hitchOn Value which will cause a die to hitch. Defaults to 1.
 * @param {bool} displayHitches Will add a count of hitches. Defaults to false. 
 * @return Multline string of the results.
 * @customfunction
*/
function rollCortexPalBestTotal(diceString, keep, hitchOn, displayHitches) {
  if(!diceString) return;
  return new DicePool(parseToDice(diceString)).getBestTotal(null, keep, hitchOn, displayHitches)
}
/**
 * Returns the best effect sugestions of Cortex evaluated Dice Pool Roll.
 * @param {string} diceString A dice string i.e. "d4 2d10 1d12".
 * @param {number} keep Number of dice to keep for total. Defaults to 2.
 * @param {number} hitchOn Value which will cause a die to hitch. Defaults to 1.
 * @param {bool} displayHitches Will add a count of hitches. Defaults to false. 
 * @return Multline string of the results.
 * @customfunction
*/
function rollCortexPalBestEffect(diceString, keep, hitchOn, displayHitches) {
  if(!diceString) return;
  return new DicePool(parseToDice(diceString)).getBestEffect(null, keep, hitchOn, displayHitches)
}
