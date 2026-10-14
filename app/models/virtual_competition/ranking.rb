class VirtualCompetition
  class Ranking
    PER_PAGE = 25
    PODIUM_SIZE = 3
    JUMP_KINDS = %w[skydive base].freeze
    GENDERS = %w[female].freeze
    ASSOCIATIONS = [
      :virtual_competition,
      { suit: :manufacturer },
      { track: [{ place: :country }, :video] },
      { profile: [:country, :owner, { userpic_attachment: :blob }] }
    ].freeze

    attr_reader :competition, :jump_kind, :gender, :highlight_profile_id

    def initialize(competition, interval: nil, page: nil, jump_kind: nil, gender: nil)
      @competition = competition
      @interval = interval
      @page_param = page
      @jump_kind = jump_kind if competition.jump_kind_filterable? && JUMP_KINDS.include?(jump_kind)
      @gender = gender if GENDERS.include?(gender)
    end

    def highlight_profile_id=(value)
      @highlight_profile_id = value.presence&.to_i
    end

    def page = @page ||= resolve_page

    def scores = @scores ||= all_scores.page(page).per(PER_PAGE).load

    def all_scores = standings.includes(associations).order(:rank)

    def podium
      @podium ||= leaders.size == PODIUM_SIZE ? leaders : []
    end

    def leader = leaders.first

    def score_for(profile_id)
      return if profile_id.blank?

      @scores_by_profile ||= {}
      @scores_by_profile.fetch(profile_id) do
        @scores_by_profile[profile_id] =
          scores.find { |score| score.profile_id == profile_id } ||
          (all_scores.find_by(profile_id:) if competed?(profile_id))
      end
    end

    delegate :jump_kind_options, :gender_options, to: :competition

    def rank_change_for(_score) = nil

    def show_rank_changes? = false

    private

    def standings = competition.standings(**period, jump_kind:, gender:)

    def period = { interval: @interval }

    def associations
      competition.multi_discipline? ? [*ASSOCIATIONS, { virtual_competition: :disciplines }] : ASSOCIATIONS
    end

    def leaders
      @leaders ||= page == 1 && PER_PAGE >= PODIUM_SIZE ? scores.first(PODIUM_SIZE) : all_scores.limit(PODIUM_SIZE).to_a
    end

    def competed?(profile_id) = competition.results.joins(:track).exists?(tracks: { profile_id: })

    def resolve_page
      return [@page_param.to_i, 1].max if @page_param.present?
      return 1 unless highlight_profile_id

      rank = standings.where(profile_id: highlight_profile_id).pick(:rank)
      rank ? ((rank - 1) / PER_PAGE) + 1 : 1
    end
  end
end
