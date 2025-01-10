const getPlayerUidByName = (name: string) => {
    for(const i in Network.getConnectedPlayers()) {
        const id = Network.getConnectedPlayers()[i];
        if(Entity.getNameTag(Network.getConnectedPlayers()[i]) === name) return id;
    };
    return null; 
};

namespace ConfigManager {
    export const localMessageSpreading = __config__.getInteger("local_message_spreading") || 100;
    export const isEnabledForm = __config__.getBool("enable_submit_form") || false;
};

namespace Utils {
    export function separateText(text: string) {
        let result = [];
        let line = "";
    
        for (let word of text.split(" ")) {
            if (line.length + word.length <= 55) {
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

const enum EChatType {
    GLOBAL,
    LOCAL,
    SHOP
};

Translation.addTranslation("switch_chat.typing", {
    en: "Type message...",
    ru: "Введите сообщение..."
});

Translation.addTranslation("switch_chat.chat", {
    en: "Chat",
    ru: "Чат"
});

Translation.addTranslation("switch_chat.empty", {
    en: "No messages",
    ru: "Нет сообщений"
});

Translation.addTranslation("switch_chat.empty_chat", {
    en: "I guess, chat is empty. Press first message!",
    ru: "Кажется, тут пусто. Отправьте первое сообщение!"
})