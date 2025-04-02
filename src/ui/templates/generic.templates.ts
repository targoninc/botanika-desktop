import {closeModal, toast} from "../classes/ui";
import {AnyElement, AnyNode, create, ifjs, signalMap, StringOrSignal, TypeOrSignal} from "../lib/fjsc/src/f2";
import {compute, Signal, signal} from "../lib/fjsc/src/signals";
import {FJSC} from "../lib/fjsc";
import {Callback, configuration, target} from "../classes/store";
import {Tab} from "../../models/uiExtensions/Tab";
import {TextSegment} from "../../models/uiExtensions/TextSegment";
import {ToastType} from "../enums/ToastType";
import {InputType} from "../lib/fjsc/src/Types";

export class GenericTemplates {
    static input<T>(type: InputType, name: StringOrSignal, value: any, placeholder: StringOrSignal, label: StringOrSignal, id: any, classes: StringOrSignal[] = [],
                 onchange: Callback<[T]> = () => {}, attributes: StringOrSignal[] = [], required = false) {
        return FJSC.input<T>({
            type,
            name,
            value,
            placeholder,
            label,
            id,
            classes,
            onchange,
            attributes,
            required
        });
    }

    static segmentedText(segments: TextSegment[]) {
        return create("span")
            .classes("segmented-text")
            .children(
                ...segments.map(segment => {
                    return create("span")
                        .classes(segment.type)
                        .text(segment.text)
                        .build();
                })
            ).build();
    }

    static icon(icon: StringOrSignal, classes: StringOrSignal[] = [], title = "", tag = "span") {
        if (icon && (icon.constructor === String && (icon.includes(".") || icon.startsWith("data:image"))) || (icon.constructor === Signal && icon.value &&
            (icon.value.includes(".") || icon.value.startsWith("data:image")))) {
            return create("img")
                .classes("icon", ...classes)
                .src(icon)
                .title(title)
                .build();
        }

        return create(tag)
            .classes("material-symbols-outlined", ...classes)
            .text(icon)
            .title(title)
            .build();
    }

    static heading(level: number, text: StringOrSignal) {
        return create(`h${level}`)
            .text(text)
            .build();
    }

    static buttonWithIcon(icon: StringOrSignal, text: StringOrSignal, onclick: Callback<[]>, classes: StringOrSignal[] = [], iconClasses: StringOrSignal[] = [], hotkey: StringOrSignal = null) {
        return create("button")
            .classes("flex", ...classes)
            .onclick(onclick)
            .children(
                GenericTemplates.icon(icon, iconClasses),
                ifjs(text, create("span")
                    .text(text)
                    .build()),
                GenericTemplates.hotkey(hotkey),
            ).build();
    }

    static hotkey(hotkey: StringOrSignal, alwaysDisplay = false) {
        const show = compute(c => alwaysDisplay || (c.display_hotkeys === true && hotkey != null), configuration);

        return ifjs(show, create("kbd")
            .classes("hotkey")
            .text(hotkey)
            .build()) as AnyElement;
    }

    static spinner(circleCount = 4, delay = 0.2) {
        return create("div")
            .classes("spinner")
            .children(
                ...Array.from({length: circleCount}, (_, i) => {
                    return create("div")
                        .classes("spinner-circle")
                        .styles("animation-delay", `-${i * delay}s`)
                        .build();
                })
            ).build();
    }

    static select(label: StringOrSignal | null, options: Array<{ text: string; value: any; }>, value: any, onchange: (value: any) => void) {
        return create("div")
            .classes("flex", "align-center")
            .children(
                ifjs(label, create("span")
                    .text(label)
                    .build()),
                create("div")
                    .classes("select")
                    .children(
                        create("select")
                            .onchange((e) => {
                                onchange(target(e).value);
                            })
                            .children(
                                ...options.map(option => {
                                    const selected = compute(value => option.value === value, value);

                                    return create("option")
                                        .text(option.text)
                                        .value(option.value)
                                        .selected(selected)
                                        .onclick(() => {
                                            onchange(option.value);
                                        }).build();
                                })
                            ).build()
                    ).build()
            ).build();
    }

    static copyButton(buttonText: StringOrSignal, text: StringOrSignal) {
        return GenericTemplates.buttonWithIcon("content_copy", buttonText, async () => {
            if (text.constructor === String) {
                text = signal(text);
            }
            await navigator.clipboard.writeText((text as Signal<string>).value);
            toast("ID copied to clipboard", null, ToastType.positive);
        })
    }

