export interface DatabaseRecord {
  id: string;
}

export interface Database {
  insert<TRecord extends DatabaseRecord>(
    collectionName: string,
    record: TRecord
  ): Promise<TRecord>;

  findById<TRecord extends DatabaseRecord>(
    collectionName: string,
    id: string
  ): Promise<TRecord | null>;

  findOne<TRecord extends DatabaseRecord>(
    collectionName: string,
    predicate: (record: TRecord) => boolean
  ): Promise<TRecord | null>;
}
