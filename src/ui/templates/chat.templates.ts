import {compute, signal, Signal} from "../lib/fjsc/src/signals";
import {activateChat, chats, context, deleteChat, target, updateContextFromStream} from "../classes/store";
import {create, ifjs} from "../lib/fjsc/src/f2";
import {GenericTemplates} from "./generic.templates";
import {ChatContext} from "../../models/chat/ChatContext";
import {ChatMessage} from "../../models/chat/ChatMessage";
import {Api} from "../classes/api";
import {createModal, toast} from "../classes/ui";
import {FJSC} from "../lib/fjsc";
import {marked} from "marked";
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';

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
                .classes("flex-v", "flex-grow")
                .styles("overflow-y", "auto")
                .text("No messages yet")
                .build();
        }

        setTimeout(() => {
            hljs.highlightAll();
        });

        return create("div")
            .classes("flex-v", "flex-grow")
            .styles("overflow-y", "auto")
            .children(
                ...context.history.map(message => ChatTemplates.chatMessage(message))
            ).build();
    }

    private static chatMessage(message: ChatMessage) {
        const rawMdParsed = marked.parse(message.text, {
            async: false
        });
        const sanitized = DOMPurify.sanitize(rawMdParsed);

        return create("div")
            .classes("flex-v", "small-gap", "chat-message", message.type)
            .children(
                ChatTemplates.date(message.time),
                create("div")
                    .classes("flex", "align-center", "card", "message-content")
                    .children(
                        create("div")
                            .html(sanitized)
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
        const focusInput = () => {
            document.getElementById("chat-input-field")?.focus();
        }
        const updateInputHeight = () => {
            const input = document.getElementById("chat-input-field");
            if (!input) {
                return;
            }
            input.style.height = "auto";
            input.style.height = Math.min(input.scrollHeight, 300) + "px";
        }

        return create("div")
            .classes("chat-input")
            .onclick(focusInput)
            .children(
                create("div")
                    .classes("flex", "space-between")
                    .children(
                        create("textarea")
                            .attributes("rows", "3")
                            .id("chat-input-field")
                            .classes("flex-grow", "chat-input-field")
                            .styles("resize", "none")
                            .value(input)
                            .oninput((e: any) => {
                                input.value = target(e).value;
                                updateInputHeight();
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
                ifjs(chat.length === 0, create("span")
                    .text("No chats yet")
                    .build()),
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
                    .classes("flex", "align-center", "no-wrap", "space-between")
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