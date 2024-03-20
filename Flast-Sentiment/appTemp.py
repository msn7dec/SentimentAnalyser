from flask import Flask, request, jsonify
from textblob import TextBlob
from flask_cors import CORS
from transformers import pipeline

app = Flask(__name__)
CORS(app)

def sentiment_analysis(text):
    classifier = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")
    result = classifier(text)[0]
    sentiment = result["label"]
    score = result["score"]
    return sentiment, score

@app.route('/evaluate', methods=['POST'])
def evaluate_comment():
    data = request.get_json()
    comment = data.get('comment', '')
    print(comment)

    # Perform sentiment analysis using TextBlob
    # blob = TextBlob(comment)
    # sentiment = blob.sentiment.polarity

    # # Determine the sentiment flag
    # if sentiment > 0:
    #     sentiment_flag = 'positive'
    # elif sentiment < 0:
    #     sentiment_flag = 'negative'
    # else:
    #     sentiment_flag = 'neutral'

    # # Prepare the response
    # response = {
    #     'sentiment': sentiment_flag
    # }

    sentiment, score = (sentiment_analysis(comment))
    print(f"Sentiment: {sentiment}")
    print(f"Score: {score:.2f}")
    # Determine the sentiment flag
    if sentiment == 'POSITIVE':
            sentiment_flag = 'positive'
    else:
        sentiment_flag = 'negative'

    response = {
        'sentiment': sentiment_flag
    }
    
    return jsonify(response)

if __name__ == '__main__':
    app.run()