interface IDefaultChatWindow {
    UI: UI.Window;
    open(user: User, type: EChatType): void;
    close(): void;
};

class Desktop {
    public static UIList: Record<string, IDefaultChatWindow> = {};

    public static setUI(name: string, ui: IDefaultChatWindow): void {
        Desktop.UIList[name] = ui;
    };

    public static replaceUI(name: string, ui: IDefaultChatWindow): void {
        Desktop.UIList[name] = ui;
    };

    public static deleteUI(name: string): void {
        delete Desktop.UIList[name];
    };

    public static currentChatType = EChatType.MIXED;

    public static openFor(user: User): void {
        Object.values(Desktop.UIList).forEach((v) => v.open(user, this.currentChatType));
        //ChatUser.open(user);
    };

    public static isOpened(): boolean {
        return (Object.values(Desktop.UIList).every((v) => v.UI.isOpened()) //&& ChatUser.UI.isOpened()
        );
    }

    public static close(): void {
        Object.values(Desktop.UIList).forEach((v) => v.close());
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
        super(EChatType.MIXED, "mixedchat");
    };
};

new GlobalChatShowCommand();
new ShopChatShowCommand();
new LocalChatShareCommand();
new MixedChatShareCommand();

Callback.addCallback("LevelDisplayed", () => {
    
    Desktop.setUI("chat_switch", ChatSwitch);
    Desktop.setUI("chat_scrolling", ChatScrolling);
    Desktop.setUI("chat_form", ChatForm);
});


Game.message = function(message: string): void {
    ChatManager.appendLocal(new Message(User.get(-1), message));
    ChatScrolling.refresh(Desktop.currentChatType, User.get(Player.get()));

    return Game.message(message);
};
