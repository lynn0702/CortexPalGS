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
    /* Examine the words of an input string, and keep those that are cortex dice notations. */

    const dice = [];
    for (const word of words.split(' ')) {
        if (DICE_EXPRESSION.test(word)) {
            let die = new Die(word);
            //if the die size is in DIE_SIZES add it to the dice array
            if (DIE_SIZES.includes(die.size)) {
                dice.push(die);
            } 
        }
    }
    return dice;
}

class Die {
    constructor(expression = null, name = null, size = 4, qty = 1, values = []) {
        this.name = name;
        this.size = size;
        this.qty = qty;
        this.values = values;
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
    roll() {
        this.values = [];
        for (let i = 0; i < this.qty; i++) {
            this.values.push(Math.floor(Math.random() * this.size) + 1);
        }
        return this.values;
    }
    isMax() {
        return this.size === 12;
    }

    output() {
        return this.toString();
    }
    isRolled() {
        return this.values.length > 0;
    }
    isBotch() {
        return this.values.length > 0 && this.values.every(v => v === 1);
    }
    //eligible die are die results that are not 1
    eligibleDice(hitchOn = 1) {
        let eligible = [];
        for (const v of this.values) {
            if (v > hitchOn) {
                eligible.push(new Die(null, "D" + this.size, this.size, 1, [v]));
            }
        }
        return eligible;
    }
    toString() {
        if (this.qty > 1) {
            return `${this.qty}D${this.size}`;
        } else {
            return `D${this.size}`;
        }
    }
}

const D4 = new Die(null, 'D4', 4, 1);

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
    isRolled() {
        return this.dice.some(die => die && die.isRolled());
    }
    isBotch() { return this.dice.every(die => { return die && die.isBotch(); }) }

    is_empty() {
        return !this.dice.some(die => die !== null);
    }
    hitchCount(){
        return this.dice.reduce((sum, die) => sum + (die ? die.values.filter(v => v <= 1).length : 0), 0);
    }
    //eligible dice are dice results that are not 1
    eligibleDice(hitchOn = 1) {
        if (!this.isRolled()) { this.rollDice(); }
        let eligible = [];
        for (const die of this.dice) {
            if (die) {
                eligible = eligible.concat(die.eligibleDice(hitchOn));
            }
        }
        return eligible;
    }
    getBest(rolls = null, keep = 2, hitchOn = 1, displayHitches = false) {
        if (!rolls) { rolls = this.eligibleDice(); displayHitches = true;}
        let output = '';
        if (this.isBotch()) {
            output += '\nBotch!';
            return output;
        }
        else if (rolls.length <= keep) {
            output += '\n';
            output += this.getOnlyTotal(rolls, keep, displayHitches);
        }
        else {
            if(!displayHitches) output += '\n';
            output += this.getBestTotal(rolls, keep, hitchOn);
            output += '\n';
            output += this.getBestEffect(rolls, keep, hitchOn, displayHitches);
        }
        return output;
    }
getHtichDisplay(){
    return `\nHitches: ` + this.hitchCount();
}
    getOnlyTotal(rolls, keep = 2, hitchOn = 1, displayHitches = false) {
        if (!rolls) { rolls = this.eligibleDice(hitchOn); displayHitches = true;}
        let output = '';
        var only_total_addition = rolls.map(d => d.values[0]).join(' + ');
        var only_total_1 = rolls.slice(0, keep).reduce((sum, d) => sum + d.values[0], 0);
        output += `Only Total: ${only_total_1} (${only_total_addition}) with Effect: D4`;
        
        if (displayHitches) {
            output += this.getHtichDisplay();
        }
        return output;
    }
    getBestTotal(rolls = null, keep = 2, hitchOn = 1, displayHitches = false) {
        if (!rolls) { rolls = this.eligibleDice(hitchOn); displayHitches = true;}
        let output = '';
        //Find the Best Total, then the best remaining effect
        var best_total_dice = rolls.sort((a, b) => b.values[0] - a.values[0]).slice(0, keep);
        var best_effect_dice = rolls.slice(0, keep).sort((a, b) => b.size - a.size).slice(0);
        best_effect_dice.push(D4);
        var best_effect_1 = `D${best_effect_dice[0].size}`;
        var best_total_addition = best_total_dice.map(d => d.values[0]).join(' + ');
        var best_total_1 = best_total_dice.reduce((sum, d) => sum + d.values[0], 0);
        output += `Best Total: ${best_total_1} (${best_total_addition}) with Effect: ${best_effect_1}`;
        if (displayHitches) {
            output += this.getHtichDisplay();
        }
        return output;
    }

    getBestEffect(rolls = null, keep = 2, hitchOn = 1, displayHitches = false) {
        if (!rolls) { rolls = this.eligibleDice(hitchOn); displayHitches = true; }
        let output = '';
        //Find the Best Effect, Then the Best Total

        rolls.sort((a, b) => b.size - a.size);
        var best_effect_2 = `D${rolls[0].size}`;
        rolls.sort((a, b) => a.values[0] - b.values[0]);
        var best_total_dice_2 = rolls.slice(1, 1 + keep).sort((a, b) => b.values[0] - a.values[0]).slice(0, keep);
        var best_total_addition_2 = best_total_dice_2.map(d => d.values[0]).join(' + ');
        var best_total_2 = best_total_dice_2.reduce((sum, d) => sum + d.values[0], 0);
        output += `Best Effect: ${best_effect_2} with Total: ${best_total_2} (${best_total_addition_2})`;
        if (displayHitches) {
            output += this.getHtichDisplay();
        }
        return output;

    }
    //returns rolled Dice, sets internal roll values
    rollDice() {
        for (const die of this.dice) {
            if (die) die.roll();
        }
        return this.dice;
    }
    results(dice = null, hitchOn = 1) {
        if (!dice) { dice = this.dice; }
        let output = '';
        let separator = '';
        for (const die of this.dice) {
            if (die) {
                output += `${separator}D${die.size} : `;
                for (let i = 0; i < die.values.length; i++) {
                    let roll_str = die.values[i].toString();
                    if (die.values[i] <= hitchOn) {
                        roll_str = '(' + roll_str + ')';
                    }
                    output += `${roll_str} `;
                }
                separator = '\n';
            }
        }
        return output;
    }

    roll(suggest_best = null, keep = 2, hitchOn = 1, displayHitches = false) {
        this.rollDice();
        let output = this.results(this.dice, hitchOn);
        let rolls = this.eligibleDice(hitchOn);
        if (suggest_best) {
            output += this.getBest(rolls, keep, hitchOn, displayHitches);
        }
        else if (displayHitches) {
            output += this.getHtichDisplay();
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

const list_of_dice = (dice) => dice.filter(Boolean).map(die => die.output()).join(', ');

/*
Derived from https://github.com/dbisdorf/cortex-discord-2

Licensed, same as original, under the
MIT License

Copyright (c) 2021 dbisdorf

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

//loop and output 10 samples
for (let i = 0; i < 10; i++) {
    console.log(new DicePool(parseToDice("1d6 2d8 d12 d0 d0 d0")).roll(true, 3, 2));
}
