class Timer {
    constructor() {
        this.minutesDisplay = document.getElementById('minutes');
        this.secondsDisplay = document.getElementById('seconds');
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.minutesInput = document.getElementById('minutesInput');
        this.secondsInput = document.getElementById('secondsInput');

        this.timeLeft = 0;
        this.timerId = null;
        this.audioContext = null;

        this.initializeEventListeners();
        this.updateDisplayFromInputs(); // 初期表示を設定
    }

    initializeEventListeners() {
        this.startBtn.addEventListener('click', () => this.start());
        this.stopBtn.addEventListener('click', () => this.stop());
        this.resetBtn.addEventListener('click', () => this.reset());
        
        // 入力値のバリデーションと表示の更新
        this.minutesInput.addEventListener('input', (e) => {
            let value = parseInt(e.target.value);
            if (isNaN(value)) value = 0;
            if (value < 0) value = 0;
            if (value > 60) value = 60;
            e.target.value = value;
            this.updateDisplayFromInputs();
        });

        this.secondsInput.addEventListener('input', (e) => {
            let value = parseInt(e.target.value);
            if (isNaN(value)) value = 0;
            if (value < 0) value = 0;
            if (value > 59) value = 59;
            e.target.value = value;
            this.updateDisplayFromInputs();
        });

        // プリセットボタンのイベントリスナー
        document.querySelectorAll('.preset-btn').forEach(button => {
            button.addEventListener('click', () => {
                const minutes = parseInt(button.dataset.minutes);
                this.minutesInput.value = minutes;
                this.secondsInput.value = 0;
                this.updateDisplayFromInputs();
            });
        });
    }

    updateDisplayFromInputs() {
        if (this.timerId === null) {
            const minutes = parseInt(this.minutesInput.value) || 0;
            const seconds = parseInt(this.secondsInput.value) || 0;
            this.minutesDisplay.textContent = minutes.toString().padStart(2, '0');
            this.secondsDisplay.textContent = seconds.toString().padStart(2, '0');
        }
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.minutesDisplay.textContent = minutes.toString().padStart(2, '0');
        this.secondsDisplay.textContent = seconds.toString().padStart(2, '0');
    }

    start() {
        if (this.timerId !== null) return;

        if (this.timeLeft === 0) {
            const minutes = parseInt(this.minutesInput.value) || 0;
            const seconds = parseInt(this.secondsInput.value) || 0;
            this.timeLeft = minutes * 60 + seconds;
            
            if (this.timeLeft <= 0) {
                alert('1秒以上の時間を設定してください');
                return;
            }
        }

        this.timerId = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();

            if (this.timeLeft === 0) {
                this.stop();
                this.playAlarm();
                this.updateDisplayFromInputs(); // タイマー終了後に表示を入力値に合わせる
            }
        }, 1000);

        this.startBtn.disabled = true;
        this.minutesInput.disabled = true;
        this.secondsInput.disabled = true;
    }

    stop() {
        if (this.timerId === null) return;
        clearInterval(this.timerId);
        this.timerId = null;
        this.startBtn.disabled = false;
        this.minutesInput.disabled = false;
        this.secondsInput.disabled = false;
        this.updateDisplayFromInputs(); // 停止時に表示を入力値に合わせる
    }

    reset() {
        this.stop();
        this.timeLeft = 0;
        this.updateDisplayFromInputs();
    }

    playAlarm() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        const notes = [
            { frequency: 440, duration: 0.2 }, // A4
            { frequency: 523.25, duration: 0.2 }, // C5
            { frequency: 587.33, duration: 0.2 }, // D5
            { frequency: 659.25, duration: 0.2 }, // E5
            { frequency: 783.99, duration: 0.2 }, // G5
            { frequency: 880, duration: 0.4 } // A5
        ];

        let currentTime = this.audioContext.currentTime;

        notes.forEach((note, index) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(note.frequency, currentTime);

            gainNode.gain.setValueAtTime(0, currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, currentTime + 0.01);
            gainNode.gain.linearRampToValueAtTime(0, currentTime + note.duration);

            oscillator.start(currentTime);
            oscillator.stop(currentTime + note.duration);

            currentTime += note.duration;
        });
    }
}

// タイマーのインスタンスを作成
const timer = new Timer(); 