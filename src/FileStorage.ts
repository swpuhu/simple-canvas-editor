class FileStorage {
    private db: IDBDatabase | null = null;
    private readonly DB_NAME = 'fileCache';
    private readonly STORE_NAME = 'files';
    private readonly DB_VERSION = 1;

    constructor() {
        this.initDB();
    }

    private initDB(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = event => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(this.STORE_NAME)) {
                    db.createObjectStore(this.STORE_NAME);
                }
            };
        });
    }

    async saveFile(hash: string, fileData: ArrayBuffer): Promise<void> {
        if (!this.db) throw new Error('数据库未初始化');

        return new Promise((resolve, reject) => {
            if (!this.db) throw new Error('数据库未初始化');

            const transaction = this.db.transaction(
                this.STORE_NAME,
                'readwrite'
            );
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.put(fileData, hash);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getFile(hash: string): Promise<ArrayBuffer | null> {
        if (!this.db) throw new Error('数据库未初始化');

        return new Promise((resolve, reject) => {
            if (!this.db) throw new Error('数据库未初始化');
            const transaction = this.db.transaction(
                this.STORE_NAME,
                'readonly'
            );
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.get(hash);

            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    }
}

const fileStorage = new FileStorage();

export default fileStorage;
