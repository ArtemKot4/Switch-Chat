class Message {
    constructor(public user: User, public message: string) {};

    public metadata: Record<string, any> = {};

    public static addMetadata<T>(message: Message, key: string, value: T) {
        message.metadata[key] = value;
    };

    public static setParams(message: Message) {
        const word_array = message.message.split(" ");

        const links = [];
        const hashtags = [];
        
        for(const i in word_array) {
            const word = word_array[i];
            if(word.length <= 1) continue;

            if(word.startsWith("@")) {
                const userName = word.slice(1);

                if(User.has(userName)) {
                    links.push(userName)
                }

            } else if(word.startsWith("#")) {
                const hashtag = word.slice(1);
                hashtags.push(hashtag);
            }
        };

        if(!!links) Message.addMetadata(message, "links", links);
        if(!!hashtags) Message.addMetadata(message, "hashtags", hashtags);
    };

    public static isDeleted(message: Message): boolean {
        return Message.getMetadata(message, "deleted") ?? false
    };

    public static getMetadata<T>(message: Message, key: string): Nullable<T> {
        return (message.metadata && message.metadata[key]) ?? null;
    }
};
