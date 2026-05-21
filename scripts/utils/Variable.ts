const variables = new Map<string, any>();

function variable(varName: string) {
    return variables.get(varName);
}

function set_variable(varName: string, value: any) {
    variables.set(varName, value);
}

function clear_variable(varName: string) {
    variables.delete(varName);
}

function reset_variables() {
    variables.clear();
}

export { variable, set_variable, clear_variable, reset_variables };