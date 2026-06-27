class VirtualCompetition
  class Ranking
    PER_PAGE = 25
    JUMP_KINDS = %w[skydive base].freeze
    GENDERS = %w[female].freeze

    attr_reader :competition, :page, :jump_kind, :gender

    def initialize(competition, scores, page: nil, jump_kind: nil, gender: nil)
      @competition = competition
      @base_scores = scores
      @page = [page.to_i, 1].max
      @jump_kind = jump_kind if jump_kind_selector? && JUMP_KINDS.include?(jump_kind)
      @gender = gender if GENDERS.include?(gender)
    end

    def scores = @scores ||= paginate(all_scores)

    def all_scores = @all_scores ||= filtered? ? filter_and_rank(@base_scores) : @base_scores

    def jump_kind_options = jump_kind_selector? ? [nil, *JUMP_KINDS] : []

    def gender_options = [nil, *GENDERS]

    def rank_change_for(_score) = nil

    def show_rank_changes? = false

    private

    def filtered? = jump_kind.present? || gender.present?

    def paginate(collection)
      if collection.is_a?(Array)
        Kaminari.paginate_array(collection).page(page).per(PER_PAGE)
      else
        collection.page(page).per(PER_PAGE)
      end
    end

    def jump_kind_selector? = competition.flare? && competition.jumps_kind.nil?

    def filter_and_rank(scores)
      ranked = scores.select { |score| match?(score) }.sort_by(&:result)
      ranked.reverse! if competition.results_sort_order == 'descending'
      ranked.each_with_index { |score, index| score.rank = index + 1 }
      ranked
    end

    def match?(score)
      (jump_kind.nil? || score.track.kind == jump_kind) &&
        (gender.nil? || score.profile.gender == gender)
    end
  end
end
