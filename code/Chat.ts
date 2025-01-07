class ChatManager {
    private static messages = {
        global: [] as Message[],
        local: [] as Message[]
    };

    public static send(message: Message, type: EChatType) {
        if(type === EChatType.GLOBAL) {
            ChatManager.messages.global.push(message);
            Network.sendToAllClients("packet.switch_chat.update_global_chat", ChatManager.messages.global)
        } else {
            const playerUid = message.user.uuid;
            if(playerUid) {
                const pos = Entity.getPosition(playerUid);
                const source = BlockSource.getDefaultForActor(playerUid);
                const radius = ConfigManager.localMessageSpreading;
                const players = source.listEntitiesInAABB(pos.x - radius, pos.y - radius / 2, pos.z - radius, pos.x + radius, pos.y + radius / 2, pos.z + radius)
                .filter(v => Entity.getType(v) === Native.EntityType.PLAYER);

                if(!!players) {
                    for(const player of players) {
                        const client = Network.getClientForPlayer(player);
                        client && client.send("packet.switch_chat.update_local_chat", {message});
                    };
                };
            };
        };
    };

    public static appendGlobal(message: Message) {
        ChatManager.messages.global.push(message);
    };

    public static appendLocal(message: Message) {
        ChatManager.messages.local.push(message);
    };

    public static getGlobal() {
        return ChatManager.messages.global;
    };

    public static getLocal() {
        return ChatManager.messages.local;
    };

    public static setGlobal(chat: Message[]) {
        ChatManager.messages.global = chat;
    };

    public static get(type: EChatType): Message[] {
        return type === EChatType.GLOBAL ? ChatManager.getGlobal() : ChatManager.getLocal();
    };

};

Network.addClientPacket("packet.switch_chat.update_local_chat", (data: {message: Message}) => {
    ChatManager.appendLocal(data.message);
});

Network.addClientPacket("packet.switch_chat.update_global_chat", (data: {chat: Message[]}) => {
    ChatManager.setGlobal(data.chat);
});

class ChatButton {
    public static UI = (() => {
        const window = new UI.Window({
            location: {
                x: 0,
                y: 50,
                width: 100,
                height: 100
            },
            drawing: [
                {
                    type: "background",
                    color: android.graphics.Color.argb(0, 0, 0, 0),
                }
            ],
            elements: {
                button: {
                    type: "button",
                    x: 0,
                    y: 0,
                    bitmap: "chat_button",
                    bitmap2: "chat_button_pressed",
                    scale: 25,
                    clicker: {
                        onClick: ChatButton.onClick
                    }
                }
            }
        });
        window.setAsGameOverlay(true);
        return window;
    })();

    public static container: UI.Container = new UI.Container();

    public static onClick(position: Vector, container) {
        ChatButton.container.close();
        Network.sendToServer("packet.switch_chat.open", {});
    };
}

Callback.addCallback("NativeGuiChanged", function (screenName) {
    if (screenName == "in_game_play_screen") {
        if(!ChatButton.container.isOpened()) {
            ChatButton.container.openAs(ChatButton.UI);
        };
    } else {
        ChatButton.container.close();
    };
});

class ChatScrolling {
    public static UI: UI.Window = (() => new UI.Window(this.getContent()))();
    public static getContent = () => {
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
                    type: "background", color: android.graphics.Color.argb(191, 105, 105, 105)
                }
            ]
        } as UI.WindowContent;
    };

    public static draw(type: EChatType, user: User) {
        const messages = ChatManager.get(type);

        let content = {
            typing: {
                type: "button",
                scale: 1000,
                bitmap: "unknown",
                clicker: {
                    onClick(position, container) {
                        new Keyboard(Translation.translate("switch_chat.typing"))
                        .getText((text) => user.sendMessage(text, type))
                        .open();
                    }
                }
            }
        } as Record<string, UI.UITextElement | UI.UIButtonElement>;

        let height = 20;
        let index = 0;

        let lines = 0;

        for(const message of messages) {
            const user = message.user;
            const separatedText = Utils.separateMessage(message);
            const linesCount = separatedText.split("\n").length || 1;

            content[user.name + index] = {
                type: "text",
                x: 10,
                y: height,
                text: user.name + (user.prefix ? " " + user.prefix : ""),
                multiline: true
            } satisfies UI.UITextElement;

            content["message" + index] = {
                type: "text",
                x: 10 + ((user.name.length + (user.prefix ? 1 : 0) + user.prefix ? user.prefix.length : 0) * 5) + 10,
                y: height,
                text: separatedText,
                multiline: true
                
            } satisfies UI.UITextElement;

            index += 1;
            height += 20 + (linesCount * 10);
            lines += linesCount;
        };

        this.UI.content.elements = content;
        const count = ChatManager.get(type).length;
        
        this.updateScroll((lines * 10) + ((count - 1) * 10));
        this.update();
    };

    public static updateScroll(number: number) {
        this.UI.content.location.scrollY = 400 + number;
        this.UI.updateScrollDimensions();
    };

    public static update() {
        this.UI.forceRefresh();
    };

    public static open(type: EChatType, user: User) {
        this.draw(type, user);
        if(!this.UI.isOpened) this.UI.open();
    }
};

