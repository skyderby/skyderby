module Api
  module VirtualCompetitionRankingScoped
    extend ActiveSupport::Concern

    ASSOCIATIONS = [
      { suit: :manufacturer },
      { track: [{ place: :country }, :video] },
      { profile: [:country, :owner, { userpic_attachment: :blob }] }
    ].freeze

    included do
      helper_method :focused_profile_id
    end

    private

    def competition
      @competition ||= VirtualCompetition.includes(:group, place: :country).find(params[:virtual_competition_id])
    end

    def ranking_params = { page: params[:page], jump_kind: params[:jump_kind], gender: params[:gender] }

    def highlight(ranking)
      ranking.tap { |r| r.highlight_profile_id = params[:highlight] }
    end

    def focused_profile_id = @ranking.highlight_profile_id || Current.profile&.id
  end
end
