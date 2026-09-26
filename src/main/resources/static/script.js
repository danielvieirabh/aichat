const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');
const chatContainer = document.getElementById('chat-container');
const sendButton = document.getElementById('send-button');
const sessionIdDisplay = document.getElementById('session-id-display');

const sessionId = 'ses_' + Math.random().toString(36).substr(2, 6);
if(sessionIdDisplay) sessionIdDisplay.textContent = sessionId;

// 1. Configura o Renderizador Customizado para criar o layout do bloco de código
const renderer = new marked.Renderer();

renderer.code = function(code, language) {
    const validLanguage = (language && hljs.getLanguage(language)) ? language : 'plaintext';
    const highlightedCode = hljs.highlight(code, { language: validLanguage }).value;
    const langDisplay = validLanguage === 'plaintext' ? 'CÓDIGO' : validLanguage.toUpperCase();

    // Retorna a estrutura HTML com Tailwind para o bloco de código e o botão de copiar
    return `
        <div class="code-block-wrapper my-4 rounded-xl overflow-hidden border border-slate-700 shadow-xl bg-[#0d1117]">
            <div class="flex justify-between items-center px-4 py-2 bg-slate-800/80 border-b border-slate-700/80">
                <span class="text-[11px] font-bold text-slate-400 tracking-wider font-mono">${langDisplay}</span>
                <button class="copy-btn flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors" type="button">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                    <span>Copiar código</span>
                </button>
            </div>
            <div class="p-4 overflow-x-auto custom-scrollbar">
                <pre class="!m-0 !p-0 bg-transparent"><code class="hljs ${validLanguage} !bg-transparent !p-0 text-[13px] font-mono leading-relaxed">${highlightedCode}</code></pre>
            </div>
        </div>
    `;
};

// Aplica as opções no Marked.js
marked.setOptions({
    renderer: renderer,
    breaks: true // Permite quebras de linha normais no texto
});

// 2. Lógica para o botão de "Copiar Código" (Event Delegation)
chatContainer.addEventListener('click', function(e) {
    const btn = e.target.closest('.copy-btn');
    if (!btn) return;

    const wrapper = btn.closest('.code-block-wrapper');
    const codeElement = wrapper.querySelector('code');
    const textToCopy = codeElement.textContent; // Pega o texto puro, sem as tags HTML do highlight

    navigator.clipboard.writeText(textToCopy).then(() => {
        const span = btn.querySelector('span');
        const svg = btn.querySelector('svg');
        const originalText = span.innerText;

        // Muda visualmente para dar feedback de sucesso
        span.innerText = 'Copiado!';
        svg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>';
        btn.classList.add('text-green-400');
        btn.classList.remove('text-slate-400');

        // Restaura após 2 segundos
        setTimeout(() => {
            span.innerText = originalText;
            svg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>';
            btn.classList.remove('text-green-400');
            btn.classList.add('text-slate-400');
        }, 2000);
    });
});

// 3. Ajuste de interface e envio
messageInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
    if(this.value === '') this.style.height = 'auto';
});

messageInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        chatForm.dispatchEvent(new Event('submit'));
    }
});

function appendMessage(content, role) {
    const isUser = role === 'USER';
    const div = document.createElement('div');
    div.className = `flex w-full message-enter ${isUser ? 'justify-end' : 'justify-start'}`;

    let formattedContent = '';

    if (isUser) {
        formattedContent = content
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\n/g, '<br>');

        div.innerHTML = `
            <div class="max-w-[85%] md:max-w-[75%] bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-5 py-3.5 rounded-2xl rounded-tr-sm shadow-md break-words">
                <p class="leading-relaxed text-[15px] font-light">${formattedContent}</p>
            </div>
        `;
    } else {
        // Renderiza o Markdown da IA
        const rawHtml = marked.parse(content);
        // Sanitiza protegendo contra XSS, mas mantendo nossas classes customizadas
        formattedContent = DOMPurify.sanitize(rawHtml, { ADD_CLASSES: true });

        div.innerHTML = `
            <div class="flex gap-3 max-w-[100%] md:max-w-[95%] w-full min-w-0">
                <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-lg shadow-indigo-500/20">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <div class="bg-panel/80 backdrop-blur-md border border-slate-700/50 text-slate-200 px-5 py-3.5 rounded-2xl rounded-tl-sm shadow-md w-full overflow-hidden">
                    <div class="leading-relaxed text-[15px] font-light markdown-body">${formattedContent}</div>
                </div>
            </div>
        `;
    }

    chatContainer.appendChild(div);
    scrollToBottom();
}

function showLoading() {
    const div = document.createElement('div');
    div.id = 'loading';
    div.className = 'flex w-full justify-start message-enter';
    div.innerHTML = `
        <div class="flex gap-3 max-w-[80%]">
            <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-600 text-slate-300 flex items-center justify-center flex-shrink-0 mt-1">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"></path></svg>
            </div>
            <div class="bg-panel/80 backdrop-blur-md border border-slate-700/50 px-5 py-4 rounded-2xl rounded-tl-sm shadow-md flex items-center">
                <div class="typing-indicator"><span></span><span></span><span></span></div>
            </div>
        </div>
    `;
    chatContainer.appendChild(div);
    scrollToBottom();
}

function scrollToBottom() {
    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: 'smooth' });
}

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = messageInput.value.trim();
    if (!message) return;

    const welcomeMsg = document.getElementById('welcome-message');
    if(welcomeMsg) welcomeMsg.remove();

    messageInput.value = '';
    messageInput.style.height = 'auto';
    messageInput.disabled = true;
    sendButton.disabled = true;

    appendMessage(message, 'USER');
    showLoading();

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, message })
        });

        const data = await res.json();
        document.getElementById('loading').remove();

        if(data.response) {
            appendMessage(data.response, 'ASSISTANT');
        }
    } catch (err) {
        document.getElementById('loading').remove();
        appendMessage('Desculpe, ocorreu um erro ao conectar com o servidor local.', 'ASSISTANT');
    } finally {
        messageInput.disabled = false;
        sendButton.disabled = false;
        messageInput.focus();
    }
});

async function loadHistory() {
    try {
        const res = await fetch(`/api/chat/${sessionId}`);
        const history = await res.json();

        if(history && history.length > 0) {
            const welcomeMsg = document.getElementById('welcome-message');
            if(welcomeMsg) welcomeMsg.remove();

            history.forEach(msg => appendMessage(msg.content, msg.role));
            scrollToBottom();
        }
    } catch (e) {
        console.log("Sessão nova iniciada.");
    }
}

loadHistory();