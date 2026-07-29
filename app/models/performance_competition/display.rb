class PerformanceCompetition::Display < SimpleDelegator
  PALETTE = %w[#470FF4 #F24C00 #36e07a #a855f7].freeze
  DISCIPLINE_ORDER = %w[time distance speed vertical_speed flare].freeze

  def initialize(event)
    @event = event
    super(event)
  end

  def disciplines
    @disciplines ||=
      scoreboard.completed_rounds
                .map(&:discipline).uniq
                .sort_by { |discipline| DISCIPLINE_ORDER.index(discipline) || 99 }
  end

  def overall
    return unless @event.use_open_standings?

    @overall ||=
      begin
        rows = open_standings_rows.select { |row| row.rank && row.total_points.positive? }
        if rows.any?
          Category.new(nil, rows, disciplines,
                       title: I18n.t('performance_competitions.display.open_event'),
                       discipline_ranks: overall_discipline_ranks)
        end
      end
  end

  def categories
    @categories ||= scoreboard.categories.filter_map do |category, standings|
      rows = standings.rows.select { |row| row.rank && row.total_points.positive? }
      Category.new(category, rows, disciplines, discipline_ranks: overall_discipline_ranks) if rows.any?
    end
  end

  # Discipline placings are ranked across the whole event (open standings),
  # not per category, and keyed by competitor id so they resolve across the
  # separate standings objects each category builds.
  def overall_discipline_ranks
    @overall_discipline_ranks ||=
      disciplines.index_with { |discipline| rank_by_discipline(open_standings_rows, discipline) }
  end

  def teams? = @event.use_teams && @event.teams.any?

  def team_ranking
    @team_ranking ||= ranked_teams(@event.team_standings.ranking.select { |row| row.total_points.positive? })
  end

  TeamRow = Struct.new(:rank, :name, :total_points, :roster)
  TeamMember = Struct.new(:name, :points)

  class Category
    delegate :size, to: :rows

    def initialize(record, rows, disciplines, title: nil, discipline_ranks: {})
      @record = record
      @rows = rows
      @disciplines = disciplines
      @title = title
      @discipline_ranks = discipline_ranks
    end

    attr_reader :disciplines

    def name = @title || record.name

    def leaderboard
      @leaderboard ||= rows.map { |row| LeaderRow.new(row, disciplines, @discipline_ranks) }
    end

    def replays
      @replays ||= disciplines.filter_map { |discipline| Replay.build(discipline, rows) }
    end

    private

    attr_reader :record, :rows
  end

  class LeaderRow
    delegate :name, :country_code, :country_name, to: :competitor
    delegate :rank, :total_points, :rounds, to: :row

    def initialize(row, disciplines, discipline_ranks = {})
      @row = row
      @disciplines = disciplines
      @discipline_ranks = discipline_ranks
    end

    delegate :competitor, to: :row

    def suit = [competitor.suit&.manufacturer_code, competitor.suit_name].compact.join(' ')

    def photo_url
      competitor.photo_url(:medium) if competitor.photo
    end

    def discipline_scores
      @discipline_scores ||= @disciplines.map do |discipline|
        DisciplineScore.new(
          discipline,
          best_result_in(discipline)&.formatted_result,
          row.points_in_disciplines[discipline],
          @discipline_ranks.dig(discipline, competitor.id)
        )
      end
    end

    def round_rows
      round_numbers.map do |number|
        cells = @disciplines.map do |discipline|
          RoundCell.new(discipline, result_for(discipline, number), best_result_in(discipline))
        end
        RoundRow.new(number, cells)
      end
    end

    def best_result_in(discipline)
      results_in(discipline).max_by(&:result)
    end

    private

    attr_reader :row

    def round_numbers = rounds.map(&:number).uniq.sort

    def result_for(discipline, number)
      row.results.find do |result|
        result.round.discipline == discipline && result.round.number == number && result.valid?
      end
    end

    def results_in(discipline)
      row.results.select { |result| result.round.discipline == discipline && result.valid? }
    end
  end

  DisciplineScore = Struct.new(:discipline, :result, :points, :rank) do
    def points_text = points ? format('%.1f', points) : nil
  end

  RoundRow = Struct.new(:number, :cells)

  RoundCell = Struct.new(:discipline, :result, :best) do
    def formatted = result&.formatted_result

    def best? = result && best && result.result == best.result

    def penalty = result&.penalized? ? result.penalty_size : nil

    def delta
      return if result.nil? || best.nil? || best?

      result.result - best.result
    end
  end

  Replay = Struct.new(:discipline, :fallers, keyword_init: true) do
    def self.build(discipline, rows)
      fallers =
        rows
        .filter_map { |row| latest_round_result(row, discipline) }
        .sort_by { |result| -result.result }
        .each_with_index
        .filter_map { |result, index| Faller.build(result, PALETTE[index % PALETTE.size]) }

      new(discipline:, fallers:) if fallers.size >= 1
    end

    def self.latest_round_result(row, discipline)
      row.results
         .select { |result| result.round.discipline == discipline && result.valid? && result.track }
         .max_by { |result| result.round.number }
    end

    def fall_pairs
      pairs = fallers.each_slice(2).to_a
      return pairs unless pairs.last&.one?

      leftover = pairs.pop.first
      partner = fallers[-2]
      pairs << (partner ? [partner, leftover] : [leftover])
    end
  end

  private

  def scoreboard = @scoreboard ||= @event.standings

  def open_standings_rows = @open_standings_rows ||= @event.open_standings.standings.rows

  def rank_by_discipline(rows, discipline)
    ranked = rows
             .select { |row| row.points_in_disciplines[discipline]&.positive? }
             .sort_by { |row| -row.points_in_disciplines[discipline] }

    ranks = {}
    previous = nil
    ranked.each_with_index do |row, index|
      points = row.points_in_disciplines[discipline]
      rank = previous && previous[:points] == points ? previous[:rank] : index + 1
      ranks[row.competitor.id] = rank
      previous = { points:, rank: }
    end
    ranks
  end

  def ranked_teams(ranking)
    previous = nil
    ranking.each_with_index.map do |row, index|
      rank = previous && previous[:total] == row.total_points ? previous[:rank] : index + 1
      previous = { total: row.total_points, rank: }
      TeamRow.new(rank, row.team.name, row.total_points, team_members(row))
    end
  end

  def team_members(row)
    row.ranks.compact.map { |member| TeamMember.new(member.competitor.name, member.total_points) }
  end
end
