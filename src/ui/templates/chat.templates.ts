import {compute, Signal} from "../lib/fjsc/src/signals";
import {getGreeting} from "../classes/greetings";
import {configuration} from "../classes/store";
import {create} from "../lib/fjsc/src/f2";
import {GenericTemplates} from "./generic.templates";

export class ChatTemplates {
    static chat(activePage: Signal<string>) {
        const greeting = compute(c => getGreeting(c.displayname), configuration);

        return create("div")
            .classes("flex-v", "flex-grow", "main-panel", "panel")
            .children(
                GenericTemplates.heading(1, greeting),
            ).build();
    }
}