class ChatForm {
    public static UI: UI.Window = new UI.Window();
    public static defaultMessage: string = Translation.translate("switch_chat.typing");
    public static getContent(text: Nullable<string>, user: User): UI.WindowContent {
        const content = {
            location: {
                x: 200,
                y: 200 + ChatScrolling.HEIGHT + 130,
                width: 600,
                height: 50
            },
            drawing: [
                {
                    type: "background",
                    color: android.graphics.Color.argb(0, 0, 0, 0)
                },
                {
                    type: "frame",
                    bitmap: "chat_form",
                    width: 1000,
                    height: 60
                }
            ],
            elements: {
                form: {
                    type: "text",
                    text: (() => {
                        if(!ConfigManager.isEnabledForm) {
                            return ChatForm.defaultMessage;
                        };

                        let copy = "".concat(text || "");

                        if(typeof text === "string" && text.trim().length > 35) {
                            copy = text.slice(0, 34) + "...";
                        };

                        return text === null ? ChatForm.defaultMessage : copy
                    })(),
                    font: {
                        size: 25,
                        color: (() => {
                            if(text === null) {
                                return android.graphics.Color.argb(255, 31, 31, 31)
                            };
                            
                            if(ConfigManager.isEnabledForm) {
                                return android.graphics.Color.WHITE;
                            };  
                        })(),
                    },
                    clicker: {
                        onClick(position, vector) {
                            const keyboard = new Keyboard(Translation.translate("switch_chat.typing"));

                            keyboard.getText((text) => {

                                if(text.trim().length > 0) {
                                    ChatForm.setContent(text, user);
                                } else {
                                    ChatForm.setContent(null, user);
                                };

                            });

                            keyboard.open();
                        }
                    },
                    y: 15,
                    x: 15
                },
            }
        } satisfies UI.WindowContent;

        if(ConfigManager.isEnabledForm) {
            content.elements["send"] = {
                type: "button",
                x: 915,
                y: 13,
                bitmap: "chat_send_button",
                bitmap2: "chat_send_button_pressed",
                scale: 3.6,
                clicker: {
                    onClick(position, vector) {
                        if(text === null) { 
                            ChatForm.setContent(null, user);
                            return;
                        };
                        ChatManager.send(new Message(user, text), Desktop.currentChatType ?? EChatType.GLOBAL);
                        ChatForm.setContent(null, user);
                        return;
                    }
                }
            };
        } else if(text !== null) {
           ChatManager.send(new Message(user, text), Desktop.currentChatType ?? EChatType.GLOBAL);
        };

        return content;
    };

    public static setContent(text: Nullable<string>, user: User): void {
        this.UI.setContent(ChatForm.getContent(text, user));
        this.UI.forceRefresh();
    };

    public static open(user: User): void {
        this.setContent(null, user);
        this.UI.open();
    };

    public static close(): void {
        return this.UI.close();
    }
};

