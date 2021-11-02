import mysql from 'mysql'
import {
	TransformObject,
	StringToLines,
} from '@arijs/frontend/server/utils/streams'
import { regiaoGet } from './regiao.mjs'
import { paisBrasil } from './maps.mjs'
import credentials from './credentials.local.mjs'

main()

async function main() {
	try {
		await run()
		console.log(`Process finished`)
	} catch (e) {
		console.error(`Process error`, e)
	}
}

async function run() {
	const conn = await connect(credentials)
	const query = fnQuery(conn)
	const idPais = paisBrasil.id
	for (let idRegiao = 1; idRegiao <= 5; idRegiao++) {
		// const idRegiao = 2
		const { regiao } = await regiaoGet(query, idPais, idRegiao)
		console.log(`Result for região ${idRegiao}:`, regiao)
	}
	await connectEnd(conn)
}

function connect(params) {
	return new Promise((resolve, reject) => {
		const conn = mysql.createConnection(params)
		conn.connect(err => err ? reject(err) : resolve(conn))
	})
}

function connectEnd(conn) {
	return new Promise((resolve, reject) => {
		conn.end(err => err ? reject(err) : resolve())
	})
}

function printField(field) {
	return `${field.table}.${field.name} ${field.type}/${field.length} ${field.flags}`
}

function fnQuery(conn, { withFields } = {}) {
	return query =>
		new Promise((resolve, reject) =>
		conn.query(query, (error, result, fields) =>
			error
			? reject({
				error,
				result,
				fields: withFields ? fields : undefined
			})
			: resolve({
				result,
				fields: withFields ? fields?.map(printField) : undefined
			})
		)
	)
}

function getStats(ret) {
	const { insertId, affectedRows } = ret.result
	return { insertId, affectedRows }
}
