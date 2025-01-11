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
    export const isSpecialMixedChat = __config__.getBool("enable_special_options_mixed_chat") || false;
};

namespace Utils {

    export const shopSigns: string[] = ["₽","₿","¢","¥","€","$","£","?"];
    export const shopKeywords: string[] = ["buy", "sell", "куплю", "продам"]

    export function separateText(text: string, radius: number) {
        let result = [];
        let line = "";
    
        for (let word of text.split(" ")) {
            if (line.length + word.length <= radius) {
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
    SHOP,
    MIXED
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
});
