import numpy as np
import tensorflow as tf
import os
from sklearn.metrics import accuracy_score, f1_score, jaccard_score
import matplotlib.pyplot as plt

class UrbanGrowthPredictor:
    def __init__(self):
        self.model = None
        self.predictions = None
        self.ground_truth = None
        self.metrics = None
        self.load_model()
        self.load_data()
        self.calculate_metrics()
    
    def load_model(self):
        """Load the trained U-Net model"""
        try:
            model_path = r"C:\Users\Lenovo\Desktop\LY MAJOR PROJECT\data\models\urban_growth_unet.h5"
            if os.path.exists(model_path):
                self.model = tf.keras.models.load_model(model_path)
                print("✅ Model loaded successfully")
            else:
                print(f"❌ Model file not found: {model_path}")
        except Exception as e:
            print(f"❌ Error loading model: {e}")
    
    def load_data(self):
        """Load prediction data"""
        try:
            predictions_dir = r"C:\Users\Lenovo\Desktop\LY MAJOR PROJECT\data\predictions"
            data_path = os.path.join(predictions_dir, "test_predictions.npz")
            
            if os.path.exists(data_path):
                data = np.load(data_path)
                self.predictions = data["predictions"]
                self.ground_truth = data["ground_truth"]
                print("✅ Prediction data loaded successfully")
            else:
                print(f"❌ Data file not found: {data_path}")
        except Exception as e:
            print(f"❌ Error loading data: {e}")
    
    def calculate_metrics(self):
        """Calculate model performance metrics once"""
        if self.ground_truth is None or self.predictions is None:
            self.metrics = None
            return
        
        try:
            y_true_flat = self.ground_truth.flatten() > 0.5
            y_pred_flat = self.predictions.flatten() > 0.5
            
            acc = accuracy_score(y_true_flat, y_pred_flat)
            f1 = f1_score(y_true_flat, y_pred_flat)
            iou = jaccard_score(y_true_flat, y_pred_flat)
            
            self.metrics = {
                "accuracy": acc,
                "f1_score": f1,
                "iou": iou
            }
            print("✅ Metrics calculated successfully")
        except Exception as e:
            print(f"❌ Error calculating metrics: {e}")
            self.metrics = None
    
    def get_metrics(self):
        """Return pre-calculated metrics"""
        return self.metrics
    
    def get_sample_data(self, index):
        """Get sample data for visualization"""
        if (self.ground_truth is None or self.predictions is None or 
            index >= len(self.predictions)):
            return None
        
        try:
            return {
                "ground_truth": self.ground_truth[index, :, :, 0],
                "prediction": self.predictions[index, :, :, 0],
                "difference": np.abs(self.ground_truth[index, :, :, 0] - self.predictions[index, :, :, 0])
            }
        except Exception as e:
            print(f"❌ Error getting sample data: {e}")
            return None
    
    def get_growth_trend(self):
        """Get urban growth trend data"""
        years = [2000, 2005, 2010, 2015, 2020, 2030, 2040]
        growth = [10, 18, 25, 40, 55, 70, 88]
        return years, growth