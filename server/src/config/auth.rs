use std::env;

use bcrypt::{hash, verify};
use jsonwebtoken::{encode, Header, EncodingKey, decode, DecodingKey, Validation, TokenData};
use chrono::{Utc, Duration};
use rand::Rng;
use crate::models::auth::{Auth, Claims};

impl Auth {
    pub fn new() -> Auth {
        let secret_key = env::var("SECRET_KEY").unwrap();
        Auth { secret_key }
    }

    pub fn generate_code() -> String {
        let code = rand::thread_rng().gen_range(1000..9999);
        code.to_string()
    }

    pub fn generate_jwt(&self, user_id: i32) -> String {
        let claims = Claims {
            sub: user_id,
            exp: (Utc::now() + Duration::hours(24)).timestamp() as usize,
        };
        encode(&Header::default(), &claims, &EncodingKey::from_secret(self.secret_key.as_bytes())).unwrap()
    }  

    pub fn verify_jwt(&self, token: &str) -> Result<i32, jsonwebtoken::errors::Error> {
        let token_data: TokenData<Claims> = decode::<Claims>(token, &DecodingKey::from_secret(self.secret_key.as_bytes()), &Validation::default())?;
        Ok(token_data.claims.sub)
    }

    pub fn hash_password(&self, password: &str) -> String {
        hash(password, 10).unwrap()
    }

    pub fn verify_password(&self, password: &str, hashed_password: &str) -> bool {
        verify(password, hashed_password).unwrap()
    }
}