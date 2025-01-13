use axum::{response::IntoResponse, routing::get, Router};
use sqlx::PgPool;
use crate::config::{api_types::Response, app_state::AppState};


pub fn custom_router(pool: &PgPool) -> Router {
    Router::new()
    .route("/", get(root))
    .with_state(AppState {pool: pool.clone()})
}

async fn root() -> impl IntoResponse {
    axum::Json(Response { code: 200, message: Some("Hello".to_string()), data: None })
}
