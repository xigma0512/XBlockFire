const variables = new Map<string, any>();

function variable(varName: string) {
    return variables.get(varName);
}

function set_variable(varName: string, value: any) {
    variables.set(varName, value);
}

export { variable, set_variable };