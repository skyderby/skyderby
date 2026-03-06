require 'application_system_test_case'

class ReferencePointsImportTest < ApplicationSystemTestCase
  setup do
    @event = events(:nationals)
    @organizer = @event.responsible
    sign_in @organizer
  end

  test 'happy path - successful import of new reference points' do
    visit performance_competition_reference_points_path(@event)

    click_on I18n.t('general.import_from_csv')
    assert_selector '.dialog-title', text: 'Import Reference Points'

    within('#modal-root') do
      attach_file 'file', file_fixture('reference_points_valid.csv')
      click_on 'Import'

      assert_text 'Import completed'
      assert_text "Created new reference point 'Start Gate' at 45.123, -115.456"
      assert_text "Created new reference point 'Finish Line' at 45.789, -115.012"
    end

    assert_equal 2, @event.reference_points.count

    start_gate = @event.reference_points.find_by(name: 'Start Gate')
    assert_equal 45.123, start_gate.latitude
    assert_equal(-115.456, start_gate.longitude)

    finish_line = @event.reference_points.find_by(name: 'Finish Line')
    assert_equal 45.789, finish_line.latitude
    assert_equal(-115.012, finish_line.longitude)
  end

  test 'update existing reference point name when coordinates match' do
    @event.reference_points.create!(name: 'Old Name', latitude: 45.123, longitude: -115.456)

    visit performance_competition_reference_points_path(@event)
    click_on I18n.t('general.import_from_csv')
    assert_selector '.dialog-title', text: 'Import Reference Points'

    within('#modal-root') do
      attach_file 'file', file_fixture('reference_points_update_name.csv')
      click_on 'Import'

      assert_text 'Import completed'
      assert_text "Updated name to 'New Name' for reference point at 45.123, -115.456"
    end

    assert_equal 1, @event.reference_points.count
    reference_point = @event.reference_points.first
    assert_equal 'New Name', reference_point.name
  end

  test 'update existing reference point coordinates when name matches' do
    @event.reference_points.create!(name: 'Start Gate', latitude: 40.0, longitude: -120.0)

    visit performance_competition_reference_points_path(@event)
    click_on I18n.t('general.import_from_csv')
    assert_selector '.dialog-title', text: 'Import Reference Points'

    within('#modal-root') do
      attach_file 'file', file_fixture('reference_points_update_coords.csv')
      click_on 'Import'

      assert_text 'Import completed'
      assert_text "Updated coordinates for reference point 'Start Gate'"
    end

    assert_equal 1, @event.reference_points.count
    reference_point = @event.reference_points.first
    assert_equal 'Start Gate', reference_point.name
    assert_equal 45.123, reference_point.latitude
    assert_equal(-115.456, reference_point.longitude)
  end

  test 'cannot update reference point that is assigned to competitors' do
    reference_point = @event.reference_points.create!(name: 'Start Gate', latitude: 45.0, longitude: -115.0)
    round = @event.rounds.create!(discipline: :distance)
    competitor = create(:event_competitor, event: @event)
    round.reference_point_assignments.create!(reference_point:, competitor:)

    visit performance_competition_reference_points_path(@event)
    click_on I18n.t('general.import_from_csv')
    assert_selector '.dialog-title', text: 'Import Reference Points'

    within('#modal-root') do
      attach_file 'file', file_fixture('reference_points_update_assigned.csv')
      click_on 'Import'

      assert_text 'Import completed'
      assert_text 'Validation failed: Cannot update reference point if it is assigned to competitors'
    end

    reference_point.reload
    assert_equal 45.0, reference_point.latitude
    assert_equal(-115.0, reference_point.longitude)
  end

  test 'validation error for non-unique coordinate pairs' do
    visit performance_competition_reference_points_path(@event)
    click_on I18n.t('general.import_from_csv')
    assert_selector '.dialog-title', text: 'Import Reference Points'

    within('#modal-root') do
      attach_file 'file', file_fixture('reference_points_duplicate_coords.csv')
      click_on 'Import'

      assert_text 'Import failed'
      assert_text 'Duplicate coordinates found in CSV'
    end

    assert_equal 0, @event.reference_points.count
  end

  test 'validation error for empty name' do
    visit performance_competition_reference_points_path(@event)
    click_on I18n.t('general.import_from_csv')
    assert_selector '.dialog-title', text: 'Import Reference Points'

    within('#modal-root') do
      attach_file 'file', file_fixture('reference_points_empty_name.csv')
      click_on 'Import'

      assert_text 'Import failed'
      assert_text 'Invalid CSV format. All fields (name, latitude, longitude) are required'
    end

    assert_equal 0, @event.reference_points.count
  end

  test 'validation error for invalid coordinates' do
    visit performance_competition_reference_points_path(@event)
    click_on I18n.t('general.import_from_csv')
    assert_selector '.dialog-title', text: 'Import Reference Points'

    within('#modal-root') do
      attach_file 'file', file_fixture('reference_points_invalid_coords.csv')
      click_on 'Import'

      assert_text 'Import failed'
      assert_text 'Invalid coordinates'
    end

    assert_equal 0, @event.reference_points.count
  end
end
