import {create, ifjs, nullElement} from "../lib/fjsc/src/f2";
import {compute, signal, Signal} from "../lib/fjsc/src/signals";
import {GenericTemplates} from "./generic.templates";
import {Api} from "../classes/api";
import {
    appDataPath,
    configuration,
    configuredApis,
    loadConfiguredApis,
    mcpConfig,
    shortCutConfig
} from "../classes/store";
import {SettingsConfiguration} from "./settingsConfiguration";
import {InputType} from "../lib/fjsc/src/Types";
import {McpConfiguration} from "../../models/mcp/McpConfiguration";
import {FJSC} from "../lib/fjsc";
import {ConfiguredApis} from "../../api/features/configuredApis";
import {FeatureConfigurationInfo} from "../../models/FeatureConfigurationInfo";
import {createModal, toast} from "../classes/ui";
import {ShortcutConfiguration} from "../../models/shortcuts/ShortcutConfiguration";
import {shortcutNames} from "../../models/shortcuts/Shortcut";
import {McpServerConfig} from "../../models/mcp/McpServerConfig";

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
                description: "Whether assistant messages should be spoken aloud",
                type: "boolean",
            },
            {
                key: "botname",
                label: "Assistant name",
                description: "What name LLMs will use to refer to themselves",
                type: "string",
            },
            {
                key: "botDescription",
                label: "What should the assistant be like?",
                description: "The assistant will try to align with this description",
                type: "long-string",
            },
            {
                key: "displayname",
                icon: "person",
                label: "Your name",
                description: "Displayed in the UI",
                type: "string",
            },
            {
                key: "userDescription",
                label: "A short description of yourself",
                description: "Will be given to the model(s) as context",
                type: "long-string",
            },
            {
                key: "birthdate",
                icon: "calendar_month",
                label: "Your birthdate",
                description: "Will be given to the model(s) as context",
                type: "date",
            }
        ];
        const loading = signal(false);

        return create("div")
            .classes("flex-v", "bordered-panel", "overflow")
            .children(
                create("h1")
                    .classes("flex")
                    .children(
                        create("span")
                            .text("Settings")
                            .build(),
                        ifjs(loading, GenericTemplates.spinner()),
                    ).build(),
                GenericTemplates.heading(2, "General"),
                ...settings.map(s => SettingsTemplates.setting(s, loading)),
                SettingsTemplates.shortcuts(),
                SettingsTemplates.configuredApis(),
                SettingsTemplates.mcpConfig(),
                GenericTemplates.buttonWithIcon("folder_open", "Open app data folder", async () => {
                    await Api.openAppDataPath();
                }),
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
                        sc.icon ? create("h3")
                            .children(
                                GenericTemplates.icon(sc.icon),
                            ).build() : null,
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
            case "date":
                return GenericTemplates.input(InputType.date, sc.key, value, sc.label, sc.label, sc.key, [], (newValue) => updateKey(sc.key, newValue));
            case "long-string":
                return GenericTemplates.textArea(value, sc.label, sc.key, (newValue) => updateKey(sc.key, newValue));
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
        return create("div")
            .classes("flex-v")
            .children(
                compute(a => SettingsTemplates.configuredApisInternal(a, loadConfiguredApis), configuredApis)
            ).build();
    }

    static configuredApisInternal(apis: ConfiguredApis, load: () => void) {
        return create("div")
            .classes("flex-v")
            .children(
                GenericTemplates.heading(2, "Configured APIs"),
                create("div")
                    .classes("card")
                    .children(
                        GenericTemplates.warning("You might have to restart the application after changing environment variables")
                    ).build(),
                ...Object.keys(apis).map(api => {
                    const name = api;
                    const feature = apis[api] as FeatureConfigurationInfo;

                    return create("div")
                        .classes("flex-v", "card")
                        .children(
                            create("div")
                                .classes("flex", feature.enabled ? "positive" : "negative")
                                .children(
                                    GenericTemplates.icon(feature.enabled ? "check" : "key_off", [feature.enabled ? "positive" : "negative"]),
                                    create("b")
                                        .text(name),
                                ).build(),
                            feature.envVars && feature.envVars.length > 0 ? SettingsTemplates.configuredApiEnvVars(feature, load) : null,
                        ).build();
                })
            ).build();
    }

    private static configuredApiEnvVars(feature: FeatureConfigurationInfo, load: () => void) {
        return create("div")
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
                                icon: {icon: "save"},
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
                GenericTemplates.heading(2, "Configured MCP servers"),
                create("div")
                    .classes("card")
                    .children(
                        GenericTemplates.warning("You might have to restart the application after changing environment variables")
                    ).build(),
                ...Object.keys(c?.servers ?? {}).map(server => {
                    return SettingsTemplates.existingMcpServer(c.servers[server]);
                }),
                SettingsTemplates.addMcpServer()
            ).build();
    }

    private static addMcpServer() {
        const name = signal("");
        const url = signal("http://localhost:MCP_PORT/path/sse");

        return create("div")
            .classes("flex-v", "card")
            .children(
                create("p")
                    .text("Add a new MCP server:"),
                create("div")
                    .classes("flex", "align-center")
                    .children(
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

    private static existingMcpServer(server: McpServerConfig) {
        return create("div")
            .classes("flex-v", "bordered-panel")
            .children(
                create("div")
                    .classes("flex", "align-center", "space-between")
                    .children(
                        create("div")
                            .classes("flex", "align-center")
                            .children(
                                FJSC.input({
                                    type: InputType.text,
                                    value: server.name,
                                    name: "name",
                                    label: "Name",
                                    placeholder: "Name",
                                    onchange: (value) => {
                                        server.name = value;
                                        Api.updateMcpServer(server).then(() => {
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
                                    value: server.url,
                                    name: "url",
                                    label: "URL",
                                    placeholder: "URL",
                                    onchange: (value) => {
                                        server.url = value;
                                        Api.updateMcpServer(server).then(() => {
                                            Api.getMcpConfig().then(mcpConf => {
                                                if (mcpConf.data) {
                                                    mcpConfig.value = mcpConf.data as McpConfiguration;
                                                }
                                            });
                                        });
                                    }
                                }),
                            ).build(),
                        GenericTemplates.buttonWithIcon("delete", "Delete", () => {
                            createModal(GenericTemplates.confirmModal("Delete MCP Server connection", `Are you sure you want to delete ${server.url}?`, "Yes", "No", () => {
                                Api.deleteMcpServer(server.url).then(() => {
                                    Api.getMcpConfig().then(mcpConf => {
                                        if (mcpConf.data) {
                                            mcpConfig.value = mcpConf.data as McpConfiguration;
                                        }
                                    });
                                });
                            }));
                        }, ["negative"]),
                    ).build(),
                create("div")
                    .classes("flex-v")
                    .children(
                        GenericTemplates.heading(3, "Headers"),
                        GenericTemplates.keyValueInput(server.headers, headers => {
                            server.headers = headers;
                            Api.updateMcpServer(server).then(() => {
                                toast("MCP server updated");
                                Api.getMcpConfig().then(mcpConf => {
                                    if (mcpConf.data) {
                                        mcpConfig.value = mcpConf.data as McpConfiguration;
                                    }
                                });
                            });
                        })
                    ).build(),
            ).build();
    }

    static shortcuts() {
        return create("div")
            .classes("flex-v")
            .children(
                GenericTemplates.heading(2, "Shortcuts"),
                compute(sc => SettingsTemplates.shortcutsInternal(sc), shortCutConfig),
            ).build();
    }

    private static shortcutsInternal(sc: ShortcutConfiguration) {
        return create("div")
            .classes("flex-v")
            .children(
                ...Object.keys(sc).map(action => {
                    const key = signal<string[]>(sc[action]);
                    const unchanged = compute((k, current) => k === current[action], key, shortCutConfig);

                    return create("div")
                        .classes("flex", "card", "align-center")
                        .children(
                            create("b")
                                .text(shortcutNames[action])
                                .build(),
                            GenericTemplates.hotkey("CTRL", true),
                            create("span")
                                .text("+")
                                .build(),
                            FJSC.input({
                                type: InputType.text,
                                value: key,
                                name: action,
                                placeholder: action,
                                onchange: (value) => {
                                    key.value = value;
                                }
                            }),
                            FJSC.button({
                                icon: {
                                    icon: "save",
                                },
                                text: "Set",
                                disabled: unchanged,
                                classes: ["flex", "align-center"],
                                onclick: async () => {
                                    await Api.setShortcutConfig(sc);
                                    shortCutConfig.value = {
                                        ...shortCutConfig.value,
                                        [action]: key.value
                                    };
                                }
                            })
                        ).build();
                })
            ).build();
    }
}
