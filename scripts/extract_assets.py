from PIL import Image

im_home = Image.open('public/references/home-reference.jpg')
im_menu = Image.open('public/references/menu-reference.jpg')
w, h = im_home.size

# 1. Hero Burger with fries
hero_burger = im_home.crop((260, 50, 680, 290))
hero_burger.save('public/images/assets/hero-burger.png', quality=95)

# 2. Combo banner (Burger + Fries + Coke)
combo_banner = im_home.crop((215, 600, 440, 725))
combo_banner.save('public/images/assets/combo-promo.png', quality=95)

# 3. Parrilla section grill meat
parrilla_meat = im_home.crop((230, 725, 675, 805))
parrilla_meat.save('public/images/assets/parrilla-steaks.png', quality=95)

# 4. Robot mascot
robot_mascot = im_home.crop((265, 800, 410, 925))
robot_mascot.save('public/images/assets/robot-mascot.png', quality=95)

# 5. WhatsApp chat preview
chat_preview = im_home.crop((405, 800, 660, 925))
chat_preview.save('public/images/assets/chat-preview.png', quality=95)

# 6. Menu page hero burger
menu_hero_burger = im_menu.crop((320, 35, 680, 210))
menu_hero_burger.save('public/images/assets/menu-hero-burger.png', quality=95)

# 7. Menu bottom combo
menu_combo_banner = im_menu.crop((235, 825, 455, 920))
menu_combo_banner.save('public/images/assets/menu-bottom-combo.png', quality=95)

print("Assets extracted successfully!")
