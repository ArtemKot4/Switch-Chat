class Desktop {
    public static currentChatType = EChatType.MIXED;

    public static openFor(user: User): void {
        ChatSwitch.UI.setContent(ChatSwitch.getContent(user));
        ChatSwitch.UI.open();
        ChatScrolling.open(this.currentChatType, user);
        ChatForm.open(user);
        //ChatUser.open(user);
    };

    public static isOpened(): boolean {
        return (ChatSwitch.UI.isOpened() && ChatScrolling.UI.isOpened() && ChatForm.UI.isOpened() //&& ChatUser.UI.isOpened()
        );
    }

    public static close(): void {
        ChatSwitch.UI.close();
        ChatScrolling.UI.close();
        ChatForm.UI.close();
        //ChatUser.UI.close();
        ChatButton.open();
    };

    public static isCurrentChatType<T extends EChatType>(type: T): boolean {
        return this.currentChatType === type;
    };

    public static changeCurrentChatType(type: EChatType): void {
        this.currentChatType = type;
    }

};

interface ICommonChatCommandProps {
    chat: Message[]
}

abstract class ServerChatShareCommand extends ServerCommand<ICommonChatCommandProps> {
    public constructor(public type: EChatType, caller: string) {
        super(caller);
    };

    public override onServer(client: NetworkClient): void {
        for(const message of ChatManager.get(this.type)) {
            this.sendMessageToClient(client, `<${message.user.name}> ${message.message}`);
        };
    };

};

abstract class ClientChatShareCommand extends ClientCommand<ICommonChatCommandProps> {
    public constructor(public type: EChatType, caller: string) {
        super(caller);
    };

    public override onCall(): void {
        for(const message of ChatManager.get(this.type)) {
            Game.message(`<${message.user.name}> ${message.message}`);
        };
    };
}

class GlobalChatShowCommand extends ServerChatShareCommand {
    public constructor() {
        super(EChatType.GLOBAL, "globalchat");
    }
};

class ShopChatShowCommand extends ServerChatShareCommand {
    public constructor() {
        super(EChatType.SHOP, "shopchat");
    };
};

class LocalChatShareCommand  extends ClientChatShareCommand {
    public constructor() {
        super(EChatType.LOCAL, "localchat");
    };
};

class MixedChatShareCommand  extends ClientChatShareCommand {
    public constructor() {
        super(EChatType.LOCAL, "localchat");
    };
};

new GlobalChatShowCommand();
new ShopChatShowCommand();
new LocalChatShareCommand();
new MixedChatShareCommand();