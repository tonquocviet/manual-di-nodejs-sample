import type {
  Database,
  DatabaseRecord
} from "./Database.js";

export class MockDatabase implements Database {
  private readonly collections = new Map<
    string,
    Map<string, DatabaseRecord>
  >();

  async insert<TRecord extends DatabaseRecord>(
    collectionName: string,
    record: TRecord
  ): Promise<TRecord> {
    const collection = this.getCollection(collectionName);
    const storedRecord = { ...record };

    collection.set(storedRecord.id, storedRecord);

    return { ...storedRecord };
  }

  async findById<TRecord extends DatabaseRecord>(
    collectionName: string,
    id: string
  ): Promise<TRecord | null> {
    const collection = this.getCollection(collectionName);
    const record = collection.get(id);

    return record ? ({ ...record } as TRecord) : null;
  }

  async findOne<TRecord extends DatabaseRecord>(
    collectionName: string,
    predicate: (record: TRecord) => boolean
  ): Promise<TRecord | null> {
    const collection = this.getCollection(collectionName);

    for (const record of collection.values()) {
      const typedRecord = { ...record } as TRecord;

      if (predicate(typedRecord)) {
        return typedRecord;
      }
    }

    return null;
  }

  private getCollection(
    collectionName: string
  ): Map<string, DatabaseRecord> {
    const existingCollection = this.collections.get(collectionName);

    if (existingCollection) {
      return existingCollection;
    }

    const collection = new Map<string, DatabaseRecord>();
    this.collections.set(collectionName, collection);

    return collection;
  }
}
