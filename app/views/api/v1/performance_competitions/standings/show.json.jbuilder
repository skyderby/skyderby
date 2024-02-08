json.array! @standings.categories do |standings|
  json.category_id standings[:category].id
  json.rows standings[:standings] do |row|
    json.rank row.rank
    json.total_points row.total_points.to_f
    json.competitor_id row.competitor.id

    if row.points_in_disciplines.any?
      json.points_in_disciplines do
        row.points_in_disciplines.each do |task, score|
          json.set! task, score.to_f
        end
      end
    else
      json.set! :points_in_disciplines, {}
    end

    if row.results.any?
      json.round_results do
        row.results.each do |result|
          json.set! result.round.slug do
            json.extract! result, :id, :penalized, :penalty_size, :penalty_reason
            json.result result.result.to_f
            json.points result.points.to_f
          end
        end
      end
    else
      json.set! :round_results, {}
    end
  end
end
