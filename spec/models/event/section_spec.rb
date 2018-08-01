# == Schema Information
#
# Table name: sections
#
#  id       :integer          not null, primary key
#  name     :string(510)
#  order    :integer
#  event_id :integer
#

require 'support/event_ongoing_validation'

describe Event::Section do
  describe '#first_position?' do
    it 'true for top section' do
      section = event_sections(:speed_distance_time_advanced)

      expect(section.first_position?).to be_truthy
    end

    it 'false for others' do
      section = event_sections(:speed_distance_time_intermediate)

      expect(section.first_position?).to be_falsey
    end
  end

  describe '#last_position?' do
    it 'true for last section' do
      section = event_sections(:speed_distance_time_intermediate)

      expect(section.last_position?).to be_truthy
    end

    it 'false for others' do
      section = event_sections(:speed_distance_time_advanced)

      expect(section.last_position?).to be_falsey
    end
  end

  describe '#move_upper' do
    it 'moves section upper' do
      first_section  = event_sections(:speed_distance_time_advanced)
      second_section = event_sections(:speed_distance_time_intermediate)

      first_section_order = first_section.order

      second_section.move_upper
      expect(second_section.order).to eq(first_section_order)
    end

    it 'not change top section' do
      section  = event_sections(:speed_distance_time_advanced)

      section_order_before_call = section.order

      section.move_upper
      expect(section.order).to eq(section_order_before_call)
    end
  end

  describe '#move_lower' do
    it 'moves section lower' do
      first_section  = event_sections(:speed_distance_time_advanced)
      second_section = event_sections(:speed_distance_time_intermediate)

      second_section_order = second_section.order

      first_section.move_lower
      expect(first_section.order).to eq(second_section_order)
    end

    it 'not change last section' do
      section = event_sections(:speed_distance_time_intermediate)

      section_order_before_call = section.order

      section.move_lower
      expect(section.order).to eq(section_order_before_call)
    end
  end

  it_should_behave_like 'event_ongoing_validation' do
    let(:target) { event_sections(:speed_distance_time_advanced)  }
  end
end
