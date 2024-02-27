const DICE_EXPRESSION = /(\d*(d|D))?(4|6|8|10|12)/;
const DIE_SIZES = [4, 6, 8, 10, 12];

const UNTYPED_STRESS = 'General';

const DIE_FACE_ERROR = '{0} is not a valid die size. You may only use dice with sizes of 4, 6, 8, 10, or 12.';
const DIE_STRING_ERROR = '{0} is not a valid die or dice.';
const DIE_EXCESS_ERROR = "You can't use that many dice.";
const DIE_MISSING_ERROR = 'There were no valid dice in that command.';
const LOW_NUMBER_ERROR = '{0} must be greater than zero.';

const BEST_OPTION = 'best';

function parseToDice(words) {
    /* Examine the words of an input string, and keep those that are dice notations. */

    const dice = [];
    for (const word of words.split(' ')) {
        if (DICE_EXPRESSION.test(word)) {
            dice.push(new Die(word));
        }
    }
    return dice;
}

    class Die {
        constructor(expression = null, name = null, size = 4, qty = 1) {
            this.name = name;
            this.size = size;
            this.qty = qty;
            if (expression) {
                if (!DICE_EXPRESSION.test(expression)) {
                    throw new Error(DIE_STRING_ERROR + ": " + expression);
                }
                let numbers = expression.toLowerCase().split('d');
                if (numbers.length === 1) {
                    this.size = parseInt(numbers[0]);
                } else {
                    if (numbers[0]) {
                        this.qty = parseInt(numbers[0]);
                    }
                    this.size = parseInt(numbers[1]);
                }
            }
        }
    
        isMax() {
            return this.size === 12;
        }
    
        output() {
            return this.toString();
        }
    
        toString() {
            if (this.qty > 1) {
                return `${this.qty}D${this.size}`;
            } else {
                return `D${this.size}`;
            }
        }
    }

class DicePool {
    constructor(incoming_dice = []) {
        this.dice = [null, null, null, null, null];
        if (incoming_dice.length > 0) {
            this.add(incoming_dice);
        }
    }

    add(dice) {
        for (const die of dice) {
            const index = DIE_SIZES.indexOf(die.size);
            if (this.dice[index]) {
                this.dice[index].qty += die.qty;
            } else {
                this.dice[index] = die;
            }
        }
        return `${this.output()} (added ${list_of_dice(dice)})`;
    }

    is_empty() {
        return !this.dice.some(die => die !== null);
    }

    roll(suggest_best = null, keep = 2) {
        let output = '';
        let separator = '';
        const rolls = [];
        for (const die of this.dice) {
            if (die) {
                output += `${separator}D${die.size} : `;
                for (let i = 0; i < die.qty; i++) {
                    const roll = { value: this.rollDie(die.size), size: die.size };
                    let roll_str = roll.value.toString();
                    if (roll_str === '1') {
                        roll_str = '(1)';
                    } else {
                        rolls.push(roll);
                    }
                    output += `${roll_str} `;
                }
                separator = '\n';
            }
        }
        if (suggest_best) {
            if (rolls.length === 0) {
                output += '\nBotch!';
            } else {
                rolls.sort((a, b) => b.value - a.value);
                if (rolls.length > suggest_best) {
                    var best_total_dice = rolls.slice(0, keep);
                    var best_effect_dice = rolls.sort((a, b) => b.size - a.size).slice(0);
                    var best_effect_1 = `D${best_effect_dice[0].size}`;
                    var best_total_addition = best_total_dice.map(d => d.value).join(' + ');
                    var best_total_1 = best_total_dice.reduce((sum, d) => sum + d.value, 0);
                    output += `\nBest Total: ${best_total_1} (${best_total_addition}) with Effect: ${best_effect_1}`;

                    rolls.sort((a, b) => a.value - b.value);
                    rolls.sort((a, b) => b.size - a.size);
                    var best_effect_2 = `D${rolls[0].size}`;
                    var best_total_dice_2 = rolls.sort((a, b) => b.value - a.value).slice(0, keep);
                    var best_total_addition_2 = best_total_dice_2.map(d => d.value).join(' + ');
                    var best_total_2 = best_total_dice_2.reduce((sum, d) => sum + d.value, 0);
                    output += ` | Best Effect: ${best_effect_2} with Total: ${best_total_2} (${best_total_addition_2})`;
                }
            }
        }
        return output;
    }

    rollDie(size) {
        const face = Math.floor(Math.random() * size) + 1;
        return face;
    }

    output() {
        if (this.is_empty()) {
            return 'empty';
        }
        return list_of_dice(this.dice);
    }
}

list_of_dice = (dice) => {
    const dice_list = [];
    for (const die of dice) {
        if (die) {
            dice_list.push(die.output());
        }
    }
    return dice_list.join(', ');
};

console.log(new DicePool(parseToDice("1d6 2d10 d12")).roll(true));