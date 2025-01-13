use axum::http::HeaderMap;
use serde::Serialize;
use serde_json::Value;

use crate::config::auth::Auth;



#[derive(Serialize)]
pub struct Response {
    pub code: i32,
    pub message: Option<String>,
    pub data: Option<Value>
}


pub struct AuthVerifyResponse {
    pub authorized: bool,
    pub user_id: Option<i32>
}


pub async fn auth_header(headers: &HeaderMap) -> AuthVerifyResponse {
    // Получаем заголовок Authorization и конвертируем в строку
    let auth = match headers.get("Authorization") {
        Some(auth_header) => match auth_header.to_str() {
            Ok(auth_str) => auth_str,
            Err(_) => return AuthVerifyResponse { authorized: false, user_id: None }
        },
        None => return AuthVerifyResponse { authorized: false, user_id: None }
    };

    // Проверяем что заголовок не пустой
    if auth.is_empty() {
        return AuthVerifyResponse { authorized: false, user_id: None };
    }

    // Получаем токен из заголовка
    let token = match auth.split(" ").last() {
        Some(t) => t,
        None => return AuthVerifyResponse { authorized: false, user_id: None }
    };

    // Проверяем что токен не пустой
    if token.is_empty() {
        return AuthVerifyResponse { authorized: false, user_id: None };
    }

    // Проверяем JWT токен
    let auth = Auth::new();
    match auth.verify_jwt(token) {
        Ok(user_id) => AuthVerifyResponse { authorized: true, user_id: Some(user_id) },
        Err(_) => AuthVerifyResponse { authorized: false, user_id: None }
    }
}
