
const { ipcRenderer } = require('electron');

document.getElementById('openFile').addEventListener('click', async () => {
    console.log("open file dialog browser");
    const content = await ipcRenderer.invoke('open-file-dialog');
    if (content !== null) {
        document.getElementById('content').value = content;
        alert('File read successfully!');

    }
});

document.getElementById('saveFile').addEventListener('click', async () => {
    console.log("open file dialog browser");
    const content = document.getElementById('content').value;
    const success = await ipcRenderer.invoke('save-file-dialog', content);
    if (success) {
        alert('File saved successfully!');
    } else {
        alert('File saving canceled.');
    }
});

// const elecAPI = window.electronAPI;
// elecAPI.onPasteText((text) => {
//     const sourceText = document.getElementById('text');
//     sourceText.value = text;
// });

document.getElementById('saveButton').addEventListener('click', async () => {
    const textInput = document.getElementById('textInput').value;
    await ipcRenderer.invoke('save-text', textInput);
    updateMessages();
});

async function updateMessages() {
    const messages = await ipcRenderer.invoke('get-text');
    const messagesContainer = document.getElementById('messages');
    messagesContainer.innerHTML = '';
    messages.forEach(message => {
        const p = document.createElement('p');
        p.textContent = message;
        messagesContainer.appendChild(p);
    });
}

// 初期表示時にメッセージをロード
updateMessages();