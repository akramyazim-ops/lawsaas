export interface Document {
    id: string
    name: string
    file_path: string
    file_type: string | null
    size_bytes: number | null
    case_id: string | null
    uploaded_by: string | null
    created_at: string
}

export type DocumentInsert = Omit<Document, 'id' | 'created_at'>
export type DocumentUpdate = Partial<DocumentInsert>
