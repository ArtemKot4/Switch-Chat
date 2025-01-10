class ChatNotification {
    public static UI: UI.Window = new UI.Window();
    public static timer = 5;
    public static isActive = true;
    public static alpha = 1;
    public static messages: Message[] = [];

    public static getContent(user: User, message: Message, type: EChatType): UI.WindowContent {

        if(this.messages.length >= 20) {
            this.messages = [];
        };

        this.messages.push(message);

        const content = {
            location: {
                x: 0,
                y: 0,
                width: 400,
                height: 0,
            },
            drawing: [
                {
                    type: "background", color: android.graphics.Color.argb(128, 0, 0, 0)
                }
            ],
            elements: {}
        } satisfies UI.WindowContent;

        let height = 20;

        for(const i in this.messages) {
            const current_message = this.messages[i];
            const separatedText = Utils.separateText(current_message.message, 40);
            const linesCount = separatedText.split("\n").length || 1;
            const messageContent = ChatScrolling.getMessageContent(current_message, current_message.user, {
                y: height,
                type_button: {
                    type,
                    x: 600,
                    y: height,
                    scale: 20
                }
            });

            content.elements["name_" + i] = messageContent.message;

            if(messageContent.prefix) {
                content.elements["prefix_" + i] = messageContent.prefix;
            };
            
            content.elements["message_" + i] = messageContent.message;

            content.elements["type_" + i] = messageContent.type_button;

            height += 30 + (linesCount * 20);
        };

        content.location.height = height;

        return content;
    };

    public static setAnimation() {
        if(this.isActive) {
            return;
        };

        this.isActive = true;

        Threading.initThread("thread.switch_chat.chat_notification_timer", () => {
            while(true) {
                if(this.timer > 0) {
                    java.lang.Thread.sleep(1000);
                    this.timer--;
                };

                if(!this.isActive || !this.UI.isOpened()) {
                    this.UI.layout.setAlpha(1)
                    return;
                };

                if(this.timer <= 0 && this.alpha >= 0) {
                    java.lang.Thread.sleep(2);
                    this.UI.layout.setAlpha(this.alpha -= 0.5);

                    if(this.alpha <= 0) {
                        this.isActive = false;
                        this.UI.layout.setAlpha(1);
                        this.UI.close();
                        this.timer = 5;
                        this.alpha = 1;
                        return;
                    };
                };
            };
        });

    };

    public static open(user: User, message: Message, type: EChatType) {
        if(Desktop.isOpened()) {
            return;
        };

        if(!this.UI.isOpened()) {
            this.UI.open();
        }

        this.UI.setContent(this.getContent(user, message, type));
        this.UI.updateWindowLocation();
        this.UI.forceRefresh();

        this.UI.layout.setAlpha(1);
        this.alpha = 1;
        this.setAnimation();
    };

};