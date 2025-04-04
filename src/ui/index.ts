import {LayoutTemplates} from "./templates/layout.templates";
import {closeModal} from "./classes/ui";
import {activePage, initializeStore, shortCutConfig, target} from "./classes/store";
import {pages} from "./enums/pages";
import {shortCutActions} from "./classes/shortCutActions";

initializeStore();

const content = document.getElementById('content');
const app = LayoutTemplates.app(activePage);
content.appendChild(app);

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
