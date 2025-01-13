use crate::config::{
    api_types::{auth_header, Response},
    app_state::AppState,
    files_actions::{FileAction, GetFiles},
};
use axum::{
    extract::{multipart::Multipart, Query, State},
    http::HeaderMap,
    response::IntoResponse,
    routing::post,
    Json, Router,
};
use serde_json::json;
use sqlx::PgPool;

pub fn files_router(pool: &PgPool) -> Router {
    Router::new()
        .route("/upload", post(upload_file))
        .route("/get", post(get_files))
        .route("/delete", post(delete_file))
        .with_state(AppState { pool: pool.clone() })
}

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
    let check_user = sqlx::query!(
        "SELECT id FROM users WHERE id = $1",
        verify.user_id.unwrap()
    )
    .fetch_optional(&pool.pool)
    .await;
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

    let check_user = sqlx::query!(
        "SELECT id FROM users WHERE id = $1",
        verify.user_id.unwrap()
    )
    .fetch_optional(&pool.pool)
    .await;
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

    let check_user = sqlx::query!(
        "SELECT id FROM users WHERE id = $1",
        verify.user_id.unwrap()
    )
    .fetch_optional(&pool.pool)
    .await;

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
