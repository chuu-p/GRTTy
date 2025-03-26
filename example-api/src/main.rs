use color_eyre::eyre::Report;
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
use logforth::append;
use logforth::filter::EnvFilter;
use std::env;
use std::path::Path;

use example_api::{establish_connection, serve};
use log::info;

pub const MIGRATIONS: EmbeddedMigrations = embed_migrations!("./migrations");

#[tokio::main]
async fn main() -> Result<(), Report> {
    logforth::builder()
        .dispatch(|d| {
            d.filter(EnvFilter::from_default_env_or("trace"))
                .append(append::Stderr::default())
        })
        .apply();

    dotenvy::from_path(Path::new("../example-spec/.env"))?;
    color_eyre::install()?;

    let mut connection = establish_connection();

    info!("Running migrations");
    connection.run_pending_migrations(MIGRATIONS).unwrap();

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
