class Desktop {
    public static getContent = () => {
        return {
            drawing: [
                {
                    type: "background"
                }
            ]
        } as UI.WindowContent;
    };

    public static UI = () => {
       const window = new UI.Window(Desktop.getContent());
       window.setBlockingBackground(true);
       window.setAsGameOverlay(true);
       window.setCloseOnBackPressed(true);
       return window;
    };

    public static separateMessage(message: Message) {
        let result = [];
        let line = "";
    
        for (let word of message.message.split(" ")) {
            if (line.length + word.length <= 25) {
                line += word + " ";
            } else {
                result.push(line.trim());
                line = word + " ";
            }
        }
    
        if (line) {
            result.push(line.trim());
        }
    
        return result.join("\n");
    }
}