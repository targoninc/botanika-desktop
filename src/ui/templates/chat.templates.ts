import {compute, signal} from "../lib/fjsc/src/signals";
import {
    activateChat, availableModels,
    chats,
    configuration,
    chatContext, currentlyPlayingAudio,
    deleteChat,
    target,
    updateContextFromStream, shortCutConfig, configuredApis
} from "../classes/store";
import {create, ifjs, nullElement} from "../lib/fjsc/src/f2";
import {GenericTemplates} from "./generic.templates";
import {ChatContext} from "../../models/chat/ChatContext";
import {ChatMessage} from "../../models/chat/ChatMessage";
import {Api} from "../classes/api";
import {attachCodeCopyButtons, createModal, scrollToLastMessage, toast} from "../classes/ui";
import {FJSC} from "../lib/fjsc";
import {marked} from "marked";
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import {ResourceReference} from "../../models/chat/ResourceReference";
import {INITIAL_CONTEXT} from "../../models/chat/initialContext";
import {ModelDefinition} from "../../models/ModelDefinition";
import {LlmProvider} from "../../models/llmProvider";
import {playAudio, stopAudio} from "../classes/audio";
import {ProviderDefinition} from "../../models/ProviderDefinition";

export class ChatTemplates {
    static chat() {
        return create("div")
            .classes("flex", "flex-grow", "no-wrap", "relative")
            .children(
                ChatTemplates.chatList(),
                ChatTemplates.chatBox(),
            ).build();
    }

    static chatBox() {
        return create("div")
            .classes("flex-v", "flex-grow", "bordered-panel", "relative", "chat-box", "no-gap")
            .children(
                ChatTemplates.botName(),
                compute(c => ChatTemplates.chatHistory(c), chatContext),
                ChatTemplates.chatInput(),
            ).build();
    }

    static botName() {
        return create("div")
            .classes("flex", "align-center", "bot-name", "card")
            .children(
                GenericTemplates.icon("person"),
                create("span")
                    .text(compute(c => c.botname, configuration))
                    .build()
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
            attachCodeCopyButtons();
            scrollToLastMessage();
        });

