class Desktop {
    public static currentChatType = EChatType.GLOBAL;

    public static openFor(user: User) {
        ChatSwitch.UI.setContent(ChatSwitch.getContent(user));
        ChatSwitch.UI.open();
        ChatScrolling.open(this.currentChatType, user);
        ChatForm.open(user);
        ChatUser.open(user);
    };

    public static isOpened() {
        return (ChatSwitch.UI.isOpened() && ChatScrolling.UI.isOpened() && ChatForm.UI.isOpened() && ChatUser.UI.isOpened());
    }

    public static close() {
        ChatSwitch.UI.close();
        ChatScrolling.UI.close();
        ChatForm.UI.close();
        ChatUser.UI.close();
        ChatButton.open();
    };

    public static isCurrentChatType<T extends EChatType>(type: T): boolean {
        return this.currentChatType === type;
    };

    public static changeCurrentChatType(type: EChatType) {
        this.currentChatType = type;
    }

};

/** Debug
 * 
 */

Callback.addCallback("NativeCommand", (command) => {
    if(command === "/globalchat") {
        Game.prevent();
        Network.sendToServer("packet.switch_chat.global_chat_command_getter", {})
    };

    if(command === "/localchat") {
        Game.prevent();
        for(const message of ChatManager.getLocal()) {
            Game.message(message.user.name + " " + message.message)
        };
    };
})

Network.addServerPacket("packet.switch_chat.global_chat_command_getter", (client, data) => {
    const globalChat = ChatManager.getGlobal();

    if(globalChat.length <= 0) {
        client.sendMessage(Translation.translate("switch_chat.empty"));
    };

    for(const message of globalChat) {
        client.sendMessage(message.user.name + " " + message.message)
    };
})
