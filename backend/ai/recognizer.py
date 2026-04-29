import torch
from facenet_pytorch import InceptionResnetV1
from torchvision import transforms
from PIL import Image
import numpy as np

class FaceRecognizer:
    def __init__(self):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        # Load the pre-trained InceptionResnetV1 model (FaceNet)
        self.model = InceptionResnetV1(pretrained='vggface2').eval().to(self.device)
        
        # We transform raw cropped images into the normalized tensor FaceNet expects
        self.transform = transforms.Compose([
            transforms.Resize((160, 160)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
        ])

    def get_embedding(self, face_image):
        """
        Face Image should be a BGR numpy array (e.g. cropped from OpenCV)
        """
        if face_image is None or face_image.size == 0:
            return None
            
        # Convert BGR (OpenCV) to RGB (PIL)
        img_rgb = face_image[:, :, ::-1]
        img_pil = Image.fromarray(img_rgb)
        
        # Transform and add batch dimension
        img_tensor = self.transform(img_pil).unsqueeze(0).to(self.device)
        
        with torch.no_grad():
            embedding = self.model(img_tensor).cpu().numpy()[0]
            
        # L2 Normalize the embedding for cosine similarity matching
        embedding = embedding / np.linalg.norm(embedding)
        return embedding

    @staticmethod
    def compute_similarity(emb1, emb2):
        """ Returns Cosine Similarity [-1.0, 1.0] """
        if emb1 is None or emb2 is None:
            return 0.0
        return float(np.dot(emb1, emb2))