    static confirmModal(title: StringOrSignal, message: StringOrSignal, confirmText = "Confirm", cancelText = "Cancel",
                        confirmCallback = () => {}, cancelCallback = () => {}) {
        return create("div")
            .classes("flex-v")
            .children(
                create("h1")
                    .text(title)
                    .build(),
                create("p")
                    .text(message)
                    .build(),
                create("div")
                    .classes("flex")
                    .children(
                        GenericTemplates.buttonWithIcon("check_circle", confirmText, () => {
                            confirmCallback();
                            closeModal();
                        }, ["positive"]),
                        GenericTemplates.buttonWithIcon("close", cancelText, () => {
                            cancelCallback();
                            closeModal();
                        }, ["negative"])
                    ).build()
            ).build();
    }

    static confirmModalWithContent(title: StringOrSignal, content: AnyNode|AnyNode[], confirmText = "Confirm", cancelText = "Cancel",
                                   confirmCallback = () => {}, cancelCallback = () => {}) {
        return create("div")
            .classes("flex-v")
            .children(
                create("h1")
                    .text(title)
                    .build(),
                content,
                create("div")
                    .classes("flex")
                    .children(
                        GenericTemplates.buttonWithIcon("check_circle", confirmText, () => {
                            confirmCallback();
                            closeModal();
                        }, ["positive"]),
                        GenericTemplates.buttonWithIcon("close", cancelText, () => {
                            cancelCallback();
                            closeModal();
                        }, ["negative"])
                    ).build()
            ).build();
    }

    static textArea(value: any, label: StringOrSignal, id: StringOrSignal, oninput: Callback<[string]>) {
        return FJSC.textarea({
            classes: ["full-width"],
            name: "textarea",
            value,
            label,
            id,
            onchange: oninput
        });
    }

    static toggle(text: StringOrSignal, checked: TypeOrSignal<boolean> = false, callback: Callback<[boolean]> = () => {
    }, extraClasses: StringOrSignal[] = [], id: StringOrSignal = null) {
        return FJSC.toggle({
            classes: [...extraClasses],
            text,
            checked,
            id,
            onchange: callback,
        });
    }

    static inlineToggle(text: StringOrSignal, checked = false, callback: Callback<[boolean]> = () => {}, extraClasses: StringOrSignal[] = [], id: StringOrSignal = null) {
        return create("label")
            .classes("flex", "align-center", "inline-toggle", ...extraClasses)
            .children(
                create("span")
                    .classes("toggle-text")
                    .text(text)
                    .build(),
                create("input")
                    .type(InputType.checkbox)
                    .classes("hidden", "slider")
                    .id(id)
                    .checked(checked)
                    .onclick(e => {
                        callback(target(e).checked);
                    })
                    .build(),
                create("div")
                    .classes("toggle-container", "align-center")
                    .children(
                        create("span")
                            .classes("toggle-slider")
                            .build()
                    ).build(),
            ).build();
    }

    static tableListHeader(headerName: StringOrSignal, property: string|((c: any) => void), activeSortHeader: Signal<string>, listSignal: Signal<any[]>) {
        const currentSortType = signal("desc");
        if (headerName.constructor === String) {
            headerName = signal(headerName);
        }
        headerName = headerName as Signal<string>;
        const headerNameFull = compute((h, c, a) => {
            if (a && a === h) {
                return `${h} ${c === "asc" ? "▲" : "▼"}`;
            }
            return h;
        }, headerName, currentSortType, activeSortHeader);

        return create("th")
            .classes("clickable")
            .text(headerNameFull)
            .onclick(() => {
                if (!property) {
                    return;
                }

                activeSortHeader.value = headerName;
                if (currentSortType.value === "asc") {
                    currentSortType.value = "desc";
                } else {
                    currentSortType.value = "asc";
                }
                listSignal.value = listSignal.value.sort((a, b) => {
                    if (property.constructor === String) {
                        let propA = a[property];
                        let propB = b[property];
                        if (property.includes(".")) {
                            propA = property.split(".").reduce((obj, key) => obj[key], a);
                            propB = property.split(".").reduce((obj, key) => obj[key], b);
                        }

                        if (currentSortType.value === "asc") {
                            if (!propA || !propB) {
                                return 0;
                            }
                            if (propA.constructor === String) {
                                return propA.localeCompare(propB);
                            } else {
                                return propA - propB;
                            }
                        } else {
                            if (!propB || !propA) {
                                return 0;
                            }
                            if (propA.constructor === String) {
                                return propB.localeCompare(propA);
                            } else {
                                return propB - propA;
                            }
                        }
                    } else if (property.constructor === Function) {
                        // @ts-expect-error - property is a function
                        return property(a) - property(b);
                    }
                });
            })
            .build();
    }

