require 'test_helper'

class PerformanceCompetition::SectionTest < ActiveSupport::TestCase
  setup do
    @event = performance_competitions(:nationals)
  end

  test 'can not be created for finished event' do
    @event.finished!

    assert_raises(ActiveRecord::RecordInvalid) do
      @event.sections.create!(name: 'Open')
    end
  end

  test 'can not be updated for finished event' do
    category = @event.sections.create!(name: 'Open')
    @event.finished!

    assert_raises(ActiveRecord::RecordInvalid) do
      category.update!(name: 'Rookie')
    end
  end

  test 'can not be destroyed for finished event' do
    category = @event.sections.create!(name: 'Open')
    @event.finished!

    assert_raises(ActiveRecord::RecordNotDestroyed) do
      category.destroy!
    end
  end

  test '#first_position? - true for top section' do
    section = event_sections(:advanced)
    assert_predicate section, :first_position?
  end

  test '#first_position? - false for others' do
    section = event_sections(:intermediate)
    assert_not section.first_position?
  end

  test '#last_position? - true for last section' do
    section = event_sections(:intermediate)
    assert_predicate section, :last_position?
  end

  test '#last_position? - false for others' do
    section = event_sections(:advanced)
    assert_not section.last_position?
  end

  test '#move_upper - moves section upper' do
    first_section  = event_sections(:advanced)
    second_section = event_sections(:intermediate)

    first_section_order = first_section.order

    second_section.move_upper
    assert_equal first_section_order, second_section.order
  end

  test '#move_upper - not change top section' do
    section = event_sections(:advanced)

    section_order_before_call = section.order

    section.move_upper
    assert_equal section_order_before_call, section.order
  end

  test '#move_lower - moves section lower' do
    first_section  = event_sections(:advanced)
    second_section = event_sections(:intermediate)

    second_section_order = second_section.order

    first_section.move_lower
    assert_equal second_section_order, first_section.order
  end

  test '#move_lower - not change last section' do
    section = event_sections(:intermediate)

    section_order_before_call = section.order

    section.move_lower
    assert_equal section_order_before_call, section.order
  end
end
