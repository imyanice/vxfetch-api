import Fastify, { FastifyInstance } from 'fastify'
import process = require('process')
import * as topics from './topics.json'
import Fuse from 'fuse.js'
import JSZip from 'jszip'

const server: FastifyInstance = Fastify({})
server.addHook("preHandler", (req, res, done) => {
	res.header("Access-Control-Allow-Origin", "*")
	res.header("Access-Control-Allow-Header", "*")
	done()
})
// @ts-ignore
const fuse = new Fuse(topics.default, {keys: ["topic"]})

interface Query {
	topic: string
}

interface Topic {
	topic: string
	files: string[]
}

server.get<{ Querystring: Query }>('/search/:topic', async (request, reply) => {
	if (request.query.topic == undefined) reply.code(400).send({success: false, error: "missing topic"})
	let matches = fuse.search(request.query.topic).slice(0, 15)
	return { success: true,  matches: matches}
})

server.get<{ Querystring: Query}>("/download:topic", async (request, reply) => {
	let matches = fuse.search(request.query.topic)[0].item // we assume it's at index 1 because perfect match
	if (isItem(matches)) {
		let zip = await sendZip(matches)
		if (zip !== undefined) return reply.send(zip)
	}
})

function isItem(item: any): item is Item {
	return "topic" in item
}

async function start() {
	try {
		await server.listen({ port: 3000 })
		console.log("listening on " + 3000)
	} catch (err) {
		server.log.error(err)
		process.exit(1)
	}
}

start()


interface Item {
	topic: string;
	files: string[];
}

async function downloadFile(url: string): Promise<Buffer> {
	const response = await fetch("https://samples.vx-underground.org/" + encodeURI(url));
	if (!response.ok) {
		throw new Error(`Failed to download file: ${response.statusText}`);
	}
	const arrayBuffer = await response.arrayBuffer();
	return Buffer.from(arrayBuffer);
}

async function addFilesToZip(files: Item): Promise<Buffer> {
	const zip = new JSZip();

	for (const file of files.files) {
		const fileBuffer = await downloadFile(file);
		if (file.split(files.topic + "/").length == 1) {
			zip.file(file.split("/")[file.split("/").length -1], fileBuffer);
			console.log(`Added: ${file.split("/")[file.split("/").length -1]}`);
		} else {
			zip.file(file.split(files.topic + "/")[1], fileBuffer);
			console.log(`Added: ${file.split(files.topic + "/")[1]}`);
		}
	}

	return zip.generateAsync({ type: 'nodebuffer' });
}

async function sendZip(matches: Item) {
	try {
		return await addFilesToZip(matches);
	} catch (error) {
		console.error(`Error: ${error}`);
	}
}
