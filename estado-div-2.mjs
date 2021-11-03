import { tipoMap } from './maps.mjs'
import { localSelect, localInsert } from './local.mjs'

const cacheEstadoDiv2 = new Map()

export async function estadoDiv2Get(query, estadoDiv1, idDiv2, nomeDiv2) {
	const cached = cacheEstadoDiv2.get(idDiv2)
	if (cached) return { estadoDiv2: cached }
	const estadoDiv2 = {
		id: null,
		sigla: null,
		nome: nomeDiv2,
		codigo_ibge: idDiv2,
		id_dentro_de: estadoDiv1.id,
		id_tipo: tipoMap.Estado_Div_2,
		id_pais: estadoDiv1.id_pais,
		id_estado: estadoDiv1.id_estado,
	}
	let insert = undefined
	const find = await localSelect(query, estadoDiv2)
	const { result: [ estadoDiv2Db ] } = find
	if (estadoDiv2Db) {
		estadoDiv2.id = estadoDiv2Db.id
	} else {
		insert = await localInsert(query, estadoDiv2)
		const { result: { insertId } } = insert
		estadoDiv2.id = insertId
	}
	cacheEstadoDiv2.set(idDiv2, estadoDiv2)
	return { estadoDiv2, find, insert }
}
