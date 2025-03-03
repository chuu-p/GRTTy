use chrono::NaiveDateTime;
use diesel::{prelude::*, sqlite::Sqlite};

use crate::schema::health_checks;

#[derive(Queryable, Selectable, Debug, Clone, Copy)]
#[diesel(table_name = health_checks)]
#[diesel(check_for_backend(Sqlite))]
pub struct HealthCheck {
    pub id: i32,
    pub timestamp: NaiveDateTime
}

#[derive(Insertable)]
#[diesel(table_name = health_checks)]
pub struct NewHealthCheck {
    pub timestamp: NaiveDateTime
}