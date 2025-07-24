require 'application_system_test_case'

class CompetitorsCopyTest < ApplicationSystemTestCase
  setup do
    @user = users(:regular_user)
    @suit = suits(:apache)

    starts_at = Time.zone.now
    responsible = @user
    @source_event = PerformanceCompetition.create!(name: 'Source Competition', responsible:, starts_at:)
    @target_event = PerformanceCompetition.create!(name: 'Target Competition', responsible:, starts_at:)

    @open_category = PerformanceCompetition::Category.create!(event: @source_event, name: 'Open', order: 1)
    @female_category = PerformanceCompetition::Category.create!(event: @source_event, name: 'Female', order: 2)
    [['John Doe', 1], ['Jane Smith', 2]].each do |name, assigned_number|
      PerformanceCompetition::Competitor.create!(
        event: @source_event, section_id: @open_category.id, suit: @suit,
        assigned_number:, profile_attributes: { name: }
      )
    end

    [['Alice Johnson', 3], ['Boba Wilson', 4]].each do |name, assigned_number|
      PerformanceCompetition::Competitor.create!(
        event: @source_event, section_id: @female_category.id, suit: @suit,
        assigned_number:, profile_attributes: { name: }
      )
    end
  end

  test 'copy competitors from another competition' do
    sign_in @user
    visit performance_competition_path(@target_event)

    click_button title: 'More actions'
    click_button 'Copy competitors'

    assert_selector('.modal-title', text: I18n.t('performance_competitions.competitors_copies.form_modal.title'))

    hot_select @source_event.name, from: :source_event_id
    click_button I18n.t('general.save')

    assert_no_selector('.modal-title')

    assert_text 'OPEN'
    assert_text 'FEMALE'

    assert_text 'John Doe'
    assert_text 'Jane Smith'
    assert_text 'Alice Johnson'
    assert_text 'Boba Wilson'

    assert_equal 2, @target_event.categories.count
    assert_equal 4, @target_event.competitors.count

    category_names = @target_event.categories.pluck(:name)
    assert_includes category_names, 'Open'
    assert_includes category_names, 'Female'

    open_competitors = @target_event.competitors.joins(:category).where(event_sections: { name: 'Open' })
    female_competitors = @target_event.competitors.joins(:category).where(event_sections: { name: 'Female' })

    assert_equal 2, open_competitors.count
    assert_equal 2, female_competitors.count

    target_competitor = @target_event.competitors.joins(:profile).find_by(profiles: { name: 'John Doe' })
    assert_equal '1', target_competitor.assigned_number
  end
end
