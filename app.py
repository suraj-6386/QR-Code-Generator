from flask import Flask, render_template, request, send_file, jsonify
import qrcode
import os
from io import BytesIO
import base64

app = Flask(__name__)

@app.route("/", methods=["GET", "POST"])
def home():
    return render_template("index.html")

@app.route("/generate", methods=["POST"])
def generate():
    try:
        data = request.json
        text = data.get("text", "")
        qr_color = data.get("qr_color", "#000000")
        bg_color = data.get("bg_color", "#FFFFFF")
        error_correction = data.get("error_correction", "M")
        box_size = int(data.get("box_size", 10))
        border = int(data.get("border", 5))

        error_levels = {
            "L": qrcode.constants.ERROR_CORRECT_L,
            "M": qrcode.constants.ERROR_CORRECT_M,
            "Q": qrcode.constants.ERROR_CORRECT_Q,
            "H": qrcode.constants.ERROR_CORRECT_H,
        }

        qr = qrcode.QRCode(
            version=1,
            error_correction=error_levels.get(error_correction, qrcode.constants.ERROR_CORRECT_M),
            box_size=box_size,
            border=border,
        )

        qr.add_data(text)
        qr.make(fit=True)

        img = qr.make_image(fill_color=qr_color, back_color=bg_color)
        
        # Convert to base64 for preview
        buffer = BytesIO()
        img.save(buffer, format="PNG")
        buffer.seek(0)
        img_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        return jsonify({
            "success": True,
            "image": f"data:image/png;base64,{img_base64}"
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route("/download", methods=["POST"])
def download():
    try:
        data = request.json
        text = data.get("text", "")
        qr_color = data.get("qr_color", "#000000")
        bg_color = data.get("bg_color", "#FFFFFF")
        error_correction = data.get("error_correction", "M")
        box_size = int(data.get("box_size", 10))
        border = int(data.get("border", 5))
        file_format = data.get("format", "png")

        error_levels = {
            "L": qrcode.constants.ERROR_CORRECT_L,
            "M": qrcode.constants.ERROR_CORRECT_M,
            "Q": qrcode.constants.ERROR_CORRECT_Q,
            "H": qrcode.constants.ERROR_CORRECT_H,
        }

        qr = qrcode.QRCode(
            version=1,
            error_correction=error_levels.get(error_correction, qrcode.constants.ERROR_CORRECT_M),
            box_size=box_size,
            border=border,
        )

        qr.add_data(text)
        qr.make(fit=True)

        img = qr.make_image(fill_color=qr_color, back_color=bg_color)
        
        buffer = BytesIO()
        if file_format.lower() == "svg":
            img.save(buffer, format="PNG")
        else:
            img.save(buffer, format="PNG")
        buffer.seek(0)
        
        return send_file(buffer, mimetype="image/png", as_attachment=True, download_name="qr_code.png")
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

if __name__ == "__main__":
    app.run(debug=True)
