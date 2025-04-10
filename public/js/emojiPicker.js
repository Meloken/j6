// public/js/emojiPicker.js

/**
 * Emoji picker module for adding emojis to messages
 */

// Common emojis
const COMMON_EMOJIS = [
  { code: ':smile:', emoji: '😊' },
  { code: ':laugh:', emoji: '😂' },
  { code: ':wink:', emoji: '😉' },
  { code: ':heart:', emoji: '❤️' },
  { code: ':thumbsup:', emoji: '👍' },
  { code: ':thumbsdown:', emoji: '👎' },
  { code: ':clap:', emoji: '👏' },
  { code: ':fire:', emoji: '🔥' },
  { code: ':tada:', emoji: '🎉' },
  { code: ':thinking:', emoji: '🤔' },
  { code: ':check:', emoji: '✅' },
  { code: ':x:', emoji: '❌' },
  { code: ':warning:', emoji: '⚠️' },
  { code: ':question:', emoji: '❓' },
  { code: ':exclamation:', emoji: '❗' },
  { code: ':rocket:', emoji: '🚀' },
  { code: ':eyes:', emoji: '👀' },
  { code: ':sob:', emoji: '😭' },
  { code: ':angry:', emoji: '😠' },
  { code: ':cool:', emoji: '😎' },
  { code: ':party:', emoji: '🥳' },
  { code: ':wave:', emoji: '👋' },
  { code: ':pray:', emoji: '🙏' },
  { code: ':ok:', emoji: '👌' },
  { code: ':love:', emoji: '😍' },
  { code: ':confused:', emoji: '😕' },
  { code: ':cry:', emoji: '😢' },
  { code: ':sleep:', emoji: '😴' },
  { code: ':tongue:', emoji: '😛' },
  { code: ':shocked:', emoji: '😱' },
  { code: ':sick:', emoji: '🤢' },
  { code: ':devil:', emoji: '😈' },
  { code: ':angel:', emoji: '😇' },
  { code: ':star:', emoji: '⭐' },
  { code: ':sparkles:', emoji: '✨' },
  { code: ':rainbow:', emoji: '🌈' },
  { code: ':sun:', emoji: '☀️' },
  { code: ':moon:', emoji: '🌙' },
  { code: ':cloud:', emoji: '☁️' },
  { code: ':rain:', emoji: '🌧️' },
  { code: ':snow:', emoji: '❄️' },
  { code: ':music:', emoji: '🎵' },
  { code: ':gift:', emoji: '🎁' },
  { code: ':balloon:', emoji: '🎈' },
  { code: ':cake:', emoji: '🎂' },
  { code: ':coffee:', emoji: '☕' },
  { code: ':pizza:', emoji: '🍕' },
  { code: ':hamburger:', emoji: '🍔' },
  { code: ':beer:', emoji: '🍺' },
  { code: ':wine:', emoji: '🍷' }
];

// Emoji categories
const EMOJI_CATEGORIES = [
  { name: 'Sık Kullanılanlar', icon: 'history' },
  { name: 'Yüzler', icon: 'sentiment_satisfied_alt' },
  { name: 'Hareketler', icon: 'waving_hand' },
  { name: 'Nesneler', icon: 'lightbulb' },
  { name: 'Semboller', icon: 'emoji_symbols' },
  { name: 'Yiyecekler', icon: 'restaurant' }
];

/**
 * Initialize emoji picker
 */
export function initEmojiPicker() {
  // Add emoji button to text channel input
  const textChatInputBar = document.getElementById('text-chat-input-bar');
  if (textChatInputBar) {
    const emojiButton = document.createElement('span');
    emojiButton.className = 'material-icons emoji-button';
    emojiButton.textContent = 'emoji_emotions';
    emojiButton.title = 'Emoji Ekle';
    
    const chatInputWrapper = textChatInputBar.querySelector('.chat-input-wrapper');
    chatInputWrapper.insertBefore(emojiButton, chatInputWrapper.querySelector('.send-icon'));
    
    emojiButton.addEventListener('click', () => {
      toggleEmojiPicker(document.getElementById('textChannelMessageInput'));
    });
  }
  
  // Add emoji button to DM input
  document.addEventListener('dmChatInitialized', () => {
    const dmChatInputBar = document.getElementById('dm-chat-input-bar');
    if (dmChatInputBar) {
      const emojiButton = document.createElement('span');
      emojiButton.className = 'material-icons emoji-button';
      emojiButton.textContent = 'emoji_emotions';
      emojiButton.title = 'Emoji Ekle';
      
      const chatInputWrapper = dmChatInputBar.querySelector('.chat-input-wrapper');
      chatInputWrapper.insertBefore(emojiButton, chatInputWrapper.querySelector('.send-icon'));
      
      emojiButton.addEventListener('click', () => {
        toggleEmojiPicker(document.getElementById('dmMessageInput'));
      });
    }
  });
  
  // Close emoji picker when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.emoji-picker') && !e.target.closest('.emoji-button')) {
      const emojiPicker = document.querySelector('.emoji-picker');
      if (emojiPicker) {
        emojiPicker.remove();
      }
    }
  });
}

/**
 * Toggle emoji picker
 * @param {HTMLElement} inputElement - Input element to insert emojis into
 */
