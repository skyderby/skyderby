json.suit_kind category.suit_kind
json.name category.name
json.page category.page
json.per_page category.per_page
json.total_count category.standings.rows.size
json.has_more category.more?
json.next_page category.more? ? category.next_page : nil
json.podium category.podium?
json.competitions do
  category.competitions.each { |discipline, competition| json.set! discipline, competition.id }
end
json.rows(rows, partial: 'api/v1/virtual_competitions/groups/row', as: :row, category:)
