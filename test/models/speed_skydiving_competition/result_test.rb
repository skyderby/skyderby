require 'test_helper'

class SpeedSkydivingCompetition::ResultTest < ActiveSupport::TestCase
  setup do
    @record = speed_skydiving_competition_results(:hinton_round_1)
    @record.result = 500
  end

  test '#penalty_size with no penalties' do
    assert_equal 0, @record.penalty_size
  end

  test '#penalty_size with single penalty' do
    @record.penalties.create!(percent: 20, reason: 'some reason')

    assert_equal 20, @record.penalty_size
  end

  test '#penalty_size with multiple penalties' do
    @record.penalties.create!(percent: 20, reason: 'some reason')
    @record.penalties.create!(percent: 50, reason: 'much stronger reason')

    assert_equal 60, @record.penalty_size
  end

  test '#final_result with no penalties' do
    assert_equal 500, @record.final_result
  end

  test '#final_result with single penalty' do
    @record.penalties.create!(percent: 20, reason: 'some reason')

    assert_equal 400, @record.final_result
  end

  test '#final_result with multiple penalties' do
    @record.penalties.create!(percent: 20, reason: 'some reason')
    @record.penalties.create!(percent: 50, reason: 'much stronger reason')

    assert_equal 200, @record.final_result
  end

  test 'round in progress validation update is not allowed' do
    @record.round.update!(completed_at: Time.zone.today)

    update_successful = @record.update(result: 250)

    assert_not update_successful
    assert @record.errors.of_kind?(:base, :round_completed)
  end

  test 'round in progress validation destroy is not allowed' do
    @record.round.update!(completed_at: Time.zone.today)

    @record.destroy

    assert_not @record.destroyed?
  end
end
