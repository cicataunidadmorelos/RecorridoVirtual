const chatbotHTMLTemplate = `
    <div id="chatbot-container">
        <!-- Botón flotante al lado inferior izquierdo -->
        <div id="chatbot-trigger-container">
            <div class="help-bubble" id="help-bubble-text">¿Necesitas ayuda?</div>
            <button id="chatbot-toggle-btn" class="mascot-button">
                <img src="img/policarpio.png" alt="Mascota IPN" class="mascot-icon">
            </button>
        </div>

        <!-- Sidebar Principal (Ventana de Chat) -->
        <div id="chatbot-sidebar" class="sidebar-hidden">
            <div class="sidebar-header">
                <div class="header-info">
                    <span style="font-weight: bold; color: white;">Policarpio</span>
                </div>
                <div class="header-icons">
                    <span class="header-icon" id="sidebar-close-btn" style="cursor: pointer; font-size: 1.2rem;">✕</span>
                </div>
            </div>
            
            <div class="chat-messages" id="chat-messages">
                <!-- Los mensajes y opciones se inyectarán aquí dinámicamente -->
            </div>
        </div>
    </div>
`;

export default chatbotHTMLTemplate;