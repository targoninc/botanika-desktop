import {compute, signal, Signal} from "../lib/fjsc/src/signals";
import {
    activateChat,
    chats,
    context,
    deleteChat,
    target,
    updateContextFromStream
} from "../classes/store";
import {create} from "../lib/fjsc/src/f2";
import {GenericTemplates} from "./generic.templates";
import {ChatContext} from "../../models/chat/ChatContext";
import {ChatMessage} from "../../models/chat/ChatMessage";
import {Api} from "../classes/api";
import {createModal, toast} from "../classes/ui";
import {FJSC} from "../lib/fjsc";

export class ChatTemplates {
    static chat(activePage: Signal<string>) {
        return create("div")
            .classes("flex-v", "flex-grow", "main-panel", "panel", "relative")
            .children(
                create("div")
                    .classes("flex", "flex-grow", "no-wrap")
                    .children(
                        ChatTemplates.chatList(),
                        ChatTemplates.chatBox(),
                    ).build(),
            ).build();
    }

    static chatBox() {
        return create("div")
            .classes("flex-v", "flex-grow", "bordered-panel", "relative", "chat-box")
            .children(
                compute(c => ChatTemplates.chatHistory(c), context),
                ChatTemplates.chatInput(),
            ).build();
    }

    static chatHistory(context: ChatContext) {
        if (!context || !context.history) {
            return create("div")
                .text("No messages yet")
                .build();
        }

        return create("div")
            .classes("flex-v", "flex-grow")
            .children(
                ...context.history.map(message => ChatTemplates.chatMessage(message))
            ).build();
    }

    private static chatMessage(message: ChatMessage) {
        return create("div")
            .classes("flex-v", "small-gap", "chat-message", message.type)
            .children(
                ChatTemplates.date(message.time),
                create("div")
                    .classes("flex", "align-center", "card")
                    .children(
                        create("span")
                            .text(message.text)
                            .build()
                    ).build(),
                ChatTemplates.messageActions(message),
            ).build();
    }

    private static messageActions(message: ChatMessage) {
        return create("div")
            .classes("message-actions")
            .children(
                FJSC.button({
                    icon: {
                        icon: "content_copy",
                    },
                    text: "Copy",
                    classes: ["flex", "align-center"],
                    onclick: async (e) => {
                        e.stopPropagation();
                        await navigator.clipboard.writeText(message.text);
                        toast("Copied to clipboard");
                    }
                }),
            ).build();
    }

    private static date(time: number) {
        return create("span")
            .classes("time")
            .text(new Date(time).toLocaleString("default", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                second: "numeric",
            }))
            .build();
    }

    static chatInput() {
        const input = signal("");
        const chatId = compute(c => c?.id, context);
        const send = () => {
            try {
                Api.sendMessage(input.value, chatId.value).then(updateContextFromStream);
            } catch (e) {
                toast(e.toString());
            }
            input.value = "";
        }

        return create("div")
            .classes("chat-input", "bordered-panel")
            .children(
                create("div")
                    .classes("flex", "space-between")
                    .children(
                        create("textarea")
                            .classes("flex-grow", "chat-input-field")
                            .styles("resize", "none")
                            .value(input)
                            .oninput((e: any) => {
                                input.value = target(e).value;
                            })
                            .onkeydown((e: any) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    send();
                                }
                            })
                            .build(),
                        GenericTemplates.buttonWithIcon("send", "Send", send, ["positive"]),
                    ).build(),
            ).build();
    }

    private static chatList() {
        return create("div")
            .classes("flex-v", "bordered-panel", "chat-list")
            .children(
                compute(c => ChatTemplates.chatListItems(c), chats),
            ).build();
    }

    static chatListItems(chat: ChatContext[]) {
        return create("div")
            .classes("flex-v", "flex-grow")
            .children(
                ...chat.map(chatId => ChatTemplates.chatListItem(chatId))
            ).build();
    }

    static chatListItem(chat: ChatContext) {
        const active = compute(c => c && c.id === chat.id, context);
        const activeClass = compute((c): string => c ? "active" : "_", active);

        return create("div")
            .classes("flex-v", "small-gap", "chat-list-item", activeClass)
            .onclick(() => activateChat(chat))
            .children(
                create("div")
                    .classes("flex", "align-center", "no-wrap")
                    .children(
                        create("span")
                            .classes("text-small")
                            .text(chat.name)
                            .build(),
                        FJSC.button({
                            icon: {
                                icon: "delete",
                            },
                            classes: ["negative", "flex", "align-center"],
                            onclick: (e) => {
                                e.stopPropagation();
                                createModal(GenericTemplates.confirmModalWithContent("Delete chat", create("div")
                                    .classes("flex-v")
                                    .children(
                                        create("p")
                                            .text(`Are you sure you want to delete this chat?`)
                                            .build(),
                                    ).build(), "Yes", "No", () => {
                                    deleteChat(chat.id);
                                }));
                            }
                        })
                    ).build(),
                ChatTemplates.date(chat.createdAt),
            ).build();
    }
}