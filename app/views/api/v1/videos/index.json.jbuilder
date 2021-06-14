json.key_format! camelize: :lower

json.extract! @videos, :current_page, :total_pages

json.items @videos, partial: 'api/v1/tracks/videos/video', as: :video
