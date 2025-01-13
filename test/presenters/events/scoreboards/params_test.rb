require 'test_helper'

class Events::Scoreboards::ParamsTest < ActiveSupport::TestCase
  test 'omit penalties? without specified params' do
    event = events(:nationals)
    params = Events::Scoreboards::Params.new(event, {})

    assert_not params.omit_penalties?
  end

  test 'omit penalties? when specified "true"' do
    event = events(:nationals)
    params = Events::Scoreboards::Params.new(event, omit_penalties: 'true')

    assert params.omit_penalties?
  end

  test 'adjust to wind? wind cancellation disabled when parameter not specified' do
    event = events(:nationals)
    event.update!(wind_cancellation: false)

    params = Events::Scoreboards::Params.new(event, {})

    assert_not params.adjust_to_wind?
  end

  test 'adjust to wind? wind cancellation disabled when parameter set to "true"' do
    event = events(:nationals)
    event.update!(wind_cancellation: false)

    params = Events::Scoreboards::Params.new(event, display_raw_results: 'true')

    assert_not params.adjust_to_wind?
  end

  test 'adjust to wind? wind cancellation enabled when parameter not specified' do
    event = events(:nationals)
    event.update!(wind_cancellation: true)

    params = Events::Scoreboards::Params.new(event, {})

    assert params.adjust_to_wind?
  end

  test 'adjust to wind? wind cancellation enabled when parameter specified' do
    event = events(:nationals)
    event.update!(wind_cancellation: true)

    params = Events::Scoreboards::Params.new(event, display_raw_results: 'true')

    assert_not params.adjust_to_wind?
  end
end
