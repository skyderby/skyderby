module Api
  module SpeedSkydivingCompetitionScoped
    extend ActiveSupport::Concern

    included do
      before_action :set_event
    end

    private

    def set_event
      @event = SpeedSkydivingCompetition.includes(place: :country).find(params[:speed_skydiving_competition_id])
      raise ActiveRecord::RecordNotFound unless @event.viewable?
    end

    def until_round = params[:until_round].presence&.to_i

    def scoreboard_etag
      results = @event.results
      penalties = SpeedSkydivingCompetition::Result::Penalty.where(result_id: results.select(:id))
      [@event, change_marker(results), change_marker(penalties)]
    end

    def change_marker(relation)
      updated_at, count = relation.pick(Arel.sql('MAX(updated_at)'), Arel.sql('COUNT(*)'))
      [updated_at&.utc&.iso8601(6), count]
    end
  end
end
