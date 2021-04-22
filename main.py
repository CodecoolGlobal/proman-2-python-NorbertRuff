from flask import Flask, render_template, url_for, session, request, jsonify
from util import json_response

import data_handler

app = Flask(__name__)


@app.route("/")
def index():
    """
    This is a one-pager which shows all the boards and cards
    """
    return render_template('index.html')


@json_response
@app.route("/new-status", methods=["POST"])
def add_new_status():
    title = request.get_json()['title']
    return data_handler.add_new_status(title)


@json_response
@app.route("/get-card-title", methods=["POST"])
def get_card_title():
    card_id = request.get_json()['card_id']
    return data_handler.get_card_title(card_id)


@app.route("/update-card-title", methods=["POST"])
def update_card_title():
    new_title = request.get_json()['new_title']
    card_id = request.get_json()['card_id']
    try:
        data_handler.update_card_title(new_title, card_id)
        return jsonify({"response": "OK"})
    except:
        return jsonify({"response": "There was an error during execution of your request"})


@app.route("/update-board-title", methods=["POST"])
def update_board_title():
    new_name = request.get_json()['board_name']
    board_id = request.get_json()['id']
    try:
        data_handler.update_table_title(new_name, board_id)
        return jsonify({"response": "OK"})
    except:
        return jsonify({"response": "There was an error during execution of your request"})


@app.route("/get-boards")
@json_response
def get_boards():
    """
    All the boards
    """
    username = session.get('username', 'test@password.com')
    return data_handler.get_boards(username)


@app.route("/get-default-statuses")
@json_response
def get_default_statuses():
    """
    All default statuses
    """
    return data_handler.get_default_statuses()


@app.route("/get-cards")
@json_response
def get_all_cards():
    username = session.get('username', 'test@password.com')
    return data_handler.get_all_cards(username)


@app.route("/create-board", methods=['POST'])
@json_response
def save_new_board():
    json_data = request.get_json()
    data_handler.save_new_board(json_data)


@app.route("/create-card", methods=['POST'])
@json_response
def create_card():
    board_id = request.get_json()['boardId']
    title = request.get_json()['title']
    status_id = request.get_json()['statusId']
    cards_order = request.get_json()['cardOrder']
    archived = request.get_json()['archived']
    data_handler.save_new_card(board_id, title, status_id, cards_order, archived)
    return ""


@app.route("/update-cards", methods=["POST"])
def update_cards():
    card_id = request.get_json()['card_id']
    status_id = request.get_json()['status_id']
    board_id = request.get_json()['board_id']
    cards_order = request.get_json()['cards_order']
    try:
        data_handler.update_card_data(card_id, board_id, status_id)
        data_handler.update_cards_order(cards_order)
        return jsonify({"response": "OK"})
    except:
        return jsonify({"response": "There was an error during execution of your request"})


@app.route("/archive-card", methods=["POST"])
def archive_card():
    card_id = request.get_json()['card_id']
    try:
        data_handler.archive_card(card_id)
        return jsonify({"response": "OK"})
    except:
        return jsonify({"response": "There was an error during execution of your request"})


@app.route("/get-archived-cards")
@json_response
def get_archived_cards():
    username = session.get('username', 'test@password.com')
    return data_handler.get_archived_cards(username)


@app.route("/restore-card", methods=["POST"])
def restore_card():
    card_id = request.get_json()['card_id']
    try:
        data_handler.restore_card(card_id)
        return jsonify({"response": "OK"})
    except:
        return jsonify({"response": "There was an error during execution of your request"})


def main():
    app.run(debug=True)

    # Serving the favicon
    with app.app_context():
        app.add_url_rule('/favicon.ico', redirect_to=url_for('static', filename='favicon/favicon.ico'))


if __name__ == '__main__':
    main()
