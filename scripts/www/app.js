
/**
 * 词芽英语 - 四年级人教版同步学习APP 核心逻辑
 * 包含数据模拟、路由渲染、游戏逻辑、本地存储管理
 */

// --- 1. 数据模拟 (Mock Data) ---
const CURRICULUM_DATA = {
    grade: 4,
    version: "PEP",
    semester: "Vol.1",
    units: [
        {
            id: 1,
            title: "Unit 1 My classroom",
            status: "completed", // completed, current, locked
            words: [
                { en: "classroom", cn: "教室", phonetic: "/ˈklɑːsruːm/", example: "This is my classroom." },
                { en: "window", cn: "窗户", phonetic: "/ˈwɪndəʊ/", example: "Open the window." },
                { en: "blackboard", cn: "黑板", phonetic: "/ˈblækbɔːd/", example: "Look at the blackboard." },
                { en: "light", cn: "电灯", phonetic: "/laɪt/", example: "Turn on the light." },
                { en: "picture", cn: "图画", phonetic: "/ˈpɪktʃə(r)/", example: "A nice picture." }
            ],
            sentences: [
                { en: "What's in the classroom?", cn: "教室里有什么？" },
                { en: "Let's go and see.", cn: "让我们去看看。" }
            ]
        },
        {
            id: 2,
            title: "Unit 2 My schoolbag",
            status: "current",
            words: [
                { en: "schoolbag", cn: "书包", phonetic: "/ˈskuːlbæg/", example: "My schoolbag is heavy." },
                { en: "maths book", cn: "数学书", phonetic: "/mæθs bʊk/", example: "I have a maths book." },
                { en: "English book", cn: "英语书", phonetic: "/ˈɪŋglɪʃ bʊk/", example: "Show me your English book." },
                { en: "storybook", cn: "故事书", phonetic: "/ˈstɔːribʊk/", example: "I like this storybook." }
            ],
            sentences: [
                { en: "I have a new schoolbag.", cn: "我有一个新书包。" },
                { en: "What colour is it?", cn: "它是什么颜色的？" }
            ]
        },
        {
            id: 3,
            title: "Unit 3 My friends",
            status: "locked",
            words: [],
            sentences: []
        }
    ]
};

// --- 2. 状态管理 (State Management) ---
const AppState = {
    currentTab: 'home',
    user: {
        name: "小明",
        streak: 12,
        gems: 450,
        xp: 1200,
        level: 5
    },
    settings: {
        soundOn: true,
        dailyGoal: 15, // minutes
        parentPin: "1234"
    },
    mistakes: [], // Array of word objects
    progress: {
        unit1_words: 5,
        unit2_words: 2
    }
};

// --- 3. 初始化与工具函数 ---
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    renderHome();
    updateHeaderStats();
});

function saveData() {
    localStorage.setItem('ciya_english_data', JSON.stringify(AppState));
}

function loadData() {
    const data = localStorage.getItem('ciya_english_data');
    if (data) {
        const parsed = JSON.parse(data);
        Object.assign(AppState, parsed);
    }
}

function updateHeaderStats() {
    document.getElementById('streak-display').innerText = `${AppState.user.streak}天`;
    document.getElementById('gem-display').innerText = AppState.user.gems;
}

function switchTab(tabName) {
    AppState.currentTab = tabName;
    
    // Update Nav UI
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('active', 'text-blue-500');
        el.classList.add('text-gray-400');
        if(el.dataset.tab === tabName) {
            el.classList.add('active', 'text-blue-500');
            el.classList.remove('text-gray-400');
        }
    });

    // Render Content
    const main = document.getElementById('main-content');
    main.innerHTML = ''; // Clear content
    
    switch(tabName) {
        case 'home': renderHome(); break;
        case 'learn': renderLearn(); break;
        case 'practice': renderPractice(); break;
        case 'parent': renderParent(); break;
    }
}

// --- 4. 页面渲染逻辑 ---

