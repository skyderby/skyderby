json.extract! online_ranking,
              :id,
              :name,
              :featured,
              :period_from,
              :period_to,
              :discipline,
              :discipline_parameter,
              :group_id,
              :place_id,
              :finish_line_id,
              :suits_kind,
              :jumps_kind,
              :range_from,
              :range_to,
              :display_highest_speed,
              :display_highest_gr,
              :display_on_start_page,
              :default_view,
              :interval_type,
              :years

json.intervals online_ranking.intervals do |interval|
  json.extract! interval, :name, :slug
end

json.created_at online_ranking.created_at.iso8601
json.updated_at online_ranking.updated_at.iso8601

json.permissions do
  json.can_edit policy(online_ranking).edit?
end
