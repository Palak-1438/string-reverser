class TuringMachine {
    constructor() {
        this.states = {
            q0: 'q₀ - Initialization',
            qCopy: 'q_copy - Copying',
            qFindEnd: 'q_find_end - Finding end',
            qFindStart: 'q_find_start - Finding start',
            qReturn: 'q_return - Returning',
            qCleanup: 'q_cleanup - Cleaning up',
            qAccept: 'q_accept - Done'
        };
        
        this.currentState = this.states.q0;
        this.tape = [];
        this.headPosition = 0;
        this.steps = [];
        this.currentStep = 0;
        this.symbolToCopy = null;
        this.animationSpeed = 500;
        this.isRunning = false;
        
        this.initElements();
        this.setupEventListeners();
    }
    
    initElements() {
        this.inputElement = document.getElementById('inputString');
        this.runButton = document.getElementById('runButton');
        this.stepButton = document.getElementById('stepButton');
        this.resetButton = document.getElementById('resetButton');
        this.tapeElement = document.getElementById('tape');
        this.headElement = document.getElementById('head');
        this.currentStateElement = document.getElementById('currentState');
        this.outputElement = document.getElementById('output');
        this.speedControl = document.getElementById('speedControl');
    }
    
    setupEventListeners() {
        this.runButton.addEventListener('click', () => this.runSimulation());
        this.stepButton.addEventListener('click', () => this.stepThrough());
        this.resetButton.addEventListener('click', () => this.reset());
        this.speedControl.addEventListener('input', (e) => {
            this.animationSpeed = 1100 - (e.target.value * 100);
        });
    }
    
    runSimulation() {
        if (this.isRunning) return;
        
        const input = this.inputElement.value.trim();
        if (!input) {
            alert('Please enter a string to reverse');
            return;
        }
        
        this.reset();
        this.initializeTape(input);
        this.isRunning = true;
        this.runButton.disabled = true;
        
        this.simulate();
    }
    
    stepThrough() {
        if (this.isRunning) return;
        
        const input = this.inputElement.value.trim();
        if (!input) {
            alert('Please enter a string to reverse');
            return;
        }
        
        if (this.currentState === this.states.q0) {
            this.reset();
            this.initializeTape(input);
        }
        
        this.executeStep();
        this.updateDisplay();
    }
    
    simulate() {
        if (this.currentState === this.states.qAccept || !this.isRunning) {
            this.isRunning = false;
            this.runButton.disabled = false;
            return;
        }
        
        this.executeStep();
        this.updateDisplay();
        
        setTimeout(() => this.simulate(), this.animationSpeed);
    }
    
    executeStep() {
        switch (this.currentState) {
            case this.states.q0:
                this.initializationStep();
                break;
            case this.states.qCopy:
                this.copyStep();
                break;
            case this.states.qFindEnd:
                this.findEndStep();
                break;
            case this.states.qFindStart:
                this.findStartStep();
                break;
            case this.states.qReturn:
                this.returnStep();
                break;
            case this.states.qCleanup:
                this.cleanupStep();
                break;
        }
    }
    
    initializationStep() {
        if (this.tape[this.headPosition] === '#') {
            this.moveRight();
            this.currentState = this.states.qCopy;
        } else {
            this.tape.unshift('#');
            this.headPosition++;
            this.tape.push('$');
        }
    }
    
    copyStep() {
        const currentSymbol = this.tape[this.headPosition];
        
        if (currentSymbol !== '␣' && currentSymbol !== '#' && currentSymbol !== '$') {
            this.symbolToCopy = currentSymbol;
            this.tape[this.headPosition] = '␣';
            this.moveRight();
            this.currentState = this.states.qFindEnd;
        } else if (currentSymbol === '␣') {
            this.moveLeft();
            this.currentState = this.states.qReturn;
        }
    }
    
    findEndStep() {
        if (this.tape[this.headPosition] !== '$') {
            this.moveRight();
        } else {
            this.tape[this.headPosition] = this.symbolToCopy;
            this.moveLeft();
            this.tape.splice(this.headPosition + 1, 0, '$');
            this.currentState = this.states.qFindStart;
        }
    }
    
    findStartStep() {
        if (this.tape[this.headPosition] !== '#') {
            this.moveLeft();
        } else {
            this.moveRight();
            this.currentState = this.states.qCopy;
        }
    }
    
    returnStep() {
        if (this.tape[this.headPosition] === '#') {
            this.moveRight();
            this.tape[this.headPosition] = '␣';
            this.moveLeft();
            this.currentState = this.states.qCleanup;
        } else if (this.tape[this.headPosition] === '$') {
            this.tape[this.headPosition] = '␣';
            this.moveLeft();
            this.currentState = this.states.qCleanup;
        }
    }
    
    cleanupStep() {
        // Remove all markers and blanks
        this.tape = this.tape.filter(cell => cell !== '#' && cell !== '$' && cell !== '␣');
        
        if (this.tape.length === 0) {
            this.tape = ['␣']; // Empty input case
        }
        
        this.currentState = this.states.qAccept;
        this.updateOutput();
    }
    
    moveLeft() {
        if (this.headPosition === 0) {
            this.tape.unshift('␣');
        } else {
            this.headPosition--;
        }
    }
    
    moveRight() {
        this.headPosition++;
        if (this.headPosition >= this.tape.length) {
            this.tape.push('␣');
        }
    }
    
    initializeTape(input) {
        this.tape = ['#', ...input.split(''), '$'];
        this.headPosition = 0;
        this.currentState = this.states.q0;
        this.updateDisplay();
    }
    
    updateDisplay() {
        // Clear tape
        this.tapeElement.innerHTML = '';
        
        // Create tape cells
        this.tape.forEach((cell, index) => {
            const cellElement = document.createElement('div');
            cellElement.className = 'cell';
            cellElement.textContent = cell;
            
            if (index === this.headPosition) {
                cellElement.classList.add('current-cell');
            }
            
            this.tapeElement.appendChild(cellElement);
        });
        
        // Update head position
        const cellWidth = 40; // Approximate width of each cell
        this.headElement.style.left = `${this.headPosition * cellWidth + 15}px`;
        
        // Update current state
        this.currentStateElement.textContent = this.currentState.split(' - ')[0];
        
        // Update output if in accept state
        if (this.currentState === this.states.qAccept) {
            this.updateOutput();
        }
    }
    
    updateOutput() {
        const output = this.tape.filter(cell => cell !== '␣').join('');
        this.outputElement.textContent = output;
    }
    
    reset() {
        this.tape = [];
        this.headPosition = 0;
        this.currentState = this.states.q0;
        this.symbolToCopy = null;
        this.isRunning = false;
        this.runButton.disabled = false;
        this.outputElement.textContent = '';
        this.updateDisplay();
    }
}

// Initialize the Turing Machine when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const tm = new TuringMachine();
});