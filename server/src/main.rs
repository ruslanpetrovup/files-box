mod models;
mod services;
mod config;
mod db;
mod routes;
mod repositories;

use crate::{
    routes::auth_router::auth_router,
    routes::files_router::files_router,
    routes::user_router::user_router,
};
use axum::Router;
use tokio::net::TcpListener;
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;


#[derive(OpenApi)]
#[openapi(
    paths(
        services::auth_service::login,
        services::auth_service::register,
        services::auth_service::forgot_password,
        services::auth_service::reset_password
    ),
    components(
        schemas(models::user::User, models::auth::RegisterUser, models::auth::LoginUser, models::auth::ResetPassword)
    ),
    tags(
        (name = "auth", description = "Аутентификация"),
        (name = "files", description = "Операции с файлами"),
        (name = "user", description = "Операции с пользователями")
    )
)]
struct ApiDoc;

#[tokio::main]
async fn main() {
    dotenv::dotenv().ok();
    let pool = db::pool::create_pool().await;

    let app = Router::new()
        .nest("/auth", auth_router(&pool))
        .nest("/files", files_router(&pool))
        .nest("/user", user_router(&pool))
        .merge(SwaggerUi::new("/swagger-ui")
            .url("/api-docs/openapi.json", ApiDoc::openapi()));

    let listener = TcpListener::bind("0.0.0.0:3000").await.unwrap();
    println!("Сервер запущен на http://0.0.0.0:3000");
    println!("Swagger UI доступен на http://0.0.0.0:3000/swagger-ui/");
    
    axum::serve(listener, app).await.unwrap();
}