    static invisibleInput(onType: Callback<[string]> = () => {}, onChange: Callback<[string]> = () => {}) {
        return create("input")
            .type(InputType.text)
            .classes("invisible-input")
            .onchange(e => {
                onChange(target(e).value);
                target(e).value = "";
            })
            .onkeydown((e: KeyboardEvent) => {
                if (e.key === "Escape") {
                    target(e).value = "";
                    return;
                }

                if (e.key === "Enter" || e.key === "Tab" || e.key === ",") {
                    onChange(target(e).value);
                    target(e).value = "";
                    setTimeout(() => {
                        if (target(e).value === ",") {
                            target(e).value = "";
                        }
                        target(e).focus();
                    }, 0);
                    return;
                }

                setTimeout(() => {
                    onType(target(e).value);
                }, 0);
            })
            .build();
    }

    static error(error: StringOrSignal) {
        return create("div")
            .classes("error")
            .text(error)
            .build();
    }

    static tabs(tabs: Array<AnyElement>, tabDefs: Signal<Tab[]>, activeTab: Signal<string>) {
        const tabButtons = signalMap(tabDefs, create("div").classes("flex", "align-center", "no-gap"), (tabDef: Tab) => {
            const active = compute(activeTab => activeTab === tabDef.id, activeTab);

            return GenericTemplates.tabButton(tabDef, active, () => activeTab.value = tabDef.id);
        });

        return create("div")
            .classes("flex-v", "flex-grow")
            .children(
                tabButtons,
                create("div")
                    .classes("flex-v", "flex-grow", "main-panel", "bordered-panel")
                    .children(
                        ...tabs.map((tab, i) => {
                            const tabDef = tabDefs.value[i];
                            const active = compute(activeTab => activeTab === tabDef.id, activeTab);

                            return ifjs(active, tab);
                        })
                    ).build(),
            ).build();
    }

    static tabButton(tab: Tab, active: Signal<boolean>, onClick: Callback<[]>, classes: StringOrSignal[] = []) {
        const activeClass = compute((active): string => active ? "active" : "_", active);

        return create("div")
            .classes("flex", "align-center", "tab-button", activeClass, ...classes)
            .onclick(onClick)
            .children(
                ifjs(tab.icon, GenericTemplates.icon(tab.icon)),
                create("span")
                    .text(tab.name)
                    .build(),
                ifjs(tab.hotkey, GenericTemplates.hotkey(tab.hotkey)),
            ).build();
    }

    static warning(warning: StringOrSignal) {
        return create("div")
            .classes("warning", "flex", "align-center")
            .children(
                GenericTemplates.icon("warning"),
                create("span")
                    .text(warning)
                    .build()
            ).build();
    }

    static errorIndicator(errorCount: StringOrSignal) {
        return create("div")
            .classes("error-indicator")
            .text(errorCount)
            .build();
    }

    static properties(data: any) {
        if (Object.keys(data).length === 0) {
            return create("td")
                .classes("log-properties")
                .build();
        }
        const shown = signal(false);

        return create("td")
            .classes("flex-v")
            .styles("position", "relative")
            .children(
                FJSC.button({
                    text: "Info",
                    icon: { icon: "info" },
                    onclick: () => {
                        shown.value = !shown.value;
                    }
                }),
                ifjs(shown, create("div")
                    .classes("flex-v", "card", "popout-below", "log-properties")
                    .children(
                        ...Object.keys(data).map(k => {
                            return GenericTemplates.property(k, data[k]);
                        })
                    ).build()),
            ).build();
    }

    static property(key: string, value: any): AnyElement {
        if (value === null) {
            value = "null";
        }

        let valueChild, showKey = true;
        if (typeof value !== "object") {
            valueChild = create("span")
                .classes("property-value")
                .text(value)
                .build();
        } else {
            showKey = false;
            valueChild = create("details")
                .children(
                    create("summary")
                        .classes("property-value")
                        .text(key)
                        .build(),
                    create("div")
                        .classes("property-value", "flex-v")
                        .children(
                            ...Object.keys(value).map((k: string) => {
                                return GenericTemplates.property(k, value[k]) as any;
                            })
                        ).build()
                ).build();
        }

        return create("div")
            .classes("property", "flex")
            .children(
                showKey ? create("span")
                    .classes("property-key")
                    .text(key)
                    .build() : null,
                valueChild
            ).build();
    }
}