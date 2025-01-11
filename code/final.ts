Callback.addCallback("ServerPlayerLoaded", (playerUid) => {
    User.add(playerUid);

    const client = Network.getClientForPlayer(playerUid);

    if(client) {
        client.send("packet.switch_chat.update_global_chat_client", {chat: ChatManager.getGlobal()});
        client.send("packet.switch_chat.update_shop_chat_client", {chat: ChatManager.getShop()});

        const users = {...User.getList()};

        if(Object.keys(users).length > 1) {
            for(const i in users) {
                const user = users[i];

                user.chatList = {[user.uuid]: user.chatList[playerUid] || []};
            };
        };

        client.send("packet.switch_chat.set_user_list", {users: users});
    };

});

// Callback.addCallback("NativeCommand", (command) => {
//     if(command.startsWith("/")) return;
//     Network.sendToServer("packet.switch_chat.send_message_from_default_chat", {message: command});
// })

// Network.addServerPacket("packet.switch_chat.send_message_from_default_chat", (client, data: {message: string}) => {
//     if(!client) return;
//     User.add(client.getPlayerUid()); 
//     ChatManager.appendGlobal(new Message(User.get(client.getPlayerUid()), data.message));
//     client.send("packet.switch_chat.update_global_chat", {chat: ChatManager.getGlobal()});
// });

Network.addClientPacket("packet.switch_chat.set_user_list", (data: {
    users: Record<number, User>
}) => {
    User.setList(data.users);
});