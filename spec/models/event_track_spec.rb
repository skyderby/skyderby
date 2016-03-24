# == Schema Information
#
# Table name: event_tracks
#
#  id              :integer          not null, primary key
#  round_id        :integer
#  track_id        :integer
#  created_at      :datetime
#  updated_at      :datetime
#  competitor_id   :integer
#  result          :decimal(10, 2)
#  user_profile_id :integer
#  result_net      :decimal(10, 2)
#

require 'rails_helper'

RSpec.describe EventTrack, type: :model do
  pending "add some examples to (or delete) #{__FILE__}"
end
