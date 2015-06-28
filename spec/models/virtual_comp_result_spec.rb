# == Schema Information
#
# Table name: virtual_comp_results
#
#  id                     :integer          not null, primary key
#  virtual_competition_id :integer
#  track_id               :integer
#  result                 :float(24)        default(0.0)
#  created_at             :datetime
#  updated_at             :datetime
#  user_profile_id        :integer
#  highest_speed          :float(24)        default(0.0)
#  highest_gr             :float(24)        default(0.0)
#

require 'rails_helper'

RSpec.describe VirtualCompResult, type: :model do
  pending "add some examples to (or delete) #{__FILE__}"
end
