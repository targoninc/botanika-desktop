import {LayoutTemplates} from "./templates/layout.templates";
import {closeModal} from "./classes/ui";
import {activePage, initializeStore} from "./classes/store";
import {pages} from "./enums/pages";
import {target} from "./classes/store";

initializeStore();

const content = document.getElementById('content');
const app = LayoutTemplates.app(activePage);
content.appendChild(app);

const blockShortcuts = ["INPUT", "TEXTAREA", "SELECT"];
document.addEventListener("keydown", (e) => {
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