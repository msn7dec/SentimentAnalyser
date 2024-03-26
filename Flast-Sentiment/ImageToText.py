import requests

API_URL_SEMANTIC = "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large"
API_URL_CAPTION = "https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1"
headers = {"Authorization": "Bearer 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"}

class SemanticGenerator:

    def query(self, image_data):
        response = requests.post(API_URL_SEMANTIC, headers=headers, data=image_data)
        print("SemanticGenerator is ..",response.json()[0].get('generated_text'))
        sementicText = response.json()[0].get('generated_text')
        return response.json()[0]



class CaptionsGenerator:
    
    def query(self, payload):
        response = requests.post(API_URL_CAPTION, headers=headers, json=payload)
        return response.json()
    
    def makePayload(self, sementicText):
        print('makePayload= ', sementicText)
        prompt = "Questions: Based on the image description, generate a caption for instagram Add Emojis and hashtags atleast 3 Here is the description " +  sementicText  + "\n Answer: "

        print({
        "inputs": prompt,
        })

        return {
        "inputs": prompt,
        }
