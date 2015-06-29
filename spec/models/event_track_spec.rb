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
#  result          :float(24)
#  user_profile_id :integer
#

require 'rails_helper'

RSpec.describe EventTrack, type: :model do
  pending "add some examples to (or delete) #{__FILE__}"
end
