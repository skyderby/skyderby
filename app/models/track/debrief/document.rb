class Track::Debrief::Document
  TAG = %r{<(metric|needed|chart)\b([^>]*?)/?>(?:\s*</\1>)?}
  ATTRIBUTE = /([a-z_]+)="([^"]*)"/
  TOKEN = /imprtag(\d+)x/
  TRACK_REFERENCE = /\btrack:(\d+)\b/
  TRACK_LINK = /\]\(track:(\d+)\)/
  REPLAY = %r{<replay\b([^>]*)>(.*?)</replay>}m
  MOMENT = %r{<moment\b([^>]*)>(.*?)</moment>}m
  VALUE = %r{<v\s+of="([^"]*)">(.*?)</v>}m
  TERM = %r{<term\b[^>]*>(.*?)</term>}m
  VISUAL_CHARTS = %w[speed_loss window_gap flare_potential].freeze
  REPEATED_UNIT = %r{(<(?:metric|needed)\b[^>]*/>)[ \u00a0]?(?:km/h|m|s|sec|%|°|pts|points)(?![\w/])}
  CHART_SERIES = {
    'window_side' => ['window', ->(row) { [row[2], row[1], row[0], row[3], row[4]] }],
    'window_speed' => ['window', ->(row) { [row[0], row[3]] }],
    'flare_speed' => ['flare', ->(row) { [row[0], row[2]] }],
    'flare_dive' => ['flare', ->(row) { [row[0], row[3]] }],
    'flare_gain' => ['flare', ->(row) { [row[0], row[1]] if row[0] >= 0 }]
  }.freeze
  UNIT_KEYS = { meters: 'units.m', kmh: 'units.kmh', seconds: 'units.sec', points: 'tracks.debriefs.points',
                energy: 'tracks.debriefs.energy_unit',
                points_per_unit: 'tracks.debriefs.points_per_unit' }.freeze
  PHASE_UNITS = [
    [/\A(lost|distance|gain|elevation|height|possible_gain|.*_altitude)\z/, :meters],
    [/\A(.*_at|duration|settled_for|time)\z/, :seconds],
    [/energy/, :energy], [/speed/, :kmh], [/glide/, :none],
    [/\Adive_angle\z/, :degrees], [/\Aefficiency\z/, :percent]
  ].freeze
  UNIT_SYMBOLS = { degrees: '°', percent: '%' }.freeze
  CHART_AXES = {
    'window_side' => [%w[height units.m], %w[distance units.m]],
    'window_speed' => [%w[speed units.kmh], %w[time units.sec]],
    'flare_speed' => [%w[speed units.kmh], %w[time_from_flare units.sec]],
    'flare_dive' => [%w[speed units.kmh], %w[time_from_flare units.sec]],
    'flare_gain' => [%w[height units.m], %w[time_from_flare units.sec]]
  }.freeze
  COLORS = %w[--blue-70 --green-80 --orange-70 --purple-70 --cyan-70 --pink-70].freeze
  PHASES = %w[window flare].freeze

  Metric = Data.define(:value, :unit)

  attr_reader :report

  def initialize(report)
    @report = report
  end

  def render(view)
    tags = []
    html = markdown.render(tokenize(report.content.to_s, tags))
    html = html.gsub(%r{<p>\s*#{TOKEN}\s*</p>}o) { render_tag(view, *tags[Regexp.last_match(1).to_i], block: true) }
    html = html.gsub(TOKEN) { render_tag(view, *tags[Regexp.last_match(1).to_i], block: false) }
    html.html_safe # rubocop:disable Rails/OutputSafety
  end

  def metric(key, of: 'self')
    parts = key.to_s.split('.')
    case parts.first
    when 'season_best' then discipline_metric(parts.second, 'season_best')
    when 'points_per_unit' then discipline_metric(parts.second, 'points_per_unit', unit: :points_per_unit)
    when *PHASES then phase_metric(subject(of), parts)
    else score_metric(subject(of), parts)
    end
  end

  def needed(discipline, rank)
    threshold = inputs['thresholds'].find { |item| item['rank'].to_s == rank.to_s }
    value = threshold&.dig('extra_needed', discipline)
    value && Metric.new(value, discipline_unit(discipline))
  end

  def chart(name, with: nil)
    return unless CHART_SERIES.key?(name)

    subjects = [inputs['jump'].merge('name' => inputs.dig('pilot', 'name'), 'self' => true), *inputs['references'],
                *evidence_tracks(with)]
    series = subjects.each_with_index.filter_map do |entry, index|
      rows = chart_rows(name, entry['metrics'])
      { 'name' => entry['name'], 'color' => COLORS[index], 'self' => entry['self'] || false, 'rows' => rows } if rows
    end

    series.presence && { 'name' => name, 'series' => series }
  end

  def replay(phase, moments, with: nil)
    return unless PHASES.include?(phase)

    visuals(with).replay(phase, moments)
  end

  def visual_chart(name, with: nil)
    visuals(with).public_send(name) if VISUAL_CHARTS.include?(name)
  end

  private

  def inputs = report.inputs

  def extra_subjects(with)
    with.to_s.split(',').map(&:strip).uniq.reject { |item| item == 'self' }.filter_map do |item|
      entry = subject(item)
      [item, entry] if entry
    end
  end

  def visual_subjects(with)
    own = ['self', inputs['jump'].merge('name' => inputs.dig('pilot', 'name'), 'track_id' => report.track_id)]
    [own, *extra_subjects(with)].each_with_index.map do |(key, entry), index|
      Track::Debrief::Visuals::Subject.new(key:, name: subject_name(entry, own.last), color: COLORS[index],
                                           self: index.zero?,
                                           metrics: entry['metrics'], track_id: entry['track_id'])
    end
  end

  def visuals(with) = Track::Debrief::Visuals.new(visual_subjects(with))

  def subject_name(entry, own)
    return entry['name'] if entry.equal?(own) || entry['name'] != own['name']

    detail = entry['place'] == report.track&.place&.name ? short_date(entry['date']) : entry['place']
    [entry['name'], detail.presence].compact.join(' · ')
  end

  def short_date(date) = date.present? ? I18n.l(Date.parse(date), format: '%-d %b') : nil

  def tokenize(content, tags)
    tokenized = content.gsub(TERM, '\\1').gsub(REPLAY) do
      attributes, moments = Regexp.last_match.captures
      "\n\n#{stash(tags, 'replay', attributes.scan(ATTRIBUTE).to_h.merge('moments' => moments))}\n\n"
    end
    tokenized = tokenized.gsub(REPEATED_UNIT, '\\1').gsub(TAG) do
      name, attributes = Regexp.last_match.captures
      token = stash(tags, name, attributes.scan(ATTRIBUTE).to_h)
      name == 'chart' ? "\n\n#{token}\n\n" : token
    end
    link_tracks(tokenized)
  end

  def link_tracks(text)
    text.gsub(TRACK_LINK) { "](#{track_path(Regexp.last_match(1))})" }
        .gsub(TRACK_REFERENCE) { track_link(Regexp.last_match(1)) }
  end

  def stash(tags, name, attributes)
    tags << [name, attributes]
    "imprtag#{tags.size - 1}x"
  end

  def track_link(id)
    entry = evidence_track(id)
    label = entry ? [entry['place'], entry['date']].compact.join(', ') : "##{id}"
    "[#{label.tr('[]', '()')}](#{track_path(id)})"
  end

  def track_path(id) = Rails.application.routes.url_helpers.track_path(id)

  def markdown
    Redcarpet::Markdown.new(
      Redcarpet::Render::HTML.new(escape_html: true, safe_links_only: true, link_attributes: { rel: 'nofollow' }),
      no_intra_emphasis: true, lax_spacing: true, strikethrough: true
    )
  end

  def render_tag(view, name, attributes, block:)
    case name
    when 'chart', 'replay' then block ? render_block(view, name, attributes) : ''
    when 'metric' then render_metric(view, metric(attributes['key'], of: attributes['of'] || 'self'))
    when 'needed' then render_metric(view, needed(attributes['discipline'], attributes['rank']))
    end.to_s
  end

  def render_chart(view, name, with = nil)
    data = chart(name, with:)
    data ? view.render('tracks/debriefs/chart', chart: data) : ''
  end

  def render_block(view, name, attributes)
    return render_replay(view, attributes) if name == 'replay'
    return render_chart(view, attributes['name'], attributes['with']) unless VISUAL_CHARTS.include?(attributes['name'])

    data = visual_chart(attributes['name'], with: attributes['with'])
    data ? view.render("tracks/debriefs/#{attributes['name']}", chart: data) : ''
  end

  def render_replay(view, attributes)
    with = attributes['with']
    data = replay(attributes['phase'], moments(attributes['moments'], with), with:)
    data ? view.render('tracks/debriefs/replay', replay: data) : ''
  end

  def moments(content, with)
    tones = visual_subjects(with).each_with_index.to_h { |subject, index| [subject.key, index] }
    content.to_s.scan(MOMENT).filter_map do |attributes, text|
      attributes = attributes.scan(ATTRIBUTE).to_h
      next if attributes['at'].blank?

      { 't' => attributes['at'], 'label' => attributes['label'].to_s, 'html' => moment_html(text, tones) }
    end
  end

  def moment_html(text, tones)
    marked = text.strip.gsub(TAG) { plain_metric(*Regexp.last_match.captures) }
    marked = marked.gsub(VALUE) { "\u0000#{Regexp.last_match(1)}\u0001#{Regexp.last_match(2)}\u0000" }
    marked.split("\u0000").map do |part|
      key, value = part.split("\u0001", 2)
      next ERB::Util.h(key) unless value

      %(<b class="debrief-replay__value debrief-tone--#{tones.fetch(key, 0)}">#{ERB::Util.h(value)}</b>)
    end.join
  end

  def plain_metric(name, attributes)
    return '' unless name == 'metric'

    attributes = attributes.scan(ATTRIBUTE).to_h
    value = metric(attributes['key'], of: attributes['of'] || 'self')
    return '—' unless value

    separator = UNIT_SYMBOLS.key?(value.unit) ? '' : ' '
    [format_value(value), unit_label(I18n, value.unit)].compact.join(separator)
  end

  def render_metric(view, metric)
    return view.tag.span('—', class: 'debrief-metric debrief-metric--missing') unless metric

    separator = UNIT_SYMBOLS.key?(metric.unit) ? '' : ' '
    view.tag.span(view.safe_join([format_value(metric), unit_label(view, metric.unit)].compact, separator),
                  class: 'debrief-metric')
  end

  def format_value(metric)
    case metric.unit
    when :percent then (metric.value * 100).round.to_s
    when :none, :points_per_unit then metric.value.round(2).to_s
    when :points, :seconds then metric.value.round(1).to_s
    when :rank, :kmh, :degrees, :energy then metric.value.round.to_s
    when :meters then metric.value.abs >= 100 ? metric.value.round.to_s : metric.value.round(1).to_s
    else metric.value.to_s
    end
  end

  def unit_label(view, unit)
    UNIT_SYMBOLS.fetch(unit) { UNIT_KEYS[unit] && view.t(UNIT_KEYS[unit]) }
  end

  def subject(of)
    return inputs['jump'].merge('rank' => inputs.dig('pilot', 'rank')) if of == 'self'
    return evidence_track(of.delete_prefix('track:')) if of.to_s.start_with?('track:')

    index = of.to_s.delete_prefix('ref').to_i
    inputs['references'][index - 1] if index.positive?
  end

  def score_metric(entry, parts)
    return unless entry

    case parts
    in ['total'] then metric_or_nil(entry['total'] || total_of(entry), :points)
    in ['rank'] then metric_or_nil(entry['rank'], :rank)
    in ['result', discipline] then metric_or_nil(entry.dig('results', discipline, 'result'),
                                                 discipline_unit(discipline))
    in ['points', discipline] then metric_or_nil(entry.dig('results', discipline, 'points'), :points)
    else nil
    end
  end

  def total_of(entry) = entry['results']&.values&.sum { |result| result['points'].to_f }&.round(1)

  def phase_metric(entry, parts)
    value = parts.reduce(entry&.dig('metrics')) { |node, key| node.is_a?(Array) ? node[key.to_i] : node&.dig(key) }
    return unless value.is_a?(Numeric)

    unit = parts.last == 'result' ? discipline_unit(entry.dig('metrics', parts.first, 'kind')) : phase_unit(parts.last)
    metric_or_nil(value, unit)
  end

  def phase_unit(key) = PHASE_UNITS.find { |pattern, _| pattern.match?(key.to_s) }&.last

  def discipline_metric(discipline, field, unit: nil)
    entry = inputs.dig('discipline', 'parts')&.find { |item| item['key'] == discipline }
    metric_or_nil(entry&.dig(field), unit || discipline_unit(discipline))
  end

  def discipline_unit(discipline)
    case discipline.to_s
    when 'time', 'base_race' then :seconds
    when 'speed' then :kmh
    else :meters
    end
  end

  def metric_or_nil(value, unit) = value.nil? ? nil : Metric.new(value, unit)

  def evidence_track(id)
    entry = report.evidence.to_h.dig('tracks', id.to_s.strip)
    entry&.merge('name' => entry['pilot'], 'track_id' => id.to_s.strip.to_i)
  end

  def evidence_tracks(with)
    with.to_s.split(',').filter_map { |item| evidence_track(item.strip.delete_prefix('track:')) }
  end

  def chart_rows(name, metrics)
    phase, row = CHART_SERIES.fetch(name)
    metrics&.dig(phase, 'series')&.filter_map(&row)
  end
end
