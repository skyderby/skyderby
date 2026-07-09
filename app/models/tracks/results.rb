module Tracks
  class Results < SimpleDelegator
    def initialize(track)
      super
      @track = track
    end

    def online_results
      @online_results ||= build_online_results
    end

    def online_results? = online_results.any?

    def online_placeholder_reason
      return :no_pilot unless @track.pilot
      return :no_suit if @track.suit.nil? && !@track.speed_skydiving?
      return :disqualified if @track.disqualified_from_online_competitions
      return :not_public unless @track.public_track?

      :no_competitions
    end

    private

    def build_online_results
      return [] unless @track.pilot

      rows = representative_rows
      return [] if rows.empty?

      context = query_context(rows.map(&:virtual_competition_id))
      sort_results(rows.map { |row| build_result(row, context) })
    end

    def query_context(competition_ids)
      {
        totals: participant_totals(competition_ids),
        personal_scores: personal_scores_by_competition(competition_ids),
        own_results: own_results_by_competition(competition_ids)
      }
    end

    def sort_results(results)
      results.sort_by { |result| [result.valid? ? 0 : 1, result.top_percent || 1000] }
    end

    def build_result(row, context)
      competition_id = row.virtual_competition_id

      OnlineResult.new(
        row:,
        participants: context[:totals][competition_id].to_i,
        personal_score: context[:personal_scores][competition_id],
        own_results: context[:own_results][competition_id] || [],
        track_id: @track.id
      )
    end

    def representative_rows
      @track
        .all_virtual_competition_results
        .includes(virtual_competition: :group)
        .to_a
        .group_by(&:virtual_competition_id)
        .map { |_id, rows| rows.min_by { |row| row.wind_cancelled ? 1 : 0 } }
    end

    def participant_totals(competition_ids)
      VirtualCompetition::PersonalTopScore
        .wind_cancellation(false)
        .where(virtual_competition_id: competition_ids)
        .group(:virtual_competition_id)
        .count
    end

    def personal_scores_by_competition(competition_ids)
      VirtualCompetition::PersonalTopScore
        .wind_cancellation(false)
        .where(virtual_competition_id: competition_ids, profile_id: @track.profile_id)
        .index_by(&:virtual_competition_id)
    end

    def own_results_by_competition(competition_ids)
      VirtualCompetition::Result
        .wind_cancellation(false)
        .joins(:track)
        .where(virtual_competition_id: competition_ids, tracks: { profile_id: @track.profile_id })
        .pluck(:virtual_competition_id, :result)
        .each_with_object(Hash.new { |hash, key| hash[key] = [] }) do |(competition_id, result), acc|
          acc[competition_id] << result
        end
    end
  end
end
