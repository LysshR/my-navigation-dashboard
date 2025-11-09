const API_URL = 'http://localhost:3000/api';

let currentData = null;
let currentCategoryId = null;

// DOM元素
const backgroundLayer = document.getElementById('backgroundLayer');
const categoriesContainer = document.getElementById('categoriesContainer');
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const backgroundInput = document.getElementById('backgroundInput');
const backgroundFile = document.getElementById('backgroundFile');
const saveBackgroundBtn = document.getElementById('saveBackgroundBtn');

const addCategoryBtn = document.getElementById('addCategoryBtn');
const addCategoryModal = document.getElementById('addCategoryModal');
const closeAddCategoryBtn = document.getElementById('closeAddCategoryBtn');
const categoryNameInput = document.getElementById('categoryNameInput');
const saveCategoryBtn = document.getElementById('saveCategoryBtn');

const addCardModal = document.getElementById('addCardModal');
const closeAddCardBtn = document.getElementById('closeAddCardBtn');
const cardTitleInput = document.getElementById('cardTitleInput');
const cardUrlInput = document.getElementById('cardUrlInput');
const cardIconInput = document.getElementById('cardIconInput');
const saveCardBtn = document.getElementById('saveCardBtn');

// 初始化
async function init() {
    await loadData();
    setupEventListeners();
}

// 加载数据
async function loadData() {
    try {
        const response = await fetch(`${API_URL}/data`);
        currentData = await response.json();
        renderBackground();
        renderCategories();
    } catch (error) {
        console.error('加载数据失败:', error);
        alert('加载数据失败，请检查服务器是否运行');
    }
}

// 渲染背景
function renderBackground() {
    if (currentData.background) {
        // 检查是否是相对路径
        const bgUrl = currentData.background.startsWith('/') 
            ? `http://localhost:3000${currentData.background}`
            : currentData.background;
        backgroundLayer.style.backgroundImage = `url(${bgUrl})`;
    }
}

// 渲染分类
function renderCategories() {
    categoriesContainer.innerHTML = '';
    
    currentData.categories.forEach(category => {
        const categoryElement = createCategoryElement(category);
        categoriesContainer.appendChild(categoryElement);
    });
}

// 创建分类元素
function createCategoryElement(category) {
    const div = document.createElement('div');
    div.className = 'category';
    div.innerHTML = `
        <div class="category-header">
            <h2 class="category-title">
                <i class="fas fa-folder"></i>
                ${category.name}
            </h2>
            <div class="category-actions">
                <button class="btn-small" onclick="deleteCategory('${category.id}')">
                    <i class="fas fa-trash"></i> 删除分类
                </button>
            </div>
        </div>
        <div class="cards-grid" id="category-${category.id}">
            ${category.cards.map(card => createCardHTML(card, category.id)).join('')}
            <div class="card card-add glass" onclick="openAddCardModal('${category.id}')">
                <i class="fas fa-plus"></i>
                <span>添加网站</span>
            </div>
        </div>
    `;
    return div;
}

// 创建卡片HTML
function createCardHTML(card, categoryId) {
    return `
        <a href="${card.url}" target="_blank" class="card glass">
            <button class="card-delete" onclick="event.preventDefault(); deleteCard('${categoryId}', '${card.id}')">
                <i class="fas fa-times"></i>
            </button>
            <div class="card-content">
                <img src="${card.icon}" alt="${card.title}" class="card-icon" 
                     onerror="this.src='https://via.placeholder.com/64?text=${card.title.charAt(0)}'">
                <div class="card-title">${card.title}</div>
            </div>
        </a>
    `;
}

