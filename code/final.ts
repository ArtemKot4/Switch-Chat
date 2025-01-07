Callback.addCallback("ServerPlayerLoaded", (player) => {
    User.add(player);
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
