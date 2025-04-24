export function setRootCssVar(varName: string, value: string) {
    const normalizedVarName = varName.startsWith('--') ? varName : `--${varName}`;

    const root = document.documentElement;
    root.style.setProperty(normalizedVarName, value);
}