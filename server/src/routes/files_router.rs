use axum::{routing::post, Router};
use sqlx::PgPool;
use crate::{models::app::AppState, services::files_service::{upload_file, get_files, delete_file}};

pub fn files_router(pool: &PgPool) -> Router {
    Router::new()
        .route("/upload", post(upload_file))
        .route("/get", post(get_files))
        .route("/delete", post(delete_file))
        .with_state(AppState { pool: pool.clone() })
}