require 'test_helper'

class Track::DebriefTest < ActiveSupport::TestCase
  include ActiveJob::TestHelper

  FakeBlock = Data.define(:type, :text)
  FakeMessage = Data.define(:stop_reason, :stop_details, :content, :model, :usage)
  FakeUsage = Data.define(:input_tokens, :output_tokens)

  class FakeClient
    attr_reader :params

    def initialize(message = nil, error: nil)
      @message = message
      @error = error
    end

    def beta = self

    def messages = self

    def create(**params)
      @params = params
      raise @error if @error

      @message
    end
  end

  setup do
    @competition = virtual_competitions(:feather_challenge)
    @competition.update_columns(visibility: VirtualCompetition.visibilities[:public_competition])
    @owner = users(:regular_user)
    @track = create_jump(profiles(:regular_user), distance: 250, flare: 23.6)
    @track.update!(owner: @owner, ff_end: 49)
  end

  test 'catalog lists disciplines of active rankings as they define them' do
    keys = catalog.disciplines.map(&:key)

    assert_includes keys, 'distance_in_altitude-200+flare-0'
    assert_equal [@competition], catalog.find('distance_in_altitude-200+flare-0').competitions
  end

  test 'catalog skips finished, private and other-place rankings' do
    @competition.update_columns(period_to: 1.day.ago)
    assert_nil catalog.find('distance_in_altitude-200+flare-0')

    @competition.participants.delete_all
    @competition.update_columns(period_to: nil, visibility: VirtualCompetition.visibilities[:private_competition])
    assert_nil catalog.find('distance_in_altitude-200+flare-0')
  end

  test 'field pools the best jump per pilot across rankings with the same discipline' do
    twin = VirtualCompetition.create!(
      name: 'Twin', group: virtual_competition_groups(:main), jumps_kind: :base, suits_kind: :wingsuit,
      discipline: :distance_in_altitude, discipline_parameter: 200, period_from: '2015-01-01',
      disciplines_attributes: [{ discipline: :distance_in_altitude, parameter: 200, position: 0 },
                               { discipline: :flare, position: 1 }]
    )
    rival = create_jump(profiles(:john), distance: 300, flare: 30, competition: twin)

    inputs = Track::Debrief::Inputs.new(@track, discipline).to_h

    assert_equal [rival.id, @track.id].sort, inputs['pilot_jumps'].pluck('track_id').push(rival.id).uniq.sort
    assert_equal 2, inputs.dig('discipline', 'field_size')
    assert_equal 2, inputs.dig('pilot', 'rank')
    assert_equal 'John', inputs['references'].first['name'].split.first
    assert_in_delta 300, inputs.dig('discipline', 'parts', 0, 'season_best')
  end

  test 'snapshot scores the jump against season bests' do
    inputs = Track::Debrief::Inputs.new(@track, discipline).to_h

    assert_equal 1, inputs.dig('pilot', 'rank')
    assert_in_delta 200, inputs.dig('jump', 'total')
    assert_equal %w[distance_in_altitude flare], inputs.dig('discipline', 'parts').pluck('key')
    assert_empty inputs['references']
  end

  test 'request creates a pending English debrief once and queues its generation' do
    debrief = nil
    assert_enqueued_with(job: DebriefJob) { debrief = I18n.with_locale(:ru) { Track::Debrief.request(@track, discipline) } }

    assert_predicate debrief, :pending?
    assert_equal 'en', debrief.locale
    assert_no_enqueued_jobs { Track::Debrief.request(@track, discipline) }
  end

  test 'request starts over after a failed or stale debrief' do
    debrief = Track::Debrief.request(@track, discipline)
    debrief.update!(created_at: 1.hour.ago)

    assert_predicate debrief, :stale?
    assert_not_equal debrief, Track::Debrief.request(@track, discipline)
  end

  test 'generate writes in English whatever the interface language' do
    debrief = I18n.with_locale(:de) { Track::Debrief.request(@track, discipline) }
    client = FakeClient.new(fake_message(:end_turn, [FakeBlock.new(:text, '## Flare')]))

    debrief.generate!(client:)

    assert_predicate debrief.reload, :ready?
    assert_equal '## Flare', debrief.content
    assert_includes client.params[:messages].first[:content], 'Write the debrief in English.'
    assert_not_includes client.params[:messages].first[:content], '"series"'
  end

  test 'generate records cost and duration, also when it fails' do
    debrief = Track::Debrief.request(@track, discipline)

    debrief.generate!(client: FakeClient.new(fake_message(:end_turn, [FakeBlock.new(:text, 'ok')], 1000, 500)))
    ready_cost = debrief.reload.cost_usd
    debrief.update!(status: :pending)
    debrief.generate!(client: FakeClient.new(fake_message(:max_tokens, [], 2000, 16_000)))

    assert_in_delta 0.014, ready_cost
    assert_predicate debrief.reload, :failed?
    assert_in_delta 0.328, debrief.cost_usd
    assert_operator debrief.generation_seconds, :>=, 0
  end

  test 'generate marks refusals, truncation and API errors as failed' do
    debrief = Track::Debrief.request(@track, discipline)

    connection_error = Anthropic::Errors::APIConnectionError.new(url: URI('https://api.anthropic.com'))
    clients = [FakeClient.new(fake_message(:refusal, [])),
               FakeClient.new(fake_message(:max_tokens, [FakeBlock.new(:text, 'cut')])),
               FakeClient.new(error: connection_error)]

    clients.each do |client|
      debrief.update!(status: :pending)
      debrief.generate!(client:)
      assert_predicate debrief.reload, :failed?
    end
  end

  test 'job marks the debrief failed on unexpected errors' do
    debrief = Track::Debrief.request(@track, discipline)
    debrief.stub(:generate!, -> { raise ArgumentError, 'boom' }) do
      Track::Debrief.stub(:find_by, debrief) do
        assert_raises(ArgumentError) { DebriefJob.perform_now(debrief.id) }
      end
    end

    assert_predicate debrief.reload, :failed?
  end

  test 'moment reports where each jump is at a second of a phase' do
    toolbox = Track::Debrief::Toolbox.new(Track::Debrief.request(@track, discipline))

    moment = toolbox.call('moment', { 'track_ids' => [@track.id], 'phase' => 'window', 'at' => 4 })['jumps'].first
    outside = toolbox.call('moment', { 'track_ids' => [@track.id], 'phase' => 'window', 'at' => 400 })['jumps'].first

    assert_operator moment['height'], :>, 0
    assert_in_delta Math.hypot(moment['h_speed'], moment['v_speed']), moment['total_speed'], 1
    assert_includes moment['change'].keys, 'v_speed'
    assert_match(/Outside the replay/, outside['error'])
  end

  test 'assembles the prompt from the parts of the chosen discipline' do
    combo = Track::Debrief::Prompt.new(Track::Debrief.request(@track, discipline)).system
    @track.update!(kind: :skydive)
    part = Track::Debrief::Discipline::Part.new(discipline: 'speed', parameter: 0, finish_line_id: nil,
                                                results_sort_order: 'descending')
    speed = Track::Debrief.new(track: @track, inputs: { 'discipline' => Track::Debrief::Discipline.new([part]).to_h })
    performance = Track::Debrief::Prompt.new(speed).system

    assert_includes combo, '"distance in 200 m", "flare"'
    assert_includes combo, 'for SECOND 4, 6, 8, 10'
    assert_includes combo, 'initiate the flare'
    assert_includes combo, 'terrain clearance'
    assert_includes performance, '"speed in the performance window"'
    assert_includes performance, 'window.from_altitude'
    assert_includes performance, 'for SECOND 10, 20, 30, 40, 50, 60'
    assert_includes performance, 'deployment, breakoff'
    assert_not_includes performance, 'flare.gain'
    assert_not_includes performance, 'speed_loss'
  end

  test 'what_if projects points and place for changed results' do
    create_jump(profiles(:john), distance: 300, flare: 30)
    debrief = Track::Debrief.request(@track, discipline)
    toolbox = Track::Debrief::Toolbox.new(debrief)

    current = toolbox.call('what_if', {})
    better = toolbox.call('what_if', { 'results' => { 'distance_in_altitude' => 310, 'flare' => 31 } })
    estimate = toolbox.call('what_if', { 'flare_total_speed' => 200, 'flare_efficiency' => 100 })

    assert_equal [2, 1], [current['rank'], better['rank']]
    assert_in_delta 103.3, better.dig('results', 'distance_in_altitude', 'points')
    assert_in_delta 42.5, estimate['flare_gain_estimate']
    assert_in_delta 42.5, estimate.dig('results', 'flare', 'result')
  end

  private

  def catalog = Track::Debrief::Catalog.new(@track, viewer: @owner)

  def discipline = catalog.find('distance_in_altitude-200+flare-0')

  def fake_message(stop_reason, content, input = 1, output = 1)
    FakeMessage.new(stop_reason, Data.define(:category).new(:cyber), content, :'claude-opus-5-5',
                    FakeUsage.new(input, output))
  end

  def create_jump(profile, distance:, flare:, competition: @competition)
    track = create_track_from_file('WBR/Yegor_16_Round3.CSV', kind: :base, recorded_at: Time.zone.parse('2025-06-01'),
                                                              pilot: profile)
    distance_part, flare_part = competition.disciplines.to_a
    distance_part.results.create!(track:, result: distance)
    flare_part.results.create!(track:, result: flare)
    track
  end
end
