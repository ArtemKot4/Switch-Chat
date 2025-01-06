Callback.addCallback("ServerPlayerLoaded", (player) => {
    const name = Entity.getNameTag(player);
    User.add(name);
})