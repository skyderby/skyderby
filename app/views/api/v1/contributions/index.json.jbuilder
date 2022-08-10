json.extract! @contributions, :current_page, :total_pages

json.items @contributions, partial: 'contribution', as: :contribution