function renderHome() {
    const main = document.getElementById('main-content');
    const currentUnit = CURRICULUM_DATA.units.find(u => u.status === 'current') || CURRICULUM_DATA.units[0];
    
    main.innerHTML = `
        <div class="p-4 space-y-6 animate-fade-in">
            <!-- Daily Goal Card -->
            <div class="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
                <div class="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4">
                    <i class="fas fa-trophy text-9xl"></i>
                </div>
                <h2 class="text-lg font-bold mb-1">今日目标</h2>
                <p class="text-blue-100 text-sm mb-4">坚持学习，保持连胜！</p>
                <div class="flex items-center justify-between">
                    <div>
                        <span class="text-3xl font-bold">10</span>
                        <span class="text-sm text-blue-200">/ ${AppState.settings.dailyGoal} 分钟</span>
                    </div>
                    <button onclick="startQuickPractice()" class="bg-white text-blue-600 px-4 py-2 rounded-full font-bold text-sm shadow hover:bg-blue-50 transition">
                        继续学习
                    </button>
                </div>
                <div class="w-full bg-blue-800 bg-opacity-30 h-2 rounded-full mt-4">
                    <div class="bg-yellow-400 h-2 rounded-full" style="width: 66%"></div>
                </div>
            </div>

            <!-- Current Unit Focus -->
            <div>
                <h3 class="font-bold text-gray-800 mb-3 flex items-center">
                    <i class="fas fa-star text-yellow-400 mr-2"></i> 当前重点
                </h3>
                <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 card-hover cursor-pointer" onclick="openUnitDetail(${currentUnit.id})">
                    <div class="flex justify-between items-start mb-2">
                        <span class="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-md font-bold">进行中</span>
                        <i class="fas fa-chevron-right text-gray-300"></i>
                    </div>
                    <h4 class="text-lg font-bold text-gray-800">${currentUnit.title}</h4>
                    <p class="text-gray-500 text-sm mt-1">掌握核心词汇与句型</p>
                    
                    <div class="mt-4 flex space-x-2">
                        <div class="flex-1 bg-gray-50 rounded-lg p-2 text-center">
                            <div class="text-xs text-gray-400">词汇进度</div>
                            <div class="font-bold text-blue-600">${AppState.progress[`unit${currentUnit.id}_words`] || 0}/${currentUnit.words.length}</div>
                        </div>
                        <div class="flex-1 bg-gray-50 rounded-lg p-2 text-center">
                            <div class="text-xs text-gray-400">句型掌握</div>
                            <div class="font-bold text-purple-600">0/${currentUnit.sentences.length}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recommended Games -->
            <div>
                <h3 class="font-bold text-gray-800 mb-3">趣味巩固</h3>
                <div class="grid grid-cols-2 gap-3">
                    <div onclick="startGame('word_match')" class="bg-orange-50 p-4 rounded-xl border border-orange-100 text-center cursor-pointer hover:bg-orange-100 transition">
                        <div class="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center mx-auto mb-2 text-orange-600">
                            <i class="fas fa-puzzle-piece text-xl"></i>
                        </div>
                        <h4 class="font-bold text-gray-700 text-sm">单词消消乐</h4>
                        <p class="text-xs text-gray-500 mt-1">训练反应速度</p>
                    </div>
                    <div onclick="startGame('listening')" class="bg-purple-50 p-4 rounded-xl border border-purple-100 text-center cursor-pointer hover:bg-purple-100 transition">
                        <div class="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center mx-auto mb-2 text-purple-600">
                            <i class="fas fa-headphones text-xl"></i>
                        </div>
                        <h4 class="font-bold text-gray-700 text-sm">听力大挑战</h4>
                        <p class="text-xs text-gray-500 mt-1">磨耳朵必备</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderLearn() {
    const main = document.getElementById('main-content');
    let unitsHtml = CURRICULUM_DATA.units.map(unit => {
        let statusColor = unit.status === 'completed' ? 'bg-green-500' : (unit.status === 'current' ? 'bg-blue-500' : 'bg-gray-300');
        let icon = unit.status === 'completed' ? 'fa-check' : (unit.status === 'current' ? 'fa-play' : 'fa-lock');
        let clickAction = unit.status !== 'locked' ? `onclick="openUnitDetail(${unit.id})"` : '';
        
        return `
            <div class="flex items-center p-4 bg-white mb-3 rounded-xl shadow-sm border border-gray-100 ${unit.status !== 'locked' ? 'cursor-pointer hover:bg-gray-50' : 'opacity-70'}" ${clickAction}>
                <div class="w-10 h-10 rounded-full ${statusColor} text-white flex items-center justify-center mr-4 flex-shrink-0">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="flex-1">
                    <h4 class="font-bold text-gray-800">${unit.title}</h4>
                    <p class="text-xs text-gray-500 mt-1">${unit.words.length} 个核心词汇 • ${unit.sentences.length} 个重点句</p>
                </div>
                ${unit.status === 'current' ? '<span class="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">学习中</span>' : ''}
            </div>
        `;
    }).join('');

    main.innerHTML = `
        <div class="p-4">
            <h2 class="text-xl font-bold text-gray-800 mb-4">同步课程表</h2>
            <div class="bg-blue-50 p-3 rounded-lg mb-4 flex items-center justify-between">
                <div class="flex items-center">
                    <i class="fas fa-book text-blue-500 mr-2"></i>
                    <span class="text-sm text-blue-800 font-medium">人教版 PEP 四年级上册</span>
                </div>
                <span class="text-xs text-blue-600 bg-white px-2 py-1 rounded shadow-sm">已同步</span>
            </div>
            ${unitsHtml}
        </div>
    `;
}

function renderPractice() {
    const main = document.getElementById('main-content');
    main.innerHTML = `
        <div class="p-4">
            <h2 class="text-xl font-bold text-gray-800 mb-4">专项训练场</h2>
            
            <div class="space-y-4">
                <!-- Word Master -->
                <div class="bg-white p-4 rounded-xl shadow-sm border-l-4 border-yellow-400 flex justify-between items-center cursor-pointer" onclick="startGame('word_master')">
                    <div>
                        <h3 class="font-bold text-gray-800">单词达人</h3>
                        <p class="text-xs text-gray-500">看图识词 / 听音选词</p>
                    </div>
                    <i class="fas fa-chevron-right text-gray-300"></i>
                </div>

                <!-- Sentence Builder -->
                <div class="bg-white p-4 rounded-xl shadow-sm border-l-4 border-purple-400 flex justify-between items-center cursor-pointer" onclick="startGame('sentence_builder')">
                    <div>
                        <h3 class="font-bold text-gray-800">句子组装</h3>
                        <p class="text-xs text-gray-500">连词成句 / 语法纠错</p>
                    </div>
                    <i class="fas fa-chevron-right text-gray-300"></i>
                </div>

                <!-- Mistake Book -->
                <div class="bg-white p-4 rounded-xl shadow-sm border-l-4 border-red-400 flex justify-between items-center cursor-pointer" onclick="renderMistakes()">
                    <div>
                        <h3 class="font-bold text-gray-800">错题本</h3>
                        <p class="text-xs text-gray-500">消灭薄弱点 (${AppState.mistakes.length})</p>
                    </div>
                    <i class="fas fa-chevron-right text-gray-300"></i>
                </div>
            </div>
        </div>
    `;
}

function renderParent() {
    const main = document.getElementById('main-content');
    // Simple PIN check simulation
    main.innerHTML = `
        <div class="p-4 flex flex-col items-center justify-center h-full">
            <div class="bg-white p-6 rounded-2xl shadow-lg w-full max-w-xs text-center">
                <i class="fas fa-shield-alt text-4xl text-blue-500 mb-4"></i>
                <h2 class="text-lg font-bold text-gray-800 mb-2">家长控制中心</h2>
                <p class="text-sm text-gray-500 mb-6">请输入4位PIN码查看学情报告</p>
                <input type="password" id="parent-pin" maxlength="4" class="w-full text-center text-2xl tracking-widest border-b-2 border-gray-300 focus:border-blue-500 outline-none py-2 mb-4" placeholder="****">
                <button onclick="checkParentPin()" class="w-full bg-blue-500 text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition">进入</button>
                <p class="text-xs text-gray-400 mt-4">默认PIN: 1234</p>
            </div>
        </div>
    `;
}

function renderParentDashboard() {
    const main = document.getElementById('main-content');
    main.innerHTML = `
        <div class="p-4 pb-20">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-bold text-gray-800">学情周报</h2>
                <button onclick="switchTab('home')" class="text-sm text-blue-500">退出</button>
            </div>

            <!-- Stats Cards -->
            <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="bg-white p-4 rounded-xl shadow-sm">
                    <p class="text-xs text-gray-500">本周学习时长</p>
                    <p class="text-2xl font-bold text-blue-600">145 <span class="text-sm font-normal text-gray-400">分钟</span></p>
                </div>
                <div class="bg-white p-4 rounded-xl shadow-sm">
                    <p class="text-xs text-gray-500">掌握词汇量</p>
                    <p class="text-2xl font-bold text-green-600">+24 <span class="text-sm font-normal text-gray-400">个</span></p>
                </div>
            </div>

            <!-- Chart Container -->
            <div class="bg-white p-4 rounded-xl shadow-sm mb-6">
                <h3 class="font-bold text-gray-700 mb-4 text-sm">每日学习活跃度</h3>
                <canvas id="learningChart" height="200"></canvas>
            </div>

            <!-- Settings -->
            <div class="bg-white rounded-xl shadow-sm overflow-hidden">
                <div class="p-4 border-b border-gray-100 flex justify-between items-center">
                    <span class="text-sm font-medium text-gray-700">每日学习提醒</span>
                    <div class="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                        <input type="checkbox" name="toggle" id="toggle-reminder" class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:border-green-400"/>
                        <label for="toggle-reminder" class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer checked:bg-green-400"></label>
                    </div>
                </div>
                <div class="p-4 flex justify-between items-center">
                    <span class="text-sm font-medium text-gray-700">护眼模式</span>
                    <div class="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                        <input type="checkbox" checked class="absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer right-0 border-green-400"/>
                        <label class="block overflow-hidden h-6 rounded-full bg-green-400 cursor-pointer"></label>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Initialize Chart
    setTimeout(() => {
        const ctx = document.getElementById('learningChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
                datasets: [{
                    label: '学习分钟数',
                    data: [15, 20, 10, 25, 30, 45, 0],
                    backgroundColor: '#3b82f6',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
            }
        });
    }, 100);
}

