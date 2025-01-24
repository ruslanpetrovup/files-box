use crate::{config::api::auth_header, models::files::{FileResponse, FileUploadRequest}, repositories::user_repository::find_user_by_id};
use axum::{
    extract::{multipart::Multipart, Query, State},
    http::HeaderMap,
    response::IntoResponse,
    Json
};
use serde_json::json;
use crate::models::api::Response;
use crate::models::app::AppState;
use crate::models::files::{FileAction, GetFiles};


#[utoipa::path(
    post,
    path = "/files/upload",
    request_body = FileUploadRequest,
    responses(
        (status = 200, description = "File successfully uploaded", body = FileResponse),
        (status = 401, description = "Unauthorized access"),
        (status = 404, description = "User not found"),
        (status = 500, description = "Server error")
    ),
    tag = "files"
)]
#[axum::debug_handler]
pub async fn upload_file(
    State(pool): State<AppState>,
    headers: HeaderMap,
    multipart: Multipart,
) -> impl IntoResponse {
    let verify = auth_header(&headers).await;
    if !verify.authorized || verify.user_id.is_none() {
        return Json(Response {
            code: 401,
            message: Some("Unauthorized".to_string()),
            data: None,
        });
    }
    let check_user = find_user_by_id(&pool.pool, verify.user_id.unwrap()).await;
    if check_user.is_err() {
        return Json(Response {
            code: 401,
            message: Some("User not found".to_string()),
            data: None,
        });
    }

    let file_response =
        FileAction::upload_file(&pool.pool, multipart, verify.user_id.unwrap()).await;
    if file_response.is_error {
        return Json(Response {
            code: 400,
            message: Some(file_response.error_message),
            data: None,
        });
    }

    Json(Response {
        code: 200,
        message: Some("File uploaded".to_string()),
        data: Some(json!(file_response.data.unwrap())),
    })
}

/// Получение списка файлов
#[utoipa::path(
    post,
    path = "/files/get",
    request_body = GetFiles,
    responses(
        (status = 200, description = "Файлы успешно найдены", body = FilesResponse),
        (status = 401, description = "Неавторизованный доступ"),
        (status = 404, description = "Пользователь не найден"),
        (status = 500, description = "Ошибка сервера")
    ),
    tag = "files"
)]
#[axum::debug_handler]
pub async fn get_files(
    State(pool): State<AppState>,
    headers: HeaderMap,
    body: Json<GetFiles>,
) -> impl IntoResponse {
    let verify = auth_header(&headers).await;
    if !verify.authorized || verify.user_id.is_none() {
        return Json(Response {
            code: 401,
            message: Some("Unauthorized".to_string()),
            data: None,
        });
    }

    let check_user = find_user_by_id(&pool.pool, verify.user_id.unwrap()).await;
    if check_user.is_err() {
        return Json(Response {
            code: 401,
            message: Some("User not found".to_string()),
            data: None,
        });
    }

    let files = FileAction::get_files(&pool.pool, verify.user_id.unwrap(), &body.file_ids).await;
    if files.is_error {
        return Json(Response {
            code: 400,
            message: Some(files.error_message),
            data: None,
        });
    }

    Json(Response {
        code: 200,
        message: Some("Files found".to_string()),
        data: files.data,
    })
}

/// Удаление файла
#[utoipa::path(
    delete,
    path = "/files/delete",
    params(
        ("file_id" = i32, description = "ID удаляемого файла", example = 123)
    ),
    responses(
        (status = 200, description = "Файл успешно удалён", body = FileResponse),
        (status = 401, description = "Неавторизованный доступ"),
        (status = 404, description = "Пользователь не найден"),
        (status = 500, description = "Ошибка сервера")
    ),
    tag = "files"
)]
#[axum::debug_handler]
pub async fn delete_file(
    State(pool): State<AppState>,
    headers: HeaderMap,
    file_id: Query<i32>,
) -> impl IntoResponse {
    let verify = auth_header(&headers).await;
    if !verify.authorized || verify.user_id.is_none() {
        return Json(Response {
            code: 401,
            message: Some("Unauthorized".to_string()),
            data: None,
        });
    }

    let check_user = find_user_by_id(&pool.pool, verify.user_id.unwrap()).await;

    if check_user.is_err() {
        return Json(Response {
            code: 401,
            message: Some("User not found".to_string()),
            data: None,
        });
    }

    let file_response = FileAction::delete_file(&pool.pool, *file_id).await;
    if file_response.is_error {
        return Json(Response {
            code: 400,
            message: Some(file_response.error_message),
            data: None,
        });
    }

    Json(Response {
        code: 200,
        message: Some("File deleted".to_string()),
        data: Some(json!(file_response.data.unwrap())),
    })
}
