require 'test_helper'

class BoogiesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @event = Boogie.find(events(:boogie).id)
  end

  test 'shows the scoreboard' do
    get boogie_path(@event)

    assert_response :success
    assert_select '#scoreboard.scoreboard-container'
  end

  test 'hides the scoreboard of a surprise event from visitors' do
    @event.update!(status: :surprise)

    get boogie_path(@event)

    assert_response :success
    assert_select '#scoreboard', text: /Surprise/
    assert_select '.scoreboard-container', false
  end

  test 'shows the scoreboard of a surprise event to the responsible' do
    @event.update!(status: :surprise)
    sign_in @event.responsible

    get boogie_path(@event)

    assert_response :success
    assert_select '#scoreboard.scoreboard-container'
  end
end
