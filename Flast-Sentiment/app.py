from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Api, Resource, fields, marshal_with
from flask_cors import CORS
from transformers import pipeline
from ImageToText import SemanticGenerator, CaptionsGenerator
import asyncio

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////Users/e3008246/sqlite/mytest.db'
db = SQLAlchemy(app)
api = Api(app)



class SentimentAnalyzer:
    def __init__(self, model_name="distilbert-base-uncased-finetuned-sst-2-english"):
        self.classifier = pipeline("sentiment-analysis", model=model_name)

    def analyze_sentiment(self, text):
        result = self.classifier(text)[0]
        sentiment = result["label"]
        score = result["score"]
        return sentiment, score
    
# Sentiment Analyzer
with app.app_context():
    analyzer = SentimentAnalyzer()

    # Database Models
    class Video(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        title = db.Column(db.String(100), nullable=False)
        description = db.Column(db.String(500))
        thumbnail = db.Column(db.String(2000000))
        likes = db.Column(db.Integer, default=0)
        comments = db.relationship('Comment', backref='video', lazy=True)

        def to_dict(self):
            return {
                'id': self.id,
                'title': self.title,
                'description': self.description,
                'thumbnail': self.thumbnail,
                'likes': self.likes,
                'comments': self.comments
            }

    class Comment(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        text = db.Column(db.String(500), nullable=False)
        author = db.Column(db.String(100), nullable=False)
        avatar = db.Column(db.String(2000000))
        sentiment = db.Column(db.String(50))
        video_id = db.Column(db.Integer, db.ForeignKey('video.id'), nullable=False)

        def to_dict(self):
            return {
                'id': self.id,
                'text': self.text,
                'author': self.author,
                'avatar': self.avatar,
                'sentiment': self.sentiment,
            }

    # Create the database tables
    db.create_all()


# Resource fields for serialization
comment_fields = {
    'id': fields.Integer,
    'text': fields.String,
    'author': fields.String,
    'avatar': fields.String,
    'sentiment': fields.String
}

video_fields = {
    'id': fields.Integer,
    'title': fields.String,
    'description': fields.String,
    'thumbnail': fields.String,
    'comments': fields.List(fields.Nested(comment_fields)),
    'likes': fields.Integer
}

class VideoDict(dict):
    _sa_instance_state = None

# Resource for retrieving All videos with comments
class VideoResources(Resource):
    @marshal_with(video_fields)
    def get(self):
        videos = Video.query.all()
        if videos:
            video_dicts = []
            for video in videos:
                video_dict = VideoDict(video.to_dict())
                video_dict['comments'] = [comment.to_dict() for comment in Comment.query.filter_by(video_id=video.id).all()]
                video_dicts.append(video_dict)
            return video_dicts
        else:
            return {'message': 'Video not found'}, 404
        

# Resource for retrieving videos with comments
class VideoResource(Resource):
    @marshal_with(video_fields)
    def get(self, video_id):
        video = Video.query.get(video_id)
        if video:
            return video
        else:
            return {'message': 'Video not found'}, 404

# Resource for inserting new comments
class CommentResource(Resource):
    def post(self, video_id):
        print('Inside Commen Post method video_id ::', video_id)
        video = Video.query.get(video_id)
        print('Inside Commen Post method', video)
        if video:
            data = request.get_json()
            comment = Comment(text=data['text'], author=data['author'], avatar=data['avatar'],
                              sentiment=data.get('sentiment'), video=video)
            db.session.add(comment)
            db.session.commit()
            return {'message': 'Comment added successfully'}, 201
        else:
            return {'message': 'Video not found'}, 404
        
# Resource for inserting new comments
class AddLikesResource(Resource):
    def put(self, video_id):
        print('Inside Commen Post method video_id ::', video_id)
        video = Video.query.get(video_id)
        print('Inside Commen Post method', video)
        if video:
            data = request.get_json()
            video.likes += 1
            db.session.add(video)
            db.session.commit()
            return {'message': 'Likes updated successfully'}, 201
        else:
            return {'message': 'Video not found'}, 404
        
# Resource for sentiment analysis
class SentimentAnalysisResource(Resource):
    def post(self):
        data = request.get_json()
        comment = data.get('comment', '')
        comments_id = data.get('commentId', '')
        sentiment, score = analyzer.analyze_sentiment(comment)
        # Determine the sentiment flag
        if sentiment == 'POSITIVE':
                sentiment_flag = 'positive'
        else:
            sentiment_flag = 'negative'

        response = {
            'sentiment': sentiment_flag
        }
        UpdateSentiments.put(self, comments_id, sentiment_flag)
        return jsonify(response)

# Resource for inserting new comments
class UpdateSentiments(Resource):
    def put(self, comments_id , sentiment):
        print('Is this method called',comments_id, sentiment)
        comment = Comment.query.get(comments_id)
        if comment:
            comment.sentiment = sentiment
            db.session.add(comment)
            db.session.commit()
            return {'message': 'Sentiment updated successfully'}, 201
        else:
            return {'message': 'Video not found'}, 404
        
class CaptionGeneratorResource(Resource):
    def post(self):
        try:
            file = request.files.get('image')
            print('Request payload:', file)
            if file is None:
                return {'error': 'Missing file parameter in the request payload'}, 400

            textImage = SemanticGenerator()
            responseText = textImage.query(file)

            captionGen = CaptionsGenerator()
            if responseText.get('generated_text'):
                payload = captionGen.makePayload(responseText.get('generated_text'))
                print('Response payload: coming here')
                res = captionGen.query(payload)
                print('Response payload:', res[0].get('generated_text'))

                # Return the generated caption
                return {'generated_text': res[0].get('generated_text').split('Answer:')[-1]}, 200

            # If no caption was generated, return an error
            return {'error': 'Failed to generate caption'}, 500

        except KeyError:
            return {'error': 'Missing "image" parameter in the request payload'}, 400
        except Exception as e:
            # Log the exception for debugging purposes
            print(f'Exception occurred: {e}')
            return {'error': 'An internal server error occurred'}, 500
        
# API routes
api.add_resource(VideoResources, '/videos')
api.add_resource(VideoResource, '/videos/<int:video_id>')
api.add_resource(CommentResource, '/videos/<int:video_id>/comments')
api.add_resource(SentimentAnalysisResource, '/evaluate')
api.add_resource(AddLikesResource, '/videos/<int:video_id>/likes')
api.add_resource(CaptionGeneratorResource, '/captions')



if __name__ == '__main__':
    app.run(debug=True)