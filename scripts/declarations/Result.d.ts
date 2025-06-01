declare type ResultType<T> = { 
    success: boolean,
    ret?: T,
    err?: string
}