        return create("div")
            .classes("flex-v", "flex-grow", "chat-history")
            .styles("overflow-y", "auto")
            .children(
                ...context.history
                    .sort((a, b) => a.time - b.time)
                    .map(message => ChatTemplates.chatMessage(message))
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
                    (message.references && message.references.length > 0) ? create("div")
                        .classes("flex-v", "small-gap", "chat-message-references")
                        .children(
                            ...(message.references ?? []).map(r => ChatTemplates.reference(r)),
                        ).build() : null,
                    !message.finished ? GenericTemplates.spinner() : null,
                ).build();
        }

        if (message.text.trim().length === 0) {
            return nullElement();
        }

        const rawMdParsed = marked.parse(message.text, {
            async: false
        });
        const sanitized = DOMPurify.sanitize(rawMdParsed);

        return create("div")
            .classes("flex-v", "small-gap", "chat-message", message.type)
            .children(
                create("div")
                    .classes("flex", "align-center", "message-time")
                    .children(
                        ChatTemplates.date(message.time),
                    ).build(),
                create("div")
                    .classes("flex", "align-center", "card", "message-content")
                    .children(
                        create("div")
                            .html(sanitized)
                            .build(),
                        !message.finished ? GenericTemplates.spinner() : null,
                    ).build(),
                message.files && message.files.length > 0 ? ChatTemplates.messageFiles(message) : null,
                ChatTemplates.messageActions(message),
            ).build();
    }

    private static messageFiles(message: ChatMessage) {
        return create("div")
            .classes("flex", "align-center", "card", "message-content")
            .children(
                ...message.files.map(f => {
                    if (f.mimeType.startsWith("image/")) {
                        return create("img")
                            .classes("message-content-image")
                            .src(f.base64)
                            .build();
                    }

                    if (f.mimeType === "application/pdf") {
                        return create("iframe")
                            .classes("message-content-pdf")
                            .src(f.base64)
                            .build();
                    }

                    return FJSC.button({
                        icon: {icon: "download"},
                        text: "File",
                        onclick: () => {
                            const a = document.createElement("a");
                            a.href = f.base64;
                            a.download = `file.${f.mimeType.split("/")[1]}`;
                            document.body.appendChild(a);
                            a.click();
                        }
                    })
                }),
            ).build();
    }

    static messageActions(message: ChatMessage) {
        const audioDisabled = compute(a => !!a && a !== message.id, currentlyPlayingAudio);
        const modelInfo = "Through API from " + message.provider + ", model: " + message.model;

        return create("div")
            .classes("flex", "align-center")
            .children(
                message.hasAudio ? FJSC.button({
                    disabled: audioDisabled,
                    icon: { icon: compute(a => a === message.id ? "stop_circle" : "volume_up", currentlyPlayingAudio) },
                    onclick: () => {
                        if (currentlyPlayingAudio.value === message.id) {
                            stopAudio();
                        } else {
                            playAudio(message.id).then();
                        }
                    },
                    classes: ["flex", "align-center"]
                }) : null,
                ChatTemplates.messageAction("content_copy", "Copy", async (e) => {
                    e.stopPropagation();
                    await navigator.clipboard.writeText(message.text);
                    toast("Copied to clipboard");
                }),
                GenericTemplates.icon("info", [], modelInfo)
            ).build();
    }

    static messageAction(icon: string, text: string, onclick: () => void) {
        return FJSC.button({
            icon: { icon },
            classes: ["flex", "align-center", "message-action"],
            onclick
        });
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
        const chatId = compute(c => c?.id, chatContext);
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
            .classes("chat-input", "flex-v", "small-gap")
            .children(
                create("div")
                    .classes("flex", "space-between")
                    .onclick(focusInput)
                    .children(
                        create("textarea")
                            .attributes("rows", "3")
                            .id("chat-input-field")
                            .classes("flex-grow", "chat-input-field")
                            .styles("resize", "none")
                            .placeholder(compute(c => `[Ctrl] + [${c.focusInput}] to focus`, shortCutConfig))
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
                        GenericTemplates.verticalButtonWithIcon("arrow_upward", "", send, ["send-button"]),
                    ).build(),
                create("div")
                    .classes("flex", "space-between")
                    .children(
                        ChatTemplates.llmSelector(),
                    ).build(),
            ).build();
    }

    static llmSelector() {
        const availableProviders = compute((a, c) => {
            const out = [];
            for (const provider in a) {
                if (a[provider].requiredFeatures.every(f => c[f]?.enabled)) {
                    out.push(provider);
                }
            }
            return out;
        }, availableModels, configuredApis);
        const filteredModels = compute((a, p) => {
            const out = {};
            for (const provider in a) {
                if (p.includes(provider)) {
                    out[provider] = a[provider];
                }
            }
            return out as Record<string, ProviderDefinition>;
        }, availableModels, availableProviders);
        const setProvider = async (p: LlmProvider) => {
            configuration.value = {
                ...configuration.value,
                provider: p
            };
            await Api.setConfigKey("provider", p);
        };
        const provider = compute((c, p) => {
            const val = c.provider ?? "groq";
            const toUse = p.includes(val) ? val : p[0];
            if (toUse !== c.provider && toUse) {
                setProvider(toUse).then();
            }
            return toUse;
        }, configuration, availableProviders);

        return create("div")
            .classes("flex", "select-container", "big-gap")
            .children(
                compute(p => GenericTemplates.select("Provider", p.map(m => {
                    return {
                        value: m,
                        text: m
                    };
                }), provider, setProvider), availableProviders),
                compute((p, a) => {
                    if (!a[p] || Object.keys(a).length === 0) {
                        return nullElement();
                    }
                    return ChatTemplates.modelSelector(a[p].models ?? []);
                }, provider, filteredModels)
            ).build();
    }

    private static modelSelector(models: ModelDefinition[]) {
        const model = compute(c => c.model, configuration);

        return GenericTemplates.select("Model", models.sort((a, b) => a.id.localeCompare(b.id))
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
        const newDisabled = compute(c => Object.keys(c).length === 0, chatContext);

        return create("div")
            .classes("flex-v", "bordered-panel", "chat-list")
            .children(
                FJSC.button({
                    disabled: newDisabled,
                    icon: {
                        icon: "create"
                    },
                    text: "New chat",
                    classes: ["flex", "align-center", "positive"],
                    onclick: () => {
                        chatContext.value = INITIAL_CONTEXT;
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
        const active = compute(c => c && c.id === chat.id, chatContext);
        const activeClass = compute((c): string => c ? "active" : "_", active);

        return create("div")
            .classes("flex-v", "small-gap", "chat-list-item", activeClass)
            .onclick(() => activateChat(chat))
            .children(
                create("div")
                    .classes("flex", "align-center", "no-wrap", "space-between")
                    .children(
                        create("span")
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
                    .classes("flex", "align-center", "padded", "pill-padding", "no-wrap")
                    .children(
                        r.link ? GenericTemplates.icon("link") : null,
                        r.link ? create("a")
                                .href(r.link)
                                .target("_blank")
                                .title(r.link)
                                .text(r.name)
                                .build()
                            : create("span")
                                .classes("text-small")
                                .text(r.name)
                                .build(),
                    ).build(),
                r.snippet ? create("div")
                        .classes("flex", "small-gap", "reference-preview", "padded-big")
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