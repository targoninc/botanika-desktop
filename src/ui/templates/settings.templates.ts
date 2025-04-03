import {create, ifjs, nullElement} from "../lib/fjsc/src/f2";
import {compute, signal, Signal} from "../lib/fjsc/src/signals";
import {GenericTemplates} from "./generic.templates";
import {Api} from "../classes/api";
import {configuration, mcpConfig} from "../classes/store";
import {SettingsConfiguration} from "./settingsConfiguration";
import {InputType} from "../lib/fjsc/src/Types";
import {McpConfiguration} from "../../api/ai/mcp/models/McpConfiguration";
import {FJSC} from "../lib/fjsc";
import {ConfiguredApis} from "../../api/features/configuredApis";
import {FeatureConfigurationInfo} from "../../models/FeatureConfigurationInfo";
import {createModal} from "../classes/ui";

export class SettingsTemplates {
    static settings() {
        const settings: SettingsConfiguration[] = [
            {
                key: "display_hotkeys",
                icon: "keyboard",
                label: "Display hotkeys",
                description: "Whether to display hotkeys in the UI.",
                type: "boolean",
            },
            {
                key: "enableTts",
                icon: "text_to_speech",
                label: "Enable TTS",
                description: "Whether assistant messages should be spoken aloud.",
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
            .classes("flex-v", "bordered-panel")
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
        const apis = signal<ConfiguredApis>({} as ConfiguredApis);
        const load = () => {
            Api.getConfiguredApis().then(res => {
                if (res.data) {
                    apis.value = res.data as ConfiguredApis;
                }
            });
        }
        load();

        return create("div")
            .classes("flex-v")
            .children(
                compute(a => SettingsTemplates.configuredApisInternal(a, load), apis)
            ).build();
    }

    static configuredApisInternal(apis: ConfiguredApis, load: () => void) {
        return create("div")
            .classes("flex-v")
            .children(
                create("p")
                    .text("Configured APIs:"),
                GenericTemplates.warning("You might have to restart the application after changing environment variables"),
                ...Object.keys(apis).map(api => {
                    const name = api;
                    const feature = apis[api] as FeatureConfigurationInfo;

                    return create("div")
                        .classes("flex-v", "bordered-panel")
                        .children(
                            create("div")
                                .classes("flex", feature.enabled ? "positive" : "negative")
                                .children(
                                    GenericTemplates.icon(feature.enabled ? "check" : "key_off", [feature.enabled ? "positive" : "negative"]),
                                    create("b")
                                        .text(name),
                                    create("span")
                                        .text(feature.enabled ? "Enabled" : "Disabled"),
                                ).build(),
                            create("div")
                                .classes("flex-v")
                                .children(
                                    ...feature.envVars.map(envVar => {
                                        const value = signal("");

                                        return create("div")
                                            .classes("flex", "align-center", "indent-left")
                                            .children(
                                                GenericTemplates.icon(envVar.isSet ? "check" : "key_off", [envVar.isSet ? "positive" : "negative"]),
                                                FJSC.input({
                                                    type: InputType.text,
                                                    value: "",
                                                    name: envVar.key,
                                                    placeholder: envVar.key,
                                                    onchange: (newVal) => {
                                                        value.value = newVal;
                                                    }
                                                }),
                                                FJSC.button({
                                                    icon: { icon: "check" },
                                                    text: "Set",
                                                    disabled: compute(v => !v || v.length === 0, value),
                                                    classes: ["flex", "align-center"],
                                                    onclick: () => {
                                                        createModal(GenericTemplates.confirmModalWithContent("Overwrite environment variable", create("div")
                                                            .children(
                                                                create("p")
                                                                    .text(`Are you sure you want to overwrite the environment variable ${envVar.key}?`),
                                                            ).build(), "Yes", "No", () => {
                                                            Api.setEnvironmentVariable(envVar.key, value.value).then(res => {
                                                                if (res.success) {
                                                                    load();
                                                                }
                                                            });
                                                        }));
                                                    }
                                                })
                                            ).build();
                                    })
                                ).build(),
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

                    return SettingsTemplates.existingMcpServer(c, name, server, url);
                }),
                SettingsTemplates.addMcpServer()
            ).build();
    }

    private static addMcpServer() {
        const name = signal("");
        const url = signal("http://localhost:MCP_PORT/path/sse");

        return create("div")
            .classes("flex-v", "bordered-panel")
            .children(
                create("p")
                    .text("Add a new MCP server:"),
                create("div")
                    .classes("flex", "align-center")
                    .children(
                        GenericTemplates.icon(name ? "check" : "key_off", [name ? "positive" : "negative"]),
                        FJSC.input({
                            type: InputType.text,
                            value: name,
                            name: "name",
                            label: "Name",
                            placeholder: "Name",
                            onchange: (value) => name.value = value
                        }),
                        FJSC.input({
                            type: InputType.text,
                            value: url,
                            name: "url",
                            label: "URL",
                            placeholder: "URL",
                            onchange: (value) => url.value = value
                        })
                    ).build(),
                FJSC.button({
                    text: "Add",
                    disabled: compute((n, u) => n.length === 0 || u.length === 0, name, url),
                    icon: {
                        icon: "add",
                    },
                    classes: ["flex", "align-center"],
                    onclick: () => {
                        Api.addMcpServer(url.value, name.value).then(() => {
                            Api.getMcpConfig().then(mcpConf => {
                                if (mcpConf.data) {
                                    mcpConfig.value = mcpConf.data as McpConfiguration;
                                }
                            });
                        });
                    }
                })
            ).build();
    }

    private static existingMcpServer(c: McpConfiguration, name: string, server: string, url: string) {
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
                GenericTemplates.iconButton("delete", () => {
                    createModal(GenericTemplates.confirmModal("Delete MCP Server connection", `Are you sure you want to delete ${url}?`, "Yes", "No", () => {
                        Api.deleteMcpServer(url).then(() => {
                            Api.getMcpConfig().then(mcpConf => {
                                if (mcpConf.data) {
                                    mcpConfig.value = mcpConf.data as McpConfiguration;
                                }
                            });
                        });
                    }));
                }),
            ).build();
    }
}