// --- 5. 交互功能实现 ---

function checkParentPin() {
    const input = document.getElementById('parent-pin').value;
    if (input === AppState.settings.parentPin) {
        renderParentDashboard();
    } else {
        alert("PIN码错误");
        document.getElementById('parent-pin').value = '';
    }
}

function openUnitDetail(unitId) {
    const unit = CURRICULUM_DATA.units.find(u => u.id === unitId);
    if (!unit) return;

    const modal = document.getElementById('modal-overlay');
    modal.classList.remove('hidden');
    modal.classList.add('pointer-events-auto');
    
    // Generate Word List HTML
    const wordsHtml = unit.words.map((word, index) => `
        <div class="bg-white p-3 rounded-lg shadow-sm border border-gray-100 mb-2 flex justify-between items-center">
            <div>
                <p class="font-bold text-gray-800 text-lg">${word.en}</p>
                <p class="text-xs text-gray-500">${word.phonetic}</p>
            </div>
            <div class="flex items-center space-x-3">
                <button onclick="playAudio('${word.en}')" class="w-8 h-8 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center hover:bg-blue-200">
                    <i class="fas fa-volume-up"></i>
                </button>
                <span class="text-sm text-gray-600">${word.cn}</span>
            </div>
        </div>
    `).join('');

    modal.innerHTML = `
        <div class="bg-gray-50 w-full max-w-[480px] h-[90vh] rounded-t-2xl modal-slide-up flex flex-col relative">
            <div class="bg-blue-500 p-4 text-white rounded-t-2xl flex justify-between items-center">
                <h3 class="font-bold text-lg">${unit.title}</h3>
                <button onclick="closeModal()" class="text-white hover:text-gray-200"><i class="fas fa-times text-xl"></i></button>
            </div>
            
            <div class="flex-1 overflow-y-auto p-4">
                <div class="mb-4">
                    <h4 class="font-bold text-gray-700 mb-2">核心词汇</h4>
                    ${wordsHtml}
                </div>
                
                <div class="mb-4">
                    <h4 class="font-bold text-gray-700 mb-2">重点句型</h4>
                    ${unit.sentences.map(s => `
                        <div class="bg-purple-50 p-3 rounded-lg mb-2 border border-purple-100">
                            <p class="text-purple-900 font-medium">${s.en}</p>
                            <p class="text-purple-600 text-sm mt-1">${s.cn}</p>
                            <button onclick="playAudio('${s.en.replace(/'/g, "\\'")}')" class="mt-2 text-xs bg-white px-2 py-1 rounded shadow-sm text-purple-600"><i class="fas fa-play mr-1"></i>跟读</button>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="p-4 bg-white border-t border-gray-200">
                <button onclick="startUnitQuiz(${unit.id})" class="w-full bg-green-500 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-green-600 transition transform active:scale-95">
                    开始单元测验
                </button>
            </div>
        </div>
    `;
}

function closeModal() {
    const modal = document.getElementById('modal-overlay');
    modal.classList.add('hidden');
    modal.classList.remove('pointer-events-auto');
    modal.innerHTML = '';
}

function playAudio(text) {
    if (!AppState.settings.soundOn) return;
    
    // Using Web Speech API for demo purposes
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.8; // Slower for kids
    window.speechSynthesis.speak(utterance);
}

function startQuickPractice() {
    startGame('word_match');
}

// --- 6. 游戏逻辑 (简化版) ---

function startGame(type) {
    const modal = document.getElementById('modal-overlay');
    modal.classList.remove('hidden');
    modal.classList.add('pointer-events-auto');

    if (type === 'word_match') {
        // Simple Matching Game Logic
        const currentUnit = CURRICULUM_DATA.units.find(u => u.status === 'current');
        const words = currentUnit.words.slice(0, 4); // Take first 4 words
        
        // Create pairs: English and Chinese
        let cards = [];
        words.forEach((w, i) => {
            cards.push({ id: i, type: 'en', text: w.en, matchId: i });
            cards.push({ id: i, type: 'cn', text: w.cn, matchId: i });
        });
        
        // Shuffle
        cards.sort(() => Math.random() - 0.5);

        let selectedCard = null;
        let matchedCount = 0;

        const renderGrid = () => {
            return `
                <div class="grid grid-cols-2 gap-3 mt-4">
                    ${cards.map((card, idx) => `
                        <div id="card-${idx}" onclick="handleCardClick(${idx}, ${card.matchId}, '${card.text}')" 
                             class="bg-white h-24 rounded-xl shadow-sm border-2 border-gray-200 flex items-center justify-center text-center p-2 cursor-pointer transition-all duration-300 transform hover:scale-105">
                            <span class="font-bold text-gray-700 text-lg">${card.text}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        };

        modal.innerHTML = `
            <div class="bg-blue-50 w-full max-w-[480px] h-[90vh] rounded-t-2xl modal-slide-up flex flex-col relative">
                <div class="bg-blue-500 p-4 text-white rounded-t-2xl flex justify-between items-center">
                    <h3 class="font-bold text-lg">单词消消乐</h3>
                    <button onclick="closeModal()" class="text-white"><i class="fas fa-times"></i></button>
                </div>
                <div class="p-4 flex-1 flex flex-col">
                    <p class="text-center text-gray-600 mb-2">点击英文和对应的中文进行配对</p>
                    <div id="game-board" class="flex-1">
                        ${renderGrid()}
                    </div>
                    <div id="game-result" class="hidden text-center py-10">
                        <i class="fas fa-trophy text-6xl text-yellow-400 mb-4 animate-bounce"></i>
                        <h3 class="text-2xl font-bold text-gray-800">太棒了!</h3>
                        <p class="text-gray-600 mt-2">获得 20 经验值</p>
                        <button onclick="closeModal()" class="mt-6 bg-blue-500 text-white px-8 py-3 rounded-full font-bold">继续</button>
                    </div>
                </div>
            </div>
        `;

        // Attach logic to window for access from HTML onclick
        window.handleCardClick = (idx, matchId, text) => {
            const cardEl = document.getElementById(`card-${idx}`);
            if (cardEl.classList.contains('matched') || cardEl.classList.contains('selected')) return;

            playAudio(text);

            if (!selectedCard) {
                // First selection
                selectedCard = { idx, matchId, el: cardEl };
                cardEl.classList.add('selected', 'border-blue-500', 'bg-blue-50');
            } else {
                // Second selection
                if (selectedCard.matchId === matchId) {
                    // Match!
                    cardEl.classList.add('matched', 'border-green-500', 'bg-green-50', 'opacity-50');
                    selectedCard.el.classList.add('matched', 'border-green-500', 'bg-green-50', 'opacity-50');
                    selectedCard.el.classList.remove('selected', 'border-blue-500', 'bg-blue-50');
                    selectedCard = null;
                    matchedCount++;
                    
                    if (matchedCount === words.length) {
                        setTimeout(() => {
                            document.getElementById('game-board').classList.add('hidden');
                            document.getElementById('game-result').classList.remove('hidden');
                            // Update User Stats
                            AppState.user.xp += 20;
                            AppState.user.gems += 5;
                            updateHeaderStats();
                            saveData();
                        }, 500);
                    }
                } else {
                    // No Match
                    cardEl.classList.add('border-red-500', 'bg-red-50');
                    setTimeout(() => {
                        cardEl.classList.remove('border-red-500', 'bg-red-50');
                        selectedCard.el.classList.remove('selected', 'border-blue-500', 'bg-blue-50');
                        selectedCard = null;
                    }, 500);
                }
            }
        };
    }
}

function renderMistakes() {
    const modal = document.getElementById('modal-overlay');
    modal.classList.remove('hidden');
    modal.classList.add('pointer-events-auto');

    if (AppState.mistakes.length === 0) {
        modal.innerHTML = `
            <div class="bg-white w-full max-w-[480px] p-8 rounded-2xl text-center m-4">
                <i class="fas fa-check-circle text-6xl text-green-500 mb-4"></i>
                <h3 class="text-xl font-bold text-gray-800">暂无错题</h3>
                <p class="text-gray-500 mt-2">继续保持，你很棒！</p>
                <button onclick="closeModal()" class="mt-6 bg-gray-200 text-gray-700 px-6 py-2 rounded-full">关闭</button>
            </div>
        `;
        return;
    }

    const listHtml = AppState.mistakes.map((word, idx) => `
        <div class="bg-white p-3 rounded-lg shadow-sm border-l-4 border-red-400 mb-2 flex justify-between items-center">
            <div>
                <p class="font-bold text-gray-800">${word.en}</p>
                <p class="text-xs text-gray-500">${word.cn}</p>
            </div>
            <button onclick="removeMistake(${idx})" class="text-green-500 text-sm font-bold">我已掌握</button>
        </div>
    `).join('');

    modal.innerHTML = `
        <div class="bg-gray-50 w-full max-w-[480px] h-[80vh] rounded-t-2xl modal-slide-up flex flex-col relative m-auto">
            <div class="bg-red-500 p-4 text-white rounded-t-2xl flex justify-between items-center">
                <h3 class="font-bold text-lg">错题本</h3>
                <button onclick="closeModal()" class="text-white"><i class="fas fa-times"></i></button>
            </div>
            <div class="p-4 flex-1 overflow-y-auto">
                ${listHtml}
            </div>
        </div>
    `;
}

window.removeMistake = (idx) => {
    AppState.mistakes.splice(idx, 1);
    saveData();
    renderMistakes(); // Re-render
};

function toggleSettings() {
    AppState.settings.soundOn = !AppState.settings.soundOn;
    alert(`声音已${AppState.settings.soundOn ? '开启' : '关闭'}`);
}
