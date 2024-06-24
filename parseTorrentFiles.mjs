/**
 * Usage: INPUT=crime node parseTorrentFiles.mjs
 */

import parseTorrent from 'parse-torrent'
import fs from "fs"

let inputName = process.env.INPUT

let stuff = await parseTorrent(fs.readFileSync(`./torrents/${inputName}.torrent`))

delete stuff.info.files
delete stuff.info.pieces
delete stuff.infoBuffer
delete stuff.pieces
delete stuff.announce
delete stuff.info
delete stuff.infoHashBuffer

let array = []

stuff.files.forEach((file) => {
	let topic = file.path.split("/")[2].replaceAll(".pdf", "")

	let index = array.findIndex((thingies) => thingies.topic === topic)

	if (index === -1) {
		array.push({
			topic: topic,
			files: [file.path]
		})
	} else {
		array[index].files.push(file.path)
	}
})

fs.writeFile(`./formatted/${inputName}.json`, JSON.stringify(array), () => {})

