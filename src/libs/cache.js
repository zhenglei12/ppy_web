const cacheKeys = '__keys__';
const cacheKeysDelimiter = ',';

var cache = new Map();
var cacheForeverKeys = new Set(); // 持久化缓存key集合

class CacheManager {
	constructor() {
		restoreStorage();
	}
	set(key, value, {
		ttl = 0
	} = {}) {
		save(key, value, {
			ttl,
			force: false,
			forever: false,
			once: false
		});
	}
	once(key, value, {
		ttl = 0,
		force = false
	} = {}) {
		save(key, value, {
			ttl,
			force,
			once: true
		});
	}
	forever(key, value, {
		ttl = 0,
		force = false
	} = {}) {
		save(key, value, {
			ttl,
			force,
			forever: true
		})
	}
	get(key) {
		let item = fetch(key);
		console.log('读取缓存', key, item);
		return item && item.data;
	}
	remove(key) {
		remove(key);
		console.log('删除缓存', key);
	}
	clear(force = false) {
		clear(force);
		console.log('清空缓存', force);
	}
}

/**
 * 添加缓存
 * @param {*} key 缓存key
 * @param {*} value 缓存数据
 * @param {*} param2 缓存配置 ttl-有效期 once-一次性存储 forever-持久化缓存 force-强制缓存
 */
function save(key, value, {
	ttl = 0,
	once = false,
	forever = false,
	force = false
} = {}) {
	let item = {
		data: value,
		ttl,
		once: !forever && once,
		forever,
		force,
		created_at: +new Date()
	}
	console.log('增加缓存', key, item);
	cache.set(key, item);
	if (forever) {
		cacheForeverKeys.add(key);
		updateCacheKeys();
		localStorage.setItem(key, JSON.stringify(item));
	}
}

/**
 * 读取缓存
 * @param {*} key 缓存key
 */
function fetch(key) {
	let item = cache.get(key);
	if (!item) {
		item = JSON.parse(localStorage.getItem(key));
	}
	if (item) {
		if (item.once) {
			remove(key);
		}
		if (item.ttl && (item.created_at + item.ttl < +new Date())) {
			remove(key);
		}
	}
	return item;
}

/**
 * 更新持久化缓存key集合
 */
function updateCacheKeys() {
	let cacheKeysStr = Array.from(cacheForeverKeys).join(cacheKeysDelimiter);
	localStorage.setItem(cacheKeys, cacheKeysStr);
}

/**
 * 删除缓存
 * @param {*} key 缓存 key
 * @param {*} force 强制删除
 */
function remove(key) {
	cache.delete(key);
	cacheForeverKeys.delete(key);
	updateCacheKeys();
	localStorage.removeItem(key);
}

/**
 * 清除缓存
 * @param {*} force 强制清除
 */
function clear(force = false) {
	Array.from(cacheForeverKeys).forEach(_ => {
		let item = cache.get(_);
		if (item.force && !force) {
			return;
		}
		remove(_);
	})
}

/**
 * 同步持久化缓存至本地
 */
function restoreStorage() {
	cache = new Map();
	cacheForeverKeys = new Set();
	let keysStr = localStorage.getItem(cacheKeys);
	let keysArr = keysStr ? keysStr.split(cacheKeysDelimiter) : [];
	keysArr.forEach(_ => {
		let item = fetch(_);
		if (item) {
			cache.set(_, item);
			cacheForeverKeys.add(_);
		}
	})
	console.log('缓存同步完成', cache);
}

export default new CacheManager();