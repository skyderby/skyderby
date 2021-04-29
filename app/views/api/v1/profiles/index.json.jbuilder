json.key_format! camelize: :lower

json.extract! @profiles, :current_page, :total_pages

json.items @profiles, partial: 'profile', as: :profile
