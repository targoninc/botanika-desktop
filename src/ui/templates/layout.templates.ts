import {AnyNode, create, StringOrSignal} from "../lib/fjsc/src/f2";
import {GenericTemplates} from "./generic.templates";
import {pages} from "../enums/pages";
import {configuration} from "../classes/store";
import {SettingsTemplates} from "./settings.templates";
import {getGreeting} from "../classes/greetings";
import {Signal, signal, compute} from "../lib/fjsc/src/signals";

export class LayoutTemplates {
    static app(activePage: Signal<string>) {
        const tabs = [
            LayoutTemplates.home(activePage),
            SettingsTemplates.settings(activePage),
        ];

        return create("div")
            .classes("app", "no-wrap", "padded-big", "flex-v")
            .children(
                GenericTemplates.tabs(tabs, signal(pages), activePage),
            ).build();
    }

    static modal(content: AnyNode) {
        const self = create("div")
            .classes("modal")
            .children(
                create("div")
                    .classes("modal-content")
                    .children(
                        content,
                        create("div")
                            .classes("modal-close")
                            .children(
                                GenericTemplates.buttonWithIcon("close", "Close", () => {
                                    self.remove();
                                }),
                            ).build(),
                    ).build(),
            ).build();

        return self;
    }

    static home(activePage: Signal<string>) {
        const greeting = compute(c => getGreeting(c.displayname), configuration);

        return create("div")
            .classes("flex-v", "flex-grow", "main-panel", "panel")
            .children(
                GenericTemplates.heading(1, greeting),
            ).build();
    }

    static card(title: StringOrSignal, children: (AnyNode)[]) {
        return create("div")
            .classes("card", "flex-v")
            .children(
                create("h2")
                    .text(title)
                    .build(),
                create("div")
                    .classes("flex")
                    .children(...children)
                    .build()
            ).build();
    }
}