require 'test_helper'

module Boogies
  class DisplaysControllerTest < ActionDispatch::IntegrationTest
    setup do
      @event = Boogie.find(events(:boogie).id)
    end

    test 'display page is accessible without authentication' do
      get boogie_display_path(@event)

      assert_response :success
      assert_select '.display-stage'
      assert_select '.display-slide'
    end

    test 'display page of a draft event is not accessible without authentication' do
      @event.update!(status: :draft)

      get boogie_display_path(@event)

      assert_response :forbidden
    end

    test 'display page allows being embedded in an iframe' do
      get boogie_display_path(@event)

      assert_equal 'ALLOWALL', response.headers['X-FRAME-OPTIONS']
    end

    test 'leaderboard highlights the results counting towards the total' do
      get boogie_display_path(@event)

      assert_select '.display-lb-row', 3
      assert_select '.display-lb-row:first-child .display-lb-tile.is-best', 2
    end

    test 'leaderboard ranks only the competitors it shows' do
      get boogie_display_path(@event)

      ranks = css_select('.display-lb-row .display-rank-number').map { |node| node.text.to_i }

      assert_equal [1, 2, 3], ranks
      assert_select '.display-rankcard-value .total', text: "/ #{ranks.size}", count: ranks.size
    end

    test 'actions bar links to the display page' do
      sign_in @event.responsible

      get boogie_path(@event)

      assert_response :success
      assert_select 'a[href=?][target=_blank]', boogie_display_path(@event)
    end
  end
end
