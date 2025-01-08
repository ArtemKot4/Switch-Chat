class ChatManager {
    private static messages = {
        global: [] as Message[],
        local: [] as Message[]
    };

    public static send(message: Message, type: EChatType) {
        Game.message("клиенты: " + Network.getConnectedClients());

        if(type === EChatType.GLOBAL) {
            Network.sendToServer("packet.switch_chat.update_global_chat_server", { message: message });
        } else {
            Network.sendToServer("packet.switch_chat.update_local_chat_server", {playerUid: message.user.uuid, message: message});
        };
        ChatScrolling.refresh(type);
        return;
    };

    public static appendGlobal(message: Message) {
        ChatManager.messages.global.push(message);
    };

    public static appendLocal(message: Message) {
        ChatManager.messages.local.push(message);
    };

    public static getGlobal() {
        return ChatManager.messages.global;
    };

    public static getLocal() {
        return ChatManager.messages.local;
    };

    public static setGlobal(chat: Message[]) {
        ChatManager.messages.global = chat;
    };

    public static get(type: EChatType): Message[] {
        return (type === EChatType.GLOBAL) ? ChatManager.getGlobal() : ChatManager.getLocal();
    };

};

Network.addServerPacket("packet.switch_chat.update_global_chat_server", (client, data: {message: Message}) => {
    Network.sendServerMessage("долетел local server")

    ChatManager.appendGlobal(data.message);
    return Network.sendToAllClients("packet.switch_chat.update_global_chat", {chat: ChatManager.getGlobal()});
});

Network.addServerPacket("packet.switch_chat.update_local_chat_server", (client, data: {playerUid: number, message: Message}) => {
    Network.sendServerMessage("долетел global server")

    const pos = Entity.getPosition(data.playerUid);
    const source = BlockSource.getDefaultForActor(data.playerUid);
    const radius = ConfigManager.localMessageSpreading;
    const players = source.listEntitiesInAABB(pos.x - radius, pos.y - radius / 2, pos.z - radius, pos.x + radius, pos.y + radius / 2, pos.z + radius, EEntityType.PLAYER, false)
    .filter(v => Entity.getType(v) === Native.EntityType.PLAYER) || [client.getPlayerUid()];

    if(!!players) {
        for(const player of players) {
            const client = Network.getClientForPlayer(player);
            client && client.send("packet.switch_chat.update_local_chat", {message: data.message});
        };
    };
    return;
})

Network.addClientPacket("packet.switch_chat.update_local_chat", (data: {message: Message}) => {
    alert("Я локал долетел!")
    ChatManager.appendLocal(data.message);

    ChatScrolling.refresh(EChatType.GLOBAL);
    return;
});

Network.addClientPacket("packet.switch_chat.update_global_chat", (data: {chat: Message[]}) => {
    alert("Я сервер долетел!")
    ChatManager.setGlobal(data.chat);
    ChatScrolling.refresh(EChatType.GLOBAL);
    return;
});