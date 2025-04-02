import {compute, signal, Signal} from "../lib/fjsc/src/signals";
import {
    activateChat, availableModels,
    chats,
    configuration,
    context,
    deleteChat,
    target,
    updateContextFromStream
} from "../classes/store";
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
import {ResourceReference} from "../../models/chat/ResourceReference";
import {INITIAL_CONTEXT} from "../../models/chat/initialContext";
import {modelOptions} from "../../models/llms/modelOptions";
import {ModelDefinition} from "../../models/modelDefinition";
import {LlmProvider} from "../../models/llmProvider";

export class ChatTemplates {
    static chat(activePage: Signal<string>) {
        return create("div")
            .classes("flex", "flex-grow", "no-wrap", "relative")
            .children(
                ChatTemplates.chatList(),
                ChatTemplates.chatBox(),
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
        if (message.type === "tool") {
            const textIsJson = typeof message.text.constructor === "object";

            return create("div")
                .classes("flex-v", "small-gap", "bordered-panel")
                .children(
                    create("div")
                        .classes("flex", "align-center", "chat-message", message.type)
                        .children(
                            GenericTemplates.icon("build_circle"),
                            textIsJson ? GenericTemplates.properties(JSON.parse(message.text))
                                : create("span")
                                    .text(message.text)
                                    .build(),
                        ).build(),
                    ...message.references.map(r => ChatTemplates.reference(r))
                ).build();
        }
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
        const provider = compute(c => c.provider, configuration);
        const model = compute(c => c.model, configuration);
        const send = () => {
            try {
                Api.sendMessage(input.value, provider.value, model.value, chatId.value).then(updateContextFromStream);
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
            .classes("chat-input", "flex-v")
            .children(
                ChatTemplates.llmSelector(),
                create("div")
                    .classes("flex", "space-between")
                    .onclick(focusInput)
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

    static llmSelector() {
        const provider = compute(c => c.provider ?? "groq", configuration);

        return create("div")
            .classes("flex")
            .children(
                GenericTemplates.select("Provider", Object.values(LlmProvider).map(m => {
                    return {
                        value: m,
                        text: m
                    };
                }), provider, async (newProvider) => {
                    configuration.value = {
                        ...configuration.value,
                        provider: newProvider
                    };
                    await Api.setConfigKey("provider", newProvider);
                }),
                compute((p, a) => ChatTemplates.modelSelector(a[p] ?? []), provider, availableModels)
            ).build();
    }

    private static modelSelector(models: ModelDefinition[]) {
        const model = compute(c => c.model, configuration);

        return GenericTemplates.select("Model", models
            .sort((a, b) => a.id.localeCompare(b.id))
            .map(m => {
                return {
                    value: m.id,
                    text: m.id
                };
            }), model, async (newModel) => {
            configuration.value = {
                ...configuration.value,
                model: newModel
            };
            await Api.setConfigKey("model", newModel);
        });
    }

    private static chatList() {
        return create("div")
            .classes("flex-v", "bordered-panel", "chat-list")
            .children(
                FJSC.button({
                    icon: {icon: "create"},
                    text: "New chat",
                    classes: ["positive", "flex", "align-center"],
                    onclick: () => {
                        context.value = INITIAL_CONTEXT;
                    }
                }),
                compute(c => ChatTemplates.chatListItems(c), chats),
            ).build();
    }

    static chatListItems(chat: ChatContext[]) {
        return create("div")
            .classes("flex-v", "flex-grow")
            .children(
                ifjs(chat.length === 0, create("span")
                    .text("No chats yet")
                    .build()
                ),
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

    private static reference(r: ResourceReference) {
        const expanded = signal(false);
        const expandedClass = compute((e): string => e ? "expanded" : "_", expanded);

        return create("div")
            .classes("flex-v", "no-gap", "relative", "reference", r.link ? "clickable" : "_", expandedClass)
            .onclick(() => {
                if (!r.snippet) {
                    return;
                }

                expanded.value = !expanded.value;
            })
            .children(
                create("div")
                    .classes("flex", "padded", "rounded", "no-wrap")
                    .children(
                        r.link ? GenericTemplates.icon("link") : null,
                        r.link ? create("a")
                                .href(r.link)
                                .target("_blank")
                                .title(r.name)
                                .text(r.link)
                                .build()
                            : create("span")
                                .text(r.name)
                                .build(),
                    ).build(),
                r.snippet ? create("div")
                        .classes("flex", "small-gap", "reference-preview", "card")
                        .children(
                            r.imageUrl ? create("img")
                                    .classes("thumbnail")
                                    .src(r.imageUrl)
                                    .alt(r.name)
                                    .build()
                                : null,
                            create("span")
                                .classes("snippet")
                                .text(r.snippet)
                                .build(),
                        ).build()
                    : null,
            ).build();
    }
}