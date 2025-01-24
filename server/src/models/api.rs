use serde::Serialize;
use serde_json::Value;



#[derive(Serialize)]
pub struct Response {
    pub code: i32,
    pub message: Option<String>,
    pub data: Option<Value>
}