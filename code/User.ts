class User {
    public static list: Map<number, User> = new Map();
    public uuid: number;
    public name: string;
    public prefix?: {name: string, color: number};

    protected constructor(uuid: number, name?: string, prefix?: typeof User.prototype.prefix) {
        this.uuid = uuid;
        this.name = name || Entity.getNameTag(uuid);
        this.prefix = prefix;
    };

    public properties: Record<string, any> = {};

    public static addProperty<T>(user: User, name: string, value: T) {
        user.properties.set(name, value);
    };

    public static setName(user: User, name: string) {
        if(name.length + (user.prefix ? user.prefix.name : "").length > 16) {
            Debug.message(`Error! User ${this.name} was tried to change name, but new name is too long.`);
            return;
        }
        user.name = name;
    };

    public static setPrefix(user: User, prefix: string, color = android.graphics.Color.LTGRAY) {
        if((user.name + prefix).length > 16) {
            Debug.message(`Error! User ${this.name} was tried to change prefix, but new prefix + name is too long.`);
            return;
        }
        user.prefix = {name: prefix, color: color};
    };

    public static changeUUID(user: User, uuid: number) {
        if(new PlayerActor(uuid).isValid()) {
            user.uuid = uuid;
        } else {
            Debug.message(`Error! User ${this.name} was tried to change uuid, but player with new uuid is not valid. If it is wrong error, please join player to game and try again.`)
        }
    };

    public chatList: {[uuid: number]: Message[]} = {};

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
    };
    
    public static get = (uuid: number): User => {
        User.add(uuid, Entity.getNameTag(uuid));
        return User.list.get(uuid);
    };
    
    public static add = (uuid: number, name: string = Entity.getNameTag(uuid), prefix?: typeof User.prototype.prefix): void => {
        if(!User.list.has(uuid)) {
            User.list.set(uuid, new User(uuid, name, prefix));
        };
    };

};

// Saver.addSavesScope("scope.switch_chat.user_list", function read(scope: { list: typeof User.list }) {
//     User.list = scope ? scope.list : new Map();
// }, function save() {
//     return { list: User.list };
// });