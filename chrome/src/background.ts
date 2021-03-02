const SERVER_URL = 'http://localhost:8080/api'

async function getKey() {
	return new Promise(res => chrome.storage.sync.get(({ key }) => res(key)));
}

async function post<R = any>(url: string, data: object = {}, headers: HeadersInit = {}) {

	const key = await getKey();

	return fetch(`${SERVER_URL}/${url}`, {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Token ${key}`,
			...headers
		},
		method: 'POST',
		body: JSON.stringify(data),
	}).then(r => r.json() as Promise<R>);
}

const services: [string, RegExp][] = [];

services.push(['bs', /^https*:\/\/bs.to\/serie\/.+$/])

async function login() {
	const stored = await getKey();
	if (stored) {
		console.log('Already logged in')
		return;
	}

	const username = 'dev';
	const password = '1234';

	const base64 = btoa(`${username}:${password}`);
	const purpose = 'Chrome Extension';
	const { key } = await post('apikey', { purpose }, { Authorization: `Basic ${base64}` })

	await new Promise(res => chrome.storage.sync.set({ key }, () => res()));
}

chrome.runtime.onInstalled.addListener(() => {

	login();

	chrome.tabs.onUpdated.addListener((id, info, tab) => {
		const { status } = info;
		const { url } = tab;
		if (url && status === 'complete') {
			console.log(url, 'loaded')
			const [id] = services.find(([, reg]) => reg.test(url)) ?? []
			if (id) chrome.tabs.executeScript({ file: `dist/services/${id}.js` })
		}
	})

	chrome.runtime.onMessage.addListener(async (request, sender) => {
		const { type, data } = request;

		if (type === 'import') {

			const response = await post('watched/import', data)
			console.log(response);

		}

	})

});