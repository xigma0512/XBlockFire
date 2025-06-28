import { FormatCode as FC } from "../FormatCode";

function progressBar(duration: number, currentTime: number, barLength: number = 20, filledTag: string = '|', emptyTag: string = '|') {
    if (duration <= 0 || currentTime < 0 || currentTime > duration) return "Invalid progress bar parameters.";

    const progress = currentTime / duration;
    const filled = Math.round(progress * barLength);
    const empty = barLength - filled;

    const progressBar = `${FC.Green}${filledTag.repeat(filled)}${FC.Gray}${emptyTag.repeat(empty)}`;

    return progressBar;
}

export { progressBar };