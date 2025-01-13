use sqlx::postgres::PgPool;

#[derive(Clone, Debug)]
pub struct AppState {
    pub pool: PgPool,
}

impl AppState {
    // pub async fn check_files(&self, name: String) -> Result<bool, sqlx::Error> {
    //     sqlx::query!("SELECT COUNT(*) as count FROM files WHERE name = $1", name)
    //         .fetch_one(&self.pool)
    //         .await
    //         .map(|row| row.count.unwrap_or(0) > 0)
    // }
}