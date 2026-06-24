require 'test_helper'

module Tournaments
  module Qualifications
    class DisplaysControllerTest < ActionDispatch::IntegrationTest
      setup do
        @tournament = tournaments(:qualification_loen)
      end

      test 'display page is accessible without authentication' do
        get tournament_qualification_display_path(@tournament)

        assert_response :success
        assert_select '.display-stage'
        assert_select '.display-slide'
      end

      test 'display page allows being embedded in an iframe' do
        get tournament_qualification_display_path(@tournament)

        assert_equal 'ALLOWALL', response.headers['X-FRAME-OPTIONS']
      end

      test 'qualification actions bar links to the display page for editors' do
        sign_in @tournament.responsible

        get tournament_qualification_path(@tournament)

        assert_response :success
        assert_select 'a[href=?][target=_blank]',
                      tournament_qualification_display_path(@tournament)
      end
    end
  end
end
