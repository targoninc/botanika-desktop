import {compute, signal, Signal} from "../lib/fjsc/src/signals";
import {getGreeting} from "../classes/greetings";
import {configuration, context, target, updateContextFromStream} from "../classes/store";
import {create} from "../lib/fjsc/src/f2";
import {GenericTemplates} from "./generic.templates";
import {ChatContext} from "../../models/chat/ChatContext";
import {ChatMessage} from "../../models/chat/ChatMessage";
import {Api} from "../classes/api";
import {toast} from "../classes/ui";

export class ChatTemplates {
    static chat(activePage: Signal<string>) {
        const greeting = compute(c => getGreeting(c.displayname), configuration);

        return create("div")
            .classes("flex-v", "flex-grow", "main-panel", "panel")
            .children(
                GenericTemplates.heading(1, greeting),
                ChatTemplates.chatBox(),
                ChatTemplates.chatInput(),
            ).build();
    }

    static chatBox() {
        return create("div")
            .classes("flex-v", "flex-grow")
            .children(
                compute(c => ChatTemplates.chatHistory(c), context),
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
            .classes("flex-v", "small-gap", "chat-message")
            .children(
                create("span")
                    .classes("time")
                    .text(new Date(message.time).toLocaleString("default", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                        second: "numeric",
                    }))
                    .build(),
                create("div")
                    .classes("flex", "align-center", "card")
                    .children(
                        create("span")
                            .text(message.text)
                            .build()
                    ).build(),
            ).build();
    }

    static chatInput() {
        const input = signal("");
        const chatId = compute(context => context.id, context);
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
}