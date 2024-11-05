json.extract! @videos, :current_page, :total_pages

json.items @videos, partial: 'api/web/tracks/videos/video', as: :video
