import {create, ifjs, nullElement} from "../lib/fjsc/src/f2";
import {compute, signal, Signal} from "../lib/fjsc/src/signals";
import {GenericTemplates} from "./generic.templates";
import {Api} from "../classes/api";
import {configuration, mcpConfig} from "../classes/store";
import {SettingsConfiguration} from "./settingsConfiguration";
import {InputType} from "../lib/fjsc/src/Types";
import {McpConfiguration} from "../../api/ai/mcp/models/McpConfiguration";
import {FJSC} from "../lib/fjsc";

export class SettingsTemplates {
    static settings(activePage: Signal<string>) {
        const settings: SettingsConfiguration[] = [
            {
                key: "display_hotkeys",
                icon: "keyboard",
                label: "Display hotkeys",
                description: "Whether to display hotkeys in the UI.",
                type: "boolean",
            },
            {
                key: "displayname",
                icon: "person",
                label: "Your name",
                description: "Will be displayed in the UI.",
                type: "string",
            },
            {
                key: "language",
                icon: "language",
                label: "Language",
                description: "The language to use throughout Botanika.",
                type: "language",
            },
        ];
        const loading = signal(false);

        return create("div")
            .classes("flex-v")
            .children(
                create("h1")
                    .classes("flex")
                    .children(
                        create("span")
                            .text("Settings")
                            .build(),
                        ifjs(loading, GenericTemplates.spinner()),
                    ).build(),
                ...settings.map(s => SettingsTemplates.setting(s, loading)),
                SettingsTemplates.configuredApis(),
                SettingsTemplates.mcpConfig(),
                create("p")
                    .classes("align-center", "flex")
                    .children(
                        create("b")
                            .text("Hint: "),
                        create("span")
                            .text("You can hit "),
                        GenericTemplates.hotkey("Ctrl", true),
                        create("span")
                            .text(" + "),
                        GenericTemplates.hotkey("F", true),
                        create("span")
                            .text(" to search on most pages.")
                            .build(),
                    ).build()
            ).build();
    }

    static setting(sc: SettingsConfiguration, loading: Signal<boolean>) {
        async function updateKey(key: string, value: any) {
            loading.value = true;
            configuration.value = {
                ...configuration.value,
                [key]: value,
            };
            await Api.setConfigKey(key, value);
            loading.value = false;
        }
        const value = compute(c => c[sc.key] ?? null, configuration);

        return create("div")
            .classes("flex-v", "card")
            .children(
                create("div")
                    .classes("flex", "align-center")
                    .children(
                        create("h3")
                            .children(
                                GenericTemplates.icon(sc.icon),
                            ).build(),
                        SettingsTemplates.settingImplementation(sc, value, updateKey),
                    ).build(),
                create("p")
                    .text(sc.description)
                    .build()
            ).build();
    }

    private static settingImplementation(sc: SettingsConfiguration, value: Signal<any>, updateKey: (key: string, value: any) => Promise<void>) {
        switch (sc.type) {
            case "string":
                return GenericTemplates.input(InputType.text, sc.key, value, sc.label, sc.label, sc.key, [], (newValue) => updateKey(sc.key, newValue));
            case "number":
                return GenericTemplates.input(InputType.number, sc.key, value, sc.label, sc.label, sc.key, [], (newValue: string) => updateKey(sc.key, parseInt(newValue)));
            case "boolean":
                return GenericTemplates.toggle(sc.label, value, val => updateKey(sc.key, val));
            case "language":
                return GenericTemplates.select(sc.label, [
                    {
                        text: "English",
                        value: "en",
                    },
                    {
                        text: "Deutsch",
                        value: "de",
                    },
                ], value, val => updateKey(sc.key, val));
            default:
                return nullElement();
        }
    }

    static configuredApis() {
        const apis = signal<Record<string, boolean>>({});
        Api.getConfiguredApis().then(res => {
            if (res.data) {
                apis.value = res.data as Record<string, boolean>;
            }
        });

        return create("div")
            .classes("flex-v")
            .children(
                compute(a => SettingsTemplates.configuredApisInternal(a), apis)
            ).build();
    }

    static configuredApisInternal(apis: Record<string, boolean>) {
        return create("div")
            .classes("flex-v")
            .children(
                create("p")
                    .text("Configured APIs:"),
                ...Object.keys(apis).map(api => {
                    const name = api;
                    const enabled = apis[api];

                    return create("div")
                        .classes("flex", enabled ? "positive" : "negative")
                        .children(
                            GenericTemplates.icon(enabled ? "check" : "key_off", [enabled ? "positive" : "negative"]),
                            create("b")
                                .text(name),
                            create("span")
                                .text(enabled ? "Enabled" : "Disabled"),
                        ).build();
                })
            ).build();
    }

    static mcpConfig() {
        return create("div")
            .children(
                compute(c => SettingsTemplates.mcpConfigInternal(c), mcpConfig)
            ).build();
    }

    static mcpConfigInternal(c: McpConfiguration) {
        return create("div")
            .classes("flex-v")
            .children(
                create("p")
                    .text("Configured MCP servers:"),
                ...Object.keys(c?.servers ?? {}).map(server => {
                    const name = c.servers[server].name;
                    const url = c.servers[server].url;

                    return create("div")
                        .classes("flex", "card", "align-center", name ? "positive" : "negative")
                        .children(
                            GenericTemplates.icon(name ? "check" : "key_off", [name ? "positive" : "negative"]),
                            FJSC.input({
                                type: InputType.text,
                                value: name,
                                name: "name",
                                label: "Name",
                                placeholder: "Name",
                                onchange: (value) => {
                                    c.servers[server].name = value;
                                    Api.updateMcpServer(c.servers[server]).then(() => {
                                        Api.getMcpConfig().then(mcpConf => {
                                            if (mcpConf.data) {
                                                mcpConfig.value = mcpConf.data as McpConfiguration;
                                            }
                                        });
                                    });
                                }
                            }),
                            FJSC.input({
                                type: InputType.text,
                                value: url,
                                name: "url",
                                label: "URL",
                                placeholder: "URL",
                                onchange: (value) => {
                                    c.servers[server].url = value;
                                    Api.updateMcpServer(c.servers[server]).then(() => {
                                        Api.getMcpConfig().then(mcpConf => {
                                            if (mcpConf.data) {
                                                mcpConfig.value = mcpConf.data as McpConfiguration;
                                            }
                                        });
                                    });
                                }
                            }),
                        ).build();
                })
            ).build();
    }
}
