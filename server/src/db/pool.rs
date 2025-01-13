use sqlx::postgres::PgPool;

pub async fn create_pool() -> PgPool {
    let db_url = std::env::var("DATABASE_URL").expect("DATABASE_URL is not set");
    PgPool::connect(&db_url)
        .await
        .expect("Failed to connect to database")
}