use axum::Error;
use sqlx::PgPool;

use crate::models::{auth::RegisterUser, user::User};

pub async fn find_user_by_email(pool: &PgPool, email: String) -> Result<Option<User>, Error> {
    let user = sqlx::query!("SELECT id, email, name FROM users WHERE email = $1", email)
        .fetch_optional(pool)
        .await;

    match user {
        Ok(Some(user)) => Ok(Some(User {
            id: user.id,
            email: user.email,
            password: None,
            name: user.name,
        })),
        Ok(None) => Ok(None),
        Err(e) => Err(Error::new(format!("Error finding user: {}", e))),
    }
}

pub async fn find_user_by_id(pool: &PgPool, id: i32) -> Result<Option<User>, Error> {
    let user = sqlx::query!("SELECT * FROM users WHERE id = $1", id)
        .fetch_optional(pool)
        .await;

    match user {
        Ok(Some(user)) => Ok(Some(User {
            id: user.id,
            email: user.email,
            password: None,
            name: user.name,
        })),
        Ok(None) => Ok(None),
        Err(e) => Err(Error::new(format!("Error finding user: {}", e))),
    }
}

pub async fn create_user(pool: &PgPool, user: RegisterUser) -> Result<User, Error> {
    let user = sqlx::query!(
        "INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING *",
        user.email,
        user.password,
        user.name
    )
    .fetch_one(pool)
    .await;

    match user {
        Ok(user) => Ok(User {
            id: user.id,
            email: user.email,
            password: None,
            name: user.name,
        }),
        Err(e) => Err(Error::new(format!("Error creating user: {}", e))),
    }
}

pub async fn update_password(pool: &PgPool, user_id: i32, password: String) -> Result<User, Error> {
    let user = find_user_by_id(pool, user_id).await;
    let _ = match user {
        Ok(user) => user,
        Err(e) => return Err(Error::new(format!("Error updating password: {}", e))),
    };

    let user = sqlx::query!(
        "UPDATE users SET password = $1 WHERE id = $2 RETURNING *",
        password,
        user_id
    )
    .fetch_one(pool)
    .await;

    match user {
        Ok(user) => Ok(User {
            id: user.id,
            email: user.email,
            password: Some(user.password),
            name: user.name,
        }),
        Err(e) => Err(Error::new(format!("Error updating password: {}", e))),
    }
}
