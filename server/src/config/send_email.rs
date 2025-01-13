use lettre::transport::smtp::authentication::Credentials;
use lettre::{Message, SmtpTransport, Transport};
use lettre::message::Body;

const SMTP_SERVER: &str = "smtp.example.com";
const SMTP_USERNAME: &str = "your_username";
const SMTP_PASSWORD: &str = "your_password";

pub fn send_email(email: String, subject: String, message: String) {
    // Create email
    let email = Message::builder()
        .from("verify-code@filemanager.com".parse().unwrap())
        .to(email.parse().unwrap()) 
        .subject(subject) 
        .body(Body::new(message))
        .unwrap();

    // Set SMTP server parameters
    let creds = Credentials::new(SMTP_USERNAME.to_string(), SMTP_PASSWORD.to_string());

    // Create SMTP transport
    let mailer = SmtpTransport::relay(SMTP_SERVER)
        .unwrap()
        .credentials(creds)
        .build();

    // Send email
    match mailer.send(&email) {
        Ok(_) => println!("Email sent successfully!"),
        Err(e) => eprintln!("Error sending email: {:?}", e),
    }
}
