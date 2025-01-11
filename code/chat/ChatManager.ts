class ChatManager {
    private static messages = {
        global: [] as Message[],
        local: [] as Message[],
        shop: [] as Message[],
        mixed: [] as Message[]
    };

    public static send(message: Message, type: EChatType): void {
        switch(type) {
            case EChatType.GLOBAL: {
                return Network.sendToServer("packet.switch_chat.update_global_chat_server", { message: message });
            };

            case EChatType.LOCAL: {
                return Network.sendToServer("packet.switch_chat.update_local_chat_server", { message: message}); 
            };

            case EChatType.SHOP: {
                return Network.sendToServer("packet.switch_chat.update_shop_chat_server", {message: message});
            };
               
            case EChatType.MIXED: {
                if(ConfigManager.isSpecialMixedChat && message.message.length > 1) {
                    if(this.hasImportantSign(message)) {
                        return Network.sendToServer("packet.switch_chat.update_global_chat_server", {
                            message: {
                                ...message,
                                message: message.message.slice(1)
                            }
                        });
                    };
                    
                    const hasShopSign = this.hasShopSign(message);

                    if(hasShopSign || this.hasShopKeyword(message)) {
                        return Network.sendToServer("packet.switch_chat.update_shop_chat_server", {
                            message: {
                                ...message,
                                message: hasShopSign ? message.message.slice(1) : message.message
                            }
                        });
                    };

                    if(this.hasLocalSign(message)) {
                        return Network.sendToServer("packet.switch_chat.update_local_chat_server", {
                            message: {
                                ...message,
                                message: message.message.slice(1)
                            }
                        });
                    };
                }   

                return Network.sendToServer("packet.switch_chat.update_mixed_chat_server", {
                    message: message
                });
            };  
        };
    };

    public static hasLocalSign(message: Message): boolean {
        return message.message.startsWith(">");
    };

    public static hasImportantSign(message: Message): boolean {
        return message.message.startsWith("!");
    };

    public static hasShopSign(message: Message): boolean {
        for(const i in Utils.shopSigns) {
            if(message.message.startsWith(Utils.shopSigns[i])) {
                return true;
            }
        };
        return false;
    };

    public static hasShopKeyword(message: Message): boolean {
        for(const i in Utils.shopKeywords) {
            if(message.message.includes(Utils.shopKeywords[i])) {
                return true;
            }
        };
        return false;
    };

    public static appendGlobal(message: Message): void {
        ChatManager.messages.global.push(message);
    };

    public static appendLocal(message: Message): void {
        ChatManager.messages.local.push(message);
    };

    public static appendMixed(message: Message, type: EChatType): void {
        let copy = new Message(message.user, message.message);
        Message.addMetadata(copy, "type", type);

        ChatManager.messages.mixed.push(copy);
    }

    public static appendShop(message: Message): void {
        ChatManager.messages.shop.push(message);
    };

    public static getGlobal(): Message[] {
        return ChatManager.messages.global;
    };

    public static getLocal(): Message[] {
        return ChatManager.messages.local;
    };

    public static getMixed(): Message[] {
        return ChatManager.messages.mixed;
    }

    public static getShop(): Message[] {
        return ChatManager.messages.shop;
    }

    public static setLocal(chat: Message[]) {
        ChatManager.messages.local = chat;
    };

    public static setGlobal(chat: Message[]) {
        ChatManager.messages.global = chat;
    };

    public static setShop(chat: Message[]) {
        ChatManager.messages.shop = chat;
    };

    public static set(type: EChatType, chat: Message[]): void {
        switch(type) {
            case EChatType.GLOBAL: {
                return ChatManager.setGlobal(chat);
            };

            case EChatType.LOCAL: {
                return ChatManager.setLocal(chat);
            };

            case EChatType.SHOP: {
                return ChatManager.setShop(chat);
            };
        };
    };

    public static delete(index: number, type: EChatType): Message[] {
        const chat = ChatManager.get(type);

        chat.splice(index, 1);
        return chat;
    };

    public static get(type: EChatType): Message[] {
        switch(type) {
            case EChatType.GLOBAL: {
                return ChatManager.getGlobal();
            };
                
            case EChatType.LOCAL: {
                return ChatManager.getLocal();
            };
               
            case EChatType.MIXED: {
                return ChatManager.getMixed();
            };

            case EChatType.SHOP: {
                return ChatManager.getShop();
            };
        };
    };

};


Network.addServerPacket("packet.switch_chat.update_global_chat_server", (client, data: { message: Message }) => {
    Message.setParams(data.message);
    ChatManager.appendGlobal(data.message);
    Network.sendToAllClients("packet.switch_chat.update_global_chat_client", {chat: ChatManager.getGlobal(), user: User.get(client.getPlayerUid()) });
    return;
});

Network.addServerPacket("packet.switch_chat.update_local_chat_server", (client, data: { message: Message }) => {
    if(!client) return;

    const playerUid = client.getPlayerUid()
    
    const pos = Entity.getPosition(playerUid);
    const source = BlockSource.getDefaultForActor(playerUid);
    const radius = ConfigManager.localMessageSpreading;
    const players = source.listEntitiesInAABB(pos.x - radius, pos.y - radius / 2, pos.z - radius, pos.x + radius, pos.y + radius / 2, pos.z + radius, EEntityType.PLAYER, false)
    .filter(v => Entity.getType(v) === Native.EntityType.PLAYER) || [playerUid];

    if(!!players) {
        Message.setParams(data.message);
        for(const player of players) {
            const newClient = Network.getClientForPlayer(player);
            newClient && newClient.send("packet.switch_chat.update_local_chat_client", { message: data.message, user: User.get(playerUid) });
        };
    };
    return;
});

Network.addServerPacket("packet.switch_chat.update_shop_chat_server", (client, data: {message: Message}) => {
    Message.setParams(data.message);
    ChatManager.appendShop(data.message);
    Network.sendToAllClients("packet.switch_chat.update_shop_chat_client", {chat: ChatManager.getShop(), user: User.get(client.getPlayerUid()) });
    return;
});

Network.addServerPacket("packet.switch_chat.update_mixed_chat_server", (client, data: {message: Message}) => {
    Network.sendToAllClients("packet.switch_chat.update_mixed_chat_client", {message: data.message, user: User.get(client.getPlayerUid()) });
    return;
});


Network.addClientPacket("packet.switch_chat.update_local_chat_client", (data: {message: Message, user: User }) => {
    ChatManager.appendMixed(data.message, EChatType.LOCAL);
    ChatManager.appendLocal(data.message);
    ChatScrolling.refresh(EChatType.LOCAL, data.user);
    return;
});

Network.addClientPacket("packet.switch_chat.update_global_chat_client", (data: {chat: Message[], user: User }) => {
    ChatManager.appendMixed(data.chat[data.chat.length - 1], EChatType.GLOBAL);
    ChatManager.setGlobal(data.chat);
    ChatScrolling.refresh(EChatType.GLOBAL, data.user);
    return;
});

Network.addClientPacket("packet.switch_chat.update_shop_chat_client", (data: {chat: Message[], user: User }) => {
    ChatManager.appendMixed(data.chat[data.chat.length - 1], EChatType.SHOP);
    ChatManager.setShop(data.chat);
    ChatScrolling.refresh(EChatType.SHOP, data.user);
    return;
});

Network.addClientPacket("packet.switch_chat.update_mixed_chat_client", (data: {message: Message, user: User }) => {
    ChatManager.appendMixed(data.message, EChatType.MIXED);
    ChatScrolling.refresh(EChatType.MIXED, data.user);
    return;
});