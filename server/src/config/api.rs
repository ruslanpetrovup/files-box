use axum::http::HeaderMap;

use crate::models::auth::{Auth, AuthVerifyResponse};

pub async fn auth_header(headers: &HeaderMap) -> AuthVerifyResponse {
    let auth = match headers.get("Authorization") {
        Some(auth_header) => match auth_header.to_str() {
            Ok(auth_str) => auth_str,
            Err(_) => return AuthVerifyResponse { authorized: false, user_id: None }
        },
        None => return AuthVerifyResponse { authorized: false, user_id: None }
    };

    if auth.is_empty() {
        return AuthVerifyResponse { authorized: false, user_id: None };
    }

    let token = match auth.split(" ").last() {
        Some(t) => t,
        None => return AuthVerifyResponse { authorized: false, user_id: None }
    };

    if token.is_empty() {
        return AuthVerifyResponse { authorized: false, user_id: None };
    }

    let auth = Auth::new();
    match auth.verify_jwt(token) {
        Ok(user_id) => AuthVerifyResponse { authorized: true, user_id: Some(user_id) },
        Err(_) => AuthVerifyResponse { authorized: false, user_id: None }
    }
}
