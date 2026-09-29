json.key_format! camelize: :lower

dashboard = @dashboard

json.profile do
  json.extract! dashboard.profile, :id, :name
  json.country_code dashboard.country&.code
  json.country_name dashboard.country&.name
  json.photo { json.partial! 'api/v1/profiles/photo', profile: dashboard.profile }
end

json.pro dashboard.pro?
json.season Time.zone.now.year
json.available_modes dashboard.available_modes
json.mode dashboard.any_modes? ? dashboard.current_mode : nil
json.activity dashboard.any_modes? ? dashboard.current_activity : nil

if dashboard.any_modes?
  json.jumps_count dashboard.jumps_count
  json.locations_count dashboard.locations_count
  json.highlights { json.partial! 'api/v1/dashboards/highlights', dashboard: }

  json.rankings_gender dashboard.rankings_gender
  json.rankings_gender_toggle dashboard.rankings_gender_toggle?
  json.rankings dashboard.rankings, partial: 'api/v1/dashboards/ranking', as: :ranking

  json.show_competition_places dashboard.current_mode != :base
  json.competitions dashboard.competitions, partial: 'api/v1/dashboards/competition', as: :entry
  json.live_competitions dashboard.live_competitions, partial: 'api/v1/dashboards/live_competition', as: :entry

  json.recent_tracks dashboard.recent_tracks.includes(:video, pilot: :country, suit: :manufacturer, place: :country),
                     partial: 'api/v1/tracks/track', as: :track

  json.badges dashboard.badges do |badge|
    json.extract! badge, :id, :name, :category, :kind, :comment
    json.achieved_at badge.achieved_at&.iso8601
  end

  if dashboard.current_mode == :base
    json.exit_performances dashboard.exit_performances, partial: 'api/v1/dashboards/exit_performance', as: :performance
  else
    json.exit_performances []
  end

  json.journal { json.partial! 'api/v1/dashboards/journal', journal: dashboard.journal(params[:journal_period]) }
end