function toggleEmojiPicker(inputElement) {
  // Remove existing emoji picker
  const existingPicker = document.querySelector('.emoji-picker');
  if (existingPicker) {
    existingPicker.remove();
    return;
  }
  
  // Create emoji picker
  const emojiPicker = document.createElement('div');
  emojiPicker.className = 'emoji-picker';
  
  // Add categories
  const categoriesContainer = document.createElement('div');
  categoriesContainer.className = 'emoji-categories';
  
  EMOJI_CATEGORIES.forEach((category, index) => {
    const categoryButton = document.createElement('button');
    categoryButton.className = 'emoji-category-button';
    categoryButton.dataset.category = index;
    categoryButton.title = category.name;
    categoryButton.innerHTML = `<span class="material-icons">${category.icon}</span>`;
    
    if (index === 0) {
      categoryButton.classList.add('active');
    }
    
    categoryButton.addEventListener('click', () => {
      document.querySelectorAll('.emoji-category-button').forEach(btn => btn.classList.remove('active'));
      categoryButton.classList.add('active');
      showEmojiCategory(index, emojiPicker);
    });
    
    categoriesContainer.appendChild(categoryButton);
  });
  
  emojiPicker.appendChild(categoriesContainer);
  
  // Add emoji container
  const emojiContainer = document.createElement('div');
  emojiContainer.className = 'emoji-container';
  emojiPicker.appendChild(emojiContainer);
  
  // Add search
  const searchContainer = document.createElement('div');
  searchContainer.className = 'emoji-search-container';
  searchContainer.innerHTML = `
    <input type="text" class="emoji-search" placeholder="Emoji ara...">
  `;
  emojiPicker.appendChild(searchContainer);
  
  // Position and show emoji picker
  const inputRect = inputElement.getBoundingClientRect();
  emojiPicker.style.bottom = `${window.innerHeight - inputRect.top + 10}px`;
  emojiPicker.style.left = `${inputRect.left}px`;
  
  document.body.appendChild(emojiPicker);
  
  // Show first category (frequently used)
  showEmojiCategory(0, emojiPicker);
  
  // Add search functionality
  const searchInput = emojiPicker.querySelector('.emoji-search');
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();
    if (query) {
      searchEmojis(query, emojiPicker, inputElement);
    } else {
      showEmojiCategory(0, emojiPicker);
    }
  });
}

/**
 * Show emoji category
 * @param {number} categoryIndex - Category index
 * @param {HTMLElement} emojiPicker - Emoji picker element
 */
function showEmojiCategory(categoryIndex, emojiPicker) {
  const emojiContainer = emojiPicker.querySelector('.emoji-container');
  emojiContainer.innerHTML = '';
  
  // For simplicity, we'll just show common emojis for all categories
  COMMON_EMOJIS.forEach(emojiData => {
    const emojiButton = document.createElement('button');
    emojiButton.className = 'emoji-button';
    emojiButton.textContent = emojiData.emoji;
    emojiButton.title = emojiData.code;
    
    emojiButton.addEventListener('click', () => {
      insertEmoji(emojiData.emoji, emojiPicker);
    });
    
    emojiContainer.appendChild(emojiButton);
  });
}

/**
 * Search emojis
 * @param {string} query - Search query
 * @param {HTMLElement} emojiPicker - Emoji picker element
 * @param {HTMLElement} inputElement - Input element to insert emojis into
 */
function searchEmojis(query, emojiPicker, inputElement) {
  const emojiContainer = emojiPicker.querySelector('.emoji-container');
  emojiContainer.innerHTML = '';
  
  const filteredEmojis = COMMON_EMOJIS.filter(emojiData => 
    emojiData.code.toLowerCase().includes(query) || 
    emojiData.emoji.includes(query)
  );
  
  if (filteredEmojis.length === 0) {
    emojiContainer.innerHTML = '<div class="emoji-no-results">Sonuç bulunamadı</div>';
    return;
  }
  
  filteredEmojis.forEach(emojiData => {
    const emojiButton = document.createElement('button');
    emojiButton.className = 'emoji-button';
    emojiButton.textContent = emojiData.emoji;
    emojiButton.title = emojiData.code;
    
    emojiButton.addEventListener('click', () => {
      insertEmoji(emojiData.emoji, emojiPicker);
    });
    
    emojiContainer.appendChild(emojiButton);
  });
}

/**
 * Insert emoji into input
 * @param {string} emoji - Emoji to insert
 * @param {HTMLElement} emojiPicker - Emoji picker element
 */
function insertEmoji(emoji, emojiPicker) {
  // Find the active input
  let inputElement;
  if (document.getElementById('textChannelMessageInput') && document.getElementById('textChannelMessageInput').offsetParent !== null) {
    inputElement = document.getElementById('textChannelMessageInput');
  } else if (document.getElementById('dmMessageInput') && document.getElementById('dmMessageInput').offsetParent !== null) {
    inputElement = document.getElementById('dmMessageInput');
  }
  
  if (inputElement) {
    // Get cursor position
    const startPos = inputElement.selectionStart;
    const endPos = inputElement.selectionEnd;
    
    // Insert emoji at cursor position
    const text = inputElement.value;
    inputElement.value = text.substring(0, startPos) + emoji + text.substring(endPos);
    
    // Set cursor position after emoji
    inputElement.selectionStart = inputElement.selectionEnd = startPos + emoji.length;
    
    // Focus input
    inputElement.focus();
  }
  
  // Close emoji picker
  emojiPicker.remove();
}
