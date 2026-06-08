import chatbotData from './chatbotData.js';

const chatbotSidebar = {
    isSidebarOpen: false,

    init() {
        this.sidebar = document.getElementById("chatbot-sidebar");
        this.toggleBtn = document.getElementById("chatbot-toggle-btn");
        this.helpBubble = document.getElementById("help-bubble-text");
        this.chatMessages = document.getElementById("chat-messages");
        this.closeBtn = document.getElementById("sidebar-close-btn");

        if (this.toggleBtn) {
            this.toggleBtn.onclick = () => {
                this.isSidebarOpen = !this.isSidebarOpen;
                if (this.isSidebarOpen) {
                    this.sidebar.classList.remove("sidebar-hidden");
                    if (this.helpBubble) this.helpBubble.style.display = 'none';
                    this.startWelcomeFlow();
                }
                else {
                    this.sidebar.classList.add("sidebar-hidden");
                    if (this.helpBubble) this.helpBubble.style.display = 'block';
                }
            };
        }

        if (this.closeBtn) {
            this.closeBtn.onclick = () => {
                this.isSidebarOpen = false;
                this.sidebar.classList.add("sidebar-hidden");
                if (this.helpBubble) this.helpBubble.style.display = 'block';
            };
        }
    },

    startWelcomeFlow() {
        this.chatMessages.innerHTML = ""; // Limpiar chat previo

        // Simular que el bot está escribiendo
        this.showTypingIndicator();

        setTimeout(() => {
            this.hideTypingIndicator();
            this.addBotMessage("¡Hola! Soy Policarpio, tu asesor virtual.");

            this.showTypingIndicator();
            setTimeout(() => {
                this.hideTypingIndicator();
                this.addBotMessage("¿En qué puedo ayudarte hoy? Selecciona una de las siguientes opciones:");
                this.addBotOptions([
                    { text: "🏢 Lista de habitaciones", action: () => this.handleHabitaciones() },
                    { text: "❓ Preguntas Frecuentes", action: () => this.handleFAQ() },
                    { text: "🌐 Página Oficial", action: () => this.handlePaginaOficial() },
                    { text: "📍 Ubicación", action: () => this.handlePopUp("ubicacion") },
                    { text: "📞 Contactos", action: () => this.handlePopUp("contactos") }
                ]);
            }, 400);
        }, 400);
    },

    showTypingIndicator() {
        const indicator = document.createElement("div");
        indicator.className = "bot-message typing-indicator";
        indicator.id = "typing-indicator";
        indicator.innerHTML = `<span></span><span></span><span></span>`;
        this.chatMessages.appendChild(indicator);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    },

    hideTypingIndicator() {
        const indicator = document.getElementById("typing-indicator");
        if (indicator) indicator.remove();
    },

    addBotMessage(text) {
        const msg = document.createElement("div");
        msg.className = "bot-message";
        // Allow HTML tags and preserve newlines using <br> if there are newlines outside tags
        msg.innerHTML = text.replace(/\n/g, '<br>');
        this.chatMessages.appendChild(msg);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    },

    addUserMessage(text) {
        const msg = document.createElement("div");
        msg.className = "user-message";
        msg.innerText = text;
        this.chatMessages.appendChild(msg);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    },

    addBotOptions(options, showUserMsg = true) {
        const container = document.createElement("div");
        container.className = "bot-message options-container";

        options.forEach(opt => {
            const btn = document.createElement("button");
            btn.className = "option-button";
            btn.innerText = opt.text;
            btn.onclick = () => {
                if (showUserMsg) this.addUserMessage(opt.text);
                opt.action();
            };
            container.appendChild(btn);
        });

        this.chatMessages.appendChild(container);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    },

    handlePopUp(key) {
        const data = chatbotData[key];
        if (data) {
            this.showTypingIndicator();
            setTimeout(() => {
                this.hideTypingIndicator();
                this.addBotMessage(`${data.title}:\n${data.answer}`);
                this.addReturnOption(); // Llamada inmediata tras el mensaje
            }, 400);
        }
    },

    handleHabitaciones() {
        this.showTypingIndicator();
        setTimeout(() => {
            this.hideTypingIndicator();
            this.addBotMessage("Estas son las áreas disponibles en el recorrido. Haz clic en una para teletransportarte:");

            const scenes = (window.APP_DATA && window.APP_DATA.scenes) ? window.APP_DATA.scenes : [];
            const sceneFloorMap = window.SCENE_FLOOR_MAP || {};
            const floorOrder = ["floor-0", "floor-1", "floor-2"];
            const groupedScenes = floorOrder.reduce((groups, floor) => {
                groups[floor] = [];
                return groups;
            }, {});
            groupedScenes["unknown"] = [];

            scenes.forEach(scene => {
                const floor = sceneFloorMap[scene.id] || "unknown";
                const option = {
                    text: `🏢 ${scene.name}`,
                    action: () => {
                        const nativo = document.querySelector('#sceneList .scene[data-id="' + scene.id + '"]');
                        if (nativo) nativo.click();
                    }
                };

                if (groupedScenes[floor]) {
                    groupedScenes[floor].push(option);
                } else {
                    groupedScenes.unknown.push(option);
                }
            });

            floorOrder.forEach(floor => {
                if (!groupedScenes[floor].length) return;
                this.addBotMessage(`--- ${this.getFloorLabel(floor)} ---`);
                this.addBotOptions(groupedScenes[floor]);
            });

            if (groupedScenes.unknown.length) {
                this.addBotMessage("--- Otras áreas ---");
                this.addBotOptions(groupedScenes.unknown);
            }

            this.addReturnOption(); // Llamada inmediata tras las opciones
        }, 400);
    },

    getFloorLabel(floor) {
        if (floor === "floor-0") return "Exterior/Semisótano";
        if (floor === "floor-1") return "Planta Baja";
        if (floor === "floor-2") return "Planta Alta";
        return "Sin piso";
    },

    handleFAQ() {
        this.showTypingIndicator();
        setTimeout(() => {
            this.hideTypingIndicator();
            this.addBotMessage("Selecciona una pregunta para ver la respuesta:");

            const options = chatbotData.faqData.map((faq, index) => ({
                text: `❓ ${faq.title}`,
                action: () => {
                    this.showTypingIndicator();
                    setTimeout(() => {
                        this.hideTypingIndicator();
                        this.addBotMessage(faq.answer);
                        this.addReturnOption(); // Llamada inmediata tras la respuesta
                    }, 400);
                }
            }));

            this.addBotOptions(options);
            this.addReturnOption(); // Llamada inmediata tras el menú de preguntas
        }, 400);
    },

    handlePaginaOficial() {
        this.showTypingIndicator();
        setTimeout(() => {
            this.hideTypingIndicator();
            this.addBotMessage(`<b>Sitio web:</b>\n 🌐 Descubre más sobre nosotros visitando:\n<a href="https://www.cicatamorelos.ipn.mx" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: underline;">https://www.cicatamorelos.ipn.mx/</a>`);
            this.addReturnOption();
        }, 400);
    },

    addReturnOption() {
        // Se eliminó el setTimeout interno para que aparezca junto al mensaje anterior
        this.addBotOptions([
            { text: "⬅️ Volver al menú principal", action: () => this.startWelcomeFlow() }
        ], false);
    }
};

export default chatbotSidebar;
