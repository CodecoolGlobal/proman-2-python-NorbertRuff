import persistence
import connection


def get_card_status(status_id):
    """
    Find the first status matching the given id
    :param status_id:
    :return: str
    """
    statuses = persistence.get_statuses()
    return next((status['title'] for status in statuses if status['id'] == str(status_id)), 'Unknown')


@connection.connection_handler
def update_table_title(cursor, new_name, id):
    query = """
        UPDATE boards 
        SET title = %(title)s
        WHERE id = %(id)s    
    """
    var = {'title': new_name, 'id': id}
    cursor.execute(query, var)


@connection.connection_handler
def get_card_title(cursor, card_id):
    query = """
        SELECT title 
        FROM cards
        WHERE id = %(id)s   
        """
    var = {'id': card_id}
    cursor.execute(query, var)
    return cursor.fetchone()


@connection.connection_handler
def add_new_status(cursor, title):
    """Add new status and return it"""
    query = """
        INSERT INTO statuses (title)VALUES (%(title)s)
        RETURNING id,title
        """
    var = {"title": title}
    cursor.execute(query, var)
    return cursor.fetchone()


@connection.connection_handler
def add_custom_status(cursor, board_id, status_id):
    """Add new statuses ID to custom statuses and return it"""
    query = """
        INSERT INTO custom_board_statuses (board_id,status_id) VALUES (%(board_id)s, %(status_id)s)
        """
    var = {"board_id": board_id, "status_id": status_id}
    cursor.execute(query, var)


@connection.connection_handler
def get_public_boards_custom_statuses(cursor):
    query = """
        SELECT board_id, status_id, s.title FROM custom_board_statuses
        JOIN statuses s on custom_board_statuses.status_id = s.id
        JOIN boards b on custom_board_statuses.board_id = b.id
        where user_id is null
    """
    cursor.execute(query)
    return cursor.fetchall()


@connection.connection_handler
def get_board_custom_statuses(cursor, user_id):
    query = """
        SELECT board_id, status_id, s.title FROM custom_board_statuses
        JOIN statuses s on custom_board_statuses.status_id = s.id
        JOIN boards b on custom_board_statuses.board_id = b.id
        where user_id is null or user_id = %(user_id)s
    """
    var = {"user_id": user_id}
    cursor.execute(query, var)
    return cursor.fetchall()


@connection.connection_handler
def update_card_title(cursor, new_name, id):
    query = """
        UPDATE cards 
        SET title = %(title)s
        WHERE id = %(id)s    
    """
    var = {'title': new_name, 'id': id}
    cursor.execute(query, var)


@connection.connection_handler
def get_user_id(cursor, username):
    query = """
            SELECT id FROM users WHERE name = %(username)s
            """
    var = {'username': username}
    cursor.execute(query, var)
    return cursor.fetchone()


@connection.connection_handler
def get_boards(cursor, username):
    query = """
            SELECT boards.id, boards.title, boards.user_id
            FROM boards
            LEFT JOIN users
                 ON boards.user_id = users.id
            WHERE users.name = %(username)s OR boards.user_id IS NULL
            ORDER BY boards.user_id DESC, boards.title;
            """
    var = {'username': username}
    cursor.execute(query, var)
    return cursor.fetchall()


@connection.connection_handler
def save_new_board(cursor, json_data):
    query = """
            INSERT INTO boards values (DEFAULT, %(data)s, NULL);
            """
    var = {'data': json_data}
    cursor.execute(query, var)


@connection.connection_handler
def save_new_private_board(cursor, board_title, board_user_id):
    query = """
            INSERT INTO boards values (DEFAULT, %(board_title)s, %(board_user_id)s);
            """
    var = {'board_title': board_title, 'board_user_id': board_user_id}
    cursor.execute(query, var)


@connection.connection_handler
def remove_status(cursor, status__id):
    query = """
        DELETE FROM custom_board_statuses
        WHERE status_id = %(status__id)s;
        DELETE FROM statuses
        WHERE id = %(status__id)s;
        """
    var = {'status__id': status__id}
    cursor.execute(query, var)


