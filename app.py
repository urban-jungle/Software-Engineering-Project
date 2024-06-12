from flask import Flask, request, jsonify, redirect, url_for, render_template
from flask_session import Session
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import os
from flask_cors import CORS
from bson.json_util import dumps
import datetime
from bson import ObjectId


app = Flask(__name__)
app.secret_key = 'software_engineering_project'
CORS(app) # CORS credentials approvement

session_list = dict()

# MongoDB
client = MongoClient(
    "mongodb+srv://ljmtt2000:kHlPWl04DfsSOXL8@jungmin.ly8shev.mongodb.net/")
db = client['your_database']
users = db['users']
posts = db['posts']
dms = db['dms']


# file upload
UPLOAD_FOLDER = './static/images/'
ALLOWED_EXTENSIONS = {'png', 'jpeg', 'gif', 'jpg'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/')
def index():
    return redirect('http://localhost:3000/')


# signup
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    password_confirm = data.get('password_confirm')

    if not username or not password or not password_confirm:
        return jsonify({'message': '빈칸을 채워주세요.'}), 400

    if users.find_one({'username': username}):
        return jsonify({'message': '이미 아이디가 존재합니다.'}), 400

    if password != password_confirm:
        return jsonify({'message': '패스워드가 일치하지 않습니다.'}), 400

    users.insert_one({
        'username': username,
        'password': generate_password_hash(password)
    })

    return jsonify({'message': "회원가입이 정상적으로 완료되었습니다.",
                    'redirect_url': 'http://localhost:3000/'}), 200


# login
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': '빈칸을 채워주세요.'}), 400

    user = users.find_one({'username': username})

    if not user or not check_password_hash(user['password'], password):
        return jsonify({'message': 'ID 또는 비밀번호가 틀렸습니다.'}), 400

    session_list['username'] = username  # 아이디 저장

    return jsonify({'message': f"{username}님, 환영합니다!",
                    'redirect_url': 'http://localhost:3000/main'}), 200


# guest
@app.route('/guest_login', methods=['GET'])
def guest_login():
    return jsonify({'message': '게스트로 로그인합니다.', 'redirect_url': 'http://localhost:3000/guest'}), 200


# logout
@app.route('/logout', methods=['GET'])
def logout():
    session_list.pop('username', None)
    session_list.pop('user_type', None)
    return jsonify({'message': "로그아웃 합니다.", 'redirect_url': "http://localhost:3000/"})


# session information
@app.route('/session_info', methods=['GET'])
def session_info():
    return jsonify({'session_info': session_list}), 200


# 로그인한 사람 조회
@app.route('/user', methods=['GET'])
def get_user():
    if 'username' in session_list:
        user = users.find_one({'username': session_list['username']})
        if user:
            return jsonify({'username': user['username']}), 200

    return jsonify({'message': 'User not logged in'}), 200


# userlist
@app.route('/userlists', methods=['GET'])
def get_users():
    user_list = users.find({}, {'_id': 0, 'password': 0})
    return jsonify({'userlist': list(user_list)}), 200


# photolist
@app.route('/postlists', methods=['GET'])
def postlists():
    if 'username' not in session_list:
        return jsonify({"message": "로그인 해주세요.",
                        "redirect_url": "http://localhost:3000"})

    post_list = posts.find({}, {'_id': 0})
    post_list = list(post_list)

    return dumps({"postlist": post_list, "message": "complete message"}), 200


# photo, hashtag, text 업로드
@ app.route('/upload', methods=['POST'])
def upload_file():
    if 'username' not in session_list:
        return jsonify({"message": "로그인 해주세요.",
                        "redirect_url": "http://localhost:3000"})

    if 'file' not in request.files:
        return jsonify({'message': '파일이 올바르지 않습니다.'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'message': '파일을 선택해주세요.'}), 400

    if file and allowed_file(file.filename):
        extension = file.filename.split('.')[-1]

        # create file name that is stored at static folder
        today = datetime.datetime.now()
        mytime = today.strftime('%Y-%m-%d-%H-%M-%S')
        filename = f'file-{mytime}'
        # extension divide
        extension = file.filename.split('.')[-1]
        # store at static folder
        save_to = f'static/{filename}.{extension}'
        file.save(save_to)

        text = request.form.get('text')
        hashtags = [value for key, value in request.form.items()
                    if 'hashtags[' in key]

        # MongoDB에 파일저장
        image_data = {
            'username': session_list['username'],
            'file': f'{filename}.{extension}',
            'text': text,
            'hashtags': hashtags
        }

        posts.insert_one(image_data)

        return jsonify({'message': '작성 완료!',
                        "redirect_url": "http://localhost:3000/main"}), 200

# 업로드한 게시물 조회(x)
@ app.route('/my_posts/<username>', methods=['GET'])
def get_my_posts(username):
    if 'username' not in session_list:
        return jsonify({"message": "로그인 해주세요.",
                        "redirect_url": "http://localhost:3000"})
    my_posts = posts.find({'username': username}, {'_id': 0})
    return jsonify(list(my_posts)), 200

# go to fixpage
@app.route('/gotofixpage', methods=['POST'])
def go_to_fixpage():
    data = request.get_json()
    username = data.get('username')
    filename = data.get('filename')

    if not filename:
        return jsonify({'error': 'Missing file parameter'}), 400
    
    if session_list['username'] != username:
        return jsonify({'message': "권한이 없습니다."}), 404
    else:
        redirect_url = f'http://localhost:3000/fix?filename={filename}'
        return jsonify({'message': "게시물 수정 페이지로 이동합니다.",
                        'redirect_url': redirect_url}), 200


# import id from db
@app.route('/get_my_post', methods=['POST'])
def get_my_post_id():
    data = request.get_json()
    filename = data.get('file')
    document = posts.find_one({"file": filename})

    if document:
        return dumps({'id': document['_id']}), 200
    else:
        return jsonify({"message": "파일이 없습니다."}), 404


# fix uploaded photo
@ app.route('/fix', methods=['POST'])
def update_my_post():
    if 'file' not in request.files:
        return jsonify({'message': '올바르지 않은 파일입니다.'}), 400

    file = request.files['file']
    id = request.form.get('id')

    if file.filename == '':
        return jsonify({'message': '파일을 선택해주세요.'}), 400

    if file and allowed_file(file.filename):
        extension = file.filename.split('.')[-1]

        today = datetime.datetime.now()
        mytime = today.strftime('%Y-%m-%d-%H-%M-%S')
        filename = f'file-{mytime}'
        extension = file.filename.split('.')[-1]
        save_to = f'static/{filename}.{extension}'
        file.save(save_to)

        text = request.form.get('text')
        hashtags = [value for key, value in request.form.items()
                    if 'hashtags[' in key]

        image_data = {
            'file': f'{filename}.{extension}',
            'text': text,
            'hashtags': hashtags
        }

        posts.update_one({"_id": ObjectId(id)}, {"$set": image_data})

        return jsonify({'message': '수정 완료!',
                        "redirect_url": "http://localhost:3000/main"}), 200


# go to keyword page
@app.route('/gotokeywordpage', methods=['POST'])
def go_to_keywordpage():
    data = request.get_json()
    keyword = data.get('keyword')

    if not keyword:
        return jsonify({'message': '키워드를 입력해주세요!'}), 400
    else:
        redirect_url = f'http://localhost:3000/keyword?keyword={keyword}'
        return jsonify({'message': "검색 페이지로 이동합니다.",
                        'redirect_url': redirect_url}), 200


# search with keyword
@app.route('/search', methods=['POST'])
def search_posts():
    if 'username' not in session_list:
        return jsonify({"message": "로그인 해주세요.",
                        "redirect_url": "http://localhost:3000"})
    data = request.get_json()
    keyword = data.get('keyword', '')

    matching_posts = posts.find({'hashtags': {"$in": [keyword]}}, {'_id': 0})
    matching_posts_list = list(matching_posts)

    if not matching_posts_list:
        return jsonify({'message': '게시글이 존재하지 않습니다.'}), 200

    return jsonify({"message": "검색완료!", "postlist": matching_posts_list}), 200


# go to direct message
@app.route('/gotoDMpage', methods=['POST'])
def go_to_DMpage():
    data = request.get_json()
    sender = session_list['username']
    receiver = data.get('username')

    if sender == receiver:
        return jsonify({'message': "자신에게는 보낼 수 없습니다."}), 404
    else:
        redirect_url = f'http://localhost:3000/sendDM?sender={sender}&receiver={receiver}'
        return jsonify({'message': "DM 페이지로 이동합니다.",
                        'redirect_url': redirect_url}), 200


# send message
@ app.route('/sendDM', methods=['POST'])
def send_dm():
    if 'username' not in session_list:
        return jsonify({"message": "로그인 해주세요.",
                        "redirect_url": "http://localhost:3000"})
    data = request.get_json()

    sender = data.get('sender')
    receiver = data.get('receiver')
    message = data.get('message')
    dms.insert_one(
        {'sender': sender, 'receiver': receiver, 'message': message})

    return jsonify({'message': '전송 완료!', 'redirect_url': 'http://localhost:3000/main'}), 200


# 메세지 조회
@ app.route('/dm', methods=['GET'])
def get_dms():
    if 'username' not in session_list:
        return jsonify({"message": "로그인 해주세요.",
                        "redirect_url": "http://localhost:3000"})

    username = session_list['username']

    user_dms = dms.find({'receiver': username}, {'_id': 0})

    return jsonify({'dm_list': list(user_dms), 'message': "Tetst"}), 200


# Delete message
@ app.route('/delete_dm', methods=['POST'])
def delete_dm():
    if 'username' not in session_list:
        return jsonify({"message": "로그인 해주세요.",
                        "redirect_url": "http://localhost:3000"})
    data = request.get_json()  
    username = data['username']
    message = data['message']

    dms.delete_one({'message': message, 'sender': username})
    return jsonify({'message': '삭제 완료!',
                    'redirect_url': 'http://localhost:3000/DirectMessage'}), 200


if __name__ == '__main__':
    app.run(debug=False)
