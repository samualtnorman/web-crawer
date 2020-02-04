import fs from "fs";
import https from "https";

const findings = JSON.parse(fs.readFileSync("findings.json"));

crawl(findings["*"].shift());

function crawl(url) {
	findings[url] = findings[url] || [];

	request(url).then(data => {
		crawl(findings["*"].shift());
		
		var urls = [ ...new Set(data.body.match(/(\bhttps:\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig)) ];
		
		if (Array.isArray(urls)){
			findings[url] = [ ...urls ];
			findings["*"].push(...urls.filter(url => !Object.keys(findings).includes(url)));
			findings["*"] = [ ...new Set(findings["*"]) ];

			fs.writeFileSync("findings.json", JSON.stringify(findings, null, "\t"));
		}

		console.log(url);
	}).catch(e => {
		console.error(e);
		crawl(findings["*"].shift());
	});
}

function request(url) {
	return new Promise((resolve, reject) => {
		var req = https.request(url, res => {
			var o = {};

			o.statusCode = res.statusCode;
			o.headers = res.headers;
			o.body = "";

			res.setEncoding("utf8");
			res.on("data", chunk => o.body += chunk);
			res.on("end", () => resolve(o));
		});

		req.on("error", e => {
			reject(`problem with request: ${e.message}`);
		});

		req.end();
	})
}
