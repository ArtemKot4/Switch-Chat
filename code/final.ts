Callback.addCallback("ServerPlayerLoaded", (playerUid) => {
    User.add(playerUid);

    const client = Network.getClientForPlayer(playerUid);

    if(client) {
        client.send("packet.switch_chat.update_global_chat_client", {chat: ChatManager.getGlobal()});
        client.send("packet.switch_chat.update_shop_chat_client", {chat: ChatManager.getShop()});

        const modifiedUsers = [].concat(User.getList()).map((v: User) => {
            v.chatList = {[playerUid]: []};
            return v;
        });

        client.send("packet.switch_chat.set_user_list", {users: modifiedUsers});
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
    users: User[]
}) => {
    User.setList(data.users);
});