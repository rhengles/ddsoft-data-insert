
const colsFind = [
	'id',
	// 'sigla',
	// 'nome',
	'codigo_ibge',
	'id_dentro_de',
	'id_tipo',
	'id_pais',
	'id_estado',
	'id_municipio',
]

const colsInsert = [
	'id',
	'sigla',
	'nome',
	'codigo_postal',
	'codigo_postal_min',
	'codigo_postal_max',
	'codigo_ibge',
	'codigo_dne',
	'lat',
	'lng',
	'lat_min',
	'lat_max',
	'lng_min',
	'lng_max',
	'id_dentro_de',
	'id_tipo',
	'id_pais',
	'id_estado',
	'id_municipio',
]


function colSelectStr(col) {
	return `\`${col}\` = ?`
}

function colInsertStr(col) {
	return `\`${col}\``
}

function colPlaceholder() {
	return `?`
}

function getKeysValues(local, colList, fnCol, action) {
	const keys = []
	const values = []
	for (const col of colList) {
		const localCol = local[col]
		if (null == localCol) continue
		keys.push(fnCol(col))
		values.push(localCol)
	}
	if (!keys.length) throw new Error(`No colums with values to ${action}`, local)
	return { keys, values }
}

function selectKV(local) {
	return getKeysValues(local, colsFind, colSelectStr, 'select')
}

function insertKV(local) {
	return getKeysValues(local, colsInsert, colInsertStr, 'insert')
}

export async function localSelect(query, local) {
	const { keys, values } = selectKV(local)
	return await query({
		sql: `SELECT * from \`locais\` WHERE ${keys.join(' AND ')}`,
		values,
	})
}

export async function localInsert(query, local) {
	const { keys, values } = insertKV(local)
	const ph = keys.map(colPlaceholder)
	return await query({
		sql: `INSERT INTO \`locais\` (${keys.join(', ')}) VALUES (${ph.join(', ')})`,
		// sql: 'INSERT INTO `locais` (`id`, `sigla`, `nome`, `codigo_postal`, `codigo_postal_min`, `codigo_postal_max`, `codigo_ibge`, `codigo_dne`, `lat`, `lng`, `lat_min`, `lat_max`, `lng_min`, `lng_max`, `id_dentro_de`, `id_tipo`, `id_pais`, `id_estado`, `id_municipio`) VALUES (NULL, ?, ?, NULL, NULL, NULL, ?, NULL, NULL, NULL, NULL, NULL, NULL, NULL, ?, ?, ?, NULL, NULL)',
		values,
	})
}