// 设置事件监听
function setupEventListeners() {
    // 设置按钮
    settingsBtn.addEventListener('click', () => {
        settingsModal.classList.add('active');
        backgroundInput.value = currentData.background || '';
    });

    closeSettingsBtn.addEventListener('click', () => {
        settingsModal.classList.remove('active');
    });

    // 保存背景
    saveBackgroundBtn.addEventListener('click', saveBackground);

    // 添加分类
    addCategoryBtn.addEventListener('click', () => {
        addCategoryModal.classList.add('active');
        categoryNameInput.value = '';
    });

    closeAddCategoryBtn.addEventListener('click', () => {
        addCategoryModal.classList.remove('active');
    });

    saveCategoryBtn.addEventListener('click', addCategory);

    // 添加卡片
    closeAddCardBtn.addEventListener('click', () => {
        addCardModal.classList.remove('active');
    });

    saveCardBtn.addEventListener('click', addCard);

    // 点击模态框外部关闭
    [settingsModal, addCategoryModal, addCardModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });

    // Enter键提交
    categoryNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addCategory();
    });
}

// 保存背景
async function saveBackground() {
    try {
        // 如果选择了文件，上传文件
        if (backgroundFile.files.length > 0) {
            const formData = new FormData();
            formData.append('background', backgroundFile.files[0]);

            const response = await fetch(`${API_URL}/upload-background`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            if (result.success) {
                await loadData();
                settingsModal.classList.remove('active');
                showNotification('背景已更新');
            }
        } 
        // 否则使用URL
        else if (backgroundInput.value.trim()) {
            const response = await fetch(`${API_URL}/background`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ background: backgroundInput.value.trim() })
            });

            const result = await response.json();
            if (result.success) {
                await loadData();
                settingsModal.classList.remove('active');
                showNotification('背景已更新');
            }
        }
    } catch (error) {
        console.error('保存背景失败:', error);
        alert('保存失败，请重试');
    }
}

// 添加分类
async function addCategory() {
    const name = categoryNameInput.value.trim();
    if (!name) {
        alert('请输入分类名称');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });

        const result = await response.json();
        if (result.success) {
            await loadData();
            addCategoryModal.classList.remove('active');
            showNotification('分类已添加');
        }
    } catch (error) {
        console.error('添加分类失败:', error);
        alert('添加失败，请重试');
    }
}

// 删除分类
async function deleteCategory(categoryId) {
    if (!confirm('确定要删除这个分类吗？')) return;

    try {
        const response = await fetch(`${API_URL}/categories/${categoryId}`, {
            method: 'DELETE'
        });

        const result = await response.json();
        if (result.success) {
            await loadData();
            showNotification('分类已删除');
        }
    } catch (error) {
        console.error('删除分类失败:', error);
        alert('删除失败，请重试');
    }
}

// 打开添加卡片模态框
function openAddCardModal(categoryId) {
    currentCategoryId = categoryId;
    addCardModal.classList.add('active');
    cardTitleInput.value = '';
    cardUrlInput.value = '';
    cardIconInput.value = '';
}

// 添加卡片
async function addCard() {
    const title = cardTitleInput.value.trim();
    const url = cardUrlInput.value.trim();
    const icon = cardIconInput.value.trim();

    if (!title || !url) {
        alert('请填写网站名称和地址');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/categories/${currentCategoryId}/cards`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                title, 
                url, 
                icon: icon || `${url}/favicon.ico` 
            })
        });

        const result = await response.json();
        if (result.success) {
            await loadData();
            addCardModal.classList.remove('active');
            showNotification('网站已添加');
        }
    } catch (error) {
        console.error('添加卡片失败:', error);
        alert('添加失败，请重试');
    }
}

// 删除卡片
async function deleteCard(categoryId, cardId) {
    try {
        const response = await fetch(`${API_URL}/categories/${categoryId}/cards/${cardId}`, {
            method: 'DELETE'
        });

        const result = await response.json();
        if (result.success) {
            await loadData();
            showNotification('网站已删除');
        }
    } catch (error) {
        console.error('删除卡片失败:', error);
        alert('删除失败，请重试');
    }
}

// 显示通知
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(34, 197, 94, 0.9);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        backdrop-filter: blur(10px);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// 启动应用
init();