import { tipoMap } from './maps.mjs'
import { localSelect, localInsert } from './local.mjs'

const cacheDistrito = new Map()

export async function distritoGet(query, municipio, idDistrito, nomeDistrito) {
	const cached = cacheDistrito.get(idDistrito)
	if (cached) return { distrito: cached }
	const distrito = {
		id: null,
		sigla: null,
		nome: nomeDistrito,
		codigo_ibge: idDistrito,
		id_dentro_de: municipio.id,
		id_tipo: tipoMap.Distrito,
		id_pais: municipio.id_pais,
		id_estado: municipio.id_estado,
		id_municipio: municipio.id,
	}
	let insert = undefined
	const find = await localSelect(query, distrito)
	const { result: [ distritoDb ] } = find
	if (distritoDb) {
		distrito.id = distritoDb.id
	} else {
		insert = await localInsert(query, distrito)
		const { result: { insertId } } = insert
		distrito.id = insertId
	}
	cacheDistrito.set(idDistrito, distrito)
	return { distrito, find, insert }
}
