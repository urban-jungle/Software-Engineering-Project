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
# CORS 설정에서 credentials 허용
CORS(app)

session_list = dict()

# MongoDB 설정
client = MongoClient(
    "mongodb+srv://ljmtt2000:kHlPWl04DfsSOXL8@jungmin.ly8shev.mongodb.net/")
db = client['your_database']
users = db['users']
posts = db['posts']
dms = db['dms']


# 파일 업로드 설정
UPLOAD_FOLDER = './static/images/'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/')
def index():
    return redirect('http://localhost:3000/')


# 회원가입 -> 완료
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    password_confirm = data.get('password_confirm')

    if not username or not password or not password_confirm:
        return jsonify({'message': '빈칸을 모두 채워주세요.'}), 400

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


# 로그인 -> 완료
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': '빈칸을 모두 채워주세요.'}), 400

    user = users.find_one({'username': username})

    if not user or not check_password_hash(user['password'], password):
        return jsonify({'message': 'ID 혹은 비밀번호가 틀렸습니다.'}), 400

    # session['user_type'] = 'user'  # 로그인 유형을 세션에 저장
    session_list['username'] = username  # 아이디 저장

    # 로그인 성공 시 세션 정보와 함께 응답
    return jsonify({'message': f"{username}님, 환영합니다!",
                    'redirect_url': 'http://localhost:3000/main'}), 200


# 게스트 로그인 -> 완료
@app.route('/guest_login', methods=['GET'])
def guest_login():
    # session_list['user_type'] = 'guest'
    return jsonify({'message': '게스트로 로그인합니다.', 'redirect_url': 'http://localhost:3000/guest'}), 200


# 로그아웃 -> 완료
@app.route('/logout', methods=['GET'])
def logout():
    session_list.pop('username', None)
    session_list.pop('user_type', None)
    return jsonify({'message': "로그아웃 합니다.", 'redirect_url': "http://localhost:3000/"})


# 세션 정보 확인 -> 디버깅용
@app.route('/session_info', methods=['GET'])
def session_info():
    return jsonify({'session_info': session_list}), 200


# 아이디 로그인한 사람 조회 -> 완료
@app.route('/user', methods=['GET'])
def get_user():
    if 'username' in session_list:
        user = users.find_one({'username': session_list['username']})
        if user:
            return jsonify({'username': user['username']}), 200

    return jsonify({'message': 'User not logged in'}), 200


# 유저 리스트 조회 -> 완료
@app.route('/userlists', methods=['GET'])
def get_users():
    user_list = users.find({}, {'_id': 0, 'password': 0})  # password는 반환하지 않음
    return jsonify({'userlist': list(user_list)}), 200


# 사진 리스트 조회 -> 완료
@app.route('/postlists', methods=['GET'])
def postlists():
    # if session_list.get('user_type') == 'guest':
    #     return jsonify({'message': 'Access denied'}), 403

    # user = users.find_one({'username'})
    # if not user:
    #     return jsonify({'message': 'User not found'}), 404

    post_list = posts.find({}, {'_id': 0})
    post_list = list(post_list)

    return dumps({"postlist": post_list, "message": "complete message"}), 200


