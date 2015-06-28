# == Schema Information
#
# Table name: competitors
#
#  id              :integer          not null, primary key
#  event_id        :integer
#  user_id         :integer
#  created_at      :datetime
#  updated_at      :datetime
#  wingsuit_id     :integer
#  name            :string(255)
#  section_id      :integer
#  user_profile_id :integer
#

require 'rails_helper'

RSpec.describe Competitor, type: :model do
  pending 'add test to check that wingsuit and profile filled and that no second Competitor with same profile'
end
