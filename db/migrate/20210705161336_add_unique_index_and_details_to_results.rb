class AddUniqueIndexAndDetailsToResults < ActiveRecord::Migration[6.0]
  def change
    change_table :speed_skydiving_competition_results, bulk: true do |t|
      t.datetime :window_start_time
      t.datetime :window_end_time
    end

    add_index(
      :speed_skydiving_competition_results,
      %i[competitor_id round_id],
      unique: true,
      name: :speed_skydiving_results_by_competitor_and_rounds
    )
  end
end
