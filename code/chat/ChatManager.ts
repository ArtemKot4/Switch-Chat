class ChatManager {
    private static messages = {
        global: [] as Message[],
        local: [] as Message[],
        shop: [] as Message[]
    };

    public static send(message: Message, type: EChatType) {
        Game.message("клиенты: " + Network.getConnectedClients());

        if(type === EChatType.GLOBAL) {
            Network.sendToServer("packet.switch_chat.update_global_chat_server", { message: message });
        } else if(type === EChatType.LOCAL) {
            Network.sendToServer("packet.switch_chat.update_local_chat_server", {playerUid: message.user.uuid, message: message});
        } else {
            Network.sendToServer("packet.switch_chat.update_shop_chat_server", {message: message});
        };
        return;
    };

    public static appendGlobal(message: Message) {
        ChatManager.messages.global.push(message);
    };

    public static appendLocal(message: Message) {
        ChatManager.messages.local.push(message);
    };

    public static appendShop(message: Message) {
        ChatManager.messages.shop.push(message);
    };

    public static getGlobal() {
        return ChatManager.messages.global;
    };

    public static getLocal() {
        return ChatManager.messages.local;
    };

    public static getShop() {
        return ChatManager.messages.shop;
    }

    public static setGlobal(chat: Message[]) {
        ChatManager.messages.global = chat;
    };

    public static setShop(chat: Message[]) {
        ChatManager.messages.shop = chat;
    };

    public static get(type: EChatType): Message[] {
        switch(type) {
            case EChatType.GLOBAL:
                return ChatManager.getGlobal();
            case EChatType.LOCAL:
                return ChatManager.getLocal();
            case EChatType.SHOP:
                return ChatManager.getShop();
        }
    };

};


Network.addServerPacket("packet.switch_chat.update_global_chat_server", (client, data: {message: Message}) => {
    client.sendMessage("долетел local server")

    ChatManager.appendGlobal(data.message);
    return Network.sendToAllClients("packet.switch_chat.update_global_chat_client", {chat: ChatManager.getGlobal()});
});

Network.addServerPacket("packet.switch_chat.update_local_chat_server", (client, data: {playerUid: number, message: Message}) => {
    client.sendMessage("долетел global server")

    const pos = Entity.getPosition(data.playerUid);
    const source = BlockSource.getDefaultForActor(data.playerUid);
    const radius = ConfigManager.localMessageSpreading;
    const players = source.listEntitiesInAABB(pos.x - radius, pos.y - radius / 2, pos.z - radius, pos.x + radius, pos.y + radius / 2, pos.z + radius, EEntityType.PLAYER, false)
    .filter(v => Entity.getType(v) === Native.EntityType.PLAYER) || [client.getPlayerUid()];

    if(!!players) {
        for(const player of players) {
            const newClient = Network.getClientForPlayer(player);
            newClient && newClient.send("packet.switch_chat.update_local_chat_client", {message: data.message});
        };
    };
    return;
});

Network.addServerPacket("packet.switch_chat.update_shop_chat_server", (client, data: {message: Message}) => {
    client.sendMessage("долетел local server")

    ChatManager.appendShop(data.message);
    return Network.sendToAllClients("packet.switch_chat.update_shop_chat_client", {chat: ChatManager.getShop()});
});

Network.addClientPacket("packet.switch_chat.update_local_chat_client", (data: {message: Message}) => {
    alert("Я локал долетел!")
    ChatManager.appendLocal(data.message);
    ChatScrolling.refresh(EChatType.LOCAL);
    return;
});

Network.addClientPacket("packet.switch_chat.update_global_chat_client", (data: {chat: Message[]}) => {
    alert("Я сервер долетел!")
    ChatManager.setGlobal(data.chat);
    ChatScrolling.refresh(EChatType.GLOBAL);
    return;
});

Network.addClientPacket("packet.switch_chat.update_shop_chat_client", (data: {chat: Message[]}) => {
    alert("Я сервер долетел!")
    ChatManager.setShop(data.chat);
    ChatScrolling.refresh(EChatType.SHOP);
    return;
});