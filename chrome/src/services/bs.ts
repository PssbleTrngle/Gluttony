$(window).ready(async () => {

    const episodes = getWatched();
    const show = getShow();
    const season = getSeason();
    const release = getRelease();
    const data = { episodes, season, show, release };

    chrome.runtime.sendMessage({ type: 'import', data });
});

const exists = (e => !!e) as <T>(e: T | null | undefined | void) => e is T;

function getRelease() {
    const infos = $('.serie .infos');
    const e = infos.children()[1].querySelector('em');
    const val = e?.innerText;
    const start = val?.split('-')[0].trim();
    return start;
}

function getSeason() {

    const seasons = window.document.querySelector('#seasons');
    const i = seasons?.querySelector('li.active')?.querySelector('a')?.innerHTML;
    return Number.parseInt(i ?? '');

}

function getShow() {

    const url = window.location.href;
    const match = url.match(/\/serie\/([a-zA-Z-]+)/);
    if (!match) throw new Error('Could not detect show')

    return match[1];
}

function getWatched() {

    const table = window.document.querySelector('table.episodes');
    const watched = Array.from(table?.querySelectorAll('tr.watched') ?? [])
        .map(td => td.querySelector('a'))
        .map(a => a?.innerHTML)
        .filter(exists)
        .map(e => Number.parseInt(e));


    return watched;

}