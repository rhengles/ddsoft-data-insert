import { tipoMap } from './maps.mjs'
import { localSelect, localInsert } from './local.mjs'

const cacheMunicipio = new Map()

export async function municipioGet(query, estadoDiv2, idMunicipio, nomeMunicipio) {
	const cached = cacheMunicipio.get(idMunicipio)
	if (cached) return { municipio: cached }
	const municipio = {
		id: null,
		sigla: null,
		nome: nomeMunicipio,
		codigo_ibge: idMunicipio,
		id_dentro_de: estadoDiv2.id,
		id_tipo: tipoMap.Municipio,
		id_pais: estadoDiv2.id_pais,
		id_estado: estadoDiv2.id_estado,
	}
	let insert = undefined
	const find = await localSelect(query, municipio)
	const { result: [ municipioDb ] } = find
	if (municipioDb) {
		municipio.id = municipioDb.id
	} else {
		insert = await localInsert(query, municipio)
		const { result: { insertId } } = insert
		municipio.id = insertId
	}
	cacheMunicipio.set(idMunicipio, municipio)
	return { municipio, find, insert }
}
