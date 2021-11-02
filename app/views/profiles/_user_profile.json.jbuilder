json.extract! profile, :id, :name, :crop_x, :crop_y, :crop_w, :crop_h
json.userpic_thumb profile.userpic_url(:thumb)
json.userpic_medium profile.userpic_url(:medium)
json.userpic_large profile.userpic_url(:large)