# 사진, hashtag, text 업로드 -> 완료
@ app.route('/upload', methods=['POST'])
def upload_file():
    # if session_list.get('user_type') == 'guest':
    #     return jsonify({'message': 'Access denied'}), 403

    if 'file' not in request.files:
        return jsonify({'message': '파일이 올바르지 않습니다.'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'message': '파일이 선택되지 않았습니다.'}), 400

    if file and allowed_file(file.filename):
        extension = file.filename.split('.')[-1]

        # static 폴더에 저장될 파일 이름 생성하기
        today = datetime.datetime.now()
        mytime = today.strftime('%Y-%m-%d-%H-%M-%S')
        filename = f'file-{mytime}'
        # 확장자 나누기
        extension = file.filename.split('.')[-1]
        # static 폴더에 저장
        save_to = f'static/{filename}.{extension}'
        file.save(save_to)

        text = request.form.get('text')
        hashtags = [value for key, value in request.form.items()
                    if 'hashtags[' in key]

        # 파일을 MongoDB에 저장
        image_data = {
            'username': session_list['username'],
            'file': f'{filename}.{extension}',
            'text': text,
            'hashtags': hashtags
        }

        posts.insert_one(image_data)

        return jsonify({'message': '게시글이 작성되었습니다!',
                        "redirect_url": "http://localhost:3000/main"}), 200

    # if len(keywords) >= 10:
    #     return jsonify({'message': 'Keyword must be less than 10 characters'}), 400

    # else:
    #     return jsonify({'message': 'Allowed file types are png, jpg, jpeg, gif'}), 400


# 내가 업로드한 사진 조회 -> x
@ app.route('/my_posts/<username>', methods=['GET'])
def get_my_posts(username):
    # if session_list.get('user_type') == 'guest':
    #     return jsonify({'message': 'Access denied'}), 403
    my_posts = posts.find({'username': username}, {'_id': 0})
    return jsonify(list(my_posts)), 200


# 수정 페이지로 이동 -> 완료
@app.route('/gotofixpage', methods=['POST'])
def go_to_fixpage():
    data = request.get_json()  # 요청 본문에서 JSON 데이터 추출
    username = data.get('username')
    filename = data.get('filename')

    if not filename:
        return jsonify({'error': 'Missing file parameter'}), 400

    # # MongoDB에서 'file' 값이 일치하는 문서 찾기
    # document = posts.find_one({'file': filename})

        # 문서에서 'username' 반환
    if session_list['username'] != username:
        return jsonify({'message': "수정권한이 없습니다!"}), 404
    else:
        # 쿼리 파라미터를 포함한 redirect_url 생성
        redirect_url = f'http://localhost:3000/fix?filename={filename}'
        return jsonify({'message': "수정 페이지로 이동합니다.",
                        'redirect_url': redirect_url}), 200


# db에서 id 받아오기 -> 완료
@app.route('/get_my_post', methods=['POST'])
def get_my_post_id():
    data = request.get_json()
    filename = data.get('file')
    document = posts.find_one({"file": filename})

    if document:
        return dumps({'id': document['_id']}), 200
    else:
        return jsonify({"message": "파일이 없습니다."}), 404


# 내가 업로드한 사진 수정 -> 완료
@ app.route('/fix', methods=['POST'])
def update_my_post():
    if 'file' not in request.files:
        return jsonify({'message': '파일이 올바르지 않습니다.'}), 400

    file = request.files['file']
    id = request.form.get('id')

    if file.filename == '':
        return jsonify({'message': '파일이 선택되지 않았습니다.'}), 400

    if file and allowed_file(file.filename):
        extension = file.filename.split('.')[-1]

        # static 폴더에 저장될 파일 이름 생성하기
        today = datetime.datetime.now()
        mytime = today.strftime('%Y-%m-%d-%H-%M-%S')
        filename = f'file-{mytime}'
        # 확장자 나누기
        extension = file.filename.split('.')[-1]
        # static 폴더에 저장
        save_to = f'static/{filename}.{extension}'
        file.save(save_to)

        text = request.form.get('text')
        hashtags = [value for key, value in request.form.items()
                    if 'hashtags[' in key]

        # 파일을 MongoDB에 저장
        image_data = {
            'file': f'{filename}.{extension}',
            'text': text,
            'hashtags': hashtags
        }

        posts.update_one({"_id": ObjectId(id)}, {"$set": image_data})

        return jsonify({'message': '게시글이 수정되었습니다!',
                        "redirect_url": "http://localhost:3000/main"}), 200


