import { paisRegiaoMap, tipoMap } from './maps.mjs'
import { localSelect, localInsert } from './local.mjs'

const cacheRegiao = new Map()

export async function regiaoGet(query, idPais, idRegiao) {
	const regiaoCached = cacheRegiao.get(idRegiao)
	if (regiaoCached) return { regiao: regiaoCached }
	const regiaoSrc = paisRegiaoMap[idRegiao]
	if (!regiaoSrc) throw new Error(`ID da região inválido: ${JSON.stringify(idRegiao)}`)
	const regiao = {
		id: null,
		sigla: regiaoSrc.sigla,
		nome: regiaoSrc.nome,
		codigo_ibge: idRegiao,
		id_dentro_de: idPais,
		id_pais: idPais,
		id_tipo: tipoMap.Regiao,
	}
	let insert = undefined
	const find = await localSelect(query, regiao)
	const { result: [ regiaoDb ] } = find
	if (regiaoDb) {
		regiao.id = regiaoDb.id
	} else {
		insert = await localInsert(query, regiao)
		const { result: { insertId } } = insert
		regiao.id = insertId
		// console.log(`Insert for região 1:`, regiao1Ins, getStats(regiao1Ins))
	}
	cacheRegiao.set(idRegiao, regiao)
	return { regiao, find, insert }
}
