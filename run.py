from flask import Flask, render_template, url_for

app = Flask(__name__)

@app.route('/')
def index():
	url_for('static', filename='script.js')
	return render_template('index.html')

if __name__ == '__main__':
	context = ('511rtc.crt', '511rtc.key')
	app.run(ssl_context=context, host='0.0.0.0', port=5555, threaded=True)

