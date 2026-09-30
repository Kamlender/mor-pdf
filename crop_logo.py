from PIL import Image
import os

# Paths
input_path = "public/images/peacock-feather.jpg"
logo_path = "public/images/logo.png"
favicon_path = "public/favicon.ico"
favicon_png_path = "public/favicon.png"

# Open the image
img = Image.open(input_path)
width, height = img.size

# The text seems to be at the bottom. 
# Let's crop the bottom 25% of the image. The user's uploaded image has the feather in the top ~75%.
# Let's crop a square around the feather to make it a good logo/favicon.
# Let's estimate: the feather is roughly centered. We can crop a square from the top.
# Assuming the image is roughly 1024x1024 based on standard AI gens.
# Let's just crop out the text (e.g., height - 300px) and make it square.
# A better way is to define a box. Let's assume standard 1024x1024. Text is usually bottom 250px.
crop_box = (0, 0, width, int(height * 0.75))
cropped = img.crop(crop_box)

# Now let's crop to a square for the logo/favicon. The feather is centered.
c_width, c_height = cropped.size
size = min(c_width, c_height)
left = (c_width - size) / 2
top = (c_height - size) / 2
right = (c_width + size) / 2
bottom = (c_height + size) / 2

square_img = cropped.crop((left, top, right, bottom))

# Save logo
square_img.save(logo_path, "PNG")

# Create favicons
icon_size = (32, 32)
favicon_img = square_img.resize(icon_size, Image.Resampling.LANCZOS)
favicon_img.save(favicon_path, format="ICO", sizes=[(32, 32)])
# Next.js uses icon.png sometimes, let's replace or add it just in case
favicon_img.save(favicon_png_path, "PNG")

print(f"Original size: {img.size}")
print(f"Cropped to: {square_img.size}")
print("Saved logo.png, favicon.ico, and favicon.png")
