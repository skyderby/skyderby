class Track::Debrief::Prompt
  include Track::Debrief::PromptParts

  VERSION = '2026-11-07.2'.freeze

  LANGUAGES = { 'en' => 'English', 'ru' => 'Russian', 'de' => 'German', 'it' => 'Italian',
                'es' => 'Spanish', 'fr' => 'French' }.freeze

  def initialize(debrief)
    @debrief = debrief
  end

  def system
    [ROLE, KINDS.fetch(kind), PRINCIPLES, SCORING, parts_text, (MOVING_AIR if window_part),
     WORDS.sub('PART_NAMES', part_names), format_text, (READER unless debrief.read_by_pilot?)].compact.join("\n")
  end

  def agent_system(advisor: false) = [system, INVESTIGATION, (ADVISOR if advisor)].compact.join("\n")

  def user_message
    <<~MESSAGE
      Write the debrief in #{language}.

      Other jumps, to use in of= and with=: #{reference_names}.

      Snapshot:
      #{JSON.pretty_generate(snapshot)}
    MESSAGE
  end

  def agent_message
    <<~MESSAGE
      Write the debrief in #{language}.

      Summary:
      #{JSON.pretty_generate(agent_summary)}
    MESSAGE
  end

  private

  def discipline = debrief.discipline

  def parts = discipline.parts

  def kind = debrief.track&.skydive? ? 'skydive' : 'base'

  def window_part = discipline.window_part

  def flare? = discipline.flare_part.present?

  def part_names = parts.map { |part| %("#{part.name}") }.join(', ')

  def parts_text
    lines = parts.map do |part|
      text = PARTS.fetch(part.discipline).gsub('PARAMETER', part.parameter.to_s).squish
      notes = [(RUN_UP if part.performance?), (CHOSEN_WINDOW if part.chosen_window?)].join
      %(- "#{part.name}" (key #{part.discipline}): #{text}#{notes})
    end
    ['Parts of this discipline:', *lines, phases_note].compact.join("\n")
  end

  def phases_note
    phases = []
    phases << %(window holds the metrics of the "#{window_part.name}" part) if window_part
    phases << 'flare holds the flare' if flare?
    "In the data, #{phases.to_sentence}. Speeds are km/h." if phases.any?
  end

  def format_text
    FORMAT.sub('METRIC_KEYS', metric_keys)
          .sub('PHASES', replay_phases.join(' ')).sub('CHARTS', charts.join(' '))
  end

  def metric_keys
    keys = []
    keys << WINDOW_KEYS.sub('CHECKPOINTS', checkpoint_seconds.join(', ')) if window_part
    keys << PERFORMANCE_KEYS if window_part&.performance?
    keys << FLARE_KEYS if flare?
    keys.join(', ')
  end

  def checkpoint_seconds
    window_part.performance? ? Track::FlightMetrics::PERFORMANCE_CHECKPOINTS : Track::FlightMetrics::CHECKPOINTS
  end

  def replay_phases = [(WINDOW_REPLAY if window_part), (FLARE_REPLAY if flare?)].compact

  def charts = (window_part ? WINDOW_CHARTS : []) + (flare? ? FLARE_CHARTS : [])

  def agent_summary
    snapshot.slice('discipline', 'pilot', 'jump', 'standings', 'thresholds', 'pilot_jumps')
  end

  attr_reader :debrief

  def language = LANGUAGES.fetch(debrief.locale, 'English')

  def inputs = debrief.inputs

  def reference_names
    names = inputs['references'].each_with_index.map do |reference, index|
      "ref#{index + 1} = #{reference['name']} (#{reference['role']})"
    end
    names.presence&.join(', ') || 'none'
  end

  def snapshot
    inputs.deep_dup.tap do |data|
      strip_series(data['jump'])
      data['references'].each { |reference| strip_series(reference) }
    end
  end

  def strip_series(entry)
    entry['metrics']&.each_value { |phase| phase&.delete('series') }
  end
end
