import {Shortcut} from "../../models/shortcuts/Shortcut";
import {INITIAL_CONTEXT} from "../../models/chat/initialContext";
import {activePage, chatContext} from "./store";

export const shortCutActions: Record<Shortcut, Function> = {
    [Shortcut.newChat]: () => {
        chatContext.value = INITIAL_CONTEXT;
    },
    [Shortcut.settings]: () => {
        activePage.value = "settings";
    },
    [Shortcut.focusInput]: () => {
        const area = document.getElementById("chat-input-field");
        area?.focus();
    }
}