# keyword 페이지로 이동 -> 완료
@app.route('/gotokeywordpage', methods=['POST'])
def go_to_keywordpage():
    data = request.get_json()  # 요청 본문에서 JSON 데이터 추출
    keyword = data.get('keyword')

    if not keyword:
        return jsonify({'message': '검색할 keyword를 입력해주세요!'}), 400
    else:
        # 쿼리 파라미터를 포함한 redirect_url 생성
        redirect_url = f'http://localhost:3000/keyword?keyword={keyword}'
        return jsonify({'message': "검색 페이지로 이동합니다.",
                        'redirect_url': redirect_url}), 200


# 키워드 검색 -> 완료
@app.route('/search', methods=['POST'])
def search_posts():
    data = request.get_json()  # 요청의 JSON 바디에서 데이터 추출
    keyword = data.get('keyword', '')  # 'keyword' 값 추출, 없으면 빈 문자열 반환

    # 주석 처리된 권한 확인 로직
    # if session_list.get('user_type') == 'guest':
    #     return jsonify({'message': 'Access denied'}), 403
    # if len(keyword) >= 10:
    #     return jsonify({'message': 'Keyword must be less than 10 characters'}), 400

    # 해시태그 배열에서 키워드를 검색합니다.
    matching_posts = posts.find({'hashtags': {"$in": [keyword]}}, {'_id': 0})
    matching_posts_list = list(matching_posts)

    if not matching_posts_list:
        return jsonify({'message': 'Keyword에 해당하는 게시글이 존재하지 않습니다.'}), 200

    # dumps 대신에 jsonify를 사용하여 응답을 보냅니다.
    return jsonify({"message": "검색완료", "postlist": matching_posts_list}), 200


# DM 페이지로 이동 -> 완료
@app.route('/gotoDMpage', methods=['POST'])
def go_to_DMpage():
    data = request.get_json()  # 요청 본문에서 JSON 데이터 추출
    sender = session_list['username']
    receiver = data.get('username')

    # 문서에서 'username' 반환
    if sender == receiver:
        return jsonify({'message': "자기 자신에게는 보낼 수 없습니다."}), 404
    else:
        # 쿼리 파라미터를 포함한 redirect_url 생성
        redirect_url = f'http://localhost:3000/sendDM?sender={sender}&receiver={receiver}'
        return jsonify({'message': "DM 페이지로 이동합니다.",
                        'redirect_url': redirect_url}), 200


# dm 전송 -> 완료
@ app.route('/sendDM', methods=['POST'])
def send_dm():
    # if session_list.get('user_type') == 'guest':
    #     return jsonify({'message': 'Access denied'}), 403
    data = request.get_json()  # 요청 본문에서 JSON 데이터 추출

    sender = data.get('sender')
    receiver = data.get('receiver')
    message = data.get('message')
    dms.insert_one(
        {'sender': sender, 'receiver': receiver, 'message': message})

    return jsonify({'message': 'DM 전송 성공!', 'redirect_url': 'http://localhost:3000/main'}), 200


# dm 조회 -> 완료
@ app.route('/dm', methods=['GET'])
def get_dms():
    # if session_list.get('user_type') == 'guest':
    #     return jsonify({'message': 'Access denied'}), 403

    username = session_list['username']

    user_dms = dms.find({'receiver': username}, {'_id': 0})

    return jsonify({'dm_list': list(user_dms), 'message': "Tetst"}), 200


# dm 삭제 -> 완료
@ app.route('/delete_dm', methods=['POST'])
def delete_dm():
    # if session_list.get('user_type') == 'guest':
    #     return jsonify({'message': 'Access denied'}), 403
    data = request.get_json()  # 요청 본문에서 JSON 데이터 추출
    username = data['username']
    message = data['message']

    dms.delete_one({'message': message, 'sender': username})
    return jsonify({'message': '성공적으로 삭제되었습니다.',
                    'redirect_url': 'http://localhost:3000/DirectMessage'}), 200


if __name__ == '__main__':
    app.run(debug=False)