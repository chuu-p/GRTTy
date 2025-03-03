use std::env;
use std::path::Path;

use example_api::serve;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenvy::from_path(Path::new("../example-spec/.env"))?;
    let server_addr = env::var("VITE_GRPC_SERVER_ADDRESS")?;
    let server_port = env::var("VITE_GRPC_SERVER_PORT")?;
    println!("server starting");
    let listener =
        tokio::net::TcpListener::bind(format!("{}:{}", server_addr, server_port)).await?;

    tokio::spawn(async { serve(listener).await });
    println!("server started");

    println!("Waiting now.");
    let mut buffer = String::new();
    std::io::stdin().read_line(&mut buffer)?;

    Ok(())
}
