const socket = io();

// Uchovávání uživatelských informací
let users = JSON.parse(localStorage.getItem('users')) || {};

// Funkce pro odeslání zprávy mezi uživatelem a Draukoo
function sendMessage(from, to, message) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message');
    
    if (from === 'user') {
        messageDiv.classList.add('user2');
    } else if (from === 'draukoo') {
        messageDiv.classList.add('user1');
    }


    document.getElementById('chat-messages').appendChild(messageDiv);
    document.getElementById('chat-messages').scrollTop = document.getElementById('chat-messages').scrollHeight; // Auto-scroll na novou zprávu
}

// Funkce pro registraci
document.getElementById('register-button').addEventListener('click', () => {
    const username = document.getElementById('username-input').value;
    const password = document.getElementById('register-password').value;

    if (username && password) {
        // Kontrola, zda jméno již není použité
        if (users[username]) {
            alert('Toto uživatelské jméno již existuje!');
            return;
        }
        users[username] = password;
        localStorage.setItem('users', JSON.stringify(users)); // Uložení do localStorage
        alert('Úspěšně registrováno!');
    } else {
        alert('Prosím, vyplňte všechny údaje!');
    }
});

// Funkce pro přihlášení
document.getElementById('login-button').addEventListener('click', () => {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('password-input').value;

    if (users[username] && users[username] === password) {
        alert('Přihlášení úspěšné!');
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('chat-container').style.display = 'block';

        // Povolení odesílání zpráv
        document.getElementById('message-input').disabled = false;
        document.getElementById('send-message-button').disabled = false;

        // Povolení odesílání zpráv Draukoo
        if (username.toLowerCase() === 'draukoo') {
            document.getElementById('target-username').style.display = 'block';
            document.getElementById('send-to-user-button').style.display = 'block';
        }

        // Odeslání uživatelského jména pro identifikaci
        socket.emit("set username", username);
    } else {
        alert('Chybné uživatelské jméno nebo heslo!');
    }
});

// Odesílání zprávy pro normálního uživatele (pouze Draukoo)
document.getElementById('send-message-button').addEventListener('click', () => {
    const messageInput = document.getElementById('message-input');
    const messageText = messageInput.value;
    const username = document.getElementById('login-username').value;

    if (messageText) {
        // Zobrazí zprávu a odešle zprávu na server
        sendMessage('user', 'draukoo', messageText);
        socket.emit("chat message", { text: messageText, targetUsername: 'Draukoo' });
        messageInput.value = ''; // Vymazání inputu po odeslání
    }
});

// Odesílání zprávy konkrétnímu uživateli Draukoo (pouze pro Draukoo)
document.getElementById('send-to-user-button').addEventListener('click', () => {
    const messageInput = document.getElementById('message-input');
    const targetUsername = document.getElementById('target-username').value;
    const messageText = messageInput.value;
    const username = document.getElementById('login-username').value;

    if (messageText && targetUsername) {
        sendMessage('draukoo', targetUsername, messageText);  // Zobrazí zprávu od Draukoo
        socket.emit("chat message", { text: messageText, targetUsername: targetUsername });
        messageInput.value = '';  // Vymazání inputu po odeslání
    }
});

// Poslouchání zpráv z serveru a zobrazení zpráv
socket.on('chat message', (data) => {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message');
    
    // Zobrazení zprávy podle odesílatele
    if (data.targetUsername === 'Draukoo') {
        messageDiv.innerHTML = `<strong>${data.username}:</strong> ${data.text}`;
        document.getElementById('chat-messages').appendChild(messageDiv);
    } else {
        messageDiv.innerHTML = `<strong>${data.username}:</strong> ${data.text}`;
        document.getElementById('chat-messages').appendChild(messageDiv);
    }
    document.getElementById('chat-messages').scrollTop = document.getElementById('chat-messages').scrollHeight; // Auto-scroll na novou zprávu
});
