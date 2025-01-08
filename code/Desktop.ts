class Desktop {
    public static currentChatType = EChatType.GLOBAL;

    public static getContent = (user: User) => {

        const createButton = (char: string, color: number, x: number, type: EChatType): UI.UITextElement => {
            return (
                {
                    type: "text",
                    x: x,
                    y: 20,
                    text: `[${char}]`,
                    font: {
                        size: 30,
                        color: color
                    },
                    clicker: {
                        onClick(position, container) {
                            Desktop.currentChatType = type;
                            ChatScrolling.draw(type, user);
                            return;
                        }
                    }
                }
            );
        };

        return {
            location: {
                x: 200,
                y: 25,
                width: 600,
                height: 50,
            },
            drawing: [
                {
                    type: "background", color: android.graphics.Color.argb(90, 0, 0, 0)
                }
            ],
            elements: {
                button_local: createButton("L", android.graphics.Color.LTGRAY, 145, EChatType.LOCAL),
                button_global: createButton("G", android.graphics.Color.YELLOW, 445, EChatType.GLOBAL),
                button_shop: createButton("S", android.graphics.Color.GREEN, 745, EChatType.SHOP),
            }  
        } as UI.WindowContent;
    };
    

    public static UI = (() => {
        const window = new UI.Window();
        window.setBlockingBackground(true);
        window.setAsGameOverlay(true);

        return window;
    })();

    public static openFor(user: User) {
        this.UI.setContent(this.getContent(user));
        this.UI.open();
        ChatScrolling.open(this.currentChatType, user);
        ChatForm.open(user);
    };

    public static close() {
        this.UI.close();
        ChatScrolling.UI.close();
        ChatForm.UI.close();
        ChatButton.open();
    };

    public static isCurrentChatType<T extends EChatType>(type: T): boolean {
        return this.currentChatType === type;
    };

};

/** Debug
 * 
 */

Callback.addCallback("NativeCommand", (command) => {
    if(command === "/globalchat") {
        Game.prevent();
        Network.sendToServer("test1", {})
    };

    if(command === "/localchat") {
        Game.prevent();
        Network.sendToServer("test2", {})
    };
})

Network.addServerPacket("test1", (client, data) => {
    const globalChat = ChatManager.getGlobal();

    if(globalChat.length <= 0) {
        client.sendMessage(Translation.translate("switch_chat.empty"));
    };

    for(const message of globalChat) {
        client.sendMessage(message.user.name + " " + message.message)
    };
})

Network.addServerPacket("test2", (client, data) => {
    const localChat = ChatManager.getLocal();

    if(localChat.length <= 0) {
        client.sendMessage(Translation.translate("switch_chat.empty"));
    };

    for(const message of localChat) {
        client.sendMessage(message.user.name + " " + message.message)
    };
});