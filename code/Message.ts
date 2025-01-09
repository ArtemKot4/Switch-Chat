class Message {
    constructor(public user: User, public message: string) {
        Message.setParams(this);
    };

    public metadata: Record<string, any> = {};

    public static addMetadata<T>(message: Message, key: string, value: T) {
        message.metadata[key] = value;
    };

    public static setParams(message: Message) {
        const links = [];
        const hashtags = [];

        for(const word of message.message.split(" ")) {
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

        !!links && Message.addMetadata(message, "links", links);
        !!hashtags && Message.addMetadata(message, "hashtags", hashtags);
    };

    public static isDeleted(message: Message): boolean {
        return (message.metadata && message.message["deleted"]) ?? false;
    }
}