class VirtualCompetition::Group
  class Scoreboard
    DISCIPLINES = %w[distance speed time].freeze
    SUIT_KINDS = %w[wingsuit monotrack tracksuit slick].freeze
    PER_PAGE = 25
    SNAPSHOT_AGE = 1.week

    attr_reader :group, :year, :wind_cancellation, :gender

    def initialize(group, year: nil, wind_cancellation: false, gender: nil, pages: {})
      @group = group
      @year = normalize_year(year)
      @wind_cancellation = wind_cancellation
      @gender = gender if VirtualCompetition::Ranking::GENDERS.include?(gender)
      @pages = pages
    end

    def categories
      @categories ||= SUIT_KINDS.filter_map { |suit_kind| build_category(suit_kind) }
    end

    def category(suit_kind) = categories.find { |category| category.suit_kind == suit_kind }

    def populated_categories = categories.select { |category| category.rows.any? }

    delegate :any?, to: :categories

    def columns_count = (DISCIPLINES.size * 2) + 4

    def gender_options = [nil, *VirtualCompetition::Ranking::GENDERS]

    def show_rank_changes? = year.present? && !wind_cancellation

    def overall? = year.nil?

    def competitions = @competitions ||= group.virtual_competitions.where(discipline: DISCIPLINES).to_a

    private

    def normalize_year(year)
      year = year.to_s.presence&.to_i
      year if year && group.years.include?(year)
    end

    def build_category(suit_kind)
      by_discipline = competitions.select { |competition| competition.suits_kind == suit_kind }
                                  .index_by(&:discipline)
      return unless DISCIPLINES.all? { |discipline| by_discipline.key?(discipline) }

      by_discipline = by_discipline.slice(*DISCIPLINES)

      Category.new(
        self,
        suit_kind,
        by_discipline,
        standings_for(by_discipline),
        page: page_for(suit_kind)
      )
    end

    def standings_for(competitions_by_discipline)
      Standings.new(
        competitions_by_discipline,
        top_scores(competitions_by_discipline.values),
        previous_scores(competitions_by_discipline.values),
        gender:
      )
    end

    def page_for(suit_kind) = [@pages[suit_kind].to_s.to_i, 1].max

    def top_scores(competitions)
      scores =
        if year
          VirtualCompetition::AnnualTopScore.with_wind_cancellation(wind_cancellation).for_year(year)
        else
          VirtualCompetition::PersonalTopScore.all
        end

      load_scores(scores, competitions)
    end

    def previous_scores(competitions)
      return {} unless show_rank_changes?

      scores = VirtualCompetition::AnnualTopScore.at_snapshot(SNAPSHOT_AGE.ago).for_year(year)

      load_scores(scores, competitions)
    end

    def load_scores(scores, competitions)
      scores
        .where(virtual_competition_id: competitions.map(&:id))
        .wind_cancellation(wind_cancellation)
        .includes(:track, :suit, profile: %i[country owner])
        .group_by(&:virtual_competition_id)
    end
  end
end
