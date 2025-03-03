use diesel::prelude::*;
use example::health_check_service_client::HealthCheckServiceClient;
use example::HealthCheckRequest;
use example_api::schema::health_checks;
use example_api::{establish_connection, serve};
use std::env;
use std::path::Path;

pub mod example {
    tonic::include_proto!("example");
}

#[tokio::test]
async fn health_check_works() -> Result<(), Box<dyn std::error::Error>> {
    // arrange
    dotenvy::from_path(Path::new("../example-spec/.env"))?;

    let server_addr = env::var("VITE_GRPC_SERVER_ADDRESS")?;
    let server_port = env::var("VITE_GRPC_SERVER_PORT")?;

    println!("server starting");
    let listener =
        tokio::net::TcpListener::bind(format!("{}:{}", server_addr, server_port)).await?;
    tokio::spawn(async { serve(listener).await });
    println!("server started");

    // empty database
    let mut connection = establish_connection();

    diesel::delete(health_checks::table).execute(&mut connection)?;
    assert_eq!(
        Ok(0),
        health_checks::table.count().first::<i64>(&mut connection)
    );

    let client_addr = format!("http://{}:{}", server_addr, server_port);
    println!("client starting on: {:?}", client_addr);
    let mut client = HealthCheckServiceClient::connect(client_addr).await?;
    println!("client connected");

    let request = tonic::Request::new(HealthCheckRequest {});

    // act
    let response = client.check_health(request).await?;

    // assert
    println!("RESPONSE={:?}", response);

    // check response status
    let status = response
        .metadata()
        .get("grpc-status")
        .unwrap()
        .to_str()
        .unwrap();
    assert_eq!("0", status);

    // check database entry
    let rows = health_checks::dsl::health_checks
        .count()
        .get_result::<i64>(&mut connection)
        .unwrap();
    assert_eq!(1, rows);

    // let id = health_checks::dsl::health_checks
    //     .select(health_checks::id)
    //     .first(&mut connection);

    Ok(())
}
