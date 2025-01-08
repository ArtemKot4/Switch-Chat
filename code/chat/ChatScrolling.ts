class ChatScrolling {
    public static readonly HEIGHT = 370;
    public static readonly UI: UI.Window = new UI.Window();
    public static getContent = (elements?: UI.ElementSet, scroll: number = 0) => {
        return {
            location: {
                x: 200,
                y: 75,
                width: 600,
                height: this.HEIGHT,
                scrollY: this.HEIGHT + 50 + scroll,
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

        let headerParams = {
            color: android.graphics.Color.WHITE,
            char: "NONE"
        }

        switch(type) {
            case EChatType.GLOBAL:
                headerParams.color = android.graphics.Color.YELLOW;
                headerParams.char = "G";
                break;
            case EChatType.LOCAL:
                headerParams.color = android.graphics.Color.LTGRAY;
                headerParams.char = "L";
                break;
            case EChatType.SHOP:
                headerParams.color = android.graphics.Color.GREEN;
                headerParams.char = "S";
                break;
        }

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
                    onClick: (position, container) => Desktop.close()
                }
            },
            chat_type: {
                type: "text",
                x: (translatedChat.length * 20) + 35,
                y: 10,
                font: {
                    size: 30,
                    color: headerParams.color
                },
                text: `[${headerParams.char}]`
            }
        } as Record<string, UI.UITextElement | UI.UIButtonElement>;

        if(messages && messages.length < 0) {
            this.update(content, 0);
            return;
        };

        let height = 80;
        let scroll = 0;

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
            scroll += 30 + (linesCount * 20);
        };

        this.UI.content.elements = content;
        const count = ChatManager.get(type)?.length || 1;

        this.update(content, scroll);
        return;
    };



    public static update(elements: UI.ElementSet, scroll: number) {
        this.UI.setContent(this.getContent(elements, scroll));
        this.UI.updateScrollDimensions();
        this.UI.forceRefresh();
        return;
    };

    public static open(type: EChatType, user: User) {
        this.draw(type, user);
        if(!this.UI.isOpened()) {
            this.UI.open();
        }
        return;
    };

    public static refresh(type: EChatType = Desktop.currentChatType) {
        if(ChatScrolling.UI.isOpened() && Desktop.isCurrentChatType(type)) {
            return ChatScrolling.draw(type, User.get(Player.getLocal()));
        };
    }

    static {
        this.UI.setContent(this.getContent());
    }
};

