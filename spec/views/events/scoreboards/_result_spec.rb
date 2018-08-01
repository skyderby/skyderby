describe 'events/scoreboards/_result' do
  it 'without penalties' do
    result = scoreboard.results.for(competitor: competitor, round: round)

    render(
      partial: 'events/scoreboards/result',
      locals: { result: result, event: event }
    )

    expect(rendered.strip).to eq(<<~HTML.strip)
      <td class='event__scoreboard-result'>
      3000
      <span>
      #{show_link(result)}
      </span>
      </td>
    HTML
  end

  it 'with -20% penalty' do
    round = event_rounds(:speed_round_1)
    result = scoreboard.results.for(competitor: competitor, round: round)

    render(
      partial: 'events/scoreboards/result',
      locals: { result: result, event: event }
    )

    expect(rendered.strip).to eq(<<~HTML.strip)
      <td class='event__scoreboard-result'>
      200.0
      <sup class='text-danger'>-20%</sup>
      <span>
      #{show_link(result)}
      </span>
      </td>
    HTML
  end

  it 'with 100% penalty' do
    round = event_rounds(:speed_round_1)
    result = scoreboard.results.for(competitor: competitor, round: round)
    result.penalty_size = 100
    result.penalized = true

    render(
      partial: 'events/scoreboards/result',
      locals: { result: result, event: event }
    )

    expect(rendered.strip).to eq(<<~HTML.strip)
      <td class='event__scoreboard-result'>
      0.0
      <sup class='text-danger'>-100%</sup>
      <span>
      #{show_link(result)}
      </span>
      </td>
    HTML
  end

  def event
    @event ||= events(:published_public)
  end

  def scoreboard
    params = Events::Scoreboards::Params.new(event, {})
    scoreboard = Events::Scoreboards.for(event, params)
  end

  def competitor
    @competitor ||= event_competitors(:competitor_1)
  end

  def round
    @round ||= event_rounds(:distance_round_1)
  end

  def show_link(result)
    %[<a class="show-result" rel="nofollow" data-remote="true" href="/events/1/event_tracks/#{result.id}"><i class="fa fa-search"></i></a>]
  end
end
