use axum::{
    extract::{Path, State}, http::HeaderMap, response::IntoResponse, routing::get, Json, Router
};
use sqlx::PgPool;

use crate::{
    config::{api_types::{auth_header, Response}, app_state::AppState},
    models::user::User,
};

pub fn user_router(pool: &PgPool) -> Router {
    Router::new()
        .route("/{id}", get(get_user))
        .with_state(AppState { pool: pool.clone() })
}

#[axum::debug_handler]
async fn get_user(State(app_state): State<AppState>, Path(id): Path<i32>, headers: HeaderMap) -> impl IntoResponse {
    let verify = auth_header(&headers).await;
    if !verify.authorized {
        return Json(Response {
            code: 401,
            message: Some("Unauthorized".to_string()),
            data: None,
        });
    }
    

    let user = sqlx::query_as!(User, "SELECT * FROM users WHERE id = $1", id)
        .fetch_optional(&app_state.pool)
        .await;

    match user {
        Ok(Some(user)) => {
            if verify.user_id.unwrap() != user.id {
                return Json(Response {
                    code: 403,
                    message: Some("Forbidden".to_string()),
                    data: None,
                });
            }
            Json(Response {
                code: 200,
                message: Some("User fetched successfully".to_string()),
                data: Some(serde_json::to_value(user).unwrap()),
            })
        },
        Ok(None) => Json(Response {
            code: 404,
            message: Some("User not found".to_string()),
            data: None,
        }),
        Err(e) => Json(Response {
            code: 500,
            message: Some(format!("Internal server error: {}", e)),
            data: None,
        }),
    }
}
