const msToSegConverter = 1000;

export const timeframes = {
    first : 180000,
    second : 360000,
    third : 720000,
    fourth : 1440000, 
} // Todo en milisegundos

export const timeframesLogs = {
    first : (timeframes.first / msToSegConverter) + " segundos",
    second : (timeframes.second / msToSegConverter) + " segundos",
    third : (timeframes.third / msToSegConverter) + " segundos",
    fourth : (timeframes.fourth / msToSegConverter) + " segundos",
}

