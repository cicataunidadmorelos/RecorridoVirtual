import chatbotHTMLTemplate from './chatbotHTMLTemplate.js';
import chatbotSidebar from './chatbotSidebar.js';

const chatbotManager = {
    injectHTML() {
        document.body.insertAdjacentHTML('beforeend', chatbotHTMLTemplate);
    },
    init() {
        this.injectHTML();
        chatbotSidebar.init();
    }
};

document.addEventListener("DOMContentLoaded", () => {
    chatbotManager.init();
});

export default chatbotManager;
