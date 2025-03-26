use diesel::{prelude::*, sqlite::Sqlite};

use crate::schema::todos;

#[derive(Queryable, Selectable, Debug, Clone)]
#[diesel(table_name = todos)]
#[diesel(check_for_backend(Sqlite))]
pub struct Todo {
    pub id: i32,
    pub title: String,
    pub description: Option<String>,
    pub completed: bool,
}

#[derive(Insertable)]
#[diesel(table_name = todos)]
pub struct NewTodo {
    pub title: String,
    pub description: Option<String>,
    pub completed: bool,
}

