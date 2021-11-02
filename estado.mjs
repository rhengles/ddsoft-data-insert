import { estadosMap, tipoMap } from './maps.mjs'
import { localSelect, localInsert } from './local.mjs'

const cacheEstado = new Map()

export async function estadoGet(query, regiao, idEstado, nomeEstado) {
	const cached = cacheEstado.get(idEstado)
	if (cached) return { estado: cached }
	const estadoSrc = estadosMap[idEstado]
	if (!estadoSrc) throw new Error(`ID do estado inválido: ${JSON.stringify(idEstado)}`)
	const estado = {
		id: null,
		sigla: estadoSrc.sigla,
		nome: nomeEstado,
		codigo_ibge: idEstado,
		id_dentro_de: regiao.id,
		id_pais: regiao.id_pais,
		id_tipo: tipoMap.Estado,
	}
	let insert = undefined
	const find = await localSelect(query, estado)
	const { result: [ estadoDb ] } = find
	if (estadoDb) {
		estado.id = estadoDb.id
	} else {
		insert = await localInsert(query, estado)
		const { result: { insertId } } = insert
		estado.id = insertId
	}
	cacheEstado.set(idEstado, estado)
	return { estado, find, insert }
}
