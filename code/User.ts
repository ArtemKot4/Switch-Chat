enum EChatType {
    GLOBAL,
    LOCAL
};

class User {
    public static list: Map<string, User> = new Map();
    protected constructor(public name: string, public prefix?: string) {}
    public sendMessage(message: string, type: EChatType) {
        Chat.send(new Message(this.name, message), type);
    };

    public properties: Map<string, any> = new Map();

    public addProperty<T>(name: string, value: T) {
        this.properties.set(name, value);
    };

    public static has = (name: string): boolean => User.list.has(name); 
    public static get = (name: string): User => User.list.get(name);
    public static add = (name: string, prefix?: string): void => {
        if(!User.list.has(name)) {
            User.list.set(name, new User(name))
        };
    }
}