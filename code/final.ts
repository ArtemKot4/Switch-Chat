Callback.addCallback("ServerPlayerLoaded", (player) => {
    User.add(player);

    const user = User.get(player);

    Game.message(JSON.stringify(User.list));
    Game.message("user: " + JSON.stringify(user));

    user.sendMessage("Welcome to the server!", EChatType.GLOBAL);
    user.sendMessage("Welcome to the lobby!", EChatType.GLOBAL);
    user.sendMessage("Welcome to the chat!", EChatType.GLOBAL);
    user.sendMessage("Welcome to the world!", EChatType.GLOBAL);

    user.sendMessage("Welcome to the local! chat!", EChatType.LOCAL);

    Game.message("Локальные сообщения:" + JSON.stringify(ChatManager.get(EChatType.LOCAL)));
    Game.message("Глобальные сообщения:" + JSON.stringify(ChatManager.get(EChatType.GLOBAL)));
});

Callback.addCallback("NativeCommand", (command) => {
    if(command.startsWith("/")) return;
    Network.sendToServer("packet.switch_chat.send_message_from_default_chat", {message: command});
})

Network.addServerPacket("packet.switch_chat.send_message_from_default_chat", (client, data: {message: string}) => {
    if(!client) return;
    User.add(client.getPlayerUid()); 
    ChatManager.appendGlobal(new Message(User.get(client.getPlayerUid()), data.message));
    client.send("packet.switch_chat.update_global_chat", {chat: ChatManager.getGlobal()});
});
