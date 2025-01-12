type typeButtonProps = {
    type: EChatType;
    x: number;
    y: number;
    scale: number;
};

interface IMessagePositionProps {
    y: number;
    type_button?: typeButtonProps
};

interface IMessageContent {
    name: UI.UITextElement,
    prefix?: UI.UITextElement,
    message: UI.UITextElement,
    type_button?: UI.UITextElement,
    lines: number,
    isDeleted: boolean
}

class ChatScrolling {
    public static readonly HEIGHT = 370;
    public static readonly UI: UI.Window = new UI.Window();

    public static getMessageContent(message: Message, user: User, {y, type_button}: IMessagePositionProps): IMessageContent {
        const separatedText = Utils.separateText(message.message, 28);
        const isDeleted = Message.isDeleted(message);
        const current_user = message.user;

        const content = {
            name: {
                type: "text",
                x: 20,
                y: y,
                text: `<${current_user.name}>`
            },
            message: {
                type: "text",
                x: ((current_user.name + 2 + (current_user.prefix ? current_user.prefix.name : "")).length * 15) + 30,
                y: y,
                text: separatedText,
                font: {
                    color: (() => {
                        if(current_user.uuid === user.uuid) {
                            return android.graphics.Color.GREEN;
                        };

                        return isDeleted ? android.graphics.Color.GRAY : android.graphics.Color.LTGRAY;
                    })()
                },
                multiline: true
            },
            lines: separatedText.split("\n").length || 1,
            isDeleted: isDeleted
        } satisfies Record<string, UI.UITextElement | number | boolean>;

        if(user.prefix && user.prefix.name || isDeleted) {
            content["prefix"] = {
                type: "text",
                x: ((current_user.name + 1).length * 15) + 20,
                y: y,
                text: isDeleted ? "[DELETED]" : current_user.prefix.name,
                font: {
                    color: isDeleted ? android.graphics.Color.RED : current_user.prefix.color 
                }
            };
        };

        if(type_button) {
            content["type_button"] = this.getButtonSwitchElement(type_button, () => {
                Desktop.changeCurrentChatType(type_button.type);
                Desktop.openFor(user);
                return;
            });
        };

        return content;
    };

    public static getContent = (elements?: UI.ElementSet, scroll: number = 0) => {
        return {
            location: {
                x: 200,
                y: 75,
                width: 600,
                height: this.HEIGHT,
                scrollY: this.HEIGHT + 50 + scroll,
                forceScrollY: true
            },
            drawing: [
                {
                    type: "background", color: android.graphics.Color.argb(128, 0, 0, 0)
                }
            ],
            elements: elements || {}
        } as UI.WindowContent;
    };

    public static getButtonSwitchElement(description: typeButtonProps, onClick?: () => void): UI.UITextElement {
        let headerParams = {
            color: android.graphics.Color.WHITE,
            char: "NONE"
        };

        switch(description.type) {
            case EChatType.GLOBAL: {
                headerParams.color = android.graphics.Color.YELLOW;
                headerParams.char = "G";
                break;
            };
                
            case EChatType.LOCAL: {
                headerParams.color = android.graphics.Color.LTGRAY;
                headerParams.char = "L";
                break;
            };
                
            case EChatType.MIXED: {
                headerParams.color = android.graphics.Color.CYAN;
                headerParams.char = "M";
                break;
            };

            case EChatType.SHOP: {
                headerParams.color = android.graphics.Color.GREEN;
                headerParams.char = "S";
                break;
            }
        };

        return {
            type: "text",
            x: description.x,
            y: description.y,
            font: {
                size: description.scale,
                color: headerParams.color
            },
            text: `[${headerParams.char}]`,
            ...(onClick && {
                clicker: {
                    onClick: (position, container) => onClick()
                }}
            )
        };
    };

