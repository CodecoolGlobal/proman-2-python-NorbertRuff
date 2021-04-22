from flask import Flask, render_template, redirect, url_for, session, request, jsonify
from util import json_response
import password_hasher

import data_handler

app = Flask(__name__)

app.config['SECRET_KEY'] = "bec725156bb840a9a722fba8b3a7597b"


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
    card_title = data_handler.get_card_title(card_id)
    if card_title is None:
        return {}
    else:
        return card_title


@app.route("/update-card-title", methods=["POST"])
def update_card_title():
    new_title = request.get_json()['new_title']
    card_id = request.get_json()['card_id']
    try:
        data_handler.update_card_title(new_title, card_id)
        return jsonify({"response": "OK"})
    except:
        return jsonify({"response": "There was an error during execution of your request"})


@app.route("/remove-card", methods=["POST"])
def remove_card():
    card_id = request.get_json()
    try:
        data_handler.remove_card(card_id)
        return jsonify({"response": "OK"})
    except:
        return jsonify({"response": "There was an error during execution of your request"})


@app.route("/remove-board", methods=["POST"])
def remove_board():
    board_id = request.get_json()
    try:
        data_handler.remove_board(board_id)
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
    username = session.get('username', None)
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
    username = session.get('username', "")
    cards = data_handler.get_all_cards(username)
    if cards is None:
        return {}
    else:
        return cards


@app.route("/create-board", methods=['POST'])
@json_response
def save_new_board():
    json_data = request.get_json()
    print(json_data)
    data_handler.save_new_board(json_data)


@app.route("/create-private-board", methods=['POST'])
def save_new_private_board():
    # TODO "and 'username' in session" in the below if statement, once we have sessions
    if request.method == 'POST':
        board_title = request.get_json()
        board_user_id = session.get('username')
        print(board_title, board_user_id)
        data_handler.save_new_private_board(board_title, board_user_id)
        return jsonify({"response": "OK"})
    else:
        return redirect(url_for('index'))


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


@app.route("/register", methods=["POST", "GET"])
def register():
    new_username = request.get_json()['new_username']
    new_password = password_hasher.hash_password(request.get_json()['new_password'])
    try:
        data_handler.add_new_user(new_username, new_password)
        return jsonify({"response": "OK"})
    except:
        return jsonify({"response": "There was an error during the registration process"})


@app.route("/login", methods=["POST", "GET"])
def login():
    if request.method == "POST":
        username = request.get_json()['username']
        user_data = data_handler.get_user_login_data(username)
        if len(user_data) == 1:
            try:
                password = request.get_json()['password']
                hashed_password = user_data[0]["password"]
                valid_password = password_hasher.verify_password(password, hashed_password)
                if valid_password:
                    session["username"] = user_data[0]["name"]

                return jsonify({"response": "OK"})
            except:
                return jsonify({"response": "There was an error during the login process"})
    elif request.method == "GET":
        return redirect(url_for('index'))


@app.route('/get-logged-in-user')
def logged_in_user():
    user_in_session = session.get("username", "")
    print(user_in_session)
    return jsonify({"username": user_in_session})


@app.route('/logout')
def logout():
    session.pop("username", None)
    return redirect(url_for("index"))


def main():
    app.run(debug=True)

    # Serving the favicon
    with app.app_context():
        app.add_url_rule('/favicon.ico', redirect_to=url_for('static', filename='favicon/favicon.ico'))


if __name__ == '__main__':
    main()
