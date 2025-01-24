use axum::{routing::get, Router};
use sqlx::PgPool;
use crate::{models::app::AppState, services::user_service::get_user};

pub fn user_router(pool: &PgPool) -> Router {
    Router::new()
        .route("/{id}", get(get_user))
        .with_state(AppState { pool: pool.clone() })
}