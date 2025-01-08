class KeyboardChat extends Keyboard {
    constructor(public user: User, public type: EChatType) {
        super(Translation.translate("switch_chat.typing"));

        this.func = (message_text: string) => {
            this.user.sendMessage(message_text, this.type);
        };
    };
}