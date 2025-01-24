use crate::{
    config::send_email::send_email,
    models::{
        api::Response,
        app::AppState,
        auth::{Auth, ForgotPassword, LoginUser, RegisterUser, ResetPassword},
    },
    repositories::{
        auth_repository::{create_code, delete_code, find_code_by_code},
        user_repository::{create_user, find_user_by_email, update_password},
    },
};

use axum::{
    extract::{Json, State},
    response::IntoResponse,
};

#[utoipa::path(
    post,
    path = "/auth/login",
    request_body = LoginUser,
    responses(
        (status = 200, description = "Успешная аутентификация"),
        (status = 401, description = "Неверные учетные данные"),
        (status = 404, description = "Пользователь не найден"),
        (status = 500, description = "Ошибка сервера")
    ),
    tag = "auth"
)]
pub async fn login(
    State(app_state): State<AppState>,
    Json(body): Json<LoginUser>,
) -> impl IntoResponse {
    let check_user = find_user_by_email(&app_state.pool, body.email.clone()).await;

    let auth = Auth::new();

    match check_user {
        Ok(Some(user)) => {
            let hashed_password = auth.verify_password(&body.password, &user.password.unwrap());
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

#[utoipa::path(
    post,
    path = "/auth/register",
    request_body = RegisterUser,
    responses(
        (status = 200, description = "Успешная регистрация"),
        (status = 400, description = "Неверные учетные данные"),
        (status = 404, description = "Пользователь не найден"),
        (status = 500, description = "Ошибка сервера")
    ),
    tag = "auth"
)]
pub async fn register(
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
    let check_user = find_user_by_email(&app_state.pool, body.email.clone()).await;
    if let Ok(Some(_)) = check_user {
        return axum::Json(Response {
            code: 400,
            message: Some("User is already registered".to_string()),
            data: None,
        });
    }

    match create_user(
        &app_state.pool,
        RegisterUser {
            email: body.email,
            password: hashed_password,
            name: body.name,
        },
    )
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

#[utoipa::path(
    post,
    path = "/auth/forgot-password",
    request_body = ForgotPassword,
    responses(
        (status = 200, description = "Успешная аутентификация"),
        (status = 401, description = "Неверные учетные данные"),
        (status = 404, description = "Пользователь не найден"),
        (status = 500, description = "Ошибка сервера")
    ),
    tag = "auth"
)]
pub async fn forgot_password(
    State(app_state): State<AppState>,
    Json(body): Json<ForgotPassword>,
) -> impl IntoResponse {
    if body.email.is_empty() {
        return axum::Json(Response {
            code: 400,
            message: Some("Email cannot be empty".to_string()),
            data: None,
        });
    }
    let email = body.email.to_string();

    let check_user = find_user_by_email(&app_state.pool, email.clone()).await;
    match check_user {
        Ok(Some(user)) => {
            let code = Auth::generate_code();
            let _ = create_code(&app_state.pool, &code, user.id).await;
            let message = format!("Your code is: {}", &code);
            let _ = send_email(&email, "Forgot password".to_string(), message);

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

#[utoipa::path(
    post,
    path = "/auth/reset-password",
    request_body = ResetPassword,
    responses(
        (status = 200, description = "Успешная сброс пароля"),
        (status = 401, description = "Неверные учетные данные"),
        (status = 404, description = "Пользователь не найден"),
        (status = 500, description = "Ошибка сервера")
    ),
    tag = "auth"
)]
pub async fn reset_password(
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
    let user = find_user_by_email(&app_state.pool, body.email.clone()).await;
    let user = match user {
        Ok(Some(user)) => user,
        _ => {
            return axum::Json(Response {
                code: 404,
                message: Some("User not found".to_string()),
                data: None,
            });
        }
    };
    let code = body.code.to_string();
    let check_code = find_code_by_code(&app_state.pool, code.clone(), user.id.clone()).await;
    match check_code {
        Ok(Some(code)) => {
            let auth = Auth::new();
            let hashed_password = auth.hash_password(&body.new_password);
            let result = update_password(&app_state.pool, user.id, hashed_password).await;

            let _ = delete_code(&app_state.pool, code.code, user.id.clone()).await;

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
                }),
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
