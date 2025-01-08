class ChatScrolling {
    public static UI: UI.Window = new UI.Window()
    public static getContent = (elements?: UI.ElementSet) => {
        return {
            location: {
                x: 200,
                y: 200,
                width: 600,
                height: 400,
                scrollY: 400 + 50,
                forceScrollY: true
            },
            drawing: [
                {
                    type: "background", color: android.graphics.Color.argb(128, 0, 0, 0)
                }
            ],
            elements: elements || {}
        } as UI.WindowContent;
    };

    public static draw(type: EChatType, user: User) {
        const messages = ChatManager.get(type);

        let translatedChat = Translation.translate("switch_chat.chat");
        const isGlobalChat = Desktop.isCurrentChatType(EChatType.GLOBAL);

        let content = {
            chat: {
                type: "text",
                x: 20,
                y: 10,
                text: translatedChat,
                font: {
                    size: 30
                },
                clicker: {
                    onClick: (position, container) => new KeyboardChat(user, type).open()
                }
            },
            chat_type: {
                type: "text",
                x: (translatedChat.length * 20) + 35,
                y: 10,
                font: {
                    size: 30,
                    color: (() => {
                        const globalColor = android.graphics.Color.YELLOW;
                        const localColor = android.graphics.Color.LTGRAY;

                        return isGlobalChat ? globalColor : localColor;
                    })()
                },
                text: isGlobalChat ? "[G]" : "[L]"
            }
        } as Record<string, UI.UITextElement | UI.UIButtonElement>;

        if(messages && messages.length < 0) {
            this.updateScroll(50);
            this.update(content);
            return;
        };

        let height = 80;
        let lines = 0;

        for(const i in messages) {
            const message = messages[i];

            const user = message.user;
            const separatedText = Utils.separateMessage(message);
            const linesCount = separatedText.split("\n").length || 1;

            content[user.name + i] = {
                type: "text",
                x: 20,
                y: height,
                text: `<${user.name}>` + (user.prefix ? " " + user.prefix : "")
            } satisfies UI.UITextElement;

            content["message" + i] = {
                type: "text",
                x: ((user.name + 2 + (user?.prefix || "")).length * 15) + 30,
                y: height,
                text: separatedText,
                font: {
                    color: android.graphics.Color.LTGRAY,
                },
                multiline: true
            } satisfies UI.UITextElement;

            height += 30 + (linesCount * 20);
            lines += linesCount;
        };

        this.UI.content.elements = content;
        const count = ChatManager.get(type)?.length || 1;
        
        this.updateScroll((lines * 10) + ((count - 1) * 10));
        this.update(content);
        return;
    };

    public static updateScroll(number: number) {
        this.UI.content.location.scrollY = 400 + number;
        this.UI.updateScrollDimensions();
        return;
    };

    public static update(elements: UI.ElementSet) {
        alert("Я обновился! -> " + JSON.stringify(this.UI.content));
        this.UI.setContent(this.getContent(elements));
        this.UI.forceRefresh();
        return;
    };

    public static open(type: EChatType, user: User) {
        this.draw(type, user);
        if(!this.UI.isOpened()) this.UI.open();
        return;
    };

    static {
        this.UI.setContent(this.getContent());
        this.UI.setCloseOnBackPressed(true);
    }
};

