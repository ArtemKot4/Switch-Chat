class Desktop {
    public static currentChatType = EChatType.GLOBAL;

    public static getContent = (user: User) => {

        const createButton = (bitmap: string, x: number, y: number, type: EChatType): UI.UIButtonElement => {
            return (
                {
                    type: "button",
                    bitmap: bitmap,
                    scale: 3.3,
                    x: x,
                    y: y,
                    clicker: {
                        onClick: (position, container) => {
                            this.currentChatType = type;
                            ChatScrolling.draw(type, user);
                        }
                    }
                }
            );
        };

        return {
            drawing: [
                {
                    type: "background", color: android.graphics.Color.argb(0, 0, 0, 0)
                }
            ],
            elements: {
                button_local: createButton("switch_local", 220, 15, EChatType.LOCAL),
                button_global: createButton("switch_global", 500, 15, EChatType.GLOBAL)
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