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
def get_boards(cursor, username):
    query = """
            SELECT boards.id, boards.title
            FROM boards
            LEFT JOIN users
                 ON boards.user_id = users.id
            WHERE users.name = %(username)s OR boards.user_id IS NULL;
            """
    var = {'username': username}
    cursor.execute(query, var)
    return cursor.fetchall()


def get_cards_for_board(board_id):
    persistence.clear_cache()
    all_cards = persistence.get_cards()
    matching_cards = []
    for card in all_cards:
        if card['board_id'] == str(board_id):
            card['status_id'] = get_card_status(card['status_id'])  # Set textual status for the card
            matching_cards.append(card)
    return matching_cards
