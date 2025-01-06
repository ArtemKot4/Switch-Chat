class Chat {
    public static messages = {
        global: [] as Message[],
        local: [] as Message[]
    };

    public static send(message: Message, type: EChatType) {
        if(type === EChatType.GLOBAL) {
            Chat.messages.global.push(message);
            Network.sendToAllClients("packet.switch_chat.update_global_chat", Chat.messages.global)
        } else {
            const playerUid = getPlayerUidByName(message.user);
            if(playerUid) {
                const pos = Entity.getPosition(playerUid);
                const source = BlockSource.getDefaultForActor(playerUid);
                const radius = ConfigManager.localMessageSpreading;
                const players = source.listEntitiesInAABB(pos.x - radius, pos.y - radius / 2, pos.z - radius, pos.x + radius, pos.y + radius / 2, pos.z + radius)
                .filter(v => Entity.getType(v) === Native.EntityType.PLAYER);

                if(!!players) {
                    for(const player of players) {
                        Network.getClientForPlayer(player).send("packet.switch_chat.update_global_chat", {message});
                    }
                }
            };
        }
    };

    

}

Network.addClientPacket("packet.switch_chat.update_local_chat", (data: {message: Message}) => {
    Chat.messages.local.push(data.message);
});

Network.addClientPacket("packet.switch_chat.update_global_chat", (data: {chat: Message[]}) => {
    Chat.messages.global = data.chat;
});

