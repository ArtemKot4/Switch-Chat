class Chat {
    public static messages = {
        global: [] as Message[],
        local: [] as Message[]
    };

    public static send(message: Message, type: EChatType) {
        if(type === EChatType.GLOBAL) {
            Chat.messages.global.push(message);
            Network.sendToAllClients("packet.switch_chat.update_global_chat", Chat.messages.global)
        } else {
            const playerUid = message.userUUID;
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
                    }
                }
            };
        }
    };

}

Network.addClientPacket("packet.switch_chat.update_local_chat", (data: {message: Message}) => {
    Chat.messages.local.push(data.message);
});

Network.addClientPacket("packet.switch_chat.update_global_chat", (data: {chat: Message[]}) => {
    Chat.messages.global = data.chat;
});

class ChatButton {
    public static UI = (() => {
        const window = new UI.Window({
            location: {
                x: 23,
                y: UI.getScreenHeight() + 10,
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
