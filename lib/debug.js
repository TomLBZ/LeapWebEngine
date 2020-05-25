export class DebugConsole {
    constructor(divbox) {
        if (!divbox) {
            console.error("# DebugConsole divbox is invalid (null or undefined).");
        }
        this.divbox = divbox;
        this._trackingDict = {};
        this._timerId = null;
    }
    _addTracking(tracking_id, uiUpdater, rootElement) {
        this._trackingDict[tracking_id] = {"uiUpdater": uiUpdater, "rootElement": rootElement};
        console.log("# _addTracking for:", tracking_id);
    }
    _createAppendConsoleElem(tracking_id) {
        let root = document.createElement("div");
        root.className = "console-elem-root";
        let header = document.createElement("span");
        header.innerText = tracking_id;
        header.className = "console-elem-head";
        root.appendChild(header);
        let value = document.createElement("span");
        value.className = "console-elem-value";
        root.appendChild(value);
        this.divbox.appendChild(root);
        return {root:root, value:value};
    }
    addLabel(tracking_id, labelReader) {
        let {root, value} = this._createAppendConsoleElem(tracking_id);
        let updater = () => {
            value.innerText = labelReader().toString();
        };
        this._addTracking(tracking_id, updater, root);
    }
    addCommands(tracking_id, commandsDict) {
        let {root, value} = this._createAppendConsoleElem(tracking_id);
        for (let cmd in commandsDict) {
            let btn = document.createElement("button");
            btn.innerText = cmd;
            btn.addEventListener("click", commandsDict[cmd]);
            value.appendChild(btn);
        }
        this._addTracking(tracking_id, () => {}, root);
    }
    removeTracking(tracking_id) {
        this.divbox.removeChild(this._trackingDict[tracking_id]['rootElement']);
        delete this._trackingDict[tracking_id];
        console.log("# removeTracking for:", tracking_id);
    }
    activate() {
        if (this._timerId !== null) {
            console.warn("# DebugConsole is already activate.");
            return;
        }
        this._timerId = setInterval(() => {
            for(let key in this._trackingDict) {
                let updater = this._trackingDict[key]["uiUpdater"];
                updater();
            }
        }, 500);
        console.log("# DebugConsole activate.");
    }
    deactivate() {
        clearInterval(this._timerId);
        console.log("# DebugConsole deactivate.");
    }
}