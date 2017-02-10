namespace pxt.editor {
    export interface EditorMessageRequest {
        /**
         * identifier used to correlate request / responses
         */
        id: string;
        /**
         * constant messageb identifier
         */
        type: "pxteditor",
        /**
         * Request action
         */
        action: "switchblocks" | "switchjavascript" | "startsimulator" | "restartsimulator"
    }

    export interface EditorMessageResponse {
        /**
         * Constant identifier
         */
        type: "pxteditor",
        /**
         * Original request id
         */
        id: string;
        /**
         * indicate if operation started or completed successfully
         */
        success: boolean;
        /**
         * Error object if any
         */
        error?: any;
    }

    /**
     * Binds incoming window messages to the project view. 
     * Requires the "allowParentController" flag in the pxtarget.json/appTheme object.
     * 
     * When the project view receives a request (EditorMessageRequest), 
     * it starts the command and returns the result upon completion. 
     * The response (EditorMessageResponse) contains the request id and result.
     * Some commands may be async, use the ``id`` field to correlate to the original request.
     */
    export function bindEditorMessages(projectView: IProjectView) {
        if (!window.parent) return;

        window.addEventListener("message", (msg: MessageEvent) => {
            const data = msg.data as EditorMessageRequest;
            if (!data || data.type != "pxteditor" || !data.action) return false;

            let p = Promise.resolve();
            switch (data.action.toLowerCase()) {
                // TODO: make async
                case "switchjavascript": p = p.then(() => projectView.openJavaScript()); break;
                case "switchblocks": p = p.then(() => projectView.openBlocks()); break;
                case "startsimulator": p = p.then(() => projectView.startSimulator()); break;
                case "restartsimulator": p = p.then(() => projectView.restartSimulator()); break;
            }
            p.done(() => sendResponse(data, true, undefined),
                (err) => sendResponse(data, false, err))

            return true;
        }, false)
    }

    function sendResponse(request: EditorMessageRequest, success: boolean, error: any) {
        window.parent.postMessage({
            type: "pxteditor",
            id: request.id,
            success,
            error
        }, "*");
    }
}