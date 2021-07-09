import { cheerio } from "https://deno.land/x/cheerio@1.0.4/mod.ts"

const html = await (
	await fetch("https://unicode.org/emoji/charts/emoji-list.html")
).text()

const $ = cheerio.load(html)

let emojis: {
	[key: string]: {
		unicode: string[]
		emoji: string
		name: string
		keywords: string[]
	}[]
} = {}

let currentClass: string

$("body > div.main > table > tbody > tr")
	.filter((_, row) => {
		return (
			($(row).children().length === 5 &&
				/[\d]+/.test($(row).children().first().text())) ||
			$(row).find("th").hasClass("bighead")
		)
	})
	.each((_, row) => {
		if ($(row).find("th").hasClass("bighead")) {
			currentClass = $(row).text().trim()
			return
		}

		const unicode = $(row)
			.find(".code")
			.text()
			.split(" ")
			.map((e) => e.slice(2))

		const emoji = $(row).find(".andr > a > img").attr("alt")!

		const name = $(row).find(".name").first().text().trim()

		const keywords = $(row)
			.find(".name")
			.last()
			.text()
			.split("|")
			.map((e) => e.trim())

		if (!emojis[currentClass]) {
			emojis[currentClass] = []
		}

		emojis[currentClass].push({
			unicode,
			emoji,
			name,
			keywords,
		})
	})

await Deno.writeTextFile("./emojis.json", JSON.stringify(emojis, null, 2))
await Deno.writeTextFile("./emojis.min.json", JSON.stringify(emojis))
