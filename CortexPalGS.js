const DICE_EXPRESSION = /^(\d*[dD])?(4|6|8|10|12)$/;
const DIE_SIZES = [4, 6, 8, 10, 12];

class Die {
    constructor(expression = null, name = null, size = 4, qty = 1, values = []) {
        this.name = name;
        this.size = size;
        this.qty = qty;
        this.values = values;

        if (expression) {
            if (!DICE_EXPRESSION.test(expression)) {
                throw new Error(`${DIE_STRING_ERROR}: ${expression}`);
            }
            const numbers = expression.toLowerCase().split('d');
            if (numbers.length === 1) {
                this.size = parseInt(numbers[0], 10);
            } else {
                this.qty = numbers[0] ? parseInt(numbers[0], 10) : 1;
                this.size = parseInt(numbers[1], 10);
            }
            if (this.qty < 1) throw new Error(`Quantity must be greater than zero: ${expression}`);
        }
    }

    roll() {
        this.values = Array.from({ length: this.qty }, () => Math.floor(Math.random() * this.size) + 1);
        return this.values;
    }

    isBotch() {
        return this.values.length > 0 && this.values.every(v => v === 1);
    }

    eligibleDice(hitchOn = 1) {
        return this.values
            .filter(v => v > hitchOn)
            .map(v => new Die(null, `D${this.size}`, this.size, 1, [v]));
    }

    output() {
        return this.qty > 1 ? `${this.qty}D${this.size}` : `D${this.size}`;
    }
}

class DicePool {
    // ... constructor, add, and parsing stay similar ...

    isBotch() {
        const active = this.dice.filter(Boolean);
        return active.length > 0 && active.every(die => die.isBotch());
    }

    getHitchDisplay() {
        return `\nHitches: ${this.hitchCount()}`;
    }

    getBestTotal(rolls = null, keep = 2, hitchOn = 1, displayHitches = false) {
        if (!rolls) { rolls = this.eligibleDice(hitchOn); displayHitches = true; }
        
        // Non-mutating copy sorted descending by rolled value
        const sorted = [...rolls].sort((a, b) => b.values[0] - a.values[0]);
        const totalDice = sorted.slice(0, keep);
        const remainingDice = sorted.slice(keep).sort((a, b) => b.size - a.size);
        
        const effectSize = remainingDice.length > 0 ? remainingDice[0].size : 4;
        const totalSum = totalDice.reduce((sum, d) => sum + d.values[0], 0);
        const totalFormula = totalDice.map(d => d.values[0]).join(' + ');

        let output = `Best Total: ${totalSum} (${totalFormula}) with Effect: D${effectSize}`;
        if (displayHitches) output += this.getHitchDisplay();
        return output;
    }

    getBestEffect(rolls = null, keep = 2, hitchOn = 1, displayHitches = false) {
        if (!rolls) { rolls = this.eligibleDice(hitchOn); displayHitches = true; }
        
        // To maximize Effect while preserving the Total:
        // Prioritize largest die size, but pick the lowest value among ties
        const sortedForEffect = [...rolls].sort((a, b) => {
            if (a.size !== b.size) return b.size - a.size;
            return a.values[0] - b.values[0];
        });

        const effectDie = sortedForEffect[0];
        const remainingDice = sortedForEffect.slice(1).sort((a, b) => b.values[0] - a.values[0]);
        const totalDice = remainingDice.slice(0, keep);

        const totalSum = totalDice.reduce((sum, d) => sum + d.values[0], 0);
        const totalFormula = totalDice.map(d => d.values[0]).join(' + ');

        let output = `Best Effect: D${effectDie.size} with Total: ${totalSum} (${totalFormula})`;
        if (displayHitches) output += this.getHitchDisplay();
        return output;
    }
}
