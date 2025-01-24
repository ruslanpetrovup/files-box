use axum::extract::multipart::Multipart;
use serde_json::json;
use sqlx::PgPool;
use tokio::fs;
use tokio::fs::File;
use tokio::io::AsyncWriteExt;

use crate::models::files::{FileAction, FileResponse, FileData};


impl FileAction {
    pub async fn upload_file(
        pool: &PgPool,
        mut multipart: Multipart,
        user_id: i32,
    ) -> FileResponse {
        if let Some(field) = multipart.next_field().await.unwrap() {
            let file_name = field.file_name().unwrap_or("unknown").to_string();
            let file_content_type = field
                .content_type()
                .unwrap_or("application/octet-stream")
                .to_string();
            let body_bytes = field.bytes().await.unwrap();
            let file_size = body_bytes.len() as i32;

            let file_path = format!("uploads/{}", file_name);
            let file_type = file_name.split('.').last().unwrap_or("unknown").to_string();
            let mut file = File::create(&file_path).await.unwrap();
            file.write_all(&body_bytes).await.unwrap();

            let id_file = sqlx::query!(
                "INSERT INTO files (file_name, file_path, file_size, file_content_type, file_type, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
                file_name,
                file_path,
                file_size,
                file_content_type,
                file_type,
                user_id
            )
            .fetch_one(pool)
            .await;
            
            match id_file {
                Ok(id_file) => {
                    return FileResponse {
                        data: Some(json!({"id": id_file.id})),
                        error_message: "".to_string(),
                        is_error: false,
                    };
                }
                Err(_) => {
                    return FileResponse {
                        data: None,
                        error_message: "File not found".to_string(),
                        is_error: true,
                    };
                }
            }
        } else {
            return FileResponse {
                data: None,
                error_message: "No file uploaded".to_string(),
                is_error: true,
            };
        }
    }

    pub async fn get_files(pool: &PgPool, user_id: i32, file_ids: &[i32]) -> FileResponse {
        if file_ids.len() != 0 && file_ids[0] == -1 {
            let files = sqlx::query!("SELECT * FROM files WHERE user_id = $1", user_id)
                .fetch_all(pool)
                .await;
            if files.is_err() {
                return FileResponse {
                    data: None,
                    error_message: "Files not found".to_string(),
                    is_error: true,
                };
            }
            let files_data: Vec<FileData> = files.unwrap().into_iter().map(|file| FileData {
                id: file.id,
                file_name: file.file_name,
                file_path: file.file_path,
                file_size: file.file_size,
                file_content_type: file.file_content_type,
                file_type: file.file_type,
                user_id: file.user_id,
            }).collect();
            return FileResponse {
                data: Some(json!({"files": files_data})),
                error_message: "".to_string(),
                is_error: false,
            };
        }
        match sqlx::query!("SELECT * FROM files WHERE id = ANY($1)", file_ids)
            .fetch_all(pool)
            .await
        {
            Ok(files) => {
                if files.is_empty() {
                    return FileResponse {
                        data: Some(json!({"files": []})),
                        error_message: "Files not found".to_string(),
                        is_error: true,
                    };
                }
                let files_data: Vec<FileData> = files.into_iter().map(|file| FileData {
                    id: file.id,
                    file_name: file.file_name,
                    file_path: file.file_path,
                    file_size: file.file_size,
                    file_content_type: file.file_content_type,
                    file_type: file.file_type,
                    user_id: file.user_id,
                }).collect();
                return FileResponse {
                    data: Some(json!({"files": files_data})),
                    error_message: "".to_string(),
                    is_error: false,
                }
            }
            Err(e) => FileResponse {
                data: None,
                error_message: format!("Error fetching files: {}", e),
                is_error: true,
            },
        }
    }

    pub async fn delete_file(pool: &PgPool, file_id: i32) -> FileResponse {
        let check_file = sqlx::query!("SELECT id, file_path FROM files WHERE id = $1", file_id)
            .fetch_optional(pool)
            .await;

        match check_file {
            Ok(Some(file)) => {
                let result_delete = sqlx::query!("DELETE FROM files WHERE id = $1", file.id)
                    .execute(pool)
                    .await;
                if result_delete.is_err() {
                    return FileResponse {
                        data: None,
                        error_message: "Error deleting file from database".to_string(),
                        is_error: true,
                    };
                }
                let file_delete = fs::remove_file(file.file_path).await;
                if file_delete.is_err() {
                    return FileResponse {
                        data: None,
                        error_message: format!("Error deleting file: {}", file_delete.unwrap_err()),
                        is_error: true,
                    };
                }
                FileResponse {
                    data: Some(json!({"message": "File deleted successfully"})),
                    error_message: "".to_string(),
                    is_error: false,
                }
            }
            Ok(None) => FileResponse {
                data: None,
                error_message: "File not found".to_string(),
                is_error: true,
            },
            Err(_) => FileResponse {
                data: None,
                error_message: "Error checking file existence".to_string(),
                is_error: true,
            },
        }
    }
}
