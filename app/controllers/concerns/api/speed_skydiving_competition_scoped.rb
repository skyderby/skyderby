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
      [
        @event,
        results.pick(Arel.sql('MAX(updated_at)'), Arel.sql('COUNT(*)')),
        penalties.pick(Arel.sql('MAX(updated_at)'), Arel.sql('COUNT(*)'))
      ]
    end
  end
end
