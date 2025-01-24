use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Serialize, Deserialize, ToSchema)]
pub struct Auth {
    pub secret_key: String,
}

#[derive(Serialize, Deserialize, Debug, Clone, ToSchema)]
pub struct RegisterUser {
    pub email: String,
    pub password: String,
    pub name: String,
}

#[derive(Serialize, Deserialize, Debug, Clone, ToSchema)]
pub struct Code {
    pub id: i32,
    pub code: String,
    pub user_id: i32,
}

#[derive(Serialize, Deserialize, Debug, Clone, ToSchema)]
pub struct LoginUser {
    pub email: String,
    pub password: String,
}

#[derive(Serialize, Deserialize, ToSchema)]
pub struct ResetPassword {
    pub email: String,
    pub code: String,
    pub new_password: String,
}

#[derive(Serialize, Deserialize, ToSchema)]
pub struct ForgotPassword {
    pub email: String,
}

#[derive(Serialize,Deserialize, ToSchema)]
pub struct Claims {
    pub sub: i32,
    pub exp: usize,
}

#[derive(Serialize, Deserialize, ToSchema)]
pub struct AuthVerifyResponse {
    pub authorized: bool,
    pub user_id: Option<i32>
}


