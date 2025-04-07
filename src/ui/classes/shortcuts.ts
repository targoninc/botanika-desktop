import {activePage, shortCutConfig, target} from "./store";
import {shortCutActions} from "./shortCutActions";
import {pages} from "../enums/pages";
import {closeModal} from "./ui";

export function addShortCutListener() {
    const blockShortcuts = ["INPUT", "TEXTAREA", "SELECT"];
    document.addEventListener("keydown", (e) => {
        const shortcutConfig = shortCutConfig.value;
        for (const [action, func] of Object.entries(shortCutActions)) {
            if (e.ctrlKey && e.key === shortcutConfig[action]) {
                e.preventDefault();
                func();
            }
        }

        if (blockShortcuts.includes(target(e).tagName)) {
            return;
        }

        const isNumber = e.key.match(/^[0-9]+$/);
        if (isNumber) {
            activePage.value = pages.find((p, i) => p.hotkey === e.key)?.id ?? "chat";
        }

        if (e.key === "Escape") {
            closeModal();
        }
    });
}