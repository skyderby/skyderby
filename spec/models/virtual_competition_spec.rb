# == Schema Information
#
# Table name: virtual_competitions
#
#  id                    :integer          not null, primary key
#  jumps_kind            :integer
#  suits_kind            :integer
#  place_id              :integer
#  period_from           :date
#  period_to             :date
#  discipline            :integer
#  discipline_parameter  :integer          default(0)
#  created_at            :datetime
#  updated_at            :datetime
#  name                  :string(255)
#  virtual_comp_group_id :integer
#  range_from            :integer          default(0)
#  range_to              :integer          default(0)
#  display_highest_speed :boolean          default(FALSE)
#  display_highest_gr    :boolean          default(FALSE)
#

require 'rails_helper'

RSpec.describe VirtualCompetition, type: :model do
  pending "add some examples to (or delete) #{__FILE__}"
end
