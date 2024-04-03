CREATE DATABASE users;
USE users;

CREATE TABLE users (
    id integer PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    course VARCHAR(255) NOT NULL,
    ects DECIMAL (5.1) NOT NULL,
    created TIMESTAMP NOT NULL DEFAULT NOW()
);