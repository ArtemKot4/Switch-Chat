class Desktop {
    public static getContent = (user: User) => {

        type buttonContent = {
            button: UI.UIButtonElement,
            icon: UI.UIImageElement
        };
        
        const createButton = (button_icon: string, x: number, y: number, onClick: (position, container) => void): buttonContent => {
            return {
                button:
                {
                    type: "button",
                    bitmap: "switch_button",
                    bitmap2: "switch_button_pressed",
                    scale: 5,
                    x,
                    y,
                    clicker: {
                        onClick
                    }
                },
                icon:
                {
                    type: "image",
                    bitmap: button_icon,
                    scale: 3,
                    x: x + x,
                    y: y - 10,
                    clicker: {
                        onClick
                    }
                }
            };
        };

        const button_local = createButton("chat_local_icon", 200, 50, (position, container) => ChatScrolling.draw(EChatType.LOCAL, user))
        const button_global = createButton("chat_global_icon", 600, 50, (position, container) => ChatScrolling.draw(EChatType.GLOBAL, user))

        return {
            drawing: [
                {
                    type: "background", color: android.graphics.Color.argb(0, 0, 0, 0)
                }
            ],
            elements: {
                button_local: button_local.button,
                button_local_icon: button_local.icon,
                button_global: button_global.button,
                button_global_icon: button_global.icon
            }
        } as UI.WindowContent;
    };

    public static UI = (() => {
        const window = new UI.Window();
        window.setBlockingBackground(true);
        window.setAsGameOverlay(true);
        window.setCloseOnBackPressed(true);

        return window;
    })();

    public static openFor(user: User) {
        this.UI.setContent(this.getContent(user));
        this.UI.open();
        ChatScrolling.open(EChatType.GLOBAL, user);
    };

};

Network.addServerPacket("packet.switch_chat.open", (client, data: {}) => {
    if(client) {
        const user = User.get(client.getPlayerUid());
        client.send("packet.switch_chat.open_with_user_data", {user});
    };
});

Network.addClientPacket("packet.switch_chat.open_with_user_data", (data: {user: User}) => {
    Desktop.openFor(data.user);
});