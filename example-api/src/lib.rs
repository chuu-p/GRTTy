use crate::models::NewHealthCheck;
use chrono::Utc;
use diesel::prelude::*;
use diesel::{Connection, SqliteConnection};
use dotenvy::dotenv;
use openfg::health_check_service_server::{HealthCheckService, HealthCheckServiceServer};
use openfg::{HealthCheckReply, HealthCheckRequest};
use schema::health_checks;
use std::env;
use std::time::Duration;
use tokio::net::TcpListener;
use tonic::{transport::Server, Request, Response, Status};
use tower_http::cors::{Any, CorsLayer};

pub mod openfg {
    tonic::include_proto!("example");
}

pub mod models;
pub mod schema;

pub fn establish_connection() -> SqliteConnection {
    dotenv().ok();

    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    println!("Connecting to {}", database_url);
    SqliteConnection::establish(&database_url)
        .unwrap_or_else(|_| panic!("Error connecting to {}", database_url))
}

#[derive(Default)]
pub struct HealthCheck {}

#[tonic::async_trait]
impl HealthCheckService for HealthCheck {
    async fn check_health(
        &self,
        request: Request<HealthCheckRequest>,
    ) -> Result<Response<HealthCheckReply>, Status> {
        println!("Got a request from {:?}", request.remote_addr());

        let mut connection = establish_connection();
        let record = NewHealthCheck {
            timestamp: Utc::now().naive_utc(),
        };

        let expected_records = diesel::insert_into(health_checks::table)
            .values(&record)
            .execute(&mut connection)
            .unwrap();

        debug_assert_eq!(1, expected_records);

        let reply = openfg::HealthCheckReply {};
        Ok(Response::new(reply))
    }
}

pub async fn serve(listener: TcpListener) -> Result<(), tonic::transport::Error> {
    Server::builder()
        .accept_http1(true)
        .layer(
            CorsLayer::new()
                .allow_origin(Any)
                .allow_headers(Any)
                .allow_methods(Any)
                .max_age(Duration::from_secs(60) * 30),
        )
        .layer(tonic_web::GrpcWebLayer::new())
        .add_service(HealthCheckServiceServer::new(HealthCheck::default()))
        .serve_with_incoming(tokio_stream::wrappers::TcpListenerStream::new(listener))
        .await
}
