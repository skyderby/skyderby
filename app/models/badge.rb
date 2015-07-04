# == Schema Information
#
# Table name: badges
#
#  id              :integer          not null, primary key
#  name            :string(255)
#  kind            :integer
#  user_profile_id :integer
#  created_at      :datetime
#  updated_at      :datetime
#

class Badge < ActiveRecord::Base
  enum kind: [:gold, :silver, :bronze]

  belongs_to :user_profile
end
