import os
import tinify

def compressed_image_upload_to(instance, filename):
    if instance and filename:
        base_name, extension = os.path.splitext(filename)
        return f'item_images_additional/{base_name}{extension}'
    return 'item_images_additional/default.jpg' 
