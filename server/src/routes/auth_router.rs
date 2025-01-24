use crate::{models::app::AppState, services::auth_service::{forgot_password, login, register, reset_password}};
use axum::{routing::post, Router};
use sqlx::PgPool;

pub fn auth_router(pool: &PgPool) -> Router {
    Router::new()
        .route("/login", post(login))
        .route("/register", post(register))
        .route("/forgot-password", post(forgot_password))
        .route("/reset-password", post(reset_password))
        .with_state(AppState { pool: pool.clone() })
}