json.items @events, partial: 'performance_competition', as: :event
json.extract! @events, :current_page, :total_pages
