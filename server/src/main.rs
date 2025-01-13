mod models;
mod handlers;
mod config;
mod db;

use axum::Router;
use tokio::net::TcpListener;
use handlers::{auth, custom, files, user};

#[tokio::main]
async fn main() {
    dotenv::dotenv().ok();
    let pool = db::pool::create_pool().await;

    let app = Router::new()
        .nest("/auth", auth::auth_router(&pool))
        .nest("/custom", custom::custom_router(&pool))
        .nest("/user", user::user_router(&pool))
        .nest("/files", files::files_router(&pool));

    let listener = TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}