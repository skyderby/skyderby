class Track::Debrief::Discipline
  PERFORMANCE = %w[time distance speed].freeze
  WINDOWS = (%w[distance_in_altitude distance_in_time base_race] + PERFORMANCE).freeze
  SUPPORTED = (WINDOWS + %w[flare]).freeze
  DEBRIEF_WINDOW = { from_altitude: 2500, to_altitude: 1500 }.freeze

  Part = Data.define(:discipline, :parameter, :finish_line_id, :results_sort_order) do
    def key = [discipline, parameter, finish_line_id && "fl#{finish_line_id}"].compact.join('-')

    def discipline_parameter = parameter

    def multi_discipline? = false

    def window? = WINDOWS.include?(discipline)

    def performance? = PERFORMANCE.include?(discipline)

    def chosen_window? = performance? && parameter.to_i.positive?

    def window_from = chosen_window? ? parameter : nil

    def window_to = window_from && (window_from - 1000)

    def with_window(from) = with(parameter: from)

    def name
      case discipline
      when 'distance_in_altitude' then "distance in #{parameter} m"
      when 'distance_in_time' then "distance in #{parameter} s"
      when 'base_race' then 'race to the finish line'
      when 'flare' then 'flare'
      when *PERFORMANCE then "#{discipline} in the #{window_label} window"
      end
    end

    def window_label = chosen_window? ? "#{window_from}-#{window_to} m" : 'performance'

    def ascending? = results_sort_order == 'ascending'

    def to_h = super.transform_keys(&:to_s)
  end

  attr_reader :parts, :competitions

  def self.parts_of(competition)
    scorables = competition.multi_discipline? ? competition.disciplines.to_a : [competition]
    scorables.map do |scorable|
      Part.new(
        discipline: scorable.discipline,
        parameter: scorable.discipline_parameter.to_i,
        finish_line_id: scorable.discipline == 'base_race' ? competition.finish_line_id : nil,
        results_sort_order: scorable.results_sort_order
      )
    end
  end

  def self.from_h(hash)
    parts = hash['parts'].map { |part| Part.new(**part.symbolize_keys.slice(*Part.members)) }
    new(parts, VirtualCompetition.where(id: hash['ranking_ids']).order(:name).to_a)
  end

  def initialize(parts, competitions = [])
    @parts = parts
    @competitions = competitions
  end

  def key = parts.map(&:key).join('+')

  def supported? = parts.all? { |part| SUPPORTED.include?(part.discipline) }

  def multi_discipline? = parts.size > 1

  def disciplines = parts

  def discipline = parts.first.discipline

  def discipline_parameter = parts.first.parameter

  def window_part = parts.find(&:window?)

  def chosen_window? = parts.any?(&:chosen_window?)

  def with_window(from)
    windowed = parts.map { |part| part.performance? ? part.with_window(from) : part }
    self.class.new(windowed, competitions)
  end

  def flare_part = parts.find { |part| part.discipline == 'flare' }

  def finish_line = window_part&.finish_line_id && Place::FinishLine.find_by(id: window_part.finish_line_id)

  def part_index_for(competition, discipline_id)
    return 0 unless competition.multi_discipline?

    competition.disciplines.index { |discipline| discipline.id == discipline_id }
  end

  def to_h
    { 'key' => key, 'parts' => parts.map(&:to_h), 'rankings' => competitions.map(&:name),
      'ranking_ids' => competitions.map(&:id) }
  end
end
