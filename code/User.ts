class User {
    protected static list: Record<number, User> = {};
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
            for(const i in User.list) {
                if(User.list[i].name === userName) {
                    return true;
                }
            };
            return false; 
        } else {
            return uuid in User.list;
        }
    };
    
    public static get = (uuid: number): User => {
        if(!(uuid in User.list)) {
            User.add(uuid, Entity.getNameTag(uuid));
        };
        return User.list[uuid];
    };
    
    public static add = (uuid: number, name: string = Entity.getNameTag(uuid), prefix?: typeof User.prototype.prefix): void => {
         if(uuid in User.list) {
            return;
            // const oldData = User.list[uuid];
            // User.list[uuid] = {...oldData, uuid, ...((prefix || oldData.prefix) && {prefix: prefix || oldData.prefix})} ;
        } else {
            User.list[uuid] = new User(uuid, name, prefix);
        }
    };

    public static setList(users: Record<number, User>): void {
        User.list = users;
    };

    public static getList() {
        return User.list;
    };

    public static addChat(user: User, user2: User): void {
        user.chatList[user2.uuid] = [];
    };

    public static sendMessage(user: User, user2: User) {
        //...
    }

};

Saver.addSavesScope("scope.switch_chat.user_list", function read(scope: { list: Record<number, User> }) {
    User.setList(scope ? scope.list : {});
}, function save() {
    return { list: User.getList() };
});
