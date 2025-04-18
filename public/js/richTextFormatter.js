// public/js/richTextFormatter.js

/**
 * Rich text formatting module
 * Provides functionality for formatting text with markdown-like syntax
 */

/**
 * Initialize rich text formatting
 * @param {Object} socket - Socket.io socket
 */
export function initRichTextFormatter(socket) {
  // Add toolbar to text input areas
  addFormattingToolbar();
  
  // Add event listeners for formatting buttons
  document.addEventListener('click', (e) => {
    // Bold button
    if (e.target.closest('.format-bold-btn')) {
      const inputElement = getActiveInput();
      if (inputElement) {
        applyFormatting(inputElement, '**', '**');
      }
    }
    
    // Italic button
    if (e.target.closest('.format-italic-btn')) {
      const inputElement = getActiveInput();
      if (inputElement) {
        applyFormatting(inputElement, '*', '*');
      }
    }
    
    // Underline button
    if (e.target.closest('.format-underline-btn')) {
      const inputElement = getActiveInput();
      if (inputElement) {
        applyFormatting(inputElement, '__', '__');
      }
    }
    
    // Strikethrough button
    if (e.target.closest('.format-strikethrough-btn')) {
      const inputElement = getActiveInput();
      if (inputElement) {
        applyFormatting(inputElement, '~~', '~~');
      }
    }
    
    // Code button
    if (e.target.closest('.format-code-btn')) {
      const inputElement = getActiveInput();
      if (inputElement) {
        applyFormatting(inputElement, '`', '`');
      }
    }
    
    // Code block button
    if (e.target.closest('.format-codeblock-btn')) {
      const inputElement = getActiveInput();
      if (inputElement) {
        applyFormatting(inputElement, '```\n', '\n```');
      }
    }
  });
  
  // Add event listeners for keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Only process if Ctrl key is pressed
    if (!e.ctrlKey) return;
    
    const inputElement = getActiveInput();
    if (!inputElement) return;
    
    // Ctrl+B: Bold
    if (e.key === 'b') {
      e.preventDefault();
      applyFormatting(inputElement, '**', '**');
    }
    
    // Ctrl+I: Italic
    if (e.key === 'i') {
      e.preventDefault();
      applyFormatting(inputElement, '*', '*');
    }
    
    // Ctrl+U: Underline
    if (e.key === 'u') {
      e.preventDefault();
      applyFormatting(inputElement, '__', '__');
    }
    
    // Ctrl+E: Strikethrough (since Ctrl+S is save)
    if (e.key === 'e') {
      e.preventDefault();
      applyFormatting(inputElement, '~~', '~~');
    }
    
    // Ctrl+K: Code
    if (e.key === 'k') {
      e.preventDefault();
      applyFormatting(inputElement, '`', '`');
    }
  });
}

/**
 * Add formatting toolbar to text input areas
 */
function addFormattingToolbar() {
  // Add toolbar to text channel input
  const textChannelInput = document.querySelector('#textChatInputBar');
  if (textChannelInput) {
    const toolbar = createFormattingToolbar();
    textChannelInput.insertBefore(toolbar, textChannelInput.firstChild);
  }
  
  // Add toolbar to DM input
  const dmInput = document.querySelector('#dmChatInputBar');
  if (dmInput) {
    const toolbar = createFormattingToolbar();
    dmInput.insertBefore(toolbar, dmInput.firstChild);
  }
}

/**
 * Create formatting toolbar element
 * @returns {HTMLElement} Toolbar element
 */
function createFormattingToolbar() {
  const toolbar = document.createElement('div');
  toolbar.className = 'formatting-toolbar';
  toolbar.innerHTML = `
    <button class="format-bold-btn" title="Kalın (Ctrl+B)">
      <span class="material-icons">format_bold</span>
    </button>
    <button class="format-italic-btn" title="İtalik (Ctrl+I)">
      <span class="material-icons">format_italic</span>
    </button>
    <button class="format-underline-btn" title="Altı Çizili (Ctrl+U)">
      <span class="material-icons">format_underlined</span>
    </button>
    <button class="format-strikethrough-btn" title="Üstü Çizili (Ctrl+E)">
      <span class="material-icons">strikethrough_s</span>
    </button>
    <button class="format-code-btn" title="Kod (Ctrl+K)">
      <span class="material-icons">code</span>
    </button>
    <button class="format-codeblock-btn" title="Kod Bloğu">
      <span class="material-icons">data_object</span>
    </button>
  `;
  return toolbar;
}

/**
 * Get the currently active input element
 * @returns {HTMLElement|null} Active input element or null
 */
function getActiveInput() {
  // Check if text channel input is focused
  const textChannelInput = document.querySelector('#textChannelMessageInput');
  if (textChannelInput && document.activeElement === textChannelInput) {
    return textChannelInput;
  }
  
  // Check if DM input is focused
  const dmInput = document.querySelector('#dmMessageInput');
  if (dmInput && document.activeElement === dmInput) {
    return dmInput;
  }
  
  // Check if edit message textarea is focused
  const editTextarea = document.querySelector('.edit-message-textarea');
  if (editTextarea && document.activeElement === editTextarea) {
    return editTextarea;
  }
  
  return null;
}

/**
 * Apply formatting to selected text or insert formatting markers
 * @param {HTMLElement} inputElement - Input element
 * @param {string} startMarker - Start formatting marker
 * @param {string} endMarker - End formatting marker
 */
function applyFormatting(inputElement, startMarker, endMarker) {
  const start = inputElement.selectionStart;
  const end = inputElement.selectionEnd;
  const text = inputElement.value;
  
  // If text is selected, wrap it with formatting markers
  if (start !== end) {
    const selectedText = text.substring(start, end);
    const newText = text.substring(0, start) + startMarker + selectedText + endMarker + text.substring(end);
    inputElement.value = newText;
    inputElement.selectionStart = start + startMarker.length;
    inputElement.selectionEnd = end + startMarker.length;
  } else {
    // If no text is selected, insert formatting markers and place cursor between them
    const newText = text.substring(0, start) + startMarker + endMarker + text.substring(end);
    inputElement.value = newText;
    inputElement.selectionStart = start + startMarker.length;
    inputElement.selectionEnd = start + startMarker.length;
  }
  
  // Focus the input element
  inputElement.focus();
}

/**
 * Process text with markdown-like formatting
 * @param {string} text - Text to process
 * @returns {string} Processed HTML
 */
export function processText(text) {
  if (!text) return '';
  
  // Escape HTML to prevent XSS
  let processed = escapeHtml(text);
  
  // Process code blocks first (to avoid formatting inside code blocks)
  processed = processed.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  
  // Process inline code
  processed = processed.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Process bold text
  processed = processed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // Process italic text
  processed = processed.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  
  // Process underlined text
  processed = processed.replace(/__([^_]+)__/g, '<u>$1</u>');
  
  // Process strikethrough text
  processed = processed.replace(/~~([^~]+)~~/g, '<s>$1</s>');
  
  // Process URLs
  processed = processed.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
  
  // Process line breaks
  processed = processed.replace(/\n/g, '<br>');
  
  return processed;
}

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
