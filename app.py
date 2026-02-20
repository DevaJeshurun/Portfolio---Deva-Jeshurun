
import os
from flask import Flask, request, jsonify
from flask_mail import Mail, Message
from flask_cors import CORS
from flask import send_from_directory

app = Flask(__name__)
CORS(app)  # allows requests from your portfolio page


@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)
# ── Email configuration ──────────────────────────────────────────────────────
# Best practice: set these as environment variables.
# For quick local testing you can hard-code them temporarily.
app.config['MAIL_SERVER']   = 'smtp.gmail.com'
app.config['MAIL_PORT']     = 587
app.config['MAIL_USE_TLS']  = True
app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME', 'devajeshurun57@gmail.com')
app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD', 'oxns pmdr mjpg dikk')
app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_USERNAME', 'devajeshurun57@gmail.com')

mail = Mail(app)

RECIPIENT = 'devajeshurun57@gmail.com'

# ── Routes ────────────────────────────────────────────────────────────────────

@app.route('/send-email', methods=['POST'])
def send_email():
    data = request.get_json()

    # Basic validation
    required = ['name', 'email', 'subject', 'message']
    for field in required:
        if not data.get(field, '').strip():
            return jsonify({'success': False, 'error': f'Missing field: {field}'}), 400

    name    = data['name'].strip()
    email   = data['email'].strip()
    subject = data['subject'].strip()
    message = data['message'].strip()

    email_body = f"""
You have a new message from your portfolio contact form.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name    : {name}
Email   : {email}
Subject : {subject}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Reply directly to {email} to respond.
"""

    try:
        msg = Message(
            subject=f"[Portfolio] {subject}",
            recipients=[RECIPIENT],
            body=email_body,
            reply_to=email,
        )
        mail.send(msg)
        return jsonify({'success': True, 'message': 'Email sent successfully'}), 200

    except Exception as e:
        print(f"[ERROR] Failed to send email: {e}")
        return jsonify({'success': False, 'error': 'Failed to send email. Check server logs.'}), 500


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'}), 200


# ── Run ───────────────────────────────────────────────────────────────────────

if __name__ == '__main__':
    app.run(debug=True, port=5000)