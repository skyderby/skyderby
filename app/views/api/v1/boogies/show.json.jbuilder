json.key_format! camelize: :lower

event = @event
categories = event.categories.sort_by(&:order)
competitors = preload_competitors(categories.flat_map(&:competitors), :event)

json.partial! 'api/v1/competitions/event', event: event
json.deletable event.deletable?
json.window do
  json.from event.range_from
  json.to event.range_to
end
json.number_of_results_for_total event.number_of_results_for_total
json.boards do
  json.child! do
    json.key 'scoreboard'
    json.label t('events.scoreboard')
    json.path api_v1_boogie_scoreboard_path(event)
  end
end
json.categories categories do |category|
  json.partial! 'api/v1/boogies/categories/category', category:
end
json.rounds event.rounds.order(:number) do |round|
  json.partial! 'api/v1/boogies/rounds/round', round:
end
json.competitors competitors do |competitor|
  json.partial! 'api/v1/competitions/competitor', competitor: competitor
  json.category_id competitor.section_id
end
json.partial! 'api/v1/competitions/organizers_and_sponsors', organizable: event
