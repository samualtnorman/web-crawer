import { IncomingMessage } from "http";
import { request as request_, RequestOptions } from "https"
import { URL } from "url";

export function request(options: RequestOptions | string | URL) {
	let data = ""

	return new Promise<{ res: IncomingMessage, data: string }>((resolve, reject) =>
		request_(options, res =>
			res	.on("data", (buffer: Buffer) => data += buffer.toString())
				.on("end", () => resolve({ res, data }))
				.on("error", reject)
		).end()
	)
}
