use axum::Error;
use sqlx::PgPool;

use crate::models::auth::Code;

pub async fn find_code_by_code(pool: &PgPool, code: String, user_id: i32) -> Result<Option<Code>, Error> {
    let code = sqlx::query!(
        "SELECT * FROM codes WHERE code = $1 AND user_id = $2",
        code,
        user_id
    )
    .fetch_optional(pool)
    .await;

    match code {
        Ok(Some(code)) => Ok(Some(Code {
            id: code.id,
            code: code.code,
            user_id: code.user_id,
        })),
        Ok(None) => Ok(None),
        Err(e) => Err(Error::new(format!("Error finding code: {}", e))),
    }
}

pub async fn create_code(pool: &PgPool, code: &String, user_id: i32) -> Result<bool, Error> {
    let check_code = find_code_by_code(pool, code.clone(), user_id).await;
    if check_code.is_ok() {
        let update_code = sqlx::query!(
            "UPDATE codes SET code = $1 WHERE user_id = $2 RETURNING *",
            code,
            user_id
        )
        .fetch_one(pool)
        .await;
        return match update_code {
            Ok(_) => Ok(true),
            Err(e) => Err(Error::new(format!("Error updating code: {}", e))),
        };
    }
    let code = sqlx::query!(
        "INSERT INTO codes (code, user_id) VALUES ($1, $2) RETURNING *",
        code,
        user_id
    )
    .fetch_one(pool)
    .await;
    match code {
        Ok(_) => Ok(true),
        Err(e) => Err(Error::new(format!("Error creating code: {}", e))),
    }
}


pub async fn delete_code(pool: &PgPool, code: String, user_id: i32) -> Result<(), Error> {
    let code = sqlx::query!("DELETE FROM codes WHERE code = $1 AND user_id = $2", code, user_id)
        .execute(pool)
        .await;
    match code {
        Ok(_) => Ok(()),
        Err(e) => Err(Error::new(format!("Error deleting code: {}", e))),
    }
}
