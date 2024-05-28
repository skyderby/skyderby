require 'test_helper'

class PerformanceCompetitionSeries::Scoreboard::SettingsTest < ActiveSupport::TestCase
  test '#display_raw_results - default value is false' do
    settings = PerformanceCompetitionSeries::Scoreboard::Settings.new
    assert_not settings.display_raw_results
  end

  test "converts string input to boolean" do
    params = ActionController::Parameters.new.permit(:display_raw_results)

    params[:display_raw_results] = 'true'
    settings = PerformanceCompetitionSeries::Scoreboard::Settings.new(params)
    assert settings.display_raw_results

    params[:display_raw_results] = 'false'
    settings = PerformanceCompetitionSeries::Scoreboard::Settings.new(params)
    assert_not settings.display_raw_results

    params[:display_raw_results] = '1'
    settings = PerformanceCompetitionSeries::Scoreboard::Settings.new(params)
    assert settings.display_raw_results

    params[:display_raw_results] = '0'
    settings = PerformanceCompetitionSeries::Scoreboard::Settings.new(params)
    assert_not settings.display_raw_results
  end
end
