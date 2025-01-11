interface ICommandPacketProps {
    arguments: Record<string, unknown>;
};

abstract class Command {
    public static list: Record<string, Command> = {};

    public caller: string;
    public arguments: string[];
    public require_count: number;

    constructor(caller: string, args?: string[], require_count?: number) {
        this.caller = caller;
        this.arguments = args || [];
        this.require_count = require_count || this.arguments.length;

        Command.list[caller] = this;
    };

};

abstract class ClientCommand extends Command {
    constructor(caller: string, args?: string[], require_count?: number) {
        super(caller, args, require_count)
    };

    abstract onCall(data: Record<string, unknown>): void;
};

abstract class ServerCommand extends Command {
    constructor(caller: string, args?: string[], require_count?: number) {
        super(caller, args, require_count);
        this.buildPacket();
    };

    abstract onClient(data: ICommandPacketProps): void
    abstract onServer(client: NetworkClient, data: ICommandPacketProps): void;

    public buildPacket() {
        Network.addClientPacket("packet.command.client." + this.caller, this.onClient.bind(this));
        Network.addServerPacket("packet.command.server." + this.caller, this.onServer.bind(this));
    };

    public sendToClient(client: NetworkClient, data: ICommandPacketProps) {
        if(client) {
            client.send("packet.command.client." + this.caller, data);
        };
    };

    public sendToAllClients(data: ICommandPacketProps) {
        Network.sendToAllClients("packet.command.client." + this.caller, data);
    };
};

Callback.addCallback("NativeCommand", (command) => {
    const splited = command.split(" "); 

    for(const i in Command.list) {
        const current = Command.list[i];

        if("/" + current.caller === splited[0]) {
            const args = splited.splice(1);

            if(current.require_count <= 0 || args.length >= current.require_count) {
                Game.prevent();

                const arguments = args.slice(0, Math.min(args.length, current.arguments.length))
                .reduce<Record<string, any>>((previousValue, currentValue, currentIndex) => {
                    previousValue[current.arguments[currentIndex]] = currentValue;
                    return previousValue;
                }, {});

                if(current instanceof ServerCommand) {
                    Network.sendToServer("packet.command.server." + current.caller, {
                        arguments: arguments 
                    });
                    return;
                };

                if(current instanceof ClientCommand) {
                    current.onCall(arguments);
                    return;
                };

            } else {
                const message = Translation.translate("command.not_enough_arguments")
                .replace("%s", current.require_count.toString())
                .replace("%d", current.arguments.length.toString());

                Game.message(Native.Color.RED + message)
                Game.prevent();
            };
        };
    };
});

Translation.addTranslation("command.not_enough_arguments", {
    en: "Not enough arguments. You need %s arguments, but you gave %d",
    ru: "Недостаточно аргументов. Вам нужно %s аргументов, но вы предоставили %d",
})