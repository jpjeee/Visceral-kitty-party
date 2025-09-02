// --- Game State & Config ---
const gameState = {
    score: 0,
    round: 0,
    currentProduct: null,
    memoryItems: [],
    correctMemoryItem: null,
    tambolaTicket: [],
    tambolaCalled: [],
};

const products = [
    { id: 1, name: 'Designer Saree', image: 'https://placehold.co/150x150/f472b6/ffffff?text=Saree', price: 1499, category: 'Fashion' },
    { id: 2, name: 'Pressure Cooker', image: 'https://placehold.co/150x150/78716c/ffffff?text=Cooker', price: 2199, category: 'Kitchen' },
    { id: 3, name: 'Masala Dabba', image: 'https://placehold.co/150x150/f59e0b/ffffff?text=Masala', price: 599, category: 'Kitchen' },
    { id: 4, name: 'Bedsheet Set', image: 'https://placehold.co/150x150/22c55e/ffffff?text=Bedsheet', price: 899, category: 'Home' },
    { id: 5, name: 'Gold-Plated Necklace', image: 'https://placehold.co/150x150/facc15/ffffff?text=Necklace', price: 1250, category: 'Jewellery' },
    { id: 6, name: 'Herbal Face Cream', image: 'https://placehold.co/150x150/84cc16/ffffff?text=Cream', price: 349, category: 'Beauty' },
    { id: 7, name: 'Dinner Set', image: 'https://placehold.co/150x150/60a5fa/ffffff?text=Dinner+Set', price: 2999, category: 'Kitchen' },
    { id: 8, name: 'Handbag', image: 'https://placehold.co/150x150/c084fc/ffffff?text=Handbag', price: 750, category: 'Fashion' },
];

const tambolaCategories = ['Fashion', 'Kitchen', 'Home', 'Jewellery', 'Beauty', 'Electronics', 'Grocery', 'Pooja', 'Kids'];

// Global variable for tambola interval
let tambolaCallInterval;

// Avatar Controller
const AvatarController = {
    avatar: null,
    face: null,
    speech: null,
    
    init() {
        this.avatar = document.getElementById('game-avatar');
        this.face = document.getElementById('avatar-face');
        this.speech = document.getElementById('avatar-speech');
    },
    
    setExpression(emoji) {
        if (this.face) {
            this.face.textContent = emoji;
        }
    },
    
    setAnimation(animationClass) {
        if (this.avatar) {
            // Remove all animation classes
            this.avatar.classList.remove('bounce', 'celebrate', 'thinking', 'sad');
            // Add new animation class
            if (animationClass) {
                this.avatar.classList.add(animationClass);
            }
        }
    },
    
    speak(message, duration = 2000) {
        if (this.speech) {
            this.speech.textContent = message;
            this.speech.classList.add('show');
            
            setTimeout(() => {
                this.speech.classList.remove('show');
            }, duration);
        }
    },
    
    // Predefined avatar states
    happy() {
        this.setExpression('😊');
        this.setAnimation('bounce');
    },
    
    celebrate() {
        this.setExpression('🎉');
        this.setAnimation('celebrate');
        this.speak('Shabash!', 1500);
    },
    
    thinking() {
        this.setExpression('🤔');
        this.setAnimation('thinking');
        this.speak('Hmm...', 1000);
    },
    
    sad() {
        this.setExpression('😔');
        this.setAnimation('sad');
        this.speak('Koi baat nahi!', 1500);
    },
    
    excited() {
        this.setExpression('🤩');
        this.setAnimation('bounce');
        this.speak('Wow! Amazing!', 1500);
    },
    
    greet(round) {
        const greetings = {
            1: { emoji: '💰', message: 'Price guess karo!' },
            2: { emoji: '🧠', message: 'Memory test!' },
            3: { emoji: '🎯', message: 'Tambola time!' }
        };
        
        const greeting = greetings[round] || { emoji: '😊', message: 'Let\'s play!' };
        this.setExpression(greeting.emoji);
        this.setAnimation('bounce');
        this.speak(greeting.message, 2000);
    }
};

// --- UI Navigation ---
const screens = ['start-screen', 'game-screen', 'score-screen'];
const rounds = ['round-1', 'round-2', 'round-3'];

