class ChatSwitch {
    public static getContent = (user: User) => {

        const onClick = (type: EChatType) => {
            return () => {
                Desktop.changeCurrentChatType(type);
                ChatScrolling.draw(type, user);
                return;
            }
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
                button_local: ChatScrolling.getButtonSwitchContent(EChatType.LOCAL, 165, 20, onClick(EChatType.LOCAL)),
                button_global: ChatScrolling.getButtonSwitchContent(EChatType.GLOBAL, 465, 20, onClick(EChatType.GLOBAL)),
                button_shop: ChatScrolling.getButtonSwitchContent(EChatType.SHOP, 765, 20, onClick(EChatType.SHOP)),
            }  
        } as UI.WindowContent;
    };
    
    public static UI = (() => {
        const window = new UI.Window();
        window.setBlockingBackground(true);
        window.setAsGameOverlay(true);

        return window;
    })();
}