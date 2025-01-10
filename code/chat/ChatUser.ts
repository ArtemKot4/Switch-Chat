class ChatUser {
    public static HEIGHT: number = 100;
    public static UI: UI.Window = new UI.Window();
    public static getContent(user: User): UI.WindowContent {
        return {
            location: {
                x: 800,
                y: 25,
                width: 100,
                height: this.HEIGHT,
                scrollY: this.HEIGHT + 50,
                forceScrollY: true,
            },
            drawing: [
                {
                    type: "background", color: android.graphics.Color.argb(70, 0, 0, 0)
                },
                {
                    type: "frame",
                    bitmap: "chat_form",
                    width: 500,
                    height: 60,
                    y: 40
                },
                {
                    type: "frame",
                    bitmap: "chat_form",
                    width: 500,
                    height: 60,
                    y: 140
                },
                {
                    type: "frame",
                    bitmap: "chat_form",
                    width: 500,
                    height: 60,
                    y: 240
                }
            ]
        }
    };

    public static open(user: User) {
        this.UI.setContent(this.getContent(user));
        this.UI.updateScrollDimensions();
        this.UI.forceRefresh();
        this.UI.open();
    }
}