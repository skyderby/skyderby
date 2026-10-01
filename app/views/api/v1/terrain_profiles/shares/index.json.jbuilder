json.key_format! camelize: :lower

json.items @shares, partial: 'api/v1/terrain_profiles/shares/share', as: :share
