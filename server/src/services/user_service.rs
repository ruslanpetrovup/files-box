use axum::{
    extract::{Path, State},
    http::HeaderMap,
    response::IntoResponse,
    Json,
};

use crate::{
    config::api::auth_header,
    models::{api::Response, app::AppState}, 
    repositories::user_repository::find_user_by_id
};

#[axum::debug_handler]
pub async fn get_user(
    State(app_state): State<AppState>,
    Path(id): Path<i32>,
    headers: HeaderMap,
) -> impl IntoResponse {
    let verify = auth_header(&headers).await;
    if !verify.authorized {
        return Json(Response {
            code: 401,
            message: Some("Unauthorized".to_string()),
            data: None,
        });
    }

    let user = find_user_by_id(&app_state.pool, id).await;
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
        }
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
