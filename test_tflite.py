import tensorflow as tf 
import numpy as np 
 
interpreter = tf.lite.Interpreter(model_path="model.tflite") 
interpreter.allocate_tensors() 
 
input_details = interpreter.get_input_details() 
output_details = interpreter.get_output_details() 
 
print("Input shape:", input_details[0]['shape']) 
print("Output shape:", output_details[0]['shape']) 
 
dummy_input = np.random.random_sample(input_details[0]['shape']).astype(np.float32) 
interpreter.set_tensor(input_details[0]['index'], dummy_input) 
interpreter.invoke() 
output = interpreter.get_tensor(output_details[0]['index']) 
print("Output:", output) 
