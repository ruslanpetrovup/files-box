use crate::{
    config::{
        api_types::Response,
        app_state::AppState,
        auth::{Auth, ResetPassword},
        send_email::send_email,
    },
    models::user::{LoginUser, RegisterUser},
};
use axum::{
    extract::{Json, Query, State},
    response::IntoResponse,
    routing::post,
    Router,
};
use sqlx::PgPool;
pub fn auth_router(pool: &PgPool) -> Router {
    Router::new()
        .route("/login", post(login))
        .route("/register", post(register))
        .route("/forgot-password", post(forgot_password))
        .route("/reset-password", post(reset_password))
        .with_state(AppState { pool: pool.clone() })
}

async fn login(
    State(app_state): State<AppState>,
    Json(body): Json<LoginUser>,
) -> impl IntoResponse {
    let user = sqlx::query!("SELECT * FROM users WHERE email = $1", body.email)
        .fetch_optional(&app_state.pool)
        .await;

    let auth = Auth::new();

    match user {
        Ok(Some(user)) => {
            let hashed_password = auth.verify_password(&body.password, &user.password);
            if hashed_password {
                let token = auth.generate_jwt(user.id);
                axum::Json(Response {
                    code: 200,
                    message: Some("Successful authorization".to_string()),
                    data: Some(serde_json::json!({ "token": token })),
                })
            } else {
                axum::Json(Response {
                    code: 401,
                    message: Some("Invalid email or password".to_string()),
                    data: None,
                })
            }
        }
        Ok(None) => axum::Json(Response {
            code: 404,
            message: Some("User not found".to_string()),
            data: None,
        }),
        Err(_) => axum::Json(Response {
            code: 500,
            message: Some("Server error".to_string()),
            data: None,
        }),
    }
}

async fn register(
    State(app_state): State<AppState>,
    Json(body): Json<RegisterUser>,
) -> impl IntoResponse {
    if body.password.is_empty() || body.email.is_empty() || body.name.is_empty() {
        return axum::Json(Response {
            code: 400,
            message: Some("Password, email and name cannot be empty".to_string()),
            data: None,
        });
    }
    println!(
        "Registering user - email: {}, name: {}",
        body.email, body.name
    );
    let auth = Auth::new();
    let hashed_password = auth.hash_password(&body.password);
    let check_user = sqlx::query!("SELECT * FROM users WHERE email = $1", body.email)
        .fetch_optional(&app_state.pool)
        .await;

    if let Ok(Some(_)) = check_user {
        return axum::Json(Response {
            code: 400,
            message: Some("User is already registered".to_string()),
            data: None,
        });
    }

    match sqlx::query!(
        "INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id",
        body.email,
        hashed_password,
        body.name
    )
    .fetch_one(&app_state.pool)
    .await
    {
        Ok(user) => axum::Json(Response {
            code: 201,
            message: Some("User registered successfully".to_string()),
            data: Some(serde_json::json!({ "user_id": user.id })),
        }),
        Err(err) => axum::Json(Response {
            code: 500,
            message: Some(format!("Server error: {}", err)),
            data: None,
        }),
    }
}

async fn forgot_password(
    State(app_state): State<AppState>,
    Query(email): Query<String>,
) -> impl IntoResponse {
    if email.is_empty() {
        return axum::Json(Response {
            code: 400,
            message: Some("Email cannot be empty".to_string()),
            data: None,
        });
    }
    let email = email.to_string();
    let check_user = sqlx::query!("SELECT * FROM users WHERE email = $1", email)
        .fetch_optional(&app_state.pool)
        .await;
    match check_user {
        Ok(Some(_)) => {
            let code = Auth::generate_code();
            let message = format!("Your code is: {}", code);
            let _ = send_email(email, "Forgot password".to_string(), message);
            axum::Json(Response {
                code: 200,
                message: Some("Email sent successfully".to_string()),
                data: None,
            })
        }
        Ok(None) => axum::Json(Response {
            code: 404,
            message: Some("User not found".to_string()),
            data: None,
        }),
        Err(err) => axum::Json(Response {
            code: 500,
            message: Some(format!("Server error: {}", err)),
            data: None,
        }),
    }
}

async fn reset_password(
    State(app_state): State<AppState>,
    Json(body): Json<ResetPassword>,
) -> impl IntoResponse {
    if body.email.is_empty() || body.code.is_empty() || body.new_password.is_empty() {
        return axum::Json(Response {
            code: 400,
            message: Some("Email, code and password cannot be empty".to_string()),
            data: None,
        });
    }
    let email = body.email.to_string();
    let code = body.code.to_string();
    let check_code = sqlx::query!("SELECT * FROM codes WHERE code = $1", code)
        .fetch_optional(&app_state.pool)
        .await;
    match check_code {
        Ok(Some(_)) => {
            let auth = Auth::new();
            let hashed_password = auth.hash_password(&body.new_password);
            let result = sqlx::query!(
                "UPDATE users SET password = $1 WHERE email = $2",
                hashed_password,
                email
            )
            .execute(&app_state.pool)
            .await;

            let _ = sqlx::query!("DELETE FROM codes WHERE code = $1", code)
                .execute(&app_state.pool)
                .await.unwrap();

            match result {
                Ok(_) => axum::Json(Response {
                    code: 200,
                    message: Some("Password reset successfully".to_string()),
                    data: None,
                }),
                Err(err) => axum::Json(Response {
                    code: 500,
                    message: Some(format!("Server error: {}", err)),
                    data: None,
                })
            }
        }
        Ok(None) => axum::Json(Response {
            code: 404,
            message: Some("Code not found".to_string()),
            data: None,
        }),
        Err(err) => axum::Json(Response {
            code: 500,
            message: Some(format!("Server error: {}", err)),
            data: None,
        }),
    }
}
