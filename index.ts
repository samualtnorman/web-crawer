import { readFile, writeFile } from "fs/promises"
import { request } from "./lib/https"

// currently has a problem where the program will completely freeze while
// writing to data.json

(async () => {
	let { toCheck, found } = JSON.parse(await readFile("data.json", { encoding: "utf-8" })) as { toCheck: string[], found: Record<string, string[]> };

	writeDataFileLoop()

	while (toCheck.length) {
		const url = toCheck.shift() as string
		try {
			await crawl(url)
		} catch (error) {
			console.log("error when checking", url, error)
			toCheck.push(url)
		}
	}

	async function crawl(url: string) {
		const { data } = await request(url)

		let urls = [ ...new Set(data.match(/(\bhttps:\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig)) ]

		console.log("checked", url, "and found:\n", ...urls.map(a => "   " + a + "\n"))

		found[url] = urls

		toCheck = [ ...new Set([ ...toCheck, ...urls ]) ].filter(url => !Object.keys(found).includes(url))
	}

	async function writeDataFileLoop() {
		await wait(10000)
		await writeFile("data.json", JSON.stringify({ toCheck, found }, undefined, "\t"))
		writeDataFileLoop()
	}
})()

async function wait(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms))
}
