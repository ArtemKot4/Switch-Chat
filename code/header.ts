const getPlayerUidByName = (name: string) => {
    for(const i in Network.getConnectedPlayers()) {
        const id = Network.getConnectedPlayers()[i];
        if(Entity.getNameTag(Network.getConnectedPlayers()[i]) === name) return id;
    };
    return null; 
};

namespace ConfigManager {
    export const localMessageSpreading = __config__.getInteger("local_message_spreading") || 100;
}