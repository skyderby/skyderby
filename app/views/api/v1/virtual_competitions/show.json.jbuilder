json.partial! @competition, partial: 'api/v1/virtual_competitions/virtual_competition', as: :competition

results_by_pilot = 
  @competition.virtual_comp_results
             .order('result DESC')
             .group_by{ |x| x.profile_id }
             .map do |_, results| 
               {
                 pilot: results.first.profile, 
                 all_results: results,
                 best_result: results.first
               } 
             end

json.results results_by_pilot do |json, results|
  json.pilot do |json|
    json.extract! results[:pilot], :id, :name
    json.userpic_url asset_url(results[:pilot].userpic.url(:medium))
  end

  json.best_result do |json|
    json.extract! results[:best_result], :id, :result, :created_at, :highest_gr, :highest_speed, :track_id
    json.track_url track_url(results[:best_result].track_id)
  end

  json.all_results results[:all_results] do |json, result|
    json.extract! result, :id, :result, :created_at, :highest_gr, :highest_speed, :track_id
    json.track_url track_url(result.track_id)
  end
end
