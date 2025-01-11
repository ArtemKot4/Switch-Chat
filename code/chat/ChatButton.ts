class ChatButton {
    public static UI = (() => {
        const window = new UI.Window({
            location: {
                x: UI.getScreenHeight() / 1.25,
                y: 1,
                width: 70,
                height: 70
            },
            drawing: [
                {
                    type: "background",
                    color: android.graphics.Color.argb(0, 0, 0, 0)
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

    public static onClick(position: Vector, container: UI.Container): void {
        ChatButton.container.close();
        Network.sendToServer("packet.switch_chat.open", {});
    };

    public static open(): void {
        if(!this.container.isOpened()) {
            this.container.openAs(ChatButton.UI);
        };
    }
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

Network.addServerPacket("packet.switch_chat.open", (client, data: {}) => {
    if(client) {
        User.add(client.getPlayerUid());
        const user = User.get(client.getPlayerUid());
        client.send("packet.switch_chat.open_with_user_data", {user});
    };
});

Network.addClientPacket("packet.switch_chat.open_with_user_data", (data: {user: User}) => {
    Desktop.openFor(data.user);
});