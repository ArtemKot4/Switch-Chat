const getPlayerUidByName = (name: string) => {
    for(const i in Network.getConnectedPlayers()) {
        const id = Network.getConnectedPlayers()[i];
        if(Entity.getNameTag(Network.getConnectedPlayers()[i]) === name) return id;
    };
    return null; 
};

namespace ConfigManager {
    export const localMessageSpreading = __config__.getInteger("local_message_spreading") || 100;
};

namespace Utils {
    export function separateMessage(message: Message) {
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
};

enum EChatType {
    GLOBAL,
    LOCAL
};

Translation.addTranslation("switch_chat.typing", {
    en: "Type your message here",
    ru: "Введите сообщение"
});