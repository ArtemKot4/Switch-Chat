class ChatSwitch {
    public static getContent = (user: User) => {
        const isSwitch = ConfigManager.isEnabledSwitch;

        const onClick = (type: EChatType) => {
            return () => {
                Desktop.changeCurrentChatType(type);
                ChatScrolling.draw(user, type);
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
                ...(isSwitch && {
                    button_local: ChatScrolling.getButtonSwitchElement({
                        type:  EChatType.LOCAL,
                        x: 165,
                        y: 20,
                        scale: 30
                    }, onClick(EChatType.LOCAL)),
                    button_global: ChatScrolling.getButtonSwitchElement({
                        type: EChatType.GLOBAL,
                        x: 365,
                        y: 20,
                        scale: 30
                    }, onClick(EChatType.GLOBAL)),
                    button_shop: ChatScrolling.getButtonSwitchElement({
                        type: EChatType.SHOP,
                        x: 565,
                        y: 20,
                        scale: 30
                    }, onClick(EChatType.SHOP)),
                }),
                button_mixed: ChatScrolling.getButtonSwitchElement({
                    type: EChatType.MIXED,
                    x: isSwitch ? 765 : 465,
                    y: 20,
                    scale: 30
                }, onClick(EChatType.MIXED))
            }  
        } as UI.WindowContent;
    };
    
    public static UI = (() => {
        const window = new UI.Window();
        window.setBlockingBackground(true);
        window.setAsGameOverlay(true);

        return window;
    })();

    public static open(user: User): void {
        this.UI.setContent(this.getContent(user));
        this.UI.forceRefresh();

        return this.UI.open();
    };

    public static close(): void {
        return ChatSwitch.UI.close();
    }
}