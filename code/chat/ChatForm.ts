class ChatForm {
    public static UI: UI.Window = new UI.Window();
    public static getContent(text: Nullable<string>, user: User): UI.WindowContent {
        return {
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
                    width: 1100,
                    height: 60
                }
            ],
            elements: {
                form: {
                    type: "text",
                    text: (() => {
                        if(text && text.length > 20) {
                            text = text.slice(0, 19) + "...";
                        };
                        return text || Translation.translate("switch_chat.typing")
                    })(),
                    font: {
                        size: 25,
                        color: text && text.length > 0 ? android.graphics.Color.WHITE : android.graphics.Color.argb(255, 31, 31, 31)
                    },
                    clicker: {
                        onClick: (position, vector) => {
                            new Keyboard(Translation.translate("switch_chat.typing"))
                            .getText((text) => {
                                ChatForm.setContent(text, user);
                            })
                            .open();
                        }
                    },
                    y: 10,
                    x: 20
                },
                send: {
                    type: "button",
                    x: 840,
                    y: 15,
                    bitmap: "chat_send_button",
                    bitmap2: "chat_send_button_pressed",
                    scale: 3.5,
                    clicker: {
                        onClick: (position, vector) => {
                            if(!text) {
                                return;
                            };
                            Game.message(text) //todo: debug;
                            user.sendMessage(text, Desktop.currentChatType || EChatType.GLOBAL);
                            this.setContent(null, user);
                            return;
                        }
                    }
                }
            }
        }
    };

    public static setContent(text: Nullable<string>, user: User) {
        this.UI.setContent(ChatForm.getContent(text, user));
        this.UI.forceRefresh();
    };

    public static open(user: User) {
        this.setContent(null, user);
        this.UI.open();
    };
};