import mysql from 'mysql'
import { fileURLToPath } from 'url'
import { join as pathJoin } from 'path'
import {
	TransformObject,
	StringToLines,
	tryOpenReadPromise,
} from '@arijs/frontend/server/utils/streams'
import { regiaoGet, regiaoIdByEstadoId } from './regiao.mjs'
import { estadoGet } from './estado.mjs'
import { paisBrasil } from './maps.mjs'
import credentials from './credentials.local.mjs'

const dirname = fileURLToPath(new URL('./_ignore', import.meta.url)).replace(/\/+$/,'')

const csvStreamOpt = {
	encoding: 'utf-8',
	highWaterMark: 1024,
}

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
	// const idPais = paisBrasil.id
	// for (let idRegiao = 1; idRegiao <= 5; idRegiao++) {
	// 	// const idRegiao = 2
	// 	const { regiao } = await regiaoGet(query, idPais, idRegiao)
	// 	console.log(`Result for região ${idRegiao}:`, regiao)
	// }
	await runCsv(query)
	await connectEnd(conn)
}

function runCsv(query) {
	return new Promise(async (resolve, reject) => {
		try {
			const rs = await tryOpenReadPromise(
				pathJoin(dirname, 'RELATORIO_DTB_BRASIL_MUNICIPIO.csv'),
				csvStreamOpt
			)

			const pc = new StringToLines()

			const output = new TransformObject({ process: row => processRow(query, row) })

			output.on('data', () => {/*console.log(`output event data`, r.length, r[0])*/})
			output.on('end', () => console.log(`output end`))
			output.on('error', reject)
			output.on('close', resolve)

			rs.pipe(pc).pipe(output)
		} catch (e) {
			reject(e)
		}
	})
}

async function processRow(query, { row, rowIndex }) {
	const [r1, r2, ,,,,,,,,, r3, r4] = row.split('\t')
	if (rowIndex % 50 == 0) console.log(rowIndex, r1, r2, r3, r4)
	if (rowIndex === 0) return;

	const idPais = paisBrasil.id
	const idEstado = r1
	const idRegiao = regiaoIdByEstadoId(idEstado)

	const { regiao, find: findRegiao } = await regiaoGet(query, idPais, idRegiao)
	if (findRegiao) console.log(`Result for região ${idRegiao}:`, regiao)

	const { estado, find: findEstado } = await estadoGet(query, regiao, idEstado, r2)
	if (findEstado) console.log(`Result for estado ${idEstado}:`, estado)
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
