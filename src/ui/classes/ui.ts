import {LayoutTemplates} from "../templates/layout.templates";
import {AnyNode, create} from "../lib/fjsc/src/f2";
import {ToastType} from "../enums/ToastType";
import {GenericTemplates} from "../templates/generic.templates";

export const container = document.body;

export function initialize() {
    container.appendChild(create("div").id("toasts").build());
}

export function toasts(): HTMLElement {
    const toastsDiv = document.getElementById("toasts");
    if (!toastsDiv) {
        initialize();
        return toasts();
    } else {
        return toastsDiv;
    }
}

export function toast(message: string, coordinates: null | {
    x: number;
    y: number;
} = null, type: ToastType = ToastType.info, timeout = 5) {
    const toast = create("div")
        .classes("toast", type)
        .children(
            create("span")
                .text(message)
                .build()
        ).build();
    if (coordinates) {
        if (coordinates.x > window.innerWidth - 200) {
            coordinates.x = window.innerWidth - 200;
        } else if (coordinates.x < 0) {
            coordinates.x = 0;
        }
        if (coordinates.y > window.innerHeight - 100) {
            coordinates.y = window.innerHeight - 100;
        } else if (coordinates.y < 0) {
            coordinates.y = 0;
        }
        toast.style.left = `${coordinates.x}px`;
        toast.style.top = `${coordinates.y}px`;
        toast.style.position = "absolute";
        document.body.appendChild(toast);
    } else {
        toasts().appendChild(toast);
    }

    setTimeout(() => {
        toast.remove();
    }, timeout * 1000);
}

export function guessType(value: any) {
    if (value === "true" || value === "false") {
        return "boolean";
    }
    if (value === "null") {
        return "null";
    }
    if (!isNaN(value)) {
        return "number";
    }
    return "string";
}

export function newId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function createModal(content: AnyNode) {
    const modal = LayoutTemplates.modal(content);
    document.body.appendChild(modal);
    document.querySelectorAll(".modal").forEach((modal, index) => {
        modal.id = `modal-${index}`;
    });
}

export function closeModal(lastOnly = false) {
    const maxId = document.querySelectorAll(".modal").length;
    document.querySelectorAll(".modal").forEach(modal => {
        if (lastOnly) {
            if (modal.id === `modal-${maxId - 1}`) {
                modal.remove();
            }
        } else {
            modal.remove();
        }
    });
}

export function attachCodeCopyButtons() {
    const preCodes = document.querySelectorAll("pre code");
    for (const codeBlock of preCodes) {
        const pre = codeBlock.parentElement;
        pre.classList.add("relative");
        pre.appendChild(GenericTemplates.codeCopyButton(codeBlock.textContent));
    }
}

export function scrollToLastMessage() {
    const messages = document.querySelectorAll(".chat-message");
    if (messages.length > 0) {
        messages[messages.length - 1].scrollIntoView(true);
    }
}