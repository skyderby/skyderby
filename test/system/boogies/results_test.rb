require 'application_system_test_case'

module Boogies
  class ResultsTest < ApplicationSystemTestCase
    setup do
      @event = Boogie.find(events(:boogie).id)
      @result = Boogie::Result.find(event_results(:boogie_john_1).id)
      @result.round.update!(completed_at: nil)

      sign_in users(:event_responsible)
    end

    test 'organizer deletes a result' do
      visit boogie_path(@event)

      find('.scoreboard-competitor', text: @result.competitor.name)
        .first('.result-show-cell').click

      accept_confirm { click_button I18n.t('event_tracks.show.delete') }

      assert_no_selector 'dialog.dialog'
      assert_nil Boogie::Result.find_by(id: @result.id)
    end
  end
end
