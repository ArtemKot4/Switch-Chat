class Desktop {
    public static getContent = () => {
        return {
            drawing: [
                {
                    type: "frame", bitmap: "unknown"
                }
            ]
        } as UI.WindowContent;
    };

    public static UI = (() => {
       const window = new UI.Window(Desktop.getContent());
       window.setBlockingBackground(true);
       window.setAsGameOverlay(true);
       window.setCloseOnBackPressed(true);
       return window;
    })();

    public static separateMessage(message: Message) {
        let result = [];
        let line = "";
    
        for (let word of message.message.split(" ")) {
            if (line.length + word.length <= 25) {
                line += word + " ";
            } else {
                result.push(line.trim());
                line = word + " ";
            }
        }
    
        if (line) {
            result.push(line.trim());
        }
    
        return result.join("\n");
    };

    public static openFor(user: User) {
    }
};

Network.addServerPacket("packet.switch_chat.open", (client, data: {}) => {
    if(client) {
        const user = User.get(client.getPlayerUid());
        client.send("packet.switch_chat.open_with_user_data", {user});
    }
});

Network.addClientPacket("packet.switch_chat.open_with_user_data", (data: {user: User}) => {
    Desktop.openFor(data.user)
})