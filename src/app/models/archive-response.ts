export interface IArchive {
  id: number;
  path: string;
  upload_date: string;
}

export interface IArchiveResponseList {
    result: IArchive[],
    total_count: number
  }