@connection.connection_handler
def save_new_card(cursor, board_id, title, status_id, cards_order, archived):
    query = """
            INSERT INTO cards values (DEFAULT, %(data1)s, %(data2)s, %(data3)s, %(data4)s, %(data5)s);
            """
    var = {'data1': board_id, 'data2': title, 'data3': status_id, 'data4': cards_order, 'data5': archived}
    cursor.execute(query, var)


@connection.connection_handler
def get_default_statuses(cursor):
    query = """
    SELECT id, title 
    FROM statuses
    WHERE is_default IS true    
    """
    cursor.execute(query)
    return cursor.fetchall()


@connection.connection_handler
def get_all_cards(cursor, username):
    query = """
    SELECT c.id, c.title, c.board_id, c.status_id, c.archived, c.card_order
    FROM cards c
    JOIN boards b
        ON c.board_id = b.id
    LEFT JOIN users u
        ON b.user_id = u.id
    WHERE c.archived=false AND b.user_id IS NULL OR c.archived=false AND u.name = %(username)s 
    ORDER BY c.card_order
    """
    var = {'username': username}
    cursor.execute(query, var)
    return cursor.fetchall()


@connection.connection_handler
def update_card_data(cursor, card_id, board_id, status_id):
    query = """
        UPDATE cards
        SET board_id = %(board_id)s, status_id = %(status_id)s
        WHERE id = %(card_id)s;
        """
    var = {'card_id': card_id, 'board_id': board_id, 'status_id': status_id}
    cursor.execute(query, var)


@connection.connection_handler
def remove_card(cursor, card_id):
    query = """
        DELETE FROM cards
        WHERE id = %(card_id)s;
        """
    var = {'card_id': card_id}
    cursor.execute(query, var)


@connection.connection_handler
def remove_board(cursor, board_id):
    query = """
        DELETE FROM cards
        WHERE board_id = %(board_id)s;
        DELETE FROM custom_board_statuses
        WHERE board_id = %(board_id)s; 
        DELETE FROM boards
        WHERE id = %(board_id)s;
        """
    var = {'board_id': board_id}
    cursor.execute(query, var)


@connection.connection_handler
def update_cards_order(cursor, new_order):
    new_position = 0
    for card_id in new_order:
        query = """
                UPDATE cards
                SET card_order = %(new_position)s
                WHERE id = %(card_id)s;
                """
        var = {'card_id': card_id, 'new_position': new_position}
        cursor.execute(query, var)
        new_position += 1


@connection.connection_handler
def add_new_user(cursor, new_username, new_password):
    query = """
        INSERT INTO users
        VALUES (DEFAULT, %(new_username)s, %(new_password)s);
        """
    var = {'new_username': new_username, 'new_password': new_password}
    cursor.execute(query, var)


@connection.connection_handler
def get_user_login_data(cursor, username):
    query = """
        SELECT name, password FROM users
        WHERE name = %(username)s
        """
    var = {'username': username}
    cursor.execute(query, var)
    return cursor.fetchall()


@connection.connection_handler
def get_user_id_from_username(cursor, username):
    query = """
        SELECT id FROM users
        WHERE name = %(username)s
        """
    var = {'username': username}
    cursor.execute(query, var)
    return cursor.fetchone()


@connection.connection_handler
def archive_card(cursor, card_id):
    query = """
        UPDATE cards
        SET archived=true
        WHERE id = %(card_id)s
        """
    var = {"card_id": card_id}
    cursor.execute(query, var)


@connection.connection_handler
def restore_card(cursor, card_id):
    query = """
        UPDATE cards
        SET archived=false
        WHERE id = %(card_id)s
        RETURNING id, title, board_id, status_id
        """
    var = {"card_id": card_id}
    cursor.execute(query, var)
    return cursor.fetchall()


@connection.connection_handler
def get_archived_cards(cursor, username):
    query = """
            SELECT c.id, c.title, c.board_id, c.status_id
            FROM cards c
            JOIN boards b
                ON c.board_id = b.id
            LEFT JOIN users u
                ON b.user_id = u.id
            WHERE c.archived=true AND b.user_id IS NULL OR c.archived=true AND u.name = %(username)s 
            ORDER BY c.card_order
                """
    var = {"username": username}
    cursor.execute(query, var)
    return cursor.fetchall()
