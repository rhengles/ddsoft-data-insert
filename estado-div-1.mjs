import { tipoMap } from './maps.mjs'
import { localSelect, localInsert } from './local.mjs'

const cacheEstadoDiv1 = new Map()

export async function estadoDiv1Get(query, estado, idDiv1, nomeDiv1) {
	const cached = cacheEstadoDiv1.get(idDiv1)
	if (cached) return { estadoDiv1: cached }
	const estadoDiv1 = {
		id: null,
		sigla: null,
		nome: nomeDiv1,
		codigo_ibge: idDiv1,
		id_dentro_de: estado.id,
		id_tipo: tipoMap.Estado_Div_1,
		id_pais: estado.id_pais,
		id_estado: estado.id,
	}
	let insert = undefined
	const find = await localSelect(query, estadoDiv1)
	const { result: [ estadoDiv1Db ] } = find
	if (estadoDiv1Db) {
		estadoDiv1.id = estadoDiv1Db.id
	} else {
		insert = await localInsert(query, estadoDiv1)
		const { result: { insertId } } = insert
		estadoDiv1.id = insertId
	}
	cacheEstadoDiv1.set(idDiv1, estadoDiv1)
	return { estadoDiv1, find, insert }
}
