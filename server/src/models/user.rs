use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Serialize, Deserialize, Debug, Clone, ToSchema)]
pub struct User {
    pub id: i32,
    pub email: String,
    pub password: Option<String>,
    pub name: String,
}
