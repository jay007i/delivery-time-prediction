from flask import Flask, render_template, request, jsonify
import pandas as pd
import joblib

app = Flask(__name__)

# =========================
# Load model once
# =========================
model = joblib.load("models/final_model.pkl")
feature_names = joblib.load("models/feature_names.pkl")


# =========================
# Serve frontend page
# =========================
@app.route("/")
def home():
    return render_template("index.html")


# =========================
# Prediction API
# =========================
@app.route("/predict", methods=["POST"])
def predict():

    data = request.json

    # SAME LOGIC AS YOUR STREAMLIT CODE
    input_data = {
        "Distance_km": data["distance"],
        "Preparation_Time_min": data["prep_time"],
        "Courier_Experience_yrs": data["experience"],
        "Weather_category": 1 if data["weather"] == "Delay-Risk" else 0,
        "Traffic_Level": {"Low": 1, "Medium": 2, "High": 3}[data["traffic"]],
        "Vehicle_Type_Scooter": 1 if data["vehicle"] == "Scooter" else 0,
        "Vehicle_Type_Car": 1 if data["vehicle"] == "Car" else 0
    }

    df = pd.DataFrame([input_data])
    df = df.reindex(columns=feature_names, fill_value=0)

    prediction = model.predict(df)[0]

    return jsonify({
        "prediction": round(float(prediction), 2)
    })


# =========================
# Run server
# =========================
# if __name__ == "__main__":
#     app.run(debug=True)
import os

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
