export enum Shortcut {
    newChat = "newChat",
    settings = "settings",
    focusInput = "focusInput",
}

export const shortcutNames: Record<Shortcut, string> = {
    [Shortcut.newChat]: "New chat",
    [Shortcut.settings]: "Settings",
    [Shortcut.focusInput]: "Focus chat input",
};
