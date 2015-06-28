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

require 'rails_helper'

RSpec.describe Badge, type: :model do
  pending "add some examples to (or delete) #{__FILE__}"
end
