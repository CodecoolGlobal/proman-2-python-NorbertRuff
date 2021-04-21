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
def update_card_title(cursor, new_name, id):
    query = """
        UPDATE cards 
        SET title = %(title)s
        WHERE id = %(id)s    
    """
    var = {'title': new_name, 'id': id}
    cursor.execute(query, var)


@connection.connection_handler
def get_boards(cursor, username):
    query = """
            SELECT boards.id, boards.title
            FROM boards
            LEFT JOIN users
                 ON boards.user_id = users.id
            WHERE users.name = %(username)s OR boards.user_id IS NULL
            ORDER BY id;
            """
    var = {'username': username}
    cursor.execute(query, var)
    return cursor.fetchall()


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
    WHERE b.user_id IS NULL OR u.name = %(username)s
    ORDER BY c.id
    """
    var = {'username': username}
    cursor.execute(query, var)
    return cursor.fetchall()

