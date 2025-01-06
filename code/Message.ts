class Message {
    constructor(public userUUID: number, public message: string) {
        this.setParams();
    };

    public metadata!: Map<string, any>;

    public addMetadata<T>(key: string, value: T) {
        this.metadata = new Map();
        this.metadata.set(key, value);
    };

    public setParams() {
        const links = [];
        const hashtags = [];

        for(const word of this.message.split(" ")) {
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

        !!links && this.addMetadata("links", links);
        !!hashtags && this.addMetadata("hashtags", hashtags);
    };
}