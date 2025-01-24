use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

pub struct FileAction {
}

#[derive(Serialize,ToSchema)]
pub struct FileResponse {
    pub data: Option<serde_json::Value>,
    pub error_message: String,
    pub is_error: bool,
}

#[derive(Serialize, Deserialize)]
pub struct GetFiles {
    pub file_ids: Vec<i32>,
}


#[derive(Serialize)]
pub struct FileData {
    pub id: i32,
    pub file_name: String,
    pub file_path: String,
    pub file_size: i32,
    pub file_content_type: String,
    pub file_type: String,
    pub user_id: i32,
}

#[derive(Serialize, Deserialize, ToSchema)]
pub struct FileUploadRequest {
    pub file_name: String,
    pub file_path: String,
    pub file_size: i32,
    pub file_content_type: String,
    pub file_type: String,
}