    public static getElementsWith(messages: Message[], user: User, type?: EChatType): [elements: UI.ElementSet, scroll: number] {
        let translatedChat = Translation.translate("switch_chat.chat");

        let content = {
            chat: {
                type: "text",
                x: 20,
                y: 10,
                text: translatedChat,
                font: {
                    size: 30,
                    color: android.graphics.Color.WHITE
                },
                clicker: {
                    onClick: (position, container) => Desktop.close()
                }
            },
            chat_type: this.getButtonSwitchElement({
                type: type ?? EChatType.LOCAL,
                x: (translatedChat.length * 20) + 35,
                y: 10,
                scale: 30
            })
        } satisfies Record<string, UI.UITextElement>;

        if(messages && messages.length <= 0) {
            content["message_empty"] = {
                type: "text",
                x: 20,
                y: 80,
                text: Translation.translate("switch_chat.empty_chat"),
                font: {
                    color: android.graphics.Color.GRAY
                },
                multiline: true
            };
            return [content, 0];
        };

        let height = 80;
        let scroll = 0;

        for(const i in messages) {
            const message = messages[i];

            const current_user = message.user;
            const message_type = Message.getMetadata<EChatType>(message, "type");
            const messageContent = ChatScrolling.getMessageContent(message, user, {
                y: height,
                ...(typeof message_type === "number" && 
                    { type_button: 
                        {
                            type: message_type,
                            x: 930,
                            y: height,
                            scale: 20
                        }
                    }
                )
            });

            content["name_" + i] = messageContent.name;

            if(messageContent.prefix) {
                content["prefix_" + i] = messageContent.prefix;
            };   

            if(messageContent.type_button) {
                content["type_" + i] = messageContent.type_button;
            };

            content["message_" + i] = messageContent.message;

            if(!messageContent.type_button && user.uuid === current_user.uuid) {
                content["delete_" + i] = {
                    type: "text",
                    x: 890,
                    y: height,
                    text: "-",
                    font: {
                        size: 30
                    },
                    clicker: {
                        onClick(position, container) {
                            Network.sendToServer("packet.switch_chat.delete_message_server", { user: user, index: Number(i), type: type });
                            return;
                        },
                    }
                } satisfies UI.UITextElement;
            };

            height += 30 + (messageContent.lines * 20);
            scroll += 30 + (messageContent.lines * 20);
        };
        
        return [content, scroll];
    };

    public static draw(user: User, type: EChatType): void {
        const messages = ChatManager.get(type);

        const content = ChatScrolling.getElementsWith(messages, user, type);

        return this.update(content[0], content[1]);
    };

    public static update(elements: UI.ElementSet, scroll: number): void {
        this.UI.setContent(this.getContent(elements, scroll));
        this.UI.updateScrollDimensions();
        this.UI.forceRefresh();
        return;
    };

    public static open(user: User, type: EChatType): void {
        this.draw(user, type);
        this.UI.open();
        return;
    };

    public static close() {
        return this.UI.close();
    }

    public static refresh(type: EChatType = Desktop.currentChatType, user?: User): void {
        const isMixedType = Desktop.isCurrentChatType(EChatType.MIXED);

        if(ChatScrolling.UI.isOpened() && isMixedType || Desktop.isCurrentChatType(type)) {
            return ChatScrolling.draw(user || User.get(Player.getLocal()), isMixedType ? EChatType.MIXED : type);
        };
    };

    static {
        this.UI.setContent(this.getContent());
    }
};

Network.addServerPacket("packet.switch_chat.delete_message_server", (client, data: {
    user: User;
    index: number;
    type: EChatType;
}) => {
    Network.sendToAllClients("packet.switch_chat.delete_message_client", {
        index: data.index,
        user: data.user,
        type: data.type,
        chat: ChatManager.get(data.type),
        isOperator: new PlayerActor(data.user.uuid).isOperator()
    });
    
    ChatManager.delete(data.index, data.type)
});

Network.addClientPacket("packet.switch_chat.delete_message_client", (data: {
    user: User,
    type: EChatType,
    chat: Message[],
    index: number;
    isOperator: boolean;
}) => {

    if(data.isOperator) {
        ChatManager.set(data.type, data.chat)
        ChatManager.delete(data.index, data.type);
    } else {
        Message.addMetadata(data.chat[data.index], "deleted", true);
    };

    ChatScrolling.refresh(data.type);
    return;
});