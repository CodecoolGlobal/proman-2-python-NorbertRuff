ALTER TABLE IF EXISTS ONLY boards DROP CONSTRAINT IF EXISTS pk_boards_id CASCADE;
ALTER TABLE IF EXISTS ONLY statuses DROP CONSTRAINT IF EXISTS pk_statuses_id CASCADE;
ALTER TABLE IF EXISTS ONLY cards DROP CONSTRAINT IF EXISTS pk_cards_id CASCADE;
ALTER TABLE IF EXISTS ONLY users DROP CONSTRAINT IF EXISTS pk_users_id CASCADE;

ALTER TABLE IF EXISTS ONLY boards DROP CONSTRAINT IF EXISTS fk_user_id CASCADE;
ALTER TABLE IF EXISTS ONLY statuses DROP CONSTRAINT IF EXISTS fk_board_id CASCADE;
ALTER TABLE IF EXISTS ONLY cards DROP CONSTRAINT IF EXISTS fk_board_id CASCADE;
ALTER TABLE IF EXISTS ONLY cards DROP CONSTRAINT IF EXISTS fk_status_id CASCADE;
ALTER TABLE IF EXISTS ONLY custom_board_statuses DROP CONSTRAINT IF EXISTS fk_board_id CASCADE;
ALTER TABLE IF EXISTS ONLY custom_board_statuses DROP CONSTRAINT IF EXISTS fk_status_id CASCADE;

DROP TABLE IF EXISTS boards;
DROP TABLE IF EXISTS statuses;
DROP TABLE IF EXISTS cards;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS custom_board_statuses;

CREATE TABLE boards (
    id SERIAL NOT NULL,
    title VARCHAR,
    user_id INTEGER DEFAULT NULL
);

CREATE TABLE statuses(
    id SERIAL NOT NULL,
    title VARCHAR,
    is_default boolean DEFAULT false
);

CREATE TABLE cards(
    id SERIAL NOT NULL,
    board_id INTEGER,
    title VARCHAR,
    status_id INTEGER,
    card_order INTEGER,
    archived boolean DEFAULT false
);
CREATE TABLE users(
    id SERIAL NOT NULL,
    name varchar,
    password varchar
);

CREATE TABLE custom_board_statuses(
    board_id INTEGER,
    status_id INTEGER
);

ALTER TABLE ONLY boards ADD CONSTRAINT pk_boards_id PRIMARY KEY (id);
ALTER TABLE ONLY statuses ADD CONSTRAINT pk_statuses_id PRIMARY KEY (id);
ALTER TABLE ONLY cards ADD CONSTRAINT pk_cards_id PRIMARY KEY (id);
ALTER TABLE ONLY users ADD CONSTRAINT pk_users_id PRIMARY KEY (id);

ALTER TABLE ONLY boards ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE ONLY cards ADD CONSTRAINT fk_board_id FOREIGN KEY (board_id) REFERENCES boards(id);
ALTER TABLE ONLY cards ADD CONSTRAINT fk_status_id FOREIGN KEY (status_id) REFERENCES statuses(id);
ALTER TABLE ONLY custom_board_statuses ADD CONSTRAINT fk_status_id FOREIGN KEY (status_id) REFERENCES statuses(id);
ALTER TABLE ONLY custom_board_statuses ADD CONSTRAINT fk_board_id FOREIGN KEY (board_id) REFERENCES boards(id);


INSERT INTO users (id, name, password) VALUES(1, 'test@password.com', '$2b$12$M.2KydyGpc7A4eSrXtEQ5eOVWrkZ.Ca8wh.teN7HpPJLl3mMAhToe');
INSERT INTO users (id, name, password) VALUES(2, 'hello@hello.com', '$2b$12$z92lNTdi1s1k.oUsYz1fM.C5T133MyaXJpqmDZqThpu7EruHUrYjK');
SELECT pg_catalog.setval('users_id_seq', 2, true);


INSERT INTO boards (id, title, user_id) VALUES(1, 'Board 1', null);
INSERT INTO boards (id, title, user_id) VALUES(2, 'Board 2', null);
INSERT INTO boards (id, title, user_id) VALUES(3, 'Priv Board 3', 1);
SELECT pg_catalog.setval('boards_id_seq', 3, true);


INSERT INTO statuses (id, title, is_default) VALUES(0, 'new', true);
INSERT INTO statuses (id, title, is_default) VALUES(1, 'in progress', true);
INSERT INTO statuses (id, title, is_default) VALUES(2, 'testing', true);
INSERT INTO statuses (id, title, is_default) VALUES(3, 'done', true);
INSERT INTO statuses (id, title, is_default) VALUES(4, 'hello', false);
SELECT pg_catalog.setval('statuses_id_seq', 4, true);


INSERT INTO cards (id,board_id,title,status_id,card_order, archived) VALUES (1, 1, 'new card 1', 0, 0, false);
INSERT INTO cards (id,board_id,title,status_id,card_order, archived) VALUES (2, 1, 'new card 2', 0, 1, false);
INSERT INTO cards (id,board_id,title,status_id,card_order, archived) VALUES (3, 2, 'in progress card', 1, 0, false);
INSERT INTO cards (id,board_id,title,status_id,card_order, archived) VALUES (4, 3, 'card on priv board', 3, 0, false);
SELECT pg_catalog.setval('cards_id_seq', 4, true);


INSERT INTO custom_board_statuses (board_id, status_id) VALUES (1, 4);