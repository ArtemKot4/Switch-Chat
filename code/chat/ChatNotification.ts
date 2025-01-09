class ChatNotification {
    public static getContent(user: User, message: Message, type: EChatType): UI.WindowContent {
        const separatedText = Utils.separateMessage(message);
        const linesCount = separatedText.split("\n").length || 1;

        const messageContent = ChatScrolling.genMessageContent(20, type, message, user);

        return {
            location: {
                x: 0,
                y: 0,
                width: 400,
                height: 20 + (linesCount * 25),
            },
            drawing: [
                {
                    type: "background", color: android.graphics.Color.argb(128, 0, 0, 0)
                }
            ],
            elements: {
                ...messageContent,
                type: {
                    type: "button",

                }
            }
        };


    }
}