function showScreen(screenId) {
    screens.forEach(id => document.getElementById(id).classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
}

function showRound(roundId) {
    rounds.forEach(id => document.getElementById(id).classList.add('hidden'));
    if(roundId) document.getElementById(roundId).classList.remove('hidden');
}

// --- Game Logic ---
function startGame() {
    gameState.score = 0;
    gameState.round = 0;
    updateScoreDisplay();
    showScreen('game-screen');
    
    // Initialize avatar when game starts
    AvatarController.init();
    AvatarController.excited();
    AvatarController.speak('Chalo shuru karte hain!', 2000);
    
    nextRound();
}

function restartGame() {
    showScreen('start-screen');
}

function nextRound() {
    gameState.round++;
    if (gameState.round > 3) {
        endGame();
        return;
    }
    document.getElementById('round-number').innerText = gameState.round;
    showRound(rounds[gameState.round - 1]);
    
    // Avatar greets for each round
    AvatarController.greet(gameState.round);
    
    if (gameState.round === 1) setupPriceRound();
    if (gameState.round === 2) setupMemoryRound();
    if (gameState.round === 3) setupTambolaRound();
}

function updateScore(points) {
    gameState.score += points;
    updateScoreDisplay();
}

function updateScoreDisplay() {
    document.getElementById('score').innerText = gameState.score;
}

// --- Round 1: Guess the Daam ---
function setupPriceRound() {
    const product = products[Math.floor(Math.random() * products.length)];
    gameState.currentProduct = product;

    document.getElementById('price-product-img').src = product.image;
    document.getElementById('price-product-name').innerText = product.name;

    const optionsContainer = document.getElementById('price-options');
    optionsContainer.innerHTML = '';
    const correctPrice = product.price;
    const priceRanges = generatePriceOptions(correctPrice);
    
    priceRanges.forEach(range => {
        const button = document.createElement('button');
        button.className = 'card bg-pink-100 text-pink-800 font-semibold py-4 px-2 rounded-lg text-lg border-2 border-pink-200';
        button.innerText = `₹${range.min} - ₹${range.max}`;
        button.onclick = () => checkPriceAnswer(range.min <= correctPrice && correctPrice <= range.max, button);
        optionsContainer.appendChild(button);
    });
}

function generatePriceOptions(price) {
    const options = [];
    const correctOption = {
        min: Math.floor(price / 100) * 100,
        max: Math.ceil(price / 100) * 100 - 1
    };
    options.push(correctOption);

    while (options.length < 4) {
        const deviation = (Math.floor(Math.random() * 5) + 2) * 100 * (Math.random() > 0.5 ? 1 : -1);
        const newPrice = price + deviation;
        if (newPrice > 0) {
             const newOption = {
                min: Math.floor(newPrice / 100) * 100,
                max: Math.ceil(newPrice / 100) * 100 - 1
            };
            if (!options.some(o => o.min === newOption.min)) {
                options.push(newOption);
            }
        }
    }
    return options.sort(() => Math.random() - 0.5);
}

function checkPriceAnswer(isCorrect, button) {
    document.querySelectorAll('#price-options button').forEach(btn => btn.disabled = true);
    if (isCorrect) {
        updateScore(10);
        button.classList.remove('bg-pink-100', 'border-pink-200');
        button.classList.add('bg-green-500', 'text-white', 'border-green-700', 'animate-tada');
        AvatarController.celebrate();
    } else {
         button.classList.remove('bg-pink-100', 'border-pink-200');
        button.classList.add('bg-red-500', 'text-white', 'border-red-700');
        AvatarController.sad();
    }
    setTimeout(nextRound, 1500);
}

// --- Round 2: Saree mein Samaan ---
function setupMemoryRound() {
    const container = document.getElementById('memory-container');
    container.innerHTML = 'Get Ready...';
    
    let shuffledProducts = [...products].sort(() => 0.5 - Math.random());
    gameState.memoryItems = shuffledProducts.slice(0, 3);
    gameState.correctMemoryItem = gameState.memoryItems[0];
    
    setTimeout(() => {
        container.innerHTML = '';
        const itemsDiv = document.createElement('div');
        itemsDiv.className = 'flex space-x-4';
        gameState.memoryItems.forEach(item => {
            const img = document.createElement('img');
            img.src = item.image;
            img.alt = item.name;
            img.className = 'h-20 w-20 object-contain bg-white p-1 rounded-md shadow-md';
            itemsDiv.appendChild(img);
        });
        container.appendChild(itemsDiv);

        setTimeout(() => {
            container.innerHTML = '<span class="text-2xl">🤔</span>';
            setupMemoryOptions();
        }, 3000);

    }, 1000);
}

function setupMemoryOptions() {
    const optionsContainer = document.getElementById('memory-options');
    optionsContainer.innerHTML = '';
    let options = [gameState.correctMemoryItem];
    let allProducts = [...products];

    while (options.length < 4) {
        let randomProd = allProducts[Math.floor(Math.random() * allProducts.length)];
        if (!options.some(o => o.id === randomProd.id) && !gameState.memoryItems.some(i => i.id === randomProd.id)) {
            options.push(randomProd);
        }
    }
    
    options.sort(() => Math.random() - 0.5).forEach(prod => {
        const button = document.createElement('button');
        button.className = 'card bg-pink-100 text-pink-800 font-semibold py-3 px-2 rounded-lg border-2 border-pink-200 flex items-center justify-center space-x-2';
        button.innerHTML = `<img src="${prod.image}" class="h-8 w-8 inline-block"><span>${prod.name}</span>`;
        button.onclick = () => checkMemoryAnswer(prod.id === gameState.correctMemoryItem.id, button);
        optionsContainer.appendChild(button);
    });
}

function checkMemoryAnswer(isCorrect, button) {
    document.querySelectorAll('#memory-options button').forEach(btn => btn.disabled = true);
    if (isCorrect) {
        updateScore(15);
        button.classList.remove('bg-pink-100', 'border-pink-200');
        button.classList.add('bg-green-500', 'text-white', 'border-green-700', 'animate-tada');
        AvatarController.excited();
    } else {
        button.classList.remove('bg-pink-100', 'border-pink-200');
        button.classList.add('bg-red-500', 'text-white', 'border-red-700');
        AvatarController.sad();
    }
    setTimeout(nextRound, 1500);
}

// --- Round 3: Bumper Tambola ---
function setupTambolaRound() {
    gameState.tambolaCalled = [];
    const ticketContainer = document.getElementById('tambola-ticket');
    ticketContainer.innerHTML = '';
    
    // Generate a simple 3x2 ticket
    let shuffledCategories = [...tambolaCategories].sort(() => 0.5 - Math.random());
    gameState.tambolaTicket = shuffledCategories.slice(0, 6);
    
    gameState.tambolaTicket.forEach(cat => {
        const cell = document.createElement('div');
        cell.className = 'tambola-cell bg-white text-pink-900 font-bold p-3 rounded-md border-2 border-pink-300 text-sm md:text-base cursor-pointer transition-all duration-300';
        cell.innerText = cat;
        cell.dataset.category = cat;
        cell.onclick = () => toggleTambolaCell(cell);
        ticketContainer.appendChild(cell);
    });
    
    tambolaCallInterval = setInterval(callTambolaNumber, 2000);
}

function callTambolaNumber() {
    let available = tambolaCategories.filter(cat => !gameState.tambolaCalled.includes(cat));
    if (available.length === 0) {
        clearInterval(tambolaCallInterval);
        return;
    }
    let called = available[Math.floor(Math.random() * available.length)];
    gameState.tambolaCalled.push(called);
    
    const calledItemEl = document.getElementById('tambola-called-item');
    calledItemEl.innerText = called;
    calledItemEl.classList.add('animate-tada');
    setTimeout(() => calledItemEl.classList.remove('animate-tada'), 1000);
}

function toggleTambolaCell(cell) {
     const category = cell.dataset.category;
     if (gameState.tambolaCalled.includes(category)) {
         cell.classList.toggle('striked');
     }
     checkClaimButton();
}

function checkClaimButton() {
    const cells = document.querySelectorAll('.tambola-cell');
    const row1Striked = Array.from(cells).slice(0, 3).every(c => c.classList.contains('striked'));
    const row2Striked = Array.from(cells).slice(3, 6).every(c => c.classList.contains('striked'));
    document.getElementById('tambola-claim-btn').disabled = !(row1Striked || row2Striked);
}

function checkTambolaWin() {
    clearInterval(tambolaCallInterval);
    const cells = document.querySelectorAll('.tambola-cell');
    const row1Striked = Array.from(cells).slice(0, 3).every(c => c.classList.contains('striked'));
    const row2Striked = Array.from(cells).slice(3, 6).every(c => c.classList.contains('striked'));
    
    if (row1Striked || row2Striked) {
        updateScore(25);
        AvatarController.celebrate();
        AvatarController.speak('Bingo! Perfect!', 2000);
        alert("Congratulations! Line complete!");
    } else {
        AvatarController.thinking();
        AvatarController.speak('Oops! Try again next time!', 2000);
        alert("Bogey! Your claim was wrong.");
    }
    setTimeout(endGame, 1000);
}

// --- End Game ---
function endGame() {
    clearInterval(tambolaCallInterval); // Make sure interval is cleared
    showScreen('score-screen');
    document.getElementById('final-score').innerText = gameState.score;
    
    let rewardText, coupon;
    if (gameState.score >= 40) {
        rewardText = "Superstar Performance!";
        coupon = "KITTYQUEEN"; // 20% off
    } else if (gameState.score >= 20) {
        rewardText = "Bahut Badiya Kheli Aap!";
        coupon = "SMARTPLAYER"; // 10% off
    } else {
        rewardText = "Thanks for Playing!";
        coupon = "KITTY5"; // 5% off
    }
    document.getElementById('reward-text').innerText = rewardText;
    document.getElementById('coupon-code').innerText = coupon;
}

function shareOnWhatsApp() {
    const score = gameState.score;
    const text = `🎉 Maine "Kitty Party Dhamaka!" game mein ${score} points score kiye! Aap bhi khelo aur jeeto exciting rewards! 🎉`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
}
