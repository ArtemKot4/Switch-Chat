class ChatScrolling {
    public static UI: UI.Window = new UI.Window()
    public static getContent = () => {
        return {
            location: {
                x: 200,
                y: 200,
                width: 600,
                height: 400,
                scrollY: 400 + 100,
                forceScrollY: true
            },
            drawing: [
                {
                    type: "background", color: android.graphics.Color.argb(128, 0, 0, 0)
                }
            ]
        } as UI.WindowContent;
    };

    public static draw(type: EChatType, user: User) {
        const messages = ChatManager.get(type);

        if(messages && messages.length < 0) {
            return;
        };

        let content = {
            chat: {
                type: "text",
                x: 10,
                y: 10,
                text: Translation.translate("switch_chat.chat"),
                clicker: {
                    onClick: (position, container) => new KeyboardChat(user, type).open()
                }
            },
            chat1: {
                type: "text",
                x: 210,
                y: 210,
                text: Translation.translate("switch_chat.chat") + "210",
                clicker: {
                    onClick: (position, container) => new KeyboardChat(user, type).open()
                } //TODO: DEBUG
            }
        } as Record<string, UI.UITextElement | UI.UIButtonElement>;

        let height = 40;
        let lines = 0;

        for(const i in messages) {
            const message = messages[i];

            const user = message.user;
            const separatedText = Utils.separateMessage(message);
            const linesCount = separatedText.split("\n").length || 1;

            content[user.name + i] = {
                type: "text",
                x: 10,
                y: height,
                text: user.name + (user.prefix ? " " + user.prefix : ""),
                multiline: true
            } satisfies UI.UITextElement;

            content["message" + i] = {
                type: "text",
                x: 10 + ((user.name.length + (user.prefix ? 1 : 0) + user.prefix ? user.prefix.length : 0) * 5) + 10,
                y: height,
                text: separatedText,
                multiline: true
                
            } satisfies UI.UITextElement;

            height += 20 + (linesCount * 10);
            lines += linesCount;
        };

        this.UI.content.elements = content;
        const count = ChatManager.get(type)?.length || 1;
        
        this.updateScroll((lines * 10) + ((count - 1) * 10));
        this.update();
        return;
    };

    public static updateScroll(number: number) {
        this.UI.content.location.scrollY = 400 + number;
        this.UI.updateScrollDimensions();
        return;
    };

    public static update() {
        alert("Я обновился! -> " + JSON.stringify(this.UI.content));
        return this.UI.forceRefresh();
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

