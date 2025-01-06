enum EChatType {
    GLOBAL,
    LOCAL
};

class User {
    public static list: Map<number, User> = new Map();
    protected constructor(public uuid: number, public name: string = Entity.getTypeName(uuid), public prefix?: string) {}
    public sendMessage(message: string, type: EChatType) {
        Chat.send(new Message(this.uuid, message), type);
    };

    public properties: Map<string, any> = new Map();

    public addProperty<T>(name: string, value: T) {
        this.properties.set(name, value);
    };

    public set setName(name: string) {
        this.name = name;
    };

    public set setPrefix(prefix: string) {
        this.prefix = prefix;
    };

    public set changeUUID(uuid: number) {
        if(new PlayerActor(uuid).isValid()) {
            this.uuid = uuid;
        } else {
            Debug.message(`Error! User ${this.name} was tried to change uuid, but player with new uuid is not valid. If it is wrong error, please join player to game and try again.`)
        }
    }

    /** Function to check if a user with the given uuid exists
     * @param uuid The numeric uuid of the user or the name of the user
     * @returns true if the user exists, false otherwise
     */
    public static has = (uuid: string | number): boolean => {
        if(typeof uuid === "string") {
            let userName = uuid;
            for(const user of User.list.values()) {
                if(user.name === userName) {
                    return true;
                }
            };
            return false; 
        } else {
            return User.list.has(uuid);
        }
    }
    public static get = (uuid: number): User => User.list.get(uuid);
    public static add = (uuid: number, name: string = Entity.getTypeName(uuid), prefix?: string): void => {
        if(!User.list.has(uuid)) {
            User.list.set(uuid, new User(uuid, name, prefix));
        };
    }
};
