require 'application_system_test_case'

class ResultsCopyTest < ApplicationSystemTestCase
  setup do
    @user = users(:regular_user)
    @suit = suits(:apache)

    starts_at = Time.zone.now
    responsible = @user
    @source_event = PerformanceCompetition.create!(name: 'Source Competition', responsible:, starts_at:)
    @target_event = PerformanceCompetition.create!(name: 'Target Competition', responsible:, starts_at:)

    @open_category = PerformanceCompetition::Category.create!(event: @source_event, name: 'Open', order: 1)
    @female_category = PerformanceCompetition::Category.create!(event: @source_event, name: 'Female', order: 2)

    @competitor1 = PerformanceCompetition::Competitor.create!(
      event: @source_event,
      section_id: @open_category.id,
      suit: @suit,
      assigned_number: 1,
      profile_attributes: { name: 'John Doe' }
    )

    @competitor2 = PerformanceCompetition::Competitor.create!(
      event: @source_event,
      section_id: @female_category.id,
      suit: @suit,
      assigned_number: 2,
      profile_attributes: { name: 'Jane Smith' }
    )

    @target_open_category = PerformanceCompetition::Category.create!(event: @target_event, name: 'Open', order: 1)
    @target_female_category = PerformanceCompetition::Category.create!(event: @target_event, name: 'Female', order: 2)

    @target_competitor1 = PerformanceCompetition::Competitor.create!(
      event: @target_event,
      section_id: @target_open_category.id,
      suit: @suit,
      profile_id: @competitor1.profile_id,
      assigned_number: 1
    )

    @target_competitor2 = PerformanceCompetition::Competitor.create!(
      event: @target_event,
      section_id: @target_female_category.id,
      suit: @suit,
      profile_id: @competitor2.profile_id,
      assigned_number: 2
    )

    @round1 = PerformanceCompetition::Round.create!(event: @source_event, discipline: :distance, number: 1)
    @round2 = PerformanceCompetition::Round.create!(event: @source_event, discipline: :speed, number: 1)

    @track1 = tracks(:hellesylt)
    @track2 = tracks(:track_with_video)

    PerformanceCompetition::Result.create!(
      round: @round1,
      competitor: @competitor1,
      track: @track1,
      uploaded_by: @competitor1.profile,
      result: 1500.0,
      exit_altitude: 3000.0,
      penalty_size: 10,
      penalized: true,
      penalty_reason: 'Late exit'
    )

    PerformanceCompetition::Result.create!(
      round: @round2,
      competitor: @competitor2,
      track: @track2,
      uploaded_by: @competitor2.profile,
      result: 250.5,
      exit_altitude: 2800.0,
      penalty_size: 0,
      penalized: false
    )

    @round1.update!(completed_at: 1.hour.ago)
    @round2.update!(completed_at: 30.minutes.ago)

    @reference_point1 = @source_event.reference_points.create!(
      name: 'Start Point',
      latitude: 60.12345,
      longitude: 8.67890
    )

    @reference_point2 = @source_event.reference_points.create!(
      name: 'Exit Point',
      latitude: 60.54321,
      longitude: 8.09876
    )

    PerformanceCompetition::ReferencePointAssignment.create!(
      round: @round1,
      competitor: @competitor1,
      reference_point: @reference_point1
    )

    PerformanceCompetition::ReferencePointAssignment.create!(
      round: @round2,
      competitor: @competitor2,
      reference_point: @reference_point2
    )
  end

  test 'copy results from another competition' do
    sign_in @user
    visit performance_competition_path(@target_event)

    click_button title: 'More actions'
    click_button 'Copy results'

    assert_selector('.modal-title', text: I18n.t('performance_competitions.results_copies.form_modal.title'))

    hot_select @source_event.name, from: :source_event_id
    click_button I18n.t('general.save')

    assert_no_selector('.modal-title')

    assert_equal 2, @target_event.rounds.count
    assert_equal 2, @target_event.results.count

    distance_round = @target_event.rounds.find_by(discipline: :distance, number: 1)
    speed_round = @target_event.rounds.find_by(discipline: :speed, number: 1)

    assert distance_round
    assert speed_round

    result1 = distance_round.results.joins(:competitor).find_by(event_competitors: { profile_id: @competitor1.profile_id })
    result2 = speed_round.results.joins(:competitor).find_by(event_competitors: { profile_id: @competitor2.profile_id })

    assert result1
    assert result2

    assert_predicate result1.exit_altitude, :present?
    assert_equal 10, result1.penalty_size
    assert result1.penalized
    assert_equal 'Late exit', result1.penalty_reason

    assert_predicate result2.exit_altitude, :present?
    assert_equal 0, result2.penalty_size
    assert_not result2.penalized

    assert distance_round.completed_at
    assert speed_round.completed_at
    assert_in_delta 1.hour.ago, distance_round.completed_at, 1.minute
    assert_in_delta 30.minutes.ago, speed_round.completed_at, 1.minute

    assert_equal 2, @target_event.reference_points.count

    target_start_point = @target_event.reference_points.find_by(
      latitude: @reference_point1.latitude,
      longitude: @reference_point1.longitude
    )
    target_exit_point = @target_event.reference_points.find_by(
      latitude: @reference_point2.latitude,
      longitude: @reference_point2.longitude
    )

    assert target_start_point
    assert target_exit_point
    assert_equal 'Start Point', target_start_point.name
    assert_equal 'Exit Point', target_exit_point.name

    assert_equal 2, @target_event.reference_point_assignments.count

    target_assignment1 = distance_round.reference_point_assignments.joins(:competitor)
                                       .find_by(event_competitors: { profile_id: @competitor1.profile_id })
    target_assignment2 = speed_round.reference_point_assignments.joins(:competitor)
                                    .find_by(event_competitors: { profile_id: @competitor2.profile_id })

    assert target_assignment1
    assert target_assignment2
    assert_equal target_start_point, target_assignment1.reference_point
    assert_equal target_exit_point, target_assignment2.reference_point
  end
end
