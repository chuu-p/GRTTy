// @generated automatically by Diesel CLI.

diesel::table! {
    health_checks (id) {
        id -> Integer,
        timestamp -> Timestamp,
    }
}
