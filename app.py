from flask import Flask, render_template, request, send_file
import qrcode
import os

app = Flask(__name__)

@app.route("/", methods=["GET", "POST"])
def home():
    if request.method == "POST":
        url = request.form["url"]

        filepath = "static/qr.png"

        qr = qrcode.QRCode(
            version=1,
            box_size=10,
            border=5
        )

        qr.add_data(url)
        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white")
        img.save(filepath)

        return send_file(filepath, as_attachment=True)

    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)
